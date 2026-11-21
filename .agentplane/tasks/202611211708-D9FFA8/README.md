---
id: "202611211708-D9FFA8"
title: "Connect Calc named range manager and name insertion"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:08:59.024Z"
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
    body: "Start: Connect native Calc named range draft management, hybrid formula updates and name insertion."
events:
  -
    type: "status"
    at: "2026-11-21T17:08:59.380Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native Calc named range draft management, hybrid formula updates and name insertion."
doc_version: 3
doc_updated_at: "2026-11-21T17:08:59.380Z"
doc_updated_by: "CODER"
description: "Expose native named expression editing and insertion, preserving scopes, token identities, dependent formulas and undo."
sections:
  Summary: "Expose the native Manage Names, Paste Names, and Paste List workflows."
  Scope: "Add source-shaped named range draft and all-scope commit/undo, formula reprocessing, browser dialogs and reference picking, and native paste operations. Task 2 of the ten-task verification cycle."
  Plan: "Implement source range manager snapshots and index-based hybrid recompile with grouped history. Connect the original manager, nested Add, reference input, and Insert dialogs to Calc dispatch. Verify rename, scope, add, remove, cancellation and paste with focused tests."
  Verify Steps: "Run focused Calc named range, formula, history, filter and menu tests including the source rename and undo scenario and paste operations. Run Office TypeScript, changed-path lint/format, provenance, module boundaries, policy routing and AgentPlane doctor."
  Verification: "Pending focused verification."
  Rollback Plan: "Revert task source commits to remove the new named range commands and editing paths."
  Findings: "Pending upstream comparison."
id_source: "generated"
---
## Summary

Expose the native Manage Names, Paste Names, and Paste List workflows.

## Scope

Add source-shaped named range draft and all-scope commit/undo, formula reprocessing, browser dialogs and reference picking, and native paste operations. Task 2 of the ten-task verification cycle.

## Plan

Implement source range manager snapshots and index-based hybrid recompile with grouped history. Connect the original manager, nested Add, reference input, and Insert dialogs to Calc dispatch. Verify rename, scope, add, remove, cancellation and paste with focused tests.

## Verify Steps

Run focused Calc named range, formula, history, filter and menu tests including the source rename and undo scenario and paste operations. Run Office TypeScript, changed-path lint/format, provenance, module boundaries, policy routing and AgentPlane doctor.

## Verification

Pending focused verification.

## Rollback Plan

Revert task source commits to remove the new named range commands and editing paths.

## Findings

Pending upstream comparison.
