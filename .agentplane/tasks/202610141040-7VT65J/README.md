---
id: "202610141040-7VT65J"
title: "Implement signed item values and Calc cell rotation attributes"
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
  updated_at: "2026-10-14T10:41:15.957Z"
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
    body: "Start: implement approved signed/angle value chain and Calc rotation with primitive Degree100 unit binding, actual shared Any/hash, no generic memory/strong-int library."
events:
  -
    type: "status"
    at: "2026-10-14T10:41:33.984Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved signed/angle value chain and Calc rotation with primitive Degree100 unit binding, actual shared Any/hash, no generic memory/strong-int library."
doc_version: 3
doc_updated_at: "2026-10-14T10:47:38.947Z"
doc_updated_by: "CODER"
description: "Task116: actual shared signed32/SdrAngle item values and original ScRotateValueItem for DocPool. Primitive Degree100 unit alias erases native strong_int, existing Any/hash reused; no native memory library. WholeCalc/changedshared raw100 and scoped checks, full121next."
sections:
  Summary: "Implement original signed32 and angle item value prerequisites for Calc rotation/DocPool, sharing genuine SVL/SVX/tools owners. Approved user continuation, branchcalc only/no merges."
  Scope: "Twelve runtime owners: existing SVL cintitem/intitem source+headers, existing o3tl hash helper contract comment, new tools/inc/degree.ts Degree100 primitive type alias, new SVX sdangitm header/svdraw/svdattr core for actual SdrAngle values; existing Calc attrib.values/attrib/incattrib/scitems. Four tests new signed/angle/Calcrotation and extended hash test; exact SVX→tools/header responsibility checker plus tests,24runtime/provenance records,2capabilities,3Calc docs. Expected47intentional paths. No generic strong_int or memory engine, localized presentation/diagnostics/native caches/ABI/full document/UI/ODS scope."
  Plan: "Port original CntInt32Item explicit signed32 values/implicitcopy/mutation/equality/hash/actual Any queries and writes/Clone and SfxInt32 defaultfactory/copy/Clone. Reuse existing shared signed32 extraction and o3tl hash arithmetic, broaden explicit key contract/testing to signed32 identity binding with unsigned seed modular arithmetic, no hash algorithm change or generic std::hash certification. Primitive Degree100 alias preserves hundredths signed32 unit; original strong_int construction/get unwrap into the scalar boundary, no wrapper library. SdrAngle value/copy/get/set/Clone retainingWhich in actual SVX header/core owners; Calc ScRotateValueItem requires angle, implicitcopy retainsWhich, value-based Clone restores135 and DocPool explicitly0. Do not normalize negative/multiple-turn angle values. Constructor/SetValue signed32 JS bounds explicit same as existing browser numeric item domains. Tests on actual owners, full raw100 profiles source-absent, related prior unsigned/Any/Writer consumers/checker and12focused gates. Native sources pinned/currentGitbaseline exact47pathreview; same-agent EVAL not independent, APverify/finishclean. Full121next, goalactive."
  Verify Steps: |-
    1. Read complete pinned CntInt32/SfxInt32 value/header/factory bodies, SdrAngle header/Clone, toolsDegree100 declaration, Calc ctor/Clone/DocPool/Which135, existing Any signed32 extraction and hash algorithm. Verify actual copy/default/value/mutation/equality/hash/Any/failure/Clone histories, full signed32 bounds and degree units with negative/multiple-turn no-normalization. Source-backed tests, no fake provider/document or compiled C++/sanitizer.
    2. Whole Calc and complete changed shared cintitem/intitem/hash/SdrAngle owners rawS/B/F/L100 everycounterpositive, all4reference links absent/restoredfinally. Retain source-bound maps and related old unsigned/Any/Writer numeric tests, targeted module checker. No Writer-only coverage repairs/full replay before121.
    3. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff; nativepins/currentcommitted47intentionalpaths/freshGitbaseline exacthashes. Explicit primitive unit/type/unsigned seed binding limitations, same-agent EVAL not independent; APverify/cleanfinish oncalc, original goalactive and actual document/UI/ODS pending.
  Verification: |-
    Command: node output/playwright/task116-checks/portable.mjs
    Result: final wholeCalc161tests57files33owners rawS4136/B2731/F821/L3684; related85tests8files complete4changedowners rawS134/B106/F46/L124. All S/B/F/L100/everycounterpositive required and audited before final verification. All4source links absent/restoredfinally. Initial profile passed; final profile repeats after signed native-zero refinement and comment corrections. Existing unsigned/pool/Writer/Any consumers retained.
    Command: npx vitest run scripts/check-module-boundaries.test.ts
    Result: pass26tests for exact SVX→tools/header ownership and existing reverse/browser boundaries.
    Command: node output/playwright/task116-checks/gates.mjs
    Result: final12focused gates and current-source maps/hash audit recorded before final APverify. Exact47intentionalpaths, fresh3493Gitbaseline/current3507hashes and15nativepins checked. Same-agent EVAL not independent review.
    Full office/browser/static scheduled121 per user cadence; no Writer-only coverage repair or native compilation.
  Rollback Plan: "Revert only task116 source commit preserving tasks113-115 and user merges. No reset/branchintegration, unrelated task mutation or outside-repo artifacts."
  Findings: "Initial161Calc/85related tests and26module tests and12gates passed firsttime strict raw100. Final source review found generated signed-method comments still said unsigned; corrected comments/file overviews. Refined actual signed32 primitive binding so JS -0 becomes native integer0 in SetValue/PutValue, with new real signed and Calc angle assertions; no angle normalization or valid integer-range change. Final wholeCalc/related profiles rerun against these exact sources and focused gates refreshed. Existing hash arithmetic unchanged; signed32 key contract and independent unsigned32/64 modular reference cases added. Degree100 is deliberately an erased number unit alias, preserving hundredths and signed32 boundaries without a strong_int library/wrapper. Original SdrAngle GetValue/SetValue/Clone contracts and Calc copy/Clone Which histories retained. CALC102records source-only signed-minimum presentation negation suspicion; no invented native outcome, native probe or correction. Existing numeric/pool/Writer/Any assertions preserved. Native presentation/locale/diagnostics/caches/invalid domains/ABI/full document/UI/ODS pending/excluded; no fake provider/document or memory engine. Same-agent evaluator not independent. Goalactive, full121next."
