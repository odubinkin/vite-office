---
id: "202611221435-SQ5QF5"
title: "Keep frozen Calc cells stationary during browser scroll"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "npm run test:calc -- calc-pane-commands calc-outline-window viewdata"
  - "npm run typecheck"
  - "npm run test:e2e -- xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts --project=calc"
  - "git diff --check"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T14:35:26.938Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T14:41:28.920Z"
  updated_by: "CODER"
  note: "Passed 22 focused Calc tests, all 3 Chrome regressions, production build, type checks, lint, and diff checks. The new same-task scroll assertion reproduces the prior displacement."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T14:41:55.195Z"
  updated_by: "EVALUATOR"
  note: "The fix meets the frozen-pane browser behavior and preserves normal split behavior."
  evaluated_sha: "4f37c7f3080adc2284c77932905a710b980590e5"
  blueprint_digest: "d1438cde63a07f64ee8bc4bcfd9bf2f407411988531feee386fcc1f2b6ae4f10"
  evidence_refs:
    - ".agentplane/tasks/202611221435-SQ5QF5/README.md"
    - ".agentplane/tasks/202611221435-SQ5QF5/quality/20261122-144155195-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611221435-SQ5QF5/quality/20261122-144155195-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611221435-SQ5QF5/quality/20261122-144155195-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611221435-SQ5QF5/blueprint/resolved-snapshot.json"
    - "4f37c7f3080adc2284c77932905a710b980590e5"
  findings:
    - "The existing XLSX test now measures the scroll displacement synchronously. It failed on baseline and passed after native sticky positioning."
    - "Focused Calc tests, browser specs, type checks, lint, and routing checks passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T14:35:33.614Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-22T14:41:28.920Z"
    author: "CODER"
    state: "ok"
    note: "Passed 22 focused Calc tests, all 3 Chrome regressions, production build, type checks, lint, and diff checks. The new same-task scroll assertion reproduces the prior displacement."
doc_version: 3
doc_updated_at: "2026-11-22T14:41:28.968Z"
doc_updated_by: "CODER"
description: "Anchor frozen grid content to the browser scrollport along its frozen axes, and cover the transient position before the native view updates."
sections:
  Summary: "Keep frozen Calc cells visually stationary on their frozen axes during native browser scrolling."
  Scope: "Calc grid rendering and the existing XLSX frozen-grid browser regression."
  Plan: "Anchor the frozen row and column content in the DOM scrollport, preserving native virtual grid coordinates, selection, editing and normal split behavior. Extend the existing Chromium regression to measure each frozen axis before a scroll event can update the view, then run targeted Calc tests, type checks and the related browser specs."
  Verify Steps: |-
    - `npm run test:calc -- calc-pane-commands calc-outline-window viewdata`
    - `npm run typecheck`
    - `npm run test:e2e -- xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts --project=calc`
    - `git diff --check`
  Verification: |-
    - Command: `npm run test:calc -- calc-pane-commands calc-outline-window viewdata`
      - Result: pass
      - Evidence: 22 tests passed in 4 files
      - Scope: Pane commands, outline integration, and view data.
    - Command: `npm run typecheck`
      - Result: pass
      - Evidence: Tooling and application type checks passed
      - Scope: TypeScript workspace.
    - Command: `npm run build && ./node_modules/.bin/playwright test xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts --config test-results/frozen-panes.local.config.ts --project=calc`
      - Result: pass
      - Evidence: Production build succeeded. All 3 browser tests passed. On the baseline the new assertion failed because all three cells moved on both axes.
      - Scope: The local Playwright configuration used installed Google Chrome because the bundled headless shell was unavailable. Frozen axes, normal splits, and XLSX view persistence.
    - Command: `./node_modules/.bin/eslint apps/office/src/sc/browser/presentation/ScGridWindow.tsx apps/office/e2e/calc/xlsx-frozen-grid.spec.ts --max-warnings 0`
      - Result: pass
      - Evidence: No lint errors
      - Scope: Changed TypeScript files.
    - Command: `git diff --check`
      - Result: pass
      - Evidence: No whitespace errors
      - Scope: Task patch.
    - Command: `ap doctor`
      - Result: pass
      - Evidence: Passed, with an existing hook shim readiness warning
      - Scope: AgentPlane workspace.
    - Command: `node .agentplane/policy/check-routing.mjs`
      - Result: pass
      - Evidence: Policy routing OK
      - Scope: AgentPlane gateway.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T14:41:28.920Z — VERIFY — ok

    By: CODER

    Note: Passed 22 focused Calc tests, all 3 Chrome regressions, production build, type checks, lint, and diff checks. The new same-task scroll assertion reproduces the prior displacement.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T14:41:28.362Z, excerpt_hash=sha256:8537d82ea979a3b5f6208b284085d71f83ecdb097dab08f5bbfeccf552192270

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611221435-SQ5QF5/blueprint/resolved-snapshot.json
    - old_digest: d1438cde63a07f64ee8bc4bcfd9bf2f407411988531feee386fcc1f2b6ae4f10
    - current_digest: d1438cde63a07f64ee8bc4bcfd9bf2f407411988531feee386fcc1f2b6ae4f10
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611221435-SQ5QF5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611221435-SQ5QF5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Calc rendering and browser regression changes together."
  Findings: "The grid positions frozen cells using the last reported browser scroll offsets. A browser scroll can move those cells before React receives and applies the new offsets."
