---
id: "202610221715-X5TEM5"
title: "Preserve native sparse ODS export runs for large table browser saving"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T17:16:50.088Z"
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
    body: "Start: reproduce the deferred large-table export-size failure and repair native repeated empty-cell writing with real primary save/reopen checks."
events:
  -
    type: "status"
    at: "2026-10-22T17:16:50.469Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce the deferred large-table export-size failure and repair native repeated empty-cell writing with real primary save/reopen checks."
doc_version: 3
doc_updated_at: "2026-10-22T17:16:50.469Z"
doc_updated_by: "CODER"
description: "Block71 after explicit goal resumption: reproduce5000-row import/autosave export-size failure with independently authored ODF and allocated/styled empty columns;port native equal-format empty-cell run coalescing from ScXMLExport::WriteRowContent. Preserve cell values/styles/geometry and actual primary save/ODS reopen. No limit increases or alternate serialization. Scope up to14 source/test/registry/doc files plus task evidence. Verify changed owners and Calc100;related tests only between full checkpoints70and80."
sections:
  Summary: "Repair large sparse ODS export and primary browser saving without raising existing bounds."
  Scope: "Block71 on calc only. Native equal-format empty-cell repetition within ScXMLExport, independent large ODF fixtures, canonical save/reopen integration, related registry evidence. Up to14source/test/registry/documentation files plus task artifacts. No alternative workbook model, changed byte ceilings or unrelated new services."
  Plan: "Reproduce and repair sparse large ODS autosave/export using the native equal-format repeated-cell mechanism;preserve real model/package contracts and byte ceilings,require source-backed regressions and strict Calc coverage."
  Verify Steps: "Preserve original reproduction output. Run related XML/ODS/save tests with raw100 S/B/F/L for changed owners and full Calc coverage100 with original thresholds. Verify5000-row browser primary save/reopen and exported bytes remain bounded, preserving first/last data and formatting. Existing explicit maxOutputBytes rejection must still pass. Run types,lint,format,dependencies,resources,docs,size,tree,provenance,registry,routing,doctor,production/static checks. No full all-app run before checkpoint80 unless concrete changes/failures require one."
  Verification: "Pending."
  Rollback Plan: "Revert only the task implementation commit and retain user or merged changes."
  Findings: "Preflight: clean calc worktree, user integration commit723fd34df present. Goal status active after previous completed pause. Export currently emits individual empty cells inside allocated columns;upstream WriteRowContent merges equal format and validation runs. Need actual reproduction before claiming the user report root cause."
id_source: "generated"
---
## Summary

Repair large sparse ODS export and primary browser saving without raising existing bounds.

## Scope

Block71 on calc only. Native equal-format empty-cell repetition within ScXMLExport, independent large ODF fixtures, canonical save/reopen integration, related registry evidence. Up to14source/test/registry/documentation files plus task artifacts. No alternative workbook model, changed byte ceilings or unrelated new services.

## Plan

Reproduce and repair sparse large ODS autosave/export using the native equal-format repeated-cell mechanism;preserve real model/package contracts and byte ceilings,require source-backed regressions and strict Calc coverage.

## Verify Steps

Preserve original reproduction output. Run related XML/ODS/save tests with raw100 S/B/F/L for changed owners and full Calc coverage100 with original thresholds. Verify5000-row browser primary save/reopen and exported bytes remain bounded, preserving first/last data and formatting. Existing explicit maxOutputBytes rejection must still pass. Run types,lint,format,dependencies,resources,docs,size,tree,provenance,registry,routing,doctor,production/static checks. No full all-app run before checkpoint80 unless concrete changes/failures require one.

## Verification

Pending.

## Rollback Plan

Revert only the task implementation commit and retain user or merged changes.

## Findings

Preflight: clean calc worktree, user integration commit723fd34df present. Goal status active after previous completed pause. Export currently emits individual empty cells inside allocated columns;upstream WriteRowContent merges equal format and validation runs. Need actual reproduction before claiming the user report root cause.
