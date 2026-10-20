---
id: "202610201340-KFJKEQ"
title: "Implement native Calc text shadow and relief pipeline"
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
doc_updated_at: "2026-10-20T13:41:25.367Z"
doc_updated_by: "CODER"
description: "Task49: connect native font shadow/relief attributes,state,history and ODS to shared Writer menu controls and source-ordered common VCL special-text painting;keep calc branch and pause goal after next full checkpoint50."
sections:
  Summary: "Task49 adds native Calc text shadow and relief state/operations/ODS and shared browser VCL special-text painting. It continues the approved UI goal after task48."
  Scope: "Only vite-office-calc on calc;up to120 non-task paths. Existing native shadow108/relief124 items and ScFormatShell/view/controller/slot owners;source shadow XML handler and chained text property mapping;shared VCL browser special-text raster pipeline preserving original relief/shadow/outline order and colors;existing Writer menu controls and source resource placements;focused tests,registry and evidence. No fake native device,font or UNO services. Browser metrics remain actual browser measurements with explicit device-parity limitations. No merges,branches,network,outside files or unrelated historical tasks. Preserve Writer primary/autosave/open/no-recovery policy. Document suspicious upstream branches without repairing them."
  Plan: "Implement source-shaped Calc shadow/relief commands,state,history and ODS with shared Writer controls and original ordered VCL raster effects;up to120non-task paths,only calc. Verify related modules and desktop/mobile/Worker plus declared gates. No full run before checkpoint50;pause goal after that run."
  Verify Steps: "Source anchors: native formatsh ExecuteAttr/GetAttrState,SVX items/pool defaults,shdwdhdl.cxx/txtprhdl.cxx/txtprmap.cxx and OutputDevice::ImplDrawSpecialText. Affected Calc/shared/Writer tests must assert actual mapped items/default/mixed/typed-argument/no-argument semantics,real selection/history and unchanged values;literal native luminance/offset/color/layer order,relief overriding shadow/outline and outline/shadow combination;independent XML lexical cases and repeated actual ZIP reopens. Production browser tests cover shared menu controls,desktop1280/mobile390 and inspected raster screenshots;actual DOM-free Worker covers source operations/history/ODS. Run only affected tests until full checkpoint50;do not change retries/timeouts/skip policies. Run types,changed authored lint/format,dependencies,JSDoc,size,resource generation,source/provenance,registry/scoped parity,production/static build,routing,doctor,diff. Retain commands/exits,test counts,current source/test/native hashes and screenshots;record implementation commit,verification,quality review and clean tracked state."
  Verification: "Pending implementation and declared evidence."
  Rollback Plan: "Revert only this task through separately scoped authorized changes;never reset unrelated work or alter pinned upstream sources."
  Findings: "Preflight confirms clean calc after task48. Three stale historical DOING records remain untouched. Actual shadow and relief items/defaults already exist;UI and filter/paint paths are not yet connected. Broad user approval covers safe local Calc UI implementation and canonical shared Writer modules. No extra approval needed. User stop condition after next full all-app checkpoint50 persists."
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

Preflight confirms clean calc after task48. Three stale historical DOING records remain untouched. Actual shadow and relief items/defaults already exist;UI and filter/paint paths are not yet connected. Broad user approval covers safe local Calc UI implementation and canonical shared Writer modules. No extra approval needed. User stop condition after next full all-app checkpoint50 persists.
