---
id: "202610070714-T9NGQB"
title: "Restore native table collapsing-border control and rendering"
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
  updated_at: "2026-10-07T07:14:52.450Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T08:25:50.483Z"
  updated_by: "CODER"
  note: "PASS ca41b2cfdbf8c50c745532f2466876181d16f105 native table merging control/attribute/render-mode scope;13465app110inventory14infrastructure266Chromium actual cases, strict100 app/inventory current-source maps; one full absent profile and failure/new-only closures,0passing replay;563 old acceptance bytes and289 prior metadata/exceptions preserved. Same-agent exact EVALUATOR PASS, not independent. Full parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T08:25:03.587Z"
  updated_by: "EVALUATOR"
  note: "PASS bounded native table merging control and existing render mode at ca41b2cfdbf8c50c745532f2466876181d16f105; same current-agent EVALUATOR, explicitly not independent."
  evaluated_sha: "ca41b2cfdbf8c50c745532f2466876181d16f105"
  blueprint_digest: "d921ac6dbda6d887028abe0e33a4c1be6836569650eb13853966d1e8757c7772"
  evidence_refs:
    - ".agentplane/tasks/202610070714-T9NGQB/README.md"
    - ".agentplane/tasks/202610070714-T9NGQB/quality/20261007-082503587-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610070714-T9NGQB/quality/20261007-082503587-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610070714-T9NGQB/quality/20261007-082503587-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610070714-T9NGQB/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610070714-T9NGQB/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610070714-T9NGQB/evidence/source-review.json"
    - ".agentplane/tasks/202610070714-T9NGQB/evidence/scope-final.json"
  findings:
    - "Native false default and owned tri-state changed-item flow preserve original state/parent authority; table attributes and cell borders apply in grouped history. Strict current-source counter/case reconstruction and all563 prior acceptance bytes,289 metadata fields/prefixes/statuses/defaults/exceptions pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore source-owned collapsing-border item and control through existing table attributes, history, paint and ODT under standing iterative parity authorization."
events:
  -
    type: "status"
    at: "2026-10-07T07:15:00.711Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned collapsing-border item and control through existing table attributes, history, paint and ODT under standing iterative parity authorization."
  -
    type: "verify"
    at: "2026-10-07T08:25:50.483Z"
    author: "CODER"
    state: "ok"
    note: "PASS ca41b2cfdbf8c50c745532f2466876181d16f105 native table merging control/attribute/render-mode scope;13465app110inventory14infrastructure266Chromium actual cases, strict100 app/inventory current-source maps; one full absent profile and failure/new-only closures,0passing replay;563 old acceptance bytes and289 prior metadata/exceptions preserved. Same-agent exact EVALUATOR PASS, not independent. Full parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-07T08:25:50.572Z"
