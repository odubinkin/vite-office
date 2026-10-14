---
id: "202610140415-WTXZMM"
title: "Route native Ctrl-F6 through owning menubar popups"
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
  updated_at: "2026-10-14T04:16:10.056Z"
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
    body: "Start: existing native Ctrl-F6 ownership through root/child menubar keydown using existing close and focus callbacks; no new adapter. Correction 3/10 with upstream-absent whole-current-source 100% coverage."
events:
  -
    type: "status"
    at: "2026-10-14T04:16:19.675Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: existing native Ctrl-F6 ownership through root/child menubar keydown using existing close and focus callbacks; no new adapter. Correction 3/10 with upstream-absent whole-current-source 100% coverage."
doc_version: 3
doc_updated_at: "2026-10-14T04:16:19.675Z"
doc_updated_by: "CODER"
description: "Cycle correction 3/10: existing Ctrl-F6 focus routing must cancel root menubar into its document and close only immediate nested child; plain F6 remains untouched. Ordinary React keydown and existing close/focus functions, no new manager or low-level input. Preserve IO/recovery/Space and all old acceptance."
sections:
  Summary: "Close existing Ctrl-F6 through the actual menubar owner at root or child depth."
  Scope: "One production CommandMenuBar.tsx, two existing shared canonical runtime/provenance records; fresh native-menubar-document-key.test.tsx and writer-native-menubar-document-key.spec.ts. Original native Writer bindings and current actual UI. All old test bytes unchanged. Correction 3/10. No new runtime adapter, visible commands, low-level input or exceptions."
  Plan: "Extend existing trigger and popup keydown branches with source Ctrl-F6. Root deactivation retains existing cleanup and then invokes its original focusDocument callback as upstream GrabFocusToDocument does; child Ctrl-F6 closes only immediate child and consumes the event before global Writer focus route. Plain F6 remains untouched. Use existing closeMenu/closePopup and native focus; no new state/module. Append bounded evidence to canonical records preserving old fields/history."
  Verify Steps: "Inspect pinned MenuFloatingWindow KEY_F6/KEY_ESCAPE and MenuBarWindow Ctrl-F6 GrabFocusToDocument. Fresh actual WriterSession/bindings and real Chromium Writer tests assert root/disabled/native trigger cleanup, direct document focus despite saved toolbar owner, child nearest parent/focus, plain F6 untouched and fresh F10 cycle/no dispatch. Four reference symlinks physically absent for every producer, exact finally restoration. Whole current changed production Istanbul 100% lines/statements/functions/branches with original locations and positive raw counters; new+related once, tooling, current Chromium plus new cases. Scoped format/full lint/TS7/JSDoc/size/dependencies/build/static. Then nine restored-reference metadata gates: source-tree, source-provenance, registry, resources generator --check, invariants, parity, routing, doctor, diff. Preserve all old test bytes, canonical prefixes, accepted source/build hashes; same-agent non-independent quality phase and clean finish. Full once ten atomic corrections: upcoming full continues; following full pauses after repairs."
  Verification: "Pending current-source coverage, native/browser/static and metadata verification."
  Rollback Plan: "Revert only scoped semantic commit without rewriting history. Exact four reference symlink targets restored in finally. No reference/helper/raw source copies in Agentplane, no network/global files/publication."
  Findings: "Previous correction 5VA8Q8 DONE at 1d24dc77cebd. Clean writer checkout. Pin 9bc445578031fecf56086729d8e4940c77e14d65: Ctrl-F6 shares Escape nearest parent ownership in MenuFloatingWindow; MenuBarWindow deactivates then GrabFocusToDocument. Current menubar ignores F6; global Writer route moves focus to document while popup stays open, and incorrectly bypasses child nearest parent ownership. Bounded existing keyboard behavior repair. No suspicious core logic observed. Full timers/platform/mnemonics/core/UI parity remains unverified. Latest human pause is after full following upcoming full, with all failures repaired."
id_source: "generated"
---
## Summary

Close existing Ctrl-F6 through the actual menubar owner at root or child depth.

## Scope

One production CommandMenuBar.tsx, two existing shared canonical runtime/provenance records; fresh native-menubar-document-key.test.tsx and writer-native-menubar-document-key.spec.ts. Original native Writer bindings and current actual UI. All old test bytes unchanged. Correction 3/10. No new runtime adapter, visible commands, low-level input or exceptions.

## Plan

Extend existing trigger and popup keydown branches with source Ctrl-F6. Root deactivation retains existing cleanup and then invokes its original focusDocument callback as upstream GrabFocusToDocument does; child Ctrl-F6 closes only immediate child and consumes the event before global Writer focus route. Plain F6 remains untouched. Use existing closeMenu/closePopup and native focus; no new state/module. Append bounded evidence to canonical records preserving old fields/history.

## Verify Steps

Inspect pinned MenuFloatingWindow KEY_F6/KEY_ESCAPE and MenuBarWindow Ctrl-F6 GrabFocusToDocument. Fresh actual WriterSession/bindings and real Chromium Writer tests assert root/disabled/native trigger cleanup, direct document focus despite saved toolbar owner, child nearest parent/focus, plain F6 untouched and fresh F10 cycle/no dispatch. Four reference symlinks physically absent for every producer, exact finally restoration. Whole current changed production Istanbul 100% lines/statements/functions/branches with original locations and positive raw counters; new+related once, tooling, current Chromium plus new cases. Scoped format/full lint/TS7/JSDoc/size/dependencies/build/static. Then nine restored-reference metadata gates: source-tree, source-provenance, registry, resources generator --check, invariants, parity, routing, doctor, diff. Preserve all old test bytes, canonical prefixes, accepted source/build hashes; same-agent non-independent quality phase and clean finish. Full once ten atomic corrections: upcoming full continues; following full pauses after repairs.

## Verification

Pending current-source coverage, native/browser/static and metadata verification.

## Rollback Plan

Revert only scoped semantic commit without rewriting history. Exact four reference symlink targets restored in finally. No reference/helper/raw source copies in Agentplane, no network/global files/publication.

## Findings

Previous correction 5VA8Q8 DONE at 1d24dc77cebd. Clean writer checkout. Pin 9bc445578031fecf56086729d8e4940c77e14d65: Ctrl-F6 shares Escape nearest parent ownership in MenuFloatingWindow; MenuBarWindow deactivates then GrabFocusToDocument. Current menubar ignores F6; global Writer route moves focus to document while popup stays open, and incorrectly bypasses child nearest parent ownership. Bounded existing keyboard behavior repair. No suspicious core logic observed. Full timers/platform/mnemonics/core/UI parity remains unverified. Latest human pause is after full following upcoming full, with all failures repaired.
