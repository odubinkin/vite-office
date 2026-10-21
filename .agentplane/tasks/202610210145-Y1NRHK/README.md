---
id: "202610210145-Y1NRHK"
title: "Align Calc pointer selection and native Deselect ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
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
doc_updated_at: "2026-10-21T02:38:47.579Z"
doc_updated_by: "CODER"
description: "Block63: verify and correct browser DOM text selection during native cell Shift-click;connect actual normal-grid Unmark/Deselect26549 through Sfx and original ShiftBackspace accelerator. Preserve Escape input cancellation versus grid behavior,editor text selection,old-cursor/sheet/content/history ownership and genuine shared Writer menus. No invented reference/selection engines. Only calc checkout/branch;all Calc100,related checks;full all-app next70."
sections:
  Summary: |-
    Align Calc pointer selection and native Deselect ownership

    Block63: verify and correct browser DOM text selection during native cell Shift-click;connect actual normal-grid Unmark/Deselect26549 through Sfx and original ShiftBackspace accelerator. Preserve Escape input cancellation versus grid behavior,editor text selection,old-cursor/sheet/content/history ownership and genuine shared Writer menus. No invented reference/selection engines. Only calc checkout/branch;all Calc100,related checks;full all-app next70.
  Scope: "Original ordinary/no-reference ScTabView Unmark consumed state effects and ScCellShell Deselect26549,original ShiftBackspace binding;browser grid pointer/text ownership and genuine nested editor selection/focus. Up to20source/test/browser files plus registry/provenance/docs/evidence. Existing native MoveCursorAbs device/SelectionEngine/reference service paths stay explicitly unported,no fake engines or new browser model. Escape does not become Deselect. Only calc checkout/branch,no network,global-file mutation or merging."
  Plan: "Reproduce actual browser Shift-click DOM selection using read-only Selection inspection before edits. Consume native normal-grid Unmark effects through actual ScMarkData/ScViewData,including old-cursor invalidation only when marks exist,and reset the existing browser anchor to current cursor. Register original hidden Deselect slot26549 and ShiftBackspace through existing Sfx boundary;preserve native grid Escape semantics and nested edit/menu/modal ownership. Prevent document text selection over grid labels/cells through permanent presentation ownership while retaining genuine text selection/double-click editing inside the cell input. Do not fabricate MoveCursorAbs,SelectionEngine or reference services. Verify all Calc100,related tests,actual pointer/keyboard/editor/IME/focus flows in Chromium desktop/mobile,independent mandatory gate exit statuses,source/native pins and immutable raw evidence. Preserve errors and source suspicious cases;fresh quality pass and clean close. Full all-app next70."
  Verify Steps: "Read actual pinned Unmark,MoveCursorAbs normal no-modifier branch,GetMoveCursor,cellsh4 Deselect and source ShiftBackspace binding;reproduce browser DOM text selection before mutation. Tests:marked/unmarked/multi/grouped selection,old-cursor validity,current cursor/sheet/content/dirty/history invariants,subsequent shift anchor,admitted/rejected input. Keyboard grid ShiftBackspace exact modifiers,composition,Escape separation,nested editor/text field/menu/modal ownership. Actual Chromium Shift-click getSelection result,nonempty cell double-click and input word/character selection at1280/390px. All Calc tests/coverage100,affected shared-owner coverage100 if changed,related shared/Writer consumers. Source eslint/prettier,tools/app types,dependencies,JSDoc,size,tree,provenance,registry,resources,routing,doctor,production build/static with individually recorded exit codes. Preserve original failed logs and raw coverage maps;portable pinned audit,quality pass,clean finish. Full all-app checkpoint70."
  Verification: "Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task63-calc-accepted-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task63-calc-accepted-results.json. Result: pass,exit0;567tests/169files;130owners;S10901/B6785/F2014/L9788,all100percent. Scope: all Calc and original/default/unbound/reassigned Deselect,ordinary Unmark fields,modifier/composition/consumed-event and nested-input behavior. Related shared menu/keyboard/saved-focus/Writer cases:43pass. Current root source/catalog tooling:17pass;16focused native/view/keyboard cases pass. Commands: node output/playwright/task63-final-gates.mjs;node output/playwright/task63-final-extra-gates.mjs. Result: all10+4individually recorded exits0 for types,dependencies,JSDoc,size,tree,provenance,registry,resources,build/static,source lint/format,routing,doctor. Existing advisories only. Native surface proof:all11menu/surface graphs,pinned inputs and17browser-policy dispositions unchanged;only hidden Deselect catalog metadata added. Chromium production preview4177:before Shift-click Selection text newline3newline;after empty at1280/390px. Native input word selection beta remains;ShiftBackspace edits that input and Escape restores committed alpha beta. Grid Escape retains marks,ShiftBackspace removes them without moving current cursor. Actual modal-field key ownership and grid focus verified separately. Raw reports preserve obsolete564-test100percent snapshot,initial label-query failure,binding failures and deliberately interrupted failing normalization run(exit130);only final567-test coverage is accepted. Full all-app checkpoint70."
  Rollback Plan: "Revert only this task source/metadata commits while retaining evidence;do not reset user history,merge branches or alter unrelated tasks."
  Findings: "Chromium before edit reproduced Shift-click document text newline3newline;declarative grid select-none and inline select-text remove that without global Selection mutation. Initial Cell input test query was corrected to source label Edit cell E8. Early564-test100percent snapshot lacked active-binding coverage;new tests exposed direct key handler bypass of disabled/reassigned shortcuts. A subsequent case mismatch against canonical Sfx metadata failed the default key case;that known-failing live run was explicitly SIGINTed(exit130),not restarted for timeout. Final route uses shared canonical adapter/active Sfx lookup and original canonical fallback;16focused cases pass. Actual browser then exposed another ownership bug:dialog cancellation tried focusing the still-inert grid;jsdom did not enforce inert. Workbench now restores focus in a React layout effect after committed modal removal;premature file/metric/sheet callback attempts are removed,no timers. Actual DOM focus event tests reject focus while inert and cover Escape/Cancel/OK;15related modal/file/metric tests pass. Final full Calc570tests/170files and130owners100percent;prior567/564snapshots and all failed/interrupted logs retained. No thresholds/exclusions/counters changed. Native normal/no-reference Unmark effects are real;MoveCursorAbs/SelectionEngine/device/reference services remain unported. No new suspected upstream defect established. No publication/network/merging;wrong-cwd preview failed before startup and was corrected inside the app."
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

Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task63-calc-accepted-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task63-calc-accepted-results.json. Result: pass,exit0;567tests/169files;130owners;S10901/B6785/F2014/L9788,all100percent. Scope: all Calc and original/default/unbound/reassigned Deselect,ordinary Unmark fields,modifier/composition/consumed-event and nested-input behavior. Related shared menu/keyboard/saved-focus/Writer cases:43pass. Current root source/catalog tooling:17pass;16focused native/view/keyboard cases pass. Commands: node output/playwright/task63-final-gates.mjs;node output/playwright/task63-final-extra-gates.mjs. Result: all10+4individually recorded exits0 for types,dependencies,JSDoc,size,tree,provenance,registry,resources,build/static,source lint/format,routing,doctor. Existing advisories only. Native surface proof:all11menu/surface graphs,pinned inputs and17browser-policy dispositions unchanged;only hidden Deselect catalog metadata added. Chromium production preview4177:before Shift-click Selection text newline3newline;after empty at1280/390px. Native input word selection beta remains;ShiftBackspace edits that input and Escape restores committed alpha beta. Grid Escape retains marks,ShiftBackspace removes them without moving current cursor. Actual modal-field key ownership and grid focus verified separately. Raw reports preserve obsolete564-test100percent snapshot,initial label-query failure,binding failures and deliberately interrupted failing normalization run(exit130);only final567-test coverage is accepted. Full all-app checkpoint70.

