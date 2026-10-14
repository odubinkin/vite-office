---
id: "202610141052-ZWCGK6"
title: "Implement shared cell alignment values and Calc formatting defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T10:53:17.565Z"
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
    body: "Start: implement approved real shared alignment/rotation-mode value chains and UNO types, five Calc defaults; preserve source quirks, no generator or fake provider."
events:
  -
    type: "status"
    at: "2026-10-14T10:53:28.229Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved real shared alignment/rotation-mode value chains and UNO types, five Calc defaults; preserve source quirks, no generator or fake provider."
doc_version: 3
doc_updated_at: "2026-10-14T11:01:50.540Z"
doc_updated_by: "CODER"
description: "Task117: native EditEng justify item trio, SVX rotate-mode, real UNO enum/constant owners, five Calc DocPool attribute identities. Reuse SVL/CPPU, preserve source conversion/default quirks; source-absent Calc/shared raw100 and focused checks, full121next."
sections:
  Summary: "Implement actual shared alignment value chains for five Calc DocPool formatting defaults and future ODS styles/UI, using actual SVL/CPPU and original module owners. User continuation authorizes local work oncalc only."
  Scope: "Twelve runtime owners: existing EditEng svxenum/memberids, new justifyitem header/core; five actual OffAPI IDL owners CellHoriJustify/VerticalAlignment with original cppumaker-normal enum type bindings, ParagraphAdjust declaration, CellVertJustify2/CellJustifyMethod constants; new SVX rotmodit header/core; existing Calc scitems fiveIDs. Three focused tests, exact module dependency/ownership checker and tests,24runtime/provenance records,2capabilities and3Calc docs. Expected46intentionalpaths, normal source responsibility split only if500line cap requires it. No new generator/nativebuild, fake type/provider/document, localized presentation/cache/ABI or complete DocPool/UI/ODS claim."
  Plan: "Port native SvxHorJustifyItem/SvxVerJustifyItem/SvxJustifyMethodItem constructors/factories whereoriginal/copy/Clone and full initialized member query/update logic. Reuse actual SfxEnumItem, CPPU Any extraction/insertion and static type metadata; OffAPI enum type getter follows pinned codemaker normal emission with actual static_enum_type_init and borrowedTypecell, no fake provider or compiled generator. Preserve unsigned8 member narrowing/CONVERT_TWIPS stripping, horizontal unknown-member unchanged-success, vertical default-member failed-extraction reset-success, exact enum vs integer transport, paragraph mappings and justify method unknown defaults. Port SvxRotateMode enum/item value/copy/Clone/default/query/update including invalid extraction resettingStandard withtrue. Scoped internal enums permit unknown fixed-int values for source switch defaults; native invalid casts/enum input/assertions excluded. Browser plain numeric transport remains explicit via small value extraction/output adapters over actual Any. Add Calc Which129/130/132/133/136 and test native explicit DocPool defaults Standard/Auto/Standard/Auto/Bottom through real items and SfxItemSet, not fake DocPool. Record quirks preserving source behavior. WholeCalc/complete changedshared raw100 source-absent, related actual enum/Any/Writer numbering consumers and checker tests;12focused gates/fresh baseline/exact scope/nativepins/same-agent EVAL/APclose. Full121next."
  Verify Steps: |-
    1. Review complete native justifyitem.hxx/cxx, rotmodit.hxx/cxx, internal enums/memberids and5IDL declarations, actual codemaker normal enum getter, actual Any/type/assign contracts and Calc DocPool/scitems defaults. Test all public value/copy/default/Clone/member/mapping/typedAny/failure/output histories, real static enum types cold/warm and cross-type rejection. Preserve quirks; no fake provider/private forcing/compilednative or general native QA claim.
    2. WholeCalc and complete changedshared runtime owners strict rawS/B/F/L100/everycounterpositive, all4reference links absent/restoredfinally. Related shared enum/Any/existing numbering tests and exact module checker tests; retain assertions/thresholds/failurelogs. No Writer-only coverage repairs or full replay before121.
    3. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff; exact committed/current paths/hashes from fresh3507Gitbaseline and nativepins. Normal initialized enum/const/value scope only, presentation/cache/ABI/fullDocPool/document/UI/ODS pending. Same-agent EVAL not independent, cleanAPfinish oncalc, goalactive.
  Verification: |-
    Command: node output/playwright/task117-checks/portable.mjs
    Result: pass wholeCalc162tests58files33owners rawS4141/B2731/F821/L3689; related18tests5files10changed sharedruntime owners rawS293/B142/F31/L279. All S/B/F/L100/everyrawcounterpositive. All4source links absent/restoredfinally. Actual enum/Any/numbering consumers pass; enum outputs use real static metadata cold/warm.
    Command: npx vitest run scripts/check-module-boundaries.test.ts
    Result: pass27tests after one source-backed prior OffAPI→CPPU expectation migration; reverse/app/browser restrictions retained.
    Command: node output/playwright/task117-checks/gates.mjs
    Result: pass12focused gates format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff. Exact46intentionalpaths, fresh3507Gitbaseline/current3539hashes and18nativepins reviewed before final verification. Same-agent EVAL not independent.
    Full-office/browser/static nextscheduled121 per user cadence; no Writer-only coverage repairs or native C++ generator/build.
  Rollback Plan: "Revert only task117 source commit if needed, preserve tasks113-116/userintegration/otheractive tasks. No reset/merge/outside-repo/global edits."
  Findings: "WholeCalc162tests and18related tests passed firsttime strict raw100 including complete new alignment/UNO enum type owners. Initial27module tests26pass/1fail: historical locale-only OffAPI→CPPU forbidden assertion no longer matches actual original generated enum getter responsibility. Pinned EnumType::dumpNormalGetCppuType emits CPPU static enum initialization and borrowed Typecell; approved exact graph edge requires changing that assertion toallowed with source comment. All other assertions, reverse/app/browser restrictions and thresholds retained; final27pass and12gates pass. CALC103documents original horizontal unknown-member untouchedsuccess, vertical default failed-extraction reset-success, rotate-mode reset-success and lossy VerticalAlignment member, without correcting source behavior. Actual CPPU metadata/extraction/insertion and shared SfxEnumItem reused; normal generated getters modeled directly from pinned template, no generator executed/fake provider/source fixture/private forcing. Scoped fixed-int unknown-value switch defaults distinct from invalid native enum/presentation/assertion/ABI domains. Header/core ownership and5IDL values retained, no memory/refcount engine. Complete DocPool/document/configuration/storage/UI/ODS and localized presentation/diagnostics/native caches/comprehensive generated helpers remain pending/excluded. Same-agent EVAL not independent. Goalactive, full121next."
