---
id: "202610062133-B4YMFA"
title: "Move native row split selection into document ownership"
result_summary: "Native row split selection and history moved into document; whole Properties selection uses native cursor stack and retains pending input. Full row-content splitting and complete native lifecycle remain unverified."
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
  updated_at: "2026-10-06T21:33:47.786Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T22:00:13.194Z"
  updated_by: "CODER"
  note: "Native document row split and caller cursor stack ownership verified on5dd9b091ce82aa9955e76aee443aa98c1977f7bb. ONE full absent profile plus only originalfailed/new native closures:13169current app109inventory5scripts241initial ChromiumPASS; actual100 proof. Same-agent exactSHA qualityPASS, whole parity active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T21:59:10.033Z"
  updated_by: "EVALUATOR"
  note: "Same current-agent EVALUATOR exact implementation 5dd9b091ce82aa9955e76aee443aa98c1977f7bb; explicitly not independent review. Native document row split and temporary cursor stack ownership verified."
  evaluated_sha: "5dd9b091ce82aa9955e76aee443aa98c1977f7bb"
  blueprint_digest: "a1975a2ac0c0a6943575e0679f2d0c7f6567fbff0d681f08901b2b1e676b6e33"
  evidence_refs:
    - ".agentplane/tasks/202610062133-B4YMFA/README.md"
    - ".agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610062133-B4YMFA/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610062133-B4YMFA/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610062133-B4YMFA/evidence/coverage-source-proof.json"
    - ".agentplane/tasks/202610062133-B4YMFA/evidence/source-review.json"
    - ".agentplane/tasks/202610062133-B4YMFA/evidence/governance.json"
  findings:
    - "ONE upstream-absent full profile13164initial appPASS+originalfailedclosure1PASS+4genuinenewPASS=13169current;109inventory5scripts241Chromium PASS. Three filtered closures retain23skip observations and replay no historical passing cases; final production rebuildPASS. Actual100 source/maps/counters proof."
    - "11approvedpaths,531old tests byte-identical+3new534;277old metadata full prefixes/defaults/statuses/classifications/registered exceptions and parent520287 prefix intact. Original native graph/list/pending/cursor/grouped3UndoRedo/ODT/input retained; source/scoped/static gates and doctor/routing/diff PASS."
commit:
  hash: "5dd9b091ce82aa9955e76aee443aa98c1977f7bb"
  message: "🚧 B4YMFA code: port native document row split and cursor stack ownership"
comments:
  -
    author: "CODER"
    body: "Start: iteration200 native row split document ownership and temporary dialog selection under standing iterative authorization; no upstream/raw sources in AP, one absent test profile."
  -
    author: "CODER"
    body: "Verified: document-owned native row split and caller temporary selection/cursor stack ownership.13169current app109inventory5scripts241initial ChromiumPASS without upstream; focused failures/new cases closed, actual100 proof and same-agent qualityPASS. Whole parity active."
events:
  -
    type: "status"
    at: "2026-10-06T21:33:53.633Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: iteration200 native row split document ownership and temporary dialog selection under standing iterative authorization; no upstream/raw sources in AP, one absent test profile."
  -
    type: "verify"
    at: "2026-10-06T22:00:13.194Z"
    author: "CODER"
    state: "ok"
    note: "Native document row split and caller cursor stack ownership verified on5dd9b091ce82aa9955e76aee443aa98c1977f7bb. ONE full absent profile plus only originalfailed/new native closures:13169current app109inventory5scripts241initial ChromiumPASS; actual100 proof. Same-agent exactSHA qualityPASS, whole parity active."
  -
    type: "status"
    at: "2026-10-06T22:00:35.681Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: document-owned native row split and caller temporary selection/cursor stack ownership.13169current app109inventory5scripts241initial ChromiumPASS without upstream; focused failures/new cases closed, actual100 proof and same-agent qualityPASS. Whole parity active."
