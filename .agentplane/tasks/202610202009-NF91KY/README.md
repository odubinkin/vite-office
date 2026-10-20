---
id: "202610202009-NF91KY"
title: "Implement native shared EditEngine pool and rich-text object ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T20:09:54.903Z"
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
    body: "Start: implement genuine shared EditEngine pool/rich-text owners and missing native value dependencies under continuing user approval;preserve explicit unported service boundaries."
events:
  -
    type: "status"
    at: "2026-10-20T20:09:55.555Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement genuine shared EditEngine pool/rich-text owners and missing native value dependencies under continuing user approval;preserve explicit unported service boundaries."
doc_version: 3
doc_updated_at: "2026-10-20T20:18:56.765Z"
doc_updated_by: "CODER"
description: "Block57: port actual EditEngine item package/pool and consumed EditTextObject ownership from pinned upstream,including missing value prerequisites. Preserve native static/dynamic defaults,secondary-pool resolution,copy/equality/cache/style semantics and real shared classes;do not invent renderer,UNO,numbering or graphic services. Keep unported responsibilities explicit until real source owners exist."
sections:
  Summary: |-
    Implement native shared EditEngine pool and rich-text object ownership

    Block57: port actual EditEngine item package/pool and consumed EditTextObject ownership from pinned upstream,including missing value prerequisites. Preserve native static/dynamic defaults,secondary-pool resolution,copy/equality/cache/style semantics and real shared classes;do not invent renderer,UNO,numbering or graphic services. Keep unported responsibilities explicit until real source owners exist.
  Scope: "Shared EditEngine item/pool and rich text value owners plus required native dependencies,up to40 source/test files and registry/provenance/readiness/evidence. No native rendering engine or complete named-style UI claim;those remain subsequent actual owners. Work only calc checkout/branch;no merge/network/global files."
  Plan: "Implement block57 as one coherent prerequisite for genuine Calc styles/rich text: missing native bullet/numbering/font-variation values and their existing shared dependencies;complete original EditEngine ItemInfoPackage/ItemPool construction with static versus pool-local defaults;original EditTextObject owner,copy/equality,paragraph/attribute/field/style and cache rules over actual ContentInfo. Keep source filenames/header boundaries. Up to40 source/test files plus registry/provenance/readiness/evidence. No fabricated graphics,numbering,locale,UNO,layout or default-pool facade. Port required dependencies rather than replacing missing owners. Then related shared tests and full shared100/Calc100,14 static gates/build,Chromium and DOM-free Worker plus current Calc font/wrap/ODS and Writer regression;portable raw reports/source hashes/evaluator/clean finish. Full all-app replay next60. Task may span turns;do not close before complete approved scope passes."
  Verify Steps: "Compare pinned eerdll.cxx,editdoc.cxx,editobj.cxx/hxx,editobj2.hxx and actual value headers/bodies. Verify exact defaults/slots/flags/static sharing/dynamic pool ownership,secondary resolution,real strings/paragraph/field/style/cache copy and equality. Run related shared tests,complete shared100 and Calc100 with original counters/thresholds;types,lint/format,dependencies,Writer/Calc resources,docs,tree,size,provenance,registry,routing,doctor,build/static-build. Genuine Chromium/DOM-free Worker owner acceptance and current Calc font/wrap/ODS desktop/mobile plus Writer regression;inspect screenshots. Preserve original failures and repairs;archive commands/raw reports/current source/native hashes with portable audit. Separate evaluator pass,traceable commits and clean calc state required. No all-app replay until60."
  Verification: "IN PROGRESS. Partial value prerequisite:10 focused tests pass,types/lint/docs/provenance/registry pass. See evidence/partial-values.json and raw final report/log archives. Complete shared100/Calc100,remaining static/build/browser acceptance and evaluator closure are pending;no completed task or broad parity claim."
  Rollback Plan: "Revert only task implementation commits after inspecting task-scoped changes;preserve existing Calc/shared owners and source identities. User performs branch integration."
  Findings: |-
    In-progress block57 source checkpoint: native SvxFontVariationsItem owns ordered copied Variation values,Clone and IEEE equality;actual VariationsToString uses shared OUStringBuffer.appendFloat. Presentation and real UNO Any share the native serialization;PutValue rejects non-string Any unchanged and replaces vector on extracted empty/invalid strings. Fixed featureCodeAsString uses the actual SAL ASCII_US descriptor/converter at the original known read site,without a generic conversion facade. Native table maps upper bytes through MS1252(CALC242). Float hashing and the actual remaining pool/rich-text owners are not yet ported;task must stay DOING.
    Focused final replay passed10 tests;typecheck,lint,docs,registry and provenance pass. Initial type errors in Readonly constructor narrowing were fixed through the source constructor discrimination. First upper-byte expected string incorrectly assumed private-use mapping;native table inspection corrected expected Euro/DEL/Latin1 values,without changing production converter selection. The initial failed unit JSON was overwritten before archival;observed failure text survives only in conversation,so this partial checkpoint does not claim that raw failed report is preserved. Final raw result is archived. Initial registry metadata used an invalid aspect and missing evidence groups;metadata now uses model-operation and actual source/test/docs references. The explicit textitem filename responsibility split is documented. Original failed type/registry/docs/provenance logs remain archived. An initial formatter/lint invocation had incorrect cwd-relative package paths and was rerun from repository root successfully.
    Next: implement remaining real native dependencies and owners in this same approved task,then complete all declared verification. No tests/gates/thresholds were weakened. No complete shared or Calc coverage claim for this unfinished task. Broader goal remains active;full all-app checkpoint remains60.
