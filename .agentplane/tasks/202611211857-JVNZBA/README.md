---
id: "202611211857-JVNZBA"
title: "Connect the Calc Calculate submenu"
result_summary: "Connected the Calc Calculate submenu. Completed task six of the ten-task test cycle."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:57:27.618Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T19:14:16.247Z"
  updated_by: "CODER"
  note: "84 focused tests across 15 suites passed. Verified native AutoCalculate, ordinary and hard recalc, volatility and manual caches, F9 preview and Enter insertion, tdf131326, split formula groups and integrated undo. TypeScript, changed-path lint and format, generated Calc resources, source provenance, module dependencies and policy routing passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T19:14:17.169Z"
  updated_by: "EVALUATOR"
  note: "The native Calculate submenu changes the active Calc document and editing state through its consumed slots. Command, calculation, result, dependency and undo evidence support the approved scope."
  evaluated_sha: "81b6187abaf34c296e0ab6b499b992e3236d8998"
  blueprint_digest: "ae59d3f999ac914fe290fdde7cd2486fadac578ead0179cf78f725d80c51c1f2"
  evidence_refs:
    - ".agentplane/tasks/202611211857-JVNZBA/README.md"
    - ".agentplane/tasks/202611211857-JVNZBA/quality/20261121-191417169-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211857-JVNZBA/quality/20261121-191417169-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211857-JVNZBA/quality/20261121-191417169-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211857-JVNZBA/blueprint/resolved-snapshot.json"
    - "output/calc-JVNZBA-verification.md"
    - "output/calc-JVNZBA-verified-tests.log"
  findings:
    - "Compared the source document shell, calculation tree and constant conversion with the mounted workbench and original UI and core regressions."
commit:
  hash: "81b6187abaf34c296e0ab6b499b992e3236d8998"
  message: "🧩 JVNZBA code: connect Calc Calculate submenu"
comments:
  -
    author: "CODER"
    body: "Start: connect the source Calc Calculate menu, calculation input, and undoable formula result conversion."
  -
    author: "CODER"
    body: "Verified: connected the native Calculate submenu, F9 editor preview, full recalculation, automatic mode and undoable Formula to Value. All 84 focused tests passed."
events:
  -
    type: "status"
    at: "2026-11-21T18:57:28.606Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the source Calc Calculate menu, calculation input, and undoable formula result conversion."
  -
    type: "verify"
    at: "2026-11-21T19:14:16.247Z"
    author: "CODER"
    state: "ok"
    note: "84 focused tests across 15 suites passed. Verified native AutoCalculate, ordinary and hard recalc, volatility and manual caches, F9 preview and Enter insertion, tdf131326, split formula groups and integrated undo. TypeScript, changed-path lint and format, generated Calc resources, source provenance, module dependencies and policy routing passed."
  -
    type: "status"
    at: "2026-11-21T19:15:37.835Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: connected the native Calculate submenu, F9 editor preview, full recalculation, automatic mode and undoable Formula to Value. All 84 focused tests passed."
