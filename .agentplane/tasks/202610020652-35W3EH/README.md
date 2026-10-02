---
id: "202610020652-35W3EH"
title: "Restore source-owned sorted number-tree child storage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T06:54:04.257Z"
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
    body: "Start: restore source-owned sorted unique number-tree child container and transfer semantics under continuing user goal authorization, preserving registered IO/recovery deviations and prohibiting helper/source artifacts."
events:
  -
    type: "status"
    at: "2026-10-02T06:54:04.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned sorted unique number-tree child container and transfer semantics under continuing user goal authorization, preserving registered IO/recovery deviations and prohibiting helper/source artifacts."
doc_version: 3
doc_updated_at: "2026-10-02T06:54:04.974Z"
doc_updated_by: "CODER"
description: "Iteration56 replaces raw child arrays and push-based merges with the used native o3tl sorted_vector operations, preserving Writer ordering/equivalence/cache/ownership sequencing. Add mapped generic container and exact module classification, owned merge/type tests, adapt existing diagnostic snapshots without changing expected values; no upstream invocation in tests or source/helper artifacts."
sections:
  Summary: "Iteration56 restores source-owned sorted unique child-container architecture and insertion/merge semantics for existing Writer number trees. Pin9bc445578031fecf56086729d8e4940c77e14d65; full goal remains active."
  Scope: "Nineteen semantic paths: new apps/office/src/o3tl/inc/sorted_vector.ts and sorted_vector.test.ts; SwNumberTree/SwNumberTree.ts and SwNodeNum.ts; existing SwNumberTree-policy/lifecycle/vector/phantoms/removal/contract/children.test.ts plus txtnode/node-numbering-lifecycle.test.ts and doc/list.test.ts (9diagnostic suites); new SwNumberTree-container.test.ts; scripts/check-module-boundaries.mjs and its test; scripts/check-lo-source-tree.mjs; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. Active leaf/parent artifacts only. No dependency/policy/coverage/IO/recovery changes. Module gate explicitly classifies new native o3tl owner with only sw->o3tl edge and browser protection, no weakened checks."
  Plan: "Implement the used sorted_vector subset in its o3tl/inc owner: private vector and injected comparator, size/empty/index/front/back/iteration, lower/upper binary bounds, comparator-equivalent find/single insert, positional erase/clear and bulk sorted union retaining destination identity on equivalent keys. Port every core child-container operation away from mutable arrays and push/splice/findIndex/indexOf emulation; use container insert for phantom/direct child/suffix movement, bulk insert for MoveChildren, clear without replacing protected container identity. Preserve node policy/counting/restart/start/notification control flow, cache and parent sequencing, existing -1 GetIterator diagnostic translation and all old expected values. Adapt9old diagnostic suites to test-only iterable snapshots; no array facade or public child proxy. Add owned container identity/order/bounds/union and direct real document-tree transfer/duplicate/phantom/raw-cache tests, baseline red for current push-based merges. Register precise native o3tl classification/path/provenance and only bounded affected tree evidence, no module/status/default/deviation promotion. Fresh manual source hashes only, no upstream calls in tests or saved helper/source bodies. Focused tests with reference unavailable/restored and unchanged full verify; same-actor review on actual implementation HEAD, clean leaf close."
  Verify Steps: |-
    1. Fresh pinned sorted_vector/find_unique/single insertion/bulk set-union and native tree declaration/insert/move bodies audited manually with file/symbol hashes only. Baseline owned tree tests expose current transfer order/equivalence or container identity mismatch. No fresh compiled native or whole-header/lifetime certification, no helper/source bodies in Agentplane.
    2. Owned generic tests cover comparator-only key equality, bound edges, sorted unique insertion with stable identity, miss/end, iteration, empty/nonempty/self bulk union retaining destination equal key, erase/clear and container reuse. New tree tests cover retained container type/identity, actual document records through direct merge/suffix move and phantom recursion, old expected matrices/notifications/registries/defaults unchanged across9adapted suites. Exact native used ownership and comparator semantics, no public array compatibility layer.
    3. Focused alltree/o3tl/list/lifecycle/classification and gate tests pass without reference and restore pin; full unchanged npm run verify passes every gate and100%coverage. Existing module gate expectations preserved, new o3tl classification and only sw edge plus browser rejection tested; new native required path present. Exact19semantic paths,2existing metadata rows plus1new container row permanifest, reference pin/hash integrity, no source/helper artifacts, routing/diff/doctor without new errors.
    4. Canonical verification and distinct same-actor EVALUATOR on actual semantic implementation SHA, leaf DONE and checkout clean. Parent/full goal active, partial-order policy/initializer-list/copy/native iterator/const/lifetime and broader tree API/document/range/redline/UI obligations explicitly unverified.
  Verification: "Pending."
  Rollback Plan: "Revert only this leaf actual semantic commit if requested, restoring its preceding container implementation without forbidden source/helper artifacts or changing the reference pin."
  Findings: "Previous iteration55 is PROGRESS, not completion. Fresh upstream SwNumberTree.hxx uses o3tl::sorted_vector (earlier std::set was probe adapter wording). Native MoveGreaterChildren uses unique sorted single insert and MoveChildren uses bulk union; current local push bypasses both. This leaf replaces the emulation with native-owned used container operations, rather than retaining an array facade or adding a tree-local merge patch. Native missing iterator adapted to index-1 for prior diagnostic contract; unimplemented header overloads/copy/const/lifetime remain explicit."
