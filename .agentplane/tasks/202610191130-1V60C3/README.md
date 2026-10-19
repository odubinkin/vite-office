---
id: "202610191130-1V60C3"
title: "Implement native shared menubar pointer rollover and first-move admission"
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
  updated_at: "2026-10-19T11:30:55.416Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T11:42:47.870Z"
  updated_by: "CODER"
  note: "Source-backed common root menubar motion/highlight lifetime implemented;20files196related tests and111files299Calc tests pass with raw100 S/B/F/L;25browser cases pass at1280/390;all declared deterministic checks pass. See task verification.md and evidence. Full native GUI/platform and broader goal remain unverified;next full40."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-19T11:43:38.193Z"
  updated_by: "EVALUATOR"
  note: "Reviewed681b1333a4a8:approved shared-root pointer scope implemented and independently checked against pinned native ordering,complete raw owner coverage and actual browser consumers."
  evaluated_sha: "681b1333a4a8426395d1b9a8c0521129426336a0"
  blueprint_digest: "76b6a80ebd68458abbabcb6036637b8f22ba6c40275986b8f859ec503e201be8"
  evidence_refs:
    - ".agentplane/tasks/202610191130-1V60C3/README.md"
    - ".agentplane/tasks/202610191130-1V60C3/quality/20261019-114338193-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610191130-1V60C3/quality/20261019-114338193-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610191130-1V60C3/quality/20261019-114338193-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610191130-1V60C3/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610191130-1V60C3/verification.md"
    - ".agentplane/tasks/202610191130-1V60C3/evidence/source-audit.json"
    - ".agentplane/tasks/202610191130-1V60C3/evidence/menu-coverage-final.json"
    - ".agentplane/tasks/202610191130-1V60C3/evidence/browser-final.log"
  findings:
    - "Actual common Writer/Calc component owns constructor/creation first-move lifetime,separate rollover/highlight and floating-window filtering;no duplicate presenter or fabricated command state. Source Paint priority and unopened keyboard selection are represented. Existing assertions remain and fixture migrations use actual movement. Complete two-owner raw coverage100,wholeCalc100 and final25browser cases pass.11non-task paths remain within approved20."
commit: null
comments:
  -
    author: "CODER"
    body: "Start:implement shared source-shaped root menubar motion,rollover and per-popup first-move suppression with exact source-backed browser tests."
events:
  -
    type: "status"
    at: "2026-10-19T11:30:56.590Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement shared source-shaped root menubar motion,rollover and per-popup first-move suppression with exact source-backed browser tests."
  -
    type: "verify"
    at: "2026-10-19T11:42:47.870Z"
    author: "CODER"
    state: "ok"
    note: "Source-backed common root menubar motion/highlight lifetime implemented;20files196related tests and111files299Calc tests pass with raw100 S/B/F/L;25browser cases pass at1280/390;all declared deterministic checks pass. See task verification.md and evidence. Full native GUI/platform and broader goal remain unverified;next full40."
