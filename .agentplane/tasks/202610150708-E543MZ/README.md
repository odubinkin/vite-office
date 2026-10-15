---
id: "202610150708-E543MZ"
title: "Implement native text spacing and width attributes for EditEngine"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T07:09:45.141Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T12:15:17.175Z"
  updated_by: "CODER"
  note: "Verified309related,187Calc,39boundary tests; whole2changed shared/33Calc owners raw100,5annotation-only owners identical JS. All13gates/build/inventory pass,24paths/3929hashes/13pins/4links audited. Native metrics/narrowing retained, no BigInt facade/localization; same-agent review not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T12:15:15.765Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: native3text spacing/width attributes and original base metric defaults implemented on shared owners;5existing metric owners changed only by erased declarations."
  evaluated_sha: "4f7fea455e63e6509f07b4811ed2374dd4f41dce"
  blueprint_digest: "f17010523c48215fd476cfaf1d530af1a18cdded5f6cd0e1c7071ee53968891a"
  evidence_refs:
    - ".agentplane/tasks/202610150708-E543MZ/README.md"
    - ".agentplane/tasks/202610150708-E543MZ/quality/20261015-121515765-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150708-E543MZ/quality/20261015-121515765-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150708-E543MZ/quality/20261015-121515765-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150708-E543MZ/blueprint/resolved-snapshot.json"
    - "output/playwright/task152-checks/verification.json"
    - "output/playwright/task152-checks/native-source-audit.json"
    - "output/playwright/task152-checks/annotation-audit.json"
    - "output/playwright/task152-checks/source-gates.json"
    - "output/playwright/task152-checks/build-manifest.json"
  findings:
    - "Actual default ids/values, constructors/Clone/factories and bool/short/unsigned width transport source-audited. Kerning uses existing integral units and source short narrowing; double scale is only llround expressed with established JS Math/BigInt intrinsics, no native BigInt library port."
    - "309related,187Calc,39boundary tests pass; whole2changed shared executable owners and33Calc owners raw100. Five other owners/18override modifiers compile to identical JS. All13source gates/build/inventory pass with zero semantic violations."
    - "24intentional paths/3929source hashes/13native pins/4restored links audited. CALC129 preserves converted short overflow; initial arithmetic test literal fixed without production change. Derived localized presentation and actual EditEngine/Calc model/UI/ODS remain pending."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: actual shared text kerning/width values and native base metric defaults; existing5metric owners receive erased override declarations only, no BigInt library facade or localization."
events:
  -
    type: "status"
    at: "2026-10-15T07:09:55.731Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual shared text kerning/width values and native base metric defaults; existing5metric owners receive erased override declarations only, no BigInt library facade or localization."
  -
    type: "verify"
    at: "2026-10-15T12:15:17.175Z"
    author: "CODER"
    state: "ok"
    note: "Verified309related,187Calc,39boundary tests; whole2changed shared/33Calc owners raw100,5annotation-only owners identical JS. All13gates/build/inventory pass,24paths/3929hashes/13pins/4links audited. Native metrics/narrowing retained, no BigInt facade/localization; same-agent review not independent."