id_source: "generated"
---
## Summary

Implement native shared EditEngine pool and rich-text object ownership

Block57: port actual EditEngine item package/pool and consumed EditTextObject ownership from pinned upstream,including missing value prerequisites. Preserve native static/dynamic defaults,secondary-pool resolution,copy/equality/cache/style semantics and real shared classes;do not invent renderer,UNO,numbering or graphic services. Keep unported responsibilities explicit until real source owners exist.

## Scope

Shared EditEngine item/pool and rich text value owners plus required native dependencies,up to40 source/test files and registry/provenance/readiness/evidence. No native rendering engine or complete named-style UI claim;those remain subsequent actual owners. Work only calc checkout/branch;no merge/network/global files.

## Plan

Implement block57 as one coherent prerequisite for genuine Calc styles/rich text: missing native bullet/numbering/font-variation values and their existing shared dependencies;complete original EditEngine ItemInfoPackage/ItemPool construction with static versus pool-local defaults;original EditTextObject owner,copy/equality,paragraph/attribute/field/style and cache rules over actual ContentInfo. Keep source filenames/header boundaries. Up to40 source/test files plus registry/provenance/readiness/evidence. No fabricated graphics,numbering,locale,UNO,layout or default-pool facade. Port required dependencies rather than replacing missing owners. Then related shared tests and full shared100/Calc100,14 static gates/build,Chromium and DOM-free Worker plus current Calc font/wrap/ODS and Writer regression;portable raw reports/source hashes/evaluator/clean finish. Full all-app replay next60. Task may span turns;do not close before complete approved scope passes.

## Verify Steps

Compare pinned eerdll.cxx,editdoc.cxx,editobj.cxx/hxx,editobj2.hxx and actual value headers/bodies. Verify exact defaults/slots/flags/static sharing/dynamic pool ownership,secondary resolution,real strings/paragraph/field/style/cache copy and equality. Run related shared tests,complete shared100 and Calc100 with original counters/thresholds;types,lint/format,dependencies,Writer/Calc resources,docs,tree,size,provenance,registry,routing,doctor,build/static-build. Genuine Chromium/DOM-free Worker owner acceptance and current Calc font/wrap/ODS desktop/mobile plus Writer regression;inspect screenshots. Preserve original failures and repairs;archive commands/raw reports/current source/native hashes with portable audit. Separate evaluator pass,traceable commits and clean calc state required. No all-app replay until60.

## Verification

IN PROGRESS. Partial value prerequisite:10 focused tests pass,types/lint/docs/provenance/registry pass. See evidence/partial-values.json and raw final report/log archives. Complete shared100/Calc100,remaining static/build/browser acceptance and evaluator closure are pending;no completed task or broad parity claim.

## Rollback Plan

Revert only task implementation commits after inspecting task-scoped changes;preserve existing Calc/shared owners and source identities. User performs branch integration.

## Findings

In-progress block57 source checkpoint: native SvxFontVariationsItem owns ordered copied Variation values,Clone and IEEE equality;actual VariationsToString uses shared OUStringBuffer.appendFloat. Presentation and real UNO Any share the native serialization;PutValue rejects non-string Any unchanged and replaces vector on extracted empty/invalid strings. Fixed featureCodeAsString uses the actual SAL ASCII_US descriptor/converter at the original known read site,without a generic conversion facade. Native table maps upper bytes through MS1252(CALC242). Float hashing and the actual remaining pool/rich-text owners are not yet ported;task must stay DOING.
Focused final replay passed10 tests;typecheck,lint,docs,registry and provenance pass. Initial type errors in Readonly constructor narrowing were fixed through the source constructor discrimination. First upper-byte expected string incorrectly assumed private-use mapping;native table inspection corrected expected Euro/DEL/Latin1 values,without changing production converter selection. The initial failed unit JSON was overwritten before archival;observed failure text survives only in conversation,so this partial checkpoint does not claim that raw failed report is preserved. Final raw result is archived. Initial registry metadata used an invalid aspect and missing evidence groups;metadata now uses model-operation and actual source/test/docs references. The explicit textitem filename responsibility split is documented. Original failed type/registry/docs/provenance logs remain archived. An initial formatter/lint invocation had incorrect cwd-relative package paths and was rerun from repository root successfully.
Next: implement remaining real native dependencies and owners in this same approved task,then complete all declared verification. No tests/gates/thresholds were weakened. No complete shared or Calc coverage claim for this unfinished task. Broader goal remains active;full all-app checkpoint remains60.