id_source: "generated"
---
## Summary

Implement actual shared alignment value chains for five Calc DocPool formatting defaults and future ODS styles/UI, using actual SVL/CPPU and original module owners. User continuation authorizes local work oncalc only.

## Scope

Twelve runtime owners: existing EditEng svxenum/memberids, new justifyitem header/core; five actual OffAPI IDL owners CellHoriJustify/VerticalAlignment with original cppumaker-normal enum type bindings, ParagraphAdjust declaration, CellVertJustify2/CellJustifyMethod constants; new SVX rotmodit header/core; existing Calc scitems fiveIDs. Three focused tests, exact module dependency/ownership checker and tests,24runtime/provenance records,2capabilities and3Calc docs. Expected46intentionalpaths, normal source responsibility split only if500line cap requires it. No new generator/nativebuild, fake type/provider/document, localized presentation/cache/ABI or complete DocPool/UI/ODS claim.

## Plan

Port native SvxHorJustifyItem/SvxVerJustifyItem/SvxJustifyMethodItem constructors/factories whereoriginal/copy/Clone and full initialized member query/update logic. Reuse actual SfxEnumItem, CPPU Any extraction/insertion and static type metadata; OffAPI enum type getter follows pinned codemaker normal emission with actual static_enum_type_init and borrowedTypecell, no fake provider or compiled generator. Preserve unsigned8 member narrowing/CONVERT_TWIPS stripping, horizontal unknown-member unchanged-success, vertical default-member failed-extraction reset-success, exact enum vs integer transport, paragraph mappings and justify method unknown defaults. Port SvxRotateMode enum/item value/copy/Clone/default/query/update including invalid extraction resettingStandard withtrue. Scoped internal enums permit unknown fixed-int values for source switch defaults; native invalid casts/enum input/assertions excluded. Browser plain numeric transport remains explicit via small value extraction/output adapters over actual Any. Add Calc Which129/130/132/133/136 and test native explicit DocPool defaults Standard/Auto/Standard/Auto/Bottom through real items and SfxItemSet, not fake DocPool. Record quirks preserving source behavior. WholeCalc/complete changedshared raw100 source-absent, related actual enum/Any/Writer numbering consumers and checker tests;12focused gates/fresh baseline/exact scope/nativepins/same-agent EVAL/APclose. Full121next.

