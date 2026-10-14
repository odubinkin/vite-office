---
id: "202610141326-GENBJF"
title: "Implement canonical shared Color values for Calc document attributes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
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
  state: "ok"
  updated_at: "2026-10-14T13:41:38.973Z"
  updated_by: "CODER"
  note: "Shared Color7tests and Calc171tests pass strict raw100;12gates31boundarytests; exact source669fbc5f3dc6,14paths3695hashes6nativepins; same-agent review not independent. Full readiness checkpoint still pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T13:41:15.537Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: exact committed Color slice verified"
  evaluated_sha: "669fbc5f3dc60fcf8af8c1a80cab0b2fa0a4a84f"
  blueprint_digest: "78f152aa6c51327bde9243c914b00f6fea0715e46edaa98cb0137abce1e512d0"
  evidence_refs:
    - ".agentplane/tasks/202610141326-GENBJF/README.md"
    - ".agentplane/tasks/202610141326-GENBJF/quality/20261014-134115537-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141326-GENBJF/quality/20261014-134115537-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141326-GENBJF/quality/20261014-134115537-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141326-GENBJF/blueprint/resolved-snapshot.json"
    - "output/playwright/task128-checks/exact-review.json"
    - "output/playwright/task128-checks/value-coverage-audit.json"
  findings:
    - "Four existing and ten new paths, 3695 hashes, six native pins; actual Any and JS scalar arithmetic; strict whole changed shared and Calc raw100; 31 boundary tests and12gates pass."
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
  -
    type: "verify"
    at: "2026-10-14T13:41:38.973Z"
    author: "CODER"
    state: "ok"
    note: "Shared Color7tests and Calc171tests pass strict raw100;12gates31boundarytests; exact source669fbc5f3dc6,14paths3695hashes6nativepins; same-agent review not independent. Full readiness checkpoint still pending."
