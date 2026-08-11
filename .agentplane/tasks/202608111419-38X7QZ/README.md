---
id: "202608111419-38X7QZ"
title: "Decompose Writer workbench and application tests"
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
  updated_at: "2026-08-11T14:19:23.084Z"
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
    body: "Start: extract focused Writer browser commands and tests while preserving exact UI behavior and full coverage."
events:
  -
    type: "status"
    at: "2026-08-11T14:19:28.100Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract focused Writer browser commands and tests while preserving exact UI behavior and full coverage."
doc_version: 3
doc_updated_at: "2026-08-11T14:19:28.100Z"
doc_updated_by: "CODER"
description: "Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage."
sections:
  Summary: |-
    Decompose Writer workbench and application tests

    Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.
  Scope: |-
    - In scope: Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.
    - Out of scope: unrelated refactors not required for "Decompose Writer workbench and application tests".
  Plan: "1. Inspect workbench handler seams and current App test groups. 2. Extract browser download and clipboard handlers into a focused documented hook, retaining all behavior and injected boundaries. 3. Move menu/clipboard UI assertions into a focused test module and keep App.test.tsx as application-shell coverage. 4. Validate source size and all existing user-visible Writer flows."
  Verify Steps: "1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage; WriterWorkbench.tsx and App.test.tsx are no longer file-size review candidates. 2. Run targeted production Playwright coverage. Expected: existing Writer menu, keyboard, storage, selection, Copy, and visibility flows remain intact after extraction. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer aggregate verify, static smoke, LibreOffice inventory, and the full browser matrix under the user-approved ten-task cadence; record residual risk."
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

Decompose Writer workbench and application tests

Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.

## Scope

- In scope: Move browser command handlers out of the oversized Writer workbench and extract feature-specific Writer UI tests from App.test.tsx without changing behavior or coverage.
- Out of scope: unrelated refactors not required for "Decompose Writer workbench and application tests".

## Plan

1. Inspect workbench handler seams and current App test groups. 2. Extract browser download and clipboard handlers into a focused documented hook, retaining all behavior and injected boundaries. 3. Move menu/clipboard UI assertions into a focused test module and keep App.test.tsx as application-shell coverage. 4. Validate source size and all existing user-visible Writer flows.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage; WriterWorkbench.tsx and App.test.tsx are no longer file-size review candidates. 2. Run targeted production Playwright coverage. Expected: existing Writer menu, keyboard, storage, selection, Copy, and visibility flows remain intact after extraction. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer aggregate verify, static smoke, LibreOffice inventory, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
