---
id: "202610010247-DWV0NC"
title: "Restore native implicit list restart export ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T02:49:10.789Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T03:27:19.406Z"
  updated_by: "CODER"
  note: "Verified: native bounded restart metadata and conditional XML transitions;2403 sequences/288 states/84 genuine packages;full verify60245 exit0,654+109 tests,19 browser,all coverage100% and unchanged gates. Full goal remains active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T03:28:12.528Z"
  updated_by: "EVALUATOR"
  note: "Implementation9ac1779d7b3845eb320d93995d2d2e65dda59809 satisfies the approved bounded restart export correction;finish this child only,retain parent/goal active."
  evaluated_sha: "9ac1779d7b3845eb320d93995d2d2e65dda59809"
  blueprint_digest: "118c21db4363d1a33830703cc48c1f84fc9190be1fa262d95225902b488b803e"
  evidence_refs:
    - ".agentplane/tasks/202610010247-DWV0NC/README.md"
    - ".agentplane/tasks/202610010247-DWV0NC/quality/20261001-032812528-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610010247-DWV0NC/quality/20261001-032812528-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610010247-DWV0NC/quality/20261001-032812528-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610010247-DWV0NC/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610010247-DWV0NC/native-oracle.py"
    - ".agentplane/tasks/202610010247-DWV0NC/native-results.json"
    - ".agentplane/tasks/202610010247-DWV0NC/compare-native.ts"
    - ".agentplane/tasks/202610010247-DWV0NC/baseline.xml"
    - ".agentplane/tasks/202610010247-DWV0NC/verify.log"
    - "apps/office/src/sw/source/filter/xml/odt-list-implicit-restart.test.ts"
  findings:
    - "Writer now exposes restart and direct item independently;XMLTextNumRuleInfo owns numbered gate,absent sentinel,one-based level and retained format start. Native implicit nested split/root/opening fallback match actual structural/start output within resolved-rule scope."
    - "Primary probe uses unmodified exportListChange and metadata/getter excerpts with explicit adapters;2403 sequences/288 states and12 valid Writer projections are checked.48 native raw getter cases are normative evidence,not48 local cases.84 genuine ODT scenarios assert literal reopen omissions/gains,copies andWorker16."
    - "Full verify session60245 terminal0 passes654 app/109 inventory tests,19 browser scenarios,all coverage100%,unchanged gates;provenance204/128mapped,invariants34,semanticViolationCount0. No threshold/schema/policy changes,unsupported whole-module promotion or save/open/recovery change."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore source-owned implicit/direct restart metadata and native conditional list transitions under the persistent approved goal."
events:
  -
    type: "status"
    at: "2026-10-01T02:49:11.644Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned implicit/direct restart metadata and native conditional list transitions under the persistent approved goal."
  -
    type: "verify"
    at: "2026-10-01T03:27:19.406Z"
    author: "CODER"
    state: "ok"
    note: "Verified: native bounded restart metadata and conditional XML transitions;2403 sequences/288 states/84 genuine packages;full verify60245 exit0,654+109 tests,19 browser,all coverage100% and unchanged gates. Full goal remains active."
