---
id: "202610210117-DRAYC7"
title: "Implement native Calc visible-row and visible-column selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
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
  state: "rework"
  updated_at: "2026-10-21T01:36:05.156Z"
  updated_by: "EVALUATOR"
  note: "Final log audit found an unpassed required JSDoc gate in the new test helper;the earlier pass is superseded."
  evaluated_sha: "11d5d6b68a72010c16b7fa3d7396a9a2842d3f7c"
  blueprint_digest: "cee5fbd36ffe1ea5599fbae22551ed39445eeaca90cd91ead9513f6563551549"
  evidence_refs:
    - ".agentplane/tasks/202610210117-DRAYC7/README.md"
    - ".agentplane/tasks/202610210117-DRAYC7/quality/20261021-013605156-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610210117-DRAYC7/quality/20261021-013605156-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610210117-DRAYC7/quality/20261021-013605156-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610210117-DRAYC7/blueprint/resolved-snapshot.json"
    - "output/playwright/task62-jsdoc.log"
  findings:
    - "task62-jsdoc.log reports visible-selection.test.ts line168 missing function JSDoc. Earlier command chaining preserved the failed log but returned the later command status;the pass summary incorrectly assumed this gate succeeded. Fix the in-scope test annotation,prove emitted test/runtime behavior unchanged,recheck docs and focused tests,and refresh evidence before fresh quality review."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved original visible-axis selection commands and real Writer-style menu consumers in calc only."
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
doc_version: 3
doc_updated_at: "2026-10-21T01:41:22.687Z"
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
