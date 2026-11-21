---
id: "202611211813-QM7K49"
title: "Preserve Writer ODT paragraph line-number restarts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:14:00.908Z"
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
    body: "Start: port SwFormatLineNumber and its ODT, Writer layout and transfer boundaries."
events:
  -
    type: "status"
    at: "2026-11-21T18:14:05.559Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port SwFormatLineNumber and its ODT, Writer layout and transfer boundaries."
doc_version: 3
doc_updated_at: "2026-11-21T18:14:05.559Z"
doc_updated_by: "CODER"
description: "Port SwFormatLineNumber, UNO members, ODF paragraph count and restart values, existing model consumers and Worker snapshot compatibility. Verify layout restarts and scoped paragraph-format tests."
sections:
  Summary: "Preserve native Writer paragraph line-number participation and restarts through ODT."
  Scope: "Writer SwFormatLineNumber, pool and paragraph UNO/default properties, ODF style mapping and automatic style identity, Worker snapshot compatibility, paragraph editing, existing format consumers and layout sequencing. Includes pinned ODT input with a paragraph restart and native 24-bit conversion."
  Plan: "Replace the boolean placeholder with the original item and member contracts. Preserve old boolean transfer records. Route both properties through ODF, carry restart state into the current frame sequence and preserve it when changing existing paragraph settings. Port applicable assertions from the original fixtures."
  Verify Steps: "Run scoped Writer ODT, paragraph item and UNO, layout, existing RTF and paragraph-dialog consumers, and Worker tests. Verify original ODT restart input, inherited and direct values, a legacy boolean snapshot and restart precedence across frames. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and whitespace checks."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Preserve native Writer paragraph line-number participation and restarts through ODT.

## Scope

Writer SwFormatLineNumber, pool and paragraph UNO/default properties, ODF style mapping and automatic style identity, Worker snapshot compatibility, paragraph editing, existing format consumers and layout sequencing. Includes pinned ODT input with a paragraph restart and native 24-bit conversion.

## Plan

Replace the boolean placeholder with the original item and member contracts. Preserve old boolean transfer records. Route both properties through ODF, carry restart state into the current frame sequence and preserve it when changing existing paragraph settings. Port applicable assertions from the original fixtures.

## Verify Steps

Run scoped Writer ODT, paragraph item and UNO, layout, existing RTF and paragraph-dialog consumers, and Worker tests. Verify original ODT restart input, inherited and direct values, a legacy boolean snapshot and restart precedence across frames. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and whitespace checks.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
