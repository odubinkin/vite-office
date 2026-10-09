---
id: "202610091723-P9JYX4"
title: "Port Calc mark-data selection owner and validate full cycle"
result_summary: "verified-202610091723-P9JYX4"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 30
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T17:24:07.240Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T18:09:43.749Z"
  updated_by: "CODER"
  note: "verified-202610091723-P9JYX4"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T18:09:29.307Z"
  updated_by: "EVALUATOR"
  note: "Implementation a9c46968e44d satisfies the approved bounded ScMarkData/span owner scope, Calc actual100, portability and task10 full-test cadence with unchanged timeout closures; complete semantic/Writer-global coverage parity is not claimed."
  evaluated_sha: "a9c46968e44d6d72b84f550fb6d659fbb51bd31b"
  blueprint_digest: "7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88"
  evidence_refs:
    - ".agentplane/tasks/202610091723-P9JYX4/README.md"
    - ".agentplane/tasks/202610091723-P9JYX4/quality/20261009-180929307-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091723-P9JYX4/quality/20261009-180929307-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091723-P9JYX4/quality/20261009-180929307-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091723-P9JYX4/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/core/data/markdata.ts"
    - "apps/office/src/sc/source/core/data/markdata.test.ts"
    - "scripts/calc-markdata-native-probe.mjs"
    - "output/playwright/task10-native-final-check.log"
    - "output/playwright/task10-span-native-check.log"
    - "output/playwright/task10-calc-final.log"
    - "output/playwright/task10-full-office.log"
    - "output/playwright/task10-mdds-istanbul-closure.log"
    - "output/playwright/task10-full-inventory-coverage-retry.log"
    - "output/playwright/task10-full-browser-scenarios.log"
    - "output/playwright/task10-portable-calc.log"
    - "output/playwright/task10-portable-shared.log"
    - "output/playwright/task10-portable-inventory.log"
  findings:
    - "Reviewed original single-class/file ownership:737 physical mark-data lines (checker738) and existing823 range-list lines (checker824) remain coherent original boundaries below1000. Actual ScMultiSel, mark arrays, ranges, bool owners and shared mdds are reused; numerical document/template syntax adapters are explicit. No duplicate interval/document/string engine or Writer change."
    - "Checked committed290-sequence/1017-snapshot native fixture: every25-field selected observation and command/both-owner result remains retained; five exact pinned full-source hashes independently match. Complete unchanged native groups plus genuine dependencies and ASan/UBSan pass; independent literal mark, post-gap and borrowed-envelope regressions preserve CALC-014..016. Map-row order, selected-tab self-move and generic/lifetime bounds remain explicitly unverified."
    - "Calc96 actual100 four Istanbul metrics and upstream-absent96+5+30 pass. Full office14244 initially passed and its sole unchanged mdds timeout passes in the5-test Istanbul closure at14.15s with actual100 four-owner coverage. Inventory123 actual100,303 browser/tooling14/provenance3, TS7/full lint/format/docs/boundaries/size/tree/provenance and zero Calc/shared registry violations pass. Full global coverage suppression is transparently recorded, with user-authorized Writer coverage exemption preserved; no assertions, timeouts, thresholds, previous tests or semantic states are relaxed."
commit:
  hash: "da7b4c674c30e95be2eacec86b5e9deab8421c0e"
  message: "🔎 P9JYX4 review: Calc selection fidelity and full-cycle evidence"
comments:
  -
    author: "CODER"
    body: "Start: port complete original mark-data selection owner and span dependencies on calc, then validate native and full-cycle evidence."
  -
    author: "CODER"
    body: "Verified: verified-202610091723-P9JYX4. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-09T17:24:25.241Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port complete original mark-data selection owner and span dependencies on calc, then validate native and full-cycle evidence."
  -
    type: "verify"
    at: "2026-10-09T18:07:28.531Z"
    author: "CODER"
    state: "ok"
    note: "Defined mark-data290/1017 and span320 unchanged native comparisons pass with ASan/UBSan; Calc96 has actual100 Istanbul four metrics; portable96+5+30 passes upstream-absent. Full office14245 scenarios have passing initial-run or unchanged focused mdds closure evidence; affected shared5 actual100, inventory123 actual100, browser303, tooling14/provenance3 and all declared static gates pass. Global office coverage report was suppressed by the initial timeout and is not claimed; Writer coverage/implementation remains untouched. CALC-014..016 preserve original behavior. Task10 full-cycle checks completed without assertion/timeout/threshold changes."
  -
    type: "verify"
    at: "2026-10-09T18:09:43.749Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610091723-P9JYX4"
  -
    type: "status"
    at: "2026-10-09T18:09:43.895Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610091723-P9JYX4. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-09T18:10:30.450Z"
