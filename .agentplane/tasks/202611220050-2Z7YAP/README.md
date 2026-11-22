---
id: "202611220050-2Z7YAP"
title: "Connect Calc sheet protection and edit permissions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202611220023-1ZKRD0"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T00:50:55.485Z"
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
    body: "Start: connect native Calc sheet protection and verify existing model and filter behavior."
events:
  -
    type: "status"
    at: "2026-11-22T00:50:55.838Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc sheet protection and verify existing model and filter behavior."
doc_version: 3
doc_updated_at: "2026-11-22T00:50:55.838Z"
doc_updated_by: "CODER"
description: "Expose the native Calc sheet protection command, original protection and password prompts, and existing sheet protection state through menus, tabs, and document history."
sections:
  Summary: |-
    Connect Calc sheet protection and edit permissions

    Expose the native Calc sheet protection command, original protection and password prompts, and existing sheet protection state through menus, tabs, and document history.
  Scope: "Cover the source FID_PROTECT_TABLE flow, spreadsheet sheet options and credentials, supported imported verifiers, grouped native document operations, tab lock presentation and original undo semantics. Preserve current save and open policy. The workbook structure and file-level protection commands are separate."
  Plan: "Connect the pinned view and document protection commands for sheets, existing protection storage, native options and password prompts, selected tabs, checked and tab lock presentation, and protection-specific history. Verify both newly protected and imported protected sheets in the existing document format flow."
  Verify Steps: |-
    - Run targeted Calc tests for native sheet protection, original dialog order and defaults, password input and verification, selection and edit restrictions, grouped Undo and Redo and ODS round trip. Port the protectSheet.py regression.
    - Run repository typecheck, changed-source lint and format, source tree, dependencies, provenance and Calc resources, inventory, AgentPlane routing and doctor.
    - Verify the actual Calc protection command and dialog in local production Chromium. This is task five of the ten-task checkpoint interval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. Imported protection remains in the existing ScTableProtection record."
  Findings: ""
id_source: "generated"
---
## Summary

Connect Calc sheet protection and edit permissions

Expose the native Calc sheet protection command, original protection and password prompts, and existing sheet protection state through menus, tabs, and document history.

## Scope

Cover the source FID_PROTECT_TABLE flow, spreadsheet sheet options and credentials, supported imported verifiers, grouped native document operations, tab lock presentation and original undo semantics. Preserve current save and open policy. The workbook structure and file-level protection commands are separate.

## Plan

Connect the pinned view and document protection commands for sheets, existing protection storage, native options and password prompts, selected tabs, checked and tab lock presentation, and protection-specific history. Verify both newly protected and imported protected sheets in the existing document format flow.

## Verify Steps

- Run targeted Calc tests for native sheet protection, original dialog order and defaults, password input and verification, selection and edit restrictions, grouped Undo and Redo and ODS round trip. Port the protectSheet.py regression.
- Run repository typecheck, changed-source lint and format, source tree, dependencies, provenance and Calc resources, inventory, AgentPlane routing and doctor.
- Verify the actual Calc protection command and dialog in local production Chromium. This is task five of the ten-task checkpoint interval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. Imported protection remains in the existing ScTableProtection record.

## Findings