doc_version: 3
doc_updated_at: "2026-10-19T11:42:47.948Z"
doc_updated_by: "CODER"
description: "Task31 of approved Calc UI goal:port MenuBarWindow root pointer MouseMove/leave/rollover/first-move ordering into existing shared Writer/Calc CommandMenuBar. Ignore enter-only events and floating-child motion;closed-bar movement highlights without opening or consuming first-move flag;active-bar movement updates rollover then suppresses first motion after every root popup creation;later valid changed roots open immediately. Leave clears rollover without opening/consuming the flag. Preserve current resource/focus/keyboard/click/overflow ownership and shared Writer visual classes. Add source-backed logical rollover/active root styling. No duplicate Calc menu or fake defaults. Bound root-only scope;popup timers remain existing shared owner,mnemonics/platform rendering and full UI/core parity pending. WholeCalc100,entire changed shared owners100,related menu tests and real desktop/mobile Writer/Calc browser checks;types/build/static/style/docs/tree/provenance/inventories/doctor/routing. Only calc/offline,no merge;next full40."
sections:
  Summary: |-
    Implement native shared menubar pointer rollover and first-move admission

    Task31 of approved Calc UI goal:port MenuBarWindow root pointer MouseMove/leave/rollover/first-move ordering into existing shared Writer/Calc CommandMenuBar. Ignore enter-only events and floating-child motion;closed-bar movement highlights without opening or consuming first-move flag;active-bar movement updates rollover then suppresses first motion after every root popup creation;later valid changed roots open immediately. Leave clears rollover without opening/consuming the flag. Preserve current resource/focus/keyboard/click/overflow ownership and shared Writer visual classes. Add source-backed logical rollover/active root styling. No duplicate Calc menu or fake defaults. Bound root-only scope;popup timers remain existing shared owner,mnemonics/platform rendering and full UI/core parity pending. WholeCalc100,entire changed shared owners100,related menu tests and real desktop/mobile Writer/Calc browser checks;types/build/static/style/docs/tree/provenance/inventories/doctor/routing. Only calc/offline,no merge;next full40.
  Scope: |-
    - In scope: Task31 of approved Calc UI goal:port MenuBarWindow root pointer MouseMove/leave/rollover/first-move ordering into existing shared Writer/Calc CommandMenuBar. Ignore enter-only events and floating-child motion;closed-bar movement highlights without opening or consuming first-move flag;active-bar movement updates rollover then suppresses first motion after every root popup creation;later valid changed roots open immediately. Leave clears rollover without opening/consuming the flag. Preserve current resource/focus/keyboard/click/overflow ownership and shared Writer visual classes. Add source-backed logical rollover/active root styling. No duplicate Calc menu or fake defaults. Bound root-only scope;popup timers remain existing shared owner,mnemonics/platform rendering and full UI/core parity pending. WholeCalc100,entire changed shared owners100,related menu tests and real desktop/mobile Writer/Calc browser checks;types/build/static/style/docs/tree/provenance/inventories/doctor/routing. Only calc/offline,no merge;next full40.
    - Out of scope: unrelated refactors not required for "Implement native shared menubar pointer rollover and first-move admission".
  Plan: "Replace root mouseenter switching in the actual shared CommandMenuBar with original MenuBarWindow motion/leave ordering and real rollover state. Reset first-move suppression on each real root popup creation,not on closed motion,leave or nested popup changes. Filter separate floating popup events;root blank motion is an invalid native position. Preserve click/keyboard/focus/resource and overflow ownership. Reuse existing Writer trigger styles with logical rollover and active-popup attributes;do not introduce another Calc presenter. Up to20non-task paths for renderer/style,source-backed tests/browser fixture migrations and accurate browser-adaptation registry evidence. Full native mnemonic/platform/MouseSettings and all broader attribute/kernel/UI responsibilities remain explicit pending work. Source audit of original constructor,ImplCreatePopup,MouseMove and render ordering;entire changed shared owners and wholeCalc raw100;related menus,real Writer/Calc1280/390motion and focus/saved-owner/click acceptance;all declared deterministic gates. Existing user approval covers this safe local leaf;only calc/offline/no merge,next full40."
  Verify Steps: "Audit pinned original MenuBarWindow constructor and ImplCreatePopup first-move resets,MouseMove enter/synthetic/leave/closed/active ordering,invalid/same position rules and highlighted/rollover render contract. Owned shared component tests must cover enter-only noop,closed rollover without open/flag consumption,first active motion suppressed,subsequent sibling switch,reset on pointer/keyboard root creation,invalid position consuming flag,leave clearing rollover without consumption,floating-child events excluded,click immediate and existing saved focus/overflow behavior. Entire CommandMenuBar and menubar-overflow scopes raw100 S/B/F/L and wholeCalc100;related menu/Writer callers;real browser Writer/Calc at1280/390with actual pointer moves and logical visual attributes. Types/build/static/changedstyle/docs/size/tree/dependencies/provenance/resources/scopedinventories/doctor/routing;no policy/threshold/timeout weakening. Add canonical upstream ledger entry only for genuine new source suspicion while preserving behavior. Full regression next40."
  Verification: |-
    - Command: source audit of pinned vendor/libreoffice-reference/vcl/source/window/menubarwindow.cxx constructor,ImplCreatePopup,MouseMove,ChangeHighlightItem,KEY_MENU,GetFocus and Paint. Result: pass. Evidence: evidence/source-audit.json anchors and original SHA256. Scope: actual first-motion lifetime,invalid/enter/leave ordering,keyboard-highlight-without-popup and Paint priority. Original compiled VCL GUI was not executed;browser events have no portable native IsSynthetic marker. No newly suspected upstream bug;canonical ledger unchanged.

    - Command: npm run test:coverage -- --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/menubar-overflow.tsx --coverage.reportsDirectory=coverage/task31-menu src/framework/browser/presentation src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/native-menubar src/sw/browser/presentation/native-empty-menubar.test.tsx src/sw/browser/presentation/native-disabled-menubar.test.tsx src/sw/browser/editor/native-context-menu.test.tsx (apps/office). Result: pass. Evidence: evidence/menu-coverage-final.log,menu-coverage-final.json,menu-coverage-summary.json;20files196cases. Scope: both complete changed shared owners raw S336/336 B293/293 F73/73 L303/303,100percent each;every raw statement/function/branch counter positive. Checks closed rollover,enter-only noop,first active motion,invalid/same positions,each popup reset,leave without consumption,separate floating windows,nested creation without root reset,keyboard-only highlight,click/focus/overflow ownership and existing Writer callers. No new exclusion,timeout or threshold change.

    - Command: npm run test:coverage:calc (apps/office). Result: pass. Evidence: evidence/calc-coverage.log,calc-coverage-summary.json;111files299cases,124.27s. Scope: wholeCalc raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each,zero skipped counters.

    - Command: npx playwright test menubar-pointer.spec.ts popup-pointer.spec.ts menubar-overflow.spec.ts writer-menu-alignment.spec.ts writer-root-menu-focus.spec.ts writer-menu-saved-focus.spec.ts writer-menu-key.spec.ts --config apps/office/playwright.config.ts --project shared --project writer. Result: pass. Evidence: evidence/browser-final.log;all25cases in one final30s invocation,zero skips/retries. Scope: actual Chromium Writer/Calc1280/390,real root and child pointer movement,first-motion admission,active/rollover CSS priority,unopened keyboard highlight,click toggles,root/child focus,editor/dialog ownership and actual overflow parent. All four screenshot files inspected and retained under evidence/visual with hashes. Both apps retain Writer typography,padding,slate root highlight and popup/accelerator styling;long Calc Edit content stays within viewport. Full native theme/geometry/platform parity remains unclaimed.

    - Command: npm run typecheck;npm run build;node scripts/check-static-build.mjs. Result: pass. Evidence: evidence/types.log,build.log,static.log,verified-source-dist-hashes.json. Scope: full tools/app types and actual production runtime/static assets. Runtime source and built dist were unchanged during all final browser checks. Existing large bundle warning remains.

    - Command: changed-path Prettier/eslint;npm run check:docs/check:file-size/check:source-tree/check:dependencies/check:source-provenance;writer/Calc resource checks;all three scoped inventories;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check. Result: pass. Evidence: evidence/style-final.log,docs-final.log2325authoredsources,size.log,tree.log114required33retired,dependencies.log872sources3761imports125edges,provenance-final.log873modules(749mapped106browser18infra),resource logs,inventory-{shared,calc,writer}.json each semanticViolationCount0,doctor.log,routing.log. Inventory archives preserve exact original bytes via gzip/base64 and SHA256. Scope: all11intentional non-task paths. Existing doctor hook-readiness warning remains;no hook or validator mutation. Only bounded changed-path lint was required here;task30 documents pre-existing ignored-output full-root lint failures.

    Initial diagnostics are retained. An accidental root-directory Vitest invocation used the tooling environment and failed with document undefined;the declared app invocation then passed. Initial new browser fixtures assumed a click produces no mousemove and that F10 resets admission. Real browser traces plus the original source disproved both assumptions;fixtures now use explicit real movements and preserve the consumed flag across F10. Production behavior was not weakened to satisfy those expectations. All related final checks pass without artificial sleeps or forced clicks.

    Task31 of approved goal. Previous full regression30;next40. Native mouse-button-down contracts,mnemonics,platform MouseSettings/event synthesis and full VCL/theme parity remain pending. Original attribute/pool/core and wider Calc UI requirements remain active. Only calc checkout/branch,offline,no merge/publication.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T11:42:47.870Z — VERIFY — ok

    By: CODER

    Note: Source-backed common root menubar motion/highlight lifetime implemented;20files196related tests and111files299Calc tests pass with raw100 S/B/F/L;25browser cases pass at1280/390;all declared deterministic checks pass. See task verification.md and evidence. Full native GUI/platform and broader goal remain unverified;next full40.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T11:42:30.629Z, excerpt_hash=sha256:53742632ec0bac447ea4a1b9941ba8ce9d909a86887a62c1ff81fda67c8670ed

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191130-1V60C3/blueprint/resolved-snapshot.json
    - old_digest: 76b6a80ebd68458abbabcb6036637b8f22ba6c40275986b8f859ec503e201be8
    - current_digest: 76b6a80ebd68458abbabcb6036637b8f22ba6c40275986b8f859ec503e201be8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191130-1V60C3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610191130-1V60C3 -m 🧩 1V60C3 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task shared root pointer/style,test/browser and provenance paths;preserve popup pointer timers,source contracts,upstream ledger and unrelated user/task changes. No reset,branch switch,network or merge."
  Findings: "Actual original Paint prioritizes highlighted roots over rollover. Highlighted item is independent of popup existence;keyboard activation suppresses auto-popup,and F10 does not reset first-motion state. Existing shared owner now carries that distinction. Browser diagnostics repaired fixture-only assumptions about generated move/click ordering and F10 lifetime;no runtime shortcut,timeout change or new ignore. Native GUI execution,event synthesis,mnemonics,mouse-button-down and broader core/UI remain unverified. No newly suspected upstream defect;ledger unchanged. Last full30,next40."
