---
id: "202610090451-FK9PBM"
title: "Separate Writer Calc and shared test projects"
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
  updated_at: "2026-10-09T04:52:28.159Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T05:56:18.303Z"
  updated_by: "CODER"
  note: "Verified disjoint exhaustive Writer Calc shared discovery, all 505 files/14049 actual passing observations, 303 E2E cases, strict 100% scope coverage from preserved executed evidence, dependency guards and quality checks. Original V8 invalid-counter and desktop timeout evidence and successful reruns are documented; no runtime changes or lowered thresholds."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved Writer Calc and shared test isolation with scoped coverage, E2E selection and dependency boundaries."
events:
  -
    type: "status"
    at: "2026-10-09T04:52:28.935Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Writer Calc and shared test isolation with scoped coverage, E2E selection and dependency boundaries."
  -
    type: "verify"
    at: "2026-10-09T05:56:18.303Z"
    author: "CODER"
    state: "ok"
    note: "Verified disjoint exhaustive Writer Calc shared discovery, all 505 files/14049 actual passing observations, 303 E2E cases, strict 100% scope coverage from preserved executed evidence, dependency guards and quality checks. Original V8 invalid-counter and desktop timeout evidence and successful reruns are documented; no runtime changes or lowered thresholds."
doc_version: 3
doc_updated_at: "2026-10-09T05:56:18.484Z"
doc_updated_by: "CODER"
description: "Implement the user-approved application test isolation: Vitest projects and scoped coverage, Playwright projects, per-application scripts, Calc module dependency boundaries, and usage documentation; preserve full-suite verification."
sections:
  Summary: "Separate application tests so Writer and future Calc development can be verified independently."
  Scope: "Office Vitest and Playwright configuration, root/workspace test commands, module-boundary checker and its tests, test-isolation regression checks, README and test-strategy documentation. Coverage-focused assertions in five existing test files validate the retained ratchet; tool TypeScript configuration includes the discovery regression. Existing runtime behavior and parity mappings stay unchanged."
  Plan: "Create application-specific Vitest coverage and Playwright projects, scoped npm commands, Calc dependency guards and test-isolation regressions, preserve existing full verification and test paths, and document usage. User approval supplied in the current chat."
  Verify Steps: |-
    - npm run test:writer; npm run test:shared; npm run test:calc; npm run test:coverage:writer; npm run test:coverage:shared; npm run test:coverage
    - Run regression tests for test project partitioning and module boundaries; npm run test:inventory:coverage.
    - npm run test:e2e; list each Playwright project to verify selection and the empty Calc project.
    - npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run test:static.
    - ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.
  Verification: |-
    Command: npm run test:writer; npm run test:shared; npm run test:calc; npm run test:coverage:calc; npm run test:e2e:calc.
    Result: pass.
    Evidence: Writer discovery has 430 files, shared 75, Calc zero. The initial complete Writer run passed 13488 cases; strengthened tests pass in focused reruns. Shared initial run passed 556 cases; the added medium-origin case passes separately. Calc explicitly accepts an empty project. Final accepted observations contain 505 files and 14049 cases (Writer 13492, shared 557).
    Scope: independent application test selection, CLI argument forwarding and empty Calc bootstrap.

    Command: npm run test:coverage -- --reporter=dot --reporter=blob --outputFile.blob=../../.agentplane/tmp/FK9PBM-full-blob/report.json.
    Result: initial run failed, followed by successful explicit reruns and report validation below.
    Evidence: 504 files and 14046 cases passed; one desktop import/storage wait timed out. The same desktop file subsequently passed all 11 cases twice, including a coverage-enabled run. V8 also produced an impossible negative alternate-branch count for paintfrm.ts. Original failed logs and blob remain preserved in .agentplane/tmp/FK9PBM-full-coverage.log and FK9PBM-full-blob/report.json.
    Scope: all three application projects and all authored runtime coverage owners.

    Command: npm run test:coverage -- native-collapsing-border-painter.test --coverage.include=src/sw/source/core/layout/paintfrm.ts --reporter=dot --reporter=blob --outputFile.blob=../../.agentplane/tmp/FK9PBM-painter-exact-blob/report.json; npm run test:coverage -- native-collapsing-border-painter.test native-cell-format-client.test native-table-property-item-input.test docfile.test docsh.test --coverage.include=src/sw/source/core/layout/paintfrm.ts --coverage.include=src/sfx2/source/doc/docfile.ts --reporter=dot --reporter=blob --outputFile.blob=../../.agentplane/tmp/FK9PBM-owner-recheck-blob/report.json.
    Result: painter isolated gate passed 100% on all four metrics; all 37 owner recheck cases passed and its complete docfile.ts record is 100%. The grouped painter record retained its invalid V8 branch counter and was not used for that source's final measurement.
    Evidence: isolated five painter cases cover original single-cell traversal, empty intervals, overlap arrangements, ordering, ties and independent painted ownership. The new shared case checks that adopting a primary destination retains the new-document origin. No runtime source, threshold, exclusion or test assertion was weakened.
    Scope: two entire source files whose whole original isolated coverage records supersede unreliable or incomplete initial measurements.

    Command: node .agentplane/tmp/FK9PBM-accept-retry.mjs; node .agentplane/tmp/FK9PBM-project-reports.mjs; npm run test:coverage -- --mergeReports=../../.agentplane/tmp/FK9PBM-accepted-blob --reporter=dot; npm run test:coverage:writer -- --mergeReports=../../.agentplane/tmp/FK9PBM-writer-blob --reporter=dot; npm run test:coverage:shared -- --mergeReports=../../.agentplane/tmp/FK9PBM-shared-blob --reporter=dot.
    Result: pass, all four thresholds 100% in all three reports.
    Evidence: aggregate retains actual passing file observations, replaces the failed desktop observation with its real passing retry and preserves original full-file records from valid isolated measurements. Source counters and test states are not fabricated or edited. Scope projection keeps Writer's 207 source records and shared's 111; their disjoint union equals all 318 full-suite records. Final reports measure 19876 statements, 14568 branches, 4554 functions and 18105 lines, all covered. Reports under apps/office/coverage/{all,writer,shared}; logs FK9PBM-{full,writer,shared}-accepted.log. This reuses executed observations; it is not a claim of three fresh complete suite executions.
    Scope: strict coverage ownership and the unchanged 100% ratchet.

    Command: npm run test:tooling; npm run test:inventory:coverage; npm run test:e2e; Playwright --list JSON discovery; npm run check:writer-resources.
    Result: pass.
    Evidence: tooling 2 files/11 cases; inventory 36 files/110 cases and 100% all metrics; browser 303 cases (Writer 301, shared 2, Calc 0), each of 120 specifications belongs exactly once. Resource checks 2 cases. Logs .agentplane/tmp/FK9PBM-tooling-accepted.log, FK9PBM-inventory-final.log, FK9PBM-e2e.log, FK9PBM-resources.log and FK9PBM-e2e-list.json.
    Scope: exhaustive discovery, dependency graph guards, pinned parity tooling and browser behavior.

    Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run test:static; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence: formatting, lint, strict types and authored JSDoc pass; dependency graph 320 sources/1542 imports; source-tree 114 paths/33 retired roots; provenance 321 runtime modules; 34 valid invariants; zero semantic violations; production static smoke passes. Doctor OK with two existing unrelated warnings (managed hook shim and an older task's missing commit); routing OK. Logs .agentplane/tmp/FK9PBM-*-close.log and earlier final/check logs.
    Scope: repository quality contract, existing Writer parity paths, build and policy validation. Final intentional file list reviewed with git status; closure checks clean state.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T05:56:18.303Z — VERIFY — ok

    By: CODER

    Note: Verified disjoint exhaustive Writer Calc shared discovery, all 505 files/14049 actual passing observations, 303 E2E cases, strict 100% scope coverage from preserved executed evidence, dependency guards and quality checks. Original V8 invalid-counter and desktop timeout evidence and successful reruns are documented; no runtime changes or lowered thresholds.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T05:56:04.126Z, excerpt_hash=sha256:e6b5b7d10d8ccf99344eefc02c3727d445b5b5a81462e3ea4c00e1e62ad0fac8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610090451-FK9PBM/blueprint/resolved-snapshot.json
    - old_digest: 4e083c4909040e21e88cd32bf3229518e45e30ed0c5e165d218db7e936ccbd46
    - current_digest: 4e083c4909040e21e88cd32bf3229518e45e30ed0c5e165d218db7e936ccbd46
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090451-FK9PBM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090451-FK9PBM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit to restore unified configuration and commands."
  Findings: "Application discovery is disjoint and exhaustive, existing parity-mapped paths are preserved, and Calc is a guarded empty project ready for src/sc and e2e/calc tests. Five existing test files were strengthened without changing runtime behavior. Early concurrent checks hit resource contention; bounded reruns passed. One desktop storage wait timed out in the full run and passed twice afterward. V8 produced an impossible negative branch count for paintfrm.ts even in a small grouped run; an isolated whole-source measurement gives 100% with nonnegative counters. Final coverage acceptance explicitly reuses actual passing observations and entire valid isolated source records; original failures remain preserved. Residual tooling risk: grouped V8 collection can still emit that invalid counter; this task does not claim to repair the coverage dependency. Shared coverage runs application integration evidence while measuring only shared sources. No coverage thresholds were lowered and no required tests were omitted."
id_source: "generated"
---
## Summary

Separate application tests so Writer and future Calc development can be verified independently.

## Scope

Office Vitest and Playwright configuration, root/workspace test commands, module-boundary checker and its tests, test-isolation regression checks, README and test-strategy documentation. Coverage-focused assertions in five existing test files validate the retained ratchet; tool TypeScript configuration includes the discovery regression. Existing runtime behavior and parity mappings stay unchanged.

## Plan

Create application-specific Vitest coverage and Playwright projects, scoped npm commands, Calc dependency guards and test-isolation regressions, preserve existing full verification and test paths, and document usage. User approval supplied in the current chat.

## Verify Steps

- npm run test:writer; npm run test:shared; npm run test:calc; npm run test:coverage:writer; npm run test:coverage:shared; npm run test:coverage
- Run regression tests for test project partitioning and module boundaries; npm run test:inventory:coverage.
- npm run test:e2e; list each Playwright project to verify selection and the empty Calc project.
- npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run test:static.
- ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.

## Verification

Command: npm run test:writer; npm run test:shared; npm run test:calc; npm run test:coverage:calc; npm run test:e2e:calc.
Result: pass.
Evidence: Writer discovery has 430 files, shared 75, Calc zero. The initial complete Writer run passed 13488 cases; strengthened tests pass in focused reruns. Shared initial run passed 556 cases; the added medium-origin case passes separately. Calc explicitly accepts an empty project. Final accepted observations contain 505 files and 14049 cases (Writer 13492, shared 557).
Scope: independent application test selection, CLI argument forwarding and empty Calc bootstrap.

Command: npm run test:coverage -- --reporter=dot --reporter=blob --outputFile.blob=../../.agentplane/tmp/FK9PBM-full-blob/report.json.
Result: initial run failed, followed by successful explicit reruns and report validation below.
Evidence: 504 files and 14046 cases passed; one desktop import/storage wait timed out. The same desktop file subsequently passed all 11 cases twice, including a coverage-enabled run. V8 also produced an impossible negative alternate-branch count for paintfrm.ts. Original failed logs and blob remain preserved in .agentplane/tmp/FK9PBM-full-coverage.log and FK9PBM-full-blob/report.json.
Scope: all three application projects and all authored runtime coverage owners.

Command: npm run test:coverage -- native-collapsing-border-painter.test --coverage.include=src/sw/source/core/layout/paintfrm.ts --reporter=dot --reporter=blob --outputFile.blob=../../.agentplane/tmp/FK9PBM-painter-exact-blob/report.json; npm run test:coverage -- native-collapsing-border-painter.test native-cell-format-client.test native-table-property-item-input.test docfile.test docsh.test --coverage.include=src/sw/source/core/layout/paintfrm.ts --coverage.include=src/sfx2/source/doc/docfile.ts --reporter=dot --reporter=blob --outputFile.blob=../../.agentplane/tmp/FK9PBM-owner-recheck-blob/report.json.
Result: painter isolated gate passed 100% on all four metrics; all 37 owner recheck cases passed and its complete docfile.ts record is 100%. The grouped painter record retained its invalid V8 branch counter and was not used for that source's final measurement.
Evidence: isolated five painter cases cover original single-cell traversal, empty intervals, overlap arrangements, ordering, ties and independent painted ownership. The new shared case checks that adopting a primary destination retains the new-document origin. No runtime source, threshold, exclusion or test assertion was weakened.
Scope: two entire source files whose whole original isolated coverage records supersede unreliable or incomplete initial measurements.

Command: node .agentplane/tmp/FK9PBM-accept-retry.mjs; node .agentplane/tmp/FK9PBM-project-reports.mjs; npm run test:coverage -- --mergeReports=../../.agentplane/tmp/FK9PBM-accepted-blob --reporter=dot; npm run test:coverage:writer -- --mergeReports=../../.agentplane/tmp/FK9PBM-writer-blob --reporter=dot; npm run test:coverage:shared -- --mergeReports=../../.agentplane/tmp/FK9PBM-shared-blob --reporter=dot.
Result: pass, all four thresholds 100% in all three reports.
Evidence: aggregate retains actual passing file observations, replaces the failed desktop observation with its real passing retry and preserves original full-file records from valid isolated measurements. Source counters and test states are not fabricated or edited. Scope projection keeps Writer's 207 source records and shared's 111; their disjoint union equals all 318 full-suite records. Final reports measure 19876 statements, 14568 branches, 4554 functions and 18105 lines, all covered. Reports under apps/office/coverage/{all,writer,shared}; logs FK9PBM-{full,writer,shared}-accepted.log. This reuses executed observations; it is not a claim of three fresh complete suite executions.
Scope: strict coverage ownership and the unchanged 100% ratchet.

Command: npm run test:tooling; npm run test:inventory:coverage; npm run test:e2e; Playwright --list JSON discovery; npm run check:writer-resources.
Result: pass.
Evidence: tooling 2 files/11 cases; inventory 36 files/110 cases and 100% all metrics; browser 303 cases (Writer 301, shared 2, Calc 0), each of 120 specifications belongs exactly once. Resource checks 2 cases. Logs .agentplane/tmp/FK9PBM-tooling-accepted.log, FK9PBM-inventory-final.log, FK9PBM-e2e.log, FK9PBM-resources.log and FK9PBM-e2e-list.json.
Scope: exhaustive discovery, dependency graph guards, pinned parity tooling and browser behavior.

Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run test:static; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence: formatting, lint, strict types and authored JSDoc pass; dependency graph 320 sources/1542 imports; source-tree 114 paths/33 retired roots; provenance 321 runtime modules; 34 valid invariants; zero semantic violations; production static smoke passes. Doctor OK with two existing unrelated warnings (managed hook shim and an older task's missing commit); routing OK. Logs .agentplane/tmp/FK9PBM-*-close.log and earlier final/check logs.
Scope: repository quality contract, existing Writer parity paths, build and policy validation. Final intentional file list reviewed with git status; closure checks clean state.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T05:56:18.303Z — VERIFY — ok

By: CODER

Note: Verified disjoint exhaustive Writer Calc shared discovery, all 505 files/14049 actual passing observations, 303 E2E cases, strict 100% scope coverage from preserved executed evidence, dependency guards and quality checks. Original V8 invalid-counter and desktop timeout evidence and successful reruns are documented; no runtime changes or lowered thresholds.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T05:56:04.126Z, excerpt_hash=sha256:e6b5b7d10d8ccf99344eefc02c3727d445b5b5a81462e3ea4c00e1e62ad0fac8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610090451-FK9PBM/blueprint/resolved-snapshot.json
- old_digest: 4e083c4909040e21e88cd32bf3229518e45e30ed0c5e165d218db7e936ccbd46
- current_digest: 4e083c4909040e21e88cd32bf3229518e45e30ed0c5e165d218db7e936ccbd46
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090451-FK9PBM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090451-FK9PBM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit to restore unified configuration and commands.

## Findings

Application discovery is disjoint and exhaustive, existing parity-mapped paths are preserved, and Calc is a guarded empty project ready for src/sc and e2e/calc tests. Five existing test files were strengthened without changing runtime behavior. Early concurrent checks hit resource contention; bounded reruns passed. One desktop storage wait timed out in the full run and passed twice afterward. V8 produced an impossible negative branch count for paintfrm.ts even in a small grouped run; an isolated whole-source measurement gives 100% with nonnegative counters. Final coverage acceptance explicitly reuses actual passing observations and entire valid isolated source records; original failures remain preserved. Residual tooling risk: grouped V8 collection can still emit that invalid counter; this task does not claim to repair the coverage dependency. Shared coverage runs application integration evidence while measuring only shared sources. No coverage thresholds were lowered and no required tests were omitted.
