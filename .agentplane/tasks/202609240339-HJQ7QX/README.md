---
id: "202609240339-HJQ7QX"
title: "Expose imported Writer formatting controls"
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
  updated_at: "2026-09-24T03:40:05.887Z"
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
    body: "Start: Implement approved Writer formatting controls, canonical editing behavior, ODT round trips, and focused verification."
events:
  -
    type: "status"
    at: "2026-09-24T03:40:11.908Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Writer formatting controls, canonical editing behavior, ODT round trips, and focused verification."
doc_version: 3
doc_updated_at: "2026-09-24T04:30:10.924Z"
doc_updated_by: "CODER"
description: "Add LibreOffice Writer-style UI and editing commands for text color, highlight, line and paragraph spacing, tab stops, keep-with-next, and line numbering participation; preserve ODT round trips."
sections:
  Summary: |-
    Expose imported Writer formatting controls

    Add LibreOffice Writer-style UI and editing commands for text color, highlight, line and paragraph spacing, tab stops, keep-with-next, and line numbering participation; preserve ODT round trips.
  Scope: "In scope: Writer character color and highlight, paragraph line and above/below spacing, contextual spacing, multiple tab stops, keep-with-next, line numbering participation; shell commands, Writer-style toolbar/dialog/ruler/sidebar controls, ODT import/export, rendering and pagination, targeted tests. Out of scope: unrelated document features and external publication."
  Plan: "1. Extend canonical Writer model and selection-aware editing commands for all approved formatting properties. 2. Add Writer-style toolbar palettes, spacing menu, paragraph dialog, tab controls and relevant sidebar feedback using generated resource conventions. 3. Extend ODT tab-stop mapping and layout behavior for multiple stops, keep-with-next and line numbering participation. 4. Cover command state, UI interactions, rendering and ODT round trips with focused checks. 5. Verify and finish with a clean tracked state."
  Verify Steps: "1. Run targeted Writer command, UI and ODT tests covering application, mixed selection, undo/redo, import/export, and multi-tab round trip. Expected: all pass. 2. Run office typecheck and build. Expected: both pass. 3. Run repository doctor and routing check. Expected: both pass. 4. Inspect final diff and git status. Expected: only task files changed and no unintended artifacts."
  Verification: |-
    - Command: npm run test:coverage -w @vite-office/office
      Result: pass
      Evidence: 98 files, 443 tests; statements, branches, functions and lines all 100%.
      Scope: Writer model, UI, ODT mapping and regression suite.
    - Command: npm run test:e2e
      Result: pass
      Evidence: 13 browser scenarios pass, including hyperlinks and ODT reopen.
      Scope: Writer browser interaction and existing workflows.
    - Command: npm run typecheck -w @vite-office/office; npm run build -w @vite-office/office
      Result: pass
      Evidence: TypeScript succeeds and Vite produces the production bundle.
      Scope: office source and application bundle.
    - Command: npm run format:check; npm run lint; npm run check:docs; npm run check:dependencies; git diff --check
      Result: pass
      Evidence: style, documentation, module boundaries and diff checks succeed.
      Scope: changed repository files.
    - Command: ap doctor; node .agentplane/policy/check-routing.mjs
      Result: pass
      Evidence: doctor exits OK with unrelated existing hook-shim and historical task warnings; policy routing OK.
      Scope: task workflow and repository policy.
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Expose imported Writer formatting controls

Add LibreOffice Writer-style UI and editing commands for text color, highlight, line and paragraph spacing, tab stops, keep-with-next, and line numbering participation; preserve ODT round trips.

## Scope

In scope: Writer character color and highlight, paragraph line and above/below spacing, contextual spacing, multiple tab stops, keep-with-next, line numbering participation; shell commands, Writer-style toolbar/dialog/ruler/sidebar controls, ODT import/export, rendering and pagination, targeted tests. Out of scope: unrelated document features and external publication.

## Plan

1. Extend canonical Writer model and selection-aware editing commands for all approved formatting properties. 2. Add Writer-style toolbar palettes, spacing menu, paragraph dialog, tab controls and relevant sidebar feedback using generated resource conventions. 3. Extend ODT tab-stop mapping and layout behavior for multiple stops, keep-with-next and line numbering participation. 4. Cover command state, UI interactions, rendering and ODT round trips with focused checks. 5. Verify and finish with a clean tracked state.

## Verify Steps

1. Run targeted Writer command, UI and ODT tests covering application, mixed selection, undo/redo, import/export, and multi-tab round trip. Expected: all pass. 2. Run office typecheck and build. Expected: both pass. 3. Run repository doctor and routing check. Expected: both pass. 4. Inspect final diff and git status. Expected: only task files changed and no unintended artifacts.

## Verification

- Command: npm run test:coverage -w @vite-office/office
  Result: pass
  Evidence: 98 files, 443 tests; statements, branches, functions and lines all 100%.
  Scope: Writer model, UI, ODT mapping and regression suite.
- Command: npm run test:e2e
  Result: pass
  Evidence: 13 browser scenarios pass, including hyperlinks and ODT reopen.
  Scope: Writer browser interaction and existing workflows.
- Command: npm run typecheck -w @vite-office/office; npm run build -w @vite-office/office
  Result: pass
  Evidence: TypeScript succeeds and Vite produces the production bundle.
  Scope: office source and application bundle.
- Command: npm run format:check; npm run lint; npm run check:docs; npm run check:dependencies; git diff --check
  Result: pass
  Evidence: style, documentation, module boundaries and diff checks succeed.
  Scope: changed repository files.
- Command: ap doctor; node .agentplane/policy/check-routing.mjs
  Result: pass
  Evidence: doctor exits OK with unrelated existing hook-shim and historical task warnings; policy routing OK.
  Scope: task workflow and repository policy.

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
