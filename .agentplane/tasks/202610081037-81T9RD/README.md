---
id: "202610081037-81T9RD"
title: "Move native table ruler tracking out of Writer edit window"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "native-ruler"
  - "parity"
  - "table"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T10:38:40.899Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T11:38:47.082Z"
  updated_by: "CODER"
  note: "Approved native Ruler/SvxRuler ownership scope verified at ab796a27b84c; one full absent profile plus original-failure/new-only closure, unique app13785 inventory110 infra19 Chromium299 pass, exact-source all-four100, four byte-identical reconstructed reports,620 prior acceptance sources and307 prior metadata contracts preserved. Same-current-agent EVALUATOR pass, explicitly not independent; per-row column core and full SFX/VCL residuals remain partial and goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T11:38:27.419Z"
  updated_by: "EVALUATOR"
  note: "Exact ab796a27b84c native ruler ownership scope passes reconstructed evidence; same current agent, explicitly not independent"
  evaluated_sha: "ab796a27b84c9e14b0dcbb362d137f3ee82ad2b6"
  blueprint_digest: "6e4f3556f973cd73a9caa9f59d6fb5d5ca098b487359cb115694b2e8b250b7bb"
  evidence_refs:
    - ".agentplane/tasks/202610081037-81T9RD/README.md"
    - ".agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610081037-81T9RD/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610081037-81T9RD/evidence/implementation-review.json"
  findings:
    - "Four committed reports reconstructed byte-identically against actual implementation; all11 semantic paths, all620 prior acceptance sources, app13785 inventory110 infra19 Chromium299, one full absent profile and one original-failure/new-only closure, all-four exact-source-bound coverage100, protected IO pin stash and parent preserved. Independent per-row column widths/current-line apply and full native SFX/VCL ruler state remain explicit partial follow-ups."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: execute the standing user-approved native table ruler ownership refactor in the current checkout."
events:
  -
    type: "status"
    at: "2026-10-08T10:38:41.582Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute the standing user-approved native table ruler ownership refactor in the current checkout."
  -
    type: "verify"
    at: "2026-10-08T11:38:47.082Z"
    author: "CODER"
    state: "ok"
    note: "Approved native Ruler/SvxRuler ownership scope verified at ab796a27b84c; one full absent profile plus original-failure/new-only closure, unique app13785 inventory110 infra19 Chromium299 pass, exact-source all-four100, four byte-identical reconstructed reports,620 prior acceptance sources and307 prior metadata contracts preserved. Same-current-agent EVALUATOR pass, explicitly not independent; per-row column core and full SFX/VCL residuals remain partial and goal active."
