---
id: "202609240527-X94T0P"
title: "Split oversized Writer shell test without behavior changes"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run check:file-size"
  - "npm run verify"
  - "npx vitest run apps/office/src/sw/source/uibase/wrtsh"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T05:27:52.745Z"
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
    body: "Start: split the existing Writer shell transfer assertion into a colocated test file without changing runtime code or assertion behavior."
events:
  -
    type: "status"
    at: "2026-09-24T05:28:58.411Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: split the existing Writer shell transfer assertion into a colocated test file without changing runtime code or assertion behavior."
doc_version: 3
doc_updated_at: "2026-09-24T05:34:45.090Z"
doc_updated_by: "CODER"
description: "Repair pre-existing file-size gate by splitting wrtsh.test.ts into focused colocated test files while preserving assertions and coverage; required to run parity stage verification"
sections:
  Summary: |-
    Split oversized Writer shell test without behavior changes

    Repair pre-existing file-size gate by splitting wrtsh.test.ts into focused colocated test files while preserving assertions and coverage; required to run parity stage verification
  Scope: "Only apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts and one new colocated Writer shell test file, plus Agentplane task records. Move existing test blocks without changing assertions, fixtures, runtime code, or test coverage requirements. No network."
  Plan: "1. Identify a self-contained describe block in the oversized Writer shell test. 2. Move it with its existing imports and fixtures into one colocated test file. 3. Run focused tests, file-size gate, and full verify without lowering thresholds."
  Verify Steps: "1. Confirm moved tests preserve their original assertions and cover the same Writer shell behavior; no runtime source changes. 2. Run npx vitest run apps/office/src/sw/source/uibase/wrtsh, npm run check:file-size, and npm run verify; all must pass. 3. Run git diff --check and inspect git status --short --untracked-files=all for only task-scoped changes."
  Verification: |-
    Command: npx vitest run apps/office/src/sw/source/uibase/wrtsh. Result: pass. Evidence: 3 files and 23 tests passed; transfer test assertions moved verbatim. Scope: Writer shell tests.

    Command: npm run check:file-size. Result: pass. Evidence: original wrtsh.test.ts is below 1000 lines and new transfer suite is 75 lines. Scope: authored file-size policy.

    Command: npm run verify. Result: pass. Evidence: 443 office tests and 96 inventory tests at 100% coverage, 13 browser tests, build and static checks, source provenance and parity checks. Scope: full repository gate including concurrent approved stage 1 data.

    Command: git diff --check. Result: pass. Scope: two test files. The only other modified files belong to approved stage 1 inventory work.
  Rollback Plan: "Revert the test split and task close commit, restoring the original test file, then rerun the focused Writer shell tests."
  Findings: ""
id_source: "generated"
---
## Summary

Split oversized Writer shell test without behavior changes

Repair pre-existing file-size gate by splitting wrtsh.test.ts into focused colocated test files while preserving assertions and coverage; required to run parity stage verification

## Scope

Only apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts and one new colocated Writer shell test file, plus Agentplane task records. Move existing test blocks without changing assertions, fixtures, runtime code, or test coverage requirements. No network.

## Plan

1. Identify a self-contained describe block in the oversized Writer shell test. 2. Move it with its existing imports and fixtures into one colocated test file. 3. Run focused tests, file-size gate, and full verify without lowering thresholds.

## Verify Steps

1. Confirm moved tests preserve their original assertions and cover the same Writer shell behavior; no runtime source changes. 2. Run npx vitest run apps/office/src/sw/source/uibase/wrtsh, npm run check:file-size, and npm run verify; all must pass. 3. Run git diff --check and inspect git status --short --untracked-files=all for only task-scoped changes.

## Verification

Command: npx vitest run apps/office/src/sw/source/uibase/wrtsh. Result: pass. Evidence: 3 files and 23 tests passed; transfer test assertions moved verbatim. Scope: Writer shell tests.

Command: npm run check:file-size. Result: pass. Evidence: original wrtsh.test.ts is below 1000 lines and new transfer suite is 75 lines. Scope: authored file-size policy.

Command: npm run verify. Result: pass. Evidence: 443 office tests and 96 inventory tests at 100% coverage, 13 browser tests, build and static checks, source provenance and parity checks. Scope: full repository gate including concurrent approved stage 1 data.

Command: git diff --check. Result: pass. Scope: two test files. The only other modified files belong to approved stage 1 inventory work.

## Rollback Plan

Revert the test split and task close commit, restoring the original test file, then rerun the focused Writer shell tests.

## Findings
