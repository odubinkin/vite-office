---
id: "202610112001-NE4EG1"
title: "Port original public Any insertion extraction and data operations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T20:01:47.628Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T20:21:23.429Z"
  updated_by: "CODER"
  note: "Verified: EVALUATOR comment clarification resolved with no executable changes; original generic partial writes preserved. Docs/exact source lint/Prettier/diff0; full native/source-absent/raw100/scoped evidence unchanged. Review refreshed against clarification commit next."
  attempts: 0
quality_review:
  state: "rework"
  updated_at: "2026-10-11T20:20:48.598Z"
  updated_by: "EVALUATOR"
  note: "Implementation and deterministic native/raw coverage pass; one extraction documentation statement overstates generic failure atomicity."
  evaluated_sha: "412b3f21f674de0edd04aa2dc1bc81d769bab5e2"
  blueprint_digest: "13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36"
  evidence_refs:
    - ".agentplane/tasks/202610112001-NE4EG1/README.md"
    - ".agentplane/tasks/202610112001-NE4EG1/quality/20261011-202048598-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610112001-NE4EG1/quality/20261011-202048598-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610112001-NE4EG1/quality/20261011-202048598-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610112001-NE4EG1/blueprint/resolved-snapshot.json"
    - "apps/office/src/cppu/inc/com/sun/star/uno/Any.ts"
    - "apps/office/src/cppu/source/uno/assign.ts"
    - "output/playwright/task47-checks/evaluator-audit.json"
  findings:
    - "Any.extract comment says every false result leaves destination untouched, but original generic assignData can preserve partial compound writes on failure. Primitive specialization guards are atomic; generic delegation already preserves source behavior correctly. Correct the comment without changing implementation or acceptance."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: original selected Any.hxx insertion/extraction/Any equality/data helpers through shared real owners and genuine native/source-absent evidence; no temporary providers, full51 remains scheduled."
events:
  -
    type: "status"
    at: "2026-10-11T20:01:49.354Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original selected Any.hxx insertion/extraction/Any equality/data helpers through shared real owners and genuine native/source-absent evidence; no temporary providers, full51 remains scheduled."
  -
    type: "verify"
    at: "2026-10-11T20:19:25.369Z"
    author: "CODER"
    state: "ok"
    note: "Verified: task47 selected original Any data operators/helpers accepted;152 original build/capture commands0,369 source hashes13generated, three full normal-ASan/UBSan streams identical; source-absent Calc106/shared141 tests,19/57 whole raw S/B/F/L100;13 scoped gates3 exact Prettier checks8 final metadata gates0. Real default/owned lvalues and shared numeric/C owners reused. Separate implementation-bound EVALUATOR audit follows; whole Calc active,last full41,next51."
  -
    type: "verify"
    at: "2026-10-11T20:21:23.429Z"
    author: "CODER"
    state: "ok"
    note: "Verified: EVALUATOR comment clarification resolved with no executable changes; original generic partial writes preserved. Docs/exact source lint/Prettier/diff0; full native/source-absent/raw100/scoped evidence unchanged. Review refreshed against clarification commit next."
