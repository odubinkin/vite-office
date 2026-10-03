---
id: "202610032229-MJAGH0"
title: "Restore Writer root popup opening focus contracts"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-03T22:31:03.339Z"
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
    body: "Start: reproduce and restore root menu pointer focus and native keyboard first-entry contracts under standing parity goal authorization, preserving registered I/O and outcome-only artifact storage."
events:
  -
    type: "status"
    at: "2026-10-03T22:31:03.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce and restore root menu pointer focus and native keyboard first-entry contracts under standing parity goal authorization, preserving registered I/O and outcome-only artifact storage."
doc_version: 3
doc_updated_at: "2026-10-03T22:44:27.670Z"
doc_updated_by: "CODER"
description: "Iteration77 under C9TN6M: restore native root popup focus for pointer opening, first-entry keyboard preselection for both arrows/Return, consumed opening requests and active popup reuse; preserve generated composition and registered I/O. Owned tests never invoke upstream; artifacts outcomes only."
sections:
  Summary: "Iteration77 under C9TN6M restores existing root popup opening focus and native first-entry keyboard preselection under standing iterative authorization."
  Scope: "Six semantic paths: CommandMenuBar.tsx (root opening request/ref/effect, trigger entry and bool callsites only), new CommandMenuBar-root-focus.test.tsx, new writer-root-menu-focus.spec.ts, WriterMenuBar.test.tsx (only its existing View ArrowUp first-command assertion/target block), append-only existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. Of247prior test/spec files,246remain byte-identical and one changes only the upstream-contradicting last-entry block. Submenu behavior, root saved-document focus, disabled/style/mnemonic policy, generated resources, core and menu composition unchanged. Preserve registered save/open/recovery exceptions. Tests never read/compile/invoke upstream; task artifacts bounded outcomes/logs/hashes only, no source/helper/Python/binaries."
  Plan: "1. Manual exact-pin MenuBarWindow pointer/keyboard/active-popup guards and popup preselection/focus dependencies, hashes only. 2. Owned and real Chromium reproduction of pointer focus and native both-arrow/Return first entry; capture old contradictory View ArrowUp expectation. 3. Refactor root focus request to one-shot optional native preselection boolean, focus unselected popup for pointer, first eligible item for keyboard, preserve active popup reuse, handle keyboard activation independently of pointer click and discard consumed/closed requests. 4. Correct only the old contradictory assertion block and append narrow manifest evidence without broader status/ownership/default promotion. 5. Focused runtime/types/lint/browser, fullverify100%gates, sequential vendor-absent app/inventory/scripts/browser, source/scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR exact semantic review, finish leaf and parent findings; goal/parent stay active."
  Verify Steps: "1. Complete relevant manual pinned MenuBarWindow ImplCreatePopup/MouseButtonDown/MouseMove/ChangeHighlightItem/HandleKeyEvent and header, popup ImplExecute/Run/StartPopupMode and invalid-highlight navigation/Return inspection; hashes only, no native execution. 2. Before/after owned cases: pointer root popup takes focus without first item; pointer hover switches root focus without selection; unselected root boundaries navigate correctly; both initial arrows and Enter preselect first eligible item, existing browser Space activation retained; selected single command dispatch; repeated active root requests preserve its selection and nested popup, consumed requests do not steal focus on rerender; closing/reopening and keyboard toggle remain coherent. Real Chromium pointer root-to-keyboard navigation and actual StatusBar action, root keyboard matrix ArrowDown/ArrowUp/Enter/Space each first eligible item and one actual command execution. Old View ArrowUp block changes from Sidebar(last) to StatusBar(first) with exact native source evidence, remaining assertions unchanged. Native disabled-style defaults and Space/mnemonic/full saved-focus behavior remain separately unverified. 3. npm run verify all existing gates and100%coverage pass; static CLI source/resource/parity audits may read vendor separately from tests. 4. Vendor rename inside repository restoredfinally: sequential npm run test, all three noninventory script Vitest files and npm run test:e2e pass without upstream. 5.246prior tests/spec byte-identical and one exact three-line assertion/target block change; production outside declared root focus/entry/bool callsites unchanged, both215-row manifests one append-only evidence row preserving original statuses/defaults/ownership/prior conclusions; ignored-inclusive source/helper/Python/executable artifacts0. 6. ap doctor,routing,git diff --check, terminal results, exact semantic quality review and clean final tracked/untracked checkout."
  Verification: "Pending bounded reproduction and correction; no complete native menubar focus/default claim."
  Rollback Plan: "Revert only task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access; temporary vendor rename restored in finally."
  Findings: |-
    Preflight main/direct clean at8037e4bf6fbbde9d7d7afbcc76eac43cb4a2c274. Previous goal turn classified progress: iteration76 semantic2b175b44 restores child popup pointer/keyboard preselection and focus restoration, DONE with full/offline terminal evidence. Native pointer passes preselectfalse but popup still grabs focus; keyboard Return/Up/Down request preselecttrue, active same-popup creation is guarded. Local pointer focusnone skips popup focus, ArrowUp opens last, trigger Enter/Space relies on pointer click default; opening request enum also conflates no item selection with no pending request. One existing old test encodes last-entry View ArrowUp behavior; update its exact block to source-matched first entry, not weaken or delete coverage. Saved document focus, F10/Alt/mnemonics, platform disabled flags and timers remain separate obligations.

    Reproduction: 17 new owned cases produced10fail/7pass on baseline; all5 real Chromium opening/toggle scenarios failed. Corrected targeted5files/55cases and9browser cases all pass. Root opening enum replaced by consumed optional preselection boolean; pointer grabs popup focus, both initial arrows/Return select first, browser Space activation handled explicitly, active same-popup request preserves child state. Existing Writer View ArrowUp changes only3lines from last Sidebar to first currently implemented Status Bar; this is not certification of complete upstream View composition. Full npm run verify passes912app/195files,109inventory/36files,29browser,2resource cases; app/tools100% coverage and semantic violations0.246prior tests/spec byte-identical, exact old3line block, production outside scoped root opening unchanged and both215row manifests evidence-only append with statuses/defaults/ownership/prior conclusions preserved. Doctor0errors2known warnings; routing/diff/lint pass. Source inspection is manual exactpin and6hashes, with no native execution or source/helper artifacts. Sequential upstream-absent verification is in progress; final results and restoration will be recorded before verification. Read-only evidence collection briefly attempted coverage totals while the offline suite was regenerating coverage, observed ENOENT; full verification totals remain recorded, recollect only after the live suite is terminal. CLI show uses no JSON flag; bounded help corrected the read-only invocation.
