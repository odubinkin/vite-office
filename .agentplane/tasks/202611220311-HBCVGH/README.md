---
id: "202611220311-HBCVGH"
title: "Connect Writer page style area, bitmap, and transparency"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:12:28.328Z"
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
    body: "Start: Connect the existing page descriptor fill to the Page Style tabs, native undo and physical page rendering."
events:
  -
    type: "status"
    at: "2026-11-22T03:12:45.227Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the existing page descriptor fill to the Page Style tabs, native undo and physical page rendering."
doc_version: 3
doc_updated_at: "2026-11-22T03:30:55.877Z"
doc_updated_by: "CODER"
description: "Expose the existing native page-style fill items through the Page Style dialog and physical page paint."
sections:
  Summary: |-
    Connect Writer page style area, bitmap, and transparency

    Expose the existing native page-style fill items through the Page Style dialog and physical page paint.
  Scope: "Writer Page Style command, dialog item exchange, native descriptor history, physical-page paint, and the shared Area and Transparency controls. Expose None, solid color, page bitmap import and placement as represented by the native item slice, and uniform transparency. Include associated tests and source registry entries. The existing Page geometry tab and open/save workflows keep their existing contracts."
  Plan: "Follow the pinned Page style template tab order. Pass the active native page-frame item set into Area and Transparency and submit geometry plus native deltas as one native page-descriptor operation. Reuse shared CUI page models and bitmap import and render native fills at the physical page. Verify named page styles, geometry, no-op/cancel, history, bitmap modes, and ODT/Worker reuse."
  Verify Steps: "Run focused Writer Page Style, page background ODT transport, page-descriptor/native history, and paragraph area regression tests plus shared fill conversion. Run a focused Chromium scenario on the real Page Style menu and production build. Check formatting, scoped ESLint, dependency boundaries, source tree, provenance, Writer resources, AgentPlane doctor and routing. Record any unchanged repository-wide docs and file-size failures. The full test suite runs at the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Connected the actual Page Style slot to the selected physical page's descriptor. The Page, Area and Transparency tabs exchange native DrawingLayer items and commit geometry and native fill through one Page Style history action. A no-op and cancellation leave the document and history alone.
    - Page paint reads the physical page frame format and renders solid fills or PNG/JPEG bitmaps and uniform transparency. The bitmap page supports import, native custom/tiled/stretched placement, and the nine original anchor points. Desktop image presets, editable bitmap dimensions and tiling offsets, and gradient/pattern/hatch fills remain outside this slice.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog WriterPageStyleDialog WriterPageLayout writer-view.test wrtsh1 undobj native-page-desc odt-page-background WriterParagraphAreaDialog hffrm`. Result: pass, 88 tests in 9 files. Scope: native dialog, geometry and fill in one undo, named page ownership, ODT and Worker serialization, native page layout and existing paragraph fill.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog`. Result: pass, repeat run after the page item snapshot ownership changes.
    - Command: `npm run test:shared --workspace @vite-office/office -- unobrushitemhelper fill-properties bitmap`. Result: pass, 14 tests in 2 files.
    - Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Result: pass; Writer resources include 2 tests.
    - Commands: `npm run check:docs` and `npm run check:file-size`. Result: existing Calc failures only, 307 JSDoc diagnostics and the 1,001-line Calc document codec. The scoped Writer files meet the size and JSDoc checks.
    - The full test suite is scheduled for the user's ten-task checkpoint.
    - Command: `node_modules/.bin/playwright test writer-page-area.spec.ts --config=output/playwright/writer-page-area-chrome.config.ts --project=writer --workers=1`. Result: pass, one Chromium scenario exercised file import, native placement and transparency, the page background layer, undo and redo, and reopening the page style.
    - Scoped ESLint, Prettier, and git diff checks passed.
id_source: "generated"
---
## Summary

Connect Writer page style area, bitmap, and transparency

Expose the existing native page-style fill items through the Page Style dialog and physical page paint.

## Scope

Writer Page Style command, dialog item exchange, native descriptor history, physical-page paint, and the shared Area and Transparency controls. Expose None, solid color, page bitmap import and placement as represented by the native item slice, and uniform transparency. Include associated tests and source registry entries. The existing Page geometry tab and open/save workflows keep their existing contracts.

## Plan

Follow the pinned Page style template tab order. Pass the active native page-frame item set into Area and Transparency and submit geometry plus native deltas as one native page-descriptor operation. Reuse shared CUI page models and bitmap import and render native fills at the physical page. Verify named page styles, geometry, no-op/cancel, history, bitmap modes, and ODT/Worker reuse.

## Verify Steps

Run focused Writer Page Style, page background ODT transport, page-descriptor/native history, and paragraph area regression tests plus shared fill conversion. Run a focused Chromium scenario on the real Page Style menu and production build. Check formatting, scoped ESLint, dependency boundaries, source tree, provenance, Writer resources, AgentPlane doctor and routing. Record any unchanged repository-wide docs and file-size failures. The full test suite runs at the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Connected the actual Page Style slot to the selected physical page's descriptor. The Page, Area and Transparency tabs exchange native DrawingLayer items and commit geometry and native fill through one Page Style history action. A no-op and cancellation leave the document and history alone.
- Page paint reads the physical page frame format and renders solid fills or PNG/JPEG bitmaps and uniform transparency. The bitmap page supports import, native custom/tiled/stretched placement, and the nine original anchor points. Desktop image presets, editable bitmap dimensions and tiling offsets, and gradient/pattern/hatch fills remain outside this slice.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog WriterPageStyleDialog WriterPageLayout writer-view.test wrtsh1 undobj native-page-desc odt-page-background WriterParagraphAreaDialog hffrm`. Result: pass, 88 tests in 9 files. Scope: native dialog, geometry and fill in one undo, named page ownership, ODT and Worker serialization, native page layout and existing paragraph fill.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog`. Result: pass, repeat run after the page item snapshot ownership changes.
- Command: `npm run test:shared --workspace @vite-office/office -- unobrushitemhelper fill-properties bitmap`. Result: pass, 14 tests in 2 files.
- Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Result: pass; Writer resources include 2 tests.
- Commands: `npm run check:docs` and `npm run check:file-size`. Result: existing Calc failures only, 307 JSDoc diagnostics and the 1,001-line Calc document codec. The scoped Writer files meet the size and JSDoc checks.
- The full test suite is scheduled for the user's ten-task checkpoint.
- Command: `node_modules/.bin/playwright test writer-page-area.spec.ts --config=output/playwright/writer-page-area-chrome.config.ts --project=writer --workers=1`. Result: pass, one Chromium scenario exercised file import, native placement and transparency, the page background layer, undo and redo, and reopening the page style.
- Scoped ESLint, Prettier, and git diff checks passed.
