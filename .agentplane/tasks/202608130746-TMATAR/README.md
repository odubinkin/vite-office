---
id: "202608130746-TMATAR"
title: "Align framework shortcut and dispatch paths with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T07:46:51.022Z"
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
    body: "Start: align bounded framework shortcut and dispatch modules with pinned LibreOffice paths."
events:
  -
    type: "status"
    at: "2026-08-13T07:46:51.672Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align bounded framework shortcut and dispatch modules with pinned LibreOffice paths."
doc_version: 3
doc_updated_at: "2026-08-13T07:46:51.672Z"
doc_updated_by: "CODER"
description: "Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior."
sections:
  Summary: |-
    Align framework shortcut and dispatch paths with LibreOffice

    Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
  Scope: |-
    - In scope: Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
    - Out of scope: unrelated refactors not required for "Align framework shortcut and dispatch paths with LibreOffice".
  Plan: "1. Rename framework/source/accelerators/browser-shortcuts and its co-located test to keymapping, retaining the browser shortcut API. 2. Rename framework/source/dispatch/commands and its co-located test to dispatchprovider, retaining typed browser command dispatch. 3. Update all imports, provenance, source-tree enforcement, and direct documentation without changing behavior. 4. Verify fast 100% coverage plus provenance, source-tree, docs, format, lint, type, stale-path, and diff checks; defer full verification to the next ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: renamed keymapping and dispatchprovider modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, and static quality all pass. 3. Run rg -n 'browser-shortcuts|source/dispatch/commands|from \"\\./commands\"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record residual risk."
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

Align framework shortcut and dispatch paths with LibreOffice

Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.

## Scope

- In scope: Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
- Out of scope: unrelated refactors not required for "Align framework shortcut and dispatch paths with LibreOffice".

## Plan

1. Rename framework/source/accelerators/browser-shortcuts and its co-located test to keymapping, retaining the browser shortcut API. 2. Rename framework/source/dispatch/commands and its co-located test to dispatchprovider, retaining typed browser command dispatch. 3. Update all imports, provenance, source-tree enforcement, and direct documentation without changing behavior. 4. Verify fast 100% coverage plus provenance, source-tree, docs, format, lint, type, stale-path, and diff checks; defer full verification to the next ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: renamed keymapping and dispatchprovider modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, and static quality all pass. 3. Run rg -n 'browser-shortcuts|source/dispatch/commands|from "\./commands"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
