---
id: "202608100905-Q9AWEJ"
title: "Inventory pinned LibreOffice test declarations into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
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
  state: "ok"
  updated_at: "2026-08-10T09:18:15.000Z"
  updated_by: "CODER"
  note: "Verified exact deterministic 565-record pinned core test inventory, 100% inventory coverage, and full project verification."
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
  -
    type: "verify"
    at: "2026-08-10T09:18:15.000Z"
    author: "CODER"
    state: "ok"
    note: "Verified exact deterministic 565-record pinned core test inventory, 100% inventory coverage, and full project verification."
doc_version: 3
doc_updated_at: "2026-08-10T09:18:15.110Z"
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
    3. Regenerate canonical test records from the pinned core checkout and require exact constructor-invocation counts of 415 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest records.
    4. Validate byte-stable output, unique provenance-complete unmapped records, exact correspondence to live pinned gb_<kind>_<kind>(<name>) invocations (excluding gbuild macro definitions), and no copied upstream source text.
    5. npm run verify — full project suite remains green.
    6. Resolve documentation links; require git diff --check and no tracked vendor/libreoffice-reference content or parity completion claim.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T09:18:15.000Z — VERIFY — ok

    By: CODER

    Note: Verified exact deterministic 565-record pinned core test inventory, 100% inventory coverage, and full project verification.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:10:36.916Z, excerpt_hash=sha256:3450be511ae3e361bcea7d39e35e0162b30e2c592aa5c61fb2fd273f9eb49c40

    Details:

    Command: npm run verify
    Result: pass
    Evidence: formatting, lint, both type checks, app coverage 100%, inventory coverage 100% (272 statements, 149 branches, 74 functions, 269 lines), E2E, static build, JSDoc, and size checks passed.
    Scope: full repository suite.

    Command: npm run --silent inventory:tests -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-tests.json (twice)
    Result: pass
    Evidence: byte-identical JSON; 565 unique records and exact Cppunit=415, Junit=58, Python=13, UITest=79 summaries; each record carries core commit and unmapped status.
    Scope: pinned core gbuild test constructor declarations.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100905-Q9AWEJ/blueprint/resolved-snapshot.json
    - old_digest: 089cc1ed84bdf46026787f9bb61ec01463838e843c80210a38d91b2c05532881
    - current_digest: 089cc1ed84bdf46026787f9bb61ec01463838e843c80210a38d91b2c05532881
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100905-Q9AWEJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100905-Q9AWEJ
    - diagnostic_command: agentplane task run status 202608100905-Q9AWEJ
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task’s test extractor, tests, generated inventory, command wiring, and documentation. Do not alter or delete the ignored pinned reference checkout. Re-run baseline validation and project verification after rollback."
  Findings: |-
    - Observation: The prior coarse counts (669/58/13/79) did not measure the four actual gb_<kind>_<kind> constructor forms. Live pinned Git grep finds 423 CppunitTest, 65 JunitTest, 15 PythonTest, and 81 UITest constructor invocations.
      Impact: Using coarse token counts would create phantom or missing upstream test records and undermine the required test-parity inventory.
      Resolution: This task inventories the exact constructor declarations and pins their live counts in its verification contract. Any additional test-like macro family requires a separately documented extractor.

    - Observation: Raw Git grep also matched four solenv/gbuild macro definitions. Exact constructor invocations require a comma after gb_<kind>_<kind>; live pinned counts are 415 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest.
      Impact: Including macro definitions would create four non-test records; prior raw counts were unsuitable as declaration inventory floors.
      Resolution: Parser filters only constructor invocations with argument separators, and verification uses exact live invocation counts.
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
3. Regenerate canonical test records from the pinned core checkout and require exact constructor-invocation counts of 415 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest records.
4. Validate byte-stable output, unique provenance-complete unmapped records, exact correspondence to live pinned gb_<kind>_<kind>(<name>) invocations (excluding gbuild macro definitions), and no copied upstream source text.
5. npm run verify — full project suite remains green.
6. Resolve documentation links; require git diff --check and no tracked vendor/libreoffice-reference content or parity completion claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T09:18:15.000Z — VERIFY — ok

By: CODER

Note: Verified exact deterministic 565-record pinned core test inventory, 100% inventory coverage, and full project verification.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:10:36.916Z, excerpt_hash=sha256:3450be511ae3e361bcea7d39e35e0162b30e2c592aa5c61fb2fd273f9eb49c40

Details:

Command: npm run verify
Result: pass
Evidence: formatting, lint, both type checks, app coverage 100%, inventory coverage 100% (272 statements, 149 branches, 74 functions, 269 lines), E2E, static build, JSDoc, and size checks passed.
Scope: full repository suite.

Command: npm run --silent inventory:tests -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-tests.json (twice)
Result: pass
Evidence: byte-identical JSON; 565 unique records and exact Cppunit=415, Junit=58, Python=13, UITest=79 summaries; each record carries core commit and unmapped status.
Scope: pinned core gbuild test constructor declarations.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100905-Q9AWEJ/blueprint/resolved-snapshot.json
- old_digest: 089cc1ed84bdf46026787f9bb61ec01463838e843c80210a38d91b2c05532881
- current_digest: 089cc1ed84bdf46026787f9bb61ec01463838e843c80210a38d91b2c05532881
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100905-Q9AWEJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100905-Q9AWEJ
- diagnostic_command: agentplane task run status 202608100905-Q9AWEJ
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task’s test extractor, tests, generated inventory, command wiring, and documentation. Do not alter or delete the ignored pinned reference checkout. Re-run baseline validation and project verification after rollback.

## Findings

- Observation: The prior coarse counts (669/58/13/79) did not measure the four actual gb_<kind>_<kind> constructor forms. Live pinned Git grep finds 423 CppunitTest, 65 JunitTest, 15 PythonTest, and 81 UITest constructor invocations.
  Impact: Using coarse token counts would create phantom or missing upstream test records and undermine the required test-parity inventory.
  Resolution: This task inventories the exact constructor declarations and pins their live counts in its verification contract. Any additional test-like macro family requires a separately documented extractor.

- Observation: Raw Git grep also matched four solenv/gbuild macro definitions. Exact constructor invocations require a comma after gb_<kind>_<kind>; live pinned counts are 415 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest.
  Impact: Including macro definitions would create four non-test records; prior raw counts were unsuitable as declaration inventory floors.
  Resolution: Parser filters only constructor invocations with argument separators, and verification uses exact live invocation counts.
