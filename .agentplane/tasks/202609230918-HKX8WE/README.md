---
id: "202609230918-HKX8WE"
title: "Correct Writer text proportions on pages"
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
  updated_at: "2026-09-23T09:18:30.585Z"
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
    body: "Start: Correct Writer paragraph height and narrow page positioning using measured browser geometry and upstream layout semantics."
events:
  -
    type: "status"
    at: "2026-09-23T09:18:31.290Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Correct Writer paragraph height and narrow page positioning using measured browser geometry and upstream layout semantics."
doc_version: 3
doc_updated_at: "2026-09-23T09:18:31.290Z"
doc_updated_by: "CODER"
description: "Follow-up to verified ruler and pagination work: remove artificial paragraph height and preserve horizontal page reachability on narrow canvases, matching upstream page text geometry."
sections:
  Summary: |-
    Correct Writer text proportions on pages

    Follow-up to verified ruler and pagination work: remove artificial paragraph height and preserve horizontal page reachability on narrow canvases, matching upstream page text geometry.
  Scope: "Follow up the approved Writer page layout work in WriterEditableParagraph, WriterPlainTextEditor, pagination fallback, and focused tests. Remove the 28 px paragraph floor, size empty paragraphs from their actual line spacing, and make narrow pages horizontally reachable. No document-model or unrelated toolbar changes."
  Plan: "Align minimum paragraph and fallback heights with computed line spacing; keep complete pages reachable in narrow scroll canvases; verify the DOM geometry and focused tests."
  Verify Steps: |-
    1. Run `npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/editor/WriterEditableParagraph.test.tsx src/sw/browser/editor/WriterPlainTextEditor.test.tsx`. Expected: paragraph line-height floor, page grouping, and editor interactions pass.
    2. Inspect the local Writer page in a real browser. Expected: 12 pt default text has 16 px line height and 16 px minimum paragraph height; at a narrow viewport, the page left edge and vertical ruler are reachable by horizontal scrolling.
    3. Run `npm run typecheck --workspace @vite-office/office`, `npm run lint`, `npm run format:check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: pass.
    4. Run `git diff --check` and inspect `git status --short --untracked-files=all`. Expected: no whitespace errors or unrelated changes.
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

Correct Writer text proportions on pages

Follow-up to verified ruler and pagination work: remove artificial paragraph height and preserve horizontal page reachability on narrow canvases, matching upstream page text geometry.

## Scope

Follow up the approved Writer page layout work in WriterEditableParagraph, WriterPlainTextEditor, pagination fallback, and focused tests. Remove the 28 px paragraph floor, size empty paragraphs from their actual line spacing, and make narrow pages horizontally reachable. No document-model or unrelated toolbar changes.

## Plan

Align minimum paragraph and fallback heights with computed line spacing; keep complete pages reachable in narrow scroll canvases; verify the DOM geometry and focused tests.

## Verify Steps

1. Run `npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/editor/WriterEditableParagraph.test.tsx src/sw/browser/editor/WriterPlainTextEditor.test.tsx`. Expected: paragraph line-height floor, page grouping, and editor interactions pass.
2. Inspect the local Writer page in a real browser. Expected: 12 pt default text has 16 px line height and 16 px minimum paragraph height; at a narrow viewport, the page left edge and vertical ruler are reachable by horizontal scrolling.
3. Run `npm run typecheck --workspace @vite-office/office`, `npm run lint`, `npm run format:check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: pass.
4. Run `git diff --check` and inspect `git status --short --untracked-files=all`. Expected: no whitespace errors or unrelated changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
