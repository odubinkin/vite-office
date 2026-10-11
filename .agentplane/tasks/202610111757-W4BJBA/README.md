---
id: "202610111757-W4BJBA"
title: "Port original CPPu UNO equality engine"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:58:19.438Z"
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
    body: "Start: implement complete original shared CPPu equality and real query boundaries in calc checkout, using existing owners and bounded complete native/portable source-absent verification."
events:
  -
    type: "status"
    at: "2026-10-11T17:58:20.203Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement complete original shared CPPu equality and real query boundaries in calc checkout, using existing owners and bounded complete native/portable source-absent verification."
doc_version: 3
doc_updated_at: "2026-10-11T17:58:20.203Z"
doc_updated_by: "CODER"
description: "Task43: implement complete original eq.hxx comparison and its data.cxx entry/query boundaries as the real shared dependency of Sequence value equality and downstream Calc casing services, retaining native numeric/type/interface/compound/sequence ordering with complete genuine native captures and source-absent100 coverage."
sections:
  Summary: "Task43 implements the complete original shared CPPu eq.hxx equality engine and actual data.cxx boundaries, the next dependency of public Sequence equality and downstream casing/CharClass/shared-string/Calc owners."
  Scope: "Only vite-office-calc branch calc. New source-shaped cppu/source/uno/eq.ts and function-boundary eq-sequence.ts or eq-numeric.ts split if required by the600-line budget; original _equalObject/_equalStruct/_equalSequence/_equalData logic and switches, exact numeric casts and ordering, Any flattening, type identity, compound base/reverse members, descending sequence elements and actual interface query/acquire/release. Existing data.ts owns genuine binuno_queryInterface, equalStruct/equalSequence and public uno_type_equalData/uno_equalData wrappers; data declarations reuse owners. Existing prim.ts declaration reexports actual binuno_queryInterface only if required by source architecture; existing shared SAL/CPPu type/string/storage/FFI/default/copy/destruction functions are reused. Adjacent complete portable native replay test/fixture and scripts/uno-equality-native-probe.mjs reuse original native build and shared native-value caller/observer; narrowly extend those shared callers if necessary, no duplicate type/provider/allocator. Native full any/data/sequence TUs and genuine SAL/CPPu dependencies unchanged. Per-owner registry runtime/provenance/capability records, Calc core documentation and genuine suspected upstream journal entries. No stub equality, custom recursive JS structural comparison, broad behavior/default parity promotion, native pointer/byte ABI/OOM/undefined float-cast claim or entire downstream template/service/pool/document/UI implementation in this leaf. Source-absent Calc and directly related shared raw100, actual scoped gates; no full suite until task51, no Writer-only repair, network/publication/merge/new branch or subagents."
  Plan: "Implement complete original shared equality/data-query boundaries; preserve native switches/casts/Any/type/descending compound-sequence/interface ownership; actual unchanged native normal-ASan full capture and portable replay, source-absent Calc/related shared raw100, all scoped gates, accurate inventory, EVALUATOR review and clean close. Next full task51."
  Verify Steps: |-
    1. Inspect whole pinned eq.hxx/data.cxx/header and all reused types/storage/query/string owners; verify original source hashes. Preserve literal destination/source type switch behavior, unsigned-hyper signed reinterpretation where present, mathematical cmp_equal, original float/double casts, floor/nonnegative guards, Any flattening, source description borrowing and all acquisition/release/short-circuit order. Do not execute undefined floating-to-integer casts or invalid pointer/tail reads.
    2. Run node scripts/uno-equality-native-probe.mjs --write then --check; pure observation caller invokes complete original eq/data/any/sequence and genuine dependencies, all full source/dependency hashes bound to pin. Normal and ASan/UBSan complete outputs identical, native/portable entire byte streams agree for numeric pairs, scalar/Any/meta/type/default/compound/sequence/interface and actual binuno query boundaries. Original floating-to-u64 out-of-range inputs, native ABI/address/resources, consumer QA and unsupported inputs explicitly unverified.
    3. With all3 original links absent, run npm run test:coverage:calc and exact related shared profile (latest task42 manifest plus equality tests/new runtime owners); all raw S/F/B counters positive and S/B/F/L100. Restore exact targets in finally; no coverage/assertion/timeout/test-scope weakening.
    4. Run TS7, exact ESLint/Prettier/JSDoc, file-size, actual module boundary, exhaustive provenance/tree, shared/Calc inventory, directly related tooling, routing/doctor/diff. Use native JS conversions where original comparison proves equivalence, implement only evidence-required exact casts. Native sources unchanged; no unnecessary full or unchanged native replay.
    5. Record actual verification and residual public-template/service/CharClass/pool/cell/document/view/UI gaps. Intentional implementation commit, separate EVALUATOR quality phase and persisted quality artifact checkpoint, clean direct closure. Next full task51, full goal active until entire requested Calc outcome is achieved.
  Verification: "Pending original complete equality engine and actual native/portable evidence."
  Rollback Plan: "Revert only intentional task43 commits if required. Preserve task42 and unrelated active tasks. Restore exact original3links on every source-absent runner exit; never mutate original native sources."
  Findings: "Previous goal turn made concrete verified progress: task42 DONE with original C sequence engine, complete358-source native captures, Calc106/24 and shared120/36 raw100, all13 gates and clean50595181829e close. Public Sequence.hxx equality calls uno_type_equalData, currently absent. Its original fallback uses actual data.cxx::binuno_queryInterface, also absent. No provisional class/structural equality/provider will substitute for these source owners. This executable single-owner equality leaf is a direct prerequisite; later UI remains incomplete."