doc_version: 3
doc_updated_at: "2026-10-01T03:27:19.483Z"
doc_updated_by: "CODER"
description: "Iteration33: preserve independent numbered,restart,direct-start and format-start metadata under XMLTextNumRuleInfo and export native implicit-restart list transitions. Preserve registered save/open/recovery differences."
sections:
  Summary: "Restore native implicit list restart export ownership as iteration33 under the persistent full upstream goal."
  Scope: "sw/source/filter/xml/xmlexp.ts;xmloff/source/text/txtparae.ts,new XMLTextNumRuleInfo.ts and focused metadata/export tests;genuine ODT implicit-restart tests and existing sublist-restart transport assertions;runtime inventory,source provenance,writer-command-slice evidence references if relocation is required,writer-odt-format.md;task-local native probes. Existing resolved numbered/bullet rules and unchanged list identity/style resolution. Preserve Worker16,ODF1.3,save/open/recovery divergences and all gates. Full processed-list identity,continue-numbering,style-override,missing-rule factories,numbered-paragraph,full UNO/helper/native architectures and mobile resize/menu stability remain separate."
  Plan: "Project Writer numbered/restart/direct-start independently: native NumberingStartValue is available only with rule,restart and direct item;do not replace absent direct start with GetActualListStartValue. Add source-named XMLTextNumRuleInfo owning native default/reset,numbered gate,independent restart/start and format start with native sentinel semantics and supported typed property adapter;no compatibility alias or callback imitation. Retain native format-start reset behavior. Integrate its metadata into paragraph list transitions. For counted implicit restart at same/decreasing nested level,close/reopen the text:list without start-value;for same/decreasing root emit format start;for newly opened nested levels and already processed root segments follow pinned conditional fallback;first unprocessed single-level root can omit implicit restart. Direct starts including0 override defaults. Uncounted metadata is suppressed by the native numbered gate. Keep unrelated style/identity behavior unchanged and avoid claiming full helper/UNO parity. Compile unmodified primary exportListChange plus metadata constructor/reset/getters/numbered and format-start snippets with explicit platform/OUString/UNO/property/export/identity/style adapters;compare actual local structural+item-start output across root,nested,gaps,decreasing/re-entry,counted/header,implicit/direct0/other starts. Genuine packages and manually set model states verify literal model state,XML,copies,Worker16 and native reopen projections. Run focused gates first then full unchanged verify,doctor/routing/diff;record actual implementation hash,quality and clean state;keep parent/goal active."
  Verify Steps: "Reproduce current counted implicit restart becoming explicit start at every exported position. Compile unmodified pinned exportListChange and native XMLTextNumRuleInfo constructor/reset/getter/numbered/format-start excerpts with explicit adapters;compare structural list/header/item events plus item start attributes for same/decreasing/root/newnested/skipped levels/processed-root re-entry,all participation states,implicit versus direct0/2/7,number and bullet rules,format-start defaults/signed16 projections and native reset retention. Assert metadata ownership and Writer direct-item getter conditions against primary IsNodeNumStart. Genuine common/automatic ODT and direct model fixtures must assert literal text,count,level,restart,direct/effective starts,counter vectors/labels,list identity,independent owned rule/item copies,Worker16,selected list structure and start attrs,manual native reopen omissions/gains. Update existing repeated-sublist expectations for implicit split retention and newly-opened fallback;no tautological roundtrip claim. Focused parity CLI/provenance validation precedes npm run verify unchanged;both100% coverage suites and all browser/resource/static/source/provenance/invariant gates are mandatory. Run ap doctor,node .agentplane/policy/check-routing.mjs,git diff --check,record real code hash/evaluator pass/final clean state. No gate/schema/threshold changes or whole-module/full-goal promotion."
  Verification: |-
    Command: compile task-local native-oracle.py and run compare-native.ts; execute baseline.ts against preceding c79a6ff3 sources.
    Result: pass.
    Evidence: baseline actual Writer XML emitted implicit starts5/7. Unmodified pinned exportListChange plus metadata constructor/Reset/getters/numbered/StartWith excerpts match2403 actual XML structural/start sequences and288 metadata states. Twelve valid Writer projections match compiled IsNodeNumStart;48 normative native getter states are retained,not all claimed as locally supported. Explicit platform/ASCII OUString/typed property/SAX/style/processed-identity/no-continuation adapters;full UNO Set and native build are not verified.
    Scope: existing resolved Arabic/bullet list metadata and selected structural restart transitions;no whole-module/default promotion.

    Command: focused Vitest metadata/repeated-sublist/implicit-restart tests; npm run check:source-provenance; npm run inventory:parity; npm run lint; npm run typecheck.
    Result: pass after documented repairs.
    Evidence: focused session78041 2files/3tests and session84490 1file/1test;84 genuine common/automatic ODT packages across two families verify literal model/copy/Worker16/selected XML and independent native reopen projections. Provenance204 modules/128mapped;parity session18298 exit0;repaired lint session46210 and typecheck31393 exit0. Initial stale expectation,wrong upstream header path and test non-null lint failures are recorded in Findings and retained evidence.

    Command: npm run verify > .agentplane/tasks/202610010247-DWV0NC/verify.log 2>&1.
    Result: pass;terminal session60245 exit0.
    Evidence:654 app tests/145files,109 inventory tests/36files,19 browser scenarios;app100% statements9994,branches7535,functions2753,lines9193;inventory100% statements1523,branches1080,functions384,lines1464. All unchanged formatting/lint/types/dependencies/resources/static/JSDoc452/file-size/source-tree/provenance204/invariants34 gates pass;runtime semanticViolationCount0. Compact log retains exact commands,tallies and terminal outcome.
    Scope: all required existing gates,with no skips,threshold/schema/config changes or whole-goal claim.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence:doctor0errors and2 unchanged warnings:managed hook shim readiness and old DONE F1JT8K close hash;policy routingOK;diff clean. Actual implementation commit,quality report and final clean state are recorded at closure.
    Residual obligations: full processed-list identity/continue-numbering/style overrides,missing-rule factories,numbered-paragraph/full UNO/native architecture,broader explicit negative/orphan restart contracts and unresolved prior mobile resize/menu stability. Parent and full goal remain active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T03:27:19.406Z — VERIFY — ok

    By: CODER

    Note: Verified: native bounded restart metadata and conditional XML transitions;2403 sequences/288 states/84 genuine packages;full verify60245 exit0,654+109 tests,19 browser,all coverage100% and unchanged gates. Full goal remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T03:27:18.857Z, excerpt_hash=sha256:dc823808851e38a6c7a14fc12647ecc49312bad920aef6f270cb82884b40040e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010247-DWV0NC/blueprint/resolved-snapshot.json
    - old_digest: 118c21db4363d1a33830703cc48c1f84fc9190be1fa262d95225902b488b803e
    - current_digest: 118c21db4363d1a33830703cc48c1f84fc9190be1fa262d95225902b488b803e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010247-DWV0NC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610010247-DWV0NC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "If needed revert scoped implementation through a new executable task;keep immutable DONE artifacts and full parent goal active."
  Findings: |-
    Preflight clean main/direct,parent202609240501-C9TN6M only active. Previous goal turn is progress:childZDTVKE DONE,actual codec79a6ff3539469ea8eb8f3ddccdd437adb8eb847,quality78d4586acadc0f009749cebb7092f532b5df01c4,closea6a01d959a356d94cd8b4555a267bc11f24474ab,parentc062bb1a09023fffb306a7fa02733c629499e8ec. Persistent user goal authorizes safe local iterations;no network,outside access or delegation. Pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Primary XMLTextNumRuleInfo::Set gates numbered restart/directstart and reads format StartWith independently;Reset does not reset the format-start field. unocrsrhelper IsNodeNumStart returns direct start only with rule,restart and direct item,else-1. Current xmlexp uses actual start for every counted restart and local XMLTextListSource lacks independent restart;thus no native implicit list split exists. Primary txtparae.cxx1262..1284 splits nested implicit restart and emits root defaults;opening/re-entry1164..1210 uses distinct conditional fallback. Root first unprocessed list can omit implicit restart. Broader style/identity/default/UI obligations remain unverified. Initial read searched nonexistent xmlexp.test.ts; bounded fallback uses actual filter tests and source paths,without fabricated evidence. Prior browser menu/resize failure is preserved in DONE child with3 isolated and final19-scenario pass;do not mutate or rerun its artifacts.

    - Observation: Actual preceding c79a6ff3 Writer/XML modules reproduced implicit starts as explicit5/7. Current actual XML matches2403 primary export sequences and288 metadata states;12 valid Writer projections match the compiled getter contract against48 normative IsNodeNumStart states. Native constructor/reset retains format start and HasStartValue uses only!=-1.
      Impact: The main transitions are source-backed. Raw Writer restart/start properties must reach XMLTextNumRuleInfo before its numbered gate;pre-export validation currently examines startValue before that gate and would reject ignored uncounted values or the native absent-1 sentinel.
      Resolution: Align the supported validation with the approved native numbered/absent-start contract:uncounted start payload is ignored;counted-1 is absence,other supported explicit starts remain0..32767. Add direct metadata/gate/default assertions and genuine XML cases;retain broader negative explicit starts,orphan restart items,UNO query/default factories and identity/style processing as unverified obligations rather than silently claiming parity.

    - Observation: Focused test session61437 terminal exit1:metadata2 tests pass;existing repeated-sublist transport test fails because it expects every counted implicit restart to gain an explicit5. Actual same-level reopened sublists now retain no direct start while restarttrue,matching compiled native split branches.
      Impact: This is the documented former export limitation assertion becoming stale after the approved correction;complete verification is still pending.
      Resolution: Persist active artifacts,replace only the former bounded projection assertion with source-derived explicit per-fixture reopen gains/retention and exact body item-start checks. Add independent genuine root/open/decreasing/re-entry/header/default/zero cases. Keep prior DONE task artifacts immutable and all mandatory gates unchanged.

    - Observation: The existing-test edit script asserted a six-space marker while the source uses eight spaces;the Python assertion failed before any edit. A following formatter returned0,so the shell terminal code alone masked that failure.
      Impact: The stale test is unchanged;no claimed passing test or source mutation resulted from the failed edit.
      Resolution: Inspect exact source indentation and apply a bounded structural replacement. Keep subsequent dependent commands conditional on actual success and inspect each tool result.

    - Observation: Focused genuine ODT session84490 passed all52 package scenarios. The first provenance check failed ENOENT because new evidence referenced xmloff/inc/XMLTextNumRuleInfo.hxx; the actual pinned header is xmloff/source/text/XMLTextNumRuleInfo.hxx. An initial documentation search also used nonexistent docs/writer-odt-format.md; bounded rg --files located docs/program/writer-odt-format.md.
      Impact: Runtime tests pass, but the evidence path must be corrected before full verification. No validator or gate change is required.
      Resolution: Use the actual source/text header and its inline Reset marker, repeat focused provenance/parity checks, retain the failed log and the bounded native scope.

    - Observation: Focused lint session11915 exited1 for three prohibited non-null assertions in the new test; typecheck session31393 and parity CLI session18298 exited0. The compact parity note initially queried the top-level semanticViolationCount and printed None; this field belongs to runtime.
      Impact: No runtime failure or parity promotion; test code and compact evidence require correction before full verification.
      Resolution: Replace non-null assertions with explicit missing-fixture guards; retain unchanged lint rules. Correct the compact note to report only the observed exit0, and retain runtime semantic totals from the full verification output.
