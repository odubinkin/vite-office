---
id: "202610112307-1TENVG"
title: "Port original weak reference listener and helper lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 26
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
doc_updated_at: "2026-10-11T23:49:25.083Z"
doc_updated_by: "CODER"
description: "Task53 implements complete original OWeakRefListener and WeakReferenceHelper plus typed WeakReference header wrapper over shared Reference/RuntimeException/XWeak/XAdapter/XReference; original native custom interface callers verify real weak-reference lifecycle, overload/copy/move/query/error ownership without OWeakObject substitutes. Direct calc only."
sections:
  Summary: "Task53 ports the complete original OWeakRefListener and WeakReferenceHelper lifecycle and WeakReference template wrapper. Real explicit listener/adapter ownership, overload differences, hardening, copy/move/query and source exception handling are shared service prerequisites, not GC weak substitutes."
  Scope: "Only calc branch/vite-office-calc. Runtime cppuhelper/source/weak.ts and cppuhelper/inc/weakref.ts; adjacent full native replay test/fixture and scripts/cppuhelper-weakref-native-probe.mjs. Reuse actual Reference/BaseReference/RuntimeException/OSL/XInterface/XWeak/XAdapter/XReference/Type/Any/queryInterface/UnoType owners and unchanged native build/caller utilities. Add2shared runtime/provenance records, one capability and Calc core journal; record genuine suspicious original cases if confirmed. Original OWeakObject/OWeakConnectionPoint/OWeakAggObject and generic C++-UNO exception bridge remain subsequent responsibilities in the same source family; no stub bodies or fake providers for them. Native observation caller supplies genuine concrete virtual interface implementations and controlled replies, not library implementations. Complete unchanged original weak.cxx compiled and linker dead-stripping of unused unrelated owners is allowed; do not ignore unresolved symbols, extract/replace bodies, fake an exception bridge or change original libraries. No new network, external access, branches/merges/subagents/Writer repair."
  Plan: "Read complete original include/cppuhelper/weakref.hxx and cppuhelper/source/weak.cxx. Port listener and helper whole bodies and original template wrapper with separate compile-time binding identity (no instance type provider) and explicit XWeak versus XInterface overload witness. Preserve constructor refcount1 gate then decrement, adapter return move/copy ownership, exact temporary Reference destruction, reverse member destruction, catch-only RuntimeException and state retention after exceptions. Existing native JS catch/finally plus existing atomic intrinsic suffice; no mutex/GC simulator. Generate actual original weak/adapter/reference/DisposedException declarations needed by full weak.cxx compilation. Build complete genuine unchanged original normal-ASan/UBSan owners and pure controlled virtual interface callers; observe whole initialized callback, pointer, list, ownership and metadata streams for cold/lifecycle/copy/move/root-versus-fast/typed/null/error/reentrant cases. Compare full fixture bytes and pure TypeScript replay, scoped source-absent Calc plus exact task52 shared profile append-only2wholeowners/new tests raw100. Restore3links exactly. Run13scoped gates plus exact authoredformat and independently audit committed implementation under EVALUATOR before verify/direct close. Last full51 next61."
  Verify Steps: "1. node scripts/cppuhelper-weakref-native-probe.mjs --write then --check: genuine pinned full weak.cxx and dependencies normal-ASan/UBSan, source/generated/config/caller hashes; exact initialized full native streams all equal and no fake library provider. Audit compiler/link argv and unused exception bridge dead-strip without unresolved-symbol suppression. 2. Adjacent pure caller replay observes exact actual public helper/listener/wrapper state, strong reference ownership, cold/order, copy/move/root-fast/typed/query/null/runtime/foreign/reentrant paths; no selected stream/hash subsets. 3. node output/playwright/task53-checks/portable.mjs with all3 source links absent together: npm run test:coverage:calc and exact task52 whole related shared argv append-only new test/2wholeowners; every raw S/F/B positive, S/B/F/L100, exact targets restored finally. 4. Full TS7 application/tools typecheck, exact authored ESLint/Prettier, docs,size,boundaries,source provenance/tree,shared+Calc inventory,related tooling tests,routing,doctor,diff pass. Keep broad parity flagsfalse and native/thread/physical/resource/fullconsumer limitations explicit. 5. Record actual implementation SHA before first independent EVALUATOR report, verify with ap, intentional commits only and clean direct finish. No full suite before61 absent genuine need."
  Verification: |-
    - Command: `node scripts/cppuhelper-weakref-native-probe.mjs --write` and final `--check` (native-check-structural.log); exact isolated original compiler witness in the same probe/fixture.
      Result: pass.
      Evidence:73 complete unchanged original translation units/build,379 current full source hashes,23 generated files (21 headers and2 parser sources),159 build/runtime terminal commands exit0/signalnull. Original whole normal-ASan/UBSan streams identical lifecycle5524/overloads6800/nulls1888/errors7408/destructor1812 bytes; runtime stderr empty. Separate exact original internal WeakReference<XWeak> syntax-only compiler exits1 as expected, complete source/argv/diagnostic/header hashes retained. Initial failure was original duplicate assignment signature; no rejected body executes. Fixture compiler fields added only from a separately executed genuine original witness, then full final --check reproduces every field. Node isDeepStrictEqual compares the whole object including all arrays, allowing only semantically unordered provenance object-key insertion order.
      Scope: complete original OWeakRefListener/WeakReferenceHelper and header template bodies, controlled concrete virtual callers, actual Reference/RuntimeException/OSL/queryInterface/generated type owners. Full weak.cxx compiled unchanged; unused weak object/aggregation/exception-bridge paths naturally dead-stripped without unresolved-symbol suppression or replacement providers. nm proves no unresolved getCaughtException/throwException symbols. Protected-pointer destructor diagnostic does not certify arbitrary producers/physical ABI.
    - Command: apps/office `npx vitest run --config vitest.shared.config.ts src/cppuhelper/source/weakref.test.ts`; `node output/playwright/task53-checks/portable.mjs`; final `node output/playwright/task53-checks/portable.mjs --shared-only` after JSDoc-only source-map changes.
      Result: pass.
      Evidence:6 adjacent cases pass: all5 full genuine native streams and actual original compiler restriction. Source-absent Calc106/24 and related shared167/47 pass. Whole19/68 executable owners every raw S/F/B counter positive and S/B/F/L100 (Calc2920/2055/474/2564; shared4399/2226/575/3975); complete coverage-final.json audited, no aggregate/exclusion shortcut. Exact task52 shared argv preserved append-only by1 new test and2 whole owner includes. All3 original source links absent together and exact targets restored finally. Final related shared coverage rerun binds current comment-shifted source maps; Calc source unchanged.
      Scope: original lifecycle, root/fast overloads, copy/move/self/equality/typed conversion/null/runtime/foreign/reentrant/destructor behavior. Runtime weak GC, inferred type/default/provider or duplicate shared owner not introduced.
    - Command:13 exact commands in gates-final-manifest.json; exact10 authored files in format-inputs.json via `npx prettier --check`; `python3 output/playwright/task53-checks/final-audit.py`.
      Result: pass.
      Evidence: all13 actual manifest rows exit0. TS7 application/tools, exact4-source ESLint, JSDoc1490files,size,boundaries,provenance/tree,shared+Calc inventory,related tooling35tests/4files,routing,doctor,diff pass. Final provenance/inventory/tooling checks repeated after removing the incorrect imported-reexport local-symbol claim; actual helper owner remains source/weak.ts. Final exact10file format passes. Independent audit confirms current full original/generated/configuration/driver/compiler hashes, every complete stream, raw counters, append-only profile and exact restored links. Doctor retains2 inherited warnings, no errors. Evidence under output/playwright/task53-checks and output/playwright/cppuhelper-weakref-native.
      Scope: only approved Calc/shared task53 implementation and records; broad contract/behavior/default/verified flags false. CALC-058 actual compiler restriction and CALC-059 source-inspected clear failure state documented without upstream repair; allocator-overwrite concern explicitly inference, not leak certification. OWeakObject/OWeakConnectionPoint/OWeakAggObject/generic exception bridge/ImplHelper/services/context/locale/CharClass/pool/Calc cells/document/edit/view/UI remain subsequent. Physical ABI/compiler-only restrictions beyond specific witness/allocator/resource/thread/shutdown/fullconsumer QA unverified. No Writer-only repair or extra full suite; last full51,next61.

    Actual committed implementation and independent EVALUATOR evaluated_sha acceptance are recorded before verification/closure.
  Rollback Plan: "Always restore3original source link targets finally; retain failed/final native/scoped evidence. Revert only intentional task53 artifacts if needed; do not reset unrelated active tasks or Writer work."
  Findings: |-
    Previous goal turn is concrete progress: task52 closed at27b47930b48e with5real shared generated UNO interface contracts, seven genuine full native replay streams and whole19/66Calc/shared raw100. The complete original weak.cxx separates listener/helper responsibilities from weak object/connection/aggregation and its generic exception bridge. Implement full listener/helper before the weak object family; no omission disguised as a whole weak.cxx implementation. Original WeakReferenceHelper overload catches and order are retained. Native thread synchronization/physical ABI/compiler-only/allocator/shutdown/full consumer QA remain unverified.

    - Observation: Initial TS7 check rejected one unused XInterface type import in the authored weak.ts; no runtime assertion or upstream failure.
      Impact: Initial typecheck exit1 retained in typecheck-initial.log; acceptance pending.
      Resolution: Remove the unused authored import and rerun the exact typecheck without configuration or rule changes.

    - Observation: The complete genuine native caller revealed an original internal-header compile restriction: WeakReference<XWeak> instantiates duplicate Reference<XWeak> assignment overloads in include/cppuhelper/weakref.hxx; first compiler error is unchanged upstream, not a TS expectation.
      Impact: First native build exits1 and no fixture accepted. XWeak typed template specialization cannot be treated as a usable original internal API, although WeakReferenceHelper XWeak overload is valid.
      Resolution: Preserve the original restriction, isolate an exact genuine original compile-failure witness, use valid XInterface/XAdapter template callers for lifecycle/copy/move/conversion, and record the suspicious upstream case in the Calc issues journal without altering upstream/library behavior.

    - Observation: Initial test TS7 check ran before genuine fixture was written and also found an enum-namespace mismatch and2 unused authored test bindings. Exact test lint rejected those2 bindings.
      Impact: No runtime parity claim; first failed TS7/lint logs retained.
      Resolution: Wait for the confirmed live native write to complete, use the actual returned UNO TypeClass enum for comparison, remove unused test bindings and rerun exact tests/typecheck/lint. Full original capture now passes all159 commands and all5 normal-ASan/UBSan streams.

    - Observation: First full pure replay has4 whole native streams passing and1 overload stream length mismatch (native1700 signed32 values, portable1724). Native original --write all159 commands0 and5 normal-ASan/UBSan streams identical.
      Impact: Overload translation is not accepted; no fixture or assertion change to conceal the mismatch.
      Resolution: Inspect the first whole caller-stream divergence with task-local diagnostic observations, then correct only the native-erased wrapper/caller expression responsible. Preserve original fixture and strict whole replay.

    - Observation: Whole overload diagnostics show extra acquire/release pairs at the first typed XAdapter wrapper construction. Original Reference.h conversion to const Reference<XInterface>& is a borrowed alias, not a newly owned root Reference.
      Impact: The authored typed wrapper added8 unnecessary ownership pairs; original native fixture remains unchanged.
      Resolution: Pass the existing Reference owner directly through the erased borrowed root-view conversion in typed constructor/assignment. Keep original explicit XWeak helper overload and typed query conversion; no shared Reference duplication or native ABI claim.

    - Observation: Exact scoped gate docs exited1; original log gate-docs.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Exact scoped gate inventory-shared exited1; original log gate-inventory-shared.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Exact scoped gate inventory-calc exited1; original log gate-inventory-calc.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Exact scoped gate tooling exited1; original log gate-tooling.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Native --check rebuilt and captured all159 original commands successfully, but the fixture comparison rejected source-hash object insertion order after the new genuine isolated compiler witness loaded weakref.hxx earlier. Full379 hash-map values are identical.
      Impact: Serialization order of an unordered provenance mapping is the only observed mismatch; native runtime streams and genuine compiler restriction are independently equal. Full failed manifest retained; no runtime expectation changes.
      Resolution: Use native Node isDeepStrictEqual on the complete fixture/result objects. This still compares every source/generated/configuration/capture/compiler field and all array orders; it ignores only JSON object key insertion order, which is not a provenance/hash or runtime contract. Re-run exact native --check without changing libraries, fixtures, observed fields or expected runtime bytes.

    - Observation: Final full manifest audit found required JSDoc gate exit1:16 authored anonymous source/test callbacks lack function comments. Native and raw coverage checks already pass; previous progress message inferred static completion too early from runner exit rather than inspecting every row.
      Impact: All13-gates claim is premature and task remains unaccepted; failed docs log retained. Documentation-only callback comments move instrumented source-map lines.
      Resolution: Add accurate JSDoc only to those owned callbacks, keep all logic and strict validation unchanged; re-run final static gates and related shared coverage with all3 links absent to bind current source maps. Calc source/coverage remains unchanged.

    - Observation: Exact scoped gate inventory-shared exited1; original log gate-inventory-shared.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Exact scoped gate inventory-calc exited1; original log gate-inventory-calc.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Exact scoped gate tooling exited1; original log gate-tooling.log retained.
      Impact: Required acceptance check not passing; no broad pass claim.
      Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

    - Observation: Final inventory and related registry test reject inc/weakref.ts metadata claiming WeakReferenceHelper as a local implementation symbol. It is an imported reexport; the actual class owner is source/weak.ts.
      Impact: Both scoped inventory gates and1/35 related tooling tests fail; no all-gates acceptance claim. Runtime/native/raw coverage unaffected.
      Resolution: Remove only the false local implementation-symbol claim from the inc runtime/provenance records; retain the real source/weak.ts owner and reexport, original source markers, classification and false broad parity flags. Re-run exact related inventory/provenance/tooling gates without validator weakening or duplicate class implementation.
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

