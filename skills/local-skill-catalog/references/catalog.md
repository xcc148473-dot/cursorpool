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
