---
id: "202610181721-0V5WR6"
title: "Connect editable Calc workspace to production application"
result_summary: "Connected production Calc workspace with canonical scalar editing,formula recalculation,sheet controls and shared Sfx history"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
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
  state: "ok"
  updated_at: "2026-10-18T17:51:57.764Z"
  updated_by: "CODER"
  note: "Verified Calc252tests with100% coverage,shared25/Desktop11,production browser and declared build/style/source gates."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T17:51:47.258Z"
  updated_by: "EVALUATOR"
  note: "Production Calc scalar workspace satisfies the approved task5 slice with real canonical owners and Writer shared style;all declared scoped checks pass."
  evaluated_sha: "65530b0f5e849c71f21287f20da015a4863e6524"
  blueprint_digest: "d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6"
  evidence_refs:
    - ".agentplane/tasks/202610181721-0V5WR6/README.md"
    - ".agentplane/tasks/202610181721-0V5WR6/quality/20261018-175147258-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181721-0V5WR6/quality/20261018-175147258-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181721-0V5WR6/quality/20261018-175147258-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181721-0V5WR6/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610181721-0V5WR6/verification.md"
    - ".agentplane/tasks/202610181721-0V5WR6/calc-coverage.log"
    - ".agentplane/tasks/202610181721-0V5WR6/browser-review.json"
    - ".agentplane/tasks/202610181721-0V5WR6/parity.log"
  findings:
    - "Reviewed65530b0f5e84:actual ScDocument/ScViewData storage,shared Sfx shell/frame/dispatcher/history,and controlled React presenters form one ownership chain. Formula history adopts copied native token arrays and preserves code errors. Native DeleteTab guards and subscription cleanup are covered without claiming unported reference services."
    - "Evidence records252Calc tests at100% in all four metrics,25shared and11Writer Desktop tests,production browser editing/history/sheet and maximum-coordinate geometry checks,plus build/typecheck/style/architecture/source gates.40non-task files fit the35+5 scope tolerance."
commit:
  hash: "65530b0f5e849c71f21287f20da015a4863e6524"
  message: "✨ 0V5WR6 calc: connect editable production workspace to canonical owners"
