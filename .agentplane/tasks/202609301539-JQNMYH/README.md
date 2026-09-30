---
id: "202609301539-JQNMYH"
title: "Match SwAttrSet polymorphic clone contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T15:40:23.251Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T15:48:18.277Z"
  updated_by: "CODER"
  note: "13 focused tests, full npm run verify, doctor and routing passed; source-specific clone branches documented with pinned evidence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T15:48:49.367Z"
  updated_by: "EVALUATOR"
  note: "SwAttrSet polymorphic cloning follows the pinned same-pool and foreign-pool branches."
  evaluated_sha: "693a211aa63429f2cd03479df2b19fdd65f8b4c5"
  blueprint_digest: "f7543bc9bb3b086b1eb18658b2dcd5f88c52a0672b18402312aa6b8590a27522"
  evidence_refs:
    - ".agentplane/tasks/202609301539-JQNMYH/README.md"
    - ".agentplane/tasks/202609301539-JQNMYH/quality/20260930-154849367-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301539-JQNMYH/quality/20260930-154849367-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301539-JQNMYH/quality/20260930-154849367-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301539-JQNMYH/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301539-JQNMYH/verify.log"
  findings:
    - "Reviewed virtual dispatch, subtype and destination document identity, independent direct values/states, empty clones, generic SET-only delegation and the unusual pinned empty foreign Writer-pool destination. Scope remains limited to the declared three files and task artifacts; full verification passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: match the existing SwAttrSet Clone contract to all pinned same-pool and foreign-pool branches with focused regression evidence."
events:
  -
    type: "status"
    at: "2026-09-30T15:40:23.917Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: match the existing SwAttrSet Clone contract to all pinned same-pool and foreign-pool branches with focused regression evidence."
  -
    type: "verify"
    at: "2026-09-30T15:48:18.277Z"
    author: "CODER"
    state: "ok"
    note: "13 focused tests, full npm run verify, doctor and routing passed; source-specific clone branches documented with pinned evidence."
doc_version: 3
doc_updated_at: "2026-09-30T15:48:18.357Z"
doc_updated_by: "CODER"
description: "One source-backed correction under the approved iterative parity audit: override existing inherited Clone to preserve Writer type and pinned same-pool/cross-pool contracts, without changing unsupported native APIs or product deviations."
sections:
  Summary: |-
    Match SwAttrSet polymorphic clone contracts

    One source-backed correction under the approved iterative parity audit: override existing inherited Clone to preserve Writer type and pinned same-pool/cross-pool contracts, without changing unsupported native APIs or product deviations.
  Scope: "Exactly sw/source/core/attr/swatrset.ts, sw/source/core/doc/writer-attributes.test.ts, docs/program/parity/runtime-inventory.json, and canonical task artifacts. Source of truth: pinned sw/source/core/attr/swatrset.cxx::SwAttrSet::Clone and CloneAsValue, svl/source/items/itemset.cxx::SfxItemSet::Clone, include/svl/itemiter.hxx. No class-wide parity promotion."
  Plan: "CODER repairs one inherited polymorphic Clone contract in apps/office/src/sw/source/core/attr/swatrset.ts. Same-pool Clone reuses CloneAsValue so full clones preserve Writer subtype, parent, independent SET items and INVALID/DISABLED states while empty clones have no parent or entries. Different generic pool delegates to SfxItemSet.Clone and copies SET values only. Different SwAttrPool returns a fresh empty SwAttrSet as the pinned implementation iterates its newly created empty destination. Add source-specific regression coverage to apps/office/src/sw/source/core/doc/writer-attributes.test.ts and append honest narrow evidence to docs/program/parity/runtime-inventory.json. Run focused red/green tests, full npm run verify, doctor and routing; record quality review and close cleanly. No other modules, inventory tooling, network or conscious save/open/recovery deviations."
  Verify Steps: "1. Focused Writer attribute tests reproduce subtype loss and foreign Writer-pool copying before the fix, then verify virtual dispatch through SfxItemSet, default/explicit same pool, full and empty clones, parent and all direct state/value independence. 2. Confirm foreign generic pool clones copy directly SET values only and drop parent/INVALID/DISABLED; foreign Writer pool clones remain empty and retain Writer type/document identity exactly as pinned destination iteration does. 3. npm run verify passes all gates at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; source/inventory diffs remain within declared scope and final git status is clean."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T15:48:18.277Z — VERIFY — ok

    By: CODER

    Note: 13 focused tests, full npm run verify, doctor and routing passed; source-specific clone branches documented with pinned evidence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:48:17.802Z, excerpt_hash=sha256:153b598ce594c10b0da37da2d5a53b29df25067ef832b1a7509415e1296a1fba

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301539-JQNMYH/blueprint/resolved-snapshot.json
    - old_digest: f7543bc9bb3b086b1eb18658b2dcd5f88c52a0672b18402312aa6b8590a27522
    - current_digest: f7543bc9bb3b086b1eb18658b2dcd5f88c52a0672b18402312aa6b8590a27522
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301539-JQNMYH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301539-JQNMYH
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Command: focused Vitest writer-attributes.test.ts from apps/office. Result: two new tests failed before implementation with SfxItemSet instead of SwAttrSet; all 13 passed after the override. Evidence: same-pool virtual dispatch preserves Writer subtype/document, parent, independent SET values and INVALID/DISABLED states; empty clones omit parent/state/value entries. Foreign generic pools delegate to SET-only base cloning. Foreign Writer pools remain empty with destination document identity: pinned SwAttrSet::Clone iterates its newly constructed empty pTmpSet, and SfxItemIter begins at map.begin/end. This unusual source behavior is preserved, not silently repaired. Command: npm run verify. Result: pass; 568 application tests, 109 inventory tests, 19 browser scenarios, 100% required coverage and all type/static/source/provenance/invariant/parity gates. Evidence: verify.log; semanticViolationCount 0. Command: ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass with pre-existing doctor warnings only. Scope: one polymorphic clone contract and source-backed tests/inventory evidence; other module contracts remain unverified. No product exception changed."
id_source: "generated"
---
## Summary