doc_version: 3
doc_updated_at: "2026-10-06T22:00:35.683Z"
doc_updated_by: "CODER"
description: "Iteration200: replace shell whole-table row setter adapter with native SwDoc/ndtbl1 current-or-selected row mutation and source caller temporary whole-table selection using native cursor stack. Preserve original model/history/storage and deliberate exceptions."
sections:
  Summary: "Iteration200 ports native document-owned row split mutation and caller temporary whole-table selection. Standing iterative authorization; previous199 is verified progress. Full parent/goal active."
  Scope: "11approved semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/docnode/native-row-split-owner.test.ts, apps/office/src/sw/source/core/crsr/native-table-cursor-stack.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Six production paths,3new tests,2metadata. All531prior acceptance byte-identical;3new534total.277prior metadata full prefixes/statuses/defaults/classifications/contracts and registered save/open/recovery deviations retained. Parent520287characters SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact. No row-height/borders scope expansion, insertion unchanged."
  Plan: |-
    1.CODER native ndtbl1 shared original row collection follows actual SwCursor point or SwTableCursor selected boxes. Document setter owns admission, original attributes, SwUndoAttrTable and notification; shell brackets and forwards, no whole-table SetRowAttr boolean adapter for split.
    2.CODER add represented SwCursorShell Push/Pop DeleteCurrent/DeleteStack and ClearMark using actual registered native cursor stack, preserve original PaM identity and selected endpoints, release stack on Close. Table properties caller explicitly Push, select whole table only if unselected, apply split, ClearMark when temporary, finally Pop. Existing selected scope and final history/cursor/list/input retained; no DTO.
    3.CODER add3independent tests covering direct doc/current row, marked ordinary ranges ignore mark/ring by source default, selected row owners/duplicates, mixed/default/empty/foreign/detached/outside refusals, repeated same-value native history, notifications; native nested stack modes/clear/restoration/disposal and exception restoration; whole-versus-selected dialog/direct setter one grouped3UndoRedo/ODT/pending attributes/original graph/cursor/list/continued input. All531old tests byte-identical, no weakened assertions.
    4.CODER six static gates once; unchanged JSDoc and actual physical lines<1000 on9code/test paths. ONE upstream-absent build/app/inventory/scripts/Chromium profile vendor restored finally. Await source/scope/AP audits outside profiles. Actual100 coverage only genuine full-identical source/maps or complete contiguous identical source/full fn/branch/location counters, verified unchanged prior whole maps permitted. No historical passing/full replay; only originalfailed/genuinelynew closures. Raw only ignored app cache, AP prose/counts/hashes only.
    5.Same current-agent EVALUATOR exact implementationSHA explicitly not independent. Five source gates/scope/doctor/routing/diff/artifact0forbidden; final prose before canonical verify; finish actualSHA and entire parent append, clean tracked state. Full nested/merged/fly/columns/protection/row-content splitting/widget/SfxItemSet/full parity unverified, no blanket promotion. No network/global/outside/subagents. Stop material drift.
  Verify Steps: |-
    Six initial static gates format/lint/typecheck/dependencies/docs/file-size ONCE; unchanged JSDoc/physical lines<1000 on9code/test paths; only failed or genuinely changed closure.
    ONE full upstream-absent build/app/inventory/scripts/Chromium profile restored finally. All tests independent of upstream; no source/scope/AP audits live and all awaited before profiles. Actual100 app/inventory genuine counters under full identical maps/source or complete contiguous source/full function/branch/location proof; skips stay skips, no passing/full replay, only originalfailed/genuinelynew closures.
    3new acceptance contracts: source current-row direct setter versus marked range/ring, original selected rows, default/mixed/no item and detached/foreign/outside; doc history and notification owner with no shell ApplyAction; same-value source history; stack both modes/nesting/ClearMark/Close/disposal and exception restoration; whole versus selected Properties publication, original graph/list/pending/cursor, grouped3UndoRedo/ODT/continued input.531prior tests all byte-identical;3new534.
    Five source gates generation --check/source-tree/provenance/invariants/parity after restoration;11approvedpaths,277prior metadata full prefixes/contracts/defaults/status/classification/registered exceptions unchanged. Parent520287/SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact, pinned source hashes and original stash retained.
    Doctor/routing/diff PASS, current artifact+generatedquality0forbidden. ExactSHA same-agent EVALUATOR explicitly not independent. Final prose before canonverify, finish actualimplementationSHA, clean final tracked/untracked. Parent/goal active; full row-content splitting/nested/merged/protection/fly/columns/SfxItemSet/widgets/full parity unverified.
  Verification: |-
    PASS approved iteration200 implementation5dd9b091ce82aa9955e76aee443aa98c1977f7bb; progress only, full goal ACTIVE.
    Command/result: six static gates once; only initial new-test lint and API type errors corrected, unchanged failed gates closure PASS. All genuinely changed scoped JSDoc/format/lint/physical lines and final typecheck PASS.
    ONE upstream-absent full build/13164appPASS1FAIL/109inventory/5scripts/241ChromiumPASS; original app failure closed and4new native cases PASS=>13169current app. Three focused closure profiles only originalfailed/genuinenew cases,23filtered skip observations retained; no historical passing/full/browser replay. Final production build/static PASS after changes; Chromium241 records initial full profile. Vendor restored; no test invokes upstream.
    Actual100 app274files L14890/S16338/F3794/B12112 and inventory38files L1464/S1523/F384/B1080; full identical source/maps or complete contiguous byte-identical regions/full fn/branch/location genuine counters proof, obsolete intermediate maps discarded. Evidence absent-profile.json, failure-closure1/2/3.json, final-coverage.json, coverage-source-proof.json, static-gates.json, static-closure1/2/3/4.json, changed-file-checks.json, changed-closure1/2/3/4.json.
    Source5gates/production closure,11paths/531oldbyte-identical+3new534/277metadata full prefixes and registered exceptions preserved; parent520287/SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact. Evidence source-review.json, source-gates.json, source-closure1.json, scope-audit.json.
    Same current-agent EVALUATOR exact SHA PASS explicitly not independent; .agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/quality-report.json. Doctor0errors2known warnings/routing/diffPASS,28current artifacts0forbidden, original stash retained. Evidence exact-sha-review.json, governance.json, artifact-audit.json.
    Full row-content splitting/nested/merged/fly/columns/protection/complete crsrsh action/selection/painting/SfxItemSet/native item classes/widgets/full parity remain unverified; native row-height setter is next ownership candidate. Parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T22:00:13.194Z — VERIFY — ok

    By: CODER

    Note: Native document row split and caller cursor stack ownership verified on5dd9b091ce82aa9955e76aee443aa98c1977f7bb. ONE full absent profile plus only originalfailed/new native closures:13169current app109inventory5scripts241initial ChromiumPASS; actual100 proof. Same-agent exactSHA qualityPASS, whole parity active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T22:00:03.687Z, excerpt_hash=sha256:cddb7740eedf670802bfbb589c86ff6974be2e647a90c60179cbc10a9dca1c3b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610062133-B4YMFA/blueprint/resolved-snapshot.json
    - old_digest: a1975a2ac0c0a6943575e0679f2d0c7f6567fbff0d681f08901b2b1e676b6e33
    - current_digest: a1975a2ac0c0a6943575e0679f2d0c7f6567fbff0d681f08901b2b1e676b6e33
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610062133-B4YMFA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610062133-B4YMFA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert eventual implementation only in a new approved task. Preserve original stashc85f4a0e453dfd06d6e199554784f2c286737472; no destructive reset or stash pop/drop. Vendor restored finally; raw only ignored app cache, no upstream/helpers/Python/raw evidence in AP."
  Findings: |-
    Clean main9c742b2a26110e2c6c3370d7a1e2134c4e5f61d1, only active parent; previous199complete progress. Pinned ndtbl1.cxx SetRowSplit collects selected/current original boxes with default bAllCursor=false, publishes table attribute undo and row flags. Native fetab forwards document setter inside action; existing SetRowSplit uses whole=true SetRowAttr, real divergence. tabsh source Push and temporary select-all when unselected, ClearMark and Pop DeleteCurrent. crsrsh Push copies actual displayed point/mark; Pop modes restore/delete registered stack, ClearMark releases actual table ring. Existing getter/page contracts stay, new row setter selection owned by document. No source stored in AP, no network/outside/global access.

    Implementation 5dd9b091ce82aa9955e76aee443aa98c1977f7bb on main. Native ndtbl1 collection resolves current original box for ordinary cursors, ignores ordinary mark/ring, uses SwTableCursor selected boxes and canonical lines once. SwDoc.SetRowSplit owns admission, original row items, SwUndoAttrTable, same-value history and notification; SwFEShell brackets and forwards actual cursor/pending attributes. Removed whole=true row split SetRowAttr adapter and its obsolete row-height expansion parameter. Properties caller Push/select whole only if unselected/apply/ClearMark/finally Pop; selected mode remains original boxes. Registered native Push/Pop DeleteCurrent/DeleteStack/ClearMark/GetStackCursor and Close release follow source endpoints. Restoring an unmarked saved cursor clears temporary table mode. Browser input refresh defers pending caret reset while native stack is active and on saved-position restoration; no DTO or copied table graph.
    Six initial static gates once: format/dependencies/docs/file-size PASS; lint failed only new test non-null assertions and typecheck failed only new SetNumRuleName API typo. Corrected new tests with explicit owner admission and existing EnsureNumRule/SetNumRule, unchanged lint/type closure PASS. Scoped unchanged JSDoc/format/lint and actual physical lines PASS; genuine production/new test closures PASS and final typecheck PASS. No gate or assertion weakened.
    ONE full upstream-absent profile build PASS; app13164PASS1FAIL (new Properties pending input assertion);109inventory5scripts241Chromium PASS0skip/flaky/fail. Chromium241 belongs to this initial full profile. Original failure exposed real pending caret attributes lost by temporary selection; native stack restoration input fixed and original failed Properties case PASS in focused closure1. New collapsed cursor case PASS; new disconnected table case initially failed because fixture lacked following text required by native deletion, fixed only that new fixture and original failed case PASS in closure2. New nested marked/table input restoration PASS. Coverage audit found collapsed saved Pop left temporary table mode; corrected native Pop and new mode-transition case PASS in closure3. Final production rebuilt static artifact after changes; no browser/full/historical passing replay. Focused profiles retained7+5+11 filtered skip observations as skipped, coverage-only nonzero exits are not case failures. Current13169app cases: initial13165 with original failure resolved+4genuine new cases. Tests never invoke upstream, vendor restored finally; source/scope/AP audits outside profiles and all awaited before each profile.
    Final actual100 app274files L14890/S16338/F3794/B12112 map2d00e8c62f0a809c8c74b0369f869420f2cfaf699a7010d1be4a50707f46ce02 proof40bcfffc0c477ef9a76737c269f22f04be9d2fc01bc11eeb3e90af5f66e1cc8f.271whole identical source/maps,3complete contiguous unchanged regions with full declaration/body function and enclosing branch/location maps, genuine counters only. Verified199 unchanged whole editing-host map counters reused; obsolete intermediate cursor maps discarded without counter transfer. Inventory38whole identical source/maps actual100 L1464/S1523/F384/B1080 map1bd4ffaed535e1fd277791d65b1cae19adb9da04066621ba0b3c7fa9543ec72f proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. No fabricated counts; all source/raw map digests verified.
    Source5gates and production source closure PASS. Scope11approved paths,531old acceptance all byte-identical+3new534;277old metadata full prefixes/contracts/defaults/statuses/classifications/registered filename/I/O/save/open/recovery exceptions unchanged. Entire parent520287characters SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 preserved. Native tests verify current versus selected/Properties whole rows, empty/foreign/disconnected/outside refusals, same-value history, stack modes/nesting/restoration/exception/Close, original graph/list/pending/cursor/root input, grouped3UndoRedo and ODT/continued cell input.
    Doctor0errors2known warnings (hook shim readiness/fallback; historical2Z3962 missing implementationSHA), routing/diff PASS. Same current-agent EVALUATOR exact SHA PASS explicitly not independent: .agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/quality-report.json. Current28leaf/generatedquality files0forbidden. No upstream sources/scripts/Python/raw maps/results/images in AP; raw only ignored app cache. Deferred stashc85f4a0e453dfd06d6e199554784f2c286737472 retained. Harmless read-only lookup found no existing trvltbl import or pending-attribute core methods; refreshed route before edits. AP evidence persistence blockers resolved by staging only active subtree and refreshing route.
    Full row-content splitting/nested/merged/fly/columns/protection, complete crsrsh action/selection/painting lifecycle, full SfxItemSet/native item classes/widget suite and whole existing kernel/browser parity UNVERIFIED. Native row-height setter still shell-owned, next source ownership candidate. No whole-module promotion; parent/goal ACTIVE. Final prose before canonical verification; finish actual implementation SHA.

    - Observation: Shell whole=true row split setter conflated current row and temporary whole-table dialog selection; temporary selection also reset pending caret input.
      Impact: Document now selects original current/selected lines and owns history; caller whole-table selection restores native cursor and input, including collapsed saved cursor mode.
      Resolution: Native stack modes, exception/Close restoration, independent row scope and original graph/list/pending/cursor/grouped3UndoRedo/ODT/input verified. Full row-content splitting and complete native lifecycle/full parity remain unverified.
