---
id: "202608130736-KHXZ6N"
title: "Update parity CLI gap-count oracle for current Writer mapping"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T07:37:09.858Z"
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
    body: "Start: update the parity CLI oracle and complete the mandated full verification cadence."
events:
  -
    type: "status"
    at: "2026-08-13T07:37:10.524Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: update the parity CLI oracle and complete the mandated full verification cadence."
doc_version: 3
doc_updated_at: "2026-08-13T07:37:10.524Z"
doc_updated_by: "CODER"
description: "Align the production parity-mapping CLI test expectation with the documented gap count after completed Writer mapping records, then run the full ten-task verification cadence."
sections:
  Summary: |-
    Update parity CLI gap-count oracle for current Writer mapping

    Align the production parity-mapping CLI test expectation with the documented gap count after completed Writer mapping records, then run the full ten-task verification cadence.
  Scope: |-
    - In scope: Align the production parity-mapping CLI test expectation with the documented gap count after completed Writer mapping records, then run the full ten-task verification cadence.
    - Out of scope: unrelated refactors not required for "Update parity CLI gap-count oracle for current Writer mapping".
  Plan: "1. Replace the brittle parity CLI fixture expectation with the current documented Writer mapping gap count. 2. Keep the assertion explicit so unexpected capability-gap changes remain observable. 3. Run the focused parity CLI test and the complete npm run verify cadence that was triggered by the tenth closed task. 4. Record full verification evidence and leave no stale test oracle."
  Verify Steps: "1. Run npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Expected: the CLI test reports the current documented 16 parity gaps. 2. Run npm run verify. Expected: formatting, lint, type checks, both coverage suites, full Chromium e2e, static smoke, JSDoc, and file-size checks all pass. 3. Run git diff --check and ap doctor. Expected: clean whitespace and AgentPlane health. 4. No additional full suite is deferred: this task completes the ten-task cadence."
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

Update parity CLI gap-count oracle for current Writer mapping

Align the production parity-mapping CLI test expectation with the documented gap count after completed Writer mapping records, then run the full ten-task verification cadence.

## Scope

- In scope: Align the production parity-mapping CLI test expectation with the documented gap count after completed Writer mapping records, then run the full ten-task verification cadence.
- Out of scope: unrelated refactors not required for "Update parity CLI gap-count oracle for current Writer mapping".

## Plan

1. Replace the brittle parity CLI fixture expectation with the current documented Writer mapping gap count. 2. Keep the assertion explicit so unexpected capability-gap changes remain observable. 3. Run the focused parity CLI test and the complete npm run verify cadence that was triggered by the tenth closed task. 4. Record full verification evidence and leave no stale test oracle.

## Verify Steps

1. Run npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Expected: the CLI test reports the current documented 16 parity gaps. 2. Run npm run verify. Expected: formatting, lint, type checks, both coverage suites, full Chromium e2e, static smoke, JSDoc, and file-size checks all pass. 3. Run git diff --check and ap doctor. Expected: clean whitespace and AgentPlane health. 4. No additional full suite is deferred: this task completes the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
