import { useState, useEffect, useCallback, useRef } from 'react'
import { pinyin } from 'pinyin-pro'
import { QW_ERROR_MESSAGES } from '../utils/qweatherUtils.js'
import { mockSearchCity, mockFetchWeather } from '../utils/weatherMockData.js'

/**
 * 和风天气（QWeather）前端直连配置
 *
 * 【为什么不使用 server.js 代理了】
 *   和风天气 Web API v7 起原生支持浏览器端 CORS 调用（响应头带 Access-Control-Allow-Origin:*）
 *   因此纯静态部署（Zeabur / GitHub Pages 等）可以直接从前端 fetch 官方域名，无需后端。
 *   同时保留 mock fallback：API 失败（Key 无效、请求频率超限、断网）时，
 *   自动降级为 Demo 模式展示内置数据，避免页面空窗。
 *
 * 【路由规则】
 *   GeoAPI（查城市 ID） → https://geoapi.qweather.com/v2/city/lookup
 *   WeatherAPI（实时/预报/指数） → https://{QW_WEATHER_HOST}/v7/{weather|indices}
 *   两个接口都需要在 URL 上带 ?key={QW_API_KEY}（v7 支持 URL 参数传 Key，不再用 Header）
 */
const QW_API_KEY = 'b3283a3af2c4454e94077d7805b2d1d5'
const QW_WEATHER_HOST = 'ke78krj838.re.qweatherapi.com' // 商业版个人专属子域
const GEO_API_BASE = 'https://geoapi.qweather.com'
const WEATHER_API_BASE = `https://${QW_WEATHER_HOST}`

/**
 * 常见外国城市 中文 → 英文 映射表
 *
 * 和风 GeoAPI 对中文关键词支持度高于 Open-Meteo，但仍存在个别外国城市名
 * 索引缺失或匹配到国内同名城市的问题，因此对已知高频外国城市
 * 直接用英文标准名查询。
 */