comments:
  -
    author: "CODER"
    body: "Start: Connect production Calc route to actual scalar document/edit/view owners,shared Sfx command/history infrastructure and existing controlled presenters. Complete mounted behavior and Calc coverage before closure."
  -
    author: "CODER"
    body: "Verified: Connected production Calc workspace with canonical scalar editing,formula recalculation,sheet controls and shared Sfx history. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-18T17:22:07.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect production Calc route to actual scalar document/edit/view owners,shared Sfx command/history infrastructure and existing controlled presenters. Complete mounted behavior and Calc coverage before closure."
  -
    type: "verify"
    at: "2026-10-18T17:51:20.838Z"
    author: "CODER"
    state: "ok"
    note: "Calc252tests/95files,100% all metrics;shared25/Desktop11;build,typecheck,touched lint/format,architecture/docs/source provenance/Calc parity and real-browser production checks pass. Task5/10;full regression follows user cadence."
  -
    type: "verify"
    at: "2026-10-18T17:51:57.764Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc252tests with100% coverage,shared25/Desktop11,production browser and declared build/style/source gates."
  -
    type: "status"
    at: "2026-10-18T17:51:57.868Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Connected production Calc workspace with canonical scalar editing,formula recalculation,sheet controls and shared Sfx history. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-18T17:51:57.869Z"
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
    Command: npm run test:coverage:calc
    Result: pass
    Evidence: calc-coverage.log;95files,252tests;6047/6047statements,3889/3889branches,1239/1239functions,5420/5420lines,all100%.
    Scope: All Calc runtime modules,current core and new mounted production UI.

    Command: npm run test:shared -- modulemanager.test bootstrap.test dispatch.test objsh.test undo.test
    Result: pass
    Evidence: shared-tests.log;25tests,5files.
    Scope: Shared app registration,mounting,Sfx dispatch,shell and action history.

    Command: npm run test:writer -- desktop.test.tsx
    Result: pass
    Evidence: desktop-tests.log;11tests.
    Scope: Existing Writer desktop,launcher and remaining placeholder-suite route.

    Command: npm run typecheck --workspace @vite-office/office; npm run build
    Result: pass
    Evidence: typecheck.log,build.log.
    Scope: Complete application compilation/static production bundle;existing bundle-size advisory remains.

    Command: npx eslint <all touched/new application source paths> --max-warnings 0; npx prettier --check <all touched/new source paths and Calc registry>
    Result: pass
    Evidence: lint.log,format.log.
    Scope: Task source and metadata;exact path sets are present in the tool execution history.

    Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc
    Result: pass
    Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log,parity.log.
    Scope: Architecture boundaries,documentation,source ownership and bounded Calc registry evidence;no broad native parity claimed.

    Command: Browser navigate /calc and browser evaluate actual rendered editing,history,sheets and last-cell geometry
    Result: pass
    Evidence: browser-review.json;result12,Undo empty,2sheets,last cell visible,scroll-independent cursor,zero console errors/warnings.
    Scope: Production application;real source owners;React/Tailwind/shared Writer control style.

    Skipped: Full all-app test run
    Reason: User requires full regression once per10Agentplane tasks;current UI-cycle task5.
    Risk: Changes outside Calc are covered only by focused shared/Writer tests at this step.
    Approval: User testing instructions in the goal.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T17:51:20.838Z — VERIFY — ok

    By: CODER

    Note: Calc252tests/95files,100% all metrics;shared25/Desktop11;build,typecheck,touched lint/format,architecture/docs/source provenance/Calc parity and real-browser production checks pass. Task5/10;full regression follows user cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T17:51:20.368Z, excerpt_hash=sha256:2ca23e0b0293ec0b6c7d1184d037735c6418b4bc53dd19ee5e7910986ac6cfb2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181721-0V5WR6/blueprint/resolved-snapshot.json
    - old_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
    - current_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181721-0V5WR6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181721-0V5WR6 -m 🧩 0V5WR6 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-18T17:51:57.764Z — VERIFY — ok

    By: CODER

    Note: Verified Calc252tests with100% coverage,shared25/Desktop11,production browser and declared build/style/source gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T17:51:20.891Z, excerpt_hash=sha256:2ca23e0b0293ec0b6c7d1184d037735c6418b4bc53dd19ee5e7910986ac6cfb2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181721-0V5WR6/blueprint/resolved-snapshot.json
    - old_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
    - current_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181721-0V5WR6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610181721-0V5WR6 --result verified-202610181721-0V5WR6 --commit 5cfe24ee583c2eb44f8387f285784340c7323cc5
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
  Findings: "Production /calc now mounts the real editable Calc session using Writer shared controls and styles. Browser evidence: A1=4;B1=A1*3 displays12;Undo clears B1;Redo restores12;sheet append selects Sheet2;name-box XFD1048576 reveals the last cell within the grid;independent scrolling preserves that cursor. Initial mounted tests corrected role/resource expectations and native error520;coverage gaps were covered with actual empty-code display,modifier paths and an isolated InsertTab rejection injection verifying no phantom history. JSDoc callback placement was corrected. Final scoped Calc gate:252tests,95files,100% statements/branches/functions/lines. Shared25 and Writer Desktop11 passed. Build,typecheck,ESLint,Prettier,module boundaries,docs,file size,source tree/provenance and Calc parity pass. Scope is40non-task files,within the approved35+5 tolerance. Full all-app run is deferred under the user rule until UI task10;this is task5. Full menus,file workflows,formatting/sidebar and broader native interaction coverage remain following approved tasks. No merge or outside-checkout edits."
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

Command: npm run test:coverage:calc
Result: pass
Evidence: calc-coverage.log;95files,252tests;6047/6047statements,3889/3889branches,1239/1239functions,5420/5420lines,all100%.
Scope: All Calc runtime modules,current core and new mounted production UI.

