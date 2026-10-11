---
id: "202610112148-F21JEZ"
title: "Port original cppuhelper interface and service support helpers"
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
  updated_at: "2026-10-11T21:48:55.754Z"
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
    body: "Start: source-complete cppuhelper interface/service helpers reuse actual shared Type/Any/Sequence/OUString owners; explicit template erasure and real IDL/module boundary, genuine full native/source-absent raw100 acceptance, no stubs or Writer repair,next full51."
events:
  -
    type: "status"
    at: "2026-10-11T21:48:56.667Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: source-complete cppuhelper interface/service helpers reuse actual shared Type/Any/Sequence/OUString owners; explicit template erasure and real IDL/module boundary, genuine full native/source-absent raw100 acceptance, no stubs or Writer repair,next full51."
doc_version: 3
doc_updated_at: "2026-10-11T21:48:56.667Z"
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
  Verification: "Pending actual source implementation and declared verification."
  Rollback Plan: "Revert intentional Task50 changes alone while retaining traceability; no history rewrite or merge."
  Findings: "Original cclass_Unicode and CharacterClassificationImpl call cppu::supportsService; original OWeakObject/OWeakConnectionPoint call cppu::queryInterface. All1..19 helper overloads share the same sequential compare/Any body and no virtual query. Native compile-time overload count and declared template bindings adapt explicitly, never inferred from a nullable pointer. Public Sequence currently exposes actual logical native field lvalues; shared OUString borrowed views preserve those references without new string construction/acquisition."
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

Pending actual source implementation and declared verification.

## Rollback Plan

Revert intentional Task50 changes alone while retaining traceability; no history rewrite or merge.

## Findings

Original cclass_Unicode and CharacterClassificationImpl call cppu::supportsService; original OWeakObject/OWeakConnectionPoint call cppu::queryInterface. All1..19 helper overloads share the same sequential compare/Any body and no virtual query. Native compile-time overload count and declared template bindings adapt explicitly, never inferred from a nullable pointer. Public Sequence currently exposes actual logical native field lvalues; shared OUString borrowed views preserve those references without new string construction/acquisition.