const FOREIGN_CITY_MAP = {
  // 日韩
  '首尔': 'Seoul', '釜山': 'Busan', '东京': 'Tokyo', '大阪': 'Osaka',
  '京都': 'Kyoto', '名古屋': 'Nagoya', '札幌': 'Sapporo', '福冈': 'Fukuoka',
  '横滨': 'Yokohama', '冲绳': 'Okinawa',
  // 北美
  '纽约': 'New York', '洛杉矶': 'Los Angeles', '旧金山': 'San Francisco',
  '芝加哥': 'Chicago', '波士顿': 'Boston', '西雅图': 'Seattle',
  '华盛顿': 'Washington', '拉斯维加斯': 'Las Vegas', '迈阿密': 'Miami',
  '休斯顿': 'Houston', '亚特兰大': 'Atlanta', '达拉斯': 'Dallas',
  '费城': 'Philadelphia', '凤凰城': 'Phoenix', '丹佛': 'Denver',
  '温哥华': 'Vancouver', '多伦多': 'Toronto', '蒙特利尔': 'Montreal',
  '卡尔加里': 'Calgary', '墨西哥城': 'Mexico City',
  // 英国
  '伦敦': 'London', '曼彻斯特': 'Manchester', '伯明翰': 'Birmingham',
  '利物浦': 'Liverpool', '利兹': 'Leeds', '谢菲尔德': 'Sheffield',
  '布里斯托尔': 'Bristol', '布里斯托': 'Bristol', '爱丁堡': 'Edinburgh',
  '格拉斯哥': 'Glasgow', '贝尔法斯特': 'Belfast', '剑桥': 'Cambridge',
  '牛津': 'Oxford', '布莱顿': 'Brighton', '诺丁汉': 'Nottingham',
  '纽卡斯尔': 'Newcastle', '南安普敦': 'Southampton',
  // 欧洲非英
  '巴黎': 'Paris', '里昂': 'Lyon', '马赛': 'Marseille', '尼斯': 'Nice',
  '波尔多': 'Bordeaux', '柏林': 'Berlin', '慕尼黑': 'Munich',
  '汉堡': 'Hamburg', '法兰克福': 'Frankfurt', '科隆': 'Cologne',
  '罗马': 'Rome', '米兰': 'Milan', '威尼斯': 'Venice',
  '佛罗伦萨': 'Florence', '那不勒斯': 'Naples', '都灵': 'Turin',
  '马德里': 'Madrid', '巴塞罗那': 'Barcelona', '瓦伦西亚': 'Valencia',
  '塞维利亚': 'Seville', '里斯本': 'Lisbon', '波尔图': 'Porto',
  '阿姆斯特丹': 'Amsterdam', '鹿特丹': 'Rotterdam', '维也纳': 'Vienna',
  '萨尔茨堡': 'Salzburg', '布拉格': 'Prague', '布达佩斯': 'Budapest',
  '华沙': 'Warsaw', '斯德哥尔摩': 'Stockholm', '哥本哈根': 'Copenhagen',
  '奥斯陆': 'Oslo', '赫尔辛基': 'Helsinki', '雷克雅未克': 'Reykjavik',
  '苏黎世': 'Zurich', '日内瓦': 'Geneva', '雅典': 'Athens',
  '布鲁塞尔': 'Brussels', '卢森堡': 'Luxembourg', '都柏林': 'Dublin',
  // 东欧/俄
  '莫斯科': 'Moscow', '圣彼得堡': 'Saint Petersburg', '基辅': 'Kyiv',
  '索契': 'Sochi',
  // 大洋洲
  '悉尼': 'Sydney', '墨尔本': 'Melbourne', '布里斯班': 'Brisbane',
  '珀斯': 'Perth', '阿德莱德': 'Adelaide', '黄金海岸': 'Gold Coast',
  '奥克兰': 'Auckland', '惠灵顿': 'Wellington',
  // 东南亚
  '曼谷': 'Bangkok', '清迈': 'Chiang Mai', '普吉岛': 'Phuket',
  '新加坡': 'Singapore', '吉隆坡': 'Kuala Lumpur', '槟城': 'Penang',
  '雅加达': 'Jakarta', '巴厘岛': 'Bali', '马尼拉': 'Manila',
  '河内': 'Hanoi', '胡志明市': 'Ho Chi Minh City', '岘港': 'Da Nang',
  '金边': 'Phnom Penh', '万象': 'Vientiane', '仰光': 'Yangon',
  // 南亚/中东
  '孟买': 'Mumbai', '新德里': 'New Delhi', '加尔各答': 'Kolkata',
  '班加罗尔': 'Bengaluru', '科伦坡': 'Colombo', '加德满都': 'Kathmandu',
  '迪拜': 'Dubai', '阿布扎比': 'Abu Dhabi', '多哈': 'Doha',
  '伊斯坦布尔': 'Istanbul', '安卡拉': 'Ankara', '安曼': 'Amman',
  '耶路撒冷': 'Jerusalem', '特拉维夫': 'Tel Aviv', '利雅得': 'Riyadh',
  // 非
  '开罗': 'Cairo', '开普敦': 'Cape Town', '约翰内斯堡': 'Johannesburg',
  '拉各斯': 'Lagos', '内罗毕': 'Nairobi', '卡萨布兰卡': 'Casablanca',
  '突尼斯': 'Tunis',
  // 拉美
  '里约热内卢': 'Rio de Janeiro', '圣保罗': 'Sao Paulo',
  '布宜诺斯艾利斯': 'Buenos Aires', '波哥大': 'Bogota', '利马': 'Lima',
  '圣地亚哥': 'Santiago', '坎昆': 'Cancun', '哈瓦那': 'Havana',
  '巴拿马城': 'Panama City',
}

/** 字符串是否含中文 */
function containsChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str)
}
/** 中文转无声调拼音 */
function toPinyin(str) {
  return pinyin(str, { toneType: 'none', type: 'array' }).join('')
}

