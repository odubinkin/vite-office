---
id: "202610141326-GENBJF"
title: "Implement canonical shared Color values for Calc document attributes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T13:27:20.346Z"
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
    body: "Start: implement original shared Color value and basic numeric/Any contracts for Calc attribute prerequisites."
events:
  -
    type: "status"
    at: "2026-10-14T13:27:31.424Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original shared Color value and basic numeric/Any contracts for Calc attribute prerequisites."
doc_version: 3
doc_updated_at: "2026-10-14T13:40:36.226Z"
doc_updated_by: "CODER"
description: "Port original logical Color constructors/tags/channels/constants, basic luminance/contrast and actual Any operators without memory machinery. Reuse actual shared CPPU, guard original Tools->CPPU dependency, test native Calc color defaults as values without fake item/document owners."
sections:
  Summary: "Port one canonical logical Tools Color owner for actual Calc font/background/border attributes, reusing existing actual CPPU Any. Previous task127 completed with clean calc state: progress. This value prerequisite is not actual document/UI/ODS readiness."
  Scope: "13intentional paths: new tools/inc/color.ts and tools/source/generic/color.ts, shared color.test.ts and Calc color-defaults.test.ts;4newruntime/provenance records,1sharedcapability; existing module-boundary checker/tests and calc-core/calc-upstream-suspected-issues docs. No Writer core/browser behavior or existing border ownership migration yet; current border packed number representation will consume canonical owner when its native class is aligned, no second Color implementation. Calc branch/folder only."
  Plan: "Implement native default/copy/opaque24/RGB/taggedpacked/tagged4channel forms, both originaltag enums numeric0. C++ tagfamily erased inJS, so explicit trailing ColorTransparencyTag/ColorAlphaTag selector preserves original numericargs/tagvalues without guessing two0tags. Store one ordinary unsigned32number, no nativeheap/binarylayout engine. Original channel/alpha access/setters,RGB extraction,equality/order/colorerror/luminance/invert/merge and25nativeconstants; frozenconstvalues and independentcopies. Source-owned helpers implement WCAGnormalization/GetWCAGLuminance/IsDark/IsBright/IncreaseLuminance/DecreaseLuminance/DecreaseContrast with plainJS arithmetic, no basegfx libraryport. Only validbytecontrast domain needed, Math.round matches originalpositive bounded fround. ActualAny extract/insert and erasedAny(Color) constructor live in originalToolsheader owner with actualsigned32transport, not a reverse CPPU->Tools import. Admit originalTools->Cppu edge andretainreverse/browser/applicationguards. Packed defaultshape blueexception dependsfull32value includingtransparency, recordCALC112 with source-level literalcase. HSB/string/OUString/BColor/HSL/tint/logging methods remain explicitlypending, no stubs or fakecoloritem/DocPool/document. Strict complete shared2owners and wholeCalc raw100, relatednativevalue/Any tests,12focusedgates31boundarytests,freshbaseline/nativepins/same-agentEVAL/APfinishclean. Full onlytrue minimumUI+same-modelODSread/save readiness then fixes/pause; no tiny-rounding/nativebinarysidequest."
  Verify Steps: "Compare original include/tools/color.hxx value constructors/constants/Any operators and source tools/source/generic/color.cxx basicluminance/contrast with native tools/qa/cppunit/test_color.cxx applicableassertions. Literalalltagfamilies/values/UInt32signedcasts/channels/alpha0/255/defaultblack/opaqueguard/copyassignment/ordering/RGBequal versus alpha/everyconstant/mergeendpointsandinterior/invert/error/luminance clamp,WCAGbelowthreshold+nonlinearandpackedshapeexception,contrast0/nonzero. ActualAny LONGandUInt32admission failureunchanged, ColorToAny andinsertcolor actualtype andsignedvalue. CalcfontAUTO/backgroundTRANSPARENT colorvaluecopies withoutfakeitem/provider. Whole npm run test:coverage:calc andstrictrelatedshared wholebothowners100S/B/F/L everycounterpositive,4reference linksabsent/restoredfinally.12focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff,31moduleboundarytests exactnativeTools->Cppu andoriginalreverse/app/browserguards. Exact13paths4existing9new,freshGitbaseline/nativeSHA256pins/actualGitHEAD,same-agentreviewnotindependent,APcloseclean calc. NativeHSB/HSL/strings/BColor andfullDocPool/document/UI/ODS notcertified; no full/browserrun beforehuman readinesscheckpoint."
  Verification: "Pending code and declared checks; overall full Calc goal and UI/ODS readiness notachieved."
  Rollback Plan: "Revert only this task sourcecommit and traceable artifacts if needed; preserve user/unrelated work and prior canonical owners."
  Findings: |-
    Preflight clean calc, source Color absent locally while Writer SvxBorderLine holds packed numericvalue. Need canonicalTools Color before native color/brush/line attribute owners, no duplicate CSS colorengine. Original tags bothnumeric0 require explicit erasedfamily selection, no guessing basedonpackedvalue. C++single-opaque constructor compile/assert domain is0..0xffffff, modelcheckedJSboundary. Originalfull32shape-color specialcase canchange IsDark for sameRGBwithdifferentalpha; source behaviorpreserved CALC112, notdeclared upstreambug. Basicnumericmethods only here, advancedcolorconversion postponed toactualconsumerneed. Humanrounding directive ordinaryJS/meaningfulboundaries, no native/libraryport.

    Original constant count corrected from planning typo27 to native25; all25 enumerated explicitly. The first gate run accidentally overlapped reference-independent portability checks, during which four upstream symlinks are intentionally absent. Provenance and inventory reported ENOENT (retained initial logs), while ten other gates passed. This is verification scheduling error, not an application failure; rerun source-dependent checks only after portable runner restores links. No code changes or criterion relaxation needed. Shared Color7tests already pass with107statements/27branches/42functions/105lines and every raw counter covered.

    Inventory also requires an exact operation record for every exported mutation helper; add the canonical shared insertColor operation record alongside the already approved Color runtime/provenance/capability metadata. This is required traceability within the same operation, no runtime/scope expansion. Final exact14paths4existing10new, source3685to3695. Initial registry diagnostic retained.
