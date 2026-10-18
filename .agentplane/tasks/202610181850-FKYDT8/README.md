---
id: "202610181850-FKYDT8"
title: "Connect Calc source sheet navigation and selection commands"
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
  updated_at: "2026-10-18T18:51:02.732Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T18:57:57.576Z"
  updated_by: "CODER"
  note: "AllCalc268tests100percent;related180shared/Writer tests and sharedmenu100percent;native source/default contract test,resource freshness,app/tools typecheck,build,style,module/source/registry gates,doctor/routing and production Chromium sheet commands pass. See verification.md and browser-review.json. Full all-app cadence at task10."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T18:58:11.022Z"
  updated_by: "EVALUATOR"
  note: "Source sheet navigation/grouping is connected to real Calc view/mark state and shared Sfx UI within approved task9 scope."
  evaluated_sha: "55ec1df2c259c708c054ea3c8b938980feab7222"
  blueprint_digest: "602fff15b4295c49995f8d0a8f2bc9f00955fe67afdbe878db802f1e913701c2"
  evidence_refs:
    - ".agentplane/tasks/202610181850-FKYDT8/README.md"
    - ".agentplane/tasks/202610181850-FKYDT8/quality/20261018-185811022-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181850-FKYDT8/quality/20261018-185811022-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181850-FKYDT8/quality/20261018-185811022-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181850-FKYDT8/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610181850-FKYDT8/verification.md"
    - ".agentplane/tasks/202610181850-FKYDT8/calc-coverage.log"
    - ".agentplane/tasks/202610181850-FKYDT8/browser-review.json"
  findings:
    - "ScTabView uses pinned wrap=true and native partial/all-group rules;original numeric slots and deselect availability are source-backed. All268Calc tests have100percent raw coverage;180related shared/Writer cases prove100percent shared-menu coverage. Build,types,source/registry gates and production menu/keyboard state transitions pass without independent browser selection state."
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
  -
    type: "verify"
    at: "2026-10-18T18:57:57.576Z"
    author: "CODER"
    state: "ok"
    note: "AllCalc268tests100percent;related180shared/Writer tests and sharedmenu100percent;native source/default contract test,resource freshness,app/tools typecheck,build,style,module/source/registry gates,doctor/routing and production Chromium sheet commands pass. See verification.md and browser-review.json. Full all-app cadence at task10."
doc_version: 3
doc_updated_at: "2026-10-18T18:57:57.628Z"
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
    ### 2026-10-18T18:57:57.576Z — VERIFY — ok

    By: CODER

    Note: AllCalc268tests100percent;related180shared/Writer tests and sharedmenu100percent;native source/default contract test,resource freshness,app/tools typecheck,build,style,module/source/registry gates,doctor/routing and production Chromium sheet commands pass. See verification.md and browser-review.json. Full all-app cadence at task10.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T18:57:57.090Z, excerpt_hash=sha256:5ba587491ad8312ba2603de03e8ebda16ab0aeca8549b004dc7d7ab6d0b8fa9f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181850-FKYDT8/blueprint/resolved-snapshot.json
    - old_digest: 602fff15b4295c49995f8d0a8f2bc9f00955fe67afdbe878db802f1e913701c2
    - current_digest: 602fff15b4295c49995f8d0a8f2bc9f00955fe67afdbe878db802f1e913701c2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181850-FKYDT8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181850-FKYDT8 -m 🧩 FKYDT8 task: persist canonical task artifacts --allow-tasks
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
    Evidence: 101files,268tests;100% statements6359/6359,branches4087/4087,functions1314/1314,lines5701/5701 (calc-coverage.log).
    Scope: Entire Calc plus new native ScTabView navigation/grouping and real Sfx UI integration. Tests cover default wrapping,no-wrap branch,zero/single sheet,invalid/absent tab,partial/all groups,bNew refresh,per-sheet/old cursors,real source numeric slots,pending input commit and rejected formula retention,selection-only generation/history/dirty independence,menu and Ctrl/Meta page navigation.

    Command: npm run test:coverage -- CommandMenuBar WriterMenuBar.test WriterCommandToolbar.test native-menubar native-disabled-menubar native-empty-menubar native-context-menu.test calc-sheet-commands.test --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.reportsDirectory=coverage/calc-sheet-menus
    Result: pass
    Evidence: 17files,180tests;100% all four metrics for the actual shared menu presenter (shared-coverage.log).
    Scope: Affected shared menu behavior,Writer menu/toolbar and actual Calc sheet command consumers.

    Command: npx vitest run scripts/calc-sheet-command-source.test.ts; npm run check:calc-resources; npm run check:writer-resources
    Result: pass
    Evidence: Pinned Calc.xcs wrap=true and source slot declarations pass;Calc450commands/11topmenus/17policy dispositions fresh;Writer generation unchanged and2resource tests pass.
    Scope: Original source contract/configuration and shared generated resources.

    Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181850-FKYDT8/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: App/tools typecheck and production build pass;20non-task paths;style/docs/size/module/source/provenance gates pass;842runtime modules,728mapped;zero scoped semantic violations;doctorOK/routingOK. Production build retains existing chunk-size/timing advisories;doctor retains existing managed shim readiness advisory.
    Scope: All task implementation and registry paths. Initial test accessed ResolvedShellCommand.slotId rather than slot.slotId;corrected. Initial header provenance had empty localSymbols;fixed to the existing native reexport provenance convention. Initial narrow shared test selection omitted native menu acceptance cases;expanded related selection proves100percent without reducing thresholds.

    Command: Production Chromium http://127.0.0.1:5176/calc with real menu controls and document keyboard events
    Result: pass
    Evidence: browser-review.json shows Navigate->next actual sheet,Edit Select->extend to previous,select-all,Ctrl+PageUp wraps first->last and collapses all-group,Meta+PageDown wraps last->first. Console0errors/0warnings.
    Scope: Built application,actual shared command menu,source view/mark owners and rendered active/selected tabs.

    Findings: Existing Calc core only represents visible sheets;hidden/alternate-sheet views,formula reference mode,drawing/window services remain explicitly unported. DeselectAllTables is a source dispatcher operation,not an invented extra main-menu item. Navigation/grouping does not create substitute workbook/selection state. Current task9/10;full all-app suite runs at task10 under the user testing cadence. Work stays on Calc checkout/branch;no merges,network or other checkouts.
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
### 2026-10-18T18:57:57.576Z — VERIFY — ok

