---
id: "202611200139-4Z94YX"
title: "Repair full-suite regressions after DOCX and XLSX integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Run full office coverage, inventory coverage, all three Chromium projects and the tooling test suite. Rerun affected suites and relevant quality checks after fixes. Exercise the reported DOCX through production Open and browser storage, without publishing the private fixture."
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T01:39:54.550Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T04:28:38.338Z"
  updated_by: "CODER"
  note: "verified-202611200139-4Z94YX"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T04:28:30.412Z"
  updated_by: "EVALUATOR"
  note: "The reported DOCX and every baseline failing test passed focused verification. The complete toolkit and registry passed."
  evaluated_sha: "9b8ad35de42b8230af30a3e14c8f9402a159ff88"
  blueprint_digest: "c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8"
  evidence_refs:
    - ".agentplane/tasks/202611200139-4Z94YX/README.md"
    - ".agentplane/tasks/202611200139-4Z94YX/quality/20261120-042830412-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611200139-4Z94YX/quality/20261120-042830412-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611200139-4Z94YX/quality/20261120-042830412-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json"
    - "agentplane doctor"
    - "node .agentplane/policy/check-routing.mjs"
  findings:
    - "Recorded the initial application and Chromium counts, all focused reruns, and the unchanged global application coverage result separately."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Repair full-suite regressions after DOCX and XLSX integration. Guided shortcut created the task, approved the plan, and entered execution."
events:
  -
    type: "status"
    at: "2026-11-20T01:39:54.561Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Repair full-suite regressions after DOCX and XLSX integration. Guided shortcut created the task, approved the plan, and entered execution."
  -
    type: "verify"
    at: "2026-11-20T04:28:10.995Z"
    author: "CODER"
    state: "ok"
    note: "Verified: every reported application and Chromium failure passed its focused rerun. The original DOCX, full inventory, tooling, build and scoped Worker coverage passed. The existing global application coverage gate is recorded separately."
  -
    type: "verify"
    at: "2026-11-20T04:28:19.567Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611200139-4Z94YX"
  -
    type: "verify"
    at: "2026-11-20T04:28:38.338Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611200139-4Z94YX"
