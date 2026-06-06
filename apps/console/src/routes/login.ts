import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

export const loginRoute = new Hono();

let SESSION_TOKEN: string | null = null;

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function isAuthenticated(token: string | undefined): boolean {
  return !!token && !!SESSION_TOKEN && token === SESSION_TOKEN;
}

loginRoute.get("/login", (c) => {
  const error = c.req.query("error");
  return c.html(renderLoginPage(error));
});

loginRoute.post("/login", async (c) => {
  const CONSOLE_PASSWORD = process.env["CONSOLE_PASSWORD"] ?? "";
  const body = await c.req.parseBody();
  const password = body["password"] as string;

  if (!password || password !== CONSOLE_PASSWORD) {
    return c.redirect("/login?error=1");
  }

  SESSION_TOKEN = generateToken();
  setCookie(c, "xn_session", SESSION_TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return c.redirect("/");
});

loginRoute.get("/logout", (c) => {
  SESSION_TOKEN = null;
  deleteCookie(c, "xn_session", { path: "/" });
  return c.redirect("/login");
});

function renderLoginPage(error?: string | null): string {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>小暖运营控制台 · 登录</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ---- 主题变量 ---- */
    :root, [data-theme="light"] {
      --bg: #f5f6fa;
      --surface: #ffffff;
      --surface2: #f0f2f7;
      --border: rgba(0,0,0,0.08);
      --border-focus: rgba(99,102,241,0.5);
      --text: #111827;
      --text-muted: #6b7280;
      --accent: #6366f1;
      --accent-glow: rgba(99,102,241,0.15);
      --error: #dc2626;
      --error-bg: rgba(220,38,38,0.06);
      --shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
      --glow: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.08) 0%, transparent 70%);
    }
    [data-theme="dark"] {
      --bg: #0d0f14;
      --surface: #161a23;
      --surface2: #1d2232;
      --border: rgba(255,255,255,0.07);
      --border-focus: rgba(99,102,241,0.6);
      --text: #e2e8f0;
      --text-muted: #64748b;
      --accent: #6366f1;
      --accent-glow: rgba(99,102,241,0.2);
      --error: #f87171;
      --error-bg: rgba(248,113,113,0.08);
      --shadow: 0 24px 64px rgba(0,0,0,0.5);
      --glow: radial-gradient(ellipse 60% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%);
    }

    html, body { height: 100%; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      transition: background 0.2s, color 0.2s;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: var(--glow);
      pointer-events: none;
    }

    /* 主题切换按钮 */
    .theme-toggle {
      position: fixed;
      top: 16px;
      right: 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      box-shadow: var(--shadow);
    }
    .theme-toggle:hover { background: var(--surface2); }
    .theme-toggle svg { width: 16px; height: 16px; color: var(--text-muted); }

    .card {
      position: relative;
      width: 360px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px 36px;
      box-shadow: var(--shadow);
      animation: fadeUp 0.25s ease;
      transition: background 0.2s, border-color 0.2s;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .logo-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1, #818cf8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .logo-icon svg { width: 16px; height: 16px; color: white; }
    .logo-name {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .logo-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    .error-banner {
      background: var(--error-bg);
      border: 1px solid rgba(220,38,38,0.15);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      color: var(--error);
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field { margin-bottom: 16px; }

    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 6px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    input[type="password"] {
      width: 100%;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      color: var(--text);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.2s;
      font-family: inherit;
      letter-spacing: 0.04em;
    }
    input[type="password"]:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    input[type="password"]::placeholder {
      letter-spacing: normal;
      color: var(--text-muted);
      opacity: 0.5;
    }

    .btn {
      width: 100%;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 11px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      margin-top: 4px;
      transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 4px 12px rgba(99,102,241,0.28);
    }
    .btn:hover { opacity: 0.88; }
    .btn:active { transform: scale(0.98); }

    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 11px;
      color: var(--text-muted);
    }
    .footer a { color: var(--text-muted); text-decoration: none; }
    .footer a:hover { color: var(--accent); }
  </style>
</head>
<body>
  <!-- 主题切换 -->
  <button class="theme-toggle" onclick="toggleTheme()" title="切换主题" aria-label="切换主题">
    <svg id="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    <svg id="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>

  <div class="card">
    <div class="logo-wrap">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <div class="logo-name">XiaoNuan</div>
        <div class="logo-sub">console.xiaonuan.me</div>
      </div>
    </div>

    <h1>欢迎回来</h1>
    <p class="subtitle">输入密码以访问运营控制台</p>

    ${error ? `
    <div class="error-banner">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11" r="0.75" fill="currentColor"/></svg>
      密码不正确，请重试
    </div>` : ""}

    <form method="POST" action="/login">
      <div class="field">
        <label for="password">访问密码</label>
        <input type="password" id="password" name="password" placeholder="输入控制台密码" autocomplete="current-password" autofocus required />
      </div>
      <button type="submit" class="btn">进入控制台</button>
    </form>

    <div class="footer">
      <a href="https://xiaonuan.me" target="_blank">xiaonuan.me</a> · 小暖运营系统
    </div>
  </div>

  <script>
    const html = document.documentElement;
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
      } else {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
      }
    }

    function toggleTheme() {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('xn_theme', next);
      applyTheme(next);
    }

    // 初始化：读取用户偏好，默认 light
    const saved = localStorage.getItem('xn_theme') || 'light';
    applyTheme(saved);
  </script>
</body>
</html>`;
}
