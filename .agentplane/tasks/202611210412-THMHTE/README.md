---
id: "202611210412-THMHTE"
title: "Align Calc ODS outline groups and print header boundaries"
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
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:12:14.228Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T04:39:45.528Z"
  updated_by: "CODER"
  note: "Verified native Calc ODS outline, print titles and sparse column extent. All related application cases passed across the focused run and timeout replay."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T04:39:47.802Z"
  updated_by: "EVALUATOR"
  note: "Calc ODS axis import and boundary export match the pinned source for the connected outline and print range model."
  evaluated_sha: "ff047bc5e9b8320c50d8b458bf28c1ac53642acb"
  blueprint_digest: "ec37d4896aded89d88247299c402cfbd2ac83aaf5ba98662210f6747fba5a8f4"
  evidence_refs:
    - ".agentplane/tasks/202611210412-THMHTE/README.md"
    - ".agentplane/tasks/202611210412-THMHTE/quality/20261121-043947802-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210412-THMHTE/quality/20261121-043947802-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210412-THMHTE/quality/20261121-043947802-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210412-THMHTE/blueprint/resolved-snapshot.json"
    - "output/playwright/THMHTE/outline-final.log"
    - "output/playwright/THMHTE/calc-ods.log"
    - "output/playwright/THMHTE/row-height-retry.log"
    - "docs/program/calc-upstream-suspected-issues.md"
  findings:
    - "The independent ODS outline and print fixtures confirm row and column visibility, title reconstruction and preserved cursor edge cases. All 121 related Calc cases are verified, including the exact timeout replay."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port Calc row and column XML grouping and print title boundaries with pinned fixture checks."
events:
  -
    type: "status"
    at: "2026-11-21T04:12:22.068Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port Calc row and column XML grouping and print title boundaries with pinned fixture checks."
  -
    type: "verify"
    at: "2026-11-21T04:39:45.528Z"
    author: "CODER"
    state: "ok"
    note: "Verified native Calc ODS outline, print titles and sparse column extent. All related application cases passed across the focused run and timeout replay."
doc_version: 3
doc_updated_at: "2026-11-21T04:39:45.721Z"
doc_updated_by: "CODER"
description: "Match pinned LibreOffice ODF row and column grouping, collapse and control visibility, header wrappers, axis ordering, and bounded export for the connected Calc outline and print range model. Port applicable native regressions and verify save and reopen."
sections:
  Summary: "Port LibreOffice Calc ODS outline and repeated print-header handling to the connected outline and axis geometry model."
  Scope: "Calc XML row and column import contexts, sheet finalization, outline visibility, XML grouping and repeated print headers, native fixtures and their coverage. Document surprising pinned behavior when applicable. Preserve other formats and file workflow behavior."
  Plan: "Compare the pinned row, column, group and export owners. Port axis-specific context lifecycle and outline finalization, and align grouping/header boundaries, repeats, and sparse output. Replay the original outline and print-range fixtures and add focused cases for model and XML edges. Run scoped checks, record review and finish."
  Verify Steps: |-
    1. Run Calc ODS outline, sparse serialization, native column and row geometry, print range, and native outline tests. Include the pinned outline.ods and print-range.ods regressions and verify XML plus reimport.
    2. Run office typecheck, changed-file Prettier and ESLint, dependency guard, source provenance for changed owners, routing, doctor and git diff --check.
  Verification: |-
    Pending implementation and focused verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T04:39:45.528Z — VERIFY — ok

    By: CODER

    Note: Verified native Calc ODS outline, print titles and sparse column extent. All related application cases passed across the focused run and timeout replay.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:12:22.068Z, excerpt_hash=sha256:7331529b9de4792db03eb3e0b14e3460f43f9995073e1014222d092fc0452e4a

    Details:

    - Command: npm run test:calc -- src/sc/source/filter/xml src/sc/source/filter/oox/worksheethelper.test.ts src/sc/source/filter/excel/print-ranges.test.ts src/sc/source/core/data/documentimport.test.ts --maxWorkers 2 --testTimeout 180000. Result: 120 passed across 24 files and one XLSX row-height timeout. The exact timed-out case passed with npm run test:calc -- src/sc/source/filter/oox/worksheethelper.test.ts -t 'tdf145129_DefaultRowHeight_28.35pt_SavedByExcel' --maxWorkers 1 --testTimeout 360000. All 121 functional cases verified.
    - Command: npm run test:calc -- src/sc/source/filter/xml/ods-outline.test.ts src/sc/source/filter/excel/print-ranges.test.ts --maxWorkers 1 --testTimeout 120000. Result: 9 passed. Covers the pinned outline.ods and print-range.ods cases, row and column controls, exact header wrapper order, last-column bounds and package reopen.
    - Command: npm run test:calc -- src/sc/browser/presentation/calc-outline.test.tsx src/sc/browser/presentation/calc-sheet-outline.test.tsx src/sc/browser/presentation/calc-outline-window.test.tsx src/sc/source/filter/xml/ods-outline.test.ts --maxWorkers 2 --testTimeout 120000. Result: 13 passed. Covers existing outline controls and sheet integration.
    - Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1. Result: passed for the implementation commit.
    - Commands: Changed-file Prettier and ESLint, npm run check:dependencies, npm run check:source-provenance, node .agentplane/policy/check-routing.mjs, ap doctor and git diff --check. Result: passed. Provenance checked 2,911 modules. Doctor retains its existing hook-shim readiness warning.
    - Evidence: output/playwright/THMHTE. The preserved source behaviors are recorded as CALC-784 through CALC-786. No complete application regression was due at this checkpoint.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210412-THMHTE/blueprint/resolved-snapshot.json
    - old_digest: ec37d4896aded89d88247299c402cfbd2ac83aaf5ba98662210f6747fba5a8f4
    - current_digest: ec37d4896aded89d88247299c402cfbd2ac83aaf5ba98662210f6747fba5a8f4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210412-THMHTE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210412-THMHTE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commits for this task. No migration is required."
  Findings: "Record upstream behavior and residual scope boundaries during verification."
