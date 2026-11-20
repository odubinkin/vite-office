---
id: "202611201413-9GPC0D"
title: "Connect Calc outline header controls and levels"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611201339-S3THHE"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T14:14:17.309Z"
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
    at: "2026-11-20T14:14:49.818Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T14:14:49.818Z"
doc_updated_by: "CODER"
description: "Expose the source row and column outline gutters, level selection and individual group expand/collapse in the browser grid. Preserve native nested visibility, filtered rows, undo and split-pane placement using existing document owners."
sections:
  Summary: "Connect the row and column outline windows to the Calc browser grid."
  Scope: "Implement the source outline level buttons and per-group expand/collapse controls, nested and filtered visibility, undo, and keyboard and pane placement. Use canonical Calc outline, view settings, and viewport geometry. Add provenance for the browser outline presentation and critical targeted tests. Keep dialog and file operation policy as currently implemented."
  Plan: "Port row and column gutter level and individual group selection, shared geometry, native undo, and targeted regression tests."
  Verify Steps: |-
    - Run targeted Calc tests for outline headers, manual outline commands, and frozen panes.
    - Run TypeScript for tools and office, with a single office checker if host capacity requires it.
    - Run focused ESLint and Prettier, and run Calc resources, provenance, file size, and git whitespace checks.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit to restore the existing outline menus and original grid placement."
  Findings: "Pending source comparison."
id_source: "generated"
---
## Summary

Connect the row and column outline windows to the Calc browser grid.

## Scope

Implement the source outline level buttons and per-group expand/collapse controls, nested and filtered visibility, undo, and keyboard and pane placement. Use canonical Calc outline, view settings, and viewport geometry. Add provenance for the browser outline presentation and critical targeted tests. Keep dialog and file operation policy as currently implemented.

## Plan

Port row and column gutter level and individual group selection, shared geometry, native undo, and targeted regression tests.

## Verify Steps

- Run targeted Calc tests for outline headers, manual outline commands, and frozen panes.
- Run TypeScript for tools and office, with a single office checker if host capacity requires it.
- Run focused ESLint and Prettier, and run Calc resources, provenance, file size, and git whitespace checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit to restore the existing outline menus and original grid placement.

## Findings

Pending source comparison.