id_source: "generated"
---
## Summary

Iteration200 ports native document-owned row split mutation and caller temporary whole-table selection. Standing iterative authorization; previous199 is verified progress. Full parent/goal active.

## Scope

11approved semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/docnode/native-row-split-owner.test.ts, apps/office/src/sw/source/core/crsr/native-table-cursor-stack.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Six production paths,3new tests,2metadata. All531prior acceptance byte-identical;3new534total.277prior metadata full prefixes/statuses/defaults/classifications/contracts and registered save/open/recovery deviations retained. Parent520287characters SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact. No row-height/borders scope expansion, insertion unchanged.

## Plan

1.CODER native ndtbl1 shared original row collection follows actual SwCursor point or SwTableCursor selected boxes. Document setter owns admission, original attributes, SwUndoAttrTable and notification; shell brackets and forwards, no whole-table SetRowAttr boolean adapter for split.
2.CODER add represented SwCursorShell Push/Pop DeleteCurrent/DeleteStack and ClearMark using actual registered native cursor stack, preserve original PaM identity and selected endpoints, release stack on Close. Table properties caller explicitly Push, select whole table only if unselected, apply split, ClearMark when temporary, finally Pop. Existing selected scope and final history/cursor/list/input retained; no DTO.
3.CODER add3independent tests covering direct doc/current row, marked ordinary ranges ignore mark/ring by source default, selected row owners/duplicates, mixed/default/empty/foreign/detached/outside refusals, repeated same-value native history, notifications; native nested stack modes/clear/restoration/disposal and exception restoration; whole-versus-selected dialog/direct setter one grouped3UndoRedo/ODT/pending attributes/original graph/cursor/list/continued input. All531old tests byte-identical, no weakened assertions.
4.CODER six static gates once; unchanged JSDoc and actual physical lines<1000 on9code/test paths. ONE upstream-absent build/app/inventory/scripts/Chromium profile vendor restored finally. Await source/scope/AP audits outside profiles. Actual100 coverage only genuine full-identical source/maps or complete contiguous identical source/full fn/branch/location counters, verified unchanged prior whole maps permitted. No historical passing/full replay; only originalfailed/genuinelynew closures. Raw only ignored app cache, AP prose/counts/hashes only.
5.Same current-agent EVALUATOR exact implementationSHA explicitly not independent. Five source gates/scope/doctor/routing/diff/artifact0forbidden; final prose before canonical verify; finish actualSHA and entire parent append, clean tracked state. Full nested/merged/fly/columns/protection/row-content splitting/widget/SfxItemSet/full parity unverified, no blanket promotion. No network/global/outside/subagents. Stop material drift.

