---
id: "202610230126-RH91WB"
title: "Canonicalize Writer tab-stop dialog and complete native item acceptance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
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
doc_updated_at: "2026-10-23T01:36:35.371Z"
doc_updated_by: "CODER"
description: "Replace position-only paragraph Tabs editing with original SvxTabulatorTabPage controls and Reset/FillItemSet contracts; carry complete native tab-stop items through the Writer dialog, history, ruler/layout and ODT."
sections:
  Summary: "Complete Writer paragraph Tabs editing through original SvxTabulatorTabPage and complete native tab-stop item acceptance, connecting supported core alignment/decimal/fill data to visible UI and physical document I/O."
  Scope: "Only vite-office-writer checkout and writer branch. Up to28 implementation/resource/tooling paths and16 test paths plus paired canonical records/generated views. Original CUI tabstpge source/header and browser page; actual Writer dialog request/acceptance and native pool/slot/default/offset fields; existing metric, tab item, ruler/layout and ODT consumers only where integration evidence requires. Preserve intentional browser I/O/recovery/autosave deviations. No native allocation/lifetime engine, fake SfxTabPage/frame/provider/config services, locale-data expansion, network, merges or unrelated generic service graphs."
  Plan: "Read original tabstpge.cxx/.hxx and paratabspage.ui together with Writer textsh1 paragraph-dialog construction/acceptance and existing complete tab item/I/O/layout. Port original Reset/FillItemSet, automatic pending New acceptance, default/offset conversion, implicit/default stop stripping/reinsertion, null tab for negative first-line indent and type/fill/character/new/delete handlers. Build a source-backed browser TabulatorTabPage preserving original controls, units, sensitivity, focus and UTF16 first-character contracts. Carry complete actual tab-stop items through paragraph dialog request/result into one native paragraph history action, retaining existing position-only public caller compatibility without making UI lose metadata. Verify all types/fills, custom decimal, mixed/table selection, offset/default/null/rounding behavior, untouched entries, undo/redo/ruler/layout and physical ODT; document suspected source anomalies without correcting them. Current-source strict changed-responsibility coverage and all declared local gates, source/quality/close; continue active goal."
  Verify Steps: "Pinned local source review: cui/source/tabpages/tabstpge.cxx, cui/source/inc/tabstpge.hxx, cui/uiconfig/ui/paratabspage.ui, sw/source/uibase/shells/textsh1.cxx paragraph-dialog tab defaults/position/offset and acceptance, editeng tab item owners and actual ODT/ruler/layout. Test original Reset map-unit conversions/default stripping/selected-index fallback, pending New on OK except zero, explicit New zero, source insertion/replacement/order and FindCurrentTab formatted identity, delete/last/delete-all, disabled type/fill controls, four alignments, five fill choices, custom decimal/fill first UTF16-unit handling, empty/control-character rules. Preserve original FillItemSet default insertion, hanging-indent null tab, old-item comparison and native field/default-distance behavior; no invented normalization. Actual pooled complete request/result plus selected paragraph/table history and import/export retain metadata, and legacy callers remain consistent. Chromium1280/390 original Tabs controls, CM/INCH units, edit/accept/cancel, undo/redo, ruler and real ODT download/reopen, no runtime errors/root overflow. Strict exact-source changed-responsibility100 coverage with untouched thresholds; related portable/tooling/browser tests and type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/file-size/doctor/routing/diff and clean final state. Task9 since ACR55N: related tests only, next full suite at task10."
  Verification: "Implementation checkpoint only; RH91WB remains DOING with no final verification/quality claim. Actual Writer dialog result now optionally carries the native tab-page output SfxItemSet. ApplyParagraphFormat applies its complete entries in the same paragraph history operation; empty native output preserves every selected paragraph tab item, while absent output retains existing public position-only caller behavior. Source dialog command passes the actual native output set. Current typecheck/scoped ESLint/module-boundary checks pass;3 related files9 tests pass, including real complete tab-item dialog acceptance, explicit zero/decimal/custom leader, Undo/Redo, ODT, mixed selection with unchanged native page output and existing paragraph/line-mode regressions. Evidence output/playwright/writer-tabs/core-current.log,types-current.log,lint-current.log,dependencies-current.log. Native CUI page/visible controls and all remaining task verification, source-bound coverage and final canonical gates remain pending. Ninth task after ACR55N; no full suite. Goal active."
  Rollback Plan: "Revert only this task source commits; retain previous Writer work and task evidence. No reset, merge, worktree or external write."
  Findings: |-
    Baseline095449e7c319 clean after FNBXHP. Approved RH91WB artifacts persisted774f453b2925; only writer checkout/branch under existing broad mutation/continuation and pinned local LibreOffice9bc445578031fecf56086729d8e4940c77e14d65 read approval. No network/outside mutation/merge/other worktree/subagent. Goal remains active; earlier stop instructions revoked.

    Read-only evidence: WriterParagraphDialog Tabs section currently edits only tabStopsPt with New/Delete/Delete All and arbitrary positive32767twip cap. Complete existing SvxTabStopItem/SwTabStop and ODT consumers already represent alignment, decimal, fill and independent default distance. Original cui/source/tabpages/tabstpge.cxx and source/inc/tabstpge.hxx plus paratabspage.ui must own visible editor structure/algorithms. Source Reset converts to mm100, removes implicit Default stops for the list, and keeps original selected-position fallback; FillItemSet adds pending New on acceptance except zero, reintroduces defaults when empty and inserts default zero for negative first-line indent in non-mm100 pools. Explicit New zero is allowed. New/Delete/type/fill/decimal/character handlers must retain source formatted-position matching and UTF16 first-unit rules.

    Original Writer textsh1.cxx1799..1818 supplies default distance from actual pool defaults, selected position0 and left-border offset only under TABS_RELATIVE_TO_INDENT. Generic pool GetMetric returns its actual eDefMetric; Writer-named constructor currently sets MapTwip. Do not fabricate a full SfxTabPage/dialog/frame/config service. Original actual numeric/map helpers are available from FNBXHP.

    Concrete implementation this turn: WriterParagraphDialogResult now has optional native tabStopItems:SfxItemSet. Core ApplyParagraphFormat accepts that set, bypasses legacy position validation only for represented native output, and spreads complete native entries into the existing selected-paragraph history action. An empty native set means unchanged tabs and preserves different selected paragraphs; undefined means existing legacy caller transport. This distinction avoids replacing a mixed native selection with active-paragraph positions when the tab page is untouched. Native full item and other paragraph properties use one history group; no second tab-only action or temporary DTO metadata mirror. Actual paragraph-dialog completion passes the set through.

    Current test evidence: native-tab-page-acceptance.test.ts2 actual native tests plus textsh1 and paragraph-line-mode regressions,3files9cases pass. Real explicit tab position0, Decimal semicolon/dotted leader and Right underscore survive acceptance/history/ODT. Empty native output preserves distinct selected paragraph tab positions and metadata. Typecheck, scoped ESLint and dependencies pass. Core textsh1.ts is997lines, so further bridge additions should use a mechanical responsibility split within approved scope rather than exceed source-size policy.

    Resolved failures: first result-item-only draft could not distinguish unchanged native page output from an absent legacy payload; replaced with original native output item set. First ODT expectation incorrectly demanded inactive Left/Right decimal fields remain period: pinned xmloff/source/style/xmltabe.cxx exports decimal only for Decimal alignment; xmltabi.cxx explicitly initializes DecimalChar to comma. Corrected test to literal original comma defaults while retaining the custom active Decimal semicolon. This is intentional source field behavior, not a demonstrated defect and not a filter production change. A multiline call retained obsolete result.tabStops after result renamed tabStopItems; typecheck and real acceptance test caught it, corrected actual command bridge, reran3 related files successfully. All raw failure logs retained; no coverage/full UI/whole-task certification yet.

    Remaining approved work: implement original SvxTabulatorTabPage Reset/FillItemSet and handlers/controls, actual input pool/slot/default/position/offset/negative-indent context, integrate browser Tabs page and pending-on-OK/unchanged/cancel semantics, preserve source type/fill/UTF16/default/order contracts. Connect ruler/layout and physical I/O where evidence shows gaps; source-qualify suspected issues if discovered. Then complete related native/browser tests, current-source strict coverage, paired canonical records/generated views and all declared gates; source commit/EVALUATOR/quality/close. Up to28 implementation/resource/tooling and16 test paths, current3 implementation plus1 new test. Full suite due task10; this is task9. Goal stays active.
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

