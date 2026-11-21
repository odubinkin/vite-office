---
id: "202611211658-NVQZJN"
title: "Align Writer ODT frame bitmap fill properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify:
  - "Run Writer frame, page fill and Worker suites, shared XML fill tests, typecheck and static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:58:46.146Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T17:05:32.527Z"
  updated_by: "CODER"
  note: "Verified named Writer frame bitmap fills, native geometry, catalogue identity and ODT and Worker round trips."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T17:05:33.165Z"
  updated_by: "EVALUATOR"
  note: "Named Writer frame bitmap properties survive native style inheritance, Worker transport and ODT round trips."
  evaluated_sha: "98b9d1c1fd90ac84d81007389f02712d86fe556f"
  blueprint_digest: "d417a6e31a00af479ab05665f25fbbefd0e0e0a0281842b23db096925e7408f4"
  evidence_refs:
    - ".agentplane/tasks/202611211658-NVQZJN/README.md"
    - ".agentplane/tasks/202611211658-NVQZJN/quality/20261121-170533165-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211658-NVQZJN/quality/20261121-170533165-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211658-NVQZJN/quality/20261121-170533165-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211658-NVQZJN/blueprint/resolved-snapshot.json"
    - "output/playwright/NVQZJN/writer-final.log"
    - "output/playwright/NVQZJN/shared.log"
    - "output/playwright/NVQZJN/types-final.log"
    - "output/playwright/NVQZJN/provenance.log"
    - "output/playwright/NVQZJN/doctor.log"
    - "node .agentplane/policy/check-routing.mjs passed"
  findings:
    - "The pinned bitmap frame assertions, independently authored offsets, shared package resources and distinct same-name assets all passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-21T16:59:13.313Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T17:05:32.527Z"
    author: "CODER"
    state: "ok"
    note: "Verified named Writer frame bitmap fills, native geometry, catalogue identity and ODT and Worker round trips."
doc_version: 3
doc_updated_at: "2026-11-21T17:05:32.589Z"
doc_updated_by: "CODER"
description: "Connect named DrawingLayer bitmap fills and geometry to Writer graphic style import, native text frames, Worker and ODT export using common XML mapping and bitmap declarations."
sections:
  Summary: "Align named Writer bitmap fills on ODT text frames with the original graphic style map."
  Scope: "Shared bitmap property conversion, graphic style inheritance, native fly fill items, shared package bitmap declarations, Worker and ODT regressions, and source registration. Existing page and story fills use the same mapping."
  Plan: "Share the original geometry handlers and named graphic table. Import inherited bitmap names and native frame items, emit declarations and frame properties through one ODT export catalogue, and verify the represented frame fixtures."
  Verify Steps: "Run focused Writer ODT frame, page fill, Worker and round trip tests; run shared fill tests, office typecheck, scope ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T17:05:32.527Z — VERIFY — ok

    By: CODER

    Note: Verified named Writer frame bitmap fills, native geometry, catalogue identity and ODT and Worker round trips.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:59:13.313Z, excerpt_hash=sha256:ec4dc5a7977b5e2b2b69ff11c031f669d8c3f058c965bbe0a11dd1941be17a91

    Details:

    Implementation 98b9d1c1fd90. Nine focused Writer suites passed 48 cases including the bitmap portion of the pinned testFramebackgrounds fixture, native inheritance, package name collisions, page and story fills, Worker and RTF frame cases. Three shared fill and style suites passed 9 cases. An initial runtime and TypeScript failure from a type-only FillStyle import was corrected and the full scoped Writer set and typecheck both passed again. Scoped ESLint and Prettier, check:dependencies, check:source-provenance, routing, doctor and git diff checks passed. WRITER-725 records the fixture difference between legacy stretch and DrawingLayer tile. This scope covers named bitmap and direct graphic style fields; gradient opacity, legacy-only frame backgrounds and all broader frame-style families remain outside this verification. This is task two of ten before the next full suite.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211658-NVQZJN/blueprint/resolved-snapshot.json
    - old_digest: d417a6e31a00af479ab05665f25fbbefd0e0e0a0281842b23db096925e7408f4
    - current_digest: d417a6e31a00af479ab05665f25fbbefd0e0e0a0281842b23db096925e7408f4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211658-NVQZJN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211658-NVQZJN
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

Align named Writer bitmap fills on ODT text frames with the original graphic style map.

## Scope

Shared bitmap property conversion, graphic style inheritance, native fly fill items, shared package bitmap declarations, Worker and ODT regressions, and source registration. Existing page and story fills use the same mapping.

## Plan

Share the original geometry handlers and named graphic table. Import inherited bitmap names and native frame items, emit declarations and frame properties through one ODT export catalogue, and verify the represented frame fixtures.

## Verify Steps

Run focused Writer ODT frame, page fill, Worker and round trip tests; run shared fill tests, office typecheck, scope ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T17:05:32.527Z — VERIFY — ok

By: CODER

Note: Verified named Writer frame bitmap fills, native geometry, catalogue identity and ODT and Worker round trips.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:59:13.313Z, excerpt_hash=sha256:ec4dc5a7977b5e2b2b69ff11c031f669d8c3f058c965bbe0a11dd1941be17a91

Details:

Implementation 98b9d1c1fd90. Nine focused Writer suites passed 48 cases including the bitmap portion of the pinned testFramebackgrounds fixture, native inheritance, package name collisions, page and story fills, Worker and RTF frame cases. Three shared fill and style suites passed 9 cases. An initial runtime and TypeScript failure from a type-only FillStyle import was corrected and the full scoped Writer set and typecheck both passed again. Scoped ESLint and Prettier, check:dependencies, check:source-provenance, routing, doctor and git diff checks passed. WRITER-725 records the fixture difference between legacy stretch and DrawingLayer tile. This scope covers named bitmap and direct graphic style fields; gradient opacity, legacy-only frame backgrounds and all broader frame-style families remain outside this verification. This is task two of ten before the next full suite.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211658-NVQZJN/blueprint/resolved-snapshot.json
- old_digest: d417a6e31a00af479ab05665f25fbbefd0e0e0a0281842b23db096925e7408f4
- current_digest: d417a6e31a00af479ab05665f25fbbefd0e0e0a0281842b23db096925e7408f4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211658-NVQZJN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211658-NVQZJN
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