doc_updated_by: "CODER"
description: "Iteration209: restore existing table borderModel behavior through the source-owned Merge adjacent line styles control, native boolean item input/output, grouped table attributes, rendering and ODT/history; preserve registered I/O deviations."
sections:
  Summary: "Restore native Merge adjacent line styles and existing table border-model rendering."
  Scope: |-
    Approved paths:
    - apps/office/src/sw/inc/hintids.ts
    - apps/office/src/sw/source/core/attr/swatrset.ts
    - apps/office/src/svl/source/items/cenumitm.ts
    - apps/office/src/cui/source/tabpages/border.ts
    - apps/office/src/sw/source/uibase/shells/tabsh.ts
    - apps/office/src/sw/browser/presentation/WriterBorderPage.tsx
    - apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    - apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    - apps/office/src/cui/source/tabpages/native-collapsing-border-page.test.ts
    - apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx
    - apps/office/e2e/writer-native-collapsing-borders.spec.ts
    - apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
    - apps/office/src/sw/browser/presentation/native-border-page.test.tsx
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json

    Preserve registered I/O/recovery deviations. Full native line arbitration, shadow and unrepresented Sfx page/layout behavior remain unverified.
  Plan: "One CODER leaf under standing iterative UI/native ownership authorization: restore existing collapsing/separating table border model through native RES_COLLAPSING_BORDERS=132 with false pool default, SfxBoolItem SetValue, source saved tri-state Reset/FillItemSet and changed-item-only output. Existing generic boxWhich injection extends to native collapseWhich without reverse CUI-to-SW dependency; React supplies Writer WhichId, displays Merge adjacent line styles and forwards native state. Shell captures existing table format into native items, separates table attributes from cell box/info writes and applies accepted native boolean via existing grouped SetTableAttr history. Browser paint reads existing native borderModel and source false default; explicit zero border spacing adapts contiguous native cell geometry. Preserve all original acceptance contracts and metadata prefixes/statuses/defaults/exceptions; only source-backed output/control/paint expectation migrations if required. New core/mounted and Chromium1280/390 tests cover default/input tri-state, clone/clear/unchanged behavior, Reset/Cancel, selected-row input with table-wide format effect, owner/cursor/text preservation, three Undo/Redo and ODT continuation. Initial six static gates once, one full upstream-absent runtime profile, failed/genuinely-new-only closures;100actual app/inventory coverage without fabrication/exclusions or passing replay. Source/scope/governance review after restoration, same-agent EVALUATOR exact implementation and canonical close/parent-prefix preservation. No upstream source/scripts/Python/raw results in AP, network/outside/delegation. Full native competing-line pixel arbitration, shadow/diagonal/theme/Sfx orchestration and whole parity remain unverified."
  Verify Steps: |-
    1. Source-backed native RES_COLLAPSING_BORDERS132 false pool default, owned bool clone/SetValue, Reset saved true/false/unknown and changed-only native FillItemSet including indeterminate ClearItem and absent original behavior. Native existing four distances/six lines remain intact. React checkbox uses native owner; Reset and Cancel do not mutate document.
    2. Real native shell properties capture original collapsing/separating/default format; accepted boolean applies via grouped native table attributes without treating table-only items as cell-border edits. Selected row input still changes actual table format. Browser paint reflects actual native table model with source false default and zero native gap. Existing owner/graph/text/cursor/selection/history intact; three Undo/Redo, ODT roundtrip and continued editing. Chromium1280/390 real imported models, checkbox/default/Reset/Cancel/accepted/history/geometry required.
    3. Initial format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once, scoped unchanged JSDoc/physical<1000. ONE full upstream-absent local static build/app/inventory/infrastructure/Chromium profile with finally restore; no concurrent source/AP/audit mutation. Only original failure or genuinely new cases afterward; actual100 app/inventory with whole identical source/maps or complete contiguous declaration/body/branch/all locations proofs, no manufactured coverage/exclusions/skippromotion or passing/full replay.
    4. Post-restoration generation--check/source-tree/provenance/invariants/parity; strict old acceptance/metadata prefix/default/status/registered deviation preservation, doctor/routing/diff and bounded English artifact0forbidden. Same current-agent EVALUATOR explicitly not independent exact implementation review. Final Findings/Verification before canonical verify and actual implementation finish; clean tracked/all state; preserve complete parent prefix on append, parent/goal ACTIVE.
  Verification: |-
    Command: initial six static gates once; failed/changed-input closures only; ONE full upstream-absent profile and original-failure/genuinely-new-only closures; source gates after restoration; exact implementation current-source/map counter/case/scope/metadata/governance review.
    Result: PASS approved native table merging control/attribute and existing render-mode scope.
    Evidence: implementation ca41b2cfdbf8c50c745532f2466876181d16f105;13465app110inventory14infrastructure266Chromium actual cases,0unresolved0passing replay;5focused app skip observations remain skipped. Actual100% all four app/inventory metrics, strict whole or contiguous source/maps proof. See evidence/exact-sha-review.json, final-coverage.json, case-census.json, source-review.json, scope-final.json and canonical quality report. All runtime checks without vendor, finally restored. All563 prior acceptance bytes,289 complete metadata prefixes/statuses/defaults/registered exceptions retained. Four current bullet body/cell Chromium regressions passed.
    Scope: native false default, source bool clone/state/Reset/changed-only FillItemSet, original parent/disabled/default authority, React native checkbox and grouped table/cell history, existing border-model paint and ODT continuation. Exact competing-line pixel arbitration/full widget units/shadow/diagonal/theme/Sfx orchestration/refcount/RTL/vertical/follow/shared-format and whole parity unverified. Same current-agent evaluator, explicitly not independent; parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T08:25:50.483Z — VERIFY — ok

    By: CODER

    Note: PASS ca41b2cfdbf8c50c745532f2466876181d16f105 native table merging control/attribute/render-mode scope;13465app110inventory14infrastructure266Chromium actual cases, strict100 app/inventory current-source maps; one full absent profile and failure/new-only closures,0passing replay;563 old acceptance bytes and289 prior metadata/exceptions preserved. Same-agent exact EVALUATOR PASS, not independent. Full parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T08:25:49.716Z, excerpt_hash=sha256:179a921801d5038aeca25c95dbc1f1d8c35e300ad6951707fcfdb2654b0985e8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610070714-T9NGQB/blueprint/resolved-snapshot.json
    - old_digest: d921ac6dbda6d887028abe0e33a4c1be6836569650eb13853966d1e8757c7772
    - current_digest: d921ac6dbda6d887028abe0e33a4c1be6836569650eb13853966d1e8757c7772
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610070714-T9NGQB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610070714-T9NGQB
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf implementation commit and retain completed immutable evidence and registered deviations."
  Findings: |-
    Previous goal turn made concrete progress: native six-line border page208 DONE at61d4c2617649b72096cca1f2d40df9d74d9dcb3f. Current main clean. Source border.cxx Reset/FillItemSet/PageCreated exposes Merge adjacent line styles for Writer tables; init.cxx defaults RES_COLLAPSING_BORDERS false, tabfrm.cxx reads that flag. Existing SwTableFormat and ODT already retain borderModel, but native page has no control and browser always paints collapse. This leaf restores existing functionality end to end. Read-only discovery used two guessed absent paths and recomputed route; no mutation from that command. One task, no subagents/network/global access.

    Iteration209 final closure. Implementation ca41b2cfdbf8c50c745532f2466876181d16f105 restores source RES_COLLAPSING_BORDERS132 and pooled false default, independent SfxBoolItem clone/SetValue, native SvxBorderTabPage saved Boolean/indeterminate Reset and changed-only FillItemSet. Indeterminate clears output; missing original never manufactures a boolean; default-equal box/info clearing preserves earlier boolean changed flag. Writer original SET/DEFAULT/INVALID/DISABLED and parent input values remain authoritative; only UNKNOWN legacy input is reconstructed from existing table format. Native mappedWhich injection has no reverse CUI-to-SW import. React Properties/Merge adjacent line styles renders native tri-state and forwards edits. Shell separates accepted native table attributes from SET cell box/info writes in existing grouped history. Browser paints existing borderModel, source false/separate and zero contiguous cell spacing. Existing ODT preservation remains unchanged. Selected-row original owners/cursors/text, Reset/Cancel, three Undo/Redo, ODT continuation and coupled native cell/table attributes are exercised.

    Command: initial six static gates ONCE; only failed/changed-input closures. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, then only original failures and genuinely new cases. Actual current union13465app110inventory14infrastructure266Chromium PASS,0unresolved0passing runtime replay;5focused skipped app observations remain skipped. Initial full app command exit1 was one uncovered branch in byte-identical browser-writer-edit-window.ts, closed by prior verified whole-identical source and entire maps actual counters. Filtered six genuinely new input-authority cases all passed; command exit1 reflects subset global threshold. One unchanged menu timeout passed failure-only closure. Two new coupled drafts failed because original text was captured before import completion; wait for four cells and exact original text now precedes capture, all prior mode/style/history/text assertions retained. Only those two failed drafts reran and passed. Vendor restored finally; post-restoration source generation/tree/provenance/invariants/parity gates all passed. Final scoped lint/type/format, unchanged JSDoc and physical<1000 pass. Doctor0errors2knownwarnings, routing/diff PASS.

    Strict current-source/map app actual100% L16080 S17652 F4098 B13238 across286files; inventory actual100% L1464 S1523 F384 B1081 across38files. Whole identical source/maps or complete contiguous declaration/body/enclosing branch/all mapped locations certified; no manufactured counters/exclusions/skippromotion. App map/proof fe0f18353a496d228a1f4ecd5b4940777fef220e604b9f374d3d8d5f527bff61/de92f15de13bb6e50559b233ae57b1ec2a41256ef286c009db1fa9cd1fbfe39f; inventory b54f0c213687d37b33b85299eb37789044a0cc295af6a4be14d4fee20c9f548f/5c43a8f01265876178c73869204175bfde82507529383d6eac361ff12ce0b0b8. Exact implementation review reconstructed counters and case census identically without runtime replay. Initial audit reader expected an array for the single lint record; corrected schema before PASS verdict, no source/runtime changes.

    Scope15approved13actual semantic paths:8production3new acceptance2existing metadata. All563 prior acceptance files byte-identical,3new=566; all initially passing new bodies and generators preserved after genuinely-new additions. All289 metadata complete prior fields/prefixes/statuses/defaults and registered save/open/recovery exceptions preserved, no new records or semantic promotion. Same current-agent EVALUATOR exactSHA PASS, explicitly not independent; evidence/exact-sha-review.json and quality/20261007-082503587-recovery-context/quality-report.json. AP0forbidden source/Python artifacts and bounded English json/md only; raw sources/maps/results stay ignored project dependency cache. Priority bullet fix e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 stays unchanged; four current Chromium1280/390 body/cell overlap regressions PASS.

    Residual: exact native competing-line pixel arbitration, full widget units, shadow/diagonal/theme, full SfxTabPage/slot-pool/frame-attribute infrastructure and SfxBoolItem refcount enforcement, RTL/vertical/follow/shared-format and whole kernel/browser parity remain UNVERIFIED. Leaf scope complete, parent/goal ACTIVE. Entire561879-character prior parent Findings prefix SHA148d324dbfac868fbc561aac29aec2e68257a7fce3dbb700c4b756213b22d2fa preserved for append. Final prose precedes canonical verification; finish records actual implementationSHA.
