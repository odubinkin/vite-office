---
id: "202610201912-V6W22V"
title: "Implement Writer bookmark replacement history"
result_summary: "implement Writer bookmark replacement and native undo history"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 16
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
  state: "ok"
  updated_at: "2026-10-20T19:35:32.000Z"
  updated_by: "CODER"
  note: "Native collapsed bookmark replacement/history verified: 5059 core, 96 integration and final 36/14 focused cases; final build, scoped lint/format, registry/source/dependency/size/docs and policy checks pass. WRITER-016 and WRITER-010 preserved. Parent UI/advanced and expanded/typed mark responsibilities remain open."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T19:37:01.453Z"
  updated_by: "EVALUATOR"
  note: "The approved represented collapsed-bookmark replacement/history leaf meets its scoped source and regression contract at ef4bd7e8f31f. Parent search UI and advanced/typed mark responsibilities remain open."
  evaluated_sha: "ef4bd7e8f31fb0890da8cf6b57ea742329cee5e0"
  blueprint_digest: "37eed74206f48384de7b46e3b854358d7269ad2ca76d8f56a8a1ed31769b3d69"
  evidence_refs:
    - ".agentplane/tasks/202610201912-V6W22V/README.md"
    - ".agentplane/tasks/202610201912-V6W22V/quality/20261020-193701453-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201912-V6W22V/quality/20261020-193701453-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201912-V6W22V/quality/20261020-193701453-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201912-V6W22V/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/undo/native-bookmark-replace-history.test.ts"
    - "apps/office/src/sw/source/core/crsr/native-search-replace.test.ts"
    - "output/playwright/writer-bookmark-replace-checks/core-final.log"
    - "output/playwright/writer-bookmark-replace-checks/integration-final.log"
    - "output/playwright/writer-bookmark-replace-checks/build-final.log"
  findings:
    - "Verified actual source ownership: SaveContent DelContentIndex captures [start,end) ordinary collapsed marks, history retains numeric/name payload with registered restoration PaM, wrapper/Impl partitions and moves original entries, and redo recollects the current mark graph. Source WRITER-010 and recording-dependent WRITER-016 are preserved."
    - "The native Replace bookmark-boundary exception exposed old adapter flag misuse. Explicit fragment and complete-text construction now retain Default insertion behavior; affected ODT/browser tests pass unchanged expected positions. No storage format, conscious recovery/autosave deviation, dependency gate or semantic status promotion changed."
commit:
  hash: "ef4bd7e8f31fb0890da8cf6b57ea742329cee5e0"
  message: "🧩 V6W22V writer: implement bookmark replacement history"
comments:
  -
    author: "CODER"
    body: "Start: implement the approved native bookmark/content-index replacement history leaf, preserving original recording and hint-history behavior on writer."
  -
    author: "CODER"
    body: "Verified: native collapsed bookmark replacement history, prefix/suffix rollback and fresh redo recollection pass targeted core, ODT/browser and production/static checks. Source WRITER-016 and WRITER-010 are preserved; parent search UI and advanced mark scope remain open."
events:
  -
    type: "status"
    at: "2026-10-20T19:15:21.724Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native bookmark/content-index replacement history leaf, preserving original recording and hint-history behavior on writer."
  -
    type: "verify"
    at: "2026-10-20T19:35:32.000Z"
    author: "CODER"
    state: "ok"
    note: "Native collapsed bookmark replacement/history verified: 5059 core, 96 integration and final 36/14 focused cases; final build, scoped lint/format, registry/source/dependency/size/docs and policy checks pass. WRITER-016 and WRITER-010 preserved. Parent UI/advanced and expanded/typed mark responsibilities remain open."
  -
    type: "status"
    at: "2026-10-20T19:38:08.255Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native collapsed bookmark replacement history, prefix/suffix rollback and fresh redo recollection pass targeted core, ODT/browser and production/static checks. Source WRITER-016 and WRITER-010 are preserved; parent search UI and advanced mark scope remain open."