- Command: `node scripts/cppuhelper-weakref-native-probe.mjs --write` and final `--check` (native-check-structural.log); exact isolated original compiler witness in the same probe/fixture.
  Result: pass.
  Evidence:73 complete unchanged original translation units/build,379 current full source hashes,23 generated files (21 headers and2 parser sources),159 build/runtime terminal commands exit0/signalnull. Original whole normal-ASan/UBSan streams identical lifecycle5524/overloads6800/nulls1888/errors7408/destructor1812 bytes; runtime stderr empty. Separate exact original internal WeakReference<XWeak> syntax-only compiler exits1 as expected, complete source/argv/diagnostic/header hashes retained. Initial failure was original duplicate assignment signature; no rejected body executes. Fixture compiler fields added only from a separately executed genuine original witness, then full final --check reproduces every field. Node isDeepStrictEqual compares the whole object including all arrays, allowing only semantically unordered provenance object-key insertion order.
  Scope: complete original OWeakRefListener/WeakReferenceHelper and header template bodies, controlled concrete virtual callers, actual Reference/RuntimeException/OSL/queryInterface/generated type owners. Full weak.cxx compiled unchanged; unused weak object/aggregation/exception-bridge paths naturally dead-stripped without unresolved-symbol suppression or replacement providers. nm proves no unresolved getCaughtException/throwException symbols. Protected-pointer destructor diagnostic does not certify arbitrary producers/physical ABI.
