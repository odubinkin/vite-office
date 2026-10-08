---
id: "202610081918-67C1X0"
title: "Register and release native row frame format clients through movement and history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T19:33:06.071Z"
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
    body: "Start: implement native row/frame client registration and typed owner movement, destruction after actual row/table deletion, and temporary UI/layout frame cleanup under standing user-approved parity scope."
events:
  -
    type: "status"
    at: "2026-10-08T19:19:30.609Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native row/frame client registration and typed owner movement, destruction after actual row/table deletion, and temporary UI/layout frame cleanup under standing user-approved parity scope."
doc_version: 3
doc_updated_at: "2026-10-08T19:32:57.206Z"
doc_updated_by: "CODER"
description: "Implement native row frame/line format registration and typed change/move hints, eliminate stale row registrations and temporary layout/UI frame leaks; preserve original graph and source-bound targeted verification."
sections:
  Summary: "Implement native row frame format client movement and represented flat-grid lifetime; preserve original document identity and direct native UI behavior."
  Scope: |-
    apps/office/src/sw/inc/hints.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/core/layout/native-row-format-client.test.ts
    apps/office/src/sw/source/core/undo/native-row-format-client-history.test.ts
    apps/office/src/sw/browser/editor/native-row-format-client.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
    apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
  Plan: "Iteration242 implements represented native row format client lifetime: SwRowFrame extends SwClient and registers at the original row frame format; GetFormat/RegisterToFormat/DestroyImpl and direct native frame item queries replace stateless row value reads. Native TableLineFormatChanged and MoveTableLineHint own exact original format/line references. ClaimFrameFormat directly retargets only original row frames matching its line before registering the row; ChgFrameFormat broadcasts the native change hint before moving the line. SaveTable restoration publishes MoveTableLineHint and re-registers rows, with native last-client format disposal. Row and frame cleanup disposes a format only after its final represented client is gone. Actual destructive native row/table node removal ends row registration; ordinary RemoveLine remains a nondestructive array detach because existing native callers retain/reinsert their original owner. Native row measurements and JSX construction explicitly destroy each temporary registered frame in finally; no registry/cache/extra scalar adapter. All649 unaffected old acceptance files remain byte-identical; two old insertion-history cases capture native construction-boundary expected values before destructive Undo instead of dereferencing deleted row owners after Redo. Their expected literals, original/new identity and history assertions remain unchanged; no dead-owner fallback/cache is introduced. add literal registration/typed hints/matching peer/claim/history/deletion/exclusive post-Undo tests and mounted repeated render/measurement/no leaked frames/current row fields tests. Existing316 metadata fields/status/default/evidence prefixes preserved, no new module or promotion. Full frame hierarchy/invalidation/repeated/follow/pooling/UNO/nested/merged/modified-state contracts remain partial. Targeted new/related runtime/build once upstream absent/restored, failed/new-only closures, actual source-bound cumulative all-four100% from241. Last full237,next247; no full242. Standing user goal authorizes safe in-repo implementation; same-agent sequential roles, explicitly non-independent actual-SHA EVALUATOR. No network/global/subagents, AP source/scripts/Python/raw artifacts or DONE mutation."
  Verify Steps: |-
    1. Byte-bind native sw/inc/hints.hxx MoveTableLineHint/TableLineFormatChanged, swtable.cxx1455-1519 row ctor/dtor/Claim/Chg, tabfrm.cxx4639-4770 ctor/DestroyImpl/SwClientNotify, untbl.cxx104/1107-1168 native KillEmpty/NewFrameFormatForLine, actual row deletion source and native frame registration at pin9bc445578031fecf56086729d8e4940c77e14d65; no copied sources/scripts/raw data in AgentPlane.
    2. Fresh literal cases prove original SwRowFrame registration/direct format items, matching line-only claim/frame migration, distinct native change/move hints before row re-registration, peer frames untouched, last-client format disposal/idempotent destruction, repeated attribute Undo/Redo re-registration/complete attributes/original rows-boxes-text-cursor, numeric row deletion/redo registration and exclusive source claim after Undo, complete table deletion cleanup. Mounted actual UI repeat render and layout measurements retain no temporary frame clients and native row updates/history still render literal heights/borders. Model graph and row references remain original.
    3. Baseline649 unaffected old acceptance files entire byte-identical; exactly two old insertion-history cases capture expected row construction values before destructive Undo, preserving all literal attribute/identity/history assertions, no only/skip/todo. Preserve all316 metadata fields/order/status/default/classification/evidence prefixes, no broad parity promotion. Source<1000physical lines.
    4. Six static gates/build plus new and related row/formats/items/history/insert/delete/callback/layout/ODF/mounted/Chromium tests once upstream absent/restored finally. No passing replay within leaf; failed/new-only closures preserve raw threshold exits/skips. No full242, user cadence237 to247.
    5. All-four100% cumulative actual app/inventory counters only by entire identical current source/maps or complete unchanged declaration/body/enclosing branch/all locations from241; no sanitization/clamping/weakening. Unchanged inventory/infra not replayed.
    6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. ProtectedIO4/entire writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA and four reconstructed certificates; meaningful clean tracked close/DONE immutability and parent exact-prefix append702566/hash9356459286ee4c72f5bfe127f7437675f32438e1643e6cf110c322ee455bd8d5. Full goal ACTIVE, full native layout/client hierarchy/pooling/UNO parity remains unverified.
  Verification: "Pending implementation and actual source-bound targeted evidence."
  Rollback Plan: "Revert only the intentional semantic implementation commit if needed, preserving task traceability, all prior DONE tasks, parent prefix, pin/stash and registered IO/recovery/settings deviations."
  Findings: "Previous241 is DONE at actual implementation03809acf8c537da7db76c492b3882fbfd606c5cc, parent checkpoint1165bf65f23c6c27634bc5b8e11d05d7e50cca6e, clean main/direct. Native row formats now shared; SwRowFrame still has no registration, claim/Chg/SaveTable do not move frame clients and destructive row removal leaves row listeners. Temporary frames created in layout measurements and JSX must be destroyed explicitly once registered. Whole native layout tree/frame invalidation/follow/pooling/UNO remains unverified. Standing iterative goal authorizes safe local scope, no network/global/subagents. One read-only guessed browser filename was absent; recomputed parent route, switched to actual file catalog before scope creation. No source/Python/scripts/raw snapshots in AgentPlane."
