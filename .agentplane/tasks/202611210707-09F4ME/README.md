---
id: "202611210707-09F4ME"
title: "Align Writer ODT inline raster image sources"
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
  - "Run scoped Writer ODT rasters, backgrounds, frames and Worker plus shared graphic and base64 tests, office typecheck and static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T07:07:30.387Z"
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
    at: "2026-11-21T07:07:38.104Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T07:07:38.104Z"
doc_updated_by: "CODER"
description: "Port native base64 raster loading through named fills, legacy page and story backgrounds, and anchored graphic frames with upstream source precedence and ODT package export."
sections:
  Summary: "Align Writer ODT inline raster loading with the pinned LibreOffice 26.8.0.2 contexts."
  Scope: "Shared office:binary-data context and PNG/JPEG stream detection, native named fill, legacy page and story background and text graphic contexts, existing graphic/model/Worker and ODT package paths, source notes and regression coverage. Preserve external links as a separately unrepresented document service."
  Plan: "Use the native Base64 decoder in a shared SAX leaf. Preserve URL and inline source ordering for the three native consumers. Verify graphic insertion, branches for missing or malformed sources, attached bitmap values through Worker, and package output and reopening."
  Verify Steps: "Run scoped Writer ODT backgrounds, frame graphics, round trip and Worker suites and shared Base64 and graphic-helper tests. Run office typecheck, scoped lint and formatting, module boundaries, source provenance, routing, doctor and git diff checks."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Writer ODT inline raster loading with the pinned LibreOffice 26.8.0.2 contexts.

## Scope

Shared office:binary-data context and PNG/JPEG stream detection, native named fill, legacy page and story background and text graphic contexts, existing graphic/model/Worker and ODT package paths, source notes and regression coverage. Preserve external links as a separately unrepresented document service.

## Plan

Use the native Base64 decoder in a shared SAX leaf. Preserve URL and inline source ordering for the three native consumers. Verify graphic insertion, branches for missing or malformed sources, attached bitmap values through Worker, and package output and reopening.

## Verify Steps

Run scoped Writer ODT backgrounds, frame graphics, round trip and Worker suites and shared Base64 and graphic-helper tests. Run office typecheck, scoped lint and formatting, module boundaries, source provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
