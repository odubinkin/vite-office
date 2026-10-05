---
id: "202610050332-5PGZMT"
title: "Restore native paragraph character conversion and join history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T03:33:57.916Z"
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
    body: "Start: restore the approved registered native character conversion and boundary format/text/collection history prerequisite, with one upstream-absent profile and failed-only repeats; broader structural selection remains unverified."
events:
  -
    type: "status"
    at: "2026-10-05T03:33:58.348Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the approved registered native character conversion and boundary format/text/collection history prerequisite, with one upstream-absent profile and failed-only repeats; broader structural selection remains unverified."
doc_version: 3
doc_updated_at: "2026-10-05T04:02:51.395Z"
doc_updated_by: "CODER"
description: "Iteration136: prerequisite for cross-node selected deletion. Port the registered AUTO/INET FormatToTextAttr conversion and AUTO MergePortions, wire native join character-item preparation, and restore changed boundary attributes through native format/text/collection history. Preserve registered I/O deviations; one upstream-absent profile only."
sections:
  Summary: "Restore native paragraph character conversion and join history."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/thints.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/undo/rolbck.ts
    - apps/office/src/sw/source/core/undo/undel.ts
    - apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
    - apps/office/src/sw/source/core/txtnode/native-format-to-text.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
  Plan: "Port native SwTextNode FormatToTextAttr and impl_FormatToTextAttr for registered character items and actual AUTO/INET maps: five direct-item pair combinations, duplicate clearing, item-span gap collection, existing AUTO values overriding converted node items, MakeTextAttr insertion, native AUTO portion merging and format-ignore normalization, then direct node item clearing. Add source-owned node/map wrappers and existing thints helpers only, no new implementation module. MergePortions supports registered AUTO values/no CHARFMT or unregistered RSID; full other-family/RSID/history/layout responsibilities remain unverified. Wire existing JoinTextNodes preparation to native docedt nonempty-leading FormatToTextAttr and empty-leading clear/copy character-only policy. Capture both boundary whole-node hint/direct-item/collection history in SwUndoJoinParagraphs before mutation; Undo restores native fresh hints through existing SwHistory, restores node direct items and live collection identity; redo resets temporary end. Add native SwHistorySetFormat, SwHistoryChangeFormatColl and CopyFormatAttr/AddColl for registered text content; SetFormat non-temp release and live collection checks follow source. Existing join retained node identity/AppendTextNode cloning, cross-node selection structural adapter/survivor choice/force propagation remain unverified and are the next dependent work, not declared finished. Preserve all existing semantic states/defaults/exceptions and registered I/O/recovery deviations; bounded appendices/helper mappings only,no promotion. Independent actual-owner literal five-pair/item/empty/spans/merge/flags/INET ownership/history/join UndoRedo tests, prior test files byte-identical unless exact first-profile failure is source-contradicted and corrected only there. Six static gates first; one sequential full absent build/app/inventory/scripts/Chromium with immediate exact-failed-name capture and finally restore. Repeat only failed gates/cases, zero passing replays; five source audits after restoration; scope/nativehash/exact SHA same-actor read-only quality/doctor/routing/CODER verify/canonical finish. English bounded prose/counts/hashes only in Agentplane; no source/helpers/Python/rawdiagnostics/network/outside/globalaccess."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Audit all prior tests/runtime rows, native source hashes and exact semantic SHA. One absent full profile; failed-only repeats; restore before source/scope/Agentplane audits.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: |-
    Iteration136 restores registered direct character FormatToTextAttr: five source/main SET pairs,duplicate clearing,AUTO span/gap conversion with old ranged items winning,MakeTextAttr insertion and adjacent equal pooled AUTO merging/FormatIgnore normalization. INET and zero portions retain owners;inherited collections and paragraph items are not converted. JoinTextNodes now applies nonempty-leading conversion or empty-leading character-only clear/copy. SwHistorySetFormat clones explicit items and releases destructive rollback;SwHistoryChangeFormatColl checks live text collection pointer/type. Join history records both boundaries' hints/direct items/collections;undo reconstructs fresh native hints,redo resets temporary end. This supersedes earlier absent format/coll conversion claims only for registered text/AUTO/INET paths. Undo clears only mutated character items before direct-item history rather than resetting unrelated paragraph items. Live assigned heading collection restoration uses native default SetListLevel=true and can add direct level0 even for the same collection. Two exact first-profile source-contradicted old expectations are corrected: fresh INET history owner and heading direct level0;all other old test cases are untouched. Full unpooled equal-value AUTO/CHARFMT/RSID/overlapping-family/notification/lifetime/layout history,table format variants,retained structural identity/AppendTextNode cloning,and cross-node selected deletion survivor/force/adapter remain unverified and require dependent work. Existing semantic states/defaults/exceptions and registered I/O/recovery deviations unchanged;whole-module and overall parity unverified,no promotion.

    Verification136: six static gates passed after only failed lint/typecheck correction; no passing static suite reruns, changed-file formatting/lint passes. One sequential full absent profile: build pass;app11070pass/3fail of11073 in280files with99.97%lines/statements/branches and100%functions;inventory109/36files/100%allfour,scripts5,Chromium99 first pass. Only three exact original failed names repeated, two passed/one undobj failed. Collector incorrectly classified skipped status as pending and asserted before result persistence; bounded outcomes recovered from Vitest per-file cache for three anchored selected names,bytes/hash unavailable; no passing case repeated for recovery. Sole undobj failed case reselected for diagnostic and fix;new coalescing case selected once alongside that still-failed case. New case passed. Native collection ChgFormatColl defaults SetListLevel=true even sameheading;old snapshot expectation corrected to include84=0. Sole remainingfailedcase finalpass1/15skip. Total52newindependentcases,all3originalfailuresclosed,zero passingcase/suite/buildreplays. Full first coverage residuals3merge lines/statements andtrue mergebranch are necessarily executed by passed real coalescing case;redundant unreachableAUTO-only Count else removed. CurrentUndocharacterreset instrumented in finalisolatedcase. Cumulativecoverageclosure audit pass,firstfullmeasured99.97 preserved,no fullpostfixV8report claimed;isolated zero thresholds diagnosticonly,repository100%config unchanged. Five restoredsource audits passed/0semanticviolations. 362priorfiles:360byte-identical;onlyone exact failedcase in each two oldfiles updated to sourcecontradicted freshINETowner/headinglevel0,allothercasesbyte-identical. 243runtime rows/states/defaults/exceptions retained;12boundedappendices and append-onlynativehelpermappings. Onlypostprofile production changes remove unreachablecondition/clear onlymutatedcharacter range;docnote refined,nootherproductionpostprofile edits. Five nativehashes. Doctor0errors/two unchangedlegacywarnings,routingpass;ignoredinclusiveAgentplane3962files0forbidden. Same-actor exactSHAreadonlyquality pending;noindependentreview claim. Cross-node survivor/force/structural deletion and fullhistory/layout/core/UI parity remainunverified;goalactive.
