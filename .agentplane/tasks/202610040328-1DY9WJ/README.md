---
id: "202610040328-1DY9WJ"
title: "Restore Sidebar ShowPanel viewport adjustment after focus"
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
  updated_at: "2026-10-04T03:29:31.994Z"
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
    body: "Start: standing parity goal, one owned Sidebar ShowPanel scroll correction; no upstream execution or source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T03:29:32.519Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing parity goal, one owned Sidebar ShowPanel scroll correction; no upstream execution or source/helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T03:29:32.519Z"
doc_updated_by: "CODER"
description: "Iteration87: adapt pinned Deck ShowPanel extent and adjustment contract to existing owned Sidebar scrollport after expansion/focus, including content Escape; preserve old tests, statuses and intentional save/open/recovery deviations."
sections:
  Summary: "Iteration87: restore the existing Sidebar Deck ShowPanel viewport adjustment after expanded title focus, including content Escape."
  Scope: "Eight semantic paths: apps/office/src/sfx2/browser/presentation/SidebarDeck.tsx, SidebarFocusManager.ts, SidebarPanel.tsx; new apps/office/src/sfx2/browser/presentation/SidebarDeck-scroll.test.tsx; new apps/office/src/sw/browser/presentation/writer-view-sidebar-scroll.test.tsx; new apps/office/e2e/writer-sidebar-scroll.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All271 previous test/spec files byte-identical. All218 prior rows/order/status/default/owner/exception fields preserved; append only evidence/responsibility for Deck/Panel/FocusManager. Own task metadata and bounded result/hash evidence only. No core/resource/policy/save/open/recovery changes."
  Plan: "Standing user goal authorizes this safe local correction. Reproduce missing scroll adjustment on actual owned Writer frames. Adapt source FocusManager FocusPanel to open browser visibility before DOM focus, expand/focus title, then invoke Deck ShowPanel with that panel reference. Bind a separate optional post-focus ShowPanel callback in the existing manager, preserving its existing three-callback clients. Compute viewport-relative content extents from own DOM refs and scrollTop, map native closed Rectangle Bottom then additional minus-one, apply native bottom/page-size adjustment followed by top priority for oversized panels. Skip nonoverflow browser viewport. Managed content Escape resolves its registered index and routes through FocusPanel; standalone behavior remains. Test literal native rectangle/scroll cases with controlled owned DOM geometry, post-expansion order and two isolated decks; real Writer no-dispatch/model and measured desktop/mobile browser focus/scroll/editing. Read pinned sources only, hashes/conclusions only. Fullverify then all app/tool/browser tests with vendor absent and finally restore. Exact semantic same-actor quality, close leaf, parent progress; no whole native parity claim."
  Verify Steps: "1. Read-only source inspection of Deck::ShowPanel, Panel::get_extents, closed Rectangle constructor/Bottom, FocusManager::FocusPanel, SidebarController::ShowPanel and deck viewport resource; hashes only, no native compile/execute. 2. New actual Writer baseline fails missing viewport adjustment; focused owned units, fresh build and two Chromium widths pass positive/empty extents, below/above/visible/oversized panels, nonoverflow policy, expansion/focus-before-adjustment, Escape and own deck isolation. 3. Prove eight semantic paths,271 old test bytes unchanged,218 prior rows retained with only3 append-only evidence/responsibility updates, no promotions/exceptions. 4. npm run verify passes all application/inventory/browser/resource/static provenance audits,100%app/inventory coverage and0semantic violations. These static CLI audits separately read pinned files; tests never invoke pinned upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restore finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass with only two known warnings; final ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. EVALUATOR same actor exact semantic SHA pass; final clean state, leaf DONE and parent remains open."
  Verification: "Pending scoped implementation and declared checks."
  Rollback Plan: "Revert isolated semantic commit if needed; keep bounded task result/hash evidence. Vendor restoration always runs in finally; no history rewrite."
  Findings: "Base4a28a66c4db5554f3c95b204a92b158a88d8334d clean main/direct; preceding goal turn is progress (Sidebar navigation DONE6084e42a4575 and requested artifact cleanup DONE). Native Panel constructs a closed tools::Rectangle, so positive-height Bottom is top+height-1 and Deck ShowPanel uses another minus-one. Current browser manager only opens before focus and omits post-focus panel scroll; content Escape bypasses manager. Native ScrollPolicy/failed toolkit extent/DPI/rounding/outer sizing/context/native focus flags/F6/settings/other decks and whole Sidebar/native/parent parity remain open. Preserve conscious exceptions; no source/helper files or source-bearing logs in Agentplane."
