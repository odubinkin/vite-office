---
id: "202610071241-NXW8EF"
title: "Route Home End through native visual-line cursor owners"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T13:21:43.168Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T13:27:14.989Z"
  updated_by: "CODER"
  note: "Native Home/End exact final e70da231bfa8121cf7597bd196566603fa203bfc verified.13532app110inventory14infrastructure276Chromium resolved;27 original uncaught exceptions fixed,0final uncaught0passing replay;24skip observations retained. Actual current-source100 app/inventory,23paths6exact migrations, all295prior metadata preserved. Same-agent evaluator explicitly not independent PASS; residual full parity and DOM list-label painting unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T13:25:56.852Z"
  updated_by: "EVALUATOR"
  note: "Same current agent EVALUATOR phase, explicitly not independent: exact e70da231bfa8121cf7597bd196566603fa203bfc native visual-line cursor and original-error closure PASS."
  evaluated_sha: "e70da231bfa8121cf7597bd196566603fa203bfc"
  blueprint_digest: "ed6827f7aac6fe2c6d4a21a4b9dc493771a60a3062251cd346e7f3b07ddd9168"
  evidence_refs:
    - ".agentplane/tasks/202610071241-NXW8EF/README.md"
    - ".agentplane/tasks/202610071241-NXW8EF/quality/20261007-132556852-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071241-NXW8EF/quality/20261007-132556852-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071241-NXW8EF/quality/20261007-132556852-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071241-NXW8EF/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071241-NXW8EF/evidence/exact-sha-review.json"
  findings:
    - "13532 app,110 inventory,14 infrastructure,276 Chromium resolved;27 original uncaught detached-frame cases fixed by seven unmount calls only.24 skip observations retained,0 passing replay. Actual current-source100 app/inventory;23 approved paths,574 prior tests identical6 exact migrations, all295 prior metadata fields/exceptions preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement standing-authorized source-native Home End through measured text frames, real cursor/shell owners and browser geometry only; preserve registered deviations and unrelated assertions."
events:
  -
    type: "status"
    at: "2026-10-07T12:42:51.278Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement standing-authorized source-native Home End through measured text frames, real cursor/shell owners and browser geometry only; preserve registered deviations and unrelated assertions."
  -
    type: "verify"
    at: "2026-10-07T13:27:14.989Z"
    author: "CODER"
    state: "ok"
    note: "Native Home/End exact final e70da231bfa8121cf7597bd196566603fa203bfc verified.13532app110inventory14infrastructure276Chromium resolved;27 original uncaught exceptions fixed,0final uncaught0passing replay;24skip observations retained. Actual current-source100 app/inventory,23paths6exact migrations, all295prior metadata preserved. Same-agent evaluator explicitly not independent PASS; residual full parity and DOM list-label painting unverified."
