---
id: "202610241509-9N3MFW"
title: "Connect native Writer numbering object toolbar to active shell context"
result_summary: "Connected native Writer numbering object toolbar with verified context and history"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-24T15:09:57.794Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-24T15:21:00.713Z"
  updated_by: "CODER"
  note: "Verified: actual native NumberList context now renders existing source-visible numbering placements with table priority;41focused cases and4production Chromium scenarios pass. New presenter/Chrome owners have strict100coverage S11/B21/F5/L10;native list/history/ODT regressions pass. All16static/source/build gates pass;WRITER085 records source visibility normalization. Exactly this one task will close,then the goal stops."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-24T15:21:39.077Z"
  updated_by: "EVALUATOR"
  note: "Existing native numbering object toolbar is connected to real Writer context and commands on82cd787b0d2e;verified scope is complete and this one task can close before stopping."
  evaluated_sha: "82cd787b0d2eb829c41a4c1df22e9a4aedfc7036"
  blueprint_digest: "a86e0f268f04c803cdd0aab1978093cd7ef81f6c8588bb7290670946ea99cee1"
  evidence_refs:
    - ".agentplane/tasks/202610241509-9N3MFW/README.md"
    - ".agentplane/tasks/202610241509-9N3MFW/quality/20261024-152139077-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610241509-9N3MFW/quality/20261024-152139077-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610241509-9N3MFW/quality/20261024-152139077-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610241509-9N3MFW/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-full-checkpoint/9N3MFW-coverage.log"
    - "output/playwright/writer-full-checkpoint/9N3MFW-integration-final.log"
    - "output/playwright/writer-full-checkpoint/9N3MFW-browser-final.log"
    - "output/playwright/writer-full-checkpoint/9N3MFW-gates.json"
    - "output/playwright/writer-full-checkpoint/9N3MFW-source-hashes.json"
    - "docs/program/writer-upstream-suspected-issues.md"
  findings:
    - "Generated numobjectbar visible order and existing Sfx state are reused;native NumberList selection admits the bar and table context retains priority in the same object-bar strip. No parallel list store,kernel command or hidden source entry is added."
    - "Real integration covers plain/list/table transitions,0/9level limits,pointer admission,undo/redo and ODT. The upstream list-continuation fixture uses its native selected range.41focused tests and4production Chromium scenarios pass;strict measured coverage for presenter/Chrome is100%S11/B21/F5/L10 without new ignores or threshold changes."
    - "All16declared static/source/resource gates pass,screenshots1280/390 were inspected,and paired provenance retains browser adaptation status. WRITER085 preserves the surprising native Invisible registration normalization instead of changing upstream logic."
commit:
  hash: "a3649dfa78aed2eb7deef4865bbb0c12c674b26d"
  message: "✅ 9N3MFW verify: record numbering toolbar coverage and browser evidence"
comments:
  -
    author: "CODER"
    body: "Start: connect the existing native numbering object-bar resource to actual Writer context and bindings,verify related behavior,then close this one task and stop as requested."
  -
    author: "CODER"
    body: "Verified: connected the existing native numbering object toolbar to actual Writer context and bindings,retaining table priority,pointer caret,history and ODT behavior;41focused tests,4Chromium scenarios,strict measured100coverage and16static/source gates pass. EVALUATOR verdict is pass. This is the single requested next task;pause the goal after clean closure."
events:
  -
    type: "status"
    at: "2026-10-24T15:10:02.714Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the existing native numbering object-bar resource to actual Writer context and bindings,verify related behavior,then close this one task and stop as requested."
  -
    type: "verify"
    at: "2026-10-24T15:21:00.713Z"
    author: "CODER"
    state: "ok"
    note: "Verified: actual native NumberList context now renders existing source-visible numbering placements with table priority;41focused cases and4production Chromium scenarios pass. New presenter/Chrome owners have strict100coverage S11/B21/F5/L10;native list/history/ODT regressions pass. All16static/source/build gates pass;WRITER085 records source visibility normalization. Exactly this one task will close,then the goal stops."
  -
    type: "status"
    at: "2026-10-24T15:22:05.463Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: connected the existing native numbering object toolbar to actual Writer context and bindings,retaining table priority,pointer caret,history and ODT behavior;41focused tests,4Chromium scenarios,strict measured100coverage and16static/source gates pass. EVALUATOR verdict is pass. This is the single requested next task;pause the goal after clean closure."
