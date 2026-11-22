---
id: "202611220023-1ZKRD0"
title: "Connect Calc cell style presets and named style application"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611212341-5A4TN3"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T00:23:19.242Z"
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
    at: "2026-11-22T00:23:29.384Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T00:23:29.384Z"
doc_updated_by: "CODER"
description: "Connect the native Calc cell style pool, built-in style entries and typed StyleApply slot to real view selection, editability, and source Undo and Redo."
sections:
  Summary: "Connect Calc cell style presets and the typed StyleApply command to the existing document style pool and real cell selection."
  Scope: "Port the original standard cell-style definitions consumed by the Styles menu and keep imported named styles attached to the existing pool. Connect native style dispatch, simple and disjoint selections, selected sheets, editability, checked style state, and original cell style Undo and Redo. Keep existing document storage and browser visual conventions."
  Plan: "Port built-in cell style definitions, connect native style selection, apply, history and dispatch, and verify original source and browser behavior on the affected Calc modules."
  Verify Steps: |-
    - Run focused Calc Vitest cases for the standard style pool, named cell style ODS round trip, mounted Styles dispatch, protection, checked state, and Undo and Redo.
    - Run application typecheck, changed-source lint and format, dependency, Calc resource, and source provenance checks, plus AgentPlane routing and doctor.
    - Build and run local Chromium smoke coverage for applying a style, changing selection, and Undo.
    - Record exact commands and scoped evidence. This is task four of the ten-task checkpoint interval.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task implementation commits. Existing imported styles remain owned by the Calc style pool and current ODS filters."
  Findings: "Pending implementation and source comparison."
id_source: "generated"
---
## Summary

Connect Calc cell style presets and the typed StyleApply command to the existing document style pool and real cell selection.

## Scope

Port the original standard cell-style definitions consumed by the Styles menu and keep imported named styles attached to the existing pool. Connect native style dispatch, simple and disjoint selections, selected sheets, editability, checked style state, and original cell style Undo and Redo. Keep existing document storage and browser visual conventions.

## Plan

Port built-in cell style definitions, connect native style selection, apply, history and dispatch, and verify original source and browser behavior on the affected Calc modules.

## Verify Steps

- Run focused Calc Vitest cases for the standard style pool, named cell style ODS round trip, mounted Styles dispatch, protection, checked state, and Undo and Redo.
- Run application typecheck, changed-source lint and format, dependency, Calc resource, and source provenance checks, plus AgentPlane routing and doctor.
- Build and run local Chromium smoke coverage for applying a style, changing selection, and Undo.
- Record exact commands and scoped evidence. This is task four of the ten-task checkpoint interval.

## Verification

Pending implementation.

## Rollback Plan

Revert the task implementation commits. Existing imported styles remain owned by the Calc style pool and current ODS filters.

## Findings

Pending implementation and source comparison.
