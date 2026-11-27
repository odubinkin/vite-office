---
id: "202611271205-RCV7KV"
title: "Implement native Calc ODS database sort and subtotal persistence"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:05:59.931Z"
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
    body: "Start: continue the approved descriptor persistence scope under the code blueprint."
events:
  -
    type: "status"
    at: "2026-11-27T12:06:00.817Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue the approved descriptor persistence scope under the code blueprint."
doc_version: 3
doc_updated_at: "2026-11-27T12:06:00.817Z"
doc_updated_by: "CODER"
description: "Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis."
sections:
  Summary: |-
    Implement native Calc ODS database sort and subtotal persistence

    Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.
  Scope: |-
    - In scope: Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.
    - Out of scope: unrelated refactors not required for "Implement native Calc ODS database sort and subtotal persistence".
  Plan: "1. Port ScSortParam and ScSubTotalParam ownership to ScDBData, with native defaults and original field coordinates. 2. Bind original XML sort and subtotal contexts, export, and backwards-compatible Worker fields. 3. Admit the represented aggregate modes of SUBTOTAL and its native range exclusions for the ODS fixture. 4. Verify the pinned files and related tests. Interactive sorting and unrepresented aggregate selectors remain outside this filter task."
  Verify Steps: "Check both unmodified pinned ODS fixtures. Verify native range binding, sort order, copy destination, persisted natural sort mode and omitted alpha-numeric default. Verify the summary-above descriptor, Worker transport, and original nested SUBTOTAL values after reopening. Run the existing affected database, range formula and ODS Worker tests, scoped formatting and lint, Office typecheck, dependencies, provenance and Calc inventory."
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

Implement native Calc ODS database sort and subtotal persistence

Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.

## Scope

- In scope: Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.
- Out of scope: unrelated refactors not required for "Implement native Calc ODS database sort and subtotal persistence".

## Plan

1. Port ScSortParam and ScSubTotalParam ownership to ScDBData, with native defaults and original field coordinates. 2. Bind original XML sort and subtotal contexts, export, and backwards-compatible Worker fields. 3. Admit the represented aggregate modes of SUBTOTAL and its native range exclusions for the ODS fixture. 4. Verify the pinned files and related tests. Interactive sorting and unrepresented aggregate selectors remain outside this filter task.

## Verify Steps

Check both unmodified pinned ODS fixtures. Verify native range binding, sort order, copy destination, persisted natural sort mode and omitted alpha-numeric default. Verify the summary-above descriptor, Worker transport, and original nested SUBTOTAL values after reopening. Run the existing affected database, range formula and ODS Worker tests, scoped formatting and lint, Office typecheck, dependencies, provenance and Calc inventory.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
