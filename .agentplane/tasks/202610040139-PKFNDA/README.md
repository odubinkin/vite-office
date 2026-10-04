---
id: "202610040139-PKFNDA"
title: "Restore Paragraph sidebar panel expansion and More Options"
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
  updated_at: "2026-10-04T01:40:39.746Z"
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
    body: "Start: authorized iteration84 existing Paragraph expander/MoreOptions/Enter content focus, reuse source-owned dialog/bindings and retain content; upstream-independent tests,registered deviations preserved,results-only artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T01:40:40.153Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: authorized iteration84 existing Paragraph expander/MoreOptions/Enter content focus, reuse source-owned dialog/bindings and retain content; upstream-independent tests,registered deviations preserved,results-only artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T01:40:40.153Z"
doc_updated_by: "CODER"
description: "Iteration84 under C9TN6M: replace existing static Paragraph heading with native-shaped persistent expander and bindings-backed More Options for already implemented ParagraphDialog; preserve content/model/Sidebar lifecycle and registered save-open-recovery deviations."
sections:
  Summary: "Restore the existing Paragraph sidebar panel expander and bindings-backed More Options control for the already implemented ParagraphDialog."
  Scope: "Seven semantic paths: new apps/office/src/sfx2/browser/presentation/SidebarPanel.tsx and SidebarPanel.test.tsx; existing WriterPropertiesPanel.tsx; new WriterPropertiesPanel-controls.test.tsx and e2e/writer-sidebar-panel.spec.ts; source-provenance.json/runtime-inventory.json one existing evidence/responsibility row plus one new bounded browser-adaptation row.262prior test/spec files and216prior module rows/fields/status/defaults/ownership/evidence/order preserved. No generic command-control,core,generated resources,save/open/recovery or existing SidebarDeck changes. Parent/task metadata/results hashes only. Full panel/deck FocusManager Tab/Escape/arrows,F6,Help/settings/other panels/native sizing/persistence remain open, no new exceptions or module promotion."
  Plan: "1. Read pinned complete Panel constructor/SetExpanded/PanelTitleBar expand/more-options controller/FocusManager Enter/FocusPanelContent/resource Paragraph DefaultMenuCommand and matching current command path; hashes/conclusions only, no native run or source copies. 2. Actual Writer before-code tests show missing expander/options. Add source-owned generic sfx2 browser SidebarPanel retaining mounted children with native initial state, header expander and optional More Options content supplied from existing bindings-backed CommandButton. Enter expands then synchronously focuses first eligible actual paragraph control via local owning panel callback; Space remains button activation. 3. Replace static Paragraph heading with panel title retaining heading semantics, current content/controls, source label More Options and existing generated ParagraphDialog dispatch/arguments/controller state. 4. Owned expansion/mount/reprojection/default/no-toolbar/Enter/other keys and actual-session collapse/deck-cycle/bindings/dialog/model/first-enabled/no-enabled cases; rebuilt desktop/mobile Chromium Space/Enter/state/focus/MoreOptions native paragraph modal. 5.262oldbytes216priorrows one evidence-only row+one new row each,7semantic andsource hashes,doctor/routing/diff/source-helper-Python-exe-archive-magic-embedded signatures0. 6. Full verify100%coverage0semantic; sequential vendor-absent app/inventory/3script/browser tests restoredfinally; exactsemantic same-actor EVALUATOR,canonicalfinish,parent progress;goal remains active."
  Verify Steps: "Manual read-only exact pin9bc445578031fecf56086729d8e4940c77e14d65 relevant native Panel/PanelTitleBar/FocusManager/ResourceManager/Paragraph registry functions/resources, no copying/compile/native execution. Before/after actual Writer missing expander/options baseline. Owned initial open/explicit closed defaults, repeat toggle, mounted child draft/lifetime preserved, resources rerender preserve collapsed state, optional toolbar remains available collapsed/no-toolbar case, Enter expands before content focus without click toggle/dispatch, other keys preserved. Writer real sessions: panel collapse independent of deck/global visibility, restored current controls/model/bindings, More Options dispatches existing ParagraphDialog including while collapsed and cancel leaves collapsedstate; Enter focuses first enabled alignment control or leaves focus if no enabled control. Fresh desktop/mobile browser Space collapse, Enter opens/focus, visible header/options while collapsed, paragraph modal via options and focus-plus-editing on own client.262prior tests byte-identical;216prior row fields/status/defaults/ownership/old evidence/order preserved,one existing evidence-only row andone new bounded browser row each. npm run verify allpass100%coverage0semantic; sequential vendor root absent npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e, restore finally. Static vendor-reading CLI audits separate from upstream-independent tests. Source/semantic hashes intact,artifact source/helper/Python/exe/archive/ZIP-GZIPmagic/embedded body0,doctor0errors2knownwarnings/routing/diff,exactsemantic same-actor quality,canonicalfinish cleancheckout."
  Verification: "Pending initial/corrected owned and real Chromium checks/full/vendor-absent verification. Tests never read/compile/invoke pinned upstream; static source-reading CLI audits separate."
  Rollback Plan: "Revert only iteration84 semantic commit through a new authorized task; preserve history/results/registered save-open-recovery decisions."
  Findings: "Preflight cleanmain3465e116767e, direct workflow,parentC9TN6M active; prior goal turn is progress: iteration83 DONE213fe1350d9f Properties deck lifecycle. Current Paragraph static heading omits native expander and More Options command. Pinned ParaPropertyPanel registry title Paragraph, visible Writer text/table/default contexts, DefaultMenuCommand ParagraphDialog; PanelTitleBar retains toolbar while contents hidden and delegates persistent controller; FocusManager Return opens panel before child focus. Existing paragraph command/dialog owns behavior, no local new dialog route. Some large read results truncated; exact remaining relevant resource/function portions will be read before final hash conclusions. Complete FocusManager/F6/Sidebar Help/settings/other panels/sizing/context-profile lifetime remain open; no whole parent claim/no helper-source artifacts."
