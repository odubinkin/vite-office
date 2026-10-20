---
id: "202610201815-4586BY"
title: "Implement Writer native text replacement and undo"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-20T18:15:49.628Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T18:44:24.930Z"
  updated_by: "CODER"
  note: "Native literal replacement, differential hints/indices, source undo placement and FindAll no-ring/threshold behavior verified. Focused suites: 4731 core, 22 search, 127 integration and 290 hint-update cases; build/static/registry checks pass. Source quirks WRITER-010/011 preserved. Parent UI/advanced modes remain open; no native binary parity claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T18:45:10.203Z"
  updated_by: "EVALUATOR"
  note: "The approved normal text replacement/history leaf meets its bounded verification contract at f3dc7a884c4f; parent search UI and advanced modes remain open."
  evaluated_sha: "f3dc7a884c4fd2ebb60e54ecf3c820a34f198dca"
  blueprint_digest: "a604a98b13161d920db910f89b3624cddfba840ab541db3a104434d45f930290"
  evidence_refs:
    - ".agentplane/tasks/202610201815-4586BY/README.md"
    - ".agentplane/tasks/202610201815-4586BY/quality/20261020-184510203-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201815-4586BY/quality/20261020-184510203-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201815-4586BY/quality/20261020-184510203-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201815-4586BY/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/crsr/native-search-replace.test.ts"
    - "apps/office/src/sw/source/core/txtnode/native-replace-text.test.ts"
    - "output/playwright/writer-replace-checks/npm-run.log"
    - "output/playwright/writer-replace-checks/check-dependencies.log"
  findings:
    - "Actual node hints/index updates, source unins undo ownership, existing fragment-action composition and native no-ring/group/threshold boundaries are implemented and covered by focused regressions. WRITER-010 and WRITER-011 preserve suspicious source semantics rather than correcting upstream."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved search/replace plan's coherent native document replacement and history leaf, with real node/hint/index owners, source undo placement and targeted verification on writer."
events:
  -
    type: "status"
    at: "2026-10-20T18:15:52.421Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved search/replace plan's coherent native document replacement and history leaf, with real node/hint/index owners, source undo placement and targeted verification on writer."
  -
    type: "verify"
    at: "2026-10-20T18:44:24.930Z"
    author: "CODER"
    state: "ok"
    note: "Native literal replacement, differential hints/indices, source undo placement and FindAll no-ring/threshold behavior verified. Focused suites: 4731 core, 22 search, 127 integration and 290 hint-update cases; build/static/registry checks pass. Source quirks WRITER-010/011 preserved. Parent UI/advanced modes remain open; no native binary parity claim."
