---
id: "202611280534-VFAXVP"
title: "Port native Writer ODT date and time text fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "ok"
  updated_at: "2026-11-28T05:48:24.771Z"
  updated_by: "CODER"
  note: "25 focused Writer and shared tests passed in eight files, including the two pinned field-anchor fixtures and an ODT date/time adjustment and number-style roundtrip. Office types, formatting, lint, dependency boundaries, source provenance and Writer parity inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T05:48:25.361Z"
  updated_by: "EVALUATOR"
  note: "Writer preserves native dates and times as real text fields in ODT and Worker transport."
  evaluated_sha: "6f964920fc8edfe335df153176b7ae586620432e"
  blueprint_digest: "a5ed48b07e19e39f5f179116fdb53be1d901e4fcfb5f16092a7d4ea0ab45e6bb"
  evidence_refs:
    - ".agentplane/tasks/202611280534-VFAXVP/README.md"
    - ".agentplane/tasks/202611280534-VFAXVP/quality/20261128-054825361-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280534-VFAXVP/quality/20261128-054825361-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280534-VFAXVP/quality/20261128-054825361-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280534-VFAXVP/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/datetime-verification.md"
  findings:
    - "Native date/time flags, clock semantics, serial values, format definitions and minute adjustments flow through the actual owners. WRITER-775 and WRITER-776 record the retained export conversions."
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
  -
    type: "verify"
    at: "2026-11-28T05:48:24.771Z"
    author: "CODER"
    state: "ok"
    note: "25 focused Writer and shared tests passed in eight files, including the two pinned field-anchor fixtures and an ODT date/time adjustment and number-style roundtrip. Office types, formatting, lint, dependency boundaries, source provenance and Writer parity inventory passed."
doc_version: 3
doc_updated_at: "2026-11-28T05:48:24.836Z"
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
    ### 2026-11-28T05:48:24.771Z — VERIFY — ok

    By: CODER

    Note: 25 focused Writer and shared tests passed in eight files, including the two pinned field-anchor fixtures and an ODT date/time adjustment and number-style roundtrip. Office types, formatting, lint, dependency boundaries, source provenance and Writer parity inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T05:35:03.004Z, excerpt_hash=sha256:0a155d6450e6f72f76a495b03f96b08a414f5478438c0c53a34051c93cabf62e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280534-VFAXVP/blueprint/resolved-snapshot.json
    - old_digest: a5ed48b07e19e39f5f179116fdb53be1d901e4fcfb5f16092a7d4ea0ab45e6bb
    - current_digest: a5ed48b07e19e39f5f179116fdb53be1d901e4fcfb5f16092a7d4ea0ab45e6bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280534-VFAXVP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280534-VFAXVP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

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
### 2026-11-28T05:48:24.771Z — VERIFY — ok

By: CODER

Note: 25 focused Writer and shared tests passed in eight files, including the two pinned field-anchor fixtures and an ODT date/time adjustment and number-style roundtrip. Office types, formatting, lint, dependency boundaries, source provenance and Writer parity inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T05:35:03.004Z, excerpt_hash=sha256:0a155d6450e6f72f76a495b03f96b08a414f5478438c0c53a34051c93cabf62e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280534-VFAXVP/blueprint/resolved-snapshot.json
- old_digest: a5ed48b07e19e39f5f179116fdb53be1d901e4fcfb5f16092a7d4ea0ab45e6bb
- current_digest: a5ed48b07e19e39f5f179116fdb53be1d901e4fcfb5f16092a7d4ea0ab45e6bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280534-VFAXVP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280534-VFAXVP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
