---
id: "202610201742-6B984M"
title: "Implement Writer search and replace core and browser UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-20T18:09:46.380Z"
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
  Verification: |-
    Intermediate core checkpoint only; overall task verification is pending:
    Command: npx vitest run src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/pam-selection.test.ts src/sw/source/core/crsr/native-table-cursor-stack.test.ts src/sw/source/core/crsr/native-table-selection-ownership.test.ts src/i18npool/source/search/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/unotools/source/i18n/textsearch.test.ts src/unotools/source/i18n/native-uppercase.test.ts src/i18nutil/source/utility/casefolding.test.ts
    Result: pass, 86 tests / 9 files (working directory apps/office).
    Scope: ordinary search, native options/wrapper, Unicode mappings and real model cursor/ring owners; includes independent exhaustive bounded literal comparison. Does not prove other modes, replacement or UI.
    Command: npx vitest run scripts/native-search-boundary.test.ts scripts/check-module-boundaries.test.ts --environment node
    Result: pass, 48 tests / 2 files.
    Command: npm run build
    Result: pass, TypeScript and production Vite build; standard large-chunk advisory remains.
    Command: npm run check:writer-resources
    Result: pass, generated-resource check and 2 tests.
    Command: npm run inventory:parity:writer; npm run inventory:parity:shared
    Result: pass, existing semantic validators, zero semantic violations; no parity-readiness or completion claim.
    Command: npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size
    Result: pass. Provenance covers 975 modules. Exact source-backed import data only; no guard changes.
    Command: scoped ESLint --max-warnings 0 and Prettier --check on all changed/new code/records; git diff --check
    Result: pass.
    Command: ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass with existing hook-shim warning (zero doctor errors); policy routing OK.
    Remaining mandatory feature checks (replacement/history, UI/focus/browser and all newly implemented modes) have not been executed because those portions are not implemented. They remain required; no skip approval or task closure is claimed.
  Rollback Plan: "Revert only this task's intentional implementation commit(s). Preserve all existing user changes, task records and local reference links. No reset, merge, cleanup or outside-repository writes."
  Findings: |-
    Implementation checkpoint (not task completion), 2026-10-21 Asia/Bangkok:
    - Local reference HEAD is 9bc445578031fecf56086729d8e4940c77e14d65 and its tracked source tree is clean. No network/native compilation or outside-repository write was used.
    - Implemented original absolute i18npool search with directional bad-character tables, full case folding over existing frozen native mapping data, expansion/supplementary source offsets, native category whole-word delimiters and punctuation asymmetry. Added original search option/result/flag values, shared option-copy defaults and the actual options-based unotools cache/wrapper. Refactored uppercase/folding to one consumed transliterateImpl loop.
    - Writer FindTextImpl uses region endpoints (as native MakeRegion does), real SwNodes including cell text, source soft-hyphen cleanup/recovery and native point/mark direction. SwFindParaText strategy remains in findtxt; generic find-only FindAll/rings, FillFindPos and flags stay with swcrsr/cshtyp. Normalize stays with PaM. Native ordinary InBody mark extension, failed-search preservation and all-match ring order are tested.
    - Documented and preserved WRITER-007 directional quote normalization, WRITER-008 backward empty-end-range special case and WRITER-009 directional filtered soft-hyphen boundary recovery. These are source-derived portable checks, not compiled upstream differentials or confirmed upstream bugs.
    - All semantic parity states remain unverified; no whole-module, UI or feature-completion promotion. The approved task remains DOING. Remaining required work: source-exact replacement/document/history and Replace All grouping/progress, shared search item/options/config defaults, additional transliteration/regex/wildcard/approximate dependencies, complete generic readonly/other-area/layout/field/note services, view-owned search/dispatch, generated placement/shortcuts and Find toolbar/Find and Replace dialog plus browser evidence. Notes/replacement/merged-layout operations and unsupported engine modes reject explicitly; no fake RegExp/DOM fallback.
    - No task was completed at this checkpoint and no full-run cadence increment occurred. Only related checks were run.
    - Initial focused test invocation from repository root found no tests; corrected working directory to apps/office. Source-based exhaustive intervals exposed and now preserve the native backward endPos==length special case; one expected text offset was corrected. Initial TS/lint findings were fixed (typed array annotation, real SwpHints Count/Get iteration, unnamed native enum cast, unused argument and this alias).
    - Initial file-size gate rejected appending the boundary assertions to an existing near-limit test file; moved those assertions into scripts/native-search-boundary.test.ts without altering gate algorithms or limits. Runtime metadata lists actual declarations rather than fields/re-exports that the existing semantic scanner does not count. No guard algorithm/exemption was changed; only exact native source-backed dependency data was added.
    - ap doctor exits OK with zero errors and an existing managed hook-shim readiness/fallback warning. Hook installation is outside this search task and was not modified.
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

