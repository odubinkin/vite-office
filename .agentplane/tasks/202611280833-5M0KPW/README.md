---
id: "202611280833-5M0KPW"
title: "Connect Calc value highlighting and formula marks to the native view"
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
  updated_at: "2026-11-28T08:33:17.066Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T09:13:27.393Z"
  updated_by: "CODER"
  note: "34 focused Calc tests, the Office build and the Chromium combined view scenario passed. Scoped source checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T09:13:51.446Z"
  updated_by: "EVALUATOR"
  note: "The approved Calc View command and options page are verified through the grid and ODS."
  evaluated_sha: "bb91f4620b6048448608900872fc54c0df7ca4af"
  blueprint_digest: "a4c4dc4939463aa6f4ffcc2f4358a5eabd5f604d85d1ec6e42584fd7417d944e"
  evidence_refs:
    - ".agentplane/tasks/202611280833-5M0KPW/README.md"
    - ".agentplane/tasks/202611280833-5M0KPW/quality/20261128-091351446-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280833-5M0KPW/quality/20261128-091351446-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280833-5M0KPW/quality/20261128-091351446-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280833-5M0KPW/blueprint/resolved-snapshot.json"
    - "output/calc-next/5M0KPW-browser.log"
    - "output/calc-next/5M0KPW-vitest.log"
  findings:
    - "The production Chromium scenario confirms the real menu dispatch, a formula syntax color and one anchored formula mark with the correct hint."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-28T08:33:25.213Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-28T09:13:27.393Z"
    author: "CODER"
    state: "ok"
    note: "34 focused Calc tests, the Office build and the Chromium combined view scenario passed. Scoped source checks passed."
doc_version: 3
doc_updated_at: "2026-11-28T09:13:27.789Z"
doc_updated_by: "CODER"
description: "Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula."
sections:
  Summary: |-
    Connect Calc value highlighting and formula marks to the native view

    Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula.
  Scope: "Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula."
  Plan: "Trace Calc native initial and persisted view state, connect menu and options, paint original marks and syntax colors, and verify normal grid and ODS paths."
  Verify Steps: |-
    - Trace Calc View syntax dispatch and GridWin/output drawing decisions from the pinned source.
    - Run only targeted Calc view options, grid and ODS settings tests plus a focused Chromium view-command scenario.
    - Cover explicit and toggled value highlighting, numeric/text/formula colors, formula-mark defaults and visibility, merged cells and view settings reopen.
    - Check Office types, scoped lint, JSDoc, provenance, dependencies, source structure and AgentPlane routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T09:13:27.393Z — VERIFY — ok

    By: CODER

    Note: 34 focused Calc tests, the Office build and the Chromium combined view scenario passed. Scoped source checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:33:25.213Z, excerpt_hash=sha256:82bb283dd3c78d0f1ebaef29be7091244484a64766874bd3194493d5cdc2beb6

    Details:

    - **Command:** Vitest with the existing pinned-vendor Vite allowance and one worker against view-options, calc-view-options, calc-options and viewdata.settings. **Result:** pass. **Evidence:** 34 tests in four files. **Scope:** view dispatch, original cell-kind colors, Options apply/reset/cancel, formula-mark admission and ODS settings.
    - **Command:** `npm run build:single-threaded` in apps/office, followed by Playwright `view-display.spec.ts --project calc --workers=1` with Chromium 1228. **Result:** pass. **Evidence:** TypeScript and production bundle succeeded, and the browser test passed. **Scope:** original menu and Options dialog, computed formula color, one visible marker and source hint on the merged anchor.
    - **Command:** Changed-source ESLint, Prettier and JSDoc, scoped source provenance, `npm run check:dependencies`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`. **Result:** pass. **Evidence:** affected checks passed and doctor produced its existing managed hook warning. **Scope:** modified code and the four altered provenance owners.
    - **Command:** `npm run inventory:parity:calc`. **Result:** fail at inherited evidence. **Evidence:** shared XML style marker rawLineStart is missing. **Scope:** shared provenance unrelated to this task.
    - **Boundary:** Calc uses the pinned light colors in the light browser grid, draws the formula mark in CSS pixels and uses HTML hover hints. The represented View settings flow through the active view and ODS document. Native desktop-wide preferences and the remaining View controls are outside this slice. CALC-264 documents the native hint lookup through Hide formula.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611280833-5M0KPW/blueprint/resolved-snapshot.json
    - old_digest: a4c4dc4939463aa6f4ffcc2f4358a5eabd5f604d85d1ec6e42584fd7417d944e
    - current_digest: a4c4dc4939463aa6f4ffcc2f4358a5eabd5f604d85d1ec6e42584fd7417d944e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280833-5M0KPW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280833-5M0KPW
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

Connect Calc value highlighting and formula marks to the native view

Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula.

## Scope

Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula.

## Plan

Trace Calc native initial and persisted view state, connect menu and options, paint original marks and syntax colors, and verify normal grid and ODS paths.

## Verify Steps

- Trace Calc View syntax dispatch and GridWin/output drawing decisions from the pinned source.
- Run only targeted Calc view options, grid and ODS settings tests plus a focused Chromium view-command scenario.
- Cover explicit and toggled value highlighting, numeric/text/formula colors, formula-mark defaults and visibility, merged cells and view settings reopen.
- Check Office types, scoped lint, JSDoc, provenance, dependencies, source structure and AgentPlane routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T09:13:27.393Z — VERIFY — ok

By: CODER

Note: 34 focused Calc tests, the Office build and the Chromium combined view scenario passed. Scoped source checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:33:25.213Z, excerpt_hash=sha256:82bb283dd3c78d0f1ebaef29be7091244484a64766874bd3194493d5cdc2beb6

Details:

- **Command:** Vitest with the existing pinned-vendor Vite allowance and one worker against view-options, calc-view-options, calc-options and viewdata.settings. **Result:** pass. **Evidence:** 34 tests in four files. **Scope:** view dispatch, original cell-kind colors, Options apply/reset/cancel, formula-mark admission and ODS settings.
- **Command:** `npm run build:single-threaded` in apps/office, followed by Playwright `view-display.spec.ts --project calc --workers=1` with Chromium 1228. **Result:** pass. **Evidence:** TypeScript and production bundle succeeded, and the browser test passed. **Scope:** original menu and Options dialog, computed formula color, one visible marker and source hint on the merged anchor.
- **Command:** Changed-source ESLint, Prettier and JSDoc, scoped source provenance, `npm run check:dependencies`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`. **Result:** pass. **Evidence:** affected checks passed and doctor produced its existing managed hook warning. **Scope:** modified code and the four altered provenance owners.
- **Command:** `npm run inventory:parity:calc`. **Result:** fail at inherited evidence. **Evidence:** shared XML style marker rawLineStart is missing. **Scope:** shared provenance unrelated to this task.
- **Boundary:** Calc uses the pinned light colors in the light browser grid, draws the formula mark in CSS pixels and uses HTML hover hints. The represented View settings flow through the active view and ODS document. Native desktop-wide preferences and the remaining View controls are outside this slice. CALC-264 documents the native hint lookup through Hide formula.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611280833-5M0KPW/blueprint/resolved-snapshot.json
- old_digest: a4c4dc4939463aa6f4ffcc2f4358a5eabd5f604d85d1ec6e42584fd7417d944e
- current_digest: a4c4dc4939463aa6f4ffcc2f4358a5eabd5f604d85d1ec6e42584fd7417d944e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280833-5M0KPW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280833-5M0KPW
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
