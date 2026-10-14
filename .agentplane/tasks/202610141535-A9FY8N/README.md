---
id: "202610141535-A9FY8N"
title: "Restore native Type references in shared UNO Sequence indexing"
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
  updated_at: "2026-10-14T15:35:24.599Z"
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
    body: "Start: restore shared Sequence Type index contract through existing borrowed view under explicit human canonical shared-code authorization."
events:
  -
    type: "status"
    at: "2026-10-14T15:35:29.948Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore shared Sequence Type index contract through existing borrowed view under explicit human canonical shared-code authorization."
doc_version: 3
doc_updated_at: "2026-10-14T15:35:29.948Z"
doc_updated_by: "CODER"
description: "Task133: correct shared Sequence<Type> const index to the existing live borrowed Type view, retaining original sequence storage and consumer observations; prerequisite for real XTypeProvider/complex color transport. Standing human canonical shared/Writer authorization. No new memory library/native probes."
sections:
  Summary: "Task133 restores the native const Type element reference from shared Sequence<Type> indexing, reusing the existing borrowed Type alias. Explicit human authorization permits canonical shared and Writer corrections. Only calc branch/checkout, JS GC, no native compilation or new ownership engine."
  Scope: "At most10 paths: shared Sequence.ts, its Sequence.test.ts, an additional focused Type-index test, both existing Sequence registry records, calc-core progress, and task-local artifacts. Other template element/address contracts remain unchanged. No interfaces/components or UI/ODS completeness claim."
  Plan: "Task133: restore Sequence<Type> const indexing through existing borrowed Type view with exact native method/alias/counter contract; update real consumer observation and registry, strict wholeowner/Calc100 and12focusedgates, clean exactsource. Scope10paths. Human explicit canonical shared/Writer authorization already granted; no new lifetime mechanism, native compilation or readiness/full-run claim."
  Verify Steps: "Native Sequence.h const operator[] and Sequence.hxx implementation must return const E&, without acquiring/copying E. Real Sequence<Type> indexing returns actual Type prototype and stable view, shares underlying pointer cell, sees subsequent C-level assignment, leaves type counts unchanged and preserves held Type copy across sequence mutations. Existing complete Sequence fixture replays including scalar/Any/Reference/nested values pass unchanged native observation streams; only test observation adapts from erased cell to returned Type method. Invalid indices retain assertions. Related tests must cover every raw S/B/F/L counter of complete changed Sequence owner at100; npm run test:coverage:calc100, native links absent and restored. Run focused format/lint/typecheck/docs/size/dependency/tree/provenance/registry/routing/doctor/diff gates and existing boundaries. No browser changes; full suite only readiness checkpoint. Record exact commands, scopes and results; final clean calc with exact source commit."
  Verification: "Pending."
  Rollback Plan: "Revert only scoped task changes in a later authorized task; never reset other work or merge branches."
  Findings: "Preflight clean calc at947b1ac6. Shared Sequence currently declares E but returns its raw logical cell even for Type; existing unotype already supplies a nonowning stable live Type view. This is a host type-erasure discrepancy, not a suspicious upstream behavior. Do not add it to the upstream-suspected-issues list. Explicit source specialization is compiler binding, no inferred value type/provider/allocator. Same-agent evaluator will be recorded as non-independent."
id_source: "generated"
---
## Summary

Task133 restores the native const Type element reference from shared Sequence<Type> indexing, reusing the existing borrowed Type alias. Explicit human authorization permits canonical shared and Writer corrections. Only calc branch/checkout, JS GC, no native compilation or new ownership engine.

## Scope

At most10 paths: shared Sequence.ts, its Sequence.test.ts, an additional focused Type-index test, both existing Sequence registry records, calc-core progress, and task-local artifacts. Other template element/address contracts remain unchanged. No interfaces/components or UI/ODS completeness claim.

## Plan

Task133: restore Sequence<Type> const indexing through existing borrowed Type view with exact native method/alias/counter contract; update real consumer observation and registry, strict wholeowner/Calc100 and12focusedgates, clean exactsource. Scope10paths. Human explicit canonical shared/Writer authorization already granted; no new lifetime mechanism, native compilation or readiness/full-run claim.

## Verify Steps

Native Sequence.h const operator[] and Sequence.hxx implementation must return const E&, without acquiring/copying E. Real Sequence<Type> indexing returns actual Type prototype and stable view, shares underlying pointer cell, sees subsequent C-level assignment, leaves type counts unchanged and preserves held Type copy across sequence mutations. Existing complete Sequence fixture replays including scalar/Any/Reference/nested values pass unchanged native observation streams; only test observation adapts from erased cell to returned Type method. Invalid indices retain assertions. Related tests must cover every raw S/B/F/L counter of complete changed Sequence owner at100; npm run test:coverage:calc100, native links absent and restored. Run focused format/lint/typecheck/docs/size/dependency/tree/provenance/registry/routing/doctor/diff gates and existing boundaries. No browser changes; full suite only readiness checkpoint. Record exact commands, scopes and results; final clean calc with exact source commit.

## Verification

Pending.

## Rollback Plan

Revert only scoped task changes in a later authorized task; never reset other work or merge branches.

## Findings

Preflight clean calc at947b1ac6. Shared Sequence currently declares E but returns its raw logical cell even for Type; existing unotype already supplies a nonowning stable live Type view. This is a host type-erasure discrepancy, not a suspicious upstream behavior. Do not add it to the upstream-suspected-issues list. Explicit source specialization is compiler binding, no inferred value type/provider/allocator. Same-agent evaluator will be recorded as non-independent.
