---
id: "202610112148-F21JEZ"
title: "Port original cppuhelper interface and service support helpers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T21:48:55.754Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T22:09:13.275Z"
  updated_by: "CODER"
  note: "Task50 original helpers accepted:74 genuine unchanged TUs/375 source hashes/15 generated headers;161 terminal commands including original compiler1/SIGABRT rejections; normal-ASan/UB streams byte-identical; source-absent Calc106/shared154 whole19/61 raw100;13 scoped gates/8 Prettier checks pass. CALC-057 source hole preserved; full41 latest,next51; separate quality follows implementation commit."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: source-complete cppuhelper interface/service helpers reuse actual shared Type/Any/Sequence/OUString owners; explicit template erasure and real IDL/module boundary, genuine full native/source-absent raw100 acceptance, no stubs or Writer repair,next full51."
events:
  -
    type: "status"
    at: "2026-10-11T21:48:56.667Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: source-complete cppuhelper interface/service helpers reuse actual shared Type/Any/Sequence/OUString owners; explicit template erasure and real IDL/module boundary, genuine full native/source-absent raw100 acceptance, no stubs or Writer repair,next full51."
  -
    type: "verify"
    at: "2026-10-11T22:09:13.275Z"
    author: "CODER"
    state: "ok"
    note: "Task50 original helpers accepted:74 genuine unchanged TUs/375 source hashes/15 generated headers;161 terminal commands including original compiler1/SIGABRT rejections; normal-ASan/UB streams byte-identical; source-absent Calc106/shared154 whole19/61 raw100;13 scoped gates/8 Prettier checks pass. CALC-057 source hole preserved; full41 latest,next51; separate quality follows implementation commit."
