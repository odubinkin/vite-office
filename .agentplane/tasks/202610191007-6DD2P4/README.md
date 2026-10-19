---
id: "202610191007-6DD2P4"
title: "Implement shared native popup pointer admission and submenu timers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T10:08:21.310Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T10:33:11.202Z"
  updated_by: "CODER"
  note: "Original pinned pointer/timer/default source audit passes;actual shared renderer and new pointer owner raw100 S337 B284 F78 L302 with20files191cases. WholeCalc111files299cases raw100 S6823 B4390 F1410 L6112. Expanded related UI cases accounted across951passes and repaired native-chain10case replay;all21targeted browser cases accounted,plus final4case visual/disabled acceptance and four persisted screenshots. Types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing pass. Nineteen intentional non-task paths,no guard or threshold weakening;full regression30."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start:implement shared original popup pointer movement admission and150ms submenu timer behavior without changing resource or command ownership."
events:
  -
    type: "status"
    at: "2026-10-19T10:08:26.816Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement shared original popup pointer movement admission and150ms submenu timer behavior without changing resource or command ownership."
  -
    type: "verify"
    at: "2026-10-19T10:33:11.202Z"
    author: "CODER"
    state: "ok"
    note: "Original pinned pointer/timer/default source audit passes;actual shared renderer and new pointer owner raw100 S337 B284 F78 L302 with20files191cases. WholeCalc111files299cases raw100 S6823 B4390 F1410 L6112. Expanded related UI cases accounted across951passes and repaired native-chain10case replay;all21targeted browser cases accounted,plus final4case visual/disabled acceptance and four persisted screenshots. Types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing pass. Nineteen intentional non-task paths,no guard or threshold weakening;full regression30."