id_source: "generated"
---
## Summary

Restore native implicit list restart export ownership as iteration33 under the persistent full upstream goal.

## Scope

sw/source/filter/xml/xmlexp.ts;xmloff/source/text/txtparae.ts,new XMLTextNumRuleInfo.ts and focused metadata/export tests;genuine ODT implicit-restart tests and existing sublist-restart transport assertions;runtime inventory,source provenance,writer-command-slice evidence references if relocation is required,writer-odt-format.md;task-local native probes. Existing resolved numbered/bullet rules and unchanged list identity/style resolution. Preserve Worker16,ODF1.3,save/open/recovery divergences and all gates. Full processed-list identity,continue-numbering,style-override,missing-rule factories,numbered-paragraph,full UNO/helper/native architectures and mobile resize/menu stability remain separate.

## Plan

Project Writer numbered/restart/direct-start independently: native NumberingStartValue is available only with rule,restart and direct item;do not replace absent direct start with GetActualListStartValue. Add source-named XMLTextNumRuleInfo owning native default/reset,numbered gate,independent restart/start and format start with native sentinel semantics and supported typed property adapter;no compatibility alias or callback imitation. Retain native format-start reset behavior. Integrate its metadata into paragraph list transitions. For counted implicit restart at same/decreasing nested level,close/reopen the text:list without start-value;for same/decreasing root emit format start;for newly opened nested levels and already processed root segments follow pinned conditional fallback;first unprocessed single-level root can omit implicit restart. Direct starts including0 override defaults. Uncounted metadata is suppressed by the native numbered gate. Keep unrelated style/identity behavior unchanged and avoid claiming full helper/UNO parity. Compile unmodified primary exportListChange plus metadata constructor/reset/getters/numbered and format-start snippets with explicit platform/OUString/UNO/property/export/identity/style adapters;compare actual local structural+item-start output across root,nested,gaps,decreasing/re-entry,counted/header,implicit/direct0/other starts. Genuine packages and manually set model states verify literal model state,XML,copies,Worker16 and native reopen projections. Run focused gates first then full unchanged verify,doctor/routing/diff;record actual implementation hash,quality and clean state;keep parent/goal active.

