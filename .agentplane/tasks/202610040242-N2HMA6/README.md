---
id: "202610040242-N2HMA6"
title: "Restore managed Sidebar Tab and arrow focus traversal"
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
  updated_at: "2026-10-04T02:46:49.326Z"
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
    body: "Start: standing user parity goal; one managed Sidebar Tab/arrows task, no Agentplane sources/helpers and no upstream execution from tests."
events:
  -
    type: "status"
    at: "2026-10-04T02:46:49.751Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing user parity goal; one managed Sidebar Tab/arrows task, no Agentplane sources/helpers and no upstream execution from tests."
doc_version: 3
doc_updated_at: "2026-10-04T02:46:49.751Z"
doc_updated_by: "CODER"
description: "Iteration86: restore the source-owned navigation graph of existing Sidebar deck/panel controls, using a scoped focus manager with panel registration, actual display order and native ShowPanel open/expand contract; preserve Escape/Return and registered deviations."
sections:
  Summary: "Iteration 86: restore managed Tab and arrow traversal across the implemented Sidebar deck closer, Properties activation button, panel title, title toolbar and content, following pinned Sfx2 FocusManager."
  Scope: "Eight semantic paths only: SidebarDeck.tsx, SidebarPanel.tsx, new SidebarFocusManager.ts and SidebarFocusManager.test.tsx under apps/office/src/sfx2/browser/presentation; new apps/office/src/sw/browser/presentation/writer-view-sidebar-navigation.test.tsx; new apps/office/e2e/writer-sidebar-navigation.spec.ts; docs/program/source-provenance.json; docs/program/runtime-inventory.json. Preserve all 268 previous tests byte-for-byte, all 217 prior inventory/provenance rows and status/default/owner fields; append evidence/responsibility to Deck and Panel and one local browser manager row (218 rows). Own task metadata and bounded result/hash evidence permitted. No core, resource, policy, exception or save/open/recovery changes. No source or helper scripts in Agentplane."
  Plan: "Use the standing user goal as explicit authorization. First reproduce the missing owned Writer navigation. Add a local manager/context that registers panel references, orders them by actual DOM order and unregisters on teardown. Deck supplies own closer/rail refs and ShowPanel opening. Forward Tab enters toolbar then content, closer Tab (including Shift) enters rail, rail forward Tab enters/expands first panel and opens deck, rail Shift Tab attempts deck title focus without activation. Panel arrows move to previous/next expanded title with deck-title/rail boundaries; rail Up/Down wraps implemented buttons, Left/Right remains unconsumed. Standalone panels, local content keys, existing Enter/Escape and commands remain intact. Verify actual managed composition including reorder/removal and multiple isolated decks. Inspect pinned source read-only; store hashes/conclusions only. Do not invoke pinned upstream from tests, compile it or execute native probes. Run focused checks/build/browser, full verify, then application/script/browser tests with vendor temporarily absent and restore finally. Record exact semantic commit and same-actor quality review; close leaf and append bounded parent progress."
  Verify Steps: "1. Read-only pinned FocusManager/SidebarController/Deck/TabBar/TitleBar/DockingWindow inspection and hash evidence; no source copies. 2. New Writer baseline demonstrates missing Tab/arrows, then focused owned runtime tests and freshly built focused browser tests pass. 3. Scope integrity proves 268 previous test files unchanged, 217 prior rows preserved with only two append-only evidence/responsibility updates plus one manager row; eight semantic paths only. 4. npm run verify passes: application and browser tests, static provenance/resource/inventory audits, coverage 100% and zero semantic module violations. Static CLI audits may read pinned files separately; tests must not. 5. With vendor/libreoffice-reference temporarily renamed inside vendor, npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e all pass; restore vendor finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass (two preexisting doctor warnings only). 7. Ignored-inclusive Agentplane artifact audit reports zero Python/helper/source/archive/embedded diff bodies; exact semantic hash reviewed by EVALUATOR, final clean tracked/untracked state."
  Verification: "Pending implementation and declared checks; no parity claims from source inspection alone."
  Rollback Plan: "Revert the isolated semantic commit if required, retain task result/hash evidence. Offline verification always restores vendor in finally. No history rewriting."
  Findings: "Current base ee2509d41cfaed1fd49b619d84a3a9b3715054f5; previous Escape iteration DONE. Native ShowPanel opens closed deck; FocusDeckTitle does not. Closed hidden-title/toolkit focus flags, native scrolling geometry, F6, settings/other decks, titleless fallback, contexts and whole Sidebar/parent/native parity remain open. Current-turn ignored-inclusive .agentplane audit examined 2947 files: zero .py/.pyc/.pyo/.ipynb and zero helper source files under tasks/tmp. No new source copies or executable helper files will be saved."
