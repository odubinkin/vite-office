---
id: "202611220300-C7EE7Q"
title: "Preserve native Writer annotation ranges in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611220247-KQ341H"
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:01:12.375Z"
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
    at: "2026-11-22T03:01:35.790Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T03:01:35.790Z"
doc_updated_by: "CODER"
description: "Port native annotation range endpoints, field reanchoring and range export through Writer ODT and Worker with pinned one- and multi-paragraph fixtures."
sections:
  Summary: "Preserve original Writer annotation ranges in ODT through native registered mark and field ownership."
  Scope: |-
    - Add the represented AnnotationMark family and connect it to the existing Writer annotation field and text node position owners.
    - Import annotation-end by its original name, move the field from the provisional start to the true end, and keep both anchored range positions. Export annotation start and end at native text boundaries without exposing the dummy character.
    - Retain range and field ownership through the Writer Worker graph. Port the applicable single- and multi-paragraph source fixtures.
    - Keep scope on existing Writer document sections and annotation types. Existing save/open and autosave behavior remains outside the task.
  Plan: "Trace the original annotation mark, field attachment and text portion export; port the represented range owners and Worker round trip; verify source one- and multi-paragraph fixtures and launch the tenth-task full checkpoint after closeout."
  Verify Steps: |-
    - Run targeted Writer annotation, text mark, Worker ODT transfer and underlying xmloff paragraph tests.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record deterministic verification and refresh the graph at closeout. This is the tenth AgentPlane task in the current cadence; trigger the separate full regression checkpoint after closing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's code and provenance commits and rerun the Writer annotation and mark tests."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve original Writer annotation ranges in ODT through native registered mark and field ownership.

## Scope

- Add the represented AnnotationMark family and connect it to the existing Writer annotation field and text node position owners.
- Import annotation-end by its original name, move the field from the provisional start to the true end, and keep both anchored range positions. Export annotation start and end at native text boundaries without exposing the dummy character.
- Retain range and field ownership through the Writer Worker graph. Port the applicable single- and multi-paragraph source fixtures.
- Keep scope on existing Writer document sections and annotation types. Existing save/open and autosave behavior remains outside the task.

## Plan

Trace the original annotation mark, field attachment and text portion export; port the represented range owners and Worker round trip; verify source one- and multi-paragraph fixtures and launch the tenth-task full checkpoint after closeout.

## Verify Steps

- Run targeted Writer annotation, text mark, Worker ODT transfer and underlying xmloff paragraph tests.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
- Record deterministic verification and refresh the graph at closeout. This is the tenth AgentPlane task in the current cadence; trigger the separate full regression checkpoint after closing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's code and provenance commits and rerun the Writer annotation and mark tests.

## Findings
