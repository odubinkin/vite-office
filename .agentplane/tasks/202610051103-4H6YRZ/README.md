---
id: "202610051103-4H6YRZ"
title: "Materialize native per-cell cursor rings for selected table character formatting"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T11:29:49.091Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T11:38:55.171Z"
  updated_by: "CODER"
  note: "Verified semantic SHA2ca6a9de9fdc6c8f6849bdcfbfb046ddd17cf716: native circular cell editing cursors/full-cell character formatting/table-mode UndoRedo;14new appcases and1new Chromiumcase. Six statics pass; ONE upstream-absent build/app/inventory/scripts/115caseChromium profile; only2failed expectations and2new cases repeated/executed,4pass. Production unchanged after successful build/Chromium; actualcountercoverage100 in all four metrics. Five restored source audits pass;246semantic states/defaults/classifications/exceptions preserved.387prior tests byte-identical; four displayed-owner API migrations, only two documented obsolete mark expectations corrected against native source with stronger assertions. ExactSHA same-agent EVALUATOR audit precedes quality pass. Per-ring text insertion/deletion/paste and paragraph/list commands, native gestures/layout/merged/protected/redline cases remain separate. Broad goalactive."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T11:38:26.948Z"
  updated_by: "EVALUATOR"
  note: "Exact-SHA review of2ca6a9de9fdc6c8f6849bdcfbfb046ddd17cf716 passes the bounded native cell cursor-ring task; same-agent EVALUATOR phase."
  evaluated_sha: "2ca6a9de9fdc6c8f6849bdcfbfb046ddd17cf716"
  blueprint_digest: "e0d043036dbb210125c69633b1c7647639abe65ed3bbc7ea73381166a7c9a5d9"
  evidence_refs:
    - ".agentplane/tasks/202610051103-4H6YRZ/README.md"
    - ".agentplane/tasks/202610051103-4H6YRZ/quality/20261005-113826948-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/quality/20261005-113826948-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051103-4H6YRZ/quality/20261005-113826948-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051103-4H6YRZ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/evidence/evaluated-sha-audit.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/evidence/absent-profile.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/evidence/failed-and-new-profile.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/evidence/final-coverage.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/evidence/scope-audit.json"
    - ".agentplane/tasks/202610051103-4H6YRZ/evidence/restored-source-audits.json"
  findings:
    - "Native GetCursor and MakeBoxSels own full selected cell ranges; UI display owner remains table endpoint cursor. Full-cell character formats and table-mode Undo/Redo verified with14new app cases and1new browsercase."
    - "ONE full upstream-absent build/app/inventory/scripts/Chromium profile. Two obsolete mounted mark expectations corrected against pinned source, with stronger full-cell assertions;4failed/new-only closure passed. Final production byte-identical to successful full build and115-case Chromium profile;100actual-counter coverage."
    - "Four existing tests migrate displayed-owner calls;387other prior tests byte-identical. All246semantic statuses/defaults/classifications and conscious I/O/recovery exceptions preserved. Five source audits pass; no AP source/helpers/Python/rawframes."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: approved iterative UI refactoring; native per-cell formatting cursor ring leaf148."
events:
  -
    type: "status"
    at: "2026-10-05T11:04:47.038Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved iterative UI refactoring; native per-cell formatting cursor ring leaf148."
  -
    type: "verify"
    at: "2026-10-05T11:38:55.171Z"
    author: "CODER"
    state: "ok"
    note: "Verified semantic SHA2ca6a9de9fdc6c8f6849bdcfbfb046ddd17cf716: native circular cell editing cursors/full-cell character formatting/table-mode UndoRedo;14new appcases and1new Chromiumcase. Six statics pass; ONE upstream-absent build/app/inventory/scripts/115caseChromium profile; only2failed expectations and2new cases repeated/executed,4pass. Production unchanged after successful build/Chromium; actualcountercoverage100 in all four metrics. Five restored source audits pass;246semantic states/defaults/classifications/exceptions preserved.387prior tests byte-identical; four displayed-owner API migrations, only two documented obsolete mark expectations corrected against native source with stronger assertions. ExactSHA same-agent EVALUATOR audit precedes quality pass. Per-ring text insertion/deletion/paste and paragraph/list commands, native gestures/layout/merged/protected/redline cases remain separate. Broad goalactive."
