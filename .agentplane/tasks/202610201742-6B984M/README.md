---
id: "202610201742-6B984M"
title: "Implement Writer search and replace core and browser UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202610201815-4586BY"
  - "202610201912-V6W22V"
  - "202610201948-MMAQEF"
  - "202610202006-KTTNQD"
  - "202610202016-PC6WK7"
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
doc_updated_at: "2026-10-20T19:35:31.273Z"
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

    Wildcard engine checkpoint (parent remains DOING; not overall task verification):
    Command: from apps/office, npx vitest run src/i18npool/source/search/textsearch-wildcard.test.ts src/i18npool/source/search/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/core/crsr/findtxt.test.ts src/unotools/source/i18n/textsearch.test.ts src/i18nutil/source/utility/casefolding.test.ts src/unotools/source/i18n/native-uppercase.test.ts
    Result: pass; 119 tests / 8 files. Scope: original native wildcard QA examples, both directional code-point loops, BMP/supplementary/disabled escapes, cache invalidation, substring/whole-selection, empty/folded endpoints, backward wrapper normalization and real Writer literal replacement with compound undo/redo. Independent dynamic programming checks 5270 pattern/text/interval combinations in both directions, requiring exact positive offsets and explicitly preserving the 32 source-derived whole-selection false negatives (WRITER-015).
    Command: npm run build
    Result: pass; production build/typecheck, standard existing large-chunk advisory. Evidence: output/playwright/writer-wildcard-checks/build.log (local ignored log). Initial typecheck against the unfinished helper caught readonly result assignment; the helper now returns the existing immutable SearchResult value shape and the final build passes.
    Command: scoped node_modules/.bin/eslint --max-warnings 0 and node_modules/.bin/prettier --check on every changed/new authored TypeScript/JSON/Markdown file; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass; exact command summaries in output/playwright/writer-wildcard-checks/check-0.log through check-11.log. Scoped final formatting/lint is rerun after the test expectation/observation text update. doctor retains the preexisting managed-hook-shim warning with zero errors. No dependency edge/config/guard changes were required because the native UTF16 iterator and search flag owner were already actual imports. No UI/resource files changed, so the after-UI resource check condition is not triggered at this checkpoint.
    Scope/evidence limits: read existing approved local source at pinned 9bc445578031fecf56086729d8e4940c77e14d65; no network or native binary build/execution. All source semantic states remain unverified. Remaining parent UI/focus/wrap/config/advanced-engine/layout responsibilities are still required; no skip or feature completion is claimed. Completion cadence remains four tasks since last full run; this intermediate checkpoint does not increment it.

    Weighted distance prerequisite checkpoint (parent remains DOING):
    Command: clang++ -std=c++17 -O0 -g output/playwright/writer-levdis-checks/native-levdis.cxx output/playwright/writer-levdis-checks/driver.cxx -o output/playwright/writer-levdis-checks/native-levdis
    Result: pass. Scope: isolated original WLevDistance C++ kernel. The copied original levdis.hxx only replaces the unavailable sal/types.h include with cstdint aliases sal_Unicode=char16_t and sal_Int32=int32_t; the copied original levdis.cxx only changes its header include path. Algorithm/header class declarations and method bodies are unchanged. A stdin/stdout driver constructs both the source original and copy constructor for every case; all 19600 pairs of results agree. Native input/output and copied source/driver remain in ignored local output/playwright/writer-levdis-checks. Frozen native-levdis-cases.json records the exact upstream commit/path/source SHA256, UTF16-unit tables, all counts and observed limits/results. These are real isolated native-kernel outputs; no complete LibreOffice binary/service was compiled or run.
    Command: from apps/office, npx vitest run src/i18npool/source/search/levdis.test.ts src/i18npool/source/search/textsearch.test.ts src/i18npool/source/search/textsearch-wildcard.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/sw/source/core/crsr/native-search-replace.test.ts
    Result: pass, 104 tests / 5 files. Scope: 19600 frozen original kernel cases plus copied calculators; independent full-matrix strict weights over 225 literal pairs; relaxed negative success; 2048 allocation boundary and repeated large/small inputs; copy/config independence; NUL-pointer and supplementary/isolated UTF16 behavior; affected shared wrapper/wildcard and Writer replacement integration. No full-suite run performed or due at this intermediate checkpoint.
    Command: npm run build; scoped node_modules/.bin/prettier --check and node_modules/.bin/eslint --max-warnings 0 on all new files; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass. Evidence: output/playwright/writer-levdis-checks/check-0.log through check-12.log; source-provenance and both registry checks subsequently pass in their *-final.log files after correcting the header-only GetLimit source symbol reference. Boundaries report 975 sources / 4501 imports / 146 existing edges; provenance reports 976 runtime modules. No dependency edge/config/guard/exemption changes required: levdis is the native independent numerical owner and imports no other runtime module. Existing doctor hook-shim warning remains with zero errors. No UI/resource file changed, so the after-UI resource-check condition is not triggered.
    Evidence limit: WLevDistance is a required independent prerequisite for native approximate search. TextSearch continues to reject approximate dispatch until actual BreakIterator/word traversal and locale/transliteration responsibilities are ported. Current native kernel evidence does not establish complete approximate search, configuration/defaults, UI or whole-module parity. All registry semantic states remain unverified; no parent/goal completion or approved skip is claimed. Completed-task cadence remains four after the last full run at 6a7dd8660.
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

    Subsequent approved-plan progress:
    - Native literal replacement/history leaf 202610201815-4586BY completed at implementation f3dc7a884c4f, closure 5100505d6394. Parent dependency is satisfied. Its supported no-bookmark profile, unsupported native content-index histories and WRITER-010/011 boundaries remain as recorded there.
    - Current checkpoint ports actual i18npool WildcardSrchFrwrd/WildcardSrchBkwrd, their source backtracking/substring/whole-selection/escape behavior and backward pattern cache into the original textsearch owner. GetWildcardReversePattern is only a private extraction of the source's inline backward preparation, not a separate compiler or service. Native default/result/UTF16 iterator/folding owners are reused. Source wildcard mode now reaches the existing shared wrapper and Writer Find_Text/replacement owners without a DOM or regex adapter.
    - Completed source-derived QA and independent recognition exposed WRITER-012 trailing-escape elimination and escape-only iterator precondition, WRITER-013 disabled NUL backward reordering, WRITER-014 folded empty-interval source offset behavior and WRITER-015 whole-selection greedy retry false negatives. All are documented and preserved. The independent recognizer remains a normal wildcard language definition; only the explicit native exception corpus is separately checked. These observations do not claim compiled native execution or a confirmed UI defect.
    - The initial independent test assumed normal whole-selection semantics and failed on the source retry branch; source audit established the missing string rewind and the exhaustive exception corpus is recorded. A test command referenced a nonexistent vitest.config.ts; it performed no tests, then the declared workspace command ran successfully. Initial typecheck flagged the unfinished mutable result helper; returning the repository's immutable SearchResult shape resolved it. No production fallback, gate change, language/locale default promotion or verification skip was introduced.
    - Full parent task remains active for shared search item/configuration, regex/approximate/transliteration dependencies, complete readonly/other-area/field/note/layout search, view command/wrap ownership and Find toolbar/Find and Replace dialog, shortcuts/focus/cancellation and browser evidence. Bookmark replacement still requires native DelContentIndex/history work. This checkpoint changes no storage/recovery/autosave deviation and does not count as a completed task for the ten-task full-run cadence.

    Weighted distance prerequisite progress:
    - Added the original i18npool/source/search/levdis owner with all weighted matrix, initial-column, threshold/early exit, joker escape/star, character-balance and relaxed SplitCount branches. Constructor input counts remain required in the public native overload; independent copy construction and GetLimit/CalcLPQR are retained. JS-owned typed arrays erase unique_ptr/storage only, including the source minimum-three-cell buffer and 2048 growth boundary. The valid native integer/pointer domain is retained; the NUL-termination precondition is explicit.
    - Actual isolated source compilation yielded 19600 native kernel values and matching native copy-constructor outputs; 587 of these are negative relaxed successes, an intentional source contract rather than an error. The TypeScript implementation and copies match every frozen value; independent strict mathematical checks also pass. No newly suspected upstream logic defect was found in this kernel, so the suspected-issues log is unchanged.
    - Native approximate search is not enabled early: full word segmentation/BreakIterator, service/locale and UI dependencies remain unimplemented. This owner is the real independent numerical prerequisite used by native TextSearch; no fake word segmentation, regex conversion, configured option provider or new public fallback was introduced. Kernel evidence is distinguished from full native app/service parity. Parent state remains DOING.
    - Initial lint caught two source-style separately declared constants; made them const without changing the loop order. Initial translation duplicated a this prefix in three threshold returns; corrected before the passing native matrix/build. Vite's JSON transformer rejected a lone surrogate in the fixture string table; storing all fixture text as explicit UTF16 unit arrays preserves embedded NUL/isolated-surrogate cases without changing native results. Provenance initially named GetLimit under levdis.cxx although it is inline in levdis.hxx; the class/header evidence remains, and the .cxx symbol list now names only actual .cxx symbols. All affected checks pass after those corrections; no validation gate was weakened.
    - Five new non-task paths implement this checkpoint (runtime owner, test, frozen native values and two provenance/runtime records), within the approved parent allowance plus the gateway's five-file scope tolerance. This checkpoint does not close an AgentPlane task or advance the ten-task full-run counter. Future substantial state/view/UI work should continue in a separately scoped implementation leaf when adding beyond this boundary, preserving the approved overall feature.

    Bookmark/history implementation leaf V6W22V now implements the previously pending ordinary collapsed bookmark profile: native DelContentIndex/SwHistoryBookmark, replacement wrapper/Impl, prefix/suffix rollback and fresh redo recollection. Blanket bookmark rejection is removed for the actual represented model; expanded/typed/metadata histories remain pending. Native Replace index exceptions and old ordinary fragment/construction adapter mode separation preserve bookmark endpoints and ODT/browser consumers. Required leaf checks pass (5059 core, 96 integration, final focused checks, production build/static/registries). WRITER-016 recording-dependent deletion is preserved/documented, and WRITER-010 remains unchanged. The parent feature/UI and whole Writer goal remain active; this leaf's closure increments the cadence to five completed tasks since the last full run.
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

