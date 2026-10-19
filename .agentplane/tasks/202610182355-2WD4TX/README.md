---
id: "202610182355-2WD4TX"
title: "Implement native RTL general Unicode number formatting and buffer insertion"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Native complete formatter differential matrix and real replace/insert states normal+ASanUBSan;entire changed formatting scopes raw100 S/B/F/L and related SAL tests;wholeCalc raw100;types/build/static/style/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing. Full regression next task30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T23:55:49.300Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T00:06:54.008Z"
  updated_by: "CODER"
  note: "Full8format Unicode formatter and real replace/insert owners match122765genuine normal/ASanUBSan states plus37026prior float buffers;actual upstream negative-F overflow separately reproduced and bounded honestly. Entire changed scope/raw100,wholeCalc299/raw100,formula32 and all declared gates pass.15paths,goalactive,nextfull30."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-19T00:07:56.388Z"
  updated_by: "EVALUATOR"
  note: "Complete RTL Unicode formatting and actual replacement/insertion contracts meet the approved bounded source scope with100percent changed-module and Calc coverage."
  evaluated_sha: "d6ca1e55634ce53464c92f752b8137ed99b6c0d7"
  blueprint_digest: "0ca74aceb9ccb99938ee0e33b8638e0ef08349b52bd9bb0070e766d3c4272ba8"
  evidence_refs:
    - ".agentplane/tasks/202610182355-2WD4TX/README.md"
    - ".agentplane/tasks/202610182355-2WD4TX/quality/20261019-000756388-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610182355-2WD4TX/quality/20261019-000756388-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610182355-2WD4TX/quality/20261019-000756388-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610182355-2WD4TX/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610182355-2WD4TX/verification.md"
    - ".agentplane/tasks/202610182355-2WD4TX/native-build-summary.json"
    - ".agentplane/tasks/202610182355-2WD4TX/native-isolated-stack-overflow.log"
    - ".agentplane/tasks/202610182355-2WD4TX/coverage-summary.json"
  findings:
    - "All8native formats and actual enum/28bit sentinel values follow pinned source;pre-round selection,half-up integer rounding,grouping,erase,exponent widths and Dragonbox ignored-zero scale are represented in one existing numeric owner. C facade uses actual SAL allocation/buffer/ref ownership,no synthetic provider."
    - "122765genuine normal/ASanUBSan states and37026prior float buffers pass on verified138actual objects/346original sources. Native negative-F stack-allocation bug is independently reproduced as expected SIGABRT/ASan,retained with exact input and conservatively excluded from returned-output observations without sanitizer weakening."
    - "WholeCalc299/raw100,related16files41cases/raw100 S287 B297 F12 L252,formula32,types/finalbuild/static/style/docs/dependencies/provenance/scopedinventories/doctor/routing pass.15intentional paths,clean implementation commit d6ca1e55634c,no validators or thresholds changed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start:port full native RTL number formatting and real Unicode replace/insert contracts for the approved Calc buffer and font serialization path."
events:
  -
    type: "status"
    at: "2026-10-18T23:55:50.459Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:port full native RTL number formatting and real Unicode replace/insert contracts for the approved Calc buffer and font serialization path."
  -
    type: "verify"
    at: "2026-10-19T00:06:54.008Z"
    author: "CODER"
    state: "ok"
    note: "Full8format Unicode formatter and real replace/insert owners match122765genuine normal/ASanUBSan states plus37026prior float buffers;actual upstream negative-F overflow separately reproduced and bounded honestly. Entire changed scope/raw100,wholeCalc299/raw100,formula32 and all declared gates pass.15paths,goalactive,nextfull30."
