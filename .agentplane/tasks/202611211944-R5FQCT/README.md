---
id: "202611211944-R5FQCT"
title: "Connect Calc Paste Only commands"
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
  updated_at: "2026-11-21T19:44:47.541Z"
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
    body: "Start: connect native Calc typed clipboard masks, source Paste Only slots and undo."
events:
  -
    type: "status"
    at: "2026-11-21T19:45:00.281Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc typed clipboard masks, source Paste Only slots and undo."
doc_version: 3
doc_updated_at: "2026-11-21T19:45:00.281Z"
doc_updated_by: "CODER"
description: "Expose the native selected-type clipboard routes and preserve formula results, destination styles and undo."
sections:
  Summary: "Connect the three original Calc Paste Only commands through the internal clipboard, native insertion masks and shared Undo."
  Scope: "Task eight of the ten-task cycle. Expose the source Edit > Paste Special > Text, Number and Formula items for supported in-workbook selections. Port the native typed copy, number-format date discrimination, evaluated results, reference relocation, current replacement warnings, typed overwrite and Undo. Preserve external text as a separate clipboard route. Paste Special dialog, transpose, links, movement and Cut are separate workflow blocks."
  Plan: "Port native typed clipboard cell selection, route Paste Only Text, Number and Formula through the original masks, and verify source behavior, numeric/date distinction, references and Undo."
  Verify Steps: "Run focused Calc clipboard, paste block and selection, formula result, rich text and mounted workspace suites. Run Office TypeScript and changed-path ESLint and Prettier. Check Calc resources, provenance, module boundaries, policy routing and AgentPlane doctor."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the scoped implementation commit to restore normal clipboard masks and the previous menu availability."
  Findings: "Pending pinned source comparison."
id_source: "generated"
---
## Summary

Connect the three original Calc Paste Only commands through the internal clipboard, native insertion masks and shared Undo.

## Scope

Task eight of the ten-task cycle. Expose the source Edit > Paste Special > Text, Number and Formula items for supported in-workbook selections. Port the native typed copy, number-format date discrimination, evaluated results, reference relocation, current replacement warnings, typed overwrite and Undo. Preserve external text as a separate clipboard route. Paste Special dialog, transpose, links, movement and Cut are separate workflow blocks.

## Plan

Port native typed clipboard cell selection, route Paste Only Text, Number and Formula through the original masks, and verify source behavior, numeric/date distinction, references and Undo.

## Verify Steps

Run focused Calc clipboard, paste block and selection, formula result, rich text and mounted workspace suites. Run Office TypeScript and changed-path ESLint and Prettier. Check Calc resources, provenance, module boundaries, policy routing and AgentPlane doctor.

## Verification

Pending implementation.

## Rollback Plan

Revert the scoped implementation commit to restore normal clipboard masks and the previous menu availability.

## Findings

Pending pinned source comparison.
