# Cloudflare Tunnel 部署指南

本文档说明如何将小暖运营服务（运行在 NAS 本地）通过 Cloudflare Tunnel 安全映射到以下两个公网子域名：

- **`api.xiaonuan.me`** → 接收小暖客户端上报的心跳 API
- **`console.xiaonuan.me`** → 运营控制台后台管理页面

---

## 前置条件

1. 域名 `xiaonuan.me` 已接入 Cloudflare（即 DNS 托管在 CF），无需手动添加 A 记录。
2. NAS 已通过 Docker Compose 成功运行 `xiaonuan-console` 容器，监听端口 `3456`。
3. 在 Cloudflare Dashboard 中已登录账号。

---

## 步骤一：在 Cloudflare Dashboard 创建 Tunnel

1. 打开 [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. 左侧菜单选择 **Network → Tunnels**
3. 点击 **Create a tunnel**，选择 **Cloudflared**，命名为 `xiaonuan-nas`，点击 **Save tunnel**
4. Cloudflare 会提供一个 **Token**（一串很长的字符串），**复制保存好**，下一步需要用到

---

## 步骤二：在 NAS 上运行 cloudflared

在 NAS 上通过 Docker 运行 `cloudflared`，将上面拿到的 Token 填入：

```yaml
# 在 docker-compose.yml 中添加以下 service：
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token <YOUR_TUNNEL_TOKEN_HERE>
    network_mode: host  # 使 cloudflared 能访问到本机的 3456 端口
```

或者在 NAS 的 Docker 管理界面（如 Synology Container Manager）中直接创建容器：
- 镜像：`cloudflare/cloudflared:latest`
- 命令参数：`tunnel --no-autoupdate run --token <YOUR_TOKEN>`
- 网络模式：**Host**

---

## 步骤三：在 Cloudflare Dashboard 配置域名映射

回到 **Tunnels** 页面，找到刚创建的 `xiaonuan-nas` Tunnel，进入 **Configure → Public Hostnames**，添加以下两条映射：

| Subdomain | Domain | Path | Service Type | URL |
|:---|:---|:---|:---|:---|
| `api` | `xiaonuan.me` | (留空) | HTTP | `localhost:3456` |
| `console` | `xiaonuan.me` | (留空) | HTTP | `localhost:3456` |

保存后，Cloudflare 会自动完成 DNS 解析和 HTTPS 证书签发，无需手动操作。

---

## 步骤四：验证

等待约 30 秒后，分别测试：

```bash
# 测试 API 接口是否正常响应
curl https://api.xiaonuan.me/health
# 预期返回：{"status":"ok","timestamp":...}

# 测试心跳上报接口
curl -X POST https://api.xiaonuan.me/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"clientId":"00000000-0000-4000-8000-000000000001","os":"darwin","version":"0.1.38"}'
# 预期返回：{"ok":true}

# 访问运营控制台（在浏览器中打开）
open https://console.xiaonuan.me
```

---

## 访问控制

运营控制台通过 **HTTP Basic Auth** 保护。  
在 NAS 的 Docker 环境变量中设置 `CONSOLE_PASSWORD` 即可：

```env
CONSOLE_PASSWORD=your_secret_password
```

访问 `https://console.xiaonuan.me` 时，浏览器会弹出登录框，用户名随意（任意输入），密码填入上面设置的值。

> [!TIP]
> 如果需要更强的安全性，可以在 Cloudflare Zero Trust Dashboard 中为 `console.xiaonuan.me` 配置 **Cloudflare Access**，支持 GitHub OAuth / 邮件 OTP 等零信任登录方式，彻底替代 Basic Auth。

---

## 数据备份

SQLite 数据库文件存放在 NAS 的 `./data/telemetry.db`（通过 volume 挂载）。

定期备份只需复制此文件即可：

```bash
cp ./data/telemetry.db ./data/telemetry_backup_$(date +%Y%m%d).db
```
