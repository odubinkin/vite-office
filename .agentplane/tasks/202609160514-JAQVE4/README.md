---
id: "202609160514-JAQVE4"
title: "Fix Writer menu hover and checkmarks"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T05:14:41.364Z"
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
    body: "Start: Implement hover switching for open Writer top-level menus and visible checkmarks for checked menu commands within the approved menubar scope."
events:
  -
    type: "status"
    at: "2026-09-16T05:14:47.079Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement hover switching for open Writer top-level menus and visible checkmarks for checked menu commands within the approved menubar scope."
doc_version: 3
doc_updated_at: "2026-09-16T05:14:47.079Z"
doc_updated_by: "CODER"
description: "Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands."
sections:
  Summary: |-
    Fix Writer menu hover and checkmarks

    Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.
  Scope: |-
    - In scope: Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.
    - Out of scope: unrelated refactors not required for "Fix Writer menu hover and checkmarks".
  Plan: |-
    Summary: Fix Writer menu interaction and visibility indicators.
    Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx and CommandMenuBar.test.tsx; do not alter unrelated existing task artifacts.
    Plan: Add hover switching between top-level menus only while a menu is open; add a stable left indicator slot with a checkmark for checked check/radio commands; add regression tests for hover switching and checked/unchecked rendering.
    Verify Steps: Run the focused CommandMenuBar and WriterMenuBar tests; run npm run format:check; run npm run lint; run npm run typecheck; run agentplane doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
    Verification: Record exact commands and outcomes after implementation.
    Rollback Plan: Revert only the implementation/test changes from this task, preserving pre-existing task README changes.
    Findings: None at planning time.
  Verify Steps: |-
    PLANNER fallback scaffold for "Fix Writer menu hover and checkmarks". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Fix Writer menu hover and checkmarks". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Fix Writer menu hover and checkmarks

Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.

## Scope

- In scope: Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.
- Out of scope: unrelated refactors not required for "Fix Writer menu hover and checkmarks".

## Plan

Summary: Fix Writer menu interaction and visibility indicators.
Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx and CommandMenuBar.test.tsx; do not alter unrelated existing task artifacts.
Plan: Add hover switching between top-level menus only while a menu is open; add a stable left indicator slot with a checkmark for checked check/radio commands; add regression tests for hover switching and checked/unchecked rendering.
Verify Steps: Run the focused CommandMenuBar and WriterMenuBar tests; run npm run format:check; run npm run lint; run npm run typecheck; run agentplane doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
Verification: Record exact commands and outcomes after implementation.
Rollback Plan: Revert only the implementation/test changes from this task, preserving pre-existing task README changes.
Findings: None at planning time.

## Verify Steps

PLANNER fallback scaffold for "Fix Writer menu hover and checkmarks". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Fix Writer menu hover and checkmarks". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
