---
id: "202610121608-SAM7JV"
title: "Implement original mdds matrix storage and typed access"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
  updated_at: "2026-10-12T16:09:21.276Z"
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
    body: "Start: approved ongoing Calc goal and UI prerequisite order; implement genuine original matrix storage/access with existing shared SoA blocks and whole scoped parity evidence, no replacement engine or Writer repair."
events:
  -
    type: "status"
    at: "2026-10-12T16:09:23.152Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved ongoing Calc goal and UI prerequisite order; implement genuine original matrix storage/access with existing shared SoA blocks and whole scoped parity evidence, no replacement engine or Writer repair."
doc_version: 3
doc_updated_at: "2026-10-12T16:09:23.152Z"
doc_updated_by: "CODER"
description: "Task78 of the ongoing approved Calc UI prerequisite goal: implement genuine multi_type_matrix core over existing shared SoA multi_type_vector, original traits/size/constructors/lifetimes/positions/typed scalar and range writes/queries/empty/numeric/swap. Preserve upstream behavior with ordinary native evidence; keep unimplemented transpose/copy/resize/walk and ScMatrix/document/UI explicitly pending. Whole Calc and affected shared raw100, inventory and provenance, local gates, source-bound separate same-agent evaluation. Only calc checkout/branch; next full81."
sections:
  Summary: "Task78 implements the actual original mdds3.2.1 multi_type_matrix storage/access owner required by Calc ScMatrix, reusing genuine shared SoA multi_type_vector and element blocks."
  Scope: "Only calc checkout/branch. Matrix runtime header/definition/type shards, colocated tests/native fixture; ordinary native probe; capability/runtime/provenance inventory entries; calc-core documentation and task metadata. Original traits, size_pair_type, default/size/value/range/copy/defaulted-move/destructor, equality, positions, typed reads and scalar/range/empty writes, numeric/empty/clear/swap. No synthetic backing store, guessed JS overloads, Writer coverage repairs, sanitizer or broad matrix/document/UI certification. Transpose, matrix copy, resize and walks remain real subsequent source scopes."
  Plan: "Implement original matrix core storage/access over genuine SoA vector; ordinary native full-header evidence, whole Calc/affected shared raw100, inventory/provenance and local gates, exact-source same-agent evaluator. Preserve actual missing transpose/copy/resize/walk and Calc owners, next full81."
  Verify Steps: "1. node scripts/calc-matrix-native-probe.mjs --write and --check: unchanged full original matrix/vector headers, actual Calc string/UInt16/UInt8 block traits where exercised, whole deterministic normal-only streams and source hashes, no fake dependencies. 2. node output/playwright/task78-checks/portable.mjs: entire Calc and directly affected complete shared owners/tests, raw S/B/F/L100 and every counter positive, reference links absent/restored, source-absent build and Calc profile. 3. node output/playwright/task78-checks/gates.mjs: full format/lint/type/docs/size/deps/resources/tree/provenance/registry/routing/doctor/diff plus affected complete tooling tests. 4. Exact source/test hashes tied to implementation commit and separate same-agent EVALUATOR with nonempty evidence/findings; truthful pending APIs and broad false flags; final authoritative DONE and clean all-files git status. Next full81, no earlier full suite or Writer-only repair."
  Verification: "Pending implementation and declared scoped checks. No completion, 100% coverage or UI readiness claim."
  Rollback Plan: "Revert only intentional task78 changes through a new approved task; preserve existing SoA/shared owners and unrelated work. No branch merge or destructive history."
  Findings: "Readonly upstream inspection confirms multi_type_vector.hpp aliases the existing SoA owner. Matrix traits register bool/int8/double plus actual custom string/integer blocks; type translation rejects unsupported int8 although the store registers it. Column-major get_pos deliberately performs no coordinate boundary checks. Existing vector implements constructors/copy/move/queries/scalar/range writes/empty/clear/swap; no replacement engine required."
id_source: "generated"
---
## Summary

Task78 implements the actual original mdds3.2.1 multi_type_matrix storage/access owner required by Calc ScMatrix, reusing genuine shared SoA multi_type_vector and element blocks.

## Scope

Only calc checkout/branch. Matrix runtime header/definition/type shards, colocated tests/native fixture; ordinary native probe; capability/runtime/provenance inventory entries; calc-core documentation and task metadata. Original traits, size_pair_type, default/size/value/range/copy/defaulted-move/destructor, equality, positions, typed reads and scalar/range/empty writes, numeric/empty/clear/swap. No synthetic backing store, guessed JS overloads, Writer coverage repairs, sanitizer or broad matrix/document/UI certification. Transpose, matrix copy, resize and walks remain real subsequent source scopes.

## Plan

Implement original matrix core storage/access over genuine SoA vector; ordinary native full-header evidence, whole Calc/affected shared raw100, inventory/provenance and local gates, exact-source same-agent evaluator. Preserve actual missing transpose/copy/resize/walk and Calc owners, next full81.

## Verify Steps

1. node scripts/calc-matrix-native-probe.mjs --write and --check: unchanged full original matrix/vector headers, actual Calc string/UInt16/UInt8 block traits where exercised, whole deterministic normal-only streams and source hashes, no fake dependencies. 2. node output/playwright/task78-checks/portable.mjs: entire Calc and directly affected complete shared owners/tests, raw S/B/F/L100 and every counter positive, reference links absent/restored, source-absent build and Calc profile. 3. node output/playwright/task78-checks/gates.mjs: full format/lint/type/docs/size/deps/resources/tree/provenance/registry/routing/doctor/diff plus affected complete tooling tests. 4. Exact source/test hashes tied to implementation commit and separate same-agent EVALUATOR with nonempty evidence/findings; truthful pending APIs and broad false flags; final authoritative DONE and clean all-files git status. Next full81, no earlier full suite or Writer-only repair.

## Verification

Pending implementation and declared scoped checks. No completion, 100% coverage or UI readiness claim.

## Rollback Plan

Revert only intentional task78 changes through a new approved task; preserve existing SoA/shared owners and unrelated work. No branch merge or destructive history.

## Findings

Readonly upstream inspection confirms multi_type_vector.hpp aliases the existing SoA owner. Matrix traits register bool/int8/double plus actual custom string/integer blocks; type translation rejects unsupported int8 although the store registers it. Column-major get_pos deliberately performs no coordinate boundary checks. Existing vector implements constructors/copy/move/queries/scalar/range writes/empty/clear/swap; no replacement engine required.
