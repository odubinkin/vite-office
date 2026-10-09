---
id: "202610090711-S6VCEJ"
title: "Calc core coordinate and range foundation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run inventory:parity:calc"
  - "npm run test:coverage:calc"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:12:34.386Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T07:24:36.219Z"
  updated_by: "CODER"
  note: "Calc numerical foundation passes 9 cases and actual all-four 100% coverage (147 lines,155 statements,46 functions,122 branches), typecheck, module boundaries, scoped registry, lint/format, docs/size, routing and doctor. Full suite deferred to Calc task10 per explicit user cadence; semantic native API parity remains unverified."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved pinned Calc coordinate and range foundation with isolated Calc tests, shared-module reuse and exact source evidence on branch calc."
events:
  -
    type: "status"
    at: "2026-10-09T07:12:38.540Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved pinned Calc coordinate and range foundation with isolated Calc tests, shared-module reuse and exact source evidence on branch calc."
  -
    type: "verify"
    at: "2026-10-09T07:24:36.219Z"
    author: "CODER"
    state: "ok"
    note: "Calc numerical foundation passes 9 cases and actual all-four 100% coverage (147 lines,155 statements,46 functions,122 branches), typecheck, module boundaries, scoped registry, lint/format, docs/size, routing and doctor. Full suite deferred to Calc task10 per explicit user cadence; semantic native API parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-09T07:24:36.389Z"
doc_updated_by: "CODER"
description: "Begin approved Calc implementation on branch calc in this checkout. Reimplement pinned LibreOffice coordinate types, address and range contracts with original defaults, shared-module reuse, source provenance and independent Calc coverage. First of ten Calc tasks before a full-suite run; no branch integration."
sections:
  Summary: |-
    Calc core coordinate and range foundation

    Begin approved Calc implementation on branch calc in this checkout. Reimplement pinned LibreOffice coordinate types, address and range contracts with original defaults, shared-module reuse, source provenance and independent Calc coverage. First of ten Calc tasks before a full-suite run; no branch integration.
  Scope: "Calc foundation only: sc/inc/types.ts, sc/inc/address.ts, sc/source/core/tool/address.ts, colocated Calc tests, Calc-owned runtime/provenance/capability records and docs/program/calc-core.md. Cache selected pinned source files under ignored vendor/libreoffice-reference. No Writer production changes, UI activation, merges, recovery, or dependency version changes."
  Plan: "Implement independent TypeScript coordinate types, ScAddress and ScRange numerical contracts from exact pinned source, preserving native defaults and separate header/tool ownership; add exhaustive branch tests and Calc-owned provenance records. Use existing shared architecture without duplication. Validate Calc all-four 100% coverage, relevant static and registry checks; commit only task scope on calc. User instruction to begin implementation supplies approval; network permission received separately. This first task deliberately leaves parsing, formatting, document/formula ownership and browser activation for subsequent executable tasks."
  Verify Steps: "Run npm run test:coverage:calc: all four V8 coverage metrics must be 100% without exclusions or counter manipulation. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, targeted ESLint/Prettier for authored files, ap doctor and node .agentplane/policy/check-routing.mjs. Test native coordinate bounds, zero/invalid defaults, address comparison/movement, range ordering/containment/intersection/extension and reference flags. This is Calc task 1/10; per user approval defer full suite to task 10. Record genuine upstream-source limits."
  Verification: |-
    Command: npm run test:coverage:calc. Result: pass; 9 acceptance cases in 2 files; real V8 147/147 lines, 155/155 statements, 46/46 functions, 122/122 branches, all four 100%. Scope: all current sc production sources. Command: npm run typecheck; npm run check:dependencies; targeted ESLint and Prettier; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Registry: 3 Calc modules plus 112 existing shared modules, zero semantic violations; implemented capability explicitly remains semantically unverified. Doctor retains 2 unrelated historical warnings with zero errors. Skipped: full suite. Reason: Calc task 1/10 under user instruction; next full suite due after Calc task 10. Risk: unrelated Writer regressions not globally rechecked; no Writer/shared runtime files changed. Approval: explicit user testing cadence.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T07:24:36.219Z — VERIFY — ok

    By: CODER

    Note: Calc numerical foundation passes 9 cases and actual all-four 100% coverage (147 lines,155 statements,46 functions,122 branches), typecheck, module boundaries, scoped registry, lint/format, docs/size, routing and doctor. Full suite deferred to Calc task10 per explicit user cadence; semantic native API parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:24:33.510Z, excerpt_hash=sha256:85ef2d0760f54c54833a98a677cdcbf7703e278f25a2cd491d2cb844427b9a62

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090711-S6VCEJ/blueprint/resolved-snapshot.json
    - old_digest: 783d40424197829c1b899f92dd0a759d4e42d12f5f144d258a0045b06b341bab
    - current_digest: 783d40424197829c1b899f92dd0a759d4e42d12f5f144d258a0045b06b341bab
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090711-S6VCEJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090711-S6VCEJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit and its Calc foundation files; keep prior Writer/shared changes and other task records intact. No branch merge or history rewriting."
  Findings: "Pinned reference verified locally at exact baseline commit through an ignored symlink to the user-authorized vite-office checkout. npm ci installed locked versions inside this checkout using a repo-local ignored npm cache; package-lock unchanged. A root gitignore entry now excludes the symlink itself because the existing directory-only entry did not. No shared runtime duplication or changes. Source headers reviewed for MPL2/Apache inherited notices; TypeScript independently authored from numerical contracts. JS output tuples/operator methods and relocated header-inline class definitions are declared adaptations; native uninitialized constructors/assertions/hashing/parser/format/external/sticky/subtraction remain unrepresented. Coverage is executable completeness only, never a whole-native parity claim. Initial static checks identified native overload lint/docs requirements and local-only provenance-path routing; fixed task-owned tests/signatures/records without modifying shared validation. Same-agent quality review is not independent. Full suite cadence starts Calc1/10; no task247 Writer state changes or merges."
