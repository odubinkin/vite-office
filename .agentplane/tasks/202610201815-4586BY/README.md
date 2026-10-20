---
id: "202610201815-4586BY"
title: "Implement Writer native text replacement and undo"
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
  updated_at: "2026-10-20T18:15:49.628Z"
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
    body: "Start: implement the approved search/replace plan's coherent native document replacement and history leaf, with real node/hint/index owners, source undo placement and targeted verification on writer."
events:
  -
    type: "status"
    at: "2026-10-20T18:15:52.421Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved search/replace plan's coherent native document replacement and history leaf, with real node/hint/index owners, source undo placement and targeted verification on writer."
doc_version: 3
doc_updated_at: "2026-10-20T18:15:52.421Z"
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
  Verification: "Pending implementation. Parent core search checkpoint is 19f96fc17af0; branch and working tree were clean at leaf planning."
  Rollback Plan: "Revert only this leaf's implementation commit(s) and task closure artifacts; preserve parent search groundwork, user work, source reference links and other tasks. No resets, merges, destructive cleanup or outside-repository writes."
  Findings: "Source review shows native SwUndoReplace belongs to unins.cxx, while the old portable fragment-shaped action lives in undel.ts. Native ReplaceRange owns undo and invokes ReplaceText; native ReplaceText uses differential UpdateMode operations and manually advances the supplied start index when deleting and inserting nonempty text. It does not replace all hints with an imported fragment. This dependency needs its own document/history verification boundary within the already approved feature. Plain search, parent API and full goal remain incomplete until the other parent deliverables are implemented."
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

Pending implementation. Parent core search checkpoint is 19f96fc17af0; branch and working tree were clean at leaf planning.

## Rollback Plan

Revert only this leaf's implementation commit(s) and task closure artifacts; preserve parent search groundwork, user work, source reference links and other tasks. No resets, merges, destructive cleanup or outside-repository writes.

## Findings

Source review shows native SwUndoReplace belongs to unins.cxx, while the old portable fragment-shaped action lives in undel.ts. Native ReplaceRange owns undo and invokes ReplaceText; native ReplaceText uses differential UpdateMode operations and manually advances the supplied start index when deleting and inserting nonempty text. It does not replace all hints with an imported fragment. This dependency needs its own document/history verification boundary within the already approved feature. Plain search, parent API and full goal remain incomplete until the other parent deliverables are implemented.
