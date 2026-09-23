---
id: "202609230742-J030SZ"
title: "Align Writer rulers and page breaks with page geometry"
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
  updated_at: "2026-09-23T07:42:50.976Z"
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
    body: "Start: Implement page-anchored rulers, live pointer feedback, text-area zero marks, and accurate browser page breaks."
events:
  -
    type: "status"
    at: "2026-09-23T07:42:52.062Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement page-anchored rulers, live pointer feedback, text-area zero marks, and accurate browser page breaks."
doc_version: 3
doc_updated_at: "2026-09-23T07:42:52.062Z"
doc_updated_by: "CODER"
description: "Fix page-anchored vertical ruler, live ruler drag feedback, text-area zero origins, and premature browser page breaks using vendored LibreOffice ruler/layout behavior as reference."
sections:
  Summary: |-
    Align Writer rulers and page breaks with page geometry

    Fix page-anchored vertical ruler, live ruler drag feedback, text-area zero origins, and premature browser page breaks using vendored LibreOffice ruler/layout behavior as reference.
  Scope: "Update Writer browser ruler projection, workspace/editor page composition, paragraph pagination, and focused tests. Use vendored LibreOffice SvxRuler/Svtools ruler behavior for origin and drag feedback. No unrelated document-model changes or network access."
  Plan: "Anchor vertical rulers to each page, use page text-area origins and live drag previews, and correct premature page breaks; verify focused UI behavior and static checks."
  Verify Steps: |-
    1. Run `npx vitest run apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: per-page vertical ruler, margin-origin ticks, live drag feedback, single final commit, and page-break regression cases pass.
    2. Run `npm run typecheck --workspace @vite-office/office` and `npm run lint`. Expected: both pass.
    3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: both pass.
    4. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended changes.
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

Align Writer rulers and page breaks with page geometry

Fix page-anchored vertical ruler, live ruler drag feedback, text-area zero origins, and premature browser page breaks using vendored LibreOffice ruler/layout behavior as reference.

## Scope

Update Writer browser ruler projection, workspace/editor page composition, paragraph pagination, and focused tests. Use vendored LibreOffice SvxRuler/Svtools ruler behavior for origin and drag feedback. No unrelated document-model changes or network access.

## Plan

Anchor vertical rulers to each page, use page text-area origins and live drag previews, and correct premature page breaks; verify focused UI behavior and static checks.

## Verify Steps

1. Run `npx vitest run apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: per-page vertical ruler, margin-origin ticks, live drag feedback, single final commit, and page-break regression cases pass.
2. Run `npm run typecheck --workspace @vite-office/office` and `npm run lint`. Expected: both pass.
3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: both pass.
4. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
