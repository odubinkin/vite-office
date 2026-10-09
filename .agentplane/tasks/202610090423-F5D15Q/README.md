---
id: "202610090423-F5D15Q"
title: "Repair table Undo acceptance tests for native row lifetime"
result_summary: "Repaired four native table Undo acceptance failures in three files without production changes;111related cases pass, old registrations released, historical full report retained; stopping for requested work-format change."
status: "DONE"
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
  updated_at: "2026-10-09T04:24:46.701Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T04:31:52.790Z"
  updated_by: "CODER"
  note: "Verified111/111targeted related cases, all4full247failed identifiers now pass. Six upstream-absent static checks pass and upstream restored; unchanged production retains entire exact-source246app/inventory all-four100certificates. Partial global-threshold CLI exit1 and full247 historical failures remain recorded. Same-agent non-independent EVALUATOR pass at actualtest-fix1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5; pause after repair closure."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T04:31:21.678Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent read-only review passes targeted native lifetime remediation at actual test-fix commit1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5; four failed identifiers now pass within111cases,6static checks and exact-source whole-map coverage certificates pass."
  evaluated_sha: "1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5"
  blueprint_digest: "02a30da43e9a911c1add62d9255344a927fd7b0f3ccb133c56ee872b18063f69"
  evidence_refs:
    - ".agentplane/tasks/202610090423-F5D15Q/README.md"
    - ".agentplane/tasks/202610090423-F5D15Q/quality/20261009-043121678-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090423-F5D15Q/quality/20261009-043121678-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090423-F5D15Q/quality/20261009-043121678-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090423-F5D15Q/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610090423-F5D15Q/evidence/source-contract.json"
    - ".agentplane/tasks/202610090423-F5D15Q/evidence/repair-validation.json"
    - ".agentplane/tasks/202610090423-F5D15Q/evidence/targeted-profile.json"
  findings:
    - "Pre-Undo snapshots retain complete format comparisons and original identity/content/cursor/history/DOM assertions; released row/cell registrations are explicitly checked. Three acceptance migrations only; production/metadata and663other acceptance files unchanged."
    - "Recomputed whole246map/proof digests and current source hashes, and derived summaries agree100/all-four. Targeted CLI global threshold exit1/raw partial coverage remains recorded; historical247failed profile is not claimedgreen or rewritten."
commit:
  hash: "1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5"
  message: "🧩 F5D15Q code: capture native table values before Undo destruction"
comments:
  -
    author: "CODER"
    body: "Start: repair four full247 acceptance failures using pre-Undo value snapshots and native released-registration assertions; validate related tests once upstream absent, retain exact-source coverage evidence then pause under updated human instruction."
  -
    author: "CODER"
    body: "Verified: four full247 failures resolved by native lifetime acceptance snapshots;111related cases and6static checks pass upstream absent, complete unchanged-source coverage certificates all-four100; pause after repair under updated human instruction."
events:
  -
    type: "status"
    at: "2026-10-09T04:24:47.189Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: repair four full247 acceptance failures using pre-Undo value snapshots and native released-registration assertions; validate related tests once upstream absent, retain exact-source coverage evidence then pause under updated human instruction."
  -
    type: "verify"
    at: "2026-10-09T04:31:52.790Z"
    author: "CODER"
    state: "ok"
    note: "Verified111/111targeted related cases, all4full247failed identifiers now pass. Six upstream-absent static checks pass and upstream restored; unchanged production retains entire exact-source246app/inventory all-four100certificates. Partial global-threshold CLI exit1 and full247 historical failures remain recorded. Same-agent non-independent EVALUATOR pass at actualtest-fix1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5; pause after repair closure."
  -
    type: "status"
    at: "2026-10-09T04:32:31.994Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: four full247 failures resolved by native lifetime acceptance snapshots;111related cases and6static checks pass upstream absent, complete unchanged-source coverage certificates all-four100; pause after repair under updated human instruction."