doc_version: 3
doc_updated_at: "2026-10-24T15:22:05.464Z"
doc_updated_by: "CODER"
description: "Human requests exactly one next task after6764KT,then stop again. Connect the existing generated numobjectbar resource and implemented promote/demote/continue-numbering commands to the Writer workspace. Preserve native NumberList context,table object-bar priority,source visibility/order and actual command state/focus/history. Work only in vite-office-writer on writer;no new core operations,network,other tasks or full suite. Up to16primary implementation/test paths plus paired canonical/task/generated records. Related unit/integration strict coverage,production Chromium1280/390,ODT/history and static/source gates;finish this task then pause goal."
sections:
  Summary: "Connect the existing native numbering object toolbar to the actual Writer shell context."
  Scope: "Only vite-office-writer branch writer. Up to16primary implementation/test paths plus paired canonical/task/generated records. Reuse numobjectbar.ts and actual command owners;preserve source visible flags/order and table toolbar priority in the shared object-bar slot. No fake list state,new kernel commands,network,merges,other tasks or full suite. Human authorized exactly one next task,then stop."
  Plan: "Add a browser Writer numbering object-bar presenter over the existing generated placements and frame bindings. Select it only for native NumberList context without a higher-priority table object bar;project into the existing bottom object-bar region. Preserve enabled state,document selection/focus and native history. Add integration/context/resource tests and production browser1280/390 editing/history/ODT regression. Update paired provenance,verify related coverage and source/build gates,commit,evaluate and close this one task;then pause the goal."
  Verify Steps: "Run focused Vitest for the new numbering presenter,Writer workspace/list command/context/history and resource owners. Require100%coverage for the new presenter and exercised new context branches without lowering thresholds or adding ignores. Verify real native command state at levels0/9,body versus table contexts,plain/list transitions,undo/redo and ODT round-trip. Run production build and focused Chromium1280/390 numbering toolbar scenarios with actual pointer focus/caret and no page errors. Run typecheck,scoped ESLint/Prettier,check:docs,check:dependencies,check:source-provenance,check:file-size,check:source-tree,check:writer-resources,registry build/invariants/parity,static smoke,doctor,routing and diff checks. No full run on this first task after the completed full checkpoint. Record EVALUATOR and clean task closure,then stop."
  Verification: |-
    Command: npx vitest run src/sw/browser/presentation/WriterNumObjectBar.test.tsx src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/writer-view-style-focus.test.tsx --coverage --coverage.include=src/sw/browser/presentation/WriterNumObjectBar.tsx --coverage.include=src/sw/browser/presentation/WriterWorkspaceChrome.tsx --coverage.reportsDirectory=coverage/9N3MFW (cwd apps/office). Result: pass41cases/4files;two measured browser owners S11/B21/F5/L10 all100%,skipped0. Evidence:9N3MFW-coverage.log and apps/office/coverage/9N3MFW. Scope: new presenter and actual Chrome object-bar priority,plus real workbench/list/body/table context transitions,0/9level limits,mouse admission,undo/redo and ODT round-trip. Whole writer-view.tsx coverage is not claimed;new context selection is exercised by production integration tests.
    Command: npm run test:writer -- src/sw/browser/presentation/WriterNumObjectBar.test.tsx src/sw/source/uibase/shells/listsh-odt.test.ts. Result: pass4cases/2files;9N3MFW-integration-final.log. Native indent/history related profile also passes8cases/2files in9N3MFW-focused-final.log. These profiles overlap and are not a unique-test total.
    Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-numbering-toolbar.spec.ts apps/office/e2e/writer-native-list-context.spec.ts. Result: pass4/4production Chromium scenarios1280/390;9N3MFW-build.log and9N3MFW-browser-final.log. Scope: actual context menus and numbering toolbar,pointer retains the real contenteditable host,caret typing continues,history restores levels,and an upstream ODT fixture joins a selected list range through the actual toolbar. No page errors. Screenshots9N3MFW-numbering-1280.png and9N3MFW-numbering-390.png inspected;all three controls fit the viewport. No desktop pixel/raster parity claim.
    Command: full typecheck,scoped ESLint/Prettier,check:docs,check:dependencies,check:file-size,check:source-tree,check:source-provenance,check:writer-resources,inventory:registry:build,invariants,parity,static smoke,doctor,routing,git diff --check. Result: pass16gates;9N3MFW-gates.json and associated9N3MFW-*.log. Provenance1224modules:1030mapped171browser23infra. Runtime source hashes9N3MFW-source-hashes.json. Registered IO/autosave/recovery behavior retained. No full suite is due on the first task after the preceding full checkpoint;human requested exactly one next task and stop after closure. EVALUATOR and clean final commit follow.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-24T15:21:00.713Z — VERIFY — ok

    By: CODER

    Note: Verified: actual native NumberList context now renders existing source-visible numbering placements with table priority;41focused cases and4production Chromium scenarios pass. New presenter/Chrome owners have strict100coverage S11/B21/F5/L10;native list/history/ODT regressions pass. All16static/source/build gates pass;WRITER085 records source visibility normalization. Exactly this one task will close,then the goal stops.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-24T15:20:26.146Z, excerpt_hash=sha256:03f5c7945ded4987755494a49c71e9a8909ca81ddf438b92f09977378fa0c33c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610241509-9N3MFW/blueprint/resolved-snapshot.json
    - old_digest: a86e0f268f04c803cdd0aab1978093cd7ef81f6c8588bb7290670946ea99cee1
    - current_digest: a86e0f268f04c803cdd0aab1978093cd7ef81f6c8588bb7290670946ea99cee1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610241509-9N3MFW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610241509-9N3MFW
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task commits;preserve existing user and other task work."
  Findings: |-
    Native listsh.cxx registers Num_Toolbox at SFX_OBJECTBAR_OBJECT. Although the registration passes Invisible,CreateObjectBarUI_Impl converts it to Standard,and IsObjectBarVisible returns true. Native view.cxx pushes list below text and table shells;the table object bar wins the same position. Preserve this actual source behavior rather than inferring permanent hidden visibility from the enum name. Existing numobjectbar adapter already filters hidden bullet/number toggles;only promote,demote and continue-numbering are represented by visible supported commands.

    Final: the existing source-visible three-command numbering bar now occupies the same browser object-bar strip as the table bar,with table priority. Actual NumberList context and actual Sfx enabled state supply all behavior;kernel/list/history/import/export algorithms were unchanged. Pointer activation retains editing-host focus,while native keyboard button behavior remains available. WRITER085 documents the surprising Invisible-to-Standard upstream registration contract without changing it or claiming a confirmed upstream defect. Initial test corrections fixed a wrong import and an incorrect collapsed-cursor continuation expectation:upstream tdf113213 requires the existing selected two-paragraph range to join the earlier rule. Initial Chromium assertion expected the inner paragraph to remain active;actual browser focus belongs to its contenteditable host. Final tests assert that host and real subsequent typing instead. No runtime workaround,threshold reduction,coverage ignore or fabricated command was added. Broader native toolbar customization and unsupported commands are outside this existing-control connection.