doc_version: 3
doc_updated_at: "2026-10-07T13:27:15.043Z"
doc_updated_by: "CODER"
description: "Iteration215: replace delegated browser Home/End with source-owned SwTextFrame, SwCursor and shell margin movement, using browser device line measurements only. Preserve registered deviations and unrelated acceptance; one fix task, no upstream source artifacts or runtime dependency."
sections:
  Summary: "Restore source-native Home/End movement for existing Writer body and table editing; replace unreliable browser default movement with native frame/cursor/shell ownership."
  Scope: |-
    apps/office/src/sw/source/core/text/txtfrm.ts
    apps/office/src/sw/source/core/text/itrtxt.ts
    apps/office/src/sw/source/core/text/frmcrsr.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/source/core/crsr/swcrsr.ts
    apps/office/src/sw/source/core/crsr/trvltbl.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/move.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/source/uibase/uiview/view.ts
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    apps/office/src/sw/browser/editor/writer-line-measurement.ts
    apps/office/src/sw/browser/editor/native-section-navigation.test.tsx
    apps/office/src/sw/source/uibase/wrtsh/native-line-margin.test.ts
    apps/office/src/sw/browser/editor/native-line-margin.test.tsx
    apps/office/e2e/native-line-margin.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
    apps/office/src/sw/browser/editor/native-collapsing-border-paint.test.tsx
    apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx
    apps/office/src/sw/browser/presentation/native-border-page.test.tsx
    apps/office/src/sw/browser/presentation/native-table-border-owner-history.test.tsx
  Plan: |-
    Standing user iterative goal authorization applies to safe source parity edits. One bounded fix: native Home/End visual-line movement. Use source frmcrsr.cxx672-793 and itrtxt.cxx219-229 for line ambiguity, hard-break exclusion and nonAPI trailing-space trim; native SwTextFrame class retains existing fragment fields and owns cursor methods. Root owns current measured frames by real text nodes; SwCursor.LeftRightMargin/IsAtLeftRightMargin and SwCursorShell.LRMargin retain source list-label and selection contracts. SwWrtShell LeftMargin/RightMargin use source movement lifecycle and pending attributes/history grouping; edit window flushes pending input and invokes native intent. Browser measures DOM Range geometry and supplies raw lines/fragment bounds only, then ordinary Home/End/Shift delegates. Preserve Ctrl/Meta section route, modifier/composition/unavailable selection guards. Source-backed exact old fixture migration only removes ordinary Home from previously unhandled inputs; all unrelated assertions retained. Add native/mounted/Chromium regressions for body/cell/soft/hard lines, spaces, empty, UTF16, reversed Shift, repeated native list-label entry, pending input/undo and continued editing. Approved semantic paths18:12production1oldmigration3newacceptance2metadata. No upstream source/Python/raw artifacts under AP. No network/outside-repo/stash/save/open/recovery changes; all prior580acceptance and295metadata fields/prefixes preserved except exact old route fixture, new native records remain unverified. Full RTL/bidi/readonly/merged-text frame completeness remain individually unverified. Execute six initial static gates once, one upstream-absent full runtime then original failures/genuinely new cases only, actual current-source100 proof, restored source gates, same-agent exact-SHA evaluator explicitly not independent, canonical verify/finish implementationSHA and complete parent-prefix append.
    Final output review exposed 27 pre-existing uncaught SwView detached-frame exceptions in BOTH prior214 and current215 sole full outputs; previous errors=[] JSON field was insufficient. Standing user goal authorizes safe fixture lifecycle correction: add cleanup() immediately before Close() in exactly seven failing mounted-session finalizers across five old test files, retain every assertion/input/name and unrelated finalizer byte. Approved scope now23 (five additional old acceptance paths), old acceptance580:574 byte-identical +6 exact migrations (one Home route +five lifecycle). Production12 remain byte-identical all runtime profiles. Upstream view.cxx1174-1230 stops painting/listening during view destruction; React fixture must unmount before disposing native session. Do not weaken GetViewFrame or suppress errors. Run only original27 exception-associated cases with exact file/name matching; prior assertion pass is not case success when uncaught error occurred. Preserve original errors/counters honestly; require zero final uncaught errors and no passing replay. No repeated full runtime/source gates or unchanged static inputs.
  Verify Steps: "Run six initial static gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. Require native visual-line start/end, right-margin ambiguity, hard-break exclusion, API versus interactive spaces, empty/surrogate text, current body/cell/follow geometry, Shift fixed/reversed marks, source repeated list-label Home and End clearing, pending attributes and history/continued edit. Exact old580 acceptance bytes preserved outside6exact migrations:1source-backed Home route and5fixture lifecycle corrections (seven cleanup calls only); all assertions/inputs/names/unrelated finalizers retained,574old files identical. All295metadata old fields/defaults/exceptions preserved; physical files below1000. ONE full upstream-absent build/app/inventory/infrastructure/Chromium then original failures or genuinely new cases only. Terminal logs must explicitly census uncaught errors even when JSON reports assertions passed: original27detached-frame exceptions require original-error-only closure,0final uncaught errors; no passing replay. Strict current-source actual100 app/inventory; raw cache only. Restore vendor finally before source/resources/provenance/invariants/parity gates and AP writes; unchanged restored source gates not repeated for fixture-only changes. Changed-input static checks on five fixtures only. Doctor/routing/diff, exact same-agent evaluator explicitly not independent, canonical verify, finish actual implementation SHA, parent full-prefix append."
  Verification: |-
    Command: six initial static gates once; failed/changed-input static closures; ONE full upstream-absent build/app/inventory/infrastructure/Chromium, then three genuinely new app cases, original failed hint case and27original uncaught-error cases only. Restored source gates, strict current-source coverage/case/scope and exact implementation audit.
    Result: PASS approved native Home/End owner and fixture teardown scope.
    Evidence: final implementation e70da231bfa8121cf7597bd196566603fa203bfc (product918d8042348c386060a55a750bdfa7ecb234934e ancestor).13532app110inventory14infrastructure276Chromium resolved; initial full27uncaught errors explicitly retained and fixed, final0uncaught0unresolved0passing replay.24app skips retained, focused exit1 global thresholds only. Actual100 all four app/inventory metrics across295/38whole source/maps plus9complete prior app declaration/body/ancestor certificates;12production bytes identical all profiles/current commit.23semantic paths:574old test files identical6exact migrations3new; all295prior metadata fields/defaults/exceptions preserved,3new native records unverified. Four priority bullet cases PASS. See exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, lifecycle-rework.json, failure-closure3.json, source-review.json and quality/20261007-132556852-recovery-context/quality-report.json.
    Scope: browser raw measured lines to native frame/cursor/shell Home/End, API/interactive spaces, hard break, empty/UTF16, Shift/reverse marks, body/cell/follow, core list-label state, graph guards, continued edit/history. Seven fixture cleanup calls correct native session lifetime; every assertion preserved. Same current-agent EVALUATOR explicitly not independent. Null-text case is explicit public-port fault injection only. DOM list-label painting, full layout/RTL/bidi/read-only/fly/modes and prior Name modal remain unverified; whole parity ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T13:27:14.989Z — VERIFY — ok

    By: CODER

    Note: Native Home/End exact final e70da231bfa8121cf7597bd196566603fa203bfc verified.13532app110inventory14infrastructure276Chromium resolved;27 original uncaught exceptions fixed,0final uncaught0passing replay;24skip observations retained. Actual current-source100 app/inventory,23paths6exact migrations, all295prior metadata preserved. Same-agent evaluator explicitly not independent PASS; residual full parity and DOM list-label painting unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T13:27:14.133Z, excerpt_hash=sha256:22e94867224d9da03f9d28f632f043c2cff497c0beb6c18ba24ae121981a14cd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071241-NXW8EF/blueprint/resolved-snapshot.json
    - old_digest: ed6827f7aac6fe2c6d4a21a4b9dc493771a60a3062251cd346e7f3b07ddd9168
    - current_digest: ed6827f7aac6fe2c6d4a21a4b9dc493771a60a3062251cd346e7f3b07ddd9168
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610071241-NXW8EF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610071241-NXW8EF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the intentional implementation commit and retain immutable task evidence; do not alter unrelated work or deferred stash."
  Findings: |-
    Read-only initial audit: browser-writer-edit-window currently handles Ctrl/Meta Home/End only; ordinary keys fall through. Source txtcrsr.cxx127-139 routes all four ordinary/selected line slots via LeftMargin/RightMargin(falseBasic); move.cxx176-207 uses ShellMoveCursor. Source SwCursor.LeftRightMargin delegates current layout frame; frmcrsr.cxx excludes hard break, trims ASCII spaces only nonAPI nonlast lines, maintains right-margin ambiguity through itrtxt.cxx. LRMargin repeats Home into visible list label and End clears label state. No tests have run for this leaf. Previous214 leaf made authoritative implementation/verification/closure progress; no live process remains.

    Iteration215 verified closure. Product implementation918d8042348c386060a55a750bdfa7ecb234934e; final implementation including original-error fixture correction e70da231bfa8121cf7597bd196566603fa203bfc. Ordinary Home/End and Shift now use native SwTextFrame, SwTextCursor, SwCursor/Shell and SwWrtShell margin owners through the existing SwEditWin. Browser supplies measured UTF16 DOM Range line/fragment geometry, not cursor destinations. Root retains measured frames by actual SwTextNode in a WeakMap, rejects foreign owners and changed text. Native right-margin ambiguity, soft trailing ASCII-space trim versus API/last-line behavior, hard-break exclusion, empty/surrogate text and reverse/fixed Shift marks retain source contracts. Shell resets cursor stack, selects standard/marked mode, updates native table cursor and grouped pending attributes/history. Repeated native Home reaches list-label affinity and End clears it; DOM label painting remains separately unverified. UI and shell share the persistent root; existing enumerable fragment fields and Ctrl/Meta section route preserved. Native body/cell/follow, actual mounted geometry, continued editing/UndoRedo and1280/390 browser acceptance pass.

    Six initial static gates once:lint/dependencies/file-size PASS; new-file format, freeze/private-field TS type and missing JSDoc initially failed, corrected before sole full runtime. Only failed or changed-input format/eslint/typecheck/JSDoc/physical closures afterward, including fresh cases and five lifecycle fixtures. Current changed-source maximum986physical lines, below1000. ONE full upstream-absent build/app/inventory/infrastructure/Chromium:13529app assertions passed,110inventory,14infrastructure,276Chromium. Full app exit1 was NOT threshold-only:27 uncaught SwView detached-frame errors occurred alongside99.92branch threshold; JSON reporter omitted those exceptions. Raw terminal output and original errors retained. Exact final output review caught this and replaced inaccurate threshold-only interpretation. Same27errors existed in prior214 raw output; DONE214 files not edited, parent corrective append supersedes its all-pass implication.

    Original27errors map to five mounted test files whose native session closed before React unmount. Added exactly seven cleanup() calls immediately before only the affected shared finalizers, no assertions/inputs/names/unrelated finalizers changed and no GetViewFrame guard weakened. Source view.cxx1174-1230 stops painting/listening during teardown; fixture correction makes its lifecycle explicit. Original-error-only closure3:27PASS0FAIL16SKIP and0uncaught errors. Assertion-pass observations with uncaught errors are classified as errored until resolved, never counted as passing replay. No full runtime repeated. Three genuinely new browser-port cases closure1:2PASS1FAIL3SKIP; stale graph subscriber initially recognized direct selection hint only, corrected fixture to actual nested model-transaction hint, all assertions unchanged. Original failed case closure2:1PASS0FAIL5SKIP. Explicit null-text public device-port fault injection and detached document geometry cover ingress guards only, not normal rendered DOM or upstream behavior proof. Final actual union13532app110inventory14infrastructure276Chromium,0unresolved0passing replay;24app skip observations retained, none promoted. Final focused app exit1 solely subset global coverage thresholds. All12production paths identical sole full/build/browser/all three auxiliary profiles/current commit. Runtime terminal and vendor restored finally before source/AP writes.

    Strict current-source actual100 app L16421S18027F4190B13496 across295whole current sources/maps; inventory L1464S1523F384B1081 across38whole sources/maps. Nine complete prior app source-region certificates bind verified prior source hash, identical contiguous bytes, full declarations/bodies, enclosing branches and every mapped location. No partial fragment transfers or post-profile production changes. Raw V8 inferred painter negative aggregate retained/rejected; entire prior verified identical source/maps/counters selected, never clamp. App map/proof d048d0477e1caf21946ba1f76d18913947d748a524cc3c5def56f2771a4aa993/dde12d42b8f817dae02ba68314648731efb73ef4eed04d310475d0233e35283d; inventory 1adfa29aa0937821d0c06fcca086f784c740e874d3e93cd04be9cd5c93210557/5c43a8f01265876178c73869204175bfde82507529383d6eac361ff12ce0b0b8. Coverage/case/scope reconstructed byte-identically after final implementation commit. Actual counters finite/nonnegative and whole fallback bound. Same current agent EVALUATOR explicitly not independent exact-SHA PASS, quality/20261007-132556852-recovery-context/quality-report.json.

    Scope23approved23actual:12production6exact old migrations3newacceptance2metadata. Prior580acceptance files574byte-identical; six exact migrations comprise Home route modifier removal and five cleanup-only fixture migrations, all unrelated assertions/bytes retained. Current583acceptance files. All295prior metadata complete fields/prefixes/statuses/defaults/registered save/open/recovery exceptions preserved; three new native itrtxt/frmcrsr/move records individually unverified, current298, no blanket promotion. Eight pinned source hashes/locations reviewed at libreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65, plus cited destructor lifecycle. Five post-restoration source/resources/provenance/invariants/parity gates PASS once after final metadata; not replayed for fixture-only changes. Doctor0errors2knownwarnings, routing/diffPASS. Artifact census5347AP files at inspection,0upstream source/Python/scripts/raw maps/results/snapshots; legitimate policy checker retained, bounded English notes/digests/counts only. Raw snapshots/results/scripts outputs ignored project dependency cache. Complete590713-character parent Findings SHA563e2d1468dcd204f562b0a3d810577269bac9c4fbf1a2df72aa7d839ad5fbbd retained. All four priority bullet body/cell1280/390 full Chromium cases PASS; original width/minimum-distance fix unchanged. Deferred stash untouched.

    Audit/tool corrections: missing read-only guessed paths and no-match reads recomputed route; one small source patch followed a previously nonzero combined read before route was recomputed on the next call, no runtime effects. Initial metadata clone extra semantic.status removed before runtime; established fields retained. Most significantly the JSON-only assertion census missed27uncaught errors in current and prior outputs; exact review rework was valid, corrected five fixture teardown paths and ran only original error cases, no suppression. This was deterministic audit rework, not automatic approval rejection. No hooks disabled, upstream source/Python artifacts, vendored runtime dependencies or passing replay.

    Residual: full GetLayoutFrame ownership, RTL/bidi/read-only/fly/merged paragraph/GCAttr/full selection-mode behavior and layout-cache invalidation beyond current text/foreign owner remain unverified. Native list-label state is covered at core only; actual DOM label caret/marked list-level and ruler integration is next bounded audit. Prior native Name informational modal, numeric allocator/NameChanged/full-frame/formula/chart/mail-merge residuals remain unverified. Registered save/open/recovery deviations preserved. Whole kernel/browser parity parent/goal ACTIVE. Final Findings/Verification precede canonical verify; finish final actual implementation SHA.
