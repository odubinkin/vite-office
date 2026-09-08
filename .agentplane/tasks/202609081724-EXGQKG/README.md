---
id: "202609081724-EXGQKG"
title: "Reimplement Writer item sets and paragraph styles"
status: "DOING"
priority: "high"
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
  updated_at: "2026-09-08T17:26:06.580Z"
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
    body: "Start: reimplement the bounded LibreOffice item pool, attribute set, and paragraph style ownership model, then migrate existing Writer behavior and snapshots."
events:
  -
    type: "status"
    at: "2026-09-08T17:26:15.826Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reimplement the bounded LibreOffice item pool, attribute set, and paragraph style ownership model, then migrate existing Writer behavior and snapshots."
doc_version: 3
doc_updated_at: "2026-09-08T17:26:15.826Z"
doc_updated_by: "CODER"
description: "Replace direct paragraph property fields with a bounded TypeScript reimplementation of LibreOffice SfxPoolItem/SfxItemPool/SfxItemSet, SwAttrPool/SwAttrSet, SwFormat/SwTextFormatColl ownership and inheritance, then migrate current Writer behavior and snapshots."
sections:
  Summary: |-
    Reimplement Writer item sets and paragraph styles

    Replace direct paragraph property fields with a bounded TypeScript reimplementation of LibreOffice SfxPoolItem/SfxItemPool/SfxItemSet, SwAttrPool/SwAttrSet, SwFormat/SwTextFormatColl ownership and inheritance, then migrate current Writer behavior and snapshots.
  Scope: |-
    In scope:
    - Add bounded SfxPoolItem, SfxItemPool, and SfxItemSet counterparts with WhichId identity, pooled defaults, parent inheritance, item state, Put, ClearItem, Count, and deep clone semantics.
    - Add Writer SwAttrPool/SwAttrSet plus the paragraph items required by implemented alignment and list behavior.
    - Add SwFormat/SwFormatColl/SwTextFormatColl ownership and inheritance; make SwDoc own the pool and text-format collection table.
    - Rework SwContentNode and SwTextNode to own a format collection and lazily allocated direct SwAttrSet instead of alignment/list/style fields.
    - Preserve existing Writer UI behavior through derived getters and versioned snapshot conversion, including legacy snapshot migration.
    - Update focused tests, architecture docs, exhaustive source provenance/tree records, and Writer parity evidence.
    Expected paths: apps/office/src/svl/source/items/**, apps/office/src/sw/source/core/{attr,doc,docnode,para,txtnode}/**, directly affected Writer shell/tests, docs/program/**, and source-tree/inventory checks.
    Out of scope: layout, tables, fields, redlines, arbitrary paragraph properties, complete style-pool loading, native notification clients, file filters, and unrelated suites.
  Plan: |-
    1. Port the bounded pool-item and item-set contracts from poolitem.hxx/itempool.hxx/itemset.hxx and their svl implementations, retaining WhichId, default, parent, state, replacement, clearing, and clone semantics.
    2. Port SwAttrPool/SwAttrSet and the current paragraph item types from swatrset.cxx, paraitem.cxx, paratr.cxx, and hintids.hxx.
    3. Port bounded SwFormat/SwTextFormatColl ownership and derivation, and initialize the pool/default and Heading 1 collections in SwDoc.
    4. Rework SwContentNode/SwTextNode construction, lazy direct attributes, format changes, split/clone/snapshot migration, and current UI command adapters around those entities.
    5. Add invariant/regression tests plus provenance, source-tree, architecture, and parity evidence with explicit remaining gaps.
    6. Run the complete verification contract, record quality evidence, commit, and finish through the direct workflow.
  Verify Steps: |-
    1. Inspect canonical types and consumers. Expected: SwDoc owns SwAttrPool and SwTextFormatColl objects; SwContentNode owns its collection and optional SwAttrSet; SwTextNode no longer stores paragraphAlignment, paragraphList, or textFormatCollection fields.
    2. Run focused Vitest coverage for SfxItemSet, SwAttrSet/format collections, SwContentNode/SwTextNode attributes, split/clone/snapshot migration, and existing alignment/list/style commands. Expected: all pass with every new branch exercised.
    3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every runtime module maps to an existing pinned LibreOffice implementation and the exhaustive manifest is current.
    4. Run npm run verify. Expected: format, lint, TypeScript, office and inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates pass.
    5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: Agentplane and routing checks pass without new findings.
    6. Run git diff --check and inspect git status --short --untracked-files=all. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and task-close commits together. Restore the preceding direct SwTextNode field representation while retaining backward readers for snapshots written by either schema. Re-run npm run verify, provenance checks, Agentplane doctor, and routing checks after rollback."
  Findings: "Audit finding: the previous SwDoc/SwNodes realignment fixed document/node/range ownership, but SwTextNode still stores paragraphAlignment, paragraphList, and textFormatCollection as direct fields. In pinned LibreOffice, SwDoc owns SwAttrPool and text-format collections; SwContentNode registers in a SwFormatColl, lazily owns a SwAttrSet for direct formatting, and inherits unset items through the collection's attribute set. The next implementation must remove this remaining DTO-style property storage rather than only wrapping it."
id_source: "generated"
---
## Summary

Reimplement Writer item sets and paragraph styles

Replace direct paragraph property fields with a bounded TypeScript reimplementation of LibreOffice SfxPoolItem/SfxItemPool/SfxItemSet, SwAttrPool/SwAttrSet, SwFormat/SwTextFormatColl ownership and inheritance, then migrate current Writer behavior and snapshots.

## Scope

In scope:
- Add bounded SfxPoolItem, SfxItemPool, and SfxItemSet counterparts with WhichId identity, pooled defaults, parent inheritance, item state, Put, ClearItem, Count, and deep clone semantics.
- Add Writer SwAttrPool/SwAttrSet plus the paragraph items required by implemented alignment and list behavior.
- Add SwFormat/SwFormatColl/SwTextFormatColl ownership and inheritance; make SwDoc own the pool and text-format collection table.
- Rework SwContentNode and SwTextNode to own a format collection and lazily allocated direct SwAttrSet instead of alignment/list/style fields.
- Preserve existing Writer UI behavior through derived getters and versioned snapshot conversion, including legacy snapshot migration.
- Update focused tests, architecture docs, exhaustive source provenance/tree records, and Writer parity evidence.
Expected paths: apps/office/src/svl/source/items/**, apps/office/src/sw/source/core/{attr,doc,docnode,para,txtnode}/**, directly affected Writer shell/tests, docs/program/**, and source-tree/inventory checks.
Out of scope: layout, tables, fields, redlines, arbitrary paragraph properties, complete style-pool loading, native notification clients, file filters, and unrelated suites.

## Plan

1. Port the bounded pool-item and item-set contracts from poolitem.hxx/itempool.hxx/itemset.hxx and their svl implementations, retaining WhichId, default, parent, state, replacement, clearing, and clone semantics.
2. Port SwAttrPool/SwAttrSet and the current paragraph item types from swatrset.cxx, paraitem.cxx, paratr.cxx, and hintids.hxx.
3. Port bounded SwFormat/SwTextFormatColl ownership and derivation, and initialize the pool/default and Heading 1 collections in SwDoc.
4. Rework SwContentNode/SwTextNode construction, lazy direct attributes, format changes, split/clone/snapshot migration, and current UI command adapters around those entities.
5. Add invariant/regression tests plus provenance, source-tree, architecture, and parity evidence with explicit remaining gaps.
6. Run the complete verification contract, record quality evidence, commit, and finish through the direct workflow.

## Verify Steps

1. Inspect canonical types and consumers. Expected: SwDoc owns SwAttrPool and SwTextFormatColl objects; SwContentNode owns its collection and optional SwAttrSet; SwTextNode no longer stores paragraphAlignment, paragraphList, or textFormatCollection fields.
2. Run focused Vitest coverage for SfxItemSet, SwAttrSet/format collections, SwContentNode/SwTextNode attributes, split/clone/snapshot migration, and existing alignment/list/style commands. Expected: all pass with every new branch exercised.
3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every runtime module maps to an existing pinned LibreOffice implementation and the exhaustive manifest is current.
4. Run npm run verify. Expected: format, lint, TypeScript, office and inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates pass.
5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: Agentplane and routing checks pass without new findings.
6. Run git diff --check and inspect git status --short --untracked-files=all. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and task-close commits together. Restore the preceding direct SwTextNode field representation while retaining backward readers for snapshots written by either schema. Re-run npm run verify, provenance checks, Agentplane doctor, and routing checks after rollback.

## Findings

Audit finding: the previous SwDoc/SwNodes realignment fixed document/node/range ownership, but SwTextNode still stores paragraphAlignment, paragraphList, and textFormatCollection as direct fields. In pinned LibreOffice, SwDoc owns SwAttrPool and text-format collections; SwContentNode registers in a SwFormatColl, lazily owns a SwAttrSet for direct formatting, and inherits unset items through the collection's attribute set. The next implementation must remove this remaining DTO-style property storage rather than only wrapping it.
