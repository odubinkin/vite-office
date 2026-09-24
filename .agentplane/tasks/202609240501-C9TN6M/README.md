---
id: "202609240501-C9TN6M"
title: "Close implemented runtime parity audit"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
doc_updated_at: "2026-09-24T14:55:08.143Z"
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
  Findings: "Scoped parity fixes completed on 2026-09-24: SwFlowFrame paragraph spacing now retains both margins for mixed contextual-spacing flags when PARA_SPACE_MAX is enabled; SwTransferable now copies and cuts selections consisting only of paragraph boundaries while still rejecting coincident endpoints. Command: npm run verify. Result: pass. Evidence: 488/488 application unit tests, 98/98 inventory tests, 14/14 browser tests, 100% required coverage, static build and source checks passed. Scope: these two Writer behaviors and their regression tests. The broader operation-level Stage 8 audit remains in progress and is not declared complete."
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