id_source: "generated"
---
## Summary

Restore source-native Home/End movement for existing Writer body and table editing; replace unreliable browser default movement with native frame/cursor/shell ownership.

## Scope

apps/office/src/sw/source/core/text/txtfrm.ts
apps/office/src/sw/source/core/text/itrtxt.ts
apps/office/src/sw/source/core/text/frmcrsr.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/source/core/crsr/swcrsr.ts
apps/office/src/sw/source/core/crsr/trvltbl.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/move.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/source/uibase/uiview/view.ts
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
apps/office/src/sw/browser/editor/writer-line-measurement.ts
apps/office/src/sw/browser/editor/native-section-navigation.test.tsx
apps/office/src/sw/source/uibase/wrtsh/native-line-margin.test.ts
apps/office/src/sw/browser/editor/native-line-margin.test.tsx
apps/office/e2e/native-line-margin.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
apps/office/src/sw/browser/editor/native-collapsing-border-paint.test.tsx
apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx
apps/office/src/sw/browser/presentation/native-border-page.test.tsx
apps/office/src/sw/browser/presentation/native-table-border-owner-history.test.tsx

## Plan

Standing user iterative goal authorization applies to safe source parity edits. One bounded fix: native Home/End visual-line movement. Use source frmcrsr.cxx672-793 and itrtxt.cxx219-229 for line ambiguity, hard-break exclusion and nonAPI trailing-space trim; native SwTextFrame class retains existing fragment fields and owns cursor methods. Root owns current measured frames by real text nodes; SwCursor.LeftRightMargin/IsAtLeftRightMargin and SwCursorShell.LRMargin retain source list-label and selection contracts. SwWrtShell LeftMargin/RightMargin use source movement lifecycle and pending attributes/history grouping; edit window flushes pending input and invokes native intent. Browser measures DOM Range geometry and supplies raw lines/fragment bounds only, then ordinary Home/End/Shift delegates. Preserve Ctrl/Meta section route, modifier/composition/unavailable selection guards. Source-backed exact old fixture migration only removes ordinary Home from previously unhandled inputs; all unrelated assertions retained. Add native/mounted/Chromium regressions for body/cell/soft/hard lines, spaces, empty, UTF16, reversed Shift, repeated native list-label entry, pending input/undo and continued editing. Approved semantic paths18:12production1oldmigration3newacceptance2metadata. No upstream source/Python/raw artifacts under AP. No network/outside-repo/stash/save/open/recovery changes; all prior580acceptance and295metadata fields/prefixes preserved except exact old route fixture, new native records remain unverified. Full RTL/bidi/readonly/merged-text frame completeness remain individually unverified. Execute six initial static gates once, one upstream-absent full runtime then original failures/genuinely new cases only, actual current-source100 proof, restored source gates, same-agent exact-SHA evaluator explicitly not independent, canonical verify/finish implementationSHA and complete parent-prefix append.
Final output review exposed 27 pre-existing uncaught SwView detached-frame exceptions in BOTH prior214 and current215 sole full outputs; previous errors=[] JSON field was insufficient. Standing user goal authorizes safe fixture lifecycle correction: add cleanup() immediately before Close() in exactly seven failing mounted-session finalizers across five old test files, retain every assertion/input/name and unrelated finalizer byte. Approved scope now23 (five additional old acceptance paths), old acceptance580:574 byte-identical +6 exact migrations (one Home route +five lifecycle). Production12 remain byte-identical all runtime profiles. Upstream view.cxx1174-1230 stops painting/listening during view destruction; React fixture must unmount before disposing native session. Do not weaken GetViewFrame or suppress errors. Run only original27 exception-associated cases with exact file/name matching; prior assertion pass is not case success when uncaught error occurred. Preserve original errors/counters honestly; require zero final uncaught errors and no passing replay. No repeated full runtime/source gates or unchanged static inputs.

