---
id: "202610100306-5SZVX2"
title: "Integrate Writer and Calc branches and synchronize all checkouts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T03:06:47.496Z"
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
    body: "Start: Execute user-approved Writer and Calc integration, full verification, publication, and branch synchronization."
events:
  -
    type: "status"
    at: "2026-10-10T03:06:48.200Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute user-approved Writer and Calc integration, full verification, publication, and branch synchronization."
doc_version: 3
doc_updated_at: "2026-10-10T03:07:03.449Z"
doc_updated_by: "CODER"
description: "User authorized pushing writer/calc, merging both into main, resolving conflicts, running full verification and repairing failures with regression coverage, pushing main, merging main back and pushing writer/calc while retaining their active branches."
sections:
  Summary: "Integrate existing Writer and Calc histories into main and synchronize all three user-approved repositories."
  Scope: "Push writer/calc; merge into main; resolve conflicts preserving both applications and task records; repair full verification failures with regression tests as needed; push main and merge/push it back into writer/calc."
  Plan: "Follow user-approved nine-step integration plan; run complete npm verification, repair integration failures with regression tests as needed, publish and synchronize main/writer/calc preserving branch identity."
  Verify Steps: |-
    1. npm run verify: all formatting, lint, type, dependency, resource, tooling, unit/coverage, inventory, E2E, static build, documentation, file size, source and parity checks must pass.
    2. ap doctor and node .agentplane/policy/check-routing.mjs must pass.
    3. Confirm original writer/calc tips are ancestors of main.
    4. Confirm main is an ancestor of writer/calc; remote tips match local tips; all directories clean; active branches main/writer/calc.
  Verification: "Pending execution."
  Rollback Plan: "Original main=44ed369e writer=881b98f5 calc=6823a996. Roll back only through requested revert commits; never reset or force push."
  Findings: "Initial working directories clean. User nine-step request authorizes network and all three directories; unrelated existing active tasks are preserved."
id_source: "generated"
---
## Summary

Integrate existing Writer and Calc histories into main and synchronize all three user-approved repositories.

## Scope

Push writer/calc; merge into main; resolve conflicts preserving both applications and task records; repair full verification failures with regression tests as needed; push main and merge/push it back into writer/calc.

## Plan

Follow user-approved nine-step integration plan; run complete npm verification, repair integration failures with regression tests as needed, publish and synchronize main/writer/calc preserving branch identity.

## Verify Steps

1. npm run verify: all formatting, lint, type, dependency, resource, tooling, unit/coverage, inventory, E2E, static build, documentation, file size, source and parity checks must pass.
2. ap doctor and node .agentplane/policy/check-routing.mjs must pass.
3. Confirm original writer/calc tips are ancestors of main.
4. Confirm main is an ancestor of writer/calc; remote tips match local tips; all directories clean; active branches main/writer/calc.

## Verification

Pending execution.

## Rollback Plan

Original main=44ed369e writer=881b98f5 calc=6823a996. Roll back only through requested revert commits; never reset or force push.

## Findings

Initial working directories clean. User nine-step request authorizes network and all three directories; unrelated existing active tasks are preserved.
