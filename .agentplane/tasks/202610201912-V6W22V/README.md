---
id: "202610201912-V6W22V"
title: "Implement Writer bookmark replacement history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T19:15:12.426Z"
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
    body: "Start: implement the approved native bookmark/content-index replacement history leaf, preserving original recording and hint-history behavior on writer."
events:
  -
    type: "status"
    at: "2026-10-20T19:15:21.724Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native bookmark/content-index replacement history leaf, preserving original recording and hint-history behavior on writer."
doc_version: 3
doc_updated_at: "2026-10-20T19:15:21.724Z"
doc_updated_by: "CODER"
description: "Implementation leaf of approved Writer search/replace plan 202610201742-6B984M. Port native represented bookmark DelContentIndex/SwHistoryBookmark ownership and replacement history partition/moves. Refactor actual replacement wrapper/Impl boundaries and remove blanket bookmark rejection only after source-backed undo/redo is implemented. Keep unsupported expanded/type/metadata responsibilities explicit; preserve source quirks. Writer checkout/branch only, approved local upstream reads, no network/merges/storage changes."
sections:
  Summary: "Implement the existing collapsed bookmark model in native Writer replacement history, required by approved parent search/replace plan 202610201742-6B984M. Remove the blanket document bookmark rejection after the actual source history paths are implemented. This leaf does not complete the parent UI/advanced search feature."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer on writer. Up to 60 non-task paths in Writer docbm bookmark position contracts and their filter/shell/browser callers, content-index Replace updates, SwUndoSaveContent/DelContentType, SwHistoryBookmark/Move, unins replacement wrapper/Impl and affected document/search owners, focused tests, provenance/runtime records and suspected-issue log. User approved the overall search/replace plan and local source reading. No network, merges, outside writes, document storage/recovery changes or unrelated Calc work. Existing bookmarks are collapsed ordinary names/positions; expanded marks, UNO/cross-reference/annotation/field types and unrepresented keycode/metadata/fly/footnote/redline histories remain explicitly unported. No fabricated mark class hierarchy or unsupported success."
  Plan: "Implement the source bookmark/content-index/history block of approved search/replace plan: actual DelContentIndex and history partition/moves, native replacement wrapper/Impl, consumed mark position/boundary contracts and related integration verification. Parent retains full UI and unsupported modes."
  Verify Steps: |-
    - Run new focused native bookmark/history tests for collapsed positions before/start/inside/end/after a same-node range, forward/backward all replacement, growing/shrinking/empty/identical strings, same-name recreation, numeric current-node restoration, CheckNoCntnt/Bkm flags, history Move order/temporary-end counters and repeated undo/redo with both bookmark and attribute histories.
    - Run affected existing search/replacement/node-index/hint/history/model tests, bookmark shell/filter/ODT and browser tests; preserve native no-bookmark WRITER-010 behavior and exact unsupported boundaries.
    - Run npm run build, scoped ESLint --max-warnings 0 and Prettier --check on all changed/new authored files; npm run check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared (redirect verbose JSON to ignored logs). Run affected dependency tooling only if dependency data changes.
    - Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check and git status --short --untracked-files=all. Review pinned undobj.cxx/undobj.hxx, rolbck.cxx/rolbck.hxx, unins.cxx, ndtxt.cxx and document replacement branches; distinguish source/portable checks from compiled native execution. Preserve and document suspected source logic rather than correcting it.
    - Determine the full-run cadence from last full run 6a7dd8660/202610182155-98VCB0. Four completed tasks have followed it so far; this leaf is the fifth and no full run is due unless authoritative history changes. Parent view/config/advanced-mode/UI requirements remain open.
  Verification: "Pending implementation. Parent prerequisite checkpoints 19f96fc17af0, f3dc7a884c4f, f171609c38b3 and 84290ad4dc64 are committed; checkout was clean on writer at planning. No native bookmark binary parity claim."
  Rollback Plan: "Revert only the implementation commits of this leaf and its task artifacts. Preserve other tasks, parent search/kernel checkpoints and user work. No resets, merges, destructive cleanup or outside-repository writes."
  Findings: "Native normal replacement records DelContentIndex only when undo recording creates SwUndoReplace. Its collapsed ordinary bookmark profile records/deletes positions in [start,end), including start but excluding end; with undo disabled this constructor is absent and normal ReplaceText retains live marks. SwUndoReplace::Impl owns history partition m_nSetPos; undo moves hint suffix away before destructive bookmark rollback, then moves it back, and redo collects fresh mark history and prepends it. SwHistory::Move moves ownership without resetting either temporary-end counter, including an early return for an empty source. The existing before-affinity bookmark representation also misses the native UpdateMode::Replace exception at insertion boundaries; this leaf covers that consumed profile. Expanded/typed/metadata mark responsibilities are not currently represented and are not invented here."
