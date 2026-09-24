---
description: Rotate to the next available model/credential in the OmniRoute combo
allowed-tools: Bash(curl:*), Bash(omniroute:*)
---

# Cascade

Move the active combo to the next available route.

Steps:
1. Query the OmniRoute health endpoint to confirm the server is up.
2. Fetch the current combo's available routes from the management API.
3. Skip any route that is cooling down, rate-limited, or lacks context capacity.
4. Report which route was selected and which were skipped, with the reason.

Never claim a rotation happened without confirming the new model from the API response.
