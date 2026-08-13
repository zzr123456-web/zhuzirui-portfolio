/**
 * 和风天气（QWeather）本地代理服务器（ESM 版，零依赖）
 *
 * 【为什么需要】
 *   1. 浏览器直连和风 API 会被 CORS 拦截（即使配置了控制台域名白名单，localhost 也不生效）
 *   2. API Key 不能暴露给前端，只能存于服务端
 *   3. GeoAPI（城市查询）与 WeatherAPI（天气数据）域名不同，需根据路径做路由分发
 *   4. 和风默认返回 gzip / br 压缩 JSON，代理需解压后再转发
 *
 * 【端口】 默认 8787（或 PORT 环境变量）
 * 【路由表】
 *   /api/qw/v2/city/lookup*    → geoapi.qweather.com/v2/city/lookup*          （Geo Lookup 查城市 ID）
 *   /api/qw/v7/weather/*       → ke78krj838.re.qweatherapi.com/v7/weather/*   （实时/每日天气）
 *   /api/qw/v7/indices/*       → ke78krj838.re.qweatherapi.com/v7/indices/*   （生活指数/紫外线）
 *   /api/qw/v7/air/*           → ke78krj838.re.qweatherapi.com/v7/air/*       （空气质量，兜底）
 *   其他 /*                    → serve dist/ 静态文件，或转发到 Vite 开发服务器
 *
 * 【零依赖】仅使用 Node.js 内置模块，不引入任何 npm 包
 */
import http from 'node:http'
import https from 'node:https'
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============ 配置 ============
const PORT = parseInt(process.env.PORT || '8787', 10)
// 和风天气 API 凭证（仅存服务端，不暴露给前端）
const QW_API_KEY = process.env.QW_API_KEY || 'b3283a3af2c4454e94077d7805b2d1d5'
// 和风天气专属 Host（用户提供的个人专用域名）
const QW_WEATHER_HOST = process.env.QW_WEATHER_HOST || 'ke78krj838.re.qweatherapi.com'
// 和风天气 Geo API Host（城市查询公用域名）
const QW_GEO_HOST = 'geoapi.qweather.com'
// Vite 开发服务器地址（用于开发模式下 fallback 代理静态资源）
const VITE_HOST = process.env.VITE_HOST || 'localhost'
const VITE_PORT = parseInt(process.env.VITE_PORT || '5173', 10)
// 根目录：dist/ 用于生产静态服务
const DIST_DIR = path.resolve(__dirname, 'dist')

// ============ 工具函数 ============

/**
 * 解压 gzip / br 压缩后的响应体
 * 和风默认返回压缩 JSON，不解压浏览器直接读会是乱码 Buffer
 */
function decompressBuffer(buffer, contentEncoding) {
  if (!contentEncoding) return buffer
  const enc = contentEncoding.toLowerCase()
  if (enc.includes('br')) return zlib.brotliDecompressSync(buffer)
  if (enc.includes('gzip')) return zlib.gunzipSync(buffer)
  if (enc.includes('deflate')) return zlib.inflateSync(buffer)
  return buffer
}

/**
 * 把代理传入请求体（如果是 POST）转为 Buffer
 */
function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * 读取响应 body 并解压为 Buffer
 */
function readAndDecompress(resp) {
  return new Promise((resolve, reject) => {
    const chunks = []
    resp.on('data', (c) => chunks.push(c))
    resp.on('end', () => {
      try {
        const raw = Buffer.concat(chunks)
        resolve(decompressBuffer(raw, resp.headers['content-encoding']))
      } catch (e) {
        reject(e)
      }
    })
    resp.on('error', reject)
  })
}

/**
 * 业务错误码 → 中文提示文案
 *   和风 HTTP 200 不代表业务成功，要看 JSON body.code === "200"
 */
const QW_ERROR_MESSAGES = {
  '204': '请求成功，但此地区暂无数据',
  '400': '请求参数错误，请检查输入',
  '401': 'API Key 无效，请检查服务端配置',
  '402': 'API 调用配额已耗尽，请稍后再试',
  '403': '无访问权限，请检查 API Key 或域名白名单',
  '404': '未找到该资源（如城市不存在）',
  '429': '请求过于频繁，请稍后重试',
  '500': '和风天气服务异常，请稍后重试',
}

/**
 * 对和风响应 JSON 做标准化改写：
 *   1. 业务 code !== "200" 时，给前端补上中文 message，方便统一提示
 *   2. 原字段保持不变，只追加 _message 字段（可选）
 */
