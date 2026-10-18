---
id: "202610182039-BG0GG5"
title: "Apply Calc input to selected sheets with native cell Undo owners"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
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
doc_version: 3
doc_updated_at: "2026-10-18T20:39:36.888Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