## Verify Steps

Run six initial static gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. Require native visual-line start/end, right-margin ambiguity, hard-break exclusion, API versus interactive spaces, empty/surrogate text, current body/cell/follow geometry, Shift fixed/reversed marks, source repeated list-label Home and End clearing, pending attributes and history/continued edit. Exact old580 acceptance bytes preserved outside6exact migrations:1source-backed Home route and5fixture lifecycle corrections (seven cleanup calls only); all assertions/inputs/names/unrelated finalizers retained,574old files identical. All295metadata old fields/defaults/exceptions preserved; physical files below1000. ONE full upstream-absent build/app/inventory/infrastructure/Chromium then original failures or genuinely new cases only. Terminal logs must explicitly census uncaught errors even when JSON reports assertions passed: original27detached-frame exceptions require original-error-only closure,0final uncaught errors; no passing replay. Strict current-source actual100 app/inventory; raw cache only. Restore vendor finally before source/resources/provenance/invariants/parity gates and AP writes; unchanged restored source gates not repeated for fixture-only changes. Changed-input static checks on five fixtures only. Doctor/routing/diff, exact same-agent evaluator explicitly not independent, canonical verify, finish actual implementation SHA, parent full-prefix append.

## Verification

Command: six initial static gates once; failed/changed-input static closures; ONE full upstream-absent build/app/inventory/infrastructure/Chromium, then three genuinely new app cases, original failed hint case and27original uncaught-error cases only. Restored source gates, strict current-source coverage/case/scope and exact implementation audit.
Result: PASS approved native Home/End owner and fixture teardown scope.
Evidence: final implementation e70da231bfa8121cf7597bd196566603fa203bfc (product918d8042348c386060a55a750bdfa7ecb234934e ancestor).13532app110inventory14infrastructure276Chromium resolved; initial full27uncaught errors explicitly retained and fixed, final0uncaught0unresolved0passing replay.24app skips retained, focused exit1 global thresholds only. Actual100 all four app/inventory metrics across295/38whole source/maps plus9complete prior app declaration/body/ancestor certificates;12production bytes identical all profiles/current commit.23semantic paths:574old test files identical6exact migrations3new; all295prior metadata fields/defaults/exceptions preserved,3new native records unverified. Four priority bullet cases PASS. See exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, lifecycle-rework.json, failure-closure3.json, source-review.json and quality/20261007-132556852-recovery-context/quality-report.json.
Scope: browser raw measured lines to native frame/cursor/shell Home/End, API/interactive spaces, hard break, empty/UTF16, Shift/reverse marks, body/cell/follow, core list-label state, graph guards, continued edit/history. Seven fixture cleanup calls correct native session lifetime; every assertion preserved. Same current-agent EVALUATOR explicitly not independent. Null-text case is explicit public-port fault injection only. DOM list-label painting, full layout/RTL/bidi/read-only/fly/modes and prior Name modal remain unverified; whole parity ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T13:27:14.989Z — VERIFY — ok

