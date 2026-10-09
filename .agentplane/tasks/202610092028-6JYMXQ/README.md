---
id: "202610092028-6JYMXQ"
title: "Own table upper and lower spacing in original native frame items"
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
  updated_at: "2026-10-09T20:29:08.040Z"
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
    body: "Start: move original table upper/lower spacing ownership into native frame item and remove scalar conversion for native property ItemSet. Preserve registered deviations, verify entire changed files with upstream absent, full not due5/10."
events:
  -
    type: "status"
    at: "2026-10-09T20:29:08.997Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: move original table upper/lower spacing ownership into native frame item and remove scalar conversion for native property ItemSet. Preserve registered deviations, verify entire changed files with upstream absent, full not due5/10."
doc_version: 3
doc_updated_at: "2026-10-09T20:29:08.997Z"
doc_updated_by: "CODER"
description: "Remove mirrored table marginTop/marginBottom storage and native spacing ItemSet-to-scalar conversion. Original RES_UL_SPACE owns direct/effective spacing for layout, shell/dialog and mounted UI with complete native history. Preserve registered deviations, canonical histories and exact source-backed old fixtures; final changed-file Istanbul100 and upstream-absent related verification."
sections:
  Summary: "Correction5/10 after full baseline SZKQTN: original RES_UL_SPACE owns upper/lower table spacing. Remove mirrored scalar storage and spacing ItemSet-to-scalar conversion; actual native owners drive layout and mounted UI."
  Scope: "Eight production modules: sw/source/core/attr/format.ts, sw/source/core/table/swtable.ts, sw/source/core/undo/untbl.ts, sw/source/core/layout/newfrm.ts, sw/browser/editor/WriterEditableTable.tsx, sw/source/ui/table/tabledlg.ts, sw/source/uibase/shells/tabsh.ts, sw/source/core/frmedt/fetab.ts. Three fresh acceptance files: sw/source/core/table/native-table-ulspace-items.test.ts, sw/source/core/undo/native-table-ulspace-history.test.ts, sw/browser/editor/native-table-ulspace-items.test.tsx. Sixteen existing canonical runtime/provenance histories and parent Findings append only; exact source-backed stale default/direct-projection/input ItemSet fixture migrations permitted while preserving every other old assertion. No new native copies/adapters. Registered recovery/open/save/settings deviations unchanged. Existing scalar orientation/LR and generalized document attribute history remain separate unverified boundaries."
  Plan: "1. Read pinned original SwFormat GetULSpace, native table/dialog ItemSet ownership and source table UL delta/layout contracts. 2. Native getter in SwFormat; store UL item in original table format and project direct scalars only for builder/transport; SaveTable excludes mirrored UL fields because complete table item set is authoritative. 3. Existing SetTableAttr admits native SfxItemSet without scalar replay; existing original history retained. Table properties clone original native UL item into shell input and apply native output directly. Native page flow, dialog capture and mounted table margins use effective original item. 4. Fresh direct/parent/pool/borrowed/context/native-history/real-mounted/input/reset/ODT assertions and related full-file Istanbul100 all-four upstream-absent. 5. Statics TS7, actual current build/smoke7browser absent, restored9metadata/preservation; bounded evidence/APverify/semantic/exact-SHA same-agent non-independent quality/finish/clean."
  Verify Steps: "1. Pinned sw/inc/format.hxx GetULSpace; sw/source/uibase/shells/tabsh.cxx145..160 copies effective complete UL item, lcl_SetAttr/native SetTableAttr route; tabledlg.cxx393..415/568..579 owns changed-only item output/saved margins; fetab.cxx2363..2377 native ItemSet applied on original frame. tabfrm.cxx4209 source UL flags/forwarding already implemented; row-only browser page flow remains bounded and must read original effective UL. 2. Fresh actual original items: direct/inherited/pool0/reset, independent borrowed copies and represented context flag; no scalar storage or stale projection selection. Native SfxItemSet property application retains complete UL without calling scalar SetFormat; actual original SwUndoAttrTable three cycles retain graph/text/list/cursor/native client identities. Mounted direct and inherited spacing updates, native dialog saved/reset/changed-only semantics, page-budget moves and real ODT values. 3. Fresh+related affected tests only with upstream physically absent/finally restored; ENTIRE eight final changed production files actual Istanbul100 lines/statements/functions/branches/zero-negative, exact current complete-map/source-hash identity, no old-task or pre-change counters/maps. Old tests byte-identical except precise approved source-backed fixture migrations. 4. Upstream-absent format/lint/typecheck TS7,deps/docs/file-size,current build followed by smoke and selected table properties history/repeated headline/native Text Flow7 browser cases. Restored registry-build/source-tree/provenance/registry-check/resources--check/invariants/parity/routing/doctor,16canonical/parent/old-test preservation. 5. Bounded English identities/counts/exact commands/hashes only; no upstream sources/helpers/raw maps/logs in AgentPlane. Commit only task paths; semantic hash/quality PASS evaluated_sha bound and explicitly same-agent non-independent; refreshed blueprint verification persisted before canonical finish and clean tracked/untracked/reference. No full due5/10. No whole-module/goal promotion or native full spacing/layout/Doc SetAttr/copy/Repeat claim."
  Verification: "Pending approved implementation and final-source upstream-absent verification."
  Rollback Plan: "Revert only this task semantic commit and its evidence/inventory append, retaining historical canonical prefixes and earlier native frame-item correction. Restore ignored reference symlink in finally after each absent verification run."
  Findings: "Standing iterative goal approval authorizes this safe in-scope native table spacing correction. Previous goal turn WGQ894 made authoritative verified progress. No live runner is required; current CODER owns local implementation. Full baseline SZKQTN, correction5/10; broad goal ACTIVE/incomplete. No network/global files/merges/publication/delegated agents. Full native SvxULSpace proportional setters/UNO members, generic Doc SetAttr/layout linkage/copy/Repeat remain separately incomplete."
