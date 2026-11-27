---
id: "202611271816-5TSN0F"
title: "Apply native Calc ODS sheet backgrounds as cell formatting"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T18:17:15.834Z"
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
    body: "Start: apply original table-family background properties through the native cell pattern."
events:
  -
    type: "status"
    at: "2026-11-27T18:17:16.238Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: apply original table-family background properties through the native cell pattern."
doc_version: 3
doc_updated_at: "2026-11-27T18:17:16.238Z"
doc_updated_by: "CODER"
description: "Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests."
sections:
  Summary: |-
    Apply native Calc ODS sheet backgrounds as cell formatting

    Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.
  Scope: |-
    - In scope: Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.
    - Out of scope: unrelated refactors not required for "Apply native Calc ODS sheet backgrounds as cell formatting".
  Plan: "Follow the pinned table-family background property import and apply color and transparency via native sparse full-sheet cell patterns before cell ranges. The pinned generic table property context ignores the mapped background complex-color child. Preserve and document that source behavior. Export actual cell attributes through the existing ODS automatic styles and Worker. Verify one critical background/override/reopen case and the existing Calc color and ODS style tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Apply native Calc ODS sheet backgrounds as cell formatting". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Apply native Calc ODS sheet backgrounds as cell formatting". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Apply native Calc ODS sheet backgrounds as cell formatting

Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.

## Scope

- In scope: Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.
- Out of scope: unrelated refactors not required for "Apply native Calc ODS sheet backgrounds as cell formatting".

## Plan

Follow the pinned table-family background property import and apply color and transparency via native sparse full-sheet cell patterns before cell ranges. The pinned generic table property context ignores the mapped background complex-color child. Preserve and document that source behavior. Export actual cell attributes through the existing ODS automatic styles and Worker. Verify one critical background/override/reopen case and the existing Calc color and ODS style tests.

## Verify Steps

PLANNER fallback scaffold for "Apply native Calc ODS sheet backgrounds as cell formatting". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Apply native Calc ODS sheet backgrounds as cell formatting". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