By: CODER

Note: Native Home/End exact final e70da231bfa8121cf7597bd196566603fa203bfc verified.13532app110inventory14infrastructure276Chromium resolved;27 original uncaught exceptions fixed,0final uncaught0passing replay;24skip observations retained. Actual current-source100 app/inventory,23paths6exact migrations, all295prior metadata preserved. Same-agent evaluator explicitly not independent PASS; residual full parity and DOM list-label painting unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T13:27:14.133Z, excerpt_hash=sha256:22e94867224d9da03f9d28f632f043c2cff497c0beb6c18ba24ae121981a14cd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071241-NXW8EF/blueprint/resolved-snapshot.json
- old_digest: ed6827f7aac6fe2c6d4a21a4b9dc493771a60a3062251cd346e7f3b07ddd9168
- current_digest: ed6827f7aac6fe2c6d4a21a4b9dc493771a60a3062251cd346e7f3b07ddd9168
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610071241-NXW8EF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610071241-NXW8EF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the intentional implementation commit and retain immutable task evidence; do not alter unrelated work or deferred stash.

## Findings

Read-only initial audit: browser-writer-edit-window currently handles Ctrl/Meta Home/End only; ordinary keys fall through. Source txtcrsr.cxx127-139 routes all four ordinary/selected line slots via LeftMargin/RightMargin(falseBasic); move.cxx176-207 uses ShellMoveCursor. Source SwCursor.LeftRightMargin delegates current layout frame; frmcrsr.cxx excludes hard break, trims ASCII spaces only nonAPI nonlast lines, maintains right-margin ambiguity through itrtxt.cxx. LRMargin repeats Home into visible list label and End clears label state. No tests have run for this leaf. Previous214 leaf made authoritative implementation/verification/closure progress; no live process remains.