doc_version: 3
doc_updated_at: "2026-10-20T18:44:25.026Z"
doc_updated_by: "CODER"
description: "Implementation leaf of user-approved Writer search/replace plan 202610201742-6B984M. Port actual SwTextNode ReplaceText, document string ReplaceRange and native unins SwUndoReplace with whole-hint history; replace the old fragment-shaped SwUndoReplace use with existing insertion/deletion/attribute actions. Connect plain model-text search replacement and Replace All count/progress/no-ring/undo grouping to real document owners. Verify source-sensitive attributes, cursor updates, selection/cell ranges and repeated undo/redo. Writer checkout and branch only; local upstream reading approved, no network/merge/publication. Parent feature remains open for further modes and UI."
sections:
  Summary: "Implement the native Writer text replacement/document/undo block required by approved parent feature 202610201742-6B984M. This is a substantial core implementation leaf, not a claim that search UI or all search modes are complete."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer on writer. Up to 60 non-task paths in Writer text-node/hints, content operations, unins/undel/history, cursor search/ranges, existing fragment callers and their tests/provenance/runtime records, source-backed dependency data and suspected-issue log if needed. User approved this search/replace plan and local upstream reading. No network, merges, external writes, new storage/recovery behavior or unrelated Calc changes. Implement actual normal same-node string replacement and represented search scopes, including empty/unchanged strings and actual hint/index update semantics. Preserve unsupported structured/redline/dummy/regex responsibilities as explicit boundaries rather than inventing results. Parent retains the full advanced-mode/config/view/UI deliverables."
  Plan: "Implement actual native ReplaceText, string document ReplaceRange and unins SwUndoReplace with complete hint history/SetEnd; refactor obsolete fragment-shaped undo into existing actions, connect native plain search replacement/no-ring/progress/grouped history, verify related modules and source contracts. This leaf is within the user-approved parent plan; advanced search modes and UI remain parent work."
  Verify Steps: |-
    - Run targeted Vitest node/hint replacement cases (new native-replace-text tests), existing insertion/ignore-expansion/hint-update tests, original Writer model/content-operation tests and affected fragment/paste/undo cases.
    - Run targeted search replacement cases for forward/backward, growing/empty/identical replacements, registered selection limits/rings and table text, FIND_NO_RING count/progress, one compound undo and repeated undo/redo with whole-hint restoration and modified state.
    - Run npm run build. Run scoped ESLint --max-warnings 0 and Prettier --check on changed/new authored files.
    - Run npm run check:dependencies, npm run check:source-provenance, npm run check:source-tree, npm run check:docs, npm run check:file-size. Run registry parity checks for writer/shared with verbose JSON redirected to ignored logs, and targeted boundary tooling tests if dependency data changes.
    - Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and git status --short --untracked-files=all. Review the actual pinned normal branches in ndtxt.cxx, DocumentContentOperationsManager.cxx, unins.cxx, findtxt.cxx and swcrsr.cxx. Record portable/source-contract evidence separately from compiled native execution.
    - Keep parent advanced-mode/UI requirements open. No full test run is due until the user's ten-completed-task cadence reaches its next boundary; determine the completed-task count from the last recorded full run before finishing this leaf.
  Verification: |-
    Command: from apps/office, npx vitest run src/sw/source/core/txtnode/native-replace-text.test.ts src/sw/source/core/txtnode/native-insert-flags.test.ts src/sw/source/core/txtnode/native-ignore-hint-expansion.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/crsr/findtxt.test.ts src/svl/source/undo/undo.test.ts
    Result: pass; 4731 tests in 7 files. Scope: real node/index/hint updates, old model/fragment/undo integration and shared undo lists.

    Command: from apps/office, npx vitest run src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/core/crsr/findtxt.test.ts
    Result: pass; 22 tests in 2 files (13 new replacement cases, 9 existing search cases). Scope: actual forward/backward literal replacement, selection limits, table text, empty/unchanged text, whole-hint history, source quirks, modified state and native 60000-response branches. Threshold fixture invokes the actual generic FindAll against registered model indices, not 60000 expensive text searches.

    Command: from apps/office, npx vitest run src/sw/source/uibase/wrtsh/wrtsh1.test.ts src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts src/sw/browser/editor/native-clipboard-lists.test.tsx src/sw/browser/editor/writer-font-family.test.ts src/sw/source/core/doc/native-font-family-state.test.ts src/sw/source/core/doc/text-hint-copy.test.ts src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/undo/native-format-change-history.test.ts src/sw/source/uibase/app/docsh.test.ts
    Result: pass; 127 tests in 9 files. Scope: affected clipboard, shell, attributes/font extraction, history and document-modified integration.

    Command: from apps/office, npx vitest run src/sw/source/core/txtnode/native-text-hint-update.test.ts
    Result: pass; 290 tests in 1 file. Scope: preexisting native hint update matrix.

    Command: npm run build; scoped node_modules/.bin/eslint --max-warnings 0 on every changed/new TypeScript file; node_modules/.bin/prettier --check on every changed/new non-task authored file.
    Result: pass. Evidence: ignored local logs output/playwright/writer-replace-checks/npm-run.log, prettier---check.log and eslint-apps-office-src-svl-source-undo-undo.test.ts.log. Scope: office typecheck/production build and changed-source static checks; all four final metadata edits separately passed formatting.

    Command: npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared.
    Result: pass. Evidence: corresponding compact command logs in output/playwright/writer-replace-checks; verbose parity JSON redirected there. Scope: 974 source modules / 4501 imports / 146 dependency edges, 975 provenance records, source layout, docs and authored file-size gates. No dependency data or algorithm changes, so conditional dependency-tool tests were not triggered.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.
    Result: pass. doctor has zero errors and the preexisting managed-hook-shim warning; routing passes. Final post-commit status is recorded by closure. Scope: repository process and intentional task paths.

    Evidence class: pinned source-contract review at LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 plus portable TypeScript tests. No LibreOffice binary was built or run; no native compiled parity claim. Actual source branches reviewed: ndtxt.cxx ReplaceText; DocumentContentOperationsManager.cxx ReplaceRange/ReplaceRangeImpl; unins.cxx SwUndoReplace; findtxt.cxx SwFindParaText/Find_Text; swcrsr.cxx lcl_FindSelection/FindAll; undomanager.cxx ClearAllLevels.

    Full-suite cadence: last full run is 202610182155-98VCB0, checkpoint 6a7dd8660, 17055 cases plus tooling/e2e. git log --oneline --grep=close: 6a7dd8660..HEAD shows three completed task closes (1KGJBF, RX4J1N, 3F5N65). This leaf is the fourth completion; the next full run is due at ten. Following the user's cadence, no additional full-suite run is due here.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T18:44:24.930Z — VERIFY — ok

    By: CODER

    Note: Native literal replacement, differential hints/indices, source undo placement and FindAll no-ring/threshold behavior verified. Focused suites: 4731 core, 22 search, 127 integration and 290 hint-update cases; build/static/registry checks pass. Source quirks WRITER-010/011 preserved. Parent UI/advanced modes remain open; no native binary parity claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T18:44:24.036Z, excerpt_hash=sha256:7a6138b10d4bd0f428e732ce225f085f183f9a25f686513b4befd8d611645575

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610201815-4586BY/blueprint/resolved-snapshot.json
    - old_digest: a604a98b13161d920db910f89b3624cddfba840ab541db3a104434d45f930290
    - current_digest: a604a98b13161d920db910f89b3624cddfba840ab541db3a104434d45f930290
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201815-4586BY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201815-4586BY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf's implementation commit(s) and task closure artifacts; preserve parent search groundwork, user work, source reference links and other tasks. No resets, merges, destructive cleanup or outside-repository writes."
  Findings: |-
    Native SwUndoReplace now belongs to unins, retaining source strings, numeric node coordinates, actual SetEnd and complete represented hint history. Existing rich-fragment replacement composes insertion/deletion/attribute actions rather than pretending to be the native string action. ReplaceText keeps real hint identities and uses source differential index updates; the helper extraction only relocates existing pure formatting/alignment bodies to the existing ndtxt-hints shard to meet the authored size gate.

    WRITER-010 documents the consumed temporary hint-history end on repeated replacement undo. WRITER-011 documents source next/previous content-node progress at offset zero after unchanged replacement boundaries. Both source behaviors are preserved and covered by portable tests; neither is asserted to be confirmed in a compiled native binary. No workaround, semantic promotion or policy exemption was introduced.

    Supported leaf profile: normal literal same-text-node replacement, existing represented body/selection/table text search and actual FIND_NO_RING/progress/threshold/undo grouping. Unsupported regex/other algorithms, notes, merged layout/fields/dummy characters, cross-node replacement/content-index histories, bookmarks/redlines and native descriptive undo localization remain parent 6B984M work. Search and string document replacement reject documents with bookmarks before mutation/opening history because native DelContentIndex/SwHistoryBookmark is absent. This explicit incomplete boundary is not native bookmark parity. Direct source undo is internal to the supported document replacement profile. No storage/recovery/autosave deviation changed.

    Source responsibility/status records remain unverified; this bounded implementation does not complete the parent UI feature or the Writer goal. Build, focused regression suites, static checks and registry checks passed. Two local evidence-update command typos (metadata key and working-directory-relative path) made no file changes before correction; route was recomputed, then evidence updates and checks completed.
