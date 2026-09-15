---
id: "202609150939-KAZPAN"
title: "Phase 0.2 semantic provenance and boundary enforcement"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
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
  state: "ok"
  updated_at: "2026-09-15T10:05:09.150Z"
  updated_by: "CODER"
  note: "P0.2 semantic provenance schema, exact AST/API violation set, boundary detection, 100% inventory coverage, source provenance, dependency, and parity checks pass."
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
  -
    type: "verify"
    at: "2026-09-15T10:05:09.150Z"
    author: "CODER"
    state: "ok"
    note: "P0.2 semantic provenance schema, exact AST/API violation set, boundary detection, 100% inventory coverage, source provenance, dependency, and parity checks pass."
doc_version: 3
doc_updated_at: "2026-09-15T10:05:09.224Z"
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
  Verification: |-
    Command: focused runtime/parity tests. Result: pass. Evidence: 8 focused tests cover strict schema and all five Phase 0 defects. Scope: AST/API, source responsibility, semantic status, browser/core boundaries.

    Command: npm run test:inventory:coverage. Result: pass. Evidence: 33 files, 88 tests, 100% statements/branches/functions/lines. Scope: all inventory tooling.

    Command: npm run test:source-provenance. Result: pass. Evidence: 3 tests passed. Scope: exact path, symbol, responsibility, and evidence validation.

    Command: npm run check:dependencies. Result: pass. Evidence: 112 runtime sources and 380 imports checked. Scope: module dependency boundaries.

    Command: npm run check:source-provenance. Result: pass. Evidence: 112 modules validated. Scope: exhaustive runtime provenance.

    Command: npm run inventory:parity. Result: pass. Evidence: runtime schema v3 records 13 exact current semantic violations. Scope: capability/runtime semantic inventory.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T10:05:09.150Z — VERIFY — ok

    By: CODER

    Note: P0.2 semantic provenance schema, exact AST/API violation set, boundary detection, 100% inventory coverage, source provenance, dependency, and parity checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T10:05:08.208Z, excerpt_hash=sha256:2789e3785549d11e6668957a51129e39152305d29bddd3b4bdd3fd8414a1e8ca

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150939-KAZPAN/blueprint/resolved-snapshot.json
    - old_digest: 4261233a16cdc8c159bdf8fe19453d47279906b08edb76168e31376dd1acb5d2
    - current_digest: 4261233a16cdc8c159bdf8fe19453d47279906b08edb76168e31376dd1acb5d2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150939-KAZPAN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150939-KAZPAN
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
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

Command: focused runtime/parity tests. Result: pass. Evidence: 8 focused tests cover strict schema and all five Phase 0 defects. Scope: AST/API, source responsibility, semantic status, browser/core boundaries.

Command: npm run test:inventory:coverage. Result: pass. Evidence: 33 files, 88 tests, 100% statements/branches/functions/lines. Scope: all inventory tooling.

Command: npm run test:source-provenance. Result: pass. Evidence: 3 tests passed. Scope: exact path, symbol, responsibility, and evidence validation.

Command: npm run check:dependencies. Result: pass. Evidence: 112 runtime sources and 380 imports checked. Scope: module dependency boundaries.

Command: npm run check:source-provenance. Result: pass. Evidence: 112 modules validated. Scope: exhaustive runtime provenance.

Command: npm run inventory:parity. Result: pass. Evidence: runtime schema v3 records 13 exact current semantic violations. Scope: capability/runtime semantic inventory.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T10:05:09.150Z — VERIFY — ok

By: CODER

Note: P0.2 semantic provenance schema, exact AST/API violation set, boundary detection, 100% inventory coverage, source provenance, dependency, and parity checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T10:05:08.208Z, excerpt_hash=sha256:2789e3785549d11e6668957a51129e39152305d29bddd3b4bdd3fd8414a1e8ca

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150939-KAZPAN/blueprint/resolved-snapshot.json
- old_digest: 4261233a16cdc8c159bdf8fe19453d47279906b08edb76168e31376dd1acb5d2
- current_digest: 4261233a16cdc8c159bdf8fe19453d47279906b08edb76168e31376dd1acb5d2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150939-KAZPAN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150939-KAZPAN
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit to restore the previous inventory schema and validation rules; generated inventory remains reproducible from the prior schema.

## Findings

None yet.
