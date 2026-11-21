---
id: "202611210412-B3P0ZB"
title: "Connect persisted Calc outline symbols and sheet tab visibility"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202611201413-9GPC0D"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:13:40.274Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T04:41:36.382Z"
  updated_by: "CODER"
  note: "All 98 affected Calc cases passed across the first run and isolated replay. The installed Chrome passed both workbook exports. Type checks, build, and static gates passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T04:41:37.472Z"
  updated_by: "EVALUATOR"
  note: "Verified native Calc outline and sheet tab view ownership across the workspace and both file formats."
  evaluated_sha: "1bf93878fff42b94804645f4656eef0bdbda58eb"
  blueprint_digest: "c37ae1f748fb3f4cf38468f2affe27af08aa4b544fa992d203b5cbd47066e859"
  evidence_refs:
    - ".agentplane/tasks/202611210412-B3P0ZB/README.md"
    - ".agentplane/tasks/202611210412-B3P0ZB/quality/20261121-044137472-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210412-B3P0ZB/quality/20261121-044137472-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210412-B3P0ZB/quality/20261121-044137472-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210412-B3P0ZB/blueprint/resolved-snapshot.json"
    - "output/calc-B3P0ZB-verification.md"
    - "output/calc-B3P0ZB-browser.log"
  findings:
    - "Both booleans retain native Excel precedence and ODF property names. Mounted Calc hides only the controls while keyboard navigation and group data remain available."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-21T04:14:01.519Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T04:41:36.382Z"
    author: "CODER"
    state: "ok"
    note: "All 98 affected Calc cases passed across the first run and isolated replay. The installed Chrome passed both workbook exports. Type checks, build, and static gates passed."
