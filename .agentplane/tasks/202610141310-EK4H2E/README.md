---
id: "202610141310-EK4H2E"
title: "Implement native font-height Any transport with browser arithmetic"
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
  updated_at: "2026-10-14T13:11:42.266Z"
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
    body: "Start: complete original font-height Any members with real shared type binding and bounded JS arithmetic."
events:
  -
    type: "status"
    at: "2026-10-14T13:12:00.576Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete original font-height Any members with real shared type binding and bounded JS arithmetic."
doc_version: 3
doc_updated_at: "2026-10-14T13:12:00.576Z"
doc_updated_by: "CODER"
description: "Complete actual FontHeight IDL value/type binding and all SvxFontHeightItem Any members, preserving partial mutations/default success and native numeric domains with JS arithmetic. Reuse existing CPPU, no new allocator or memory engine, no rounding library port."
sections:
  Summary: "Complete original FontHeight IDL value/type binding and all shared font-height Any members using JS arithmetic and real existing CPPU. Minimal UI/document/ODS readiness remains pending, no full checkpoint yet. Previous turn answered human rounding question and inspected source; this turn must implement concrete progress."
  Scope: "15intentional paths: existingtextitem.height.ts/memberids.ts/Calc heightattr.test.ts; new offapi frame/status/FontHeight.ts and test plus native-font-height-transport.test.ts;6runtime/provenance records for3changedsharedruntimeowners;1boundedsharedcapability;calc-core and calc-upstream-suspected-issues docs. No Writer runtime/codec/threshold changes, new memory engine, generator or C++ execution. All mutations calc folder/branch."
  Plan: "Implement actual threefloat/short/float fields,default/copy/value/assignment/equality and normal cppumaker static_struct type getter over existing CPPU. Three ordinary JS scalar cells expose stable lvalues to existing Any compound get(offset) contract, no allocator/address manager/refcount mechanism added. Implement allQuery/PutValue members0,1,2,3 plusmemberbyte/convertbit/unknownuntouchedsuccess, reusing actualAny/commonTools/o3tl conversion. Preserve partial mutation on failedheight/diff, failedprop returns true, structuredDiffignored, negativeprop bits and sourceuint32 arithmetic/reconstructionclamp. BrowserQueryValue() keeps fullstate from126. Normalbrowser nonfuzz environment; nativefuzz-only guard and undefinedout-of-rangenan/integercast domains excluded, nofakeFuzzingprovider. Use Math.round for boundednonnegativeheight one decimal and Math.fround/nativeint casts, no RTLroundinglibrary port. Source denominator127 gives no exacthalf and minimumfractiondistance1/254; round/errorcorrection below1e-4 atmaxheight cannotcrossboundary; only representative boundary tests, not exhaustive/binaryprobe. Record CALC111 source oddities. Exact15paths6new9changed,freshhash/nativepins,strictCalc/shared100allrawpositive,relatedWriterstate test,12gates30boundaries,same-agentEVAL/APcloseclean. Full onlytrueUI+same-modelODSreadsave readiness then fixes/pause."
  Verify Steps: "Sourcecompare fhgtitem.hxx/textitem.cxx,FontHeight.idl and cppumaker normalstruct getter,realAny numeric admission and normalbrowser domain. ActualAny struct cold/warmtype,default/copy/value/assign/equality/fieldcells and allmembers/convertbit/unknownoutputsuccess tested, wrongactualtypes,structranges,resetbeforefail,heightdoubleInt32branchsuperset,diffrealLONGfallback,propfailedtrueunchanged,diffpartialheightreconstruction,zero/negative/wrappedprops andclamp. Short boundedrounding checks atresidue/0/MAXFloat32 boundaries with independent literal rational arithmetic; no fullRTLtests/generators/nativeprobes. Existingfullheightvalue+Writerstate integration and actualCalc scriptnativequeries. Whole npm run test:coverage:calc plusstrictshared targeted full3changedowners+reusedfhgt header100S/B/F/L everycounterpositive,4source linksabsent/restoredfinally.12focusedformat/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and30boundarytests. Exact15paths/freshGitbaseline/nativeSHA256pins actualnativeGitHEAD; same-agent reviewnotindependent. No full/browserreplay since noUI/Writerchanged and readinessnotreached."
  Verification: "Pending implementation and checks; fullDocPool/document/UI/ODS remain pending."
  Rollback Plan: "Revert only this task source commit/task artifacts if required; preserve user/unrelated changes and priorcanonicalowners."
  Findings: "Preflight clean calc. Latest human clarifies tiny roundingdifferences are visuallynegligible: use JS and bounded meaningfulchecks; no RTLround library port. Source confirms unsigned32height query has denominator127 and safedistance fromhalf; use ordinaryMath. ActualCPPUnormalstruct init alreadyimplemented, reuse withoutnativegenerator. Three scalarfieldcells are onlylvaluebridges foractualAny, not a binarydata/memoryengine. Native PutValue differs bymember inmutationtiming/failurebool; preserve and recordCALC111. Fuzz-onlyenvironment notbrowsernormalconfiguration, no fake config provider. All futuretask/fullcheckpoint constraints retained."
