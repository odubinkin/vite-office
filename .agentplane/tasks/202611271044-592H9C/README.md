---
id: "202611271044-592H9C"
title: "Use native storage grammar for ODS formulas and named expressions"
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
  updated_at: "2026-11-27T10:44:58.875Z"
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
    at: "2026-11-27T10:45:06.598Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T10:45:06.598Z"
doc_updated_by: "CODER"
description: "Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice."
sections:
  Summary: |-
    Use native storage grammar for ODS formulas and named expressions

    Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.
  Scope: |-
    - In scope: Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.
    - Out of scope: unrelated refactors not required for "Use native storage grammar for ODS formulas and named expressions".
  Plan: "1. Port the original ScDocument ODF storage grammar and version selection. 2. Share native namespace extraction across scalar and matrix cells, names and style condition consumers; keep package export in the current ODF version. 3. Verify formula calculation and storage through the legacy package, clone boundary and reopened modern package, then record source mappings."
  Verify Steps: |-
    1. Verify the pinned legacy formula package where represented, plus modern namespace and unqualified legacy scalar, matrix and named definitions.
    2. Recalculate through model, Worker and ODS reopen. Run existing related compiler, ODS and formula graph tests without coverage thresholds.
    3. Run Office typecheck, lint, formatting, dependency and provenance checks plus Calc inventory.
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

Use native storage grammar for ODS formulas and named expressions

Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.

## Scope

- In scope: Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.
- Out of scope: unrelated refactors not required for "Use native storage grammar for ODS formulas and named expressions".

## Plan

1. Port the original ScDocument ODF storage grammar and version selection. 2. Share native namespace extraction across scalar and matrix cells, names and style condition consumers; keep package export in the current ODF version. 3. Verify formula calculation and storage through the legacy package, clone boundary and reopened modern package, then record source mappings.

## Verify Steps

1. Verify the pinned legacy formula package where represented, plus modern namespace and unqualified legacy scalar, matrix and named definitions.
2. Recalculate through model, Worker and ODS reopen. Run existing related compiler, ODS and formula graph tests without coverage thresholds.
3. Run Office typecheck, lint, formatting, dependency and provenance checks plus Calc inventory.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
