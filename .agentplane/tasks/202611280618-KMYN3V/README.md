---
id: "202611280618-KMYN3V"
title: "Port Writer ODT document information date, time and duration fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T06:19:12.570Z"
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
    body: "Start: port the pinned document-property calendar/time and duration fields."
events:
  -
    type: "status"
    at: "2026-11-28T06:19:13.256Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the pinned document-property calendar/time and duration fields."
doc_version: 3
doc_updated_at: "2026-11-28T06:19:13.256Z"
doc_updated_by: "CODER"
description: "Implement the pinned SwDocInfoField calendar and edit-duration variants via document properties, native locale or number formats, UNO descriptor, shared ODF field import and export and browser Worker transport. Exercise actual upstream fixtures and existing Writer field coverage."
sections:
  Summary: |-
    Port Writer ODT document information date, time and duration fields

    Implement the pinned SwDocInfoField calendar and edit-duration variants via document properties, native locale or number formats, UNO descriptor, shared ODF field import and export and browser Worker transport. Exercise actual upstream fixtures and existing Writer field coverage.
  Scope: |-
    - In scope: Implement the pinned SwDocInfoField calendar and edit-duration variants via document properties, native locale or number formats, UNO descriptor, shared ODF field import and export and browser Worker transport. Exercise actual upstream fixtures and existing Writer field coverage.
    - Out of scope: unrelated refactors not required for "Port Writer ODT document information date, time and duration fields".
  Plan: "Port SwDocInfoField creation, modification and print date/time subtypes and editing duration in the native document properties, UNO and xmloff ownership chain. Retain fixed presentation and accept native number formats with language options, carry format definitions through Worker, and preserve the native omission of date/time/duration value attributes. Match locale default rendering and duration wrapping from LocaleDataWrapper. Use original upstream fixtures for represented fields and related existing tests, plus one focused roundtrip if essential. Document suspicious upstream behavior. Leave custom document fields, unrelated field families and file-management deviations outside this increment."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Writer ODT document information date, time and duration fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Writer ODT document information date, time and duration fields". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Port Writer ODT document information date, time and duration fields

Implement the pinned SwDocInfoField calendar and edit-duration variants via document properties, native locale or number formats, UNO descriptor, shared ODF field import and export and browser Worker transport. Exercise actual upstream fixtures and existing Writer field coverage.

## Scope

- In scope: Implement the pinned SwDocInfoField calendar and edit-duration variants via document properties, native locale or number formats, UNO descriptor, shared ODF field import and export and browser Worker transport. Exercise actual upstream fixtures and existing Writer field coverage.
- Out of scope: unrelated refactors not required for "Port Writer ODT document information date, time and duration fields".

## Plan

Port SwDocInfoField creation, modification and print date/time subtypes and editing duration in the native document properties, UNO and xmloff ownership chain. Retain fixed presentation and accept native number formats with language options, carry format definitions through Worker, and preserve the native omission of date/time/duration value attributes. Match locale default rendering and duration wrapping from LocaleDataWrapper. Use original upstream fixtures for represented fields and related existing tests, plus one focused roundtrip if essential. Document suspicious upstream behavior. Leave custom document fields, unrelated field families and file-management deviations outside this increment.

## Verify Steps

PLANNER fallback scaffold for "Port Writer ODT document information date, time and duration fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Writer ODT document information date, time and duration fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
