# Console 服务本地启动指南 (macOS)

本文档说明如何在本地 Mac 上直接启动 `console` 服务，并通过已创建好的 Cloudflare Tunnel 将其暴露到公网。

---

## 前置条件

- 已安装 Node.js 22+
- 已安装 pnpm
- 已在 Cloudflare Dashboard 创建好 Tunnel，并配置好以下子域名映射：
  - `api.xiaonuan.me` → `http://localhost:3456`
  - `console.xiaonuan.me` → `http://localhost:3456`

---

## 步骤一：安装依赖

进入 console 服务目录，安装依赖：

```bash
cd /Users/xiyangxie/workspace/personal/xiaonuan-web/apps/console
pnpm install
```

---

## 步骤二：配置环境变量

复制示例文件并按需修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务监听端口（需要与 Cloudflare Tunnel 映射的端口一致）
PORT=3456

# 数据存储目录（SQLite 数据库文件将存放于此）
DATA_DIR=./data

# 运营控制台访问密码（访问 console.xiaonuan.me 时需要输入）
# 留空则只允许本地 localhost 直接访问
CONSOLE_PASSWORD=你的密码
```

---

## 步骤三：启动服务

**开发模式**（支持热重载，推荐本地开发时使用）：

```bash
pnpm dev
```

成功启动后，终端会显示：

```
✓ 小暖运营服务启动成功
  API 接口：   http://localhost:3456/api/heartbeat
  运营控制台：http://localhost:3456/
  健康检查：  http://localhost:3456/health
```

---

## 步骤四：启动 Cloudflare Tunnel (本地 Mac)

你已经在本地 Mac 创建好了 Tunnel。通过以下任意方式启动它：

**方式 A：使用 cloudflared 命令行（推荐）**

如果你已通过 `brew install cloudflared` 安装，运行：

```bash
cloudflared tunnel run <你的-tunnel-名称或-ID>
```

> [!TIP]
> 也可以用 `cloudflared tunnel --config ~/.cloudflared/config.yml run` 来使用配置文件启动。

**方式 B：在 Cloudflare Dashboard 直接运行连接器**

在 [Cloudflare Zero Trust → Tunnels](https://one.dash.cloudflare.com/) 页面，找到你的 Tunnel，点击 **Configure**，复制"安装并运行连接器"里的那条 `cloudflared service install ...` 或 `cloudflared tunnel run --token ...` 命令，在终端运行即可。

---

## 验证

Tunnel 和服务都正常启动后，运行以下命令验证：

```bash
# 1. 健康检查
curl https://api.xiaonuan.me/health
# 预期：{"status":"ok","timestamp":...}

# 2. 模拟小暖客户端上报心跳
curl -X POST https://api.xiaonuan.me/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"clientId":"00000000-0000-4000-8000-000000000001","os":"darwin","arch":"arm64","version":"0.1.38"}'
# 预期：{"ok":true}

# 3. 查看统计数据
curl https://api.xiaonuan.me/api/stats
```

在浏览器中打开运营控制台：

```
https://console.xiaonuan.me
```

---

## 数据存储位置

SQLite 数据库文件存放在 `apps/console/data/telemetry.db`（由 `DATA_DIR` 环境变量决定）。

**手动备份**：

```bash
cp apps/console/data/telemetry.db \
   apps/console/data/telemetry_backup_$(date +%Y%m%d).db
```

---

## Mac 与 NAS 双 Tunnel 说明

你目前在 Mac 本地和 NAS 上各有一个 Cloudflare Tunnel。**两个 Tunnel 不会同时工作**（Cloudflare 会路由到你在 Dashboard 中指定的那一个）。

建议的切换方式：

| 场景 | 操作 |
|:---|:---|
| **本地开发调试** | 在本地 Mac 启动 cloudflared，两个子域名指向本地 Tunnel |
| **正式运行（NAS）** | 停掉本地 cloudflared，启动 NAS 上的 cloudflared，同时将服务通过 Docker 部署到 NAS |

> [!NOTE]
> 如果两个 cloudflared 同时运行指向同一个 Tunnel，Cloudflare 会自动负载均衡流量到两个出口，这在调试阶段可能会让请求随机打到其中一个，建议开发时只保留一个。

---

## 常见问题

**Q：本地已能通过 `http://localhost:3456` 访问，但 `https://api.xiaonuan.me` 无法访问？**  
A：检查 cloudflared 是否已启动，以及 Cloudflare Dashboard 中 Tunnel 的 Public Hostnames 映射是否已保存。

**Q：访问 `console.xiaonuan.me` 后浏览器弹出登录框，密码是什么？**  
A：用户名可以随意填（如 `admin`），密码是你在 `.env` 中 `CONSOLE_PASSWORD` 设置的值。

**Q：想关闭密码验证怎么办？**  
A：将 `.env` 中 `CONSOLE_PASSWORD` 设置为空，则服务只允许通过 `http://localhost:3456` 本地访问控制台，公网访问会返回 403。
