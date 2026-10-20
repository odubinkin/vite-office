---
id: "202610201528-MD0CQF"
title: "Repair checkpoint50 regressions and restore Calc shared complete coverage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T15:28:32.106Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T17:13:39.830Z"
  updated_by: "CODER"
  note: "Complete application regression plus the documented single-file test-only repair replay passes 17377 current tests across 1081 distinct files. Calc/shared/Writer coverage is 100 percent S/B/F/L with exact-map and source-hash checks. Browser 432/432, tooling 130/130, inventory 123/123, all 18 full gates and six post-repair static checks pass; immutable original failure retained in evidence. Implementation ff568de0a3dc."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T17:13:50.205Z"
  updated_by: "EVALUATOR"
  note: "Checkpoint50 regressions repaired; complete application evidence plus exact single-file repair replay establishes 17377 passing current tests and 100 percent Calc/shared/Writer S/B/F/L; all browser/static gates pass."
  evaluated_sha: "ff568de0a3dc60e3a5ab87aeaf1f3034cf85a178"
  blueprint_digest: "9780d7b14c0fcb367425eb1fb7fb208fa23ebf80bee08d1a24e8a8792b40f12e"
  evidence_refs:
    - ".agentplane/tasks/202610201528-MD0CQF/README.md"
    - ".agentplane/tasks/202610201528-MD0CQF/quality/20261020-171350205-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201528-MD0CQF/quality/20261020-171350205-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201528-MD0CQF/quality/20261020-171350205-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201528-MD0CQF/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610201528-MD0CQF/evidence/accepted-proof.json"
    - ".agentplane/tasks/202610201528-MD0CQF/evidence/acceptance.mjs"
    - ".agentplane/tasks/202610201528-MD0CQF/evidence/repair-checks.json"
  findings:
    - "Reviewed actual-owner boundary and serialization tests, unchanged native core contracts, shared popup event ownership, preserved file-operation Promises and assertions. Raw archive integrity, identical instrumentation maps, complete distinct-file/assertion accounting and unchanged production source are checked by the committed acceptance script. Original failures are preserved, with no relaxed gate or timeout."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: repair checkpoint50 failures and restore full Calc/shared coverage under the clarified user stop condition."
events:
  -
    type: "status"
    at: "2026-10-20T15:28:45.642Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: repair checkpoint50 failures and restore full Calc/shared coverage under the clarified user stop condition."
  -
    type: "verify"
    at: "2026-10-20T17:13:39.830Z"
    author: "CODER"
    state: "ok"
    note: "Complete application regression plus the documented single-file test-only repair replay passes 17377 current tests across 1081 distinct files. Calc/shared/Writer coverage is 100 percent S/B/F/L with exact-map and source-hash checks. Browser 432/432, tooling 130/130, inventory 123/123, all 18 full gates and six post-repair static checks pass; immutable original failure retained in evidence. Implementation ff568de0a3dc."