id_source: "generated"
---
## Summary

Implement native shared menubar pointer rollover and first-move admission

Task31 of approved Calc UI goal:port MenuBarWindow root pointer MouseMove/leave/rollover/first-move ordering into existing shared Writer/Calc CommandMenuBar. Ignore enter-only events and floating-child motion;closed-bar movement highlights without opening or consuming first-move flag;active-bar movement updates rollover then suppresses first motion after every root popup creation;later valid changed roots open immediately. Leave clears rollover without opening/consuming the flag. Preserve current resource/focus/keyboard/click/overflow ownership and shared Writer visual classes. Add source-backed logical rollover/active root styling. No duplicate Calc menu or fake defaults. Bound root-only scope;popup timers remain existing shared owner,mnemonics/platform rendering and full UI/core parity pending. WholeCalc100,entire changed shared owners100,related menu tests and real desktop/mobile Writer/Calc browser checks;types/build/static/style/docs/tree/provenance/inventories/doctor/routing. Only calc/offline,no merge;next full40.

## Scope

- In scope: Task31 of approved Calc UI goal:port MenuBarWindow root pointer MouseMove/leave/rollover/first-move ordering into existing shared Writer/Calc CommandMenuBar. Ignore enter-only events and floating-child motion;closed-bar movement highlights without opening or consuming first-move flag;active-bar movement updates rollover then suppresses first motion after every root popup creation;later valid changed roots open immediately. Leave clears rollover without opening/consuming the flag. Preserve current resource/focus/keyboard/click/overflow ownership and shared Writer visual classes. Add source-backed logical rollover/active root styling. No duplicate Calc menu or fake defaults. Bound root-only scope;popup timers remain existing shared owner,mnemonics/platform rendering and full UI/core parity pending. WholeCalc100,entire changed shared owners100,related menu tests and real desktop/mobile Writer/Calc browser checks;types/build/static/style/docs/tree/provenance/inventories/doctor/routing. Only calc/offline,no merge;next full40.
- Out of scope: unrelated refactors not required for "Implement native shared menubar pointer rollover and first-move admission".

