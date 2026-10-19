---
id: "202610191146-5W55E9"
title: "Implement original single-byte Unicode-to-text conversion and undefined-character contracts"
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
  updated_at: "2026-10-19T11:46:43.688Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T12:02:59.844Z"
  updated_by: "CODER"
  note: "Whole original reverse converter and real undefined/classifier dependencies ported;genuine native normal/sanitized outputs agree.21files58related cases and111files299Calc cases pass with strict raw100 S/B/F/L;one source-proven unreachable guard annotation disclosed.26intentional paths,all declared gates pass. Native findings CALC192/193 preserved. Next work prioritizes supported UI actions."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original whole reverse converter and real undefined/classifier dependencies with differential native evidence in calc only."
events:
  -
    type: "status"
    at: "2026-10-19T11:47:02.873Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original whole reverse converter and real undefined/classifier dependencies with differential native evidence in calc only."
  -
    type: "verify"
    at: "2026-10-19T12:02:59.844Z"
    author: "CODER"
    state: "ok"
    note: "Whole original reverse converter and real undefined/classifier dependencies ported;genuine native normal/sanitized outputs agree.21files58related cases and111files299Calc cases pass with strict raw100 S/B/F/L;one source-proven unreachable guard annotation disclosed.26intentional paths,all declared gates pass. Native findings CALC192/193 preserved. Next work prioritizes supported UI actions."
