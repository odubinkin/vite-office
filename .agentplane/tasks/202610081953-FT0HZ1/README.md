---
id: "202610081953-FT0HZ1"
title: "Own shared native table box formats and preserve their item sets through history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T19:54:15.443Z"
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
    body: "Start: implement original native box format client ownership, direct cell items and indexed native item-set history under the approved standing parity goal; preserve registered deviations and targeted upstream-absent verification cadence."
events:
  -
    type: "status"
    at: "2026-10-08T19:54:15.951Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original native box format client ownership, direct cell items and indexed native item-set history under the approved standing parity goal; preserve registered deviations and targeted upstream-absent verification cadence."
doc_version: 3
doc_updated_at: "2026-10-08T19:54:15.951Z"
doc_updated_by: "CODER"
description: "Remove canonical cell geometry records and core/UI DTO round trips by registering original SwTableBox owners at native document frame formats, direct item publication, native history sharing and destructive client cleanup."
sections:
  Summary: "Iteration243 gives existing native table cells document-owned native box frame formats and original client ownership; removes cell record round trips from core/UI publication and attribute history. Standing user goal authorizes safe local parity implementation."
  Scope: |-
    apps/office/src/sw/inc/swtblfmt.ts
    apps/office/src/sw/inc/hints.ts
    apps/office/src/sw/inc/hintids.ts
    apps/office/src/sw/source/core/layout/atrfrm.ts
    apps/office/src/sw/source/core/attr/swatrset.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/docnode/ndtbl1.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts
    apps/office/src/sw/source/core/table/native-column-insertion.test.ts
    apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
    apps/office/src/sw/source/core/table/native-box-frame-format.test.ts
    apps/office/src/sw/source/core/undo/native-box-frame-format-history.test.ts
    apps/office/src/sw/browser/editor/native-box-frame-format.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration243 replaces canonical per-cell geometry records with document-owned native SwTableBoxFormat/SwFrameFormat/SfxItemSet and original SwTableBox SwClient registration. Exact aTableBoxSetRange/default-frame inheritance, native pool vertical default and frame box/vertical queries support existing borders, size and vertical alignment without reconstructed DTOs. SwTableBox CheckBoxFormat/ClaimFrameFormat preserve native exclusive/shared ownership and exclude direct formula/value attributes on shared claims; concrete calculation/value engines remain unimplemented. ChgFrameFormat uses TableBoxFormatChanged before original box registration; history uses distinct MoveTableBoxHint, independent unique direct item sets/indices and new shared owners. Native insertion shares source box formats; destructive actual row/column/table node removal releases box clients, ordinary RemoveBox remains nondestructive. SetSwTabBorders and vertical attribute publication write native items directly, reuse old-to-new owners within the operation (border nType grouping), preserve peers, one revision/history, and mounted main JSX reads original native cell formats directly. Explicit existing SwTableBoxFormat records remain construction/transport boundary types only to preserve protected codecs; no new translation path or dead-owner fallback. Three old tests change only required constructor calls and expected-box-value captures before native destruction; all other654 prior acceptance assertions/literals/loops intact, untouched files byte-identical. Three fresh files validate ownership/defaults/inheritance/claim/sharing/hints, native full item-set history and deletion, real mounted borders/alignment without GetFormat/SetFormat wrapper publication, preserving original boxes/text/cursor. All316 metadata records/order/status/default/classification/evidence prefixes preserved, bounded append-only notes/no promotion. Full physical SwCellFrame client hierarchy/retargeting, calculations/UNO/nested/merged/pooling/modified-state remain partial. New/related runtime/build once upstream absent/restored finally; failed/new-only closures, no passing replay; all-four100% actual source-bound cumulative counters from242. Last full237,next247,no full243. Standing user goal authorizes safe in-repo work; same-agent sequential roles/non-independent actual-SHA EVALUATOR, no network/global/subagents/AP source/Python/scripts/raw artifacts or DONE mutation."
  Verify Steps: |-
    1. Byte-bind native SwTableBox ctor/dtor/CheckBoxFormat/Claim/Chg/GetTableBox in swtable.cxx2025-2181/2741; swtblfmt.hxx box format; init.cxx aTableBoxSetRange/default109; docfmt.cxx MakeTableBoxFormat; ndtbl1.cxx SetBoxAttr1276/native border nType922; hints.hxx native TableBoxFormatChanged/MoveTableBoxHint and untbl.cxx NewFrameFormatForBox1124/SaveBoxRestore1236 at pinned9bc445578031fecf56086729d8e4940c77e14d65. No copied source/scripts in AgentPlane.
    2. Fresh literal native format registration/exact ranges/default parent/pool queries, independent complete direct items, exclusive/shared claims/peer retention/opaque formula-value exclusion, distinct borrowed native hints before registration and last-client disposal. Real attribute/insertion history preserves original model box/text/cursor and shared complete item sets without DTO GetFormat/SetFormat calls; numeric deletion releases actual old box clients and Redo creates new ones. Real main UI border/alignment/width rendering and command/Undo/Redo use native owners, leave transport calls unused, and retain original text/model graph. Full cell frame hierarchy/calculation/nested/merged/UNO remains partial.
    3. Baseline654 prior acceptance files; exactly three scoped tests may change required native constructor calls and capture original expected box values before destructive Undo only, all prior literal/identity/history assertions preserved. All unaffected files byte-identical; no only/skip/todo.316metadata fields/order/status/default/classification/evidence prefixes preserved, no promotion, sources<1000physical lines.
    4. Six static gates/build and new/related native border/vertical/cell geometry/table insertion/history/mounted/ODF/Chromium cases once physically upstream absent/restored finally. No passing runtime replay within leaf; failed/new-only closures retain partial raw threshold exits/skips. Full243 skipped per user cadence237 to247.
    5. All-four100% cumulative actual app/inventory counters only for whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations from242; no clamping/sanitization/weakened criteria. Unchanged inventory/infra runtime not replayed.
    6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA, reconstructs four certificates byte-identically, clean meaningful close/DONE immutability; parent exact-prefix append706479/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b. Full goal remains ACTIVE.
  Verification: "Pending implementation and the exact targeted checks in Verify Steps; last full237,next247. Runtime/build must execute upstream absent, separate source audits only after restoration. Goal incomplete."
  Rollback Plan: "Revert only this leaf's implementation commit after evidence identifies a regression; retain task traceability and prior immutable DONE leaves. No destructive history, registered I/O/recovery changes, network or outside-repository access."
  Findings: "Preflight main/direct and clean after completed242 actual94ab0a92c04676614e7b869025c17943cfa687ae. Native source inspection finds SwTableBox still owns cloned per-cell value records and publication/history call GetFormat/SetFormat. Native swtable.cxx owns original SwClient/native formats and sharing, docfmt.cxx derives box formats from default frame, ndtbl1.cxx writes native items with operation-local old/new reuse, and untbl.cxx uses indexed direct item sets plus MoveTableBoxHint. Read-only guessed missing column-history path returned exit2; route recomputed and actual file discovered via rg --files. No outside-repo access. Preserve prior654 acceptance literals/assertions,316metadata fields/status/default/classification/order/evidence prefixes and protected IO. Full native cell hierarchy/calculation/pooling/nested/merged/UNO remains unverified. Parent exact prefix706479/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b. No AP source/Python/scripts/raw artifacts or delegation; same-agent sequential roles."
