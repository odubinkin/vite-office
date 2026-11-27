---
id: "202611270709-GK0SFZ"
title: "Connect Calc Background to the native Area and brush exchange"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:10:06.997Z"
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
    body: "Start: Replace Calc Background with the shared native palette and typed brush exchange."
events:
  -
    type: "status"
    at: "2026-11-27T07:10:07.434Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Replace Calc Background with the shared native palette and typed brush exchange."
doc_version: 3
doc_updated_at: "2026-11-27T07:10:07.434Z"
doc_updated_by: "CODER"
description: "Replace the browser-only Calc Background form with the pinned SvxBkgTabPage controls, shared palette and preview, original brush exchange, and selected-cell history and ODS verification."
sections:
  Summary: "Use the original Calc Background page with the shared Area palette, preview and real item exchange."
  Scope: "Replace the local select and direct color widget with the pinned SvxBkgTabPage behavior in Calc Format Cells. Expose only the fill families used by Calc and preserve the palette, selected source brush, original comparison, Reset, Cancel and grouped history. Reuse the shared browser Area page and native SVX brush bridge. Document and preserve any verified native color-transfer asymmetry."
  Plan: "Connect the pinned CUI background page, existing palette and brush bridge, and native selected-cell exchange with focused ODS and history checks."
  Verify Steps: |-
    - Run the Calc Format Cells, ODS and shared native fill-item tests.
    - Confirm None/Color, the palette and preview, matching complex-color retention, visited partial opacity, Reset, Cancel, selected-cell grouped undo and ODS round trip.
    - Run Office typecheck, changed-source lint and format, dependency/source-tree checks, source provenance, Calc/shared inventory, routing and doctor. Record inherited integration evidence failures separately.
  Verification: "Pending execution."
  Rollback Plan: "Revert the scoped Background owner, UI and registry changes."
  Findings: "Calc opens the SW/SVX shared Background implementation without optional graphic controls. The source page compares the original brush with the output solid color after converting the actual selection to drawing fill items."
id_source: "generated"
---
## Summary

Use the original Calc Background page with the shared Area palette, preview and real item exchange.

## Scope

Replace the local select and direct color widget with the pinned SvxBkgTabPage behavior in Calc Format Cells. Expose only the fill families used by Calc and preserve the palette, selected source brush, original comparison, Reset, Cancel and grouped history. Reuse the shared browser Area page and native SVX brush bridge. Document and preserve any verified native color-transfer asymmetry.

## Plan

Connect the pinned CUI background page, existing palette and brush bridge, and native selected-cell exchange with focused ODS and history checks.

## Verify Steps

- Run the Calc Format Cells, ODS and shared native fill-item tests.
- Confirm None/Color, the palette and preview, matching complex-color retention, visited partial opacity, Reset, Cancel, selected-cell grouped undo and ODS round trip.
- Run Office typecheck, changed-source lint and format, dependency/source-tree checks, source provenance, Calc/shared inventory, routing and doctor. Record inherited integration evidence failures separately.

## Verification

Pending execution.

## Rollback Plan

Revert the scoped Background owner, UI and registry changes.

## Findings

Calc opens the SW/SVX shared Background implementation without optional graphic controls. The source page compares the original brush with the output solid color after converting the actual selection to drawing fill items.