doc_version: 3
doc_updated_at: "2026-10-05T11:39:26.668Z"
doc_updated_by: "CODER"
description: "Iteration148 under 202609240501-C9TN6M. Port native GetCursor default and separate displayed table cursor from editing cursor rings, so selected table character commands cover full cells and preserve selection through history."
sections:
  Summary: "Use native per-cell editing cursor rings for selected table character formatting."
  Scope: "Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; keep every assertion/value/body equivalent under renamed owner API. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents."
  Plan: "Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; retain assertions except the two failed mounted Shift Home/End ordinary.HasMark expectations: native GetCurAttr calls default GetCursor and MakeBoxSels reuses the ordinary current cursor as a marked full-cell range. Correct that obsolete expectation to true and assert full native cell mark0/pointLen; retain all other expectations. Confirmed pinned edattr.cxx GetCurAttr and swcrsr.cxx MakeBoxSels after the sole full profile; no production workaround. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full build,app/inventorycoverage --coverage.reportOnFailure,source-provenance/resource tests and Chromium while vendor reference renamed inside repo and restored in finally. Tests never execute/read pinned upstream. Persist exact failed/error names before assertions; only failed gates/cases and genuinely new unexecuted cases may repeat. AP bounded English results/counts/hashes only; initial maps ignored appcache.
    3. Assert real rings insertion/removal/lifetime, full multi-paragraph selected cells excluding unselected rectangle holes, retain/reconcile cursor identity, default GetCursor editing-owner versus displayed getShellCursor, changed-state and history reconstruction. Test Bold/Italic/font/color selection across actual boxes, unselected neighbors, one history unit and Undo/Redo; mounted and Chromium commandstate/render/paint evidence. Four old testfiles migrate displayed-owner method calls. In mounted native-section-navigation.test.tsx only the two failed parameterized Shift Home/End expectations ordinary.HasMark false become true with full-cell mark/point assertions, as native GetCurAttr/GetCursor/MakeBoxSels requires; all other assertions equivalent after owner API normalization. All other prior tests byte-identical. No passing full/static/build/suite/test replay.
    4. Restore vendor before five resource/source-tree/provenance/invariant/parity audits. Retain existingsemanticstates/defaults/classifications/exceptions; no wholemodulepromotion. Scope/old-assertion/APsourceartifact audit, exactSHA sameactorEVALUATORaudit before quality, verification and canonicalfinish, cleanfinaltrackedstate; append parent progress and leave broad goalactive.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T11:38:55.171Z — VERIFY — ok

    By: CODER

    Note: Verified semantic SHA2ca6a9de9fdc6c8f6849bdcfbfb046ddd17cf716: native circular cell editing cursors/full-cell character formatting/table-mode UndoRedo;14new appcases and1new Chromiumcase. Six statics pass; ONE upstream-absent build/app/inventory/scripts/115caseChromium profile; only2failed expectations and2new cases repeated/executed,4pass. Production unchanged after successful build/Chromium; actualcountercoverage100 in all four metrics. Five restored source audits pass;246semantic states/defaults/classifications/exceptions preserved.387prior tests byte-identical; four displayed-owner API migrations, only two documented obsolete mark expectations corrected against native source with stronger assertions. ExactSHA same-agent EVALUATOR audit precedes quality pass. Per-ring text insertion/deletion/paste and paragraph/list commands, native gestures/layout/merged/protected/redline cases remain separate. Broad goalactive.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T11:36:36.079Z, excerpt_hash=sha256:f13f69f5051864661d2d212d87d4886918bdaf0e380d20cc15473511f5c2b4fd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051103-4H6YRZ/blueprint/resolved-snapshot.json
    - old_digest: e0d043036dbb210125c69633b1c7647639abe65ed3bbc7ea73381166a7c9a5d9
    - current_digest: e0d043036dbb210125c69633b1c7647639abe65ed3bbc7ea73381166a7c9a5d9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610051103-4H6YRZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610051103-4H6YRZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional semantic change through a new authorized leaf; no history rewrite."
  Findings: |-
    Current selected-box painting uses table owner, but character commands consume one linear endpoint span and can omit first-cell text. Pinned SwCursorShell::GetCursor(makeTableCursor=true) returns ordinary current cursor, materializes MakeBoxSels; getShellCursor owns display cursor. SwTableCursor::MakeBoxSels creates whole-cell mark-first0/point-lastLen ranges and retains matching cursors. SwEditShell formatting traverses GetRingContainer. Port actual native ring mechanism, preserve displayed selection and history; full per-ring structural edits remain separate.

    - Observation: ONE upstream-absent full profile: build pass; app 12075 pass and 2 failed mounted Shift Home/End expectations out of12077; initial branchcoverage99.97 with2 uncoveredbranches; inventory109/36coverage100; scripts5/2; Chromium115pass noflakes. Exact failed names recorded before assertions. Native GetCurAttr/GetCursor/MakeBoxSels confirms ordinary cursor reuses full marked cell ranges, invalidating prior unmarked assertion.
      Impact: Existing UI state queries now correctly materialize native cell rings. Preserving obsolete unmarked assertions would require a production workaround inconsistent with upstream. Initial scope-token audit also detected only Prettier trailing call-comma punctuation.
      Resolution: Within standing upstream UI authorization and same16paths, revised taskplan and VerifySteps, reapproved sequentially. Corrected exactly two parameterized expectations and added full-cell assertions. Added two new ring reconciliation/collapsed-owner cases. Failed/new-only closure4pass; final actual-counter coverage100 across lines11999 statements13135 functions3334 branches9814. No final production source changed after full build/Chromium; no passing gate/suite/case replay. Scope token audit normalizes optional trailing call commas only; all other old-test tokens must remain equivalent after owner API migration.

    - Observation: Bounded implementation completed: circular SwPaM ownership/traversal/disposal; SwTableCursor native dirty/movement/full-cell MakeBoxSels retain/reconcile; GetCursor defaults to editing ring, getShellCursor displays table endpoints. Full-cell character formatting reaches only actual selected boxes, including multi-paragraph text. Native table-mode history survives Undo/Redo without UI TextRuns editing.
      Impact: Four old tests migrate displayed-owner calls; only two obsolete mounted mark expectations change as explicitly documented, with stronger full-cell assertions. Other387prior testfiles byte-identical. All246semantic states/defaults/classifications and conscious I/O/recovery exceptions unchanged. No wholemodule promotion or broad parity claim.
      Resolution: All six static gates closed;14new appcases and1new Chromiumcase;115unique Chromiumcases pass. ONE full absent profile plus4failed/new-only cases; production unchanged after full build and Chromium. Appcoverage100 actual counters; inventory100. Five restored source audits pass with semanticViolationCount0. Scope/changed-testformat/lint/docs/types pass. AP ignored-inclusive scan4113files no forbidden source/helper/Python/rawframe/binary. Residual: selected-cell text insertion/deletion/paste and paragraph/list commands still require native per-ring operation ownership; selection drag/column gestures, native layout/protection/redlines/merged/nested/unequal cells unverified. Broad goalactive.

    - Observation: Verification-record commit attempted unsupported verify scope; commit-msg correctly rejected it and HEAD remained unchanged.
      Impact: Only task README remained staged; production and passing verification evidence unaffected.
      Resolution: Use canonical allowed task scope for the verification artifact commit; no hook changes, bypasses or test replay.
