---
id: "202610042109-62D8VS"
title: "Preserve native hyperlink text boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 22
origin:
  system: "manual"
depends_on:
  - "202610042048-H70ZBQ"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T21:24:37.142Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T21:30:46.335Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact-SHA review passes approved native hyperlink text-boundary scope at e1f17e8baeb84696ff00cd83ae57a237cd5753be."
  evaluated_sha: "e1f17e8baeb84696ff00cd83ae57a237cd5753be"
  blueprint_digest: "695974f4389e9e98f530d89c161692fae3d1f2fea32bbd01e3b8337c89f5d93d"
  evidence_refs:
    - ".agentplane/tasks/202610042109-62D8VS/README.md"
    - ".agentplane/tasks/202610042109-62D8VS/quality/20261004-213046335-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042109-62D8VS/quality/20261004-213046335-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042109-62D8VS/quality/20261004-213046335-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042109-62D8VS/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/static-gates.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/focused-static-final.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/focused-case-corrections.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/absent-profile.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/failed-cases-recovery.json"
    - ".agentplane/tasks/202610042109-62D8VS/evidence/restored-source-audits.json"
    - "Read-only exact-SHA semantic bytes/scope/native hash/coverage/recovery audit at e1f17e8baeb84696ff00cd83ae57a237cd5753be"
  findings:
    - "Nine exact semantic paths;native MergePortions excludes INET. Actual supported non-overlapping AUTO/INET coordinates now update in place for ordinary insertion/pure erasure;paragraph-start and end flags/cross-family collectors match inspected native branches.322 literal cases check independent geometry/metadata and actual item/map/index/history ownership. Two old native-invalid INET assertions corrected;341other prior tests byte-identical."
    - "Six static gates pass after type-fixture recovery;one absent build/app first run2597pass/2fail with100%four-metric coverage and only2failed cases recovered367skipped. Production hashes match through recovery/exact SHA;no passing full suite/build repeated. Inventory109/scripts5/Chromium99 pass once absent,inventory100%coverage. Five restored audits pass after metadata-only filename split correction;semantic0/APforbidden0/doctor0errors/routingpass."
    - "234existing runtime rows retain all fields/defaults/statuses/exceptions except two bounded justification appendices;one new extracted native helper stays unverified. Provenance has two appendices,one helper mapping and a responsibility-split filename rationale.3native hashes match. Registered I/O/recovery deviations unchanged."
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
doc_updated_at: "2026-10-04T21:28:51.841Z"
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
    apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
  Plan: "Preserve separate adjacent INET54 ranges while retaining existing AUTO53 adjacent normalization,per native MergePortions exclusion. Replace ordinary insertion and pure erasure splitting/value-remerge with actual owned start/end changes per SwTextNode::Update and default InsertText paragraph-start adjustment. Extract bounded coordinate logic to ndtxt-hint-update.ts to keep existing mandatory1000-line limits;source-owned UpdateTextHints covers positive/negative offsets,endpoint DontExpand reset,cross-family INET suppression/AUTO collector and paragraph-start DontExpandStart,ignores DontMoveAttr as native Update does. Ordinary node calls use the actual owned container;zero insertion/no-op retains state;explicit character/link formatting preserves existing fragment adapter. Pure empty ReplaceRange uses native negative updates. Literal matrices inspect actual item/object/map identity,optional flags,equal/different adjacent links,interior/start/end/outside/paragraph-start offsets,two consecutive edits,disconnected caller/history/copy/transfer/codec and undo. Correct prior writer-model hyperlink Count/comment from2 to3 and retained-source INET cut Count/end literals from1/6 to2/3;all341 other prior tests byte-identical. First full absent app run2597pass/2fail with100%coverage;recover only these2cases after correcting an invalid new fixture order and the old native-invalid merge expectation,without production change or full suite/build replay. Add one unverified native responsibility row/provenance mapping for extracted helper,append bounded explanations to ndhints/ndtxt records,leave all existing fields/status/defaults/exceptions unchanged except approved appendices. Native complete zero-width hints/modes/ignoreExpand locks/families/nesting/refcounts/listeners/Copy destination/same-node move/split/join remain unverified. Registered save/open/recovery deviations preserved. Six static gates first;one sequential absent build/app/inventory/scripts/Chromium with finally restoration and100%four-metric app/inventory coverage;failed-only recovery;restored source audits/scope/hash/AP sourcefree/doctor/routing/exact-SHA same-actor quality,CODERverify/finish,parent active."
  Verify Steps: |-
    1. Inspect pinned ndtxt.cxx Update/default InsertText/EraseText,thints.cxx MergePortions/TryInsertNesting and txtatr2.cxx INET flags. Record only prose/hashes,no source/helper/native execution. Expected equal adjacent INET remain distinct and ordinary insertion/erasure preserve actual continuous attribute identity/flags and map ownership with native bounded geometry.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. No present-profile duplicate/no concurrent audits;recover failed cases/gates only.
    4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
    5. Exact nine-path scope audit;two existing Count/comment/end corrections,all341otherprevious tests byte-identical;234 existing runtime rows identical except two bounded justification appendices,one new unverified native helper row/mapping;native hashes and sourcefree ignored-inclusive AP scan. ap doctor and node .agentplane/policy/check-routing.mjs pass without new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass;CODER verify/finish with separate hashes;clean main/vendor restored,parent active. No broad native/UI status/default/exception or registered I/O/recovery promotion.
  Verification: "Iteration122 restores separate adjacent INET54 ranges and native owned boundary changes for ordinary insertion/pure erasure.322 new literal cases exercise two families/eight flags,all start/interior/end/outside/paragraph-start relations,mixed same-end DontExpand behavior,actual item/object/three-map/content-index ownership,caller/history/copy/cut/transfer/graph16/undo independence. Exactly nine semantic paths;2old tests corrected only native-invalid INET count/end/comment expectations,341other343prior tests byte-identical.234 existing runtime fields/statuses/defaults/exceptions unchanged except two justification appendices;one new source-owned helper remains unverified;provenance2appendices/1helpermapping/1filename-split record;3native hashes match. Six static gates pass after one new-fixture generic type correction;focused lint/type checks cover later added direct-adapter assertion,test-only corrections focusedlint. One absent build/app profile:2597pass/2fail with100%four-metric coverage,only2failedcases recovered367skipped;production hashes unchanged,no full app/build replay. Inventory109/36/scripts5/2/Chromium99 pass once absent,inventory100%fourmetrics. Vendor restored before5source audits;provenance filename-split omission corrected metadata-only and only failed provenance audit rerun. Semantic violations0,APignored-inclusive forbidden0,doctor0errors/two unchangedwarnings,routingpass. Exact-SHA same-actor read-only quality pending. Full zero-width attribute retention/Insert modes/ignore-expand locks/families/BuildPortions/nesting/native hierarchy/refcounts/client/listeners and explicit replacement/copy destination/same-node move/split/join remain unverified;registered save/open/recovery deviations untouched;parent goal active."
  Rollback Plan: "Revert only this leaf's semantic commit via a new authorized follow-up task;do not rewrite history or mutate DONE artifacts."
  Findings: "Iteration122 restores separate adjacent INET54 ranges and native owned boundary changes for ordinary insertion/pure erasure.322 new literal cases exercise two families/eight flags,all start/interior/end/outside/paragraph-start relations,mixed same-end DontExpand behavior,actual item/object/three-map/content-index ownership,caller/history/copy/cut/transfer/graph16/undo independence. Exactly nine semantic paths;2old tests corrected only native-invalid INET count/end/comment expectations,341other343prior tests byte-identical.234 existing runtime fields/statuses/defaults/exceptions unchanged except two justification appendices;one new source-owned helper remains unverified;provenance2appendices/1helpermapping/1filename-split record;3native hashes match. Six static gates pass after one new-fixture generic type correction;focused lint/type checks cover later added direct-adapter assertion,test-only corrections focusedlint. One absent build/app profile:2597pass/2fail with100%four-metric coverage,only2failedcases recovered367skipped;production hashes unchanged,no full app/build replay. Inventory109/36/scripts5/2/Chromium99 pass once absent,inventory100%fourmetrics. Vendor restored before5source audits;provenance filename-split omission corrected metadata-only and only failed provenance audit rerun. Semantic violations0,APignored-inclusive forbidden0,doctor0errors/two unchangedwarnings,routingpass. Exact-SHA same-actor read-only quality pending. Full zero-width attribute retention/Insert modes/ignore-expand locks/families/BuildPortions/nesting/native hierarchy/refcounts/client/listeners and explicit replacement/copy destination/same-node move/split/join remain unverified;registered save/open/recovery deviations untouched;parent goal active."
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
apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts

## Plan

Preserve separate adjacent INET54 ranges while retaining existing AUTO53 adjacent normalization,per native MergePortions exclusion. Replace ordinary insertion and pure erasure splitting/value-remerge with actual owned start/end changes per SwTextNode::Update and default InsertText paragraph-start adjustment. Extract bounded coordinate logic to ndtxt-hint-update.ts to keep existing mandatory1000-line limits;source-owned UpdateTextHints covers positive/negative offsets,endpoint DontExpand reset,cross-family INET suppression/AUTO collector and paragraph-start DontExpandStart,ignores DontMoveAttr as native Update does. Ordinary node calls use the actual owned container;zero insertion/no-op retains state;explicit character/link formatting preserves existing fragment adapter. Pure empty ReplaceRange uses native negative updates. Literal matrices inspect actual item/object/map identity,optional flags,equal/different adjacent links,interior/start/end/outside/paragraph-start offsets,two consecutive edits,disconnected caller/history/copy/transfer/codec and undo. Correct prior writer-model hyperlink Count/comment from2 to3 and retained-source INET cut Count/end literals from1/6 to2/3;all341 other prior tests byte-identical. First full absent app run2597pass/2fail with100%coverage;recover only these2cases after correcting an invalid new fixture order and the old native-invalid merge expectation,without production change or full suite/build replay. Add one unverified native responsibility row/provenance mapping for extracted helper,append bounded explanations to ndhints/ndtxt records,leave all existing fields/status/defaults/exceptions unchanged except approved appendices. Native complete zero-width hints/modes/ignoreExpand locks/families/nesting/refcounts/listeners/Copy destination/same-node move/split/join remain unverified. Registered save/open/recovery deviations preserved. Six static gates first;one sequential absent build/app/inventory/scripts/Chromium with finally restoration and100%four-metric app/inventory coverage;failed-only recovery;restored source audits/scope/hash/AP sourcefree/doctor/routing/exact-SHA same-actor quality,CODERverify/finish,parent active.

