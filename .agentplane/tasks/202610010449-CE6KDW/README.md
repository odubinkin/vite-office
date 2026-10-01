---
id: "202610010449-CE6KDW"
title: "Restore node-owned Writer numbering lifecycle"
result_summary: "verified-202610010449-CE6KDW"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T04:50:24.532Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T05:27:56.814Z"
  updated_by: "CODER"
  note: "verified-202610010449-CE6KDW"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T05:27:11.738Z"
  updated_by: "EVALUATOR"
  note: "Approved shown numbering ownership correction meets its bounded contracts at actual implementation14f848e71c7bafc67bc82230343fa9e16b9969ce;finish child,keep global parity goal active."
  evaluated_sha: "14f848e71c7bafc67bc82230343fa9e16b9969ce"
  blueprint_digest: "69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623"
  evidence_refs:
    - ".agentplane/tasks/202610010449-CE6KDW/README.md"
    - ".agentplane/tasks/202610010449-CE6KDW/quality/20261001-052711738-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610010449-CE6KDW/quality/20261001-052711738-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610010449-CE6KDW/quality/20261001-052711738-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610010449-CE6KDW/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610010449-CE6KDW/baseline.json"
    - ".agentplane/tasks/202610010449-CE6KDW/native-oracle.py"
    - ".agentplane/tasks/202610010449-CE6KDW/comparison.json"
    - ".agentplane/tasks/202610010449-CE6KDW/verify-final.log"
    - "apps/office/src/sw/source/core/txtnode/node-numbering-lifecycle.test.ts"
    - "apps/office/src/sw/source/core/doc/DocumentListItemsManager.test.ts"
  findings:
    - "SwTextNode owns records;SwList allocation/map and manager registration wrappers removed. PreAdd/PostRemove retain rule bindings and native memberships. Attr list/rule changes detach before mutation;lazy prefix reads no longer validate unrelated tails."
    - "Full unmodified native20 owner/registry definitions and37 tree/list definitions compare120 sequences/8976 actual owner states;literal guards,record identities,moves/deletes/copies,clients,registry and real ODT/Worker/undo coverage independently support the implementation."
    - "Unchanged full verify32678 exit0:668+109 tests,19 browser scenarios,both global100% coverage gates and all static/resource/docs/source/invariant/parity checks pass. Failure evidence preserved;no ignored/changed thresholds or IO tests."
commit:
  hash: "14f848e71c7bafc67bc82230343fa9e16b9969ce"
  message: "🧩 CE6KDW code: restore text-owned Writer numbering lifecycle"
comments:
  -
    author: "CODER"
    body: "Start: approved persistent parity goal;restore shown text-node numbering ownership,rule/document registration and native lazy getters;preserve document IO exceptions and gates."
  -
    author: "CODER"
    body: "Verified: verified-202610010449-CE6KDW. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-01T04:50:25.210Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved persistent parity goal;restore shown text-node numbering ownership,rule/document registration and native lazy getters;preserve document IO exceptions and gates."
  -
    type: "verify"
    at: "2026-10-01T05:25:47.449Z"
    author: "CODER"
    state: "ok"
    note: "Native20+37 definitions;120 sequences/8976 owner states match. Full unchanged verify32678 exit0:668+109 tests,19 browser scenarios,both coverage gates100%,all resource/static/docs/source/provenance/invariant/parity gates. Doctor0 errors,two existing warnings;routing/diff clean. Shown numbering ownership/registration/lazy reads only;IO exceptions and all residual parity obligations preserved."
  -
    type: "verify"
    at: "2026-10-01T05:27:56.814Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610010449-CE6KDW"
  -
    type: "status"
    at: "2026-10-01T05:27:56.964Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610010449-CE6KDW. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-01T05:27:56.965Z"