doc_version: 3
doc_updated_at: "2026-10-19T12:02:59.921Z"
doc_updated_by: "CODER"
description: "Task32 of approved Calc goal:complete original convertsimple Unicode-to-byte responsibility needed by genuine converter descriptors and downstream OUString/font attributes. Port full native reverse lookup/replacement tables/binary searches,convertUnicodeToChar,whole handleUndefinedUnicodeToTextChar plus private helpers,actual unichars predicates and Unicode-to-text flags. Keep original ordering,UTF16 pointer consumption,undefined/private/capacity behavior and suspicious table contents. Reuse existing byte data/character predicates,typed borrowed buffers and scalar pointer-output cells;no host codec,partial reverse stub or fabricated registry. Genuine unchanged native69normal+69ASanUBSan dependency graph differential observations;entire changed/new owners and wholeCalc raw100,related RTL/VCL tests;types/build/static/style/docs/tree/provenance/scoped inventories/doctor/routing. Log new upstream suspicions while preserving behavior. Up to35non-task paths including source/tests/native evidence and truthful registry evidence. Onlycalc/offline/no merge. Lastfull30,next40."
sections:
  Summary: |-
    Implement original single-byte Unicode-to-text conversion and undefined-character contracts

    Task32 of approved Calc goal:complete original convertsimple Unicode-to-byte responsibility needed by genuine converter descriptors and downstream OUString/font attributes. Port full native reverse lookup/replacement tables/binary searches,convertUnicodeToChar,whole handleUndefinedUnicodeToTextChar plus private helpers,actual unichars predicates and Unicode-to-text flags. Keep original ordering,UTF16 pointer consumption,undefined/private/capacity behavior and suspicious table contents. Reuse existing byte data/character predicates,typed borrowed buffers and scalar pointer-output cells;no host codec,partial reverse stub or fabricated registry. Genuine unchanged native69normal+69ASanUBSan dependency graph differential observations;entire changed/new owners and wholeCalc raw100,related RTL/VCL tests;types/build/static/style/docs/tree/provenance/scoped inventories/doctor/routing. Log new upstream suspicions while preserving behavior. Up to35non-task paths including source/tests/native evidence and truthful registry evidence. Onlycalc/offline/no merge. Lastfull30,next40.
  Scope: |-
    - In scope: Task32 of approved Calc goal:complete original convertsimple Unicode-to-byte responsibility needed by genuine converter descriptors and downstream OUString/font attributes. Port full native reverse lookup/replacement tables/binary searches,convertUnicodeToChar,whole handleUndefinedUnicodeToTextChar plus private helpers,actual unichars predicates and Unicode-to-text flags. Keep original ordering,UTF16 pointer consumption,undefined/private/capacity behavior and suspicious table contents. Reuse existing byte data/character predicates,typed borrowed buffers and scalar pointer-output cells;no host codec,partial reverse stub or fabricated registry. Genuine unchanged native69normal+69ASanUBSan dependency graph differential observations;entire changed/new owners and wholeCalc raw100,related RTL/VCL tests;types/build/static/style/docs/tree/provenance/scoped inventories/doctor/routing. Log new upstream suspicions while preserving behavior. Up to35non-task paths including source/tests/native evidence and truthful registry evidence. Onlycalc/offline/no merge. Lastfull30,next40.
    - Out of scope: unrelated refactors not required for "Implement original single-byte Unicode-to-text conversion and undefined-character contracts".
  Plan: "Implement complete original convertUnicodeToChar and its actual dependencies in source-shaped sal/textenc owners:all native reverse helper/search tables,unichars predicates,undefined character handling,flags and declaration facades. Preserve suspicious table order/values and capacity/consumption behavior. Use existing typed borrowed storage and scalar cells;do not add host codecs,stub procedures or synthetic registry. Extend real cached native graph observation with unchanged original69normal+69ASanUBSan units and bounded initialized sentinel buffers. Native full-BMP and flag/surrogate/replacement/capacity cases must cover actual branches,including original additional descriptors. Up to35non-task paths source/tests/probe/capture/registry/ledger. Entire changed/new owners+wholeCalc100 and related RTL/VCL tests;declared deterministic gates. Onlycalc/offline,no merge. Existing user approval covers this safe local dependency leaf;full registry/byte constructors/VCL/item/pool/UI remain subsequent work. Full regression next40."
  Verify Steps: "Audit complete original convertUnicodeToChar,private reverse lookup and replacement searches/tables,whole undefined handler and classifiers;compare unchanged genuine native original69normal+69ASanUBSan graph observations and authenticate source/object/driver/output hashes. Exercise all BMP code units with original core descriptors;real two-byte descriptor;undefined/invalid/private/ignore/FLUSH flags,high/low surrogate consumption,end-source shortages,exact/insufficient capacities,sentinel mutation and lack of terminator. Native bounded witnesses for new source suspicions;append ledger without fixing behavior. Complete changed/new source owner raw100 S/B/F/L,related original byte conversion/character/RTL/VCL cases and wholeCalc100. Types/build/static/changedstyle/docs/size/tree/deps/provenance/resources/scopedshared+Calc inventories/doctor/routing. No new runtime stubs/threshold/validator changes. Native invalid physical storage cannot be certified by typed arrays;document genuine unsafe paths and preserve source ordering. Lastfull30,next40."
  Verification: |-
    - Command: node scripts/rtl-singlebyte-reverse-native-probe.mjs --write;node scripts/rtl-singlebyte-reverse-native-probe.mjs --check. Result: pass. Evidence: evidence/native-write-contract.log,native-check.log,native-audit.json;committed native-singlebyte-reverse-cases.json. Scope:346pinned original source hashes,138verified immutable objects(69normal+69ASanUBSan),five modes,ten native caller executions with exit0/no signal and identical original bytes. Actual55registered descriptors,564697conversion observations,1980independent undefined-handler states,1114117classifier points and28macro constants. All core BMP values,actual MS1258 two-byte mappings,flags/surrogate consumption/private mappings/capacities and initialized sentinel bytes are covered. Twelve observations use a valid caller-owned ISO88591copy with a second-range zero sentinel;this is an explicit contract test input,not a registered encoding or production codec provider. Full physical underallocation/native ABI is not certified.

    - Command: npm run test:coverage -- --coverage.include=src/sal/textenc/convertsimple.ts --coverage.include=src/sal/textenc/convertsimple.hxx.ts --coverage.include=src/sal/textenc/unichars.ts --coverage.include=src/sal/textenc/unichars.hxx.ts --coverage.include=src/sal/textenc/handleundefinedunicodetotextchar.ts --coverage.include=src/sal/textenc/handleundefinedunicodetotextchar.hxx.ts --coverage.include=src/sal/inc/rtl/textcvt.h.ts --coverage.reportsDirectory=coverage/task32-reverse src/sal/textenc/singlebyte.test.ts src/sal/textenc/singlebyte-reverse.test.ts src/sal/inc/rtl/character.test.ts src/sal/rtl src/vcl/source/font/FontVariation.test.ts (apps/office). Result: pass. Evidence: evidence/related-coverage.log,related-coverage-final.json,related-coverage-summary.json;21files58cases,35.70s. Scope:all five executable changed/new owners and two pure reexport facades. Raw S249/249 B170/170 F12/12 L232/232,all100;no threshold/validator change. Exactly one source-proven unreachable guard is annotated:every one of the48fixed original replacement strings consists of ASCII units,for which the original lookup unconditionally returns1 before consulting any descriptor;its zero-return arm cannot execute. Original guard/body remain. evidence/unreachable-replacement-proof.json preserves all48source aggregates and the original source hash. Initial unannotated evidence remains in reverse-coverage.log(197/199S,170/172B) and clearly separates the reachable second-range zero case from the unreachable guard. Do not interpret coverage as proof of native invalid-memory behavior.

    - Command: npm run test:coverage:calc (apps/office). Result: pass. Evidence: evidence/calc-coverage.log,calc-coverage-summary.json;111files299cases,157.19s. Scope:wholeCalc raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,all100,zero skipped counters.

    - Command: npm run typecheck;npm run build;node scripts/check-static-build.mjs;changed-path Prettier/eslint;npm run check:docs/check:file-size/check:source-tree/check:dependencies/check:source-provenance;Calc resources;scoped shared+Calc inventories;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check. Result: pass. Evidence:evidence/types-final.log,build.log,static.log,style-final.log,docs-final.log2330sources,size.log2333files,tree.log114required33retired,dependencies.log875runtime sources3768imports125edges,provenance-final.log876modules(752mapped106browser18infra),resources-calc.log,inventory-{shared,calc}.json eachsemanticViolationCount0,doctor.log,routing.log. Scope:26intentional non-task paths. Inventory original bytes preserved via gzip/base64+SHA256. Existing bundle/hook readiness advice remains;no global config/hook changes. Runtime hashes retained in verified-runtime-hashes.json. Browser UI behavior was not changed or claimed enabled by this kernel dependency leaf.

    - Command: native bounded source-suspicion comparison. Result: pass. Evidence:evidence/native-suspect-witnesses.json authenticated against actual final capture;CALC192and193 appended to canonical docs/program/calc-upstream-suspected-issues.md. Scope:out-of-order0AE0replacement entry makes several intended replacements unreachable;private mapping can write one logical byte with zero advertised capacity. Original data/order/writes/counters remain;bounded experiments provide initialized larger physical backing and do not claim an ASan allocation overflow. No upstream fixes introduced.

    Initial failures remain recorded:the first observation caller missed const on a pointer-to-pointer argument;only the caller declaration was corrected. The forward header test originally treated its23macros as the entire header;both directions now independently assert exhaustive names against genuine native captures(23forward+28reverse). The initial provenance facade needed real independent declaration/type evidence,which was added without changing validation. A changed-path formatter command accidentally removed the first path character while trimming porcelain output;its diagnostic failed on the nonexistent path,the corrected actual26path check/lint passes. These diagnostics did not change production semantics or acceptance thresholds.

    Task32. Last full30,next40. Full registry/factories,OUString byte construction,VCL font variation serialization,default item/pool integration and wider Calc core/UI remain pending. User steering now prioritizes every UI action supported by the current kernel,especially fonts/styles/formatting. Further core changes must be tied to a concrete UI action;do not continue unrelated codec preparation. Only calc checkout/branch,offline,no merge or publication.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T12:02:59.844Z — VERIFY — ok

    By: CODER

    Note: Whole original reverse converter and real undefined/classifier dependencies ported;genuine native normal/sanitized outputs agree.21files58related cases and111files299Calc cases pass with strict raw100 S/B/F/L;one source-proven unreachable guard annotation disclosed.26intentional paths,all declared gates pass. Native findings CALC192/193 preserved. Next work prioritizes supported UI actions.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T12:02:58.802Z, excerpt_hash=sha256:b3cc4fd040effe3cdecb693e23ba3b95090eb718c88b180678abfcfb700f708f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191146-5W55E9/blueprint/resolved-snapshot.json
    - old_digest: 0ce6a6d96cd406d69095232fd9c21c9c6f7f1089c622ff8223afa074cb10aaf1
    - current_digest: 0ce6a6d96cd406d69095232fd9c21c9c6f7f1089c622ff8223afa074cb10aaf1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191146-5W55E9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610191146-5W55E9 -m 🧩 5W55E9 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task reverse conversion/dependency/test/probe/evidence/registry/ledger changes;preserve original forward conversion,shared menus and unrelated tasks. No reset,network,branch change or merge."
  Findings: "CALC192and193 record genuine source/native replacement-table and private-capacity concerns without fixing them. One original defensive zero-result guard in replacement-string handling is source-proven unreachable:all48fixed replacement strings are ASCII and source lookup always returns1. It is preserved with one explicit instrumentation annotation;all remaining raw counters covered100. Reachable second-range zero handling uses a valid caller-owned native descriptor input,not a runtime registry. User steering prioritizes all UI actions already supported by the current kernel,especially font/style/formatting integration;further core changes must serve a concrete visible action. Registry/OUString/VCL/pools remain incomplete;do not promote whole-goal parity. Lastfull30,next40."
