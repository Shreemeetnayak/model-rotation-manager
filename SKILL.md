---
name: model-rotation-manager
description: Use when an OmniRoute combo request fails, returns "Request failed, retrying", or reports rate limit, timeout, overload, 429, 502/503, context-window overflow, or "model not available in active live catalog". Diagnose the route, exclude ineligible models, and pick a capable one.
allowed-tools: Bash(curl:*), Bash(omniroute:*), Read
---

# Model Rotation Manager

Diagnose and route around OmniRoute failures. Never re-send a request to a route that
has already been shown to be incapable of handling it.

## 1. Check the server first

```bash
curl -fsS -m 3 http://127.0.0.1:20128/api/health || echo "OmniRoute down"
```

If it is down, run `bash hooks/start-omniroute.sh` (or `omniroute serve`) and wait for health.

## 2. Classify the failure

| Signal | Meaning | Action |
|--------|---------|--------|
| `429` | rate limit | Cool down that credential; try another credential, then another model |
| `502` / `503` / `504` | provider unavailable | Short cooldown on that route; try next route |
| timeout / connection reset | network | Health penalty; try next route |
| `400` context too large | permanent for this request | Exclude that model permanently for this request |
| `400` model not in catalog | stale config or removed model | Refresh catalog; exclude until it reappears |
| `401` / `403` | credential invalid | Disable that credential only — other credentials still work |

Never treat a `400` as retryable. It will fail identically on the next attempt.

## 3. Filter routes BEFORE calling

For a request of `N` estimated input tokens plus an output budget, a route is eligible only when:

```
N + output_budget + safety_margin <= model_context_window
```

Exclude first, then send. Do not "try it and see".

## 4. One credential failing does not disable the provider

A failure on `Provider A / Credential 1` must leave `Provider A / Credential 2`,
`Provider B`, and `Provider C` eligible. Only mark a whole provider down when every
credential for it is cooling down.

## 5. Concurrency

Each request picks a free route. A busy route is skipped, never queued behind, and
released as soon as the request finishes or fails. There is no global lock on a combo.

## 6. Report honestly

When no route can serve the request, say:

- Required context: N tokens
- Largest available context: M tokens
- Which routes were excluded and why
- Whether compression was attempted and the resulting token count

Never report "done" without a verified API response.