doc_version: 3
doc_updated_at: "2026-10-11T20:21:23.484Z"
doc_updated_by: "CODER"
description: "Task47 continues actual Any.hxx with isExtractableTo/has, Any equality, original generic/bool insertion and generic/bool/numeric/OUString/Type extraction, original selected toAny/fromAny copy/move helpers. Reuse real shared C assignment/equality and numeric owner, no provider/temp value implementation; full genuine native/source-absent whole raw100 scoped gates/inventory/review. Typed comparisons/get/ostream/string-expression helpers and remaining dependencies follow. Last full41,next51."
sections:
  Summary: "Task47 continues original Any.hxx data operations after verified task46 actual public ownership/genfunc. User goal continuation authorizes in-scope shared dependency work prioritized for UI consumers; no substitute providers/values."
  Scope: "Only vite-office-calc branch calc. Extend existing Any.ts with actual isExtractableTo/has, Any equality/inequality, selected insertion/extraction and toAny/fromAny helpers. Numeric specializations reuse existing source-exact assignNumeric because corresponding original source switches/conversions match; bool, OUString and Type specializations keep original guards/direct assignments, generic extraction calls actual uno_type_assignData with cpp callbacks. Template source/destination addresses and declared types remain explicit; no inference/default/type factory. Existing Type/OUString/C Any/SAL/count/type/query owners reused, actual Any copy/move from task46 reused. Public typed equality/BaseReference identity/get/ostream and string-expression overloads, public Sequence/Reference/service/CharClass/pool/Calc cells/document/edit/view/UI remain explicit future dependencies. Add original native probe/fixture and complete adjacent replay tests; reuse shared pure C++ witnesses/observations, extend only real caller helper if required. Update existing Any runtime/provenance/capability and Calc core; record suspicious upstream cases if found, preserve behavior. No network/subagents/branch/worktree/merge/publication/Writer-only repairs. Last full41, next51."
  Plan: "Port original selected Any data operators/helpers using existing real shared ownership/conversion owners; full unchanged native/source-absent whole raw100, accurate inventory/gaps, scoped gates and implementation-bound review, clean close. Last full41,next51."
  Verify Steps: |-
    1. Read pinned Any.h/hxx source-selected operations and existing assignNumeric/type/string/C owners. Preserve each native guard, conversion, failed destination unchanged, Any unwrapping differences, declared template selector, acquire/release/query/error lifetime order and C++ deleted Any instantiations as explicit compile-only limitations; no alternate extraction or factory.
    2. node scripts/uno-any-data-native-probe.mjs --write then --check. Full unchanged any/data/sequence plus69 genuine dependencies and genuine generated headers; complete initialized normal-ASan/UBSan streams identical for numeric/bool/all source classes, generic char/enum/struct/sequence/interface extraction and ownership/failure, insertion/equality/has/isExtractableTo/copy/move toAny/fromAny. Observe every initialized destination/source field and ordered callbacks/type/string/description/ref counts through existing full observers; never observe indeterminate empty reserved bytes or dereference invalid producer storage. If genuine source sanitizer rejection found, separately named bounded normal capture/exact rejection, never certify UB or weaken normal defined streams or source checks.
    3. All3 upstream links absent for Calc coverage and exact task46 shared profile expanded with new tests/whole owners only; each raw S/F/B counter positive and S/B/F/L100. Restore links finally. Prior Any ownership/genfunc/assignment/equality replays strict. No Writer-only repair or weakening; no full before51.
    4. TS7/exact changed-file ESLint/Prettier, docs/size/deps/provenance/tree/shared+Calc inventory, four related tooling files/routing/doctor/diff all0. Exact schema/source ownership/capability gaps and source-specific adaptation accurately recorded, broad parity/default/verified flags false.
    5. Actual Command/Result/Evidence/Scope in task docs, intentional implementation commit, separate EVALUATOR audit tied to current implementation/native/coverage, committed review evidence, final canonical verification after last doc mutation and clean canonical finish. Keep complete Calc goal active.
  Verification: |-
    - Command: node scripts/uno-any-data-native-probe.mjs --write; node scripts/uno-any-data-native-probe.mjs --check.
      Result: pass.
      Evidence: 152 original build/capture commands exit0;72 unchanged translation units,369 complete source hashes13generated; three full initialized normal-ASan/UBSan streams identical extraction949008/predicates2082240/helpers147104 bytes. Native task47 diagnostics empty; no sanitizer rejection.
      Scope: selected Any.hxx insertion/extraction/Any equality/extractability/has/toAny/fromAny; initialized supported source classes and actual declared destination/source owners. Real RuntimeException field defaults and destructor used, nonowning field lvalues at genuine offsets; no C-default/value/type/query factory substitute. Empty/moved reserved bytes/physical ABI/full consumer QA unverified; system dependencies uninstrumented and leak detection disabled.
    - Command: node output/playwright/task47-checks/any-portable.mjs (exact child commands in value-calc-manifest.json and value-shared-manifest.json).
      Result: pass.
      Evidence: Calc106 tests24files19owners and shared141/42/57; source links absent throughout and restored exactly. Every whole raw S/F/B counter positive; S/B/F/L100 Calc2920/2055/474/2564 and shared3791/2068/490/3386. Previous original Any ownership/genfunc/assignment/equality replays retained.
      Scope: Calc and exact prior related shared profile expanded only by3 new full replay tests. No Writer coverage repair, assertions/exclusions/timeout weakening or full before51.
    - Command: node output/playwright/task47-checks/any-gates.mjs; node output/playwright/task47-checks/any-gates.mjs docs after caller JSDoc completion; npx prettier --check apps/office/src/cppu/inc/com/sun/star/uno/Any.ts apps/office/src/cppu/inc/com/sun/star/uno/Any-data.test.ts scripts/uno-any-data-native-probe.mjs.
      Result: pass.
      Evidence: all13 effective scoped gates0 and exact3-source Prettier0; TS7/lint/docs/size/deps/provenance/tree/inventory shared+Calc/four related tooling files/routing/doctor/diff. Initial TS7/caller input/docs findings resolved without changing source/gates or observations.
      Scope: selected runtime/test/probe and responsibility-level metadata. Final metadata check and implementation-bound EVALUATOR audit follow before clean canonical finish.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T20:19:25.369Z — VERIFY — ok

    By: CODER

    Note: Verified: task47 selected original Any data operators/helpers accepted;152 original build/capture commands0,369 source hashes13generated, three full normal-ASan/UBSan streams identical; source-absent Calc106/shared141 tests,19/57 whole raw S/B/F/L100;13 scoped gates3 exact Prettier checks8 final metadata gates0. Real default/owned lvalues and shared numeric/C owners reused. Separate implementation-bound EVALUATOR audit follows; whole Calc active,last full41,next51.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T20:18:51.878Z, excerpt_hash=sha256:fe3a0da48c09b88ae99007fdbc69e9f9dbdff56223a5b2561958464301f0d37b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112001-NE4EG1/blueprint/resolved-snapshot.json
    - old_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
    - current_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610112001-NE4EG1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610112001-NE4EG1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-11T20:21:23.429Z — VERIFY — ok

    By: CODER

    Note: Verified: EVALUATOR comment clarification resolved with no executable changes; original generic partial writes preserved. Docs/exact source lint/Prettier/diff0; full native/source-absent/raw100/scoped evidence unchanged. Review refreshed against clarification commit next.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T20:20:50.531Z, excerpt_hash=sha256:fe3a0da48c09b88ae99007fdbc69e9f9dbdff56223a5b2561958464301f0d37b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112001-NE4EG1/blueprint/resolved-snapshot.json
    - old_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
    - current_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610112001-NE4EG1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610112001-NE4EG1 --result verified-202610112001-NE4EG1 --commit 412b3f21f674de0edd04aa2dc1bc81d769bab5e2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task47 implementation and metadata while retaining task traceability; no destructive history rewrite or merge."
  Findings: |-
    Previous goal turn is progress: task46 DONE implementation7a7f1c80edef, reviewb4d117ab1631, closef9fedb7d1adb. Working tree clean calc. Actual public Any/C callbacks and shared numeric assignment exist. Source numeric extraction switches match assignNumeric exactly; use existing common owner with explicit original Any source guard to avoid duplicate shared conversion policy. Generic extraction may unwrap Any while primitive specializations guard the direct class; preserve this distinction. Missing typed comparison/BaseReference identity/get/ostream/string-expression/public Sequence families remain later genuine owners, no stubs. Last full41/next51. Final task doc update invalidates blueprint verification; re-record verify after final docs before close.

    - Observation: First TS7 check rejects nullable borrowed Type reference annotation at isExtractableTo; original valid Type supplies initialized non-null reference.
      Impact: Static address/type erasure annotation only; no accepted native or runtime behavior changed.
      Resolution: Cast actual initialized borrowed Type reference to R at the original C call boundary, preserving the source producer precondition; rerun TS7.

    - Observation: First combined portable/TS7/lint checks found pure caller helper sequence-name collision and one prefer-const annotation; predicates and helper whole-stream replays already pass.
      Impact: Authored extraction caller invoked the shared description builder instead of the actual exported sequence C owner. No native mismatch or library implementation issue.
      Resolution: Import original uno_type_sequence_construct from the existing public sequence2 owner directly and make the output reference const at its original post-extraction initialization; retain complete observations and rerun all three checks.

    - Observation: Full extraction replay exposes an authored RuntimeException destination default mismatch: C data default uses global empty string ref flags, while native generated class default uses actual OUString literal empty storage.
      Impact: Original initialized string flags differ at observation4067; predicates/helpers streams already identical. This is a caller input mismatch, not accepted extraction parity.
      Resolution: Construct destination initial fields using actual generated RuntimeException/OUString default owners and represent only their original logical addressed fields; preserve native ordered lifetime and all captured bytes. Do not replace the original C default policy or normalize observations.

    - Observation: Pure caller address wiring cannot redefine a generic allocator slot: original allocateUnoStorage intentionally exposes nonconfigurable own lvalue descriptors.
      Impact: Caller representation only; no runtime owner contract change. A failed edit script left the caller unchanged and its repeat remained non-accepting.
      Resolution: Use nonowning addressed views of the actual existing exception fields directly, keyed by genuine description offsets; retain actual generated owner construction/destruction. Do not mutate allocator descriptors or add a duplicate allocator/value factory.

    - Observation: Scoped docs gate rejects missing JSDoc on authored helper cleanup arrows.
      Impact: Documentation only; all three complete portable streams, TS7 and exact lint pass.
      Resolution: Document each selected caller destructor/primitive no-op lifetime explicitly, then resume docs and remaining gates; source implementations and acceptance unchanged.

    - Observation: Separate EVALUATOR review found the extract comment overstates generic failure atomicity; code already delegates to original C assignment with partial-write semantics.
      Impact: Contract prose only. Primitive/specialized guards leave failed destinations unchanged; generic compound writes must retain original partial changes. Native/portable/raw100 remain accepted for unchanged bodies.
      Resolution: Qualify the exact comment for specialized failures and explicitly preserve generic partial writes. Run docs/exact format/lint/diff, commit the source-contract clarification and refresh implementation-bound review without rerunning unchanged runtime/native tests.
