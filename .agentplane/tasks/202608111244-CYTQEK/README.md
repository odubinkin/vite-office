---
id: "202608111244-CYTQEK"
title: "Place implemented Writer commands in native-style menus"
result_summary: "Implemented Writer commands are placed in functional native-style menus."
risk_level: "low"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T12:44:38.008Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T12:51:34.378Z"
  updated_by: "REVIEWER"
  note: "Verified: Writer menu placement, toolbar cleanup, strict coverage, targeted production Playwright accessibility, documentation, and policy checks passed. Static, inventory, and aggregate verification remain deferred under the approved cadence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T12:51:43.573Z"
  updated_by: "EVALUATOR"
  note: "Implemented Writer commands are now reachable from their pinned File, Edit, Format, and Styles menu locations, with only upstream-precedented toolbar controls retained."
  evaluated_sha: "068ea3c96130df69d409a5993e6ab18c41e396eb"
  blueprint_digest: "edf2ac4257e0d171fd993bfef6c3cf490600ba960f734081d2a6557eaf0db839"
  evidence_refs:
    - ".agentplane/tasks/202608111244-CYTQEK/README.md"
    - ".agentplane/tasks/202608111244-CYTQEK/quality/20260811-125143573-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111244-CYTQEK/quality/20260811-125143573-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111244-CYTQEK/quality/20260811-125143573-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111244-CYTQEK/blueprint/resolved-snapshot.json"
    - "npm run test:coverage --workspace @vite-office/office (48 passed; 100% thresholds); npm run test:e2e (1 passed with axe); npm run format:check; npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; git diff --check; ap doctor; node .agentplane/policy/check-routing.mjs"
  findings:
    - "No blocking defect found. The standalone paragraph append UI was removed because Writer creates ordinary paragraphs through caret/Enter behavior, which needs its own feature task."
commit:
  hash: "786fb94b3dde6a7bf147d4362c0cb110a7ff02f5"
  message: "✅ CYTQEK task: record Writer menu evidence"
comments:
  -
    author: "CODER"
    body: "Start: map existing browser Writer commands to pinned menu locations and remove non-native toolbar placement."
  -
    author: "CODER"
    body: "Verified: native-style menu placement, upstream-precedented toolbar cleanup, strict coverage, production accessibility, documentation, and policy gates passed."
events:
  -
    type: "status"
    at: "2026-08-11T12:44:39.179Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: map existing browser Writer commands to pinned menu locations and remove non-native toolbar placement."
  -
    type: "verify"
    at: "2026-08-11T12:51:34.378Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: Writer menu placement, toolbar cleanup, strict coverage, targeted production Playwright accessibility, documentation, and policy checks passed. Static, inventory, and aggregate verification remain deferred under the approved cadence."
  -
    type: "status"
    at: "2026-08-11T12:51:45.931Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native-style menu placement, upstream-precedented toolbar cleanup, strict coverage, production accessibility, documentation, and policy gates passed."
doc_version: 3
doc_updated_at: "2026-08-11T12:51:45.932Z"
doc_updated_by: "CODER"
description: "Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language."
sections:
  Summary: |-
    Place implemented Writer commands in native-style menus

    Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.
  Scope: |-
    - In scope: Add functional accessible File, Edit, Format, and Styles menu entries only for implemented browser Writer commands, located according to pinned LibreOffice Writer menu configuration; keep matching toolbar controls where Writer has toolbar precedent.
    - In scope: Remove the non-Writer Add paragraph toolbar control; retain the immutable append domain transition without a replacement UI.
    - In scope: Update focused unit/component and targeted production-browser coverage plus Writer UI and command-placement documentation.
    - Out of scope: Unimplemented menu commands; custom menus for File/View/Insert/Table/Tools/Window/Help; native menu pixel copying; keyboard menus; paragraph break/caret behavior; lists; and any new Writer capability.
    - Design constraint: Each implemented future command must be placed in its relevant Writer menu and applicable upstream Writer toolbar, or a task must document why one surface has no upstream precedent.
  Plan: "1. Add a small accessible Writer menu-bar component rather than growing workspace chrome: menus open and close predictably, expose only implemented entries, respect disabled history/boundary state, and retain the current visual language. 2. Map browser-local load/save/download to File (Open, Save, Save As text), undo/redo to Edit, style selection to Styles, and alignment plus bounded movement to Format using the pinned Writer menubar locations; wire each menu entry to the existing immutable workbench transitions. 3. Remove the Add paragraph toolbar control because Writer does not expose a standalone equivalent there; retain the pure append capability for a later native-style Enter/paragraph-break task rather than inventing a replacement UI. 4. Update component/unit and production-browser accessibility tests plus Writer UI documentation with exact pinned menu provenance and the ongoing placement rule. 5. Run format, lint, type, JSDoc, size, strict coverage, targeted Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence."
  Verify Steps: |-
    1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass and no authored file reaches the mandatory 1,000-line limit.
    2. Run npm run test:coverage --workspace @vite-office/office. Expected: menu opening, command dispatch, disabled states, existing history, paragraph formatting, and browser-local behaviors pass at 100% coverage.
    3. Run npm run test:e2e. Expected: production Writer exposes accessible functional File/Edit/Format/Styles menus; menu commands update the document without axe violations.
    4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required policy gates pass.
    5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-closed-tasks cadence; targeted Playwright performs the production build. Record residual risk in Verification.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T12:51:34.378Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: Writer menu placement, toolbar cleanup, strict coverage, targeted production Playwright accessibility, documentation, and policy checks passed. Static, inventory, and aggregate verification remain deferred under the approved cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T12:45:07.846Z, excerpt_hash=sha256:d66715bf5013620f156b48a93a29472b00aa5b1b3d9ee2c9755c87e4ab152096

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111244-CYTQEK/blueprint/resolved-snapshot.json
    - old_digest: edf2ac4257e0d171fd993bfef6c3cf490600ba960f734081d2a6557eaf0db839
    - current_digest: edf2ac4257e0d171fd993bfef6c3cf490600ba960f734081d2a6557eaf0db839
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111244-CYTQEK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111244-CYTQEK
    - diagnostic_command: agentplane task run status 202608111244-CYTQEK
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the implementation and task-evidence commits for 202608111244-CYTQEK.
    - Restore the previous static menu bar and Add paragraph toolbar button only if accessible menu dispatch regresses existing Writer command behavior.
    - Re-run the declared task checks after the revert.
  Findings: |-
    - Observation: Command: npm run test:coverage --workspace @vite-office/office; npm run test:e2e. Result: pass. Evidence: 48 unit tests at 100% statements, branches, functions, and lines; one production Playwright test passed with axe clean. Scope: File/Edit/Format/Styles command placement, disabled state, toolbar cleanup.
      Impact: Residual risk: deferred static inventory and aggregate verification have not run since the cadence checkpoint.
      Resolution: Run the deferred aggregate suite at the next tenth closed feature task or earlier after foundational test infrastructure changes.