## Verify Steps

1. Inspect pinned ndtxt.cxx Update/default InsertText/EraseText,thints.cxx MergePortions/TryInsertNesting and txtatr2.cxx INET flags. Record only prose/hashes,no source/helper/native execution. Expected equal adjacent INET remain distinct and ordinary insertion/erasure preserve actual continuous attribute identity/flags and map ownership with native bounded geometry.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. No present-profile duplicate/no concurrent audits;recover failed cases/gates only.
4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
5. Exact nine-path scope audit;two existing Count/comment/end corrections,all341otherprevious tests byte-identical;234 existing runtime rows identical except two bounded justification appendices,one new unverified native helper row/mapping;native hashes and sourcefree ignored-inclusive AP scan. ap doctor and node .agentplane/policy/check-routing.mjs pass without new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass;CODER verify/finish with separate hashes;clean main/vendor restored,parent active. No broad native/UI status/default/exception or registered I/O/recovery promotion.

## Verification

Iteration122 restores separate adjacent INET54 ranges and native owned boundary changes for ordinary insertion/pure erasure.322 new literal cases exercise two families/eight flags,all start/interior/end/outside/paragraph-start relations,mixed same-end DontExpand behavior,actual item/object/three-map/content-index ownership,caller/history/copy/cut/transfer/graph16/undo independence. Exactly nine semantic paths;2old tests corrected only native-invalid INET count/end/comment expectations,341other343prior tests byte-identical.234 existing runtime fields/statuses/defaults/exceptions unchanged except two justification appendices;one new source-owned helper remains unverified;provenance2appendices/1helpermapping/1filename-split record;3native hashes match. Six static gates pass after one new-fixture generic type correction;focused lint/type checks cover later added direct-adapter assertion,test-only corrections focusedlint. One absent build/app profile:2597pass/2fail with100%four-metric coverage,only2failedcases recovered367skipped;production hashes unchanged,no full app/build replay. Inventory109/36/scripts5/2/Chromium99 pass once absent,inventory100%fourmetrics. Vendor restored before5source audits;provenance filename-split omission corrected metadata-only and only failed provenance audit rerun. Semantic violations0,APignored-inclusive forbidden0,doctor0errors/two unchangedwarnings,routingpass. Exact-SHA same-actor read-only quality pending. Full zero-width attribute retention/Insert modes/ignore-expand locks/families/BuildPortions/nesting/native hierarchy/refcounts/client/listeners and explicit replacement/copy destination/same-node move/split/join remain unverified;registered save/open/recovery deviations untouched;parent goal active.

## Rollback Plan

Revert only this leaf's semantic commit via a new authorized follow-up task;do not rewrite history or mutate DONE artifacts.

## Findings

Iteration122 restores separate adjacent INET54 ranges and native owned boundary changes for ordinary insertion/pure erasure.322 new literal cases exercise two families/eight flags,all start/interior/end/outside/paragraph-start relations,mixed same-end DontExpand behavior,actual item/object/three-map/content-index ownership,caller/history/copy/cut/transfer/graph16/undo independence. Exactly nine semantic paths;2old tests corrected only native-invalid INET count/end/comment expectations,341other343prior tests byte-identical.234 existing runtime fields/statuses/defaults/exceptions unchanged except two justification appendices;one new source-owned helper remains unverified;provenance2appendices/1helpermapping/1filename-split record;3native hashes match. Six static gates pass after one new-fixture generic type correction;focused lint/type checks cover later added direct-adapter assertion,test-only corrections focusedlint. One absent build/app profile:2597pass/2fail with100%four-metric coverage,only2failedcases recovered367skipped;production hashes unchanged,no full app/build replay. Inventory109/36/scripts5/2/Chromium99 pass once absent,inventory100%fourmetrics. Vendor restored before5source audits;provenance filename-split omission corrected metadata-only and only failed provenance audit rerun. Semantic violations0,APignored-inclusive forbidden0,doctor0errors/two unchangedwarnings,routingpass. Exact-SHA same-actor read-only quality pending. Full zero-width attribute retention/Insert modes/ignore-expand locks/families/BuildPortions/nesting/native hierarchy/refcounts/client/listeners and explicit replacement/copy destination/same-node move/split/join remain unverified;registered save/open/recovery deviations untouched;parent goal active.