doc_version: 3
doc_updated_at: "2026-10-20T19:38:08.257Z"
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
  Verification: |-
    Command: from apps/office, npx vitest run src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/core/txtnode/native-replace-text.test.ts src/sw/source/core/bastyp/index.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/undo/native-insert-node-index.test.ts src/sw/source/core/undo/native-format-change-history.test.ts src/sw/source/core/txtnode/native-insert-flags.test.ts src/sw/source/core/txtnode/native-ignore-hint-expansion.test.ts src/sw/source/core/txtnode/native-text-hint-update.test.ts
    Result: pass; 5059 tests / 12 files. Evidence: output/playwright/writer-bookmark-replace-checks/core-final.log. Scope: represented bookmark prefix/hint suffix history, both search directions/body/cell grouping, native SetEnd/undo/node slots, old WRITER-010 consumption, real hint/index/insertion matrices and model/history integration.

    Command: from apps/office, npx vitest run src/sw/source/filter/xml/odt-markers.test.ts src/sw/source/filter/xml/odt-table-roundtrip.test.ts src/sw/source/uibase/shells/textsh1.test.ts src/sw/browser/presentation/writer-view.test.tsx src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/wrtsh/wrtsh1.test.ts src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts src/sw/browser/editor/native-clipboard-lists.test.tsx
    Result: pass; 96 tests / 8 files. Evidence: output/playwright/writer-bookmark-replace-checks/integration-final.log. Scope: actual ODT markers/table roundtrip, bookmark shell/dialog/navigation/export/import, document shell, rich clipboard and insertion callers. No persisted schema or storage/recovery/autosave behavior changed.

    Command: from apps/office, npx vitest run src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/bastyp/index.test.ts src/sw/source/filter/xml/odt-markers.test.ts
    Result: pass; 36 tests / 4 files after the last complete-text adapter mode correction. Then npx vitest run src/sw/source/core/undo/native-bookmark-replace-history.test.ts passes all 14 cases after refining the fresh-mark tests to use actual manager deletion/recreation rather than mutating a borrowed source position. Scope: saved/current numeric positions, same-name replacement, Bkm/CheckNoCntnt flags, source Move ordering/counters, fresh redo identity/coordinate recollection, complete-text/fragment adapters and no-recording behavior.

    Command: npm run build; scoped node_modules/.bin/eslint --max-warnings 0 and node_modules/.bin/prettier --check on every changed/new authored TS/TSX/JSON/Markdown file; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.
    Result: pass. Evidence: check-0.log through check-12.log, build-final.log and last-0.log through last-4.log in output/playwright/writer-bookmark-replace-checks. The final build follows the last production-code edit; final scoped static/provenance/size checks pass. Verbose parity JSON is redirected to ignored logs. No dependency data/algorithm/guard/exemption change was necessary, so conditional dependency tooling tests were not triggered. Existing doctor hook-shim warning remains with zero errors. Final post-commit status is recorded at closure.

    Source review: pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65, clean relevant native source paths. Original collapsed mark predicates in undobj.cxx/DelContentIndex and flags/base declaration in undobj.hxx; numeric/name restoration in rolbck.cxx/SwHistoryBookmark; ownership Move in rolbck.hxx; constructor/UndoImpl/RedoImpl partition flow in unins.cxx; positive bookmark Replace exception in ndtxt.cxx/Update and ordinary registry updates in index.cxx; normal recording gate/ReplaceText-versus-InsertString branches in DocumentContentOperationsManager.cxx. Source-contract and portable evidence only for bookmarks; no native bookmark/app/service binary was executed. Existing native numerical-kernel evidence from other checkpoints is not claimed as bookmark evidence.

    Cadence: git log --oneline --grep=close: 6a7dd8660..HEAD shows four task closes (1KGJBF, RX4J1N, 3F5N65, 4586BY) after the last recorded full run 202610182155-98VCB0/6a7dd8660. This leaf is the fifth completion; no full run is due until ten. Parent advanced search/config/view/UI deliverables remain open.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T19:35:32.000Z — VERIFY — ok

    By: CODER

    Note: Native collapsed bookmark replacement/history verified: 5059 core, 96 integration and final 36/14 focused cases; final build, scoped lint/format, registry/source/dependency/size/docs and policy checks pass. WRITER-016 and WRITER-010 preserved. Parent UI/advanced and expanded/typed mark responsibilities remain open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T19:35:30.612Z, excerpt_hash=sha256:1935cd7670180da6d008a87ec540a9197f2f0e0374458bd0e9ba6f844c29681f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610201912-V6W22V/blueprint/resolved-snapshot.json
    - old_digest: 37eed74206f48384de7b46e3b854358d7269ad2ca76d8f56a8a1ed31769b3d69
    - current_digest: 37eed74206f48384de7b46e3b854358d7269ad2ca76d8f56a8a1ed31769b3d69
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201912-V6W22V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201912-V6W22V
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation commits of this leaf and its task artifacts. Preserve other tasks, parent search/kernel checkpoints and user work. No resets, merges, destructive cleanup or outside-repository writes."
  Findings: |-
    Implemented actual SwUndoSaveContent history/DelContentType and represented ordinary collapsed bookmark DelContentIndex predicates. History entries retain original numeric node/content/name values rather than mark objects. SwHistoryBookmark resolves current slots and keeps an ephemeral registered SwPaM alive while deleting/recreating a same-name mark under the original undo guard. Unsupported expanded-end capture rejects explicitly; expanded/UNO/cross-reference/annotation/field marks, keycode/metadata, fly/footnote/redline histories are not fabricated.

    Refactored replacement to source SwUndoReplace wrapper plus SaveContent-derived Impl. Constructor collects affected mark prefix before complete hints; m_nSetPos partitions ownership. Undo restores hints temporarily, moves the suffix out, rolls back mark prefix destructively and moves hints back. Redo gathers fresh current marks and prepends that actual history. SwHistory.Move preserves both temporary-end counters and moves original objects in order without a JS spread argument limit. Native no-prefix WRITER-010 behavior still passes; no invented reset was added.

    Document/search blanket bookmark rejection is removed because the represented history now exists. The existing collapsed mark getter is GetMarkPos, matching native consumed spelling; all actual shell/export/browser consumers migrated without a deprecated alias. Mark/before boundaries honor native Replace update movement. The preexisting explicit formatted-fragment and complete-text construction adapters had misused Replace for ordinary insertion; they now use Default, retaining their original mark-before behavior. Native string ReplaceText keeps actual Replace mode. This fixes the real ODT/browser import regressions revealed by enabling the source exception, without changing test expectations, persisted formats or conscious I/O/recovery deviations.

    WRITER-016 documents native recording-dependent bookmark deletion: normal undo construction captures/deletes [start,end) collapsed marks, including identical replacement; no-recording document replacement omits that constructor and keeps live marks. Source-derived portable checks retain both recording states. This observation is not a compiled native/complete consumer defect claim. Existing WRITER-010/011 source quirks remain preserved.

    Initial typecheck required override on Impl.GetPayloadSize inherited from the existing SaveContent payload adapter; corrected. Initial browser/ODT tests exposed the old ordinary-fragment Replace flag; source/adapter mode separation resolves both failures and new direct fragment/construction boundary checks cover the distinction. All required affected checks pass. Full leaf scope is represented ordinary collapsed bookmark replacement/history only; parent remains open for expanded/typed/metadata content indices, advanced engines/options, complete layout/notes/fields/view/wrap and Find UI/focus/browser fidelity. No task or full goal parity status was promoted.
