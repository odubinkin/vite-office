---
id: "202609301617-7M8MJP"
title: "Unify SfxItemSet value and state storage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T16:18:11.299Z"
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
    body: "Start: replace the temporary dual-map item state representation with the pinned single-map architecture and preserve all established contracts."
events:
  -
    type: "status"
    at: "2026-09-30T16:18:11.988Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace the temporary dual-map item state representation with the pinned single-map architecture and preserve all established contracts."
doc_version: 3
doc_updated_at: "2026-09-30T16:18:11.988Z"
doc_updated_by: "CODER"
description: "One architecture refactor under approved iterative parity work: replace separate item/state maps with native-style PoolItemMap entries using distinct poolitem-owned INVALID and DISABLED sentinels, preserving observable contracts."
sections:
  Summary: |-
    Unify SfxItemSet value and state storage

    One architecture refactor under approved iterative parity work: replace separate item/state maps with native-style PoolItemMap entries using distinct poolitem-owned INVALID and DISABLED sentinels, preserving observable contracts.
  Scope: "apps/office/src/svl/source/items/itemset.ts, poolitem.ts and itemset.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Replace temporary dual-map representation with one native-style map and distinct sentinels while preserving all previously verified behavior and intentional browser persistence decisions."
  Plan: "CODER performs one SfxItemSet storage architecture refactor. Only itemset.ts, poolitem.ts, itemset.test.ts and provenance/runtime inventory data are changed. Replace items plus itemStates with one poolItemMap mapping WhichIds to ordinary SfxPoolItem or the unique INVALID_POOL_ITEM/DISABLED_POOL_ITEM. Add the distinct native InvalidItem singleton and IsInvalidItem in poolitem.ts. Align state transitions with DisableOrInvalidateItem_ForWhichID; read states by pointer identity, preserve DEFAULT/inherited lookup and disabled Get identity, keep SET-only sorted browser entries, and copy state entries without calling null sentinel Clone. Put must filter sentinel equality before ordinary value comparison; PutSet default/false return and disabled filtering, Count, Clear, Clone and Writer CloneAsValue stay consistent with pinned sources. Add bounded sentinel and mixed-state transition/copy regression assertions, reuse existing comprehensive contracts. Verify architecture by source/AST inspection, focused tests, full npm run verify at 100%, doctor/routing, review and clean close. No validators/schemas/generators, unsupported native APIs, network, or conscious product deviations."
  Verify Steps: "1. Inspect final class fields against pinned itemset.hxx/cxx: exactly one item map stores ordinary and INVALID/DISABLED item pointers; no itemStates map or compatibility layer remains. 2. Focused itemset/Writer attribute/codec tests prove distinct invalid/disabled identity, null clone/no value behavior, ordinary values replacing each state, idempotent transitions/counts, inherited states/defaults, source-style PutSet flags and return, complete same-pool state clones, SET-only cross-pool clones, and sorted SET-only browser snapshots. 3. npm run verify passes all required gates at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is scoped and final git status is clean."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Unify SfxItemSet value and state storage

One architecture refactor under approved iterative parity work: replace separate item/state maps with native-style PoolItemMap entries using distinct poolitem-owned INVALID and DISABLED sentinels, preserving observable contracts.

## Scope

apps/office/src/svl/source/items/itemset.ts, poolitem.ts and itemset.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Replace temporary dual-map representation with one native-style map and distinct sentinels while preserving all previously verified behavior and intentional browser persistence decisions.

## Plan

CODER performs one SfxItemSet storage architecture refactor. Only itemset.ts, poolitem.ts, itemset.test.ts and provenance/runtime inventory data are changed. Replace items plus itemStates with one poolItemMap mapping WhichIds to ordinary SfxPoolItem or the unique INVALID_POOL_ITEM/DISABLED_POOL_ITEM. Add the distinct native InvalidItem singleton and IsInvalidItem in poolitem.ts. Align state transitions with DisableOrInvalidateItem_ForWhichID; read states by pointer identity, preserve DEFAULT/inherited lookup and disabled Get identity, keep SET-only sorted browser entries, and copy state entries without calling null sentinel Clone. Put must filter sentinel equality before ordinary value comparison; PutSet default/false return and disabled filtering, Count, Clear, Clone and Writer CloneAsValue stay consistent with pinned sources. Add bounded sentinel and mixed-state transition/copy regression assertions, reuse existing comprehensive contracts. Verify architecture by source/AST inspection, focused tests, full npm run verify at 100%, doctor/routing, review and clean close. No validators/schemas/generators, unsupported native APIs, network, or conscious product deviations.

## Verify Steps

1. Inspect final class fields against pinned itemset.hxx/cxx: exactly one item map stores ordinary and INVALID/DISABLED item pointers; no itemStates map or compatibility layer remains. 2. Focused itemset/Writer attribute/codec tests prove distinct invalid/disabled identity, null clone/no value behavior, ordinary values replacing each state, idempotent transitions/counts, inherited states/defaults, source-style PutSet flags and return, complete same-pool state clones, SET-only cross-pool clones, and sorted SET-only browser snapshots. 3. npm run verify passes all required gates at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is scoped and final git status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
