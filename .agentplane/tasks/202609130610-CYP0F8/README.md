---
id: "202609130610-CYP0F8"
title: "Implement Stage 0 upstream parity foundation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-13T06:11:16.205Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-13T07:05:00.661Z"
  updated_by: "CODER"
  note: "verified-202609130610-CYP0F8"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-13T07:05:24.566Z"
  updated_by: "EVALUATOR"
  note: "Stage 0 matches the approved scope and pinned LibreOffice lifecycle semantics; all declared checks pass."
  evaluated_sha: "4e58b158b20bf7fd94ecad431545cbce2c188f35"
  blueprint_digest: "9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088"
  evidence_refs:
    - ".agentplane/tasks/202609130610-CYP0F8/README.md"
    - ".agentplane/tasks/202609130610-CYP0F8/quality/20260913-070524566-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609130610-CYP0F8/quality/20260913-070524566-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609130610-CYP0F8/quality/20260913-070524566-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609130610-CYP0F8/blueprint/resolved-snapshot.json"
    - "npm run verify: pass with 100% app and inventory coverage, 8/8 Chromium E2E, build and static smoke"
    - "npm run inventory:parity: 14 implemented records plus exhaustive runtime and 31-command inventory"
    - "node .agentplane/policy/check-routing.mjs and ap doctor: pass"
  findings:
    - "Lifecycle generations are independent, primary and recovery acknowledgements occur only after successful writes, and each later primary save moves the single Undo/Redo save mark."
    - "Parity validators reject malformed evidence, unresolved verified gaps, unapproved exceptions, missing closure evidence, uncovered runtime modules, unknown capability references, and duplicate visible command IDs."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved Stage 0 lifecycle generations, parity inventory validation, documentation synchronization, and regression coverage."
events:
  -
    type: "status"
    at: "2026-09-13T06:11:21.567Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Stage 0 lifecycle generations, parity inventory validation, documentation synchronization, and regression coverage."
  -
    type: "verify"
    at: "2026-09-13T07:04:22.682Z"
    author: "CODER"
    state: "ok"
    note: "Stage 0 lifecycle, inventory, docs, and regression checks pass."
  -
    type: "verify"
    at: "2026-09-13T07:05:00.661Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609130610-CYP0F8"
