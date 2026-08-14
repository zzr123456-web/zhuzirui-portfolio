/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Editorial 主题色（作品集）
        cream:     '#FAF7F2',
        'cream-2': '#F2EDE4',
        ink:       '#1A1A1A',
        vermilion: {
          DEFAULT: '#C8381D',
          light:   '#E5533A',
        },
        ochre:     '#D4A03C',
        forest:    '#2D4A3E',
        muted:     '#8A8178',
        'card-bg': '#FFFBF5',
        // Avatar 背景色扩展（与朱红体系保持一致，避免 hex 硬编码）
        inkblue:   '#2D4A6E',
        violet:    '#7B5CFF',
        teal:      '#2D8B8B',
        brown:     '#8B5A3C',
        // 霓虹蛇主题色
        neon: {
          bg:      '#03060d',
          bg1:     '#070d1a',
          cyan:    '#00f0ff',
          magenta: '#ff2bd6',
          green:   '#00ff9d',
          amber:   '#ffb627',
          red:     '#ff3860',
          violet:  '#7b5cff',
          txt:     '#cfe9ff',
          dim:     '#6f88b0',
        },
      },
      fontFamily: {
        // 衬线：Playfair Display（英文）+ Noto Serif SC（中文），降级到系统衬线
        serif:  ['"Playfair Display"', '"Noto Serif SC"', '"Songti SC"', '"SimSun"', 'Georgia', '"Times New Roman"', 'serif'],
        // 无衬线：Inter Tight（英文）+ 苹方/雅黑（中文系统），保证中文零依赖
        sans:   ['"Inter Tight"', '"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Arial', 'system-ui', 'sans-serif'],
        // 等宽：JetBrains Mono，降级到系统等宽
        mono:   ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', '"Courier New"', 'monospace'],
        // 霓虹蛇主题字体（Orbitron/Rajdhani/Share Tech Mono 有独立 @font-face）
        display:['"Orbitron"', 'system-ui', 'sans-serif'],
        tech:   ['"Share Tech Mono"', 'Menlo', 'Consolas', 'monospace'],
        rajdhani:['"Rajdhani"', '"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'breath': 'breath 4s ease-in-out infinite',
        'grid-drift': 'gridDrift 30s linear infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'blink': 'blink 1.2s steps(2) infinite',
        'pulse-soft': 'pulseSoft 1s ease-in-out infinite',
      },
      keyframes: {
        breath: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.6', boxShadow: '0 0 0 0 rgba(200,56,29,0.25)' },
          '50%':     { transform: 'scale(1.015)', opacity: '0.9', boxShadow: '0 0 0 10px rgba(200,56,29,0)' },
        },
        gridDrift: {
          from: { backgroundPosition: '0 0, 0 0' },
          to:   { backgroundPosition: '48px 48px, 48px 48px' },
        },
        shine: {
          '0%,100%': { left: '-50%' },
          '50%':     { left: '150%' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
        pulseSoft: {
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
