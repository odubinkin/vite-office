---
id: "202610061618-REBSTT"
title: "Restore native Writer mouse column-border tracking"
result_summary: "Restored native inner/outer column resize capture with cancellation and deferred document history;13002app109inventory5scripts217ChromiumPASS, actual100 coverage;499historical test files and275metadata records preserved. Full parity unverified."
status: "DONE"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on:
  - "202610061500-M9GQ62"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T16:20:08.549Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T16:43:14.839Z"
  updated_by: "CODER"
  note: "Exact951af363f422 native mouse column tracking verified:13002app109inventory5scripts217ChromiumPASS; actual100 app/inventory via complete source/map actual counter proof.499historic tests byte-identical,275metadata preserved. Same-agent EVALUATOR pass is not independent review. Rows/full ruler/full parity remain unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T16:42:32.809Z"
  updated_by: "EVALUATOR"
  note: "Same current agent in EVALUATOR phase; not independent review. Exact implementation 951af363f422df0b485a0ab61491c317cf532652 satisfies the bounded mouse column-border fix; full parity remains unverified."
  evaluated_sha: "951af363f422df0b485a0ab61491c317cf532652"
  blueprint_digest: "d360805916a6d4703743a0416c352f887bd39824c240f2c1ee44fa1337ac2537"
  evidence_refs:
    - ".agentplane/tasks/202610061618-REBSTT/README.md"
    - ".agentplane/tasks/202610061618-REBSTT/quality/20261006-164232809-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061618-REBSTT/quality/20261006-164232809-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061618-REBSTT/quality/20261006-164232809-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061618-REBSTT/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061618-REBSTT/evidence/exact-sha-quality.json"
    - ".agentplane/tasks/202610061618-REBSTT/evidence/source-review.json"
    - ".agentplane/tasks/202610061618-REBSTT/evidence/scope-audit.json"
  findings:
    - "Native actual-frame GetMouseTabCols/SetMouseTabCols and deferred SwTabCols tracking restore inner/outer border capture, preview/cancel/Enter/release with original cursor/history. ONE full absent profile plus only original failure/new-case closures gives13002app109inventory5scripts217ChromiumPASS; actual100 app/inventory complete source/map counter proof.499 historical test files byte-identical,275 complete metadata prefixes and registered I/O deviations preserved. Row-height mouse resizing and complete native ruler machinery remain unverified; THKZ38 draft retained in its local Git stash."
commit:
  hash: "951af363f422df0b485a0ab61491c317cf532652"
  message: "🚧 REBSTT code: restore native mouse column-border tracking"
comments:
  -
    author: "CODER"
    body: "Start: restore the user-reported mouse column-border gesture with native position-based separator ownership, capture and deferred history; preserve THKZ38 stash and every historical acceptance case."
  -
    author: "CODER"
    body: "Verified: native mouse column-border tracking now blocks text drag/selection, previews and commits once through SwTabCols, preserves cursor/history, and passes the complete bounded evidence contract; row-height resizing remains next."
events:
  -
    type: "status"
    at: "2026-10-06T16:20:09.274Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the user-reported mouse column-border gesture with native position-based separator ownership, capture and deferred history; preserve THKZ38 stash and every historical acceptance case."
  -
    type: "verify"
    at: "2026-10-06T16:43:14.839Z"
    author: "CODER"
    state: "ok"
    note: "Exact951af363f422 native mouse column tracking verified:13002app109inventory5scripts217ChromiumPASS; actual100 app/inventory via complete source/map actual counter proof.499historic tests byte-identical,275metadata preserved. Same-agent EVALUATOR pass is not independent review. Rows/full ruler/full parity remain unverified."
  -
    type: "status"
    at: "2026-10-06T16:43:34.817Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native mouse column-border tracking now blocks text drag/selection, previews and commits once through SwTabCols, preserves cursor/history, and passes the complete bounded evidence contract; row-height resizing remains next."