id_source: "generated"
---
## Summary

Task43 implements the complete original shared CPPu eq.hxx equality engine and actual data.cxx boundaries, the next dependency of public Sequence equality and downstream casing/CharClass/shared-string/Calc owners.

## Scope

Only vite-office-calc branch calc. New source-shaped cppu/source/uno/eq.ts and function-boundary eq-sequence.ts or eq-numeric.ts split if required by the600-line budget; original _equalObject/_equalStruct/_equalSequence/_equalData logic and switches, exact numeric casts and ordering, Any flattening, type identity, compound base/reverse members, descending sequence elements and actual interface query/acquire/release. Existing data.ts owns genuine binuno_queryInterface, equalStruct/equalSequence and public uno_type_equalData/uno_equalData wrappers; data declarations reuse owners. Existing prim.ts declaration reexports actual binuno_queryInterface only if required by source architecture; existing shared SAL/CPPu type/string/storage/FFI/default/copy/destruction functions are reused. Adjacent complete portable native replay test/fixture and scripts/uno-equality-native-probe.mjs reuse original native build and shared native-value caller/observer; narrowly extend those shared callers if necessary, no duplicate type/provider/allocator. Native full any/data/sequence TUs and genuine SAL/CPPu dependencies unchanged. Per-owner registry runtime/provenance/capability records, Calc core documentation and genuine suspected upstream journal entries. No stub equality, custom recursive JS structural comparison, broad behavior/default parity promotion, native pointer/byte ABI/OOM/undefined float-cast claim or entire downstream template/service/pool/document/UI implementation in this leaf. Source-absent Calc and directly related shared raw100, actual scoped gates; no full suite until task51, no Writer-only repair, network/publication/merge/new branch or subagents.

## Plan

Implement complete original shared equality/data-query boundaries; preserve native switches/casts/Any/type/descending compound-sequence/interface ownership; actual unchanged native normal-ASan full capture and portable replay, source-absent Calc/related shared raw100, all scoped gates, accurate inventory, EVALUATOR review and clean close. Next full task51.

## Verify Steps

1. Inspect whole pinned eq.hxx/data.cxx/header and all reused types/storage/query/string owners; verify original source hashes. Preserve literal destination/source type switch behavior, unsigned-hyper signed reinterpretation where present, mathematical cmp_equal, original float/double casts, floor/nonnegative guards, Any flattening, source description borrowing and all acquisition/release/short-circuit order. Do not execute undefined floating-to-integer casts or invalid pointer/tail reads.
2. Run node scripts/uno-equality-native-probe.mjs --write then --check; pure observation caller invokes complete original eq/data/any/sequence and genuine dependencies, all full source/dependency hashes bound to pin. Normal and ASan/UBSan complete outputs identical, native/portable entire byte streams agree for numeric pairs, scalar/Any/meta/type/default/compound/sequence/interface and actual binuno query boundaries. Original floating-to-u64 out-of-range inputs, native ABI/address/resources, consumer QA and unsupported inputs explicitly unverified.
3. With all3 original links absent, run npm run test:coverage:calc and exact related shared profile (latest task42 manifest plus equality tests/new runtime owners); all raw S/F/B counters positive and S/B/F/L100. Restore exact targets in finally; no coverage/assertion/timeout/test-scope weakening.
4. Run TS7, exact ESLint/Prettier/JSDoc, file-size, actual module boundary, exhaustive provenance/tree, shared/Calc inventory, directly related tooling, routing/doctor/diff. Use native JS conversions where original comparison proves equivalence, implement only evidence-required exact casts. Native sources unchanged; no unnecessary full or unchanged native replay.
5. Record actual verification and residual public-template/service/CharClass/pool/cell/document/view/UI gaps. Intentional implementation commit, separate EVALUATOR quality phase and persisted quality artifact checkpoint, clean direct closure. Next full task51, full goal active until entire requested Calc outcome is achieved.

## Verification

Pending original complete equality engine and actual native/portable evidence.

## Rollback Plan

Revert only intentional task43 commits if required. Preserve task42 and unrelated active tasks. Restore exact original3links on every source-absent runner exit; never mutate original native sources.

## Findings

Previous goal turn made concrete verified progress: task42 DONE with original C sequence engine, complete358-source native captures, Calc106/24 and shared120/36 raw100, all13 gates and clean50595181829e close. Public Sequence.hxx equality calls uno_type_equalData, currently absent. Its original fallback uses actual data.cxx::binuno_queryInterface, also absent. No provisional class/structural equality/provider will substitute for these source owners. This executable single-owner equality leaf is a direct prerequisite; later UI remains incomplete.