doc_version: 3
doc_updated_at: "2026-09-13T07:05:00.743Z"
doc_updated_by: "CODER"
description: "Implement Stage 0 of docs/program/vite-office-upstream-parity-plan.md: lifecycle generations, parity record model and inventory, stronger validators, synchronized documentation, and required tests."
sections:
  Summary: "Implement Stage 0 of the approved upstream-parity plan: correct Writer lifecycle generations and recovery behavior, replace path-only parity claims with evidence-bearing capability records, classify the current runtime surface, strengthen inventory validation, and synchronize affected program documentation."
  Scope: |-
    - In scope: lifecycle generation state and tests; recovery autosave generation handling; parity capability schema/data/validators/tests; complete classification of current runtime modules, exported domain operations, user commands, browser adapters, foundation code, internal operations, and placeholder suites; Stage 0 documentation corrections.
    - Out of scope: Stage 1 dependency-boundary refactors, Stage 2 session/dispatch redesign, new LibreOffice feature slices, network access, and unrelated cleanup.
    - Constraints: preserve the user-owned untracked plan unless a Stage 0 documentation correction is required; no network operations; stop for re-approval on material drift under gateway policy.
  Plan: |-
    1. Inspect lifecycle, recovery, command registry, parity schema/data, validators, tests, and affected documentation; establish the exact current behavior and bounded file set.
    2. Implement independent contentGeneration, savedGeneration, and recoveryGeneration semantics with stable identity, successful-save-only acknowledgement, and correct undo/redo behavior.
    3. Expand capability records and current-surface inventory; strengthen validators for IDs, evidence, tests, gaps, exceptions, command coverage, and closed-record traceability.
    4. Synchronize documentation for record counts/status semantics, transaction history, recovery/workers, save versus recovery/export, and working suites.
    5. Add focused regression tests, run the declared verification suite, record evidence, and finish with a traceable commit.
  Verify Steps: |-
    1. Run focused lifecycle/recovery tests. Expected: consecutive dirty mutations receive distinct generations; the second autosave is not skipped; failed primary saves do not advance savedGeneration; undo/redo preserve correct modified state.
    2. Run parity inventory unit tests and npm run inventory:parity. Expected: validators reject duplicate IDs, verified records without precise evidence/local tests, unresolved verified gaps, unapproved stack exceptions, uncovered/runtime-only command IDs, and closed records without task/commit evidence.
    3. Run npm run verify. Expected: formatting, lint, TypeScript, unit/coverage, inventory coverage, Playwright E2E, static build, JSDoc, and file-size checks pass.
    4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy/routing and Agentplane health checks pass.
    5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved Stage 0 changes and Agentplane task artifacts are present; any residual gap is recorded in Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-13T07:04:22.682Z — VERIFY — ok

    By: CODER

    Note: Stage 0 lifecycle, inventory, docs, and regression checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:04:22.140Z, excerpt_hash=sha256:2331c405946581c51c7038ab03df7734c2d0fd161d1aecbeaaf93c4bc0f0d37b

    Details:

    Command: focused lifecycle and recovery Vitest suite. Result: pass. Evidence: 5 files, 22 tests. Scope: content/save/recovery generations, failed saves, autosave, and moved Undo/Redo save marks. Command: focused parity inventory Vitest suite plus npm run inventory:parity. Result: pass. Evidence: 3 files, 12 tests; 14 implemented records, complete runtime and 31-command inventory. Scope: schema, evidence, gap, exception, closed-record, module, operation, and command validation. Command: npm run verify. Result: pass. Evidence: 42 app test files and 175 tests at 100% coverage; 31 inventory test files and 79 tests at 100% coverage; 8 Chromium E2E tests; build, static, JSDoc, formatting, lint, typecheck, and source-file-size gates passed. Scope: repository-wide Stage 0 regression surface. Command: node .agentplane/policy/check-routing.mjs and ap doctor. Result: pass. Evidence: policy routing OK; doctor OK with one pre-existing unrelated warning. Scope: policy and workflow health.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130610-CYP0F8/blueprint/resolved-snapshot.json
    - old_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
    - current_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130610-CYP0F8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609130610-CYP0F8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-13T07:05:00.661Z — VERIFY — ok

    By: CODER

    Note: verified-202609130610-CYP0F8
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:04:22.758Z, excerpt_hash=sha256:2331c405946581c51c7038ab03df7734c2d0fd161d1aecbeaaf93c4bc0f0d37b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130610-CYP0F8/blueprint/resolved-snapshot.json
    - old_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
    - current_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130610-CYP0F8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609130610-CYP0F8 --result verified-202609130610-CYP0F8 --commit 4e58b158b20bf7fd94ecad431545cbce2c188f35
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Stage 0 implementation and task close commits using normal non-destructive Git history operations, then rerun the focused lifecycle and inventory tests plus policy routing validation. No data migration or external rollback is required."
  Findings: "Implemented against the pinned LibreOffice baseline: SfxObjectShell modified/save transitions, SfxBaseModel recovery acknowledgement, and SwUndoManager save-mark behavior. Stage 0 inventory reports 14 implemented and 0 verified capabilities; unresolved semantic gaps remain explicit. The initially flaky pointer-selection E2E used fixed pixel coordinates and was repaired to derive endpoints from rendered DOM ranges; it then passed five repeated Chromium runs and the full suite. Agentplane doctor passes with one pre-existing warning about a prior DONE task commit reference and informational fallback-hook notices. No network access or material scope drift occurred. The user-provided parity plan remains an intentionally untracked reviewed artifact."
id_source: "generated"
---
## Summary

Implement Stage 0 of the approved upstream-parity plan: correct Writer lifecycle generations and recovery behavior, replace path-only parity claims with evidence-bearing capability records, classify the current runtime surface, strengthen inventory validation, and synchronize affected program documentation.

## Scope

- In scope: lifecycle generation state and tests; recovery autosave generation handling; parity capability schema/data/validators/tests; complete classification of current runtime modules, exported domain operations, user commands, browser adapters, foundation code, internal operations, and placeholder suites; Stage 0 documentation corrections.
- Out of scope: Stage 1 dependency-boundary refactors, Stage 2 session/dispatch redesign, new LibreOffice feature slices, network access, and unrelated cleanup.
- Constraints: preserve the user-owned untracked plan unless a Stage 0 documentation correction is required; no network operations; stop for re-approval on material drift under gateway policy.

## Plan

