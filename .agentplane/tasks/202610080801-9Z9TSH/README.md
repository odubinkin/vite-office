---
id: "202610080801-9Z9TSH"
title: "Use native column items at the Writer ruler boundary"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 28
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T08:26:33.098Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T08:57:32.402Z"
  updated_by: "CODER"
  note: "Final native column item boundary verified at a9b69b581295c980996d31cd0e8ffccdb96bce1c. Exact same-agent review PASS; one upstream-absent full profile,13711 app/110 inventory/16 infrastructure/299 Chromium unique passes, all-four exact-source coverage100 and zero passing replay. Protected IO,613 old acceptance files,original21 migrated assertions,parent prefix and stash preserved; full ruler/slot/row/StateTabWin parity remains partial."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T08:56:31.979Z"
  updated_by: "EVALUATOR"
  note: "Same-current-agent EVALUATOR, explicitly not independent: exact a9b69b581295 implementation satisfies approved native column boundary scope."
  evaluated_sha: "a9b69b581295c980996d31cd0e8ffccdb96bce1c"
  blueprint_digest: "246fb558f43f84d6899218c094d2a7314142bdb70d885fdc15757225dc5f1c48"
  evidence_refs:
    - ".agentplane/tasks/202610080801-9Z9TSH/README.md"
    - ".agentplane/tasks/202610080801-9Z9TSH/quality/20261008-085631979-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610080801-9Z9TSH/quality/20261008-085631979-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610080801-9Z9TSH/quality/20261008-085631979-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610080801-9Z9TSH/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610080801-9Z9TSH/evidence/implementation-review.json"
    - ".agentplane/tasks/202610080801-9Z9TSH/evidence/native-source-review.json"
  findings:
    - "Four committed source-bound evidence reconstructions are byte-identical; scope14,613 prior acceptance files unchanged and original21 selector assertions retained; all-four app/inventory coverage100,13711/110/16/299 unique passes and zero passing replay."
    - "Native defaults, value copying, signed limits, uint16 constructor/count/index contracts and real Writer drag item ingress are pinned-source backed; protected IO baseline remains identical."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement production-used native column item boundary under standing goal authorization, with source-bound verification and one absent runtime profile."
events:
  -
    type: "status"
    at: "2026-10-08T08:01:27.937Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement production-used native column item boundary under standing goal authorization, with source-bound verification and one absent runtime profile."
  -
    type: "verify"
    at: "2026-10-08T08:57:32.402Z"
    author: "CODER"
    state: "ok"
    note: "Final native column item boundary verified at a9b69b581295c980996d31cd0e8ffccdb96bce1c. Exact same-agent review PASS; one upstream-absent full profile,13711 app/110 inventory/16 infrastructure/299 Chromium unique passes, all-four exact-source coverage100 and zero passing replay. Protected IO,613 old acceptance files,original21 migrated assertions,parent prefix and stash preserved; full ruler/slot/row/StateTabWin parity remains partial."
