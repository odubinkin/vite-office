---
id: "202610222108-KVGGCR"
title: "Implement native internal clipboard fill and paste undo"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610222107-NCTYV6"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T21:10:11.213Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-23T12:07:27.066Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-23T12:07:27.066Z"
doc_updated_by: "CODER"
description: "Block76 depends on75 and completes the kernel path needed by74 empty-marked AutoSum. Implement real clipboard document/reset/shared pool lifetime,ScClipParam,source default content-only single-cell clipboard fill through native copy contexts/column/table/document routines,and original paste undo/redo and source selection rules. Consume actual grouped formula copying from75;do not loop browser EnterData,reparse formula text,flatten groups or use alternate document/storage models. Preserve scalar/local-reference/aggregate/default format behavior;external OS clipboard,rich edit,drawings,notes,3D/matrix/nondefault paste services remain explicit. Up to110 source/test/registry/probe paths. Calc and changed shared raw100,related native/browser/Worker/ODS/history evidence and all static/build/source gates. Full all-app checkpoint80;then complete74 against its unchanged final acceptance contract."
sections:
  Summary: "Implement the original internal clipboard/PasteFromClip path required by empty-marked AutoSum instead of a repeated-cell shortcut."
  Scope: "Block76 depends on75. Real clipboard document/reset/shared pool lifetime,ScClipParam,default content-only single-cell clipboard fill through native contexts/column/table/document routines,paste undo/redo and original mark/cursor rules. Consume genuine group copying from75. Scalar/local-reference/aggregate/default-format profile;OS clipboard,rich edit,drawings,notes,external/3D/matrix and nondefault paste services stay explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no merges,network or external writes. Then complete74 without changing its final acceptance criteria."
  Plan: "After75,port source clipboard parameter/document/pool ownership and actual copy-context/store paths,then original default PasteFromClip and native paste undo. Connect EnterAutoSum/EnterBlock,including source multi-selection fallback and selection-relative formulas;remove the corresponding74 unavailable boundary only when native behavior is present. Verify default formats,geometry,grouped references,history,ODS and browser/Worker with complete Calc and changed shared raw100 and all static/build/source gates. Full all-app checkpoint80."
  Verify Steps: "Verify original clipboard/reset/default/pool ownership and parameter values,real sparse sheet/source selection,relative/absolute formula copying and shared group behavior through the native context/store paths. Empty marked AutoSum must use actual EnterBlock/PasteFromClip and native paste undo,including multi-selection source fallback;no repeated EnterData loop,formula-source reparse or alternate workbook model. Test row/column/sheet bounds,empty/error content,default formats,style/geometry preservation,Undo/Redo and fresh ODS reopen. Complete Calc and changed shared raw100 S/B/F/L with unchanged thresholds,related consumers,actual Chromium/DOM-free Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Final74 acceptance remains required after this prerequisite. No full all-app checkpoint before80."
  Verification: "Pending;75 must complete before clipboard implementation and final acceptance."
  Rollback Plan: "Revert only task-owned clipboard/paste commits,preserving completed75 and the74 UI checkpoint."
  Findings: "Original EnterBlock constructs SCDOCMODE_CLIP,shares pooled resources,stores the actual formula and pastes CONTENTS through native routines and paste history. CopyOneCellFromClip invokes original CloneFormulaCell grouping;source sheet indexes beyond0 can follow the general copy path. A normal browser row loop is not an equivalent substitute. Current74 clipboard boundary stays unavailable until this task provides the real service."
id_source: "generated"
---
## Summary

Implement the original internal clipboard/PasteFromClip path required by empty-marked AutoSum instead of a repeated-cell shortcut.

## Scope

Block76 depends on75. Real clipboard document/reset/shared pool lifetime,ScClipParam,default content-only single-cell clipboard fill through native contexts/column/table/document routines,paste undo/redo and original mark/cursor rules. Consume genuine group copying from75. Scalar/local-reference/aggregate/default-format profile;OS clipboard,rich edit,drawings,notes,external/3D/matrix and nondefault paste services stay explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no merges,network or external writes. Then complete74 without changing its final acceptance criteria.

## Plan

After75,port source clipboard parameter/document/pool ownership and actual copy-context/store paths,then original default PasteFromClip and native paste undo. Connect EnterAutoSum/EnterBlock,including source multi-selection fallback and selection-relative formulas;remove the corresponding74 unavailable boundary only when native behavior is present. Verify default formats,geometry,grouped references,history,ODS and browser/Worker with complete Calc and changed shared raw100 and all static/build/source gates. Full all-app checkpoint80.

## Verify Steps

Verify original clipboard/reset/default/pool ownership and parameter values,real sparse sheet/source selection,relative/absolute formula copying and shared group behavior through the native context/store paths. Empty marked AutoSum must use actual EnterBlock/PasteFromClip and native paste undo,including multi-selection source fallback;no repeated EnterData loop,formula-source reparse or alternate workbook model. Test row/column/sheet bounds,empty/error content,default formats,style/geometry preservation,Undo/Redo and fresh ODS reopen. Complete Calc and changed shared raw100 S/B/F/L with unchanged thresholds,related consumers,actual Chromium/DOM-free Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Final74 acceptance remains required after this prerequisite. No full all-app checkpoint before80.

## Verification

Pending;75 must complete before clipboard implementation and final acceptance.

## Rollback Plan

Revert only task-owned clipboard/paste commits,preserving completed75 and the74 UI checkpoint.

## Findings

Original EnterBlock constructs SCDOCMODE_CLIP,shares pooled resources,stores the actual formula and pastes CONTENTS through native routines and paste history. CopyOneCellFromClip invokes original CloneFormulaCell grouping;source sheet indexes beyond0 can follow the general copy path. A normal browser row loop is not an equivalent substitute. Current74 clipboard boundary stays unavailable until this task provides the real service.
