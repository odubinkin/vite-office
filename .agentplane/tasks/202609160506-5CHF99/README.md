---
id: "202609160506-5CHF99"
title: "Fix Writer shell layout"
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
  updated_at: "2026-09-16T05:06:52.268Z"
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
    body: "Start: implement the approved Writer shell scrolling layout in the current checkout."
events:
  -
    type: "status"
    at: "2026-09-16T05:07:08.890Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer shell scrolling layout in the current checkout."
doc_version: 3
doc_updated_at: "2026-09-16T05:07:08.890Z"
doc_updated_by: "CODER"
description: "Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout."
sections:
  Summary: |-
    Fix Writer shell layout

    Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.
  Scope: |-
    - In scope: Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.
    - Out of scope: unrelated refactors not required for "Fix Writer shell layout".
  Plan: |-
    Summary: Fix the Writer shell so header, sidebar, and footer remain fixed while only the document canvas scrolls.

    Scope: Inspect and modify the existing Writer frontend layout/styles only; no new dependencies, no backend or product behavior changes.

    Plan: 1. Inspect the Writer shell component and CSS/layout constraints. 2. Apply the smallest layout/overflow changes so the viewport shell is fixed and the document canvas owns scrolling. 3. Run the project's available build/lint/test checks and inspect the diff.

    Verify Steps: ap task verify-show 202609160506-5CHF99; npm run build; npm run lint (if available); git diff --check; git status --short --untracked-files=all.

    Verification: Pending implementation.

    Rollback Plan: Revert the task-scoped frontend layout/CSS changes.

    Findings: None yet.
  Verify Steps: |-
    PLANNER fallback scaffold for "Fix Writer shell layout". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Fix Writer shell layout". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Fix Writer shell layout

Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.

## Scope

- In scope: Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.
- Out of scope: unrelated refactors not required for "Fix Writer shell layout".

## Plan

Summary: Fix the Writer shell so header, sidebar, and footer remain fixed while only the document canvas scrolls.

Scope: Inspect and modify the existing Writer frontend layout/styles only; no new dependencies, no backend or product behavior changes.

Plan: 1. Inspect the Writer shell component and CSS/layout constraints. 2. Apply the smallest layout/overflow changes so the viewport shell is fixed and the document canvas owns scrolling. 3. Run the project's available build/lint/test checks and inspect the diff.

Verify Steps: ap task verify-show 202609160506-5CHF99; npm run build; npm run lint (if available); git diff --check; git status --short --untracked-files=all.

Verification: Pending implementation.

Rollback Plan: Revert the task-scoped frontend layout/CSS changes.

Findings: None yet.

## Verify Steps

PLANNER fallback scaffold for "Fix Writer shell layout". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Fix Writer shell layout". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
