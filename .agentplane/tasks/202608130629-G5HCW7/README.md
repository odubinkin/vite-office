---
id: "202608130629-G5HCW7"
title: "Align Writer menu and toolbar modules with LibreOffice uiconfig paths"
status: "DOING"
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
  updated_at: "2026-08-13T06:29:45.357Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T06:35:48.449Z"
  updated_by: "CODER"
  note: "Verified Writer uiconfig relocation with full unit coverage, focused File menu Chromium E2E, parity inventory, and static quality gates."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T06:35:47.383Z"
  updated_by: "EVALUATOR"
  note: "Writer menu and toolbar ownership now matches concrete pinned uiconfig paths without changing established browser behavior."
  evaluated_sha: "022a220b157046a2f89fcdcae13aad4d27e1863c"
  blueprint_digest: "2dc923055426684e35d61ec53a5f57cd7569087895ec2e846315752aa5b40d4b"
  evidence_refs:
    - ".agentplane/tasks/202608130629-G5HCW7/README.md"
    - ".agentplane/tasks/202608130629-G5HCW7/quality/20260813-063547383-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130629-G5HCW7/quality/20260813-063547383-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130629-G5HCW7/quality/20260813-063547383-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130629-G5HCW7/blueprint/resolved-snapshot.json"
    - "83c054f and 022a220 migrations; unit coverage; focused File menu Chromium E2E; parity inventory; static gates"
  findings:
    - "No correctness finding: source-tree enforcement blocks restored generic Writer menu and toolbar paths, and the moved parity evidence resolves."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Moving the remaining Writer menu and standard-toolbar controls into their concrete uiconfig ownership paths while preserving current command behavior and traceability."
events:
  -
    type: "status"
    at: "2026-08-13T06:29:46.523Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Moving the remaining Writer menu and standard-toolbar controls into their concrete uiconfig ownership paths while preserving current command behavior and traceability."
  -
    type: "verify"
    at: "2026-08-13T06:35:48.449Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer uiconfig relocation with full unit coverage, focused File menu Chromium E2E, parity inventory, and static quality gates."
doc_version: 3
doc_updated_at: "2026-08-13T06:35:48.562Z"
doc_updated_by: "CODER"
description: "Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests."
sections:
  Summary: |-
    Align Writer menu and toolbar modules with LibreOffice uiconfig paths

    Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.
  Scope: |-
    - In scope: Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.
    - Out of scope: unrelated refactors not required for "Align Writer menu and toolbar modules with LibreOffice uiconfig paths".
  Plan: "1. Locate the remaining implemented Writer menu and toolbar React modules and map each to its pinned sw/uiconfig/swriter menubar or toolbar counterpart. 2. Move the menu control and its focused tests into sw/uiconfig/swriter/menubar, preserving public behavior. 3. Move the standard-toolbar control into sw/uiconfig/swriter/toolbar, preserving command placement and imports. 4. Update view imports, source-tree contract, parity mappings, and provenance documentation to remove stale generic UI module references. 5. Run coverage, focused menu and toolbar E2E or component tests as needed, then static/parity quality gates; defer full suite under the approved cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after the module relocation. 2. Run npm run test:e2e -- --grep File menu. Expected: the production Writer menu continues to open and invoke the existing command placement. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: all moved local paths and markers resolve at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    Command: npm run test:coverage
    Result: pass
    Evidence: 26 test files and 75 tests passed; statements, branches, functions, and lines are each 100%.
    Scope: relocated Writer menu and toolbar modules plus existing component behavior.

    Command: npm run test:e2e -- --grep File menu
    Result: pass
    Evidence: one production Chromium File menu scenario passed after its existing title was aligned with the focused verification filter.
    Scope: built Writer menu opening and command placement.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: all moved uiconfig paths and markers resolved at baseline 9bc445578031fecf56086729d8e4940c77e14d65; exceptionCount is 0.
    Scope: pinned implementation, test, and documentation evidence.

    Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: formatting, lint, types, 142-file JSDoc validation, source-tree/size checks, doctor, and routing passed.
    Scope: repository quality gates.

    Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
    Reason: user-approved full-suite cadence is every ten completed tasks.
    Risk: broader integration/browser regressions are deferred until that cadence.
    Approval: user instruction.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T06:35:48.449Z — VERIFY — ok

    By: CODER

    Note: Verified Writer uiconfig relocation with full unit coverage, focused File menu Chromium E2E, parity inventory, and static quality gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:35:46.831Z, excerpt_hash=sha256:dedc1e072c44a2a182afe25b86b645f675e95169afec69e41b305121f94c47c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130629-G5HCW7/blueprint/resolved-snapshot.json
    - old_digest: 2dc923055426684e35d61ec53a5f57cd7569087895ec2e846315752aa5b40d4b
    - current_digest: 2dc923055426684e35d61ec53a5f57cd7569087895ec2e846315752aa5b40d4b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130629-G5HCW7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202608130629-G5HCW7 -m 🧩 G5HCW7 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Verification note: npm run test:e2e -- --grep File menu initially returned No tests found because the existing foundation scenario asserted the File menu locator but its title did not contain that focused filter. The task keeps the same E2E behavior and updates only the scenario title so the declared focused command executes it."
