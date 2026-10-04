---
id: "202610040050-SDXKHQ"
title: "Synchronize active root popup with menubar Home and End"
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
  updated_at: "2026-10-04T00:51:26.566Z"
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
    body: "Start: implement authorized iteration82 common root arrows/Home/End navigation with native active-popup selection and unchanged focus/dispatch, upstream-independent tests and no source/helper/Python artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T00:51:27.037Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement authorized iteration82 common root arrows/Home/End navigation with native active-popup selection and unchanged focus/dispatch, upstream-independent tests and no source/helper/Python artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T00:51:27.037Z"
doc_updated_by: "CODER"
description: "Iteration82 under C9TN6M: native-shaped common root navigation for arrows/Home/End, active popup follows selected root with first-item keyboard preselection; no popup before keyboard activation. Preserve current child popup and saved-owner lifecycle, registered save/open/recovery and upstream-independent tests."
sections:
  Summary: "Iteration82 synchronizes an already open root popup with Home/End menubar navigation and shares the native-shaped root navigation path."
  Scope: "Five semantic paths: CommandMenuBar.tsx (unify Left/Right/Home/End trigger navigation and reuse existing openMenu(next,true) only when a popup is already open), new CommandMenuBar-root-boundary.test.tsx, new writer-root-menu-boundary.spec.ts; append-only existing CommandMenuBar evidence row in source-provenance.json/runtime-inventory.json. All257prior tests/specs byte-identical, all215rows/status/defaults/ownership/old evidence preserved. No popup/child handlers/focus/dispatch/core/resources/save/open/recovery changes or source/helper/Python/binary/archive artifacts. Whole F6 pane traversal, Sidebar deck focus composition, Alt/mnemonics/platform/native flags remain open."
  Plan: "1. Manual exact-pin complete MenuBarWindow HandleKeyEvent/ChangeHighlightItem/ImplCreatePopup inspected; root arrows/Home/End all select via same ChangeHighlightItem(n,true), active auto-popup follows root with keyboard preselection, inactive auto-popup does not open. Hashes/conclusions only. 2. Owned cases fail for Home/End active root/popup child replacement, first eligible selection, keyboard-only unopened navigation, arrow wrap/active open, same-root reuse/current selection, stable rerenders and saved owner/no dispatch. Chromium root trigger Home/End switches actual menus, keeps popup closed during F10 activation, Escape returns editinghost and typing. 3. One grouped root navigation branch for arrows/Home/End preserving old arrow contract and existing popup lifecycle. 4. Append evidence1row each, keep semantic/default/ownership statuses unchanged. 5. Focused/fullverify100%coverage0semantic, vendor-absent app/inventory/3script/browser tests allpass sequential/restoredfinally;257oldtests/exact1production inverse/215rows1evidence-only per manifest/source/semantic hashes/artifact source/helpers/Python/exe/archive/magic/signatures0,doctor/routing/diff. 6. Semantic commit,same-actor separate EVALUATOR at exactsemantic,canonicalfinish,parent progress;goalactive."
  Verify Steps: "Read-only complete relevant native functions at pin9bc445578031fecf56086729d8e4940c77e14d65, no native run/compile/copy. Before/after owned Home/End already-open root popup follows selected root, closes former child popup, keyboard preselects first eligible entry; no-popup Home/End remains unopened, arrows Left/Right retain wrap/active-popup behavior, same-root active popup reused without new preselection, rerender does not reset later selection, saved external owner restored on cancellation and no Execute during navigation. Chromium rebuilt current app active Home/End popup replacement plus no-popup F10 boundary navigation and focus-plus-typing. All257previous tests byte-identical, exact1production inverse;215rows1append-only evidence row each retain statuses/defaults/ownership/old evidence. npm run verify allpass100%coverage0semantic, sequential vendor root absent npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e, restore finally. Static source-reading CLI audits separate from upstream-independent tests. Hashes unchanged, ignored-inclusive artifact source/helpers/Python/exe/archive/ZIP-GZIP magic/embedded signatures0,doctor0errors2knownwarnings/routing/diff pass; exactsemantic same-actor quality,canonicalfinish and clean final state."
  Verification: "Pending initial/corrected owned and real Chromium checks/full/vendor-absent verification. No test reads, compiles or invokes pinned upstream."
  Rollback Plan: "Revert only semantic iteration82 commit through a new authorized task if required, preserve history/results/registered deviations."
  Findings: "Previous turn progress: iteration81 DONE b9a6501881aa implements native direct-document Ctrl-F6; currentcleanmain basefeeeeadde07e. Read-only F6 TaskPaneList/SystemWindow/ToolBox/Sidebar registration and FocusManager inspection found wider pane focus/Sidebar deck-title composition gaps, still open. Independent existing root navigation bug: Home/End updates active root but never calls openMenu, whereas native grouped arrows/Home/End ChangeHighlightItem(n,true) updates active auto-popup and first-item preselection. Correct one coherent root boundary navigation contract now. Native complete popup create/grouped root key/change-highlight read manually, no codecopies/probes. Some guessed optional path lookups absent; rg files identified actual owners in repo, no mutations/outside access. User source/helper/Python/storage restriction remains binding."