doc_version: 3
doc_updated_at: "2026-10-08T08:57:32.458Z"
doc_updated_by: "CODER"
description: "Iteration229: production-used SvxColumnItem values and SwView-owned table-column conversion replace direct separator visibility and limits in document drag admission. Preserve original SwTabCols model/apply owners and prior acceptance; generic ruler ownership is the next dependency."
sections:
  Summary: "Replace direct Writer separator interpretation at the ruler boundary with actual source-owned native column items."
  Scope: |-
    apps/office/src/svl/source/items/poolitem.ts
    apps/office/src/svx/inc/svxids.ts
    apps/office/src/svx/source/dialog/rulritem.ts
    apps/office/src/sw/source/uibase/uiview/viewtab.ts
    apps/office/src/sw/source/uibase/uiview/view.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    scripts/check-module-boundaries.mjs
    apps/office/src/svx/source/dialog/native-column-item.test.ts
    apps/office/src/sw/source/uibase/uiview/native-column-item-boundary.test.ts
    scripts/native-column-item-boundary.test.ts
    apps/office/src/sw/browser/presentation/current-dialog-baseline.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-document-key.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "One architectural issue: document column drag must receive actual SvxColumnItem descriptions through SwView before generic ruler extraction. Port native column defaults, descriptions (including unsigned-short maximum clamp), deep Append/Clone, equality ignoring ortho as native, active/first/last/consistency/orthogonal operations and default failed QueryValue. Add bounded SfxPoolItem SetWhich in the already bounded local value ownership domain. Port the actual StateTabWin table-column conversion block in viewtab.ts (LTR/RTL, page border distances and uint16 cast) and SwView production coordination; consume description visibility/end/min/max in existing drag admission, retaining original SwTabCols preview/apply owners and native mouse/history. Permit only source-bound svx->svl dependency, with fresh positive/reverse/browser boundary tests. Scope14 semantic paths (7 production/checker,4 fresh test,1 original-failure selector migration,2 metadata),613 prior acceptance files byte-identical and the original614th file preserves every assertion/input through a footer-only bookmark Close selector migration,305 metadata prefixes/status/defaults preserved plus2 honest partial mapped modules. Initial6static once; ONE full upstream-absent build/app/inventory/infra/Chromium with finally restoration; later only actual failures/new cases or failed/changed static inputs; source-bound all4app/inventory100 without clamps. Five restored source gates. No network/outside-repo/destructive operations, no sources/scripts/raw AP artifacts; registered IO deviations unchanged. Standing user goal and next UI architecture request authorize this local task. Full SvxRuler/SfxBindings slot ownership, row conversion, full StateTabWin frames and UNO member conversions remain explicitly unverified and are not renamed fake owners. Stop on material drift. Verification closure after the single full run: the current baseline contains independently completed browser IO/dialog changes from BKYEAC/Q0C52Z/XDXRZG/HA9KH9 since previous parity228. Preserve all of that production code and registered IO deviations byte-identically; add genuinely new failure/lifecycle cases only for uncovered current baseline branches. Fix metadata ordering with exact lexicographic comparison. This is in-scope local verification under standing goal authorization, with no additional full run or passing replay; production scope remains unchanged."
  Verify Steps: |-
    1. Pinned rulritem.hxx/cxx, viewtab.cxx StateTabWin column branch, poolitem.hxx SetWhich, svxids/solar and Library_svx native edge anchors; literal default/copy/equality/clamp/active/orthogonal/LTR/RTL/uint16/borders tests plus production mouse admission consumes native descriptions and supports original owners/history. Tests never read/invoke upstream; current existing mouse column/row/linear/proportional/browser cases execute once unchanged.
    2. Initial6format/lint/type/dependencies/JSDoc/physical-size gates once; only failed/changed-input closures. ONE full absent build/app/inventory/infra/Chromium profile with finally restoration and zero passing replay; coverage all4app/inventory100 through entire identical source/maps or complete contiguous declaration/body/enclosing branch/all locations proofs, never sanitize counters. Retain original failures/skips; subsequent only actual failures/new cases.
    3. Five restored resource/source-tree/provenance/invariants/parity gates; scope14,613 old acceptance byte-identical plus1 exact original-failure bookmark footer selector migration with all original assertions/inputs retained,305 old records/classes/status/defaults preserved plus2 partial mapped records, allphysicalcode<1000, AP source/script/raw ban, doctor/routing/diff. Preserve parent648373char SHA831af71783e10fc16f212c74b179c0c58da3b478c11ee96bb6656a48163276a3 and stash c85f4a0e453dfd06d6e199554784f2c286737472. Full goal remains ACTIVE; no broad module promotion.
    4. Final Findings/Verification before canonical verify; exact implementation SHA reconstruction and same-current-agent EVALUATOR explicitly not independent; commit verify checkpoint then finish actual implementation SHA and clean final Git. 5. Close exactly the original failed bookmark/inventory cases; add genuinely new current-baseline dialog/collision/storage failure and lifecycle cases only where exact source-bound coverage is missing. Preserve all protected IO production bytes and conscious deviations; source-bound all4 coverage100 criteria unchanged.
  Verification: |-
    Command: initial6 static gates and static-closures1..3; unchanged scoped JSDoc validator and actual physical lines.
    Result: PASS final; original lint2errors and closure2docs7missing comments retained and resolved.
    Evidence: format/type/dependencies/docs/size initially passed; all final changed-input gates PASS. Maximum physical667<1000.
    Scope: approved production/test paths, no passing-input broad static replay.

    Command: ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore upstream; exactly original-failure and genuinely-new-case-only closure1.
    Result: PASS final semantic union.
    Evidence: initial app13690PASS1FAIL and inventory109PASS1FAIL retained; infra16PASS,Chrome299PASS0flaky,buildPASS. Closure app19PASS23SKIP (1original+18new),inventory1PASS2SKIP. Focused CLIexit1 remains recorded for whole-graph thresholds; no actual failed/uncaught case. Final unique13711app110inventory16infra299Chrome PASS,0passing replay.
    Scope: local runtime only; tests never invoke pinned upstream.

    Command: exact complete-source/location coverage proof and occurrence-ordinal case census reconstruction.
    Result: PASS.
    Evidence: all4app100 L16898/S18559/F4304/B13968; all4inventory100 L1464/S1523/F384/B1081. 303wholeapp38wholeinventory17prior regions, exact current-source bound maps, no count clamp/exclusion. Initial remaining baseline5-file gaps closed by18 genuinely new cases; every original failure/skip retained.
    Scope: entire application/inventory source graph, protected current IO baseline preserved.

    Command: five source-only gates after restoration plus native source review/scope/artifact/governance audits.
    Result: PASS.
    Evidence: pin9bc445578031fecf56086729d8e4940c77e14d65,8 native source hashes/anchors,7 actual production hashes; provenance307records218mapped73browser16infra; scope14,613oldbyte-identical plus1 exact footer selector with original assertions/input preserved;305records retained+2partial;4protectedIOsource hashes unchanged. AP0source/Python/raw; doctor0errors2oldwarnings;routing/diff PASS.
    Scope: native contract linkage and local workflow, no IO/recovery deviations changed.

    Exact implementation SHA review PASS as recorded below; full SvxRuler/slots/row values/full StateTabWin and whole parity explicitly unverified.
    Command: native uint16 constructor/count correction closure2 and changed-input static4/source-closure1.
    Result: PASS.
    Evidence: one genuinely new wrap/copy/consistency case PASS7SKIP; actual changed-production build PASS without upstream; zero passing-case replay. Constructor/Count casts now match sal_uInt16, raw vector Clone/consistency retained across65536 entries. Current-source all4coverage100 reconstructed; total unique13711app.
    Scope: actual native item contract; protected browser IO bytes and299 earlier browser scenarios unchanged.

    Final At argument review: pinned sal_uInt16 index conversion is applied before owned access. One genuinely new index-wrap/mutable-ownership case PASS8SKIP in upstream-absent closure3; changed-input build and static5/source-closure2 PASS. Final unique13711app110inventory16infra299Chromium,20 new app cases beyond initial profile,38 app skip observations retained, no passing replay. All-four exact current-source coverage100 totals unchanged. Constructor/count implementation a6ff43a732eb5641027ccb3ed974a2d239140b3e is followed by the At correction; final implementation SHA review is recorded below.

    Exact final implementation review PASS for a9b69b581295c980996d31cd0e8ffccdb96bce1c, following acfe8310970925d5106467203d21d8d6b6b2bf3d and a6ff43a732eb5641027ccb3ed974a2d239140b3e. Four committed final coverage/case/scope/native-source evidence reconstructions are byte-identical, all14 semantic files match actual evaluated HEAD, complete current-map source ownership and finite nonnegative counters confirmed. Same-current-agent EVALUATOR is explicitly not independent; quality/20261008-085631979-recovery-context/quality-report.json records PASS at that SHA. Source-bound all-four100 app/inventory; unique13711app110inventory16infra299Chromium, original failures and38/2skip observations retained, zero passing replay. Parent/stash/pin/protected IO checks pass. Canonical verification and its committed checkpoint use these final documents and actual implementation SHA; bounded leaf completion makes no whole-goal completion claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T08:57:32.402Z — VERIFY — ok

    By: CODER

    Note: Final native column item boundary verified at a9b69b581295c980996d31cd0e8ffccdb96bce1c. Exact same-agent review PASS; one upstream-absent full profile,13711 app/110 inventory/16 infrastructure/299 Chromium unique passes, all-four exact-source coverage100 and zero passing replay. Protected IO,613 old acceptance files,original21 migrated assertions,parent prefix and stash preserved; full ruler/slot/row/StateTabWin parity remains partial.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T08:57:16.043Z, excerpt_hash=sha256:d812350c9b1a8e0bae5a706a21ae78afc364016566f9e2feb5b9bb9e04e16bd9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080801-9Z9TSH/blueprint/resolved-snapshot.json
    - old_digest: 246fb558f43f84d6899218c094d2a7314142bdb70d885fdc15757225dc5f1c48
    - current_digest: 246fb558f43f84d6899218c094d2a7314142bdb70d885fdc15757225dc5f1c48
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610080801-9Z9TSH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610080801-9Z9TSH -m 🧩 9Z9TSH task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and rerun affected checks under a new approved task. Preserve native model/history and registered IO deviations."
  Findings: |-
    Iteration229 current baseline is b5da6bf4c985f88be6aa5bddae6a1957ad10afc6 (the stale preloaded546c/612/303 facts in the initial note are superseded). Actual baseline614 acceptance files and305 records includes completed BKYEAC/Q0C52Z/XDXRZG/HA9KH9 browser persistence/dialog work; that production code is byte-identical throughout this task. Goal readback ACTIVE after resumed continuation. The preceding status-only question turn was no progress; this turn implements the next safe architectural dependency.

    Native boundary implemented: SvxColumnDescription/SvxColumnItem in the actual SVX source owner retain default0 edges/active, table=false, ortho=true, upper-only65535 limit clamp, signed widths, mutable owned description copies in Append/Clone, equality deliberately excluding ortho, and native active/first/last/consistency/equal-width operations. Default QueryValue has no payload. SfxPoolItem gains SetWhich in the already bounded local owned-value domain; no refcount/full uint16 claim. SwView coordinates the actual StateTabWin table-column conversion block in viewtab.ts: zero-clamped frame distances cast to uint16, LTR/RTL relative end/limit order and unconstrained visible tail. Existing document column drag uses that real view item visibility/end/min/max, while original SwTabCols remains model/preview/apply storage. Only source-owned Library_svx svx->svl dependency is admitted; no SW/browser reverse dependency.

    Initial six static gates executed once: format/type/dependency/docs/size PASS; lint FAIL on2 non-null assertions in the fresh fixture. Static closure1 fixed those, all changed checks PASS. Expanded verification closure for current baseline adds one actual original-failure bookmark footer selector migration and one fresh18-case dialog/IO lifecycle/failure file; production scope remains unchanged. Closure2 format/lint/type PASS and docs FAIL for7 new host-list callbacks; closure3 documentation and changed checks all PASS. No check or size-budget waivers were used. Source snapshots/scripts/raw results stay only in ignored local cache.

    ONE full upstream-absent profile: build PASS; app13690PASS1FAIL; inventory109PASS1FAIL; infrastructure16PASS; Chromium299PASS0flaky. Old bookmark direct-document key test found two legitimate Close controls after completed dialog chrome changes; only selector now targets pinned insertbookmark.ui resource action area, keeping all original21 assertions/inputs and23 skipped siblings unchanged. Metadata used locale sorting, which the unchanged lexicographic CLI rejected; sorted exactly. Original failures remain in initial profile. Closure1 runs exactly those original failures plus18 genuinely new current-baseline lifecycle/error cases: app19PASS23SKIP; inventory1PASS2SKIP, no browser/build or passing replay. Focused CLI exits1 are retained as whole-graph coverage thresholds, not semantic assertion failures. Two known early-guard rejected UI promises are captured by a bounded host Promise hook with exact complete error assertions; zero actual unhandled errors, no production hooks or behavior changes and no normal-browser/upstream claim. Preserved IO title/content thresholds, atomic same-identity replacement and host request/transaction failures are tested without altering intentional deviations.

    Final unique13711app110inventory16infra299Chromium PASS,0unresolved0flaky0uncaught0passing replay. Source-bound all4 app100 L16898/S18559/F4304/B13968 and inventory100 L1464/S1523/F384/B1081. Actual maps source-bound to whole byte-identical maps/sources or complete contiguous declaration/body/enclosing branch/all locations, no clamping/exclusions or sanitized counters. First proof left5 current-baseline dialog/IO files incomplete since protected changes after228;18 genuinely new cases close those gaps. Final proof includes303whole app38whole inventory and17 complete prior region transfers; no test counter edit. Five restored source-only gates PASS: resources--check,source-tree,provenance307(218mapped73browser16infra),invariants,parity. Upstream pin9bc445578031fecf56086729d8e4940c77e14d65 verified with8 native source/header/build/resource hashes and exact anchor IDs/lines.

    Scope14:7 production/checker paths,4 fresh acceptance files,1 source-backed selector migration,2 metadata. All613 other prior acceptance files byte-identical; all305 prior metadata records/fields/evidence prefixes/status/defaults/classes and registered IO deviations retained plus2 honest partial unverified native modules. Four explicit protected IO production hashes equal current baseline. Physical code maximum667<1000; JSDoc/routing/diff PASS. Whole AP5678 files0forbidden source/Python/raw maps/results/snapshots. Doctor0errors2pre-existing warnings only: managed readiness/fallback shim and historical DONE2Z3962 missing implementation SHA. Entire parent648373char prefix SHA831af71783e10fc16f212c74b179c0c58da3b478c11ee96bb6656a48163276a3 and stashc85f4a0e453dfd06d6e199554784f2c286737472 retained.

    Residual: full SvxRuler/SfxBindings/SfxItemSet slots and complete StateTabWin page/frame/section ownership; row value conversion; production native active-column selection; vertical/RTL document drag; pooled refcount mutation guards/full uint16 WhichId; nonzero member QueryValue/PutValue/CreateDefault/GetPresentation. No complete ruler or whole parity claim. Existing browser item conversion is production-used, not a renamed SwTabCols wrapper. Next architectural work can consume these generic SVX values without a reverse SW dependency. The exact implementation review is recorded below; same-current-agent EVALUATOR is explicitly not independent. Full goal remains ACTIVE. Final native-contract review adds explicit uint16 casts for constructor active/edges and Count, retaining raw vector size for consistency and deep Clone even when65536 descriptions wrap Count to0. One genuinely new overflow case PASS7SKIP in closure2, actual changed-production rebuild PASS while upstream absent and restored; no full or passing-test replay. Static closure4 PASS; only changed-input provenance/parity source gates repeated and PASS. Initial implementationacfe8310970925d5106467203d21d8d6b6b2bf3d is followed by this correction under the same approved semantic scope. Actual original selector assertions21, not35; scope audit is authoritative.

    Final At argument review: pinned sal_uInt16 index conversion is applied before owned access. One genuinely new index-wrap/mutable-ownership case PASS8SKIP in upstream-absent closure3; changed-input build and static5/source-closure2 PASS. Final unique13711app110inventory16infra299Chromium,20 new app cases beyond initial profile,38 app skip observations retained, no passing replay. All-four exact current-source coverage100 totals unchanged. Constructor/count implementation a6ff43a732eb5641027ccb3ed974a2d239140b3e is followed by the At correction; final implementation SHA review is recorded below.

    Exact final implementation review PASS for a9b69b581295c980996d31cd0e8ffccdb96bce1c, following acfe8310970925d5106467203d21d8d6b6b2bf3d and a6ff43a732eb5641027ccb3ed974a2d239140b3e. Four committed final coverage/case/scope/native-source evidence reconstructions are byte-identical, all14 semantic files match actual evaluated HEAD, complete current-map source ownership and finite nonnegative counters confirmed. Same-current-agent EVALUATOR is explicitly not independent; quality/20261008-085631979-recovery-context/quality-report.json records PASS at that SHA. Source-bound all-four100 app/inventory; unique13711app110inventory16infra299Chromium, original failures and38/2skip observations retained, zero passing replay. Parent/stash/pin/protected IO checks pass. Canonical verification and its committed checkpoint use these final documents and actual implementation SHA; bounded leaf completion makes no whole-goal completion claim.
