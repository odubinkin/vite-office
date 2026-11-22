---
id: "202611212324-N26ZF8"
title: "Carry imported Calc data bars through native cell painting"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202611211854-CMXMAC"
tags:
  - "calc"
  - "code"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run a targeted Chromium Calc round trip with the original ODS fixture and verify bar painting and display-only value suppression."
  - "Run scoped ESLint and Prettier, Office typecheck, module boundary and source provenance checks, routing validation, AgentPlane doctor and git diff --check."
  - "Run the targeted Calc owner suites for native conditional resolution, Calc grid rendering, ODS data bars and the conditional-format editor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T23:25:07.386Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T00:47:30.855Z"
  updated_by: "CODER"
  note: "Native conditional paint selection and ODS data-bar rendering passed focused verification through core, production Chromium, and ODS export and reopen."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T00:47:31.522Z"
  updated_by: "EVALUATOR"
  note: "The native Calc conditional paint paths and browser ODS round trip satisfy the bounded scope."
  evaluated_sha: "b4b7494cad8a58b6964eccbe2657ea5e543674b2"
  blueprint_digest: "43bffa5b44a2d431b94e6a2f14c11061649571a3c9e201873415e98837a41efb"
  evidence_refs:
    - ".agentplane/tasks/202611212324-N26ZF8/README.md"
    - ".agentplane/tasks/202611212324-N26ZF8/quality/20261122-004731522-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611212324-N26ZF8/quality/20261122-004731522-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611212324-N26ZF8/quality/20261122-004731522-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611212324-N26ZF8/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/core/data/fillinfo.test.ts"
    - "apps/office/src/sc/source/ui/view/output.test.ts"
    - "output/playwright/N26ZF8/browser.json"
  findings:
    - "Style, scale and bar are evaluated independently in native order. Only-bar mode suppresses paint while leaving the accessible value and editor available."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port the native Calc conditional data-bar paint path using the pinned LibreOffice sources and focused ODS verification."
events:
  -
    type: "status"
    at: "2026-11-22T00:36:04.236Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the native Calc conditional data-bar paint path using the pinned LibreOffice sources and focused ODS verification."
  -
    type: "verify"
    at: "2026-11-22T00:47:30.855Z"
    author: "CODER"
    state: "ok"
    note: "Native conditional paint selection and ODS data-bar rendering passed focused verification through core, production Chromium, and ODS export and reopen."
