---
id: "202609081724-EXGQKG"
title: "Reimplement Writer item sets and paragraph styles"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
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
doc_updated_at: "2026-09-08T18:14:47.747Z"
doc_updated_by: "CODER"
description: "Replace direct paragraph property fields with a bounded TypeScript reimplementation of LibreOffice SfxPoolItem/SfxItemPool/SfxItemSet, SwAttrPool/SwAttrSet, SwFormat/SwTextFormatColl ownership and inheritance, then migrate current Writer behavior and snapshots."
sections:
  Summary: |-
    Reimplement Writer item sets and paragraph styles

    Replace direct paragraph property fields with a bounded TypeScript reimplementation of LibreOffice SfxPoolItem, SfxItemPool, SfxItemSet, SwAttrPool, SwAttrSet, SwFormat, and SwTextFormatColl ownership and inheritance, then migrate current Writer behavior and snapshots.
  Scope: |-
    In scope:
    - Add bounded SfxPoolItem, SfxItemPool, and SfxItemSet counterparts with WhichId identity, pooled defaults, parent inheritance, item state, Put, ClearItem, Count, and deep clone semantics.
    - Add Writer SwAttrPool and SwAttrSet plus paragraph items required by implemented alignment and list behavior.
    - Add SwFormat, SwFormatColl, and SwTextFormatColl ownership and inheritance; make SwDoc own the pool and text-format collection table.
    - Rework SwContentNode and SwTextNode to own a format collection and lazily allocated direct SwAttrSet instead of alignment, list, and style fields.
    - Preserve existing Writer UI behavior through derived getters and versioned snapshot conversion, including legacy snapshot migration.
    - Update focused tests, architecture docs, exhaustive source provenance/tree records, and Writer parity evidence.
    Expected paths: apps/office/src/svl/source/items, apps/office/src/sw/source/core model paths, directly affected Writer tests, docs/program, and source-tree/inventory checks.
    Out of scope: layout, tables, fields, redlines, arbitrary paragraph properties, complete style-pool loading, native notification clients, file filters, and unrelated suites.
  Plan: |-
    1. Port the bounded pool-item and item-set contracts from pinned SVL sources, retaining WhichId, default, parent, state, replacement, clearing, and clone semantics.
    2. Port SwAttrPool, SwAttrSet, and current paragraph item types from pinned Writer and EditEngine sources.
    3. Port bounded SwFormat and SwTextFormatColl ownership and derivation, and initialize the pool, default style, and Heading 1 collection in SwDoc.
    4. Rework SwContentNode and SwTextNode construction, lazy direct attributes, format changes, split, clone, snapshot migration, and current UI adapters.
    5. Add invariant and regression tests plus provenance, source-tree, architecture, and parity evidence with explicit remaining gaps.
    6. Run the complete verification contract, record quality evidence, commit, and finish through the direct workflow.
  Verify Steps: |-
    1. Inspect canonical types and consumers. Expected: SwDoc owns SwAttrPool and SwTextFormatColl objects; SwContentNode owns its collection and optional SwAttrSet; SwTextNode no longer stores direct alignment, list, or style fields.
    2. Run focused Vitest coverage for SfxItemSet, SwAttrSet and format collections, SwContentNode and SwTextNode attributes, split, clone, snapshot migration, and existing commands. Expected: all pass with every new branch exercised.
    3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every runtime module maps to an existing pinned LibreOffice implementation and the exhaustive manifest is current.
    4. Run npm run verify. Expected: format, lint, TypeScript, office and inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates pass.
    5. Run ap doctor and the policy routing check. Expected: Agentplane and routing checks pass without new findings.
    6. Run git diff check and inspect full git status. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.
  Verification: |-
    - Command: rg scan for legacy direct paragraph fields.
      Result: pass.
      Evidence: no legacy direct paragraph fields remain; matches refer only to the version-two text-format-collection table and snapshot key.
      Scope: canonical SwDoc, SwContentNode, and SwTextNode ownership.
    - Command: npm run test:coverage --workspace @vite-office/office.
      Result: pass.
      Evidence: 34 files and 121 tests passed; statements, branches, functions, and lines are all 100%.
      Scope: SVL items, Writer attributes, styles, rules, migrations, and existing application behavior.
    - Command: npm run check:source-provenance and npm run check:source-tree.
      Result: pass.
      Evidence: all 59 runtime modules are classified with 51 mapped and 8 browser-only; 49 required source-tree paths and 10 retired roots passed.
      Scope: exhaustive runtime provenance and LibreOffice-shaped source layout.
    - Command: npm run inventory:parity with the pinned baseline and vendor root.
      Result: pass.
      Evidence: baseline 9bc445578031fecf56086729d8e4940c77e14d65, 24 explicit gaps, and zero evidence exceptions, including LO-WRITER-0112.
      Scope: pinned upstream and local implementation, test, and documentation evidence.
    - Command: npm run verify.
      Result: pass.
      Evidence: format, lint, TypeScript, 121 office tests at 100 percent coverage, 74 inventory tests at 100 percent coverage, 7 Chromium E2E tests, static build, JSDoc, and file-size gates passed.
      Scope: complete repository verification contract.
    - Command: ap doctor, policy routing check, git diff check, and full git status.
      Result: pass.
      Evidence: doctor OK with only pre-existing repository warning and info, policy routing OK, no whitespace errors, and all listed changes are task-scoped.
      Scope: workflow health, policy routing, and final worktree review.
  Rollback Plan: "Revert the implementation and task-close commits together. Restore the preceding direct SwTextNode field representation while retaining backward readers for snapshots written by either schema. Re-run npm run verify, provenance checks, Agentplane doctor, and routing checks after rollback."
  Findings: |-
    Audit result: the prior direct paragraphAlignment, paragraphList, and textFormatCollection storage was a material architectural divergence. It has been replaced by document-owned SwAttrPool, WhichId-keyed SfxPoolItem defaults and deltas, SwTextFormatColl inheritance, lazy SwContentNode direct attributes, and document-owned SwNumRule definitions. Browser getters remain derived projections.

    Compatibility result: the canonical snapshot is now swModelVersion 2; both version-one SwDoc records and the older paragraph and run DTO migrate into the item-backed graph.

    Residual scope: the pool and style and rule tables remain deliberately bounded. Complete Writer WhichId coverage, pooled item sharing, broadcasts, conditional and automatic styles, full multi-level numbering, layout, native undo, and ODT and DOCX filters remain future parity tasks. No scope drift or approved exception was introduced.