id_source: "generated"
---
## Summary

Replace direct Writer separator interpretation at the ruler boundary with actual source-owned native column items.

## Scope

apps/office/src/svl/source/items/poolitem.ts
apps/office/src/svx/inc/svxids.ts
apps/office/src/svx/source/dialog/rulritem.ts
apps/office/src/sw/source/uibase/uiview/viewtab.ts
apps/office/src/sw/source/uibase/uiview/view.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
scripts/check-module-boundaries.mjs
apps/office/src/svx/source/dialog/native-column-item.test.ts
apps/office/src/sw/source/uibase/uiview/native-column-item-boundary.test.ts
scripts/native-column-item-boundary.test.ts
apps/office/src/sw/browser/presentation/current-dialog-baseline.test.tsx
apps/office/src/sw/browser/presentation/writer-view-document-key.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

One architectural issue: document column drag must receive actual SvxColumnItem descriptions through SwView before generic ruler extraction. Port native column defaults, descriptions (including unsigned-short maximum clamp), deep Append/Clone, equality ignoring ortho as native, active/first/last/consistency/orthogonal operations and default failed QueryValue. Add bounded SfxPoolItem SetWhich in the already bounded local value ownership domain. Port the actual StateTabWin table-column conversion block in viewtab.ts (LTR/RTL, page border distances and uint16 cast) and SwView production coordination; consume description visibility/end/min/max in existing drag admission, retaining original SwTabCols preview/apply owners and native mouse/history. Permit only source-bound svx->svl dependency, with fresh positive/reverse/browser boundary tests. Scope14 semantic paths (7 production/checker,4 fresh test,1 original-failure selector migration,2 metadata),613 prior acceptance files byte-identical and the original614th file preserves every assertion/input through a footer-only bookmark Close selector migration,305 metadata prefixes/status/defaults preserved plus2 honest partial mapped modules. Initial6static once; ONE full upstream-absent build/app/inventory/infra/Chromium with finally restoration; later only actual failures/new cases or failed/changed static inputs; source-bound all4app/inventory100 without clamps. Five restored source gates. No network/outside-repo/destructive operations, no sources/scripts/raw AP artifacts; registered IO deviations unchanged. Standing user goal and next UI architecture request authorize this local task. Full SvxRuler/SfxBindings slot ownership, row conversion, full StateTabWin frames and UNO member conversions remain explicitly unverified and are not renamed fake owners. Stop on material drift. Verification closure after the single full run: the current baseline contains independently completed browser IO/dialog changes from BKYEAC/Q0C52Z/XDXRZG/HA9KH9 since previous parity228. Preserve all of that production code and registered IO deviations byte-identically; add genuinely new failure/lifecycle cases only for uncovered current baseline branches. Fix metadata ordering with exact lexicographic comparison. This is in-scope local verification under standing goal authorization, with no additional full run or passing replay; production scope remains unchanged.