id_source: "generated"
---
## Summary

Task47 continues original Any.hxx data operations after verified task46 actual public ownership/genfunc. User goal continuation authorizes in-scope shared dependency work prioritized for UI consumers; no substitute providers/values.

## Scope

Only vite-office-calc branch calc. Extend existing Any.ts with actual isExtractableTo/has, Any equality/inequality, selected insertion/extraction and toAny/fromAny helpers. Numeric specializations reuse existing source-exact assignNumeric because corresponding original source switches/conversions match; bool, OUString and Type specializations keep original guards/direct assignments, generic extraction calls actual uno_type_assignData with cpp callbacks. Template source/destination addresses and declared types remain explicit; no inference/default/type factory. Existing Type/OUString/C Any/SAL/count/type/query owners reused, actual Any copy/move from task46 reused. Public typed equality/BaseReference identity/get/ostream and string-expression overloads, public Sequence/Reference/service/CharClass/pool/Calc cells/document/edit/view/UI remain explicit future dependencies. Add original native probe/fixture and complete adjacent replay tests; reuse shared pure C++ witnesses/observations, extend only real caller helper if required. Update existing Any runtime/provenance/capability and Calc core; record suspicious upstream cases if found, preserve behavior. No network/subagents/branch/worktree/merge/publication/Writer-only repairs. Last full41, next51.