id_source: "generated"
---
## Summary

Reimplement Writer item sets and paragraph styles

Replace direct paragraph property fields with a bounded TypeScript reimplementation of LibreOffice SfxPoolItem, SfxItemPool, SfxItemSet, SwAttrPool, SwAttrSet, SwFormat, and SwTextFormatColl ownership and inheritance, then migrate current Writer behavior and snapshots.

## Scope

In scope:
- Add bounded SfxPoolItem, SfxItemPool, and SfxItemSet counterparts with WhichId identity, pooled defaults, parent inheritance, item state, Put, ClearItem, Count, and deep clone semantics.
- Add Writer SwAttrPool and SwAttrSet plus paragraph items required by implemented alignment and list behavior.
- Add SwFormat, SwFormatColl, and SwTextFormatColl ownership and inheritance; make SwDoc own the pool and text-format collection table.
- Rework SwContentNode and SwTextNode to own a format collection and lazily allocated direct SwAttrSet instead of alignment, list, and style fields.
- Preserve existing Writer UI behavior through derived getters and versioned snapshot conversion, including legacy snapshot migration.
- Update focused tests, architecture docs, exhaustive source provenance/tree records, and Writer parity evidence.
Expected paths: apps/office/src/svl/source/items, apps/office/src/sw/source/core model paths, directly affected Writer tests, docs/program, and source-tree/inventory checks.
Out of scope: layout, tables, fields, redlines, arbitrary paragraph properties, complete style-pool loading, native notification clients, file filters, and unrelated suites.

## Plan

