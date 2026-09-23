---
id: "202609230922-E9WGR1"
title: "Separate Writer ruler indent triangles vertically"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T09:22:37.634Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T09:24:30.094Z"
  updated_by: "CODER"
  note: "Ruler placement and drag tests passed; browser geometry confirms 15 px vertical separation; typecheck, lint, format, doctor, routing, and diff checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T09:24:36.832Z"
  updated_by: "EVALUATOR"
  note: "Indent triangles are separated vertically and retain independent drag behavior."
  evaluated_sha: "844f3eed88e066b8e948de1d3499f6e7262fc99d"
  blueprint_digest: "f04cee61e0f372220fd7fcef5b62afa8a72b6b84771695adb80ae6988b255fd6"
  evidence_refs:
    - ".agentplane/tasks/202609230922-E9WGR1/README.md"
    - ".agentplane/tasks/202609230922-E9WGR1/quality/20260923-092436832-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609230922-E9WGR1/quality/20260923-092436832-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609230922-E9WGR1/quality/20260923-092436832-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609230922-E9WGR1/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx"
  findings:
    - "Paragraph left and right indent markers render at the ruler bottom; first-line marker remains at the top; browser geometry and seven tests pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Move paragraph indent triangles to the lower ruler edge and verify that first-line and body indent controls stay independent."
events:
  -
    type: "status"
    at: "2026-09-23T09:22:38.338Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Move paragraph indent triangles to the lower ruler edge and verify that first-line and body indent controls stay independent."
  -
    type: "verify"
    at: "2026-09-23T09:24:30.094Z"
    author: "CODER"
    state: "ok"
    note: "Ruler placement and drag tests passed; browser geometry confirms 15 px vertical separation; typecheck, lint, format, doctor, routing, and diff checks passed."
doc_version: 3
doc_updated_at: "2026-09-23T09:24:30.172Z"
doc_updated_by: "CODER"
description: "Place paragraph left and right indent markers along the bottom of the horizontal ruler while the first-line marker stays at the top, preserving independent drag behavior."
sections:
  Summary: |-
    Separate Writer ruler indent triangles vertically

    Place paragraph left and right indent markers along the bottom of the horizontal ruler while the first-line marker stays at the top, preserving independent drag behavior.
  Scope: "Update horizontal ruler indent marker placement and focused ruler tests only. Keep page-margin markers, model coordinates, and commit callbacks unchanged."
  Plan: "Move body indent triangles to the bottom edge, leave first-line indent at the top, and verify independent drag behavior."
  Verify Steps: |-
    1. Run `npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: bottom/top indent marker separation and existing drag callbacks pass.
    2. Run `npm run typecheck --workspace @vite-office/office`, `npm run lint`, and `npm run format:check`. Expected: pass.
    3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: pass.
    4. Run `git diff --check` and inspect `git status --short --untracked-files=all`. Expected: no whitespace errors or unrelated changes.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T09:24:30.094Z — VERIFY — ok

    By: CODER

    Note: Ruler placement and drag tests passed; browser geometry confirms 15 px vertical separation; typecheck, lint, format, doctor, routing, and diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T09:24:29.606Z, excerpt_hash=sha256:4054b6016afdb1037eceaac3772ce31a8352972caca2f1d32cbd2e7daa8d0a9b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230922-E9WGR1/blueprint/resolved-snapshot.json
    - old_digest: f04cee61e0f372220fd7fcef5b62afa8a72b6b84771695adb80ae6988b255fd6
    - current_digest: f04cee61e0f372220fd7fcef5b62afa8a72b6b84771695adb80ae6988b255fd6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230922-E9WGR1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609230922-E9WGR1
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
  Findings: |-
    Command: npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx
    Result: pass
    Evidence: 7 tests passed, including coincident left/first-line marker offsets and existing drag callbacks.
    Scope: Writer horizontal ruler placement and interaction.

    Command: browser geometry inspection at http://127.0.0.1:5173/writer
    Result: pass
    Evidence: On the 32 px horizontal ruler, first-line marker top=150 px and bottom=158 px; paragraph left and right markers top=173 px and bottom=181 px. Their horizontal positions may coincide without overlap.
    Scope: rendered marker separation.

    Command: npm run typecheck --workspace @vite-office/office; npm run lint; npm run format:check; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check
    Result: pass
    Evidence: TypeScript, ESLint, Prettier, AgentPlane doctor, routing, and whitespace checks passed. Doctor retained pre-existing warnings.
    Scope: changed code and workflow hygiene.
id_source: "generated"
---
## Summary

Separate Writer ruler indent triangles vertically

Place paragraph left and right indent markers along the bottom of the horizontal ruler while the first-line marker stays at the top, preserving independent drag behavior.

## Scope

Update horizontal ruler indent marker placement and focused ruler tests only. Keep page-margin markers, model coordinates, and commit callbacks unchanged.

## Plan

Move body indent triangles to the bottom edge, leave first-line indent at the top, and verify independent drag behavior.

## Verify Steps

1. Run `npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: bottom/top indent marker separation and existing drag callbacks pass.
2. Run `npm run typecheck --workspace @vite-office/office`, `npm run lint`, and `npm run format:check`. Expected: pass.
3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: pass.
4. Run `git diff --check` and inspect `git status --short --untracked-files=all`. Expected: no whitespace errors or unrelated changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T09:24:30.094Z — VERIFY — ok

By: CODER

Note: Ruler placement and drag tests passed; browser geometry confirms 15 px vertical separation; typecheck, lint, format, doctor, routing, and diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T09:24:29.606Z, excerpt_hash=sha256:4054b6016afdb1037eceaac3772ce31a8352972caca2f1d32cbd2e7daa8d0a9b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230922-E9WGR1/blueprint/resolved-snapshot.json
- old_digest: f04cee61e0f372220fd7fcef5b62afa8a72b6b84771695adb80ae6988b255fd6
- current_digest: f04cee61e0f372220fd7fcef5b62afa8a72b6b84771695adb80ae6988b255fd6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230922-E9WGR1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609230922-E9WGR1
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

Command: npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx
Result: pass
Evidence: 7 tests passed, including coincident left/first-line marker offsets and existing drag callbacks.
Scope: Writer horizontal ruler placement and interaction.

Command: browser geometry inspection at http://127.0.0.1:5173/writer
Result: pass
Evidence: On the 32 px horizontal ruler, first-line marker top=150 px and bottom=158 px; paragraph left and right markers top=173 px and bottom=181 px. Their horizontal positions may coincide without overlap.
Scope: rendered marker separation.

Command: npm run typecheck --workspace @vite-office/office; npm run lint; npm run format:check; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check
Result: pass
Evidence: TypeScript, ESLint, Prettier, AgentPlane doctor, routing, and whitespace checks passed. Doctor retained pre-existing warnings.
Scope: changed code and workflow hygiene.