doc_version: 3
doc_updated_at: "2026-10-20T17:13:39.942Z"
doc_updated_by: "CODER"
description: "User clarified stop condition: repair the complete-run test failures and obtain 100 percent statements branches functions and lines for Calc and shared owners before pausing. Preserve native contracts and coverage gates. Work solely in calc checkout and branch."
sections:
  Summary: |-
    Repair checkpoint50 regressions and restore Calc shared complete coverage

    User clarified stop condition: repair the complete-run test failures and obtain 100 percent statements branches functions and lines for Calc and shared owners before pausing. Preserve native contracts and coverage gates. Work solely in calc checkout and branch.
  Scope: "Checkpoint50 failures and coverage gaps in Calc, shared border controls/core and XML/character rendering, with corresponding colocated tests and e2e expectations. Up to 45 test files; production repairs only for demonstrated contract bugs. No feature expansion or test gate relaxation."
  Plan: "Repair the two application and four browser regressions recorded by checkpoint50, checking current native behavior before changing expectations. Add meaningful contract, boundary, state, UI interaction, and serialization tests for all 32 Calc/shared owners with gaps, using colocated tests and focused new regression files as needed (up to 45 test files plus implementation repairs only when a regression is demonstrated). Keep production native semantics, thresholds, coverage ownership, exclusions and retries unchanged. Verify focused suites, complete Calc coverage and shared coverage with application integration at 100 percent S/B/F/L, all Calc/shared browser cases and affected Writer integrations, then full application regression and static gates once on final source. Record exact evidence, close task and pause goal. No network, branches, merges or new features."
  Verify Steps: "Run focused regressions; npm run test:coverage:calc and npm run test:coverage:shared (disjoint batches and exact checked raw union allowed if disk pressure prevents monolithic run, unchanged Istanbul thresholds and owner selection). Require zero failures and 100 percent statements branches functions lines for Calc and shared; no new excludes or ignore directives. Run complete browser suite, complete application regression on final source, tooling/inventory coverage and format/lint/type/build/dependencies/resource/docs/size/tree/provenance/registry/routing/doctor/static gates. Preserve exact commands, failures and final results. Check clean git status and calc branch. Pause goal only after repairs and successful required gates."
  Verification: |-
    Command: `node output/playwright/task51-final-runner.mjs`, then `node output/playwright/task51-parallel-runner.mjs` after the user requested parallel execution. Exact Vitest argv, stages, timestamps, logs and archive hashes are recorded in `evidence/progress.json`; original sequential progress is retained separately.
    Result: pass after the test-only repair replay described below. All 1081 distinct discovered application files were executed: Calc 151, Writer 593, shared 337. No duplicate or missing file. Batches 00-05 were retained; only interrupted unfinished batch 06 was restarted, with the remaining batches using two concurrent jobs and one worker per job. The production source snapshot remained unchanged throughout the full run.
    Evidence: original full run had 17376 passing and one failing application test, with no skipped tests. The sole failure was the genuine SaveCopy dialog test polling for one second while persistence remained busy. This original failure remains in the immutable full-run reports; it was not relabeled as a passing full run.
    Scope: complete Calc, shared and Writer application regression, unchanged Istanbul provider, source ownership, thresholds, excludes, timeouts and retries.

    Command: from `apps/office`, `node ../../node_modules/vitest/vitest.mjs run --config vite.config.ts src/sc/browser/presentation/calc-files.test.tsx --maxWorkers=1 --coverage --coverage.reportsDirectory=coverage/task51-repair --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task51-repair-results.json`.
    Result: pass, 4/4 assertions, zero failures, zero skips. This partial coverage invocation returns 1 solely because the unchanged global 100 percent gate sees only one test file; the complete raw union below is the final coverage gate.
    Evidence: `repair-results.json.gz`, `repair-raw.json.gz`, `repair.log`. The test now observes and awaits genuine call-through SaveCopy and OpenStored Promises inside React act. The original operation Promise, real IndexedDB/ODS operations and all assertions are preserved. No timeout increase or storage stub was introduced.
    Scope: the entire repaired file. Only this test file changed after the full run; production hashes and exact assertion identities match. Its passing current results replace that file alone in the logical acceptance accounting, without counting it twice.

    Command: `node output/playwright/task51-acceptance.mjs` (saved as `evidence/acceptance.mjs`).
    Result: pass. 1081 distinct files, 17377/17377 current application assertions passing, zero failures and skips. Exact-map raw union: Calc 100/100/100/100, shared 100/100/100/100, Writer 100/100/100/100 for statements/branches/functions/lines. Global totals: S 53317/53317; B 33877/33877; F 10229/10229; L 48446/48446.
    Evidence: `accepted-proof.json`, `accepted-application-raw.json.gz`, `accepted-source-snapshot.json`, original per-batch raw/report archives and SHA256 checks. The acceptance script verifies all archive hashes, exact instrumentation map equality, file and assertion accounting, preserved source ownership, and zero unexpected source changes.
    Scope: complete unchanged production source and the one repaired test owner. This is a complete full run plus one transparent test-only repair replay, not a claim that the original failed invocation passed.

    Command: complete Playwright run and all 18 full-run stages, with exact argv recorded in `progress.json`.
    Result: pass. Playwright 432/432 expected, zero unexpected/flaky/skipped, retries 0. Tooling 130/130 and inventory 123/123 pass; inventory coverage 100 percent. Formatting, lint, types, dependencies, Writer/Calc resources, docs, file size, source tree, provenance, registry, policy routing, doctor, build and static build all exit 0.
    Evidence: respective stage logs and JSON archives; `browser-results.json.gz` retains final statistics.
    Scope: all browser projects, actual Calc/Writer shared chrome and file workflows, DOM-free native ownership, and repository static/build gates.

    Command: post-repair lint for calc-files.test.tsx, project typecheck, docs, file formatting, file size and dependency checks; exact commands and log hashes in `repair-checks.json`.
    Result: pass, all six checks exit 0.
    Evidence: `repair-*.log` and `repair-checks.json`.
    Scope: the final test-only change. Full production/browser gates remain applicable because no production file changed after that run. No additional feature work is authorized after closure; pause the goal as requested.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T17:13:39.830Z — VERIFY — ok

    By: CODER

    Note: Complete application regression plus the documented single-file test-only repair replay passes 17377 current tests across 1081 distinct files. Calc/shared/Writer coverage is 100 percent S/B/F/L with exact-map and source-hash checks. Browser 432/432, tooling 130/130, inventory 123/123, all 18 full gates and six post-repair static checks pass; immutable original failure retained in evidence. Implementation ff568de0a3dc.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T17:13:11.549Z, excerpt_hash=sha256:79fbf8010e8acf119b2dfbeb64b7be010b57acf6b04da21509f78a6deb683960

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201528-MD0CQF/blueprint/resolved-snapshot.json
    - old_digest: 9780d7b14c0fcb367425eb1fb7fb208fa23ebf80bee08d1a24e8a8792b40f12e
    - current_digest: 9780d7b14c0fcb367425eb1fb7fb208fa23ebf80bee08d1a24e8a8792b40f12e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201528-MD0CQF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201528-MD0CQF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task implementation commit if needed; retain evidence and original checkpoint50 results. No history rewrite or source reference changes."
  Findings: |-
    Checkpoint50 regressions are repaired: contiguous native pool prefix includes protection and borders; toolbar expectations include the real shared line-style summary and enabled indent/border actions; the keyboard popup regression uses a genuinely disabled Superscript command. Added meaningful native boundary, formatting history, RTL/merge, XML/ODS failure and UI ownership tests closing all 32 originally uncovered Calc/shared owners. Shared details popup state reads the actual toggle event currentTarget; no native core behavior changed.

    A first focused Calc coverage run exposed load-dependent UI waits and two stale new fixtures. Existing affected UI files passed 22/22 on serial diagnosis; new fixtures were corrected against actual native contracts. The final complete run reduced the remaining failure to one SaveCopy dialog test. That test now awaits actual operation completion through call-through observers, preserving native operations and assertions. Its four current cases pass with Istanbul. The original failed result remains in the evidence, and the final acceptance explicitly combines the complete stable-production run with the one repaired test file.

    At the user request, remaining independent application batches ran as two concurrent Vitest jobs, each with one worker and isolated report/coverage directories. Six finished batches were retained; the unfinished batch alone was restarted. No subagents, threshold changes, excludes, ignore directives, skips, retry changes, timeout increases, branches, merges, network calls or feature expansion were used.

    Final acceptance: 17377/17377 application tests, 432/432 browser cases, 130/130 tooling and 123/123 inventory tests. Calc, shared, Writer and aggregate Istanbul coverage are 100 percent in all four metrics. All 18 complete-run gates and six post-repair static checks pass. Raw maps, source hashes, command logs and exact current assertion accounting are retained. The user stop condition is satisfied; pause after task closure.
