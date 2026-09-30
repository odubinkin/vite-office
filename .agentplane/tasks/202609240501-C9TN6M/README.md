---
id: "202609240501-C9TN6M"
title: "Close implemented runtime parity audit"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202609240501-23YVPN"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T08:38:51.517Z"
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
    body: "Start: audit the complete implemented runtime against pinned source and close only on operation-level evidence."
events:
  -
    type: "status"
    at: "2026-09-24T08:39:02.048Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit the complete implemented runtime against pinned source and close only on operation-level evidence."
doc_version: 3
doc_updated_at: "2026-09-30T16:01:25.195Z"
doc_updated_by: "CODER"
description: "Stage 8: run full checks and operation-level review of implemented browser-relevant runtime; record evidence and remaining explicit exceptions"
sections:
  Summary: |-
    Close implemented runtime parity audit

    Stage 8: run full checks and operation-level review of implemented browser-relevant runtime; record evidence and remaining explicit exceptions
  Scope: |-
    - In scope: Stage 8: run full checks and operation-level review of implemented browser-relevant runtime; record evidence and remaining explicit exceptions.
    - Out of scope: unrelated refactors not required for "Close implemented runtime parity audit".
  Plan: |-
    1. Run all source-tree, provenance, inventory, type, lint, unit, browser, ODT fixture and static build gates on the implemented slice.
    2. Enumerate each currently reachable module operation and residual unverified/divergent record; compare contract, defaults, behavior and source responsibility against pinned LibreOffice source or an explicit browser exception. Record atomic evidence without promoting whole modules from narrow tests.
    3. Repair every demonstrated browser-relevant mismatch in the matching upstream-shaped owner, add differential/source-backed assertions, and update only inventory/provenance data.
    4. Re-run the full gates and review every remaining record by hand. Close only if all implemented browser-relevant operations have defensible evidence and exceptions; otherwise preserve truthful findings and continue the audit.
  Verify Steps: |-
    1. npm run verify, source-tree, provenance, inventory, type, lint, unit, browser, ODT fixture and static build gates pass on final code.
    2. Every implemented browser-relevant operation has a pinned source file/symbol or explicit browser exception, compatible type/default/ownership and assertion-level or differential behavior evidence; no unsupported native operation is silently treated as implemented.
    3. All residual unverified/divergent runtime and command records are reviewed individually and either resolved with evidence, repaired, or explicitly scoped as browser exception; no blanket module promotion.
    4. Source paths and inventory data match actual files and exports; task-scoped diff and tracked checkout are clean.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Scoped parity fixes completed on 2026-09-24: SwFlowFrame paragraph spacing now retains both margins for mixed contextual-spacing flags when PARA_SPACE_MAX is enabled; SwTransferable now copies and cuts selections consisting only of paragraph boundaries while still rejecting coincident endpoints. Command: npm run verify. Result: pass. Evidence: 488/488 application unit tests, 98/98 inventory tests, 14/14 browser tests, 100% required coverage, static build and source checks passed. Scope: these two Writer behaviors and their regression tests. The broader operation-level Stage 8 audit remains in progress and is not declared complete.

    Progress on 2026-09-30: eight bounded corrections were completed in separate tasks, without closing the overall audit: 202609301433-Z6WPSC (d17c8bd, signed paragraph side margins and unsnapped decrease); 202609301437-ET663N (7ea0a3f, Put out-of-range filtering); 202609301452-WQ0C2J (ba5d182, clone parent/state and cross-pool contracts); 202609301502-ZN5HAJ (9935632, PutSet invalid-as-default and disabled filtering); 202609301514-CTCC8R (a27de86, explicit state setter range filtering); 202609301526-CHAQ5Y (366dc44, frame margin/spacing classes moved unchanged to the corresponding frmitems owner, twenty direct consumers and existing tests relocated); 202609301539-JQNMYH (693a211, SwAttrSet polymorphic Clone preserves same-pool Writer type and pinned generic/Writer destination branches); 202609301551-S2X2YK (380c4b5, source-style parent reference assignment and inherited pool-default delegation). Each task records source-backed assertions and full verification. Latest npm run verify: pass, 570 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all other gates. A transient TXT-save timing failure in ET663N passed isolated and complete retries without changing save behavior; its diagnostics are retained in that task. Deliberate save/open/recovery decisions remain intact. The two previously recorded explicit-state and source-owner follow-ups are now resolved. The SwAttrSet Clone follow-up is now resolved with direct assertions for all destination branches, including the unusual pinned empty foreign Writer-pool result. Parent assignment/default ownership is now resolved with distinct child/parent/grandparent pool assertions. Next independent correction is source-backed: pinned SfxItemSet::Get returns DISABLED_POOL_ITEM for an explicit disabled entry, while local Get returns a pool default. The pinned singleton belongs to svl/source/items/poolitem.cxx::DisabledItem and Clone returns nullptr; implementing it must preserve sentinel identity, inherited lookup, state-only GetItemIfSet behavior, and ordinary item clone/codec contracts. This remains unimplemented and unverified. Other unverified operations remain open and no whole-module parity has been inferred.
