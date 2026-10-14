---
id: "202610141401-Z7JFPS"
title: "Implement shared complex-color value ownership for Calc attributes"
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
doc_updated_at: "2026-10-14T14:02:46.114Z"
doc_updated_by: "CODER"
description: "Task130: native docmodel ComplexColor value state, theme and transformation contracts required by actual SvxColorItem and border attributes. Reuse existing Tools Color and o3tl hashes with explicit browser logical hash binding; preserve suspicious original equality/hash fields, document. Real transform application and HSL numeric helpers remain absent until actual native Color prerequisites, no fake identity implementation. No substitute pool or provider."
sections:
  Summary: "Task130 implements actual shared docmodel ComplexColor value ownership for native Calc font/border attribute prerequisites, reusing Tools Color and o3tl. Success: native default/copy/system/theme/component/transformation state and original comparison/hash field contracts, strict whole changed owners and Calc100; no fake color attribute pool. Work only calc checkout. Full run only actual minimum UI+ODS readiness then pause."
  Scope: "At most24paths: new docmodel/inc/color/ComplexColor.ts, Transformation.ts and docmodel/inc/theme/ThemeColorType.ts plus their tests; actual Calc sentinel test integration; exact shared runtime/provenance/capability inventory; scripts/check-module-boundaries graph/test for docmodel->tools/o3tl only; calc-core progress and calc-upstream-suspected-issues. Actual Color transformation application and related BColor/HSL prerequisites remain unported, no identity fallback or provider. No Writer runtime changes."
  Plan: "Native ComplexColor/Transformation/theme value state for real Calc color attributes, actual Color and existing logical hashes; no fake transform application. Theme tables/index via equivalent JS min/max. Strict whole shared and Calc raw100,12gates32boundaries, inventory/native pins and exactsource review. No full before actual UI/ODS readiness."
  Verify Steps: "Read include/docmodel/color/ComplexColor.hxx, docmodel/source/color/ComplexColor.cxx, include/docmodel/color/Transformation.hxx, include/docmodel/theme/ThemeColorType.hxx and exact RGB/HSL luminance from basegfx/source/color/bcolortools.cxx. Literal default/copy/assignment/unused-system/validtheme/mixed RGB CRGB HSL/rawcomponents/getRGB unchangedoutputs/transformation copies/add/remove/clear/all enum values/hashfields/equalityshortcircuits/alias-safeassign/source-dependent transparency/no finalization-sideeffect; all5x6lumtables and threshold boundaries/effect creation. Strict related coverage6wholeowners with original Color/hash tests plus all new tests, and npm run test:coverage:calc, raw S/B/F/L100 everycounterpositive. Runtimechecks4source symlinks absent/restoredfinally.12focusedgates and32moduleboundarytests; exactallowlist/sourcehash/nativepins actualHEAD clean calc. No full app/browser since actual readiness pending and no UI/Writer runtime changes."
  Verification: "Pending implementation and declared verification."
  Rollback Plan: "Revert this task implementation and records through a future authorized task. Never reset unrelated tasks or merge branches."
  Findings: "Previous goal turn made authoritative progress: Color base and shared/Writer border consumers completed. Preflight now clean calc. Actual SvxColorItem requires an owned ComplexColor even for ordinary font colors; no fake empty peer. Native equality ignores ThemeColorUsage and final color, while getHash includes final and omits theme type, potential inconsistency to retain. Existing hash-combine numbers provide logical browser hashes, not native binary ABI; no native C++/memory probes. Original getIndex only consumes HSL luminance=(max+min)/2, implemented with native JS Math on normalized channels rather than unused vector hierarchy."
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