doc_version: 3
doc_updated_at: "2026-10-19T10:33:11.281Z"
doc_updated_by: "CODER"
description: "Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30."
sections:
  Summary: |-
    Implement shared native popup pointer admission and submenu timers

    Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.
  Scope: |-
    - In scope: Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.
    - Out of scope: unrelated refactors not required for "Implement shared native popup pointer admission and submenu timers".
  Plan: "Implement source-shaped popup pointer admission in one shared browser module and reuse it from the existing Writer/Calc CommandMenuPopup. Borrow actual mounted popup/entry DOM and original menu resources,retain original ChangeHighlightItem/HighlightChanged/SubmenuClose responsibilities,ignore enter-only events and first real move,delay hover admission and different-child closure by original150ms default,retain active child on parent leave at its original highlighted entry,cancel child-close on reentry,and dispose timers with popup lifetime. Keep keyboard and existing click paths immediate;root menubar pointer/mnemonics,full platform MouseSettings and native click-down parity remain explicitly pending. Use shared selected/highlight helpers and original command/focus dispatch owners;no Calc duplication or separate visual stack. Up to20non-task paths for shared source/helper,related tests,e2e and truthful foundation/unverified registry records,plus canonical ledger only for actual new upstream suspicions. Validate original source anchors and browser-backed state/timing traces,new/shared complete raw100,related menu/Writer/Calc tests and wholeCalc100;run targeted browser pointer/focus tests,types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing. Existing user approval applies,only calc/offline/no merge,next full30."
  Verify Steps: "Check pinned original MenuFloatingWindow MouseMove,ChangeHighlightItem,HighlightChanged,SubmenuClose,destruction and MouseSettings default150 source anchors. Real shared popup tests must cover enter/first-move suppression,exact149/150ms admission,no hover preselection,keyboard/click immediacy,sibling/leaf/disabled transitions,retained active child on parent leave,delayed different-child close,reentry cancellation,empty/invalid highlighted entry,timer cleanup on close/unmount and nested ownership. Entire new module and full touched shared renderer raw100 S/B/F/L with related existing menu/Writer/Calc tests;wholeCalc100. Targeted actual-browser shared Writer/Calc pointer/focus acceptance and related existing menu browser tests. Types/build/static/style/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing;no validation weakening. Record actual suspected upstream issues in canonical ledger without fixing source logic. Full all-app regression next30."
  Verification: |-
    # Task29 verification

    Approved scope:19intentional non-task paths,only calc branch/checkout. The actual shared Writer/Calc menubar now consumes one mounted popup pointer owner. Original resources,Sfx commands,logical selection,keyboard/click and saved-focus owners remain shared. Source-shaped admission ignores enter-only and first-move events;subsequent actual motion selects direct entries,including disabled commands,and starts the original150ms default timer. Timers read current selection;invalid selection returns early. Leaving the highlighted owner of the active child retains it;leaving a different highlight starts the child's parent-close timer. Child motion cancels closure before first-move suppression. Destruction clears timers/listeners. Pointer closure returns focus to the parent popup window without fabricating a parent-entry highlight;keyboard closure retains its existing entry focus contract. Actual selection drives the existing shared visual highlight classes.

    - Command: node .agentplane/tasks/202610191007-6DD2P4/source-audit.mjs. Result: pass. Evidence: source-audit.json;10original anchors,2source hashes,pinned9bc445578031fecf56086729d8e4940c77e14d65. Scope: source constructors/default150,MouseMove leave/first-move/cancellation ordering,ChangeHighlightItem ordering,HighlightChanged invalid/nonempty gates,SubmenuClose and timer shutdown. This is an audit of original pinned source contracts,not an executed native VCL GUI oracle;full native VCL/platform parity remains unverified.

    - Command: npm run test:coverage -- --coverage.include=src/framework/browser/presentation/menu-popup-pointer.ts --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.reportsDirectory=coverage/task29-menu-verified src/framework/browser/presentation src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/native-menubar src/sw/browser/presentation/native-empty-menubar.test.tsx src/sw/browser/presentation/native-disabled-menubar.test.tsx src/sw/browser/editor/native-context-menu.test.tsx (apps/office). Result: pass. Evidence: menu-verified.log,coverage-summary.json;20files191cases;raw S337/337 B284/284 F78/78 L302/302,100percent each. Scope: entire new pointer owner and full touched shared renderer,all first-move/timing/invalid/leave/sibling/leaf/disabled/nested/cleanup gates plus existing command/focus/keyboard/overflow/context geometry contracts. No coverage exclusion,threshold,timeout or guard weakening. The final More geometry fixture uses the actual renderer over measured hidden roots and asserts original indicator/child reachability. A later type-only removal of the Testing Library unsupported exact:true option preserves its default exact-name matching;the same overflow file passes all4cases in overflow-final.log.

    - Command: expanded related UI coverage run across framework presentation,Writer presentation,Writer context menu and Calc presentation;then npx vitest run src/sw/browser/presentation/native-menubar-chain.test.tsx (apps/office). Result: passing evidence accounted across runs. Evidence: related-final.log117passing files/951passing cases of118files952cases,one migrated test missing act import;chain-final.log repairs and passes the entire affected file10cases. Scope: actual shared and both app consumers,including table row/column dialogs,view/modal/document-key focus and original document/model bindings. This does not claim one clean952case invocation. Initial obsolete mouseenter/instant-leave expectations were migrated to real motion+150ms or actual click when the test is about dispatch rather than hover. The initial larger diagnostic output is retained byte-for-byte as gzip/base64 with SHA256 in related-expanded.raw.json. Production source has not changed since the final191case full-coverage run.

    - Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,calc-coverage-summary.json;111files299cases. Scope: wholeCalc raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each;separate run116.32s after heavier related/browser checks completed.

    - Command: npx playwright test popup-pointer.spec.ts writer-submenu-preselection.spec.ts writer-submenu-keyboard.spec.ts writer-root-menu-focus.spec.ts writer-menu-saved-focus.spec.ts menubar-overflow.spec.ts --config apps/office/playwright.config.ts --project shared --project writer;then affected3spec replay;then shared popup-pointer visual acceptance. Result: all21selected browser cases accounted across runs. Evidence: browser-initial.log17pass4fail;browser-final.log all10affected-spec cases pass;browser-disabled-pointer.log4pass;browser-visual.log4pass. Scope: actual Chromium Writer/Calc1280x800and390x800,real mousemove admission,disabled command highlight,unselected hover focus,retained matching parent,sibling switch,keyboard preselection/dismissal,saved editor and new-dialog focus,root/overflow behavior. No force-clicks,artificial sleeps or production shortcuts. Initial fixtures erroneously opened More although Format was visible at390px and crossed a rounded popup corner rather than its content;only fixture geometry and input route were corrected. Saved-focus tests now open by ordinary click because they test dispatch/focus rather than hover.

    - Command: browser screenshot capture and visual inspection. Result: pass. Evidence: visual-evidence.json,visual/*.png,original ignored output/playwright/task29-popup-{writer,calc}-{1280,390}.png. Scope: actual root/submenu fonts,borders,row spacing,selected backgrounds and accelerator captions retain the same shared style. Large native Calc resource lists remain scrollable within the viewport. Core-unimplemented formatting commands remain disabled;no fake command or state is introduced. Full native layout/scroller/theme parity remains unverified.

    - Command: npm run typecheck;npm run typecheck --workspace @vite-office/office;npm run build;node scripts/check-static-build.mjs. Result: pass. Evidence: types-verified.log tools/app pass before the additional geometry test;types-app-verified.log final app pass after its type-only option correction;build.log,static.log. Scope: all tool/app types and final runtime/worker bundle/relative static assets. Subsequent changes were only test/metadata/JSDoc corrections;no runtime change or rebuild during browser execution. Existing large bundle warning remains.

    - Command: changed-path Prettier/eslint;npm run check:docs/check:file-size/check:source-tree/check:dependencies/check:source-provenance;scoped shared+Calc inventories;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --cached --check. Result: pass. Evidence: style-final.log,docs-verified.log2323authoredsources,size-final.log,tree.log114requiredpaths/33retiredroots,dependencies.log872runtime sources/3761relative imports/125allowed edges,provenance.log873modules(749mapped106browser18infra),inventory-shared-final.log,inventory-calc-final.log,doctor.log,routing.log. Scope: all19intentional non-task paths. New exported DOM highlight mutation is explicitly registered in the exhaustive operation inventory;validation itself is unchanged. Large inventory outputs are compacted with original bytes/SHA256,semanticViolationCount0. Doctor retains pre-existing hook-runner-readiness advice without hook mutation.

    No newly suspected upstream bug was identified;canonical ledger remains unchanged. Root menubar first-move/mnemonics,full MouseSettings/configuration,native click-down admission,the distinct existing context-menu timer state and full VCL/ABI/platform behavior remain pending. This leaf improves the actual common menubar popup path without claiming overall UI/core parity. No network,other checkout,merge or publication. Task29;last full regression20,next full30.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T10:33:11.202Z — VERIFY — ok

    By: CODER

    Note: Original pinned pointer/timer/default source audit passes;actual shared renderer and new pointer owner raw100 S337 B284 F78 L302 with20files191cases. WholeCalc111files299cases raw100 S6823 B4390 F1410 L6112. Expanded related UI cases accounted across951passes and repaired native-chain10case replay;all21targeted browser cases accounted,plus final4case visual/disabled acceptance and four persisted screenshots. Types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing pass. Nineteen intentional non-task paths,no guard or threshold weakening;full regression30.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T10:32:32.728Z, excerpt_hash=sha256:8651f1a38df4f194d76943e9b3680c294cd63f4f24281f224f38c24740454bdb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191007-6DD2P4/blueprint/resolved-snapshot.json
    - old_digest: f36cf1407d8b6f5e45e22677dbb54455d239888469b85e6d522cd46d4c47fecb
    - current_digest: f36cf1407d8b6f5e45e22677dbb54455d239888469b85e6d522cd46d4c47fecb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191007-6DD2P4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610191007-6DD2P4 -m 🧩 6DD2P4 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only active task shared pointer/renderer,tests,browser tests and provenance records;preserve prior source contracts,canonical ledger and unrelated task/user changes. No reset,merge,network or other checkout."
  Findings: "Implemented actual shared menubar popup pointer admission and original150ms default timers;source contract audit and real-browser disabled/normal pointer evidence are recorded without claiming native VCL GUI execution. Complete new and touched shared scopes raw100 S337 B284 F78 L302;20files191cases pass. Expanded related118files952cases accounted across951passes and repaired native-chain10case replay. WholeCalc111files299cases raw100. All21targeted browser cases accounted across initial17passes and clean10case affected-spec replay;additional4case disabled and4case visual runs pass. Four screenshots inspected and persisted. Static/type/style/docs/size/tree/provenance/inventories/doctor/routing pass. Moved DOM mutation has a truthful exhaustive inventory record;no validators or thresholds changed. Initial fixture-only errors included root-relative cwd paths,obsolete enter/instant-leave assumptions,missing act import,Testing Library unsupported exact option and browser geometry/root-visibility assumptions;all repaired with original source contracts retained. No new suspected upstream bug or ledger mutation. Root menubar pointer/mnemonics,full MouseSettings/native click-down,the distinct context-menu timer state and broader native UI/core parity remain pending. Only calc/offline/no merge;full regression30 next."
id_source: "generated"
---
## Summary

Implement shared native popup pointer admission and submenu timers

Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.

## Scope

- In scope: Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.
- Out of scope: unrelated refactors not required for "Implement shared native popup pointer admission and submenu timers".

## Plan

Implement source-shaped popup pointer admission in one shared browser module and reuse it from the existing Writer/Calc CommandMenuPopup. Borrow actual mounted popup/entry DOM and original menu resources,retain original ChangeHighlightItem/HighlightChanged/SubmenuClose responsibilities,ignore enter-only events and first real move,delay hover admission and different-child closure by original150ms default,retain active child on parent leave at its original highlighted entry,cancel child-close on reentry,and dispose timers with popup lifetime. Keep keyboard and existing click paths immediate;root menubar pointer/mnemonics,full platform MouseSettings and native click-down parity remain explicitly pending. Use shared selected/highlight helpers and original command/focus dispatch owners;no Calc duplication or separate visual stack. Up to20non-task paths for shared source/helper,related tests,e2e and truthful foundation/unverified registry records,plus canonical ledger only for actual new upstream suspicions. Validate original source anchors and browser-backed state/timing traces,new/shared complete raw100,related menu/Writer/Calc tests and wholeCalc100;run targeted browser pointer/focus tests,types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing. Existing user approval applies,only calc/offline/no merge,next full30.

## Verify Steps

Check pinned original MenuFloatingWindow MouseMove,ChangeHighlightItem,HighlightChanged,SubmenuClose,destruction and MouseSettings default150 source anchors. Real shared popup tests must cover enter/first-move suppression,exact149/150ms admission,no hover preselection,keyboard/click immediacy,sibling/leaf/disabled transitions,retained active child on parent leave,delayed different-child close,reentry cancellation,empty/invalid highlighted entry,timer cleanup on close/unmount and nested ownership. Entire new module and full touched shared renderer raw100 S/B/F/L with related existing menu/Writer/Calc tests;wholeCalc100. Targeted actual-browser shared Writer/Calc pointer/focus acceptance and related existing menu browser tests. Types/build/static/style/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing;no validation weakening. Record actual suspected upstream issues in canonical ledger without fixing source logic. Full all-app regression next30.

## Verification

# Task29 verification

Approved scope:19intentional non-task paths,only calc branch/checkout. The actual shared Writer/Calc menubar now consumes one mounted popup pointer owner. Original resources,Sfx commands,logical selection,keyboard/click and saved-focus owners remain shared. Source-shaped admission ignores enter-only and first-move events;subsequent actual motion selects direct entries,including disabled commands,and starts the original150ms default timer. Timers read current selection;invalid selection returns early. Leaving the highlighted owner of the active child retains it;leaving a different highlight starts the child's parent-close timer. Child motion cancels closure before first-move suppression. Destruction clears timers/listeners. Pointer closure returns focus to the parent popup window without fabricating a parent-entry highlight;keyboard closure retains its existing entry focus contract. Actual selection drives the existing shared visual highlight classes.

- Command: node .agentplane/tasks/202610191007-6DD2P4/source-audit.mjs. Result: pass. Evidence: source-audit.json;10original anchors,2source hashes,pinned9bc445578031fecf56086729d8e4940c77e14d65. Scope: source constructors/default150,MouseMove leave/first-move/cancellation ordering,ChangeHighlightItem ordering,HighlightChanged invalid/nonempty gates,SubmenuClose and timer shutdown. This is an audit of original pinned source contracts,not an executed native VCL GUI oracle;full native VCL/platform parity remains unverified.

- Command: npm run test:coverage -- --coverage.include=src/framework/browser/presentation/menu-popup-pointer.ts --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.reportsDirectory=coverage/task29-menu-verified src/framework/browser/presentation src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/native-menubar src/sw/browser/presentation/native-empty-menubar.test.tsx src/sw/browser/presentation/native-disabled-menubar.test.tsx src/sw/browser/editor/native-context-menu.test.tsx (apps/office). Result: pass. Evidence: menu-verified.log,coverage-summary.json;20files191cases;raw S337/337 B284/284 F78/78 L302/302,100percent each. Scope: entire new pointer owner and full touched shared renderer,all first-move/timing/invalid/leave/sibling/leaf/disabled/nested/cleanup gates plus existing command/focus/keyboard/overflow/context geometry contracts. No coverage exclusion,threshold,timeout or guard weakening. The final More geometry fixture uses the actual renderer over measured hidden roots and asserts original indicator/child reachability. A later type-only removal of the Testing Library unsupported exact:true option preserves its default exact-name matching;the same overflow file passes all4cases in overflow-final.log.

- Command: expanded related UI coverage run across framework presentation,Writer presentation,Writer context menu and Calc presentation;then npx vitest run src/sw/browser/presentation/native-menubar-chain.test.tsx (apps/office). Result: passing evidence accounted across runs. Evidence: related-final.log117passing files/951passing cases of118files952cases,one migrated test missing act import;chain-final.log repairs and passes the entire affected file10cases. Scope: actual shared and both app consumers,including table row/column dialogs,view/modal/document-key focus and original document/model bindings. This does not claim one clean952case invocation. Initial obsolete mouseenter/instant-leave expectations were migrated to real motion+150ms or actual click when the test is about dispatch rather than hover. The initial larger diagnostic output is retained byte-for-byte as gzip/base64 with SHA256 in related-expanded.raw.json. Production source has not changed since the final191case full-coverage run.

- Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,calc-coverage-summary.json;111files299cases. Scope: wholeCalc raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each;separate run116.32s after heavier related/browser checks completed.

- Command: npx playwright test popup-pointer.spec.ts writer-submenu-preselection.spec.ts writer-submenu-keyboard.spec.ts writer-root-menu-focus.spec.ts writer-menu-saved-focus.spec.ts menubar-overflow.spec.ts --config apps/office/playwright.config.ts --project shared --project writer;then affected3spec replay;then shared popup-pointer visual acceptance. Result: all21selected browser cases accounted across runs. Evidence: browser-initial.log17pass4fail;browser-final.log all10affected-spec cases pass;browser-disabled-pointer.log4pass;browser-visual.log4pass. Scope: actual Chromium Writer/Calc1280x800and390x800,real mousemove admission,disabled command highlight,unselected hover focus,retained matching parent,sibling switch,keyboard preselection/dismissal,saved editor and new-dialog focus,root/overflow behavior. No force-clicks,artificial sleeps or production shortcuts. Initial fixtures erroneously opened More although Format was visible at390px and crossed a rounded popup corner rather than its content;only fixture geometry and input route were corrected. Saved-focus tests now open by ordinary click because they test dispatch/focus rather than hover.

- Command: browser screenshot capture and visual inspection. Result: pass. Evidence: visual-evidence.json,visual/*.png,original ignored output/playwright/task29-popup-{writer,calc}-{1280,390}.png. Scope: actual root/submenu fonts,borders,row spacing,selected backgrounds and accelerator captions retain the same shared style. Large native Calc resource lists remain scrollable within the viewport. Core-unimplemented formatting commands remain disabled;no fake command or state is introduced. Full native layout/scroller/theme parity remains unverified.

- Command: npm run typecheck;npm run typecheck --workspace @vite-office/office;npm run build;node scripts/check-static-build.mjs. Result: pass. Evidence: types-verified.log tools/app pass before the additional geometry test;types-app-verified.log final app pass after its type-only option correction;build.log,static.log. Scope: all tool/app types and final runtime/worker bundle/relative static assets. Subsequent changes were only test/metadata/JSDoc corrections;no runtime change or rebuild during browser execution. Existing large bundle warning remains.

- Command: changed-path Prettier/eslint;npm run check:docs/check:file-size/check:source-tree/check:dependencies/check:source-provenance;scoped shared+Calc inventories;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --cached --check. Result: pass. Evidence: style-final.log,docs-verified.log2323authoredsources,size-final.log,tree.log114requiredpaths/33retiredroots,dependencies.log872runtime sources/3761relative imports/125allowed edges,provenance.log873modules(749mapped106browser18infra),inventory-shared-final.log,inventory-calc-final.log,doctor.log,routing.log. Scope: all19intentional non-task paths. New exported DOM highlight mutation is explicitly registered in the exhaustive operation inventory;validation itself is unchanged. Large inventory outputs are compacted with original bytes/SHA256,semanticViolationCount0. Doctor retains pre-existing hook-runner-readiness advice without hook mutation.

No newly suspected upstream bug was identified;canonical ledger remains unchanged. Root menubar first-move/mnemonics,full MouseSettings/configuration,native click-down admission,the distinct existing context-menu timer state and full VCL/ABI/platform behavior remain pending. This leaf improves the actual common menubar popup path without claiming overall UI/core parity. No network,other checkout,merge or publication. Task29;last full regression20,next full30.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T10:33:11.202Z — VERIFY — ok

By: CODER

Note: Original pinned pointer/timer/default source audit passes;actual shared renderer and new pointer owner raw100 S337 B284 F78 L302 with20files191cases. WholeCalc111files299cases raw100 S6823 B4390 F1410 L6112. Expanded related UI cases accounted across951passes and repaired native-chain10case replay;all21targeted browser cases accounted,plus final4case visual/disabled acceptance and four persisted screenshots. Types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing pass. Nineteen intentional non-task paths,no guard or threshold weakening;full regression30.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T10:32:32.728Z, excerpt_hash=sha256:8651f1a38df4f194d76943e9b3680c294cd63f4f24281f224f38c24740454bdb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191007-6DD2P4/blueprint/resolved-snapshot.json
- old_digest: f36cf1407d8b6f5e45e22677dbb54455d239888469b85e6d522cd46d4c47fecb
- current_digest: f36cf1407d8b6f5e45e22677dbb54455d239888469b85e6d522cd46d4c47fecb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191007-6DD2P4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610191007-6DD2P4 -m 🧩 6DD2P4 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only active task shared pointer/renderer,tests,browser tests and provenance records;preserve prior source contracts,canonical ledger and unrelated task/user changes. No reset,merge,network or other checkout.

## Findings

Implemented actual shared menubar popup pointer admission and original150ms default timers;source contract audit and real-browser disabled/normal pointer evidence are recorded without claiming native VCL GUI execution. Complete new and touched shared scopes raw100 S337 B284 F78 L302;20files191cases pass. Expanded related118files952cases accounted across951passes and repaired native-chain10case replay. WholeCalc111files299cases raw100. All21targeted browser cases accounted across initial17passes and clean10case affected-spec replay;additional4case disabled and4case visual runs pass. Four screenshots inspected and persisted. Static/type/style/docs/size/tree/provenance/inventories/doctor/routing pass. Moved DOM mutation has a truthful exhaustive inventory record;no validators or thresholds changed. Initial fixture-only errors included root-relative cwd paths,obsolete enter/instant-leave assumptions,missing act import,Testing Library unsupported exact option and browser geometry/root-visibility assumptions;all repaired with original source contracts retained. No new suspected upstream bug or ledger mutation. Root menubar pointer/mnemonics,full MouseSettings/native click-down,the distinct context-menu timer state and broader native UI/core parity remain pending. Only calc/offline/no merge;full regression30 next.
