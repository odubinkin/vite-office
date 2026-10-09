---
id: "202610090749-C6C6AB"
title: "Implement Calc reference address and immutable sheet limits"
result_summary: "Implemented native Calc reference-address values and explicit immutable sheet limits"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:49:29.489Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T07:55:35.702Z"
  updated_by: "CODER"
  note: "Commands: npm run test:coverage:calc, npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size, affected ESLint/Prettier, scoped registry check, source-tree check, routing, ap doctor, git diff --check. Result: all pass. Evidence: 20 tests in6 files; actual100 lines263/263 statements297/297 functions81/81 branches229/229; registry4 capabilities116 scoped modules0 semantic violations; pinned address.hxx/sheetlimits.hxx/documen2.cxx exactly match Git blobs. Scope: initialized ScRefAddress and explicit ScSheetLimits owners, source-derived tests, Calc-owned inventory and docs. Shared/Writer unchanged, flags remain unverified; doctor only2 pre-existing warnings. Full suite due at Calc10."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T07:55:55.362Z"
  updated_by: "EVALUATOR"
  note: "Native initialized ScRefAddress and explicit immutable ScSheetLimits are implemented at original header boundaries using existing coordinate ownership/helpers."
  evaluated_sha: "0a411113750da8bbb14b1e3e014b6fe538d8f676"
  blueprint_digest: "74f873340168a33435c4289ff9746cdb7be619490280bb999dd099f0b7d1b102"
  evidence_refs:
    - ".agentplane/tasks/202610090749-C6C6AB/README.md"
    - ".agentplane/tasks/202610090749-C6C6AB/quality/20261009-075555362-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090749-C6C6AB/quality/20261009-075555362-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090749-C6C6AB/quality/20261009-075555362-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090749-C6C6AB/blueprint/resolved-snapshot.json"
    - "npm run test:coverage:calc"
    - "output/playwright/calc-registry4.json"
    - "npm run typecheck"
    - "npm run check:dependencies"
    - "node .agentplane/policy/check-routing.mjs"
    - "ap doctor"
  findings:
    - "Defaults, signed widths, independent flags, all64 flag equality pairs, copying, stable assignment, both Set overloads, global sheet checks and standard/jumbo/custom bounds pass. Dependency-owned formatting/default factory remain explicitly unimplemented without stubs; native parity statuses unchanged."
commit:
  hash: "0a411113750da8bbb14b1e3e014b6fe538d8f676"
  message: "✨ C6C6AB calc: port native reference address and sheet limits"
comments:
  -
    author: "CODER"
    body: "Start: implement original reference address and sheet-limit header owners, reusing numerical helpers and documenting actual dependency gaps."
  -
    author: "CODER"
    body: "Verified: native reference-address and explicit immutable sheet-limit owners pass all20 Calc tests with actual100 coverage, static checks and Calc inventory validation without parity promotion."
events:
  -
    type: "status"
    at: "2026-10-09T07:49:36.697Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original reference address and sheet-limit header owners, reusing numerical helpers and documenting actual dependency gaps."
  -
    type: "verify"
    at: "2026-10-09T07:55:35.702Z"
    author: "CODER"
    state: "ok"
    note: "Commands: npm run test:coverage:calc, npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size, affected ESLint/Prettier, scoped registry check, source-tree check, routing, ap doctor, git diff --check. Result: all pass. Evidence: 20 tests in6 files; actual100 lines263/263 statements297/297 functions81/81 branches229/229; registry4 capabilities116 scoped modules0 semantic violations; pinned address.hxx/sheetlimits.hxx/documen2.cxx exactly match Git blobs. Scope: initialized ScRefAddress and explicit ScSheetLimits owners, source-derived tests, Calc-owned inventory and docs. Shared/Writer unchanged, flags remain unverified; doctor only2 pre-existing warnings. Full suite due at Calc10."
  -
    type: "status"
    at: "2026-10-09T07:56:05.409Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native reference-address and explicit immutable sheet-limit owners pass all20 Calc tests with actual100 coverage, static checks and Calc inventory validation without parity promotion."
