---
id: "202610040242-N2HMA6"
title: "Restore managed Sidebar Tab and arrow focus traversal"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T02:46:49.326Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T03:17:49.931Z"
  updated_by: "CODER"
  note: "Full verify0:1042app109inventory53browser2resource,100%app/inventorycoverage0semantic; upstream-absent1042+109+12+53allpassvendorrestored;268oldtestsbyte-identical8semantic6sourcehashescurrent217priorrows2append+1new218; source/helper/frame/decoded artifacts0,doctor0errors2knownwarnings; exact semantic quality pending."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: standing user parity goal; one managed Sidebar Tab/arrows task, no Agentplane sources/helpers and no upstream execution from tests."
events:
  -
    type: "status"
    at: "2026-10-04T02:46:49.751Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing user parity goal; one managed Sidebar Tab/arrows task, no Agentplane sources/helpers and no upstream execution from tests."
  -
    type: "verify"
    at: "2026-10-04T03:17:49.931Z"
    author: "CODER"
    state: "ok"
    note: "Full verify0:1042app109inventory53browser2resource,100%app/inventorycoverage0semantic; upstream-absent1042+109+12+53allpassvendorrestored;268oldtestsbyte-identical8semantic6sourcehashescurrent217priorrows2append+1new218; source/helper/frame/decoded artifacts0,doctor0errors2knownwarnings; exact semantic quality pending."
