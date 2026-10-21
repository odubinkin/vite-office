---
id: "202610210117-DRAYC7"
title: "Implement native Calc visible-row and visible-column selection"
result_summary: "Implemented native visible-row/column selection through shared Writer menus with source group-wide subtraction,real formatting/undo/ODS consumers and complete Calc coverage;repaired JSDoc and verified every mandatory gate."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc -- --maxWorkers=1"
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T01:17:37.730Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T01:41:22.597Z"
  updated_by: "CODER"
  note: "Accepted after rework:551Calc/34common-Writer tests and130owners100percent retained;14focused tests repeat after JSDoc-only byte-identical-JS repair. All10mandatory gates individually exit0,including docs and production build. Unmodified130runtime source hashes match full acceptance. Portable audit validates92raw artifacts/140source pins/9native pins;prior failed logs and superseded reviews preserved."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-21T01:41:24.903Z"
  updated_by: "EVALUATOR"
  note: "Fresh review supersedes the earlier pass/rework:visible-axis selection and all required verification gates now have complete accepted evidence."
  evaluated_sha: "33f9a8e9b3198df3a88a12f0ea89c2b30be3e913"
  blueprint_digest: "cee5fbd36ffe1ea5599fbae22551ed39445eeaca90cd91ead9513f6563551549"
  evidence_refs:
    - ".agentplane/tasks/202610210117-DRAYC7/README.md"
    - ".agentplane/tasks/202610210117-DRAYC7/quality/20261021-014124903-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610210117-DRAYC7/quality/20261021-014124903-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610210117-DRAYC7/quality/20261021-014124903-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610210117-DRAYC7/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610210117-DRAYC7/evidence/acceptance.json"
    - ".agentplane/tasks/202610210117-DRAYC7/evidence/audit.mjs"
    - "output/playwright/task62-audit-accepted.log"
    - "output/playwright/task62-gate-exits.json"
    - "output/playwright/task62-test-emission-proof.log"
  findings:
    - "Compared original cellsh1 cases with real ScCellShell/ScMarkData owners:captured bounds,group-wide hidden-span subtraction,unclamped endpoints,conditional reset and simple reduction match source. Actual formatting,undo/redo,ODS and shared Writer menu routes pass.551Calc/34related tests pass with130owners100percent. JSDoc-only test repair has byte-identical emitted JS and unchanged130runtime source hashes;14focused tests repeat. Ten independent gate statuses are all0,including required JSDoc/registry/build;source lint/format/routing/doctor pass. Raw JSDoc failure and observer ENOBUFS evidence and superseded reviews remain retained. No threshold/exclusion/counter changes. Existing row-label text highlight remains a separate broader browser-parity followup;no complete UI/core parity claim."
commit:
  hash: "33f9a8e9b3198df3a88a12f0ea89c2b30be3e913"
  message: "🧩 DRAYC7 tests: attach weight helper documentation to arrow"
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved original visible-axis selection commands and real Writer-style menu consumers in calc only."
  -
    author: "CODER"
    body: "Verified: Original visible-row and visible-column selection uses real marks and shared Writer menus.551Calc/34related tests pass;130owners100percent;14focused repair tests and all10mandatory gates pass. JSDoc repair emits identicalJS;raw failures,source pins,desktop/mobile proof and superseded reviews are retained."
events:
  -
    type: "status"
    at: "2026-10-21T01:17:48.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved original visible-axis selection commands and real Writer-style menu consumers in calc only."
  -
    type: "verify"
    at: "2026-10-21T01:34:19.412Z"
    author: "CODER"
    state: "ok"
    note: "All551 Calc tests/130owners100percent;34common-menu/Writer tests pass. Native hidden-span/grouped/disjoint/filter and formatting/undo/ODS behavior verified. Types,lint,format,source/resource/registry/build/static/routing/doctor gates pass. Real desktop/mobile menu flows accepted;portable audit pins140sources/9native inputs and63raw artifacts. Full all-app next70."
  -
    type: "verify"
    at: "2026-10-21T01:36:06.425Z"
    author: "CODER"
    state: "needs_rework"
    note: "Rework: required JSDoc gate failed in a new test helper;prior pass superseded pending annotation repair and refreshed evidence."
  -
    type: "verify"
    at: "2026-10-21T01:41:22.597Z"
    author: "CODER"
    state: "ok"
    note: "Accepted after rework:551Calc/34common-Writer tests and130owners100percent retained;14focused tests repeat after JSDoc-only byte-identical-JS repair. All10mandatory gates individually exit0,including docs and production build. Unmodified130runtime source hashes match full acceptance. Portable audit validates92raw artifacts/140source pins/9native pins;prior failed logs and superseded reviews preserved."
  -
    type: "status"
    at: "2026-10-21T01:42:24.874Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Original visible-row and visible-column selection uses real marks and shared Writer menus.551Calc/34related tests pass;130owners100percent;14focused repair tests and all10mandatory gates pass. JSDoc repair emits identicalJS;raw failures,source pins,desktop/mobile proof and superseded reviews are retained."