Implementation checkpoint only; RH91WB remains DOING with no final verification/quality claim. Actual Writer dialog result now optionally carries the native tab-page output SfxItemSet. ApplyParagraphFormat applies its complete entries in the same paragraph history operation; empty native output preserves every selected paragraph tab item, while absent output retains existing public position-only caller behavior. Source dialog command passes the actual native output set. Current typecheck/scoped ESLint/module-boundary checks pass;3 related files9 tests pass, including real complete tab-item dialog acceptance, explicit zero/decimal/custom leader, Undo/Redo, ODT, mixed selection with unchanged native page output and existing paragraph/line-mode regressions. Evidence output/playwright/writer-tabs/core-current.log,types-current.log,lint-current.log,dependencies-current.log. Native CUI page/visible controls and all remaining task verification, source-bound coverage and final canonical gates remain pending. Ninth task after ACR55N; no full suite. Goal active.

## Rollback Plan

Revert only this task source commits; retain previous Writer work and task evidence. No reset, merge, worktree or external write.

## Findings

Baseline095449e7c319 clean after FNBXHP. Approved RH91WB artifacts persisted774f453b2925; only writer checkout/branch under existing broad mutation/continuation and pinned local LibreOffice9bc445578031fecf56086729d8e4940c77e14d65 read approval. No network/outside mutation/merge/other worktree/subagent. Goal remains active; earlier stop instructions revoked.

