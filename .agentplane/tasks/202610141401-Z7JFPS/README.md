---
id: "202610141401-Z7JFPS"
title: "Implement shared complex-color value ownership for Calc attributes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T14:02:35.790Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T14:17:00.732Z"
  updated_by: "CODER"
  note: "Source9dfed0c36128 exact18paths3709hashes11nativepins. Related15tests6wholeowners and Calc172tests strict raw100;12gates32boundaries; same-agent review not independent. Real shared ComplexColor values only, transform/UNO/DocPool/document/UI/ODS pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T14:16:44.452Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: actual shared complex-color value ownership verified at committed source"
  evaluated_sha: "9dfed0c3612854b8172e1cb0d3c65df8c0fe5773"
  blueprint_digest: "4896ce43c73fdb9c12abd7d71523dc1b5b229ccafea9345fa1f7b68718947b74"
  evidence_refs:
    - ".agentplane/tasks/202610141401-Z7JFPS/README.md"
    - ".agentplane/tasks/202610141401-Z7JFPS/quality/20261014-141644452-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141401-Z7JFPS/quality/20261014-141644452-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141401-Z7JFPS/quality/20261014-141644452-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141401-Z7JFPS/blueprint/resolved-snapshot.json"
    - "output/playwright/task130-checks/exact-review.json"
    - "output/playwright/task130-checks/value-coverage-audit.json"
  findings:
    - "Exact18paths5existing13new,3709sourcehashes11nativepins; current15relatedtests5files6wholeowners and172Calc tests raw100. Twelve focused gates and32boundaries pass, no linter/coverage rule relaxation."
    - "Original state/copy/ordered transformation/theme tables and hash-field mismatch preserved. JS extrema exactly compute consumed native HSL luminance; existing browser logical hash binding explicit, no ABI binary claim or unnecessary vector library."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: actual ComplexColor value owner required by native font/border items, using existing shared Color and browser logical scalar hashes."
events:
  -
    type: "status"
    at: "2026-10-14T14:02:46.114Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual ComplexColor value owner required by native font/border items, using existing shared Color and browser logical scalar hashes."
  -
    type: "verify"
    at: "2026-10-14T14:17:00.732Z"
    author: "CODER"
    state: "ok"
    note: "Source9dfed0c36128 exact18paths3709hashes11nativepins. Related15tests6wholeowners and Calc172tests strict raw100;12gates32boundaries; same-agent review not independent. Real shared ComplexColor values only, transform/UNO/DocPool/document/UI/ODS pending."