doc_version: 3
doc_updated_at: "2026-10-08T11:38:47.158Z"
doc_updated_by: "CODER"
description: "Iteration232: establish source-owned Ruler/SvxRuler tracking and SvxColumnItem apply ownership, persistent SwView horizontal/vertical rulers, and remove table geometry algorithms from SwEditWin under the standing approved parity goal."
sections:
  Summary: "Move represented table ruler ownership to the native source modules and remove Writer edit-window arithmetic."
  Scope: |-
    apps/office/src/svtools/source/control/ruler.ts
    apps/office/src/svx/source/dialog/svxruler.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/source/uibase/uiview/view.ts
    apps/office/src/sw/source/uibase/uiview/viewtab.ts
    scripts/check-module-boundaries.mjs
    apps/office/src/svx/source/dialog/native-table-ruler.test.ts
    apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts
    scripts/native-ruler-boundary.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration232 under standing user-authorized local parity goal: replace Writer-local table ruler algorithms with source-owned SVTOOLS Ruler tracking and SVX SvxRuler table geometry over independent SvxColumnItem. SwView owns persistent horizontal/vertical rulers; SwEditWin admits actual source table hits, captures document start/original carrier, delegates Border/Margin1/Margin2 StartDocDrag with5px tolerance, move/release/cancel and applies through Writer ExecuteTabWin-shaped native item conversion. Move exact modifier flags, owned uint16 share buffers, native limits/linear/proportional row and column tracking and value apply to SVX without SW/browser dependencies. Only actual native SVX->SVTOOLS/VCL library edges admitted, no reverse edges. Scope11 (6production,3fresh tests,2metadata). Keep620old acceptance sources unchanged and307old provenance/inventory fields/evidence-prefix/class/default/state unchanged; new native records remain partial, no promotion. Real owners/history/cancel/admission/hidden/minimum/masks/device geometry regressions and native library isolation. Initial6static once, ONE upstream-absent build/app/inventory/infra/Chromium profile, only original failed/genuinely new cases afterward. All-four exact-source/map cumulative coverage100, no sanitation. Restored5source-only gates, AP source/script/raw bans, scoped physical<1000/JSDoc/scope/pin/IO/stash/parent-prefix controls. Same-agent EVALUATOR explicitly not independent; final docs before canonical verify/checkpoint/finish actual implementation SHA, clean final Git and append-only parent659097chars SHA8b0a4f7afee4c66846ad2d9efce18c81b2ae64e872da2da2fe0ddbc8146d2a93. Full non-table tabs/indent/object/native VCL drawing, ruler snapping/protection/vertical-document contexts and full SFX slot-driven ruler updates remain partial. Goal remains ACTIVE."
  Verify Steps: |-
    1. Native ownership regression: SVTOOLS Ruler start/move/end/cancel state and5px source hit tolerance, persistent SwView horizontal/vertical owners, native SvxColumnItem independent transient values and Writer apply preserving original models/history; pinned Ruler StartDocDrag and SwEditWin edtwin3 delegation plus SvxRuler EvalModifier/PrepareProportional_Impl/CalcMinMax/DragBorders/ApplyBorders and Writer ExecuteTabWin/native SetTabRows source anchors; literal independent multirow device geometry/shares/minima, real initial mouse modifier transmission, precise solitary/composite masks, active-line-only/default/bottom flags, release/cancel/history/source owner preservation. Tests never read or invoke upstream; all620 prior acceptance sources unchanged.
    2. Initial6format/lint/type/dependencies/docs/physical checks once; ONE absent build/app/inventory/infra/Chromium profile with finally restore; only original failed/genuinely new cases afterward, skipped observations retained and no passing replay. All-four app/inventory100 via entire identical sources/maps or complete contiguous declarations/body/enclosing-branch/all-location proofs, never clamp counters. Restored5source-only gates afterward.
    3. Scope11,307prior records each preserve field/evidence-prefix/default/class/state,4protected IO unchanged; actual physical<1000/scoped unchanged JSDoc, no upstream/source/Python/raw maps/results in AP artifacts, legitimate registered policy script only. Doctor/routing/diff, pin, stash c85f4a0e453dfd06d6e199554784f2c286737472 and entire parent659097char prefix SHA8b0a4f7afee4c66846ad2d9efce18c81b2ae64e872da2da2fe0ddbc8146d2a93 preserved.
    4. Exact actual implementation SHA/evidence reconstruction, same-current-agent EVALUATOR explicitly not independent; final Findings/Verification before canonical verify, committed verify checkpoint before finish actual implementation SHA rather than workflow tail; clean final Git and append-only parent. Goal ACTIVE, new Ruler/SvxRuler records partial; no full row/ruler/module promotion.
  Verification: |-
    Command: Initial six static gates; scoped original-failure/changed-input static closures1/2/3; ONE upstream-absent build/app/inventory/infrastructure/Chromium profile; one failed/genuinely-new-only focused runtime closure; exact-source cumulative coverage proof; restored five source-only gates; scoped JSDoc/actual physical size; native source/scope/case/artifact/governance audits.
    Result: pass for approved native ruler ownership scope. Original diagnostic failures and raw threshold exits retained and resolved through bounded changed-input/failure-only closures. Evidence: .agentplane/tasks/202610081037-81T9RD/evidence/*.json (bounded counts/hashes/identifiers only); raw results/maps/source snapshots in ignored cache only. Unique app13785/inventory110/infra19/Chromium299 pass, passingReplay0; all-four app/inventory coverage100 with exact-source proof. All620 prior acceptance sources unchanged,11semantic paths,307prior records preserved with2new unverified partial owners,4IO/bridge/pin/stash/parent preserved. Scope: native Ruler/SvxRuler capture and represented table geometry delegated from Writer edit window. Residual: independent per-row column widths/current-line column core apply and complete SFX/VCL/margin contexts remain incomplete; goal ACTIVE. Actual implementation ab796a27b84c9e14b0dcbb362d137f3ee82ad2b6; exact implementation-review.json reconstructed4reports with failures[], same-current-agent EVALUATOR explicitly not independent PASS .agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/quality-report.json. Canonical verify/checkpoint then finish this actual SHA; final clean audit and append-only parent required.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T11:38:47.082Z — VERIFY — ok

    By: CODER

    Note: Approved native Ruler/SvxRuler ownership scope verified at ab796a27b84c; one full absent profile plus original-failure/new-only closure, unique app13785 inventory110 infra19 Chromium299 pass, exact-source all-four100, four byte-identical reconstructed reports,620 prior acceptance sources and307 prior metadata contracts preserved. Same-current-agent EVALUATOR pass, explicitly not independent; per-row column core and full SFX/VCL residuals remain partial and goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T11:38:45.975Z, excerpt_hash=sha256:ca56f084277d920bc371062002e7ca1e046b929bf8ec5eabde43517dbed5d40f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081037-81T9RD/blueprint/resolved-snapshot.json
    - old_digest: 6e4f3556f973cd73a9caa9f59d6fb5d5ca098b487359cb115694b2e8b250b7bb
    - current_digest: 6e4f3556f973cd73a9caa9f59d6fb5d5ca098b487359cb115694b2e8b250b7bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610081037-81T9RD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610081037-81T9RD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the reviewed implementation commit; preserve prior DONE tasks, IO exceptions and stash."
  Findings: |-
    Implementation in progress: native SVTOOLS Ruler capture lifecycle and SVX SvxRuler table policy are connected to persistent SwView h/v owners. SwEditWin no longer contains modifier/share/limit/geometry loops; Writer viewtab owns native item apply conversion. Added three fresh acceptance sources; two native runtime/provenance owners appended as unverified,307prior records retain states/defaults/classes. Native source Library_svx uses svt/vcl and Library_sw uses svt; graph admits only those required directions. Represented source context remains horizontal-writing flat table borders/rows; ordinary column margins retain prior partial geometry until native paragraph/frame margin state exists. Vertical-document/frame-column admission is explicitly declined. Full SFX bindings/slot page context, VCL drawing/snapping/protection remain omitted; no full ruler promotion.

    Initial six static checks completed once: type/dependencies/docs/physical pass; format and lint fail for new test formatting, unused trailing probe parameter and nonliteral source enum alias. Scoped closure1 passes format and unused-variable correction but reports literal duplicate alias4. Scoped closure2 uses a typed constant flag map preserving both native alias names/value4 without lint exemptions, passes changed-source formatting/lint and changed-input application typecheck. Runtime has not run yet; no passing test replay. Raw static diagnostics retained only in ignored node_modules cache; AP evidence contains bounded command/count/hash JSON only. No implementation commit or task completion yet.

    ONE full absent profile terminal: buildPASS; app13778PASS3FAIL0SKIP (all32 fresh cases pass), inventory109PASS1FAIL, infra19PASS, Chromium299PASS0FLAKY0SKIP0UNEXPECTED in358400ms;0uncaught; vendor restored. Retained original failures: three legacy Ctrl+Shift column cases became no-op when the new native current-line flag reached explicit unsupported independent-row guards in SwDoc/SwTable; inventory CLI rejects appended modules outside canonical lexical order. Corrected Writer column apply to its prior ordinary shared-column contract, keeping native flags in SVX and row apply unchanged; next core task must remove the actual independent-row limitation with real model/history/layout/filter evidence. Native current-line columns remain a known upstream gap, not an intentional exception. Canonically inserted two new records; all307 old fields/prefixes/states/defaults/classes preserved. Removed two unreachable column-margin skeleton branches in the border-only represented native functions; added4 genuinely new unequal/hidden and cross-axis history cases to exercise changed complete functions. No prior acceptance source changed, skipped observations and raw counters retained. Focused closure will run only3 original app failures +4 genuinely new cases +1 original inventory failure, never the passing Chromium/build/infra or other app/inventory cases.

    Focused runtime closure1 completed once without replaying passing cases: app7PASS0FAIL81SKIP (3original failures resolved +4genuinely new cases), inventory1PASS0FAIL2SKIP (the original lexical-order failure resolved),0uncaught, vendor restored. Raw focused exits1 reflect full-project coverage thresholds on targeted subsets; raw outputs/counters retained. Unique cumulative census app13785PASS/inventory110PASS/infrastructure19PASS/Chromium299PASS0FLAKY0SKIP, unresolved0, passingReplay0. Static closure3 changed-input4 source/tests format/lint/app typecheck PASS. No additional build/Chromium/infra/full runtime replay.

    Exact current-source cumulative app coverage all-four100: L17138/S18818/F4348/B14076; inventory L1464/S1523/F384/B1081. Whole identical files304app/38inventory,2app complete contiguous initial-to-focused transfers,3prior complete source-region transfers. Negative V8 aggregate fallback only entire prior certified identical source/maps; no sanitation/clamping. Maps/proofs/results remain ignored-cache only. Restored5source-only gates once PASS;309records retain307old field/prefix/state/default/class contracts and add2unverified partial native owners. Scope11, all620prior acceptance sources byte-identical,4protectedIO and actual browser modifier bridge unchanged.

    Unchanged scoped JSDoc/physical bounds PASS (maximum535actual lines). Native-source9files/6production owners pinned to LibreOffice26.8.0.2 commit9bc445578031fecf56086729d8e4940c77e14d65. Doctor/routing/diff PASS; doctor2pre-existingwarnings retained. Whole AgentPlane including ignored5845files contains no upstream/application/Python/raw coverage source/results; initial ignored script diagnostic resolved by exact byte identity to legitimate framework routing source. Exact SHA-bound same-current-agent EVALUATOR review, canonical verification/checkpoint/finish remain pending; goal ACTIVE. Native current-line column flag still cannot apply independent per-row widths in core; next leaf must implement actual box-width/model/history/layout/filter ownership and remove the retained shared-column compatibility branch. No full ruler/table/module certification.

    Actual implementation ab796a27b84c9e14b0dcbb362d137f3ee82ad2b6 committed. Same-current-agent EVALUATOR explicitly not independent: exact11semantic bytes/HEAD/clean checkout checked; four committed coverage/census/scope/native-source reports reconstructed byte-identically, all raw maps/proofs/census hashes/complete source bounds reviewed, original failures and filtered skips retained without passing replay, pin/stash/entire parent prefix preserved. Implementation-review.json failures[], canonical evaluator PASS .agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/quality-report.json. Full native per-row column/core current-line support is next priority; all five source residuals retained and no module promotion. Canonical verification and committed verification checkpoint precede finish with actual implementation SHA; parent receives an append-only summary afterward.
id_source: "generated"
---
## Summary

Move represented table ruler ownership to the native source modules and remove Writer edit-window arithmetic.

## Scope

apps/office/src/svtools/source/control/ruler.ts
apps/office/src/svx/source/dialog/svxruler.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/source/uibase/uiview/view.ts
apps/office/src/sw/source/uibase/uiview/viewtab.ts
scripts/check-module-boundaries.mjs
apps/office/src/svx/source/dialog/native-table-ruler.test.ts
apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts
scripts/native-ruler-boundary.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration232 under standing user-authorized local parity goal: replace Writer-local table ruler algorithms with source-owned SVTOOLS Ruler tracking and SVX SvxRuler table geometry over independent SvxColumnItem. SwView owns persistent horizontal/vertical rulers; SwEditWin admits actual source table hits, captures document start/original carrier, delegates Border/Margin1/Margin2 StartDocDrag with5px tolerance, move/release/cancel and applies through Writer ExecuteTabWin-shaped native item conversion. Move exact modifier flags, owned uint16 share buffers, native limits/linear/proportional row and column tracking and value apply to SVX without SW/browser dependencies. Only actual native SVX->SVTOOLS/VCL library edges admitted, no reverse edges. Scope11 (6production,3fresh tests,2metadata). Keep620old acceptance sources unchanged and307old provenance/inventory fields/evidence-prefix/class/default/state unchanged; new native records remain partial, no promotion. Real owners/history/cancel/admission/hidden/minimum/masks/device geometry regressions and native library isolation. Initial6static once, ONE upstream-absent build/app/inventory/infra/Chromium profile, only original failed/genuinely new cases afterward. All-four exact-source/map cumulative coverage100, no sanitation. Restored5source-only gates, AP source/script/raw bans, scoped physical<1000/JSDoc/scope/pin/IO/stash/parent-prefix controls. Same-agent EVALUATOR explicitly not independent; final docs before canonical verify/checkpoint/finish actual implementation SHA, clean final Git and append-only parent659097chars SHA8b0a4f7afee4c66846ad2d9efce18c81b2ae64e872da2da2fe0ddbc8146d2a93. Full non-table tabs/indent/object/native VCL drawing, ruler snapping/protection/vertical-document contexts and full SFX slot-driven ruler updates remain partial. Goal remains ACTIVE.

## Verify Steps

1. Native ownership regression: SVTOOLS Ruler start/move/end/cancel state and5px source hit tolerance, persistent SwView horizontal/vertical owners, native SvxColumnItem independent transient values and Writer apply preserving original models/history; pinned Ruler StartDocDrag and SwEditWin edtwin3 delegation plus SvxRuler EvalModifier/PrepareProportional_Impl/CalcMinMax/DragBorders/ApplyBorders and Writer ExecuteTabWin/native SetTabRows source anchors; literal independent multirow device geometry/shares/minima, real initial mouse modifier transmission, precise solitary/composite masks, active-line-only/default/bottom flags, release/cancel/history/source owner preservation. Tests never read or invoke upstream; all620 prior acceptance sources unchanged.
2. Initial6format/lint/type/dependencies/docs/physical checks once; ONE absent build/app/inventory/infra/Chromium profile with finally restore; only original failed/genuinely new cases afterward, skipped observations retained and no passing replay. All-four app/inventory100 via entire identical sources/maps or complete contiguous declarations/body/enclosing-branch/all-location proofs, never clamp counters. Restored5source-only gates afterward.
3. Scope11,307prior records each preserve field/evidence-prefix/default/class/state,4protected IO unchanged; actual physical<1000/scoped unchanged JSDoc, no upstream/source/Python/raw maps/results in AP artifacts, legitimate registered policy script only. Doctor/routing/diff, pin, stash c85f4a0e453dfd06d6e199554784f2c286737472 and entire parent659097char prefix SHA8b0a4f7afee4c66846ad2d9efce18c81b2ae64e872da2da2fe0ddbc8146d2a93 preserved.
4. Exact actual implementation SHA/evidence reconstruction, same-current-agent EVALUATOR explicitly not independent; final Findings/Verification before canonical verify, committed verify checkpoint before finish actual implementation SHA rather than workflow tail; clean final Git and append-only parent. Goal ACTIVE, new Ruler/SvxRuler records partial; no full row/ruler/module promotion.

## Verification

Command: Initial six static gates; scoped original-failure/changed-input static closures1/2/3; ONE upstream-absent build/app/inventory/infrastructure/Chromium profile; one failed/genuinely-new-only focused runtime closure; exact-source cumulative coverage proof; restored five source-only gates; scoped JSDoc/actual physical size; native source/scope/case/artifact/governance audits.
Result: pass for approved native ruler ownership scope. Original diagnostic failures and raw threshold exits retained and resolved through bounded changed-input/failure-only closures. Evidence: .agentplane/tasks/202610081037-81T9RD/evidence/*.json (bounded counts/hashes/identifiers only); raw results/maps/source snapshots in ignored cache only. Unique app13785/inventory110/infra19/Chromium299 pass, passingReplay0; all-four app/inventory coverage100 with exact-source proof. All620 prior acceptance sources unchanged,11semantic paths,307prior records preserved with2new unverified partial owners,4IO/bridge/pin/stash/parent preserved. Scope: native Ruler/SvxRuler capture and represented table geometry delegated from Writer edit window. Residual: independent per-row column widths/current-line column core apply and complete SFX/VCL/margin contexts remain incomplete; goal ACTIVE. Actual implementation ab796a27b84c9e14b0dcbb362d137f3ee82ad2b6; exact implementation-review.json reconstructed4reports with failures[], same-current-agent EVALUATOR explicitly not independent PASS .agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/quality-report.json. Canonical verify/checkpoint then finish this actual SHA; final clean audit and append-only parent required.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T11:38:47.082Z — VERIFY — ok

By: CODER

Note: Approved native Ruler/SvxRuler ownership scope verified at ab796a27b84c; one full absent profile plus original-failure/new-only closure, unique app13785 inventory110 infra19 Chromium299 pass, exact-source all-four100, four byte-identical reconstructed reports,620 prior acceptance sources and307 prior metadata contracts preserved. Same-current-agent EVALUATOR pass, explicitly not independent; per-row column core and full SFX/VCL residuals remain partial and goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T11:38:45.975Z, excerpt_hash=sha256:ca56f084277d920bc371062002e7ca1e046b929bf8ec5eabde43517dbed5d40f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081037-81T9RD/blueprint/resolved-snapshot.json
- old_digest: 6e4f3556f973cd73a9caa9f59d6fb5d5ca098b487359cb115694b2e8b250b7bb
- current_digest: 6e4f3556f973cd73a9caa9f59d6fb5d5ca098b487359cb115694b2e8b250b7bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610081037-81T9RD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610081037-81T9RD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the reviewed implementation commit; preserve prior DONE tasks, IO exceptions and stash.

## Findings

Implementation in progress: native SVTOOLS Ruler capture lifecycle and SVX SvxRuler table policy are connected to persistent SwView h/v owners. SwEditWin no longer contains modifier/share/limit/geometry loops; Writer viewtab owns native item apply conversion. Added three fresh acceptance sources; two native runtime/provenance owners appended as unverified,307prior records retain states/defaults/classes. Native source Library_svx uses svt/vcl and Library_sw uses svt; graph admits only those required directions. Represented source context remains horizontal-writing flat table borders/rows; ordinary column margins retain prior partial geometry until native paragraph/frame margin state exists. Vertical-document/frame-column admission is explicitly declined. Full SFX bindings/slot page context, VCL drawing/snapping/protection remain omitted; no full ruler promotion.

Initial six static checks completed once: type/dependencies/docs/physical pass; format and lint fail for new test formatting, unused trailing probe parameter and nonliteral source enum alias. Scoped closure1 passes format and unused-variable correction but reports literal duplicate alias4. Scoped closure2 uses a typed constant flag map preserving both native alias names/value4 without lint exemptions, passes changed-source formatting/lint and changed-input application typecheck. Runtime has not run yet; no passing test replay. Raw static diagnostics retained only in ignored node_modules cache; AP evidence contains bounded command/count/hash JSON only. No implementation commit or task completion yet.

ONE full absent profile terminal: buildPASS; app13778PASS3FAIL0SKIP (all32 fresh cases pass), inventory109PASS1FAIL, infra19PASS, Chromium299PASS0FLAKY0SKIP0UNEXPECTED in358400ms;0uncaught; vendor restored. Retained original failures: three legacy Ctrl+Shift column cases became no-op when the new native current-line flag reached explicit unsupported independent-row guards in SwDoc/SwTable; inventory CLI rejects appended modules outside canonical lexical order. Corrected Writer column apply to its prior ordinary shared-column contract, keeping native flags in SVX and row apply unchanged; next core task must remove the actual independent-row limitation with real model/history/layout/filter evidence. Native current-line columns remain a known upstream gap, not an intentional exception. Canonically inserted two new records; all307 old fields/prefixes/states/defaults/classes preserved. Removed two unreachable column-margin skeleton branches in the border-only represented native functions; added4 genuinely new unequal/hidden and cross-axis history cases to exercise changed complete functions. No prior acceptance source changed, skipped observations and raw counters retained. Focused closure will run only3 original app failures +4 genuinely new cases +1 original inventory failure, never the passing Chromium/build/infra or other app/inventory cases.

Focused runtime closure1 completed once without replaying passing cases: app7PASS0FAIL81SKIP (3original failures resolved +4genuinely new cases), inventory1PASS0FAIL2SKIP (the original lexical-order failure resolved),0uncaught, vendor restored. Raw focused exits1 reflect full-project coverage thresholds on targeted subsets; raw outputs/counters retained. Unique cumulative census app13785PASS/inventory110PASS/infrastructure19PASS/Chromium299PASS0FLAKY0SKIP, unresolved0, passingReplay0. Static closure3 changed-input4 source/tests format/lint/app typecheck PASS. No additional build/Chromium/infra/full runtime replay.

Exact current-source cumulative app coverage all-four100: L17138/S18818/F4348/B14076; inventory L1464/S1523/F384/B1081. Whole identical files304app/38inventory,2app complete contiguous initial-to-focused transfers,3prior complete source-region transfers. Negative V8 aggregate fallback only entire prior certified identical source/maps; no sanitation/clamping. Maps/proofs/results remain ignored-cache only. Restored5source-only gates once PASS;309records retain307old field/prefix/state/default/class contracts and add2unverified partial native owners. Scope11, all620prior acceptance sources byte-identical,4protectedIO and actual browser modifier bridge unchanged.

Unchanged scoped JSDoc/physical bounds PASS (maximum535actual lines). Native-source9files/6production owners pinned to LibreOffice26.8.0.2 commit9bc445578031fecf56086729d8e4940c77e14d65. Doctor/routing/diff PASS; doctor2pre-existingwarnings retained. Whole AgentPlane including ignored5845files contains no upstream/application/Python/raw coverage source/results; initial ignored script diagnostic resolved by exact byte identity to legitimate framework routing source. Exact SHA-bound same-current-agent EVALUATOR review, canonical verification/checkpoint/finish remain pending; goal ACTIVE. Native current-line column flag still cannot apply independent per-row widths in core; next leaf must implement actual box-width/model/history/layout/filter ownership and remove the retained shared-column compatibility branch. No full ruler/table/module certification.

Actual implementation ab796a27b84c9e14b0dcbb362d137f3ee82ad2b6 committed. Same-current-agent EVALUATOR explicitly not independent: exact11semantic bytes/HEAD/clean checkout checked; four committed coverage/census/scope/native-source reports reconstructed byte-identically, all raw maps/proofs/census hashes/complete source bounds reviewed, original failures and filtered skips retained without passing replay, pin/stash/entire parent prefix preserved. Implementation-review.json failures[], canonical evaluator PASS .agentplane/tasks/202610081037-81T9RD/quality/20261008-113827419-recovery-context/quality-report.json. Full native per-row column/core current-line support is next priority; all five source residuals retained and no module promotion. Canonical verification and committed verification checkpoint precede finish with actual implementation SHA; parent receives an append-only summary afterward.
