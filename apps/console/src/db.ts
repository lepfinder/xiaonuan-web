import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// 数据目录：生产环境通过环境变量 DATA_DIR 指定，开发环境默认在项目根目录
const DATA_DIR = process.env["DATA_DIR"] ?? path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "telemetry.db");

const db = new Database(DB_PATH);

// 开启 WAL 模式，提升并发写入性能
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

// ==========================================
// 初始化表结构
// ==========================================
db.exec(`
  -- 设备记录表
  -- 每个 client_id 只存一次（首次心跳），用于统计总装机量与生成唯一序号
  CREATE TABLE IF NOT EXISTS devices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   TEXT    UNIQUE NOT NULL,
    os          TEXT    NOT NULL,  -- 'darwin' | 'win32' | 'linux'
    arch        TEXT,              -- 'arm64' | 'x64'
    version     TEXT    NOT NULL,  -- 小暖版本号，如 '0.1.38'
    first_seen  INTEGER NOT NULL,  -- UNIX 时间戳 (ms)，首次安装时间
    updated_at  INTEGER NOT NULL   -- 最后一次心跳时间
  );

  -- 日活记录表
  -- 用 (client_id, date) 联合唯一索引实现每天仅计数一次
  CREATE TABLE IF NOT EXISTS daily_actives (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   TEXT    NOT NULL,
    date        TEXT    NOT NULL,  -- 格式：YYYY-MM-DD (UTC)
    version     TEXT,
    UNIQUE(client_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_daily_actives_date ON daily_actives(date);
  CREATE INDEX IF NOT EXISTS idx_devices_first_seen ON devices(first_seen);
`);

// ==========================================
// 数据库迁移：从旧的 installs 迁移到 devices
// ==========================================
const hasInstallsTable = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='installs'").get();
if (hasInstallsTable) {
  try {
    db.transaction(() => {
      console.log("[Migration] Found legacy 'installs' table, migrating data...");
      db.prepare(`
        INSERT OR IGNORE INTO devices (client_id, os, arch, version, first_seen, updated_at)
        SELECT client_id, os, arch, version, first_seen, updated_at FROM installs
      `).run();
      db.exec("DROP TABLE installs");
      console.log("[Migration] Successfully migrated to 'devices' and dropped 'installs' table.");
    })();
  } catch (err) {
    console.error("[Migration] Failed migrating legacy data:", err);
  }
}

export default db;
