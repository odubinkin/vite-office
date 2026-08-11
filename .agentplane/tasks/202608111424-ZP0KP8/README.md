---
id: "202608111424-ZP0KP8"
title: "Record browser-runtime parity exceptions"
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
  updated_at: "2026-08-11T14:25:09.180Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T14:32:03.508Z"
  updated_by: "REVIEWER"
  note: "Verified: non-implementable feature and upstream-test exceptions are strict, separately reported, documented, and covered at 100 percent; current Writer parity evidence remains valid."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T14:32:03.822Z"
  updated_by: "EVALUATOR"
  note: "Browser-runtime parity exceptions are explicitly auditable and cannot count as implementation coverage."
  evaluated_sha: "778c839e58b7464d2a4874f98522b5cf57150784"
  blueprint_digest: "6df790a9ded818fd4ae4fbd4d6193cfc4105809abc4063b1877d0dd374748183"
  evidence_refs:
    - ".agentplane/tasks/202608111424-ZP0KP8/README.md"
    - ".agentplane/tasks/202608111424-ZP0KP8/quality/20260811-143203822-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111424-ZP0KP8/quality/20260811-143203822-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111424-ZP0KP8/quality/20260811-143203822-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111424-ZP0KP8/blueprint/resolved-snapshot.json"
    - "778c839; npm run test:inventory:coverage; npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference; npm run check:docs; npm run typecheck"
  findings:
    - "The deterministic report exposes capability and upstream-test exceptions separately with count zero for the current Writer slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: make browser-runtime feature and test exceptions explicit, validated, and visibly reported."
events:
  -
    type: "status"
    at: "2026-08-11T14:25:09.617Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: make browser-runtime feature and test exceptions explicit, validated, and visibly reported."
  -
    type: "verify"
    at: "2026-08-11T14:32:03.508Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: non-implementable feature and upstream-test exceptions are strict, separately reported, documented, and covered at 100 percent; current Writer parity evidence remains valid."
