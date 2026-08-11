---
id: "202608111336-2QSR3F"
title: "Select all Writer document text from Edit"
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
  updated_at: "2026-08-11T13:36:59.401Z"
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
    body: "Start: implementing bounded Writer Edit Select All with the tenth-task full verification checkpoint."
events:
  -
    type: "status"
    at: "2026-08-11T13:37:04.355Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing bounded Writer Edit Select All with the tenth-task full verification checkpoint."
doc_version: 3
doc_updated_at: "2026-08-11T13:37:04.355Z"
doc_updated_by: "CODER"
description: "Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite."
sections:
  Summary: |-
    Select all Writer document text from Edit

    Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.
  Scope: |-
    - In scope: Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.
    - Out of scope: unrelated refactors not required for "Select all Writer document text from Edit".
  Plan: "1. Add the upstream .uno:SelectAll placement to WriterMenuBar and route it to a browser-selection request without creating a non-upstream toolbar control. 2. Add a bounded document-editor select-all effect that selects all integrated Writer paragraphs but does not change their model, history, focus formatting target, or storage snapshot; move existing workspace chrome visibility state into a dedicated hook to keep WriterWorkbench below the decomposition-candidate threshold. 3. Add exhaustive unit/component and production Chromium evidence, update Writer UI and command-placement documentation with pinned upstream provenance, and run both targeted checks and the tenth-task full aggregate checkpoint: npm run verify and npm run inventory:validate."
  Verify Steps: "1. Run format check, lint, TypeScript, JSDoc, file-size, office coverage, and targeted production Playwright. Expected: Edit Select All selects the complete document body without mutating Writer history and all local checks pass at 100 percent office coverage. 2. Run npm run verify. Expected: full aggregate quality suite, static-build smoke, inventory tests, unit coverage, and browser tests pass. 3. Run npm run inventory:validate. Expected: all pinned LibreOffice corpus inventory contracts validate. 4. Run diff, doctor, and policy routing checks. Expected: all pass."
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

Select all Writer document text from Edit

Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.

## Scope

- In scope: Implement the pinned LibreOffice Writer .uno:SelectAll command in the static browser workbench: expose Edit Select All, select the complete integrated Writer document body through the browser selection API without mutating document history, retain accessibility, and add focused documentation and production evidence. This tenth post-checkpoint feature task also runs the full aggregate and inventory validation suite.
- Out of scope: unrelated refactors not required for "Select all Writer document text from Edit".

## Plan

1. Add the upstream .uno:SelectAll placement to WriterMenuBar and route it to a browser-selection request without creating a non-upstream toolbar control. 2. Add a bounded document-editor select-all effect that selects all integrated Writer paragraphs but does not change their model, history, focus formatting target, or storage snapshot; move existing workspace chrome visibility state into a dedicated hook to keep WriterWorkbench below the decomposition-candidate threshold. 3. Add exhaustive unit/component and production Chromium evidence, update Writer UI and command-placement documentation with pinned upstream provenance, and run both targeted checks and the tenth-task full aggregate checkpoint: npm run verify and npm run inventory:validate.

## Verify Steps

1. Run format check, lint, TypeScript, JSDoc, file-size, office coverage, and targeted production Playwright. Expected: Edit Select All selects the complete document body without mutating Writer history and all local checks pass at 100 percent office coverage. 2. Run npm run verify. Expected: full aggregate quality suite, static-build smoke, inventory tests, unit coverage, and browser tests pass. 3. Run npm run inventory:validate. Expected: all pinned LibreOffice corpus inventory contracts validate. 4. Run diff, doctor, and policy routing checks. Expected: all pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
