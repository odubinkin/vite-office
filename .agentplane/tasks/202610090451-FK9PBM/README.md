---
id: "202610090451-FK9PBM"
title: "Separate Writer Calc and shared test projects"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T04:52:28.159Z"
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
    body: "Start: Implement approved Writer Calc and shared test isolation with scoped coverage, E2E selection and dependency boundaries."
events:
  -
    type: "status"
    at: "2026-10-09T04:52:28.935Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Writer Calc and shared test isolation with scoped coverage, E2E selection and dependency boundaries."
doc_version: 3
doc_updated_at: "2026-10-09T04:52:28.935Z"
doc_updated_by: "CODER"
description: "Implement the user-approved application test isolation: Vitest projects and scoped coverage, Playwright projects, per-application scripts, Calc module dependency boundaries, and usage documentation; preserve full-suite verification."
sections:
  Summary: "Separate application tests so Writer and future Calc development can be verified independently."
  Scope: "Office Vitest and Playwright configuration, root/workspace test commands, module-boundary checker and its tests, test-isolation regression checks, README and test-strategy documentation. Existing runtime behavior and parity mappings stay unchanged."
  Plan: "Create application-specific Vitest coverage and Playwright projects, scoped npm commands, Calc dependency guards and test-isolation regressions, preserve existing full verification and test paths, and document usage. User approval supplied in the current chat."
  Verify Steps: |-
    - npm run test:writer; npm run test:shared; npm run test:calc; npm run test:coverage:writer; npm run test:coverage:shared; npm run test:coverage
    - Run regression tests for test project partitioning and module boundaries; npm run test:inventory:coverage.
    - npm run test:e2e; list each Playwright project to verify selection and the empty Calc project.
    - npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run test:static.
    - ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task implementation commit to restore unified configuration and commands."
  Findings: "User approved the previously proposed test separation. Calc has no implementation yet; its commands must report an empty suite successfully without running Writer tests. No network access is required."
id_source: "generated"
---
## Summary

Separate application tests so Writer and future Calc development can be verified independently.

## Scope

Office Vitest and Playwright configuration, root/workspace test commands, module-boundary checker and its tests, test-isolation regression checks, README and test-strategy documentation. Existing runtime behavior and parity mappings stay unchanged.

## Plan

Create application-specific Vitest coverage and Playwright projects, scoped npm commands, Calc dependency guards and test-isolation regressions, preserve existing full verification and test paths, and document usage. User approval supplied in the current chat.

## Verify Steps

- npm run test:writer; npm run test:shared; npm run test:calc; npm run test:coverage:writer; npm run test:coverage:shared; npm run test:coverage
- Run regression tests for test project partitioning and module boundaries; npm run test:inventory:coverage.
- npm run test:e2e; list each Playwright project to verify selection and the empty Calc project.
- npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run test:static.
- ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.

## Verification

Pending implementation.

## Rollback Plan

Revert the task implementation commit to restore unified configuration and commands.

## Findings

User approved the previously proposed test separation. Calc has no implementation yet; its commands must report an empty suite successfully without running Writer tests. No network access is required.
