---
id: "202610071105-PWQ4D5"
title: "Remove row height compatibility from table properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T11:05:44.529Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T11:26:08.076Z"
  updated_by: "CODER"
  note: "Implementation1b1e0e68 removes obsolete scalar table-properties row height; separate native API/dialog and independent history preserve mixed current/selected owners.13497app110inventory14infrastructure272Chromium resolved, actual current-source coverage100, zero passing replay and5skips retained; exact same-agent EVALUATOR PASS, not independent. Final Findings/Verification precede this record."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T11:24:42.982Z"
  updated_by: "EVALUATOR"
  note: "Exact implementation1b1e0e68 removes obsolete height ingress with source-native separate height ownership; same-agent EVALUATOR explicitly not independent."
  evaluated_sha: "1b1e0e6845caf368320f9c3e832bc87cbf53779b"
  blueprint_digest: "ae286493bbf390ce22033efc128eff694e3d1e46d8857551e3705e9ec5ceb566"
  evidence_refs:
    - ".agentplane/tasks/202610071105-PWQ4D5/README.md"
    - ".agentplane/tasks/202610071105-PWQ4D5/quality/20261007-112442982-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071105-PWQ4D5/quality/20261007-112442982-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071105-PWQ4D5/quality/20261007-112442982-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071105-PWQ4D5/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071105-PWQ4D5/evidence/exact-sha-review.json"
  findings:
    - "13497app110inventory14infrastructure272Chromium resolved,0passing replay,5focused skips retained. Actual current-source app and inventory coverage100 via290and38whole source/map certificates; original metadata and all unrelated acceptance assertions preserved. Native properties and height have independent undo groups with original mixed row owners."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: remove source-incompatible row height property ingress and migrate exact callers to native height ownership, under standing iterative user authorization."
events:
  -
    type: "status"
    at: "2026-10-07T11:05:44.956Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove source-incompatible row height property ingress and migrate exact callers to native height ownership, under standing iterative user authorization."
  -
    type: "verify"
    at: "2026-10-07T11:26:08.076Z"
    author: "CODER"
    state: "ok"
    note: "Implementation1b1e0e68 removes obsolete scalar table-properties row height; separate native API/dialog and independent history preserve mixed current/selected owners.13497app110inventory14infrastructure272Chromium resolved, actual current-source coverage100, zero passing replay and5skips retained; exact same-agent EVALUATOR PASS, not independent. Final Findings/Verification precede this record."
