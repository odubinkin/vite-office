---
id: "202610082053-5TDXPQ"
title: "Restore native format attribute delta notifications and inheritance filtering"
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
  updated_at: "2026-10-08T20:54:23.439Z"
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
    body: "Start: native exact format change deltas, locking and inheritance filtering under standing upstream parity goal; preserve660prior tests and actual100coverage, one upstream-absent related runtime profile."
events:
  -
    type: "status"
    at: "2026-10-08T20:54:23.853Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native exact format change deltas, locking and inheritance filtering under standing upstream parity goal; preserve660prior tests and actual100coverage, one upstream-absent related runtime profile."
doc_version: 3
doc_updated_at: "2026-10-08T20:54:23.853Z"
doc_updated_by: "CODER"
description: "Iteration245: replace generic row/cell format attribute notification overrides with native SwAttrSetChg and AttrSetChangeHint through SwModify locking, existing Put_BC/ClearItem_BC, original parent registration and native Differentiate filtering. Preserve original clients, document device notifications and registered I/O deviations. Verify actual original frame notification identity, inheritance, locking/reentrancy and real UI/history without upstream runtime; all prior tests byte-identical and actual100coverage, full cadence237to247."
sections:
  Summary: "Restore source-shaped native format attribute deltas, modify locking and parent filtering for original model/frame clients."
  Scope: |-
    apps/office/src/sw/inc/hints.ts
    apps/office/src/sw/inc/calbck.ts
    apps/office/src/sw/source/core/attr/format.ts
    apps/office/src/sw/inc/swtblfmt.ts
    apps/office/src/svl/source/items/itemset.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/attr/native-format-attribute-notify.test.ts
    apps/office/src/sw/source/core/undo/native-format-attribute-notify-history.test.ts
    apps/office/src/sw/browser/editor/native-format-attribute-notify.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration245 ports native SwAttrSetChg borrowed original/delta ownership and copy semantics, AttrSetChangeHint, ClientNotifyAttrChg and SwModify boolean modify locking. SwFormat SetFormatAttr/SetFormatAttrSet/reset-single-range/reset-all collect exact old/new effective values with existing SwAttrSet Put_BC/ClearItem_BC and notify actual registered format clients before existing document device signals; equal/empty/locked paths do not emit native notifications. Parent formats register actual child SwFormat clients; inherited attribute hints copy only deltas and native Differentiate removes every locally-present WhichId, including invalid/disabled, without copying or replacing original format owners. Row/cell generic attribute overrides are removed; original client/hint identities and full direct item/history owners remain. Native row/cell Claim locks copying before retargeting original frames. Preserve existing I/O/recovery/settings/whole writer-view/pin/stash and all660 prior acceptance files byte-identically. Three fresh files cover borrowed/copy native change sets, precise old/new defaults/direct/inherited/reset deltas, locking and reentrant mutation/exception release, actual parent registration/filtering/transaction, original physical row/cell notification clients, full Undo/Redo and real mounted UI styles. Eleven scoped paths only, all317metadata status/default/classification/order/evidence prefixes retained, bounded notes/no promotion; no new module. Full native cache/font/fill/outline/Sfx/VCL frame invalidation/geometry/content/follows/nested/UNO remains partial. Same current agent sequential roles with explicitly non-independent actual-SHA EVALUATOR, no network/global/subagents/AP copied source/raw evidence. New/related runtime/build once upstream physically absent/restored finally; failed/new/unexecuted-only closures, no passing replay; actual all-four100 source/map/complete unchanged region counters from244. Last full237,next247,no full245. Meaningful clean closure, DONE immutable, parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append; goal ACTIVE."
  Verify Steps: |-
    1. Byte-bind native SwAttrSetChg/AttrSetChangeHint declarations in hints.hxx and implementation in hints.cxx, ClientNotifyAttrChg/SwModify lock dispatch in calbck.cxx/hxx, SwFormat Set/Reset/SwClientNotify inheritance filter in format.cxx, SfxItemSet Differentiate including INVALID/DISABLED in itemset.cxx, row/box locked claims in swtable.cxx. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
    2. Fresh direct tests assert exact original format/client/attribute-set identities and borrowed old/new delta sets; copy constructor only clones deltas. Effective parent/default old/new values, one multi-item delta, equality/empty/no-op and reset-single/range/all/locked semantics, boolean locking/reentrant suppression/exception unlock, actual child parent registration and all locally-present WhichId filtering including INVALID/DISABLED, transaction and inherited broadcast, original linked row/cell frames receive exact native hints. Real original table attribute Undo/Redo and mounted controls/styles retain graph/text/cursor, peer formats and no generic row/cell attribute shim.
    3. All660 prior acceptance files byte-identical; fresh files no only/skip/todo. All317 existing metadata records/status/default/classification/order/prefixes retained, no promotion/new record. Source physical<1000lines and exact11semantic paths.
    4. Six statics/build/exact new and related format/itemset/registration/paragraph/style/table/list/layout/history/mounted/ODF/Chromium runtime once upstream physically absent/restored finally. No passing replay; failed/new/unexecuted-only closures retain partial raw threshold exits/skips. Full245 skipped per explicit user cadence last237,next247.
    5. Actual all-four100 app/inventory coverage reconstructed from244 whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations; no individual clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
    6. Restored source generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Raw scripts/maps/results/source snapshots only ignored app cache; AP bounded English MD/JSON identifiers/hashes/counts. Actual implementation-SHA explicitly non-independent current-agent EVALUATOR reconstructs4certificates byte-identically. Clean meaningful close, DONE immutable; parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append, goal ACTIVE.
  Verification: "Pending implementation and exact new/related upstream-absent runtime; full cadence237to247."
  Rollback Plan: "Revert only this leaf's semantic implementation commit; preserve previous completed leaves, parent exact prefix and registered document I/O deviations."
  Findings: "Previous244 DONE actual8214d309ac4a7a67cee7724f59c20e49d0aef8c5; clean main/direct47b9d5853ab51daa3be1ba5e20172dc344c7025a. Read-only review found base SwFormat emits document-only generic signals and native row/cell formats supply separate generic client overrides; neither conveys native changed-item sets. Existing Put_BC/ClearItem_BC already collect exact native deltas and will be reused. This leaf replaces generic kernel shims with original native typed change sets and inheritance filtering, enabling subsequent frame invalidation work; it does not claim full frame parity. Standing user goal authorizes safe local implementation. No network/global/subagents/source copies/AP raw files."
