---
id: "202611211917-S1T4WJ"
title: "Connect Calc cell clipboard commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T19:18:39.879Z"
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
    body: "Start: connect source Calc cell Copy, Paste and Paste Unformatted through browser transfer, native snapshots and undo."
events:
  -
    type: "status"
    at: "2026-11-21T19:18:40.951Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect source Calc cell Copy, Paste and Paste Unformatted through browser transfer, native snapshots and undo."
doc_version: 3
doc_updated_at: "2026-11-21T19:39:49.712Z"
doc_updated_by: "CODER"
description: "Activate native cell Copy, Paste and Paste Unformatted with browser transfer and shared undo."
sections:
  Summary: "Connect Calc cell Copy, Paste, and Paste Unformatted Text to the browser and native copy/paste owners."
  Scope: "Task seven of the ten-task cycle. Wire native Copy/Paste and Paste Unformatted source menu and shortcut routes, browser Clipboard events and permissions, within-workbook native documents and formats, plain tab-separated interchange, and paste selection and Undo. Preserve normal browser text clipboard ownership during formula editing. Cut and the Paste Special matrix of modes and dialog are a separate native workflow."
  Plan: "Wire the regular Calc clipboard and unformatted text commands through native snapshots, content/format paste and browser text transfer. Preserve active edit Clipboard ownership and native history, and port the relevant mounted source regressions."
  Verify Steps: "Run focused Calc clipboard, paste block, CSV admission and mounted workspace tests, Office TypeScript, changed-path ESLint and Prettier, Calc resource/provenance and module dependency checks, and AgentPlane policy routing and doctor."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the scoped implementation commit to restore the previous Calc clipboard dispatch and content insertion."
  Findings: |-
    The task follows the LibreOffice 26.8.0.2 copy and paste slots, clipboard document lifecycle, selected-area expansion, overwrite confirmation, Calc text import and native undo. The browser routes grid ClipboardEvents and menu commands through the same controller. Active formula and cell editors retain normal browser text ownership. A browser custom clipboard identity recovers same-workbook cell and pattern data. Browser or external payloads carrying only plain text enter through the text importer.

    The mounted checks exercise relative and absolute references, format copying, original Yes and No modal defaults, the overwrite preference, cancellation and Undo/Redo. Text import covers separators, typed columns, blank fields, rich paragraphs, date formats and external formulas at the target origin. Sheet-boundary overflow keeps the portion that fits and reports the pinned error. This source behavior is documented as CALC-814.

    The current native transfer covers supported simple active-sheet ranges and same-workbook clipboard identity. Desktop transfer formats, rich-device import controls, filtered or multiple native ranges, cut and the rest of the Paste Special modes remain separate source responsibilities. The browser warning preference follows the current workspace session.

    The supplemental global file-size check reports seven baseline violations. All seven files match the pre-task Git state, and every task source file falls below the 1,000-line limit. AgentPlane doctor returns OK with its existing managed-hook startup-readiness warning.
id_source: "generated"
---
## Summary

Connect Calc cell Copy, Paste, and Paste Unformatted Text to the browser and native copy/paste owners.

## Scope

Task seven of the ten-task cycle. Wire native Copy/Paste and Paste Unformatted source menu and shortcut routes, browser Clipboard events and permissions, within-workbook native documents and formats, plain tab-separated interchange, and paste selection and Undo. Preserve normal browser text clipboard ownership during formula editing. Cut and the Paste Special matrix of modes and dialog are a separate native workflow.

## Plan

Wire the regular Calc clipboard and unformatted text commands through native snapshots, content/format paste and browser text transfer. Preserve active edit Clipboard ownership and native history, and port the relevant mounted source regressions.

## Verify Steps

Run focused Calc clipboard, paste block, CSV admission and mounted workspace tests, Office TypeScript, changed-path ESLint and Prettier, Calc resource/provenance and module dependency checks, and AgentPlane policy routing and doctor.

## Verification

Pending implementation.

## Rollback Plan

Revert the scoped implementation commit to restore the previous Calc clipboard dispatch and content insertion.

## Findings

The task follows the LibreOffice 26.8.0.2 copy and paste slots, clipboard document lifecycle, selected-area expansion, overwrite confirmation, Calc text import and native undo. The browser routes grid ClipboardEvents and menu commands through the same controller. Active formula and cell editors retain normal browser text ownership. A browser custom clipboard identity recovers same-workbook cell and pattern data. Browser or external payloads carrying only plain text enter through the text importer.

The mounted checks exercise relative and absolute references, format copying, original Yes and No modal defaults, the overwrite preference, cancellation and Undo/Redo. Text import covers separators, typed columns, blank fields, rich paragraphs, date formats and external formulas at the target origin. Sheet-boundary overflow keeps the portion that fits and reports the pinned error. This source behavior is documented as CALC-814.

The current native transfer covers supported simple active-sheet ranges and same-workbook clipboard identity. Desktop transfer formats, rich-device import controls, filtered or multiple native ranges, cut and the rest of the Paste Special modes remain separate source responsibilities. The browser warning preference follows the current workspace session.

The supplemental global file-size check reports seven baseline violations. All seven files match the pre-task Git state, and every task source file falls below the 1,000-line limit. AgentPlane doctor returns OK with its existing managed-hook startup-readiness warning.