doc_version: 3
doc_updated_at: "2026-10-07T11:26:08.167Z"
doc_updated_by: "CODER"
description: "Iteration213 under parent202609240501-C9TN6M. Remove obsolete minRowHeight ingress from ItemSetToTableParam and insertion presentation; source tabsh properties does not set row height. Migrate exact obsolete test inputs and height-only expectations to native SetRowHeight or SwTableHeightDlg, preserve all unrelated assertions, graph owners, cursor and history. User standing iterative authorization applies; no network, save/open/recovery deviation changes or upstream source/scripts in AP."
sections:
  Summary: "Remove table-properties height compatibility in favor of source native row-height ownership."
  Scope: "Iteration213, standing user authorization. One CODER leaf removes obsolete minRowHeight from SwTableProperties and ItemSetToTableParam; insertion presentation omits fabricated zero height. Approved paths: apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx, apps/office/src/sw/browser/presentation/native-table-border-owner-history.test.tsx, apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx, apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-delta.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts, apps/office/src/sw/source/core/docnode/native-box-border-items.test.ts, apps/office/src/sw/source/core/docnode/native-table-border-common-state.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-command-separation.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Remove only obsolete old minRowHeight fields; migrate height-owner properties mode to separate SwTableHeightDlg and explicit-zero contract to direct native SetRowHeight. Native properties row height expectation becomes unchanged initial100; exact history payload adjusts only removed height delta, based on real source-bound observation. Every unrelated assertion remains byte-identical; do not weaken tests. Add native separation regression for current/selected mixed row types, independent properties and height undo groups, original owners/cursor, ODT and continued edit. Metadata existing293entries/fields/prefixes/statuses/defaults/registered deviations preserved, add only new acceptance linkage if appropriate; no blanket promotion. All old576acceptance files outside exact approved migrations byte-identical. No network/outside-repo/subagents/upstream tests/APsources/Python/scripts/raw evidence; raw snapshots/results/maps only ignored dependency cache. Six initial static gates once, failed/changed-input closure only. ONE full upstream-absent runtime profile, then original failures or genuinely new cases only; no passing replay. Strict actual100 current-source app/inventory coverage by whole identical source/maps or full contiguous declarations/bodies/enclosing mapped branches; no counter fabrication, exclusions or skip promotion. Source gates after vendor restoration; same-agent EVALUATOR explicitly not independent; exact implementationSHA then canonicalverify/finish and parent full-prefix append. Goal stays ACTIVE unless whole parity proven."
  Plan: "Iteration213, standing user authorization. One CODER leaf removes obsolete minRowHeight from SwTableProperties and ItemSetToTableParam; insertion presentation omits fabricated zero height. Approved paths: apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx, apps/office/src/sw/browser/presentation/native-table-border-owner-history.test.tsx, apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx, apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-delta.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts, apps/office/src/sw/source/core/docnode/native-box-border-items.test.ts, apps/office/src/sw/source/core/docnode/native-table-border-common-state.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-command-separation.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Remove only obsolete old minRowHeight fields; migrate height-owner properties mode to separate SwTableHeightDlg and explicit-zero contract to direct native SetRowHeight. Native properties row height expectation becomes unchanged initial100; exact history payload adjusts only removed height delta, based on real source-bound observation. Every unrelated assertion remains byte-identical; do not weaken tests. Add native separation regression for current/selected mixed row types, independent properties and height undo groups, original owners/cursor, ODT and continued edit. Metadata existing293entries/fields/prefixes/statuses/defaults/registered deviations preserved, add only new acceptance linkage if appropriate; no blanket promotion. All old576acceptance files outside exact approved migrations byte-identical. No network/outside-repo/subagents/upstream tests/APsources/Python/scripts/raw evidence; raw snapshots/results/maps only ignored dependency cache. Six initial static gates once, failed/changed-input closure only. ONE full upstream-absent runtime profile, then original failures or genuinely new cases only; no passing replay. Strict actual100 current-source app/inventory coverage by whole identical source/maps or full contiguous declarations/bodies/enclosing mapped branches; no counter fabrication, exclusions or skip promotion. Source gates after vendor restoration; same-agent EVALUATOR explicitly not independent; exact implementationSHA then canonicalverify/finish and parent full-prefix append. Goal stays ACTIVE unless whole parity proven."
  Verify Steps: |-
    1. Initial six static checks once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Only failures/changed inputs rerun; unchanged JSDoc validator and physical lines below1000 for changed sources.
    2. ONE full upstream-absent profile: test:static build, app coverage, inventory coverage,14infrastructure tests, Chromium. Restore vendor in finally. Failed-only or genuinely-new closure, no passing replay. Native mixed current/selected row owners and types stay unchanged by Properties; separate native height API/dialog controls zero/MINLAY/Fixed/Minimum and independent history. Three Undo/Redo, cursor/pending input, ODT roundtrip and continued editing verified. Preserve every unrelated old assertion and all untouched acceptance bytes.
    3. Strict actual100 app/inventory coverage bound to current full source/maps or full contiguous mapped declarations/bodies/enclosing branches/all locations; finite nonnegative final counters; raw negatives preserved, whole prior verified identical file-map fallback only. No exclusions/fabrication/skip promotion.
    4. After restoration source generation --check/tree/provenance/invariants/parity gates. Exact approved scope and all293metadata old fields/prefixes/statuses/defaults/registered deviations preserved; all576old acceptance files except approved exact obsolete-input migration intervals; APno upstream sources/Python/scripts/raw snapshots/results/maps. Doctor/routing/diff; same-agent EVALUATOR explicitly not independent at actual implementationSHA. Final Findings/Verification before canonicalverify; finish actual implementationSHA, preserve entire parent prefix and final clean state.
  Verification: |-
    Command: six initial static gates once; changed-input scoped format/lint/metadata check; ONE full upstream-absent build/app/inventory/infrastructure/Chromium then original2failed app cases only. Five source audits after restoration; strict actual current-source coverage, case/scope/metadata/AP/governance and exact implementationSHA review.
    Result: PASS source-native separate row-height ownership and removal of obsolete property ingress.
    Evidence: implementation 1b1e0e6845caf368320f9c3e832bc87cbf53779b;13497app110inventory14infrastructure272Chromium resolved,0unresolved0passing replay,5focused skips retained. Actual100 all four app/inventory metrics through290/38whole identical current source/entire-map certificates,0partial transfers; invalid V8 negative raw painter counts preserved and entire verified prior identical entry selected. See exact-sha-review.json/final-coverage.json/case-census.json/scope-final.json/source-review.json and quality/20261007-112442982-recovery-context/quality-report.json.20approved semantic paths,561prior test files byte-identical15exact migration intervals1newfile,293prior metadata complete fields/prefixes/statuses/defaults/registered deviations retained. Four priority bullet cases pass.
    Scope: Properties preserve native mixed Fixed/Minimum/Variable rows; native height API/dialog remain separate with authored zero vsMINLAY distinction, current/selected owners/cursor/pending input, independent history and three Undo/Redo, ODT reopen/continued editing. Same-agent EVALUATOR explicitly not independent. Native Name application is a newly observed follow-up; full Help/units/modal/other size/insertion completeness and whole parity remain unverified. Parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T11:26:08.076Z — VERIFY — ok

    By: CODER

    Note: Implementation1b1e0e68 removes obsolete scalar table-properties row height; separate native API/dialog and independent history preserve mixed current/selected owners.13497app110inventory14infrastructure272Chromium resolved, actual current-source coverage100, zero passing replay and5skips retained; exact same-agent EVALUATOR PASS, not independent. Final Findings/Verification precede this record.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T11:26:06.816Z, excerpt_hash=sha256:95615e071034f7caed0196e7f43c82ce62532d1ec0a0eed283c14cbbc807b78b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071105-PWQ4D5/blueprint/resolved-snapshot.json
    - old_digest: ae286493bbf390ce22033efc128eff694e3d1e46d8857551e3705e9ec5ceb566
    - current_digest: ae286493bbf390ce22033efc128eff694e3d1e46d8857551e3705e9ec5ceb566
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610071105-PWQ4D5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610071105-PWQ4D5 -m 🧩 PWQ4D5 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit if separation regresses; preserve original native owners/history and registered exceptions. Never reset unrelated changes."
  Findings: |-
    Read-only source tabsh.cxx ItemSetToTableParam does not invoke SetRowHeight; rowht.cxx native separate dialog owns Fixed/Minimum height. Existing minRowHeight is obsolete compatibility. Previous goal turn212 was progress: implementation and exact audit closed, parent appended. No live runtime process at start213.

    - Observation: Native separate height ownership now replaces minRowHeight properties compatibility. Actual13497app110inventory14infrastructure272Chromium resolved,0passing replay,5focused skips retained; strict whole-source/map current coverage100. Original two payload63 expectations migrated exact54 for removed9unit action. Six initial static gates and all source/governance/scoped closures pass.
      Impact: Properties preserve original mixed row sizes; separate native height owns its own undo group and current or selected row scope. All293metadata prior fields and561unmodified acceptance files preserved;15exact source-backed migrations and1fresh file.
      Resolution: Commit approved20semantic paths, evaluate actual implementation SHA with same-agent EVALUATOR explicitly not independent, then canonicalverify and finish; whole goal remains ACTIVE.

    Iteration213 verified closure. Implementation 1b1e0e6845caf368320f9c3e832bc87cbf53779b removes obsolete minRowHeight member and scalar SetRowHeight from ItemSetToTableParam; browser insertion presentation no longer fabricates minimum height0. Source tabsh.cxx277-443 Properties never sets row height; rowht.cxx35-67 SwTableHeightDlg owns complete Fixed/Minimum item and native SetRowHeight. Native API authored zero remains valid separately from dialog MINLAY23. Exact old height input fixtures moved to native API or separate dialog, every unrelated assertion retained. New current/selected mixed Fixed/Minimum/Variable owners preserve height through Properties and have independent Properties/height undo groups; cursor/pending input, original row/box/text, three Undo/Redo, ODT reopen and continued edit pass.

    Six initial static gates all PASS once; only changed payload literal scoped format/eslint and final metadata scoped formatting afterward. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile:13495app pass2fail of13497,110inventory14infrastructure272Chromium PASS. Initial2old property payload expectations63 became54 because removed height action retained9units; exact one literal corrected, height expectation already preserves original100 and no unrelated change. Original2failed app cases alone closure PASS;5focused skip observations retained, focused exit1 solely global subset coverage thresholds recorded honestly. Actual union13497app110inventory14infrastructure272Chromium PASS,0unresolved0passing replay. Both new independent-history cases and all passing cases never rerun. Production bytes identical initial full/build/browser/closure. Runtime terminal/vendor restored finally before audits and AP mutations.

    Strict current-source app actual100 L16255S17841F4138B13339 across290whole byte-identical source/entire-map certificates, inventory100 L1464S1523F384B1081 across38wholefiles;0partial transfers. Invalid raw V8 painter inferred else aggregate-36 preserved and rejected; complete prior verified identical source/maps/counters selected for entire unchanged painter entry, never individual clamp/manufacture/exclusion/skippromotion. App map/proof e48de84ab9ab34f6ef824d332e4c5562c6795fcbc7ddca755682c426184ab209/a142e9953d83c41b1c11f7db04dae432e43eb8bbeb6e6e404f8d6ffc9c9ca699; inventory 0a6ac30af2805c8ef8409fae3892a6015cc912a58aee518929b921e9e3f0e9b6/5c43a8f01265876178c73869204175bfde82507529383d6eac361ff12ce0b0b8. Exact implementation EVALUATOR PASS, same current coding agent explicitly not independent. Case/coverage/scope audits reconstructed byte-identically after commit and all final counters checked finite/nonnegative, whole fallback entry equals prior verified map. Canonical quality/20261007-112442982-recovery-context/quality-report.json.

    Scope20approved20actual:2production15exact source-backed old acceptance migrations1new native regression2metadata. Prior576acceptance files561byte-identical15exact obsolete-input/native-API/dialog/unchanged-height100/history63-to54 migration intervals;1new=577. Exact migration reconstruction uses repository Prettier config and preserves every unrelated byte/assertion. All293metadata complete prior fields/prefixes/statuses/defaults/registered save/open/recovery exceptions retained; no records or blanket status promotions. Source3files bind pinnedlibreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65 and2production hashes. Five post-restoration source gates and governance pass; doctor0errors2knownwarnings. Unchanged JSDoc/physical changed code paths max418lines pass. AP0forbidden upstream source/Python/raw maps/results/snapshots, only English bounded json/md, ignored project dependency cache holds raw evidence. Complete580224-character parent Findings prefix SHAe9d950be742a0cbd7662b67c797efa16b35599dee4c03930a84d5dea17071ace preserved. Four priority bullet body/cell1280/390 full Chromium regressions pass; original bullet implementation unchanged.

    Audit/tool corrections: two closure-preparation JS syntax failures happened before execution, no source/vendor/runtime mutation; source audit incorrectly assumed static ItemSetToTableParam declaration, changed exact match to actual global declaration; migration audit initially used default Prettier, corrected repository config; first ap commit lacked explicit semantic allowlist, rejected before commit, approved20exact paths then supplied. Read-only guessed local table source searches returned missing paths/no matches, no implementation effect. No passing runtime replay for these corrections.

    Residual: full Help/unit preferences/modal lifecycle/other size slots/insertion autoformat/default completeness and whole kernel/browser parity UNVERIFIED. Read-only follow-up discovery: existing Table Properties Name input emits value.name, browser forwards it to ItemSetToTableParam, but SwTableProperties/native apply omits name; source tabsh.cxx accepts FN_PARAM_TABLE_NAME and invokes SetTableName. Audit and repair native rename ownership/history as next separate task. Leaf height compatibility scope complete; parent/goal ACTIVE. Final prose before canonicalverify; finish actual implementationSHA.
