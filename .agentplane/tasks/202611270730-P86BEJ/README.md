---
id: "202611270730-P86BEJ"
title: "Connect Calc Alignment to the native CUI control and item exchange"
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
  updated_at: "2026-11-27T07:31:05.584Z"
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
    at: "2026-11-27T07:31:13.134Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T07:31:13.134Z"
doc_updated_by: "CODER"
description: "Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy."
sections:
  Summary: |-
    Connect Calc Alignment to the native CUI control and item exchange

    Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy.
  Scope: "Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy."
  Plan: "Model the native selection and exchange, connect the orientation and alignment controls, and verify original source UI cases, grouped history and ODS."
  Verify Steps: |-
    - Port and run the pinned Calc formatCells.py Alignment scenario. Verify direction, indent, stacked text, wrap and hyphenation through reopen.
    - Run targeted Calc Format Cells, alignment/angle owner, selected-cell history and ODS tests. Cover native three reference edges, dial and angle synchronization, mixed values, enablement rules, Reset and Cancel.
    - Run Office typecheck, changed-source lint, format and JSDoc, source/dependency structure, scoped provenance, Calc and shared inventories, routing and doctor. Record unchanged integration diagnostics separately.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Connect Calc Alignment to the native CUI control and item exchange

Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy.

## Scope

Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy.

## Plan

Model the native selection and exchange, connect the orientation and alignment controls, and verify original source UI cases, grouped history and ODS.

## Verify Steps

- Port and run the pinned Calc formatCells.py Alignment scenario. Verify direction, indent, stacked text, wrap and hyphenation through reopen.
- Run targeted Calc Format Cells, alignment/angle owner, selected-cell history and ODS tests. Cover native three reference edges, dial and angle synchronization, mixed values, enablement rules, Reset and Cancel.
- Run Office typecheck, changed-source lint, format and JSDoc, source/dependency structure, scoped provenance, Calc and shared inventories, routing and doctor. Record unchanged integration diagnostics separately.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
