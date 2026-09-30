---
id: "202609301452-WQ0C2J"
title: "Match item set clone inheritance and state contracts"
result_summary: "Empty clones drop parents and cross-pool clones copy SET values only; same-pool clones preserve independent values and states."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T14:53:02.787Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T15:01:02.303Z"
  updated_by: "CODER"
  note: "Empty, full same-pool and cross-pool clones match pinned inheritance/state rules; 20 focused tests and full npm run verify passed (562 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T15:01:20.972Z"
  updated_by: "EVALUATOR"
  note: "Item set clone semantics match pinned copy/empty constructors and SET-only cross-pool traversal."
  evaluated_sha: "ba5d1826bfbe4a360fe012a3a22196b5f6896493"
  blueprint_digest: "b18013e1f5963f2312e7e4ba61928c99c301e879d01fe95859c100117b917c2e"
  evidence_refs:
    - ".agentplane/tasks/202609301452-WQ0C2J/README.md"
    - ".agentplane/tasks/202609301452-WQ0C2J/quality/20260930-150120972-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301452-WQ0C2J/quality/20260930-150120972-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301452-WQ0C2J/quality/20260930-150120972-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301452-WQ0C2J/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301452-WQ0C2J/verify.log"
    - "apps/office/src/svl/source/items/itemset.test.ts"
    - "apps/office/src/sw/source/core/doc/writer-attributes.test.ts"
  findings:
    - "Independent values, parent ownership and invalid/disabled states have focused assertions; full gates pass. Copying no longer depends on PutSet defaults."
commit:
  hash: "ba5d1826bfbe4a360fe012a3a22196b5f6896493"
  message: "🐛 WQ0C2J task: align item set clone inheritance and states"
comments:
  -
    author: "CODER"
    body: "Start: match SfxItemSet and SwAttrSet clone contracts with pinned copy constructors, parent ownership and cross-pool state filtering."
  -
    author: "CODER"
    body: "Verified: item set clone inheritance and direct-state copying now match pinned LibreOffice; focused and complete verification passed."
events:
  -
    type: "status"
    at: "2026-09-30T14:53:03.364Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: match SfxItemSet and SwAttrSet clone contracts with pinned copy constructors, parent ownership and cross-pool state filtering."
  -
    type: "verify"
    at: "2026-09-30T15:01:02.303Z"
    author: "CODER"
    state: "ok"
    note: "Empty, full same-pool and cross-pool clones match pinned inheritance/state rules; 20 focused tests and full npm run verify passed (562 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed."
  -
    type: "status"
    at: "2026-09-30T15:01:37.923Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: item set clone inheritance and direct-state copying now match pinned LibreOffice; focused and complete verification passed."
