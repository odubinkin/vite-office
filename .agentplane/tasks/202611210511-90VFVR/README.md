---
id: "202611210511-90VFVR"
title: "Align Writer ODT page master layout and grid properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:11:21.679Z"
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
    body: "Start: align page master import and export using the native Writer style and grid items."
events:
  -
    type: "status"
    at: "2026-11-21T05:11:31.364Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align page master import and export using the native Writer style and grid items."
doc_version: 3
doc_updated_at: "2026-11-21T05:11:31.364Z"
doc_updated_by: "CODER"
description: "Match pinned ODF page usage, shorthand margins, gutter side arithmetic, frame writing direction and page grid properties through native Writer style owners. Replay pinned ODT gutter and page-usage fixtures."
sections:
  Summary: "Align Writer ODT page-master properties with the pinned source and the connected Writer page model."
  Scope: "Page usage, represented margin shorthand, gutter, writing direction, and page-grid XML. Apply through native page properties and preserve Worker transfer. Include source records, pinned fixtures and source findings."
  Plan: "Compare page-master import/export mappers. Connect native property handlers and page state. Verify actual fixtures, XML, model and Worker round-trips, then close task."
  Verify Steps: "Run Writer ODT page layout, page offset, page story, page-grid UNO and Worker suites, including pinned gutter-left.odt and hello.odt plus independent mirrored/RTL/grid XML. Run office typecheck, scoped lint and formatting, module boundaries, provenance, routing, doctor and git diff checks."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task code and test commits. Existing browser records remain readable."
  Findings: "Record preserved upstream reading and writing behavior."
id_source: "generated"
---
## Summary

Align Writer ODT page-master properties with the pinned source and the connected Writer page model.

## Scope

Page usage, represented margin shorthand, gutter, writing direction, and page-grid XML. Apply through native page properties and preserve Worker transfer. Include source records, pinned fixtures and source findings.

## Plan

Compare page-master import/export mappers. Connect native property handlers and page state. Verify actual fixtures, XML, model and Worker round-trips, then close task.

## Verify Steps

Run Writer ODT page layout, page offset, page story, page-grid UNO and Worker suites, including pinned gutter-left.odt and hello.odt plus independent mirrored/RTL/grid XML. Run office typecheck, scoped lint and formatting, module boundaries, provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the task code and test commits. Existing browser records remain readable.

## Findings

Record preserved upstream reading and writing behavior.