id_source: "generated"
---
## Summary

Remove table-properties height compatibility in favor of source native row-height ownership.

## Scope

Iteration213, standing user authorization. One CODER leaf removes obsolete minRowHeight from SwTableProperties and ItemSetToTableParam; insertion presentation omits fabricated zero height. Approved paths: apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx, apps/office/src/sw/browser/presentation/native-table-border-owner-history.test.tsx, apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx, apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-delta.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts, apps/office/src/sw/source/core/docnode/native-box-border-items.test.ts, apps/office/src/sw/source/core/docnode/native-table-border-common-state.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-command-separation.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Remove only obsolete old minRowHeight fields; migrate height-owner properties mode to separate SwTableHeightDlg and explicit-zero contract to direct native SetRowHeight. Native properties row height expectation becomes unchanged initial100; exact history payload adjusts only removed height delta, based on real source-bound observation. Every unrelated assertion remains byte-identical; do not weaken tests. Add native separation regression for current/selected mixed row types, independent properties and height undo groups, original owners/cursor, ODT and continued edit. Metadata existing293entries/fields/prefixes/statuses/defaults/registered deviations preserved, add only new acceptance linkage if appropriate; no blanket promotion. All old576acceptance files outside exact approved migrations byte-identical. No network/outside-repo/subagents/upstream tests/APsources/Python/scripts/raw evidence; raw snapshots/results/maps only ignored dependency cache. Six initial static gates once, failed/changed-input closure only. ONE full upstream-absent runtime profile, then original failures or genuinely new cases only; no passing replay. Strict actual100 current-source app/inventory coverage by whole identical source/maps or full contiguous declarations/bodies/enclosing mapped branches; no counter fabrication, exclusions or skip promotion. Source gates after vendor restoration; same-agent EVALUATOR explicitly not independent; exact implementationSHA then canonicalverify/finish and parent full-prefix append. Goal stays ACTIVE unless whole parity proven.

