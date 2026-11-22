---
id: "202611220341-T2VZFX"
title: "Connect Writer Page Style header and footer settings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:42:04.062Z"
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
    body: "Start: Connect the native Header and Footer page-style controls and preserve story sections through Writer history."
events:
  -
    type: "status"
    at: "2026-11-22T03:42:24.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Header and Footer page-style controls and preserve story sections through Writer history."
doc_version: 3
doc_updated_at: "2026-11-22T04:13:33.112Z"
doc_updated_by: "CODER"
description: "Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history."
sections:
  Summary: |-
    Connect Writer Page Style header and footer settings

    Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history.
  Scope: "Writer Page Style Header and Footer tabs, shared SVX header/footer form, nested page-style pooled attributes, Writer page descriptor story variants, page history, and existing physical story presentation and transport. Enable and disable, spacing, geometry, dynamic spacing and height, and separate left and first stories must retain native sections and share flags. Inline story editing and nested border/area dialog are separate existing surfaces."
  Plan: "Use the pinned SvxHFPage controls and nested SvxSetItem contract. Map through PageDescToItemSet and ItemSetToPageDesc, reuse native story owners, section copying, and page descriptor undo; keep referenced dormant stories when toggling sharing and preserve document-owned content, independent frame attributes, and ODT transport. Verify cancellation and the deletion confirmation before accepting destructive edits."
  Verify Steps: "Run targeted Writer page story, page style, native descriptor/history and ODT/Worker transport tests. Verify native defaults, activation, sharing, retained text on transitions, body spacing, cancel, delete confirmation and history through the actual UI command. Run a focused Chromium Page Style scenario and production build. Run scoped lint, formatting, boundaries, source tree, provenance, Writer resources, doctor and routing; record repository-wide JSDoc and size baseline failures. Defer the full suite to the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Connected Writer's Header and Footer tabs to the native nested SvxSetItem groups. The native default height and distance are 5 mm; activation, margins, spacing, AutoFit and dynamic spacing flags, and the left/right and common first-page sharing selectors use the actual page descriptor.
    - Page Style now places its story links and native frame geometry in one undo action. Existing content remains in the owning story section when formatting changes. The current session retains a separated section while shared, and removing an active story requires the child deletion confirmation.
    - Source comparisons: svx/source/dialog/hdft.cxx (Reset, FillItemSet, RangeHdl and the delete confirmation), sw/source/uibase/utlui/uitool.cxx (nested page exchange), sw/source/core/doc/docdesc.cxx (variant transfer), and xmloff/source/style/PageMasterStyleMap.cxx (the original ODF story margins).
    - The native in-document section copier covers text and tables. The existing browser story layer supplies paint and body geometry; inline story editing, browser remeasurement for AutoFit, nested border/area editing, and duplex-specific stories across document copies remain outside this task.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStoriesDialog WriterPageAreaDialog odt-page-stories`. Result: pass, 7 tests in 3 files on the updated source. Scope: native defaults, page story ownership, toggles, cancellation and deletion confirmation, shared story retention, undo/redo, ODT and Worker reopening.
    - Scoped ESLint, Prettier, diff, dependency, source tree, registry provenance, Writer resources, doctor and routing checks passed. Global JSDoc and file size still report the known Calc baseline.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStyleDialog hffrm fmthdft writer-page-story-codec odt-page-background undobj`. Result: pass, 38 tests in 6 files. Scope: existing page style, page layout, attached region identity, background transport and Writer history.
    - Command: `npm run test:writer --workspace @vite-office/office -- docxexport.page-stories --testNamePattern 'fixed ODF story|table-only source cell'`. Result: pass, 2 targeted tests. A supplementary attempt that included the separate Word fixture with six page variants was terminated after it did not complete. That fixture is outside the passing count.
    - Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-page-stories.spec.ts writer-page-area.spec.ts --config=output/playwright/writer-hf-production.config.ts --project=writer --workers=1`. Result: production build and both Chromium scenarios passed. Chromium verified physical headers and footers, the native confirmation, cancellation with Escape, deletion and undo.
id_source: "generated"
---
## Summary

Connect Writer Page Style header and footer settings

Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history.

## Scope

Writer Page Style Header and Footer tabs, shared SVX header/footer form, nested page-style pooled attributes, Writer page descriptor story variants, page history, and existing physical story presentation and transport. Enable and disable, spacing, geometry, dynamic spacing and height, and separate left and first stories must retain native sections and share flags. Inline story editing and nested border/area dialog are separate existing surfaces.

## Plan

Use the pinned SvxHFPage controls and nested SvxSetItem contract. Map through PageDescToItemSet and ItemSetToPageDesc, reuse native story owners, section copying, and page descriptor undo; keep referenced dormant stories when toggling sharing and preserve document-owned content, independent frame attributes, and ODT transport. Verify cancellation and the deletion confirmation before accepting destructive edits.

## Verify Steps

Run targeted Writer page story, page style, native descriptor/history and ODT/Worker transport tests. Verify native defaults, activation, sharing, retained text on transitions, body spacing, cancel, delete confirmation and history through the actual UI command. Run a focused Chromium Page Style scenario and production build. Run scoped lint, formatting, boundaries, source tree, provenance, Writer resources, doctor and routing; record repository-wide JSDoc and size baseline failures. Defer the full suite to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Connected Writer's Header and Footer tabs to the native nested SvxSetItem groups. The native default height and distance are 5 mm; activation, margins, spacing, AutoFit and dynamic spacing flags, and the left/right and common first-page sharing selectors use the actual page descriptor.
- Page Style now places its story links and native frame geometry in one undo action. Existing content remains in the owning story section when formatting changes. The current session retains a separated section while shared, and removing an active story requires the child deletion confirmation.
- Source comparisons: svx/source/dialog/hdft.cxx (Reset, FillItemSet, RangeHdl and the delete confirmation), sw/source/uibase/utlui/uitool.cxx (nested page exchange), sw/source/core/doc/docdesc.cxx (variant transfer), and xmloff/source/style/PageMasterStyleMap.cxx (the original ODF story margins).
- The native in-document section copier covers text and tables. The existing browser story layer supplies paint and body geometry; inline story editing, browser remeasurement for AutoFit, nested border/area editing, and duplex-specific stories across document copies remain outside this task.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStoriesDialog WriterPageAreaDialog odt-page-stories`. Result: pass, 7 tests in 3 files on the updated source. Scope: native defaults, page story ownership, toggles, cancellation and deletion confirmation, shared story retention, undo/redo, ODT and Worker reopening.
- Scoped ESLint, Prettier, diff, dependency, source tree, registry provenance, Writer resources, doctor and routing checks passed. Global JSDoc and file size still report the known Calc baseline.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStyleDialog hffrm fmthdft writer-page-story-codec odt-page-background undobj`. Result: pass, 38 tests in 6 files. Scope: existing page style, page layout, attached region identity, background transport and Writer history.
- Command: `npm run test:writer --workspace @vite-office/office -- docxexport.page-stories --testNamePattern 'fixed ODF story|table-only source cell'`. Result: pass, 2 targeted tests. A supplementary attempt that included the separate Word fixture with six page variants was terminated after it did not complete. That fixture is outside the passing count.
- Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-page-stories.spec.ts writer-page-area.spec.ts --config=output/playwright/writer-hf-production.config.ts --project=writer --workers=1`. Result: production build and both Chromium scenarios passed. Chromium verified physical headers and footers, the native confirmation, cancellation with Escape, deletion and undo.