## Verify Steps

Six initial static gates format/lint/typecheck/dependencies/docs/file-size ONCE; unchanged JSDoc/physical lines<1000 on9code/test paths; only failed or genuinely changed closure.
ONE full upstream-absent build/app/inventory/scripts/Chromium profile restored finally. All tests independent of upstream; no source/scope/AP audits live and all awaited before profiles. Actual100 app/inventory genuine counters under full identical maps/source or complete contiguous source/full function/branch/location proof; skips stay skips, no passing/full replay, only originalfailed/genuinelynew closures.
3new acceptance contracts: source current-row direct setter versus marked range/ring, original selected rows, default/mixed/no item and detached/foreign/outside; doc history and notification owner with no shell ApplyAction; same-value source history; stack both modes/nesting/ClearMark/Close/disposal and exception restoration; whole versus selected Properties publication, original graph/list/pending/cursor, grouped3UndoRedo/ODT/continued input.531prior tests all byte-identical;3new534.
Five source gates generation --check/source-tree/provenance/invariants/parity after restoration;11approvedpaths,277prior metadata full prefixes/contracts/defaults/status/classification/registered exceptions unchanged. Parent520287/SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact, pinned source hashes and original stash retained.
Doctor/routing/diff PASS, current artifact+generatedquality0forbidden. ExactSHA same-agent EVALUATOR explicitly not independent. Final prose before canonverify, finish actualimplementationSHA, clean final tracked/untracked. Parent/goal active; full row-content splitting/nested/merged/protection/fly/columns/SfxItemSet/widgets/full parity unverified.

