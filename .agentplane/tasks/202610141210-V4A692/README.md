---
id: "202610141210-V4A692"
title: "Align shared native font weight and Calc script defaults"
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
  updated_at: "2026-10-14T12:11:37.029Z"
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
    body: "Start: align real shared font weight enum/Any/VCL float conversion, Writeraliases and Calc3scriptNORMAL defaults; targeted100/minimum UI ODS readiness checkpoint."
events:
  -
    type: "status"
    at: "2026-10-14T12:11:58.117Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align real shared font weight enum/Any/VCL float conversion, Writeraliases and Calc3scriptNORMAL defaults; targeted100/minimum UI ODS readiness checkpoint."
doc_version: 3
doc_updated_at: "2026-10-14T12:11:58.117Z"
doc_updated_by: "CODER"
description: "Task123: canonical SvxWeightItem/shared tools enum with preserved Writer aliases, actual VCL float conversion/native awt constants/typed Any and Calc102113118NORMAL defaults. Targeted raw100; full only at minimum actual UI+ODSread/save readiness then repair/pause."
sections:
  Summary: "Align existing shared font weight with real original enum/typed Any/VCL conversion for Calc3script defaults, preserving Writer aliases/consumers. Localcalc only, no merges."
  Scope: "Existing EditEng textitem weight over actual SfxEnumItem, canonical tools FontWeight and browser aliases, VCL unohelp header/core native float conversion, new OffAPI awtFontWeight constants/wghtitem header, memberids/scitems102113118. Existing textitem source-backed expectations,2newtests/current shared Writer consumers. Runtime/provenance/caps/FontWeight invariant witness/Calcdocs/suspectedcases. No float memory library/C++probes/otherVCLhelpers/localizedpresentation/cache/fullDocPool/documentprovider."
  Plan: "Port native enum/factory/copy/Clone/GetWeight/HasBoolValue/Boldthreshold/SetBool BOLDorNORMAL and payload-only equality using actual SfxEnumItem. Move enum once to tools and retain existing Writer names as const/type aliases; move invariant witness preserving ID/value/evidence. CheckedJS constructor negative/fractional guards remain host-only over native nonnegativeenum range, unknown11/sentinel nowadmitted. Native VCL ConvertFontWeight enum->11AWTconstants and float->ordered<=threshold mapping with defaultDONTKNOW; Math.fround selects original float32 parameter/cast behavior. Explicit erased-family selector avoids number-based overload guessing. TypedAny Query bool/float; Put boolcommonAny2Bool or double-then-signed32 extraction with final float cast. Retain fallback calls as short-circuit expression; nativeassign confirms signed32 source types subsetofdouble, so no fabricated fallback-success provider. Unknownmember untouchedsuccess. Calc3scriptNORMAL itemsetcopies and MEDIUM105float boundary tests. Exact raw100/focused12gates/boundaries/nativepins/sourcehash/same-agentEVAL/APclose. Full only minimum real UI+ODSread/save readiness then repair/pause."
  Verify Steps: "Read complete native weight/header/factory/enums/VCLtwohelperbodies/IDL/memberids/DocPool, actual SfxEnumItem/Any2Bool and nativeDouble/LONGassignment switches. Cover11enum+unknown/sentinel and11float thresholds/intermediate/float32near100and200/NaNInf/out-of-range fallback. TypedAnyfloat/boolquery/doubleandsignednumericinputs/wrongtypefalseunchanged/unknownsuccess/defaultmembers/narrowconvertbit; actual copies/factory/Clone/Which/hash/bool setters and3scriptNORMAL defaults. Existing equality expectation false->true from source; oldunknown11reject replaced by stored11assertion, negative/fractional errorsretained. WholeCalc and complete changedshared rawS/B/F/L100 everycounterpositive4source linksabsent/restoredfinally; include fulltextitem/currentposture/font-effects/Writerattributes/numbering/bool tests. Focusedformat/lint/typecheck/docs/size/deps/tree/provenance/inventory/boundaries/routing/doctor/diff; failuresretained, exactpaths/freshGitbaseline/nativeSHA256pins and same-agentEVAL not independent. Nofullsuite now."
  Verification: "Pending implementation/checks."
  Rollback Plan: "Revert only task123source commit preserving task122/userhistory; no resets/merges/externalpublication."
  Findings: "Prior task122verifiedprogress, preflight cleancalc, unrelated active tasks untouched. Weight equalitycurrentlyWhich-sensitive while originalSfxEnumItem payload-only; floatconversion/typedtransportmissing. Source confirms nativelegacy int32 fallback cannot succeed afterdoubleextract failure because LONGsource set is subsetofDOUBLE; retain calls without fakeAny/privateforcing. User requested nativeJSnumeric behaviorpreferred, Math.fround mapsnativefloatcontract. Full deferred until actual minimumUI+ODSread/save readiness then repairs/pause."