doc_version: 3
doc_updated_at: "2026-10-14T14:17:00.827Z"
doc_updated_by: "CODER"
description: "Task130: native docmodel ComplexColor value state, theme and transformation contracts required by actual SvxColorItem and border attributes. Reuse existing Tools Color and o3tl hashes with explicit browser logical hash binding; preserve suspicious original equality/hash fields, document. Real transform application and HSL numeric helpers remain absent until actual native Color prerequisites, no fake identity implementation. No substitute pool or provider."
sections:
  Summary: "Task130 implements actual shared docmodel ComplexColor value ownership for native Calc font/border attribute prerequisites, reusing Tools Color and o3tl. Success: native default/copy/system/theme/component/transformation state and original comparison/hash field contracts, strict whole changed owners and Calc100; no fake color attribute pool. Work only calc checkout. Full run only actual minimum UI+ODS readiness then pause."
  Scope: "At most24paths: new docmodel/inc/color/ComplexColor.ts, Transformation.ts and docmodel/inc/theme/ThemeColorType.ts plus their tests; actual Calc sentinel test integration; exact shared runtime/provenance/capability inventory; scripts/check-module-boundaries graph/test for docmodel->tools/o3tl only; calc-core progress and calc-upstream-suspected-issues. Actual Color transformation application and related BColor/HSL prerequisites remain unported, no identity fallback or provider. No Writer runtime changes."
  Plan: "Native ComplexColor/Transformation/theme value state for real Calc color attributes, actual Color and existing logical hashes; no fake transform application. Theme tables/index via equivalent JS min/max. Strict whole shared and Calc raw100,12gates32boundaries, inventory/native pins and exactsource review. No full before actual UI/ODS readiness."
  Verify Steps: "Read include/docmodel/color/ComplexColor.hxx, docmodel/source/color/ComplexColor.cxx, include/docmodel/color/Transformation.hxx, include/docmodel/theme/ThemeColorType.hxx and exact RGB/HSL luminance from basegfx/source/color/bcolortools.cxx. Literal default/copy/assignment/unused-system/validtheme/mixed RGB CRGB HSL/rawcomponents/getRGB unchangedoutputs/transformation copies/add/remove/clear/all enum values/hashfields/equalityshortcircuits/alias-safeassign/source-dependent transparency/no finalization-sideeffect; all5x6lumtables and threshold boundaries/effect creation. Strict related coverage6wholeowners with original Color/hash tests plus all new tests, and npm run test:coverage:calc, raw S/B/F/L100 everycounterpositive. Runtimechecks4source symlinks absent/restoredfinally.12focusedgates and32moduleboundarytests; exactallowlist/sourcehash/nativepins actualHEAD clean calc. No full app/browser since actual readiness pending and no UI/Writer runtime changes."
  Verification: |-
    Command: node output/playwright/task130-checks/portable.mjs. Result: pass. Evidence: initial current-value profile passed15relatedtests5files6owners331S73B95F319L raw100 and wholeCalc172tests66files33owners4161S2731B821F3709L raw100. Final syntax-only enum and callback-doc refinement triggered one fresh runtime recollection, which passed with identical counts and every raw counter positive; retain both maps/logs, no counter merging or coverage relaxation. Four upstream links absent/restoredfinally. Scope: actual docmodel state/copy/transformations/theme/effect index and existing real Color/o3tl values. No Writer coverage exception needed.

    Command: node output/playwright/task130-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence:12final gates and32boundarytests passed. Evidence:32boundarytests pass after actual docmodel/inc mechanism-layer registration, forward Tools/o3tl allowed and application/reverse/browser guards retained. Initial typecheck, lint and docs diagnostics retained and fixed in scope. Native duplicate LAST alias retained through existing implicit enum style with no lint-disable. Scope:18paths5existing13new,3696to3709sourceblobs,11nativeSHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Native comparison/hash state mismatch preserved CALC113; browser32 logical scalar hash binding is explicit, binary std::hash<double>/size_t parity not claimed. Actual unused vector/HSL hierarchy is avoided using exact relevant luminance arithmetic with JS Math. Same-agent evaluator not independent.

    Skipped: full application and browser suites. Reason: no Writer runtime/UI changes and explicit human full-run checkpoint requires actual minimum Calc UI/document and same-model ODS readiness, still pending. Risk: full native UNO/transform application/attribute pool/document/UI/ODS not certified. Approval: human focused-test/readiness/pause instructions. No C++/memory/ABI engine or fake component provider.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T14:17:00.732Z — VERIFY — ok

    By: CODER

    Note: Source9dfed0c36128 exact18paths3709hashes11nativepins. Related15tests6wholeowners and Calc172tests strict raw100;12gates32boundaries; same-agent review not independent. Real shared ComplexColor values only, transform/UNO/DocPool/document/UI/ODS pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T14:16:52.949Z, excerpt_hash=sha256:98a8110127099ed3251519dbe7defbfb0787f8ddf94e25ec580c4938ce176e06

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141401-Z7JFPS/blueprint/resolved-snapshot.json
    - old_digest: 4896ce43c73fdb9c12abd7d71523dc1b5b229ccafea9345fa1f7b68718947b74
    - current_digest: 4896ce43c73fdb9c12abd7d71523dc1b5b229ccafea9345fa1f7b68718947b74
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141401-Z7JFPS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141401-Z7JFPS -m 🧩 Z7JFPS task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task implementation and records through a future authorized task. Never reset unrelated tasks or merge branches."
  Findings: |-
    Previous goal turn made authoritative progress: Color base and shared/Writer border consumers completed. Preflight now clean calc. Actual SvxColorItem requires an owned ComplexColor even for ordinary font colors; no fake empty peer. Native equality ignores ThemeColorUsage and final color, while getHash includes final and omits theme type, potential inconsistency to retain. Existing hash-combine numbers provide logical browser hashes, not native binary ABI; no native C++/memory probes. Original getIndex only consumes HSL luminance=(max+min)/2, implemented with native JS Math on normalized channels rather than unused vector hierarchy.

    Initial typecheck required explicit bounded array index assertions for valid native vector/table domains; no runtime bounds or fallback behavior introduced. Initial10of12staticgates passed; lint required literal enum LAST11 and valid return overload signatures, docs required callback JSDoc. Native getRGB Color/void overloads now explicit and implementation uses JS undefined, no semantic fallback. Initial diagnostics retained. Related15tests5files6wholeowners pass331S73B95F319L100, everyrawcounter verification pending runner completion. All new state is ordinary JS and actual existing Color; original 31system/29transformation/14theme enum entries and5x6tables tested. No C++ compilation, no geometry/numeric library port.

    New boundary assertion exposed a missing ownership-layer prefix for docmodel/inc despite allowed module edges. Register original shared-header layer so browser/package restrictions actually apply, retaining reverse/application restrictions. Existing31tests passed;32nd assertion now validates the new owner, original failure retained.

    Whole Calc172tests66files33owners pass4161S2731B821F3709L100; all related6owners331S73B95F319L raw100. All4native source symlinks absent during runtime checks/restoredfinally. No Writer runtime or UI changed, no browser replay or full checkpoint yet. Original docmodel has no qa directory and targeted editeng QA search returned no direct ComplexColor test; bounded fallback found real svx/qa/unit/xoutdev.cxx FillComplexColor theme/transform state assertions. That QA also requires native UNO wrappers still pending; evidence mapping does not certify the whole drawing/UNO test.

    Second lint pass exposed explicit duplicate enum literal11. Use the existing repository style of implicit sequential members with literal LAST11, retaining every native value and alias, without a lint-disable or rule relaxation. One multiline Alpha callback JSDoc was not matched by initial editing and is now added. Runtime owner syntax changed after successful tests, so recollect current runtime coverage once; retain all successful and initial diagnostic profiles.

    Final runtime recollection after enum syntax/docs change passes identical15related/172Calc test counts and identical raw100 counter totals, all4reference links restored. No merged/rebased counter map or replay beyond source-change justified verification.