doc_updated_by: "CODER"
description: "Iteration36 of approved persistent parity goal:SwTextNode owns shown SwNodeNum with native AddToList/RemoveFromList/GetNum/vector contracts,SwNodeNum rule/document registration hooks and non-owning SwList topology. Remove full-list read validation and ownership wrappers;preserve registered document IO exceptions and unchanged gates."
sections:
  Summary: "Iteration36 of the user-authorized parity goal:restore shown SwTextNode numbering ownership,typed lifecycle and lazy reads with rule/document registrations;remove SwList item allocation/map ownership and generic registration wrappers."
  Scope: "Runtime:sw/source/core/txtnode/ndtxt.ts,SwNumberTree/SwNodeNum.ts,SwNumberTree.ts,doc/list.ts,number.ts,doc.ts,DocumentListsManager.ts,new DocumentListItemsManager.ts,docnode/nodes.ts;sw/browser/filter/xml/writer-document-codec.ts and sw/source/filter/xml/xmlimp.ts registration call sites. Tests:new node-numbering-lifecycle.test.ts,new DocumentListItemsManager.test.ts,existing ndtxt/doc/list/list-invariants/number/SwNumberTree suites and impacted ODT assertions only when source-stale. Task-local baseline/native probes;bounded runtime-inventory/source-provenance including the new source-owned manager. Existing shown document-node hierarchical Arabic/bullet slice. Native layout expansion,redline/undo-node arrays,full callback/word-count/lifetime platform machinery,legacy/default factories remain explicit separate obligations. Preserve registered save/open/recovery deviations,Worker16/ODF1.3,all gates;no blanket status/default/goal promotion."
  Plan: "1. Capture actual owner/read/rule baseline. 2. Compile unmodified native lifecycle,registration and getter methods with explicit platform adapters. 3. Transfer shown record ownership to SwTextNode and rule/registry hooks to SwNodeNum;SwList owns only roots and references. Remove full-list reads and registration wrappers;reconcile document/ODT/copy/move lifecycle. 4. Add native/literal identity and membership evidence with bounded metadata for new manager. 5. Focused checks,full unchanged verify,real implementation SHA/evaluator/finish child/update active parent. Owner CODER;one correction;existing IO deviations preserved;authorization from persistent goal."
  Verify Steps: "Run actual baseline for missing GetNum/vector/lifecycle ownership APIs,whole-list counter read validating unrelated tails and detached records reading current text rule rather than retained native rule. Compile full unmodified pinned GetNum/GetNumberVector/IsInList/FindList/AddToList/RemoveFromList plus PreAdd/PostRemove/ChangeNumRule/Create,rule membership and document registry methods with explicit single-shown/no-layout/no-redline/doc-node/platform dependencies;record adapters and source body identity. Compare actual owner/tree/rule/registry objects for add/remove/readd,duplicate add,level/restart/counted/list/rule changes,detach/reinsert/move/delete/copy,Arabic/bullet,rule membership ordering/duplicate suppression,numbered registry filtering,and reverse/prefix-only reads with literal vectors/counters/labels and independent copies. Include genuine ODT/Worker/undo suites. Focused tests/lint/types/docs/provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/static/resource/source/invariant gates. Doctor,routing,diff,real code SHA,evaluator pass and clean final checkout required;no weakened/skipped gates."
  Verification: |-
    PASS. Baseline persisted before edits. Native oracle session80179 compiles20 additional full unmodified owner/registration methods alongside37 retained native tree/list definitions;explicit shown/doc-node/no-layout/no-redline/platform dependencies and byte identity checks. Actual compare-native.ts matches120 sequences/8976 owner states,including lazy raw prefix,reverse vectors,bound rules,rule client order and numbered registry. Focused25+new5 lifecycle/registry tests and native guard coverage pass;genuine ODT/Worker/undo pass in full suite. Unchanged npm run verify session32678 exit0;verify-final.log:668 application tests/149 files,109 inventory tests/36 files,19 browser scenarios20.3s. Both global coverage gates100%:application10199 statements/7699 branches/2798 functions/9366 lines;inventory1523/1080/384/1464. Format,lint,types,module/resource gates,static build,JSDoc457,file-size,source-tree111/33,provenance205/129,invariants,parity semantic violations0 all pass. Doctor95655 exit0/errors0/two pre-existing warnings;policy routing and diff checks pass. No skipped/weakened gates or IO changes. First coverage-only desktop import failure remains recorded;unchanged isolated test and subsequent two complete app suites pass,root cause not proven. Native layout/redline/continuous/configurable-phantom/full callbacks/lifetime/default-factory obligations and whole goal remain unverified;no blanket promotion. Actual implementation commit/evaluator/clean final state recorded at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T05:25:47.449Z — VERIFY — ok

    By: CODER

    Note: Native20+37 definitions;120 sequences/8976 owner states match. Full unchanged verify32678 exit0:668+109 tests,19 browser scenarios,both coverage gates100%,all resource/static/docs/source/provenance/invariant/parity gates. Doctor0 errors,two existing warnings;routing/diff clean. Shown numbering ownership/registration/lazy reads only;IO exceptions and all residual parity obligations preserved.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T05:25:46.944Z, excerpt_hash=sha256:19b7f0e9ad3efca0cbf5b405dd4056d18cb49145ba94b9d850d137e7086e5934

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010449-CE6KDW/blueprint/resolved-snapshot.json
    - old_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
    - current_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010449-CE6KDW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610010449-CE6KDW -m 🧩 CE6KDW task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-01T05:27:56.814Z — VERIFY — ok

    By: CODER

    Note: verified-202610010449-CE6KDW
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T05:26:31.109Z, excerpt_hash=sha256:19b7f0e9ad3efca0cbf5b405dd4056d18cb49145ba94b9d850d137e7086e5934

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010449-CE6KDW/blueprint/resolved-snapshot.json
    - old_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
    - current_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010449-CE6KDW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610010449-CE6KDW --result verified-202610010449-CE6KDW --commit f6e8170a36dd0b65172b22ffb0087b0b8d700d32
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the actual implementation commit if this ownership correction fails;preserve task evidence and prior DONE artifacts. No destructive history operations."
  Findings: |-
    Fresh preflight clean main/direct,parent C9TN6M only active,no user-instructions. Previous turn is verified progress:iteration35 code77fda1c876bba94fa18514fa0b2dce43e1d38493,full verify59167 exit0,closed child and clean parent98252afbd500. Native ndtxt.hxx owns mpNodeNum;shown AddToList allocates,RemoveFromList removes/resets,GetNum/GetNumberVector directly access it. PreAdd/PostRemove register rule clients and document list items. Current local SwList map allocates records,SwNodeNum reads text rule dynamically and paragraph getters force whole-list validation. Persistent goal authorizes this safe in-repo source-shaped correction and lifecycle;no network/outside access or subagents.

    - Observation: Actual pre-edit baseline:missing GetNum/GetNumberVector/AddToList;first counter7 read computes unrelated raw tail0to8;orphan retains dynamic format start7 instead of native cleared binding/default1. Native-owner compile24098 failed only five missing declaration methods in explicit frame/range/list-items adapters;no native body changed.
      Impact: Incomplete native dependency declarations prevent comparison and are not successful evidence. Reading tail/raw state and cleared rule binding must be independently verified after repair.
      Resolution: Add only range/frame/native node getIDocumentListItems forwarding adapter declarations;recompile full untouched native methods. Keep this failure and unsupported hidden/layout/platform callbacks explicit;no verification gate change.

    - Observation: Command: npm run typecheck --workspace @vite-office/office; Result: fail (session7380). Transitional diagnostics: old tests called list-owned Insert/Remove APIs; SwTextNode type-only import used for teardown; XML call-site replacement retained this prefix.
      Impact: Owner API migration required updating actual lifecycle fixtures and two imports/call sites; no verification gate relaxed.
      Resolution: Migrated tests to canonical node-owned AddToList/RemoveFromList, preserved tree-record insertion contracts, fixed value import and XML node reference; rerun pending.

    - Observation: Command: npx tsx .agentplane/tasks/202610010449-CE6KDW/compare-native.ts; initial Result: fail sequence48 step10; focused test session21085 failed detached start7 expectation.
      Impact: Actual attribute transitions removed after assignment; native HandleSetAttrAtTextNode removes before assignment so invalid-rule removal sees old list. PostRemove intentionally clears retained rule, making detached start1.
      Resolution: Matched pre-mutation removal/readd including same-rule set; preserved native expected states. Actual comparison now passes120 sequences/8976 owner states; focused25 tests pass session8693; new4 lifecycle/registry tests pass53768. No native expected state weakened.

    - Observation: Command: npm run test:coverage --workspace @vite-office/office -- --reporter=dot; Result: fail session14986. 666/667 tests pass across149 files; desktop.test.tsx immediately saves imported TXT but never saves an empty import cannot find recent-document button notes at line441, although title notes is rendered.
      Impact: Failure is in unchanged registered document IO test, outside numbering correction; coverage report withheld on test failure. No IO behavior/test/config changed.
      Resolution: Run the unchanged desktop test in isolation to distinguish timing from regression, then unchanged full npm run verify. Required coverage and full gates remain100%; record repeated failures if unresolved.

    - Observation: Unchanged desktop TXT import test passes isolated session58580 (1 selected test); actual numbering comparison after cleanup passes120 sequences/8976 states session77278.
      Impact: The full coverage failure is not reproduced in isolation; cause not proven. Full gate still required without changed IO assertions, timeouts or retries.
      Resolution: Removed unreachable post-mutation rule/list identity branch now handled before mutation; rule Validate follows native existing-list invariant. Running unchanged npm run verify session56149 with task-local log.

    - Observation: Command: npm run verify; Result: fail session56149 solely coverage threshold. All667 application tests/149 files pass including unchanged desktop import test. Statements10199/10199,functions2798/2798,lines9366/9366;branches7696/7699 (99.96%). Three uncovered branches are SwNodeNum.PreAdd native no-text/non-doc registration guards at lines33-41.
      Impact: Global100% coverage remains required; no functional assertion failures. Later full gates were not reached in this attempt.
      Resolution: Add literal tests for native registration guards with no text and non-document arrays, then unchanged full verify. Preserve first full log as failure evidence.

    - Observation: Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/core/txtnode/node-numbering-lifecycle.test.ts src/sw/source/core/doc/DocumentListItemsManager.test.ts src/sw/source/core/SwNumberTree --coverage --coverage.include=src/sw/source/core/SwNumberTree/SwNodeNum.ts; Result: pass session82480.
      Impact: All19 selected tests pass; SwNodeNum statements35/35,branches35/35,functions15/15,lines31/31. This is focused coverage only, not a substitute for unchanged full global gate.
      Resolution: Absent-text and foreign-array source guards are tested with literal rule/client/registry states. Native comparison remains120/8976 match. Unchanged full npm run verify running with verify-final.log.

    - Observation: Command: ap commit with subject scope core; Result: fail session44789 before commit creation. Commit-msg hook requires task-intent scope code/task/close/integrate; staged verified paths retained and HEAD unchanged7ce5b0f1076d.
      Impact: Incorrect commit subject only; actual full verification passed, implementation and gates unchanged. No hook bypass or policy modification.
      Resolution: Retry owner commit using required scope code,then evaluate actual resulting implementation SHA. Do not close against an artifact-only HEAD.