doc_version: 3
doc_updated_at: "2026-10-09T04:32:31.996Z"
doc_updated_by: "CODER"
description: "Resolve four full247 failures by comparing live Redo rows/cells with values captured before native destruction; assert old registrations are released, retain all existing behavior assertions, validate targeted native table history tests once upstream absent and pause after remediation."
sections:
  Summary: "Repair four full247 table Undo failures by respecting native destroyed-row lifetime, then pause as the user requested."
  Scope: "Only native-table-tab.test.tsx, native-row-insertion.test.ts and native-insert-table-history.test.ts; new248 task subtree and exact parent Findings append. Production/metadata/other acceptance files unchanged."
  Plan: "Repair exactly three acceptance files implicated in four full247 failures. Capture independent row/cell format values while original owners are live, compare Redo owners with those values, and explicitly assert old Writer registrations were released by Undo. Preserve all remaining identity/content/cursor/history/DOM assertions and every unrelated test/source/metadata byte. Pinned SwTableLine destructor and KillEmptyFrameFormat confirm destroying native rows/formats; do not revive disposed owners or add fallback adapters. One targeted upstream-absent run covers changed tests and related native row/table/format lifetime history modules; build/static plus scoped format/lint/typecheck and source-bound coverage certification100/all-four. Production is unchanged, so prior246 entire actual coverage maps may be reused only after exact current source hashes and whole map/proof digest validation; retain full247 raw failures/coverage truth. No network/global/subagents, no upstream/raw source/results/maps/scripts/Python in AP, no full replay. Record bounded evidence and exact parent prefix append, complete repair leaf then pause under user's updated instruction."
  Verify Steps: |-
    1. Inspect pinned SwTableLine::~SwTableLine and KillEmptyFrameFormat and actual RemoveTableRow/SwClient.Dispose; record identifier/hash anchors only. Capture baseline hashes for unchanged production/metadata and all666 acceptance files.
    2. Migrate only three implicated acceptance files: snapshot complete independent row/cell values and paragraph style before Undo; retain Redo identity/attributes/content/cursor/DOM/history assertions and assert removed row/box GetRegisteredIn becomes undefined. No test removals/skips/only or production edits.
    3. Once upstream physically absent, run scoped Prettier/ESLint, app/tools typecheck, build/static, and targeted app tests with V8 coverage reportOnFailure/json reporters for the changed3files plus related native format/history/table modules. Restore upstream in finally. Resolve actual failures within approved remediation scope; do not replay the complete full suite.
    4. Require all selected cases pass and source-bound app/inventory100 lines/statements/functions/branches. Unchanged production can retain entire prior246 actual certificate only after source-by-source bytes and raw map/proof digests match; never normalize counters or hide247 failures. Save raw evidence/scripts/maps/snapshots only ignored app cache. Record exact case counts and source preservation.
    5. ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check; source-size/AP artifact census and exact parent prefix append pass. Record verified repair with actual test-fix commit; retain247 historical failed profile/rework evidence. Stop and pause goal after successful remediation, without new implementation tasks.
  Verification: |-
    Result: pass for targeted remediation. One upstream-absent profile executed21 related acceptance files:111passed,0failed,0skipped,0unhandled errors. All four exact full247 failed identifiers now pass. Scoped Prettier/ESLint, complete app/tools typecheck, build/static, JSDoc and source-size checks pass. Upstream restored finally at exact pin. Full suite not replayed. Targeted raw coverage CLI exits1 because the unchanged global100threshold applies to a partial selection(42.47lines/40.77statements/45.87functions/29.42branches); that outcome remains intact in targeted-profile.json. Entire246 verified actual app318files and inventory38files maps/counters retained only after complete current source hashes and whole prior map/proof digests match. Source-bound all-four100: app18105lines/19876statements/4554functions/14568branches; inventory1464/1523/384/1081. Production and metadata unchanged; exactly3acceptance files migrated,663other acceptance files byte-identical. Doctor/routing/diff pass with only2historical doctor warnings. Evidence: source-contract.json, targeted-profile.json and repair-validation.json. Pause goal after meaningful repair commit and lifecycle closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T04:31:52.790Z — VERIFY — ok

    By: CODER

    Note: Verified111/111targeted related cases, all4full247failed identifiers now pass. Six upstream-absent static checks pass and upstream restored; unchanged production retains entire exact-source246app/inventory all-four100certificates. Partial global-threshold CLI exit1 and full247 historical failures remain recorded. Same-agent non-independent EVALUATOR pass at actualtest-fix1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5; pause after repair closure.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T04:30:16.702Z, excerpt_hash=sha256:ac69eb4212b3ca765d805455b5ec2954984bfc733cc9b3c2e1de57bb5264138d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610090423-F5D15Q/blueprint/resolved-snapshot.json
    - old_digest: 02a30da43e9a911c1add62d9255344a927fd7b0f3ccb133c56ee872b18063f69
    - current_digest: 02a30da43e9a911c1add62d9255344a927fd7b0f3ccb133c56ee872b18063f69
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090423-F5D15Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090423-F5D15Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the three scoped acceptance migrations if invalid. Restore upstream in finally. Preserve historical full247 results and current changes; no destructive history operations."
  Findings: "Updated human instruction supersedes earlier prohibition on fixes after full247. Diagnosis: tests dereferenced row/cell attributes after Undo destroys their native clients/formats. Pinned SwTableLine destructor and KillEmptyFrameFormat, plus local RemoveTableRow and SwClient.Dispose, establish the lifetime contract. The correction changes expected-value acquisition to independent pre-Undo snapshots while retaining original identities, contents, cursor, DOM, insertion direction and repeated Undo/Redo checks. Added explicit released-registration assertions for removed row/cell owners. No fallback, retained disposed format or production behavior change. Command: exact seven upstream-absent commands in targeted-profile.json; Result:111actual assertions pass plus6static checks pass. Global partial-selection threshold exit1 is recorded honestly, and entire prior source-byte-identical maps provide a separate cumulative100certificate; no counter edits/map transfers/skips. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence: repair-validation.json; Scope:3changed native acceptance files plus bounded task artifacts/parent append. Source-size and JSDoc checks pass. Historical247 report and raw maps retain their original failures/coverage; repair does not claim another full green run. Broad goal incomplete; stop after remediation under explicit user instruction."
