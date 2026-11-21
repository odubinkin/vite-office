---
id: "202611210455-2Z6XQG"
title: "Connect Calc print ranges and source edit dialog"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611210443-QJ6DRG"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:55:44.956Z"
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
    at: "2026-11-21T04:56:14.879Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T04:56:14.879Z"
doc_updated_by: "CODER"
description: "Project the native Format Print Ranges popup, connect define/add/edit/clear commands with workbook print snapshots, and implement the native modeless range and repeat-title dialog with live grid references and file round trips."
sections:
  Summary: "Connect the original Calc Format > Print Ranges popup and its editing dialog."
  Scope: "Define, add, remove and edit the existing print areas and repeated row and column titles. Use native selected sheet iteration, native address parsing conventions, print range snapshots, and typed dialog parameters. Preserve workbook format and source default distinctions, and connect the modeless dialog’s three range selectors to the grid. Sheet copying and printer pagination remain separate source actions. Record native irregularities discovered in the covered path."
  Plan: "Generate the upstream print range popup, apply native sheet and history behavior, implement the modeless dialog with repeat and reference handling, and verify focused regressions."
  Verify Steps: |-
    - Run targeted Calc tests for print ranges, Calc resources and relevant workspace view and file persistence.
    - Run the tooling and office TypeScript checks.
    - Run changed-path ESLint and Prettier, source provenance, resource generation and file-size checks, and patch whitespace validation.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit while retaining the previous print-range data owners and file imports."
  Findings: "Pending verification."
id_source: "generated"
---
## Summary

Connect the original Calc Format > Print Ranges popup and its editing dialog.

## Scope

Define, add, remove and edit the existing print areas and repeated row and column titles. Use native selected sheet iteration, native address parsing conventions, print range snapshots, and typed dialog parameters. Preserve workbook format and source default distinctions, and connect the modeless dialog’s three range selectors to the grid. Sheet copying and printer pagination remain separate source actions. Record native irregularities discovered in the covered path.

## Plan

Generate the upstream print range popup, apply native sheet and history behavior, implement the modeless dialog with repeat and reference handling, and verify focused regressions.

## Verify Steps

- Run targeted Calc tests for print ranges, Calc resources and relevant workspace view and file persistence.
- Run the tooling and office TypeScript checks.
- Run changed-path ESLint and Prettier, source provenance, resource generation and file-size checks, and patch whitespace validation.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit while retaining the previous print-range data owners and file imports.

## Findings

Pending verification.
