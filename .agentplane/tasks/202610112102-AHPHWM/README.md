---
id: "202610112102-AHPHWM"
title: "Port original public Sequence value ownership and array contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T21:03:26.844Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T21:45:57.057Z"
  updated_by: "CODER"
  note: "Final Task49 owner verification after last task-doc update: implementation962725bbe6ac, separate quality pass20261011-214539251, native full streams/source hashes and genuine expected assertion aborts verified; source-absent Calc106/shared149 whole19/59 raw100;13 effective gates/11 metadata repeats/6 Prettier checks0; profile append-only, Writer untouched,next full51, goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-11T21:45:39.251Z"
  updated_by: "EVALUATOR"
  note: "Task49 accepted against reviewed implementation962725bbe6ac: genuine original public Sequence contracts, actual shared owners, native/source hashes and whole raw100 confirmed independently."
  evaluated_sha: "962725bbe6ac69f935bf34c82d950e6567a59b8c"
  blueprint_digest: "0cfe8b6b662a5587324efaf52f800e10672460d98cf9ff4d466b3586891023b0"
  evidence_refs:
    - ".agentplane/tasks/202610112102-AHPHWM/README.md"
    - ".agentplane/tasks/202610112102-AHPHWM/quality/20261011-214539251-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610112102-AHPHWM/quality/20261011-214539251-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610112102-AHPHWM/quality/20261011-214539251-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610112102-AHPHWM/blueprint/resolved-snapshot.json"
    - "output/playwright/task49-checks/evaluator-audit.json"
    - "output/playwright/uno-public-sequence-native/manifest.json"
    - "output/playwright/task49-checks/value-gates-final-manifest.json"
    - "output/playwright/task49-checks/prettier-final.log"
  findings:
    - "Inspected original Sequence.h/hxx and reviewed one-pointer implementation: copy/adopt remain cold, zero-count destruction alone initializes type, move assignment swaps, native rvalue construction copies, const reads avoid COW, failed C allocation preserves source failure behavior. Existing C/type/OSL/data/default owners reused without duplicate provider."
    - "Typed original SAL enum witness separates NULL adoption from integer length0 without changing numeric aliases or inferring pointer shape. Native NULL get-only observation and header-only guard diagnostics remain explicitly bounded; no destructor or absent-tail read is certified."
    - "Independently audited164 terminal commands:154 exit0 and10 exact genuine SIGABRT assertions;3 full native normal-ASan/UB streams equal fixture gzip/length/hash.370 complete source and13 generated hashes plus actual driver/configurations match. All raw S/F/B counters positive for whole19/59 owners; source links absent during tests/restored exactly; prior task48 shared test/whole-owner argv retained append-only."
    - "All13 effective scoped gates plus11 metadata repeats and6 source Prettier checks pass. Inventory broad parity/default/verified flags false and final facts precise; separate EVALUATOR phase performed without implementation edits."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: actual public Sequence lifecycle over shared C engine/type/OSL owners, explicit declared template/layout erasure without instance metadata or provider; full native/source-absent raw100 acceptance, no Writer repair, next full51."
events:
  -
    type: "status"
    at: "2026-10-11T21:04:46.094Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual public Sequence lifecycle over shared C engine/type/OSL owners, explicit declared template/layout erasure without instance metadata or provider; full native/source-absent raw100 acceptance, no Writer repair, next full51."
  -
    type: "verify"
    at: "2026-10-11T21:44:57.581Z"
    author: "CODER"
    state: "ok"
    note: "Task49 actual upstream Sequence contracts accepted: native write/check 370 sources/13 generated/164 terminal commands including10 expected assertions; all initialized normal-ASan/UB streams identical; source-absent Calc106/shared149 whole19/59 raw100;13 scoped gates and6 source formatting checks pass; Writer untouched,next full51. Separate quality follows implementation commit."
  -
    type: "verify"
    at: "2026-10-11T21:45:57.057Z"
    author: "CODER"
    state: "ok"
    note: "Final Task49 owner verification after last task-doc update: implementation962725bbe6ac, separate quality pass20261011-214539251, native full streams/source hashes and genuine expected assertion aborts verified; source-absent Calc106/shared149 whole19/59 raw100;13 effective gates/11 metadata repeats/6 Prettier checks0; profile append-only, Writer untouched,next full51, goal active."
