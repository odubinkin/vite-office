---
id: "202609231520-J8VS4Q"
title: "Restore Writer undo manager ownership"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T15:20:54.602Z"
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
    body: "Start: implement approved Writer undo manager ownership and verify supported operations and save boundaries."
events:
  -
    type: "status"
    at: "2026-09-23T15:21:02.858Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer undo manager ownership and verify supported operations and save boundaries."
doc_version: 3
doc_updated_at: "2026-09-23T15:21:02.858Z"
doc_updated_by: "CODER"
description: "Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility."
sections:
  Summary: |-
    Restore Writer undo manager ownership

    Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.
  Scope: |-
    - In scope: Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.
    - Out of scope: unrelated refactors not required for "Restore Writer undo manager ownership".
  Plan: "1. Add sw/source/core/undo/docundo.ts as the SwDoc-owned Writer undo manager, retaining SfxUndoManager as the stack base. 2. Move Writer action grouping, cursor replay, deleted-content retention, and save-mark coordination into this owner; connect SwDoc and SwDocShell. 3. Add focused replay and save-boundary tests for supported text, split/join, formatting, list, page, and hyperlink actions; run repository checks and record evidence."
  Verify Steps: "1. Run npx vitest run apps/office/src/sw/source/core/undo/undobj.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/app/docsh.test.ts. Expected: Writer replay, grouping, cursor and save-boundary cases pass. 2. Run npm run typecheck. Expected: no TypeScript errors. 3. Run npm run lint and npm run check:dependencies. Expected: no lint or module-boundary errors. 4. Run npm run check:source-tree and npm run check:source-provenance. Expected: upstream path and source mapping valid. 5. Run npm run test:coverage --workspace @vite-office/office. Expected: full office unit suite passes. 6. Inspect git diff and git status --short --untracked-files=all. Expected: only approved files and task metadata changed."
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

Restore Writer undo manager ownership

Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.

## Scope

- In scope: Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.
- Out of scope: unrelated refactors not required for "Restore Writer undo manager ownership".

## Plan

1. Add sw/source/core/undo/docundo.ts as the SwDoc-owned Writer undo manager, retaining SfxUndoManager as the stack base. 2. Move Writer action grouping, cursor replay, deleted-content retention, and save-mark coordination into this owner; connect SwDoc and SwDocShell. 3. Add focused replay and save-boundary tests for supported text, split/join, formatting, list, page, and hyperlink actions; run repository checks and record evidence.

## Verify Steps

1. Run npx vitest run apps/office/src/sw/source/core/undo/undobj.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/app/docsh.test.ts. Expected: Writer replay, grouping, cursor and save-boundary cases pass. 2. Run npm run typecheck. Expected: no TypeScript errors. 3. Run npm run lint and npm run check:dependencies. Expected: no lint or module-boundary errors. 4. Run npm run check:source-tree and npm run check:source-provenance. Expected: upstream path and source mapping valid. 5. Run npm run test:coverage --workspace @vite-office/office. Expected: full office unit suite passes. 6. Inspect git diff and git status --short --untracked-files=all. Expected: only approved files and task metadata changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