## Verification

PASS approved iteration200 implementation5dd9b091ce82aa9955e76aee443aa98c1977f7bb; progress only, full goal ACTIVE.
Command/result: six static gates once; only initial new-test lint and API type errors corrected, unchanged failed gates closure PASS. All genuinely changed scoped JSDoc/format/lint/physical lines and final typecheck PASS.
ONE upstream-absent full build/13164appPASS1FAIL/109inventory/5scripts/241ChromiumPASS; original app failure closed and4new native cases PASS=>13169current app. Three focused closure profiles only originalfailed/genuinenew cases,23filtered skip observations retained; no historical passing/full/browser replay. Final production build/static PASS after changes; Chromium241 records initial full profile. Vendor restored; no test invokes upstream.
Actual100 app274files L14890/S16338/F3794/B12112 and inventory38files L1464/S1523/F384/B1080; full identical source/maps or complete contiguous byte-identical regions/full fn/branch/location genuine counters proof, obsolete intermediate maps discarded. Evidence absent-profile.json, failure-closure1/2/3.json, final-coverage.json, coverage-source-proof.json, static-gates.json, static-closure1/2/3/4.json, changed-file-checks.json, changed-closure1/2/3/4.json.
Source5gates/production closure,11paths/531oldbyte-identical+3new534/277metadata full prefixes and registered exceptions preserved; parent520287/SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact. Evidence source-review.json, source-gates.json, source-closure1.json, scope-audit.json.
Same current-agent EVALUATOR exact SHA PASS explicitly not independent; .agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/quality-report.json. Doctor0errors2known warnings/routing/diffPASS,28current artifacts0forbidden, original stash retained. Evidence exact-sha-review.json, governance.json, artifact-audit.json.
Full row-content splitting/nested/merged/fly/columns/protection/complete crsrsh action/selection/painting/SfxItemSet/native item classes/widgets/full parity remain unverified; native row-height setter is next ownership candidate. Parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T22:00:13.194Z — VERIFY — ok