## Rollback Plan

Revert only this task source/metadata commits while retaining evidence;do not reset user history,merge branches or alter unrelated tasks.

## Findings

Chromium before edit reproduced Shift-click document text newline3newline;declarative grid select-none and inline select-text remove that without global Selection mutation. Initial Cell input test query was corrected to source label Edit cell E8. Early564-test100percent snapshot lacked active-binding coverage;new tests exposed direct key handler bypass of disabled/reassigned shortcuts. A subsequent case mismatch against canonical Sfx metadata failed the default key case;that known-failing live run was explicitly SIGINTed(exit130),not restarted for timeout. Final route uses shared canonical adapter/active Sfx lookup and original canonical fallback;16focused cases pass. Actual browser then exposed another ownership bug:dialog cancellation tried focusing the still-inert grid;jsdom did not enforce inert. Workbench now restores focus in a React layout effect after committed modal removal;premature file/metric/sheet callback attempts are removed,no timers. Actual DOM focus event tests reject focus while inert and cover Escape/Cancel/OK;15related modal/file/metric tests pass. Final full Calc570tests/170files and130owners100percent;prior567/564snapshots and all failed/interrupted logs retained. No thresholds/exclusions/counters changed. Native normal/no-reference Unmark effects are real;MoveCursorAbs/SelectionEngine/device/reference services remain unported. No new suspected upstream defect established. No publication/network/merging;wrong-cwd preview failed before startup and was corrected inside the app.
