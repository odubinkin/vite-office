---
id: "202610141343-S1NTHP"
title: "Migrate shared border Color ownership and Writer consumers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-14T13:56:32.666Z"
doc_updated_by: "CODER"
description: "Task129: replace represented numeric color ownership in SvxBorderLine and connected shared selector/frame/page contracts with actual Tools Color, migrate all Writer callers and browser serialization boundaries, no legacy numeric core overloads. Explicit repeated human authorization to fix shared and Writer contracts. Preserve all existing metric/style semantics; advanced theme and shading remain separately unported."
sections:
  Summary: "Task129: use actual shared Tools Color values throughout represented border ownership and migrate Writer consumers, under repeated explicit human authorization. Work only calc branch/checkout. Success is native copy and equality semantics, original serialized numeric records, strict Calc/shared coverage and related Writer checks. No full suite until true UI+ODS readiness, then pause as requested."
  Scope: "Shared editeng borderline/frmitems, svx framelink/frmsel, cui border page, xmloff border serialization, Writer table construction and browser presentation. All corresponding unit/browser fixtures and existing five affected writer e2e specs; exact runtime/provenance records for changed runtime owners, Color/border capability linkage and calc-core progress. At most80 scoped paths, no unrelated native feature, theme/shading or ODS implementation in this migration. No numeric core compatibility overloads."
  Plan: "Migrate shared border Color ownership and connected selector/frame/page plus all Writer consumers; native copies/borrowed references, only numeric IO boundaries. Strict whole changed shared and Calc raw100; related Writer tests and five affected Chromium specs. Inventory/provenance and exact-source review. No full suite before UI/ODS readiness."
  Verify Steps: "Read exact include/editeng/borderline.hxx and editeng/source/items/borderline.cxx, svx frame/selector and cui border source, editeng frmitems UNO boundaries. Run npm run test:coverage:calc, related boxitem/frame selector/style/cui border tests and all changed Writer testfiles; include complete changed shared runtime owners in strict100S/B/F/L coverage and independently inspect every raw counter. Include changed Writer runtime owners for gap reporting only, do not repair Writer-only coverage. No thresholds/counter-map mutation. Remove/restore4native symlinks around runtime tests. 12focused static gates; module-boundary31tests; production build and five affected Chromium writer e2e specs. Exact path allowlist/hash/nativepin review and clean calc. No C++/native memory arithmetic experiments."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task implementation and metadata commits using a future approved task; never reset unrelated changes or merge branches."
  Findings: |-
    Preflight clean calc after task128. Shared core SvxBorderLine currently uses primitive color; native stores value Color and constructor/SetColor copy. Native GetColor is const reference; JS readonly return preserves actual backing Color identity. Style GetColorPrim returns Color by value, so return independent copy. Existing theme/shading/callback contracts remain unported and must not be falsely certified. Human explicitly authorizes Writer fixes and ordinary JS arithmetic.

    Initial typecheck caught an over-broad mechanical GetVisibleWidth return replacement and one assertion projection accidentally reused as SetColor input; both fixed within approved migration before runtime tests. Final related278tests21files pass, but selecting these border files alone leaves existing SvxProtectItem/SvxSizeItem and merge-page branch counters uncovered in the complete shared frmitems/cui owners. Add their existing native-format-attribute-notify, fmtfsize and native-collapsing-border-page tests to the related selection, retaining strict100 for all6shared owners and reporting Writer-only gaps. No implementation or threshold relaxation. Metadata generator initially assumed all records used upstreamPath/preservedResponsibilities; browser adaptations use responsibilities/local-only, corrected loader to preserve original schemas/history, read existing records from committed HEAD to avoid duplicate appends. No production change from these evidence-tool failures.

    The added existing protection-owner test file exposed one stale unrelated Writer expectation: CntUInt32Item equality was still expected to compare Which, despite the canonical shared fix in task115. Original cintitem.cxx compares payload after a same-type debug assertion, not Which. Update this one Writer expectation to true, without changing shared implementation; explicitly authorized canonical shared/Writer corrections. Retain failing24file diagnostic. Final56paths55existing1new within approved80;12nativepins.

    Final expanded related profile:299tests24files pass. Complete6shared owners828statements675branches197functions739lines have100 and every raw counter positive. Original three Writer owners measured but gaps retained: WriterEditableTable1S3B, WriterBorderPage1B, swtable88S114B8F. No coverage-map merging/rewriting, new counters or persistent threshold changes. Existing whole Calc171tests66files33owners pass raw100. Production build and18Chromiumcases5specs passed once; no replay after unrelated Writer assertion-only correction. All four symlinks restored by finally. Whole source metadata56paths55changed1new and12nativepins; no C++ compilation.

    Initial static gates9/12passed. Opening fileoverview moved before existing Color import without any import-order or runtime body/location change; exact proof retained, no passing runtime replay. Canonical native CUI directly uses Color/COL_BLACK and now needs allowed cui->tools edge; reverse tools->cui explicitly remains forbidden in existing boundary test. Capability tests with it.each use opening fileoverview evidence marker. Final58paths57changed1new within approved80; no runtime criterion relaxation.
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

Initial typecheck caught an over-broad mechanical GetVisibleWidth return replacement and one assertion projection accidentally reused as SetColor input; both fixed within approved migration before runtime tests. Final related278tests21files pass, but selecting these border files alone leaves existing SvxProtectItem/SvxSizeItem and merge-page branch counters uncovered in the complete shared frmitems/cui owners. Add their existing native-format-attribute-notify, fmtfsize and native-collapsing-border-page tests to the related selection, retaining strict100 for all6shared owners and reporting Writer-only gaps. No implementation or threshold relaxation. Metadata generator initially assumed all records used upstreamPath/preservedResponsibilities; browser adaptations use responsibilities/local-only, corrected loader to preserve original schemas/history, read existing records from committed HEAD to avoid duplicate appends. No production change from these evidence-tool failures.

The added existing protection-owner test file exposed one stale unrelated Writer expectation: CntUInt32Item equality was still expected to compare Which, despite the canonical shared fix in task115. Original cintitem.cxx compares payload after a same-type debug assertion, not Which. Update this one Writer expectation to true, without changing shared implementation; explicitly authorized canonical shared/Writer corrections. Retain failing24file diagnostic. Final56paths55existing1new within approved80;12nativepins.

Final expanded related profile:299tests24files pass. Complete6shared owners828statements675branches197functions739lines have100 and every raw counter positive. Original three Writer owners measured but gaps retained: WriterEditableTable1S3B, WriterBorderPage1B, swtable88S114B8F. No coverage-map merging/rewriting, new counters or persistent threshold changes. Existing whole Calc171tests66files33owners pass raw100. Production build and18Chromiumcases5specs passed once; no replay after unrelated Writer assertion-only correction. All four symlinks restored by finally. Whole source metadata56paths55changed1new and12nativepins; no C++ compilation.

Initial static gates9/12passed. Opening fileoverview moved before existing Color import without any import-order or runtime body/location change; exact proof retained, no passing runtime replay. Canonical native CUI directly uses Color/COL_BLACK and now needs allowed cui->tools edge; reverse tools->cui explicitly remains forbidden in existing boundary test. Capability tests with it.each use opening fileoverview evidence marker. Final58paths57changed1new within approved80; no runtime criterion relaxation.