id_source: "generated"
---
## Summary

Repair checkpoint50 regressions and restore Calc shared complete coverage

User clarified stop condition: repair the complete-run test failures and obtain 100 percent statements branches functions and lines for Calc and shared owners before pausing. Preserve native contracts and coverage gates. Work solely in calc checkout and branch.

## Scope

Checkpoint50 failures and coverage gaps in Calc, shared border controls/core and XML/character rendering, with corresponding colocated tests and e2e expectations. Up to 45 test files; production repairs only for demonstrated contract bugs. No feature expansion or test gate relaxation.

## Plan

Repair the two application and four browser regressions recorded by checkpoint50, checking current native behavior before changing expectations. Add meaningful contract, boundary, state, UI interaction, and serialization tests for all 32 Calc/shared owners with gaps, using colocated tests and focused new regression files as needed (up to 45 test files plus implementation repairs only when a regression is demonstrated). Keep production native semantics, thresholds, coverage ownership, exclusions and retries unchanged. Verify focused suites, complete Calc coverage and shared coverage with application integration at 100 percent S/B/F/L, all Calc/shared browser cases and affected Writer integrations, then full application regression and static gates once on final source. Record exact evidence, close task and pause goal. No network, branches, merges or new features.

## Verify Steps

Run focused regressions; npm run test:coverage:calc and npm run test:coverage:shared (disjoint batches and exact checked raw union allowed if disk pressure prevents monolithic run, unchanged Istanbul thresholds and owner selection). Require zero failures and 100 percent statements branches functions lines for Calc and shared; no new excludes or ignore directives. Run complete browser suite, complete application regression on final source, tooling/inventory coverage and format/lint/type/build/dependencies/resource/docs/size/tree/provenance/registry/routing/doctor/static gates. Preserve exact commands, failures and final results. Check clean git status and calc branch. Pause goal only after repairs and successful required gates.