doc_version: 3
doc_updated_at: "2026-10-06T16:43:34.818Z"
doc_updated_by: "CODER"
description: "Fix the reported column-resize gesture falling through to browser text drag or selection. Preserve unfinished THKZ38 in its recorded stash; implement this higher-priority isolated leaf using native GetMouseTabCols/SetMouseTabCols, deferred release history, cancellation and device capture."
sections:
  Summary: "Restore real Writer mouse column-border resizing. Hover currently advertises col-resize, but SwEditWin.MouseButtonDown admits only enhanced selection, allowing browser text drag/selection. User explicitly reprioritized this concrete bug; THKZ38 draft remains intact in Git stash c85f4a0e453dfd06d6e199554784f2c286737472."
  Scope: |-
    apps/office/src/sw/source/core/frmedt/fetab.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts
    apps/office/src/sw/browser/editor/native-table-column-drag.test.tsx
    apps/office/e2e/writer-native-table-column-drag.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Active leaf AP lifecycle and parent complete-prefix checkpoint only. Preserve all499 old acceptance files byte-identical; add3 files502total. Preserve275 metadata and old statuses/defaults/evidence/symbol prefixes; append native mouse-column evidence only. Registered save/open/recovery deviations unchanged. No upstream source or helpers in AP. Runtime/tests/E2E never invoke upstream. No network/outside access/subagents.
  Plan: |-
    1. CODER refactors existing SwFEShell.GetTabCols ingress into shared GetTabCols_ over actual canonical table/box, then connects source GetMouseTabCols/SetMouseTabCols without a width-array/UI mutation adapter. Preserve ordinary cursor and selected-box ownership.
    2. Admit plain horizontal column borders and table left/right edges in SwEditWin.MouseButtonDown when not in native table selection mode, before browser caret/transfer handling. Own an independent native SwTabCols tracking draft, source5px hit/minimum constraints and clamped neighboring boundaries; preview without document mutation and apply once on accepted mouseup/Enter. Cancel Escape/blur/teardown and suppress stale release/no-motion history.
    3. Browser edit window owns device capture and a temporary guide only: prevent text selection/dragstart, deliver off-host motion/final release, prioritize tracking keys, dispose every listener/guide. No React width-array translation.
    4. Test connected shell/history/cursor/list/ODT and mounted DOM/real Chromium1280/390 for inner/outer borders, min/max, text-over-border, no text drag, capture outside host, cancellation/no-op, undo/redo3cycles and continued input. Preserve every historical test.
    5. Run the bounded verification contract, commit all approved semantic paths, same-agent exact-SHA EVALUATOR review explicitly not independent, close leaf, append parent whole prefix. Whole goal ACTIVE/unverified. Full SvxRuler/SfxColumnItem snapping, modifier proportional/current-row policies, vertical/RTL/row-height resize are not claimed; this bounded flat LTR default tracking follows existing native SwTabCols core. THKZ38 resumes after this leaf.
  Verify Steps: |-
    1. Initial six static gates format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; scoped unchanged JSDoc and actual physical lines<1000. Repeat only original failed or genuinely changed-path checks.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. No source/scope/AP audit while profile live. Only original failed or genuinely new cases afterward; no passing/full replay or with-upstream tests. Actual100 app/inventory counters with identical complete source/maps or complete contiguous byte-identical regions/whole function declaration-body/full branch-location proof; focused skips remain skipped. Raw maps/reports/source/cases only ignored app cache, AP bounded prose/counts/hashes.
    3. Literal source5px hit and min-frame limits using actual measured scale and native nMin/nMax; internal border and left/right table edges; default adjacent width balancing, clamping, no-op, guard table-mode/right/double/row/foreign/detached frames. No mutation/history while tracking; one grouped history on accepted release/Enter; Escape/blur/teardown cancellation and stale release inert. Actual cursor/list/shared node/box/row/table ownership and UndoRedo3cycles preserved; continued typing/ODT roundtrip.
    4. Mounted and real Chromium1280/390 production dist tests prove mouse capture on text-over-border blocks browser selection/drag, preview/commit moves physical boundary, off-host motion/release, default limits, outer edges and history, cancellation/no viewport regression.499 old acceptance files byte-identical+3new=502;275prior metadata prefix/state/default/evidence/responsibility/justification/symbol contracts retained, I/O mappings byte-identical.
    5. Once restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff/pinned hashes/current-leaf quality census0forbidden. Same-agent EVALUATOR exact implementation SHA explicitly not independent, verification tail before finish(actual implementationSHA), clean final tracked state. Parent entire486687-character prefix SHA f43a559b2f5deeae908a43fe1dac08394c620b329caf5e25127f59be8961265d preserved; whole parity remains UNVERIFIED.
  Verification: |-
    Command: initial npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size; original failed static gates closure; unchanged scoped JSDoc/physical<1000/prettier/eslint.
    Result: PASS after bounded fixture/static closures; dependency/file-size ran once, original diagnostics retained.
    Command: ONE upstream-absent npm run test:static; full application and inventory coverage;5scripts; production Chromium. Only original one-column app failure and new Enter Chrome case afterward; no passing/full replay.
    Result: final13002application109inventory5scripts217ChromiumPASS;11filtered app cases remain skipped. Native inner/outer column borders block text drag/selection, preview without document mutation, apply one native history record, cancel Escape/blur/teardown, accept Enter, preserve graph/cursor/list and ODT. Initial1new app failure corrected stale measured fixture; zero-selection grep and fixed-ruler occlusion in new Chrome case corrected. One unreachable source-confirmed re-admission conditional removed with one dist rebuild.
    Evidence: exact implementation951af363f422df0b485a0ab61491c317cf532652; same-agent EVALUATOR PASS explicitly not independent. Actual100272app L14425/S15820/F3688/B11785 map e7c5b90b6473b3ea4a06e1465d70b4bc51abe2a8c40c3cb21b99a1bc6991db8f;38inventory L1464/S1523/F384/B1080 map707383edf7c60e3c312e0991b6131fa8109e70d5e4d253c5a40cf60dbb030fbc;310 full-source/contiguous mapped range proofs, actual counters only.
    Command: once-restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff; scope and current-leaf/generated-quality census.
    Result: PASS; doctor0errors2known historic warnings;0forbidden artifacts.499old acceptance files byte-identical+3new502total; all275 prior metadata states/defaults/evidence/responsibility/justification/symbol prefixes and I/O mappings preserved. Parent486687 complete prefix retained; THKZ38 draft stored unchanged in Git stashc85f4a0e453dfd06d6e199554784f2c286737472.
    Scope: bounded flat horizontal LTR default mouse column tracking. Source row-height resize verified as required and next priority; full ruler/SfxColumnItem/snapping/modifiers/current-row/vertical/RTL/row-height/full layout remains unverified. Whole goal/parent ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T16:43:14.839Z — VERIFY — ok

    By: CODER

    Note: Exact951af363f422 native mouse column tracking verified:13002app109inventory5scripts217ChromiumPASS; actual100 app/inventory via complete source/map actual counter proof.499historic tests byte-identical,275metadata preserved. Same-agent EVALUATOR pass is not independent review. Rows/full ruler/full parity remain unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T16:43:14.423Z, excerpt_hash=sha256:e31083f1bf3072b4d9be50a831f06bb61101a42b73b56ca8962528994a7917c9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061618-REBSTT/blueprint/resolved-snapshot.json
    - old_digest: d360805916a6d4703743a0416c352f887bd39824c240f2c1ee44fa1337ac2537
    - current_digest: d360805916a6d4703743a0416c352f887bd39824c240f2c1ee44fa1337ac2537
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610061618-REBSTT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610061618-REBSTT -m 🧩 REBSTT task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf implementation commit through a new executable task if needed. Preserve THKZ38 stash and existing historical acceptance/evidence; never rewrite history or change registered I/O deviations."
  Findings: |-
    Root cause confirmed read-only: edtwin.ts MouseButtonDown rejects SwTab.COL_HORI, and BrowserWriterEditWindow falls through to pointerSelection.Start. Source edtwin.cxx admits borders outside native table mode, edtwin3.cxx tries ruler Border then Margin1/Margin2 with5px tolerance, fetab.cxx provides position-based GetMouseTabCols/SetMouseTabCols. Source SvxRuler uses glMinFrame5 pixels and nEndMin/nEndMax bounds. Complete SvxRuler machinery remains unverified; no whole-status promotion.

    Verification closure: ONE full upstream-absent profile: build PASS, application13001PASS1FAIL, inventory109PASS actual100, scripts5PASS, Chromium216PASS. The sole original failure used stale one-column device geometry after a left-edge resize; refreshing the literal frame closes it1PASS11filteredSKIPS. A source-shaped SetMouseTabCols unreachable re-admission guard was removed; one changed production dist rebuild PASS. New real Enter/outer-left case initially selected0 because Playwright grep matches full title, then1FAIL because fixed ruler occluded the edge; existing real edge-exposure helper closes1PASS. No full/passing test replay. Final case identity union13002application109inventory5scripts217ChromiumPASS. Finalactual100272app/38inventory maps; raw counters/source proofs stay in ignored app cache, AP only bounded counts/hashes/outcomes.

    Initial static format/lint/typecheck/JSDoc fixture errors closed only failed gates; dependency and file-size passed once. Scoped final validator/format/lint PASS. Once-restored resource generation/source-tree/provenance/invariants/parity PASS. Read-only scope helper first failed on an optional evidence array; corrected audit preserves all275 prior complete metadata/status/default/evidence/symbol prefixes,499 old acceptance files byte-identical+3new502total, registered I/O mappings unchanged. Governance helper syntax construction was corrected before any command ran. Doctor0errors2known warnings; routing/diff PASS. No upstream execution/source storage in AP.

    Upstream row confirmation: ROW_HORI enters the vertical ruler in edtwin.cxx; fetab.cxx and viewtab.cxx use GetMouseTabRows/SetMouseTabRows with native row constraints/following separators. Row-height mouse resize is next priority. THKZ38 five-path unfinished column-page draft is retained in Git stash c85f4a0e453dfd06d6e199554784f2c286737472; no verification was run for that draft. Complete native ruler/SfxColumnItem snapping/modifiers/current-row/vertical/RTL/row-height/full layout remain unverified. Whole goal and parent remain ACTIVE/unverified.

    - Observation: Hover advertised column resize while MouseButtonDown rejected borders and allowed browser text drag/selection.
      Impact: Mouse column resizing failed despite correct cursor; cursor ownership and native history were not connected.
      Resolution: Position-based native GetMouseTabCols/SetMouseTabCols, copied native draft, browser capture/guide and deferred single history now pass real mouse tests. Source row-height resize is next priority.
