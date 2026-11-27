---
id: "202611270805-Y2PRQD"
title: "Paint native cell orientation and line breaks in the Calc grid"
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
  updated_at: "2026-11-27T08:05:54.016Z"
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
    at: "2026-11-27T08:06:02.320Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T08:06:02.320Z"
doc_updated_by: "CODER"
description: "Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice."
sections:
  Summary: |-
    Paint native cell orientation and line breaks in the Calc grid

    Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice.
  Scope: "Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice."
  Plan: "Trace native geometry and triage text modes, integrate the regular grid display path, and verify loaded and edited styles with focused browser and native tests."
  Verify Steps: |-
    - Trace the pinned ScOutputData and ScPatternAttr orientation and line-break decisions and the existing browser grid entry points.
    - Verify the real Format Cells to grid path, conditional cell patterns, wrapped and stacked text, Asian layout, quarter-turn and represented rotation reference modes, and undo and ODS reopen. Keep existing grid selection and input tests targeted.
    - Run Office typecheck, changed-source lint/format/JSDoc, dependency and source structure, scoped provenance, inventory, routing and doctor. Record unrelated integration metadata failures separately.
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

Paint native cell orientation and line breaks in the Calc grid

Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice.

## Scope

Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice.

## Plan

Trace native geometry and triage text modes, integrate the regular grid display path, and verify loaded and edited styles with focused browser and native tests.

## Verify Steps

- Trace the pinned ScOutputData and ScPatternAttr orientation and line-break decisions and the existing browser grid entry points.
- Verify the real Format Cells to grid path, conditional cell patterns, wrapped and stacked text, Asian layout, quarter-turn and represented rotation reference modes, and undo and ODS reopen. Keep existing grid selection and input tests targeted.
- Run Office typecheck, changed-source lint/format/JSDoc, dependency and source structure, scoped provenance, inventory, routing and doctor. Record unrelated integration metadata failures separately.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
