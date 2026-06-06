#!/bin/bash

# 确保脚本在出错时退出
set -e

# 定义颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始构建并发布小暖官网...${NC}"

# 1. 执行编译
echo -e "${BLUE}📦 正在编译官网静态资源 (pnpm build:website)...${NC}"
pnpm build:website

# 2. 执行部署
echo -e "${BLUE}☁️ 正在部署至 Cloudflare Pages (xiaonuan-website)...${NC}"
npx wrangler pages deploy apps/website/dist --project-name xiaonuan-website

echo -e "${GREEN}✅ 官网发布成功！${NC}"
