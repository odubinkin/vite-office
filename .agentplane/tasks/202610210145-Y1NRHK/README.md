---
id: "202610210145-Y1NRHK"
title: "Align Calc pointer selection and native Deselect ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc -- --maxWorkers=1"
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T01:47:00.896Z"
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
    body: "Start: Implement approved native normal-grid deselection and browser pointer/editor ownership in calc only;retain actual Escape semantics."
events:
  -
    type: "status"
    at: "2026-10-21T01:47:10.523Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native normal-grid deselection and browser pointer/editor ownership in calc only;retain actual Escape semantics."
doc_version: 3
doc_updated_at: "2026-10-21T01:47:10.523Z"
doc_updated_by: "CODER"
description: "Block63: verify and correct browser DOM text selection during native cell Shift-click;connect actual normal-grid Unmark/Deselect26549 through Sfx and original ShiftBackspace accelerator. Preserve Escape input cancellation versus grid behavior,editor text selection,old-cursor/sheet/content/history ownership and genuine shared Writer menus. No invented reference/selection engines. Only calc checkout/branch;all Calc100,related checks;full all-app next70."
sections:
  Summary: |-
    Align Calc pointer selection and native Deselect ownership

    Block63: verify and correct browser DOM text selection during native cell Shift-click;connect actual normal-grid Unmark/Deselect26549 through Sfx and original ShiftBackspace accelerator. Preserve Escape input cancellation versus grid behavior,editor text selection,old-cursor/sheet/content/history ownership and genuine shared Writer menus. No invented reference/selection engines. Only calc checkout/branch;all Calc100,related checks;full all-app next70.
  Scope: "Original ordinary/no-reference ScTabView Unmark consumed state effects and ScCellShell Deselect26549,original ShiftBackspace binding;browser grid pointer/text ownership and genuine nested editor selection/focus. Up to20source/test/browser files plus registry/provenance/docs/evidence. Existing native MoveCursorAbs device/SelectionEngine/reference service paths stay explicitly unported,no fake engines or new browser model. Escape does not become Deselect. Only calc checkout/branch,no network,global-file mutation or merging."
  Plan: "Reproduce actual browser Shift-click DOM selection using read-only Selection inspection before edits. Consume native normal-grid Unmark effects through actual ScMarkData/ScViewData,including old-cursor invalidation only when marks exist,and reset the existing browser anchor to current cursor. Register original hidden Deselect slot26549 and ShiftBackspace through existing Sfx boundary;preserve native grid Escape semantics and nested edit/menu/modal ownership. Prevent document text selection over grid labels/cells through permanent presentation ownership while retaining genuine text selection/double-click editing inside the cell input. Do not fabricate MoveCursorAbs,SelectionEngine or reference services. Verify all Calc100,related tests,actual pointer/keyboard/editor/IME/focus flows in Chromium desktop/mobile,independent mandatory gate exit statuses,source/native pins and immutable raw evidence. Preserve errors and source suspicious cases;fresh quality pass and clean close. Full all-app next70."
  Verify Steps: "Read actual pinned Unmark,MoveCursorAbs normal no-modifier branch,GetMoveCursor,cellsh4 Deselect and source ShiftBackspace binding;reproduce browser DOM text selection before mutation. Tests:marked/unmarked/multi/grouped selection,old-cursor validity,current cursor/sheet/content/dirty/history invariants,subsequent shift anchor,admitted/rejected input. Keyboard grid ShiftBackspace exact modifiers,composition,Escape separation,nested editor/text field/menu/modal ownership. Actual Chromium Shift-click getSelection result,nonempty cell double-click and input word/character selection at1280/390px. All Calc tests/coverage100,affected shared-owner coverage100 if changed,related shared/Writer consumers. Source eslint/prettier,tools/app types,dependencies,JSDoc,size,tree,provenance,registry,resources,routing,doctor,production build/static with individually recorded exit codes. Preserve original failed logs and raw coverage maps;portable pinned audit,quality pass,clean finish. Full all-app checkpoint70."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task source/metadata commits while retaining evidence;do not reset user history,merge branches or alter unrelated tasks."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc pointer selection and native Deselect ownership

Block63: verify and correct browser DOM text selection during native cell Shift-click;connect actual normal-grid Unmark/Deselect26549 through Sfx and original ShiftBackspace accelerator. Preserve Escape input cancellation versus grid behavior,editor text selection,old-cursor/sheet/content/history ownership and genuine shared Writer menus. No invented reference/selection engines. Only calc checkout/branch;all Calc100,related checks;full all-app next70.

## Scope

Original ordinary/no-reference ScTabView Unmark consumed state effects and ScCellShell Deselect26549,original ShiftBackspace binding;browser grid pointer/text ownership and genuine nested editor selection/focus. Up to20source/test/browser files plus registry/provenance/docs/evidence. Existing native MoveCursorAbs device/SelectionEngine/reference service paths stay explicitly unported,no fake engines or new browser model. Escape does not become Deselect. Only calc checkout/branch,no network,global-file mutation or merging.

## Plan

Reproduce actual browser Shift-click DOM selection using read-only Selection inspection before edits. Consume native normal-grid Unmark effects through actual ScMarkData/ScViewData,including old-cursor invalidation only when marks exist,and reset the existing browser anchor to current cursor. Register original hidden Deselect slot26549 and ShiftBackspace through existing Sfx boundary;preserve native grid Escape semantics and nested edit/menu/modal ownership. Prevent document text selection over grid labels/cells through permanent presentation ownership while retaining genuine text selection/double-click editing inside the cell input. Do not fabricate MoveCursorAbs,SelectionEngine or reference services. Verify all Calc100,related tests,actual pointer/keyboard/editor/IME/focus flows in Chromium desktop/mobile,independent mandatory gate exit statuses,source/native pins and immutable raw evidence. Preserve errors and source suspicious cases;fresh quality pass and clean close. Full all-app next70.

## Verify Steps

Read actual pinned Unmark,MoveCursorAbs normal no-modifier branch,GetMoveCursor,cellsh4 Deselect and source ShiftBackspace binding;reproduce browser DOM text selection before mutation. Tests:marked/unmarked/multi/grouped selection,old-cursor validity,current cursor/sheet/content/dirty/history invariants,subsequent shift anchor,admitted/rejected input. Keyboard grid ShiftBackspace exact modifiers,composition,Escape separation,nested editor/text field/menu/modal ownership. Actual Chromium Shift-click getSelection result,nonempty cell double-click and input word/character selection at1280/390px. All Calc tests/coverage100,affected shared-owner coverage100 if changed,related shared/Writer consumers. Source eslint/prettier,tools/app types,dependencies,JSDoc,size,tree,provenance,registry,resources,routing,doctor,production build/static with individually recorded exit codes. Preserve original failed logs and raw coverage maps;portable pinned audit,quality pass,clean finish. Full all-app checkpoint70.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task source/metadata commits while retaining evidence;do not reset user history,merge branches or alter unrelated tasks.

## Findings
