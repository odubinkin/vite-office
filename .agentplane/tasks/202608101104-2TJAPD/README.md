---
id: "202608101104-2TJAPD"
title: "Extract pinned LibreOffice UITest Python source targets into atomic records"
status: "DOING"
priority: "high"
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
  updated_at: "2026-08-10T11:05:17.615Z"
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
    body: "Start: inspect pinned UITest module roots, link physical Python paths to constructors, and generate provenance-only evidence within the approved scope."
events:
  -
    type: "status"
    at: "2026-08-10T11:05:22.870Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspect pinned UITest module roots, link physical Python paths to constructors, and generate provenance-only evidence within the approved scope."
doc_version: 3
doc_updated_at: "2026-08-10T11:05:22.870Z"
doc_updated_by: "CODER"
description: "Parse pinned gb_UITest_add_modules declarations, link declared module directories to existing UITest constructors, and enumerate their Git-tracked Python files as provenance-only atomic source records."
sections:
  Summary: |-
    Extract pinned LibreOffice UITest Python source targets into atomic records

    Parse pinned gb_UITest_add_modules declarations, link declared module directories to existing UITest constructors, and enumerate their Git-tracked Python files as provenance-only atomic source records.
  Scope: |-
    - In scope: deterministic provenance-only parsing of pinned UITest add-modules declarations; exact source-root-relative module-directory validation; linkage to existing UITest constructor IDs; enumeration of Git-tracked Python files beneath each declared module root; canonical JSON, documentation, and tests.
    - Out of scope: copying upstream Python source, evaluating arbitrary Make expressions, recursive fixture or assertion parsing, modifying prior inventories, implementation of LibreOffice UI behavior, or claiming parity.
  Plan: "1. Validate the exact gb_UITest_add_modules declaration form and restrict parsing to literal SRCDIR-relative module directories. 2. Link each declaration to an existing UITest constructor by makefile path and test name. 3. Enumerate only Git-tracked .py files under each declared directory, preserving module-root provenance and guarding observed counts. 4. Add strict parser, linkage, and production CLI tests at 100% inventory coverage; generate canonical JSON and program documentation. 5. Prove byte-identical regeneration and run full repository verification before independent review and closure."
  Verify Steps: |-
    1. Run strict TypeScript, lint, JSDoc, and file-size checks.
    2. Run inventory tests and require 100% statement, branch, function, and line coverage.
    3. Prove byte-identical regeneration of the canonical UITest Python source inventory.
    4. Check that every record has existing UITest constructor provenance and an exact Git-tracked pinned .py path below its declared module root.
    5. Run npm run verify, agentplane doctor, and policy routing.
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

Extract pinned LibreOffice UITest Python source targets into atomic records

Parse pinned gb_UITest_add_modules declarations, link declared module directories to existing UITest constructors, and enumerate their Git-tracked Python files as provenance-only atomic source records.

## Scope

- In scope: deterministic provenance-only parsing of pinned UITest add-modules declarations; exact source-root-relative module-directory validation; linkage to existing UITest constructor IDs; enumeration of Git-tracked Python files beneath each declared module root; canonical JSON, documentation, and tests.
- Out of scope: copying upstream Python source, evaluating arbitrary Make expressions, recursive fixture or assertion parsing, modifying prior inventories, implementation of LibreOffice UI behavior, or claiming parity.

## Plan

1. Validate the exact gb_UITest_add_modules declaration form and restrict parsing to literal SRCDIR-relative module directories. 2. Link each declaration to an existing UITest constructor by makefile path and test name. 3. Enumerate only Git-tracked .py files under each declared directory, preserving module-root provenance and guarding observed counts. 4. Add strict parser, linkage, and production CLI tests at 100% inventory coverage; generate canonical JSON and program documentation. 5. Prove byte-identical regeneration and run full repository verification before independent review and closure.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and file-size checks.
2. Run inventory tests and require 100% statement, branch, function, and line coverage.
3. Prove byte-identical regeneration of the canonical UITest Python source inventory.
4. Check that every record has existing UITest constructor provenance and an exact Git-tracked pinned .py path below its declared module root.
5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