## Verify Steps

1. Pinned rulritem.hxx/cxx, viewtab.cxx StateTabWin column branch, poolitem.hxx SetWhich, svxids/solar and Library_svx native edge anchors; literal default/copy/equality/clamp/active/orthogonal/LTR/RTL/uint16/borders tests plus production mouse admission consumes native descriptions and supports original owners/history. Tests never read/invoke upstream; current existing mouse column/row/linear/proportional/browser cases execute once unchanged.
2. Initial6format/lint/type/dependencies/JSDoc/physical-size gates once; only failed/changed-input closures. ONE full absent build/app/inventory/infra/Chromium profile with finally restoration and zero passing replay; coverage all4app/inventory100 through entire identical source/maps or complete contiguous declaration/body/enclosing branch/all locations proofs, never sanitize counters. Retain original failures/skips; subsequent only actual failures/new cases.
3. Five restored resource/source-tree/provenance/invariants/parity gates; scope14,613 old acceptance byte-identical plus1 exact original-failure bookmark footer selector migration with all original assertions/inputs retained,305 old records/classes/status/defaults preserved plus2 partial mapped records, allphysicalcode<1000, AP source/script/raw ban, doctor/routing/diff. Preserve parent648373char SHA831af71783e10fc16f212c74b179c0c58da3b478c11ee96bb6656a48163276a3 and stash c85f4a0e453dfd06d6e199554784f2c286737472. Full goal remains ACTIVE; no broad module promotion.
4. Final Findings/Verification before canonical verify; exact implementation SHA reconstruction and same-current-agent EVALUATOR explicitly not independent; commit verify checkpoint then finish actual implementation SHA and clean final Git. 5. Close exactly the original failed bookmark/inventory cases; add genuinely new current-baseline dialog/collision/storage failure and lifecycle cases only where exact source-bound coverage is missing. Preserve all protected IO production bytes and conscious deviations; source-bound all4 coverage100 criteria unchanged.