id_source: "generated"
---
## Summary

Iteration 86: restore managed Tab and arrow traversal across the implemented Sidebar deck closer, Properties activation button, panel title, title toolbar and content, following pinned Sfx2 FocusManager.

## Scope

Eight semantic paths only: SidebarDeck.tsx, SidebarPanel.tsx, new SidebarFocusManager.ts and SidebarFocusManager.test.tsx under apps/office/src/sfx2/browser/presentation; new apps/office/src/sw/browser/presentation/writer-view-sidebar-navigation.test.tsx; new apps/office/e2e/writer-sidebar-navigation.spec.ts; docs/program/source-provenance.json; docs/program/runtime-inventory.json. Preserve all 268 previous tests byte-for-byte, all 217 prior inventory/provenance rows and status/default/owner fields; append evidence/responsibility to Deck and Panel and one local browser manager row (218 rows). Own task metadata and bounded result/hash evidence permitted. No core, resource, policy, exception or save/open/recovery changes. No source or helper scripts in Agentplane.

## Plan

Use the standing user goal as explicit authorization. First reproduce the missing owned Writer navigation. Add a local manager/context that registers panel references, orders them by actual DOM order and unregisters on teardown. Deck supplies own closer/rail refs and ShowPanel opening. Forward Tab enters toolbar then content, closer Tab (including Shift) enters rail, rail forward Tab enters/expands first panel and opens deck, rail Shift Tab attempts deck title focus without activation. Panel arrows move to previous/next expanded title with deck-title/rail boundaries; rail Up/Down wraps implemented buttons, Left/Right remains unconsumed. Standalone panels, local content keys, existing Enter/Escape and commands remain intact. Verify actual managed composition including reorder/removal and multiple isolated decks. Inspect pinned source read-only; store hashes/conclusions only. Do not invoke pinned upstream from tests, compile it or execute native probes. Run focused checks/build/browser, full verify, then application/script/browser tests with vendor temporarily absent and restore finally. Record exact semantic commit and same-actor quality review; close leaf and append bounded parent progress.

## Verify Steps

1. Read-only pinned FocusManager/SidebarController/Deck/TabBar/TitleBar/DockingWindow inspection and hash evidence; no source copies. 2. New Writer baseline demonstrates missing Tab/arrows, then focused owned runtime tests and freshly built focused browser tests pass. 3. Scope integrity proves 268 previous test files unchanged, 217 prior rows preserved with only two append-only evidence/responsibility updates plus one manager row; eight semantic paths only. 4. npm run verify passes: application and browser tests, static provenance/resource/inventory audits, coverage 100% and zero semantic module violations. Static CLI audits may read pinned files separately; tests must not. 5. With vendor/libreoffice-reference temporarily renamed inside vendor, npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e all pass; restore vendor finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass (two preexisting doctor warnings only). 7. Ignored-inclusive Agentplane artifact audit reports zero Python/helper/source/archive/embedded diff bodies; exact semantic hash reviewed by EVALUATOR, final clean tracked/untracked state.

## Verification

Pending implementation and declared checks; no parity claims from source inspection alone.

## Rollback Plan

Revert the isolated semantic commit if required, retain task result/hash evidence. Offline verification always restores vendor in finally. No history rewriting.

## Findings

Current base ee2509d41cfaed1fd49b619d84a3a9b3715054f5; previous Escape iteration DONE. Native ShowPanel opens closed deck; FocusDeckTitle does not. Closed hidden-title/toolkit focus flags, native scrolling geometry, F6, settings/other decks, titleless fallback, contexts and whole Sidebar/parent/native parity remain open. Current-turn ignored-inclusive .agentplane audit examined 2947 files: zero .py/.pyc/.pyo/.ipynb and zero helper source files under tasks/tmp. No new source copies or executable helper files will be saved.