## Plan

Iteration213, standing user authorization. One CODER leaf removes obsolete minRowHeight from SwTableProperties and ItemSetToTableParam; insertion presentation omits fabricated zero height. Approved paths: apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx, apps/office/src/sw/browser/presentation/native-table-border-owner-history.test.tsx, apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx, apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-delta.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts, apps/office/src/sw/source/core/docnode/native-box-border-items.test.ts, apps/office/src/sw/source/core/docnode/native-table-border-common-state.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-height-command-separation.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Remove only obsolete old minRowHeight fields; migrate height-owner properties mode to separate SwTableHeightDlg and explicit-zero contract to direct native SetRowHeight. Native properties row height expectation becomes unchanged initial100; exact history payload adjusts only removed height delta, based on real source-bound observation. Every unrelated assertion remains byte-identical; do not weaken tests. Add native separation regression for current/selected mixed row types, independent properties and height undo groups, original owners/cursor, ODT and continued edit. Metadata existing293entries/fields/prefixes/statuses/defaults/registered deviations preserved, add only new acceptance linkage if appropriate; no blanket promotion. All old576acceptance files outside exact approved migrations byte-identical. No network/outside-repo/subagents/upstream tests/APsources/Python/scripts/raw evidence; raw snapshots/results/maps only ignored dependency cache. Six initial static gates once, failed/changed-input closure only. ONE full upstream-absent runtime profile, then original failures or genuinely new cases only; no passing replay. Strict actual100 current-source app/inventory coverage by whole identical source/maps or full contiguous declarations/bodies/enclosing mapped branches; no counter fabrication, exclusions or skip promotion. Source gates after vendor restoration; same-agent EVALUATOR explicitly not independent; exact implementationSHA then canonicalverify/finish and parent full-prefix append. Goal stays ACTIVE unless whole parity proven.

