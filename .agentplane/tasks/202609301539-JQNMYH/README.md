---
id: "202609301539-JQNMYH"
title: "Match SwAttrSet polymorphic clone contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-09-30T15:40:23.917Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
