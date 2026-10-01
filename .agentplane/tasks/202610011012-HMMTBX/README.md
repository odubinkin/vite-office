---
id: "202610011012-HMMTBX"
title: "Separate Writer list restart flag and value setters"
result_summary: "Restored independent native Writer list restart flag/value contracts; parent remains open for the measured getter diagnostic mismatch and other unverified obligations."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on:
  - "202610010940-WW4SFA"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T10:12:48.014Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T10:30:11.576Z"
  updated_by: "CODER"
  note: "Verified: separate native flag/value setters match84 real states and42 unchanged native states under ASan/UBSan; full verify701 app109 inventory19 browser, both100% all metrics; registered IO deviations preserved, getter diagnostic contract remains next iteration."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T10:30:47.353Z"
  updated_by: "EVALUATOR"
  note: "Approved restart setter correction satisfies pinned native contracts and unchanged full gates at 74b853c6382467fe3dd2307d1bbe43357113fc4a; recommend finishing this child only."
  evaluated_sha: "74b853c6382467fe3dd2307d1bbe43357113fc4a"
  blueprint_digest: "c3a8d0257c75b04f43dcadbe466203fe5786be86be0ce85be8b20acf09c36fb0"
  evidence_refs:
    - ".agentplane/tasks/202610011012-HMMTBX/README.md"
    - ".agentplane/tasks/202610011012-HMMTBX/quality/20261001-103047353-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610011012-HMMTBX/quality/20261001-103047353-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610011012-HMMTBX/quality/20261001-103047353-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610011012-HMMTBX/blueprint/resolved-snapshot.json"
    - "74b853c6382467fe3dd2307d1bbe43357113fc4a"
    - ".agentplane/tasks/202610011012-HMMTBX/verify-final.log"
    - ".agentplane/tasks/202610011012-HMMTBX/native-source-identity.json"
    - ".agentplane/tasks/202610011012-HMMTBX/native-sanitized-final.log"
    - "apps/office/src/sw/source/core/txtnode/list-restart-contract.test.ts"
    - ".agentplane/tasks/202610011012-HMMTBX/followup-getter-baseline.json"
  findings:
    - "Actual two production methods now separate Which85 flag and Which86 value ownership, preserve direct state on flag transitions, compare unconverted native integer before signed16 narrowing, and reset only65535. Existing production XML caller explicitly invokes both setters; no combined convenience wrapper remains."
    - "Six unchanged native bodies and hashed supporting type evidence, explicit pool/item/format/diagnostic adapters,42 literal states and84 real states with mutation attempts substantiate supported exact-integer contracts. ASan/UBSan trace parity passed; unsupported style-parent profile was rejected against actual native/local ranges and its failures retained."
    - "701 app tests/158 files,109 inventory/36,19 browser and both100% all metrics pass original verify gates. Undo/Worker16 retains inactive zero/seven; existing genuine ODT/browser assertions pass. Review found no blanket semantic-status promotion, configuration or IO/recovery exception change. Doc/type/lint/static/source/doctor/routing/diff evidence ties to the reviewed implementation."
commit:
  hash: "74b853c6382467fe3dd2307d1bbe43357113fc4a"
  message: "🔧 HMMTBX code: separate Writer restart flag and value setters"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: source-shaped flag-only and separate value restart setters;42 unchanged native states match84 real states under ASan/UBSan, Undo/Worker16 and original ODT/browser assertions pass; full verify701 app109 inventory19 browser with both100% coverage, EVALUATOR pass, registered IO deviations preserved."
events:
  -
    type: "status"
    at: "2026-10-01T10:13:02.808Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-01T10:30:11.576Z"
    author: "CODER"
    state: "ok"
    note: "Verified: separate native flag/value setters match84 real states and42 unchanged native states under ASan/UBSan; full verify701 app109 inventory19 browser, both100% all metrics; registered IO deviations preserved, getter diagnostic contract remains next iteration."
  -
    type: "status"
    at: "2026-10-01T10:31:18.728Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: source-shaped flag-only and separate value restart setters;42 unchanged native states match84 real states under ASan/UBSan, Undo/Worker16 and original ODT/browser assertions pass; full verify701 app109 inventory19 browser with both100% coverage, EVALUATOR pass, registered IO deviations preserved."
