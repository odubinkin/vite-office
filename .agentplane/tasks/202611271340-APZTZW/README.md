---
id: "202611271340-APZTZW"
title: "Port native Calc ODS cell text, ruby base and inline whitespace contexts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
  - "rich-text"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T13:40:50.951Z"
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
    body: "Start: Restore the native Calc cell SAX contexts and use the original ruby fixture."
events:
  -
    type: "status"
    at: "2026-11-27T13:40:51.943Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore the native Calc cell SAX contexts and use the original ruby fixture."
doc_version: 3
doc_updated_at: "2026-11-27T13:40:51.943Z"
doc_updated_by: "CODER"
description: "Use the original paragraph, span, spaces and ruby-base context boundaries for rich Calc cells. Retain timed native text fields and string versus edit-cell storage contracts, and port the pinned ruby witness through ODS and Worker."
sections:
  Summary: |-
    Port native Calc ODS cell text, ruby base and inline whitespace contexts

    Use the original paragraph, span, spaces and ruby-base context boundaries for rich Calc cells. Retain timed native text fields and string versus edit-cell storage contracts, and port the pinned ruby witness through ODS and Worker.
  Scope: |-
    - In scope: Use the original paragraph, span, spaces and ruby-base context boundaries for rich Calc cells. Retain timed native text fields and string versus edit-cell storage contracts, and port the pinned ruby witness through ODS and Worker.
    - Out of scope: unrelated refactors not required for "Port native Calc ODS cell text, ruby base and inline whitespace contexts".
  Plan: "Follow sc/source/filter/xml/celltextparacontext.cxx ownership for paragraphs, spans, explicit spaces, field callbacks and ruby base text. Keep the existing native EditEngine and document transfer. Preserve the source order and style of direct and nested ruby-base spans while discarding the collected pronunciation and style as LibreOffice does. Route unsupported inline text children through the original ignore behavior, retain ordinary malformed XML and resource checks, and keep native top-level tab/line-break behavior. Port testTdf129940 from the untouched ODS fixture; replay related rich text, notes, package, Worker, dependency and provenance checks. Record any suspicious behavior with pinned native sources."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Calc ODS cell text, ruby base and inline whitespace contexts". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Calc ODS cell text, ruby base and inline whitespace contexts". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port native Calc ODS cell text, ruby base and inline whitespace contexts

Use the original paragraph, span, spaces and ruby-base context boundaries for rich Calc cells. Retain timed native text fields and string versus edit-cell storage contracts, and port the pinned ruby witness through ODS and Worker.

## Scope

- In scope: Use the original paragraph, span, spaces and ruby-base context boundaries for rich Calc cells. Retain timed native text fields and string versus edit-cell storage contracts, and port the pinned ruby witness through ODS and Worker.
- Out of scope: unrelated refactors not required for "Port native Calc ODS cell text, ruby base and inline whitespace contexts".

## Plan

Follow sc/source/filter/xml/celltextparacontext.cxx ownership for paragraphs, spans, explicit spaces, field callbacks and ruby base text. Keep the existing native EditEngine and document transfer. Preserve the source order and style of direct and nested ruby-base spans while discarding the collected pronunciation and style as LibreOffice does. Route unsupported inline text children through the original ignore behavior, retain ordinary malformed XML and resource checks, and keep native top-level tab/line-break behavior. Port testTdf129940 from the untouched ODS fixture; replay related rich text, notes, package, Worker, dependency and provenance checks. Record any suspicious behavior with pinned native sources.

## Verify Steps

PLANNER fallback scaffold for "Port native Calc ODS cell text, ruby base and inline whitespace contexts". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Calc ODS cell text, ruby base and inline whitespace contexts". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
