---
id: "202610041718-TTJ3ZQ"
title: "Restore native item-set equality ownership and state contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on:
  - "202610041659-JF2KV2"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T17:20:02.428Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T17:34:16.198Z"
  updated_by: "CODER"
  note: "Verified: Semantic 2be6f5212debd38210360430a2854b78dfff9213 satisfies approved native base item-set Equals contract and bounded consumer correction.49 new assertions;1660app/109inventory/5scripts/99Chromium pass once absent-only, required metrics100%. Static/build/restored-source/scope/AP audits pass;325 prior tests unchanged. Same-actor exact-SHA quality pass, doctor zero errors and routing pass; upstream restored and registered deviations unchanged. Automatic-style handle interning/pointer equality remain open; goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T17:33:08.817Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only quality review at semantic 2be6f5212debd38210360430a2854b78dfff9213: approved native item-set Equals state/owner contract and bounded consumer correction satisfied; automatic-style shared-handle architecture explicitly remains open."
  evaluated_sha: "2be6f5212debd38210360430a2854b78dfff9213"
  blueprint_digest: "3da0304e66fef08108f735467a0d68f89232ef5bef38d1de5a00f8a4af0ed3b9"
  evidence_refs:
    - ".agentplane/tasks/202610041718-TTJ3ZQ/README.md"
    - ".agentplane/tasks/202610041718-TTJ3ZQ/quality/20261004-173308817-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041718-TTJ3ZQ/quality/20261004-173308817-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041718-TTJ3ZQ/quality/20261004-173308817-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041718-TTJ3ZQ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041718-TTJ3ZQ/evidence"
    - "2be6f5212debd38210360430a2854b78dfff9213"
  findings:
    - "Actual six-path diff ports explicit comparePool identity/parent/pool/Count/empty/keyed-state/SET-value Equals and removes SET-only helper.49 new independent real-item/model/hint/clone/direct-projection assertions cover the approved contract;325 prior tests/specs byte-identical. All static/build/product/source gates pass;1660app/109inventory/5scripts/99Chromium first single absent-only profile, four required metrics100%. No production mutation after validation."
    - "Five pinned native hashes and exact scope audit preserve230 runtime statuses/defaults/exceptions with only two bounded appendices. Ignored-inclusive AP scan forbidden0; no source/helpers/Python/executables/source frames/raw source diffs. Doctor zero errors and routing pass; upstream restored and registered I/O/recovery deviations untouched."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore approved native item-set equality states/owners and replace SET-only helper, keeping handle interning explicitly unresolved."
events:
  -
    type: "status"
    at: "2026-10-04T17:20:39.664Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore approved native item-set equality states/owners and replace SET-only helper, keeping handle interning explicitly unresolved."
  -
    type: "verify"
    at: "2026-10-04T17:34:16.198Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Semantic 2be6f5212debd38210360430a2854b78dfff9213 satisfies approved native base item-set Equals contract and bounded consumer correction.49 new assertions;1660app/109inventory/5scripts/99Chromium pass once absent-only, required metrics100%. Static/build/restored-source/scope/AP audits pass;325 prior tests unchanged. Same-actor exact-SHA quality pass, doctor zero errors and routing pass; upstream restored and registered deviations unchanged. Automatic-style handle interning/pointer equality remain open; goal active."
