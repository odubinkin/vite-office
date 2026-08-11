---
id: "202608111140-FYJWD4"
title: "Add Writer plain-text paragraph removal"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T11:40:23.692Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T11:42:49.109Z"
  updated_by: "REVIEWER"
  note: "Verified: immutable non-final paragraph removal, inaccessible final-paragraph removal, undo/redo restoration, and updated download output passed 41 application tests at 100% coverage. Per approved cadence, Playwright/static/full verification were deferred because the UI is covered by focused integration tests and build configuration is unchanged."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T11:42:59.345Z"
  updated_by: "EVALUATOR"
  note: "Bounded Writer paragraph removal preserves the non-empty body invariant and existing browser behavior."
  evaluated_sha: "66d5cf70b97a0bb914e0a450028b296a4ce0ffc1"
  blueprint_digest: "f9b3a378f2a342283650e092b2f233e2bf26b874dbb6690d5dff5f6aaafaa749"
  evidence_refs:
    - ".agentplane/tasks/202608111140-FYJWD4/README.md"
    - ".agentplane/tasks/202608111140-FYJWD4/quality/20260811-114259345-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111140-FYJWD4/quality/20260811-114259345-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111140-FYJWD4/quality/20260811-114259345-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111140-FYJWD4/blueprint/resolved-snapshot.json"
    - "66d5cf70b97a implementation and documentation commit"
    - "fast contour passed: format, lint, typecheck, JSDoc, 41 application tests, 100% coverage"
    - "ap doctor and routing validation passed"
  findings:
    - "No confirmed defects: the domain rejects invalid removal, UI exposes removal only when eligible, history restores removed content, and plain-text export reflects the reduced body."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: adding safe Writer paragraph removal while preserving the non-empty document body invariant."
events:
  -
    type: "status"
    at: "2026-08-11T11:40:28.895Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: adding safe Writer paragraph removal while preserving the non-empty document body invariant."
  -
    type: "verify"
    at: "2026-08-11T11:42:49.109Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: immutable non-final paragraph removal, inaccessible final-paragraph removal, undo/redo restoration, and updated download output passed 41 application tests at 100% coverage. Per approved cadence, Playwright/static/full verification were deferred because the UI is covered by focused integration tests and build configuration is unchanged."
doc_version: 3
doc_updated_at: "2026-08-11T11:42:49.199Z"
doc_updated_by: "CODER"
description: "Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export."
sections:
  Summary: |-
    Add Writer plain-text paragraph removal

    Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.
  Scope: |-
    - In scope: Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.
    - Out of scope: unrelated refactors not required for "Add Writer plain-text paragraph removal".
  Plan: |-
    1. Add a documented immutable Writer domain operation that removes one identified paragraph, preserves original input and sibling order, marks the document dirty, and rejects missing IDs or removal of the sole remaining paragraph.
    2. Extend the accessible ordered paragraph editor with per-paragraph Remove actions that are available only when the non-empty body invariant permits removal.
    3. Add a Writer workbench history transaction for removal; saved snapshots and plain-text download must automatically reflect the reduced ordered body.
    4. Add domain and integration tests for valid removal, invalid removal, visible controls, undo/redo restoration, storage/load, and download body output. Keep complete JSDoc and update bounded Writer documentation.
    5. Run Prettier check, lint, typecheck, JSDoc validation, and application coverage. Defer Playwright/static/full aggregation under the user-approved cadence because no build configuration changes and the changed UI has focused integration coverage. Run doctor and routing validation before close.

    Acceptance: users can remove any non-final plain-text Writer paragraph and undo/redo that operation; rich-text deletion, range selection, reordering, ODT, PDF, layout, and full Writer parity remain out of scope.
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T11:42:49.109Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: immutable non-final paragraph removal, inaccessible final-paragraph removal, undo/redo restoration, and updated download output passed 41 application tests at 100% coverage. Per approved cadence, Playwright/static/full verification were deferred because the UI is covered by focused integration tests and build configuration is unchanged.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T11:40:28.895Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111140-FYJWD4/blueprint/resolved-snapshot.json
    - old_digest: f9b3a378f2a342283650e092b2f233e2bf26b874dbb6690d5dff5f6aaafaa749
    - current_digest: f9b3a378f2a342283650e092b2f233e2bf26b874dbb6690d5dff5f6aaafaa749
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111140-FYJWD4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111140-FYJWD4
    - diagnostic_command: agentplane task run status 202608111140-FYJWD4
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Add Writer plain-text paragraph removal

Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.

## Scope

- In scope: Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.
- Out of scope: unrelated refactors not required for "Add Writer plain-text paragraph removal".

## Plan

1. Add a documented immutable Writer domain operation that removes one identified paragraph, preserves original input and sibling order, marks the document dirty, and rejects missing IDs or removal of the sole remaining paragraph.
2. Extend the accessible ordered paragraph editor with per-paragraph Remove actions that are available only when the non-empty body invariant permits removal.
3. Add a Writer workbench history transaction for removal; saved snapshots and plain-text download must automatically reflect the reduced ordered body.
4. Add domain and integration tests for valid removal, invalid removal, visible controls, undo/redo restoration, storage/load, and download body output. Keep complete JSDoc and update bounded Writer documentation.
5. Run Prettier check, lint, typecheck, JSDoc validation, and application coverage. Defer Playwright/static/full aggregation under the user-approved cadence because no build configuration changes and the changed UI has focused integration coverage. Run doctor and routing validation before close.

Acceptance: users can remove any non-final plain-text Writer paragraph and undo/redo that operation; rich-text deletion, range selection, reordering, ODT, PDF, layout, and full Writer parity remain out of scope.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T11:42:49.109Z — VERIFY — ok

By: REVIEWER

Note: Verified: immutable non-final paragraph removal, inaccessible final-paragraph removal, undo/redo restoration, and updated download output passed 41 application tests at 100% coverage. Per approved cadence, Playwright/static/full verification were deferred because the UI is covered by focused integration tests and build configuration is unchanged.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T11:40:28.895Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111140-FYJWD4/blueprint/resolved-snapshot.json
- old_digest: f9b3a378f2a342283650e092b2f233e2bf26b874dbb6690d5dff5f6aaafaa749
- current_digest: f9b3a378f2a342283650e092b2f233e2bf26b874dbb6690d5dff5f6aaafaa749
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111140-FYJWD4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111140-FYJWD4
- diagnostic_command: agentplane task run status 202608111140-FYJWD4
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