## Verify Steps

1. Initial six static checks once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Only failures/changed inputs rerun; unchanged JSDoc validator and physical lines below1000 for changed sources.
2. ONE full upstream-absent profile: test:static build, app coverage, inventory coverage,14infrastructure tests, Chromium. Restore vendor in finally. Failed-only or genuinely-new closure, no passing replay. Native mixed current/selected row owners and types stay unchanged by Properties; separate native height API/dialog controls zero/MINLAY/Fixed/Minimum and independent history. Three Undo/Redo, cursor/pending input, ODT roundtrip and continued editing verified. Preserve every unrelated old assertion and all untouched acceptance bytes.
3. Strict actual100 app/inventory coverage bound to current full source/maps or full contiguous mapped declarations/bodies/enclosing branches/all locations; finite nonnegative final counters; raw negatives preserved, whole prior verified identical file-map fallback only. No exclusions/fabrication/skip promotion.
4. After restoration source generation --check/tree/provenance/invariants/parity gates. Exact approved scope and all293metadata old fields/prefixes/statuses/defaults/registered deviations preserved; all576old acceptance files except approved exact obsolete-input migration intervals; APno upstream sources/Python/scripts/raw snapshots/results/maps. Doctor/routing/diff; same-agent EVALUATOR explicitly not independent at actual implementationSHA. Final Findings/Verification before canonicalverify; finish actual implementationSHA, preserve entire parent prefix and final clean state.

