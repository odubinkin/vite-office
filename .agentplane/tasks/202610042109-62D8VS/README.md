---
id: "202610042109-62D8VS"
title: "Preserve native hyperlink text boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on:
  - "202610042048-H70ZBQ"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T21:10:30.965Z"
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
    body: "Start: implement approved coupled native hyperlink normalization/owned text coordinate update scope;one absent suite profile only,no AP source or helpers."
events:
  -
    type: "status"
    at: "2026-10-04T21:10:31.412Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved coupled native hyperlink normalization/owned text coordinate update scope;one absent suite profile only,no AP source or helpers."
doc_version: 3
doc_updated_at: "2026-10-04T21:17:56.045Z"
doc_updated_by: "CODER"
description: "Iteration122 replaces ordinary text hint splitting/value remerge with native owned boundary updates and excludes INET from adjacent MergePortions normalization. Include positive/negative coordinate updates,two-family flag/cross-family collector rules,actual object/maps/node/index/history boundaries,explicit formatting compatibility and bounded residuals. No upstream execution/helper artifacts;one absent profile only. Depends on completed iteration121."
sections:
  Summary: "Iteration122 restores separate native hyperlink boundaries and actual owned text hint coordinate updates for ordinary insertion/pure erasure."
  Scope: |-
    apps/office/src/sw/source/core/txtnode/ndhints.ts
    apps/office/src/sw/source/core/txtnode/ndtxt.ts
    apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
    apps/office/src/sw/source/core/txtnode/native-hyperlink-boundaries.test.ts
    apps/office/src/sw/source/core/txtnode/native-text-hint-update.test.ts
    apps/office/src/sw/source/core/doc/writer-model.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Safe goal-authorized local changes only;no network/upstream execution or AP source/helper artifacts.
  Plan: "Preserve separate adjacent INET54 ranges while retaining existing AUTO53 adjacent normalization,per native MergePortions exclusion. Replace ordinary insertion and pure erasure splitting/value-remerge with actual owned start/end changes per SwTextNode::Update and default InsertText paragraph-start adjustment. Extract bounded coordinate logic to ndtxt-hint-update.ts to keep existing mandatory1000-line limits;source-owned UpdateTextHints covers positive/negative offsets,endpoint DontExpand reset,cross-family INET suppression/AUTO collector and paragraph-start DontExpandStart,ignores DontMoveAttr as native Update does. Ordinary node calls use the actual owned container;zero insertion/no-op retains state;explicit character/link formatting preserves existing fragment adapter. Pure empty ReplaceRange uses native negative updates. Literal matrices inspect actual item/object/map identity,optional flags,equal/different adjacent links,interior/start/end/outside/paragraph-start offsets,two consecutive edits,disconnected caller/history/copy/transfer/codec and undo. Correct only the one prior writer-model hyperlink Count/comment expectation from2 to3;all other342previous tests byte-identical. Add one unverified native responsibility row/provenance mapping for extracted helper,append bounded explanations to ndhints/ndtxt records,leave all existing fields/status/defaults/exceptions unchanged except approved appendices. Native complete zero-width hints/modes/ignoreExpand locks/families/nesting/refcounts/listeners/Copy destination/same-node move/split/join remain unverified. Registered save/open/recovery deviations preserved. Six static gates first;one sequential absent build/app/inventory/scripts/Chromium with finally restoration and100%four-metric app/inventory coverage;failed-only recovery;restored source audits/scope/hash/AP sourcefree/doctor/routing/exact-SHA same-actor quality,CODERverify/finish,parent active."
  Verify Steps: |-
    1. Inspect pinned ndtxt.cxx Update/default InsertText/EraseText,thints.cxx MergePortions/TryInsertNesting and txtatr2.cxx INET flags. Record only prose/hashes,no source/helper/native execution. Expected equal adjacent INET remain distinct and ordinary insertion/erasure preserve actual continuous attribute identity/flags and map ownership with native bounded geometry.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. No present-profile duplicate/no concurrent audits;recover failed cases/gates only.
    4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
    5. Exact eight-path scope audit;one existing Count/comment correction,all342otherprevious tests byte-identical;234 existing runtime rows identical except two bounded justification appendices,one new unverified native helper row/mapping;native hashes and sourcefree ignored-inclusive AP scan. ap doctor and node .agentplane/policy/check-routing.mjs pass without new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass;CODER verify/finish with separate hashes;clean main/vendor restored,parent active. No broad native/UI status/default/exception or registered I/O/recovery promotion.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this leaf's semantic commit via a new authorized follow-up task;do not rewrite history or mutate DONE artifacts."
  Findings: "Iteration122 excludes INET54 from adjacent value merging per native MergePortions and updates ordinary insert/pure-erase coordinates on actual owned attributes per SwTextNode::Update/default InsertText. Source-owned ndtxt-hint-update decomposition preserves existing1000-line gates. Supported positive/negative ranges,paragraph-start DontExpandStart,end DontExpand reset,INET-first end suppression/AUTO fresh collector and ignored DontMoveAttr match the bounded native non-overlapping AUTO/INET slice. Continuous links keep item/object/map identity;equal adjacent links remain distinct through construction/copy/cut/transfer/history/graph16,even after deleting a gap.322 new literal cases cover both families,eight flags,all boundary relations and mixed end flags. One old hyperlink Count/comment expectation corrects2 to3;342 other prior tests stay byte-identical. Explicit formatted insertion/fragment/undo adapters retain their existing contracts.234 existing runtime rows retain statuses/defaults/exceptions except two bounded appendices;one new extracted native helper remains unverified. Native empty-hint retention,full Insert modes/ignore-expand locks/families/BuildPortions/nesting,explicit replacement/copy destination/same-node move/split/join/refcounts/destruction/listeners and broad core/UI parity remain unverified. Registered save/open/recovery deviations preserved;no module/goal promotion. Preflight clean main/base 71c77715e7ebe6a93e00468ffc92f90586065cfd;safe goal-local scope. Earlier formatted patch context mismatch recomputed route and repaired only intended new test fields;one mistaken read-only full git tree output truncated,then an inline bounded counter established343 prior tests,one corrected and342 byte-identical required. Plan count corrected clerically before verification. Native3 full-file hashes pending;no upstream execution or AP helper/source files. No tests/build run yet."
