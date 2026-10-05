---
id: "202610052113-W6AAHH"
title: "Render Writer text from native attribute iteration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T21:31:44.884Z"
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
    body: "Start: Implement the approved native attribute iteration leaf under standing explicit user authorization; source-confirmed overlap/UI filter adapter only, registered IO deviations unchanged."
events:
  -
    type: "status"
    at: "2026-10-05T21:14:30.416Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved native attribute iteration leaf under standing explicit user authorization; source-confirmed overlap/UI filter adapter only, registered IO deviations unchanged."
doc_version: 3
doc_updated_at: "2026-10-05T21:31:43.666Z"
doc_updated_by: "CODER"
description: "Iteration165 removes the browser dependency on filter TextRuns by representing native SwAttrIter/SwAttrHandler ownership and direct effective item projection; fixes overlapping automatic formatting and preserves body/cell editing/history without changing registered IO deviations."
sections:
  Summary: "Replace browser filter-run formatting with native attribute iteration and correct overlapping automatic item composition."
  Scope: |-
    apps/office/src/sw/source/core/text/atrstck.ts
    apps/office/src/sw/source/core/text/itratr.ts
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    apps/office/src/sw/source/core/text/native-attribute-iteration.test.ts
    apps/office/src/sw/browser/presentation/native-attribute-portions.test.tsx
    apps/office/e2e/writer-native-attribute-portions.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    docs/program/parity/writer-command-slice.json
  Plan: "Iteration165 continues standing explicitly authorized iterative existing-functionality core/UI/refactor goal; one CODER leaf on direct main. Replace browser view projection's filter TextRuns conversion with actual native SwAttrIter/SwAttrHandler responsibility owners in matching sw/source/core/text/itratr.ts and atrstck.ts. Native start/end cursors/defaults, reset/backward Seek, end-before-start SeekFwd, format-ignore boundary admission and per-character-item automatic attribute stacks with priority push/identity pop/default fallback; no first-covering auto-format choice. Borrow actual pooled SfxPoolItems and inherited node/style defaults; expose explicitly bounded item read accessor rather than fabricate full SwFont/device engine. Existing INET node query gives native hyperlink identity; missing native INET style/visited-color/font/device/script/redline/field/merged paragraph/paragraph mark effects remain unverified. Browser retains frozen primitive presentation records and existing field shape for compatibility, but neither inherits filter WriterTextRun nor imports projectWriterTextRuns/WriterCharacterAttributes; direct iterator item reads resolve supported Western formatting and physical/generic font family. Shared body/cell/measurement renderer consumes browser primitive type and retains stable view IDs, editing host/history/native ranges. No new transport/schema/model backdoor or renamed filter adapter. Real-owner literal overlapping disjoint Which items, equal-start order, priority/default restoration, forward/backward/repeat/end/empty/zero/ignore boundaries, direct/inherited fonts/generic metadata, table ownership and actual session/DOM/history/native copying/codec/reopen as supported; production Chromium locally generated ODT body/cell formatting/editing/history/selection checks.9scopepaths4productionowners including2new partial native owners.423 prior testfiles all byte-identical;251 existing runtime semantic states/defaults/classes/IO exceptions/evidence preserved,add2unverified modules=253. Native full font/field/script/merged/redline/INETstyle and overall table/list/UI parity remain unverified. Conscious save/open/recovery deviations unchanged. Six initial statics then ONE upstream-absent build/app/inventory/scripts/Chromium via in-repo vendor rename try/finallyrestore; onlyoriginalfailed/genuinelynew cases orfailed/changedfilegates afterwards,no passing/fullprofile replay; actual app/inventory100%L/S/F/B. Persist exactfailures/errors/counts/hashsbeforeassertions,skipped=skipped. Five restored sourceaudits, exact scope/prior-test/metadata/sourcehash/APignoredinclusive/doctor/routing; sameagent explicitEVALUATOR exactsemanticSHApass,verify/canonicalmeaningfulfinish,wholeparentFindingsappend cleanmain. AP bounded English prose/counts/hashes/outcomes/exactfailednames only;no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. No network/outside/global/subagents. Previous164verifiedprogress,parentDOING/goalACTIVE. Source-confirmed verification remediation: update only two stale WriterTextRunProjection markers in writer-command-slice.json to actual renamed browser primitive renderer,10scopepaths with zero semantic status/default changes. Raw overlapping AUTO stacks remain traversal/display inputs; existing Worker/history requires normalized nonoverlapping AUTO maps and rejects raw overlap. Preserve all four raw overlap display/frozen-value assertions and assert retained Worker refusal; add actual canonical native body/cell Worker/copy/history cases with disjoint independently specified native items,not invented normalization. Browser fixtures use existing supported SetAttrMode.NOHINTADJUST to construct canonical initial graph before ordinary production ODT Open. Product bytes remain unchanged after full profile; no new adapter/codec bypass/guard relaxation/full passing replay."
  Verify Steps: |-
    1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat onlyfailedgates or changed-file remediation.
    2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore; tests neverread/invoke/compileupstream. Exactfailure/errors/countshashspersistedbeforeassertions;skipped=skipped. Onlyoriginalfailed or genuinelynewunexecutedcases afterwards;no passing/fullprofile replay. Actual100%app/inventoryL/S/F/B with source/map identity-checked counters onlyignoredappcache.
    3. Native SwAttrIter start/end/position defaults/reset/backward/SeekFwd end-before-start and ignore-boundary semantics; SwAttrHandler per-item priority stacks/borrowed item identity/default inheritance rather than first covering hint. Actual overlapping/inherited/differentWhich/zero/empty/end/priority/tie/ignore/location cases and real body/cell shared DOM/session/history/Worker/ODT/browser checks. UI projection and renderer must have no filter WriterTextRun/projectWriterTextRuns import or type inheritance; bounded browser primitive DTO only.423 prior testfiles byte-identical;251 existing states/defaults/classes/IO exceptions/evidence preserved plus2partial unverified native owners=253modules;9semanticpaths4owners. Conscious save/open/recovery deviations unchanged,no full-native or broad paritypromotion.
    4. Afterrestore five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/sourcehash/APignoredinclusive/doctor/routing. Sameagent EVALUATOR exactSHApass, recordverify,canonicalmeaningfulfinish,wholeparentFindingsappend/cleantracked+untracked. Full native SwFont/device/scripts/redline/fields/merged paragraphs/INET styles/paragraph mark and broad core/UI/list/table parity remain unverified.
    5. Source-confirmed failed-only recovery: exactly two stale renderer markers updated in writer-command-slice.json (10th semantic path), all semantic statuses/defaults/justifications/evidence otherwise unchanged. Preserve raw overlapping AUTO display checks and existing Worker refusal; add genuinely new normalized native body/cell Worker/copy/editing/history cases. Repeat only original4failed app plus2new app, original1failed inventory and original2failed Chromium on unchanged once-built production bytes; app/inventory coverage maps identity-checked, no full/passing replay.
  Verification: "Pending actual deterministic profile and exact semantic-SHA review."
  Rollback Plan: "Revert only this leaf semantic commit; retain immutable completed task evidence and all prior parent findings."
  Findings: "ONE full upstream-absent profile terminal, vendor restored finally. Buildpass;12502app pass/4new raw-overlap copy cases fail, actual app100%L/S/F/B;108inventorypass/1failed stale renderer marker,5scriptspass;135oldChromiumpass/2new fixture construction failures. Exactnames/counts/errors/hashes persisted. Raw stack display assertions passed before unsupported Worker decode; existing copy/history contract rejects same-family overlap. Preserve display assertions and assert this refusal,add genuine canonical body/cell Worker/copy/history evidence. E2E initial native fixture InsertItem used DEFAULT adjustment which is unimplemented; use supported NOHINTADJUST rather than bypass runtime. Two writer-command-slice renderer marker references must follow real rename;10scopepaths and no semantic promotion. Product unchanged since full profile; only originalfailed/newcases rerun. Prior format/typecheck failures corrected within new interface/fixture public APIs; all statics pass."
