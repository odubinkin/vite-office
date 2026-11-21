---
id: "202611210412-THMHTE"
title: "Align Calc ODS outline groups and print header boundaries"
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
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:12:14.228Z"
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
    body: "Start: port Calc row and column XML grouping and print title boundaries with pinned fixture checks."
events:
  -
    type: "status"
    at: "2026-11-21T04:12:22.068Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port Calc row and column XML grouping and print title boundaries with pinned fixture checks."
doc_version: 3
doc_updated_at: "2026-11-21T04:12:22.068Z"
doc_updated_by: "CODER"
description: "Match pinned LibreOffice ODF row and column grouping, collapse and control visibility, header wrappers, axis ordering, and bounded export for the connected Calc outline and print range model. Port applicable native regressions and verify save and reopen."
sections:
  Summary: "Port LibreOffice Calc ODS outline and repeated print-header handling to the connected outline and axis geometry model."
  Scope: "Calc XML row and column import contexts, sheet finalization, outline visibility, XML grouping and repeated print headers, native fixtures and their coverage. Document surprising pinned behavior when applicable. Preserve other formats and file workflow behavior."
  Plan: "Compare the pinned row, column, group and export owners. Port axis-specific context lifecycle and outline finalization, and align grouping/header boundaries, repeats, and sparse output. Replay the original outline and print-range fixtures and add focused cases for model and XML edges. Run scoped checks, record review and finish."
  Verify Steps: |-
    1. Run Calc ODS outline, sparse serialization, native column and row geometry, print range, and native outline tests. Include the pinned outline.ods and print-range.ods regressions and verify XML plus reimport.
    2. Run office typecheck, changed-file Prettier and ESLint, dependency guard, source provenance for changed owners, routing, doctor and git diff --check.
  Verification: "Pending implementation and focused verification."
  Rollback Plan: "Revert the implementation commits for this task. No migration is required."
  Findings: "Record upstream behavior and residual scope boundaries during verification."
id_source: "generated"
---
## Summary

Port LibreOffice Calc ODS outline and repeated print-header handling to the connected outline and axis geometry model.

## Scope

Calc XML row and column import contexts, sheet finalization, outline visibility, XML grouping and repeated print headers, native fixtures and their coverage. Document surprising pinned behavior when applicable. Preserve other formats and file workflow behavior.

## Plan

Compare the pinned row, column, group and export owners. Port axis-specific context lifecycle and outline finalization, and align grouping/header boundaries, repeats, and sparse output. Replay the original outline and print-range fixtures and add focused cases for model and XML edges. Run scoped checks, record review and finish.

## Verify Steps

1. Run Calc ODS outline, sparse serialization, native column and row geometry, print range, and native outline tests. Include the pinned outline.ods and print-range.ods regressions and verify XML plus reimport.
2. Run office typecheck, changed-file Prettier and ESLint, dependency guard, source provenance for changed owners, routing, doctor and git diff --check.

## Verification

Pending implementation and focused verification.

## Rollback Plan

Revert the implementation commits for this task. No migration is required.

## Findings

Record upstream behavior and residual scope boundaries during verification.
