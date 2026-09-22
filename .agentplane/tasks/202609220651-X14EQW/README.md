---
id: "202609220651-X14EQW"
title: "Remove inventory-system changes from parity plan"
status: "DOING"
priority: "med"
owner: "DOCS"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T06:51:58.517Z"
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
    author: "DOCS"
    body: "Start: revise the parity plan to use the existing inventory strictly without changing its mechanisms or deterministic checks."
events:
  -
    type: "status"
    at: "2026-09-22T06:52:03.462Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: revise the parity plan to use the existing inventory strictly without changing its mechanisms or deterministic checks."
doc_version: 3
doc_updated_at: "2026-09-22T06:52:03.462Z"
doc_updated_by: "DOCS"
description: "Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements."
sections:
  Summary: |-
    Remove inventory-system changes from parity plan

    Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.
  Scope: |-
    - In scope: Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.
    - Out of scope: unrelated refactors not required for "Remove inventory-system changes from parity plan".
  Plan: "Revise only the parity plan: preserve the existing inventory system, require strict accurate population through current mechanisms, remove proposed schema/report/validator/ledger/gate enhancements, and update dependencies and completion criteria."
  Verify Steps: "1. Confirm the plan contains no work item proposing inventory schema, validator, report, ledger, or deterministic-gate development. 2. Confirm it explicitly requires complete and correct use of the existing inventory mechanisms. 3. Run Prettier check, git diff --check, routing validation, and ap doctor."
  Verification: "Pending execution."
  Rollback Plan: "Revert only this task commit; do not alter unrelated working-tree changes."
  Findings: "Pending."
id_source: "generated"
---
## Summary

Remove inventory-system changes from parity plan

Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.

## Scope

- In scope: Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.
- Out of scope: unrelated refactors not required for "Remove inventory-system changes from parity plan".

## Plan

Revise only the parity plan: preserve the existing inventory system, require strict accurate population through current mechanisms, remove proposed schema/report/validator/ledger/gate enhancements, and update dependencies and completion criteria.

## Verify Steps

1. Confirm the plan contains no work item proposing inventory schema, validator, report, ledger, or deterministic-gate development. 2. Confirm it explicitly requires complete and correct use of the existing inventory mechanisms. 3. Run Prettier check, git diff --check, routing validation, and ap doctor.

## Verification

Pending execution.

## Rollback Plan

Revert only this task commit; do not alter unrelated working-tree changes.

## Findings

Pending.
