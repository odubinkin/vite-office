---
id: "202610091102-E75DEZ"
title: "Integrate Writer and Calc into main and synchronize development branches"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T12:01:51.220Z"
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
    body: "Start: execute approved Writer Calc integration and complete verification across the three designated repositories."
events:
  -
    type: "status"
    at: "2026-10-09T11:02:38.589Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute approved Writer Calc integration and complete verification across the three designated repositories."
doc_version: 3
doc_updated_at: "2026-10-09T12:01:48.432Z"
doc_updated_by: "CODER"
description: "User-approved nine-step synchronization across vite-office, vite-office-writer and vite-office-calc. Push development branches, merge into main, resolve conflicts, run complete verification and repair failures, publish main, merge main back and leave all checkouts clean on their intended branches."
sections:
  Summary: "Integrate the current Writer and Calc commits and synchronize all three user-designated repositories."
  Scope: "Push writer and calc; fetch and merge into main; resolve integration conflicts; repair failed checks and add regression coverage where needed; publish main and merge it back into writer and calc. Include task evidence and lifecycle artifacts."
  Plan: "Integrate and synchronize the three branches. User explicitly expanded approval to retain Istanbul coverage, audit all newly reported gaps, add missing tests and fix genuine coverage defects without lowering 100 percent thresholds; then run complete verification and publish/back-merge branches."
  Verify Steps: |-
    - npm run verify: all formatting, lint, types, boundaries, generated resources, unit coverage, inventory coverage, browser tests, static build, documentation, size, source and registry checks must pass.
    - ap doctor and node .agentplane/policy/check-routing.mjs.
    - git diff --check.
    - git status --short --untracked-files=all in all three checkouts must be empty.
    - Confirm main contains original writer and calc heads; both resulting development branches contain published main.
    - Confirm local and remote heads agree for main, writer and calc.
  Verification: "Pending execution."
  Rollback Plan: "Retain original heads main=069279d9, writer=9a64ad49, calc=01d07401. If rollback becomes necessary, propose explicit revert commits; do not reset or force-push published history."
  Findings: "Both development branches were published using the explicit HTTPS remote URL after SSH authentication failed. Writer and Calc merges had no conflicts, and no source paths overlapped. Original development commits are ancestors of main. The first complete unit run passed 525 files and 14170 tests but failed the strict branch coverage threshold with one branch in paintfrm.ts (15496/15497). Focused existing painter tests passed with 100 percent coverage; a regression case now explicitly checks complete border consumption and touching-border admission in both orientations. The full verification is being repeated. TypeScript 7 feasibility assessment is recorded in task 202610091107-VKHCRS; the requested complete migration is blocked by typescript-eslint peer/API compatibility and repository legacy AST tools. Dependencies remain unchanged. AgentPlane doctor passes with two inherited warnings."
id_source: "generated"
---
## Summary

Integrate the current Writer and Calc commits and synchronize all three user-designated repositories.

## Scope

Push writer and calc; fetch and merge into main; resolve integration conflicts; repair failed checks and add regression coverage where needed; publish main and merge it back into writer and calc. Include task evidence and lifecycle artifacts.

## Plan

Integrate and synchronize the three branches. User explicitly expanded approval to retain Istanbul coverage, audit all newly reported gaps, add missing tests and fix genuine coverage defects without lowering 100 percent thresholds; then run complete verification and publish/back-merge branches.

## Verify Steps

- npm run verify: all formatting, lint, types, boundaries, generated resources, unit coverage, inventory coverage, browser tests, static build, documentation, size, source and registry checks must pass.
- ap doctor and node .agentplane/policy/check-routing.mjs.
- git diff --check.
- git status --short --untracked-files=all in all three checkouts must be empty.
- Confirm main contains original writer and calc heads; both resulting development branches contain published main.
- Confirm local and remote heads agree for main, writer and calc.

## Verification

Pending execution.

## Rollback Plan

Retain original heads main=069279d9, writer=9a64ad49, calc=01d07401. If rollback becomes necessary, propose explicit revert commits; do not reset or force-push published history.

## Findings

Both development branches were published using the explicit HTTPS remote URL after SSH authentication failed. Writer and Calc merges had no conflicts, and no source paths overlapped. Original development commits are ancestors of main. The first complete unit run passed 525 files and 14170 tests but failed the strict branch coverage threshold with one branch in paintfrm.ts (15496/15497). Focused existing painter tests passed with 100 percent coverage; a regression case now explicitly checks complete border consumption and touching-border admission in both orientations. The full verification is being repeated. TypeScript 7 feasibility assessment is recorded in task 202610091107-VKHCRS; the requested complete migration is blocked by typescript-eslint peer/API compatibility and repository legacy AST tools. Dependencies remain unchanged. AgentPlane doctor passes with two inherited warnings.
