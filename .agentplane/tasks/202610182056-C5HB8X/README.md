---
id: "202610182056-C5HB8X"
title: "Add source Calc sheet-tab context menu through shared Writer popup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T20:57:13.830Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T21:15:45.341Z"
  updated_by: "CODER"
  note: "Native sheet-tab resource and formula/context admission use actual shared Writer popup. All292Calc cases raw100percent,201related popup/menu cases,source/resource gates,types/build/style/inventory and2built viewport/axe cases pass;see verification.md. Original UI goal remains active."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Generate native sheet-tab resource and connect real shared Writer popup with source selection and formula admission."
events:
  -
    type: "status"
    at: "2026-10-18T20:57:18.309Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Generate native sheet-tab resource and connect real shared Writer popup with source selection and formula admission."
  -
    type: "verify"
    at: "2026-10-18T21:15:45.341Z"
    author: "CODER"
    state: "ok"
    note: "Native sheet-tab resource and formula/context admission use actual shared Writer popup. All292Calc cases raw100percent,201related popup/menu cases,source/resource gates,types/build/style/inventory and2built viewport/axe cases pass;see verification.md. Original UI goal remains active."
doc_version: 3
doc_updated_at: "2026-10-18T21:15:45.397Z"
doc_updated_by: "CODER"
description: "Approved Calc UI continuation task16. Generate native sheettab.xml and PopupLabel metadata through existing shared Writer tooling. Render actual framework CommandPopupMenu on sheet pointer/ContextMenu/ShiftF10,with native selected-group retention/unselected collapse and formula/modal admission. Extend actual ScInputHandler represented formula-mode flags/predicate using explicit browser text/context projections,without fake EditEngine services. Use existing SelectAll/Deselect slots;unsupported native entries remain disabled including Insert requiring unported dialog. Preserve shared popup focus/keyboard/geometry. Up to40non-task files including truthful registry/source resources. AllCalc100percent,related shared/Writer popup and source tests,standard gates;next full task20;only calc checkout/branch."
sections:
  Summary: |-
    Add source Calc sheet-tab context menu through shared Writer popup

    Approved Calc UI continuation task16. Generate native sheettab.xml and PopupLabel metadata through existing shared Writer tooling. Render actual framework CommandPopupMenu on sheet pointer/ContextMenu/ShiftF10,with native selected-group retention/unselected collapse and formula/modal admission. Extend actual ScInputHandler represented formula-mode flags/predicate using explicit browser text/context projections,without fake EditEngine services. Use existing SelectAll/Deselect slots;unsupported native entries remain disabled including Insert requiring unported dialog. Preserve shared popup focus/keyboard/geometry. Up to40non-task files including truthful registry/source resources. AllCalc100percent,related shared/Writer popup and source tests,standard gates;next full task20;only calc checkout/branch.
  Scope: |-
    - In scope: Approved Calc UI continuation task16. Generate native sheettab.xml and PopupLabel metadata through existing shared Writer tooling. Render actual framework CommandPopupMenu on sheet pointer/ContextMenu/ShiftF10,with native selected-group retention/unselected collapse and formula/modal admission. Extend actual ScInputHandler represented formula-mode flags/predicate using explicit browser text/context projections,without fake EditEngine services. Use existing SelectAll/Deselect slots;unsupported native entries remain disabled including Insert requiring unported dialog. Preserve shared popup focus/keyboard/geometry. Up to40non-task files including truthful registry/source resources. AllCalc100percent,related shared/Writer popup and source tests,standard gates;next full task20;only calc checkout/branch.
    - Out of scope: unrelated refactors not required for "Add source Calc sheet-tab context menu through shared Writer popup".
  Plan: "Add pinned sheettab.xml to existing deterministic Calc graph generator and native PopupLabel/dialog projection using shared Writer catalog helpers. Adapt source popup at sc/uiconfig/scalc/popupmenu/sheettab.ts,all native entries in order;real TableSelectAll/TableDeselectAll slots execute,unported operations remain disabled. ScTabControl forwards native pointer and ContextMenu/ShiftF10 intents to workbench using real tab owner/geometry. Controller mirrors source SwitchToPageId:already-selected returns preserving real active sheet/group;unselected commits supported input then selects one actual tab. Actual ScInputHandler owns represented bFormulaMode/mbEditingExistingContent and source StartsLikeFormula predicate,updated through explicit browser text/lifecycle projection APIs. Core formula/modal admission suppresses popup. Mount actual shared CommandPopupMenu with generated native resources;preserve Writer focus/outside dismissal/geometry/disabled selection. Tests assert source16entry shape,source labels,selection/admission,no dirty/history mutation,keyboard/focus/modal lifecycle. AllCalc100percent,related Writer/shared popup tests,source/resource freshness,types/build/style/source/inventory gates,production browser and axe. Up to40non-task paths;task16,next full task20."
  Verify Steps: "1. npm run test:coverage:calc raw100percent four metrics. Native formula-mode predicate tests cover existing/new input flags and reset/toggles. Production popup tests cover actual resource order/labels,disabled entries,real SelectAll/Deselect,selected/unselected context policy,mouse/ContextMenu/ShiftF10,failure/formula/modal admission and focus/teardown. 2. Related shared CommandPopupMenu and Writer popup tests,source-contract tests,Calc and Writer generated-resource freshness pass. 3. App/tools types/build,touched style,module/docs/size/source/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser opens source sheet context menu with group selection,executes commands and passes actual accessibility review without exclusions. Full suite next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T21:15:45.341Z — VERIFY — ok

    By: CODER

    Note: Native sheet-tab resource and formula/context admission use actual shared Writer popup. All292Calc cases raw100percent,201related popup/menu cases,source/resource gates,types/build/style/inventory and2built viewport/axe cases pass;see verification.md. Original UI goal remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T21:15:44.855Z, excerpt_hash=sha256:a2d3922745bb3237d769a0ee4098459ff39098317646ab05c278a1bc1fd17f28

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182056-C5HB8X/blueprint/resolved-snapshot.json
    - old_digest: 221901da5d39f0874704d37d6078bff795907876d2a7c814b5d00a7af405cd13
    - current_digest: 221901da5d39f0874704d37d6078bff795907876d2a7c814b5d00a7af405cd13
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182056-C5HB8X

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182056-C5HB8X -m 🧩 C5HB8X task: persist canonical task artifacts --allow-tasks
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
    Evidence: calc-coverage-final.log;110 files,292 cases;raw statements6650/6650,branches4275/4275,functions1373/1373,lines5968/5968. No thresholds or exclusions changed.
    Scope: all Calc runtime owners,formula-mode flags and lifecycle,source popup resources,actual selection/dispatch/focus/modal behavior and existing input/files/history.

    Command: npm exec --workspace @vite-office/office -- vitest run native-command-popup native-empty-popup native-popup- native-disabled-popup native-context-menu WriterMenuBar CommandMenuBar --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: related.log;20 files,201 cases.
    Scope: actual shared popup and Writer consumers including disabled highlight,timers,mouse,keyboard,owner/focus and menu integration;shared renderer implementation remains reused unchanged.

    Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
    Result: pass
    Evidence: contracts.log;9 source/resource cases plus Writer freshness2cases;451Calc commands,11top menus,17explicit save-policy dispositions. Native sheet popup has14commands and3separators,17nodes,with original order and PopupLabel suffixes. Writer generated resources remain unchanged.
    Scope: pinned native XML/hash/catalog closure,SwitchToPageId already-selected return,formula/modal admission and StartsLikeFormula existing/new-input context.

    Command: node .agentplane/tasks/202610182056-C5HB8X/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: gates.log,style-final.log,style-verified.log;30intentional non-task paths after adding browser regression. 848module sources,849provenance runtime modules,733mapped/98browser/18infrastructure;both scoped semanticViolationCount0;doctor OK with existing shim-readiness warning;policy routing OK. Existing build size warnings remain.
    Scope: actual native formula-state ownership and source popup adaptation,without whole EditEngine/VCL/Calc parity claims.

    Command: npx playwright test sheet-context-menu.spec.ts --config apps/office/playwright.config.ts --project=calc
    Result: pass
    Evidence: browser-e2e-verified.log;2cases at1280x800 and390x600. Exact14source commands,unsupported Insert disabled,source group retention and real SelectAll/Deselect,Escape/ShiftF10 focus return,viewport bounds and actual Undo verify popup functionality. Unfiltered AxeBuilder.analyze violations=[] and browser pageerror list=[] are asserted in each case.
    Scope: built current production application and actual accessible popup controls at both viewports;no accessibility exclusions,force-clicks or weakened geometry assertions.

    Findings: Initial typecheck found two sheet presenter fixtures missing the new required context callback and workbench missing explicit no-argument resolution required by the shared popup;fixed those bindings. Initial291pass/1failure treated decorative shared Writer separators as accessible separator roles;corrected the fixture to count actual aria-hidden decorative nodes while preserving native14command/3separator structure. Initial CLI browser command put a filename after variadic --project;used positional filename before --project=calc. Next browser run exposed a strict locator ambiguity:Select All Sheets also substring-matched Deselect All Sheets. Added exact accessible-name matching;both viewport/axe cases pass. No production renderer behavior was weakened or forked for these fixture/CLI corrections.

    Native scope: Popup uses actual shared CommandPopupMenu and same native Sfx bindings as Writer. Already-selected target preserves canonical active sheet/group;unselected target commits supported input and selects one sheet;blank-strip page-id-zero request retains selection. Core ScInputHandler owns represented bFormulaMode and mbEditingExistingContent with original StartsLikeFormula rules. UpdateInputState/ResetInputState are explicit browser projections of actual shared draft/lifecycle,not invented EditEngine services or claimed full UpdateFormulaMode. Formula/modal admission prevents popup. Complete pinned sheettab resource and source PopupLabel are generated by existing shared tooling. Existing TableSelectAll/TableDeselectAll execute;native Insert/Remove/Rename/format/event services remain disabled because their source services/dialogs are unported. Deselect becomes an actual visible context command in inventory.

    Remaining native scope: Full VCL TabBar current-page state,protected/reference modes,EditEngine/highlight/global reference-manager services and whole Calc UI parity remain unported. Source selected-group/context policy and shared browser focus/geometry are verified in the current one-view editable slice.

    Cadence: Approved UI task16;full regression completed/repaired at task10,next full task20. Original Calc UI goal remains active.
