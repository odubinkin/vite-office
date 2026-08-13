---
id: "202608130629-G5HCW7"
title: "Align Writer menu and toolbar modules with LibreOffice uiconfig paths"
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
  updated_at: "2026-08-13T06:29:45.357Z"
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
    body: "Start: Moving the remaining Writer menu and standard-toolbar controls into their concrete uiconfig ownership paths while preserving current command behavior and traceability."
events:
  -
    type: "status"
    at: "2026-08-13T06:29:46.523Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Moving the remaining Writer menu and standard-toolbar controls into their concrete uiconfig ownership paths while preserving current command behavior and traceability."
doc_version: 3
doc_updated_at: "2026-08-13T06:29:46.523Z"
doc_updated_by: "CODER"
description: "Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests."
sections:
  Summary: |-
    Align Writer menu and toolbar modules with LibreOffice uiconfig paths

    Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.
  Scope: |-
    - In scope: Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.
    - Out of scope: unrelated refactors not required for "Align Writer menu and toolbar modules with LibreOffice uiconfig paths".
  Plan: "1. Locate the remaining implemented Writer menu and toolbar React modules and map each to its pinned sw/uiconfig/swriter menubar or toolbar counterpart. 2. Move the menu control and its focused tests into sw/uiconfig/swriter/menubar, preserving public behavior. 3. Move the standard-toolbar control into sw/uiconfig/swriter/toolbar, preserving command placement and imports. 4. Update view imports, source-tree contract, parity mappings, and provenance documentation to remove stale generic UI module references. 5. Run coverage, focused menu and toolbar E2E or component tests as needed, then static/parity quality gates; defer full suite under the approved cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after the module relocation. 2. Run npm run test:e2e -- --grep File menu. Expected: the production Writer menu continues to open and invoke the existing command placement. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: all moved local paths and markers resolve at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
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

Align Writer menu and toolbar modules with LibreOffice uiconfig paths

Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.

## Scope

- In scope: Move the remaining implemented Writer menu and toolbar declarations and React controls from generic uibase/utlui names into concrete sw/uiconfig/swriter ownership paths, update imports, source-tree enforcement, parity evidence, and focused tests.
- Out of scope: unrelated refactors not required for "Align Writer menu and toolbar modules with LibreOffice uiconfig paths".

## Plan

1. Locate the remaining implemented Writer menu and toolbar React modules and map each to its pinned sw/uiconfig/swriter menubar or toolbar counterpart. 2. Move the menu control and its focused tests into sw/uiconfig/swriter/menubar, preserving public behavior. 3. Move the standard-toolbar control into sw/uiconfig/swriter/toolbar, preserving command placement and imports. 4. Update view imports, source-tree contract, parity mappings, and provenance documentation to remove stale generic UI module references. 5. Run coverage, focused menu and toolbar E2E or component tests as needed, then static/parity quality gates; defer full suite under the approved cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after the module relocation. 2. Run npm run test:e2e -- --grep File menu. Expected: the production Writer menu continues to open and invoke the existing command placement. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: all moved local paths and markers resolve at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
