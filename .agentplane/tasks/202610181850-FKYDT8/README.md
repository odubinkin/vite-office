---
id: "202610181850-FKYDT8"
title: "Connect Calc source sheet navigation and selection commands"
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
  updated_at: "2026-10-18T18:51:02.732Z"
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
    body: "Start: Connect pinned native sheet navigation and grouping operations through existing Calc view/mark owners and shared Sfx UI;verify allCalc100percent and production behavior."
events:
  -
    type: "status"
    at: "2026-10-18T18:51:03.499Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect pinned native sheet navigation and grouping operations through existing Calc view/mark owners and shared Sfx UI;verify allCalc100percent and production behavior."
doc_version: 3
doc_updated_at: "2026-10-18T18:51:03.499Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal task9/10. Add native-shaped ScTabView sheet-selection/navigation operations over existing ScViewData and ScMarkData;connect source next/previous/extend and select-all/deselect sheet Sfx slots to production shared menus and keyboard routing. Preserve pinned WrapNextPrevSheetTab=true default and SetTabNo grouping semantics,per-sheet cursor and draft commit guards. Reuse real owners,no fake document or unsupported hidden-sheet services. Up to35 non-task files including source tests and registry/provenance evidence. AllCalc100percent and related shared/Writer checks;full all-app regression at task10. Only Calc checkout/branch, no merges/network."
sections:
  Summary: |-
    Connect Calc source sheet navigation and selection commands

    Approved Calc UI goal task9/10. Add native-shaped ScTabView sheet-selection/navigation operations over existing ScViewData and ScMarkData;connect source next/previous/extend and select-all/deselect sheet Sfx slots to production shared menus and keyboard routing. Preserve pinned WrapNextPrevSheetTab=true default and SetTabNo grouping semantics,per-sheet cursor and draft commit guards. Reuse real owners,no fake document or unsupported hidden-sheet services. Up to35 non-task files including source tests and registry/provenance evidence. AllCalc100percent and related shared/Writer checks;full all-app regression at task10. Only Calc checkout/branch, no merges/network.
  Scope: |-
    - In scope: Approved Calc UI goal task9/10. Add native-shaped ScTabView sheet-selection/navigation operations over existing ScViewData and ScMarkData;connect source next/previous/extend and select-all/deselect sheet Sfx slots to production shared menus and keyboard routing. Preserve pinned WrapNextPrevSheetTab=true default and SetTabNo grouping semantics,per-sheet cursor and draft commit guards. Reuse real owners,no fake document or unsupported hidden-sheet services. Up to35 non-task files including source tests and registry/provenance evidence. AllCalc100percent and related shared/Writer checks;full all-app regression at task10. Only Calc checkout/branch, no merges/network.
    - Out of scope: unrelated refactors not required for "Connect Calc source sheet navigation and selection commands".
  Plan: "Implement pinned ScTabView SelectNextTab,SetTabNo,SelectAllTables and DeselectAllTables for the existing all-visible document slice,with wrap default true and original grouping behavior. Use existing ScViewData per-tab cursor and ScMarkData;controller remains platform input/publication adapter. Register original next/previous/extend/table-selection numeric slots and request/state contracts in Calc SDI;route document Ctrl+PageUp/PageDown variants and existing tab arrow navigation through shared Sfx dispatch. Test real menus,wrap boundaries,group collapse,preserved cursors,draft commit/rejection,history/dirty-state independence and source identities. Add bounded truthful provenance/capability records. Verify allCalc100percent,related menu/toolbar tests,app/tools typecheck,build,touched style,source/module/registry gates,doctor/routing and actual browser interactions. Up to35non-task paths;task9/10;full suite at10."
  Verify Steps: "1. npm run test:coverage:calc passes all Calc tests with100percent statements,branches,functions,lines;source-backed sheet navigation/selection tests cover true wrap default,group rules,per-tab cursor,commit/rejected drafts,history and dirty-state independence. 2. Related shared menu/Writer menu/toolbar tests and resource freshness checks pass. 3. Application/tools typecheck,production build,touched style,module boundaries,docs,file-size,source-tree/provenance,scoped Calc/shared inventory,doctor and routing pass. 4. Production browser executes real Sheet Navigate and Edit Select sheet operations and keyboard variants,updates actual active/selected tabs,without application errors. Full all-app regression at next task10 under user cadence."
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

Connect Calc source sheet navigation and selection commands

Approved Calc UI goal task9/10. Add native-shaped ScTabView sheet-selection/navigation operations over existing ScViewData and ScMarkData;connect source next/previous/extend and select-all/deselect sheet Sfx slots to production shared menus and keyboard routing. Preserve pinned WrapNextPrevSheetTab=true default and SetTabNo grouping semantics,per-sheet cursor and draft commit guards. Reuse real owners,no fake document or unsupported hidden-sheet services. Up to35 non-task files including source tests and registry/provenance evidence. AllCalc100percent and related shared/Writer checks;full all-app regression at task10. Only Calc checkout/branch, no merges/network.

## Scope

- In scope: Approved Calc UI goal task9/10. Add native-shaped ScTabView sheet-selection/navigation operations over existing ScViewData and ScMarkData;connect source next/previous/extend and select-all/deselect sheet Sfx slots to production shared menus and keyboard routing. Preserve pinned WrapNextPrevSheetTab=true default and SetTabNo grouping semantics,per-sheet cursor and draft commit guards. Reuse real owners,no fake document or unsupported hidden-sheet services. Up to35 non-task files including source tests and registry/provenance evidence. AllCalc100percent and related shared/Writer checks;full all-app regression at task10. Only Calc checkout/branch, no merges/network.
- Out of scope: unrelated refactors not required for "Connect Calc source sheet navigation and selection commands".

## Plan

Implement pinned ScTabView SelectNextTab,SetTabNo,SelectAllTables and DeselectAllTables for the existing all-visible document slice,with wrap default true and original grouping behavior. Use existing ScViewData per-tab cursor and ScMarkData;controller remains platform input/publication adapter. Register original next/previous/extend/table-selection numeric slots and request/state contracts in Calc SDI;route document Ctrl+PageUp/PageDown variants and existing tab arrow navigation through shared Sfx dispatch. Test real menus,wrap boundaries,group collapse,preserved cursors,draft commit/rejection,history/dirty-state independence and source identities. Add bounded truthful provenance/capability records. Verify allCalc100percent,related menu/toolbar tests,app/tools typecheck,build,touched style,source/module/registry gates,doctor/routing and actual browser interactions. Up to35non-task paths;task9/10;full suite at10.

## Verify Steps

1. npm run test:coverage:calc passes all Calc tests with100percent statements,branches,functions,lines;source-backed sheet navigation/selection tests cover true wrap default,group rules,per-tab cursor,commit/rejected drafts,history and dirty-state independence. 2. Related shared menu/Writer menu/toolbar tests and resource freshness checks pass. 3. Application/tools typecheck,production build,touched style,module boundaries,docs,file-size,source-tree/provenance,scoped Calc/shared inventory,doctor and routing pass. 4. Production browser executes real Sheet Navigate and Edit Select sheet operations and keyboard variants,updates actual active/selected tabs,without application errors. Full all-app regression at next task10 under user cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