doc_updated_by: "CODER"
description: "Task10 of resumed cycle: complete original ScMarkData using actual ScMultiSel/range/bool/shared mdds owners; port original fstalgorithm span conversions and RowSpan/ColRowSpan values as needed; unchanged native comparison, actual100 Calc and full suite with Writer coverage left unchanged."
sections:
  Summary: "Port complete original ScMarkData selection owner over actual source-shaped dependencies; validate task10 full resumed cycle."
  Scope: "Only calc checkout/branch. User goal/resume authorizes safe local work. Add sc/inc/markdata.ts, sc/source/core/data/markdata.ts, sc/inc/fstalgorithm.ts and original RowSpan/ColRowSpan values in sc/inc/columnspanset.ts and sc/source/core/data/columnspanset.ts. Add portable tests, unchanged native probes/fixtures, runtime/provenance/capability records, calc-core and suspicious-case journal updates as needed. Reuse actual shared mdds, ScMultiSel/ScMarkArray, ScRangeList/ScRange, sheet limits and bool segments. No fake ScDocument/column/string/range/interval engines. Existing numerical document getter contracts remain adapters for original range shifting; full document core is later work. Original unordered-map envelope order and native allocation/moved pointer/lifetime differences remain explicitly bounded. No Writer implementation/coverage repairs, network writes, merges or new coverage exclusions. Full-suite validation due this task10; any unrelated failures documented and in-scope failures corrected."
  Plan: "Port complete original ScMarkData and actual span dependencies; actual100 Calc plus task10 full validation, preserving upstream behavior and Writer coverage exemption."
  Verify Steps: "Read pinned ScMarkData/header, fstalgorithm and span originals. Compare unchanged original selection operations, flags, selected tabs, simple/multi conversion, ranges/bounds, query/navigation, spans, assignments and all envelopes under ASan/UBSan using genuine dependencies; retain original literal mark_test cases and fail/output preservation. Compare all span conversion overloads including invalid/unbuilt/stale indexed trees and native boundary clipping. Ordinary tests must work without upstream/compiler/network. Run all Calc Istanbul actual100 four metrics; affected shared tests, related inventory/provenance/tooling tests; TS7/lint/format/docs/dependencies/size/source-tree/provenance and Calc/shared registry zero violations. Run full application unit scenarios, inventory coverage and tooling plus browser Writer/Calc/shared scenarios once at task10, preserve Writer coverage gaps per user and do not relax assertions or drop previous tests. Record exact native/runtime limits, outputs, failures and repairs, quality review, commits and final clean status on calc. No whole-module parity promotion from finite evidence."
  Verification: |-
    Command: node scripts/calc-markdata-native-probe.mjs --check; node scripts/calc-fstalgorithm-native-probe.mjs --check; node scripts/calc-markdata-native-probe.mjs --self-move-diagnostic.
    Result: pass.
    Evidence: 290 defined mark-data sequences/1017 complete interned observations, 256 boolean patterns/64 numerical span owners, complete unchanged pinned groups and real range/multi/bool/ref-base/mdds/Boost dependencies under ASan/UBSan. Nested actual dependency checks pass (mdds3020, bool436, multi550). Separate original libc++220106 selected-tab self-move ASan heap-use-after-free is reproduced, with no defined-outcome claim.
    Scope: original initialized selection flags/tabs/ranges, assignments/moves, conversion/export/navigation, shifts, spans, all four envelopes, actual document numerical getter adapters. Raw top/bottom map-row permutations compare as complete multisets with duplicates retained; other ordered outputs compare exactly. Allocation/ABI/pointer lifetime, custom template families and malformed/undefined states remain unverified. Evidence: output/playwright/task10-native-final-check.log, task10-span-native-check.log, task10-self-move.log.

    Command: npm run test:coverage:calc.
    Result: pass.
    Evidence: 96 tests/21 files; Istanbul actual100 statements2519/2519, branches1854/1854, functions412/412, lines2208/2208. No new coverage exclusions, dropped assertions, or altered existing tests. Evidence: output/playwright/task10-calc-final.log and apps/office/coverage/calc/coverage-summary.json.
    Scope: every Calc production owner, including complete mark-data and numerical span conversions/values.

    Command: npm run test:coverage; ../../node_modules/.bin/vitest run --config vitest.shared.config.ts --coverage --coverage.include 'src/external/mdds/**/*.ts' src/external/mdds/include/mdds/flat_segment_tree.test.ts (second command from apps/office).
    Result: initial full attempt failed solely on a30000ms shared mdds native-replay timeout; focused unchanged Istanbul closure passes.
    Evidence: full attempt14244 passed/1 timed out,539 files,816.51s; affected module5/5 passes in14.15s with unchanged30000ms timeout and100% thresholds. Complete affected four-source coverage: statements486/486, branches284/284, functions86/86, lines433/433. No application assertion mismatch. All14245 application scenarios have passing full-run or focused-closure evidence. Initial heavy native/lint/inventory concurrency is removed for closure. Evidence: output/playwright/task10-full-office.log and task10-mdds-istanbul-closure.log.
    Scope: task10 full office cadence plus actual affected shared source coverage. Vitest reportOnFailure=false suppresses full/global coverage after timeout; global/Writer coverage is not claimed from that failed attempt. User explicitly exempts Writer coverage repairs; Writer implementation and coverage configuration remain untouched.

    Command: npm run test:inventory:coverage; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/cppunit-registration-cli.test.ts -t 'runs filesystem readers and writers with owned Git and source fixtures'; npm run test:inventory:coverage.
    Result: initial full attempt times out in its unchanged30000ms filesystem fixture scenario; isolated closure and coverage-only profile retry pass.
    Evidence: isolated unchanged scenario8.29s; retry123 tests/38 files with actual100 statements1734/1734, branches1292/1292, functions436/436, lines1668/1668. Initial failed attempt emitted no report, so retry obtains the required original complete coverage totals. No thresholds, assertions, timeout or implementation changes. Evidence: output/playwright/task10-full-inventory.log, task10-inventory-timeout-closure.log, task10-full-inventory-coverage-retry.log.
    Scope: full existing inventory tools/configuration (existing V8 provider retained).

    Command: npm run test:e2e; npx playwright test --config apps/office/playwright.config.ts.
    Result: build passes; initial browser command is blocked before any scenario by occupied4173; the same unchanged browser configuration passes after the port becomes free.
    Evidence: 303/303 browser scenarios in4.4m,301 Writer and2 shared; dedicated Calc project is presently empty. Production build uses TS7 and Vite and passes static smoke. Evidence: output/playwright/task10-full-browser.log and task10-full-browser-scenarios.log.
    Scope: all existing browser projects once, no foreign server termination or configuration change. Calc browser implementation is not claimed.

    Command: npm run test:calc; npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; node_modules/.bin/vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts.
    Result: pass with both vendor reference symlinks temporarily detached and restored by EXIT trap.
    Evidence: 96 Calc,5 shared and30 inventory tests; no compiler/upstream/network needed. Original links restored and detached names absent. Evidence: output/playwright/task10-portable-calc.log, task10-portable-shared.log, task10-portable-inventory.log.
    Scope: portable acceptance over committed native fixtures and actual production owners.

    Command: npm run test:tooling; npm run test:source-provenance; npm run check:writer-resources; npm run typecheck; npm run typecheck:tools; npm run lint; scoped Prettier --check over intentional changed/new paths; node scripts/check-static-build.mjs; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
    Result: pass.
    Evidence: tooling14, provenance3, Writer resources2; TS7 application/tools and full lint pass. Documentation1138, source-tree114 required/33 retired, boundaries349 runtime/1626 relative imports/30 allowed cross-module edges, source provenance350 runtime (259 mapped/74 browser/17 local). Calc20 capabilities/141 modules and shared1/116 have zero semantic violations. Size gate scans1141 authored files and no1000-line violation; mark-data737 physical lines (checker738), modified existing range-list823 physical lines (checker824) retain original class/file ownership; probes reuse actual dependencies. Doctor zero errors/two inherited warnings, routing passes. No implementation or policy drift.
    Scope: all declared deterministic gates. Native/self-move, map ordering and template bounds are documented; finite evidence does not promote semantic/default/contract parity. CALC-014..016 retain suspicious original behavior. Task10 of resumed cadence is complete; next complete-suite cadence is ten subsequent completed tasks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T18:07:28.531Z — VERIFY — ok

    By: CODER

    Note: Defined mark-data290/1017 and span320 unchanged native comparisons pass with ASan/UBSan; Calc96 has actual100 Istanbul four metrics; portable96+5+30 passes upstream-absent. Full office14245 scenarios have passing initial-run or unchanged focused mdds closure evidence; affected shared5 actual100, inventory123 actual100, browser303, tooling14/provenance3 and all declared static gates pass. Global office coverage report was suppressed by the initial timeout and is not claimed; Writer coverage/implementation remains untouched. CALC-014..016 preserve original behavior. Task10 full-cycle checks completed without assertion/timeout/threshold changes.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T18:06:52.159Z, excerpt_hash=sha256:70750a07c861cc9046ae9d0b2bf8895d2400dc6c81eaa1035f466f8047821e9c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091723-P9JYX4/blueprint/resolved-snapshot.json
    - old_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
    - current_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091723-P9JYX4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091723-P9JYX4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-09T18:09:43.749Z — VERIFY — ok

    By: CODER

    Note: verified-202610091723-P9JYX4
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T18:07:28.587Z, excerpt_hash=sha256:70750a07c861cc9046ae9d0b2bf8895d2400dc6c81eaa1035f466f8047821e9c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091723-P9JYX4/blueprint/resolved-snapshot.json
    - old_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
    - current_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091723-P9JYX4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610091723-P9JYX4 --result verified-202610091723-P9JYX4 --commit da7b4c674c30e95be2eacec86b5e9deab8421c0e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task source/tests/probes/fixtures/registry/docs only; preserve existing common dependencies and prior selection work."
  Findings: |-
    ScMarkData is an original948-line owner. Marked row/column spans depend on original fstalgorithm templates and two numerical span value structs; implement those boundaries rather than flattening them into mark-data or duplicating shared tree logic. Selection envelopes use existing bool row/column owners and unordered maps; native order must be researched and bounded separately from range content.

    - Observation: Initial TS7 check finds the existing document getter type is exported only by the numerical address source, and literal false infers a too-narrow mdds value type.
      Impact: Core implementation is present; only import and generic type arguments require correction before comparison. ScRangeList also needs its actual default move value adapters for mark-data envelope moves.
      Resolution: Import the existing getter contract from its source and explicitly instantiate boolean trees; extend existing ScRangeList with native value/container move semantics instead of duplicating list storage. Verification scope remains complete mark-data plus actual dependencies.

    - Observation: Initial native composition verifies all reused mdds/bool/multi fixtures, then fails on a getter extraction end marker: the original name is GetMaxColCount, not MaxColCount.
      Impact: No fixture was written and no original method changed; TS7 now passes.
      Resolution: Use the exact original getter boundary and continue compiling complete mark-data and dependency groups unchanged.

    - Observation: Complete native mark-data compiles but fails linking actual ScRangeList copy/move assignment, which the reused multi-selection composition did not need.
      Impact: Native fixture remains unwritten; complete original owner comparison requires these real dependency bodies.
      Resolution: Link unchanged original ScRangeList assignment groups; retain actual SvRefBase and complete mark-data bodies. Portable tests preserve all native observations and compare unspecified top/bottom unordered-map row permutations as explicit multisets only.

    - Observation: The assignment extractor used the destructor as an end marker, but the original destructor occurs earlier in the source.
      Impact: The bounded original group lookup correctly refuses the invalid extraction; no fixture or native bodies changed.
      Resolution: End the actual adjacent assignment group at bool ScRangeList::Intersects, retaining both complete assignment bodies unchanged.

    - Observation: Unchanged original ScMarkData self-move with selected tabs triggers ASan heap-use-after-free inside native libc++220106 std::set move assignment. This is not a TypeScript comparison failure. TS7 test error separately uses ScSheetLimits without its required explicit bounds.
      Impact: Self-move cannot be certified as a defined native comparison on this runtime; other constructed cases remain pending. Keep the actual diagnostic instead of altering original methods or fabricating an expected outcome.
      Resolution: Quarantine self-move as a separately reproducible sanitizer diagnostic and document its platform/consumer limits in the suspicious journal; use defined distinct-owner moves in portable fixtures. Supply standard bounds explicitly in the literal test. No verification relaxation for defined owner behavior.

    - Observation: All94 Calc tests pass, including every282 native mark-data sequence. Coverage is2514/2527 statements,1846/1862 branches,412/412 functions and2211/2212 lines; original span native320-owner comparison also passes.
      Impact: Required actual100 Calc gate remains pending. Native assertion guards in valid envelope cursor loops add unreachable JavaScript branches; original defined loop bounds guarantee successful lookup, while native bodies keep their assertions unchanged.
      Resolution: Inspect exact missing branches, add defined native sequences for real missing paths, and express the source-proven cursor invariant directly without new guards or coverage exclusions. Retain complete fixture comparison and explicit native/runtime gaps.

    - Observation: Initial new registry checks reject empty provenance localSymbols on reexport headers; runtime semantic localSymbols intentionally remain empty for wrappers.
      Impact: Required provenance/Calc registry gates fail before validation; statuses and native evidence are unchanged.
      Resolution: List actual reexported class names in header provenance as the existing source checker requires, preserving empty wrapper runtime locals and every prior registry field/status.

    - Observation: Provenance requires literal upstream symbols; namespace-qualified sc::RowSpan/sc::ColRowSpan do not occur textually in the header, where the declarations are inside namespace sc.
      Impact: Registry gates remain pending; source owner topology, fields and evidence do not change.
      Resolution: Use exact original declaration names and method signatures in upstream-symbol fields, preserving the namespace/file mapping and all semantic statuses.

    - Observation: Literal provenance marker struct ColRowSpan omits the original SC_DLLPUBLIC macro between the tokens.
      Impact: Only new header evidence marker rejects validation; actual declarations and all native comparisons are unchanged.
      Resolution: Use exact struct SC_DLLPUBLIC ColRowSpan text and rerun the same gates without changing metadata classifications or pass criteria.

    - Observation: Full inventory run: 122 scenarios passed; the filesystem Cppunit CLI scenario exceeded its existing 30000ms timeout while full Istanbul application tests and native compilation ran concurrently. Full browser command built successfully but executed zero scenarios because port 4173 was occupied; subsequent listener inspection found the port free.
      Impact: Full-cycle evidence remains incomplete. No assertion, timeout, coverage threshold, or production behavior may be relaxed.
      Resolution: Allow the existing full application handle to finish. Repeat only the timed-out inventory scenario under its unchanged coverage/configuration and launch the browser scenarios against the already verified build once the port is free. Record exact terminal results.

    - Observation: The isolated inventory timeout closure passed unchanged: 1 passed, 1 filtered-out scenario, 8.96s total (8.29s test), existing timeout30000ms. The failed full inventory coverage attempt emitted no coverage directory/report.
      Impact: Assertions are now verified, but the required complete inventory coverage totals are still absent.
      Resolution: Repeat only the inventory coverage profile after the browser/native/lint jobs finish; this bounded retry obtains the missing original coverage report without modifying any timeouts, assertions, thresholds or source. Application full-suite passed scenarios will not be repeated merely for convenience.

    - Observation: Full application Istanbul run terminated: 14244 passed/1 failed across539 files in816.51s. The sole failure is the unchanged shared mdds native snapshot replay, which exceeded the existing30000ms timeout under initial concurrent native/lint/inventory load; no assertion mismatch was reported. Vitest default reportOnFailure=false suppressed the full application coverage report. Browser scenarios303/303 passed; inventory retry123/123 passed with actual100 all four metrics.
      Impact: Full application scenario coverage has one unresolved timeout. Calc actual100 is separately verified; no full Writer/global coverage claim can be made from the suppressed report.
      Resolution: Run the affected mdds module with unchanged Istanbul instrumentation and100% thresholds after all heavy jobs have ended, collecting only its four production source owners. Keep all original assertions and30000ms timeout. Preserve Writer coverage exemption; record the global-report limitation explicitly.

    - Observation: The exact route-oracle task complete command marked this task DONE but its generated cleanup subject was rejected with E_GIT: commit subject is too generic. Implementation a9c46968e44d and pass review da7b4c674c30 are already committed; only active-task closure metadata remains staged.
      Impact: No implementation/check failure. Final tracked state still needs a valid active-task artifact commit; message-validation criteria must remain unchanged.
      Resolution: Follow the recomputed exact artifact-cleanup route once. If the same generated subject is rejected again, persist only this task subtree through ap commit --allow-tasks with a concrete selection/full-cycle closure subject, then verify final route and clean calc status.

    - Observation: The exact recomputed ap commit --close --unstage-others retry also rejects its generated subject as too generic (E_GIT). Task remains DONE with only its own closure artifact pending; code/review/test evidence is unchanged.
      Impact: The installed automatic subject generator cannot satisfy this repository message validator. Repeating the same generator would not progress; no gate may be weakened.
      Resolution: Persist the active task artifacts using the existing approved ap commit --allow-tasks path and a concrete Calc-selection/full-cycle finalization subject; then confirm done_direct and clean calc checkout.