doc_version: 3
doc_updated_at: "2026-10-04T03:17:49.981Z"
doc_updated_by: "CODER"
description: "Iteration86: restore the source-owned navigation graph of existing Sidebar deck/panel controls, using a scoped focus manager with panel registration, actual display order and native ShowPanel open/expand contract; preserve Escape/Return and registered deviations."
sections:
  Summary: "Iteration 86: restore managed Tab and arrow traversal across the implemented Sidebar deck closer, Properties activation button, panel title, title toolbar and content, following pinned Sfx2 FocusManager."
  Scope: "Eight semantic paths only: SidebarDeck.tsx, SidebarPanel.tsx, new SidebarFocusManager.ts and SidebarFocusManager.test.tsx under apps/office/src/sfx2/browser/presentation; new apps/office/src/sw/browser/presentation/writer-view-sidebar-navigation.test.tsx; new apps/office/e2e/writer-sidebar-navigation.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Preserve all 268 previous tests byte-for-byte, all 217 prior inventory/provenance rows and status/default/owner fields; append evidence/responsibility to Deck and Panel and one local browser manager row (218 rows). Own task metadata and bounded result/hash evidence permitted. No core, resource, policy, exception or save/open/recovery changes. No source or helper scripts in Agentplane."
  Plan: "Use the standing user goal as explicit authorization. First reproduce the missing owned Writer navigation. Add a local manager/context that registers panel references, orders them by actual DOM order and unregisters on teardown. Deck supplies own closer/rail refs and ShowPanel opening. Forward Tab enters toolbar then content, closer Tab (including Shift) enters rail, rail forward Tab enters/expands first panel and opens deck, rail Shift Tab attempts deck title focus without activation. Panel arrows move to previous/next expanded title with deck-title/rail boundaries; rail Up/Down wraps implemented buttons, Left/Right remains unconsumed. Standalone panels, local content keys, existing Enter/Escape and commands remain intact. Verify actual managed composition including reorder/removal and multiple isolated decks. Inspect pinned source read-only; store hashes/conclusions only. Do not invoke pinned upstream from tests, compile it or execute native probes. Run focused checks/build/browser, full verify, then application/script/browser tests with vendor temporarily absent and restore finally. Record exact semantic commit and same-actor quality review; close leaf and append bounded parent progress."
  Verify Steps: "1. Read-only pinned FocusManager/SidebarController/Deck/TabBar/TitleBar/DockingWindow inspection and hash evidence; no source copies. 2. New Writer baseline demonstrates missing Tab/arrows, then focused owned runtime tests and freshly built focused browser tests pass. 3. Scope integrity proves 268 previous test files unchanged, 217 prior rows preserved with only two append-only evidence/responsibility updates plus one manager row; eight semantic paths only. 4. npm run verify passes: application and browser tests, static provenance/resource/inventory audits, coverage 100% and zero semantic module violations. Static CLI audits may read pinned files separately; tests must not. 5. With vendor/libreoffice-reference temporarily renamed inside vendor, npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e all pass; restore vendor finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass (two preexisting doctor warnings only). 7. Ignored-inclusive Agentplane artifact audit reports zero Python/helper/source/archive/embedded diff bodies; exact semantic hash reviewed by EVALUATOR, final clean tracked/untracked state."
  Verification: |-
    Command: new owned Writer baseline; focused managed runtime tests; npm run build; focused Chromium; npm run verify; vendor-absent npm run test, npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts, npm run test:e2e; final integrity; git diff --check; node .agentplane/policy/check-routing.mjs; ap doctor. Result: pass. Evidence: baseline5 owned cases failed on unconsumed navigation; corrected focused39cases/5files and rebuilt2width browser pass. Final full verify exit0:1042app/208files,109inventory/36files,53browser,2resource tests; both app/inventory coverage100% all metrics,semanticViolationCount0. All1042+109+12+53 tests pass with pinned vendor directory absent; restored in finally. Static CLI resource/source-tree/provenance/parity audits separately read pinned metadata/files; app and script tests do not invoke pinned code. Eight semantic hashes and six read-only pinned source hashes current;268 prior tests byte-identical. Prior217manifest rows retained in relative order with only Deck/Panel append-only evidence/responsibility and one lexicographically inserted local-only/unverified browser manager row,218total. No statuses/defaults/owners/exceptions promoted. Final audit2879 Agentplane files zero source/helper/Python/source-frame/archive/embedded implementation/Git-code-diff, including decoded JSON/JSONL; five prose-only historical README/AGENTS diffs classified separately. Routing/diff pass,doctor0errors2preexistingwarnings. Same-actor exact semantic quality and final clean closure pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T03:17:49.931Z — VERIFY — ok

    By: CODER

    Note: Full verify0:1042app109inventory53browser2resource,100%app/inventorycoverage0semantic; upstream-absent1042+109+12+53allpassvendorrestored;268oldtestsbyte-identical8semantic6sourcehashescurrent217priorrows2append+1new218; source/helper/frame/decoded artifacts0,doctor0errors2knownwarnings; exact semantic quality pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T03:17:49.592Z, excerpt_hash=sha256:ee673d0e780f282095f4f8d44fcf1628b1247cb673349c3210ee269199972535

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040242-N2HMA6/blueprint/resolved-snapshot.json
    - old_digest: 536e480ce479f80586417c8fe20facc5a7fe07b02380926ef854f912f579d67d
    - current_digest: 536e480ce479f80586417c8fe20facc5a7fe07b02380926ef854f912f579d67d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040242-N2HMA6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610040242-N2HMA6 -m 🧩 N2HMA6 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the isolated semantic commit if required, retain task result/hash evidence. Offline verification always restores vendor in finally. No history rewriting."
  Findings: "Iteration86 restores the implemented titled-panel Sidebar focus graph under one deck-owned registration manager: forward Tab title/toolbar/content, toolbox Tab regardless of Shift, rail forward/backward Tab, previous/next panel arrows with toolbox/rail boundaries, vertical single-button rail wrap, own ShowPanel opening/expansion, reorder/removal and separate deck ownership. Backward panel Tab, horizontal rail arrows and content keys remain local; existing Escape/Enter/commands verified by unchanged old cases. React refs bind after mount via SetDeck, and DOM visibility flush precedes focus (native ShowPanel follows focus request). Baseline5fail; focused39/2browserpass; full and upstream-absent checks all pass. Initial ref-construction lint rejection fixed without suppression. Initial application coverage1041 revealed two enclosing-key-owner branches, now actual capture-consumed test gives1042/100%. First full pipeline failed new-row ordering, fixed lexical insertion without moving prior rows. Second pipeline passed tests/coverage but found missing cleanup callback JSDoc; corrected comment, third full pipeline exit0. Premature scope check during intentional vendor rename observed temporary offline directory; final exact scope proof after restoration passes, no exclusion or weakened assertion. Independent explicit-user cleanup task202610040259-3B65MX removed91diagnostic source-bearing artifacts (87tracked4ignored) in isolated72102c6ea9ddedf8c5ae90b447437cc3384008a4 and4917d440fe2c action commits. Earlier audit missed source frames and encoded tails, current raw/decoded audits zero source bodies. No upstream sources/helper scripts/native binaries or source-bearing logs added, no native execution. Six source hashes only. F6/settings/other decks/multiple native rail eligibility/titleless-hidden fallback/native focus flags/native scrolling geometry/contexts/native and parent parity remain unverified; no status promotion or added exceptions. Same-actor review only; goal and parent remain active."
