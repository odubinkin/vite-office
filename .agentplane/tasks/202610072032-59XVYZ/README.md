---
id: "202610072032-59XVYZ"
title: "Bind native edit-window and editing-shell owners to SwView"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 29
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
  updated_at: "2026-10-07T21:07:35.607Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T21:15:13.637Z"
  updated_by: "CODER"
  note: "Verified actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33: required native view/shared layout owner contract,13646app110inventory15infra292Chromium uniquePASS, source-bound all4coverage100,2238old expectations retained; same-current-agent exact reconstruction/evaluatorPASS not independent. One full upstream-absent run, only original failure rerun; full parity goal remains active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T21:14:19.904Z"
  updated_by: "EVALUATOR"
  note: "Same-current-agent exact-SHA review, not independent:20ab572c52122585a8c8adf710eb8dd2b933dd33 passes declared native view/shared-layout ownership scope; exact evidence reconstruction has zero failures."
  evaluated_sha: "20ab572c52122585a8c8adf710eb8dd2b933dd33"
  blueprint_digest: "90d6016d226a895168b8b0a97a53455ebd7517a0a68da9fa1fdcca0d14f4d9bb"
  evidence_refs:
    - ".agentplane/tasks/202610072032-59XVYZ/README.md"
    - ".agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610072032-59XVYZ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610072032-59XVYZ/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610072032-59XVYZ/evidence/source-review.json"
    - ".agentplane/tasks/202610072032-59XVYZ/evidence/scope-final.json"
    - ".agentplane/tasks/202610072032-59XVYZ/evidence/governance.json"
  findings:
    - "Required SwEditWin source-view reference replaces direct shell injection; both children retain their creation view and share the same layout.48semantic paths,567old files identical41audited fixture migrations with2238original expectations preserved,1new609current;302metadata prefixes unchanged.13646app110inventory15infra292Chromium current cases pass with zero passing replay; only original empty-frame failure rerun,16skips retained. Source-bound all4coverage100; full native ruler/slot/hierarchy and exhaustive goal remain incomplete."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: bind the actual SwView owner at native edit-window and editing-shell boundaries; migrate only audited constructor/import fixture inputs and preserve all operation assertions."
events:
  -
    type: "status"
    at: "2026-10-07T20:33:41.322Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind the actual SwView owner at native edit-window and editing-shell boundaries; migrate only audited constructor/import fixture inputs and preserve all operation assertions."
  -
    type: "verify"
    at: "2026-10-07T21:15:13.637Z"
    author: "CODER"
    state: "ok"
    note: "Verified actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33: required native view/shared layout owner contract,13646app110inventory15infra292Chromium uniquePASS, source-bound all4coverage100,2238old expectations retained; same-current-agent exact reconstruction/evaluatorPASS not independent. One full upstream-absent run, only original failure rerun; full parity goal remains active."
