---
id: "202611280824-8CEV8N"
title: "Port Writer ODT heading fields and chapter references"
result_summary: "Aligned ODT chapter fields, chapter references and heading numbering with the pinned Writer core."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
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
  updated_at: "2026-11-28T08:24:55.241Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T09:01:40.037Z"
  updated_by: "CODER"
  note: "20 final affected Writer tests across six files, including the corrected native unnumbered heading behavior. Scoped ESLint, formatting, typecheck, dependency and provenance checks passed. Writer registry reported zero semantic violations."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T09:01:43.419Z"
  updated_by: "EVALUATOR"
  note: "ODT chapter fields, heading rules and chapter references follow the pinned owners and XML contracts in the represented layout."
  evaluated_sha: "e3c5f2524746c3f89a24f8bc4eb235dc3e0eb82a"
  blueprint_digest: "e68cceb15840a5f185d535fd0b1e03dfbc8d5b4e13e0f0d087f53daf4bed114b"
  evidence_refs:
    - ".agentplane/tasks/202611280824-8CEV8N/README.md"
    - ".agentplane/tasks/202611280824-8CEV8N/quality/20261128-090143419-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280824-8CEV8N/quality/20261128-090143419-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280824-8CEV8N/quality/20261128-090143419-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280824-8CEV8N/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/writer-chapter-field-verification.md"
  findings:
    - "The original fixture and authored layout exercise header fields, heading numbering, chapter references, and Worker plus ODT roundtrips."
commit:
  hash: "e3c5f2524746c3f89a24f8bc4eb235dc3e0eb82a"
  message: "🧩 8CEV8N writer: align ODT chapter fields and outline numbering"
comments:
  -
    author: "CODER"
    body: "Start: port the native heading lookup, Chapter field and chapter-reference presentation across the represented Writer layout and ODT path."
  -
    author: "CODER"
    body: "Verified: 20 affected Writer tests and static checks passed. Writer registry reported zero semantic violations."
events:
  -
    type: "status"
    at: "2026-11-28T08:24:55.599Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the native heading lookup, Chapter field and chapter-reference presentation across the represented Writer layout and ODT path."
  -
    type: "verify"
    at: "2026-11-28T09:01:40.037Z"
    author: "CODER"
    state: "ok"
    note: "20 final affected Writer tests across six files, including the corrected native unnumbered heading behavior. Scoped ESLint, formatting, typecheck, dependency and provenance checks passed. Writer registry reported zero semantic violations."
  -
    type: "status"
    at: "2026-11-28T09:08:20.613Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 20 affected Writer tests and static checks passed. Writer registry reported zero semantic violations."
doc_version: 3
doc_updated_at: "2026-11-28T09:08:20.615Z"
doc_updated_by: "CODER"
description: "Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker."
sections:
  Summary: |-
    Port Writer ODT heading fields and chapter references

    Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.
  Scope: |-
    - In scope: Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.
    - Out of scope: unrelated refactors not required for "Port Writer ODT heading fields and chapter references".
  Plan: "Trace pinned SwChapterField, SwNode outline lookup, plain outline number formatting and the Chapter UNO and XML contexts. Implement numbered headings and chapter references through native body/layout story lookup, ODT and Worker. Replay a pinned ODT chapter-field fixture and verify the affected Writer tests only. Preserve browser file/recovery and save behavior. Do not run full verification."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Writer ODT heading fields and chapter references". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Writer ODT heading fields and chapter references". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T09:01:40.037Z — VERIFY — ok

    By: CODER

    Note: 20 final affected Writer tests across six files, including the corrected native unnumbered heading behavior. Scoped ESLint, formatting, typecheck, dependency and provenance checks passed. Writer registry reported zero semantic violations.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:24:55.599Z, excerpt_hash=sha256:6c912e37ee7f569e70c88aeffbb1a733180e0b75f11ad0ec4d8f6fea22a9fe5a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280824-8CEV8N/blueprint/resolved-snapshot.json
    - old_digest: e68cceb15840a5f185d535fd0b1e03dfbc8d5b4e13e0f0d087f53daf4bed114b
    - current_digest: e68cceb15840a5f185d535fd0b1e03dfbc8d5b4e13e0f0d087f53daf4bed114b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280824-8CEV8N

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280824-8CEV8N
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

Port Writer ODT heading fields and chapter references

Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.

## Scope

- In scope: Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.
- Out of scope: unrelated refactors not required for "Port Writer ODT heading fields and chapter references".

## Plan

Trace pinned SwChapterField, SwNode outline lookup, plain outline number formatting and the Chapter UNO and XML contexts. Implement numbered headings and chapter references through native body/layout story lookup, ODT and Worker. Replay a pinned ODT chapter-field fixture and verify the affected Writer tests only. Preserve browser file/recovery and save behavior. Do not run full verification.

## Verify Steps

PLANNER fallback scaffold for "Port Writer ODT heading fields and chapter references". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Writer ODT heading fields and chapter references". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T09:01:40.037Z — VERIFY — ok

By: CODER

Note: 20 final affected Writer tests across six files, including the corrected native unnumbered heading behavior. Scoped ESLint, formatting, typecheck, dependency and provenance checks passed. Writer registry reported zero semantic violations.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:24:55.599Z, excerpt_hash=sha256:6c912e37ee7f569e70c88aeffbb1a733180e0b75f11ad0ec4d8f6fea22a9fe5a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280824-8CEV8N/blueprint/resolved-snapshot.json
- old_digest: e68cceb15840a5f185d535fd0b1e03dfbc8d5b4e13e0f0d087f53daf4bed114b
- current_digest: e68cceb15840a5f185d535fd0b1e03dfbc8d5b4e13e0f0d087f53daf4bed114b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280824-8CEV8N

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280824-8CEV8N
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
