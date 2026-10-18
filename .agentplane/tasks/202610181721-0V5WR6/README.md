---
id: "202610181721-0V5WR6"
title: "Connect editable Calc workspace to production application"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T17:21:52.202Z"
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
    body: "Start: Connect production Calc route to actual scalar document/edit/view owners,shared Sfx command/history infrastructure and existing controlled presenters. Complete mounted behavior and Calc coverage before closure."
events:
  -
    type: "status"
    at: "2026-10-18T17:22:07.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect production Calc route to actual scalar document/edit/view owners,shared Sfx command/history infrastructure and existing controlled presenters. Complete mounted behavior and Calc coverage before closure."
doc_version: 3
doc_updated_at: "2026-10-18T17:22:07.771Z"
doc_updated_by: "CODER"
description: "Approved UI plan task5/10. Register lazy Calc module in /calc and connect the existing controlled grid,input line,sheet tabs to real ScDocument/ScViewData through a document shell,source-shaped input/selection commands and browser view controller. Use shared SfxObjectShell,SfxUndoManager,SfxViewFrame/SfxInterface dispatcher and Writer control styles. Support current scalar text/numeric/native-A1 formula edits,cancel/commit,navigation,name-box selection,sheet switching/append,undo/redo and bounded virtual scrolling. Preserve formula dependency updates and one model;no synthetic workbook grid,formatter facade,disabled-command no-ops or kernel expansion. Next tasks finish shared menus/file workflows/status/sidebar and broader behavior. Bound to8runtime modules,main/module registration adjustments,their tests and required scoped runtime/provenance/capability/application records (up to35non-task files). No merges/network or other checkouts."
sections:
  Summary: |-
    Connect editable Calc workspace to production application

    Approved UI plan task5/10. Register lazy Calc module in /calc and connect the existing controlled grid,input line,sheet tabs to real ScDocument/ScViewData through a document shell,source-shaped input/selection commands and browser view controller. Use shared SfxObjectShell,SfxUndoManager,SfxViewFrame/SfxInterface dispatcher and Writer control styles. Support current scalar text/numeric/native-A1 formula edits,cancel/commit,navigation,name-box selection,sheet switching/append,undo/redo and bounded virtual scrolling. Preserve formula dependency updates and one model;no synthetic workbook grid,formatter facade,disabled-command no-ops or kernel expansion. Next tasks finish shared menus/file workflows/status/sidebar and broader behavior. Bound to8runtime modules,main/module registration adjustments,their tests and required scoped runtime/provenance/capability/application records (up to35non-task files). No merges/network or other checkouts.
  Scope: |-
    - In scope: Approved UI plan task5/10. Register lazy Calc module in /calc and connect the existing controlled grid,input line,sheet tabs to real ScDocument/ScViewData through a document shell,source-shaped input/selection commands and browser view controller. Use shared SfxObjectShell,SfxUndoManager,SfxViewFrame/SfxInterface dispatcher and Writer control styles. Support current scalar text/numeric/native-A1 formula edits,cancel/commit,navigation,name-box selection,sheet switching/append,undo/redo and bounded virtual scrolling. Preserve formula dependency updates and one model;no synthetic workbook grid,formatter facade,disabled-command no-ops or kernel expansion. Next tasks finish shared menus/file workflows/status/sidebar and broader behavior. Bound to8runtime modules,main/module registration adjustments,their tests and required scoped runtime/provenance/capability/application records (up to35non-task files). No merges/network or other checkouts.
    - Out of scope: unrelated refactors not required for "Connect editable Calc workspace to production application".
  Plan: "Connect production Calc module and implemented presenters to one canonical document/view. Add minimal real ScDocShell over existing SfxObjectShell/SfxUndoManager;browser scalar edit/cell-presentation adapter;browser view/input controller retaining only transient state;native SDI slot registration for EnterString/InputLineEnter/Undo/Redo;CalcWorkbench and lazy module. Register Calc in main/modulemanager and update affected launcher tests. Use actual shared Sfx dispatch,binding,toolbar and Writer styles. No copies of cell grids or fake native services. Preserve basic plain scalar/arithmetic/local-reference current-core behavior;full formatted-number recognition and missing formatting services are explicit unsupported scope,not a complete ParseString claim. Undo payloads are bounded typed scalar/formula representations using shared action history. Viewport maps logical rows to browser physical scroll track. Tests prove mounted edit,recalc,cancel,navigation,sheets,history,failures,cleanup and allCalc100percent.35non-task-file budget,task5/10;next approved leaves complete common menu/file workflows,other chrome and broader browser verification."
  Verify Steps: "1. npm run test:coverage:calc: allCalc100percent including new production controller/UI modules. 2. npm run typecheck --workspace @vite-office/office and build. 3. Focused shared modulemanager/Desktop/bootstrap and command/history tests affected by registration. 4. Touched ESLint/Prettier;dependency,docs,file-size,source-tree/provenance and scoped parity gates. 5. Mounted real-owner tests for scalar/formula editing and dependency updates,Undo/Redo,no-op/cancel,caret/IME control,name-box/local navigation,sheets,large logical viewport and closure. Browser /calc must render production factory with real model;full menus/file workflows remain next task. Full all-app regression deferred toUI task10."
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