doc_version: 3
doc_updated_at: "2026-10-04T17:34:16.250Z"
doc_updated_by: "CODER"
description: "Restore SfxItemSet::Equals pool/parent/count/direct-state/value contract and replace the existing Writer SET-only equality helper with the owner contract. Add independent actual-owner/item/adjacent-hint regressions. Native automatic-style handle interning and pointer equality remain the next architectural step, not certified by this leaf."
sections:
  Summary: "Restore native SfxItemSet::Equals direct states and owner identity and use this base-owner contract instead of the existing SET-only Writer helper. One executable leaf; automatic-style interning and pointer identity remain a subsequent architectural requirement."
  Scope: "Exactly six semantic paths: apps/office/src/svl/source/items/itemset.ts and new itemset-equality.test.ts; apps/office/src/sw/source/core/txtnode/txatbase.ts and new automatic-itemset-equality.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. All325 previous tests/specs unchanged. Bounded prose/hash/count task evidence only; no upstream sources/helpers in AP, network/outside-repo access or registered save/open/recovery changes. Native item-set comparison verified only; automatic-style handle/pool and whole-module parity remain unverified."
  Plan: "Port native Equals with explicit comparePool parameter: identity shortcut, conditional parent/pool identity, direct Count, empty equality regardless of ranges, keyed direct state and SET item value equality. Remove SET-only equalItemSets helper and delegate the existing automatic-style value comparison to its owning item set. Add independent actual-owner state/value/pool/parent/range/order and real adjacent-hint/projection/clone regressions. Append bounded existing-row evidence only. Static gates then one absent-only test profile then restored source audits; exact-SHA same-actor quality, verification and clean closure."
  Verify Steps: |-
    1. Static gates before suites: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-only npm run test:static precedes product suites.
    2. Rename vendor/libreoffice-reference to vendor/.offline-TTJ3ZQ inside repo using try/finally. Sequential single absent-only runs: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Require all assertions and four required app/inventory metrics100%. Recover failed gates only; no present-vendor runs or repetition of passing suites, no concurrent source/scope/AP audits. Restore vendor.
    3. New independent real-owner tests cover direct value/INVALID/DISABLED/unset states, keyed marker positions, pool/parent identity with comparePool true/false, self/empty/count/range/order semantics and clone/immutability. Actual Writer automatic items and adjacent hints must preserve distinct state and inherited-format ranges while equivalent direct sets still compare equal. All325 previous tests/specs byte-identical.
    4. Restored-only npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity, zero semantic violations. Pin native Equals and automatic-format/StylePool/manager source hashes as bounded evidence; do not execute or copy upstream.
    5. Exact six semantic paths;230 runtime rows preserve statuses/defaults/exceptions, only two bounded existing-row evidence appendices; provenance retains existing evidence with precise residual handle-interner gap. Complete ignored-inclusive AP audit rejects source/helpers/Python/executables/source frames/raw source diffs. Same-actor exact-SHA EVALUATOR pass; ap doctor zero errors and node .agentplane/policy/check-routing.mjs pass. Recorded canonical verification, semantic/verification/close hashes and clean tracked/untracked final checkout required.
  Verification: |-
    Command: six final static npm gates; absent-only npm run test:static, app/inventory coverage with reportOnFailure, two script test files and Chromium Playwright; restored-only resource/source-tree/provenance/invariants/parity audits. Result: all product gates pass first execution;1660app/244files,109inventory/36files,5scripts/2files,99Chromium, four required app/inventory metrics100%. Evidence: bounded records under evidence, semantic 2be6f5212debd38210360430a2854b78dfff9213, same-actor exact-SHA quality/20261004-173308817-recovery-context pass. Scope: native base item-set Equals explicit comparePool states/values/self/Count/empty/ranges/order/owner semantics;49 new real-owner/hint/clone/direct-projection assertions and removal of SET-only helper. All325 previous tests/specs byte-identical; exact six semantic paths;230 runtime statuses/defaults/exceptions retained with two bounded appendices; five pinned native hashes; ignored-inclusive AP scan forbidden0. Doctor zero errors and routing pass; upstream restored; no passing product suite repeated or source/helper storage; registered I/O/recovery deviations untouched. Native document-owned automatic-style interning/shared-handle pointer equality and separate browser inheritance projection remain open. Complete module/model/filter/UI parity remains unverified; goal active and clean final checkout required.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T17:34:16.198Z — VERIFY — ok

    By: CODER

    Note: Verified: Semantic 2be6f5212debd38210360430a2854b78dfff9213 satisfies approved native base item-set Equals contract and bounded consumer correction.49 new assertions;1660app/109inventory/5scripts/99Chromium pass once absent-only, required metrics100%. Static/build/restored-source/scope/AP audits pass;325 prior tests unchanged. Same-actor exact-SHA quality pass, doctor zero errors and routing pass; upstream restored and registered deviations unchanged. Automatic-style handle interning/pointer equality remain open; goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T17:34:15.898Z, excerpt_hash=sha256:086c195224851967ad54cc9ef6252a8587408591c8dffeb8cf05751dd92d006b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041718-TTJ3ZQ/blueprint/resolved-snapshot.json
    - old_digest: 3da0304e66fef08108f735467a0d68f89232ef5bef38d1de5a00f8a4af0ed3b9
    - current_digest: 3da0304e66fef08108f735467a0d68f89232ef5bef38d1de5a00f8a4af0ed3b9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610041718-TTJ3ZQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610041718-TTJ3ZQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert semantic task commit with a new commit if necessary; no history rewrite. Always restore vendor directory in finally."
  Findings: "Restored pinned base SfxItemSet::Equals explicit comparePool contract and removed Writer SET-only helper.49 new real-owner/item/hint/clone/direct-projection assertions cover direct states, keyed markers, parent/pool identity, Count/self/empty/range/order and retained inherited item access. Corrected a new fixture before product execution to distinguish owner inheritance from separately implemented browser inheritance projection; repeated only static gates affected by that new test edit. All product gates pass first single absent-only profile:1660app/244files,109inventory/36files,5scripts/2files,99Chromium; four required metrics100%. Six final static gates and absent build plus restored source/resource/provenance/invariant/parity audits pass, semantic violations0. All325 previous tests/specs byte-identical; exact six semantic paths,230 unchanged runtime statuses/defaults/exceptions with two bounded appendices; five native hashes bind pin; full ignored-inclusive AP scan3701files forbidden0. Upstream restored in finally, no network/outside-repo/source execution or AP source/helper storage, registered I/O/recovery deviations unchanged. Native automatic-format equality requires document-owned shared handles and pointer identity; that next architectural requirement remains open. Complete native style pools/other flags/notifications/layout/ranges/fields/marks/redlines/filter/UI contracts remain unverified; broad goal active."
