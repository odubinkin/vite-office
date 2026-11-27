---
id: "202611271333-ABXQBM"
title: "Align Writer ODT annotation text and metadata with native import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "annotations"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T13:33:18.002Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T14:53:14.278Z"
  updated_by: "CODER"
  note: "Tests  27 passed (27). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:53:14.809Z"
  updated_by: "EVALUATOR"
  note: "The pinned annotation-formatting.odt and resolved-comment.odt preserved rich note text, original annotation metadata and range behavior across import, Worker transfer and ODT reopen."
  evaluated_sha: "2042a4a67e59c8d02a74521f84e4418356cb21ac"
  blueprint_digest: "1bb03be9c56cffbf06e4e32b57c86b3f242684ca901ea0936b500f26cd4f7e2a"
  evidence_refs:
    - ".agentplane/tasks/202611271333-ABXQBM/README.md"
    - ".agentplane/tasks/202611271333-ABXQBM/quality/20261127-145314809-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271333-ABXQBM/quality/20261127-145314809-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271333-ABXQBM/quality/20261127-145314809-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271333-ABXQBM/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/ABXQBM/verification.md"
    - "2042a4a67e59c8d02a74521f84e4418356cb21ac"
  findings:
    - "WRITER-766 records the original behavior when an annotation Outliner rejects a Writer numbering rule and retains its text level."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Compare the native annotation shape-text and metadata contracts in an isolated snapshot."
events:
  -
    type: "status"
    at: "2026-11-27T13:33:18.537Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Compare the native annotation shape-text and metadata contracts in an isolated snapshot."
  -
    type: "verify"
    at: "2026-11-27T14:53:14.278Z"
    author: "CODER"
    state: "ok"
    note: "Tests  27 passed (27). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:53:14.355Z"
doc_updated_by: "CODER"
description: "Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields."
sections:
  Summary: |-
    Align Writer ODT annotation text and metadata with native import

    Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.
  Scope: |-
    - In scope: Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.
    - Out of scope: unrelated refactors not required for "Align Writer ODT annotation text and metadata with native import".
  Plan: "Trace XMLAnnotationImportContext, XMLTextImportHelper shape dispatch, the annotation Outliner property set and XMLTextFieldExport in pinned LibreOffice. Route the complete represented annotation child text through the native shared contexts with isolated list state. Preserve EditEngine text and metadata through Worker and ODT, align empty author/date export with the normal default, and record any native list or field behavior that looks incorrect. Port focused assertions from annotation-formatting.odt and resolved-comment.odt and check existing annotation, marker, paragraph-list and Worker tests. Run scoped lint, format, type, dependency and provenance checks. Preserve browser document lifecycle."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT annotation text and metadata with native import". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT annotation text and metadata with native import". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T14:53:14.278Z — VERIFY — ok

    By: CODER

    Note: Tests  27 passed (27). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:33:18.537Z, excerpt_hash=sha256:cf6c212fdc6716b075bada13f3557904a808dec3e6e7ed5f8bda9982b67585b4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271333-ABXQBM/blueprint/resolved-snapshot.json
    - old_digest: 1bb03be9c56cffbf06e4e32b57c86b3f242684ca901ea0936b500f26cd4f7e2a
    - current_digest: 1bb03be9c56cffbf06e4e32b57c86b3f242684ca901ea0936b500f26cd4f7e2a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271333-ABXQBM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271333-ABXQBM
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

Align Writer ODT annotation text and metadata with native import

Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.

## Scope

- In scope: Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.
- Out of scope: unrelated refactors not required for "Align Writer ODT annotation text and metadata with native import".

## Plan

Trace XMLAnnotationImportContext, XMLTextImportHelper shape dispatch, the annotation Outliner property set and XMLTextFieldExport in pinned LibreOffice. Route the complete represented annotation child text through the native shared contexts with isolated list state. Preserve EditEngine text and metadata through Worker and ODT, align empty author/date export with the normal default, and record any native list or field behavior that looks incorrect. Port focused assertions from annotation-formatting.odt and resolved-comment.odt and check existing annotation, marker, paragraph-list and Worker tests. Run scoped lint, format, type, dependency and provenance checks. Preserve browser document lifecycle.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT annotation text and metadata with native import". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT annotation text and metadata with native import". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T14:53:14.278Z — VERIFY — ok

By: CODER

Note: Tests  27 passed (27). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:33:18.537Z, excerpt_hash=sha256:cf6c212fdc6716b075bada13f3557904a808dec3e6e7ed5f8bda9982b67585b4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271333-ABXQBM/blueprint/resolved-snapshot.json
- old_digest: 1bb03be9c56cffbf06e4e32b57c86b3f242684ca901ea0936b500f26cd4f7e2a
- current_digest: 1bb03be9c56cffbf06e4e32b57c86b3f242684ca901ea0936b500f26cd4f7e2a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271333-ABXQBM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271333-ABXQBM
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
