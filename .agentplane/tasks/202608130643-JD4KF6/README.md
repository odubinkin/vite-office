---
id: "202608130643-JD4KF6"
title: "Promote and demote active Writer list levels"
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
  updated_at: "2026-08-13T06:43:46.723Z"
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
    body: "Start: Implementing bounded Writer list-level Promote and Demote commands in their pinned list-shell and UI configuration ownership paths."
events:
  -
    type: "status"
    at: "2026-08-13T06:43:47.313Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implementing bounded Writer list-level Promote and Demote commands in their pinned list-shell and UI configuration ownership paths."
doc_version: 3
doc_updated_at: "2026-08-13T06:43:47.313Z"
doc_updated_by: "CODER"
description: "Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation."
sections:
  Summary: |-
    Promote and demote active Writer list levels

    Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.
  Scope: |-
    - In scope: Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.
    - Out of scope: unrelated refactors not required for "Promote and demote active Writer list levels".
  Plan: "1. Map Writer Promote and Demote level commands to the pinned list-shell, core-numbering, menu, toolbar, test, and Help sources. 2. Add a bounded immutable list-level transition in sw/source/uibase/shells/listsh.ts, retaining list kind, text, style, and sibling identity. 3. Place Promote and Demote in Format → Bullets and Numbering and a concrete sw/uiconfig/swriter/toolbar/numobjectbar browser control; disable them outside lists or at the 0 and 9 bounds. 4. Render level-based document indentation without adding marker text to editable content. 5. Add unit, workbench, Chromium, source-tree, parity, and documentation evidence. 6. Run fast coverage, focused Writer list E2E, parity, and static gates; defer full suite under the approved ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage, including list-level bounds and no-op paths. 2. Run npm run test:e2e -- --grep Writer bullets and numbering. Expected: production Chromium promotes and demotes the active list item through Writer-positioned controls while keeping text editable. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: LO-WRITER-0107 resolves pinned implementation, test, Help, and local evidence. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
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

Promote and demote active Writer list levels

Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.

## Scope

- In scope: Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.
- Out of scope: unrelated refactors not required for "Promote and demote active Writer list levels".

## Plan

1. Map Writer Promote and Demote level commands to the pinned list-shell, core-numbering, menu, toolbar, test, and Help sources. 2. Add a bounded immutable list-level transition in sw/source/uibase/shells/listsh.ts, retaining list kind, text, style, and sibling identity. 3. Place Promote and Demote in Format → Bullets and Numbering and a concrete sw/uiconfig/swriter/toolbar/numobjectbar browser control; disable them outside lists or at the 0 and 9 bounds. 4. Render level-based document indentation without adding marker text to editable content. 5. Add unit, workbench, Chromium, source-tree, parity, and documentation evidence. 6. Run fast coverage, focused Writer list E2E, parity, and static gates; defer full suite under the approved ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage, including list-level bounds and no-op paths. 2. Run npm run test:e2e -- --grep Writer bullets and numbering. Expected: production Chromium promotes and demotes the active list item through Writer-positioned controls while keeping text editable. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: LO-WRITER-0107 resolves pinned implementation, test, Help, and local evidence. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
