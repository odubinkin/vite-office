---
id: "202610040003-35MME6"
title: "Implement active Writer menubar F10 activation cycle"
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
  updated_at: "2026-10-04T00:03:52.042Z"
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
    body: "Start: implement authorized iteration80 F10 menubar cycle with active/modal input gating, source-shaped activation and saved-focus lifecycle, no upstream test dependency/source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T00:03:52.482Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement authorized iteration80 F10 menubar cycle with active/modal input gating, source-shaped activation and saved-focus lifecycle, no upstream test dependency/source/helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T00:03:52.482Z"
doc_updated_by: "CODER"
description: "Iteration80 under C9TN6M: native-shaped F10 first-root activation without popup and deactivation with saved focus; active and modal-input frame gates, existing popup cleanup reused. No save/open/recovery changes or upstream test dependency/source artifacts."
sections:
  Summary: "Iteration80: implement native menubar F10 activation/deactivation for existing Writer interface."
  Scope: "Six semantic paths: CommandMenuBar.tsx (input eligibility, F10 listener and explicit menu activation cycle integrated with existing focus/open/close/navigation only), writer-view.tsx (active/modal menu input eligibility only), new CommandMenuBar-menu-key.test.tsx, new writer-menu-key.spec.ts; append-only existing CommandMenuBar/writer-view evidence rows in source-provenance.json/runtime-inventory.json. All253prior test/spec byte-identical, preserve popup/preselection/dispatch/child keyboard logic, core, resources and registered save/open/recovery deviations. No source/helpers/Python/binary/archive artifacts. Native Alt/mnemonics/F6/platform/frame-global flags/no-owner popup/full menu parity remain unverified."
  Plan: "1. Manual complete exact-pin MenuBarWindow HandleKeyEvent/ChangeHighlightItem/PopupClosed/GetFocus/LoseFocus, MenuBar external key eligibility, SystemWindow routing, backend F10 alternate and popup KEY_MENU forwarding; hashes/conclusions only, no native execution. 2. Owned cases expose missing F10 first-root no-popup activation, saved-owner/no-owner client deactivation, reentry from another root, popup/child close without dispatch, Shift-F10/nonkey/prevented/input-disabled/empty eligibility and cleanup, only eligible frame; actual Writer view and Chromium focus/arrow opening/typing/modal precedence. 3. Add explicit cycle flag mirroring native highlighted-item validity; activate once/save first owner, F10 first root without popup, reuse close with native document fallback only absent popup; integrate current focus entry/loss and navigation so activation flag follows lifecycle. Active Writer/modal gate supplies eligibility, inactive/blocked input does not consume. 4. Append evidence preserving all statuses/defaults/ownership/old evidence. 5. Focused and npm run verify100%coverage0semantic; sequential vendor-absent app/inventory3script/browser allpass; source hashes/253unchangedtests/exact production scope/215row manifests/storage archives/helper/Python0/doctor/routing/diff. 6. Semantic commit, same-actor separate EVALUATOR exact SHA, canonical finish and parent progress; goal remains active."
  Verify Steps: "Manual read-only complete relevant native function inspection at pin9bc445578031fecf56086729d8e4940c77e14d65, no native compilation/execution/copy. Before/after owned F10 first root no-popup, repeat toggle saved-owner/default document, subsequent cycle first-root reset, pointer/root/child popup close no dispatch, Shift-F10/nonF10/prevented keys retained, optional/ineligible/empty frame/no listener after unmount, eligible frame switches, real Writer wiring. Chromium F10 no-popup/arrow navigation/opening/toggle focus plus typing, saved toolbar owner and modal Hyperlink focus remains. All253prior tests byte-identical. npm run verify all gates100%coverage0semantic; sequential vendor root rename/restoredfinally npm run test, vitest3noninventory script test files, npm run test:e2e allpass; no upstream test dependency. Six semantic paths/exact two production changes only;215rows2evidence-only changed rows per manifest with statuses/defaults/ownership/prior evidence preserved. Ignored-inclusive source/helper/Python/executable/archive artifacts0; pinned source hashes unchanged; doctor/routing/diff pass; recorded outcomes, same-actor exact semantic quality review, canonical finish and clean final tracked/untracked."
  Verification: "Pending before/after checks. Tests only exercise owned app/fixtures and must pass with pinned upstream absent. Static CLI provenance/resource/parity source reads are separate from tests."
  Rollback Plan: "Revert semantic iteration80 commit only through a new authorized task if needed, preserve task outcomes/history and registered deviations."
  Findings: "Preflight direct/main clean; C9TN6M only DOING parent. Previous turn is progress: iteration79 DONE b2902b94e5d7; source-bearing legacy archive separately removed b23c4f18c359. F10 missing in local browser code. Native HandleKeyEvent KEY_MENU ignores Shift, activates first item without auto-popup, deactivates next press; MenuBar ImplHandleKeyEvent gates displayability/enabled/input-enabled/modal; popup KEY_MENU forwards to root. Backend maps unhandled F10 alternate to KEY_MENU. Native platform/system menu/Alt/F6 scopes not completed. Read-only guessed nonexistent paths produced errors; actual source routing/functions found within repo, no mutation or outside access."
