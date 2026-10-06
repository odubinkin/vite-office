---
id: "202610062106-NHEGKZ"
title: "Port native table and row split controls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T21:07:18.327Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T21:30:32.997Z"
  updated_by: "CODER"
  note: "Native separate table/row split controls verified on implementation4b698a7165909943fb9380f7c9ec78e38e0593f6. ONE upstream-absent profile13157app109inventory5scripts241Chromium PASS; actual100 coverage verified. Same-agent exact-SHA EVALUATOR pass explicitly not independent. Parent/goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T21:27:52.579Z"
  updated_by: "EVALUATOR"
  note: "Same current-agent EVALUATOR exact implementation 4b698a7165909943fb9380f7c9ec78e38e0593f6; explicitly not independent review. Native separate table/row split controls and changed items verified."
  evaluated_sha: "4b698a7165909943fb9380f7c9ec78e38e0593f6"
  blueprint_digest: "ea85bd2e2c481883f129b8e2f0a774e7f9a82996919083adb240a144c90631a0"
  evidence_refs:
    - ".agentplane/tasks/202610062106-NHEGKZ/README.md"
    - ".agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610062106-NHEGKZ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610062106-NHEGKZ/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610062106-NHEGKZ/evidence/source-gates.json"
    - ".agentplane/tasks/202610062106-NHEGKZ/evidence/governance.json"
  findings:
    - "ONE upstream-absent build/app/browser profile13157app5scripts241Chromium PASS0skip/flaky; inventory108initial PASS+original failed1closure PASS109. Focused2skips retained, no passing/full/build/app/browser replay. Actual100 verified source/maps counters."
    - "21approvedpaths;527old acceptance519byte-identical+8explicit limited migrations,4new531.276old metadata full prefixes/contracts/defaults/classifications/registered exceptions retained+1new partial ndtbl1 module277 unverified. Source5gates, scoped/static checks and doctor/routing/diff PASS. Original native graph/list/cursor/grouped3UndoRedo/ODT/input and mixed controls retained."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native table/row split controls, changed items and document-owned selected row state; standing iterative authorization, one leaf, native graph/insert/storage exceptions retained."
events:
  -
    type: "status"
    at: "2026-10-06T21:07:24.938Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native table/row split controls, changed items and document-owned selected row state; standing iterative authorization, one leaf, native graph/insert/storage exceptions retained."
  -
    type: "verify"
    at: "2026-10-06T21:30:32.997Z"
    author: "CODER"
    state: "ok"
    note: "Native separate table/row split controls verified on implementation4b698a7165909943fb9380f7c9ec78e38e0593f6. ONE upstream-absent profile13157app109inventory5scripts241Chromium PASS; actual100 coverage verified. Same-agent exact-SHA EVALUATOR pass explicitly not independent. Parent/goal active."
