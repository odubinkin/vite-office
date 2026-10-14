---
id: "202610141543-FD83RF"
title: "Implement shared weak-object adapter protocol using native JavaScript GC"
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
  updated_at: "2026-10-14T15:44:30.796Z"
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
    body: "Start: implement shared native weak-object/adapter protocol with user-requested JS GC lifetime; preserve interface and listener behavior without new memory management."
events:
  -
    type: "status"
    at: "2026-10-14T15:44:40.299Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement shared native weak-object/adapter protocol with user-requested JS GC lifetime; preserve interface and listener behavior without new memory management."
doc_version: 3
doc_updated_at: "2026-10-14T15:44:40.299Z"
doc_updated_by: "CODER"
description: "Task134: actual OWeakObject/OWeakConnectionPoint XWeak/XAdapter protocol and integration with existing WeakReferenceHelper. Preserve interface identity, listener order/reentrancy/exceptions, use native WeakRef/FinalizationRegistry rather than C++ ownership counters. Required by real WeakImplHelper and UnoComplexColor. Standing human shared-code/JS-GC authorization."
sections:
  Summary: "Task134 supplies the actual shared OWeakObject/OWeakConnectionPoint protocol required by WeakImplHelper and the real UnoComplexColor component. Use native JS WeakRef/FinalizationRegistry as explicitly requested by the human; do not implement a new C++ refcount or memory engine. Preserve native XWeak/XAdapter/XInterface queries, listener behavior and existing WeakReferenceHelper interoperability. Clean calc branch only."
  Scope: "At most14paths: cppuhelper/source/weak.ts, cppuhelper/inc/weak.ts, focused weak-object.test.ts, existing weak source runtime/provenance records, new header runtime/provenance and capability records, calc-core and explicit browser-lifetime documentation plus task artifacts. Existing listener/helper behavior stays original. No aggregation/helper stub or fake color provider, no UI/ODS readiness claim. Native acquire/release virtual hooks of the new GC object/adapter are reachability-only; no added counters or synchronous delete simulation."
  Plan: "Task134: complete native weak-object/adapter public protocol using actual shared interfaces/references and standard JS GC lifetime, no new reference counts. Existing WeakReference integration, deep listener/reentrancy/exception tests, explicit timing adaptation docs and precise inventory, scope14paths. Wholechangedshared and Calc strict raw100,12gates/boundaries/nativepins/exactsource clean closure. No full checkpoint until minimum real UI/ODS ready."
  Verify Steps: "Native original queries: object XWeak/root and adapter XAdapter/root, unsupported empty Any, stable adapter identity, real queryAdapted hard Reference. Existing WeakReferenceHelper and typed WeakReference must work with the real new object through actual Reference/Any and disposal protocol. Test registration duplicates and reverse removal, no-match removal, distinct client interface views with common root identity, clear/snapshot before callbacks, reentrancy, all callbacks after RuntimeException with last dynamic exception propagated then caught by owner, DisposedException ignored, unrelated JS exception propagated with pending-reference cleanup. Original protected cleanup is idempotent and old adapter stays null after new adapter creation. Test native GC no-op virtual hooks do not simulate counts/delete. No forced GC/finalization-time assertions or mock WeakRef/FinalizationRegistry. Actual finalizer registers the same exercised cleanup function; collection timing is explicitly unverified. Existing weakref.test.ts fixture replay unchanged, full weak.ts shared owner100 raw S/B/F/L with every raw counter positive; npm run test:coverage:calc100;4native links absent/restoredfinally.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates and module boundaries pass. Record current source hashes/native pins/same-agent review limitation and final clean calc. No new C++ build/native probes, thresholds or maps changed."
  Verification: "Pending."
  Rollback Plan: "Revert only this task changes in a subsequent authorized task; no reset, merge or publication."
  Findings: "Previous task133 made verified authoritative progress: real Type sequence element methods/aliasing. Preflight clean calc at51ab912b. Existing weak.ts has listener/helper implementation but no real weak object/connection point. Native OWeakObject release triggers deletion/notification at refcount0; explicit user instructs JS GC instead of custom memory mechanisms, so new object hooks carry no counter and GC timing is deliberately distinct. Existing logical value/reference owners are reused unchanged. Same-agent EVALUATOR is not independent. Helpers/component/ColorItem Any and actual document/UI/ODS remain pending. Avoid task complete shortcut generic-result closure issue from133; canonical finish with concrete result and source commit."
