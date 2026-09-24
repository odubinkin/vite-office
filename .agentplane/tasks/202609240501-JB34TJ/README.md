---
id: "202609240501-JB34TJ"
title: "Restore Writer core layout ownership"
result_summary: "Writer core now owns persistent page and text frames for the supported browser slice"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609240501-ZNDC30"
  - "202609240542-9D8VFJ"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T06:50:22.426Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T07:14:54.266Z"
  updated_by: "CODER"
  note: "npm run verify passed: 461 office tests and 96 inventory tests at 100% coverage, 14 Chromium E2E tests including DPR 1/2, static build, source tree/provenance; scoped diff reviewed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T07:15:00.238Z"
  updated_by: "EVALUATOR"
  note: "Persistent SwRootFrame owns supported pagination, frame identity, invalidation and line-number projection; browser supplies measured lines."
  evaluated_sha: "f83cd505a0573804ffefe8dcea7f72e49378ef93"
  blueprint_digest: "48d5c6df190400b23e5c96c320d1403a6601a790caeaa858f58ec0627632e5f5"
  evidence_refs:
    - ".agentplane/tasks/202609240501-JB34TJ/README.md"
    - ".agentplane/tasks/202609240501-JB34TJ/quality/20260924-071500238-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240501-JB34TJ/quality/20260924-071500238-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240501-JB34TJ/quality/20260924-071500238-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240501-JB34TJ/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/layout/newfrm.test.ts"
    - "apps/office/src/sw/source/uibase/uiview/view.test.ts"
    - "apps/office/e2e/writer-layout-ratios.spec.ts"
  findings:
    - "Native connected frame registration, tables and anchored objects remain outside the browser slice and module-wide parity remains unverified."
commit:
  hash: "a6269bd2c9d7574451d799ae3e83586e0065dd68"
  message: "🧾 JB34TJ task: record verified Writer layout evidence"
comments:
  -
    author: "CODER"
    body: "Start: restore core-owned Writer frame graph and browser measurement boundary."
  -
    author: "CODER"
    body: "Verified: persistent Writer core frame root, device measurements, pagination, numbering, and DPR parity passed npm run verify."
events:
  -
    type: "status"
    at: "2026-09-24T06:50:31.138Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore core-owned Writer frame graph and browser measurement boundary."
  -
    type: "verify"
    at: "2026-09-24T07:14:54.266Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 461 office tests and 96 inventory tests at 100% coverage, 14 Chromium E2E tests including DPR 1/2, static build, source tree/provenance; scoped diff reviewed."
  -
    type: "status"
    at: "2026-09-24T07:15:48.074Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: persistent Writer core frame root, device measurements, pagination, numbering, and DPR parity passed npm run verify."