doc_version: 3
doc_updated_at: "2026-10-21T01:42:24.876Z"
doc_updated_by: "CODER"
description: "Block62: port source SID_SELECT_VISIBLE_ROWS/COLUMNS behavior into actual ScCellShell/ScMarkData owners and existing Writer menu dispatch. Preserve group-wide subtraction,hidden-span endpoints,MarkToMulti/MarkToSimple and native reset rules. Validate disjoint selections,grouped sheets,pending input and actual formatting/undo consumers;all Calc100 and related tests. Only calc checkout/branch;full all-app next70."
sections:
  Summary: |-
    Implement native Calc visible-row and visible-column selection

    Block62: port source SID_SELECT_VISIBLE_ROWS/COLUMNS behavior into actual ScCellShell/ScMarkData owners and existing Writer menu dispatch. Preserve group-wide subtraction,hidden-span endpoints,MarkToMulti/MarkToSimple and native reset rules. Validate disjoint selections,grouped sheets,pending input and actual formatting/undo consumers;all Calc100 and related tests. Only calc checkout/branch;full all-app next70.
  Scope: "Actual cellsh1.cxx visible-row/column dispatch cases in existing ScCellShell owner,Calc browser controller and SDI bindings;existing shared Writer Edit Select menus. Up to16 source/test/browser files plus registry/provenance/docs/task evidence. Preserve original typed-store marks and segmented hide state;no browser selection copy or invented protection/ref/device services. Only calc checkout and branch,no network/global access or merging."
  Plan: "Port both original cell-shell visible selection cases against actual ScViewData/ScDocument/ScMarkData. Preserve original reference bounds,hidden-run endpoints,selected-sheet iteration,changed/reset logic and MarkToSimple. Bind genuine slot IDs through pinned SID_NEW_SLOTS arithmetic and existing shared Writer menu dispatch. Browser admits current input and publishes actual marks. Test ordinary/disjoint/grouped/all-hidden/unmarked/stale area behavior and formatting/undo/ODS consumers. Record suspicious source behavior without repair. All Calc100,related shared consumers,types/source lint/format/source/resource/registry/build/static gates and actual desktop/mobile browser acceptance. Archive immutable reports/source/native pins;quality pass and clean close. Full all-app next70."
  Verify Steps: "All Calc tests and unchanged100percent Istanbul gate. Native row/column subtraction cases with middle,leading,trailing,fully hidden and disjoint marks;grouped sheets with different hiding;filtered versus manually hidden spans;unmarked and retained native multi-area state;cursor/sheet/content/history invariants. Actual shared Edit Select menu and pending input admission;formatting/undo and ODS roundtrip of actual selected cells. Related shared menu tests. Source lint/format,tools/app types,module boundaries,docs,size,source-tree,writer/calc resources,registry,provenance,routing,doctor,production build/static. Actual Chromium desktop/mobile visible-selection flow. Preserve raw failures/results and source/native hashes;portable audit,evaluator pass,clean close. Next complete all-app checkpoint70."
  Verification: |-
    Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task62-calc-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task62-calc-results.json. Result: pass,exit0;551tests/166files,130owners,S10881/B6759/F2011/L9769,all100percent. Scope: all Calc and actual hidden/grouped/disjoint/filter/formatting/undo/ODS consumers. Related common menu/saved focus/WriterMenuBar tests:34pass. JSDoc-only repair:14focused tests pass;actual TypeScript emission byte-identical and all130runtime source hashes unchanged from the full Calc acceptance. Evidence:task62-test-emission-proof.log,task62-repair-results.json. Command: node output/playwright/task62-accepted-gates.mjs. Result: pass;task62-gate-exits.json records exit0 individually for tools types,dependencies,JSDoc,size,tree,provenance,registry,writer/calc resources and production build/static including app types. Source eslint/prettier,routing,doctor pass;existing advisories/hook-shim warning only. Browser: actual production preview4176 through installed Playwright CLI at1280/390px;hidden-row/column shared menus and grid focus accepted. Immutable raw archive preserves initial failed logs and superseded quality reviews. Full all-app checkpoint next70.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T01:41:22.597Z — VERIFY — ok

    By: CODER

    Note: Accepted after rework:551Calc/34common-Writer tests and130owners100percent retained;14focused tests repeat after JSDoc-only byte-identical-JS repair. All10mandatory gates individually exit0,including docs and production build. Unmodified130runtime source hashes match full acceptance. Portable audit validates92raw artifacts/140source pins/9native pins;prior failed logs and superseded reviews preserved.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:39:52.099Z, excerpt_hash=sha256:1a43486d9bc31e7e7019baff6ef44881279b09566860a16b4f4317e43d5ea539

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210117-DRAYC7/blueprint/resolved-snapshot.json
    - old_digest: cee5fbd36ffe1ea5599fbae22551ed39445eeaca90cd91ead9513f6563551549
    - current_digest: cee5fbd36ffe1ea5599fbae22551ed39445eeaca90cd91ead9513f6563551549
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610210117-DRAYC7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610210117-DRAYC7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task source/metadata commits,retaining evidence;do not reset user history,merge branches or alter unrelated tasks."
  Findings: "Initial owner test used Which103 instead of original ATTR_FONT_WEIGHT102;the corrected test imports the actual constant and production behavior was already correct. Final log audit then found a failed required JSDoc annotation on that test helper that had been missed by shell command chaining. The earlier quality pass is superseded by the retained rework review. Moved the annotation to the actual arrow function;TypeScript emission is byte-identical and all130runtime source hashes match the accepted551-test100percent run. All14focused tests repeat successfully. A first gate-collection observer hit spawnSync ENOBUFS on the6.2MB registry report;retained that truncated log/exit and changed only observation to direct file descriptors. All10declared static/source/resource/build gates now have separately recorded exit0. No timeout,threshold,exclusion or coverage counters changed. Native group-wide common marks,unclamped hidden spans,retained multi bounds and separate hidden/filter owners remain unchanged. Actual1280/390px screenshots inspected;favicon404 is the only browser console resource error. Blue row-label text highlight after Shift-click remains a broader existing grid-interaction observation for a later block;complete browser/native parity is unclaimed. No new suspected upstream defect established;no publication or merging."
