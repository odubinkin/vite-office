---
id: "202609240501-81449V"
title: "Restore list selection undo and transfer invariants"
result_summary: "verified-202609240501-81449V"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202609231700-TZMGXV"
  - "202609240501-K41WJD"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T07:50:38.861Z"
  updated_by: "ORCHESTRATOR"
  note: "Approved as the Stage 5 work unit within the user-approved upstream parity plan."
verification:
  state: "ok"
  updated_at: "2026-09-24T08:06:40.589Z"
  updated_by: "CODER"
  note: "verified-202609240501-81449V"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T08:06:19.162Z"
  updated_by: "EVALUATOR"
  note: "Stage 5 Writer list invariants restored and full verification passed."
  evaluated_sha: "60f7c0bcd760e5397faf29f72c08491de852d9ec"
  blueprint_digest: "bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce"
  evidence_refs:
    - ".agentplane/tasks/202609240501-81449V/README.md"
    - ".agentplane/tasks/202609240501-81449V/quality/20260924-080619162-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240501-81449V/quality/20260924-080619162-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240501-81449V/quality/20260924-080619162-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240501-81449V/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/doc/list-invariants.test.ts"
    - "/tmp/vite-office-stage5-verify.log"
  findings:
    - "Pinned source behavior for counted list items, restart invalidation, list registration and level reparenting has focused assertions; 467 office tests and 14 browser tests passed."
commit:
  hash: "60f7c0bcd760e5397faf29f72c08491de852d9ec"
  message: "🧩 81449V code: restore Writer list counter invariants"
comments:
  -
    author: "CODER"
    body: "Start: audit reachable list, selection, undo and transfer invariants against pinned LibreOffice and repair source-backed mismatches."
  -
    author: "CODER"
    body: "Verified: verified-202609240501-81449V. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-24T07:50:43.455Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit reachable list, selection, undo and transfer invariants against pinned LibreOffice and repair source-backed mismatches."
  -
    type: "verify"
    at: "2026-09-24T08:06:13.693Z"
    author: "CODER"
    state: "ok"
    note: "Pinned ndtxt.cxx and SwNumberTree.cxx counter, restart and counted transitions checked by focused tests; npm run verify passed with 467 office tests at 100% coverage, inventory coverage and 14 browser tests."
  -
    type: "verify"
    at: "2026-09-24T08:06:40.589Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609240501-81449V"
  -
    type: "status"
    at: "2026-09-24T08:06:40.799Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609240501-81449V. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-24T08:06:40.801Z"
doc_updated_by: "CODER"
description: "Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task"
sections:
  Summary: |-
    Restore list selection undo and transfer invariants

    Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task
  Scope: |-
    - In scope: Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task.
    - Out of scope: unrelated refactors not required for "Restore list selection undo and transfer invariants".
  Plan: |-
    1. Inventory currently reachable list, PaM, text-node, undo and transfer operations from the Writer command slice and compare their item/position invariants with the pinned sw/source/core and sw/source/uibase sources. Reuse the already landed SwTransferable ownership work.
    2. Repair only demonstrated contract differences in matching upstream-shaped model or shell modules; keep DOM, Clipboard API and React projections in browser modules. Preserve supported split, merge, list restart, selected-range, copy/paste and undo behavior.
    3. Add operation-level source-backed tests for any repaired edge cases and update runtime inventory, command parity and provenance data without claiming unsupported native features.
    4. Run focused suites and npm run verify; review the task-scoped diff, record verification and evaluator evidence, then finish with a clean tracked checkout.
  Verify Steps: |-
    1. For each changed list, PaM, text-node, undo or transfer operation, identify a pinned upstream source/symbol and an assertion that checks the same reachable contract; keep unsupported structures explicit.
    2. Exercise list split/merge/restart, direction-preserving cross-paragraph selection, copy/cut/paste, and undo/redo where the approved audit finds a mismatch. Canonical SwDoc nodes, positions and pooled items must survive these transitions; browser DTOs remain projections.
    3. Existing transfer paths still pass focused SwTransferable, browser edit-window, workflow and clipboard tests. No storage, save schedule or recovery behavior changes.
    4. Update existing inventory/provenance data accurately; npm run verify passes, and the task-scoped diff and final tracked state are clean.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T08:06:13.693Z — VERIFY — ok

    By: CODER

    Note: Pinned ndtxt.cxx and SwNumberTree.cxx counter, restart and counted transitions checked by focused tests; npm run verify passed with 467 office tests at 100% coverage, inventory coverage and 14 browser tests.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T07:50:43.455Z, excerpt_hash=sha256:3989f922de7bcbb7ad3441411c700d30dffbe47e71c483d9d9f8f9b372b93e17

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-81449V/blueprint/resolved-snapshot.json
    - old_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
    - current_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-81449V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240501-81449V
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T08:06:40.589Z — VERIFY — ok

    By: CODER

    Note: verified-202609240501-81449V
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T08:06:13.775Z, excerpt_hash=sha256:3989f922de7bcbb7ad3441411c700d30dffbe47e71c483d9d9f8f9b372b93e17

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-81449V/blueprint/resolved-snapshot.json
    - old_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
    - current_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-81449V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609240501-81449V --result verified-202609240501-81449V --commit e62bbb2cefa80e757a22dbad3199a52612a34a7b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: Direct list identity, level, restart and counted transitions could leave numbering registration or counters stale.
      Impact: Visible labels and undo-restored list state could disagree with SwDoc canonical attributes.
      Resolution: Registered/reparented list nodes, invalidated counters, preserved counted items in snapshots and added source-backed assertions.