id_source: "generated"
---
## Summary

Correction5/10 after full baseline SZKQTN: original RES_UL_SPACE owns upper/lower table spacing. Remove mirrored scalar storage and spacing ItemSet-to-scalar conversion; actual native owners drive layout and mounted UI.

## Scope

Eight production modules: sw/source/core/attr/format.ts, sw/source/core/table/swtable.ts, sw/source/core/undo/untbl.ts, sw/source/core/layout/newfrm.ts, sw/browser/editor/WriterEditableTable.tsx, sw/source/ui/table/tabledlg.ts, sw/source/uibase/shells/tabsh.ts, sw/source/core/frmedt/fetab.ts. Three fresh acceptance files: sw/source/core/table/native-table-ulspace-items.test.ts, sw/source/core/undo/native-table-ulspace-history.test.ts, sw/browser/editor/native-table-ulspace-items.test.tsx. Sixteen existing canonical runtime/provenance histories and parent Findings append only; exact source-backed stale default/direct-projection/input ItemSet fixture migrations permitted while preserving every other old assertion. No new native copies/adapters. Registered recovery/open/save/settings deviations unchanged. Existing scalar orientation/LR and generalized document attribute history remain separate unverified boundaries.

## Plan

1. Read pinned original SwFormat GetULSpace, native table/dialog ItemSet ownership and source table UL delta/layout contracts. 2. Native getter in SwFormat; store UL item in original table format and project direct scalars only for builder/transport; SaveTable excludes mirrored UL fields because complete table item set is authoritative. 3. Existing SetTableAttr admits native SfxItemSet without scalar replay; existing original history retained. Table properties clone original native UL item into shell input and apply native output directly. Native page flow, dialog capture and mounted table margins use effective original item. 4. Fresh direct/parent/pool/borrowed/context/native-history/real-mounted/input/reset/ODT assertions and related full-file Istanbul100 all-four upstream-absent. 5. Statics TS7, actual current build/smoke7browser absent, restored9metadata/preservation; bounded evidence/APverify/semantic/exact-SHA same-agent non-independent quality/finish/clean.

## Verify Steps

1. Pinned sw/inc/format.hxx GetULSpace; sw/source/uibase/shells/tabsh.cxx145..160 copies effective complete UL item, lcl_SetAttr/native SetTableAttr route; tabledlg.cxx393..415/568..579 owns changed-only item output/saved margins; fetab.cxx2363..2377 native ItemSet applied on original frame. tabfrm.cxx4209 source UL flags/forwarding already implemented; row-only browser page flow remains bounded and must read original effective UL. 2. Fresh actual original items: direct/inherited/pool0/reset, independent borrowed copies and represented context flag; no scalar storage or stale projection selection. Native SfxItemSet property application retains complete UL without calling scalar SetFormat; actual original SwUndoAttrTable three cycles retain graph/text/list/cursor/native client identities. Mounted direct and inherited spacing updates, native dialog saved/reset/changed-only semantics, page-budget moves and real ODT values. 3. Fresh+related affected tests only with upstream physically absent/finally restored; ENTIRE eight final changed production files actual Istanbul100 lines/statements/functions/branches/zero-negative, exact current complete-map/source-hash identity, no old-task or pre-change counters/maps. Old tests byte-identical except precise approved source-backed fixture migrations. 4. Upstream-absent format/lint/typecheck TS7,deps/docs/file-size,current build followed by smoke and selected table properties history/repeated headline/native Text Flow7 browser cases. Restored registry-build/source-tree/provenance/registry-check/resources--check/invariants/parity/routing/doctor,16canonical/parent/old-test preservation. 5. Bounded English identities/counts/exact commands/hashes only; no upstream sources/helpers/raw maps/logs in AgentPlane. Commit only task paths; semantic hash/quality PASS evaluated_sha bound and explicitly same-agent non-independent; refreshed blueprint verification persisted before canonical finish and clean tracked/untracked/reference. No full due5/10. No whole-module/goal promotion or native full spacing/layout/Doc SetAttr/copy/Repeat claim.

## Verification

Pending approved implementation and final-source upstream-absent verification.

## Rollback Plan

Revert only this task semantic commit and its evidence/inventory append, retaining historical canonical prefixes and earlier native frame-item correction. Restore ignored reference symlink in finally after each absent verification run.

## Findings

Standing iterative goal approval authorizes this safe in-scope native table spacing correction. Previous goal turn WGQ894 made authoritative verified progress. No live runner is required; current CODER owns local implementation. Full baseline SZKQTN, correction5/10; broad goal ACTIVE/incomplete. No network/global files/merges/publication/delegated agents. Full native SvxULSpace proportional setters/UNO members, generic Doc SetAttr/layout linkage/copy/Repeat remain separately incomplete.