id_source: "generated"
---
## Summary

Add source Calc sheet-tab context menu through shared Writer popup

Approved Calc UI continuation task16. Generate native sheettab.xml and PopupLabel metadata through existing shared Writer tooling. Render actual framework CommandPopupMenu on sheet pointer/ContextMenu/ShiftF10,with native selected-group retention/unselected collapse and formula/modal admission. Extend actual ScInputHandler represented formula-mode flags/predicate using explicit browser text/context projections,without fake EditEngine services. Use existing SelectAll/Deselect slots;unsupported native entries remain disabled including Insert requiring unported dialog. Preserve shared popup focus/keyboard/geometry. Up to40non-task files including truthful registry/source resources. AllCalc100percent,related shared/Writer popup and source tests,standard gates;next full task20;only calc checkout/branch.

## Scope

- In scope: Approved Calc UI continuation task16. Generate native sheettab.xml and PopupLabel metadata through existing shared Writer tooling. Render actual framework CommandPopupMenu on sheet pointer/ContextMenu/ShiftF10,with native selected-group retention/unselected collapse and formula/modal admission. Extend actual ScInputHandler represented formula-mode flags/predicate using explicit browser text/context projections,without fake EditEngine services. Use existing SelectAll/Deselect slots;unsupported native entries remain disabled including Insert requiring unported dialog. Preserve shared popup focus/keyboard/geometry. Up to40non-task files including truthful registry/source resources. AllCalc100percent,related shared/Writer popup and source tests,standard gates;next full task20;only calc checkout/branch.
- Out of scope: unrelated refactors not required for "Add source Calc sheet-tab context menu through shared Writer popup".