- Command: apps/office `npx vitest run --config vitest.shared.config.ts src/cppuhelper/source/weakref.test.ts`; `node output/playwright/task53-checks/portable.mjs`; final `node output/playwright/task53-checks/portable.mjs --shared-only` after JSDoc-only source-map changes.
  Result: pass.
  Evidence:6 adjacent cases pass: all5 full genuine native streams and actual original compiler restriction. Source-absent Calc106/24 and related shared167/47 pass. Whole19/68 executable owners every raw S/F/B counter positive and S/B/F/L100 (Calc2920/2055/474/2564; shared4399/2226/575/3975); complete coverage-final.json audited, no aggregate/exclusion shortcut. Exact task52 shared argv preserved append-only by1 new test and2 whole owner includes. All3 original source links absent together and exact targets restored finally. Final related shared coverage rerun binds current comment-shifted source maps; Calc source unchanged.
  Scope: original lifecycle, root/fast overloads, copy/move/self/equality/typed conversion/null/runtime/foreign/reentrant/destructor behavior. Runtime weak GC, inferred type/default/provider or duplicate shared owner not introduced.
- Command:13 exact commands in gates-final-manifest.json; exact10 authored files in format-inputs.json via `npx prettier --check`; `python3 output/playwright/task53-checks/final-audit.py`.
  Result: pass.
  Evidence: all13 actual manifest rows exit0. TS7 application/tools, exact4-source ESLint, JSDoc1490files,size,boundaries,provenance/tree,shared+Calc inventory,related tooling35tests/4files,routing,doctor,diff pass. Final provenance/inventory/tooling checks repeated after removing the incorrect imported-reexport local-symbol claim; actual helper owner remains source/weak.ts. Final exact10file format passes. Independent audit confirms current full original/generated/configuration/driver/compiler hashes, every complete stream, raw counters, append-only profile and exact restored links. Doctor retains2 inherited warnings, no errors. Evidence under output/playwright/task53-checks and output/playwright/cppuhelper-weakref-native.
  Scope: only approved Calc/shared task53 implementation and records; broad contract/behavior/default/verified flags false. CALC-058 actual compiler restriction and CALC-059 source-inspected clear failure state documented without upstream repair; allocator-overwrite concern explicitly inference, not leak certification. OWeakObject/OWeakConnectionPoint/OWeakAggObject/generic exception bridge/ImplHelper/services/context/locale/CharClass/pool/Calc cells/document/edit/view/UI remain subsequent. Physical ABI/compiler-only restrictions beyond specific witness/allocator/resource/thread/shutdown/fullconsumer QA unverified. No Writer-only repair or extra full suite; last full51,next61.