## Verification

Command: initial6 static gates and static-closures1..3; unchanged scoped JSDoc validator and actual physical lines.
Result: PASS final; original lint2errors and closure2docs7missing comments retained and resolved.
Evidence: format/type/dependencies/docs/size initially passed; all final changed-input gates PASS. Maximum physical667<1000.
Scope: approved production/test paths, no passing-input broad static replay.

Command: ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore upstream; exactly original-failure and genuinely-new-case-only closure1.
Result: PASS final semantic union.
Evidence: initial app13690PASS1FAIL and inventory109PASS1FAIL retained; infra16PASS,Chrome299PASS0flaky,buildPASS. Closure app19PASS23SKIP (1original+18new),inventory1PASS2SKIP. Focused CLIexit1 remains recorded for whole-graph thresholds; no actual failed/uncaught case. Final unique13711app110inventory16infra299Chrome PASS,0passing replay.
Scope: local runtime only; tests never invoke pinned upstream.

Command: exact complete-source/location coverage proof and occurrence-ordinal case census reconstruction.
Result: PASS.
Evidence: all4app100 L16898/S18559/F4304/B13968; all4inventory100 L1464/S1523/F384/B1081. 303wholeapp38wholeinventory17prior regions, exact current-source bound maps, no count clamp/exclusion. Initial remaining baseline5-file gaps closed by18 genuinely new cases; every original failure/skip retained.
Scope: entire application/inventory source graph, protected current IO baseline preserved.