extensions:
  implementation_commit:
    hash: "a9c46968e44d6d72b84f550fb6d659fbb51bd31b"
    message: "🧩 P9JYX4 port: Calc mark-data selection and span owners"
id_source: "generated"
---
## Summary

Port complete original ScMarkData selection owner over actual source-shaped dependencies; validate task10 full resumed cycle.

## Scope

Only calc checkout/branch. User goal/resume authorizes safe local work. Add sc/inc/markdata.ts, sc/source/core/data/markdata.ts, sc/inc/fstalgorithm.ts and original RowSpan/ColRowSpan values in sc/inc/columnspanset.ts and sc/source/core/data/columnspanset.ts. Add portable tests, unchanged native probes/fixtures, runtime/provenance/capability records, calc-core and suspicious-case journal updates as needed. Reuse actual shared mdds, ScMultiSel/ScMarkArray, ScRangeList/ScRange, sheet limits and bool segments. No fake ScDocument/column/string/range/interval engines. Existing numerical document getter contracts remain adapters for original range shifting; full document core is later work. Original unordered-map envelope order and native allocation/moved pointer/lifetime differences remain explicitly bounded. No Writer implementation/coverage repairs, network writes, merges or new coverage exclusions. Full-suite validation due this task10; any unrelated failures documented and in-scope failures corrected.