id_source: "generated"
---
## Summary

Restore real Writer mouse column-border resizing. Hover currently advertises col-resize, but SwEditWin.MouseButtonDown admits only enhanced selection, allowing browser text drag/selection. User explicitly reprioritized this concrete bug; THKZ38 draft remains intact in Git stash c85f4a0e453dfd06d6e199554784f2c286737472.

## Scope

apps/office/src/sw/source/core/frmedt/fetab.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts
apps/office/src/sw/browser/editor/native-table-column-drag.test.tsx
apps/office/e2e/writer-native-table-column-drag.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Active leaf AP lifecycle and parent complete-prefix checkpoint only. Preserve all499 old acceptance files byte-identical; add3 files502total. Preserve275 metadata and old statuses/defaults/evidence/symbol prefixes; append native mouse-column evidence only. Registered save/open/recovery deviations unchanged. No upstream source or helpers in AP. Runtime/tests/E2E never invoke upstream. No network/outside access/subagents.

## Plan

1. CODER refactors existing SwFEShell.GetTabCols ingress into shared GetTabCols_ over actual canonical table/box, then connects source GetMouseTabCols/SetMouseTabCols without a width-array/UI mutation adapter. Preserve ordinary cursor and selected-box ownership.
2. Admit plain horizontal column borders and table left/right edges in SwEditWin.MouseButtonDown when not in native table selection mode, before browser caret/transfer handling. Own an independent native SwTabCols tracking draft, source5px hit/minimum constraints and clamped neighboring boundaries; preview without document mutation and apply once on accepted mouseup/Enter. Cancel Escape/blur/teardown and suppress stale release/no-motion history.
3. Browser edit window owns device capture and a temporary guide only: prevent text selection/dragstart, deliver off-host motion/final release, prioritize tracking keys, dispose every listener/guide. No React width-array translation.
4. Test connected shell/history/cursor/list/ODT and mounted DOM/real Chromium1280/390 for inner/outer borders, min/max, text-over-border, no text drag, capture outside host, cancellation/no-op, undo/redo3cycles and continued input. Preserve every historical test.
5. Run the bounded verification contract, commit all approved semantic paths, same-agent exact-SHA EVALUATOR review explicitly not independent, close leaf, append parent whole prefix. Whole goal ACTIVE/unverified. Full SvxRuler/SfxColumnItem snapping, modifier proportional/current-row policies, vertical/RTL/row-height resize are not claimed; this bounded flat LTR default tracking follows existing native SwTabCols core. THKZ38 resumes after this leaf.

