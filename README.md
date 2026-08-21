# 小暖 Web 服务 (XiaoNuan Web Services)

本仓库是一个基于 `pnpm` workspace 构建的 Monorepo 项目，承载小暖家庭中枢系统的 Web 相关服务：

1.  **`apps/console` (运营后台)**：接收桌面端心跳遥测 API，并提供精美的后台数据统计及清空重置面板。
2.  **`apps/website` (官方网站)**：小暖产品落地页，展示真实界面，并提供 macOS / Windows 下载。安装包仍托管在 [xiaonuan-releases](https://github.com/lepfinder/xiaonuan-releases/releases/latest)。

---

## 🛠️ 开发与启动指引

项目要求本地安装有 `pnpm` 包管理器。

### 1. 依赖安装
在根目录下运行以下命令安装 workspace 下所有模块的依赖：
```bash
pnpm install
```

---

### 2. 运营控制台与 API 服务 (`@xiaonuan/console`)

运行端口：默认监听 `3456` 端口。

#### 环境变量配置 (`apps/console/.env`)
新建或复制并重命名 `apps/console/.env.example` 为 `apps/console/.env`，可配置的变量如下：
*   `PORT`: 服务监听端口（默认 `3456`）
*   `DATA_DIR`: SQLite 数据库及日志文件的存放目录
*   `CONSOLE_PASSWORD`: 设置后访问后台控制台将需要输入此密码登录（留空则免密）

#### 启动开发模式
运行 tsx 实时监听并热更新后端服务：
```bash
pnpm dev:console
```

#### 生产构建与启动
```bash
# 构建 TypeScript 代码
pnpm build:console

# 启动服务
pnpm --filter @xiaonuan/console start
```

---

### 3. 官方网站 (`@xiaonuan/website`)

静态落地页（`index.html` + `public/` 下的样式与截图），Vite 开发端口默认 `5173`。

#### 启动开发模式
```bash
pnpm dev:website
```

#### 生产编译与部署
```bash
# 打包生成纯静态 dist 资源
pnpm build:website
```
打包的输出目录位于 `apps/website/dist` 下。

*   **自动部署至 Cloudflare Pages（推荐，一键发布）**：
    在根目录下直接运行以下命令，即可自动完成编译并部署到 Cloudflare Pages：
    ```bash
    pnpm deploy:website
    # 或直接运行 ./deploy.sh
    ```
*   **本地预览静态站**：
    ```bash
    pnpm --filter @xiaonuan/website preview
    ```

#### 生产编译与部署
```bash
# 打包生成纯静态 dist 资源
pnpm build:website
```
打包的输出目录位于 `apps/website/dist` 下。

*   **自动部署至 Cloudflare Pages（推荐，一键发布）**：
    在根目录下直接运行以下命令，即可自动完成编译并部署到 Cloudflare Pages：
    ```bash
    pnpm deploy:website
    # 或直接运行 ./deploy.sh
    ```
*   **本地预览静态站**：
    ```bash
    pnpm --filter @xiaonuan/website preview
    ```

---

## 🐋 Docker 容器化部署

本项目根目录提供了容器化部署的 Docker 配置，您可以使用 `docker-compose` 在服务器上部署。

```bash
docker-compose up -d --build
```
容器构建成功后将自动运行 `@xiaonuan/console` 运营后台，并且挂载 `./data` 目录用于数据长久化备份。