doc_version: 3
doc_updated_at: "2026-10-11T21:45:57.111Z"
doc_updated_by: "CODER"
description: "Task49 UI-prerequisite public Sequence.h/hxx normal internal value owner over existing actual C sequence/type/OSL/genfunc/data owners; declared template/layout erasure, genuine full native acceptance, source-absent whole Calc/shared raw100, inventory and separate quality; last full41,next51."
sections:
  Summary: "Task49 ports the public Sequence value/lifecycle owner required by the real character-classification services and subsequent Calc cell/document/UI consumers. Task48 is DONE and clean; all work remains in calc checkout/branch. Whole Calc goal remains active; last full41,next full51."
  Scope: |-
    Add cppu/inc/com/sun/star/uno/Sequence.ts, adjacent complete replay test and genuine capture fixture, scripts/uno-public-sequence-native-probe.mjs. Reuse Sequence-type.ts original member-static type cells, real C sequence engine/count storage, OSL atomics, Type/UnoType/genfunc/equality/data/string/Any/Reference/RuntimeException. Extend those matched shared owners or test caller only if actual source contracts require it. Update Sequence runtime/provenance/capability registry and existing Sequence-type provenance if clarified, calc-core and Calc suspected-issues journal when needed. Task artifacts and ignored local evidence included.

    Explicit erased C++ specialization/sizeof(E) declarations bind one constructor family per declared element and size without instance type metadata, inferred JS value types, a sequence/type/default factory, extra data engine or new domain policy. Public instances retain one live pointer cell; actual C owners initialize/copy/free data. Array pointers and C++ references retain actual existing logical byte-offset storage/cells; paired end addresses represent original pointer addition, not a JS binary ABI. No temporary substitute Sequence, fake service or generated default policy.
  Plan: "Implement actual public Sequence lifecycle/array contracts over existing shared C/type/OSL owners; explicit compiler template/layout erasure only, genuine complete native/source-absent raw100 acceptance and inventory/quality, last full41,next51."
  Verify Steps: |-
    1. Source inspection verifies original constructor type initialization, copied/adopted pointer ownership, one pointer/static specialization boundary, actual OSL count and zero-count destruction, true swap move assignment, original COW/equality/resize/array behavior and compile-only restrictions. No independent data/type/default/provider or binary-layout claims.
    2. node scripts/uno-public-sequence-native-probe.mjs --write then --check:73 complete unchanged native TUs, genuine generated headers, every normal-ASan/UBSan accepted stream identical and every command terminal; full initialized streams/digests/count/metadata/callback values retained. Separately record genuine assertion aborts and bounded header guards without certifying invalid producers. No source edits, fake ownership/class/type or uninitialized bytes.
    3. All3 source links absent: Calc plus unchanged task48 related shared test/whole-owner profile expanded by Sequence tests/owner; every raw S/F/B counter positive and whole100; links restored exactly. No threshold/exclusion/assertion/timeout weakening, no Writer-only repair. Last full41,next51.
    4. npm run typecheck; exact changed-source ESLint/Prettier; npm run check:docs/check:file-size/check:dependencies/check:source-provenance/check:source-tree, inventory:parity:shared/inventory:parity:calc, four relevant tooling files, routing/doctor/diff all0; accurate runtime/provenance/capability and residual pointer/standard exception/resource/compile-only/consumer scope.
    5. Record Command/Result/Evidence/Scope for actual checks; intentional code commit; separate EVALUATOR raw/native/source audit tied to reviewed code; commit quality artifacts; final verify after last task docs and clean finish on calc. Goal active unless full objective actually completed.
  Verification: |-
    Command: node scripts/uno-public-sequence-native-probe.mjs --write; node scripts/uno-public-sequence-native-probe.mjs --check (final typed SAL/NULL overload caller).
    Result: pass.
    Evidence: native-write-final.log, native-check-final.log and output/playwright/uno-public-sequence-native/manifest.json. Native --write and final --check pass:73 full unchanged translation units,370 complete source hashes,13 generated headers and164 terminal commands (154 exit0;10 separately expected SIGABRT). Complete initialized normal-ASan/UBSan streams identical lifecycle239396/cold1004/guards896 bytes. All3 original source links absent: Calc106/24 and related shared149/44 tests pass with every raw S/F/B counter positive and whole S/B/F/L100 for19/59 executable owners (Calc2920/2055/474/2564; shared3952/2152/535/3539). Exact links restored. All13 effective scoped gates and6 exact authored-source Prettier checks pass.
    Scope: genuine unchanged original public Sequence lifecycle/cold/guard streams and separate native assertions; actual native C and C++ class defaults/owners, initialized scalar/class values, both handles, aliases/counts/type metadata/callbacks, const read/COW/write/equality/reallocation/ranges and reverse destruction. NULL adoption proves only selected construction/get. Header-only diagnostics avoid missing tails. No native source modification or fake provider.

    Command: node output/playwright/task49-checks/sequence-portable.mjs.
    Result: pass.
    Evidence: portable-final.log, value-calc-manifest.json, value-shared-manifest.json, value-coverage-audit.json and both portable logs. Actual all3 links absent together, exactly restored in finally. Exact task48 shared argv/test/whole-owner profile retained and expanded only by Sequence.test.ts and whole Sequence.ts. Every raw S/F/B counter positive; no threshold/exclusion/timeout/assertion weakening.
    Scope: Calc106/24 and shared149/44; whole19/59 owners raw100. Writer-only coverage not repaired; latest full41,next51.

    Command: node output/playwright/task49-checks/reference-gates.mjs; node output/playwright/task49-checks/reference-gates.mjs docs; npx prettier --check apps/office/src/cppu/inc/com/sun/star/uno/Sequence.ts apps/office/src/cppu/inc/com/sun/star/uno/Sequence-type.ts apps/office/src/sal/inc/types.ts apps/office/src/cppu/inc/com/sun/star/uno/Sequence.test.ts apps/office/src/test/uno-sequence-cpp-values.ts scripts/uno-public-sequence-native-probe.mjs.
    Result: pass.
    Evidence: value-gates-final-manifest.json, gates-final.log, gates-metadata-final.log, prettier-final.log.
    Scope: TS7, exact authored-source lint/format, docs, size, dependencies, source provenance/tree, shared/Calc inventories,34 tests in four relevant tooling files, routing, doctor,diff. Sequence and existing SAL runtime/provenance/capability records reflect typed constructor overload witness; broad parity/default/verified flags remain false.

    Command: ap commit 202610112102-AHPHWM (intentional implementation allowlist); python3 output/playwright/task49-checks/evaluator-audit.py; exact prior shared-profile argv audit; ap evaluator run 202610112102-AHPHWM --verdict pass.
    Result: pass.
    Evidence: implementation962725bbe6ac69f935bf34c82d950e6567a59b8c; output/playwright/task49-checks/evaluator-audit.json; .agentplane/tasks/202610112102-AHPHWM/quality/20261011-214539251-recovery-context/quality-report.json. Separate EVALUATOR phase verifies actual reviewed SHA, complete raw/native/source/driver/gates/cap flags and exactly preserved baseline profile append-only. Implementation unchanged during review.
    Scope: Task49 only on calc; final owner verify after this last documentation update, intentional quality artifacts and clean closure. Goal active; latest full41,next full51. No Writer-only repair, merge/publication/branch/worktree/delegation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T21:45:57.057Z — VERIFY — ok

    By: CODER

    Note: Final Task49 owner verification after last task-doc update: implementation962725bbe6ac, separate quality pass20261011-214539251, native full streams/source hashes and genuine expected assertion aborts verified; source-absent Calc106/shared149 whole19/59 raw100;13 effective gates/11 metadata repeats/6 Prettier checks0; profile append-only, Writer untouched,next full51, goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T21:45:54.936Z, excerpt_hash=sha256:7e4d6c119c79ce26d80839552f059e396059823eaeb7bd11575f4280d3b86293

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112102-AHPHWM/blueprint/resolved-snapshot.json
    - old_digest: 0cfe8b6b662a5587324efaf52f800e10672460d98cf9ff4d466b3586891023b0
    - current_digest: 0cfe8b6b662a5587324efaf52f800e10672460d98cf9ff4d466b3586891023b0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610112102-AHPHWM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610112102-AHPHWM --result verified-202610112102-AHPHWM --commit 962725bbe6ac69f935bf34c82d950e6567a59b8c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task49 intentional changes alone while preserving traceability; no history rewrite or merge."
  Findings: |-
    The real CharacterClassification implementations return Sequence<OUString> and accept Sequence<Any>; the public value owner is therefore a real service and Calc UI prerequisite. Existing C sequence/type/OSL/data/default owners are reused. A public instance owns one pointer cell; erased compiler E and sizeof(E) belong to the specialization constructor, never the instance. Array and reference expressions retain the existing actual logical byte-offset storage, without a physical JS ABI claim.

    Source fidelity: the original header declares no move constructor; native rvalue construction selects copy, and move assignment swaps both handles. The existing shared SAL enum needs a declared-type witness to distinguish (NULL, SAL_NO_ACQUIRE) adoption from (NULL, integer0) construction after JS overload erasure. Numeric SAL_NO_ACQUIRE remains zero. Native placement construction observes the adopted NULL field and cold metadata only; invoking its dereferencing destructor or other non-null methods is not certified. No pointer-shape inference or NULL normalization is retained.

    Bounded implementation corrections: the first native caller failed compilation because an observation implicitly narrowed unsigned size/pointer difference; explicit observer casts corrected the caller without changing upstream. Initial TS7 test imports/API alias and anonymous-class JSDoc errors were fixed. Source-provenance verification rejected a primary-header symbol absent there and then a basename-only symbol; real getArray/realloc header witnesses corrected the record, without weakening the validator. Fresh-module enum argument imports avoid stale object identity after vi.resetModules.

    Original assertions are independently observed as SIGABRT in native normal and ASan/UBSan runs; browser Error rejection remains explicit adaptation. Native bad_alloc at false C results maps to RangeError. Huge and negative header diagnostics inspect only initialized header fields and never absent tails; they do not certify valid ordinary producers. No uninitialized empty-tail bytes, invented C++ defaults, substituted owning objects, fake source/provider or private-access bypass.

    Remaining scope: external-only mutable iterators/index, ByteSequence bridge, ostream, physical pointers/layout/ABI/resource behavior, native const/compiler-only restrictions (including prohibited Sequence<bool>), arbitrary producer/alias/metadata safety, threads/shutdown/full consumer QA and subsequent service/CharClass/pool/Calc document/edit/view/UI. Broad parity/default/verified flags stay false. No new suspected upstream bug was found; no Calc journal entry is fabricated. Full41 is the latest full run and full51 remains next; Writer-only coverage is not repaired. No merge, publication, branch, worktree or delegated agent.