## Verify Steps

1. Initial six static gates format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; scoped unchanged JSDoc and actual physical lines<1000. Repeat only original failed or genuinely changed-path checks.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. No source/scope/AP audit while profile live. Only original failed or genuinely new cases afterward; no passing/full replay or with-upstream tests. Actual100 app/inventory counters with identical complete source/maps or complete contiguous byte-identical regions/whole function declaration-body/full branch-location proof; focused skips remain skipped. Raw maps/reports/source/cases only ignored app cache, AP bounded prose/counts/hashes.
3. Literal source5px hit and min-frame limits using actual measured scale and native nMin/nMax; internal border and left/right table edges; default adjacent width balancing, clamping, no-op, guard table-mode/right/double/row/foreign/detached frames. No mutation/history while tracking; one grouped history on accepted release/Enter; Escape/blur/teardown cancellation and stale release inert. Actual cursor/list/shared node/box/row/table ownership and UndoRedo3cycles preserved; continued typing/ODT roundtrip.
4. Mounted and real Chromium1280/390 production dist tests prove mouse capture on text-over-border blocks browser selection/drag, preview/commit moves physical boundary, off-host motion/release, default limits, outer edges and history, cancellation/no viewport regression.499 old acceptance files byte-identical+3new=502;275prior metadata prefix/state/default/evidence/responsibility/justification/symbol contracts retained, I/O mappings byte-identical.
5. Once restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff/pinned hashes/current-leaf quality census0forbidden. Same-agent EVALUATOR exact implementation SHA explicitly not independent, verification tail before finish(actual implementationSHA), clean final tracked state. Parent entire486687-character prefix SHA f43a559b2f5deeae908a43fe1dac08394c620b329caf5e25127f59be8961265d preserved; whole parity remains UNVERIFIED.