id_source: "generated"
---
## Summary

Port LibreOffice Calc ODS outline and repeated print-header handling to the connected outline and axis geometry model.

## Scope

Calc XML row and column import contexts, sheet finalization, outline visibility, XML grouping and repeated print headers, native fixtures and their coverage. Document surprising pinned behavior when applicable. Preserve other formats and file workflow behavior.

## Plan

Compare the pinned row, column, group and export owners. Port axis-specific context lifecycle and outline finalization, and align grouping/header boundaries, repeats, and sparse output. Replay the original outline and print-range fixtures and add focused cases for model and XML edges. Run scoped checks, record review and finish.

## Verify Steps

1. Run Calc ODS outline, sparse serialization, native column and row geometry, print range, and native outline tests. Include the pinned outline.ods and print-range.ods regressions and verify XML plus reimport.
2. Run office typecheck, changed-file Prettier and ESLint, dependency guard, source provenance for changed owners, routing, doctor and git diff --check.

## Verification

Pending implementation and focused verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T04:39:45.528Z — VERIFY — ok

By: CODER

Note: Verified native Calc ODS outline, print titles and sparse column extent. All related application cases passed across the focused run and timeout replay.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:12:22.068Z, excerpt_hash=sha256:7331529b9de4792db03eb3e0b14e3460f43f9995073e1014222d092fc0452e4a

Details:

- Command: npm run test:calc -- src/sc/source/filter/xml src/sc/source/filter/oox/worksheethelper.test.ts src/sc/source/filter/excel/print-ranges.test.ts src/sc/source/core/data/documentimport.test.ts --maxWorkers 2 --testTimeout 180000. Result: 120 passed across 24 files and one XLSX row-height timeout. The exact timed-out case passed with npm run test:calc -- src/sc/source/filter/oox/worksheethelper.test.ts -t 'tdf145129_DefaultRowHeight_28.35pt_SavedByExcel' --maxWorkers 1 --testTimeout 360000. All 121 functional cases verified.
- Command: npm run test:calc -- src/sc/source/filter/xml/ods-outline.test.ts src/sc/source/filter/excel/print-ranges.test.ts --maxWorkers 1 --testTimeout 120000. Result: 9 passed. Covers the pinned outline.ods and print-range.ods cases, row and column controls, exact header wrapper order, last-column bounds and package reopen.
- Command: npm run test:calc -- src/sc/browser/presentation/calc-outline.test.tsx src/sc/browser/presentation/calc-sheet-outline.test.tsx src/sc/browser/presentation/calc-outline-window.test.tsx src/sc/source/filter/xml/ods-outline.test.ts --maxWorkers 2 --testTimeout 120000. Result: 13 passed. Covers existing outline controls and sheet integration.
- Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1. Result: passed for the implementation commit.
- Commands: Changed-file Prettier and ESLint, npm run check:dependencies, npm run check:source-provenance, node .agentplane/policy/check-routing.mjs, ap doctor and git diff --check. Result: passed. Provenance checked 2,911 modules. Doctor retains its existing hook-shim readiness warning.
- Evidence: output/playwright/THMHTE. The preserved source behaviors are recorded as CALC-784 through CALC-786. No complete application regression was due at this checkpoint.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210412-THMHTE/blueprint/resolved-snapshot.json
- old_digest: ec37d4896aded89d88247299c402cfbd2ac83aaf5ba98662210f6747fba5a8f4
- current_digest: ec37d4896aded89d88247299c402cfbd2ac83aaf5ba98662210f6747fba5a8f4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210412-THMHTE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210412-THMHTE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commits for this task. No migration is required.

## Findings

Record upstream behavior and residual scope boundaries during verification.
