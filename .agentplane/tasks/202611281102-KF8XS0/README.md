---
id: "202611281102-KF8XS0"
title: "Align Writer ODT hidden paragraph fields and conditional visibility"
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
  updated_at: "2026-11-28T11:02:37.474Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T11:13:46.104Z"
  updated_by: "CODER"
  note: "48 focused Writer checks across six suites including the pinned text fly, Worker and same-model ODT; TypeScript, lint, boundaries, provenance and inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T11:13:46.553Z"
  updated_by: "EVALUATOR"
  note: "Native paragraph visibility follows ODT field conditions and represented Writer view layout."
  evaluated_sha: "7fde1272b270feeb12f6f519ded7066ad9569502"
  blueprint_digest: "a0ba524bfb2c0b3f26c839eaab666e6582e55939bf33b8a005f9957133146964"
  evidence_refs:
    - ".agentplane/tasks/202611281102-KF8XS0/README.md"
    - ".agentplane/tasks/202611281102-KF8XS0/quality/20261128-111346553-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611281102-KF8XS0/quality/20261128-111346553-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611281102-KF8XS0/quality/20261128-111346553-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611281102-KF8XS0/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/writer-hidden-paragraph-verification.md"
  findings:
    - "Preserves the non-hiding field precedence and a usable first body frame. Desktop field-name UI and PDF geometry remain outside the represented slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: model the native hidden-paragraph field and its condition and layout behavior."
events:
  -
    type: "status"
    at: "2026-11-28T11:02:37.832Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: model the native hidden-paragraph field and its condition and layout behavior."
  -
    type: "verify"
    at: "2026-11-28T11:13:46.104Z"
    author: "CODER"
    state: "ok"
    note: "48 focused Writer checks across six suites including the pinned text fly, Worker and same-model ODT; TypeScript, lint, boundaries, provenance and inventory passed."
doc_version: 3
doc_updated_at: "2026-11-28T11:13:46.157Z"
doc_updated_by: "CODER"
description: "Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests."
sections:
  Summary: |-
    Align Writer ODT hidden paragraph fields and conditional visibility

    Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.
  Scope: |-
    - In scope: Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.
    - Out of scope: unrelated refactors not required for "Align Writer ODT hidden paragraph fields and conditional visibility".
  Plan: "Port SwHiddenParaField and its native UNO properties, ODT namespaces/defaults/export, model hints and Worker persistence. Reuse the document expression pass and native string comparison/coercion in SwCalc. Derive paragraph visibility through native hints and represented frame/presentation projections, including the first visible body paragraph contract. Replay the pinned hidden paragraph in a text fly for ODT, Worker and the represented layout/presentation. Verify affected existing suites and static checks only."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT hidden paragraph fields and conditional visibility". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT hidden paragraph fields and conditional visibility". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T11:13:46.104Z — VERIFY — ok

    By: CODER

    Note: 48 focused Writer checks across six suites including the pinned text fly, Worker and same-model ODT; TypeScript, lint, boundaries, provenance and inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T11:02:37.832Z, excerpt_hash=sha256:74b786207dc5ec9939537ab0097511224f7a2f120aca1244adef1ee28110afbb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281102-KF8XS0/blueprint/resolved-snapshot.json
    - old_digest: a0ba524bfb2c0b3f26c839eaab666e6582e55939bf33b8a005f9957133146964
    - current_digest: a0ba524bfb2c0b3f26c839eaab666e6582e55939bf33b8a005f9957133146964
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281102-KF8XS0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281102-KF8XS0
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

Align Writer ODT hidden paragraph fields and conditional visibility

Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.

## Scope

- In scope: Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.
- Out of scope: unrelated refactors not required for "Align Writer ODT hidden paragraph fields and conditional visibility".

## Plan

Port SwHiddenParaField and its native UNO properties, ODT namespaces/defaults/export, model hints and Worker persistence. Reuse the document expression pass and native string comparison/coercion in SwCalc. Derive paragraph visibility through native hints and represented frame/presentation projections, including the first visible body paragraph contract. Replay the pinned hidden paragraph in a text fly for ODT, Worker and the represented layout/presentation. Verify affected existing suites and static checks only.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT hidden paragraph fields and conditional visibility". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT hidden paragraph fields and conditional visibility". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T11:13:46.104Z — VERIFY — ok

By: CODER

Note: 48 focused Writer checks across six suites including the pinned text fly, Worker and same-model ODT; TypeScript, lint, boundaries, provenance and inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T11:02:37.832Z, excerpt_hash=sha256:74b786207dc5ec9939537ab0097511224f7a2f120aca1244adef1ee28110afbb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281102-KF8XS0/blueprint/resolved-snapshot.json
- old_digest: a0ba524bfb2c0b3f26c839eaab666e6582e55939bf33b8a005f9957133146964
- current_digest: a0ba524bfb2c0b3f26c839eaab666e6582e55939bf33b8a005f9957133146964
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281102-KF8XS0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281102-KF8XS0
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