## Plan

Port complete original ScMarkData and actual span dependencies; actual100 Calc plus task10 full validation, preserving upstream behavior and Writer coverage exemption.

## Verify Steps

Read pinned ScMarkData/header, fstalgorithm and span originals. Compare unchanged original selection operations, flags, selected tabs, simple/multi conversion, ranges/bounds, query/navigation, spans, assignments and all envelopes under ASan/UBSan using genuine dependencies; retain original literal mark_test cases and fail/output preservation. Compare all span conversion overloads including invalid/unbuilt/stale indexed trees and native boundary clipping. Ordinary tests must work without upstream/compiler/network. Run all Calc Istanbul actual100 four metrics; affected shared tests, related inventory/provenance/tooling tests; TS7/lint/format/docs/dependencies/size/source-tree/provenance and Calc/shared registry zero violations. Run full application unit scenarios, inventory coverage and tooling plus browser Writer/Calc/shared scenarios once at task10, preserve Writer coverage gaps per user and do not relax assertions or drop previous tests. Record exact native/runtime limits, outputs, failures and repairs, quality review, commits and final clean status on calc. No whole-module parity promotion from finite evidence.

## Verification

Command: node scripts/calc-markdata-native-probe.mjs --check; node scripts/calc-fstalgorithm-native-probe.mjs --check; node scripts/calc-markdata-native-probe.mjs --self-move-diagnostic.
Result: pass.
Evidence: 290 defined mark-data sequences/1017 complete interned observations, 256 boolean patterns/64 numerical span owners, complete unchanged pinned groups and real range/multi/bool/ref-base/mdds/Boost dependencies under ASan/UBSan. Nested actual dependency checks pass (mdds3020, bool436, multi550). Separate original libc++220106 selected-tab self-move ASan heap-use-after-free is reproduced, with no defined-outcome claim.
Scope: original initialized selection flags/tabs/ranges, assignments/moves, conversion/export/navigation, shifts, spans, all four envelopes, actual document numerical getter adapters. Raw top/bottom map-row permutations compare as complete multisets with duplicates retained; other ordered outputs compare exactly. Allocation/ABI/pointer lifetime, custom template families and malformed/undefined states remain unverified. Evidence: output/playwright/task10-native-final-check.log, task10-span-native-check.log, task10-self-move.log.