## Verification

Command: initial npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size; original failed static gates closure; unchanged scoped JSDoc/physical<1000/prettier/eslint.
Result: PASS after bounded fixture/static closures; dependency/file-size ran once, original diagnostics retained.
Command: ONE upstream-absent npm run test:static; full application and inventory coverage;5scripts; production Chromium. Only original one-column app failure and new Enter Chrome case afterward; no passing/full replay.
Result: final13002application109inventory5scripts217ChromiumPASS;11filtered app cases remain skipped. Native inner/outer column borders block text drag/selection, preview without document mutation, apply one native history record, cancel Escape/blur/teardown, accept Enter, preserve graph/cursor/list and ODT. Initial1new app failure corrected stale measured fixture; zero-selection grep and fixed-ruler occlusion in new Chrome case corrected. One unreachable source-confirmed re-admission conditional removed with one dist rebuild.
Evidence: exact implementation951af363f422df0b485a0ab61491c317cf532652; same-agent EVALUATOR PASS explicitly not independent. Actual100272app L14425/S15820/F3688/B11785 map e7c5b90b6473b3ea4a06e1465d70b4bc51abe2a8c40c3cb21b99a1bc6991db8f;38inventory L1464/S1523/F384/B1080 map707383edf7c60e3c312e0991b6131fa8109e70d5e4d253c5a40cf60dbb030fbc;310 full-source/contiguous mapped range proofs, actual counters only.
Command: once-restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff; scope and current-leaf/generated-quality census.
Result: PASS; doctor0errors2known historic warnings;0forbidden artifacts.499old acceptance files byte-identical+3new502total; all275 prior metadata states/defaults/evidence/responsibility/justification/symbol prefixes and I/O mappings preserved. Parent486687 complete prefix retained; THKZ38 draft stored unchanged in Git stashc85f4a0e453dfd06d6e199554784f2c286737472.
Scope: bounded flat horizontal LTR default mouse column tracking. Source row-height resize verified as required and next priority; full ruler/SfxColumnItem/snapping/modifiers/current-row/vertical/RTL/row-height/full layout remains unverified. Whole goal/parent ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T16:43:14.839Z — VERIFY — ok

