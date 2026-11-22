---
id: "202611220429-J9FSBJ"
title: "Connect Writer Page Style borders and shadows"
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
  updated_at: "2026-11-22T04:29:46.721Z"
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
    body: "Start: Connect the native page border and shadow items to Page Style and the physical page frame."
events:
  -
    type: "status"
    at: "2026-11-22T04:30:22.757Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native page border and shadow items to Page Style and the physical page frame."
doc_version: 3
doc_updated_at: "2026-11-22T04:44:33.202Z"
doc_updated_by: "CODER"
description: "Connect the native page box and shadow items to the Page Style Borders tab, physical page paint and layout reservation."
sections:
  Summary: |-
    Connect Writer Page Style borders and shadows

    Connect the native page box and shadow items to the Page Style Borders tab, physical page paint and layout reservation.
  Scope: "Writer Page Style Borders tab, shared frame border and shadow widgets, pooled input and output, native physical page margins and border/shadow reservation, browser paint, existing Page Style history and ODF/Worker transport. Include tests, source registry, and tightly scoped refactoring of the shared border UI and frame paint projections."
  Plan: "Follow SwTemplateDlgController page ordering and PageDescToItemSet box-info defaults. Reuse the existing shared border-tab owner for line and padding controls and the Writer shadow widgets. Submit native RES_BOX and RES_SHADOW through the Page Style exchange and undo. Account for SvxShadowItem side geometry in the print area and render the physical page border and shadow separately from the view chrome. Verify known format and history paths with focused tests."
  Verify Steps: "Run targeted Writer Page Style borders, paragraph border regression, page layout, native history and ODT/Worker tests. Verify default padding policy, accepted border and shadow geometry, page position, cancellation and undo/redo. Run a focused Chromium Page Style Borders scenario, previous Page Style scenarios, and the production build. Check scoped lint, formatting, module boundaries, source tree, provenance, Writer resources, doctor and routing. Record existing global documentation and size baseline failures. Defer the full run to the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageBordersDialog native-border-page writer-paragraph-border-projection`.
      Result: pass. Evidence: 12 tests in 3 files. Scope: shared border tab, page padding defaults and exchange, physical border and shadow insets, undo and redo, cancellation, ODT and Worker transport.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog WriterPageStoriesDialog WriterPageStyleDialog WriterPageLayout WriterParagraphBorder odt-page-stories hffrm`.
      Result: pass. Evidence: 32 tests in 6 files. Scope: adjacent Page Style, browser pagination, paragraph borders and story layout and transport.
    - Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor`, `node .agentplane/policy/check-routing.mjs` and `git diff --check`.
      Result: pass. Evidence: 3,031 runtime sources in boundary audit, 3,032 registered modules, 2 Writer resource tests, doctor and routing OK. Scope: native module boundaries, upstream paths and provenance, Writer resource catalogue, workflow and whitespace.
    - Commands: `npm run check:docs` and `npm run check:file-size`.
      Result: known baseline failures. Evidence: 307 JSDoc diagnostics in Calc and one size diagnostic for the 1,001-line Calc document codec. Scope: repository-wide checks reported no Writer or shared module issues.
    - The physical outline and stories resolve the current page's native frame format. Body pagination continues to use the current layout engine's master-based geometry.
    - Full suite deferred to the user's ten-task checkpoint.
    - Command: `npm run build:single-threaded --workspace @vite-office/office`.
      Result: pass. Evidence: TypeScript and Vite production bundle completed. Scope: production Office build; existing large-chunk and libxml2 externalization warnings.
    - Command: `node_modules/.bin/playwright test writer-page-borders.spec.ts writer-page-area.spec.ts writer-page-stories.spec.ts --config=output/playwright/writer-page-border-production.config.ts --project=writer --workers=1`.
      Result: pass. Evidence: 3 Chromium tests against production preview. Scope: browser page fill, native border and shadow paint, undo, redo, cancellation, and header/footer confirmation.
    - Commands: `node_modules/.bin/eslint --max-warnings 0 <changed TypeScript files>` and `node_modules/.bin/prettier --check <changed and added files>`.
      Result: pass. Evidence: no lint errors or warnings, all scoped files formatted. Scope: changed runtime, tests and registry records.
