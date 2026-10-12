---
id: "202610121002-WPSNEA"
title: "Implement original single-value SoA set with hinted writes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
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
  updated_at: "2026-10-12T10:03:22.462Z"
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
    body: "Start: implement approved original single-value plain and hinted SoA writes over existing shared fields on calc; capture whole unchanged native results and source-absent scoped raw100."
events:
  -
    type: "status"
    at: "2026-10-12T10:03:23.589Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original single-value plain and hinted SoA writes over existing shared fields on calc; capture whole unchanged native results and source-absent scoped raw100."
doc_version: 3
doc_updated_at: "2026-10-12T10:03:23.589Z"
doc_updated_by: "CODER"
description: "Iteration69: implement both original single-value set overloads and complete empty/data/singleton/top/middle/bottom neighbor transformations over the existing shared store. Reuse actual Calc strings and text attributes, preserve lifecycle/metadata/event/iterator order, and verify whole unchanged native cases and complete scoped source-absent raw100. Original main_def.inl single-value setter family may use a source-mapped main_def.set.ts implementation shard to retain the1000line limit; no alternate model or fake pointees."
sections:
  Summary: |-
    Implement original single-value SoA set with hinted writes

    Iteration69: implement both original single-value set overloads and complete empty/data/singleton/top/middle/bottom neighbor transformations over the existing shared store. Reuse actual Calc strings and text attributes, preserve lifecycle/metadata/event/iterator order, and verify whole unchanged native cases and complete scoped source-absent raw100. Original main_def.inl single-value setter family may use a source-mapped main_def.set.ts implementation shard to retain the1000line limit; no alternate model or fake pointees.
  Scope: "Existing shared SoA main.ts/main_def.ts and a source-mapped original single-cell setter implementation shard main_def.set.ts; complete native probe/fixture and shared/Calc test families. Reuse actual CellTextAttrStoreType/SharedString blocks. Update exact runtime/provenance/capability/internal-operation inventory and Calc progress. No policy/profile/threshold/exclusion changes, Writer-only repairs, network, merge, branch, publication or broad module/UI certification."
  Plan: |-
    1. CODER ports both original set(pos,const T&) and set(hint,pos,const T&) lookup/error contracts and full single-value set_impl dispatch over existing fields and iterator owners. Generalize erased value witnesses only where actual native T requires it.
    2. Preserve complete original set_cell_to_empty_block/set_cell_to_non_empty_block_of_size_one/set_cell_to_middle_of_block/set_cell_to_top_of_data_block/set_cell_to_bottom_of_data_block/append_cell_to_block algorithms, both size-based merge choices, actual block operations/event order and returned node identity. No synthesized substitute container. Source-map the original main_def.inl single-value setter family in main_def.set.ts to respect file limits; move the already implemented original push_back_impl into main_def.ts with its existing wrapper if needed. Keep type-only back imports and no runtime cycle.
    3. Capture complete unchanged native normal-only whole streams: bounded exhaustive original scalar segment/type/position/hint permutations plus actual owned special-member sequences and genuine Calc SharedString/CellTextAttr replacement reads and refcounts. Native instrumentation-only types do not replace Calc pointees. Keep undefined alias/invalid-owner behavior outside defined claims, retain normal native output and hashes.
    4. Verify full Calc and related shared source-absent tests and raw entire owners S/B/F/L100, all counters positive; preserve prior tests, unchanged maps and source hashes, independently inspect non-executable facade ASTs, native args/pins and restored source links. Final source-absent production build and actual new native stream tests pass.
    5. Register exact symbols and scoped capabilities and mutation/position bindings where required. Run all13scoped structural gates, formatting and35tooling cases. Full suite stays due71 after61. Record failures and retained evidence with bounded same-scope repairs. EVALUATOR reviews exact source commit in a separate same-agent phase; CODER records verification and closes clean calc. Goal remains active.
  Verify Steps: |-
    1. node scripts/mdds-container-set-native-probe.mjs --check: entire unchanged normal-only native SoA headers, genuine full value sources and verified dependency cache; every complete scalar/owned/Calc metadata/capacity/value/event/special-member/returned-node/position/refcount stream matches final fixture. Both actual set overloads and all defined branch outcomes covered, no selected C++ implementation or fake Calc provider.
    2. node output/playwright/task69-checks/portable.mjs: complete Calc and directly related shared tests with all original source symlinks physically absent; raw whole executable owners S/B/F/L100 and every counter positive. Preserve prior tests and unchanged source maps/hashes; restore exactly all3links.
    3. node output/playwright/task69-checks/final-local.mjs: final production build and all new native stream tests pass source-absent; original links restored.
    4. node output/playwright/task69-checks/facades.mjs; python3 output/playwright/task69-checks/audit.py: complete facade ASTs, exact owner/test selection and current hashes, prior unchanged maps, actual native/source/capability/provenance/mutation bindings and1000line source budgets pass.
    5. python3 output/playwright/task69-checks/gates.py plus intentional Prettier --check: inspect each of13exitCodes and35tooling cases; all type/lint/docs/size/dependency/provenance/tree/shared+Calc inventory/routing/doctor/diff gates pass. Full suite not due until71.
    6. ap task verify-show 202610121002-WPSNEA: same-agent EVALUATOR pass bound to exact implementationSHA, final ap verify and DONE closure on clean calc. Range-set/other container/pointee/formula/document/edit/undo/input/view/UI/native undefined/debug/allocator/physical ABI gaps remain explicit.
  Verification: "Pending implementation and complete declared checks. No readiness or parity claim from task setup."
  Rollback Plan: "Revert only this task implementation commit and its scoped registry/test records on calc; retain ignored raw evidence. User manages merges. Do not reset other work or modify original reference sources."
  Findings: "Iteration69, task8 since the full run at61; next full run71. Actual native single-value set takes const T&, including rvalue call expressions; no invented move setter overload. No source reference is shipped in the browser build."
