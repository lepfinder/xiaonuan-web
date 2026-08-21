# 小暖官网 (`@xiaonuan/website`)

静态落地页，与 `xiaonuan-releases` 的产品页同源。安装包仍从 GitHub Releases 下载，页面由本仓库发布到 Cloudflare Pages。

- 页面：`index.html`
- 样式：`public/style.css`
- 产品截图：`public/images/`
- 成长记插画（入口暂隐）：`public/assets/`

```bash
# 开发
pnpm dev:website

# 构建
pnpm build:website

# 发布到 Cloudflare Pages
pnpm deploy:website
```