id_source: "generated"
---
## Summary

Task49 ports the public Sequence value/lifecycle owner required by the real character-classification services and subsequent Calc cell/document/UI consumers. Task48 is DONE and clean; all work remains in calc checkout/branch. Whole Calc goal remains active; last full41,next full51.

## Scope

Add cppu/inc/com/sun/star/uno/Sequence.ts, adjacent complete replay test and genuine capture fixture, scripts/uno-public-sequence-native-probe.mjs. Reuse Sequence-type.ts original member-static type cells, real C sequence engine/count storage, OSL atomics, Type/UnoType/genfunc/equality/data/string/Any/Reference/RuntimeException. Extend those matched shared owners or test caller only if actual source contracts require it. Update Sequence runtime/provenance/capability registry and existing Sequence-type provenance if clarified, calc-core and Calc suspected-issues journal when needed. Task artifacts and ignored local evidence included.

Explicit erased C++ specialization/sizeof(E) declarations bind one constructor family per declared element and size without instance type metadata, inferred JS value types, a sequence/type/default factory, extra data engine or new domain policy. Public instances retain one live pointer cell; actual C owners initialize/copy/free data. Array pointers and C++ references retain actual existing logical byte-offset storage/cells; paired end addresses represent original pointer addition, not a JS binary ABI. No temporary substitute Sequence, fake service or generated default policy.

