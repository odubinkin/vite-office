---
id: "202611280646-M5TH2R"
title: "Port native Writer ODT custom document information fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "ok"
  updated_at: "2026-11-28T06:53:33.726Z"
  updated_by: "CODER"
  note: "27 focused Writer/shared tests passed, including original tdf160877.odt classification field in styles.xml and typed custom properties through Worker. Typecheck, lint, formatting, dependencies, provenance and zero Writer parity violations passed. WRITER-779/780 preserve original missing-property and duration behavior."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T06:53:34.755Z"
  updated_by: "EVALUATOR"
  note: "Native named Writer DocInfo fields use typed document properties and survive ODT and Worker roundtrips."
  evaluated_sha: "0010c23ae7a6204c8d0b634f0f014c5aba08d85d"
  blueprint_digest: "d027a896c4b6c8d63536cd13fc196e31dd73d892313e06c91c85fc238f6fe578"
  evidence_refs:
    - ".agentplane/tasks/202611280646-M5TH2R/README.md"
    - ".agentplane/tasks/202611280646-M5TH2R/quality/20261128-065334755-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280646-M5TH2R/quality/20261128-065334755-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280646-M5TH2R/quality/20261128-065334755-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280646-M5TH2R/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/writer-docinfo-custom-verification.md"
  findings:
    - "The original classification fixture covers a first-page style field, and the existing body roundtrip covers named scalar and typed properties and the source fallback."
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
  -
    type: "verify"
    at: "2026-11-28T06:53:33.726Z"
    author: "CODER"
    state: "ok"
    note: "27 focused Writer/shared tests passed, including original tdf160877.odt classification field in styles.xml and typed custom properties through Worker. Typecheck, lint, formatting, dependencies, provenance and zero Writer parity violations passed. WRITER-779/780 preserve original missing-property and duration behavior."
doc_version: 3
doc_updated_at: "2026-11-28T06:53:33.827Z"
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
    ### 2026-11-28T06:53:33.726Z — VERIFY — ok

    By: CODER

    Note: 27 focused Writer/shared tests passed, including original tdf160877.odt classification field in styles.xml and typed custom properties through Worker. Typecheck, lint, formatting, dependencies, provenance and zero Writer parity violations passed. WRITER-779/780 preserve original missing-property and duration behavior.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T06:46:34.918Z, excerpt_hash=sha256:2263c71cedbd1b114b50e80650b68ac979236c11cdae90fb9db521444467d769

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280646-M5TH2R/blueprint/resolved-snapshot.json
    - old_digest: d027a896c4b6c8d63536cd13fc196e31dd73d892313e06c91c85fc238f6fe578
    - current_digest: d027a896c4b6c8d63536cd13fc196e31dd73d892313e06c91c85fc238f6fe578
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280646-M5TH2R

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280646-M5TH2R
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
### 2026-11-28T06:53:33.726Z — VERIFY — ok

By: CODER

Note: 27 focused Writer/shared tests passed, including original tdf160877.odt classification field in styles.xml and typed custom properties through Worker. Typecheck, lint, formatting, dependencies, provenance and zero Writer parity violations passed. WRITER-779/780 preserve original missing-property and duration behavior.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T06:46:34.918Z, excerpt_hash=sha256:2263c71cedbd1b114b50e80650b68ac979236c11cdae90fb9db521444467d769

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280646-M5TH2R/blueprint/resolved-snapshot.json
- old_digest: d027a896c4b6c8d63536cd13fc196e31dd73d892313e06c91c85fc238f6fe578
- current_digest: d027a896c4b6c8d63536cd13fc196e31dd73d892313e06c91c85fc238f6fe578
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280646-M5TH2R

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280646-M5TH2R
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