doc_version: 3
doc_updated_at: "2026-10-11T22:09:13.326Z"
doc_updated_by: "CODER"
description: "Task50 real service prerequisites: complete queryInterface1..19 template family and supportsService with actual shared Type/Any/Sequence/OUString owners, real XServiceInfo IDL contract, source-shaped cppuhelper boundary, genuine original native acceptance, Calc/shared whole raw100 and inventory. Full41 latest,next51."
sections:
  Summary: "Task50 implements original cppuhelper queryInterface and supportsService helpers as real prerequisites of OWeakObject and CharacterClassification services, following completed Task49. Existing Type/Any/Sequence/OUString/OSL ownership and actual declared interface inputs are reused. Work only in vite-office-calc on calc; full41 latest,next51, whole goal active."
  Scope: |-
    Add cppuhelper/inc/queryinterface.ts, cppuhelper/inc/supportsservice.ts and cppuhelper/source/supportsservice.ts, complete replay tests and native fixture, scripts/cppuhelper-service-native-probe.mjs, cppu/inc/com/sun/star/lang/XServiceInfo.ts complete structural IDL contract. Port all original queryInterface1..19 selected template bodies through their explicit erased static_type/pointer arguments without instance metadata or type/value/default providers. Preserve sequential short-circuit static_type calls and first match including typed NULL. supportsService calls the actual implementation once, searches its actual returned owned Sequence of logical OUString lvalues with existing equality and destroys the original local owner on return or exception. No fallback service manager or weak object substitute.

    Update matched cppuhelper module graph in scripts/check-module-boundaries.mjs and its related test, only original observed cppu/SAL dependencies. Update new runtime/provenance/capabilities, calc-core and Calc suspected issues if real issue found. Task artifacts and ignored evidence are included. Existing shared owners or pure test callers may be extended only where original contracts require. Additional generated native headers use the existing genuine pinned cppumaker and complete original IDL files, not modified upstream or a surrogate type provider. Native physical pointer/ABI/resource/template-only constraints and full service/consumer QA remain explicit gaps.
  Plan: "Implement complete original cppuhelper queryInterface1..19 and supportsService contracts over actual shared Type/Any/Sequence/OUString owners, real structural XServiceInfo and matched source module boundary; genuine native acceptance, Calc/shared raw100 and inventory/quality. Full41 latest,next51."
  Verify Steps: |-
    1. Source inspection maps full original queryInterface1..19 family, exact lazy static_type/order/first match and real Any default/acquisition/destruction. supportsService preserves single virtual getter, exact case-sensitive full-length UTF16 equality, returned local Sequence lifetime and exception propagation. XServiceInfo structural IDL only; no alternate type/value/owner/provider.
    2. node scripts/cppuhelper-service-native-probe.mjs --write then --check; complete unchanged native TUs and genuine generated XServiceInfo headers, complete pinned source/config/header hashes; every process terminal, normal-ASan/UB full initialized streams identical, separate original NULL assertion abort if exercised. Capture lazy type metadata, calls/ownership and all search outcomes without uninitialized bytes or invalid pointer reads; no upstream/library substitution.
    3. All3 original links absent together: Calc plus unchanged task49 related shared test/whole-owner argv expanded only by new helper tests/whole runtime owners. Every raw S/F/B counter positive, whole100; exact links restored in finally. No weakened thresholds/exclusions/assertions/timeouts or Writer-only repair; next full51.
    4. npm run typecheck; exact changed-source ESLint/Prettier; npm run check:docs/check:file-size/check:dependencies/check:source-provenance/check:source-tree, inventory:parity:shared/inventory:parity:calc; related four tooling files including original boundary tests; routing/doctor/diff all0. Accurate registry residual gaps/broad flags false.
    5. Record actual Command/Result/Evidence/Scope, intentional implementation commit and independent EVALUATOR phase against actual SHA/raw/source/native/profile facts, final owner verify after last task documentation, committed quality and clean calc closure. No merge/publication/branch/worktree/delegation.
  Verification: |-
    Command: node scripts/cppuhelper-service-native-probe.mjs --write; node scripts/cppuhelper-service-native-probe.mjs --check.
    Result: pass.
    Evidence: native-write-final.log/native-check-final.log, output/playwright/cppuhelper-service-native/manifest.json, adjacent complete native-service-helper-cases.json. Native --write and --check pass:74 complete unchanged translation units,375 full source hashes and15 genuine generated headers,161 terminal commands (157 exit0;2 expected NULL assertion SIGABRT;2 expected original missing-arity compiler exit1). Whole initialized normal-ASan/UBSan streams identical cold716/queries455732/services23136 bytes. With all3 original links absent together, Calc106/24 and related shared154/45 tests pass; all raw S/F/B counters positive and whole S/B/F/L100 for19/61 executable owners (Calc2920/2055/474/2564; shared3966/2158/537/3549). Exact links restored; task49 profile preserved append-only by the new helper test and all4 new source modules, including structural/reexport owners without executable counters. Scoped gate acceptance is recorded in the task evidence.
    Scope: full original1..14/17..19 queryInterface family, every declared first-match position/non-null/typed NULL/mismatch; cold later static_type untouched, actual Any ownership and callback/type/value metadata. Original supportsService complete UTF16 name cases (length,case,embedded-zero,surrogates,combining sequences), single virtual getter/copy/destruction and propagated native caller exceptions. Genuine complete source/generator/headers; physical invalid pointers/uninitialized bytes are not certified. CALC-057 compile-time hole preserved and documented.

    Command: node output/playwright/task50-checks/service-portable.mjs.
    Result: pass.
    Evidence: portable-final.log/value-calc-manifest.json/value-shared-manifest.json/value-coverage-audit.json and both complete portable logs.
    Scope: Calc106/24/shared154/45, whole19/61 executable owners raw100, all3 links absent and exactly restored. Previous task49 test/whole-owner argv unchanged except new helper test/all4 source modules/report path. No threshold/exclusion/assertion/timeout weakening; no Writer repair; latest full41,next51.

    Command: node output/playwright/task50-checks/service-gates.mjs (final complete run); npx prettier --check apps/office/src/cppuhelper/inc/queryinterface.ts apps/office/src/cppuhelper/inc/supportsservice.ts apps/office/src/cppuhelper/source/supportsservice.ts apps/office/src/cppu/inc/com/sun/star/lang/XServiceInfo.ts apps/office/src/cppuhelper/source/service-helpers.test.ts scripts/cppuhelper-service-native-probe.mjs scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts.
    Result: pass.
    Evidence: value-gates-final-manifest.json/gates-complete-final.log/prettier-final.log.
    Scope: TS7/exact lint/format/docs/size/dependencies/provenance/tree/shared+Calc inventories,35 tests in four related tooling files/routing/doctor/diff. Structural XServiceInfo/reexport records own no invented executable methods. CAP-897b212d-fad9-4e9f-a1e1-bcfe0df8d9e0 broad parity/default/verified flags false. Only original cppuhelper->cppu/SAL module graph and protected inc/source ownership; reverse/application/browser gates retained.

    Intentional implementation commit and separate EVALUATOR evidence will follow; final owner verify occurs after last documentation update before clean calc closure. Whole goal active; no full suite, merge, publication or delegation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T22:09:13.275Z — VERIFY — ok

    By: CODER

    Note: Task50 original helpers accepted:74 genuine unchanged TUs/375 source hashes/15 generated headers;161 terminal commands including original compiler1/SIGABRT rejections; normal-ASan/UB streams byte-identical; source-absent Calc106/shared154 whole19/61 raw100;13 scoped gates/8 Prettier checks pass. CALC-057 source hole preserved; full41 latest,next51; separate quality follows implementation commit.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T22:09:12.872Z, excerpt_hash=sha256:08d974333c11530eda2de921ba0029142465413a9021f512a8c6446677744eee

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112148-F21JEZ/blueprint/resolved-snapshot.json
    - old_digest: 5c831f64acffd438838a70f7569109f64704af470b3d0e1cd71af2f779aeae91
    - current_digest: 5c831f64acffd438838a70f7569109f64704af470b3d0e1cd71af2f779aeae91
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610112148-F21JEZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610112148-F21JEZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional Task50 changes alone while retaining traceability; no history rewrite or merge."
  Findings: |-
    Original OWeakObject/OWeakConnectionPoint queryInterface and cclass_Unicode/CharacterClassificationImpl supportsService callers make this a real shared service dependency. Public helpers reuse actual Type/Any/Sequence/OUString ownership; no query/default/type/value or bootstrap substitute. Header declaration binds its one real cxx body. XServiceInfo is the complete structural IDL API only; generated static types and full service implementations remain subsequent.

    CALC-057: complete pinned queryinterface.hxx contains1..14 and17..19 overloads, omitting15/16. First genuine full caller compilation failed at15; exact compile-only15/16 witnesses now retain original compiler diagnostic/status/source hashes. Preserve actual declared arities; no missing overload or fallback invented. This is a suspicious compile-time coverage gap, not a proven valid-consumer bug. It is recorded in calc-upstream-suspected-issues.md.

    Bounded corrections: initial test TS7 ran before fixture generation and also exposed tuple/rest erasure losing declared length at spread calls. One explicit declared tuple-list argument preserves the source template arity without per-instance metadata or runtime count normalization. Initial ESLint non-null assertions in initialized caller arrays were replaced by explicit source-proven casts, without rule suppression. A first test run's four behavior streams passed; the new fifth compile-diagnostic case awaited the newly generated fixture. Native caller preparation now instantiates the same shared original Types caller inputs as the replay, with genuine C factories and complete value observations, not fabricated defaults. The JSDoc gate found an undocumented NULL-test callback; source documentation was added. Provenance rejected basename-only mappings; actual static_type, XServiceInfo and getSupportedServiceNames witnesses corrected the records. Inventory correctly distinguishes structural interface and header-only reexport from executable methods: XServiceInfo owns only its interface symbol, while the reexport owns no additional local runtime function, following existing SharedString header practice. No validator was weakened and no duplicate implementation was added. Failed attempts/diagnostics remain in ignored Task50 evidence.

    Native static_type caller classes are real authored XInterface implementations with explicit compile-time identities and original root/static typelib factory calls; their labels/counts/events are caller observations. No library type/ownership provider is replaced. Complete streams retain all initialized fields and callbacks; no empty/moved VOID reserved-byte or physical pointer reinterpretation certificate. Native supportsService uses real generated XServiceInfo headers emitted by the existing pinned genuine cppumaker from complete unchanged original IDL.

    Physical pointer/ABI/resources/native const/template-only enforcement/concurrency/shutdown/full upstream QA remain unverified. NULL-service native SIGABRT is distinct from the explicit browser Error adaptation. Getter exceptions propagate; owned returned Sequence is destructed exactly on normal search return/exception. No native source edit, service manager stub, fake weak object, generated value/default surrogate or Writer repair. Scope only calc checkout/branch. Full41 latest,next51; whole goal active.