doc_version: 3
doc_updated_at: "2026-11-21T19:15:37.836Z"
doc_updated_by: "CODER"
description: "Wire AutoCalculate, Recalculate, Recalculate Hard and Formula to Value from the native submenu, with formula preview and undo."
sections:
  Summary: "Wire the native Calc Data > Calculate submenu and its keyboard routes."
  Scope: "Task six of the approved ten-task cycle. Connect AutoCalculate, Recalculate, Recalculate Hard, and Formula to Value using the pinned Calc document-shell and cell-shell contracts. Cover the real document state, command enablement/checkmark, formula input preview, dirty and full calculation, value conversion and undo. Preserve existing document I/O and autosave behavior."
  Plan: "Add the complete native Calculate submenu using source slot, input preview, sparse formula tree, document calculation and conversion/undo contracts. Verify actual Calc grid and formula bar behavior, source regressions tdf97897 and tdf131326, and declared focused/static checks."
  Verify Steps: "Run targeted Calc recalculation and formula-to-value UI, formula tree and existing affected command/undo tests. Check Office TypeScript, changed-path eslint and Prettier, Calc generated resources, source provenance, module dependencies, AgentPlane policy routing and doctor."
  Verification: |-
    | Command | Result | Evidence and scope |
    | --- | --- | --- |
    | `node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-recalculation reference-protocol calc-options calc-view-options calc-workbench calc-pane-commands calc-label-ranges calc-named-ranges native-a1-formula interpr1.reference document.formula native-table-undo formula-copy formularesult --maxWorkers 2 --testTimeout 180000 --reporter verbose` from `apps/office` | pass | 84 tests in 15 suites. Seven focused Calculate menu tests cover source tdf131326, tdf97897 cursor behavior, workbook-wide hard recalculation and stream invalidation, manual and volatile calculation, active-edit preview, Excel A1 qualifiers, native values and undo selection. |
    | `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo` | pass | Office TypeScript. |
    | `rg '^apps/.*\.tsx?$' output/calc-JVNZBA-paths.txt \| xargs node_modules/.bin/eslint --max-warnings 0` and `xargs node_modules/.bin/prettier --check < output/calc-JVNZBA-paths.txt` | pass | All changed source and registry paths. |
    | `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies` | pass | 477 generated commands, 3,005 provenance modules, 3,004 runtime sources and 315 allowed cross-module edges. |
    | `git diff --check`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor` | pass | Clean patch, policy routing, and no doctor errors. Existing AgentPlane shim readiness warning. |

    Implementation commit is `81b6187abaf3`. This is task six of ten. The full test run remains scheduled after task ten.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T19:14:16.247Z — VERIFY — ok

    By: CODER

    Note: 84 focused tests across 15 suites passed. Verified native AutoCalculate, ordinary and hard recalc, volatility and manual caches, F9 preview and Enter insertion, tdf131326, split formula groups and integrated undo. TypeScript, changed-path lint and format, generated Calc resources, source provenance, module dependencies and policy routing passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T19:14:15.524Z, excerpt_hash=sha256:1ff83100729af8ad1200441a16d25ac1f290b2adb402a7ed2192e04bffd3e0fd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211857-JVNZBA/blueprint/resolved-snapshot.json
    - old_digest: ae59d3f999ac914fe290fdde7cd2486fadac578ead0179cf78f725d80c51c1f2
    - current_digest: ae59d3f999ac914fe290fdde7cd2486fadac578ead0179cf78f725d80c51c1f2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211857-JVNZBA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211857-JVNZBA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit to restore the previous command and calculation dispatch behavior."
  Findings: |-
    Pinned LibreOffice docsh.sdi, cellsh.sdi and docsh4.cxx establish the native calculation slot IDs, typed AutoCalculate argument, edit-preview branch and tdf97897 cursor dirtying. ScDocument::CalcFormulaTree invalidates volatile cells, and ScDocument::CalcAll marks all workbook formulas before evaluating them. The shared shell projects source data-change hints and stream invalidation to the existing browser owners.

    ConvertFormulaToValueOperation, ScColumn::ConvertFormulaToValue and UndoFormulaToValue define the literal result types, original editability test and reversible content swap. The browser test ports the tdf131326 input-line update and the core ucalc middle-of-group case, including ISFORMULA dependencies.

    CALC-812 records the source empty undo action and modified flag for editable ranges without formulas. CALC-813 records the source manual preview reparse and insertion rule for a standalone label. Both behaviors remain in the implementation.

    The browser calculation paths use the supported Calc formula interpreter. Desktop chart, detective-arrow, progress and sheet-script handlers remain outside this slice. No file admission, recovery or autosave path was edited.
id_source: "generated"
---
## Summary

Wire the native Calc Data > Calculate submenu and its keyboard routes.

## Scope

Task six of the approved ten-task cycle. Connect AutoCalculate, Recalculate, Recalculate Hard, and Formula to Value using the pinned Calc document-shell and cell-shell contracts. Cover the real document state, command enablement/checkmark, formula input preview, dirty and full calculation, value conversion and undo. Preserve existing document I/O and autosave behavior.

## Plan

Add the complete native Calculate submenu using source slot, input preview, sparse formula tree, document calculation and conversion/undo contracts. Verify actual Calc grid and formula bar behavior, source regressions tdf97897 and tdf131326, and declared focused/static checks.

## Verify Steps

Run targeted Calc recalculation and formula-to-value UI, formula tree and existing affected command/undo tests. Check Office TypeScript, changed-path eslint and Prettier, Calc generated resources, source provenance, module dependencies, AgentPlane policy routing and doctor.

## Verification

| Command | Result | Evidence and scope |
| --- | --- | --- |
| `node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-recalculation reference-protocol calc-options calc-view-options calc-workbench calc-pane-commands calc-label-ranges calc-named-ranges native-a1-formula interpr1.reference document.formula native-table-undo formula-copy formularesult --maxWorkers 2 --testTimeout 180000 --reporter verbose` from `apps/office` | pass | 84 tests in 15 suites. Seven focused Calculate menu tests cover source tdf131326, tdf97897 cursor behavior, workbook-wide hard recalculation and stream invalidation, manual and volatile calculation, active-edit preview, Excel A1 qualifiers, native values and undo selection. |
| `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo` | pass | Office TypeScript. |
| `rg '^apps/.*\.tsx?$' output/calc-JVNZBA-paths.txt \| xargs node_modules/.bin/eslint --max-warnings 0` and `xargs node_modules/.bin/prettier --check < output/calc-JVNZBA-paths.txt` | pass | All changed source and registry paths. |
| `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies` | pass | 477 generated commands, 3,005 provenance modules, 3,004 runtime sources and 315 allowed cross-module edges. |
| `git diff --check`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor` | pass | Clean patch, policy routing, and no doctor errors. Existing AgentPlane shim readiness warning. |