id_source: "generated"
---
## Summary

Restore native Merge adjacent line styles and existing table border-model rendering.

## Scope

Approved paths:
- apps/office/src/sw/inc/hintids.ts
- apps/office/src/sw/source/core/attr/swatrset.ts
- apps/office/src/svl/source/items/cenumitm.ts
- apps/office/src/cui/source/tabpages/border.ts
- apps/office/src/sw/source/uibase/shells/tabsh.ts
- apps/office/src/sw/browser/presentation/WriterBorderPage.tsx
- apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
- apps/office/src/sw/browser/editor/WriterEditableTable.tsx
- apps/office/src/cui/source/tabpages/native-collapsing-border-page.test.ts
- apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx
- apps/office/e2e/writer-native-collapsing-borders.spec.ts
- apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
- apps/office/src/sw/browser/presentation/native-border-page.test.tsx
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

Preserve registered I/O/recovery deviations. Full native line arbitration, shadow and unrepresented Sfx page/layout behavior remain unverified.

## Plan

One CODER leaf under standing iterative UI/native ownership authorization: restore existing collapsing/separating table border model through native RES_COLLAPSING_BORDERS=132 with false pool default, SfxBoolItem SetValue, source saved tri-state Reset/FillItemSet and changed-item-only output. Existing generic boxWhich injection extends to native collapseWhich without reverse CUI-to-SW dependency; React supplies Writer WhichId, displays Merge adjacent line styles and forwards native state. Shell captures existing table format into native items, separates table attributes from cell box/info writes and applies accepted native boolean via existing grouped SetTableAttr history. Browser paint reads existing native borderModel and source false default; explicit zero border spacing adapts contiguous native cell geometry. Preserve all original acceptance contracts and metadata prefixes/statuses/defaults/exceptions; only source-backed output/control/paint expectation migrations if required. New core/mounted and Chromium1280/390 tests cover default/input tri-state, clone/clear/unchanged behavior, Reset/Cancel, selected-row input with table-wide format effect, owner/cursor/text preservation, three Undo/Redo and ODT continuation. Initial six static gates once, one full upstream-absent runtime profile, failed/genuinely-new-only closures;100actual app/inventory coverage without fabrication/exclusions or passing replay. Source/scope/governance review after restoration, same-agent EVALUATOR exact implementation and canonical close/parent-prefix preservation. No upstream source/scripts/Python/raw results in AP, network/outside/delegation. Full native competing-line pixel arbitration, shadow/diagonal/theme/Sfx orchestration and whole parity remain unverified.

