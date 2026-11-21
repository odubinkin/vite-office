---
id: "202611212311-DWTX6F"
title: "Connect Calc Text to Columns command and range import"
result_summary: "verified-202611212311-DWTX6F"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on:
  - "202611212120-ADJVW8"
tags:
  - "calc"
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Calc Text to Columns, CSV import, range selection, clipboard, paste block and history tests. Include the relevant upstream selected range, whole column, typed format, and overwrite fixtures. Run Office TypeScript, changed-path lint and formatting, source provenance, Calc resources, module boundaries, routing and AgentPlane doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T23:11:24.277Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T23:41:01.351Z"
  updated_by: "CODER"
  note: "verified-202611212311-DWTX6F"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T23:37:44.409Z"
  updated_by: "EVALUATOR"
  note: "Native Calc Text to Columns is connected through the Data menu and source ASCII import, with confirmed replacement and list Undo."
  evaluated_sha: "feb0f07a309f6d74fd9220e120e2dd7ae56b5df6"
  blueprint_digest: "8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55"
  evidence_refs:
    - ".agentplane/tasks/202611212311-DWTX6F/README.md"
    - ".agentplane/tasks/202611212311-DWTX6F/quality/20261121-233744409-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611212311-DWTX6F/quality/20261121-233744409-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611212311-DWTX6F/quality/20261121-233744409-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611212311-DWTX6F/blueprint/resolved-snapshot.json"
    - "output/calc-task12-verification.md"
    - "output/calc-task12-browser-tests-retry.log"
    - "output/playwright/calc-task12/smoke.log"
    - "feb0f07a309f6d74fd9220e120e2dd7ae56b5df6"
  findings:
    - "The whole-column, selected range, prior date format and original ODS overwrite regressions passed. Chrome verified the same replacement and Undo path."
commit:
  hash: "9b8e597264b19bb0a4a7c548072b0e50afed488e"
  message: "🧩 DWTX6F task: record verified Text to Columns"
comments:
  -
    author: "CODER"
    body: "Start: connect the native Calc Text to Columns sheet range, dialog and import transaction."
  -
    author: "CODER"
    body: "Verified: verified-202611212311-DWTX6F. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-21T23:11:40.413Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native Calc Text to Columns sheet range, dialog and import transaction."
  -
    type: "verify"
    at: "2026-11-21T23:37:43.344Z"
    author: "CODER"
    state: "ok"
    note: "Verified: native Calc Text to Columns menu, range, import confirmation and one-step history. All 166 scoped scenarios have passing evidence, including the original ODS fixture, and the rebuilt Chrome workflow passed."
  -
    type: "verify"
    at: "2026-11-21T23:41:01.351Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611212311-DWTX6F"
  -
    type: "status"
    at: "2026-11-21T23:41:01.540Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202611212311-DWTX6F. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-21T23:41:01.540Z"
