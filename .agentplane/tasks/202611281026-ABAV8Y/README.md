---
id: "202611281026-ABAV8Y"
title: "Align Writer ODT table formula calculation and cached values"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T10:27:02.795Z"
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
    body: "Start: connect native table formulas and Writer field variables to the ODT load path."
events:
  -
    type: "status"
    at: "2026-11-28T10:27:03.153Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native table formulas and Writer field variables to the ODT load path."
doc_version: 3
doc_updated_at: "2026-11-28T10:27:03.153Z"
doc_updated_by: "CODER"
description: "Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture."
sections:
  Summary: |-
    Align Writer ODT table formula calculation and cached values

    Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.
  Scope: |-
    - In scope: Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.
    - Out of scope: unrelated refactors not required for "Align Writer ODT table formula calculation and cached values".
  Plan: "Port SwTableFormula reference scanning and SwTableCalcPara ownership with native box lookup, numeric caches, bounded dependency recursion and native error state. Seed each table calculation from the actual user and SetExpression field owners in document order. Invoke table field updates after content import and at represented layout updates, and keep native Worker box attributes and ODT serialization. Adapt the pinned FODT regression to the represented ODT content stream and run existing focused table and field tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT table formula calculation and cached values". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT table formula calculation and cached values". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Writer ODT table formula calculation and cached values

Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.

## Scope

- In scope: Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.
- Out of scope: unrelated refactors not required for "Align Writer ODT table formula calculation and cached values".

## Plan

Port SwTableFormula reference scanning and SwTableCalcPara ownership with native box lookup, numeric caches, bounded dependency recursion and native error state. Seed each table calculation from the actual user and SetExpression field owners in document order. Invoke table field updates after content import and at represented layout updates, and keep native Worker box attributes and ODT serialization. Adapt the pinned FODT regression to the represented ODT content stream and run existing focused table and field tests.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT table formula calculation and cached values". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT table formula calculation and cached values". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
