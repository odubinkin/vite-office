---
id: "202611220454-J67X7M"
title: "Connect Writer Page Style text grid controls and paint"
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
  updated_at: "2026-11-22T04:54:49.479Z"
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
    at: "2026-11-22T04:55:20.863Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T04:55:20.863Z"
doc_updated_by: "CODER"
description: "Connect the existing native text-grid page item, body grid metrics and paragraph snapping to an upstream-shaped Page Style tab, preview, and screen and print paint."
sections:
  Summary: |-
    Connect Writer Page Style text grid controls and paint

    Connect the existing native text-grid page item, body grid metrics and paragraph snapping to an upstream-shaped Page Style tab, preview, and screen and print paint.
  Scope: "Writer Page Style Text Grid and the existing RES_TEXTGRID exchange, native grid calculations, page body and ruler-facing measurements where present, live preview and browser screen and print composition. Scope includes Writer UI routing, the existing document option and transport boundaries where needed, focused tests, registry entries, and upstream observations if verified."
  Plan: "Follow Writer SwTemplateDlgController, SwTextGridPage and textgridpage.ui for controls, sensitivity, point units and grid preview. Preserve the current Writer Asian typography availability and upstream HTML-mode gate. Reuse SwTextGridItem, native page history/format transport and paragraph grid metrics. Connect body alignment and grid drawing to the native page layout and paint ownership. Keep print and display flags independent in stored content and follow their upstream coupling in the dialog. Record proven upstream issues while retaining the corresponding logic."
  Verify Steps: "Run focused Writer grid-item, grid-page, core layout, paragraph grid line spacing, Page Style, page format ODT and Worker tests. Verify original field defaults, modes and dependencies, live dialog preview, screen/print paint, cancel, undo and redo. Run focused Chromium Page Style scenarios and office production build. Check scoped lint, formatting, module boundaries, source-tree and provenance, Writer resources, doctor and routing. Existing global Calc documentation and size findings are baseline. Defer the full run to the ten-task checkpoint."
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

Connect Writer Page Style text grid controls and paint

Connect the existing native text-grid page item, body grid metrics and paragraph snapping to an upstream-shaped Page Style tab, preview, and screen and print paint.

## Scope

Writer Page Style Text Grid and the existing RES_TEXTGRID exchange, native grid calculations, page body and ruler-facing measurements where present, live preview and browser screen and print composition. Scope includes Writer UI routing, the existing document option and transport boundaries where needed, focused tests, registry entries, and upstream observations if verified.

## Plan

Follow Writer SwTemplateDlgController, SwTextGridPage and textgridpage.ui for controls, sensitivity, point units and grid preview. Preserve the current Writer Asian typography availability and upstream HTML-mode gate. Reuse SwTextGridItem, native page history/format transport and paragraph grid metrics. Connect body alignment and grid drawing to the native page layout and paint ownership. Keep print and display flags independent in stored content and follow their upstream coupling in the dialog. Record proven upstream issues while retaining the corresponding logic.

## Verify Steps

Run focused Writer grid-item, grid-page, core layout, paragraph grid line spacing, Page Style, page format ODT and Worker tests. Verify original field defaults, modes and dependencies, live dialog preview, screen/print paint, cancel, undo and redo. Run focused Chromium Page Style scenarios and office production build. Check scoped lint, formatting, module boundaries, source-tree and provenance, Writer resources, doctor and routing. Existing global Calc documentation and size findings are baseline. Defer the full run to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
