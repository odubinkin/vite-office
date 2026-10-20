---
id: "202610201742-6B984M"
title: "Implement Writer search and replace core and browser UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T17:43:01.279Z"
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
    body: "Start: implement the user-approved source-backed Writer search and replace core, view contracts and browser UI on writer with local upstream reading and targeted verification."
events:
  -
    type: "status"
    at: "2026-10-20T17:43:08.785Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the user-approved source-backed Writer search and replace core, view contracts and browser UI on writer with local upstream reading and targeted verification."
doc_version: 3
doc_updated_at: "2026-10-20T17:43:08.785Z"
doc_updated_by: "CODER"
description: "Implement the approved coherent Writer search-and-replace feature from pinned LibreOffice sources: real shared search engine and options, native paragraph/cursor traversal and replacement/history contracts, view-owned search state and dispatch, Find toolbar and Find and Replace dialog with generated upstream command placement and shortcuts. Preserve source semantics and explicit unsupported boundaries; never substitute DOM text search or browser RegExp for ICU contracts. Work only on writer in vite-office-writer; local upstream reading approved, no network or merges. Keep active until approved scope is verified."
sections:
  Summary: "Implement the approved Writer search and replace feature using the pinned LibreOffice source contracts, with real shared search responsibilities, Writer cursor traversal, view-owned search state, replacement history, and browser Find / Find and Replace presentation."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer on branch writer. Up to 50 non-task files across shared search options/backend/wrapper, Writer cursor/shell/view/dialog/browser/resource owners, related tests and provenance/runtime records. Reading the existing local LibreOffice reference is explicitly approved by the user. No network, merges, external writes, storage/recovery changes, deferred Calc LanguageTag work, DOM-based searching, or JavaScript RegExp substitution for ICU regular expressions. Preserve original UTF-16 offsets, directional endpoint conventions, option defaults, selection ownership and undo grouping. All modes and controls must have truthful source-backed capability boundaries; keep this task open while approved search/replace scope remains unfinished."
  Plan: "Implement approved Writer search and replace as one coherent task: source-backed shared engine/options, Writer find ranges/replacement/undo, view dispatch and Find toolbar/dialog; targeted verification and truthful pending mode dependencies, no fake ICU or DOM search. Keep task active until the approved feature scope is verified."
  Verify Steps: |-
    - Run targeted Vitest tests for changed shared search owners and related Writer cursor, shell, view and browser search owners. Include forward/backward bounds, empty patterns, UTF-16 endpoints, word/case options, wrap, selection/table traversal, find-all rings, replacement growth/deletion and atomic undo/redo, and UI command/focus/cancellation behavior.
    - Run npm run build and npm run check:writer-resources after UI/resource implementation.
    - Run npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run check:docs, npm run check:file-size and scoped ESLint/Prettier on changed code.
    - Run ap doctor and node .agentplane/policy/check-routing.mjs. Inspect git diff --check and git status --short --untracked-files=all.
    - Inspect current pinned native source and QA contracts for every claimed mode. Record unimplemented dependencies and suspected upstream issues honestly. Maintain the user's one-full-run-per-ten-task cadence; no full run is required for an intermediate implementation checkpoint. Do not finish based only on partial engine checks.
  Verification: "Pending implementation and checks. User explicitly approved the proposed search-and-replace plan and reading local upstream sources on 2026-10-21 (Asia/Bangkok)."
  Rollback Plan: "Revert only this task's intentional implementation commit(s). Preserve all existing user changes, task records and local reference links. No reset, merge, cleanup or outside-repository writes."
  Findings: "The existing shared textsearch owner implements SearchParam values only; TextSearch engine, backend and cache are not implemented. Existing Writer PaM positions and cursor rings, selection replacement and undo owners are reusable actual responsibilities. Deferred task197 belongs to Calc and must remain untouched."
id_source: "generated"
---
## Summary

Implement the approved Writer search and replace feature using the pinned LibreOffice source contracts, with real shared search responsibilities, Writer cursor traversal, view-owned search state, replacement history, and browser Find / Find and Replace presentation.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer on branch writer. Up to 50 non-task files across shared search options/backend/wrapper, Writer cursor/shell/view/dialog/browser/resource owners, related tests and provenance/runtime records. Reading the existing local LibreOffice reference is explicitly approved by the user. No network, merges, external writes, storage/recovery changes, deferred Calc LanguageTag work, DOM-based searching, or JavaScript RegExp substitution for ICU regular expressions. Preserve original UTF-16 offsets, directional endpoint conventions, option defaults, selection ownership and undo grouping. All modes and controls must have truthful source-backed capability boundaries; keep this task open while approved search/replace scope remains unfinished.

## Plan

Implement approved Writer search and replace as one coherent task: source-backed shared engine/options, Writer find ranges/replacement/undo, view dispatch and Find toolbar/dialog; targeted verification and truthful pending mode dependencies, no fake ICU or DOM search. Keep task active until the approved feature scope is verified.

## Verify Steps

- Run targeted Vitest tests for changed shared search owners and related Writer cursor, shell, view and browser search owners. Include forward/backward bounds, empty patterns, UTF-16 endpoints, word/case options, wrap, selection/table traversal, find-all rings, replacement growth/deletion and atomic undo/redo, and UI command/focus/cancellation behavior.
- Run npm run build and npm run check:writer-resources after UI/resource implementation.
- Run npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run check:docs, npm run check:file-size and scoped ESLint/Prettier on changed code.
- Run ap doctor and node .agentplane/policy/check-routing.mjs. Inspect git diff --check and git status --short --untracked-files=all.
- Inspect current pinned native source and QA contracts for every claimed mode. Record unimplemented dependencies and suspected upstream issues honestly. Maintain the user's one-full-run-per-ten-task cadence; no full run is required for an intermediate implementation checkpoint. Do not finish based only on partial engine checks.

## Verification

Pending implementation and checks. User explicitly approved the proposed search-and-replace plan and reading local upstream sources on 2026-10-21 (Asia/Bangkok).

## Rollback Plan

Revert only this task's intentional implementation commit(s). Preserve all existing user changes, task records and local reference links. No reset, merge, cleanup or outside-repository writes.

## Findings

The existing shared textsearch owner implements SearchParam values only; TextSearch engine, backend and cache are not implemented. Existing Writer PaM positions and cursor rings, selection replacement and undo owners are reusable actual responsibilities. Deferred task197 belongs to Calc and must remain untouched.