id_source: "generated"
---
## Summary

Align existing shared font weight with real original enum/typed Any/VCL conversion for Calc3script defaults, preserving Writer aliases/consumers. Localcalc only, no merges.

## Scope

Existing EditEng textitem weight over actual SfxEnumItem, canonical tools FontWeight and browser aliases, VCL unohelp header/core native float conversion, new OffAPI awtFontWeight constants/wghtitem header, memberids/scitems102113118. Existing textitem source-backed expectations,2newtests/current shared Writer consumers. Runtime/provenance/caps/FontWeight invariant witness/Calcdocs/suspectedcases. No float memory library/C++probes/otherVCLhelpers/localizedpresentation/cache/fullDocPool/documentprovider.

## Plan

Port native enum/factory/copy/Clone/GetWeight/HasBoolValue/Boldthreshold/SetBool BOLDorNORMAL and payload-only equality using actual SfxEnumItem. Move enum once to tools and retain existing Writer names as const/type aliases; move invariant witness preserving ID/value/evidence. CheckedJS constructor negative/fractional guards remain host-only over native nonnegativeenum range, unknown11/sentinel nowadmitted. Native VCL ConvertFontWeight enum->11AWTconstants and float->ordered<=threshold mapping with defaultDONTKNOW; Math.fround selects original float32 parameter/cast behavior. Explicit erased-family selector avoids number-based overload guessing. TypedAny Query bool/float; Put boolcommonAny2Bool or double-then-signed32 extraction with final float cast. Retain fallback calls as short-circuit expression; nativeassign confirms signed32 source types subsetofdouble, so no fabricated fallback-success provider. Unknownmember untouchedsuccess. Calc3scriptNORMAL itemsetcopies and MEDIUM105float boundary tests. Exact raw100/focused12gates/boundaries/nativepins/sourcehash/same-agentEVAL/APclose. Full only minimum real UI+ODSread/save readiness then repair/pause.

## Verify Steps

Read complete native weight/header/factory/enums/VCLtwohelperbodies/IDL/memberids/DocPool, actual SfxEnumItem/Any2Bool and nativeDouble/LONGassignment switches. Cover11enum+unknown/sentinel and11float thresholds/intermediate/float32near100and200/NaNInf/out-of-range fallback. TypedAnyfloat/boolquery/doubleandsignednumericinputs/wrongtypefalseunchanged/unknownsuccess/defaultmembers/narrowconvertbit; actual copies/factory/Clone/Which/hash/bool setters and3scriptNORMAL defaults. Existing equality expectation false->true from source; oldunknown11reject replaced by stored11assertion, negative/fractional errorsretained. WholeCalc and complete changedshared rawS/B/F/L100 everycounterpositive4source linksabsent/restoredfinally; include fulltextitem/currentposture/font-effects/Writerattributes/numbering/bool tests. Focusedformat/lint/typecheck/docs/size/deps/tree/provenance/inventory/boundaries/routing/doctor/diff; failuresretained, exactpaths/freshGitbaseline/nativeSHA256pins and same-agentEVAL not independent. Nofullsuite now.

## Verification

Pending implementation/checks.

## Rollback Plan

Revert only task123source commit preserving task122/userhistory; no resets/merges/externalpublication.

## Findings

Prior task122verifiedprogress, preflight cleancalc, unrelated active tasks untouched. Weight equalitycurrentlyWhich-sensitive while originalSfxEnumItem payload-only; floatconversion/typedtransportmissing. Source confirms nativelegacy int32 fallback cannot succeed afterdoubleextract failure because LONGsource set is subsetofDOUBLE; retain calls without fakeAny/privateforcing. User requested nativeJSnumeric behaviorpreferred, Math.fround mapsnativefloatcontract. Full deferred until actual minimumUI+ODSread/save readiness then repairs/pause.
