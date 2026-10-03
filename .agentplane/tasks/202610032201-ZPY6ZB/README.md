---
id: "202610032201-ZPY6ZB"
title: "Preserve pointer-opened Writer submenu preselection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T22:01:54.960Z"
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
    body: "Start: reproduce native pointer/keyboard submenu preselection distinction and resulting unselected popup contracts under standing goal authorization; outcome-only artifacts and upstream-independent tests."
events:
  -
    type: "status"
    at: "2026-10-03T22:01:55.392Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce native pointer/keyboard submenu preselection distinction and resulting unselected popup contracts under standing goal authorization; outcome-only artifacts and upstream-independent tests."
doc_version: 3
doc_updated_at: "2026-10-03T22:01:55.392Z"
doc_updated_by: "CODER"
description: "Iteration76 under C9TN6M: restore native distinction between pointer submenu popup focus without first-item preselection and keyboard opening with first-item preselection; cover unselected popup navigation and no-command dismissal. Existing menu composition and registered I/O exceptions preserved; tests never invoke upstream; outcome-only artifacts."
sections:
  Summary: "Iteration76 under C9TN6M restores existing submenu opening origin: native pointer opening focuses the popup without first-item preselection; keyboard opening preselects its first item. This is one coherent browser correction, including navigation/dismissal from the resulting unselected popup state."
  Scope: "Five semantic paths: CommandMenuBar.tsx (submenu opening origin, focusable popup, unselected popup traversal/activation and shared current-popup dismissal only), new CommandMenuBar-submenu-preselection.test.tsx, new writer-submenu-preselection.spec.ts, and append-only evidence updates to existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. All245prior tests/spec, generated resources, core and menu composition unchanged. Preserve registered save/open/recovery exceptions and iteration75 single event consumption. Tests never read/compile/invoke upstream; artifacts bounded logs/results/hashes/conclusions only, no source/helper/Python/binary files."
  Plan: "1. Inspect complete pinned HighlightChanged, popup ImplExecute/Run, native invalid-highlight traversal/Return dismissal and floating focus/close dependencies; store hashes only. 2. Owned and real Chromium regressions reproduce pointer preselection before correction. 3. Carry opening origin through mounted submenu focus, focus popup itself for pointer opening and first item for keyboard, restore native boundary navigation and no-command close of an unselected popup. Preserve repeated open and leaf pointer execution. 4. Append bounded existing manifest evidence without broader native completion or status/default/ownership changes. 5. Focused checks, fullverify with existing100%gates, sequential vendor-absent app/inventory/scripts/browser, source/scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR exact semantic HEAD review, finish leaf and parent findings; parent/goal remain active."
  Verify Steps: "1. Read-only manual exact-pin native HighlightChanged/ImplExecute/Run/StartPopupMode/ImplCursorUpDown/KeyInput/StopExecute/PopupEnd/ClosePopup/ImplEndPopupMode inspection, hashes only; no native probes/execution. 2. Owned before/after cases: pointer opening focuses the popup without preselecting a command; ArrowRight/Enter and existing browser Space opening still focus first command; unselected ArrowDown/Home select first and ArrowUp/End last; unselected Enter dismisses only current submenu without dispatch and restores parent; Escape/Left restoration, repeated hover retains existing selection, origin resets after close/reopen, sibling switching and pointer leaf activation retained. Browser Space remains adapter behavior, no full native mnemonic/default claim. Real Chromium existing Writer Format Text hover vs keyboard opening, unselected boundary navigation/Return dismissal and unchanged actual command execution. 3. npm run verify all existing gates and100%coverage pass; static CLI source/resource/parity audits may read vendor separately from tests. 4. Temporarily rename pinned vendor inside repository, restorefinally: sequential npm run test, three noninventory script Vitest files and npm run test:e2e pass without upstream. 5.245prior tests/spec and all production outside approved submenu opening/current-popup/invalid-highlight paths unchanged, both215-row manifests one append-only evidence row preserving prior conclusions/statuses/defaults/ownership/deviations; ignored-inclusive task artifact source/helper/Python/executable0. 6. ap doctor,routing,git diff --check, all terminal results recorded, exact semantic quality review and clean final tracked/untracked checkout."
  Verification: "Pending owned and browser reproduction; complete native menu parity is not established."
  Rollback Plan: "Revert only the task semantic commit if necessary; preserve history and registered I/O exceptions. No network or outside-repo access. Vendor rename restored in finally."
  Findings: "Preflight main/direct clean at6eea8575520d5db895306225c25320b96226a651. Previous goal turn classified progress: iteration75 semantic8c9cc72a fixes duplicate nested keyboard consumption, leaf DONE with terminal full/offline evidence. Native HighlightChanged passes preselect=pTimer==nullptr; ImplExecute always sets GrabFocus and Run highlights first only ifpreselect. FloatingWindow StartPopupMode grabs popup window focus independently. Therefore retaining parent DOM focus would miss native popup keyboard ownership; pointer must focus an unselected popup container. Native invalid-highlight ArrowUp selects last, ArrowDown first; Return has no selected command and StopExecute closes current nested popup through PopupEnd/ClosePopup, restores parent focus. Local unconditional first-item focus and unselected predecessor index are candidate defects to reproduce. Disabled traversal defaults/timers/mnemonic algorithms/stale provenance symbols remain separate obligations, registered I/O unchanged."
