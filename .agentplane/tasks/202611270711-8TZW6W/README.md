---
id: "202611270711-8TZW6W"
title: "Preserve Calc ODS threaded notes and document persons"
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
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:12:41.854Z"
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
    at: "2026-11-27T07:12:58.374Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T07:12:58.374Z"
doc_updated_by: "CODER"
description: "Port native ScPostIt threaded metadata, ordered unique document persons and the LibreOffice ODS thread extension. Retain thread data through version-one Worker transfer and verify the pinned ODS comment round-trip scenario."
sections:
  Summary: "Retain LibreOffice threaded cell comments and their document persons through Calc's existing note owners, ODS filter and Worker transfer."
  Scope: "ScPostIt and person value ownership, native comment/reply and spreadsheet persons XML contexts, extended ODS output, and backward-compatible version-one Worker records. Include classic annotation fallback, resolution state, and the relevant pinned ODS round-trip assertions. Work stays within the current Calc note model and ODS path."
  Plan: "Port native threaded note entries, document persons, LibreOffice ODS extension and version-one Worker transfer. Verify the relevant upstream ODS round-trip assertions."
  Verify Steps: |-
    - Run existing Calc ODS notes and Worker tests and the focused threaded-note case with the pinned native root/reply/person assertions.
    - Run Office typecheck, changed-file ESLint and Prettier, dependencies, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
  Verification: "Pending verification."
  Rollback Plan: "Revert task implementation commits. Legacy version-one Worker records omit the new thread and person metadata."
  Findings: "The pinned export QA seeds its model by importing an XLSX package. This task exercises the ODS save/reopen segment using the same native comment metadata and classic note owner."
id_source: "generated"
---
## Summary

Retain LibreOffice threaded cell comments and their document persons through Calc's existing note owners, ODS filter and Worker transfer.

## Scope

ScPostIt and person value ownership, native comment/reply and spreadsheet persons XML contexts, extended ODS output, and backward-compatible version-one Worker records. Include classic annotation fallback, resolution state, and the relevant pinned ODS round-trip assertions. Work stays within the current Calc note model and ODS path.

## Plan

Port native threaded note entries, document persons, LibreOffice ODS extension and version-one Worker transfer. Verify the relevant upstream ODS round-trip assertions.

## Verify Steps

- Run existing Calc ODS notes and Worker tests and the focused threaded-note case with the pinned native root/reply/person assertions.
- Run Office typecheck, changed-file ESLint and Prettier, dependencies, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.

## Verification

Pending verification.

## Rollback Plan

Revert task implementation commits. Legacy version-one Worker records omit the new thread and person metadata.

## Findings

The pinned export QA seeds its model by importing an XLSX package. This task exercises the ODS save/reopen segment using the same native comment metadata and classic note owner.