## Plan

Implement actual public Sequence lifecycle/array contracts over existing shared C/type/OSL owners; explicit compiler template/layout erasure only, genuine complete native/source-absent raw100 acceptance and inventory/quality, last full41,next51.

## Verify Steps

1. Source inspection verifies original constructor type initialization, copied/adopted pointer ownership, one pointer/static specialization boundary, actual OSL count and zero-count destruction, true swap move assignment, original COW/equality/resize/array behavior and compile-only restrictions. No independent data/type/default/provider or binary-layout claims.
2. node scripts/uno-public-sequence-native-probe.mjs --write then --check:73 complete unchanged native TUs, genuine generated headers, every normal-ASan/UBSan accepted stream identical and every command terminal; full initialized streams/digests/count/metadata/callback values retained. Separately record genuine assertion aborts and bounded header guards without certifying invalid producers. No source edits, fake ownership/class/type or uninitialized bytes.
3. All3 source links absent: Calc plus unchanged task48 related shared test/whole-owner profile expanded by Sequence tests/owner; every raw S/F/B counter positive and whole100; links restored exactly. No threshold/exclusion/assertion/timeout weakening, no Writer-only repair. Last full41,next51.
4. npm run typecheck; exact changed-source ESLint/Prettier; npm run check:docs/check:file-size/check:dependencies/check:source-provenance/check:source-tree, inventory:parity:shared/inventory:parity:calc, four relevant tooling files, routing/doctor/diff all0; accurate runtime/provenance/capability and residual pointer/standard exception/resource/compile-only/consumer scope.
5. Record Command/Result/Evidence/Scope for actual checks; intentional code commit; separate EVALUATOR raw/native/source audit tied to reviewed code; commit quality artifacts; final verify after last task docs and clean finish on calc. Goal active unless full objective actually completed.