/**
 * 通用：把和风的标准响应包装为 { ok, data, message }
 *   规则：HTTP 200 且 body.code === "200" 才算成功，其他为失败
 *   服务端已经给失败响应注入了 _message，前端取不到时用 QW_ERROR_MESSAGES 兜底
 */
async function fetchQw(url) {
  let httpRes
  try {
    httpRes = await fetch(url)
  } catch (e) {
    const msg = e.message?.toLowerCase().includes('cors')
      ? QW_ERROR_MESSAGES['502']
      : (e.message || QW_ERROR_MESSAGES['502'])
    return { ok: false, code: '502', message: msg }
  }
  let data
  try {
    data = await httpRes.json()
  } catch {
    return { ok: false, code: String(httpRes.status), message: QW_ERROR_MESSAGES['500'] }
  }
  const code = String(data?.code ?? httpRes.status)
  if (code === '200') return { ok: true, code, data }
  const message = data?._message || QW_ERROR_MESSAGES[code] || `请求失败（错误码：${code}）`
  return { ok: false, code, message }
}

/**
 * 城市搜索（Geo Lookup）
 * 关键词可能是中文/英文/拼音，按以下优先级查询：
 *   1) 命中 FOREIGN_CITY_MAP → 用英文标准名查
 *   2) 用原始关键词查
 *   3) 仍无结果且含中文 → 转拼音再查一次
 *   4) 真实 API 全部失败或无结果 → fallback 到内置 mock 数据（Demo 模式）
 *
 * 返回值：{ results: location[], fromMock: boolean }
 * 包装为对象后，调用方可以知道是否走了 mock，并在 UI 显示 DEMO 徽章
 */
async function searchCity(keyword) {
  const queries = []
  const mapped = FOREIGN_CITY_MAP[keyword]
  if (mapped) queries.push(mapped)
  queries.push(keyword)
  if (containsChinese(keyword)) {
    const py = toPinyin(keyword)
    if (py && py !== keyword) queries.push(py)
  }
  // 逐次尝试真实 API，任何一次成功有结果立即返回
  for (const kw of queries) {
    const url = `${GEO_API_BASE}/v2/city/lookup?location=${encodeURIComponent(kw)}&number=5&key=${QW_API_KEY}`
    const res = await fetchQw(url)
    if (res.ok && res.data.location && res.data.location.length > 0) {
      return { results: res.data.location, fromMock: false }
    }
  }
  // 真实路径全失败 → 走 Demo 模式
  return { results: mockSearchCity(keyword), fromMock: true }
}

/**
 * 并行请求「实时天气 + 7日预报 + 紫外线指数」三个接口
 * 使用 Promise.allSettled：单个接口失败不阻塞整体，给前端展示部分数据
 * 如果真实接口全部失败（网络错误、Key 无效等），自动 fallback 到 mock
 * @param {string} locationId 和风 Location ID，如 "101010100"
 * @returns { now, daily, indices, fromMock } fromMock 标记是否走了 Demo 模式
 */
async function fetchAllWeather(locationId) {
  const nowUrl      = `${WEATHER_API_BASE}/v7/weather/now?location=${locationId}&key=${QW_API_KEY}`
  const dailyUrl    = `${WEATHER_API_BASE}/v7/weather/7d?location=${locationId}&key=${QW_API_KEY}`
  const indicesUrl  = `${WEATHER_API_BASE}/v7/indices/1d?location=${locationId}&type=5&key=${QW_API_KEY}` // type=5 紫外线

  const [nowRes, dailyRes, indicesRes] = await Promise.allSettled([
    fetchQw(nowUrl),
    fetchQw(dailyUrl),
    fetchQw(indicesUrl),
  ])

  // allSettled：无论请求是否成功都会返回 status + value/reason
  const pick = (r) => r.status === 'fulfilled' ? r.value : { ok: false, code: '500', message: '请求异常' }
  const now = pick(nowRes)
  const daily = pick(dailyRes)
  const indices = pick(indicesRes)

  // 真实数据成功（至少 now 或 daily 有一个 ok）→ 正常返回
  if (now.ok || daily.ok) {
    return { now, daily, indices, fromMock: false }
  }

  // 真实全挂 → 走 mock
  const mock = mockFetchWeather(locationId)
  return {
    now: { ok: true, data: { now: mock.now, updateTime: mock.updateTime } },
    daily: { ok: true, data: { daily: mock.daily, updateTime: mock.updateTime } },
    indices: { ok: true, data: { daily: [mock.indices], updateTime: mock.updateTime } },
    fromMock: true,
  }
}

