---
id: "202611210550-9ABZE8"
title: "Port Writer ODT page background bitmap and color ownership"
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
verify:
  - "Run scoped Writer ODT background, page layout, graphic package, Worker and shared fill-item tests along with office typecheck, scoped lint and formatting, module boundaries, provenance, routing, doctor and git checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:50:26.466Z"
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
    body: "Start: port native bitmap ownership and Writer ODF page and story background mappings from the pinned source."
events:
  -
    type: "status"
    at: "2026-11-21T05:50:26.822Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native bitmap ownership and Writer ODF page and story background mappings from the pinned source."
doc_version: 3
doc_updated_at: "2026-11-21T05:50:26.822Z"
doc_updated_by: "CODER"
description: "Port named and legacy page fill image import, native DrawingLayer fill items and Worker transfer, page style properties, package export, and the original PageBackground.odt assertions."
sections:
  Summary: "Restore Writer ODF page background bitmap and color round trips from the pinned LibreOffice page style and fill owners."
  Scope: "Shared xmloff image style and page backgrounds, DrawingLayer bitmap item and relevant mode WhichIds, Writer page styles and story frame backgrounds, ODF package streams, Worker transfer, pinned and independent tests, source registry and suspected issue notes. Use the existing embedded graphic package profile and preserve project file and recovery policies."
  Plan: "Port native bitmap item and mode, named ODF image styles and legacy fallback for page and story fills, package and Worker round trips, then verify pinned source assertions and scope checks."
  Verify Steps: "Run targeted Writer page layout, story, ODT graphic and Worker tests plus shared fill item and graphic helper tests. Run office typecheck, scoped ESLint and Prettier, module boundaries, provenance, routing, doctor and git diff checks."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Restore Writer ODF page background bitmap and color round trips from the pinned LibreOffice page style and fill owners.

## Scope

Shared xmloff image style and page backgrounds, DrawingLayer bitmap item and relevant mode WhichIds, Writer page styles and story frame backgrounds, ODF package streams, Worker transfer, pinned and independent tests, source registry and suspected issue notes. Use the existing embedded graphic package profile and preserve project file and recovery policies.

## Plan

Port native bitmap item and mode, named ODF image styles and legacy fallback for page and story fills, package and Worker round trips, then verify pinned source assertions and scope checks.

## Verify Steps

Run targeted Writer page layout, story, ODT graphic and Worker tests plus shared fill item and graphic helper tests. Run office typecheck, scoped ESLint and Prettier, module boundaries, provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the task implementation commit.

## Findings

None at intake.