doc_version: 3
doc_updated_at: "2026-10-15T12:15:17.265Z"
doc_updated_by: "CODER"
description: "Task152 ports actual shared SvxAutoKernItem/SvxKerningItem/SvxCharScaleWidthItem on existing numeric/bool/units owners, plus original poolitem metric defaults and erased override declarations. Native JS rounding reused, no BigInt library facade or localized presentation."
sections:
  Summary: "Task152 implements original shared text spacing/width attributes and pool-item metric defaults required by the real EditEngine default package."
  Scope: "At most36intentional non-agent paths: new textitem.spacing.ts with canonical autokernitem/kernitem/charscaleitem headers, direct shared tests, original SfxPoolItem no-op ScaleMetrics/false HasMetrics,5existing derived owners with erased override annotations only, matched inventory/capability and calc-core/suspected-source docs. Original3attribute constructor/copy/factory/Clone/base value/Any behavior, native metrics/twip-mm100 conversion and JS llround-equivalent finite signed64 scaling. Existing shared bool/signed16/unsigned16/units owners reused. No native BigInt library facade, generic memory engine, localized presentation or fake pool/document."
  Plan: "Implement3native text spacing/width item values and real shared metric defaults, reuse native JS/common unit helpers, prove erased-only5owner modifiers, strict raw100 runtime owners/Calc and scoped source/build/inventory/native audits within36paths."
  Verify Steps: "Compare native3headers/textitem.cxx/eerdll/eeitem/solar and poolitem no-op/false defaults; BigInt::Scale double overload delegates only llround, existing native JS height path reused without porting BigInt class. Test all3constructor/copy/factory/Clone paths, real inherited values/equality/mutation/typed transport and distinct types/Which guards. Auto false, kerning0twips and width100 defaults use real EE identities4053/4054/4045 derived from source. Manual kerning metric scaling finite signed64 valid domain with negative/positive ties/near-half double cases and signed16 wrapping; HasMetrics true, others inherit false/no-op. Typed short Any query/put: kerning converts only twips flag using integral common helpers then signed16 narrowing, width ignores member and signed-short transports unsigned16 without percent bounds. Preserve base scalar query, invalid extraction nonmutation, ignored selectors/default member. Record surprising converted short overflow if confirmed. Whole new spacing/shared poolitem executable owners and whole Calc raw S/B/F/L100 every counter positive;5annotation-only files must compile to identical JS before/after, no executable owner coverage exemption beyond proof of unchanged emitted code. Run existing relevant metric/numeric/set/Writer tests, no Writer coverage repair. Four references absent for tests/build restored finally; all13source gates incl39boundary cases, inventory zero violations, justified451line source split, source pins/hashes/36path bound/clean calc. No native compiler/probe. Full all-app suite only on actual minimum connected UI+same-model ODS then applicable fixes/pause."
  Verification: |-
    - Command: `node output/playwright/task152-checks/portable.mjs` after correcting an arithmetic test literal; exact argv/cwd/reference absence retained in manifests. `node output/playwright/task152-checks/audit-annotations.mjs`.
      Result: pass.
      Evidence:309related tests/27files,187whole Calc tests/76files. Whole2changed executable shared owners raw S92/B50/F41/L81 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Five other source owners contain only18erased override declarations with byte-identical emitted JS; compiled output hashes retained. Existing metric/numeric/set/Writer tests run; no Writer coverage repairs or counter/threshold/source-map edits.
      Scope: actual auto/manual kerning and character-width factory/value/copy/concrete Clone/Any/default contracts, native metric flags/base no-op scaling and polymorphic dispatch, signed16 scaling tie/near-half/wrap cases using existing JS Math pattern, original integral twip/mm100 conversions/short narrowing, unsigned width with signed-short transport and no fabricated percentage bounds. Literal EditEngine defaults4053false/4054zero/4045hundred; no fake pool. Four source links absent during tests/build and restored finally.
    - Command: all13exact argv in `output/playwright/task152-checks/source-gates.json`; `node output/playwright/task152-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing boundary tests; inventory zero semantic violations, production build exit0 without reference links.
      Scope:24intentional non-agent paths within36approved bound. New canonical3header boundaries and necessary native textitem source responsibility split, original base metric defaults and erased-only declarations. No policy/cycle/graph exceptions. Original derived localized presentation remains unported; inherited base generic presentation is not claimed native derived UI parity. Full all-app suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable fixes/pause.
    - Command: `python3 output/playwright/task152-checks/audit-native.py`; `python3 output/playwright/task152-checks/audit-final.py`.
      Result: pass.
      Evidence: original3default identities/values, constructors/Clone/factories, typed short/width conversion rules, pool-item metric defaults and llround-only BigInt double overload audited; existing integral common helpers reused.13native pins at9bc445578031fecf56086729d8e4940c77e14d65,3929source hashes (3915baseline,10changed existing,14new,3905unchanged),24intentional paths/4restored links audited. CALC129 preserves converted signed16 overflow (32767twips queries-7739mm100) without saturation/widening. Initial test arithmetic literal corrected from-18578to-18577 using exact quotient2359296=18577*127+17; production helper unchanged and failed evidence retained.
      Scope: native defined finite signed64 floating scaling domain only, not invalid/overflow llround cases; JS Math/BigInt intrinsics replace the single double-scale expression without porting an arbitrary-precision object/library. Native CharacterProperties generic QA is broader unported source context only, no native compilation/probe/execution. Same-agent review is not independent. Actual EditEngine/EditTextObject/ScPageHFItem/full Calc pool/model/connected UI/same-model ODS and UI localization remain pending. Final clean calc/hash proof required at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T12:15:17.175Z — VERIFY — ok

    By: CODER

    Note: Verified309related,187Calc,39boundary tests; whole2changed shared/33Calc owners raw100,5annotation-only owners identical JS. All13gates/build/inventory pass,24paths/3929hashes/13pins/4links audited. Native metrics/narrowing retained, no BigInt facade/localization; same-agent review not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T12:14:41.927Z, excerpt_hash=sha256:8435adf7aa31749aeed97bb6491b61330ca80b3bbd32f972f34cf2dce493bd63

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150708-E543MZ/blueprint/resolved-snapshot.json
    - old_digest: f17010523c48215fd476cfaf1d530af1a18cdded5f6cd0e1c7071ee53968891a
    - current_digest: f17010523c48215fd476cfaf1d530af1a18cdded5f6cd0e1c7071ee53968891a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150708-E543MZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150708-E543MZ -m 🧩 E543MZ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional paths in a later authorized task; no reset/merge/publication."
  Findings: |-
    Native BigInt::Scale(double) is only std::llround and can use the same JS Math.round sign correction already present for font height. Floating invalid/out-of-signed64 cases remain outside original defined producer domain. Do not implement arbitrary-precision object/lifetime library. Original width transports signed16 over unsigned16 storage and kerning conversion narrows signed16; preserve source behavior. Localized presentation and actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.

    - Observation: Initial new manual-spacing test used an arithmetically incorrect literal -18578 for -32768mm100 to twips;308other related tests passed.
      Impact: Production uses the existing canonical integral conversion helper and returned source-correct -18577; Calc was not started after the first-case failure.
      Resolution: Checked exact integer quotient32768*72=2359296=18577*127+17, corrected only the expected literal and retained failed log; reran portable related/Calc suites without changing the common unit helper.
id_source: "generated"
---
## Summary

Task152 implements original shared text spacing/width attributes and pool-item metric defaults required by the real EditEngine default package.

## Scope

At most36intentional non-agent paths: new textitem.spacing.ts with canonical autokernitem/kernitem/charscaleitem headers, direct shared tests, original SfxPoolItem no-op ScaleMetrics/false HasMetrics,5existing derived owners with erased override annotations only, matched inventory/capability and calc-core/suspected-source docs. Original3attribute constructor/copy/factory/Clone/base value/Any behavior, native metrics/twip-mm100 conversion and JS llround-equivalent finite signed64 scaling. Existing shared bool/signed16/unsigned16/units owners reused. No native BigInt library facade, generic memory engine, localized presentation or fake pool/document.

## Plan

Implement3native text spacing/width item values and real shared metric defaults, reuse native JS/common unit helpers, prove erased-only5owner modifiers, strict raw100 runtime owners/Calc and scoped source/build/inventory/native audits within36paths.

## Verify Steps

Compare native3headers/textitem.cxx/eerdll/eeitem/solar and poolitem no-op/false defaults; BigInt::Scale double overload delegates only llround, existing native JS height path reused without porting BigInt class. Test all3constructor/copy/factory/Clone paths, real inherited values/equality/mutation/typed transport and distinct types/Which guards. Auto false, kerning0twips and width100 defaults use real EE identities4053/4054/4045 derived from source. Manual kerning metric scaling finite signed64 valid domain with negative/positive ties/near-half double cases and signed16 wrapping; HasMetrics true, others inherit false/no-op. Typed short Any query/put: kerning converts only twips flag using integral common helpers then signed16 narrowing, width ignores member and signed-short transports unsigned16 without percent bounds. Preserve base scalar query, invalid extraction nonmutation, ignored selectors/default member. Record surprising converted short overflow if confirmed. Whole new spacing/shared poolitem executable owners and whole Calc raw S/B/F/L100 every counter positive;5annotation-only files must compile to identical JS before/after, no executable owner coverage exemption beyond proof of unchanged emitted code. Run existing relevant metric/numeric/set/Writer tests, no Writer coverage repair. Four references absent for tests/build restored finally; all13source gates incl39boundary cases, inventory zero violations, justified451line source split, source pins/hashes/36path bound/clean calc. No native compiler/probe. Full all-app suite only on actual minimum connected UI+same-model ODS then applicable fixes/pause.

## Verification

- Command: `node output/playwright/task152-checks/portable.mjs` after correcting an arithmetic test literal; exact argv/cwd/reference absence retained in manifests. `node output/playwright/task152-checks/audit-annotations.mjs`.
  Result: pass.
  Evidence:309related tests/27files,187whole Calc tests/76files. Whole2changed executable shared owners raw S92/B50/F41/L81 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Five other source owners contain only18erased override declarations with byte-identical emitted JS; compiled output hashes retained. Existing metric/numeric/set/Writer tests run; no Writer coverage repairs or counter/threshold/source-map edits.
  Scope: actual auto/manual kerning and character-width factory/value/copy/concrete Clone/Any/default contracts, native metric flags/base no-op scaling and polymorphic dispatch, signed16 scaling tie/near-half/wrap cases using existing JS Math pattern, original integral twip/mm100 conversions/short narrowing, unsigned width with signed-short transport and no fabricated percentage bounds. Literal EditEngine defaults4053false/4054zero/4045hundred; no fake pool. Four source links absent during tests/build and restored finally.
- Command: all13exact argv in `output/playwright/task152-checks/source-gates.json`; `node output/playwright/task152-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing boundary tests; inventory zero semantic violations, production build exit0 without reference links.
  Scope:24intentional non-agent paths within36approved bound. New canonical3header boundaries and necessary native textitem source responsibility split, original base metric defaults and erased-only declarations. No policy/cycle/graph exceptions. Original derived localized presentation remains unported; inherited base generic presentation is not claimed native derived UI parity. Full all-app suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable fixes/pause.