## Verify Steps

1. Source-backed native RES_COLLAPSING_BORDERS132 false pool default, owned bool clone/SetValue, Reset saved true/false/unknown and changed-only native FillItemSet including indeterminate ClearItem and absent original behavior. Native existing four distances/six lines remain intact. React checkbox uses native owner; Reset and Cancel do not mutate document.
2. Real native shell properties capture original collapsing/separating/default format; accepted boolean applies via grouped native table attributes without treating table-only items as cell-border edits. Selected row input still changes actual table format. Browser paint reflects actual native table model with source false default and zero native gap. Existing owner/graph/text/cursor/selection/history intact; three Undo/Redo, ODT roundtrip and continued editing. Chromium1280/390 real imported models, checkbox/default/Reset/Cancel/accepted/history/geometry required.
3. Initial format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once, scoped unchanged JSDoc/physical<1000. ONE full upstream-absent local static build/app/inventory/infrastructure/Chromium profile with finally restore; no concurrent source/AP/audit mutation. Only original failure or genuinely new cases afterward; actual100 app/inventory with whole identical source/maps or complete contiguous declaration/body/branch/all locations proofs, no manufactured coverage/exclusions/skippromotion or passing/full replay.
4. Post-restoration generation--check/source-tree/provenance/invariants/parity; strict old acceptance/metadata prefix/default/status/registered deviation preservation, doctor/routing/diff and bounded English artifact0forbidden. Same current-agent EVALUATOR explicitly not independent exact implementation review. Final Findings/Verification before canonical verify and actual implementation finish; clean tracked/all state; preserve complete parent prefix on append, parent/goal ACTIVE.

