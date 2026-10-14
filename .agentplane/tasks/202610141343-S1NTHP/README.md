---
id: "202610141343-S1NTHP"
title: "Migrate shared border Color ownership and Writer consumers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T13:44:28.949Z"
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
    body: "Start: explicit human authorization for shared canonical Color contracts and all Writer consumers, no numeric compatibility core."
events:
  -
    type: "status"
    at: "2026-10-14T13:44:39.207Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicit human authorization for shared canonical Color contracts and all Writer consumers, no numeric compatibility core."
doc_version: 3
doc_updated_at: "2026-10-14T13:44:39.207Z"
doc_updated_by: "CODER"
description: "Task129: replace represented numeric color ownership in SvxBorderLine and connected shared selector/frame/page contracts with actual Tools Color, migrate all Writer callers and browser serialization boundaries, no legacy numeric core overloads. Explicit repeated human authorization to fix shared and Writer contracts. Preserve all existing metric/style semantics; advanced theme and shading remain separately unported."
sections:
  Summary: "Task129: use actual shared Tools Color values throughout represented border ownership and migrate Writer consumers, under repeated explicit human authorization. Work only calc branch/checkout. Success is native copy and equality semantics, original serialized numeric records, strict Calc/shared coverage and related Writer checks. No full suite until true UI+ODS readiness, then pause as requested."
  Scope: "Shared editeng borderline/frmitems, svx framelink/frmsel, cui border page, xmloff border serialization, Writer table construction and browser presentation. All corresponding unit/browser fixtures and existing five affected writer e2e specs; exact runtime/provenance records for changed runtime owners, Color/border capability linkage and calc-core progress. At most80 scoped paths, no unrelated native feature, theme/shading or ODS implementation in this migration. No numeric core compatibility overloads."
  Plan: "Migrate shared border Color ownership and connected selector/frame/page plus all Writer consumers; native copies/borrowed references, only numeric IO boundaries. Strict whole changed shared and Calc raw100; related Writer tests and five affected Chromium specs. Inventory/provenance and exact-source review. No full suite before UI/ODS readiness."
  Verify Steps: "Read exact include/editeng/borderline.hxx and editeng/source/items/borderline.cxx, svx frame/selector and cui border source, editeng frmitems UNO boundaries. Run npm run test:coverage:calc, related boxitem/frame selector/style/cui border tests and all changed Writer testfiles; include complete changed shared runtime owners in strict100S/B/F/L coverage and independently inspect every raw counter. Include changed Writer runtime owners for gap reporting only, do not repair Writer-only coverage. No thresholds/counter-map mutation. Remove/restore4native symlinks around runtime tests. 12focused static gates; module-boundary31tests; production build and five affected Chromium writer e2e specs. Exact path allowlist/hash/nativepin review and clean calc. No C++/native memory arithmetic experiments."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task implementation and metadata commits using a future approved task; never reset unrelated changes or merge branches."
  Findings: "Preflight clean calc after task128. Shared core SvxBorderLine currently uses primitive color; native stores value Color and constructor/SetColor copy. Native GetColor is const reference; JS readonly return preserves actual backing Color identity. Style GetColorPrim returns Color by value, so return independent copy. Existing theme/shading/callback contracts remain unported and must not be falsely certified. Human explicitly authorizes Writer fixes and ordinary JS arithmetic."
id_source: "generated"
---
## Summary

Task129: use actual shared Tools Color values throughout represented border ownership and migrate Writer consumers, under repeated explicit human authorization. Work only calc branch/checkout. Success is native copy and equality semantics, original serialized numeric records, strict Calc/shared coverage and related Writer checks. No full suite until true UI+ODS readiness, then pause as requested.

## Scope

Shared editeng borderline/frmitems, svx framelink/frmsel, cui border page, xmloff border serialization, Writer table construction and browser presentation. All corresponding unit/browser fixtures and existing five affected writer e2e specs; exact runtime/provenance records for changed runtime owners, Color/border capability linkage and calc-core progress. At most80 scoped paths, no unrelated native feature, theme/shading or ODS implementation in this migration. No numeric core compatibility overloads.

## Plan

Migrate shared border Color ownership and connected selector/frame/page plus all Writer consumers; native copies/borrowed references, only numeric IO boundaries. Strict whole changed shared and Calc raw100; related Writer tests and five affected Chromium specs. Inventory/provenance and exact-source review. No full suite before UI/ODS readiness.

## Verify Steps

Read exact include/editeng/borderline.hxx and editeng/source/items/borderline.cxx, svx frame/selector and cui border source, editeng frmitems UNO boundaries. Run npm run test:coverage:calc, related boxitem/frame selector/style/cui border tests and all changed Writer testfiles; include complete changed shared runtime owners in strict100S/B/F/L coverage and independently inspect every raw counter. Include changed Writer runtime owners for gap reporting only, do not repair Writer-only coverage. No thresholds/counter-map mutation. Remove/restore4native symlinks around runtime tests. 12focused static gates; module-boundary31tests; production build and five affected Chromium writer e2e specs. Exact path allowlist/hash/nativepin review and clean calc. No C++/native memory arithmetic experiments.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task implementation and metadata commits using a future approved task; never reset unrelated changes or merge branches.

## Findings

Preflight clean calc after task128. Shared core SvxBorderLine currently uses primitive color; native stores value Color and constructor/SetColor copy. Native GetColor is const reference; JS readonly return preserves actual backing Color identity. Style GetColorPrim returns Color by value, so return independent copy. Existing theme/shading/callback contracts remain unported and must not be falsely certified. Human explicitly authorizes Writer fixes and ordinary JS arithmetic.
