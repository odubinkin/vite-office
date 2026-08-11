---
id: "202608111329-ZTN9JB"
title: "Toggle Writer horizontal ruler from View"
result_summary: "View Rulers now controls the bounded horizontal Writer ruler at its pinned nested menu placement."
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
  updated_at: "2026-08-11T13:29:50.546Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:32:19.460Z"
  updated_by: "REVIEWER"
  note: "Verified View Rulers follows the pinned nested Writer placement, exposes an accessible checked Horizontal ruler command, hides and restores only workspace chrome, and keeps document editing available."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T13:32:19.769Z"
  updated_by: "EVALUATOR"
  note: "The bounded View Rulers implementation matches the approved Writer chrome scope with complete local and production-browser evidence."
  evaluated_sha: "d42f390bf8e19b42d492e4acde21a9fdfd50cb6e"
  blueprint_digest: "0498fec78e647b0a93176f9b02ae9a98fe5830a56e27f1c1b80a10263d446b1c"
  evidence_refs:
    - ".agentplane/tasks/202608111329-ZTN9JB/README.md"
    - ".agentplane/tasks/202608111329-ZTN9JB/quality/20260811-133219769-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111329-ZTN9JB/quality/20260811-133219769-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111329-ZTN9JB/quality/20260811-133219769-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111329-ZTN9JB/blueprint/resolved-snapshot.json"
    - "d42f390bf8e19b42d492e4acde21a9fdfd50cb6e"
    - "npm run test:coverage --workspace @vite-office/office: 51 tests, 100 percent"
    - "npm run test:e2e: 1 production Chromium test passed"
  findings:
    - "The nested Rulers popup uses the pinned View hierarchy and a menuitemcheckbox for Horizontal ruler without placing a non-upstream control on a toolbar."
commit:
  hash: "212736a74ef4d0178b0d8c977ae5d143e4b34b52"
  message: "🧩 ZTN9JB task: record ruler verification"
comments:
  -
    author: "CODER"
    body: "Start: implementing the bounded Writer View Rulers command at its pinned menu location."
  -
    author: "CODER"
    body: "Verified: View Rulers exposes a checked Horizontal ruler Writer command that hides and restores only the ruler chrome while preserving accessible document editing."
events:
  -
    type: "status"
    at: "2026-08-11T13:29:57.608Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the bounded Writer View Rulers command at its pinned menu location."
  -
    type: "verify"
    at: "2026-08-11T13:32:19.460Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified View Rulers follows the pinned nested Writer placement, exposes an accessible checked Horizontal ruler command, hides and restores only workspace chrome, and keeps document editing available."
  -
    type: "status"
    at: "2026-08-11T13:32:32.098Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: View Rulers exposes a checked Horizontal ruler Writer command that hides and restores only the ruler chrome while preserving accessible document editing."
doc_version: 3
doc_updated_at: "2026-08-11T13:32:32.099Z"
doc_updated_by: "CODER"
description: "Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence."
sections:
  Summary: |-
    Toggle Writer horizontal ruler from View

    Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.
  Scope: |-
    - In scope: Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.
    - Out of scope: unrelated refactors not required for "Toggle Writer horizontal ruler from View".
  Plan: "1. Add the nested View Rulers menu and the upstream .uno:Ruler placement to WriterMenuBar while preserving all currently enabled Writer menus. 2. Thread horizontal-ruler visibility through WriterWorkbench and WriterWorkspaceChrome so hiding it releases its chrome height without changing paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Rulers exposes a checked Horizontal Ruler command, hides the ruler while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:32:19.460Z — VERIFY — ok

    By: REVIEWER

    Note: Verified View Rulers follows the pinned nested Writer placement, exposes an accessible checked Horizontal ruler command, hides and restores only workspace chrome, and keeps document editing available.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:32:18.960Z, excerpt_hash=sha256:670eb015d3f6abe64c57c73179f82b9cf059da62f14785e042c16b6122a026e8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111329-ZTN9JB/blueprint/resolved-snapshot.json
    - old_digest: 0498fec78e647b0a93176f9b02ae9a98fe5830a56e27f1c1b80a10263d446b1c
    - current_digest: 0498fec78e647b0a93176f9b02ae9a98fe5830a56e27f1c1b80a10263d446b1c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111329-ZTN9JB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111329-ZTN9JB
    - diagnostic_command: agentplane task run status 202608111329-ZTN9JB
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
    Implementation commit d42f390 adds the pinned nested View Rulers Horizontal ruler command, transient ruler visibility state, and focused unit and Chromium coverage. Evidence: format check, lint, TypeScript, JSDoc (113 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), production Playwright (1 passed), diff check, doctor, and policy routing all passed. Static smoke, LibreOffice inventory, and aggregate verify remain deferred under the user-approved ten-task cadence.

    - Observation: Static smoke, LibreOffice inventory, and aggregate verify were intentionally deferred under the agreed ten-task cadence.
      Impact: Broader cross-workspace regression evidence is not refreshed for this individual task.
      Resolution: Run the deferred aggregate checks at the next cadence checkpoint.
extensions:
  implementation_commit:
    hash: "d42f390bf8e19b42d492e4acde21a9fdfd50cb6e"
    message: "✨ ZTN9JB code: Toggle Writer horizontal ruler"
id_source: "generated"
---
## Summary

Toggle Writer horizontal ruler from View

Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.

## Scope

- In scope: Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.
- Out of scope: unrelated refactors not required for "Toggle Writer horizontal ruler from View".

## Plan

1. Add the nested View Rulers menu and the upstream .uno:Ruler placement to WriterMenuBar while preserving all currently enabled Writer menus. 2. Thread horizontal-ruler visibility through WriterWorkbench and WriterWorkspaceChrome so hiding it releases its chrome height without changing paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Rulers exposes a checked Horizontal Ruler command, hides the ruler while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:32:19.460Z — VERIFY — ok

By: REVIEWER

Note: Verified View Rulers follows the pinned nested Writer placement, exposes an accessible checked Horizontal ruler command, hides and restores only workspace chrome, and keeps document editing available.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:32:18.960Z, excerpt_hash=sha256:670eb015d3f6abe64c57c73179f82b9cf059da62f14785e042c16b6122a026e8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111329-ZTN9JB/blueprint/resolved-snapshot.json
- old_digest: 0498fec78e647b0a93176f9b02ae9a98fe5830a56e27f1c1b80a10263d446b1c
- current_digest: 0498fec78e647b0a93176f9b02ae9a98fe5830a56e27f1c1b80a10263d446b1c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111329-ZTN9JB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111329-ZTN9JB
- diagnostic_command: agentplane task run status 202608111329-ZTN9JB
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

Implementation commit d42f390 adds the pinned nested View Rulers Horizontal ruler command, transient ruler visibility state, and focused unit and Chromium coverage. Evidence: format check, lint, TypeScript, JSDoc (113 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), production Playwright (1 passed), diff check, doctor, and policy routing all passed. Static smoke, LibreOffice inventory, and aggregate verify remain deferred under the user-approved ten-task cadence.

- Observation: Static smoke, LibreOffice inventory, and aggregate verify were intentionally deferred under the agreed ten-task cadence.
  Impact: Broader cross-workspace regression evidence is not refreshed for this individual task.
  Resolution: Run the deferred aggregate checks at the next cadence checkpoint.