id_source: "generated"
---
## Summary

Implement original signed32 and angle item value prerequisites for Calc rotation/DocPool, sharing genuine SVL/SVX/tools owners. Approved user continuation, branchcalc only/no merges.

## Scope

Twelve runtime owners: existing SVL cintitem/intitem source+headers, existing o3tl hash helper contract comment, new tools/inc/degree.ts Degree100 primitive type alias, new SVX sdangitm header/svdraw/svdattr core for actual SdrAngle values; existing Calc attrib.values/attrib/incattrib/scitems. Four tests new signed/angle/Calcrotation and extended hash test; exact SVX→tools/header responsibility checker plus tests,24runtime/provenance records,2capabilities,3Calc docs. Expected47intentional paths. No generic strong_int or memory engine, localized presentation/diagnostics/native caches/ABI/full document/UI/ODS scope.

## Plan

Port original CntInt32Item explicit signed32 values/implicitcopy/mutation/equality/hash/actual Any queries and writes/Clone and SfxInt32 defaultfactory/copy/Clone. Reuse existing shared signed32 extraction and o3tl hash arithmetic, broaden explicit key contract/testing to signed32 identity binding with unsigned seed modular arithmetic, no hash algorithm change or generic std::hash certification. Primitive Degree100 alias preserves hundredths signed32 unit; original strong_int construction/get unwrap into the scalar boundary, no wrapper library. SdrAngle value/copy/get/set/Clone retainingWhich in actual SVX header/core owners; Calc ScRotateValueItem requires angle, implicitcopy retainsWhich, value-based Clone restores135 and DocPool explicitly0. Do not normalize negative/multiple-turn angle values. Constructor/SetValue signed32 JS bounds explicit same as existing browser numeric item domains. Tests on actual owners, full raw100 profiles source-absent, related prior unsigned/Any/Writer consumers/checker and12focused gates. Native sources pinned/currentGitbaseline exact47pathreview; same-agent EVAL not independent, APverify/finishclean. Full121next, goalactive.