id_source: "generated"
---
## Summary

Implement native Calc visible-row and visible-column selection

Block62: port source SID_SELECT_VISIBLE_ROWS/COLUMNS behavior into actual ScCellShell/ScMarkData owners and existing Writer menu dispatch. Preserve group-wide subtraction,hidden-span endpoints,MarkToMulti/MarkToSimple and native reset rules. Validate disjoint selections,grouped sheets,pending input and actual formatting/undo consumers;all Calc100 and related tests. Only calc checkout/branch;full all-app next70.

## Scope

Actual cellsh1.cxx visible-row/column dispatch cases in existing ScCellShell owner,Calc browser controller and SDI bindings;existing shared Writer Edit Select menus. Up to16 source/test/browser files plus registry/provenance/docs/task evidence. Preserve original typed-store marks and segmented hide state;no browser selection copy or invented protection/ref/device services. Only calc checkout and branch,no network/global access or merging.

## Plan

Port both original cell-shell visible selection cases against actual ScViewData/ScDocument/ScMarkData. Preserve original reference bounds,hidden-run endpoints,selected-sheet iteration,changed/reset logic and MarkToSimple. Bind genuine slot IDs through pinned SID_NEW_SLOTS arithmetic and existing shared Writer menu dispatch. Browser admits current input and publishes actual marks. Test ordinary/disjoint/grouped/all-hidden/unmarked/stale area behavior and formatting/undo/ODS consumers. Record suspicious source behavior without repair. All Calc100,related shared consumers,types/source lint/format/source/resource/registry/build/static gates and actual desktop/mobile browser acceptance. Archive immutable reports/source/native pins;quality pass and clean close. Full all-app next70.