id_source: "generated"
---
## Summary

Repair four full247 table Undo failures by respecting native destroyed-row lifetime, then pause as the user requested.

## Scope

Only native-table-tab.test.tsx, native-row-insertion.test.ts and native-insert-table-history.test.ts; new248 task subtree and exact parent Findings append. Production/metadata/other acceptance files unchanged.

## Plan

Repair exactly three acceptance files implicated in four full247 failures. Capture independent row/cell format values while original owners are live, compare Redo owners with those values, and explicitly assert old Writer registrations were released by Undo. Preserve all remaining identity/content/cursor/history/DOM assertions and every unrelated test/source/metadata byte. Pinned SwTableLine destructor and KillEmptyFrameFormat confirm destroying native rows/formats; do not revive disposed owners or add fallback adapters. One targeted upstream-absent run covers changed tests and related native row/table/format lifetime history modules; build/static plus scoped format/lint/typecheck and source-bound coverage certification100/all-four. Production is unchanged, so prior246 entire actual coverage maps may be reused only after exact current source hashes and whole map/proof digest validation; retain full247 raw failures/coverage truth. No network/global/subagents, no upstream/raw source/results/maps/scripts/Python in AP, no full replay. Record bounded evidence and exact parent prefix append, complete repair leaf then pause under user's updated instruction.

## Verify Steps