## Verification

Command: initial six static gates once; failed/changed-input closures only; ONE full upstream-absent profile and original-failure/genuinely-new-only closures; source gates after restoration; exact implementation current-source/map counter/case/scope/metadata/governance review.
Result: PASS approved native table merging control/attribute and existing render-mode scope.
Evidence: implementation ca41b2cfdbf8c50c745532f2466876181d16f105;13465app110inventory14infrastructure266Chromium actual cases,0unresolved0passing replay;5focused app skip observations remain skipped. Actual100% all four app/inventory metrics, strict whole or contiguous source/maps proof. See evidence/exact-sha-review.json, final-coverage.json, case-census.json, source-review.json, scope-final.json and canonical quality report. All runtime checks without vendor, finally restored. All563 prior acceptance bytes,289 complete metadata prefixes/statuses/defaults/registered exceptions retained. Four current bullet body/cell Chromium regressions passed.
Scope: native false default, source bool clone/state/Reset/changed-only FillItemSet, original parent/disabled/default authority, React native checkbox and grouped table/cell history, existing border-model paint and ODT continuation. Exact competing-line pixel arbitration/full widget units/shadow/diagonal/theme/Sfx orchestration/refcount/RTL/vertical/follow/shared-format and whole parity unverified. Same current-agent evaluator, explicitly not independent; parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T08:25:50.483Z — VERIFY — ok

By: CODER

Note: PASS ca41b2cfdbf8c50c745532f2466876181d16f105 native table merging control/attribute/render-mode scope;13465app110inventory14infrastructure266Chromium actual cases, strict100 app/inventory current-source maps; one full absent profile and failure/new-only closures,0passing replay;563 old acceptance bytes and289 prior metadata/exceptions preserved. Same-agent exact EVALUATOR PASS, not independent. Full parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T08:25:49.716Z, excerpt_hash=sha256:179a921801d5038aeca25c95dbc1f1d8c35e300ad6951707fcfdb2654b0985e8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610070714-T9NGQB/blueprint/resolved-snapshot.json
- old_digest: d921ac6dbda6d887028abe0e33a4c1be6836569650eb13853966d1e8757c7772
- current_digest: d921ac6dbda6d887028abe0e33a4c1be6836569650eb13853966d1e8757c7772
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610070714-T9NGQB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610070714-T9NGQB
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf implementation commit and retain completed immutable evidence and registered deviations.

## Findings

Previous goal turn made concrete progress: native six-line border page208 DONE at61d4c2617649b72096cca1f2d40df9d74d9dcb3f. Current main clean. Source border.cxx Reset/FillItemSet/PageCreated exposes Merge adjacent line styles for Writer tables; init.cxx defaults RES_COLLAPSING_BORDERS false, tabfrm.cxx reads that flag. Existing SwTableFormat and ODT already retain borderModel, but native page has no control and browser always paints collapse. This leaf restores existing functionality end to end. Read-only discovery used two guessed absent paths and recomputed route; no mutation from that command. One task, no subagents/network/global access.