id_source: "generated"
---
## Summary

Replace browser filter-run formatting with native attribute iteration and correct overlapping automatic item composition.

## Scope

apps/office/src/sw/source/core/text/atrstck.ts
apps/office/src/sw/source/core/text/itratr.ts
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
apps/office/src/sw/source/core/text/native-attribute-iteration.test.ts
apps/office/src/sw/browser/presentation/native-attribute-portions.test.tsx
apps/office/e2e/writer-native-attribute-portions.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
docs/program/parity/writer-command-slice.json

## Plan

Iteration165 continues standing explicitly authorized iterative existing-functionality core/UI/refactor goal; one CODER leaf on direct main. Replace browser view projection's filter TextRuns conversion with actual native SwAttrIter/SwAttrHandler responsibility owners in matching sw/source/core/text/itratr.ts and atrstck.ts. Native start/end cursors/defaults, reset/backward Seek, end-before-start SeekFwd, format-ignore boundary admission and per-character-item automatic attribute stacks with priority push/identity pop/default fallback; no first-covering auto-format choice. Borrow actual pooled SfxPoolItems and inherited node/style defaults; expose explicitly bounded item read accessor rather than fabricate full SwFont/device engine. Existing INET node query gives native hyperlink identity; missing native INET style/visited-color/font/device/script/redline/field/merged paragraph/paragraph mark effects remain unverified. Browser retains frozen primitive presentation records and existing field shape for compatibility, but neither inherits filter WriterTextRun nor imports projectWriterTextRuns/WriterCharacterAttributes; direct iterator item reads resolve supported Western formatting and physical/generic font family. Shared body/cell/measurement renderer consumes browser primitive type and retains stable view IDs, editing host/history/native ranges. No new transport/schema/model backdoor or renamed filter adapter. Real-owner literal overlapping disjoint Which items, equal-start order, priority/default restoration, forward/backward/repeat/end/empty/zero/ignore boundaries, direct/inherited fonts/generic metadata, table ownership and actual session/DOM/history/native copying/codec/reopen as supported; production Chromium locally generated ODT body/cell formatting/editing/history/selection checks.9scopepaths4productionowners including2new partial native owners.423 prior testfiles all byte-identical;251 existing runtime semantic states/defaults/classes/IO exceptions/evidence preserved,add2unverified modules=253. Native full font/field/script/merged/redline/INETstyle and overall table/list/UI parity remain unverified. Conscious save/open/recovery deviations unchanged. Six initial statics then ONE upstream-absent build/app/inventory/scripts/Chromium via in-repo vendor rename try/finallyrestore; onlyoriginalfailed/genuinelynew cases orfailed/changedfilegates afterwards,no passing/fullprofile replay; actual app/inventory100%L/S/F/B. Persist exactfailures/errors/counts/hashsbeforeassertions,skipped=skipped. Five restored sourceaudits, exact scope/prior-test/metadata/sourcehash/APignoredinclusive/doctor/routing; sameagent explicitEVALUATOR exactsemanticSHApass,verify/canonicalmeaningfulfinish,wholeparentFindingsappend cleanmain. AP bounded English prose/counts/hashes/outcomes/exactfailednames only;no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. No network/outside/global/subagents. Previous164verifiedprogress,parentDOING/goalACTIVE. Source-confirmed verification remediation: update only two stale WriterTextRunProjection markers in writer-command-slice.json to actual renamed browser primitive renderer,10scopepaths with zero semantic status/default changes. Raw overlapping AUTO stacks remain traversal/display inputs; existing Worker/history requires normalized nonoverlapping AUTO maps and rejects raw overlap. Preserve all four raw overlap display/frozen-value assertions and assert retained Worker refusal; add actual canonical native body/cell Worker/copy/history cases with disjoint independently specified native items,not invented normalization. Browser fixtures use existing supported SetAttrMode.NOHINTADJUST to construct canonical initial graph before ordinary production ODT Open. Product bytes remain unchanged after full profile; no new adapter/codec bypass/guard relaxation/full passing replay.

