---
id: "202609150939-KAZPAN"
title: "Phase 0.2 semantic provenance and boundary enforcement"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run check:dependencies"
  - "npm run check:source-provenance"
  - "npm run inventory:parity"
  - "npm run test:inventory:coverage"
  - "npm run test:source-provenance"
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T09:40:35.235Z"
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
    body: "Start: implement semantic provenance, API shape, source responsibility, and browser/core boundary enforcement for Phase 0.2."
events:
  -
    type: "status"
    at: "2026-09-15T09:50:30.866Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement semantic provenance, API shape, source responsibility, and browser/core boundary enforcement for Phase 0.2."
doc_version: 3
doc_updated_at: "2026-09-15T09:50:30.866Z"
doc_updated_by: "CODER"
description: "Extend runtime inventory semantics and add AST/API, source-responsibility, and browser/core boundary checks required by Phase 0."
sections:
  Summary: "Implement P0.2: make semantic provenance, API shape, source responsibility, and browser/core boundaries enforceable."
  Scope: "In scope: runtime inventory schema/data, parity validator, source-provenance and module-boundary checks, AST/API analysis, fixtures/tests for all acceptance examples named in P0.2. Out of scope: fixing the architectural divergences themselves beyond checks required by Phase 0."
  Plan: |-
    1. Extend runtime inventory records with upstream/local symbols and contract, behavior, default, divergence, justification, and evidence fields.
    2. Add semantic validation for inheritance/exported API shape and source-unit responsibility.
    3. Enforce browser/React/DOM/global boundaries for upstream core paths.
    4. Add negative fixtures covering SwDoc inheritance, React uiview, DOM transfer, custom command IDs, and placeholder listsh.
    5. Run focused and repository boundary/provenance checks.
  Verify Steps: |-
    1. Run focused parity-mapping tests; expect missing semantic fields, unjustified B records, and invalid placeholders/adapters to fail.
    2. Run focused source-provenance and boundary tests; expect all five Phase 0 acceptance examples to be detected.
    3. Run npm run test:inventory:coverage.
    4. Run npm run test:source-provenance.
    5. Run npm run check:dependencies.
    6. Run npm run check:source-provenance.
    7. Run npm run inventory:parity.
  Verification: "Pending execution."
  Rollback Plan: "Revert the task commit to restore the previous inventory schema and validation rules; generated inventory remains reproducible from the prior schema."
  Findings: "None yet."
id_source: "generated"
---
## Summary

Implement P0.2: make semantic provenance, API shape, source responsibility, and browser/core boundaries enforceable.

## Scope

In scope: runtime inventory schema/data, parity validator, source-provenance and module-boundary checks, AST/API analysis, fixtures/tests for all acceptance examples named in P0.2. Out of scope: fixing the architectural divergences themselves beyond checks required by Phase 0.

## Plan

1. Extend runtime inventory records with upstream/local symbols and contract, behavior, default, divergence, justification, and evidence fields.
2. Add semantic validation for inheritance/exported API shape and source-unit responsibility.
3. Enforce browser/React/DOM/global boundaries for upstream core paths.
4. Add negative fixtures covering SwDoc inheritance, React uiview, DOM transfer, custom command IDs, and placeholder listsh.
5. Run focused and repository boundary/provenance checks.

## Verify Steps

1. Run focused parity-mapping tests; expect missing semantic fields, unjustified B records, and invalid placeholders/adapters to fail.
2. Run focused source-provenance and boundary tests; expect all five Phase 0 acceptance examples to be detected.
3. Run npm run test:inventory:coverage.
4. Run npm run test:source-provenance.
5. Run npm run check:dependencies.
6. Run npm run check:source-provenance.
7. Run npm run inventory:parity.

## Verification

Pending execution.

## Rollback Plan

Revert the task commit to restore the previous inventory schema and validation rules; generated inventory remains reproducible from the prior schema.

## Findings

None yet.
