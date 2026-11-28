---
id: "202611280534-VFAXVP"
title: "Port native Writer ODT date and time text fields"
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
  updated_at: "2026-11-28T05:35:02.493Z"
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
    body: "Start: preserve native Writer date/time fields and their number styles through ODT and the Worker."
events:
  -
    type: "status"
    at: "2026-11-28T05:35:03.004Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native Writer date/time fields and their number styles through ODT and the Worker."
doc_version: 3
doc_updated_at: "2026-11-28T05:35:03.004Z"
doc_updated_by: "CODER"
description: "Port the original document-owned SwDateTimeField and UNO DateTime service, ODF date and time field contexts, native date/time values, adjustment and number format semantics, and the Writer Worker transfer. Preserve actual pooled field hints and the existing Writer number style registry. Use pinned LibreOffice fixture expectations and related focused checks before the tenth-task checkpoint."
sections:
  Summary: |-
    Port native Writer ODT date and time text fields

    Port the original document-owned SwDateTimeField and UNO DateTime service, ODF date and time field contexts, native date/time values, adjustment and number format semantics, and the Writer Worker transfer. Preserve actual pooled field hints and the existing Writer number style registry. Use pinned LibreOffice fixture expectations and related focused checks before the tenth-task checkpoint.
  Scope: |-
    - In scope: Port the original document-owned SwDateTimeField and UNO DateTime service, ODF date and time field contexts, native date/time values, adjustment and number format semantics, and the Writer Worker transfer. Preserve actual pooled field hints and the existing Writer number style registry. Use pinned LibreOffice fixture expectations and related focused checks before the tenth-task checkpoint.
    - Out of scope: unrelated refactors not required for "Port native Writer ODT date and time text fields".
  Plan: "Port document-owned SwDateTimeFieldType and SwDateTimeField with native null date, fixed and live values, minute adjustment, and default format indices. Attach through the Writer DateTime UNO service and original xmloff time/date contexts, including fixed input, document number styles and original export values. Transfer actual formatter definitions and field hints through the Worker. Share existing number format transport and field owners when possible. Use the applicable field anchors from the pinned tdf111969 fixtures and critical dated style roundtrip, then run related Writer and shared checks. Calendar information fields and cursor-layout hit testing remain separate."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Writer ODT date and time text fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Writer ODT date and time text fields". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port native Writer ODT date and time text fields

Port the original document-owned SwDateTimeField and UNO DateTime service, ODF date and time field contexts, native date/time values, adjustment and number format semantics, and the Writer Worker transfer. Preserve actual pooled field hints and the existing Writer number style registry. Use pinned LibreOffice fixture expectations and related focused checks before the tenth-task checkpoint.

## Scope

- In scope: Port the original document-owned SwDateTimeField and UNO DateTime service, ODF date and time field contexts, native date/time values, adjustment and number format semantics, and the Writer Worker transfer. Preserve actual pooled field hints and the existing Writer number style registry. Use pinned LibreOffice fixture expectations and related focused checks before the tenth-task checkpoint.
- Out of scope: unrelated refactors not required for "Port native Writer ODT date and time text fields".

## Plan

Port document-owned SwDateTimeFieldType and SwDateTimeField with native null date, fixed and live values, minute adjustment, and default format indices. Attach through the Writer DateTime UNO service and original xmloff time/date contexts, including fixed input, document number styles and original export values. Transfer actual formatter definitions and field hints through the Worker. Share existing number format transport and field owners when possible. Use the applicable field anchors from the pinned tdf111969 fixtures and critical dated style roundtrip, then run related Writer and shared checks. Calendar information fields and cursor-layout hit testing remain separate.

## Verify Steps

PLANNER fallback scaffold for "Port native Writer ODT date and time text fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Writer ODT date and time text fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
