---
id: "202611210443-QJ6DRG"
title: "Connect Calc manual page break commands and normal-grid indicators"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611210412-B3P0ZB"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:44:32.999Z"
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
    at: "2026-11-21T04:45:18.350Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T04:45:18.350Z"
doc_updated_by: "CODER"
description: "Connect the native insert/remove row and column page break slots, history, and ordinary grid indicators to the canonical break sets. Preserve protected sheets, cursor behavior, ODS/XLSX persistence and the native ShowPageBreaks view flag."
sections:
  Summary: "Connect the native Calc row and column page-break commands and show the actual breaks in normal view."
  Scope: "Bind the four existing Sheet menu resources to native slot IDs, cursor-based state, ScDocFunc changes and shared undo. Render stored manual and computed breaks with the normal Calc grid geometry and honor the persisted ShowPageBreaks view flag. Use existing break persistence for ODS and XLSX. Page Break Preview, its bulk action and printer pagination are distinct source mechanisms."
  Plan: "Connect native page-break commands and normal-grid overlays using canonical break state and undo, with narrow ODS/XLSX and browser checks."
  Verify Steps: |-
    - Run targeted Calc tests for page break commands, table history, the Calc view and the relevant ODS and XLSX page settings and worker cases.
    - Run tools and office type checks, changed-path ESLint and Prettier, Calc resource and source provenance checks, file size, and git whitespace checks.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit. Existing imported break sets and page styles remain compatible."
  Findings: "Pending verification."
id_source: "generated"
---
## Summary

Connect the native Calc row and column page-break commands and show the actual breaks in normal view.

## Scope

Bind the four existing Sheet menu resources to native slot IDs, cursor-based state, ScDocFunc changes and shared undo. Render stored manual and computed breaks with the normal Calc grid geometry and honor the persisted ShowPageBreaks view flag. Use existing break persistence for ODS and XLSX. Page Break Preview, its bulk action and printer pagination are distinct source mechanisms.

## Plan

Connect native page-break commands and normal-grid overlays using canonical break state and undo, with narrow ODS/XLSX and browser checks.

## Verify Steps

- Run targeted Calc tests for page break commands, table history, the Calc view and the relevant ODS and XLSX page settings and worker cases.
- Run tools and office type checks, changed-path ESLint and Prettier, Calc resource and source provenance checks, file size, and git whitespace checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit. Existing imported break sets and page styles remain compatible.

## Findings

Pending verification.
