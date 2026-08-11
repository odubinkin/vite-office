---
id: "202608111329-ZTN9JB"
title: "Toggle Writer horizontal ruler from View"
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
  updated_at: "2026-08-11T13:29:50.546Z"
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
    body: "Start: implementing the bounded Writer View Rulers command at its pinned menu location."
events:
  -
    type: "status"
    at: "2026-08-11T13:29:57.608Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the bounded Writer View Rulers command at its pinned menu location."
doc_version: 3
doc_updated_at: "2026-08-11T13:29:57.608Z"
doc_updated_by: "CODER"
description: "Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence."
sections:
  Summary: |-
    Toggle Writer horizontal ruler from View

    Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.
  Scope: |-
    - In scope: Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.
    - Out of scope: unrelated refactors not required for "Toggle Writer horizontal ruler from View".
  Plan: "1. Add the nested View Rulers menu and the upstream .uno:Ruler placement to WriterMenuBar while preserving all currently enabled Writer menus. 2. Thread horizontal-ruler visibility through WriterWorkbench and WriterWorkspaceChrome so hiding it releases its chrome height without changing paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Rulers exposes a checked Horizontal Ruler command, hides the ruler while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
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

Toggle Writer horizontal ruler from View

Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.

## Scope

- In scope: Implement the pinned LibreOffice Writer .uno:Ruler command in the static browser workbench: add the nested View Rulers menu, toggle the existing horizontal ruler without changing document data, retain accessible state and canvas layout, and add focused documentation and browser evidence.
- Out of scope: unrelated refactors not required for "Toggle Writer horizontal ruler from View".

## Plan

1. Add the nested View Rulers menu and the upstream .uno:Ruler placement to WriterMenuBar while preserving all currently enabled Writer menus. 2. Thread horizontal-ruler visibility through WriterWorkbench and WriterWorkspaceChrome so hiding it releases its chrome height without changing paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage and no new size candidate. 2. Run the production Playwright scenario. Expected: View Rulers exposes a checked Horizontal Ruler command, hides the ruler while the document canvas remains accessible, restores it, and leaves existing Writer interactions intact. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