## Verify Steps

Reproduce current counted implicit restart becoming explicit start at every exported position. Compile unmodified pinned exportListChange and native XMLTextNumRuleInfo constructor/reset/getter/numbered/format-start excerpts with explicit adapters;compare structural list/header/item events plus item start attributes for same/decreasing/root/newnested/skipped levels/processed-root re-entry,all participation states,implicit versus direct0/2/7,number and bullet rules,format-start defaults/signed16 projections and native reset retention. Assert metadata ownership and Writer direct-item getter conditions against primary IsNodeNumStart. Genuine common/automatic ODT and direct model fixtures must assert literal text,count,level,restart,direct/effective starts,counter vectors/labels,list identity,independent owned rule/item copies,Worker16,selected list structure and start attrs,manual native reopen omissions/gains. Update existing repeated-sublist expectations for implicit split retention and newly-opened fallback;no tautological roundtrip claim. Focused parity CLI/provenance validation precedes npm run verify unchanged;both100% coverage suites and all browser/resource/static/source/provenance/invariant gates are mandatory. Run ap doctor,node .agentplane/policy/check-routing.mjs,git diff --check,record real code hash/evaluator pass/final clean state. No gate/schema/threshold changes or whole-module/full-goal promotion.

## Verification

Command: compile task-local native-oracle.py and run compare-native.ts; execute baseline.ts against preceding c79a6ff3 sources.
Result: pass.
Evidence: baseline actual Writer XML emitted implicit starts5/7. Unmodified pinned exportListChange plus metadata constructor/Reset/getters/numbered/StartWith excerpts match2403 actual XML structural/start sequences and288 metadata states. Twelve valid Writer projections match compiled IsNodeNumStart;48 normative native getter states are retained,not all claimed as locally supported. Explicit platform/ASCII OUString/typed property/SAX/style/processed-identity/no-continuation adapters;full UNO Set and native build are not verified.
Scope: existing resolved Arabic/bullet list metadata and selected structural restart transitions;no whole-module/default promotion.