function normalizeQwResponse(obj) {
  if (obj && typeof obj === 'object' && obj.code !== undefined) {
    const codeStr = String(obj.code)
    if (codeStr !== '200') {
      obj._message = QW_ERROR_MESSAGES[codeStr] || `请求失败（和风错误码：${codeStr}）`
    }
  }
  return obj
}

// ============ 路由分发 ============

/**
 * 根据前端请求路径匹配要转发的目标 host
 * 返回 { targetHost, upstreamPath } 或 null（非和风 API 路径）
 */
function matchApiRoute(urlPath) {
  const PREFIX = '/api/qw'
  if (!urlPath.startsWith(PREFIX + '/')) return null
  const rest = urlPath.slice(PREFIX.length)
  // Geo Lookup：城市查询 → geoapi.qweather.com
  if (rest.startsWith('/v2/city/lookup')) {
    return { targetHost: QW_GEO_HOST, upstreamPath: rest }
  }
  // 其他 /v7/* → 个人专属天气 Host
  if (rest.startsWith('/v7/')) {
    return { targetHost: QW_WEATHER_HOST, upstreamPath: rest }
  }
  return null
}

/**
 * 把请求转发到和风 API，注入 X-QW-Api-Key Header
 */
async function proxyToQWeather(req, res, route) {
  const url = new URL('https://' + route.targetHost + route.upstreamPath + (req.url.split('?')[1] ? '?' + req.url.split('?')[1] : ''))
  const bodyBuf = await collectBody(req)

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      // 透传用户浏览器 UA 与 Accept
      ...(req.headers['user-agent'] ? { 'user-agent': req.headers['user-agent'] } : {}),
      'accept': 'application/json',
      // 告诉后端我们接受压缩，省带宽（会自动解压）
      'accept-encoding': 'gzip, br',
      // 注入和风认证 Header（敏感信息，前端永远看不到）
      'x-qw-api-key': QW_API_KEY,
      'content-length': bodyBuf.length,
      ...(bodyBuf.length > 0 ? { 'content-type': req.headers['content-type'] || 'application/json' } : {}),
    },
    timeout: 15000,
  }

  const upstreamReq = https.request(options, async (upstreamResp) => {
    try {
      const buf = await readAndDecompress(upstreamResp)
      // 尝试 JSON 解析并注入业务错误中文提示（解析失败不拦截，原样返回）
      let bodyToSend = buf
      const contentType = (upstreamResp.headers['content-type'] || '').toLowerCase()
      if (contentType.includes('json') || contentType.includes('text')) {
        try {
          const obj = JSON.parse(buf.toString('utf8'))
          normalizeQwResponse(obj)
          bodyToSend = Buffer.from(JSON.stringify(obj), 'utf8')
        } catch {
          // 非 JSON 按原始数据返回
        }
      }
      // 响应头：去掉已被解压的编码头，改写 Content-Length
      const newHeaders = { ...upstreamResp.headers }
      delete newHeaders['content-encoding']
      delete newHeaders['content-length']
      newHeaders['content-length'] = String(Buffer.byteLength(bodyToSend))
      // CORS 全开（开发友好）
      newHeaders['access-control-allow-origin'] = '*'
      newHeaders['access-control-allow-headers'] = '*'
      newHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
      res.writeHead(upstreamResp.statusCode, newHeaders)
      res.end(bodyToSend)
    } catch (e) {
      res.writeHead(502, { 'content-type': 'application/json', 'access-control-allow-origin': '*' })
      res.end(JSON.stringify({ code: '502', _message: '代理转发失败：' + e.message }))
    }
  })

  upstreamReq.on('timeout', () => {
    upstreamReq.destroy(new Error('上游请求超时'))
  })
  upstreamReq.on('error', (e) => {
    // 网络类错误统一返回给前端友好提示
    let message = '无法连接和风天气服务'
    if (e.code === 'ENOTFOUND') message = '无法解析和风域名，请检查网络'
    else if (e.code === 'ETIMEDOUT' || e.message.includes('超时')) message = '请求和风天气超时，请稍后重试'
    res.writeHead(502, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' })
    res.end(JSON.stringify({ code: '502', _message: message }))
  })
  if (bodyBuf.length > 0) upstreamReq.write(bodyBuf)
  upstreamReq.end()
}