doc_version: 3
doc_updated_at: "2026-10-07T21:15:13.696Z"
doc_updated_by: "CODER"
description: "Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.3production+41fixture+1fresh+2metadata=47semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions."
sections:
  Summary: "Replace direct SwWrtShell injection at the native edit-window boundary with the source SwView relationship. This is one ownership refactor, a prerequisite for moving represented ruler geometry to native ruler owners."
  Scope: "Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround."
  Plan: "Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround. Original full run exposes one old fixture depending on the removed duplicate base layout: native repeated Home/End missing/empty-frame branch. Keep all original expectation calls, text/model inputs and cleanup; initialize an explicit empty measured cursor frame on the now-shared root before its existing rejection assertions. This one device fixture preparation replaces the accidental independent empty root; no production workaround or expected-value migration. Only this actually failed case is rerun, passing cases remain untouched."
  Verify Steps: |-
    1. Inspect pinned SwEditWin ctor/GetView (edtwin.cxx/edtwin.hxx) and SwWrtShell m_rView/GetView (wrtsh.hxx/wrtsh1.cxx); confirm real production SwView owns both children and each keeps the exact originating view even when another view is current on the same document shell. Native operations, original cursor/list/table/history and document replacement/layout still live through that view; detached core shells have no fabricated view.
    2. Initial six static gates once; later only failed/changed-input scoped closure. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore vendor. Later only original failures/genuinely new cases; zero passing replay/skips promotion. Tests never invoke pinned upstream. Preserve all4 app/inventory100 via complete identical source/map/declaration/body/enclosing branch/location proofs, no exclusions/clamps/individual count sanitization.
    3. Five restored source/resource/provenance/invariant/parity gates; actual source anchors/hashes;608prior files with567byte-identical and41 exact deterministic constructor/import/formatter-only native view fixture migrations, all test names/expectation calls/authored inputs/assertions/cleanup preserved;1new609current; all302metadata contracts/prefixes/classes/status/defaults retained; exact48semantic paths, physical lines<1000,JSDoc, AP source/Python/raw ban, doctor/routing/diff.
    4. Final Findings/Verification before canonical verify; actual implementation SHA reconstruction and same-current-agent EVALUATOR explicitly not independent, checkpoint before finish actual SHA. Parent full639405character prefixSHA0f3fe922f95fb21c501b3cdb4f67ee310459a5b3049445591a0649461c659834 and deferred stash preserved, Git clean. Exhaustive goal ACTIVE; full native ruler/slot geometry ownership remains incomplete. Verify shared layout is seeded once in the source cursor-shell owner and the subclass duplicate is removed; existing optional explicit-layout constructor contract and all old fixture expectations preserved. Original full app13645PASS1FAIL in native repeated Home/End empty/missing-frame fixture; retain this initial failure, set its missing/empty device fixture explicitly on the shared root with every original assertion preserved. Exactly41 fixture migrations include40 constructor/import/format-only files and one same-constructor migration with this explicit empty-frame preparation, source-backed by removed duplicate base ownership. Focused rerun only original failed fullName, skips preserved; do not rerun full/passing suites.
  Verification: |-
    Command: initial six static gates; failed/changed-input scoped static closures; ONE full upstream-absent build/app/inventory/infrastructure/Chromium; only original failed Home/End focused closure; once-restored five source gates; exact source-bound coverage/case/scope audits; physical/JSDoc/AP artifact/doctor/routing/diff.
    Result: current bounded owner/refactor criteriaPASS:13646app110inventory15infrastructure292Chromium unique cases,0unresolved0passing replay;16focused skips retained. Actual all4app/inventory100 with complete source/map/body/branch/location proof. Initial failures and raw threshold process exits retained in evidence.
    Evidence: evidence/absent-profile.json,runtime-closure1.json,case-census.json,final-coverage.json,scope-final.json,source-review.json,static-gates.json,static-closure1.json,static-closure2.json,source-gates.json,changed-file-checks.json,artifact-census.json,governance.json. Raw source/maps/reports/scripts only ignored app cache; no upstream source or Python in AP.
    Scope: required edit-window creation-view reference and shared layout ownership,48semantic paths,608prior files with567byte-identical41audited fixture migrations and2238unchanged expectation calls,1new609current;302metadata contracts preserved. Full native shell/ruler/slot architecture, unknown document-specific bullet reproduction and exhaustive parity remain unverified. Actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33 exact reconstruction reviewPASS0failures and same-current-agent EVALUATOR PASS explicitly not independent at .agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/quality-report.json; canonical verification/checkpoint before finish; standing user goal authorizes this safe local scope.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T21:15:13.637Z — VERIFY — ok

    By: CODER

    Note: Verified actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33: required native view/shared layout owner contract,13646app110inventory15infra292Chromium uniquePASS, source-bound all4coverage100,2238old expectations retained; same-current-agent exact reconstruction/evaluatorPASS not independent. One full upstream-absent run, only original failure rerun; full parity goal remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T21:14:51.134Z, excerpt_hash=sha256:9619f607e7081b2a381e67854f3bcf9c2b048362588d0deaf564985b6a1d32f8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610072032-59XVYZ/blueprint/resolved-snapshot.json
    - old_digest: 90d6016d226a895168b8b0a97a53455ebd7517a0a68da9fa1fdcca0d14f4d9bb
    - current_digest: 90d6016d226a895168b8b0a97a53455ebd7517a0a68da9fa1fdcca0d14f4d9bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610072032-59XVYZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610072032-59XVYZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task's intentional three production files, constructor/import-only fixture migrations, fresh ownership test and metadata note together. Preserve parent historical evidence and unrelated commits/stash; do not use destructive history operations."
  Findings: |-
    Iteration227 binds the existing native edit-window and editing-shell children to their actual creating SwView. Required SwEditWin.m_rView/GetView removes direct shell injection and every operation resolves through that exact source view; SwWrtShell.GetView retains its creation owner even when a different view is active on the same DocShell. SwView supplies itself to both persistent children. The duplicate editing-shell layout field/factory/GetLayout override is removed; the existing cursor-shell owner receives the real view root once, retaining its single lazy root only for detached core shells. Native SwViewShell is the upstream layout owner; the full local shell hierarchy remains partial. Detached backend SwWrtShell construction remains a model-port boundary and rejects GetView without a real view, with no fake/default view or legacy edit-window overload.

    Five fresh owner/document-replacement/typing/history/layout/two-view casesPASS. Exactly48semantic paths,608prior acceptance files:567byte-identical and41 exact source-backed fixture migrations with2238 original expectation calls unchanged;1new609current. Forty fixtures change only native constructors/imports/format. One actual failed Home/End test previously relied on the removed duplicate base layout being empty; its explicit empty measured frame preparation preserves original assertions/model/text/cleanup and the empty-frame rejection branch without restoring a second layout. All302 prior metadata fields/default/status/classes/evidence prefixes retained; registered IO deviations unchanged.

    Initial six static gates once: format/lint/dependencies/docsPASS, fresh InitNew signature typeFAIL and1006line wrtsh1.ts sizeFAIL. Corrections use actual InitNew(metadata) return and real shared-layout deduplication; only failed/changed inputs rechecked, allPASS. Physical changed108..999<1000, unchanged JSDoc validatorPASS; no compression/exclusion/budget override. Source review binds five pinned native files and four production files to LibreOffice26.8.0.2 SHA9bc445578031fecf56086729d8e4940c77e14d65.

    ONE full upstream-absent runtime: buildPASS13645appPASS1oldFAIL,110inventory15infrastructure292ChromiumPASS,0fullskips/flaky/uncaught; vendor restored finally. Only the original Home/End failure rerun after explicit device preparation:1PASS16skipped observations retained,0passing replay. Final unique13646app110inventory15infrastructure292ChromiumPASS,0unresolved. Raw focused coverage command exit1 from whole-graph thresholds is retained; no full or passing replay and no runtime test invokes pinned source. Actual all4 source-bound coverage100: appL16633/S18262/F4236/B13781; inventory1464/1523/384/1081.299whole current app38wholeinventory plus4complete prior declaration/body/enclosing-branch/location transfers. Invalid paintfrm−36 aggregate uses the entire prior verified identical source/maps/counters; no individual sanitization/clamps/exclusions.

    Five restored source/resource/provenance/invariant/parity gatesPASS; scope/source/changed-file checksPASS; AP census5617files0forbidden source/Python/raw snapshots, only ignored local cache for raw evidence;doctor0errors2pre-existingwarnings,routing/diffPASS. Parent full639405character prefixSHA0f3fe922f95fb21c501b3cdb4f67ee310459a5b3049445591a0649461c659834 and stashc85f4a0e453dfd06d6e199554784f2c286737472 preserved. The deferred ownership patch was restored byte-for-byte from ignored cache after separate user-priority bullet investigation4FRJFD confirmed the existing occupied-width fix, source unchanged. Actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33 passes byte-identical reconstruction of coverage/census/scope evidence with0failures; same-current-agent EVALUATOR PASS explicitly not independent at .agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/quality-report.json. Canonical verification checkpoint will be persisted before finish of actual implementation SHA. Full SvxRuler/SvxColumnItem/slot geometry ownership and exhaustive core/UI parity remain unproven; parent/goal ACTIVE.