extensions:
  implementation_commit:
    hash: "82cd787b0d2eb829c41a4c1df22e9a4aedfc7036"
    message: "🖋️ 9N3MFW numbering: connect contextual toolbar to native Writer commands"
id_source: "generated"
---
## Summary

Connect the existing native numbering object toolbar to the actual Writer shell context.

## Scope

Only vite-office-writer branch writer. Up to16primary implementation/test paths plus paired canonical/task/generated records. Reuse numobjectbar.ts and actual command owners;preserve source visible flags/order and table toolbar priority in the shared object-bar slot. No fake list state,new kernel commands,network,merges,other tasks or full suite. Human authorized exactly one next task,then stop.

## Plan

Add a browser Writer numbering object-bar presenter over the existing generated placements and frame bindings. Select it only for native NumberList context without a higher-priority table object bar;project into the existing bottom object-bar region. Preserve enabled state,document selection/focus and native history. Add integration/context/resource tests and production browser1280/390 editing/history/ODT regression. Update paired provenance,verify related coverage and source/build gates,commit,evaluate and close this one task;then pause the goal.

## Verify Steps

Run focused Vitest for the new numbering presenter,Writer workspace/list command/context/history and resource owners. Require100%coverage for the new presenter and exercised new context branches without lowering thresholds or adding ignores. Verify real native command state at levels0/9,body versus table contexts,plain/list transitions,undo/redo and ODT round-trip. Run production build and focused Chromium1280/390 numbering toolbar scenarios with actual pointer focus/caret and no page errors. Run typecheck,scoped ESLint/Prettier,check:docs,check:dependencies,check:source-provenance,check:file-size,check:source-tree,check:writer-resources,registry build/invariants/parity,static smoke,doctor,routing and diff checks. No full run on this first task after the completed full checkpoint. Record EVALUATOR and clean task closure,then stop.

## Verification

