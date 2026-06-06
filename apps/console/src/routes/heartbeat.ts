import { Hono } from "hono";
import db from "../db.js";

export const heartbeatRoute = new Hono();

/**
 * POST /api/heartbeat
 * 小暖客户端每天首次启动时调用，用于统计日活与装机量
 */
heartbeatRoute.post("/", async (c) => {
  let body: {
    clientId?: string;
    os?: string;
    arch?: string;
    version?: string;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { clientId, os, arch, version } = body;

  /**
 * 将自增 ID 转换为排 4 的九进制设备序列号（从 880001 开始，不含数字 4）
 */
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

// 基础校验
  if (!clientId || !os || !version) {
    return c.json({ error: "Missing required fields: clientId, os, version" }, 400);
  }

  // 简单校验 clientId 格式（UUID v4）
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(clientId)) {
    return c.json({ error: "Invalid clientId format" }, 400);
  }

  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  // 更新设备记录并获取自增 id
  const row = db.prepare(`
    INSERT INTO devices (client_id, os, arch, version, first_seen, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(client_id) DO UPDATE SET
      version    = excluded.version,
      updated_at = excluded.updated_at
    RETURNING id
  `).get(clientId, os, arch ?? null, version, now, now) as { id: number };

  const deviceId = idToSerialNumber(row.id);

  // 写入日活记录：当天已写入则忽略（IGNORE 保证幂等性）
  db.prepare(`
    INSERT OR IGNORE INTO daily_actives (client_id, date, version)
    VALUES (?, ?, ?)
  `).run(clientId, today, version);

  return c.json({ ok: true, deviceId });
});
