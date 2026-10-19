---
id: "202610190012-CMHQFZ"
title: "Implement native OUStringBuffer ownership and construction contracts"
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
  - "Genuine full source-linked normal+ASanUBSan OUStringBuffer observations,checked assertions and bounded length/overflow conditions;entire new buffer/stringutils and touched OUString/macro scopes raw100 S/B/F/L plus related SAL;wholeCalc raw100. Types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing. Next full regression30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T00:12:45.111Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T00:24:26.543Z"
  updated_by: "CODER"
  note: "Original fundamental OUStringBuffer and shared stringutils owners match2119genuine normal/ASanUBSan observations and11source assertions;real concat overflow and initialized setLength semantics verified. Entire changed scope/raw100 S265 B162 F71 L235,wholeCalc299/raw100 and all declared gates pass.18paths,goalactive,nextfull30."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-19T00:25:28.418Z"
  updated_by: "EVALUATOR"
  note: "Fundamental OUStringBuffer construction,mutation and lifetime use actual SAL owners and meet approved native bounded contracts with100percent complete changed-owner and Calc coverage."
  evaluated_sha: "539824172157f9fee0b046069fcf0b297d2e03b9"
  blueprint_digest: "3de1f16be7c602aa35dc5d41a617330aa9b385cda15aa46e8f597b0cb2c736e9"
  evidence_refs:
    - ".agentplane/tasks/202610190012-CMHQFZ/README.md"
    - ".agentplane/tasks/202610190012-CMHQFZ/quality/20261019-002528418-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610190012-CMHQFZ/quality/20261019-002528418-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610190012-CMHQFZ/quality/20261019-002528418-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610190012-CMHQFZ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610190012-CMHQFZ/verification.md"
    - ".agentplane/tasks/202610190012-CMHQFZ/native-build-summary.json"
    - ".agentplane/tasks/202610190012-CMHQFZ/coverage-summary.json"
  findings:
    - "Canonical317line buffer owner and original stringutils helpers preserve native capacities,copy/self-copy,move/self-move,borrowed addresses and units,scalar overload typing,real concat insertion,copy versus no-acquire ownership transfer and destructor. OUString literal validation reuses the actual shared trait with unchanged ownership/error contracts. No JS string builder or synthetic pool/provider."
    - "2119original header observation records and11assertions agree under genuine complete69normal+69ASanUBSan SAL/CPPU graphs,346source hashes and138actual object hashes. Real concat overflow uses128valid views over32MiB backing;only initialized native storage is observed and source setLength zero-fill comment is not promoted into invented behavior."
    - "WholeCalc299/raw100 andrelated21files57cases/raw100 S265 B162 F71 L235 pass with old genuine SAL/SVL/CPPU fixtures. Types/build/static/style/docs/size/tree/dependency/provenance/scopedinventories/doctor/routing pass.18intentional non-task paths in clean implementation539824172157;no validators,thresholds,policy or other checkouts changed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start:implement real OUStringBuffer lifetime/construction/mutation bindings over actual C ownership and verify genuine initialized native states."
events:
  -
    type: "status"
    at: "2026-10-19T00:12:46.280Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement real OUStringBuffer lifetime/construction/mutation bindings over actual C ownership and verify genuine initialized native states."
  -
    type: "verify"
    at: "2026-10-19T00:24:26.543Z"
    author: "CODER"
    state: "ok"
    note: "Original fundamental OUStringBuffer and shared stringutils owners match2119genuine normal/ASanUBSan observations and11source assertions;real concat overflow and initialized setLength semantics verified. Entire changed scope/raw100 S265 B162 F71 L235,wholeCalc299/raw100 and all declared gates pass.18paths,goalactive,nextfull30."
