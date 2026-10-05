---
id: "202610052113-W6AAHH"
title: "Render Writer text from native attribute iteration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T21:14:29.087Z"
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
doc_updated_at: "2026-10-05T21:23:37.720Z"
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
  Plan: "Iteration165 continues standing explicitly authorized iterative existing-functionality core/UI/refactor goal; one CODER leaf on direct main. Replace browser view projection's filter TextRuns conversion with actual native SwAttrIter/SwAttrHandler responsibility owners in matching sw/source/core/text/itratr.ts and atrstck.ts. Native start/end cursors/defaults, reset/backward Seek, end-before-start SeekFwd, format-ignore boundary admission and per-character-item automatic attribute stacks with priority push/identity pop/default fallback; no first-covering auto-format choice. Borrow actual pooled SfxPoolItems and inherited node/style defaults; expose explicitly bounded item read accessor rather than fabricate full SwFont/device engine. Existing INET node query gives native hyperlink identity; missing native INET style/visited-color/font/device/script/redline/field/merged paragraph/paragraph mark effects remain unverified. Browser retains frozen primitive presentation records and existing field shape for compatibility, but neither inherits filter WriterTextRun nor imports projectWriterTextRuns/WriterCharacterAttributes; direct iterator item reads resolve supported Western formatting and physical/generic font family. Shared body/cell/measurement renderer consumes browser primitive type and retains stable view IDs, editing host/history/native ranges. No new transport/schema/model backdoor or renamed filter adapter. Real-owner literal overlapping disjoint Which items, equal-start order, priority/default restoration, forward/backward/repeat/end/empty/zero/ignore boundaries, direct/inherited fonts/generic metadata, table ownership and actual session/DOM/history/native copying/codec/reopen as supported; production Chromium locally generated ODT body/cell formatting/editing/history/selection checks.9scopepaths4productionowners including2new partial native owners.423 prior testfiles all byte-identical;251 existing runtime semantic states/defaults/classes/IO exceptions/evidence preserved,add2unverified modules=253. Native full font/field/script/merged/redline/INETstyle and overall table/list/UI parity remain unverified. Conscious save/open/recovery deviations unchanged. Six initial statics then ONE upstream-absent build/app/inventory/scripts/Chromium via in-repo vendor rename try/finallyrestore; onlyoriginalfailed/genuinelynew cases orfailed/changedfilegates afterwards,no passing/fullprofile replay; actual app/inventory100%L/S/F/B. Persist exactfailures/errors/counts/hashsbeforeassertions,skipped=skipped. Five restored sourceaudits, exact scope/prior-test/metadata/sourcehash/APignoredinclusive/doctor/routing; sameagent explicitEVALUATOR exactsemanticSHApass,verify/canonicalmeaningfulfinish,wholeparentFindingsappend cleanmain. AP bounded English prose/counts/hashes/outcomes/exactfailednames only;no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. No network/outside/global/subagents. Previous164verifiedprogress,parentDOING/goalACTIVE."
  Verify Steps: |-
    1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat onlyfailedgates or changed-file remediation.
    2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore; tests neverread/invoke/compileupstream. Exactfailure/errors/countshashspersistedbeforeassertions;skipped=skipped. Onlyoriginalfailed or genuinelynewunexecutedcases afterwards;no passing/fullprofile replay. Actual100%app/inventoryL/S/F/B with source/map identity-checked counters onlyignoredappcache.
    3. Native SwAttrIter start/end/position defaults/reset/backward/SeekFwd end-before-start and ignore-boundary semantics; SwAttrHandler per-item priority stacks/borrowed item identity/default inheritance rather than first covering hint. Actual overlapping/inherited/differentWhich/zero/empty/end/priority/tie/ignore/location cases and real body/cell shared DOM/session/history/Worker/ODT/browser checks. UI projection and renderer must have no filter WriterTextRun/projectWriterTextRuns import or type inheritance; bounded browser primitive DTO only.423 prior testfiles byte-identical;251 existing states/defaults/classes/IO exceptions/evidence preserved plus2partial unverified native owners=253modules;9semanticpaths4owners. Conscious save/open/recovery deviations unchanged,no full-native or broad paritypromotion.
    4. Afterrestore five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/sourcehash/APignoredinclusive/doctor/routing. Sameagent EVALUATOR exactSHApass, recordverify,canonicalmeaningfulfinish,wholeparentFindingsappend/cleantracked+untracked. Full native SwFont/device/scripts/redline/fields/merged paragraphs/INET styles/paragraph mark and broad core/UI/list/table parity remain unverified.
  Verification: "Pending actual deterministic profile and exact semantic-SHA review."
  Rollback Plan: "Revert only this leaf semantic commit; retain immutable completed task evidence and all prior parent findings."
  Findings: "Previous164 verified progress. Native attribute traversal and direct item display implemented;423 prior tests unchanged. Initial format check failed only new E2E import ordering, fixed and failed format gate passed. Initial lint passed. Initial typecheck failed because the projection interface replacement was incomplete and new fixtures used wrong public insertion/invalidation APIs. Correct browser-only WriterTextPortion interface, native SwFormatAutoFormat InsertItem, public dispatcher Invalidate and SwWrtShell Insert; no product API expansion or test workaround. Only failed typecheck and unexecuted dependency/docs/size gates next, changed-file format/lint checks as needed. Full native font/device/other-family and broad UI parity remain unverified."
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

