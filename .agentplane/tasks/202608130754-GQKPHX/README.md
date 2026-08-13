---
id: "202608130754-GQKPHX"
title: "Align Framework module manager path with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T07:54:35.584Z"
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
    body: "Start: rename the mapped Framework suite registry to modulemanager and update its verified local references."
events:
  -
    type: "status"
    at: "2026-08-13T07:54:36.173Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: rename the mapped Framework suite registry to modulemanager and update its verified local references."
doc_version: 3
doc_updated_at: "2026-08-13T07:54:36.173Z"
doc_updated_by: "CODER"
description: "Rename the browser suite inventory module from suites.ts to modulemanager.ts, retaining its static-browser semantics while matching pinned LibreOffice framework/source/services/modulemanager.cxx ownership. Update imports, tests, source provenance, source-tree documentation, and structural checks; preserve behavior and coverage."
sections:
  Summary: |-
    Align Framework module manager path with LibreOffice

    Rename the browser suite inventory module from suites.ts to modulemanager.ts, retaining its static-browser semantics while matching pinned LibreOffice framework/source/services/modulemanager.cxx ownership. Update imports, tests, source provenance, source-tree documentation, and structural checks; preserve behavior and coverage.
  Scope: |-
    - In scope: Rename the browser suite inventory module from suites.ts to modulemanager.ts, retaining its static-browser semantics while matching pinned LibreOffice framework/source/services/modulemanager.cxx ownership. Update imports, tests, source provenance, source-tree documentation, and structural checks; preserve behavior and coverage.
    - Out of scope: unrelated refactors not required for "Align Framework module manager path with LibreOffice".
  Plan: "1. Rename framework/source/services/suites.ts and its focused unit test to modulemanager.ts/modulemanager.test.ts, preserving the SuiteId and suiteDefinitions public contract. 2. Update every production and test import plus the structural source-tree checker. 3. Amend source provenance and source-tree documentation to map the renamed module to pinned framework/source/services/modulemanager.cxx without overstating browser capability. 4. Run the task-specific fast Vitest coverage suite, formatter, lint, TypeScript, source-tree, source-provenance, documentation, and file-size checks; record results. Scope is restricted to this mapped module, direct importers, its test, and structural documentation/checkers; no feature behavior, browser-only boundaries, unrelated path renames, or full E2E cadence changes."
  Verify Steps: "1. Run npm run test -- --coverage; expected: all fast unit/component tests pass and global coverage remains 100%. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass with no stale suites.ts reference and the renamed module is mapped to framework/source/services/modulemanager.cxx. 3. Inspect git diff --check and git status --short --untracked-files=all; expected: only task-scoped renames/imports/structural documentation and task artifacts remain."
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

Align Framework module manager path with LibreOffice

Rename the browser suite inventory module from suites.ts to modulemanager.ts, retaining its static-browser semantics while matching pinned LibreOffice framework/source/services/modulemanager.cxx ownership. Update imports, tests, source provenance, source-tree documentation, and structural checks; preserve behavior and coverage.

## Scope

- In scope: Rename the browser suite inventory module from suites.ts to modulemanager.ts, retaining its static-browser semantics while matching pinned LibreOffice framework/source/services/modulemanager.cxx ownership. Update imports, tests, source provenance, source-tree documentation, and structural checks; preserve behavior and coverage.
- Out of scope: unrelated refactors not required for "Align Framework module manager path with LibreOffice".

## Plan

1. Rename framework/source/services/suites.ts and its focused unit test to modulemanager.ts/modulemanager.test.ts, preserving the SuiteId and suiteDefinitions public contract. 2. Update every production and test import plus the structural source-tree checker. 3. Amend source provenance and source-tree documentation to map the renamed module to pinned framework/source/services/modulemanager.cxx without overstating browser capability. 4. Run the task-specific fast Vitest coverage suite, formatter, lint, TypeScript, source-tree, source-provenance, documentation, and file-size checks; record results. Scope is restricted to this mapped module, direct importers, its test, and structural documentation/checkers; no feature behavior, browser-only boundaries, unrelated path renames, or full E2E cadence changes.

## Verify Steps

1. Run npm run test -- --coverage; expected: all fast unit/component tests pass and global coverage remains 100%. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass with no stale suites.ts reference and the renamed module is mapped to framework/source/services/modulemanager.cxx. 3. Inspect git diff --check and git status --short --untracked-files=all; expected: only task-scoped renames/imports/structural documentation and task artifacts remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