doc_version: 3
doc_updated_at: "2026-09-30T15:01:37.924Z"
doc_updated_by: "CODER"
description: "One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations."
sections:
  Summary: |-
    Match item set clone inheritance and state contracts

    One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
  Scope: |-
    - In scope: One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
    - Out of scope: unrelated refactors not required for "Match item set clone inheritance and state contracts".
  Plan: "1. Compare pinned SfxItemSet copy constructor/Clone and SwAttrSet copy constructor/CloneAsValue. 2. Translate copy-constructor item copying into one protected helper shared by clone paths, eliminating redundant PutSet copying. Empty clones drop inheritance; full same-pool clones retain parent and direct states; cross-pool Sfx clones copy only SET items. 3. Add regression assertions for inherited/direct/invalid/disabled items and independent mutation in itemset.test.ts and writer-attributes.test.ts. Append bounded inventory evidence without broad promotion. 4. Run focused tests, npm run verify, doctor and policy routing; record evidence and close with the five scoped files and task artifacts. No save/open/recovery or inventory mechanism changes."
  Verify Steps: "1. Focused itemset and writer-attributes tests prove empty clones have no parent or items, full same-pool clones preserve parent, direct values and invalid/disabled states independently, and cross-pool clones retain only directly SET values with destination defaults. 2. npm run verify passes all required checks at 100% coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; final diff is confined to the five approved files and task artifacts; tracked checkout is clean after closure."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T15:01:02.303Z — VERIFY — ok

    By: CODER

    Note: Empty, full same-pool and cross-pool clones match pinned inheritance/state rules; 20 focused tests and full npm run verify passed (562 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:01:01.813Z, excerpt_hash=sha256:c4d522862cef82571151300b2f3ad31299476bcf5c364e2fd4fc8c6554fc5062

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301452-WQ0C2J/blueprint/resolved-snapshot.json
    - old_digest: b18013e1f5963f2312e7e4ba61928c99c301e879d01fe95859c100117b917c2e
    - current_digest: b18013e1f5963f2312e7e4ba61928c99c301e879d01fe95859c100117b917c2e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301452-WQ0C2J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609301452-WQ0C2J -m 🧩 WQ0C2J task: persist canonical task artifacts --allow-tasks
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
  Findings: "Pinned SfxItemSet copy constructor preserves parent and direct states; Clone(false) creates an unparented empty set, and cloning into another pool copies only directly SET values. SwAttrSet::CloneAsValue follows the copy-constructor versus empty-constructor distinction. Replaced redundant PutSet-plus-state copying with one protected copy-constructor helper so clone semantics remain independent of ordinary Put defaults. Command: npm exec --workspace @vite-office/office -- vitest run src/svl/source/items/itemset.test.ts src/sw/source/core/doc/writer-attributes.test.ts. Result: pass, 20/20 tests; three tests failed before the correction. Evidence: focused-before.log and focused-after.log. Command: npm run verify. Result: pass, 562 app tests, 109 inventory tests, 19 browser tests, 100% required coverage, all other gates. Evidence: verify.log. Command: ap doctor and node .agentplane/policy/check-routing.mjs. Result: pass, with existing unrelated hook-shim and historical close-commit warnings. Scope: five declared implementation/test/inventory files. Remaining PutSet invalid-as-default, disabled-state and other contracts stay unverified; no whole-module promotion. Deliberate browser save/open/recovery decisions remain unchanged."
id_source: "generated"
---
## Summary

Match item set clone inheritance and state contracts

One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.

## Scope

- In scope: One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
- Out of scope: unrelated refactors not required for "Match item set clone inheritance and state contracts".

## Plan

1. Compare pinned SfxItemSet copy constructor/Clone and SwAttrSet copy constructor/CloneAsValue. 2. Translate copy-constructor item copying into one protected helper shared by clone paths, eliminating redundant PutSet copying. Empty clones drop inheritance; full same-pool clones retain parent and direct states; cross-pool Sfx clones copy only SET items. 3. Add regression assertions for inherited/direct/invalid/disabled items and independent mutation in itemset.test.ts and writer-attributes.test.ts. Append bounded inventory evidence without broad promotion. 4. Run focused tests, npm run verify, doctor and policy routing; record evidence and close with the five scoped files and task artifacts. No save/open/recovery or inventory mechanism changes.

## Verify Steps

1. Focused itemset and writer-attributes tests prove empty clones have no parent or items, full same-pool clones preserve parent, direct values and invalid/disabled states independently, and cross-pool clones retain only directly SET values with destination defaults. 2. npm run verify passes all required checks at 100% coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; final diff is confined to the five approved files and task artifacts; tracked checkout is clean after closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T15:01:02.303Z — VERIFY — ok

By: CODER

Note: Empty, full same-pool and cross-pool clones match pinned inheritance/state rules; 20 focused tests and full npm run verify passed (562 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:01:01.813Z, excerpt_hash=sha256:c4d522862cef82571151300b2f3ad31299476bcf5c364e2fd4fc8c6554fc5062

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301452-WQ0C2J/blueprint/resolved-snapshot.json
- old_digest: b18013e1f5963f2312e7e4ba61928c99c301e879d01fe95859c100117b917c2e
- current_digest: b18013e1f5963f2312e7e4ba61928c99c301e879d01fe95859c100117b917c2e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301452-WQ0C2J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609301452-WQ0C2J -m 🧩 WQ0C2J task: persist canonical task artifacts --allow-tasks
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

Pinned SfxItemSet copy constructor preserves parent and direct states; Clone(false) creates an unparented empty set, and cloning into another pool copies only directly SET values. SwAttrSet::CloneAsValue follows the copy-constructor versus empty-constructor distinction. Replaced redundant PutSet-plus-state copying with one protected copy-constructor helper so clone semantics remain independent of ordinary Put defaults. Command: npm exec --workspace @vite-office/office -- vitest run src/svl/source/items/itemset.test.ts src/sw/source/core/doc/writer-attributes.test.ts. Result: pass, 20/20 tests; three tests failed before the correction. Evidence: focused-before.log and focused-after.log. Command: npm run verify. Result: pass, 562 app tests, 109 inventory tests, 19 browser tests, 100% required coverage, all other gates. Evidence: verify.log. Command: ap doctor and node .agentplane/policy/check-routing.mjs. Result: pass, with existing unrelated hook-shim and historical close-commit warnings. Scope: five declared implementation/test/inventory files. Remaining PutSet invalid-as-default, disabled-state and other contracts stay unverified; no whole-module promotion. Deliberate browser save/open/recovery decisions remain unchanged.
