---
id: "202608130525-JG88B2"
title: "Align the current source tree with LibreOffice-oriented feature layers"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T05:34:00.989Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T05:45:18.305Z"
  updated_by: "CODER"
  note: "Verified: LibreOffice-derived source migration preserves all tested Writer behavior, resolves parity mappings, keeps full unit coverage, and passes the focused production Chromium workspace scenario."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T05:45:18.725Z"
  updated_by: "EVALUATOR"
  note: "LO-derived browser source ownership and behavior are verified."
  evaluated_sha: "d76430c8fb7a1daf88916f4e620e99ad77cf07e1"
  blueprint_digest: "0ae50ad0ecb417900b84da4e9add8f741bbe57eb403bf1ff5bfdd2f290f04f27"
  evidence_refs:
    - ".agentplane/tasks/202608130525-JG88B2/README.md"
    - ".agentplane/tasks/202608130525-JG88B2/quality/20260813-054518725-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130525-JG88B2/quality/20260813-054518725-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130525-JG88B2/quality/20260813-054518725-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130525-JG88B2/blueprint/resolved-snapshot.json"
    - "npm run test:coverage; npm run test:e2e -- --grep loads the Writer structural workspace; npm run check:source-tree; npm run inventory:parity"
  findings:
    - "All required Writer source, test, documentation, and menu-placement paths resolve after relocation."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: migrate the current application into documented LibreOffice-oriented browser feature layers before resuming the deferred Writer list capability."
events:
  -
    type: "status"
    at: "2026-08-13T05:26:50.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: migrate the current application into documented LibreOffice-oriented browser feature layers before resuming the deferred Writer list capability."
  -
    type: "verify"
    at: "2026-08-13T05:45:18.305Z"
    author: "CODER"
    state: "ok"
    note: "Verified: LibreOffice-derived source migration preserves all tested Writer behavior, resolves parity mappings, keeps full unit coverage, and passes the focused production Chromium workspace scenario."
