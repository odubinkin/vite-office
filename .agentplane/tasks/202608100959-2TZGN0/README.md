---
id: "202608100959-2TZGN0"
title: "Extract pinned LibreOffice core test source targets into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "tests"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:59:26.950Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-10T10:27:40.756Z"
  updated_by: "CODER"
  note: "verified-202608100959-2TZGN0"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-10T10:27:50.031Z"
  updated_by: "EVALUATOR"
  note: "Pinned CppunitTest source-target inventory matches the approved provenance-only scope."
  evaluated_sha: "001b8d1fc65c42fe93373171c6e67745380735ab"
  blueprint_digest: "2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e"
  evidence_refs:
    - ".agentplane/tasks/202608100959-2TZGN0/README.md"
    - ".agentplane/tasks/202608100959-2TZGN0/quality/20260810-102750031-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608100959-2TZGN0/quality/20260810-102750031-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608100959-2TZGN0/quality/20260810-102750031-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608100959-2TZGN0/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "No defects found; full verification and deterministic regeneration passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: extract exact pinned core test source targets as deterministic provenance-only records."
events:
  -
    type: "status"
    at: "2026-08-10T09:59:28.360Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract exact pinned core test source targets as deterministic provenance-only records."
  -
    type: "verify"
    at: "2026-08-10T10:27:20.037Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: full npm verify passed; deterministic regeneration matched byte-for-byte; 686 records link to constructor IDs and literal paths are Git-tracked."
  -
    type: "verify"
    at: "2026-08-10T10:27:40.756Z"
    author: "CODER"
    state: "ok"
    note: "verified-202608100959-2TZGN0"
doc_version: 3
doc_updated_at: "2026-08-10T10:27:40.838Z"
doc_updated_by: "CODER"
description: "Parse pinned gbuild test declarations into deterministic provenance-only test source-target records that connect each inventoried constructor to exact referenced core paths without copying test content or claiming test parity."
sections:
  Summary: |-
    Extract pinned LibreOffice core test source targets into atomic records

    Parse pinned gbuild test declarations into deterministic provenance-only test source-target records that connect each inventoried constructor to exact referenced core paths without copying test content or claiming test parity.
  Scope: "In scope: deterministic provenance-only extraction of exact core paths declared as gbuild test source targets for the pinned constructor inventory. Out of scope: copying test source or fixtures, changing test parity claims, and implementing user-facing behavior."
  Plan: "1. Identify stable gbuild source-target declaration forms in the pinned core. 2. Extract exact path-level records linked to constructor inventory IDs. 3. Cover parsing and corpus generation at 100% inventory coverage. 4. Generate documented canonical JSON and prove equality with pinned Git paths. 5. Run full verification and close the task."
  Verify Steps: "1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated source target with the pinned core Git path set and linked constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T10:27:20.037Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: full npm verify passed; deterministic regeneration matched byte-for-byte; 686 records link to constructor IDs and literal paths are Git-tracked.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:59:28.360Z, excerpt_hash=sha256:7f47cec325635eadab40e031a5b7f5966eba2bd8c04b7db825698bf020a0dc68

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100959-2TZGN0/blueprint/resolved-snapshot.json
    - old_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
    - current_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100959-2TZGN0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100959-2TZGN0
    - diagnostic_command: agentplane task run status 202608100959-2TZGN0
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    ### 2026-08-10T10:27:40.756Z — VERIFY — ok

    By: CODER

    Note: verified-202608100959-2TZGN0
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T10:27:20.112Z, excerpt_hash=sha256:7f47cec325635eadab40e031a5b7f5966eba2bd8c04b7db825698bf020a0dc68

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100959-2TZGN0/blueprint/resolved-snapshot.json
    - old_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
    - current_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100959-2TZGN0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202608100959-2TZGN0 --result verified-202608100959-2TZGN0 --commit 001b8d1fc65c42fe93373171c6e67745380735ab
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task commits and rerun npm run verify; no ignored reference content is modified."
  Findings: ""
id_source: "generated"
---
## Summary

Extract pinned LibreOffice core test source targets into atomic records

Parse pinned gbuild test declarations into deterministic provenance-only test source-target records that connect each inventoried constructor to exact referenced core paths without copying test content or claiming test parity.

## Scope

In scope: deterministic provenance-only extraction of exact core paths declared as gbuild test source targets for the pinned constructor inventory. Out of scope: copying test source or fixtures, changing test parity claims, and implementing user-facing behavior.

## Plan

1. Identify stable gbuild source-target declaration forms in the pinned core. 2. Extract exact path-level records linked to constructor inventory IDs. 3. Cover parsing and corpus generation at 100% inventory coverage. 4. Generate documented canonical JSON and prove equality with pinned Git paths. 5. Run full verification and close the task.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated source target with the pinned core Git path set and linked constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T10:27:20.037Z — VERIFY — ok

By: REVIEWER

Note: Verified: full npm verify passed; deterministic regeneration matched byte-for-byte; 686 records link to constructor IDs and literal paths are Git-tracked.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:59:28.360Z, excerpt_hash=sha256:7f47cec325635eadab40e031a5b7f5966eba2bd8c04b7db825698bf020a0dc68

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100959-2TZGN0/blueprint/resolved-snapshot.json
- old_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
- current_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100959-2TZGN0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100959-2TZGN0
- diagnostic_command: agentplane task run status 202608100959-2TZGN0
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

### 2026-08-10T10:27:40.756Z — VERIFY — ok

By: CODER

Note: verified-202608100959-2TZGN0
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T10:27:20.112Z, excerpt_hash=sha256:7f47cec325635eadab40e031a5b7f5966eba2bd8c04b7db825698bf020a0dc68

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100959-2TZGN0/blueprint/resolved-snapshot.json
- old_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
- current_digest: 2db164e240a89a8a53b9f1b1e17d23405288e0a724ea6a8eb7f60f847f354f6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100959-2TZGN0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202608100959-2TZGN0 --result verified-202608100959-2TZGN0 --commit 001b8d1fc65c42fe93373171c6e67745380735ab
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task commits and rerun npm run verify; no ignored reference content is modified.

## Findings