Wildcard engine checkpoint (parent remains DOING; not overall task verification):
Command: from apps/office, npx vitest run src/i18npool/source/search/textsearch-wildcard.test.ts src/i18npool/source/search/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/core/crsr/findtxt.test.ts src/unotools/source/i18n/textsearch.test.ts src/i18nutil/source/utility/casefolding.test.ts src/unotools/source/i18n/native-uppercase.test.ts
Result: pass; 119 tests / 8 files. Scope: original native wildcard QA examples, both directional code-point loops, BMP/supplementary/disabled escapes, cache invalidation, substring/whole-selection, empty/folded endpoints, backward wrapper normalization and real Writer literal replacement with compound undo/redo. Independent dynamic programming checks 5270 pattern/text/interval combinations in both directions, requiring exact positive offsets and explicitly preserving the 32 source-derived whole-selection false negatives (WRITER-015).
Command: npm run build
Result: pass; production build/typecheck, standard existing large-chunk advisory. Evidence: output/playwright/writer-wildcard-checks/build.log (local ignored log). Initial typecheck against the unfinished helper caught readonly result assignment; the helper now returns the existing immutable SearchResult value shape and the final build passes.
Command: scoped node_modules/.bin/eslint --max-warnings 0 and node_modules/.bin/prettier --check on every changed/new authored TypeScript/JSON/Markdown file; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass; exact command summaries in output/playwright/writer-wildcard-checks/check-0.log through check-11.log. Scoped final formatting/lint is rerun after the test expectation/observation text update. doctor retains the preexisting managed-hook-shim warning with zero errors. No dependency edge/config/guard changes were required because the native UTF16 iterator and search flag owner were already actual imports. No UI/resource files changed, so the after-UI resource check condition is not triggered at this checkpoint.
Scope/evidence limits: read existing approved local source at pinned 9bc445578031fecf56086729d8e4940c77e14d65; no network or native binary build/execution. All source semantic states remain unverified. Remaining parent UI/focus/wrap/config/advanced-engine/layout responsibilities are still required; no skip or feature completion is claimed. Completion cadence remains four tasks since last full run; this intermediate checkpoint does not increment it.