Command: npm run test:shared -- modulemanager.test bootstrap.test dispatch.test objsh.test undo.test
Result: pass
Evidence: shared-tests.log;25tests,5files.
Scope: Shared app registration,mounting,Sfx dispatch,shell and action history.

Command: npm run test:writer -- desktop.test.tsx
Result: pass
Evidence: desktop-tests.log;11tests.
Scope: Existing Writer desktop,launcher and remaining placeholder-suite route.

Command: npm run typecheck --workspace @vite-office/office; npm run build
Result: pass
Evidence: typecheck.log,build.log.
Scope: Complete application compilation/static production bundle;existing bundle-size advisory remains.

Command: npx eslint <all touched/new application source paths> --max-warnings 0; npx prettier --check <all touched/new source paths and Calc registry>
Result: pass
Evidence: lint.log,format.log.
Scope: Task source and metadata;exact path sets are present in the tool execution history.

Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc
Result: pass
Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log,parity.log.
Scope: Architecture boundaries,documentation,source ownership and bounded Calc registry evidence;no broad native parity claimed.

Command: Browser navigate /calc and browser evaluate actual rendered editing,history,sheets and last-cell geometry
Result: pass
Evidence: browser-review.json;result12,Undo empty,2sheets,last cell visible,scroll-independent cursor,zero console errors/warnings.
Scope: Production application;real source owners;React/Tailwind/shared Writer control style.

Skipped: Full all-app test run
Reason: User requires full regression once per10Agentplane tasks;current UI-cycle task5.
Risk: Changes outside Calc are covered only by focused shared/Writer tests at this step.
Approval: User testing instructions in the goal.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T17:51:20.838Z — VERIFY — ok

By: CODER

Note: Calc252tests/95files,100% all metrics;shared25/Desktop11;build,typecheck,touched lint/format,architecture/docs/source provenance/Calc parity and real-browser production checks pass. Task5/10;full regression follows user cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T17:51:20.368Z, excerpt_hash=sha256:2ca23e0b0293ec0b6c7d1184d037735c6418b4bc53dd19ee5e7910986ac6cfb2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181721-0V5WR6/blueprint/resolved-snapshot.json
- old_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
- current_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181721-0V5WR6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181721-0V5WR6 -m 🧩 0V5WR6 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-18T17:51:57.764Z — VERIFY — ok

By: CODER

Note: Verified Calc252tests with100% coverage,shared25/Desktop11,production browser and declared build/style/source gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T17:51:20.891Z, excerpt_hash=sha256:2ca23e0b0293ec0b6c7d1184d037735c6418b4bc53dd19ee5e7910986ac6cfb2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181721-0V5WR6/blueprint/resolved-snapshot.json
- old_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
- current_digest: d6006f8f42bcc66440fe76fc61eaf814f2366a9a7b7bbadf8e11250297c925b6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181721-0V5WR6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610181721-0V5WR6 --result verified-202610181721-0V5WR6 --commit 5cfe24ee583c2eb44f8387f285784340c7323cc5
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

Production /calc now mounts the real editable Calc session using Writer shared controls and styles. Browser evidence: A1=4;B1=A1*3 displays12;Undo clears B1;Redo restores12;sheet append selects Sheet2;name-box XFD1048576 reveals the last cell within the grid;independent scrolling preserves that cursor. Initial mounted tests corrected role/resource expectations and native error520;coverage gaps were covered with actual empty-code display,modifier paths and an isolated InsertTab rejection injection verifying no phantom history. JSDoc callback placement was corrected. Final scoped Calc gate:252tests,95files,100% statements/branches/functions/lines. Shared25 and Writer Desktop11 passed. Build,typecheck,ESLint,Prettier,module boundaries,docs,file size,source tree/provenance and Calc parity pass. Scope is40non-task files,within the approved35+5 tolerance. Full all-app run is deferred under the user rule until UI task10;this is task5. Full menus,file workflows,formatting/sidebar and broader native interaction coverage remain following approved tasks. No merge or outside-checkout edits.