Command: focused Vitest metadata/repeated-sublist/implicit-restart tests; npm run check:source-provenance; npm run inventory:parity; npm run lint; npm run typecheck.
Result: pass after documented repairs.
Evidence: focused session78041 2files/3tests and session84490 1file/1test;84 genuine common/automatic ODT packages across two families verify literal model/copy/Worker16/selected XML and independent native reopen projections. Provenance204 modules/128mapped;parity session18298 exit0;repaired lint session46210 and typecheck31393 exit0. Initial stale expectation,wrong upstream header path and test non-null lint failures are recorded in Findings and retained evidence.

Command: npm run verify > .agentplane/tasks/202610010247-DWV0NC/verify.log 2>&1.
Result: pass;terminal session60245 exit0.
Evidence:654 app tests/145files,109 inventory tests/36files,19 browser scenarios;app100% statements9994,branches7535,functions2753,lines9193;inventory100% statements1523,branches1080,functions384,lines1464. All unchanged formatting/lint/types/dependencies/resources/static/JSDoc452/file-size/source-tree/provenance204/invariants34 gates pass;runtime semanticViolationCount0. Compact log retains exact commands,tallies and terminal outcome.
Scope: all required existing gates,with no skips,threshold/schema/config changes or whole-goal claim.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence:doctor0errors and2 unchanged warnings:managed hook shim readiness and old DONE F1JT8K close hash;policy routingOK;diff clean. Actual implementation commit,quality report and final clean state are recorded at closure.
Residual obligations: full processed-list identity/continue-numbering/style overrides,missing-rule factories,numbered-paragraph/full UNO/native architecture,broader explicit negative/orphan restart contracts and unresolved prior mobile resize/menu stability. Parent and full goal remain active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T03:27:19.406Z — VERIFY — ok

By: CODER

Note: Verified: native bounded restart metadata and conditional XML transitions;2403 sequences/288 states/84 genuine packages;full verify60245 exit0,654+109 tests,19 browser,all coverage100% and unchanged gates. Full goal remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T03:27:18.857Z, excerpt_hash=sha256:dc823808851e38a6c7a14fc12647ecc49312bad920aef6f270cb82884b40040e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010247-DWV0NC/blueprint/resolved-snapshot.json
- old_digest: 118c21db4363d1a33830703cc48c1f84fc9190be1fa262d95225902b488b803e
- current_digest: 118c21db4363d1a33830703cc48c1f84fc9190be1fa262d95225902b488b803e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010247-DWV0NC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610010247-DWV0NC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

If needed revert scoped implementation through a new executable task;keep immutable DONE artifacts and full parent goal active.

## Findings

