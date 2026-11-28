---
id: "202611281305-FK88QM"
title: "Integrate November 28 Writer and Calc branch updates"
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
  updated_at: "2026-11-28T13:06:10.207Z"
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
    body: "Start: integrate and verify the current Writer and Calc heads, then synchronize the published branches."
events:
  -
    type: "status"
    at: "2026-11-28T13:06:14.804Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: integrate and verify the current Writer and Calc heads, then synchronize the published branches."
doc_version: 3
doc_updated_at: "2026-11-28T13:06:14.804Z"
doc_updated_by: "CODER"
description: "Publish current feature heads, merge both into main, resolve conflicts with targeted checks, repair failures found by full verification, document suspected upstream issues and merge verified main back into both published feature branches."
sections:
  Summary: "Integrate and publish the current Writer and Calc branches in main and synchronize both development branches back to the verified main."
  Scope: "Use the three user-named checkouts. Publish their existing feature commits, resolve any merge conflicts, repair concrete verification failures and record supported upstream suspicions in the respective issue journals. Preserve unrelated Calc artifacts."
  Plan: "Publish the current Writer and Calc commits; fetch and merge both into main; resolve conflicts, document supported upstream findings, and pass focused and full checks; publish main, merge it back into both development branches, and verify local and remote heads."
  Verify Steps: |-
    1. Run focused unit, browser or registry checks selected by resolved source and metadata conflicts.
    2. Run npm run verify on integrated main. If an early gate fails, also exercise subsequent test suites to expose independent failures. Keep existing coverage requirements.
    3. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    4. Check git diff --check, tracked working-tree status, branch and remote tip equality, and ancestry of the published main in writer and calc.
  Verification: "Pending execution."
  Rollback Plan: "Preserve original branch tips and untracked artifacts. Follow normal fast-forward publication and use explicit revert commits if published integration needs reversing."
  Findings: "Pending execution."
id_source: "generated"
---
## Summary

Integrate and publish the current Writer and Calc branches in main and synchronize both development branches back to the verified main.

## Scope

Use the three user-named checkouts. Publish their existing feature commits, resolve any merge conflicts, repair concrete verification failures and record supported upstream suspicions in the respective issue journals. Preserve unrelated Calc artifacts.

## Plan

Publish the current Writer and Calc commits; fetch and merge both into main; resolve conflicts, document supported upstream findings, and pass focused and full checks; publish main, merge it back into both development branches, and verify local and remote heads.

## Verify Steps

1. Run focused unit, browser or registry checks selected by resolved source and metadata conflicts.
2. Run npm run verify on integrated main. If an early gate fails, also exercise subsequent test suites to expose independent failures. Keep existing coverage requirements.
3. Run ap doctor and node .agentplane/policy/check-routing.mjs.
4. Check git diff --check, tracked working-tree status, branch and remote tip equality, and ancestry of the published main in writer and calc.

## Verification

Pending execution.

## Rollback Plan

Preserve original branch tips and untracked artifacts. Follow normal fast-forward publication and use explicit revert commits if published integration needs reversing.

## Findings

Pending execution.
