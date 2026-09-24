---
id: "202609241135-WGR5X8"
title: "F1 Align Writer indent with MoveLeftMargin and NumUpDown"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T11:35:57.309Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T12:00:23.477Z"
  updated_by: "CODER"
  note: "F1 selected-range indent and list-level behavior match the pinned Writer slice; full npm run verify passed with 100% coverage and 14 browser tests."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement F1 from the approved upstream parity plan, preserving pinned Writer indent ownership and behavior."
events:
  -
    type: "status"
    at: "2026-09-24T11:35:58.576Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement F1 from the approved upstream parity plan, preserving pinned Writer indent ownership and behavior."
  -
    type: "verify"
    at: "2026-09-24T12:00:23.477Z"
    author: "CODER"
    state: "ok"
    note: "F1 selected-range indent and list-level behavior match the pinned Writer slice; full npm run verify passed with 100% coverage and 14 browser tests."
doc_version: 3
doc_updated_at: "2026-09-24T12:00:23.571Z"
doc_updated_by: "CODER"
description: "Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo."
sections:
  Summary: |-
    F1 Align Writer indent with MoveLeftMargin and NumUpDown

    Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.
  Scope: |-
    - In scope: Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.
    - Out of scope: unrelated refactors not required for "F1 Align Writer indent with MoveLeftMargin and NumUpDown".
  Plan: |-
    1. Compare pinned indent execution and enabled state with local shell, selection and document models.
    2. Move MoveLeftMargin calculation into SwDoc and selection traversal into an edit-shell owner, keeping text-shell slot choice; add focused differential tests.
    3. Update source provenance and runtime inventory data for changed modules and run all declared checks.
  Verify Steps: |-
    1. Focused Writer indent tests cover document default tab distance, multi-paragraph selection, list NumUpDown, undo/redo, both directions, modifier and layout bounds.
    2. Source ownership matches pinned textsh1.cxx, edattr.cxx and docfmt.cxx; no 1134 hardcode except upstream fallback.
    3. npm run verify passes; source provenance and runtime inventory data match changed paths.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T12:00:23.477Z — VERIFY — ok

    By: CODER

    Note: F1 selected-range indent and list-level behavior match the pinned Writer slice; full npm run verify passed with 100% coverage and 14 browser tests.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:00:19.175Z, excerpt_hash=sha256:e01f683435dda87c908d2092fd547dad38e00ef131fd1108dfbd0ef2f1c27fdf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-WGR5X8/blueprint/resolved-snapshot.json
    - old_digest: 15b8dbd5744417230b5a0200aa0bfe5b4d4d7c419ef5ca81cb0d173e03a30002
    - current_digest: 15b8dbd5744417230b5a0200aa0bfe5b4d4d7c419ef5ca81cb0d173e03a30002
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-WGR5X8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-WGR5X8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run verify. Result: pass. Evidence: 482 office unit tests, 98 inventory tests, both coverage sets 100%, 14 browser tests, static build, source tree, provenance and inventory gates passed. Scope: full repository verification of F1.
    Command: npx vitest run apps/office/src/sw/source/uibase/wrtsh/wrtsh-indent.test.ts. Result: pass. Evidence: 5 focused tests for document default tabs, selection, numbering, undo, modifier and frame width. Scope: F1 Writer indent behavior.
    Command: git diff --check; ap doctor. Result: pass. Evidence: no whitespace errors; doctor exited 0 with unrelated existing hook and historical task warnings. Scope: task diff and repository health.
id_source: "generated"
---
## Summary

F1 Align Writer indent with MoveLeftMargin and NumUpDown

Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.

## Scope

- In scope: Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.
- Out of scope: unrelated refactors not required for "F1 Align Writer indent with MoveLeftMargin and NumUpDown".

## Plan

1. Compare pinned indent execution and enabled state with local shell, selection and document models.
2. Move MoveLeftMargin calculation into SwDoc and selection traversal into an edit-shell owner, keeping text-shell slot choice; add focused differential tests.
3. Update source provenance and runtime inventory data for changed modules and run all declared checks.

## Verify Steps

1. Focused Writer indent tests cover document default tab distance, multi-paragraph selection, list NumUpDown, undo/redo, both directions, modifier and layout bounds.
2. Source ownership matches pinned textsh1.cxx, edattr.cxx and docfmt.cxx; no 1134 hardcode except upstream fallback.
3. npm run verify passes; source provenance and runtime inventory data match changed paths.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T12:00:23.477Z — VERIFY — ok

By: CODER

Note: F1 selected-range indent and list-level behavior match the pinned Writer slice; full npm run verify passed with 100% coverage and 14 browser tests.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:00:19.175Z, excerpt_hash=sha256:e01f683435dda87c908d2092fd547dad38e00ef131fd1108dfbd0ef2f1c27fdf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-WGR5X8/blueprint/resolved-snapshot.json
- old_digest: 15b8dbd5744417230b5a0200aa0bfe5b4d4d7c419ef5ca81cb0d173e03a30002
- current_digest: 15b8dbd5744417230b5a0200aa0bfe5b4d4d7c419ef5ca81cb0d173e03a30002
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-WGR5X8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-WGR5X8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run verify. Result: pass. Evidence: 482 office unit tests, 98 inventory tests, both coverage sets 100%, 14 browser tests, static build, source tree, provenance and inventory gates passed. Scope: full repository verification of F1.
Command: npx vitest run apps/office/src/sw/source/uibase/wrtsh/wrtsh-indent.test.ts. Result: pass. Evidence: 5 focused tests for document default tabs, selection, numbering, undo, modifier and frame width. Scope: F1 Writer indent behavior.
Command: git diff --check; ap doctor. Result: pass. Evidence: no whitespace errors; doctor exited 0 with unrelated existing hook and historical task warnings. Scope: task diff and repository health.