id_source: "generated"
---
## Summary

Task50 implements original cppuhelper queryInterface and supportsService helpers as real prerequisites of OWeakObject and CharacterClassification services, following completed Task49. Existing Type/Any/Sequence/OUString/OSL ownership and actual declared interface inputs are reused. Work only in vite-office-calc on calc; full41 latest,next51, whole goal active.

## Scope

Add cppuhelper/inc/queryinterface.ts, cppuhelper/inc/supportsservice.ts and cppuhelper/source/supportsservice.ts, complete replay tests and native fixture, scripts/cppuhelper-service-native-probe.mjs, cppu/inc/com/sun/star/lang/XServiceInfo.ts complete structural IDL contract. Port all original queryInterface1..19 selected template bodies through their explicit erased static_type/pointer arguments without instance metadata or type/value/default providers. Preserve sequential short-circuit static_type calls and first match including typed NULL. supportsService calls the actual implementation once, searches its actual returned owned Sequence of logical OUString lvalues with existing equality and destroys the original local owner on return or exception. No fallback service manager or weak object substitute.

Update matched cppuhelper module graph in scripts/check-module-boundaries.mjs and its related test, only original observed cppu/SAL dependencies. Update new runtime/provenance/capabilities, calc-core and Calc suspected issues if real issue found. Task artifacts and ignored evidence are included. Existing shared owners or pure test callers may be extended only where original contracts require. Additional generated native headers use the existing genuine pinned cppumaker and complete original IDL files, not modified upstream or a surrogate type provider. Native physical pointer/ABI/resource/template-only constraints and full service/consumer QA remain explicit gaps.