doc_version: 3
doc_updated_at: "2026-10-09T07:56:05.411Z"
doc_updated_by: "CODER"
description: "Port the initialized header contracts of ScRefAddress and ScSheetLimits from pinned local LibreOffice, reuse existing address checks and owners, and register source/test provenance. Keep configuration-dependent CreateDefault and GetRefString for their actual ScModule/formatting dependencies without stubs."
sections:
  Summary: "Implement native initialized reference address ownership and immutable sheet limit contracts as prerequisites for Calc formula references."
  Scope: "sc/inc/address.ts ScRefAddress; new sc/inc/sheetlimits.ts; reference-address and sheetlimits tests; two new Calc capabilities; existing address runtime/provenance; new sheetlimits runtime/provenance; calc-core and registry README descriptions. Preserve shared/Writer sources and records. Exactly this checkout on calc, no merges. This is Calc milestone4; full suite due after milestone10."
  Plan: "Implement native reference-address default/numeric/copy constructors, stable-owner assignment, both Set overloads, independent flags, getters and equality. Implement explicit immutable native sheet limits with original widths, validity and sanitize delegation, counts and max-column string. Reuse existing ScAddress and helpers. Test ownership, signed widths, all flag combinations and each bounded validity axis for standard/jumbo/custom limits. Record exact local/upstream evidence and omissions without parity promotion. Validate actual100 Calc coverage, typecheck, boundaries, JSDoc, size, affected lint/format, scoped registry, routing and doctor. Leave CreateDefault and GetRefString absent until real native dependencies exist, no replacement factory or stub. Existing user goal authorizes this core progression."
  Verify Steps: "Run npm run test:coverage:calc and require actual100 lines/statements/functions/branches; retain all existing tests. Run npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size; affected ESLint and Prettier; Calc scoped registry gate with zero semantic violations. Verify source markers against pinned local headers and factory dependency, no shared duplication. Run node .agentplane/policy/check-routing.mjs and ap doctor. Run git diff --check and final git status --short --untracked-files=all; branch must be calc. Full suite intentionally scheduled at Calc task10."
  Verification: |-
    Pending implementation and scoped acceptance checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T07:55:35.702Z — VERIFY — ok

    By: CODER

    Note: Commands: npm run test:coverage:calc, npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size, affected ESLint/Prettier, scoped registry check, source-tree check, routing, ap doctor, git diff --check. Result: all pass. Evidence: 20 tests in6 files; actual100 lines263/263 statements297/297 functions81/81 branches229/229; registry4 capabilities116 scoped modules0 semantic violations; pinned address.hxx/sheetlimits.hxx/documen2.cxx exactly match Git blobs. Scope: initialized ScRefAddress and explicit ScSheetLimits owners, source-derived tests, Calc-owned inventory and docs. Shared/Writer unchanged, flags remain unverified; doctor only2 pre-existing warnings. Full suite due at Calc10.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:52:59.677Z, excerpt_hash=sha256:d9807e48ca2cdb02602ead613cd8b836ae2fbf1f45aa7404f3acae5f27d348eb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090749-C6C6AB/blueprint/resolved-snapshot.json
    - old_digest: 74f873340168a33435c4289ff9746cdb7be619490280bb999dd099f0b7d1b102
    - current_digest: 74f873340168a33435c4289ff9746cdb7be619490280bb999dd099f0b7d1b102
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090749-C6C6AB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090749-C6C6AB
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit; keep earlier numerical coordinates and sticky movements intact."
  Findings: |-
    ScSheetLimits owns only max row/column and delegates native header helpers; its native SimpleReferenceObject lifetime is represented by JavaScript object ownership, not a second reference-count implementation. CreateDefault in documen2.cxx depends on compile feature and ScModule defaults; configuration owner is not yet ported. ScRefAddress formatting depends on future address convention/document ownership. No default factory or formatter fallback will be invented.

    - Observation: Initial typecheck found unchecked array indexing in new test data tuples; all runtime cases and actual100 Calc coverage already pass.
      Impact: Test fixtures need tuple typing to satisfy the existing strict TypeScript contract; production implementation has no reported type errors.
      Resolution: Use literal readonly tuples for the test tables and rerun typecheck; scope and verification criteria remain unchanged.