extensions:
  implementation_commit:
    hash: "ef4bd7e8f31fb0890da8cf6b57ea742329cee5e0"
    message: "🧩 V6W22V writer: implement bookmark replacement history"
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

Command: from apps/office, npx vitest run src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/core/txtnode/native-replace-text.test.ts src/sw/source/core/bastyp/index.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/undo/native-insert-node-index.test.ts src/sw/source/core/undo/native-format-change-history.test.ts src/sw/source/core/txtnode/native-insert-flags.test.ts src/sw/source/core/txtnode/native-ignore-hint-expansion.test.ts src/sw/source/core/txtnode/native-text-hint-update.test.ts
Result: pass; 5059 tests / 12 files. Evidence: output/playwright/writer-bookmark-replace-checks/core-final.log. Scope: represented bookmark prefix/hint suffix history, both search directions/body/cell grouping, native SetEnd/undo/node slots, old WRITER-010 consumption, real hint/index/insertion matrices and model/history integration.

Command: from apps/office, npx vitest run src/sw/source/filter/xml/odt-markers.test.ts src/sw/source/filter/xml/odt-table-roundtrip.test.ts src/sw/source/uibase/shells/textsh1.test.ts src/sw/browser/presentation/writer-view.test.tsx src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/wrtsh/wrtsh1.test.ts src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts src/sw/browser/editor/native-clipboard-lists.test.tsx
Result: pass; 96 tests / 8 files. Evidence: output/playwright/writer-bookmark-replace-checks/integration-final.log. Scope: actual ODT markers/table roundtrip, bookmark shell/dialog/navigation/export/import, document shell, rich clipboard and insertion callers. No persisted schema or storage/recovery/autosave behavior changed.

Command: from apps/office, npx vitest run src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/bastyp/index.test.ts src/sw/source/filter/xml/odt-markers.test.ts
Result: pass; 36 tests / 4 files after the last complete-text adapter mode correction. Then npx vitest run src/sw/source/core/undo/native-bookmark-replace-history.test.ts passes all 14 cases after refining the fresh-mark tests to use actual manager deletion/recreation rather than mutating a borrowed source position. Scope: saved/current numeric positions, same-name replacement, Bkm/CheckNoCntnt flags, source Move ordering/counters, fresh redo identity/coordinate recollection, complete-text/fragment adapters and no-recording behavior.

Command: npm run build; scoped node_modules/.bin/eslint --max-warnings 0 and node_modules/.bin/prettier --check on every changed/new authored TS/TSX/JSON/Markdown file; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; git status --short --untracked-files=all.
Result: pass. Evidence: check-0.log through check-12.log, build-final.log and last-0.log through last-4.log in output/playwright/writer-bookmark-replace-checks. The final build follows the last production-code edit; final scoped static/provenance/size checks pass. Verbose parity JSON is redirected to ignored logs. No dependency data/algorithm/guard/exemption change was necessary, so conditional dependency tooling tests were not triggered. Existing doctor hook-shim warning remains with zero errors. Final post-commit status is recorded at closure.

