---
id: "202609160530-P43ZK6"
title: "Fix first-click caret placement in Writer paragraphs"
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
  updated_at: "2026-09-16T05:30:15.540Z"
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
    body: "Start: Implement immediate first-click caret placement in Writer pointer handling, preserve drag selection, and verify focused browser editing behavior."
events:
  -
    type: "status"
    at: "2026-09-16T05:30:20.034Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement immediate first-click caret placement in Writer pointer handling, preserve drag selection, and verify focused browser editing behavior."
doc_version: 3
doc_updated_at: "2026-09-16T05:30:20.034Z"
doc_updated_by: "CODER"
description: "Ensure the first primary click places the caret at the clicked position instead of falling back to the end of the paragraph, while preserving cross-paragraph drag selection."
sections:
  Summary: |-
    Fix first-click caret placement in Writer paragraphs

    Ensure the first primary click places the caret at the clicked position instead of falling back to the end of the paragraph, while preserving cross-paragraph drag selection.
  Scope: |-
    - In scope: Ensure the first primary click places the caret at the clicked position instead of falling back to the end of the paragraph, while preserving cross-paragraph drag selection.
    - Out of scope: unrelated refactors not required for "Fix first-click caret placement in Writer paragraphs".
  Plan: |-
    Summary: Fix first-click caret placement in Writer paragraphs.

    Scope: apps/office/src/sw/browser/editor/writer-geometry.ts, writer-geometry.test.ts, and a focused browser regression test if needed. Preserve unrelated existing changes and task artifacts.

    Plan: On primary pointer start, resolve the native caret hit-test and immediately apply a collapsed selection at that point before focus fallback can move the model cursor to paragraph end. Keep cross-paragraph drag behavior unchanged. Add regression coverage for initial click placement and the end-to-end Writer click path if practical.

    Verify Steps: Run focused writer geometry/editor tests; run npm run format:check; npm run lint; npm run typecheck; run ap doctor; run node .agentplane/policy/check-routing.mjs; inspect final diff and git status.

    Verification: Record exact commands and outcomes after implementation.

    Rollback Plan: Revert only files changed for this task; preserve pre-existing task README and unrelated work.

    Findings: Root cause is the focus fallback calling FocusNode/SetPaM at paragraph length before the first browser selection is committed.
  Verify Steps: |-
    PLANNER fallback scaffold for "Fix first-click caret placement in Writer paragraphs". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Fix first-click caret placement in Writer paragraphs". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Fix first-click caret placement in Writer paragraphs

Ensure the first primary click places the caret at the clicked position instead of falling back to the end of the paragraph, while preserving cross-paragraph drag selection.

## Scope

- In scope: Ensure the first primary click places the caret at the clicked position instead of falling back to the end of the paragraph, while preserving cross-paragraph drag selection.
- Out of scope: unrelated refactors not required for "Fix first-click caret placement in Writer paragraphs".

## Plan

Summary: Fix first-click caret placement in Writer paragraphs.

Scope: apps/office/src/sw/browser/editor/writer-geometry.ts, writer-geometry.test.ts, and a focused browser regression test if needed. Preserve unrelated existing changes and task artifacts.

Plan: On primary pointer start, resolve the native caret hit-test and immediately apply a collapsed selection at that point before focus fallback can move the model cursor to paragraph end. Keep cross-paragraph drag behavior unchanged. Add regression coverage for initial click placement and the end-to-end Writer click path if practical.

Verify Steps: Run focused writer geometry/editor tests; run npm run format:check; npm run lint; npm run typecheck; run ap doctor; run node .agentplane/policy/check-routing.mjs; inspect final diff and git status.

Verification: Record exact commands and outcomes after implementation.

Rollback Plan: Revert only files changed for this task; preserve pre-existing task README and unrelated work.

Findings: Root cause is the focus fallback calling FocusNode/SetPaM at paragraph length before the first browser selection is committed.

## Verify Steps

PLANNER fallback scaffold for "Fix first-click caret placement in Writer paragraphs". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Fix first-click caret placement in Writer paragraphs". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
