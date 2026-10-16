---
id: "202610160107-KCX5A4"
title: "Implement shared RTL decimal parsing and SAX ODS scalar reader"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T01:07:31.493Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T01:15:39.496Z"
  updated_by: "CODER"
  note: "23related/187Calc pass;exact3shared/33Calc raw S/B/F/L100 and every counter positive.13gates,5native pins/38QA inputs,unchanged existing measure/SAL/Writer/guard,production build and actual Chromium/DOM-free Worker/Writer pass;4refs restored. CALC170 retained;full UI/ODS pending,no all-app run."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T01:15:54.065Z"
  updated_by: "EVALUATOR"
  note: "Same-agent source/evidence audit passes shared RTL/SAX numeric reader;not an independent review."
  evaluated_sha: "b39eb3a3779c42f6ce0143f5cdc1156e49624125"
  blueprint_digest: "d3ffc738cf38f906aa5628a40c005651173a94aa048704334f9f5758fd8767ef"
  evidence_refs:
    - ".agentplane/tasks/202610160107-KCX5A4/README.md"
    - ".agentplane/tasks/202610160107-KCX5A4/quality/20261016-011554065-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160107-KCX5A4/quality/20261016-011554065-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160107-KCX5A4/quality/20261016-011554065-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160107-KCX5A4/blueprint/resolved-snapshot.json"
    - "output/playwright/task184-checks/final-verification.json"
  findings:
    - "Exact shared/Calc raw100,23related/187Calc,13gates,5native pins/38QA inputs,unchanged measure and Writer owners,build and real Chromium/DOM-free Worker/Writer pass. Native decimal rounding reused;no compiler,memory engine or all-app run. Complete Calc document/UI/ODS remains unimplemented."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement pinned shared RTL decimal reader and SAX ODS scalar contract with native JS rounding, exact statuses and consumed positions; verify related shared and Calc raw100."
events:
  -
    type: "status"
    at: "2026-10-16T01:07:31.900Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement pinned shared RTL decimal reader and SAX ODS scalar contract with native JS rounding, exact statuses and consumed positions; verify related shared and Calc raw100."
  -
    type: "verify"
    at: "2026-10-16T01:15:39.496Z"
    author: "CODER"
    state: "ok"
    note: "23related/187Calc pass;exact3shared/33Calc raw S/B/F/L100 and every counter positive.13gates,5native pins/38QA inputs,unchanged existing measure/SAL/Writer/guard,production build and actual Chromium/DOM-free Worker/Writer pass;4refs restored. CALC170 retained;full UI/ODS pending,no all-app run."
