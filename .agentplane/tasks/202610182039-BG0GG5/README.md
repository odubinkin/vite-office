---
id: "202610182039-BG0GG5"
title: "Apply Calc input to selected sheets with native cell Undo owners"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-18T20:39:30.091Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T20:50:15.365Z"
  updated_by: "CODER"
  note: "Selected-sheet input uses real native values and ScUndoSetCell children under one shared list action. All288Calc cases raw100percent,122related cases with touched shared undo100percent,8source cases,types/build/style/source/inventory gates and built-browser3sheet edit/Undo/Redo/styles pass;see verification.md."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Move typed Calc cell Undo to native owner and apply current input to actual selected sheets through shared list history."
events:
  -
    type: "status"
    at: "2026-10-18T20:39:36.888Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Move typed Calc cell Undo to native owner and apply current input to actual selected sheets through shared list history."
  -
    type: "verify"
    at: "2026-10-18T20:50:15.365Z"
    author: "CODER"
    state: "ok"
    note: "Selected-sheet input uses real native values and ScUndoSetCell children under one shared list action. All288Calc cases raw100percent,122related cases with touched shared undo100percent,8source cases,types/build/style/source/inventory gates and built-browser3sheet edit/Undo/Redo/styles pass;see verification.md."
doc_version: 3
doc_updated_at: "2026-10-18T20:50:15.418Z"
doc_updated_by: "CODER"
description: "Approved Calc UI continuation task15. Port actual ScUndoSetCell typed-content ownership and affected-range contract at native source/header paths;replace private browser CellChangeAction. Extend ScCellValue release so prepared actual formula owners transfer to the real document. Reuse shared SfxListUndoAction native inherited GetUndoAction surface for browser cursor restoration after reverse Undo/forward Redo. Current browser plain-input decoding prepares real native values for every selected sheet before writes,then applies the source ScViewFunc selected-mark loop under one native list action with per-sheet formula positions. Show selected sheet groups in existing Writer visual tokens. No fake ScDocFunc/ScUndoEnterData/formatter services. Up to40non-task files with truthful metadata;allCalc100percent and related tests;full regression next task20;calc checkout/branch only."
sections:
  Summary: |-
    Apply Calc input to selected sheets with native cell Undo owners

    Approved Calc UI continuation task15. Port actual ScUndoSetCell typed-content ownership and affected-range contract at native source/header paths;replace private browser CellChangeAction. Extend ScCellValue release so prepared actual formula owners transfer to the real document. Reuse shared SfxListUndoAction native inherited GetUndoAction surface for browser cursor restoration after reverse Undo/forward Redo. Current browser plain-input decoding prepares real native values for every selected sheet before writes,then applies the source ScViewFunc selected-mark loop under one native list action with per-sheet formula positions. Show selected sheet groups in existing Writer visual tokens. No fake ScDocFunc/ScUndoEnterData/formatter services. Up to40non-task files with truthful metadata;allCalc100percent and related tests;full regression next task20;calc checkout/branch only.
  Scope: |-
    - In scope: Approved Calc UI continuation task15. Port actual ScUndoSetCell typed-content ownership and affected-range contract at native source/header paths;replace private browser CellChangeAction. Extend ScCellValue release so prepared actual formula owners transfer to the real document. Reuse shared SfxListUndoAction native inherited GetUndoAction surface for browser cursor restoration after reverse Undo/forward Redo. Current browser plain-input decoding prepares real native values for every selected sheet before writes,then applies the source ScViewFunc selected-mark loop under one native list action with per-sheet formula positions. Show selected sheet groups in existing Writer visual tokens. No fake ScDocFunc/ScUndoEnterData/formatter services. Up to40non-task files with truthful metadata;allCalc100percent and related tests;full regression next task20;calc checkout/branch only.
    - Out of scope: unrelated refactors not required for "Apply Calc input to selected sheets with native cell Undo owners".
  Plan: "Port source ScUndoSetCell maPos/maOldValue/maNewValue,GetComment,getAffectedRange and represented SetValue ownership;explicitly omit unported ScSimpleUndo/change-track/format/spill/VCL services. Existing shared SfxUndoAction context bridge supplies source Undo/Redo. Add native ScCellValue release transfer and shared SfxListUndoAction inherited GetUndoAction(index) for real browser range restoration. Decode current plain browser input once;prepare actual ScCellValue/formula owners for every canonical selected tab before document writes;apply each under existing EnterListAction/LeaveListAction,retaining per-sheet compilation and prior contents. Undo reverses children/Redo forwards them;browser cursor follows last executed native child affected range. Preserve invalid input,group membership,one dirty/history operation and actual dependencies;paint selected tabs with existing Writer slate/indigo styles. No fabricated formatter/docfunc/native view facade. Tests include grouped scalar/text/formula writes,partial groups,invalid rejection,history/cursor order and source ownership. AllCalc100percent,related shared undo/menu and source contracts,types/build/style/source/inventory gates and built-browser group edit review. Up to40non-task paths;task15,next full task20."
  Verify Steps: "1. npm run test:coverage:calc raw100percent statements/branches/functions/lines. Actual native action/value tests cover empty,numeric,literal string and formula Undo/Redo,move ownership and affected range;production grouped input tests cover all/partial groups,per-sheet formulas/dependencies,one action,Undo/Redo traversal and invalid input preserving all cells/history. 2. Shared Undo manager tests plus grouped integration achieve100percent coverage on touched shared undo.ts;related shared/Writer menu tests and native source contracts pass. 3. App/tools types,build,touched prettier/eslint,module/docs/size/source-tree/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser selects a sheet group,edits actual cells and verifies one Undo/Redo plus selected-state visuals. No full app suite before task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T20:50:15.365Z — VERIFY — ok

    By: CODER

    Note: Selected-sheet input uses real native values and ScUndoSetCell children under one shared list action. All288Calc cases raw100percent,122related cases with touched shared undo100percent,8source cases,types/build/style/source/inventory gates and built-browser3sheet edit/Undo/Redo/styles pass;see verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T20:50:14.871Z, excerpt_hash=sha256:3e8e211271ab34c15751e36a9e155bb81c1d630ab7cc60c9de92e8572ec30f92

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182039-BG0GG5/blueprint/resolved-snapshot.json
    - old_digest: a8fdfde9403b573a5144c44737fc49690991e0ed7f7348e0cfbee919a11cfabc
    - current_digest: a8fdfde9403b573a5144c44737fc49690991e0ed7f7348e0cfbee919a11cfabc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182039-BG0GG5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182039-BG0GG5 -m 🧩 BG0GG5 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: calc-coverage-verified.log;109 files,288 cases;raw statements6591/6591,branches4217/4217,functions1359/1359,lines5919/5919. calc-coverage-final.log also passes before the final tab-border correction. No threshold or coverage exclusion changes.
    Scope: every current Calc runtime owner,actual native typed actions,value release,grouped input,per-sheet formulas,real history/files and production UI.

    Command: npm run test:coverage -- undo.test calc-input-group CommandMenuBar WriterMenuBar --coverage.include=src/svl/source/undo/undo.ts --coverage.reportsDirectory=coverage/calc-group-undo --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: related-final.log;11 files,122 cases;actual touched shared Undo owner raw statements145/145,branches66/66,functions39/39,lines127/127.
    Scope: shared native list/child traversal,Undo history and actual Writer/shared menus plus grouped Calc integration.

    Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts
    Result: pass
    Evidence: contracts.log;8 pinned-source/resource cases and app/tools types/build. build-style-final.log confirms final production rebuild,touched style and JSDoc after tab border correction.
    Scope: native ScUndoSetCell value/range/move ownership,ScCellValue release,ScViewFunc selected-mark list boundary and inherited SfxUndoArray child access.

    Command: node .agentplane/tasks/202610182039-BG0GG5/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: gates.log and build-style-final.log;25 intentional non-task paths;847 module sources,848 provenance runtime modules,732mapped/98browser/18infrastructure;both scoped semanticViolationCount0,doctor OK with existing managed-shim readiness warning,policy routing OK. Existing build bundle-size warnings remain.
    Scope: source ownership,module boundaries and truthful bounded native action/browser adaptation without whole Calc parity claims.

    Command: Production Chromium http://127.0.0.1:5176/calc using real menus,tab buttons,keyboard and toolbar
    Result: pass
    Evidence: browser-review.json and tool transcript. Created Sheet2/3,Edit/Select/Select All Sheets selected all3. Actual computed styles show indigo background/400border on inactive selected tabs and700border on active Sheet3. Typed9 in A1;visited every sheet and observed9. One Undo selected Sheet1 and all3A1 cells were empty;one Redo selected Sheet3 and all3A1 cells were9. Per-sheet checks used visible UI and actual tab navigation only.
    Scope: grouped source selection,input,one compound Undo/Redo,cursor traversal and Writer-style selection visuals.

    Findings: Initial287pass/1failure was a new UI fixture using the wrong source menu path;Select All Sheets belongs to Edit/Select. Corrected the fixture without changing production resources. Related coverage initially failed on the same fixture,then passed. Metadata update initially assumed native localSymbols on browser-only provenance;retained its actual responsibilities schema. Browser exact text matching also needed to account for the visible submenu arrow;the final review used the actual submenu trigger. Computed CSS revealed common border-slate-300 overriding indigo borders;limited gray border to unselected tabs and reran build/style plus allCalc100percent. Final browser evidence comes from the corrected built application.

    Native scope: Original ScUndoSetCell stores moved ScCellValue old/new content,restores scalar/literal/formula values,and returns original affected range. Existing SfxUndoAction context dispatch bridges original Undo/Redo;the browser private CellChangeAction is removed. Browser input prepares actual native owners per selected sheet before writes,then uses real Sfx EnterListAction/LeaveListAction and source selected-mark ordering. Invalid unsupported input is rejected during preparation before writes/list creation. Shared list child traversal lets browser focus follow the last executed native affected range. No dummy ScSimpleUndo/ScDocFunc/ScViewFunc,formatter or view provider is introduced.

    Remaining scope: Full native ScSimpleUndo,ScDocFunc/ScViewFunc,ScUndoEnterData raw-string redo,formatter/number-format metadata,rich text,change tracking,sheet views,spill resolution and VCL painting/cursor services remain unported. Plain input decoding remains the existing browser current-core adaptation,not a fabricated native formatter. Native action SetValue uses actual literal SetTextCell without changing number formats in this plain kernel. Group input itself is connected to actual model/marks/dependencies and one real shared list action.

    Cadence: Approved UI task15;full regression completed/repaired at task10,next full task20. Original Calc UI goal remains active.