id_source: "generated"
---
## Summary

Implement original single-byte Unicode-to-text conversion and undefined-character contracts

Task32 of approved Calc goal:complete original convertsimple Unicode-to-byte responsibility needed by genuine converter descriptors and downstream OUString/font attributes. Port full native reverse lookup/replacement tables/binary searches,convertUnicodeToChar,whole handleUndefinedUnicodeToTextChar plus private helpers,actual unichars predicates and Unicode-to-text flags. Keep original ordering,UTF16 pointer consumption,undefined/private/capacity behavior and suspicious table contents. Reuse existing byte data/character predicates,typed borrowed buffers and scalar pointer-output cells;no host codec,partial reverse stub or fabricated registry. Genuine unchanged native69normal+69ASanUBSan dependency graph differential observations;entire changed/new owners and wholeCalc raw100,related RTL/VCL tests;types/build/static/style/docs/tree/provenance/scoped inventories/doctor/routing. Log new upstream suspicions while preserving behavior. Up to35non-task paths including source/tests/native evidence and truthful registry evidence. Onlycalc/offline/no merge. Lastfull30,next40.

## Scope

- In scope: Task32 of approved Calc goal:complete original convertsimple Unicode-to-byte responsibility needed by genuine converter descriptors and downstream OUString/font attributes. Port full native reverse lookup/replacement tables/binary searches,convertUnicodeToChar,whole handleUndefinedUnicodeToTextChar plus private helpers,actual unichars predicates and Unicode-to-text flags. Keep original ordering,UTF16 pointer consumption,undefined/private/capacity behavior and suspicious table contents. Reuse existing byte data/character predicates,typed borrowed buffers and scalar pointer-output cells;no host codec,partial reverse stub or fabricated registry. Genuine unchanged native69normal+69ASanUBSan dependency graph differential observations;entire changed/new owners and wholeCalc raw100,related RTL/VCL tests;types/build/static/style/docs/tree/provenance/scoped inventories/doctor/routing. Log new upstream suspicions while preserving behavior. Up to35non-task paths including source/tests/native evidence and truthful registry evidence. Onlycalc/offline/no merge. Lastfull30,next40.
- Out of scope: unrelated refactors not required for "Implement original single-byte Unicode-to-text conversion and undefined-character contracts".