Actual committed implementation and independent EVALUATOR evaluated_sha acceptance are recorded before verification/closure.

## Rollback Plan

Always restore3original source link targets finally; retain failed/final native/scoped evidence. Revert only intentional task53 artifacts if needed; do not reset unrelated active tasks or Writer work.

## Findings

Previous goal turn is concrete progress: task52 closed at27b47930b48e with5real shared generated UNO interface contracts, seven genuine full native replay streams and whole19/66Calc/shared raw100. The complete original weak.cxx separates listener/helper responsibilities from weak object/connection/aggregation and its generic exception bridge. Implement full listener/helper before the weak object family; no omission disguised as a whole weak.cxx implementation. Original WeakReferenceHelper overload catches and order are retained. Native thread synchronization/physical ABI/compiler-only/allocator/shutdown/full consumer QA remain unverified.

- Observation: Initial TS7 check rejected one unused XInterface type import in the authored weak.ts; no runtime assertion or upstream failure.
  Impact: Initial typecheck exit1 retained in typecheck-initial.log; acceptance pending.
  Resolution: Remove the unused authored import and rerun the exact typecheck without configuration or rule changes.

- Observation: The complete genuine native caller revealed an original internal-header compile restriction: WeakReference<XWeak> instantiates duplicate Reference<XWeak> assignment overloads in include/cppuhelper/weakref.hxx; first compiler error is unchanged upstream, not a TS expectation.
  Impact: First native build exits1 and no fixture accepted. XWeak typed template specialization cannot be treated as a usable original internal API, although WeakReferenceHelper XWeak overload is valid.
  Resolution: Preserve the original restriction, isolate an exact genuine original compile-failure witness, use valid XInterface/XAdapter template callers for lifecycle/copy/move/conversion, and record the suspicious upstream case in the Calc issues journal without altering upstream/library behavior.

