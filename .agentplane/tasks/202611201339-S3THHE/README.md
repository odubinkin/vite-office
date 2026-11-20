---
id: "202611201339-S3THHE"
title: "Connect Calc manual outline grouping and detail commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "npm run check:calc-resources"
  - "npm run test:calc -- calc-sheet-outline"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T13:40:27.277Z"
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
    at: "2026-11-20T13:40:51.355Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T13:40:51.355Z"
doc_updated_by: "CODER"
description: "Expose native manual Group, Ungroup, Clear Outline, Hide Detail and Show Detail over the current outline tree and segmented row/column geometry. Preserve the source grouping dialog, command state, history and file persistence."
sections:
  Summary: "Connect manual row and column groups to the Calc Data menu."
  Scope: "Manual Group, Ungroup, Clear Outline, Show Detail and Hide Detail. Use the existing outline tree and row and column visibility owners. Match source dialog axis selection, undo, and file behavior. AutoOutline and DataPilot are separate operations."
  Plan: "Port and verify manual Calc outline commands and the native grouping dialog."
  Verify Steps: |-
    - `npm run test:calc -- calc-sheet-outline` exercises actual outline commands and state.
    - `npm run typecheck` checks app and tooling.
    - `npm run check:calc-resources` checks source paths.
    - `npm run check:source-provenance` and `git diff --check` check source ownership and patch.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the command implementation and preserve existing outline import and export."
  Findings: "Pending comparison."
id_source: "generated"
---
## Summary

Connect manual row and column groups to the Calc Data menu.

## Scope

Manual Group, Ungroup, Clear Outline, Show Detail and Hide Detail. Use the existing outline tree and row and column visibility owners. Match source dialog axis selection, undo, and file behavior. AutoOutline and DataPilot are separate operations.

## Plan

Port and verify manual Calc outline commands and the native grouping dialog.

## Verify Steps

- `npm run test:calc -- calc-sheet-outline` exercises actual outline commands and state.
- `npm run typecheck` checks app and tooling.
- `npm run check:calc-resources` checks source paths.
- `npm run check:source-provenance` and `git diff --check` check source ownership and patch.

## Verification

Pending implementation.

## Rollback Plan

Revert the command implementation and preserve existing outline import and export.

## Findings

Pending comparison.
