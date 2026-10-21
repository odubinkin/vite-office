---
id: "202610210117-DRAYC7"
title: "Implement native Calc visible-row and visible-column selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
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
doc_updated_at: "2026-10-21T01:17:48.974Z"
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
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task source/metadata commits,retaining evidence;do not reset user history,merge branches or alter unrelated tasks."
  Findings: ""
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

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task source/metadata commits,retaining evidence;do not reset user history,merge branches or alter unrelated tasks.

## Findings
