---
id: "202611280937-ZDM2NK"
title: "Align Writer ODT caption sequence fields and references"
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
  updated_at: "2026-11-28T09:37:23.116Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T09:56:34.104Z"
  updated_by: "CODER"
  note: "Sixteen focused Writer checks passed across five files, including assertions from two pinned ODT fixtures. TypeScript, scoped ESLint, module boundaries, source provenance, Writer inventory and diff checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T09:56:38.845Z"
  updated_by: "EVALUATOR"
  note: "Sequence definitions, numeric captions, and resolved references preserve the pinned ODT and Worker contracts."
  evaluated_sha: "7a95ff882700a3dee01b4c8e2a8e207b9693884c"
  blueprint_digest: "2cb6320730a04de719d72dad7ccfb9bbadebaec490344c121c76b669af12a563"
  evidence_refs:
    - ".agentplane/tasks/202611280937-ZDM2NK/README.md"
    - ".agentplane/tasks/202611280937-ZDM2NK/quality/20261128-095638845-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280937-ZDM2NK/quality/20261128-095638845-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280937-ZDM2NK/quality/20261128-095638845-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280937-ZDM2NK/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/writer-sequence-odf-verification.md"
  findings:
    - "The two pinned input files exercise modeled caption fields and forward references. Focused checks and static gates passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Port sequence declarations, caption numbering and native sequence references through Writer ODT and Worker."
events:
  -
    type: "status"
    at: "2026-11-28T09:37:23.959Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port sequence declarations, caption numbering and native sequence references through Writer ODT and Worker."
  -
    type: "verify"
    at: "2026-11-28T09:56:34.104Z"
    author: "CODER"
    state: "ok"
    note: "Sixteen focused Writer checks passed across five files, including assertions from two pinned ODT fixtures. TypeScript, scoped ESLint, module boundaries, source provenance, Writer inventory and diff checks passed."
doc_version: 3
doc_updated_at: "2026-11-28T09:56:34.156Z"
doc_updated_by: "CODER"
description: "Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests."
sections:
  Summary: |-
    Align Writer ODT caption sequence fields and references

    Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.
  Scope: |-
    - In scope: Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.
    - Out of scope: unrelated refactors not required for "Align Writer ODT caption sequence fields and references".
  Plan: "Trace SwSetExpFieldType and SwSetExpField sequence numbering, native sequence reference allocation and lookup, the XML value, declaration and reference import, and the ODF exporter. Reuse the document outline and numbering owners for chapter-qualified values. Implement the sequence field master, native identities and caption sequence references on the normal ODT and Worker paths. Preserve authored formulas and the corresponding represented Writer expression behavior. Replay the installed pinned caption fixture and run affected tests only."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT caption sequence fields and references". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT caption sequence fields and references". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T09:56:34.104Z — VERIFY — ok

    By: CODER

    Note: Sixteen focused Writer checks passed across five files, including assertions from two pinned ODT fixtures. TypeScript, scoped ESLint, module boundaries, source provenance, Writer inventory and diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T09:37:23.959Z, excerpt_hash=sha256:e98e1579fdf02438c805188823ce7c8000a9c69d8070e723908d474afa65e518

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280937-ZDM2NK/blueprint/resolved-snapshot.json
    - old_digest: 2cb6320730a04de719d72dad7ccfb9bbadebaec490344c121c76b669af12a563
    - current_digest: 2cb6320730a04de719d72dad7ccfb9bbadebaec490344c121c76b669af12a563
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280937-ZDM2NK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280937-ZDM2NK
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

Align Writer ODT caption sequence fields and references

Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.

## Scope

- In scope: Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.
- Out of scope: unrelated refactors not required for "Align Writer ODT caption sequence fields and references".

## Plan

Trace SwSetExpFieldType and SwSetExpField sequence numbering, native sequence reference allocation and lookup, the XML value, declaration and reference import, and the ODF exporter. Reuse the document outline and numbering owners for chapter-qualified values. Implement the sequence field master, native identities and caption sequence references on the normal ODT and Worker paths. Preserve authored formulas and the corresponding represented Writer expression behavior. Replay the installed pinned caption fixture and run affected tests only.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT caption sequence fields and references". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT caption sequence fields and references". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T09:56:34.104Z — VERIFY — ok

By: CODER

Note: Sixteen focused Writer checks passed across five files, including assertions from two pinned ODT fixtures. TypeScript, scoped ESLint, module boundaries, source provenance, Writer inventory and diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T09:37:23.959Z, excerpt_hash=sha256:e98e1579fdf02438c805188823ce7c8000a9c69d8070e723908d474afa65e518

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280937-ZDM2NK/blueprint/resolved-snapshot.json
- old_digest: 2cb6320730a04de719d72dad7ccfb9bbadebaec490344c121c76b669af12a563
- current_digest: 2cb6320730a04de719d72dad7ccfb9bbadebaec490344c121c76b669af12a563
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280937-ZDM2NK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280937-ZDM2NK
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