## Plan

Add pinned sheettab.xml to existing deterministic Calc graph generator and native PopupLabel/dialog projection using shared Writer catalog helpers. Adapt source popup at sc/uiconfig/scalc/popupmenu/sheettab.ts,all native entries in order;real TableSelectAll/TableDeselectAll slots execute,unported operations remain disabled. ScTabControl forwards native pointer and ContextMenu/ShiftF10 intents to workbench using real tab owner/geometry. Controller mirrors source SwitchToPageId:already-selected returns preserving real active sheet/group;unselected commits supported input then selects one actual tab. Actual ScInputHandler owns represented bFormulaMode/mbEditingExistingContent and source StartsLikeFormula predicate,updated through explicit browser text/lifecycle projection APIs. Core formula/modal admission suppresses popup. Mount actual shared CommandPopupMenu with generated native resources;preserve Writer focus/outside dismissal/geometry/disabled selection. Tests assert source16entry shape,source labels,selection/admission,no dirty/history mutation,keyboard/focus/modal lifecycle. AllCalc100percent,related Writer/shared popup tests,source/resource freshness,types/build/style/source/inventory gates,production browser and axe. Up to40non-task paths;task16,next full task20.

## Verify Steps

1. npm run test:coverage:calc raw100percent four metrics. Native formula-mode predicate tests cover existing/new input flags and reset/toggles. Production popup tests cover actual resource order/labels,disabled entries,real SelectAll/Deselect,selected/unselected context policy,mouse/ContextMenu/ShiftF10,failure/formula/modal admission and focus/teardown. 2. Related shared CommandPopupMenu and Writer popup tests,source-contract tests,Calc and Writer generated-resource freshness pass. 3. App/tools types/build,touched style,module/docs/size/source/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser opens source sheet context menu with group selection,executes commands and passes actual accessibility review without exclusions. Full suite next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T21:15:45.341Z — VERIFY — ok

By: CODER