By: CODER

Note: Exact951af363f422 native mouse column tracking verified:13002app109inventory5scripts217ChromiumPASS; actual100 app/inventory via complete source/map actual counter proof.499historic tests byte-identical,275metadata preserved. Same-agent EVALUATOR pass is not independent review. Rows/full ruler/full parity remain unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T16:43:14.423Z, excerpt_hash=sha256:e31083f1bf3072b4d9be50a831f06bb61101a42b73b56ca8962528994a7917c9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061618-REBSTT/blueprint/resolved-snapshot.json
- old_digest: d360805916a6d4703743a0416c352f887bd39824c240f2c1ee44fa1337ac2537
- current_digest: d360805916a6d4703743a0416c352f887bd39824c240f2c1ee44fa1337ac2537
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610061618-REBSTT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610061618-REBSTT -m 🧩 REBSTT task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf implementation commit through a new executable task if needed. Preserve THKZ38 stash and existing historical acceptance/evidence; never rewrite history or change registered I/O deviations.

## Findings

Root cause confirmed read-only: edtwin.ts MouseButtonDown rejects SwTab.COL_HORI, and BrowserWriterEditWindow falls through to pointerSelection.Start. Source edtwin.cxx admits borders outside native table mode, edtwin3.cxx tries ruler Border then Margin1/Margin2 with5px tolerance, fetab.cxx provides position-based GetMouseTabCols/SetMouseTabCols. Source SvxRuler uses glMinFrame5 pixels and nEndMin/nEndMax bounds. Complete SvxRuler machinery remains unverified; no whole-status promotion.

Verification closure: ONE full upstream-absent profile: build PASS, application13001PASS1FAIL, inventory109PASS actual100, scripts5PASS, Chromium216PASS. The sole original failure used stale one-column device geometry after a left-edge resize; refreshing the literal frame closes it1PASS11filteredSKIPS. A source-shaped SetMouseTabCols unreachable re-admission guard was removed; one changed production dist rebuild PASS. New real Enter/outer-left case initially selected0 because Playwright grep matches full title, then1FAIL because fixed ruler occluded the edge; existing real edge-exposure helper closes1PASS. No full/passing test replay. Final case identity union13002application109inventory5scripts217ChromiumPASS. Finalactual100272app/38inventory maps; raw counters/source proofs stay in ignored app cache, AP only bounded counts/hashes/outcomes.

Initial static format/lint/typecheck/JSDoc fixture errors closed only failed gates; dependency and file-size passed once. Scoped final validator/format/lint PASS. Once-restored resource generation/source-tree/provenance/invariants/parity PASS. Read-only scope helper first failed on an optional evidence array; corrected audit preserves all275 prior complete metadata/status/default/evidence/symbol prefixes,499 old acceptance files byte-identical+3new502total, registered I/O mappings unchanged. Governance helper syntax construction was corrected before any command ran. Doctor0errors2known warnings; routing/diff PASS. No upstream execution/source storage in AP.

Upstream row confirmation: ROW_HORI enters the vertical ruler in edtwin.cxx; fetab.cxx and viewtab.cxx use GetMouseTabRows/SetMouseTabRows with native row constraints/following separators. Row-height mouse resize is next priority. THKZ38 five-path unfinished column-page draft is retained in Git stash c85f4a0e453dfd06d6e199554784f2c286737472; no verification was run for that draft. Complete native ruler/SfxColumnItem snapping/modifiers/current-row/vertical/RTL/row-height/full layout remain unverified. Whole goal and parent remain ACTIVE/unverified.

- Observation: Hover advertised column resize while MouseButtonDown rejected borders and allowed browser text drag/selection.
  Impact: Mouse column resizing failed despite correct cursor; cursor ownership and native history were not connected.
  Resolution: Position-based native GetMouseTabCols/SetMouseTabCols, copied native draft, browser capture/guide and deferred single history now pass real mouse tests. Source row-height resize is next priority.
