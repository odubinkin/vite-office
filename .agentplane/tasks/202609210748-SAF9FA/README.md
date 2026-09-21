---
id: "202609210748-SAF9FA"
title: "Restore Writer parity verification gates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T07:52:09.667Z"
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
    body: "Start: restore Writer verification gates while preserving approved selection, toolbar, and title behavior."
events:
  -
    type: "status"
    at: "2026-09-21T07:52:21.819Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore Writer verification gates while preserving approved selection, toolbar, and title behavior."
doc_version: 3
doc_updated_at: "2026-09-21T07:52:21.819Z"
doc_updated_by: "CODER"
description: "Update Writer indent inventory and coverage plus stale E2E assertions while preserving current upstream-correct selection, persistent formatting toolbar, and editable document title behavior."
sections:
  Summary: "Restore the current Writer verification contract without changing the user-approved upstream behavior: paragraph-boundary Shift+ArrowLeft, persistent formatting controls, and editable document title."
  Scope: "In scope: runtime/provenance inventory for wrtsh-indent; missing indent branch coverage; E2E locators and assertions made consistent with the retained behavior. Out of scope: changing selection semantics, context-switching the formatting toolbar, removing title editing, broad parity architecture refactors, or changing the pinned baseline."
  Plan: "1. Register the indent module in semantic runtime inventory and source provenance. 2. Add focused tests for uncovered indent branches. 3. Update Playwright assertions and locators while preserving production behavior. 4. Run targeted and complete repository verification and record evidence."
  Verify Steps: "1. npm run inventory:parity - strict runtime inventory includes every production module. 2. npm run test:coverage - all office tests pass at 100 percent global coverage. 3. npm run test:inventory:coverage - inventory tests pass at 100 percent coverage. 4. npm run test:e2e - Writer selection, menus, persistent toolbar, clipboard, hyperlinks, and ODT flows pass in Chromium. 5. npm run verify - complete repository verification succeeds. 6. node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and git status --short --untracked-files=all pass."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task inventory, tests, and task artifacts. Re-run npm run verify to confirm the previous state; no persisted document schema or production behavior changes are introduced."
  Findings: "Initial audit: wrtsh-indent.ts is absent from strict runtime inventory, new indent branches lower coverage below 100 percent, and Playwright assertions still assume the removed context-switching toolbar plus ambiguous Edit locators. The production behaviors explicitly retained by the user are not defects."
id_source: "generated"
---
## Summary

Restore the current Writer verification contract without changing the user-approved upstream behavior: paragraph-boundary Shift+ArrowLeft, persistent formatting controls, and editable document title.

## Scope

In scope: runtime/provenance inventory for wrtsh-indent; missing indent branch coverage; E2E locators and assertions made consistent with the retained behavior. Out of scope: changing selection semantics, context-switching the formatting toolbar, removing title editing, broad parity architecture refactors, or changing the pinned baseline.

## Plan

1. Register the indent module in semantic runtime inventory and source provenance. 2. Add focused tests for uncovered indent branches. 3. Update Playwright assertions and locators while preserving production behavior. 4. Run targeted and complete repository verification and record evidence.

## Verify Steps

1. npm run inventory:parity - strict runtime inventory includes every production module. 2. npm run test:coverage - all office tests pass at 100 percent global coverage. 3. npm run test:inventory:coverage - inventory tests pass at 100 percent coverage. 4. npm run test:e2e - Writer selection, menus, persistent toolbar, clipboard, hyperlinks, and ODT flows pass in Chromium. 5. npm run verify - complete repository verification succeeds. 6. node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and git status --short --untracked-files=all pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task inventory, tests, and task artifacts. Re-run npm run verify to confirm the previous state; no persisted document schema or production behavior changes are introduced.

## Findings

Initial audit: wrtsh-indent.ts is absent from strict runtime inventory, new indent branches lower coverage below 100 percent, and Playwright assertions still assume the removed context-switching toolbar plus ambiguous Edit locators. The production behaviors explicitly retained by the user are not defects.