id_source: "generated"
---
## Summary

Iteration80: implement native menubar F10 activation/deactivation for existing Writer interface.

## Scope

Six semantic paths: CommandMenuBar.tsx (input eligibility, F10 listener and explicit menu activation cycle integrated with existing focus/open/close/navigation only), writer-view.tsx (active/modal menu input eligibility only), new CommandMenuBar-menu-key.test.tsx, new writer-menu-key.spec.ts; append-only existing CommandMenuBar/writer-view evidence rows in source-provenance.json/runtime-inventory.json. All253prior test/spec byte-identical, preserve popup/preselection/dispatch/child keyboard logic, core, resources and registered save/open/recovery deviations. No source/helpers/Python/binary/archive artifacts. Native Alt/mnemonics/F6/platform/frame-global flags/no-owner popup/full menu parity remain unverified.

## Plan

1. Manual complete exact-pin MenuBarWindow HandleKeyEvent/ChangeHighlightItem/PopupClosed/GetFocus/LoseFocus, MenuBar external key eligibility, SystemWindow routing, backend F10 alternate and popup KEY_MENU forwarding; hashes/conclusions only, no native execution. 2. Owned cases expose missing F10 first-root no-popup activation, saved-owner/no-owner client deactivation, reentry from another root, popup/child close without dispatch, Shift-F10/nonkey/prevented/input-disabled/empty eligibility and cleanup, only eligible frame; actual Writer view and Chromium focus/arrow opening/typing/modal precedence. 3. Add explicit cycle flag mirroring native highlighted-item validity; activate once/save first owner, F10 first root without popup, reuse close with native document fallback only absent popup; integrate current focus entry/loss and navigation so activation flag follows lifecycle. Active Writer/modal gate supplies eligibility, inactive/blocked input does not consume. 4. Append evidence preserving all statuses/defaults/ownership/old evidence. 5. Focused and npm run verify100%coverage0semantic; sequential vendor-absent app/inventory3script/browser allpass; source hashes/253unchangedtests/exact production scope/215row manifests/storage archives/helper/Python0/doctor/routing/diff. 6. Semantic commit, same-actor separate EVALUATOR exact SHA, canonical finish and parent progress; goal remains active.

## Verify Steps

Manual read-only complete relevant native function inspection at pin9bc445578031fecf56086729d8e4940c77e14d65, no native compilation/execution/copy. Before/after owned F10 first root no-popup, repeat toggle saved-owner/default document, subsequent cycle first-root reset, pointer/root/child popup close no dispatch, Shift-F10/nonF10/prevented keys retained, optional/ineligible/empty frame/no listener after unmount, eligible frame switches, real Writer wiring. Chromium F10 no-popup/arrow navigation/opening/toggle focus plus typing, saved toolbar owner and modal Hyperlink focus remains. All253prior tests byte-identical. npm run verify all gates100%coverage0semantic; sequential vendor root rename/restoredfinally npm run test, vitest3noninventory script test files, npm run test:e2e allpass; no upstream test dependency. Six semantic paths/exact two production changes only;215rows2evidence-only changed rows per manifest with statuses/defaults/ownership/prior evidence preserved. Ignored-inclusive source/helper/Python/executable/archive artifacts0; pinned source hashes unchanged; doctor/routing/diff pass; recorded outcomes, same-actor exact semantic quality review, canonical finish and clean final tracked/untracked.

## Verification

Pending before/after checks. Tests only exercise owned app/fixtures and must pass with pinned upstream absent. Static CLI provenance/resource/parity source reads are separate from tests.

## Rollback Plan

Revert semantic iteration80 commit only through a new authorized task if needed, preserve task outcomes/history and registered deviations.

## Findings

Preflight direct/main clean; C9TN6M only DOING parent. Previous turn is progress: iteration79 DONE b2902b94e5d7; source-bearing legacy archive separately removed b23c4f18c359. F10 missing in local browser code. Native HandleKeyEvent KEY_MENU ignores Shift, activates first item without auto-popup, deactivates next press; MenuBar ImplHandleKeyEvent gates displayability/enabled/input-enabled/modal; popup KEY_MENU forwards to root. Backend maps unhandled F10 alternate to KEY_MENU. Native platform/system menu/Alt/F6 scopes not completed. Read-only guessed nonexistent paths produced errors; actual source routing/functions found within repo, no mutation or outside access.