doc_version: 3
doc_updated_at: "2026-10-14T13:41:39.051Z"
doc_updated_by: "CODER"
description: "Port original logical Color constructors/tags/channels/constants, basic luminance/contrast and actual Any operators without memory machinery. Reuse actual shared CPPU, guard original Tools->CPPU dependency, test native Calc color defaults as values without fake item/document owners."
sections:
  Summary: "Port one canonical logical Tools Color owner for actual Calc font/background/border attributes, reusing existing actual CPPU Any. Previous task127 completed with clean calc state: progress. This value prerequisite is not actual document/UI/ODS readiness."
  Scope: "13intentional paths: new tools/inc/color.ts and tools/source/generic/color.ts, shared color.test.ts and Calc color-defaults.test.ts;4newruntime/provenance records,1sharedcapability; existing module-boundary checker/tests and calc-core/calc-upstream-suspected-issues docs. No Writer core/browser behavior or existing border ownership migration yet; current border packed number representation will consume canonical owner when its native class is aligned, no second Color implementation. Calc branch/folder only."
  Plan: "Implement native default/copy/opaque24/RGB/taggedpacked/tagged4channel forms, both originaltag enums numeric0. C++ tagfamily erased inJS, so explicit trailing ColorTransparencyTag/ColorAlphaTag selector preserves original numericargs/tagvalues without guessing two0tags. Store one ordinary unsigned32number, no nativeheap/binarylayout engine. Original channel/alpha access/setters,RGB extraction,equality/order/colorerror/luminance/invert/merge and25nativeconstants; frozenconstvalues and independentcopies. Source-owned helpers implement WCAGnormalization/GetWCAGLuminance/IsDark/IsBright/IncreaseLuminance/DecreaseLuminance/DecreaseContrast with plainJS arithmetic, no basegfx libraryport. Only validbytecontrast domain needed, Math.round matches originalpositive bounded fround. ActualAny extract/insert and erasedAny(Color) constructor live in originalToolsheader owner with actualsigned32transport, not a reverse CPPU->Tools import. Admit originalTools->Cppu edge andretainreverse/browser/applicationguards. Packed defaultshape blueexception dependsfull32value includingtransparency, recordCALC112 with source-level literalcase. HSB/string/OUString/BColor/HSL/tint/logging methods remain explicitlypending, no stubs or fakecoloritem/DocPool/document. Strict complete shared2owners and wholeCalc raw100, relatednativevalue/Any tests,12focusedgates31boundarytests,freshbaseline/nativepins/same-agentEVAL/APfinishclean. Full onlytrue minimumUI+same-modelODSread/save readiness then fixes/pause; no tiny-rounding/nativebinarysidequest."
  Verify Steps: "Compare original include/tools/color.hxx value constructors/constants/Any operators and source tools/source/generic/color.cxx basicluminance/contrast with native tools/qa/cppunit/test_color.cxx applicableassertions. Literalalltagfamilies/values/UInt32signedcasts/channels/alpha0/255/defaultblack/opaqueguard/copyassignment/ordering/RGBequal versus alpha/everyconstant/mergeendpointsandinterior/invert/error/luminance clamp,WCAGbelowthreshold+nonlinearandpackedshapeexception,contrast0/nonzero. ActualAny LONGandUInt32admission failureunchanged, ColorToAny andinsertcolor actualtype andsignedvalue. CalcfontAUTO/backgroundTRANSPARENT colorvaluecopies withoutfakeitem/provider. Whole npm run test:coverage:calc andstrictrelatedshared wholebothowners100S/B/F/L everycounterpositive,4reference linksabsent/restoredfinally.12focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff,31moduleboundarytests exactnativeTools->Cppu andoriginalreverse/app/browserguards. Exact13paths4existing9new,freshGitbaseline/nativeSHA256pins/actualGitHEAD,same-agentreviewnotindependent,APcloseclean calc. NativeHSB/HSL/strings/BColor andfullDocPool/document/UI/ODS notcertified; no full/browserrun beforehuman readinesscheckpoint."
  Verification: |-
    Command: node output/playwright/task128-checks/portable.mjs. Result: pass. Evidence: related7tests1file2complete sharedowners107S27B42F105L, wholeCalc171tests66files33owners4161S2731B821F3709L; all100 and every rawcounter positive. Four source symlinks absent during both runtime runs and restoredfinally. Scope: original logical Color constructors/25constants/channels/casts/ordering/copy/merge/invert/luminance/contrast and actual Any, Calc sentinel roles without fake attribute provider.

    Command: node output/playwright/task128-checks/gates.mjs; npm run inventory:parity after exact operation record; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence:11other finalgates and31boundarytests pass, registry final rerun passed. Initial source checks overlapped portability reference removal and reported ENOENT; serialized retry fixed this scheduling error. Subsequent registry required exported insertColor operation record; added same-operation canonical inventory metadata, no code workaround. Logs retained. Scope: exact14paths4existing10new,3685to3695sourceblobs,6nativeSHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Same-agent review is not independent. No numeric library or binary memory model.

    Skipped: full application/browser suites. Reason: no UI or Writer runtime changed; explicit human full-run checkpoint requires actual minimum UI and same-model ODS readiness, still pending. Risk: whole application and advanced Color APIs not recertified. Approval: human related-test/readiness/pause instructions. Shared SvxBorderLine and Writer color consumers explicitly authorized for next task.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T13:41:38.973Z — VERIFY — ok

    By: CODER

    Note: Shared Color7tests and Calc171tests pass strict raw100;12gates31boundarytests; exact source669fbc5f3dc6,14paths3695hashes6nativepins; same-agent review not independent. Full readiness checkpoint still pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T13:41:29.614Z, excerpt_hash=sha256:971111bbcbcc8dd89820ed69cf365181f74e77dc13c4a928761534b03c152af7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141326-GENBJF/blueprint/resolved-snapshot.json
    - old_digest: 78f152aa6c51327bde9243c914b00f6fea0715e46edaa98cb0137abce1e512d0
    - current_digest: 78f152aa6c51327bde9243c914b00f6fea0715e46edaa98cb0137abce1e512d0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141326-GENBJF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141326-GENBJF -m 🧩 GENBJF task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
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

