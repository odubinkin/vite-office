---
id: "202610152135-N3TYD3"
title: "Implement native SfxStyleSheet inheritance and shared style pool factory"
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
  updated_at: "2026-10-15T21:35:28.230Z"
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
    body: "Start: implement approved derived native styles using shared identity-preserving role mixins, retaining existing algorithms and source-backed tests."
events:
  -
    type: "status"
    at: "2026-10-15T21:35:33.477Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved derived native styles using shared identity-preserving role mixins, retaining existing algorithms and source-backed tests."
doc_version: 3
doc_updated_at: "2026-10-15T21:35:33.477Z"
doc_updated_by: "CODER"
description: "Task174: implement SfxStyleSheet/SfxStyleSheetPool and StyleSheetUser through identity-preserving TypeScript role mixins reusing the existing SfxListener/SfxBroadcaster algorithms/state. Preserve native parent notification/copy/destructor order and inherited copy factory slicing; no proxy owners or memory manager."
sections:
  Summary: "Implement actual SfxStyleSheet/SfxStyleSheetPool required before ScStyleSheetPool, with native StyleSheetUser and identity-preserving shared notification roles. TypeScript mixin inheritance translates native multiple inheritance without duplicated algorithms, proxy owners, RTTI spoofing or memory machinery."
  Scope: "Task174: existing svl notify SfxBroadcaster/lstner classes and reusable role factories; native derived style/pool owners in source/items with canonical style/stylesheetuser header boundaries; tests/browser; shared runtime/provenance/capability registry and readiness/suspected journal. Maximum30non-task files. Existing native defaults/copy/duplicate/forward/destruction algorithms retained and source-token verified. No UNO/presentation/ScStyleSheet/document/UI/ODS placeholder, normal invalid pointer outcome, native memory framework or all-app run."
  Plan: "1. Source-audit original SfxStyleSheet inheritance/constructors/SetParent/Notify/type flags/destructor and pool name-only factory override. 2. Lift existing SfxListener/Broadcaster methods and fields into generic mixin roles once, keeping root classes/public signatures and algorithms. Reuse role state on the actual style this; copy role vectors through original operations after base construction. 3. Implement actual derived style, field factory pool and erased StyleSheetUser; preserve source copy slicing and all notification/source identities. 4. Source-derived identity,parent rebind,mutation,copy,destructor and factory tests plus original notifier/core suites, strict shared/allCalc100,13gates,production build and actual Chromium/related Writer. 5. Register adaptation/limitations honestly, verify/commit/evaluate/close with goal still active until minimum UI/ODS milestone."
  Verify Steps: "Run node output/playwright/task174-checks/native-audit.mjs: pin native style/lstner/broadcaster/StyleSheetUser sources; compare every lifted existing notification method token body and fields to accepted source, with only constructor-copy extraction documented. Run portable.mjs for exact changed shared owner sets raw S/B/F/L100 and all33Calc100; include native Sfx QA,actual core/derived styles and related Writer functions. Verify actual style identity in both roles,parent rebind/failure/copy propagation,derived/base destructor order,shared factory and inherited copy slicing without invalid-type operations. Run source-gates.mjs for13standard checks and build-browser-portable.mjs for production build,actual derived style Chromium and targeted Writer startup/load/edit. Four native refs absent during runtime/restored finally. Presentation/UNO/Sc styles/document/UI/ODS remain pending; native QA context and source-derived tests distinguished, no native probes or full all-app run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task174 commits, preserving calc checkout, unrelated tasks, original accepted shared notifier behavior and source symlinks. No branch merge/history rewrite or validator/threshold weakening."
  Findings: ""
id_source: "generated"
---
## Summary

Implement actual SfxStyleSheet/SfxStyleSheetPool required before ScStyleSheetPool, with native StyleSheetUser and identity-preserving shared notification roles. TypeScript mixin inheritance translates native multiple inheritance without duplicated algorithms, proxy owners, RTTI spoofing or memory machinery.

## Scope

Task174: existing svl notify SfxBroadcaster/lstner classes and reusable role factories; native derived style/pool owners in source/items with canonical style/stylesheetuser header boundaries; tests/browser; shared runtime/provenance/capability registry and readiness/suspected journal. Maximum30non-task files. Existing native defaults/copy/duplicate/forward/destruction algorithms retained and source-token verified. No UNO/presentation/ScStyleSheet/document/UI/ODS placeholder, normal invalid pointer outcome, native memory framework or all-app run.

## Plan

1. Source-audit original SfxStyleSheet inheritance/constructors/SetParent/Notify/type flags/destructor and pool name-only factory override. 2. Lift existing SfxListener/Broadcaster methods and fields into generic mixin roles once, keeping root classes/public signatures and algorithms. Reuse role state on the actual style this; copy role vectors through original operations after base construction. 3. Implement actual derived style, field factory pool and erased StyleSheetUser; preserve source copy slicing and all notification/source identities. 4. Source-derived identity,parent rebind,mutation,copy,destructor and factory tests plus original notifier/core suites, strict shared/allCalc100,13gates,production build and actual Chromium/related Writer. 5. Register adaptation/limitations honestly, verify/commit/evaluate/close with goal still active until minimum UI/ODS milestone.

## Verify Steps

Run node output/playwright/task174-checks/native-audit.mjs: pin native style/lstner/broadcaster/StyleSheetUser sources; compare every lifted existing notification method token body and fields to accepted source, with only constructor-copy extraction documented. Run portable.mjs for exact changed shared owner sets raw S/B/F/L100 and all33Calc100; include native Sfx QA,actual core/derived styles and related Writer functions. Verify actual style identity in both roles,parent rebind/failure/copy propagation,derived/base destructor order,shared factory and inherited copy slicing without invalid-type operations. Run source-gates.mjs for13standard checks and build-browser-portable.mjs for production build,actual derived style Chromium and targeted Writer startup/load/edit. Four native refs absent during runtime/restored finally. Presentation/UNO/Sc styles/document/UI/ODS remain pending; native QA context and source-derived tests distinguished, no native probes or full all-app run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task174 commits, preserving calc checkout, unrelated tasks, original accepted shared notifier behavior and source symlinks. No branch merge/history rewrite or validator/threshold weakening.

## Findings
