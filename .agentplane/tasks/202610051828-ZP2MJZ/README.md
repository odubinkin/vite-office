---
id: "202610051828-ZP2MJZ"
title: "Resolve formatting history through current native coordinates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
  - "undo"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T18:28:22.043Z"
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
    body: "Start: native formatting coordinate ownership migration under standing iterative authorization."
events:
  -
    type: "status"
    at: "2026-10-05T18:28:23.314Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native formatting coordinate ownership migration under standing iterative authorization."
doc_version: 3
doc_updated_at: "2026-10-05T18:28:23.314Z"
doc_updated_by: "CODER"
description: "Iteration159 migrate formatting/reset/style history node ownership to native numeric targets and range replay; remove retained paragraph identities blocking native split ownership migration."
sections:
  Summary: "Resolve formatting undo through current native numeric coordinates, removing stale paragraph-object payload ownership."
  Scope: |-
    apps/office/src/sw/source/core/undo/unattr.ts
    apps/office/src/sw/source/core/undo/unfmco.ts
    apps/office/src/sw/source/core/undo/native-format-node-index.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration159 remove retained paragraph-object identities from represented direct character/paragraph item/alignment/margin/reset and style collection history. Pinned unattr.cxx SwUndoAttr/SwUndoResetAttr use numeric SwUndRng coordinates and current undo document; unfmco.cxx uses SwUndRng for redo and numeric native SwHistory for rollback. Retain existing current portable fragment/item/hint snapshots and named-style/direct-item/emptylist rollback contracts, payload sizes/comments/defaults and foreign-document guards; full native SwHistory/attribute payload machinery still unverified. Resolve each direct action via saved numeric node index and original document ownership boundary, ResetAttr owns numeric range/native indices and transient current nodes for ApplyExact/Undo/Redo, FormatColl owns numeric capture entries and SwUndRng, named Redo reconstructs current native PaM/current inclusive text nodes. No new adapter/helper/shared module/DTO/TextRuns fallback. Five scopepaths/additive2owners,411prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. New actual body/cell section-preserving replacement and persistent shell history cases for each represented action,style composite/reset and ordered/reversed/collapsed boundaries,cursor/pending/neighbor/independent payload contracts. Six statics first; ONEupstream-absent build/app/inventory/scripts/Chromium profile, exactfailures/errors before assertions and failed/new-only remediation/no passing replay/skipped=skipped,repository vendor rename try/finally restore before5source audits. Actual app/inventory100%L/S/F/B, maps and optional initial local source variants only ignored appcache; AP bounded Englishcounts/hashes/prose/exactnames/outcomes only,no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Exact semantic SHA same-agent EVALUATOR pass,recordedverify/canonical meaningfulfinish/parentcheckpoint clean main. Standing iterativeuserauthorization applies,no network/outside/global/subagents. Full history/payload/native split physical ownership/other actions/broad UI parity remainopen,goalactive,no broadpromotion."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. New native formatting-index cases prove each represented character/item/alignment/margin/reset/style action and real composite style history targets current body/cell native slots after repeated physical replacement; current inclusive range and original cursor direction/pending state, independent retained values and untouched neighbor.411prior testfiles byte-identical/250states/defaults/classifications/exceptions/prior evidence preserved;5paths/additive2owners only. No full native SwHistory/attribute payload/split/UI promotion.
    4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.
  Verification: "Pending execution; no fullmodule parity claim."
  Rollback Plan: "Revert only intentional semantic implementation commit in a separately authorized follow-up task; preserve lifecycle history and registered exceptions."
  Findings: "Pinned unattr.cxx SwUndoAttr/ResetAttr store native numeric ranges;unfmco.cxx FormatColl numeric range/current document redo and native history rollback. Existing portable whole-fragment/direct-item/hint snapshots and full native SwHistory/undo lifetime differences remain unverified. Standing authorization covers this ownership prerequisite."
id_source: "generated"
---
## Summary

Resolve formatting undo through current native numeric coordinates, removing stale paragraph-object payload ownership.

## Scope

apps/office/src/sw/source/core/undo/unattr.ts
apps/office/src/sw/source/core/undo/unfmco.ts
apps/office/src/sw/source/core/undo/native-format-node-index.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration159 remove retained paragraph-object identities from represented direct character/paragraph item/alignment/margin/reset and style collection history. Pinned unattr.cxx SwUndoAttr/SwUndoResetAttr use numeric SwUndRng coordinates and current undo document; unfmco.cxx uses SwUndRng for redo and numeric native SwHistory for rollback. Retain existing current portable fragment/item/hint snapshots and named-style/direct-item/emptylist rollback contracts, payload sizes/comments/defaults and foreign-document guards; full native SwHistory/attribute payload machinery still unverified. Resolve each direct action via saved numeric node index and original document ownership boundary, ResetAttr owns numeric range/native indices and transient current nodes for ApplyExact/Undo/Redo, FormatColl owns numeric capture entries and SwUndRng, named Redo reconstructs current native PaM/current inclusive text nodes. No new adapter/helper/shared module/DTO/TextRuns fallback. Five scopepaths/additive2owners,411prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. New actual body/cell section-preserving replacement and persistent shell history cases for each represented action,style composite/reset and ordered/reversed/collapsed boundaries,cursor/pending/neighbor/independent payload contracts. Six statics first; ONEupstream-absent build/app/inventory/scripts/Chromium profile, exactfailures/errors before assertions and failed/new-only remediation/no passing replay/skipped=skipped,repository vendor rename try/finally restore before5source audits. Actual app/inventory100%L/S/F/B, maps and optional initial local source variants only ignored appcache; AP bounded Englishcounts/hashes/prose/exactnames/outcomes only,no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Exact semantic SHA same-agent EVALUATOR pass,recordedverify/canonical meaningfulfinish/parentcheckpoint clean main. Standing iterativeuserauthorization applies,no network/outside/global/subagents. Full history/payload/native split physical ownership/other actions/broad UI parity remainopen,goalactive,no broadpromotion.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. New native formatting-index cases prove each represented character/item/alignment/margin/reset/style action and real composite style history targets current body/cell native slots after repeated physical replacement; current inclusive range and original cursor direction/pending state, independent retained values and untouched neighbor.411prior testfiles byte-identical/250states/defaults/classifications/exceptions/prior evidence preserved;5paths/additive2owners only. No full native SwHistory/attribute payload/split/UI promotion.
4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.

## Verification

Pending execution; no fullmodule parity claim.

## Rollback Plan

Revert only intentional semantic implementation commit in a separately authorized follow-up task; preserve lifecycle history and registered exceptions.

## Findings

Pinned unattr.cxx SwUndoAttr/ResetAttr store native numeric ranges;unfmco.cxx FormatColl numeric range/current document redo and native history rollback. Existing portable whole-fragment/direct-item/hint snapshots and full native SwHistory/undo lifetime differences remain unverified. Standing authorization covers this ownership prerequisite.
