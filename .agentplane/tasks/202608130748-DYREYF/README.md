---
id: "202608130748-DYREYF"
title: "Decompose Writer Format menu within LibreOffice uiconfig hierarchy"
result_summary: "verified-202608130748-DYREYF"
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
  updated_at: "2026-08-13T07:49:00.346Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T07:52:23.115Z"
  updated_by: "CODER"
  note: "verified-202608130748-DYREYF"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T07:52:16.525Z"
  updated_by: "EVALUATOR"
  note: "Writer Format menu decomposition preserves pinned command behavior and size constraints."
  evaluated_sha: "4467bc1c15fbc2c605a4aa95426184bb2d2302f4"
  blueprint_digest: "72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463"
  evidence_refs:
    - ".agentplane/tasks/202608130748-DYREYF/README.md"
    - ".agentplane/tasks/202608130748-DYREYF/quality/20260813-075216525-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130748-DYREYF/quality/20260813-075216525-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130748-DYREYF/quality/20260813-075216525-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130748-DYREYF/blueprint/resolved-snapshot.json"
    - "HEAD"
  findings:
    - "Fast coverage, targeted Chromium flow, and all declared quality checks passed."
commit:
  hash: "abfcb3b150b81fb2825b04c18737f7b303eeea1f"
  message: "🧾 DYREYF task: record Format menu verification"
comments:
  -
    author: "CODER"
    body: "Start: decompose the Writer Format menu within the pinned uiconfig hierarchy."
  -
    author: "CODER"
    body: "Verified: verified-202608130748-DYREYF. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-08-13T07:49:00.942Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: decompose the Writer Format menu within the pinned uiconfig hierarchy."
  -
    type: "verify"
    at: "2026-08-13T07:52:16.094Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Format menu extraction retains 83 fast tests at 100% coverage, targeted Writer list Chromium e2e, JSDoc, format, lint, types, source tree, provenance, and file-size gates."
  -
    type: "verify"
    at: "2026-08-13T07:52:23.115Z"
    author: "CODER"
    state: "ok"
    note: "verified-202608130748-DYREYF"
  -
    type: "status"
    at: "2026-08-13T07:52:23.297Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202608130748-DYREYF. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-08-13T07:52:23.298Z"
doc_updated_by: "CODER"
description: "Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage."
sections:
  Summary: |-
    Decompose Writer Format menu within LibreOffice uiconfig hierarchy

    Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.
  Scope: |-
    - In scope: Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.
    - Out of scope: unrelated refactors not required for "Decompose Writer Format menu within LibreOffice uiconfig hierarchy".
  Plan: "1. Extract the Format menu and Bullets and Numbering nested menu from menubar.tsx into a documented co-located React module under sw/uiconfig/swriter/menubar. 2. Preserve menu labels, roles, disabled and active states, callbacks, and pinned command order; leave top-level menu state ownership in menubar.tsx. 3. Update or add focused component tests for Format menu rendering and interaction. 4. Verify fast 100% coverage, focused menu e2e, file-size reduction, JSDoc, formatting, lint, types, and source-tree/provenance gates; defer full suite until the next ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: the menu decomposition retains 100 percent fast-test coverage. 2. Run npm run test:e2e -- --grep 'Writer bullets and numbering'. Expected: the browser still exposes and executes the Format list menu flow. 3. Run npm run check:file-size && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && npm run check:source-tree && npm run check:source-provenance && git diff --check. Expected: menubar.tsx falls below the decomposition-candidate threshold and all quality gates pass. 4. Defer npm run verify/full browser matrix under the agreed ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T07:52:16.094Z — VERIFY — ok

    By: CODER

    Note: Verified: Format menu extraction retains 83 fast tests at 100% coverage, targeted Writer list Chromium e2e, JSDoc, format, lint, types, source tree, provenance, and file-size gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:49:00.942Z, excerpt_hash=sha256:2bf447b725bbdddffc9f57d03bc9dc01f850988d5003e41424e1dec090d2cb49

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130748-DYREYF/blueprint/resolved-snapshot.json
    - old_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
    - current_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130748-DYREYF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130748-DYREYF
    - diagnostic_command: agentplane task run status 202608130748-DYREYF
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    ### 2026-08-13T07:52:23.115Z — VERIFY — ok

    By: CODER

    Note: verified-202608130748-DYREYF
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:52:16.177Z, excerpt_hash=sha256:2bf447b725bbdddffc9f57d03bc9dc01f850988d5003e41424e1dec090d2cb49

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130748-DYREYF/blueprint/resolved-snapshot.json
    - old_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
    - current_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130748-DYREYF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202608130748-DYREYF --result verified-202608130748-DYREYF --commit abfcb3b150b81fb2825b04c18737f7b303eeea1f
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
    - Observation: menubar.tsx is now 411 lines and Format/Bullets rendering is a 198-line co-located mapped module.
      Impact: The Writer uiconfig menu hierarchy remains behaviorally identical while its primary renderer is below the decomposition-candidate threshold.
      Resolution: Mapped format-menu.tsx to the same pinned menubar.xml boundary; full suite remains deferred until the next ten-task cadence.