doc_updated_by: "CODER"
description: "Connect the source text-to-columns command to the existing Calc CSV dialog, one-column range admission, formatted-text export, overwrite admission and native list Undo."
sections:
  Summary: "Connect the source Calc Data > Text to Columns slot to the existing ASCII import dialog, current single-column data, native overwrite confirmation, and a grouped undo action."
  Scope: "Port SID_TEXT_TO_COLUMNS from sc/sdi and cellsh2.cxx. Preserve source range admission, empty state, selected start row, shrinking to used rows, formatted source cell text and native separator-free export. Reuse the fixed-width and delimiter dialog with the SC_TEXTTOCOLUMNS controls and independent preferences. Apply the accepted parsed cells through native import, number formats, broadcast and overwrite confirmation. Preserve one-step Text to Columns Undo and the clipboard and document I/O behavior outside this command."
  Plan: |-
    1. Resolve command state and the exact source range through the current Calc view and native document iteration.
    2. Connect the Data menu to the SC_TEXTTOCOLUMNS dialog and use its own defaults, selected source export and typed column options.
    3. Apply the import with native confirmation, formatted values, notifications and grouped undo. Preserve other clipboard and document workflows.
    4. Port the relevant upstream regressions and verify the related modules and real browser.
  Verify Steps: "Run focused Calc Vitest for Text to Columns, CSV import, selection range, paste confirmation, clipboard, UI resources and Undo. Port the relevant pinned textToColumns scenarios for selected ranges, whole-column shrink, typed and date values, already-formatted cells, empty fields and overwrite confirmation, including tdf51700, tdf69981 and tdf92423. Check disabled commands, canceled dialog or confirmation, stale destination, recalculation and one-step Undo/Redo. Run Office TypeScript, changed-path Prettier and ESLint, source provenance, Calc resources, dependencies, policy routing, and AgentPlane doctor. Verify the Data menu command in Chrome on the built application."
  Verification: |-
    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 text-to-columns connected-area impex calc-cell-clipboard paste-block calc-workbench ui-resources` ran 166 tests across 11 files. It passed 165. The original tdf69981 fixture needed the same plain Uint8Array conversion used by the repository's JSDOM fixtures. After that test-only correction, the focused Calc Text to Columns presentation suite passed all six tests, so all 166 scenarios have passing evidence across the two runs.
    - The native and mounted cases cover an empty cursor, whole-column shrink, tdf51700, original ODS tdf69981, paste selection tdf92423, date-formatted input tdf82398, explicit empty and trailing fields, declined and accepted replacement, stale target, dependent recalculation, and grouped Undo and Redo.
    - TypeScript, changed-path Prettier and ESLint, Calc UI resources, source provenance, module boundaries, policy routing, and the scoped Calc inventory passed. The inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
    - Production Vite build and static smoke passed. Real Chrome selected Data > Text to Columns, detected the semicolon, asked before replacing B1, produced B1=2 after confirmation and restored B1=88 with Undo. Evidence is in `output/playwright/calc-task12/smoke.log`. The only console entry was the existing missing favicon.
    - The full checkpoint remains on the user's ten-task cycle. This is the second completed task in the new cycle.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T23:37:43.344Z — VERIFY — ok

    By: CODER

    Note: Verified: native Calc Text to Columns menu, range, import confirmation and one-step history. All 166 scoped scenarios have passing evidence, including the original ODS fixture, and the rebuilt Chrome workflow passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:37:42.496Z, excerpt_hash=sha256:d721219d4b08611b34bfbb02bc25fcf6007d15942bc3bcb7aa6a4d52d8654714

    Details:

    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 text-to-columns connected-area impex calc-cell-clipboard paste-block calc-workbench ui-resources` ran 166 tests across 11 files. It passed 165. The original tdf69981 fixture needed the same plain Uint8Array conversion used by the repository's JSDOM fixtures. After that test-only correction, the focused Calc Text to Columns presentation suite passed all six tests, so all 166 scenarios have passing evidence across the two runs.
    - The native and mounted cases cover an empty cursor, whole-column shrink, tdf51700, original ODS tdf69981, paste selection tdf92423, date-formatted input tdf82398, explicit empty and trailing fields, declined and accepted replacement, stale target, dependent recalculation, and grouped Undo and Redo.
    - TypeScript, changed-path Prettier and ESLint, Calc UI resources, source provenance, module boundaries, policy routing, and the scoped Calc inventory passed. The inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
    - Production Vite build and static smoke passed. Real Chrome selected Data > Text to Columns, detected the semicolon, asked before replacing B1, produced B1=2 after confirmation and restored B1=88 with Undo. Evidence is in `output/playwright/calc-task12/smoke.log`. The only console entry was the existing missing favicon.
    - The full checkpoint remains on the user's ten-task cycle. This is the second completed task in the new cycle.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212311-DWTX6F/blueprint/resolved-snapshot.json
    - old_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
    - current_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611212311-DWTX6F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611212311-DWTX6F
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-21T23:41:01.351Z — VERIFY — ok

    By: CODER

    Note: verified-202611212311-DWTX6F
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:37:43.416Z, excerpt_hash=sha256:d721219d4b08611b34bfbb02bc25fcf6007d15942bc3bcb7aa6a4d52d8654714

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212311-DWTX6F/blueprint/resolved-snapshot.json
    - old_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
    - current_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611212311-DWTX6F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611212311-DWTX6F --result verified-202611212311-DWTX6F --commit 9b8e597264b19bb0a4a7c548072b0e50afed488e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commits to disable the source Text to Columns slot and restore the previous dialog bindings. Existing committed workbook changes remain under the native Undo history."
  Findings: |-
    The source SID_TEXT_TO_COLUMNS slot now uses native Calc cursor and mark admission, reduces whole-column selections to occupied rows, exports formatted cell text with its internal empty records, and opens SC_TEXTTOCOLUMNS in the existing ASCII dialog. Its mode and separator preferences are independent from clipboard text import. The ruler and replacement-warning preference are shared as in the source UI.

    The importer determines the result rectangle before asking to overwrite columns to the right of the source column. The writing pass uses the normal document setters and the original last-column empty-field rule. The current model snapshots cell contents and attributes in native Undo documents for one Text to Columns list action. The Chrome smoke confirmed the menu and replacement path.

    CALC-818 records the source cursor fallback when the mark is exclusively disjoint. The implementation preserves that branch. The browser dialog still samples preview rows and delimited columns as in its existing clipboard view.
