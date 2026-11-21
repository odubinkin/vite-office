---
id: "202611211708-9W0FQ4"
title: "Align Writer ODT legacy frame background conversion"
result_summary: "Verified legacy Writer frame brush conversion, background image export, and ODT and Worker round trips."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify:
  - "Run focused Writer ODT frame, page background and Worker coverage, shared brush and style suites, office typecheck and static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:08:58.203Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T17:15:39.854Z"
  updated_by: "CODER"
  note: "Verified Writer legacy frame color and bitmap backgrounds, precedence, compatible ODT serialization and Worker transfer."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T17:15:40.548Z"
  updated_by: "EVALUATOR"
  note: "Legacy Writer frame brush properties and modern fill precedence match the pinned source for solid and raster fills."
  evaluated_sha: "304f3d7e3bf2d804722c0432757c629427ce45f8"
  blueprint_digest: "2fb2d40e6cd094e58fab475d4628395ece5402e1339dc8633839d3836e5f6444"
  evidence_refs:
    - ".agentplane/tasks/202611211708-9W0FQ4/README.md"
    - ".agentplane/tasks/202611211708-9W0FQ4/quality/20261121-171540548-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211708-9W0FQ4/quality/20261121-171540548-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211708-9W0FQ4/quality/20261121-171540548-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211708-9W0FQ4/blueprint/resolved-snapshot.json"
    - "output/playwright/9W0FQ4/writer.log"
    - "output/playwright/9W0FQ4/shared.log"
    - "output/playwright/9W0FQ4/types.log"
    - "output/playwright/9W0FQ4/provenance.log"
    - "output/playwright/9W0FQ4/doctor.log"
    - "node .agentplane/policy/check-routing.mjs passed"
  findings:
    - "Verified native raster location, independent opacity, compatible child output, precedence and document round trips."
commit:
  hash: "304f3d7e3bf2d804722c0432757c629427ce45f8"
  message: "🧩 9W0FQ4 code: align Writer legacy frame background conversion"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: Writer legacy frame brush import, modern fill precedence and compatible ODT output."
events:
  -
    type: "status"
    at: "2026-11-21T17:09:04.463Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T17:15:39.854Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer legacy frame color and bitmap backgrounds, precedence, compatible ODT serialization and Worker transfer."
  -
    type: "status"
    at: "2026-11-21T17:16:43.642Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Writer legacy frame brush import, modern fill precedence and compatible ODT output."
doc_version: 3
doc_updated_at: "2026-11-21T17:16:43.643Z"
doc_updated_by: "CODER"
description: "Port old graphic and color brush behavior for ODT frame styles, native fill precedence, and compatible frame background XML serialization."
sections:
  Summary: "Align the Writer ODT legacy frame background property states and bitmap compatibility export with the pinned source."
  Scope: "Frame graphic style and shared text XML context, compatible brush color and embedded raster conversion, modern fill precedence, shared legacy bitmap serialization and ODT and Worker regressions. Gradients and external graphic loading remain outside this slice."
  Plan: "Capture legacy color, opacity and image children through original property contexts, apply native brush conversion and precedence, and serialize supported compatibility child properties alongside the modern fill. Port represented assertions from the original framebackgrounds fixture."
  Verify Steps: "Run focused Writer ODT frame, page, inline graphics, Worker and RTF frame tests, shared brush and XML property suites, office typecheck, ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T17:15:39.854Z — VERIFY — ok

    By: CODER

    Note: Verified Writer legacy frame color and bitmap backgrounds, precedence, compatible ODT serialization and Worker transfer.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:09:04.463Z, excerpt_hash=sha256:cc46fe0239e161580126af8f607cf1bceb4011906ddefa7fd511d2ac6fdc06c7

    Details:

    Implementation 304f3d7e3bf2. Nine focused Writer suites passed 49 cases. Extended the bounded bitmap part of testFramebackgrounds to check the three compatibility background-image elements and the exact 55 percent opacity case. Independent XML exercises legacy RGB, centered or positioned modes, inline and package PNG, modern-vs-legacy precedence, the bitmap transparency exception and the transparent solid fallback through Worker and ODT reopen. Four shared brush, fill and XML suites passed 21 cases. Office typecheck, scope ESLint and Prettier, check:dependencies, check:source-provenance, routing, doctor and git diff checks passed. WRITER-726 and WRITER-727 document original brush precedence and fallback. The gradient-derived opacity assertion remains outside this raster/solid slice. This is task three of ten before the next full suite.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211708-9W0FQ4/blueprint/resolved-snapshot.json
    - old_digest: 2fb2d40e6cd094e58fab475d4628395ece5402e1339dc8633839d3836e5f6444
    - current_digest: 2fb2d40e6cd094e58fab475d4628395ece5402e1339dc8633839d3836e5f6444
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211708-9W0FQ4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211708-9W0FQ4
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

Align the Writer ODT legacy frame background property states and bitmap compatibility export with the pinned source.

## Scope

Frame graphic style and shared text XML context, compatible brush color and embedded raster conversion, modern fill precedence, shared legacy bitmap serialization and ODT and Worker regressions. Gradients and external graphic loading remain outside this slice.

## Plan

Capture legacy color, opacity and image children through original property contexts, apply native brush conversion and precedence, and serialize supported compatibility child properties alongside the modern fill. Port represented assertions from the original framebackgrounds fixture.

## Verify Steps

Run focused Writer ODT frame, page, inline graphics, Worker and RTF frame tests, shared brush and XML property suites, office typecheck, ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T17:15:39.854Z — VERIFY — ok

By: CODER

Note: Verified Writer legacy frame color and bitmap backgrounds, precedence, compatible ODT serialization and Worker transfer.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:09:04.463Z, excerpt_hash=sha256:cc46fe0239e161580126af8f607cf1bceb4011906ddefa7fd511d2ac6fdc06c7

Details:

Implementation 304f3d7e3bf2. Nine focused Writer suites passed 49 cases. Extended the bounded bitmap part of testFramebackgrounds to check the three compatibility background-image elements and the exact 55 percent opacity case. Independent XML exercises legacy RGB, centered or positioned modes, inline and package PNG, modern-vs-legacy precedence, the bitmap transparency exception and the transparent solid fallback through Worker and ODT reopen. Four shared brush, fill and XML suites passed 21 cases. Office typecheck, scope ESLint and Prettier, check:dependencies, check:source-provenance, routing, doctor and git diff checks passed. WRITER-726 and WRITER-727 document original brush precedence and fallback. The gradient-derived opacity assertion remains outside this raster/solid slice. This is task three of ten before the next full suite.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211708-9W0FQ4/blueprint/resolved-snapshot.json
- old_digest: 2fb2d40e6cd094e58fab475d4628395ece5402e1339dc8633839d3836e5f6444
- current_digest: 2fb2d40e6cd094e58fab475d4628395ece5402e1339dc8633839d3836e5f6444
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211708-9W0FQ4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211708-9W0FQ4
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