id_source: "generated"
---
## Summary

Close implemented runtime parity audit

Stage 8: run full checks and operation-level review of implemented browser-relevant runtime; record evidence and remaining explicit exceptions

## Scope

- In scope: Stage 8: run full checks and operation-level review of implemented browser-relevant runtime; record evidence and remaining explicit exceptions.
- Out of scope: unrelated refactors not required for "Close implemented runtime parity audit".

## Plan

1. Run all source-tree, provenance, inventory, type, lint, unit, browser, ODT fixture and static build gates on the implemented slice.
2. Enumerate each currently reachable module operation and residual unverified/divergent record; compare contract, defaults, behavior and source responsibility against pinned LibreOffice source or an explicit browser exception. Record atomic evidence without promoting whole modules from narrow tests.
3. Repair every demonstrated browser-relevant mismatch in the matching upstream-shaped owner, add differential/source-backed assertions, and update only inventory/provenance data.
4. Re-run the full gates and review every remaining record by hand. Close only if all implemented browser-relevant operations have defensible evidence and exceptions; otherwise preserve truthful findings and continue the audit.

## Verify Steps

1. npm run verify, source-tree, provenance, inventory, type, lint, unit, browser, ODT fixture and static build gates pass on final code.
2. Every implemented browser-relevant operation has a pinned source file/symbol or explicit browser exception, compatible type/default/ownership and assertion-level or differential behavior evidence; no unsupported native operation is silently treated as implemented.
3. All residual unverified/divergent runtime and command records are reviewed individually and either resolved with evidence, repaired, or explicitly scoped as browser exception; no blanket module promotion.
4. Source paths and inventory data match actual files and exports; task-scoped diff and tracked checkout are clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Scoped parity fixes completed on 2026-09-24: SwFlowFrame paragraph spacing now retains both margins for mixed contextual-spacing flags when PARA_SPACE_MAX is enabled; SwTransferable now copies and cuts selections consisting only of paragraph boundaries while still rejecting coincident endpoints. Command: npm run verify. Result: pass. Evidence: 488/488 application unit tests, 98/98 inventory tests, 14/14 browser tests, 100% required coverage, static build and source checks passed. Scope: these two Writer behaviors and their regression tests. The broader operation-level Stage 8 audit remains in progress and is not declared complete.

Progress on 2026-09-30: eight bounded corrections were completed in separate tasks, without closing the overall audit: 202609301433-Z6WPSC (d17c8bd, signed paragraph side margins and unsnapped decrease); 202609301437-ET663N (7ea0a3f, Put out-of-range filtering); 202609301452-WQ0C2J (ba5d182, clone parent/state and cross-pool contracts); 202609301502-ZN5HAJ (9935632, PutSet invalid-as-default and disabled filtering); 202609301514-CTCC8R (a27de86, explicit state setter range filtering); 202609301526-CHAQ5Y (366dc44, frame margin/spacing classes moved unchanged to the corresponding frmitems owner, twenty direct consumers and existing tests relocated); 202609301539-JQNMYH (693a211, SwAttrSet polymorphic Clone preserves same-pool Writer type and pinned generic/Writer destination branches); 202609301551-S2X2YK (380c4b5, source-style parent reference assignment and inherited pool-default delegation). Each task records source-backed assertions and full verification. Latest npm run verify: pass, 570 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all other gates. A transient TXT-save timing failure in ET663N passed isolated and complete retries without changing save behavior; its diagnostics are retained in that task. Deliberate save/open/recovery decisions remain intact. The two previously recorded explicit-state and source-owner follow-ups are now resolved. The SwAttrSet Clone follow-up is now resolved with direct assertions for all destination branches, including the unusual pinned empty foreign Writer-pool result. Parent assignment/default ownership is now resolved with distinct child/parent/grandparent pool assertions. Next independent correction is source-backed: pinned SfxItemSet::Get returns DISABLED_POOL_ITEM for an explicit disabled entry, while local Get returns a pool default. The pinned singleton belongs to svl/source/items/poolitem.cxx::DisabledItem and Clone returns nullptr; implementing it must preserve sentinel identity, inherited lookup, state-only GetItemIfSet behavior, and ordinary item clone/codec contracts. This remains unimplemented and unverified. Other unverified operations remain open and no whole-module parity has been inferred.
