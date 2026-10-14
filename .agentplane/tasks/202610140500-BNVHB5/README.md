---
id: "202610140500-BNVHB5"
title: "Implement shared configuration Data storage path resolution and set templates"
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
  updated_at: "2026-10-14T05:01:17.898Z"
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
    body: "Start: implement complete logical Data and SetNode configuration storage/path/template/extension contracts over actual existing shared values; native JS UTF16 temporary strings and strict affected verification under active goal approval."
events:
  -
    type: "status"
    at: "2026-10-14T05:01:38.709Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement complete logical Data and SetNode configuration storage/path/template/extension contracts over actual existing shared values; native JS UTF16 temporary strings and strict affected verification under active goal approval."
doc_version: 3
doc_updated_at: "2026-10-14T05:01:38.709Z"
doc_updated_by: "CODER"
description: "Task108: complete logical configmgr Data/SetNode implementation over actual shared tree/types/modification/addition values, including path parsing/escaping/canonical resolution/finalized tracking/templates/extension lists. Native JS UTF16 local string building, no fake Data/backend or missing buffer library. WholeCalc/affected raw100, static/Calc0UI/16gates, no full office before111."
sections:
  Summary: "Task108 implements actual shared configmgr Data and SetNode logical storage/path/template/extension contracts, unblocking real configuration loading for Calc defaults. Reuse existing shared tree/type/modification/addition/OUString/UNO values; no fake settings Data/provider."
  Scope: "Two runtime files configmgr/source/data.ts and setnode.ts, two source-backed test files data-paths.test.ts/data-tree.test.ts, four shared runtime/provenance records, one shared capability, Calc core/GC/suspected-issues docs. Twelve planned non-task paths. Existing shared runtime unchanged. Source responsibility follows actual Data/Set headers/bodies; local std::u16string_view/OUStringBuffer temporary UTF16 work uses native JS strings without a new buffer/lifetime library. Public string values remain actual OUString. Actual Property/XML/backend/configuration services/default/document/grid/ODS integration pending; native debug/ABI/const/private-copy/container syntax/implicit vector insertion/diagnostic logging/wholeQA are excluded or unverified."
  Plan: "Port complete logical Data NO_LAYER/root/components/templates/modifications/extension-additions and static createSegment/parseSegment/fullTemplateName/equalTemplateNames plus resolvePathRepresentation/getTemplate/add/removeExtensionXcuAdditions. Out primitive pointers use existing tuple convention, string out owners remain stable. Preserve partial outputs on parse failure, final-slash compatibility, set/localized template checks, minfinalized metadata and early-missing lookup semantics. Use existing SortedVector/config_map entries for extension keys and actual NodeMap/Root/Modifications/Additions. ExtensionXcu ordinary refs omit SimpleReferenceObject inheritance; original uninitialized layer is initialized by actual add operation, no fake default. SetNode copies owned defaults/template/additional names and child nodes, mandatory/layers/finalized; clone false drops own template only and Nodecopy drops description. Returned additional-name array is the erased native vector reference; callers explicitly copy OUString on value insertion, actual Set clone performs copies. Data type-only Set import avoids an eager class cycle while Set calls actual Data helper. Source-backed real-tree/UTF16 grammar histories including fullvalid/error/output identities and actual existing owner tests; no fake compiler/service/provider/C++ generator/native memory experiment. Full source-absent Calc plus complete configmgr/SortedVector/Any/UnoType profile raw100, actual static/Calc0UI/fourlinksrestored/16gates/exacthashes/separate same-agent evaluator/DONE/clean. Document newly confirmed suspicious path-validation cases, preserve behavior. Goalactive until requested secondfull111/repairs pause; no Writer-only repair."
  Verify Steps: |-
    1. Review pinned complete Data/Set declarations/bodies and reused real owners. Source-backed UTF16 grammar tests cover escaping/three entities/unknown entities/quotes/wildcard/bare/simple/boundary indices/partial outputs/fulltemplate colon errors/short-long equality. Real Data/Set/localized/Group/value trees test root/optional outputs/missing components and descendants/partial canonical outputs/finalized minimum/final slash/set and localized valid/mismatch/bad-kind branches/templates cache/extension duplicate/removal/copied key/live additions and layer widths. Set own/additional/default strings copy/clone/mandatory/description/children identities and actual array value-insertion bridge tested. Record suspicious source cases without silently fixing; native invalid pointers/assertions/ABI/diagnostics/fullQA/compiled differential excluded.
    2. Whole source-absent Calc and complete all configmgr executable owners plus reused SortedVector/Any/UnoType profile with new and actual existing tests, rawS/B/F/L100/everyrawcounterpositive. Pure Additions type has no executable counters. Actual source-absent static/Calc0UI/four exact reference links restored. No Writer-only repair/full office before111.
    3. All16 existing repository gates and current intentional formatting; truthful records/capability/GC/suspected issues, no source-routing/threshold weakening, fake provider/buffer/lifetime library or private-state counter forcing. Retain failures before bounded corrections.
    4. Exact3377baseline/current/committed hashes and only12intentionalpaths, actual source/gate/coverage manifests bound to sourceSHA; same-agent separate EVAL not independent review, APverify/DONE/clean branchcalc. Goalactive until secondfull111 requestedpause after relevant repairs.
  Verification: "Pending implementation and actual current checks."
  Rollback Plan: "Finally restore four exact reference links on all test exits. Revert only intentional task changes via a new task if necessary; no branch merge/history rewrite/unrelated task changes."
  Findings: "No actual shared OUStringBuffer implementation exists; native JS UTF16 string operations replace local buffer/view syntax with public actual OUString values and explicit conversion, without a fake buffer/memory library. Node uses SAL_MAX_INT32 equal to Data::NO_LAYER; no forced Node->Data->Root eager cycle. Actual Data imports SetNode only as an erased type, Set calls real Data.equalTemplateNames. Preserve native partial output and early missing-node resolution, not transactional path validation. Native container/const/private-copy/lifetime/diagnostic details remain explicitly outside certification; actual Set clone does value copies, callers must copy OUString at erased vector value insertion."
