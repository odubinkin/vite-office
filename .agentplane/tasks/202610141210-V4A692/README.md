---
id: "202610141210-V4A692"
title: "Align shared native font weight and Calc script defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
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
doc_updated_at: "2026-10-14T12:21:51.317Z"
doc_updated_by: "CODER"
description: "Task123: canonical SvxWeightItem/shared tools enum with preserved Writer aliases, actual VCL float conversion/native awt constants/typed Any and Calc102113118NORMAL defaults. Targeted raw100; full only at minimum actual UI+ODSread/save readiness then repair/pause."
sections:
  Summary: "Align existing shared font weight with real original enum/typed Any/VCL conversion for Calc3script defaults, preserving Writer aliases/consumers. Localcalc only, no merges."
  Scope: "Existing EditEng textitem weight over actual SfxEnumItem, canonical tools FontWeight and browser aliases, VCL unohelp header/core native float conversion, new OffAPI awtFontWeight constants/wghtitem header, memberids/scitems102113118. Existing textitem source-backed expectations,2newtests/current shared Writer consumers. Runtime/provenance/caps/FontWeight invariant witness/Calcdocs/suspectedcases. No float memory library/C++probes/otherVCLhelpers/localizedpresentation/cache/fullDocPool/documentprovider."
  Plan: "Port native enum/factory/copy/Clone/GetWeight/HasBoolValue/Boldthreshold/SetBool BOLDorNORMAL and payload-only equality using actual SfxEnumItem. Move enum once to tools and retain existing Writer names as const/type aliases; move invariant witness preserving ID/value/evidence. CheckedJS constructor negative/fractional guards remain host-only over native nonnegativeenum range, unknown11/sentinel nowadmitted. Native VCL ConvertFontWeight enum->11AWTconstants and float->ordered<=threshold mapping with defaultDONTKNOW; Math.fround selects original float32 parameter/cast behavior. Explicit erased-family selector avoids number-based overload guessing. TypedAny Query bool/float; Put boolcommonAny2Bool or double-then-signed32 extraction with final float cast. Retain fallback calls as short-circuit expression; nativeassign confirms signed32 source types subsetofdouble, so no fabricated fallback-success provider. Unknownmember untouchedsuccess. Calc3scriptNORMAL itemsetcopies and MEDIUM105float boundary tests. Exact raw100/focused12gates/boundaries/nativepins/sourcehash/same-agentEVAL/APclose. Full only minimum real UI+ODSread/save readiness then repair/pause."
  Verify Steps: "Read complete native weight/header/factory/enums/VCLtwohelperbodies/IDL/memberids/DocPool, actual SfxEnumItem/Any2Bool and nativeDouble/LONGassignment switches. Cover11enum+unknown/sentinel and11float thresholds/intermediate/float32near100and200/NaNInf/out-of-range fallback. TypedAnyfloat/boolquery/doubleandsignednumericinputs/wrongtypefalseunchanged/unknownsuccess/defaultmembers/narrowconvertbit; actual copies/factory/Clone/Which/hash/bool setters and3scriptNORMAL defaults. Existing equality expectation false->true from source; oldunknown11reject replaced by stored11assertion, negative/fractional errorsretained. WholeCalc and complete changedshared rawS/B/F/L100 everycounterpositive4source linksabsent/restoredfinally; include fulltextitem/currentposture/font-effects/Writerattributes/numbering/bool tests. Focusedformat/lint/typecheck/docs/size/deps/tree/provenance/inventory/boundaries/routing/doctor/diff; failuresretained, exactpaths/freshGitbaseline/nativeSHA256pins and same-agentEVAL not independent. Nofullsuite now."
  Verification: |-
    Command: node output/playwright/task123-checks/portable.mjs
    Result: pass Calc168tests64files33owners rawS4158/B2731/F821/L3706; related92tests8files5nonemptyowners rawS294/B156/F58/L257. All100percent every raw counter positive,4native source links absent/restoredfinally. Entire changed shared textitem/tools/VCL/member/constants/header owners; current posture/font-effects/Writerattributes/numbering/native-format-to-text consumers included. No runtime test failures or threshold weakening.
    Command: npx vitest run scripts/check-module-boundaries.test.ts
    Result: pass29tests, checker unchanged.
    Command: node output/playwright/task123-checks/gates.mjs
    Result: pass all12focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates first final run. Initial/typecheck failures retained: readonly alias literal default inference broke3unchanged Writer test-helper calls. Explicit broad enum-typed alias records corrected type-only bridge in shared owner for weight and italic, no Writer file/assertion changes; whole app typecheck and92runtime tests pass after correction.
    Command: python3 output/playwright/task123-checks/exact-review.py after successful source commit
    Evidence: fresh3641baseline/current3651committedsource hashes;32exactpaths22changed10added;16nativeSHA256pins and originalGitHEAD9bc445578031fecf56086729d8e4940c77e14d65. Same-agent evaluator is not independent review.
    Scope: canonical SvxWeightItem value/factory/copy/Clone/boldthreshold/BOLDorNORMAL setter/payload equality, actual bool/float Any query and double-then-signed32 extraction with native finalfloat cast. Original VCL11enum/float constants includingMEDIUM105, ordered thresholds/defaultDONTKNOW and Math.fround boundaries near100and200. Both overload families explicit, not inferred from numeric value. Native LONG source-type set subsetofDOUBLE proven in assign.hxx and actual numeric Any matrix, no fake fallback-success provider/private forcing. Calc102113118NORMAL defaults via actual SfxItemSetcopies. Weight invariant witness moves to actual tools enum keeping original ID/marker/value/native evidence. CALC108 recorded. Existing Which-equality expectation correctedfromsource, unknown11error expectation replaced by stored11assertion; negative/fractional browser errors retained.
    Limits: otherVCLhelpers/native presentation/diagnostics/cache/refcounts/memoryABI/fullDocPool/config/storage/document/UI/ODS pending/excluded. No native C++build/generator/sanitizer/memory library/fakeprovider. Existing metadata histories/status and broadparityflags retained; no Writer-only coverage repair.
    Full suite deferred per latest user instruction: real minimum UI contracts and same-model ODS load/save readiness, then relevant repairs and pausegoal. No fixed tasknumber trigger; goalactive.
  Rollback Plan: "Revert only task123source commit preserving task122/userhistory; no resets/merges/externalpublication."
  Findings: |-
    Prior task122verifiedprogress, preflight cleancalc, unrelated active tasks untouched. Weight equalitycurrentlyWhich-sensitive while originalSfxEnumItem payload-only; floatconversion/typedtransportmissing. Source confirms nativelegacy int32 fallback cannot succeed afterdoubleextract failure because LONGsource set is subsetofDOUBLE; retain calls without fakeAny/privateforcing. User requested nativeJSnumeric behaviorpreferred, Math.fround mapsnativefloatcontract. Full deferred until actual minimumUI+ODSread/save readiness then repairs/pause.

    Observation: Initial/test app typechecks fail in unchanged Writer native-format-to-text test helper because a const-alias enum property inferred one literal default parameter type instead of original whole enum type.
    Impact: Type-level legacy API widening, not runtime assertion/Writer source bug.
    Resolution: Explicit readonly legacy alias record values use canonical enum type, preserving old broad enum parameter inference; apply same type-only bridge to existing FontItalic aliases. No Writer file/assertion/runtime payload changes; rerun app typecheck and actual Writer consumer tests.
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