id_source: "generated"
---
## Summary

Restore native SfxItemSet::Equals direct states and owner identity and use this base-owner contract instead of the existing SET-only Writer helper. One executable leaf; automatic-style interning and pointer identity remain a subsequent architectural requirement.

## Scope

Exactly six semantic paths: apps/office/src/svl/source/items/itemset.ts and new itemset-equality.test.ts; apps/office/src/sw/source/core/txtnode/txatbase.ts and new automatic-itemset-equality.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. All325 previous tests/specs unchanged. Bounded prose/hash/count task evidence only; no upstream sources/helpers in AP, network/outside-repo access or registered save/open/recovery changes. Native item-set comparison verified only; automatic-style handle/pool and whole-module parity remain unverified.

## Plan

Port native Equals with explicit comparePool parameter: identity shortcut, conditional parent/pool identity, direct Count, empty equality regardless of ranges, keyed direct state and SET item value equality. Remove SET-only equalItemSets helper and delegate the existing automatic-style value comparison to its owning item set. Add independent actual-owner state/value/pool/parent/range/order and real adjacent-hint/projection/clone regressions. Append bounded existing-row evidence only. Static gates then one absent-only test profile then restored source audits; exact-SHA same-actor quality, verification and clean closure.

## Verify Steps

1. Static gates before suites: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-only npm run test:static precedes product suites.
2. Rename vendor/libreoffice-reference to vendor/.offline-TTJ3ZQ inside repo using try/finally. Sequential single absent-only runs: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Require all assertions and four required app/inventory metrics100%. Recover failed gates only; no present-vendor runs or repetition of passing suites, no concurrent source/scope/AP audits. Restore vendor.
3. New independent real-owner tests cover direct value/INVALID/DISABLED/unset states, keyed marker positions, pool/parent identity with comparePool true/false, self/empty/count/range/order semantics and clone/immutability. Actual Writer automatic items and adjacent hints must preserve distinct state and inherited-format ranges while equivalent direct sets still compare equal. All325 previous tests/specs byte-identical.
4. Restored-only npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity, zero semantic violations. Pin native Equals and automatic-format/StylePool/manager source hashes as bounded evidence; do not execute or copy upstream.
5. Exact six semantic paths;230 runtime rows preserve statuses/defaults/exceptions, only two bounded existing-row evidence appendices; provenance retains existing evidence with precise residual handle-interner gap. Complete ignored-inclusive AP audit rejects source/helpers/Python/executables/source frames/raw source diffs. Same-actor exact-SHA EVALUATOR pass; ap doctor zero errors and node .agentplane/policy/check-routing.mjs pass. Recorded canonical verification, semantic/verification/close hashes and clean tracked/untracked final checkout required.