doc_version: 3
doc_updated_at: "2026-10-06T21:30:33.074Z"
doc_updated_by: "CODER"
description: "Iteration199 under standing user authorization: remove conflated dontSplit properties adapter; native Text Flow changed-item table/row controls, true default/mixed row state/sensitivity/Reset, native document selection aggregation and independent shell publication. Preserve insertion/storage exceptions and historical acceptance except explicit contract migrations; parent goal active."
sections:
  Summary: "Port existing native table/row split Text Flow controls and remove conflated properties dontSplit/React row-state adapter. Source separate changed RES_LAYOUT_SPLIT and RES_ROW_SPLIT publication, native defaulttrue/mixed selected row state, child sensitivity/reset retained. Single iteration199 executable leaf under standing iterative authorization; previous198 completed progress, full parent/goal active."
  Scope: "Approved21semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/ui/table/tabledlg.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/ui/table/native-table-text-flow-headline.test.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts, apps/office/src/sw/source/ui/table/native-table-text-flow-split.test.ts, apps/office/src/sw/browser/presentation/native-table-text-flow-split.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts, apps/office/e2e/writer-native-table-text-flow-split.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Seven production paths including native ndtbl1 module,8explicit old contract/control migrations,4new acceptance,2metadata.527prior acceptance519byte-identical+8known migrations;4new531total.276old metadata full prefixes/contracts/defaults/statuses/classifications/registered filename/I/O/save/open/recovery exceptions retained+1new native partial ndtbl1 owner277, semantic states unverified. Parent515592characters SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 retained. Insertion dontSplit stays solely insertion presentation field; no inserted table semantics or storage exception changes."
  Plan: |-
    1.CODER add source-shaped ndtbl1 row split aggregation over canonical boxes/lines, SwDoc.GetRowSplit native cursor admission and SwFEShell.GetRowSplit forwarding. Preserve existing setters/history/source represented flat selection boundaries; standalone dialog unselected input reads all rows and selected mode reads original boxes, no projection or retained DTO.
    2.CODER extend existing SwTextFlowPage with captured layoutSplit and mixed rowSplit originals, Reset/saved values, SplitHdl_Impl sensitivity without clearing child, native changed-only FillItemSet attributes record (headline included). UI exact upstream two controls, actual HTML mixed state, source handlers, existing Reset/Cancel/OK, direct selected box inputs, remove React dontSplit state and properties inverse flag. ItemSetToTableParam only publishes explicit split items to separate native setters/table attribute; insertion field stays WriterTableDialogValue optional boundary.
    3.CODER migrate only8known old contracts: scalar headline FillItemSet expectations become exact equivalent item record; properties label/table flag expectation corrected, reset obsolete unconditional dontSplit publication removed; typed history fixtures dontSplit boolean=>rowSplit inverse preserves every original graph/history/storage expectation. All other acceptance bytes/literal tokens preserved. Add independent native/mounted/history/ODT/Chromium1280/390 changed-only/selection/mixed/sensitivity/no clearing/Reset/Cancel/all tabs/physical table movement/original graph/list/cursor/grouped3UndoRedo/continued input.
    4.CODER six static gates once, unchanged JSDoc/actual physical lines on19code/test paths<1000, ONEfull upstream-absent build/app/inventory/scripts/Chromium profile restored finally, no test invokes upstream/no source/scope/AP audits live. Actual100 coverage from whole identical source/maps or complete contiguous identical source/full function/branch/locations with genuine counters only; prior verified unchanged whole map permitted, no passing/full replay, only original failed/new closures.
    5.Same current-agent EVALUATOR exact implementation-SHA explicitly not independent, source5gates/scope/proof/doctor/routing/diff/current quality artifact census0forbidden. Final Findings/Verification before canonical verify, finish actual implementationSHA, append complete parent prefix and clean tracked state. No subagents/network/global/outside writes; raw only ignored app cache. Full row-content splitting/merged/nested/fly/columns/protection/full SfxItemSet/widget suite/full kernel/browser parity unverified. Stop for material scope/risk/verification drift; parent/goal active.
  Verify Steps: |-
    1.Six initial static gates format/lint/typecheck/dependencies/docs/file-size ONCE, unchanged JSDoc and actual untrimmed split physical lines<1000 on19changed code/test paths. Failed/genuinely changed closures only.
    2.ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor renamed inside repo/restored finally. No tests invoke upstream; no source/scope/AP audits while any absence profile live and await audits before profiles. Actual100 app/inventory coverage verified full identical source/maps or complete contiguous source/full function declaration/body/branch/location regions with actual counters, prior verified whole identical map permitted. Only original failed/genuinely new cases afterward, no historical passing/full replay, skips stay skips.
    3.Source true table default, original false; row true/false/mixed and current/selected native cursor admission, empty/foreign/outside cases; saved-value-only table and row publication, child disabled retains flag, repeated toggles/Reset/Cancel/all tabs source headline record compatibility; independent native table vs row mutations, absent item preserves mixed/default flag and original graph/list/cursor/root snapshot, one grouped3UndoRedo/ODT/input, Chromium1280/390 source controls and actual physical table pages. Full row-content splitting not claimed.
    4.Five source gates generation --check/source-tree/provenance/invariants/parity after restoration.21paths,527prior acceptance519byte-identical+8explicit limited migrations and all other literal assertions retained;4new531total.276old metadata full prefixes/contracts/defaults/statuses/classifications/registered exceptions preserved+1new native partial277; full parent515592characters SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 intact. Source hashes and original stash retained.
    5.Doctor/routing/diff/current leaf/generated quality0forbidden; exact implementation-SHA same current-agent EVALUATOR explicitly not independent. Final prose before canonical verify; actual implementationSHA finish, clean tracked state. Whole row splitting/nested/merged/fly/columns/protection/SfxItemSet/native item classes/full parity unverified; parent/goal active.
  Verification: |-
    PASS approved iteration199 implementation 4b698a7165909943fb9380f7c9ec78e38e0593f6; progress only, whole goal ACTIVE.
    Command/result: six static gates once with only original format failure closure; scoped unchanged JSDoc/format/lint and physical lines PASS. ONE upstream-absent build and full runtime profile: 13157app,5scripts,241Chromium PASS0skip/flaky; inventory108initial PASS+original failed case1closure PASS=109. Focused2filtered skips remain skipped; initial/focused nonzero coverage-only exits recorded, no passing/full replay. Vendor restored.
    Coverage: actual100 app274files L14838/S16279/F3781/B12077 and inventory38files L1464/S1523/F384/B1080; full identical source/maps proof and genuine counters, no fabricated counters. Evidence evidence/absent-profile.json, failure-closure1.json, final-coverage.json, coverage-source-proof.json, static-gates.json, static-closure1.json, changed-file-checks.json and changed-closure1.json.
    Source/scope: five source gates PASS;21approvedpaths,527old519byte-identical+8declared equivalent migrations,4new531;276prior metadata full prefixes and registered exceptions preserved+1new partial277. Parent515592/SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 unchanged. Evidence source-review.json, source-gates.json, scope-audit.json.
    Quality/governance: same current-agent EVALUATOR exact SHA PASS explicitly not independent; .agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/quality-report.json. Doctor0errors2known warnings, routing/diff PASS;19current artifact files0forbidden, no sources/helpers/raw artifacts in AP, original stash retained. Evidence exact-sha-review.json, governance.json, artifact-audit.json.
    Residual scope: native setter ownership/current-row versus temporary whole-dialog selection, full row-content splitting/nested/merged/fly/columns/protection/SfxItemSet/native item classes/widget suite and whole parity remain unverified. Existing setter scope preserved by this approved leaf; parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T21:30:32.997Z — VERIFY — ok

    By: CODER

    Note: Native separate table/row split controls verified on implementation4b698a7165909943fb9380f7c9ec78e38e0593f6. ONE upstream-absent profile13157app109inventory5scripts241Chromium PASS; actual100 coverage verified. Same-agent exact-SHA EVALUATOR pass explicitly not independent. Parent/goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T21:30:26.051Z, excerpt_hash=sha256:ab71204ea19de5e4eb4852676eccbd371f2168995200d6c45ff0eb9de13b4520

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610062106-NHEGKZ/blueprint/resolved-snapshot.json
    - old_digest: ea85bd2e2c481883f129b8e2f0a774e7f9a82996919083adb240a144c90631a0
    - current_digest: ea85bd2e2c481883f129b8e2f0a774e7f9a82996919083adb240a144c90631a0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610062106-NHEGKZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610062106-NHEGKZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert eventual implementation commit only through a new approved task; no reset/destructive stash operations, preservec85f4a0e453dfd06d6e199554784f2c286737472. Vendor always restored finally; raw only ignored app cache, no AP source/helpers/Python/raw maps/results/images/logs."
  Findings: |-
    Read-only clean main11c5f0d48574a323d5da2081711574739d30faf8; only active parent. Pinned tabledlg Reset defaulttrue, mixed row TRISTATE_INDET absent item, SplitHdl_Impl only child sensitivity, FillItemSet distinct changed-only native flags. UI exact tabletextflowpage split/splitrow labels and child indentation; native ItemSetToTableParam copies RES_LAYOUT_SPLIT to table while explicit row item dispatches SetRowSplit with temporary whole table selection when unselected. SwDoc::GetRowSplit ndtbl1 collects selected/current boxes to original row owners, returns no item for empty/mixed, default row true. Existing property dontSplit reads first-row keepTogether and unconditional SetRowSplit inverse while never setting table item; confirms real architectural/behavior bug. Existing InsertTable flag remains valid and separate. Harmless read-only no matching ndtbl1/TriState/GetTableBox and guessed crsrsh path lookups failed; route refreshed and actual swcrsr/trvltbl/native source collection inventoried. No source/helpers/artifacts saved, no network/outside/global access.

    Implementation 4b698a7165909943fb9380f7c9ec78e38e0593f6 on main. SwDoc.GetRowSplit follows the native cursor to original boxes and canonical row owners; SwFEShell forwards the getter. Empty or mixed rows return no common item; default row splitting is true. SwTextFlowPage captures separate table and row originals, Reset restores saved values, FillItemSet emits only changed items, and SplitHdl_Impl changes child sensitivity without clearing its value. Properties UI uses the exact upstream two controls, child indentation and actual mixed checkbox state; original selected boxes are passed directly. Removed conflated properties dontSplit and React row-state adapter. Explicit row items and table layout items publish separately. Insertion dontSplit remains unchanged. Existing setter scope/history was preserved in this approved leaf.
    Six initial static gates once: lint/typecheck/dependencies/docs/file-size PASS; format initially failed only new E2E formatting, original failed format closure PASS. Final scoped unchanged JSDoc/format/lint PASS on 19 code/test paths; physical untrimmed line counts below 1000. No checks weakened.
    ONE full upstream-absent profile: build PASS; 13157 app and 5 scripts PASS; 241 Chromium PASS, no skipped/flaky/failed cases. Initial inventory 108 PASS and one path-order failure; sorted only the new metadata record, then reran only the original failed inventory case: 1 PASS, 2 filtered skips retained. Focused command exit1 was solely filtered coverage thresholds. Final inventory 109 current passing cases. App initial command exit1 was solely branch coverage 12076/12077; all app cases passed. No passing/full/build/app/browser replay. Vendor restored finally; tests never invoke upstream and source/scope/AP audits awaited outside absence profiles.
    Actual100 coverage verified from genuine counters and full identical source/maps; no fabricated counts or contiguous transfers. App274files L14838/S16279/F3781/B12077 map4077ce4d538d514be585ae5ad4bb5af87df48b3e5298c25e1dd057037d2f2851 proofead594aff876b43c5ae3c909628febb2e92b8d2e6aceba0e15d4f51a499e8139. Missing unchanged editing-host branch reused only verified198 whole identical source/maps counters. Inventory38files L1464/S1523/F384/B1080 mapf195f28ad788eb5cfed858685127e2f33aee6e72542f5d26a21d90e3ce30841d proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. Raw focused inventory map9833d177acc987e538922b7a9ac58444e14932015db94355da5e5ff1aba437e3 verified against recorded digest.
    Five source gates generation/source-tree/provenance/invariants/parity PASS. Scope PASS21approved paths,527prior acceptance519byte-identical+8explicit limited migrations,4new531total. Existing literal assertions preserved except declared equivalent contracts/control labels.276prior metadata full prefixes/defaults/statuses/classifications/registered save/open/recovery exceptions retained+1new partial native ndtbl1 owner277 unverified. Entire parent515592characters SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 preserved.
    Native/mounted/history/ODT tests verify mixed/default/current/selected row reads, changed-only publication, child retention while disabled, Reset/Cancel/all tabs, original graph/list/cursor/root input and grouped3UndoRedo. Chromium1280/390 verifies exact split controls, actual whole-table page movement, undo/redo and continued cell input. Existing bullet overlap and mouse row/column resizing remain covered by this full passing Chromium profile.
    Doctor0errors2known warnings (hook shim readiness/fallback and historical2Z3962 missing implementationSHA), routing/diff PASS. Exact implementation-SHA same current-agent EVALUATOR PASS, explicitly not independent review: .agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/quality-report.json. Current19leaf/generated quality files0forbidden. No upstream sources/scripts/Python/raw maps/results/images in AP; raw only ignored app cache. Original stashc85f4a0e453dfd06d6e199554784f2c286737472 retained.
    Native row setter document ownership/current-row versus temporary whole-dialog selection remains unverified/divergent and is the next candidate. Full row-content splitting/nested/merged/fly/columns/protection, full SfxItemSet/item classes/widget suite and whole existing kernel/browser parity remain UNVERIFIED. No whole-module promotion; parent/goal ACTIVE. Final prose precedes canonical verify; finish uses actual implementation SHA.

    - Observation: Properties previously conflated first-row keepTogether with table splitting and always published the row flag.
      Impact: Independent table and mixed row settings now follow native saved-value publication and sensitivity without clearing child state.
      Resolution: Native row aggregation and direct selected boxes, separate table/row items and controls, Reset/Cancel/history/ODT and physical table movement verified. Full row splitting and native setter ownership remain unverified.