By: CODER

Note: Native document row split and caller cursor stack ownership verified on5dd9b091ce82aa9955e76aee443aa98c1977f7bb. ONE full absent profile plus only originalfailed/new native closures:13169current app109inventory5scripts241initial ChromiumPASS; actual100 proof. Same-agent exactSHA qualityPASS, whole parity active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T22:00:03.687Z, excerpt_hash=sha256:cddb7740eedf670802bfbb589c86ff6974be2e647a90c60179cbc10a9dca1c3b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610062133-B4YMFA/blueprint/resolved-snapshot.json
- old_digest: a1975a2ac0c0a6943575e0679f2d0c7f6567fbff0d681f08901b2b1e676b6e33
- current_digest: a1975a2ac0c0a6943575e0679f2d0c7f6567fbff0d681f08901b2b1e676b6e33
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610062133-B4YMFA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610062133-B4YMFA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert eventual implementation only in a new approved task. Preserve original stashc85f4a0e453dfd06d6e199554784f2c286737472; no destructive reset or stash pop/drop. Vendor restored finally; raw only ignored app cache, no upstream/helpers/Python/raw evidence in AP.

## Findings

Clean main9c742b2a26110e2c6c3370d7a1e2134c4e5f61d1, only active parent; previous199complete progress. Pinned ndtbl1.cxx SetRowSplit collects selected/current original boxes with default bAllCursor=false, publishes table attribute undo and row flags. Native fetab forwards document setter inside action; existing SetRowSplit uses whole=true SetRowAttr, real divergence. tabsh source Push and temporary select-all when unselected, ClearMark and Pop DeleteCurrent. crsrsh Push copies actual displayed point/mark; Pop modes restore/delete registered stack, ClearMark releases actual table ring. Existing getter/page contracts stay, new row setter selection owned by document. No source stored in AP, no network/outside/global access.

