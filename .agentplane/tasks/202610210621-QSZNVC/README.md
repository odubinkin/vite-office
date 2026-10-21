---
id: "202610210621-QSZNVC"
title: "Align Calc browser Save shortcut and imported document persistence with Writer"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T06:21:36.500Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T06:37:14.575Z"
  updated_by: "CODER"
  note: "607Calc/135owners100;28related tests/shared accelerator100;13gates0;real Chrome Cmd+S and original ODS persistence/reopen confirmed;portable raw audit passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-21T06:37:37.801Z"
  updated_by: "EVALUATOR"
  note: "Shared Writer primary Save now serves Calc;strict Calc/common coverage and actual browser persistence checks pass."
  evaluated_sha: "c1f9a3f4b8e7877568f368e147e4896d15cff97d"
  blueprint_digest: "420eb9143cbe64aac6d6e3d14d1d8bb4fe45e5084a658c10c0e8d4a554b6a93c"
  evidence_refs:
    - ".agentplane/tasks/202610210621-QSZNVC/README.md"
    - ".agentplane/tasks/202610210621-QSZNVC/quality/20261021-063737801-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610210621-QSZNVC/quality/20261021-063737801-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610210621-QSZNVC/quality/20261021-063737801-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610210621-QSZNVC/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610210621-QSZNVC/evidence/acceptance.json"
    - ".agentplane/tasks/202610210621-QSZNVC/evidence/audit.mjs"
  findings:
    - "The actual Writer capture listener is extracted rather than duplicated. Mounted regression confirms in-progress input commits,primary writes,error feedback and session-independent import persistence.607Calc and28related tests pass at100;13gates pass. Original ODS persistence already works and is truthfully recorded as not reproduced."
commit:
  hash: "761441f90427c9ffaf7b01a48a770d98e9c22c57"
  message: "🧩 QSZNVC task: share Writer primary browser Save with Calc"
comments:
  -
    author: "CODER"
    body: "Start: reproduce reported Save/import bugs and implement shared Writer-compatible primary storage behavior with strict coverage."
  -
    author: "CODER"
    body: "Start: pin the verified shared Save implementation for quality review;all source hashes match607Calc100 and28related checks."
events:
  -
    type: "status"
    at: "2026-10-21T06:21:36.922Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce reported Save/import bugs and implement shared Writer-compatible primary storage behavior with strict coverage."
  -
    type: "verify"
    at: "2026-10-21T06:37:14.575Z"
    author: "CODER"
    state: "ok"
    note: "607Calc/135owners100;28related tests/shared accelerator100;13gates0;real Chrome Cmd+S and original ODS persistence/reopen confirmed;portable raw audit passed."
  -
    type: "status"
    at: "2026-10-21T06:37:30.395Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: pin the verified shared Save implementation for quality review;all source hashes match607Calc100 and28related checks."
doc_version: 3
doc_updated_at: "2026-10-21T06:37:30.395Z"
doc_updated_by: "CODER"
description: "Block69: fix Cmd/Ctrl+S primary browser saving using shared Writer behavior, reproduce imported ODS persistence failures and fix their actual cause; preserve canonical ODS owners and storage error feedback. Scope up to 12 source/test/registry documentation files plus task artifacts. Verify related tests and changed-owner100 coverage, Calc profile100, production and repository gates. Full-suite checkpoint remains block70."
sections:
  Summary: "Fix Calc Save and imported primary storage behavior reported by the user."
  Scope: "Block69, branch calc only. Extract the actual Writer browser Save accelerator into a common owner and connect Calc Flush; diagnose and fix imported-file storage failure through the actual ODS/store pipeline. Up to 12 source/test/registry/doc files plus task artifacts. No new formula or general kernel expansion."
  Plan: "Implement the user-requested browser Save/import parity fixes within the existing approved Calc UI goal; share Writer behavior, preserve storage contracts, and require related plus Calc100 coverage and real browser evidence."
  Verify Steps: "Run related changed-owner tests with 100 percent statement/branch/function/line coverage; npm run test:coverage:calc with unchanged 100 percent thresholds. Browser verify Cmd+S prevents page Save and imported sample appears in saved list and reopens. Run production build/static, lint, format, dependencies, JSDoc, size, source-tree/provenance, resources, registry, routing and doctor gates. Full all-app run is deferred to user-approved block70 checkpoint."
  Verification: |-
    Command: exact Calc/related Vitest commands and13gate argv/logs are retained in evidence/raw-results.json.gz; run node .agentplane/tasks/202610210621-QSZNVC/evidence/audit.mjs.
    Result: pass.
    Evidence:607Calc tests/135measured owners,0failed/pending;S11130/B6911/F2065/L9996 all100. Related28tests including actual Writer view and common shortcut ownership pass;shared accelerator rawS27/B21/F8/L22 all100. All13repository/build/static gates pass. Actual Chrome Meta+S commits in-progress cell input;Browser saved remains after reload and reopens. Original Downloads ODS persists immediately in current code,appears after reload and reopens Dulce/6548. Screenshot inspected.
    Scope:shared Writer capture-phase browser Save policy reused by Calc;no duplicated import save added. Original non-reproduced import report is preserved as finding rather than claiming an unsupported fix. Full final checkpoint70 is running;no new features scheduled.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T06:37:14.575Z — VERIFY — ok

    By: CODER

    Note: 607Calc/135owners100;28related tests/shared accelerator100;13gates0;real Chrome Cmd+S and original ODS persistence/reopen confirmed;portable raw audit passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T06:37:12.868Z, excerpt_hash=sha256:bcc83d3635aa0d5327e5160ef617cf135759ff36b16e9595079d688af92ad818

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210621-QSZNVC/blueprint/resolved-snapshot.json
    - old_digest: 420eb9143cbe64aac6d6e3d14d1d8bb4fe45e5084a658c10c0e8d4a554b6a93c
    - current_digest: 420eb9143cbe64aac6d6e3d14d1d8bb4fe45e5084a658c10c0e8d4a554b6a93c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610210621-QSZNVC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610210621-QSZNVC -m 🧩 QSZNVC task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit; preserve user changes and other task artifacts."
  Findings: |-
    Initial inspection confirms Calc lacks Writer capture-phase browser Save handler. Import already calls autosaveCalc with imported=true, so persistence needs real reproduction before changing code.

    - Observation: Calc lacked the Writer capture-phase primary Save listener; imported ODS already calls immediate primary persistence and passed actual sample reload/reopen in current branch.
      Impact: Cmd/Ctrl+S reached browser page Save. The reported import persistence failure was not reproduced after the earlier ordinary ODS fixes.
      Resolution: Extracted the actual Writer listener into shared useBrowserSaveShortcut,connected Calc Flush/error reporting,and added independent-session persistence and active-input Save regressions. Corrected only new test API/async assertions during verification;all final checks pass.