Weighted distance prerequisite checkpoint (parent remains DOING):
Command: clang++ -std=c++17 -O0 -g output/playwright/writer-levdis-checks/native-levdis.cxx output/playwright/writer-levdis-checks/driver.cxx -o output/playwright/writer-levdis-checks/native-levdis
Result: pass. Scope: isolated original WLevDistance C++ kernel. The copied original levdis.hxx only replaces the unavailable sal/types.h include with cstdint aliases sal_Unicode=char16_t and sal_Int32=int32_t; the copied original levdis.cxx only changes its header include path. Algorithm/header class declarations and method bodies are unchanged. A stdin/stdout driver constructs both the source original and copy constructor for every case; all 19600 pairs of results agree. Native input/output and copied source/driver remain in ignored local output/playwright/writer-levdis-checks. Frozen native-levdis-cases.json records the exact upstream commit/path/source SHA256, UTF16-unit tables, all counts and observed limits/results. These are real isolated native-kernel outputs; no complete LibreOffice binary/service was compiled or run.
Command: from apps/office, npx vitest run src/i18npool/source/search/levdis.test.ts src/i18npool/source/search/textsearch.test.ts src/i18npool/source/search/textsearch-wildcard.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/sw/source/core/crsr/native-search-replace.test.ts
Result: pass, 104 tests / 5 files. Scope: 19600 frozen original kernel cases plus copied calculators; independent full-matrix strict weights over 225 literal pairs; relaxed negative success; 2048 allocation boundary and repeated large/small inputs; copy/config independence; NUL-pointer and supplementary/isolated UTF16 behavior; affected shared wrapper/wildcard and Writer replacement integration. No full-suite run performed or due at this intermediate checkpoint.
Command: npm run build; scoped node_modules/.bin/prettier --check and node_modules/.bin/eslint --max-warnings 0 on all new files; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass. Evidence: output/playwright/writer-levdis-checks/check-0.log through check-12.log; source-provenance and both registry checks subsequently pass in their *-final.log files after correcting the header-only GetLimit source symbol reference. Boundaries report 975 sources / 4501 imports / 146 existing edges; provenance reports 976 runtime modules. No dependency edge/config/guard/exemption changes required: levdis is the native independent numerical owner and imports no other runtime module. Existing doctor hook-shim warning remains with zero errors. No UI/resource file changed, so the after-UI resource-check condition is not triggered.
Evidence limit: WLevDistance is a required independent prerequisite for native approximate search. TextSearch continues to reject approximate dispatch until actual BreakIterator/word traversal and locale/transliteration responsibilities are ported. Current native kernel evidence does not establish complete approximate search, configuration/defaults, UI or whole-module parity. All registry semantic states remain unverified; no parent/goal completion or approved skip is claimed. Completed-task cadence remains four after the last full run at 6a7dd8660.

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