extensions:
  implementation_commit:
    hash: "feb0f07a309f6d74fd9220e120e2dd7ae56b5df6"
    message: "🧩 DWTX6F code: connect Calc Text to Columns dialog and Undo"
id_source: "generated"
---
## Summary

Connect the source Calc Data > Text to Columns slot to the existing ASCII import dialog, current single-column data, native overwrite confirmation, and a grouped undo action.

## Scope

Port SID_TEXT_TO_COLUMNS from sc/sdi and cellsh2.cxx. Preserve source range admission, empty state, selected start row, shrinking to used rows, formatted source cell text and native separator-free export. Reuse the fixed-width and delimiter dialog with the SC_TEXTTOCOLUMNS controls and independent preferences. Apply the accepted parsed cells through native import, number formats, broadcast and overwrite confirmation. Preserve one-step Text to Columns Undo and the clipboard and document I/O behavior outside this command.

## Plan

1. Resolve command state and the exact source range through the current Calc view and native document iteration.
2. Connect the Data menu to the SC_TEXTTOCOLUMNS dialog and use its own defaults, selected source export and typed column options.
3. Apply the import with native confirmation, formatted values, notifications and grouped undo. Preserve other clipboard and document workflows.
4. Port the relevant upstream regressions and verify the related modules and real browser.

## Verify Steps

Run focused Calc Vitest for Text to Columns, CSV import, selection range, paste confirmation, clipboard, UI resources and Undo. Port the relevant pinned textToColumns scenarios for selected ranges, whole-column shrink, typed and date values, already-formatted cells, empty fields and overwrite confirmation, including tdf51700, tdf69981 and tdf92423. Check disabled commands, canceled dialog or confirmation, stale destination, recalculation and one-step Undo/Redo. Run Office TypeScript, changed-path Prettier and ESLint, source provenance, Calc resources, dependencies, policy routing, and AgentPlane doctor. Verify the Data menu command in Chrome on the built application.

## Verification

- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 text-to-columns connected-area impex calc-cell-clipboard paste-block calc-workbench ui-resources` ran 166 tests across 11 files. It passed 165. The original tdf69981 fixture needed the same plain Uint8Array conversion used by the repository's JSDOM fixtures. After that test-only correction, the focused Calc Text to Columns presentation suite passed all six tests, so all 166 scenarios have passing evidence across the two runs.
- The native and mounted cases cover an empty cursor, whole-column shrink, tdf51700, original ODS tdf69981, paste selection tdf92423, date-formatted input tdf82398, explicit empty and trailing fields, declined and accepted replacement, stale target, dependent recalculation, and grouped Undo and Redo.
- TypeScript, changed-path Prettier and ESLint, Calc UI resources, source provenance, module boundaries, policy routing, and the scoped Calc inventory passed. The inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
- Production Vite build and static smoke passed. Real Chrome selected Data > Text to Columns, detected the semicolon, asked before replacing B1, produced B1=2 after confirmation and restored B1=88 with Undo. Evidence is in `output/playwright/calc-task12/smoke.log`. The only console entry was the existing missing favicon.
- The full checkpoint remains on the user's ten-task cycle. This is the second completed task in the new cycle.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T23:37:43.344Z — VERIFY — ok

By: CODER

Note: Verified: native Calc Text to Columns menu, range, import confirmation and one-step history. All 166 scoped scenarios have passing evidence, including the original ODS fixture, and the rebuilt Chrome workflow passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:37:42.496Z, excerpt_hash=sha256:d721219d4b08611b34bfbb02bc25fcf6007d15942bc3bcb7aa6a4d52d8654714

Details:

- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 text-to-columns connected-area impex calc-cell-clipboard paste-block calc-workbench ui-resources` ran 166 tests across 11 files. It passed 165. The original tdf69981 fixture needed the same plain Uint8Array conversion used by the repository's JSDOM fixtures. After that test-only correction, the focused Calc Text to Columns presentation suite passed all six tests, so all 166 scenarios have passing evidence across the two runs.
- The native and mounted cases cover an empty cursor, whole-column shrink, tdf51700, original ODS tdf69981, paste selection tdf92423, date-formatted input tdf82398, explicit empty and trailing fields, declined and accepted replacement, stale target, dependent recalculation, and grouped Undo and Redo.
- TypeScript, changed-path Prettier and ESLint, Calc UI resources, source provenance, module boundaries, policy routing, and the scoped Calc inventory passed. The inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
- Production Vite build and static smoke passed. Real Chrome selected Data > Text to Columns, detected the semicolon, asked before replacing B1, produced B1=2 after confirmation and restored B1=88 with Undo. Evidence is in `output/playwright/calc-task12/smoke.log`. The only console entry was the existing missing favicon.
- The full checkpoint remains on the user's ten-task cycle. This is the second completed task in the new cycle.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212311-DWTX6F/blueprint/resolved-snapshot.json
- old_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
- current_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611212311-DWTX6F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611212311-DWTX6F
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-21T23:41:01.351Z — VERIFY — ok

By: CODER

Note: verified-202611212311-DWTX6F
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:37:43.416Z, excerpt_hash=sha256:d721219d4b08611b34bfbb02bc25fcf6007d15942bc3bcb7aa6a4d52d8654714

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212311-DWTX6F/blueprint/resolved-snapshot.json
- old_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
- current_digest: 8943f06f4038526101db920f9a075bff4693732fa062f55ff9dd5550cf579f55
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611212311-DWTX6F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611212311-DWTX6F --result verified-202611212311-DWTX6F --commit 9b8e597264b19bb0a4a7c548072b0e50afed488e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commits to disable the source Text to Columns slot and restore the previous dialog bindings. Existing committed workbook changes remain under the native Undo history.

## Findings

The source SID_TEXT_TO_COLUMNS slot now uses native Calc cursor and mark admission, reduces whole-column selections to occupied rows, exports formatted cell text with its internal empty records, and opens SC_TEXTTOCOLUMNS in the existing ASCII dialog. Its mode and separator preferences are independent from clipboard text import. The ruler and replacement-warning preference are shared as in the source UI.

The importer determines the result rectangle before asking to overwrite columns to the right of the source column. The writing pass uses the normal document setters and the original last-column empty-field rule. The current model snapshots cell contents and attributes in native Undo documents for one Text to Columns list action. The Chrome smoke confirmed the menu and replacement path.

CALC-818 records the source cursor fallback when the mark is exclusively disjoint. The implementation preserves that branch. The browser dialog still samples preview rows and delimited columns as in its existing clipboard view.