## Verification

Command: six initial static gates once; changed-input scoped format/lint/metadata check; ONE full upstream-absent build/app/inventory/infrastructure/Chromium then original2failed app cases only. Five source audits after restoration; strict actual current-source coverage, case/scope/metadata/AP/governance and exact implementationSHA review.
Result: PASS source-native separate row-height ownership and removal of obsolete property ingress.
Evidence: implementation 1b1e0e6845caf368320f9c3e832bc87cbf53779b;13497app110inventory14infrastructure272Chromium resolved,0unresolved0passing replay,5focused skips retained. Actual100 all four app/inventory metrics through290/38whole identical current source/entire-map certificates,0partial transfers; invalid V8 negative raw painter counts preserved and entire verified prior identical entry selected. See exact-sha-review.json/final-coverage.json/case-census.json/scope-final.json/source-review.json and quality/20261007-112442982-recovery-context/quality-report.json.20approved semantic paths,561prior test files byte-identical15exact migration intervals1newfile,293prior metadata complete fields/prefixes/statuses/defaults/registered deviations retained. Four priority bullet cases pass.
Scope: Properties preserve native mixed Fixed/Minimum/Variable rows; native height API/dialog remain separate with authored zero vsMINLAY distinction, current/selected owners/cursor/pending input, independent history and three Undo/Redo, ODT reopen/continued editing. Same-agent EVALUATOR explicitly not independent. Native Name application is a newly observed follow-up; full Help/units/modal/other size/insertion completeness and whole parity remain unverified. Parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T11:26:08.076Z — VERIFY — ok

By: CODER

Note: Implementation1b1e0e68 removes obsolete scalar table-properties row height; separate native API/dialog and independent history preserve mixed current/selected owners.13497app110inventory14infrastructure272Chromium resolved, actual current-source coverage100, zero passing replay and5skips retained; exact same-agent EVALUATOR PASS, not independent. Final Findings/Verification precede this record.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T11:26:06.816Z, excerpt_hash=sha256:95615e071034f7caed0196e7f43c82ce62532d1ec0a0eed283c14cbbc807b78b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071105-PWQ4D5/blueprint/resolved-snapshot.json
- old_digest: ae286493bbf390ce22033efc128eff694e3d1e46d8857551e3705e9ec5ceb566
- current_digest: ae286493bbf390ce22033efc128eff694e3d1e46d8857551e3705e9ec5ceb566
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610071105-PWQ4D5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610071105-PWQ4D5 -m 🧩 PWQ4D5 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit if separation regresses; preserve original native owners/history and registered exceptions. Never reset unrelated changes.

## Findings

Read-only source tabsh.cxx ItemSetToTableParam does not invoke SetRowHeight; rowht.cxx native separate dialog owns Fixed/Minimum height. Existing minRowHeight is obsolete compatibility. Previous goal turn212 was progress: implementation and exact audit closed, parent appended. No live runtime process at start213.

- Observation: Native separate height ownership now replaces minRowHeight properties compatibility. Actual13497app110inventory14infrastructure272Chromium resolved,0passing replay,5focused skips retained; strict whole-source/map current coverage100. Original two payload63 expectations migrated exact54 for removed9unit action. Six initial static gates and all source/governance/scoped closures pass.
  Impact: Properties preserve original mixed row sizes; separate native height owns its own undo group and current or selected row scope. All293metadata prior fields and561unmodified acceptance files preserved;15exact source-backed migrations and1fresh file.
  Resolution: Commit approved20semantic paths, evaluate actual implementation SHA with same-agent EVALUATOR explicitly not independent, then canonicalverify and finish; whole goal remains ACTIVE.

Iteration213 verified closure. Implementation 1b1e0e6845caf368320f9c3e832bc87cbf53779b removes obsolete minRowHeight member and scalar SetRowHeight from ItemSetToTableParam; browser insertion presentation no longer fabricates minimum height0. Source tabsh.cxx277-443 Properties never sets row height; rowht.cxx35-67 SwTableHeightDlg owns complete Fixed/Minimum item and native SetRowHeight. Native API authored zero remains valid separately from dialog MINLAY23. Exact old height input fixtures moved to native API or separate dialog, every unrelated assertion retained. New current/selected mixed Fixed/Minimum/Variable owners preserve height through Properties and have independent Properties/height undo groups; cursor/pending input, original row/box/text, three Undo/Redo, ODT reopen and continued edit pass.

