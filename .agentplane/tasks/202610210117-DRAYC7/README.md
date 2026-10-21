---
id: "202610210117-DRAYC7"
title: "Implement native Calc visible-row and visible-column selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-10-21T01:33:29.306Z"
doc_updated_by: "CODER"
description: "Block62: port source SID_SELECT_VISIBLE_ROWS/COLUMNS behavior into actual ScCellShell/ScMarkData owners and existing Writer menu dispatch. Preserve group-wide subtraction,hidden-span endpoints,MarkToMulti/MarkToSimple and native reset rules. Validate disjoint selections,grouped sheets,pending input and actual formatting/undo consumers;all Calc100 and related tests. Only calc checkout/branch;full all-app next70."
sections:
  Summary: |-
    Implement native Calc visible-row and visible-column selection

    Block62: port source SID_SELECT_VISIBLE_ROWS/COLUMNS behavior into actual ScCellShell/ScMarkData owners and existing Writer menu dispatch. Preserve group-wide subtraction,hidden-span endpoints,MarkToMulti/MarkToSimple and native reset rules. Validate disjoint selections,grouped sheets,pending input and actual formatting/undo consumers;all Calc100 and related tests. Only calc checkout/branch;full all-app next70.
  Scope: "Actual cellsh1.cxx visible-row/column dispatch cases in existing ScCellShell owner,Calc browser controller and SDI bindings;existing shared Writer Edit Select menus. Up to16 source/test/browser files plus registry/provenance/docs/task evidence. Preserve original typed-store marks and segmented hide state;no browser selection copy or invented protection/ref/device services. Only calc checkout and branch,no network/global access or merging."
  Plan: "Port both original cell-shell visible selection cases against actual ScViewData/ScDocument/ScMarkData. Preserve original reference bounds,hidden-run endpoints,selected-sheet iteration,changed/reset logic and MarkToSimple. Bind genuine slot IDs through pinned SID_NEW_SLOTS arithmetic and existing shared Writer menu dispatch. Browser admits current input and publishes actual marks. Test ordinary/disjoint/grouped/all-hidden/unmarked/stale area behavior and formatting/undo/ODS consumers. Record suspicious source behavior without repair. All Calc100,related shared consumers,types/source lint/format/source/resource/registry/build/static gates and actual desktop/mobile browser acceptance. Archive immutable reports/source/native pins;quality pass and clean close. Full all-app next70."
  Verify Steps: "All Calc tests and unchanged100percent Istanbul gate. Native row/column subtraction cases with middle,leading,trailing,fully hidden and disjoint marks;grouped sheets with different hiding;filtered versus manually hidden spans;unmarked and retained native multi-area state;cursor/sheet/content/history invariants. Actual shared Edit Select menu and pending input admission;formatting/undo and ODS roundtrip of actual selected cells. Related shared menu tests. Source lint/format,tools/app types,module boundaries,docs,size,source-tree,writer/calc resources,registry,provenance,routing,doctor,production build/static. Actual Chromium desktop/mobile visible-selection flow. Preserve raw failures/results and source/native hashes;portable audit,evaluator pass,clean close. Next complete all-app checkpoint70."
  Verification: "Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task62-calc-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task62-calc-results.json. Result: pass,exit0. Evidence:551tests/166files;130owners;S10881/B6759/F2011/L9769,all100percent. Scope: all Calc tests and runtime coverage,including visible-selection,grouped/disjoint marks,hidden/filtered distinction,actual formatting/undo and ODS roundtrip. Command(apps/office): node ../../node_modules/vitest/vitest.mjs run src/framework/browser/presentation/CommandMenuBar.test.tsx src/framework/browser/presentation/CommandMenuBar-saved-focus.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx --maxWorkers=1 --reporter=default --reporter=json --outputFile=../../output/playwright/task62-related-results.json. Result: pass,34tests. Scope: actual shared/Writer menu focus consumers;no shared runtime mutation in this block. Commands: npm run typecheck;source-scoped eslint/prettier;dependencies,docs,size,source-tree,provenance,registry,writer/calc resources,routing,doctor;production build/static. Result: pass;existing decomposition/build advisories and hook-shim readiness warning only. Browser: actual production preview4176 with installed Playwright CLI,desktop hidden-row and mobile hidden-column selection through shared menus;raw snapshots/screens retained. Native group-wide common selection and unclamped hidden-span endpoints remain source behavior. Full all-app checkpoint next70."
  Rollback Plan: "Revert only task source/metadata commits,retaining evidence;do not reset user history,merge branches or alter unrelated tasks."
  Findings: "Initial owner test used numeric Which103 for a weight item and failed before its ODS check;source inspection confirms original ATTR_FONT_WEIGHT=102. The test now imports that actual source constant;production behavior was already correct. All551 Calc tests/130 owners now100percent with original thresholds/exclusions unchanged. No shared runtime owner changes;34common-menu/Writer tests pass. Native grouped-sheet common subtraction,unclamped hidden-tail bounds and retained unmarked multi-area state are preserved,not normalized. Filtered-only and hidden flags remain separate original owners. Source cellsh1 cases are implemented in the existing single ScCellShell TS owner with explicit provenance. Actual1280/390px screenshots inspected;favicon404 is the only browser console resource error. A blue row-label text highlight after Shift-click is a separate existing grid-interaction observation to inspect before broad browser parity certification;this block certifies source visible-selection commands and actual menu routing only. No new suspected upstream defect established;no external publication or branch merge."
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

Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task62-calc-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task62-calc-results.json. Result: pass,exit0. Evidence:551tests/166files;130owners;S10881/B6759/F2011/L9769,all100percent. Scope: all Calc tests and runtime coverage,including visible-selection,grouped/disjoint marks,hidden/filtered distinction,actual formatting/undo and ODS roundtrip. Command(apps/office): node ../../node_modules/vitest/vitest.mjs run src/framework/browser/presentation/CommandMenuBar.test.tsx src/framework/browser/presentation/CommandMenuBar-saved-focus.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx --maxWorkers=1 --reporter=default --reporter=json --outputFile=../../output/playwright/task62-related-results.json. Result: pass,34tests. Scope: actual shared/Writer menu focus consumers;no shared runtime mutation in this block. Commands: npm run typecheck;source-scoped eslint/prettier;dependencies,docs,size,source-tree,provenance,registry,writer/calc resources,routing,doctor;production build/static. Result: pass;existing decomposition/build advisories and hook-shim readiness warning only. Browser: actual production preview4176 with installed Playwright CLI,desktop hidden-row and mobile hidden-column selection through shared menus;raw snapshots/screens retained. Native group-wide common selection and unclamped hidden-span endpoints remain source behavior. Full all-app checkpoint next70.

## Rollback Plan

Revert only task source/metadata commits,retaining evidence;do not reset user history,merge branches or alter unrelated tasks.

## Findings

Initial owner test used numeric Which103 for a weight item and failed before its ODS check;source inspection confirms original ATTR_FONT_WEIGHT=102. The test now imports that actual source constant;production behavior was already correct. All551 Calc tests/130 owners now100percent with original thresholds/exclusions unchanged. No shared runtime owner changes;34common-menu/Writer tests pass. Native grouped-sheet common subtraction,unclamped hidden-tail bounds and retained unmarked multi-area state are preserved,not normalized. Filtered-only and hidden flags remain separate original owners. Source cellsh1 cases are implemented in the existing single ScCellShell TS owner with explicit provenance. Actual1280/390px screenshots inspected;favicon404 is the only browser console resource error. A blue row-label text highlight after Shift-click is a separate existing grid-interaction observation to inspect before broad browser parity certification;this block certifies source visible-selection commands and actual menu routing only. No new suspected upstream defect established;no external publication or branch merge.
