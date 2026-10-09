---
id: "202610091259-XJTGF0"
title: "Adopt stable TypeScript 7 compiler with TS6 API compatibility and synchronize branches"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
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
  state: "ok"
  updated_at: "2026-10-09T13:19:39.069Z"
  updated_by: "CODER"
  note: "All declared acceptance checks passed: native TS7 compiler and legacy TS6 API integration, local measured build speedup, complete npm run verify with 100% Istanbul and zero negative counters, and published clean main/writer/calc with clean-install tooling/typecheck validation in both development checkouts."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T13:20:05.312Z"
  updated_by: "EVALUATOR"
  note: "Stable TS7 drives every existing compiler/typecheck entry point while TS6.0.3 remains available solely for API and ESLint compatibility. Complete validation and both fresh-install branch checks passed; local end-to-end production build was 4.10 times faster."
  evaluated_sha: "5e30c999451264cb3c71fbc4d8576dc0d6439f35"
  blueprint_digest: "08052a06a46aa2504307f9f7ab0cfe66a9051ebfd9e00c5d2ebc1095d6dccf2f"
  evidence_refs:
    - ".agentplane/tasks/202610091259-XJTGF0/README.md"
    - ".agentplane/tasks/202610091259-XJTGF0/quality/20261009-132005312-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091259-XJTGF0/quality/20261009-132005312-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091259-XJTGF0/quality/20261009-132005312-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091259-XJTGF0/blueprint/resolved-snapshot.json"
    - "package.json"
    - "scripts/typescript-toolchain.test.ts"
    - ".agentplane/tasks/202610091259-XJTGF0/evidence/verification-results.json"
    - ".agentplane/tasks/202610091259-XJTGF0/evidence/coverage-results.json"
    - ".agentplane/tasks/202610091259-XJTGF0/evidence/performance-comparison.json"
    - ".agentplane/tasks/202610091259-XJTGF0/evidence/synchronization-checkpoint.json"
  findings:
    - "The dependency aliases follow Microsoft guidance, avoid CLI collisions, satisfy ESLint peer ranges, and retain the exact previous legacy API version."
    - "Executed compiler regression tests cover actual tsc/tsc6 resolution, legacy AST import parsing, valid native compilation and TS2322 rejection."
    - "No application source or coverage provider/threshold changed. Main, writer and calc were clean, published and synchronized at d5608178471f."
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
  -
    type: "verify"
    at: "2026-10-09T13:19:39.069Z"
    author: "CODER"
    state: "ok"
    note: "All declared acceptance checks passed: native TS7 compiler and legacy TS6 API integration, local measured build speedup, complete npm run verify with 100% Istanbul and zero negative counters, and published clean main/writer/calc with clean-install tooling/typecheck validation in both development checkouts."
doc_version: 3
doc_updated_at: "2026-10-09T13:19:39.121Z"
doc_updated_by: "CODER"
description: "User explicitly authorizes a side-by-side migration on main: use stable TS7 for all compatible compilation and type checking, retain TS6 for required legacy API and lint consumers, measure performance, fully verify and publish main plus reverse synchronization into writer and calc."
sections:
  Summary: "Adopt stable TypeScript 7 for all existing compilation and type-check entry points while retaining TypeScript 6 only for tools requiring the legacy compiler API."
  Scope: "Main checkout: compiler dependency aliases, relevant scripts/configuration, compiler compatibility regression tests, migration documentation, measured performance and verification evidence. Publish and synchronize main, writer, and calc under the user's explicit authorization. Preserve Istanbul and all coverage thresholds."
  Plan: "Benchmark the current compiler and build. Install stable TS7 with official TS6 compatibility aliases. Verify CLI resolution and legacy API/tooling compatibility, fix any regressions, and add integration tests. Run full verification, record evidence, publish main and back-merge into both development branches."
  Verify Steps: "1. Compare repeated baseline and migrated type-check timings plus production build timings; all commands must pass. 2. Confirm tsc uses stable TS7 and legacy compiler API uses TS6; verify compiler diagnostics and existing AST consumers through tests. 3. Run npm run verify and npm run build; all checks pass with unchanged 100% Istanbul thresholds. 4. Run npm ci in development checkouts; confirm remote main/writer/calc contain the migration and local branches are main/writer/calc with clean tracked and untracked states."
  Verification: |-
    Command: npm run verify. Result: pass (exit 0). Evidence: 528 application files / 14192 tests, 38 inventory files / 122 tests, 3 tooling files / 13 tests including 2 new compiler integration cases, 2 writer resource tests, and 303 browser tests passed. All formatting, lint, native type checks, dependency boundaries, static build, JSDoc, file size, source tree/provenance, and inventory invariant/parity checks passed. Application Istanbul coverage remains 100% across all metrics with zero negative counters; inventory remains 100%. npm run build passed before and after migration. Compiler CLI is TS7.0.2; legacy API and tsc6 remain TS6.0.3. Local averages: tools 2.216s to 0.397s; app type checks 16.097s to 3.319s; production build 17.307s to 4.218s. Published main and fast-forward merged/published writer and calc without conflicts. npm ci, all 13 tooling tests and native type checks passed independently in each development checkout. All three requested branches were clean and matched their refreshed remote upstream at publication checkpoint d5608178471f. Final closure metadata will be synchronized through the same fast-forward process. Evidence is recorded under evidence/ in this task.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T13:19:39.069Z — VERIFY — ok

    By: CODER

    Note: All declared acceptance checks passed: native TS7 compiler and legacy TS6 API integration, local measured build speedup, complete npm run verify with 100% Istanbul and zero negative counters, and published clean main/writer/calc with clean-install tooling/typecheck validation in both development checkouts.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T13:19:38.672Z, excerpt_hash=sha256:2275290c56cd7de9aa338db0aad9be7d42ecc8a9d5b5ee7266a2a54964918811

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610091259-XJTGF0/blueprint/resolved-snapshot.json
    - old_digest: 08052a06a46aa2504307f9f7ab0cfe66a9051ebfd9e00c5d2ebc1095d6dccf2f
    - current_digest: 08052a06a46aa2504307f9f7ab0cfe66a9051ebfd9e00c5d2ebc1095d6dccf2f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091259-XJTGF0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610091259-XJTGF0 -m 🧩 XJTGF0 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
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

