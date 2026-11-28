---
id: "202611280432-AZ4N6D"
title: "Port native Writer ODT document information text fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T04:32:40.732Z"
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
    body: "Start: port document information text fields and native ODT and Worker roundtrip."
events:
  -
    type: "status"
    at: "2026-11-28T04:32:41.761Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port document information text fields and native ODT and Worker roundtrip."
doc_version: 3
doc_updated_at: "2026-11-28T04:32:41.761Z"
doc_updated_by: "CODER"
description: "Port the document-owned SwDocInfoField family for title, subject, keywords, description, creation and change and print authors, and revision through native text hints, UNO descriptor attachment, ODF text contexts, and Worker transport. Use the existing metadata owner and retain fixed-value handling. Verify with pinned source fixtures and focused related tests."
sections:
  Summary: |-
    Port native Writer ODT document information text fields

    Port the document-owned SwDocInfoField family for title, subject, keywords, description, creation and change and print authors, and revision through native text hints, UNO descriptor attachment, ODF text contexts, and Worker transport. Use the existing metadata owner and retain fixed-value handling. Verify with pinned source fixtures and focused related tests.
  Scope: |-
    - In scope: Port the document-owned SwDocInfoField family for title, subject, keywords, description, creation and change and print authors, and revision through native text hints, UNO descriptor attachment, ODF text contexts, and Worker transport. Use the existing metadata owner and retain fixed-value handling. Verify with pinned source fixtures and focused related tests.
    - Out of scope: unrelated refactors not required for "Port native Writer ODT document information text fields".
  Plan: "Use the native SwDocInfoField and document-owned type for textual document properties, document authors, and revision. Port ODF service-name and fixed-value handling in xmloff, attach to the original Writer SwFormatField/SwTextField point and preserve it through Worker and ODT using the actual metadata owner. Port the title presentation assertion from LibreOffice field-rotated.fodt and use one focused package round trip to verify fixed and live fields, preserving native defaults. Leave date/time number formatting and custom property variants to their own slice. Verify related Writer and shared metadata tests, typing and provenance, then close."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Writer ODT document information text fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Writer ODT document information text fields". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port native Writer ODT document information text fields

Port the document-owned SwDocInfoField family for title, subject, keywords, description, creation and change and print authors, and revision through native text hints, UNO descriptor attachment, ODF text contexts, and Worker transport. Use the existing metadata owner and retain fixed-value handling. Verify with pinned source fixtures and focused related tests.

## Scope

- In scope: Port the document-owned SwDocInfoField family for title, subject, keywords, description, creation and change and print authors, and revision through native text hints, UNO descriptor attachment, ODF text contexts, and Worker transport. Use the existing metadata owner and retain fixed-value handling. Verify with pinned source fixtures and focused related tests.
- Out of scope: unrelated refactors not required for "Port native Writer ODT document information text fields".

## Plan

Use the native SwDocInfoField and document-owned type for textual document properties, document authors, and revision. Port ODF service-name and fixed-value handling in xmloff, attach to the original Writer SwFormatField/SwTextField point and preserve it through Worker and ODT using the actual metadata owner. Port the title presentation assertion from LibreOffice field-rotated.fodt and use one focused package round trip to verify fixed and live fields, preserving native defaults. Leave date/time number formatting and custom property variants to their own slice. Verify related Writer and shared metadata tests, typing and provenance, then close.

## Verify Steps

PLANNER fallback scaffold for "Port native Writer ODT document information text fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Writer ODT document information text fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
