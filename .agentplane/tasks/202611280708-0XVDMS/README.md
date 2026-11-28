---
id: "202611280708-0XVDMS"
title: "Port Calc ODS loaded deletion and movement actions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T07:09:15.917Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T07:23:24.357Z"
  updated_by: "CODER"
  note: "All 18 focused Calc tests passed, covering original fixtures, deletion and movement, generated snapshots, cutoffs, print ranges and Worker. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T07:23:25.250Z"
  updated_by: "EVALUATOR"
  note: "Native Calc change tracking deletion and movement contracts verified through ODS and Worker."
  evaluated_sha: "ba9e4ad586681cf9c8206d65c3f564358a8ab0fe"
  blueprint_digest: "d46d8126808478a341adf608a5754a6ec8c407db92ad1a2d0cd76c92cd95c83d"
  evidence_refs:
    - ".agentplane/tasks/202611280708-0XVDMS/README.md"
    - ".agentplane/tasks/202611280708-0XVDMS/quality/20261128-072325250-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280708-0XVDMS/quality/20261128-072325250-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280708-0XVDMS/quality/20261128-072325250-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280708-0XVDMS/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-delete-move-verification.md"
  findings:
    - "Original fixtures and focused package round trips passed with current cell values preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port original loaded deletion and movement ownership, generated cells and cutoffs."
events:
  -
    type: "status"
    at: "2026-11-28T07:09:17.069Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original loaded deletion and movement ownership, generated cells and cutoffs."
  -
    type: "verify"
    at: "2026-11-28T07:23:24.357Z"
    author: "CODER"
    state: "ok"
    note: "All 18 focused Calc tests passed, covering original fixtures, deletion and movement, generated snapshots, cutoffs, print ranges and Worker. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed."
doc_version: 3
doc_updated_at: "2026-11-28T07:23:24.462Z"
doc_updated_by: "CODER"
description: "Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history."
sections:
  Summary: |-
    Port Calc ODS loaded deletion and movement actions

    Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.
  Scope: |-
    - In scope: Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.
    - Out of scope: unrelated refactors not required for "Port Calc ODS loaded deletion and movement actions".
  Plan: "Port the loaded native deletion and movement action families with whole-axis or source/target range ownership and original deletion offsets, linked deleted actions, generated cell snapshots and insertion/movement cutoffs. Use original multi-pass hydration and serialize the same dependencies through ODS and Worker, preserving the existing rejection dispatch and unaffected workbook state. Verify the existing tracking, print and Worker suites and one critical package roundtrip. Document suspicious pinned behavior. Leave interactive tracking and accept/reject commands outside this serialization task."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Calc ODS loaded deletion and movement actions". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Calc ODS loaded deletion and movement actions". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T07:23:24.357Z — VERIFY — ok

    By: CODER

    Note: All 18 focused Calc tests passed, covering original fixtures, deletion and movement, generated snapshots, cutoffs, print ranges and Worker. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T07:09:17.069Z, excerpt_hash=sha256:56a5422558b88aaa74d3234230034b5800a1663dfb629bb6f2e99201c41074f8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280708-0XVDMS/blueprint/resolved-snapshot.json
    - old_digest: d46d8126808478a341adf608a5754a6ec8c407db92ad1a2d0cd76c92cd95c83d
    - current_digest: d46d8126808478a341adf608a5754a6ec8c407db92ad1a2d0cd76c92cd95c83d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280708-0XVDMS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280708-0XVDMS
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

Port Calc ODS loaded deletion and movement actions

Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.

## Scope

- In scope: Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.
- Out of scope: unrelated refactors not required for "Port Calc ODS loaded deletion and movement actions".

## Plan

Port the loaded native deletion and movement action families with whole-axis or source/target range ownership and original deletion offsets, linked deleted actions, generated cell snapshots and insertion/movement cutoffs. Use original multi-pass hydration and serialize the same dependencies through ODS and Worker, preserving the existing rejection dispatch and unaffected workbook state. Verify the existing tracking, print and Worker suites and one critical package roundtrip. Document suspicious pinned behavior. Leave interactive tracking and accept/reject commands outside this serialization task.

## Verify Steps

PLANNER fallback scaffold for "Port Calc ODS loaded deletion and movement actions". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Calc ODS loaded deletion and movement actions". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T07:23:24.357Z — VERIFY — ok

By: CODER

Note: All 18 focused Calc tests passed, covering original fixtures, deletion and movement, generated snapshots, cutoffs, print ranges and Worker. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T07:09:17.069Z, excerpt_hash=sha256:56a5422558b88aaa74d3234230034b5800a1663dfb629bb6f2e99201c41074f8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280708-0XVDMS/blueprint/resolved-snapshot.json
- old_digest: d46d8126808478a341adf608a5754a6ec8c407db92ad1a2d0cd76c92cd95c83d
- current_digest: d46d8126808478a341adf608a5754a6ec8c407db92ad1a2d0cd76c92cd95c83d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280708-0XVDMS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280708-0XVDMS
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
