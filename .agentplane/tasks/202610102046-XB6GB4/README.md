---
id: "202610102046-XB6GB4"
title: "Restore native text-frame position mapping and adjacent-frame cursor selection"
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
  updated_at: "2026-10-10T20:47:55.684Z"
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
    body: "Start: Restore original native frame model/view positions, predecessor master lookup and represented default no-scroll adjacent-frame margin selection; retain explicit native formatting/UI-chain gaps and verify current100 upstream-absent scope."
events:
  -
    type: "status"
    at: "2026-10-10T20:47:56.907Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore original native frame model/view positions, predecessor master lookup and represented default no-scroll adjacent-frame margin selection; retain explicit native formatting/UI-chain gaps and verify current100 upstream-absent scope."
doc_version: 3
doc_updated_at: "2026-10-10T20:47:56.907Z"
doc_updated_by: "CODER"
description: "Correction8/10 after BZ14P4: connect actual visual-line margin movement to original SwContentFrame FindMaster, unmerged SwTextFrame text/model/view position mapping and source no-scroll adjacent-frame selection; retain explicit native formatting and browser chain-publication gaps, pause after next full and repairs."
sections:
  Summary: "Connect current native visual-line margin movement to original frame position mapping and source master/follow adjacency rather than relying on the supplied standalone frame."
  Scope: "Four production modules: ssfrm.ts typed original FindMaster, txtfrm.ts source unmerged GetText/MapViewToModel/MapViewToModelPos/MapModelToView/MapModelToViewPos, frmcrsr.ts represented source GetAdjFrameAtPos default no-scroll selection/actual follow/master position equality and original mapped result RAII disposal, inftxt.ts original native frame GetText consumption. Actual Home End helper now selects the original frame and maps model/view positions through native APIs. Restore source reciprocal predecessor checks and native fallback for a lost follow; exact original nodes/registered positions only. Up to2 fresh native core/React tests; all old acceptance byte-identical unless an actual source-contract migration is documented within up to2 old frame/line-margin tests, preserving all other cases/matrices/device values/matchers. Eight historical canonical mappings plus generated registry metadata and parent Findings. Entire actual4 modules100 all-four/current complete maps/hashes/nonnegative counters; targeted static/build/new+related/browser upstream-absent then9source metadata gates; exact semantic same-agent non-independent quality/clean writer. The helper represents already device-formatted unmerged default no-scroll frames; native GetFormatted/re-entrant format stabilization, forced scroll/sw_ChangeOffset, merged/vertical/geometry/full line-margin empty/scroll semantics, original GetFrameOfModify and UI publishing all original cursor follows remain explicitly unported/unverified. The measured cursor map and end<native text length proxy remain for a following bounded UI-chain correction: do not invent a synthetic follow or unsupported geometry to remove it prematurely. No source-fidelity or whole-goal promotion. Registered recovery/open/save/settings deviations preserved. Correction8/10; after next full and errors repaired pause goal."
  Plan: "Source-audit original mapping/text/FindMaster/GetAdjFrameAtPos default no-scroll branch; implement four actual owners and integrate existing margin path, then original identity/position lifetime/master-follow/tie-affinity/corrupted-link defensive/mounted edit-history tests. Preserve old acceptance/inventory prefixes and explicit unsupported formatting/scroll/merged/query/UI-chain boundaries. Execute scoped actual100 related/static/browser upstream-absent once plus restored-source9gates, review exact semantic non-independently and close clean. Standing human goal/resume authorizes safe local correction."
  Verify Steps: |-
    1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 txtfrm.cxx unmerged GetText/MapViewToModel/MapViewToModelPos/MapModelToView/MapModelToViewPos, flowfrm.cxx SwContentFrame::FindMaster reciprocal guards, frmcrsr.cxx GetAdjFrameAtPos/default bNoScroll=true/model-view equality/right-margin walk/native fallback and actual LeftMargin/RightMargin consumers. Full native GetFormatted/forced scroll/merged/empty-margin semantics are not simulated or certified. Tests never read/call pinned source.
    2. Original SwDoc/SwTextNode/SwTextFrame/SwFlowFrame/SwPosition/SwPaM objects only. Unmerged mapping retains literal index and original frame owner; foreign-node MapModelToView ignores node as native unmerged branch does. SwTextSizeInfo original text; mapping temporary positions unregister on actual margin success/error. Original reciprocal FindMaster identities, no predecessor and explicit original-state corrupt reciprocal defensive probes (no mocked methods), original multi-frame GetAdj selection with interior/tie offsets and right-margin preceding frame across zero-length follows; lost-master fallback. Real shell body/cell Home End/Shift/label/edit/UndoRedo and mounted original frame positions/history, existing12 Chromium specs.
    3. Changed Prettier/ESLint, TS7 type/dependencies/docs/file-size/build/static; fresh and related Vitest whole4 production modules100 lines/statements/functions/branches using complete current raw maps/current source/test hashes/nonnegative counters; all runtime/static/build/browser both reference symlinks physically absent and restored finally. No full8/10; repair only affected/new failures and no passing replay for helper/metadata fixes.
    4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor9gates; all old acceptance byte-identical or source-only documented native API migration preserving other AST leaves/values. Eight canonical history/status/default/classification/responsibility prefixes retained without promotion. Exact semantic same-agent non-independent quality review, clean writer/restored refs and human stop-rule preserved.
  Verification: "Pending; no native full formatting/query/scroll/merged/geometry or complete UI-chain claim. No full suite at8/10."
  Rollback Plan: "Revert the semantic scoped commit and inventory through a separately authorized task; preserve unrelated checkout and history."
  Findings: "Current writer clean baselineb218f08e5b0f9486018a1e4ee7ac6b2fa341360d, seventh accepted correction after BZ14P4. Existing margin helper still receives one measured cursor frame and does not call native adjacent-frame or model/view mapping. Follow end proxy needs actual UI chain publication; no boolean/synthetic follow will substitute for that source mechanism. This atomic correction connects original mapping and source default no-scroll adjacency first; full formatter and forced-scroll APIs remain unrepresented."
