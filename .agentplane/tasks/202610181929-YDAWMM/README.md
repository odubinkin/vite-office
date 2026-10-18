---
id: "202610181929-YDAWMM"
title: "Correct shared office menu and Calc grid accessibility semantics"
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
  updated_at: "2026-10-18T19:29:30.556Z"
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
    body: "Start: Repair shared menu/title and Calc grid header accessibility semantics exposed by full browser regression;preserve actual commands and styling and migrate related test roles without weakened gates."
events:
  -
    type: "status"
    at: "2026-10-18T19:29:33.147Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Repair shared menu/title and Calc grid header accessibility semantics exposed by full browser regression;preserve actual commands and styling and migrate related test roles without weakened gates."
doc_version: 3
doc_updated_at: "2026-10-18T19:29:33.147Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network."
sections:
  Summary: |-
    Correct shared office menu and Calc grid accessibility semantics

    Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.
  Scope: |-
    - In scope: Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.
    - Out of scope: unrelated refactors not required for "Correct shared office menu and Calc grid accessibility semantics".
  Plan: "Repair actual accessibility defects exposed by task10 axe checks using proper shared semantics,not audit exclusions or Calc-only forks. Use menuitem roles for original shared top-menu buttons;add h1 around shared document title;wrap Calc selection header buttons in rowheader/columnheader elements with correct corner name. Preserve DOM control behavior,keyboard focus,styling and real Sfx/controller ownership. Migrate only affected menu/header role queries and scoped browser selectors,retaining all behavioral assertions. Up to230non-task paths including related tests and provenance;no kernel,network,branch or UI-style expansion. Wait for currently live full application coverage71940/PID26563 before runtime mutation;then validate Calc100percent,shared menu/header100percent,affected Writer/Calc tests,all relevant E2E axe/geometry and standard gates. Task10 stays pending until this repair is verified."
  Verify Steps: "1. Actual Calc foundation/launcher axe analyses return zero violations and three Writer dialog geometry cases pass without exclusions. 2. AllCalc coverage100percent all4metrics and affected shared CommandMenuBar/OfficeWorkspaceHeader100percent plus affected Writer/common menu/header tests pass;native pointer/keyboard/header selection behavior remains real. 3. App/tools typecheck,build,touched style,module boundaries,docs,size,source-tree/provenance,scoped Calc/shared/Writer registry,doctor/routing pass. 4. Relevant existing browser menu/dialog behavior tests pass after semantic query migrations;no native assertions or thresholds are relaxed. Preserve task10 full16998case application run and cadence evidence;do not restart live jobs."
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

Correct shared office menu and Calc grid accessibility semantics

Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.

## Scope

- In scope: Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.
- Out of scope: unrelated refactors not required for "Correct shared office menu and Calc grid accessibility semantics".

## Plan

Repair actual accessibility defects exposed by task10 axe checks using proper shared semantics,not audit exclusions or Calc-only forks. Use menuitem roles for original shared top-menu buttons;add h1 around shared document title;wrap Calc selection header buttons in rowheader/columnheader elements with correct corner name. Preserve DOM control behavior,keyboard focus,styling and real Sfx/controller ownership. Migrate only affected menu/header role queries and scoped browser selectors,retaining all behavioral assertions. Up to230non-task paths including related tests and provenance;no kernel,network,branch or UI-style expansion. Wait for currently live full application coverage71940/PID26563 before runtime mutation;then validate Calc100percent,shared menu/header100percent,affected Writer/Calc tests,all relevant E2E axe/geometry and standard gates. Task10 stays pending until this repair is verified.

## Verify Steps

1. Actual Calc foundation/launcher axe analyses return zero violations and three Writer dialog geometry cases pass without exclusions. 2. AllCalc coverage100percent all4metrics and affected shared CommandMenuBar/OfficeWorkspaceHeader100percent plus affected Writer/common menu/header tests pass;native pointer/keyboard/header selection behavior remains real. 3. App/tools typecheck,build,touched style,module boundaries,docs,size,source-tree/provenance,scoped Calc/shared/Writer registry,doctor/routing pass. 4. Relevant existing browser menu/dialog behavior tests pass after semantic query migrations;no native assertions or thresholds are relaxed. Preserve task10 full16998case application run and cadence evidence;do not restart live jobs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