Command: npm run test:coverage:calc.
Result: pass.
Evidence: 96 tests/21 files; Istanbul actual100 statements2519/2519, branches1854/1854, functions412/412, lines2208/2208. No new coverage exclusions, dropped assertions, or altered existing tests. Evidence: output/playwright/task10-calc-final.log and apps/office/coverage/calc/coverage-summary.json.
Scope: every Calc production owner, including complete mark-data and numerical span conversions/values.

Command: npm run test:coverage; ../../node_modules/.bin/vitest run --config vitest.shared.config.ts --coverage --coverage.include 'src/external/mdds/**/*.ts' src/external/mdds/include/mdds/flat_segment_tree.test.ts (second command from apps/office).
Result: initial full attempt failed solely on a30000ms shared mdds native-replay timeout; focused unchanged Istanbul closure passes.
Evidence: full attempt14244 passed/1 timed out,539 files,816.51s; affected module5/5 passes in14.15s with unchanged30000ms timeout and100% thresholds. Complete affected four-source coverage: statements486/486, branches284/284, functions86/86, lines433/433. No application assertion mismatch. All14245 application scenarios have passing full-run or focused-closure evidence. Initial heavy native/lint/inventory concurrency is removed for closure. Evidence: output/playwright/task10-full-office.log and task10-mdds-istanbul-closure.log.
Scope: task10 full office cadence plus actual affected shared source coverage. Vitest reportOnFailure=false suppresses full/global coverage after timeout; global/Writer coverage is not claimed from that failed attempt. User explicitly exempts Writer coverage repairs; Writer implementation and coverage configuration remain untouched.

