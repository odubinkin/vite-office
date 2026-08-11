---
id: "202608111419-38X7QZ"
title: "Decompose Writer workbench and application tests"
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
  updated_at: "2026-08-11T14:19:23.084Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T14:24:17.242Z"
  updated_by: "REVIEWER"
  note: "Verified: extraction preserves Writer menu and clipboard behavior; fast checks, 100 percent coverage, targeted production E2E, documentation, size, diff, doctor, and routing all pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T14:24:17.550Z"
  updated_by: "EVALUATOR"
  note: "Focused browser commands and menu tests were extracted without behavior drift."
  evaluated_sha: "923b5027965f0d8f3ffbf700a396aea94c9e0b20"
  blueprint_digest: "f9c547596363985f3fb1fc99b5f5e85142665abd0f45607cf75fc1ada05503fd"
  evidence_refs:
    - ".agentplane/tasks/202608111419-38X7QZ/README.md"
    - ".agentplane/tasks/202608111419-38X7QZ/quality/20260811-142417550-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111419-38X7QZ/quality/20260811-142417550-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111419-38X7QZ/quality/20260811-142417550-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111419-38X7QZ/blueprint/resolved-snapshot.json"
    - "923b502; npm run test:coverage --workspace @vite-office/office; npm run test:e2e; npm run check:docs; npm run check:file-size; ap doctor; node .agentplane/policy/check-routing.mjs"
  findings:
    - "WriterWorkbench.tsx and App.test.tsx now fall below the repository review threshold."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: extract focused Writer browser commands and tests while preserving exact UI behavior and full coverage."
events:
  -
    type: "status"
    at: "2026-08-11T14:19:28.100Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract focused Writer browser commands and tests while preserving exact UI behavior and full coverage."
  -
    type: "verify"
    at: "2026-08-11T14:24:17.242Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: extraction preserves Writer menu and clipboard behavior; fast checks, 100 percent coverage, targeted production E2E, documentation, size, diff, doctor, and routing all pass."
doc_version: 3
doc_updated_at: "2026-08-11T14:24:17.299Z"
doc_updated_by: "CODER"
description: "Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage."
sections:
  Summary: |-
    Decompose Writer workbench and application tests

    Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.
  Scope: |-
    - In scope: Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.
    - Out of scope: unrelated refactors not required for "Decompose Writer workbench and application tests".
  Plan: "1. Inspect workbench handler seams and current App test groups. 2. Extract browser download and clipboard handlers into a focused documented hook, retaining all behavior and injected boundaries. 3. Move menu/clipboard UI assertions into a focused test module and keep App.test.tsx as application-shell coverage. 4. Validate source size and all existing user-visible Writer flows."
  Verify Steps: "1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage; WriterWorkbench.tsx and App.test.tsx are no longer file-size review candidates. 2. Run targeted production Playwright coverage. Expected: existing Writer menu, keyboard, storage, selection, Copy, and visibility flows remain intact after extraction. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer aggregate verify, static smoke, LibreOffice inventory, and the full browser matrix under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T14:24:17.242Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: extraction preserves Writer menu and clipboard behavior; fast checks, 100 percent coverage, targeted production E2E, documentation, size, diff, doctor, and routing all pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:24:16.762Z, excerpt_hash=sha256:c4c72651e88734f6edf8a22a6a2816cbb15e5cf5c75e9976583458b0286b2d5e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111419-38X7QZ/blueprint/resolved-snapshot.json
    - old_digest: f9c547596363985f3fb1fc99b5f5e85142665abd0f45607cf75fc1ada05503fd
    - current_digest: f9c547596363985f3fb1fc99b5f5e85142665abd0f45607cf75fc1ada05503fd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111419-38X7QZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111419-38X7QZ
    - diagnostic_command: agentplane task run status 202608111419-38X7QZ
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
    Command: npm run lint && npm run typecheck && npm run test:coverage --workspace @vite-office/office
    Result: pass
    Evidence: ESLint and both TypeScript projects passed; Vitest ran 55 tests with 100% statements, branches, functions, and lines.
    Scope: Writer workbench decomposition, focused menu tests, and browser command hook.

    Command: npm run test:e2e
    Result: pass
    Evidence: production build completed and Playwright foundation flow passed (1/1).
    Scope: visible Writer workspace and keyboard suite-selection behavior.

    Command: npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: 122 authored files satisfy JSDoc; WriterWorkbench.tsx is 480 lines and App.test.tsx is 425; only unrelated contracts.ts (536) remains a review candidate; diff and routing passed; doctor has no errors.
    Scope: documentation, file-size, repository health, and policy route.

    Skipped: npm run verify, npm run test:static, npm run test:inventory:coverage, and the aggregate inventory/browser matrix.
    Reason: user-approved cadence runs full verification after every ten closed feature tasks.
    Risk: aggregate static and inventory regressions are deferred until that cadence point.
    Approval: user (persistent instruction).

    Note: an initial workspace-scoped e2e command and obsolete jsdoc script name were corrected before execution; neither changed project files.
