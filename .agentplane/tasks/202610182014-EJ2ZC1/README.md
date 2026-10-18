---
id: "202610182014-EJ2ZC1"
title: "Match native Calc input modification and undo trigger semantics"
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
  updated_at: "2026-10-18T20:15:17.575Z"
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
    body: "Start: Replace browser JSON equality with source modification flag lifecycle and actual input-triggered history."
events:
  -
    type: "status"
    at: "2026-10-18T20:15:22.005Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Replace browser JSON equality with source modification flag lifecycle and actual input-triggered history."
doc_version: 3
doc_updated_at: "2026-10-18T20:15:22.005Z"
doc_updated_by: "CODER"
description: "Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only."
sections:
  Summary: |-
    Match native Calc input modification and undo trigger semantics

    Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.
  Scope: |-
    - In scope: Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.
    - Out of scope: unrelated refactors not required for "Match native Calc input modification and undo trigger semantics".
  Plan: "Use pinned inputhdl.cxx constructor,SetMode(pInitText),DataChanged,EnterHandler2 and CancelHandler modification flag lifecycle. Extend actual ScInputHandler bounded owner with bModified,source SetModified and explicit browser read/reset boundary;do not claim full EditEngine services. Browser changes and explicit replacement input set flag,F2/focus/caret alone do not;TYPE/TABLE/TOP transitions preserve it. Commit follows modified guard,records actual action even for equal values,removes JSON comparison and retains failed-input state. Reset on accepted input,cancel and model replacement. Add source-backed lifecycle and production no-edit/same-value/reverted-input/history/invalid-draft cases;update stale no-op assertion to native behavior. AllCalc100percent,related UI/source tests,types/build/style/source/provenance/scoped inventories and browser review. Up to24non-task paths;task13,next full task20."
  Verify Steps: "1. npm run test:coverage:calc raw100percent on statements/branches/functions/lines. Native modification flag tests cover initialization,mark/reset and mode-preservation. Production controller/input tests cover F2 or focus with no edit (including formula errors),same-value/reverted edits creating history,dirty generation and native cancellation/error retention. 2. Related shared menu/input focus tests and pinned source contracts pass;source proves EnterHandler modified guard and unconditional operation undo after actual input. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source-tree/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser verifies unchanged F2 leaves Undo/dirty untouched and same-value edit creates undo;all evidence stored in task. Full suite next task20."
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

Match native Calc input modification and undo trigger semantics

Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.

## Scope

- In scope: Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.
- Out of scope: unrelated refactors not required for "Match native Calc input modification and undo trigger semantics".

## Plan

Use pinned inputhdl.cxx constructor,SetMode(pInitText),DataChanged,EnterHandler2 and CancelHandler modification flag lifecycle. Extend actual ScInputHandler bounded owner with bModified,source SetModified and explicit browser read/reset boundary;do not claim full EditEngine services. Browser changes and explicit replacement input set flag,F2/focus/caret alone do not;TYPE/TABLE/TOP transitions preserve it. Commit follows modified guard,records actual action even for equal values,removes JSON comparison and retains failed-input state. Reset on accepted input,cancel and model replacement. Add source-backed lifecycle and production no-edit/same-value/reverted-input/history/invalid-draft cases;update stale no-op assertion to native behavior. AllCalc100percent,related UI/source tests,types/build/style/source/provenance/scoped inventories and browser review. Up to24non-task paths;task13,next full task20.

## Verify Steps

1. npm run test:coverage:calc raw100percent on statements/branches/functions/lines. Native modification flag tests cover initialization,mark/reset and mode-preservation. Production controller/input tests cover F2 or focus with no edit (including formula errors),same-value/reverted edits creating history,dirty generation and native cancellation/error retention. 2. Related shared menu/input focus tests and pinned source contracts pass;source proves EnterHandler modified guard and unconditional operation undo after actual input. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source-tree/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser verifies unchanged F2 leaves Undo/dirty untouched and same-value edit creates undo;all evidence stored in task. Full suite next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
