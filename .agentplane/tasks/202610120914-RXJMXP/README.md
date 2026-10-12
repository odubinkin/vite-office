---
id: "202610120914-RXJMXP"
title: "Connect original owned append forwarding and positional value reads"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
  updated_at: "2026-10-12T09:15:22.872Z"
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
    body: "Start: Connect approved original owned append forwarding and positional value copies over the shared SoA/default-block pipeline on calc; preserve source evidence and whole scoped raw100."
events:
  -
    type: "status"
    at: "2026-10-12T09:15:24.701Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect approved original owned append forwarding and positional value copies over the shared SoA/default-block pipeline on calc; preserve source evidence and whole scoped raw100."
doc_version: 3
doc_updated_at: "2026-10-12T09:15:24.701Z"
doc_updated_by: "CODER"
description: "Iteration68: connect actual owned lvalue/rvalue append to the existing original SoA pipeline, expose native ValueT alias members on concrete default blocks and preserve positional by-value copies for Calc strings/text attributes. Move remaining metadata arithmetic/reserve bodies to original main_def boundary to respect file budgets. Use whole unchanged native owners and complete source-absent scoped raw100 verification; no synthetic CellStoreType or UI readiness claim."
sections:
  Summary: |-
    Connect original owned append forwarding and positional value reads

    Iteration68: connect actual owned lvalue/rvalue append to the existing original SoA pipeline, expose native ValueT alias members on concrete default blocks and preserve positional by-value copies for Calc strings/text attributes. Move remaining metadata arithmetic/reserve bodies to original main_def boundary to respect file budgets. Use whole unchanged native owners and complete source-absent scoped raw100 verification; no synthetic CellStoreType or UI readiness claim.
  Scope: "Existing shared mdds types.ts and SoA main.ts/main_def.ts only; actual existing Calc block/callback/trait/value owners reused by tests. New whole native probe/fixture and related shared/Calc tests; existing module runtime/provenance, scoped capability/internal-operation records where required and Calc core progress. No duplicate engine, fake CellStoreType, absent pointee graph, UI/module parity promotion, policy/exclusion/threshold changes, network/branch/merge/publication."
  Plan: |-
    1. CODER binds the actual native default block value_type alias to its existing ValueT members, preserving scalar/pointer identity and bool-store dispatch. Original positional get copies the accessed actual owned value with this constructor; existing borrowed at access remains unchanged.
    2. Generalize original existing push_back/create_new_block_with_new_cell type bindings to owned values. Add explicit erased rvalue push_back_move forwarding through the same pipeline and existing macro append_value_move. Preserve acquire-before-append, category/empty segmentation, metadata/size updates and aliased append ordering.
    3. Move existing metadata calc_block_position/calc_next_block_position/reserve bodies into original main_def.inl boundary, retaining header wrappers and original algorithms under1000line limits, no new runtime import cycle.
    4. Compare complete normal-only native SoA/ValueT special-member and actual SharedString/CellTextAttr streams covering empty/matching/different types, lvalue/rvalue/self-alias append, full metadata/events/return iterator state and positional independent copies. Use whole unchanged headers and real value owners; no generated replacement algorithm.
    5. Run complete source-absent Calc and related shared raw S/B/F/L100, final source-absent production build and fresh native-stream tests, all13scoped gates/35tooling cases, exact source/hash/map/facade/inventory audits and intentional-file formatting. Last full61; next full71, Writer-only coverage untouched.
    6. Append exact inventory/provenance/evidence, preserve suspicious upstream behavior and journal only newly established issues; source commit, same-agent EVALUATOR exact-SHA phase, record ap verification and finish clean on calc. Broad goal remains active and document/UI prerequisites continue.
  Verify Steps: |-
    1. node scripts/mdds-container-append-native-probe.mjs --check: complete unchanged normal-only native SoA headers plus actual real value sources; full special-member/metadata/category/event/returned-position/refcount/alias/positional-copy streams match fixture and verified full cached dependency hashes. Original invalid source ranges or native UB are not invented as defined results.
    2. node output/playwright/task68-checks/portable.mjs: entire Calc and all directly related shared tests physically source-absent; raw entire selected executable owners S/B/F/L100 and every counter positive, prior tests/maps retained, no exclusions/threshold weakening. Restore all original symlinks exactly.
    3. node output/playwright/task68-checks/final-local.mjs: final production build and new shared/Calc whole native-stream cases source-absent, no failures, exact links restored.
    4. node output/playwright/task68-checks/facades.mjs; python3 output/playwright/task68-checks/audit.py: entire non-executable facade ASTs, whole owner/test selection/current hashes and unchanged map retention, actual native/source/fixture/capability/provenance/internal-operation bindings and file budgets pass.
    5. python3 output/playwright/task68-checks/gates.py: inspect all13actual exitCodes and35tooling cases; all type/lint/docs/size/dependencies/provenance/tree/shared+Calc inventory/routing/doctor/diff checks pass, intentional files format clean. Full remains due71 after61.
    6. ap task verify-show 202610120914-RXJMXP: exact implementation-bound EVALUATOR pass, final ap verification and clean tracked/untracked state on calc. Whole cell/pointee/document/UI/static/allocator/throwing/physical-ABI/upstream-QA gaps remain explicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task68 code/fixture/inventory commits; re-run whole Calc and related shared source-absent checks. Preserve unchanged prior67 native/coverage evidence and assertions."
  Findings: ""
