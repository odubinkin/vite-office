---
id: "202609220651-X14EQW"
title: "Remove inventory-system changes from parity plan"
status: "DOING"
priority: "med"
owner: "DOCS"
revision: 19
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
doc_updated_at: "2026-09-22T07:04:13.595Z"
doc_updated_by: "DOCS"
description: "Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements."
sections:
  Summary: |-
    Remove inventory-system changes from parity plan

    Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.
  Scope: "Edit docs/program/vite-office-upstream-parity-plan.md and include the user-requested deletion of docs/program/parity/phase-8-closure.md. Remove standalone inventory remediation and all proposed inventory-system changes. Plan code changes only; each task updates existing inventory records only for changed source files and capabilities."
  Plan: "1. Remove the inventory P0 finding as a planned remediation stream. 2. Remove Phase 0 entirely and begin the code roadmap at Phase 1. 3. Keep inventory counts only as audit context. 4. Require existing inventory updates only for changed source/capability records. 5. Commit the already deleted phase-8 closure document as explicitly requested."
  Verify Steps: "1. Confirm execution phases start at Phase 1 and no inventory remediation phase/finding remains. 2. Confirm no inventory schema, tooling, report, validator, ledger, parity-gate, or deterministic-check work is proposed. 3. Confirm inventory updates are restricted to records related to changed code. 4. Confirm docs/program/parity/phase-8-closure.md is deleted and included in task scope. 5. Run Prettier check, git diff --check, routing validation, and ap doctor."
  Verification: "PASS: plan phases are exactly 1–7; no Phase 0 or standalone inventory-remediation finding remains. Targeted content assertion confirms prohibited inventory-system work items are absent and code-only/related-record constraints are present. docs/program/parity/phase-8-closure.md is absent as requested. npx prettier --check, git diff --check, node .agentplane/policy/check-routing.mjs, and ap doctor pass; doctor reports only the existing historical-task warning and fallback-hook information."
  Rollback Plan: "Revert only this task commit; do not alter unrelated working-tree changes."
  Findings: "Removed the ambiguous inventory P0 block and eliminated Phase 0. The roadmap now starts at Phase 1 with code-level command/default corrections. Inventory is audit context and task-local documentation only: a code task updates the existing records tied to changed sources/capabilities and leaves unrelated records and mechanisms untouched. The user-requested deletion of phase-8-closure.md is included."
id_source: "generated"
---
## Summary

Remove inventory-system changes from parity plan

Revise the upstream parity plan so it requires accurate completion of the existing inventory documentation and mechanisms without proposing schema, validator, gate, or deterministic-check enhancements.

## Scope

Edit docs/program/vite-office-upstream-parity-plan.md and include the user-requested deletion of docs/program/parity/phase-8-closure.md. Remove standalone inventory remediation and all proposed inventory-system changes. Plan code changes only; each task updates existing inventory records only for changed source files and capabilities.

## Plan

1. Remove the inventory P0 finding as a planned remediation stream. 2. Remove Phase 0 entirely and begin the code roadmap at Phase 1. 3. Keep inventory counts only as audit context. 4. Require existing inventory updates only for changed source/capability records. 5. Commit the already deleted phase-8 closure document as explicitly requested.

## Verify Steps

1. Confirm execution phases start at Phase 1 and no inventory remediation phase/finding remains. 2. Confirm no inventory schema, tooling, report, validator, ledger, parity-gate, or deterministic-check work is proposed. 3. Confirm inventory updates are restricted to records related to changed code. 4. Confirm docs/program/parity/phase-8-closure.md is deleted and included in task scope. 5. Run Prettier check, git diff --check, routing validation, and ap doctor.

## Verification

PASS: plan phases are exactly 1–7; no Phase 0 or standalone inventory-remediation finding remains. Targeted content assertion confirms prohibited inventory-system work items are absent and code-only/related-record constraints are present. docs/program/parity/phase-8-closure.md is absent as requested. npx prettier --check, git diff --check, node .agentplane/policy/check-routing.mjs, and ap doctor pass; doctor reports only the existing historical-task warning and fallback-hook information.

## Rollback Plan

Revert only this task commit; do not alter unrelated working-tree changes.

## Findings

Removed the ambiguous inventory P0 block and eliminated Phase 0. The roadmap now starts at Phase 1 with code-level command/default corrections. Inventory is audit context and task-local documentation only: a code task updates the existing records tied to changed sources/capabilities and leaves unrelated records and mechanisms untouched. The user-requested deletion of phase-8-closure.md is included.