id_source: "generated"
---
## Summary

Iteration36 of the user-authorized parity goal:restore shown SwTextNode numbering ownership,typed lifecycle and lazy reads with rule/document registrations;remove SwList item allocation/map ownership and generic registration wrappers.

## Scope

Runtime:sw/source/core/txtnode/ndtxt.ts,SwNumberTree/SwNodeNum.ts,SwNumberTree.ts,doc/list.ts,number.ts,doc.ts,DocumentListsManager.ts,new DocumentListItemsManager.ts,docnode/nodes.ts;sw/browser/filter/xml/writer-document-codec.ts and sw/source/filter/xml/xmlimp.ts registration call sites. Tests:new node-numbering-lifecycle.test.ts,new DocumentListItemsManager.test.ts,existing ndtxt/doc/list/list-invariants/number/SwNumberTree suites and impacted ODT assertions only when source-stale. Task-local baseline/native probes;bounded runtime-inventory/source-provenance including the new source-owned manager. Existing shown document-node hierarchical Arabic/bullet slice. Native layout expansion,redline/undo-node arrays,full callback/word-count/lifetime platform machinery,legacy/default factories remain explicit separate obligations. Preserve registered save/open/recovery deviations,Worker16/ODF1.3,all gates;no blanket status/default/goal promotion.