id_source: "generated"
---
## Summary

Port existing native table/row split Text Flow controls and remove conflated properties dontSplit/React row-state adapter. Source separate changed RES_LAYOUT_SPLIT and RES_ROW_SPLIT publication, native defaulttrue/mixed selected row state, child sensitivity/reset retained. Single iteration199 executable leaf under standing iterative authorization; previous198 completed progress, full parent/goal active.

## Scope

Approved21semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/ui/table/tabledlg.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/ui/table/native-table-text-flow-headline.test.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts, apps/office/src/sw/source/ui/table/native-table-text-flow-split.test.ts, apps/office/src/sw/browser/presentation/native-table-text-flow-split.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts, apps/office/e2e/writer-native-table-text-flow-split.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Seven production paths including native ndtbl1 module,8explicit old contract/control migrations,4new acceptance,2metadata.527prior acceptance519byte-identical+8known migrations;4new531total.276old metadata full prefixes/contracts/defaults/statuses/classifications/registered filename/I/O/save/open/recovery exceptions retained+1new native partial ndtbl1 owner277, semantic states unverified. Parent515592characters SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 retained. Insertion dontSplit stays solely insertion presentation field; no inserted table semantics or storage exception changes.

## Plan

1.CODER add source-shaped ndtbl1 row split aggregation over canonical boxes/lines, SwDoc.GetRowSplit native cursor admission and SwFEShell.GetRowSplit forwarding. Preserve existing setters/history/source represented flat selection boundaries; standalone dialog unselected input reads all rows and selected mode reads original boxes, no projection or retained DTO.
2.CODER extend existing SwTextFlowPage with captured layoutSplit and mixed rowSplit originals, Reset/saved values, SplitHdl_Impl sensitivity without clearing child, native changed-only FillItemSet attributes record (headline included). UI exact upstream two controls, actual HTML mixed state, source handlers, existing Reset/Cancel/OK, direct selected box inputs, remove React dontSplit state and properties inverse flag. ItemSetToTableParam only publishes explicit split items to separate native setters/table attribute; insertion field stays WriterTableDialogValue optional boundary.
3.CODER migrate only8known old contracts: scalar headline FillItemSet expectations become exact equivalent item record; properties label/table flag expectation corrected, reset obsolete unconditional dontSplit publication removed; typed history fixtures dontSplit boolean=>rowSplit inverse preserves every original graph/history/storage expectation. All other acceptance bytes/literal tokens preserved. Add independent native/mounted/history/ODT/Chromium1280/390 changed-only/selection/mixed/sensitivity/no clearing/Reset/Cancel/all tabs/physical table movement/original graph/list/cursor/grouped3UndoRedo/continued input.
4.CODER six static gates once, unchanged JSDoc/actual physical lines on19code/test paths<1000, ONEfull upstream-absent build/app/inventory/scripts/Chromium profile restored finally, no test invokes upstream/no source/scope/AP audits live. Actual100 coverage from whole identical source/maps or complete contiguous identical source/full function/branch/locations with genuine counters only; prior verified unchanged whole map permitted, no passing/full replay, only original failed/new closures.
5.Same current-agent EVALUATOR exact implementation-SHA explicitly not independent, source5gates/scope/proof/doctor/routing/diff/current quality artifact census0forbidden. Final Findings/Verification before canonical verify, finish actual implementationSHA, append complete parent prefix and clean tracked state. No subagents/network/global/outside writes; raw only ignored app cache. Full row-content splitting/merged/nested/fly/columns/protection/full SfxItemSet/widget suite/full kernel/browser parity unverified. Stop for material scope/risk/verification drift; parent/goal active.

