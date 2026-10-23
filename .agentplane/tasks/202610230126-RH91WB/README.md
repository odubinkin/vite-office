---
id: "202610230126-RH91WB"
title: "Canonicalize Writer tab-stop dialog and complete native item acceptance"
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
  updated_at: "2026-10-23T01:27:31.546Z"
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
    body: "Start: port original tab-stop dialog page and complete native item request/result through actual Writer history and ODT under existing user continuation approval; task9 related checks only."
events:
  -
    type: "status"
    at: "2026-10-23T01:27:31.952Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original tab-stop dialog page and complete native item request/result through actual Writer history and ODT under existing user continuation approval; task9 related checks only."
doc_version: 3
doc_updated_at: "2026-10-23T01:27:31.952Z"
doc_updated_by: "CODER"
description: "Replace position-only paragraph Tabs editing with original SvxTabulatorTabPage controls and Reset/FillItemSet contracts; carry complete native tab-stop items through the Writer dialog, history, ruler/layout and ODT."
sections:
  Summary: "Complete Writer paragraph Tabs editing through original SvxTabulatorTabPage and complete native tab-stop item acceptance, connecting supported core alignment/decimal/fill data to visible UI and physical document I/O."
  Scope: "Only vite-office-writer checkout and writer branch. Up to28 implementation/resource/tooling paths and16 test paths plus paired canonical records/generated views. Original CUI tabstpge source/header and browser page; actual Writer dialog request/acceptance and native pool/slot/default/offset fields; existing metric, tab item, ruler/layout and ODT consumers only where integration evidence requires. Preserve intentional browser I/O/recovery/autosave deviations. No native allocation/lifetime engine, fake SfxTabPage/frame/provider/config services, locale-data expansion, network, merges or unrelated generic service graphs."
  Plan: "Read original tabstpge.cxx/.hxx and paratabspage.ui together with Writer textsh1 paragraph-dialog construction/acceptance and existing complete tab item/I/O/layout. Port original Reset/FillItemSet, automatic pending New acceptance, default/offset conversion, implicit/default stop stripping/reinsertion, null tab for negative first-line indent and type/fill/character/new/delete handlers. Build a source-backed browser TabulatorTabPage preserving original controls, units, sensitivity, focus and UTF16 first-character contracts. Carry complete actual tab-stop items through paragraph dialog request/result into one native paragraph history action, retaining existing position-only public caller compatibility without making UI lose metadata. Verify all types/fills, custom decimal, mixed/table selection, offset/default/null/rounding behavior, untouched entries, undo/redo/ruler/layout and physical ODT; document suspected source anomalies without correcting them. Current-source strict changed-responsibility coverage and all declared local gates, source/quality/close; continue active goal."
  Verify Steps: "Pinned local source review: cui/source/tabpages/tabstpge.cxx, cui/source/inc/tabstpge.hxx, cui/uiconfig/ui/paratabspage.ui, sw/source/uibase/shells/textsh1.cxx paragraph-dialog tab defaults/position/offset and acceptance, editeng tab item owners and actual ODT/ruler/layout. Test original Reset map-unit conversions/default stripping/selected-index fallback, pending New on OK except zero, explicit New zero, source insertion/replacement/order and FindCurrentTab formatted identity, delete/last/delete-all, disabled type/fill controls, four alignments, five fill choices, custom decimal/fill first UTF16-unit handling, empty/control-character rules. Preserve original FillItemSet default insertion, hanging-indent null tab, old-item comparison and native field/default-distance behavior; no invented normalization. Actual pooled complete request/result plus selected paragraph/table history and import/export retain metadata, and legacy callers remain consistent. Chromium1280/390 original Tabs controls, CM/INCH units, edit/accept/cancel, undo/redo, ruler and real ODT download/reopen, no runtime errors/root overflow. Strict exact-source changed-responsibility100 coverage with untouched thresholds; related portable/tooling/browser tests and type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/file-size/doctor/routing/diff and clean final state. Task9 since ACR55N: related tests only, next full suite at task10."
  Verification: "Pending current task implementation. Baseline095449e7c319 is clean after FNBXHP DONE. Prior line-spacing evidence is not tab-stop certification. Goal active."
  Rollback Plan: "Revert only this task source commits; retain previous Writer work and task evidence. No reset, merge, worktree or external write."
  Findings: "Previous goal turn is progress: FNBXHP closed095449e7c319, sourcea6d345f4fc63,49 current related/18 paragraph-layout/16 boundary/7 Chromium and14-owner100 audit, clean writer. Read-only audit now finds paragraph Tabs UI edits only tabStopsPt positions. Core SvxTabStopItem already carries alignment/decimal/fill/default distance and ODT tests preserve that metadata; current position-only acceptance retains old metadata only when positions match, and cannot edit it. Original CUI page owns controls and Reset/FillItemSet over complete items. Writer textsh1 supplies actual pool default tab distance, selected position0 and offset according to TABS_RELATIVE_TO_INDENT. Source FillItemSet may add a default stop at0 for negative first-line indent in non-mm100 pools, so do not replace source behavior with plain position filtering. Original single-unit character handlers use UTF16 first unit, not codepoints. Read actual source dependencies before defining ports; complete native service graph remains unported. Broad user approval for safe writer implementation and pinned local reference reading persists; no new permission required. Goal active; old stop instructions revoked. This is task9, next full at10."