id_source: "generated"
---
## Summary

Calc core coordinate and range foundation

Begin approved Calc implementation on branch calc in this checkout. Reimplement pinned LibreOffice coordinate types, address and range contracts with original defaults, shared-module reuse, source provenance and independent Calc coverage. First of ten Calc tasks before a full-suite run; no branch integration.

## Scope

Calc foundation only: sc/inc/types.ts, sc/inc/address.ts, sc/source/core/tool/address.ts, colocated Calc tests, Calc-owned runtime/provenance/capability records and docs/program/calc-core.md. Cache selected pinned source files under ignored vendor/libreoffice-reference. No Writer production changes, UI activation, merges, recovery, or dependency version changes.

## Plan

Implement independent TypeScript coordinate types, ScAddress and ScRange numerical contracts from exact pinned source, preserving native defaults and separate header/tool ownership; add exhaustive branch tests and Calc-owned provenance records. Use existing shared architecture without duplication. Validate Calc all-four 100% coverage, relevant static and registry checks; commit only task scope on calc. User instruction to begin implementation supplies approval; network permission received separately. This first task deliberately leaves parsing, formatting, document/formula ownership and browser activation for subsequent executable tasks.

## Verify Steps

Run npm run test:coverage:calc: all four V8 coverage metrics must be 100% without exclusions or counter manipulation. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, targeted ESLint/Prettier for authored files, ap doctor and node .agentplane/policy/check-routing.mjs. Test native coordinate bounds, zero/invalid defaults, address comparison/movement, range ordering/containment/intersection/extension and reference flags. This is Calc task 1/10; per user approval defer full suite to task 10. Record genuine upstream-source limits.

## Verification

Command: npm run test:coverage:calc. Result: pass; 9 acceptance cases in 2 files; real V8 147/147 lines, 155/155 statements, 46/46 functions, 122/122 branches, all four 100%. Scope: all current sc production sources. Command: npm run typecheck; npm run check:dependencies; targeted ESLint and Prettier; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Registry: 3 Calc modules plus 112 existing shared modules, zero semantic violations; implemented capability explicitly remains semantically unverified. Doctor retains 2 unrelated historical warnings with zero errors. Skipped: full suite. Reason: Calc task 1/10 under user instruction; next full suite due after Calc task 10. Risk: unrelated Writer regressions not globally rechecked; no Writer/shared runtime files changed. Approval: explicit user testing cadence.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T07:24:36.219Z — VERIFY — ok

By: CODER

Note: Calc numerical foundation passes 9 cases and actual all-four 100% coverage (147 lines,155 statements,46 functions,122 branches), typecheck, module boundaries, scoped registry, lint/format, docs/size, routing and doctor. Full suite deferred to Calc task10 per explicit user cadence; semantic native API parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:24:33.510Z, excerpt_hash=sha256:85ef2d0760f54c54833a98a677cdcbf7703e278f25a2cd491d2cb844427b9a62

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090711-S6VCEJ/blueprint/resolved-snapshot.json
- old_digest: 783d40424197829c1b899f92dd0a759d4e42d12f5f144d258a0045b06b341bab
- current_digest: 783d40424197829c1b899f92dd0a759d4e42d12f5f144d258a0045b06b341bab
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090711-S6VCEJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090711-S6VCEJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit and its Calc foundation files; keep prior Writer/shared changes and other task records intact. No branch merge or history rewriting.

## Findings

Pinned reference verified locally at exact baseline commit through an ignored symlink to the user-authorized vite-office checkout. npm ci installed locked versions inside this checkout using a repo-local ignored npm cache; package-lock unchanged. A root gitignore entry now excludes the symlink itself because the existing directory-only entry did not. No shared runtime duplication or changes. Source headers reviewed for MPL2/Apache inherited notices; TypeScript independently authored from numerical contracts. JS output tuples/operator methods and relocated header-inline class definitions are declared adaptations; native uninitialized constructors/assertions/hashing/parser/format/external/sticky/subtraction remain unrepresented. Coverage is executable completeness only, never a whole-native parity claim. Initial static checks identified native overload lint/docs requirements and local-only provenance-path routing; fixed task-owned tests/signatures/records without modifying shared validation. Same-agent quality review is not independent. Full suite cadence starts Calc1/10; no task247 Writer state changes or merges.
