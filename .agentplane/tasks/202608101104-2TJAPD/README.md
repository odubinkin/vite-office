---
id: "202608101104-2TJAPD"
title: "Extract pinned LibreOffice UITest Python source targets into atomic records"
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
  updated_at: "2026-08-10T11:05:17.615Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-10T11:15:30.876Z"
  updated_by: "REVIEWER"
  note: "Review confirmed scoped UITest module-root parsing, constructor linkage, and atomic physical Python-source records. All 649 paths are Git-tracked, deterministic regeneration hashes match, 100% inventory coverage and runtime quality gates pass, and no scope drift or defects were found."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-10T11:15:38.348Z"
  updated_by: "EVALUATOR"
  note: "Scoped UITest Python source-target provenance extraction is complete and independently verified."
  evaluated_sha: "069bc80ba4348bdedde363120836e50dd844f7c1"
  blueprint_digest: "91c8e4f5d8ffe3012fcec291511c014f6c63f4541aeb2d4718667c6eef3f331d"
  evidence_refs:
    - ".agentplane/tasks/202608101104-2TJAPD/README.md"
    - ".agentplane/tasks/202608101104-2TJAPD/quality/20260810-111538348-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608101104-2TJAPD/quality/20260810-111538348-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608101104-2TJAPD/quality/20260810-111538348-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608101104-2TJAPD/blueprint/resolved-snapshot.json"
    - "069bc80; npm run test:inventory:coverage; npm run test:e2e; npm run test:static; f51b54cbc8335227fe3b59732de88ab89bf86e61be15c4ad1ac677676f4efedd"
  findings:
    - "649 Git-tracked physical Python paths are linked to inventoried UITest constructor IDs through 79 declared module roots."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: inspect pinned UITest module roots, link physical Python paths to constructors, and generate provenance-only evidence within the approved scope."
events:
  -
    type: "status"
    at: "2026-08-10T11:05:22.870Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspect pinned UITest module roots, link physical Python paths to constructors, and generate provenance-only evidence within the approved scope."
  -
    type: "verify"
    at: "2026-08-10T11:15:30.876Z"
    author: "REVIEWER"
    state: "ok"
    note: "Review confirmed scoped UITest module-root parsing, constructor linkage, and atomic physical Python-source records. All 649 paths are Git-tracked, deterministic regeneration hashes match, 100% inventory coverage and runtime quality gates pass, and no scope drift or defects were found."
doc_version: 3
doc_updated_at: "2026-08-10T11:15:30.961Z"
doc_updated_by: "CODER"
description: "Parse pinned gb_UITest_add_modules declarations, link declared module directories to existing UITest constructors, and enumerate their Git-tracked Python files as provenance-only atomic source records."
sections:
  Summary: |-
    Extract pinned LibreOffice UITest Python source targets into atomic records

    Parse pinned gb_UITest_add_modules declarations, link declared module directories to existing UITest constructors, and enumerate their Git-tracked Python files as provenance-only atomic source records.
  Scope: |-
    - In scope: deterministic provenance-only parsing of pinned UITest add-modules declarations; exact source-root-relative module-directory validation; linkage to existing UITest constructor IDs; enumeration of Git-tracked Python files beneath each declared module root; canonical JSON, documentation, and tests.
    - Out of scope: copying upstream Python source, evaluating arbitrary Make expressions, recursive fixture or assertion parsing, modifying prior inventories, implementation of LibreOffice UI behavior, or claiming parity.
  Plan: "1. Validate the exact gb_UITest_add_modules declaration form and restrict parsing to literal SRCDIR-relative module directories. 2. Link each declaration to an existing UITest constructor by makefile path and test name. 3. Enumerate only Git-tracked .py files under each declared directory, preserving module-root provenance and guarding observed counts. 4. Add strict parser, linkage, and production CLI tests at 100% inventory coverage; generate canonical JSON and program documentation. 5. Prove byte-identical regeneration and run full repository verification before independent review and closure."
  Verify Steps: |-
    1. Run strict TypeScript, lint, JSDoc, and file-size checks.
    2. Run inventory tests and require 100% statement, branch, function, and line coverage.
    3. Prove byte-identical regeneration of the canonical UITest Python source inventory.
    4. Check that every record has existing UITest constructor provenance and an exact Git-tracked pinned .py path below its declared module root.
    5. Run npm run verify, agentplane doctor, and policy routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T11:15:30.876Z — VERIFY — ok

    By: REVIEWER

    Note: Review confirmed scoped UITest module-root parsing, constructor linkage, and atomic physical Python-source records. All 649 paths are Git-tracked, deterministic regeneration hashes match, 100% inventory coverage and runtime quality gates pass, and no scope drift or defects were found.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T11:05:22.870Z, excerpt_hash=sha256:91965b4ae613dfea7f52ffbf8f8139663773b80ad1532abd6caa4554b0bd6190

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608101104-2TJAPD/blueprint/resolved-snapshot.json
    - old_digest: 91c8e4f5d8ffe3012fcec291511c014f6c63f4541aeb2d4718667c6eef3f331d
    - current_digest: 91c8e4f5d8ffe3012fcec291511c014f6c63f4541aeb2d4718667c6eef3f331d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608101104-2TJAPD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608101104-2TJAPD
    - diagnostic_command: agentplane task run status 202608101104-2TJAPD
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
  Findings: ""
