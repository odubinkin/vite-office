---
id: "202610141439-YHP1GV"
title: "Implement canonical UNO complex-color and theme interface contracts"
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
  updated_at: "2026-10-14T14:41:12.514Z"
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
    body: "Start: original offapi normal color/theme type contracts over existing CPPU; actual typed-null interfaces, no component/default provider or memory engine."
events:
  -
    type: "status"
    at: "2026-10-14T14:41:21.319Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original offapi normal color/theme type contracts over existing CPPU; actual typed-null interfaces, no component/default provider or memory engine."
doc_version: 3
doc_updated_at: "2026-10-14T14:41:21.319Z"
doc_updated_by: "CODER"
description: "Task132: actual offapi Color typedef, XTheme/XComplexColor structural interfaces and original cppumaker-normal static type getters using existing CPPU. Normal offapi build route confirmed from upstream gbuild/cppumaker, no comprehensive method metadata substitute or new memory engine. Actual Any/Reference typed-null and scalar alias integration for Calc; component implementations and full ColorItem Any remain later."
sections:
  Summary: "Task132 supplies native offapi Color typedef and XTheme/XComplexColor interface/type contracts needed for actual SvxColorItem complex Any transport. Reuse existing CPPU static interface factory, UnoType, Type, Reference and Sequence types. Success: exact IDL methods/types, original normal offapi type initialization/cache/auto-root metadata and real Any/Reference nullable admission; strict shared/Calc100, inventory and clean calc. Full run only actual minimum UI+ODS readiness then pause."
  Scope: "At most18paths: new offapi/com/sun/star/util/{Color,XTheme,XComplexColor}.ts, a shared native-color-interfaces.test.ts and Calc color-uno-types.test.ts; exact shared runtime/provenance records for3declarations plus one capability; calc-core progress. No existing CPPU owners changed, no new interface factory/type library/default provider/WeakImplHelper/lifetime engine, no full ColorItem Any claims. Native real component wrappers and helper inheritance remain later."
  Plan: "Native offapi Color/XTheme/XComplexColor declarations and normal static type binding, confirmed from upstream build route; reuse existing CPPU with actual typed-null Any/Reference and LONG alias tests, no fake component/helper. Strict2executableowners plus type-only alias and wholeCalc100;12gates33boundaries and inventory/native/sourcehash closure. No full before UI/ODS readiness."
  Verify Steps: "Read native util/Color.idl, XTheme.idl, XComplexColor.idl; codemaker cpputype.cxx InterfaceType::dumpNormalGetCppuType and constructordefaultdynamic, cppuoptions defaultnormal vs-L/-C, solenv/gbuild/UnoApiTarget.mk offapi normal and udkapi comprehensive selection. Compare actual CPPU static_types.cxx static_mi auto-XInterface and original placeholder fields. All declared methods use actual shared types; cold/warm ADL/static/getCppuType reference forms must return same live borrowed Type and distinct interface names; real Any LONG Color alias and actual typed-null Reference/extract/query succeed according to native interface/null logic, wrongbool extract false unchanged. Strict raw S/B/F/L100 of both executable new modules (type-only Color has no runtime counters) and npm run test:coverage:calc;4native links absent/restoredfinally.12format/lint/typecheck/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff plus33existingboundarytests. Exactallowlist/sourcehash/nativepins/actualHEADclean calc. No certification of non-null components/fullReflection/WeakImplHelper or ColorItemAny/UI/ODS yet."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task source/metadata with a later authorized task. Never reset unrelated tasks, merge or publish."
  Findings: "Previous goal turn made authoritative progress: real shared ColorItem values and actual Calc109 clone defaults completed. Preflight clean calc. Native normal offapi getters are canonical and reuse existing static_mi initializer; full comprehensive metadata used by some existing udkapi interfaces is a separate native build mode, not necessary to imitate here. Normal type info has incomplete reflection fields by source design; this does not substitute a fake interface/provider. Native util::Color is typedef long, not an XColor interface; no such XColor IDL exists in this dependency path. Reference<T> and Sequence<E> already generic in shared CPPU, reuse exactly. Real UnoComplexColor resolveColor ignores theme and returns stored final color; actual wrapper/helpers remain pending. Color alias evidence must cite complete published typedef long Color declaration beyond basename-only name. No network or low-level memory implementation."
id_source: "generated"
---
## Summary

Task132 supplies native offapi Color typedef and XTheme/XComplexColor interface/type contracts needed for actual SvxColorItem complex Any transport. Reuse existing CPPU static interface factory, UnoType, Type, Reference and Sequence types. Success: exact IDL methods/types, original normal offapi type initialization/cache/auto-root metadata and real Any/Reference nullable admission; strict shared/Calc100, inventory and clean calc. Full run only actual minimum UI+ODS readiness then pause.

## Scope

At most18paths: new offapi/com/sun/star/util/{Color,XTheme,XComplexColor}.ts, a shared native-color-interfaces.test.ts and Calc color-uno-types.test.ts; exact shared runtime/provenance records for3declarations plus one capability; calc-core progress. No existing CPPU owners changed, no new interface factory/type library/default provider/WeakImplHelper/lifetime engine, no full ColorItem Any claims. Native real component wrappers and helper inheritance remain later.

## Plan

Native offapi Color/XTheme/XComplexColor declarations and normal static type binding, confirmed from upstream build route; reuse existing CPPU with actual typed-null Any/Reference and LONG alias tests, no fake component/helper. Strict2executableowners plus type-only alias and wholeCalc100;12gates33boundaries and inventory/native/sourcehash closure. No full before UI/ODS readiness.

## Verify Steps

Read native util/Color.idl, XTheme.idl, XComplexColor.idl; codemaker cpputype.cxx InterfaceType::dumpNormalGetCppuType and constructordefaultdynamic, cppuoptions defaultnormal vs-L/-C, solenv/gbuild/UnoApiTarget.mk offapi normal and udkapi comprehensive selection. Compare actual CPPU static_types.cxx static_mi auto-XInterface and original placeholder fields. All declared methods use actual shared types; cold/warm ADL/static/getCppuType reference forms must return same live borrowed Type and distinct interface names; real Any LONG Color alias and actual typed-null Reference/extract/query succeed according to native interface/null logic, wrongbool extract false unchanged. Strict raw S/B/F/L100 of both executable new modules (type-only Color has no runtime counters) and npm run test:coverage:calc;4native links absent/restoredfinally.12format/lint/typecheck/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff plus33existingboundarytests. Exactallowlist/sourcehash/nativepins/actualHEADclean calc. No certification of non-null components/fullReflection/WeakImplHelper or ColorItemAny/UI/ODS yet.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task source/metadata with a later authorized task. Never reset unrelated tasks, merge or publish.

## Findings

Previous goal turn made authoritative progress: real shared ColorItem values and actual Calc109 clone defaults completed. Preflight clean calc. Native normal offapi getters are canonical and reuse existing static_mi initializer; full comprehensive metadata used by some existing udkapi interfaces is a separate native build mode, not necessary to imitate here. Normal type info has incomplete reflection fields by source design; this does not substitute a fake interface/provider. Native util::Color is typedef long, not an XColor interface; no such XColor IDL exists in this dependency path. Reference<T> and Sequence<E> already generic in shared CPPU, reuse exactly. Real UnoComplexColor resolveColor ignores theme and returns stored final color; actual wrapper/helpers remain pending. Color alias evidence must cite complete published typedef long Color declaration beyond basename-only name. No network or low-level memory implementation.
