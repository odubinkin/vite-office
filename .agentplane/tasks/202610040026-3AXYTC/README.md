---
id: "202610040026-3AXYTC"
title: "Route Writer Ctrl-F6 directly to its document client"
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
  updated_at: "2026-10-04T00:26:57.532Z"
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
    body: "Start: implement authorized iteration81 direct-document Ctrl-F6 at Writer browser frame with existing modal gates/focus-loss cleanup, owned tests only and no source/helper/Python artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T00:26:57.986Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement authorized iteration81 direct-document Ctrl-F6 at Writer browser frame with existing modal gates/focus-loss cleanup, owned tests only and no source/helper/Python artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T00:26:57.986Z"
doc_updated_by: "CODER"
description: "Iteration81 under C9TN6M: source-shaped active Writer frame Ctrl-F6 focus route, menu loss cleanup and saved-owner disposal, shared modal input eligibility. No core/save/open/recovery behavior changes or upstream test dependency/source/helper artifacts."
sections:
  Summary: "Iteration81 implements the native direct-document Ctrl-F6 route for the existing Writer browser frame."
  Scope: "Five semantic paths: writer-view.tsx (one shared active/modal eligibility value used by existing F10 and new Ctrl-F6 effect, mounted editing-host focus only), new writer-view-document-key.test.tsx, new writer-document-key.spec.ts, existing writer-view evidence row append-only in source-provenance.json/runtime-inventory.json. All255prior test/spec byte-identical, all215rows/status/defaults/ownership/prior evidence preserved. No other implementation/core/commands/resources/save/open/recovery changes or source/helpers/Python/binary/archive artifacts. Full plain/Shift-F6 pane cycle/platform/global focus/native whole-menu parity remain open."
  Plan: "1. Manual read-only complete native SystemWindow PreNotify/EventNotify, Window GrabFocusToDocument/ImplGrabFocusToDocument/ImplGrabFocus eligibility and MenuBarWindow LoseFocus/ChangeHighlightItem, popup Ctrl-F6 routing and TaskPaneList cycle inspected at exact pin; hashes/conclusions only. 2. Owned actual Writer cases expose missing direct document route from toolbar, first-root activation and root/child popup, ignore saved toolbar restoration, subsequent F10 cycle saves new document, no Execute; active frame changes/listener lifetime/modifier shape/prevented key/current modal dialogs. 3. One frame-owned effect routes F6+Ctrl without Shift using shared active/modal eligibility and current mounted editing host. Existing menubar blur closes and consumes its cycle without restoring toolbar. Native SystemWindow key shape accepts additional Alt/Meta; test preservation of CtrlShift/bare/Shift/nonF6 and native extra-modifier route without claiming full platform mapping. 4. Real Chromium toolbar/root/nested focus+typing and Hyperlink modal, append bounded evidence only. 5. Focused, full npm run verify100%coverage0semantic; vendor-absent npm run test/3noninventory script tests/npm run test:e2e sequential/restoredfinally. Exact255prior bytes,215row manifests1evidence-only row each,1production bounded inverse/hash proof, ignored-inclusive storage sources/helpers/Python/exe/archives0 plus signature scan, source hashes unchanged,doctor/routing/diff. 6. Semantic commit, same-actor separate EVALUATOR exactSHA, canonical finish and parent progress, leave goal active."
  Verify Steps: "Complete relevant manual read-only pinned functions inspected/no native execution or copying. Before/after owned real Writer Ctrl-F6 from toolbar and activated root/root-popup/child-popup focuses own editinghost, closes popup and discards saved toolbar without Execute, next F10 restores document; active-frame and mounted lifetime checks; original key condition F6+Ctrl&&!Shift includes extra Alt/Meta; prevented/unhandled keys remain owned by caller. Current paragraph/Hyperlink/bookmark/break/page/table/line-numbering/file modal eligibility rejects document focus; actual Chromium toolbar/root/child focus+typing and modal Hyperlink assertions. All255prior tests byte-identical;215row manifests exactly1append-only evidence row each preserve statuses/defaults/ownership/prior evidence; exact1production inverse proof. npm run verify allpass100%coverage0semantic; sequential vendor-absent npm run test, npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts, npm run test:e2e allpass/restoredfinally. Static upstream resource/provenance/parity CLI audits run separately with source present; tests never read/compile/invoke pinned upstream. Source/semantic hashes unchanged, ignored-inclusive artifact source/helper/Python/executable/archive0 plus embedded signature candidates0,doctor0errors2knownwarnings/routing/diff, same-actor exactSHA quality and clean final state."
  Verification: "Pending owned before/after, full and vendor-absent test evidence. Native source is used only for manual read-only reasoning and separate static CLI audits."
  Rollback Plan: "If needed revert only the semantic iteration81 commit through a new authorized task, preserving history/outcomes and registered deviations."
  Findings: "Previous turn is progress: iteration80 DONE bff74e64d720 implemented eligible bare-F10 cycle; cleanmain current base2a56dd8e8704. Native SystemWindow PreNotify routes Ctrl-F6 without Shift directly to document, independent of saved focus; Window ImplGrabFocusToDocument walks own frame and grabs client, ImplGrabFocus rejects disabled/input-disabled/modal. Native menubar LoseFocus consumes current cycle without restoring saved owner. Browser has no Ctrl-F6 path; mounted own editinghost and all modal states already available. A read-only guessed accelerator filename was absent; rg files located use-command-shortcuts instead, no mutation/outside access. No-source/helpers/Python contract retained; separate cleanup commits4bf67a647e07/b23c4f18c359 already landed."
