---
id: "202610141251-HAT4GM"
title: "Align shared font-height value state and Writer consumers with native constructors"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T12:52:36.986Z"
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
    body: "Start: port original height proportion metric state and migrate actual Writer consumers and complete state persistence."
events:
  -
    type: "status"
    at: "2026-10-14T12:52:50.192Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original height proportion metric state and migrate actual Writer consumers and complete state persistence."
doc_version: 3
doc_updated_at: "2026-10-14T13:04:40.670Z"
doc_updated_by: "CODER"
description: "Port real height/prop/unit value contract, factory/copy/hash/metrics/SetHeight overloads; migrate consumers to original3argument constructor and preserve complete state in existing Writer snapshot boundary. Native Any transport/presentation remain explicitly pending, no stubs. Calc3script default values tested through real items."
sections:
  Summary: "Port original font-height value ownership required by real Calc document pool, migrate original constructors and retain full state in existing Writer history/snapshots. Previous goal turn125 completed shared units with clean checkout: progress. This task does not claim UI/ODS readiness."
  Scope: "51intentional paths:24existing constructor consumers incl6e2especs; new canonical fhgtitem header and textitem.height source shard; new shared value/Calc3script/Writer-state tests; scitems existing IDs;16runtime/provenance records for8runtime owners (sharedTextItem/shard/header,Calcscitems,4Writerowners xmlimp/swatrset/txatbase/poolfmt-defaults);3bounded capabilities; calc-core and calc-upstream-suspected-issues docs. English artifacts, calc checkout/branch only. Other Writer-only coverage gaps untouched."
  Plan: "Implement original nHeight/nProp/ePropUnit,3argument constructor/copy/factory2401000/getters/SetProp/SetHeight3and4argoverloads/Clone/payload-only equality/hash/ScaleMetrics/HasMetrics. Reuse real MapUnit/FieldUnit/SVTools/o3tl/hash owners; preserve unsigned32 multiplication before division, signed16 delta and native4argconversion direction CALC109. Native toolsLong scale llround uses ordinary JS math and BigInt integer casts, no native builds/memory machinery. JS constructor guard keeps negative/fractional invalid but accepts native0; no2argcompatibility overload, migrate all actual consumers using TypeScript AST insertion. Scalar browser snapshot now represents all3fields, actualWriterpool decoder restores via native methods; test real itemsets and actualWriterencode/decode/history boundary, no lossy fallback. Native typedAny query/update and localizedpresentation remain unported in this slice, no fake native overloads/defaultproviders. Shard required by enforced500line budget, canonicaltextitem/header reexport oneowner; inventory current symbol ownership/history preserved. Native behavior expected corrections oldWhich equalityfalse=>true and0reject=>valid, retainnegative/fractional guards. CALC110 documents unsigned property arithmetic. Strict shared and wholeCalc raw100; relatedWritercoverage report only underexplicitexception, no repo thresholds changes. Allmigrated tests and6existingbrowser specs againstproduction build.12gates/30boundaries/exacthash/nativepins/same-agentEVAL/APclose. Full only realminimumUI+same-modelODS readiness then fixes/pause."
  Verify Steps: "Source compare native fhgtitem.hxx/textitem.cxx value methods, map/field/SVTools helpers, BigInt::Scale llround, originalhash/scitems/docpool defaults. Independent boundary arithmetic,0/MAX,unsigned32wrap, signed16absoluteunitdeltas, bothSetHeightoverloads including originalControlToItemdirection,copy/Clone/Whichindependentpayload/hash/metrics/state snapshots. All24oldconsumer constructors migrate3args, nofallbackoverload. Fresh real Calc defaultscript101112117height200prop100relative itemset copies, fresh actualWriter stateencode/decode/history test. Selected relatedprofile allmigratedunittests + nativefont/texteffects/writerattributes to cover entirechanged sharedTextItem+shard+header raw100 everycounterpositive; include4Writer owners and report gaps usingCLIaggregate0onlyperWriterexception, independently gate shared100. Whole npm run test:coverage:calc strict100, all4referencelinksabsent/restoredfinally. Build+6existingmigratedbrowserfiles, preservingbehaviorassertions. Focused12gates30boundarytests. Exact51paths/freshGitbaseline/nativeSHA256pins and actualGitHEAD/same-agent evaluator notindependent/finishcleancalc. No fullregression beforeactualminimalUI+ODSread/save checkpoint."
  Verification: |-
    Command: node output/playwright/task126-checks/portable.mjs --units-only; then --checks-only for browser after production build. Result: pass. Evidence: related147tests19files7owners measured, actual3changedsharedowners191S112B60F174L allrawcounterspositive100. FourWriterowners rawgaps reported writer-coverage-report.json per humanexception, no repairs or repo threshold changes. Calc169tests65files33owners4161S2731B821F3709L raw100. Browser18cases6migratedspecs pass against production build. All4reference links absent during eachtestprocess/restoredfinally. Scope: canonical height/property/unit state, nativeconstructor/copy/metricarithmetic, actualWriterhistory+snapshot graph and Calc3scriptdefaults. NativeTypedAny/presentation explicitlypending, browserprojection not a native transportcertificate.

    Command: node output/playwright/task126-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts; npm run build; AST constructor audit. Result: pass. Evidence: all12gates,30boundarytests,productionbuild,40originalconstructor calls across24files all3args. InitialTypeScriptreadonlyarray narrowing failure retained/repaired by explicitfields checks; no scalarfallback. Scope: exact51paths39changed12new,3667baseline blobs,14nativeSHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Source-shard reexports oneowner with registered500line necessity, nativevalue0/Which equality corrections and CALC110 recorded.

    Skipped: full application regression. Reason: human explicitly moved next full checkpoint to realminimumUI+same-modelODSread/save readiness, not reached by this value contract. Risk: broad native/applicationparity not recertified. Approval: human readiness/pause instruction. No native builds/generators/sanitizers/memory libraries. Same-agent evaluator phase is not independent; exact source commit and clean calc state recorded at closure.
  Rollback Plan: "Revert only this task source commit and traceable task artifacts if required, preserve user/unrelated changes and previous canonical shared owners."
  Findings: |-
    Current preflight clean calc. Native height includes prop/unit and constructor(nSz,nPropHeight,nId); existing local2arg ctor/scalar height snapshot cannot represent it. Human expressly authorizes shared+Writer correction withoutcompatibilityworkarounds. Canonical value slice includes complete state persistence, nativeTypedAny/presentation are explicit followups, no invented overloads. Native0heightvalid and equality ignoresWhich; originalvalid-scalar expect corrections planned. Original nativeunsigned32product wraps before /100 and4argSetHeight calls original suspiciousControlToItem same-direction helper preserved CALC109. No native memory/library/generator/probes. Fullregression atactualminimalUI+ODSread/save then repairs/pause, not tasknumber.

    Initial static12gates11pass; TypeScript does not narrow readonlyJSON arrays via Array.isArray alone in existing snapshot union. Add explicit own-field in checks before scalar field checks, preserving complete-state validation and no scalarfallback. Initial diagnostic retained, no runtime cases run yet. One long functions.exec wrapper parse failed before any command executed; retried script creation via apply_patch, no source mutation from failed call.
