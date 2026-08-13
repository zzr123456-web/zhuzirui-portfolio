import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useWeather from '../hooks/useWeather.js'
import {
  getIconInfo,
  getThemeGradient,
  formatDate,
  uvCategory,
  formatGeoWithZh,
} from '../utils/qweatherUtils.js'
import '../styles/weather.css'

export default function WeatherPage() {
  const {
    search, setSearch, results, showResults, setShowResults,
    city, weather, loading, error, selectCity,
  } = useWeather()

  // 和风实时天气的 icon code，用于动态背景（找不到就 fallback 到 cloud）
  const currentIconCode = weather?.now?.icon ?? null
  const bgGradient = getThemeGradient(currentIconCode ?? 101)

  return (
    <div className="weather-page min-h-screen w-full" style={{ background: bgGradient }}>
      <div className="weather-container mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* 顶部导航 */}
        <header className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="weather-back text-white/90 hover:text-white text-sm font-mono transition-colors"
          >
            ← 返回首页
          </Link>
          <h1 className="weather-title text-white font-serif text-2xl md:text-3xl tracking-wide">
            天气查询
          </h1>
          <span className="text-white/70 text-xs font-mono w-16 text-right">和风天气</span>
        </header>

        {/* 搜索框 */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          results={results}
          showResults={showResults}
          setShowResults={setShowResults}
          onSelect={selectCity}
        />

        {/* 加载态 */}
        {loading && (
          <div className="weather-loading text-center text-white py-16">
            <div className="weather-spinner mx-auto mb-4" />
            <p className="font-mono text-sm tracking-wider">查询中...</p>
          </div>
        )}

        {/* 错误态 */}
        {error && !loading && (
          <div className="weather-error text-center text-white py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-mono text-sm">{error}</p>
          </div>
        )}

        {/* 空状态：尚未查询 */}
        {!loading && !error && !weather && (
          <EmptyState />
        )}

        {/* 天气数据展示 */}
        {!loading && !error && weather && city && (
          <div className="weather-content space-y-6">
            <CurrentWeather city={city} weather={weather} />
            <WeatherDetails weather={weather} />
            <WeatherForecast daily={weather.daily} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== 搜索框 + 候选下拉 ===== */
function SearchBar({ search, setSearch, results, showResults, setShowResults, onSelect }) {
  const wrapRef = useRef(null)

  // 点击外部关闭候选列表
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowResults])

  return (
    <div ref={wrapRef} className="relative mb-8">
      <div className="weather-search-wrap relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => results.length && setShowResults(true)}
          placeholder="输入城市名，例如：北京、上海、东京"
          className="weather-input w-full bg-white/15 backdrop-blur-md text-white placeholder-white/60
                     border border-white/30 rounded-2xl px-5 py-3.5 pr-12
                     font-sans text-sm outline-none transition-all
                     focus:bg-white/25 focus:border-white/50"
        />
        <span className="weather-search-icon absolute right-5 top-1/2 -translate-y-1/2 text-white/70 text-lg">
          🔍
        </span>
      </div>

      {/* 候选城市下拉 */}
      {showResults && results.length > 0 && (
        <ul className="weather-dropdown absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md
                       rounded-xl shadow-2xl overflow-hidden z-20 max-h-72 overflow-y-auto">
          {results.map((item) => {
            // 城市名、一级行政区、国家名分别加上中文翻译括号
            const cityText = formatGeoWithZh(item.name)
            const stateText = item.adm1 ? formatGeoWithZh(item.adm1) : ''
            const countryText = item.country ? formatGeoWithZh(item.country) : ''
            const subText = [stateText, countryText].filter(Boolean).join(' · ')
            return (
              <li
                key={item.id || `${item.lat},${item.lon}`}
                onClick={() => onSelect(item)}
                className="weather-dropdown-item px-5 py-3 cursor-pointer transition-colors
                           hover:bg-vermilion/10 border-b border-ink/5 last:border-b-0"
              >
                <div className="font-sans text-ink text-sm font-medium leading-snug">
                  {cityText}
                </div>
                {subText ? (
                  <div className="font-mono text-xs text-muted mt-0.5 leading-snug break-all">
                    {subText}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {/* 搜索无结果提示 */}
      {showResults && results.length === 0 && search.trim() && (
        <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md
                        rounded-xl shadow-2xl px-5 py-4 z-20">
          <p className="text-muted text-sm font-sans">未找到匹配的城市</p>
        </div>
      )}
    </div>
  )
}

/* ===== 空状态 ===== */
function EmptyState() {
  return (
    <div className="weather-empty text-center text-white py-20">
      <p className="text-6xl mb-6">🌍</p>
      <p className="font-serif text-xl mb-2">查询任意城市的天气</p>
      <p className="font-mono text-sm text-white/70">数据来源 · 和风天气 QWeather</p>
    </div>
  )
}

/* ===== 当前天气主卡片 ===== */
function CurrentWeather({ city, weather }) {
  // 和风实时天气字段：temp, feelsLike, icon, text
  const now = weather.now || {}
  const info = getIconInfo(now.icon || 999)
  // 如实时接口失败，兜底用 daily 第 0 天显示
  const dailyFirst = weather.daily?.[0]
  const temp = now.temp ?? dailyFirst?.tempMax ?? '--'
  const tempMax = dailyFirst?.tempMax
  const tempMin = dailyFirst?.tempMin
  const feelsLike = now.feelsLike ?? '--'

  // 顶部城市地区信息：显示「原名 · 国家」并在后面追加中文翻译
  const admin1Text = city.admin1 ? formatGeoWithZh(city.admin1) : ''
  const countryText = city.country ? formatGeoWithZh(city.country) : ''
  const subTitle = [admin1Text, countryText].filter(Boolean).join(' · ') || '当前位置'
  const cityTitle = formatGeoWithZh(city.name)

  return (
    <section className="weather-card current-card rounded-3xl p-8 md:p-10 text-center">
      <p className="font-mono text-xs text-white/70 tracking-widest mb-2 uppercase">
        {subTitle}
      </p>
      <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">{cityTitle}</h2>

      <div className="weather-icon text-7xl md:text-8xl mb-4">{info.icon}</div>

      <div className="weather-temp font-serif text-7xl md:text-8xl text-white mb-2">
        {Math.round(Number(temp))}°
      </div>
      <p className="font-sans text-white/90 text-lg mb-1">
        {now.text || info.desc}
      </p>
      <p className="font-mono text-xs text-white/60">
        体感 {Number.isFinite(Number(feelsLike)) ? Math.round(Number(feelsLike)) : feelsLike}°C
        {(tempMax ?? tempMin) ? ` · 今日 ${Math.round(Number(tempMin))}°~${Math.round(Number(tempMax))}°` : ''}
      </p>
    </section>
  )
}

/* ===== 详细信息网格 ===== */
function WeatherDetails({ weather }) {
  const now = weather.now || {}
  // 和风字段：humidity（%）、windSpeed（km/h）、windDir（中文风向）、windScale（1-17 级）
  // pressure（hPa）、feelsLike（°C）、uv 来自 indices
  const uv = weather.indices
  const items = [
    {
      label: '体感温度',
      value: Number.isFinite(Number(now.feelsLike)) ? `${Math.round(Number(now.feelsLike))}°C` : '--',
      icon: '🌡️',
    },
    {
      label: '相对湿度',
      value: Number.isFinite(Number(now.humidity)) ? `${Math.round(Number(now.humidity))}%` : '--',
      icon: '💧',
    },
    {
      label: '风速',
      value: Number.isFinite(Number(now.windSpeed)) ? `${Math.round(Number(now.windSpeed))} km/h` : '--',
      sub: (now.windDir || '') + (now.windScale ? ` · ${now.windScale} 级` : ''),
      icon: '🌬️',
    },
    {
      label: '气压',
      value: Number.isFinite(Number(now.pressure)) ? `${Math.round(Number(now.pressure))} hPa` : '--',
      icon: '📊',
    },
    {
      label: '紫外线指数',
      value: uv?.level ? `${uv.level}` : '--',
      sub: uv?.level ? `等级：${uv.category || uvCategory(uv.level)}` : (uv?.category ? `等级：${uv.category}` : '无数据'),
      icon: '☀️',
    },
    {
      label: '紫外线建议',
      value: uv?.text ? uv.text.slice(0, 10) + (uv.text.length > 10 ? '…' : '') : '--',
      icon: '🧴',
    },
    {
      label: '云量',
      value: Number.isFinite(Number(now.cloud)) ? `${Math.round(Number(now.cloud))}%` : '--',
      icon: '☁️',
    },
    {
      label: '能见度',
      value: Number.isFinite(Number(now.vis)) ? `${Math.round(Number(now.vis))} km` : '--',
      icon: '👁️',
    },
  ]

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="weather-card detail-card rounded-2xl p-4 md:p-5 text-center"
        >
          <div className="text-2xl mb-2">{it.icon}</div>
          <div className="font-mono text-xs text-white/60 mb-1">{it.label}</div>
          <div className="font-serif text-xl md:text-2xl text-white">{it.value}</div>
          {it.sub && <div className="font-sans text-xs text-white/70 mt-1">{it.sub}</div>}
        </div>
      ))}
    </section>
  )
}

/* ===== 7天预报 ===== */
function WeatherForecast({ daily }) {
  if (!daily) return null

  // 计算全周温度范围，用于温度条相对长度可视化
  const allTemps = []
  daily.forEach((d) => {
    if (Number.isFinite(Number(d.tempMax))) allTemps.push(Number(d.tempMax))
    if (Number.isFinite(Number(d.tempMin))) allTemps.push(Number(d.tempMin))
  })
  const minTemp = allTemps.length ? Math.min(...allTemps) : 0
  const maxTemp = allTemps.length ? Math.max(...allTemps) : 1
  const range = Math.max(maxTemp - minTemp, 1)

  return (
    <section className="weather-card forecast-card rounded-3xl p-6 md:p-8">
      <h3 className="font-serif text-white text-xl mb-5 flex items-center gap-2">
        <span>📅</span> 未来 7 天
      </h3>
      <ul className="space-y-2">
        {daily.map((day) => {
          const info = getIconInfo(day.iconDay || day.iconNight || 999)
          // 白天的天气描述优先（和风每日有 textDay / textNight）
          const desc = day.textDay || day.textNight || info.desc
          const { date: md, weekday } = formatDate(day.fxDate)
          const tMax = Number(day.tempMax)
          const tMin = Number(day.tempMin)
          // 温度条左右偏移比例（基于全周温度区间）
          const leftPercent = Number.isFinite(tMin) ? ((tMin - minTemp) / range) * 100 : 0
          const widthPercent = (Number.isFinite(tMax) && Number.isFinite(tMin))
            ? ((tMax - tMin) / range) * 100
            : 20

          return (
            <li
              key={day.fxDate}
              className="forecast-row flex items-center gap-3 md:gap-4 py-2.5 border-b border-white/10 last:border-b-0"
            >
              <div className="forecast-date w-16 md:w-20 shrink-0">
                <div className="font-sans text-white text-sm">{weekday}</div>
                <div className="font-mono text-xs text-white/60">{md}</div>
              </div>
              <div className="forecast-icon text-xl w-8 text-center shrink-0">{info.icon}</div>
              <div className="forecast-desc hidden md:block w-20 shrink-0 font-sans text-white/80 text-xs">
                {desc}
              </div>
              <div className="forecast-temp-low font-mono text-white/60 text-sm w-10 text-right shrink-0">
                {Number.isFinite(tMin) ? Math.round(tMin) : '--'}°
              </div>
              <div className="forecast-bar-wrap relative flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="forecast-bar absolute h-full rounded-full"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${Math.max(widthPercent, 4)}%`,
                    background: 'linear-gradient(90deg, #6BCBFF, #FFD66B, #FF8C66)',
                  }}
                />
              </div>
              <div className="forecast-temp-high font-mono text-white text-sm w-10 text-right shrink-0">
                {Number.isFinite(tMax) ? Math.round(tMax) : '--'}°
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
