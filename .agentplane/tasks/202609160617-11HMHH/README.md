---
id: "202609160617-11HMHH"
title: "Fix Writer page scroll and narrow sidebar"
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
  updated_at: "2026-09-16T06:17:13.557Z"
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
    body: "Start: fix long-document Writer page scrolling and narrow-screen sidebar behavior."
events:
  -
    type: "status"
    at: "2026-09-16T06:17:22.865Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: fix long-document Writer page scrolling and narrow-screen sidebar behavior."
doc_version: 3
doc_updated_at: "2026-09-16T06:17:22.865Z"
doc_updated_by: "CODER"
description: "Prevent the outer page from scrolling for long Writer documents and hide the properties sidebar on narrow screens instead of moving it below the canvas. Preserve fixed Writer chrome and keep the document canvas as the only scroll container."
sections:
  Summary: |-
    Fix Writer page scroll and narrow sidebar

    Prevent the outer page from scrolling for long Writer documents and hide the properties sidebar on narrow screens instead of moving it below the canvas. Preserve fixed Writer chrome and keep the document canvas as the only scroll container.
  Scope: |-
    - In scope: Prevent the outer page from scrolling for long Writer documents and hide the properties sidebar on narrow screens instead of moving it below the canvas. Preserve fixed Writer chrome and keep the document canvas as the only scroll container.
    - Out of scope: unrelated refactors not required for "Fix Writer page scroll and narrow sidebar".
  Plan: |-
    Summary: Eliminate Writer page scroll chaining for long documents and hide the properties sidebar on narrow screens.

    Scope: apps/office/src/framework/browser/app/desktop.tsx, apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx, and apps/office/src/vcl/browser/styles.css only if needed for route-scoped page overflow. No content, backend, or unrelated task artifacts.

    Plan: 1. Inspect intrinsic sizing and page overflow in the current Writer shell. 2. Add route-scoped document/body/root overflow containment and hide the sidebar below the desktop breakpoint. 3. Verify with a real Chromium long multi-paragraph document and narrow viewport, then run build/lint/format/focused tests/policy checks.

    Verify Steps: ap task verify-show 202609160617-11HMHH; Playwright long-document scroll-boundary probe; Playwright narrow-viewport sidebar probe; npm run build; npm run lint; npx prettier --check touched files; npx vitest run src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.

    Verification: Pending implementation.

    Rollback Plan: Revert only the task-scoped Writer layout/style changes.

    Findings: None yet.
  Verify Steps: |-
    PLANNER fallback scaffold for "Fix Writer page scroll and narrow sidebar". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Fix Writer page scroll and narrow sidebar". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Fix Writer page scroll and narrow sidebar

Prevent the outer page from scrolling for long Writer documents and hide the properties sidebar on narrow screens instead of moving it below the canvas. Preserve fixed Writer chrome and keep the document canvas as the only scroll container.

## Scope

- In scope: Prevent the outer page from scrolling for long Writer documents and hide the properties sidebar on narrow screens instead of moving it below the canvas. Preserve fixed Writer chrome and keep the document canvas as the only scroll container.
- Out of scope: unrelated refactors not required for "Fix Writer page scroll and narrow sidebar".

## Plan

Summary: Eliminate Writer page scroll chaining for long documents and hide the properties sidebar on narrow screens.

Scope: apps/office/src/framework/browser/app/desktop.tsx, apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx, and apps/office/src/vcl/browser/styles.css only if needed for route-scoped page overflow. No content, backend, or unrelated task artifacts.

Plan: 1. Inspect intrinsic sizing and page overflow in the current Writer shell. 2. Add route-scoped document/body/root overflow containment and hide the sidebar below the desktop breakpoint. 3. Verify with a real Chromium long multi-paragraph document and narrow viewport, then run build/lint/format/focused tests/policy checks.

Verify Steps: ap task verify-show 202609160617-11HMHH; Playwright long-document scroll-boundary probe; Playwright narrow-viewport sidebar probe; npm run build; npm run lint; npx prettier --check touched files; npx vitest run src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.

Verification: Pending implementation.

Rollback Plan: Revert only the task-scoped Writer layout/style changes.

Findings: None yet.

## Verify Steps

PLANNER fallback scaffold for "Fix Writer page scroll and narrow sidebar". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Fix Writer page scroll and narrow sidebar". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