Iteration215 verified closure. Product implementation918d8042348c386060a55a750bdfa7ecb234934e; final implementation including original-error fixture correction e70da231bfa8121cf7597bd196566603fa203bfc. Ordinary Home/End and Shift now use native SwTextFrame, SwTextCursor, SwCursor/Shell and SwWrtShell margin owners through the existing SwEditWin. Browser supplies measured UTF16 DOM Range line/fragment geometry, not cursor destinations. Root retains measured frames by actual SwTextNode in a WeakMap, rejects foreign owners and changed text. Native right-margin ambiguity, soft trailing ASCII-space trim versus API/last-line behavior, hard-break exclusion, empty/surrogate text and reverse/fixed Shift marks retain source contracts. Shell resets cursor stack, selects standard/marked mode, updates native table cursor and grouped pending attributes/history. Repeated native Home reaches list-label affinity and End clears it; DOM label painting remains separately unverified. UI and shell share the persistent root; existing enumerable fragment fields and Ctrl/Meta section route preserved. Native body/cell/follow, actual mounted geometry, continued editing/UndoRedo and1280/390 browser acceptance pass.

Six initial static gates once:lint/dependencies/file-size PASS; new-file format, freeze/private-field TS type and missing JSDoc initially failed, corrected before sole full runtime. Only failed or changed-input format/eslint/typecheck/JSDoc/physical closures afterward, including fresh cases and five lifecycle fixtures. Current changed-source maximum986physical lines, below1000. ONE full upstream-absent build/app/inventory/infrastructure/Chromium:13529app assertions passed,110inventory,14infrastructure,276Chromium. Full app exit1 was NOT threshold-only:27 uncaught SwView detached-frame errors occurred alongside99.92branch threshold; JSON reporter omitted those exceptions. Raw terminal output and original errors retained. Exact final output review caught this and replaced inaccurate threshold-only interpretation. Same27errors existed in prior214 raw output; DONE214 files not edited, parent corrective append supersedes its all-pass implication.

