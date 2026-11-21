---
id: "202611210657-S39THP"
title: "Align Calc ODS workbook calculation settings"
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
  - "Run scoped Calc ODS settings, epoch, formula/query and Worker suites; office typecheck, scope lint/format, dependencies, provenance, routing and doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T06:57:46.918Z"
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
    at: "2026-11-21T06:57:51.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T06:57:51.521Z"
doc_updated_by: "CODER"
description: "Port native ODS document calculation defaults, search modes, precision, labels, two-digit year and iteration settings through import, export and Worker transport."
sections:
  Summary: "Align Calc import, export and Worker transfer of workbook calculation settings with LibreOffice 26.8.0.2."
  Scope: "Calc XML body and settings contexts, XML tokens, native options and conversions, default-aware export, backward-compatible Worker graph, regression coverage and pinned-source documentation. Preserve the current formula execution slice and browser storage workflow."
  Plan: "Port the source defaults and child contexts to the native document options, including the absent-settings path. Implement source search mode precedence and conditional serialization of options, null date and iteration. Carry the represented native properties through the Worker graph and exercise a full ODS round trip."
  Verify Steps: "Run scoped Calc ODS calculation settings, typed values, XML boundary, epoch, query/formula options and Worker suites. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and git diff checks."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commits."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Calc import, export and Worker transfer of workbook calculation settings with LibreOffice 26.8.0.2.

## Scope

Calc XML body and settings contexts, XML tokens, native options and conversions, default-aware export, backward-compatible Worker graph, regression coverage and pinned-source documentation. Preserve the current formula execution slice and browser storage workflow.

## Plan

Port the source defaults and child contexts to the native document options, including the absent-settings path. Implement source search mode precedence and conditional serialization of options, null date and iteration. Carry the represented native properties through the Worker graph and exercise a full ODS round trip.

## Verify Steps

Run scoped Calc ODS calculation settings, typed values, XML boundary, epoch, query/formula options and Worker suites. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commits.

## Findings

None at intake.