id_source: "generated"
---
## Summary

Iteration77 under C9TN6M restores existing root popup opening focus and native first-entry keyboard preselection under standing iterative authorization.

## Scope

Six semantic paths: CommandMenuBar.tsx (root opening request/ref/effect, trigger entry and bool callsites only), new CommandMenuBar-root-focus.test.tsx, new writer-root-menu-focus.spec.ts, WriterMenuBar.test.tsx (only its existing View ArrowUp first-command assertion/target block), append-only existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. Of247prior test/spec files,246remain byte-identical and one changes only the upstream-contradicting last-entry block. Submenu behavior, root saved-document focus, disabled/style/mnemonic policy, generated resources, core and menu composition unchanged. Preserve registered save/open/recovery exceptions. Tests never read/compile/invoke upstream; task artifacts bounded outcomes/logs/hashes only, no source/helper/Python/binaries.

## Plan

1. Manual exact-pin MenuBarWindow pointer/keyboard/active-popup guards and popup preselection/focus dependencies, hashes only. 2. Owned and real Chromium reproduction of pointer focus and native both-arrow/Return first entry; capture old contradictory View ArrowUp expectation. 3. Refactor root focus request to one-shot optional native preselection boolean, focus unselected popup for pointer, first eligible item for keyboard, preserve active popup reuse, handle keyboard activation independently of pointer click and discard consumed/closed requests. 4. Correct only the old contradictory assertion block and append narrow manifest evidence without broader status/ownership/default promotion. 5. Focused runtime/types/lint/browser, fullverify100%gates, sequential vendor-absent app/inventory/scripts/browser, source/scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR exact semantic review, finish leaf and parent findings; goal/parent stay active.