id_source: "generated"
---
## Summary

Implement the native Writer text replacement/document/undo block required by approved parent feature 202610201742-6B984M. This is a substantial core implementation leaf, not a claim that search UI or all search modes are complete.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer on writer. Up to 60 non-task paths in Writer text-node/hints, content operations, unins/undel/history, cursor search/ranges, existing fragment callers and their tests/provenance/runtime records, source-backed dependency data and suspected-issue log if needed. User approved this search/replace plan and local upstream reading. No network, merges, external writes, new storage/recovery behavior or unrelated Calc changes. Implement actual normal same-node string replacement and represented search scopes, including empty/unchanged strings and actual hint/index update semantics. Preserve unsupported structured/redline/dummy/regex responsibilities as explicit boundaries rather than inventing results. Parent retains the full advanced-mode/config/view/UI deliverables.

## Plan

Implement actual native ReplaceText, string document ReplaceRange and unins SwUndoReplace with complete hint history/SetEnd; refactor obsolete fragment-shaped undo into existing actions, connect native plain search replacement/no-ring/progress/grouped history, verify related modules and source contracts. This leaf is within the user-approved parent plan; advanced search modes and UI remain parent work.

## Verify Steps

- Run targeted Vitest node/hint replacement cases (new native-replace-text tests), existing insertion/ignore-expansion/hint-update tests, original Writer model/content-operation tests and affected fragment/paste/undo cases.
- Run targeted search replacement cases for forward/backward, growing/empty/identical replacements, registered selection limits/rings and table text, FIND_NO_RING count/progress, one compound undo and repeated undo/redo with whole-hint restoration and modified state.
- Run npm run build. Run scoped ESLint --max-warnings 0 and Prettier --check on changed/new authored files.
- Run npm run check:dependencies, npm run check:source-provenance, npm run check:source-tree, npm run check:docs, npm run check:file-size. Run registry parity checks for writer/shared with verbose JSON redirected to ignored logs, and targeted boundary tooling tests if dependency data changes.
- Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and git status --short --untracked-files=all. Review the actual pinned normal branches in ndtxt.cxx, DocumentContentOperationsManager.cxx, unins.cxx, findtxt.cxx and swcrsr.cxx. Record portable/source-contract evidence separately from compiled native execution.
- Keep parent advanced-mode/UI requirements open. No full test run is due until the user's ten-completed-task cadence reaches its next boundary; determine the completed-task count from the last recorded full run before finishing this leaf.