By: CODER

Note: AllCalc268tests100percent;related180shared/Writer tests and sharedmenu100percent;native source/default contract test,resource freshness,app/tools typecheck,build,style,module/source/registry gates,doctor/routing and production Chromium sheet commands pass. See verification.md and browser-review.json. Full all-app cadence at task10.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T18:57:57.090Z, excerpt_hash=sha256:5ba587491ad8312ba2603de03e8ebda16ab0aeca8549b004dc7d7ab6d0b8fa9f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181850-FKYDT8/blueprint/resolved-snapshot.json
- old_digest: 602fff15b4295c49995f8d0a8f2bc9f00955fe67afdbe878db802f1e913701c2
- current_digest: 602fff15b4295c49995f8d0a8f2bc9f00955fe67afdbe878db802f1e913701c2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181850-FKYDT8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181850-FKYDT8 -m 🧩 FKYDT8 task: persist canonical task artifacts --allow-tasks
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
Evidence: 101files,268tests;100% statements6359/6359,branches4087/4087,functions1314/1314,lines5701/5701 (calc-coverage.log).
Scope: Entire Calc plus new native ScTabView navigation/grouping and real Sfx UI integration. Tests cover default wrapping,no-wrap branch,zero/single sheet,invalid/absent tab,partial/all groups,bNew refresh,per-sheet/old cursors,real source numeric slots,pending input commit and rejected formula retention,selection-only generation/history/dirty independence,menu and Ctrl/Meta page navigation.

Command: npm run test:coverage -- CommandMenuBar WriterMenuBar.test WriterCommandToolbar.test native-menubar native-disabled-menubar native-empty-menubar native-context-menu.test calc-sheet-commands.test --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.reportsDirectory=coverage/calc-sheet-menus
Result: pass
Evidence: 17files,180tests;100% all four metrics for the actual shared menu presenter (shared-coverage.log).
Scope: Affected shared menu behavior,Writer menu/toolbar and actual Calc sheet command consumers.

Command: npx vitest run scripts/calc-sheet-command-source.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: Pinned Calc.xcs wrap=true and source slot declarations pass;Calc450commands/11topmenus/17policy dispositions fresh;Writer generation unchanged and2resource tests pass.
Scope: Original source contract/configuration and shared generated resources.

Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181850-FKYDT8/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: App/tools typecheck and production build pass;20non-task paths;style/docs/size/module/source/provenance gates pass;842runtime modules,728mapped;zero scoped semantic violations;doctorOK/routingOK. Production build retains existing chunk-size/timing advisories;doctor retains existing managed shim readiness advisory.
Scope: All task implementation and registry paths. Initial test accessed ResolvedShellCommand.slotId rather than slot.slotId;corrected. Initial header provenance had empty localSymbols;fixed to the existing native reexport provenance convention. Initial narrow shared test selection omitted native menu acceptance cases;expanded related selection proves100percent without reducing thresholds.

Command: Production Chromium http://127.0.0.1:5176/calc with real menu controls and document keyboard events
Result: pass
Evidence: browser-review.json shows Navigate->next actual sheet,Edit Select->extend to previous,select-all,Ctrl+PageUp wraps first->last and collapses all-group,Meta+PageDown wraps last->first. Console0errors/0warnings.
Scope: Built application,actual shared command menu,source view/mark owners and rendered active/selected tabs.

Findings: Existing Calc core only represents visible sheets;hidden/alternate-sheet views,formula reference mode,drawing/window services remain explicitly unported. DeselectAllTables is a source dispatcher operation,not an invented extra main-menu item. Navigation/grouping does not create substitute workbook/selection state. Current task9/10;full all-app suite runs at task10 under the user testing cadence. Work stays on Calc checkout/branch;no merges,network or other checkouts.
