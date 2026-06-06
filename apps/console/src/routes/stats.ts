import { Hono } from "hono";
import db from "../db.js";

export const statsRoute = new Hono();

/**
 * GET /api/stats
 * 供运营后台前端调用，返回聚合后的统计数据
 */
statsRoute.get("/", (c) => {
  // 总设备数
  const totalInstalls = (db.prepare("SELECT COUNT(*) as count FROM devices").get() as { count: number }).count;

  // 今日活跃用户数 (DAU)
  const today = new Date().toISOString().slice(0, 10);
  const todayDAU = (db.prepare(
    "SELECT COUNT(*) as count FROM daily_actives WHERE date = ?"
  ).get(today) as { count: number }).count;

  // 近 30 天每日活跃用户数（折线图数据）
  const last30Days = db.prepare(`
    SELECT date, COUNT(*) as dau
    FROM daily_actives
    WHERE date >= date('now', '-29 days')
    GROUP BY date
    ORDER BY date ASC
  `).all() as { date: string; dau: number }[];

  // 各版本设备分布
  const versionDist = db.prepare(`
    SELECT version, COUNT(*) as count
    FROM devices
    GROUP BY version
    ORDER BY count DESC
    LIMIT 10
  `).all() as { version: string; count: number }[];

  // 各 OS 平台分布
  const osDist = db.prepare(`
    SELECT os, COUNT(*) as count
    FROM devices
    GROUP BY os
    ORDER BY count DESC
  `).all() as { os: string; count: number }[];

  // 近 7 日新增设备量
  const newInstalls7d = (db.prepare(`
    SELECT COUNT(*) as count
    FROM devices
    WHERE first_seen >= ?
  `).get(Date.now() - 7 * 24 * 60 * 60 * 1000) as { count: number }).count;

  return c.json({
    totalInstalls,
    todayDAU,
    newInstalls7d,
    last30Days,
    versionDist,
    osDist,
  });
});
