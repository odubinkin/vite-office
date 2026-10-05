---
id: "202610050332-5PGZMT"
title: "Restore native paragraph character conversion and join history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-10-05T03:33:58.348Z"
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
  Findings: "Preflight136 clean main 2765ad570a14f9d756ab57449476ffd2f3aed832, direct, onlyparentactive;135verifiedprogress,DONE. Four matched policies loaded,user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native docedt.cxx329 chooses JoinPrev when startoffset0 and end leaves suffix,otherwise JoinNext; currentcrossadapter always keeps firstnode and has multiple fragment actions. Native docedt.cxx463 prepares character attrs with FormatToTextAttr or empty-leader reset/copy. thints.cxx2491 impl converts direct character items across AUTO spans/gaps,existing AUTO wins,MakeTextAttr actualmaps,MergePortions normalization then clearsconverted directitems.2569 five direct-item pair cases.2742 MergePortions preserves first matchingportion,deletes second and normalizesFormatIgnore for actual AUTO;INET notmerged. undel.cxx455 copies both boundary wholehints/directattrs and addslivecollections;rolbck.cxx78/165 clonedSETformat andnonTmprelease,569/578 livecollection pointer,typecheck,1303 directformatcopy. Current join bypasses conversion and Undo retains snapshots rather than fresh hint history. This leaf is the necessary registered character/history prerequisite before native cross-node structural deletion. Node992/map975lines allow small wrappers; no unrelated policy or new helpermodule."
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

Preflight136 clean main 2765ad570a14f9d756ab57449476ffd2f3aed832, direct, onlyparentactive;135verifiedprogress,DONE. Four matched policies loaded,user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native docedt.cxx329 chooses JoinPrev when startoffset0 and end leaves suffix,otherwise JoinNext; currentcrossadapter always keeps firstnode and has multiple fragment actions. Native docedt.cxx463 prepares character attrs with FormatToTextAttr or empty-leader reset/copy. thints.cxx2491 impl converts direct character items across AUTO spans/gaps,existing AUTO wins,MakeTextAttr actualmaps,MergePortions normalization then clearsconverted directitems.2569 five direct-item pair cases.2742 MergePortions preserves first matchingportion,deletes second and normalizesFormatIgnore for actual AUTO;INET notmerged. undel.cxx455 copies both boundary wholehints/directattrs and addslivecollections;rolbck.cxx78/165 clonedSETformat andnonTmprelease,569/578 livecollection pointer,typecheck,1303 directformatcopy. Current join bypasses conversion and Undo retains snapshots rather than fresh hint history. This leaf is the necessary registered character/history prerequisite before native cross-node structural deletion. Node992/map975lines allow small wrappers; no unrelated policy or new helpermodule.