## Plan

1. Capture actual owner/read/rule baseline. 2. Compile unmodified native lifecycle,registration and getter methods with explicit platform adapters. 3. Transfer shown record ownership to SwTextNode and rule/registry hooks to SwNodeNum;SwList owns only roots and references. Remove full-list reads and registration wrappers;reconcile document/ODT/copy/move lifecycle. 4. Add native/literal identity and membership evidence with bounded metadata for new manager. 5. Focused checks,full unchanged verify,real implementation SHA/evaluator/finish child/update active parent. Owner CODER;one correction;existing IO deviations preserved;authorization from persistent goal.

## Verify Steps

Run actual baseline for missing GetNum/vector/lifecycle ownership APIs,whole-list counter read validating unrelated tails and detached records reading current text rule rather than retained native rule. Compile full unmodified pinned GetNum/GetNumberVector/IsInList/FindList/AddToList/RemoveFromList plus PreAdd/PostRemove/ChangeNumRule/Create,rule membership and document registry methods with explicit single-shown/no-layout/no-redline/doc-node/platform dependencies;record adapters and source body identity. Compare actual owner/tree/rule/registry objects for add/remove/readd,duplicate add,level/restart/counted/list/rule changes,detach/reinsert/move/delete/copy,Arabic/bullet,rule membership ordering/duplicate suppression,numbered registry filtering,and reverse/prefix-only reads with literal vectors/counters/labels and independent copies. Include genuine ODT/Worker/undo suites. Focused tests/lint/types/docs/provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/static/resource/source/invariant gates. Doctor,routing,diff,real code SHA,evaluator pass and clean final checkout required;no weakened/skipped gates.

