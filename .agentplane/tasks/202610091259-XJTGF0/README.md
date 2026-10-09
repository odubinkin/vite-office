---
id: "202610091259-XJTGF0"
title: "Adopt stable TypeScript 7 compiler with TS6 API compatibility and synchronize branches"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T13:02:17.076Z"
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
    body: "Start: Implement the user-approved TS7 and TS6 compatibility migration, benchmark it, fully verify it, and synchronize all three branches."
events:
  -
    type: "status"
    at: "2026-10-09T13:02:17.524Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the user-approved TS7 and TS6 compatibility migration, benchmark it, fully verify it, and synchronize all three branches."
doc_version: 3
doc_updated_at: "2026-10-09T13:16:56.144Z"
doc_updated_by: "CODER"
description: "User explicitly authorizes a side-by-side migration on main: use stable TS7 for all compatible compilation and type checking, retain TS6 for required legacy API and lint consumers, measure performance, fully verify and publish main plus reverse synchronization into writer and calc."
sections:
  Summary: "Adopt stable TypeScript 7 for all existing compilation and type-check entry points while retaining TypeScript 6 only for tools requiring the legacy compiler API."
  Scope: "Main checkout: compiler dependency aliases, relevant scripts/configuration, compiler compatibility regression tests, migration documentation, measured performance and verification evidence. Publish and synchronize main, writer, and calc under the user's explicit authorization. Preserve Istanbul and all coverage thresholds."
  Plan: "Benchmark the current compiler and build. Install stable TS7 with official TS6 compatibility aliases. Verify CLI resolution and legacy API/tooling compatibility, fix any regressions, and add integration tests. Run full verification, record evidence, publish main and back-merge into both development branches."
  Verify Steps: "1. Compare repeated baseline and migrated type-check timings plus production build timings; all commands must pass. 2. Confirm tsc uses stable TS7 and legacy compiler API uses TS6; verify compiler diagnostics and existing AST consumers through tests. 3. Run npm run verify and npm run build; all checks pass with unchanged 100% Istanbul thresholds. 4. Run npm ci in development checkouts; confirm remote main/writer/calc contain the migration and local branches are main/writer/calc with clean tracked and untracked states."
  Verification: "Command: npm run verify. Result: pass (exit 0). Evidence: 528 application files / 14192 tests, 38 inventory files / 122 tests, 3 tooling files / 13 tests including 2 new compiler integration cases, 2 writer resource tests, and 303 browser tests passed. All formatting, lint, native type checks, dependency boundaries, static build, JSDoc, file size, source tree/provenance, and inventory invariant/parity checks passed. Application Istanbul coverage remains 100% across all metrics with zero negative counters; inventory remains 100%. npm run build passed before and after migration. Compiler CLI is TS7.0.2; legacy API and tsc6 remain TS6.0.3. Local averages: tools 2.216s to 0.397s; app type checks 16.097s to 3.319s; production build 17.307s to 4.218s. Branch publication and clean-install synchronization are in progress."
  Rollback Plan: "Revert the migration implementation commit and reinstall dependencies; retain the already merged and verified writer/calc application work. No history rewriting or force pushes."
  Findings: |-
    The user explicitly authorizes side-by-side TS7/TS6. Microsoft documents the compatibility aliases; @typescript/typescript6@6.0.2 delegates to @typescript/old npm:typescript@^6, preserving current legacy TS6 API availability. Vite transforms and bundles TypeScript independently, so expected speedup mainly affects compiler/type-check stages.

    - Observation: Focused validation found a prohibited non-null assertion in the new test and showed that native TS7 reports a type error with exit code 1 rather than legacy exit code 2.
      Impact: Only the new integration-test assumptions failed; project type checks and production build already pass on TS7.
      Resolution: Use a guarded AST assertion and validate a nonzero status plus the specific TS2322 diagnostic without assuming the TS6 exit-code convention.
id_source: "generated"
---
## Summary

Adopt stable TypeScript 7 for all existing compilation and type-check entry points while retaining TypeScript 6 only for tools requiring the legacy compiler API.

## Scope

Main checkout: compiler dependency aliases, relevant scripts/configuration, compiler compatibility regression tests, migration documentation, measured performance and verification evidence. Publish and synchronize main, writer, and calc under the user's explicit authorization. Preserve Istanbul and all coverage thresholds.

## Plan

Benchmark the current compiler and build. Install stable TS7 with official TS6 compatibility aliases. Verify CLI resolution and legacy API/tooling compatibility, fix any regressions, and add integration tests. Run full verification, record evidence, publish main and back-merge into both development branches.

## Verify Steps

1. Compare repeated baseline and migrated type-check timings plus production build timings; all commands must pass. 2. Confirm tsc uses stable TS7 and legacy compiler API uses TS6; verify compiler diagnostics and existing AST consumers through tests. 3. Run npm run verify and npm run build; all checks pass with unchanged 100% Istanbul thresholds. 4. Run npm ci in development checkouts; confirm remote main/writer/calc contain the migration and local branches are main/writer/calc with clean tracked and untracked states.

## Verification

Command: npm run verify. Result: pass (exit 0). Evidence: 528 application files / 14192 tests, 38 inventory files / 122 tests, 3 tooling files / 13 tests including 2 new compiler integration cases, 2 writer resource tests, and 303 browser tests passed. All formatting, lint, native type checks, dependency boundaries, static build, JSDoc, file size, source tree/provenance, and inventory invariant/parity checks passed. Application Istanbul coverage remains 100% across all metrics with zero negative counters; inventory remains 100%. npm run build passed before and after migration. Compiler CLI is TS7.0.2; legacy API and tsc6 remain TS6.0.3. Local averages: tools 2.216s to 0.397s; app type checks 16.097s to 3.319s; production build 17.307s to 4.218s. Branch publication and clean-install synchronization are in progress.

## Rollback Plan

Revert the migration implementation commit and reinstall dependencies; retain the already merged and verified writer/calc application work. No history rewriting or force pushes.

## Findings

The user explicitly authorizes side-by-side TS7/TS6. Microsoft documents the compatibility aliases; @typescript/typescript6@6.0.2 delegates to @typescript/old npm:typescript@^6, preserving current legacy TS6 API availability. Vite transforms and bundles TypeScript independently, so expected speedup mainly affects compiler/type-check stages.

- Observation: Focused validation found a prohibited non-null assertion in the new test and showed that native TS7 reports a type error with exit code 1 rather than legacy exit code 2.
  Impact: Only the new integration-test assumptions failed; project type checks and production build already pass on TS7.
  Resolution: Use a guarded AST assertion and validate a nonzero status plus the specific TS2322 diagnostic without assuming the TS6 exit-code convention.
