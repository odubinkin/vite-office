---
id: "202611210659-458SWH"
title: "Connect Calc conditional formatting manager and rule editor"
result_summary: "verified-202611210659-458SWH"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T06:59:53.717Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T12:05:50.382Z"
  updated_by: "CODER"
  note: "verified-202611210659-458SWH"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T12:05:20.835Z"
  updated_by: "EVALUATOR"
  note: "The Calc conditional format editor and manager are verified through native command, range, undo, and workbook round-trip boundaries."
  evaluated_sha: "cb3b6e4f19bff4a9fbe194e77e663bbbe070a16b"
  blueprint_digest: "b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7"
  evidence_refs:
    - ".agentplane/tasks/202611210659-458SWH/README.md"
    - ".agentplane/tasks/202611210659-458SWH/quality/20261121-120520835-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210659-458SWH/quality/20261121-120520835-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210659-458SWH/quality/20261121-120520835-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json"
    - "output/calc-458SWH-verification-final.md"
    - "output/calc-458SWH-browser-retry.log"
    - "output/calc-458SWH-browser-responsiveness.log"
  findings:
    - "All 114 Calc browser cases passed across the full run and focused retries. The checkpoint records the pre-existing Writer parity and row-alignment failures and the interrupted coverage attempt."
commit:
  hash: "a17430d99c047bddb4e82bb74d1cb0b4cfb9d943"
  message: "🧩 458SWH task: record Calc conditional formatting and regression verification"
comments:
  -
    author: "CODER"
    body: "Start: Connect native Calc conditional formatting authoring and manager commands and verify the tenth regression checkpoint."
  -
    author: "CODER"
    body: "Verified: verified-202611210659-458SWH. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-21T06:59:54.286Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native Calc conditional formatting authoring and manager commands and verify the tenth regression checkpoint."
  -
    type: "verify"
    at: "2026-11-21T12:05:07.606Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc conditional format authoring and the scoped regression tests. All 33,794 application and 128 Calc browser cases passed across the checkpoint and targeted retries. Four inventory cases and two browser cases retain pre-existing Writer evidence failures."
  -
    type: "verify"
    at: "2026-11-21T12:05:20.188Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc conditional format authoring and the scoped regression tests. All 33,794 application and 114 Calc browser cases passed across the checkpoint and targeted retries. Four inventory cases and two browser cases retain pre-existing Writer evidence failures."
  -
    type: "verify"
    at: "2026-11-21T12:05:50.382Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611210659-458SWH"
  -
    type: "status"
    at: "2026-11-21T12:05:50.535Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202611210659-458SWH. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-21T12:05:50.535Z"
