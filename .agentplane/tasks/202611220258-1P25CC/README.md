---
id: "202611220258-1P25CC"
title: "Connect Writer paragraph area color and transparency"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
doc_updated_at: "2026-11-22T03:07:58.498Z"
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
  Findings: |-
    - Connected the original Area and Transparency tabs to the native paragraph command and pooled fill deltas. None, solid color, and uniform transparency are the represented paragraph fill modes.
    - Verified mixed selections, inherited and legacy brush colors, cancellation, undo/redo, Worker transport, ODT reopening, and visible Chromium paint. The two focused suites passed 60 Writer tests and 14 shared tests. The independent Writer resource check passed its 2 tests. The production build and 1 focused Chromium scenario passed.
    - Scoped ESLint, Prettier, git diff check, module boundaries, source tree, source provenance, Writer resource checks, AgentPlane doctor, and policy routing passed.
    - Global JSDoc checking still reports 307 pre-existing Calc diagnostics. Global source-size checking still reports the pre-existing 1,001-line Calc document codec. The modified Writer source files meet the size gate. The full test suite is deferred to the user's ten-task checkpoint.
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

- Connected the original Area and Transparency tabs to the native paragraph command and pooled fill deltas. None, solid color, and uniform transparency are the represented paragraph fill modes.
- Verified mixed selections, inherited and legacy brush colors, cancellation, undo/redo, Worker transport, ODT reopening, and visible Chromium paint. The two focused suites passed 60 Writer tests and 14 shared tests. The independent Writer resource check passed its 2 tests. The production build and 1 focused Chromium scenario passed.
- Scoped ESLint, Prettier, git diff check, module boundaries, source tree, source provenance, Writer resource checks, AgentPlane doctor, and policy routing passed.
- Global JSDoc checking still reports 307 pre-existing Calc diagnostics. Global source-size checking still reports the pre-existing 1,001-line Calc document codec. The modified Writer source files meet the size gate. The full test suite is deferred to the user's ten-task checkpoint.
