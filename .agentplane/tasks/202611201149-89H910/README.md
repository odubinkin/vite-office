---
id: "202611201149-89H910"
title: "Connect Calc sheet tab visibility selection and color commands"
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
  - "npm run test:calc -- calc-sheet calc-goto-sheet sheet-visibility tab-color"
  - "npm run test:e2e:calc -- sheet-context-menu xlsx-tab-colors xlsx-sheet-visibility xlsx-sheet-group"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:51:06.529Z"
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
    at: "2026-11-20T11:51:32.525Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T11:51:32.525Z"
doc_updated_by: "CODER"
description: "Connect native Hide, Show, SelectTables and SetTabBgColor slots to the actual Calc sheet state, shared menus, dialogs and undo. Use local pinned LibreOffice sources and focused tests of browser commands and file persistence."
sections:
  Summary: "Connect the upstream Hide, Show, SelectTables and SetTabBgColor sheet-tab commands to the existing Calc document and view."
  Scope: "Calc sheet command/workflow owners, document operations and history for visibility and color, native-shaped dialog presentation, shared menu consumption, and focused tests. Record any suspected upstream issue in the program ledgers. Use the approved local LibreOffice reference read."
  Plan: "Port the pinned sheet-tab slot state, execution, dialog widgets and document/history operations; validate group and visibility rules and ODS/XLSX persistence with focused tests."
  Verify Steps: |-
    - `npm run test:calc -- calc-sheet calc-goto-sheet sheet-visibility tab-color` exercises related Calc workflows, document state and dialog regressions.
    - `npm run typecheck` checks app and tooling contracts.
    - `npm run check:calc-resources` checks source-backed menu resources.
    - `npm run test:e2e:calc -- sheet-context-menu xlsx-tab-colors xlsx-sheet-visibility xlsx-sheet-group` verifies the built browser paths.
    - `git diff --check` validates patch whitespace.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task implementation while preserving existing import/export visibility and color owners."
  Findings: "Pending source comparison."
id_source: "generated"
---
## Summary

Connect the upstream Hide, Show, SelectTables and SetTabBgColor sheet-tab commands to the existing Calc document and view.

## Scope

Calc sheet command/workflow owners, document operations and history for visibility and color, native-shaped dialog presentation, shared menu consumption, and focused tests. Record any suspected upstream issue in the program ledgers. Use the approved local LibreOffice reference read.

## Plan

Port the pinned sheet-tab slot state, execution, dialog widgets and document/history operations; validate group and visibility rules and ODS/XLSX persistence with focused tests.

## Verify Steps

- `npm run test:calc -- calc-sheet calc-goto-sheet sheet-visibility tab-color` exercises related Calc workflows, document state and dialog regressions.
- `npm run typecheck` checks app and tooling contracts.
- `npm run check:calc-resources` checks source-backed menu resources.
- `npm run test:e2e:calc -- sheet-context-menu xlsx-tab-colors xlsx-sheet-visibility xlsx-sheet-group` verifies the built browser paths.
- `git diff --check` validates patch whitespace.

## Verification

Pending implementation.

## Rollback Plan

Revert the task implementation while preserving existing import/export visibility and color owners.

## Findings

Pending source comparison.
