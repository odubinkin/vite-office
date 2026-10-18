---
id: "202610181808-2BTWEE"
title: "Share file dialogs and wire Calc file menu workflows"
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
  updated_at: "2026-10-18T18:08:53.530Z"
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
    body: "Start: Share actual Writer file-dialog components and connect Calc ODS File commands through canonical shell/primary IO and shared menus;verify both suites and production browser."
events:
  -
    type: "status"
    at: "2026-10-18T18:08:54.347Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Share actual Writer file-dialog components and connect Calc ODS File commands through canonical shell/primary IO and shared menus;verify both suites and production browser."
doc_version: 3
doc_updated_at: "2026-10-18T18:08:54.347Z"
doc_updated_by: "CODER"
description: "Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts."
sections:
  Summary: |-
    Share file dialogs and wire Calc file menu workflows

    Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.
  Scope: |-
    - In scope: Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.
    - Out of scope: unrelated refactors not required for "Share file dialogs and wire Calc file menu workflows".
  Plan: "Extract common BrowserFileDialog,DialogHeader,NameCollisionPanel and observable file-dialog controller into framework/browser;Writer adapters keep ODT/TXT semantics,modal markers and existing DOM behavior. Shared dialog receives suite IO callbacks and format/download resources;no suite model imports. Share modal CSS with permanent Writer aliases. Compose Calc ODS adapter and session workflow Sfx slots for original Open,SaveAs,Export commands;use shared CommandMenuBar/CommandButton in Calc File/Edit menus and standard toolbar. Commit input before file operations;flush autosave before replacement/copy;read actual ODS candidates and persist imported identity;downloads use shared export port and actual shell Export state without changing primary medium or dirty/save position. Tests cover browser/computer tabs,collision rename/overwrite/cancel,errors,focus,download bytes and actual menu-to-Sfx ownership;related Writer tests remain green. Up to60non-task files including source/provenance/capability metadata. Full menu-resource/chrome breadth follows approved task8/9;this is task7/10."
  Verify Steps: "1. All Calc test:coverage:calc passes100% four metrics including new file workflows and mounted production menus/dialogs. 2. Related Writer FileDialog,current-dialog-baseline,title-collision,Desktop,module and file workflow tests;targeted100% shared extracted dialog/controller/header/collision coverage using these relevant suites. 3. Application typecheck/build,touched lint/format,dependencies/docs/file-size/source-tree/provenance and Calc/shared/Writer scoped registry gates. 4. Production browser File menu open/save-as/export dialogs exercise real primary ODS documents;actual integration tests cover import/overwrite/download and primary identity/dirty-state preservation,failure retention and input/flush ordering. No full all-app run until task10 under user cadence. Doctor/routing checks pass."
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

Share file dialogs and wire Calc file menu workflows

Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.

## Scope

- In scope: Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.
- Out of scope: unrelated refactors not required for "Share file dialogs and wire Calc file menu workflows".

## Plan

Extract common BrowserFileDialog,DialogHeader,NameCollisionPanel and observable file-dialog controller into framework/browser;Writer adapters keep ODT/TXT semantics,modal markers and existing DOM behavior. Shared dialog receives suite IO callbacks and format/download resources;no suite model imports. Share modal CSS with permanent Writer aliases. Compose Calc ODS adapter and session workflow Sfx slots for original Open,SaveAs,Export commands;use shared CommandMenuBar/CommandButton in Calc File/Edit menus and standard toolbar. Commit input before file operations;flush autosave before replacement/copy;read actual ODS candidates and persist imported identity;downloads use shared export port and actual shell Export state without changing primary medium or dirty/save position. Tests cover browser/computer tabs,collision rename/overwrite/cancel,errors,focus,download bytes and actual menu-to-Sfx ownership;related Writer tests remain green. Up to60non-task files including source/provenance/capability metadata. Full menu-resource/chrome breadth follows approved task8/9;this is task7/10.

## Verify Steps

1. All Calc test:coverage:calc passes100% four metrics including new file workflows and mounted production menus/dialogs. 2. Related Writer FileDialog,current-dialog-baseline,title-collision,Desktop,module and file workflow tests;targeted100% shared extracted dialog/controller/header/collision coverage using these relevant suites. 3. Application typecheck/build,touched lint/format,dependencies/docs/file-size/source-tree/provenance and Calc/shared/Writer scoped registry gates. 4. Production browser File menu open/save-as/export dialogs exercise real primary ODS documents;actual integration tests cover import/overwrite/download and primary identity/dirty-state preservation,failure retention and input/flush ordering. No full all-app run until task10 under user cadence. Doctor/routing checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