id_source: "generated"
---
## Summary

Decompose Writer workbench and application tests

Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.

## Scope

- In scope: Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.
- Out of scope: unrelated refactors not required for "Decompose Writer workbench and application tests".

## Plan

1. Inspect workbench handler seams and current App test groups. 2. Extract browser download and clipboard handlers into a focused documented hook, retaining all behavior and injected boundaries. 3. Move menu/clipboard UI assertions into a focused test module and keep App.test.tsx as application-shell coverage. 4. Validate source size and all existing user-visible Writer flows.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage; WriterWorkbench.tsx and App.test.tsx are no longer file-size review candidates. 2. Run targeted production Playwright coverage. Expected: existing Writer menu, keyboard, storage, selection, Copy, and visibility flows remain intact after extraction. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer aggregate verify, static smoke, LibreOffice inventory, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T14:24:17.242Z — VERIFY — ok

By: REVIEWER

Note: Verified: extraction preserves Writer menu and clipboard behavior; fast checks, 100 percent coverage, targeted production E2E, documentation, size, diff, doctor, and routing all pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:24:16.762Z, excerpt_hash=sha256:c4c72651e88734f6edf8a22a6a2816cbb15e5cf5c75e9976583458b0286b2d5e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111419-38X7QZ/blueprint/resolved-snapshot.json
- old_digest: f9c547596363985f3fb1fc99b5f5e85142665abd0f45607cf75fc1ada05503fd
- current_digest: f9c547596363985f3fb1fc99b5f5e85142665abd0f45607cf75fc1ada05503fd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111419-38X7QZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111419-38X7QZ
- diagnostic_command: agentplane task run status 202608111419-38X7QZ
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

Command: npm run lint && npm run typecheck && npm run test:coverage --workspace @vite-office/office
Result: pass
Evidence: ESLint and both TypeScript projects passed; Vitest ran 55 tests with 100% statements, branches, functions, and lines.
Scope: Writer workbench decomposition, focused menu tests, and browser command hook.

Command: npm run test:e2e
Result: pass
Evidence: production build completed and Playwright foundation flow passed (1/1).
Scope: visible Writer workspace and keyboard suite-selection behavior.

Command: npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: 122 authored files satisfy JSDoc; WriterWorkbench.tsx is 480 lines and App.test.tsx is 425; only unrelated contracts.ts (536) remains a review candidate; diff and routing passed; doctor has no errors.
Scope: documentation, file-size, repository health, and policy route.

Skipped: npm run verify, npm run test:static, npm run test:inventory:coverage, and the aggregate inventory/browser matrix.
Reason: user-approved cadence runs full verification after every ten closed feature tasks.
Risk: aggregate static and inventory regressions are deferred until that cadence point.
Approval: user (persistent instruction).

Note: an initial workspace-scoped e2e command and obsolete jsdoc script name were corrected before execution; neither changed project files.