## Plan

Port original selected Any data operators/helpers using existing real shared ownership/conversion owners; full unchanged native/source-absent whole raw100, accurate inventory/gaps, scoped gates and implementation-bound review, clean close. Last full41,next51.

## Verify Steps

1. Read pinned Any.h/hxx source-selected operations and existing assignNumeric/type/string/C owners. Preserve each native guard, conversion, failed destination unchanged, Any unwrapping differences, declared template selector, acquire/release/query/error lifetime order and C++ deleted Any instantiations as explicit compile-only limitations; no alternate extraction or factory.
2. node scripts/uno-any-data-native-probe.mjs --write then --check. Full unchanged any/data/sequence plus69 genuine dependencies and genuine generated headers; complete initialized normal-ASan/UBSan streams identical for numeric/bool/all source classes, generic char/enum/struct/sequence/interface extraction and ownership/failure, insertion/equality/has/isExtractableTo/copy/move toAny/fromAny. Observe every initialized destination/source field and ordered callbacks/type/string/description/ref counts through existing full observers; never observe indeterminate empty reserved bytes or dereference invalid producer storage. If genuine source sanitizer rejection found, separately named bounded normal capture/exact rejection, never certify UB or weaken normal defined streams or source checks.
3. All3 upstream links absent for Calc coverage and exact task46 shared profile expanded with new tests/whole owners only; each raw S/F/B counter positive and S/B/F/L100. Restore links finally. Prior Any ownership/genfunc/assignment/equality replays strict. No Writer-only repair or weakening; no full before51.
4. TS7/exact changed-file ESLint/Prettier, docs/size/deps/provenance/tree/shared+Calc inventory, four related tooling files/routing/doctor/diff all0. Exact schema/source ownership/capability gaps and source-specific adaptation accurately recorded, broad parity/default/verified flags false.
5. Actual Command/Result/Evidence/Scope in task docs, intentional implementation commit, separate EVALUATOR audit tied to current implementation/native/coverage, committed review evidence, final canonical verification after last doc mutation and clean canonical finish. Keep complete Calc goal active.