doc_version: 3
doc_updated_at: "2026-10-01T10:31:18.730Z"
doc_updated_by: "CODER"
description: "Iteration 41: restore pinned SwTextNode SetListRestart(bool) and SetAttrListRestartValue(number) contracts, retain direct values across flag transitions, reproduce signed Int16 casting and USHRT_MAX reset, and migrate existing ODT/test callers without altering registered save/open/recovery deviations."
sections:
  Summary: "Iteration 41 restores the separate native Writer list restart flag/value setters for existing functionality. The continuing user goal authorizes safe local implementation, lifecycle records, validation, and commits. No network or outside-repository access."
  Scope: "SwTextNode ndtxt.ts restart setters; xmlimp.ts existing caller; existing combined-call tests in core/attr, core/txtnode, core/doc, core/SwNumberTree and filter/xml; one source-backed restart contract test and literal native fixture. Optional source-owner helper if required by the 1000-line module gate, with explicit provenance/inventory mapping. Bounded provenance/inventory evidence only; task-local native oracle, baseline and verification artifacts; parent progress. Preserve registered IO/recovery deviations and all unrelated assertions. No full list/default-registry/client/style lifecycle closure."
  Plan: "1. Inventory real callers and record the pre-edit application flag-loss baseline. Extract and compile complete unchanged pinned flag/value/Has/Get/Is definitions with explicit scalar/base/direct-item adapters, hashes and literal supported traces. 2. Make SetListRestart flag-only; add SetAttrListRestartValue with native equality, USHRT_MAX reset and signed Int16 conversion. Migrate the actual ODT caller and existing fixtures to separate setters. Keep getter preconditions and unrelated browser input normalization out of this correction. 3. Verify source-supported value retention, sentinel, equality/no-op, conversion, parent/default, list counters, undo, Worker16 and existing ODT/browser tests; preserve evidence scope. 4. Run full unchanged verify/doctor/routing/diff gates, record actual code SHA and evaluator opinion, finish only this child, and append next measured obligation to the still-open parent."
  Verify Steps: "1. Record actual pre-edit SwDoc/SwTextNode loss of direct value when changing only the flag. Compile complete unchanged pinned native setter/accessor bodies and record source identities, named adapter scope and native trace literals. 2. Application tests must agree with native supported traces for flag-only changes retaining direct values, missing/equal values, explicit zero, USHRT_MAX clearing and signed Int16 narrowing (including negative and wrapped numbers). Verify real list counters and existing Undo/Worker16/ODT behavior with original assertions retained except source-disproved combined-setter assertions. 3. npm run verify passes every unchanged gate, including 100% statements/branches/functions/lines for app and inventory; no coverage exclusions, reduced criteria, broad module-status promotion or IO exceptions added. 4. ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass; record intentional paths, actual implementation commit, evaluator result, verification and clean final tracked/untracked state."
  Verification: |-
    PASS: npm run verify actual exit0 on final implementation;701 app/158 files,109 inventory/36 files,19 browser; both coverage suites100% statements/branches/functions/lines. All unchanged static/build/resources/type/lint/format/source/provenance/invariant/parity gates passed. Six complete unchanged pinned native restart definitions compile and execute under ASan/UBSan;42 native states match84 real normal/reading states and call attempts. Actual Undo/Worker16 and genuine existing ODT assertions retained and passed. Doctor0 errors/two known historical warnings; routing and git diff --check pass. No skip or scope/criteria drift. Getter diagnostic contract and full native lifecycle/registry remain explicit follow-ups.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T10:30:11.576Z — VERIFY — ok

    By: CODER

    Note: Verified: separate native flag/value setters match84 real states and42 unchanged native states under ASan/UBSan; full verify701 app109 inventory19 browser, both100% all metrics; registered IO deviations preserved, getter diagnostic contract remains next iteration.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T10:29:37.256Z, excerpt_hash=sha256:e738b2822050d89d0614e69ec5311cbab750b58fdcd56e36be1a83ad9a04745b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610011012-HMMTBX/blueprint/resolved-snapshot.json
    - old_digest: c3a8d0257c75b04f43dcadbe466203fe5786be86be0ce85be8b20acf09c36fb0
    - current_digest: c3a8d0257c75b04f43dcadbe466203fe5786be86be0ce85be8b20acf09c36fb0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610011012-HMMTBX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610011012-HMMTBX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this child implementation commit and its intentional source/test/provenance edits; preserve immutable completed task evidence and registered deviations."
  Findings: "Confirmed native ndtxt.cxx SetListRestart changes only Which85, while the existing combined setter clears Which86 on false and true-without-value. Native SetAttrListRestartValue separately compares the original signed tSwNumTreeNumber input, resets at USHRT_MAX and casts non-sentinel inputs to sal_Int16. The sole production combined call is XML import; other combined calls are tests. Existing browser list item-set composition already owns explicit combined state. Getter absent-value diagnostics, JS-number domain beyond exact integers, full client/attribute/style lifetime and ODT inactive-value persistence are not implicitly certified by this task. Harness-only failures: native compilation/execution succeeded initially, but fixture copy used a nonexistent src/test/fixtures directory; rg located actual src/test and final copy was repaired. The first focused run passed40 existing/new tests but the native mutation-attempt serializer emitted integer1 for SfxBoolItem true. Correct the named typed JSON serializer, preserve unchanged source bodies; no assertion or production behavior change. Initial logs are retained. Typecheck and lint passed. Second focused mismatch was an invalid harness parent profile: SwTextFormatColl ranges exclude Which86 in pinned init.cxx aTextFormatCollSetRange and local hintids.ts, so SetFormatAttr(86,9) does not store9. Preserve this failure log; replace the unsupported style-parent assumption with a real source-supported rule-format9/pool-default1 separation profile. Unchanged native setters and all original application assertions remain intact; no parent86 style certification. Final source-backed outcome: SetListRestart(bool) touches only Which85 and retains direct Which86 across both flag states; SetAttrListRestartValue compares original signed input, returns on equal direct value, resets65535 and narrows all other exact integer inputs to signed16. XML import now calls these two APIs explicitly. ndtxt.ts997 lines; no new runtime helper or architecture wrapper. Native GetAttr adapter now retains typed references in owned map storage rather than returning references through temporary conversion; ASan/UBSan passed the same42 states and fixture semantic equality was checked before writing, so runtime fixture assertions were unchanged. Four supported rule/default/value profiles compare84 normal/reading application states; original699 tests plus2 new pass. No whole-module status promotion. Command: npm run verify. Result: pass, actual exit0. Evidence:701 app tests/158 files;109 inventory tests/36 files;19 browser tests; app100%10628 statements/8024 branches/2877 functions/9753 lines and inventory100%1523/1080/384/1464; all format/lint/type/module/resources/static/JSDoc/file-size/source-tree/provenance/invariant/parity gates passed. Scope: final code and original full gate criteria. Command: python3 .agentplane/tasks/202610011012-HMMTBX/native-restart.py. Result: pass, six complete unchanged source bodies/four profiles/42 literal states under AddressSanitizer+UBSan. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; doctor0 errors and two pre-existing warnings only (managed hook readiness and immutable F1JT8K historical implementation SHA). Completed full log terminal padding was normalized only after actual exit0, preserving all checks/assertions/warnings. Next measured obligation: actual fresh SwDoc nodes in normal/reading mode have no direct86 and effective1, but GetAttrListRestartValue throws; native GetAttrListRestartValue performs OSL_ENSURE then effective GetAttr. Pinned include/osl/diagnose.h defines OSL_ENSURE as diagnostic SAL_DETAIL_WARN_IF_FORMAT, not C assert. See followup-getter-baseline.json and native-supporting-types-and-diagnostic.json. Native absent-getter diagnostic execution remains to prove in the next separate task. Full registry/defaults/client/style lifetime, prior UI transient root causes and ODT inactive-value persistence remain unresolved/unverified; preserve all registered document IO deviations. Parent and goal stay open."
