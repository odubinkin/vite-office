---
id: "202611270603-8H0K5B"
title: "Preserve Calc cell notes through native storage and ODS round trips"
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
  updated_at: "2026-11-27T06:03:57.346Z"
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
    at: "2026-11-27T06:04:02.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:04:02.515Z"
doc_updated_by: "CODER"
description: "Port the supported ScPostIt data and sparse column note ownership, cell annotation XML and Worker transfer from pinned LibreOffice. Verify native annotations on otherwise empty cells with testCellNoteExportODS and related existing checks."
sections:
  Summary: "Preserve Calc cell notes in the supported model and ODS filter. Use the pinned Calc note model and XML contexts, and exercise the native source fixture for saving notes on empty cells."
  Scope: "Calc ScPostIt/ScNoteData and column note blocks, row and cell export cursors, XML annotation context, supported EditEngine paragraph content and author/date/display metadata, and optional Worker transfer. Shared fast XML tokens may be added for the native annotation attributes. Record native provenance and any suspicious behavior reproduced. No Calc caption rendering, drawing style UI or changes to browser save/open policies."
  Plan: "Port Calc sparse per-column ScPostIt ownership, annotation XML and optional Worker transfer. Verify with the pinned testCellNoteExportODS scenario and related existing suites, then close through Graphify."
  Verify Steps: |-
    - Run the existing Calc ODS filter and Worker tests and the port of upstream testCellNoteExportODS.
    - Run Office typecheck, changed-file ESLint and Prettier, dependency and provenance checks, Calc registry invariants, routing validation, AgentPlane doctor, and git diff check.
  Verification: "Pending verification."
  Rollback Plan: "Revert task implementation commits. Existing version-one Worker records omit the new note records."
  Findings: "Native source and scope observations will be recorded with verification."
id_source: "generated"
---
## Summary

Preserve Calc cell notes in the supported model and ODS filter. Use the pinned Calc note model and XML contexts, and exercise the native source fixture for saving notes on empty cells.

## Scope

Calc ScPostIt/ScNoteData and column note blocks, row and cell export cursors, XML annotation context, supported EditEngine paragraph content and author/date/display metadata, and optional Worker transfer. Shared fast XML tokens may be added for the native annotation attributes. Record native provenance and any suspicious behavior reproduced. No Calc caption rendering, drawing style UI or changes to browser save/open policies.

## Plan

Port Calc sparse per-column ScPostIt ownership, annotation XML and optional Worker transfer. Verify with the pinned testCellNoteExportODS scenario and related existing suites, then close through Graphify.

## Verify Steps

- Run the existing Calc ODS filter and Worker tests and the port of upstream testCellNoteExportODS.
- Run Office typecheck, changed-file ESLint and Prettier, dependency and provenance checks, Calc registry invariants, routing validation, AgentPlane doctor, and git diff check.

## Verification

Pending verification.

## Rollback Plan

Revert task implementation commits. Existing version-one Worker records omit the new note records.

## Findings

Native source and scope observations will be recorded with verification.