## Plan

Implement complete original convertUnicodeToChar and its actual dependencies in source-shaped sal/textenc owners:all native reverse helper/search tables,unichars predicates,undefined character handling,flags and declaration facades. Preserve suspicious table order/values and capacity/consumption behavior. Use existing typed borrowed storage and scalar cells;do not add host codecs,stub procedures or synthetic registry. Extend real cached native graph observation with unchanged original69normal+69ASanUBSan units and bounded initialized sentinel buffers. Native full-BMP and flag/surrogate/replacement/capacity cases must cover actual branches,including original additional descriptors. Up to35non-task paths source/tests/probe/capture/registry/ledger. Entire changed/new owners+wholeCalc100 and related RTL/VCL tests;declared deterministic gates. Onlycalc/offline,no merge. Existing user approval covers this safe local dependency leaf;full registry/byte constructors/VCL/item/pool/UI remain subsequent work. Full regression next40.

## Verify Steps

Audit complete original convertUnicodeToChar,private reverse lookup and replacement searches/tables,whole undefined handler and classifiers;compare unchanged genuine native original69normal+69ASanUBSan graph observations and authenticate source/object/driver/output hashes. Exercise all BMP code units with original core descriptors;real two-byte descriptor;undefined/invalid/private/ignore/FLUSH flags,high/low surrogate consumption,end-source shortages,exact/insufficient capacities,sentinel mutation and lack of terminator. Native bounded witnesses for new source suspicions;append ledger without fixing behavior. Complete changed/new source owner raw100 S/B/F/L,related original byte conversion/character/RTL/VCL cases and wholeCalc100. Types/build/static/changedstyle/docs/size/tree/deps/provenance/resources/scopedshared+Calc inventories/doctor/routing. No new runtime stubs/threshold/validator changes. Native invalid physical storage cannot be certified by typed arrays;document genuine unsafe paths and preserve source ordering. Lastfull30,next40.

