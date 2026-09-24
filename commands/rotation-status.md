---
description: Show current OmniRoute model, credential pool, cooldowns and health
allowed-tools: Bash(curl:*)
---

# Rotation Status

Report:
- Current model and provider
- Eligible routes (healthy + capacity)
- Routes excluded and why (context too small, cooling down, rate limited, not in live catalog)
- In-flight requests per route