id_source: "generated"
---
## Summary

Task130 implements actual shared docmodel ComplexColor value ownership for native Calc font/border attribute prerequisites, reusing Tools Color and o3tl. Success: native default/copy/system/theme/component/transformation state and original comparison/hash field contracts, strict whole changed owners and Calc100; no fake color attribute pool. Work only calc checkout. Full run only actual minimum UI+ODS readiness then pause.

## Scope

At most24paths: new docmodel/inc/color/ComplexColor.ts, Transformation.ts and docmodel/inc/theme/ThemeColorType.ts plus their tests; actual Calc sentinel test integration; exact shared runtime/provenance/capability inventory; scripts/check-module-boundaries graph/test for docmodel->tools/o3tl only; calc-core progress and calc-upstream-suspected-issues. Actual Color transformation application and related BColor/HSL prerequisites remain unported, no identity fallback or provider. No Writer runtime changes.

## Plan

Native ComplexColor/Transformation/theme value state for real Calc color attributes, actual Color and existing logical hashes; no fake transform application. Theme tables/index via equivalent JS min/max. Strict whole shared and Calc raw100,12gates32boundaries, inventory/native pins and exactsource review. No full before actual UI/ODS readiness.

## Verify Steps

Read include/docmodel/color/ComplexColor.hxx, docmodel/source/color/ComplexColor.cxx, include/docmodel/color/Transformation.hxx, include/docmodel/theme/ThemeColorType.hxx and exact RGB/HSL luminance from basegfx/source/color/bcolortools.cxx. Literal default/copy/assignment/unused-system/validtheme/mixed RGB CRGB HSL/rawcomponents/getRGB unchangedoutputs/transformation copies/add/remove/clear/all enum values/hashfields/equalityshortcircuits/alias-safeassign/source-dependent transparency/no finalization-sideeffect; all5x6lumtables and threshold boundaries/effect creation. Strict related coverage6wholeowners with original Color/hash tests plus all new tests, and npm run test:coverage:calc, raw S/B/F/L100 everycounterpositive. Runtimechecks4source symlinks absent/restoredfinally.12focusedgates and32moduleboundarytests; exactallowlist/sourcehash/nativepins actualHEAD clean calc. No full app/browser since actual readiness pending and no UI/Writer runtime changes.

## Verification

Command: node output/playwright/task130-checks/portable.mjs. Result: pass. Evidence: initial current-value profile passed15relatedtests5files6owners331S73B95F319L raw100 and wholeCalc172tests66files33owners4161S2731B821F3709L raw100. Final syntax-only enum and callback-doc refinement triggered one fresh runtime recollection, which passed with identical counts and every raw counter positive; retain both maps/logs, no counter merging or coverage relaxation. Four upstream links absent/restoredfinally. Scope: actual docmodel state/copy/transformations/theme/effect index and existing real Color/o3tl values. No Writer coverage exception needed.