doc_version: 3
doc_updated_at: "2026-10-19T00:24:26.595Z"
doc_updated_by: "CODER"
description: "Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge."
sections:
  Summary: |-
    Implement native OUStringBuffer ownership and construction contracts

    Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.
  Scope: |-
    - In scope: Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.
    - Out of scope: unrelated refactors not required for "Implement native OUStringBuffer ownership and construction contracts".
  Plan: "Implement original fundamental OUStringBuffer responsibilities in canonical sal/inc/rtl/ustrbuf.ts over existing C/header/string/math owners. Preserve constructor capacities16/count+16/copy,copy versus transfer and actual address/refs,view/literal/concat/number overload dispatch,source checked UTF16 lengths,borrowed pointers,no-copy makeStringAndClear and explicit destructor. JS-erased float/int/char overloads use named type bindings;number append is native double. Include native length/literal helpers in stringutils,reuse OUString literal predicate,macroDouble25. Cover initialized setLength behavior without inventing zero fill or reading native uninitialized storage. True concat overflow uses repeated borrowed views over bounded real backing allocation,not fake providers. Genuine normal+ASanUBSan full cached SAL/CPPU graphs and assertions,entire changed modules raw100 plus wholeCalc100 and declared gates. Up to22non-task paths. No network/merge/UI fake providers;axis serializer awaits actual source encoding path. Existing broad user approval applies;nextfull30."
  Verify Steps: "Execute unchanged original OUStringBuffer headers and genuine full69normal+69ASanUBSan SAL/CPPU object graphs offline after pin/source/config/object hashes. Compare actual capacities,initialized logical units/terminator,refs,copy/borrow/transfer identity across constructors,assignment,self copy/move,reserve,known-length embeddedzero/surrogates,literals,concat/number,float/double/int/UTF32 insertion/removal/truncate,mutable access and destructor. Preserve source setLength writes;never treat uninitialized spare memory as zero-filled native output. Capture original assertions separately;check genuine length bounds and concat overflow before writes using real bounded allocation/repeated valid borrowed views. Entire new buffer/stringutils,touched OUString/macros raw100 S/B/F/L with related SAL/SVL source observations;wholeCalc100. Types/build/static/changedstyle/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing. Full regression cadence30."
  Verification: |-
    # Verification evidence

    - Command: node scripts/rtl-oustringbuffer-native-probe.mjs --write. Result: pass. Evidence: native-final.log,native-build-summary.json,native-oustringbuffer-cases.json. Scope:2119original returned observation records,11separate native assertion expressions,346original source hashes and138actual object hashes. Two observation-only callers link unchanged full69normal+69ASanUBSan SAL/CPPU graphs after checking prior pin/sources/config/generated header hashes and actual object bytes;objects are hashed again after execution. Normal/sanitized valid streams both exit0,match byte-for-byte and contain no sanitizer diagnostics. Original constructors,copy/self-copy,view/literal/number/concat assignment,insertion/append,float/double/int/char/UTF32,reserve,initialized length changes,mutable borrow,copy/transfer,move/self-move and destructor plus original length helpers and macro25 execute without body replacements or source stubs.

    - Command: native caller's original overflow and setLength observations. Result: pass in both graphs. Evidence: captured events40,41,48and native-build-summary.json. Scope: concat overflow is caught before mutation with128valid borrowed views over a single real32MiB initialized allocation,not fake counts or providers. Source setLength does not initialize all newly exposed cells despite its comment;only real initialized data is compared. Within-capacity spare cells are explicitly initialized before growth;the separate growing case uses exact new capacity/known terminator and fills unknown new payload before reading. No uninitialized native spare memory,undefined aliased insertion or oversized integer-format stack writes are treated as defined golden output. Managed typed-array initialization is not claimed as native zero-fill.

    - Command: npm run test:coverage -- --coverage.include=src/sal/inc/rtl/ustrbuf.ts --coverage.include=src/sal/inc/rtl/stringutils.ts --coverage.include=src/sal/inc/rtl/ustring.ts --coverage.include=src/sal/inc/rtl/string.h.ts --coverage.include=src/sal/inc/rtl/ustring.h.ts --coverage.reportsDirectory=coverage/task26-buffer-final src/sal/rtl src/sal/inc/rtl src/svl/source/misc/sharedstring.test.ts src/svl/source/misc/sharedstringpool.test.ts src/cppu/source/typelib/typelib-lookup.test.ts (apps/office). Result: pass. Evidence: related-final-coverage.log,21files57cases;raw S265/265 B162/162 F71/71 L235/235,100percent each,coverage-summary.json. Scope: entire new buffer/stringutils,touched complete OUString and literal macro owner;the pure header facade has no executable counters. Existing genuine SAL/SVL/CPPU ownership/float/format/literal/search observations remain passing. Initial profile correctly found missing original OUString assignment/default-margin cases and an existing lastIndexOfAsciiL fixture outside the first selection. Added genuine header assignment observations and replayed existing CPPU lookup tests;no mirror tests,coverage filters or thresholds were weakened.

    - Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,111files299cases;raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each. Scope: whole Calc. Shared literal constructor guard retains all old ownership and error expression contracts while using the actual common stringutils predicate.

    - Command: npm run typecheck; npm run build; node scripts/check-static-build.mjs. Result: pass. Evidence: typecheck.log,build.log,static.log. Scope: tool/app types,final app/worker bundle and static output. Existing large bundle warning remains.

    - Command: changed-path prettier --check and eslint; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance. Result: pass. Evidence: format-final.log,lint-final.log,docs.log2313authoredsources,dependencies.log865runtime sources/3753imports/125edges,size.log,tree.log114requiredpaths/33retiredroots,provenance.log866modules(743mapped/105browser/18infra). Scope:18intentional non-task paths. No policy,lint,architecture,coverage or source validators changed. Both new source owners use canonical upstream header paths;records remain mapped/foundation/unverified.

    - Command: npm run inventory:parity:shared; npm run inventory:parity:calc; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: inventory-shared.log,inventory-calc.log,doctor.log,routing.log. Scope: scoped inventories semanticViolationCount0;large successful outputs are compact summaries with original SHA256 and omitted-array lengths. Doctor reports OK with pre-existing hook-readiness warning;no hook mutation.

    Initial native observation caller compilation required correct rtl::libreoffice_internal qualification and a double initializer-list witness;only that caller was repaired. No native code/sanitizers were weakened. Initial lint/types/focused tests also pass;retained logs identify the intermediate profile gap rather than hide it.

    This is task26;the successful full run at20 keeps the next full regression at30. No network,other checkout,merge or broader parity/goal completion. Unported OUStringBuffer search/replace/substring,other scalar/template overloads,full ABI/alias/spare-memory behavior and actual VCL tag encoding/serializer,item/pool/model/UI integration remain pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T00:24:26.543Z — VERIFY — ok

    By: CODER

    Note: Original fundamental OUStringBuffer and shared stringutils owners match2119genuine normal/ASanUBSan observations and11source assertions;real concat overflow and initialized setLength semantics verified. Entire changed scope/raw100 S265 B162 F71 L235,wholeCalc299/raw100 and all declared gates pass.18paths,goalactive,nextfull30.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T00:24:26.062Z, excerpt_hash=sha256:b155444a0ff43fb86e34ca5f22e375e01e64096fc9af18a7d966106e21ea0409

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610190012-CMHQFZ/blueprint/resolved-snapshot.json
    - old_digest: 3de1f16be7c602aa35dc5d41a617330aa9b385cda15aa46e8f597b0cb2c736e9
    - current_digest: 3de1f16be7c602aa35dc5d41a617330aa9b385cda15aa46e8f597b0cb2c736e9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610190012-CMHQFZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610190012-CMHQFZ -m 🧩 CMHQFZ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task-owned implementation/registry/test commit;preserve unrelated tasks,user data,branch and checkout. No reset or merge."
  Findings: "Actual OUStringBuffer class now owns real existing C data/capacity slots;all copy/move/destructor,borrow/copy/transfer,UTF16/ASCII/concat/number and explicit erased scalar bindings preserve original calls/defaults. Source setLength writes differ from its zero-fill comment;keep body behavior and compare only initialized native storage. Real concat overflow needs no fake large provider:128valid borrowed views over one32MiB allocation trigger original checked bad_alloc. Native2119records/11assertions match both genuine full graphs;entire changed owners21files57cases/raw100 andwholeCalc299/raw100 pass. Initial coverage gaps were resolved with genuine OUString assignment/default helper observations and original CPPU lookup fixture,not rewritten expected output or guards.18intentional paths;VCL serializer waits for real tag encoding,overall goal active,nextfull30."
