---
id: "202611280746-Q216GP"
title: "Port ODS numeric format placeholders and scientific text"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T07:46:13.456Z"
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
    body: "Start: align shared ODF number format XML and formatter round trips against the original Calc regressions."
events:
  -
    type: "status"
    at: "2026-11-28T07:46:14.389Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align shared ODF number format XML and formatter round trips against the original Calc regressions."
doc_version: 3
doc_updated_at: "2026-11-28T07:46:14.389Z"
doc_updated_by: "CODER"
description: "Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers."
sections:
  Summary: |-
    Port ODS numeric format placeholders and scientific text

    Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.
  Scope: |-
    - In scope: Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.
    - Out of scope: unrelated refactors not required for "Port ODS numeric format placeholders and scientific text".
  Plan: "Read the pinned native XML number importer, exporter and formatter scanner. Port the fixed-width padding metadata on text and embedded text, native integer/decimal/exponent placeholder semantics, exponent case and sign, and native positioned text across mantissa and exponent. Keep existing ODF stream version and formatter ownership. Replay the relevant pinned Calc ODS save/reload fixtures and verify related Calc and Writer number-style consumers plus static and parity checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port ODS numeric format placeholders and scientific text". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port ODS numeric format placeholders and scientific text". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Port ODS numeric format placeholders and scientific text

Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.

## Scope

- In scope: Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.
- Out of scope: unrelated refactors not required for "Port ODS numeric format placeholders and scientific text".

## Plan

Read the pinned native XML number importer, exporter and formatter scanner. Port the fixed-width padding metadata on text and embedded text, native integer/decimal/exponent placeholder semantics, exponent case and sign, and native positioned text across mantissa and exponent. Keep existing ODF stream version and formatter ownership. Replay the relevant pinned Calc ODS save/reload fixtures and verify related Calc and Writer number-style consumers plus static and parity checks.

## Verify Steps

PLANNER fallback scaffold for "Port ODS numeric format placeholders and scientific text". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port ODS numeric format placeholders and scientific text". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