/**
 * 自定义 Hook：和风天气数据层
 *
 * 调用流程：
 *   用户输入 → searchCity（最多 3 次 keyword 尝试）→ 候选列表
 *   用户点选 → 拿到 location.id → fetchAllWeather（3 接口并行） → 展示天气
 */
export default function useWeather() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [city, setCity] = useState(null)
  // 合并后的天气数据（给 UI 层一个稳定结构，避免各接口单独处理）
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Demo 模式标记：真实 API 失败 fallback 时为 true，UI 显示 DEMO 徽章（真实数据时不显示）
  const [demoMode, setDemoMode] = useState(false)
  const debounceRef = useRef(null)

  // ========== 搜索防抖 ==========
  // 直接调用真实和风 API（前端直连，无代理），失败时自动 fallback 到 mock
  useEffect(() => {
    const keyword = search.trim()
    if (!keyword) {
      setResults([])
      setShowResults(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { results: list, fromMock } = await searchCity(keyword)
        setResults(list)
        setShowResults(true)
        setError('')
        // 仅真实 API 失败且走了 mock 时才打开 Demo 徽章
        setDemoMode(!!fromMock)
      } catch {
        setResults([])
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // ========== 选中城市，拉取天气 ==========
  const selectCity = useCallback(async (item) => {
    const locationId = item.id
    if (!locationId) {
      setError('城市 ID 缺失，无法查询')
      return
    }
    setCity({
      name: item.name,
      country: item.country,
      admin1: item.adm1,
      latitude: item.lat,
      longitude: item.lon,
      id: locationId,
    })
    setShowResults(false)
    setLoading(true)
    setError('')
    try {
      // 优先真实 API；失败（网络/Key/频控）时 fetchAllWeather 内部会返回 fromMock=true 的 mock 数据
      const all = await fetchAllWeather(locationId)
      setDemoMode(!!all.fromMock)

      // 至少有一个接口成功就算展示成功（展示部分数据也好过空）
      const anyOk = all.now.ok || all.daily.ok
      if (!anyOk) {
        // 取第一个失败的 message 提示给用户
        const firstFail = [all.now, all.daily, all.indices].find(r => !r.ok)
        setError(firstFail?.message || '天气数据获取失败')
        setWeather(null)
        return
      }
      // 单条失败写入非阻断 warning，UI 层可忽略（Demo 模式下不会有这些）
      const warnings = []
      if (!all.now.ok) warnings.push(`实时天气：${all.now.message}`)
      if (!all.daily.ok) warnings.push(`7 日预报：${all.daily.message}`)
      if (!all.indices.ok) warnings.push(`紫外线：${all.indices.message}`)

      // 归一化给 WeatherPage 用的统一结构，字段命名保持和 WeatherPage 读取一致
      const normalized = {
        now: all.now.ok ? all.now.data.now : null,
        daily: all.daily.ok ? all.daily.data.daily : null,
        indices: all.indices.ok ? (all.indices.data.daily?.[0] ?? null) : null,
        updateTime: all.now.data?.updateTime || all.daily.data?.updateTime || new Date().toISOString(),
        warnings: warnings.length ? warnings : undefined,
      }
      setWeather(normalized)
    } catch (e) {
      setError(e.message || '查询失败，请稍后重试')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    search, setSearch,
    results, showResults, setShowResults,
    city, weather, loading, error,
    backendReady: true, demoMode, // 直连模式下「后端已就绪」= true，不阻塞任何功能
    selectCity,
  }
}
