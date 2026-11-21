---
id: "202611211736-V4SBB6"
title: "Align Calc ODS named ranges and expressions with LibreOffice"
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
  updated_at: "2026-11-21T17:36:30.885Z"
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
    body: "Start: port native named definitions across ODS parsing, formula compilation and export."
events:
  -
    type: "status"
    at: "2026-11-21T17:36:35.241Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native named definitions across ODS parsing, formula compilation and export."
doc_version: 3
doc_updated_at: "2026-11-21T17:36:35.241Z"
doc_updated_by: "CODER"
description: "Port named range address conversion, per-definition formula grammar and base resolution, native reference classification and export of named ranges and expressions. Verify pinned hidden and global fixtures, qualified references, and Worker transfer."
sections:
  Summary: "Align Calc ODS named range and expression import/export with pinned LibreOffice."
  Scope: "Calc XML name contexts, range-address conversion and formula grammar, base-address lookup, native name type and reference detection, qualified reference compilation, ODS export and existing Worker round trips. Preserve workbook and local scope. Run the original hidden/global fixture assertions supported by the current model."
  Plan: "Port the named-range address conversion and native storage grammar selection. Use the original base-address conversion, preserve native name flags and distinguish compiled references from formulas on export. Verify qualified and relative ranges, hidden names, source fixtures, and the same definitions after Worker transfer."
  Verify Steps: "Run targeted Calc named range, formula reference, ODS XML, print range and Worker tests. Verify original ODS fixture values, hidden range and expression flags, qualified/relative ranges, storage grammar, and base-address fallback. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor and git whitespace checks."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Calc ODS named range and expression import/export with pinned LibreOffice.

## Scope

Calc XML name contexts, range-address conversion and formula grammar, base-address lookup, native name type and reference detection, qualified reference compilation, ODS export and existing Worker round trips. Preserve workbook and local scope. Run the original hidden/global fixture assertions supported by the current model.

## Plan

Port the named-range address conversion and native storage grammar selection. Use the original base-address conversion, preserve native name flags and distinguish compiled references from formulas on export. Verify qualified and relative ranges, hidden names, source fixtures, and the same definitions after Worker transfer.

## Verify Steps

Run targeted Calc named range, formula reference, ODS XML, print range and Worker tests. Verify original ODS fixture values, hidden range and expression flags, qualified/relative ranges, storage grammar, and base-address fallback. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor and git whitespace checks.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