Read-only evidence: WriterParagraphDialog Tabs section currently edits only tabStopsPt with New/Delete/Delete All and arbitrary positive32767twip cap. Complete existing SvxTabStopItem/SwTabStop and ODT consumers already represent alignment, decimal, fill and independent default distance. Original cui/source/tabpages/tabstpge.cxx and source/inc/tabstpge.hxx plus paratabspage.ui must own visible editor structure/algorithms. Source Reset converts to mm100, removes implicit Default stops for the list, and keeps original selected-position fallback; FillItemSet adds pending New on acceptance except zero, reintroduces defaults when empty and inserts default zero for negative first-line indent in non-mm100 pools. Explicit New zero is allowed. New/Delete/type/fill/decimal/character handlers must retain source formatted-position matching and UTF16 first-unit rules.

Original Writer textsh1.cxx1799..1818 supplies default distance from actual pool defaults, selected position0 and left-border offset only under TABS_RELATIVE_TO_INDENT. Generic pool GetMetric returns its actual eDefMetric; Writer-named constructor currently sets MapTwip. Do not fabricate a full SfxTabPage/dialog/frame/config service. Original actual numeric/map helpers are available from FNBXHP.

Concrete implementation this turn: WriterParagraphDialogResult now has optional native tabStopItems:SfxItemSet. Core ApplyParagraphFormat accepts that set, bypasses legacy position validation only for represented native output, and spreads complete native entries into the existing selected-paragraph history action. An empty native set means unchanged tabs and preserves different selected paragraphs; undefined means existing legacy caller transport. This distinction avoids replacing a mixed native selection with active-paragraph positions when the tab page is untouched. Native full item and other paragraph properties use one history group; no second tab-only action or temporary DTO metadata mirror. Actual paragraph-dialog completion passes the set through.

Current test evidence: native-tab-page-acceptance.test.ts2 actual native tests plus textsh1 and paragraph-line-mode regressions,3files9cases pass. Real explicit tab position0, Decimal semicolon/dotted leader and Right underscore survive acceptance/history/ODT. Empty native output preserves distinct selected paragraph tab positions and metadata. Typecheck, scoped ESLint and dependencies pass. Core textsh1.ts is997lines, so further bridge additions should use a mechanical responsibility split within approved scope rather than exceed source-size policy.

Resolved failures: first result-item-only draft could not distinguish unchanged native page output from an absent legacy payload; replaced with original native output item set. First ODT expectation incorrectly demanded inactive Left/Right decimal fields remain period: pinned xmloff/source/style/xmltabe.cxx exports decimal only for Decimal alignment; xmltabi.cxx explicitly initializes DecimalChar to comma. Corrected test to literal original comma defaults while retaining the custom active Decimal semicolon. This is intentional source field behavior, not a demonstrated defect and not a filter production change. A multiline call retained obsolete result.tabStops after result renamed tabStopItems; typecheck and real acceptance test caught it, corrected actual command bridge, reran3 related files successfully. All raw failure logs retained; no coverage/full UI/whole-task certification yet.

Remaining approved work: implement original SvxTabulatorTabPage Reset/FillItemSet and handlers/controls, actual input pool/slot/default/position/offset/negative-indent context, integrate browser Tabs page and pending-on-OK/unchanged/cancel semantics, preserve source type/fill/UTF16/default/order contracts. Connect ruler/layout and physical I/O where evidence shows gaps; source-qualify suspected issues if discovered. Then complete related native/browser tests, current-source strict coverage, paired canonical records/generated views and all declared gates; source commit/EVALUATOR/quality/close. Up to28 implementation/resource/tooling and16 test paths, current3 implementation plus1 new test. Full suite due task10; this is task9. Goal stays active.
