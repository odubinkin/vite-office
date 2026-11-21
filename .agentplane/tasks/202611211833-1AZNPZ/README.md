---
id: "202611211833-1AZNPZ"
title: "Connect Calc Calculate and Formula options"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:33:45.890Z"
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
    body: "Start: Connect the native Calc Calculate and Formula options pages to live document settings and formula syntax."
events:
  -
    type: "status"
    at: "2026-11-21T18:33:46.354Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Calc Calculate and Formula options pages to live document settings and formula syntax."
doc_version: 3
doc_updated_at: "2026-11-21T18:33:46.354Z"
doc_updated_by: "CODER"
description: "Connect the original Calc options pages to document calculation settings, formula syntax and existing recalculation paths."
sections:
  Summary: "Open native-shaped Calc Calculate and Formula settings through the original Tools Options slot."
  Scope: "Calc-only options dialog host with a tree and the two source calculation pages, native document settings and grammar changes, formula and label admission/recalculation integration where needed, and focused tests and registry records. Task 5 of the approved ten-task verification cycle."
  Plan: "Reuse ScDocOptions, ScTpCalcItem, grammar commands, and recalculation owners for dialog activation, edited values, reset, and transactional apply. Complete supported Excel A1 grammar and explicit/automatic label selection behavior needed by the represented controls. Verify actual changed calculation behavior and number formatting, the source tdf137617 UI syntax transition and label defaults, cancellation and round trips."
  Verify Steps: "Run focused Calc options UI, formula grammar, names/labels, calculation settings and workbook tests, including the source tdf137617 options workflow. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the source commit for this task to restore the previous options UI and grammar dispatch."
  Findings: "Pending upstream comparison."
id_source: "generated"
---
## Summary

Open native-shaped Calc Calculate and Formula settings through the original Tools Options slot.

## Scope

Calc-only options dialog host with a tree and the two source calculation pages, native document settings and grammar changes, formula and label admission/recalculation integration where needed, and focused tests and registry records. Task 5 of the approved ten-task verification cycle.

## Plan

Reuse ScDocOptions, ScTpCalcItem, grammar commands, and recalculation owners for dialog activation, edited values, reset, and transactional apply. Complete supported Excel A1 grammar and explicit/automatic label selection behavior needed by the represented controls. Verify actual changed calculation behavior and number formatting, the source tdf137617 UI syntax transition and label defaults, cancellation and round trips.

## Verify Steps

Run focused Calc options UI, formula grammar, names/labels, calculation settings and workbook tests, including the source tdf137617 options workflow. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor.

## Verification

Pending implementation.

## Rollback Plan

Revert the source commit for this task to restore the previous options UI and grammar dispatch.

## Findings

Pending upstream comparison.
