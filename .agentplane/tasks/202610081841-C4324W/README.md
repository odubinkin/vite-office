---
id: "202610081841-C4324W"
title: "Own shared native row frame formats and claim them before mutation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202610081810-5Z5D06"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T18:42:56.003Z"
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
    body: "Start: implement source-bound shared native row frame formats and claim-before-write, native item-set history/topology and direct mounted UI with standing iterative approval. Targeted upstream-absent verification, no full241 or passing replay; preserve registered deviations."
events:
  -
    type: "status"
    at: "2026-10-08T18:42:56.464Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-bound shared native row frame formats and claim-before-write, native item-set history/topology and direct mounted UI with standing iterative approval. Targeted upstream-absent verification, no full241 or passing replay; preserve registered deviations."
doc_version: 3
doc_updated_at: "2026-10-08T18:42:56.464Z"
doc_updated_by: "CODER"
description: "Iteration241 replaces per-row attribute records with native SwTableLineFormat item-set ownership, shared SwClient registration, ClaimFrameFormat copy-on-write and operation-local format reuse. Builders/transport keep explicit value records; attribute history preserves shared format topology. Standing iterative user goal authorizes safe local work. Targeted upstream-absent tests and exact-source coverage100; full last237,next247."
sections:
  Summary: "Own shared native row frame formats and claim them before original row mutation."
  Scope: |-
    apps/office/src/svl/source/notify/SfxBroadcaster.ts
    apps/office/src/sw/source/core/attr/format.ts
    apps/office/src/sw/source/core/layout/atrfrm.ts
    apps/office/src/sw/source/core/attr/swatrset.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/docnode/ndtbl1.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/source/filter/xml/xmltbli.ts
    apps/office/src/sw/browser/filter/xml/writer-table-item-codec.ts
    apps/office/src/sw/inc/swtblfmt.ts
    apps/office/src/sw/source/core/table/native-column-insertion.test.ts
    apps/office/src/sw/source/core/table/native-row-frame-format.test.ts
    apps/office/src/sw/source/core/undo/native-row-frame-format-history.test.ts
    apps/office/src/sw/browser/presentation/native-row-frame-format.test.tsx
    apps/office/src/test/table-row-test-helpers.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration241 replaces per-row canonical attribute records with document-owned SwTableLineFormat derived from SwFrameFormat/SwFormat and native SfxItemSet ownership. SwFormat becomes a SwModify source without changing existing paragraph notification semantics; native ForAllListeners supports typed original row client enumeration. SwTableLine is a SwClient registered at a shared format; strict native constructor, GetFrameFormat, ClaimFrameFormat copy-on-write and ChgFrameFormat preserve original identities. Core row mutation uses operation-local old-to-new format mapping equivalent to lcl_ProcessRowAttr, so selected shared rows reuse one new format and unselected peers retain the original. SwDoc native format factory/default frame and concrete frame-size pool default; node/XML builders convert explicit value records once; inserted rows share source native format. SaveTable captures unique independent full item sets and indexed row format topology, restores shared native owners for Undo/Redo. Existing GetFormat/SetFormat remain explicit value boundaries only, no persistent DTO or inverse scalar. Rename prior value interface to SwTableLineFormatValue; migrate one standalone native constructor and helper absent-item representation only, preserving old assertions. Add native class/registration/claim/common/shared selection and original history/mounted row tests. Full row layout client lifecycle/SwModify hints/pooling/nested/merged/UNO remain partial, no status promotion. Targeted upstream-absent tests and actual-counter source-bound all-four100% from240; no full241 (last237,next247). Standing iterative user goal authorizes safe local implementation; same-agent roles, no delegation/network/global access."
  Verify Steps: |-
    1. Byte-bind pin9bc445578031fecf56086729d8e4940c77e14d65 native swtblfmt.hxx, swtable.cxx1455-1519, ndtbl1.cxx282-299, docfmt.cxx1780, format.cxx91, init.cxxaTableLineSetRange and SfxBroadcaster ForAllListeners. No copied sources/scripts/Python/raw data in AgentPlane.
    2. New literal tests prove document pool/default inheritance, concrete complete frame-size/row-split defaults, shared original SwClient registration, exclusive claim no-op, shared claim independent items and correct listener movement, changing formats and original core selected/whole row mutation operation-local reuse, same-value/history/notifications, inserted row format sharing and Undo/Redo reconstructed sharing without text/cursor/row/box replacement. Mounted main UI must publish actual native items to original row frames; transport/XML existing cases remain correct.
    3. Baseline every existing acceptance file before mutation; exact constructor/type/helper representation-only migrations, all old assertion calls/literals/loops preserved. No skip/only or weakening. Preserve all315 prior metadata fields/prefixes/states/defaults/classes; new row format record remains partial.
    4. Six static format/lint/type/dependency/docs/file-size gates, build/static and new/related row/split/height/format/item/insert/history/ODF/UI/Chromium tests once upstream absent/restored finally. Failed/new-only closures without passing replay. Full241 skipped by user cadence last237,next247.
    5. All-four100% cumulative actual app/inventory counters transfer only entire identical current source/maps or complete declaration/body/enclosing branch/all locations from240. No clamping/sanitization; raw exits/skips retained. No inventory/infra runtime replay if unchanged whole source/maps verified.
    6. After restoration separate generator/source-tree/provenance/invariants/parity, doctor/routing/diff/artifact audits; source<1000physical lines, IO4/writer-view/pin/stash protected. Actual implementation SHA current-agent EVALUATOR explicitly non-independent, exact task scope/old source-map bindings, clean tracked finish241/DONE immutable and exact-prefix parent append698356/hash ec8b64039ba56f1496388dfbba48e24de89b5e742fca7e232747b0a30802a1be. Full goal active; full row layout/pooling/UNO remains unverified.
  Verification: "Pending implementation and source-bound targeted evidence."
  Rollback Plan: "Revert eventual implementation commit locally without rewriting DONE leaves."
  Findings: "Previous240 is DONE, actual native row items/transport passed263app/11Chromium with all-four100. Source row format is still a copied value record; native ClaimFrameFormat and operation-local old/new format sharing remain missing. Preflight main clean, direct mode, standing user approval; no duplicate open leaf. Parent original prefix698356 retained. Full writer row-frame listener lifecycle and modified-state flag require separate evidence; no complete module promotion."
