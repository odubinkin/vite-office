---
id: "202610181859-1J8SQQ"
title: "Implement source Calc Go to Sheet dialog and cadence regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
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
  state: "ok"
  updated_at: "2026-10-18T19:59:08.095Z"
  updated_by: "CODER"
  note: "GoToSheet source contract and actual browser behavior pass;Calc271tests100percent and shared dialog100percent. Scheduled regression stages complete after documented repairs:full app16998cases100percent,inventory123cases100percent,tooling107cases,and all374browser cases accounted for after completedYDAWMM semantic repair/focused query reruns. See verification-final.md;overall UI goal remains active."
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
  -
    type: "verify"
    at: "2026-10-18T19:59:08.095Z"
    author: "CODER"
    state: "ok"
    note: "GoToSheet source contract and actual browser behavior pass;Calc271tests100percent and shared dialog100percent. Scheduled regression stages complete after documented repairs:full app16998cases100percent,inventory123cases100percent,tooling107cases,and all374browser cases accounted for after completedYDAWMM semantic repair/focused query reruns. See verification-final.md;overall UI goal remains active."
doc_version: 3
doc_updated_at: "2026-10-18T19:59:08.156Z"
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
    ### 2026-10-18T19:59:08.095Z — VERIFY — ok

    By: CODER

    Note: GoToSheet source contract and actual browser behavior pass;Calc271tests100percent and shared dialog100percent. Scheduled regression stages complete after documented repairs:full app16998cases100percent,inventory123cases100percent,tooling107cases,and all374browser cases accounted for after completedYDAWMM semantic repair/focused query reruns. See verification-final.md;overall UI goal remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T19:59:06.827Z, excerpt_hash=sha256:4d468bb819dcf42748da489c48fe82dd542caa6da40844c2ec87a883d1583554

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181859-1J8SQQ/blueprint/resolved-snapshot.json
    - old_digest: 770e57b4b4cc207dba218ed42d193851560fde664339ae5696a38cbf5827e9d0
    - current_digest: 770e57b4b4cc207dba218ed42d193851560fde664339ae5696a38cbf5827e9d0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181859-1J8SQQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181859-1J8SQQ -m 🧩 1J8SQQ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run test:coverage:calc
    Result: pass
    Evidence: All271Calc cases/102files and100% four metrics after Go to Sheet implementation;post-accessibility repair remains271cases and100% (taskYDAWMM calc-coverage.log).
    Scope: Entire current Calc application,actual model/view/Sfx/file/sheet/dialog owners.

    Command: npm run test:coverage -- basedlgs.test WriterBookmarkDialog.test WriterFileDialog.test calc-goto-sheet.test --coverage.include=src/sfx2/source/dialog/basedlgs.ts --coverage.include=src/framework/browser/presentation/DialogHeader.tsx --coverage.reportsDirectory=coverage/calc-goto-dialogs
    Result: pass
    Evidence: 16cases/3files;100% touched shared dialog controller/header (shared-coverage.log).
    Scope: Reused Writer/shared async dialog infrastructure.

    Command: npx vitest run scripts/calc-sheet-command-source.test.ts; npm run check:calc-resources; npm run check:writer-resources
    Result: pass
    Evidence: Two source contract cases pass;native26042 UInt16 Nr one-based contract and exact source filtering/list/widget composition retained;Calc450commands/11menus/17explicit policies fresh;Writer generation unchanged.
    Scope: Pinned source contracts and deterministic shared resource tooling.

    Command: npm run typecheck; npm run build; touched style;check:dependencies;check:docs;check:file-size;check:source-tree;check:source-provenance;scoped Calc/shared registry;ap doctor;policy routing
    Result: pass
    Evidence: Task-local logs and final taskYDAWMM gate logs pass;844runtime modules mapped,zero scoped semantic violations. Existing chunk-size/shim advisories remain recorded.
    Scope: Task10 implementation and final shared semantic repair.

    Command: Production Chromium Go to Sheet menu/filter/selection/cancel and keyboard acceptance
    Result: pass
    Evidence: browser-review.json,browser-keyboard-review.json and final taskYDAWMM browser-calc-review.json;actual active sheet changes correctly,filter is case-sensitive,initial active selection and empty/cancel semantics retain native behavior. Console0errors/0warnings.
    Scope: Final real browser owner chain;no substitute workbook or selection state.

    Command: npm run test:all,with staged failure repair/revalidation
    Result: All required regression stages accounted for after repairs
    Evidence: Initial app run16996passed2failed only stale Writer-only bootstrap expectations. Final application retry:987files/16998cases pass;100% statements46421/46421,branches29881/29881,functions9298/9298,lines42216/42216 (full-app-final.log). Inventory123cases100% (full-inventory-final.log);tooling107cases/13files pass (full-tooling.log). Initial browser run369passed5stale UI expectations;updated expectations exposed real shared/Calc ARIA defects. Completed repair task202610181929-YDAWMM implementation cf90142089d1 fixes those defects without audit exclusions. Final6foundation/launcher/geometry cases pass;full repaired browser run372passed2remaining conditional root-role queries,then all3root-boundary cases pass after those test-only query repairs. All374original browser cases are accounted for;see taskYDAWMM verification.md,browser-regression.log,browser-boundary-final.log and axe-final.log.
    Scope: Scheduled task10 full application/inventory/tooling/browser regression. Post-baseline production changes were only the4presentation-semantic modules in YDAWMM;all affected UI graph cases,Calc100% and3renderers100% plus real browser axe/geometry were revalidated. No blanket full-suite replay is needed before the next cadence milestone.

    Findings: Task10 originally committed implementation353896defafc;source expectation fixes,full cadence evidence and completed semantic repair are descendant commits on calc. Go to Sheet preserves native26042/Nr1-based,typed Which lookup,initial/current sheet names,case-sensitive mask,selection clearing,double-click/list Enter acceptance,empty/cancel no-op and close cancellation. Shared Writer DialogHeader,styles and SfxDialogController are used. Help remains disabled because its native service is unported. Hidden/alternate sheets and broader formatting/input/context/clipboard services remain active goal work. No whole Calc UI/native parity completion is claimed. Current cadence includes the additional accessibility repair leaf11;next scheduled full run follows overall task20.
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
### 2026-10-18T19:59:08.095Z — VERIFY — ok