## Verify Steps

1.Six initial static gates format/lint/typecheck/dependencies/docs/file-size ONCE, unchanged JSDoc and actual untrimmed split physical lines<1000 on19changed code/test paths. Failed/genuinely changed closures only.
2.ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor renamed inside repo/restored finally. No tests invoke upstream; no source/scope/AP audits while any absence profile live and await audits before profiles. Actual100 app/inventory coverage verified full identical source/maps or complete contiguous source/full function declaration/body/branch/location regions with actual counters, prior verified whole identical map permitted. Only original failed/genuinely new cases afterward, no historical passing/full replay, skips stay skips.
3.Source true table default, original false; row true/false/mixed and current/selected native cursor admission, empty/foreign/outside cases; saved-value-only table and row publication, child disabled retains flag, repeated toggles/Reset/Cancel/all tabs source headline record compatibility; independent native table vs row mutations, absent item preserves mixed/default flag and original graph/list/cursor/root snapshot, one grouped3UndoRedo/ODT/input, Chromium1280/390 source controls and actual physical table pages. Full row-content splitting not claimed.
4.Five source gates generation --check/source-tree/provenance/invariants/parity after restoration.21paths,527prior acceptance519byte-identical+8explicit limited migrations and all other literal assertions retained;4new531total.276old metadata full prefixes/contracts/defaults/statuses/classifications/registered exceptions preserved+1new native partial277; full parent515592characters SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 intact. Source hashes and original stash retained.
5.Doctor/routing/diff/current leaf/generated quality0forbidden; exact implementation-SHA same current-agent EVALUATOR explicitly not independent. Final prose before canonical verify; actual implementationSHA finish, clean tracked state. Whole row splitting/nested/merged/fly/columns/protection/SfxItemSet/native item classes/full parity unverified; parent/goal active.