doc_version: 3
doc_updated_at: "2026-08-13T05:45:18.380Z"
doc_updated_by: "CODER"
description: "Reorganize the existing static browser application into explicit app, shared, and Writer feature layers; decompose oversized Writer editor behavior; preserve all behavior, tests, documentation, and parity links so later Writer capabilities can extend stable LibreOffice-aligned boundaries."
sections:
  Summary: |-
    Align the current source tree with LibreOffice-oriented feature layers

    Reorganize the existing static browser application into explicit app, shared, and Writer feature layers; decompose oversized Writer editor behavior; preserve all behavior, tests, documentation, and parity links so later Writer capabilities can extend stable LibreOffice-aligned boundaries.
  Scope: |-
    - In scope: migrate the current static browser code into directory and module names derived from the pinned LibreOffice tree, rather than generic feature-layer names: `sw` for Writer, `sfx2` for document/command framework, `svl` for common storage and recovery contracts, `framework` for application shell, and `vcl/browser` for browser platform adapters.
    - In scope: preserve meaningful upstream sub-boundaries where the current implementation has an equivalent: `sw/source/core` for serializable Writer model and editing transitions, `sw/source/uibase` for Writer application/UI, and `sw/uiconfig/swriter` for browser Writer command placement declarations.
    - In scope: decompose the oversized Writer editor into independently testable rendering, selection/caret, and editable-paragraph modules; keep public DOM landmarks, accessible names, serialized data, shortcuts, storage behavior, and clipboard payloads stable.
    - In scope: move associated unit/component tests with their implementation, update imports, local documentation links, parity mappings, and architecture documentation with explicit upstream-to-browser ownership mapping.
    - Out of scope: copying LibreOffice C++ source or its runtime mechanics verbatim; new Writer commands, list semantics, visual redesign, format conversion, or changes to user-observable behavior. The blocked list task 202608130521-XRVZ3V resumes after this prerequisite.
  Plan: |-
    1. Inspect the pinned LibreOffice 26.8.0.2 directory ownership for the currently implemented shell, shared infrastructure, Writer model, Writer UI, menu/toolbar placement, browser platform bridges, and tests; publish the exact source-tree mapping.
    2. Replace the interim generic `app`, `shared`, `platform`, and `features/writer` layout with LibreOffice-derived root areas: `framework`, `sfx2`, `svl`, `vcl/browser`, and `sw`; migrate every existing module and colocated test to its matching area.
    3. Place serializable Writer documents and paragraph transitions below `sw/source/core`, Writer history/application orchestration below `sw/source/uibase`, and Writer presentational components below `sw/source/uibase/utlui`; make browser Writer menu/toolbar declaration data live below `sw/uiconfig/swriter`.
    4. Decompose `WriterPlainTextEditor` into a focused document-body orchestrator plus independently documented selection/caret and editable-paragraph modules, keeping its current accessible and browser-selection contracts unchanged.
    5. Update imports, program documentation, and parity mapping paths so each local record identifies both its browser file and corresponding upstream LO region; add structural regression coverage where existing tests do not protect a mapped boundary.
    6. Run full fast coverage plus focused production Chromium and inventory-parity checks; defer only the aggregate verification suite under the approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all tests remain green at 100 percent coverage after the relocation and editor decomposition.
    2. Run `npm run test:e2e -- --grep "loads the Writer structural workspace"`. Expected: the production Chromium Writer workspace retains menus, toolbars, editing, selection, clipboard, paragraph-break, history, and accessibility behavior.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: every existing Writer record resolves the relocated implementation, test, and documentation markers.
    4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all structural, documentation, size, and policy gates pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    - Command: `npm run test:coverage`
      Result: pass
      Evidence: 21 test files / 63 tests passed; statements, branches, functions, and lines are all 100 percent.
      Scope: relocated modules, decomposed Writer editor, and Writer menu configuration.
    - Command: `npm run test:e2e -- --grep "loads the Writer structural workspace"`
      Result: pass
      Evidence: production build succeeded; 1 Chromium Writer workspace scenario passed.
      Scope: static entry, relocated imports, Writer menu/toolbar/editor/history/selection landmarks, and accessibility smoke.
    - Command: `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`
      Result: pass
      Evidence: all relocated Writer implementation, test, and documentation markers resolved against `9bc445578031fecf56086729d8e4940c77e14d65`; eight pre-existing capability gaps remain explicit.
      Scope: existing mapped Writer commands and their upstream evidence.
    - Command: `npm run check:source-tree && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`
      Result: pass
      Evidence: source-tree gate confirmed 12 required LO-derived paths and 6 retired generic roots; JSDoc covers 130 authored source files; only pre-existing inventory script remains a file-size review candidate; doctor reports no errors.
      Scope: structural ownership, static quality, documentation, size, and policy.

    ### 2026-08-13T05:45:18.305Z — VERIFY — ok

    By: CODER

    Note: Verified: LibreOffice-derived source migration preserves all tested Writer behavior, resolves parity mappings, keeps full unit coverage, and passes the focused production Chromium workspace scenario.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T05:44:55.017Z, excerpt_hash=sha256:5077110f9a7e236474dddba7dae06a939322bdd738f99e956bddd45000dfb819

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130525-JG88B2/blueprint/resolved-snapshot.json
    - old_digest: 0ae50ad0ecb417900b84da4e9add8f741bbe57eb403bf1ff5bfdd2f290f04f27
    - current_digest: 0ae50ad0ecb417900b84da4e9add8f741bbe57eb403bf1ff5bfdd2f290f04f27
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130525-JG88B2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130525-JG88B2
    - diagnostic_command: agentplane task run status 202608130525-JG88B2
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task-scoped source relocation/decomposition, documentation, mapping, and task-artifact commits together.
    - Re-run coverage and the focused Writer structural workspace E2E scenario to verify the original source layout still has its established behavior.
  Findings: |-
    - Deferred: aggregate `npm run verify`, static smoke, inventory coverage, and the full browser matrix follow the user-approved cadence of once per ten closed tasks.
    - Residual risk: current source layout mirrors the ownership and names of instantiated LibreOffice regions, but it cannot provide source-level C++ or runtime equivalence. Every later module must enter its matching pinned top-level and subdirectory region, enforced for current regions by `npm run check:source-tree`.
    - Follow-up: task `202608130521-XRVZ3V` remains blocked until this structural prerequisite is closed, then resumes as the first Writer list layer.
id_source: "generated"
---
## Summary

Align the current source tree with LibreOffice-oriented feature layers

Reorganize the existing static browser application into explicit app, shared, and Writer feature layers; decompose oversized Writer editor behavior; preserve all behavior, tests, documentation, and parity links so later Writer capabilities can extend stable LibreOffice-aligned boundaries.

## Scope

- In scope: migrate the current static browser code into directory and module names derived from the pinned LibreOffice tree, rather than generic feature-layer names: `sw` for Writer, `sfx2` for document/command framework, `svl` for common storage and recovery contracts, `framework` for application shell, and `vcl/browser` for browser platform adapters.
- In scope: preserve meaningful upstream sub-boundaries where the current implementation has an equivalent: `sw/source/core` for serializable Writer model and editing transitions, `sw/source/uibase` for Writer application/UI, and `sw/uiconfig/swriter` for browser Writer command placement declarations.
- In scope: decompose the oversized Writer editor into independently testable rendering, selection/caret, and editable-paragraph modules; keep public DOM landmarks, accessible names, serialized data, shortcuts, storage behavior, and clipboard payloads stable.
- In scope: move associated unit/component tests with their implementation, update imports, local documentation links, parity mappings, and architecture documentation with explicit upstream-to-browser ownership mapping.
- Out of scope: copying LibreOffice C++ source or its runtime mechanics verbatim; new Writer commands, list semantics, visual redesign, format conversion, or changes to user-observable behavior. The blocked list task 202608130521-XRVZ3V resumes after this prerequisite.