## Verification

- Command: node scripts/uno-any-data-native-probe.mjs --write; node scripts/uno-any-data-native-probe.mjs --check.
  Result: pass.
  Evidence: 152 original build/capture commands exit0;72 unchanged translation units,369 complete source hashes13generated; three full initialized normal-ASan/UBSan streams identical extraction949008/predicates2082240/helpers147104 bytes. Native task47 diagnostics empty; no sanitizer rejection.
  Scope: selected Any.hxx insertion/extraction/Any equality/extractability/has/toAny/fromAny; initialized supported source classes and actual declared destination/source owners. Real RuntimeException field defaults and destructor used, nonowning field lvalues at genuine offsets; no C-default/value/type/query factory substitute. Empty/moved reserved bytes/physical ABI/full consumer QA unverified; system dependencies uninstrumented and leak detection disabled.
- Command: node output/playwright/task47-checks/any-portable.mjs (exact child commands in value-calc-manifest.json and value-shared-manifest.json).
  Result: pass.
  Evidence: Calc106 tests24files19owners and shared141/42/57; source links absent throughout and restored exactly. Every whole raw S/F/B counter positive; S/B/F/L100 Calc2920/2055/474/2564 and shared3791/2068/490/3386. Previous original Any ownership/genfunc/assignment/equality replays retained.
  Scope: Calc and exact prior related shared profile expanded only by3 new full replay tests. No Writer coverage repair, assertions/exclusions/timeout weakening or full before51.
- Command: node output/playwright/task47-checks/any-gates.mjs; node output/playwright/task47-checks/any-gates.mjs docs after caller JSDoc completion; npx prettier --check apps/office/src/cppu/inc/com/sun/star/uno/Any.ts apps/office/src/cppu/inc/com/sun/star/uno/Any-data.test.ts scripts/uno-any-data-native-probe.mjs.
  Result: pass.
  Evidence: all13 effective scoped gates0 and exact3-source Prettier0; TS7/lint/docs/size/deps/provenance/tree/inventory shared+Calc/four related tooling files/routing/doctor/diff. Initial TS7/caller input/docs findings resolved without changing source/gates or observations.
  Scope: selected runtime/test/probe and responsibility-level metadata. Final metadata check and implementation-bound EVALUATOR audit follow before clean canonical finish.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T20:19:25.369Z — VERIFY — ok

By: CODER

Note: Verified: task47 selected original Any data operators/helpers accepted;152 original build/capture commands0,369 source hashes13generated, three full normal-ASan/UBSan streams identical; source-absent Calc106/shared141 tests,19/57 whole raw S/B/F/L100;13 scoped gates3 exact Prettier checks8 final metadata gates0. Real default/owned lvalues and shared numeric/C owners reused. Separate implementation-bound EVALUATOR audit follows; whole Calc active,last full41,next51.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T20:18:51.878Z, excerpt_hash=sha256:fe3a0da48c09b88ae99007fdbc69e9f9dbdff56223a5b2561958464301f0d37b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112001-NE4EG1/blueprint/resolved-snapshot.json
- old_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
- current_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610112001-NE4EG1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610112001-NE4EG1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-11T20:21:23.429Z — VERIFY — ok

By: CODER