## Verification

Command: node scripts/uno-public-sequence-native-probe.mjs --write; node scripts/uno-public-sequence-native-probe.mjs --check (final typed SAL/NULL overload caller).
Result: pass.
Evidence: native-write-final.log, native-check-final.log and output/playwright/uno-public-sequence-native/manifest.json. Native --write and final --check pass:73 full unchanged translation units,370 complete source hashes,13 generated headers and164 terminal commands (154 exit0;10 separately expected SIGABRT). Complete initialized normal-ASan/UBSan streams identical lifecycle239396/cold1004/guards896 bytes. All3 original source links absent: Calc106/24 and related shared149/44 tests pass with every raw S/F/B counter positive and whole S/B/F/L100 for19/59 executable owners (Calc2920/2055/474/2564; shared3952/2152/535/3539). Exact links restored. All13 effective scoped gates and6 exact authored-source Prettier checks pass.
Scope: genuine unchanged original public Sequence lifecycle/cold/guard streams and separate native assertions; actual native C and C++ class defaults/owners, initialized scalar/class values, both handles, aliases/counts/type metadata/callbacks, const read/COW/write/equality/reallocation/ranges and reverse destruction. NULL adoption proves only selected construction/get. Header-only diagnostics avoid missing tails. No native source modification or fake provider.

Command: node output/playwright/task49-checks/sequence-portable.mjs.
Result: pass.
Evidence: portable-final.log, value-calc-manifest.json, value-shared-manifest.json, value-coverage-audit.json and both portable logs. Actual all3 links absent together, exactly restored in finally. Exact task48 shared argv/test/whole-owner profile retained and expanded only by Sequence.test.ts and whole Sequence.ts. Every raw S/F/B counter positive; no threshold/exclusion/timeout/assertion weakening.
Scope: Calc106/24 and shared149/44; whole19/59 owners raw100. Writer-only coverage not repaired; latest full41,next51.

Command: node output/playwright/task49-checks/reference-gates.mjs; node output/playwright/task49-checks/reference-gates.mjs docs; npx prettier --check apps/office/src/cppu/inc/com/sun/star/uno/Sequence.ts apps/office/src/cppu/inc/com/sun/star/uno/Sequence-type.ts apps/office/src/sal/inc/types.ts apps/office/src/cppu/inc/com/sun/star/uno/Sequence.test.ts apps/office/src/test/uno-sequence-cpp-values.ts scripts/uno-public-sequence-native-probe.mjs.
Result: pass.
Evidence: value-gates-final-manifest.json, gates-final.log, gates-metadata-final.log, prettier-final.log.
Scope: TS7, exact authored-source lint/format, docs, size, dependencies, source provenance/tree, shared/Calc inventories,34 tests in four relevant tooling files, routing, doctor,diff. Sequence and existing SAL runtime/provenance/capability records reflect typed constructor overload witness; broad parity/default/verified flags remain false.