## Plan

1. Inspect the pinned LibreOffice 26.8.0.2 directory ownership for the currently implemented shell, shared infrastructure, Writer model, Writer UI, menu/toolbar placement, browser platform bridges, and tests; publish the exact source-tree mapping.
2. Replace the interim generic `app`, `shared`, `platform`, and `features/writer` layout with LibreOffice-derived root areas: `framework`, `sfx2`, `svl`, `vcl/browser`, and `sw`; migrate every existing module and colocated test to its matching area.
3. Place serializable Writer documents and paragraph transitions below `sw/source/core`, Writer history/application orchestration below `sw/source/uibase`, and Writer presentational components below `sw/source/uibase/utlui`; make browser Writer menu/toolbar declaration data live below `sw/uiconfig/swriter`.
4. Decompose `WriterPlainTextEditor` into a focused document-body orchestrator plus independently documented selection/caret and editable-paragraph modules, keeping its current accessible and browser-selection contracts unchanged.
5. Update imports, program documentation, and parity mapping paths so each local record identifies both its browser file and corresponding upstream LO region; add structural regression coverage where existing tests do not protect a mapped boundary.
6. Run full fast coverage plus focused production Chromium and inventory-parity checks; defer only the aggregate verification suite under the approved ten-task cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all tests remain green at 100 percent coverage after the relocation and editor decomposition.
2. Run `npm run test:e2e -- --grep "loads the Writer structural workspace"`. Expected: the production Chromium Writer workspace retains menus, toolbars, editing, selection, clipboard, paragraph-break, history, and accessibility behavior.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: every existing Writer record resolves the relocated implementation, test, and documentation markers.
4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all structural, documentation, size, and policy gates pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
- Command: `npm run test:coverage`
  Result: pass
  Evidence: 21 test files / 63 tests passed; statements, branches, functions, and lines are all 100 percent.
  Scope: relocated modules, decomposed Writer editor, and Writer menu configuration.
- Command: `npm run test:e2e -- --grep "loads the Writer structural workspace"`
  Result: pass
  Evidence: production build succeeded; 1 Chromium Writer workspace scenario passed.
  Scope: static entry, relocated imports, Writer menu/toolbar/editor/history/selection landmarks, and accessibility smoke.
- Command: `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`
  Result: pass
  Evidence: all relocated Writer implementation, test, and documentation markers resolved against `9bc445578031fecf56086729d8e4940c77e14d65`; eight pre-existing capability gaps remain explicit.
  Scope: existing mapped Writer commands and their upstream evidence.
- Command: `npm run check:source-tree && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`
  Result: pass
  Evidence: source-tree gate confirmed 12 required LO-derived paths and 6 retired generic roots; JSDoc covers 130 authored source files; only pre-existing inventory script remains a file-size review candidate; doctor reports no errors.
  Scope: structural ownership, static quality, documentation, size, and policy.

### 2026-08-13T05:45:18.305Z — VERIFY — ok

By: CODER

Note: Verified: LibreOffice-derived source migration preserves all tested Writer behavior, resolves parity mappings, keeps full unit coverage, and passes the focused production Chromium workspace scenario.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T05:44:55.017Z, excerpt_hash=sha256:5077110f9a7e236474dddba7dae06a939322bdd738f99e956bddd45000dfb819

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130525-JG88B2/blueprint/resolved-snapshot.json
- old_digest: 0ae50ad0ecb417900b84da4e9add8f741bbe57eb403bf1ff5bfdd2f290f04f27
- current_digest: 0ae50ad0ecb417900b84da4e9add8f741bbe57eb403bf1ff5bfdd2f290f04f27
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130525-JG88B2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130525-JG88B2
- diagnostic_command: agentplane task run status 202608130525-JG88B2
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task-scoped source relocation/decomposition, documentation, mapping, and task-artifact commits together.
- Re-run coverage and the focused Writer structural workspace E2E scenario to verify the original source layout still has its established behavior.

## Findings

- Deferred: aggregate `npm run verify`, static smoke, inventory coverage, and the full browser matrix follow the user-approved cadence of once per ten closed tasks.
- Residual risk: current source layout mirrors the ownership and names of instantiated LibreOffice regions, but it cannot provide source-level C++ or runtime equivalence. Every later module must enter its matching pinned top-level and subdirectory region, enforced for current regions by `npm run check:source-tree`.
- Follow-up: task `202608130521-XRVZ3V` remains blocked until this structural prerequisite is closed, then resumes as the first Writer list layer.