## Plan

Implement complete original cppuhelper queryInterface1..19 and supportsService contracts over actual shared Type/Any/Sequence/OUString owners, real structural XServiceInfo and matched source module boundary; genuine native acceptance, Calc/shared raw100 and inventory/quality. Full41 latest,next51.

## Verify Steps

1. Source inspection maps full original queryInterface1..19 family, exact lazy static_type/order/first match and real Any default/acquisition/destruction. supportsService preserves single virtual getter, exact case-sensitive full-length UTF16 equality, returned local Sequence lifetime and exception propagation. XServiceInfo structural IDL only; no alternate type/value/owner/provider.
2. node scripts/cppuhelper-service-native-probe.mjs --write then --check; complete unchanged native TUs and genuine generated XServiceInfo headers, complete pinned source/config/header hashes; every process terminal, normal-ASan/UB full initialized streams identical, separate original NULL assertion abort if exercised. Capture lazy type metadata, calls/ownership and all search outcomes without uninitialized bytes or invalid pointer reads; no upstream/library substitution.
3. All3 original links absent together: Calc plus unchanged task49 related shared test/whole-owner argv expanded only by new helper tests/whole runtime owners. Every raw S/F/B counter positive, whole100; exact links restored in finally. No weakened thresholds/exclusions/assertions/timeouts or Writer-only repair; next full51.
4. npm run typecheck; exact changed-source ESLint/Prettier; npm run check:docs/check:file-size/check:dependencies/check:source-provenance/check:source-tree, inventory:parity:shared/inventory:parity:calc; related four tooling files including original boundary tests; routing/doctor/diff all0. Accurate registry residual gaps/broad flags false.
5. Record actual Command/Result/Evidence/Scope, intentional implementation commit and independent EVALUATOR phase against actual SHA/raw/source/native/profile facts, final owner verify after last task documentation, committed quality and clean calc closure. No merge/publication/branch/worktree/delegation.

