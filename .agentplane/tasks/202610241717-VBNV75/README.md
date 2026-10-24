---
id: "202610241717-VBNV75"
title: "Canonize Writer formatting dialog keyboard and focus lifetime"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-24T17:18:35.977Z"
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
    body: "Start: canonize native formatting dialog keyboard/tab/focus lifetime through actual requests;close second task then pause goal."
events:
  -
    type: "status"
    at: "2026-10-24T17:18:41.985Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: canonize native formatting dialog keyboard/tab/focus lifetime through actual requests;close second task then pause goal."
doc_version: 3
doc_updated_at: "2026-10-24T17:32:10.952Z"
doc_updated_by: "CODER"
description: "Second and last of exactly two tasks after J1K3KF. Connect consumed native tab navigation and formatting dialog keyboard/focus behavior for Paragraph,Page Style and Insert Break. Preserve tab deactivation/drafts and real request identity;remove Paragraph backdrop cancellation,add Escape/Enter where missing,return focus to actual frame. Only writer checkout/branch,up to24primary paths plus paired records. No new formatting/core features,network or full suite. Task7after checkpoint. Close this task then pause goal."
sections:
  Summary: "Canonize represented formatting dialog keyboard,tab and focus lifetime through actual Writer requests."
  Scope: "Only writer checkout/branch;up to24primary paths plus paired records. Paragraph,Page Style,Insert Break keyboard/focus and consumed tab navigation only;no new formatting/kernel features or full native widget system,network or full suite. Second and last task;pause goal after closure."
  Plan: "Extract native TabControl key-direction decisions from tabctrl.cxx with wraparound using actual tabs. Wire Paragraph tab roving focus/ARIA identity,Left/Right and primary-modifier Tab/PageUp/PageDown navigation before metric spin keys,retaining original tab deactivation and drafts. Use a real Paragraph form for default Enter acceptance;Escape cancels and backdrop clicks retain request. Focus mounted controls on opening Page Style/Insert Break and add missing Escape. Complete/cancel original keyed requests then return focus through actual frame port. Verify source decisions,dialog/view tests and production Chromium1280/390 with history/ODT/draft retention;update records,verify,evaluate,close and pause goal."
  Verify Steps: "Focused Vitest source tab navigation strict100coverage plus Paragraph,Page Style,Insert Break,actual view/entrypoints/tab-session tests;exercise new owner paths without ignores/threshold reduction. Cover native shortcut directions/wrap,unhandled keys,Shift+PageDown asymmetry,roving tab focus/ARIA,mounted instance focus,CtrlPageDown from metric without metric mutation,retained native tab changes,Enter accept,Escape cancel,backdrop persistence and actual document focus after each request. Build and production Chromium1280/390 keyboard/model/history/ODT flows,screenshot inspection,no page errors. Typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean state. Task7after checkpoint;no full suite due. Evaluator pass,finish second task,pause goal."
  Verification: |-
    Command (apps/office): npx vitest run src/vcl/source/control/tabctrl.test.ts src/sw/browser/presentation/WriterParagraphDialog.test.tsx src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterInsertBreakDialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterNativeTabulatorDialog.test.tsx src/sw/source/uibase/shells/native-tab-page-acceptance.test.ts --coverage --coverage.include=src/vcl/source/control/tabctrl.ts --coverage.reportsDirectory=coverage/VBNV75-final.
    Result: pass,49cases/8files,VBNV75-coverage-final.log;strict new source owner100coverage S12/B20/F1/L8,zero skips/no ignores or lowered thresholds. Scope: native direction/shortcut branches,unhandled keys,roving tab IDs/focus,native deactivation/session retention,original request acceptance/cancellation and existing page/metric/view paths. Existing large UI owners are exercised,not claimed wholly100covered.
    Command:npm run test:writer -- src/sw/browser/presentation/WriterNativeTabulatorDialog.test.tsx src/sw/source/uibase/shells/native-tab-page-acceptance.test.ts src/sw/browser/presentation/writer-view-document-key.test.tsx src/sw/browser/presentation/writer-paragraph-toolbar.test.tsx.
    Result: pass,37cases/4files,VBNV75-consumers.log. Scope: actual tab exchange,paragraph/core/history and document-key modal ownership.
    Command:npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-formatting-dialog-keys.spec.ts apps/office/e2e/writer-paragraph-split-controls.spec.ts.
    Result: pass,4production Chromium cases1280/390,VBNV75-build-complete.log/VBNV75-e2e-last.log;no page errors. Inspected VBNV75-tabs screenshots at both widths. Scope: CtrlPageDown before spin keys,tab wrapping,retained authored tabs,Enter/Escape,backdrop retaining modal focus in all3dialogs,actual document typing after cancel/accept including a new hard-break paragraph,first-task undo/redo/ODT replay and actual ODT export of accepted spacing/tabs/break.
    Command:15exact static/source gate argv in VBNV75-final-gates.json. Result:15/15pass,VBNV75-final-gate-N.log;registry build separately passed. Scope: all intentional code/test/paired-record paths,typecheck,lint/format,docs,deps,size,tree,provenance,resources,invariants/parity,static,doctor,routing,diff. VBNV75-hashes.json binds final source/record paths to reviewed commit. Task7after checkpoint;no full suite due. Second and last task;finish and pause goal.
  Rollback Plan: "Revert only this task commits;preserve first task and prior work."
  Findings: |-
    Pinned TabControl consumes Mod1 Tab/PageUp/PageDown,Left/Right at tab focus and wraps pages. Mod1+Shift+PageDown remains unhandled. Browser capture routes original shortcuts before page spin widgets;actual tab/page state and native tab deactivation/output remain authoritative. Paragraph uses a native browser form for Enter and mounted tab IDs/refs;Page Style and Break focus actual mounted controls. Original keyed controller completion/cancellation returns focus to the mounted frame,without global IDs,timers or a second request model.
    Paragraph backdrop cancellation was removed. Browser evidence exposed backdrop pointer focus escaping the modal,so actual background mouse-down now prevents default focus transfer in all3represented formatting dialogs,while child controls retain their input behavior. Escape then reaches the active modal and cancels only its original request.
    Initial browser fixtures had non-exact metric labels matching spin buttons and assumed a split paragraph retained the first paragraph accessible name;selectors now use exact spinbutton and actual Writer paragraph2 identities. A DOM-only diagnostic confirmed that hard-break acceptance already focused the real editing host and caret in paragraph2;no async focus workaround or kernel change was introduced. Diagnostic injection was removed from the final test. Earlier failures remain in original logs. An initial nonexistent tab-session filename filter was replaced by actual WriterNativeTabulatorDialog/native-tab-page-acceptance tests in the final run.
    Full VCL widget/modal/focus-trap platform services,other formatting features and entire large-owner coverage remain unported/unverified. No broad parity/status promotion,network,merge or full suite. Both requested tasks are implemented;finish this second task and pause goal.
