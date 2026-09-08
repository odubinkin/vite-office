---
id: "202609081621-RWENHR"
title: "Align Writer core with LibreOffice document model"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-08T16:22:30.507Z"
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
    body: "Start: rebase canonical Writer state on the pinned LibreOffice node, position, selection, and text-attribute model while preserving browser behavior."
events:
  -
    type: "status"
    at: "2026-09-08T16:22:46.708Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: rebase canonical Writer state on the pinned LibreOffice node, position, selection, and text-attribute model while preserving browser behavior."
doc_version: 3
doc_updated_at: "2026-09-08T16:22:46.708Z"
doc_updated_by: "CODER"
description: "Replace the paragraph-array/run DTO as Writer's canonical state with a TypeScript reimplementation of the pinned LibreOffice SwDoc, SwNodes, SwNode/SwTextNode, SwPosition/SwPaM, and text-attribute model; migrate existing Writer behavior and browser projections without treating React state as the document model."
sections:
  Summary: "Rebase the implemented Writer vertical slice on a TypeScript object model that preserves the pinned LibreOffice Writer core entities, ownership relationships, ordering invariants, positions, selections, and range attributes. Browser rendering remains an adapter over the core model."
  Scope: |-
    In scope:
    - Replace WriterDocument.paragraphs and WriterTextRun as canonical document storage with SwDoc-owned SwNodes and SwTextNode content.
    - Implement the bounded TypeScript counterparts of SwNode/SwStartNode/SwEndNode, SwNodes, SwTextNode, SwTextAttr/SwpHints, SwPosition, and SwPaM needed by all currently implemented Writer behavior.
    - Represent bold, italic, underline, paragraph alignment/style, and list metadata through LibreOffice-shaped item and hint boundaries rather than view-ready runs.
    - Route insertion, deletion, split/join, direct formatting, list changes, clipboard preparation, undo snapshots, persistence, and React rendering through the new model or explicit read-only projections.
    - Migrate legacy browser snapshots and preserve all currently implemented Writer behavior.
    - Update tests, architecture documentation, source-tree mapping, source provenance, and parity evidence.
    Expected code scope: apps/office/src/sw/source/core/**, the Writer uibase consumers under apps/office/src/sw/source/uibase/**, Writer storage/history integration under apps/office/src/framework/source/services/desktop.tsx, and directly corresponding tests/docs/provenance records.
    Out of scope for this task: layout frames/pagination, tables, fields, redlines, complete SfxItemPool inheritance, ODT/DOCX filters, and unrelated suite work. These remain required by the persistent program goal and are not declared browser exceptions.
  Plan: |-
    1. Port the bounded Writer document graph from pinned doc.hxx/docnew.cxx, ndarr.hxx/nodes.cxx, node.hxx, ndtxt.hxx/ndtxt.cxx, pam.hxx/pam.cxx, txatbase.cxx, and ndhints.cxx into TypeScript entities with matching ownership and ordering invariants.
    2. Implement range-aware content and attribute algorithms on SwPosition/SwPaM, including hint adjustment for insertion, deletion, split, join, and direct formatting.
    3. Migrate existing list, paragraph, clipboard, command-shell, undo, persistence, and React view paths so SwDoc is canonical and view-ready paragraphs/runs are derived projections only.
    4. Add backward snapshot migration plus focused invariant and behavioral regression tests.
    5. Update architecture, source provenance/tree, and Writer parity evidence to describe the real model and explicitly retain remaining compatibility debt.
    6. Run task verification, record exact evidence, and finish through the direct Agentplane route.
  Verify Steps: |-
    1. Inspect the canonical Writer types and search their consumers. Expected: runtime document state is owned by SwDoc/SwNodes; no canonical state interface stores paragraphs[] or view-ready runs[].
    2. Run focused Vitest coverage for every changed Writer core and uibase test. Expected: node sentinels/order, SwPosition and SwPaM ordering/direction, hint normalization/adjustment, editing, formatting, lists, clipboard, history, and storage migration all pass.
    3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every added mapped source has a pinned LibreOffice counterpart and all mappings validate.
    4. Run npm run verify. Expected: formatting, lint, TypeScript, unit coverage, inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates all pass.
    5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: Agentplane repository and routing policy checks pass.
    6. Inspect git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and close commits together, restoring the prior paragraph-array model and its storage schema. Re-run npm run verify and the Agentplane routing checks after rollback. Do not delete or rewrite existing browser snapshots; migration code must remain backward-reading until a later explicitly approved schema-retirement task."
  Findings: "Initial audit: the current canonical WriterDocument stores OfficeDocument plus paragraphs[], and each paragraph duplicates visible text with formatting runs[]. The pinned LibreOffice model instead has SwDoc own SwNodes, SwTextNode own OUString text plus SwpHints, selections use SwPosition/SwPaM, and content operations mutate ranges while maintaining registered positions and hints. Therefore incremental UI feature work on the current DTO would deepen architectural divergence; this task first replaces that foundation."
id_source: "generated"
---
## Summary

Rebase the implemented Writer vertical slice on a TypeScript object model that preserves the pinned LibreOffice Writer core entities, ownership relationships, ordering invariants, positions, selections, and range attributes. Browser rendering remains an adapter over the core model.

## Scope

In scope:
- Replace WriterDocument.paragraphs and WriterTextRun as canonical document storage with SwDoc-owned SwNodes and SwTextNode content.
- Implement the bounded TypeScript counterparts of SwNode/SwStartNode/SwEndNode, SwNodes, SwTextNode, SwTextAttr/SwpHints, SwPosition, and SwPaM needed by all currently implemented Writer behavior.
- Represent bold, italic, underline, paragraph alignment/style, and list metadata through LibreOffice-shaped item and hint boundaries rather than view-ready runs.
- Route insertion, deletion, split/join, direct formatting, list changes, clipboard preparation, undo snapshots, persistence, and React rendering through the new model or explicit read-only projections.
- Migrate legacy browser snapshots and preserve all currently implemented Writer behavior.
- Update tests, architecture documentation, source-tree mapping, source provenance, and parity evidence.
Expected code scope: apps/office/src/sw/source/core/**, the Writer uibase consumers under apps/office/src/sw/source/uibase/**, Writer storage/history integration under apps/office/src/framework/source/services/desktop.tsx, and directly corresponding tests/docs/provenance records.
Out of scope for this task: layout frames/pagination, tables, fields, redlines, complete SfxItemPool inheritance, ODT/DOCX filters, and unrelated suite work. These remain required by the persistent program goal and are not declared browser exceptions.

## Plan

1. Port the bounded Writer document graph from pinned doc.hxx/docnew.cxx, ndarr.hxx/nodes.cxx, node.hxx, ndtxt.hxx/ndtxt.cxx, pam.hxx/pam.cxx, txatbase.cxx, and ndhints.cxx into TypeScript entities with matching ownership and ordering invariants.
2. Implement range-aware content and attribute algorithms on SwPosition/SwPaM, including hint adjustment for insertion, deletion, split, join, and direct formatting.
3. Migrate existing list, paragraph, clipboard, command-shell, undo, persistence, and React view paths so SwDoc is canonical and view-ready paragraphs/runs are derived projections only.
4. Add backward snapshot migration plus focused invariant and behavioral regression tests.
5. Update architecture, source provenance/tree, and Writer parity evidence to describe the real model and explicitly retain remaining compatibility debt.
6. Run task verification, record exact evidence, and finish through the direct Agentplane route.

## Verify Steps

1. Inspect the canonical Writer types and search their consumers. Expected: runtime document state is owned by SwDoc/SwNodes; no canonical state interface stores paragraphs[] or view-ready runs[].
2. Run focused Vitest coverage for every changed Writer core and uibase test. Expected: node sentinels/order, SwPosition and SwPaM ordering/direction, hint normalization/adjustment, editing, formatting, lists, clipboard, history, and storage migration all pass.
3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every added mapped source has a pinned LibreOffice counterpart and all mappings validate.
4. Run npm run verify. Expected: formatting, lint, TypeScript, unit coverage, inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates all pass.
5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: Agentplane repository and routing policy checks pass.
6. Inspect git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and close commits together, restoring the prior paragraph-array model and its storage schema. Re-run npm run verify and the Agentplane routing checks after rollback. Do not delete or rewrite existing browser snapshots; migration code must remain backward-reading until a later explicitly approved schema-retirement task.

## Findings

Initial audit: the current canonical WriterDocument stores OfficeDocument plus paragraphs[], and each paragraph duplicates visible text with formatting runs[]. The pinned LibreOffice model instead has SwDoc own SwNodes, SwTextNode own OUString text plus SwpHints, selections use SwPosition/SwPaM, and content operations mutate ranges while maintaining registered positions and hints. Therefore incremental UI feature work on the current DTO would deepen architectural divergence; this task first replaces that foundation.
