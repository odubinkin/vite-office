---
id: "202611200139-4Z94YX"
title: "Repair full-suite regressions after DOCX and XLSX integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-11-20T02:49:32.459Z"
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
    1. Run the complete application suite with `npm run test:coverage --workspace @vite-office/office -- --maxWorkers 4`. Retain existing coverage gates and record test failures independently from coverage thresholds.
    2. Run `npm run test:tooling` and `npm run test:inventory:coverage` independently. Verify edited evidence against the production registry with `npm run inventory:parity` and `npm run check:source-provenance`.
    3. Build with `npm run build`. Run the complete Writer, Calc, and shared Chromium projects. If the default preview port is occupied, verify that the running server serves the built assets and reuse it. Keep the configured project profiles and timeouts visible in evidence.
    4. Reproduce each reported failure in the owning test suite, correct product behavior or outdated expectations, and rerun the affected tests. Verify changes with scoped ESLint and Prettier, application TypeScript, JSDoc, the static build smoke check, routing, doctor, and `git diff --check`.
    5. Verify the reported DOCX through Writer's existing Open dialog and browser storage after reload. Use the attachment locally without adding it to Git. Record baseline and final commits, open findings, and final working-tree state.
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

1. Run the complete application suite with `npm run test:coverage --workspace @vite-office/office -- --maxWorkers 4`. Retain existing coverage gates and record test failures independently from coverage thresholds.
2. Run `npm run test:tooling` and `npm run test:inventory:coverage` independently. Verify edited evidence against the production registry with `npm run inventory:parity` and `npm run check:source-provenance`.
3. Build with `npm run build`. Run the complete Writer, Calc, and shared Chromium projects. If the default preview port is occupied, verify that the running server serves the built assets and reuse it. Keep the configured project profiles and timeouts visible in evidence.
4. Reproduce each reported failure in the owning test suite, correct product behavior or outdated expectations, and rerun the affected tests. Verify changes with scoped ESLint and Prettier, application TypeScript, JSDoc, the static build smoke check, routing, doctor, and `git diff --check`.
5. Verify the reported DOCX through Writer's existing Open dialog and browser storage after reload. Use the attachment locally without adding it to Git. Record baseline and final commits, open findings, and final working-tree state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
