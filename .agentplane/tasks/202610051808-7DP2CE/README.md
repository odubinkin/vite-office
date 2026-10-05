---
id: "202610051808-7DP2CE"
title: "Resolve numbering undo through native node coordinates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "lists"
  - "parity"
  - "undo"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T18:09:01.221Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-05T18:09:16.662Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-05T18:09:16.662Z"
doc_updated_by: "CODER"
description: "Iteration158: migrate represented NumUpDown, NumOrNoNum and DelNum undo ownership to native numeric SwUndRng/index coordinates, preserving current list semantics and conscious IO exceptions."
sections:
  Summary: "Remove stale paragraph identity from represented numbering undo actions; resolve current native document coordinates as pinned unnum.cxx."
  Scope: |-
    apps/office/src/sw/source/core/undo/unnum.ts
    apps/office/src/sw/source/core/undo/native-numbering-node-index.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration158 migrate represented SwUndoNumUpDown and SwUndoDelNum retained cursor range objects to existing native numeric SwUndRng; replay actual current document PaM with native SetPaM. SwUndoNumOrNoNum stores m_nIndex and resolves current node with native nontext guard; SwUndoDelNum stores numeric history entries rather than paragraph pointers, preserves current direct-item/actual-level restoration and native DelNumRules replay. Source-confirmed unnum.cxx NumUpDown SwUndRng/m_nOffset, NumOrNoNum m_nIndex/nontext guard, DelNum numeric m_aNodes and range replay. No new adapter/helper/shared module, no stale node identity fallback. Full SwHistory migration, InsNum/ContinueNumbering payloads, split physical ownership and broad UI behavior remain unverified. Four scope paths, additive unnum metadata only,410prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. Native body/cell replacement, reversed and collapsed selections, structural range boundaries, list metadata independence/count-only contract, real shell UndoRedo tests. Six statics first and ONE full upstream-absent build/app/inventory/scripts/Chromium pass, vendor repository rename try/finally restore before5source audits. Tests never access upstream, exact failures/errors persist before assertions, only failed/new cases repeat and skipped=skipped. Actual app/inventory100%L/S/F/B, maps and any local initial source variants only ignored appcache; AP bounded English prose/counts/hashes/outcomes/exactnames only, no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Same agent explicit EVALUATOR exact semantic SHAreview, recorded verify, meaningful canonical finish and parent checkpoint clean main. Standing user iterative authorization applies; no network/outside/global/subagents; goal remains active."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. New native numbering-index cases prove NumUpDown numeric range ownership across replacement of body and actual cell endpoints; reversed/collapsed shell cursor, independent unrelated list metadata and actual delta semantics. DelNum restores current numeric slots' native direct items/actual levels and replays inclusive range; count toggling targets only saved current native slot and ignores structural node as pinned source.410prior testfiles unchanged,250states/defaults/exceptions/prior evidence preserved;4paths/additive unnum owner, no broad promotion.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Audit scope, prior tests/defaults/AP artifacts, doctor/routing, explicit same-agent EVALUATOR exact semantic SHApass, recordedverify/canonicalfinish/parentcheckpoint clean main.
  Verification: "Pending execution; no parity promotion."
  Rollback Plan: "Revert only the intentional semantic commit in a separately authorized follow-up task; preserve prior history and conscious IO exceptions."
  Findings: "Read-only pinned source confirms numeric range/index ownership for NumUpDown, NumOrNoNum and DelNum. DelNum still uses portable direct-item snapshots instead of complete native SwHistory; InsNum, ContinueNumbering and split physical identity bridge remain outside this leaf."
id_source: "generated"
---
## Summary

Remove stale paragraph identity from represented numbering undo actions; resolve current native document coordinates as pinned unnum.cxx.

## Scope

apps/office/src/sw/source/core/undo/unnum.ts
apps/office/src/sw/source/core/undo/native-numbering-node-index.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration158 migrate represented SwUndoNumUpDown and SwUndoDelNum retained cursor range objects to existing native numeric SwUndRng; replay actual current document PaM with native SetPaM. SwUndoNumOrNoNum stores m_nIndex and resolves current node with native nontext guard; SwUndoDelNum stores numeric history entries rather than paragraph pointers, preserves current direct-item/actual-level restoration and native DelNumRules replay. Source-confirmed unnum.cxx NumUpDown SwUndRng/m_nOffset, NumOrNoNum m_nIndex/nontext guard, DelNum numeric m_aNodes and range replay. No new adapter/helper/shared module, no stale node identity fallback. Full SwHistory migration, InsNum/ContinueNumbering payloads, split physical ownership and broad UI behavior remain unverified. Four scope paths, additive unnum metadata only,410prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. Native body/cell replacement, reversed and collapsed selections, structural range boundaries, list metadata independence/count-only contract, real shell UndoRedo tests. Six statics first and ONE full upstream-absent build/app/inventory/scripts/Chromium pass, vendor repository rename try/finally restore before5source audits. Tests never access upstream, exact failures/errors persist before assertions, only failed/new cases repeat and skipped=skipped. Actual app/inventory100%L/S/F/B, maps and any local initial source variants only ignored appcache; AP bounded English prose/counts/hashes/outcomes/exactnames only, no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Same agent explicit EVALUATOR exact semantic SHAreview, recorded verify, meaningful canonical finish and parent checkpoint clean main. Standing user iterative authorization applies; no network/outside/global/subagents; goal remains active.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. New native numbering-index cases prove NumUpDown numeric range ownership across replacement of body and actual cell endpoints; reversed/collapsed shell cursor, independent unrelated list metadata and actual delta semantics. DelNum restores current numeric slots' native direct items/actual levels and replays inclusive range; count toggling targets only saved current native slot and ignores structural node as pinned source.410prior testfiles unchanged,250states/defaults/exceptions/prior evidence preserved;4paths/additive unnum owner, no broad promotion.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Audit scope, prior tests/defaults/AP artifacts, doctor/routing, explicit same-agent EVALUATOR exact semantic SHApass, recordedverify/canonicalfinish/parentcheckpoint clean main.

## Verification

Pending execution; no parity promotion.

## Rollback Plan

Revert only the intentional semantic commit in a separately authorized follow-up task; preserve prior history and conscious IO exceptions.

## Findings

Read-only pinned source confirms numeric range/index ownership for NumUpDown, NumOrNoNum and DelNum. DelNum still uses portable direct-item snapshots instead of complete native SwHistory; InsNum, ContinueNumbering and split physical identity bridge remain outside this leaf.
