---
id: "202611210526-GSPND6"
title: "Align Calc ODS page-style print properties and master retention"
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
verify:
  - "Run targeted Calc page-settings, native page and ODS style/Worker tests plus office typecheck, scoped lint and formatting, module boundaries, source provenance, routing, doctor and git checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:27:10.536Z"
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
    body: "Start: align Calc ODS print fields, page scale and named mast er collection with pinned LibreOffice."
events:
  -
    type: "status"
    at: "2026-11-21T05:27:10.912Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align Calc ODS print fields, page scale and named mast er collection with pinned LibreOffice."
doc_version: 3
doc_updated_at: "2026-11-21T05:27:10.912Z"
doc_updated_by: "CODER"
description: "Preserve every represented native print option, native page scale conversion and omission, and all named Calc page styles across ODS and Worker. Port the pinned unused-page-style fixture and cover independent XML."
sections:
  Summary: "Port the pinned LibreOffice Calc ODF page-style print options, scaling and master collection for the fields already present in the core."
  Scope: "Calc XML page style import and export, shared xmloff print and number handlers, existing native page-item ownership, Worker round trips, focused tests and source provenance. Preserve the product save, recovery and file interface choices."
  Plan: "Compare native Calc style items and xmloff handlers to implement represented print tokens, numeric scale modes and retained named masters. Port pinned and independent round trips and run the declared scoped checks."
  Verify Steps: "Run focused Calc ODS page settings, style routing, native page defaults and ODS Worker tests with the pinned LibreOffice unused page style fixture and literal print/scale fixtures. Run office typecheck, scoped ESLint/Prettier, module boundaries, source provenance, routing, doctor and git diff checks."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Port the pinned LibreOffice Calc ODF page-style print options, scaling and master collection for the fields already present in the core.

## Scope

Calc XML page style import and export, shared xmloff print and number handlers, existing native page-item ownership, Worker round trips, focused tests and source provenance. Preserve the product save, recovery and file interface choices.

## Plan

Compare native Calc style items and xmloff handlers to implement represented print tokens, numeric scale modes and retained named masters. Port pinned and independent round trips and run the declared scoped checks.

## Verify Steps

Run focused Calc ODS page settings, style routing, native page defaults and ODS Worker tests with the pinned LibreOffice unused page style fixture and literal print/scale fixtures. Run office typecheck, scoped ESLint/Prettier, module boundaries, source provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the task implementation commit.

## Findings

None at intake.