Command: ap commit 202610112102-AHPHWM (intentional implementation allowlist); python3 output/playwright/task49-checks/evaluator-audit.py; exact prior shared-profile argv audit; ap evaluator run 202610112102-AHPHWM --verdict pass.
Result: pass.
Evidence: implementation962725bbe6ac69f935bf34c82d950e6567a59b8c; output/playwright/task49-checks/evaluator-audit.json; .agentplane/tasks/202610112102-AHPHWM/quality/20261011-214539251-recovery-context/quality-report.json. Separate EVALUATOR phase verifies actual reviewed SHA, complete raw/native/source/driver/gates/cap flags and exactly preserved baseline profile append-only. Implementation unchanged during review.
Scope: Task49 only on calc; final owner verify after this last documentation update, intentional quality artifacts and clean closure. Goal active; latest full41,next full51. No Writer-only repair, merge/publication/branch/worktree/delegation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T21:45:57.057Z — VERIFY — ok

By: CODER

Note: Final Task49 owner verification after last task-doc update: implementation962725bbe6ac, separate quality pass20261011-214539251, native full streams/source hashes and genuine expected assertion aborts verified; source-absent Calc106/shared149 whole19/59 raw100;13 effective gates/11 metadata repeats/6 Prettier checks0; profile append-only, Writer untouched,next full51, goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T21:45:54.936Z, excerpt_hash=sha256:7e4d6c119c79ce26d80839552f059e396059823eaeb7bd11575f4280d3b86293

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112102-AHPHWM/blueprint/resolved-snapshot.json
- old_digest: 0cfe8b6b662a5587324efaf52f800e10672460d98cf9ff4d466b3586891023b0
- current_digest: 0cfe8b6b662a5587324efaf52f800e10672460d98cf9ff4d466b3586891023b0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610112102-AHPHWM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610112102-AHPHWM --result verified-202610112102-AHPHWM --commit 962725bbe6ac69f935bf34c82d950e6567a59b8c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task49 intentional changes alone while preserving traceability; no history rewrite or merge.

## Findings

The real CharacterClassification implementations return Sequence<OUString> and accept Sequence<Any>; the public value owner is therefore a real service and Calc UI prerequisite. Existing C sequence/type/OSL/data/default owners are reused. A public instance owns one pointer cell; erased compiler E and sizeof(E) belong to the specialization constructor, never the instance. Array and reference expressions retain the existing actual logical byte-offset storage, without a physical JS ABI claim.

Source fidelity: the original header declares no move constructor; native rvalue construction selects copy, and move assignment swaps both handles. The existing shared SAL enum needs a declared-type witness to distinguish (NULL, SAL_NO_ACQUIRE) adoption from (NULL, integer0) construction after JS overload erasure. Numeric SAL_NO_ACQUIRE remains zero. Native placement construction observes the adopted NULL field and cold metadata only; invoking its dereferencing destructor or other non-null methods is not certified. No pointer-shape inference or NULL normalization is retained.

Bounded implementation corrections: the first native caller failed compilation because an observation implicitly narrowed unsigned size/pointer difference; explicit observer casts corrected the caller without changing upstream. Initial TS7 test imports/API alias and anonymous-class JSDoc errors were fixed. Source-provenance verification rejected a primary-header symbol absent there and then a basename-only symbol; real getArray/realloc header witnesses corrected the record, without weakening the validator. Fresh-module enum argument imports avoid stale object identity after vi.resetModules.

Original assertions are independently observed as SIGABRT in native normal and ASan/UBSan runs; browser Error rejection remains explicit adaptation. Native bad_alloc at false C results maps to RangeError. Huge and negative header diagnostics inspect only initialized header fields and never absent tails; they do not certify valid ordinary producers. No uninitialized empty-tail bytes, invented C++ defaults, substituted owning objects, fake source/provider or private-access bypass.

Remaining scope: external-only mutable iterators/index, ByteSequence bridge, ostream, physical pointers/layout/ABI/resource behavior, native const/compiler-only restrictions (including prohibited Sequence<bool>), arbitrary producer/alias/metadata safety, threads/shutdown/full consumer QA and subsequent service/CharClass/pool/Calc document/edit/view/UI. Broad parity/default/verified flags stay false. No new suspected upstream bug was found; no Calc journal entry is fabricated. Full41 is the latest full run and full51 remains next; Writer-only coverage is not repaired. No merge, publication, branch, worktree or delegated agent.