## Verification

Command: `node output/playwright/task51-final-runner.mjs`, then `node output/playwright/task51-parallel-runner.mjs` after the user requested parallel execution. Exact Vitest argv, stages, timestamps, logs and archive hashes are recorded in `evidence/progress.json`; original sequential progress is retained separately.
Result: pass after the test-only repair replay described below. All 1081 distinct discovered application files were executed: Calc 151, Writer 593, shared 337. No duplicate or missing file. Batches 00-05 were retained; only interrupted unfinished batch 06 was restarted, with the remaining batches using two concurrent jobs and one worker per job. The production source snapshot remained unchanged throughout the full run.
Evidence: original full run had 17376 passing and one failing application test, with no skipped tests. The sole failure was the genuine SaveCopy dialog test polling for one second while persistence remained busy. This original failure remains in the immutable full-run reports; it was not relabeled as a passing full run.
Scope: complete Calc, shared and Writer application regression, unchanged Istanbul provider, source ownership, thresholds, excludes, timeouts and retries.

Command: from `apps/office`, `node ../../node_modules/vitest/vitest.mjs run --config vite.config.ts src/sc/browser/presentation/calc-files.test.tsx --maxWorkers=1 --coverage --coverage.reportsDirectory=coverage/task51-repair --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task51-repair-results.json`.
Result: pass, 4/4 assertions, zero failures, zero skips. This partial coverage invocation returns 1 solely because the unchanged global 100 percent gate sees only one test file; the complete raw union below is the final coverage gate.
Evidence: `repair-results.json.gz`, `repair-raw.json.gz`, `repair.log`. The test now observes and awaits genuine call-through SaveCopy and OpenStored Promises inside React act. The original operation Promise, real IndexedDB/ODS operations and all assertions are preserved. No timeout increase or storage stub was introduced.
Scope: the entire repaired file. Only this test file changed after the full run; production hashes and exact assertion identities match. Its passing current results replace that file alone in the logical acceptance accounting, without counting it twice.

Command: `node output/playwright/task51-acceptance.mjs` (saved as `evidence/acceptance.mjs`).
Result: pass. 1081 distinct files, 17377/17377 current application assertions passing, zero failures and skips. Exact-map raw union: Calc 100/100/100/100, shared 100/100/100/100, Writer 100/100/100/100 for statements/branches/functions/lines. Global totals: S 53317/53317; B 33877/33877; F 10229/10229; L 48446/48446.
Evidence: `accepted-proof.json`, `accepted-application-raw.json.gz`, `accepted-source-snapshot.json`, original per-batch raw/report archives and SHA256 checks. The acceptance script verifies all archive hashes, exact instrumentation map equality, file and assertion accounting, preserved source ownership, and zero unexpected source changes.
Scope: complete unchanged production source and the one repaired test owner. This is a complete full run plus one transparent test-only repair replay, not a claim that the original failed invocation passed.

