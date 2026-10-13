---
id: "202610131848-NTM4VX"
title: "Implement Calc external reference and name tokens"
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
  updated_at: "2026-10-13T18:50:02.332Z"
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
    body: "Start: actual external reference/name token concrete family with existing shared strings/reference/base owners, normal initialized proof and scoped raw100; no ownership engine/fake peers."
events:
  -
    type: "status"
    at: "2026-10-13T18:50:11.415Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual external reference/name token concrete family with existing shared strings/reference/base owners, normal initialized proof and scoped raw100; no ownership engine/fake peers."
doc_version: 3
doc_updated_at: "2026-10-13T18:50:11.415Z"
doc_updated_by: "CODER"
description: "Task97 actual external file-index base and single/range/name token ctor/copy/move/Clone/query/equality family, prerequisite for real range operator/compiler/ODS external references using existing genuine shared/data owners."
sections:
  Summary: "Task97 implements actual external file/reference/name token family needed by original range operator/compiler and external ODS formula references, using actual shared/data owners."
  Scope: "Actual ScExternalToken protected construction/base copy fields/GetFileId/equality and concrete ScExternalSingleRefToken/ScExternalDoubleRefToken/ScExternalNameToken value/by-value SharedString/copy/implicit move/Clone/stable const-string and mutable-reference getters/equality/unchanged shared-value cleanup boundary. No independently sliced base-token input, fake cast peers, refcounts/pools/finalizers/native memory manager or fake document/config/compiler. Existing SharedString/OUString/ScSingleRefData/ScComplexRefData/FormulaToken reused, native UInt16 index and literal ocPush/kind defaults retained. Erased token and SharedString rvalue categories use explicit existing-style move witnesses, no assignment API because original assignments deleted. Original string member moves clear only source string while copied refdata/file/type remain; copying retains independent value members. Add token.external.ts actual external-family responsibility shard because complete addition would exceed500line combined reference owner cap; original token.ts/header canonical aggregate exports retained, explicit runtime/provenance/filename responsibility split. New normal actual original native helper/fixture/replay over verified genuine formula/refdata headers, whole source identities and output, no memory/sanitizer/layout/invalid-input claims. Update4existing token/header records plus2new shard records/new capability/Calc/GC/suspicious docs if confirmed. Whole Calc/affected complete shared token/SAL/SVL/mdds owners+consumers raw100,16gates/static/Calc0UI/exact hashes/same-agent separate EVALUATOR and clean DONE oncalc. Real external-document manager, compiler/configuration/ScTokenArray/ScFormulaCell/document/grid/ODS remain prioritized missing owners. No full office run before101; continue then pause after secondfull111/repairs, leave Writer-only coverage separate."
  Plan: "Actual external single/range/name token family with real shared/data/base reuse and protected file-index base; explicit responsibility shard, ordinary JS refs, genuine normal value proof/scoped raw100/16gates/exact review/DONE. No fake service/count/memory engine; continue101 and pause111."
  Verify Steps: |-
    1. node scripts/calc-external-token-native-probe.mjs --write then --check sequentially before source-link removal: complete original external base/concrete classes/member/constructor/destructor/equality and genuine existing formula/reference/header dependencies, normal initialized file-index/UTF16/null-empty/value-input/copy/implicit token move/Clone/string move/refdata/member/query/base mismatch histories match full current portable replay. No fake document/compiler/config/matrix peers/base slicing/invalid derived casts/counts/native memory/sanitizer/ABI experiment or source rewriting.
    2. Whole source-absent npm run test:coverage:calc and affected complete shared token/SAL/SVL/mdds owners/consumer selection raw S/B/F/L100, every raw S/F/Bcounterpositive,4exact links restored. Static and Calc browser0profile pass (not editable UI readiness), no Writer-only repair or full run before101; continue101 and pause111/repairs.
    3. Existing16whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks pass. Original actual local class and source responsibility metadata plus native/source and unexecuted genuine external-reference QA context. Record errors before bounded corrections, no thresholds/checker weakening; don't overlap native/source validation with portable reference-link absence.
    4. Exact current/committed non-task source hashes only approved paths and current coverage/native/gates, same-agent separate EVALUATOR not independent, canonical DONE/clean git status --short --untracked-files=all branchcalc. Full application objective remains active, pause second upcoming full111 after relevant repairs.
  Verification: "Pending approved implementation/checks."
  Rollback Plan: "Revert only task97 intentional paths through followup; restore4links on every exit, no merging/history rewrites/unrelated task changes."
  Findings: "Native actual external token classes own a copied/moved SharedString and value-copied reference data; file index UInt16. Complete concrete move uses real base copy semantics, moves string member, and preserves source reference fields. Existing SAL/SVL value cleanup remains unchanged shared boundary, no new refcount library. Original assignments deleted. TS base constructor remains protected and independently sliced base-token inputs excluded; concrete class family actual behavior is the target. Actual original external-document manager and configuration services cannot be replaced with fake constants/models. Task96 native-check failed when overlapping source-link absence, so new --write/--check must complete sequentially before portable checks. Runtime declaration inventory excludes static properties/reexports; put declaration markers in actual owner only, aggregate/header export evidence stays. User stop111, next101first/continue."