## Verification

PASS approved iteration199 implementation 4b698a7165909943fb9380f7c9ec78e38e0593f6; progress only, whole goal ACTIVE.
Command/result: six static gates once with only original format failure closure; scoped unchanged JSDoc/format/lint and physical lines PASS. ONE upstream-absent build and full runtime profile: 13157app,5scripts,241Chromium PASS0skip/flaky; inventory108initial PASS+original failed case1closure PASS=109. Focused2filtered skips remain skipped; initial/focused nonzero coverage-only exits recorded, no passing/full replay. Vendor restored.
Coverage: actual100 app274files L14838/S16279/F3781/B12077 and inventory38files L1464/S1523/F384/B1080; full identical source/maps proof and genuine counters, no fabricated counters. Evidence evidence/absent-profile.json, failure-closure1.json, final-coverage.json, coverage-source-proof.json, static-gates.json, static-closure1.json, changed-file-checks.json and changed-closure1.json.
Source/scope: five source gates PASS;21approvedpaths,527old519byte-identical+8declared equivalent migrations,4new531;276prior metadata full prefixes and registered exceptions preserved+1new partial277. Parent515592/SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 unchanged. Evidence source-review.json, source-gates.json, scope-audit.json.
Quality/governance: same current-agent EVALUATOR exact SHA PASS explicitly not independent; .agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/quality-report.json. Doctor0errors2known warnings, routing/diff PASS;19current artifact files0forbidden, no sources/helpers/raw artifacts in AP, original stash retained. Evidence exact-sha-review.json, governance.json, artifact-audit.json.
Residual scope: native setter ownership/current-row versus temporary whole-dialog selection, full row-content splitting/nested/merged/fly/columns/protection/SfxItemSet/native item classes/widget suite and whole parity remain unverified. Existing setter scope preserved by this approved leaf; parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T21:30:32.997Z — VERIFY — ok