id_source: "generated"
---
## Summary

Canonize represented formatting dialog keyboard,tab and focus lifetime through actual Writer requests.

## Scope

Only writer checkout/branch;up to24primary paths plus paired records. Paragraph,Page Style,Insert Break keyboard/focus and consumed tab navigation only;no new formatting/kernel features or full native widget system,network or full suite. Second and last task;pause goal after closure.

## Plan

Extract native TabControl key-direction decisions from tabctrl.cxx with wraparound using actual tabs. Wire Paragraph tab roving focus/ARIA identity,Left/Right and primary-modifier Tab/PageUp/PageDown navigation before metric spin keys,retaining original tab deactivation and drafts. Use a real Paragraph form for default Enter acceptance;Escape cancels and backdrop clicks retain request. Focus mounted controls on opening Page Style/Insert Break and add missing Escape. Complete/cancel original keyed requests then return focus through actual frame port. Verify source decisions,dialog/view tests and production Chromium1280/390 with history/ODT/draft retention;update records,verify,evaluate,close and pause goal.

## Verify Steps

Focused Vitest source tab navigation strict100coverage plus Paragraph,Page Style,Insert Break,actual view/entrypoints/tab-session tests;exercise new owner paths without ignores/threshold reduction. Cover native shortcut directions/wrap,unhandled keys,Shift+PageDown asymmetry,roving tab focus/ARIA,mounted instance focus,CtrlPageDown from metric without metric mutation,retained native tab changes,Enter accept,Escape cancel,backdrop persistence and actual document focus after each request. Build and production Chromium1280/390 keyboard/model/history/ODT flows,screenshot inspection,no page errors. Typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean state. Task7after checkpoint;no full suite due. Evaluator pass,finish second task,pause goal.

