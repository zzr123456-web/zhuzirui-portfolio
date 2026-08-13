/**
 * 天气相关工具函数
 * 包含 WMO 天气代码到中文描述/图标/渐变色的映射
 * Open-Meteo 使用 WMO 标准天气代码，详见：
 * https://open-meteo.com/en/docs#weathervariables
 */

// WMO 天气代码 → { 描述, 图标 emoji, 主题渐变色（用于卡片背景） }
const WEATHER_CODE_MAP = {
  0:  { desc: '晴',         icon: '☀️',  theme: 'clear' },
  1:  { desc: '大部晴朗',    icon: '🌤️', theme: 'clear' },
  2:  { desc: '局部多云',    icon: '⛅',  theme: 'cloud' },
  3:  { desc: '阴',         icon: '☁️',  theme: 'cloud' },
  45: { desc: '雾',         icon: '🌫️', theme: 'fog' },
  48: { desc: '雾凇',       icon: '🌫️', theme: 'fog' },
  51: { desc: '轻度毛毛雨',  icon: '🌦️', theme: 'rain' },
  53: { desc: '中度毛毛雨',  icon: '🌦️', theme: 'rain' },
  55: { desc: '重度毛毛雨',  icon: '🌧️', theme: 'rain' },
  56: { desc: '冻毛毛雨',    icon: '🌧️', theme: 'rain' },
  57: { desc: '重度冻毛毛雨', icon: '🌧️', theme: 'rain' },
  61: { desc: '小雨',       icon: '🌦️', theme: 'rain' },
  63: { desc: '中雨',       icon: '🌧️', theme: 'rain' },
  65: { desc: '大雨',       icon: '🌧️', theme: 'rain' },
  66: { desc: '冻雨',       icon: '🌧️', theme: 'rain' },
  67: { desc: '重度冻雨',    icon: '🌧️', theme: 'rain' },
  71: { desc: '小雪',       icon: '🌨️', theme: 'snow' },
  73: { desc: '中雪',       icon: '🌨️', theme: 'snow' },
  75: { desc: '大雪',       icon: '❄️', theme: 'snow' },
  77: { desc: '米雪',       icon: '❄️', theme: 'snow' },
  80: { desc: '小阵雨',     icon: '🌦️', theme: 'rain' },
  81: { desc: '中阵雨',     icon: '🌧️', theme: 'rain' },
  82: { desc: '大阵雨',     icon: '⛈️', theme: 'rain' },
  85: { desc: '小阵雪',     icon: '🌨️', theme: 'snow' },
  86: { desc: '大阵雪',     icon: '❄️', theme: 'snow' },
  95: { desc: '雷暴',       icon: '⛈️', theme: 'storm' },
  96: { desc: '雷暴夹冰雹',  icon: '⛈️', theme: 'storm' },
  99: { desc: '重度雷暴夹冰雹', icon: '⛈️', theme: 'storm' },
}

// 不同天气主题对应的背景渐变（用于动态切换页面氛围）
const THEME_GRADIENTS = {
  clear: 'linear-gradient(135deg, #FFB347 0%, #FFCC70 50%, #FFE5B4 100%)',
  cloud: 'linear-gradient(135deg, #8E9EAB 0%, #A4B5C4 50%, #DBE6F0 100%)',
  fog:   'linear-gradient(135deg, #BDC3C7 0%, #C9D0D4 50%, #E8ECEF 100%)',
  rain:  'linear-gradient(135deg, #4B6CB7 0%, #506A85 50%, #8FA9C2 100%)',
  snow:  'linear-gradient(135deg, #83A4D4 0%, #B6C6DD 50%, #E0E8F0 100%)',
  storm: 'linear-gradient(135deg, #232526 0%, #414345 50%, #6B7071 100%)',
}

/**
 * 根据天气代码获取信息
 * @param {number} code WMO 天气代码
 * @returns {{desc: string, icon: string, theme: string}}
 */
export function getWeatherInfo(code) {
  return WEATHER_CODE_MAP[code] ?? { desc: '未知', icon: '❓', theme: 'cloud' }
}

/**
 * 根据天气代码获取背景渐变
 * @param {number} code WMO 天气代码
 * @returns {string} CSS linear-gradient 字符串
 */
export function getThemeGradient(code) {
  const { theme } = getWeatherInfo(code)
  return THEME_GRADIENTS[theme] ?? THEME_GRADIENTS.cloud
}

/**
 * 将 ISO 时间字符串转为 "HH:mm" 简短格式
 * @param {string} isoTime ISO 时间字符串，例如 "2026-08-11T13:00"
 * @returns {string}
 */
export function formatHour(isoTime) {
  if (!isoTime) return '--:--'
  // 仅截取 HH:mm 部分，避免时区转换带来的偏差
  return isoTime.slice(11, 16)
}

/**
 * 将 ISO 日期字符串转为 "MM-DD" 格式 + 星期几
 * @param {string} isoDate ISO 日期字符串，例如 "2026-08-11"
 * @returns {{date: string, weekday: string}}
 */
export function formatDate(isoDate) {
  if (!isoDate) return { date: '--/--', weekday: '--' }
  const d = new Date(isoDate)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    date: `${mm}-${dd}`,
    weekday: weekdays[d.getDay()],
  }
}

/**
 * 风速等级（蒲福风级）中文描述
 * @param {number} speed 风速 km/h
 * @returns {string}
 */
export function getWindLevel(speed) {
  if (speed < 1) return '无风'
  if (speed < 6) return '软风'
  if (speed < 12) return '轻风'
  if (speed < 20) return '微风'
  if (speed < 29) return '和风'
  if (speed < 39) return '清风'
  if (speed < 50) return '强风'
  if (speed < 62) return '疾风'
  if (speed < 75) return '大风'
  return '烈风'
}
