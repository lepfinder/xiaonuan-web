# ---- 构建阶段 ----
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖（包含 better-sqlite3 编译需要的 python/make/g++）
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- 运行阶段 ----
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 仅安装生产依赖
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# 复制编译产物
COPY --from=builder /app/dist ./dist

# 创建数据目录（会被 volume 覆盖）
RUN mkdir -p /data

EXPOSE 3456

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3456/health || exit 1

CMD ["node", "dist/index.js"]
