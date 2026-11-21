---
id: "202611212010-FJ8YQ4"
title: "Connect Calc Paste Special dialog and presets"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T20:11:10.881Z"
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
    body: "Start: connect Calc Paste Special presets and run the ten-task verification checkpoint."
events:
  -
    type: "status"
    at: "2026-11-21T20:11:11.766Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect Calc Paste Special presets and run the ten-task verification checkpoint."
doc_version: 3
doc_updated_at: "2026-11-21T20:11:11.766Z"
doc_updated_by: "CODER"
description: "Enable the source Paste Special dialog for implemented clipboard mechanisms and run the ten-task test checkpoint."
sections:
  Summary: "Expose the source Calc Paste Special dialogs and presets. Run the scheduled full test checkpoint after the tenth task and keep the Calc goal active."
  Scope: "Connect the original same-workbook Paste Special dialog with its preset, paste, shift, options and operation groups. Enable the represented content types, Formats Only, values and formats, transpose and skip-empty. Keep unrepresented link, shift, arithmetic, comment and object services disabled. Route portable text through the source format selection and existing text import. Port tdf69450, exercise source preset defaults and history, and run the full Office, inventory, tooling and browser test suites. Preserve deliberate application I/O deviations."
  Plan: "Connect represented Paste Special controls and presets, format-only and skip-empty pattern operations, then run the tenth-task full checkpoint."
  Verify Steps: "Run focused clipboard, paste, format, Undo and workspace tests. Run Office TypeScript, changed-path ESLint and Prettier, resources, provenance, dependencies, policy routing and AgentPlane doctor. Run the full Office Vitest project, inventory, tooling and all browser projects as the tenth-task checkpoint."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the clipboard implementation commits to restore the earlier command availability and admission mask without changing workbook data or I/O policy."
  Findings: "Pending pinned source comparison."
id_source: "generated"
---
## Summary

Expose the source Calc Paste Special dialogs and presets. Run the scheduled full test checkpoint after the tenth task and keep the Calc goal active.

## Scope

Connect the original same-workbook Paste Special dialog with its preset, paste, shift, options and operation groups. Enable the represented content types, Formats Only, values and formats, transpose and skip-empty. Keep unrepresented link, shift, arithmetic, comment and object services disabled. Route portable text through the source format selection and existing text import. Port tdf69450, exercise source preset defaults and history, and run the full Office, inventory, tooling and browser test suites. Preserve deliberate application I/O deviations.

## Plan

Connect represented Paste Special controls and presets, format-only and skip-empty pattern operations, then run the tenth-task full checkpoint.

## Verify Steps

Run focused clipboard, paste, format, Undo and workspace tests. Run Office TypeScript, changed-path ESLint and Prettier, resources, provenance, dependencies, policy routing and AgentPlane doctor. Run the full Office Vitest project, inventory, tooling and all browser projects as the tenth-task checkpoint.

## Verification

Pending implementation.

## Rollback Plan

Revert the clipboard implementation commits to restore the earlier command availability and admission mask without changing workbook data or I/O policy.

## Findings

Pending pinned source comparison.