doc_version: 3
doc_updated_at: "2026-11-20T04:28:38.388Z"
doc_updated_by: "CODER"
description: "Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired."
sections:
  Summary: |-
    Repair full-suite regressions after DOCX and XLSX integration

    Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.
  Scope: |-
    - In scope: Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.
    - Out of scope: unrelated refactors not required for "Repair full-suite regressions after DOCX and XLSX integration".
  Plan: "Complete each independent suite, preserve initial failures, repair their causes without weakening checks, then rerun affected suites and record tested revisions."
  Verify Steps: |-
    1. Run the complete application suite with `npm run test:coverage --workspace @vite-office/office -- --maxWorkers 4`. Retain existing coverage gates and record test failures independently from coverage thresholds.
    2. Run `npm run test:tooling` and `npm run test:inventory:coverage` independently. Verify edited evidence against the production registry with `npm run inventory:parity` and `npm run check:source-provenance`.
    3. Build with `npm run build`. Run the complete Writer, Calc, and shared Chromium projects. If the default preview port is occupied, verify that the running server serves the built assets and reuse it. Keep the configured project profiles and timeouts visible in evidence.
    4. Reproduce each reported failure in the owning test suite, correct product behavior or outdated expectations, and rerun the affected tests. Verify changes with scoped ESLint and Prettier, application TypeScript, JSDoc, the static build smoke check, routing, doctor, and `git diff --check`.
    5. Verify the reported DOCX through Writer's existing Open dialog and browser storage after reload. Use the attachment locally without adding it to Git. Record baseline and final commits, open findings, and final working-tree state.
  Verification: |-
    The full suite started in the local main checkout at `6a47a4b81`. The reviewed implementation ends at `9b8ad35de`. The provided DOCX was used only as a local input to the production Writer Open dialog. The final build rendered its text and picture, saved it to browser storage, and restored the saved copy after a reload.

    | Check | Evidence |
    | --- | --- |
    | Complete application coverage run | 33,639 cases across 2,207 suites. The initial run passed 33,542 and reported 97 failures across 39 suites. All 97 cases passed in focused verification after repairs or timeout retries. The full coverage command reported 96.29% statements, 94.10% branches, 98.35% functions and 97.07% lines against the existing 100% global gate. |
    | Chromium production build and all three projects | 603 scenarios executed. 587 passed on the full pass. The 16 initial failures passed in focused reruns. The repeated large ODS responsiveness test recorded a 175 ms maximum gap during import against its unchanged 200 ms threshold. |
    | Selected Calc application regressions | 126 passed across 21 additional suites. Also repeated the original workbook and view-settings suites, UI and file-store cases. |
    | Selected shared XML and ZIP regressions | 88 passed across five suites. |
    | Selected Writer regressions | 83 passed across replacement, search, text-node and drawing suites. The original table-header, tab-stop, ODT list, OOXML settings and Writer default schema cases passed in additional focused reruns. |
    | Writer ODT worker coverage | The six worker-client cases passed. The complete client owner reached 100% statements, branches, functions and lines. |
    | Inventory | 130 passed across 38 suites, with 100% coverage on all four metrics. Production parity verified 2,881 runtime modules and found zero semantic violations. |
    | Tooling | 194 passed across 47 suites on the final tooling run. |
    | Quality | Application typecheck and production build, static build smoke, scoped Prettier and ESLint, JSDoc, file size, source provenance, routing, doctor and diff validation passed. |

    Durable run logs are in `.git/docx-*.log`. The complete browser run used `.git/main-office-browser.config.mts` with the existing workspace preview verified against the initial build. Focused reruns used the matching original or rebuilt production artifacts and retained browser assertions and project profiles.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T04:28:10.995Z — VERIFY — ok

    By: CODER

    Note: Verified: every reported application and Chromium failure passed its focused rerun. The original DOCX, full inventory, tooling, build and scoped Worker coverage passed. The existing global application coverage gate is recorded separately.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T04:28:10.407Z, excerpt_hash=sha256:5d1943958051f40e9697c748473d616e0d498864455fbdbf6bc0d7ce257337e4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json
    - old_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
    - current_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611200139-4Z94YX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611200139-4Z94YX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-20T04:28:19.567Z — VERIFY — ok

    By: CODER

    Note: verified-202611200139-4Z94YX
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T04:28:11.038Z, excerpt_hash=sha256:5d1943958051f40e9697c748473d616e0d498864455fbdbf6bc0d7ce257337e4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json
    - old_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
    - current_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611200139-4Z94YX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611200139-4Z94YX --result verified-202611200139-4Z94YX --commit 9b8ad35de42b8230af30a3e14c8f9402a159ff88
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-11-20T04:28:38.338Z — VERIFY — ok

    By: CODER

    Note: verified-202611200139-4Z94YX
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T04:28:19.612Z, excerpt_hash=sha256:5d1943958051f40e9697c748473d616e0d498864455fbdbf6bc0d7ce257337e4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json
    - old_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
    - current_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611200139-4Z94YX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611200139-4Z94YX --result verified-202611200139-4Z94YX --commit 9b8ad35de42b8230af30a3e14c8f9402a159ff88
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - The production Chromium test opened the supplied DOCX and restored its browser-saved copy on the final build. The cached remote revision `2406dda9b` predates the existing Writer protection settings and header picture imports. The attachment is private test input.
    - The full browser run reproduced a race in which an autosave cancelled an in-flight ODT download. The browser filter now uses independent lazy clients for explicit file operations and primary XML writes. The existing worker cancellation contracts and autosave schedule are preserved. Writer's bounded text replacement also again rejects unsupported dummy attributes before changing text or registered indices.
    - The existing global application coverage gate reported below 100% on the full pass. Focused worker and inventory coverage each reached 100%. All reported functional test failures passed their focused reruns. The full browser and application runs preserve the initial failures in the retained logs.
id_source: "generated"
---
## Summary

Repair full-suite regressions after DOCX and XLSX integration

Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.

## Scope

- In scope: Run and record the complete application, browser, inventory and tooling suites requested by the user. Reproduce and fix concrete failures in their owning modules, including missing inventory records for existing presentation modules. Preserve historical coverage thresholds and document independent coverage deficits. Confirm the reported DOCX in the current browser build, then pause the broader goal when failing tests are repaired.
- Out of scope: unrelated refactors not required for "Repair full-suite regressions after DOCX and XLSX integration".

## Plan

Complete each independent suite, preserve initial failures, repair their causes without weakening checks, then rerun affected suites and record tested revisions.

## Verify Steps

1. Run the complete application suite with `npm run test:coverage --workspace @vite-office/office -- --maxWorkers 4`. Retain existing coverage gates and record test failures independently from coverage thresholds.
2. Run `npm run test:tooling` and `npm run test:inventory:coverage` independently. Verify edited evidence against the production registry with `npm run inventory:parity` and `npm run check:source-provenance`.
3. Build with `npm run build`. Run the complete Writer, Calc, and shared Chromium projects. If the default preview port is occupied, verify that the running server serves the built assets and reuse it. Keep the configured project profiles and timeouts visible in evidence.
4. Reproduce each reported failure in the owning test suite, correct product behavior or outdated expectations, and rerun the affected tests. Verify changes with scoped ESLint and Prettier, application TypeScript, JSDoc, the static build smoke check, routing, doctor, and `git diff --check`.
5. Verify the reported DOCX through Writer's existing Open dialog and browser storage after reload. Use the attachment locally without adding it to Git. Record baseline and final commits, open findings, and final working-tree state.

