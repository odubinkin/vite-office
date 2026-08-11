---
id: "202608111403-307M4S"
title: "Create verifiable Writer command parity mappings"
status: "DOING"
priority: "high"
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
  updated_at: "2026-08-11T14:03:33.178Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T14:18:38.744Z"
  updated_by: "REVIEWER"
  note: "Verified the Writer mapping contract: every recorded upstream/local path and marker resolves at the pinned baseline; explicit gaps and exception evidence prevent unsupported parity claims."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T14:18:39.059Z"
  updated_by: "EVALUATOR"
  note: "Atomic Writer command mappings are machine-validated against pinned LibreOffice evidence and local tests/docs."
  evaluated_sha: "670254a4dee1d2fc8fe74230506dd873e89ff925"
  blueprint_digest: "d5b0ea6eb22900f3ee75a153b6e274d27f80c6b33e362becae66e3206b84d9cd"
  evidence_refs:
    - ".agentplane/tasks/202608111403-307M4S/README.md"
    - ".agentplane/tasks/202608111403-307M4S/quality/20260811-141839059-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111403-307M4S/quality/20260811-141839059-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111403-307M4S/quality/20260811-141839059-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111403-307M4S/blueprint/resolved-snapshot.json"
    - "670254a; npm run inventory:parity; npm run test:inventory:coverage; npm run test:coverage --workspace @vite-office/office"
  findings:
    - "The manifest reports eight visible gaps and supports approved per-capability or per-test exceptions; no record is falsely marked verified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: add a machine-validated atomic Writer mapping surface tied to the pinned baseline and explicitly record unmatched browser parity gaps."
events:
  -
    type: "status"
    at: "2026-08-11T14:03:40.816Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: add a machine-validated atomic Writer mapping surface tied to the pinned baseline and explicitly record unmatched browser parity gaps."
  -
    type: "verify"
    at: "2026-08-11T14:18:38.744Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified the Writer mapping contract: every recorded upstream/local path and marker resolves at the pinned baseline; explicit gaps and exception evidence prevent unsupported parity claims."
doc_version: 3
doc_updated_at: "2026-08-11T14:18:38.802Z"
doc_updated_by: "CODER"
description: "Introduce a machine-validated atomic mapping manifest for implemented Writer commands, linking pinned LibreOffice sources, upstream tests and docs to local implementation, executable tests, documentation, and explicit gaps without claiming full parity."
sections:
  Summary: |-
    Create verifiable Writer command parity mappings

    Introduce a machine-validated atomic mapping manifest for implemented Writer commands, linking pinned LibreOffice sources, upstream tests and docs to local implementation, executable tests, documentation, and explicit gaps without claiming full parity.
  Scope: |-
    - In scope: Introduce a machine-validated atomic mapping manifest for implemented Writer commands, linking pinned LibreOffice sources, upstream tests and docs to local implementation, executable tests, documentation, and explicit gaps without claiming full parity.
    - Out of scope: unrelated refactors not required for "Create verifiable Writer command parity mappings".
  Plan: "1. Define a compact, versioned parity-mapping schema and deterministic validator/CLI that verifies pinned baseline identity and all referenced upstream/local paths. 2. Add an authored atomic Writer command mapping manifest for the implemented menu, history, selection/copy, and View chrome slices, using precise upstream source/test/doc references and explicit browser gaps. 3. Update the parity matrix and program documentation to make this mapping surface authoritative for these rows without claiming full LibreOffice equivalence. 4. Add exhaustive validator tests and run the focused mapping command plus required fast checks."
  Verify Steps: "1. Run focused unit tests for the parity mapping validator and inventory tool coverage. Expected: malformed mappings, duplicate IDs, baseline mismatches, missing upstream/local paths, and invalid status/evidence combinations fail; valid deterministic Writer mappings pass with 100 percent inventory-tool coverage. 2. Run the mapping CLI against docs/program/libreoffice-baseline.json, vendor/libreoffice-reference, and the Writer mapping manifest. Expected: every recorded pinned source/test path and local implementation/test/doc path resolves, with a report that preserves explicit gaps. 3. Run format, lint, TypeScript, JSDoc, file-size, application coverage, diff, doctor, and policy routing checks. Expected: all pass; application coverage remains 100 percent. 4. Defer aggregate verify, static smoke, and full inventory validation under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T14:18:38.744Z — VERIFY — ok

    By: REVIEWER

    Note: Verified the Writer mapping contract: every recorded upstream/local path and marker resolves at the pinned baseline; explicit gaps and exception evidence prevent unsupported parity claims.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:18:30.407Z, excerpt_hash=sha256:0f3d95967b1d7b581a2161273ea52e4448e3ef75f4e9bab17d5c6152a7171398

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111403-307M4S/blueprint/resolved-snapshot.json
    - old_digest: d5b0ea6eb22900f3ee75a153b6e274d27f80c6b33e362becae66e3206b84d9cd
    - current_digest: d5b0ea6eb22900f3ee75a153b6e274d27f80c6b33e362becae66e3206b84d9cd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111403-307M4S

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111403-307M4S
    - diagnostic_command: agentplane task run status 202608111403-307M4S
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
    Implementation commit 670254a introduces a versioned Writer parity mapping manifest, strict parser and evidence validator, read-only inventory:parity CLI, and dedicated tests. Four bounded Writer slices reference pinned source, Cppunit test cases, help paths, local implementation/test/docs, and eight explicit unresolved browser gaps. The schema supports whole-capability and individual-test exception-approved records, each requiring approvedBy and rationale.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass.
    Evidence: baseline commit 9bc445578031fecf56086729d8e4940c77e14d65 matched; all 40 recorded evidence references resolved; report preserves gapCount 8.
    Scope: Writer command upstream-to-local traceability.

    Command: npm run test:coverage --workspace @vite-office/office && npm run test:inventory:coverage && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass.
    Evidence: 55 office tests passed with 100 percent statements, branches, functions, and lines; inventory coverage completed under its configured 100 percent gates; formatting, lint, TypeScript, JSDoc, file-size, diff, doctor, and routing passed. File-size review retains pre-existing candidates: App.test.tsx (565 lines), WriterWorkbench.tsx (522 lines), and contracts.ts (536 lines).
    Scope: application, mapping tooling, and repository quality.

    Skipped: npm run verify and npm run test:static.
    Reason: the user approved a full aggregate checkpoint after every ten closed feature tasks; the prior Select All task was that checkpoint.
    Risk: static asset and aggregate combined-suite regressions were not rerun for this documentation and tooling increment.
    Approval: user.
