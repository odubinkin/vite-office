---
id: "202611271154-2C7FY1"
title: "Retain native database sort and subtotal descriptors in Calc ODS"
status: "BLOCKED"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:54:42.396Z"
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
    body: "Start: retain native database sort and subtotal definitions in the Calc ODS filter and Worker."
  -
    author: "CODER"
    body: "Blocked: superseded by RCV7KV because the fallback classified this implementation as analysis. The approved scope and existing scratch implementation continue on the code task."
events:
  -
    type: "status"
    at: "2026-11-27T11:54:43.147Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: retain native database sort and subtotal definitions in the Calc ODS filter and Worker."
  -
    type: "status"
    at: "2026-11-27T12:06:08.312Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: superseded by RCV7KV because the fallback classified this implementation as analysis. The approved scope and existing scratch implementation continue on the code task."
doc_version: 3
doc_updated_at: "2026-11-27T12:06:08.312Z"
doc_updated_by: "CODER"
description: "Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the native persistence portions of tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods, including the existing aggregate operations needed for the latter's SUBTOTAL cells. Interactive sorting, group generation and unrepresented aggregate selectors are outside the filter scope."
sections:
  Summary: |-
    Retain native database sort and subtotal descriptors in Calc ODS

    Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the native persistence portions of tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods, including the existing aggregate operations needed for the latter's SUBTOTAL cells. Interactive sorting, group generation and unrepresented aggregate selectors are outside the filter scope.
  Scope: |-
    - In scope: Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the native persistence portions of tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods, including the existing aggregate operations needed for the latter's SUBTOTAL cells. Interactive sorting, group generation and unrepresented aggregate selectors are outside the filter scope.
    - Out of scope: unrelated refactors not required for "Retain native database sort and subtotal descriptors in Calc ODS".
  Plan: "1. Port native ScSortParam and ScSubTotalParam ownership to ScDBData with relative key and range binding. 2. Port original Calc XML sort and subtotal contexts and export, using optional Worker descriptor fields. 3. Support the existing aggregate modes of SUBTOTAL through the native value iterator, including hidden, filtered and nested subtotal exclusions, to open the original subtotal fixture. 4. Verify the original fixture persistence portions and the existing relevant tests."
  Verify Steps: "Open both original LibreOffice ODS packages. Verify the named range sort keys, header and copy destination, retained non-default natural sort mode and omission of the original alpha-numeric default. Verify the original subtotal summary-above descriptor and computed nested subtotal values through Worker transport and ODS reopening. Run focused existing Calc database, range formula and ODS worker tests, Office typecheck, scoped format and lint, dependency rules, provenance and Calc inventory."
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

Retain native database sort and subtotal descriptors in Calc ODS

Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the native persistence portions of tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods, including the existing aggregate operations needed for the latter's SUBTOTAL cells. Interactive sorting, group generation and unrepresented aggregate selectors are outside the filter scope.

## Scope

- In scope: Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the native persistence portions of tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods, including the existing aggregate operations needed for the latter's SUBTOTAL cells. Interactive sorting, group generation and unrepresented aggregate selectors are outside the filter scope.
- Out of scope: unrelated refactors not required for "Retain native database sort and subtotal descriptors in Calc ODS".

## Plan

1. Port native ScSortParam and ScSubTotalParam ownership to ScDBData with relative key and range binding. 2. Port original Calc XML sort and subtotal contexts and export, using optional Worker descriptor fields. 3. Support the existing aggregate modes of SUBTOTAL through the native value iterator, including hidden, filtered and nested subtotal exclusions, to open the original subtotal fixture. 4. Verify the original fixture persistence portions and the existing relevant tests.

## Verify Steps

Open both original LibreOffice ODS packages. Verify the named range sort keys, header and copy destination, retained non-default natural sort mode and omission of the original alpha-numeric default. Verify the original subtotal summary-above descriptor and computed nested subtotal values through Worker transport and ODS reopening. Run focused existing Calc database, range formula and ODS worker tests, Office typecheck, scoped format and lint, dependency rules, provenance and Calc inventory.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