Source review: pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65, clean relevant native source paths. Original collapsed mark predicates in undobj.cxx/DelContentIndex and flags/base declaration in undobj.hxx; numeric/name restoration in rolbck.cxx/SwHistoryBookmark; ownership Move in rolbck.hxx; constructor/UndoImpl/RedoImpl partition flow in unins.cxx; positive bookmark Replace exception in ndtxt.cxx/Update and ordinary registry updates in index.cxx; normal recording gate/ReplaceText-versus-InsertString branches in DocumentContentOperationsManager.cxx. Source-contract and portable evidence only for bookmarks; no native bookmark/app/service binary was executed. Existing native numerical-kernel evidence from other checkpoints is not claimed as bookmark evidence.

Cadence: git log --oneline --grep=close: 6a7dd8660..HEAD shows four task closes (1KGJBF, RX4J1N, 3F5N65, 4586BY) after the last recorded full run 202610182155-98VCB0/6a7dd8660. This leaf is the fifth completion; no full run is due until ten. Parent advanced search/config/view/UI deliverables remain open.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T19:35:32.000Z — VERIFY — ok

By: CODER

Note: Native collapsed bookmark replacement/history verified: 5059 core, 96 integration and final 36/14 focused cases; final build, scoped lint/format, registry/source/dependency/size/docs and policy checks pass. WRITER-016 and WRITER-010 preserved. Parent UI/advanced and expanded/typed mark responsibilities remain open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T19:35:30.612Z, excerpt_hash=sha256:1935cd7670180da6d008a87ec540a9197f2f0e0374458bd0e9ba6f844c29681f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610201912-V6W22V/blueprint/resolved-snapshot.json
- old_digest: 37eed74206f48384de7b46e3b854358d7269ad2ca76d8f56a8a1ed31769b3d69
- current_digest: 37eed74206f48384de7b46e3b854358d7269ad2ca76d8f56a8a1ed31769b3d69
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201912-V6W22V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201912-V6W22V
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation commits of this leaf and its task artifacts. Preserve other tasks, parent search/kernel checkpoints and user work. No resets, merges, destructive cleanup or outside-repository writes.

## Findings

Implemented actual SwUndoSaveContent history/DelContentType and represented ordinary collapsed bookmark DelContentIndex predicates. History entries retain original numeric node/content/name values rather than mark objects. SwHistoryBookmark resolves current slots and keeps an ephemeral registered SwPaM alive while deleting/recreating a same-name mark under the original undo guard. Unsupported expanded-end capture rejects explicitly; expanded/UNO/cross-reference/annotation/field marks, keycode/metadata, fly/footnote/redline histories are not fabricated.

Refactored replacement to source SwUndoReplace wrapper plus SaveContent-derived Impl. Constructor collects affected mark prefix before complete hints; m_nSetPos partitions ownership. Undo restores hints temporarily, moves the suffix out, rolls back mark prefix destructively and moves hints back. Redo gathers fresh current marks and prepends that actual history. SwHistory.Move preserves both temporary-end counters and moves original objects in order without a JS spread argument limit. Native no-prefix WRITER-010 behavior still passes; no invented reset was added.

Document/search blanket bookmark rejection is removed because the represented history now exists. The existing collapsed mark getter is GetMarkPos, matching native consumed spelling; all actual shell/export/browser consumers migrated without a deprecated alias. Mark/before boundaries honor native Replace update movement. The preexisting explicit formatted-fragment and complete-text construction adapters had misused Replace for ordinary insertion; they now use Default, retaining their original mark-before behavior. Native string ReplaceText keeps actual Replace mode. This fixes the real ODT/browser import regressions revealed by enabling the source exception, without changing test expectations, persisted formats or conscious I/O/recovery deviations.

WRITER-016 documents native recording-dependent bookmark deletion: normal undo construction captures/deletes [start,end) collapsed marks, including identical replacement; no-recording document replacement omits that constructor and keeps live marks. Source-derived portable checks retain both recording states. This observation is not a compiled native/complete consumer defect claim. Existing WRITER-010/011 source quirks remain preserved.

Initial typecheck required override on Impl.GetPayloadSize inherited from the existing SaveContent payload adapter; corrected. Initial browser/ODT tests exposed the old ordinary-fragment Replace flag; source/adapter mode separation resolves both failures and new direct fragment/construction boundary checks cover the distinction. All required affected checks pass. Full leaf scope is represented ordinary collapsed bookmark replacement/history only; parent remains open for expanded/typed/metadata content indices, advanced engines/options, complete layout/notes/fields/view/wrap and Find UI/focus/browser fidelity. No task or full goal parity status was promoted.
