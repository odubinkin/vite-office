---
id: "202610181638-N4JV15"
title: "Implement Calc native A1 formula input and output"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T16:39:05.933Z"
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
    body: "Start: Implement approved native A1 Calc formula input and serialization on the existing document and token owners, then verify Calc and touched shared serializer."
events:
  -
    type: "status"
    at: "2026-10-18T16:39:11.414Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native A1 Calc formula input and serialization on the existing document and token owners, then verify Calc and touched shared serializer."
doc_version: 3
doc_updated_at: "2026-10-18T16:39:11.414Z"
doc_updated_by: "CODER"
description: "Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks."
sections:
  Summary: |-
    Implement Calc native A1 formula input and output

    Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.
  Scope: |-
    - In scope: Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.
    - Out of scope: unrelated refactors not required for "Implement Calc native A1 formula input and output".
  Plan: "Add source-backed native/English OOO A1 conventions to existing ScCompiler and shared scalar serializer, preserving actual reference token flags, dirty/listening state and ODFF import/export. Add bidirectional native/ODFF document tests and keep unsupported languages/conventions explicit. Changes limited to compiler owners, directly affected tests and required registry records. User approved complete Calc plan on 2026-10-18. Next leaves deliver cell entry, view/input UI and shared file handling. No merges or network."
  Verify Steps: "1. npm run test:coverage:calc: all Calc scenarios pass with 100% coverage. 2. npm run typecheck --workspace @vite-office/office. 3. Run focused shared FormulaCompiler tests and 100% coverage for the touched shared serializer. 4. Run formatting/lint for touched files and dependency, docs, file-size, source-tree/provenance and Calc parity checks as applicable. Native A1 mixed absolute references must round-trip through ODFF without changing tokens/listeners or values; unsupported conventions must reject. Full regression deferred under user-approved once-per-ten-task cadence (first task of new UI cycle)."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement Calc native A1 formula input and output

Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.

## Scope

- In scope: Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.
- Out of scope: unrelated refactors not required for "Implement Calc native A1 formula input and output".

## Plan

Add source-backed native/English OOO A1 conventions to existing ScCompiler and shared scalar serializer, preserving actual reference token flags, dirty/listening state and ODFF import/export. Add bidirectional native/ODFF document tests and keep unsupported languages/conventions explicit. Changes limited to compiler owners, directly affected tests and required registry records. User approved complete Calc plan on 2026-10-18. Next leaves deliver cell entry, view/input UI and shared file handling. No merges or network.

## Verify Steps

1. npm run test:coverage:calc: all Calc scenarios pass with 100% coverage. 2. npm run typecheck --workspace @vite-office/office. 3. Run focused shared FormulaCompiler tests and 100% coverage for the touched shared serializer. 4. Run formatting/lint for touched files and dependency, docs, file-size, source-tree/provenance and Calc parity checks as applicable. Native A1 mixed absolute references must round-trip through ODFF without changing tokens/listeners or values; unsupported conventions must reject. Full regression deferred under user-approved once-per-ten-task cadence (first task of new UI cycle).

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