Command: node output/playwright/task123-checks/portable.mjs
Result: pass Calc168tests64files33owners rawS4158/B2731/F821/L3706; related92tests8files5nonemptyowners rawS294/B156/F58/L257. All100percent every raw counter positive,4native source links absent/restoredfinally. Entire changed shared textitem/tools/VCL/member/constants/header owners; current posture/font-effects/Writerattributes/numbering/native-format-to-text consumers included. No runtime test failures or threshold weakening.
Command: npx vitest run scripts/check-module-boundaries.test.ts
Result: pass29tests, checker unchanged.
Command: node output/playwright/task123-checks/gates.mjs
Result: pass all12focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates first final run. Initial/typecheck failures retained: readonly alias literal default inference broke3unchanged Writer test-helper calls. Explicit broad enum-typed alias records corrected type-only bridge in shared owner for weight and italic, no Writer file/assertion changes; whole app typecheck and92runtime tests pass after correction.
Command: python3 output/playwright/task123-checks/exact-review.py after successful source commit
Evidence: fresh3641baseline/current3651committedsource hashes;32exactpaths22changed10added;16nativeSHA256pins and originalGitHEAD9bc445578031fecf56086729d8e4940c77e14d65. Same-agent evaluator is not independent review.
Scope: canonical SvxWeightItem value/factory/copy/Clone/boldthreshold/BOLDorNORMAL setter/payload equality, actual bool/float Any query and double-then-signed32 extraction with native finalfloat cast. Original VCL11enum/float constants includingMEDIUM105, ordered thresholds/defaultDONTKNOW and Math.fround boundaries near100and200. Both overload families explicit, not inferred from numeric value. Native LONG source-type set subsetofDOUBLE proven in assign.hxx and actual numeric Any matrix, no fake fallback-success provider/private forcing. Calc102113118NORMAL defaults via actual SfxItemSetcopies. Weight invariant witness moves to actual tools enum keeping original ID/marker/value/native evidence. CALC108 recorded. Existing Which-equality expectation correctedfromsource, unknown11error expectation replaced by stored11assertion; negative/fractional browser errors retained.
Limits: otherVCLhelpers/native presentation/diagnostics/cache/refcounts/memoryABI/fullDocPool/config/storage/document/UI/ODS pending/excluded. No native C++build/generator/sanitizer/memory library/fakeprovider. Existing metadata histories/status and broadparityflags retained; no Writer-only coverage repair.
Full suite deferred per latest user instruction: real minimum UI contracts and same-model ODS load/save readiness, then relevant repairs and pausegoal. No fixed tasknumber trigger; goalactive.

## Rollback Plan

Revert only task123source commit preserving task122/userhistory; no resets/merges/externalpublication.

## Findings

Prior task122verifiedprogress, preflight cleancalc, unrelated active tasks untouched. Weight equalitycurrentlyWhich-sensitive while originalSfxEnumItem payload-only; floatconversion/typedtransportmissing. Source confirms nativelegacy int32 fallback cannot succeed afterdoubleextract failure because LONGsource set is subsetofDOUBLE; retain calls without fakeAny/privateforcing. User requested nativeJSnumeric behaviorpreferred, Math.fround mapsnativefloatcontract. Full deferred until actual minimumUI+ODSread/save readiness then repairs/pause.

Observation: Initial/test app typechecks fail in unchanged Writer native-format-to-text test helper because a const-alias enum property inferred one literal default parameter type instead of original whole enum type.
Impact: Type-level legacy API widening, not runtime assertion/Writer source bug.
Resolution: Explicit readonly legacy alias record values use canonical enum type, preserving old broad enum parameter inference; apply same type-only bridge to existing FontItalic aliases. No Writer file/assertion/runtime payload changes; rerun app typecheck and actual Writer consumer tests.