## Verification

Command (apps/office): npx vitest run src/vcl/source/control/tabctrl.test.ts src/sw/browser/presentation/WriterParagraphDialog.test.tsx src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterInsertBreakDialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterNativeTabulatorDialog.test.tsx src/sw/source/uibase/shells/native-tab-page-acceptance.test.ts --coverage --coverage.include=src/vcl/source/control/tabctrl.ts --coverage.reportsDirectory=coverage/VBNV75-final.
Result: pass,49cases/8files,VBNV75-coverage-final.log;strict new source owner100coverage S12/B20/F1/L8,zero skips/no ignores or lowered thresholds. Scope: native direction/shortcut branches,unhandled keys,roving tab IDs/focus,native deactivation/session retention,original request acceptance/cancellation and existing page/metric/view paths. Existing large UI owners are exercised,not claimed wholly100covered.
Command:npm run test:writer -- src/sw/browser/presentation/WriterNativeTabulatorDialog.test.tsx src/sw/source/uibase/shells/native-tab-page-acceptance.test.ts src/sw/browser/presentation/writer-view-document-key.test.tsx src/sw/browser/presentation/writer-paragraph-toolbar.test.tsx.
Result: pass,37cases/4files,VBNV75-consumers.log. Scope: actual tab exchange,paragraph/core/history and document-key modal ownership.
Command:npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-formatting-dialog-keys.spec.ts apps/office/e2e/writer-paragraph-split-controls.spec.ts.
Result: pass,4production Chromium cases1280/390,VBNV75-build-complete.log/VBNV75-e2e-last.log;no page errors. Inspected VBNV75-tabs screenshots at both widths. Scope: CtrlPageDown before spin keys,tab wrapping,retained authored tabs,Enter/Escape,backdrop retaining modal focus in all3dialogs,actual document typing after cancel/accept including a new hard-break paragraph,first-task undo/redo/ODT replay and actual ODT export of accepted spacing/tabs/break.
Command:15exact static/source gate argv in VBNV75-final-gates.json. Result:15/15pass,VBNV75-final-gate-N.log;registry build separately passed. Scope: all intentional code/test/paired-record paths,typecheck,lint/format,docs,deps,size,tree,provenance,resources,invariants/parity,static,doctor,routing,diff. VBNV75-hashes.json binds final source/record paths to reviewed commit. Task7after checkpoint;no full suite due. Second and last task;finish and pause goal.

## Rollback Plan

Revert only this task commits;preserve first task and prior work.

## Findings

Pinned TabControl consumes Mod1 Tab/PageUp/PageDown,Left/Right at tab focus and wraps pages. Mod1+Shift+PageDown remains unhandled. Browser capture routes original shortcuts before page spin widgets;actual tab/page state and native tab deactivation/output remain authoritative. Paragraph uses a native browser form for Enter and mounted tab IDs/refs;Page Style and Break focus actual mounted controls. Original keyed controller completion/cancellation returns focus to the mounted frame,without global IDs,timers or a second request model.
Paragraph backdrop cancellation was removed. Browser evidence exposed backdrop pointer focus escaping the modal,so actual background mouse-down now prevents default focus transfer in all3represented formatting dialogs,while child controls retain their input behavior. Escape then reaches the active modal and cancels only its original request.
Initial browser fixtures had non-exact metric labels matching spin buttons and assumed a split paragraph retained the first paragraph accessible name;selectors now use exact spinbutton and actual Writer paragraph2 identities. A DOM-only diagnostic confirmed that hard-break acceptance already focused the real editing host and caret in paragraph2;no async focus workaround or kernel change was introduced. Diagnostic injection was removed from the final test. Earlier failures remain in original logs. An initial nonexistent tab-session filename filter was replaced by actual WriterNativeTabulatorDialog/native-tab-page-acceptance tests in the final run.
Full VCL widget/modal/focus-trap platform services,other formatting features and entire large-owner coverage remain unported/unverified. No broad parity/status promotion,network,merge or full suite. Both requested tasks are implemented;finish this second task and pause goal.
