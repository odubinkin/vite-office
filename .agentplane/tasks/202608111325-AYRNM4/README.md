---
id: "202608111325-AYRNM4"
title: "Toggle Writer properties sidebar from View"
result_summary: "View Sidebar now controls bounded Writer properties chrome at its pinned menu placement."
risk_level: "low"
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
  updated_at: "2026-08-11T13:25:26.761Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:28:48.844Z"
  updated_by: "REVIEWER"
  note: "Verified View Sidebar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps the document canvas available."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T13:28:49.152Z"
  updated_by: "EVALUATOR"
  note: "The bounded View Sidebar implementation matches the approved Writer chrome scope with complete local and production-browser evidence."
  evaluated_sha: "e87f581c4533489351a0790b48ad3c929783708b"
  blueprint_digest: "ba71455bda8166c3834d7765eebc09fac238cf5449ce0cc1e8b9b93fd1f2c0a0"
  evidence_refs:
    - ".agentplane/tasks/202608111325-AYRNM4/README.md"
    - ".agentplane/tasks/202608111325-AYRNM4/quality/20260811-132849152-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111325-AYRNM4/quality/20260811-132849152-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111325-AYRNM4/quality/20260811-132849152-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111325-AYRNM4/blueprint/resolved-snapshot.json"
    - "e87f581c4533489351a0790b48ad3c929783708b"
    - "npm run test:coverage --workspace @vite-office/office: 51 tests, 100 percent"
    - "npm run test:e2e: 1 production Chromium test passed"
  findings:
    - "The View menu uses a menuitemcheckbox for the pinned Sidebar command and the visibility preference is not stored in Writer document history."
commit:
  hash: "c45a4692f08ffb1c7d4d5f39e38f332024566d41"
  message: "🧩 AYRNM4 task: record sidebar verification"
comments:
  -
    author: "CODER"
    body: "Start: implementing the bounded Writer View Sidebar command at its pinned menu location."
  -
    author: "CODER"
    body: "Verified: View Sidebar exposes a checked Writer menu command that hides and restores only the properties sidebar while retaining accessible document editing."
events:
  -
    type: "status"
    at: "2026-08-11T13:25:31.447Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the bounded Writer View Sidebar command at its pinned menu location."
  -
    type: "verify"
    at: "2026-08-11T13:28:48.844Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified View Sidebar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps the document canvas available."
  -
    type: "status"
    at: "2026-08-11T13:28:56.905Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: View Sidebar exposes a checked Writer menu command that hides and restores only the properties sidebar while retaining accessible document editing."
doc_version: 3
doc_updated_at: "2026-08-11T13:28:56.906Z"
doc_updated_by: "CODER"
description: "Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence."
sections:
  Summary: |-
    Toggle Writer properties sidebar from View

    Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.
  Scope: |-
    - In scope: Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.
    - Out of scope: unrelated refactors not required for "Toggle Writer properties sidebar from View".
  Plan: "1. Add View menu state and the upstream .uno:Sidebar placement to WriterMenuBar while retaining existing File, Edit, Format, and Styles commands. 2. Thread a sidebar-visibility callback through WriterWorkbench and WriterWorkspaceChrome so hiding the sidebar expands the document canvas without mutating paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Sidebar exposes a checked command, hides the properties sidebar while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:28:48.844Z — VERIFY — ok

    By: REVIEWER

    Note: Verified View Sidebar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps the document canvas available.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:28:48.366Z, excerpt_hash=sha256:8e2e4117c55dd836f5fdd9955d7931616d7ccd710b321954f6affe6c8c508c40

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111325-AYRNM4/blueprint/resolved-snapshot.json
    - old_digest: ba71455bda8166c3834d7765eebc09fac238cf5449ce0cc1e8b9b93fd1f2c0a0
    - current_digest: ba71455bda8166c3834d7765eebc09fac238cf5449ce0cc1e8b9b93fd1f2c0a0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111325-AYRNM4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111325-AYRNM4
    - diagnostic_command: agentplane task run status 202608111325-AYRNM4
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
  Findings: |-
    Implementation commit e87f581 adds the pinned View Sidebar check item, transient sidebar visibility state, responsive canvas expansion, and focused unit and Chromium coverage. Evidence: format check, lint, TypeScript, JSDoc (113 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), production Playwright (1 passed), diff check, doctor, and policy routing all passed. Static smoke, LibreOffice inventory, and aggregate verify remain deferred under the user-approved ten-task cadence.

    - Observation: Static smoke, LibreOffice inventory, and aggregate verify were intentionally deferred under the agreed ten-task cadence.
      Impact: Broader cross-workspace regression evidence is not refreshed for this individual task.
      Resolution: Run the deferred aggregate checks at the next cadence checkpoint.
extensions:
  implementation_commit:
    hash: "e87f581c4533489351a0790b48ad3c929783708b"
    message: "✨ AYRNM4 code: Toggle Writer sidebar from View"
id_source: "generated"
---
## Summary

Toggle Writer properties sidebar from View

Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.

## Scope

- In scope: Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.
- Out of scope: unrelated refactors not required for "Toggle Writer properties sidebar from View".

## Plan

1. Add View menu state and the upstream .uno:Sidebar placement to WriterMenuBar while retaining existing File, Edit, Format, and Styles commands. 2. Thread a sidebar-visibility callback through WriterWorkbench and WriterWorkspaceChrome so hiding the sidebar expands the document canvas without mutating paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Sidebar exposes a checked command, hides the properties sidebar while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:28:48.844Z — VERIFY — ok

By: REVIEWER

Note: Verified View Sidebar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps the document canvas available.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:28:48.366Z, excerpt_hash=sha256:8e2e4117c55dd836f5fdd9955d7931616d7ccd710b321954f6affe6c8c508c40

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111325-AYRNM4/blueprint/resolved-snapshot.json
- old_digest: ba71455bda8166c3834d7765eebc09fac238cf5449ce0cc1e8b9b93fd1f2c0a0
- current_digest: ba71455bda8166c3834d7765eebc09fac238cf5449ce0cc1e8b9b93fd1f2c0a0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111325-AYRNM4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111325-AYRNM4
- diagnostic_command: agentplane task run status 202608111325-AYRNM4
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

Implementation commit e87f581 adds the pinned View Sidebar check item, transient sidebar visibility state, responsive canvas expansion, and focused unit and Chromium coverage. Evidence: format check, lint, TypeScript, JSDoc (113 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), production Playwright (1 passed), diff check, doctor, and policy routing all passed. Static smoke, LibreOffice inventory, and aggregate verify remain deferred under the user-approved ten-task cadence.

- Observation: Static smoke, LibreOffice inventory, and aggregate verify were intentionally deferred under the agreed ten-task cadence.
  Impact: Broader cross-workspace regression evidence is not refreshed for this individual task.
  Resolution: Run the deferred aggregate checks at the next cadence checkpoint.