## Verification

Command: from apps/office, npx vitest run src/sw/source/core/txtnode/native-replace-text.test.ts src/sw/source/core/txtnode/native-insert-flags.test.ts src/sw/source/core/txtnode/native-ignore-hint-expansion.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/crsr/findtxt.test.ts src/svl/source/undo/undo.test.ts
Result: pass; 4731 tests in 7 files. Scope: real node/index/hint updates, old model/fragment/undo integration and shared undo lists.

Command: from apps/office, npx vitest run src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/core/crsr/findtxt.test.ts
Result: pass; 22 tests in 2 files (13 new replacement cases, 9 existing search cases). Scope: actual forward/backward literal replacement, selection limits, table text, empty/unchanged text, whole-hint history, source quirks, modified state and native 60000-response branches. Threshold fixture invokes the actual generic FindAll against registered model indices, not 60000 expensive text searches.

Command: from apps/office, npx vitest run src/sw/source/uibase/wrtsh/wrtsh1.test.ts src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts src/sw/browser/editor/native-clipboard-lists.test.tsx src/sw/browser/editor/writer-font-family.test.ts src/sw/source/core/doc/native-font-family-state.test.ts src/sw/source/core/doc/text-hint-copy.test.ts src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/undo/native-format-change-history.test.ts src/sw/source/uibase/app/docsh.test.ts
Result: pass; 127 tests in 9 files. Scope: affected clipboard, shell, attributes/font extraction, history and document-modified integration.

Command: from apps/office, npx vitest run src/sw/source/core/txtnode/native-text-hint-update.test.ts
Result: pass; 290 tests in 1 file. Scope: preexisting native hint update matrix.

Command: npm run build; scoped node_modules/.bin/eslint --max-warnings 0 on every changed/new TypeScript file; node_modules/.bin/prettier --check on every changed/new non-task authored file.
Result: pass. Evidence: ignored local logs output/playwright/writer-replace-checks/npm-run.log, prettier---check.log and eslint-apps-office-src-svl-source-undo-undo.test.ts.log. Scope: office typecheck/production build and changed-source static checks; all four final metadata edits separately passed formatting.

