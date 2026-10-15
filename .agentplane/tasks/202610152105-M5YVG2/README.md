---
id: "202610152105-M5YVG2"
title: "Restore native pool-chain ranges and pool-only item-set construction"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T21:06:03.291Z"
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
    body: "Start: restore approved native shared pool-chain/range constructor dependency and portable strict coverage, preserving source cache semantics."
events:
  -
    type: "status"
    at: "2026-10-15T21:06:08.694Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore approved native shared pool-chain/range constructor dependency and portable strict coverage, preserving source cache semantics."
doc_version: 3
doc_updated_at: "2026-10-15T21:06:08.694Z"
doc_updated_by: "CODER"
description: "Task172: implement real SfxItemPool master/secondary links, merged ranges and chain resolution plus native pool-only SfxItemSet constructor, reusing JS range values and existing item metadata. Required for native style base GetItemSet; no memory/refcount library or fabricated Calc pool."
sections:
  Summary: "Restore pool-derived item-set ranges required by SfxStyleSheetBase.GetItemSet. Reuse actual shared items, metadata, pool and JS range values; preserve native linked-pool and range-cache behavior."
  Scope: "Task172: shared svl itempool/itemset and canonical whichranges type boundary, native MergeRange value operation, real chain routing/master links and pool-only constructor; related tests and shared browser; runtime/provenance/capability metadata, readiness and suspicious-source journal. Maximum30 non-task files. Existing explicit-range Writer consumers and browser snapshot registry remain separate existing boundaries; no fabricated metadata inferred from that registry. No full pool-copy/shutdown/UNO owner claim or memory/probe machinery."
  Plan: "1. Audit native linked pools, GetMergedIdRanges, MergeRange and pool-only item-set constructor. 2. Implement chain links and native metadata/default/slot routing, range value operation and pool-only construction; retain explicit-range callers and original native cache invalidation behavior. 3. Source-derived cases cover real metadata packages, detach/reattach master propagation, cache snapshots, default/slot ownership and range union boundaries; prove direct first imports and JS/native sorted-range predicate equivalence. 4. Strict changed shared/allCalc100, related Writer functions,13source gates,production build and real Chromium. 5. Register truthful partial scope, verify/commit/evaluate/close; leave full document/UI/ODS goal active."
  Verify Steps: "Run node output/playwright/task172-checks/native-audit.mjs for pinned itempool/itemset/whichranges headers and sources, original native QA context and MergeRange sorted-input predicate proof. Run node output/playwright/task172-checks/portable.mjs: exact changed shared owner raw S/B/F/L100 and all33Calc100, related item/Writer functional scenarios, Writer-only coverage exempt. Run node output/playwright/task172-checks/source-gates.mjs for13standard gates. Run node output/playwright/task172-checks/build-browser-portable.mjs for production build and actual pool/chain/set Chromium scenario, including pool-first import behavior. Native reference links absent during runtime/restored finally. Preserve source cache behavior and document suspicious findings. Full all-app run deferred until user-defined minimum UI/ODS milestone, not performed now."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task172 source/registry/docs commits, preserving calc branch, unrelated tasks and reference symlinks. No history rewrite, branch merge or changes to thresholds/coverage instrumentation."
  Findings: ""
id_source: "generated"
---
## Summary

Restore pool-derived item-set ranges required by SfxStyleSheetBase.GetItemSet. Reuse actual shared items, metadata, pool and JS range values; preserve native linked-pool and range-cache behavior.

## Scope

Task172: shared svl itempool/itemset and canonical whichranges type boundary, native MergeRange value operation, real chain routing/master links and pool-only constructor; related tests and shared browser; runtime/provenance/capability metadata, readiness and suspicious-source journal. Maximum30 non-task files. Existing explicit-range Writer consumers and browser snapshot registry remain separate existing boundaries; no fabricated metadata inferred from that registry. No full pool-copy/shutdown/UNO owner claim or memory/probe machinery.

## Plan

1. Audit native linked pools, GetMergedIdRanges, MergeRange and pool-only item-set constructor. 2. Implement chain links and native metadata/default/slot routing, range value operation and pool-only construction; retain explicit-range callers and original native cache invalidation behavior. 3. Source-derived cases cover real metadata packages, detach/reattach master propagation, cache snapshots, default/slot ownership and range union boundaries; prove direct first imports and JS/native sorted-range predicate equivalence. 4. Strict changed shared/allCalc100, related Writer functions,13source gates,production build and real Chromium. 5. Register truthful partial scope, verify/commit/evaluate/close; leave full document/UI/ODS goal active.

## Verify Steps

Run node output/playwright/task172-checks/native-audit.mjs for pinned itempool/itemset/whichranges headers and sources, original native QA context and MergeRange sorted-input predicate proof. Run node output/playwright/task172-checks/portable.mjs: exact changed shared owner raw S/B/F/L100 and all33Calc100, related item/Writer functional scenarios, Writer-only coverage exempt. Run node output/playwright/task172-checks/source-gates.mjs for13standard gates. Run node output/playwright/task172-checks/build-browser-portable.mjs for production build and actual pool/chain/set Chromium scenario, including pool-first import behavior. Native reference links absent during runtime/restored finally. Preserve source cache behavior and document suspicious findings. Full all-app run deferred until user-defined minimum UI/ODS milestone, not performed now.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task172 source/registry/docs commits, preserving calc branch, unrelated tasks and reference symlinks. No history rewrite, branch merge or changes to thresholds/coverage instrumentation.

## Findings
