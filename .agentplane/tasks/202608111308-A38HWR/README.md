---
id: "202608111308-A38HWR"
title: "Remove non-Writer text download toolbar command"
result_summary: "Removed non-Writer text download from the standard toolbar while preserving File export."
risk_level: "low"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T13:08:31.839Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:10:19.062Z"
  updated_by: "REVIEWER"
  note: "Verified text download was removed from the standard toolbar, remains available in File, and has complete focused evidence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T13:10:19.420Z"
  updated_by: "EVALUATOR"
  note: "Toolbar placement now matches pinned Writer standardbar evidence."
  evaluated_sha: "96c794617ceab21087e905f0725f41000e29bb73"
  blueprint_digest: "f02308bc070fda8a55099ba658bc63443b4c4db8fd04647422e31785215f3bc6"
  evidence_refs:
    - ".agentplane/tasks/202608111308-A38HWR/README.md"
    - ".agentplane/tasks/202608111308-A38HWR/quality/20260811-131019420-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111308-A38HWR/quality/20260811-131019420-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111308-A38HWR/quality/20260811-131019420-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111308-A38HWR/blueprint/resolved-snapshot.json"
    - "96c794617ceab21087e905f0725f41000e29bb73"
  findings:
    - "No blocking defects found."
commit:
  hash: "75bc2ac50ab1be2c3b1673b792caa82ce99861c3"
  message: "🧩 A38HWR task: record toolbar verification"
comments:
  -
    author: "CODER"
    body: "Start: removing only the non-upstream text-download toolbar surface while retaining File export."
  -
    author: "CODER"
    body: "Verified: the standard toolbar now excludes browser-only text download while File retains the bounded text export, with passing focused evidence."
events:
  -
    type: "status"
    at: "2026-08-11T13:08:32.275Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: removing only the non-upstream text-download toolbar surface while retaining File export."
  -
    type: "verify"
    at: "2026-08-11T13:10:19.062Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified text download was removed from the standard toolbar, remains available in File, and has complete focused evidence."
  -
    type: "status"
    at: "2026-08-11T13:10:46.292Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: the standard toolbar now excludes browser-only text download while File retains the bounded text export, with passing focused evidence."
doc_version: 3
doc_updated_at: "2026-08-11T13:10:46.293Z"
doc_updated_by: "CODER"
description: "Remove the browser-only Download text control from the Writer standard toolbar because pinned LibreOffice Writer standardbar has no corresponding generic text-download command. Keep the existing bounded export only under File as Save as text, update tests and placement documentation, and preserve the underlying browser download capability."
sections:
  Summary: |-
    Remove non-Writer text download toolbar command

    Remove the browser-only Download text control from the Writer standard toolbar because pinned LibreOffice Writer standardbar has no corresponding generic text-download command. Keep the existing bounded export only under File as Save as text, update tests and placement documentation, and preserve the underlying browser download capability.
  Scope: |-
    - In scope: Remove the Download text button and its toolbar-only callback surface; retain File Save as text and the underlying browser download implementation.
    - In scope: Update focused tests and Writer command-placement documentation using pinned standardbar evidence.
    - Out of scope: changing plain-text export format, adding native Writer export formats, or modifying File menu behavior.
  Plan: |-
    1. Remove the toolbar-only text-download command while retaining the File menu entry and workbench download handler.
    2. Update unit and browser-facing assertions so the standard toolbar contains only commands with upstream placement.
    3. Record pinned standardbar provenance, run fast checks and focused browser coverage, and document the approved aggregate-check deferral.
  Verify Steps: |-
    1. Run project format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass and local coverage remains 100 percent.
    2. Run the focused production Playwright check. Expected: Writer chrome remains accessible and no Download text toolbar command is present.
    3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs. Expected: no whitespace errors and policy checks pass.
    4. Defer static smoke, inventory, and aggregate verification to the user-approved ten-task cadence; record the residual risk in Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:10:19.062Z — VERIFY — ok

    By: REVIEWER

    Note: Verified text download was removed from the standard toolbar, remains available in File, and has complete focused evidence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:10:18.567Z, excerpt_hash=sha256:a4f329473a95e212682cd4716cd3e27bdb76506a0c5b50936d238fc86f2206c3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111308-A38HWR/blueprint/resolved-snapshot.json
    - old_digest: f02308bc070fda8a55099ba658bc63443b4c4db8fd04647422e31785215f3bc6
    - current_digest: f02308bc070fda8a55099ba658bc63443b4c4db8fd04647422e31785215f3bc6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111308-A38HWR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111308-A38HWR
    - diagnostic_command: agentplane task run status 202608111308-A38HWR
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task implementation commit to restore the prior standard-toolbar button.
    - Re-run the focused suite to confirm the previous placement is restored.
  Findings: |-
    Command: fast project checks and office coverage. Result: pass. Evidence: 18 test files and 50 tests passed at 100 percent coverage; JSDoc covered 111 files; only pre-existing inventory contracts remains a size-review candidate. Scope: toolbar command removal and File export preservation.

    Command: focused production Playwright. Result: pass. Evidence: Vite production build and Chromium scenario passed with axe; standard toolbar has no Download text button. Scope: Writer chrome placement.

    Command: git diff --check; ap doctor; policy routing check. Result: pass. Evidence: no whitespace errors; doctor has only two informational configuration notes; policy routing passed.

    Skipped: static smoke, inventory, aggregate verify. Reason: user-approved ten-task cadence. Risk: aggregate checks have not rerun. Approval: user.