Command: complete Playwright run and all 18 full-run stages, with exact argv recorded in `progress.json`.
Result: pass. Playwright 432/432 expected, zero unexpected/flaky/skipped, retries 0. Tooling 130/130 and inventory 123/123 pass; inventory coverage 100 percent. Formatting, lint, types, dependencies, Writer/Calc resources, docs, file size, source tree, provenance, registry, policy routing, doctor, build and static build all exit 0.
Evidence: respective stage logs and JSON archives; `browser-results.json.gz` retains final statistics.
Scope: all browser projects, actual Calc/Writer shared chrome and file workflows, DOM-free native ownership, and repository static/build gates.

Command: post-repair lint for calc-files.test.tsx, project typecheck, docs, file formatting, file size and dependency checks; exact commands and log hashes in `repair-checks.json`.
Result: pass, all six checks exit 0.
Evidence: `repair-*.log` and `repair-checks.json`.
Scope: the final test-only change. Full production/browser gates remain applicable because no production file changed after that run. No additional feature work is authorized after closure; pause the goal as requested.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T17:13:39.830Z — VERIFY — ok

By: CODER

Note: Complete application regression plus the documented single-file test-only repair replay passes 17377 current tests across 1081 distinct files. Calc/shared/Writer coverage is 100 percent S/B/F/L with exact-map and source-hash checks. Browser 432/432, tooling 130/130, inventory 123/123, all 18 full gates and six post-repair static checks pass; immutable original failure retained in evidence. Implementation ff568de0a3dc.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T17:13:11.549Z, excerpt_hash=sha256:79fbf8010e8acf119b2dfbeb64b7be010b57acf6b04da21509f78a6deb683960

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201528-MD0CQF/blueprint/resolved-snapshot.json
- old_digest: 9780d7b14c0fcb367425eb1fb7fb208fa23ebf80bee08d1a24e8a8792b40f12e
- current_digest: 9780d7b14c0fcb367425eb1fb7fb208fa23ebf80bee08d1a24e8a8792b40f12e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201528-MD0CQF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201528-MD0CQF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task implementation commit if needed; retain evidence and original checkpoint50 results. No history rewrite or source reference changes.

## Findings

Checkpoint50 regressions are repaired: contiguous native pool prefix includes protection and borders; toolbar expectations include the real shared line-style summary and enabled indent/border actions; the keyboard popup regression uses a genuinely disabled Superscript command. Added meaningful native boundary, formatting history, RTL/merge, XML/ODS failure and UI ownership tests closing all 32 originally uncovered Calc/shared owners. Shared details popup state reads the actual toggle event currentTarget; no native core behavior changed.

A first focused Calc coverage run exposed load-dependent UI waits and two stale new fixtures. Existing affected UI files passed 22/22 on serial diagnosis; new fixtures were corrected against actual native contracts. The final complete run reduced the remaining failure to one SaveCopy dialog test. That test now awaits actual operation completion through call-through observers, preserving native operations and assertions. Its four current cases pass with Istanbul. The original failed result remains in the evidence, and the final acceptance explicitly combines the complete stable-production run with the one repaired test file.

At the user request, remaining independent application batches ran as two concurrent Vitest jobs, each with one worker and isolated report/coverage directories. Six finished batches were retained; the unfinished batch alone was restarted. No subagents, threshold changes, excludes, ignore directives, skips, retry changes, timeout increases, branches, merges, network calls or feature expansion were used.

Final acceptance: 17377/17377 application tests, 432/432 browser cases, 130/130 tooling and 123/123 inventory tests. Calc, shared, Writer and aggregate Istanbul coverage are 100 percent in all four metrics. All 18 complete-run gates and six post-repair static checks pass. Raw maps, source hashes, command logs and exact current assertion accounting are retained. The user stop condition is satisfied; pause after task closure.
