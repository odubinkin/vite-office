---
id: "202611210657-S39THP"
title: "Align Calc ODS workbook calculation settings"
result_summary: "Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport."
status: "DONE"
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
  - "Run scoped Calc ODS settings, epoch, formula/query and Worker suites; office typecheck, scope lint/format, dependencies, provenance, routing and doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T06:57:46.918Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T07:05:33.674Z"
  updated_by: "CODER"
  note: "Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T07:05:19.509Z"
  updated_by: "EVALUATOR"
  note: "The Calc ODS calculation fields and defaults use the pinned source conversions and survive Worker and package round trips."
  evaluated_sha: "2a527a9343e859a2303a02e11a420ceeb2e5670d"
  blueprint_digest: "6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9"
  evidence_refs:
    - ".agentplane/tasks/202611210657-S39THP/README.md"
    - ".agentplane/tasks/202611210657-S39THP/quality/20261121-070519509-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210657-S39THP/quality/20261121-070519509-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210657-S39THP/quality/20261121-070519509-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210657-S39THP/blueprint/resolved-snapshot.json"
    - "output/playwright/S39THP/calc.log"
    - "output/playwright/S39THP/settings-final.log"
    - "output/playwright/S39THP/types-final.log"
    - "output/playwright/S39THP/provenance.log"
    - "output/playwright/S39THP/doctor.log"
    - "node .agentplane/policy/check-routing.mjs passed"
  findings:
    - "Verified absent settings, native search mode selection and wildcard calculation, formatter epoch/year, iteration narrowing, and backward-compatible worker records."
commit:
  hash: "2a527a9343e859a2303a02e11a420ceeb2e5670d"
  message: "🧩 S39THP code: align Calc ODS workbook calculation settings"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-21T06:57:51.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T07:05:12.021Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc ODS native calculation settings, formatter, supported formula behavior and Worker round trips."
  -
    type: "verify"
    at: "2026-11-21T07:05:33.674Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport."
  -
    type: "status"
    at: "2026-11-21T07:05:33.767Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-21T07:05:33.767Z"
doc_updated_by: "CODER"
description: "Port native ODS document calculation defaults, search modes, precision, labels, two-digit year and iteration settings through import, export and Worker transport."
sections:
  Summary: "Align Calc import, export and Worker transfer of workbook calculation settings with LibreOffice 26.8.0.2."
  Scope: "Calc XML body and settings contexts, XML tokens, native options and conversions, default-aware export, backward-compatible Worker graph, regression coverage and pinned-source documentation. Preserve the current formula execution slice and browser storage workflow."
  Plan: "Port the source defaults and child contexts to the native document options, including the absent-settings path. Implement source search mode precedence and conditional serialization of options, null date and iteration. Carry the represented native properties through the Worker graph and exercise a full ODS round trip."
  Verify Steps: "Run scoped Calc ODS calculation settings, typed values, XML boundary, epoch, query/formula options and Worker suites. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and git diff checks."
  Verification: |-
    Pending implementation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T07:05:12.021Z — VERIFY — ok

    By: CODER

    Note: Verified Calc ODS native calculation settings, formatter, supported formula behavior and Worker round trips.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T06:57:51.521Z, excerpt_hash=sha256:e04f41988f6ac08e18c61324964ea3ca772fb153cb975073231e5822a3f1351d

    Details:

    Implementation 2a527a9343e8. Scoped npm run test:calc for all Calc XML filter and Worker XML files, epoch and original XLSX/ODS fixture leg, native options and query/conditional formulas: 139/140 in 33 files on the first run. The one initial assertion wrongly assumed native regex execution was inside the represented core; the test now checks native query mode selection, and the wildcard round-trip still checks actual COUNTIF results. Scoped settings rerun passed all 4/4, giving 140 passing distinct scenarios across the two runs with identical production code. The original tdf79998 package retains enabled iteration, and the epoch regression and original nondefault date fixture still pass. Office typecheck with --singleThreaded --checkers 1 --incremental, scoped ESLint/Prettier, check:dependencies, check:source-provenance, routing, doctor and git diff --check passed. Doctor reported the existing managed hook shim warning. ODS and Worker preserve precision and iteration options, but regex execution, complete precision-as-shown recalculation and the native iterative formula scheduler remain outside the current slice. Full test runs remain on the ten-task cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210657-S39THP/blueprint/resolved-snapshot.json
    - old_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
    - current_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210657-S39THP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210657-S39THP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-21T07:05:33.674Z — VERIFY — ok

    By: CODER

    Note: Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T07:05:12.073Z, excerpt_hash=sha256:e04f41988f6ac08e18c61324964ea3ca772fb153cb975073231e5822a3f1351d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210657-S39THP/blueprint/resolved-snapshot.json
    - old_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
    - current_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210657-S39THP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611210657-S39THP --result verified-202611210657-S39THP --commit 6141c70498b6b8eac837c11a7aadb5fca488ab9c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commits."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Calc import, export and Worker transfer of workbook calculation settings with LibreOffice 26.8.0.2.

