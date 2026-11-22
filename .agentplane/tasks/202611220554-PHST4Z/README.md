---
id: "202611220554-PHST4Z"
title: "Connect Writer Navigator to native document content"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
doc_updated_at: "2026-11-22T05:56:02.016Z"
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
  Findings: ""
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