Match SwAttrSet polymorphic clone contracts

One source-backed correction under the approved iterative parity audit: override existing inherited Clone to preserve Writer type and pinned same-pool/cross-pool contracts, without changing unsupported native APIs or product deviations.

## Scope

Exactly sw/source/core/attr/swatrset.ts, sw/source/core/doc/writer-attributes.test.ts, docs/program/parity/runtime-inventory.json, and canonical task artifacts. Source of truth: pinned sw/source/core/attr/swatrset.cxx::SwAttrSet::Clone and CloneAsValue, svl/source/items/itemset.cxx::SfxItemSet::Clone, include/svl/itemiter.hxx. No class-wide parity promotion.

## Plan

CODER repairs one inherited polymorphic Clone contract in apps/office/src/sw/source/core/attr/swatrset.ts. Same-pool Clone reuses CloneAsValue so full clones preserve Writer subtype, parent, independent SET items and INVALID/DISABLED states while empty clones have no parent or entries. Different generic pool delegates to SfxItemSet.Clone and copies SET values only. Different SwAttrPool returns a fresh empty SwAttrSet as the pinned implementation iterates its newly created empty destination. Add source-specific regression coverage to apps/office/src/sw/source/core/doc/writer-attributes.test.ts and append honest narrow evidence to docs/program/parity/runtime-inventory.json. Run focused red/green tests, full npm run verify, doctor and routing; record quality review and close cleanly. No other modules, inventory tooling, network or conscious save/open/recovery deviations.

## Verify Steps

1. Focused Writer attribute tests reproduce subtype loss and foreign Writer-pool copying before the fix, then verify virtual dispatch through SfxItemSet, default/explicit same pool, full and empty clones, parent and all direct state/value independence. 2. Confirm foreign generic pool clones copy directly SET values only and drop parent/INVALID/DISABLED; foreign Writer pool clones remain empty and retain Writer type/document identity exactly as pinned destination iteration does. 3. npm run verify passes all gates at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; source/inventory diffs remain within declared scope and final git status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T15:48:18.277Z — VERIFY — ok

By: CODER

Note: 13 focused tests, full npm run verify, doctor and routing passed; source-specific clone branches documented with pinned evidence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:48:17.802Z, excerpt_hash=sha256:153b598ce594c10b0da37da2d5a53b29df25067ef832b1a7509415e1296a1fba

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301539-JQNMYH/blueprint/resolved-snapshot.json
- old_digest: f7543bc9bb3b086b1eb18658b2dcd5f88c52a0672b18402312aa6b8590a27522
- current_digest: f7543bc9bb3b086b1eb18658b2dcd5f88c52a0672b18402312aa6b8590a27522
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301539-JQNMYH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301539-JQNMYH
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: focused Vitest writer-attributes.test.ts from apps/office. Result: two new tests failed before implementation with SfxItemSet instead of SwAttrSet; all 13 passed after the override. Evidence: same-pool virtual dispatch preserves Writer subtype/document, parent, independent SET values and INVALID/DISABLED states; empty clones omit parent/state/value entries. Foreign generic pools delegate to SET-only base cloning. Foreign Writer pools remain empty with destination document identity: pinned SwAttrSet::Clone iterates its newly constructed empty pTmpSet, and SfxItemIter begins at map.begin/end. This unusual source behavior is preserved, not silently repaired. Command: npm run verify. Result: pass; 568 application tests, 109 inventory tests, 19 browser scenarios, 100% required coverage and all type/static/source/provenance/invariant/parity gates. Evidence: verify.log; semanticViolationCount 0. Command: ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass with pre-existing doctor warnings only. Scope: one polymorphic clone contract and source-backed tests/inventory evidence; other module contracts remain unverified. No product exception changed.
