---
id: "202610140416-Y5Q3Y4"
title: "Implement shared configuration group tree and layered member lookup for Calc settings"
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
  updated_at: "2026-10-14T04:17:35.122Z"
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
    body: "Start: actual sharedconfig group/root/member tree andlayerlookup over existingSortedVector/SAL, plainJSrefs,no fakeData/settings or newmemorylibrary;source-backedstrictchecks/nextfull111pause."
events:
  -
    type: "status"
    at: "2026-10-14T04:17:35.522Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual sharedconfig group/root/member tree andlayerlookup over existingSortedVector/SAL, plainJSrefs,no fakeData/settings or newmemorylibrary;source-backedstrictchecks/nextfull111pause."
doc_version: 3
doc_updated_at: "2026-10-14T04:17:35.522Z"
doc_updated_by: "CODER"
description: "Task105: genuine configmgr Node/GroupNode/RootNode/NodeMap and config_map length-contents comparator/type responsibility over existing SortedVector, OUString, RuntimeException and SAL_MAX_INT32. Full represented logical layer/finalized/mandatory/description/template/deepclone/cache/ordered entry contracts; ordinaryJSrefs, no new SAL/refcount/staticize/allocator/provider or fake Data/settings. Preserve Node copy description omission, document suspectedcase. No property/XML/backend/locale/defaultConfig stubs; targetedCalc/complete sharedraw100/inventory/gates, nextfull111pause."
sections:
  Summary: "Task105 begins real shared configuration model needed before Calc document/view defaults: actual group/root/layered member tree, not hardcoded locale/year/color defaults."
  Scope: "New apps/office/src/configmgr/source/{config_map,node,nodemap,groupnode,rootnode}.ts and configuration-tree.test.ts;10shared runtime/provenance records,newsharedcap; calc-core/GC/suspectedissues docs. Reuse existing genuine SortedVector/OUString/RuntimeException/SALconst modules unchanged.20plannednon-taskpaths; no new dependencies/network/memorylibrary/fakeNode/provider/Data/settingvalue or source-check/compiler weakening."
  Plan: "Port actual configmgr logical Node/GroupNode/RootNode/NodeMap and config_map comparator/type responsibilities in5original source files, using existing SortedVector/OUString/RuntimeException/Reference/SAL_MAX_INT32. Native NodeMap first/second entry references, undefined end cursor, getOrInsert for operator[] and live ordered iteration preserve represented initialized member/cache/insert/erase/deepclone/layer contracts; no whole STL/iterator-address/ABI claim. Node ordinaryJSrefs omit native refcount inheritance/staticize optimization peruser, no no-op lifecyclelibrary or fake Data/service. Int32layer/finalized/mandatory and stable description value, copy description omission and clone template/child rules preserved. SAL_MAX_INT32 equals actualData::NO_LAYER INT_MAX, avoids artificial importcycle withoutduplicatingData. Source-backed realRoot/Group tests and actual unchangedSortedVector tests, no fakeNode/provider ornewCppgenerator. New6source/tests+10records/newcap/3Calcdocs =20paths. WholeCalc andcomplete5newshared+reusedSortedVector owner raw100, actualstatic/Calc0UI/4links,16gates/exacthashes/separate sameagentEVAL(notindependent)/DONE/clean. Property/sets/localized/XML/layers/backend/configdefaults/ScDocOptions/UI/ODS remainpending; nextfull111pause."
  Verify Steps: |-
    1. Source review original complete Node/NodeMap/Group/Root declarations/bodies/config_map/DataNO_LAYER. Real initializedRoot/Group histories prove6kindvalues, Int32metadata, stable description, actualcopy descriptiondrop, templatekeep/childdeepclone/mandatory/extensibility; mapUTF16length-first order/cursor insert duplicate/erase variants/cache invalidation/retained lvalue/newaliases/findNode layerfilter, copied keyinput andsource/target independence. Actual shared RuntimeException for native release getMembers fallback, Rootclone release null documented; native debug/assertion/refcount/staticize/ABI notclaimed. No fakeleafclass ornewCppgenerator.
    2. Whole source-absent npm run test:coverage:calc and complete5newshared+unchangedSortedVector owner/profile with real relevanttests rawS/B/F/L100/everycounterpositive; actualstatic/Calc0UI manifests,4linksrestoreexact. Reused unchanged SAL/cppu dependencies do not become modifiedowners or duplicatedlibraries. NoWriter-onlycoverage repair/fullofficebefore111.
    3. All16 existing repo gates and currentintentionalpathsformat afterlastedit, originalheader/core responsibility records andtruthfulscopegaps/newcap/suspectedcase090. No threshold/sourceRouting weakening or private-state counterforcing. Retain failures beforeboundedcorrection.
    4. Exact baseline/current/committed sourcehashes onlyplanned20paths, actualsource/gate/coverage manifests sourcecommit-bound, same-agent separateevaluator notindependent, APverify/DONE/cleanbranchcalc. Goalactive; nextfull111requestedpause.
  Verification: "Pending implementation and actual checks."
  Rollback Plan: "Finallyrestore4exactreference links onalltest exits. Revert onlyintentionaltaskchanges throughnewtask, no merge/historyrewrite/unrelatedtask changes."
  Findings: "Nativeconfig_map orders length thenUTF16content, nativeJSMap insertion order alone insufficient; reuse existing verified SortedVector ratherthan port STL/memorymanager. NativeNodecopy copieslayer/finalized but omitsdescription, preserveanddocumentCALC-090. Groupclone false clearsown template but children clone(true), mandatory/extensibility retained. ExistingSAL_MAX_INT32 matchesoriginalNO_LAYER INT_MAX and avoids node->Data->Root->Node eager class-cycle withoutfakeData. Native staticization/refcount APIs are memory-only and omittedunderJS-GC instruction. APIcursor/firstsecond/getOrInsert erases C++iterator/operator syntax, no fullSTL/private-access/invalidpointer/debug contract. Sourceinspection missing guessed configmgr path.hxx/cxx led to actual Data staticpath helpers; no mutation caused by missingread. Realproperty/XML/backend/services stillpending, no readiness claim."