extensions:
  implementation_commit:
    hash: "74b853c6382467fe3dd2307d1bbe43357113fc4a"
    message: "🔧 HMMTBX code: separate Writer restart flag and value setters"
id_source: "generated"
---
## Summary

Iteration 41 restores the separate native Writer list restart flag/value setters for existing functionality. The continuing user goal authorizes safe local implementation, lifecycle records, validation, and commits. No network or outside-repository access.

## Scope

SwTextNode ndtxt.ts restart setters; xmlimp.ts existing caller; existing combined-call tests in core/attr, core/txtnode, core/doc, core/SwNumberTree and filter/xml; one source-backed restart contract test and literal native fixture. Optional source-owner helper if required by the 1000-line module gate, with explicit provenance/inventory mapping. Bounded provenance/inventory evidence only; task-local native oracle, baseline and verification artifacts; parent progress. Preserve registered IO/recovery deviations and all unrelated assertions. No full list/default-registry/client/style lifecycle closure.

## Plan

1. Inventory real callers and record the pre-edit application flag-loss baseline. Extract and compile complete unchanged pinned flag/value/Has/Get/Is definitions with explicit scalar/base/direct-item adapters, hashes and literal supported traces. 2. Make SetListRestart flag-only; add SetAttrListRestartValue with native equality, USHRT_MAX reset and signed Int16 conversion. Migrate the actual ODT caller and existing fixtures to separate setters. Keep getter preconditions and unrelated browser input normalization out of this correction. 3. Verify source-supported value retention, sentinel, equality/no-op, conversion, parent/default, list counters, undo, Worker16 and existing ODT/browser tests; preserve evidence scope. 4. Run full unchanged verify/doctor/routing/diff gates, record actual code SHA and evaluator opinion, finish only this child, and append next measured obligation to the still-open parent.