Note: Native sheet-tab resource and formula/context admission use actual shared Writer popup. All292Calc cases raw100percent,201related popup/menu cases,source/resource gates,types/build/style/inventory and2built viewport/axe cases pass;see verification.md. Original UI goal remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T21:15:44.855Z, excerpt_hash=sha256:a2d3922745bb3237d769a0ee4098459ff39098317646ab05c278a1bc1fd17f28

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182056-C5HB8X/blueprint/resolved-snapshot.json
- old_digest: 221901da5d39f0874704d37d6078bff795907876d2a7c814b5d00a7af405cd13
- current_digest: 221901da5d39f0874704d37d6078bff795907876d2a7c814b5d00a7af405cd13
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182056-C5HB8X

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182056-C5HB8X -m 🧩 C5HB8X task: persist canonical task artifacts --allow-tasks
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
Evidence: calc-coverage-final.log;110 files,292 cases;raw statements6650/6650,branches4275/4275,functions1373/1373,lines5968/5968. No thresholds or exclusions changed.
Scope: all Calc runtime owners,formula-mode flags and lifecycle,source popup resources,actual selection/dispatch/focus/modal behavior and existing input/files/history.

Command: npm exec --workspace @vite-office/office -- vitest run native-command-popup native-empty-popup native-popup- native-disabled-popup native-context-menu WriterMenuBar CommandMenuBar --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;20 files,201 cases.
Scope: actual shared popup and Writer consumers including disabled highlight,timers,mouse,keyboard,owner/focus and menu integration;shared renderer implementation remains reused unchanged.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: contracts.log;9 source/resource cases plus Writer freshness2cases;451Calc commands,11top menus,17explicit save-policy dispositions. Native sheet popup has14commands and3separators,17nodes,with original order and PopupLabel suffixes. Writer generated resources remain unchanged.
Scope: pinned native XML/hash/catalog closure,SwitchToPageId already-selected return,formula/modal admission and StartsLikeFormula existing/new-input context.

Command: node .agentplane/tasks/202610182056-C5HB8X/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: gates.log,style-final.log,style-verified.log;30intentional non-task paths after adding browser regression. 848module sources,849provenance runtime modules,733mapped/98browser/18infrastructure;both scoped semanticViolationCount0;doctor OK with existing shim-readiness warning;policy routing OK. Existing build size warnings remain.
Scope: actual native formula-state ownership and source popup adaptation,without whole EditEngine/VCL/Calc parity claims.

Command: npx playwright test sheet-context-menu.spec.ts --config apps/office/playwright.config.ts --project=calc
Result: pass
Evidence: browser-e2e-verified.log;2cases at1280x800 and390x600. Exact14source commands,unsupported Insert disabled,source group retention and real SelectAll/Deselect,Escape/ShiftF10 focus return,viewport bounds and actual Undo verify popup functionality. Unfiltered AxeBuilder.analyze violations=[] and browser pageerror list=[] are asserted in each case.
Scope: built current production application and actual accessible popup controls at both viewports;no accessibility exclusions,force-clicks or weakened geometry assertions.

Findings: Initial typecheck found two sheet presenter fixtures missing the new required context callback and workbench missing explicit no-argument resolution required by the shared popup;fixed those bindings. Initial291pass/1failure treated decorative shared Writer separators as accessible separator roles;corrected the fixture to count actual aria-hidden decorative nodes while preserving native14command/3separator structure. Initial CLI browser command put a filename after variadic --project;used positional filename before --project=calc. Next browser run exposed a strict locator ambiguity:Select All Sheets also substring-matched Deselect All Sheets. Added exact accessible-name matching;both viewport/axe cases pass. No production renderer behavior was weakened or forked for these fixture/CLI corrections.

Native scope: Popup uses actual shared CommandPopupMenu and same native Sfx bindings as Writer. Already-selected target preserves canonical active sheet/group;unselected target commits supported input and selects one sheet;blank-strip page-id-zero request retains selection. Core ScInputHandler owns represented bFormulaMode and mbEditingExistingContent with original StartsLikeFormula rules. UpdateInputState/ResetInputState are explicit browser projections of actual shared draft/lifecycle,not invented EditEngine services or claimed full UpdateFormulaMode. Formula/modal admission prevents popup. Complete pinned sheettab resource and source PopupLabel are generated by existing shared tooling. Existing TableSelectAll/TableDeselectAll execute;native Insert/Remove/Rename/format/event services remain disabled because their source services/dialogs are unported. Deselect becomes an actual visible context command in inventory.

Remaining native scope: Full VCL TabBar current-page state,protected/reference modes,EditEngine/highlight/global reference-manager services and whole Calc UI parity remain unported. Source selected-group/context policy and shared browser focus/geometry are verified in the current one-view editable slice.

Cadence: Approved UI task16;full regression completed/repaired at task10,next full task20. Original Calc UI goal remains active.
