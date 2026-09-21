---
id: "202609211418-F0DACG"
title: "Implement Writer P1 upstream parity refactor"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T14:19:30.375Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T14:51:42.233Z"
  updated_by: "CODER"
  note: "verified-202609211418-F0DACG"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T14:51:32.758Z"
  updated_by: "EVALUATOR"
  note: "Writer P1 implementation satisfies approved scope and all repository gates."
  evaluated_sha: "15905862268bddd6e006a3d35fc33d890c69e20d"
  blueprint_digest: "d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9"
  evidence_refs:
    - ".agentplane/tasks/202609211418-F0DACG/README.md"
    - ".agentplane/tasks/202609211418-F0DACG/quality/20260921-145132758-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211418-F0DACG/quality/20260921-145132758-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211418-F0DACG/quality/20260921-145132758-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211418-F0DACG/blueprint/resolved-snapshot.json"
    - "npm run verify"
    - "commit 15905862268b"
  findings:
    - "Full verify passed with complete coverage, e2e, static build, source provenance, inventory, and policy checks."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-21T14:19:45.542Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-21T14:51:26.612Z"
    author: "CODER"
    state: "ok"
    note: "P1 implementation verified: targeted Vitest 91/91; full npm run verify passed with 352 unit tests and 95 inventory tests at 100% coverage, 11 Playwright e2e tests, static build, docs, source-tree, provenance, invariants, and parity checks; ap doctor and policy routing passed."
  -
    type: "verify"
    at: "2026-09-21T14:51:42.233Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211418-F0DACG"
doc_version: 3
doc_updated_at: "2026-09-21T14:51:42.285Z"
doc_updated_by: "CODER"
description: "Implement P1-1 through P1-6 from docs/program/vite-office-upstream-parity-plan.md against the pinned LibreOffice baseline. Preserve the existing inventory model while filling records accurately; do not add backward compatibility for changed persisted document schemas."
sections:
  Summary: "Refactor the supported Writer slice for P1-1 through P1-6 so mutation, shell, numbering, lifecycle, worker/storage, and ODT responsibilities follow the pinned LibreOffice ownership and contracts."
  Scope: "In scope: DocumentContentOperationsManager mutation ownership and range-based undo; upstream-shaped Writer shell and command partitioning; the exact currently supported SwNumRule/SwNumFormat subset; SfxObjectShell/SfxMedium-centered lifecycle; separate durable recovery, worker-transfer, and live filter contracts; property-level ODT behavior and errors; accurate updates to the existing runtime inventory model. Preserve browser adapters at explicit boundaries. Out of scope: expanding the P0-1 inventory mechanism, unsupported Writer feature families, other suite applications, and compatibility loading for superseded persisted schemas."
  Plan: "Implement approved P1-1 through P1-6 in dependency order: canonical mutation ownership; shell/command decomposition; upstream-shaped numbering subset; Sfx-centered lifecycle; separate durable/worker/filter contracts; granular ODT contracts; then inventory updates and full verification."
  Verify Steps: "1. Run targeted Vitest suites for core document operations, Writer shells/commands, undo, numbering, Sfx lifecycle/medium, storage/recovery codecs, worker protocol, and ODT import/export. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task changes plus the pre-existing modified task README outside this task."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T14:51:26.612Z — VERIFY — ok

    By: CODER

    Note: P1 implementation verified: targeted Vitest 91/91; full npm run verify passed with 352 unit tests and 95 inventory tests at 100% coverage, 11 Playwright e2e tests, static build, docs, source-tree, provenance, invariants, and parity checks; ap doctor and policy routing passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T14:19:45.542Z, excerpt_hash=sha256:4224c2133480783a7cc6b9bf0ee4c48a8904c0923474a12b153187340456f3e1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211418-F0DACG/blueprint/resolved-snapshot.json
    - old_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
    - current_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211418-F0DACG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211418-F0DACG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T14:51:42.233Z — VERIFY — ok

    By: CODER

    Note: verified-202609211418-F0DACG
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T14:51:26.667Z, excerpt_hash=sha256:4224c2133480783a7cc6b9bf0ee4c48a8904c0923474a12b153187340456f3e1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211418-F0DACG/blueprint/resolved-snapshot.json
    - old_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
    - current_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211418-F0DACG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211418-F0DACG --result verified-202609211418-F0DACG --commit 15905862268bddd6e006a3d35fc33d890c69e20d
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only commits and files attributed to task 202609211418-F0DACG. Persisted schema compatibility is intentionally not retained; rollback restores the prior schema and implementation together."
  Findings: |-
    - Observation: Writer P1 ownership and boundary changes pass all repository quality gates.
      Impact: Content mutations, shell ownership, numbering labels, lifecycle adapters, storage/worker contracts, and ODT claims are covered without expanding the P0 inventory mechanism.
      Resolution: Accepted implementation commit 15905862268b.
