---
id: "202611212341-5A4TN3"
title: "Connect Calc merged cells to the grid and commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611212311-DWTX6F"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T23:42:24.397Z"
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
    at: "2026-11-21T23:42:34.732Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T23:42:34.732Z"
doc_updated_by: "CODER"
description: "Connect persisted Calc merge spans to the browser grid and implement original merge, merge and center, and split commands through the source view, document, and undo contracts."
sections:
  Summary: "Connect existing Calc merged ranges to browser rendering and expose the source merge, merge-and-center, and split cell commands."
  Scope: "Calc grid painting, selection and hit testing, native ScCellShell and ScViewFunc dispatch, ScDocFunc and Undo changes for merge and unmerge, and the native merge contents dialog through the existing browser dialog broker. Reuse existing merge attributes, anchor and covered flags, persisted ranges, and editability checks. Use the pinned LibreOffice source and applicable fixture tests. Preserve the current file workflow."
  Plan: "Project existing merge spans into the grid, connect source merge and unmerge commands and contents dialog through native document and undo owners, port relevant upstream cases, and run focused verification."
  Verify Steps: |-
    - Run focused Calc Vitest cases for merge attributes, grid interaction, merge command state and contents dialog, merged-range undo and redo, and ODS/XLSX fixture paths affected by the change.
    - Run repository typecheck, lint and format on changed code, dependency, source provenance and UI resource checks, and AgentPlane routing and doctor.
    - Build the Calc browser app and exercise the merge, split, and undo flow in local Chromium.
    - Record exact commands and evidence. This is task three of the ten-task checkpoint interval.
  Verification: "Pending implementation."
  Rollback Plan: "Revert only the task's implementation commits. Existing imported merge data remains owned by the current Calc model and file codecs."
  Findings: "Pending inspection and verification."
id_source: "generated"
---
## Summary

Connect existing Calc merged ranges to browser rendering and expose the source merge, merge-and-center, and split cell commands.

## Scope

Calc grid painting, selection and hit testing, native ScCellShell and ScViewFunc dispatch, ScDocFunc and Undo changes for merge and unmerge, and the native merge contents dialog through the existing browser dialog broker. Reuse existing merge attributes, anchor and covered flags, persisted ranges, and editability checks. Use the pinned LibreOffice source and applicable fixture tests. Preserve the current file workflow.

## Plan

Project existing merge spans into the grid, connect source merge and unmerge commands and contents dialog through native document and undo owners, port relevant upstream cases, and run focused verification.

## Verify Steps

- Run focused Calc Vitest cases for merge attributes, grid interaction, merge command state and contents dialog, merged-range undo and redo, and ODS/XLSX fixture paths affected by the change.
- Run repository typecheck, lint and format on changed code, dependency, source provenance and UI resource checks, and AgentPlane routing and doctor.
- Build the Calc browser app and exercise the merge, split, and undo flow in local Chromium.
- Record exact commands and evidence. This is task three of the ten-task checkpoint interval.

## Verification

Pending implementation.

## Rollback Plan

Revert only the task's implementation commits. Existing imported merge data remains owned by the current Calc model and file codecs.

## Findings

Pending inspection and verification.