## Verification

The full suite started in the local main checkout at `6a47a4b81`. The reviewed implementation ends at `9b8ad35de`. The provided DOCX was used only as a local input to the production Writer Open dialog. The final build rendered its text and picture, saved it to browser storage, and restored the saved copy after a reload.

| Check | Evidence |
| --- | --- |
| Complete application coverage run | 33,639 cases across 2,207 suites. The initial run passed 33,542 and reported 97 failures across 39 suites. All 97 cases passed in focused verification after repairs or timeout retries. The full coverage command reported 96.29% statements, 94.10% branches, 98.35% functions and 97.07% lines against the existing 100% global gate. |
| Chromium production build and all three projects | 603 scenarios executed. 587 passed on the full pass. The 16 initial failures passed in focused reruns. The repeated large ODS responsiveness test recorded a 175 ms maximum gap during import against its unchanged 200 ms threshold. |
| Selected Calc application regressions | 126 passed across 21 additional suites. Also repeated the original workbook and view-settings suites, UI and file-store cases. |
| Selected shared XML and ZIP regressions | 88 passed across five suites. |
| Selected Writer regressions | 83 passed across replacement, search, text-node and drawing suites. The original table-header, tab-stop, ODT list, OOXML settings and Writer default schema cases passed in additional focused reruns. |
| Writer ODT worker coverage | The six worker-client cases passed. The complete client owner reached 100% statements, branches, functions and lines. |
| Inventory | 130 passed across 38 suites, with 100% coverage on all four metrics. Production parity verified 2,881 runtime modules and found zero semantic violations. |
| Tooling | 194 passed across 47 suites on the final tooling run. |
| Quality | Application typecheck and production build, static build smoke, scoped Prettier and ESLint, JSDoc, file size, source provenance, routing, doctor and diff validation passed. |

Durable run logs are in `.git/docx-*.log`. The complete browser run used `.git/main-office-browser.config.mts` with the existing workspace preview verified against the initial build. Focused reruns used the matching original or rebuilt production artifacts and retained browser assertions and project profiles.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T04:28:10.995Z — VERIFY — ok

By: CODER

Note: Verified: every reported application and Chromium failure passed its focused rerun. The original DOCX, full inventory, tooling, build and scoped Worker coverage passed. The existing global application coverage gate is recorded separately.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T04:28:10.407Z, excerpt_hash=sha256:5d1943958051f40e9697c748473d616e0d498864455fbdbf6bc0d7ce257337e4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json
- old_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
- current_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611200139-4Z94YX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611200139-4Z94YX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-20T04:28:19.567Z — VERIFY — ok

By: CODER

Note: verified-202611200139-4Z94YX
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T04:28:11.038Z, excerpt_hash=sha256:5d1943958051f40e9697c748473d616e0d498864455fbdbf6bc0d7ce257337e4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json
- old_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
- current_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611200139-4Z94YX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611200139-4Z94YX --result verified-202611200139-4Z94YX --commit 9b8ad35de42b8230af30a3e14c8f9402a159ff88
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-11-20T04:28:38.338Z — VERIFY — ok

By: CODER

Note: verified-202611200139-4Z94YX
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T04:28:19.612Z, excerpt_hash=sha256:5d1943958051f40e9697c748473d616e0d498864455fbdbf6bc0d7ce257337e4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611200139-4Z94YX/blueprint/resolved-snapshot.json
- old_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
- current_digest: c8c284182a87084e1bd614416a21a97b7c44d7ae03eedd497e307a4912f392b8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611200139-4Z94YX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611200139-4Z94YX --result verified-202611200139-4Z94YX --commit 9b8ad35de42b8230af30a3e14c8f9402a159ff88
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The production Chromium test opened the supplied DOCX and restored its browser-saved copy on the final build. The cached remote revision `2406dda9b` predates the existing Writer protection settings and header picture imports. The attachment is private test input.
- The full browser run reproduced a race in which an autosave cancelled an in-flight ODT download. The browser filter now uses independent lazy clients for explicit file operations and primary XML writes. The existing worker cancellation contracts and autosave schedule are preserved. Writer's bounded text replacement also again rejects unsupported dummy attributes before changing text or registered indices.
- The existing global application coverage gate reported below 100% on the full pass. Focused worker and inventory coverage each reached 100%. All reported functional test failures passed their focused reruns. The full browser and application runs preserve the initial failures in the retained logs.