## Verification

Command: node scripts/cppuhelper-service-native-probe.mjs --write; node scripts/cppuhelper-service-native-probe.mjs --check.
Result: pass.
Evidence: native-write-final.log/native-check-final.log, output/playwright/cppuhelper-service-native/manifest.json, adjacent complete native-service-helper-cases.json. Native --write and --check pass:74 complete unchanged translation units,375 full source hashes and15 genuine generated headers,161 terminal commands (157 exit0;2 expected NULL assertion SIGABRT;2 expected original missing-arity compiler exit1). Whole initialized normal-ASan/UBSan streams identical cold716/queries455732/services23136 bytes. With all3 original links absent together, Calc106/24 and related shared154/45 tests pass; all raw S/F/B counters positive and whole S/B/F/L100 for19/61 executable owners (Calc2920/2055/474/2564; shared3966/2158/537/3549). Exact links restored; task49 profile preserved append-only by the new helper test and all4 new source modules, including structural/reexport owners without executable counters. Scoped gate acceptance is recorded in the task evidence.
Scope: full original1..14/17..19 queryInterface family, every declared first-match position/non-null/typed NULL/mismatch; cold later static_type untouched, actual Any ownership and callback/type/value metadata. Original supportsService complete UTF16 name cases (length,case,embedded-zero,surrogates,combining sequences), single virtual getter/copy/destruction and propagated native caller exceptions. Genuine complete source/generator/headers; physical invalid pointers/uninitialized bytes are not certified. CALC-057 compile-time hole preserved and documented.

Command: node output/playwright/task50-checks/service-portable.mjs.
Result: pass.
Evidence: portable-final.log/value-calc-manifest.json/value-shared-manifest.json/value-coverage-audit.json and both complete portable logs.
Scope: Calc106/24/shared154/45, whole19/61 executable owners raw100, all3 links absent and exactly restored. Previous task49 test/whole-owner argv unchanged except new helper test/all4 source modules/report path. No threshold/exclusion/assertion/timeout weakening; no Writer repair; latest full41,next51.

Command: node output/playwright/task50-checks/service-gates.mjs (final complete run); npx prettier --check apps/office/src/cppuhelper/inc/queryinterface.ts apps/office/src/cppuhelper/inc/supportsservice.ts apps/office/src/cppuhelper/source/supportsservice.ts apps/office/src/cppu/inc/com/sun/star/lang/XServiceInfo.ts apps/office/src/cppuhelper/source/service-helpers.test.ts scripts/cppuhelper-service-native-probe.mjs scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts.
Result: pass.
Evidence: value-gates-final-manifest.json/gates-complete-final.log/prettier-final.log.
Scope: TS7/exact lint/format/docs/size/dependencies/provenance/tree/shared+Calc inventories,35 tests in four related tooling files/routing/doctor/diff. Structural XServiceInfo/reexport records own no invented executable methods. CAP-897b212d-fad9-4e9f-a1e1-bcfe0df8d9e0 broad parity/default/verified flags false. Only original cppuhelper->cppu/SAL module graph and protected inc/source ownership; reverse/application/browser gates retained.

