---
id: "202610131252-61PRG4"
title: "Restore native popup submenu delay ownership"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-13T12:54:28.831Z"
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
    body: "Start: native150ms submenu timer ownership and immediate keyboard/direct activation, fresh native clocks, exact pointer migrations, related source100four only; cadence3."
events:
  -
    type: "status"
    at: "2026-10-13T12:54:30.071Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native150ms submenu timer ownership and immediate keyboard/direct activation, fresh native clocks, exact pointer migrations, related source100four only; cadence3."
doc_version: 3
doc_updated_at: "2026-10-13T12:54:30.071Z"
doc_updated_by: "CODER"
description: "Match native default150ms submenu highlight/close timers, keyboard/direct activation immediate, cancel stale pointer work on sibling change/reentry/close/teardown; preserve original bindings/focus/admission. Source-backed exact immediate-pointer test migrations, deterministic native mounted timers and real Chromium. Cadence3, no full replay or IO/recovery changes."
sections:
  Summary: "Restore native150ms highlight and submenu-close timer ownership."
  Scope: "Production CommandPopupMenu.tsx only; append its shared runtime/provenance records. New Writer-owned native-popup-delay.test.tsx and real Chromium writer-native-popup-delay.spec.ts. Exact old immediate-pointer case migrations: pointer opening/leave in native-command-popup.test.tsx; pointer-open Return case in native-disabled-popup.test.tsx; pointer sibling empty admission variant in native-empty-popup.test.tsx. Preserve all other case/file bytes. Task/parent evidence. No native settings API/mock commands/resources/provider/exclusions or registered IO/recovery changes."
  Plan: "Use pinned ImplMouseData mnMenuDelay150 and MenuFloatingWindow highlight/close timer lifetime. Scope: submenu event delay/lifetime only, preserving existing browser device ingress; full native first-move/synthetic event and pointer command highlight remain explicitly unverified. Pointer enter selects/highlights parent and requests nonempty/empty child admission after150ms; leaving before deadline cancels request. Active child departure closes after150ms, reenter cancels closure, siblings replace via same parent timer. Keyboard/direct left-button activation opens immediately with native first-child preselection; pointer-timer activation remains unselected. All keyboard/capture close/execute/outside focus/unmount/resource lifetime changes cancel obsolete tasks and descendants; no stale callbacks reopen closed windows or steal focus. Original bindings own state/execute and prior empty admission preserved. Fresh red and deterministic clocks plus exact source-backed old migrations; whole source100four via related current raw maps, static/build/real Chromium and restored metadata; exact semantic SHA same-agent review, clean closure. Cadence3, no full replay."
  Verify Steps: "Fresh original Writer frame/bindings and real DOM timers:149ms no child/150ms open unselected, leave cancellation, delayed close/reentry, sibling last request wins, nested independent timers, keyboard/direct button immediate first selection, empty child never opens but replaces sibling aftertimer, close/outside focus/unmount/resource changes cancel tasks and cannot execute/reopen. Confirm native default and source links; no test calls pinned implementation. Exact approved old pointer cases migrated only; all other bodies/file bytes unchanged. Whole original CommandPopupMenu100 lines/statements/functions/branches with immutable current hash/raw positive counter/location/ID proof, no normalization/provider/exclusion. Fresh/related/tooling/TS7/format/lint/docs/size/deps/build/static and actual Chromium pointer/keyboard/table regressions pass refs absent. LO/mdds/ICU hidden for every runtime/static producer and restored exact finally; no source/test/ref mutation while live. Final9 source-tree/provenance/registry/resource-check/invariants/parity/routing/doctor/diff audits terminal/restored only. Preserve old canonical prefixes/status/default/class andIO/recovery, no upstream/helper/Python/rawmap in Agentplane. Record attempts/residuals; exact semantic SHA same-agent not independent review and clean closure."
  Verification: "Pending genuine red, implementation and source-byte verification."
  Rollback Plan: "Revert scoped semantic commit only if needed; preserve human history and prior work. Restore3refs finally, no publication/history rewrite."
  Findings: "Previous turn is verified progress: native empty child admission completed at1a0ac34c, clean current writer6c6b2d34. Standing resumed goal authorizes safe local source-backed fix/internal plan lifecycle. LO pin9bc445578031fecf56086729d8e4940c77e14d65. Native ctor timers use MouseSettings.GetMenuDelay, default150; keyboard/direct call HighlightChanged(nullptr) preselects, timer activation does not. Current immediate hover/leave contradicts source. Full pointer first-move/NOSELECT/mnemonics/platform settings and complete parity remain unverified; no full/global claims."