id_source: "generated"
---
## Summary

Complete original FontHeight IDL value/type binding and all shared font-height Any members using JS arithmetic and real existing CPPU. Minimal UI/document/ODS readiness remains pending, no full checkpoint yet. Previous turn answered human rounding question and inspected source; this turn must implement concrete progress.

## Scope

15intentional paths: existingtextitem.height.ts/memberids.ts/Calc heightattr.test.ts; new offapi frame/status/FontHeight.ts and test plus native-font-height-transport.test.ts;6runtime/provenance records for3changedsharedruntimeowners;1boundedsharedcapability;calc-core and calc-upstream-suspected-issues docs. No Writer runtime/codec/threshold changes, new memory engine, generator or C++ execution. All mutations calc folder/branch.

## Plan

Implement actual threefloat/short/float fields,default/copy/value/assignment/equality and normal cppumaker static_struct type getter over existing CPPU. Three ordinary JS scalar cells expose stable lvalues to existing Any compound get(offset) contract, no allocator/address manager/refcount mechanism added. Implement allQuery/PutValue members0,1,2,3 plusmemberbyte/convertbit/unknownuntouchedsuccess, reusing actualAny/commonTools/o3tl conversion. Preserve partial mutation on failedheight/diff, failedprop returns true, structuredDiffignored, negativeprop bits and sourceuint32 arithmetic/reconstructionclamp. BrowserQueryValue() keeps fullstate from126. Normalbrowser nonfuzz environment; nativefuzz-only guard and undefinedout-of-rangenan/integercast domains excluded, nofakeFuzzingprovider. Use Math.round for boundednonnegativeheight one decimal and Math.fround/nativeint casts, no RTLroundinglibrary port. Source denominator127 gives no exacthalf and minimumfractiondistance1/254; round/errorcorrection below1e-4 atmaxheight cannotcrossboundary; only representative boundary tests, not exhaustive/binaryprobe. Record CALC111 source oddities. Exact15paths6new9changed,freshhash/nativepins,strictCalc/shared100allrawpositive,relatedWriterstate test,12gates30boundaries,same-agentEVAL/APcloseclean. Full onlytrueUI+same-modelODSreadsave readiness then fixes/pause.

## Verify Steps

Sourcecompare fhgtitem.hxx/textitem.cxx,FontHeight.idl and cppumaker normalstruct getter,realAny numeric admission and normalbrowser domain. ActualAny struct cold/warmtype,default/copy/value/assign/equality/fieldcells and allmembers/convertbit/unknownoutputsuccess tested, wrongactualtypes,structranges,resetbeforefail,heightdoubleInt32branchsuperset,diffrealLONGfallback,propfailedtrueunchanged,diffpartialheightreconstruction,zero/negative/wrappedprops andclamp. Short boundedrounding checks atresidue/0/MAXFloat32 boundaries with independent literal rational arithmetic; no fullRTLtests/generators/nativeprobes. Existingfullheightvalue+Writerstate integration and actualCalc scriptnativequeries. Whole npm run test:coverage:calc plusstrictshared targeted full3changedowners+reusedfhgt header100S/B/F/L everycounterpositive,4source linksabsent/restoredfinally.12focusedformat/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and30boundarytests. Exact15paths/freshGitbaseline/nativeSHA256pins actualnativeGitHEAD; same-agent reviewnotindependent. No full/browserreplay since noUI/Writerchanged and readinessnotreached.

## Verification

Pending implementation and checks; fullDocPool/document/UI/ODS remain pending.

## Rollback Plan

Revert only this task source commit/task artifacts if required; preserve user/unrelated changes and priorcanonicalowners.

## Findings

Preflight clean calc. Latest human clarifies tiny roundingdifferences are visuallynegligible: use JS and bounded meaningfulchecks; no RTLround library port. Source confirms unsigned32height query has denominator127 and safedistance fromhalf; use ordinaryMath. ActualCPPUnormalstruct init alreadyimplemented, reuse withoutnativegenerator. Three scalarfieldcells are onlylvaluebridges foractualAny, not a binarydata/memoryengine. Native PutValue differs bymember inmutationtiming/failurebool; preserve and recordCALC111. Fuzz-onlyenvironment notbrowsernormalconfiguration, no fake config provider. All futuretask/fullcheckpoint constraints retained.
