---
id: "202608130726-S29A2K"
title: "Align active Writer source paths with LibreOffice module boundaries"
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
  state: "pending"
  updated_at: null
  updated_by: null
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
    body: "Start: move the approved active-module paths to their pinned LibreOffice boundaries, preserving behavior and traceability."
events:
  -
    type: "status"
    at: "2026-08-13T07:27:20.949Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: move the approved active-module paths to their pinned LibreOffice boundaries, preserving behavior and traceability."
doc_version: 3
doc_updated_at: "2026-08-13T07:28:33.266Z"
doc_updated_by: "CODER"
description: "Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior."
sections:
  Summary: |-
    Align active Writer source paths with LibreOffice module boundaries

    Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.
  Scope: |-
    - In scope: Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.
    - Out of scope: unrelated refactors not required for "Align active Writer source paths with LibreOffice module boundaries".
  Plan: "1. Move sfx2 document factory to sfx2/source/doc/docfac.ts, Writer paragraph-node helpers to sw/source/core/docnode/node.ts, and browser selection logic to sw/source/uibase/wrtsh/select.ts; move their colocated tests where applicable. 2. Update every production and test import plus the source-provenance manifest and source-tree documentation so each moved module names its exact pinned LibreOffice counterpart. 3. Preserve exports and behavior, remove the superseded paths, and document only genuine browser-only exceptions. 4. Verify the fast suite at 100 percent coverage, provenance/source-tree/docs/format/lint/type checks, and a repository search proving no superseded import remains. Full-suite cadence remains unchanged."
  Verify Steps: "1. Run npm run test:coverage. Expected: the renamed modules retain all fast tests at 100 percent coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'writer-paragraph-structure|writer-dom-selection|sfx2/source/doc/document' apps/office/src docs/program/source-provenance.json docs/program/source-tree.md. Expected: no active source, import, provenance, or source-tree reference remains. 4. Defer npm run verify and full browser matrix under the agreed ten-task cadence; record the residual risk."
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

Align active Writer source paths with LibreOffice module boundaries

Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.

## Scope

- In scope: Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.
- Out of scope: unrelated refactors not required for "Align active Writer source paths with LibreOffice module boundaries".

## Plan

1. Move sfx2 document factory to sfx2/source/doc/docfac.ts, Writer paragraph-node helpers to sw/source/core/docnode/node.ts, and browser selection logic to sw/source/uibase/wrtsh/select.ts; move their colocated tests where applicable. 2. Update every production and test import plus the source-provenance manifest and source-tree documentation so each moved module names its exact pinned LibreOffice counterpart. 3. Preserve exports and behavior, remove the superseded paths, and document only genuine browser-only exceptions. 4. Verify the fast suite at 100 percent coverage, provenance/source-tree/docs/format/lint/type checks, and a repository search proving no superseded import remains. Full-suite cadence remains unchanged.

## Verify Steps

1. Run npm run test:coverage. Expected: the renamed modules retain all fast tests at 100 percent coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'writer-paragraph-structure|writer-dom-selection|sfx2/source/doc/document' apps/office/src docs/program/source-provenance.json docs/program/source-tree.md. Expected: no active source, import, provenance, or source-tree reference remains. 4. Defer npm run verify and full browser matrix under the agreed ten-task cadence; record the residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