id_source: "generated"
---
## Summary

Task105 begins real shared configuration model needed before Calc document/view defaults: actual group/root/layered member tree, not hardcoded locale/year/color defaults.

## Scope

New apps/office/src/configmgr/source/{config_map,node,nodemap,groupnode,rootnode}.ts and configuration-tree.test.ts;10shared runtime/provenance records,newsharedcap; calc-core/GC/suspectedissues docs. Reuse existing genuine SortedVector/OUString/RuntimeException/SALconst modules unchanged.20plannednon-taskpaths; no new dependencies/network/memorylibrary/fakeNode/provider/Data/settingvalue or source-check/compiler weakening.

## Plan

Port actual configmgr logical Node/GroupNode/RootNode/NodeMap and config_map comparator/type responsibilities in5original source files, using existing SortedVector/OUString/RuntimeException/Reference/SAL_MAX_INT32. Native NodeMap first/second entry references, undefined end cursor, getOrInsert for operator[] and live ordered iteration preserve represented initialized member/cache/insert/erase/deepclone/layer contracts; no whole STL/iterator-address/ABI claim. Node ordinaryJSrefs omit native refcount inheritance/staticize optimization peruser, no no-op lifecyclelibrary or fake Data/service. Int32layer/finalized/mandatory and stable description value, copy description omission and clone template/child rules preserved. SAL_MAX_INT32 equals actualData::NO_LAYER INT_MAX, avoids artificial importcycle withoutduplicatingData. Source-backed realRoot/Group tests and actual unchangedSortedVector tests, no fakeNode/provider ornewCppgenerator. New6source/tests+10records/newcap/3Calcdocs =20paths. WholeCalc andcomplete5newshared+reusedSortedVector owner raw100, actualstatic/Calc0UI/4links,16gates/exacthashes/separate sameagentEVAL(notindependent)/DONE/clean. Property/sets/localized/XML/layers/backend/configdefaults/ScDocOptions/UI/ODS remainpending; nextfull111pause.

## Verify Steps

1. Source review original complete Node/NodeMap/Group/Root declarations/bodies/config_map/DataNO_LAYER. Real initializedRoot/Group histories prove6kindvalues, Int32metadata, stable description, actualcopy descriptiondrop, templatekeep/childdeepclone/mandatory/extensibility; mapUTF16length-first order/cursor insert duplicate/erase variants/cache invalidation/retained lvalue/newaliases/findNode layerfilter, copied keyinput andsource/target independence. Actual shared RuntimeException for native release getMembers fallback, Rootclone release null documented; native debug/assertion/refcount/staticize/ABI notclaimed. No fakeleafclass ornewCppgenerator.
2. Whole source-absent npm run test:coverage:calc and complete5newshared+unchangedSortedVector owner/profile with real relevanttests rawS/B/F/L100/everycounterpositive; actualstatic/Calc0UI manifests,4linksrestoreexact. Reused unchanged SAL/cppu dependencies do not become modifiedowners or duplicatedlibraries. NoWriter-onlycoverage repair/fullofficebefore111.
3. All16 existing repo gates and currentintentionalpathsformat afterlastedit, originalheader/core responsibility records andtruthfulscopegaps/newcap/suspectedcase090. No threshold/sourceRouting weakening or private-state counterforcing. Retain failures beforeboundedcorrection.
4. Exact baseline/current/committed sourcehashes onlyplanned20paths, actualsource/gate/coverage manifests sourcecommit-bound, same-agent separateevaluator notindependent, APverify/DONE/cleanbranchcalc. Goalactive; nextfull111requestedpause.

## Verification

Pending implementation and actual checks.

## Rollback Plan

Finallyrestore4exactreference links onalltest exits. Revert onlyintentionaltaskchanges throughnewtask, no merge/historyrewrite/unrelatedtask changes.

## Findings

Nativeconfig_map orders length thenUTF16content, nativeJSMap insertion order alone insufficient; reuse existing verified SortedVector ratherthan port STL/memorymanager. NativeNodecopy copieslayer/finalized but omitsdescription, preserveanddocumentCALC-090. Groupclone false clearsown template but children clone(true), mandatory/extensibility retained. ExistingSAL_MAX_INT32 matchesoriginalNO_LAYER INT_MAX and avoids node->Data->Root->Node eager class-cycle withoutfakeData. Native staticization/refcount APIs are memory-only and omittedunderJS-GC instruction. APIcursor/firstsecond/getOrInsert erases C++iterator/operator syntax, no fullSTL/private-access/invalidpointer/debug contract. Sourceinspection missing guessed configmgr path.hxx/cxx led to actual Data staticpath helpers; no mutation caused by missingread. Realproperty/XML/backend/services stillpending, no readiness claim.
