import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/snake.css'

export default function SnakePage() {
  const rafRef = useRef(null)

  useEffect(() => {
    /* ========================================================
       NEON SERPENT — 霓虹蛇
       单文件 Canvas 贪吃蛇 · 含难度/地形/移动端/暂停
       ======================================================== */

    // ---------- 常量 ----------
    const GRID = 22;                    // 网格数 (22x22)
    const DIFFICULTY = {
      easy:   { speed: 150, label: 'EASY',   mult: 1, desc: '慢速 · ×1' },
      normal: { speed: 110, label: 'NORMAL', mult: 2, desc: '常速 · ×2' },
      hard:   { speed: 80,  label: 'HARD',   mult: 3, desc: '高速 · ×3' },
      insane: { speed: 55,  label: 'INSANE', mult: 5, desc: '极速 · ×5' },
    };
    const BASE_FOOD_SCORE = 10;         // 单个食物基础分

    // ---------- 地形定义 ----------
    // 每个地形返回障碍物坐标数组 [{x,y}, ...]
    const TERRAINS = {
      classic: {
        name: 'CLASSIC',
        desc: '无障碍 · 经典',
        icon: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
        build: () => []
      },
      walls: {
        name: 'WALLS',
        desc: '内壁 · 四角',
        icon: [1,1,0,1,1, 1,0,0,0,1, 0,0,0,0,0, 1,0,0,0,1, 1,1,0,1,1],
        build: (g) => {
          const obs = [];
          const s = 4; // 角落L型大小（加大，更远更明显）
          for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
            if (i === s-1 || j === s-1) { // 只保留L型边缘
              obs.push({x:i, y:j});
              obs.push({x:g-1-i, y:j});
              obs.push({x:i, y:g-1-j});
              obs.push({x:g-1-i, y:g-1-j});
            }
          }
          return obs;
        }
      },
      maze: {
        name: 'MAZE',
        desc: '方阵 · 环墙',
        icon: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
        build: (g) => {
          const obs = [];
          const mid = Math.floor(g/2);
          const r = 5; // 环墙距中心半径（远离出生点）
          // 上下两条横墙（留缺口）
          for (let i = mid-r; i <= mid+r; i++) {
            if (i !== mid-1 && i !== mid && i !== mid+1) { // 中央留通道口
              obs.push({x:i, y:mid-r});
              obs.push({x:i, y:mid+r});
            }
          }
          // 左右两条竖墙（留缺口）
          for (let i = mid-r; i <= mid+r; i++) {
            if (i !== mid-1 && i !== mid && i !== mid+1) {
              obs.push({x:mid-r, y:i});
              obs.push({x:mid+r, y:i});
            }
          }
          return obs;
        }
      },
      pillars: {
        name: 'PILLARS',
        desc: '柱阵 · 散布',
        icon: [0,1,0,1,0, 1,0,0,0,1, 0,0,0,0,0, 1,0,0,0,1, 0,1,0,1,0],
        build: (g) => {
          const obs = [];
          const mid = Math.floor(g/2);
          // 2x2 柱子，分布在远离中心的外环位置
          const spots = [
            {x: 4, y: 4}, {x: mid, y: 4}, {x: g-5, y: 4},
            {x: 4, y: mid},                 {x: g-5, y: mid},
            {x: 4, y: g-5}, {x: mid, y: g-5}, {x: g-5, y: g-5},
          ];
          spots.forEach(p => {
            obs.push({x:p.x, y:p.y});
            obs.push({x:p.x+1, y:p.y});
            obs.push({x:p.x, y:p.y+1});
            obs.push({x:p.x+1, y:p.y+1});
          });
          return obs;
        }
      },
      tunnel: {
        name: 'TUNNEL',
        desc: '隧道 · 狭道',
        icon: [1,0,1,0,1, 0,0,0,0,0, 1,0,1,0,1, 0,0,0,0,0, 1,0,1,0,1],
        build: (g) => {
          const obs = [];
          const mid = Math.floor(g/2);
          const off = 5; // 墙距中心偏移（远离出生点）
          // 上下两条横墙，留缺口
          for (let x = 2; x < g-2; x++) {
            if (x % 4 !== 0) {
              obs.push({x, y: mid-off});
              obs.push({x, y: mid+off});
            }
          }
          // 左右两条竖墙，留缺口
          for (let y = 2; y < g-2; y++) {
            if (y % 4 !== 0) {
              obs.push({x: mid-off, y});
              obs.push({x: mid+off, y});
            }
          }
          return obs;
        }
      },
    };

    // ---------- 皮肤定义 ----------
    // head/tail: [r,g,b]；rainbow 类型按时间和位置动态计算
    // glow: "r,g,b" 用于头部光晕
    const SKINS = {
      neon:    { name:'NEON',    cost:0,    head:[0,240,255],   tail:[255,43,214], glow:'0,240,255' },
      inferno: { name:'INFERNO', cost:200,  head:[255,200,60],  tail:[255,40,40],  glow:'255,100,40' },
      matrix:  { name:'MATRIX',  cost:500,  head:[140,255,90],  tail:[0,170,70],   glow:'0,255,120' },
      violet:  { name:'VIOLET',  cost:800,  head:[185,130,255], tail:[255,80,200], glow:'160,100,255' },
      gold:    { name:'GOLD',    cost:1500, head:[255,238,130], tail:[255,150,30], glow:'255,200,60' },
      ice:     { name:'ICE',     cost:2500, head:[225,245,255], tail:[70,150,255], glow:'180,230,255' },
      rainbow: { name:'RAINBOW', cost:5000, rainbow:true,       glow:'255,255,255' },
    };

    // HSL → RGB（用于 rainbow 皮肤）
    function hslToRgb(h, s, l) {
      s /= 100; l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)];
    }

    // ---------- DOM ----------
    const $ = (id) => document.getElementById(id);
    const menuScreen = $('menu');
    const gameScreen = $('game');
    const canvas = $('gameCanvas');
    const ctx = canvas.getContext('2d');
    const diffGrid = $('diffGrid');
    const terrainGrid = $('terrainGrid');
    const skinGrid = $('skinGrid');
    const wrapToggle = $('wrapToggle');
    const startBtn = $('startBtn');
    const pauseBtn = $('pauseBtn');
    const resumeBtn = $('resumeBtn');
    const restartBtn = $('restartBtn');
    const pauseMenuBtn = $('pauseMenuBtn');
    const overMenuBtn = $('overMenuBtn');
    const pauseOverlay = $('pauseOverlay');
    const overOverlay = $('overOverlay');
    const newRecord = $('newRecord');
    const finalScore = $('finalScore');
    const finalLen = $('finalLen');
    const finalTotal = $('finalTotal');
    const hudScore = $('hudScore');
    const hudLen = $('hudLen');
    const hudMult = $('hudMult');
    const hiScoreEl = $('hiScore');
    const totalScoreEl = $('totalScore');
    const toast = $('toast');

    // ---------- 状态 ----------
    let state = {
      mode: 'menu',          // menu | playing | paused | over
      difficulty: 'normal',
      terrain: 'classic',
      snake: [],
      dir: {x:1, y:0},
      appliedDir: {x:1, y:0}, // 上一步实际移动方向，用于防止 180° 反转
      food: null,
      obstacles: [],
      wrap: false,            // 当前局是否边界环绕（由 wrapMode 决定）
      wrapMode: true,         // 穿墙模式开关（菜单可切换，持久化）
      score: 0,
      best: 0,
      totalScore: 0,         // 可用积分（既是累计分也是皮肤兑换货币）
      speed: 110,
      mult: 2,               // 当前难度加分倍率
      lastStep: 0,
      rafId: null,
      cellSize: 20,
      foodPulse: 0,
      particles: [],
      deathFlash: 0,
      unlockedSkins: ['neon'], // 已解锁皮肤
      currentSkin: 'neon',     // 当前选中皮肤
    };

    // ---------- 初始化菜单 ----------
    function buildTerrainGrid() {
      terrainGrid.innerHTML = '';
      Object.entries(TERRAINS).forEach(([key, t]) => {
        const div = document.createElement('div');
        div.className = 'opt' + (key === 'classic' ? ' selected' : '');
        div.dataset.terrain = key;
        // 图标
        const icon = document.createElement('div');
        icon.className = 'terrain-icon';
        t.icon.forEach(v => {
          const i = document.createElement('i');
          if (v) i.className = 'on';
          icon.appendChild(i);
        });
        div.appendChild(icon);
        const name = document.createElement('div');
        name.className = 'opt-name';
        name.textContent = t.name;
        div.appendChild(name);
        const desc = document.createElement('div');
        desc.className = 'opt-desc';
        desc.textContent = t.desc;
        div.appendChild(desc);
        div.addEventListener('click', () => {
          terrainGrid.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
          div.classList.add('selected');
          state.terrain = key;
        });
        terrainGrid.appendChild(div);
      });
    }

    diffGrid.querySelectorAll('.opt').forEach(o => {
      o.addEventListener('click', () => {
        diffGrid.querySelectorAll('.opt').forEach(x => x.classList.remove('selected'));
        o.classList.add('selected');
        state.difficulty = o.dataset.diff;
      });
    });

    // ---------- 读取最高分 / 总分 / 皮肤 ----------
    function loadBest() {
      try {
        state.best = parseInt(localStorage.getItem('neonSerpentBest') || '0', 10) || 0;
      } catch(e) { state.best = 0; }
      try {
        state.totalScore = parseInt(localStorage.getItem('neonSerpentTotal') || '0', 10) || 0;
      } catch(e) { state.totalScore = 0; }
      try {
        const u = JSON.parse(localStorage.getItem('neonSerpentUnlocked') || '["neon"]');
        state.unlockedSkins = Array.isArray(u) && u.length ? u : ['neon'];
      } catch(e) { state.unlockedSkins = ['neon']; }
      try {
        const s = localStorage.getItem('neonSerpentSkin');
        if (s && SKINS[s]) state.currentSkin = s;
      } catch(e) {}
      // 兜底：确保当前皮肤已解锁
      if (state.unlockedSkins.indexOf(state.currentSkin) === -1) state.currentSkin = 'neon';
      // 读取穿墙模式开关（默认开启）
      try {
        const w = localStorage.getItem('neonSerpentWrap');
        if (w === '0' || w === 'false') state.wrapMode = false;
        else state.wrapMode = true;
      } catch(e) { state.wrapMode = true; }
      hiScoreEl.textContent = state.best;
      totalScoreEl.textContent = state.totalScore;
    }
    function saveBest() {
      try { localStorage.setItem('neonSerpentBest', String(state.best)); } catch(e) {}
    }
    function saveTotal() {
      try { localStorage.setItem('neonSerpentTotal', String(state.totalScore)); } catch(e) {}
    }
    function saveSkins() {
      try {
        localStorage.setItem('neonSerpentUnlocked', JSON.stringify(state.unlockedSkins));
        localStorage.setItem('neonSerpentSkin', state.currentSkin);
      } catch(e) {}
    }

    // ---------- 皮肤商店构建 ----------
    function skinPreviewGradient(key) {
      const s = SKINS[key];
      if (s.rainbow) {
        return 'linear-gradient(90deg,#ff3860,#ffb627,#00ff9d,#00f0ff,#7b5cff,#ff2bd6)';
      }
      const h = 'rgb(' + s.head.join(',') + ')';
      const t = 'rgb(' + s.tail.join(',') + ')';
      return 'linear-gradient(90deg,' + h + ',' + t + ')';
    }
    function buildSkinGrid() {
      skinGrid.innerHTML = '';
      Object.entries(SKINS).forEach(([key, sk]) => {
        const div = document.createElement('div');
        const unlocked = state.unlockedSkins.indexOf(key) !== -1;
        const selected = state.currentSkin === key;
        div.className = 'skin' + (selected ? ' selected' : '') + (unlocked ? '' : ' locked');
        div.dataset.skin = key;

        const sw = document.createElement('div');
        sw.className = 'swatch';
        sw.style.background = skinPreviewGradient(key);
        div.appendChild(sw);

        const name = document.createElement('div');
        name.className = 'skin-name';
        name.textContent = sk.name;
        div.appendChild(name);

        const cost = document.createElement('div');
        cost.className = 'skin-cost';
        if (unlocked) {
          cost.classList.add('owned');
          cost.textContent = selected ? '已装备' : '点击装备';
        } else {
          cost.textContent = sk.cost + ' 积分';
          if (state.totalScore < sk.cost) cost.classList.add('too-expensive');
        }
        div.appendChild(cost);

        div.addEventListener('click', () => onSkinClick(key));
        skinGrid.appendChild(div);
      });
    }
    function onSkinClick(key) {
      const sk = SKINS[key];
      const unlocked = state.unlockedSkins.indexOf(key) !== -1;
      if (unlocked) {
        // 装备
        state.currentSkin = key;
        saveSkins();
        buildSkinGrid();
        showToast('已装备 ' + sk.name);
      } else {
        // 兑换
        if (state.totalScore < sk.cost) {
          showToast('积分不足，还需 ' + (sk.cost - state.totalScore));
          return;
        }
        state.totalScore -= sk.cost;
        state.unlockedSkins.push(key);
        state.currentSkin = key;
        saveTotal();
        saveSkins();
        totalScoreEl.textContent = state.totalScore;
        buildSkinGrid();
        showToast('已解锁并装备 ' + sk.name);
      }
    }

    // ---------- 穿墙模式开关 ----------
    function syncWrapToggle() {
      wrapToggle.classList.toggle('on', state.wrapMode);
    }
    wrapToggle.addEventListener('click', () => {
      state.wrapMode = !state.wrapMode;
      try { localStorage.setItem('neonSerpentWrap', state.wrapMode ? '1' : '0'); } catch(e) {}
      syncWrapToggle();
      showToast(state.wrapMode ? '穿墙模式：开启' : '穿墙模式：关闭');
    });

    // ---------- Canvas 尺寸 ----------
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.cellSize = rect.width / GRID;
    }
    function onResize() {
      if (state.mode !== 'menu') resizeCanvas();
    }
    window.addEventListener('resize', onResize);
    // 移动端横竖屏切换（部分浏览器不触发 resize）
    function onOrientationChange() {
      setTimeout(() => { if (state.mode !== 'menu') resizeCanvas(); }, 200);
    }
    window.addEventListener('orientationchange', onOrientationChange);

    // ---------- 开始游戏 ----------
    function startGame() {
      // 取消已存在的动画循环，避免"再来一局"时出现双重循环
      if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; rafRef.current = null; }

      const mid = Math.floor(GRID/2);
      state.snake = [
        {x: mid-1, y: mid},
        {x: mid-2, y: mid},
        {x: mid-3, y: mid},
      ];
      state.dir = {x:1, y:0};
      state.appliedDir = {x:1, y:0};
      state.score = 0;
      state.speed = DIFFICULTY[state.difficulty].speed;
      state.mult = DIFFICULTY[state.difficulty].mult;
      state.obstacles = TERRAINS[state.terrain].build(GRID);
      // 穿墙模式由菜单独立开关控制，与地形无关
      state.wrap = state.wrapMode;
      // 安全过滤：清除蛇出生点周围障碍物，防止"出生即死"
      // 安全区 x: mid-4..mid+4, y: mid-3..mid+3（地形障碍已在 mid±5 外，此处仅作兜底）
      state.obstacles = state.obstacles.filter(o => {
        const inCorridor = o.x >= mid-4 && o.x <= mid+4 && o.y >= mid-3 && o.y <= mid+3;
        return !inCorridor;
      });
      state.particles = [];
      state.deathFlash = 0;
      state.foodPulse = 0;
      spawnFood();
      updateHUD();

      menuScreen.classList.remove('active');
      gameScreen.classList.add('active');
      pauseOverlay.classList.remove('show');
      overOverlay.classList.remove('show');

      state.mode = 'playing';
      // 等待布局完成后调整canvas
      requestAnimationFrame(() => {
        resizeCanvas();
        state.lastStep = performance.now();
        state.rafId = requestAnimationFrame(loop);
        rafRef.current = state.rafId;
      });
    }

    // ---------- 生成食物 ----------
    function spawnFood() {
      const blocked = new Set();
      state.snake.forEach(s => blocked.add(s.x + ',' + s.y));
      state.obstacles.forEach(o => blocked.add(o.x + ',' + o.y));
      const free = [];
      for (let x = 0; x < GRID; x++) {
        for (let y = 0; y < GRID; y++) {
          if (!blocked.has(x + ',' + y)) free.push({x, y});
        }
      }
      if (free.length === 0) {
        // 通关了——视为胜利结束
        state.food = null;
        gameOver(true);
        return;
      }
      state.food = free[Math.floor(Math.random() * free.length)];
    }

    // ---------- 主循环 ----------
    function loop(now) {
      if (state.mode === 'menu') return;
      if (state.mode === 'playing') {
        const dt = now - state.lastStep;
        if (dt >= state.speed) {
          step();
          state.lastStep = now;
        }
        state.foodPulse += 0.08;
      }
      // 粒子和死亡闪光在 playing / over 状态下都更新（paused 时冻结）
      if (state.mode === 'playing' || state.mode === 'over') {
        updateParticles();
      }
      render();
      state.rafId = requestAnimationFrame(loop);
      rafRef.current = state.rafId;
    }

    // ---------- 单步移动 ----------
    function step() {
      // 方向已在 setDirection 中即时应用，这里直接使用 state.dir

      const head = state.snake[0];
      let newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

      // 边界处理：穿墙模式则环绕到对侧，否则撞墙死亡
      if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
        if (state.wrap) {
          // 环绕：取模映射到对侧
          newHead.x = (newHead.x % GRID + GRID) % GRID;
          newHead.y = (newHead.y % GRID + GRID) % GRID;
        } else {
          gameOver(false);
          return;
        }
      }
      // 碰撞：障碍物（仅非穿墙地形才有；穿墙+无障碍地形不会触发）
      for (let i = 0; i < state.obstacles.length; i++) {
        const o = state.obstacles[i];
        if (o.x === newHead.x && o.y === newHead.y) {
          gameOver(false);
          return;
        }
      }
      // 碰撞：自身（除尾巴，因为尾巴会移动）—— 穿墙模式下唯一的死亡条件
      const willGrow = state.food && newHead.x === state.food.x && newHead.y === state.food.y;
      const checkLen = willGrow ? state.snake.length : state.snake.length - 1;
      for (let i = 0; i < checkLen; i++) {
        if (state.snake[i].x === newHead.x && state.snake[i].y === newHead.y) {
          gameOver(false);
          return;
        }
      }

      state.snake.unshift(newHead);

      if (willGrow) {
        state.score += BASE_FOOD_SCORE * state.mult;
        spawnFoodParticles(state.food.x, state.food.y);
        spawnFood();
        updateHUD();
      } else {
        state.snake.pop();
      }
      // 锁定本步实际移动方向，防止极端帧内的自碰问题
      state.appliedDir.x = state.dir.x;
      state.appliedDir.y = state.dir.y;
    }

    // ---------- 粒子 ----------
    function spawnFoodParticles(gx, gy) {
      const cs = state.cellSize;
      const cx = gx * cs + cs/2;
      const cy = gy * cs + cs/2;
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
        const sp = 1 + Math.random() * 2.5;
        state.particles.push({
          x: cx, y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          color: i % 2 ? '#00ff9d' : '#00f0ff',
          size: 2 + Math.random() * 2
        });
      }
    }
    function spawnDeathParticles() {
      const cs = state.cellSize;
      state.snake.forEach((s, idx) => {
        const cx = s.x * cs + cs/2;
        const cy = s.y * cs + cs/2;
        for (let i = 0; i < 6; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 0.5 + Math.random() * 3;
          state.particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: 1,
            color: idx === 0 ? '#ff3860' : (Math.random() < 0.5 ? '#ff2bd6' : '#ff3860'),
            size: 2 + Math.random() * 3
          });
        }
      });
    }
    function updateParticles() {
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 0.025;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
      if (state.deathFlash > 0) state.deathFlash -= 0.04;
    }

    // ---------- 渲染 ----------
    function render() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cs = state.cellSize;

      // 背景
      ctx.clearRect(0, 0, w, h);

      // 死亡闪光
      if (state.deathFlash > 0) {
        ctx.fillStyle = 'rgba(255,56,96,' + (state.deathFlash * 0.3) + ')';
        ctx.fillRect(0, 0, w, h);
      }

      // 网格
      ctx.strokeStyle = 'rgba(0,240,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= GRID; i++) {
        ctx.moveTo(i * cs, 0);
        ctx.lineTo(i * cs, h);
        ctx.moveTo(0, i * cs);
        ctx.lineTo(w, i * cs);
      }
      ctx.stroke();

      // 障碍物
      state.obstacles.forEach(o => {
        const x = o.x * cs;
        const y = o.y * cs;
        ctx.fillStyle = 'rgba(123,92,255,0.18)';
        ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
        ctx.strokeStyle = 'rgba(123,92,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1.5, y + 1.5, cs - 3, cs - 3);
        // 内部纹理
        ctx.strokeStyle = 'rgba(123,92,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + cs - 3, y + cs - 3);
        ctx.stroke();
      });

      // 食物
      if (state.food) {
        const fx = state.food.x * cs + cs/2;
        const fy = state.food.y * cs + cs/2;
        const pulse = Math.sin(state.foodPulse) * 0.5 + 0.5;
        const r = cs * 0.32 + pulse * 2;
        // 光晕
        const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 2.5);
        grad.addColorStop(0, 'rgba(0,255,157,0.6)');
        grad.addColorStop(0.5, 'rgba(0,255,157,0.2)');
        grad.addColorStop(1, 'rgba(0,255,157,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fx, fy, r * 2.5, 0, Math.PI * 2);
        ctx.fill();
        // 核心
        ctx.fillStyle = '#00ff9d';
        ctx.beginPath();
        ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fill();
        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(fx - r*0.3, fy - r*0.3, r*0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 蛇（应用当前皮肤配色）
      const skin = SKINS[state.currentSkin] || SKINS.neon;
      const now = performance.now();
      const len = state.snake.length;
      state.snake.forEach((s, i) => {
        const x = s.x * cs;
        const y = s.y * cs;
        const t = i / Math.max(1, len - 1); // 0=头, 1=尾
        const isHead = i === 0;

        // 计算本段颜色
        let cr, cg, cb;
        if (skin.rainbow) {
          const hue = (t * 300 + now * 0.12) % 360;
          const rgb = hslToRgb(hue, 100, 60);
          cr = rgb[0]; cg = rgb[1]; cb = rgb[2];
        } else {
          cr = Math.round(skin.head[0] + (skin.tail[0] - skin.head[0]) * t);
          cg = Math.round(skin.head[1] + (skin.tail[1] - skin.head[1]) * t);
          cb = Math.round(skin.head[2] + (skin.tail[2] - skin.head[2]) * t);
        }

        if (isHead) {
          // 头部光晕
          const hx = x + cs/2;
          const hy = y + cs/2;
          const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, cs);
          grad.addColorStop(0, 'rgba(' + skin.glow + ',0.5)');
          grad.addColorStop(1, 'rgba(' + skin.glow + ',0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x - cs/2, y - cs/2, cs*2, cs*2);
        }

        const pad = isHead ? 1 : 2;
        ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
        ctx.fillRect(x + pad, y + pad, cs - pad*2, cs - pad*2);

        // 内部高光
        ctx.fillStyle = 'rgba(255,255,255,' + (isHead ? 0.35 : 0.15) + ')';
        ctx.fillRect(x + pad + 1, y + pad + 1, cs - pad*2 - 2, 2);

        // 头部眼睛
        if (isHead) {
          ctx.fillStyle = '#02101a';
          const ex = x + cs/2;
          const ey = y + cs/2;
          const dx = state.dir.x;
          const dy = state.dir.y;
          const off = cs * 0.22;
          const er = cs * 0.09;
          // 两只眼睛根据方向偏移
          const perpX = -dy;
          const perpY = dx;
          ctx.beginPath();
          ctx.arc(ex + dx*off + perpX*off*0.7, ey + dy*off + perpY*off*0.7, er, 0, Math.PI*2);
          ctx.arc(ex + dx*off - perpX*off*0.7, ey + dy*off - perpY*off*0.7, er, 0, Math.PI*2);
          ctx.fill();
        }
      });

      // 粒子
      state.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // ---------- HUD ----------
    function updateHUD() {
      hudScore.textContent = state.score;
      hudLen.textContent = state.snake.length;
      hudMult.textContent = '×' + state.mult;
    }

    // ---------- 暂停 ----------
    function pauseGame() {
      if (state.mode !== 'playing') return;
      state.mode = 'paused';
      pauseOverlay.classList.add('show');
      // 切换暂停按钮图标为播放
      pauseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
    function resumeGame() {
      if (state.mode !== 'paused') return;
      pauseOverlay.classList.remove('show');
      state.mode = 'playing';
      state.lastStep = performance.now();
      pauseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    }
    function togglePause() {
      if (state.mode === 'playing') pauseGame();
      else if (state.mode === 'paused') resumeGame();
    }

    // ---------- 游戏结束 ----------
    function gameOver(isWin) {
      state.mode = 'over';
      state.deathFlash = 1;
      if (!isWin) spawnDeathParticles();

      let isRecord = false;
      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
        hiScoreEl.textContent = state.best;
        isRecord = true;
      }
      // 累加到总分并持久化
      state.totalScore += state.score;
      saveTotal();
      totalScoreEl.textContent = state.totalScore;

      finalScore.textContent = state.score;
      finalLen.textContent = state.snake.length;
      finalTotal.textContent = state.totalScore;
      newRecord.classList.toggle('show', isRecord);

      // 延迟显示结束界面；若期间玩家已重开/返回菜单则不再弹出
      const endMode = state.mode;
      setTimeout(() => {
        if (state.mode === endMode) overOverlay.classList.add('show');
      }, 600);
    }

    // ---------- 返回菜单 ----------
    function returnToMenu() {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.rafId = null;
      rafRef.current = null;
      state.mode = 'menu';
      pauseOverlay.classList.remove('show');
      overOverlay.classList.remove('show');
      gameScreen.classList.remove('active');
      menuScreen.classList.add('active');
      pauseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      // 刷新皮肤商店（积分/解锁状态可能已变化）
      buildSkinGrid();
      totalScoreEl.textContent = state.totalScore;
    }

    // ---------- 方向控制（零延迟即时应用）----------
    function setDirection(dx, dy) {
      if (state.mode !== 'playing') return;
      // 不能 180° 反转 — 相对**本步**实际移动方向 state.dir（而非上一步 appliedDir）
      // 这样快速连按（如向右→向上→向左 合法L型转弯）不会被误丢
      if (dx === -state.dir.x && dy === -state.dir.y) return;
      // 同方向忽略
      if (dx === state.dir.x && dy === state.dir.y) return;
      // 即时更新方向，下一步 step 立即生效（零按键延迟）
      state.dir.x = dx;
      state.dir.y = dy;
    }

    // ---------- 键盘 ----------
    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      // Enter：游戏结束时再来一局
      if (k === 'enter') {
        if (state.mode === 'over') {
          e.preventDefault();
          // 失焦避免聚焦按钮拦截 Enter 触发其 click（如"返回菜单"）
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          startGame();
        }
        return;
      }
      if (k === ' ' || k === 'spacebar' || e.code === 'Space') {
        e.preventDefault();
        if (state.mode === 'menu') return;
        if (state.mode === 'over') return;
        togglePause();
        return;
      }
      if (k === 'escape') {
        if (state.mode === 'playing' || state.mode === 'paused') {
          e.preventDefault();
          returnToMenu();
        }
        return;
      }
      if (state.mode !== 'playing') return;
      if (k === 'arrowup' || k === 'w') { e.preventDefault(); setDirection(0,-1); }
      else if (k === 'arrowdown' || k === 's') { e.preventDefault(); setDirection(0,1); }
      else if (k === 'arrowleft' || k === 'a') { e.preventDefault(); setDirection(-1,0); }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); setDirection(1,0); }
    }
    document.addEventListener('keydown', onKeyDown);

    // ---------- 触摸滑动 ----------
    let touchStart = null;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, {passive:true});

    canvas.addEventListener('touchmove', (e) => {
      if (!touchStart || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStart.x;
      const dy = e.touches[0].clientY - touchStart.y;
      const threshold = 24;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        setDirection(dx > 0 ? 1 : -1, 0);
      } else {
        setDirection(0, dy > 0 ? 1 : -1);
      }
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, {passive:true});

    canvas.addEventListener('touchend', () => { touchStart = null; }, {passive:true});

    // ---------- 虚拟方向键 ----------
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      const handler = (e) => {
        e.preventDefault();
        if (dir === 'up') setDirection(0,-1);
        else if (dir === 'down') setDirection(0,1);
        else if (dir === 'left') setDirection(-1,0);
        else if (dir === 'right') setDirection(1,0);
      };
      btn.addEventListener('touchstart', handler, {passive:false});
      btn.addEventListener('mousedown', handler);
    });

    // ---------- 按钮事件 ----------
    // 通用：点击后失焦，避免按钮持有焦点拦截键盘（如 Enter 触发其 click）
    function bindBtn(el, fn) {
      el.addEventListener('click', () => { fn(); el.blur(); });
    }
    bindBtn(startBtn, startGame);
    bindBtn(pauseBtn, () => { if (state.mode !== 'over') togglePause(); });
    bindBtn(resumeBtn, resumeGame);
    bindBtn(restartBtn, startGame);
    bindBtn(pauseMenuBtn, returnToMenu);
    bindBtn(overMenuBtn, returnToMenu);

    // ---------- Toast ----------
    let toastTimer = null;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
    }

    // ---------- 启动 ----------
    buildTerrainGrid();
    loadBest();
    buildSkinGrid();
    syncWrapToggle();

    // 首次进入提示
    const introTimer = setTimeout(() => {
      showToast('使用方向键 / WASD / 滑动屏幕操作');
    }, 600);

    // 防止页面在移动端滚动
    function onDocTouchMove(e) {
      if (e.target.closest('.canvas-wrap') || e.target.closest('.dpad')) {
        e.preventDefault();
      }
    }
    document.addEventListener('touchmove', onDocTouchMove, {passive:false});

    // 防止双击缩放
    let lastTouch = 0;
    function onDocTouchEnd(e) {
      const now = Date.now();
      if (now - lastTouch < 300) e.preventDefault();
      lastTouch = now;
    }
    document.addEventListener('touchend', onDocTouchEnd, {passive:false});

    // ---------- 清理 ----------
    return () => {
      clearTimeout(introTimer);
      clearTimeout(toastTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.mode = 'menu';
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('touchmove', onDocTouchMove);
      document.removeEventListener('touchend', onDocTouchEnd);
    };
  }, [])

  return (
    <div className="snake-page">
      {/* 字体加载（原 head 中的 Google Fonts）*/}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap"
        rel="stylesheet"
      />

      {/* 返回按钮 */}
      <Link
        to="/"
        className="fixed top-4 right-4 z-[200] px-4 py-2 rounded-lg border border-cyan-400/50 bg-[rgba(10,18,38,0.8)] text-cyan-300 font-mono text-sm tracking-widest backdrop-blur-md hover:bg-cyan-500/20 hover:shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all"
      >
        ← 返回
      </Link>

      {/* 原始 HTML body 内容 */}
      <div className="scanlines"></div>
      <div className="vignette"></div>

      <div id="app">
        {/* ============ 主菜单 ============ */}
        <section id="menu" className="screen active">
          <div className="panel menu-card">
            <h1 className="brand">NEON SERPENT</h1>
            <div className="tagline">霓 虹 蛇 // SYS_v2.0<span className="blink">_</span></div>

            <div className="section-label">难度 // DIFFICULTY</div>
            <div className="opt-grid" id="diffGrid">
              <div className="opt" data-diff="easy">
                <div className="opt-name">EASY</div>
                <div className="opt-desc">慢速 · 加分 ×1</div>
              </div>
              <div className="opt selected" data-diff="normal">
                <div className="opt-name">NORMAL</div>
                <div className="opt-desc">常速 · 加分 ×2</div>
              </div>
              <div className="opt" data-diff="hard">
                <div className="opt-name">HARD</div>
                <div className="opt-desc">高速 · 加分 ×3</div>
              </div>
              <div className="opt" data-diff="insane">
                <div className="opt-name">INSANE</div>
                <div className="opt-desc">极速 · 加分 ×5</div>
              </div>
            </div>

            <div className="section-label">地形 // TERRAIN</div>
            <div className="opt-grid" id="terrainGrid">
              {/* 由 JS 生成 */}
            </div>

            <div className="section-label">穿墙模式 // WRAP MODE</div>
            <div className="wrap-toggle" id="wrapToggle">
              <div className="wrap-info">
                <div className="wrap-title">边界环绕</div>
                <div className="wrap-desc">蛇穿过边界从另一侧出现，仅自碰死亡</div>
              </div>
              <div className="switch" id="wrapSwitch">
                <div className="switch-knob"></div>
              </div>
            </div>

            <div className="section-label">皮肤 // SKINS</div>
            <div className="skin-grid" id="skinGrid">
              {/* 由 JS 生成 */}
            </div>

            <button className="start-btn" id="startBtn">START / 启 动</button>
            <div className="hi-score">
              <span>最高单局 HIGH: <b id="hiScore">0</b></span>
              <span style={{marginLeft:'14px'}}>可用积分 POINTS: <b id="totalScore">0</b></span>
            </div>
          </div>
        </section>

        {/* ============ 游戏屏幕 ============ */}
        <section id="game" className="screen">
          <div className="hud panel">
            <div className="stat score"><div className="k">Score</div><div className="v" id="hudScore">0</div></div>
            <div className="stat length"><div className="k">Length</div><div className="v" id="hudLen">3</div></div>
            <div className="stat level"><div className="k">Bonus</div><div className="v" id="hudMult">×2</div></div>
            <button className="icon-btn" id="pauseBtn" title="暂停 (空格)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            </button>
          </div>

          <div className="canvas-wrap">
            <span className="corner tl"></span><span className="corner tr"></span>
            <span className="corner bl"></span><span className="corner br"></span>
            <canvas id="gameCanvas"></canvas>

            {/* 暂停覆盖层 */}
            <div className="overlay" id="pauseOverlay">
              <div className="overlay-inner">
                <h2>PAUSED</h2>
                <div className="sub">// 系统挂起</div>
                <div className="btn-row">
                  <button className="btn primary" id="resumeBtn">继续 <span className="key">SPACE</span></button>
                  <button className="btn danger" id="pauseMenuBtn">返回菜单</button>
                </div>
              </div>
            </div>

            {/* 游戏结束覆盖层 */}
            <div className="overlay gameover" id="overOverlay">
              <div className="overlay-inner">
                <h2>GAME OVER</h2>
                <div className="sub">// 连接中断</div>
                <div className="new-record" id="newRecord">★ NEW RECORD ★</div>
                <div className="result-stats">
                  <div className="rs s1"><div className="k">Score</div><div className="v" id="finalScore">0</div></div>
                  <div className="rs s2"><div className="k">Length</div><div className="v" id="finalLen">0</div></div>
                  <div className="rs s3"><div className="k">Total</div><div className="v" id="finalTotal">0</div></div>
                </div>
                <div className="btn-row">
                  <button className="btn primary" id="restartBtn">再来一局 <span className="key">ENTER</span></button>
                  <button className="btn danger" id="overMenuBtn">返回菜单</button>
                </div>
              </div>
            </div>
          </div>

          {/* 移动端方向键 */}
          <div className="dpad">
            <div className="dpad-left">
              <div className="dpad-btn left" data-dir="left">◀</div>
              <div className="dpad-btn up" data-dir="up">▲</div>
              <div className="dpad-btn down" data-dir="down">▼</div>
              <div className="dpad-btn right" data-dir="right">▶</div>
            </div>
            <div className="dpad-center">
              SWIPE / TAP<div className="hint">滑动屏幕或点击按键</div>
            </div>
            <div className="dpad-right" style={{visibility:'hidden'}}></div>
          </div>
        </section>
      </div>

      <div className="toast" id="toast"></div>
    </div>
  )
}