doc_version: 3
doc_updated_at: "2026-10-19T00:06:54.061Z"
doc_updated_by: "CODER"
description: "Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network."
sections:
  Summary: |-
    Implement native RTL general Unicode number formatting and buffer insertion

    Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.
  Scope: |-
    - In scope: Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.
    - Out of scope: unrelated refactors not required for "Implement native RTL general Unicode number formatting and buffer insertion".
  Plan: "Port full original numeric formatting algorithm in existing strtmpl.math responsibility:source enums/precision constants,all eight formats,sign/specials,exact integers,pre-round format selection,half-up integer significand rounding,decimal/grouping/clamp/exponent rules. Generalize existing scalar/float adapters to one algorithm while retaining prior source-derived and genuine float observations. Add original Unicode C writer using actual existing newFromStr_WithLength/stringbuffer_insert and capacity ownership;header exports and honest mapped/unverified registries. Verify genuine normal+ASanUBSan source-linked oracle including binary64 boundaries,precision/grouping/erase and replace/insert states;entire changed numeric/C scopes100 plus related SAL and wholeCalc100. Types/build/static/style/docs/size/tree/dependency/provenance/scopedinventories/doctor/routing. Up to20non-task paths. Existing user goal approval applies;no network/merge,full regression next30."
  Verify Steps: "Run offline native observer against unchanged verified full69normal+69ASanUBSan SAL/CPPU objects;compare identical successful streams and no sanitizer errors. Replay all eight formats,precision sentinels/clamps/negative places,IEEE specials/signedzero/subnormal/max/carry/tie/exact integer boundaries,valid repeating grouping including zero group separator,Unicode decimal/group units and erase modes. Verify actual replace versus insert output/terminator/capacity/relative identity and old data release with valid real buffers. Entire changed formatter and math C owner raw100 S/B/F/L with related SAL native float and legacy scalar/parser tests;wholeCalc100. Run typecheck/build/static,changed-path prettier/eslint,docs/size/tree/dependencies/provenance,shared+Calc inventories,ap doctor,routing. Full regression cadence30,not25."
  Verification: |-
    # Verification evidence

    - Command: node scripts/rtl-double-format-native-probe.mjs --write. Result: pass. Evidence: native-with-undefined-witness.log,native-build-summary.json and native-double-format-cases.json;122765complete returned states,346original source hashes,138actual object hashes. Scope: all8Unicode format modes,24precision values including the native28bit sentinel/clamps/negative places,40boundary values,7null/valid grouping configurations,both erase modes,and16384deterministic full-bit binary64 inputs. Genuine cached full69normal+69ASanUBSan SAL/CPPU objects are checked against prior original sources/config/generated headers,hashed before and after valid execution,and linked by two new observation-only callers. Both valid streams exit0,match byte-for-byte and have no sanitizer diagnostics. No original source bodies/dependencies or sanitizer settings are replaced/weakened.

    - Command: the same probe's separate asan-caller unsafe mode. Result: expected original failure,not a returned-output pass. Evidence: native-isolated-stack-overflow.log,fixture undefinedAllocation and native-build-summary.json. Scope: exact original F,value1e14,places-15,groups{1,0},period/comma,noerase call aborts SIGABRT with AddressSanitizer dynamic-stack-buffer-overflow at genuine sal/rtl/strtmpl.hxx:1667. The original negative-F stack allocation estimate can be smaller than emitted integer/grouping output. Valid returned-output matrix uses a conservative bound over neighboring decimal exponents and omits1203potential unsafe cases;this does not claim every omitted input individually fails. Initial native-original-stack-overflow.log is retained. Managed TS storage represents original mathematical emission without reproducing unsafe native allocation. This is a bounded oracle,not exhaustive binary64/Dragonbox/host-runtime/ABI certification.

    - Command: npm run test:coverage -- --coverage.include=src/sal/rtl/strtmpl.math.ts --coverage.include=src/sal/rtl/math.ts --coverage.include=src/sal/inc/rtl/math-values.ts --coverage.include=src/sal/inc/rtl/math.h.ts --coverage.reportsDirectory=coverage/task25-numeric-final src/sal/rtl (apps/office). Result: pass. Evidence: related-final-coverage.log,16files41cases;raw S287/287 B297/297 F12/12 L252/252,100percent each,coverage-summary.json. Scope: entire changed formatter/math C/header/value owners plus related SAL tests. Actual initialized units including terminator,capacity,relative identity and old/new refs match122765native states.30692captured replacement texts are also replayed through a valid initially-null result slot. Prior37026genuine float output-buffer cases and old Automatic/Max witnesses remain passing. No test/coverage guards,thresholds or exclusions changed.

    - Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,111files299cases;raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each. Scope: whole Calc. Final equivalent native precision alias spelling is covered by the final related profile and final build.

    - Command: npx vitest run src/formula (apps/office). Result: pass. Evidence: formula-related.log,8files32cases. Scope: related formula consumers of the generalized shared scalar formatter.

    - Command: npm run typecheck; npm run build; node scripts/check-static-build.mjs. Result: pass. Evidence: typecheck.log,build-final.log,static.log. Scope: tools/app types,final app build and static assets. Existing large bundle warning remains;no new build failures.

    - Command: changed-path prettier --check and eslint; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance. Result: pass. Evidence: format-final.log,lint-final-all.log,docs.log2309authoredsources,dependencies.log863runtime sources/3744imports/125edges,size.log,tree.log114requiredpaths/33retiredroots,provenance-final.log864modules(741mapped/105browser/18infra). Scope:15intentional non-task paths. Original math.h explicitly aliases its two precision names;one local prefer-literal-enum-member exception preserves that declaration,following existing native enum conventions. No global lint,architecture,policy or source validation settings changed.

    - Command: npm run inventory:parity:shared; npm run inventory:parity:calc; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: inventory-shared.log,inventory-calc.log,doctor.log,routing.log. Scope: both inventories report semanticViolationCount0;compact summaries retain original full output SHA256 and omitted-array sizes. All mapped responsibilities remain foundation/unverified. Doctor reports OK with the pre-existing hook-readiness warning;no hook mutation.

    Full all-app regression cadence remains task30 after successful task20;this is task25. No network,merge,other checkout,unrelated tasks or full goal completion. OUStringBuffer,VariationsToString and real item/pool/UI integration remain subsequent work.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T00:06:54.008Z — VERIFY — ok

    By: CODER

    Note: Full8format Unicode formatter and real replace/insert owners match122765genuine normal/ASanUBSan states plus37026prior float buffers;actual upstream negative-F overflow separately reproduced and bounded honestly. Entire changed scope/raw100,wholeCalc299/raw100,formula32 and all declared gates pass.15paths,goalactive,nextfull30.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T00:06:53.550Z, excerpt_hash=sha256:3da6d58ff152d0db2db0c89ccd478fb2abc6362fde590c15c45e52e2bee9ec4f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182355-2WD4TX/blueprint/resolved-snapshot.json
    - old_digest: 0ca74aceb9ccb99938ee0e33b8638e0ef08349b52bd9bb0070e766d3c4272ba8
    - current_digest: 0ca74aceb9ccb99938ee0e33b8638e0ef08349b52bd9bb0070e766d3c4272ba8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182355-2WD4TX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182355-2WD4TX -m 🧩 2WD4TX task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit and task-owned registry/test changes. Preserve unrelated tasks and user changes. Do not reset branch or merge."
  Findings: "Native evidence corrected an initial host shortest-decimal decomposition:Dragonbox trailing_zero::ignore retains a coarse/fine scale that changes integer precision branches. Restore that scale using binary64 fields and original exact integer-log constants;all122765native states and37026prior float buffers now match. The first native matrix found actual upstream negative-F stack-allocation overflow. An independent minimal genuine call reproduces SIGABRT/ASan at strtmpl.hxx1667;retain both diagnostics and conservatively bound returned-output observations rather than weaken sanitizers or fabricate outputs for undefined memory behavior. Source mathematical emission uses managed storage. Initial missing-fixture startup and enum style/provenance metadata checks were corrected;final related/Calc/formula/types/build/static/style/ownership gates pass.15intentional paths;whole goal active,next full regression30. No parity certification or fake item/pool/buffer providers."