## Verify Steps

1. Read complete pinned CntInt32/SfxInt32 value/header/factory bodies, SdrAngle header/Clone, toolsDegree100 declaration, Calc ctor/Clone/DocPool/Which135, existing Any signed32 extraction and hash algorithm. Verify actual copy/default/value/mutation/equality/hash/Any/failure/Clone histories, full signed32 bounds and degree units with negative/multiple-turn no-normalization. Source-backed tests, no fake provider/document or compiled C++/sanitizer.
2. Whole Calc and complete changed shared cintitem/intitem/hash/SdrAngle owners rawS/B/F/L100 everycounterpositive, all4reference links absent/restoredfinally. Retain source-bound maps and related old unsigned/Any/Writer numeric tests, targeted module checker. No Writer-only coverage repairs/full replay before121.
3. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff; nativepins/currentcommitted47intentionalpaths/freshGitbaseline exacthashes. Explicit primitive unit/type/unsigned seed binding limitations, same-agent EVAL not independent; APverify/cleanfinish oncalc, original goalactive and actual document/UI/ODS pending.

## Verification

Command: node output/playwright/task116-checks/portable.mjs
Result: final wholeCalc161tests57files33owners rawS4136/B2731/F821/L3684; related85tests8files complete4changedowners rawS134/B106/F46/L124. All S/B/F/L100/everycounterpositive required and audited before final verification. All4source links absent/restoredfinally. Initial profile passed; final profile repeats after signed native-zero refinement and comment corrections. Existing unsigned/pool/Writer/Any consumers retained.
Command: npx vitest run scripts/check-module-boundaries.test.ts
Result: pass26tests for exact SVX→tools/header ownership and existing reverse/browser boundaries.
Command: node output/playwright/task116-checks/gates.mjs
Result: final12focused gates and current-source maps/hash audit recorded before final APverify. Exact47intentionalpaths, fresh3493Gitbaseline/current3507hashes and15nativepins checked. Same-agent EVAL not independent review.
Full office/browser/static scheduled121 per user cadence; no Writer-only coverage repair or native compilation.

## Rollback Plan

Revert only task116 source commit preserving tasks113-115 and user merges. No reset/branchintegration, unrelated task mutation or outside-repo artifacts.

## Findings

Initial161Calc/85related tests and26module tests and12gates passed firsttime strict raw100. Final source review found generated signed-method comments still said unsigned; corrected comments/file overviews. Refined actual signed32 primitive binding so JS -0 becomes native integer0 in SetValue/PutValue, with new real signed and Calc angle assertions; no angle normalization or valid integer-range change. Final wholeCalc/related profiles rerun against these exact sources and focused gates refreshed. Existing hash arithmetic unchanged; signed32 key contract and independent unsigned32/64 modular reference cases added. Degree100 is deliberately an erased number unit alias, preserving hundredths and signed32 boundaries without a strong_int library/wrapper. Original SdrAngle GetValue/SetValue/Clone contracts and Calc copy/Clone Which histories retained. CALC102records source-only signed-minimum presentation negation suspicion; no invented native outcome, native probe or correction. Existing numeric/pool/Writer/Any assertions preserved. Native presentation/locale/diagnostics/caches/invalid domains/ABI/full document/UI/ODS pending/excluded; no fake provider/document or memory engine. Same-agent evaluator not independent. Goalactive, full121next.
