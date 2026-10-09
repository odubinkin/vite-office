---
id: "202610090833-ERVAK2"
title: "Port Calc numerical range list geometry and edit operations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T08:34:31.317Z"
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
    body: "Start: port numerical range list ownership and native join/insertion/deletion contracts, retaining original ordering and bounded native evidence."
events:
  -
    type: "status"
    at: "2026-10-09T08:34:41.597Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port numerical range list ownership and native join/insertion/deletion contracts, retaining original ordering and bounded native evidence."
doc_version: 3
doc_updated_at: "2026-10-09T08:34:41.597Z"
doc_updated_by: "CODER"
description: "Implement ScRangeList value ownership, joining, partial combining, insertion, area deletion and numerical queries at original rangelst boundaries; compare unchanged native implementations and preserve existing Calc/shared evidence."
sections:
  Summary: "Port the original numerical ScRangeList owner and edit geometry, reusing established address/range values."
  Scope: "New sc/inc/rangelst.ts re-export and sc/source/core/tool/rangelst.ts owner, numerical acceptance tests and native fixture, scripts/calc-rangelst-native-probe.mjs, Calc capability/runtime/provenance records, calc-core docs. Add original SCSIZE type at existing sc/inc/address.ts and update its runtime/provenance mapping. No shared/Writer implementation changes, no merges. Calc milestone7; full suite after10."
  Plan: "Implement native numerical list default/copy/assignment, stable owned range values, sequence access/iteration/insertion/swap, Join restart and row cache semantics, AddAndPartialCombine, all InsertRow/InsertCol overloads and original one/two/three/four-fragment DeleteArea helpers, Find/Contains/Intersects/Combine/GetTopLeftCorner/GetIntersectedRange, unsigned64 cell counting. Reuse existing ScAddress/ScRange; preserve original algorithm order, predicates and surprising boundary results. Keep absent document-dependent Parse/Format/UpdateReference and ScRangePairList explicit in inventory; do not fabricate document/compiler owners. Compile unchanged pinned numerical definitions/helper bodies and original numerical range/address bodies under ASan/UBSan; record differential fixtures with full/source-body hashes and original unit examples. Retain all previous test bodies/fixtures/status flags. Validate scoped Calc actual100 coverage, affected/static/inventory guards, review size grouping, record review and close with actual implementation commit. Authorized core progression under user goal."
  Verify Steps: "Run node scripts/calc-rangelst-native-probe.mjs --write then --check requiring exact pinned blobs and ASan/UBSan-clean bounded numeric states; compare all portable TS outcomes and retained upstream numeric unit examples. Run npm run test:coverage:calc actual100 for statements/branches/functions/lines, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry check0 semantic violations; previous fixtures/tests/status flags/shared source unchanged. Review original grouping if file exceeds500 lines; hard1000 limit. Routing, ap doctor, diff check and final clean branch calc. Full suite scheduled atCalc10."
  Verification: "Pending implementation and original numerical differential acceptance."
  Rollback Plan: "Revert only this implementation commit, preserving previous initialized formula reference owners and native evidence."
  Findings: "Native row cache is monotone except RemoveAll and explicit copy/swap; direct insert and Remove do not recompute it. Join uses original restart and input ownership semantics rather than arbitrary union geometry. Insert predicates use logical OR; deletion first removes fully contained ranges then handles fragments in original order. handleOneRange top trimming uses deleting start row plus1; preserve original result. DeleteArea assumes equal deleting sheet endpoints; native existing multitab behavior is retained without invented3D subtraction."
id_source: "generated"
---
## Summary

Port the original numerical ScRangeList owner and edit geometry, reusing established address/range values.

## Scope

New sc/inc/rangelst.ts re-export and sc/source/core/tool/rangelst.ts owner, numerical acceptance tests and native fixture, scripts/calc-rangelst-native-probe.mjs, Calc capability/runtime/provenance records, calc-core docs. Add original SCSIZE type at existing sc/inc/address.ts and update its runtime/provenance mapping. No shared/Writer implementation changes, no merges. Calc milestone7; full suite after10.

## Plan

Implement native numerical list default/copy/assignment, stable owned range values, sequence access/iteration/insertion/swap, Join restart and row cache semantics, AddAndPartialCombine, all InsertRow/InsertCol overloads and original one/two/three/four-fragment DeleteArea helpers, Find/Contains/Intersects/Combine/GetTopLeftCorner/GetIntersectedRange, unsigned64 cell counting. Reuse existing ScAddress/ScRange; preserve original algorithm order, predicates and surprising boundary results. Keep absent document-dependent Parse/Format/UpdateReference and ScRangePairList explicit in inventory; do not fabricate document/compiler owners. Compile unchanged pinned numerical definitions/helper bodies and original numerical range/address bodies under ASan/UBSan; record differential fixtures with full/source-body hashes and original unit examples. Retain all previous test bodies/fixtures/status flags. Validate scoped Calc actual100 coverage, affected/static/inventory guards, review size grouping, record review and close with actual implementation commit. Authorized core progression under user goal.

## Verify Steps

Run node scripts/calc-rangelst-native-probe.mjs --write then --check requiring exact pinned blobs and ASan/UBSan-clean bounded numeric states; compare all portable TS outcomes and retained upstream numeric unit examples. Run npm run test:coverage:calc actual100 for statements/branches/functions/lines, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry check0 semantic violations; previous fixtures/tests/status flags/shared source unchanged. Review original grouping if file exceeds500 lines; hard1000 limit. Routing, ap doctor, diff check and final clean branch calc. Full suite scheduled atCalc10.

## Verification

Pending implementation and original numerical differential acceptance.

## Rollback Plan

Revert only this implementation commit, preserving previous initialized formula reference owners and native evidence.

## Findings

Native row cache is monotone except RemoveAll and explicit copy/swap; direct insert and Remove do not recompute it. Join uses original restart and input ownership semantics rather than arbitrary union geometry. Insert predicates use logical OR; deletion first removes fully contained ranges then handles fragments in original order. handleOneRange top trimming uses deleting start row plus1; preserve original result. DeleteArea assumes equal deleting sheet endpoints; native existing multitab behavior is retained without invented3D subtraction.
