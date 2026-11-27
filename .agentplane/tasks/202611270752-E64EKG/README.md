---
id: "202611270752-E64EKG"
title: "Preserve Calc ODS database-range formulas and counting semantics"
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
  updated_at: "2026-11-27T08:04:04.750Z"
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
    body: "Start: Port worksheet database-range formula binding and counting."
events:
  -
    type: "status"
    at: "2026-11-27T08:04:05.367Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port worksheet database-range formula binding and counting."
doc_version: 3
doc_updated_at: "2026-11-27T08:04:05.367Z"
doc_updated_by: "CODER"
description: "Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint."
sections:
  Summary: |-
    Preserve Calc ODS database-range formulas and counting semantics

    Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.
  Scope: |-
    - In scope: Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.
    - Out of scope: unrelated refactors not required for "Preserve Calc ODS database-range formulas and counting semantics".
  Plan: "Port native database range lexical binding, index tokens and reference expansion. Port worksheet database criteria and DCOUNT/DCOUNTA stack, field and iterator semantics. Restore full pinned database.ods input and assertions, then verify ODS and Worker reload. Run the scheduled full checkpoint after the tenth closure."
  Verify Steps: "Run focused Calc database fixture and relevant compiler/reference/query/Worker tests. Check typecheck, lint, formatting, provenance, dependencies, Calc/shared invariants and routing."
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

Preserve Calc ODS database-range formulas and counting semantics

Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.

## Scope

- In scope: Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.
- Out of scope: unrelated refactors not required for "Preserve Calc ODS database-range formulas and counting semantics".

## Plan

Port native database range lexical binding, index tokens and reference expansion. Port worksheet database criteria and DCOUNT/DCOUNTA stack, field and iterator semantics. Restore full pinned database.ods input and assertions, then verify ODS and Worker reload. Run the scheduled full checkpoint after the tenth closure.

## Verify Steps

Run focused Calc database fixture and relevant compiler/reference/query/Worker tests. Check typecheck, lint, formatting, provenance, dependencies, Calc/shared invariants and routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
