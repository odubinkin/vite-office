---
id: "202611271233-WFWZ54"
title: "Preserve native Calc document configuration in ODS settings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "configuration"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify original Calc ODS settings and string reference semantics, typed group and view precedence, native state across Worker and ODS reopen, existing related Calc view, formula, Worker and Writer shared-settings tests, and focused static validation."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:33:46.383Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T14:41:54.498Z"
  updated_by: "CODER"
  note: "Tests  57 passed (57). Original workbook configuration, native INDIRECT conventions, Worker and normal ODS reopened. Typecheck, lint, formatting, dependencies, provenance and scoped inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:41:55.214Z"
  updated_by: "EVALUATOR"
  note: "Preserved represented Calc document configuration, nested view settings, native reference syntax and calculation state through ODS and the Worker."
  evaluated_sha: "99c0d66875e355613abfa2dfbad60ff71cd22547"
  blueprint_digest: "4a8690bdf3a010cc1a0a79a8fc7a51c1aff22f9a7e97107aaa074d976fe3cf16"
  evidence_refs:
    - ".agentplane/tasks/202611271233-WFWZ54/README.md"
    - ".agentplane/tasks/202611271233-WFWZ54/quality/20261127-144155214-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271233-WFWZ54/quality/20261127-144155214-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271233-WFWZ54/quality/20261127-144155214-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271233-WFWZ54/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/WFWZ54/verification.md"
    - "99c0d66875e355613abfa2dfbad60ff71cd22547"
  findings:
    - "Existing view/import order and intentional shell lifecycle remain in effect. Device configuration, macros and external updates remain outside the slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: trace the native typed settings sequence and link it to the represented Calc configuration owner in an isolated checkout of the live checkpoint baseline."
events:
  -
    type: "status"
    at: "2026-11-27T12:33:47.277Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace the native typed settings sequence and link it to the represented Calc configuration owner in an isolated checkout of the live checkpoint baseline."
  -
    type: "verify"
    at: "2026-11-27T14:41:54.498Z"
    author: "CODER"
    state: "ok"
    note: "Tests  57 passed (57). Original workbook configuration, native INDIRECT conventions, Worker and normal ODS reopened. Typecheck, lint, formatting, dependencies, provenance and scoped inventory passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:41:54.577Z"
doc_updated_by: "CODER"
description: "Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests."
sections:
  Summary: |-
    Preserve native Calc document configuration in ODS settings

    Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.
  Scope: |-
    - In scope: Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.
    - Out of scope: unrelated refactors not required for "Preserve native Calc document configuration in ODS settings".
  Plan: "Inspect the pinned ScDocumentConfiguration property map, calculation fallback and settings stream ownership. Implement the represented typed configuration service over existing Calc document and view state, reuse shared xmloff scalar and collection contracts for combined settings import/export, and preserve that state across Worker transfer. Apply native settings and content import order. Carry existing view precedence and lifecycle decisions. Verify an original ODS fixture through normal import, Worker and reopen, plus related formula/view/shared XML tests and native provenance."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Calc document configuration in ODS settings". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Calc document configuration in ODS settings". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T14:41:54.498Z — VERIFY — ok

    By: CODER

    Note: Tests  57 passed (57). Original workbook configuration, native INDIRECT conventions, Worker and normal ODS reopened. Typecheck, lint, formatting, dependencies, provenance and scoped inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:33:47.277Z, excerpt_hash=sha256:6a8ee9398c8b36b58d5b38b5c7f2ac1565fbdaebd8de9564645db234a6b112b3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271233-WFWZ54/blueprint/resolved-snapshot.json
    - old_digest: 4a8690bdf3a010cc1a0a79a8fc7a51c1aff22f9a7e97107aaa074d976fe3cf16
    - current_digest: 4a8690bdf3a010cc1a0a79a8fc7a51c1aff22f9a7e97107aaa074d976fe3cf16
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271233-WFWZ54

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271233-WFWZ54
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

Preserve native Calc document configuration in ODS settings

Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.

## Scope

- In scope: Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.
- Out of scope: unrelated refactors not required for "Preserve native Calc document configuration in ODS settings".

## Plan

Inspect the pinned ScDocumentConfiguration property map, calculation fallback and settings stream ownership. Implement the represented typed configuration service over existing Calc document and view state, reuse shared xmloff scalar and collection contracts for combined settings import/export, and preserve that state across Worker transfer. Apply native settings and content import order. Carry existing view precedence and lifecycle decisions. Verify an original ODS fixture through normal import, Worker and reopen, plus related formula/view/shared XML tests and native provenance.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Calc document configuration in ODS settings". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Calc document configuration in ODS settings". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T14:41:54.498Z — VERIFY — ok

By: CODER

Note: Tests  57 passed (57). Original workbook configuration, native INDIRECT conventions, Worker and normal ODS reopened. Typecheck, lint, formatting, dependencies, provenance and scoped inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:33:47.277Z, excerpt_hash=sha256:6a8ee9398c8b36b58d5b38b5c7f2ac1565fbdaebd8de9564645db234a6b112b3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271233-WFWZ54/blueprint/resolved-snapshot.json
- old_digest: 4a8690bdf3a010cc1a0a79a8fc7a51c1aff22f9a7e97107aaa074d976fe3cf16
- current_digest: 4a8690bdf3a010cc1a0a79a8fc7a51c1aff22f9a7e97107aaa074d976fe3cf16
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271233-WFWZ54

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271233-WFWZ54
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