Command: npm run verify. Result: pass (exit 0). Evidence: 528 application files / 14192 tests, 38 inventory files / 122 tests, 3 tooling files / 13 tests including 2 new compiler integration cases, 2 writer resource tests, and 303 browser tests passed. All formatting, lint, native type checks, dependency boundaries, static build, JSDoc, file size, source tree/provenance, and inventory invariant/parity checks passed. Application Istanbul coverage remains 100% across all metrics with zero negative counters; inventory remains 100%. npm run build passed before and after migration. Compiler CLI is TS7.0.2; legacy API and tsc6 remain TS6.0.3. Local averages: tools 2.216s to 0.397s; app type checks 16.097s to 3.319s; production build 17.307s to 4.218s. Published main and fast-forward merged/published writer and calc without conflicts. npm ci, all 13 tooling tests and native type checks passed independently in each development checkout. All three requested branches were clean and matched their refreshed remote upstream at publication checkpoint d5608178471f. Final closure metadata will be synchronized through the same fast-forward process. Evidence is recorded under evidence/ in this task.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T13:19:39.069Z — VERIFY — ok

By: CODER

Note: All declared acceptance checks passed: native TS7 compiler and legacy TS6 API integration, local measured build speedup, complete npm run verify with 100% Istanbul and zero negative counters, and published clean main/writer/calc with clean-install tooling/typecheck validation in both development checkouts.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T13:19:38.672Z, excerpt_hash=sha256:2275290c56cd7de9aa338db0aad9be7d42ecc8a9d5b5ee7266a2a54964918811

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610091259-XJTGF0/blueprint/resolved-snapshot.json
- old_digest: 08052a06a46aa2504307f9f7ab0cfe66a9051ebfd9e00c5d2ebc1095d6dccf2f
- current_digest: 08052a06a46aa2504307f9f7ab0cfe66a9051ebfd9e00c5d2ebc1095d6dccf2f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091259-XJTGF0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610091259-XJTGF0 -m 🧩 XJTGF0 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the migration implementation commit and reinstall dependencies; retain the already merged and verified writer/calc application work. No history rewriting or force pushes.

## Findings

The user explicitly authorizes side-by-side TS7/TS6. Microsoft documents the compatibility aliases; @typescript/typescript6@6.0.2 delegates to @typescript/old npm:typescript@^6, preserving current legacy TS6 API availability. Vite transforms and bundles TypeScript independently, so expected speedup mainly affects compiler/type-check stages.

- Observation: Focused validation found a prohibited non-null assertion in the new test and showed that native TS7 reports a type error with exit code 1 rather than legacy exit code 2.
  Impact: Only the new integration-test assumptions failed; project type checks and production build already pass on TS7.
  Resolution: Use a guarded AST assertion and validate a nonzero status plus the specific TS2322 diagnostic without assuming the TS6 exit-code convention.
