import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  ShieldCheck,
  Smartphone,
  Terminal,
  Download,
  Laptop,
  Share2,
  Cpu,
  Clock
} from "lucide-react";

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dockerComposeCode = `version: "3"
services:
  xiaonuan-core:
    image: lepfinder/xiaonuan-core:latest
    container_name: xiaonuan-core
    restart: always
    environment:
      - DATA_DIR=/data
      - PORT=8787
      - TZ=Asia/Shanghai
    volumes:
      - ./data:/data
    ports:
      - "8787:8787"`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-base)" }}>
      {/* 顶部导航栏 */}
      <nav className={`navbar ${isScrolled ? "scrolled glass-panel" : ""}`}>
        <div className="container navbar-container">
          <a href="#" className="logo-link">
            <div className="logo-icon">暖</div>
            <span className="logo-text">小暖 · XiaoNuan</span>
          </a>
          <div className="nav-links">
            <a href="#features" className="nav-link">产品优势</a>
            <a href="#arch" className="nav-link">系统架构</a>
            <a href="#deploy" className="nav-link">自托管部署</a>
            <a href="https://github.com/lepfinder" target="_blank" rel="noreferrer" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> GitHub
            </a>
          </div>
          <a href="#download" className="nav-cta">立即体验</a>
        </div>
      </nav>

      {/* 首屏 Hero 区域 */}
      <section className="hero">
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-tag">v0.1.39 Release</div>
            <h1 className="hero-title">
              不慌不忙，温暖如初。<br />
              <span className="text-gradient">你的本地家庭智能中枢</span>
            </h1>
            <p className="hero-subtitle">
              小暖是一款基于本地优先（Local-First）架构打造的家庭智能陪伴中枢。集 AI 陪伴对话、水彩灵感画廊、多端留言协同及日程管理于一体。数据安全且仅存在于您的物理硬盘。
            </p>
            <div className="hero-actions">
              <a href="#download" className="btn btn-primary">
                <Download size={18} /> 下载客户端
              </a>
              <a href="#deploy" className="btn btn-secondary">
                <Terminal size={18} /> Docker 部署中枢
              </a>
            </div>
          </motion.div>

          {/* 首页展示框 mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hero-image-wrapper"
          >
            <div className="hero-mockup-frame">
              <div className="hero-mockup-screen">
                {/* 模拟小暖终端的精美极简对话界面 */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--color-border)", background: "rgba(255,255,255,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-accent-green)" }}></div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--color-text-dark)" }}>天津家庭中枢 · 在线</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(92,64,51,0.2)" }}></div>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(92,64,51,0.2)" }}></div>
                  </div>
                </div>

                <div style={{ flexGrow: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "flex-end", overflow: "hidden" }}>
                  {/* 用户对话 */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "var(--color-primary)", color: "#fff", padding: "8px 12px", borderRadius: "14px 14px 0 14px", fontSize: "12px", maxWidth: "80%", fontWeight: "500" }}>
                      小暖，为我写一首关于秋天金杏林的绘本吧，并画一幅插图。
                    </div>
                  </div>
                  {/* AI 响应 */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", flexShrink: 0 }}>暖</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "85%" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-text-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={10} /> 正在创作插画...
                      </div>
                      <div style={{ background: "#fff", border: "1px solid var(--color-border)", padding: "10px", borderRadius: "0 14px 14px 14px", fontSize: "11px", lineHeight: "1.5" }}>
                        <div style={{ width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg, #fce7f3 0%, #fef3c7 100%)", borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", fontSize: "10px" }}>
                          🎨 [已生成吉卜力水彩绘本插画 - 秋天金杏林]
                        </div>
                        天津的秋风吹过银杏小径，小树叶落下来变成了金色的小信笺... 绘本故事与音频已生成，已同步关联至您的<b>家庭画廊</b>中。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 产品优势 Features 区域 */}
      <section id="features" className="section-padding" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Core Capabilities</span>
            <h2 className="section-title">为现代数字家庭量身打造</h2>
            <p className="section-desc">摒弃浮躁的大规模云服务，回归温馨、安全、极简的物理陪伴。小暖守护着数字家庭最纯粹的温度。</p>
          </div>

          <div className="features-grid">
            {/* 卡片 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Palette size={22} />
              </div>
              <div>
                <h3 className="feature-card-title">AI 水彩灵感画册</h3>
                <p className="feature-card-desc">
                  所有生成的图片与绘本插图自动收录至精美的个人画廊。支持高清原图预览、生成提示词复制以及作品本地下载，留住每一次艺术灵感。
                </p>
              </div>
            </div>

            {/* 卡片 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Share2 size={22} />
              </div>
              <div>
                <h3 className="feature-card-title">多端联动协同中枢</h3>
                <p className="feature-card-desc">
                  支持 Desktop 桌面端、Pad 交互终端、微信接入及局域网音箱。一端生成留言，全家共同倾听；随时播报最新的待收包裹取件码。
                </p>
              </div>
            </div>

            {/* 卡片 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="feature-card-title">完全的本地隐私安全</h3>
                <p className="feature-card-desc">
                  坚守本地优先哲学。所有用户资料、心跳日志、聊天瞬间和密钥配置均采用 SQLite 加密保存在本地目录中，隐私主权完全归您掌握。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 架构拓扑展示 section */}
      <section id="arch" className="section-padding" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">System Topology</span>
            <h2 className="section-title">分布式微内核架构</h2>
            <p className="section-desc">轻量化 Core 中枢服务与多端应用物理解耦，通过 WebSocket 与本地 HTTP 协议进行高效的数据同步与指令调度。</p>
          </div>

          <div className="arch-card">
            <div className="arch-grid">
              <div className="arch-node-list">
                <div className="arch-node">
                  <div className="arch-node-num">1</div>
                  <div>
                    <h4 className="arch-node-title">HomeCore 中枢服务 (apps/core)</h4>
                    <p className="arch-node-desc">基于 Node.js 微内核架构，内嵌 SQLite 本地持久化与 AgentLoop 引擎，负责所有定时任务、工具调用分配与资源治理。</p>
                  </div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-num">2</div>
                  <div>
                    <h4 className="arch-node-title">桌面助手 (apps/desktop)</h4>
                    <p className="arch-node-desc">基于 Electron 与 Vite + React 开发，支持全局沉浸式交互、本地配置看板、灵感画册展示与语音输入呼唤。</p>
                  </div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-num">3</div>
                  <div>
                    <h4 className="arch-node-title">微信与物联网端桥接器</h4>
                    <p className="arch-node-desc">将微信消息桥接至 Core 服务。让你可以随时随地通过手机给家里的留言板发便签，或接收小暖的自动包裹提醒。</p>
                  </div>
                </div>
              </div>

              {/* 架构图形示意 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px", background: "var(--color-bg-base)", borderRadius: "20px", border: "1px solid var(--color-border)", minHeight: "300px", justifyContent: "center", alignItems: "center", position: "relative" }}>
                {/* 模拟中心拓扑图 */}
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", boxShadow: "var(--shadow-md)", zIndex: 2 }}>
                  <Cpu size={24} style={{ marginBottom: "4px" }} />
                  Core
                </div>
                <div style={{ display: "flex", gap: "40px", zIndex: 2 }}>
                  <div style={{ background: "#fff", border: "1px solid var(--color-border)", padding: "10px 16px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Laptop size={14} /> Desktop Client
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--color-border)", padding: "10px 16px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Smartphone size={14} /> Mobile / WeChat
                  </div>
                </div>
                {/* 背景网格装饰线 */}
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(rgba(92,64,51,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(92,64,51,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 部署 Docker 与代码下载区域 */}
      <section id="deploy" className="section-padding" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Deployment & Install</span>
            <h2 className="section-title">自托管与安装指南</h2>
            <p className="section-desc">仅需一行 Docker 指令，即可在您的群晖 NAS、软路由或树莓派上构建专属的家庭智能大脑中枢。</p>
          </div>

          <div className="download-grid">
            {/* 代码框 */}
            <div className="code-box">
              <div className="code-box-header">
                <div className="code-box-dots">
                  <div className="code-box-dot red"></div>
                  <div className="code-box-dot yellow"></div>
                  <div className="code-box-dot green"></div>
                </div>
                <span className="code-box-title">docker-compose.yml</span>
              </div>
              <div className="code-box-content">{dockerComposeCode}</div>
            </div>

            {/* 下载卡片 */}
            <div className="download-cards" id="download">
              <div className="download-card">
                <div className="download-card-info">
                  <div className="download-card-icon">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h4 className="download-card-name">macOS 客户端 (Apple Silicon)</h4>
                    <span className="download-card-meta">XiaoNuan-0.1.39-arm64.dmg</span>
                  </div>
                </div>
                <button className="download-card-btn">点击下载</button>
              </div>

              <div className="download-card">
                <div className="download-card-info">
                  <div className="download-card-icon">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h4 className="download-card-name">macOS 客户端 (Intel Chip)</h4>
                    <span className="download-card-meta">XiaoNuan-0.1.39-x64.dmg</span>
                  </div>
                </div>
                <button className="download-card-btn">点击下载</button>
              </div>

              <div className="download-card">
                <div className="download-card-info">
                  <div className="download-card-icon">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="download-card-name">微信接入指引说明</h4>
                    <span className="download-card-meta">扫码将微信账号绑定至家庭中枢服务</span>
                  </div>
                </div>
                <button className="download-card-btn">查看教程</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部版权 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="logo-icon" style={{ width: "24px", height: "24px", fontSize: "10px" }}>暖</div>
              <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--color-text-dark)" }}>小暖 HomeCore</span>
            </div>
            <div className="footer-links">
              <a href="#features" className="footer-link">优势</a>
              <a href="#arch" className="footer-link">架构</a>
              <a href="#deploy" className="footer-link">部署</a>
              <a href="https://github.com/lepfinder" target="_blank" rel="noreferrer" className="footer-link">开发社区</a>
            </div>
            <div className="footer-copy">
              &copy; 2026 XiaoNuan HomeCore. All rights reserved.
            </div>
          </div>
          <div className="footer-credits">
            Designed for local privacy & home warmth. Powered by Open-source family AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
