---
id: "202609250816-6YZQ3M"
title: "Align Writer menu item indentation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "ui"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Browser menu alignment and interaction"
  - "Focused CommandMenuBar and WriterMenuBar tests"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T08:16:33.050Z"
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
    body: "Start: align menu item labels with a compact shared gutter and verify interactions."
events:
  -
    type: "status"
    at: "2026-09-25T08:16:33.776Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align menu item labels with a compact shared gutter and verify interactions."
doc_version: 3
doc_updated_at: "2026-09-25T08:16:33.776Z"
doc_updated_by: "CODER"
description: "Use the same compact label inset for Writer command, checked, radio, and submenu rows in the shared menu presenter; verify menu interaction remains intact."
sections:
  Summary: "Align all Writer menu item labels to the same compact horizontal inset."
  Scope: "Shared CommandMenuBar rendering and focused tests for action, checked, radio, and submenu rows. Keep save and export behavior unchanged."
  Plan: "1. Apply a shared compact label gutter to command, checkable, radio, and submenu rows. 2. Test text alignment and existing menu interaction in unit and browser checks. 3. Run full verification, record evidence, and commit the focused change."
  Verify Steps: "1. Run focused CommandMenuBar and WriterMenuBar unit tests. 2. Verify menu label alignment and clickability in a browser. 3. Run npm run verify. 4. Inspect git diff and status."
  Verification: "Pending."
  Rollback Plan: "Revert this task's menu component and test commit."
  Findings: "Command rows reserve a 16px checkmark slot after 12px padding, while submenu rows use only 12px padding; their labels start at different horizontal positions."
id_source: "generated"
---
## Summary

Align all Writer menu item labels to the same compact horizontal inset.

## Scope

Shared CommandMenuBar rendering and focused tests for action, checked, radio, and submenu rows. Keep save and export behavior unchanged.

## Plan

1. Apply a shared compact label gutter to command, checkable, radio, and submenu rows. 2. Test text alignment and existing menu interaction in unit and browser checks. 3. Run full verification, record evidence, and commit the focused change.

## Verify Steps

1. Run focused CommandMenuBar and WriterMenuBar unit tests. 2. Verify menu label alignment and clickability in a browser. 3. Run npm run verify. 4. Inspect git diff and status.

## Verification

Pending.

## Rollback Plan

Revert this task's menu component and test commit.

## Findings

Command rows reserve a 16px checkmark slot after 12px padding, while submenu rows use only 12px padding; their labels start at different horizontal positions.
