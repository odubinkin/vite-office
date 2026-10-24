---
id: "202610241509-9N3MFW"
title: "Connect native Writer numbering object toolbar to active shell context"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect the existing native numbering object-bar resource to actual Writer context and bindings,verify related behavior,then close this one task and stop as requested."
events:
  -
    type: "status"
    at: "2026-10-24T15:10:02.714Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the existing native numbering object-bar resource to actual Writer context and bindings,verify related behavior,then close this one task and stop as requested."
doc_version: 3
doc_updated_at: "2026-10-24T15:20:26.146Z"
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
  Rollback Plan: "Revert only this task commits;preserve existing user and other task work."
  Findings: |-
    Native listsh.cxx registers Num_Toolbox at SFX_OBJECTBAR_OBJECT. Although the registration passes Invisible,CreateObjectBarUI_Impl converts it to Standard,and IsObjectBarVisible returns true. Native view.cxx pushes list below text and table shells;the table object bar wins the same position. Preserve this actual source behavior rather than inferring permanent hidden visibility from the enum name. Existing numobjectbar adapter already filters hidden bullet/number toggles;only promote,demote and continue-numbering are represented by visible supported commands.

    Final: the existing source-visible three-command numbering bar now occupies the same browser object-bar strip as the table bar,with table priority. Actual NumberList context and actual Sfx enabled state supply all behavior;kernel/list/history/import/export algorithms were unchanged. Pointer activation retains editing-host focus,while native keyboard button behavior remains available. WRITER085 documents the surprising Invisible-to-Standard upstream registration contract without changing it or claiming a confirmed upstream defect. Initial test corrections fixed a wrong import and an incorrect collapsed-cursor continuation expectation:upstream tdf113213 requires the existing selected two-paragraph range to join the earlier rule. Initial Chromium assertion expected the inner paragraph to remain active;actual browser focus belongs to its contenteditable host. Final tests assert that host and real subsequent typing instead. No runtime workaround,threshold reduction,coverage ignore or fabricated command was added. Broader native toolbar customization and unsupported commands are outside this existing-control connection.
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

## Rollback Plan

Revert only this task commits;preserve existing user and other task work.

## Findings

Native listsh.cxx registers Num_Toolbox at SFX_OBJECTBAR_OBJECT. Although the registration passes Invisible,CreateObjectBarUI_Impl converts it to Standard,and IsObjectBarVisible returns true. Native view.cxx pushes list below text and table shells;the table object bar wins the same position. Preserve this actual source behavior rather than inferring permanent hidden visibility from the enum name. Existing numobjectbar adapter already filters hidden bullet/number toggles;only promote,demote and continue-numbering are represented by visible supported commands.

Final: the existing source-visible three-command numbering bar now occupies the same browser object-bar strip as the table bar,with table priority. Actual NumberList context and actual Sfx enabled state supply all behavior;kernel/list/history/import/export algorithms were unchanged. Pointer activation retains editing-host focus,while native keyboard button behavior remains available. WRITER085 documents the surprising Invisible-to-Standard upstream registration contract without changing it or claiming a confirmed upstream defect. Initial test corrections fixed a wrong import and an incorrect collapsed-cursor continuation expectation:upstream tdf113213 requires the existing selected two-paragraph range to join the earlier rule. Initial Chromium assertion expected the inner paragraph to remain active;actual browser focus belongs to its contenteditable host. Final tests assert that host and real subsequent typing instead. No runtime workaround,threshold reduction,coverage ignore or fabricated command was added. Broader native toolbar customization and unsupported commands are outside this existing-control connection.