Command: five source-only gates after restoration plus native source review/scope/artifact/governance audits.
Result: PASS.
Evidence: pin9bc445578031fecf56086729d8e4940c77e14d65,8 native source hashes/anchors,7 actual production hashes; provenance307records218mapped73browser16infra; scope14,613oldbyte-identical plus1 exact footer selector with original assertions/input preserved;305records retained+2partial;4protectedIOsource hashes unchanged. AP0source/Python/raw; doctor0errors2oldwarnings;routing/diff PASS.
Scope: native contract linkage and local workflow, no IO/recovery deviations changed.

Exact implementation SHA review PASS as recorded below; full SvxRuler/slots/row values/full StateTabWin and whole parity explicitly unverified.
Command: native uint16 constructor/count correction closure2 and changed-input static4/source-closure1.
Result: PASS.
Evidence: one genuinely new wrap/copy/consistency case PASS7SKIP; actual changed-production build PASS without upstream; zero passing-case replay. Constructor/Count casts now match sal_uInt16, raw vector Clone/consistency retained across65536 entries. Current-source all4coverage100 reconstructed; total unique13711app.
Scope: actual native item contract; protected browser IO bytes and299 earlier browser scenarios unchanged.

Final At argument review: pinned sal_uInt16 index conversion is applied before owned access. One genuinely new index-wrap/mutable-ownership case PASS8SKIP in upstream-absent closure3; changed-input build and static5/source-closure2 PASS. Final unique13711app110inventory16infra299Chromium,20 new app cases beyond initial profile,38 app skip observations retained, no passing replay. All-four exact current-source coverage100 totals unchanged. Constructor/count implementation a6ff43a732eb5641027ccb3ed974a2d239140b3e is followed by the At correction; final implementation SHA review is recorded below.