## Plan

Replace root mouseenter switching in the actual shared CommandMenuBar with original MenuBarWindow motion/leave ordering and real rollover state. Reset first-move suppression on each real root popup creation,not on closed motion,leave or nested popup changes. Filter separate floating popup events;root blank motion is an invalid native position. Preserve click/keyboard/focus/resource and overflow ownership. Reuse existing Writer trigger styles with logical rollover and active-popup attributes;do not introduce another Calc presenter. Up to20non-task paths for renderer/style,source-backed tests/browser fixture migrations and accurate browser-adaptation registry evidence. Full native mnemonic/platform/MouseSettings and all broader attribute/kernel/UI responsibilities remain explicit pending work. Source audit of original constructor,ImplCreatePopup,MouseMove and render ordering;entire changed shared owners and wholeCalc raw100;related menus,real Writer/Calc1280/390motion and focus/saved-owner/click acceptance;all declared deterministic gates. Existing user approval covers this safe local leaf;only calc/offline/no merge,next full40.

## Verify Steps

Audit pinned original MenuBarWindow constructor and ImplCreatePopup first-move resets,MouseMove enter/synthetic/leave/closed/active ordering,invalid/same position rules and highlighted/rollover render contract. Owned shared component tests must cover enter-only noop,closed rollover without open/flag consumption,first active motion suppressed,subsequent sibling switch,reset on pointer/keyboard root creation,invalid position consuming flag,leave clearing rollover without consumption,floating-child events excluded,click immediate and existing saved focus/overflow behavior. Entire CommandMenuBar and menubar-overflow scopes raw100 S/B/F/L and wholeCalc100;related menu/Writer callers;real browser Writer/Calc at1280/390with actual pointer moves and logical visual attributes. Types/build/static/changedstyle/docs/size/tree/dependencies/provenance/resources/scopedinventories/doctor/routing;no policy/threshold/timeout weakening. Add canonical upstream ledger entry only for genuine new source suspicion while preserving behavior. Full regression next40.

