---
id: "202610112307-1TENVG"
title: "Port original weak reference listener and helper lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T23:09:29.289Z"
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
    body: "Start: implement complete original listener/helper weak-reference lifecycle in shared owners on calc; genuine full native and scoped raw100 evidence, source overload/order/exception behavior retained."
events:
  -
    type: "status"
    at: "2026-10-11T23:09:29.840Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement complete original listener/helper weak-reference lifecycle in shared owners on calc; genuine full native and scoped raw100 evidence, source overload/order/exception behavior retained."
doc_version: 3
doc_updated_at: "2026-10-11T23:09:29.840Z"
doc_updated_by: "CODER"
description: "Task53 implements complete original OWeakRefListener and WeakReferenceHelper plus typed WeakReference header wrapper over shared Reference/RuntimeException/XWeak/XAdapter/XReference; original native custom interface callers verify real weak-reference lifecycle, overload/copy/move/query/error ownership without OWeakObject substitutes. Direct calc only."
sections:
  Summary: "Task53 ports the complete original OWeakRefListener and WeakReferenceHelper lifecycle and WeakReference template wrapper. Real explicit listener/adapter ownership, overload differences, hardening, copy/move/query and source exception handling are shared service prerequisites, not GC weak substitutes."
  Scope: "Only calc branch/vite-office-calc. Runtime cppuhelper/source/weak.ts and cppuhelper/inc/weakref.ts; adjacent full native replay test/fixture and scripts/cppuhelper-weakref-native-probe.mjs. Reuse actual Reference/BaseReference/RuntimeException/OSL/XInterface/XWeak/XAdapter/XReference/Type/Any/queryInterface/UnoType owners and unchanged native build/caller utilities. Add2shared runtime/provenance records, one capability and Calc core journal; record genuine suspicious original cases if confirmed. Original OWeakObject/OWeakConnectionPoint/OWeakAggObject and generic C++-UNO exception bridge remain subsequent responsibilities in the same source family; no stub bodies or fake providers for them. Native observation caller supplies genuine concrete virtual interface implementations and controlled replies, not library implementations. Complete unchanged original weak.cxx compiled and linker dead-stripping of unused unrelated owners is allowed; do not ignore unresolved symbols, extract/replace bodies, fake an exception bridge or change original libraries. No new network, external access, branches/merges/subagents/Writer repair."
  Plan: "Read complete original include/cppuhelper/weakref.hxx and cppuhelper/source/weak.cxx. Port listener and helper whole bodies and original template wrapper with separate compile-time binding identity (no instance type provider) and explicit XWeak versus XInterface overload witness. Preserve constructor refcount1 gate then decrement, adapter return move/copy ownership, exact temporary Reference destruction, reverse member destruction, catch-only RuntimeException and state retention after exceptions. Existing native JS catch/finally plus existing atomic intrinsic suffice; no mutex/GC simulator. Generate actual original weak/adapter/reference/DisposedException declarations needed by full weak.cxx compilation. Build complete genuine unchanged original normal-ASan/UBSan owners and pure controlled virtual interface callers; observe whole initialized callback, pointer, list, ownership and metadata streams for cold/lifecycle/copy/move/root-versus-fast/typed/null/error/reentrant cases. Compare full fixture bytes and pure TypeScript replay, scoped source-absent Calc plus exact task52 shared profile append-only2wholeowners/new tests raw100. Restore3links exactly. Run13scoped gates plus exact authoredformat and independently audit committed implementation under EVALUATOR before verify/direct close. Last full51 next61."
  Verify Steps: "1. node scripts/cppuhelper-weakref-native-probe.mjs --write then --check: genuine pinned full weak.cxx and dependencies normal-ASan/UBSan, source/generated/config/caller hashes; exact initialized full native streams all equal and no fake library provider. Audit compiler/link argv and unused exception bridge dead-strip without unresolved-symbol suppression. 2. Adjacent pure caller replay observes exact actual public helper/listener/wrapper state, strong reference ownership, cold/order, copy/move/root-fast/typed/query/null/runtime/foreign/reentrant paths; no selected stream/hash subsets. 3. node output/playwright/task53-checks/portable.mjs with all3 source links absent together: npm run test:coverage:calc and exact task52 whole related shared argv append-only new test/2wholeowners; every raw S/F/B positive, S/B/F/L100, exact targets restored finally. 4. Full TS7 application/tools typecheck, exact authored ESLint/Prettier, docs,size,boundaries,source provenance/tree,shared+Calc inventory,related tooling tests,routing,doctor,diff pass. Keep broad parity flagsfalse and native/thread/physical/resource/fullconsumer limitations explicit. 5. Record actual implementation SHA before first independent EVALUATOR report, verify with ap, intentional commits only and clean direct finish. No full suite before61 absent genuine need."
  Verification: "Pending full native and portable implementation evidence; no runtime/lifecycle/UI readiness claim."
  Rollback Plan: "Always restore3original source link targets finally; retain failed/final native/scoped evidence. Revert only intentional task53 artifacts if needed; do not reset unrelated active tasks or Writer work."
  Findings: "Previous goal turn is concrete progress: task52 closed at27b47930b48e with5real shared generated UNO interface contracts, seven genuine full native replay streams and whole19/66Calc/shared raw100. The complete original weak.cxx separates listener/helper responsibilities from weak object/connection/aggregation and its generic exception bridge. Implement full listener/helper before the weak object family; no omission disguised as a whole weak.cxx implementation. Original WeakReferenceHelper overload catches and order are retained. Native thread synchronization/physical ABI/compiler-only/allocator/shutdown/full consumer QA remain unverified."