## Verification

PASS. Baseline persisted before edits. Native oracle session80179 compiles20 additional full unmodified owner/registration methods alongside37 retained native tree/list definitions;explicit shown/doc-node/no-layout/no-redline/platform dependencies and byte identity checks. Actual compare-native.ts matches120 sequences/8976 owner states,including lazy raw prefix,reverse vectors,bound rules,rule client order and numbered registry. Focused25+new5 lifecycle/registry tests and native guard coverage pass;genuine ODT/Worker/undo pass in full suite. Unchanged npm run verify session32678 exit0;verify-final.log:668 application tests/149 files,109 inventory tests/36 files,19 browser scenarios20.3s. Both global coverage gates100%:application10199 statements/7699 branches/2798 functions/9366 lines;inventory1523/1080/384/1464. Format,lint,types,module/resource gates,static build,JSDoc457,file-size,source-tree111/33,provenance205/129,invariants,parity semantic violations0 all pass. Doctor95655 exit0/errors0/two pre-existing warnings;policy routing and diff checks pass. No skipped/weakened gates or IO changes. First coverage-only desktop import failure remains recorded;unchanged isolated test and subsequent two complete app suites pass,root cause not proven. Native layout/redline/continuous/configurable-phantom/full callbacks/lifetime/default-factory obligations and whole goal remain unverified;no blanket promotion. Actual implementation commit/evaluator/clean final state recorded at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T05:25:47.449Z — VERIFY — ok

By: CODER

Note: Native20+37 definitions;120 sequences/8976 owner states match. Full unchanged verify32678 exit0:668+109 tests,19 browser scenarios,both coverage gates100%,all resource/static/docs/source/provenance/invariant/parity gates. Doctor0 errors,two existing warnings;routing/diff clean. Shown numbering ownership/registration/lazy reads only;IO exceptions and all residual parity obligations preserved.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T05:25:46.944Z, excerpt_hash=sha256:19b7f0e9ad3efca0cbf5b405dd4056d18cb49145ba94b9d850d137e7086e5934

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010449-CE6KDW/blueprint/resolved-snapshot.json
- old_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
- current_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010449-CE6KDW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610010449-CE6KDW -m 🧩 CE6KDW task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-01T05:27:56.814Z — VERIFY — ok

By: CODER

Note: verified-202610010449-CE6KDW
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T05:26:31.109Z, excerpt_hash=sha256:19b7f0e9ad3efca0cbf5b405dd4056d18cb49145ba94b9d850d137e7086e5934

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010449-CE6KDW/blueprint/resolved-snapshot.json
- old_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
- current_digest: 69afd1edd6cd196ef336c4e571f58e9124b0cba7574abf61927668b8be0a7623
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010449-CE6KDW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610010449-CE6KDW --result verified-202610010449-CE6KDW --commit f6e8170a36dd0b65172b22ffb0087b0b8d700d32
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the actual implementation commit if this ownership correction fails;preserve task evidence and prior DONE artifacts. No destructive history operations.

## Findings

Fresh preflight clean main/direct,parent C9TN6M only active,no user-instructions. Previous turn is verified progress:iteration35 code77fda1c876bba94fa18514fa0b2dce43e1d38493,full verify59167 exit0,closed child and clean parent98252afbd500. Native ndtxt.hxx owns mpNodeNum;shown AddToList allocates,RemoveFromList removes/resets,GetNum/GetNumberVector directly access it. PreAdd/PostRemove register rule clients and document list items. Current local SwList map allocates records,SwNodeNum reads text rule dynamically and paragraph getters force whole-list validation. Persistent goal authorizes this safe in-repo source-shaped correction and lifecycle;no network/outside access or subagents.