extensions:
  implementation_commit:
    hash: "068ea3c96130df69d409a5993e6ab18c41e396eb"
    message: "✨ CYTQEK code: place Writer commands in menus"
id_source: "generated"
---
## Summary

Place implemented Writer commands in native-style menus

Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.

## Scope

- In scope: Add functional accessible File, Edit, Format, and Styles menu entries only for implemented browser Writer commands, located according to pinned LibreOffice Writer menu configuration; keep matching toolbar controls where Writer has toolbar precedent.
- In scope: Remove the non-Writer Add paragraph toolbar control; retain the immutable append domain transition without a replacement UI.
- In scope: Update focused unit/component and targeted production-browser coverage plus Writer UI and command-placement documentation.
- Out of scope: Unimplemented menu commands; custom menus for File/View/Insert/Table/Tools/Window/Help; native menu pixel copying; keyboard menus; paragraph break/caret behavior; lists; and any new Writer capability.
- Design constraint: Each implemented future command must be placed in its relevant Writer menu and applicable upstream Writer toolbar, or a task must document why one surface has no upstream precedent.

## Plan

1. Add a small accessible Writer menu-bar component rather than growing workspace chrome: menus open and close predictably, expose only implemented entries, respect disabled history/boundary state, and retain the current visual language. 2. Map browser-local load/save/download to File (Open, Save, Save As text), undo/redo to Edit, style selection to Styles, and alignment plus bounded movement to Format using the pinned Writer menubar locations; wire each menu entry to the existing immutable workbench transitions. 3. Remove the Add paragraph toolbar control because Writer does not expose a standalone equivalent there; retain the pure append capability for a later native-style Enter/paragraph-break task rather than inventing a replacement UI. 4. Update component/unit and production-browser accessibility tests plus Writer UI documentation with exact pinned menu provenance and the ongoing placement rule. 5. Run format, lint, type, JSDoc, size, strict coverage, targeted Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence.

## Verify Steps

1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass and no authored file reaches the mandatory 1,000-line limit.
2. Run npm run test:coverage --workspace @vite-office/office. Expected: menu opening, command dispatch, disabled states, existing history, paragraph formatting, and browser-local behaviors pass at 100% coverage.
3. Run npm run test:e2e. Expected: production Writer exposes accessible functional File/Edit/Format/Styles menus; menu commands update the document without axe violations.
4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required policy gates pass.
5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-closed-tasks cadence; targeted Playwright performs the production build. Record residual risk in Verification.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T12:51:34.378Z — VERIFY — ok

By: REVIEWER

Note: Verified: Writer menu placement, toolbar cleanup, strict coverage, targeted production Playwright accessibility, documentation, and policy checks passed. Static, inventory, and aggregate verification remain deferred under the approved cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T12:45:07.846Z, excerpt_hash=sha256:d66715bf5013620f156b48a93a29472b00aa5b1b3d9ee2c9755c87e4ab152096

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111244-CYTQEK/blueprint/resolved-snapshot.json
- old_digest: edf2ac4257e0d171fd993bfef6c3cf490600ba960f734081d2a6557eaf0db839
- current_digest: edf2ac4257e0d171fd993bfef6c3cf490600ba960f734081d2a6557eaf0db839
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111244-CYTQEK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111244-CYTQEK
- diagnostic_command: agentplane task run status 202608111244-CYTQEK
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task-evidence commits for 202608111244-CYTQEK.
- Restore the previous static menu bar and Add paragraph toolbar button only if accessible menu dispatch regresses existing Writer command behavior.
- Re-run the declared task checks after the revert.

## Findings

- Observation: Command: npm run test:coverage --workspace @vite-office/office; npm run test:e2e. Result: pass. Evidence: 48 unit tests at 100% statements, branches, functions, and lines; one production Playwright test passed with axe clean. Scope: File/Edit/Format/Styles command placement, disabled state, toolbar cleanup.
  Impact: Residual risk: deferred static inventory and aggregate verification have not run since the cadence checkpoint.
  Resolution: Run the deferred aggregate suite at the next tenth closed feature task or earlier after foundational test infrastructure changes.