id_source: "generated"
---
## Summary

Restore native150ms highlight and submenu-close timer ownership.

## Scope

Production CommandPopupMenu.tsx only; append its shared runtime/provenance records. New Writer-owned native-popup-delay.test.tsx and real Chromium writer-native-popup-delay.spec.ts. Exact old immediate-pointer case migrations: pointer opening/leave in native-command-popup.test.tsx; pointer-open Return case in native-disabled-popup.test.tsx; pointer sibling empty admission variant in native-empty-popup.test.tsx. Preserve all other case/file bytes. Task/parent evidence. No native settings API/mock commands/resources/provider/exclusions or registered IO/recovery changes.

## Plan

Use pinned ImplMouseData mnMenuDelay150 and MenuFloatingWindow highlight/close timer lifetime. Scope: submenu event delay/lifetime only, preserving existing browser device ingress; full native first-move/synthetic event and pointer command highlight remain explicitly unverified. Pointer enter selects/highlights parent and requests nonempty/empty child admission after150ms; leaving before deadline cancels request. Active child departure closes after150ms, reenter cancels closure, siblings replace via same parent timer. Keyboard/direct left-button activation opens immediately with native first-child preselection; pointer-timer activation remains unselected. All keyboard/capture close/execute/outside focus/unmount/resource lifetime changes cancel obsolete tasks and descendants; no stale callbacks reopen closed windows or steal focus. Original bindings own state/execute and prior empty admission preserved. Fresh red and deterministic clocks plus exact source-backed old migrations; whole source100four via related current raw maps, static/build/real Chromium and restored metadata; exact semantic SHA same-agent review, clean closure. Cadence3, no full replay.

## Verify Steps

Fresh original Writer frame/bindings and real DOM timers:149ms no child/150ms open unselected, leave cancellation, delayed close/reentry, sibling last request wins, nested independent timers, keyboard/direct button immediate first selection, empty child never opens but replaces sibling aftertimer, close/outside focus/unmount/resource changes cancel tasks and cannot execute/reopen. Confirm native default and source links; no test calls pinned implementation. Exact approved old pointer cases migrated only; all other bodies/file bytes unchanged. Whole original CommandPopupMenu100 lines/statements/functions/branches with immutable current hash/raw positive counter/location/ID proof, no normalization/provider/exclusion. Fresh/related/tooling/TS7/format/lint/docs/size/deps/build/static and actual Chromium pointer/keyboard/table regressions pass refs absent. LO/mdds/ICU hidden for every runtime/static producer and restored exact finally; no source/test/ref mutation while live. Final9 source-tree/provenance/registry/resource-check/invariants/parity/routing/doctor/diff audits terminal/restored only. Preserve old canonical prefixes/status/default/class andIO/recovery, no upstream/helper/Python/rawmap in Agentplane. Record attempts/residuals; exact semantic SHA same-agent not independent review and clean closure.

## Verification

Pending genuine red, implementation and source-byte verification.

## Rollback Plan

Revert scoped semantic commit only if needed; preserve human history and prior work. Restore3refs finally, no publication/history rewrite.

## Findings

Previous turn is verified progress: native empty child admission completed at1a0ac34c, clean current writer6c6b2d34. Standing resumed goal authorizes safe local source-backed fix/internal plan lifecycle. LO pin9bc445578031fecf56086729d8e4940c77e14d65. Native ctor timers use MouseSettings.GetMenuDelay, default150; keyboard/direct call HighlightChanged(nullptr) preselects, timer activation does not. Current immediate hover/leave contradicts source. Full pointer first-move/NOSELECT/mnemonics/platform settings and complete parity remain unverified; no full/global claims.
