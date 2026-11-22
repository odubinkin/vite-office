---
id: "202611220105-51SY7G"
title: "Connect Calc cell protection controls and visibility"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202611220050-2Z7YAP"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:06:11.050Z"
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
    body: "Start: connect native cell protection, unlocked selections and model-backed output."
events:
  -
    type: "status"
    at: "2026-11-22T01:06:11.410Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native cell protection, unlocked selections and model-backed output."
doc_version: 3
doc_updated_at: "2026-11-22T01:06:11.410Z"
doc_updated_by: "CODER"
description: "Expose native cell protection toggle and unlocked-cell selection, and apply stored hidden-cell and hidden-formula flags to grid, input line, and native clipboard copies."
sections:
  Summary: |-
    Connect Calc cell protection controls and visibility

    Expose native cell protection toggle and unlocked-cell selection, and apply stored hidden-cell and hidden-formula flags to grid, input line, and native clipboard copies.
  Scope: "Cover SID_SCATTR_CELLPROTECTION and SID_SELECT_UNPROTECTED_CELLS, source cell-protection toggle flags and undo, compressed unlocked selection, and imported protection visibility in normal output, formula view, input line and clipboard. Keep the existing protected-cell attribute storage and selective copy semantics. The full Format Cells dialog, print output and workbook structure protection are separate consumers."
  Plan: "Connect the source CellProtection and SelectUnprotectedCells commands; port clipped attribute-run selection and the existing protection attributes' grid, input line and clipboard projection; retain native request, history, selection and filter semantics."
  Verify Steps: |-
    - Run focused Calc tests for source slots, protected cell visibility, editing, original unprotected-selection regressions, history, clipboard restriction, and ODS protection attributes.
    - Run application typecheck, changed-source lint and format, static build, dependency, Calc resource, source provenance and inventory checks, and AgentPlane routing and doctor.
    - Verify the actual Calc menu commands and new cell selections using local Chromium. This is task six of the current ten-task checkpoint interval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. Existing document field and file representations remain in the original cell and sheet protection owners."
  Findings: ""
id_source: "generated"
---
## Summary

Connect Calc cell protection controls and visibility

Expose native cell protection toggle and unlocked-cell selection, and apply stored hidden-cell and hidden-formula flags to grid, input line, and native clipboard copies.

## Scope

Cover SID_SCATTR_CELLPROTECTION and SID_SELECT_UNPROTECTED_CELLS, source cell-protection toggle flags and undo, compressed unlocked selection, and imported protection visibility in normal output, formula view, input line and clipboard. Keep the existing protected-cell attribute storage and selective copy semantics. The full Format Cells dialog, print output and workbook structure protection are separate consumers.

## Plan

Connect the source CellProtection and SelectUnprotectedCells commands; port clipped attribute-run selection and the existing protection attributes' grid, input line and clipboard projection; retain native request, history, selection and filter semantics.

## Verify Steps

- Run focused Calc tests for source slots, protected cell visibility, editing, original unprotected-selection regressions, history, clipboard restriction, and ODS protection attributes.
- Run application typecheck, changed-source lint and format, static build, dependency, Calc resource, source provenance and inventory checks, and AgentPlane routing and doctor.
- Verify the actual Calc menu commands and new cell selections using local Chromium. This is task six of the current ten-task checkpoint interval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. Existing document field and file representations remain in the original cell and sheet protection owners.

## Findings
