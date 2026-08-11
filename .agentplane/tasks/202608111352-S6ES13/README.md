---
id: "202608111352-S6ES13"
title: "Make Writer top-level menus open reliably"
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
  updated_at: "2026-08-11T13:53:02.670Z"
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
    body: "Start: reproduce the Writer menu interaction and make every visible top-level menu affordance open an explicit popup without creating unimplemented commands."
events:
  -
    type: "status"
    at: "2026-08-11T13:53:08.227Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce the Writer menu interaction and make every visible top-level menu affordance open an explicit popup without creating unimplemented commands."
doc_version: 3
doc_updated_at: "2026-08-11T13:53:08.227Z"
doc_updated_by: "CODER"
description: "Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands."
sections:
  Summary: |-
    Make Writer top-level menus open reliably

    Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.
  Scope: |-
    - In scope: Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.
    - Out of scope: unrelated refactors not required for "Make Writer top-level menus open reliably".
  Plan: "1. Inspect and reproduce the production menu interaction. 2. Make all visible top-level Writer menu labels semantic popup triggers, preserving implemented commands and using an explicit unavailable state for command groups with no bounded implementation. 3. Add focused unit and production-browser regression coverage, run fast checks, and record the cadence-deferred aggregate checks."
  Verify Steps: "1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage, including the menu trigger state and its unavailable-command fallback. 2. Run targeted production Playwright coverage. Expected: File, Edit, View, Format, Styles, Insert, Table, Tools, Window, and Help each reveal a visible Writer menu after a click; File exposes its implemented storage commands. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
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

Make Writer top-level menus open reliably

Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.

## Scope

- In scope: Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.
- Out of scope: unrelated refactors not required for "Make Writer top-level menus open reliably".

## Plan

1. Inspect and reproduce the production menu interaction. 2. Make all visible top-level Writer menu labels semantic popup triggers, preserving implemented commands and using an explicit unavailable state for command groups with no bounded implementation. 3. Add focused unit and production-browser regression coverage, run fast checks, and record the cadence-deferred aggregate checks.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage, including the menu trigger state and its unavailable-command fallback. 2. Run targeted production Playwright coverage. Expected: File, Edit, View, Format, Styles, Insert, Table, Tools, Window, and Help each reveal a visible Writer menu after a click; File exposes its implemented storage commands. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
