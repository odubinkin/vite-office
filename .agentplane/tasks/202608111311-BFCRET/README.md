---
id: "202608111311-BFCRET"
title: "Merge Writer paragraphs through Backspace"
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
  updated_at: "2026-08-11T13:11:33.788Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:14:45.218Z"
  updated_by: "REVIEWER"
  note: "Verified bounded Backspace merge behavior, inherited preceding formatting, history focus, documentation, and passing evidence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T13:14:45.533Z"
  updated_by: "EVALUATOR"
  note: "Backspace paragraph merge meets its approved bounded Writer scope."
  evaluated_sha: "06430f44d429e7852ef078b8d846e898e0b629c9"
  blueprint_digest: "2566476f85ceccb27ca39d37006909329fb4a6d53fb5097abf183900e0b6213a"
  evidence_refs:
    - ".agentplane/tasks/202608111311-BFCRET/README.md"
    - ".agentplane/tasks/202608111311-BFCRET/quality/20260811-131445533-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111311-BFCRET/quality/20260811-131445533-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111311-BFCRET/quality/20260811-131445533-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111311-BFCRET/blueprint/resolved-snapshot.json"
    - "06430f44d429e7852ef078b8d846e898e0b629c9"
  findings:
    - "No blocking defects found."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implementing bounded Writer Backspace paragraph merge at an eligible document caret without new command UI."
events:
  -
    type: "status"
    at: "2026-08-11T13:11:34.215Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing bounded Writer Backspace paragraph merge at an eligible document caret without new command UI."
  -
    type: "verify"
    at: "2026-08-11T13:14:45.218Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified bounded Backspace merge behavior, inherited preceding formatting, history focus, documentation, and passing evidence."
doc_version: 3
doc_updated_at: "2026-08-11T13:14:45.276Z"
doc_updated_by: "CODER"
description: "Implement bounded native Backspace behavior in the integrated Writer document canvas: at a collapsed caret offset zero in a non-first plain-text paragraph, merge its text into the preceding paragraph, retain history and browser-local persistence, and focus the merged paragraph at the join offset. Do not add a toolbar or menu control."
sections:
  Summary: |-
    Merge Writer paragraphs through Backspace

    Implement bounded native Backspace behavior in the integrated Writer document canvas: at a collapsed caret offset zero in a non-first plain-text paragraph, merge its text into the preceding paragraph, retain history and browser-local persistence, and focus the merged paragraph at the join offset. Do not add a toolbar or menu control.
  Scope: |-
    - In scope: pure adjacent paragraph merge, collapsed-caret Backspace handling at offset zero, focus restoration at the join offset, history/storage/download retention, tests, and Writer-parity documentation.
    - Out of scope: Backspace inside text, non-collapsed selections, first-paragraph behavior, Shift/modified Backspace, list/table/rich-text semantics, and UI command surfaces.
  Plan: |-
    1. Add a small immutable adjacent-merge domain primitive with deterministic retained paragraph identity and documented formatting rule.
    2. Wire Backspace at an eligible native caret to history and post-render focus without adding UI controls.
    3. Add unit, component, and targeted production-browser coverage plus documentation; run fast checks and record the approved aggregate-check deferral.
  Verify Steps: |-
    1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage.
    2. Run targeted production Playwright. Expected: Backspace merges the second paragraph at its beginning and retains accessible Writer chrome.
    3. Run diff, doctor, and policy routing checks. Expected: all pass.
    4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:14:45.218Z — VERIFY — ok

    By: REVIEWER

    Note: Verified bounded Backspace merge behavior, inherited preceding formatting, history focus, documentation, and passing evidence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:14:44.740Z, excerpt_hash=sha256:52e55a0025fd3416a17b956530516e9f7eb0ca2ce5681e07e3da9a6f8fb00315

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111311-BFCRET/blueprint/resolved-snapshot.json
    - old_digest: 2566476f85ceccb27ca39d37006909329fb4a6d53fb5097abf183900e0b6213a
    - current_digest: 2566476f85ceccb27ca39d37006909329fb4a6d53fb5097abf183900e0b6213a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111311-BFCRET

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111311-BFCRET
    - diagnostic_command: agentplane task run status 202608111311-BFCRET
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "- Revert the task implementation commit and rerun focused tests to restore non-modeled browser Backspace behavior."
  Findings: |-
    Command: format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Result: pass. Evidence: 18 test files and 51 tests passed at 100 percent coverage; JSDoc covered 111 files. Scope: immutable merge and Backspace interaction.

    Command: production Playwright. Result: pass. Evidence: production Vite build and Chromium plus axe scenario passed; Backspace removes the second paragraph boundary and undo restores it. Scope: browser-visible merge behavior.

    Command: diff check, doctor, policy routing. Result: pass. Evidence: no whitespace errors; doctor only reports two informational configuration notes; routing passed. Scope: repository health.

    Review: writer.ts at 544 lines and WriterWorkbench.tsx at 521 lines are decomposition candidates, not mandatory splits. A separate structural task is needed to keep this feature task focused.

    Skipped: static smoke, inventory, aggregate verify. Reason: user-approved ten-task cadence. Risk: aggregate checks have not rerun. Approval: user.