id_source: "generated"
---
## Summary

Port original font-height value ownership required by real Calc document pool, migrate original constructors and retain full state in existing Writer history/snapshots. Previous goal turn125 completed shared units with clean checkout: progress. This task does not claim UI/ODS readiness.

## Scope

51intentional paths:24existing constructor consumers incl6e2especs; new canonical fhgtitem header and textitem.height source shard; new shared value/Calc3script/Writer-state tests; scitems existing IDs;16runtime/provenance records for8runtime owners (sharedTextItem/shard/header,Calcscitems,4Writerowners xmlimp/swatrset/txatbase/poolfmt-defaults);3bounded capabilities; calc-core and calc-upstream-suspected-issues docs. English artifacts, calc checkout/branch only. Other Writer-only coverage gaps untouched.

## Plan

Implement original nHeight/nProp/ePropUnit,3argument constructor/copy/factory2401000/getters/SetProp/SetHeight3and4argoverloads/Clone/payload-only equality/hash/ScaleMetrics/HasMetrics. Reuse real MapUnit/FieldUnit/SVTools/o3tl/hash owners; preserve unsigned32 multiplication before division, signed16 delta and native4argconversion direction CALC109. Native toolsLong scale llround uses ordinary JS math and BigInt integer casts, no native builds/memory machinery. JS constructor guard keeps negative/fractional invalid but accepts native0; no2argcompatibility overload, migrate all actual consumers using TypeScript AST insertion. Scalar browser snapshot now represents all3fields, actualWriterpool decoder restores via native methods; test real itemsets and actualWriterencode/decode/history boundary, no lossy fallback. Native typedAny query/update and localizedpresentation remain unported in this slice, no fake native overloads/defaultproviders. Shard required by enforced500line budget, canonicaltextitem/header reexport oneowner; inventory current symbol ownership/history preserved. Native behavior expected corrections oldWhich equalityfalse=>true and0reject=>valid, retainnegative/fractional guards. CALC110 documents unsigned property arithmetic. Strict shared and wholeCalc raw100; relatedWritercoverage report only underexplicitexception, no repo thresholds changes. Allmigrated tests and6existingbrowser specs againstproduction build.12gates/30boundaries/exacthash/nativepins/same-agentEVAL/APclose. Full only realminimumUI+same-modelODS readiness then fixes/pause.

