---
id: "202609140510-T05E0J"
title: "Implement Stage 3 action-based Writer undo and redo"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T05:10:52.656Z"
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
    body: "Start: implement the approved Stage 3 action-based Writer undo/redo slice from pinned LibreOffice evidence, preserving current behavior and verification coverage."
events:
  -
    type: "status"
    at: "2026-09-14T05:10:58.375Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Stage 3 action-based Writer undo/redo slice from pinned LibreOffice evidence, preserving current behavior and verification coverage."
doc_version: 3
doc_updated_at: "2026-09-14T05:10:58.375Z"
doc_updated_by: "CODER"
description: "Implement section 7 of docs/program/vite-office-upstream-parity-plan.md using repository-local pinned LibreOffice SfxUndoManager and Writer undo-action evidence; remove full-document snapshots from the interactive path while preserving current behavior."
sections:
  Summary: "Replace the temporary snapshot-based Writer history with LibreOffice-aligned SfxUndoAction/SfxUndoManager ownership and semantic Writer undo actions for every currently implemented edit and formatting command."
  Scope: |-
    - In scope: Sfx undo abstractions and list/compound actions; Writer insert, delete, split, join, direct-format, paragraph-format, style, numbering, list-level, and replace/paste actions; action grouping; full PaM and pending cursor-attribute restoration; redo truncation; bounded history; interactive-path performance regression coverage.
    - Upstream constraint: derive behavior and naming from the pinned repository-local LibreOffice tree, especially sfx2/source/control/undo.cxx, include/sfx2/undo.hxx, and sw/source/core/undo; preserve existing browser-visible behavior without inventing features.
    - Approved implementation areas: apps/office/src/sfx2/source/doc, apps/office/src/sw/source/core/undo, apps/office/src/sw/source/uibase, and narrowly required parity/provenance test metadata.
    - Out of scope: Stage 4 input/selection redesign, new Writer features, network access, unrelated refactors, and edits to docs/program/vite-office-upstream-parity-plan.md.
  Plan: "Implement Stage 3 as one atomic CODER-owned vertical slice: establish upstream-aligned Sfx action history, add semantic Writer undo actions for every current command, migrate the persistent shell/session off full snapshots, preserve grouping/cursor/lifecycle behavior, add performance and regression coverage, and run the full repository verification contract."
  Verify Steps: |-
    1. Run npm run format:check. Expected: formatting passes.
    2. Run npm run lint. Expected: lint passes with no warnings.
    3. Run npm run typecheck. Expected: TypeScript checks pass.
    4. Run npm run check:dependencies. Expected: module-boundary validation passes.
    5. Run npm test -- --run. Expected: all unit and inventory tests pass, including Stage 3 coverage for every current mutation type, redo truncation, grouping boundaries, split/join structure, hint/item restoration, history limit, cursor restoration, and performance scaling.
    6. Run npm run build. Expected: production build succeeds.
    7. Run node .agentplane/policy/check-routing.mjs. Expected: routing policy passes.
    8. Run ap doctor. Expected: Agentplane repository checks pass.
    9. Inspect git status --short --untracked-files=all and search the interactive history path for full-document snapshot storage or SwDoc.clone(). Expected: only intentional task files plus the pre-existing user-owned plan are present, and interactive history contains actions/minimal payloads rather than full WriterDocument snapshots.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only implementation and task-lifecycle commits associated with 202609140510-T05E0J.
    - Restore the pre-Stage-3 snapshot adapter and shell history wiring if rollback is required.
    - Re-run the declared Verify Steps after rollback.
    - Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and remains outside task-owned edits.
  Findings: "- Pending implementation audit and verification."
id_source: "generated"
---
## Summary

Replace the temporary snapshot-based Writer history with LibreOffice-aligned SfxUndoAction/SfxUndoManager ownership and semantic Writer undo actions for every currently implemented edit and formatting command.

## Scope

- In scope: Sfx undo abstractions and list/compound actions; Writer insert, delete, split, join, direct-format, paragraph-format, style, numbering, list-level, and replace/paste actions; action grouping; full PaM and pending cursor-attribute restoration; redo truncation; bounded history; interactive-path performance regression coverage.
- Upstream constraint: derive behavior and naming from the pinned repository-local LibreOffice tree, especially sfx2/source/control/undo.cxx, include/sfx2/undo.hxx, and sw/source/core/undo; preserve existing browser-visible behavior without inventing features.
- Approved implementation areas: apps/office/src/sfx2/source/doc, apps/office/src/sw/source/core/undo, apps/office/src/sw/source/uibase, and narrowly required parity/provenance test metadata.
- Out of scope: Stage 4 input/selection redesign, new Writer features, network access, unrelated refactors, and edits to docs/program/vite-office-upstream-parity-plan.md.

## Plan

Implement Stage 3 as one atomic CODER-owned vertical slice: establish upstream-aligned Sfx action history, add semantic Writer undo actions for every current command, migrate the persistent shell/session off full snapshots, preserve grouping/cursor/lifecycle behavior, add performance and regression coverage, and run the full repository verification contract.

## Verify Steps

1. Run npm run format:check. Expected: formatting passes.
2. Run npm run lint. Expected: lint passes with no warnings.
3. Run npm run typecheck. Expected: TypeScript checks pass.
4. Run npm run check:dependencies. Expected: module-boundary validation passes.
5. Run npm test -- --run. Expected: all unit and inventory tests pass, including Stage 3 coverage for every current mutation type, redo truncation, grouping boundaries, split/join structure, hint/item restoration, history limit, cursor restoration, and performance scaling.
6. Run npm run build. Expected: production build succeeds.
7. Run node .agentplane/policy/check-routing.mjs. Expected: routing policy passes.
8. Run ap doctor. Expected: Agentplane repository checks pass.
9. Inspect git status --short --untracked-files=all and search the interactive history path for full-document snapshot storage or SwDoc.clone(). Expected: only intentional task files plus the pre-existing user-owned plan are present, and interactive history contains actions/minimal payloads rather than full WriterDocument snapshots.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only implementation and task-lifecycle commits associated with 202609140510-T05E0J.
- Restore the pre-Stage-3 snapshot adapter and shell history wiring if rollback is required.
- Re-run the declared Verify Steps after rollback.
- Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and remains outside task-owned edits.

## Findings

- Pending implementation audit and verification.
