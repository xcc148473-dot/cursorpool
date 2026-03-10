# Clawdbot Tools System

这是这台 OpenClaw 机器上的本地 Clawdbot/OpenClaw 工具体系入口。

## 1. 想搭一个更强的 agent
优先看：
- `../skills/agent-builder-local/`
- `../skills/agents-manager-local/`
- `../skills/capability-evolver-local/`

## 2. 想查 OpenClaw 文档、命令、配置
优先看：
- `../skills/clawddocs-local/`
- 本机 docs: `C:/Users/Administrator/AppData/Roaming/npm/node_modules/openclaw/docs`

## 3. 想做浏览器/桌面自动化
优先看：
- `../skills/web-reader-local/`
- `../skills/desktop-automation-local/`
- `../skills/windows-gui-fallback-local/`
- `../skills/autohotkey-local/`

## 4. 想做更新、同步、迁移
优先看：
- `../skills/clawdbot-update-local/`
- `../skills/clawdbot-sync-local/`
- `../skills/provider-sync-local/`

## 5. 想做安全检查和风险控制
优先看：
- `../skills/clawdefender-local/`
- `../skills/skill-vetter-local/`
- `../skills/healthcheck/` (built-in)

## 6. 想接更多工具/服务
优先看：
- `../skills/mcp-client-local/`
- `../skills/api-gateway-local/`
- `../skills/github-local/`
- `../skills/gog-local/`
- `../skills/notion-local/`

## 当前已验证的本机基础能力
- Browser Relay 可用
- `agent-browser` 可用
- Portable AutoHotkey v2 可用
- Portable Python 可用
- Portable FFmpeg 可用
- `openai-whisper` 可用

## 建议使用顺序
1. 先查 docs / 明确能力边界
2. 再选 skill / 工具层
3. 先做最小验证
4. 再扩到真实工作流