id_source: "generated"
---
## Summary

Task134 supplies the actual shared OWeakObject/OWeakConnectionPoint protocol required by WeakImplHelper and the real UnoComplexColor component. Use native JS WeakRef/FinalizationRegistry as explicitly requested by the human; do not implement a new C++ refcount or memory engine. Preserve native XWeak/XAdapter/XInterface queries, listener behavior and existing WeakReferenceHelper interoperability. Clean calc branch only.

## Scope

At most14paths: cppuhelper/source/weak.ts, cppuhelper/inc/weak.ts, focused weak-object.test.ts, existing weak source runtime/provenance records, new header runtime/provenance and capability records, calc-core and explicit browser-lifetime documentation plus task artifacts. Existing listener/helper behavior stays original. No aggregation/helper stub or fake color provider, no UI/ODS readiness claim. Native acquire/release virtual hooks of the new GC object/adapter are reachability-only; no added counters or synchronous delete simulation.

## Plan

Task134: complete native weak-object/adapter public protocol using actual shared interfaces/references and standard JS GC lifetime, no new reference counts. Existing WeakReference integration, deep listener/reentrancy/exception tests, explicit timing adaptation docs and precise inventory, scope14paths. Wholechangedshared and Calc strict raw100,12gates/boundaries/nativepins/exactsource clean closure. No full checkpoint until minimum real UI/ODS ready.

## Verify Steps

Native original queries: object XWeak/root and adapter XAdapter/root, unsupported empty Any, stable adapter identity, real queryAdapted hard Reference. Existing WeakReferenceHelper and typed WeakReference must work with the real new object through actual Reference/Any and disposal protocol. Test registration duplicates and reverse removal, no-match removal, distinct client interface views with common root identity, clear/snapshot before callbacks, reentrancy, all callbacks after RuntimeException with last dynamic exception propagated then caught by owner, DisposedException ignored, unrelated JS exception propagated with pending-reference cleanup. Original protected cleanup is idempotent and old adapter stays null after new adapter creation. Test native GC no-op virtual hooks do not simulate counts/delete. No forced GC/finalization-time assertions or mock WeakRef/FinalizationRegistry. Actual finalizer registers the same exercised cleanup function; collection timing is explicitly unverified. Existing weakref.test.ts fixture replay unchanged, full weak.ts shared owner100 raw S/B/F/L with every raw counter positive; npm run test:coverage:calc100;4native links absent/restoredfinally.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates and module boundaries pass. Record current source hashes/native pins/same-agent review limitation and final clean calc. No new C++ build/native probes, thresholds or maps changed.

## Verification

Pending.

## Rollback Plan

Revert only this task changes in a subsequent authorized task; no reset, merge or publication.

## Findings

Previous task133 made verified authoritative progress: real Type sequence element methods/aliasing. Preflight clean calc at51ab912b. Existing weak.ts has listener/helper implementation but no real weak object/connection point. Native OWeakObject release triggers deletion/notification at refcount0; explicit user instructs JS GC instead of custom memory mechanisms, so new object hooks carry no counter and GC timing is deliberately distinct. Existing logical value/reference owners are reused unchanged. Same-agent EVALUATOR is not independent. Helpers/component/ColorItem Any and actual document/UI/ODS remain pending. Avoid task complete shortcut generic-result closure issue from133; canonical finish with concrete result and source commit.