extensions:
  implementation_commit:
    hash: "0a411113750da8bbb14b1e3e014b6fe538d8f676"
    message: "✨ C6C6AB calc: port native reference address and sheet limits"
id_source: "generated"
---
## Summary

Implement native initialized reference address ownership and immutable sheet limit contracts as prerequisites for Calc formula references.

## Scope

sc/inc/address.ts ScRefAddress; new sc/inc/sheetlimits.ts; reference-address and sheetlimits tests; two new Calc capabilities; existing address runtime/provenance; new sheetlimits runtime/provenance; calc-core and registry README descriptions. Preserve shared/Writer sources and records. Exactly this checkout on calc, no merges. This is Calc milestone4; full suite due after milestone10.

## Plan

Implement native reference-address default/numeric/copy constructors, stable-owner assignment, both Set overloads, independent flags, getters and equality. Implement explicit immutable native sheet limits with original widths, validity and sanitize delegation, counts and max-column string. Reuse existing ScAddress and helpers. Test ownership, signed widths, all flag combinations and each bounded validity axis for standard/jumbo/custom limits. Record exact local/upstream evidence and omissions without parity promotion. Validate actual100 Calc coverage, typecheck, boundaries, JSDoc, size, affected lint/format, scoped registry, routing and doctor. Leave CreateDefault and GetRefString absent until real native dependencies exist, no replacement factory or stub. Existing user goal authorizes this core progression.

## Verify Steps

Run npm run test:coverage:calc and require actual100 lines/statements/functions/branches; retain all existing tests. Run npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size; affected ESLint and Prettier; Calc scoped registry gate with zero semantic violations. Verify source markers against pinned local headers and factory dependency, no shared duplication. Run node .agentplane/policy/check-routing.mjs and ap doctor. Run git diff --check and final git status --short --untracked-files=all; branch must be calc. Full suite intentionally scheduled at Calc task10.

## Verification

Pending implementation and scoped acceptance checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T07:55:35.702Z — VERIFY — ok

By: CODER

Note: Commands: npm run test:coverage:calc, npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size, affected ESLint/Prettier, scoped registry check, source-tree check, routing, ap doctor, git diff --check. Result: all pass. Evidence: 20 tests in6 files; actual100 lines263/263 statements297/297 functions81/81 branches229/229; registry4 capabilities116 scoped modules0 semantic violations; pinned address.hxx/sheetlimits.hxx/documen2.cxx exactly match Git blobs. Scope: initialized ScRefAddress and explicit ScSheetLimits owners, source-derived tests, Calc-owned inventory and docs. Shared/Writer unchanged, flags remain unverified; doctor only2 pre-existing warnings. Full suite due at Calc10.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:52:59.677Z, excerpt_hash=sha256:d9807e48ca2cdb02602ead613cd8b836ae2fbf1f45aa7404f3acae5f27d348eb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090749-C6C6AB/blueprint/resolved-snapshot.json
- old_digest: 74f873340168a33435c4289ff9746cdb7be619490280bb999dd099f0b7d1b102
- current_digest: 74f873340168a33435c4289ff9746cdb7be619490280bb999dd099f0b7d1b102
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090749-C6C6AB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090749-C6C6AB
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit; keep earlier numerical coordinates and sticky movements intact.

## Findings

ScSheetLimits owns only max row/column and delegates native header helpers; its native SimpleReferenceObject lifetime is represented by JavaScript object ownership, not a second reference-count implementation. CreateDefault in documen2.cxx depends on compile feature and ScModule defaults; configuration owner is not yet ported. ScRefAddress formatting depends on future address convention/document ownership. No default factory or formatter fallback will be invented.

- Observation: Initial typecheck found unchecked array indexing in new test data tuples; all runtime cases and actual100 Calc coverage already pass.
  Impact: Test fixtures need tuple typing to satisfy the existing strict TypeScript contract; production implementation has no reported type errors.
  Resolution: Use literal readonly tuples for the test tables and rerun typecheck; scope and verification criteria remain unchanged.