id_source: "generated"
---
## Summary

Implement native OUStringBuffer ownership and construction contracts

Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.

## Scope

- In scope: Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.
- Out of scope: unrelated refactors not required for "Implement native OUStringBuffer ownership and construction contracts".

## Plan

Implement original fundamental OUStringBuffer responsibilities in canonical sal/inc/rtl/ustrbuf.ts over existing C/header/string/math owners. Preserve constructor capacities16/count+16/copy,copy versus transfer and actual address/refs,view/literal/concat/number overload dispatch,source checked UTF16 lengths,borrowed pointers,no-copy makeStringAndClear and explicit destructor. JS-erased float/int/char overloads use named type bindings;number append is native double. Include native length/literal helpers in stringutils,reuse OUString literal predicate,macroDouble25. Cover initialized setLength behavior without inventing zero fill or reading native uninitialized storage. True concat overflow uses repeated borrowed views over bounded real backing allocation,not fake providers. Genuine normal+ASanUBSan full cached SAL/CPPU graphs and assertions,entire changed modules raw100 plus wholeCalc100 and declared gates. Up to22non-task paths. No network/merge/UI fake providers;axis serializer awaits actual source encoding path. Existing broad user approval applies;nextfull30.

## Verify Steps

Execute unchanged original OUStringBuffer headers and genuine full69normal+69ASanUBSan SAL/CPPU object graphs offline after pin/source/config/object hashes. Compare actual capacities,initialized logical units/terminator,refs,copy/borrow/transfer identity across constructors,assignment,self copy/move,reserve,known-length embeddedzero/surrogates,literals,concat/number,float/double/int/UTF32 insertion/removal/truncate,mutable access and destructor. Preserve source setLength writes;never treat uninitialized spare memory as zero-filled native output. Capture original assertions separately;check genuine length bounds and concat overflow before writes using real bounded allocation/repeated valid borrowed views. Entire new buffer/stringutils,touched OUString/macros raw100 S/B/F/L with related SAL/SVL source observations;wholeCalc100. Types/build/static/changedstyle/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing. Full regression cadence30.

