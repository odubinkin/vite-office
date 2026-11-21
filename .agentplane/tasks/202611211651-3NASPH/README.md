---
id: "202611211651-3NASPH"
title: "Align Calc ODS statistical and duplicate conditions"
result_summary: "Verified native Calc ODS statistical predicates, range caching, and package round trips."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "Run scoped Calc conditional format, ODS and Worker tests plus office typecheck, lint, format, dependency and provenance checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:51:49.476Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T16:55:54.063Z"
  updated_by: "CODER"
  note: "Verified original Calc ODS duplicate and statistical rules through rendering, edit, Worker and package round trips."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T16:55:54.691Z"
  updated_by: "EVALUATOR"
  note: "Original duplicate, rank and average conditions survive ODS and Worker with native rendering cache boundaries."
  evaluated_sha: "d055907e110876efed2313aced1f9aeb7b18165f"
  blueprint_digest: "dd383dc6a2373e1ade4c19073a488ddf6465d9fa2d60d4f702bbaf62d1ed2ea8"
  evidence_refs:
    - ".agentplane/tasks/202611211651-3NASPH/README.md"
    - ".agentplane/tasks/202611211651-3NASPH/quality/20261121-165554691-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211651-3NASPH/quality/20261121-165554691-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211651-3NASPH/quality/20261121-165554691-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211651-3NASPH/blueprint/resolved-snapshot.json"
    - "output/playwright/3NASPH/calc.log"
    - "output/playwright/3NASPH/recheck.log"
    - "output/playwright/3NASPH/types-final.log"
    - "output/playwright/3NASPH/provenance.log"
    - "output/playwright/3NASPH/doctor.log"
    - "node .agentplane/policy/check-routing.mjs passed"
  findings:
    - "The pinned duplicate regression and independent rank, ties, average, empty-cell and edit assertions passed."
commit:
  hash: "d055907e110876efed2313aced1f9aeb7b18165f"
  message: "🧩 3NASPH code: preserve Calc ODS statistical and duplicate conditions"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: original ODS duplicate, rank and average rules round-trip through Calc and the Worker."
events:
  -
    type: "status"
    at: "2026-11-21T16:52:04.387Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T16:55:54.063Z"
    author: "CODER"
    state: "ok"
    note: "Verified original Calc ODS duplicate and statistical rules through rendering, edit, Worker and package round trips."
  -
    type: "status"
    at: "2026-11-21T16:57:00.025Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original ODS duplicate, rank and average rules round-trip through Calc and the Worker."
doc_version: 3
doc_updated_at: "2026-11-21T16:57:00.026Z"
doc_updated_by: "CODER"
description: "Port original ODS condition grammar, native range statistics and duplicate predicates, and round trips through the model and Worker."
sections:
  Summary: "Align Calc ODS duplicate, rank and average conditions with LibreOffice."
  Scope: "Original Calc condition and XML owners, native sparse range evaluation, existing rendering and Worker transport where needed, tests and source registration. Include duplicate/unique, top/bottom count/percentage and four average modes."
  Plan: "Port the original XML grammar and range statistics, reproduce native comparison and count boundaries, and exercise state after editing, Worker transfer and reopening."
  Verify Steps: "Run scoped Calc condition, ODS and Worker suites, office typecheck, lint, format, dependency and provenance checks, routing and doctor. Use Graphify for direct closeout."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T16:55:54.063Z — VERIFY — ok

    By: CODER

    Note: Verified original Calc ODS duplicate and statistical rules through rendering, edit, Worker and package round trips.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:52:04.387Z, excerpt_hash=sha256:c8e2af5d860329340b7ef4c684f9ae7767c5b283e4f504ee8d2375e1cb60fef7

    Details:

    Implementation d055907e1108. Scoped npm run test:calc for ODS, conditional-copy and formula rules, Calc grid and Worker passed 78 tests across 11 files. The targeted ODS statistics rerun passed both tests, including the blank-cell behavior and pinned testTdf166669 fixture. This ports the ODS side of the original fixture and runs the same assertions on ODS reopen; XLSX round trips for these condition families are outside this task. Office typecheck, scoped ESLint and Prettier, check:dependencies, check:source-provenance, policy routing, doctor and git diff checks passed. Full-suite cadence restarted after 09F4ME per user direction; this is task one of ten, and the goal stays active after the next full run.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211651-3NASPH/blueprint/resolved-snapshot.json
    - old_digest: dd383dc6a2373e1ade4c19073a488ddf6465d9fa2d60d4f702bbaf62d1ed2ea8
    - current_digest: dd383dc6a2373e1ade4c19073a488ddf6465d9fa2d60d4f702bbaf62d1ed2ea8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211651-3NASPH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211651-3NASPH
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Calc ODS duplicate, rank and average conditions with LibreOffice.

## Scope

Original Calc condition and XML owners, native sparse range evaluation, existing rendering and Worker transport where needed, tests and source registration. Include duplicate/unique, top/bottom count/percentage and four average modes.

## Plan

Port the original XML grammar and range statistics, reproduce native comparison and count boundaries, and exercise state after editing, Worker transfer and reopening.

## Verify Steps

Run scoped Calc condition, ODS and Worker suites, office typecheck, lint, format, dependency and provenance checks, routing and doctor. Use Graphify for direct closeout.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T16:55:54.063Z — VERIFY — ok

By: CODER

Note: Verified original Calc ODS duplicate and statistical rules through rendering, edit, Worker and package round trips.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:52:04.387Z, excerpt_hash=sha256:c8e2af5d860329340b7ef4c684f9ae7767c5b283e4f504ee8d2375e1cb60fef7

Details:

Implementation d055907e1108. Scoped npm run test:calc for ODS, conditional-copy and formula rules, Calc grid and Worker passed 78 tests across 11 files. The targeted ODS statistics rerun passed both tests, including the blank-cell behavior and pinned testTdf166669 fixture. This ports the ODS side of the original fixture and runs the same assertions on ODS reopen; XLSX round trips for these condition families are outside this task. Office typecheck, scoped ESLint and Prettier, check:dependencies, check:source-provenance, policy routing, doctor and git diff checks passed. Full-suite cadence restarted after 09F4ME per user direction; this is task one of ten, and the goal stays active after the next full run.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211651-3NASPH/blueprint/resolved-snapshot.json
- old_digest: dd383dc6a2373e1ade4c19073a488ddf6465d9fa2d60d4f702bbaf62d1ed2ea8
- current_digest: dd383dc6a2373e1ade4c19073a488ddf6465d9fa2d60d4f702bbaf62d1ed2ea8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211651-3NASPH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211651-3NASPH
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
