---
id: "202611280634-0VYSFR"
title: "Port Calc ODS tracked formula and formatted text snapshots"
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
  updated_at: "2026-11-28T06:34:29.069Z"
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
    body: "Start: use the original historical formula and edit-text ownership paths."
events:
  -
    type: "status"
    at: "2026-11-28T06:34:29.774Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: use the original historical formula and edit-text ownership paths."
doc_version: 3
doc_updated_at: "2026-11-28T06:34:29.774Z"
doc_updated_by: "CODER"
description: "Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact."
sections:
  Summary: |-
    Port Calc ODS tracked formula and formatted text snapshots

    Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.
  Scope: |-
    - In scope: Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.
    - Out of scope: unrelated refactors not required for "Port Calc ODS tracked formula and formatted text snapshots".
  Plan: "Extend the native change-track cell loader to own historical formula and EditEngine snapshots, preserving formula grammar, cell position, represented matrix flags, action links and first-paragraph behavior. Export using the original tracked-cell shape plus actual wrapped formula calculation and shared cell text style collection. Preserve previously encoded Worker records and transport actual non-scalar old and new cells. Verify existing ODS tracking, Worker, edit text and formula tests and one critical real ODS package roundtrip. Document the pinned first-paragraph text:s behavior. Leave structural actions and interactive change recording outside this increment."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Calc ODS tracked formula and formatted text snapshots". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Calc ODS tracked formula and formatted text snapshots". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port Calc ODS tracked formula and formatted text snapshots

Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.

## Scope

- In scope: Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.
- Out of scope: unrelated refactors not required for "Port Calc ODS tracked formula and formatted text snapshots".

## Plan

Extend the native change-track cell loader to own historical formula and EditEngine snapshots, preserving formula grammar, cell position, represented matrix flags, action links and first-paragraph behavior. Export using the original tracked-cell shape plus actual wrapped formula calculation and shared cell text style collection. Preserve previously encoded Worker records and transport actual non-scalar old and new cells. Verify existing ODS tracking, Worker, edit text and formula tests and one critical real ODS package roundtrip. Document the pinned first-paragraph text:s behavior. Leave structural actions and interactive change recording outside this increment.

## Verify Steps

PLANNER fallback scaffold for "Port Calc ODS tracked formula and formatted text snapshots". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Calc ODS tracked formula and formatted text snapshots". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