## Verification

- Command: source audit of pinned vendor/libreoffice-reference/vcl/source/window/menubarwindow.cxx constructor,ImplCreatePopup,MouseMove,ChangeHighlightItem,KEY_MENU,GetFocus and Paint. Result: pass. Evidence: evidence/source-audit.json anchors and original SHA256. Scope: actual first-motion lifetime,invalid/enter/leave ordering,keyboard-highlight-without-popup and Paint priority. Original compiled VCL GUI was not executed;browser events have no portable native IsSynthetic marker. No newly suspected upstream bug;canonical ledger unchanged.

- Command: npm run test:coverage -- --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/menubar-overflow.tsx --coverage.reportsDirectory=coverage/task31-menu src/framework/browser/presentation src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/native-menubar src/sw/browser/presentation/native-empty-menubar.test.tsx src/sw/browser/presentation/native-disabled-menubar.test.tsx src/sw/browser/editor/native-context-menu.test.tsx (apps/office). Result: pass. Evidence: evidence/menu-coverage-final.log,menu-coverage-final.json,menu-coverage-summary.json;20files196cases. Scope: both complete changed shared owners raw S336/336 B293/293 F73/73 L303/303,100percent each;every raw statement/function/branch counter positive. Checks closed rollover,enter-only noop,first active motion,invalid/same positions,each popup reset,leave without consumption,separate floating windows,nested creation without root reset,keyboard-only highlight,click/focus/overflow ownership and existing Writer callers. No new exclusion,timeout or threshold change.

- Command: npm run test:coverage:calc (apps/office). Result: pass. Evidence: evidence/calc-coverage.log,calc-coverage-summary.json;111files299cases,124.27s. Scope: wholeCalc raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each,zero skipped counters.