doc_version: 3
doc_updated_at: "2026-08-11T14:32:03.568Z"
doc_updated_by: "CODER"
description: "Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation."
sections:
  Summary: |-
    Record browser-runtime parity exceptions

    Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.
  Scope: |-
    - In scope: Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.
    - Out of scope: unrelated refactors not required for "Record browser-runtime parity exceptions".
  Plan: |-
    1. Extend the parity-manifest contract so capability-level and per-test exceptions carry an explicit non-implementable disposition, browser-runtime reason classification, rationale, and approval reference.
    2. Include separately countable exception evidence in the deterministic parity report so exceptions cannot be mistaken for implemented or verified coverage.
    3. Add parser and resolution tests for valid feature and upstream-test exceptions plus invalid incomplete or misplaced exception metadata.
    4. Document the feature/test exception format and decision rules without marking existing mapped Writer capabilities as exceptions.
    5. Run tools coverage, parity inventory validation, documentation/type/lint/size checks, and targeted static checks; defer aggregate full verification to the user-approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:inventory:coverage`. Expected: parser and CLI coverage stay at 100 percent while valid feature-level and upstream-test-level non-implementable exceptions are accepted and malformed exceptions are rejected.
    2. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: current Writer mappings remain valid and the deterministic report separately shows zero approved exceptions.
    3. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass; no new file reaches the mandatory decomposition threshold.
    4. Defer `npm run verify`, static smoke, and full browser matrix under the user-approved ten-task cadence; record the residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T14:32:03.508Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: non-implementable feature and upstream-test exceptions are strict, separately reported, documented, and covered at 100 percent; current Writer parity evidence remains valid.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:32:03.028Z, excerpt_hash=sha256:ee69b82e080f499dbe46f785268a2a1e8dfc24433c409dd2ec1345820ad88ef3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111424-ZP0KP8/blueprint/resolved-snapshot.json
    - old_digest: 6df790a9ded818fd4ae4fbd4d6193cfc4105809abc4063b1877d0dd374748183
    - current_digest: 6df790a9ded818fd4ae4fbd4d6193cfc4105809abc4063b1877d0dd374748183
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111424-ZP0KP8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111424-ZP0KP8
    - diagnostic_command: agentplane task run status 202608111424-ZP0KP8
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
    Command: npm run test:inventory:coverage
    Result: pass
    Evidence: 30 test files and 74 tests passed; 100% statements (1033/1033), branches (615/615), functions (268/268), and lines (999/999).
    Scope: parity manifest parser, exception report, and inventory CLI contracts.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: pinned Writer mapping resolved 40 evidence references and reported exceptionCount 0, exceptions [], and gapCount 8.
    Scope: production validation of current authored Writer parity evidence after test relocation.

    Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: formatting, lint, both TypeScript projects, JSDoc for 122 authored files, diff, doctor, and routing passed; parity-mappings.ts is 462 lines and tests are 396. The unrelated contracts.ts remains the only size review candidate at 536 lines.
    Scope: source quality, size, repository health, and policy route.

    Skipped: npm run verify, npm run test:static, and the full browser matrix.
    Reason: user-approved cadence runs aggregate verification after every ten closed feature tasks; this task changes inventory tooling and documentation only.
    Risk: aggregate static and browser/inventory interactions remain deferred until that cadence point.
    Approval: user (persistent instruction).

    Note: the first coverage attempt exposed two uncovered exception-validation branches; focused negative tests were added before the final 100% coverage run.
id_source: "generated"
---
## Summary

Record browser-runtime parity exceptions

Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.

## Scope

- In scope: Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.
- Out of scope: unrelated refactors not required for "Record browser-runtime parity exceptions".

## Plan

1. Extend the parity-manifest contract so capability-level and per-test exceptions carry an explicit non-implementable disposition, browser-runtime reason classification, rationale, and approval reference.
2. Include separately countable exception evidence in the deterministic parity report so exceptions cannot be mistaken for implemented or verified coverage.
3. Add parser and resolution tests for valid feature and upstream-test exceptions plus invalid incomplete or misplaced exception metadata.
4. Document the feature/test exception format and decision rules without marking existing mapped Writer capabilities as exceptions.
5. Run tools coverage, parity inventory validation, documentation/type/lint/size checks, and targeted static checks; defer aggregate full verification to the user-approved ten-task cadence.

## Verify Steps

1. Run `npm run test:inventory:coverage`. Expected: parser and CLI coverage stay at 100 percent while valid feature-level and upstream-test-level non-implementable exceptions are accepted and malformed exceptions are rejected.
2. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: current Writer mappings remain valid and the deterministic report separately shows zero approved exceptions.
3. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass; no new file reaches the mandatory decomposition threshold.
4. Defer `npm run verify`, static smoke, and full browser matrix under the user-approved ten-task cadence; record the residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T14:32:03.508Z — VERIFY — ok

By: REVIEWER

Note: Verified: non-implementable feature and upstream-test exceptions are strict, separately reported, documented, and covered at 100 percent; current Writer parity evidence remains valid.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:32:03.028Z, excerpt_hash=sha256:ee69b82e080f499dbe46f785268a2a1e8dfc24433c409dd2ec1345820ad88ef3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111424-ZP0KP8/blueprint/resolved-snapshot.json
- old_digest: 6df790a9ded818fd4ae4fbd4d6193cfc4105809abc4063b1877d0dd374748183
- current_digest: 6df790a9ded818fd4ae4fbd4d6193cfc4105809abc4063b1877d0dd374748183
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111424-ZP0KP8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111424-ZP0KP8
- diagnostic_command: agentplane task run status 202608111424-ZP0KP8
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

Command: npm run test:inventory:coverage
Result: pass
Evidence: 30 test files and 74 tests passed; 100% statements (1033/1033), branches (615/615), functions (268/268), and lines (999/999).
Scope: parity manifest parser, exception report, and inventory CLI contracts.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: pinned Writer mapping resolved 40 evidence references and reported exceptionCount 0, exceptions [], and gapCount 8.
Scope: production validation of current authored Writer parity evidence after test relocation.

Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: formatting, lint, both TypeScript projects, JSDoc for 122 authored files, diff, doctor, and routing passed; parity-mappings.ts is 462 lines and tests are 396. The unrelated contracts.ts remains the only size review candidate at 536 lines.
Scope: source quality, size, repository health, and policy route.

Skipped: npm run verify, npm run test:static, and the full browser matrix.
Reason: user-approved cadence runs aggregate verification after every ten closed feature tasks; this task changes inventory tooling and documentation only.
Risk: aggregate static and browser/inventory interactions remain deferred until that cadence point.
Approval: user (persistent instruction).

Note: the first coverage attempt exposed two uncovered exception-validation branches; focused negative tests were added before the final 100% coverage run.