/**
 * 静态文件服务（生产模式 / dist 目录）
 * 找不到文件时 fallback 到 Vite（开发模式）或 index.html（SPA）
 */
async function serveStaticOrFallback(req, res) {
  let urlPath = req.url.split('?')[0]
  // SPA fallback：根路径或非 . 扩展名路径 → index.html
  if (urlPath === '/') urlPath = '/index.html'
  if (!path.extname(urlPath)) urlPath = '/index.html'
  const filePath = path.join(DIST_DIR, urlPath)
  // 安全：避免 ../ 目录穿越
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
    return res.end('Forbidden')
  }
  try {
    const stat = fs.statSync(filePath)
    if (stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase()
      const mime = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp',
      }[ext] || 'application/octet-stream'
      res.writeHead(200, { 'content-type': mime, 'cache-control': ext === '.html' ? 'no-cache' : 'max-age=3600' })
      return fs.createReadStream(filePath).pipe(res)
    }
    throw new Error('not file')
  } catch {
    // dist 文件不存在 → fallthrough：尝试代理到 Vite（开发模式）
    forwardToVite(req, res)
  }
}

/**
 * 回退到 Vite 开发服务器（dev 模式下 dist 还没构建时用）
 * 非和风 API、也没有静态文件时，把 HTML/资源请求转发给 Vite
 * 如果 Vite 也连不上，返回友好提示
 */
function forwardToVite(req, res) {
  const url = req.url
  const options = {
    hostname: VITE_HOST,
    port: VITE_PORT,
    path: url,
    method: req.method,
    headers: { ...req.headers, host: `${VITE_HOST}:${VITE_PORT}` },
    timeout: 5000,
  }
  const proxyReq = http.request(options, (viteRes) => {
    res.writeHead(viteRes.statusCode, {
      ...viteRes.headers,
      'access-control-allow-origin': '*',
    })
    viteRes.pipe(res)
  })
  proxyReq.on('timeout', () => proxyReq.destroy(new Error('Vite timeout')))
  proxyReq.on('error', () => {
    // Vite 未启动 → 返回提示
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(
      '<!doctype html><meta charset=utf-8><title>未构建</title>' +
        '<h2>开发服务器未就绪</h2>' +
        '<p>请先运行 <code>npm run dev</code> 启动 Vite，或 <code>npm run build</code> 构建 dist/ 后再运行 <code>npm start</code>。</p>'
    )
  })
  req.pipe(proxyReq)
}

// ============ 主 HTTP Server ============
const server = http.createServer(async (req, res) => {
  // 处理 CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-max-age': '86400',
    })
    return res.end()
  }

  const urlPath = req.url.split('?')[0]

  // 1) 和风 API 代理
  const route = matchApiRoute(urlPath)
  if (route) {
    return proxyToQWeather(req, res, route)
  }

  // 2) 健康检查端点（方便运维监控）
  if (urlPath === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    return res.end(JSON.stringify({ ok: true, ts: Date.now(), env: process.env.NODE_ENV || 'development' }))
  }

  // 3) 静态文件 / 回退 Vite
  serveStaticOrFallback(req, res)
})

server.listen(PORT, () => {
  const sep = '─'.repeat(60)
  // eslint-disable-next-line no-console
  console.log(`
╭${sep}╮
│   ☁  和风天气代理（QWeather Proxy）已启动                    │
├${sep}┤
│   本地地址   :  http://localhost:${PORT}${' '.repeat(Math.max(0, 40 - String(PORT).length))}│
│   健康检查   :  http://localhost:${PORT}/healthz${' '.repeat(Math.max(0, 36 - String(PORT).length))}│
│   Geo API    :  → ${QW_GEO_HOST}${' '.repeat(Math.max(0, 35 - QW_GEO_HOST.length))}│
│   Weather API:  → ${QW_WEATHER_HOST}${' '.repeat(Math.max(0, 35 - QW_WEATHER_HOST.length))}│
│   Vite 回退  :  http://${VITE_HOST}:${VITE_PORT}${' '.repeat(Math.max(0, 32 - String(VITE_PORT).length))}│
╰${sep}╯
`)
  // eslint-disable-next-line no-console
  console.log('   提示：天气页前端请求都走 /api/qw/* 前缀，Key 仅存于服务端')
})

// 端口占用时给出清晰错误提示
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用，请设置 PORT=xxxx 换一个端口`)
    process.exit(1)
  }
  throw e
})
