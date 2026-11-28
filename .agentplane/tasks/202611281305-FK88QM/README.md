---
id: "202611281305-FK88QM"
title: "Integrate November 28 Writer and Calc branch updates"
status: "DOING"
priority: "high"
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
  updated_at: "2026-11-28T13:20:35.165Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-11-28T17:45:30.650Z"
  updated_by: "CODER"
  note: "Full npm run verify reached Istanbul and exited 1. The run executed 2353 test files, with 34370 passing tests, 17 failures reproduced and repaired in focused suites, and 12 existing skips. Global coverage remained below the unchanged 100 percent gate: statements 94.76, branches 90.94, functions 96.89, lines 95.88. Inventory passed 131 tests and all four 100 percent thresholds. Full Chromium reported 652/654, and both scenarios passed the two-worker rerun after native file wait fixes."
  attempts: 1
commit: null
comments:
  -
    author: "CODER"
    body: "Start: integrate and verify the current Writer and Calc heads, then synchronize the published branches."
events:
  -
    type: "status"
    at: "2026-11-28T13:06:14.804Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: integrate and verify the current Writer and Calc heads, then synchronize the published branches."
  -
    type: "verify"
    at: "2026-11-28T17:45:30.650Z"
    author: "CODER"
    state: "needs_rework"
    note: "Full npm run verify reached Istanbul and exited 1. The run executed 2353 test files, with 34370 passing tests, 17 failures reproduced and repaired in focused suites, and 12 existing skips. Global coverage remained below the unchanged 100 percent gate: statements 94.76, branches 90.94, functions 96.89, lines 95.88. Inventory passed 131 tests and all four 100 percent thresholds. Full Chromium reported 652/654, and both scenarios passed the two-worker rerun after native file wait fixes."
