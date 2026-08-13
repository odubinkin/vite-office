---
id: "202608130757-AK2XNQ"
title: "Align Framework desktop path with LibreOffice"
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
  updated_at: "2026-08-13T07:57:53.697Z"
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
    body: "Start: align the Framework desktop module path and retain an honest browser bootstrap boundary."
events:
  -
    type: "status"
    at: "2026-08-13T07:57:54.502Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align the Framework desktop module path and retain an honest browser bootstrap boundary."
doc_version: 3
doc_updated_at: "2026-08-13T07:57:54.502Z"
doc_updated_by: "CODER"
description: "Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage."
sections:
  Summary: |-
    Align Framework desktop path with LibreOffice

    Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.
  Scope: |-
    - In scope: Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.
    - Out of scope: unrelated refactors not required for "Align Framework desktop path with LibreOffice".
  Plan: "1. Rename framework/source/services/App.tsx and its focused test to desktop.tsx/desktop.test.tsx, preserving the existing App export as the browser React composition contract. 2. Update bootstrap and Writer UI test imports that target the shell. 3. Reclassify bootstrap.tsx as a browser-only static mounting adapter in source provenance, map desktop.tsx to the pinned desktop.cxx ownership source, and adjust the source-tree required path and wording. 4. Run fast coverage plus format, lint, types, JSDoc, provenance, source-tree, file-size, and diff checks. Scope excludes visual or functional behavior, Vite entrypoint design, other Framework renames, and the deferred full-suite cadence."
  Verify Steps: "1. Run npm run test:coverage; expected: all fast unit/component tests pass and global coverage remains 100%. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass, desktop.tsx maps to framework/source/services/desktop.cxx, and bootstrap.tsx has an explicit browser-only rationale. 3. Run git diff --check, search for stale services/App imports, and inspect git status --short --untracked-files=all; expected: only task-scoped renames/imports/provenance/structural files and task artifacts remain."
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

Align Framework desktop path with LibreOffice

Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.

## Scope

- In scope: Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.
- Out of scope: unrelated refactors not required for "Align Framework desktop path with LibreOffice".

## Plan

1. Rename framework/source/services/App.tsx and its focused test to desktop.tsx/desktop.test.tsx, preserving the existing App export as the browser React composition contract. 2. Update bootstrap and Writer UI test imports that target the shell. 3. Reclassify bootstrap.tsx as a browser-only static mounting adapter in source provenance, map desktop.tsx to the pinned desktop.cxx ownership source, and adjust the source-tree required path and wording. 4. Run fast coverage plus format, lint, types, JSDoc, provenance, source-tree, file-size, and diff checks. Scope excludes visual or functional behavior, Vite entrypoint design, other Framework renames, and the deferred full-suite cadence.

## Verify Steps

1. Run npm run test:coverage; expected: all fast unit/component tests pass and global coverage remains 100%. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass, desktop.tsx maps to framework/source/services/desktop.cxx, and bootstrap.tsx has an explicit browser-only rationale. 3. Run git diff --check, search for stale services/App imports, and inspect git status --short --untracked-files=all; expected: only task-scoped renames/imports/provenance/structural files and task artifacts remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
