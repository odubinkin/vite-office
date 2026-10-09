---
id: "202610090732-MND6MH"
title: "Restore native table frame validity on format replacement and history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:33:40.027Z"
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
    body: "Start: Implement approved iteration249 native frame validity and replacement/history invalidation in Writer only; preserve silent shared claims and document remaining persistent UI frame integration."
events:
  -
    type: "status"
    at: "2026-10-09T07:34:01.037Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved iteration249 native frame validity and replacement/history invalidation in Writer only; preserve silent shared claims and document remaining persistent UI frame integration."
doc_version: 3
doc_updated_at: "2026-10-09T07:34:01.037Z"
doc_updated_by: "CODER"
description: "Iteration249 under C9TN6M: port represented SwFrame validity and paint state and exact row/cell replacement versus history invalidation from pinned LibreOffice. Keep silent shared claims unchanged; prepare native physical-frame invalidation foundation without claiming persistent browser frame integration."
sections:
  Summary: "Restore missing native physical row/cell frame validity transitions on format replacement and history."
  Scope: "apps/office/src/sw/source/core/layout/wsfrm.ts, tabfrm.ts; new native frame invalidation tests and directly related history test additions; matching canonical docs/program/registry/writer/provenance records; this task evidence and append-only parent Findings. No network, upstream artifact copies, registered I/O/recovery changes, or dependency setup task. User's standing iterative-development authorization applies."
  Plan: "1. CODER ports native represented SwFrame validity, allowed/action hooks, complete-paint state and replacement/history row/cell invalidation from pinned frame.hxx/wsfrm.cxx/tabfrm.cxx. Keep physical-client registration and silent ClaimFrameFormat order unchanged. 2. Add independent native state-transition tests including shared peers, lower cell invalidation, repeated clients and real undo/redo. Update only matching canonical Writer provenance with bounded scope and retained status/omissions. 3. Run new/related Writer tests with actual V8 all-four100 for changed modules once upstream is absent; retain unchanged-source certificates only after byte/hash checks. Run scoped format/lint/type/dependency/source/registry checks; restore local symlink in finally. Commit and close leaf only; broad parent remains active. Persistent root/table frame ownership and UI invalidation integration are explicit next work, not claimed here."
  Verify Steps: |-
    1. Compare native initial flags, inline InvalidateSize/Prt/Pos/All and underscore behavior, hooks, complete paint and row/cell replacement/history ordering against pinned9bc445578031fecf56086729d8e4940c77e14d65 source.
    2. Once upstream absent run new+related Writer native ownership/history/layout/render tests; all cases pass. Actual V8 changed wsfrm/tabfrm all-four100, no threshold/counter/skip sanitization. Reuse unchanged source coverage only with source/map/proof SHA validation. No full suite replay this leaf; last full247.
    3. Scoped Prettier/ESLint plus typecheck, dependency/JSDoc/file-size checks and local static build pass upstream absent. Restore link finally, verify pin/clean upstream, registry/provenance/source tree/routing audits. Run AP doctor and same-agent explicitly non-independent evaluator.
    4. Commit scoped implementation then record verification and finish; final Writer git status clean. Broad native UI/layout parity stays incomplete.
  Verification: "Pending implementation and measured checks."
  Rollback Plan: "Revert this leaf's implementation commit with normal git revert if requested; do not reset user commits or remove environment symlink/dependencies."
  Findings: "Read-only source audit confirmed existing SwRowFrame and SwCellFrame only retarget clients on replacement/history, omitting native validity and painting state. Full geometry, follows, native page/root invalidation and persistent browser physical-frame integration remain unverified."
id_source: "generated"
---
## Summary

Restore missing native physical row/cell frame validity transitions on format replacement and history.

## Scope

apps/office/src/sw/source/core/layout/wsfrm.ts, tabfrm.ts; new native frame invalidation tests and directly related history test additions; matching canonical docs/program/registry/writer/provenance records; this task evidence and append-only parent Findings. No network, upstream artifact copies, registered I/O/recovery changes, or dependency setup task. User's standing iterative-development authorization applies.

## Plan

1. CODER ports native represented SwFrame validity, allowed/action hooks, complete-paint state and replacement/history row/cell invalidation from pinned frame.hxx/wsfrm.cxx/tabfrm.cxx. Keep physical-client registration and silent ClaimFrameFormat order unchanged. 2. Add independent native state-transition tests including shared peers, lower cell invalidation, repeated clients and real undo/redo. Update only matching canonical Writer provenance with bounded scope and retained status/omissions. 3. Run new/related Writer tests with actual V8 all-four100 for changed modules once upstream is absent; retain unchanged-source certificates only after byte/hash checks. Run scoped format/lint/type/dependency/source/registry checks; restore local symlink in finally. Commit and close leaf only; broad parent remains active. Persistent root/table frame ownership and UI invalidation integration are explicit next work, not claimed here.

## Verify Steps

1. Compare native initial flags, inline InvalidateSize/Prt/Pos/All and underscore behavior, hooks, complete paint and row/cell replacement/history ordering against pinned9bc445578031fecf56086729d8e4940c77e14d65 source.
2. Once upstream absent run new+related Writer native ownership/history/layout/render tests; all cases pass. Actual V8 changed wsfrm/tabfrm all-four100, no threshold/counter/skip sanitization. Reuse unchanged source coverage only with source/map/proof SHA validation. No full suite replay this leaf; last full247.
3. Scoped Prettier/ESLint plus typecheck, dependency/JSDoc/file-size checks and local static build pass upstream absent. Restore link finally, verify pin/clean upstream, registry/provenance/source tree/routing audits. Run AP doctor and same-agent explicitly non-independent evaluator.
4. Commit scoped implementation then record verification and finish; final Writer git status clean. Broad native UI/layout parity stays incomplete.

## Verification

Pending implementation and measured checks.

## Rollback Plan

Revert this leaf's implementation commit with normal git revert if requested; do not reset user commits or remove environment symlink/dependencies.

## Findings

Read-only source audit confirmed existing SwRowFrame and SwCellFrame only retarget clients on replacement/history, omitting native validity and painting state. Full geometry, follows, native page/root invalidation and persistent browser physical-frame integration remain unverified.