extensions:
  implementation_commit:
    hash: "4467bc1c15fbc2c605a4aa95426184bb2d2302f4"
    message: "♻️ DYREYF code: decompose Writer Format menu"
id_source: "generated"
---
## Summary

Decompose Writer Format menu within LibreOffice uiconfig hierarchy

Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.

## Scope

- In scope: Extract the growing Writer Format and Bullets and Numbering popup rendering from sw/uiconfig/swriter/menubar/menubar.tsx into documented co-located modules while preserving the pinned menu placement, accessibility, behavior, and test coverage.
- Out of scope: unrelated refactors not required for "Decompose Writer Format menu within LibreOffice uiconfig hierarchy".

## Plan

1. Extract the Format menu and Bullets and Numbering nested menu from menubar.tsx into a documented co-located React module under sw/uiconfig/swriter/menubar. 2. Preserve menu labels, roles, disabled and active states, callbacks, and pinned command order; leave top-level menu state ownership in menubar.tsx. 3. Update or add focused component tests for Format menu rendering and interaction. 4. Verify fast 100% coverage, focused menu e2e, file-size reduction, JSDoc, formatting, lint, types, and source-tree/provenance gates; defer full suite until the next ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: the menu decomposition retains 100 percent fast-test coverage. 2. Run npm run test:e2e -- --grep 'Writer bullets and numbering'. Expected: the browser still exposes and executes the Format list menu flow. 3. Run npm run check:file-size && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && npm run check:source-tree && npm run check:source-provenance && git diff --check. Expected: menubar.tsx falls below the decomposition-candidate threshold and all quality gates pass. 4. Defer npm run verify/full browser matrix under the agreed ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T07:52:16.094Z — VERIFY — ok

By: CODER

Note: Verified: Format menu extraction retains 83 fast tests at 100% coverage, targeted Writer list Chromium e2e, JSDoc, format, lint, types, source tree, provenance, and file-size gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:49:00.942Z, excerpt_hash=sha256:2bf447b725bbdddffc9f57d03bc9dc01f850988d5003e41424e1dec090d2cb49

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130748-DYREYF/blueprint/resolved-snapshot.json
- old_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
- current_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130748-DYREYF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130748-DYREYF
- diagnostic_command: agentplane task run status 202608130748-DYREYF
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

### 2026-08-13T07:52:23.115Z — VERIFY — ok

By: CODER

Note: verified-202608130748-DYREYF
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:52:16.177Z, excerpt_hash=sha256:2bf447b725bbdddffc9f57d03bc9dc01f850988d5003e41424e1dec090d2cb49

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130748-DYREYF/blueprint/resolved-snapshot.json
- old_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
- current_digest: 72214c34c64f3232ae74892843b2b5113d81404e4d1644717c19f837ad35a463
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130748-DYREYF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202608130748-DYREYF --result verified-202608130748-DYREYF --commit abfcb3b150b81fb2825b04c18737f7b303eeea1f
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

- Observation: menubar.tsx is now 411 lines and Format/Bullets rendering is a 198-line co-located mapped module.
  Impact: The Writer uiconfig menu hierarchy remains behaviorally identical while its primary renderer is below the decomposition-candidate threshold.
  Resolution: Mapped format-menu.tsx to the same pinned menubar.xml boundary; full suite remains deferred until the next ten-task cadence.
