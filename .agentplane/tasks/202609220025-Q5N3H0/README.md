---
id: "202609220025-Q5N3H0"
title: "Complete Vite Office upstream parity remediation"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T00:26:32.713Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T01:01:48.859Z"
  updated_by: "CODER"
  note: "Full npm run verify passed: 357 app tests and 96 inventory tests at 100% coverage, 11 Playwright tests, builds, static/docs/dependency/provenance/invariant gates, and parity report 45/45 verified with zero gaps."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement all approved non-P0-1 parity remediations and run the declared verification contract."
events:
  -
    type: "status"
    at: "2026-09-22T00:26:45.667Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement all approved non-P0-1 parity remediations and run the declared verification contract."
  -
    type: "verify"
    at: "2026-09-22T01:01:48.859Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed: 357 app tests and 96 inventory tests at 100% coverage, 11 Playwright tests, builds, static/docs/dependency/provenance/invariant gates, and parity report 45/45 verified with zero gaps."
doc_version: 3
doc_updated_at: "2026-09-22T01:01:48.913Z"
doc_updated_by: "CODER"
description: "Fix all audited gaps in docs/program/vite-office-upstream-parity-plan.md except intentionally abandoned P0-1, and verify parity claims."
sections:
  Summary: |-
    Complete Vite Office upstream parity remediation

    Fix all audited gaps in docs/program/vite-office-upstream-parity-plan.md except intentionally abandoned P0-1, and verify parity claims.
  Scope: |-
    - In scope: Writer list projection/rendering, typed command and recovery states, exposed built-in style defaults and tests, Writer parity inventory claims/evidence, browser UI cleanup listed in section 7 of the plan, SwWrtShell decomposition needed for those responsibilities, and WP7 evaluation.
    - Explicitly out of scope: P0-1, unrelated product features, release/publish actions, network access, and upstream changes outside this repository.
    - Success: every audited non-P0-1 finding is fixed or represented as an accurate non-implemented inventory gap; all declared verification passes; no false parity-ready claim remains.
  Plan: |-
    1. Correct list projection/rendering so marker, indent, first-line indent, and tab position come from the Writer model; remove duplicate marker calculation.
    2. Replace string-matched command failures and prose recovery notices with typed error/recovery state rendered through presentation mappings.
    3. Align exposed built-in style defaults with pinned upstream behavior, including representable zero line spacing, and add complete differential coverage for the exposed pool.
    4. Rewrite Writer parity inventory claims to match implemented property-level behavior and update validation evidence.
    5. Remove remaining UI cleanup artifacts (unused projectionVersion, quadratic run keys, fixed fake-page sizing, render-time style hierarchy reconstruction, unsafe command casts) and further decompose SwWrtShell responsibilities where required by the plan.
    6. Re-run inventory generation/evaluation and only mark WP7 ready if every non-P0-1 gap has verified evidence.
    7. Run declared targeted tests plus npm run verify, routing validation, ap doctor, and clean-state checks.
  Verify Steps: |-
    1. Run targeted Vitest suites for numbering/projection, workflows/dispatch/recovery, style defaults/ODT roundtrip, and shell editing. Expected: all pass.
    2. Run inventory validation/evaluation commands exposed by package scripts. Expected: schema and evidence checks pass; non-P0-1 claims match implementation and parityReady is truthful.
    3. Run `npm run verify`. Expected: formatting, lint, typecheck, unit/inventory/e2e tests, builds, dependency boundaries, provenance, invariants, and size checks pass.
    4. Run `git diff --check`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`. Expected: no whitespace errors, routing passes, and no task-scoped doctor failures.
    5. Run `git status --short --untracked-files=all` and review the diff. Expected: only intentional task and implementation artifacts are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T01:01:48.859Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed: 357 app tests and 96 inventory tests at 100% coverage, 11 Playwright tests, builds, static/docs/dependency/provenance/invariant gates, and parity report 45/45 verified with zero gaps.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T00:26:45.667Z, excerpt_hash=sha256:738d575a573ea57f2cc018401d2cb2145173cf01245a9e7a1ea2f216ccc93a3d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220025-Q5N3H0/blueprint/resolved-snapshot.json
    - old_digest: 00eeb0e2bbc8898fd847f83d91e7537f97b1a2aa83d620cb14f43e1b33ae2d59
    - current_digest: 00eeb0e2bbc8898fd847f83d91e7537f97b1a2aa83d620cb14f43e1b33ae2d59
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220025-Q5N3H0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609220025-Q5N3H0 -m 🧩 Q5N3H0 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: All approved non-P0-1 findings were remediated and the complete repository gate passed.
      Impact: List geometry, typed presentation state, style defaults, shell decomposition, and parity claims are now enforced by unit, inventory, and browser tests.
      Resolution: Retain npm run verify and inventory:parity as the release gates for this bounded Writer slice.
id_source: "generated"
---
## Summary

Complete Vite Office upstream parity remediation

Fix all audited gaps in docs/program/vite-office-upstream-parity-plan.md except intentionally abandoned P0-1, and verify parity claims.

## Scope

- In scope: Writer list projection/rendering, typed command and recovery states, exposed built-in style defaults and tests, Writer parity inventory claims/evidence, browser UI cleanup listed in section 7 of the plan, SwWrtShell decomposition needed for those responsibilities, and WP7 evaluation.
- Explicitly out of scope: P0-1, unrelated product features, release/publish actions, network access, and upstream changes outside this repository.
- Success: every audited non-P0-1 finding is fixed or represented as an accurate non-implemented inventory gap; all declared verification passes; no false parity-ready claim remains.

## Plan

1. Correct list projection/rendering so marker, indent, first-line indent, and tab position come from the Writer model; remove duplicate marker calculation.
2. Replace string-matched command failures and prose recovery notices with typed error/recovery state rendered through presentation mappings.
3. Align exposed built-in style defaults with pinned upstream behavior, including representable zero line spacing, and add complete differential coverage for the exposed pool.
4. Rewrite Writer parity inventory claims to match implemented property-level behavior and update validation evidence.
5. Remove remaining UI cleanup artifacts (unused projectionVersion, quadratic run keys, fixed fake-page sizing, render-time style hierarchy reconstruction, unsafe command casts) and further decompose SwWrtShell responsibilities where required by the plan.
6. Re-run inventory generation/evaluation and only mark WP7 ready if every non-P0-1 gap has verified evidence.
7. Run declared targeted tests plus npm run verify, routing validation, ap doctor, and clean-state checks.

## Verify Steps

1. Run targeted Vitest suites for numbering/projection, workflows/dispatch/recovery, style defaults/ODT roundtrip, and shell editing. Expected: all pass.
2. Run inventory validation/evaluation commands exposed by package scripts. Expected: schema and evidence checks pass; non-P0-1 claims match implementation and parityReady is truthful.
3. Run `npm run verify`. Expected: formatting, lint, typecheck, unit/inventory/e2e tests, builds, dependency boundaries, provenance, invariants, and size checks pass.
4. Run `git diff --check`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`. Expected: no whitespace errors, routing passes, and no task-scoped doctor failures.
5. Run `git status --short --untracked-files=all` and review the diff. Expected: only intentional task and implementation artifacts are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T01:01:48.859Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed: 357 app tests and 96 inventory tests at 100% coverage, 11 Playwright tests, builds, static/docs/dependency/provenance/invariant gates, and parity report 45/45 verified with zero gaps.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T00:26:45.667Z, excerpt_hash=sha256:738d575a573ea57f2cc018401d2cb2145173cf01245a9e7a1ea2f216ccc93a3d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220025-Q5N3H0/blueprint/resolved-snapshot.json
- old_digest: 00eeb0e2bbc8898fd847f83d91e7537f97b1a2aa83d620cb14f43e1b33ae2d59
- current_digest: 00eeb0e2bbc8898fd847f83d91e7537f97b1a2aa83d620cb14f43e1b33ae2d59
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220025-Q5N3H0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609220025-Q5N3H0 -m 🧩 Q5N3H0 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: All approved non-P0-1 findings were remediated and the complete repository gate passed.
  Impact: List geometry, typed presentation state, style defaults, shell decomposition, and parity claims are now enforced by unit, inventory, and browser tests.
  Resolution: Retain npm run verify and inventory:parity as the release gates for this bounded Writer slice.