Implementation commit is `81b6187abaf3`. This is task six of ten. The full test run remains scheduled after task ten.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T19:14:16.247Z — VERIFY — ok

By: CODER

Note: 84 focused tests across 15 suites passed. Verified native AutoCalculate, ordinary and hard recalc, volatility and manual caches, F9 preview and Enter insertion, tdf131326, split formula groups and integrated undo. TypeScript, changed-path lint and format, generated Calc resources, source provenance, module dependencies and policy routing passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T19:14:15.524Z, excerpt_hash=sha256:1ff83100729af8ad1200441a16d25ac1f290b2adb402a7ed2192e04bffd3e0fd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211857-JVNZBA/blueprint/resolved-snapshot.json
- old_digest: ae59d3f999ac914fe290fdde7cd2486fadac578ead0179cf78f725d80c51c1f2
- current_digest: ae59d3f999ac914fe290fdde7cd2486fadac578ead0179cf78f725d80c51c1f2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211857-JVNZBA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211857-JVNZBA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit to restore the previous command and calculation dispatch behavior.

## Findings

Pinned LibreOffice docsh.sdi, cellsh.sdi and docsh4.cxx establish the native calculation slot IDs, typed AutoCalculate argument, edit-preview branch and tdf97897 cursor dirtying. ScDocument::CalcFormulaTree invalidates volatile cells, and ScDocument::CalcAll marks all workbook formulas before evaluating them. The shared shell projects source data-change hints and stream invalidation to the existing browser owners.

ConvertFormulaToValueOperation, ScColumn::ConvertFormulaToValue and UndoFormulaToValue define the literal result types, original editability test and reversible content swap. The browser test ports the tdf131326 input-line update and the core ucalc middle-of-group case, including ISFORMULA dependencies.

CALC-812 records the source empty undo action and modified flag for editable ranges without formulas. CALC-813 records the source manual preview reparse and insertion rule for a standalone label. Both behaviors remain in the implementation.

The browser calculation paths use the supported Calc formula interpreter. Desktop chart, detective-arrow, progress and sheet-script handlers remain outside this slice. No file admission, recovery or autosave path was edited.
