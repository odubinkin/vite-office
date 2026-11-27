---
id: "202611271258-DJEPKB"
title: "Use native plain ODF package media-type admission in Writer and Calc"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "filters"
  - "odf"
  - "package"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify unmodified upstream ODT and ODS packages with native ordinary loading, supported optional or noncanonical mimetype entries, rejected manifest conflicts and repair-only fallback, document round trips and related package/Writer/Calc/Worker tests."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:59:48.948Z"
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
    body: "Start: follow native ZipPackage metadata read and Sfx storage admission while preserving the existing non-recovery workflow."
events:
  -
    type: "status"
    at: "2026-11-27T12:59:49.969Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: follow native ZipPackage metadata read and Sfx storage admission while preserving the existing non-recovery workflow."
doc_version: 3
doc_updated_at: "2026-11-27T12:59:49.969Z"
doc_updated_by: "CODER"
description: "Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes."
sections:
  Summary: |-
    Use native plain ODF package media-type admission in Writer and Calc

    Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.
  Scope: |-
    - In scope: Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.
    - Out of scope: unrelated refactors not required for "Use native plain ODF package media-type admission in Writer and Calc".
  Plan: "Move ordinary ODT and ODS read admission to the represented ZipPackage metadata plus the original Sfx repair-only fallback decision. Preserve progress and cancellation, normal stream consistency checks and the existing ZIP writer ordering. Use source-backed archive fixtures to verify accepted and rejected variants in the normal import and Worker paths. No change to repair or recovery behavior."
  Verify Steps: |-
    PLANNER fallback scaffold for "Use native plain ODF package media-type admission in Writer and Calc". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Use native plain ODF package media-type admission in Writer and Calc". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Use native plain ODF package media-type admission in Writer and Calc

Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.

## Scope

- In scope: Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.
- Out of scope: unrelated refactors not required for "Use native plain ODF package media-type admission in Writer and Calc".

## Plan

Move ordinary ODT and ODS read admission to the represented ZipPackage metadata plus the original Sfx repair-only fallback decision. Preserve progress and cancellation, normal stream consistency checks and the existing ZIP writer ordering. Use source-backed archive fixtures to verify accepted and rejected variants in the normal import and Worker paths. No change to repair or recovery behavior.

## Verify Steps

PLANNER fallback scaffold for "Use native plain ODF package media-type admission in Writer and Calc". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Use native plain ODF package media-type admission in Writer and Calc". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