id_source: "generated"
---
## Summary

Align Writer menu and toolbar modules with LibreOffice uiconfig paths

Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.

## Scope

- In scope: Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.
- Out of scope: unrelated refactors not required for "Align Writer menu and toolbar modules with LibreOffice uiconfig paths".

## Plan

1. Locate the remaining implemented Writer menu and toolbar React modules and map each to its pinned sw/uiconfig/swriter menubar or toolbar counterpart. 2. Move the menu control and its focused tests into sw/uiconfig/swriter/menubar, preserving public behavior. 3. Move the standard-toolbar control into sw/uiconfig/swriter/toolbar, preserving command placement and imports. 4. Update view imports, source-tree contract, parity mappings, and provenance documentation to remove stale generic UI module references. 5. Run coverage, focused menu and toolbar E2E or component tests as needed, then static/parity quality gates; defer full suite under the approved cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after the module relocation. 2. Run npm run test:e2e -- --grep File menu. Expected: the production Writer menu continues to open and invoke the existing command placement. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: all moved local paths and markers resolve at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

Command: npm run test:coverage
Result: pass
Evidence: 26 test files and 75 tests passed; statements, branches, functions, and lines are each 100%.
Scope: relocated Writer menu and toolbar modules plus existing component behavior.

Command: npm run test:e2e -- --grep File menu
Result: pass
Evidence: one production Chromium File menu scenario passed after its existing title was aligned with the focused verification filter.
Scope: built Writer menu opening and command placement.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: all moved uiconfig paths and markers resolved at baseline 9bc445578031fecf56086729d8e4940c77e14d65; exceptionCount is 0.
Scope: pinned implementation, test, and documentation evidence.

Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: formatting, lint, types, 142-file JSDoc validation, source-tree/size checks, doctor, and routing passed.
Scope: repository quality gates.

Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
Reason: user-approved full-suite cadence is every ten completed tasks.
Risk: broader integration/browser regressions are deferred until that cadence.
Approval: user instruction.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T06:35:48.449Z — VERIFY — ok

By: CODER

Note: Verified Writer uiconfig relocation with full unit coverage, focused File menu Chromium E2E, parity inventory, and static quality gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:35:46.831Z, excerpt_hash=sha256:dedc1e072c44a2a182afe25b86b645f675e95169afec69e41b305121f94c47c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130629-G5HCW7/blueprint/resolved-snapshot.json
- old_digest: 2dc923055426684e35d61ec53a5f57cd7569087895ec2e846315752aa5b40d4b
- current_digest: 2dc923055426684e35d61ec53a5f57cd7569087895ec2e846315752aa5b40d4b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130629-G5HCW7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202608130629-G5HCW7 -m 🧩 G5HCW7 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Verification note: npm run test:e2e -- --grep File menu initially returned No tests found because the existing foundation scenario asserted the File menu locator but its title did not contain that focused filter. The task keeps the same E2E behavior and updates only the scenario title so the declared focused command executes it.