By: CODER

Note: Native separate table/row split controls verified on implementation4b698a7165909943fb9380f7c9ec78e38e0593f6. ONE upstream-absent profile13157app109inventory5scripts241Chromium PASS; actual100 coverage verified. Same-agent exact-SHA EVALUATOR pass explicitly not independent. Parent/goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T21:30:26.051Z, excerpt_hash=sha256:ab71204ea19de5e4eb4852676eccbd371f2168995200d6c45ff0eb9de13b4520

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610062106-NHEGKZ/blueprint/resolved-snapshot.json
- old_digest: ea85bd2e2c481883f129b8e2f0a774e7f9a82996919083adb240a144c90631a0
- current_digest: ea85bd2e2c481883f129b8e2f0a774e7f9a82996919083adb240a144c90631a0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610062106-NHEGKZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610062106-NHEGKZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert eventual implementation commit only through a new approved task; no reset/destructive stash operations, preservec85f4a0e453dfd06d6e199554784f2c286737472. Vendor always restored finally; raw only ignored app cache, no AP source/helpers/Python/raw maps/results/images/logs.

## Findings

Read-only clean main11c5f0d48574a323d5da2081711574739d30faf8; only active parent. Pinned tabledlg Reset defaulttrue, mixed row TRISTATE_INDET absent item, SplitHdl_Impl only child sensitivity, FillItemSet distinct changed-only native flags. UI exact tabletextflowpage split/splitrow labels and child indentation; native ItemSetToTableParam copies RES_LAYOUT_SPLIT to table while explicit row item dispatches SetRowSplit with temporary whole table selection when unselected. SwDoc::GetRowSplit ndtbl1 collects selected/current boxes to original row owners, returns no item for empty/mixed, default row true. Existing property dontSplit reads first-row keepTogether and unconditional SetRowSplit inverse while never setting table item; confirms real architectural/behavior bug. Existing InsertTable flag remains valid and separate. Harmless read-only no matching ndtbl1/TriState/GetTableBox and guessed crsrsh path lookups failed; route refreshed and actual swcrsr/trvltbl/native source collection inventoried. No source/helpers/artifacts saved, no network/outside/global access.

