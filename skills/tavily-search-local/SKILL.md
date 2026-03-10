---
name: tavily-search-local
description: Use Tavily for AI-oriented web search and page extraction when the user needs web results, source gathering, or link summarization and a `TAVILY_API_KEY` is available. Use as a local replacement for third-party Tavily search skills or when preparing the system for Tavily-backed search.
---

# Tavily Search Local

This is a local replacement skill definition for Tavily-backed search workflows.

## Preconditions

- `TAVILY_API_KEY` must be configured before live Tavily calls can work.
- If the key is missing, explain that setup is incomplete and either:
  - use another available search path
  - or stop after documenting the required config

## Recommended workflow

1. Confirm whether a Tavily API key is available.
2. Use Tavily for:
   - concise web search
   - source gathering
   - extracting content from specific URLs
3. Return:
   - short answer first
   - then source links
   - then notable caveats

## Local setup note

Store setup details and future command snippets in `references/setup.md`.
