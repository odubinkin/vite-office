---
id: "202608130748-DYREYF"
title: "Decompose Writer Format menu within LibreOffice uiconfig hierarchy"
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
  updated_at: "2026-08-13T07:49:00.346Z"
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
    body: "Start: decompose the Writer Format menu within the pinned uiconfig hierarchy."
events:
  -
    type: "status"
    at: "2026-08-13T07:49:00.942Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: decompose the Writer Format menu within the pinned uiconfig hierarchy."
doc_version: 3
doc_updated_at: "2026-08-13T07:49:00.942Z"
doc_updated_by: "CODER"
description: "Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage."
sections:
  Summary: |-
    Decompose Writer Format menu within LibreOffice uiconfig hierarchy

    Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.
  Scope: |-
    - In scope: Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.
    - Out of scope: unrelated refactors not required for "Decompose Writer Format menu within LibreOffice uiconfig hierarchy".
  Plan: "1. Extract the Format menu and Bullets and Numbering nested menu from menubar.tsx into a documented co-located React module under sw/uiconfig/swriter/menubar. 2. Preserve menu labels, roles, disabled and active states, callbacks, and pinned command order; leave top-level menu state ownership in menubar.tsx. 3. Update or add focused component tests for Format menu rendering and interaction. 4. Verify fast 100% coverage, focused menu e2e, file-size reduction, JSDoc, formatting, lint, types, and source-tree/provenance gates; defer full suite until the next ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: the menu decomposition retains 100 percent fast-test coverage. 2. Run npm run test:e2e -- --grep 'Writer bullets and numbering'. Expected: the browser still exposes and executes the Format list menu flow. 3. Run npm run check:file-size && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && npm run check:source-tree && npm run check:source-provenance && git diff --check. Expected: menubar.tsx falls below the decomposition-candidate threshold and all quality gates pass. 4. Defer npm run verify/full browser matrix under the agreed ten-task cadence; record residual risk."
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

Decompose Writer Format menu within LibreOffice uiconfig hierarchy

Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.

## Scope

- In scope: Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.
- Out of scope: unrelated refactors not required for "Decompose Writer Format menu within LibreOffice uiconfig hierarchy".

## Plan

1. Extract the Format menu and Bullets and Numbering nested menu from menubar.tsx into a documented co-located React module under sw/uiconfig/swriter/menubar. 2. Preserve menu labels, roles, disabled and active states, callbacks, and pinned command order; leave top-level menu state ownership in menubar.tsx. 3. Update or add focused component tests for Format menu rendering and interaction. 4. Verify fast 100% coverage, focused menu e2e, file-size reduction, JSDoc, formatting, lint, types, and source-tree/provenance gates; defer full suite until the next ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: the menu decomposition retains 100 percent fast-test coverage. 2. Run npm run test:e2e -- --grep 'Writer bullets and numbering'. Expected: the browser still exposes and executes the Format list menu flow. 3. Run npm run check:file-size && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && npm run check:source-tree && npm run check:source-provenance && git diff --check. Expected: menubar.tsx falls below the decomposition-candidate threshold and all quality gates pass. 4. Defer npm run verify/full browser matrix under the agreed ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
