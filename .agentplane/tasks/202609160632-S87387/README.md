---
id: "202609160632-S87387"
title: "Refine Writer submenu hover behavior"
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
  updated_at: "2026-09-16T06:32:47.676Z"
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
    body: "Start: Remove the blue checkmark override and change nested Writer submenus to hover-open behavior with keyboard support preserved."
events:
  -
    type: "status"
    at: "2026-09-16T06:32:52.295Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Remove the blue checkmark override and change nested Writer submenus to hover-open behavior with keyboard support preserved."
doc_version: 3
doc_updated_at: "2026-09-16T06:32:52.295Z"
doc_updated_by: "CODER"
description: "Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access."
sections:
  Summary: |-
    Refine Writer submenu hover behavior

    Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.
  Scope: |-
    - In scope: Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.
    - Out of scope: unrelated refactors not required for "Refine Writer submenu hover behavior".
  Plan: |-
    Summary: Refine Writer menu visual and submenu interactions.
    Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx, apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx, and apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx.
    Plan: Remove the explicit blue checkmark color so the indicator inherits the menu item's default color; open nested submenus on pointer hover and close them when leaving the submenu region; keep Enter/ArrowRight keyboard opening and make mouse click non-toggling; update focused regression tests.
    Verify Steps: Run focused CommandMenuBar and WriterMenuBar tests; run npm run test:coverage --workspace @vite-office/office; run npm run format:check; run npm run lint; run npm run typecheck; run ap doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
    Verification: Record exact commands and outcomes after implementation.
    Rollback Plan: Revert only this task's implementation and test changes, preserving unrelated repository history.
    Findings: None at planning time.
  Verify Steps: |-
    PLANNER fallback scaffold for "Refine Writer submenu hover behavior". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Refine Writer submenu hover behavior". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Refine Writer submenu hover behavior

Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.

## Scope

- In scope: Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.
- Out of scope: unrelated refactors not required for "Refine Writer submenu hover behavior".

## Plan

Summary: Refine Writer menu visual and submenu interactions.
Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx, apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx, and apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx.
Plan: Remove the explicit blue checkmark color so the indicator inherits the menu item's default color; open nested submenus on pointer hover and close them when leaving the submenu region; keep Enter/ArrowRight keyboard opening and make mouse click non-toggling; update focused regression tests.
Verify Steps: Run focused CommandMenuBar and WriterMenuBar tests; run npm run test:coverage --workspace @vite-office/office; run npm run format:check; run npm run lint; run npm run typecheck; run ap doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
Verification: Record exact commands and outcomes after implementation.
Rollback Plan: Revert only this task's implementation and test changes, preserving unrelated repository history.
Findings: None at planning time.

## Verify Steps

PLANNER fallback scaffold for "Refine Writer submenu hover behavior". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Refine Writer submenu hover behavior". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
