---
id: "202611281035-E2Q2ZZ"
title: "Align Calc ODS formula search mode with native criteria evaluation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T10:35:48.551Z"
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
    body: "Start: apply the original ODS search-mode setting to represented formula criteria."
events:
  -
    type: "status"
    at: "2026-11-28T10:35:48.911Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: apply the original ODS search-mode setting to represented formula criteria."
doc_version: 3
doc_updated_at: "2026-11-28T10:35:48.911Z"
doc_updated_by: "CODER"
description: "Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening."
sections:
  Summary: |-
    Align Calc ODS formula search mode with native criteria evaluation

    Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.
  Scope: |-
    - In scope: Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.
    - Out of scope: unrelated refactors not required for "Align Calc ODS formula search mode with native criteria evaluation".
  Plan: "Port native ScQueryEntry search construction, exact criteria and ordered-match policies through the existing text search and query evaluator owners. Bind the platform regex factory to Calc documents on initial browser creation, ODS import and Worker restoration. Reuse original settings and preserve the distinct literal, wildcard and regexp defaults. Verify ODF package, Worker and affected lookup, conditional and database formulas against applicable pinned assertions."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS formula search mode with native criteria evaluation". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS formula search mode with native criteria evaluation". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Calc ODS formula search mode with native criteria evaluation

Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.

## Scope

- In scope: Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.
- Out of scope: unrelated refactors not required for "Align Calc ODS formula search mode with native criteria evaluation".

## Plan

Port native ScQueryEntry search construction, exact criteria and ordered-match policies through the existing text search and query evaluator owners. Bind the platform regex factory to Calc documents on initial browser creation, ODS import and Worker restoration. Reuse original settings and preserve the distinct literal, wildcard and regexp defaults. Verify ODF package, Worker and affected lookup, conditional and database formulas against applicable pinned assertions.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS formula search mode with native criteria evaluation". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS formula search mode with native criteria evaluation". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
