---
id: "202611210455-A6GMCY"
title: "Align Calc ODS rich cell text and fields"
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
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:56:00.352Z"
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
    body: "Start: map supported Calc ODS text fields and boundaries to EditEngine and transfer."
events:
  -
    type: "status"
    at: "2026-11-21T04:56:16.170Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: map supported Calc ODS text fields and boundaries to EditEngine and transfer."
doc_version: 3
doc_updated_at: "2026-11-21T04:56:16.170Z"
doc_updated_by: "CODER"
description: "Use native edit features for ODS URL, sheet, date and document title fields, and preserve XML text boundaries and styles across package and Worker transfer. Port the pinned Calc hyperlink-frame and rich text checks."
sections:
  Summary: "Align Calc ODS rich cell text with the represented Calc and EditEngine field owners."
  Scope: "Calc SAX text and field contexts, edit-field construction, field export, text boundaries and formula result paragraphs, Calc Worker transfer, related tests, source records and source findings. Preserve the existing file workflow and support the native URL, table, date and document title field classes."
  Plan: "Follow the pinned Calc paragraph, field and WriteEditCell owners. Preserve field features and styling within EditEngine, the native source token defaults and the existing Worker transfer format. Verify pinned and focused round trips."
  Verify Steps: "Run the Calc ODS filter, rich text and Worker tests, current field and EditEngine ownership tests, and the pinned hyperlink_frame.ods and external_hyperlink.ods regressions in the ODS path. Check Office typecheck, scoped lint/format, dependency guard, provenance, routing, doctor and git diff."
  Verification: "Pending."
  Rollback Plan: "Revert the task's code and test commits. Added Worker fields have a backward-compatible representation."
  Findings: "Record any source field behavior and limits here."
id_source: "generated"
---
## Summary

Align Calc ODS rich cell text with the represented Calc and EditEngine field owners.

## Scope

Calc SAX text and field contexts, edit-field construction, field export, text boundaries and formula result paragraphs, Calc Worker transfer, related tests, source records and source findings. Preserve the existing file workflow and support the native URL, table, date and document title field classes.

## Plan

Follow the pinned Calc paragraph, field and WriteEditCell owners. Preserve field features and styling within EditEngine, the native source token defaults and the existing Worker transfer format. Verify pinned and focused round trips.

## Verify Steps

Run the Calc ODS filter, rich text and Worker tests, current field and EditEngine ownership tests, and the pinned hyperlink_frame.ods and external_hyperlink.ods regressions in the ODS path. Check Office typecheck, scoped lint/format, dependency guard, provenance, routing, doctor and git diff.

## Verification

Pending.

## Rollback Plan

Revert the task's code and test commits. Added Worker fields have a backward-compatible representation.

## Findings

Record any source field behavior and limits here.
