---
id: "202611121427-8RHTFM"
title: "Replace custom ZIP implementation with zip.js"
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
  updated_at: "2026-11-12T14:27:45.350Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-12T14:27:51.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-12T14:27:51.566Z"
doc_updated_by: "CODER"
description: "Use @zip.js/zip.js for all document archive reads and writes, migrate asynchronous callers, remove custom ZIP implementation and implementation-specific tests, and retain document integration coverage. User approved plan and network access."
sections:
  Summary: "Replace the custom archive codec with @zip.js/zip.js across ODF and OOXML."
  Scope: "Office dependency and lock file; ZIP transport and orphaned byte helpers; all archive consumers and asynchronous document export callers; implementation-specific ZIP tests; affected integration tests and source/provenance registry references. Network installation and official API documentation access approved by the user. No external publication."
  Plan: "Install zip.js; replace custom ZIP codec with library-backed document archive adapter; migrate asynchronous consumers and export chains; remove codec-only tests and orphaned helpers; update source metadata; verify build, types and affected integration scenarios."
  Verify Steps: |-
    - npm run typecheck
    - npm run build
    - Run affected package, ODF/OOXML filter and browser workflow integration suites with Vitest.
    - Run inventory ODT diagnostics tests.
    - Run ESLint and Prettier on changed code; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check.
    - Confirm no runtime import of the retired ZIP codec remains; inspect git diff and git status --short --untracked-files=all.
  Verification: "Pending execution."
  Rollback Plan: "Revert only this task's implementation and dependency changes together."
  Findings: "Initial checkout is clean on main; workflow is direct. Existing document resource ceilings and safe path rules remain application policies. ZIP byte compatibility tests tied to the removed custom codec will be deleted."
id_source: "generated"
---
## Summary

Replace the custom archive codec with @zip.js/zip.js across ODF and OOXML.

## Scope

Office dependency and lock file; ZIP transport and orphaned byte helpers; all archive consumers and asynchronous document export callers; implementation-specific ZIP tests; affected integration tests and source/provenance registry references. Network installation and official API documentation access approved by the user. No external publication.

## Plan

Install zip.js; replace custom ZIP codec with library-backed document archive adapter; migrate asynchronous consumers and export chains; remove codec-only tests and orphaned helpers; update source metadata; verify build, types and affected integration scenarios.

## Verify Steps

- npm run typecheck
- npm run build
- Run affected package, ODF/OOXML filter and browser workflow integration suites with Vitest.
- Run inventory ODT diagnostics tests.
- Run ESLint and Prettier on changed code; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check.
- Confirm no runtime import of the retired ZIP codec remains; inspect git diff and git status --short --untracked-files=all.

## Verification

Pending execution.

## Rollback Plan

Revert only this task's implementation and dependency changes together.

## Findings

Initial checkout is clean on main; workflow is direct. Existing document resource ceilings and safe path rules remain application policies. ZIP byte compatibility tests tied to the removed custom codec will be deleted.
