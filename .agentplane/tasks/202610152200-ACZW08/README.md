---
id: "202610152200-ACZW08"
title: "Implement native user defaults in shared item pools for Calc page styles"
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
  updated_at: "2026-10-15T22:02:26.902Z"
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
    body: "Start: implement approved native user-default metadata and actual pool operations using the unchanged shared logical item binder and portable source-backed verification."
events:
  -
    type: "status"
    at: "2026-10-15T22:02:33.489Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native user-default metadata and actual pool operations using the unchanged shared logical item binder and portable source-backed verification."
doc_version: 3
doc_updated_at: "2026-10-15T22:02:33.489Z"
doc_updated_by: "CODER"
description: "Task175: implement actual ItemInfoUser and SfxItemPool Set/Get/ResetUserDefaultItem, original-versus-effective default lookup and shared logical item binding reused with SfxPoolItemHolder. Required by ScStyleSheet page defaults; no custom refcount/cache lifetime engine or fabricated Calc style."
sections:
  Summary: "Implement native user-default item metadata and pool operations required by ScStyleSheet page defaults. Reuse the existing logical value-binding implementation instead of recreating native item lifetime/cache machinery, and distinguish original pool defaults from effective overrides."
  Scope: "Task175: shared svl itempool/itemset implementations and public boundaries, actual ItemInfoUser, native Set/Get/ResetUserDefaultItem and original/default lookup semantics across secondary chains; tests/browser; shared runtime/provenance/capability and readiness/suspected journal. Maximum30non-task files. Existing browser snapshot registry stays a separately declared existing boundary and does not invent native metadata. No pool-copy/shutdown/Sc-style placeholder,refcount/cache/deletion framework,native probe or all-app run."
  Plan: "1. Audit native ItemInfoUser,Set/Get/ResetUserDefaultItem,original-versus-current metadata and Sc page-style caller. 2. Expose the canonical implCreateItemEntry entry over the existing unchanged logical binder; reuse it for ordinary holder and user metadata. Implement original metadata retention/replacement/equality/reset and chain lookup with no physical lifetime engine. 3. Test actual registered static/dynamic metadata,existing effective sets,original/default separation,first equal-value override,unchanged replacement identity,target-pool set copies,chain ownership,reset and defined replacement failure behavior. 4. Token-prove unchanged binder/copy logic,strict changed shared/allCalc100,related Writer functions,13gates,production build and real Chromium/Writer. 5. Record limitations/source-only exception observations honestly,verify/commit/evaluate/close; actual Sc styles/document/UI/ODS remain goal work."
  Verify Steps: "Run node output/playwright/task175-checks/native-audit.mjs for pinned itempool/itemset/poolitem headers/sources and Sc page default caller; exact existing logical binder body token equality,canonical helper binding and native metadata operation evidence. Run portable.mjs for exact changed shared owners raw S/B/F/L100 and all33Calc100,related holders/metadata/sets/Writer functions with Writer-only coverage exempt. Source-derived user-default fixtures use actual packages/pools/items,not fake providers or memory probes; retain original static/dynamic metadata and test replacement no-op/reset/cross-pool values and defined failure paths. Run source-gates.mjs for13standard gates and build-browser-portable.mjs for production build,actual user-default Chromium and targeted Writer startup/load/edit. All4refs absent at runtime/restored finally. Document remaining native pool-copy/shutdown/user interface/Sc models/ODS limitations. Full all-app run deferred to user-defined minimum UI/ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task175 commits, preserving calc branch, unrelated tasks/work, existing shared lifetime-erased value behavior and native symlinks. No branch merges,history rewriting or validator/coverage weakening."
  Findings: ""
id_source: "generated"
---
## Summary

Implement native user-default item metadata and pool operations required by ScStyleSheet page defaults. Reuse the existing logical value-binding implementation instead of recreating native item lifetime/cache machinery, and distinguish original pool defaults from effective overrides.

## Scope

Task175: shared svl itempool/itemset implementations and public boundaries, actual ItemInfoUser, native Set/Get/ResetUserDefaultItem and original/default lookup semantics across secondary chains; tests/browser; shared runtime/provenance/capability and readiness/suspected journal. Maximum30non-task files. Existing browser snapshot registry stays a separately declared existing boundary and does not invent native metadata. No pool-copy/shutdown/Sc-style placeholder,refcount/cache/deletion framework,native probe or all-app run.

## Plan

1. Audit native ItemInfoUser,Set/Get/ResetUserDefaultItem,original-versus-current metadata and Sc page-style caller. 2. Expose the canonical implCreateItemEntry entry over the existing unchanged logical binder; reuse it for ordinary holder and user metadata. Implement original metadata retention/replacement/equality/reset and chain lookup with no physical lifetime engine. 3. Test actual registered static/dynamic metadata,existing effective sets,original/default separation,first equal-value override,unchanged replacement identity,target-pool set copies,chain ownership,reset and defined replacement failure behavior. 4. Token-prove unchanged binder/copy logic,strict changed shared/allCalc100,related Writer functions,13gates,production build and real Chromium/Writer. 5. Record limitations/source-only exception observations honestly,verify/commit/evaluate/close; actual Sc styles/document/UI/ODS remain goal work.

## Verify Steps

Run node output/playwright/task175-checks/native-audit.mjs for pinned itempool/itemset/poolitem headers/sources and Sc page default caller; exact existing logical binder body token equality,canonical helper binding and native metadata operation evidence. Run portable.mjs for exact changed shared owners raw S/B/F/L100 and all33Calc100,related holders/metadata/sets/Writer functions with Writer-only coverage exempt. Source-derived user-default fixtures use actual packages/pools/items,not fake providers or memory probes; retain original static/dynamic metadata and test replacement no-op/reset/cross-pool values and defined failure paths. Run source-gates.mjs for13standard gates and build-browser-portable.mjs for production build,actual user-default Chromium and targeted Writer startup/load/edit. All4refs absent at runtime/restored finally. Document remaining native pool-copy/shutdown/user interface/Sc models/ODS limitations. Full all-app run deferred to user-defined minimum UI/ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task175 commits, preserving calc branch, unrelated tasks/work, existing shared lifetime-erased value behavior and native symlinks. No branch merges,history rewriting or validator/coverage weakening.

## Findings
