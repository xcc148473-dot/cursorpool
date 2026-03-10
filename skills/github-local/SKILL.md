---
name: github-local
description: Work with GitHub repositories, issues, pull requests, Actions, and API calls from this Windows machine using the GitHub CLI or browser workflows. Use when the user wants repo automation, issue/PR handling, Actions inspection, or GitHub setup without depending on third-party ClawHub packaging.
---

# GitHub Local

Prefer the GitHub CLI (`gh`) when available.

## Workflow
1. Check whether `gh` is installed.
2. Check auth status.
3. Use `gh issue`, `gh pr`, `gh run`, and `gh api` for repeatable tasks.
4. Fall back to browser workflows only when CLI auth/setup is missing.

## Common tasks
- list/open issues and PRs
- inspect Actions runs
- create issues/PRs
- query repo metadata
- clone and inspect repos locally

Read `references/setup.md` before first-time use.