doc_version: 3
doc_updated_at: "2026-11-22T00:47:30.918Z"
doc_updated_by: "CODER"
description: "Resolve the native conditional paint results independently in their source order and carry imported ODS data-bar geometry, colors, axis and value visibility to the existing grid. Preserve persisted settings and current document actions."
sections:
  Summary: "Carry imported Calc data bars from the native conditional-format entries into the existing grid's background and cell-content rendering. Keep the ODS representation and the editable cell value connected to the same native rule."
  Scope: |-
    - Calc conditional result aggregation in the counterparts of conditio.cxx and fillinfo.cxx, data-bar drawing and cell-text visibility from output.cxx and output2.cxx, and the browser grid adaptation.
    - Native fixture and focused core, presenter and Chromium verification. Update source witnesses for changed owners and record applicable suspected upstream issues.
    - Existing save, import, export, autosave, and cell editing entry points remain the contract. Clipboard semantics, icon-set modeling and the standalone data-bar options dialog are separate work.
  Plan: |-
    1. Use Graphify and the pinned LibreOffice source to trace GetData, handleConditionalFormat, drawDataBars, and text output. Retain the native first available result independently for style, color scale and data bar, and preserve the existing document query contracts.
    2. Route the native result into platform-independent paint geometry and existing grid layers. Match the inset, signed extent, gradient direction, axis and painting order. Suppress painted text for only-bar entries without losing the cell's editor or accessible value.
    3. Use the native ODS data-bar fixture, retaining its original rule settings through export and reopen. Add focused coverage of precedence, signed geometry, and value visibility that would miss the regression if only the model were tested.
    4. Update the owner provenance and runtime records, run targeted verification, and refresh Graphify during closeout.
  Verify Steps: |-
    - Run `npm run test:calc -- conditional-copy.test.ts conditio.entry.test.ts calc-presenters.test.tsx calc-conditional-format.test.tsx ods-data-bars.test.ts` plus any new focused native paint tests. Confirm conditional precedence, observable grid layers, unchanged editor access, and ODS settings after save and reopen.
    - Build Office and run the new Calc ODS data-bar Chromium case through `playwright test --config apps/office/playwright.config.ts --project calc` with the case filter and the repo-local Chromium. Confirm imported bars, only-bar display and reopened values in the production grid.
    - Run scoped ESLint and Prettier, `npm run typecheck --workspace @vite-office/office`, `npm run check:dependencies`, and `npm run check:source-provenance`. Validate task ownership and run `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
    - Record a clean task-scoped checkout. The next full run follows the ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T00:47:30.855Z — VERIFY — ok

    By: CODER

    Note: Native conditional paint selection and ODS data-bar rendering passed focused verification through core, production Chromium, and ODS export and reopen.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T00:36:04.236Z, excerpt_hash=sha256:67915fb4ee6823fd623d15c952cb5860cad6436494144ee4f5b74b1d7adfbbcb

    Details:

    Calc Vitest: 39 tests in eight owner files passed, including native style, scale and data-bar precedence and inclusive geometry. Production Office build and Office typecheck passed. Chromium Calc: two cases passed, covering the pinned databar.ods, positive and negative bars, centered axis color, bar-only display, accessible value, formula bar, and export and reopen. The existing reference-backed XLSX color fills also passed. Focused lint, formatting, module boundary and provenance checks passed. Calc registry invariants, routing, doctor and git diff checks passed. Doctor reported the existing hook shim warning. Chromium evidence is in output/playwright/N26ZF8/browser.json. The next full run follows the ten-task interval.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611212324-N26ZF8/blueprint/resolved-snapshot.json
    - old_digest: 43bffa5b44a2d431b94e6a2f14c11061649571a3c9e201873415e98837a41efb
    - current_digest: 43bffa5b44a2d431b94e6a2f14c11061649571a3c9e201873415e98837a41efb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611212324-N26ZF8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611212324-N26ZF8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and its source witnesses in the task commit. Existing ODS data-bar settings retain their original stored shape."
  Findings: "The preceding checkpoint owns its full regression and finishes before this task begins. The Graphify query located the existing grid and conditional result entry points; pinned fillinfo.cxx and output.cxx define the gaps this task addresses."
id_source: "generated"
---
## Summary

Carry imported Calc data bars from the native conditional-format entries into the existing grid's background and cell-content rendering. Keep the ODS representation and the editable cell value connected to the same native rule.

## Scope

- Calc conditional result aggregation in the counterparts of conditio.cxx and fillinfo.cxx, data-bar drawing and cell-text visibility from output.cxx and output2.cxx, and the browser grid adaptation.
- Native fixture and focused core, presenter and Chromium verification. Update source witnesses for changed owners and record applicable suspected upstream issues.
- Existing save, import, export, autosave, and cell editing entry points remain the contract. Clipboard semantics, icon-set modeling and the standalone data-bar options dialog are separate work.

## Plan

1. Use Graphify and the pinned LibreOffice source to trace GetData, handleConditionalFormat, drawDataBars, and text output. Retain the native first available result independently for style, color scale and data bar, and preserve the existing document query contracts.
2. Route the native result into platform-independent paint geometry and existing grid layers. Match the inset, signed extent, gradient direction, axis and painting order. Suppress painted text for only-bar entries without losing the cell's editor or accessible value.
3. Use the native ODS data-bar fixture, retaining its original rule settings through export and reopen. Add focused coverage of precedence, signed geometry, and value visibility that would miss the regression if only the model were tested.
4. Update the owner provenance and runtime records, run targeted verification, and refresh Graphify during closeout.

## Verify Steps

- Run `npm run test:calc -- conditional-copy.test.ts conditio.entry.test.ts calc-presenters.test.tsx calc-conditional-format.test.tsx ods-data-bars.test.ts` plus any new focused native paint tests. Confirm conditional precedence, observable grid layers, unchanged editor access, and ODS settings after save and reopen.
- Build Office and run the new Calc ODS data-bar Chromium case through `playwright test --config apps/office/playwright.config.ts --project calc` with the case filter and the repo-local Chromium. Confirm imported bars, only-bar display and reopened values in the production grid.
- Run scoped ESLint and Prettier, `npm run typecheck --workspace @vite-office/office`, `npm run check:dependencies`, and `npm run check:source-provenance`. Validate task ownership and run `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
- Record a clean task-scoped checkout. The next full run follows the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T00:47:30.855Z — VERIFY — ok

By: CODER

Note: Native conditional paint selection and ODS data-bar rendering passed focused verification through core, production Chromium, and ODS export and reopen.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T00:36:04.236Z, excerpt_hash=sha256:67915fb4ee6823fd623d15c952cb5860cad6436494144ee4f5b74b1d7adfbbcb

Details:

Calc Vitest: 39 tests in eight owner files passed, including native style, scale and data-bar precedence and inclusive geometry. Production Office build and Office typecheck passed. Chromium Calc: two cases passed, covering the pinned databar.ods, positive and negative bars, centered axis color, bar-only display, accessible value, formula bar, and export and reopen. The existing reference-backed XLSX color fills also passed. Focused lint, formatting, module boundary and provenance checks passed. Calc registry invariants, routing, doctor and git diff checks passed. Doctor reported the existing hook shim warning. Chromium evidence is in output/playwright/N26ZF8/browser.json. The next full run follows the ten-task interval.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611212324-N26ZF8/blueprint/resolved-snapshot.json
- old_digest: 43bffa5b44a2d431b94e6a2f14c11061649571a3c9e201873415e98837a41efb
- current_digest: 43bffa5b44a2d431b94e6a2f14c11061649571a3c9e201873415e98837a41efb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611212324-N26ZF8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611212324-N26ZF8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and its source witnesses in the task commit. Existing ODS data-bar settings retain their original stored shape.

## Findings

The preceding checkpoint owns its full regression and finishes before this task begins. The Graphify query located the existing grid and conditional result entry points; pinned fillinfo.cxx and output.cxx define the gaps this task addresses.