doc_updated_by: "CODER"
description: "Expose the existing Calc conditional rule families, native range assignments and transactional manager through the upstream dialog, slot, and history structure."
sections:
  Summary: "Connect existing conditional formats to the source Calc rule editor and manager, on the active sheet, with native Sfx responses and undo."
  Scope: "Connect the Format conditional-format actions and the original editor and manager. Support the conditional-format families already represented in the core, with native rule order, named styles and range assignments. Port the source document-function and undo boundaries needed for add, replace and remove. Preserve unrelated formats, sheet state and file workflows. Run the scheduled full application regression cycle after the focused feature checks."
  Plan: "Model source command selection, range and rule drafts, and manager result exchange. Port native document mutations and undo with the existing format list and attributed cells. Build browser dialogs including reference selection. Verify focused regressions and the scheduled full test cycle."
  Verify Steps: |-
    - Run focused conditional-format dialog, range, grid, history, and selected ODS/XLSX settings regressions. Include upstream UI cases for manager edit/delete, range changes, condition-type changes, dates and color scales as applicable.
    - Run changed-path lint and format, tooling and office TypeScript, Calc resources, provenance, dependency and file-size checks.
    - Run the regular full office, inventory, tooling and browser suites and the static build after the tenth task implementation. Record exit status and counts for each.
  Verification: |-
    Implementation is recorded in `448e6b30dcaf`. Test-only corrections are recorded in `81623a51659f`, `9d016043f`, `866b9595e`, and `cb3b6e4f1`.

    | Check | Result | Evidence |
    | --- | --- | --- |
    | Calc conditional-format Vitest suite | Pass | 5 tests for command dispatch, range picking, formula origin, manager drafts, Undo/Redo, and ODS/XLSX reopening. |
    | Calc generated UI resource tests and related print-area tests | Pass | 3 resource tests and 3 print-area tests. |
    | Changed-path Prettier and ESLint, Office and tooling TypeScript | Pass | Both type checks and all changed-path checks passed with the final test corrections. |
    | `npm run check:calc-resources`, `check:source-provenance`, `check:dependencies`, and `check:file-size` | Pass | Generated resources, file provenance, module boundaries, and line bounds passed. |
    | Formatting toolbar in Chromium on desktop and mobile | Pass | 2 scenarios cover command execution, rendered style, and accessibility. |
    | Production Vite build and static smoke | Pass | Relative assets, four JavaScript bundles, and no backend endpoints. |
    | Initial full Office coverage run | Interrupted, exit 130 | Calc XLSX tests exceeded the standard time limits under memory pressure. The full test restart ran without coverage. |
    | Full Office restart, `vitest run --maxWorkers 1 --testTimeout 600000` | Exit 1 | 33,792 passed and 2 failed in 2,233 files. The failed chart test reported a 10-second setup-hook timeout and passed with an extended hook timeout. The optional-icons test now reinstates the native UNO bootstrap after module reset and passed on the corrected revision. |
    | Full inventory, `npm run test:inventory:coverage` | Exit 1 | 117 passed and 13 failed in 38 files. The 9 timed-out cases subsequently passed on focused retries. The other 4 cases reproduce the same missing Writer parity marker in all registry scopes on baseline `b4398ddc1c6e`. |
    | Full tooling, `npm run test:tooling` | Exit 1 | 192 passed and 2 timed out in 47 files. Both compiler cases passed on the focused retry. |
    | Initial full Playwright run | Interrupted, exit 130 | 18 passed, 6 timed out, 1 interrupted and 588 did not run. The full restart uses one Chrome worker with extended assertion and test timeouts. |
    | Full Playwright restart | Exit 1 | 589 passed and 24 failed of 613 scenarios. All 22 Calc failures passed on the targeted rechecks. Both remaining Writer cases report the pre-existing row-alignment expectation mismatch. |
    | Corrected Calc Playwright tests | Pass | 32 focused scenarios passed, including all affected alignment and native fixture bootstrap cases. The alignment assertion now verifies the existing grid CSS. Isolated fixture bundles now initialize the real office service manager where needed. |
    | Standalone large-ODS responsiveness retest | Pass | The isolated run passed with a worst import tick gap of 88.9 ms against the existing 200 ms limit. The full run measured 262.7 ms under concurrent load. |

    The earlier targeted Clear and clipboard retries shared a Playwright artifact directory, which affected trace finalization. The recorded successful retries used separate output directories. Logs are under `output/calc-458SWH-*`. The targeted checks verify the implementation and the full checkpoint outcomes are recorded separately.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T12:05:07.606Z — VERIFY — ok

    By: CODER

    Note: Verified Calc conditional format authoring and the scoped regression tests. All 33,794 application and 128 Calc browser cases passed across the checkpoint and targeted retries. Four inventory cases and two browser cases retain pre-existing Writer evidence failures.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T12:05:06.780Z, excerpt_hash=sha256:1ccae7c0ddd59ead75a762a5b9a8f65a714dac1703851c9d35a308fe2bfac551

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json
    - old_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
    - current_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210659-458SWH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210659-458SWH
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-21T12:05:20.188Z — VERIFY — ok

    By: CODER

    Note: Verified Calc conditional format authoring and the scoped regression tests. All 33,794 application and 114 Calc browser cases passed across the checkpoint and targeted retries. Four inventory cases and two browser cases retain pre-existing Writer evidence failures.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T12:05:07.657Z, excerpt_hash=sha256:1ccae7c0ddd59ead75a762a5b9a8f65a714dac1703851c9d35a308fe2bfac551

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json
    - old_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
    - current_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210659-458SWH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611210659-458SWH --result verified-202611210659-458SWH --commit cb3b6e4f19bff4a9fbe194e77e663bbbe070a16b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-11-21T12:05:50.382Z — VERIFY — ok

    By: CODER

    Note: verified-202611210659-458SWH
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T12:05:20.238Z, excerpt_hash=sha256:1ccae7c0ddd59ead75a762a5b9a8f65a714dac1703851c9d35a308fe2bfac551

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json
    - old_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
    - current_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210659-458SWH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611210659-458SWH --result verified-202611210659-458SWH --commit a17430d99c047bddb4e82bb74d1cb0b4cfb9d943
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commits to restore the prior condition import and paint behavior and remove the newly exposed management commands."
  Findings: |-
    The implementation follows the pinned Calc condition slot routes, edit and manager ownership, conditional list and attributed cell associations, and undo command boundaries. The browser uses the worksheet's range selection and the existing Sfx dialog response lifecycle. The implemented rule families are cell comparisons, formulas, dates and two- or three-point color scales.

    The upstream quick editor wraps literal text in quotes without escaping embedded quotation marks. The port preserves this behavior and records it as CALC-792 in the Calc upstream suspected issues log.

    The tdf163897 regression repeats the upstream manager interactions with tdf105544.ods. The test reconstructs the archive without the unrelated database-range element so it reaches the conditional-format code in the existing importer. tdf119178 is covered through the browser's range picker and the resulting relative formula origin.

    The full inventory gate exposed an existing Writer parity evidence error. All four registry scopes report the missing `Color` marker in `apps/office/src/sw/browser/presentation/WriterBorderPage.tsx`. Running the same registry tests against clean baseline `b4398ddc1c6e` reproduced this error. Writer source and evidence are outside the conditional-format task scope.

    Both Writer viewport tests in `writer-native-cell-alignment.spec.ts` expect `safe flow-end`. The existing Writer renderer in `WriterEditableTable.tsx` sets `safe flex-end`, which Chromium reported in the full run. The assertion and the rendered value are present verbatim at baseline `b4398ddc1c6e`. The full Playwright run covers Writer regression evidence as part of the scheduled checkpoint.

    The full Calc browser run exposed legacy fixture setup errors. Tests that execute the native Office kernel in an isolated script now initialize the existing service manager where required. The grid alignment test now verifies the existing `flex-end` CSS value. The affected cases all passed in focused retries.