Command: npm run test:inventory:coverage; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/cppunit-registration-cli.test.ts -t 'runs filesystem readers and writers with owned Git and source fixtures'; npm run test:inventory:coverage.
Result: initial full attempt times out in its unchanged30000ms filesystem fixture scenario; isolated closure and coverage-only profile retry pass.
Evidence: isolated unchanged scenario8.29s; retry123 tests/38 files with actual100 statements1734/1734, branches1292/1292, functions436/436, lines1668/1668. Initial failed attempt emitted no report, so retry obtains the required original complete coverage totals. No thresholds, assertions, timeout or implementation changes. Evidence: output/playwright/task10-full-inventory.log, task10-inventory-timeout-closure.log, task10-full-inventory-coverage-retry.log.
Scope: full existing inventory tools/configuration (existing V8 provider retained).

Command: npm run test:e2e; npx playwright test --config apps/office/playwright.config.ts.
Result: build passes; initial browser command is blocked before any scenario by occupied4173; the same unchanged browser configuration passes after the port becomes free.
Evidence: 303/303 browser scenarios in4.4m,301 Writer and2 shared; dedicated Calc project is presently empty. Production build uses TS7 and Vite and passes static smoke. Evidence: output/playwright/task10-full-browser.log and task10-full-browser-scenarios.log.
Scope: all existing browser projects once, no foreign server termination or configuration change. Calc browser implementation is not claimed.

Command: npm run test:calc; npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; node_modules/.bin/vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts.
Result: pass with both vendor reference symlinks temporarily detached and restored by EXIT trap.
Evidence: 96 Calc,5 shared and30 inventory tests; no compiler/upstream/network needed. Original links restored and detached names absent. Evidence: output/playwright/task10-portable-calc.log, task10-portable-shared.log, task10-portable-inventory.log.
Scope: portable acceptance over committed native fixtures and actual production owners.