## Verify Steps

1. Record actual pre-edit SwDoc/SwTextNode loss of direct value when changing only the flag. Compile complete unchanged pinned native setter/accessor bodies and record source identities, named adapter scope and native trace literals. 2. Application tests must agree with native supported traces for flag-only changes retaining direct values, missing/equal values, explicit zero, USHRT_MAX clearing and signed Int16 narrowing (including negative and wrapped numbers). Verify real list counters and existing Undo/Worker16/ODT behavior with original assertions retained except source-disproved combined-setter assertions. 3. npm run verify passes every unchanged gate, including 100% statements/branches/functions/lines for app and inventory; no coverage exclusions, reduced criteria, broad module-status promotion or IO exceptions added. 4. ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass; record intentional paths, actual implementation commit, evaluator result, verification and clean final tracked/untracked state.

## Verification

PASS: npm run verify actual exit0 on final implementation;701 app/158 files,109 inventory/36 files,19 browser; both coverage suites100% statements/branches/functions/lines. All unchanged static/build/resources/type/lint/format/source/provenance/invariant/parity gates passed. Six complete unchanged pinned native restart definitions compile and execute under ASan/UBSan;42 native states match84 real normal/reading states and call attempts. Actual Undo/Worker16 and genuine existing ODT assertions retained and passed. Doctor0 errors/two known historical warnings; routing and git diff --check pass. No skip or scope/criteria drift. Getter diagnostic contract and full native lifecycle/registry remain explicit follow-ups.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T10:30:11.576Z — VERIFY — ok

By: CODER

