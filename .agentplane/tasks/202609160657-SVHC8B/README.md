---
id: "202609160657-SVHC8B"
title: "Move editor menus into document title bar"
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
  updated_at: "2026-09-16T06:57:14.224Z"
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
    body: "Start: inspect the editor header/menu layout, implement the approved single-row placement, and verify the scoped UI change."
events:
  -
    type: "status"
    at: "2026-09-16T06:57:22.732Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspect the editor header/menu layout, implement the approved single-row placement, and verify the scoped UI change."
doc_version: 3
doc_updated_at: "2026-09-16T06:57:22.732Z"
doc_updated_by: "CODER"
description: "Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header."
sections:
  Summary: |-
    Move editor menus into document title bar

    Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.
  Scope: |-
    - In scope: Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.
    - Out of scope: unrelated refactors not required for "Move editor menus into document title bar".
  Plan: "Scope: adjust the editor header layout and its styles so the existing File/Edit/etc. menus render immediately to the right of the document-name/workbench-label area in one row. Preserve menu items and behavior; do not change unrelated editor logic. Plan: inspect relevant React/CSS files; apply the smallest layout/style change; run the declared checks and inspect the resulting UI if a local browser check is available. Verify Steps: ap task verify-show 202609160657-SVHC8B; npm test -- --run; npm run build; node .agentplane/policy/check-routing.mjs; git status --short --untracked-files=all. Rollback Plan: revert only the task-scoped source/style changes if verification fails."
  Verify Steps: |-
    PLANNER fallback scaffold for "Move editor menus into document title bar". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Move editor menus into document title bar". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Move editor menus into document title bar

Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.

## Scope

- In scope: Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.
- Out of scope: unrelated refactors not required for "Move editor menus into document title bar".

## Plan

Scope: adjust the editor header layout and its styles so the existing File/Edit/etc. menus render immediately to the right of the document-name/workbench-label area in one row. Preserve menu items and behavior; do not change unrelated editor logic. Plan: inspect relevant React/CSS files; apply the smallest layout/style change; run the declared checks and inspect the resulting UI if a local browser check is available. Verify Steps: ap task verify-show 202609160657-SVHC8B; npm test -- --run; npm run build; node .agentplane/policy/check-routing.mjs; git status --short --untracked-files=all. Rollback Plan: revert only the task-scoped source/style changes if verification fails.

## Verify Steps

PLANNER fallback scaffold for "Move editor menus into document title bar". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Move editor menus into document title bar". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
