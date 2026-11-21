---
id: "202611210412-B3P0ZB"
title: "Connect persisted Calc outline symbols and sheet tab visibility"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611201413-9GPC0D"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:13:40.274Z"
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
    at: "2026-11-21T04:14:01.519Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T04:14:01.519Z"
doc_updated_by: "CODER"
description: "Apply the native outline symbol and sheet tab visibility settings across desktop ODS and XLSX view import/export, worker transport, and the mounted Calc workspace. Preserve grouping data and sheet shortcuts when controls are hidden."
sections:
  Summary: "Connect the original outline symbol and sheet tabs visibility to the mounted Calc workspace and document view settings."
  Scope: "Use ScViewOptions ownership. Carry IsOutlineSymbolsSet and HasSheetTabs through ODS, XLSX and the Calc Worker. XLSX uses the active sheet’s first view and the first workbook view. Keep grouped ranges, independent sheet selection, keyboard navigation and native defaults for absent settings. Adapt the existing tab strip and outline panels without changing save/open policy."
  Plan: "Wire native outline and sheet-tab flags through ODS, XLSX, Worker and workbench, and verify the native defaults and view precedence."
  Verify Steps: |-
    - Run targeted Calc tests for viewdata.settings, Calc view options, the outline window and sheet tab dialogs.
    - Run office and tools TypeScript checks.
    - Run changed-file lint and formatting, Calc resources and source provenance, authored file size and git whitespace checks.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit to restore the prior persisted option set."
  Findings: "Pending verification."
id_source: "generated"
---
## Summary

Connect the original outline symbol and sheet tabs visibility to the mounted Calc workspace and document view settings.

## Scope

Use ScViewOptions ownership. Carry IsOutlineSymbolsSet and HasSheetTabs through ODS, XLSX and the Calc Worker. XLSX uses the active sheet’s first view and the first workbook view. Keep grouped ranges, independent sheet selection, keyboard navigation and native defaults for absent settings. Adapt the existing tab strip and outline panels without changing save/open policy.

## Plan

Wire native outline and sheet-tab flags through ODS, XLSX, Worker and workbench, and verify the native defaults and view precedence.

## Verify Steps

- Run targeted Calc tests for viewdata.settings, Calc view options, the outline window and sheet tab dialogs.
- Run office and tools TypeScript checks.
- Run changed-file lint and formatting, Calc resources and source provenance, authored file size and git whitespace checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit to restore the prior persisted option set.

## Findings

Pending verification.
