---
id: "202611211751-YJKJ7E"
title: "Align Writer ODT line numbering import and export"
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
  updated_at: "2026-11-21T17:52:07.988Z"
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
    body: "Start: implement native ODT line-number style, numbering format, and property conversion."
events:
  -
    type: "status"
    at: "2026-11-21T17:52:28.894Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native ODT line-number style, numbering format, and property conversion."
doc_version: 3
doc_updated_at: "2026-11-21T17:52:28.894Z"
doc_updated_by: "CODER"
description: "Port native line-number format and character-style ownership, ODF conversion and defaults, UNO distance sentinel and interval behavior, and Worker transport. Verify scoped ODT and native numbering tests and pinned LibreOffice fixtures."
sections:
  Summary: "Align Writer ODT line-numbering settings with the pinned LibreOffice filter and model."
  Scope: "Shared XML line-number configuration and separator, Writer line-number information and UNO conversion, character style resolution, Worker state, ODT format names, offset and omission rules. Preserve current editor and storage interfaces."
  Plan: "Use the original numbering format converter and actual character style owner. Stage global line-number settings until common styles are ready. Preserve the upstream sentinel, interval admission and duplicate behavior. Verify the same native model values after package export and Worker transfer."
  Verify Steps: "Run targeted Writer ODT line numbering, native line numbering, style, and Worker tests. Use at least one pinned ODT fixture for original line-number settings or paragraph participation. Assert numbering type and character style through ODT and Worker, and original configuration fallback behavior. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor, and whitespace checks."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Writer ODT line-numbering settings with the pinned LibreOffice filter and model.

## Scope

Shared XML line-number configuration and separator, Writer line-number information and UNO conversion, character style resolution, Worker state, ODT format names, offset and omission rules. Preserve current editor and storage interfaces.

## Plan

Use the original numbering format converter and actual character style owner. Stage global line-number settings until common styles are ready. Preserve the upstream sentinel, interval admission and duplicate behavior. Verify the same native model values after package export and Worker transfer.

## Verify Steps

Run targeted Writer ODT line numbering, native line numbering, style, and Worker tests. Use at least one pinned ODT fixture for original line-number settings or paragraph participation. Assert numbering type and character style through ODT and Worker, and original configuration fallback behavior. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor, and whitespace checks.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