Exact final implementation review PASS for a9b69b581295c980996d31cd0e8ffccdb96bce1c, following acfe8310970925d5106467203d21d8d6b6b2bf3d and a6ff43a732eb5641027ccb3ed974a2d239140b3e. Four committed final coverage/case/scope/native-source evidence reconstructions are byte-identical, all14 semantic files match actual evaluated HEAD, complete current-map source ownership and finite nonnegative counters confirmed. Same-current-agent EVALUATOR is explicitly not independent; quality/20261008-085631979-recovery-context/quality-report.json records PASS at that SHA. Source-bound all-four100 app/inventory; unique13711app110inventory16infra299Chromium, original failures and38/2skip observations retained, zero passing replay. Parent/stash/pin/protected IO checks pass. Canonical verification and its committed checkpoint use these final documents and actual implementation SHA; bounded leaf completion makes no whole-goal completion claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T08:57:32.402Z — VERIFY — ok

By: CODER

Note: Final native column item boundary verified at a9b69b581295c980996d31cd0e8ffccdb96bce1c. Exact same-agent review PASS; one upstream-absent full profile,13711 app/110 inventory/16 infrastructure/299 Chromium unique passes, all-four exact-source coverage100 and zero passing replay. Protected IO,613 old acceptance files,original21 migrated assertions,parent prefix and stash preserved; full ruler/slot/row/StateTabWin parity remains partial.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T08:57:16.043Z, excerpt_hash=sha256:d812350c9b1a8e0bae5a706a21ae78afc364016566f9e2feb5b9bb9e04e16bd9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080801-9Z9TSH/blueprint/resolved-snapshot.json
- old_digest: 246fb558f43f84d6899218c094d2a7314142bdb70d885fdc15757225dc5f1c48
- current_digest: 246fb558f43f84d6899218c094d2a7314142bdb70d885fdc15757225dc5f1c48
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610080801-9Z9TSH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610080801-9Z9TSH -m 🧩 9Z9TSH task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and rerun affected checks under a new approved task. Preserve native model/history and registered IO deviations.

## Findings

Iteration229 current baseline is b5da6bf4c985f88be6aa5bddae6a1957ad10afc6 (the stale preloaded546c/612/303 facts in the initial note are superseded). Actual baseline614 acceptance files and305 records includes completed BKYEAC/Q0C52Z/XDXRZG/HA9KH9 browser persistence/dialog work; that production code is byte-identical throughout this task. Goal readback ACTIVE after resumed continuation. The preceding status-only question turn was no progress; this turn implements the next safe architectural dependency.

Native boundary implemented: SvxColumnDescription/SvxColumnItem in the actual SVX source owner retain default0 edges/active, table=false, ortho=true, upper-only65535 limit clamp, signed widths, mutable owned description copies in Append/Clone, equality deliberately excluding ortho, and native active/first/last/consistency/equal-width operations. Default QueryValue has no payload. SfxPoolItem gains SetWhich in the already bounded local owned-value domain; no refcount/full uint16 claim. SwView coordinates the actual StateTabWin table-column conversion block in viewtab.ts: zero-clamped frame distances cast to uint16, LTR/RTL relative end/limit order and unconstrained visible tail. Existing document column drag uses that real view item visibility/end/min/max, while original SwTabCols remains model/preview/apply storage. Only source-owned Library_svx svx->svl dependency is admitted; no SW/browser reverse dependency.

Initial six static gates executed once: format/type/dependency/docs/size PASS; lint FAIL on2 non-null assertions in the fresh fixture. Static closure1 fixed those, all changed checks PASS. Expanded verification closure for current baseline adds one actual original-failure bookmark footer selector migration and one fresh18-case dialog/IO lifecycle/failure file; production scope remains unchanged. Closure2 format/lint/type PASS and docs FAIL for7 new host-list callbacks; closure3 documentation and changed checks all PASS. No check or size-budget waivers were used. Source snapshots/scripts/raw results stay only in ignored local cache.

ONE full upstream-absent profile: build PASS; app13690PASS1FAIL; inventory109PASS1FAIL; infrastructure16PASS; Chromium299PASS0flaky. Old bookmark direct-document key test found two legitimate Close controls after completed dialog chrome changes; only selector now targets pinned insertbookmark.ui resource action area, keeping all original21 assertions/inputs and23 skipped siblings unchanged. Metadata used locale sorting, which the unchanged lexicographic CLI rejected; sorted exactly. Original failures remain in initial profile. Closure1 runs exactly those original failures plus18 genuinely new current-baseline lifecycle/error cases: app19PASS23SKIP; inventory1PASS2SKIP, no browser/build or passing replay. Focused CLI exits1 are retained as whole-graph coverage thresholds, not semantic assertion failures. Two known early-guard rejected UI promises are captured by a bounded host Promise hook with exact complete error assertions; zero actual unhandled errors, no production hooks or behavior changes and no normal-browser/upstream claim. Preserved IO title/content thresholds, atomic same-identity replacement and host request/transaction failures are tested without altering intentional deviations.