id_source: "generated"
---
## Summary

Merge Writer paragraphs through Backspace

Implement bounded native Backspace behavior in the integrated Writer document canvas: at a collapsed caret offset zero in a non-first plain-text paragraph, merge its text into the preceding paragraph, retain history and browser-local persistence, and focus the merged paragraph at the join offset. Do not add a toolbar or menu control.

## Scope

- In scope: pure adjacent paragraph merge, collapsed-caret Backspace handling at offset zero, focus restoration at the join offset, history/storage/download retention, tests, and Writer-parity documentation.
- Out of scope: Backspace inside text, non-collapsed selections, first-paragraph behavior, Shift/modified Backspace, list/table/rich-text semantics, and UI command surfaces.

## Plan

1. Add a small immutable adjacent-merge domain primitive with deterministic retained paragraph identity and documented formatting rule.
2. Wire Backspace at an eligible native caret to history and post-render focus without adding UI controls.
3. Add unit, component, and targeted production-browser coverage plus documentation; run fast checks and record the approved aggregate-check deferral.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage.
2. Run targeted production Playwright. Expected: Backspace merges the second paragraph at its beginning and retains accessible Writer chrome.
3. Run diff, doctor, and policy routing checks. Expected: all pass.
4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:14:45.218Z — VERIFY — ok

By: REVIEWER

Note: Verified bounded Backspace merge behavior, inherited preceding formatting, history focus, documentation, and passing evidence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:14:44.740Z, excerpt_hash=sha256:52e55a0025fd3416a17b956530516e9f7eb0ca2ce5681e07e3da9a6f8fb00315

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111311-BFCRET/blueprint/resolved-snapshot.json
- old_digest: 2566476f85ceccb27ca39d37006909329fb4a6d53fb5097abf183900e0b6213a
- current_digest: 2566476f85ceccb27ca39d37006909329fb4a6d53fb5097abf183900e0b6213a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111311-BFCRET

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111311-BFCRET
- diagnostic_command: agentplane task run status 202608111311-BFCRET
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation commit and rerun focused tests to restore non-modeled browser Backspace behavior.

## Findings

Command: format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Result: pass. Evidence: 18 test files and 51 tests passed at 100 percent coverage; JSDoc covered 111 files. Scope: immutable merge and Backspace interaction.

Command: production Playwright. Result: pass. Evidence: production Vite build and Chromium plus axe scenario passed; Backspace removes the second paragraph boundary and undo restores it. Scope: browser-visible merge behavior.

Command: diff check, doctor, policy routing. Result: pass. Evidence: no whitespace errors; doctor only reports two informational configuration notes; routing passed. Scope: repository health.

Review: writer.ts at 544 lines and WriterWorkbench.tsx at 521 lines are decomposition candidates, not mandatory splits. A separate structural task is needed to keep this feature task focused.

Skipped: static smoke, inventory, aggregate verify. Reason: user-approved ten-task cadence. Risk: aggregate checks have not rerun. Approval: user.
