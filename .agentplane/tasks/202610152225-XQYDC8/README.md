---
id: "202610152225-XQYDC8"
title: "Implement native named item-pool construction and copy for Calc document pools"
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
  updated_at: "2026-10-15T22:25:19.916Z"
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
    body: "Start: implement the approved native named/copy item-pool base required by Calc document pools; preserve original value-category and shutdown notification semantics under GC."
events:
  -
    type: "status"
    at: "2026-10-15T22:25:25.123Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native named/copy item-pool base required by Calc document pools; preserve original value-category and shutdown notification semantics under GC."
doc_version: 3
doc_updated_at: "2026-10-15T22:25:25.123Z"
doc_updated_by: "CODER"
description: "Task176: actual SfxItemPool name,metric,copy/Clone and shutdown notification contracts required by ScDocumentPool. Reuse actual OUString,SfxBroadcaster and native metadata; GC owns physical lifetimes. No fabricated Calc pool or surrogate/lifetime framework."
sections:
  Summary: "Task176 implements native named/copy item-pool construction,Clone,metric and shutdown notification required before ScDocumentPool can use the shared pool base."
  Scope: "Existing shared itempool source/header; real metadata copy and secondary Clone propagation; native name/metric/BC/shutdown API; focused unit and shared-browser tests; runtime/provenance/capability/readiness/suspected-case inventory. Maximum25non-task files. No fake ScDocumentPool,object-lifetime/cache/refcount/surrogate engine,full presentation implementation or all-app run. Existing no-argument browser constructor remains a declared empty-name adaptation. Browser-only snapshot registry is not native metadata and is not silently promoted to copied native packages."
  Plan: "Audit native name/copy/Clone,metrics and BC/shutdown contracts. Implement in existing shared owner with original metadata category decisions and secondary copy order,using actual shared OUString,MapUnit and SfxBroadcaster. Erase native physical lifetime registries. Test real registered package/value/set/listener graphs and native shutdown timing,reentrant once gate,default metadata classifications and independent copy state. Update truthful inventory and readiness; run declared portable strict100 checks and source/browser gates,review and close task while UI/ODS goal remains active."
  Verify Steps: "Pin original itempool.hxx,itempool.cxx,docpool.cxx and actual notify sources. Verify native scalar/static/dynamic/user metadata copies,original/effective reset,secondary virtual Clone linkage,fresh empty broadcaster and independent range cache,names and metric defaults/changes; actual Dying shutdown exactly once with reentrancy and cache reset after delivery. Use real items,packages,sets and listeners. Run whole Calc plus related shared/Writer tests with exact executable owner raw S/B/F/L100,Writer-only coverage exempt;13source gates,production build,actual shared Chromium plus targeted Writer startup/load/edit. Runtime must pass with four native links absent and restored afterward. Record source quirks without correcting upstream. No native compiler,memory probe or full all-app run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task176 commits; preserve calc branch,unrelated tasks and reference links. No history rewriting or validator/coverage weakening."
  Findings: ""
id_source: "generated"
---
## Summary

Task176 implements native named/copy item-pool construction,Clone,metric and shutdown notification required before ScDocumentPool can use the shared pool base.

## Scope

Existing shared itempool source/header; real metadata copy and secondary Clone propagation; native name/metric/BC/shutdown API; focused unit and shared-browser tests; runtime/provenance/capability/readiness/suspected-case inventory. Maximum25non-task files. No fake ScDocumentPool,object-lifetime/cache/refcount/surrogate engine,full presentation implementation or all-app run. Existing no-argument browser constructor remains a declared empty-name adaptation. Browser-only snapshot registry is not native metadata and is not silently promoted to copied native packages.

## Plan

Audit native name/copy/Clone,metrics and BC/shutdown contracts. Implement in existing shared owner with original metadata category decisions and secondary copy order,using actual shared OUString,MapUnit and SfxBroadcaster. Erase native physical lifetime registries. Test real registered package/value/set/listener graphs and native shutdown timing,reentrant once gate,default metadata classifications and independent copy state. Update truthful inventory and readiness; run declared portable strict100 checks and source/browser gates,review and close task while UI/ODS goal remains active.

## Verify Steps

Pin original itempool.hxx,itempool.cxx,docpool.cxx and actual notify sources. Verify native scalar/static/dynamic/user metadata copies,original/effective reset,secondary virtual Clone linkage,fresh empty broadcaster and independent range cache,names and metric defaults/changes; actual Dying shutdown exactly once with reentrancy and cache reset after delivery. Use real items,packages,sets and listeners. Run whole Calc plus related shared/Writer tests with exact executable owner raw S/B/F/L100,Writer-only coverage exempt;13source gates,production build,actual shared Chromium plus targeted Writer startup/load/edit. Runtime must pass with four native links absent and restored afterward. Record source quirks without correcting upstream. No native compiler,memory probe or full all-app run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task176 commits; preserve calc branch,unrelated tasks and reference links. No history rewriting or validator/coverage weakening.

## Findings