id_source: "generated"
---
## Summary

Iteration 86: restore managed Tab and arrow traversal across the implemented Sidebar deck closer, Properties activation button, panel title, title toolbar and content, following pinned Sfx2 FocusManager.

## Scope

Eight semantic paths only: SidebarDeck.tsx, SidebarPanel.tsx, new SidebarFocusManager.ts and SidebarFocusManager.test.tsx under apps/office/src/sfx2/browser/presentation; new apps/office/src/sw/browser/presentation/writer-view-sidebar-navigation.test.tsx; new apps/office/e2e/writer-sidebar-navigation.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Preserve all 268 previous tests byte-for-byte, all 217 prior inventory/provenance rows and status/default/owner fields; append evidence/responsibility to Deck and Panel and one local browser manager row (218 rows). Own task metadata and bounded result/hash evidence permitted. No core, resource, policy, exception or save/open/recovery changes. No source or helper scripts in Agentplane.

## Plan

Use the standing user goal as explicit authorization. First reproduce the missing owned Writer navigation. Add a local manager/context that registers panel references, orders them by actual DOM order and unregisters on teardown. Deck supplies own closer/rail refs and ShowPanel opening. Forward Tab enters toolbar then content, closer Tab (including Shift) enters rail, rail forward Tab enters/expands first panel and opens deck, rail Shift Tab attempts deck title focus without activation. Panel arrows move to previous/next expanded title with deck-title/rail boundaries; rail Up/Down wraps implemented buttons, Left/Right remains unconsumed. Standalone panels, local content keys, existing Enter/Escape and commands remain intact. Verify actual managed composition including reorder/removal and multiple isolated decks. Inspect pinned source read-only; store hashes/conclusions only. Do not invoke pinned upstream from tests, compile it or execute native probes. Run focused checks/build/browser, full verify, then application/script/browser tests with vendor temporarily absent and restore finally. Record exact semantic commit and same-actor quality review; close leaf and append bounded parent progress.

## Verify Steps

1. Read-only pinned FocusManager/SidebarController/Deck/TabBar/TitleBar/DockingWindow inspection and hash evidence; no source copies. 2. New Writer baseline demonstrates missing Tab/arrows, then focused owned runtime tests and freshly built focused browser tests pass. 3. Scope integrity proves 268 previous test files unchanged, 217 prior rows preserved with only two append-only evidence/responsibility updates plus one manager row; eight semantic paths only. 4. npm run verify passes: application and browser tests, static provenance/resource/inventory audits, coverage 100% and zero semantic module violations. Static CLI audits may read pinned files separately; tests must not. 5. With vendor/libreoffice-reference temporarily renamed inside vendor, npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e all pass; restore vendor finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass (two preexisting doctor warnings only). 7. Ignored-inclusive Agentplane artifact audit reports zero Python/helper/source/archive/embedded diff bodies; exact semantic hash reviewed by EVALUATOR, final clean tracked/untracked state.

## Verification