Original27errors map to five mounted test files whose native session closed before React unmount. Added exactly seven cleanup() calls immediately before only the affected shared finalizers, no assertions/inputs/names/unrelated finalizers changed and no GetViewFrame guard weakened. Source view.cxx1174-1230 stops painting/listening during teardown; fixture correction makes its lifecycle explicit. Original-error-only closure3:27PASS0FAIL16SKIP and0uncaught errors. Assertion-pass observations with uncaught errors are classified as errored until resolved, never counted as passing replay. No full runtime repeated. Three genuinely new browser-port cases closure1:2PASS1FAIL3SKIP; stale graph subscriber initially recognized direct selection hint only, corrected fixture to actual nested model-transaction hint, all assertions unchanged. Original failed case closure2:1PASS0FAIL5SKIP. Explicit null-text public device-port fault injection and detached document geometry cover ingress guards only, not normal rendered DOM or upstream behavior proof. Final actual union13532app110inventory14infrastructure276Chromium,0unresolved0passing replay;24app skip observations retained, none promoted. Final focused app exit1 solely subset global coverage thresholds. All12production paths identical sole full/build/browser/all three auxiliary profiles/current commit. Runtime terminal and vendor restored finally before source/AP writes.

Strict current-source actual100 app L16421S18027F4190B13496 across295whole current sources/maps; inventory L1464S1523F384B1081 across38whole sources/maps. Nine complete prior app source-region certificates bind verified prior source hash, identical contiguous bytes, full declarations/bodies, enclosing branches and every mapped location. No partial fragment transfers or post-profile production changes. Raw V8 inferred painter negative aggregate retained/rejected; entire prior verified identical source/maps/counters selected, never clamp. App map/proof d048d0477e1caf21946ba1f76d18913947d748a524cc3c5def56f2771a4aa993/dde12d42b8f817dae02ba68314648731efb73ef4eed04d310475d0233e35283d; inventory 1adfa29aa0937821d0c06fcca086f784c740e874d3e93cd04be9cd5c93210557/5c43a8f01265876178c73869204175bfde82507529383d6eac361ff12ce0b0b8. Coverage/case/scope reconstructed byte-identically after final implementation commit. Actual counters finite/nonnegative and whole fallback bound. Same current agent EVALUATOR explicitly not independent exact-SHA PASS, quality/20261007-132556852-recovery-context/quality-report.json.

