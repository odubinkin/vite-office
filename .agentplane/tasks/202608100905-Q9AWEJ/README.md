---
id: "202608100905-Q9AWEJ"
title: "Inventory pinned LibreOffice test declarations into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202608100853-D91P3V"
tags:
  - "inventory"
  - "libreoffice"
  - "tests"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:05:36.122Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
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
    body: "Start: extract all pinned upstream test declarations into deterministic provenance-complete unmapped inventory records."
events:
  -
    type: "status"
    at: "2026-08-10T09:05:36.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract all pinned upstream test declarations into deterministic provenance-complete unmapped inventory records."
doc_version: 3
doc_updated_at: "2026-08-10T09:05:36.534Z"
doc_updated_by: "CODER"
description: "Extend deterministic inventory tooling to extract every pinned LibreOffice CppunitTest, JunitTest, PythonTest, and UITest declaration into canonical provenance-complete unmapped records, with exact category counts and no parity overclaim."
sections:
  Summary: |-
    Inventory pinned LibreOffice test declarations into atomic records

    Extend deterministic inventory tooling to extract every pinned LibreOffice CppunitTest, JunitTest, PythonTest, and UITest declaration into canonical provenance-complete unmapped records, with exact category counts and no parity overclaim.
  Scope: |-
    In scope:
    - Extract all pinned core CppunitTest, JunitTest, PythonTest, and UITest declarations into deterministic JSON records with exact declaration path, test name, category, core commit, and unmapped status.
    - Enforce exact category counts and add full JSDoc, strict TypeScript, and 100% coverage for new inventory code.
    - Document the generated test inventory and its handoff to atomic parity mapping.

    Out of scope:
    - Running, porting, or mapping every upstream test assertion; later bounded tasks use these records.
    - Copying upstream test source or fixtures, altering the browser app, or claiming test parity.
  Plan: |-
    1. Inspect the pinned test declaration syntax and freeze exact discovery/count contracts.
    2. Implement a read-only parser and canonical test-record generator with complete unit coverage.
    3. Generate exact core records, document provenance/unmapped handoff, and verify deterministic output.
    4. Run full quality gates, record evidence and evaluator review, then close.
  Verify Steps: |-
    1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — strict tooling, JSDoc, linting, and size policy pass.
    2. npm run test:inventory:coverage — all executable inventory code reaches 100% statement, branch, function, and line coverage.
    3. Regenerate canonical test records from the pinned core checkout and require exact counts of 669 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest declarations.
    4. Validate byte-stable output, unique provenance-complete unmapped records, exact correspondence to live pinned declaration paths, and no copied upstream source text.
    5. npm run verify — full project suite remains green.
    6. Resolve documentation links; require git diff --check and no tracked vendor/libreoffice-reference content or parity completion claim.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task’s test extractor, tests, generated inventory, command wiring, and documentation. Do not alter or delete the ignored pinned reference checkout. Re-run baseline validation and project verification after rollback."
  Findings: ""
id_source: "generated"
---
## Summary

Inventory pinned LibreOffice test declarations into atomic records

Extend deterministic inventory tooling to extract every pinned LibreOffice CppunitTest, JunitTest, PythonTest, and UITest declaration into canonical provenance-complete unmapped records, with exact category counts and no parity overclaim.

## Scope

In scope:
- Extract all pinned core CppunitTest, JunitTest, PythonTest, and UITest declarations into deterministic JSON records with exact declaration path, test name, category, core commit, and unmapped status.
- Enforce exact category counts and add full JSDoc, strict TypeScript, and 100% coverage for new inventory code.
- Document the generated test inventory and its handoff to atomic parity mapping.

Out of scope:
- Running, porting, or mapping every upstream test assertion; later bounded tasks use these records.
- Copying upstream test source or fixtures, altering the browser app, or claiming test parity.

## Plan

1. Inspect the pinned test declaration syntax and freeze exact discovery/count contracts.
2. Implement a read-only parser and canonical test-record generator with complete unit coverage.
3. Generate exact core records, document provenance/unmapped handoff, and verify deterministic output.
4. Run full quality gates, record evidence and evaluator review, then close.

## Verify Steps

1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — strict tooling, JSDoc, linting, and size policy pass.
2. npm run test:inventory:coverage — all executable inventory code reaches 100% statement, branch, function, and line coverage.
3. Regenerate canonical test records from the pinned core checkout and require exact counts of 669 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest declarations.
4. Validate byte-stable output, unique provenance-complete unmapped records, exact correspondence to live pinned declaration paths, and no copied upstream source text.
5. npm run verify — full project suite remains green.
6. Resolve documentation links; require git diff --check and no tracked vendor/libreoffice-reference content or parity completion claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task’s test extractor, tests, generated inventory, command wiring, and documentation. Do not alter or delete the ignored pinned reference checkout. Re-run baseline validation and project verification after rollback.

## Findings
