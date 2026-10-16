---
id: "202610160032-WW0KDX"
title: "Correct native Font IsSameInstance value comparison"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T00:33:01.494Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T00:41:21.459Z"
  updated_by: "CODER"
  note: "32related/187Calc pass;exact1shared and33Calc raw S/B/F/L100,every counter positive.13source gates,5native pins,whole emitted module unchanged except declared comparison and29other methods unchanged;build and actual Chromium/Writer pass,4refs restored. Native nonvirtual value predicate only;new stored Font Worker transport follow-up recorded;full UI/ODS remains pending,no all-app run."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T00:42:16.940Z"
  updated_by: "EVALUATOR"
  note: "Same-agent EVALUATOR phase reviews commita42e73eeb77d against approved Font comparison correction. Required bounded criteria pass;not independent review or full Font/Calc UI/ODS certification."
  evaluated_sha: "a42e73eeb77dd609dea0cdfe8355b5d97fb6b1be"
  blueprint_digest: "fd5a3e741ab9cd693205c004974a4d5e0f32e08b14965de88c4214416cf14840"
  evidence_refs:
    - ".agentplane/tasks/202610160032-WW0KDX/README.md"
    - ".agentplane/tasks/202610160032-WW0KDX/quality/20261016-004216940-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160032-WW0KDX/quality/20261016-004216940-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160032-WW0KDX/quality/20261016-004216940-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160032-WW0KDX/blueprint/resolved-snapshot.json"
    - "output/playwright/task182-checks/final-verification.json"
    - "output/playwright/task182-checks/native-audit.json"
    - "output/playwright/task182-checks/source-gates.json"
    - "ap doctor OK with prior managed-hook warning;policy routing OK"
  findings:
    - "Exact native chain Font IsSameInstance->cow_wrapper operator==->same object OR ImplFont value proves prior JS identity-only behavior wrong. Reuse existing base Font equality with nonvirtual binding;all other runtime state and29methods remain unchanged."
    - "32related and187Calc scenarios pass;exact1shared and33Calc raw S/B/F/L100 with every counter positive. Independent equal handles,unequal fields and derived hiding-overload cases pass.13source gates,build,actual Chromium/Writer workflow pass with4refs absent/restored;9non-task paths fit20."
    - "Five native blobs pinned and whole emitted module differs only in declared method body. Inventory broad parity flags remain false;CALC169 and prior identity-interpretation correction are explicit. No C++ ownership wrapper is ported."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: correct the proven Font IsSameInstance mismatch using existing value equality;preserve state and all unrelated methods,add exact source-chain evidence without porting ownership machinery."
events:
  -
    type: "status"
    at: "2026-10-16T00:33:02.758Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the proven Font IsSameInstance mismatch using existing value equality;preserve state and all unrelated methods,add exact source-chain evidence without porting ownership machinery."
  -
    type: "verify"
    at: "2026-10-16T00:41:21.459Z"
    author: "CODER"
    state: "ok"
    note: "32related/187Calc pass;exact1shared and33Calc raw S/B/F/L100,every counter positive.13source gates,5native pins,whole emitted module unchanged except declared comparison and29other methods unchanged;build and actual Chromium/Writer pass,4refs restored. Native nonvirtual value predicate only;new stored Font Worker transport follow-up recorded;full UI/ODS remains pending,no all-app run."
