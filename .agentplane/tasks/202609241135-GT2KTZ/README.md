---
id: "202609241135-GT2KTZ"
title: "F5 Simplify Writer presentation layers"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241135-S2WG4Q"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T13:13:57.938Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T13:22:04.005Z"
  updated_by: "CODER"
  note: "Focused color and paragraph presenters preserve one bindings command bridge and one dialog request; full npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: split Writer presentation by interaction while preserving bindings and controller ownership."
events:
  -
    type: "status"
    at: "2026-09-24T13:14:08.267Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: split Writer presentation by interaction while preserving bindings and controller ownership."
  -
    type: "verify"
    at: "2026-09-24T13:22:04.005Z"
    author: "CODER"
    state: "ok"
    note: "Focused color and paragraph presenters preserve one bindings command bridge and one dialog request; full npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
doc_version: 3
doc_updated_at: "2026-09-24T13:22:04.092Z"
doc_updated_by: "CODER"
description: "Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility."
sections:
  Summary: |-
    F5 Simplify Writer presentation layers

    Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.
  Scope: |-
    - In scope: Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.
    - Out of scope: unrelated refactors not required for "F5 Simplify Writer presentation layers".
  Plan: "Split the oversized advanced formatting presenter by browser interaction into color selector, paragraph dialog, and their toolbar composition while keeping one WriterDialogController request and one BrowserCommandSource bridge. Reduce WriterFormattingToolbar selector adapters and wrapper logic only where generated resource identity and binding state remain intact; keep writer-view-projection the sole immutable view projection. Preserve current command labels, keyboard/focus, ruler, save behavior and source provenance. Verify each rendered control dispatches exactly once, no duplicate model authority is introduced, all existing presentation tests and full npm run verify pass, and exact inventory/provenance data are updated only when paths change."
  Verify Steps: "1. Writer advanced formatting is split into focused browser presenters for color controls and paragraph dialog while preserving one command bridge and one dialog request owner; no React component stores canonical model or layout state. 2. Generated Writer resource identities, placement and binding-backed values still drive menu/toolbar/keyboard/sidebar behavior; color, spacing, paragraph and line-number interactions dispatch exactly once, with accessible labels, focus and cancellation covered by tests. 3. The sole writer-view-projection and documented ruler boundary remain; imports, exact provenance/inventory data and full npm run verify plus git diff --check pass."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T13:22:04.005Z — VERIFY — ok

    By: CODER

    Note: Focused color and paragraph presenters preserve one bindings command bridge and one dialog request; full npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T13:14:08.267Z, excerpt_hash=sha256:6b44b771b8e3c0288cb5a1d2452c958d5cce0030c7a9f3c509a7224e3a9f8138

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-GT2KTZ/blueprint/resolved-snapshot.json
    - old_digest: 455b2da348c2c753c5846176b9a8486c7391e73cd108956e58d9675b01d5bfa7
    - current_digest: 455b2da348c2c753c5846176b9a8486c7391e73cd108956e58d9675b01d5bfa7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-GT2KTZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-GT2KTZ
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
  Findings: ""
id_source: "generated"
---
## Summary

F5 Simplify Writer presentation layers

Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.

## Scope

- In scope: Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.
- Out of scope: unrelated refactors not required for "F5 Simplify Writer presentation layers".

## Plan

Split the oversized advanced formatting presenter by browser interaction into color selector, paragraph dialog, and their toolbar composition while keeping one WriterDialogController request and one BrowserCommandSource bridge. Reduce WriterFormattingToolbar selector adapters and wrapper logic only where generated resource identity and binding state remain intact; keep writer-view-projection the sole immutable view projection. Preserve current command labels, keyboard/focus, ruler, save behavior and source provenance. Verify each rendered control dispatches exactly once, no duplicate model authority is introduced, all existing presentation tests and full npm run verify pass, and exact inventory/provenance data are updated only when paths change.

## Verify Steps

1. Writer advanced formatting is split into focused browser presenters for color controls and paragraph dialog while preserving one command bridge and one dialog request owner; no React component stores canonical model or layout state. 2. Generated Writer resource identities, placement and binding-backed values still drive menu/toolbar/keyboard/sidebar behavior; color, spacing, paragraph and line-number interactions dispatch exactly once, with accessible labels, focus and cancellation covered by tests. 3. The sole writer-view-projection and documented ruler boundary remain; imports, exact provenance/inventory data and full npm run verify plus git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T13:22:04.005Z — VERIFY — ok

By: CODER

Note: Focused color and paragraph presenters preserve one bindings command bridge and one dialog request; full npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T13:14:08.267Z, excerpt_hash=sha256:6b44b771b8e3c0288cb5a1d2452c958d5cce0030c7a9f3c509a7224e3a9f8138

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-GT2KTZ/blueprint/resolved-snapshot.json
- old_digest: 455b2da348c2c753c5846176b9a8486c7391e73cd108956e58d9675b01d5bfa7
- current_digest: 455b2da348c2c753c5846176b9a8486c7391e73cd108956e58d9675b01d5bfa7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-GT2KTZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-GT2KTZ
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