Command: node output/playwright/task128-checks/portable.mjs. Result: pass. Evidence: related7tests1file2complete sharedowners107S27B42F105L, wholeCalc171tests66files33owners4161S2731B821F3709L; all100 and every rawcounter positive. Four source symlinks absent during both runtime runs and restoredfinally. Scope: original logical Color constructors/25constants/channels/casts/ordering/copy/merge/invert/luminance/contrast and actual Any, Calc sentinel roles without fake attribute provider.

Command: node output/playwright/task128-checks/gates.mjs; npm run inventory:parity after exact operation record; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence:11other finalgates and31boundarytests pass, registry final rerun passed. Initial source checks overlapped portability reference removal and reported ENOENT; serialized retry fixed this scheduling error. Subsequent registry required exported insertColor operation record; added same-operation canonical inventory metadata, no code workaround. Logs retained. Scope: exact14paths4existing10new,3685to3695sourceblobs,6nativeSHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Same-agent review is not independent. No numeric library or binary memory model.

Skipped: full application/browser suites. Reason: no UI or Writer runtime changed; explicit human full-run checkpoint requires actual minimum UI and same-model ODS readiness, still pending. Risk: whole application and advanced Color APIs not recertified. Approval: human related-test/readiness/pause instructions. Shared SvxBorderLine and Writer color consumers explicitly authorized for next task.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T13:41:38.973Z — VERIFY — ok

By: CODER

Note: Shared Color7tests and Calc171tests pass strict raw100;12gates31boundarytests; exact source669fbc5f3dc6,14paths3695hashes6nativepins; same-agent review not independent. Full readiness checkpoint still pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T13:41:29.614Z, excerpt_hash=sha256:971111bbcbcc8dd89820ed69cf365181f74e77dc13c4a928761534b03c152af7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141326-GENBJF/blueprint/resolved-snapshot.json
- old_digest: 78f152aa6c51327bde9243c914b00f6fea0715e46edaa98cb0137abce1e512d0
- current_digest: 78f152aa6c51327bde9243c914b00f6fea0715e46edaa98cb0137abce1e512d0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141326-GENBJF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141326-GENBJF -m 🧩 GENBJF task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task sourcecommit and traceable artifacts if needed; preserve user/unrelated work and prior canonical owners.

## Findings

Preflight clean calc, source Color absent locally while Writer SvxBorderLine holds packed numericvalue. Need canonicalTools Color before native color/brush/line attribute owners, no duplicate CSS colorengine. Original tags bothnumeric0 require explicit erasedfamily selection, no guessing basedonpackedvalue. C++single-opaque constructor compile/assert domain is0..0xffffff, modelcheckedJSboundary. Originalfull32shape-color specialcase canchange IsDark for sameRGBwithdifferentalpha; source behaviorpreserved CALC112, notdeclared upstreambug. Basicnumericmethods only here, advancedcolorconversion postponed toactualconsumerneed. Humanrounding directive ordinaryJS/meaningfulboundaries, no native/libraryport.

Original constant count corrected from planning typo27 to native25; all25 enumerated explicitly. The first gate run accidentally overlapped reference-independent portability checks, during which four upstream symlinks are intentionally absent. Provenance and inventory reported ENOENT (retained initial logs), while ten other gates passed. This is verification scheduling error, not an application failure; rerun source-dependent checks only after portable runner restores links. No code changes or criterion relaxation needed. Shared Color7tests already pass with107statements/27branches/42functions/105lines and every raw counter covered.

Inventory also requires an exact operation record for every exported mutation helper; add the canonical shared insertColor operation record alongside the already approved Color runtime/provenance/capability metadata. This is required traceability within the same operation, no runtime/scope expansion. Final exact14paths4existing10new, source3685to3695. Initial registry diagnostic retained.
