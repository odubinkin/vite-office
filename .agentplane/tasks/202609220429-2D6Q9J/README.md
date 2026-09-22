---
id: "202609220429-2D6Q9J"
title: "Add Writer font-size selector"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T04:30:13.675Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T04:47:05.623Z"
  updated_by: "CODER"
  note: "verified-202609220429-2D6Q9J"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T04:47:25.359Z"
  updated_by: "EVALUATOR"
  note: "Writer font-size selector is fully wired through upstream resource metadata, command state/execute, undoable model hints, browser rendering, and ODT-compatible font-size items."
  evaluated_sha: "2e19f348a9508107ce06a946f7a30d41615b8867"
  blueprint_digest: "bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00"
  evidence_refs:
    - ".agentplane/tasks/202609220429-2D6Q9J/README.md"
    - ".agentplane/tasks/202609220429-2D6Q9J/quality/20260922-044725359-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220429-2D6Q9J/quality/20260922-044725359-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220429-2D6Q9J/quality/20260922-044725359-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220429-2D6Q9J/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Implementation preserves nonstandard imported sizes, validates twip-representable positive values, synchronizes script font-height items, and passes the complete repository verification suite."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved .uno:FontHeight command and compact Writer toolbar selector with native hint, undo, state, and ODT regression coverage."
events:
  -
    type: "status"
    at: "2026-09-22T04:30:22.270Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved .uno:FontHeight command and compact Writer toolbar selector with native hint, undo, state, and ODT regression coverage."
  -
    type: "verify"
    at: "2026-09-22T04:46:52.368Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer FontHeight command, selector UI, range mutation/undo, browser projection, generated upstream placement, and import/export parity. npm run verify passed: 360/360 unit at 100% coverage, 96/96 inventory at 100%, 11/11 Playwright, static build, provenance, invariants, and parity gapCount 0."
  -
    type: "verify"
    at: "2026-09-22T04:47:05.623Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220429-2D6Q9J"
doc_version: 3
doc_updated_at: "2026-09-22T04:47:05.698Z"
doc_updated_by: "CODER"
description: "Expose the pinned .uno:FontHeight toolbar control and connect it through Writer command state, text-shell mutation, native hints, undo, and existing ODT font-size support."
sections:
  Summary: "Add a compact Writer font-size selector backed by the existing .uno:FontHeight resource and canonical character-size items."
  Scope: "In scope: generated toolbar adaptation, command ID/resource enablement, text-shell and Writer-shell font-size mutation/state, native run hints, React selector, and focused/full verification. Out of scope: Grow/Shrink commands, arbitrary unit entry, and other typography controls."
  Plan: "1. Enable .uno:FontHeight as a typed font-size toolbar placement. 2. Implement point-size command arguments, state, selection/pending-format mutation, undo, and script-synchronized SvxFontHeightItem hints. 3. Render a compact selector using command state, preserving nonstandard current values. 4. Add command, model, presentation, and ODT regression tests. 5. Run focused tests and npm run verify."
  Verify Steps: "1. Run focused Vitest suites for Writer text shell, command surfaces, toolbar presentation, run projection, undo, and ODT font-size round-trip; expect all pass. 2. Run npm run verify; expect formatting, lint, typecheck, dependency/resource checks, 100% unit and inventory coverage, Playwright, static build, docs, source-tree/provenance, invariants, and parity all pass. 3. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and inspect final git status; expect only intentional task artifacts before close."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T04:46:52.368Z — VERIFY — ok

    By: CODER

    Note: Verified Writer FontHeight command, selector UI, range mutation/undo, browser projection, generated upstream placement, and import/export parity. npm run verify passed: 360/360 unit at 100% coverage, 96/96 inventory at 100%, 11/11 Playwright, static build, provenance, invariants, and parity gapCount 0.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T04:30:22.270Z, excerpt_hash=sha256:efc53b069942c56c3a1e92ac3e392555e79dc33818cd8cb496da22a4b5b869c4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220429-2D6Q9J/blueprint/resolved-snapshot.json
    - old_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
    - current_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220429-2D6Q9J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609220429-2D6Q9J
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T04:47:05.623Z — VERIFY — ok

    By: CODER

    Note: verified-202609220429-2D6Q9J
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T04:46:52.444Z, excerpt_hash=sha256:efc53b069942c56c3a1e92ac3e392555e79dc33818cd8cb496da22a4b5b869c4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220429-2D6Q9J/blueprint/resolved-snapshot.json
    - old_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
    - current_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220429-2D6Q9J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220429-2D6Q9J --result verified-202609220429-2D6Q9J --commit 2e19f348a9508107ce06a946f7a30d41615b8867
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and task evidence commits, then rerun focused tests and npm run verify."
  Findings: |-
    Initial inspection found .uno:FontHeight in the pinned/generated toolbar data but classified as unsupported; existing ODT/model item support can carry absolute twip sizes once the command and UI path are added.

    - Observation: FontHeight was imported/exported but lacked a Writer command and UI selector.
      Impact: Users could preserve imported font sizes but could not choose them in the toolbar.
      Resolution: Added generated .uno:FontHeight support, shell state/execute and undoable range formatting, compact point-size selector, rendering, and coverage.