id_source: "generated"
---
## Summary

Connect original owned append forwarding and positional value reads

Iteration68: connect actual owned lvalue/rvalue append to the existing original SoA pipeline, expose native ValueT alias members on concrete default blocks and preserve positional by-value copies for Calc strings/text attributes. Move remaining metadata arithmetic/reserve bodies to original main_def boundary to respect file budgets. Use whole unchanged native owners and complete source-absent scoped raw100 verification; no synthetic CellStoreType or UI readiness claim.

## Scope

Existing shared mdds types.ts and SoA main.ts/main_def.ts only; actual existing Calc block/callback/trait/value owners reused by tests. New whole native probe/fixture and related shared/Calc tests; existing module runtime/provenance, scoped capability/internal-operation records where required and Calc core progress. No duplicate engine, fake CellStoreType, absent pointee graph, UI/module parity promotion, policy/exclusion/threshold changes, network/branch/merge/publication.

## Plan

1. CODER binds the actual native default block value_type alias to its existing ValueT members, preserving scalar/pointer identity and bool-store dispatch. Original positional get copies the accessed actual owned value with this constructor; existing borrowed at access remains unchanged.
2. Generalize original existing push_back/create_new_block_with_new_cell type bindings to owned values. Add explicit erased rvalue push_back_move forwarding through the same pipeline and existing macro append_value_move. Preserve acquire-before-append, category/empty segmentation, metadata/size updates and aliased append ordering.
3. Move existing metadata calc_block_position/calc_next_block_position/reserve bodies into original main_def.inl boundary, retaining header wrappers and original algorithms under1000line limits, no new runtime import cycle.
4. Compare complete normal-only native SoA/ValueT special-member and actual SharedString/CellTextAttr streams covering empty/matching/different types, lvalue/rvalue/self-alias append, full metadata/events/return iterator state and positional independent copies. Use whole unchanged headers and real value owners; no generated replacement algorithm.
5. Run complete source-absent Calc and related shared raw S/B/F/L100, final source-absent production build and fresh native-stream tests, all13scoped gates/35tooling cases, exact source/hash/map/facade/inventory audits and intentional-file formatting. Last full61; next full71, Writer-only coverage untouched.
6. Append exact inventory/provenance/evidence, preserve suspicious upstream behavior and journal only newly established issues; source commit, same-agent EVALUATOR exact-SHA phase, record ap verification and finish clean on calc. Broad goal remains active and document/UI prerequisites continue.

## Verify Steps

1. node scripts/mdds-container-append-native-probe.mjs --check: complete unchanged normal-only native SoA headers plus actual real value sources; full special-member/metadata/category/event/returned-position/refcount/alias/positional-copy streams match fixture and verified full cached dependency hashes. Original invalid source ranges or native UB are not invented as defined results.
2. node output/playwright/task68-checks/portable.mjs: entire Calc and all directly related shared tests physically source-absent; raw entire selected executable owners S/B/F/L100 and every counter positive, prior tests/maps retained, no exclusions/threshold weakening. Restore all original symlinks exactly.
3. node output/playwright/task68-checks/final-local.mjs: final production build and new shared/Calc whole native-stream cases source-absent, no failures, exact links restored.
4. node output/playwright/task68-checks/facades.mjs; python3 output/playwright/task68-checks/audit.py: entire non-executable facade ASTs, whole owner/test selection/current hashes and unchanged map retention, actual native/source/fixture/capability/provenance/internal-operation bindings and file budgets pass.
5. python3 output/playwright/task68-checks/gates.py: inspect all13actual exitCodes and35tooling cases; all type/lint/docs/size/dependencies/provenance/tree/shared+Calc inventory/routing/doctor/diff checks pass, intentional files format clean. Full remains due71 after61.
6. ap task verify-show 202610120914-RXJMXP: exact implementation-bound EVALUATOR pass, final ap verification and clean tracked/untracked state on calc. Whole cell/pointee/document/UI/static/allocator/throwing/physical-ABI/upstream-QA gaps remain explicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task68 code/fixture/inventory commits; re-run whole Calc and related shared source-absent checks. Preserve unchanged prior67 native/coverage evidence and assertions.

## Findings