Iteration209 final closure. Implementation ca41b2cfdbf8c50c745532f2466876181d16f105 restores source RES_COLLAPSING_BORDERS132 and pooled false default, independent SfxBoolItem clone/SetValue, native SvxBorderTabPage saved Boolean/indeterminate Reset and changed-only FillItemSet. Indeterminate clears output; missing original never manufactures a boolean; default-equal box/info clearing preserves earlier boolean changed flag. Writer original SET/DEFAULT/INVALID/DISABLED and parent input values remain authoritative; only UNKNOWN legacy input is reconstructed from existing table format. Native mappedWhich injection has no reverse CUI-to-SW import. React Properties/Merge adjacent line styles renders native tri-state and forwards edits. Shell separates accepted native table attributes from SET cell box/info writes in existing grouped history. Browser paints existing borderModel, source false/separate and zero contiguous cell spacing. Existing ODT preservation remains unchanged. Selected-row original owners/cursors/text, Reset/Cancel, three Undo/Redo, ODT continuation and coupled native cell/table attributes are exercised.

Command: initial six static gates ONCE; only failed/changed-input closures. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, then only original failures and genuinely new cases. Actual current union13465app110inventory14infrastructure266Chromium PASS,0unresolved0passing runtime replay;5focused skipped app observations remain skipped. Initial full app command exit1 was one uncovered branch in byte-identical browser-writer-edit-window.ts, closed by prior verified whole-identical source and entire maps actual counters. Filtered six genuinely new input-authority cases all passed; command exit1 reflects subset global threshold. One unchanged menu timeout passed failure-only closure. Two new coupled drafts failed because original text was captured before import completion; wait for four cells and exact original text now precedes capture, all prior mode/style/history/text assertions retained. Only those two failed drafts reran and passed. Vendor restored finally; post-restoration source generation/tree/provenance/invariants/parity gates all passed. Final scoped lint/type/format, unchanged JSDoc and physical<1000 pass. Doctor0errors2knownwarnings, routing/diff PASS.

Strict current-source/map app actual100% L16080 S17652 F4098 B13238 across286files; inventory actual100% L1464 S1523 F384 B1081 across38files. Whole identical source/maps or complete contiguous declaration/body/enclosing branch/all mapped locations certified; no manufactured counters/exclusions/skippromotion. App map/proof fe0f18353a496d228a1f4ecd5b4940777fef220e604b9f374d3d8d5f527bff61/de92f15de13bb6e50559b233ae57b1ec2a41256ef286c009db1fa9cd1fbfe39f; inventory b54f0c213687d37b33b85299eb37789044a0cc295af6a4be14d4fee20c9f548f/5c43a8f01265876178c73869204175bfde82507529383d6eac361ff12ce0b0b8. Exact implementation review reconstructed counters and case census identically without runtime replay. Initial audit reader expected an array for the single lint record; corrected schema before PASS verdict, no source/runtime changes.

Scope15approved13actual semantic paths:8production3new acceptance2existing metadata. All563 prior acceptance files byte-identical,3new=566; all initially passing new bodies and generators preserved after genuinely-new additions. All289 metadata complete prior fields/prefixes/statuses/defaults and registered save/open/recovery exceptions preserved, no new records or semantic promotion. Same current-agent EVALUATOR exactSHA PASS, explicitly not independent; evidence/exact-sha-review.json and quality/20261007-082503587-recovery-context/quality-report.json. AP0forbidden source/Python artifacts and bounded English json/md only; raw sources/maps/results stay ignored project dependency cache. Priority bullet fix e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 stays unchanged; four current Chromium1280/390 body/cell overlap regressions PASS.

Residual: exact native competing-line pixel arbitration, full widget units, shadow/diagonal/theme, full SfxTabPage/slot-pool/frame-attribute infrastructure and SfxBoolItem refcount enforcement, RTL/vertical/follow/shared-format and whole kernel/browser parity remain UNVERIFIED. Leaf scope complete, parent/goal ACTIVE. Entire561879-character prior parent Findings prefix SHA148d324dbfac868fbc561aac29aec2e68257a7fce3dbb700c4b756213b22d2fa preserved for append. Final prose precedes canonical verification; finish records actual implementationSHA.