id_source: "generated"
---
## Summary

Restore list selection undo and transfer invariants

Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task

## Scope

- In scope: Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task.
- Out of scope: unrelated refactors not required for "Restore list selection undo and transfer invariants".

## Plan

1. Inventory currently reachable list, PaM, text-node, undo and transfer operations from the Writer command slice and compare their item/position invariants with the pinned sw/source/core and sw/source/uibase sources. Reuse the already landed SwTransferable ownership work.
2. Repair only demonstrated contract differences in matching upstream-shaped model or shell modules; keep DOM, Clipboard API and React projections in browser modules. Preserve supported split, merge, list restart, selected-range, copy/paste and undo behavior.
3. Add operation-level source-backed tests for any repaired edge cases and update runtime inventory, command parity and provenance data without claiming unsupported native features.
4. Run focused suites and npm run verify; review the task-scoped diff, record verification and evaluator evidence, then finish with a clean tracked checkout.

## Verify Steps

1. For each changed list, PaM, text-node, undo or transfer operation, identify a pinned upstream source/symbol and an assertion that checks the same reachable contract; keep unsupported structures explicit.
2. Exercise list split/merge/restart, direction-preserving cross-paragraph selection, copy/cut/paste, and undo/redo where the approved audit finds a mismatch. Canonical SwDoc nodes, positions and pooled items must survive these transitions; browser DTOs remain projections.
3. Existing transfer paths still pass focused SwTransferable, browser edit-window, workflow and clipboard tests. No storage, save schedule or recovery behavior changes.
4. Update existing inventory/provenance data accurately; npm run verify passes, and the task-scoped diff and final tracked state are clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T08:06:13.693Z — VERIFY — ok

By: CODER

Note: Pinned ndtxt.cxx and SwNumberTree.cxx counter, restart and counted transitions checked by focused tests; npm run verify passed with 467 office tests at 100% coverage, inventory coverage and 14 browser tests.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T07:50:43.455Z, excerpt_hash=sha256:3989f922de7bcbb7ad3441411c700d30dffbe47e71c483d9d9f8f9b372b93e17

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-81449V/blueprint/resolved-snapshot.json
- old_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
- current_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-81449V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240501-81449V
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T08:06:40.589Z — VERIFY — ok

By: CODER

Note: verified-202609240501-81449V
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T08:06:13.775Z, excerpt_hash=sha256:3989f922de7bcbb7ad3441411c700d30dffbe47e71c483d9d9f8f9b372b93e17

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-81449V/blueprint/resolved-snapshot.json
- old_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
- current_digest: bacfb03d975cfaabc4392c26373dadc7a8bd673d04355189ae3e925c492cacce
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-81449V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609240501-81449V --result verified-202609240501-81449V --commit e62bbb2cefa80e757a22dbad3199a52612a34a7b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: Direct list identity, level, restart and counted transitions could leave numbering registration or counters stale.
  Impact: Visible labels and undo-restored list state could disagree with SwDoc canonical attributes.
  Resolution: Registered/reparented list nodes, invalidated counters, preserved counted items in snapshots and added source-backed assertions.
