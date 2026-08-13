import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/portfolio.css'

const AVATAR_URL =
  'https://ts1.tc.mm.bing.net/th/id/OIP-C.gmfF1YtH16GzZrK7pBGpFwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'

const CONTAINER = 'mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,72px)] max-[600px]:px-5'

export default function PortfolioPage() {
  const [scrolled, setScrolled] = useState(false)
  const [today, setToday] = useState('')
  const [avatarFailed, setAvatarFailed] = useState(false)

  // 顶部导航滚动效果
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 日期显示
  useEffect(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setToday(`${y}.${m}.${day}`)
  }, [])

  // 滚动渐入动画
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    reveals.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative bg-cream text-ink font-sans leading-[1.65]">
      {/* 装饰色块 */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* 顶部导航 */}
      <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="logo">
          朱子睿<span className="dot">.</span>
        </div>
        <nav className="nav">
          <a href="#works">作品</a>
          <a href="#about">关于</a>
          <a href="#contact">联系</a>
        </nav>
        <div className="date">{today}</div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="hero">
          <div className={CONTAINER}>
            <div className="hero-grid">
              <div className="hero-left">
                <div className="eyebrow reveal visible">
                  <span className="bar" />
                  PORTFOLIO / 个人作品集
                </div>
                <h1 className="hero-name">
                  <span className="name-line">
                    <span>你好，我是</span>
                  </span>
                  <span className="name-line">
                    <span className="zhu">朱子睿</span>
                  </span>
                </h1>
                <p className="hero-subtitle">Frontend Developer &amp; Design Enthusiast.</p>
                <p className="hero-bio">
                  一名热爱创造的<span className="hl">前端开发者</span>，专注于用代码构建有温度、有质感的 Web 体验。
                  从实用工具到创意游戏，每一个项目都是一次对<span className="hl">美学与功能边界</span>的探索。
                  相信好的设计藏在细节里，好的作品让人会心一笑。
                </p>
              </div>

              <div className="hero-right">
                <div className="avatar-frame">
                  <div className="avatar-no">№ 001 / ZZR</div>
                  <div className="avatar-deco circle-1 animate-spin-slow" />
                  <div className="avatar-deco circle-2 animate-breath" />
                  <div className="avatar-fallback">朱</div>
                  <img
                    className="avatar-img"
                    src={AVATAR_URL}
                    alt="朱子睿的头像"
                    onError={() => setAvatarFailed(true)}
                    style={{ display: avatarFailed ? 'none' : undefined }}
                  />
                </div>
              </div>
            </div>

            <div className="hero-bottom">
              <div className="scroll-hint">
                <div className="arrow" />
                SCROLL / 向下探索
              </div>
              <div className="hero-bottom-meta">
                <div>
                  BASED IN<b>中国 · 地球</b>
                </div>
                <div>
                  STATUS<b>可接项目 ✦</b>
                </div>
                <div>
                  PROJECTS<b>4 个精选</b>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROJECTS ============ */}
        <section className="projects" id="works">
          <div className={CONTAINER}>
            <div className="section-label reveal">
              <span>
                <b>02</b> · SELECTED WORKS
              </span>
            </div>
            <div className="projects-head">
              <h2 className="projects-title reveal">
                精选<em>作品</em>。
              </h2>
              <div className="meta reveal reveal-delay-1">
                <b>4 个项目</b>
                <br />
                2024 — 2026
              </div>
            </div>

            <div className="projects-grid">
              {/* 卡片 1：记账小工具 */}
              <article className="card card-1 reveal reveal-delay-1">
                <div className="card-thumb thumb-accounting">
                  <div className="ta-phone">
                    <div className="ta-header">
                      <h4>记账小工具</h4>
                    </div>
                    <div className="ta-stats">
                      <div>
                        <div className="k">收入</div>
                        <div className="v i">¥0</div>
                      </div>
                      <div>
                        <div className="k">支出</div>
                        <div className="v e">¥0</div>
                      </div>
                      <div>
                        <div className="k">结余</div>
                        <div className="v b">¥0</div>
                      </div>
                    </div>
                    <div className="ta-form">
                      <div className="ta-row">
                        <div className="tb half" />
                        <div className="tb half" />
                      </div>
                      <div className="ta-row">
                        <div className="tb" />
                      </div>
                      <div className="ta-row">
                        <div className="tb" />
                        <div className="tb half" />
                      </div>
                      <div className="ta-btn" />
                    </div>
                    <div className="ta-records">
                      <div className="ta-rec">
                        <div className="ta-ico">🍜</div>
                        <div className="ta-info">
                          <div className="a">餐饮</div>
                          <div className="b">午餐 · 12:30</div>
                        </div>
                        <div className="ta-amt">-¥38</div>
                      </div>
                      <div className="ta-rec">
                        <div className="ta-ico" style={{ background: '#e8f5e9' }}>
                          💰
                        </div>
                        <div className="ta-info">
                          <div className="a">工资</div>
                          <div className="b">月发 · 今日</div>
                        </div>
                        <div className="ta-amt" style={{ color: '#4caf50' }}>
                          +¥8k
                        </div>
                      </div>
                      <div className="ta-rec">
                        <div className="ta-ico">🚗</div>
                        <div className="ta-info">
                          <div className="a">交通</div>
                          <div className="b">地铁 · 9:15</div>
                        </div>
                        <div className="ta-amt">-¥6</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <div className="card-num">№ 01 / PROJECT</div>
                    <div className="card-tags">
                      <span className="tag">HTML</span>
                      <span className="tag">LocalStorage</span>
                      <span className="tag acc">实用工具</span>
                    </div>
                  </div>
                  <h3 className="card-title">
                    <span className="small">Accounting Tool</span>记账小工具
                  </h3>
                  <p className="card-desc">
                    一个轻量级的日常收支记录工具。支持按月切换浏览、收入/支出分类统计、自定义日期与备注，
                    所有数据本地持久化。紫色渐变 UI 搭配细腻的卡片阴影，让「记账」不再是负担。
                  </p>
                  <Link to="/accounting" className="card-cta">
                    打开项目 <span className="arrow">→</span>
                  </Link>
                </div>
              </article>

              {/* 卡片 2：霓虹蛇 */}
              <article className="card card-2 reveal reveal-delay-2">
                <div className="card-thumb thumb-snake">
                  <div className="ts-canvas">
                    <div className="ts-title">
                      NEON
                      <br />
                      SERPENT
                    </div>
                    <div className="ts-sub">// SYS_v2.0</div>
                    <div className="ts-grid">
                      <div className="ts-snake h" style={{ gridColumn: 3, gridRow: 4 }} />
                      <div className="ts-snake" style={{ gridColumn: 4, gridRow: 4 }} />
                      <div className="ts-snake" style={{ gridColumn: 5, gridRow: 4 }} />
                      <div className="ts-snake" style={{ gridColumn: 5, gridRow: 5 }} />
                      <div className="ts-snake" style={{ gridColumn: 5, gridRow: 6 }} />
                      <div className="ts-snake" style={{ gridColumn: 4, gridRow: 6 }} />
                      <div className="ts-food" style={{ gridColumn: 7, gridRow: 3 }} />
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <div className="card-num">№ 02 / PROJECT</div>
                    <div className="card-tags">
                      <span className="tag">Canvas</span>
                      <span className="tag">Game</span>
                      <span className="tag acc">Cyberpunk</span>
                    </div>
                  </div>
                  <h3 className="card-title">
                    <span className="small">Neon Serpent</span>霓虹蛇
                  </h3>
                  <p className="card-desc">
                    一款赛博朋克风格的 Canvas 贪吃蛇。四档难度、五种地形、七款皮肤商店；
                    粒子特效、扫描线、霓虹发光、移动端滑动与虚拟按键。经典玩法的现代改造。
                  </p>
                  <Link to="/snake" className="card-cta">
                    打开项目 <span className="arrow">→</span>
                  </Link>
                </div>
              </article>

              {/* 卡片 3：作品集本身 */}
              <article className="card card-3 reveal reveal-delay-3">
                <div className="card-thumb thumb-portfolio">
                  <div className="tp-frame">
                    <div className="tp-bar">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="tp-body">
                      <div className="tp-line1" />
                      <div className="tp-line2" />
                      <div className="tp-line3" />
                      <div className="tp-card">
                        <div className="th" />
                        <div className="t1" />
                        <div className="t2" />
                      </div>
                    </div>
                  </div>
                  <div className="tp-badge">YOU ARE HERE ◎</div>
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <div className="card-num">№ 03 / PROJECT</div>
                    <div className="card-tags">
                      <span className="tag">HTML/CSS</span>
                      <span className="tag">Editorial</span>
                      <span className="tag acc">Motion</span>
                    </div>
                  </div>
                  <h3 className="card-title">
                    <span className="small">This Portfolio</span>个人作品集
                  </h3>
                  <p className="card-desc">
                    你正在浏览的这个网站。新编辑主义视觉：朱红主题呼应姓名，Playfair + JetBrains Mono 字体组合，
                    滚动渐入与卡片悬停微交互。单文件实现，无框架。
                  </p>
                  <span className="card-cta">
                    正在查看 <span className="arrow">⊙</span>
                  </span>
                </div>
              </article>

              {/* 卡片 4：天气查询 */}
              <article className="card card-4 reveal reveal-delay-4">
                <div className="card-thumb thumb-weather">
                  <div className="tw-glass">
                    <div className="tw-city">深圳</div>
                    <div className="tw-temp">28°</div>
                    <div className="tw-icon">⛅</div>
                    <div className="tw-desc">多云转晴</div>
                    <div className="tw-forecast">
                      <span>26°</span>
                      <div className="tw-bar" />
                      <span>32°</span>
                    </div>
                  </div>
                  <div className="tw-label">REAL-TIME · 和风天气</div>
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <div className="card-num">№ 04 / PROJECT</div>
                    <div className="card-tags">
                      <span className="tag">API</span>
                      <span className="tag">React</span>
                      <span className="tag acc">天气</span>
                    </div>
                  </div>
                  <h3 className="card-title">
                    <span className="small">Weather Query</span>天气查询
                  </h3>
                  <p className="card-desc">
                    基于和风天气 API 的实时天气查询工具。支持全球城市搜索、7 日预报、
                    详细气象指标（湿度/风速/紫外线）。玻璃拟态 UI 与天气主题渐变联动。
                  </p>
                  <Link to="/weather" className="card-cta">
                    打开项目 <span className="arrow">→</span>
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============ ABOUT ============ */}
        <section className="about" id="about">
          <div className={CONTAINER}>
            <div className="section-label reveal">
              <span>
                <b>03</b> · ABOUT ME
              </span>
            </div>
            <div className="about-grid">
              <div className="about-text reveal">
                <h2>
                  关于<em>我</em>。
                </h2>
                <p>
                  嘿，我是朱子睿。对我来说，写代码和画画没什么两样——都是在用工具表达脑子里的想法。
                  每一个像素的颜色、每一帧动画的时长、每一个按钮按下的反馈，都值得被认真对待。
                </p>
                <p>
                  我喜欢做「小而美」的东西。不需要复杂的框架，一个 HTML 文件就能承载完整的创意世界。
                  从记账工具里的一笔一画，到霓虹蛇游戏里的每一次蛇身转弯，背后都是无数次的打磨与调整。
                </p>
                <p>
                  工作之外，我还是一个纸质书爱好者、城市漫游者、偶尔的摄影师。
                  如果你也喜欢做一些有意思的小东西，欢迎来找我聊聊。
                </p>
              </div>

              <div className="about-right reveal reveal-delay-1">
                <div className="skills-wrap">
                  <div className="skills-head">
                    <h3>技能栈</h3>
                    <span className="count">/ SKILLSET</span>
                  </div>
                  <div className="skills-cloud">
                    <div className="skill">
                      HTML5<span className="n">★</span>
                    </div>
                    <div className="skill">
                      CSS3<span className="n">★</span>
                    </div>
                    <div className="skill">
                      JavaScript<span className="n">★</span>
                    </div>
                    <div className="skill">Canvas API</div>
                    <div className="skill">LocalStorage</div>
                    <div className="skill">
                      响应式设计<span className="n">★</span>
                    </div>
                    <div className="skill">UI/UX 设计</div>
                    <div className="skill">交互动效</div>
                    <div className="skill">游戏开发</div>
                    <div className="skill">排版设计</div>
                    <div className="skill">色彩理论</div>
                    <div className="skill">字体设计</div>
                  </div>
                </div>

                <div className="contact" id="contact">
                  <h4>联系方式 / GET IN TOUCH</h4>
                  <div className="contact-list">
                    <a href="mailto:hello@example.com" className="contact-item">
                      <svg
                        className="ico"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 7 9-7" />
                      </svg>
                      <span>hello@zhuzirui.dev</span>
                    </a>
                    <a href="#" className="contact-item">
                      <svg className="ico" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <span>github.com/zhuzirui</span>
                    </a>
                    <a href="#" className="contact-item">
                      <svg
                        className="ico"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>Shenzhen, China</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="site-footer">
          <div className={CONTAINER}>
            <div className="footer-top">
              <div className="footer-big reveal">
                LET&apos;S <em>CREATE</em>
                <br />
                <span className="outline">SOMETHING</span> ✦
              </div>
              <div className="footer-sub reveal reveal-delay-1">
                一起做点有意思的东西 · AVAILABLE FOR FREELANCE
              </div>
            </div>
            <div className="footer-bottom">
              <div>
                © 2026 朱子睿 · Made with <span className="heart">♥</span> and CSS
              </div>
              <div>v 1.0 · PORTFOLIO / NEO-EDITORIAL</div>
              <a href="#top" className="back-top" onClick={scrollToTop}>
                <span className="up">↑</span>
                回到顶部
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