id_source: "generated"
---
## Summary

Restore source-shaped native format attribute deltas, modify locking and parent filtering for original model/frame clients.

## Scope

apps/office/src/sw/inc/hints.ts
apps/office/src/sw/inc/calbck.ts
apps/office/src/sw/source/core/attr/format.ts
apps/office/src/sw/inc/swtblfmt.ts
apps/office/src/svl/source/items/itemset.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/attr/native-format-attribute-notify.test.ts
apps/office/src/sw/source/core/undo/native-format-attribute-notify-history.test.ts
apps/office/src/sw/browser/editor/native-format-attribute-notify.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration245 ports native SwAttrSetChg borrowed original/delta ownership and copy semantics, AttrSetChangeHint, ClientNotifyAttrChg and SwModify boolean modify locking. SwFormat SetFormatAttr/SetFormatAttrSet/reset-single-range/reset-all collect exact old/new effective values with existing SwAttrSet Put_BC/ClearItem_BC and notify actual registered format clients before existing document device signals; equal/empty/locked paths do not emit native notifications. Parent formats register actual child SwFormat clients; inherited attribute hints copy only deltas and native Differentiate removes every locally-present WhichId, including invalid/disabled, without copying or replacing original format owners. Row/cell generic attribute overrides are removed; original client/hint identities and full direct item/history owners remain. Native row/cell Claim locks copying before retargeting original frames. Preserve existing I/O/recovery/settings/whole writer-view/pin/stash and all660 prior acceptance files byte-identically. Three fresh files cover borrowed/copy native change sets, precise old/new defaults/direct/inherited/reset deltas, locking and reentrant mutation/exception release, actual parent registration/filtering/transaction, original physical row/cell notification clients, full Undo/Redo and real mounted UI styles. Eleven scoped paths only, all317metadata status/default/classification/order/evidence prefixes retained, bounded notes/no promotion; no new module. Full native cache/font/fill/outline/Sfx/VCL frame invalidation/geometry/content/follows/nested/UNO remains partial. Same current agent sequential roles with explicitly non-independent actual-SHA EVALUATOR, no network/global/subagents/AP copied source/raw evidence. New/related runtime/build once upstream physically absent/restored finally; failed/new/unexecuted-only closures, no passing replay; actual all-four100 source/map/complete unchanged region counters from244. Last full237,next247,no full245. Meaningful clean closure, DONE immutable, parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append; goal ACTIVE.

