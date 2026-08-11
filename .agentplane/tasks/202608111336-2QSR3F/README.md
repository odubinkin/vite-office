---
id: "202608111336-2QSR3F"
title: "Select all Writer document text from Edit"
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
  updated_at: "2026-08-11T13:36:59.401Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:42:45.424Z"
  updated_by: "REVIEWER"
  note: "Verified Edit Select All follows pinned Writer placement, selects the complete current browser document range without serializing selection or changing history, and the tenth-task full checkpoint passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T13:42:45.742Z"
  updated_by: "EVALUATOR"
  note: "The bounded Edit Select All implementation and required tenth-task full checkpoint satisfy the approved scope."
  evaluated_sha: "d41156478b63ca7904864a9e46f2f8443d0a3dd1"
  blueprint_digest: "37238aa0109b899faad72715fff95a7b276cd9b2434841b154a24a5b34e550af"
  evidence_refs:
    - ".agentplane/tasks/202608111336-2QSR3F/README.md"
    - ".agentplane/tasks/202608111336-2QSR3F/quality/20260811-134245742-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111336-2QSR3F/quality/20260811-134245742-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111336-2QSR3F/quality/20260811-134245742-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111336-2QSR3F/blueprint/resolved-snapshot.json"
    - "d41156478b63ca7904864a9e46f2f8443d0a3dd1"
    - "npm run verify: passed full aggregate including static build, inventory coverage, office coverage, and Playwright"
    - "npm run inventory:validate: passed pinned LibreOffice corpus contracts"
  findings:
    - "Select All is a one-shot browser selection request, so it does not reselect document content after later paragraph edits or disturb native caret operations."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implementing bounded Writer Edit Select All with the tenth-task full verification checkpoint."
events:
  -
    type: "status"
    at: "2026-08-11T13:37:04.355Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing bounded Writer Edit Select All with the tenth-task full verification checkpoint."
  -
    type: "verify"
    at: "2026-08-11T13:42:45.424Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified Edit Select All follows pinned Writer placement, selects the complete current browser document range without serializing selection or changing history, and the tenth-task full checkpoint passed."
doc_version: 3
doc_updated_at: "2026-08-11T13:42:45.480Z"
doc_updated_by: "CODER"
description: "Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite."
sections:
  Summary: |-
    Select all Writer document text from Edit

    Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.
  Scope: |-
    - In scope: Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.
    - Out of scope: unrelated refactors not required for "Select all Writer document text from Edit".
  Plan: "1. Add the upstream .uno:SelectAll placement to WriterMenuBar and route it to a browser-selection request without creating a non-upstream toolbar control. 2. Add a bounded document-editor select-all effect that selects all integrated Writer paragraphs but does not change their model, history, focus formatting target, or storage snapshot; move existing workspace chrome visibility state into a dedicated hook to keep WriterWorkbench below the decomposition-candidate threshold. 3. Add exhaustive unit/component and production Chromium evidence, update Writer UI and command-placement documentation with pinned upstream provenance, and run both targeted checks and the tenth-task full aggregate checkpoint: npm run verify and npm run inventory:validate."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, office coverage, and targeted production Playwright. Expected: Edit Select All selects the complete document body without mutating Writer history and all local checks pass at 100 percent office coverage. 2. Run npm run verify. Expected: full aggregate quality suite, static-build smoke, inventory tests, unit coverage, and browser tests pass. 3. Run npm run inventory:validate. Expected: all pinned LibreOffice corpus inventory contracts validate. 4. Run diff, doctor, and policy routing checks. Expected: all pass."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:42:45.424Z — VERIFY — ok

    By: REVIEWER

    Note: Verified Edit Select All follows pinned Writer placement, selects the complete current browser document range without serializing selection or changing history, and the tenth-task full checkpoint passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:42:44.953Z, excerpt_hash=sha256:85a48694f6e98184c317bc1452261cd021b7f98ef0f1d76b355df87d7713373b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111336-2QSR3F/blueprint/resolved-snapshot.json
    - old_digest: 37238aa0109b899faad72715fff95a7b276cd9b2434841b154a24a5b34e550af
    - current_digest: 37238aa0109b899faad72715fff95a7b276cd9b2434841b154a24a5b34e550af
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111336-2QSR3F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111336-2QSR3F
    - diagnostic_command: agentplane task run status 202608111336-2QSR3F
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
  Findings: "Implementation commit d411564 adds the pinned Edit Select All command, a one-shot browser selection effect over the current Writer body, and a workspace-chrome hook that keeps WriterWorkbench at 499 lines. Evidence: format check, lint, TypeScript, JSDoc (114 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), targeted production Playwright (1 passed), full npm run verify, npm run inventory:validate, diff check, doctor, and policy routing all passed. This completes the required tenth-task full checkpoint."
id_source: "generated"
---
## Summary

Select all Writer document text from Edit

Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.

## Scope

- In scope: Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.
- Out of scope: unrelated refactors not required for "Select all Writer document text from Edit".

## Plan

1. Add the upstream .uno:SelectAll placement to WriterMenuBar and route it to a browser-selection request without creating a non-upstream toolbar control. 2. Add a bounded document-editor select-all effect that selects all integrated Writer paragraphs but does not change their model, history, focus formatting target, or storage snapshot; move existing workspace chrome visibility state into a dedicated hook to keep WriterWorkbench below the decomposition-candidate threshold. 3. Add exhaustive unit/component and production Chromium evidence, update Writer UI and command-placement documentation with pinned upstream provenance, and run both targeted checks and the tenth-task full aggregate checkpoint: npm run verify and npm run inventory:validate.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, office coverage, and targeted production Playwright. Expected: Edit Select All selects the complete document body without mutating Writer history and all local checks pass at 100 percent office coverage. 2. Run npm run verify. Expected: full aggregate quality suite, static-build smoke, inventory tests, unit coverage, and browser tests pass. 3. Run npm run inventory:validate. Expected: all pinned LibreOffice corpus inventory contracts validate. 4. Run diff, doctor, and policy routing checks. Expected: all pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:42:45.424Z — VERIFY — ok

By: REVIEWER

Note: Verified Edit Select All follows pinned Writer placement, selects the complete current browser document range without serializing selection or changing history, and the tenth-task full checkpoint passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:42:44.953Z, excerpt_hash=sha256:85a48694f6e98184c317bc1452261cd021b7f98ef0f1d76b355df87d7713373b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111336-2QSR3F/blueprint/resolved-snapshot.json
- old_digest: 37238aa0109b899faad72715fff95a7b276cd9b2434841b154a24a5b34e550af
- current_digest: 37238aa0109b899faad72715fff95a7b276cd9b2434841b154a24a5b34e550af
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111336-2QSR3F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111336-2QSR3F
- diagnostic_command: agentplane task run status 202608111336-2QSR3F
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

Implementation commit d411564 adds the pinned Edit Select All command, a one-shot browser selection effect over the current Writer body, and a workspace-chrome hook that keeps WriterWorkbench at 499 lines. Evidence: format check, lint, TypeScript, JSDoc (114 authored files), file-size check (only existing contracts.ts candidate), office coverage (51 tests; 100 percent), targeted production Playwright (1 passed), full npm run verify, npm run inventory:validate, diff check, doctor, and policy routing all passed. This completes the required tenth-task full checkpoint.