Subsequent approved-plan progress:
- Native literal replacement/history leaf 202610201815-4586BY completed at implementation f3dc7a884c4f, closure 5100505d6394. Parent dependency is satisfied. Its supported no-bookmark profile, unsupported native content-index histories and WRITER-010/011 boundaries remain as recorded there.
- Current checkpoint ports actual i18npool WildcardSrchFrwrd/WildcardSrchBkwrd, their source backtracking/substring/whole-selection/escape behavior and backward pattern cache into the original textsearch owner. GetWildcardReversePattern is only a private extraction of the source's inline backward preparation, not a separate compiler or service. Native default/result/UTF16 iterator/folding owners are reused. Source wildcard mode now reaches the existing shared wrapper and Writer Find_Text/replacement owners without a DOM or regex adapter.
- Completed source-derived QA and independent recognition exposed WRITER-012 trailing-escape elimination and escape-only iterator precondition, WRITER-013 disabled NUL backward reordering, WRITER-014 folded empty-interval source offset behavior and WRITER-015 whole-selection greedy retry false negatives. All are documented and preserved. The independent recognizer remains a normal wildcard language definition; only the explicit native exception corpus is separately checked. These observations do not claim compiled native execution or a confirmed UI defect.
- The initial independent test assumed normal whole-selection semantics and failed on the source retry branch; source audit established the missing string rewind and the exhaustive exception corpus is recorded. A test command referenced a nonexistent vitest.config.ts; it performed no tests, then the declared workspace command ran successfully. Initial typecheck flagged the unfinished mutable result helper; returning the repository's immutable SearchResult shape resolved it. No production fallback, gate change, language/locale default promotion or verification skip was introduced.
- Full parent task remains active for shared search item/configuration, regex/approximate/transliteration dependencies, complete readonly/other-area/field/note/layout search, view command/wrap ownership and Find toolbar/Find and Replace dialog, shortcuts/focus/cancellation and browser evidence. Bookmark replacement still requires native DelContentIndex/history work. This checkpoint changes no storage/recovery/autosave deviation and does not count as a completed task for the ten-task full-run cadence.

