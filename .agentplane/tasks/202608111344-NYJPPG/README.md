---
id: "202608111344-NYJPPG"
title: "Copy Writer selection through Edit and standard toolbar"
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
  updated_at: "2026-08-11T13:44:30.675Z"
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
    body: "Start: implementing bounded Writer Copy in its pinned Edit and standard-toolbar locations."
events:
  -
    type: "status"
    at: "2026-08-11T13:44:35.551Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing bounded Writer Copy in its pinned Edit and standard-toolbar locations."
doc_version: 3
doc_updated_at: "2026-08-11T13:44:35.551Z"
doc_updated_by: "CODER"
description: "Implement the pinned LibreOffice Writer .uno:Copy command in the static browser workbench: expose Copy in Edit and the standard toolbar, copy current native browser selection through a browser-only platform adapter with a safe fallback, retain document data/history, and add focused tests and documentation."
sections:
  Summary: |-
    Copy Writer selection through Edit and standard toolbar

    Implement the pinned LibreOffice Writer .uno:Copy command in the static browser workbench: expose Copy in Edit and the standard toolbar, copy current native browser selection through a browser-only platform adapter with a safe fallback, retain document data/history, and add focused tests and documentation.
  Scope: |-
    - In scope: Implement the pinned LibreOffice Writer .uno:Copy command in the static browser workbench: expose Copy in Edit and the standard toolbar, copy current native browser selection through a browser-only platform adapter with a safe fallback, retain document data/history, and add focused tests and documentation.
    - Out of scope: unrelated refactors not required for "Copy Writer selection through Edit and standard toolbar".
  Plan: "1. Add a browser-only plain-text clipboard adapter with Clipboard API and explicit legacy fallback paths, together with exhaustive unit tests. 2. Add Copy at pinned Edit and standard-toolbar locations; route it through the current browser selection, update non-document status feedback, and retain document history and storage unchanged. 3. Add component and production Chromium evidence, update Writer UI/command-placement documentation and program index, and run focused fast checks plus targeted E2E. Defer full aggregate checks under the user-approved ten-task cadence."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage, and Copy handles native Clipboard API success, rejection fallback, unavailable selection, and fallback failure. 2. Run the production Playwright scenario. Expected: Edit Select All then Edit Copy reports successful browser-local copying; the same Copy command is present in the Writer standard toolbar. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
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

Copy Writer selection through Edit and standard toolbar

Implement the pinned LibreOffice Writer .uno:Copy command in the static browser workbench: expose Copy in Edit and the standard toolbar, copy current native browser selection through a browser-only platform adapter with a safe fallback, retain document data/history, and add focused tests and documentation.

## Scope

- In scope: Implement the pinned LibreOffice Writer .uno:Copy command in the static browser workbench: expose Copy in Edit and the standard toolbar, copy current native browser selection through a browser-only platform adapter with a safe fallback, retain document data/history, and add focused tests and documentation.
- Out of scope: unrelated refactors not required for "Copy Writer selection through Edit and standard toolbar".

## Plan

1. Add a browser-only plain-text clipboard adapter with Clipboard API and explicit legacy fallback paths, together with exhaustive unit tests. 2. Add Copy at pinned Edit and standard-toolbar locations; route it through the current browser selection, update non-document status feedback, and retain document history and storage unchanged. 3. Add component and production Chromium evidence, update Writer UI/command-placement documentation and program index, and run focused fast checks plus targeted E2E. Defer full aggregate checks under the user-approved ten-task cadence.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage, and Copy handles native Clipboard API success, rejection fallback, unavailable selection, and fallback failure. 2. Run the production Playwright scenario. Expected: Edit Select All then Edit Copy reports successful browser-local copying; the same Copy command is present in the Writer standard toolbar. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
