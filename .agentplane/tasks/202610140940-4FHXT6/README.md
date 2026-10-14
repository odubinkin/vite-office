---
id: "202610140940-4FHXT6"
title: "Implement Calc boolean cell-format items using canonical shared boolean values"
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
  updated_at: "2026-10-14T09:41:55.888Z"
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
    body: "Start: implement real Calc bool attributes and canonical shared bool value operations for native DocPool/UI/ODS dependencies."
events:
  -
    type: "status"
    at: "2026-10-14T09:42:27.869Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement real Calc bool attributes and canonical shared bool value operations for native DocPool/UI/ODS dependencies."
doc_version: 3
doc_updated_at: "2026-10-14T09:42:27.869Z"
doc_updated_by: "CODER"
description: "Task112 prepares actual ScDocumentPool dependencies for UI and ODS: ScShrinkToFitCell, ScVerticalStackCell, ScLineBreakCell and ScHyphenateCell default/copy/Clone contracts over reused shared SfxBoolItem. Align shared bool default/copy/value/equality/PutValue/value-text behavior with pinned native source, retain existing browser scalar UNO boundary and GC, no duplicate Calc bool engine or fake document/config service. Record inventory, source quirks and actual dependency-driven next steps; targeted Calc/affected raw100 and repository gates, no full before121."
sections:
  Summary: "Prepare actual native cell-format defaults required by ScDocumentPool for UI and ODS: four Calc boolean attribute classes over one corrected shared SfxBoolItem. No fake document/configuration services or Calc-only boolean implementation."
  Scope: "Nineteen planned non-task paths: four runtime/header files sc/source/core/data/attrib.ts,sc/inc/attrib.ts,sc/inc/scitems.ts,svl/source/items/cenumitm.ts; two new real public value-history tests; existing runtime/provenance records for all4owners (8records); two new Calc/shared capability records; calc-core, browser-GC and suspected-issues docs. Reuse all shared Writer pool/string/value owners. Preserve existing metadata history/statuses unless supported by new exact evidence. No localization/presentation/XML diagnostics/pool instance manager/lifetime engine/native compiled claim; these native responsibilities remain explicit gaps. Existing browser QueryValue scalar and PutValue plain boolean binding retained instead of inventing another UNO transport."
  Plan: "Review full native ScDocument/ScTable/ScColumn construction dependency edges and DocPool default bindings. Implement ScShrinkToFitCell ATTR140, ScVerticalStackCell ATTR134, ScLineBreakCell ATTR139 and ScHyphenateCell ATTR125: false defaults, scalar and implicit-copy construction, real shared inheritance, Clone reconstructing fixedWhich from payload while implicit copy retains sourceWhich. Align shared SfxBoolItem default factory, implicit copy/value construction, early-return SetValue, Clone value copy, same-native-type payload equality ignoringWhich, bool query/update/value text over actual shared OOString. Preserve native false wrong-type PutValue and unchanged-value success; type-invalid cross-class comparison remains host false outside native asserted domain. Use ordinary GC, do not port native bool instance/refcount cache. Record source observations and dependency-based next steps toward actual document/column storage, options/services and ODS reuse. Run wholeCalc and complete affected Bool profile/raw100 plus relevant existing request/dispatch/itemset/Writer shared-bool consumers; no private forcing/fake providers. Run only relevant format/lint/types/docs/size/deps/source-tree/provenance/registry/routing/doctor/diff gates. No unrelated full office, tooling or inventory-test replay; next scheduled full121. Commit exact intentional paths, source/hash review, same-agent EVAL explicitly not independent, APverify/close cleancalc. Goal remains active; prior pause boundary111 was fulfilled and this user request resumes work."
  Verify Steps: |-
    1. Source review native attrib.hxx/cxx, scitems.hxx, docpool.cxx, eitem.hxx/cenumitm.cxx and poolitem type/equality contracts; preserve true defaults/IDs/copy-vs-Clone behavior and shared scalar browser boundary. Native generic presentation/localization/OS/ABI/debug/invalid downcast/cache/refcount/address identity excluded, no native compile or fake peer.
    2. Actual source-absent wholeCalc coverage and complete Bool source owner profile rawS/B/F/L100/everycounterpositive using new source-backed real item histories plus existing shared request/dispatch/itemset and real Writer consumer cases. Reuse unchanged dependencies without remeasured-owner claims. Restore all4exactreference links in finally before source checks; no full office before121 or Writer-only coverage repair.
    3. Focused Prettier+ESLint on intentional source/test/metadata/docs paths; app typecheck and relevant docs/size/deps/source-tree/provenance/registry/routing/doctor/diff gates. No tool implementation changes, so do not replay unrelated tooling/inventory suites or empty browser project/build. Retain failed results before bounded corrections; never weaken assertions/thresholds.
    4. Baseline3426current tracked non-task hashes and exact committed snapshot prove only19intentionalpaths changed (subject to bounded real fixes), source-bound full actual raw100 evidence and metadata trace. Separate same-agent evaluator not independent, APverify/close, cleanbranchcalc; goal remains active toward real document/UI/ODS.
  Verification: "Pending current-source implementation and declared focused verification."
  Rollback Plan: "Revert only intentional task112 code/tests/metadata/docs if necessary. Keep user and unrelated task changes untouched. Restore all4original symlink targets in finally; do not touch source trees or merge branches. No branch creation, history reset or network action."
  Findings: "Prior cycle111 DONE:15801unit/123inventory/38tooling/316browser,497ownersraw100,3426source hashes, cleancalc. User explicitly resumed preparation for UI and ODS. Native ScDocument ctor immediately uses options/global config/shared strings/attribute pool, ScTable allocates columns, and column storage requires genuine cell peers. Native ScDocumentPool unconditionally creates these four boolean cell attributes. Existing shared Bool had Which-sensitive equality and lacked native bool PutValue/copy/default factory/value text; fix shared behavior rather than duplicate it in Calc. Partial/dummy ScDocument or scalar-only fake CellStore is rejected. Next full is121, no new automatic pause requested."
