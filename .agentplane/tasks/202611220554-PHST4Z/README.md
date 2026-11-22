---
id: "202611220554-PHST4Z"
title: "Connect Writer Navigator to native document content"
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
  updated_at: "2026-11-22T05:54:45.701Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T05:56:02.016Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T06:20:57.926Z"
doc_updated_by: "CODER"
description: "Show the native headings, tables, and bookmarks in a docked Navigator and route its content and page navigation through the Writer layout and cursor owners."
sections:
  Summary: |-
    Connect Writer Navigator to native document content

    Show the native headings, tables, and bookmarks in a docked Navigator and route its content and page navigation through the Writer layout and cursor owners.
  Scope: "Writer View Navigator command and child-window state, navigation toolbar and content tree for existing headings, tables and bookmarks, page and cursor navigation, focus and keyboard behavior, generated Writer resources, focused tests and provenance. Uses the active Writer document and leaves unsupported content families outside the represented slice."
  Plan: "Follow SwNavigatorWrapper, SwNavigationPI, SwContentType and SwContentTree::GotoContent and the original navigatorpanel.ui grouping. Read native outline, table and bookmark owners, preserve hierarchy and outline-level controls, and use the current Writer layout and cursor for page navigation and activation. Connect the original View command and shortcut to a retained, modeless browser Navigator window with native tree keyboard behavior and original toolbar functions in scope."
  Verify Steps: "Run focused Writer Navigator, outline, bookmark, table cursor, page layout and command resource tests. Verify live tree, outline levels, page navigation, keyboard and mouse activation, view-only state and retained open/close state. Run focused Chromium Navigator, menu and document navigation tests against the production build. Check TypeScript, scoped lint and formatting, source tree, module boundaries, provenance, Writer resources, doctor and routing. Existing global Calc documentation and size reports are baseline. Defer the full run to the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterNavigator writer-bookmark-selection native-table-selection newfrm writer-view.test WriterMenuBar menubar-commands`.
      Result: pass. Evidence: 78 tests in 10 files. Scope: Navigator, Writer toolbar visibility, bookmarks, table cursor and page layout.
    - Commands: `npm run test:writer --workspace @vite-office/office -- WriterNavigator menubar-commands writer-view.test` and `npm run test:writer --workspace @vite-office/office -- WriterNavigator`.
      Result: pass. Evidence: 21 exact resource and view scenarios, followed by three final Navigator scenarios. Scope: retained modeless tree, headings, bookmarks, physical pages and exact follow table row.
    - Command: `node_modules/.bin/playwright test writer-navigator.spec.ts writer-menu-saved-focus.spec.ts writer-submenu-keyboard.spec.ts writer-baseline-grid.spec.ts --config=output/playwright/writer-navigator-production.config.ts --project=writer --workers=1`.
      Result: pass. Evidence: eight Chromium scenarios. The Navigator scenario also passed on the final production bundle. Scope: original View menu toggle and F5 shortcut, native heading activation, focus behavior and neighboring menus and baseline grid.
    - Commands: `(cd apps/office && ../../node_modules/.bin/vite build)` and `(cd apps/office && ../../node_modules/.bin/tsc --noEmit --singleThreaded --incremental --tsBuildInfoFile ../../output/playwright/writer-check.tsbuildinfo)`.
      Result: pass. Scope: production bundle and application TypeScript.
    - Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor` and `node .agentplane/policy/check-routing.mjs`.
      Result: pass. Evidence: 3,038 audited runtime sources, 3,039 provenance modules and both Writer resource tests.
    - Commands: scoped ESLint, scoped Prettier and `git diff --check`.
      Result: pass. Scope: changed source, tests and provenance.
    - Commands: `npm run check:docs` and `npm run check:file-size`.
      Result: existing Calc failures only. Evidence: 307 Calc JSDoc diagnostics and the 1,001-line Calc codec. The preceding task's global report also listed a 1,006-line Writer view and that detail was missed at closeout. The shared cursor reveal and Navigator bindings now leave that view below the 1,000-line limit.
    - The Navigator represents the active document and the three connected content families. Full suite deferred to the user's tenth-task checkpoint.
id_source: "generated"
---
## Summary

Connect Writer Navigator to native document content

Show the native headings, tables, and bookmarks in a docked Navigator and route its content and page navigation through the Writer layout and cursor owners.

## Scope

Writer View Navigator command and child-window state, navigation toolbar and content tree for existing headings, tables and bookmarks, page and cursor navigation, focus and keyboard behavior, generated Writer resources, focused tests and provenance. Uses the active Writer document and leaves unsupported content families outside the represented slice.

## Plan

Follow SwNavigatorWrapper, SwNavigationPI, SwContentType and SwContentTree::GotoContent and the original navigatorpanel.ui grouping. Read native outline, table and bookmark owners, preserve hierarchy and outline-level controls, and use the current Writer layout and cursor for page navigation and activation. Connect the original View command and shortcut to a retained, modeless browser Navigator window with native tree keyboard behavior and original toolbar functions in scope.

## Verify Steps

Run focused Writer Navigator, outline, bookmark, table cursor, page layout and command resource tests. Verify live tree, outline levels, page navigation, keyboard and mouse activation, view-only state and retained open/close state. Run focused Chromium Navigator, menu and document navigation tests against the production build. Check TypeScript, scoped lint and formatting, source tree, module boundaries, provenance, Writer resources, doctor and routing. Existing global Calc documentation and size reports are baseline. Defer the full run to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Command: `npm run test:writer --workspace @vite-office/office -- WriterNavigator writer-bookmark-selection native-table-selection newfrm writer-view.test WriterMenuBar menubar-commands`.
  Result: pass. Evidence: 78 tests in 10 files. Scope: Navigator, Writer toolbar visibility, bookmarks, table cursor and page layout.
- Commands: `npm run test:writer --workspace @vite-office/office -- WriterNavigator menubar-commands writer-view.test` and `npm run test:writer --workspace @vite-office/office -- WriterNavigator`.
  Result: pass. Evidence: 21 exact resource and view scenarios, followed by three final Navigator scenarios. Scope: retained modeless tree, headings, bookmarks, physical pages and exact follow table row.
- Command: `node_modules/.bin/playwright test writer-navigator.spec.ts writer-menu-saved-focus.spec.ts writer-submenu-keyboard.spec.ts writer-baseline-grid.spec.ts --config=output/playwright/writer-navigator-production.config.ts --project=writer --workers=1`.
  Result: pass. Evidence: eight Chromium scenarios. The Navigator scenario also passed on the final production bundle. Scope: original View menu toggle and F5 shortcut, native heading activation, focus behavior and neighboring menus and baseline grid.
- Commands: `(cd apps/office && ../../node_modules/.bin/vite build)` and `(cd apps/office && ../../node_modules/.bin/tsc --noEmit --singleThreaded --incremental --tsBuildInfoFile ../../output/playwright/writer-check.tsbuildinfo)`.
  Result: pass. Scope: production bundle and application TypeScript.
- Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor` and `node .agentplane/policy/check-routing.mjs`.
  Result: pass. Evidence: 3,038 audited runtime sources, 3,039 provenance modules and both Writer resource tests.
- Commands: scoped ESLint, scoped Prettier and `git diff --check`.
  Result: pass. Scope: changed source, tests and provenance.
- Commands: `npm run check:docs` and `npm run check:file-size`.
  Result: existing Calc failures only. Evidence: 307 Calc JSDoc diagnostics and the 1,001-line Calc codec. The preceding task's global report also listed a 1,006-line Writer view and that detail was missed at closeout. The shared cursor reveal and Navigator bindings now leave that view below the 1,000-line limit.
- The Navigator represents the active document and the three connected content families. Full suite deferred to the user's tenth-task checkpoint.