id_source: "generated"
---
## Summary

Implement native row frame format client movement and represented flat-grid lifetime; preserve original document identity and direct native UI behavior.

## Scope

apps/office/src/sw/inc/hints.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/core/layout/native-row-format-client.test.ts
apps/office/src/sw/source/core/undo/native-row-format-client-history.test.ts
apps/office/src/sw/browser/editor/native-row-format-client.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts

## Plan

Iteration242 implements represented native row format client lifetime: SwRowFrame extends SwClient and registers at the original row frame format; GetFormat/RegisterToFormat/DestroyImpl and direct native frame item queries replace stateless row value reads. Native TableLineFormatChanged and MoveTableLineHint own exact original format/line references. ClaimFrameFormat directly retargets only original row frames matching its line before registering the row; ChgFrameFormat broadcasts the native change hint before moving the line. SaveTable restoration publishes MoveTableLineHint and re-registers rows, with native last-client format disposal. Row and frame cleanup disposes a format only after its final represented client is gone. Actual destructive native row/table node removal ends row registration; ordinary RemoveLine remains a nondestructive array detach because existing native callers retain/reinsert their original owner. Native row measurements and JSX construction explicitly destroy each temporary registered frame in finally; no registry/cache/extra scalar adapter. All649 unaffected old acceptance files remain byte-identical; two old insertion-history cases capture native construction-boundary expected values before destructive Undo instead of dereferencing deleted row owners after Redo. Their expected literals, original/new identity and history assertions remain unchanged; no dead-owner fallback/cache is introduced. add literal registration/typed hints/matching peer/claim/history/deletion/exclusive post-Undo tests and mounted repeated render/measurement/no leaked frames/current row fields tests. Existing316 metadata fields/status/default/evidence prefixes preserved, no new module or promotion. Full frame hierarchy/invalidation/repeated/follow/pooling/UNO/nested/merged/modified-state contracts remain partial. Targeted new/related runtime/build once upstream absent/restored, failed/new-only closures, actual source-bound cumulative all-four100% from241. Last full237,next247; no full242. Standing user goal authorizes safe in-repo implementation; same-agent sequential roles, explicitly non-independent actual-SHA EVALUATOR. No network/global/subagents, AP source/scripts/Python/raw artifacts or DONE mutation.

