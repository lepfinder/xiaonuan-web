import { Hono } from "hono";
import db from "../db.js";

export const consoleRoute = new Hono();

function idToSerialNumber(id: number): number {
  const digits = [0, 1, 2, 3, 5, 6, 7, 8, 9];
  let rank = 459270 + id;
  let result = "";
  while (rank > 0) {
    const rem = rank % 9;
    result = digits[rem] + result;
    rank = Math.floor(rank / 9);
  }
  return parseInt(result, 10);
}

consoleRoute.get("/", (c) => {
  const totalInstalls = (db.prepare("SELECT COUNT(*) as count FROM devices").get() as any).count;
  const today = new Date().toISOString().slice(0, 10);
  const todayDAU = (db.prepare("SELECT COUNT(*) as count FROM daily_actives WHERE date = ?").get(today) as any).count;
  const newInstalls7d = (db.prepare("SELECT COUNT(*) as count FROM devices WHERE first_seen >= ?").get(Date.now() - 7 * 24 * 60 * 60 * 1000) as any).count;

  const last30Days = db.prepare(`
    SELECT date, COUNT(*) as dau FROM daily_actives
    WHERE date >= date('now', '-29 days') GROUP BY date ORDER BY date ASC
  `).all() as { date: string; dau: number }[];

  const osDist = db.prepare(`
    SELECT os, COUNT(*) as count FROM devices GROUP BY os ORDER BY count DESC
  `).all() as { os: string; count: number }[];

  const versionDist = db.prepare(`
    SELECT version, COUNT(*) as count FROM devices GROUP BY version ORDER BY count DESC LIMIT 8
  `).all() as { version: string; count: number }[];

  const recentInstallsRaw = db.prepare(`
    SELECT id, client_id, os, version, datetime(first_seen / 1000, 'unixepoch', 'localtime') as first_seen_str
    FROM devices ORDER BY first_seen DESC LIMIT 20
  `).all() as { id: number; client_id: string; os: string; version: string; first_seen_str: string }[];

  const recentInstalls = recentInstallsRaw.map(r => ({
    ...r,
    serialNumber: idToSerialNumber(r.id)
  }));

  const dauLabels = JSON.stringify(last30Days.map(d => d.date));
  const dauValues = JSON.stringify(last30Days.map(d => d.dau));
  const osLabels = JSON.stringify(osDist.map(d => d.os === 'darwin' ? 'macOS' : d.os === 'win32' ? 'Windows' : d.os));
  const osValues = JSON.stringify(osDist.map(d => d.count));
  const versionLabels = JSON.stringify(versionDist.map(d => `v${d.version}`));
  const versionValues = JSON.stringify(versionDist.map(d => d.count));

  const html = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>小暖运营控制台 | xiaonuan.me</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ---- 主题变量 ---- */
    :root, [data-theme="light"] {
      --bg: #f4f6fb;
      --surface: #ffffff;
      --surface2: #f0f2f7;
      --border: rgba(0,0,0,0.07);
      --text: #111827;
      --text-muted: #6b7280;
      --accent: #6366f1;
      --accent-light: rgba(99,102,241,0.1);
      --green: #059669;
      --green-light: rgba(5,150,105,0.08);
      --amber: #d97706;
      --amber-light: rgba(217,119,6,0.08);
      --blue: #2563eb;
      --blue-light: rgba(37,99,235,0.08);
      --red: #dc2626;
      --red-light: rgba(220,38,38,0.08);
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --chart-grid: rgba(0,0,0,0.05);
      --chart-tick: #9ca3af;
    }
    [data-theme="dark"] {
      --bg: #0d0f14;
      --surface: #161a23;
      --surface2: #1d2232;
      --border: rgba(255,255,255,0.07);
      --text: #e2e8f0;
      --text-muted: #64748b;
      --accent: #6366f1;
      --accent-light: rgba(99,102,241,0.15);
      --green: #10b981;
      --green-light: rgba(16,185,129,0.12);
      --amber: #f59e0b;
      --amber-light: rgba(245,158,11,0.12);
      --blue: #3b82f6;
      --blue-light: rgba(59,130,246,0.12);
      --red: #f87171;
      --red-light: rgba(248,113,113,0.1);
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
      --chart-grid: rgba(255,255,255,0.05);
      --chart-tick: #64748b;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif;
      font-size: 14px;
      min-height: 100vh;
      transition: background 0.2s, color 0.2s;
    }

    /* ---- 顶部导航 ---- */
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0 28px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background 0.2s, border-color 0.2s;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: -0.02em;
    }
    .logo-icon {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #6366f1, #818cf8);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(99,102,241,0.3);
    }
    .logo-icon svg { width: 13px; height: 13px; color: white; }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-meta {
      font-size: 12px;
      color: var(--text-muted);
      margin-right: 4px;
    }

    .btn-icon {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 7px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      color: var(--text-muted);
    }
    .btn-icon:hover { background: var(--border); }
    .btn-icon svg { width: 15px; height: 15px; }

    .btn-text {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 7px;
      height: 32px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      color: var(--text-muted);
      text-decoration: none;
      font-family: inherit;
    }
    .btn-text:hover { background: var(--border); color: var(--text); }
    .btn-text svg { width: 13px; height: 13px; }

    .btn-danger {
      background: var(--red-light);
      border-color: rgba(220,38,38,0.15);
      color: var(--red);
    }
    .btn-danger:hover { background: rgba(220,38,38,0.15); color: var(--red); }
    [data-theme="dark"] .btn-danger { border-color: rgba(248,113,113,0.2); }

    /* ---- 主内容 ---- */
    main { max-width: 1160px; margin: 0 auto; padding: 28px 28px 64px; }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin-bottom: 3px;
    }
    .page-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    /* ---- 统计卡片 ---- */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
      transition: background 0.2s, border-color 0.2s;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 10px;
    }
    .stat-value {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .stat-value.green { color: var(--green); }
    .stat-value.accent { color: var(--accent); }
    .stat-value.amber { color: var(--amber); }
    .stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

    /* ---- 图表区 ---- */
    .chart-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .chart-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .chart-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
      transition: background 0.2s, border-color 0.2s;
    }
    .chart-card h3 {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .chart-container { position: relative; height: 200px; }

    /* ---- 进度条区 ---- */
    .progress-row { display: flex; flex-direction: column; gap: 12px; }
    .progress-item {}
    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 12px;
    }
    .progress-label span:first-child { color: var(--text); font-weight: 500; }
    .progress-label span:last-child { color: var(--text-muted); }
    .progress-track {
      background: var(--surface2);
      border-radius: 4px;
      height: 5px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 4px;
      transition: width 0.6s ease;
    }

    /* ---- 表格 ---- */
    .table-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: background 0.2s, border-color 0.2s;
    }
    .table-header {
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 20px; text-align: left; font-size: 13px; }
    th {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--border);
      background: var(--surface2);
    }
    tr:not(:last-child) td { border-bottom: 1px solid var(--border); }
    tr:hover td { background: var(--surface2); }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .badge-mac { background: var(--blue-light); color: var(--blue); }
    .badge-win { background: var(--accent-light); color: var(--accent); }
    .badge-linux { background: var(--green-light); color: var(--green); }
    .client-id {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 11px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      XiaoNuan Console
    </div>
    <div class="header-right">
      <span class="header-meta">console.xiaonuan.me</span>

      <!-- 刷新 -->
      <button class="btn-text" onclick="location.reload()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        刷新
      </button>

      <!-- 主题切换 -->
      <button class="btn-icon" onclick="toggleTheme()" title="切换主题" id="themeBtn">
        <svg id="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg id="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button>

      <!-- 清空数据 -->
      <button onclick="clearData()" class="btn-text btn-danger" style="cursor:pointer; background:none; border:none; color:var(--danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        清空数据
      </button>

      <!-- 退出登录 -->
      <a href="/logout" class="btn-text btn-danger">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        退出登录
      </a>
    </div>
  </header>

  <main>
    <div class="page-title">数据看板</div>
    <div class="page-subtitle">实时统计小暖装机量与用户活跃情况 · 更新于 ${new Date().toLocaleString('zh-CN')}</div>

    <!-- 核心指标 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">累计装机量</div>
        <div class="stat-value accent">${totalInstalls.toLocaleString()}</div>
        <div class="stat-sub">设备总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日活跃 (DAU)</div>
        <div class="stat-value green">${todayDAU.toLocaleString()}</div>
        <div class="stat-sub">${today}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">近 7 日新增</div>
        <div class="stat-value amber">${newInstalls7d.toLocaleString()}</div>
        <div class="stat-sub">新装机量</div>
      </div>
    </div>

    <!-- 图表第一行 -->
    <div class="chart-grid">
      <div class="chart-card">
        <h3>近 30 天每日活跃用户 (DAU)</h3>
        <div class="chart-container"><canvas id="dauChart"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>平台分布</h3>
        <div class="chart-container"><canvas id="osChart"></canvas></div>
      </div>
    </div>

    <!-- 图表第二行 -->
    <div class="chart-grid-2">
      <div class="chart-card">
        <h3>版本分布</h3>
        <div class="chart-container"><canvas id="versionChart"></canvas></div>
      </div>
      <div class="chart-card" style="display:flex;flex-direction:column;">
        <h3>平台占比</h3>
        <div class="progress-row" style="flex:1;justify-content:center;">
          ${osDist.map(d => {
            const label = d.os === 'darwin' ? 'macOS' : d.os === 'win32' ? 'Windows' : d.os;
            const pct = totalInstalls > 0 ? Math.round(d.count / totalInstalls * 100) : 0;
            return `<div class="progress-item">
              <div class="progress-label">
                <span>${label}</span>
                <span>${d.count} (${pct}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- 最近装机记录 -->
    <div class="table-card">
      <div class="table-header">最近 20 条装机记录</div>
      <table>
        <thead>
          <tr>
            <th>设备序号</th>
            <th>Client ID</th>
            <th>系统</th>
            <th>版本</th>
            <th>首次装机时间</th>
          </tr>
        </thead>
        <tbody>
          ${recentInstalls.map(r => {
            const osLabel = r.os === 'darwin' ? 'macOS' : r.os === 'win32' ? 'Windows' : r.os ?? 'Unknown';
            const badgeClass = r.os === 'darwin' ? 'badge-mac' : r.os === 'win32' ? 'badge-win' : 'badge-linux';
            return `<tr>
              <td><span style="font-weight:600; color:var(--primary)">#${r.serialNumber}</span></td>
              <td><span class="client-id">${r.client_id.slice(0, 20)}…</span></td>
              <td><span class="badge ${badgeClass}">${osLabel}</span></td>
              <td>v${r.version}</td>
              <td style="color:var(--text-muted)">${r.first_seen_str}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </main>

  <script>
    // ---- 主题切换 ----
    const html = document.documentElement;
    const iconMoon = document.getElementById('icon-moon');
    const iconSun = document.getElementById('icon-sun');

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      const isDark = theme === 'dark';
      iconMoon.style.display = isDark ? 'none' : 'block';
      iconSun.style.display = isDark ? 'block' : 'none';
      // 更新图表颜色
      updateChartColors(isDark);
    }

    function toggleTheme() {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('xn_theme', next);
      applyTheme(next);
    }

    const savedTheme = localStorage.getItem('xn_theme') || 'light';
    applyTheme(savedTheme);

    // ---- 图表 ----
    let dauChart, osChart, versionChart;
    const CHART_COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b'];

    function getChartOpts(isDark) {
      const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
      const tickColor = isDark ? '#64748b' : '#9ca3af';
      return { gridColor, tickColor };
    }

    function updateChartColors(isDark) {
      const { gridColor, tickColor } = getChartOpts(isDark);
      [dauChart, osChart, versionChart].forEach(chart => {
        if (!chart) return;
        (chart.options.scales?.x?.ticks || {}).color = tickColor;
        (chart.options.scales?.x?.grid || {}).color = gridColor;
        (chart.options.scales?.y?.ticks || {}).color = tickColor;
        (chart.options.scales?.y?.grid || {}).color = gridColor;
        if (chart.options.plugins?.legend?.labels) {
          chart.options.plugins.legend.labels.color = tickColor;
        }
        chart.update('none');
      });
    }

    const isDark = () => html.getAttribute('data-theme') === 'dark';
    const baseOpts = () => {
      const { gridColor, tickColor } = getChartOpts(isDark());
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor, font: { size: 11 } }, grid: { color: gridColor } },
          y: { ticks: { color: tickColor, font: { size: 11 } }, grid: { color: gridColor }, beginAtZero: true }
        }
      };
    };

    // DAU 折线图
    dauChart = new Chart(document.getElementById('dauChart'), {
      type: 'line',
      data: {
        labels: ${dauLabels},
        datasets: [{
          data: ${dauValues},
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.06)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#6366f1',
        }]
      },
      options: baseOpts()
    });

    // OS 环形图
    const { tickColor: tc } = getChartOpts(isDark());
    osChart = new Chart(document.getElementById('osChart'), {
      type: 'doughnut',
      data: {
        labels: ${osLabels},
        datasets: [{
          data: ${osValues},
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: tc, font: { size: 11 }, padding: 12 }
          }
        }
      }
    });

    // 版本柱状图
    versionChart = new Chart(document.getElementById('versionChart'), {
      type: 'bar',
      data: {
        labels: ${versionLabels},
        datasets: [{
          data: ${versionValues},
          backgroundColor: 'rgba(99,102,241,0.5)',
          borderRadius: 4,
          hoverBackgroundColor: '#6366f1',
        }]
      },
      options: (() => {
        const o = baseOpts();
        o.scales.x.grid.display = false;
        return o;
      })()
    });

    // ---- 清空数据接口调用 ----
    async function clearData() {
      if (!confirm("⚠️ 确定要清空所有运营数据吗？此操作将彻底删除所有已登记的设备记录和日活日志，设备自增序号也将从 880001 重新开始计算！此操作不可恢复，是否继续？")) {
        return;
      }
      try {
        const res = await fetch("/clear-data", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          alert("数据清空成功！");
          location.reload();
        } else {
          alert("清空失败：" + (data.message || "未知错误"));
        }
      } catch (err) {
        alert("网络或接口服务异常，清空失败");
      }
    }
  </script>
</body>
</html>`;

  return c.html(html);
});

// 清空所有运营数据接口
consoleRoute.post("/clear-data", (c) => {
  try {
    db.transaction(() => {
      db.prepare("DELETE FROM daily_actives").run();
      db.prepare("DELETE FROM devices").run();
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'devices'").run();
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'daily_actives'").run();
    })();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