Six initial static gates all PASS once; only changed payload literal scoped format/eslint and final metadata scoped formatting afterward. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile:13495app pass2fail of13497,110inventory14infrastructure272Chromium PASS. Initial2old property payload expectations63 became54 because removed height action retained9units; exact one literal corrected, height expectation already preserves original100 and no unrelated change. Original2failed app cases alone closure PASS;5focused skip observations retained, focused exit1 solely global subset coverage thresholds recorded honestly. Actual union13497app110inventory14infrastructure272Chromium PASS,0unresolved0passing replay. Both new independent-history cases and all passing cases never rerun. Production bytes identical initial full/build/browser/closure. Runtime terminal/vendor restored finally before audits and AP mutations.

Strict current-source app actual100 L16255S17841F4138B13339 across290whole byte-identical source/entire-map certificates, inventory100 L1464S1523F384B1081 across38wholefiles;0partial transfers. Invalid raw V8 painter inferred else aggregate-36 preserved and rejected; complete prior verified identical source/maps/counters selected for entire unchanged painter entry, never individual clamp/manufacture/exclusion/skippromotion. App map/proof e48de84ab9ab34f6ef824d332e4c5562c6795fcbc7ddca755682c426184ab209/a142e9953d83c41b1c11f7db04dae432e43eb8bbeb6e6e404f8d6ffc9c9ca699; inventory 0a6ac30af2805c8ef8409fae3892a6015cc912a58aee518929b921e9e3f0e9b6/5c43a8f01265876178c73869204175bfde82507529383d6eac361ff12ce0b0b8. Exact implementation EVALUATOR PASS, same current coding agent explicitly not independent. Case/coverage/scope audits reconstructed byte-identically after commit and all final counters checked finite/nonnegative, whole fallback entry equals prior verified map. Canonical quality/20261007-112442982-recovery-context/quality-report.json.

Scope20approved20actual:2production15exact source-backed old acceptance migrations1new native regression2metadata. Prior576acceptance files561byte-identical15exact obsolete-input/native-API/dialog/unchanged-height100/history63-to54 migration intervals;1new=577. Exact migration reconstruction uses repository Prettier config and preserves every unrelated byte/assertion. All293metadata complete prior fields/prefixes/statuses/defaults/registered save/open/recovery exceptions retained; no records or blanket status promotions. Source3files bind pinnedlibreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65 and2production hashes. Five post-restoration source gates and governance pass; doctor0errors2knownwarnings. Unchanged JSDoc/physical changed code paths max418lines pass. AP0forbidden upstream source/Python/raw maps/results/snapshots, only English bounded json/md, ignored project dependency cache holds raw evidence. Complete580224-character parent Findings prefix SHAe9d950be742a0cbd7662b67c797efa16b35599dee4c03930a84d5dea17071ace preserved. Four priority bullet body/cell1280/390 full Chromium regressions pass; original bullet implementation unchanged.

Audit/tool corrections: two closure-preparation JS syntax failures happened before execution, no source/vendor/runtime mutation; source audit incorrectly assumed static ItemSetToTableParam declaration, changed exact match to actual global declaration; migration audit initially used default Prettier, corrected repository config; first ap commit lacked explicit semantic allowlist, rejected before commit, approved20exact paths then supplied. Read-only guessed local table source searches returned missing paths/no matches, no implementation effect. No passing runtime replay for these corrections.

Residual: full Help/unit preferences/modal lifecycle/other size slots/insertion autoformat/default completeness and whole kernel/browser parity UNVERIFIED. Read-only follow-up discovery: existing Table Properties Name input emits value.name, browser forwards it to ItemSetToTableParam, but SwTableProperties/native apply omits name; source tabsh.cxx accepts FN_PARAM_TABLE_NAME and invokes SetTableName. Audit and repair native rename ownership/history as next separate task. Leaf height compatibility scope complete; parent/goal ACTIVE. Final prose before canonicalverify; finish actual implementationSHA.