## Verify Steps

1. Review complete native justifyitem.hxx/cxx, rotmodit.hxx/cxx, internal enums/memberids and5IDL declarations, actual codemaker normal enum getter, actual Any/type/assign contracts and Calc DocPool/scitems defaults. Test all public value/copy/default/Clone/member/mapping/typedAny/failure/output histories, real static enum types cold/warm and cross-type rejection. Preserve quirks; no fake provider/private forcing/compilednative or general native QA claim.
2. WholeCalc and complete changedshared runtime owners strict rawS/B/F/L100/everycounterpositive, all4reference links absent/restoredfinally. Related shared enum/Any/existing numbering tests and exact module checker tests; retain assertions/thresholds/failurelogs. No Writer-only coverage repairs or full replay before121.
3. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff; exact committed/current paths/hashes from fresh3507Gitbaseline and nativepins. Normal initialized enum/const/value scope only, presentation/cache/ABI/fullDocPool/document/UI/ODS pending. Same-agent EVAL not independent, cleanAPfinish oncalc, goalactive.

## Verification

Command: node output/playwright/task117-checks/portable.mjs
Result: pass wholeCalc162tests58files33owners rawS4141/B2731/F821/L3689; related18tests5files10changed sharedruntime owners rawS293/B142/F31/L279. All S/B/F/L100/everyrawcounterpositive. All4source links absent/restoredfinally. Actual enum/Any/numbering consumers pass; enum outputs use real static metadata cold/warm.
Command: npx vitest run scripts/check-module-boundaries.test.ts
Result: pass27tests after one source-backed prior OffAPI→CPPU expectation migration; reverse/app/browser restrictions retained.
Command: node output/playwright/task117-checks/gates.mjs
Result: pass12focused gates format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff. Exact46intentionalpaths, fresh3507Gitbaseline/current3539hashes and18nativepins reviewed before final verification. Same-agent EVAL not independent.
Full-office/browser/static nextscheduled121 per user cadence; no Writer-only coverage repairs or native C++ generator/build.

## Rollback Plan

Revert only task117 source commit if needed, preserve tasks113-116/userintegration/otheractive tasks. No reset/merge/outside-repo/global edits.

## Findings

WholeCalc162tests and18related tests passed firsttime strict raw100 including complete new alignment/UNO enum type owners. Initial27module tests26pass/1fail: historical locale-only OffAPI→CPPU forbidden assertion no longer matches actual original generated enum getter responsibility. Pinned EnumType::dumpNormalGetCppuType emits CPPU static enum initialization and borrowed Typecell; approved exact graph edge requires changing that assertion toallowed with source comment. All other assertions, reverse/app/browser restrictions and thresholds retained; final27pass and12gates pass. CALC103documents original horizontal unknown-member untouchedsuccess, vertical default failed-extraction reset-success, rotate-mode reset-success and lossy VerticalAlignment member, without correcting source behavior. Actual CPPU metadata/extraction/insertion and shared SfxEnumItem reused; normal generated getters modeled directly from pinned template, no generator executed/fake provider/source fixture/private forcing. Scoped fixed-int unknown-value switch defaults distinct from invalid native enum/presentation/assertion/ABI domains. Header/core ownership and5IDL values retained, no memory/refcount engine. Complete DocPool/document/configuration/storage/UI/ODS and localized presentation/diagnostics/native caches/comprehensive generated helpers remain pending/excluded. Same-agent EVAL not independent. Goalactive, full121next.