id_source: "generated"
---
## Summary

Iteration81 implements the native direct-document Ctrl-F6 route for the existing Writer browser frame.

## Scope

Five semantic paths: writer-view.tsx (one shared active/modal eligibility value used by existing F10 and new Ctrl-F6 effect, mounted editing-host focus only), new writer-view-document-key.test.tsx, new writer-document-key.spec.ts, existing writer-view evidence row append-only in source-provenance.json/runtime-inventory.json. All255prior test/spec byte-identical, all215rows/status/defaults/ownership/prior evidence preserved. No other implementation/core/commands/resources/save/open/recovery changes or source/helpers/Python/binary/archive artifacts. Full plain/Shift-F6 pane cycle/platform/global focus/native whole-menu parity remain open.

## Plan

1. Manual read-only complete native SystemWindow PreNotify/EventNotify, Window GrabFocusToDocument/ImplGrabFocusToDocument/ImplGrabFocus eligibility and MenuBarWindow LoseFocus/ChangeHighlightItem, popup Ctrl-F6 routing and TaskPaneList cycle inspected at exact pin; hashes/conclusions only. 2. Owned actual Writer cases expose missing direct document route from toolbar, first-root activation and root/child popup, ignore saved toolbar restoration, subsequent F10 cycle saves new document, no Execute; active frame changes/listener lifetime/modifier shape/prevented key/current modal dialogs. 3. One frame-owned effect routes F6+Ctrl without Shift using shared active/modal eligibility and current mounted editing host. Existing menubar blur closes and consumes its cycle without restoring toolbar. Native SystemWindow key shape accepts additional Alt/Meta; test preservation of CtrlShift/bare/Shift/nonF6 and native extra-modifier route without claiming full platform mapping. 4. Real Chromium toolbar/root/nested focus+typing and Hyperlink modal, append bounded evidence only. 5. Focused, full npm run verify100%coverage0semantic; vendor-absent npm run test/3noninventory script tests/npm run test:e2e sequential/restoredfinally. Exact255prior bytes,215row manifests1evidence-only row each,1production bounded inverse/hash proof, ignored-inclusive storage sources/helpers/Python/exe/archives0 plus signature scan, source hashes unchanged,doctor/routing/diff. 6. Semantic commit, same-actor separate EVALUATOR exactSHA, canonical finish and parent progress, leave goal active.

## Verify Steps

Complete relevant manual read-only pinned functions inspected/no native execution or copying. Before/after owned real Writer Ctrl-F6 from toolbar and activated root/root-popup/child-popup focuses own editinghost, closes popup and discards saved toolbar without Execute, next F10 restores document; active-frame and mounted lifetime checks; original key condition F6+Ctrl&&!Shift includes extra Alt/Meta; prevented/unhandled keys remain owned by caller. Current paragraph/Hyperlink/bookmark/break/page/table/line-numbering/file modal eligibility rejects document focus; actual Chromium toolbar/root/child focus+typing and modal Hyperlink assertions. All255prior tests byte-identical;215row manifests exactly1append-only evidence row each preserve statuses/defaults/ownership/prior evidence; exact1production inverse proof. npm run verify allpass100%coverage0semantic; sequential vendor-absent npm run test, npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts, npm run test:e2e allpass/restoredfinally. Static upstream resource/provenance/parity CLI audits run separately with source present; tests never read/compile/invoke pinned upstream. Source/semantic hashes unchanged, ignored-inclusive artifact source/helper/Python/executable/archive0 plus embedded signature candidates0,doctor0errors2knownwarnings/routing/diff, same-actor exactSHA quality and clean final state.

## Verification

Pending owned before/after, full and vendor-absent test evidence. Native source is used only for manual read-only reasoning and separate static CLI audits.

## Rollback Plan

If needed revert only the semantic iteration81 commit through a new authorized task, preserving history/outcomes and registered deviations.

## Findings

Previous turn is progress: iteration80 DONE bff74e64d720 implemented eligible bare-F10 cycle; cleanmain current base2a56dd8e8704. Native SystemWindow PreNotify routes Ctrl-F6 without Shift directly to document, independent of saved focus; Window ImplGrabFocusToDocument walks own frame and grabs client, ImplGrabFocus rejects disabled/input-disabled/modal. Native menubar LoseFocus consumes current cycle without restoring saved owner. Browser has no Ctrl-F6 path; mounted own editinghost and all modal states already available. A read-only guessed accelerator filename was absent; rg files located use-command-shortcuts instead, no mutation/outside access. No-source/helpers/Python contract retained; separate cleanup commits4bf67a647e07/b23c4f18c359 already landed.
