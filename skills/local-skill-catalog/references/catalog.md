# Local skill catalog

## Built-in on this machine
- weather — forecast/current weather
- healthcheck — security hardening / machine health review
- skill-creator — create or improve skills
- summarize — available in the upstream install referenced by article checks

## Third-party skills mentioned by the tutorial
- find-skills — ClawHub discovery helper; metadata available, source not directly resolved
- skill-vetter — security-first vetting helper; metadata available, source not directly resolved
- self-improving-agent — learning/error logging skill; metadata available, source not directly resolved
- proactive-agent — proactive workflows, WAL/working buffer ideas; metadata available, source not directly resolved
- tavily-search — requires `TAVILY_API_KEY`
- agent-browser — flagged suspicious by registry checks; treat as high-risk third-party skill

## Local replacements created here
- local-skill-catalog — replaces simple skill discovery/comparison use cases
- skill-vetter-local — replaces basic pre-install/manual review workflow
- proactive-local — replaces proactive reminders/checklist workflow using HEARTBEAT.md + cron concepts
- self-improving-local — replaces lightweight learning/error capture workflow
- tavily-search-local — local Tavily integration scaffold; still needs `TAVILY_API_KEY`
- brave-search-local — local Brave Search scaffold; still needs Brave Search API key
- github-local — local GitHub workflow scaffold; prefers `gh` CLI when available
- gog-local — local Google Workspace scaffold; needs CLI + OAuth
- notion-local — local Notion scaffold; needs integration token
- obsidian-local — local Obsidian/Markdown vault workflow scaffold
- openai-whisper-local — local Whisper transcription scaffold; needs runtime/tooling
- api-gateway-local — local planning scaffold for OAuth-backed SaaS gateway setups
- memory-manager-local — local continuity/memory maintenance workflow
- filesystem-local — local file/folder management workflow
- deep-research-local — structured multi-source research workflow
- x-twitter-local — local X/Twitter browser/API planning workflow
- n8n-local — local n8n setup/workflow planning scaffold
- markdown-converter-local — local Markdown conversion/cleanup workflow
- discord-local — local Discord workflow scaffold
- news-summary-local — local news digest workflow
- gmail-local — local Gmail/browser workflow scaffold
- imap-smtp-local — generic mail workflow scaffold
- youtube-watcher-local — local YouTube monitoring/summarization workflow
- multi-search-local — multi-engine search orchestration scaffold
- automation-workflows-local — repeatable automation workflow scaffold
- agentmail-local — agent-oriented email workflow layer
- humanizer-local — natural-language polishing workflow
- blogwatcher-local — blog/changelog monitoring workflow
- stock-market-local — market/news research workflow
- byterover-local — coding-context memory workflow scaffold
- capability-evolver-local — identify and add missing capabilities over time
- web-reader-local — low-risk public page reading/summarization alternative to suspicious browser-control skills