id_source: "generated"
---
## Summary

Replace direct SwWrtShell injection at the native edit-window boundary with the source SwView relationship. This is one ownership refactor, a prerequisite for moving represented ruler geometry to native ruler owners.

## Scope

Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround.

## Plan

Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround. Original full run exposes one old fixture depending on the removed duplicate base layout: native repeated Home/End missing/empty-frame branch. Keep all original expectation calls, text/model inputs and cleanup; initialize an explicit empty measured cursor frame on the now-shared root before its existing rejection assertions. This one device fixture preparation replaces the accidental independent empty root; no production workaround or expected-value migration. Only this actually failed case is rerun, passing cases remain untouched.

## Verify Steps

1. Inspect pinned SwEditWin ctor/GetView (edtwin.cxx/edtwin.hxx) and SwWrtShell m_rView/GetView (wrtsh.hxx/wrtsh1.cxx); confirm real production SwView owns both children and each keeps the exact originating view even when another view is current on the same document shell. Native operations, original cursor/list/table/history and document replacement/layout still live through that view; detached core shells have no fabricated view.
2. Initial six static gates once; later only failed/changed-input scoped closure. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore vendor. Later only original failures/genuinely new cases; zero passing replay/skips promotion. Tests never invoke pinned upstream. Preserve all4 app/inventory100 via complete identical source/map/declaration/body/enclosing branch/location proofs, no exclusions/clamps/individual count sanitization.
3. Five restored source/resource/provenance/invariant/parity gates; actual source anchors/hashes;608prior files with567byte-identical and41 exact deterministic constructor/import/formatter-only native view fixture migrations, all test names/expectation calls/authored inputs/assertions/cleanup preserved;1new609current; all302metadata contracts/prefixes/classes/status/defaults retained; exact48semantic paths, physical lines<1000,JSDoc, AP source/Python/raw ban, doctor/routing/diff.
4. Final Findings/Verification before canonical verify; actual implementation SHA reconstruction and same-current-agent EVALUATOR explicitly not independent, checkpoint before finish actual SHA. Parent full639405character prefixSHA0f3fe922f95fb21c501b3cdb4f67ee310459a5b3049445591a0649461c659834 and deferred stash preserved, Git clean. Exhaustive goal ACTIVE; full native ruler/slot geometry ownership remains incomplete. Verify shared layout is seeded once in the source cursor-shell owner and the subclass duplicate is removed; existing optional explicit-layout constructor contract and all old fixture expectations preserved. Original full app13645PASS1FAIL in native repeated Home/End empty/missing-frame fixture; retain this initial failure, set its missing/empty device fixture explicitly on the shared root with every original assertion preserved. Exactly41 fixture migrations include40 constructor/import/format-only files and one same-constructor migration with this explicit empty-frame preparation, source-backed by removed duplicate base ownership. Focused rerun only original failed fullName, skips preserved; do not rerun full/passing suites.

