---
id: "202611211719-8PK0GM"
title: "Import legacy Calc ODS style-map conditional formats"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:19:36.743Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T17:32:35.735Z"
  updated_by: "CODER"
  note: "Verified legacy conditional style maps, native grammar and sheet precedence through Calc, Worker and ODS."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T17:32:37.201Z"
  updated_by: "EVALUATOR"
  note: "The scoped legacy ODS import reuses native condition owners and preserves deferred compilation and extension priority."
  evaluated_sha: "ca23652dcfc67d9caa35ea4ce9ffb68f9fcd78a2"
  blueprint_digest: "7f3dad1e66ca30e562c0cc9825fe45f11d5e581f64e99136681a212772b04a24"
  evidence_refs:
    - ".agentplane/tasks/202611211719-8PK0GM/README.md"
    - ".agentplane/tasks/202611211719-8PK0GM/quality/20261121-173237201-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211719-8PK0GM/quality/20261121-173237201-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211719-8PK0GM/quality/20261121-173237201-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211719-8PK0GM/blueprint/resolved-snapshot.json"
    - "output/playwright/8PK0GM/calc.log"
    - "output/playwright/8PK0GM/recheck-final.log"
    - "output/playwright/8PK0GM/types-final.log"
    - "output/playwright/8PK0GM/provenance.log"
  findings:
    - "Ordered rules keep the original source address and join equal ranges. The regression covers both sheet-ownership and empty-extension behavior."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: import legacy ODS conditional style maps and verify native evaluation, Worker transfer and extended ODS export."
events:
  -
    type: "status"
    at: "2026-11-21T17:19:42.569Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: import legacy ODS conditional style maps and verify native evaluation, Worker transfer and extended ODS export."
  -
    type: "verify"
    at: "2026-11-21T17:32:35.735Z"
    author: "CODER"
    state: "ok"
    note: "Verified legacy conditional style maps, native grammar and sheet precedence through Calc, Worker and ODS."
doc_version: 3
doc_updated_at: "2026-11-21T17:32:35.840Z"
doc_updated_by: "CODER"
description: "Port LibreOffice automatic cell-style conditional maps, pre-compilation range merging, source anchoring and precedence of extended conditional formats. Verify native Calc evaluation, Worker transport and ODS round-trip."
sections:
  Summary: "Import legacy ODF conditional style maps into the Calc conditional format model."
  Scope: "Port the original XML condition parser and automatic cell-style application, including rule order, range joining, formula grammar and source positions, sheet ownership, and precedence of the extended element. Validate the existing Worker and default extended ODS export paths. Record source behavior that appears anomalous."
  Plan: "Read the pinned XMLConverter, xmlstyli, xmlcondformat and conditio owners. Collect legacy maps in the cell-style context and attach their ranges in style application order. Compile the surviving formats after sheet and range names exist. Verify evaluation and package and Worker reopening."
  Verify Steps: "Run scoped Calc ODS, conditional core, and Worker tests. Cover ordered maps, merged disjoint ranges, relative formula and namespace anchors, multiple sheets and precedence of an empty extended element. Exercise export and reimport through the default extended ODS path. Run office typecheck, scoped formatting and lint, dependency and provenance checks, routing, doctor, and git whitespace checks."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T17:32:35.735Z — VERIFY — ok

    By: CODER

    Note: Verified legacy conditional style maps, native grammar and sheet precedence through Calc, Worker and ODS.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:19:42.569Z, excerpt_hash=sha256:2c33e24fa7ac275640ab947805f9db4d9217ca484b0c043d85571d8c6baaee02

    Details:

    Implementation ca23652dcfc6. Scoped Calc ODS XML, Worker, conditional core and UI run passed 157 scenarios. Its sole failure expected GRAM_PODF to be unavailable. After updating the outdated assertion and completing PODF serialization, the affected compiler and conditional suites passed 10 scenarios across four files, covering the prior failure and the new PODF output assertion. Across both runs all 159 distinct current scenarios in the 34 files passed. The tdf132278 test uses the unchanged string map in a reduced document because the original package contains unported cell annotations and an unrelated malformed operand. Modern extended-format saving and Worker reopen are covered. Office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing and git diff checks passed. Doctor reported the pre-existing managed hook warning. An extra file-size audit reports seven already-over-limit baseline files, verified against the pre-implementation commit. Task four of ten since the full-run cadence reset. The goal remains active.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211719-8PK0GM/blueprint/resolved-snapshot.json
    - old_digest: 7f3dad1e66ca30e562c0cc9825fe45f11d5e581f64e99136681a212772b04a24
    - current_digest: 7f3dad1e66ca30e562c0cc9825fe45f11d5e581f64e99136681a212772b04a24
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211719-8PK0GM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211719-8PK0GM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Import legacy ODF conditional style maps into the Calc conditional format model.

## Scope

Port the original XML condition parser and automatic cell-style application, including rule order, range joining, formula grammar and source positions, sheet ownership, and precedence of the extended element. Validate the existing Worker and default extended ODS export paths. Record source behavior that appears anomalous.

## Plan

Read the pinned XMLConverter, xmlstyli, xmlcondformat and conditio owners. Collect legacy maps in the cell-style context and attach their ranges in style application order. Compile the surviving formats after sheet and range names exist. Verify evaluation and package and Worker reopening.

## Verify Steps

Run scoped Calc ODS, conditional core, and Worker tests. Cover ordered maps, merged disjoint ranges, relative formula and namespace anchors, multiple sheets and precedence of an empty extended element. Exercise export and reimport through the default extended ODS path. Run office typecheck, scoped formatting and lint, dependency and provenance checks, routing, doctor, and git whitespace checks.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T17:32:35.735Z — VERIFY — ok

By: CODER

Note: Verified legacy conditional style maps, native grammar and sheet precedence through Calc, Worker and ODS.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:19:42.569Z, excerpt_hash=sha256:2c33e24fa7ac275640ab947805f9db4d9217ca484b0c043d85571d8c6baaee02

Details:

Implementation ca23652dcfc6. Scoped Calc ODS XML, Worker, conditional core and UI run passed 157 scenarios. Its sole failure expected GRAM_PODF to be unavailable. After updating the outdated assertion and completing PODF serialization, the affected compiler and conditional suites passed 10 scenarios across four files, covering the prior failure and the new PODF output assertion. Across both runs all 159 distinct current scenarios in the 34 files passed. The tdf132278 test uses the unchanged string map in a reduced document because the original package contains unported cell annotations and an unrelated malformed operand. Modern extended-format saving and Worker reopen are covered. Office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing and git diff checks passed. Doctor reported the pre-existing managed hook warning. An extra file-size audit reports seven already-over-limit baseline files, verified against the pre-implementation commit. Task four of ten since the full-run cadence reset. The goal remains active.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211719-8PK0GM/blueprint/resolved-snapshot.json
- old_digest: 7f3dad1e66ca30e562c0cc9825fe45f11d5e581f64e99136681a212772b04a24
- current_digest: 7f3dad1e66ca30e562c0cc9825fe45f11d5e581f64e99136681a212772b04a24
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211719-8PK0GM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211719-8PK0GM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