## Verification

- Command: node scripts/rtl-singlebyte-reverse-native-probe.mjs --write;node scripts/rtl-singlebyte-reverse-native-probe.mjs --check. Result: pass. Evidence: evidence/native-write-contract.log,native-check.log,native-audit.json;committed native-singlebyte-reverse-cases.json. Scope:346pinned original source hashes,138verified immutable objects(69normal+69ASanUBSan),five modes,ten native caller executions with exit0/no signal and identical original bytes. Actual55registered descriptors,564697conversion observations,1980independent undefined-handler states,1114117classifier points and28macro constants. All core BMP values,actual MS1258 two-byte mappings,flags/surrogate consumption/private mappings/capacities and initialized sentinel bytes are covered. Twelve observations use a valid caller-owned ISO88591copy with a second-range zero sentinel;this is an explicit contract test input,not a registered encoding or production codec provider. Full physical underallocation/native ABI is not certified.

- Command: npm run test:coverage -- --coverage.include=src/sal/textenc/convertsimple.ts --coverage.include=src/sal/textenc/convertsimple.hxx.ts --coverage.include=src/sal/textenc/unichars.ts --coverage.include=src/sal/textenc/unichars.hxx.ts --coverage.include=src/sal/textenc/handleundefinedunicodetotextchar.ts --coverage.include=src/sal/textenc/handleundefinedunicodetotextchar.hxx.ts --coverage.include=src/sal/inc/rtl/textcvt.h.ts --coverage.reportsDirectory=coverage/task32-reverse src/sal/textenc/singlebyte.test.ts src/sal/textenc/singlebyte-reverse.test.ts src/sal/inc/rtl/character.test.ts src/sal/rtl src/vcl/source/font/FontVariation.test.ts (apps/office). Result: pass. Evidence: evidence/related-coverage.log,related-coverage-final.json,related-coverage-summary.json;21files58cases,35.70s. Scope:all five executable changed/new owners and two pure reexport facades. Raw S249/249 B170/170 F12/12 L232/232,all100;no threshold/validator change. Exactly one source-proven unreachable guard is annotated:every one of the48fixed original replacement strings consists of ASCII units,for which the original lookup unconditionally returns1 before consulting any descriptor;its zero-return arm cannot execute. Original guard/body remain. evidence/unreachable-replacement-proof.json preserves all48source aggregates and the original source hash. Initial unannotated evidence remains in reverse-coverage.log(197/199S,170/172B) and clearly separates the reachable second-range zero case from the unreachable guard. Do not interpret coverage as proof of native invalid-memory behavior.

- Command: npm run test:coverage:calc (apps/office). Result: pass. Evidence: evidence/calc-coverage.log,calc-coverage-summary.json;111files299cases,157.19s. Scope:wholeCalc raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,all100,zero skipped counters.