id_source: "generated"
---
## Summary

Task53 ports the complete original OWeakRefListener and WeakReferenceHelper lifecycle and WeakReference template wrapper. Real explicit listener/adapter ownership, overload differences, hardening, copy/move/query and source exception handling are shared service prerequisites, not GC weak substitutes.

## Scope

Only calc branch/vite-office-calc. Runtime cppuhelper/source/weak.ts and cppuhelper/inc/weakref.ts; adjacent full native replay test/fixture and scripts/cppuhelper-weakref-native-probe.mjs. Reuse actual Reference/BaseReference/RuntimeException/OSL/XInterface/XWeak/XAdapter/XReference/Type/Any/queryInterface/UnoType owners and unchanged native build/caller utilities. Add2shared runtime/provenance records, one capability and Calc core journal; record genuine suspicious original cases if confirmed. Original OWeakObject/OWeakConnectionPoint/OWeakAggObject and generic C++-UNO exception bridge remain subsequent responsibilities in the same source family; no stub bodies or fake providers for them. Native observation caller supplies genuine concrete virtual interface implementations and controlled replies, not library implementations. Complete unchanged original weak.cxx compiled and linker dead-stripping of unused unrelated owners is allowed; do not ignore unresolved symbols, extract/replace bodies, fake an exception bridge or change original libraries. No new network, external access, branches/merges/subagents/Writer repair.

## Plan

Read complete original include/cppuhelper/weakref.hxx and cppuhelper/source/weak.cxx. Port listener and helper whole bodies and original template wrapper with separate compile-time binding identity (no instance type provider) and explicit XWeak versus XInterface overload witness. Preserve constructor refcount1 gate then decrement, adapter return move/copy ownership, exact temporary Reference destruction, reverse member destruction, catch-only RuntimeException and state retention after exceptions. Existing native JS catch/finally plus existing atomic intrinsic suffice; no mutex/GC simulator. Generate actual original weak/adapter/reference/DisposedException declarations needed by full weak.cxx compilation. Build complete genuine unchanged original normal-ASan/UBSan owners and pure controlled virtual interface callers; observe whole initialized callback, pointer, list, ownership and metadata streams for cold/lifecycle/copy/move/root-versus-fast/typed/null/error/reentrant cases. Compare full fixture bytes and pure TypeScript replay, scoped source-absent Calc plus exact task52 shared profile append-only2wholeowners/new tests raw100. Restore3links exactly. Run13scoped gates plus exact authoredformat and independently audit committed implementation under EVALUATOR before verify/direct close. Last full51 next61.

## Verify Steps

1. node scripts/cppuhelper-weakref-native-probe.mjs --write then --check: genuine pinned full weak.cxx and dependencies normal-ASan/UBSan, source/generated/config/caller hashes; exact initialized full native streams all equal and no fake library provider. Audit compiler/link argv and unused exception bridge dead-strip without unresolved-symbol suppression. 2. Adjacent pure caller replay observes exact actual public helper/listener/wrapper state, strong reference ownership, cold/order, copy/move/root-fast/typed/query/null/runtime/foreign/reentrant paths; no selected stream/hash subsets. 3. node output/playwright/task53-checks/portable.mjs with all3 source links absent together: npm run test:coverage:calc and exact task52 whole related shared argv append-only new test/2wholeowners; every raw S/F/B positive, S/B/F/L100, exact targets restored finally. 4. Full TS7 application/tools typecheck, exact authored ESLint/Prettier, docs,size,boundaries,source provenance/tree,shared+Calc inventory,related tooling tests,routing,doctor,diff pass. Keep broad parity flagsfalse and native/thread/physical/resource/fullconsumer limitations explicit. 5. Record actual implementation SHA before first independent EVALUATOR report, verify with ap, intentional commits only and clean direct finish. No full suite before61 absent genuine need.

## Verification

Pending full native and portable implementation evidence; no runtime/lifecycle/UI readiness claim.

## Rollback Plan

Always restore3original source link targets finally; retain failed/final native/scoped evidence. Revert only intentional task53 artifacts if needed; do not reset unrelated active tasks or Writer work.

## Findings

Previous goal turn is concrete progress: task52 closed at27b47930b48e with5real shared generated UNO interface contracts, seven genuine full native replay streams and whole19/66Calc/shared raw100. The complete original weak.cxx separates listener/helper responsibilities from weak object/connection/aggregation and its generic exception bridge. Implement full listener/helper before the weak object family; no omission disguised as a whole weak.cxx implementation. Original WeakReferenceHelper overload catches and order are retained. Native thread synchronization/physical ABI/compiler-only/allocator/shutdown/full consumer QA remain unverified.