1. Inspect lifecycle, recovery, command registry, parity schema/data, validators, tests, and affected documentation; establish the exact current behavior and bounded file set.
2. Implement independent contentGeneration, savedGeneration, and recoveryGeneration semantics with stable identity, successful-save-only acknowledgement, and correct undo/redo behavior.
3. Expand capability records and current-surface inventory; strengthen validators for IDs, evidence, tests, gaps, exceptions, command coverage, and closed-record traceability.
4. Synchronize documentation for record counts/status semantics, transaction history, recovery/workers, save versus recovery/export, and working suites.
5. Add focused regression tests, run the declared verification suite, record evidence, and finish with a traceable commit.

## Verify Steps

1. Run focused lifecycle/recovery tests. Expected: consecutive dirty mutations receive distinct generations; the second autosave is not skipped; failed primary saves do not advance savedGeneration; undo/redo preserve correct modified state.
2. Run parity inventory unit tests and npm run inventory:parity. Expected: validators reject duplicate IDs, verified records without precise evidence/local tests, unresolved verified gaps, unapproved stack exceptions, uncovered/runtime-only command IDs, and closed records without task/commit evidence.
3. Run npm run verify. Expected: formatting, lint, TypeScript, unit/coverage, inventory coverage, Playwright E2E, static build, JSDoc, and file-size checks pass.
4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy/routing and Agentplane health checks pass.
5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved Stage 0 changes and Agentplane task artifacts are present; any residual gap is recorded in Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-13T07:04:22.682Z — VERIFY — ok

By: CODER

Note: Stage 0 lifecycle, inventory, docs, and regression checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:04:22.140Z, excerpt_hash=sha256:2331c405946581c51c7038ab03df7734c2d0fd161d1aecbeaaf93c4bc0f0d37b

Details:

Command: focused lifecycle and recovery Vitest suite. Result: pass. Evidence: 5 files, 22 tests. Scope: content/save/recovery generations, failed saves, autosave, and moved Undo/Redo save marks. Command: focused parity inventory Vitest suite plus npm run inventory:parity. Result: pass. Evidence: 3 files, 12 tests; 14 implemented records, complete runtime and 31-command inventory. Scope: schema, evidence, gap, exception, closed-record, module, operation, and command validation. Command: npm run verify. Result: pass. Evidence: 42 app test files and 175 tests at 100% coverage; 31 inventory test files and 79 tests at 100% coverage; 8 Chromium E2E tests; build, static, JSDoc, formatting, lint, typecheck, and source-file-size gates passed. Scope: repository-wide Stage 0 regression surface. Command: node .agentplane/policy/check-routing.mjs and ap doctor. Result: pass. Evidence: policy routing OK; doctor OK with one pre-existing unrelated warning. Scope: policy and workflow health.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130610-CYP0F8/blueprint/resolved-snapshot.json
- old_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
- current_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130610-CYP0F8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609130610-CYP0F8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-13T07:05:00.661Z — VERIFY — ok

By: CODER

Note: verified-202609130610-CYP0F8
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:04:22.758Z, excerpt_hash=sha256:2331c405946581c51c7038ab03df7734c2d0fd161d1aecbeaaf93c4bc0f0d37b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130610-CYP0F8/blueprint/resolved-snapshot.json
- old_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
- current_digest: 9e32a5a1b013688e1028d9f367fdbfab5e6c00e21e0382428f9ab41675dee088
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130610-CYP0F8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609130610-CYP0F8 --result verified-202609130610-CYP0F8 --commit 4e58b158b20bf7fd94ecad431545cbce2c188f35
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Stage 0 implementation and task close commits using normal non-destructive Git history operations, then rerun the focused lifecycle and inventory tests plus policy routing validation. No data migration or external rollback is required.

## Findings

Implemented against the pinned LibreOffice baseline: SfxObjectShell modified/save transitions, SfxBaseModel recovery acknowledgement, and SwUndoManager save-mark behavior. Stage 0 inventory reports 14 implemented and 0 verified capabilities; unresolved semantic gaps remain explicit. The initially flaky pointer-selection E2E used fixed pixel coordinates and was repaired to derive endpoints from rendered DOM ranges; it then passed five repeated Chromium runs and the full suite. Agentplane doctor passes with one pre-existing warning about a prior DONE task commit reference and informational fallback-hook notices. No network access or material scope drift occurred. The user-provided parity plan remains an intentionally untracked reviewed artifact.