Command: npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared.
Result: pass. Evidence: corresponding compact command logs in output/playwright/writer-replace-checks; verbose parity JSON redirected there. Scope: 974 source modules / 4501 imports / 146 dependency edges, 975 provenance records, source layout, docs and authored file-size gates. No dependency data or algorithm changes, so conditional dependency-tool tests were not triggered.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.
Result: pass. doctor has zero errors and the preexisting managed-hook-shim warning; routing passes. Final post-commit status is recorded by closure. Scope: repository process and intentional task paths.

Evidence class: pinned source-contract review at LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 plus portable TypeScript tests. No LibreOffice binary was built or run; no native compiled parity claim. Actual source branches reviewed: ndtxt.cxx ReplaceText; DocumentContentOperationsManager.cxx ReplaceRange/ReplaceRangeImpl; unins.cxx SwUndoReplace; findtxt.cxx SwFindParaText/Find_Text; swcrsr.cxx lcl_FindSelection/FindAll; undomanager.cxx ClearAllLevels.

Full-suite cadence: last full run is 202610182155-98VCB0, checkpoint 6a7dd8660, 17055 cases plus tooling/e2e. git log --oneline --grep=close: 6a7dd8660..HEAD shows three completed task closes (1KGJBF, RX4J1N, 3F5N65). This leaf is the fourth completion; the next full run is due at ten. Following the user's cadence, no additional full-suite run is due here.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T18:44:24.930Z — VERIFY — ok

By: CODER

Note: Native literal replacement, differential hints/indices, source undo placement and FindAll no-ring/threshold behavior verified. Focused suites: 4731 core, 22 search, 127 integration and 290 hint-update cases; build/static/registry checks pass. Source quirks WRITER-010/011 preserved. Parent UI/advanced modes remain open; no native binary parity claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T18:44:24.036Z, excerpt_hash=sha256:7a6138b10d4bd0f428e732ce225f085f183f9a25f686513b4befd8d611645575

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610201815-4586BY/blueprint/resolved-snapshot.json
- old_digest: a604a98b13161d920db910f89b3624cddfba840ab541db3a104434d45f930290
- current_digest: a604a98b13161d920db910f89b3624cddfba840ab541db3a104434d45f930290
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201815-4586BY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201815-4586BY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf's implementation commit(s) and task closure artifacts; preserve parent search groundwork, user work, source reference links and other tasks. No resets, merges, destructive cleanup or outside-repository writes.

## Findings

Native SwUndoReplace now belongs to unins, retaining source strings, numeric node coordinates, actual SetEnd and complete represented hint history. Existing rich-fragment replacement composes insertion/deletion/attribute actions rather than pretending to be the native string action. ReplaceText keeps real hint identities and uses source differential index updates; the helper extraction only relocates existing pure formatting/alignment bodies to the existing ndtxt-hints shard to meet the authored size gate.

WRITER-010 documents the consumed temporary hint-history end on repeated replacement undo. WRITER-011 documents source next/previous content-node progress at offset zero after unchanged replacement boundaries. Both source behaviors are preserved and covered by portable tests; neither is asserted to be confirmed in a compiled native binary. No workaround, semantic promotion or policy exemption was introduced.

Supported leaf profile: normal literal same-text-node replacement, existing represented body/selection/table text search and actual FIND_NO_RING/progress/threshold/undo grouping. Unsupported regex/other algorithms, notes, merged layout/fields/dummy characters, cross-node replacement/content-index histories, bookmarks/redlines and native descriptive undo localization remain parent 6B984M work. Search and string document replacement reject documents with bookmarks before mutation/opening history because native DelContentIndex/SwHistoryBookmark is absent. This explicit incomplete boundary is not native bookmark parity. Direct source undo is internal to the supported document replacement profile. No storage/recovery/autosave deviation changed.

Source responsibility/status records remain unverified; this bounded implementation does not complete the parent UI feature or the Writer goal. Build, focused regression suites, static checks and registry checks passed. Two local evidence-update command typos (metadata key and working-directory-relative path) made no file changes before correction; route was recomputed, then evidence updates and checks completed.
