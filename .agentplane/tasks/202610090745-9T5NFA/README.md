---
id: "202610090745-9T5NFA"
title: "Reconcile Calc coordinate inventory after sticky updates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:46:04.906Z"
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
    body: "Start: reconcile Calc inventory after verified sticky updates, preserving scoped native evidence and all semantic parity flags."
events:
  -
    type: "status"
    at: "2026-10-09T07:46:16.815Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reconcile Calc inventory after verified sticky updates, preserving scoped native evidence and all semantic parity flags."
doc_version: 3
doc_updated_at: "2026-10-09T07:46:16.815Z"
doc_updated_by: "CODER"
description: "Refresh the original coordinate capability with completed sticky movement evidence and cross-reference the separate sticky capability without claiming complete native parity. Keep shared and Writer records unchanged."
sections:
  Summary: "Reconcile Calc inventory descriptions with the two completed numerical core milestones."
  Scope: "Only the original Calc coordinate capability and registry README; preserve all parity status flags, shared/Writer records and runtime code. Work exclusively in vite-office-calc on calc. Calc cadence milestone 3, full suite due after milestone 10."
  Plan: "Replace stale pending-sticky descriptions with a reference to the implemented sticky capability and precisely bounded native evidence; update registry activation descriptions; validate Calc registry, format, routing, doctor, Calc tests and 100% coverage; commit and finish with clean state. User goal authorizes maintaining inventory alongside implementation."
  Verify Steps: "1. Run scoped Calc registry check, require no semantic violations and unchanged unverified parity flags. 2. Check both changed files with Prettier and git diff --check. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor. 4. Run npm run test:coverage:calc; require 100% lines, statements, functions and branches. 5. Inspect final git status and branch calc. Full suite is due at Calc task 10 and is not part of this docs-only task."
  Verification: "Pending the scoped acceptance commands."
  Rollback Plan: "Revert only this task implementation commit, preserving existing Calc coordinate code and records."
  Findings: "The original capability still listed sticky updates as future work after the second milestone implemented them. The registry README still described the initial inactive Calc state. Native fixture evidence executes sticky movement, so separate full address API parity remains unverified."
id_source: "generated"
---
## Summary

Reconcile Calc inventory descriptions with the two completed numerical core milestones.

## Scope

Only the original Calc coordinate capability and registry README; preserve all parity status flags, shared/Writer records and runtime code. Work exclusively in vite-office-calc on calc. Calc cadence milestone 3, full suite due after milestone 10.

## Plan

Replace stale pending-sticky descriptions with a reference to the implemented sticky capability and precisely bounded native evidence; update registry activation descriptions; validate Calc registry, format, routing, doctor, Calc tests and 100% coverage; commit and finish with clean state. User goal authorizes maintaining inventory alongside implementation.

## Verify Steps

1. Run scoped Calc registry check, require no semantic violations and unchanged unverified parity flags. 2. Check both changed files with Prettier and git diff --check. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor. 4. Run npm run test:coverage:calc; require 100% lines, statements, functions and branches. 5. Inspect final git status and branch calc. Full suite is due at Calc task 10 and is not part of this docs-only task.

## Verification

Pending the scoped acceptance commands.

## Rollback Plan

Revert only this task implementation commit, preserving existing Calc coordinate code and records.

## Findings

The original capability still listed sticky updates as future work after the second milestone implemented them. The registry README still described the initial inactive Calc state. Native fixture evidence executes sticky movement, so separate full address API parity remains unverified.
