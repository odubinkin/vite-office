---
id: "202610120529-X8AGH7"
title: "Implement original object value ownership in shared vector storage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "shared"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-12T05:31:49.666Z"
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
    body: "Start: implement original owned-value vector operation family over actual shared storage, native operator witnesses and whole source-absent related100."
events:
  -
    type: "status"
    at: "2026-10-12T05:31:50.583Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original owned-value vector operation family over actual shared storage, native operator witnesses and whole source-absent related100."
doc_version: 3
doc_updated_at: "2026-10-12T05:38:22.541Z"
doc_updated_by: "CODER"
description: "Task64 UI storage prerequisite: complete initialized value-ownership semantics for existing shared vector_storage/std_vector operations, reused scalar/borrowed-pointer paths, original C++ template operator witnesses, native whole-header caller traces normal/ASan/UBSan, source-absent Calc and exact full task63 related profile at raw100, inventory and scoped gates. Delayed-vector/default custom value integration remains the next owner boundary; no object class duplication, generic provider or narrowed replacement storage engine. Full71 next."
sections:
  Summary: "Previous goal turn made concrete progress: task63 complete original managed/noncopyable mdds pointer blocks is DONE, source4ea09eaeb70a1bf8054e7141878cd7669de7adc0 and clean close d87c4a780cd4. Continue missing real object-value ownership required by Calc string/metadata storage. Full61 passed and full71 remains next; entire goal remains incomplete."
  Scope: "Implement original initialized std::vector value ownership for every existing vector_storage.ts helper/std_vector operation, extending actual shared storage with erased ValueT copy/move/assignment/destructor/equality and move-if-noexcept type witnesses. Keep scalar/borrowed-pointer paths unchanged and reuse existing storage, without a parallel container/provider. Add original copy/move constructor/assignment and logical destructor bindings where needed. No class/pointee deletion, object class duplication, custom allocator, native physical ABI, invalidated/self-inserting ranges, throwing user operators/allocation recovery or full STL/MTV/Calc document/UI claims. Existing delayed_delete_vector/default custom value specializations and actual SharedString/CellTextAttr block wiring are next distinct owner boundary. Add vector_value_ownership.test.ts/native-vector-value-cases.json and scripts/mdds-vector-value-native-probe.mjs over whole verified pinned mdds/native std::vector headers; actual native class operator observers, two move-trait variants normal/ASan/UBSan and whole traces. Matching shared runtime/provenance/capability records for vector_storage.ts and calc-core.md; Calc suspicious journal only if genuine upstream suspicion confirmed."
  Plan: "Verify native complete value-ownership streams first, implement complete existing shared vector operation family with original C++ ValueT operator witnesses and source-preserving scalar paths, compare whole native output and caller-owned mutable object identities/destruction. Source-absent Calc and exact full task63 related argv plus entire new test/owner at raw100; retain raw source maps for unchanged owners and restore all three links. Scoped13gates/tooling/intentional-file format, source commit and matching-SHA same-agent EVALUATOR review, CODER verification and clean meaningful closure; no merges/subagents."
  Verify Steps: "node scripts/mdds-vector-value-native-probe.mjs --write and --check: whole unchanged verified pinned mdds inputs and real native std::vector, normal/ASan/UBSan positive compile/execution statuses, whole object constructor/assignment/identity/value/destructor traces for both move-if-noexcept traits, no synthetic C++ vector implementation. node output/playwright/task64-checks/portable.mjs: all original source links absent, Calc and exact full task63 related argv plus entire new native replay test, all whole affected owners raw S/B/F/L100; source/argument/map audit and restored links. All13scoped gates from gates-inputs.json (typecheck, changed source/test/probe lint, docs,size,boundaries,provenance/tree,shared/Calc inventory,related tooling,routing,doctor,diff), intentional-file Prettier; retain failed evidence and source-backed repair without Writer-only/config/threshold changes. Actual implementation SHA recorded before EVALUATOR, quality exact-SHA and clean verification/finish."
  Verification: "Pending complete native/portable and repository evidence."
  Rollback Plan: "Revert only intentional task64 source/native fixture/inventory/docs on calc; retain verification evidence and restore source symlinks. Do not merge or change unrelated active tasks."
  Findings: |-
    Preflight clean calc; only two unrelated active Writer tasks. Actual SharedString copy/move/assign/destructor already implemented and will be reused. Current vector storage is scalar/borrowed-pointer only, so direct object references cannot model owned value copies/releases. CellTextAttr has no equality operator; preserve optional native equality witness and do not require it merely to construct a vector. Prior task63 route boilerplate result produced a too-generic close subject; retain meaningful substantive finish result and body for closure.

    - Observation: First native caller compilation failed before executing any tests: direct delayed_delete_vector.hpp include requires original is_std_vector_bool_store template declaration from the public type header.
      Impact: Native evidence incomplete; original compiler diagnostics retained in native-first.log. No successful fixture or portable claim.
      Resolution: Use unchanged genuine types.hpp umbrella include, which supplies original trait declarations and delayed-vector implementation. Do not synthesize trait declarations or edit upstream headers; inspect original include order and rerun native capture.