id_source: "generated"
---
## Summary

Task97 implements actual external file/reference/name token family needed by original range operator/compiler and external ODS formula references, using actual shared/data owners.

## Scope

Actual ScExternalToken protected construction/base copy fields/GetFileId/equality and concrete ScExternalSingleRefToken/ScExternalDoubleRefToken/ScExternalNameToken value/by-value SharedString/copy/implicit move/Clone/stable const-string and mutable-reference getters/equality/unchanged shared-value cleanup boundary. No independently sliced base-token input, fake cast peers, refcounts/pools/finalizers/native memory manager or fake document/config/compiler. Existing SharedString/OUString/ScSingleRefData/ScComplexRefData/FormulaToken reused, native UInt16 index and literal ocPush/kind defaults retained. Erased token and SharedString rvalue categories use explicit existing-style move witnesses, no assignment API because original assignments deleted. Original string member moves clear only source string while copied refdata/file/type remain; copying retains independent value members. Add token.external.ts actual external-family responsibility shard because complete addition would exceed500line combined reference owner cap; original token.ts/header canonical aggregate exports retained, explicit runtime/provenance/filename responsibility split. New normal actual original native helper/fixture/replay over verified genuine formula/refdata headers, whole source identities and output, no memory/sanitizer/layout/invalid-input claims. Update4existing token/header records plus2new shard records/new capability/Calc/GC/suspicious docs if confirmed. Whole Calc/affected complete shared token/SAL/SVL/mdds owners+consumers raw100,16gates/static/Calc0UI/exact hashes/same-agent separate EVALUATOR and clean DONE oncalc. Real external-document manager, compiler/configuration/ScTokenArray/ScFormulaCell/document/grid/ODS remain prioritized missing owners. No full office run before101; continue then pause after secondfull111/repairs, leave Writer-only coverage separate.

## Plan

Actual external single/range/name token family with real shared/data/base reuse and protected file-index base; explicit responsibility shard, ordinary JS refs, genuine normal value proof/scoped raw100/16gates/exact review/DONE. No fake service/count/memory engine; continue101 and pause111.

## Verify Steps

1. node scripts/calc-external-token-native-probe.mjs --write then --check sequentially before source-link removal: complete original external base/concrete classes/member/constructor/destructor/equality and genuine existing formula/reference/header dependencies, normal initialized file-index/UTF16/null-empty/value-input/copy/implicit token move/Clone/string move/refdata/member/query/base mismatch histories match full current portable replay. No fake document/compiler/config/matrix peers/base slicing/invalid derived casts/counts/native memory/sanitizer/ABI experiment or source rewriting.
2. Whole source-absent npm run test:coverage:calc and affected complete shared token/SAL/SVL/mdds owners/consumer selection raw S/B/F/L100, every raw S/F/Bcounterpositive,4exact links restored. Static and Calc browser0profile pass (not editable UI readiness), no Writer-only repair or full run before101; continue101 and pause111/repairs.
3. Existing16whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks pass. Original actual local class and source responsibility metadata plus native/source and unexecuted genuine external-reference QA context. Record errors before bounded corrections, no thresholds/checker weakening; don't overlap native/source validation with portable reference-link absence.
4. Exact current/committed non-task source hashes only approved paths and current coverage/native/gates, same-agent separate EVALUATOR not independent, canonical DONE/clean git status --short --untracked-files=all branchcalc. Full application objective remains active, pause second upcoming full111 after relevant repairs.

## Verification

Pending approved implementation/checks.

## Rollback Plan

Revert only task97 intentional paths through followup; restore4links on every exit, no merging/history rewrites/unrelated task changes.

## Findings

Native actual external token classes own a copied/moved SharedString and value-copied reference data; file index UInt16. Complete concrete move uses real base copy semantics, moves string member, and preserves source reference fields. Existing SAL/SVL value cleanup remains unchanged shared boundary, no new refcount library. Original assignments deleted. TS base constructor remains protected and independently sliced base-token inputs excluded; concrete class family actual behavior is the target. Actual original external-document manager and configuration services cannot be replaced with fake constants/models. Task96 native-check failed when overlapping source-link absence, so new --write/--check must complete sequentially before portable checks. Runtime declaration inventory excludes static properties/reexports; put declaration markers in actual owner only, aggregate/header export evidence stays. User stop111, next101first/continue.
