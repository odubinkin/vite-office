---
id: "202609240501-C9TN6M"
title: "Close implemented runtime parity audit"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
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
doc_updated_at: "2026-09-30T17:04:21.398Z"
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

    Progress on 2026-09-30: twelve bounded corrections were completed in separate tasks, without closing the overall audit: 202609301433-Z6WPSC (d17c8bd, signed paragraph side margins and unsnapped decrease); 202609301437-ET663N (7ea0a3f, Put out-of-range filtering); 202609301452-WQ0C2J (ba5d182, clone parent/state and cross-pool contracts); 202609301502-ZN5HAJ (9935632, PutSet invalid-as-default and disabled filtering); 202609301514-CTCC8R (a27de86, explicit state setter range filtering); 202609301526-CHAQ5Y (366dc44, frame margin/spacing classes moved unchanged to the corresponding frmitems owner, twenty direct consumers and existing tests relocated); 202609301539-JQNMYH (693a211, SwAttrSet polymorphic Clone preserves same-pool Writer type and pinned generic/Writer destination branches); 202609301551-S2X2YK (380c4b5, source-style parent reference assignment and inherited pool-default delegation); 202609301603-AEE039 (1055b57, poolitem-owned disabled singleton, null Clone contract and disabled Get identity); 202609301617-7M8MJP (1b562ee, native single-map SfxItemSet value/state storage and distinct poolitem-owned INVALID singleton); 202609301639-P4J3MC (9fab51e, signed sal_Int32 tab positions/direct default distances and negative ODF tab import); 202609301651-QBNFD9 (982cc88, source-order Default tab sequence selection before canonical sorting). Each task records source-backed assertions and full verification. Latest npm run verify: pass, 577 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all other gates. A transient TXT-save timing failure in ET663N passed isolated and complete retries without changing save behavior; its diagnostics are retained in that task. Deliberate save/open/recovery decisions remain intact. The two previously recorded explicit-state and source-owner follow-ups are now resolved. The SwAttrSet Clone follow-up is now resolved with direct assertions for all destination branches, including the unusual pinned empty foreign Writer-pool result. Parent assignment/default ownership is now resolved with distinct child/parent/grandparent pool assertions. The disabled Get follow-up is resolved, including WhichId zero, null Clone, pointer identity, clone-state preservation and non-persistence assertions. The temporary dual-map item-set representation is now resolved: one WhichId-to-item PoolItemMap stores ordinary values and distinct INVALID/DISABLED singleton pointers, with source-style transitions and preserved clone, PutSet and sorted SET-only browser projection contracts. The first full run identified two existing ODT corruption tests depending on the removed private items field; they were adapted with unchanged rejection assertions, and the complete rerun passed. Task-local diagnostics are retained. The signed-tab follow-up is now resolved with endpoint/ordering/replacement/clone/real Writer-pool codec assertions and real negative direct/inherited-style ODT input/export/reimport evidence. The direct setter remains distinct from native UNO PutValue negative-distance validation. Wider XML behavior/contracts are now honestly marked unverified rather than treating bounded sequence tests as whole-module parity. The Default-tab selection follow-up is now resolved. Six literal sequence fixtures verify original source order, first Default exclusivity, omission of later Defaults, empty/signed sequences and retained fields across direct/inherited-style import and canonical export/reimport. The contradictory previous middle-Default assertion now follows pinned behavior. Next architecture correction: XMLTextPropertySetContext.ts currently owns the dispatch context, the embedded XMLTabStopsContext parser/sequence selection, and a shared importOdfLength converter imported by xmlstyle.ts, XMLTableImport.ts and XMLLineNumberingImportContext.ts. Pinned XMLTextPropertySetContext.cxx dispatches to SvxXMLTabStopImportContext from xmloff/source/style/xmltabi.cxx, while generic conversion belongs to xmloff/source/core/xmluconv.cxx. Refactor the implemented responsibilities into the corresponding local style/xmltabi.ts and core/xmluconv.ts owners, use the native tab context name, and update every direct consumer/provenance record without a compatibility re-export or changing existing behavior. This ownership mismatch has no registered conscious deviation and remains unresolved. Separately, source-backed tab leaf defaults/fallback (position initializes to zero and only recognized alignment values overwrite Left) and generated-stop constructor uniqueness/domain contracts remain open for later bounded correction. Whole XML-module behavior/contracts remain unverified. Other unverified operations remain open and no whole-module parity has been inferred.
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