By: CODER

Note: GoToSheet source contract and actual browser behavior pass;Calc271tests100percent and shared dialog100percent. Scheduled regression stages complete after documented repairs:full app16998cases100percent,inventory123cases100percent,tooling107cases,and all374browser cases accounted for after completedYDAWMM semantic repair/focused query reruns. See verification-final.md;overall UI goal remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T19:59:06.827Z, excerpt_hash=sha256:4d468bb819dcf42748da489c48fe82dd542caa6da40844c2ec87a883d1583554

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181859-1J8SQQ/blueprint/resolved-snapshot.json
- old_digest: 770e57b4b4cc207dba218ed42d193851560fde664339ae5696a38cbf5827e9d0
- current_digest: 770e57b4b4cc207dba218ed42d193851560fde664339ae5696a38cbf5827e9d0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181859-1J8SQQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181859-1J8SQQ -m 🧩 1J8SQQ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run test:coverage:calc
Result: pass
Evidence: All271Calc cases/102files and100% four metrics after Go to Sheet implementation;post-accessibility repair remains271cases and100% (taskYDAWMM calc-coverage.log).
Scope: Entire current Calc application,actual model/view/Sfx/file/sheet/dialog owners.

Command: npm run test:coverage -- basedlgs.test WriterBookmarkDialog.test WriterFileDialog.test calc-goto-sheet.test --coverage.include=src/sfx2/source/dialog/basedlgs.ts --coverage.include=src/framework/browser/presentation/DialogHeader.tsx --coverage.reportsDirectory=coverage/calc-goto-dialogs
Result: pass
Evidence: 16cases/3files;100% touched shared dialog controller/header (shared-coverage.log).
Scope: Reused Writer/shared async dialog infrastructure.

Command: npx vitest run scripts/calc-sheet-command-source.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: Two source contract cases pass;native26042 UInt16 Nr one-based contract and exact source filtering/list/widget composition retained;Calc450commands/11menus/17explicit policies fresh;Writer generation unchanged.
Scope: Pinned source contracts and deterministic shared resource tooling.

Command: npm run typecheck; npm run build; touched style;check:dependencies;check:docs;check:file-size;check:source-tree;check:source-provenance;scoped Calc/shared registry;ap doctor;policy routing
Result: pass
Evidence: Task-local logs and final taskYDAWMM gate logs pass;844runtime modules mapped,zero scoped semantic violations. Existing chunk-size/shim advisories remain recorded.
Scope: Task10 implementation and final shared semantic repair.

Command: Production Chromium Go to Sheet menu/filter/selection/cancel and keyboard acceptance
Result: pass
Evidence: browser-review.json,browser-keyboard-review.json and final taskYDAWMM browser-calc-review.json;actual active sheet changes correctly,filter is case-sensitive,initial active selection and empty/cancel semantics retain native behavior. Console0errors/0warnings.
Scope: Final real browser owner chain;no substitute workbook or selection state.

Command: npm run test:all,with staged failure repair/revalidation
Result: All required regression stages accounted for after repairs
Evidence: Initial app run16996passed2failed only stale Writer-only bootstrap expectations. Final application retry:987files/16998cases pass;100% statements46421/46421,branches29881/29881,functions9298/9298,lines42216/42216 (full-app-final.log). Inventory123cases100% (full-inventory-final.log);tooling107cases/13files pass (full-tooling.log). Initial browser run369passed5stale UI expectations;updated expectations exposed real shared/Calc ARIA defects. Completed repair task202610181929-YDAWMM implementation cf90142089d1 fixes those defects without audit exclusions. Final6foundation/launcher/geometry cases pass;full repaired browser run372passed2remaining conditional root-role queries,then all3root-boundary cases pass after those test-only query repairs. All374original browser cases are accounted for;see taskYDAWMM verification.md,browser-regression.log,browser-boundary-final.log and axe-final.log.
Scope: Scheduled task10 full application/inventory/tooling/browser regression. Post-baseline production changes were only the4presentation-semantic modules in YDAWMM;all affected UI graph cases,Calc100% and3renderers100% plus real browser axe/geometry were revalidated. No blanket full-suite replay is needed before the next cadence milestone.

Findings: Task10 originally committed implementation353896defafc;source expectation fixes,full cadence evidence and completed semantic repair are descendant commits on calc. Go to Sheet preserves native26042/Nr1-based,typed Which lookup,initial/current sheet names,case-sensitive mask,selection clearing,double-click/list Enter acceptance,empty/cancel no-op and close cancellation. Shared Writer DialogHeader,styles and SfxDialogController are used. Help remains disabled because its native service is unported. Hidden/alternate sheets and broader formatting/input/context/clipboard services remain active goal work. No whole Calc UI/native parity completion is claimed. Current cadence includes the additional accessibility repair leaf11;next scheduled full run follows overall task20.