## Verify Steps

1. Byte-bind native sw/inc/hints.hxx MoveTableLineHint/TableLineFormatChanged, swtable.cxx1455-1519 row ctor/dtor/Claim/Chg, tabfrm.cxx4639-4770 ctor/DestroyImpl/SwClientNotify, untbl.cxx104/1107-1168 native KillEmpty/NewFrameFormatForLine, actual row deletion source and native frame registration at pin9bc445578031fecf56086729d8e4940c77e14d65; no copied sources/scripts/raw data in AgentPlane.
2. Fresh literal cases prove original SwRowFrame registration/direct format items, matching line-only claim/frame migration, distinct native change/move hints before row re-registration, peer frames untouched, last-client format disposal/idempotent destruction, repeated attribute Undo/Redo re-registration/complete attributes/original rows-boxes-text-cursor, numeric row deletion/redo registration and exclusive source claim after Undo, complete table deletion cleanup. Mounted actual UI repeat render and layout measurements retain no temporary frame clients and native row updates/history still render literal heights/borders. Model graph and row references remain original.
3. Baseline649 unaffected old acceptance files entire byte-identical; exactly two old insertion-history cases capture expected row construction values before destructive Undo, preserving all literal attribute/identity/history assertions, no only/skip/todo. Preserve all316 metadata fields/order/status/default/classification/evidence prefixes, no broad parity promotion. Source<1000physical lines.
4. Six static gates/build plus new and related row/formats/items/history/insert/delete/callback/layout/ODF/mounted/Chromium tests once upstream absent/restored finally. No passing replay within leaf; failed/new-only closures preserve raw threshold exits/skips. No full242, user cadence237 to247.
5. All-four100% cumulative actual app/inventory counters only by entire identical current source/maps or complete unchanged declaration/body/enclosing branch/all locations from241; no sanitization/clamping/weakening. Unchanged inventory/infra not replayed.
6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. ProtectedIO4/entire writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA and four reconstructed certificates; meaningful clean tracked close/DONE immutability and parent exact-prefix append702566/hash9356459286ee4c72f5bfe127f7437675f32438e1643e6cf110c322ee455bd8d5. Full goal ACTIVE, full native layout/client hierarchy/pooling/UNO parity remains unverified.

## Verification

Pending implementation and actual source-bound targeted evidence.

## Rollback Plan

Revert only the intentional semantic implementation commit if needed, preserving task traceability, all prior DONE tasks, parent prefix, pin/stash and registered IO/recovery/settings deviations.

## Findings

Previous241 is DONE at actual implementation03809acf8c537da7db76c492b3882fbfd606c5cc, parent checkpoint1165bf65f23c6c27634bc5b8e11d05d7e50cca6e, clean main/direct. Native row formats now shared; SwRowFrame still has no registration, claim/Chg/SaveTable do not move frame clients and destructive row removal leaves row listeners. Temporary frames created in layout measurements and JSX must be destroyed explicitly once registered. Whole native layout tree/frame invalidation/follow/pooling/UNO remains unverified. Standing iterative goal authorizes safe local scope, no network/global/subagents. One read-only guessed browser filename was absent; recomputed parent route, switched to actual file catalog before scope creation. No source/Python/scripts/raw snapshots in AgentPlane.
