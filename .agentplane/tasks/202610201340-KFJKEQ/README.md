---
id: "202610201340-KFJKEQ"
title: "Implement native Calc text shadow and relief pipeline"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T13:40:56.703Z"
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
    body: "Start: implement approved native shadow and relief text effects with shared Writer controls and source XML/raster contracts."
events:
  -
    type: "status"
    at: "2026-10-20T13:41:25.367Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native shadow and relief text effects with shared Writer controls and source XML/raster contracts."
doc_version: 3
doc_updated_at: "2026-10-20T14:04:28.463Z"
doc_updated_by: "CODER"
description: "Task49: connect native font shadow/relief attributes,state,history and ODS to shared Writer menu controls and source-ordered common VCL special-text painting;keep calc branch and pause goal after next full checkpoint50."
sections:
  Summary: "Task49 adds native Calc text shadow and relief state/operations/ODS and shared browser VCL special-text painting. It continues the approved UI goal after task48."
  Scope: "Only vite-office-calc on calc;up to120 non-task paths. Existing native shadow108/relief124 items and ScFormatShell/view/controller/slot owners;source shadow XML handler and chained text property mapping;shared VCL browser special-text raster pipeline preserving original relief/shadow/outline order and colors;existing Writer menu controls and source resource placements;focused tests,registry and evidence. No fake native device,font or UNO services. Browser metrics remain actual browser measurements with explicit device-parity limitations. No merges,branches,network,outside files or unrelated historical tasks. Preserve Writer primary/autosave/open/no-recovery policy. Document suspicious upstream branches without repairing them."
  Plan: "Implement source-shaped Calc shadow/relief commands,state,history and ODS with shared Writer controls and original ordered VCL raster effects;up to120non-task paths,only calc. Verify related modules and desktop/mobile/Worker plus declared gates. No full run before checkpoint50;pause goal after that run."
  Verify Steps: "Source anchors: native formatsh ExecuteAttr/GetAttrState,SVX items/pool defaults,shdwdhdl.cxx/txtprhdl.cxx/txtprmap.cxx and OutputDevice::ImplDrawSpecialText. Affected Calc/shared/Writer tests must assert actual mapped items/default/mixed/typed-argument/no-argument semantics,real selection/history and unchanged values;literal native luminance/offset/color/layer order,relief overriding shadow/outline and outline/shadow combination;independent XML lexical cases and repeated actual ZIP reopens. Production browser tests cover shared menu controls,desktop1280/mobile390 and inspected raster screenshots;actual DOM-free Worker covers source operations/history/ODS. Run only affected tests until full checkpoint50;do not change retries/timeouts/skip policies. Run types,changed authored lint/format,dependencies,JSDoc,size,resource generation,source/provenance,registry/scoped parity,production/static build,routing,doctor,diff. Retain commands/exits,test counts,current source/test/native hashes and screenshots;record implementation commit,verification,quality review and clean tracked state."
  Verification: "Pending implementation and declared evidence."
  Rollback Plan: "Revert only this task through separately scoped authorized changes;never reset unrelated work or alter pinned upstream sources."
  Findings: |-
    Task49 implements original shadow108 and relief124 commands/state through actual native attribute operations/history and shared Writer menus. CharacterRelief remains native nonconfigurable,with no invented menu/toolbar placement. Shared XMLShadowedPropHdl and XMLConstantsPropertyHandler retain exact source lexical,required constructor,typed Any and failure/output contracts(CALC235/236). The common VCL browser special-text owner preserves relief precedence,black-to-white relief foreground and independent line colors,native luminance/offset arithmetic and source shadow/contour draw order;the obsolete outline-only production wrapper was removed. Actual browser CSS bounds/96dpi remain an explicit adaptation,not fake native font/device services. Full device,font,printer,mixed-script/rich-edit/Sfx/UNO parity remains unverified.
    Command: exact commands,exits and current authored/native hashes are retained in evidence/text-effects-final.json and copied scoped logs.
    Result: pass for16Calc cases across4files,11shared cases across3files,91related tooling cases across3files and8production browser cases across2files. The expanded four-case shadow/relief production spec separately passes with actual primary ODS reopens,desktop1280/mobile390,outline composition,independent line colors,black-to-white relief and genuine DOM-free Worker shadow/relief/history/ODS. All four saved raster screenshots were visually inspected. Types,authored lint/format,dependencies,JSDoc,size,resources,source tree/provenance,registry/scoped parity,build/static,routing and doctor pass. Existing shim readiness advisory is informational;no hooks/config changed.
    Evidence: evidence/text-effects-final.json and its referenced logs/screenshots;native-value-edge-diff.patch records exact dependency data changes. Only source-backed Any/TypeClass edges were admitted for the new common handlers;general module restrictions and guard algorithms remain unchanged and negative tests pass. Initial fixture matcher/typed-union and exact-import gate failures were repaired and rerun. No timeout,retry,skip or pass-criterion changes were made. No existing Writer runtime imports the former outline-only module or new handlers;Writer resource checks pass and unrelated Writer tests were not run.
    Scope:49non-task paths within120approved. Three stale historical DOING records remain untouched. Last full checkpoint40,next50. Pause the active goal immediately after that next full all-app run regardless of success/failure. No full run occurred in task49.
