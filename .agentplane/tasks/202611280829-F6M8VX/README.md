---
id: "202611280829-F6M8VX"
title: "Connect Writer Navigator table actions and cursor eligibility"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run only affected Navigator, table cursor, dialog, and undo tests and relevant Chromium cases. Run scoped static checks and the production build."
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:29:40.188Z"
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
    at: "2026-11-28T08:30:01.971Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-28T08:30:01.971Z"
doc_updated_by: "CODER"
description: "Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core."
sections:
  Summary: |-
    Connect Writer Navigator table actions and cursor eligibility

    Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.
  Scope: |-
    - In scope: Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.
    - Out of scope: unrelated refactors not required for "Connect Writer Navigator table actions and cursor eligibility".
  Plan: "Trace the pinned table context menu, protected-cell traversal, selection, rename and deletion paths through both graphs and source. Reuse Writer table shell, properties dialog and node/history owners for Navigator table commands. Implement missing native deletion and protection contracts within the table model and preserve cursor state across undo and redo. Validate connected table actions and traversal with only affected tests and focused Chromium scenarios."
  Verify Steps: "Run the affected Navigator, table shell, table cursor, properties and history tests plus focused Chromium table actions. Run TypeScript, production build, resource, scoped dependency, format, lint and provenance checks. Use no full test run."
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

Connect Writer Navigator table actions and cursor eligibility

Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.

## Scope

- In scope: Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.
- Out of scope: unrelated refactors not required for "Connect Writer Navigator table actions and cursor eligibility".

## Plan

Trace the pinned table context menu, protected-cell traversal, selection, rename and deletion paths through both graphs and source. Reuse Writer table shell, properties dialog and node/history owners for Navigator table commands. Implement missing native deletion and protection contracts within the table model and preserve cursor state across undo and redo. Validate connected table actions and traversal with only affected tests and focused Chromium scenarios.

## Verify Steps

Run the affected Navigator, table shell, table cursor, properties and history tests plus focused Chromium table actions. Run TypeScript, production build, resource, scoped dependency, format, lint and provenance checks. Use no full test run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
