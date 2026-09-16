---
id: "202609160718-ZW5XA5"
title: "Fix Writer command test regressions"
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
  updated_at: "2026-09-16T07:18:35.904Z"
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
    body: "Start: inspecting selection synchronization and asynchronous Writer command error propagation in the approved scope."
events:
  -
    type: "status"
    at: "2026-09-16T07:18:42.221Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspecting selection synchronization and asynchronous Writer command error propagation in the approved scope."
doc_version: 3
doc_updated_at: "2026-09-16T07:18:42.221Z"
doc_updated_by: "CODER"
description: "Repair Copy/Cut selection synchronization and async failure presentation covered by failing Writer browser tests."
sections:
  Summary: |-
    Fix Writer command test regressions

    Repair Copy/Cut selection synchronization and async failure presentation covered by failing Writer browser tests.
  Scope: |-
    - In scope: Repair Copy/Cut selection synchronization and async failure presentation covered by failing Writer browser tests.
    - Out of scope: unrelated refactors not required for "Fix Writer command test regressions".
  Plan: "1. Inspect failing Copy/Cut and async command-status paths. 2. Repair minimal production code and/or test harness only where behavior is demonstrably incorrect. 3. Run targeted failing tests, then the application coverage suite; record residual inventory-suite timeout if it persists."
  Verify Steps: |-
    1. npx vitest run --coverage=false src/sw/browser/presentation/WriterMenuBar.test.tsx src/framework/browser/app/desktop.test.tsx
    2. npm run test:coverage --workspace @vite-office/office
    3. git status --short --untracked-files=all
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

Fix Writer command test regressions

Repair Copy/Cut selection synchronization and async failure presentation covered by failing Writer browser tests.

## Scope

- In scope: Repair Copy/Cut selection synchronization and async failure presentation covered by failing Writer browser tests.
- Out of scope: unrelated refactors not required for "Fix Writer command test regressions".

## Plan

1. Inspect failing Copy/Cut and async command-status paths. 2. Repair minimal production code and/or test harness only where behavior is demonstrably incorrect. 3. Run targeted failing tests, then the application coverage suite; record residual inventory-suite timeout if it persists.

## Verify Steps

1. npx vitest run --coverage=false src/sw/browser/presentation/WriterMenuBar.test.tsx src/framework/browser/app/desktop.test.tsx
2. npm run test:coverage --workspace @vite-office/office
3. git status --short --untracked-files=all

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
