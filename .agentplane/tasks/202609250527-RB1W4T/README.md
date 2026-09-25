---
id: "202609250527-RB1W4T"
title: "Align supported Insert Table dialog with pinned Writer UI"
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
  updated_at: "2026-09-25T05:29:01.171Z"
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
    at: "2026-09-25T05:29:10.632Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-25T05:29:10.632Z"
doc_updated_by: "CODER"
description: "Keep only supported native Insert Table fields in the insertion dialog and move geometry editing to the existing Table Properties interaction; update tests and verify"
sections:
  Summary: |-
    Align supported Insert Table dialog with pinned Writer UI

    Keep only supported native Insert Table fields in the insertion dialog and move geometry editing to the existing Table Properties interaction; update tests and verify
  Scope: |-
    - In scope: Keep only supported native Insert Table fields in the insertion dialog and move geometry editing to the existing Table Properties interaction; update tests and verify.
    - Out of scope: unrelated refactors not required for "Align supported Insert Table dialog with pinned Writer UI".
  Plan: "1. Restrict Insert Table to supported upstream General fields (Name, Rows, Columns), keeping geometry controls in Table Properties. 2. Update focused dialog tests for insertion and properties behavior. 3. Run npm run verify, record quality evidence, and close the task with traceable commits."
  Verify Steps: "1. Inspect Insert Table: Name, Rows, and Columns appear; geometry controls do not. 2. Inspect Table Properties: existing geometry controls remain functional, including validation. 3. Run npm run verify and routing validation; all checks pass. 4. Confirm only supported toolbar commands remain and git tracked state is clean after task closure."
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

Align supported Insert Table dialog with pinned Writer UI

Keep only supported native Insert Table fields in the insertion dialog and move geometry editing to the existing Table Properties interaction; update tests and verify

## Scope

- In scope: Keep only supported native Insert Table fields in the insertion dialog and move geometry editing to the existing Table Properties interaction; update tests and verify.
- Out of scope: unrelated refactors not required for "Align supported Insert Table dialog with pinned Writer UI".

## Plan

1. Restrict Insert Table to supported upstream General fields (Name, Rows, Columns), keeping geometry controls in Table Properties. 2. Update focused dialog tests for insertion and properties behavior. 3. Run npm run verify, record quality evidence, and close the task with traceable commits.

## Verify Steps

1. Inspect Insert Table: Name, Rows, and Columns appear; geometry controls do not. 2. Inspect Table Properties: existing geometry controls remain functional, including validation. 3. Run npm run verify and routing validation; all checks pass. 4. Confirm only supported toolbar commands remain and git tracked state is clean after task closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