Intentional implementation commit and separate EVALUATOR evidence will follow; final owner verify occurs after last documentation update before clean calc closure. Whole goal active; no full suite, merge, publication or delegation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T22:09:13.275Z — VERIFY — ok

By: CODER

Note: Task50 original helpers accepted:74 genuine unchanged TUs/375 source hashes/15 generated headers;161 terminal commands including original compiler1/SIGABRT rejections; normal-ASan/UB streams byte-identical; source-absent Calc106/shared154 whole19/61 raw100;13 scoped gates/8 Prettier checks pass. CALC-057 source hole preserved; full41 latest,next51; separate quality follows implementation commit.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T22:09:12.872Z, excerpt_hash=sha256:08d974333c11530eda2de921ba0029142465413a9021f512a8c6446677744eee

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112148-F21JEZ/blueprint/resolved-snapshot.json
- old_digest: 5c831f64acffd438838a70f7569109f64704af470b3d0e1cd71af2f779aeae91
- current_digest: 5c831f64acffd438838a70f7569109f64704af470b3d0e1cd71af2f779aeae91
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610112148-F21JEZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610112148-F21JEZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional Task50 changes alone while retaining traceability; no history rewrite or merge.

## Findings

Original OWeakObject/OWeakConnectionPoint queryInterface and cclass_Unicode/CharacterClassificationImpl supportsService callers make this a real shared service dependency. Public helpers reuse actual Type/Any/Sequence/OUString ownership; no query/default/type/value or bootstrap substitute. Header declaration binds its one real cxx body. XServiceInfo is the complete structural IDL API only; generated static types and full service implementations remain subsequent.

CALC-057: complete pinned queryinterface.hxx contains1..14 and17..19 overloads, omitting15/16. First genuine full caller compilation failed at15; exact compile-only15/16 witnesses now retain original compiler diagnostic/status/source hashes. Preserve actual declared arities; no missing overload or fallback invented. This is a suspicious compile-time coverage gap, not a proven valid-consumer bug. It is recorded in calc-upstream-suspected-issues.md.

Bounded corrections: initial test TS7 ran before fixture generation and also exposed tuple/rest erasure losing declared length at spread calls. One explicit declared tuple-list argument preserves the source template arity without per-instance metadata or runtime count normalization. Initial ESLint non-null assertions in initialized caller arrays were replaced by explicit source-proven casts, without rule suppression. A first test run's four behavior streams passed; the new fifth compile-diagnostic case awaited the newly generated fixture. Native caller preparation now instantiates the same shared original Types caller inputs as the replay, with genuine C factories and complete value observations, not fabricated defaults. The JSDoc gate found an undocumented NULL-test callback; source documentation was added. Provenance rejected basename-only mappings; actual static_type, XServiceInfo and getSupportedServiceNames witnesses corrected the records. Inventory correctly distinguishes structural interface and header-only reexport from executable methods: XServiceInfo owns only its interface symbol, while the reexport owns no additional local runtime function, following existing SharedString header practice. No validator was weakened and no duplicate implementation was added. Failed attempts/diagnostics remain in ignored Task50 evidence.

Native static_type caller classes are real authored XInterface implementations with explicit compile-time identities and original root/static typelib factory calls; their labels/counts/events are caller observations. No library type/ownership provider is replaced. Complete streams retain all initialized fields and callbacks; no empty/moved VOID reserved-byte or physical pointer reinterpretation certificate. Native supportsService uses real generated XServiceInfo headers emitted by the existing pinned genuine cppumaker from complete unchanged original IDL.

Physical pointer/ABI/resources/native const/template-only enforcement/concurrency/shutdown/full upstream QA remain unverified. NULL-service native SIGABRT is distinct from the explicit browser Error adaptation. Getter exceptions propagate; owned returned Sequence is destructed exactly on normal search return/exception. No native source edit, service manager stub, fake weak object, generated value/default surrogate or Writer repair. Scope only calc checkout/branch. Full41 latest,next51; whole goal active.