## Verification

Command: six final static npm gates; absent-only npm run test:static, app/inventory coverage with reportOnFailure, two script test files and Chromium Playwright; restored-only resource/source-tree/provenance/invariants/parity audits. Result: all product gates pass first execution;1660app/244files,109inventory/36files,5scripts/2files,99Chromium, four required app/inventory metrics100%. Evidence: bounded records under evidence, semantic 2be6f5212debd38210360430a2854b78dfff9213, same-actor exact-SHA quality/20261004-173308817-recovery-context pass. Scope: native base item-set Equals explicit comparePool states/values/self/Count/empty/ranges/order/owner semantics;49 new real-owner/hint/clone/direct-projection assertions and removal of SET-only helper. All325 previous tests/specs byte-identical; exact six semantic paths;230 runtime statuses/defaults/exceptions retained with two bounded appendices; five pinned native hashes; ignored-inclusive AP scan forbidden0. Doctor zero errors and routing pass; upstream restored; no passing product suite repeated or source/helper storage; registered I/O/recovery deviations untouched. Native document-owned automatic-style interning/shared-handle pointer equality and separate browser inheritance projection remain open. Complete module/model/filter/UI parity remains unverified; goal active and clean final checkout required.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T17:34:16.198Z — VERIFY — ok

By: CODER

Note: Verified: Semantic 2be6f5212debd38210360430a2854b78dfff9213 satisfies approved native base item-set Equals contract and bounded consumer correction.49 new assertions;1660app/109inventory/5scripts/99Chromium pass once absent-only, required metrics100%. Static/build/restored-source/scope/AP audits pass;325 prior tests unchanged. Same-actor exact-SHA quality pass, doctor zero errors and routing pass; upstream restored and registered deviations unchanged. Automatic-style handle interning/pointer equality remain open; goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T17:34:15.898Z, excerpt_hash=sha256:086c195224851967ad54cc9ef6252a8587408591c8dffeb8cf05751dd92d006b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041718-TTJ3ZQ/blueprint/resolved-snapshot.json
- old_digest: 3da0304e66fef08108f735467a0d68f89232ef5bef38d1de5a00f8a4af0ed3b9
- current_digest: 3da0304e66fef08108f735467a0d68f89232ef5bef38d1de5a00f8a4af0ed3b9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610041718-TTJ3ZQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610041718-TTJ3ZQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert semantic task commit with a new commit if necessary; no history rewrite. Always restore vendor directory in finally.

## Findings

Restored pinned base SfxItemSet::Equals explicit comparePool contract and removed Writer SET-only helper.49 new real-owner/item/hint/clone/direct-projection assertions cover direct states, keyed markers, parent/pool identity, Count/self/empty/range/order and retained inherited item access. Corrected a new fixture before product execution to distinguish owner inheritance from separately implemented browser inheritance projection; repeated only static gates affected by that new test edit. All product gates pass first single absent-only profile:1660app/244files,109inventory/36files,5scripts/2files,99Chromium; four required metrics100%. Six final static gates and absent build plus restored source/resource/provenance/invariant/parity audits pass, semantic violations0. All325 previous tests/specs byte-identical; exact six semantic paths,230 unchanged runtime statuses/defaults/exceptions with two bounded appendices; five native hashes bind pin; full ignored-inclusive AP scan3701files forbidden0. Upstream restored in finally, no network/outside-repo/source execution or AP source/helper storage, registered I/O/recovery deviations unchanged. Native automatic-format equality requires document-owned shared handles and pointer identity; that next architectural requirement remains open. Complete native style pools/other flags/notifications/layout/ranges/fields/marks/redlines/filter/UI contracts remain unverified; broad goal active.
