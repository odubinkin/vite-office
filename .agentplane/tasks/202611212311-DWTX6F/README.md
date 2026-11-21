---
id: "202611212311-DWTX6F"
title: "Connect Calc Text to Columns command and range import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202611212120-ADJVW8"
tags:
  - "calc"
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Calc Text to Columns, CSV import, range selection, clipboard, paste block and history tests. Include the relevant upstream selected range, whole column, typed format, and overwrite fixtures. Run Office TypeScript, changed-path lint and formatting, source provenance, Calc resources, module boundaries, routing and AgentPlane doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T23:11:24.277Z"
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
    body: "Start: connect the native Calc Text to Columns sheet range, dialog and import transaction."
events:
  -
    type: "status"
    at: "2026-11-21T23:11:40.413Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native Calc Text to Columns sheet range, dialog and import transaction."
doc_version: 3
doc_updated_at: "2026-11-21T23:11:40.413Z"
doc_updated_by: "CODER"
description: "Connect the source text-to-columns command to the existing Calc CSV dialog, one-column range admission, formatted-text export, overwrite admission and native list Undo."
sections:
  Summary: "Connect the source Calc Data > Text to Columns slot to the existing ASCII import dialog, current single-column data, native overwrite confirmation, and a grouped undo action."
  Scope: "Port SID_TEXT_TO_COLUMNS from sc/sdi and cellsh2.cxx. Preserve source range admission, empty state, selected start row, shrinking to used rows, formatted source cell text and native separator-free export. Reuse the fixed-width and delimiter dialog with the SC_TEXTTOCOLUMNS controls and independent preferences. Apply the accepted parsed cells through native import, number formats, broadcast and overwrite confirmation. Preserve one-step Text to Columns Undo and the clipboard and document I/O behavior outside this command."
  Plan: |-
    1. Resolve command state and the exact source range through the current Calc view and native document iteration.
    2. Connect the Data menu to the SC_TEXTTOCOLUMNS dialog and use its own defaults, selected source export and typed column options.
    3. Apply the import with native confirmation, formatted values, notifications and grouped undo. Preserve other clipboard and document workflows.
    4. Port the relevant upstream regressions and verify the related modules and real browser.
  Verify Steps: "Run focused Calc Vitest for Text to Columns, CSV import, selection range, paste confirmation, clipboard, UI resources and Undo. Port the relevant pinned textToColumns scenarios for selected ranges, whole-column shrink, typed and date values, already-formatted cells, empty fields and overwrite confirmation, including tdf51700, tdf69981 and tdf92423. Check disabled commands, canceled dialog or confirmation, stale destination, recalculation and one-step Undo/Redo. Run Office TypeScript, changed-path Prettier and ESLint, source provenance, Calc resources, dependencies, policy routing, and AgentPlane doctor. Verify the Data menu command in Chrome on the built application."
  Verification: "Pending implementation and scoped verification."
  Rollback Plan: "Revert the task commits to disable the source Text to Columns slot and restore the previous dialog bindings. Existing committed workbook changes remain under the native Undo history."
  Findings: "Pinned counterparts are the lcl_GetTextToColumnsRange, SID_TEXT_TO_COLUMNS execution and GetDBState branches in sc/source/ui/view/cellsh2.cxx, the SC_TEXTTOCOLUMNS dialog mode in sc/source/ui/dbgui/scuiasciiopt.cxx, and the TextToColumnsImport defaults in officecfg/registry/schema/org/openoffice/Office/Calc.xcs."
id_source: "generated"
---
## Summary

Connect the source Calc Data > Text to Columns slot to the existing ASCII import dialog, current single-column data, native overwrite confirmation, and a grouped undo action.

## Scope

Port SID_TEXT_TO_COLUMNS from sc/sdi and cellsh2.cxx. Preserve source range admission, empty state, selected start row, shrinking to used rows, formatted source cell text and native separator-free export. Reuse the fixed-width and delimiter dialog with the SC_TEXTTOCOLUMNS controls and independent preferences. Apply the accepted parsed cells through native import, number formats, broadcast and overwrite confirmation. Preserve one-step Text to Columns Undo and the clipboard and document I/O behavior outside this command.

## Plan

1. Resolve command state and the exact source range through the current Calc view and native document iteration.
2. Connect the Data menu to the SC_TEXTTOCOLUMNS dialog and use its own defaults, selected source export and typed column options.
3. Apply the import with native confirmation, formatted values, notifications and grouped undo. Preserve other clipboard and document workflows.
4. Port the relevant upstream regressions and verify the related modules and real browser.

## Verify Steps

Run focused Calc Vitest for Text to Columns, CSV import, selection range, paste confirmation, clipboard, UI resources and Undo. Port the relevant pinned textToColumns scenarios for selected ranges, whole-column shrink, typed and date values, already-formatted cells, empty fields and overwrite confirmation, including tdf51700, tdf69981 and tdf92423. Check disabled commands, canceled dialog or confirmation, stale destination, recalculation and one-step Undo/Redo. Run Office TypeScript, changed-path Prettier and ESLint, source provenance, Calc resources, dependencies, policy routing, and AgentPlane doctor. Verify the Data menu command in Chrome on the built application.

## Verification

Pending implementation and scoped verification.

## Rollback Plan

Revert the task commits to disable the source Text to Columns slot and restore the previous dialog bindings. Existing committed workbook changes remain under the native Undo history.

## Findings

Pinned counterparts are the lcl_GetTextToColumnsRange, SID_TEXT_TO_COLUMNS execution and GetDBState branches in sc/source/ui/view/cellsh2.cxx, the SC_TEXTTOCOLUMNS dialog mode in sc/source/ui/dbgui/scuiasciiopt.cxx, and the TextToColumnsImport defaults in officecfg/registry/schema/org/openoffice/Office/Calc.xcs.