id_source: "generated"
---
## Summary

Implement the existing collapsed bookmark model in native Writer replacement history, required by approved parent search/replace plan 202610201742-6B984M. Remove the blanket document bookmark rejection after the actual source history paths are implemented. This leaf does not complete the parent UI/advanced search feature.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer on writer. Up to 60 non-task paths in Writer docbm bookmark position contracts and their filter/shell/browser callers, content-index Replace updates, SwUndoSaveContent/DelContentType, SwHistoryBookmark/Move, unins replacement wrapper/Impl and affected document/search owners, focused tests, provenance/runtime records and suspected-issue log. User approved the overall search/replace plan and local source reading. No network, merges, outside writes, document storage/recovery changes or unrelated Calc work. Existing bookmarks are collapsed ordinary names/positions; expanded marks, UNO/cross-reference/annotation/field types and unrepresented keycode/metadata/fly/footnote/redline histories remain explicitly unported. No fabricated mark class hierarchy or unsupported success.

## Plan

Implement the source bookmark/content-index/history block of approved search/replace plan: actual DelContentIndex and history partition/moves, native replacement wrapper/Impl, consumed mark position/boundary contracts and related integration verification. Parent retains full UI and unsupported modes.

## Verify Steps

- Run new focused native bookmark/history tests for collapsed positions before/start/inside/end/after a same-node range, forward/backward all replacement, growing/shrinking/empty/identical strings, same-name recreation, numeric current-node restoration, CheckNoCntnt/Bkm flags, history Move order/temporary-end counters and repeated undo/redo with both bookmark and attribute histories.
- Run affected existing search/replacement/node-index/hint/history/model tests, bookmark shell/filter/ODT and browser tests; preserve native no-bookmark WRITER-010 behavior and exact unsupported boundaries.
- Run npm run build, scoped ESLint --max-warnings 0 and Prettier --check on all changed/new authored files; npm run check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared (redirect verbose JSON to ignored logs). Run affected dependency tooling only if dependency data changes.
- Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check and git status --short --untracked-files=all. Review pinned undobj.cxx/undobj.hxx, rolbck.cxx/rolbck.hxx, unins.cxx, ndtxt.cxx and document replacement branches; distinguish source/portable checks from compiled native execution. Preserve and document suspected source logic rather than correcting it.
- Determine the full-run cadence from last full run 6a7dd8660/202610182155-98VCB0. Four completed tasks have followed it so far; this leaf is the fifth and no full run is due unless authoritative history changes. Parent view/config/advanced-mode/UI requirements remain open.

## Verification

Pending implementation. Parent prerequisite checkpoints 19f96fc17af0, f3dc7a884c4f, f171609c38b3 and 84290ad4dc64 are committed; checkout was clean on writer at planning. No native bookmark binary parity claim.

## Rollback Plan

Revert only the implementation commits of this leaf and its task artifacts. Preserve other tasks, parent search/kernel checkpoints and user work. No resets, merges, destructive cleanup or outside-repository writes.

## Findings

Native normal replacement records DelContentIndex only when undo recording creates SwUndoReplace. Its collapsed ordinary bookmark profile records/deletes positions in [start,end), including start but excluding end; with undo disabled this constructor is absent and normal ReplaceText retains live marks. SwUndoReplace::Impl owns history partition m_nSetPos; undo moves hint suffix away before destructive bookmark rollback, then moves it back, and redo collects fresh mark history and prepends it. SwHistory::Move moves ownership without resetting either temporary-end counter, including an early return for an empty source. The existing before-affinity bookmark representation also misses the native UpdateMode::Replace exception at insertion boundaries; this leaf covers that consumed profile. Expanded/typed/metadata mark responsibilities are not currently represented and are not invented here.
