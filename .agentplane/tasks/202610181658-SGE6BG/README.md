---
id: "202610181658-SGE6BG"
title: "Implement Calc grid input-line and sheet-tab browser presenters"
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
  updated_at: "2026-10-18T16:59:20.393Z"
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
    body: "Start: Build controlled Calc grid,input-line and sheet-tab React presenters against real ScViewData, forwarding commands to their owning controller without a second cell or edit model."
events:
  -
    type: "status"
    at: "2026-10-18T16:59:43.411Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Build controlled Calc grid,input-line and sheet-tab React presenters against real ScViewData, forwarding commands to their owning controller without a second cell or edit model."
doc_version: 3
doc_updated_at: "2026-10-18T16:59:43.411Z"
doc_updated_by: "CODER"
description: "Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle."
sections:
  Summary: |-
    Implement Calc grid input-line and sheet-tab browser presenters

    Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.
  Scope: |-
    - In scope: Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.
    - Out of scope: unrelated refactors not required for "Implement Calc grid input-line and sheet-tab browser presenters".
  Plan: "Implement three controlled production React presenters under sc/browser/presentation: ScGridWindow,ScInputWindow,ScTabControl, with colocated integration tests. Grid uses supplied display projection and actual ScViewData cursor/ScMarkData, bounded virtual viewport, logical ARIA indices,headers,pointer/keyboard intents and inline controlled edit. Input line preserves native position/function/sum/equals versus accept/cancel composition. Tabs preserve sheet names/current/selected state and forward add/select intents. No local cell/selection/draft model. Controllers own navigation,entry,formatting and file operations; next task connects those existing core operations and production composition. Register6runtime/provenance records and1capability; no new kernel dependencies. Scope11non-task files. Approved UI plan/task4of10."
  Verify Steps: "1. npm run test:coverage:calc with100percent on all Calc sources. Test actual ScDocument/ScViewData selections and bounded viewport projection,all input events,keyboard intents,editing,IME pass-through,header intents,sheet control selection,disabled controls and native input mode switching. 2. npm run typecheck --workspace @vite-office/office, touched ESLint/Prettier. 3. check:dependencies,check:docs,check:file-size,check:source-tree,check:source-provenance,inventory:parity:calc. 4. Review against pinned gridwin.cxx,inputwin.cxx,tabcont.cxx composition. Full regression deferred per approved10task cadence; task4/10. Production registration/file workflows remain explicit following work,not claimed by presenter completion."
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

Implement Calc grid input-line and sheet-tab browser presenters

Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.

## Scope

- In scope: Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.
- Out of scope: unrelated refactors not required for "Implement Calc grid input-line and sheet-tab browser presenters".

## Plan

Implement three controlled production React presenters under sc/browser/presentation: ScGridWindow,ScInputWindow,ScTabControl, with colocated integration tests. Grid uses supplied display projection and actual ScViewData cursor/ScMarkData, bounded virtual viewport, logical ARIA indices,headers,pointer/keyboard intents and inline controlled edit. Input line preserves native position/function/sum/equals versus accept/cancel composition. Tabs preserve sheet names/current/selected state and forward add/select intents. No local cell/selection/draft model. Controllers own navigation,entry,formatting and file operations; next task connects those existing core operations and production composition. Register6runtime/provenance records and1capability; no new kernel dependencies. Scope11non-task files. Approved UI plan/task4of10.

## Verify Steps

1. npm run test:coverage:calc with100percent on all Calc sources. Test actual ScDocument/ScViewData selections and bounded viewport projection,all input events,keyboard intents,editing,IME pass-through,header intents,sheet control selection,disabled controls and native input mode switching. 2. npm run typecheck --workspace @vite-office/office, touched ESLint/Prettier. 3. check:dependencies,check:docs,check:file-size,check:source-tree,check:source-provenance,inventory:parity:calc. 4. Review against pinned gridwin.cxx,inputwin.cxx,tabcont.cxx composition. Full regression deferred per approved10task cadence; task4/10. Production registration/file workflows remain explicit following work,not claimed by presenter completion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