id_source: "generated"
---
## Summary

Use native per-cell editing cursor rings for selected table character formatting.

## Scope

Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; keep every assertion/value/body equivalent under renamed owner API. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents.

## Plan

Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; retain assertions except the two failed mounted Shift Home/End ordinary.HasMark expectations: native GetCurAttr calls default GetCursor and MakeBoxSels reuses the ordinary current cursor as a marked full-cell range. Correct that obsolete expectation to true and assert full native cell mark0/pointLen; retain all other expectations. Confirmed pinned edattr.cxx GetCurAttr and swcrsr.cxx MakeBoxSels after the sole full profile; no production workaround. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full build,app/inventorycoverage --coverage.reportOnFailure,source-provenance/resource tests and Chromium while vendor reference renamed inside repo and restored in finally. Tests never execute/read pinned upstream. Persist exact failed/error names before assertions; only failed gates/cases and genuinely new unexecuted cases may repeat. AP bounded English results/counts/hashes only; initial maps ignored appcache.
3. Assert real rings insertion/removal/lifetime, full multi-paragraph selected cells excluding unselected rectangle holes, retain/reconcile cursor identity, default GetCursor editing-owner versus displayed getShellCursor, changed-state and history reconstruction. Test Bold/Italic/font/color selection across actual boxes, unselected neighbors, one history unit and Undo/Redo; mounted and Chromium commandstate/render/paint evidence. Four old testfiles migrate displayed-owner method calls. In mounted native-section-navigation.test.tsx only the two failed parameterized Shift Home/End expectations ordinary.HasMark false become true with full-cell mark/point assertions, as native GetCurAttr/GetCursor/MakeBoxSels requires; all other assertions equivalent after owner API normalization. All other prior tests byte-identical. No passing full/static/build/suite/test replay.
4. Restore vendor before five resource/source-tree/provenance/invariant/parity audits. Retain existingsemanticstates/defaults/classifications/exceptions; no wholemodulepromotion. Scope/old-assertion/APsourceartifact audit, exactSHA sameactorEVALUATORaudit before quality, verification and canonicalfinish, cleanfinaltrackedstate; append parent progress and leave broad goalactive.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T11:38:55.171Z — VERIFY — ok

By: CODER

