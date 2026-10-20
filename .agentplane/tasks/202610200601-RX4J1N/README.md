---
id: "202610200601-RX4J1N"
title: "Integrate current writer and calc branches and synchronize main"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Verify origin/main origin/writer origin/calc contain the integrated main and all three checkouts are on intended branches with no unintended tracked changes."
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T06:02:09.733Z"
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
    body: "Start: Execute user-approved three-repository integration and full verification, preserving unrelated local artifacts."
events:
  -
    type: "status"
    at: "2026-10-20T06:02:10.938Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute user-approved three-repository integration and full verification, preserving unrelated local artifacts."
doc_version: 3
doc_updated_at: "2026-10-20T06:02:10.938Z"
doc_updated_by: "CODER"
description: "Push existing writer and calc commits, merge both into main, resolve conflicts, run full verification and repair regressions with missing tests, push main, and merge main back into writer and calc while retaining their checked-out branches. User explicitly authorized all three repository directories and remote fetch/push."
sections:
  Summary: "Integrate existing writer and calc development into main and synchronize all three repositories."
  Scope: "All three user-authorized project checkouts, existing branch commits, merge conflict resolutions, regression fixes and tests, task evidence, and origin fetch/push. Preserve unrelated untracked Playwright artifacts. No force pushes or destructive history changes."
  Plan: "Execute the user-authorized nine-step synchronization: push branches, merge writer and calc into main, repair conflicts and regressions with full verification, publish main, merge main back and push writer/calc; preserve branch placement and unrelated artifacts."
  Verify Steps: |-
    - npm run verify: all formatting, lint, type checks, architecture/resource checks, tooling/unit/inventory coverage, browser tests, static build, documentation, file-size, source-tree/provenance, and inventory invariants/parity checks pass.
    - ap doctor and node .agentplane/policy/check-routing.mjs pass.
    - Inspect conflicts and changed boundaries for missing meaningful test coverage; add regression tests when uncovered behavior is found.
    - Confirm origin/main is an ancestor of origin/writer and origin/calc and each local branch equals its remote tracking branch.
    - git status --short --untracked-files=all in every checkout: no unintended tracked changes; preserve pre-existing main Playwright artifacts.
    - Confirm main, writer, and calc remain checked out in their corresponding directories.
  Verification: "Pending execution."
  Rollback Plan: "Preserve initial heads in task findings. If necessary, revert task-specific merge or repair commits without rewriting published history. Never delete pre-existing untracked files."
  Findings: "Initial main and writer: faa8a3cab. Initial calc: 1ca87e44a, ahead of origin/calc by 282 commits. Writer and calc clean. Main tracked tree clean, with pre-existing untracked .playwright-mcp logs and snapshots."
id_source: "generated"
---
## Summary

Integrate existing writer and calc development into main and synchronize all three repositories.

## Scope

All three user-authorized project checkouts, existing branch commits, merge conflict resolutions, regression fixes and tests, task evidence, and origin fetch/push. Preserve unrelated untracked Playwright artifacts. No force pushes or destructive history changes.

## Plan

Execute the user-authorized nine-step synchronization: push branches, merge writer and calc into main, repair conflicts and regressions with full verification, publish main, merge main back and push writer/calc; preserve branch placement and unrelated artifacts.

## Verify Steps

- npm run verify: all formatting, lint, type checks, architecture/resource checks, tooling/unit/inventory coverage, browser tests, static build, documentation, file-size, source-tree/provenance, and inventory invariants/parity checks pass.
- ap doctor and node .agentplane/policy/check-routing.mjs pass.
- Inspect conflicts and changed boundaries for missing meaningful test coverage; add regression tests when uncovered behavior is found.
- Confirm origin/main is an ancestor of origin/writer and origin/calc and each local branch equals its remote tracking branch.
- git status --short --untracked-files=all in every checkout: no unintended tracked changes; preserve pre-existing main Playwright artifacts.
- Confirm main, writer, and calc remain checked out in their corresponding directories.

## Verification

Pending execution.

## Rollback Plan

Preserve initial heads in task findings. If necessary, revert task-specific merge or repair commits without rewriting published history. Never delete pre-existing untracked files.

## Findings

Initial main and writer: faa8a3cab. Initial calc: 1ca87e44a, ahead of origin/calc by 282 commits. Writer and calc clean. Main tracked tree clean, with pre-existing untracked .playwright-mcp logs and snapshots.
