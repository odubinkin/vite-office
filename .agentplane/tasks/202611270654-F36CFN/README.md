---
id: "202611270654-F36CFN"
title: "Preserve Calc ODS external cache number formats and source metadata"
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
  updated_at: "2026-11-27T06:55:07.842Z"
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
    at: "2026-11-27T06:56:35.702Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:56:35.702Z"
doc_updated_by: "CODER"
description: "Port external cache cell format indices and temporal values through native ODS import/export and Worker transfer. Preserve the upstream source filter metadata and numeric cache token representation."
sections:
  Summary: "Preserve the represented Calc external workbook cache values, number formats and source metadata in ODS and Worker snapshots."
  Scope: "Native ScExternalRefCache::Table cell data, ScXMLExternalRefCellContext and table-source context, ScXMLExport::WriteExternalRefCaches, and their existing Worker bridge. Include import of temporal and logical values, persistence of cached number-format identity, and external source filter options. Existing external workbook resolution and browser file-open/save policy define the boundary."
  Plan: "Port native external cache format indices and source filter metadata through ODS import, export and Worker transfer, then verify existing cache tests and a focused format round trip."
  Verify Steps: |-
    - Run existing external cache ODS/XLSX and worker tests and one format-retention round trip for temporal and styled cached cells.
    - Run Office typecheck, scoped lint/format, dependencies, provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
  Verification: "Pending verification."
  Rollback Plan: "Revert the task implementation commits. The external cache Worker payload extends its existing optional fields."
  Findings: "The native ODF writer emits double cache tokens as float even when they carry a date, duration or logical display format. Type identity lives in the cache's number-format index and its automatic cell style."
id_source: "generated"
---
## Summary

Preserve the represented Calc external workbook cache values, number formats and source metadata in ODS and Worker snapshots.

## Scope

Native ScExternalRefCache::Table cell data, ScXMLExternalRefCellContext and table-source context, ScXMLExport::WriteExternalRefCaches, and their existing Worker bridge. Include import of temporal and logical values, persistence of cached number-format identity, and external source filter options. Existing external workbook resolution and browser file-open/save policy define the boundary.

## Plan

Port native external cache format indices and source filter metadata through ODS import, export and Worker transfer, then verify existing cache tests and a focused format round trip.

## Verify Steps

- Run existing external cache ODS/XLSX and worker tests and one format-retention round trip for temporal and styled cached cells.
- Run Office typecheck, scoped lint/format, dependencies, provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.

## Verification

Pending verification.

## Rollback Plan

Revert the task implementation commits. The external cache Worker payload extends its existing optional fields.

## Findings

The native ODF writer emits double cache tokens as float even when they carry a date, duration or logical display format. Type identity lives in the cache's number-format index and its automatic cell style.