Note: Verified semantic SHA2ca6a9de9fdc6c8f6849bdcfbfb046ddd17cf716: native circular cell editing cursors/full-cell character formatting/table-mode UndoRedo;14new appcases and1new Chromiumcase. Six statics pass; ONE upstream-absent build/app/inventory/scripts/115caseChromium profile; only2failed expectations and2new cases repeated/executed,4pass. Production unchanged after successful build/Chromium; actualcountercoverage100 in all four metrics. Five restored source audits pass;246semantic states/defaults/classifications/exceptions preserved.387prior tests byte-identical; four displayed-owner API migrations, only two documented obsolete mark expectations corrected against native source with stronger assertions. ExactSHA same-agent EVALUATOR audit precedes quality pass. Per-ring text insertion/deletion/paste and paragraph/list commands, native gestures/layout/merged/protected/redline cases remain separate. Broad goalactive.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T11:36:36.079Z, excerpt_hash=sha256:f13f69f5051864661d2d212d87d4886918bdaf0e380d20cc15473511f5c2b4fd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051103-4H6YRZ/blueprint/resolved-snapshot.json
- old_digest: e0d043036dbb210125c69633b1c7647639abe65ed3bbc7ea73381166a7c9a5d9
- current_digest: e0d043036dbb210125c69633b1c7647639abe65ed3bbc7ea73381166a7c9a5d9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610051103-4H6YRZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610051103-4H6YRZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional semantic change through a new authorized leaf; no history rewrite.

## Findings

Current selected-box painting uses table owner, but character commands consume one linear endpoint span and can omit first-cell text. Pinned SwCursorShell::GetCursor(makeTableCursor=true) returns ordinary current cursor, materializes MakeBoxSels; getShellCursor owns display cursor. SwTableCursor::MakeBoxSels creates whole-cell mark-first0/point-lastLen ranges and retains matching cursors. SwEditShell formatting traverses GetRingContainer. Port actual native ring mechanism, preserve displayed selection and history; full per-ring structural edits remain separate.

- Observation: ONE upstream-absent full profile: build pass; app 12075 pass and 2 failed mounted Shift Home/End expectations out of12077; initial branchcoverage99.97 with2 uncoveredbranches; inventory109/36coverage100; scripts5/2; Chromium115pass noflakes. Exact failed names recorded before assertions. Native GetCurAttr/GetCursor/MakeBoxSels confirms ordinary cursor reuses full marked cell ranges, invalidating prior unmarked assertion.
  Impact: Existing UI state queries now correctly materialize native cell rings. Preserving obsolete unmarked assertions would require a production workaround inconsistent with upstream. Initial scope-token audit also detected only Prettier trailing call-comma punctuation.
  Resolution: Within standing upstream UI authorization and same16paths, revised taskplan and VerifySteps, reapproved sequentially. Corrected exactly two parameterized expectations and added full-cell assertions. Added two new ring reconciliation/collapsed-owner cases. Failed/new-only closure4pass; final actual-counter coverage100 across lines11999 statements13135 functions3334 branches9814. No final production source changed after full build/Chromium; no passing gate/suite/case replay. Scope token audit normalizes optional trailing call commas only; all other old-test tokens must remain equivalent after owner API migration.

- Observation: Bounded implementation completed: circular SwPaM ownership/traversal/disposal; SwTableCursor native dirty/movement/full-cell MakeBoxSels retain/reconcile; GetCursor defaults to editing ring, getShellCursor displays table endpoints. Full-cell character formatting reaches only actual selected boxes, including multi-paragraph text. Native table-mode history survives Undo/Redo without UI TextRuns editing.
  Impact: Four old tests migrate displayed-owner calls; only two obsolete mounted mark expectations change as explicitly documented, with stronger full-cell assertions. Other387prior testfiles byte-identical. All246semantic states/defaults/classifications and conscious I/O/recovery exceptions unchanged. No wholemodule promotion or broad parity claim.
  Resolution: All six static gates closed;14new appcases and1new Chromiumcase;115unique Chromiumcases pass. ONE full absent profile plus4failed/new-only cases; production unchanged after full build and Chromium. Appcoverage100 actual counters; inventory100. Five restored source audits pass with semanticViolationCount0. Scope/changed-testformat/lint/docs/types pass. AP ignored-inclusive scan4113files no forbidden source/helper/Python/rawframe/binary. Residual: selected-cell text insertion/deletion/paste and paragraph/list commands still require native per-ring operation ownership; selection drag/column gestures, native layout/protection/redlines/merged/nested/unequal cells unverified. Broad goalactive.

- Observation: Verification-record commit attempted unsupported verify scope; commit-msg correctly rejected it and HEAD remained unchanged.
  Impact: Only task README remained staged; production and passing verification evidence unaffected.
  Resolution: Use canonical allowed task scope for the verification artifact commit; no hook changes, bypasses or test replay.
