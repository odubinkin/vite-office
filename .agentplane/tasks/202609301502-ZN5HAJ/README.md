---
id: "202609301502-ZN5HAJ"
title: "Match SfxItemSet invalid-as-default copying"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T15:03:04.677Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T15:11:04.756Z"
  updated_by: "CODER"
  note: "PutSet defaults, INVALID/DISABLED handling and return values match pinned source; 22 focused tests and full npm run verify passed (564 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align ordinary SfxItemSet copying with the pinned invalid-as-default flag, disabled filtering and observable return contract."
events:
  -
    type: "status"
    at: "2026-09-30T15:03:05.152Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align ordinary SfxItemSet copying with the pinned invalid-as-default flag, disabled filtering and observable return contract."
  -
    type: "verify"
    at: "2026-09-30T15:11:04.756Z"
    author: "CODER"
    state: "ok"
    note: "PutSet defaults, INVALID/DISABLED handling and return values match pinned source; 22 focused tests and full npm run verify passed (564 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed."
doc_version: 3
doc_updated_at: "2026-09-30T15:11:04.815Z"
doc_updated_by: "CODER"
description: "One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations."
sections:
  Summary: |-
    Match SfxItemSet invalid-as-default copying

    One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
  Scope: |-
    - In scope: One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
    - Out of scope: unrelated refactors not required for "Match SfxItemSet invalid-as-default copying".
  Plan: "1. Compare SfxItemSet::Put(const SfxItemSet&, bool) and PutImpl with the pinned header default. 2. Add invalidAsDefault=true to PutSet; clear direct invalid targets by default, ignore incoming disabled states, and retain the source return behavior for explicit invalid copying. Keep clone-constructor copying independent. 3. Assert all modes, wider ranges, unchanged source, Writer style/node fallback and clone state preservation in the two existing tests. Append bounded runtime evidence. 4. Run focused tests, full npm run verify, doctor/routing; commit the four declared files plus task artifacts and close. No policy, inventory mechanism, save/open/recovery changes."
  Verify Steps: "1. Focused itemset and writer-attributes tests assert default invalid clearing, ignored disabled input, explicit invalid-state copying and exact return values, supported copying from wider sources, unchanged source and preserved clone states. Writer node and format inheritance resolves after direct invalid-value clearing. 2. npm run verify passes all gates at 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; only the four declared source/test/inventory files and task artifacts change; final tracked checkout is clean."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T15:11:04.756Z — VERIFY — ok

    By: CODER

    Note: PutSet defaults, INVALID/DISABLED handling and return values match pinned source; 22 focused tests and full npm run verify passed (564 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:11:04.391Z, excerpt_hash=sha256:da3c7482f975fe79fc5bf91a720c0cb77a7503760e194d1386d3de54e2f648d2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301502-ZN5HAJ/blueprint/resolved-snapshot.json
    - old_digest: a930efebeeef731661f3a609bce27a81fef18d42318c46737e73feb1bab22555
    - current_digest: a930efebeeef731661f3a609bce27a81fef18d42318c46737e73feb1bab22555
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301502-ZN5HAJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609301502-ZN5HAJ -m 🧩 ZN5HAJ task: persist canonical task artifacts --allow-tasks
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
  Findings: "Pinned include/svl/itemset.hxx defaults bInvalidAsDefault to true; itemset.cxx Put clears direct entries for INVALID by default, ignores incoming DISABLED through PutImpl, and does not set the return flag solely for explicit false invalid-state copying. Local PutSet now follows these rules. Command: npm exec --workspace @vite-office/office -- vitest run src/svl/source/items/itemset.test.ts src/sw/source/core/doc/writer-attributes.test.ts. Result: pass, 22/22 tests; three tests failed before the correction, including Writer inheritance resolving to the pool default instead of its parent style. Scope: all flag modes, exact return values, wider ranges, ignored disabled state, untouched source, node/style fallback and preserved full-clone states. Command: npm run verify. Result: pass, 564 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all static/source/inventory gates. Evidence: verify.log. Command: ap doctor and policy routing. Result: pass with existing unrelated warnings. Residual audit findings: explicit out-of-range InvalidateItem/DisableItem still throw instead of the pinned no-op; frame margin item classes remain combined in paraitem.ts although their implementation owner is frmitems.cxx. These are separate future corrections. Other module operations remain unverified; no broad parity promotion. Product save/open/recovery decisions are unchanged."
id_source: "generated"
---
## Summary

Match SfxItemSet invalid-as-default copying

One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.

## Scope

- In scope: One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
- Out of scope: unrelated refactors not required for "Match SfxItemSet invalid-as-default copying".

## Plan

1. Compare SfxItemSet::Put(const SfxItemSet&, bool) and PutImpl with the pinned header default. 2. Add invalidAsDefault=true to PutSet; clear direct invalid targets by default, ignore incoming disabled states, and retain the source return behavior for explicit invalid copying. Keep clone-constructor copying independent. 3. Assert all modes, wider ranges, unchanged source, Writer style/node fallback and clone state preservation in the two existing tests. Append bounded runtime evidence. 4. Run focused tests, full npm run verify, doctor/routing; commit the four declared files plus task artifacts and close. No policy, inventory mechanism, save/open/recovery changes.

## Verify Steps

1. Focused itemset and writer-attributes tests assert default invalid clearing, ignored disabled input, explicit invalid-state copying and exact return values, supported copying from wider sources, unchanged source and preserved clone states. Writer node and format inheritance resolves after direct invalid-value clearing. 2. npm run verify passes all gates at 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; only the four declared source/test/inventory files and task artifacts change; final tracked checkout is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T15:11:04.756Z — VERIFY — ok

By: CODER

Note: PutSet defaults, INVALID/DISABLED handling and return values match pinned source; 22 focused tests and full npm run verify passed (564 app, 109 inventory, 19 browser, 100% coverage), doctor and routing passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:11:04.391Z, excerpt_hash=sha256:da3c7482f975fe79fc5bf91a720c0cb77a7503760e194d1386d3de54e2f648d2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301502-ZN5HAJ/blueprint/resolved-snapshot.json
- old_digest: a930efebeeef731661f3a609bce27a81fef18d42318c46737e73feb1bab22555
- current_digest: a930efebeeef731661f3a609bce27a81fef18d42318c46737e73feb1bab22555
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301502-ZN5HAJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609301502-ZN5HAJ -m 🧩 ZN5HAJ task: persist canonical task artifacts --allow-tasks
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

Pinned include/svl/itemset.hxx defaults bInvalidAsDefault to true; itemset.cxx Put clears direct entries for INVALID by default, ignores incoming DISABLED through PutImpl, and does not set the return flag solely for explicit false invalid-state copying. Local PutSet now follows these rules. Command: npm exec --workspace @vite-office/office -- vitest run src/svl/source/items/itemset.test.ts src/sw/source/core/doc/writer-attributes.test.ts. Result: pass, 22/22 tests; three tests failed before the correction, including Writer inheritance resolving to the pool default instead of its parent style. Scope: all flag modes, exact return values, wider ranges, ignored disabled state, untouched source, node/style fallback and preserved full-clone states. Command: npm run verify. Result: pass, 564 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all static/source/inventory gates. Evidence: verify.log. Command: ap doctor and policy routing. Result: pass with existing unrelated warnings. Residual audit findings: explicit out-of-range InvalidateItem/DisableItem still throw instead of the pinned no-op; frame margin item classes remain combined in paraitem.ts although their implementation owner is frmitems.cxx. These are separate future corrections. Other module operations remain unverified; no broad parity promotion. Product save/open/recovery decisions are unchanged.
