---
id: "202609141429-H8TF7J"
title: "Implement Workstream 4 command and UI architecture"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T14:30:22.990Z"
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
    body: "Start: implement approved Workstream 4 command descriptors, declarative UI resources, corrected browser presenter identities, and accessible menu semantics against the pinned LibreOffice baseline."
events:
  -
    type: "status"
    at: "2026-09-14T14:30:34.439Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Workstream 4 command descriptors, declarative UI resources, corrected browser presenter identities, and accessible menu semantics against the pinned LibreOffice baseline."
doc_version: 3
doc_updated_at: "2026-09-14T14:30:34.439Z"
doc_updated_by: "CODER"
description: "Implement P4.1-P4.4 from docs/program/vite-office-upstream-parity-plan.md using pinned LibreOffice 26.8.0.2 sources, preserving upstream structure and semantics where browser constraints allow; do not retain old persisted document compatibility if storage model changes."
sections:
  Summary: "Align Writer command and browser UI architecture with Workstream 4 (P4.1-P4.4) and the pinned LibreOffice 26.8.0.2 baseline."
  Scope: "Extend presentation-neutral command descriptors and shared command state; replace manual WriterWorkbench command maps and callback chains; keep sw/uiconfig as declarative upstream-derived placement resources; move React presenters and browser adapters out of false upstream ownership paths; implement a reusable accessible menu state machine; update provenance/runtime inventories and focused documentation. No feature expansion outside Workstream 4. If persisted document shape changes unexpectedly, remove legacy compatibility instead of preserving old formats."
  Plan: "1. Inventory current command definitions, UI placements, browser adapters, tests, and pinned LibreOffice XML/symbol ownership. 2. Add validated presentation metadata, typed command state including asynchronous pending/error, argument semantics, shortcuts, and shell ownership to the shared descriptor contract. 3. Rebuild Writer menu/toolbar placement as TS declarative resources matching the supported subset and upstream order; add generic browser presenters driven only by descriptors, placements, QueryState, and Execute. 4. Remove manual command mapping/callback props from WriterWorkbench and converge menu, toolbar, and shortcuts on identical dispatcher state. 5. Relocate falsely named React/browser modules (mainwn, inputwin, WriterInspectorTextPanel, textsh hook, wrtsh/select DOM conversion) into explicit browser presentation/adapter paths and update imports, provenance, and inventories. 6. Implement and test reusable menu interaction state machine: roving focus, top-level and popup navigation, Home/End, Enter/Space, Escape/focus restoration, outside click, submenu focus, typeahead, and disabled skipping. 7. Run focused and full verification, record evidence, and finish the direct-mode task."
  Verify Steps: "1. npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/framework/source/dispatch/dispatchprovider.test.ts apps/office/src/sw/source/uibase/uiview/view-session.test.tsx apps/office/src/sw/browser/presentation (or the final equivalent focused test paths). 2. npm run test:e2e -- --grep \"Writer menu keyboard|Writer command surfaces\" (use final exact Workstream 4 test titles). 3. npm run verify. 4. ap doctor. 5. node .agentplane/policy/check-routing.mjs. 6. git status --short --untracked-files=all; confirm only task-scoped files and Agentplane artifacts remain."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Workstream 4 implementation commit and its task close commit. No data migration rollback is expected because this workstream must not change persisted document semantics."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer command and browser UI architecture with Workstream 4 (P4.1-P4.4) and the pinned LibreOffice 26.8.0.2 baseline.

## Scope

Extend presentation-neutral command descriptors and shared command state; replace manual WriterWorkbench command maps and callback chains; keep sw/uiconfig as declarative upstream-derived placement resources; move React presenters and browser adapters out of false upstream ownership paths; implement a reusable accessible menu state machine; update provenance/runtime inventories and focused documentation. No feature expansion outside Workstream 4. If persisted document shape changes unexpectedly, remove legacy compatibility instead of preserving old formats.

## Plan

1. Inventory current command definitions, UI placements, browser adapters, tests, and pinned LibreOffice XML/symbol ownership. 2. Add validated presentation metadata, typed command state including asynchronous pending/error, argument semantics, shortcuts, and shell ownership to the shared descriptor contract. 3. Rebuild Writer menu/toolbar placement as TS declarative resources matching the supported subset and upstream order; add generic browser presenters driven only by descriptors, placements, QueryState, and Execute. 4. Remove manual command mapping/callback props from WriterWorkbench and converge menu, toolbar, and shortcuts on identical dispatcher state. 5. Relocate falsely named React/browser modules (mainwn, inputwin, WriterInspectorTextPanel, textsh hook, wrtsh/select DOM conversion) into explicit browser presentation/adapter paths and update imports, provenance, and inventories. 6. Implement and test reusable menu interaction state machine: roving focus, top-level and popup navigation, Home/End, Enter/Space, Escape/focus restoration, outside click, submenu focus, typeahead, and disabled skipping. 7. Run focused and full verification, record evidence, and finish the direct-mode task.

## Verify Steps

1. npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/framework/source/dispatch/dispatchprovider.test.ts apps/office/src/sw/source/uibase/uiview/view-session.test.tsx apps/office/src/sw/browser/presentation (or the final equivalent focused test paths). 2. npm run test:e2e -- --grep "Writer menu keyboard|Writer command surfaces" (use final exact Workstream 4 test titles). 3. npm run verify. 4. ap doctor. 5. node .agentplane/policy/check-routing.mjs. 6. git status --short --untracked-files=all; confirm only task-scoped files and Agentplane artifacts remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Workstream 4 implementation commit and its task close commit. No data migration rollback is expected because this workstream must not change persisted document semantics.

## Findings