## Verify Steps

1. Byte-bind native SwAttrSetChg/AttrSetChangeHint declarations in hints.hxx and implementation in hints.cxx, ClientNotifyAttrChg/SwModify lock dispatch in calbck.cxx/hxx, SwFormat Set/Reset/SwClientNotify inheritance filter in format.cxx, SfxItemSet Differentiate including INVALID/DISABLED in itemset.cxx, row/box locked claims in swtable.cxx. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
2. Fresh direct tests assert exact original format/client/attribute-set identities and borrowed old/new delta sets; copy constructor only clones deltas. Effective parent/default old/new values, one multi-item delta, equality/empty/no-op and reset-single/range/all/locked semantics, boolean locking/reentrant suppression/exception unlock, actual child parent registration and all locally-present WhichId filtering including INVALID/DISABLED, transaction and inherited broadcast, original linked row/cell frames receive exact native hints. Real original table attribute Undo/Redo and mounted controls/styles retain graph/text/cursor, peer formats and no generic row/cell attribute shim.
3. All660 prior acceptance files byte-identical; fresh files no only/skip/todo. All317 existing metadata records/status/default/classification/order/prefixes retained, no promotion/new record. Source physical<1000lines and exact11semantic paths.
4. Six statics/build/exact new and related format/itemset/registration/paragraph/style/table/list/layout/history/mounted/ODF/Chromium runtime once upstream physically absent/restored finally. No passing replay; failed/new/unexecuted-only closures retain partial raw threshold exits/skips. Full245 skipped per explicit user cadence last237,next247.
5. Actual all-four100 app/inventory coverage reconstructed from244 whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations; no individual clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
6. Restored source generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Raw scripts/maps/results/source snapshots only ignored app cache; AP bounded English MD/JSON identifiers/hashes/counts. Actual implementation-SHA explicitly non-independent current-agent EVALUATOR reconstructs4certificates byte-identically. Clean meaningful close, DONE immutable; parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append, goal ACTIVE.

## Verification

Pending implementation and exact new/related upstream-absent runtime; full cadence237to247.

## Rollback Plan

Revert only this leaf's semantic implementation commit; preserve previous completed leaves, parent exact prefix and registered document I/O deviations.

## Findings

Previous244 DONE actual8214d309ac4a7a67cee7724f59c20e49d0aef8c5; clean main/direct47b9d5853ab51daa3be1ba5e20172dc344c7025a. Read-only review found base SwFormat emits document-only generic signals and native row/cell formats supply separate generic client overrides; neither conveys native changed-item sets. Existing Put_BC/ClearItem_BC already collect exact native deltas and will be reused. This leaf replaces generic kernel shims with original native typed change sets and inheritance filtering, enabling subsequent frame invalidation work; it does not claim full frame parity. Standing user goal authorizes safe local implementation. No network/global/subagents/source copies/AP raw files.