Progress on 2026-09-30: twelve bounded corrections were completed in separate tasks, without closing the overall audit: 202609301433-Z6WPSC (d17c8bd, signed paragraph side margins and unsnapped decrease); 202609301437-ET663N (7ea0a3f, Put out-of-range filtering); 202609301452-WQ0C2J (ba5d182, clone parent/state and cross-pool contracts); 202609301502-ZN5HAJ (9935632, PutSet invalid-as-default and disabled filtering); 202609301514-CTCC8R (a27de86, explicit state setter range filtering); 202609301526-CHAQ5Y (366dc44, frame margin/spacing classes moved unchanged to the corresponding frmitems owner, twenty direct consumers and existing tests relocated); 202609301539-JQNMYH (693a211, SwAttrSet polymorphic Clone preserves same-pool Writer type and pinned generic/Writer destination branches); 202609301551-S2X2YK (380c4b5, source-style parent reference assignment and inherited pool-default delegation); 202609301603-AEE039 (1055b57, poolitem-owned disabled singleton, null Clone contract and disabled Get identity); 202609301617-7M8MJP (1b562ee, native single-map SfxItemSet value/state storage and distinct poolitem-owned INVALID singleton); 202609301639-P4J3MC (9fab51e, signed sal_Int32 tab positions/direct default distances and negative ODF tab import); 202609301651-QBNFD9 (982cc88, source-order Default tab sequence selection before canonical sorting). Each task records source-backed assertions and full verification. Latest npm run verify: pass, 577 app tests, 109 inventory tests, 19 browser tests, 100% required coverage and all other gates. A transient TXT-save timing failure in ET663N passed isolated and complete retries without changing save behavior; its diagnostics are retained in that task. Deliberate save/open/recovery decisions remain intact. The two previously recorded explicit-state and source-owner follow-ups are now resolved. The SwAttrSet Clone follow-up is now resolved with direct assertions for all destination branches, including the unusual pinned empty foreign Writer-pool result. Parent assignment/default ownership is now resolved with distinct child/parent/grandparent pool assertions. The disabled Get follow-up is resolved, including WhichId zero, null Clone, pointer identity, clone-state preservation and non-persistence assertions. The temporary dual-map item-set representation is now resolved: one WhichId-to-item PoolItemMap stores ordinary values and distinct INVALID/DISABLED singleton pointers, with source-style transitions and preserved clone, PutSet and sorted SET-only browser projection contracts. The first full run identified two existing ODT corruption tests depending on the removed private items field; they were adapted with unchanged rejection assertions, and the complete rerun passed. Task-local diagnostics are retained. The signed-tab follow-up is now resolved with endpoint/ordering/replacement/clone/real Writer-pool codec assertions and real negative direct/inherited-style ODT input/export/reimport evidence. The direct setter remains distinct from native UNO PutValue negative-distance validation. Wider XML behavior/contracts are now honestly marked unverified rather than treating bounded sequence tests as whole-module parity. The Default-tab selection follow-up is now resolved. Six literal sequence fixtures verify original source order, first Default exclusivity, omission of later Defaults, empty/signed sequences and retained fields across direct/inherited-style import and canonical export/reimport. The contradictory previous middle-Default assertion now follows pinned behavior. Next architecture correction: XMLTextPropertySetContext.ts currently owns the dispatch context, the embedded XMLTabStopsContext parser/sequence selection, and a shared importOdfLength converter imported by xmlstyle.ts, XMLTableImport.ts and XMLLineNumberingImportContext.ts. Pinned XMLTextPropertySetContext.cxx dispatches to SvxXMLTabStopImportContext from xmloff/source/style/xmltabi.cxx, while generic conversion belongs to xmloff/source/core/xmluconv.cxx. Refactor the implemented responsibilities into the corresponding local style/xmltabi.ts and core/xmluconv.ts owners, use the native tab context name, and update every direct consumer/provenance record without a compatibility re-export or changing existing behavior. This ownership mismatch has no registered conscious deviation and remains unresolved. Separately, source-backed tab leaf defaults/fallback (position initializes to zero and only recognized alignment values overwrite Left) and generated-stop constructor uniqueness/domain contracts remain open for later bounded correction. Whole XML-module behavior/contracts remain unverified. Other unverified operations remain open and no whole-module parity has been inferred.