Intermediate core checkpoint only; overall task verification is pending:
Command: npx vitest run src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/pam-selection.test.ts src/sw/source/core/crsr/native-table-cursor-stack.test.ts src/sw/source/core/crsr/native-table-selection-ownership.test.ts src/i18npool/source/search/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/unotools/source/i18n/textsearch.test.ts src/unotools/source/i18n/native-uppercase.test.ts src/i18nutil/source/utility/casefolding.test.ts
Result: pass, 86 tests / 9 files (working directory apps/office).
Scope: ordinary search, native options/wrapper, Unicode mappings and real model cursor/ring owners; includes independent exhaustive bounded literal comparison. Does not prove other modes, replacement or UI.
Command: npx vitest run scripts/native-search-boundary.test.ts scripts/check-module-boundaries.test.ts --environment node
Result: pass, 48 tests / 2 files.
Command: npm run build
Result: pass, TypeScript and production Vite build; standard large-chunk advisory remains.
Command: npm run check:writer-resources
Result: pass, generated-resource check and 2 tests.
Command: npm run inventory:parity:writer; npm run inventory:parity:shared
Result: pass, existing semantic validators, zero semantic violations; no parity-readiness or completion claim.
Command: npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size
Result: pass. Provenance covers 975 modules. Exact source-backed import data only; no guard changes.
Command: scoped ESLint --max-warnings 0 and Prettier --check on all changed/new code/records; git diff --check
Result: pass.
Command: ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass with existing hook-shim warning (zero doctor errors); policy routing OK.
Remaining mandatory feature checks (replacement/history, UI/focus/browser and all newly implemented modes) have not been executed because those portions are not implemented. They remain required; no skip approval or task closure is claimed.

## Rollback Plan

Revert only this task's intentional implementation commit(s). Preserve all existing user changes, task records and local reference links. No reset, merge, cleanup or outside-repository writes.

## Findings

Implementation checkpoint (not task completion), 2026-10-21 Asia/Bangkok:
- Local reference HEAD is 9bc445578031fecf56086729d8e4940c77e14d65 and its tracked source tree is clean. No network/native compilation or outside-repository write was used.
- Implemented original absolute i18npool search with directional bad-character tables, full case folding over existing frozen native mapping data, expansion/supplementary source offsets, native category whole-word delimiters and punctuation asymmetry. Added original search option/result/flag values, shared option-copy defaults and the actual options-based unotools cache/wrapper. Refactored uppercase/folding to one consumed transliterateImpl loop.
- Writer FindTextImpl uses region endpoints (as native MakeRegion does), real SwNodes including cell text, source soft-hyphen cleanup/recovery and native point/mark direction. SwFindParaText strategy remains in findtxt; generic find-only FindAll/rings, FillFindPos and flags stay with swcrsr/cshtyp. Normalize stays with PaM. Native ordinary InBody mark extension, failed-search preservation and all-match ring order are tested.
- Documented and preserved WRITER-007 directional quote normalization, WRITER-008 backward empty-end-range special case and WRITER-009 directional filtered soft-hyphen boundary recovery. These are source-derived portable checks, not compiled upstream differentials or confirmed upstream bugs.
- All semantic parity states remain unverified; no whole-module, UI or feature-completion promotion. The approved task remains DOING. Remaining required work: source-exact replacement/document/history and Replace All grouping/progress, shared search item/options/config defaults, additional transliteration/regex/wildcard/approximate dependencies, complete generic readonly/other-area/layout/field/note services, view-owned search/dispatch, generated placement/shortcuts and Find toolbar/Find and Replace dialog plus browser evidence. Notes/replacement/merged-layout operations and unsupported engine modes reject explicitly; no fake RegExp/DOM fallback.
- No task was completed at this checkpoint and no full-run cadence increment occurred. Only related checks were run.
- Initial focused test invocation from repository root found no tests; corrected working directory to apps/office. Source-based exhaustive intervals exposed and now preserve the native backward endPos==length special case; one expected text offset was corrected. Initial TS/lint findings were fixed (typed array annotation, real SwpHints Count/Get iteration, unnamed native enum cast, unused argument and this alias).
- Initial file-size gate rejected appending the boundary assertions to an existing near-limit test file; moved those assertions into scripts/native-search-boundary.test.ts without altering gate algorithms or limits. Runtime metadata lists actual declarations rather than fields/re-exports that the existing semantic scanner does not count. No guard algorithm/exemption was changed; only exact native source-backed dependency data was added.
- ap doctor exits OK with zero errors and an existing managed hook-shim readiness/fallback warning. Hook installation is outside this search task and was not modified.
