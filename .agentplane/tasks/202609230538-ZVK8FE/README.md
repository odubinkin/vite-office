---
id: "202609230538-ZVK8FE"
title: "Implement Writer page geometry, page dialog, rulers, and ODT page styles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "backend"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T05:39:45.026Z"
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
    body: "Start: Implement the approved upstream-grounded Writer page geometry, ODT page-style interchange, Page Style dialog, and functional horizontal and vertical rulers with regression and browser verification."
events:
  -
    type: "status"
    at: "2026-09-23T05:39:51.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved upstream-grounded Writer page geometry, ODT page-style interchange, Page Style dialog, and functional horizontal and vertical rulers with regression and browser verification."
doc_version: 3
doc_updated_at: "2026-09-23T05:39:51.974Z"
doc_updated_by: "CODER"
description: "Add upstream-grounded page descriptors, physical page rendering, page-format dialog, horizontal and vertical rulers for page margins and paragraph indents, plus ODT page-layout import/export."
sections:
  Summary: |-
    Implement Writer page geometry, page dialog, rulers, and ODT page styles

    Add upstream-grounded page descriptors, physical page rendering, page-format dialog, horizontal and vertical rulers for page margins and paragraph indents, plus ODT page-layout import/export.
  Scope: |-
    In scope:
    - Upstream-shaped standard page descriptor owned by SwDoc: physical size, orientation, and four page margins in twips.
    - Physical paged browser projection with proportional page, margin, paragraph, and font geometry.
    - Page Style dialog for paper format, orientation, custom dimensions, and margins.
    - Functional horizontal and vertical rulers: page-margin handles plus paragraph left, right, and first-line indent handles.
    - Writer command, shell, notification, undo/redo, persistence, localization, and presentation wiring.
    - ODT 1.3 import/export of page-layout, page-layout-properties, master-page association, dimensions, margins, and print orientation.
    - Upstream traceability documentation and automated/browser verification.

    Out of scope:
    - Headers, footers, mirrored/facing pages, columns, background/borders, printer trays, page numbering, tables, frames, and unrelated layout features.
    - Network access or baseline upgrades.
  Plan: "Implement the approved upstream-grounded end-to-end Writer page geometry slice: core page descriptor and undo semantics, ODT page style interchange, physical paged projection, Page Style dialog, horizontal and vertical rulers for page margins and paragraph indents, tests, documentation, and real-browser verification. The supported boundary is one standard page style for the current text model; unrelated LibreOffice page features remain out of scope."
  Verify Steps: |-
    1. Run npm test. Expected: all repository unit, integration, ODT, command, and presentation tests pass.
    2. Run npm run lint. Expected: ESLint completes without errors.
    3. Run npm run typecheck. Expected: all TypeScript projects compile without errors.
    4. Run npm run build. Expected: the production static build completes successfully.
    5. Run node .agentplane/policy/check-routing.mjs. Expected: AgentPlane routing and policy budgets pass.
    6. Run ap doctor. Expected: repository workflow state is healthy.
    7. Run the Playwright CLI against the local production or development build. Expected: Page Style opens from the Writer command surface; applying paper size, orientation, and margins changes the page geometry; horizontal and vertical ruler drags change page margins and paragraph indents; Cancel is non-mutating; undo and redo restore changes.
    8. Inspect an exported ODT and re-import it. Expected: page width, height, orientation, four margins, and paragraph indents survive import-export-import and are represented by ODF page-layout/master-page attributes.
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

Implement Writer page geometry, page dialog, rulers, and ODT page styles

Add upstream-grounded page descriptors, physical page rendering, page-format dialog, horizontal and vertical rulers for page margins and paragraph indents, plus ODT page-layout import/export.

## Scope

In scope:
- Upstream-shaped standard page descriptor owned by SwDoc: physical size, orientation, and four page margins in twips.
- Physical paged browser projection with proportional page, margin, paragraph, and font geometry.
- Page Style dialog for paper format, orientation, custom dimensions, and margins.
- Functional horizontal and vertical rulers: page-margin handles plus paragraph left, right, and first-line indent handles.
- Writer command, shell, notification, undo/redo, persistence, localization, and presentation wiring.
- ODT 1.3 import/export of page-layout, page-layout-properties, master-page association, dimensions, margins, and print orientation.
- Upstream traceability documentation and automated/browser verification.

Out of scope:
- Headers, footers, mirrored/facing pages, columns, background/borders, printer trays, page numbering, tables, frames, and unrelated layout features.
- Network access or baseline upgrades.

## Plan

Implement the approved upstream-grounded end-to-end Writer page geometry slice: core page descriptor and undo semantics, ODT page style interchange, physical paged projection, Page Style dialog, horizontal and vertical rulers for page margins and paragraph indents, tests, documentation, and real-browser verification. The supported boundary is one standard page style for the current text model; unrelated LibreOffice page features remain out of scope.

## Verify Steps

1. Run npm test. Expected: all repository unit, integration, ODT, command, and presentation tests pass.
2. Run npm run lint. Expected: ESLint completes without errors.
3. Run npm run typecheck. Expected: all TypeScript projects compile without errors.
4. Run npm run build. Expected: the production static build completes successfully.
5. Run node .agentplane/policy/check-routing.mjs. Expected: AgentPlane routing and policy budgets pass.
6. Run ap doctor. Expected: repository workflow state is healthy.
7. Run the Playwright CLI against the local production or development build. Expected: Page Style opens from the Writer command surface; applying paper size, orientation, and margins changes the page geometry; horizontal and vertical ruler drags change page margins and paragraph indents; Cancel is non-mutating; undo and redo restore changes.
8. Inspect an exported ODT and re-import it. Expected: page width, height, orientation, four margins, and paragraph indents survive import-export-import and are represented by ODF page-layout/master-page attributes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