extensions:
  implementation_commit:
    hash: "cb3b6e4f19bff4a9fbe194e77e663bbbe070a16b"
    message: "🧩 458SWH test: initialize office services for isolated Calc browser fixtures"
id_source: "generated"
---
## Summary

Connect existing conditional formats to the source Calc rule editor and manager, on the active sheet, with native Sfx responses and undo.

## Scope

Connect the Format conditional-format actions and the original editor and manager. Support the conditional-format families already represented in the core, with native rule order, named styles and range assignments. Port the source document-function and undo boundaries needed for add, replace and remove. Preserve unrelated formats, sheet state and file workflows. Run the scheduled full application regression cycle after the focused feature checks.

## Plan

Model source command selection, range and rule drafts, and manager result exchange. Port native document mutations and undo with the existing format list and attributed cells. Build browser dialogs including reference selection. Verify focused regressions and the scheduled full test cycle.

## Verify Steps

- Run focused conditional-format dialog, range, grid, history, and selected ODS/XLSX settings regressions. Include upstream UI cases for manager edit/delete, range changes, condition-type changes, dates and color scales as applicable.
- Run changed-path lint and format, tooling and office TypeScript, Calc resources, provenance, dependency and file-size checks.
- Run the regular full office, inventory, tooling and browser suites and the static build after the tenth task implementation. Record exit status and counts for each.

## Verification

Implementation is recorded in `448e6b30dcaf`. Test-only corrections are recorded in `81623a51659f`, `9d016043f`, `866b9595e`, and `cb3b6e4f1`.

| Check | Result | Evidence |
| --- | --- | --- |
| Calc conditional-format Vitest suite | Pass | 5 tests for command dispatch, range picking, formula origin, manager drafts, Undo/Redo, and ODS/XLSX reopening. |
| Calc generated UI resource tests and related print-area tests | Pass | 3 resource tests and 3 print-area tests. |
| Changed-path Prettier and ESLint, Office and tooling TypeScript | Pass | Both type checks and all changed-path checks passed with the final test corrections. |
| `npm run check:calc-resources`, `check:source-provenance`, `check:dependencies`, and `check:file-size` | Pass | Generated resources, file provenance, module boundaries, and line bounds passed. |
| Formatting toolbar in Chromium on desktop and mobile | Pass | 2 scenarios cover command execution, rendered style, and accessibility. |
| Production Vite build and static smoke | Pass | Relative assets, four JavaScript bundles, and no backend endpoints. |
| Initial full Office coverage run | Interrupted, exit 130 | Calc XLSX tests exceeded the standard time limits under memory pressure. The full test restart ran without coverage. |
| Full Office restart, `vitest run --maxWorkers 1 --testTimeout 600000` | Exit 1 | 33,792 passed and 2 failed in 2,233 files. The failed chart test reported a 10-second setup-hook timeout and passed with an extended hook timeout. The optional-icons test now reinstates the native UNO bootstrap after module reset and passed on the corrected revision. |
| Full inventory, `npm run test:inventory:coverage` | Exit 1 | 117 passed and 13 failed in 38 files. The 9 timed-out cases subsequently passed on focused retries. The other 4 cases reproduce the same missing Writer parity marker in all registry scopes on baseline `b4398ddc1c6e`. |
| Full tooling, `npm run test:tooling` | Exit 1 | 192 passed and 2 timed out in 47 files. Both compiler cases passed on the focused retry. |
| Initial full Playwright run | Interrupted, exit 130 | 18 passed, 6 timed out, 1 interrupted and 588 did not run. The full restart uses one Chrome worker with extended assertion and test timeouts. |
| Full Playwright restart | Exit 1 | 589 passed and 24 failed of 613 scenarios. All 22 Calc failures passed on the targeted rechecks. Both remaining Writer cases report the pre-existing row-alignment expectation mismatch. |
| Corrected Calc Playwright tests | Pass | 32 focused scenarios passed, including all affected alignment and native fixture bootstrap cases. The alignment assertion now verifies the existing grid CSS. Isolated fixture bundles now initialize the real office service manager where needed. |
| Standalone large-ODS responsiveness retest | Pass | The isolated run passed with a worst import tick gap of 88.9 ms against the existing 200 ms limit. The full run measured 262.7 ms under concurrent load. |

