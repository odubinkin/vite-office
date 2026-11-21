---
id: "202611211959-7YBA20"
title: "Connect Calc Paste Transposed"
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
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T19:59:29.816Z"
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
    body: "Start: connect native transposed clipboard cells, references, patterns and the Calc command."
events:
  -
    type: "status"
    at: "2026-11-21T19:59:52.223Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native transposed clipboard cells, references, patterns and the Calc command."
doc_version: 3
doc_updated_at: "2026-11-21T19:59:52.223Z"
doc_updated_by: "CODER"
description: "Build the native transposed clipboard and connect the original Calc Paste Transposed command."
sections:
  Summary: "Connect the original Paste Transposed command through a temporary native clipboard document, transposed patterns and references, and the normal paste history."
  Scope: "Task nine of the ten-task cycle. Add the upstream transposed rectangular copy used by the Edit > Paste Special menu for same-workbook, supported unfiltered single selections. Preserve scalar and rich cells, direct styles and rotated borders, formula reference rules, warnings, selection geometry, command state and Undo/Redo. Preserve unsupported source merge, matrix, cut, link, multi-range and filtered paste boundaries of the current workbook slice. The source full Paste Special dialog is a separate workflow block."
  Plan: "Port the source rectangular clipboard transposition, reference shifting, pattern rotation and Paste Transposed command through shared confirmation and Undo."
  Verify Steps: "Run focused Calc clipboard, paste block and selection, reference, copied styles, rich text and mounted workspace tests. Run Office TypeScript, changed-path ESLint and Prettier, Calc resources and provenance, module boundaries, AgentPlane routing and doctor."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the scoped implementation commit to restore the previous clipboard command exposure and non-transposed paste."
  Findings: "Pending pinned source comparison."
id_source: "generated"
---
## Summary

Connect the original Paste Transposed command through a temporary native clipboard document, transposed patterns and references, and the normal paste history.

## Scope

Task nine of the ten-task cycle. Add the upstream transposed rectangular copy used by the Edit > Paste Special menu for same-workbook, supported unfiltered single selections. Preserve scalar and rich cells, direct styles and rotated borders, formula reference rules, warnings, selection geometry, command state and Undo/Redo. Preserve unsupported source merge, matrix, cut, link, multi-range and filtered paste boundaries of the current workbook slice. The source full Paste Special dialog is a separate workflow block.

## Plan

Port the source rectangular clipboard transposition, reference shifting, pattern rotation and Paste Transposed command through shared confirmation and Undo.

## Verify Steps

Run focused Calc clipboard, paste block and selection, reference, copied styles, rich text and mounted workspace tests. Run Office TypeScript, changed-path ESLint and Prettier, Calc resources and provenance, module boundaries, AgentPlane routing and doctor.

## Verification

Pending implementation.

## Rollback Plan

Revert the scoped implementation commit to restore the previous clipboard command exposure and non-transposed paste.

## Findings

Pending pinned source comparison.