id_source: "generated"
---
## Summary

Create verifiable Writer command parity mappings

Introduce a machine-validated atomic mapping manifest for implemented Writer commands, linking pinned LibreOffice sources, upstream tests and docs to local implementation, executable tests, documentation, and explicit gaps without claiming full parity.

## Scope

- In scope: Introduce a machine-validated atomic mapping manifest for implemented Writer commands, linking pinned LibreOffice sources, upstream tests and docs to local implementation, executable tests, documentation, and explicit gaps without claiming full parity.
- Out of scope: unrelated refactors not required for "Create verifiable Writer command parity mappings".

## Plan

1. Define a compact, versioned parity-mapping schema and deterministic validator/CLI that verifies pinned baseline identity and all referenced upstream/local paths. 2. Add an authored atomic Writer command mapping manifest for the implemented menu, history, selection/copy, and View chrome slices, using precise upstream source/test/doc references and explicit browser gaps. 3. Update the parity matrix and program documentation to make this mapping surface authoritative for these rows without claiming full LibreOffice equivalence. 4. Add exhaustive validator tests and run the focused mapping command plus required fast checks.

## Verify Steps

1. Run focused unit tests for the parity mapping validator and inventory tool coverage. Expected: malformed mappings, duplicate IDs, baseline mismatches, missing upstream/local paths, and invalid status/evidence combinations fail; valid deterministic Writer mappings pass with 100 percent inventory-tool coverage. 2. Run the mapping CLI against docs/program/libreoffice-baseline.json, vendor/libreoffice-reference, and the Writer mapping manifest. Expected: every recorded pinned source/test path and local implementation/test/doc path resolves, with a report that preserves explicit gaps. 3. Run format, lint, TypeScript, JSDoc, file-size, application coverage, diff, doctor, and policy routing checks. Expected: all pass; application coverage remains 100 percent. 4. Defer aggregate verify, static smoke, and full inventory validation under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T14:18:38.744Z — VERIFY — ok

By: REVIEWER

Note: Verified the Writer mapping contract: every recorded upstream/local path and marker resolves at the pinned baseline; explicit gaps and exception evidence prevent unsupported parity claims.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:18:30.407Z, excerpt_hash=sha256:0f3d95967b1d7b581a2161273ea52e4448e3ef75f4e9bab17d5c6152a7171398

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111403-307M4S/blueprint/resolved-snapshot.json
- old_digest: d5b0ea6eb22900f3ee75a153b6e274d27f80c6b33e362becae66e3206b84d9cd
- current_digest: d5b0ea6eb22900f3ee75a153b6e274d27f80c6b33e362becae66e3206b84d9cd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111403-307M4S

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111403-307M4S
- diagnostic_command: agentplane task run status 202608111403-307M4S
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

Implementation commit 670254a introduces a versioned Writer parity mapping manifest, strict parser and evidence validator, read-only inventory:parity CLI, and dedicated tests. Four bounded Writer slices reference pinned source, Cppunit test cases, help paths, local implementation/test/docs, and eight explicit unresolved browser gaps. The schema supports whole-capability and individual-test exception-approved records, each requiring approvedBy and rationale.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass.
Evidence: baseline commit 9bc445578031fecf56086729d8e4940c77e14d65 matched; all 40 recorded evidence references resolved; report preserves gapCount 8.
Scope: Writer command upstream-to-local traceability.

Command: npm run test:coverage --workspace @vite-office/office && npm run test:inventory:coverage && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass.
Evidence: 55 office tests passed with 100 percent statements, branches, functions, and lines; inventory coverage completed under its configured 100 percent gates; formatting, lint, TypeScript, JSDoc, file-size, diff, doctor, and routing passed. File-size review retains pre-existing candidates: App.test.tsx (565 lines), WriterWorkbench.tsx (522 lines), and contracts.ts (536 lines).
Scope: application, mapping tooling, and repository quality.

Skipped: npm run verify and npm run test:static.
Reason: the user approved a full aggregate checkpoint after every ten closed feature tasks; the prior Select All task was that checkpoint.
Risk: static asset and aggregate combined-suite regressions were not rerun for this documentation and tooling increment.
Approval: user.