id_source: "generated"
---
## Summary

Iteration76 under C9TN6M restores existing submenu opening origin: native pointer opening focuses the popup without first-item preselection; keyboard opening preselects its first item. This is one coherent browser correction, including navigation/dismissal from the resulting unselected popup state.

## Scope

Five semantic paths: CommandMenuBar.tsx (submenu opening origin, focusable popup, unselected popup traversal/activation and shared current-popup dismissal only), new CommandMenuBar-submenu-preselection.test.tsx, new writer-submenu-preselection.spec.ts, and append-only evidence updates to existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. All245prior tests/spec, generated resources, core and menu composition unchanged. Preserve registered save/open/recovery exceptions and iteration75 single event consumption. Tests never read/compile/invoke upstream; artifacts bounded logs/results/hashes/conclusions only, no source/helper/Python/binary files.

## Plan

1. Inspect complete pinned HighlightChanged, popup ImplExecute/Run, native invalid-highlight traversal/Return dismissal and floating focus/close dependencies; store hashes only. 2. Owned and real Chromium regressions reproduce pointer preselection before correction. 3. Carry opening origin through mounted submenu focus, focus popup itself for pointer opening and first item for keyboard, restore native boundary navigation and no-command close of an unselected popup. Preserve repeated open and leaf pointer execution. 4. Append bounded existing manifest evidence without broader native completion or status/default/ownership changes. 5. Focused checks, fullverify with existing100%gates, sequential vendor-absent app/inventory/scripts/browser, source/scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR exact semantic HEAD review, finish leaf and parent findings; parent/goal remain active.

## Verify Steps

1. Read-only manual exact-pin native HighlightChanged/ImplExecute/Run/StartPopupMode/ImplCursorUpDown/KeyInput/StopExecute/PopupEnd/ClosePopup/ImplEndPopupMode inspection, hashes only; no native probes/execution. 2. Owned before/after cases: pointer opening focuses the popup without preselecting a command; ArrowRight/Enter and existing browser Space opening still focus first command; unselected ArrowDown/Home select first and ArrowUp/End last; unselected Enter dismisses only current submenu without dispatch and restores parent; Escape/Left restoration, repeated hover retains existing selection, origin resets after close/reopen, sibling switching and pointer leaf activation retained. Browser Space remains adapter behavior, no full native mnemonic/default claim. Real Chromium existing Writer Format Text hover vs keyboard opening, unselected boundary navigation/Return dismissal and unchanged actual command execution. 3. npm run verify all existing gates and100%coverage pass; static CLI source/resource/parity audits may read vendor separately from tests. 4. Temporarily rename pinned vendor inside repository, restorefinally: sequential npm run test, three noninventory script Vitest files and npm run test:e2e pass without upstream. 5.245prior tests/spec and all production outside approved submenu opening/current-popup/invalid-highlight paths unchanged, both215-row manifests one append-only evidence row preserving prior conclusions/statuses/defaults/ownership/deviations; ignored-inclusive task artifact source/helper/Python/executable0. 6. ap doctor,routing,git diff --check, all terminal results recorded, exact semantic quality review and clean final tracked/untracked checkout.

## Verification

Pending owned and browser reproduction; complete native menu parity is not established.

## Rollback Plan

Revert only the task semantic commit if necessary; preserve history and registered I/O exceptions. No network or outside-repo access. Vendor rename restored in finally.

## Findings

Preflight main/direct clean at6eea8575520d5db895306225c25320b96226a651. Previous goal turn classified progress: iteration75 semantic8c9cc72a fixes duplicate nested keyboard consumption, leaf DONE with terminal full/offline evidence. Native HighlightChanged passes preselect=pTimer==nullptr; ImplExecute always sets GrabFocus and Run highlights first only ifpreselect. FloatingWindow StartPopupMode grabs popup window focus independently. Therefore retaining parent DOM focus would miss native popup keyboard ownership; pointer must focus an unselected popup container. Native invalid-highlight ArrowUp selects last, ArrowDown first; Return has no selected command and StopExecute closes current nested popup through PopupEnd/ClosePopup, restores parent focus. Local unconditional first-item focus and unselected predecessor index are candidate defects to reproduce. Disabled traversal defaults/timers/mnemonic algorithms/stale provenance symbols remain separate obligations, registered I/O unchanged.