id_source: "generated"
---
## Summary

Complete Writer paragraph Tabs editing through original SvxTabulatorTabPage and complete native tab-stop item acceptance, connecting supported core alignment/decimal/fill data to visible UI and physical document I/O.

## Scope

Only vite-office-writer checkout and writer branch. Up to28 implementation/resource/tooling paths and16 test paths plus paired canonical records/generated views. Original CUI tabstpge source/header and browser page; actual Writer dialog request/acceptance and native pool/slot/default/offset fields; existing metric, tab item, ruler/layout and ODT consumers only where integration evidence requires. Preserve intentional browser I/O/recovery/autosave deviations. No native allocation/lifetime engine, fake SfxTabPage/frame/provider/config services, locale-data expansion, network, merges or unrelated generic service graphs.

## Plan

Read original tabstpge.cxx/.hxx and paratabspage.ui together with Writer textsh1 paragraph-dialog construction/acceptance and existing complete tab item/I/O/layout. Port original Reset/FillItemSet, automatic pending New acceptance, default/offset conversion, implicit/default stop stripping/reinsertion, null tab for negative first-line indent and type/fill/character/new/delete handlers. Build a source-backed browser TabulatorTabPage preserving original controls, units, sensitivity, focus and UTF16 first-character contracts. Carry complete actual tab-stop items through paragraph dialog request/result into one native paragraph history action, retaining existing position-only public caller compatibility without making UI lose metadata. Verify all types/fills, custom decimal, mixed/table selection, offset/default/null/rounding behavior, untouched entries, undo/redo/ruler/layout and physical ODT; document suspected source anomalies without correcting them. Current-source strict changed-responsibility coverage and all declared local gates, source/quality/close; continue active goal.

## Verify Steps

Pinned local source review: cui/source/tabpages/tabstpge.cxx, cui/source/inc/tabstpge.hxx, cui/uiconfig/ui/paratabspage.ui, sw/source/uibase/shells/textsh1.cxx paragraph-dialog tab defaults/position/offset and acceptance, editeng tab item owners and actual ODT/ruler/layout. Test original Reset map-unit conversions/default stripping/selected-index fallback, pending New on OK except zero, explicit New zero, source insertion/replacement/order and FindCurrentTab formatted identity, delete/last/delete-all, disabled type/fill controls, four alignments, five fill choices, custom decimal/fill first UTF16-unit handling, empty/control-character rules. Preserve original FillItemSet default insertion, hanging-indent null tab, old-item comparison and native field/default-distance behavior; no invented normalization. Actual pooled complete request/result plus selected paragraph/table history and import/export retain metadata, and legacy callers remain consistent. Chromium1280/390 original Tabs controls, CM/INCH units, edit/accept/cancel, undo/redo, ruler and real ODT download/reopen, no runtime errors/root overflow. Strict exact-source changed-responsibility100 coverage with untouched thresholds; related portable/tooling/browser tests and type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/file-size/doctor/routing/diff and clean final state. Task9 since ACR55N: related tests only, next full suite at task10.

## Verification

Pending current task implementation. Baseline095449e7c319 is clean after FNBXHP DONE. Prior line-spacing evidence is not tab-stop certification. Goal active.

## Rollback Plan

Revert only this task source commits; retain previous Writer work and task evidence. No reset, merge, worktree or external write.

## Findings

Previous goal turn is progress: FNBXHP closed095449e7c319, sourcea6d345f4fc63,49 current related/18 paragraph-layout/16 boundary/7 Chromium and14-owner100 audit, clean writer. Read-only audit now finds paragraph Tabs UI edits only tabStopsPt positions. Core SvxTabStopItem already carries alignment/decimal/fill/default distance and ODT tests preserve that metadata; current position-only acceptance retains old metadata only when positions match, and cannot edit it. Original CUI page owns controls and Reset/FillItemSet over complete items. Writer textsh1 supplies actual pool default tab distance, selected position0 and offset according to TABS_RELATIVE_TO_INDENT. Source FillItemSet may add a default stop at0 for negative first-line indent in non-mm100 pools, so do not replace source behavior with plain position filtering. Original single-unit character handlers use UTF16 first unit, not codepoints. Read actual source dependencies before defining ports; complete native service graph remains unported. Broad user approval for safe writer implementation and pinned local reference reading persists; no new permission required. Goal active; old stop instructions revoked. This is task9, next full at10.