id_source: "generated"
---
## Summary

Iteration82 synchronizes an already open root popup with Home/End menubar navigation and shares the native-shaped root navigation path.

## Scope

Five semantic paths: CommandMenuBar.tsx (unify Left/Right/Home/End trigger navigation and reuse existing openMenu(next,true) only when a popup is already open), new CommandMenuBar-root-boundary.test.tsx, new writer-root-menu-boundary.spec.ts; append-only existing CommandMenuBar evidence row in source-provenance.json/runtime-inventory.json. All257prior tests/specs byte-identical, all215rows/status/defaults/ownership/old evidence preserved. No popup/child handlers/focus/dispatch/core/resources/save/open/recovery changes or source/helper/Python/binary/archive artifacts. Whole F6 pane traversal, Sidebar deck focus composition, Alt/mnemonics/platform/native flags remain open.

## Plan

1. Manual exact-pin complete MenuBarWindow HandleKeyEvent/ChangeHighlightItem/ImplCreatePopup inspected; root arrows/Home/End all select via same ChangeHighlightItem(n,true), active auto-popup follows root with keyboard preselection, inactive auto-popup does not open. Hashes/conclusions only. 2. Owned cases fail for Home/End active root/popup child replacement, first eligible selection, keyboard-only unopened navigation, arrow wrap/active open, same-root reuse/current selection, stable rerenders and saved owner/no dispatch. Chromium root trigger Home/End switches actual menus, keeps popup closed during F10 activation, Escape returns editinghost and typing. 3. One grouped root navigation branch for arrows/Home/End preserving old arrow contract and existing popup lifecycle. 4. Append evidence1row each, keep semantic/default/ownership statuses unchanged. 5. Focused/fullverify100%coverage0semantic, vendor-absent app/inventory/3script/browser tests allpass sequential/restoredfinally;257oldtests/exact1production inverse/215rows1evidence-only per manifest/source/semantic hashes/artifact source/helpers/Python/exe/archive/magic/signatures0,doctor/routing/diff. 6. Semantic commit,same-actor separate EVALUATOR at exactsemantic,canonicalfinish,parent progress;goalactive.

## Verify Steps

Read-only complete relevant native functions at pin9bc445578031fecf56086729d8e4940c77e14d65, no native run/compile/copy. Before/after owned Home/End already-open root popup follows selected root, closes former child popup, keyboard preselects first eligible entry; no-popup Home/End remains unopened, arrows Left/Right retain wrap/active-popup behavior, same-root active popup reused without new preselection, rerender does not reset later selection, saved external owner restored on cancellation and no Execute during navigation. Chromium rebuilt current app active Home/End popup replacement plus no-popup F10 boundary navigation and focus-plus-typing. All257previous tests byte-identical, exact1production inverse;215rows1append-only evidence row each retain statuses/defaults/ownership/old evidence. npm run verify allpass100%coverage0semantic, sequential vendor root absent npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e, restore finally. Static source-reading CLI audits separate from upstream-independent tests. Hashes unchanged, ignored-inclusive artifact source/helpers/Python/exe/archive/ZIP-GZIP magic/embedded signatures0,doctor0errors2knownwarnings/routing/diff pass; exactsemantic same-actor quality,canonicalfinish and clean final state.

## Verification

Pending initial/corrected owned and real Chromium checks/full/vendor-absent verification. No test reads, compiles or invokes pinned upstream.

## Rollback Plan

Revert only semantic iteration82 commit through a new authorized task if required, preserve history/results/registered deviations.

## Findings

Previous turn progress: iteration81 DONE b9a6501881aa implements native direct-document Ctrl-F6; currentcleanmain basefeeeeadde07e. Read-only F6 TaskPaneList/SystemWindow/ToolBox/Sidebar registration and FocusManager inspection found wider pane focus/Sidebar deck-title composition gaps, still open. Independent existing root navigation bug: Home/End updates active root but never calls openMenu, whereas native grouped arrows/Home/End ChangeHighlightItem(n,true) updates active auto-popup and first-item preselection. Correct one coherent root boundary navigation contract now. Native complete popup create/grouped root key/change-highlight read manually, no codecopies/probes. Some guessed optional path lookups absent; rg files identified actual owners in repo, no mutations/outside access. User source/helper/Python/storage restriction remains binding.
