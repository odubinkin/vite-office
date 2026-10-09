---
id: "202610091947-WGQ894"
title: "Move native table width ownership and reactions to original frame items"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T19:49:11.645Z"
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
    body: "Start: Move native table width to original frame item/client notifications and verify true history, layout and lifetime without scalar width adapter, correction4/10."
events:
  -
    type: "status"
    at: "2026-10-09T19:49:12.518Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Move native table width to original frame item/client notifications and verify true history, layout and lifetime without scalar width adapter, correction4/10."
doc_version: 3
doc_updated_at: "2026-10-09T19:49:12.518Z"
doc_updated_by: "CODER"
description: "Correction4/10 after fullSZKQTN and B575XR. Remove mirrored table width and direct SetFormat width-scaling adapter. SwTable registers as original native SwClient, consumes actual frame-size hints with native modify lock, separator changes avoid double scaling, item-set history restores complete original table frame attrs without replay adapters. Native layout/normalization read effective original width; release client during table deletion. Preserve registered IO/recovery/settings deviations and existing unrepresented flat-builder missing-size boundary, no full-native-layout claims."
sections:
  Summary: "Correction4/10: Original table frame RES_FRM_SIZE owns width, and SwTable is its native SwClient. Replace scalar width and direct SetFormat scaling with native old/new frame-size hint reactions, paired table modify lock for separator operations, exact native attribute history and original width consumers. Preserve current direct UI and document/history behavior, registered IO/recovery/settings deviations and separately incomplete native layout/copy/Repeat families."
  Scope: "Production apps/office/src/sw/source/core/{table/swtable.ts,undo/untbl.ts,layout/tabfrm.ts,docnode/ndtbl.ts,docnode/nodes.ts}; three fresh native-table-frame-item-owner/history tests in core/table,core/undo,browser/editor. Only exact source-backed old width/native-frame lifetime fixture expectations may migrate if required; retain every other old assertion. Ten corresponding canonical runtime/provenance history records and append-only parentC9TN6M metadata. No network, globals, upstream-source/Python/helper/script/raw map/log artifacts in AgentPlane, merges/publication or registered deviations changes."
  Plan: "1. Capture local source/test/canonical/parent baselines in ignored cache. Move width to original SwFrameFormat item and register original SwTable client. Native attr/legacy size hints and matching-source death handling, paired table modify lock and no double scaling. 2. Native SaveTable retains whole table frame SfxItemSet, restores direct items without width setter replay and invalidates original table frames; scalar geometry remains only separately unported spacing/orientation boundary. Release original client on deletion. Existing layout/normalization reads effective native width; missing-size flat-builder fallback explicitly remains unverified. 3. Add fresh actual original-graph direct/effective/default/borrowed/lock/death/history/mounted cases, three true UndoRedo cycles and original cell text/list/cursor ownership; source-backed old expectations only. 4. Fresh/related plus meaningful remaining closure physically upstream-absent, final current-source whole five-file Istanbul100all-four/zero-negative/identical complete maps and hashes; no prior task/source counters or relaxed thresholds. 5. Preserve ten canonical prefixes/status/default/classification, run TS7/format/lint/deps/docs/file-size/current build/smoke and relevant7Writer browser scenarios absent, then restored9metadata/preservation. Bounded English evidence/APverification/semantic commit, same-agent explicitly non-independent evaluated-sha quality, canonical concrete-result finish, clean both status modes/ref restored. Full not due4/10 afterSZKQTN; broad goal ACTIVE/incomplete."
  Verify Steps: "1. Inspect pinned swtable.cxx324..371 original SwTable::SwClientNotify old/new RES_FRM_SIZE and modify lock; SetTabCols835..928 suppresses general scaling while writing complete original size and resets width percent. swtable.hxx188..189 paired lock, native SwClient registration/death/destructor; SaveTable887..910/937..975 owns whole direct table frame set and raw restore with original table-frame invalidation. Direct/batched/legacy/effective sizes scale original independent boxes once, preserve borrowed source items, ignore absent/wrong/locked hints and react after unlock; original registration/deletion lifetime. Fresh actual history restores complete113state and independently changed count, three native cycles with original table/row/box/frame/node/cursor/text/list ownership. 2. Real mounted workbench observes original direct/effective frame width, original cell sizing and native table command history, real ODT width reopening; deliberately stale transport width cannot choose native layout. No synthetic unused native copies/follows/Repeat. 3. Fresh plus related native table/format/undo/node/list consumers and meaningful uncovered constructor/branch closure upstream physically unavailable with finally restoration; ENTIRE final current five changed production files actual Istanbul lines/statements/functions/branches100,zero-negative,current-source complete-map/hash identity/no prior counters, old tests byte-identical or exact approved source-backed migrations. 4. format/lint/typecheck TS7,deps/docs/file-size,npm build followed by smoke and selected writer-table-headlines/native-table-text-flow-headline/table-properties-history7 browser cases pass upstream-absent. Restore then registry-build/source-tree/provenance/registry-check/resource--check/invariants/parity/routing/doctor and canonical/parent/old-test preservation pass. 5. Bounded English identities/counts/commands/hashes only; APverify, semantic commit, same-agent non-independent pass evaluated_sha-bound quality, canonical finish and clean tracked/untracked/ref restored. Full not due4/10; no module or broad-goal promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert native width client/item ownership plus associated history/layout/lifetime changes and appended canonical histories together, retain evidence and revalidate affected absent consumers; no destructive history or publication."
  Findings: "Previous turn is verified progress: B575XR DONE semanticfe172471e03ebfc613455a574f4e1543a30f6ec1, close2f1db507958a, tree clean. Current SwTable keeps mirrored scalar width and directly calls AdjustWidths, while native source registers SwTable as frame client and reacts to RES_FRM_SIZE hints. Original table frame direct size edits are consequently ignored by core widths/layout. Historical X6VV8G is old rework, not confirmed live; no wait or duplicate runner. Standing iterative user goal authorizes this bounded atomic ownership/refactor scope. Missing-size flat builders, full native orientation/spacing/table frame type/copy/Repeat/master/follow/layout remain unverified separately."
