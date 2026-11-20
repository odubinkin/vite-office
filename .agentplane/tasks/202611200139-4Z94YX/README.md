---
id: "202611200139-4Z94YX"
title: "Repair full-suite regressions after DOCX and XLSX integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Run full office coverage, inventory coverage, all three Chromium projects and the tooling test suite. Rerun affected suites and relevant quality checks after fixes. Exercise the reported DOCX through production Open and browser storage, without publishing the private fixture."
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T01:39:54.550Z"
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
    body: "Start: Repair full-suite regressions after DOCX and XLSX integration. Guided shortcut created the task, approved the plan, and entered execution."
events:
  -
    type: "status"
    at: "2026-11-20T01:39:54.561Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Repair full-suite regressions after DOCX and XLSX integration. Guided shortcut created the task, approved the plan, and entered execution."
doc_version: 3
doc_updated_at: "2026-11-20T01:39:54.561Z"
doc_updated_by: "CODER"
description: "Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired."
sections:
  Summary: |-
    Repair full-suite regressions after DOCX and XLSX integration

    Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.
  Scope: |-
    - In scope: Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.
    - Out of scope: unrelated refactors not required for "Repair full-suite regressions after DOCX and XLSX integration".
  Plan: "Complete each independent suite, preserve initial failures, repair their causes without weakening checks, then rerun affected suites and record tested revisions."
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Run `Run full office coverage, inventory coverage, all three Chromium projects and the tooling test suite. Rerun affected suites and relevant quality checks after fixes. Exercise the reported DOCX through production Open and browser storage, without publishing the private fixture.`. Expected: it succeeds and confirms the requested outcome for this task.
    2. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    3. Compare the final result against the task summary and touched scope. Expected: remaining follow-up is either resolved or explicit in ## Findings.
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

Repair full-suite regressions after DOCX and XLSX integration

Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.

## Scope

- In scope: Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.
- Out of scope: unrelated refactors not required for "Repair full-suite regressions after DOCX and XLSX integration".

## Plan

Complete each independent suite, preserve initial failures, repair their causes without weakening checks, then rerun affected suites and record tested revisions.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Run `Run full office coverage, inventory coverage, all three Chromium projects and the tooling test suite. Rerun affected suites and relevant quality checks after fixes. Exercise the reported DOCX through production Open and browser storage, without publishing the private fixture.`. Expected: it succeeds and confirms the requested outcome for this task.
2. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
3. Compare the final result against the task summary and touched scope. Expected: remaining follow-up is either resolved or explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
