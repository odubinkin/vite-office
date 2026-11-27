---
id: "202611271340-APZTZW"
title: "Port native Calc ODS cell text, ruby base and inline whitespace contexts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "ok"
  updated_at: "2026-11-27T14:56:48.737Z"
  updated_by: "CODER"
  note: "Tests  57 passed (57). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:56:49.223Z"
  updated_by: "EVALUATOR"
  note: "The pinned tdf129940.ods preserved the three original cell strings and distinct ruby base span sizes through the Calc Worker and ODS reopen. Existing native rich-text, field, note and paragraph tests passed."
  evaluated_sha: "a109ada2928f0d6f2176ee44b3e88b24a94b8491"
  blueprint_digest: "54dc1bd219277bbee5ea04dfd1002b47799b9eb9f95ba4912f40174943a0806d"
  evidence_refs:
    - ".agentplane/tasks/202611271340-APZTZW/README.md"
    - ".agentplane/tasks/202611271340-APZTZW/quality/20261127-145649223-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271340-APZTZW/quality/20261127-145649223-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271340-APZTZW/quality/20261127-145649223-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271340-APZTZW/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/APZTZW/verification.md"
    - "a109ada2928f0d6f2176ee44b3e88b24a94b8491"
  findings:
    - "CALC-865 records the original removal of ruby pronunciation and guide styling after the meaningful base has been imported."
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
  -
    type: "verify"
    at: "2026-11-27T14:56:48.737Z"
    author: "CODER"
    state: "ok"
    note: "Tests  57 passed (57). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:56:48.820Z"
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
    ### 2026-11-27T14:56:48.737Z — VERIFY — ok

    By: CODER

    Note: Tests  57 passed (57). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:40:51.943Z, excerpt_hash=sha256:da225d24a61d42fd64f5055bdeb8e638b0bbb76b7d11faed638c14930f9aa967

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271340-APZTZW/blueprint/resolved-snapshot.json
    - old_digest: 54dc1bd219277bbee5ea04dfd1002b47799b9eb9f95ba4912f40174943a0806d
    - current_digest: 54dc1bd219277bbee5ea04dfd1002b47799b9eb9f95ba4912f40174943a0806d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271340-APZTZW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271340-APZTZW
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
### 2026-11-27T14:56:48.737Z — VERIFY — ok

By: CODER

Note: Tests  57 passed (57). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:40:51.943Z, excerpt_hash=sha256:da225d24a61d42fd64f5055bdeb8e638b0bbb76b7d11faed638c14930f9aa967

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271340-APZTZW/blueprint/resolved-snapshot.json
- old_digest: 54dc1bd219277bbee5ea04dfd1002b47799b9eb9f95ba4912f40174943a0806d
- current_digest: 54dc1bd219277bbee5ea04dfd1002b47799b9eb9f95ba4912f40174943a0806d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271340-APZTZW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271340-APZTZW
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