doc_version: 3
doc_updated_at: "2026-10-16T00:41:21.511Z"
doc_updated_by: "CODER"
description: "Task182: native Font IsSameInstance uses cow_wrapper operator==,which compares shared identity OR ImplFont values;correct current JS record identity-only implementation through existing represented Font equality. No cow wrapper/refcount library or memory manager. Update related tests and truthful inventory/suspected source case."
sections:
  Summary: "Correct a source-proven shared Font contract mismatch: IsSameInstance delegates to cow_wrapper equality,which permits equal values in distinct implementations. Reuse existing represented Font equality and remove the incorrect identity-only interpretation."
  Scope: "One shared Font method and its documentation;related metadata/value tests,actual Chromium case,inventory/readiness/suspected source note. Maximum20non-task paths. Existing state,copy/update guards,other algorithms and deliberate I/O/recovery deviations remain unchanged. No physical COW/refcount/weak/lifetime library,renderer/configuration/full-font expansion,native compiler/probe,network or all-app run."
  Plan: "Correct shared Font IsSameInstance to reuse actual represented Font value equality,matching original cow_wrapper operator== instead of JS state-object identity. Preserve all state/guarded assignments and existing Equals behavior;do not port cow_wrapper,refcounts or physical uniqueness. Update only the erroneous equal-value expectation in existing metadata tests plus misleading identity wording;add independent-equal and unequal paint/alignment/geometry regressions and Chromium case. Document source naming surprise CALC169 and correct truthful inventory/readiness claims while retaining prior history/parity statuses. Maximum20non-task paths. Verify native Font/ImplFont/cow_wrapper source chain and unchanged all other method bodies,related shared raw S/B/F/L100 plus whole Calc,13gates,build and actual Chromium/Writer startup-load-edit with4refs absent/restored. No native compiled probe or all-app run;full UI/ODS milestone remains pending."
  Verify Steps: "Pin Font IsSameInstance/operator== and ImplFont equality definitions plus font.hxx ImplType and cow_wrapper operator==/same_object. Prove source evaluates shared object OR value,not identity alone. Actual independent Font handles modified to equal metadata/paint/alignment/size must compare true;each represented unequal value must compare false. Preserve old metadata functional cases,change only equal-value identity expectation,add source-based regressions and browser independent-equal case. All other Font method bodies and reused Color/Size/wrapper-free implementation remain unchanged by emitted-token proof. Related shared exact raw S/B/F/L100 plus whole Calc,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium Font semantics and Writer startup/load/edit with4upstream refs absent/restored. Inventory remains broad-unverified and documents prior identity interpretation as corrected;no native probe,full font/pool/document/UI/ODS or all-app claim."
  Verification: |-
    Command: node output/playwright/task182-checks/native-audit.mjs. Result:pass. Evidence:5pinned native font/wrapper/header/QA blobs;exact Font->cow_wrapper shared-object OR value chain;entire emitted Font module unchanged except declared method body and29other methods token-identical;reused Color/Size/enums/dependency guard unchanged. Scope:represented value predicate with native nonvirtual base binding,without implementing the C++ wrapper. Command: node output/playwright/task182-checks/portable.mjs. Result:pass. Evidence:32related scenarios/5files and187Calc/76files;exact1shared raw S41/B38/F30/L40 and33Calc S4179/B2731/F821/L3727,every raw counter positive100. Scope:independent-equal and unequal font values,derived equality overload and all Calc. Command: node output/playwright/task182-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium independent-equal Font result and Writer startup/load/edit;all4refs absent/restored.13source gates pass;docs/inventory/diff refreshed after acceptance notes. Limits:full unrepresented Font fields/configuration/device/rendering and Calc pool/document/UI/ODS remain unverified;no physical ownership engine,native compiler/probe or all-app run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T00:41:21.459Z — VERIFY — ok

    By: CODER

    Note: 32related/187Calc pass;exact1shared and33Calc raw S/B/F/L100,every counter positive.13source gates,5native pins,whole emitted module unchanged except declared comparison and29other methods unchanged;build and actual Chromium/Writer pass,4refs restored. Native nonvirtual value predicate only;new stored Font Worker transport follow-up recorded;full UI/ODS remains pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T00:41:00.697Z, excerpt_hash=sha256:f4d865435a357c51998455c8b9a88408a672f82fa5c0bb9ef3c82979c8870154

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160032-WW0KDX/blueprint/resolved-snapshot.json
    - old_digest: fd5a3e741ab9cd693205c004974a4d5e0f32e08b14965de88c4214416cf14840
    - current_digest: fd5a3e741ab9cd693205c004974a4d5e0f32e08b14965de88c4214416cf14840
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160032-WW0KDX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160032-WW0KDX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task182 commits only,preserving calc branch,unrelated work and upstream links. No merges,history rewrite,gate weakening or unrelated Writer-only coverage repairs. Portable wrappers restore4references in finally."
  Findings: |-
    - Observation: Source review also requires the native nonvirtual comparison binding: a derived equality overload must not change Font IsSameInstance. The first passing profile used direct this.Equals delegation.
      Impact: Use the base Font value operation explicitly rather than inheriting JavaScript virtual dispatch into a native nonvirtual contract;state and all other method bodies stay unchanged.
      Resolution: Bind Font.prototype.Equals.call(this,other),add an actual Font-derived hiding-overload regression,and update the emitted-module proof. Rerun final profiles after this justified source change;no pass criteria or scope expansion.

    - Observation: Read-only follow-up inspection finds Writer browser writer-document-codec still projects bullet Font to the original family/style/family-class/pitch/charset fields. New stored Font paint/alignment/size fields added in task181 are not present in that transport projection.
      Impact: A separate next task must verify and repair lossless Worker/document transport for the newly represented shared value fields;this does not alter the approved single-method IsSameInstance correction.
      Resolution: Keep goal active and prioritize a source-backed round-trip regression and actual codec/type/caller update after task182 closes. Do not change ODF semantics or add a compatibility mechanism to conceal dropped state.
id_source: "generated"
---
## Summary

Correct a source-proven shared Font contract mismatch: IsSameInstance delegates to cow_wrapper equality,which permits equal values in distinct implementations. Reuse existing represented Font equality and remove the incorrect identity-only interpretation.

## Scope

One shared Font method and its documentation;related metadata/value tests,actual Chromium case,inventory/readiness/suspected source note. Maximum20non-task paths. Existing state,copy/update guards,other algorithms and deliberate I/O/recovery deviations remain unchanged. No physical COW/refcount/weak/lifetime library,renderer/configuration/full-font expansion,native compiler/probe,network or all-app run.