doc_version: 3
doc_updated_at: "2026-11-28T17:45:30.699Z"
doc_updated_by: "CODER"
description: "Publish current feature heads, merge both into main, resolve conflicts with targeted checks, repair failures found by full verification, document suspected upstream issues and merge verified main back into both published feature branches."
sections:
  Summary: "Integrate and publish the current Writer and Calc branches in main and synchronize both development branches back to the verified main."
  Scope: "Use the three user-named checkouts. Publish their existing feature commits, resolve any merge conflicts, repair concrete verification failures and record supported upstream suspicions in the respective issue journals. Preserve unrelated Calc artifacts."
  Plan: "User requires a successful npm run verify before publication. Diagnose and fix functional, tooling, documentation, size and coverage failures across integrated main while preserving the established checks and coverage thresholds. Verify focused and full suites, then publish main and merge it back into writer and calc."
  Verify Steps: |-
    1. Run focused unit, browser or registry checks selected by resolved source and metadata conflicts.
    2. Run npm run verify on integrated main. If an early gate fails, also exercise subsequent test suites to expose independent failures. Keep existing coverage requirements.
    3. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    4. Check git diff --check, tracked working-tree status, branch and remote tip equality, and ancestry of the published main in writer and calc.
  Verification: |-
    Pending execution.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T17:45:30.650Z — VERIFY — needs_rework

    By: CODER

    Note: Full npm run verify reached Istanbul and exited 1. The run executed 2353 test files, with 34370 passing tests, 17 failures reproduced and repaired in focused suites, and 12 existing skips. Global coverage remained below the unchanged 100 percent gate: statements 94.76, branches 90.94, functions 96.89, lines 95.88. Inventory passed 131 tests and all four 100 percent thresholds. Full Chromium reported 652/654, and both scenarios passed the two-worker rerun after native file wait fixes.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T15:37:33.871Z, excerpt_hash=sha256:d13c74ebb52aaafa82c72b89a61bdd149493988a696d5956ec0e37dfd2f8a84c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281305-FK88QM/blueprint/resolved-snapshot.json
    - old_digest: b2458c17d363e8abaaa7eefa187830624d3e61bee6117ae9c425ea81a6d32e4f
    - current_digest: b2458c17d363e8abaaa7eefa187830624d3e61bee6117ae9c425ea81a6d32e4f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281305-FK88QM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281305-FK88QM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Preserve original branch tips and untracked artifacts. Follow normal fast-forward publication and use explicit revert commits if published integration needs reversing."
  Findings: |-
    Pending execution.

    - Observation: Published Writer f219f0ad2 and Calc d286bb44b over HTTPS, then merged both heads locally. Focused integrated tests passed twice; post-decomposition validation passed 91 cases. A complete initial inventory run passed 130 tests and found one uncovered metadata classifier branch. The new real ODT settings case covers that branch and brings the diagnostic file to 100 percent in all four metrics.
      Impact: Main publication and reverse synchronization remain gated by a successful full npm run verify. The base main already failed JSDoc and file size gates. Initial wide application and browser runs have failures under investigation.
      Resolution: User explicitly requires every npm run verify gate to pass before publication. Preserve official thresholds and existing test discovery. Continue functional retries, document validation, file decomposition and coverage work on local main.

    - Observation: The focused current integration run passed all 24 Writer, Calc and shared ODF tests, typechecking passed, and registry validation passed after relocating provenance markers. Eight slow XLSX application cases and eight Writer list browser cases passed their isolated retries.
      Impact: The standard full gate is still required before publication. The observed static backlog remains broader than the merge conflicts.
      Resolution: Retain verified conflict repairs and behavior-preserving refactors on local main. Continue whole-repository JSDoc, source file limits and remaining full suites without changing the verification contract.

    - Observation: The complete tracked source file-size gate passed, along with the current typecheck, dependency check and registry validation. The selected splits passed 33 focused tests. Restored the print-range transfer diagnostic and coalesced Calc grouped input into one document generation after reproduced integration failures. The targeted print, input and conditional-format retries passed.
      Impact: Full application and browser campaigns are still in progress, and the source-wide JSDoc gate still reports undocumented callbacks. The source and test size fixes do not alter gate limits.
      Resolution: Continue documenting callback contracts and rerun the current verification gates. Main publication remains conditional on the full verify command.

    - Observation: Writer treated the counted outline list rebuilt on ODT import as an ordinary list. It also exposed a native mixed-range success result without a mutation.
      Impact: Tab could leave the imported heading at the same level and its undo history did not use the outline action. The first full browser run recorded 642 passing and 12 failing scenarios on the pre-fix snapshot.
      Resolution: Dispatch counted headings to the native outline-level movement and typed undo action, preserve the mixed core result, and record WRITER-792. Current focused outline checks passed in Vitest and Chromium. The strict full verification remains pending.

    - Observation: The complete inventory suite reached 131/131 tests and 100% across four coverage metrics. The strict check then reached application Istanbul coverage, which exposed multiple Calc XLSX scenarios exceeding the 30-second test budget.
      Impact: The workbook cases exercised real native resources and serialized multiple formats; isolated retries reproduced the timeout without changing the assertions.
      Resolution: Set explicit deadlines for the affected round trips under the same 120-second budget as existing native Writer fixtures. Focused retries passed all eleven checked scenarios. Preserve the full application coverage thresholds and retain the strict verify gate before publishing main.

    - Observation: The Istanbul report shows 1300 incomplete source files, 1043 outside the source paths changed by the integration. The preexisting report identifies coverage gaps in 873 of those unchanged files.
      Impact: Publication and reverse merges require a green strict verify.
      Resolution: Keep the integrated result local and preserve all verification thresholds. Focused repairs address reproduced functional and deadline failures. The global application coverage deficit remains open.
id_source: "generated"
---
## Summary

Integrate and publish the current Writer and Calc branches in main and synchronize both development branches back to the verified main.

## Scope

Use the three user-named checkouts. Publish their existing feature commits, resolve any merge conflicts, repair concrete verification failures and record supported upstream suspicions in the respective issue journals. Preserve unrelated Calc artifacts.

## Plan

User requires a successful npm run verify before publication. Diagnose and fix functional, tooling, documentation, size and coverage failures across integrated main while preserving the established checks and coverage thresholds. Verify focused and full suites, then publish main and merge it back into writer and calc.

## Verify Steps

1. Run focused unit, browser or registry checks selected by resolved source and metadata conflicts.
2. Run npm run verify on integrated main. If an early gate fails, also exercise subsequent test suites to expose independent failures. Keep existing coverage requirements.
3. Run ap doctor and node .agentplane/policy/check-routing.mjs.
4. Check git diff --check, tracked working-tree status, branch and remote tip equality, and ancestry of the published main in writer and calc.

## Verification

Pending execution.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T17:45:30.650Z — VERIFY — needs_rework

By: CODER