id_source: "generated"
---
## Summary

Connect Writer Page Style borders and shadows

Connect the native page box and shadow items to the Page Style Borders tab, physical page paint and layout reservation.

## Scope

Writer Page Style Borders tab, shared frame border and shadow widgets, pooled input and output, native physical page margins and border/shadow reservation, browser paint, existing Page Style history and ODF/Worker transport. Include tests, source registry, and tightly scoped refactoring of the shared border UI and frame paint projections.

## Plan

Follow SwTemplateDlgController page ordering and PageDescToItemSet box-info defaults. Reuse the existing shared border-tab owner for line and padding controls and the Writer shadow widgets. Submit native RES_BOX and RES_SHADOW through the Page Style exchange and undo. Account for SvxShadowItem side geometry in the print area and render the physical page border and shadow separately from the view chrome. Verify known format and history paths with focused tests.

## Verify Steps

Run targeted Writer Page Style borders, paragraph border regression, page layout, native history and ODT/Worker tests. Verify default padding policy, accepted border and shadow geometry, page position, cancellation and undo/redo. Run a focused Chromium Page Style Borders scenario, previous Page Style scenarios, and the production build. Check scoped lint, formatting, module boundaries, source tree, provenance, Writer resources, doctor and routing. Record existing global documentation and size baseline failures. Defer the full run to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageBordersDialog native-border-page writer-paragraph-border-projection`.
  Result: pass. Evidence: 12 tests in 3 files. Scope: shared border tab, page padding defaults and exchange, physical border and shadow insets, undo and redo, cancellation, ODT and Worker transport.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog WriterPageStoriesDialog WriterPageStyleDialog WriterPageLayout WriterParagraphBorder odt-page-stories hffrm`.
  Result: pass. Evidence: 32 tests in 6 files. Scope: adjacent Page Style, browser pagination, paragraph borders and story layout and transport.
- Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor`, `node .agentplane/policy/check-routing.mjs` and `git diff --check`.
  Result: pass. Evidence: 3,031 runtime sources in boundary audit, 3,032 registered modules, 2 Writer resource tests, doctor and routing OK. Scope: native module boundaries, upstream paths and provenance, Writer resource catalogue, workflow and whitespace.
- Commands: `npm run check:docs` and `npm run check:file-size`.
  Result: known baseline failures. Evidence: 307 JSDoc diagnostics in Calc and one size diagnostic for the 1,001-line Calc document codec. Scope: repository-wide checks reported no Writer or shared module issues.
- The physical outline and stories resolve the current page's native frame format. Body pagination continues to use the current layout engine's master-based geometry.
- Full suite deferred to the user's ten-task checkpoint.
- Command: `npm run build:single-threaded --workspace @vite-office/office`.
  Result: pass. Evidence: TypeScript and Vite production bundle completed. Scope: production Office build; existing large-chunk and libxml2 externalization warnings.
- Command: `node_modules/.bin/playwright test writer-page-borders.spec.ts writer-page-area.spec.ts writer-page-stories.spec.ts --config=output/playwright/writer-page-border-production.config.ts --project=writer --workers=1`.
  Result: pass. Evidence: 3 Chromium tests against production preview. Scope: browser page fill, native border and shadow paint, undo, redo, cancellation, and header/footer confirmation.
- Commands: `node_modules/.bin/eslint --max-warnings 0 <changed TypeScript files>` and `node_modules/.bin/prettier --check <changed and added files>`.
  Result: pass. Evidence: no lint errors or warnings, all scoped files formatted. Scope: changed runtime, tests and registry records.
