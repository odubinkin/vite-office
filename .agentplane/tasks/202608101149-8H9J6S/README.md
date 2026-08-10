---
id: "202608101149-8H9J6S"
title: "Implement typed command dispatch and key-binding registry"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T11:49:59.392Z"
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
    body: "Start: implement the approved typed command dispatch and key-binding registry with deterministic browser-independent behavior."
events:
  -
    type: "status"
    at: "2026-08-10T11:50:04.313Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved typed command dispatch and key-binding registry with deterministic browser-independent behavior."
doc_version: 3
doc_updated_at: "2026-08-10T11:50:04.313Z"
doc_updated_by: "CODER"
description: "Add a browser-only typed command registry with deterministic registration, shortcut lookup, dispatch results, tests, and honest program documentation as shared infrastructure for later office features."
sections:
  Summary: |-
    Implement typed command dispatch and key-binding registry

    Add a browser-only typed command registry with deterministic registration, shortcut lookup, dispatch results, tests, and honest program documentation as shared infrastructure for later office features.
  Scope: |-
    - In scope: a pure TypeScript command registry; typed IDs, labels, optional normalized key bindings, collision validation, deterministic lookup, and dispatch result contracts; focused unit tests; an honest shared-platform documentation page; and a non-executing shell summary only if it remains accessible.
    - Out of scope: global browser keyboard listeners, mutable application state, undo/redo, menus/toolbars, command-specific Writer behavior, persistence, localization, macro execution, and any LibreOffice parity claim.
  Plan: "1. Define a browser-independent typed command and immutable registry contract with explicit dispatch outcomes. 2. Implement deterministic shortcut normalization, lookup, and validation without global event listeners or React coupling. 3. Cover each registry and dispatch branch with unit tests and document the intentionally narrow platform boundary. 4. Expose only a non-executing accessible shell summary if it does not imply unfinished command UI. 5. Run all verification gates, record review evidence, and close."
  Verify Steps: |-
    1. Run strict type, lint, JSDoc, formatting, and file-size checks.
    2. Require 100% application unit coverage and unchanged inventory coverage.
    3. Unit-test command registration ordering, normalized shortcut lookup, dispatch success/missing/disabled outcomes, duplicate ID and shortcut rejection, and input immutability.
    4. Run E2E and static-build checks if a command-registry summary is exposed in the shell.
    5. Run npm run verify, agentplane doctor, and policy routing.
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

Implement typed command dispatch and key-binding registry

Add a browser-only typed command registry with deterministic registration, shortcut lookup, dispatch results, tests, and honest program documentation as shared infrastructure for later office features.

## Scope

- In scope: a pure TypeScript command registry; typed IDs, labels, optional normalized key bindings, collision validation, deterministic lookup, and dispatch result contracts; focused unit tests; an honest shared-platform documentation page; and a non-executing shell summary only if it remains accessible.
- Out of scope: global browser keyboard listeners, mutable application state, undo/redo, menus/toolbars, command-specific Writer behavior, persistence, localization, macro execution, and any LibreOffice parity claim.

## Plan

1. Define a browser-independent typed command and immutable registry contract with explicit dispatch outcomes. 2. Implement deterministic shortcut normalization, lookup, and validation without global event listeners or React coupling. 3. Cover each registry and dispatch branch with unit tests and document the intentionally narrow platform boundary. 4. Expose only a non-executing accessible shell summary if it does not imply unfinished command UI. 5. Run all verification gates, record review evidence, and close.

## Verify Steps

1. Run strict type, lint, JSDoc, formatting, and file-size checks.
2. Require 100% application unit coverage and unchanged inventory coverage.
3. Unit-test command registration ordering, normalized shortcut lookup, dispatch success/missing/disabled outcomes, duplicate ID and shortcut rejection, and input immutability.
4. Run E2E and static-build checks if a command-registry summary is exposed in the shell.
5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
