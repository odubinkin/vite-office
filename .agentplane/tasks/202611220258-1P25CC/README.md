---
id: "202611220258-1P25CC"
title: "Connect Writer paragraph area color and transparency"
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
  updated_at: "2026-11-22T02:58:29.862Z"
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
    body: "Start: connect the native paragraph Area and uniform Transparency page exchanges in Writer."
events:
  -
    type: "status"
    at: "2026-11-22T02:58:48.538Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native paragraph Area and uniform Transparency page exchanges in Writer."
doc_version: 3
doc_updated_at: "2026-11-22T02:58:48.538Z"
doc_updated_by: "CODER"
description: "Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips."
sections:
  Summary: |-
    Connect Writer paragraph area color and transparency

    Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.
  Scope: |-
    - In scope: Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.
    - Out of scope: unrelated refactors not required for "Connect Writer paragraph area color and transparency".
  Plan: "Port the represented area/color and uniform transparency exchange using shared native fill items and source-owned CUI page handlers. Add the corresponding Writer paragraph pages after Borders. Keep independent values and unvisited pages untouched, inherit native paint, and bridge existing legacy paragraph brushes. Verify the ordinary Writer command and native document/ODT/Worker paths with focused tests according to the ten-task cadence."
  Verify Steps: "Run targeted Writer paragraph dialog, text/native fill transport, ODT and focused Chromium checks for Area and uniform Transparency. Verify per-field output, mixed selection, inherited values, preview, Undo/Redo, legacy color and transparent override. Run focused shared fill conversion tests, production build, formatting, scoped ESLint, module boundaries, source tree and provenance, Writer resources, doctor and routing. Run repository docs and file-size checks and record applicable baseline failures."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commits and rerun the targeted paragraph, ODT and shared fill conversion checks."
  Findings: ""
id_source: "generated"
---
## Summary

Connect Writer paragraph area color and transparency

Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.

## Scope

- In scope: Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.
- Out of scope: unrelated refactors not required for "Connect Writer paragraph area color and transparency".

## Plan

Port the represented area/color and uniform transparency exchange using shared native fill items and source-owned CUI page handlers. Add the corresponding Writer paragraph pages after Borders. Keep independent values and unvisited pages untouched, inherit native paint, and bridge existing legacy paragraph brushes. Verify the ordinary Writer command and native document/ODT/Worker paths with focused tests according to the ten-task cadence.

## Verify Steps

Run targeted Writer paragraph dialog, text/native fill transport, ODT and focused Chromium checks for Area and uniform Transparency. Verify per-field output, mixed selection, inherited values, preview, Undo/Redo, legacy color and transparent override. Run focused shared fill conversion tests, production build, formatting, scoped ESLint, module boundaries, source tree and provenance, Writer resources, doctor and routing. Run repository docs and file-size checks and record applicable baseline failures.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commits and rerun the targeted paragraph, ODT and shared fill conversion checks.

## Findings
