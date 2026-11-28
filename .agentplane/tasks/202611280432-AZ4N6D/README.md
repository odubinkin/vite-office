---
id: "202611280432-AZ4N6D"
title: "Port native Writer ODT document information text fields"
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
  updated_at: "2026-11-28T04:32:40.732Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T05:20:21.039Z"
  updated_by: "CODER"
  note: "All 35 focused Writer and shared tests passed, including the pinned title-field presentation and fixed/live metadata through Worker and saved ODT. Office types, lint, formatting, dependency boundaries, source provenance and parity inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T05:20:21.874Z"
  updated_by: "EVALUATOR"
  note: "Writer retains native text document information fields through ODT import, Worker transport and ODT export."
  evaluated_sha: "32865a99445272fc2d3b28be83f01d65c72af9b2"
  blueprint_digest: "d053b4bc871dbe823a4a8d700f3a54d5d8a45b9784d0b2b2ee154ee721434e0a"
  evidence_refs:
    - ".agentplane/tasks/202611280432-AZ4N6D/README.md"
    - ".agentplane/tasks/202611280432-AZ4N6D/quality/20261128-052021874-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280432-AZ4N6D/quality/20261128-052021874-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280432-AZ4N6D/quality/20261128-052021874-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280432-AZ4N6D/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/docinfo-verification.md"
  findings:
    - "The native metadata owner drives live fields and Gregorian author handling. Original fixed presentation and revision descriptor behavior is retained and recorded as WRITER-774."
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
  -
    type: "verify"
    at: "2026-11-28T05:20:21.039Z"
    author: "CODER"
    state: "ok"
    note: "All 35 focused Writer and shared tests passed, including the pinned title-field presentation and fixed/live metadata through Worker and saved ODT. Office types, lint, formatting, dependency boundaries, source provenance and parity inventory passed."
doc_version: 3
doc_updated_at: "2026-11-28T05:20:21.165Z"
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
    ### 2026-11-28T05:20:21.039Z — VERIFY — ok

    By: CODER

    Note: All 35 focused Writer and shared tests passed, including the pinned title-field presentation and fixed/live metadata through Worker and saved ODT. Office types, lint, formatting, dependency boundaries, source provenance and parity inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T04:32:41.761Z, excerpt_hash=sha256:bd86144364ccdc8565b2bf48c003c02811c7e536674ff8df154c911427230f12

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280432-AZ4N6D/blueprint/resolved-snapshot.json
    - old_digest: d053b4bc871dbe823a4a8d700f3a54d5d8a45b9784d0b2b2ee154ee721434e0a
    - current_digest: d053b4bc871dbe823a4a8d700f3a54d5d8a45b9784d0b2b2ee154ee721434e0a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280432-AZ4N6D

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280432-AZ4N6D
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
### 2026-11-28T05:20:21.039Z — VERIFY — ok

By: CODER

Note: All 35 focused Writer and shared tests passed, including the pinned title-field presentation and fixed/live metadata through Worker and saved ODT. Office types, lint, formatting, dependency boundaries, source provenance and parity inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T04:32:41.761Z, excerpt_hash=sha256:bd86144364ccdc8565b2bf48c003c02811c7e536674ff8df154c911427230f12

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280432-AZ4N6D/blueprint/resolved-snapshot.json
- old_digest: d053b4bc871dbe823a4a8d700f3a54d5d8a45b9784d0b2b2ee154ee721434e0a
- current_digest: d053b4bc871dbe823a4a8d700f3a54d5d8a45b9784d0b2b2ee154ee721434e0a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280432-AZ4N6D

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280432-AZ4N6D
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
