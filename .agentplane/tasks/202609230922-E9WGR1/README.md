---
id: "202609230922-E9WGR1"
title: "Separate Writer ruler indent triangles vertically"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T09:22:37.634Z"
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
    body: "Start: Move paragraph indent triangles to the lower ruler edge and verify that first-line and body indent controls stay independent."
events:
  -
    type: "status"
    at: "2026-09-23T09:22:38.338Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Move paragraph indent triangles to the lower ruler edge and verify that first-line and body indent controls stay independent."
doc_version: 3
doc_updated_at: "2026-09-23T09:22:38.338Z"
doc_updated_by: "CODER"
description: "Place paragraph left and right indent markers along the bottom of the horizontal ruler while the first-line marker stays at the top, preserving independent drag behavior."
sections:
  Summary: |-
    Separate Writer ruler indent triangles vertically

    Place paragraph left and right indent markers along the bottom of the horizontal ruler while the first-line marker stays at the top, preserving independent drag behavior.
  Scope: "Update horizontal ruler indent marker placement and focused ruler tests only. Keep page-margin markers, model coordinates, and commit callbacks unchanged."
  Plan: "Move body indent triangles to the bottom edge, leave first-line indent at the top, and verify independent drag behavior."
  Verify Steps: |-
    1. Run `npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: bottom/top indent marker separation and existing drag callbacks pass.
    2. Run `npm run typecheck --workspace @vite-office/office`, `npm run lint`, and `npm run format:check`. Expected: pass.
    3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: pass.
    4. Run `git diff --check` and inspect `git status --short --untracked-files=all`. Expected: no whitespace errors or unrelated changes.
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

Separate Writer ruler indent triangles vertically

Place paragraph left and right indent markers along the bottom of the horizontal ruler while the first-line marker stays at the top, preserving independent drag behavior.

## Scope

Update horizontal ruler indent marker placement and focused ruler tests only. Keep page-margin markers, model coordinates, and commit callbacks unchanged.

## Plan

Move body indent triangles to the bottom edge, leave first-line indent at the top, and verify independent drag behavior.

## Verify Steps

1. Run `npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: bottom/top indent marker separation and existing drag callbacks pass.
2. Run `npm run typecheck --workspace @vite-office/office`, `npm run lint`, and `npm run format:check`. Expected: pass.
3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: pass.
4. Run `git diff --check` and inspect `git status --short --untracked-files=all`. Expected: no whitespace errors or unrelated changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
