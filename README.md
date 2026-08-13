# 朱子睿 · 个人作品集

朱子睿的个人作品集网站，包含：

- **作品集主页**：个人介绍、作品展示、新编辑主义（Neo-Editorial）设计风格
- **记账工具**：个人收支记录与分类统计
- **贪吃蛇游戏**：赛博朋克风格的霓虹贪吃蛇小游戏
- **天气查询**：基于和风天气（QWeather）API 的全球城市天气查询

## 技术栈

- React 18（函数组件 + Hooks）
- Vite 5
- React Router DOM v6
- Tailwind CSS 3

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 5173）
npm run dev

# 启动和风天气代理服务器（开发天气功能需要，默认端口 8787）
# 新开一个终端执行：
npm run weather

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 目录结构

```
portfolio-project/
├── src/
│   ├── hooks/          # 自定义 Hook（天气相关）
│   ├── pages/          # 页面级组件
│   │   ├── PortfolioPage.jsx
│   │   ├── AccountingPage.jsx
│   │   ├── SnakePage.jsx
│   │   └── WeatherPage.jsx
│   ├── styles/         # 独立 CSS 文件
│   │   ├── portfolio.css
│   │   ├── snake.css
│   │   └── weather.css
│   ├── utils/          # 工具函数
│   ├── App.jsx         # 路由入口
│   ├── main.jsx        # 应用挂载入口
│   └── index.css       # 全局样式 + Tailwind 指令
├── server.js           # 和风天气本地代理服务器
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```