## Verification

Command: initial six static gates; failed/changed-input scoped static closures; ONE full upstream-absent build/app/inventory/infrastructure/Chromium; only original failed Home/End focused closure; once-restored five source gates; exact source-bound coverage/case/scope audits; physical/JSDoc/AP artifact/doctor/routing/diff.
Result: current bounded owner/refactor criteriaPASS:13646app110inventory15infrastructure292Chromium unique cases,0unresolved0passing replay;16focused skips retained. Actual all4app/inventory100 with complete source/map/body/branch/location proof. Initial failures and raw threshold process exits retained in evidence.
Evidence: evidence/absent-profile.json,runtime-closure1.json,case-census.json,final-coverage.json,scope-final.json,source-review.json,static-gates.json,static-closure1.json,static-closure2.json,source-gates.json,changed-file-checks.json,artifact-census.json,governance.json. Raw source/maps/reports/scripts only ignored app cache; no upstream source or Python in AP.
Scope: required edit-window creation-view reference and shared layout ownership,48semantic paths,608prior files with567byte-identical41audited fixture migrations and2238unchanged expectation calls,1new609current;302metadata contracts preserved. Full native shell/ruler/slot architecture, unknown document-specific bullet reproduction and exhaustive parity remain unverified. Actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33 exact reconstruction reviewPASS0failures and same-current-agent EVALUATOR PASS explicitly not independent at .agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/quality-report.json; canonical verification/checkpoint before finish; standing user goal authorizes this safe local scope.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T21:15:13.637Z — VERIFY — ok

By: CODER

Note: Verified actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33: required native view/shared layout owner contract,13646app110inventory15infra292Chromium uniquePASS, source-bound all4coverage100,2238old expectations retained; same-current-agent exact reconstruction/evaluatorPASS not independent. One full upstream-absent run, only original failure rerun; full parity goal remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T21:14:51.134Z, excerpt_hash=sha256:9619f607e7081b2a381e67854f3bcf9c2b048362588d0deaf564985b6a1d32f8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610072032-59XVYZ/blueprint/resolved-snapshot.json
- old_digest: 90d6016d226a895168b8b0a97a53455ebd7517a0a68da9fa1fdcca0d14f4d9bb
- current_digest: 90d6016d226a895168b8b0a97a53455ebd7517a0a68da9fa1fdcca0d14f4d9bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610072032-59XVYZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610072032-59XVYZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task's intentional three production files, constructor/import-only fixture migrations, fresh ownership test and metadata note together. Preserve parent historical evidence and unrelated commits/stash; do not use destructive history operations.