id_source: "generated"
---
## Summary

Extract pinned LibreOffice UITest Python source targets into atomic records

Parse pinned gb_UITest_add_modules declarations, link declared module directories to existing UITest constructors, and enumerate their Git-tracked Python files as provenance-only atomic source records.

## Scope

- In scope: deterministic provenance-only parsing of pinned UITest add-modules declarations; exact source-root-relative module-directory validation; linkage to existing UITest constructor IDs; enumeration of Git-tracked Python files beneath each declared module root; canonical JSON, documentation, and tests.
- Out of scope: copying upstream Python source, evaluating arbitrary Make expressions, recursive fixture or assertion parsing, modifying prior inventories, implementation of LibreOffice UI behavior, or claiming parity.

## Plan

1. Validate the exact gb_UITest_add_modules declaration form and restrict parsing to literal SRCDIR-relative module directories. 2. Link each declaration to an existing UITest constructor by makefile path and test name. 3. Enumerate only Git-tracked .py files under each declared directory, preserving module-root provenance and guarding observed counts. 4. Add strict parser, linkage, and production CLI tests at 100% inventory coverage; generate canonical JSON and program documentation. 5. Prove byte-identical regeneration and run full repository verification before independent review and closure.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and file-size checks.
2. Run inventory tests and require 100% statement, branch, function, and line coverage.
3. Prove byte-identical regeneration of the canonical UITest Python source inventory.
4. Check that every record has existing UITest constructor provenance and an exact Git-tracked pinned .py path below its declared module root.
5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T11:15:30.876Z — VERIFY — ok

By: REVIEWER

Note: Review confirmed scoped UITest module-root parsing, constructor linkage, and atomic physical Python-source records. All 649 paths are Git-tracked, deterministic regeneration hashes match, 100% inventory coverage and runtime quality gates pass, and no scope drift or defects were found.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T11:05:22.870Z, excerpt_hash=sha256:91965b4ae613dfea7f52ffbf8f8139663773b80ad1532abd6caa4554b0bd6190

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608101104-2TJAPD/blueprint/resolved-snapshot.json
- old_digest: 91c8e4f5d8ffe3012fcec291511c014f6c63f4541aeb2d4718667c6eef3f331d
- current_digest: 91c8e4f5d8ffe3012fcec291511c014f6c63f4541aeb2d4718667c6eef3f331d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608101104-2TJAPD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608101104-2TJAPD
- diagnostic_command: agentplane task run status 202608101104-2TJAPD
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