Command: npm run test:tooling; npm run test:source-provenance; npm run check:writer-resources; npm run typecheck; npm run typecheck:tools; npm run lint; scoped Prettier --check over intentional changed/new paths; node scripts/check-static-build.mjs; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
Result: pass.
Evidence: tooling14, provenance3, Writer resources2; TS7 application/tools and full lint pass. Documentation1138, source-tree114 required/33 retired, boundaries349 runtime/1626 relative imports/30 allowed cross-module edges, source provenance350 runtime (259 mapped/74 browser/17 local). Calc20 capabilities/141 modules and shared1/116 have zero semantic violations. Size gate scans1141 authored files and no1000-line violation; mark-data737 physical lines (checker738), modified existing range-list823 physical lines (checker824) retain original class/file ownership; probes reuse actual dependencies. Doctor zero errors/two inherited warnings, routing passes. No implementation or policy drift.
Scope: all declared deterministic gates. Native/self-move, map ordering and template bounds are documented; finite evidence does not promote semantic/default/contract parity. CALC-014..016 retain suspicious original behavior. Task10 of resumed cadence is complete; next complete-suite cadence is ten subsequent completed tasks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T18:07:28.531Z — VERIFY — ok

By: CODER

Note: Defined mark-data290/1017 and span320 unchanged native comparisons pass with ASan/UBSan; Calc96 has actual100 Istanbul four metrics; portable96+5+30 passes upstream-absent. Full office14245 scenarios have passing initial-run or unchanged focused mdds closure evidence; affected shared5 actual100, inventory123 actual100, browser303, tooling14/provenance3 and all declared static gates pass. Global office coverage report was suppressed by the initial timeout and is not claimed; Writer coverage/implementation remains untouched. CALC-014..016 preserve original behavior. Task10 full-cycle checks completed without assertion/timeout/threshold changes.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T18:06:52.159Z, excerpt_hash=sha256:70750a07c861cc9046ae9d0b2bf8895d2400dc6c81eaa1035f466f8047821e9c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091723-P9JYX4/blueprint/resolved-snapshot.json
- old_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
- current_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091723-P9JYX4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091723-P9JYX4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-09T18:09:43.749Z — VERIFY — ok

By: CODER

Note: verified-202610091723-P9JYX4
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T18:07:28.587Z, excerpt_hash=sha256:70750a07c861cc9046ae9d0b2bf8895d2400dc6c81eaa1035f466f8047821e9c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091723-P9JYX4/blueprint/resolved-snapshot.json
- old_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
- current_digest: 7410028bb6f3c62674635c7860ec8618613845c47f7f8e5aa2f6f743cae95e88
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091723-P9JYX4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610091723-P9JYX4 --result verified-202610091723-P9JYX4 --commit da7b4c674c30e95be2eacec86b5e9deab8421c0e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task source/tests/probes/fixtures/registry/docs only; preserve existing common dependencies and prior selection work.

## Findings

ScMarkData is an original948-line owner. Marked row/column spans depend on original fstalgorithm templates and two numerical span value structs; implement those boundaries rather than flattening them into mark-data or duplicating shared tree logic. Selection envelopes use existing bool row/column owners and unordered maps; native order must be researched and bounded separately from range content.

- Observation: Initial TS7 check finds the existing document getter type is exported only by the numerical address source, and literal false infers a too-narrow mdds value type.
  Impact: Core implementation is present; only import and generic type arguments require correction before comparison. ScRangeList also needs its actual default move value adapters for mark-data envelope moves.
  Resolution: Import the existing getter contract from its source and explicitly instantiate boolean trees; extend existing ScRangeList with native value/container move semantics instead of duplicating list storage. Verification scope remains complete mark-data plus actual dependencies.

- Observation: Initial native composition verifies all reused mdds/bool/multi fixtures, then fails on a getter extraction end marker: the original name is GetMaxColCount, not MaxColCount.
  Impact: No fixture was written and no original method changed; TS7 now passes.
  Resolution: Use the exact original getter boundary and continue compiling complete mark-data and dependency groups unchanged.

- Observation: Complete native mark-data compiles but fails linking actual ScRangeList copy/move assignment, which the reused multi-selection composition did not need.
  Impact: Native fixture remains unwritten; complete original owner comparison requires these real dependency bodies.
  Resolution: Link unchanged original ScRangeList assignment groups; retain actual SvRefBase and complete mark-data bodies. Portable tests preserve all native observations and compare unspecified top/bottom unordered-map row permutations as explicit multisets only.

- Observation: The assignment extractor used the destructor as an end marker, but the original destructor occurs earlier in the source.
  Impact: The bounded original group lookup correctly refuses the invalid extraction; no fixture or native bodies changed.
  Resolution: End the actual adjacent assignment group at bool ScRangeList::Intersects, retaining both complete assignment bodies unchanged.

- Observation: Unchanged original ScMarkData self-move with selected tabs triggers ASan heap-use-after-free inside native libc++220106 std::set move assignment. This is not a TypeScript comparison failure. TS7 test error separately uses ScSheetLimits without its required explicit bounds.
  Impact: Self-move cannot be certified as a defined native comparison on this runtime; other constructed cases remain pending. Keep the actual diagnostic instead of altering original methods or fabricating an expected outcome.
  Resolution: Quarantine self-move as a separately reproducible sanitizer diagnostic and document its platform/consumer limits in the suspicious journal; use defined distinct-owner moves in portable fixtures. Supply standard bounds explicitly in the literal test. No verification relaxation for defined owner behavior.

