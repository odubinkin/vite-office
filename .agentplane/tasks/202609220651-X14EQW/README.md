---
id: "202609220651-X14EQW"
title: "Remove inventory-system changes from parity plan"
status: "DOING"
priority: "med"
owner: "DOCS"
revision: 14
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
doc_updated_at: "2026-09-22T07:00:44.748Z"
doc_updated_by: "DOCS"
description: "Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements."
sections:
  Summary: |-
    Remove inventory-system changes from parity plan

    Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.
  Scope: "Edit only docs/program/vite-office-upstream-parity-plan.md. Remove all standalone inventory remediation and all proposed inventory schema, tooling, report, validator, ledger, or deterministic-check work. Plan code changes only; each task updates existing inventory records only for the source files and capabilities it changes."
  Plan: "1. Treat current inventory inconsistencies only as audit context. 2. Start execution with code contract/default corrections rather than inventory cleanup. 3. Require valid updates to existing inventory records only when related source files or capabilities change. 4. Explicitly leave unrelated legacy records and all inventory mechanisms untouched."
  Verify Steps: "1. Confirm the plan has no standalone inventory cleanup phase or work item. 2. Confirm it proposes no inventory schema, tooling, report, validator, ledger, parity-gate, or deterministic-check changes. 3. Confirm every code task must update only related existing inventory records and leave unrelated records untouched. 4. Run Prettier check, git diff --check, routing validation, and ap doctor."
  Verification: "Command: npx prettier --check docs/program/vite-office-upstream-parity-plan.md — Result: pass. Command: git diff --check — Result: pass. Command: targeted Node content assertion — Result: pass; required code-only/related-record language present and all forbidden inventory-system work items absent. Command: node .agentplane/policy/check-routing.mjs — Result: pass. Command: ap doctor — Result: pass with only the existing historical-task warning and fallback-hook information."
  Rollback Plan: "Revert only this task commit; do not alter unrelated working-tree changes."
  Findings: "The plan now contains no standalone inventory remediation. Current inventory inconsistencies remain audit context only. Inventory work is limited to valid updates of existing records directly associated with source files or capabilities changed by each code task; unrelated records and all inventory mechanisms remain untouched."
id_source: "generated"
---
## Summary

Remove inventory-system changes from parity plan

Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.

## Scope

Edit only docs/program/vite-office-upstream-parity-plan.md. Remove all standalone inventory remediation and all proposed inventory schema, tooling, report, validator, ledger, or deterministic-check work. Plan code changes only; each task updates existing inventory records only for the source files and capabilities it changes.

## Plan

1. Treat current inventory inconsistencies only as audit context. 2. Start execution with code contract/default corrections rather than inventory cleanup. 3. Require valid updates to existing inventory records only when related source files or capabilities change. 4. Explicitly leave unrelated legacy records and all inventory mechanisms untouched.

## Verify Steps

1. Confirm the plan has no standalone inventory cleanup phase or work item. 2. Confirm it proposes no inventory schema, tooling, report, validator, ledger, parity-gate, or deterministic-check changes. 3. Confirm every code task must update only related existing inventory records and leave unrelated records untouched. 4. Run Prettier check, git diff --check, routing validation, and ap doctor.

## Verification

Command: npx prettier --check docs/program/vite-office-upstream-parity-plan.md — Result: pass. Command: git diff --check — Result: pass. Command: targeted Node content assertion — Result: pass; required code-only/related-record language present and all forbidden inventory-system work items absent. Command: node .agentplane/policy/check-routing.mjs — Result: pass. Command: ap doctor — Result: pass with only the existing historical-task warning and fallback-hook information.

## Rollback Plan

Revert only this task commit; do not alter unrelated working-tree changes.

## Findings

The plan now contains no standalone inventory remediation. Current inventory inconsistencies remain audit context only. Inventory work is limited to valid updates of existing records directly associated with source files or capabilities changed by each code task; unrelated records and all inventory mechanisms remain untouched.