Command: new owned Writer baseline; focused managed runtime tests; npm run build; focused Chromium; npm run verify; vendor-absent npm run test, npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts, npm run test:e2e; final integrity; git diff --check; node .agentplane/policy/check-routing.mjs; ap doctor. Result: pass. Evidence: baseline5 owned cases failed on unconsumed navigation; corrected focused39cases/5files and rebuilt2width browser pass. Final full verify exit0:1042app/208files,109inventory/36files,53browser,2resource tests; both app/inventory coverage100% all metrics,semanticViolationCount0. All1042+109+12+53 tests pass with pinned vendor directory absent; restored in finally. Static CLI resource/source-tree/provenance/parity audits separately read pinned metadata/files; app and script tests do not invoke pinned code. Eight semantic hashes and six read-only pinned source hashes current;268 prior tests byte-identical. Prior217manifest rows retained in relative order with only Deck/Panel append-only evidence/responsibility and one lexicographically inserted local-only/unverified browser manager row,218total. No statuses/defaults/owners/exceptions promoted. Final audit2879 Agentplane files zero source/helper/Python/source-frame/archive/embedded implementation/Git-code-diff, including decoded JSON/JSONL; five prose-only historical README/AGENTS diffs classified separately. Routing/diff pass,doctor0errors2preexistingwarnings. Same-actor exact semantic quality and final clean closure pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T03:17:49.931Z — VERIFY — ok

By: CODER

Note: Full verify0:1042app109inventory53browser2resource,100%app/inventorycoverage0semantic; upstream-absent1042+109+12+53allpassvendorrestored;268oldtestsbyte-identical8semantic6sourcehashescurrent217priorrows2append+1new218; source/helper/frame/decoded artifacts0,doctor0errors2knownwarnings; exact semantic quality pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T03:17:49.592Z, excerpt_hash=sha256:ee673d0e780f282095f4f8d44fcf1628b1247cb673349c3210ee269199972535

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040242-N2HMA6/blueprint/resolved-snapshot.json
- old_digest: 536e480ce479f80586417c8fe20facc5a7fe07b02380926ef854f912f579d67d
- current_digest: 536e480ce479f80586417c8fe20facc5a7fe07b02380926ef854f912f579d67d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040242-N2HMA6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610040242-N2HMA6 -m 🧩 N2HMA6 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the isolated semantic commit if required, retain task result/hash evidence. Offline verification always restores vendor in finally. No history rewriting.

## Findings

Iteration86 restores the implemented titled-panel Sidebar focus graph under one deck-owned registration manager: forward Tab title/toolbar/content, toolbox Tab regardless of Shift, rail forward/backward Tab, previous/next panel arrows with toolbox/rail boundaries, vertical single-button rail wrap, own ShowPanel opening/expansion, reorder/removal and separate deck ownership. Backward panel Tab, horizontal rail arrows and content keys remain local; existing Escape/Enter/commands verified by unchanged old cases. React refs bind after mount via SetDeck, and DOM visibility flush precedes focus (native ShowPanel follows focus request). Baseline5fail; focused39/2browserpass; full and upstream-absent checks all pass. Initial ref-construction lint rejection fixed without suppression. Initial application coverage1041 revealed two enclosing-key-owner branches, now actual capture-consumed test gives1042/100%. First full pipeline failed new-row ordering, fixed lexical insertion without moving prior rows. Second pipeline passed tests/coverage but found missing cleanup callback JSDoc; corrected comment, third full pipeline exit0. Premature scope check during intentional vendor rename observed temporary offline directory; final exact scope proof after restoration passes, no exclusion or weakened assertion. Independent explicit-user cleanup task202610040259-3B65MX removed91diagnostic source-bearing artifacts (87tracked4ignored) in isolated72102c6ea9ddedf8c5ae90b447437cc3384008a4 and4917d440fe2c action commits. Earlier audit missed source frames and encoded tails, current raw/decoded audits zero source bodies. No upstream sources/helper scripts/native binaries or source-bearing logs added, no native execution. Six source hashes only. F6/settings/other decks/multiple native rail eligibility/titleless-hidden fallback/native focus flags/native scrolling geometry/contexts/native and parent parity remain unverified; no status promotion or added exceptions. Same-actor review only; goal and parent remain active.
