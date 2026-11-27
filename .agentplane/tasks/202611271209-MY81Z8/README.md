---
id: "202611271209-MY81Z8"
title: "Implement native Writer index marks in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
  updated_at: "2026-11-27T12:10:19.486Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T14:36:58.020Z"
  updated_by: "CODER"
  note: "Tests  690 passed | 6 skipped (696). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:36:58.550Z"
  updated_by: "EVALUATOR"
  note: "The unmodified tdf149248.odt, whitespace.odt and udindex3.odt retained their native range pairs, original whitespace and TOC/user type ownership across Worker and ODT reopening. The XML writer consumed the native dummy characters."
  evaluated_sha: "8ccf760cd25653c6dff9654a3330c8abd25fe4f0"
  blueprint_digest: "0a1b3f14dff8741e8ff6183cc0708bcdd8efac01d3f02642ac857dee0379b014"
  evidence_refs:
    - ".agentplane/tasks/202611271209-MY81Z8/README.md"
    - ".agentplane/tasks/202611271209-MY81Z8/quality/20261127-143658550-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271209-MY81Z8/quality/20261127-143658550-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271209-MY81Z8/quality/20261127-143658550-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271209-MY81Z8/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/MY81Z8/verification.md"
    - "8ccf760cd25653c6dff9654a3330c8abd25fe4f0"
  findings:
    - "Interactive index regeneration, index jump links and index sections other than contents remain outside this task."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: preserve native contents, user and alphabetical index marks through the Writer ODT and Worker boundaries."
events:
  -
    type: "status"
    at: "2026-11-27T12:10:22.345Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native contents, user and alphabetical index marks through the Writer ODT and Worker boundaries."
  -
    type: "verify"
    at: "2026-11-27T14:36:58.020Z"
    author: "CODER"
    state: "ok"
    note: "Tests  690 passed | 6 skipped (696). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:36:58.087Z"
doc_updated_by: "CODER"
description: "Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task."
sections:
  Summary: |-
    Implement native Writer index marks in ODT

    Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.
  Scope: |-
    - In scope: Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.
    - Out of scope: unrelated refactors not required for "Implement native Writer index marks in ODT".
  Plan: "1. Port SwTOXMark and SwTextTOXMark with native point/range hint ownership and descriptor attach. 2. Port the original xmloff mark import/export contexts, original property defaults and source pairing, using the existing text cursor and hint traversal. 3. Persist the normal native hints through the Worker and verify pinned cases and related existing tests. Interactive index generation and unsupported index section families remain outside this filter task."
  Verify Steps: "Verify connected native point and range index marks in the pinned Writer fixtures, including text boundaries, source properties and nested ranges. Verify the same marks and intentional whitespace through Worker graph transport and ODT export/reopen. Run existing relevant Writer hint, ODF marker, undo and Worker tests plus focused static, dependency, provenance and Writer/shared registry checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T14:36:58.020Z — VERIFY — ok

    By: CODER

    Note: Tests  690 passed | 6 skipped (696). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:10:22.345Z, excerpt_hash=sha256:d8b5c41f020b277c68de1ffa5be1ce61b2c4b7b6c07951805044c7aa6dd79136

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271209-MY81Z8/blueprint/resolved-snapshot.json
    - old_digest: 0a1b3f14dff8741e8ff6183cc0708bcdd8efac01d3f02642ac857dee0379b014
    - current_digest: 0a1b3f14dff8741e8ff6183cc0708bcdd8efac01d3f02642ac857dee0379b014
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271209-MY81Z8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271209-MY81Z8
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

Implement native Writer index marks in ODT

Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.

## Scope

- In scope: Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.
- Out of scope: unrelated refactors not required for "Implement native Writer index marks in ODT".

## Plan

1. Port SwTOXMark and SwTextTOXMark with native point/range hint ownership and descriptor attach. 2. Port the original xmloff mark import/export contexts, original property defaults and source pairing, using the existing text cursor and hint traversal. 3. Persist the normal native hints through the Worker and verify pinned cases and related existing tests. Interactive index generation and unsupported index section families remain outside this filter task.

## Verify Steps

Verify connected native point and range index marks in the pinned Writer fixtures, including text boundaries, source properties and nested ranges. Verify the same marks and intentional whitespace through Worker graph transport and ODT export/reopen. Run existing relevant Writer hint, ODF marker, undo and Worker tests plus focused static, dependency, provenance and Writer/shared registry checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T14:36:58.020Z — VERIFY — ok

By: CODER

Note: Tests  690 passed | 6 skipped (696). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:10:22.345Z, excerpt_hash=sha256:d8b5c41f020b277c68de1ffa5be1ce61b2c4b7b6c07951805044c7aa6dd79136

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271209-MY81Z8/blueprint/resolved-snapshot.json
- old_digest: 0a1b3f14dff8741e8ff6183cc0708bcdd8efac01d3f02642ac857dee0379b014
- current_digest: 0a1b3f14dff8741e8ff6183cc0708bcdd8efac01d3f02642ac857dee0379b014
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271209-MY81Z8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271209-MY81Z8
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
