---
id: "202611280656-YYQT5K"
title: "Port Calc ODS tracked sheet insertions and preserve table metadata assertions"
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
  updated_at: "2026-11-28T06:56:52.833Z"
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
    body: "Start: port native insertion ownership and XML parsing/export and repair the full-checkpoint table print assertion."
events:
  -
    type: "status"
    at: "2026-11-28T06:56:53.543Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native insertion ownership and XML parsing/export and repair the full-checkpoint table print assertion."
doc_version: 3
doc_updated_at: "2026-11-28T06:56:53.543Z"
doc_updated_by: "CODER"
description: "Add native loaded change tracking for column, row and sheet insertions with workbook ownership, range defaults, XML and Worker transport, and the original rejection dispatch. Fix the full-checkpoint print attribute assertion to examine the native XML attribute independently of serialization order."
sections:
  Summary: |-
    Port Calc ODS tracked sheet insertions and preserve table metadata assertions

    Add native loaded change tracking for column, row and sheet insertions with workbook ownership, range defaults, XML and Worker transport, and the original rejection dispatch. Fix the full-checkpoint print attribute assertion to examine the native XML attribute independently of serialization order.
  Scope: |-
    - In scope: Add native loaded change tracking for column, row and sheet insertions with workbook ownership, range defaults, XML and Worker transport, and the original rejection dispatch. Fix the full-checkpoint print attribute assertion to examine the native XML attribute independently of serialization order.
    - Out of scope: unrelated refactors not required for "Port Calc ODS tracked sheet insertions and preserve table metadata assertions".
  Plan: "Generalize the loaded ScChangeTrack to native action types and admit workbook column, row and sheet insertions through ScXMLInsertionContext, original whole-axis ranges and argument defaults, native XML export and Worker transport. Reuse existing action IDs, metadata, dependency ordering and protection. Preserve and document the original branch that drops a rejection without movement ranges. Test the original tdf131907 ODS and native insertion and link behavior. Repair the current full-checkpoint print-range assertion by reading the namespaced XML attribute, preserving the pinned table attribute order and roundtrip. Leave deletion and movement snapshots, cutoff handling, and interactive acceptance/rejection commands to their native follow-up."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Calc ODS tracked sheet insertions and preserve table metadata assertions". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Calc ODS tracked sheet insertions and preserve table metadata assertions". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port Calc ODS tracked sheet insertions and preserve table metadata assertions

Add native loaded change tracking for column, row and sheet insertions with workbook ownership, range defaults, XML and Worker transport, and the original rejection dispatch. Fix the full-checkpoint print attribute assertion to examine the native XML attribute independently of serialization order.

## Scope

- In scope: Add native loaded change tracking for column, row and sheet insertions with workbook ownership, range defaults, XML and Worker transport, and the original rejection dispatch. Fix the full-checkpoint print attribute assertion to examine the native XML attribute independently of serialization order.
- Out of scope: unrelated refactors not required for "Port Calc ODS tracked sheet insertions and preserve table metadata assertions".

## Plan

Generalize the loaded ScChangeTrack to native action types and admit workbook column, row and sheet insertions through ScXMLInsertionContext, original whole-axis ranges and argument defaults, native XML export and Worker transport. Reuse existing action IDs, metadata, dependency ordering and protection. Preserve and document the original branch that drops a rejection without movement ranges. Test the original tdf131907 ODS and native insertion and link behavior. Repair the current full-checkpoint print-range assertion by reading the namespaced XML attribute, preserving the pinned table attribute order and roundtrip. Leave deletion and movement snapshots, cutoff handling, and interactive acceptance/rejection commands to their native follow-up.

## Verify Steps

PLANNER fallback scaffold for "Port Calc ODS tracked sheet insertions and preserve table metadata assertions". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Calc ODS tracked sheet insertions and preserve table metadata assertions". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