- Command: `python3 output/playwright/task152-checks/audit-native.py`; `python3 output/playwright/task152-checks/audit-final.py`.
  Result: pass.
  Evidence: original3default identities/values, constructors/Clone/factories, typed short/width conversion rules, pool-item metric defaults and llround-only BigInt double overload audited; existing integral common helpers reused.13native pins at9bc445578031fecf56086729d8e4940c77e14d65,3929source hashes (3915baseline,10changed existing,14new,3905unchanged),24intentional paths/4restored links audited. CALC129 preserves converted signed16 overflow (32767twips queries-7739mm100) without saturation/widening. Initial test arithmetic literal corrected from-18578to-18577 using exact quotient2359296=18577*127+17; production helper unchanged and failed evidence retained.
  Scope: native defined finite signed64 floating scaling domain only, not invalid/overflow llround cases; JS Math/BigInt intrinsics replace the single double-scale expression without porting an arbitrary-precision object/library. Native CharacterProperties generic QA is broader unported source context only, no native compilation/probe/execution. Same-agent review is not independent. Actual EditEngine/EditTextObject/ScPageHFItem/full Calc pool/model/connected UI/same-model ODS and UI localization remain pending. Final clean calc/hash proof required at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T12:15:17.175Z — VERIFY — ok

By: CODER

