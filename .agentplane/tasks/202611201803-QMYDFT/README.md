---
id: "202611201803-QMYDFT"
title: "Integrate current Writer and Calc development into main"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T18:03:53.915Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-20T18:04:02.076Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T18:04:02.076Z"
doc_updated_by: "CODER"
description: "Publish current feature branches, integrate both into main, run complete verification and fix regressions, record suspected upstream issues, publish main and synchronize both development checkouts."
sections:
  Summary: "Integrate the current Writer and Calc development branches into main and synchronize the three checkouts."
  Scope: "The three requested checkouts, current branch changes, integration conflict resolution, regression repairs and tests, and the two upstream findings journals. Preserve Calc output artifacts."
  Plan: "Execute the nine steps explicitly requested by the user. Publish both feature branches, integrate them on main, repair full verification failures and document suspected upstream issues, then publish main and synchronize both feature checkouts."
  Verify Steps: |-
    1. Run npm run verify and repair failed checks. Run remaining components separately when the aggregate short-circuits.
    2. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check.
    3. Confirm the published Writer and Calc tips enter main, all three published heads match local heads, and main is an ancestor of both feature branches. Confirm tracked trees are clean and preserve Calc output.
  Verification: "Pending execution."
  Rollback Plan: "Retain the original branch history and use only non-force pushes. Use a revert for any published correction that needs rollback."
  Findings: "Pending integration and verification."
id_source: "generated"
---
## Summary

Integrate the current Writer and Calc development branches into main and synchronize the three checkouts.

## Scope

The three requested checkouts, current branch changes, integration conflict resolution, regression repairs and tests, and the two upstream findings journals. Preserve Calc output artifacts.

## Plan

Execute the nine steps explicitly requested by the user. Publish both feature branches, integrate them on main, repair full verification failures and document suspected upstream issues, then publish main and synchronize both feature checkouts.

## Verify Steps

1. Run npm run verify and repair failed checks. Run remaining components separately when the aggregate short-circuits.
2. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check.
3. Confirm the published Writer and Calc tips enter main, all three published heads match local heads, and main is an ancestor of both feature branches. Confirm tracked trees are clean and preserve Calc output.

## Verification

Pending execution.

## Rollback Plan

Retain the original branch history and use only non-force pushes. Use a revert for any published correction that needs rollback.

## Findings

Pending integration and verification.
