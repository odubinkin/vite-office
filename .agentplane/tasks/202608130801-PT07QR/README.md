---
id: "202608130801-PT07QR"
title: "Consolidate Writer text shell ownership"
result_summary: "verified-202608130801-PT07QR"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
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
  state: "ok"
  updated_at: "2026-08-13T08:05:30.138Z"
  updated_by: "CODER"
  note: "verified-202608130801-PT07QR"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T08:05:21.657Z"
  updated_by: "EVALUATOR"
  note: "Writer text shell now has one exact upstream-mapped local owner for Copy, download, and history shortcut dispatch."
  evaluated_sha: "f70d70009d4fae3b2c39745a88606f7d54e42cb3"
  blueprint_digest: "e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362"
  evidence_refs:
    - ".agentplane/tasks/202608130801-PT07QR/README.md"
    - ".agentplane/tasks/202608130801-PT07QR/quality/20260813-080521657-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130801-PT07QR/quality/20260813-080521657-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130801-PT07QR/quality/20260813-080521657-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130801-PT07QR/blueprint/resolved-snapshot.json"
    - "f70d700"
  findings:
    - "Repeated fast coverage passed with 100% metrics; all source, type, documentation, lint, format, and size gates passed."
commit:
  hash: "6c76a68329a549d79a40a5f550232d869fdcd005"
  message: "🧾 PT07QR task: record text shell verification"
comments:
  -
    author: "CODER"
    body: "Start: consolidate the Writer text-shell hook into its single mapped module."
  -
    author: "CODER"
    body: "Verified: verified-202608130801-PT07QR. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-08-13T08:01:53.459Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: consolidate the Writer text-shell hook into its single mapped module."
  -
    type: "verify"
    at: "2026-08-13T08:05:21.162Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Undo/Redo shortcut registration now lives in the single textsh mapping; the repeated fast suite passes 83 tests at 100% coverage and every declared static gate passes."
  -
    type: "verify"
    at: "2026-08-13T08:05:30.138Z"
    author: "CODER"
    state: "ok"
    note: "verified-202608130801-PT07QR"
  -
    type: "status"
    at: "2026-08-13T08:05:30.368Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202608130801-PT07QR. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-08-13T08:05:30.369Z"
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
    ### 2026-08-13T08:05:21.162Z — VERIFY — ok

    By: CODER

    Note: Verified: Undo/Redo shortcut registration now lives in the single textsh mapping; the repeated fast suite passes 83 tests at 100% coverage and every declared static gate passes.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T08:01:53.459Z, excerpt_hash=sha256:8e82e152067b6f59390e3673a1cc196b02fb5915e888728b3d55f13475ec5835

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130801-PT07QR/blueprint/resolved-snapshot.json
    - old_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
    - current_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130801-PT07QR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130801-PT07QR
    - diagnostic_command: agentplane task run status 202608130801-PT07QR
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    ### 2026-08-13T08:05:30.138Z — VERIFY — ok

    By: CODER

    Note: verified-202608130801-PT07QR
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T08:05:21.257Z, excerpt_hash=sha256:8e82e152067b6f59390e3673a1cc196b02fb5915e888728b3d55f13475ec5835

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130801-PT07QR/blueprint/resolved-snapshot.json
    - old_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
    - current_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130801-PT07QR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202608130801-PT07QR --result verified-202608130801-PT07QR --commit 6c76a68329a549d79a40a5f550232d869fdcd005
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
    - Observation: The first coverage run exceeded the existing menubar test's 5-second test timeout without an assertion failure; a clean rerun passed unchanged at 83/83.
      Impact: No shortcut regression was observed; the intermittent test duration is recorded while the direct task remains narrowly structural.
      Resolution: Use the successful repeat as verification evidence and leave timeout policy outside this task's approved scope.
extensions:
  implementation_commit:
    hash: "f70d70009d4fae3b2c39745a88606f7d54e42cb3"
    message: "♻️ PT07QR code: consolidate Writer text shell"
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
### 2026-08-13T08:05:21.162Z — VERIFY — ok

By: CODER

Note: Verified: Undo/Redo shortcut registration now lives in the single textsh mapping; the repeated fast suite passes 83 tests at 100% coverage and every declared static gate passes.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T08:01:53.459Z, excerpt_hash=sha256:8e82e152067b6f59390e3673a1cc196b02fb5915e888728b3d55f13475ec5835

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130801-PT07QR/blueprint/resolved-snapshot.json
- old_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
- current_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130801-PT07QR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130801-PT07QR
- diagnostic_command: agentplane task run status 202608130801-PT07QR
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

### 2026-08-13T08:05:30.138Z — VERIFY — ok

By: CODER

Note: verified-202608130801-PT07QR
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T08:05:21.257Z, excerpt_hash=sha256:8e82e152067b6f59390e3673a1cc196b02fb5915e888728b3d55f13475ec5835

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130801-PT07QR/blueprint/resolved-snapshot.json
- old_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
- current_digest: e08d5d58ea0078707200193b0e0ef213804d275942d90b97fff15326b3ad3362
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130801-PT07QR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202608130801-PT07QR --result verified-202608130801-PT07QR --commit 6c76a68329a549d79a40a5f550232d869fdcd005
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

- Observation: The first coverage run exceeded the existing menubar test's 5-second test timeout without an assertion failure; a clean rerun passed unchanged at 83/83.
  Impact: No shortcut regression was observed; the intermittent test duration is recorded while the direct task remains narrowly structural.
  Resolution: Use the successful repeat as verification evidence and leave timeout policy outside this task's approved scope.