Command: npx vitest run src/sw/browser/presentation/WriterNumObjectBar.test.tsx src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/writer-view-style-focus.test.tsx --coverage --coverage.include=src/sw/browser/presentation/WriterNumObjectBar.tsx --coverage.include=src/sw/browser/presentation/WriterWorkspaceChrome.tsx --coverage.reportsDirectory=coverage/9N3MFW (cwd apps/office). Result: pass41cases/4files;two measured browser owners S11/B21/F5/L10 all100%,skipped0. Evidence:9N3MFW-coverage.log and apps/office/coverage/9N3MFW. Scope: new presenter and actual Chrome object-bar priority,plus real workbench/list/body/table context transitions,0/9level limits,mouse admission,undo/redo and ODT round-trip. Whole writer-view.tsx coverage is not claimed;new context selection is exercised by production integration tests.
Command: npm run test:writer -- src/sw/browser/presentation/WriterNumObjectBar.test.tsx src/sw/source/uibase/shells/listsh-odt.test.ts. Result: pass4cases/2files;9N3MFW-integration-final.log. Native indent/history related profile also passes8cases/2files in9N3MFW-focused-final.log. These profiles overlap and are not a unique-test total.
Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-numbering-toolbar.spec.ts apps/office/e2e/writer-native-list-context.spec.ts. Result: pass4/4production Chromium scenarios1280/390;9N3MFW-build.log and9N3MFW-browser-final.log. Scope: actual context menus and numbering toolbar,pointer retains the real contenteditable host,caret typing continues,history restores levels,and an upstream ODT fixture joins a selected list range through the actual toolbar. No page errors. Screenshots9N3MFW-numbering-1280.png and9N3MFW-numbering-390.png inspected;all three controls fit the viewport. No desktop pixel/raster parity claim.
Command: full typecheck,scoped ESLint/Prettier,check:docs,check:dependencies,check:file-size,check:source-tree,check:source-provenance,check:writer-resources,inventory:registry:build,invariants,parity,static smoke,doctor,routing,git diff --check. Result: pass16gates;9N3MFW-gates.json and associated9N3MFW-*.log. Provenance1224modules:1030mapped171browser23infra. Runtime source hashes9N3MFW-source-hashes.json. Registered IO/autosave/recovery behavior retained. No full suite is due on the first task after the preceding full checkpoint;human requested exactly one next task and stop after closure. EVALUATOR and clean final commit follow.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-24T15:21:00.713Z — VERIFY — ok

By: CODER

Note: Verified: actual native NumberList context now renders existing source-visible numbering placements with table priority;41focused cases and4production Chromium scenarios pass. New presenter/Chrome owners have strict100coverage S11/B21/F5/L10;native list/history/ODT regressions pass. All16static/source/build gates pass;WRITER085 records source visibility normalization. Exactly this one task will close,then the goal stops.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-24T15:20:26.146Z, excerpt_hash=sha256:03f5c7945ded4987755494a49c71e9a8909ca81ddf438b92f09977378fa0c33c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610241509-9N3MFW/blueprint/resolved-snapshot.json
- old_digest: a86e0f268f04c803cdd0aab1978093cd7ef81f6c8588bb7290670946ea99cee1
- current_digest: a86e0f268f04c803cdd0aab1978093cd7ef81f6c8588bb7290670946ea99cee1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610241509-9N3MFW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610241509-9N3MFW
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task commits;preserve existing user and other task work.

## Findings

Native listsh.cxx registers Num_Toolbox at SFX_OBJECTBAR_OBJECT. Although the registration passes Invisible,CreateObjectBarUI_Impl converts it to Standard,and IsObjectBarVisible returns true. Native view.cxx pushes list below text and table shells;the table object bar wins the same position. Preserve this actual source behavior rather than inferring permanent hidden visibility from the enum name. Existing numobjectbar adapter already filters hidden bullet/number toggles;only promote,demote and continue-numbering are represented by visible supported commands.

Final: the existing source-visible three-command numbering bar now occupies the same browser object-bar strip as the table bar,with table priority. Actual NumberList context and actual Sfx enabled state supply all behavior;kernel/list/history/import/export algorithms were unchanged. Pointer activation retains editing-host focus,while native keyboard button behavior remains available. WRITER085 documents the surprising Invisible-to-Standard upstream registration contract without changing it or claiming a confirmed upstream defect. Initial test corrections fixed a wrong import and an incorrect collapsed-cursor continuation expectation:upstream tdf113213 requires the existing selected two-paragraph range to join the earlier rule. Initial Chromium assertion expected the inner paragraph to remain active;actual browser focus belongs to its contenteditable host. Final tests assert that host and real subsequent typing instead. No runtime workaround,threshold reduction,coverage ignore or fabricated command was added. Broader native toolbar customization and unsupported commands are outside this existing-control connection.