1. Inspect pinned SwTableLine::~SwTableLine and KillEmptyFrameFormat and actual RemoveTableRow/SwClient.Dispose; record identifier/hash anchors only. Capture baseline hashes for unchanged production/metadata and all666 acceptance files.
2. Migrate only three implicated acceptance files: snapshot complete independent row/cell values and paragraph style before Undo; retain Redo identity/attributes/content/cursor/DOM/history assertions and assert removed row/box GetRegisteredIn becomes undefined. No test removals/skips/only or production edits.
3. Once upstream physically absent, run scoped Prettier/ESLint, app/tools typecheck, build/static, and targeted app tests with V8 coverage reportOnFailure/json reporters for the changed3files plus related native format/history/table modules. Restore upstream in finally. Resolve actual failures within approved remediation scope; do not replay the complete full suite.
4. Require all selected cases pass and source-bound app/inventory100 lines/statements/functions/branches. Unchanged production can retain entire prior246 actual certificate only after source-by-source bytes and raw map/proof digests match; never normalize counters or hide247 failures. Save raw evidence/scripts/maps/snapshots only ignored app cache. Record exact case counts and source preservation.
5. ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check; source-size/AP artifact census and exact parent prefix append pass. Record verified repair with actual test-fix commit; retain247 historical failed profile/rework evidence. Stop and pause goal after successful remediation, without new implementation tasks.

## Verification

Result: pass for targeted remediation. One upstream-absent profile executed21 related acceptance files:111passed,0failed,0skipped,0unhandled errors. All four exact full247 failed identifiers now pass. Scoped Prettier/ESLint, complete app/tools typecheck, build/static, JSDoc and source-size checks pass. Upstream restored finally at exact pin. Full suite not replayed. Targeted raw coverage CLI exits1 because the unchanged global100threshold applies to a partial selection(42.47lines/40.77statements/45.87functions/29.42branches); that outcome remains intact in targeted-profile.json. Entire246 verified actual app318files and inventory38files maps/counters retained only after complete current source hashes and whole prior map/proof digests match. Source-bound all-four100: app18105lines/19876statements/4554functions/14568branches; inventory1464/1523/384/1081. Production and metadata unchanged; exactly3acceptance files migrated,663other acceptance files byte-identical. Doctor/routing/diff pass with only2historical doctor warnings. Evidence: source-contract.json, targeted-profile.json and repair-validation.json. Pause goal after meaningful repair commit and lifecycle closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T04:31:52.790Z — VERIFY — ok

By: CODER

Note: Verified111/111targeted related cases, all4full247failed identifiers now pass. Six upstream-absent static checks pass and upstream restored; unchanged production retains entire exact-source246app/inventory all-four100certificates. Partial global-threshold CLI exit1 and full247 historical failures remain recorded. Same-agent non-independent EVALUATOR pass at actualtest-fix1dc9e0dc2cbb18fc8d50b6b88663dde219a0d9b5; pause after repair closure.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T04:30:16.702Z, excerpt_hash=sha256:ac69eb4212b3ca765d805455b5ec2954984bfc733cc9b3c2e1de57bb5264138d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610090423-F5D15Q/blueprint/resolved-snapshot.json
- old_digest: 02a30da43e9a911c1add62d9255344a927fd7b0f3ccb133c56ee872b18063f69
- current_digest: 02a30da43e9a911c1add62d9255344a927fd7b0f3ccb133c56ee872b18063f69
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090423-F5D15Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090423-F5D15Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the three scoped acceptance migrations if invalid. Restore upstream in finally. Preserve historical full247 results and current changes; no destructive history operations.

## Findings

Updated human instruction supersedes earlier prohibition on fixes after full247. Diagnosis: tests dereferenced row/cell attributes after Undo destroys their native clients/formats. Pinned SwTableLine destructor and KillEmptyFrameFormat, plus local RemoveTableRow and SwClient.Dispose, establish the lifetime contract. The correction changes expected-value acquisition to independent pre-Undo snapshots while retaining original identities, contents, cursor, DOM, insertion direction and repeated Undo/Redo checks. Added explicit released-registration assertions for removed row/cell owners. No fallback, retained disposed format or production behavior change. Command: exact seven upstream-absent commands in targeted-profile.json; Result:111actual assertions pass plus6static checks pass. Global partial-selection threshold exit1 is recorded honestly, and entire prior source-byte-identical maps provide a separate cumulative100certificate; no counter edits/map transfers/skips. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence: repair-validation.json; Scope:3changed native acceptance files plus bounded task artifacts/parent append. Source-size and JSDoc checks pass. Historical247 report and raw maps retain their original failures/coverage; repair does not claim another full green run. Broad goal incomplete; stop after remediation under explicit user instruction.