id_source: "generated"
---
## Summary

Apply Calc input to selected sheets with native cell Undo owners

Approved Calc UI continuation task15. Port actual ScUndoSetCell typed-content ownership and affected-range contract at native source/header paths;replace private browser CellChangeAction. Extend ScCellValue release so prepared actual formula owners transfer to the real document. Reuse shared SfxListUndoAction native inherited GetUndoAction surface for browser cursor restoration after reverse Undo/forward Redo. Current browser plain-input decoding prepares real native values for every selected sheet before writes,then applies the source ScViewFunc selected-mark loop under one native list action with per-sheet formula positions. Show selected sheet groups in existing Writer visual tokens. No fake ScDocFunc/ScUndoEnterData/formatter services. Up to40non-task files with truthful metadata;allCalc100percent and related tests;full regression next task20;calc checkout/branch only.

## Scope

- In scope: Approved Calc UI continuation task15. Port actual ScUndoSetCell typed-content ownership and affected-range contract at native source/header paths;replace private browser CellChangeAction. Extend ScCellValue release so prepared actual formula owners transfer to the real document. Reuse shared SfxListUndoAction native inherited GetUndoAction surface for browser cursor restoration after reverse Undo/forward Redo. Current browser plain-input decoding prepares real native values for every selected sheet before writes,then applies the source ScViewFunc selected-mark loop under one native list action with per-sheet formula positions. Show selected sheet groups in existing Writer visual tokens. No fake ScDocFunc/ScUndoEnterData/formatter services. Up to40non-task files with truthful metadata;allCalc100percent and related tests;full regression next task20;calc checkout/branch only.
- Out of scope: unrelated refactors not required for "Apply Calc input to selected sheets with native cell Undo owners".

