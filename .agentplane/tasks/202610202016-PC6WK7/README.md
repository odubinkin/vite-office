---
id: "202610202016-PC6WK7"
title: "Refactor search results to native UNO sequence value contracts"
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
  updated_at: "2026-10-20T20:16:47.424Z"
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
    body: "Start: replace the old search result array shortcut with actual shared UNO sequence owners and migrate the complete represented search path."
events:
  -
    type: "status"
    at: "2026-10-20T20:16:53.722Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace the old search result array shortcut with actual shared UNO sequence owners and migrate the complete represented search path."
doc_version: 3
doc_updated_at: "2026-10-20T20:16:53.722Z"
doc_updated_by: "CODER"
description: "Replace the old array-shaped SearchResult shortcut throughout the shared search engine/wrapper/replacement path with actual generated struct value and shared Sequence<sal_Int32> owners; preserve directional offsets, defaults, copy-on-write and existing algorithms."
sections:
  Summary: "Replace the old parallel JavaScript-array SearchResult shortcut with the original generated UNO struct and actual shared Sequence<sal_Int32> value contracts across native search producers and consumers."
  Scope: "Only vite-office-writer on writer. Up to 35 non-task paths: SearchResult value owner, shared engine/wrapper/helper consumers, related search tests/new value tests and test caller bindings, exact source-backed boundary data if needed, runtime/provenance records and documentation. No replacement Sequence backend, proxy numeric indexing, fake generated type/provider, unrelated configuration/ICU/backend algorithms or browser UI claims."
  Plan: "1. Inspect original SearchResult.idl and actual shared Sequence constructor, assignment, COW and access contracts. 2. Implement zero/default, complete/copy construction, field assignment and erased destructor using actual Sequence<sal_Int32> owners. 3. Migrate absolute/wildcard/remapping producers and wrapper/backreference consumers to actual sequences; remove structural result array paths. 4. Migrate tests through explicit test-only caller encoding/observation helpers and add ownership/COW/independence and end-to-end tests. 5. Run scoped verification/static registries, record review and commit/finish this leaf; keep parent configuration, advanced engine and UI open."
  Verify Steps: "Run new SearchResult value/COW tests, affected i18npool normal/wildcard/options, unotools wrapper/helper/parameter and Writer Find_Text/replacement tests plus actual shared public Sequence tests. Run npm run build; scoped Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared. Run boundary tooling tests if dependency data changes. Run ap doctor, policy routing, git diff --check and git status --short --untracked-files=all. Inspect default/field order and real sequence access/assignment/COW, retain raw directional offsets. Do not promote portable/source checks to compiled native UNO ABI or full UI parity. Seven completed tasks since full checkpoint 6a7dd8660; this would be eighth, full suite is not due."
  Verification: "Pending implementation and verification."
  Rollback Plan: "Revert only this result-value refactor and its tests/registry/task evidence, preserving existing search algorithms and prior completed leaves."
  Findings: "Configuration discovery confirms actual service owners remain absent; do not fabricate them. The current SearchResult interface erases more than marshalling: it replaces native Sequence value/copy semantics with mutable JS arrays. This leaf removes that existing shortcut within approved search contracts. Local LibreOffice source reading is approved; ICU/network remain unapproved and unused."
id_source: "generated"
---
## Summary

Replace the old parallel JavaScript-array SearchResult shortcut with the original generated UNO struct and actual shared Sequence<sal_Int32> value contracts across native search producers and consumers.

## Scope

Only vite-office-writer on writer. Up to 35 non-task paths: SearchResult value owner, shared engine/wrapper/helper consumers, related search tests/new value tests and test caller bindings, exact source-backed boundary data if needed, runtime/provenance records and documentation. No replacement Sequence backend, proxy numeric indexing, fake generated type/provider, unrelated configuration/ICU/backend algorithms or browser UI claims.

## Plan

1. Inspect original SearchResult.idl and actual shared Sequence constructor, assignment, COW and access contracts. 2. Implement zero/default, complete/copy construction, field assignment and erased destructor using actual Sequence<sal_Int32> owners. 3. Migrate absolute/wildcard/remapping producers and wrapper/backreference consumers to actual sequences; remove structural result array paths. 4. Migrate tests through explicit test-only caller encoding/observation helpers and add ownership/COW/independence and end-to-end tests. 5. Run scoped verification/static registries, record review and commit/finish this leaf; keep parent configuration, advanced engine and UI open.

## Verify Steps

Run new SearchResult value/COW tests, affected i18npool normal/wildcard/options, unotools wrapper/helper/parameter and Writer Find_Text/replacement tests plus actual shared public Sequence tests. Run npm run build; scoped Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared. Run boundary tooling tests if dependency data changes. Run ap doctor, policy routing, git diff --check and git status --short --untracked-files=all. Inspect default/field order and real sequence access/assignment/COW, retain raw directional offsets. Do not promote portable/source checks to compiled native UNO ABI or full UI parity. Seven completed tasks since full checkpoint 6a7dd8660; this would be eighth, full suite is not due.

## Verification

Pending implementation and verification.

## Rollback Plan

Revert only this result-value refactor and its tests/registry/task evidence, preserving existing search algorithms and prior completed leaves.

## Findings

Configuration discovery confirms actual service owners remain absent; do not fabricate them. The current SearchResult interface erases more than marshalling: it replaces native Sequence value/copy semantics with mutable JS arrays. This leaf removes that existing shortcut within approved search contracts. Local LibreOffice source reading is approved; ICU/network remain unapproved and unused.
