---
id: "202611211857-JVNZBA"
title: "Connect the Calc Calculate submenu"
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
  updated_at: "2026-11-21T18:57:27.618Z"
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
    body: "Start: connect the source Calc Calculate menu, calculation input, and undoable formula result conversion."
events:
  -
    type: "status"
    at: "2026-11-21T18:57:28.606Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the source Calc Calculate menu, calculation input, and undoable formula result conversion."
doc_version: 3
doc_updated_at: "2026-11-21T18:57:28.606Z"
doc_updated_by: "CODER"
description: "Wire AutoCalculate, Recalculate, Recalculate Hard and Formula to Value from the native submenu, with formula preview and undo."
sections:
  Summary: "Wire the native Calc Data > Calculate submenu and its keyboard routes."
  Scope: "Task six of the approved ten-task cycle. Connect AutoCalculate, Recalculate, Recalculate Hard, and Formula to Value using the pinned Calc document-shell and cell-shell contracts. Cover the real document state, command enablement/checkmark, formula input preview, dirty and full calculation, value conversion and undo. Preserve existing document I/O and autosave behavior."
  Plan: "Add the complete native Calculate submenu using source slot, input preview, sparse formula tree, document calculation and conversion/undo contracts. Verify actual Calc grid and formula bar behavior, source regressions tdf97897 and tdf131326, and declared focused/static checks."
  Verify Steps: "Run targeted Calc recalculation and formula-to-value UI, formula tree and existing affected command/undo tests. Check Office TypeScript, changed-path eslint and Prettier, Calc generated resources, source provenance, module dependencies, AgentPlane policy routing and doctor."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the scoped implementation commit to restore the previous command and calculation dispatch behavior."
  Findings: "Pending upstream comparison."
id_source: "generated"
---
## Summary

Wire the native Calc Data > Calculate submenu and its keyboard routes.

## Scope

Task six of the approved ten-task cycle. Connect AutoCalculate, Recalculate, Recalculate Hard, and Formula to Value using the pinned Calc document-shell and cell-shell contracts. Cover the real document state, command enablement/checkmark, formula input preview, dirty and full calculation, value conversion and undo. Preserve existing document I/O and autosave behavior.

## Plan

Add the complete native Calculate submenu using source slot, input preview, sparse formula tree, document calculation and conversion/undo contracts. Verify actual Calc grid and formula bar behavior, source regressions tdf97897 and tdf131326, and declared focused/static checks.

## Verify Steps

Run targeted Calc recalculation and formula-to-value UI, formula tree and existing affected command/undo tests. Check Office TypeScript, changed-path eslint and Prettier, Calc generated resources, source provenance, module dependencies, AgentPlane policy routing and doctor.

## Verification

Pending implementation.

## Rollback Plan

Revert the scoped implementation commit to restore the previous command and calculation dispatch behavior.

## Findings

Pending upstream comparison.
