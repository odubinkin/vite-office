---
id: "202608111333-YY07RJ"
title: "Toggle Writer status bar from View"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T13:33:41.874Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:35:35.910Z"
  updated_by: "REVIEWER"
  note: "Verified View Status Bar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps document editing available."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T13:35:36.264Z"
  updated_by: "EVALUATOR"
  note: "The bounded View Status Bar implementation matches the approved Writer chrome scope with complete local and production-browser evidence."
  evaluated_sha: "1fc5407a4644cdf66a7755fe02e8c4363c970dab"
  blueprint_digest: "f441ea860a2d8cf9df94be21b2824d1e60c75e66507b46f40f804f125de06238"
  evidence_refs:
    - ".agentplane/tasks/202608111333-YY07RJ/README.md"
    - ".agentplane/tasks/202608111333-YY07RJ/quality/20260811-133536264-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111333-YY07RJ/quality/20260811-133536264-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111333-YY07RJ/quality/20260811-133536264-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111333-YY07RJ/blueprint/resolved-snapshot.json"
    - "1fc5407a4644cdf66a7755fe02e8c4363c970dab"
    - "npm run test:coverage --workspace @vite-office/office: 51 tests, 100 percent"
    - "npm run test:e2e: 1 production Chromium test passed"
  findings:
    - "The View menu uses a menuitemcheckbox for the pinned Status Bar command and the visibility preference is not stored in Writer document history."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implementing the bounded Writer View Status Bar command at its pinned menu location."
events:
  -
    type: "status"
    at: "2026-08-11T13:33:47.475Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the bounded Writer View Status Bar command at its pinned menu location."
  -
    type: "verify"
    at: "2026-08-11T13:35:35.910Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified View Status Bar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps document editing available."
doc_version: 3
doc_updated_at: "2026-08-11T13:35:36.003Z"
doc_updated_by: "CODER"
description: "Implement the pinned LibreOffice Writer .uno:StatusBarVisible command in the static browser workbench: expose a View menu check item that toggles the existing status bar without changing document data, retain accessible state and document-canvas availability, and add focused documentation and browser evidence."
sections:
  Summary: |-
    Toggle Writer status bar from View

    Implement the pinned LibreOffice Writer .uno:StatusBarVisible command in the static browser workbench: expose a View menu check item that toggles the existing status bar without changing document data, retain accessible state and document-canvas availability, and add focused documentation and browser evidence.
  Scope: |-
    - In scope: Implement the pinned LibreOffice Writer .uno:StatusBarVisible command in the static browser workbench: expose a View menu check item that toggles the existing status bar without changing document data, retain accessible state and document-canvas availability, and add focused documentation and browser evidence.
    - Out of scope: unrelated refactors not required for "Toggle Writer status bar from View".
  Plan: "1. Add the upstream .uno:StatusBarVisible placement to the functional View menu while preserving all existing Writer menus. 2. Thread status-bar visibility through WriterWorkbench and WriterWorkspaceChrome so hiding it removes only workspace chrome and does not affect paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Status Bar exposes a checked command, hides the status bar while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:35:35.910Z — VERIFY — ok

    By: REVIEWER

    Note: Verified View Status Bar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps document editing available.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:35:35.399Z, excerpt_hash=sha256:33766e083c3b1ffd6324c6fa40cddabbfa0acebb0fcd52924042f52f32fa8505

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111333-YY07RJ/blueprint/resolved-snapshot.json
    - old_digest: f441ea860a2d8cf9df94be21b2824d1e60c75e66507b46f40f804f125de06238
    - current_digest: f441ea860a2d8cf9df94be21b2824d1e60c75e66507b46f40f804f125de06238
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111333-YY07RJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111333-YY07RJ
    - diagnostic_command: agentplane task run status 202608111333-YY07RJ
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
    Implementation commit 1fc5407 adds the pinned View Status Bar check item, transient status-bar visibility state, and focused unit and Chromium coverage. Evidence: format check, lint, TypeScript, JSDoc (113 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), production Playwright (1 passed), diff check, doctor, and policy routing all passed. This is the ninth closed feature task after the checkpoint; static smoke, LibreOffice inventory, and aggregate verify run with the next tenth task.

    - Observation: This is the ninth feature task after the full checkpoint; the next task must run static smoke, LibreOffice inventory, and aggregate verify.
      Impact: Broader cross-workspace regression evidence is not refreshed for this individual task.
      Resolution: Execute the deferred full aggregate checks with the next tenth feature task.
id_source: "generated"
---
## Summary

Toggle Writer status bar from View

Implement the pinned LibreOffice Writer .uno:StatusBarVisible command in the static browser workbench: expose a View menu check item that toggles the existing status bar without changing document data, retain accessible state and document-canvas availability, and add focused documentation and browser evidence.

## Scope

- In scope: Implement the pinned LibreOffice Writer .uno:StatusBarVisible command in the static browser workbench: expose a View menu check item that toggles the existing status bar without changing document data, retain accessible state and document-canvas availability, and add focused documentation and browser evidence.
- Out of scope: unrelated refactors not required for "Toggle Writer status bar from View".

## Plan

1. Add the upstream .uno:StatusBarVisible placement to the functional View menu while preserving all existing Writer menus. 2. Thread status-bar visibility through WriterWorkbench and WriterWorkspaceChrome so hiding it removes only workspace chrome and does not affect paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Status Bar exposes a checked command, hides the status bar while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:35:35.910Z — VERIFY — ok

By: REVIEWER

Note: Verified View Status Bar follows pinned Writer placement, exposes accessible checked state, hides and restores only workspace chrome, and keeps document editing available.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:35:35.399Z, excerpt_hash=sha256:33766e083c3b1ffd6324c6fa40cddabbfa0acebb0fcd52924042f52f32fa8505

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111333-YY07RJ/blueprint/resolved-snapshot.json
- old_digest: f441ea860a2d8cf9df94be21b2824d1e60c75e66507b46f40f804f125de06238
- current_digest: f441ea860a2d8cf9df94be21b2824d1e60c75e66507b46f40f804f125de06238
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111333-YY07RJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111333-YY07RJ
- diagnostic_command: agentplane task run status 202608111333-YY07RJ
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

Implementation commit 1fc5407 adds the pinned View Status Bar check item, transient status-bar visibility state, and focused unit and Chromium coverage. Evidence: format check, lint, TypeScript, JSDoc (113 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), production Playwright (1 passed), diff check, doctor, and policy routing all passed. This is the ninth closed feature task after the checkpoint; static smoke, LibreOffice inventory, and aggregate verify run with the next tenth task.

- Observation: This is the ninth feature task after the full checkpoint; the next task must run static smoke, LibreOffice inventory, and aggregate verify.
  Impact: Broader cross-workspace regression evidence is not refreshed for this individual task.
  Resolution: Execute the deferred full aggregate checks with the next tenth feature task.