id_source: "generated"
---
## Summary

Restore native paragraph character conversion and join history.

## Scope

- apps/office/src/sw/source/core/txtnode/thints.ts
- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/undo/rolbck.ts
- apps/office/src/sw/source/core/undo/undel.ts
- apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
- apps/office/src/sw/source/core/txtnode/native-format-to-text.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts

## Plan

Port native SwTextNode FormatToTextAttr and impl_FormatToTextAttr for registered character items and actual AUTO/INET maps: five direct-item pair combinations, duplicate clearing, item-span gap collection, existing AUTO values overriding converted node items, MakeTextAttr insertion, native AUTO portion merging and format-ignore normalization, then direct node item clearing. Add source-owned node/map wrappers and existing thints helpers only, no new implementation module. MergePortions supports registered AUTO values/no CHARFMT or unregistered RSID; full other-family/RSID/history/layout responsibilities remain unverified. Wire existing JoinTextNodes preparation to native docedt nonempty-leading FormatToTextAttr and empty-leading clear/copy character-only policy. Capture both boundary whole-node hint/direct-item/collection history in SwUndoJoinParagraphs before mutation; Undo restores native fresh hints through existing SwHistory, restores node direct items and live collection identity; redo resets temporary end. Add native SwHistorySetFormat, SwHistoryChangeFormatColl and CopyFormatAttr/AddColl for registered text content; SetFormat non-temp release and live collection checks follow source. Existing join retained node identity/AppendTextNode cloning, cross-node selection structural adapter/survivor choice/force propagation remain unverified and are the next dependent work, not declared finished. Preserve all existing semantic states/defaults/exceptions and registered I/O/recovery deviations; bounded appendices/helper mappings only,no promotion. Independent actual-owner literal five-pair/item/empty/spans/merge/flags/INET ownership/history/join UndoRedo tests, prior test files byte-identical unless exact first-profile failure is source-contradicted and corrected only there. Six static gates first; one sequential full absent build/app/inventory/scripts/Chromium with immediate exact-failed-name capture and finally restore. Repeat only failed gates/cases, zero passing replays; five source audits after restoration; scope/nativehash/exact SHA same-actor read-only quality/doctor/routing/CODER verify/canonical finish. English bounded prose/counts/hashes only in Agentplane; no source/helpers/Python/rawdiagnostics/network/outside/globalaccess.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Audit all prior tests/runtime rows, native source hashes and exact semantic SHA. One absent full profile; failed-only repeats; restore before source/scope/Agentplane audits.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Iteration136 restores registered direct character FormatToTextAttr: five source/main SET pairs,duplicate clearing,AUTO span/gap conversion with old ranged items winning,MakeTextAttr insertion and adjacent equal pooled AUTO merging/FormatIgnore normalization. INET and zero portions retain owners;inherited collections and paragraph items are not converted. JoinTextNodes now applies nonempty-leading conversion or empty-leading character-only clear/copy. SwHistorySetFormat clones explicit items and releases destructive rollback;SwHistoryChangeFormatColl checks live text collection pointer/type. Join history records both boundaries' hints/direct items/collections;undo reconstructs fresh native hints,redo resets temporary end. This supersedes earlier absent format/coll conversion claims only for registered text/AUTO/INET paths. Undo clears only mutated character items before direct-item history rather than resetting unrelated paragraph items. Live assigned heading collection restoration uses native default SetListLevel=true and can add direct level0 even for the same collection. Two exact first-profile source-contradicted old expectations are corrected: fresh INET history owner and heading direct level0;all other old test cases are untouched. Full unpooled equal-value AUTO/CHARFMT/RSID/overlapping-family/notification/lifetime/layout history,table format variants,retained structural identity/AppendTextNode cloning,and cross-node selected deletion survivor/force/adapter remain unverified and require dependent work. Existing semantic states/defaults/exceptions and registered I/O/recovery deviations unchanged;whole-module and overall parity unverified,no promotion.