doc_version: 3
doc_updated_at: "2026-11-21T04:41:36.433Z"
doc_updated_by: "CODER"
description: "Apply the native outline symbol and sheet tab visibility settings across desktop ODS and XLSX view import/export, worker transport, and the mounted Calc workspace. Preserve grouping data and sheet shortcuts when controls are hidden."
sections:
  Summary: "Connect the original outline symbol and sheet tabs visibility to the mounted Calc workspace and document view settings."
  Scope: "Use ScViewOptions ownership. Carry IsOutlineSymbolsSet and HasSheetTabs through ODS, XLSX and the Calc Worker. XLSX uses the active sheet’s first view and the first workbook view. Keep grouped ranges, independent sheet selection, keyboard navigation and native defaults for absent settings. Adapt the existing tab strip and outline panels without changing save/open policy."
  Plan: "Wire native outline and sheet-tab flags through ODS, XLSX, Worker and workbench, and verify the native defaults and view precedence."
  Verify Steps: |-
    - Run targeted Calc tests for viewdata.settings, Calc view options, the outline window and sheet tab dialogs.
    - Run office and tools TypeScript checks.
    - Run changed-file lint and formatting, Calc resources and source provenance, authored file size and git whitespace checks.
  Verification: |-
    - Command: `npm run test:calc -- viewdata.settings calc-view-options calc-outline-window calc-sheet-tab-dialogs excelfilter ods-worker-runtime --maxWorkers 2 --testTimeout 120000`. Result: 95 passed in the first run, with three 120-second timeouts and zero assertion failures. Scope: 98 targeted Calc workbook, view, filter, and Worker cases.
    - Command: `npm run test:calc -- src/sc/source/filter/oox/excelfilter.test.ts src/sc/source/filter/oox/excelfilter.page-settings.test.ts src/sc/source/filter/oox/excelfilter.theme.test.ts -t 'escaped Unicode fixture|preserves independent physical and print flags|writes all source CalcThemeTest palette entries' --maxWorkers 1 --testTimeout 600000`. Result: all three timed-out cases passed in 39.52 seconds on retry. Evidence: output/calc-B3P0ZB-tests.log and output/calc-B3P0ZB-timeout-replay.log.
    - Command: `npm run typecheck:tools` and `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Scope: tools and office TypeScript.
    - Command: `vite build --outDir ../../output/calc-B3P0ZB-dist` and the two affected Playwright scenarios using the installed Chrome channel. Result: pass. Evidence: both active sheet export and hidden worksheet export passed. Scope: production Calc package and browser file handling. Logs: output/calc-B3P0ZB-build.log and output/calc-B3P0ZB-browser.log.
    - Command: Calc resource, source provenance and authored file size gates, changed-path ESLint and Prettier, and `git show --check 1bf93878f`. Result: pass. Evidence: 464 commands and 2,911 runtime modules checked. Scope: final patch and source registry.
    - Command: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Scope: local AgentPlane workflow. Doctor produced its existing managed shim warning.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T04:41:36.382Z — VERIFY — ok

    By: CODER

    Note: All 98 affected Calc cases passed across the first run and isolated replay. The installed Chrome passed both workbook exports. Type checks, build, and static gates passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:41:35.796Z, excerpt_hash=sha256:f96f125f6715d1ceb98baf8022b8411521bfda96b67d96f5aded55b675b93a4b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210412-B3P0ZB/blueprint/resolved-snapshot.json
    - old_digest: c37ae1f748fb3f4cf38468f2affe27af08aa4b544fa992d203b5cbd47066e859
    - current_digest: c37ae1f748fb3f4cf38468f2affe27af08aa4b544fa992d203b5cbd47066e859
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210412-B3P0ZB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210412-B3P0ZB
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit to restore the prior persisted option set."
  Findings: "LibreOffice sources HasSheetTabs from the first workbook view and IsOutlineSymbolsSet from the active sheet’s first worksheet view. Both default to true. ODF stores both in the primary view sequence. Hiding the sheet tab bar does not change active or selected sheets and hiding outline symbols does not change group membership. The existing CALC-743 ShowFormulas behavior was retained. No dedicated upstream regression for these two UI flags was found in the pinned Calc tests."
id_source: "generated"
---
## Summary

Connect the original outline symbol and sheet tabs visibility to the mounted Calc workspace and document view settings.

## Scope

Use ScViewOptions ownership. Carry IsOutlineSymbolsSet and HasSheetTabs through ODS, XLSX and the Calc Worker. XLSX uses the active sheet’s first view and the first workbook view. Keep grouped ranges, independent sheet selection, keyboard navigation and native defaults for absent settings. Adapt the existing tab strip and outline panels without changing save/open policy.

## Plan

Wire native outline and sheet-tab flags through ODS, XLSX, Worker and workbench, and verify the native defaults and view precedence.

## Verify Steps

- Run targeted Calc tests for viewdata.settings, Calc view options, the outline window and sheet tab dialogs.
- Run office and tools TypeScript checks.
- Run changed-file lint and formatting, Calc resources and source provenance, authored file size and git whitespace checks.

## Verification

- Command: `npm run test:calc -- viewdata.settings calc-view-options calc-outline-window calc-sheet-tab-dialogs excelfilter ods-worker-runtime --maxWorkers 2 --testTimeout 120000`. Result: 95 passed in the first run, with three 120-second timeouts and zero assertion failures. Scope: 98 targeted Calc workbook, view, filter, and Worker cases.
- Command: `npm run test:calc -- src/sc/source/filter/oox/excelfilter.test.ts src/sc/source/filter/oox/excelfilter.page-settings.test.ts src/sc/source/filter/oox/excelfilter.theme.test.ts -t 'escaped Unicode fixture|preserves independent physical and print flags|writes all source CalcThemeTest palette entries' --maxWorkers 1 --testTimeout 600000`. Result: all three timed-out cases passed in 39.52 seconds on retry. Evidence: output/calc-B3P0ZB-tests.log and output/calc-B3P0ZB-timeout-replay.log.
- Command: `npm run typecheck:tools` and `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Scope: tools and office TypeScript.
- Command: `vite build --outDir ../../output/calc-B3P0ZB-dist` and the two affected Playwright scenarios using the installed Chrome channel. Result: pass. Evidence: both active sheet export and hidden worksheet export passed. Scope: production Calc package and browser file handling. Logs: output/calc-B3P0ZB-build.log and output/calc-B3P0ZB-browser.log.
- Command: Calc resource, source provenance and authored file size gates, changed-path ESLint and Prettier, and `git show --check 1bf93878f`. Result: pass. Evidence: 464 commands and 2,911 runtime modules checked. Scope: final patch and source registry.
- Command: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Scope: local AgentPlane workflow. Doctor produced its existing managed shim warning.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T04:41:36.382Z — VERIFY — ok

By: CODER

Note: All 98 affected Calc cases passed across the first run and isolated replay. The installed Chrome passed both workbook exports. Type checks, build, and static gates passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:41:35.796Z, excerpt_hash=sha256:f96f125f6715d1ceb98baf8022b8411521bfda96b67d96f5aded55b675b93a4b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210412-B3P0ZB/blueprint/resolved-snapshot.json
- old_digest: c37ae1f748fb3f4cf38468f2affe27af08aa4b544fa992d203b5cbd47066e859
- current_digest: c37ae1f748fb3f4cf38468f2affe27af08aa4b544fa992d203b5cbd47066e859
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210412-B3P0ZB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210412-B3P0ZB
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit to restore the prior persisted option set.

## Findings

LibreOffice sources HasSheetTabs from the first workbook view and IsOutlineSymbolsSet from the active sheet’s first worksheet view. Both default to true. ODF stores both in the primary view sequence. Hiding the sheet tab bar does not change active or selected sheets and hiding outline symbols does not change group membership. The existing CALC-743 ShowFormulas behavior was retained. No dedicated upstream regression for these two UI flags was found in the pinned Calc tests.
