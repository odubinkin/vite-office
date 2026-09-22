---
id: "202609220708-ACW8QC"
title: "Rebuild Writer browser UI boundary for P1"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609220707-9JA4S3"
tags:
  - "code"
  - "frontend"
  - "parity"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity"
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage && npm run test:e2e"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:54.521Z"
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
    at: "2026-09-22T08:20:49.103Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-22T08:20:49.103Z"
doc_updated_by: "CODER"
description: "Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration."
sections:
  Summary: |-
    Rebuild Writer browser UI boundary for P1

    Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.
  Scope: |-
    - In scope: Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.
    - Out of scope: unrelated refactors not required for "Rebuild Writer browser UI boundary for P1".
  Plan: |-
    1. Introduce a non-DOM Writer document-view/edit-window contract under sw/source/uibase/docvw and one browser DOM implementation.
    2. Consolidate selection, beforeinput, composition, pointer, clipboard, drag/drop, and focus translation behind that controller.
    3. Make Writer React components consume render-only projections and stable forwarded handlers; remove projection-ID mutations and per-render command queries.
    4. Add SfxControllerItem-like binding subscriptions and generate the complete resource/disposition graph, keeping browser additions explicit.
    5. Reduce presentation orchestration, update affected inventory/docs, and verify accessibility, menus, toolbar, dialogs, keyboard, IME, selection, clipboard, and command state.
  Verify Steps: |-
    1. Run focused controller, projection, bindings, presentation, and Writer component tests. Expected: React is projection-only and Writer operations work independently of React.
    2. Run npm run test:coverage && npm run test:e2e. Expected: unit/integration coverage and production browser flows pass for keyboard, focus, dialogs, selection, IME, clipboard, and command enablement.
    3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: complete disposition and ownership checks pass.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.
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

Rebuild Writer browser UI boundary for P1

Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.

## Scope

- In scope: Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.
- Out of scope: unrelated refactors not required for "Rebuild Writer browser UI boundary for P1".

## Plan

1. Introduce a non-DOM Writer document-view/edit-window contract under sw/source/uibase/docvw and one browser DOM implementation.
2. Consolidate selection, beforeinput, composition, pointer, clipboard, drag/drop, and focus translation behind that controller.
3. Make Writer React components consume render-only projections and stable forwarded handlers; remove projection-ID mutations and per-render command queries.
4. Add SfxControllerItem-like binding subscriptions and generate the complete resource/disposition graph, keeping browser additions explicit.
5. Reduce presentation orchestration, update affected inventory/docs, and verify accessibility, menus, toolbar, dialogs, keyboard, IME, selection, clipboard, and command state.

## Verify Steps

1. Run focused controller, projection, bindings, presentation, and Writer component tests. Expected: React is projection-only and Writer operations work independently of React.
2. Run npm run test:coverage && npm run test:e2e. Expected: unit/integration coverage and production browser flows pass for keyboard, focus, dialogs, selection, IME, clipboard, and command enablement.
3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: complete disposition and ownership checks pass.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
