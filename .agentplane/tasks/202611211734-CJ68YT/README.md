---
id: "202611211734-CJ68YT"
title: "Connect Calc names from selection labels"
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
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:34:48.738Z"
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
    body: "Start: Connect the native Create Names dialog and selection-label name creation with indexed scope history."
events:
  -
    type: "status"
    at: "2026-11-21T17:34:49.097Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Create Names dialog and selection-label name creation with indexed scope history."
doc_version: 3
doc_updated_at: "2026-11-21T18:03:03.326Z"
doc_updated_by: "CODER"
description: "Expose the LibreOffice Create Names command using the existing indexed name collections, reference formatting, dialog service and range-name history."
sections:
  Summary: "Connect the original Calc Create Names command to the indexed range-name model and document history."
  Scope: "Calc source and browser range-name UI, dialog resources and commands, core/name creation, focused tests, and their source registry entries. Task 3 of the ten-task verification cycle."
  Plan: "Port the source selection defaults and orientation dialog. Reuse native cell/reference APIs to create names from edge labels, including valid-name conversion, replace/skip/cancel handling, and scope history. Verify against the source test scenarios and browser command entry points."
  Verify Steps: "Run focused Calc named-range, formula, selection, workbook and menu tests including the pinned tdf137617 Create Names scenarios, conflict handling and Undo. Run Office TypeScript, changed-path lint and format, generated Calc resources, source provenance, dependency boundaries, policy routing and AgentPlane doctor."
  Verification: "Pending implementation and focused checks."
  Rollback Plan: "Revert the source commit for this task to remove the new command and restore previous range-name entry points."
  Findings: |-
    - CALC-809 captures the original partial application when Cancel is selected in the replacement prompt. The browser preserves the earlier draft entries and stops further labels, with one scope Undo.
    - Range name creation reuses actual cell values and the indexed name model. The name box resolves local then global definitions by exact selected block, and formula input consults the document grammar.
    - The tdf137617 browser port sets the document grammar directly for the Excel R1C1 scenario. The Calc options UI is outside this task's scope.
    - AgentPlane doctor returned its existing hook shim readiness warning and no errors.
    - This is task 3 of the ten-task verification cycle. Full verification is due after seven more AgentPlane tasks.
id_source: "generated"
---
## Summary

Connect the original Calc Create Names command to the indexed range-name model and document history.

## Scope

Calc source and browser range-name UI, dialog resources and commands, core/name creation, focused tests, and their source registry entries. Task 3 of the ten-task verification cycle.

## Plan

Port the source selection defaults and orientation dialog. Reuse native cell/reference APIs to create names from edge labels, including valid-name conversion, replace/skip/cancel handling, and scope history. Verify against the source test scenarios and browser command entry points.

## Verify Steps

Run focused Calc named-range, formula, selection, workbook and menu tests including the pinned tdf137617 Create Names scenarios, conflict handling and Undo. Run Office TypeScript, changed-path lint and format, generated Calc resources, source provenance, dependency boundaries, policy routing and AgentPlane doctor.

## Verification

Pending implementation and focused checks.

## Rollback Plan

Revert the source commit for this task to remove the new command and restore previous range-name entry points.

## Findings

- CALC-809 captures the original partial application when Cancel is selected in the replacement prompt. The browser preserves the earlier draft entries and stops further labels, with one scope Undo.
- Range name creation reuses actual cell values and the indexed name model. The name box resolves local then global definitions by exact selected block, and formula input consults the document grammar.
- The tdf137617 browser port sets the document grammar directly for the Excel R1C1 scenario. The Calc options UI is outside this task's scope.
- AgentPlane doctor returned its existing hook shim readiness warning and no errors.
- This is task 3 of the ten-task verification cycle. Full verification is due after seven more AgentPlane tasks.