id_source: "generated"
---
## Summary

Iteration87: restore the existing Sidebar Deck ShowPanel viewport adjustment after expanded title focus, including content Escape.

## Scope

Eight semantic paths: apps/office/src/sfx2/browser/presentation/SidebarDeck.tsx, SidebarFocusManager.ts, SidebarPanel.tsx; new apps/office/src/sfx2/browser/presentation/SidebarDeck-scroll.test.tsx; new apps/office/src/sw/browser/presentation/writer-view-sidebar-scroll.test.tsx; new apps/office/e2e/writer-sidebar-scroll.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All271 previous test/spec files byte-identical. All218 prior rows/order/status/default/owner/exception fields preserved; append only evidence/responsibility for Deck/Panel/FocusManager. Own task metadata and bounded result/hash evidence only. No core/resource/policy/save/open/recovery changes.

## Plan

Standing user goal authorizes this safe local correction. Reproduce missing scroll adjustment on actual owned Writer frames. Adapt source FocusManager FocusPanel to open browser visibility before DOM focus, expand/focus title, then invoke Deck ShowPanel with that panel reference. Bind a separate optional post-focus ShowPanel callback in the existing manager, preserving its existing three-callback clients. Compute viewport-relative content extents from own DOM refs and scrollTop, map native closed Rectangle Bottom then additional minus-one, apply native bottom/page-size adjustment followed by top priority for oversized panels. Skip nonoverflow browser viewport. Managed content Escape resolves its registered index and routes through FocusPanel; standalone behavior remains. Test literal native rectangle/scroll cases with controlled owned DOM geometry, post-expansion order and two isolated decks; real Writer no-dispatch/model and measured desktop/mobile browser focus/scroll/editing. Read pinned sources only, hashes/conclusions only. Fullverify then all app/tool/browser tests with vendor absent and finally restore. Exact semantic same-actor quality, close leaf, parent progress; no whole native parity claim.

## Verify Steps

1. Read-only source inspection of Deck::ShowPanel, Panel::get_extents, closed Rectangle constructor/Bottom, FocusManager::FocusPanel, SidebarController::ShowPanel and deck viewport resource; hashes only, no native compile/execute. 2. New actual Writer baseline fails missing viewport adjustment; focused owned units, fresh build and two Chromium widths pass positive/empty extents, below/above/visible/oversized panels, nonoverflow policy, expansion/focus-before-adjustment, Escape and own deck isolation. 3. Prove eight semantic paths,271 old test bytes unchanged,218 prior rows retained with only3 append-only evidence/responsibility updates, no promotions/exceptions. 4. npm run verify passes all application/inventory/browser/resource/static provenance audits,100%app/inventory coverage and0semantic violations. These static CLI audits separately read pinned files; tests never invoke pinned upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restore finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass with only two known warnings; final ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. EVALUATOR same actor exact semantic SHA pass; final clean state, leaf DONE and parent remains open.

## Verification

Pending scoped implementation and declared checks.

## Rollback Plan

Revert isolated semantic commit if needed; keep bounded task result/hash evidence. Vendor restoration always runs in finally; no history rewrite.

## Findings

Base4a28a66c4db5554f3c95b204a92b158a88d8334d clean main/direct; preceding goal turn is progress (Sidebar navigation DONE6084e42a4575 and requested artifact cleanup DONE). Native Panel constructs a closed tools::Rectangle, so positive-height Bottom is top+height-1 and Deck ShowPanel uses another minus-one. Current browser manager only opens before focus and omits post-focus panel scroll; content Escape bypasses manager. Native ScrollPolicy/failed toolkit extent/DPI/rounding/outer sizing/context/native focus flags/F6/settings/other decks and whole Sidebar/native/parent parity remain open. Preserve conscious exceptions; no source/helper files or source-bearing logs in Agentplane.