id_source: "generated"
---
## Summary

Task49 adds native Calc text shadow and relief state/operations/ODS and shared browser VCL special-text painting. It continues the approved UI goal after task48.

## Scope

Only vite-office-calc on calc;up to120 non-task paths. Existing native shadow108/relief124 items and ScFormatShell/view/controller/slot owners;source shadow XML handler and chained text property mapping;shared VCL browser special-text raster pipeline preserving original relief/shadow/outline order and colors;existing Writer menu controls and source resource placements;focused tests,registry and evidence. No fake native device,font or UNO services. Browser metrics remain actual browser measurements with explicit device-parity limitations. No merges,branches,network,outside files or unrelated historical tasks. Preserve Writer primary/autosave/open/no-recovery policy. Document suspicious upstream branches without repairing them.

## Plan

Implement source-shaped Calc shadow/relief commands,state,history and ODS with shared Writer controls and original ordered VCL raster effects;up to120non-task paths,only calc. Verify related modules and desktop/mobile/Worker plus declared gates. No full run before checkpoint50;pause goal after that run.

## Verify Steps

Source anchors: native formatsh ExecuteAttr/GetAttrState,SVX items/pool defaults,shdwdhdl.cxx/txtprhdl.cxx/txtprmap.cxx and OutputDevice::ImplDrawSpecialText. Affected Calc/shared/Writer tests must assert actual mapped items/default/mixed/typed-argument/no-argument semantics,real selection/history and unchanged values;literal native luminance/offset/color/layer order,relief overriding shadow/outline and outline/shadow combination;independent XML lexical cases and repeated actual ZIP reopens. Production browser tests cover shared menu controls,desktop1280/mobile390 and inspected raster screenshots;actual DOM-free Worker covers source operations/history/ODS. Run only affected tests until full checkpoint50;do not change retries/timeouts/skip policies. Run types,changed authored lint/format,dependencies,JSDoc,size,resource generation,source/provenance,registry/scoped parity,production/static build,routing,doctor,diff. Retain commands/exits,test counts,current source/test/native hashes and screenshots;record implementation commit,verification,quality review and clean tracked state.

## Verification

Pending implementation and declared evidence.

## Rollback Plan

Revert only this task through separately scoped authorized changes;never reset unrelated work or alter pinned upstream sources.

## Findings

Task49 implements original shadow108 and relief124 commands/state through actual native attribute operations/history and shared Writer menus. CharacterRelief remains native nonconfigurable,with no invented menu/toolbar placement. Shared XMLShadowedPropHdl and XMLConstantsPropertyHandler retain exact source lexical,required constructor,typed Any and failure/output contracts(CALC235/236). The common VCL browser special-text owner preserves relief precedence,black-to-white relief foreground and independent line colors,native luminance/offset arithmetic and source shadow/contour draw order;the obsolete outline-only production wrapper was removed. Actual browser CSS bounds/96dpi remain an explicit adaptation,not fake native font/device services. Full device,font,printer,mixed-script/rich-edit/Sfx/UNO parity remains unverified.
Command: exact commands,exits and current authored/native hashes are retained in evidence/text-effects-final.json and copied scoped logs.
Result: pass for16Calc cases across4files,11shared cases across3files,91related tooling cases across3files and8production browser cases across2files. The expanded four-case shadow/relief production spec separately passes with actual primary ODS reopens,desktop1280/mobile390,outline composition,independent line colors,black-to-white relief and genuine DOM-free Worker shadow/relief/history/ODS. All four saved raster screenshots were visually inspected. Types,authored lint/format,dependencies,JSDoc,size,resources,source tree/provenance,registry/scoped parity,build/static,routing and doctor pass. Existing shim readiness advisory is informational;no hooks/config changed.
Evidence: evidence/text-effects-final.json and its referenced logs/screenshots;native-value-edge-diff.patch records exact dependency data changes. Only source-backed Any/TypeClass edges were admitted for the new common handlers;general module restrictions and guard algorithms remain unchanged and negative tests pass. Initial fixture matcher/typed-union and exact-import gate failures were repaired and rerun. No timeout,retry,skip or pass-criterion changes were made. No existing Writer runtime imports the former outline-only module or new handlers;Writer resource checks pass and unrelated Writer tests were not run.
Scope:49non-task paths within120approved. Three stale historical DOING records remain untouched. Last full checkpoint40,next50. Pause the active goal immediately after that next full all-app run regardless of success/failure. No full run occurred in task49.