- Observation: Initial test TS7 check ran before genuine fixture was written and also found an enum-namespace mismatch and2 unused authored test bindings. Exact test lint rejected those2 bindings.
  Impact: No runtime parity claim; first failed TS7/lint logs retained.
  Resolution: Wait for the confirmed live native write to complete, use the actual returned UNO TypeClass enum for comparison, remove unused test bindings and rerun exact tests/typecheck/lint. Full original capture now passes all159 commands and all5 normal-ASan/UBSan streams.

- Observation: First full pure replay has4 whole native streams passing and1 overload stream length mismatch (native1700 signed32 values, portable1724). Native original --write all159 commands0 and5 normal-ASan/UBSan streams identical.
  Impact: Overload translation is not accepted; no fixture or assertion change to conceal the mismatch.
  Resolution: Inspect the first whole caller-stream divergence with task-local diagnostic observations, then correct only the native-erased wrapper/caller expression responsible. Preserve original fixture and strict whole replay.

- Observation: Whole overload diagnostics show extra acquire/release pairs at the first typed XAdapter wrapper construction. Original Reference.h conversion to const Reference<XInterface>& is a borrowed alias, not a newly owned root Reference.
  Impact: The authored typed wrapper added8 unnecessary ownership pairs; original native fixture remains unchanged.
  Resolution: Pass the existing Reference owner directly through the erased borrowed root-view conversion in typed constructor/assignment. Keep original explicit XWeak helper overload and typed query conversion; no shared Reference duplication or native ABI claim.