## Plan

Iteration165 continues standing explicitly authorized iterative existing-functionality core/UI/refactor goal; one CODER leaf on direct main. Replace browser view projection's filter TextRuns conversion with actual native SwAttrIter/SwAttrHandler responsibility owners in matching sw/source/core/text/itratr.ts and atrstck.ts. Native start/end cursors/defaults, reset/backward Seek, end-before-start SeekFwd, format-ignore boundary admission and per-character-item automatic attribute stacks with priority push/identity pop/default fallback; no first-covering auto-format choice. Borrow actual pooled SfxPoolItems and inherited node/style defaults; expose explicitly bounded item read accessor rather than fabricate full SwFont/device engine. Existing INET node query gives native hyperlink identity; missing native INET style/visited-color/font/device/script/redline/field/merged paragraph/paragraph mark effects remain unverified. Browser retains frozen primitive presentation records and existing field shape for compatibility, but neither inherits filter WriterTextRun nor imports projectWriterTextRuns/WriterCharacterAttributes; direct iterator item reads resolve supported Western formatting and physical/generic font family. Shared body/cell/measurement renderer consumes browser primitive type and retains stable view IDs, editing host/history/native ranges. No new transport/schema/model backdoor or renamed filter adapter. Real-owner literal overlapping disjoint Which items, equal-start order, priority/default restoration, forward/backward/repeat/end/empty/zero/ignore boundaries, direct/inherited fonts/generic metadata, table ownership and actual session/DOM/history/native copying/codec/reopen as supported; production Chromium locally generated ODT body/cell formatting/editing/history/selection checks.9scopepaths4productionowners including2new partial native owners.423 prior testfiles all byte-identical;251 existing runtime semantic states/defaults/classes/IO exceptions/evidence preserved,add2unverified modules=253. Native full font/field/script/merged/redline/INETstyle and overall table/list/UI parity remain unverified. Conscious save/open/recovery deviations unchanged. Six initial statics then ONE upstream-absent build/app/inventory/scripts/Chromium via in-repo vendor rename try/finallyrestore; onlyoriginalfailed/genuinelynew cases orfailed/changedfilegates afterwards,no passing/fullprofile replay; actual app/inventory100%L/S/F/B. Persist exactfailures/errors/counts/hashsbeforeassertions,skipped=skipped. Five restored sourceaudits, exact scope/prior-test/metadata/sourcehash/APignoredinclusive/doctor/routing; sameagent explicitEVALUATOR exactsemanticSHApass,verify/canonicalmeaningfulfinish,wholeparentFindingsappend cleanmain. AP bounded English prose/counts/hashes/outcomes/exactfailednames only;no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. No network/outside/global/subagents. Previous164verifiedprogress,parentDOING/goalACTIVE.

## Verify Steps

1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat onlyfailedgates or changed-file remediation.
2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore; tests neverread/invoke/compileupstream. Exactfailure/errors/countshashspersistedbeforeassertions;skipped=skipped. Onlyoriginalfailed or genuinelynewunexecutedcases afterwards;no passing/fullprofile replay. Actual100%app/inventoryL/S/F/B with source/map identity-checked counters onlyignoredappcache.
3. Native SwAttrIter start/end/position defaults/reset/backward/SeekFwd end-before-start and ignore-boundary semantics; SwAttrHandler per-item priority stacks/borrowed item identity/default inheritance rather than first covering hint. Actual overlapping/inherited/differentWhich/zero/empty/end/priority/tie/ignore/location cases and real body/cell shared DOM/session/history/Worker/ODT/browser checks. UI projection and renderer must have no filter WriterTextRun/projectWriterTextRuns import or type inheritance; bounded browser primitive DTO only.423 prior testfiles byte-identical;251 existing states/defaults/classes/IO exceptions/evidence preserved plus2partial unverified native owners=253modules;9semanticpaths4owners. Conscious save/open/recovery deviations unchanged,no full-native or broad paritypromotion.
4. Afterrestore five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/sourcehash/APignoredinclusive/doctor/routing. Sameagent EVALUATOR exactSHApass, recordverify,canonicalmeaningfulfinish,wholeparentFindingsappend/cleantracked+untracked. Full native SwFont/device/scripts/redline/fields/merged paragraphs/INET styles/paragraph mark and broad core/UI/list/table parity remain unverified.

## Verification

Pending actual deterministic profile and exact semantic-SHA review.

## Rollback Plan

Revert only this leaf semantic commit; retain immutable completed task evidence and all prior parent findings.

## Findings

Previous164 verified progress. Native attribute traversal and direct item display implemented;423 prior tests unchanged. Initial format check failed only new E2E import ordering, fixed and failed format gate passed. Initial lint passed. Initial typecheck failed because the projection interface replacement was incomplete and new fixtures used wrong public insertion/invalidation APIs. Correct browser-only WriterTextPortion interface, native SwFormatAutoFormat InsertItem, public dispatcher Invalidate and SwWrtShell Insert; no product API expansion or test workaround. Only failed typecheck and unexecuted dependency/docs/size gates next, changed-file format/lint checks as needed. Full native font/device/other-family and broad UI parity remain unverified.
