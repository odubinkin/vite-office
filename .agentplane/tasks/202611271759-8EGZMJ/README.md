---
id: "202611271759-8EGZMJ"
title: "Implement native Writer reference marks in ODT"
result_summary: "Writer ODT preserves actual named reference marks and native hint ownership."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "odf"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:59:43.342Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T18:15:30.527Z"
  updated_by: "CODER"
  note: "216 focused Writer checks and 3 targeted WhichId cases passed. Original whitespace.odt retains point and range reference marks through the Writer Worker and package reopen. Static and provenance checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T18:15:31.303Z"
  updated_by: "EVALUATOR"
  note: "Writer preserves original named reference marks through ODT and Worker on native text hints."
  evaluated_sha: "9b4abc8280042041076ddb80dc057f7013bacde9"
  blueprint_digest: "1537415af64eaafed1f430712b5fa18c04367125965a194b0aa004f35f24bc08"
  evidence_refs:
    - ".agentplane/tasks/202611271759-8EGZMJ/README.md"
    - ".agentplane/tasks/202611271759-8EGZMJ/quality/20261127-181531303-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271759-8EGZMJ/quality/20261127-181531303-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271759-8EGZMJ/quality/20261127-181531303-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271759-8EGZMJ/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/refmark-verification.md"
  findings:
    - "Point and range assertions are ported from the original ODT fixture. Documented the source expansion and rename behavior."
commit:
  hash: "9b4abc8280042041076ddb80dc057f7013bacde9"
  message: "🧩 8EGZMJ writer: preserve native reference marks in ODT"
comments:
  -
    author: "CODER"
    body: "Start: implement actual Writer reference-mark hints and the ODT paths."
  -
    author: "CODER"
    body: "Verified: original whitespace.odt point and range reference marks, Worker transfer and ODT reopen, with all 216 focused Writer tests passing."
events:
  -
    type: "status"
    at: "2026-11-27T17:59:43.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual Writer reference-mark hints and the ODT paths."
  -
    type: "verify"
    at: "2026-11-27T18:15:30.527Z"
    author: "CODER"
    state: "ok"
    note: "216 focused Writer checks and 3 targeted WhichId cases passed. Original whitespace.odt retains point and range reference marks through the Writer Worker and package reopen. Static and provenance checks passed."
  -
    type: "status"
    at: "2026-11-27T18:17:00.940Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original whitespace.odt point and range reference marks, Worker transfer and ODT reopen, with all 216 focused Writer tests passing."
doc_version: 3
doc_updated_at: "2026-11-27T18:17:00.941Z"
doc_updated_by: "CODER"
description: "Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue."
sections:
  Summary: |-
    Implement native Writer reference marks in ODT

    Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.
  Scope: |-
    - In scope: Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.
    - Out of scope: unrelated refactors not required for "Implement native Writer reference marks in ODT".
  Plan: "Implement the original reference-mark pooled item, no-end dummy character and overlap-capable SwTextRefMark in existing Writer hint maps. Use the native insertion naming and range rules through the Writer UNO adapter. Keep point and ranged ODT import in their original xmloff contexts and export names at native paragraph boundaries. Transfer the same hints through the Worker. Port the original whitespace.odt point and range expectations, preserve missing-end collapse and expansion behavior, and update WhichId provenance and the suspected issue note. The reference field evaluator and desktop commands are outside this slice."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer reference marks in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer reference marks in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T18:15:30.527Z — VERIFY — ok

    By: CODER

    Note: 216 focused Writer checks and 3 targeted WhichId cases passed. Original whitespace.odt retains point and range reference marks through the Writer Worker and package reopen. Static and provenance checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:59:43.730Z, excerpt_hash=sha256:39a67dba70c2835f0fa28a83521c3556c60ebaf3d3158bab8132a16628046974

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271759-8EGZMJ/blueprint/resolved-snapshot.json
    - old_digest: 1537415af64eaafed1f430712b5fa18c04367125965a194b0aa004f35f24bc08
    - current_digest: 1537415af64eaafed1f430712b5fa18c04367125965a194b0aa004f35f24bc08
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271759-8EGZMJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271759-8EGZMJ
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

Implement native Writer reference marks in ODT

Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.

## Scope

- In scope: Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.
- Out of scope: unrelated refactors not required for "Implement native Writer reference marks in ODT".

## Plan

Implement the original reference-mark pooled item, no-end dummy character and overlap-capable SwTextRefMark in existing Writer hint maps. Use the native insertion naming and range rules through the Writer UNO adapter. Keep point and ranged ODT import in their original xmloff contexts and export names at native paragraph boundaries. Transfer the same hints through the Worker. Port the original whitespace.odt point and range expectations, preserve missing-end collapse and expansion behavior, and update WhichId provenance and the suspected issue note. The reference field evaluator and desktop commands are outside this slice.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer reference marks in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer reference marks in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T18:15:30.527Z — VERIFY — ok

By: CODER

Note: 216 focused Writer checks and 3 targeted WhichId cases passed. Original whitespace.odt retains point and range reference marks through the Writer Worker and package reopen. Static and provenance checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:59:43.730Z, excerpt_hash=sha256:39a67dba70c2835f0fa28a83521c3556c60ebaf3d3158bab8132a16628046974

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271759-8EGZMJ/blueprint/resolved-snapshot.json
- old_digest: 1537415af64eaafed1f430712b5fa18c04367125965a194b0aa004f35f24bc08
- current_digest: 1537415af64eaafed1f430712b5fa18c04367125965a194b0aa004f35f24bc08
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271759-8EGZMJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271759-8EGZMJ
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
