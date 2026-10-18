---
id: "202610181859-1J8SQQ"
title: "Implement source Calc Go to Sheet dialog and cadence regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-18T19:29:04.799Z"
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
  Findings: "Task10 implementation is committed as353896defafc;GoToSheet,source contracts,Calc271tests100percent and shared dialog16tests100percent pass. Initial full application run is terminal:16996passed2failed,only stale main.test Writer-only bootstrap expectation;repaired focused tests pass. Full inventory123tests100percent and tooling107tests pass. Initial browser run is terminal:369passed5failed;stale Calc placeholder expectations and old Writer-only shared-dialog selectors were repaired. Focused E2E geometry now passes all3viewports;foundation/launcher axe reveals actual preexisting Calc grid header roles,shared menubar trigger roles and missing document h1. These require a separate shared-presentation repair leaf and broad test role migration within the existing approved UI goal;do not weaken axe or complete task10 before repair evidence. Final-source application coverage is live in session71940/PID26563;do not restart it while live. Focused E2E session89316 is terminal2failed4passed. See regression-state.json and remaining-ui-audit.md. No goal completion is claimed."
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

Task10 implementation is committed as353896defafc;GoToSheet,source contracts,Calc271tests100percent and shared dialog16tests100percent pass. Initial full application run is terminal:16996passed2failed,only stale main.test Writer-only bootstrap expectation;repaired focused tests pass. Full inventory123tests100percent and tooling107tests pass. Initial browser run is terminal:369passed5failed;stale Calc placeholder expectations and old Writer-only shared-dialog selectors were repaired. Focused E2E geometry now passes all3viewports;foundation/launcher axe reveals actual preexisting Calc grid header roles,shared menubar trigger roles and missing document h1. These require a separate shared-presentation repair leaf and broad test role migration within the existing approved UI goal;do not weaken axe or complete task10 before repair evidence. Final-source application coverage is live in session71940/PID26563;do not restart it while live. Focused E2E session89316 is terminal2failed4passed. See regression-state.json and remaining-ui-audit.md. No goal completion is claimed.
