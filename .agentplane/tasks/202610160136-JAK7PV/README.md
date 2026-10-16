---
id: "202610160136-JAK7PV"
title: "Implement native Calc grid option values using shared SVX"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T01:37:28.636Z"
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
    body: "Start: reuse actual SVX grid values for native Calc reset/comparison and correct shared copy-constructor nonvirtual dispatch;verify related and Calc raw100."
events:
  -
    type: "status"
    at: "2026-10-16T01:37:29.047Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reuse actual SVX grid values for native Calc reset/comparison and correct shared copy-constructor nonvirtual dispatch;verify related and Calc raw100."
doc_version: 3
doc_updated_at: "2026-10-16T01:37:29.047Z"
doc_updated_by: "CODER"
description: "Task186: port complete ScGridOptions value owner required by Calc view options,using existing SvxOptionsGrid and real ScOptionsUtil;correct shared copy-constructor nonvirtual dispatch and verify actual browser/Worker."
sections:
  Summary: "Implement complete native ScGridOptions view-grid value owner using existing shared SvxOptionsGrid and actual ScOptionsUtil."
  Scope: "New Calc viewopti.grid source,canonical viewopti header and tests;one shared SVX copy-constructor dispatch correction and regression;actual Chromium/Worker,inventory/provenance/capability/readiness. Maximum30non-task paths. Reuse shared base and measurement binding;do not duplicate fields/getters/setters or introduce a document/grid array model. No view/color configuration service,header/footer rich-text substitute,native compiler,memory engine,network or all-app run."
  Plan: "Implement documented Task186 Calc grid value owner and necessary shared copy dispatch correction under standing user authorization."
  Verify Steps: "Pin actual viewopti.hxx/cxx,optgrid.hxx/cxx and optutil source. First demonstrate constructor nonvirtual-binding regression in an actual derived SVX value. Preserve all existing shared method tokens except constructor dispatch;all old native fixture observations remain unchanged. Calc default/from-base copy/reset geometry and flags,reset current US/metric locale,raw seven-field equality and signed-to-UInt32 assignment,copy/selfassignment/mutation independence and hidden derived APIs. Related shared exact raw S/B/F/L100 and whole Calc raw100,every raw counter positive,exact executable owner sets;Writer-only gaps exempt.13source gates,production build,actual Chromium/dedicated DOM-free Worker,Writer startup/load/edit;4refs absent/restored. No native compiler/probe or all-app run;full view options,color config/document/UI/ODS still pending."
  Verification: "Pending regression,implementation and required verification."
  Rollback Plan: "Revert only Task186 source/task commits,preserving calc branch,other work and4reference symlinks. No merges,history rewrite,guard weakening or unrelated Writer-only repairs."
  Findings: "Native ScGridOptions default construction does not call SetDefaults;it inherits common SVX geometry100/0. Native Calc reset is an explicit distinct operation1000metric/1270otherwise and divisions1. Header/footer items still require actual EditTextObjectImpl/EditEngine pool ownership;no empty-only or fake text/document owner is introduced."
id_source: "generated"
---
## Summary

Implement complete native ScGridOptions view-grid value owner using existing shared SvxOptionsGrid and actual ScOptionsUtil.

## Scope

New Calc viewopti.grid source,canonical viewopti header and tests;one shared SVX copy-constructor dispatch correction and regression;actual Chromium/Worker,inventory/provenance/capability/readiness. Maximum30non-task paths. Reuse shared base and measurement binding;do not duplicate fields/getters/setters or introduce a document/grid array model. No view/color configuration service,header/footer rich-text substitute,native compiler,memory engine,network or all-app run.

## Plan

Implement documented Task186 Calc grid value owner and necessary shared copy dispatch correction under standing user authorization.

## Verify Steps

Pin actual viewopti.hxx/cxx,optgrid.hxx/cxx and optutil source. First demonstrate constructor nonvirtual-binding regression in an actual derived SVX value. Preserve all existing shared method tokens except constructor dispatch;all old native fixture observations remain unchanged. Calc default/from-base copy/reset geometry and flags,reset current US/metric locale,raw seven-field equality and signed-to-UInt32 assignment,copy/selfassignment/mutation independence and hidden derived APIs. Related shared exact raw S/B/F/L100 and whole Calc raw100,every raw counter positive,exact executable owner sets;Writer-only gaps exempt.13source gates,production build,actual Chromium/dedicated DOM-free Worker,Writer startup/load/edit;4refs absent/restored. No native compiler/probe or all-app run;full view options,color config/document/UI/ODS still pending.

## Verification

Pending regression,implementation and required verification.

## Rollback Plan

Revert only Task186 source/task commits,preserving calc branch,other work and4reference symlinks. No merges,history rewrite,guard weakening or unrelated Writer-only repairs.

## Findings

Native ScGridOptions default construction does not call SetDefaults;it inherits common SVX geometry100/0. Native Calc reset is an explicit distinct operation1000metric/1270otherwise and divisions1. Header/footer items still require actual EditTextObjectImpl/EditEngine pool ownership;no empty-only or fake text/document owner is introduced.