## Plan

Port source ScUndoSetCell maPos/maOldValue/maNewValue,GetComment,getAffectedRange and represented SetValue ownership;explicitly omit unported ScSimpleUndo/change-track/format/spill/VCL services. Existing shared SfxUndoAction context bridge supplies source Undo/Redo. Add native ScCellValue release transfer and shared SfxListUndoAction inherited GetUndoAction(index) for real browser range restoration. Decode current plain browser input once;prepare actual ScCellValue/formula owners for every canonical selected tab before document writes;apply each under existing EnterListAction/LeaveListAction,retaining per-sheet compilation and prior contents. Undo reverses children/Redo forwards them;browser cursor follows last executed native child affected range. Preserve invalid input,group membership,one dirty/history operation and actual dependencies;paint selected tabs with existing Writer slate/indigo styles. No fabricated formatter/docfunc/native view facade. Tests include grouped scalar/text/formula writes,partial groups,invalid rejection,history/cursor order and source ownership. AllCalc100percent,related shared undo/menu and source contracts,types/build/style/source/inventory gates and built-browser group edit review. Up to40non-task paths;task15,next full task20.

## Verify Steps

1. npm run test:coverage:calc raw100percent statements/branches/functions/lines. Actual native action/value tests cover empty,numeric,literal string and formula Undo/Redo,move ownership and affected range;production grouped input tests cover all/partial groups,per-sheet formulas/dependencies,one action,Undo/Redo traversal and invalid input preserving all cells/history. 2. Shared Undo manager tests plus grouped integration achieve100percent coverage on touched shared undo.ts;related shared/Writer menu tests and native source contracts pass. 3. App/tools types,build,touched prettier/eslint,module/docs/size/source-tree/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser selects a sheet group,edits actual cells and verifies one Undo/Redo plus selected-state visuals. No full app suite before task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T20:50:15.365Z — VERIFY — ok

By: CODER

