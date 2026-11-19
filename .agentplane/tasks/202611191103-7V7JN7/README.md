---
id: "202611191103-7V7JN7"
title: "Run full Writer and Calc regression and repair failing tests"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "regression"
  - "verification"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-19T11:03:17.828Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-19T11:03:29.311Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-19T11:03:29.311Z"
doc_updated_by: "CODER"
description: "Execute the user-requested complete application, production browser, tooling and inventory verification after the Writer embedded graphic checkpoint. Diagnose, repair and re-verify functional failures in their source owners and record unchanged coverage gates."
sections:
  Summary: |-
    Run full Writer and Calc regression and repair failing tests

    Execute the user-requested complete application, production browser, tooling and inventory verification after the Writer embedded graphic checkpoint. Diagnose, repair and re-verify functional failures in their source owners and record unchanged coverage gates.
  Scope: |-
    - In scope: Execute the user-requested complete application, production browser, tooling and inventory verification after the Writer embedded graphic checkpoint. Diagnose, repair and re-verify functional failures in their source owners and record unchanged coverage gates.
    - Out of scope: unrelated refactors not required for "Run full Writer and Calc regression and repair failing tests".
  Plan: "Run the complete application coverage suite, all production browser projects, the full tooling suite and complete inventory coverage against the committed checkout after the embedded Writer graphic-model checkpoint. Keep the full baseline and record any failed assertions separately from the existing global coverage threshold. Reproduce failures in their owning project, identify whether they come from the current changes or a pre-existing issue, and correct source-backed regressions with focused verification. Retain assertions, coverage configuration and browser projects. Run the relevant full suite again when a fix materially affects the baseline and verify the finished Git state."
  Verify Steps: "Run npm run test:coverage -- --maxWorkers=2 with the existing full application thresholds and a durable result reporter. Run npm run test:e2e -- --workers=2 --timeout=120000, npm run test:tooling -- --testTimeout=30000, and npm run test:inventory:coverage -- --maxWorkers=1 --testTimeout=30000 regardless of earlier independent exit codes. Record each total, failing case and coverage summary. Compare coverage deficits with the prior full run without changing thresholds. Reproduce and repair actual test failures, run the affected test owner suites again, and use the corresponding static, type, documentation and boundary checks for any source fixes. Record exact original and final revisions, Agentplane evidence and final git status."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Run full Writer and Calc regression and repair failing tests

Execute the user-requested complete application, production browser, tooling and inventory verification after the Writer embedded graphic checkpoint. Diagnose, repair and re-verify functional failures in their source owners and record unchanged coverage gates.

## Scope

- In scope: Execute the user-requested complete application, production browser, tooling and inventory verification after the Writer embedded graphic checkpoint. Diagnose, repair and re-verify functional failures in their source owners and record unchanged coverage gates.
- Out of scope: unrelated refactors not required for "Run full Writer and Calc regression and repair failing tests".

## Plan

Run the complete application coverage suite, all production browser projects, the full tooling suite and complete inventory coverage against the committed checkout after the embedded Writer graphic-model checkpoint. Keep the full baseline and record any failed assertions separately from the existing global coverage threshold. Reproduce failures in their owning project, identify whether they come from the current changes or a pre-existing issue, and correct source-backed regressions with focused verification. Retain assertions, coverage configuration and browser projects. Run the relevant full suite again when a fix materially affects the baseline and verify the finished Git state.

## Verify Steps

Run npm run test:coverage -- --maxWorkers=2 with the existing full application thresholds and a durable result reporter. Run npm run test:e2e -- --workers=2 --timeout=120000, npm run test:tooling -- --testTimeout=30000, and npm run test:inventory:coverage -- --maxWorkers=1 --testTimeout=30000 regardless of earlier independent exit codes. Record each total, failing case and coverage summary. Compare coverage deficits with the prior full run without changing thresholds. Reproduce and repair actual test failures, run the affected test owner suites again, and use the corresponding static, type, documentation and boundary checks for any source fixes. Record exact original and final revisions, Agentplane evidence and final git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
