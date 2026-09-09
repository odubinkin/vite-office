---
id: "202609090539-29Q2X6"
title: "Route office suites to dedicated pages"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify:
  - "npm run test:coverage --workspace @vite-office/office"
  - "npm run lint -- --quiet apps/office/src/framework/source/services/desktop.tsx apps/office/src/framework/source/services/SuiteCard.tsx apps/office/src/framework/source/services/desktop.test.tsx apps/office/src/framework/source/services/bootstrap.test.tsx"
  - "npm run typecheck --workspace @vite-office/office"
  - "npm run build --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-09-09T05:40:59.035Z"
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
    body: "Start: Implement the approved pathname routing and route-focused UI tests while preserving all unrelated active Writer task changes."
events:
  -
    type: "status"
    at: "2026-09-09T05:41:29.926Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved pathname routing and route-focused UI tests while preserving all unrelated active Writer task changes."
doc_version: 3
doc_updated_at: "2026-09-09T05:41:29.926Z"
doc_updated_by: "CODER"
description: "Show only the application menu and disabled global header on the home page, and render each office suite on its own pathname with the selected application interface filling main#workspace."
sections:
  Summary: |-
    Route office suites to dedicated pages

    Show only the application menu and disabled global header on the home page, and render each office suite on its own pathname with the selected application interface filling main#workspace.
  Scope: |-
    - In scope: pathname-based pages for /, /writer, /calc, /impress, /draw, /base, /math, and /chart; home header and suite menu; full-page main#workspace on suite pages; unknown-path fallback; affected unit tests.
    - Out of scope: implementing new editor capabilities, adding router dependencies, modifying unrelated Writer internals, deployment rewrite configuration, or changing the active task files.
  Plan: "Implement dependency-free pathname routing so the root page contains only the disabled global header and suite launcher, while each known suite path renders only its full-page main#workspace. Reuse the existing Writer workbench and foundation placeholders, update route-aware tests, and preserve unrelated active-task changes."
  Verify Steps: |-
    1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office unit tests pass and coverage remains at configured 100% thresholds.
    2. Run `npm run lint -- --quiet apps/office/src/framework/source/services/desktop.tsx apps/office/src/framework/source/services/SuiteCard.tsx apps/office/src/framework/source/services/desktop.test.tsx apps/office/src/framework/source/services/bootstrap.test.tsx`. Expected: no lint errors in changed implementation and tests.
    3. Run `npm run typecheck --workspace @vite-office/office`. Expected: TypeScript reports no errors.
    4. Run `npm run build --workspace @vite-office/office`. Expected: the production bundle builds successfully.
    5. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors and only intended task files plus pre-existing active-task changes are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commit that changes the desktop routing, launcher card navigation, and their tests; then rerun the declared office checks. Preserve all pre-existing Writer edits from task 202609090458-TRG4A7."
  Findings: ""
id_source: "generated"
---
## Summary

Route office suites to dedicated pages

Show only the application menu and disabled global header on the home page, and render each office suite on its own pathname with the selected application interface filling main#workspace.

## Scope

- In scope: pathname-based pages for /, /writer, /calc, /impress, /draw, /base, /math, and /chart; home header and suite menu; full-page main#workspace on suite pages; unknown-path fallback; affected unit tests.
- Out of scope: implementing new editor capabilities, adding router dependencies, modifying unrelated Writer internals, deployment rewrite configuration, or changing the active task files.

## Plan

Implement dependency-free pathname routing so the root page contains only the disabled global header and suite launcher, while each known suite path renders only its full-page main#workspace. Reuse the existing Writer workbench and foundation placeholders, update route-aware tests, and preserve unrelated active-task changes.

## Verify Steps

1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office unit tests pass and coverage remains at configured 100% thresholds.
2. Run `npm run lint -- --quiet apps/office/src/framework/source/services/desktop.tsx apps/office/src/framework/source/services/SuiteCard.tsx apps/office/src/framework/source/services/desktop.test.tsx apps/office/src/framework/source/services/bootstrap.test.tsx`. Expected: no lint errors in changed implementation and tests.
3. Run `npm run typecheck --workspace @vite-office/office`. Expected: TypeScript reports no errors.
4. Run `npm run build --workspace @vite-office/office`. Expected: the production bundle builds successfully.
5. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors and only intended task files plus pre-existing active-task changes are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commit that changes the desktop routing, launcher card navigation, and their tests; then rerun the declared office checks. Preserve all pre-existing Writer edits from task 202609090458-TRG4A7.

## Findings
