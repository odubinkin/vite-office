---
id: "202610191130-1V60C3"
title: "Implement native shared menubar pointer rollover and first-move admission"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-10-19T11:30:56.590Z"
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
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task shared root pointer/style,test/browser and provenance paths;preserve popup pointer timers,source contracts,upstream ledger and unrelated user/task changes. No reset,branch switch,network or merge."
  Findings: ""
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

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task shared root pointer/style,test/browser and provenance paths;preserve popup pointer timers,source contracts,upstream ledger and unrelated user/task changes. No reset,branch switch,network or merge.

## Findings