id_source: "generated"
---
## Summary

Restore the existing Paragraph sidebar panel expander and bindings-backed More Options control for the already implemented ParagraphDialog.

## Scope

Seven semantic paths: new apps/office/src/sfx2/browser/presentation/SidebarPanel.tsx and SidebarPanel.test.tsx; existing WriterPropertiesPanel.tsx; new WriterPropertiesPanel-controls.test.tsx and e2e/writer-sidebar-panel.spec.ts; source-provenance.json/runtime-inventory.json one existing evidence/responsibility row plus one new bounded browser-adaptation row.262prior test/spec files and216prior module rows/fields/status/defaults/ownership/evidence/order preserved. No generic command-control,core,generated resources,save/open/recovery or existing SidebarDeck changes. Parent/task metadata/results hashes only. Full panel/deck FocusManager Tab/Escape/arrows,F6,Help/settings/other panels/native sizing/persistence remain open, no new exceptions or module promotion.

## Plan

1. Read pinned complete Panel constructor/SetExpanded/PanelTitleBar expand/more-options controller/FocusManager Enter/FocusPanelContent/resource Paragraph DefaultMenuCommand and matching current command path; hashes/conclusions only, no native run or source copies. 2. Actual Writer before-code tests show missing expander/options. Add source-owned generic sfx2 browser SidebarPanel retaining mounted children with native initial state, header expander and optional More Options content supplied from existing bindings-backed CommandButton. Enter expands then synchronously focuses first eligible actual paragraph control via local owning panel callback; Space remains button activation. 3. Replace static Paragraph heading with panel title retaining heading semantics, current content/controls, source label More Options and existing generated ParagraphDialog dispatch/arguments/controller state. 4. Owned expansion/mount/reprojection/default/no-toolbar/Enter/other keys and actual-session collapse/deck-cycle/bindings/dialog/model/first-enabled/no-enabled cases; rebuilt desktop/mobile Chromium Space/Enter/state/focus/MoreOptions native paragraph modal. 5.262oldbytes216priorrows one evidence-only row+one new row each,7semantic andsource hashes,doctor/routing/diff/source-helper-Python-exe-archive-magic-embedded signatures0. 6. Full verify100%coverage0semantic; sequential vendor-absent app/inventory/3script/browser tests restoredfinally; exactsemantic same-actor EVALUATOR,canonicalfinish,parent progress;goal remains active.

## Verify Steps

Manual read-only exact pin9bc445578031fecf56086729d8e4940c77e14d65 relevant native Panel/PanelTitleBar/FocusManager/ResourceManager/Paragraph registry functions/resources, no copying/compile/native execution. Before/after actual Writer missing expander/options baseline. Owned initial open/explicit closed defaults, repeat toggle, mounted child draft/lifetime preserved, resources rerender preserve collapsed state, optional toolbar remains available collapsed/no-toolbar case, Enter expands before content focus without click toggle/dispatch, other keys preserved. Writer real sessions: panel collapse independent of deck/global visibility, restored current controls/model/bindings, More Options dispatches existing ParagraphDialog including while collapsed and cancel leaves collapsedstate; Enter focuses first enabled alignment control or leaves focus if no enabled control. Fresh desktop/mobile browser Space collapse, Enter opens/focus, visible header/options while collapsed, paragraph modal via options and focus-plus-editing on own client.262prior tests byte-identical;216prior row fields/status/defaults/ownership/old evidence/order preserved,one existing evidence-only row andone new bounded browser row each. npm run verify allpass100%coverage0semantic; sequential vendor root absent npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e, restore finally. Static vendor-reading CLI audits separate from upstream-independent tests. Source/semantic hashes intact,artifact source/helper/Python/exe/archive/ZIP-GZIPmagic/embedded body0,doctor0errors2knownwarnings/routing/diff,exactsemantic same-actor quality,canonicalfinish cleancheckout.

## Verification

Pending initial/corrected owned and real Chromium checks/full/vendor-absent verification. Tests never read/compile/invoke pinned upstream; static source-reading CLI audits separate.

## Rollback Plan

Revert only iteration84 semantic commit through a new authorized task; preserve history/results/registered save-open-recovery decisions.

## Findings

Preflight cleanmain3465e116767e, direct workflow,parentC9TN6M active; prior goal turn is progress: iteration83 DONE213fe1350d9f Properties deck lifecycle. Current Paragraph static heading omits native expander and More Options command. Pinned ParaPropertyPanel registry title Paragraph, visible Writer text/table/default contexts, DefaultMenuCommand ParagraphDialog; PanelTitleBar retains toolbar while contents hidden and delegates persistent controller; FocusManager Return opens panel before child focus. Existing paragraph command/dialog owns behavior, no local new dialog route. Some large read results truncated; exact remaining relevant resource/function portions will be read before final hash conclusions. Complete FocusManager/F6/Sidebar Help/settings/other panels/sizing/context-profile lifetime remain open; no whole parent claim/no helper-source artifacts.
