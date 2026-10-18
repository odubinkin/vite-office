---
id: "202610181859-1J8SQQ"
title: "Implement source Calc Go to Sheet dialog and cadence regression"
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
  updated_at: "2026-10-18T19:00:00.605Z"
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
    body: "Start: Implement pinned Go to Sheet command/dialog over actual Calc owners and shared Writer/Sfx dialog infrastructure,then verify Calc100percent and full task10 regression."
events:
  -
    type: "status"
    at: "2026-10-18T19:00:01.387Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement pinned Go to Sheet command/dialog over actual Calc owners and shared Writer/Sfx dialog infrastructure,then verify Calc100percent and full task10 regression."
doc_version: 3
doc_updated_at: "2026-10-18T19:00:01.387Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal task10/10. Connect native JumpToTable/SID_CURRENTTAB26042 and Nr one-based argument to actual sheet view state. Present original Go to Sheet entry/list/OK/Cancel/Help composition,case-sensitive substring filtering,initial active selection,cleared selection after mask changes,double-click acceptance and cancel semantics using shared Writer dialog header/styles and existing SfxDialogController. No substitute workbook/selection state or hidden-sheet services. Up to35non-task files including tests and provenance. AllCalc100percent,related UI/source checks,production browser verification and one full test:all cadence run. Only Calc checkout/branch,no merges/network."
sections:
  Summary: |-
    Implement source Calc Go to Sheet dialog and cadence regression

    Approved Calc UI goal task10/10. Connect native JumpToTable/SID_CURRENTTAB26042 and Nr one-based argument to actual sheet view state. Present original Go to Sheet entry/list/OK/Cancel/Help composition,case-sensitive substring filtering,initial active selection,cleared selection after mask changes,double-click acceptance and cancel semantics using shared Writer dialog header/styles and existing SfxDialogController. No substitute workbook/selection state or hidden-sheet services. Up to35non-task files including tests and provenance. AllCalc100percent,related UI/source checks,production browser verification and one full test:all cadence run. Only Calc checkout/branch,no merges/network.
  Scope: |-
    - In scope: Approved Calc UI goal task10/10. Connect native JumpToTable/SID_CURRENTTAB26042 and Nr one-based argument to actual sheet view state. Present original Go to Sheet entry/list/OK/Cancel/Help composition,case-sensitive substring filtering,initial active selection,cleared selection after mask changes,double-click acceptance and cancel semantics using shared Writer dialog header/styles and existing SfxDialogController. No substitute workbook/selection state or hidden-sheet services. Up to35non-task files including tests and provenance. AllCalc100percent,related UI/source checks,production browser verification and one full test:all cadence run. Only Calc checkout/branch,no merges/network.
    - Out of scope: unrelated refactors not required for "Implement source Calc Go to Sheet dialog and cadence regression".
  Plan: "Implement CalcSheetWorkflows as the browser asynchronous adapter for pinned ExecGoToTab,using shared SfxDialogController and original26042 slot/Nr1-based contract. Read real document names in order and retain native initial-active,case-sensitive substring filtering and selection-clear-on-mask-change rules in ScGoToTabDlg React presenter. Reuse shared DialogHeader and office-dialog styles;retain OK/Cancel/Help composition with help unavailable until its native service exists. Integrate one session-owned workflow with frame and workbench modal inert/focus rules;cancel pending request during session closure. Cover real requests,parameters,cancel/empty acceptance,filtering,doubleclick,pending input and cursor/history independence. Verify allCalc100percent,related Writer/shared dialog/resource/source tests and production browser;run full npm run test:all once for task10 cadence,plus normal style/type/build/source gates. Up to35non-task paths;no network,merges or other checkouts."
  Verify Steps: "1. AllCalc test:coverage:calc passes100percent all4metrics,including real GoToSheet slot,Nr one-based args,initial/filter/cleared-selection/doubleclick/cancel/empty rules,pending input and source state preservation. 2. Related shared SfxDialogController/Writer dialog and source resource tests pass. 3. Typecheck/build,touched style,module/docs/size/source/provenance,scoped Calc/shared inventory,doctor/routing pass. 4. Production browser opens Go to Sheet from shared menu,filters/selects/accepts/cancels against actual active sheets without exceptions. 5. npm run test:all runs full application coverage,inventory coverage,tooling and E2E once for task10 cadence;resolve in-scope regressions and record evidence without lowering gates."
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

Implement source Calc Go to Sheet dialog and cadence regression

Approved Calc UI goal task10/10. Connect native JumpToTable/SID_CURRENTTAB26042 and Nr one-based argument to actual sheet view state. Present original Go to Sheet entry/list/OK/Cancel/Help composition,case-sensitive substring filtering,initial active selection,cleared selection after mask changes,double-click acceptance and cancel semantics using shared Writer dialog header/styles and existing SfxDialogController. No substitute workbook/selection state or hidden-sheet services. Up to35non-task files including tests and provenance. AllCalc100percent,related UI/source checks,production browser verification and one full test:all cadence run. Only Calc checkout/branch,no merges/network.

## Scope

- In scope: Approved Calc UI goal task10/10. Connect native JumpToTable/SID_CURRENTTAB26042 and Nr one-based argument to actual sheet view state. Present original Go to Sheet entry/list/OK/Cancel/Help composition,case-sensitive substring filtering,initial active selection,cleared selection after mask changes,double-click acceptance and cancel semantics using shared Writer dialog header/styles and existing SfxDialogController. No substitute workbook/selection state or hidden-sheet services. Up to35non-task files including tests and provenance. AllCalc100percent,related UI/source checks,production browser verification and one full test:all cadence run. Only Calc checkout/branch,no merges/network.
- Out of scope: unrelated refactors not required for "Implement source Calc Go to Sheet dialog and cadence regression".

## Plan

Implement CalcSheetWorkflows as the browser asynchronous adapter for pinned ExecGoToTab,using shared SfxDialogController and original26042 slot/Nr1-based contract. Read real document names in order and retain native initial-active,case-sensitive substring filtering and selection-clear-on-mask-change rules in ScGoToTabDlg React presenter. Reuse shared DialogHeader and office-dialog styles;retain OK/Cancel/Help composition with help unavailable until its native service exists. Integrate one session-owned workflow with frame and workbench modal inert/focus rules;cancel pending request during session closure. Cover real requests,parameters,cancel/empty acceptance,filtering,doubleclick,pending input and cursor/history independence. Verify allCalc100percent,related Writer/shared dialog/resource/source tests and production browser;run full npm run test:all once for task10 cadence,plus normal style/type/build/source gates. Up to35non-task paths;no network,merges or other checkouts.

## Verify Steps

1. AllCalc test:coverage:calc passes100percent all4metrics,including real GoToSheet slot,Nr one-based args,initial/filter/cleared-selection/doubleclick/cancel/empty rules,pending input and source state preservation. 2. Related shared SfxDialogController/Writer dialog and source resource tests pass. 3. Typecheck/build,touched style,module/docs/size/source/provenance,scoped Calc/shared inventory,doctor/routing pass. 4. Production browser opens Go to Sheet from shared menu,filters/selects/accepts/cancels against actual active sheets without exceptions. 5. npm run test:all runs full application coverage,inventory coverage,tooling and E2E once for task10 cadence;resolve in-scope regressions and record evidence without lowering gates.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