- Command: npx playwright test menubar-pointer.spec.ts popup-pointer.spec.ts menubar-overflow.spec.ts writer-menu-alignment.spec.ts writer-root-menu-focus.spec.ts writer-menu-saved-focus.spec.ts writer-menu-key.spec.ts --config apps/office/playwright.config.ts --project shared --project writer. Result: pass. Evidence: evidence/browser-final.log;all25cases in one final30s invocation,zero skips/retries. Scope: actual Chromium Writer/Calc1280/390,real root and child pointer movement,first-motion admission,active/rollover CSS priority,unopened keyboard highlight,click toggles,root/child focus,editor/dialog ownership and actual overflow parent. All four screenshot files inspected and retained under evidence/visual with hashes. Both apps retain Writer typography,padding,slate root highlight and popup/accelerator styling;long Calc Edit content stays within viewport. Full native theme/geometry/platform parity remains unclaimed.

- Command: npm run typecheck;npm run build;node scripts/check-static-build.mjs. Result: pass. Evidence: evidence/types.log,build.log,static.log,verified-source-dist-hashes.json. Scope: full tools/app types and actual production runtime/static assets. Runtime source and built dist were unchanged during all final browser checks. Existing large bundle warning remains.

- Command: changed-path Prettier/eslint;npm run check:docs/check:file-size/check:source-tree/check:dependencies/check:source-provenance;writer/Calc resource checks;all three scoped inventories;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check. Result: pass. Evidence: evidence/style-final.log,docs-final.log2325authoredsources,size.log,tree.log114required33retired,dependencies.log872sources3761imports125edges,provenance-final.log873modules(749mapped106browser18infra),resource logs,inventory-{shared,calc,writer}.json each semanticViolationCount0,doctor.log,routing.log. Inventory archives preserve exact original bytes via gzip/base64 and SHA256. Scope: all11intentional non-task paths. Existing doctor hook-readiness warning remains;no hook or validator mutation. Only bounded changed-path lint was required here;task30 documents pre-existing ignored-output full-root lint failures.

Initial diagnostics are retained. An accidental root-directory Vitest invocation used the tooling environment and failed with document undefined;the declared app invocation then passed. Initial new browser fixtures assumed a click produces no mousemove and that F10 resets admission. Real browser traces plus the original source disproved both assumptions;fixtures now use explicit real movements and preserve the consumed flag across F10. Production behavior was not weakened to satisfy those expectations. All related final checks pass without artificial sleeps or forced clicks.

Task31 of approved goal. Previous full regression30;next40. Native mouse-button-down contracts,mnemonics,platform MouseSettings/event synthesis and full VCL/theme parity remain pending. Original attribute/pool/core and wider Calc UI requirements remain active. Only calc checkout/branch,offline,no merge/publication.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T11:42:47.870Z — VERIFY — ok

By: CODER

Note: Source-backed common root menubar motion/highlight lifetime implemented;20files196related tests and111files299Calc tests pass with raw100 S/B/F/L;25browser cases pass at1280/390;all declared deterministic checks pass. See task verification.md and evidence. Full native GUI/platform and broader goal remain unverified;next full40.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T11:42:30.629Z, excerpt_hash=sha256:53742632ec0bac447ea4a1b9941ba8ce9d909a86887a62c1ff81fda67c8670ed

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191130-1V60C3/blueprint/resolved-snapshot.json
- old_digest: 76b6a80ebd68458abbabcb6036637b8f22ba6c40275986b8f859ec503e201be8
- current_digest: 76b6a80ebd68458abbabcb6036637b8f22ba6c40275986b8f859ec503e201be8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191130-1V60C3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610191130-1V60C3 -m 🧩 1V60C3 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task shared root pointer/style,test/browser and provenance paths;preserve popup pointer timers,source contracts,upstream ledger and unrelated user/task changes. No reset,branch switch,network or merge.

## Findings

Actual original Paint prioritizes highlighted roots over rollover. Highlighted item is independent of popup existence;keyboard activation suppresses auto-popup,and F10 does not reset first-motion state. Existing shared owner now carries that distinction. Browser diagnostics repaired fixture-only assumptions about generated move/click ordering and F10 lifetime;no runtime shortcut,timeout change or new ignore. Native GUI execution,event synthesis,mnemonics,mouse-button-down and broader core/UI remain unverified. No newly suspected upstream defect;ledger unchanged. Last full30,next40.
