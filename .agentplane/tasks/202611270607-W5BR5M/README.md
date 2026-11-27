---
id: "202611270607-W5BR5M"
title: "Route Calc browser cell input through native EnterData and number format history"
status: "DOING"
priority: "med"
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
  updated_at: "2026-11-27T06:07:40.944Z"
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
    body: "Start: Connect original Calc plain-string entry and undo through the existing view and document owners."
events:
  -
    type: "status"
    at: "2026-11-27T06:07:41.353Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect original Calc plain-string entry and undo through the existing view and document owners."
doc_version: 3
doc_updated_at: "2026-11-27T06:07:41.353Z"
doc_updated_by: "CODER"
description: "Connect ordinary cell entry to source-backed ScViewFunc EnterData and SetNormalStringOperation. Restore native number recognition, selected-sheet grouped history and the original scientific Format Cells scenario through the normal editor."
sections:
  Summary: "Connect normal browser entry to the Calc view and document input operations, preserving recognized formats and undo."
  Scope: "Use pinned ScViewFunc EnterData formula admission and SetNormalStringOperation with the existing document recognizer. Preserve the current supported plain/formula entry, selected-sheet protection and grouped history. Restore direct number-format presence through undo and source string replay through redo. Keep rich-text and matrix owner boundaries unchanged. Port the scientific Format Cells UI case through actual user entry."
  Plan: "Use native EnterData dispatch, SetNormalStringOperation and ScUndoEnterData for the represented normal editor path and test original numeric recognition through the browser."
  Verify Steps: |-
    - Run focused Calc editor/controller, Format Cells, native AutoSum and number-recognition suites.
    - Confirm grouped selected-sheet updates and exact old-format presence or absence across undo and redo. Confirm the science format from browser entry and protected-sheet handling.
    - Run Office typecheck, changed-file lint and formatting, dependency/source-tree checks, scoped provenance, inventory checks, routing and doctor. Preserve the integrated baseline gate diagnostics.
  Verification: "Pending execution."
  Rollback Plan: "Revert the scoped implementation and capability records."
  Findings: "The integrated baseline asset link needs the local test-only Vite allowlist when running Calc presentation suites. Existing global provenance errors are tracked independently."
id_source: "generated"
---
## Summary

Connect normal browser entry to the Calc view and document input operations, preserving recognized formats and undo.

## Scope

Use pinned ScViewFunc EnterData formula admission and SetNormalStringOperation with the existing document recognizer. Preserve the current supported plain/formula entry, selected-sheet protection and grouped history. Restore direct number-format presence through undo and source string replay through redo. Keep rich-text and matrix owner boundaries unchanged. Port the scientific Format Cells UI case through actual user entry.

## Plan

Use native EnterData dispatch, SetNormalStringOperation and ScUndoEnterData for the represented normal editor path and test original numeric recognition through the browser.

## Verify Steps

- Run focused Calc editor/controller, Format Cells, native AutoSum and number-recognition suites.
- Confirm grouped selected-sheet updates and exact old-format presence or absence across undo and redo. Confirm the science format from browser entry and protected-sheet handling.
- Run Office typecheck, changed-file lint and formatting, dependency/source-tree checks, scoped provenance, inventory checks, routing and doctor. Preserve the integrated baseline gate diagnostics.

## Verification

Pending execution.

## Rollback Plan

Revert the scoped implementation and capability records.

## Findings

The integrated baseline asset link needs the local test-only Vite allowlist when running Calc presentation suites. Existing global provenance errors are tracked independently.