## Verification

# Verification evidence

- Command: node scripts/rtl-oustringbuffer-native-probe.mjs --write. Result: pass. Evidence: native-final.log,native-build-summary.json,native-oustringbuffer-cases.json. Scope:2119original returned observation records,11separate native assertion expressions,346original source hashes and138actual object hashes. Two observation-only callers link unchanged full69normal+69ASanUBSan SAL/CPPU graphs after checking prior pin/sources/config/generated header hashes and actual object bytes;objects are hashed again after execution. Normal/sanitized valid streams both exit0,match byte-for-byte and contain no sanitizer diagnostics. Original constructors,copy/self-copy,view/literal/number/concat assignment,insertion/append,float/double/int/char/UTF32,reserve,initialized length changes,mutable borrow,copy/transfer,move/self-move and destructor plus original length helpers and macro25 execute without body replacements or source stubs.

- Command: native caller's original overflow and setLength observations. Result: pass in both graphs. Evidence: captured events40,41,48and native-build-summary.json. Scope: concat overflow is caught before mutation with128valid borrowed views over a single real32MiB initialized allocation,not fake counts or providers. Source setLength does not initialize all newly exposed cells despite its comment;only real initialized data is compared. Within-capacity spare cells are explicitly initialized before growth;the separate growing case uses exact new capacity/known terminator and fills unknown new payload before reading. No uninitialized native spare memory,undefined aliased insertion or oversized integer-format stack writes are treated as defined golden output. Managed typed-array initialization is not claimed as native zero-fill.

- Command: npm run test:coverage -- --coverage.include=src/sal/inc/rtl/ustrbuf.ts --coverage.include=src/sal/inc/rtl/stringutils.ts --coverage.include=src/sal/inc/rtl/ustring.ts --coverage.include=src/sal/inc/rtl/string.h.ts --coverage.include=src/sal/inc/rtl/ustring.h.ts --coverage.reportsDirectory=coverage/task26-buffer-final src/sal/rtl src/sal/inc/rtl src/svl/source/misc/sharedstring.test.ts src/svl/source/misc/sharedstringpool.test.ts src/cppu/source/typelib/typelib-lookup.test.ts (apps/office). Result: pass. Evidence: related-final-coverage.log,21files57cases;raw S265/265 B162/162 F71/71 L235/235,100percent each,coverage-summary.json. Scope: entire new buffer/stringutils,touched complete OUString and literal macro owner;the pure header facade has no executable counters. Existing genuine SAL/SVL/CPPU ownership/float/format/literal/search observations remain passing. Initial profile correctly found missing original OUString assignment/default-margin cases and an existing lastIndexOfAsciiL fixture outside the first selection. Added genuine header assignment observations and replayed existing CPPU lookup tests;no mirror tests,coverage filters or thresholds were weakened.

- Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,111files299cases;raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each. Scope: whole Calc. Shared literal constructor guard retains all old ownership and error expression contracts while using the actual common stringutils predicate.

- Command: npm run typecheck; npm run build; node scripts/check-static-build.mjs. Result: pass. Evidence: typecheck.log,build.log,static.log. Scope: tool/app types,final app/worker bundle and static output. Existing large bundle warning remains.

- Command: changed-path prettier --check and eslint; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance. Result: pass. Evidence: format-final.log,lint-final.log,docs.log2313authoredsources,dependencies.log865runtime sources/3753imports/125edges,size.log,tree.log114requiredpaths/33retiredroots,provenance.log866modules(743mapped/105browser/18infra). Scope:18intentional non-task paths. No policy,lint,architecture,coverage or source validators changed. Both new source owners use canonical upstream header paths;records remain mapped/foundation/unverified.

- Command: npm run inventory:parity:shared; npm run inventory:parity:calc; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: inventory-shared.log,inventory-calc.log,doctor.log,routing.log. Scope: scoped inventories semanticViolationCount0;large successful outputs are compact summaries with original SHA256 and omitted-array lengths. Doctor reports OK with pre-existing hook-readiness warning;no hook mutation.

Initial native observation caller compilation required correct rtl::libreoffice_internal qualification and a double initializer-list witness;only that caller was repaired. No native code/sanitizers were weakened. Initial lint/types/focused tests also pass;retained logs identify the intermediate profile gap rather than hide it.

This is task26;the successful full run at20 keeps the next full regression at30. No network,other checkout,merge or broader parity/goal completion. Unported OUStringBuffer search/replace/substring,other scalar/template overloads,full ABI/alias/spare-memory behavior and actual VCL tag encoding/serializer,item/pool/model/UI integration remain pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T00:24:26.543Z — VERIFY — ok

By: CODER

Note: Original fundamental OUStringBuffer and shared stringutils owners match2119genuine normal/ASanUBSan observations and11source assertions;real concat overflow and initialized setLength semantics verified. Entire changed scope/raw100 S265 B162 F71 L235,wholeCalc299/raw100 and all declared gates pass.18paths,goalactive,nextfull30.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T00:24:26.062Z, excerpt_hash=sha256:b155444a0ff43fb86e34ca5f22e375e01e64096fc9af18a7d966106e21ea0409

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610190012-CMHQFZ/blueprint/resolved-snapshot.json
- old_digest: 3de1f16be7c602aa35dc5d41a617330aa9b385cda15aa46e8f597b0cb2c736e9
- current_digest: 3de1f16be7c602aa35dc5d41a617330aa9b385cda15aa46e8f597b0cb2c736e9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610190012-CMHQFZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610190012-CMHQFZ -m 🧩 CMHQFZ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task-owned implementation/registry/test commit;preserve unrelated tasks,user data,branch and checkout. No reset or merge.

## Findings

Actual OUStringBuffer class now owns real existing C data/capacity slots;all copy/move/destructor,borrow/copy/transfer,UTF16/ASCII/concat/number and explicit erased scalar bindings preserve original calls/defaults. Source setLength writes differ from its zero-fill comment;keep body behavior and compare only initialized native storage. Real concat overflow needs no fake large provider:128valid borrowed views over one32MiB allocation trigger original checked bad_alloc. Native2119records/11assertions match both genuine full graphs;entire changed owners21files57cases/raw100 andwholeCalc299/raw100 pass. Initial coverage gaps were resolved with genuine OUString assignment/default helper observations and original CPPU lookup fixture,not rewritten expected output or guards.18intentional paths;VCL serializer waits for real tag encoding,overall goal active,nextfull30.
