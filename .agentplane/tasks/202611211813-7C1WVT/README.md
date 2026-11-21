---
id: "202611211813-7C1WVT"
title: "Connect Calc row and column label ranges"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:14:01.104Z"
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
    body: "Start: Connect native paired label ranges across Calc document, formula, ODS and reference dialog."
events:
  -
    type: "status"
    at: "2026-11-21T18:14:01.529Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native paired label ranges across Calc document, formula, ODS and reference dialog."
doc_version: 3
doc_updated_at: "2026-11-21T18:14:01.529Z"
doc_updated_by: "CODER"
description: "Connect document label range pairs, native formula references, ODS persistence and the Define Label Range ref dialog."
sections:
  Summary: "Enable the original Calc Define Label Range command with document-owned explicit column and row label mappings."
  Scope: "Calc range pair ownership, explicit label reference scanning and evaluation, ODS label ranges, shared formula-token hooks if necessary, source-shaped modal and reference input, corresponding tests and registry evidence. Task 4 of the approved ten-task verification cycle."
  Plan: "Wire the existing ScRangePairList and column/row label tokens to the pinned source semantics. Port the dialog state, orientation and overlap rules, existing labels, Add, Delete, grid reference input and OK/Cancel behavior. Keep stored pairs and references consistent across ODS load and save."
  Verify Steps: "Run focused Calc label-range, range-pair, formula, workbook interaction, and ODS tests including the pinned tdf131170 delete-button regression. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor."
  Verification: "Pending implementation and focused verification."
  Rollback Plan: "Revert the source commit for this task to restore the previous label-range and formula behavior."
  Findings: "Pending upstream comparison."
id_source: "generated"
---
## Summary

Enable the original Calc Define Label Range command with document-owned explicit column and row label mappings.

## Scope

Calc range pair ownership, explicit label reference scanning and evaluation, ODS label ranges, shared formula-token hooks if necessary, source-shaped modal and reference input, corresponding tests and registry evidence. Task 4 of the approved ten-task verification cycle.

## Plan

Wire the existing ScRangePairList and column/row label tokens to the pinned source semantics. Port the dialog state, orientation and overlap rules, existing labels, Add, Delete, grid reference input and OK/Cancel behavior. Keep stored pairs and references consistent across ODS load and save.

## Verify Steps

Run focused Calc label-range, range-pair, formula, workbook interaction, and ODS tests including the pinned tdf131170 delete-button regression. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor.

## Verification

Pending implementation and focused verification.

## Rollback Plan

Revert the source commit for this task to restore the previous label-range and formula behavior.

## Findings

Pending upstream comparison.