Command: node output/playwright/task130-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence:12final gates and32boundarytests passed. Evidence:32boundarytests pass after actual docmodel/inc mechanism-layer registration, forward Tools/o3tl allowed and application/reverse/browser guards retained. Initial typecheck, lint and docs diagnostics retained and fixed in scope. Native duplicate LAST alias retained through existing implicit enum style with no lint-disable. Scope:18paths5existing13new,3696to3709sourceblobs,11nativeSHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Native comparison/hash state mismatch preserved CALC113; browser32 logical scalar hash binding is explicit, binary std::hash<double>/size_t parity not claimed. Actual unused vector/HSL hierarchy is avoided using exact relevant luminance arithmetic with JS Math. Same-agent evaluator not independent.

Skipped: full application and browser suites. Reason: no Writer runtime/UI changes and explicit human full-run checkpoint requires actual minimum Calc UI/document and same-model ODS readiness, still pending. Risk: full native UNO/transform application/attribute pool/document/UI/ODS not certified. Approval: human focused-test/readiness/pause instructions. No C++/memory/ABI engine or fake component provider.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T14:17:00.732Z — VERIFY — ok

By: CODER

Note: Source9dfed0c36128 exact18paths3709hashes11nativepins. Related15tests6wholeowners and Calc172tests strict raw100;12gates32boundaries; same-agent review not independent. Real shared ComplexColor values only, transform/UNO/DocPool/document/UI/ODS pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T14:16:52.949Z, excerpt_hash=sha256:98a8110127099ed3251519dbe7defbfb0787f8ddf94e25ec580c4938ce176e06

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141401-Z7JFPS/blueprint/resolved-snapshot.json
- old_digest: 4896ce43c73fdb9c12abd7d71523dc1b5b229ccafea9345fa1f7b68718947b74
- current_digest: 4896ce43c73fdb9c12abd7d71523dc1b5b229ccafea9345fa1f7b68718947b74
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141401-Z7JFPS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141401-Z7JFPS -m 🧩 Z7JFPS task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task implementation and records through a future authorized task. Never reset unrelated tasks or merge branches.

## Findings

Previous goal turn made authoritative progress: Color base and shared/Writer border consumers completed. Preflight now clean calc. Actual SvxColorItem requires an owned ComplexColor even for ordinary font colors; no fake empty peer. Native equality ignores ThemeColorUsage and final color, while getHash includes final and omits theme type, potential inconsistency to retain. Existing hash-combine numbers provide logical browser hashes, not native binary ABI; no native C++/memory probes. Original getIndex only consumes HSL luminance=(max+min)/2, implemented with native JS Math on normalized channels rather than unused vector hierarchy.

Initial typecheck required explicit bounded array index assertions for valid native vector/table domains; no runtime bounds or fallback behavior introduced. Initial10of12staticgates passed; lint required literal enum LAST11 and valid return overload signatures, docs required callback JSDoc. Native getRGB Color/void overloads now explicit and implementation uses JS undefined, no semantic fallback. Initial diagnostics retained. Related15tests5files6wholeowners pass331S73B95F319L100, everyrawcounter verification pending runner completion. All new state is ordinary JS and actual existing Color; original 31system/29transformation/14theme enum entries and5x6tables tested. No C++ compilation, no geometry/numeric library port.

New boundary assertion exposed a missing ownership-layer prefix for docmodel/inc despite allowed module edges. Register original shared-header layer so browser/package restrictions actually apply, retaining reverse/application restrictions. Existing31tests passed;32nd assertion now validates the new owner, original failure retained.

Whole Calc172tests66files33owners pass4161S2731B821F3709L100; all related6owners331S73B95F319L raw100. All4native source symlinks absent during runtime checks/restoredfinally. No Writer runtime or UI changed, no browser replay or full checkpoint yet. Original docmodel has no qa directory and targeted editeng QA search returned no direct ComplexColor test; bounded fallback found real svx/qa/unit/xoutdev.cxx FillComplexColor theme/transform state assertions. That QA also requires native UNO wrappers still pending; evidence mapping does not certify the whole drawing/UNO test.

Second lint pass exposed explicit duplicate enum literal11. Use the existing repository style of implicit sequential members with literal LAST11, retaining every native value and alias, without a lint-disable or rule relaxation. One multiline Alpha callback JSDoc was not matched by initial editing and is now added. Runtime owner syntax changed after successful tests, so recollect current runtime coverage once; retain all successful and initial diagnostic profiles.

Final runtime recollection after enum syntax/docs change passes identical15related/172Calc test counts and identical raw100 counter totals, all4reference links restored. No merged/rebased counter map or replay beyond source-change justified verification.