Note: Verified: EVALUATOR comment clarification resolved with no executable changes; original generic partial writes preserved. Docs/exact source lint/Prettier/diff0; full native/source-absent/raw100/scoped evidence unchanged. Review refreshed against clarification commit next.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T20:20:50.531Z, excerpt_hash=sha256:fe3a0da48c09b88ae99007fdbc69e9f9dbdff56223a5b2561958464301f0d37b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610112001-NE4EG1/blueprint/resolved-snapshot.json
- old_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
- current_digest: 13f89e28e67f7e127ed111204984b2532414e2781e55b1e1657bf19746950c36
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610112001-NE4EG1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610112001-NE4EG1 --result verified-202610112001-NE4EG1 --commit 412b3f21f674de0edd04aa2dc1bc81d769bab5e2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task47 implementation and metadata while retaining task traceability; no destructive history rewrite or merge.

## Findings

Previous goal turn is progress: task46 DONE implementation7a7f1c80edef, reviewb4d117ab1631, closef9fedb7d1adb. Working tree clean calc. Actual public Any/C callbacks and shared numeric assignment exist. Source numeric extraction switches match assignNumeric exactly; use existing common owner with explicit original Any source guard to avoid duplicate shared conversion policy. Generic extraction may unwrap Any while primitive specializations guard the direct class; preserve this distinction. Missing typed comparison/BaseReference identity/get/ostream/string-expression/public Sequence families remain later genuine owners, no stubs. Last full41/next51. Final task doc update invalidates blueprint verification; re-record verify after final docs before close.

- Observation: First TS7 check rejects nullable borrowed Type reference annotation at isExtractableTo; original valid Type supplies initialized non-null reference.
  Impact: Static address/type erasure annotation only; no accepted native or runtime behavior changed.
  Resolution: Cast actual initialized borrowed Type reference to R at the original C call boundary, preserving the source producer precondition; rerun TS7.

- Observation: First combined portable/TS7/lint checks found pure caller helper sequence-name collision and one prefer-const annotation; predicates and helper whole-stream replays already pass.
  Impact: Authored extraction caller invoked the shared description builder instead of the actual exported sequence C owner. No native mismatch or library implementation issue.
  Resolution: Import original uno_type_sequence_construct from the existing public sequence2 owner directly and make the output reference const at its original post-extraction initialization; retain complete observations and rerun all three checks.

- Observation: Full extraction replay exposes an authored RuntimeException destination default mismatch: C data default uses global empty string ref flags, while native generated class default uses actual OUString literal empty storage.
  Impact: Original initialized string flags differ at observation4067; predicates/helpers streams already identical. This is a caller input mismatch, not accepted extraction parity.
  Resolution: Construct destination initial fields using actual generated RuntimeException/OUString default owners and represent only their original logical addressed fields; preserve native ordered lifetime and all captured bytes. Do not replace the original C default policy or normalize observations.

- Observation: Pure caller address wiring cannot redefine a generic allocator slot: original allocateUnoStorage intentionally exposes nonconfigurable own lvalue descriptors.
  Impact: Caller representation only; no runtime owner contract change. A failed edit script left the caller unchanged and its repeat remained non-accepting.
  Resolution: Use nonowning addressed views of the actual existing exception fields directly, keyed by genuine description offsets; retain actual generated owner construction/destruction. Do not mutate allocator descriptors or add a duplicate allocator/value factory.

- Observation: Scoped docs gate rejects missing JSDoc on authored helper cleanup arrows.
  Impact: Documentation only; all three complete portable streams, TS7 and exact lint pass.
  Resolution: Document each selected caller destructor/primitive no-op lifetime explicitly, then resume docs and remaining gates; source implementations and acceptance unchanged.

- Observation: Separate EVALUATOR review found the extract comment overstates generic failure atomicity; code already delegates to original C assignment with partial-write semantics.
  Impact: Contract prose only. Primitive/specialized guards leave failed destinations unchanged; generic compound writes must retain original partial changes. Native/portable/raw100 remain accepted for unchanged bodies.
  Resolution: Qualify the exact comment for specialized failures and explicitly preserve generic partial writes. Run docs/exact format/lint/diff, commit the source-contract clarification and refresh implementation-bound review without rerunning unchanged runtime/native tests.
