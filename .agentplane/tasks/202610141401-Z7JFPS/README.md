---
id: "202610141401-Z7JFPS"
title: "Implement shared complex-color value ownership for Calc attributes"
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
  updated_at: "2026-10-14T14:02:35.790Z"
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
    body: "Start: actual ComplexColor value owner required by native font/border items, using existing shared Color and browser logical scalar hashes."
events:
  -
    type: "status"
    at: "2026-10-14T14:02:46.114Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual ComplexColor value owner required by native font/border items, using existing shared Color and browser logical scalar hashes."
doc_version: 3
doc_updated_at: "2026-10-14T14:14:56.886Z"
doc_updated_by: "CODER"
description: "Task130: native docmodel ComplexColor value state, theme and transformation contracts required by actual SvxColorItem and border attributes. Reuse existing Tools Color and o3tl hashes with explicit browser logical hash binding; preserve suspicious original equality/hash fields, document. Real transform application and HSL numeric helpers remain absent until actual native Color prerequisites, no fake identity implementation. No substitute pool or provider."
sections:
  Summary: "Task130 implements actual shared docmodel ComplexColor value ownership for native Calc font/border attribute prerequisites, reusing Tools Color and o3tl. Success: native default/copy/system/theme/component/transformation state and original comparison/hash field contracts, strict whole changed owners and Calc100; no fake color attribute pool. Work only calc checkout. Full run only actual minimum UI+ODS readiness then pause."
  Scope: "At most24paths: new docmodel/inc/color/ComplexColor.ts, Transformation.ts and docmodel/inc/theme/ThemeColorType.ts plus their tests; actual Calc sentinel test integration; exact shared runtime/provenance/capability inventory; scripts/check-module-boundaries graph/test for docmodel->tools/o3tl only; calc-core progress and calc-upstream-suspected-issues. Actual Color transformation application and related BColor/HSL prerequisites remain unported, no identity fallback or provider. No Writer runtime changes."
  Plan: "Native ComplexColor/Transformation/theme value state for real Calc color attributes, actual Color and existing logical hashes; no fake transform application. Theme tables/index via equivalent JS min/max. Strict whole shared and Calc raw100,12gates32boundaries, inventory/native pins and exactsource review. No full before actual UI/ODS readiness."
  Verify Steps: "Read include/docmodel/color/ComplexColor.hxx, docmodel/source/color/ComplexColor.cxx, include/docmodel/color/Transformation.hxx, include/docmodel/theme/ThemeColorType.hxx and exact RGB/HSL luminance from basegfx/source/color/bcolortools.cxx. Literal default/copy/assignment/unused-system/validtheme/mixed RGB CRGB HSL/rawcomponents/getRGB unchangedoutputs/transformation copies/add/remove/clear/all enum values/hashfields/equalityshortcircuits/alias-safeassign/source-dependent transparency/no finalization-sideeffect; all5x6lumtables and threshold boundaries/effect creation. Strict related coverage6wholeowners with original Color/hash tests plus all new tests, and npm run test:coverage:calc, raw S/B/F/L100 everycounterpositive. Runtimechecks4source symlinks absent/restoredfinally.12focusedgates and32moduleboundarytests; exactallowlist/sourcehash/nativepins actualHEAD clean calc. No full app/browser since actual readiness pending and no UI/Writer runtime changes."
  Verification: "Pending implementation and declared verification."
  Rollback Plan: "Revert this task implementation and records through a future authorized task. Never reset unrelated tasks or merge branches."
  Findings: |-
    Previous goal turn made authoritative progress: Color base and shared/Writer border consumers completed. Preflight now clean calc. Actual SvxColorItem requires an owned ComplexColor even for ordinary font colors; no fake empty peer. Native equality ignores ThemeColorUsage and final color, while getHash includes final and omits theme type, potential inconsistency to retain. Existing hash-combine numbers provide logical browser hashes, not native binary ABI; no native C++/memory probes. Original getIndex only consumes HSL luminance=(max+min)/2, implemented with native JS Math on normalized channels rather than unused vector hierarchy.

    Initial typecheck required explicit bounded array index assertions for valid native vector/table domains; no runtime bounds or fallback behavior introduced. Initial10of12staticgates passed; lint required literal enum LAST11 and valid return overload signatures, docs required callback JSDoc. Native getRGB Color/void overloads now explicit and implementation uses JS undefined, no semantic fallback. Initial diagnostics retained. Related15tests5files6wholeowners pass331S73B95F319L100, everyrawcounter verification pending runner completion. All new state is ordinary JS and actual existing Color; original 31system/29transformation/14theme enum entries and5x6tables tested. No C++ compilation, no geometry/numeric library port.

    New boundary assertion exposed a missing ownership-layer prefix for docmodel/inc despite allowed module edges. Register original shared-header layer so browser/package restrictions actually apply, retaining reverse/application restrictions. Existing31tests passed;32nd assertion now validates the new owner, original failure retained.

    Whole Calc172tests66files33owners pass4161S2731B821F3709L100; all related6owners331S73B95F319L raw100. All4native source symlinks absent during runtime checks/restoredfinally. No Writer runtime or UI changed, no browser replay or full checkpoint yet. Original docmodel has no qa directory and targeted editeng QA search returned no direct ComplexColor test; bounded fallback found real svx/qa/unit/xoutdev.cxx FillComplexColor theme/transform state assertions. That QA also requires native UNO wrappers still pending; evidence mapping does not certify the whole drawing/UNO test.

    Second lint pass exposed explicit duplicate enum literal11. Use the existing repository style of implicit sequential members with literal LAST11, retaining every native value and alias, without a lint-disable or rule relaxation. One multiline Alpha callback JSDoc was not matched by initial editing and is now added. Runtime owner syntax changed after successful tests, so recollect current runtime coverage once; retain all successful and initial diagnostic profiles.

    Final runtime recollection after enum syntax/docs change passes identical15related/172Calc test counts and identical raw100 counter totals, all4reference links restored. No merged/rebased counter map or replay beyond source-change justified verification.