Implementation 4b698a7165909943fb9380f7c9ec78e38e0593f6 on main. SwDoc.GetRowSplit follows the native cursor to original boxes and canonical row owners; SwFEShell forwards the getter. Empty or mixed rows return no common item; default row splitting is true. SwTextFlowPage captures separate table and row originals, Reset restores saved values, FillItemSet emits only changed items, and SplitHdl_Impl changes child sensitivity without clearing its value. Properties UI uses the exact upstream two controls, child indentation and actual mixed checkbox state; original selected boxes are passed directly. Removed conflated properties dontSplit and React row-state adapter. Explicit row items and table layout items publish separately. Insertion dontSplit remains unchanged. Existing setter scope/history was preserved in this approved leaf.
Six initial static gates once: lint/typecheck/dependencies/docs/file-size PASS; format initially failed only new E2E formatting, original failed format closure PASS. Final scoped unchanged JSDoc/format/lint PASS on 19 code/test paths; physical untrimmed line counts below 1000. No checks weakened.
ONE full upstream-absent profile: build PASS; 13157 app and 5 scripts PASS; 241 Chromium PASS, no skipped/flaky/failed cases. Initial inventory 108 PASS and one path-order failure; sorted only the new metadata record, then reran only the original failed inventory case: 1 PASS, 2 filtered skips retained. Focused command exit1 was solely filtered coverage thresholds. Final inventory 109 current passing cases. App initial command exit1 was solely branch coverage 12076/12077; all app cases passed. No passing/full/build/app/browser replay. Vendor restored finally; tests never invoke upstream and source/scope/AP audits awaited outside absence profiles.
Actual100 coverage verified from genuine counters and full identical source/maps; no fabricated counts or contiguous transfers. App274files L14838/S16279/F3781/B12077 map4077ce4d538d514be585ae5ad4bb5af87df48b3e5298c25e1dd057037d2f2851 proofead594aff876b43c5ae3c909628febb2e92b8d2e6aceba0e15d4f51a499e8139. Missing unchanged editing-host branch reused only verified198 whole identical source/maps counters. Inventory38files L1464/S1523/F384/B1080 mapf195f28ad788eb5cfed858685127e2f33aee6e72542f5d26a21d90e3ce30841d proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. Raw focused inventory map9833d177acc987e538922b7a9ac58444e14932015db94355da5e5ff1aba437e3 verified against recorded digest.
Five source gates generation/source-tree/provenance/invariants/parity PASS. Scope PASS21approved paths,527prior acceptance519byte-identical+8explicit limited migrations,4new531total. Existing literal assertions preserved except declared equivalent contracts/control labels.276prior metadata full prefixes/defaults/statuses/classifications/registered save/open/recovery exceptions retained+1new partial native ndtbl1 owner277 unverified. Entire parent515592characters SHA59bfd89a7f9df46a45d5a286e8d554499995ad06109dda6d38bbc1a9937895c3 preserved.
Native/mounted/history/ODT tests verify mixed/default/current/selected row reads, changed-only publication, child retention while disabled, Reset/Cancel/all tabs, original graph/list/cursor/root input and grouped3UndoRedo. Chromium1280/390 verifies exact split controls, actual whole-table page movement, undo/redo and continued cell input. Existing bullet overlap and mouse row/column resizing remain covered by this full passing Chromium profile.
Doctor0errors2known warnings (hook shim readiness/fallback and historical2Z3962 missing implementationSHA), routing/diff PASS. Exact implementation-SHA same current-agent EVALUATOR PASS, explicitly not independent review: .agentplane/tasks/202610062106-NHEGKZ/quality/20261006-212752579-recovery-context/quality-report.json. Current19leaf/generated quality files0forbidden. No upstream sources/scripts/Python/raw maps/results/images in AP; raw only ignored app cache. Original stashc85f4a0e453dfd06d6e199554784f2c286737472 retained.
Native row setter document ownership/current-row versus temporary whole-dialog selection remains unverified/divergent and is the next candidate. Full row-content splitting/nested/merged/fly/columns/protection, full SfxItemSet/item classes/widget suite and whole existing kernel/browser parity remain UNVERIFIED. No whole-module promotion; parent/goal ACTIVE. Final prose precedes canonical verify; finish uses actual implementation SHA.

- Observation: Properties previously conflated first-row keepTogether with table splitting and always published the row flag.
  Impact: Independent table and mixed row settings now follow native saved-value publication and sensitivity without clearing child state.
  Resolution: Native row aggregation and direct selected boxes, separate table/row items and controls, Reset/Cancel/history/ODT and physical table movement verified. Full row splitting and native setter ownership remain unverified.
