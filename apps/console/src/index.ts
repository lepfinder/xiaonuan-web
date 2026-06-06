import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getCookie } from "hono/cookie";
import { heartbeatRoute } from "./routes/heartbeat.js";
import { statsRoute } from "./routes/stats.js";
import { consoleRoute } from "./routes/console.js";
import { loginRoute, isAuthenticated } from "./routes/login.js";

const app = new Hono();

// ==============================
// 全局中间件
// ==============================
app.use("*", logger());

// CORS：只开放 API 路径
app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST"],
  allowHeaders: ["Content-Type"],
}));

// ==============================
// 公开路由（无需鉴权）
// ==============================

// 健康检查
app.get("/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

// API 接口 (供客户端上报 + 后台读取统计)
// 访问域名：api.xiaonuan.me
app.route("/api/heartbeat", heartbeatRoute);
app.route("/api/stats", statsRoute);

// 登录 / 登出路由（公开）
app.route("/", loginRoute);

// ==============================
// 鉴权中间件：保护运营控制台 UI
// ==============================
app.use("/", async (c, next) => {
  // 若未设置密码，不保护（本地开发方便）
  const CONSOLE_PASSWORD = process.env["CONSOLE_PASSWORD"] ?? "";
  if (!CONSOLE_PASSWORD) return next();

  const token = getCookie(c, "xn_session");
  if (!isAuthenticated(token)) {
    return c.redirect("/login");
  }

  return next();
});

// 运营控制台 UI
// 访问域名：console.xiaonuan.me
app.route("/", consoleRoute);

// ==============================
// 启动服务
// ==============================
const PORT = Number(process.env["PORT"] ?? 3456);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`\x1b[32m✓\x1b[0m 小暖运营服务启动成功`);
  console.log(`  API 接口：   http://localhost:${info.port}/api/heartbeat`);
  console.log(`  运营控制台：http://localhost:${info.port}/`);
  console.log(`  健康检查：  http://localhost:${info.port}/health`);
});