Preflight clean main/direct,parent202609240501-C9TN6M only active. Previous goal turn is progress:childZDTVKE DONE,actual codec79a6ff3539469ea8eb8f3ddccdd437adb8eb847,quality78d4586acadc0f009749cebb7092f532b5df01c4,closea6a01d959a356d94cd8b4555a267bc11f24474ab,parentc062bb1a09023fffb306a7fa02733c629499e8ec. Persistent user goal authorizes safe local iterations;no network,outside access or delegation. Pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Primary XMLTextNumRuleInfo::Set gates numbered restart/directstart and reads format StartWith independently;Reset does not reset the format-start field. unocrsrhelper IsNodeNumStart returns direct start only with rule,restart and direct item,else-1. Current xmlexp uses actual start for every counted restart and local XMLTextListSource lacks independent restart;thus no native implicit list split exists. Primary txtparae.cxx1262..1284 splits nested implicit restart and emits root defaults;opening/re-entry1164..1210 uses distinct conditional fallback. Root first unprocessed list can omit implicit restart. Broader style/identity/default/UI obligations remain unverified. Initial read searched nonexistent xmlexp.test.ts; bounded fallback uses actual filter tests and source paths,without fabricated evidence. Prior browser menu/resize failure is preserved in DONE child with3 isolated and final19-scenario pass;do not mutate or rerun its artifacts.

- Observation: Actual preceding c79a6ff3 Writer/XML modules reproduced implicit starts as explicit5/7. Current actual XML matches2403 primary export sequences and288 metadata states;12 valid Writer projections match the compiled getter contract against48 normative IsNodeNumStart states. Native constructor/reset retains format start and HasStartValue uses only!=-1.
  Impact: The main transitions are source-backed. Raw Writer restart/start properties must reach XMLTextNumRuleInfo before its numbered gate;pre-export validation currently examines startValue before that gate and would reject ignored uncounted values or the native absent-1 sentinel.
  Resolution: Align the supported validation with the approved native numbered/absent-start contract:uncounted start payload is ignored;counted-1 is absence,other supported explicit starts remain0..32767. Add direct metadata/gate/default assertions and genuine XML cases;retain broader negative explicit starts,orphan restart items,UNO query/default factories and identity/style processing as unverified obligations rather than silently claiming parity.

- Observation: Focused test session61437 terminal exit1:metadata2 tests pass;existing repeated-sublist transport test fails because it expects every counted implicit restart to gain an explicit5. Actual same-level reopened sublists now retain no direct start while restarttrue,matching compiled native split branches.
  Impact: This is the documented former export limitation assertion becoming stale after the approved correction;complete verification is still pending.
  Resolution: Persist active artifacts,replace only the former bounded projection assertion with source-derived explicit per-fixture reopen gains/retention and exact body item-start checks. Add independent genuine root/open/decreasing/re-entry/header/default/zero cases. Keep prior DONE task artifacts immutable and all mandatory gates unchanged.

- Observation: The existing-test edit script asserted a six-space marker while the source uses eight spaces;the Python assertion failed before any edit. A following formatter returned0,so the shell terminal code alone masked that failure.
  Impact: The stale test is unchanged;no claimed passing test or source mutation resulted from the failed edit.
  Resolution: Inspect exact source indentation and apply a bounded structural replacement. Keep subsequent dependent commands conditional on actual success and inspect each tool result.

- Observation: Focused genuine ODT session84490 passed all52 package scenarios. The first provenance check failed ENOENT because new evidence referenced xmloff/inc/XMLTextNumRuleInfo.hxx; the actual pinned header is xmloff/source/text/XMLTextNumRuleInfo.hxx. An initial documentation search also used nonexistent docs/writer-odt-format.md; bounded rg --files located docs/program/writer-odt-format.md.
  Impact: Runtime tests pass, but the evidence path must be corrected before full verification. No validator or gate change is required.
  Resolution: Use the actual source/text header and its inline Reset marker, repeat focused provenance/parity checks, retain the failed log and the bounded native scope.

- Observation: Focused lint session11915 exited1 for three prohibited non-null assertions in the new test; typecheck session31393 and parity CLI session18298 exited0. The compact parity note initially queried the top-level semanticViolationCount and printed None; this field belongs to runtime.
  Impact: No runtime failure or parity promotion; test code and compact evidence require correction before full verification.
  Resolution: Replace non-null assertions with explicit missing-fixture guards; retain unchanged lint rules. Correct the compact note to report only the observed exit0, and retain runtime semantic totals from the full verification output.
