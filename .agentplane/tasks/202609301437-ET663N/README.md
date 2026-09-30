---
id: "202609301437-ET663N"
title: "Match SfxItemSet Put range filtering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T14:37:39.564Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T14:49:47.690Z"
  updated_by: "CODER"
  note: "SfxItemSet Put range filtering matches pinned PutImpl; focused tests and complete npm run verify retry passed. Earlier unrelated TXT-save timing failure is recorded and passed isolated and full retries without changes."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align bounded SfxItemSet Put range filtering with pinned upstream, validate wider-source copying and preserve explicit state contracts."
events:
  -
    type: "status"
    at: "2026-09-30T14:37:40.258Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align bounded SfxItemSet Put range filtering with pinned upstream, validate wider-source copying and preserve explicit state contracts."
  -
    type: "verify"
    at: "2026-09-30T14:49:47.690Z"
    author: "CODER"
    state: "ok"
    note: "SfxItemSet Put range filtering matches pinned PutImpl; focused tests and complete npm run verify retry passed. Earlier unrelated TXT-save timing failure is recorded and passed isolated and full retries without changes."
doc_version: 3
doc_updated_at: "2026-09-30T14:49:47.765Z"
doc_updated_by: "CODER"
description: "One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations."
sections:
  Summary: |-
    Match SfxItemSet Put range filtering

    One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.
  Scope: |-
    - In scope: One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.
    - Out of scope: unrelated refactors not required for "Match SfxItemSet Put range filtering".
  Plan: "1. Compare SfxItemSet.Put and PutSet range handling with pinned svl/source/items/itemset.cxx::SfxItemSet::PutImpl and Put. 2. Replace the Put out-of-range exception with an unchanged undefined result; preserve strict explicit state validation. 3. Assert zero/out-of-range values, unchanged state, and copying a wider item set containing supported and unsupported values. Update only focused runtime inventory evidence. 4. Run focused itemset tests and full npm run verify plus doctor/routing, commit the three scoped files, record quality and close."
  Verify Steps: "1. Focused itemset tests prove Put ignores unsupported WhichIds without state changes and PutSet copies supported entries from a wider source. Existing inheritance, invalid/disabled states, cloning, equality and persistence assertions still pass. 2. npm run verify passes all required gates with 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff contains only itemset.ts, itemset.test.ts, runtime-inventory.json and this task artifacts; tracked checkout is clean after closure."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T14:49:47.690Z — VERIFY — ok

    By: CODER

    Note: SfxItemSet Put range filtering matches pinned PutImpl; focused tests and complete npm run verify retry passed. Earlier unrelated TXT-save timing failure is recorded and passed isolated and full retries without changes.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T14:49:47.161Z, excerpt_hash=sha256:946e3b742fc5214894f2595f9f20c9d093b4f979d25acc79b593938ccebfb4b8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301437-ET663N/blueprint/resolved-snapshot.json
    - old_digest: cb4c25e3d23d912493cce6d19448f4212cc6b7ee450815c23759c03aefeb023f
    - current_digest: cb4c25e3d23d912493cce6d19448f4212cc6b7ee450815c23759c03aefeb023f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301437-ET663N

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609301437-ET663N -m 🧩 ET663N task: persist canonical task artifacts --allow-tasks
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
  Findings: "Pinned SfxItemSet::PutImpl returns nullptr for out-of-range items, so Put now returns undefined without mutation. Focused command: npm exec --workspace @vite-office/office -- vitest run src/svl/source/items/itemset.test.ts. Result: pass, 9/9 tests; three assertions failed before the fix. Scope: unsupported WhichIds including zero, unchanged local/inherited state, supported values copied from wider sources, repeated no-op copying. First full verification had one TXT-save timing failure at desktop.test.tsx:441 (559/560 passed); isolated retry passed without any production/test change, then the complete npm run verify retry passed 560 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all static/source/inventory gates. See verify-first-failure.log, desktop-retry.log and verify.log. ap doctor and policy routing: pass with existing unrelated warnings. Other PutSet sentinel/default and Clone inheritance contracts remain unverified; no whole-module promotion. Product save/open/recovery decisions are unchanged."
id_source: "generated"
---
## Summary

Match SfxItemSet Put range filtering

One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.

## Scope

- In scope: One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.
- Out of scope: unrelated refactors not required for "Match SfxItemSet Put range filtering".

## Plan

1. Compare SfxItemSet.Put and PutSet range handling with pinned svl/source/items/itemset.cxx::SfxItemSet::PutImpl and Put. 2. Replace the Put out-of-range exception with an unchanged undefined result; preserve strict explicit state validation. 3. Assert zero/out-of-range values, unchanged state, and copying a wider item set containing supported and unsupported values. Update only focused runtime inventory evidence. 4. Run focused itemset tests and full npm run verify plus doctor/routing, commit the three scoped files, record quality and close.

## Verify Steps

1. Focused itemset tests prove Put ignores unsupported WhichIds without state changes and PutSet copies supported entries from a wider source. Existing inheritance, invalid/disabled states, cloning, equality and persistence assertions still pass. 2. npm run verify passes all required gates with 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff contains only itemset.ts, itemset.test.ts, runtime-inventory.json and this task artifacts; tracked checkout is clean after closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T14:49:47.690Z — VERIFY — ok

By: CODER

Note: SfxItemSet Put range filtering matches pinned PutImpl; focused tests and complete npm run verify retry passed. Earlier unrelated TXT-save timing failure is recorded and passed isolated and full retries without changes.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T14:49:47.161Z, excerpt_hash=sha256:946e3b742fc5214894f2595f9f20c9d093b4f979d25acc79b593938ccebfb4b8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301437-ET663N/blueprint/resolved-snapshot.json
- old_digest: cb4c25e3d23d912493cce6d19448f4212cc6b7ee450815c23759c03aefeb023f
- current_digest: cb4c25e3d23d912493cce6d19448f4212cc6b7ee450815c23759c03aefeb023f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301437-ET663N

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609301437-ET663N -m 🧩 ET663N task: persist canonical task artifacts --allow-tasks
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

Pinned SfxItemSet::PutImpl returns nullptr for out-of-range items, so Put now returns undefined without mutation. Focused command: npm exec --workspace @vite-office/office -- vitest run src/svl/source/items/itemset.test.ts. Result: pass, 9/9 tests; three assertions failed before the fix. Scope: unsupported WhichIds including zero, unchanged local/inherited state, supported values copied from wider sources, repeated no-op copying. First full verification had one TXT-save timing failure at desktop.test.tsx:441 (559/560 passed); isolated retry passed without any production/test change, then the complete npm run verify retry passed 560 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all static/source/inventory gates. See verify-first-failure.log, desktop-retry.log and verify.log. ap doctor and policy routing: pass with existing unrelated warnings. Other PutSet sentinel/default and Clone inheritance contracts remain unverified; no whole-module promotion. Product save/open/recovery decisions are unchanged.