id_source: "generated"
---
## Summary

Iteration122 restores separate native hyperlink boundaries and actual owned text hint coordinate updates for ordinary insertion/pure erasure.

## Scope

apps/office/src/sw/source/core/txtnode/ndhints.ts
apps/office/src/sw/source/core/txtnode/ndtxt.ts
apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
apps/office/src/sw/source/core/txtnode/native-hyperlink-boundaries.test.ts
apps/office/src/sw/source/core/txtnode/native-text-hint-update.test.ts
apps/office/src/sw/source/core/doc/writer-model.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Safe goal-authorized local changes only;no network/upstream execution or AP source/helper artifacts.

## Plan

Preserve separate adjacent INET54 ranges while retaining existing AUTO53 adjacent normalization,per native MergePortions exclusion. Replace ordinary insertion and pure erasure splitting/value-remerge with actual owned start/end changes per SwTextNode::Update and default InsertText paragraph-start adjustment. Extract bounded coordinate logic to ndtxt-hint-update.ts to keep existing mandatory1000-line limits;source-owned UpdateTextHints covers positive/negative offsets,endpoint DontExpand reset,cross-family INET suppression/AUTO collector and paragraph-start DontExpandStart,ignores DontMoveAttr as native Update does. Ordinary node calls use the actual owned container;zero insertion/no-op retains state;explicit character/link formatting preserves existing fragment adapter. Pure empty ReplaceRange uses native negative updates. Literal matrices inspect actual item/object/map identity,optional flags,equal/different adjacent links,interior/start/end/outside/paragraph-start offsets,two consecutive edits,disconnected caller/history/copy/transfer/codec and undo. Correct only the one prior writer-model hyperlink Count/comment expectation from2 to3;all other342previous tests byte-identical. Add one unverified native responsibility row/provenance mapping for extracted helper,append bounded explanations to ndhints/ndtxt records,leave all existing fields/status/defaults/exceptions unchanged except approved appendices. Native complete zero-width hints/modes/ignoreExpand locks/families/nesting/refcounts/listeners/Copy destination/same-node move/split/join remain unverified. Registered save/open/recovery deviations preserved. Six static gates first;one sequential absent build/app/inventory/scripts/Chromium with finally restoration and100%four-metric app/inventory coverage;failed-only recovery;restored source audits/scope/hash/AP sourcefree/doctor/routing/exact-SHA same-actor quality,CODERverify/finish,parent active.

## Verify Steps

1. Inspect pinned ndtxt.cxx Update/default InsertText/EraseText,thints.cxx MergePortions/TryInsertNesting and txtatr2.cxx INET flags. Record only prose/hashes,no source/helper/native execution. Expected equal adjacent INET remain distinct and ordinary insertion/erasure preserve actual continuous attribute identity/flags and map ownership with native bounded geometry.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. No present-profile duplicate/no concurrent audits;recover failed cases/gates only.
4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
5. Exact eight-path scope audit;one existing Count/comment correction,all342otherprevious tests byte-identical;234 existing runtime rows identical except two bounded justification appendices,one new unverified native helper row/mapping;native hashes and sourcefree ignored-inclusive AP scan. ap doctor and node .agentplane/policy/check-routing.mjs pass without new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass;CODER verify/finish with separate hashes;clean main/vendor restored,parent active. No broad native/UI status/default/exception or registered I/O/recovery promotion.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this leaf's semantic commit via a new authorized follow-up task;do not rewrite history or mutate DONE artifacts.

## Findings

Iteration122 excludes INET54 from adjacent value merging per native MergePortions and updates ordinary insert/pure-erase coordinates on actual owned attributes per SwTextNode::Update/default InsertText. Source-owned ndtxt-hint-update decomposition preserves existing1000-line gates. Supported positive/negative ranges,paragraph-start DontExpandStart,end DontExpand reset,INET-first end suppression/AUTO fresh collector and ignored DontMoveAttr match the bounded native non-overlapping AUTO/INET slice. Continuous links keep item/object/map identity;equal adjacent links remain distinct through construction/copy/cut/transfer/history/graph16,even after deleting a gap.322 new literal cases cover both families,eight flags,all boundary relations and mixed end flags. One old hyperlink Count/comment expectation corrects2 to3;342 other prior tests stay byte-identical. Explicit formatted insertion/fragment/undo adapters retain their existing contracts.234 existing runtime rows retain statuses/defaults/exceptions except two bounded appendices;one new extracted native helper remains unverified. Native empty-hint retention,full Insert modes/ignore-expand locks/families/BuildPortions/nesting,explicit replacement/copy destination/same-node move/split/join/refcounts/destruction/listeners and broad core/UI parity remain unverified. Registered save/open/recovery deviations preserved;no module/goal promotion. Preflight clean main/base 71c77715e7ebe6a93e00468ffc92f90586065cfd;safe goal-local scope. Earlier formatted patch context mismatch recomputed route and repaired only intended new test fields;one mistaken read-only full git tree output truncated,then an inline bounded counter established343 prior tests,one corrected and342 byte-identical required. Plan count corrected clerically before verification. Native3 full-file hashes pending;no upstream execution or AP helper/source files. No tests/build run yet.