extensions:
  implementation_commit:
    hash: "96c794617ceab21087e905f0725f41000e29bb73"
    message: "✨ A38HWR code: Remove non-Writer download toolbar command"
id_source: "generated"
---
## Summary

Remove non-Writer text download toolbar command

Remove the browser-only Download text control from the Writer standard toolbar because pinned LibreOffice Writer standardbar has no corresponding generic text-download command. Keep the existing bounded export only under File as Save as text, update tests and placement documentation, and preserve the underlying browser download capability.

## Scope

- In scope: Remove the Download text button and its toolbar-only callback surface; retain File Save as text and the underlying browser download implementation.
- In scope: Update focused tests and Writer command-placement documentation using pinned standardbar evidence.
- Out of scope: changing plain-text export format, adding native Writer export formats, or modifying File menu behavior.

## Plan

1. Remove the toolbar-only text-download command while retaining the File menu entry and workbench download handler.
2. Update unit and browser-facing assertions so the standard toolbar contains only commands with upstream placement.
3. Record pinned standardbar provenance, run fast checks and focused browser coverage, and document the approved aggregate-check deferral.

## Verify Steps

1. Run project format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass and local coverage remains 100 percent.
2. Run the focused production Playwright check. Expected: Writer chrome remains accessible and no Download text toolbar command is present.
3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs. Expected: no whitespace errors and policy checks pass.
4. Defer static smoke, inventory, and aggregate verification to the user-approved ten-task cadence; record the residual risk in Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:10:19.062Z — VERIFY — ok

By: REVIEWER

Note: Verified text download was removed from the standard toolbar, remains available in File, and has complete focused evidence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:10:18.567Z, excerpt_hash=sha256:a4f329473a95e212682cd4716cd3e27bdb76506a0c5b50936d238fc86f2206c3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111308-A38HWR/blueprint/resolved-snapshot.json
- old_digest: f02308bc070fda8a55099ba658bc63443b4c4db8fd04647422e31785215f3bc6
- current_digest: f02308bc070fda8a55099ba658bc63443b4c4db8fd04647422e31785215f3bc6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111308-A38HWR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111308-A38HWR
- diagnostic_command: agentplane task run status 202608111308-A38HWR
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation commit to restore the prior standard-toolbar button.
- Re-run the focused suite to confirm the previous placement is restored.

## Findings

Command: fast project checks and office coverage. Result: pass. Evidence: 18 test files and 50 tests passed at 100 percent coverage; JSDoc covered 111 files; only pre-existing inventory contracts remains a size-review candidate. Scope: toolbar command removal and File export preservation.

Command: focused production Playwright. Result: pass. Evidence: Vite production build and Chromium scenario passed with axe; standard toolbar has no Download text button. Scope: Writer chrome placement.

Command: git diff --check; ap doctor; policy routing check. Result: pass. Evidence: no whitespace errors; doctor has only two informational configuration notes; policy routing passed.

Skipped: static smoke, inventory, aggregate verify. Reason: user-approved ten-task cadence. Risk: aggregate checks have not rerun. Approval: user.