- Observation: Actual pre-edit baseline:missing GetNum/GetNumberVector/AddToList;first counter7 read computes unrelated raw tail0to8;orphan retains dynamic format start7 instead of native cleared binding/default1. Native-owner compile24098 failed only five missing declaration methods in explicit frame/range/list-items adapters;no native body changed.
  Impact: Incomplete native dependency declarations prevent comparison and are not successful evidence. Reading tail/raw state and cleared rule binding must be independently verified after repair.
  Resolution: Add only range/frame/native node getIDocumentListItems forwarding adapter declarations;recompile full untouched native methods. Keep this failure and unsupported hidden/layout/platform callbacks explicit;no verification gate change.

- Observation: Command: npm run typecheck --workspace @vite-office/office; Result: fail (session7380). Transitional diagnostics: old tests called list-owned Insert/Remove APIs; SwTextNode type-only import used for teardown; XML call-site replacement retained this prefix.
  Impact: Owner API migration required updating actual lifecycle fixtures and two imports/call sites; no verification gate relaxed.
  Resolution: Migrated tests to canonical node-owned AddToList/RemoveFromList, preserved tree-record insertion contracts, fixed value import and XML node reference; rerun pending.

- Observation: Command: npx tsx .agentplane/tasks/202610010449-CE6KDW/compare-native.ts; initial Result: fail sequence48 step10; focused test session21085 failed detached start7 expectation.
  Impact: Actual attribute transitions removed after assignment; native HandleSetAttrAtTextNode removes before assignment so invalid-rule removal sees old list. PostRemove intentionally clears retained rule, making detached start1.
  Resolution: Matched pre-mutation removal/readd including same-rule set; preserved native expected states. Actual comparison now passes120 sequences/8976 owner states; focused25 tests pass session8693; new4 lifecycle/registry tests pass53768. No native expected state weakened.

- Observation: Command: npm run test:coverage --workspace @vite-office/office -- --reporter=dot; Result: fail session14986. 666/667 tests pass across149 files; desktop.test.tsx immediately saves imported TXT but never saves an empty import cannot find recent-document button notes at line441, although title notes is rendered.
  Impact: Failure is in unchanged registered document IO test, outside numbering correction; coverage report withheld on test failure. No IO behavior/test/config changed.
  Resolution: Run the unchanged desktop test in isolation to distinguish timing from regression, then unchanged full npm run verify. Required coverage and full gates remain100%; record repeated failures if unresolved.

- Observation: Unchanged desktop TXT import test passes isolated session58580 (1 selected test); actual numbering comparison after cleanup passes120 sequences/8976 states session77278.
  Impact: The full coverage failure is not reproduced in isolation; cause not proven. Full gate still required without changed IO assertions, timeouts or retries.
  Resolution: Removed unreachable post-mutation rule/list identity branch now handled before mutation; rule Validate follows native existing-list invariant. Running unchanged npm run verify session56149 with task-local log.

- Observation: Command: npm run verify; Result: fail session56149 solely coverage threshold. All667 application tests/149 files pass including unchanged desktop import test. Statements10199/10199,functions2798/2798,lines9366/9366;branches7696/7699 (99.96%). Three uncovered branches are SwNodeNum.PreAdd native no-text/non-doc registration guards at lines33-41.
  Impact: Global100% coverage remains required; no functional assertion failures. Later full gates were not reached in this attempt.
  Resolution: Add literal tests for native registration guards with no text and non-document arrays, then unchanged full verify. Preserve first full log as failure evidence.

- Observation: Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/core/txtnode/node-numbering-lifecycle.test.ts src/sw/source/core/doc/DocumentListItemsManager.test.ts src/sw/source/core/SwNumberTree --coverage --coverage.include=src/sw/source/core/SwNumberTree/SwNodeNum.ts; Result: pass session82480.
  Impact: All19 selected tests pass; SwNodeNum statements35/35,branches35/35,functions15/15,lines31/31. This is focused coverage only, not a substitute for unchanged full global gate.
  Resolution: Absent-text and foreign-array source guards are tested with literal rule/client/registry states. Native comparison remains120/8976 match. Unchanged full npm run verify running with verify-final.log.

- Observation: Command: ap commit with subject scope core; Result: fail session44789 before commit creation. Commit-msg hook requires task-intent scope code/task/close/integrate; staged verified paths retained and HEAD unchanged7ce5b0f1076d.
  Impact: Incorrect commit subject only; actual full verification passed, implementation and gates unchanged. No hook bypass or policy modification.
  Resolution: Retry owner commit using required scope code,then evaluate actual resulting implementation SHA. Do not close against an artifact-only HEAD.