id_source: "generated"
---
## Summary

Implement native RTL general Unicode number formatting and buffer insertion

Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.

## Scope

- In scope: Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.
- Out of scope: unrelated refactors not required for "Implement native RTL general Unicode number formatting and buffer insertion".

## Plan

Port full original numeric formatting algorithm in existing strtmpl.math responsibility:source enums/precision constants,all eight formats,sign/specials,exact integers,pre-round format selection,half-up integer significand rounding,decimal/grouping/clamp/exponent rules. Generalize existing scalar/float adapters to one algorithm while retaining prior source-derived and genuine float observations. Add original Unicode C writer using actual existing newFromStr_WithLength/stringbuffer_insert and capacity ownership;header exports and honest mapped/unverified registries. Verify genuine normal+ASanUBSan source-linked oracle including binary64 boundaries,precision/grouping/erase and replace/insert states;entire changed numeric/C scopes100 plus related SAL and wholeCalc100. Types/build/static/style/docs/size/tree/dependency/provenance/scopedinventories/doctor/routing. Up to20non-task paths. Existing user goal approval applies;no network/merge,full regression next30.

## Verify Steps

Run offline native observer against unchanged verified full69normal+69ASanUBSan SAL/CPPU objects;compare identical successful streams and no sanitizer errors. Replay all eight formats,precision sentinels/clamps/negative places,IEEE specials/signedzero/subnormal/max/carry/tie/exact integer boundaries,valid repeating grouping including zero group separator,Unicode decimal/group units and erase modes. Verify actual replace versus insert output/terminator/capacity/relative identity and old data release with valid real buffers. Entire changed formatter and math C owner raw100 S/B/F/L with related SAL native float and legacy scalar/parser tests;wholeCalc100. Run typecheck/build/static,changed-path prettier/eslint,docs/size/tree/dependencies/provenance,shared+Calc inventories,ap doctor,routing. Full regression cadence30,not25.

