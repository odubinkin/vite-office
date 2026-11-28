---
id: "202611280646-M5TH2R"
title: "Port native Writer ODT custom document information fields"
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
  updated_at: "2026-11-28T06:46:34.104Z"
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
    body: "Start: port original named document-property field expansion and ODF service."
events:
  -
    type: "status"
    at: "2026-11-28T06:46:34.918Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original named document-property field expansion and ODF service."
doc_version: 3
doc_updated_at: "2026-11-28T06:46:34.918Z"
doc_updated_by: "CODER"
description: "Bind text:user-defined fields to the actual UNO document property bag. Implement the native fixed and live presentations, typed date/date-time/duration and scalar conversion, supported header/footer and body ODF paths, and portable name and number format state through the Worker."
sections:
  Summary: |-
    Port native Writer ODT custom document information fields

    Bind text:user-defined fields to the actual UNO document property bag. Implement the native fixed and live presentations, typed date/date-time/duration and scalar conversion, supported header/footer and body ODF paths, and portable name and number format state through the Worker.
  Scope: |-
    - In scope: Bind text:user-defined fields to the actual UNO document property bag. Implement the native fixed and live presentations, typed date/date-time/duration and scalar conversion, supported header/footer and body ODF paths, and portable name and number format state through the Worker.
    - Out of scope: unrelated refactors not required for "Port native Writer ODT custom document information fields".
  Plan: "Port XMLUserDocInfoImportContext, the native DocInfo.Custom UNO descriptor and SwDocInfoField named property ownership. Read actual XPropertySet values through the document metadata bag and the original Converter service, and preserve the initial versus live Date/DateTime/Duration formatting contract, fixed presentation and cached fallback when a property disappears. Save field name and data style through ODT and portable Worker records, using existing body and header/footer paths. Exercise the pinned custom field fixture and focused existing tests with one critical roundtrip. Document suspicious original behavior and leave unrelated core fields and file behavior intact."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Writer ODT custom document information fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Writer ODT custom document information fields". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port native Writer ODT custom document information fields

Bind text:user-defined fields to the actual UNO document property bag. Implement the native fixed and live presentations, typed date/date-time/duration and scalar conversion, supported header/footer and body ODF paths, and portable name and number format state through the Worker.

## Scope

- In scope: Bind text:user-defined fields to the actual UNO document property bag. Implement the native fixed and live presentations, typed date/date-time/duration and scalar conversion, supported header/footer and body ODF paths, and portable name and number format state through the Worker.
- Out of scope: unrelated refactors not required for "Port native Writer ODT custom document information fields".

## Plan

Port XMLUserDocInfoImportContext, the native DocInfo.Custom UNO descriptor and SwDocInfoField named property ownership. Read actual XPropertySet values through the document metadata bag and the original Converter service, and preserve the initial versus live Date/DateTime/Duration formatting contract, fixed presentation and cached fallback when a property disappears. Save field name and data style through ODT and portable Worker records, using existing body and header/footer paths. Exercise the pinned custom field fixture and focused existing tests with one critical roundtrip. Document suspicious original behavior and leave unrelated core fields and file behavior intact.

## Verify Steps

PLANNER fallback scaffold for "Port native Writer ODT custom document information fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Writer ODT custom document information fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