The earlier targeted Clear and clipboard retries shared a Playwright artifact directory, which affected trace finalization. The recorded successful retries used separate output directories. Logs are under `output/calc-458SWH-*`. The targeted checks verify the implementation and the full checkpoint outcomes are recorded separately.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T12:05:07.606Z — VERIFY — ok

By: CODER

Note: Verified Calc conditional format authoring and the scoped regression tests. All 33,794 application and 128 Calc browser cases passed across the checkpoint and targeted retries. Four inventory cases and two browser cases retain pre-existing Writer evidence failures.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T12:05:06.780Z, excerpt_hash=sha256:1ccae7c0ddd59ead75a762a5b9a8f65a714dac1703851c9d35a308fe2bfac551

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json
- old_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
- current_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210659-458SWH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210659-458SWH
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-21T12:05:20.188Z — VERIFY — ok

By: CODER

Note: Verified Calc conditional format authoring and the scoped regression tests. All 33,794 application and 114 Calc browser cases passed across the checkpoint and targeted retries. Four inventory cases and two browser cases retain pre-existing Writer evidence failures.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T12:05:07.657Z, excerpt_hash=sha256:1ccae7c0ddd59ead75a762a5b9a8f65a714dac1703851c9d35a308fe2bfac551

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json
- old_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
- current_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210659-458SWH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611210659-458SWH --result verified-202611210659-458SWH --commit cb3b6e4f19bff4a9fbe194e77e663bbbe070a16b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-11-21T12:05:50.382Z — VERIFY — ok

By: CODER

Note: verified-202611210659-458SWH
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T12:05:20.238Z, excerpt_hash=sha256:1ccae7c0ddd59ead75a762a5b9a8f65a714dac1703851c9d35a308fe2bfac551

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210659-458SWH/blueprint/resolved-snapshot.json
- old_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
- current_digest: b058b5a0b23a3dc978c6d0b25384bd398adbc7e0e37554b3ee5920fba6fe6fd7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210659-458SWH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611210659-458SWH --result verified-202611210659-458SWH --commit a17430d99c047bddb4e82bb74d1cb0b4cfb9d943
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commits to restore the prior condition import and paint behavior and remove the newly exposed management commands.

## Findings

The implementation follows the pinned Calc condition slot routes, edit and manager ownership, conditional list and attributed cell associations, and undo command boundaries. The browser uses the worksheet's range selection and the existing Sfx dialog response lifecycle. The implemented rule families are cell comparisons, formulas, dates and two- or three-point color scales.

The upstream quick editor wraps literal text in quotes without escaping embedded quotation marks. The port preserves this behavior and records it as CALC-792 in the Calc upstream suspected issues log.

The tdf163897 regression repeats the upstream manager interactions with tdf105544.ods. The test reconstructs the archive without the unrelated database-range element so it reaches the conditional-format code in the existing importer. tdf119178 is covered through the browser's range picker and the resulting relative formula origin.

The full inventory gate exposed an existing Writer parity evidence error. All four registry scopes report the missing `Color` marker in `apps/office/src/sw/browser/presentation/WriterBorderPage.tsx`. Running the same registry tests against clean baseline `b4398ddc1c6e` reproduced this error. Writer source and evidence are outside the conditional-format task scope.

Both Writer viewport tests in `writer-native-cell-alignment.spec.ts` expect `safe flow-end`. The existing Writer renderer in `WriterEditableTable.tsx` sets `safe flex-end`, which Chromium reported in the full run. The assertion and the rendered value are present verbatim at baseline `b4398ddc1c6e`. The full Playwright run covers Writer regression evidence as part of the scheduled checkpoint.

The full Calc browser run exposed legacy fixture setup errors. Tests that execute the native Office kernel in an isolated script now initialize the existing service manager where required. The grid alignment test now verifies the existing `flex-end` CSS value. The affected cases all passed in focused retries.