id_source: "generated"
---
## Summary

Port one canonical logical Tools Color owner for actual Calc font/background/border attributes, reusing existing actual CPPU Any. Previous task127 completed with clean calc state: progress. This value prerequisite is not actual document/UI/ODS readiness.

## Scope

13intentional paths: new tools/inc/color.ts and tools/source/generic/color.ts, shared color.test.ts and Calc color-defaults.test.ts;4newruntime/provenance records,1sharedcapability; existing module-boundary checker/tests and calc-core/calc-upstream-suspected-issues docs. No Writer core/browser behavior or existing border ownership migration yet; current border packed number representation will consume canonical owner when its native class is aligned, no second Color implementation. Calc branch/folder only.

## Plan

Implement native default/copy/opaque24/RGB/taggedpacked/tagged4channel forms, both originaltag enums numeric0. C++ tagfamily erased inJS, so explicit trailing ColorTransparencyTag/ColorAlphaTag selector preserves original numericargs/tagvalues without guessing two0tags. Store one ordinary unsigned32number, no nativeheap/binarylayout engine. Original channel/alpha access/setters,RGB extraction,equality/order/colorerror/luminance/invert/merge and25nativeconstants; frozenconstvalues and independentcopies. Source-owned helpers implement WCAGnormalization/GetWCAGLuminance/IsDark/IsBright/IncreaseLuminance/DecreaseLuminance/DecreaseContrast with plainJS arithmetic, no basegfx libraryport. Only validbytecontrast domain needed, Math.round matches originalpositive bounded fround. ActualAny extract/insert and erasedAny(Color) constructor live in originalToolsheader owner with actualsigned32transport, not a reverse CPPU->Tools import. Admit originalTools->Cppu edge andretainreverse/browser/applicationguards. Packed defaultshape blueexception dependsfull32value includingtransparency, recordCALC112 with source-level literalcase. HSB/string/OUString/BColor/HSL/tint/logging methods remain explicitlypending, no stubs or fakecoloritem/DocPool/document. Strict complete shared2owners and wholeCalc raw100, relatednativevalue/Any tests,12focusedgates31boundarytests,freshbaseline/nativepins/same-agentEVAL/APfinishclean. Full onlytrue minimumUI+same-modelODSread/save readiness then fixes/pause; no tiny-rounding/nativebinarysidequest.