Note: Verified: separate native flag/value setters match84 real states and42 unchanged native states under ASan/UBSan; full verify701 app109 inventory19 browser, both100% all metrics; registered IO deviations preserved, getter diagnostic contract remains next iteration.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T10:29:37.256Z, excerpt_hash=sha256:e738b2822050d89d0614e69ec5311cbab750b58fdcd56e36be1a83ad9a04745b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610011012-HMMTBX/blueprint/resolved-snapshot.json
- old_digest: c3a8d0257c75b04f43dcadbe466203fe5786be86be0ce85be8b20acf09c36fb0
- current_digest: c3a8d0257c75b04f43dcadbe466203fe5786be86be0ce85be8b20acf09c36fb0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610011012-HMMTBX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610011012-HMMTBX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this child implementation commit and its intentional source/test/provenance edits; preserve immutable completed task evidence and registered deviations.

## Findings

Confirmed native ndtxt.cxx SetListRestart changes only Which85, while the existing combined setter clears Which86 on false and true-without-value. Native SetAttrListRestartValue separately compares the original signed tSwNumTreeNumber input, resets at USHRT_MAX and casts non-sentinel inputs to sal_Int16. The sole production combined call is XML import; other combined calls are tests. Existing browser list item-set composition already owns explicit combined state. Getter absent-value diagnostics, JS-number domain beyond exact integers, full client/attribute/style lifetime and ODT inactive-value persistence are not implicitly certified by this task. Harness-only failures: native compilation/execution succeeded initially, but fixture copy used a nonexistent src/test/fixtures directory; rg located actual src/test and final copy was repaired. The first focused run passed40 existing/new tests but the native mutation-attempt serializer emitted integer1 for SfxBoolItem true. Correct the named typed JSON serializer, preserve unchanged source bodies; no assertion or production behavior change. Initial logs are retained. Typecheck and lint passed. Second focused mismatch was an invalid harness parent profile: SwTextFormatColl ranges exclude Which86 in pinned init.cxx aTextFormatCollSetRange and local hintids.ts, so SetFormatAttr(86,9) does not store9. Preserve this failure log; replace the unsupported style-parent assumption with a real source-supported rule-format9/pool-default1 separation profile. Unchanged native setters and all original application assertions remain intact; no parent86 style certification. Final source-backed outcome: SetListRestart(bool) touches only Which85 and retains direct Which86 across both flag states; SetAttrListRestartValue compares original signed input, returns on equal direct value, resets65535 and narrows all other exact integer inputs to signed16. XML import now calls these two APIs explicitly. ndtxt.ts997 lines; no new runtime helper or architecture wrapper. Native GetAttr adapter now retains typed references in owned map storage rather than returning references through temporary conversion; ASan/UBSan passed the same42 states and fixture semantic equality was checked before writing, so runtime fixture assertions were unchanged. Four supported rule/default/value profiles compare84 normal/reading application states; original699 tests plus2 new pass. No whole-module status promotion. Command: npm run verify. Result: pass, actual exit0. Evidence:701 app tests/158 files;109 inventory tests/36 files;19 browser tests; app100%10628 statements/8024 branches/2877 functions/9753 lines and inventory100%1523/1080/384/1464; all format/lint/type/module/resources/static/JSDoc/file-size/source-tree/provenance/invariant/parity gates passed. Scope: final code and original full gate criteria. Command: python3 .agentplane/tasks/202610011012-HMMTBX/native-restart.py. Result: pass, six complete unchanged source bodies/four profiles/42 literal states under AddressSanitizer+UBSan. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; doctor0 errors and two pre-existing warnings only (managed hook readiness and immutable F1JT8K historical implementation SHA). Completed full log terminal padding was normalized only after actual exit0, preserving all checks/assertions/warnings. Next measured obligation: actual fresh SwDoc nodes in normal/reading mode have no direct86 and effective1, but GetAttrListRestartValue throws; native GetAttrListRestartValue performs OSL_ENSURE then effective GetAttr. Pinned include/osl/diagnose.h defines OSL_ENSURE as diagnostic SAL_DETAIL_WARN_IF_FORMAT, not C assert. See followup-getter-baseline.json and native-supporting-types-and-diagnostic.json. Native absent-getter diagnostic execution remains to prove in the next separate task. Full registry/defaults/client/style lifetime, prior UI transient root causes and ODT inactive-value persistence remain unresolved/unverified; preserve all registered document IO deviations. Parent and goal stay open.
