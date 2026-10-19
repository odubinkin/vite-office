---
id: "202610191401-GKVVR7"
title: "Connect native standard automatic row heights to Calc font UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T14:05:42.768Z"
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
    body: "Start: Continue user-authorized UI work by replacing fixed-row painting with real source standard automatic row heights after point-size changes and history;preserve genuine model,default and ODS owners."
events:
  -
    type: "status"
    at: "2026-10-19T14:05:50.296Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Continue user-authorized UI work by replacing fixed-row painting with real source standard automatic row heights after point-size changes and history;preserve genuine model,default and ODS owners."
doc_version: 3
doc_updated_at: "2026-10-19T14:05:50.296Z"
doc_updated_by: "CODER"
description: "Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40."
sections:
  Summary: |-
    Connect native standard automatic row heights to Calc font UI

    Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.
  Scope: |-
    - In scope: Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.
    - Out of scope: unrelated refactors not required for "Connect native standard automatic row heights to Calc font UI".
  Plan: "Implement automatic row-height behavior for the current plain,unwrapped,unrotated,unmerged uniform-script-height Calc slice. Reuse existing ScFlatUInt16RowSegments and ScBitMaskCompressedArray,source256twip minimum,23twip difference,actual margin/emphasis defaults,and native lcl_GetAttribHeight/RowHeightContext/SetOptimalHeightsToRows/pixel rules. Extend genuine ScDocumentPool prefix through ATTR_MARGIN143,without fake defaults/providers or full page constructors. Connect format application and undo/redo to source automatic adjustment;render and scroll actual variable native row heights and preserve them in ODS row styles/autosave/open. Retain unsupported advanced-script/rich/wrapped/rotated layout explicitly. Standalone manual/optimal-height dialogs remain a subsequent UI action batch. Scope budget: up to140non-task paths including implementation/tests/tooling,their required canonical registry records and readiness/suspect docs. Verify current standard-font behavior,end-of-sheet/sparse intervals,mixed/manual/grouped rows,history,OOXML-independent ODS,real browser no-clipping at desktop/mobile and all four Calc coverage metrics100. Full regression remains scheduled at40."
  Verify Steps: "Run whole Calc test:coverage:calc with raw S/B/F/L100 and no new exclusions;collect complete changed application owner coverage100 and related shared/tooling tests. Check source arithmetic,widths/defaults,manual flags,grouped context ordering,pixel change and interval boundaries against pinned originals. Exercise actual point-size control,automatic row geometry,undo/redo,scroll/hit positions and same-model ODS row-style persistence at1280/390 using fresh build;large24pt text must fit its actual row vertically. Run types/build/static,changed-path lint/format,docs/size/tree/dependencies/provenance/resources/scoped inventories,doctor/routing/diff;record evidence and close with clean calc checkout. Full all-app regression is not scheduled until task40 per user cadence."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's explicit source/inventory commit if acceptance fails. Retain task evidence,prior point-size UI and user-owned branch/merge decisions;do not reset other active tasks."
  Findings: ""
id_source: "generated"
---
## Summary

Connect native standard automatic row heights to Calc font UI

Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.

## Scope

- In scope: Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.
- Out of scope: unrelated refactors not required for "Connect native standard automatic row heights to Calc font UI".

## Plan

Implement automatic row-height behavior for the current plain,unwrapped,unrotated,unmerged uniform-script-height Calc slice. Reuse existing ScFlatUInt16RowSegments and ScBitMaskCompressedArray,source256twip minimum,23twip difference,actual margin/emphasis defaults,and native lcl_GetAttribHeight/RowHeightContext/SetOptimalHeightsToRows/pixel rules. Extend genuine ScDocumentPool prefix through ATTR_MARGIN143,without fake defaults/providers or full page constructors. Connect format application and undo/redo to source automatic adjustment;render and scroll actual variable native row heights and preserve them in ODS row styles/autosave/open. Retain unsupported advanced-script/rich/wrapped/rotated layout explicitly. Standalone manual/optimal-height dialogs remain a subsequent UI action batch. Scope budget: up to140non-task paths including implementation/tests/tooling,their required canonical registry records and readiness/suspect docs. Verify current standard-font behavior,end-of-sheet/sparse intervals,mixed/manual/grouped rows,history,OOXML-independent ODS,real browser no-clipping at desktop/mobile and all four Calc coverage metrics100. Full regression remains scheduled at40.

## Verify Steps

Run whole Calc test:coverage:calc with raw S/B/F/L100 and no new exclusions;collect complete changed application owner coverage100 and related shared/tooling tests. Check source arithmetic,widths/defaults,manual flags,grouped context ordering,pixel change and interval boundaries against pinned originals. Exercise actual point-size control,automatic row geometry,undo/redo,scroll/hit positions and same-model ODS row-style persistence at1280/390 using fresh build;large24pt text must fit its actual row vertically. Run types/build/static,changed-path lint/format,docs/size/tree/dependencies/provenance/resources/scoped inventories,doctor/routing/diff;record evidence and close with clean calc checkout. Full all-app regression is not scheduled until task40 per user cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's explicit source/inventory commit if acceptance fails. Retain task evidence,prior point-size UI and user-owned branch/merge decisions;do not reset other active tasks.

## Findings