## Verify Steps

1. Complete relevant manual pinned MenuBarWindow ImplCreatePopup/MouseButtonDown/MouseMove/ChangeHighlightItem/HandleKeyEvent and header, popup ImplExecute/Run/StartPopupMode and invalid-highlight navigation/Return inspection; hashes only, no native execution. 2. Before/after owned cases: pointer root popup takes focus without first item; pointer hover switches root focus without selection; unselected root boundaries navigate correctly; both initial arrows and Enter preselect first eligible item, existing browser Space activation retained; selected single command dispatch; repeated active root requests preserve its selection and nested popup, consumed requests do not steal focus on rerender; closing/reopening and keyboard toggle remain coherent. Real Chromium pointer root-to-keyboard navigation and actual StatusBar action, root keyboard matrix ArrowDown/ArrowUp/Enter/Space each first eligible item and one actual command execution. Old View ArrowUp block changes from Sidebar(last) to StatusBar(first) with exact native source evidence, remaining assertions unchanged. Native disabled-style defaults and Space/mnemonic/full saved-focus behavior remain separately unverified. 3. npm run verify all existing gates and100%coverage pass; static CLI source/resource/parity audits may read vendor separately from tests. 4. Vendor rename inside repository restoredfinally: sequential npm run test, all three noninventory script Vitest files and npm run test:e2e pass without upstream. 5.246prior tests/spec byte-identical and one exact three-line assertion/target block change; production outside declared root focus/entry/bool callsites unchanged, both215-row manifests one append-only evidence row preserving original statuses/defaults/ownership/prior conclusions; ignored-inclusive source/helper/Python/executable artifacts0. 6. ap doctor,routing,git diff --check, terminal results, exact semantic quality review and clean final tracked/untracked checkout.

## Verification

Pending bounded reproduction and correction; no complete native menubar focus/default claim.

## Rollback Plan

Revert only task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access; temporary vendor rename restored in finally.

## Findings

Preflight main/direct clean at8037e4bf6fbbde9d7d7afbcc76eac43cb4a2c274. Previous goal turn classified progress: iteration76 semantic2b175b44 restores child popup pointer/keyboard preselection and focus restoration, DONE with full/offline terminal evidence. Native pointer passes preselectfalse but popup still grabs focus; keyboard Return/Up/Down request preselecttrue, active same-popup creation is guarded. Local pointer focusnone skips popup focus, ArrowUp opens last, trigger Enter/Space relies on pointer click default; opening request enum also conflates no item selection with no pending request. One existing old test encodes last-entry View ArrowUp behavior; update its exact block to source-matched first entry, not weaken or delete coverage. Saved document focus, F10/Alt/mnemonics, platform disabled flags and timers remain separate obligations.

Reproduction: 17 new owned cases produced10fail/7pass on baseline; all5 real Chromium opening/toggle scenarios failed. Corrected targeted5files/55cases and9browser cases all pass. Root opening enum replaced by consumed optional preselection boolean; pointer grabs popup focus, both initial arrows/Return select first, browser Space activation handled explicitly, active same-popup request preserves child state. Existing Writer View ArrowUp changes only3lines from last Sidebar to first currently implemented Status Bar; this is not certification of complete upstream View composition. Full npm run verify passes912app/195files,109inventory/36files,29browser,2resource cases; app/tools100% coverage and semantic violations0.246prior tests/spec byte-identical, exact old3line block, production outside scoped root opening unchanged and both215row manifests evidence-only append with statuses/defaults/ownership/prior conclusions preserved. Doctor0errors2known warnings; routing/diff/lint pass. Source inspection is manual exactpin and6hashes, with no native execution or source/helper artifacts. Sequential upstream-absent verification is in progress; final results and restoration will be recorded before verification. Read-only evidence collection briefly attempted coverage totals while the offline suite was regenerating coverage, observed ENOENT; full verification totals remain recorded, recollect only after the live suite is terminal. CLI show uses no JSON flag; bounded help corrected the read-only invocation.