id_source: "generated"
---
## Summary

Implement original single-value SoA set with hinted writes

Iteration69: implement both original single-value set overloads and complete empty/data/singleton/top/middle/bottom neighbor transformations over the existing shared store. Reuse actual Calc strings and text attributes, preserve lifecycle/metadata/event/iterator order, and verify whole unchanged native cases and complete scoped source-absent raw100. Original main_def.inl single-value setter family may use a source-mapped main_def.set.ts implementation shard to retain the1000line limit; no alternate model or fake pointees.

## Scope

Existing shared SoA main.ts/main_def.ts and a source-mapped original single-cell setter implementation shard main_def.set.ts; complete native probe/fixture and shared/Calc test families. Reuse actual CellTextAttrStoreType/SharedString blocks. Update exact runtime/provenance/capability/internal-operation inventory and Calc progress. No policy/profile/threshold/exclusion changes, Writer-only repairs, network, merge, branch, publication or broad module/UI certification.

## Plan

1. CODER ports both original set(pos,const T&) and set(hint,pos,const T&) lookup/error contracts and full single-value set_impl dispatch over existing fields and iterator owners. Generalize erased value witnesses only where actual native T requires it.
2. Preserve complete original set_cell_to_empty_block/set_cell_to_non_empty_block_of_size_one/set_cell_to_middle_of_block/set_cell_to_top_of_data_block/set_cell_to_bottom_of_data_block/append_cell_to_block algorithms, both size-based merge choices, actual block operations/event order and returned node identity. No synthesized substitute container. Source-map the original main_def.inl single-value setter family in main_def.set.ts to respect file limits; move the already implemented original push_back_impl into main_def.ts with its existing wrapper if needed. Keep type-only back imports and no runtime cycle.
3. Capture complete unchanged native normal-only whole streams: bounded exhaustive original scalar segment/type/position/hint permutations plus actual owned special-member sequences and genuine Calc SharedString/CellTextAttr replacement reads and refcounts. Native instrumentation-only types do not replace Calc pointees. Keep undefined alias/invalid-owner behavior outside defined claims, retain normal native output and hashes.
4. Verify full Calc and related shared source-absent tests and raw entire owners S/B/F/L100, all counters positive; preserve prior tests, unchanged maps and source hashes, independently inspect non-executable facade ASTs, native args/pins and restored source links. Final source-absent production build and actual new native stream tests pass.
5. Register exact symbols and scoped capabilities and mutation/position bindings where required. Run all13scoped structural gates, formatting and35tooling cases. Full suite stays due71 after61. Record failures and retained evidence with bounded same-scope repairs. EVALUATOR reviews exact source commit in a separate same-agent phase; CODER records verification and closes clean calc. Goal remains active.

## Verify Steps

1. node scripts/mdds-container-set-native-probe.mjs --check: entire unchanged normal-only native SoA headers, genuine full value sources and verified dependency cache; every complete scalar/owned/Calc metadata/capacity/value/event/special-member/returned-node/position/refcount stream matches final fixture. Both actual set overloads and all defined branch outcomes covered, no selected C++ implementation or fake Calc provider.
2. node output/playwright/task69-checks/portable.mjs: complete Calc and directly related shared tests with all original source symlinks physically absent; raw whole executable owners S/B/F/L100 and every counter positive. Preserve prior tests and unchanged source maps/hashes; restore exactly all3links.
3. node output/playwright/task69-checks/final-local.mjs: final production build and all new native stream tests pass source-absent; original links restored.
4. node output/playwright/task69-checks/facades.mjs; python3 output/playwright/task69-checks/audit.py: complete facade ASTs, exact owner/test selection and current hashes, prior unchanged maps, actual native/source/capability/provenance/mutation bindings and1000line source budgets pass.
5. python3 output/playwright/task69-checks/gates.py plus intentional Prettier --check: inspect each of13exitCodes and35tooling cases; all type/lint/docs/size/dependency/provenance/tree/shared+Calc inventory/routing/doctor/diff gates pass. Full suite not due until71.
6. ap task verify-show 202610121002-WPSNEA: same-agent EVALUATOR pass bound to exact implementationSHA, final ap verify and DONE closure on clean calc. Range-set/other container/pointee/formula/document/edit/undo/input/view/UI/native undefined/debug/allocator/physical ABI gaps remain explicit.

## Verification

Pending implementation and complete declared checks. No readiness or parity claim from task setup.

## Rollback Plan

Revert only this task implementation commit and its scoped registry/test records on calc; retain ignored raw evidence. User manages merges. Do not reset other work or modify original reference sources.

## Findings

Iteration69, task8 since the full run at61; next full run71. Actual native single-value set takes const T&, including rvalue call expressions; no invented move setter overload. No source reference is shipped in the browser build.
