---
id: "202611270733-Q276QA"
title: "Preserve Calc ODS database range ownership and filter parameters"
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
  updated_at: "2026-11-27T07:34:04.658Z"
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
    body: "Start: Transfer native Calc database ranges and their represented ODS query state."
events:
  -
    type: "status"
    at: "2026-11-27T07:34:06.542Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Transfer native Calc database ranges and their represented ODS query state."
doc_version: 3
doc_updated_at: "2026-11-27T07:34:06.542Z"
doc_updated_by: "CODER"
description: "Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel."
sections:
  Summary: |-
    Preserve Calc ODS database range ownership and filter parameters

    Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.
  Scope: |-
    - In scope: Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.
    - Out of scope: unrelated refactors not required for "Preserve Calc ODS database range ownership and filter parameters".
  Plan: |-
    1. Trace the pinned database data, collection, filter contexts and exporter against the current Calc kernel.
    2. Port native data ownership and ODF admission/output, including deferred adoption after tables and the original query parameter ordering and defaults.
    3. Wire the Worker snapshot, port the pertinent native end-to-end assertions, and run current focused volume.
  Verify Steps: |-
    - Run the related Calc ODS, native sparse-flag and Worker tests plus the supported ownership and visibility assertions of testDatabaseRangesODS.
    - Run Office typecheck, targeted ESLint and format, dependencies, provenance, Calc/shared inventory, routing, AgentPlane doctor and git diff checks.
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

Preserve Calc ODS database range ownership and filter parameters

Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.

## Scope

- In scope: Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.
- Out of scope: unrelated refactors not required for "Preserve Calc ODS database range ownership and filter parameters".

## Plan

1. Trace the pinned database data, collection, filter contexts and exporter against the current Calc kernel.
2. Port native data ownership and ODF admission/output, including deferred adoption after tables and the original query parameter ordering and defaults.
3. Wire the Worker snapshot, port the pertinent native end-to-end assertions, and run current focused volume.

## Verify Steps

- Run the related Calc ODS, native sparse-flag and Worker tests plus the supported ownership and visibility assertions of testDatabaseRangesODS.
- Run Office typecheck, targeted ESLint and format, dependencies, provenance, Calc/shared inventory, routing, AgentPlane doctor and git diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