## Verify Steps

Source compare native fhgtitem.hxx/textitem.cxx value methods, map/field/SVTools helpers, BigInt::Scale llround, originalhash/scitems/docpool defaults. Independent boundary arithmetic,0/MAX,unsigned32wrap, signed16absoluteunitdeltas, bothSetHeightoverloads including originalControlToItemdirection,copy/Clone/Whichindependentpayload/hash/metrics/state snapshots. All24oldconsumer constructors migrate3args, nofallbackoverload. Fresh real Calc defaultscript101112117height200prop100relative itemset copies, fresh actualWriter stateencode/decode/history test. Selected relatedprofile allmigratedunittests + nativefont/texteffects/writerattributes to cover entirechanged sharedTextItem+shard+header raw100 everycounterpositive; include4Writer owners and report gaps usingCLIaggregate0onlyperWriterexception, independently gate shared100. Whole npm run test:coverage:calc strict100, all4referencelinksabsent/restoredfinally. Build+6existingmigratedbrowserfiles, preservingbehaviorassertions. Focused12gates30boundarytests. Exact51paths/freshGitbaseline/nativeSHA256pins and actualGitHEAD/same-agent evaluator notindependent/finishcleancalc. No fullregression beforeactualminimalUI+ODSread/save checkpoint.

## Verification

Command: node output/playwright/task126-checks/portable.mjs --units-only; then --checks-only for browser after production build. Result: pass. Evidence: related147tests19files7owners measured, actual3changedsharedowners191S112B60F174L allrawcounterspositive100. FourWriterowners rawgaps reported writer-coverage-report.json per humanexception, no repairs or repo threshold changes. Calc169tests65files33owners4161S2731B821F3709L raw100. Browser18cases6migratedspecs pass against production build. All4reference links absent during eachtestprocess/restoredfinally. Scope: canonical height/property/unit state, nativeconstructor/copy/metricarithmetic, actualWriterhistory+snapshot graph and Calc3scriptdefaults. NativeTypedAny/presentation explicitlypending, browserprojection not a native transportcertificate.

Command: node output/playwright/task126-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts; npm run build; AST constructor audit. Result: pass. Evidence: all12gates,30boundarytests,productionbuild,40originalconstructor calls across24files all3args. InitialTypeScriptreadonlyarray narrowing failure retained/repaired by explicitfields checks; no scalarfallback. Scope: exact51paths39changed12new,3667baseline blobs,14nativeSHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Source-shard reexports oneowner with registered500line necessity, nativevalue0/Which equality corrections and CALC110 recorded.

Skipped: full application regression. Reason: human explicitly moved next full checkpoint to realminimumUI+same-modelODSread/save readiness, not reached by this value contract. Risk: broad native/applicationparity not recertified. Approval: human readiness/pause instruction. No native builds/generators/sanitizers/memory libraries. Same-agent evaluator phase is not independent; exact source commit and clean calc state recorded at closure.

## Rollback Plan

Revert only this task source commit and traceable task artifacts if required, preserve user/unrelated changes and previous canonical shared owners.

## Findings

Current preflight clean calc. Native height includes prop/unit and constructor(nSz,nPropHeight,nId); existing local2arg ctor/scalar height snapshot cannot represent it. Human expressly authorizes shared+Writer correction withoutcompatibilityworkarounds. Canonical value slice includes complete state persistence, nativeTypedAny/presentation are explicit followups, no invented overloads. Native0heightvalid and equality ignoresWhich; originalvalid-scalar expect corrections planned. Original nativeunsigned32product wraps before /100 and4argSetHeight calls original suspiciousControlToItem same-direction helper preserved CALC109. No native memory/library/generator/probes. Fullregression atactualminimalUI+ODSread/save then repairs/pause, not tasknumber.

Initial static12gates11pass; TypeScript does not narrow readonlyJSON arrays via Array.isArray alone in existing snapshot union. Add explicit own-field in checks before scalar field checks, preserving complete-state validation and no scalarfallback. Initial diagnostic retained, no runtime cases run yet. One long functions.exec wrapper parse failed before any command executed; retried script creation via apply_patch, no source mutation from failed call.