Implementation 5dd9b091ce82aa9955e76aee443aa98c1977f7bb on main. Native ndtbl1 collection resolves current original box for ordinary cursors, ignores ordinary mark/ring, uses SwTableCursor selected boxes and canonical lines once. SwDoc.SetRowSplit owns admission, original row items, SwUndoAttrTable, same-value history and notification; SwFEShell brackets and forwards actual cursor/pending attributes. Removed whole=true row split SetRowAttr adapter and its obsolete row-height expansion parameter. Properties caller Push/select whole only if unselected/apply/ClearMark/finally Pop; selected mode remains original boxes. Registered native Push/Pop DeleteCurrent/DeleteStack/ClearMark/GetStackCursor and Close release follow source endpoints. Restoring an unmarked saved cursor clears temporary table mode. Browser input refresh defers pending caret reset while native stack is active and on saved-position restoration; no DTO or copied table graph.
Six initial static gates once: format/dependencies/docs/file-size PASS; lint failed only new test non-null assertions and typecheck failed only new SetNumRuleName API typo. Corrected new tests with explicit owner admission and existing EnsureNumRule/SetNumRule, unchanged lint/type closure PASS. Scoped unchanged JSDoc/format/lint and actual physical lines PASS; genuine production/new test closures PASS and final typecheck PASS. No gate or assertion weakened.
ONE full upstream-absent profile build PASS; app13164PASS1FAIL (new Properties pending input assertion);109inventory5scripts241Chromium PASS0skip/flaky/fail. Chromium241 belongs to this initial full profile. Original failure exposed real pending caret attributes lost by temporary selection; native stack restoration input fixed and original failed Properties case PASS in focused closure1. New collapsed cursor case PASS; new disconnected table case initially failed because fixture lacked following text required by native deletion, fixed only that new fixture and original failed case PASS in closure2. New nested marked/table input restoration PASS. Coverage audit found collapsed saved Pop left temporary table mode; corrected native Pop and new mode-transition case PASS in closure3. Final production rebuilt static artifact after changes; no browser/full/historical passing replay. Focused profiles retained7+5+11 filtered skip observations as skipped, coverage-only nonzero exits are not case failures. Current13169app cases: initial13165 with original failure resolved+4genuine new cases. Tests never invoke upstream, vendor restored finally; source/scope/AP audits outside profiles and all awaited before each profile.
Final actual100 app274files L14890/S16338/F3794/B12112 map2d00e8c62f0a809c8c74b0369f869420f2cfaf699a7010d1be4a50707f46ce02 proof40bcfffc0c477ef9a76737c269f22f04be9d2fc01bc11eeb3e90af5f66e1cc8f.271whole identical source/maps,3complete contiguous unchanged regions with full declaration/body function and enclosing branch/location maps, genuine counters only. Verified199 unchanged whole editing-host map counters reused; obsolete intermediate cursor maps discarded without counter transfer. Inventory38whole identical source/maps actual100 L1464/S1523/F384/B1080 map1bd4ffaed535e1fd277791d65b1cae19adb9da04066621ba0b3c7fa9543ec72f proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. No fabricated counts; all source/raw map digests verified.
Source5gates and production source closure PASS. Scope11approved paths,531old acceptance all byte-identical+3new534;277old metadata full prefixes/contracts/defaults/statuses/classifications/registered filename/I/O/save/open/recovery exceptions unchanged. Entire parent520287characters SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 preserved. Native tests verify current versus selected/Properties whole rows, empty/foreign/disconnected/outside refusals, same-value history, stack modes/nesting/restoration/exception/Close, original graph/list/pending/cursor/root input, grouped3UndoRedo and ODT/continued cell input.
Doctor0errors2known warnings (hook shim readiness/fallback; historical2Z3962 missing implementationSHA), routing/diff PASS. Same current-agent EVALUATOR exact SHA PASS explicitly not independent: .agentplane/tasks/202610062133-B4YMFA/quality/20261006-215910033-recovery-context/quality-report.json. Current28leaf/generatedquality files0forbidden. No upstream sources/scripts/Python/raw maps/results/images in AP; raw only ignored app cache. Deferred stashc85f4a0e453dfd06d6e199554784f2c286737472 retained. Harmless read-only lookup found no existing trvltbl import or pending-attribute core methods; refreshed route before edits. AP evidence persistence blockers resolved by staging only active subtree and refreshing route.
Full row-content splitting/nested/merged/fly/columns/protection, complete crsrsh action/selection/painting lifecycle, full SfxItemSet/native item classes/widget suite and whole existing kernel/browser parity UNVERIFIED. Native row-height setter still shell-owned, next source ownership candidate. No whole-module promotion; parent/goal ACTIVE. Final prose before canonical verification; finish actual implementation SHA.

- Observation: Shell whole=true row split setter conflated current row and temporary whole-table dialog selection; temporary selection also reset pending caret input.
  Impact: Document now selects original current/selected lines and owns history; caller whole-table selection restores native cursor and input, including collapsed saved cursor mode.
  Resolution: Native stack modes, exception/Close restoration, independent row scope and original graph/list/pending/cursor/grouped3UndoRedo/ODT/input verified. Full row-content splitting and complete native lifecycle/full parity remain unverified.