id_source: "generated"
---
## Summary

Refactor the supported Writer slice for P1-1 through P1-6 so mutation, shell, numbering, lifecycle, worker/storage, and ODT responsibilities follow the pinned LibreOffice ownership and contracts.

## Scope

In scope: DocumentContentOperationsManager mutation ownership and range-based undo; upstream-shaped Writer shell and command partitioning; the exact currently supported SwNumRule/SwNumFormat subset; SfxObjectShell/SfxMedium-centered lifecycle; separate durable recovery, worker-transfer, and live filter contracts; property-level ODT behavior and errors; accurate updates to the existing runtime inventory model. Preserve browser adapters at explicit boundaries. Out of scope: expanding the P0-1 inventory mechanism, unsupported Writer feature families, other suite applications, and compatibility loading for superseded persisted schemas.

## Plan

Implement approved P1-1 through P1-6 in dependency order: canonical mutation ownership; shell/command decomposition; upstream-shaped numbering subset; Sfx-centered lifecycle; separate durable/worker/filter contracts; granular ODT contracts; then inventory updates and full verification.

## Verify Steps

1. Run targeted Vitest suites for core document operations, Writer shells/commands, undo, numbering, Sfx lifecycle/medium, storage/recovery codecs, worker protocol, and ODT import/export. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task changes plus the pre-existing modified task README outside this task.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T14:51:26.612Z — VERIFY — ok

By: CODER

Note: P1 implementation verified: targeted Vitest 91/91; full npm run verify passed with 352 unit tests and 95 inventory tests at 100% coverage, 11 Playwright e2e tests, static build, docs, source-tree, provenance, invariants, and parity checks; ap doctor and policy routing passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T14:19:45.542Z, excerpt_hash=sha256:4224c2133480783a7cc6b9bf0ee4c48a8904c0923474a12b153187340456f3e1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211418-F0DACG/blueprint/resolved-snapshot.json
- old_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
- current_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211418-F0DACG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211418-F0DACG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T14:51:42.233Z — VERIFY — ok

By: CODER

Note: verified-202609211418-F0DACG
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T14:51:26.667Z, excerpt_hash=sha256:4224c2133480783a7cc6b9bf0ee4c48a8904c0923474a12b153187340456f3e1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211418-F0DACG/blueprint/resolved-snapshot.json
- old_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
- current_digest: d0c6f37f747c7aaa7e5428978274d0d3a06821436ba7aeaaa857e4c60a943fd9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211418-F0DACG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211418-F0DACG --result verified-202609211418-F0DACG --commit 15905862268bddd6e006a3d35fc33d890c69e20d
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only commits and files attributed to task 202609211418-F0DACG. Persisted schema compatibility is intentionally not retained; rollback restores the prior schema and implementation together.

## Findings

- Observation: Writer P1 ownership and boundary changes pass all repository quality gates.
  Impact: Content mutations, shell ownership, numbering labels, lifecycle adapters, storage/worker contracts, and ODT claims are covered without expanding the P0 inventory mechanism.
  Resolution: Accepted implementation commit 15905862268b.
