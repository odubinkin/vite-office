---
id: "202608130742-YNRPC9"
title: "Align Sfx document history and storage paths with LibreOffice"
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
  updated_at: "2026-08-13T07:44:13.173Z"
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
    body: "Start: align bounded Sfx history and document-medium modules with exact pinned LibreOffice paths."
events:
  -
    type: "status"
    at: "2026-08-13T07:44:13.760Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align bounded Sfx history and document-medium modules with exact pinned LibreOffice paths."
doc_version: 3
doc_updated_at: "2026-08-13T07:44:13.760Z"
doc_updated_by: "CODER"
description: "Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior."
sections:
  Summary: |-
    Align Sfx document history and storage paths with LibreOffice

    Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
  Scope: |-
    - In scope: Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
    - Out of scope: unrelated refactors not required for "Align Sfx document history and storage paths with LibreOffice".
  Plan: "1. Rename sfx2/source/doc/history and its co-located test to docundomanager, retaining the bounded browser TransactionHistory API. 2. Rename storage and its co-located test to docfile, retaining the bounded browser document-medium persistence contract. 3. Update all imports, parity/provenance records, direct documentation links, and source-tree enforcement; make no Load/Save orchestration or format-compatibility change. 4. Verify 100% fast coverage plus provenance, source-tree, documentation, format, lint, type, stale-path, and diff checks. Full suite remains deferred until the next ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: renamed docundomanager and docfile modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'sfx2/source/doc/(history|storage)|from \"\\./(history|storage)\"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record the residual risk."
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

Align Sfx document history and storage paths with LibreOffice

Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.

## Scope

- In scope: Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
- Out of scope: unrelated refactors not required for "Align Sfx document history and storage paths with LibreOffice".

## Plan

1. Rename sfx2/source/doc/history and its co-located test to docundomanager, retaining the bounded browser TransactionHistory API. 2. Rename storage and its co-located test to docfile, retaining the bounded browser document-medium persistence contract. 3. Update all imports, parity/provenance records, direct documentation links, and source-tree enforcement; make no Load/Save orchestration or format-compatibility change. 4. Verify 100% fast coverage plus provenance, source-tree, documentation, format, lint, type, stale-path, and diff checks. Full suite remains deferred until the next ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: renamed docundomanager and docfile modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'sfx2/source/doc/(history|storage)|from "\./(history|storage)"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record the residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
