---
id: "202608130746-TMATAR"
title: "Align framework shortcut and dispatch paths with LibreOffice"
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
  updated_at: "2026-08-13T07:46:51.022Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T07:48:25.583Z"
  updated_by: "CODER"
  note: "Verified: keymapping and dispatchprovider path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, formatting, lint, types, stale-path search, and diff checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T07:48:26.038Z"
  updated_by: "EVALUATOR"
  note: "Framework shortcut and dispatch paths match pinned LibreOffice ownership."
  evaluated_sha: "ced8b38702e50a6a01d6d9267d50368c5d6340fb"
  blueprint_digest: "f102f134d784cd9143e0b1769646eb01633fe1fa78fd72b54aa4ea775a0e36ab"
  evidence_refs:
    - ".agentplane/tasks/202608130746-TMATAR/README.md"
    - ".agentplane/tasks/202608130746-TMATAR/quality/20260813-074826038-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130746-TMATAR/quality/20260813-074826038-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130746-TMATAR/quality/20260813-074826038-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130746-TMATAR/blueprint/resolved-snapshot.json"
    - "HEAD"
  findings:
    - "Fast coverage and every declared structural quality gate passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align bounded framework shortcut and dispatch modules with pinned LibreOffice paths."
events:
  -
    type: "status"
    at: "2026-08-13T07:46:51.672Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align bounded framework shortcut and dispatch modules with pinned LibreOffice paths."
  -
    type: "verify"
    at: "2026-08-13T07:48:25.583Z"
    author: "CODER"
    state: "ok"
    note: "Verified: keymapping and dispatchprovider path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, formatting, lint, types, stale-path search, and diff checks passed."
doc_version: 3
doc_updated_at: "2026-08-13T07:48:25.665Z"
doc_updated_by: "CODER"
description: "Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior."
sections:
  Summary: |-
    Align framework shortcut and dispatch paths with LibreOffice

    Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
  Scope: |-
    - In scope: Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
    - Out of scope: unrelated refactors not required for "Align framework shortcut and dispatch paths with LibreOffice".
  Plan: "1. Rename framework/source/accelerators/browser-shortcuts and its co-located test to keymapping, retaining the browser shortcut API. 2. Rename framework/source/dispatch/commands and its co-located test to dispatchprovider, retaining typed browser command dispatch. 3. Update all imports, provenance, source-tree enforcement, and direct documentation without changing behavior. 4. Verify fast 100% coverage plus provenance, source-tree, docs, format, lint, type, stale-path, and diff checks; defer full verification to the next ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: renamed keymapping and dispatchprovider modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, and static quality all pass. 3. Run rg -n 'browser-shortcuts|source/dispatch/commands|from \"\\./commands\"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T07:48:25.583Z — VERIFY — ok

    By: CODER

    Note: Verified: keymapping and dispatchprovider path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, formatting, lint, types, stale-path search, and diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:46:51.672Z, excerpt_hash=sha256:e18e6ec1b262c46d9c29a1b7fa5e6ca3317d60b219864af31257f9df7c8c53e3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130746-TMATAR/blueprint/resolved-snapshot.json
    - old_digest: f102f134d784cd9143e0b1769646eb01633fe1fa78fd72b54aa4ea775a0e36ab
    - current_digest: f102f134d784cd9143e0b1769646eb01633fe1fa78fd72b54aa4ea775a0e36ab
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130746-TMATAR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130746-TMATAR
    - diagnostic_command: agentplane task run status 202608130746-TMATAR
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
    - Observation: The bounded browser shortcut adapter and typed dispatch provider now occupy their exact pinned framework source paths.
      Impact: Framework runtime imports, documentation, provenance, and source-tree enforcement agree with keymapping.cxx and dispatchprovider.cxx.
      Resolution: No command behavior changed; full suite remains deferred until the agreed next ten-task cadence.
id_source: "generated"
---
## Summary

Align framework shortcut and dispatch paths with LibreOffice

Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.

## Scope

- In scope: Move the existing browser shortcut and typed command-dispatch modules to exact pinned LibreOffice-like keymapping and dispatchprovider paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
- Out of scope: unrelated refactors not required for "Align framework shortcut and dispatch paths with LibreOffice".

## Plan

1. Rename framework/source/accelerators/browser-shortcuts and its co-located test to keymapping, retaining the browser shortcut API. 2. Rename framework/source/dispatch/commands and its co-located test to dispatchprovider, retaining typed browser command dispatch. 3. Update all imports, provenance, source-tree enforcement, and direct documentation without changing behavior. 4. Verify fast 100% coverage plus provenance, source-tree, docs, format, lint, type, stale-path, and diff checks; defer full verification to the next ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: renamed keymapping and dispatchprovider modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, and static quality all pass. 3. Run rg -n 'browser-shortcuts|source/dispatch/commands|from "\./commands"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T07:48:25.583Z — VERIFY — ok

By: CODER

Note: Verified: keymapping and dispatchprovider path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, formatting, lint, types, stale-path search, and diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:46:51.672Z, excerpt_hash=sha256:e18e6ec1b262c46d9c29a1b7fa5e6ca3317d60b219864af31257f9df7c8c53e3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130746-TMATAR/blueprint/resolved-snapshot.json
- old_digest: f102f134d784cd9143e0b1769646eb01633fe1fa78fd72b54aa4ea775a0e36ab
- current_digest: f102f134d784cd9143e0b1769646eb01633fe1fa78fd72b54aa4ea775a0e36ab
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130746-TMATAR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130746-TMATAR
- diagnostic_command: agentplane task run status 202608130746-TMATAR
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

- Observation: The bounded browser shortcut adapter and typed dispatch provider now occupy their exact pinned framework source paths.
  Impact: Framework runtime imports, documentation, provenance, and source-tree enforcement agree with keymapping.cxx and dispatchprovider.cxx.
  Resolution: No command behavior changed; full suite remains deferred until the agreed next ten-task cadence.