id_source: "generated"
---
## Summary

Own shared native row frame formats and claim them before original row mutation.

## Scope

apps/office/src/svl/source/notify/SfxBroadcaster.ts
apps/office/src/sw/source/core/attr/format.ts
apps/office/src/sw/source/core/layout/atrfrm.ts
apps/office/src/sw/source/core/attr/swatrset.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/docnode/ndtbl1.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/source/filter/xml/xmltbli.ts
apps/office/src/sw/browser/filter/xml/writer-table-item-codec.ts
apps/office/src/sw/inc/swtblfmt.ts
apps/office/src/sw/source/core/table/native-column-insertion.test.ts
apps/office/src/sw/source/core/table/native-row-frame-format.test.ts
apps/office/src/sw/source/core/undo/native-row-frame-format-history.test.ts
apps/office/src/sw/browser/presentation/native-row-frame-format.test.tsx
apps/office/src/test/table-row-test-helpers.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration241 replaces per-row canonical attribute records with document-owned SwTableLineFormat derived from SwFrameFormat/SwFormat and native SfxItemSet ownership. SwFormat becomes a SwModify source without changing existing paragraph notification semantics; native ForAllListeners supports typed original row client enumeration. SwTableLine is a SwClient registered at a shared format; strict native constructor, GetFrameFormat, ClaimFrameFormat copy-on-write and ChgFrameFormat preserve original identities. Core row mutation uses operation-local old-to-new format mapping equivalent to lcl_ProcessRowAttr, so selected shared rows reuse one new format and unselected peers retain the original. SwDoc native format factory/default frame and concrete frame-size pool default; node/XML builders convert explicit value records once; inserted rows share source native format. SaveTable captures unique independent full item sets and indexed row format topology, restores shared native owners for Undo/Redo. Existing GetFormat/SetFormat remain explicit value boundaries only, no persistent DTO or inverse scalar. Rename prior value interface to SwTableLineFormatValue; migrate one standalone native constructor and helper absent-item representation only, preserving old assertions. Add native class/registration/claim/common/shared selection and original history/mounted row tests. Full row layout client lifecycle/SwModify hints/pooling/nested/merged/UNO remain partial, no status promotion. Targeted upstream-absent tests and actual-counter source-bound all-four100% from240; no full241 (last237,next247). Standing iterative user goal authorizes safe local implementation; same-agent roles, no delegation/network/global access.

## Verify Steps

1. Byte-bind pin9bc445578031fecf56086729d8e4940c77e14d65 native swtblfmt.hxx, swtable.cxx1455-1519, ndtbl1.cxx282-299, docfmt.cxx1780, format.cxx91, init.cxxaTableLineSetRange and SfxBroadcaster ForAllListeners. No copied sources/scripts/Python/raw data in AgentPlane.
2. New literal tests prove document pool/default inheritance, concrete complete frame-size/row-split defaults, shared original SwClient registration, exclusive claim no-op, shared claim independent items and correct listener movement, changing formats and original core selected/whole row mutation operation-local reuse, same-value/history/notifications, inserted row format sharing and Undo/Redo reconstructed sharing without text/cursor/row/box replacement. Mounted main UI must publish actual native items to original row frames; transport/XML existing cases remain correct.
3. Baseline every existing acceptance file before mutation; exact constructor/type/helper representation-only migrations, all old assertion calls/literals/loops preserved. No skip/only or weakening. Preserve all315 prior metadata fields/prefixes/states/defaults/classes; new row format record remains partial.
4. Six static format/lint/type/dependency/docs/file-size gates, build/static and new/related row/split/height/format/item/insert/history/ODF/UI/Chromium tests once upstream absent/restored finally. Failed/new-only closures without passing replay. Full241 skipped by user cadence last237,next247.
5. All-four100% cumulative actual app/inventory counters transfer only entire identical current source/maps or complete declaration/body/enclosing branch/all locations from240. No clamping/sanitization; raw exits/skips retained. No inventory/infra runtime replay if unchanged whole source/maps verified.
6. After restoration separate generator/source-tree/provenance/invariants/parity, doctor/routing/diff/artifact audits; source<1000physical lines, IO4/writer-view/pin/stash protected. Actual implementation SHA current-agent EVALUATOR explicitly non-independent, exact task scope/old source-map bindings, clean tracked finish241/DONE immutable and exact-prefix parent append698356/hash ec8b64039ba56f1496388dfbba48e24de89b5e742fca7e232747b0a30802a1be. Full goal active; full row layout/pooling/UNO remains unverified.

## Verification

Pending implementation and source-bound targeted evidence.

## Rollback Plan

Revert eventual implementation commit locally without rewriting DONE leaves.

## Findings

Previous240 is DONE, actual native row items/transport passed263app/11Chromium with all-four100. Source row format is still a copied value record; native ClaimFrameFormat and operation-local old/new format sharing remain missing. Preflight main clean, direct mode, standing user approval; no duplicate open leaf. Parent original prefix698356 retained. Full writer row-frame listener lifecycle and modified-state flag require separate evidence; no complete module promotion.
