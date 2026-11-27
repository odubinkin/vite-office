---
id: "202611271659-6P09PX"
title: "Implement native Writer redline formatting in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  updated_at: "2026-11-27T17:00:14.424Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T17:10:08.146Z"
  updated_by: "CODER"
  note: "Forty Writer tests and three tooling tests passed. Both original format-redline fixtures retain the previous style and direct size through the Worker and ODT. Office typecheck, lint, module boundaries, provenance and scoped inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T17:10:09.842Z"
  updated_by: "EVALUATOR"
  note: "Writer redline prior character formatting is now owned by the original automatic-style item set."
  evaluated_sha: "fda30b316e25b9789772499678b214f71b386956"
  blueprint_digest: "bce499cecf9a3328600b655855bcd8f04841adc5d5424a8dbab24ae2ebf64015"
  evidence_refs:
    - ".agentplane/tasks/202611271659-6P09PX/README.md"
    - ".agentplane/tasks/202611271659-6P09PX/quality/20261127-171009842-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271659-6P09PX/quality/20261127-171009842-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271659-6P09PX/quality/20261127-171009842-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271659-6P09PX/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/prior-style-verification.md"
  findings:
    - "Both pinned LibreOffice formats preserve old named and direct properties through import, Worker and export."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port original previous-format data ownership and ODT style pass."
events:
  -
    type: "status"
    at: "2026-11-27T17:00:14.876Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original previous-format data ownership and ODT style pass."
  -
    type: "verify"
    at: "2026-11-27T17:10:08.146Z"
    author: "CODER"
    state: "ok"
    note: "Forty Writer tests and three tooling tests passed. Both original format-redline fixtures retain the previous style and direct size through the Worker and ODT. Office typecheck, lint, module boundaries, provenance and scoped inventory passed."
doc_version: 3
doc_updated_at: "2026-11-27T17:10:08.329Z"
doc_updated_by: "CODER"
description: "Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures."
sections:
  Summary: |-
    Implement native Writer redline formatting in ODT

    Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.
  Scope: |-
    - In scope: Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.
    - Out of scope: unrelated refactors not required for "Implement native Writer redline formatting in ODT".
  Plan: "Use native SwRedlineExtraData_FormatColl holding an owned automatic SfxItemSet. Resolve old named and automatic style definitions through the existing xmloff and Writer style pools; transport actual item and named-format ownership across the Worker. Collect old formatting in the same text automatic-style pass and write the exported reference. Port testFormatCharStyleChangeOdtImport and testFormatCharstyleDirectOdtImport using their original fixtures and replay related Writer style/ODT checks. Keep visible-change layout and browser save policy outside this task."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer redline formatting in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer redline formatting in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T17:10:08.146Z — VERIFY — ok

    By: CODER

    Note: Forty Writer tests and three tooling tests passed. Both original format-redline fixtures retain the previous style and direct size through the Worker and ODT. Office typecheck, lint, module boundaries, provenance and scoped inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:00:14.876Z, excerpt_hash=sha256:7c7c4837acd53d4e4d711bb717f2578557c90495e2a5973f777a90da8e3343da

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271659-6P09PX/blueprint/resolved-snapshot.json
    - old_digest: bce499cecf9a3328600b655855bcd8f04841adc5d5424a8dbab24ae2ebf64015
    - current_digest: bce499cecf9a3328600b655855bcd8f04841adc5d5424a8dbab24ae2ebf64015
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271659-6P09PX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271659-6P09PX
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

Implement native Writer redline formatting in ODT

Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.

## Scope

- In scope: Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.
- Out of scope: unrelated refactors not required for "Implement native Writer redline formatting in ODT".

## Plan

Use native SwRedlineExtraData_FormatColl holding an owned automatic SfxItemSet. Resolve old named and automatic style definitions through the existing xmloff and Writer style pools; transport actual item and named-format ownership across the Worker. Collect old formatting in the same text automatic-style pass and write the exported reference. Port testFormatCharStyleChangeOdtImport and testFormatCharstyleDirectOdtImport using their original fixtures and replay related Writer style/ODT checks. Keep visible-change layout and browser save policy outside this task.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer redline formatting in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer redline formatting in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T17:10:08.146Z — VERIFY — ok

By: CODER

Note: Forty Writer tests and three tooling tests passed. Both original format-redline fixtures retain the previous style and direct size through the Worker and ODT. Office typecheck, lint, module boundaries, provenance and scoped inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:00:14.876Z, excerpt_hash=sha256:7c7c4837acd53d4e4d711bb717f2578557c90495e2a5973f777a90da8e3343da

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271659-6P09PX/blueprint/resolved-snapshot.json
- old_digest: bce499cecf9a3328600b655855bcd8f04841adc5d5424a8dbab24ae2ebf64015
- current_digest: bce499cecf9a3328600b655855bcd8f04841adc5d5424a8dbab24ae2ebf64015
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271659-6P09PX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271659-6P09PX
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