## Verify Steps

All Calc tests and unchanged100percent Istanbul gate. Native row/column subtraction cases with middle,leading,trailing,fully hidden and disjoint marks;grouped sheets with different hiding;filtered versus manually hidden spans;unmarked and retained native multi-area state;cursor/sheet/content/history invariants. Actual shared Edit Select menu and pending input admission;formatting/undo and ODS roundtrip of actual selected cells. Related shared menu tests. Source lint/format,tools/app types,module boundaries,docs,size,source-tree,writer/calc resources,registry,provenance,routing,doctor,production build/static. Actual Chromium desktop/mobile visible-selection flow. Preserve raw failures/results and source/native hashes;portable audit,evaluator pass,clean close. Next complete all-app checkpoint70.

## Verification

Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task62-calc-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task62-calc-results.json. Result: pass,exit0;551tests/166files,130owners,S10881/B6759/F2011/L9769,all100percent. Scope: all Calc and actual hidden/grouped/disjoint/filter/formatting/undo/ODS consumers. Related common menu/saved focus/WriterMenuBar tests:34pass. JSDoc-only repair:14focused tests pass;actual TypeScript emission byte-identical and all130runtime source hashes unchanged from the full Calc acceptance. Evidence:task62-test-emission-proof.log,task62-repair-results.json. Command: node output/playwright/task62-accepted-gates.mjs. Result: pass;task62-gate-exits.json records exit0 individually for tools types,dependencies,JSDoc,size,tree,provenance,registry,writer/calc resources and production build/static including app types. Source eslint/prettier,routing,doctor pass;existing advisories/hook-shim warning only. Browser: actual production preview4176 through installed Playwright CLI at1280/390px;hidden-row/column shared menus and grid focus accepted. Immutable raw archive preserves initial failed logs and superseded quality reviews. Full all-app checkpoint next70.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T01:41:22.597Z — VERIFY — ok

By: CODER

Note: Accepted after rework:551Calc/34common-Writer tests and130owners100percent retained;14focused tests repeat after JSDoc-only byte-identical-JS repair. All10mandatory gates individually exit0,including docs and production build. Unmodified130runtime source hashes match full acceptance. Portable audit validates92raw artifacts/140source pins/9native pins;prior failed logs and superseded reviews preserved.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:39:52.099Z, excerpt_hash=sha256:1a43486d9bc31e7e7019baff6ef44881279b09566860a16b4f4317e43d5ea539

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210117-DRAYC7/blueprint/resolved-snapshot.json
- old_digest: cee5fbd36ffe1ea5599fbae22551ed39445eeaca90cd91ead9513f6563551549
- current_digest: cee5fbd36ffe1ea5599fbae22551ed39445eeaca90cd91ead9513f6563551549
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610210117-DRAYC7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610210117-DRAYC7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task source/metadata commits,retaining evidence;do not reset user history,merge branches or alter unrelated tasks.

## Findings

Initial owner test used Which103 instead of original ATTR_FONT_WEIGHT102;the corrected test imports the actual constant and production behavior was already correct. Final log audit then found a failed required JSDoc annotation on that test helper that had been missed by shell command chaining. The earlier quality pass is superseded by the retained rework review. Moved the annotation to the actual arrow function;TypeScript emission is byte-identical and all130runtime source hashes match the accepted551-test100percent run. All14focused tests repeat successfully. A first gate-collection observer hit spawnSync ENOBUFS on the6.2MB registry report;retained that truncated log/exit and changed only observation to direct file descriptors. All10declared static/source/resource/build gates now have separately recorded exit0. No timeout,threshold,exclusion or coverage counters changed. Native group-wide common marks,unclamped hidden spans,retained multi bounds and separate hidden/filter owners remain unchanged. Actual1280/390px screenshots inspected;favicon404 is the only browser console resource error. Blue row-label text highlight after Shift-click remains a broader existing grid-interaction observation for a later block;complete browser/native parity is unclaimed. No new suspected upstream defect established;no publication or merging.