id_source: "generated"
---
## Summary

Iteration56 restores source-owned sorted unique child-container architecture and insertion/merge semantics for existing Writer number trees. Pin9bc445578031fecf56086729d8e4940c77e14d65; full goal remains active.

## Scope

Nineteen semantic paths: new apps/office/src/o3tl/inc/sorted_vector.ts and sorted_vector.test.ts; SwNumberTree/SwNumberTree.ts and SwNodeNum.ts; existing SwNumberTree-policy/lifecycle/vector/phantoms/removal/contract/children.test.ts plus txtnode/node-numbering-lifecycle.test.ts and doc/list.test.ts (9diagnostic suites); new SwNumberTree-container.test.ts; scripts/check-module-boundaries.mjs and its test; scripts/check-lo-source-tree.mjs; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. Active leaf/parent artifacts only. No dependency/policy/coverage/IO/recovery changes. Module gate explicitly classifies new native o3tl owner with only sw->o3tl edge and browser protection, no weakened checks.

## Plan

Implement the used sorted_vector subset in its o3tl/inc owner: private vector and injected comparator, size/empty/index/front/back/iteration, lower/upper binary bounds, comparator-equivalent find/single insert, positional erase/clear and bulk sorted union retaining destination identity on equivalent keys. Port every core child-container operation away from mutable arrays and push/splice/findIndex/indexOf emulation; use container insert for phantom/direct child/suffix movement, bulk insert for MoveChildren, clear without replacing protected container identity. Preserve node policy/counting/restart/start/notification control flow, cache and parent sequencing, existing -1 GetIterator diagnostic translation and all old expected values. Adapt9old diagnostic suites to test-only iterable snapshots; no array facade or public child proxy. Add owned container identity/order/bounds/union and direct real document-tree transfer/duplicate/phantom/raw-cache tests, baseline red for current push-based merges. Register precise native o3tl classification/path/provenance and only bounded affected tree evidence, no module/status/default/deviation promotion. Fresh manual source hashes only, no upstream calls in tests or saved helper/source bodies. Focused tests with reference unavailable/restored and unchanged full verify; same-actor review on actual implementation HEAD, clean leaf close.

## Verify Steps

1. Fresh pinned sorted_vector/find_unique/single insertion/bulk set-union and native tree declaration/insert/move bodies audited manually with file/symbol hashes only. Baseline owned tree tests expose current transfer order/equivalence or container identity mismatch. No fresh compiled native or whole-header/lifetime certification, no helper/source bodies in Agentplane.
2. Owned generic tests cover comparator-only key equality, bound edges, sorted unique insertion with stable identity, miss/end, iteration, empty/nonempty/self bulk union retaining destination equal key, erase/clear and container reuse. New tree tests cover retained container type/identity, actual document records through direct merge/suffix move and phantom recursion, old expected matrices/notifications/registries/defaults unchanged across9adapted suites. Exact native used ownership and comparator semantics, no public array compatibility layer.
3. Focused alltree/o3tl/list/lifecycle/classification and gate tests pass without reference and restore pin; full unchanged npm run verify passes every gate and100%coverage. Existing module gate expectations preserved, new o3tl classification and only sw edge plus browser rejection tested; new native required path present. Exact19semantic paths,2existing metadata rows plus1new container row permanifest, reference pin/hash integrity, no source/helper artifacts, routing/diff/doctor without new errors.
4. Canonical verification and distinct same-actor EVALUATOR on actual semantic implementation SHA, leaf DONE and checkout clean. Parent/full goal active, partial-order policy/initializer-list/copy/native iterator/const/lifetime and broader tree API/document/range/redline/UI obligations explicitly unverified.

## Verification

Pending.

## Rollback Plan

Revert only this leaf actual semantic commit if requested, restoring its preceding container implementation without forbidden source/helper artifacts or changing the reference pin.

## Findings

Previous iteration55 is PROGRESS, not completion. Fresh upstream SwNumberTree.hxx uses o3tl::sorted_vector (earlier std::set was probe adapter wording). Native MoveGreaterChildren uses unique sorted single insert and MoveChildren uses bulk union; current local push bypasses both. This leaf replaces the emulation with native-owned used container operations, rather than retaining an array facade or adding a tree-local merge patch. Native missing iterator adapted to index-1 for prior diagnostic contract; unimplemented header overloads/copy/const/lifetime remain explicit.
