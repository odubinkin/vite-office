---
id: "202610202006-KTTNQD"
title: "Implement native replacement references and similarity helpers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T20:07:34.080Z"
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
    body: "Start: implement approved native replacement-reference and similarity helper family on writer without ICU access."
events:
  -
    type: "status"
    at: "2026-10-20T20:07:41.050Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native replacement-reference and similarity helper family on writer without ICU access."
doc_version: 3
doc_updated_at: "2026-10-20T20:07:41.050Z"
doc_updated_by: "CODER"
description: "Continue approved Writer search parent with complete source-shaped shared utl::TextSearch replacement expansion and similarity-scoring methods, preserving native UTF16 and directional quirks without requiring ICU."
sections:
  Summary: "Implement the original shared utl::TextSearch replacement-reference parser and complete static similarity-scoring operation family, as a substantive child of the approved Writer search/UI goal."
  Scope: "Writer checkout/branch only. Extend existing unotools TextSearch owner and header exports, use existing SAL value/buffer owners; add focused tests, source/runtime registry evidence, suspected-issue records and task artifacts. Up to 20 non-task paths. No ICU or network reads, configuration service substitutes, browser regex engine or UI parity claim."
  Plan: "1. Inspect pinned original replacement and all three similarity methods/thresholds. 2. Port original UTF16 parsing, caller-reference updates, weighted distance matrix and substring score flow on the actual shared owner. Preserve asymmetric backward ampersand expansion and empty/single-unit scoring. 3. Test exact source-derived cases, Unicode/isolated surrogate units, optional/reversed references, rejection outputs and distance properties; check existing search and SAL buffer consumers. 4. Update honest source evidence and suspected issues, run targeted checks, record review and commit/finish leaf. Keep parent configuration/backend/UI pending."
  Verify Steps: "Run new focused helper tests and existing unotools textsearch parameter/engine, i18npool normal/wildcard and Writer native-search-replace/Find_Text tests, plus affected SAL buffer tests. Run npm run build; changed-file Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size, inventory:parity:writer/shared; ap doctor; policy routing; git diff --check/status. Compare source methods and header thresholds directly. Source/portable evidence only, not native compiled ABI or regex engine fidelity. Six tasks completed since full checkpoint 6a7dd8660; this is seventh, no full run due."
  Verification: "Pending implementation and scoped verification."
  Rollback Plan: "Revert this leaf implementation and exact registry/test documentation changes without touching prior search groundwork or user changes; keep parent open."
  Findings: "The authorized LibreOffice reference contains all four methods. ICU access remains pending and is unnecessary for this leaf. ReplaceBackReferences ampersand uses raw forward subtraction while dollar references normalize reversed endpoints; inspect and preserve rather than fix. Similarity utilities are distinct from the i18npool approximate search engine and must not be advertised as its implementation."
id_source: "generated"
---
## Summary

Implement the original shared utl::TextSearch replacement-reference parser and complete static similarity-scoring operation family, as a substantive child of the approved Writer search/UI goal.

## Scope

Writer checkout/branch only. Extend existing unotools TextSearch owner and header exports, use existing SAL value/buffer owners; add focused tests, source/runtime registry evidence, suspected-issue records and task artifacts. Up to 20 non-task paths. No ICU or network reads, configuration service substitutes, browser regex engine or UI parity claim.

## Plan

1. Inspect pinned original replacement and all three similarity methods/thresholds. 2. Port original UTF16 parsing, caller-reference updates, weighted distance matrix and substring score flow on the actual shared owner. Preserve asymmetric backward ampersand expansion and empty/single-unit scoring. 3. Test exact source-derived cases, Unicode/isolated surrogate units, optional/reversed references, rejection outputs and distance properties; check existing search and SAL buffer consumers. 4. Update honest source evidence and suspected issues, run targeted checks, record review and commit/finish leaf. Keep parent configuration/backend/UI pending.

## Verify Steps

Run new focused helper tests and existing unotools textsearch parameter/engine, i18npool normal/wildcard and Writer native-search-replace/Find_Text tests, plus affected SAL buffer tests. Run npm run build; changed-file Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size, inventory:parity:writer/shared; ap doctor; policy routing; git diff --check/status. Compare source methods and header thresholds directly. Source/portable evidence only, not native compiled ABI or regex engine fidelity. Six tasks completed since full checkpoint 6a7dd8660; this is seventh, no full run due.

## Verification

Pending implementation and scoped verification.

## Rollback Plan

Revert this leaf implementation and exact registry/test documentation changes without touching prior search groundwork or user changes; keep parent open.

## Findings

The authorized LibreOffice reference contains all four methods. ICU access remains pending and is unnecessary for this leaf. ReplaceBackReferences ampersand uses raw forward subtraction while dollar references normalize reversed endpoints; inspect and preserve rather than fix. Similarity utilities are distinct from the i18npool approximate search engine and must not be advertised as its implementation.
