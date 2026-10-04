---
id: "202610040417-Y6BJBP"
title: "Restore Sidebar docking key isolation before document accelerators"
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
  updated_at: "2026-10-04T04:18:25.173Z"
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
    body: "Start: standing parity goal,one owned Sidebar docking keyboard boundary correction;source/hash/result evidence only,no upstream test invocation or helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T04:18:25.649Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing parity goal,one owned Sidebar docking keyboard boundary correction;source/hash/result evidence only,no upstream test invocation or helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T04:18:25.649Z"
doc_updated_by: "CODER"
description: "Iteration89: project the pinned SidebarDockingWindow thirteen local key codes onto the existing owned browser boundary; isolate document Cut/Copy/Paste without cancelling native HTML widget defaults, preserve Undo/Redo and intentional save/open/recovery deviations."
sections:
  Summary: "Iteration89 restores the existing Sidebar docking keyboard boundary before document accelerators."
  Scope: "Seven semantic paths: new apps/office/src/sfx2/browser/presentation/SidebarDockingWindow.tsx and SidebarDockingWindow.test.tsx; existing SidebarDeck.tsx; new apps/office/src/sw/browser/presentation/writer-view-sidebar-key-isolation.test.tsx; new apps/office/e2e/writer-sidebar-key-isolation.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All277 prior test/spec files byte-identical. All218 prior manifest rows and order retained; append only evidence/responsibility for Deck plus one new local-only/unverified docking boundary row. No prior status/default/owner/exception promotions. Own bounded result/hash evidence only; no source/helper files. No core/resource/command registry/policy or save/open/recovery changes."
  Plan: "Standing goal authorizes this safe local correction. Read pinned SidebarDockingWindow EventNotify and inherited SfxDockingWindow fallback without native compilation/execution. Reproduce actual Writer Sidebar Ctrl/Meta+Insert Copy,Shift+Delete Cut andShift+Insert Paste reaching document commands with owned injected clipboard ports. Extract the existing aside into a SidebarDockingWindow browser component, preserving exact markup/props/layout while stopping bubbling of the thirteen native local key codes after child handling regardless of modifiers. DOM defaults stay available so local inputs and buttons retain browser editing/activation; existing title/toolbox/rail handlers keep priority. Other keys including Undo/Redo and ordinary formatting remain on existing frame accelerator route. New local unit matrix independently lists source keys, modifiers, consumed child events, defaults and sibling isolation; actual Writer tests prove no lookup/dispatch/clipboard/model effects for blocked keys and real Undo/Redo/Bold fallback; measured Chromium verifies selected document unchanged,local text editing/Enter activation and subsequent document editing. Fullverify and vendor-absent tests, hashes/old-test/manifest proof, artifact audit, same-actor exact semantic quality; close leaf and record parent progress without claiming full native parity."
  Verify Steps: "1. Read-only pinned SidebarDockingWindow::EventNotify, SfxDockingWindow::EventNotify and relevant local dispatch/clipboard contracts; hashes/conclusions only, no source copies or native compilation/execution. 2. Actual Writer baseline fails leaked clipboard shortcuts; focused owned units verify all13 literal key codes with modifiers stop global lookup while retaining DOM defaults and existing local handlers, other keys/consumed events/siblings/lifetime; actual Writer confirms no clipboard/dispatch/model effects and Undo/Redo/Bold fallback. Fresh build and Chromium1280/390 selected-document isolation,real local editing/Enter activation and later document editing pass. 3. Exact7semantic paths,277prior test bytes unchanged,218prior manifest rows/order/status/default/owner/exception fields preserved;only1existing append-only update plus1new local-only/unverified row. 4. npm run verify passes app/inventory/browser/resource/static provenance checks,100%app/inventory coverage,0semantic violations. Static CLI audits separately read pinned inputs; tests never read/compile/invoke upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restore finally. 6. git diff --check,routing,doctor pass with known unrelated warnings; ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/code diff/archive audit0. 7. Same-actor EVALUATOR exact semantic SHA pass,clean final tracked state,leafDONE,parentDOING; whole native/goal remains open."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert isolated semantic commit if needed; keep bounded result/hash evidence and restore vendor in finally. No history rewrite."
  Findings: "Base f23eb9b0f5d87df8d62fad377752c7c3a3538130 clean main/direct. Previous goal turn is progress: iteration88 DONE d1ee0494af44, consumed-key accelerator guard. Native SidebarDockingWindow returns true for13 key codes regardless of modifiers before inherited global fallback. Current SidebarDeck has no such parent boundary, so modified Insert/Delete clipboard accelerators can act on the document from Sidebar. React bubbling must be stopped after child handlers while retaining native DOM defaults, since native VCL widgets process their own input before parent notification. Full native accelerator hierarchy,modal/input eligibility,DesignerDialog/styles,floating/docking mouse/F6/platform defaults and complete Sidebar/browser/native/parent parity remain open. Preserve intentional save/open/recovery deviations; no source/helper artifacts."