id_source: "generated"
---
## Summary

Add a compact Writer font-size selector backed by the existing .uno:FontHeight resource and canonical character-size items.

## Scope

In scope: generated toolbar adaptation, command ID/resource enablement, text-shell and Writer-shell font-size mutation/state, native run hints, React selector, and focused/full verification. Out of scope: Grow/Shrink commands, arbitrary unit entry, and other typography controls.

## Plan

1. Enable .uno:FontHeight as a typed font-size toolbar placement. 2. Implement point-size command arguments, state, selection/pending-format mutation, undo, and script-synchronized SvxFontHeightItem hints. 3. Render a compact selector using command state, preserving nonstandard current values. 4. Add command, model, presentation, and ODT regression tests. 5. Run focused tests and npm run verify.

## Verify Steps

1. Run focused Vitest suites for Writer text shell, command surfaces, toolbar presentation, run projection, undo, and ODT font-size round-trip; expect all pass. 2. Run npm run verify; expect formatting, lint, typecheck, dependency/resource checks, 100% unit and inventory coverage, Playwright, static build, docs, source-tree/provenance, invariants, and parity all pass. 3. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and inspect final git status; expect only intentional task artifacts before close.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T04:46:52.368Z — VERIFY — ok

By: CODER

Note: Verified Writer FontHeight command, selector UI, range mutation/undo, browser projection, generated upstream placement, and import/export parity. npm run verify passed: 360/360 unit at 100% coverage, 96/96 inventory at 100%, 11/11 Playwright, static build, provenance, invariants, and parity gapCount 0.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T04:30:22.270Z, excerpt_hash=sha256:efc53b069942c56c3a1e92ac3e392555e79dc33818cd8cb496da22a4b5b869c4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220429-2D6Q9J/blueprint/resolved-snapshot.json
- old_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
- current_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220429-2D6Q9J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609220429-2D6Q9J
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T04:47:05.623Z — VERIFY — ok

By: CODER

Note: verified-202609220429-2D6Q9J
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T04:46:52.444Z, excerpt_hash=sha256:efc53b069942c56c3a1e92ac3e392555e79dc33818cd8cb496da22a4b5b869c4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220429-2D6Q9J/blueprint/resolved-snapshot.json
- old_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
- current_digest: bcc4e1a7c65defa1b5444966bfbc3b911c052772da2aaab4ee6879b44b5eac00
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220429-2D6Q9J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220429-2D6Q9J --result verified-202609220429-2D6Q9J --commit 2e19f348a9508107ce06a946f7a30d41615b8867
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and task evidence commits, then rerun focused tests and npm run verify.

## Findings

Initial inspection found .uno:FontHeight in the pinned/generated toolbar data but classified as unsupported; existing ODT/model item support can carry absolute twip sizes once the command and UI path are added.

- Observation: FontHeight was imported/exported but lacked a Writer command and UI selector.
  Impact: Users could preserve imported font sizes but could not choose them in the toolbar.
  Resolution: Added generated .uno:FontHeight support, shell state/execute and undoable range formatting, compact point-size selector, rendering, and coverage.
