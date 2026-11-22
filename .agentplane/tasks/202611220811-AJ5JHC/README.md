---
id: "202611220811-AJ5JHC"
title: "Align Writer checkpoint verification with the connected native UI"
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
  updated_at: "2026-11-22T08:12:05.610Z"
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
    at: "2026-11-22T08:12:30.759Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T08:12:30.759Z"
doc_updated_by: "CODER"
description: "Correct Writer browser and inventory expectations exposed by the ten-task full run, preserving production behavior and keeping the full run in progress."
sections:
  Summary: |-
    Align Writer checkpoint verification with the connected native UI

    Correct Writer browser and inventory expectations exposed by the ten-task full run, preserving production behavior and keeping the full run in progress.
  Scope: "Read-only Writer runtime. Update exact Writer keyboard navigation, paragraph border unit, and Writer report fixtures surfaced by the ten-task checkpoint."
  Plan: "Confirm full-run failures with pinned native menu and current dialog source, and update only the obsolete Writer test fixtures. Preserve initial failure logs and rerun the affected cases."
  Verify Steps: "Rerun the affected Chromium foundation and formatting specs on the standard centimeter profile and the affected Writer inventory and hint-ID fixtures. Run scoped lint, formatting, routing and diff checks."
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

Align Writer checkpoint verification with the connected native UI

Correct Writer browser and inventory expectations exposed by the ten-task full run, preserving production behavior and keeping the full run in progress.

## Scope

Read-only Writer runtime. Update exact Writer keyboard navigation, paragraph border unit, and Writer report fixtures surfaced by the ten-task checkpoint.

## Plan

Confirm full-run failures with pinned native menu and current dialog source, and update only the obsolete Writer test fixtures. Preserve initial failure logs and rerun the affected cases.

## Verify Steps

Rerun the affected Chromium foundation and formatting specs on the standard centimeter profile and the affected Writer inventory and hint-ID fixtures. Run scoped lint, formatting, routing and diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