id_source: "generated"
---
## Summary

Previous goal turn made concrete progress: task63 complete original managed/noncopyable mdds pointer blocks is DONE, source4ea09eaeb70a1bf8054e7141878cd7669de7adc0 and clean close d87c4a780cd4. Continue missing real object-value ownership required by Calc string/metadata storage. Full61 passed and full71 remains next; entire goal remains incomplete.

## Scope

Implement original initialized std::vector value ownership for every existing vector_storage.ts helper/std_vector operation, extending actual shared storage with erased ValueT copy/move/assignment/destructor/equality and move-if-noexcept type witnesses. Keep scalar/borrowed-pointer paths unchanged and reuse existing storage, without a parallel container/provider. Add original copy/move constructor/assignment and logical destructor bindings where needed. No class/pointee deletion, object class duplication, custom allocator, native physical ABI, invalidated/self-inserting ranges, throwing user operators/allocation recovery or full STL/MTV/Calc document/UI claims. Existing delayed_delete_vector/default custom value specializations and actual SharedString/CellTextAttr block wiring are next distinct owner boundary. Add vector_value_ownership.test.ts/native-vector-value-cases.json and scripts/mdds-vector-value-native-probe.mjs over whole verified pinned mdds/native std::vector headers; actual native class operator observers, two move-trait variants normal/ASan/UBSan and whole traces. Matching shared runtime/provenance/capability records for vector_storage.ts and calc-core.md; Calc suspicious journal only if genuine upstream suspicion confirmed.

## Plan

Verify native complete value-ownership streams first, implement complete existing shared vector operation family with original C++ ValueT operator witnesses and source-preserving scalar paths, compare whole native output and caller-owned mutable object identities/destruction. Source-absent Calc and exact full task63 related argv plus entire new test/owner at raw100; retain raw source maps for unchanged owners and restore all three links. Scoped13gates/tooling/intentional-file format, source commit and matching-SHA same-agent EVALUATOR review, CODER verification and clean meaningful closure; no merges/subagents.

## Verify Steps

node scripts/mdds-vector-value-native-probe.mjs --write and --check: whole unchanged verified pinned mdds inputs and real native std::vector, normal/ASan/UBSan positive compile/execution statuses, whole object constructor/assignment/identity/value/destructor traces for both move-if-noexcept traits, no synthetic C++ vector implementation. node output/playwright/task64-checks/portable.mjs: all original source links absent, Calc and exact full task63 related argv plus entire new native replay test, all whole affected owners raw S/B/F/L100; source/argument/map audit and restored links. All13scoped gates from gates-inputs.json (typecheck, changed source/test/probe lint, docs,size,boundaries,provenance/tree,shared/Calc inventory,related tooling,routing,doctor,diff), intentional-file Prettier; retain failed evidence and source-backed repair without Writer-only/config/threshold changes. Actual implementation SHA recorded before EVALUATOR, quality exact-SHA and clean verification/finish.

## Verification

Pending complete native/portable and repository evidence.

## Rollback Plan

Revert only intentional task64 source/native fixture/inventory/docs on calc; retain verification evidence and restore source symlinks. Do not merge or change unrelated active tasks.

## Findings

Preflight clean calc; only two unrelated active Writer tasks. Actual SharedString copy/move/assign/destructor already implemented and will be reused. Current vector storage is scalar/borrowed-pointer only, so direct object references cannot model owned value copies/releases. CellTextAttr has no equality operator; preserve optional native equality witness and do not require it merely to construct a vector. Prior task63 route boilerplate result produced a too-generic close subject; retain meaningful substantive finish result and body for closure.

- Observation: First native caller compilation failed before executing any tests: direct delayed_delete_vector.hpp include requires original is_std_vector_bool_store template declaration from the public type header.
  Impact: Native evidence incomplete; original compiler diagnostics retained in native-first.log. No successful fixture or portable claim.
  Resolution: Use unchanged genuine types.hpp umbrella include, which supplies original trait declarations and delayed-vector implementation. Do not synthesize trait declarations or edit upstream headers; inspect original include order and rerun native capture.