Weighted distance prerequisite progress:
- Added the original i18npool/source/search/levdis owner with all weighted matrix, initial-column, threshold/early exit, joker escape/star, character-balance and relaxed SplitCount branches. Constructor input counts remain required in the public native overload; independent copy construction and GetLimit/CalcLPQR are retained. JS-owned typed arrays erase unique_ptr/storage only, including the source minimum-three-cell buffer and 2048 growth boundary. The valid native integer/pointer domain is retained; the NUL-termination precondition is explicit.
- Actual isolated source compilation yielded 19600 native kernel values and matching native copy-constructor outputs; 587 of these are negative relaxed successes, an intentional source contract rather than an error. The TypeScript implementation and copies match every frozen value; independent strict mathematical checks also pass. No newly suspected upstream logic defect was found in this kernel, so the suspected-issues log is unchanged.
- Native approximate search is not enabled early: full word segmentation/BreakIterator, service/locale and UI dependencies remain unimplemented. This owner is the real independent numerical prerequisite used by native TextSearch; no fake word segmentation, regex conversion, configured option provider or new public fallback was introduced. Kernel evidence is distinguished from full native app/service parity. Parent state remains DOING.
- Initial lint caught two source-style separately declared constants; made them const without changing the loop order. Initial translation duplicated a this prefix in three threshold returns; corrected before the passing native matrix/build. Vite's JSON transformer rejected a lone surrogate in the fixture string table; storing all fixture text as explicit UTF16 unit arrays preserves embedded NUL/isolated-surrogate cases without changing native results. Provenance initially named GetLimit under levdis.cxx although it is inline in levdis.hxx; the class/header evidence remains, and the .cxx symbol list now names only actual .cxx symbols. All affected checks pass after those corrections; no validation gate was weakened.
- Five new non-task paths implement this checkpoint (runtime owner, test, frozen native values and two provenance/runtime records), within the approved parent allowance plus the gateway's five-file scope tolerance. This checkpoint does not close an AgentPlane task or advance the ten-task full-run counter. Future substantial state/view/UI work should continue in a separately scoped implementation leaf when adding beyond this boundary, preserving the approved overall feature.

Bookmark/history implementation leaf V6W22V now implements the previously pending ordinary collapsed bookmark profile: native DelContentIndex/SwHistoryBookmark, replacement wrapper/Impl, prefix/suffix rollback and fresh redo recollection. Blanket bookmark rejection is removed for the actual represented model; expanded/typed/metadata histories remain pending. Native Replace index exceptions and old ordinary fragment/construction adapter mode separation preserve bookmark endpoints and ODT/browser consumers. Required leaf checks pass (5059 core, 96 integration, final focused checks, production build/static/registries). WRITER-016 recording-dependent deletion is preserved/documented, and WRITER-010 remains unchanged. The parent feature/UI and whole Writer goal remain active; this leaf's closure increments the cadence to five completed tasks since the last full run.