Note: Verified309related,187Calc,39boundary tests; whole2changed shared/33Calc owners raw100,5annotation-only owners identical JS. All13gates/build/inventory pass,24paths/3929hashes/13pins/4links audited. Native metrics/narrowing retained, no BigInt facade/localization; same-agent review not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T12:14:41.927Z, excerpt_hash=sha256:8435adf7aa31749aeed97bb6491b61330ca80b3bbd32f972f34cf2dce493bd63

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150708-E543MZ/blueprint/resolved-snapshot.json
- old_digest: f17010523c48215fd476cfaf1d530af1a18cdded5f6cd0e1c7071ee53968891a
- current_digest: f17010523c48215fd476cfaf1d530af1a18cdded5f6cd0e1c7071ee53968891a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150708-E543MZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150708-E543MZ -m 🧩 E543MZ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional paths in a later authorized task; no reset/merge/publication.

## Findings

Native BigInt::Scale(double) is only std::llround and can use the same JS Math.round sign correction already present for font height. Floating invalid/out-of-signed64 cases remain outside original defined producer domain. Do not implement arbitrary-precision object/lifetime library. Original width transports signed16 over unsigned16 storage and kerning conversion narrows signed16; preserve source behavior. Localized presentation and actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.

- Observation: Initial new manual-spacing test used an arithmetically incorrect literal -18578 for -32768mm100 to twips;308other related tests passed.
  Impact: Production uses the existing canonical integral conversion helper and returned source-correct -18577; Calc was not started after the first-case failure.
  Resolution: Checked exact integer quotient32768*72=2359296=18577*127+17, corrected only the expected literal and retained failed log; reran portable related/Calc suites without changing the common unit helper.