id_source: "generated"
---
## Summary

Connect current native visual-line margin movement to original frame position mapping and source master/follow adjacency rather than relying on the supplied standalone frame.

## Scope

Four production modules: ssfrm.ts typed original FindMaster, txtfrm.ts source unmerged GetText/MapViewToModel/MapViewToModelPos/MapModelToView/MapModelToViewPos, frmcrsr.ts represented source GetAdjFrameAtPos default no-scroll selection/actual follow/master position equality and original mapped result RAII disposal, inftxt.ts original native frame GetText consumption. Actual Home End helper now selects the original frame and maps model/view positions through native APIs. Restore source reciprocal predecessor checks and native fallback for a lost follow; exact original nodes/registered positions only. Up to2 fresh native core/React tests; all old acceptance byte-identical unless an actual source-contract migration is documented within up to2 old frame/line-margin tests, preserving all other cases/matrices/device values/matchers. Eight historical canonical mappings plus generated registry metadata and parent Findings. Entire actual4 modules100 all-four/current complete maps/hashes/nonnegative counters; targeted static/build/new+related/browser upstream-absent then9source metadata gates; exact semantic same-agent non-independent quality/clean writer. The helper represents already device-formatted unmerged default no-scroll frames; native GetFormatted/re-entrant format stabilization, forced scroll/sw_ChangeOffset, merged/vertical/geometry/full line-margin empty/scroll semantics, original GetFrameOfModify and UI publishing all original cursor follows remain explicitly unported/unverified. The measured cursor map and end<native text length proxy remain for a following bounded UI-chain correction: do not invent a synthetic follow or unsupported geometry to remove it prematurely. No source-fidelity or whole-goal promotion. Registered recovery/open/save/settings deviations preserved. Correction8/10; after next full and errors repaired pause goal.

## Plan

Source-audit original mapping/text/FindMaster/GetAdjFrameAtPos default no-scroll branch; implement four actual owners and integrate existing margin path, then original identity/position lifetime/master-follow/tie-affinity/corrupted-link defensive/mounted edit-history tests. Preserve old acceptance/inventory prefixes and explicit unsupported formatting/scroll/merged/query/UI-chain boundaries. Execute scoped actual100 related/static/browser upstream-absent once plus restored-source9gates, review exact semantic non-independently and close clean. Standing human goal/resume authorizes safe local correction.

## Verify Steps

1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 txtfrm.cxx unmerged GetText/MapViewToModel/MapViewToModelPos/MapModelToView/MapModelToViewPos, flowfrm.cxx SwContentFrame::FindMaster reciprocal guards, frmcrsr.cxx GetAdjFrameAtPos/default bNoScroll=true/model-view equality/right-margin walk/native fallback and actual LeftMargin/RightMargin consumers. Full native GetFormatted/forced scroll/merged/empty-margin semantics are not simulated or certified. Tests never read/call pinned source.
2. Original SwDoc/SwTextNode/SwTextFrame/SwFlowFrame/SwPosition/SwPaM objects only. Unmerged mapping retains literal index and original frame owner; foreign-node MapModelToView ignores node as native unmerged branch does. SwTextSizeInfo original text; mapping temporary positions unregister on actual margin success/error. Original reciprocal FindMaster identities, no predecessor and explicit original-state corrupt reciprocal defensive probes (no mocked methods), original multi-frame GetAdj selection with interior/tie offsets and right-margin preceding frame across zero-length follows; lost-master fallback. Real shell body/cell Home End/Shift/label/edit/UndoRedo and mounted original frame positions/history, existing12 Chromium specs.
3. Changed Prettier/ESLint, TS7 type/dependencies/docs/file-size/build/static; fresh and related Vitest whole4 production modules100 lines/statements/functions/branches using complete current raw maps/current source/test hashes/nonnegative counters; all runtime/static/build/browser both reference symlinks physically absent and restored finally. No full8/10; repair only affected/new failures and no passing replay for helper/metadata fixes.
4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor9gates; all old acceptance byte-identical or source-only documented native API migration preserving other AST leaves/values. Eight canonical history/status/default/classification/responsibility prefixes retained without promotion. Exact semantic same-agent non-independent quality review, clean writer/restored refs and human stop-rule preserved.

## Verification

Pending; no native full formatting/query/scroll/merged/geometry or complete UI-chain claim. No full suite at8/10.

## Rollback Plan

Revert the semantic scoped commit and inventory through a separately authorized task; preserve unrelated checkout and history.

## Findings

Current writer clean baselineb218f08e5b0f9486018a1e4ee7ac6b2fa341360d, seventh accepted correction after BZ14P4. Existing margin helper still receives one measured cursor frame and does not call native adjacent-frame or model/view mapping. Follow end proxy needs actual UI chain publication; no boolean/synthetic follow will substitute for that source mechanism. This atomic correction connects original mapping and source default no-scroll adjacency first; full formatter and forced-scroll APIs remain unrepresented.
