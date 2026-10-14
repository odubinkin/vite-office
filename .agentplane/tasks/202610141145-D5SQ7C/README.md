---
id: "202610141145-D5SQ7C"
title: "Share native strikeout emphasis and Any2Bool values for Calc"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T11:45:34.474Z"
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
    body: "Start: implement original strikeout emphasis and common Any2Bool with existing Writer reuse; complete targeted raw100, no full until UI ODS readiness."
events:
  -
    type: "status"
    at: "2026-10-14T11:45:45.663Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original strikeout emphasis and common Any2Bool with existing Writer reuse; complete targeted raw100, no full until UI ODS readiness."
doc_version: 3
doc_updated_at: "2026-10-14T11:45:45.663Z"
doc_updated_by: "CODER"
description: "Task121: real EditEng strikeout/emphasis, tools enums/OffAPI constants, common SVL Any2Bool reused by existing Writer LR2sites, Calc106121defaults. Targeted raw100; full only at minimum actual UI+ODS readiness then repair/pause."
sections:
  Summary: "Port shared native strikeout/emphasis values and common Any2Bool needed by Calc default font attributes and future UI/ODS; existing Writer scalar helpers reuse common owner. Localcalc only, no merges."
  Scope: "New EditEng textitem.effects value shard and2headers; tools/inc/fontenum2native enums; OffAPI FontEmphasis constants; shared SVL poolitem Any2Bool plus existing LR2site reuse; existing memberids3values and Calcscitems2values. New shared/Calc tests, complete changedowner profiles with existing Writer LR/font tests, runtime/provenance/capabilities/Calc docs and suspectednativecase log. No C++/generator/memory library/localized presentation/native cache/ABI/documentprovider."
  Plan: "Original strikeout SfxEnumItem ctor/factory/copy/Clone/GetStrikeout/HasBoolValue/GetBoolValue/SetBoolValue/member0bool/member1short mappings, signed32 value write and Any2Bool fallback. Original emphasis SfxUInt16Item ctor/factory/copy/Clone/GetEmphasisMark/9wiremappings, Style/position masks/PosBelow selection/shortoutput/longinput/defaultstyleNONE/unknownmember untouchedsuccess. Any2Bool in original shared header uses actualAny bool then signed32 extraction; browser bool/signed32 scalars explicit withfalse fallback. Migrate exact2WriterLRAny2Bool expressions, retaining all other admission/conversion behavior. Native enums/constants/member narrowing/convertbit/copies/Calc106121NONE real itemset defaults. Shard filename divergence documented against original textitem.cxx enforced500limit. Targeted raw100/12gates/boundary/exacthash/nativepins/same-agent EVAL/APclose. Full remains deferred until actual minimum UI+ODS readiness then repair/pause, task121not a trigger."
  Verify Steps: "Read complete native strikeout/emphasis/header/factories/enums/IDL/memberids/DocPool and SVLAny2Bool, real SfxEnumItem/SfxUInt16Item and Anyextract. Test all9emphasis cases/bothpositions/unknownstyle/unknownmembers/copy/Clone/Which/hash/typederrors and original strikeout bool/short/member failures; Any2Bool bool/signed32 actualAny/scalar/failure, existing LR/font-unit consumers unchanged. Whole Calc and entire changedshared owners rawS/B/F/L100 everycounterpositive with4source links absent/restoredfinally. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/moduleboundaries/routing/doctor/diff; preserve failures/thresholds, exactintentionalpaths/currentGitbaseline/nativeSHA256pins, same-agent EVAL not independent. No fullapplication suite now."
  Verification: "Pending implementation and focused checks."
  Rollback Plan: "Revert only task121source commit preserving task120/user history; no reset/merge/external publication."
  Findings: "Prior turn task120verifiedprogress, preflight clean oncalc, two unrelated DOINGtasks untouched. Next full regression is actual minimum UI contracts and same-model ODS load/save readiness then relevant repairs and requested pause; no task121number trigger. Native unknownmember success/no-op and Any2Boolinvalidfalse are retained, documented as suspicious only where applicable."
id_source: "generated"
---
## Summary

Port shared native strikeout/emphasis values and common Any2Bool needed by Calc default font attributes and future UI/ODS; existing Writer scalar helpers reuse common owner. Localcalc only, no merges.

## Scope

New EditEng textitem.effects value shard and2headers; tools/inc/fontenum2native enums; OffAPI FontEmphasis constants; shared SVL poolitem Any2Bool plus existing LR2site reuse; existing memberids3values and Calcscitems2values. New shared/Calc tests, complete changedowner profiles with existing Writer LR/font tests, runtime/provenance/capabilities/Calc docs and suspectednativecase log. No C++/generator/memory library/localized presentation/native cache/ABI/documentprovider.

## Plan

Original strikeout SfxEnumItem ctor/factory/copy/Clone/GetStrikeout/HasBoolValue/GetBoolValue/SetBoolValue/member0bool/member1short mappings, signed32 value write and Any2Bool fallback. Original emphasis SfxUInt16Item ctor/factory/copy/Clone/GetEmphasisMark/9wiremappings, Style/position masks/PosBelow selection/shortoutput/longinput/defaultstyleNONE/unknownmember untouchedsuccess. Any2Bool in original shared header uses actualAny bool then signed32 extraction; browser bool/signed32 scalars explicit withfalse fallback. Migrate exact2WriterLRAny2Bool expressions, retaining all other admission/conversion behavior. Native enums/constants/member narrowing/convertbit/copies/Calc106121NONE real itemset defaults. Shard filename divergence documented against original textitem.cxx enforced500limit. Targeted raw100/12gates/boundary/exacthash/nativepins/same-agent EVAL/APclose. Full remains deferred until actual minimum UI+ODS readiness then repair/pause, task121not a trigger.

## Verify Steps

Read complete native strikeout/emphasis/header/factories/enums/IDL/memberids/DocPool and SVLAny2Bool, real SfxEnumItem/SfxUInt16Item and Anyextract. Test all9emphasis cases/bothpositions/unknownstyle/unknownmembers/copy/Clone/Which/hash/typederrors and original strikeout bool/short/member failures; Any2Bool bool/signed32 actualAny/scalar/failure, existing LR/font-unit consumers unchanged. Whole Calc and entire changedshared owners rawS/B/F/L100 everycounterpositive with4source links absent/restoredfinally. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/moduleboundaries/routing/doctor/diff; preserve failures/thresholds, exactintentionalpaths/currentGitbaseline/nativeSHA256pins, same-agent EVAL not independent. No fullapplication suite now.

## Verification

Pending implementation and focused checks.

## Rollback Plan

Revert only task121source commit preserving task120/user history; no reset/merge/external publication.

## Findings

Prior turn task120verifiedprogress, preflight clean oncalc, two unrelated DOINGtasks untouched. Next full regression is actual minimum UI contracts and same-model ODS load/save readiness then relevant repairs and requested pause; no task121number trigger. Native unknownmember success/no-op and Any2Boolinvalidfalse are retained, documented as suspicious only where applicable.