id_source: "generated"
---
## Summary

Prepare actual native cell-format defaults required by ScDocumentPool for UI and ODS: four Calc boolean attribute classes over one corrected shared SfxBoolItem. No fake document/configuration services or Calc-only boolean implementation.

## Scope

Nineteen planned non-task paths: four runtime/header files sc/source/core/data/attrib.ts,sc/inc/attrib.ts,sc/inc/scitems.ts,svl/source/items/cenumitm.ts; two new real public value-history tests; existing runtime/provenance records for all4owners (8records); two new Calc/shared capability records; calc-core, browser-GC and suspected-issues docs. Reuse all shared Writer pool/string/value owners. Preserve existing metadata history/statuses unless supported by new exact evidence. No localization/presentation/XML diagnostics/pool instance manager/lifetime engine/native compiled claim; these native responsibilities remain explicit gaps. Existing browser QueryValue scalar and PutValue plain boolean binding retained instead of inventing another UNO transport.

## Plan

Review full native ScDocument/ScTable/ScColumn construction dependency edges and DocPool default bindings. Implement ScShrinkToFitCell ATTR140, ScVerticalStackCell ATTR134, ScLineBreakCell ATTR139 and ScHyphenateCell ATTR125: false defaults, scalar and implicit-copy construction, real shared inheritance, Clone reconstructing fixedWhich from payload while implicit copy retains sourceWhich. Align shared SfxBoolItem default factory, implicit copy/value construction, early-return SetValue, Clone value copy, same-native-type payload equality ignoringWhich, bool query/update/value text over actual shared OOString. Preserve native false wrong-type PutValue and unchanged-value success; type-invalid cross-class comparison remains host false outside native asserted domain. Use ordinary GC, do not port native bool instance/refcount cache. Record source observations and dependency-based next steps toward actual document/column storage, options/services and ODS reuse. Run wholeCalc and complete affected Bool profile/raw100 plus relevant existing request/dispatch/itemset/Writer shared-bool consumers; no private forcing/fake providers. Run only relevant format/lint/types/docs/size/deps/source-tree/provenance/registry/routing/doctor/diff gates. No unrelated full office, tooling or inventory-test replay; next scheduled full121. Commit exact intentional paths, source/hash review, same-agent EVAL explicitly not independent, APverify/close cleancalc. Goal remains active; prior pause boundary111 was fulfilled and this user request resumes work.

## Verify Steps

1. Source review native attrib.hxx/cxx, scitems.hxx, docpool.cxx, eitem.hxx/cenumitm.cxx and poolitem type/equality contracts; preserve true defaults/IDs/copy-vs-Clone behavior and shared scalar browser boundary. Native generic presentation/localization/OS/ABI/debug/invalid downcast/cache/refcount/address identity excluded, no native compile or fake peer.
2. Actual source-absent wholeCalc coverage and complete Bool source owner profile rawS/B/F/L100/everycounterpositive using new source-backed real item histories plus existing shared request/dispatch/itemset and real Writer consumer cases. Reuse unchanged dependencies without remeasured-owner claims. Restore all4exactreference links in finally before source checks; no full office before121 or Writer-only coverage repair.
3. Focused Prettier+ESLint on intentional source/test/metadata/docs paths; app typecheck and relevant docs/size/deps/source-tree/provenance/registry/routing/doctor/diff gates. No tool implementation changes, so do not replay unrelated tooling/inventory suites or empty browser project/build. Retain failed results before bounded corrections; never weaken assertions/thresholds.
4. Baseline3426current tracked non-task hashes and exact committed snapshot prove only19intentionalpaths changed (subject to bounded real fixes), source-bound full actual raw100 evidence and metadata trace. Separate same-agent evaluator not independent, APverify/close, cleanbranchcalc; goal remains active toward real document/UI/ODS.

## Verification

Pending current-source implementation and declared focused verification.

## Rollback Plan

Revert only intentional task112 code/tests/metadata/docs if necessary. Keep user and unrelated task changes untouched. Restore all4original symlink targets in finally; do not touch source trees or merge branches. No branch creation, history reset or network action.

## Findings

Prior cycle111 DONE:15801unit/123inventory/38tooling/316browser,497ownersraw100,3426source hashes, cleancalc. User explicitly resumed preparation for UI and ODS. Native ScDocument ctor immediately uses options/global config/shared strings/attribute pool, ScTable allocates columns, and column storage requires genuine cell peers. Native ScDocumentPool unconditionally creates these four boolean cell attributes. Existing shared Bool had Which-sensitive equality and lacked native bool PutValue/copy/default factory/value text; fix shared behavior rather than duplicate it in Calc. Partial/dummy ScDocument or scalar-only fake CellStore is rejected. Next full is121, no new automatic pause requested.