doc_version: 3
doc_updated_at: "2026-09-24T07:15:48.076Z"
doc_updated_by: "CODER"
description: "Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port"
sections:
  Summary: |-
    Restore Writer core layout ownership

    Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port
  Scope: |-
    - In scope: Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port.
    - Out of scope: unrelated refactors not required for "Restore Writer core layout ownership".
  Plan: |-
    1. Move line-spacing resolution to sw/source/core/text/itrform2.ts and make browser projection consume its result; keep DOM glyph measurement as the device input.
    2. Add a persistent SwRootFrame under sw/source/core/layout with stable page/text-frame identities, invalidation on model/style/page settings or changed device measurements, and an immutable page/line-number snapshot. Preserve the supported upstream flow, keep-with-next and follow-page rules.
    3. Have the browser measurement boundary publish measured lines to the core layout owner; render only its frame snapshot. Remove the reverse writer-page-pagination adapter and duplicate gap/line-height policy in browser code.
    4. Compare supported page breaks, extents, numbering and invalidation at multiple widths, fonts, page descriptors and device ratios against pinned source assertions; update runtime inventory and provenance data for changed ownership. Run npm run verify and review the scoped diff. Browser save, autosave and recovery behavior stay unchanged.
  Verify Steps: |-
    1. Pinned itrform2.cxx and frame/layout source excerpts support each implemented line-spacing, frame-flow, keep-with-next, follow-page and invalidation rule. Focused tests cover unchanged measurement identity, changed width/font/line metrics, page geometry/style changes, split/follow frames, and line numbers.
    2. The production Writer editor receives immutable pages and line marks from a persistent core layout owner. Browser code only measures glyph geometry and paints; writer-page-pagination.ts and duplicate browser gap or line-height calculations are gone. Test new/reopened/edited documents at multiple widths and page descriptors.
    3. Confirm stable frame identities for unaffected content and revision changes for invalidated content; no save, autosave or recovery code changes. Update source-provenance and runtime-inventory data with bounded evidence, without changing schemas.
    4. Run npm run verify and inspect the task-scoped diff and clean tracked state.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T07:14:54.266Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 461 office tests and 96 inventory tests at 100% coverage, 14 Chromium E2E tests including DPR 1/2, static build, source tree/provenance; scoped diff reviewed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:50:31.138Z, excerpt_hash=sha256:55fa967d99e44a218202c16b7356b1c9fe4a28b7799217d7c965eef350c38aea

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-JB34TJ/blueprint/resolved-snapshot.json
    - old_digest: 48d5c6df190400b23e5c96c320d1403a6601a790caeaa858f58ec0627632e5f5
    - current_digest: 48d5c6df190400b23e5c96c320d1403a6601a790caeaa858f58ec0627632e5f5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-JB34TJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240501-JB34TJ
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
extensions:
  implementation_commit:
    hash: "f83cd505a0573804ffefe8dcea7f72e49378ef93"
    message: "🧩 JB34TJ code: move Writer layout ownership into core frames"
id_source: "generated"
---
## Summary

Restore Writer core layout ownership

Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port

## Scope

- In scope: Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port.
- Out of scope: unrelated refactors not required for "Restore Writer core layout ownership".

## Plan

1. Move line-spacing resolution to sw/source/core/text/itrform2.ts and make browser projection consume its result; keep DOM glyph measurement as the device input.
2. Add a persistent SwRootFrame under sw/source/core/layout with stable page/text-frame identities, invalidation on model/style/page settings or changed device measurements, and an immutable page/line-number snapshot. Preserve the supported upstream flow, keep-with-next and follow-page rules.
3. Have the browser measurement boundary publish measured lines to the core layout owner; render only its frame snapshot. Remove the reverse writer-page-pagination adapter and duplicate gap/line-height policy in browser code.
4. Compare supported page breaks, extents, numbering and invalidation at multiple widths, fonts, page descriptors and device ratios against pinned source assertions; update runtime inventory and provenance data for changed ownership. Run npm run verify and review the scoped diff. Browser save, autosave and recovery behavior stay unchanged.

## Verify Steps

1. Pinned itrform2.cxx and frame/layout source excerpts support each implemented line-spacing, frame-flow, keep-with-next, follow-page and invalidation rule. Focused tests cover unchanged measurement identity, changed width/font/line metrics, page geometry/style changes, split/follow frames, and line numbers.
2. The production Writer editor receives immutable pages and line marks from a persistent core layout owner. Browser code only measures glyph geometry and paints; writer-page-pagination.ts and duplicate browser gap or line-height calculations are gone. Test new/reopened/edited documents at multiple widths and page descriptors.
3. Confirm stable frame identities for unaffected content and revision changes for invalidated content; no save, autosave or recovery code changes. Update source-provenance and runtime-inventory data with bounded evidence, without changing schemas.
4. Run npm run verify and inspect the task-scoped diff and clean tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T07:14:54.266Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 461 office tests and 96 inventory tests at 100% coverage, 14 Chromium E2E tests including DPR 1/2, static build, source tree/provenance; scoped diff reviewed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:50:31.138Z, excerpt_hash=sha256:55fa967d99e44a218202c16b7356b1c9fe4a28b7799217d7c965eef350c38aea

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-JB34TJ/blueprint/resolved-snapshot.json
- old_digest: 48d5c6df190400b23e5c96c320d1403a6601a790caeaa858f58ec0627632e5f5
- current_digest: 48d5c6df190400b23e5c96c320d1403a6601a790caeaa858f58ec0627632e5f5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-JB34TJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240501-JB34TJ
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
