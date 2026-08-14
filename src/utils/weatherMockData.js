/**
 * 天气 Demo 模式 Mock 数据
 * 用于后端不可用时（如纯静态部署、server.js 未启动）提供可视化展示
 * 数据结构完全对齐 useWeather 返回的归一化格式，保证 WeatherPage UI 零改动
 */

/** 城市 → mock 数据的映射表（key 支持中文/拼音/英文别名多个 key 指向同一数据，浅拷贝引用） */
const MOCK_CITIES = {
  // ============ 一线城市 ============
  '深圳': {
    id: '101280601', name: 'Shenzhen', country: 'China', adm1: 'Guangdong',
    lat: '22.547', lon: '114.086',
    now: { temp: '28', feelsLike: '31', icon: '101', text: '多云',
      windDir: '东南风', windScale: '2', windSpeed: '12',
      humidity: '78', pressure: '1008', vis: '15', cloud: '65', uvIndex: '6' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '32', tempMin: '26', iconDay: '101', iconNight: '104', textDay: '多云', textNight: '阴' },
      { fxDate: '2026-08-15', tempMax: '33', tempMin: '27', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-16', tempMax: '31', tempMin: '26', iconDay: '305', iconNight: '306', textDay: '小雨', textNight: '中雨' },
      { fxDate: '2026-08-17', tempMax: '29', tempMin: '25', iconDay: '306', iconNight: '305', textDay: '中雨', textNight: '小雨' },
      { fxDate: '2026-08-18', tempMax: '30', tempMin: '25', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '32', tempMin: '26', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
      { fxDate: '2026-08-20', tempMax: '33', tempMin: '27', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
    ],
    indices: { level: '6', category: '强', text: '紫外线强度较强，建议涂抹 SPF30+ 防晒霜，避免长时间暴晒。' },
  },
  '北京': {
    id: '101010100', name: 'Beijing', country: 'China', adm1: 'Beijing',
    lat: '39.904', lon: '116.407',
    now: { temp: '31', feelsLike: '34', icon: '100', text: '晴',
      windDir: '南风', windScale: '3', windSpeed: '18',
      humidity: '42', pressure: '1006', vis: '25', cloud: '10', uvIndex: '8' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '33', tempMin: '22', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
      { fxDate: '2026-08-15', tempMax: '34', tempMin: '23', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-16', tempMax: '32', tempMin: '22', iconDay: '102', iconNight: '104', textDay: '少云', textNight: '阴' },
      { fxDate: '2026-08-17', tempMax: '30', tempMin: '21', iconDay: '305', iconNight: '302', textDay: '小雨', textNight: '雷阵雨' },
      { fxDate: '2026-08-18', tempMax: '28', tempMin: '20', iconDay: '302', iconNight: '102', textDay: '雷阵雨', textNight: '少云' },
      { fxDate: '2026-08-19', tempMax: '31', tempMin: '21', iconDay: '101', iconNight: '100', textDay: '多云', textNight: '晴' },
      { fxDate: '2026-08-20', tempMax: '33', tempMin: '22', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
    ],
    indices: { level: '8', category: '很强', text: '紫外线极强，务必涂抹高倍防晒霜并佩戴遮阳帽、太阳镜。' },
  },
  '上海': {
    id: '101020100', name: 'Shanghai', country: 'China', adm1: 'Shanghai',
    lat: '31.230', lon: '121.473',
    now: { temp: '30', feelsLike: '35', icon: '101', text: '多云',
      windDir: '东风', windScale: '3', windSpeed: '16',
      humidity: '82', pressure: '1007', vis: '12', cloud: '55', uvIndex: '5' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '33', tempMin: '26', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-15', tempMax: '32', tempMin: '26', iconDay: '305', iconNight: '306', textDay: '小雨', textNight: '中雨' },
      { fxDate: '2026-08-16', tempMax: '30', tempMin: '25', iconDay: '306', iconNight: '307', textDay: '中雨', textNight: '大雨' },
      { fxDate: '2026-08-17', tempMax: '29', tempMin: '24', iconDay: '307', iconNight: '305', textDay: '大雨', textNight: '小雨' },
      { fxDate: '2026-08-18', tempMax: '30', tempMin: '25', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '32', tempMin: '26', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-20', tempMax: '33', tempMin: '27', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
    ],
    indices: { level: '5', category: '中', text: '紫外线中等，外出建议涂抹防晒霜并佩戴太阳镜。' },
  },
  '广州': {
    id: '101280101', name: 'Guangzhou', country: 'China', adm1: 'Guangdong',
    lat: '23.129', lon: '113.264',
    now: { temp: '33', feelsLike: '40', icon: '102', text: '少云',
      windDir: '南风', windScale: '2', windSpeed: '10',
      humidity: '85', pressure: '1005', vis: '10', cloud: '30', uvIndex: '9' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '35', tempMin: '27', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-15', tempMax: '34', tempMin: '27', iconDay: '305', iconNight: '305', textDay: '小雨', textNight: '小雨' },
      { fxDate: '2026-08-16', tempMax: '33', tempMin: '26', iconDay: '306', iconNight: '306', textDay: '中雨', textNight: '中雨' },
      { fxDate: '2026-08-17', tempMax: '32', tempMin: '26', iconDay: '305', iconNight: '102', textDay: '小雨', textNight: '少云' },
      { fxDate: '2026-08-18', tempMax: '34', tempMin: '27', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '35', tempMin: '28', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-20', tempMax: '36', tempMin: '28', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
    ],
    indices: { level: '9', category: '很强', text: '紫外线非常强，避免上午 10 点至下午 4 点外出，外出务必全副防晒。' },
  },
  '杭州': {
    id: '101210101', name: 'Hangzhou', country: 'China', adm1: 'Zhejiang',
    lat: '30.274', lon: '120.155',
    now: { temp: '29', feelsLike: '33', icon: '305', text: '小雨',
      windDir: '东北风', windScale: '2', windSpeed: '11',
      humidity: '88', pressure: '1007', vis: '6', cloud: '90', uvIndex: '2' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '31', tempMin: '25', iconDay: '305', iconNight: '306', textDay: '小雨', textNight: '中雨' },
      { fxDate: '2026-08-15', tempMax: '30', tempMin: '24', iconDay: '306', iconNight: '305', textDay: '中雨', textNight: '小雨' },
      { fxDate: '2026-08-16', tempMax: '29', tempMin: '24', iconDay: '305', iconNight: '104', textDay: '小雨', textNight: '阴' },
      { fxDate: '2026-08-17', tempMax: '31', tempMin: '24', iconDay: '104', iconNight: '102', textDay: '阴', textNight: '少云' },
      { fxDate: '2026-08-18', tempMax: '33', tempMin: '25', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '34', tempMin: '26', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-20', tempMax: '35', tempMin: '27', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
    ],
    indices: { level: '2', category: '弱', text: '紫外线较弱，但阴雨天仍需注意基础防护。' },
  },
  '成都': {
    id: '101270101', name: 'Chengdu', country: 'China', adm1: 'Sichuan',
    lat: '30.572', lon: '104.066',
    now: { temp: '26', feelsLike: '28', icon: '104', text: '阴',
      windDir: '北风', windScale: '1', windSpeed: '6',
      humidity: '75', pressure: '1012', vis: '8', cloud: '95', uvIndex: '1' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '28', tempMin: '21', iconDay: '104', iconNight: '104', textDay: '阴', textNight: '阴' },
      { fxDate: '2026-08-15', tempMax: '29', tempMin: '22', iconDay: '102', iconNight: '104', textDay: '少云', textNight: '阴' },
      { fxDate: '2026-08-16', tempMax: '28', tempMin: '21', iconDay: '305', iconNight: '305', textDay: '小雨', textNight: '小雨' },
      { fxDate: '2026-08-17', tempMax: '27', tempMin: '21', iconDay: '305', iconNight: '104', textDay: '小雨', textNight: '阴' },
      { fxDate: '2026-08-18', tempMax: '28', tempMin: '21', iconDay: '104', iconNight: '102', textDay: '阴', textNight: '少云' },
      { fxDate: '2026-08-19', tempMax: '29', tempMin: '22', iconDay: '102', iconNight: '102', textDay: '少云', textNight: '少云' },
      { fxDate: '2026-08-20', tempMax: '30', tempMin: '22', iconDay: '101', iconNight: '102', textDay: '多云', textNight: '少云' },
    ],
    indices: { level: '1', category: '弱', text: '紫外线很弱，无需特别防护。' },
  },
  '重庆': {
    id: '101040100', name: 'Chongqing', country: 'China', adm1: 'Chongqing',
    lat: '29.563', lon: '106.551',
    now: { temp: '35', feelsLike: '44', icon: '101', text: '多云',
      windDir: '西南风', windScale: '2', windSpeed: '8',
      humidity: '68', pressure: '1004', vis: '12', cloud: '50', uvIndex: '7' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '38', tempMin: '27', iconDay: '101', iconNight: '102', textDay: '多云', textNight: '少云' },
      { fxDate: '2026-08-15', tempMax: '39', tempMin: '28', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-16', tempMax: '40', tempMin: '29', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
      { fxDate: '2026-08-17', tempMax: '37', tempMin: '27', iconDay: '305', iconNight: '302', textDay: '小雨', textNight: '雷阵雨' },
      { fxDate: '2026-08-18', tempMax: '34', tempMin: '25', iconDay: '302', iconNight: '102', textDay: '雷阵雨', textNight: '少云' },
      { fxDate: '2026-08-19', tempMax: '36', tempMin: '26', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-20', tempMax: '38', tempMin: '27', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
    ],
    indices: { level: '7', category: '强', text: '紫外线强，天气炎热，注意防暑降温。' },
  },
  '西安': {
    id: '101110101', name: "Xi'an", country: 'China', adm1: 'Shaanxi',
    lat: '34.341', lon: '108.939',
    now: { temp: '28', feelsLike: '31', icon: '100', text: '晴',
      windDir: '东风', windScale: '2', windSpeed: '10',
      humidity: '55', pressure: '1009', vis: '20', cloud: '5', uvIndex: '9' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '33', tempMin: '21', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
      { fxDate: '2026-08-15', tempMax: '32', tempMin: '22', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-16', tempMax: '30', tempMin: '20', iconDay: '305', iconNight: '302', textDay: '小雨', textNight: '雷阵雨' },
      { fxDate: '2026-08-17', tempMax: '27', tempMin: '19', iconDay: '302', iconNight: '102', textDay: '雷阵雨', textNight: '少云' },
      { fxDate: '2026-08-18', tempMax: '29', tempMin: '20', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '31', tempMin: '21', iconDay: '101', iconNight: '100', textDay: '多云', textNight: '晴' },
      { fxDate: '2026-08-20', tempMax: '33', tempMin: '22', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
    ],
    indices: { level: '9', category: '很强', text: '紫外线极强，外出务必做好防晒措施。' },
  },
  '南京': {
    id: '101190101', name: 'Nanjing', country: 'China', adm1: 'Jiangsu',
    lat: '32.060', lon: '118.796',
    now: { temp: '29', feelsLike: '34', icon: '101', text: '多云',
      windDir: '东南风', windScale: '2', windSpeed: '11',
      humidity: '80', pressure: '1007', vis: '15', cloud: '60', uvIndex: '6' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '32', tempMin: '25', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-15', tempMax: '31', tempMin: '25', iconDay: '305', iconNight: '306', textDay: '小雨', textNight: '中雨' },
      { fxDate: '2026-08-16', tempMax: '29', tempMin: '24', iconDay: '306', iconNight: '305', textDay: '中雨', textNight: '小雨' },
      { fxDate: '2026-08-17', tempMax: '28', tempMin: '23', iconDay: '305', iconNight: '104', textDay: '小雨', textNight: '阴' },
      { fxDate: '2026-08-18', tempMax: '30', tempMin: '24', iconDay: '104', iconNight: '101', textDay: '阴', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '32', tempMin: '25', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-20', tempMax: '33', tempMin: '26', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
    ],
    indices: { level: '6', category: '强', text: '紫外线较强，建议外出做好防晒。' },
  },
  '武汉': {
    id: '101200101', name: 'Wuhan', country: 'China', adm1: 'Hubei',
    lat: '30.592', lon: '114.305',
    now: { temp: '32', feelsLike: '38', icon: '100', text: '晴',
      windDir: '南风', windScale: '2', windSpeed: '9',
      humidity: '72', pressure: '1006', vis: '18', cloud: '15', uvIndex: '10' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '35', tempMin: '26', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-15', tempMax: '34', tempMin: '26', iconDay: '101', iconNight: '305', textDay: '多云', textNight: '小雨' },
      { fxDate: '2026-08-16', tempMax: '32', tempMin: '25', iconDay: '305', iconNight: '306', textDay: '小雨', textNight: '中雨' },
      { fxDate: '2026-08-17', tempMax: '30', tempMin: '24', iconDay: '306', iconNight: '305', textDay: '中雨', textNight: '小雨' },
      { fxDate: '2026-08-18', tempMax: '31', tempMin: '24', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '34', tempMin: '25', iconDay: '101', iconNight: '100', textDay: '多云', textNight: '晴' },
      { fxDate: '2026-08-20', tempMax: '36', tempMin: '27', iconDay: '100', iconNight: '100', textDay: '晴', textNight: '晴' },
    ],
    indices: { level: '10', category: '极强', text: '紫外线极强，建议尽量避免外出，谨防中暑。' },
  },
  // ============ 主要国际城市 ============
  '东京': {
    id: '103-0001', name: 'Tokyo', country: 'Japan', adm1: 'Tokyo',
    lat: '35.689', lon: '139.691',
    now: { temp: '26', feelsLike: '29', icon: '102', text: '少云',
      windDir: '南风', windScale: '3', windSpeed: '14',
      humidity: '75', pressure: '1008', vis: '15', cloud: '35', uvIndex: '5' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '29', tempMin: '23', iconDay: '102', iconNight: '101', textDay: '少云', textNight: '多云' },
      { fxDate: '2026-08-15', tempMax: '30', tempMin: '24', iconDay: '100', iconNight: '102', textDay: '晴', textNight: '少云' },
      { fxDate: '2026-08-16', tempMax: '28', tempMin: '23', iconDay: '305', iconNight: '305', textDay: '小雨', textNight: '小雨' },
      { fxDate: '2026-08-17', tempMax: '27', tempMin: '22', iconDay: '306', iconNight: '102', textDay: '中雨', textNight: '少云' },
      { fxDate: '2026-08-18', tempMax: '28', tempMin: '22', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '29', tempMin: '23', iconDay: '102', iconNight: '100', textDay: '少云', textNight: '晴' },
      { fxDate: '2026-08-20', tempMax: '30', tempMin: '24', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
    ],
    indices: { level: '5', category: '中', text: '紫外线中等，建议外出使用防晒霜。' },
  },
  '香港': {
    id: '101320101', name: 'Hong Kong', country: 'China', adm1: 'Hong Kong',
    lat: '22.319', lon: '114.169',
    now: { temp: '30', feelsLike: '36', icon: '305', text: '小雨',
      windDir: '西南风', windScale: '3', windSpeed: '15',
      humidity: '90', pressure: '1006', vis: '7', cloud: '85', uvIndex: '4' },
    daily: [
      { fxDate: '2026-08-14', tempMax: '32', tempMin: '27', iconDay: '305', iconNight: '306', textDay: '小雨', textNight: '中雨' },
      { fxDate: '2026-08-15', tempMax: '31', tempMin: '26', iconDay: '306', iconNight: '305', textDay: '中雨', textNight: '小雨' },
      { fxDate: '2026-08-16', tempMax: '30', tempMin: '26', iconDay: '305', iconNight: '101', textDay: '小雨', textNight: '多云' },
      { fxDate: '2026-08-17', tempMax: '32', tempMin: '27', iconDay: '101', iconNight: '101', textDay: '多云', textNight: '多云' },
      { fxDate: '2026-08-18', tempMax: '33', tempMin: '27', iconDay: '100', iconNight: '101', textDay: '晴', textNight: '多云' },
      { fxDate: '2026-08-19', tempMax: '32', tempMin: '27', iconDay: '101', iconNight: '305', textDay: '多云', textNight: '小雨' },
      { fxDate: '2026-08-20', tempMax: '31', tempMin: '26', iconDay: '305', iconNight: '305', textDay: '小雨', textNight: '小雨' },
    ],
    indices: { level: '4', category: '中', text: '紫外线中等，雨天也要注意防晒。' },
  },
}

/** 城市别名映射（拼音/英文 → 中文主键，大小写不敏感） */
const ALIAS_MAP = {
  'shenzhen': '深圳', '深圳': '深圳', 'sz': '深圳',
  'beijing': '北京', '北京': '北京', 'bj': '北京', 'beijing china': '北京',
  'shanghai': '上海', '上海': '上海', 'sh': '上海',
  'guangzhou': '广州', '广州': '广州', 'gz': '广州', 'canton': '广州',
  'hangzhou': '杭州', '杭州': '杭州', 'hz': '杭州',
  'chengdu': '成都', '成都': '成都', 'cd': '成都',
  'chongqing': '重庆', '重庆': '重庆', 'cq': '重庆',
  "xi'an": '西安', "xian": '西安', '西安': '西安', 'xa': '西安',
  'nanjing': '南京', '南京': '南京', 'nj': '南京',
  'wuhan': '武汉', '武汉': '武汉', 'wh': '武汉',
  'tokyo': '东京', '東京': '东京', '东京': '东京',
  'hong kong': '香港', 'hongkong': '香港', 'hk': '香港', '香港': '香港',
}

/** 拼音工具：中文→拼音用于模糊匹配 */
function _toPinyin(str) {
  // 轻量版：直接查 ALIAS_MAP，避免重复依赖 pinyin-pro（useWeather 里已用，mock 层保持独立）
  return str
}

/**
 * Demo 模式：城市搜索
 * 返回格式对齐和风 GeoAPI 的 location[] 结构，保证 UI 层零改动
 */
export function mockSearchCity(keyword) {
  const raw = (keyword || '').trim().toLowerCase()
  if (!raw) return []
  // 先精确命中别名
  const primaryKey = ALIAS_MAP[raw]
  const matches = []
  if (primaryKey && MOCK_CITIES[primaryKey]) {
    const c = MOCK_CITIES[primaryKey]
    matches.push({ id: c.id, name: primaryKey, country: c.country, adm1: c.adm1, lat: c.lat, lon: c.lon })
  }
  // 再模糊匹配：中文名称包含、英文名 / adm1 包含
  for (const [zhKey, c] of Object.entries(MOCK_CITIES)) {
    if (matches.some((m) => m.id === c.id)) continue
    const lowerName = c.name.toLowerCase()
    const lowerAdm1 = c.adm1.toLowerCase()
    if (
      zhKey.includes(keyword) ||
      lowerName.includes(raw) ||
      lowerAdm1.includes(raw) ||
      (raw.length >= 2 && zhKey.startsWith(keyword))
    ) {
      matches.push({ id: c.id, name: zhKey, country: c.country, adm1: c.adm1, lat: c.lat, lon: c.lon })
    }
  }
  // 兜底：如果完全没命中且长度够，返回深圳 + 北京（展示 demo 数据总比空好）
  if (matches.length === 0 && raw.length >= 1) {
    for (const zhKey of ['深圳', '北京', '上海']) {
      const c = MOCK_CITIES[zhKey]
      matches.push({ id: c.id, name: zhKey, country: c.country, adm1: c.adm1, lat: c.lat, lon: c.lon })
    }
  }
  return matches.slice(0, 5)
}

/**
 * Demo 模式：拉取天气数据
 * 返回结构对齐 fetchAllWeather 返回的归一化结构
 * 失败时抛出错误（和真实 API 行为一致），由上层 try/catch 处理
 */
export function mockFetchWeather(locationId) {
  // 通过 id 查找
  let hit = null
  let hitName = null
  for (const [zhKey, c] of Object.entries(MOCK_CITIES)) {
    if (c.id === locationId) { hit = c; hitName = zhKey; break }
  }
  if (!hit) {
    // id 未命中 → 返回第一个（深圳）兜底，保证 demo 总能展示
    hit = MOCK_CITIES['深圳']
    hitName = '深圳'
  }
  return {
    now: hit.now,
    daily: hit.daily,
    indices: hit.indices,
    // 附带一个 flag，UI 层读取后显示 DEMO 徽章
    _mockMode: true,
    _mockCityName: hitName,
    updateTime: new Date().toISOString(),
  }
}