## Findings

Iteration227 binds the existing native edit-window and editing-shell children to their actual creating SwView. Required SwEditWin.m_rView/GetView removes direct shell injection and every operation resolves through that exact source view; SwWrtShell.GetView retains its creation owner even when a different view is active on the same DocShell. SwView supplies itself to both persistent children. The duplicate editing-shell layout field/factory/GetLayout override is removed; the existing cursor-shell owner receives the real view root once, retaining its single lazy root only for detached core shells. Native SwViewShell is the upstream layout owner; the full local shell hierarchy remains partial. Detached backend SwWrtShell construction remains a model-port boundary and rejects GetView without a real view, with no fake/default view or legacy edit-window overload.

Five fresh owner/document-replacement/typing/history/layout/two-view casesPASS. Exactly48semantic paths,608prior acceptance files:567byte-identical and41 exact source-backed fixture migrations with2238 original expectation calls unchanged;1new609current. Forty fixtures change only native constructors/imports/format. One actual failed Home/End test previously relied on the removed duplicate base layout being empty; its explicit empty measured frame preparation preserves original assertions/model/text/cleanup and the empty-frame rejection branch without restoring a second layout. All302 prior metadata fields/default/status/classes/evidence prefixes retained; registered IO deviations unchanged.

Initial six static gates once: format/lint/dependencies/docsPASS, fresh InitNew signature typeFAIL and1006line wrtsh1.ts sizeFAIL. Corrections use actual InitNew(metadata) return and real shared-layout deduplication; only failed/changed inputs rechecked, allPASS. Physical changed108..999<1000, unchanged JSDoc validatorPASS; no compression/exclusion/budget override. Source review binds five pinned native files and four production files to LibreOffice26.8.0.2 SHA9bc445578031fecf56086729d8e4940c77e14d65.

ONE full upstream-absent runtime: buildPASS13645appPASS1oldFAIL,110inventory15infrastructure292ChromiumPASS,0fullskips/flaky/uncaught; vendor restored finally. Only the original Home/End failure rerun after explicit device preparation:1PASS16skipped observations retained,0passing replay. Final unique13646app110inventory15infrastructure292ChromiumPASS,0unresolved. Raw focused coverage command exit1 from whole-graph thresholds is retained; no full or passing replay and no runtime test invokes pinned source. Actual all4 source-bound coverage100: appL16633/S18262/F4236/B13781; inventory1464/1523/384/1081.299whole current app38wholeinventory plus4complete prior declaration/body/enclosing-branch/location transfers. Invalid paintfrm−36 aggregate uses the entire prior verified identical source/maps/counters; no individual sanitization/clamps/exclusions.

Five restored source/resource/provenance/invariant/parity gatesPASS; scope/source/changed-file checksPASS; AP census5617files0forbidden source/Python/raw snapshots, only ignored local cache for raw evidence;doctor0errors2pre-existingwarnings,routing/diffPASS. Parent full639405character prefixSHA0f3fe922f95fb21c501b3cdb4f67ee310459a5b3049445591a0649461c659834 and stashc85f4a0e453dfd06d6e199554784f2c286737472 preserved. The deferred ownership patch was restored byte-for-byte from ignored cache after separate user-priority bullet investigation4FRJFD confirmed the existing occupied-width fix, source unchanged. Actual implementation20ab572c52122585a8c8adf710eb8dd2b933dd33 passes byte-identical reconstruction of coverage/census/scope evidence with0failures; same-current-agent EVALUATOR PASS explicitly not independent at .agentplane/tasks/202610072032-59XVYZ/quality/20261007-211419904-recovery-context/quality-report.json. Canonical verification checkpoint will be persisted before finish of actual implementation SHA. Full SvxRuler/SvxColumnItem/slot geometry ownership and exhaustive core/UI parity remain unproven; parent/goal ACTIVE.