id_source: "generated"
---
## Summary

Iteration243 gives existing native table cells document-owned native box frame formats and original client ownership; removes cell record round trips from core/UI publication and attribute history. Standing user goal authorizes safe local parity implementation.

## Scope

apps/office/src/sw/inc/swtblfmt.ts
apps/office/src/sw/inc/hints.ts
apps/office/src/sw/inc/hintids.ts
apps/office/src/sw/source/core/layout/atrfrm.ts
apps/office/src/sw/source/core/attr/swatrset.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/docnode/ndtbl1.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts
apps/office/src/sw/source/core/table/native-column-insertion.test.ts
apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
apps/office/src/sw/source/core/table/native-box-frame-format.test.ts
apps/office/src/sw/source/core/undo/native-box-frame-format-history.test.ts
apps/office/src/sw/browser/editor/native-box-frame-format.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration243 replaces canonical per-cell geometry records with document-owned native SwTableBoxFormat/SwFrameFormat/SfxItemSet and original SwTableBox SwClient registration. Exact aTableBoxSetRange/default-frame inheritance, native pool vertical default and frame box/vertical queries support existing borders, size and vertical alignment without reconstructed DTOs. SwTableBox CheckBoxFormat/ClaimFrameFormat preserve native exclusive/shared ownership and exclude direct formula/value attributes on shared claims; concrete calculation/value engines remain unimplemented. ChgFrameFormat uses TableBoxFormatChanged before original box registration; history uses distinct MoveTableBoxHint, independent unique direct item sets/indices and new shared owners. Native insertion shares source box formats; destructive actual row/column/table node removal releases box clients, ordinary RemoveBox remains nondestructive. SetSwTabBorders and vertical attribute publication write native items directly, reuse old-to-new owners within the operation (border nType grouping), preserve peers, one revision/history, and mounted main JSX reads original native cell formats directly. Explicit existing SwTableBoxFormat records remain construction/transport boundary types only to preserve protected codecs; no new translation path or dead-owner fallback. Three old tests change only required constructor calls and expected-box-value captures before native destruction; all other654 prior acceptance assertions/literals/loops intact, untouched files byte-identical. Three fresh files validate ownership/defaults/inheritance/claim/sharing/hints, native full item-set history and deletion, real mounted borders/alignment without GetFormat/SetFormat wrapper publication, preserving original boxes/text/cursor. All316 metadata records/order/status/default/classification/evidence prefixes preserved, bounded append-only notes/no promotion. Full physical SwCellFrame client hierarchy/retargeting, calculations/UNO/nested/merged/pooling/modified-state remain partial. New/related runtime/build once upstream absent/restored finally; failed/new-only closures, no passing replay; all-four100% actual source-bound cumulative counters from242. Last full237,next247,no full243. Standing user goal authorizes safe in-repo work; same-agent sequential roles/non-independent actual-SHA EVALUATOR, no network/global/subagents/AP source/Python/scripts/raw artifacts or DONE mutation.