Note: Full npm run verify reached Istanbul and exited 1. The run executed 2353 test files, with 34370 passing tests, 17 failures reproduced and repaired in focused suites, and 12 existing skips. Global coverage remained below the unchanged 100 percent gate: statements 94.76, branches 90.94, functions 96.89, lines 95.88. Inventory passed 131 tests and all four 100 percent thresholds. Full Chromium reported 652/654, and both scenarios passed the two-worker rerun after native file wait fixes.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T15:37:33.871Z, excerpt_hash=sha256:d13c74ebb52aaafa82c72b89a61bdd149493988a696d5956ec0e37dfd2f8a84c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281305-FK88QM/blueprint/resolved-snapshot.json
- old_digest: b2458c17d363e8abaaa7eefa187830624d3e61bee6117ae9c425ea81a6d32e4f
- current_digest: b2458c17d363e8abaaa7eefa187830624d3e61bee6117ae9c425ea81a6d32e4f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281305-FK88QM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281305-FK88QM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Preserve original branch tips and untracked artifacts. Follow normal fast-forward publication and use explicit revert commits if published integration needs reversing.

## Findings

Pending execution.

- Observation: Published Writer f219f0ad2 and Calc d286bb44b over HTTPS, then merged both heads locally. Focused integrated tests passed twice; post-decomposition validation passed 91 cases. A complete initial inventory run passed 130 tests and found one uncovered metadata classifier branch. The new real ODT settings case covers that branch and brings the diagnostic file to 100 percent in all four metrics.
  Impact: Main publication and reverse synchronization remain gated by a successful full npm run verify. The base main already failed JSDoc and file size gates. Initial wide application and browser runs have failures under investigation.
  Resolution: User explicitly requires every npm run verify gate to pass before publication. Preserve official thresholds and existing test discovery. Continue functional retries, document validation, file decomposition and coverage work on local main.

- Observation: The focused current integration run passed all 24 Writer, Calc and shared ODF tests, typechecking passed, and registry validation passed after relocating provenance markers. Eight slow XLSX application cases and eight Writer list browser cases passed their isolated retries.
  Impact: The standard full gate is still required before publication. The observed static backlog remains broader than the merge conflicts.
  Resolution: Retain verified conflict repairs and behavior-preserving refactors on local main. Continue whole-repository JSDoc, source file limits and remaining full suites without changing the verification contract.

- Observation: The complete tracked source file-size gate passed, along with the current typecheck, dependency check and registry validation. The selected splits passed 33 focused tests. Restored the print-range transfer diagnostic and coalesced Calc grouped input into one document generation after reproduced integration failures. The targeted print, input and conditional-format retries passed.
  Impact: Full application and browser campaigns are still in progress, and the source-wide JSDoc gate still reports undocumented callbacks. The source and test size fixes do not alter gate limits.
  Resolution: Continue documenting callback contracts and rerun the current verification gates. Main publication remains conditional on the full verify command.

- Observation: Writer treated the counted outline list rebuilt on ODT import as an ordinary list. It also exposed a native mixed-range success result without a mutation.
  Impact: Tab could leave the imported heading at the same level and its undo history did not use the outline action. The first full browser run recorded 642 passing and 12 failing scenarios on the pre-fix snapshot.
  Resolution: Dispatch counted headings to the native outline-level movement and typed undo action, preserve the mixed core result, and record WRITER-792. Current focused outline checks passed in Vitest and Chromium. The strict full verification remains pending.

- Observation: The complete inventory suite reached 131/131 tests and 100% across four coverage metrics. The strict check then reached application Istanbul coverage, which exposed multiple Calc XLSX scenarios exceeding the 30-second test budget.
  Impact: The workbook cases exercised real native resources and serialized multiple formats; isolated retries reproduced the timeout without changing the assertions.
  Resolution: Set explicit deadlines for the affected round trips under the same 120-second budget as existing native Writer fixtures. Focused retries passed all eleven checked scenarios. Preserve the full application coverage thresholds and retain the strict verify gate before publishing main.

- Observation: The Istanbul report shows 1300 incomplete source files, 1043 outside the source paths changed by the integration. The preexisting report identifies coverage gaps in 873 of those unchanged files.
  Impact: Publication and reverse merges require a green strict verify.
  Resolution: Keep the integrated result local and preserve all verification thresholds. Focused repairs address reproduced functional and deadline failures. The global application coverage deficit remains open.