Verification136: six static gates passed after only failed lint/typecheck correction; no passing static suite reruns, changed-file formatting/lint passes. One sequential full absent profile: build pass;app11070pass/3fail of11073 in280files with99.97%lines/statements/branches and100%functions;inventory109/36files/100%allfour,scripts5,Chromium99 first pass. Only three exact original failed names repeated, two passed/one undobj failed. Collector incorrectly classified skipped status as pending and asserted before result persistence; bounded outcomes recovered from Vitest per-file cache for three anchored selected names,bytes/hash unavailable; no passing case repeated for recovery. Sole undobj failed case reselected for diagnostic and fix;new coalescing case selected once alongside that still-failed case. New case passed. Native collection ChgFormatColl defaults SetListLevel=true even sameheading;old snapshot expectation corrected to include84=0. Sole remainingfailedcase finalpass1/15skip. Total52newindependentcases,all3originalfailuresclosed,zero passingcase/suite/buildreplays. Full first coverage residuals3merge lines/statements andtrue mergebranch are necessarily executed by passed real coalescing case;redundant unreachableAUTO-only Count else removed. CurrentUndocharacterreset instrumented in finalisolatedcase. Cumulativecoverageclosure audit pass,firstfullmeasured99.97 preserved,no fullpostfixV8report claimed;isolated zero thresholds diagnosticonly,repository100%config unchanged. Five restoredsource audits passed/0semanticviolations. 362priorfiles:360byte-identical;onlyone exact failedcase in each two oldfiles updated to sourcecontradicted freshINETowner/headinglevel0,allothercasesbyte-identical. 243runtime rows/states/defaults/exceptions retained;12boundedappendices and append-onlynativehelpermappings. Onlypostprofile production changes remove unreachablecondition/clear onlymutatedcharacter range;docnote refined,nootherproductionpostprofile edits. Five nativehashes. Doctor0errors/two unchangedlegacywarnings,routingpass;ignoredinclusiveAgentplane3962files0forbidden. Same-actor exactSHAreadonlyquality pending;noindependentreview claim. Cross-node survivor/force/structural deletion and fullhistory/layout/core/UI parity remainunverified;goalactive.