## Verify Steps

1. Byte-bind native SwTableBox ctor/dtor/CheckBoxFormat/Claim/Chg/GetTableBox in swtable.cxx2025-2181/2741; swtblfmt.hxx box format; init.cxx aTableBoxSetRange/default109; docfmt.cxx MakeTableBoxFormat; ndtbl1.cxx SetBoxAttr1276/native border nType922; hints.hxx native TableBoxFormatChanged/MoveTableBoxHint and untbl.cxx NewFrameFormatForBox1124/SaveBoxRestore1236 at pinned9bc445578031fecf56086729d8e4940c77e14d65. No copied source/scripts in AgentPlane.
2. Fresh literal native format registration/exact ranges/default parent/pool queries, independent complete direct items, exclusive/shared claims/peer retention/opaque formula-value exclusion, distinct borrowed native hints before registration and last-client disposal. Real attribute/insertion history preserves original model box/text/cursor and shared complete item sets without DTO GetFormat/SetFormat calls; numeric deletion releases actual old box clients and Redo creates new ones. Real main UI border/alignment/width rendering and command/Undo/Redo use native owners, leave transport calls unused, and retain original text/model graph. Full cell frame hierarchy/calculation/nested/merged/UNO remains partial.
3. Baseline654 prior acceptance files; exactly three scoped tests may change required native constructor calls and capture original expected box values before destructive Undo only, all prior literal/identity/history assertions preserved. All unaffected files byte-identical; no only/skip/todo.316metadata fields/order/status/default/classification/evidence prefixes preserved, no promotion, sources<1000physical lines.
4. Six static gates/build and new/related native border/vertical/cell geometry/table insertion/history/mounted/ODF/Chromium cases once physically upstream absent/restored finally. No passing runtime replay within leaf; failed/new-only closures retain partial raw threshold exits/skips. Full243 skipped per user cadence237 to247.
5. All-four100% cumulative actual app/inventory counters only for whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations from242; no clamping/sanitization/weakened criteria. Unchanged inventory/infra runtime not replayed.
6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA, reconstructs four certificates byte-identically, clean meaningful close/DONE immutability; parent exact-prefix append706479/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b. Full goal remains ACTIVE.

## Verification

Pending implementation and the exact targeted checks in Verify Steps; last full237,next247. Runtime/build must execute upstream absent, separate source audits only after restoration. Goal incomplete.

## Rollback Plan

Revert only this leaf's implementation commit after evidence identifies a regression; retain task traceability and prior immutable DONE leaves. No destructive history, registered I/O/recovery changes, network or outside-repository access.

## Findings

Preflight main/direct and clean after completed242 actual94ab0a92c04676614e7b869025c17943cfa687ae. Native source inspection finds SwTableBox still owns cloned per-cell value records and publication/history call GetFormat/SetFormat. Native swtable.cxx owns original SwClient/native formats and sharing, docfmt.cxx derives box formats from default frame, ndtbl1.cxx writes native items with operation-local old/new reuse, and untbl.cxx uses indexed direct item sets plus MoveTableBoxHint. Read-only guessed missing column-history path returned exit2; route recomputed and actual file discovered via rg --files. No outside-repo access. Preserve prior654 acceptance literals/assertions,316metadata fields/status/default/classification/order/evidence prefixes and protected IO. Full native cell hierarchy/calculation/pooling/nested/merged/UNO remains unverified. Parent exact prefix706479/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b. No AP source/Python/scripts/raw artifacts or delegation; same-agent sequential roles.