## Verify Steps

Compare original include/tools/color.hxx value constructors/constants/Any operators and source tools/source/generic/color.cxx basicluminance/contrast with native tools/qa/cppunit/test_color.cxx applicableassertions. Literalalltagfamilies/values/UInt32signedcasts/channels/alpha0/255/defaultblack/opaqueguard/copyassignment/ordering/RGBequal versus alpha/everyconstant/mergeendpointsandinterior/invert/error/luminance clamp,WCAGbelowthreshold+nonlinearandpackedshapeexception,contrast0/nonzero. ActualAny LONGandUInt32admission failureunchanged, ColorToAny andinsertcolor actualtype andsignedvalue. CalcfontAUTO/backgroundTRANSPARENT colorvaluecopies withoutfakeitem/provider. Whole npm run test:coverage:calc andstrictrelatedshared wholebothowners100S/B/F/L everycounterpositive,4reference linksabsent/restoredfinally.12focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff,31moduleboundarytests exactnativeTools->Cppu andoriginalreverse/app/browserguards. Exact13paths4existing9new,freshGitbaseline/nativeSHA256pins/actualGitHEAD,same-agentreviewnotindependent,APcloseclean calc. NativeHSB/HSL/strings/BColor andfullDocPool/document/UI/ODS notcertified; no full/browserrun beforehuman readinesscheckpoint.

## Verification

Pending code and declared checks; overall full Calc goal and UI/ODS readiness notachieved.

## Rollback Plan

Revert only this task sourcecommit and traceable artifacts if needed; preserve user/unrelated work and prior canonical owners.

## Findings

Preflight clean calc, source Color absent locally while Writer SvxBorderLine holds packed numericvalue. Need canonicalTools Color before native color/brush/line attribute owners, no duplicate CSS colorengine. Original tags bothnumeric0 require explicit erasedfamily selection, no guessing basedonpackedvalue. C++single-opaque constructor compile/assert domain is0..0xffffff, modelcheckedJSboundary. Originalfull32shape-color specialcase canchange IsDark for sameRGBwithdifferentalpha; source behaviorpreserved CALC112, notdeclared upstreambug. Basicnumericmethods only here, advancedcolorconversion postponed toactualconsumerneed. Humanrounding directive ordinaryJS/meaningfulboundaries, no native/libraryport.

Original constant count corrected from planning typo27 to native25; all25 enumerated explicitly. The first gate run accidentally overlapped reference-independent portability checks, during which four upstream symlinks are intentionally absent. Provenance and inventory reported ENOENT (retained initial logs), while ten other gates passed. This is verification scheduling error, not an application failure; rerun source-dependent checks only after portable runner restores links. No code changes or criterion relaxation needed. Shared Color7tests already pass with107statements/27branches/42functions/105lines and every raw counter covered.

Inventory also requires an exact operation record for every exported mutation helper; add the canonical shared insertColor operation record alongside the already approved Color runtime/provenance/capability metadata. This is required traceability within the same operation, no runtime/scope expansion. Final exact14paths4existing10new, source3685to3695. Initial registry diagnostic retained.