id_source: "generated"
---
## Summary

Fix Calc Save and imported primary storage behavior reported by the user.

## Scope

Block69, branch calc only. Extract the actual Writer browser Save accelerator into a common owner and connect Calc Flush; diagnose and fix imported-file storage failure through the actual ODS/store pipeline. Up to 12 source/test/registry/doc files plus task artifacts. No new formula or general kernel expansion.

## Plan

Implement the user-requested browser Save/import parity fixes within the existing approved Calc UI goal; share Writer behavior, preserve storage contracts, and require related plus Calc100 coverage and real browser evidence.

## Verify Steps

Run related changed-owner tests with 100 percent statement/branch/function/line coverage; npm run test:coverage:calc with unchanged 100 percent thresholds. Browser verify Cmd+S prevents page Save and imported sample appears in saved list and reopens. Run production build/static, lint, format, dependencies, JSDoc, size, source-tree/provenance, resources, registry, routing and doctor gates. Full all-app run is deferred to user-approved block70 checkpoint.

## Verification

Command: exact Calc/related Vitest commands and13gate argv/logs are retained in evidence/raw-results.json.gz; run node .agentplane/tasks/202610210621-QSZNVC/evidence/audit.mjs.
Result: pass.
Evidence:607Calc tests/135measured owners,0failed/pending;S11130/B6911/F2065/L9996 all100. Related28tests including actual Writer view and common shortcut ownership pass;shared accelerator rawS27/B21/F8/L22 all100. All13repository/build/static gates pass. Actual Chrome Meta+S commits in-progress cell input;Browser saved remains after reload and reopens. Original Downloads ODS persists immediately in current code,appears after reload and reopens Dulce/6548. Screenshot inspected.
Scope:shared Writer capture-phase browser Save policy reused by Calc;no duplicated import save added. Original non-reproduced import report is preserved as finding rather than claiming an unsupported fix. Full final checkpoint70 is running;no new features scheduled.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T06:37:14.575Z — VERIFY — ok

By: CODER

Note: 607Calc/135owners100;28related tests/shared accelerator100;13gates0;real Chrome Cmd+S and original ODS persistence/reopen confirmed;portable raw audit passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T06:37:12.868Z, excerpt_hash=sha256:bcc83d3635aa0d5327e5160ef617cf135759ff36b16e9595079d688af92ad818

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210621-QSZNVC/blueprint/resolved-snapshot.json
- old_digest: 420eb9143cbe64aac6d6e3d14d1d8bb4fe45e5084a658c10c0e8d4a554b6a93c
- current_digest: 420eb9143cbe64aac6d6e3d14d1d8bb4fe45e5084a658c10c0e8d4a554b6a93c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610210621-QSZNVC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610210621-QSZNVC -m 🧩 QSZNVC task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit; preserve user changes and other task artifacts.

## Findings

Initial inspection confirms Calc lacks Writer capture-phase browser Save handler. Import already calls autosaveCalc with imported=true, so persistence needs real reproduction before changing code.

- Observation: Calc lacked the Writer capture-phase primary Save listener; imported ODS already calls immediate primary persistence and passed actual sample reload/reopen in current branch.
  Impact: Cmd/Ctrl+S reached browser page Save. The reported import persistence failure was not reproduced after the earlier ordinary ODS fixes.
  Resolution: Extracted the actual Writer listener into shared useBrowserSaveShortcut,connected Calc Flush/error reporting,and added independent-session persistence and active-input Save regressions. Corrected only new test API/async assertions during verification;all final checks pass.