- Command: npm run typecheck;npm run build;node scripts/check-static-build.mjs;changed-path Prettier/eslint;npm run check:docs/check:file-size/check:source-tree/check:dependencies/check:source-provenance;Calc resources;scoped shared+Calc inventories;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check. Result: pass. Evidence:evidence/types-final.log,build.log,static.log,style-final.log,docs-final.log2330sources,size.log2333files,tree.log114required33retired,dependencies.log875runtime sources3768imports125edges,provenance-final.log876modules(752mapped106browser18infra),resources-calc.log,inventory-{shared,calc}.json eachsemanticViolationCount0,doctor.log,routing.log. Scope:26intentional non-task paths. Inventory original bytes preserved via gzip/base64+SHA256. Existing bundle/hook readiness advice remains;no global config/hook changes. Runtime hashes retained in verified-runtime-hashes.json. Browser UI behavior was not changed or claimed enabled by this kernel dependency leaf.

- Command: native bounded source-suspicion comparison. Result: pass. Evidence:evidence/native-suspect-witnesses.json authenticated against actual final capture;CALC192and193 appended to canonical docs/program/calc-upstream-suspected-issues.md. Scope:out-of-order0AE0replacement entry makes several intended replacements unreachable;private mapping can write one logical byte with zero advertised capacity. Original data/order/writes/counters remain;bounded experiments provide initialized larger physical backing and do not claim an ASan allocation overflow. No upstream fixes introduced.

Initial failures remain recorded:the first observation caller missed const on a pointer-to-pointer argument;only the caller declaration was corrected. The forward header test originally treated its23macros as the entire header;both directions now independently assert exhaustive names against genuine native captures(23forward+28reverse). The initial provenance facade needed real independent declaration/type evidence,which was added without changing validation. A changed-path formatter command accidentally removed the first path character while trimming porcelain output;its diagnostic failed on the nonexistent path,the corrected actual26path check/lint passes. These diagnostics did not change production semantics or acceptance thresholds.

Task32. Last full30,next40. Full registry/factories,OUString byte construction,VCL font variation serialization,default item/pool integration and wider Calc core/UI remain pending. User steering now prioritizes every UI action supported by the current kernel,especially fonts/styles/formatting. Further core changes must be tied to a concrete UI action;do not continue unrelated codec preparation. Only calc checkout/branch,offline,no merge or publication.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T12:02:59.844Z — VERIFY — ok

By: CODER

Note: Whole original reverse converter and real undefined/classifier dependencies ported;genuine native normal/sanitized outputs agree.21files58related cases and111files299Calc cases pass with strict raw100 S/B/F/L;one source-proven unreachable guard annotation disclosed.26intentional paths,all declared gates pass. Native findings CALC192/193 preserved. Next work prioritizes supported UI actions.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T12:02:58.802Z, excerpt_hash=sha256:b3cc4fd040effe3cdecb693e23ba3b95090eb718c88b180678abfcfb700f708f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191146-5W55E9/blueprint/resolved-snapshot.json
- old_digest: 0ce6a6d96cd406d69095232fd9c21c9c6f7f1089c622ff8223afa074cb10aaf1
- current_digest: 0ce6a6d96cd406d69095232fd9c21c9c6f7f1089c622ff8223afa074cb10aaf1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191146-5W55E9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610191146-5W55E9 -m 🧩 5W55E9 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task reverse conversion/dependency/test/probe/evidence/registry/ledger changes;preserve original forward conversion,shared menus and unrelated tasks. No reset,network,branch change or merge.

## Findings

CALC192and193 record genuine source/native replacement-table and private-capacity concerns without fixing them. One original defensive zero-result guard in replacement-string handling is source-proven unreachable:all48fixed replacement strings are ASCII and source lookup always returns1. It is preserved with one explicit instrumentation annotation;all remaining raw counters covered100. Reachable second-range zero handling uses a valid caller-owned native descriptor input,not a runtime registry. User steering prioritizes all UI actions already supported by the current kernel,especially font/style/formatting integration;further core changes must serve a concrete visible action. Registry/OUString/VCL/pools remain incomplete;do not promote whole-goal parity. Lastfull30,next40.
