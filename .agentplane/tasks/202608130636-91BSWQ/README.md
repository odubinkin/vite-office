---
id: "202608130636-91BSWQ"
title: "Align Writer browser command shell with textsh ownership"
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
  updated_at: "2026-08-13T06:37:13.851Z"
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
    body: "Start: Relocating the browser-owned Writer command hook to the concrete textsh command-shell boundary without changing its bounded Copy and download behavior."
events:
  -
    type: "status"
    at: "2026-08-13T06:37:14.596Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Relocating the browser-owned Writer command hook to the concrete textsh command-shell boundary without changing its bounded Copy and download behavior."
doc_version: 3
doc_updated_at: "2026-08-13T06:37:14.596Z"
doc_updated_by: "CODER"
description: "Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path."
sections:
  Summary: |-
    Align Writer browser command shell with textsh ownership

    Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.
  Scope: |-
    - In scope: Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.
    - Out of scope: unrelated refactors not required for "Align Writer browser command shell with textsh ownership".
  Plan: "1. Move the browser-owned Writer copy and download command hook from the generic uibase/utlui path into sw/source/uibase/shells/textsh.ts, which is the pinned Writer command-shell ownership path. 2. Update the workbench import and all source-tree, parity, and provenance references; reject restored generic hook paths. 3. Preserve browser-only commands and public behavior without expanding the feature set. 4. Run 100 percent unit coverage, focused native copy E2E, parity inventory, and static gates; defer the full suite under the approved cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after command-shell relocation. 2. Run npm run test:e2e -- --grep copies visible formatted Writer content. Expected: the production Writer Copy flow still writes sanitised rich clipboard data. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: moved textsh local evidence resolves at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
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

Align Writer browser command shell with textsh ownership

Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.

## Scope

- In scope: Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.
- Out of scope: unrelated refactors not required for "Align Writer browser command shell with textsh ownership".

## Plan

1. Move the browser-owned Writer copy and download command hook from the generic uibase/utlui path into sw/source/uibase/shells/textsh.ts, which is the pinned Writer command-shell ownership path. 2. Update the workbench import and all source-tree, parity, and provenance references; reject restored generic hook paths. 3. Preserve browser-only commands and public behavior without expanding the feature set. 4. Run 100 percent unit coverage, focused native copy E2E, parity inventory, and static gates; defer the full suite under the approved cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after command-shell relocation. 2. Run npm run test:e2e -- --grep copies visible formatted Writer content. Expected: the production Writer Copy flow still writes sanitised rich clipboard data. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: moved textsh local evidence resolves at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
