---
id: "202609240501-ZNDC30"
title: "Restore SvxTabStopItem in Writer formatting"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609240501-76PKPC"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T05:43:03.226Z"
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
    body: "Start: restore pinned SvxTabStopItem identity and defaults across Writer model, shell, supported UI and ODT paths with source-derived tests."
events:
  -
    type: "status"
    at: "2026-09-24T05:43:08.424Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore pinned SvxTabStopItem identity and defaults across Writer model, shell, supported UI and ODT paths with source-derived tests."
doc_version: 3
doc_updated_at: "2026-09-24T05:43:08.424Z"
doc_updated_by: "CODER"
description: "Stage 2a: replace integer tab-stop surrogate with pinned SvxTabStopItem identity, defaults, alignment and fill through pool, shell, UI, ODT and undo"
sections:
  Summary: |-
    Restore Writer item types and defaults

    Stage 2: implement SvxTabStopItem and SwLineNumberInfo with upstream defaults through pool, shell, UI, ODT and undo
  Scope: "Stage 2a of the approved parity plan. Replace RES_PARATR_TABSTOP integer/list surrogates with upstream-shaped SvxTabStop and SvxTabStopItem, including 1134-twip default spacing, adjustment, decimal and fill characters, sorted item identity, and safe persistence. Migrate current Writer pool/style defaults, shell command paths, React projection/drafts, ruler inputs, supported ODF import/export, undo and tests. Expected areas: editeng/source/items, svl/source/items, sw/source/core/attr and doc codecs/defaults, sw/source/uibase, sw/browser/presentation, sw/source/filter/xml, xmloff property types, and affected parity/provenance data. Keep browser save workflow and inventory machinery unchanged; no network."
  Plan: "1. Port the bounded SvxTabStop and SvxTabStopItem value contract from pinned editeng and register the Writer pool default. 2. Replace item storage, shell, UI projection, and supported ODF paths without changing browser save workflows. 3. Add source-derived item, undo, and ODT tests for alignment, fill, defaults, and multiple stops. 4. Update inventory/provenance data, run full verification, record evidence, and close."
  Verify Steps: "1. Compare model API, default count/distance, stop ordering/replacement, adjustment, fill, decimal, equality and clone against pinned editeng/source/items/paraitem.cxx, include/editeng/tstpitem.hxx, and sw/source/core/bastyp/init.cxx; run focused item and pool tests. 2. Test shell edits, dialog/ruler values, undo/redo, and ODT round trips for one and multiple tab stops with alignment/fill preserved; no RES_PARATR_TABSTOP integer surrogate remains in production. 3. Run npm run verify; all static, type, unit, browser, source, provenance, and inventory checks pass. 4. Inspect diff and git status for only this task scope, and confirm recovery/autosave/save behavior is unchanged."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this item-model migration and task close commit, restore original item representation, then rerun focused Writer formatting and ODT tests plus npm run verify."
  Findings: "Pinned source: include/editeng/tstpitem.hxx defines SvxTabStopItem with stop position, adjustment, decimal and fill; editeng/source/items/paraitem.cxx stores sorted stops; sw/source/core/bastyp/init.cxx registers one default stop at SVX_TAB_DEFDIST=1134 twips. Existing local representation is SfxInt16Item or SfxInt16ListItem."
id_source: "generated"
---
## Summary

Restore Writer item types and defaults

Stage 2: implement SvxTabStopItem and SwLineNumberInfo with upstream defaults through pool, shell, UI, ODT and undo

## Scope

Stage 2a of the approved parity plan. Replace RES_PARATR_TABSTOP integer/list surrogates with upstream-shaped SvxTabStop and SvxTabStopItem, including 1134-twip default spacing, adjustment, decimal and fill characters, sorted item identity, and safe persistence. Migrate current Writer pool/style defaults, shell command paths, React projection/drafts, ruler inputs, supported ODF import/export, undo and tests. Expected areas: editeng/source/items, svl/source/items, sw/source/core/attr and doc codecs/defaults, sw/source/uibase, sw/browser/presentation, sw/source/filter/xml, xmloff property types, and affected parity/provenance data. Keep browser save workflow and inventory machinery unchanged; no network.

## Plan

1. Port the bounded SvxTabStop and SvxTabStopItem value contract from pinned editeng and register the Writer pool default. 2. Replace item storage, shell, UI projection, and supported ODF paths without changing browser save workflows. 3. Add source-derived item, undo, and ODT tests for alignment, fill, defaults, and multiple stops. 4. Update inventory/provenance data, run full verification, record evidence, and close.

## Verify Steps

1. Compare model API, default count/distance, stop ordering/replacement, adjustment, fill, decimal, equality and clone against pinned editeng/source/items/paraitem.cxx, include/editeng/tstpitem.hxx, and sw/source/core/bastyp/init.cxx; run focused item and pool tests. 2. Test shell edits, dialog/ruler values, undo/redo, and ODT round trips for one and multiple tab stops with alignment/fill preserved; no RES_PARATR_TABSTOP integer surrogate remains in production. 3. Run npm run verify; all static, type, unit, browser, source, provenance, and inventory checks pass. 4. Inspect diff and git status for only this task scope, and confirm recovery/autosave/save behavior is unchanged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this item-model migration and task close commit, restore original item representation, then rerun focused Writer formatting and ODT tests plus npm run verify.

## Findings

Pinned source: include/editeng/tstpitem.hxx defines SvxTabStopItem with stop position, adjustment, decimal and fill; editeng/source/items/paraitem.cxx stores sorted stops; sw/source/core/bastyp/init.cxx registers one default stop at SVX_TAB_DEFDIST=1134 twips. Existing local representation is SfxInt16Item or SfxInt16ListItem.
