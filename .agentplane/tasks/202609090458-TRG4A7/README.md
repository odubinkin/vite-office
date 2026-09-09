---
id: "202609090458-TRG4A7"
title: "Fix Writer contenteditable crash and typing stalls"
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
  updated_at: "2026-09-09T04:59:13.497Z"
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
    body: "Start: fix browser-owned editable DOM reconciliation and implement LibreOffice-aligned typing undo grouping with focused regression coverage."
events:
  -
    type: "status"
    at: "2026-09-09T04:59:28.677Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: fix browser-owned editable DOM reconciliation and implement LibreOffice-aligned typing undo grouping with focused regression coverage."
doc_version: 3
doc_updated_at: "2026-09-09T04:59:28.677Z"
doc_updated_by: "CODER"
description: "Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics."
sections:
  Summary: |-
    Fix Writer contenteditable crash and typing stalls

    Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.
  Scope: |-
    - In scope: Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.
    - Out of scope: unrelated refactors not required for "Fix Writer contenteditable crash and typing stalls".
  Plan: "1. Inspect pinned upstream LibreOffice text editing and undo-manager paths that govern typing grouping, deletion, and document mutation. 2. Add regression coverage for browser-mutated formatted contenteditable deletion and bounded/coalesced typing history. 3. Refactor the editable paragraph DOM boundary so React does not reconcile descendants mutated by the browser while preserving semantic formatting and caret behavior. 4. Implement LO-aligned typing undo grouping and a defensible memory bound without changing non-typing transaction semantics. 5. Run focused unit/component/E2E checks plus repository policy validation."
  Verify Steps: |-
    - Run the focused Writer editable-view test suite and confirm deletion inside formatted content no longer throws a DOM NotFoundError.
    - Run transaction-history and Writer workbench tests covering typing coalescence, undo boundaries, redo truncation, formatting, caret restoration, and long input.
    - Run the relevant Writer browser E2E scenario in Chromium for native input/deletion.
    - Run the office typecheck/test checks selected by the repository package scripts.
    - Run ap doctor and node .agentplane/policy/check-routing.mjs.
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

Fix Writer contenteditable crash and typing stalls

Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.

## Scope

- In scope: Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.
- Out of scope: unrelated refactors not required for "Fix Writer contenteditable crash and typing stalls".

## Plan

1. Inspect pinned upstream LibreOffice text editing and undo-manager paths that govern typing grouping, deletion, and document mutation. 2. Add regression coverage for browser-mutated formatted contenteditable deletion and bounded/coalesced typing history. 3. Refactor the editable paragraph DOM boundary so React does not reconcile descendants mutated by the browser while preserving semantic formatting and caret behavior. 4. Implement LO-aligned typing undo grouping and a defensible memory bound without changing non-typing transaction semantics. 5. Run focused unit/component/E2E checks plus repository policy validation.

## Verify Steps

- Run the focused Writer editable-view test suite and confirm deletion inside formatted content no longer throws a DOM NotFoundError.
- Run transaction-history and Writer workbench tests covering typing coalescence, undo boundaries, redo truncation, formatting, caret restoration, and long input.
- Run the relevant Writer browser E2E scenario in Chromium for native input/deletion.
- Run the office typecheck/test checks selected by the repository package scripts.
- Run ap doctor and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