Scope23approved23actual:12production6exact old migrations3newacceptance2metadata. Prior580acceptance files574byte-identical; six exact migrations comprise Home route modifier removal and five cleanup-only fixture migrations, all unrelated assertions/bytes retained. Current583acceptance files. All295prior metadata complete fields/prefixes/statuses/defaults/registered save/open/recovery exceptions preserved; three new native itrtxt/frmcrsr/move records individually unverified, current298, no blanket promotion. Eight pinned source hashes/locations reviewed at libreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65, plus cited destructor lifecycle. Five post-restoration source/resources/provenance/invariants/parity gates PASS once after final metadata; not replayed for fixture-only changes. Doctor0errors2knownwarnings, routing/diffPASS. Artifact census5347AP files at inspection,0upstream source/Python/scripts/raw maps/results/snapshots; legitimate policy checker retained, bounded English notes/digests/counts only. Raw snapshots/results/scripts outputs ignored project dependency cache. Complete590713-character parent Findings SHA563e2d1468dcd204f562b0a3d810577269bac9c4fbf1a2df72aa7d839ad5fbbd retained. All four priority bullet body/cell1280/390 full Chromium cases PASS; original width/minimum-distance fix unchanged. Deferred stash untouched.

Audit/tool corrections: missing read-only guessed paths and no-match reads recomputed route; one small source patch followed a previously nonzero combined read before route was recomputed on the next call, no runtime effects. Initial metadata clone extra semantic.status removed before runtime; established fields retained. Most significantly the JSON-only assertion census missed27uncaught errors in current and prior outputs; exact review rework was valid, corrected five fixture teardown paths and ran only original error cases, no suppression. This was deterministic audit rework, not automatic approval rejection. No hooks disabled, upstream source/Python artifacts, vendored runtime dependencies or passing replay.

Residual: full GetLayoutFrame ownership, RTL/bidi/read-only/fly/merged paragraph/GCAttr/full selection-mode behavior and layout-cache invalidation beyond current text/foreign owner remain unverified. Native list-label state is covered at core only; actual DOM label caret/marked list-level and ruler integration is next bounded audit. Prior native Name informational modal, numeric allocator/NameChanged/full-frame/formula/chart/mail-merge residuals remain unverified. Registered save/open/recovery deviations preserved. Whole kernel/browser parity parent/goal ACTIVE. Final Findings/Verification precede canonical verify; finish final actual implementation SHA.