id_source: "generated"
---
## Summary

Task108 implements actual shared configmgr Data and SetNode logical storage/path/template/extension contracts, unblocking real configuration loading for Calc defaults. Reuse existing shared tree/type/modification/addition/OUString/UNO values; no fake settings Data/provider.

## Scope

Two runtime files configmgr/source/data.ts and setnode.ts, two source-backed test files data-paths.test.ts/data-tree.test.ts, four shared runtime/provenance records, one shared capability, Calc core/GC/suspected-issues docs. Twelve planned non-task paths. Existing shared runtime unchanged. Source responsibility follows actual Data/Set headers/bodies; local std::u16string_view/OUStringBuffer temporary UTF16 work uses native JS strings without a new buffer/lifetime library. Public string values remain actual OUString. Actual Property/XML/backend/configuration services/default/document/grid/ODS integration pending; native debug/ABI/const/private-copy/container syntax/implicit vector insertion/diagnostic logging/wholeQA are excluded or unverified.

## Plan

Port complete logical Data NO_LAYER/root/components/templates/modifications/extension-additions and static createSegment/parseSegment/fullTemplateName/equalTemplateNames plus resolvePathRepresentation/getTemplate/add/removeExtensionXcuAdditions. Out primitive pointers use existing tuple convention, string out owners remain stable. Preserve partial outputs on parse failure, final-slash compatibility, set/localized template checks, minfinalized metadata and early-missing lookup semantics. Use existing SortedVector/config_map entries for extension keys and actual NodeMap/Root/Modifications/Additions. ExtensionXcu ordinary refs omit SimpleReferenceObject inheritance; original uninitialized layer is initialized by actual add operation, no fake default. SetNode copies owned defaults/template/additional names and child nodes, mandatory/layers/finalized; clone false drops own template only and Nodecopy drops description. Returned additional-name array is the erased native vector reference; callers explicitly copy OUString on value insertion, actual Set clone performs copies. Data type-only Set import avoids an eager class cycle while Set calls actual Data helper. Source-backed real-tree/UTF16 grammar histories including fullvalid/error/output identities and actual existing owner tests; no fake compiler/service/provider/C++ generator/native memory experiment. Full source-absent Calc plus complete configmgr/SortedVector/Any/UnoType profile raw100, actual static/Calc0UI/fourlinksrestored/16gates/exacthashes/separate same-agent evaluator/DONE/clean. Document newly confirmed suspicious path-validation cases, preserve behavior. Goalactive until requested secondfull111/repairs pause; no Writer-only repair.

## Verify Steps

1. Review pinned complete Data/Set declarations/bodies and reused real owners. Source-backed UTF16 grammar tests cover escaping/three entities/unknown entities/quotes/wildcard/bare/simple/boundary indices/partial outputs/fulltemplate colon errors/short-long equality. Real Data/Set/localized/Group/value trees test root/optional outputs/missing components and descendants/partial canonical outputs/finalized minimum/final slash/set and localized valid/mismatch/bad-kind branches/templates cache/extension duplicate/removal/copied key/live additions and layer widths. Set own/additional/default strings copy/clone/mandatory/description/children identities and actual array value-insertion bridge tested. Record suspicious source cases without silently fixing; native invalid pointers/assertions/ABI/diagnostics/fullQA/compiled differential excluded.
2. Whole source-absent Calc and complete all configmgr executable owners plus reused SortedVector/Any/UnoType profile with new and actual existing tests, rawS/B/F/L100/everyrawcounterpositive. Pure Additions type has no executable counters. Actual source-absent static/Calc0UI/four exact reference links restored. No Writer-only repair/full office before111.
3. All16 existing repository gates and current intentional formatting; truthful records/capability/GC/suspected issues, no source-routing/threshold weakening, fake provider/buffer/lifetime library or private-state counter forcing. Retain failures before bounded corrections.
4. Exact3377baseline/current/committed hashes and only12intentionalpaths, actual source/gate/coverage manifests bound to sourceSHA; same-agent separate EVAL not independent review, APverify/DONE/clean branchcalc. Goalactive until secondfull111 requestedpause after relevant repairs.

## Verification

Pending implementation and actual current checks.

## Rollback Plan

Finally restore four exact reference links on all test exits. Revert only intentional task changes via a new task if necessary; no branch merge/history rewrite/unrelated task changes.

## Findings

No actual shared OUStringBuffer implementation exists; native JS UTF16 string operations replace local buffer/view syntax with public actual OUString values and explicit conversion, without a fake buffer/memory library. Node uses SAL_MAX_INT32 equal to Data::NO_LAYER; no forced Node->Data->Root eager cycle. Actual Data imports SetNode only as an erased type, Set calls real Data.equalTemplateNames. Preserve native partial output and early missing-node resolution, not transactional path validation. Native container/const/private-copy/lifetime/diagnostic details remain explicitly outside certification; actual Set clone does value copies, callers must copy OUString at erased vector value insertion.