id_source: "generated"
---
## Summary

Task130 implements actual shared docmodel ComplexColor value ownership for native Calc font/border attribute prerequisites, reusing Tools Color and o3tl. Success: native default/copy/system/theme/component/transformation state and original comparison/hash field contracts, strict whole changed owners and Calc100; no fake color attribute pool. Work only calc checkout. Full run only actual minimum UI+ODS readiness then pause.

## Scope

At most24paths: new docmodel/inc/color/ComplexColor.ts, Transformation.ts and docmodel/inc/theme/ThemeColorType.ts plus their tests; actual Calc sentinel test integration; exact shared runtime/provenance/capability inventory; scripts/check-module-boundaries graph/test for docmodel->tools/o3tl only; calc-core progress and calc-upstream-suspected-issues. Actual Color transformation application and related BColor/HSL prerequisites remain unported, no identity fallback or provider. No Writer runtime changes.

## Plan

Native ComplexColor/Transformation/theme value state for real Calc color attributes, actual Color and existing logical hashes; no fake transform application. Theme tables/index via equivalent JS min/max. Strict whole shared and Calc raw100,12gates32boundaries, inventory/native pins and exactsource review. No full before actual UI/ODS readiness.

## Verify Steps

Read include/docmodel/color/ComplexColor.hxx, docmodel/source/color/ComplexColor.cxx, include/docmodel/color/Transformation.hxx, include/docmodel/theme/ThemeColorType.hxx and exact RGB/HSL luminance from basegfx/source/color/bcolortools.cxx. Literal default/copy/assignment/unused-system/validtheme/mixed RGB CRGB HSL/rawcomponents/getRGB unchangedoutputs/transformation copies/add/remove/clear/all enum values/hashfields/equalityshortcircuits/alias-safeassign/source-dependent transparency/no finalization-sideeffect; all5x6lumtables and threshold boundaries/effect creation. Strict related coverage6wholeowners with original Color/hash tests plus all new tests, and npm run test:coverage:calc, raw S/B/F/L100 everycounterpositive. Runtimechecks4source symlinks absent/restoredfinally.12focusedgates and32moduleboundarytests; exactallowlist/sourcehash/nativepins actualHEAD clean calc. No full app/browser since actual readiness pending and no UI/Writer runtime changes.

## Verification

Pending implementation and declared verification.

## Rollback Plan

Revert this task implementation and records through a future authorized task. Never reset unrelated tasks or merge branches.

## Findings

Previous goal turn made authoritative progress: Color base and shared/Writer border consumers completed. Preflight now clean calc. Actual SvxColorItem requires an owned ComplexColor even for ordinary font colors; no fake empty peer. Native equality ignores ThemeColorUsage and final color, while getHash includes final and omits theme type, potential inconsistency to retain. Existing hash-combine numbers provide logical browser hashes, not native binary ABI; no native C++/memory probes. Original getIndex only consumes HSL luminance=(max+min)/2, implemented with native JS Math on normalized channels rather than unused vector hierarchy.

Initial typecheck required explicit bounded array index assertions for valid native vector/table domains; no runtime bounds or fallback behavior introduced. Initial10of12staticgates passed; lint required literal enum LAST11 and valid return overload signatures, docs required callback JSDoc. Native getRGB Color/void overloads now explicit and implementation uses JS undefined, no semantic fallback. Initial diagnostics retained. Related15tests5files6wholeowners pass331S73B95F319L100, everyrawcounter verification pending runner completion. All new state is ordinary JS and actual existing Color; original 31system/29transformation/14theme enum entries and5x6tables tested. No C++ compilation, no geometry/numeric library port.

New boundary assertion exposed a missing ownership-layer prefix for docmodel/inc despite allowed module edges. Register original shared-header layer so browser/package restrictions actually apply, retaining reverse/application restrictions. Existing31tests passed;32nd assertion now validates the new owner, original failure retained.

Whole Calc172tests66files33owners pass4161S2731B821F3709L100; all related6owners331S73B95F319L raw100. All4native source symlinks absent during runtime checks/restoredfinally. No Writer runtime or UI changed, no browser replay or full checkpoint yet. Original docmodel has no qa directory and targeted editeng QA search returned no direct ComplexColor test; bounded fallback found real svx/qa/unit/xoutdev.cxx FillComplexColor theme/transform state assertions. That QA also requires native UNO wrappers still pending; evidence mapping does not certify the whole drawing/UNO test.

Second lint pass exposed explicit duplicate enum literal11. Use the existing repository style of implicit sequential members with literal LAST11, retaining every native value and alias, without a lint-disable or rule relaxation. One multiline Alpha callback JSDoc was not matched by initial editing and is now added. Runtime owner syntax changed after successful tests, so recollect current runtime coverage once; retain all successful and initial diagnostic profiles.

Final runtime recollection after enum syntax/docs change passes identical15related/172Calc test counts and identical raw100 counter totals, all4reference links restored. No merged/rebased counter map or replay beyond source-change justified verification.
