---
id: "202611271109-QDA3NS"
title: "Preserve native Calc data validation rules in ODS"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:09:17.919Z"
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
    at: "2026-11-27T11:09:18.370Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T11:09:18.370Z"
doc_updated_by: "CODER"
description: "Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel."
sections:
  Summary: |-
    Preserve native Calc data validation rules in ODS

    Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.
  Scope: |-
    - In scope: Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.
    - Out of scope: unrelated refactors not required for "Preserve native Calc data validation rules in ODS".
  Plan: "1. Port ScValidationData and the document-owned rule list, reusing the native condition entry and cell pattern attribute. 2. Port ODF validation declarations, condition/message processing, and binding to loaded and exported cell ranges, with Worker graph transport. 3. Transfer the pinned dataValidity.ods checks, including formulas in the represented model, and run relevant static and focused existing tests."
  Verify Steps: "Check the complete pinned dataValidity.ods case for rule identity, base cells, messages, expected ranges and native condition operands. Verify the same selections and original cell values after Worker transport and ODS reopen. Run existing associated condition, native calc model, and ODS tests plus typecheck, lint, dependency, provenance and Calc inventory checks."
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

Preserve native Calc data validation rules in ODS

Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.

## Scope

- In scope: Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.
- Out of scope: unrelated refactors not required for "Preserve native Calc data validation rules in ODS".

## Plan

1. Port ScValidationData and the document-owned rule list, reusing the native condition entry and cell pattern attribute. 2. Port ODF validation declarations, condition/message processing, and binding to loaded and exported cell ranges, with Worker graph transport. 3. Transfer the pinned dataValidity.ods checks, including formulas in the represented model, and run relevant static and focused existing tests.

## Verify Steps

Check the complete pinned dataValidity.ods case for rule identity, base cells, messages, expected ranges and native condition operands. Verify the same selections and original cell values after Worker transport and ODS reopen. Run existing associated condition, native calc model, and ODS tests plus typecheck, lint, dependency, provenance and Calc inventory checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