## Verify Steps

1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat onlyfailedgates or changed-file remediation.
2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore; tests neverread/invoke/compileupstream. Exactfailure/errors/countshashspersistedbeforeassertions;skipped=skipped. Onlyoriginalfailed or genuinelynewunexecutedcases afterwards;no passing/fullprofile replay. Actual100%app/inventoryL/S/F/B with source/map identity-checked counters onlyignoredappcache.
3. Native SwAttrIter start/end/position defaults/reset/backward/SeekFwd end-before-start and ignore-boundary semantics; SwAttrHandler per-item priority stacks/borrowed item identity/default inheritance rather than first covering hint. Actual overlapping/inherited/differentWhich/zero/empty/end/priority/tie/ignore/location cases and real body/cell shared DOM/session/history/Worker/ODT/browser checks. UI projection and renderer must have no filter WriterTextRun/projectWriterTextRuns import or type inheritance; bounded browser primitive DTO only.423 prior testfiles byte-identical;251 existing states/defaults/classes/IO exceptions/evidence preserved plus2partial unverified native owners=253modules;9semanticpaths4owners. Conscious save/open/recovery deviations unchanged,no full-native or broad paritypromotion.
4. Afterrestore five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/sourcehash/APignoredinclusive/doctor/routing. Sameagent EVALUATOR exactSHApass, recordverify,canonicalmeaningfulfinish,wholeparentFindingsappend/cleantracked+untracked. Full native SwFont/device/scripts/redline/fields/merged paragraphs/INET styles/paragraph mark and broad core/UI/list/table parity remain unverified.
5. Source-confirmed failed-only recovery: exactly two stale renderer markers updated in writer-command-slice.json (10th semantic path), all semantic statuses/defaults/justifications/evidence otherwise unchanged. Preserve raw overlapping AUTO display checks and existing Worker refusal; add genuinely new normalized native body/cell Worker/copy/editing/history cases. Repeat only original4failed app plus2new app, original1failed inventory and original2failed Chromium on unchanged once-built production bytes; app/inventory coverage maps identity-checked, no full/passing replay.

## Verification

Pending actual deterministic profile and exact semantic-SHA review.

## Rollback Plan

Revert only this leaf semantic commit; retain immutable completed task evidence and all prior parent findings.

## Findings

ONE full upstream-absent profile terminal, vendor restored finally. Buildpass;12502app pass/4new raw-overlap copy cases fail, actual app100%L/S/F/B;108inventorypass/1failed stale renderer marker,5scriptspass;135oldChromiumpass/2new fixture construction failures. Exactnames/counts/errors/hashes persisted. Raw stack display assertions passed before unsupported Worker decode; existing copy/history contract rejects same-family overlap. Preserve display assertions and assert this refusal,add genuine canonical body/cell Worker/copy/history evidence. E2E initial native fixture InsertItem used DEFAULT adjustment which is unimplemented; use supported NOHINTADJUST rather than bypass runtime. Two writer-command-slice renderer marker references must follow real rename;10scopepaths and no semantic promotion. Product unchanged since full profile; only originalfailed/newcases rerun. Prior format/typecheck failures corrected within new interface/fixture public APIs; all statics pass.
