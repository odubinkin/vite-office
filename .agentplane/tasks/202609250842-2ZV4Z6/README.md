---
id: "202609250842-2ZV4Z6"
title: "Match supported Writer rendering and print output to LibreOffice"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T08:43:35.592Z"
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
    body: "Start: Implement approved LibreOffice rendering parity for supported Writer formatting, table pagination and print-only document presentation."
events:
  -
    type: "status"
    at: "2026-09-25T08:43:36.303Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved LibreOffice rendering parity for supported Writer formatting, table pagination and print-only document presentation."
doc_version: 3
doc_updated_at: "2026-09-25T08:43:36.303Z"
doc_updated_by: "CODER"
description: "Correct existing supported ODT style defaults, text geometry, page filling, table layout and print presentation against vendored LibreOffice and the supplied certification document; printed pages contain only document content."
sections:
  Summary: |-
    Match supported Writer rendering and print output to LibreOffice

    Correct existing supported ODT style defaults, text geometry, page filling, table layout and print presentation against vendored LibreOffice and the supplied certification document; printed pages contain only document content.
  Scope: "In scope: existing supported ODT character and paragraph properties, defaults, page geometry, text shaping and pagination, table sizing and page splitting, and print-only document projection. Compare supplied certification ODT against LibreOffice and vendored source. No new ODT feature families or network access."
  Plan: "1. Reproduce ODT and table/print discrepancies; map each to vendored LibreOffice symbols and current core/UI paths. 2. Correct core defaults, style resolution, text and table layout while preserving source ownership and public interfaces. 3. Make browser projection and print output use document geometry and hide all editor-only controls and states. 4. Add targeted differential and browser print assertions; run focused checks, then npm run verify, inspect diff and finish."
  Verify Steps: "1. Supplied certification ODT renders with the same first-page content boundary, paragraph wraps, spacing, font metrics and page geometry as local LibreOffice reference. 2. Supported tables wrap cell content, use document widths and row heights, paginate without internal scrolling or clipped content, and preserve ODT table formatting. 3. Browser print/PDF of selected table row and active text contains only document content and formatting: no editor selection, focus, buttons, rulers, handles, helper borders or scrolling artifacts. 4. Focused model, import, layout and browser tests pass; npm run verify passes on final code. 5. Record upstream file/symbol evidence, residual parity gaps, task-scoped diff and clean tracked checkout."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commit and rerun focused Writer layout and print tests plus npm run verify."
  Findings: ""
id_source: "generated"
---
## Summary

Match supported Writer rendering and print output to LibreOffice

Correct existing supported ODT style defaults, text geometry, page filling, table layout and print presentation against vendored LibreOffice and the supplied certification document; printed pages contain only document content.

## Scope

In scope: existing supported ODT character and paragraph properties, defaults, page geometry, text shaping and pagination, table sizing and page splitting, and print-only document projection. Compare supplied certification ODT against LibreOffice and vendored source. No new ODT feature families or network access.

## Plan

1. Reproduce ODT and table/print discrepancies; map each to vendored LibreOffice symbols and current core/UI paths. 2. Correct core defaults, style resolution, text and table layout while preserving source ownership and public interfaces. 3. Make browser projection and print output use document geometry and hide all editor-only controls and states. 4. Add targeted differential and browser print assertions; run focused checks, then npm run verify, inspect diff and finish.

## Verify Steps

1. Supplied certification ODT renders with the same first-page content boundary, paragraph wraps, spacing, font metrics and page geometry as local LibreOffice reference. 2. Supported tables wrap cell content, use document widths and row heights, paginate without internal scrolling or clipped content, and preserve ODT table formatting. 3. Browser print/PDF of selected table row and active text contains only document content and formatting: no editor selection, focus, buttons, rulers, handles, helper borders or scrolling artifacts. 4. Focused model, import, layout and browser tests pass; npm run verify passes on final code. 5. Record upstream file/symbol evidence, residual parity gaps, task-scoped diff and clean tracked checkout.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit and rerun focused Writer layout and print tests plus npm run verify.

## Findings