## Scope

Calc XML body and settings contexts, XML tokens, native options and conversions, default-aware export, backward-compatible Worker graph, regression coverage and pinned-source documentation. Preserve the current formula execution slice and browser storage workflow.

## Plan

Port the source defaults and child contexts to the native document options, including the absent-settings path. Implement source search mode precedence and conditional serialization of options, null date and iteration. Carry the represented native properties through the Worker graph and exercise a full ODS round trip.

## Verify Steps

Run scoped Calc ODS calculation settings, typed values, XML boundary, epoch, query/formula options and Worker suites. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T07:05:12.021Z — VERIFY — ok

By: CODER

Note: Verified Calc ODS native calculation settings, formatter, supported formula behavior and Worker round trips.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T06:57:51.521Z, excerpt_hash=sha256:e04f41988f6ac08e18c61324964ea3ca772fb153cb975073231e5822a3f1351d

Details:

Implementation 2a527a9343e8. Scoped npm run test:calc for all Calc XML filter and Worker XML files, epoch and original XLSX/ODS fixture leg, native options and query/conditional formulas: 139/140 in 33 files on the first run. The one initial assertion wrongly assumed native regex execution was inside the represented core; the test now checks native query mode selection, and the wildcard round-trip still checks actual COUNTIF results. Scoped settings rerun passed all 4/4, giving 140 passing distinct scenarios across the two runs with identical production code. The original tdf79998 package retains enabled iteration, and the epoch regression and original nondefault date fixture still pass. Office typecheck with --singleThreaded --checkers 1 --incremental, scoped ESLint/Prettier, check:dependencies, check:source-provenance, routing, doctor and git diff --check passed. Doctor reported the existing managed hook shim warning. ODS and Worker preserve precision and iteration options, but regex execution, complete precision-as-shown recalculation and the native iterative formula scheduler remain outside the current slice. Full test runs remain on the ten-task cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210657-S39THP/blueprint/resolved-snapshot.json
- old_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
- current_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210657-S39THP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210657-S39THP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-21T07:05:33.674Z — VERIFY — ok

By: CODER

Note: Verified Calc ODS calculation defaults and overrides, native formatter and criteria behavior, and backward-compatible Worker transport.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T07:05:12.073Z, excerpt_hash=sha256:e04f41988f6ac08e18c61324964ea3ca772fb153cb975073231e5822a3f1351d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210657-S39THP/blueprint/resolved-snapshot.json
- old_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
- current_digest: 6f2e69f7493758f82752c1b01efc4d00209cdb8df35f0d878ef40493a6c893f9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210657-S39THP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611210657-S39THP --result verified-202611210657-S39THP --commit 6141c70498b6b8eac837c11a7aadb5fca488ab9c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commits.

## Findings

None at intake.
