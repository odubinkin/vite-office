---
id: "202609241521-D5QMQG"
title: "Complete scalar paragraph character and page properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609241521-NM0G73"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run source-backed scalar ODT fixture tests plus UI property edit/reopen tests and invalid-value tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:16.293Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
verification:
  state: "ok"
  updated_at: "2026-09-24T17:31:21.036Z"
  updated_by: "CODER"
  note: "Full npm run verify passed; pinned ODT feature, inherited/direct/invalid round-trip, UI reopen, and private diagnostic checks passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T16:23:56.980Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-24T17:31:21.036Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed; pinned ODT feature, inherited/direct/invalid round-trip, UI reopen, and private diagnostic checks passed."
doc_version: 3
doc_updated_at: "2026-09-24T17:31:21.118Z"
doc_updated_by: "CODER"
description: "Phase 2: upstream-mapped scalar style items, inheritance, import/export, rendering and Writer controls/dialogs."
sections:
  Summary: |-
    Complete scalar paragraph character and page properties

    Phase 2: upstream-mapped scalar style items, inheritance, import/export, rendering and Writer controls/dialogs.
  Scope: "Scalar paragraph, character and page items, inherited/direct style routing, export/reimport, layout and editable Writer controls."
  Plan: |-
    1. Map each observed property to pinned style context and pooled item.
    2. Implement canonical import/export and inherited/default behavior.
    3. Extend Paragraph, Character and Page Style controls with upstream choices/defaults/validation.
    4. Verify layout and UI persistence with pinned ODTs and synthetic invalid cases.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. Pinned `tdf114287.odt` and `styles.odt` feature tests pass, plus another upstream ODT where needed.
    3. Representative inherited, direct and invalid property tests pass through import/export/reimport.
    4. UI tests set and reopen every newly editable property; sample warning and semantic deltas are recorded.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T17:31:21.036Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed; pinned ODT feature, inherited/direct/invalid round-trip, UI reopen, and private diagnostic checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T17:31:14.108Z, excerpt_hash=sha256:91a0f46fb20a79b6a3ab612a00fcbbe13ffba7bfb02594bad108cdc548d6c82c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-D5QMQG/blueprint/resolved-snapshot.json
    - old_digest: 29112ac133fdfb5bbdea2e818f62d24d7e12330971fae6f40a128c8835e93131
    - current_digest: 29112ac133fdfb5bbdea2e818f62d24d7e12330971fae6f40a128c8835e93131
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-D5QMQG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241521-D5QMQG
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
  Findings: "Implemented pinned Writer pooled items for split, widow/orphan, break, auto first-line indent, and page descriptor/number; mapped ODF parsing, export/reimport, pagination, and Paragraph dialog controls. The named-style inheritance regression found by full fixture verification was corrected in xmloff. Full npm run verify passed, including 501 office tests with 100% coverage, 107 inventory tests, 14 browser e2e tests, source provenance and parity. Pinned styles.odt and tdf114287.odt assertions pass. Local private sample: 445 warnings/173 groups at phase 1 versus 393 warnings/160 groups now; canonical diagnostic projection remains 59 paragraphs and 14 link runs; the private file and text are not tracked."
id_source: "generated"
---
## Summary

Complete scalar paragraph character and page properties

Phase 2: upstream-mapped scalar style items, inheritance, import/export, rendering and Writer controls/dialogs.

## Scope

Scalar paragraph, character and page items, inherited/direct style routing, export/reimport, layout and editable Writer controls.

## Plan

1. Map each observed property to pinned style context and pooled item.
2. Implement canonical import/export and inherited/default behavior.
3. Extend Paragraph, Character and Page Style controls with upstream choices/defaults/validation.
4. Verify layout and UI persistence with pinned ODTs and synthetic invalid cases.

## Verify Steps

1. `npm run verify` passes.
2. Pinned `tdf114287.odt` and `styles.odt` feature tests pass, plus another upstream ODT where needed.
3. Representative inherited, direct and invalid property tests pass through import/export/reimport.
4. UI tests set and reopen every newly editable property; sample warning and semantic deltas are recorded.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T17:31:21.036Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed; pinned ODT feature, inherited/direct/invalid round-trip, UI reopen, and private diagnostic checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T17:31:14.108Z, excerpt_hash=sha256:91a0f46fb20a79b6a3ab612a00fcbbe13ffba7bfb02594bad108cdc548d6c82c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-D5QMQG/blueprint/resolved-snapshot.json
- old_digest: 29112ac133fdfb5bbdea2e818f62d24d7e12330971fae6f40a128c8835e93131
- current_digest: 29112ac133fdfb5bbdea2e818f62d24d7e12330971fae6f40a128c8835e93131
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-D5QMQG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241521-D5QMQG
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

Implemented pinned Writer pooled items for split, widow/orphan, break, auto first-line indent, and page descriptor/number; mapped ODF parsing, export/reimport, pagination, and Paragraph dialog controls. The named-style inheritance regression found by full fixture verification was corrected in xmloff. Full npm run verify passed, including 501 office tests with 100% coverage, 107 inventory tests, 14 browser e2e tests, source provenance and parity. Pinned styles.odt and tdf114287.odt assertions pass. Local private sample: 445 warnings/173 groups at phase 1 versus 393 warnings/160 groups now; canonical diagnostic projection remains 59 paragraphs and 14 link runs; the private file and text are not tracked.