id_source: "generated"
---
## Summary

Iteration89 restores the existing Sidebar docking keyboard boundary before document accelerators.

## Scope

Seven semantic paths: new apps/office/src/sfx2/browser/presentation/SidebarDockingWindow.tsx and SidebarDockingWindow.test.tsx; existing SidebarDeck.tsx; new apps/office/src/sw/browser/presentation/writer-view-sidebar-key-isolation.test.tsx; new apps/office/e2e/writer-sidebar-key-isolation.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All277 prior test/spec files byte-identical. All218 prior manifest rows and order retained; append only evidence/responsibility for Deck plus one new local-only/unverified docking boundary row. No prior status/default/owner/exception promotions. Own bounded result/hash evidence only; no source/helper files. No core/resource/command registry/policy or save/open/recovery changes.

## Plan

Standing goal authorizes this safe local correction. Read pinned SidebarDockingWindow EventNotify and inherited SfxDockingWindow fallback without native compilation/execution. Reproduce actual Writer Sidebar Ctrl/Meta+Insert Copy,Shift+Delete Cut andShift+Insert Paste reaching document commands with owned injected clipboard ports. Extract the existing aside into a SidebarDockingWindow browser component, preserving exact markup/props/layout while stopping bubbling of the thirteen native local key codes after child handling regardless of modifiers. DOM defaults stay available so local inputs and buttons retain browser editing/activation; existing title/toolbox/rail handlers keep priority. Other keys including Undo/Redo and ordinary formatting remain on existing frame accelerator route. New local unit matrix independently lists source keys, modifiers, consumed child events, defaults and sibling isolation; actual Writer tests prove no lookup/dispatch/clipboard/model effects for blocked keys and real Undo/Redo/Bold fallback; measured Chromium verifies selected document unchanged,local text editing/Enter activation and subsequent document editing. Fullverify and vendor-absent tests, hashes/old-test/manifest proof, artifact audit, same-actor exact semantic quality; close leaf and record parent progress without claiming full native parity.

## Verify Steps

1. Read-only pinned SidebarDockingWindow::EventNotify, SfxDockingWindow::EventNotify and relevant local dispatch/clipboard contracts; hashes/conclusions only, no source copies or native compilation/execution. 2. Actual Writer baseline fails leaked clipboard shortcuts; focused owned units verify all13 literal key codes with modifiers stop global lookup while retaining DOM defaults and existing local handlers, other keys/consumed events/siblings/lifetime; actual Writer confirms no clipboard/dispatch/model effects and Undo/Redo/Bold fallback. Fresh build and Chromium1280/390 selected-document isolation,real local editing/Enter activation and later document editing pass. 3. Exact7semantic paths,277prior test bytes unchanged,218prior manifest rows/order/status/default/owner/exception fields preserved;only1existing append-only update plus1new local-only/unverified row. 4. npm run verify passes app/inventory/browser/resource/static provenance checks,100%app/inventory coverage,0semantic violations. Static CLI audits separately read pinned inputs; tests never read/compile/invoke upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restore finally. 6. git diff --check,routing,doctor pass with known unrelated warnings; ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/code diff/archive audit0. 7. Same-actor EVALUATOR exact semantic SHA pass,clean final tracked state,leafDONE,parentDOING; whole native/goal remains open.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert isolated semantic commit if needed; keep bounded result/hash evidence and restore vendor in finally. No history rewrite.

## Findings

Base f23eb9b0f5d87df8d62fad377752c7c3a3538130 clean main/direct. Previous goal turn is progress: iteration88 DONE d1ee0494af44, consumed-key accelerator guard. Native SidebarDockingWindow returns true for13 key codes regardless of modifiers before inherited global fallback. Current SidebarDeck has no such parent boundary, so modified Insert/Delete clipboard accelerators can act on the document from Sidebar. React bubbling must be stopped after child handlers while retaining native DOM defaults, since native VCL widgets process their own input before parent notification. Full native accelerator hierarchy,modal/input eligibility,DesignerDialog/styles,floating/docking mouse/F6/platform defaults and complete Sidebar/browser/native/parent parity remain open. Preserve intentional save/open/recovery deviations; no source/helper artifacts.