## Plan

Correct shared Font IsSameInstance to reuse actual represented Font value equality,matching original cow_wrapper operator== instead of JS state-object identity. Preserve all state/guarded assignments and existing Equals behavior;do not port cow_wrapper,refcounts or physical uniqueness. Update only the erroneous equal-value expectation in existing metadata tests plus misleading identity wording;add independent-equal and unequal paint/alignment/geometry regressions and Chromium case. Document source naming surprise CALC169 and correct truthful inventory/readiness claims while retaining prior history/parity statuses. Maximum20non-task paths. Verify native Font/ImplFont/cow_wrapper source chain and unchanged all other method bodies,related shared raw S/B/F/L100 plus whole Calc,13gates,build and actual Chromium/Writer startup-load-edit with4refs absent/restored. No native compiled probe or all-app run;full UI/ODS milestone remains pending.

## Verify Steps

Pin Font IsSameInstance/operator== and ImplFont equality definitions plus font.hxx ImplType and cow_wrapper operator==/same_object. Prove source evaluates shared object OR value,not identity alone. Actual independent Font handles modified to equal metadata/paint/alignment/size must compare true;each represented unequal value must compare false. Preserve old metadata functional cases,change only equal-value identity expectation,add source-based regressions and browser independent-equal case. All other Font method bodies and reused Color/Size/wrapper-free implementation remain unchanged by emitted-token proof. Related shared exact raw S/B/F/L100 plus whole Calc,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium Font semantics and Writer startup/load/edit with4upstream refs absent/restored. Inventory remains broad-unverified and documents prior identity interpretation as corrected;no native probe,full font/pool/document/UI/ODS or all-app claim.

## Verification

Command: node output/playwright/task182-checks/native-audit.mjs. Result:pass. Evidence:5pinned native font/wrapper/header/QA blobs;exact Font->cow_wrapper shared-object OR value chain;entire emitted Font module unchanged except declared method body and29other methods token-identical;reused Color/Size/enums/dependency guard unchanged. Scope:represented value predicate with native nonvirtual base binding,without implementing the C++ wrapper. Command: node output/playwright/task182-checks/portable.mjs. Result:pass. Evidence:32related scenarios/5files and187Calc/76files;exact1shared raw S41/B38/F30/L40 and33Calc S4179/B2731/F821/L3727,every raw counter positive100. Scope:independent-equal and unequal font values,derived equality overload and all Calc. Command: node output/playwright/task182-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium independent-equal Font result and Writer startup/load/edit;all4refs absent/restored.13source gates pass;docs/inventory/diff refreshed after acceptance notes. Limits:full unrepresented Font fields/configuration/device/rendering and Calc pool/document/UI/ODS remain unverified;no physical ownership engine,native compiler/probe or all-app run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T00:41:21.459Z — VERIFY — ok

By: CODER

Note: 32related/187Calc pass;exact1shared and33Calc raw S/B/F/L100,every counter positive.13source gates,5native pins,whole emitted module unchanged except declared comparison and29other methods unchanged;build and actual Chromium/Writer pass,4refs restored. Native nonvirtual value predicate only;new stored Font Worker transport follow-up recorded;full UI/ODS remains pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T00:41:00.697Z, excerpt_hash=sha256:f4d865435a357c51998455c8b9a88408a672f82fa5c0bb9ef3c82979c8870154

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160032-WW0KDX/blueprint/resolved-snapshot.json
- old_digest: fd5a3e741ab9cd693205c004974a4d5e0f32e08b14965de88c4214416cf14840
- current_digest: fd5a3e741ab9cd693205c004974a4d5e0f32e08b14965de88c4214416cf14840
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160032-WW0KDX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160032-WW0KDX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task182 commits only,preserving calc branch,unrelated work and upstream links. No merges,history rewrite,gate weakening or unrelated Writer-only coverage repairs. Portable wrappers restore4references in finally.

## Findings

- Observation: Source review also requires the native nonvirtual comparison binding: a derived equality overload must not change Font IsSameInstance. The first passing profile used direct this.Equals delegation.
  Impact: Use the base Font value operation explicitly rather than inheriting JavaScript virtual dispatch into a native nonvirtual contract;state and all other method bodies stay unchanged.
  Resolution: Bind Font.prototype.Equals.call(this,other),add an actual Font-derived hiding-overload regression,and update the emitted-module proof. Rerun final profiles after this justified source change;no pass criteria or scope expansion.

- Observation: Read-only follow-up inspection finds Writer browser writer-document-codec still projects bullet Font to the original family/style/family-class/pitch/charset fields. New stored Font paint/alignment/size fields added in task181 are not present in that transport projection.
  Impact: A separate next task must verify and repair lossless Worker/document transport for the newly represented shared value fields;this does not alter the approved single-method IsSameInstance correction.
  Resolution: Keep goal active and prioritize a source-backed round-trip regression and actual codec/type/caller update after task182 closes. Do not change ODF semantics or add a compatibility mechanism to conceal dropped state.