doc_version: 3
doc_updated_at: "2026-10-16T01:15:39.551Z"
doc_updated_by: "CODER"
description: "Task184: port pinned RTL stringToDouble lexical/range contract using native JS decimal rounding and expose actual SAX convertDouble reader for ODS values; preserve source statuses and end positions."
sections:
  Summary: "Implement actual shared RTL decimal parsing and SAX convertDouble reader needed for ODS cell scalar values."
  Scope: "sal/rtl numeric parser, canonical RTL header/status declarations, SAX convertDouble read overloads and tests; inventory/provenance/readiness and Calc upstream suspicion journal. At most35 non-task paths. No formatting writer overload, unit overload, native compiler/probe, external dependency, memory engine or full all-app run. Existing measure algorithms unchanged. Work only calc branch."
  Plan: "Implement the documented Task184 RTL/SAX scalar reader scope and verification contract under standing user authorization."
  Verify Steps: "Pin sal/rtl/math.cxx, include/rtl/math.h, sal/qa/rtl/math/test-rtl-math.cxx and SAX source/header. Replay upstream numeric QA for both bytes and UTF16 with exact value/status/end. Check binary64 ties-to-even, min subnormal, underflow/overflow, rounded legacy DBL_MAX, signed zero and NaN, grouping, whitespace, custom separators, no conversion and optional output pointers. SAX tests assert output writes and suffix including invalid strings. Related shared tests and whole Calc with exact executable owner sets and every raw S/B/F/L counter positive100; Writer-only gaps exempt. Run13source gates,production build and actual Chromium/DOM-free Worker shared check with4reference links absent/restored. No native compiler and no full all-app run until minimum real UI+ODS readiness."
  Verification: |-
    Command: node output/playwright/task184-checks/portable.mjs. Result:pass. Evidence:23related tests/8files and187Calc/76files;exact3shared owners raw S154/B161/F9/L137100 and33Calc S4179/B2731/F821/L3727100,every raw counter positive,no coverage filtering or Writer-only repairs. Scope:actual shared RTL/SAX reader,related Writer and Calc regression. Command: node output/playwright/task184-checks/native-audit.mjs. Result:pass. Evidence:5pinned native blobs,38native QA input literals present;existing SAX measure methods and SAL string/Writer ODF/guard owners unchanged. Independent binary64 bit-pattern boundaries cover ties,subnormal and overflow rounding;no native probe or exhaustive decimal differential claim. Command: node output/playwright/task184-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and dedicated DOM-free Worker byte/UTF16 scalar reads,Writer startup/load/edit;4refs absent/restored.13source gates pass,exact owner and path audit passes17non-task paths within35. CALC170 documents source-tested no-consumption success. Numeric formatting/unit overloads,actual Calc document/sheet/column/UI/same-model ODS remain pending;no full all-app run or milestone/pause claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T01:15:39.496Z — VERIFY — ok

    By: CODER

    Note: 23related/187Calc pass;exact3shared/33Calc raw S/B/F/L100 and every counter positive.13gates,5native pins/38QA inputs,unchanged existing measure/SAL/Writer/guard,production build and actual Chromium/DOM-free Worker/Writer pass;4refs restored. CALC170 retained;full UI/ODS pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T01:15:33.848Z, excerpt_hash=sha256:f2d903a73c2873473cb6c64da0e98ab377f16d06674e1b5e35b94ee546c647dd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160107-KCX5A4/blueprint/resolved-snapshot.json
    - old_digest: d3ffc738cf38f906aa5628a40c005651173a94aa048704334f9f5758fd8767ef
    - current_digest: d3ffc738cf38f906aa5628a40c005651173a94aa048704334f9f5758fd8767ef
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160107-KCX5A4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160107-KCX5A4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task184 source and task commits; preserve calc branch and all reference links. No merge/history rewrite, guard weakening or unrelated Writer-only coverage repair."
  Findings: |-
    Native QA explicitly expects status Ok and end0 for malformed inputs; SAX returns status only and therefore can succeed without consuming input. Preserve and document this boundary. No numeric format writer or full ODS acceptance claim.

    - Observation: A read-only discovery glob apps/office/scripts/* had no match; source inspection itself succeeded.
      Impact: No source or verification was changed.
      Resolution: Use rg file discovery and continue within approved scope.

    - Observation: First related run: one expected original offset for 000,000,123.004,5 was handwritten as14 instead of15.
      Impact: QA golden offset incorrect; scalar result and upstream QA replay passed.
      Resolution: Count original units explicitly and correct expected15; retain initial log and rerun related profile.

    - Observation: Second related run passed preceding rows and found a second handwritten end offset20 instead of21 for the leading-zero overflow token.
      Impact: No parser mismatch; original text length must include the extra leading zero.
      Resolution: Correct the golden end offset21 before final complete profile.

    - Observation: Typecheck caught unchecked indexed-access types in the new bounded parser.
      Impact: Runtime tests passed; TypeScript requires proof for array accesses guaranteed by native pointer-range preconditions and normalization map construction.
      Resolution: Annotate those bounded indexed reads without adding runtime fallback grammar or changing source branches.

    - Observation: Lint forbids non-null assertion syntax used to encode bounded parser indexing.
      Impact: The bounds proof remains valid but annotation syntax violates repository style.
      Resolution: Use explicit native-domain type assertions already used by SAL owners; do not suppress lint or add fallback values.

    - Observation: JSDoc gate requires comments attached directly to newly added test callbacks and the parser insertion arrow.
      Impact: Documentation-only gate failure; numeric and type contracts unchanged.
      Resolution: Document actual callback purposes and rerun docs gate; no validation suppression.

    - Observation: Provenance rejected empty localSymbols on the new pure header facade.
      Impact: Runtime semantic declaration list is correctly empty,but provenance requires named exported contracts.
      Resolution: Record reexported C functions/status as facade provenance symbols; preserve empty runtime declared-symbol set.
id_source: "generated"
---
## Summary

Implement actual shared RTL decimal parsing and SAX convertDouble reader needed for ODS cell scalar values.

## Scope

sal/rtl numeric parser, canonical RTL header/status declarations, SAX convertDouble read overloads and tests; inventory/provenance/readiness and Calc upstream suspicion journal. At most35 non-task paths. No formatting writer overload, unit overload, native compiler/probe, external dependency, memory engine or full all-app run. Existing measure algorithms unchanged. Work only calc branch.

## Plan

Implement the documented Task184 RTL/SAX scalar reader scope and verification contract under standing user authorization.

## Verify Steps

Pin sal/rtl/math.cxx, include/rtl/math.h, sal/qa/rtl/math/test-rtl-math.cxx and SAX source/header. Replay upstream numeric QA for both bytes and UTF16 with exact value/status/end. Check binary64 ties-to-even, min subnormal, underflow/overflow, rounded legacy DBL_MAX, signed zero and NaN, grouping, whitespace, custom separators, no conversion and optional output pointers. SAX tests assert output writes and suffix including invalid strings. Related shared tests and whole Calc with exact executable owner sets and every raw S/B/F/L counter positive100; Writer-only gaps exempt. Run13source gates,production build and actual Chromium/DOM-free Worker shared check with4reference links absent/restored. No native compiler and no full all-app run until minimum real UI+ODS readiness.

## Verification

Command: node output/playwright/task184-checks/portable.mjs. Result:pass. Evidence:23related tests/8files and187Calc/76files;exact3shared owners raw S154/B161/F9/L137100 and33Calc S4179/B2731/F821/L3727100,every raw counter positive,no coverage filtering or Writer-only repairs. Scope:actual shared RTL/SAX reader,related Writer and Calc regression. Command: node output/playwright/task184-checks/native-audit.mjs. Result:pass. Evidence:5pinned native blobs,38native QA input literals present;existing SAX measure methods and SAL string/Writer ODF/guard owners unchanged. Independent binary64 bit-pattern boundaries cover ties,subnormal and overflow rounding;no native probe or exhaustive decimal differential claim. Command: node output/playwright/task184-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and dedicated DOM-free Worker byte/UTF16 scalar reads,Writer startup/load/edit;4refs absent/restored.13source gates pass,exact owner and path audit passes17non-task paths within35. CALC170 documents source-tested no-consumption success. Numeric formatting/unit overloads,actual Calc document/sheet/column/UI/same-model ODS remain pending;no full all-app run or milestone/pause claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T01:15:39.496Z — VERIFY — ok

By: CODER

Note: 23related/187Calc pass;exact3shared/33Calc raw S/B/F/L100 and every counter positive.13gates,5native pins/38QA inputs,unchanged existing measure/SAL/Writer/guard,production build and actual Chromium/DOM-free Worker/Writer pass;4refs restored. CALC170 retained;full UI/ODS pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T01:15:33.848Z, excerpt_hash=sha256:f2d903a73c2873473cb6c64da0e98ab377f16d06674e1b5e35b94ee546c647dd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160107-KCX5A4/blueprint/resolved-snapshot.json
- old_digest: d3ffc738cf38f906aa5628a40c005651173a94aa048704334f9f5758fd8767ef
- current_digest: d3ffc738cf38f906aa5628a40c005651173a94aa048704334f9f5758fd8767ef
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160107-KCX5A4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160107-KCX5A4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task184 source and task commits; preserve calc branch and all reference links. No merge/history rewrite, guard weakening or unrelated Writer-only coverage repair.

## Findings

Native QA explicitly expects status Ok and end0 for malformed inputs; SAX returns status only and therefore can succeed without consuming input. Preserve and document this boundary. No numeric format writer or full ODS acceptance claim.

- Observation: A read-only discovery glob apps/office/scripts/* had no match; source inspection itself succeeded.
  Impact: No source or verification was changed.
  Resolution: Use rg file discovery and continue within approved scope.

- Observation: First related run: one expected original offset for 000,000,123.004,5 was handwritten as14 instead of15.
  Impact: QA golden offset incorrect; scalar result and upstream QA replay passed.
  Resolution: Count original units explicitly and correct expected15; retain initial log and rerun related profile.

- Observation: Second related run passed preceding rows and found a second handwritten end offset20 instead of21 for the leading-zero overflow token.
  Impact: No parser mismatch; original text length must include the extra leading zero.
  Resolution: Correct the golden end offset21 before final complete profile.

- Observation: Typecheck caught unchecked indexed-access types in the new bounded parser.
  Impact: Runtime tests passed; TypeScript requires proof for array accesses guaranteed by native pointer-range preconditions and normalization map construction.
  Resolution: Annotate those bounded indexed reads without adding runtime fallback grammar or changing source branches.

- Observation: Lint forbids non-null assertion syntax used to encode bounded parser indexing.
  Impact: The bounds proof remains valid but annotation syntax violates repository style.
  Resolution: Use explicit native-domain type assertions already used by SAL owners; do not suppress lint or add fallback values.

- Observation: JSDoc gate requires comments attached directly to newly added test callbacks and the parser insertion arrow.
  Impact: Documentation-only gate failure; numeric and type contracts unchanged.
  Resolution: Document actual callback purposes and rerun docs gate; no validation suppression.

- Observation: Provenance rejected empty localSymbols on the new pure header facade.
  Impact: Runtime semantic declaration list is correctly empty,but provenance requires named exported contracts.
  Resolution: Record reexported C functions/status as facade provenance symbols; preserve empty runtime declared-symbol set.