id_source: "generated"
---
## Summary

Correction4/10: Original table frame RES_FRM_SIZE owns width, and SwTable is its native SwClient. Replace scalar width and direct SetFormat scaling with native old/new frame-size hint reactions, paired table modify lock for separator operations, exact native attribute history and original width consumers. Preserve current direct UI and document/history behavior, registered IO/recovery/settings deviations and separately incomplete native layout/copy/Repeat families.

## Scope

Production apps/office/src/sw/source/core/{table/swtable.ts,undo/untbl.ts,layout/tabfrm.ts,docnode/ndtbl.ts,docnode/nodes.ts}; three fresh native-table-frame-item-owner/history tests in core/table,core/undo,browser/editor. Only exact source-backed old width/native-frame lifetime fixture expectations may migrate if required; retain every other old assertion. Ten corresponding canonical runtime/provenance history records and append-only parentC9TN6M metadata. No network, globals, upstream-source/Python/helper/script/raw map/log artifacts in AgentPlane, merges/publication or registered deviations changes.

## Plan

1. Capture local source/test/canonical/parent baselines in ignored cache. Move width to original SwFrameFormat item and register original SwTable client. Native attr/legacy size hints and matching-source death handling, paired table modify lock and no double scaling. 2. Native SaveTable retains whole table frame SfxItemSet, restores direct items without width setter replay and invalidates original table frames; scalar geometry remains only separately unported spacing/orientation boundary. Release original client on deletion. Existing layout/normalization reads effective native width; missing-size flat-builder fallback explicitly remains unverified. 3. Add fresh actual original-graph direct/effective/default/borrowed/lock/death/history/mounted cases, three true UndoRedo cycles and original cell text/list/cursor ownership; source-backed old expectations only. 4. Fresh/related plus meaningful remaining closure physically upstream-absent, final current-source whole five-file Istanbul100all-four/zero-negative/identical complete maps and hashes; no prior task/source counters or relaxed thresholds. 5. Preserve ten canonical prefixes/status/default/classification, run TS7/format/lint/deps/docs/file-size/current build/smoke and relevant7Writer browser scenarios absent, then restored9metadata/preservation. Bounded English evidence/APverification/semantic commit, same-agent explicitly non-independent evaluated-sha quality, canonical concrete-result finish, clean both status modes/ref restored. Full not due4/10 afterSZKQTN; broad goal ACTIVE/incomplete.

## Verify Steps

1. Inspect pinned swtable.cxx324..371 original SwTable::SwClientNotify old/new RES_FRM_SIZE and modify lock; SetTabCols835..928 suppresses general scaling while writing complete original size and resets width percent. swtable.hxx188..189 paired lock, native SwClient registration/death/destructor; SaveTable887..910/937..975 owns whole direct table frame set and raw restore with original table-frame invalidation. Direct/batched/legacy/effective sizes scale original independent boxes once, preserve borrowed source items, ignore absent/wrong/locked hints and react after unlock; original registration/deletion lifetime. Fresh actual history restores complete113state and independently changed count, three native cycles with original table/row/box/frame/node/cursor/text/list ownership. 2. Real mounted workbench observes original direct/effective frame width, original cell sizing and native table command history, real ODT width reopening; deliberately stale transport width cannot choose native layout. No synthetic unused native copies/follows/Repeat. 3. Fresh plus related native table/format/undo/node/list consumers and meaningful uncovered constructor/branch closure upstream physically unavailable with finally restoration; ENTIRE final current five changed production files actual Istanbul lines/statements/functions/branches100,zero-negative,current-source complete-map/hash identity/no prior counters, old tests byte-identical or exact approved source-backed migrations. 4. format/lint/typecheck TS7,deps/docs/file-size,npm build followed by smoke and selected writer-table-headlines/native-table-text-flow-headline/table-properties-history7 browser cases pass upstream-absent. Restore then registry-build/source-tree/provenance/registry-check/resource--check/invariants/parity/routing/doctor and canonical/parent/old-test preservation pass. 5. Bounded English identities/counts/commands/hashes only; APverify, semantic commit, same-agent non-independent pass evaluated_sha-bound quality, canonical finish and clean tracked/untracked/ref restored. Full not due4/10; no module or broad-goal promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert native width client/item ownership plus associated history/layout/lifetime changes and appended canonical histories together, retain evidence and revalidate affected absent consumers; no destructive history or publication.

## Findings

Previous turn is verified progress: B575XR DONE semanticfe172471e03ebfc613455a574f4e1543a30f6ec1, close2f1db507958a, tree clean. Current SwTable keeps mirrored scalar width and directly calls AdjustWidths, while native source registers SwTable as frame client and reacts to RES_FRM_SIZE hints. Original table frame direct size edits are consequently ignored by core widths/layout. Historical X6VV8G is old rework, not confirmed live; no wait or duplicate runner. Standing iterative user goal authorizes this bounded atomic ownership/refactor scope. Missing-size flat builders, full native orientation/spacing/table frame type/copy/Repeat/master/follow/layout remain unverified separately.
