---
id: "202610210524-5678C0"
title: "Implement mouse sizing of Calc column and row headers"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T05:30:53.767Z"
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
    body: "Start: implement native header size/hide owners and actual browser pointer integration,with combined final Calc acceptance for tasks67and68."
events:
  -
    type: "status"
    at: "2026-10-21T05:31:14.786Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native header size/hide owners and actual browser pointer integration,with combined final Calc acceptance for tasks67and68."
doc_version: 3
doc_updated_at: "2026-10-21T05:31:14.786Z"
doc_updated_by: "CODER"
description: "User priority: useful existing-core UI after ordinary ODS import. Port the consumed ScColBar/ScRowBar size and hide contracts plus header drag threshold/completion/cancellation from pinned upstream. Wire React header boundaries to actual native dimensions and undo, preserving selection/groups and browser style. No alternate workbook geometry state; native optimal device layout stays an explicit separate unported branch. Limit up to24 implementation/test/registry/doc paths, including new native header boundaries and one browser pointer presenter. Accept related tests and raw changed-owner100, complete Calc100, browser actual drag/undo/cancel and unchanged ODS reload behavior. Full all-app checkpoint70, repair and final closure then pause remain required."
sections:
  Summary: "Add working mouse column and row sizing on the current native geometry slice. Use existing document,selection and undo owners; preserve upstream thresholds,integer conversion,selected spans and hidden ranges."
  Scope: "Original colrowba size/hide methods and original header drag arithmetic at the browser presentation boundary;new inc/source header owner files,one React resize presenter,controller/grid/workbench wiring and related tests/registry/docs. At most24paths. No zoom/device-layout implementation or alternate geometry model. Existing96CSSdpi is explicitly supplied by the browser to the consumed pixel-conversion dependency."
  Plan: "Port consumed original ScColBar/ScRowBar size/hide contracts with UInt16,min10px,marked spans,grouped sheets and real history;browser hdrcont pointer adaptation preserves2pxthreshold,completion+2screen-offset,negative hide and cancellation. Disable resizing while an edit view is active as upstream ResizeAllowed does. Existing96CSSdpi is supplied explicitly at the browser dependency boundary. Up to29 implementation/test/registry/doc paths including canonical hdrcont constant boundary. Use a single final fullCalc test/coverage run as shared acceptance evidence for ODS task67 and this UI task68,after all source edits;earlier partial task67 run is intentionally interrupted and not accepted. Related tests and changed-owner raw100 remain mandatory. No exclusions/threshold changes. Device optimum remains explicitly unsupported. Full all-app checkpoint70,fixes,scenarios,coverage,finaltask closure then goalpause."
  Verify Steps: "Native size tests cover UInt16 narrowing,min10px,exactpixel-to-twipconversion,single/unselected versus full marked/disjoint spans,selected sheet groups,hidden size0,stored dimensions,filtered rows and Undo/Redo. Browser actual pointer tests cover2pxthreshold,commit onrelease,preview without model changes,Esc/pointercancel,no selection loss,negative hide range and visible grid/dimension changes after history and ODS reload. All new/changed runtime owners raw S/B/F/L100;fullCalc tests/coverage100 without exclusions or threshold changes. Relevant sharedUI tests if shared sources change. Types/lint/format/boundaries/JSDoc/size/provenance/registry and browser drag QA pass. Retain explicit optimum/device/layout limitations."
  Verification: "Pending implementation. Verification scheduling is batched with task67: earlier partial Calc execution is intentionally interrupted before acceptance so useful UI work can proceed;one final fullCalc test/coverage run after ODS plus resize edits supplies shared acceptance for both tasks. Criteria remain raw100 and all relevant tests."
  Rollback Plan: "Revert only this task's geometry and pointer integration;retain accepted ordinary ODS opening and separately preserved task66 work."
  Findings: "Pinned colrowba.cxx clamps pixel input to10 and narrows converted twips toUInt16,applies full selected column/row spans or only the hit entry. hdrcont.cxx uses2pxdragthreshold,+2screen-position arithmetic onrelease,and negative-size backward hide walk. Original hit tolerance is5px. Existing core supports direct geometry/history;device optimum is explicitly unsupported. Existing browser geometry uses1/15pixels-per-twip."
id_source: "generated"
---
## Summary

Add working mouse column and row sizing on the current native geometry slice. Use existing document,selection and undo owners; preserve upstream thresholds,integer conversion,selected spans and hidden ranges.

## Scope

Original colrowba size/hide methods and original header drag arithmetic at the browser presentation boundary;new inc/source header owner files,one React resize presenter,controller/grid/workbench wiring and related tests/registry/docs. At most24paths. No zoom/device-layout implementation or alternate geometry model. Existing96CSSdpi is explicitly supplied by the browser to the consumed pixel-conversion dependency.

## Plan

Port consumed original ScColBar/ScRowBar size/hide contracts with UInt16,min10px,marked spans,grouped sheets and real history;browser hdrcont pointer adaptation preserves2pxthreshold,completion+2screen-offset,negative hide and cancellation. Disable resizing while an edit view is active as upstream ResizeAllowed does. Existing96CSSdpi is supplied explicitly at the browser dependency boundary. Up to29 implementation/test/registry/doc paths including canonical hdrcont constant boundary. Use a single final fullCalc test/coverage run as shared acceptance evidence for ODS task67 and this UI task68,after all source edits;earlier partial task67 run is intentionally interrupted and not accepted. Related tests and changed-owner raw100 remain mandatory. No exclusions/threshold changes. Device optimum remains explicitly unsupported. Full all-app checkpoint70,fixes,scenarios,coverage,finaltask closure then goalpause.

## Verify Steps

Native size tests cover UInt16 narrowing,min10px,exactpixel-to-twipconversion,single/unselected versus full marked/disjoint spans,selected sheet groups,hidden size0,stored dimensions,filtered rows and Undo/Redo. Browser actual pointer tests cover2pxthreshold,commit onrelease,preview without model changes,Esc/pointercancel,no selection loss,negative hide range and visible grid/dimension changes after history and ODS reload. All new/changed runtime owners raw S/B/F/L100;fullCalc tests/coverage100 without exclusions or threshold changes. Relevant sharedUI tests if shared sources change. Types/lint/format/boundaries/JSDoc/size/provenance/registry and browser drag QA pass. Retain explicit optimum/device/layout limitations.

## Verification

Pending implementation. Verification scheduling is batched with task67: earlier partial Calc execution is intentionally interrupted before acceptance so useful UI work can proceed;one final fullCalc test/coverage run after ODS plus resize edits supplies shared acceptance for both tasks. Criteria remain raw100 and all relevant tests.

## Rollback Plan

Revert only this task's geometry and pointer integration;retain accepted ordinary ODS opening and separately preserved task66 work.

## Findings

Pinned colrowba.cxx clamps pixel input to10 and narrows converted twips toUInt16,applies full selected column/row spans or only the hit entry. hdrcont.cxx uses2pxdragthreshold,+2screen-position arithmetic onrelease,and negative-size backward hide walk. Original hit tolerance is5px. Existing core supports direct geometry/history;device optimum is explicitly unsupported. Existing browser geometry uses1/15pixels-per-twip.