Connect editable Calc workspace to production application

Approved UI plan task5/10. Register lazy Calc module in /calc and connect the existing controlled grid,input line,sheet tabs to real ScDocument/ScViewData through a document shell,source-shaped input/selection commands and browser view controller. Use shared SfxObjectShell,SfxUndoManager,SfxViewFrame/SfxInterface dispatcher and Writer control styles. Support current scalar text/numeric/native-A1 formula edits,cancel/commit,navigation,name-box selection,sheet switching/append,undo/redo and bounded virtual scrolling. Preserve formula dependency updates and one model;no synthetic workbook grid,formatter facade,disabled-command no-ops or kernel expansion. Next tasks finish shared menus/file workflows/status/sidebar and broader behavior. Bound to8runtime modules,main/module registration adjustments,their tests and required scoped runtime/provenance/capability/application records (up to35non-task files). No merges/network or other checkouts.

## Scope

- In scope: Approved UI plan task5/10. Register lazy Calc module in /calc and connect the existing controlled grid,input line,sheet tabs to real ScDocument/ScViewData through a document shell,source-shaped input/selection commands and browser view controller. Use shared SfxObjectShell,SfxUndoManager,SfxViewFrame/SfxInterface dispatcher and Writer control styles. Support current scalar text/numeric/native-A1 formula edits,cancel/commit,navigation,name-box selection,sheet switching/append,undo/redo and bounded virtual scrolling. Preserve formula dependency updates and one model;no synthetic workbook grid,formatter facade,disabled-command no-ops or kernel expansion. Next tasks finish shared menus/file workflows/status/sidebar and broader behavior. Bound to8runtime modules,main/module registration adjustments,their tests and required scoped runtime/provenance/capability/application records (up to35non-task files). No merges/network or other checkouts.
- Out of scope: unrelated refactors not required for "Connect editable Calc workspace to production application".

## Plan

Connect production Calc module and implemented presenters to one canonical document/view. Add minimal real ScDocShell over existing SfxObjectShell/SfxUndoManager;browser scalar edit/cell-presentation adapter;browser view/input controller retaining only transient state;native SDI slot registration for EnterString/InputLineEnter/Undo/Redo;CalcWorkbench and lazy module. Register Calc in main/modulemanager and update affected launcher tests. Use actual shared Sfx dispatch,binding,toolbar and Writer styles. No copies of cell grids or fake native services. Preserve basic plain scalar/arithmetic/local-reference current-core behavior;full formatted-number recognition and missing formatting services are explicit unsupported scope,not a complete ParseString claim. Undo payloads are bounded typed scalar/formula representations using shared action history. Viewport maps logical rows to browser physical scroll track. Tests prove mounted edit,recalc,cancel,navigation,sheets,history,failures,cleanup and allCalc100percent.35non-task-file budget,task5/10;next approved leaves complete common menu/file workflows,other chrome and broader browser verification.

## Verify Steps

1. npm run test:coverage:calc: allCalc100percent including new production controller/UI modules. 2. npm run typecheck --workspace @vite-office/office and build. 3. Focused shared modulemanager/Desktop/bootstrap and command/history tests affected by registration. 4. Touched ESLint/Prettier;dependency,docs,file-size,source-tree/provenance and scoped parity gates. 5. Mounted real-owner tests for scalar/formula editing and dependency updates,Undo/Redo,no-op/cancel,caret/IME control,name-box/local navigation,sheets,large logical viewport and closure. Browser /calc must render production factory with real model;full menus/file workflows remain next task. Full all-app regression deferred toUI task10.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
