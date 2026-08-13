---
id: "202608130801-PT07QR"
title: "Consolidate Writer text shell ownership"
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
  updated_at: "2026-08-13T08:01:52.852Z"
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
    body: "Start: consolidate the Writer text-shell hook into its single mapped module."
events:
  -
    type: "status"
    at: "2026-08-13T08:01:53.459Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: consolidate the Writer text-shell hook into its single mapped module."
doc_version: 3
doc_updated_at: "2026-08-13T08:01:53.459Z"
doc_updated_by: "CODER"
description: "Move the browser undo and redo shortcut hook into sw/source/uibase/shells/textsh.ts, the single local module mapped to pinned sw/source/uibase/shells/textsh.cxx. Update the Writer view import and remove the duplicate mapped helper while preserving keyboard behavior, documentation, provenance, and coverage."
sections:
  Summary: |-
    Consolidate Writer text shell ownership

    Move the browser undo and redo shortcut hook into sw/source/uibase/shells/textsh.ts, the single local module mapped to pinned sw/source/uibase/shells/textsh.cxx. Update the Writer view import and remove the duplicate mapped helper while preserving keyboard behavior, documentation, provenance, and coverage.
  Scope: |-
    - In scope: Move the browser undo and redo shortcut hook into sw/source/uibase/shells/textsh.ts, the single local module mapped to pinned sw/source/uibase/shells/textsh.cxx. Update the Writer view import and remove the duplicate mapped helper while preserving keyboard behavior, documentation, provenance, and coverage.
    - Out of scope: unrelated refactors not required for "Consolidate Writer text shell ownership".
  Plan: "1. Move the documented Writer undo/redo shortcut hook and its option type into textsh.ts alongside existing browser-owned Copy/download commands. 2. Update the Writer view to import the hook from textsh.ts and remove use-writer-history-shortcuts.ts. 3. Remove the duplicate provenance entry and update source-tree wording so textsh is the single mapped command-shell ownership boundary. 4. Run fast coverage plus format, lint, types, JSDoc, provenance, source-tree, file-size, and diff checks. Scope excludes shortcut behavior changes, command registration redesign, and the deferred full-suite cadence."
  Verify Steps: "1. Run npm run test:coverage; expected: 100% fast coverage remains intact, including undo/redo shortcut behavior. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass and textsh.ts is the only local module mapped to textsh.cxx. 3. Run git diff --check and search for use-writer-history-shortcuts; expected: no implementation or provenance reference remains and only scoped changes/task artifacts are present."
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

Consolidate Writer text shell ownership

Move the browser undo and redo shortcut hook into sw/source/uibase/shells/textsh.ts, the single local module mapped to pinned sw/source/uibase/shells/textsh.cxx. Update the Writer view import and remove the duplicate mapped helper while preserving keyboard behavior, documentation, provenance, and coverage.

## Scope

- In scope: Move the browser undo and redo shortcut hook into sw/source/uibase/shells/textsh.ts, the single local module mapped to pinned sw/source/uibase/shells/textsh.cxx. Update the Writer view import and remove the duplicate mapped helper while preserving keyboard behavior, documentation, provenance, and coverage.
- Out of scope: unrelated refactors not required for "Consolidate Writer text shell ownership".

## Plan

1. Move the documented Writer undo/redo shortcut hook and its option type into textsh.ts alongside existing browser-owned Copy/download commands. 2. Update the Writer view to import the hook from textsh.ts and remove use-writer-history-shortcuts.ts. 3. Remove the duplicate provenance entry and update source-tree wording so textsh is the single mapped command-shell ownership boundary. 4. Run fast coverage plus format, lint, types, JSDoc, provenance, source-tree, file-size, and diff checks. Scope excludes shortcut behavior changes, command registration redesign, and the deferred full-suite cadence.

## Verify Steps

1. Run npm run test:coverage; expected: 100% fast coverage remains intact, including undo/redo shortcut behavior. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass and textsh.ts is the only local module mapped to textsh.cxx. 3. Run git diff --check and search for use-writer-history-shortcuts; expected: no implementation or provenance reference remains and only scoped changes/task artifacts are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