## Verification

# Verification evidence

- Command: node scripts/rtl-double-format-native-probe.mjs --write. Result: pass. Evidence: native-with-undefined-witness.log,native-build-summary.json and native-double-format-cases.json;122765complete returned states,346original source hashes,138actual object hashes. Scope: all8Unicode format modes,24precision values including the native28bit sentinel/clamps/negative places,40boundary values,7null/valid grouping configurations,both erase modes,and16384deterministic full-bit binary64 inputs. Genuine cached full69normal+69ASanUBSan SAL/CPPU objects are checked against prior original sources/config/generated headers,hashed before and after valid execution,and linked by two new observation-only callers. Both valid streams exit0,match byte-for-byte and have no sanitizer diagnostics. No original source bodies/dependencies or sanitizer settings are replaced/weakened.

- Command: the same probe's separate asan-caller unsafe mode. Result: expected original failure,not a returned-output pass. Evidence: native-isolated-stack-overflow.log,fixture undefinedAllocation and native-build-summary.json. Scope: exact original F,value1e14,places-15,groups{1,0},period/comma,noerase call aborts SIGABRT with AddressSanitizer dynamic-stack-buffer-overflow at genuine sal/rtl/strtmpl.hxx:1667. The original negative-F stack allocation estimate can be smaller than emitted integer/grouping output. Valid returned-output matrix uses a conservative bound over neighboring decimal exponents and omits1203potential unsafe cases;this does not claim every omitted input individually fails. Initial native-original-stack-overflow.log is retained. Managed TS storage represents original mathematical emission without reproducing unsafe native allocation. This is a bounded oracle,not exhaustive binary64/Dragonbox/host-runtime/ABI certification.

- Command: npm run test:coverage -- --coverage.include=src/sal/rtl/strtmpl.math.ts --coverage.include=src/sal/rtl/math.ts --coverage.include=src/sal/inc/rtl/math-values.ts --coverage.include=src/sal/inc/rtl/math.h.ts --coverage.reportsDirectory=coverage/task25-numeric-final src/sal/rtl (apps/office). Result: pass. Evidence: related-final-coverage.log,16files41cases;raw S287/287 B297/297 F12/12 L252/252,100percent each,coverage-summary.json. Scope: entire changed formatter/math C/header/value owners plus related SAL tests. Actual initialized units including terminator,capacity,relative identity and old/new refs match122765native states.30692captured replacement texts are also replayed through a valid initially-null result slot. Prior37026genuine float output-buffer cases and old Automatic/Max witnesses remain passing. No test/coverage guards,thresholds or exclusions changed.

- Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,111files299cases;raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each. Scope: whole Calc. Final equivalent native precision alias spelling is covered by the final related profile and final build.

- Command: npx vitest run src/formula (apps/office). Result: pass. Evidence: formula-related.log,8files32cases. Scope: related formula consumers of the generalized shared scalar formatter.

- Command: npm run typecheck; npm run build; node scripts/check-static-build.mjs. Result: pass. Evidence: typecheck.log,build-final.log,static.log. Scope: tools/app types,final app build and static assets. Existing large bundle warning remains;no new build failures.

- Command: changed-path prettier --check and eslint; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance. Result: pass. Evidence: format-final.log,lint-final-all.log,docs.log2309authoredsources,dependencies.log863runtime sources/3744imports/125edges,size.log,tree.log114requiredpaths/33retiredroots,provenance-final.log864modules(741mapped/105browser/18infra). Scope:15intentional non-task paths. Original math.h explicitly aliases its two precision names;one local prefer-literal-enum-member exception preserves that declaration,following existing native enum conventions. No global lint,architecture,policy or source validation settings changed.

- Command: npm run inventory:parity:shared; npm run inventory:parity:calc; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: inventory-shared.log,inventory-calc.log,doctor.log,routing.log. Scope: both inventories report semanticViolationCount0;compact summaries retain original full output SHA256 and omitted-array sizes. All mapped responsibilities remain foundation/unverified. Doctor reports OK with the pre-existing hook-readiness warning;no hook mutation.

Full all-app regression cadence remains task30 after successful task20;this is task25. No network,merge,other checkout,unrelated tasks or full goal completion. OUStringBuffer,VariationsToString and real item/pool/UI integration remain subsequent work.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T00:06:54.008Z — VERIFY — ok

By: CODER

Note: Full8format Unicode formatter and real replace/insert owners match122765genuine normal/ASanUBSan states plus37026prior float buffers;actual upstream negative-F overflow separately reproduced and bounded honestly. Entire changed scope/raw100,wholeCalc299/raw100,formula32 and all declared gates pass.15paths,goalactive,nextfull30.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T00:06:53.550Z, excerpt_hash=sha256:3da6d58ff152d0db2db0c89ccd478fb2abc6362fde590c15c45e52e2bee9ec4f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182355-2WD4TX/blueprint/resolved-snapshot.json
- old_digest: 0ca74aceb9ccb99938ee0e33b8638e0ef08349b52bd9bb0070e766d3c4272ba8
- current_digest: 0ca74aceb9ccb99938ee0e33b8638e0ef08349b52bd9bb0070e766d3c4272ba8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182355-2WD4TX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182355-2WD4TX -m 🧩 2WD4TX task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit and task-owned registry/test changes. Preserve unrelated tasks and user changes. Do not reset branch or merge.

## Findings

Native evidence corrected an initial host shortest-decimal decomposition:Dragonbox trailing_zero::ignore retains a coarse/fine scale that changes integer precision branches. Restore that scale using binary64 fields and original exact integer-log constants;all122765native states and37026prior float buffers now match. The first native matrix found actual upstream negative-F stack-allocation overflow. An independent minimal genuine call reproduces SIGABRT/ASan at strtmpl.hxx1667;retain both diagnostics and conservatively bound returned-output observations rather than weaken sanitizers or fabricate outputs for undefined memory behavior. Source mathematical emission uses managed storage. Initial missing-fixture startup and enum style/provenance metadata checks were corrected;final related/Calc/formula/types/build/static/style/ownership gates pass.15intentional paths;whole goal active,next full regression30. No parity certification or fake item/pool/buffer providers.