id_source: "generated"
---
## Summary

Keep frozen Calc cells visually stationary on their frozen axes during native browser scrolling.

## Scope

Calc grid rendering and the existing XLSX frozen-grid browser regression.

## Plan

Anchor the frozen row and column content in the DOM scrollport, preserving native virtual grid coordinates, selection, editing and normal split behavior. Extend the existing Chromium regression to measure each frozen axis before a scroll event can update the view, then run targeted Calc tests, type checks and the related browser specs.

## Verify Steps

- `npm run test:calc -- calc-pane-commands calc-outline-window viewdata`
- `npm run typecheck`
- `npm run test:e2e -- xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts --project=calc`
- `git diff --check`

## Verification

- Command: `npm run test:calc -- calc-pane-commands calc-outline-window viewdata`
  - Result: pass
  - Evidence: 22 tests passed in 4 files
  - Scope: Pane commands, outline integration, and view data.
- Command: `npm run typecheck`
  - Result: pass
  - Evidence: Tooling and application type checks passed
  - Scope: TypeScript workspace.
- Command: `npm run build && ./node_modules/.bin/playwright test xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts --config test-results/frozen-panes.local.config.ts --project=calc`
  - Result: pass
  - Evidence: Production build succeeded. All 3 browser tests passed. On the baseline the new assertion failed because all three cells moved on both axes.
  - Scope: The local Playwright configuration used installed Google Chrome because the bundled headless shell was unavailable. Frozen axes, normal splits, and XLSX view persistence.
- Command: `./node_modules/.bin/eslint apps/office/src/sc/browser/presentation/ScGridWindow.tsx apps/office/e2e/calc/xlsx-frozen-grid.spec.ts --max-warnings 0`
  - Result: pass
  - Evidence: No lint errors
  - Scope: Changed TypeScript files.
- Command: `git diff --check`
  - Result: pass
  - Evidence: No whitespace errors
  - Scope: Task patch.
- Command: `ap doctor`
  - Result: pass
  - Evidence: Passed, with an existing hook shim readiness warning
  - Scope: AgentPlane workspace.
- Command: `node .agentplane/policy/check-routing.mjs`
  - Result: pass
  - Evidence: Policy routing OK
  - Scope: AgentPlane gateway.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T14:41:28.920Z — VERIFY — ok

By: CODER

Note: Passed 22 focused Calc tests, all 3 Chrome regressions, production build, type checks, lint, and diff checks. The new same-task scroll assertion reproduces the prior displacement.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T14:41:28.362Z, excerpt_hash=sha256:8537d82ea979a3b5f6208b284085d71f83ecdb097dab08f5bbfeccf552192270

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611221435-SQ5QF5/blueprint/resolved-snapshot.json
- old_digest: d1438cde63a07f64ee8bc4bcfd9bf2f407411988531feee386fcc1f2b6ae4f10
- current_digest: d1438cde63a07f64ee8bc4bcfd9bf2f407411988531feee386fcc1f2b6ae4f10
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611221435-SQ5QF5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611221435-SQ5QF5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Calc rendering and browser regression changes together.

## Findings

The grid positions frozen cells using the last reported browser scroll offsets. A browser scroll can move those cells before React receives and applies the new offsets.
