---
id: "202611201340-7KEAF3"
title: "Align Calc ODS matrix and repeated formula ranges"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T13:40:29.662Z"
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
    body: "Start: Port native matrix formula geometry and cached member results through Calc ODS and Worker."
events:
  -
    type: "status"
    at: "2026-11-20T13:40:39.953Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port native matrix formula geometry and cached member results through Calc ODS and Worker."
doc_version: 3
doc_updated_at: "2026-11-20T13:40:39.953Z"
doc_updated_by: "CODER"
description: "Port the Calc document import owner and matrix formula master/reference cells, cached results, declared range export and Worker transfer. Preserve original repeated-formula placement and replay the pinned matrix ODS fixture."
sections:
  Summary: |-
    Align Calc ODS matrix and repeated formula ranges

    Port the Calc document import owner and matrix formula master/reference cells, cached results, declared range export and Worker transfer. Preserve original repeated-formula placement and replay the pinned matrix ODS fixture.
  Scope: "Calc formula and document import owners for matrix masters, references, result caches and represented calculation paths, ODS range and scalar import/export, shared XML tokens, Worker transfer, upstream fixtures and Calc suspected issues."
  Plan: "Create native matrix master and relative reference cells through ScDocumentImport. Use original result owners for declared geometry and cached results. Retain explicit spill blockers and single-position repeated formulas. Export only the matrix master with its span and formula. Preserve matrix identity and cached values through Worker. Verify against native ODS matrix data and represented matrix recalculation."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Exercise original matrix ODS geometry and cached values, repeated formula placement, package and Worker reopen.
    2. Run related Calc formula result, matrix token, and formula interpreter tests.
    3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Calc matrix formula ODS and Worker implementation, tests and audit notes."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc ODS matrix and repeated formula ranges

Port the Calc document import owner and matrix formula master/reference cells, cached results, declared range export and Worker transfer. Preserve original repeated-formula placement and replay the pinned matrix ODS fixture.

## Scope

Calc formula and document import owners for matrix masters, references, result caches and represented calculation paths, ODS range and scalar import/export, shared XML tokens, Worker transfer, upstream fixtures and Calc suspected issues.

## Plan

Create native matrix master and relative reference cells through ScDocumentImport. Use original result owners for declared geometry and cached results. Retain explicit spill blockers and single-position repeated formulas. Export only the matrix master with its span and formula. Preserve matrix identity and cached values through Worker. Verify against native ODS matrix data and represented matrix recalculation.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Exercise original matrix ODS geometry and cached values, repeated formula placement, package and Worker reopen.
2. Run related Calc formula result, matrix token, and formula interpreter tests.
3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Calc matrix formula ODS and Worker implementation, tests and audit notes.

## Findings