- Observation: Exact scoped gate docs exited1; original log gate-docs.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Exact scoped gate inventory-shared exited1; original log gate-inventory-shared.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Exact scoped gate inventory-calc exited1; original log gate-inventory-calc.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Exact scoped gate tooling exited1; original log gate-tooling.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Native --check rebuilt and captured all159 original commands successfully, but the fixture comparison rejected source-hash object insertion order after the new genuine isolated compiler witness loaded weakref.hxx earlier. Full379 hash-map values are identical.
  Impact: Serialization order of an unordered provenance mapping is the only observed mismatch; native runtime streams and genuine compiler restriction are independently equal. Full failed manifest retained; no runtime expectation changes.
  Resolution: Use native Node isDeepStrictEqual on the complete fixture/result objects. This still compares every source/generated/configuration/capture/compiler field and all array orders; it ignores only JSON object key insertion order, which is not a provenance/hash or runtime contract. Re-run exact native --check without changing libraries, fixtures, observed fields or expected runtime bytes.

- Observation: Final full manifest audit found required JSDoc gate exit1:16 authored anonymous source/test callbacks lack function comments. Native and raw coverage checks already pass; previous progress message inferred static completion too early from runner exit rather than inspecting every row.
  Impact: All13-gates claim is premature and task remains unaccepted; failed docs log retained. Documentation-only callback comments move instrumented source-map lines.
  Resolution: Add accurate JSDoc only to those owned callbacks, keep all logic and strict validation unchanged; re-run final static gates and related shared coverage with all3 links absent to bind current source maps. Calc source/coverage remains unchanged.

- Observation: Exact scoped gate inventory-shared exited1; original log gate-inventory-shared.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Exact scoped gate inventory-calc exited1; original log gate-inventory-calc.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Exact scoped gate tooling exited1; original log gate-tooling.log retained.
  Impact: Required acceptance check not passing; no broad pass claim.
  Resolution: Recompute route and inspect bounded source-backed repair without threshold/profile/assertion changes.

- Observation: Final inventory and related registry test reject inc/weakref.ts metadata claiming WeakReferenceHelper as a local implementation symbol. It is an imported reexport; the actual class owner is source/weak.ts.
  Impact: Both scoped inventory gates and1/35 related tooling tests fail; no all-gates acceptance claim. Runtime/native/raw coverage unaffected.
  Resolution: Remove only the false local implementation-symbol claim from the inc runtime/provenance records; retain the real source/weak.ts owner and reexport, original source markers, classification and false broad parity flags. Re-run exact related inventory/provenance/tooling gates without validator weakening or duplicate class implementation.