- Observation: All94 Calc tests pass, including every282 native mark-data sequence. Coverage is2514/2527 statements,1846/1862 branches,412/412 functions and2211/2212 lines; original span native320-owner comparison also passes.
  Impact: Required actual100 Calc gate remains pending. Native assertion guards in valid envelope cursor loops add unreachable JavaScript branches; original defined loop bounds guarantee successful lookup, while native bodies keep their assertions unchanged.
  Resolution: Inspect exact missing branches, add defined native sequences for real missing paths, and express the source-proven cursor invariant directly without new guards or coverage exclusions. Retain complete fixture comparison and explicit native/runtime gaps.

- Observation: Initial new registry checks reject empty provenance localSymbols on reexport headers; runtime semantic localSymbols intentionally remain empty for wrappers.
  Impact: Required provenance/Calc registry gates fail before validation; statuses and native evidence are unchanged.
  Resolution: List actual reexported class names in header provenance as the existing source checker requires, preserving empty wrapper runtime locals and every prior registry field/status.

- Observation: Provenance requires literal upstream symbols; namespace-qualified sc::RowSpan/sc::ColRowSpan do not occur textually in the header, where the declarations are inside namespace sc.
  Impact: Registry gates remain pending; source owner topology, fields and evidence do not change.
  Resolution: Use exact original declaration names and method signatures in upstream-symbol fields, preserving the namespace/file mapping and all semantic statuses.

- Observation: Literal provenance marker struct ColRowSpan omits the original SC_DLLPUBLIC macro between the tokens.
  Impact: Only new header evidence marker rejects validation; actual declarations and all native comparisons are unchanged.
  Resolution: Use exact struct SC_DLLPUBLIC ColRowSpan text and rerun the same gates without changing metadata classifications or pass criteria.

- Observation: Full inventory run: 122 scenarios passed; the filesystem Cppunit CLI scenario exceeded its existing 30000ms timeout while full Istanbul application tests and native compilation ran concurrently. Full browser command built successfully but executed zero scenarios because port 4173 was occupied; subsequent listener inspection found the port free.
  Impact: Full-cycle evidence remains incomplete. No assertion, timeout, coverage threshold, or production behavior may be relaxed.
  Resolution: Allow the existing full application handle to finish. Repeat only the timed-out inventory scenario under its unchanged coverage/configuration and launch the browser scenarios against the already verified build once the port is free. Record exact terminal results.

- Observation: The isolated inventory timeout closure passed unchanged: 1 passed, 1 filtered-out scenario, 8.96s total (8.29s test), existing timeout30000ms. The failed full inventory coverage attempt emitted no coverage directory/report.
  Impact: Assertions are now verified, but the required complete inventory coverage totals are still absent.
  Resolution: Repeat only the inventory coverage profile after the browser/native/lint jobs finish; this bounded retry obtains the missing original coverage report without modifying any timeouts, assertions, thresholds or source. Application full-suite passed scenarios will not be repeated merely for convenience.

- Observation: Full application Istanbul run terminated: 14244 passed/1 failed across539 files in816.51s. The sole failure is the unchanged shared mdds native snapshot replay, which exceeded the existing30000ms timeout under initial concurrent native/lint/inventory load; no assertion mismatch was reported. Vitest default reportOnFailure=false suppressed the full application coverage report. Browser scenarios303/303 passed; inventory retry123/123 passed with actual100 all four metrics.
  Impact: Full application scenario coverage has one unresolved timeout. Calc actual100 is separately verified; no full Writer/global coverage claim can be made from the suppressed report.
  Resolution: Run the affected mdds module with unchanged Istanbul instrumentation and100% thresholds after all heavy jobs have ended, collecting only its four production source owners. Keep all original assertions and30000ms timeout. Preserve Writer coverage exemption; record the global-report limitation explicitly.

- Observation: The exact route-oracle task complete command marked this task DONE but its generated cleanup subject was rejected with E_GIT: commit subject is too generic. Implementation a9c46968e44d and pass review da7b4c674c30 are already committed; only active-task closure metadata remains staged.
  Impact: No implementation/check failure. Final tracked state still needs a valid active-task artifact commit; message-validation criteria must remain unchanged.
  Resolution: Follow the recomputed exact artifact-cleanup route once. If the same generated subject is rejected again, persist only this task subtree through ap commit --allow-tasks with a concrete selection/full-cycle closure subject, then verify final route and clean calc status.

- Observation: The exact recomputed ap commit --close --unstage-others retry also rejects its generated subject as too generic (E_GIT). Task remains DONE with only its own closure artifact pending; code/review/test evidence is unchanged.
  Impact: The installed automatic subject generator cannot satisfy this repository message validator. Repeating the same generator would not progress; no gate may be weakened.
  Resolution: Persist the active task artifacts using the existing approved ap commit --allow-tasks path and a concrete Calc-selection/full-cycle finalization subject; then confirm done_direct and clean calc checkout.