Note: Selected-sheet input uses real native values and ScUndoSetCell children under one shared list action. All288Calc cases raw100percent,122related cases with touched shared undo100percent,8source cases,types/build/style/source/inventory gates and built-browser3sheet edit/Undo/Redo/styles pass;see verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T20:50:14.871Z, excerpt_hash=sha256:3e8e211271ab34c15751e36a9e155bb81c1d630ab7cc60c9de92e8572ec30f92

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182039-BG0GG5/blueprint/resolved-snapshot.json
- old_digest: a8fdfde9403b573a5144c44737fc49690991e0ed7f7348e0cfbee919a11cfabc
- current_digest: a8fdfde9403b573a5144c44737fc49690991e0ed7f7348e0cfbee919a11cfabc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182039-BG0GG5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182039-BG0GG5 -m 🧩 BG0GG5 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage-verified.log;109 files,288 cases;raw statements6591/6591,branches4217/4217,functions1359/1359,lines5919/5919. calc-coverage-final.log also passes before the final tab-border correction. No threshold or coverage exclusion changes.
Scope: every current Calc runtime owner,actual native typed actions,value release,grouped input,per-sheet formulas,real history/files and production UI.

Command: npm run test:coverage -- undo.test calc-input-group CommandMenuBar WriterMenuBar --coverage.include=src/svl/source/undo/undo.ts --coverage.reportsDirectory=coverage/calc-group-undo --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related-final.log;11 files,122 cases;actual touched shared Undo owner raw statements145/145,branches66/66,functions39/39,lines127/127.
Scope: shared native list/child traversal,Undo history and actual Writer/shared menus plus grouped Calc integration.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts
Result: pass
Evidence: contracts.log;8 pinned-source/resource cases and app/tools types/build. build-style-final.log confirms final production rebuild,touched style and JSDoc after tab border correction.
Scope: native ScUndoSetCell value/range/move ownership,ScCellValue release,ScViewFunc selected-mark list boundary and inherited SfxUndoArray child access.

Command: node .agentplane/tasks/202610182039-BG0GG5/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: gates.log and build-style-final.log;25 intentional non-task paths;847 module sources,848 provenance runtime modules,732mapped/98browser/18infrastructure;both scoped semanticViolationCount0,doctor OK with existing managed-shim readiness warning,policy routing OK. Existing build bundle-size warnings remain.
Scope: source ownership,module boundaries and truthful bounded native action/browser adaptation without whole Calc parity claims.

Command: Production Chromium http://127.0.0.1:5176/calc using real menus,tab buttons,keyboard and toolbar
Result: pass
Evidence: browser-review.json and tool transcript. Created Sheet2/3,Edit/Select/Select All Sheets selected all3. Actual computed styles show indigo background/400border on inactive selected tabs and700border on active Sheet3. Typed9 in A1;visited every sheet and observed9. One Undo selected Sheet1 and all3A1 cells were empty;one Redo selected Sheet3 and all3A1 cells were9. Per-sheet checks used visible UI and actual tab navigation only.
Scope: grouped source selection,input,one compound Undo/Redo,cursor traversal and Writer-style selection visuals.

Findings: Initial287pass/1failure was a new UI fixture using the wrong source menu path;Select All Sheets belongs to Edit/Select. Corrected the fixture without changing production resources. Related coverage initially failed on the same fixture,then passed. Metadata update initially assumed native localSymbols on browser-only provenance;retained its actual responsibilities schema. Browser exact text matching also needed to account for the visible submenu arrow;the final review used the actual submenu trigger. Computed CSS revealed common border-slate-300 overriding indigo borders;limited gray border to unselected tabs and reran build/style plus allCalc100percent. Final browser evidence comes from the corrected built application.

Native scope: Original ScUndoSetCell stores moved ScCellValue old/new content,restores scalar/literal/formula values,and returns original affected range. Existing SfxUndoAction context dispatch bridges original Undo/Redo;the browser private CellChangeAction is removed. Browser input prepares actual native owners per selected sheet before writes,then uses real Sfx EnterListAction/LeaveListAction and source selected-mark ordering. Invalid unsupported input is rejected during preparation before writes/list creation. Shared list child traversal lets browser focus follow the last executed native affected range. No dummy ScSimpleUndo/ScDocFunc/ScViewFunc,formatter or view provider is introduced.

Remaining scope: Full native ScSimpleUndo,ScDocFunc/ScViewFunc,ScUndoEnterData raw-string redo,formatter/number-format metadata,rich text,change tracking,sheet views,spill resolution and VCL painting/cursor services remain unported. Plain input decoding remains the existing browser current-core adaptation,not a fabricated native formatter. Native action SetValue uses actual literal SetTextCell without changing number formats in this plain kernel. Group input itself is connected to actual model/marks/dependencies and one real shared list action.

Cadence: Approved UI task15;full regression completed/repaired at task10,next full task20. Original Calc UI goal remains active.