1. Port the bounded pool-item and item-set contracts from pinned SVL sources, retaining WhichId, default, parent, state, replacement, clearing, and clone semantics.
2. Port SwAttrPool, SwAttrSet, and current paragraph item types from pinned Writer and EditEngine sources.
3. Port bounded SwFormat and SwTextFormatColl ownership and derivation, and initialize the pool, default style, and Heading 1 collection in SwDoc.
4. Rework SwContentNode and SwTextNode construction, lazy direct attributes, format changes, split, clone, snapshot migration, and current UI adapters.
5. Add invariant and regression tests plus provenance, source-tree, architecture, and parity evidence with explicit remaining gaps.
6. Run the complete verification contract, record quality evidence, commit, and finish through the direct workflow.

## Verify Steps

1. Inspect canonical types and consumers. Expected: SwDoc owns SwAttrPool and SwTextFormatColl objects; SwContentNode owns its collection and optional SwAttrSet; SwTextNode no longer stores direct alignment, list, or style fields.
2. Run focused Vitest coverage for SfxItemSet, SwAttrSet and format collections, SwContentNode and SwTextNode attributes, split, clone, snapshot migration, and existing commands. Expected: all pass with every new branch exercised.
3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every runtime module maps to an existing pinned LibreOffice implementation and the exhaustive manifest is current.
4. Run npm run verify. Expected: format, lint, TypeScript, office and inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates pass.
5. Run ap doctor and the policy routing check. Expected: Agentplane and routing checks pass without new findings.
6. Run git diff check and inspect full git status. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.

## Verification

- Command: rg scan for legacy direct paragraph fields.
  Result: pass.
  Evidence: no legacy direct paragraph fields remain; matches refer only to the version-two text-format-collection table and snapshot key.
  Scope: canonical SwDoc, SwContentNode, and SwTextNode ownership.
- Command: npm run test:coverage --workspace @vite-office/office.
  Result: pass.
  Evidence: 34 files and 121 tests passed; statements, branches, functions, and lines are all 100%.
  Scope: SVL items, Writer attributes, styles, rules, migrations, and existing application behavior.
- Command: npm run check:source-provenance and npm run check:source-tree.
  Result: pass.
  Evidence: all 59 runtime modules are classified with 51 mapped and 8 browser-only; 49 required source-tree paths and 10 retired roots passed.
  Scope: exhaustive runtime provenance and LibreOffice-shaped source layout.
- Command: npm run inventory:parity with the pinned baseline and vendor root.
  Result: pass.
  Evidence: baseline 9bc445578031fecf56086729d8e4940c77e14d65, 24 explicit gaps, and zero evidence exceptions, including LO-WRITER-0112.
  Scope: pinned upstream and local implementation, test, and documentation evidence.
- Command: npm run verify.
  Result: pass.
  Evidence: format, lint, TypeScript, 121 office tests at 100 percent coverage, 74 inventory tests at 100 percent coverage, 7 Chromium E2E tests, static build, JSDoc, and file-size gates passed.
  Scope: complete repository verification contract.
- Command: ap doctor, policy routing check, git diff check, and full git status.
  Result: pass.
  Evidence: doctor OK with only pre-existing repository warning and info, policy routing OK, no whitespace errors, and all listed changes are task-scoped.
  Scope: workflow health, policy routing, and final worktree review.

## Rollback Plan

Revert the implementation and task-close commits together. Restore the preceding direct SwTextNode field representation while retaining backward readers for snapshots written by either schema. Re-run npm run verify, provenance checks, Agentplane doctor, and routing checks after rollback.

## Findings

Audit result: the prior direct paragraphAlignment, paragraphList, and textFormatCollection storage was a material architectural divergence. It has been replaced by document-owned SwAttrPool, WhichId-keyed SfxPoolItem defaults and deltas, SwTextFormatColl inheritance, lazy SwContentNode direct attributes, and document-owned SwNumRule definitions. Browser getters remain derived projections.

Compatibility result: the canonical snapshot is now swModelVersion 2; both version-one SwDoc records and the older paragraph and run DTO migrate into the item-backed graph.

Residual scope: the pool and style and rule tables remain deliberately bounded. Complete Writer WhichId coverage, pooled item sharing, broadcasts, conditional and automatic styles, full multi-level numbering, layout, native undo, and ODT and DOCX filters remain future parity tasks. No scope drift or approved exception was introduced.