Final unique13711app110inventory16infra299Chromium PASS,0unresolved0flaky0uncaught0passing replay. Source-bound all4 app100 L16898/S18559/F4304/B13968 and inventory100 L1464/S1523/F384/B1081. Actual maps source-bound to whole byte-identical maps/sources or complete contiguous declaration/body/enclosing branch/all locations, no clamping/exclusions or sanitized counters. First proof left5 current-baseline dialog/IO files incomplete since protected changes after228;18 genuinely new cases close those gaps. Final proof includes303whole app38whole inventory and17 complete prior region transfers; no test counter edit. Five restored source-only gates PASS: resources--check,source-tree,provenance307(218mapped73browser16infra),invariants,parity. Upstream pin9bc445578031fecf56086729d8e4940c77e14d65 verified with8 native source/header/build/resource hashes and exact anchor IDs/lines.

Scope14:7 production/checker paths,4 fresh acceptance files,1 source-backed selector migration,2 metadata. All613 other prior acceptance files byte-identical; all305 prior metadata records/fields/evidence prefixes/status/defaults/classes and registered IO deviations retained plus2 honest partial unverified native modules. Four explicit protected IO production hashes equal current baseline. Physical code maximum667<1000; JSDoc/routing/diff PASS. Whole AP5678 files0forbidden source/Python/raw maps/results/snapshots. Doctor0errors2pre-existing warnings only: managed readiness/fallback shim and historical DONE2Z3962 missing implementation SHA. Entire parent648373char prefix SHA831af71783e10fc16f212c74b179c0c58da3b478c11ee96bb6656a48163276a3 and stashc85f4a0e453dfd06d6e199554784f2c286737472 retained.

Residual: full SvxRuler/SfxBindings/SfxItemSet slots and complete StateTabWin page/frame/section ownership; row value conversion; production native active-column selection; vertical/RTL document drag; pooled refcount mutation guards/full uint16 WhichId; nonzero member QueryValue/PutValue/CreateDefault/GetPresentation. No complete ruler or whole parity claim. Existing browser item conversion is production-used, not a renamed SwTabCols wrapper. Next architectural work can consume these generic SVX values without a reverse SW dependency. The exact implementation review is recorded below; same-current-agent EVALUATOR is explicitly not independent. Full goal remains ACTIVE. Final native-contract review adds explicit uint16 casts for constructor active/edges and Count, retaining raw vector size for consistency and deep Clone even when65536 descriptions wrap Count to0. One genuinely new overflow case PASS7SKIP in closure2, actual changed-production rebuild PASS while upstream absent and restored; no full or passing-test replay. Static closure4 PASS; only changed-input provenance/parity source gates repeated and PASS. Initial implementationacfe8310970925d5106467203d21d8d6b6b2bf3d is followed by this correction under the same approved semantic scope. Actual original selector assertions21, not35; scope audit is authoritative.

Final At argument review: pinned sal_uInt16 index conversion is applied before owned access. One genuinely new index-wrap/mutable-ownership case PASS8SKIP in upstream-absent closure3; changed-input build and static5/source-closure2 PASS. Final unique13711app110inventory16infra299Chromium,20 new app cases beyond initial profile,38 app skip observations retained, no passing replay. All-four exact current-source coverage100 totals unchanged. Constructor/count implementation a6ff43a732eb5641027ccb3ed974a2d239140b3e is followed by the At correction; final implementation SHA review is recorded below.

Exact final implementation review PASS for a9b69b581295c980996d31cd0e8ffccdb96bce1c, following acfe8310970925d5106467203d21d8d6b6b2bf3d and a6ff43a732eb5641027ccb3ed974a2d239140b3e. Four committed final coverage/case/scope/native-source evidence reconstructions are byte-identical, all14 semantic files match actual evaluated HEAD, complete current-map source ownership and finite nonnegative counters confirmed. Same-current-agent EVALUATOR is explicitly not independent; quality/20261008-085631979-recovery-context/quality-report.json records PASS at that SHA. Source-bound all-four100 app/inventory; unique13711app110inventory16infra299Chromium, original failures and38/2skip observations retained, zero passing replay. Parent/stash/pin/protected IO checks pass. Canonical verification and its committed checkpoint use these final documents and actual implementation SHA; bounded leaf completion makes no whole-goal completion claim.
