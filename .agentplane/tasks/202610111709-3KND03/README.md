---
id: "202610111709-3KND03"
title: "Port original UNO sequence allocation and copy-on-write engine"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 26
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:10:18.379Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T17:52:42.476Z"
  updated_by: "CODER"
  note: "Complete original C sequence streams match; source-absent Calc106 and related shared120 pass with every raw counter positive and S/B/F/L100; all13 gates and exact restoration pass. Evidence in output/playwright/task42-checks manifests and task Verification; native allocator/ABI and downstream template/service/UI limitations retained."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-11T17:53:40.756Z"
  updated_by: "EVALUATOR"
  note: "Reviewed committed original shared C sequence engine against full source and concrete native/source-absent evidence; approved bounded scope is complete."
  evaluated_sha: "e37bdb3539a567b13e2192ed8b020455e7c1a21c"
  blueprint_digest: "151b771a7152c20f2495797943790c8d18e80dc537d9bd6bffd49ec05e7dbff0"
  evidence_refs:
    - ".agentplane/tasks/202610111709-3KND03/README.md"
    - ".agentplane/tasks/202610111709-3KND03/quality/20261011-175340756-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610111709-3KND03/quality/20261011-175340756-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610111709-3KND03/quality/20261011-175340756-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610111709-3KND03/blueprint/resolved-snapshot.json"
    - "output/playwright/task42-checks/value-coverage-audit.json"
    - "output/playwright/task42-checks/value-gates-final-manifest.json"
    - "output/playwright/task42-checks/native-check-safe-guards.log"
    - "output/playwright/task42-checks/caller-extraction-audit.json"
  findings:
    - "All358 whole source hashes currently match fixture; full unchanged original sequence/data/any and genuine69 dependency owners produce sanitizer-identical complete streams, and three portable cases replay every byte. Prior native copy caller remains byte-identical; default scalar observer assertions retained."
    - "Source COW copy/tail/default/destruction/refcount and assignment order preserved. All raw counters positive in19 Calc and49 related shared owners, S/B/F/L100; all13 effective gates exit0. New responsibility-split filename and capability records are exhaustive; CALC-051 records behavior without repair."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: complete original UNO sequence engine with real shared dependencies and native/portable proof."
events:
  -
    type: "status"
    at: "2026-10-11T17:10:30.237Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete original UNO sequence engine with real shared dependencies and native/portable proof."
  -
    type: "verify"
    at: "2026-10-11T17:52:42.476Z"
    author: "CODER"
    state: "ok"
    note: "Complete original C sequence streams match; source-absent Calc106 and related shared120 pass with every raw counter positive and S/B/F/L100; all13 gates and exact restoration pass. Evidence in output/playwright/task42-checks manifests and task Verification; native allocator/ABI and downstream template/service/UI limitations retained."
doc_version: 3
doc_updated_at: "2026-10-11T17:54:08.509Z"
doc_updated_by: "CODER"
description: "Task42: complete sequence.cxx engine required by original i18npool offsets and returned-string sequences; reuse existing CPPu/SAL type, copy, default and destruction owners. Source-shaped allocation/default/copy/reallocation/reference-to-one/assignment paths and actual native replay, portable raw100, inventory and scoped gates. Full run cadence restarts after task41."
sections:
  Summary: "Task42 implements the complete original UNO sequence.cxx engine as the next concrete dependency of i18npool casing offsets and returned-string sequences, supporting original CharClass/SharedStringPool and Calc cell values."
  Scope: |-
    Only vite-office-calc branch calc. Existing cppu/source/uno/sequence.ts and cppu/inc/uno/sequence2.ts plus source-shaped sequence-elements.ts split of original sequence.cxx helpers if needed for file-size. Reuse existing SAL sequence/count storage, CPPu real type descriptions, addressed allocation, default/copy/destruction/empty-sequence owners; narrow changes to these existing owners only if original engine contracts require them. Original type/ref and full-description C construct/realloc/reference2One/assign/destroy APIs, allocation/default/copy helper switches and reallocation branches. Adjacent tests and complete original native fixture, new scripts/uno-sequence-native-probe.mjs and source-shaped helper if needed; reuse existing genuine SAL/CPPU native build tooling, original sequence/data/any units and generated real types, no handwritten native dependency substitute. Complete per-owner shared runtime/provenance/capability records, calc-core dependency documentation and genuine suspected Calc upstream cases. Dependency boundary/cycle checker changes only for actual same-module source imports if enforcement requires them; no general graph restriction weakening. Public C++ Sequence template wrapper and UNO weak/service/classification/CharClass/SharedStringPool/cell/document/UI consumers remain subsequent work, not stubbed in this task. Native physical allocation addresses/byte layout/resource OOM, invalid pointers/ranges/type metadata and unsupported undefined behavior are not claimed browser parity. Supported signed32/byte-count/type/ref/value/ownership/error ordering follows upstream. No full-suite replay until task51 unless concrete failure requires it, no Writer-only coverage repair, network/publication/merge/new branch.

    Shared caller reuse concretely adds scripts/uno-native-value-caller.mjs and apps/office/src/test/uno-native-values.ts, with narrow observer extraction in existing scripts/uno-copy-native-probe.mjs and cppu/source/uno/copy.test.ts. Original assembled native driver is byte-identical; default boolean observer still enforces scalar normalization and new sequence byte observation is explicitly opted in. These four related files are within the approved helper/adjacent-test reuse scope, not new application/runtime library responsibilities.
  Plan: "Inspect complete pinned sequence.cxx and dependent original headers. Implement complete C engine using existing CPPu/SAL owners, preserving all original switch/default/copy/COW/refcount/assignment ordering and stable logical addressed storage. Capture genuine native initialized complete histories across element kinds and source-defined failure guards with normal/ASan/UBSan; compare complete portable fields/callback/refcount observations. Verify source-absent Calc and all affected shared raw S/B/F/L100; scoped static/provenance/inventory/tooling/routing checks and exact link restoration. Record source suspects without correcting them, EVALUATOR review committed implementation and clean direct closure. Continue real downstream casing/pool/cell/document UI prerequisites; next full cadence task51."
  Verify Steps: |-
    1. Verify full pinned sequence.cxx/header/dependency hashes and read every supported constructor/default/copy/realloc/reference2One/assign/destroy path. Retain original initialized/indeterminate storage distinction and guard/result/output-write/refcount/callback ordering.
    2. New native probe --write then --check executes actual complete original sequence/data/any translation units and true SAL/CPPU/type dependencies, not recreated algorithms. Complete normal and ASan/UBSan captures agree, including element tags, initialized values, logical shared identity, type/string/sequence/interface acquisitions/releases and ordered callbacks, COW/default/copy/realloc/assign histories and defined guard failures. Native malloc/realloc physical address choice and resource failure are explicitly unverified, not hardcoded expected JS pointers.
    3. Remove all3 original source links for npm run test:coverage:calc and directly affected shared tests; every raw S/F/B counter positive and S/B/F/L100 for changed executable owners. Retain complete captures and every defined portable observation, restore exact links in finally. No coverage/test/timeout/exclusion weakening.
    4. Run TS7, exact changed-source ESLint/Prettier, JSDoc, file size, actual module boundaries, full provenance/source-tree, shared/Calc inventories, related tooling, routing/doctor and diff. Full suite task51, no unnecessary repeat native builds or unchanged full tests.
    5. Record verification and residual unported public template/service/pool/cell/document/UI contracts; meaningful intentional commit, separate EVALUATOR phase, clean direct close. Keep full goal active until actual complete Calc outcome.
  Verification: |-
    Command: node scripts/uno-sequence-native-probe.mjs --write and --check (exact output/playwright/task42-checks/native-write-safe-guards.log and native-check-safe-guards.log).
    Result: pass, complete original sequence/data/any translation units and69 genuine dependency owners;358 pinned original source hashes. Complete normal and ASan/UBSan streams identical: lifecycle2089840, helpers1288, guards4460 bytes. Three complete portable replay cases match every captured byte. Actual native producer/consumer QA and allocator address/capacity/OOM/byte ABI/NaN payload/indeterminate cells remain unverified; signed-count diagnostics explicitly bounded and sanitizer-defined.

    Command: node output/playwright/task42-checks/sequence-portable.mjs (exact underlying argv and cwd in value-calc-manifest.json/value-shared-manifest.json).
    Result: pass with all3 original source links absent, exact targets restored in finally. Calc106 tests/24 files/19 executable owners S2920 B2055 F474 L2564; related shared120 tests/36 files/49 executable owners S3190 B1555 F427 L2847. All raw S/F/B counters positive and S/B/F/L100; full counter audit value-coverage-audit.json. Existing4 copy replay cases retain strict scalar boolean contract. Native copy assembled driver byte-identical to predecessor (caller-extraction-audit.json).

    Command: node output/playwright/task42-checks/sequence-gates.mjs, repairs from docs/provenance after concrete failures; exact effective checks in value-gates-final-manifest.json. npx prettier --check on all9 changed TS/JS sources and final exact native-probe ESLint after documentation callback repair.
    Result: all13 effective gates exit0: TS7, exact lint, JSDoc, file size, real module boundaries, exhaustive provenance/tree, shared/Calc inventory, related tooling, policy routing, doctor, diff. Prettier and final lint pass. No runtime/library substitute, assertion/coverage relaxation, dependency-cycle relaxation or Writer runtime change. CALC-051 records original raw sal_Bool sequence/scalar difference without correcting it.

    Scope: complete shared original C sequence engine prerequisite; public C++ template, weak/services/classification/CharClass/SharedStringPool and Calc cell/document/edit/view/UI remain subsequent work. Broad parity flags remain false. Last full task41; next scheduled full task51; no full-suite replay this atomic task.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T17:52:42.476Z — VERIFY — ok

    By: CODER

    Note: Complete original C sequence streams match; source-absent Calc106 and related shared120 pass with every raw counter positive and S/B/F/L100; all13 gates and exact restoration pass. Evidence in output/playwright/task42-checks manifests and task Verification; native allocator/ABI and downstream template/service/UI limitations retained.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T17:52:41.470Z, excerpt_hash=sha256:371608c4517e4942ed48b2954583a27e98ce64e6d38fe6a7e3138a4a5032afc4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610111709-3KND03/blueprint/resolved-snapshot.json
    - old_digest: 151b771a7152c20f2495797943790c8d18e80dc537d9bd6bffd49ec05e7dbff0
    - current_digest: 151b771a7152c20f2495797943790c8d18e80dc537d9bd6bffd49ec05e7dbff0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610111709-3KND03

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610111709-3KND03
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task42 intentional commits if needed. Keep task41 and unrelated active tasks unchanged. Restore original symlinks on every source-absent runner exit; no native original file mutation."
  Findings: |-
    Previous goal turn is concrete progress: tasks40/41 completed, full15084/668 raw100 and all final gates pass at1daed692, followed by requested pause. Authoritative goal now active (explicit continuation) and calc checkout clean. Original casing body constructs Sequence<int32> offsets and Sequence<OUString> results; public sequence wrapper absent and sequence.cxx currently exposes only prior count-view/zero-count destruction boundary. Source engine is915lines; a source-mapped helper split may be required by repository600-line budget. Reuse existing default/copy/destruction and true native build, no provisional string service.

    - Observation: Initial TS7 reports original compound nSize viewed through compound declaration and nullable indirect element refs.
      Impact: Source-faithful runtime paths implemented; static declaration casts must use existing actual full-description and supported nonnull element contracts.
      Resolution: Use nSize from actual description D, preserving original source variable ownership; use existing source cast convention for valid indirect pType R. No runtime fallback or type provider introduced.

    - Observation: Shared native value/type/callback observer setup is already present in copy probe/test; engine source uses repeated primitive memset/memcpy bodies.
      Impact: Duplicating original caller setup would create a second fixture model; native raw byte operations require logical addressed-storage adaptation in browser.
      Resolution: Extract unchanged native caller prefix and portable observer/type setup into reusable helpers (native assembled old driver SHA256 byte-identical). Preserve source switch tags/widths and share only identical primitive memory operations via typed addressed adapters. No runtime type/allocator substitute or physical ABI/NaN payload/resource-failure claim. Native Sequence public template remains next.

    - Observation: Native normal caller compilation failed for missing declaration of the actual private typelib_typedescription_newEmpty diagnostic setup API; helper extraction TS7 also found one unused old expect import.
      Impact: No native observations captured yet; runtime implementation untouched by these caller/preparation failures.
      Resolution: Use the identical true private signature already employed in verified copy native caller and remove only unused test import. Native library bodies remain genuine, complete and unchanged; recompute route and rerun original caller.

    - Observation: Initial portable sequence tests called destruction wrapper from destr module instead of its actual data.cxx owner; all4 prior copy tests passed after observer extraction.
      Impact: Three sequence cases stopped at cleanup before complete comparison; no native/runtime mismatch established.
      Resolution: Use existing globals.destructSequence from the same actual data owner as verified copy caller, retaining original boundary rather than adding an alias. Keep complete captures and rerun focused tests.

    - Observation: Focused repair runner was accidentally launched from repository root; shared test includes are relative to apps/office, so zero tests were discovered and exit1.
      Impact: This is not a portable pass or acceptance observation; native exact --check completed normally with358 hashes and full sanitizer-identical streams.
      Resolution: Use authoritative apps/office cwd for shared Vitest command, preserving exact test list, coverage owners and thresholds.

    - Observation: Actual sequence memcpy retains original sal_Bool unsigned bytes2/255; shared data-copy observer intentionally expects boolean because copy.hxx explicitly applies bool(source). Lifecycle comparison stopped on that observer assertion.
      Impact: Portable sequence engine preserved the original values; the reusable observer needs an explicit raw-byte mode rather than normalization or weakening the existing data-copy contract.
      Resolution: Add opt-in SAL_Bool unsigned-byte observation for the actual sequence captures, keep default strict logical boolean assertion for all old copy tests. Preserve both original paths; investigate and document bounded source difference after full native/portable comparison.

    - Observation: All7 focused portable cases and complete native streams match. New element helper raw100; main source has two old count/destroy owners covered by prior related tests and two signed-count source guard paths not exercised yet.
      Impact: Focused profile is not100 acceptance. Native full-description negative-count behavior and initialized diagnostic-only header guard branch must be observed without fake allocator or dropping original conditions.
      Resolution: Retain all original guards. Add two separately marked original byte-sequence diagnostic histories: negative shared target size (no element writes) and initialized negative header count with only byte writes at offsets7/8 within nine-byte native allocation, no invalid/indeterminate tail reads. Their specific fields/results are bounded observations, not valid producer/general malformed header/binary alias parity. Recheck actual normal/ASan/UBSan corpus and combined related source-absent raw100.

    - Observation: First attempted malformed-header BYTE diagnostic was rejected by UBSan: original sizeof multiplication converts negative index to unsigned pointer offset and overflows at sequence.cxx107. It is not accepted fixture data or a supported producer defect.
      Impact: No sanitizer pass or portable parity claim may include this path; physically in-allocation address alone did not prove defined pointer arithmetic.
      Resolution: Remove that unsafe diagnostic. Use initialized CHAR header count-1 and target2147483646: signed rest is2147483647, original positive allocation guard rejects size before any pointer/element operation, leaves header untouched. Keep separately observed negative full-description target on a valid shared sequence (no element operation). Preserve original conditions and thresholds; recapture and require exact sanitizer-identical streams. No upstream runtime correction.

    - Observation: TS7 found the raw-byte observer option forwarded into context, where it is unused; its actual consumer is createUnoNativeInputs.value.
      Impact: Static check failed before other gates; no runtime mismatch.
      Resolution: Keep option solely on its consuming observer; remove unused context parameter/forwarding without changing assertions or source behavior.

    - Observation: Exact JSDoc gate rejected source-hash mapping callback in new native probe.
      Impact: Documentation gate stopped after typecheck and lint passed.
      Resolution: Document only this callback; retain complete source hashing and all acceptance criteria.

    - Observation: Source provenance gate correctly requires an explicit filename divergence for the sequence-elements.ts source function split.
      Impact: Runtime record exists but mapping has no budget-driven responsibility-split explanation.
      Resolution: Add that explanation to the existing new provenance record; preserve source ownership and filename enforcement.

    - Observation: Direct finish correctly rejected dirty tracked task README produced by the separate EVALUATOR record.
      Impact: Task remains verified pending closure; implementation is committed and clean, but quality artifacts need their own task-scoped checkpoint.
      Resolution: Commit only this task README/quality artifacts, then retry canonical finish with the actual implementation hash. No runtime edits or acceptance changes.
id_source: "generated"
---
## Summary

Task42 implements the complete original UNO sequence.cxx engine as the next concrete dependency of i18npool casing offsets and returned-string sequences, supporting original CharClass/SharedStringPool and Calc cell values.

## Scope

Only vite-office-calc branch calc. Existing cppu/source/uno/sequence.ts and cppu/inc/uno/sequence2.ts plus source-shaped sequence-elements.ts split of original sequence.cxx helpers if needed for file-size. Reuse existing SAL sequence/count storage, CPPu real type descriptions, addressed allocation, default/copy/destruction/empty-sequence owners; narrow changes to these existing owners only if original engine contracts require them. Original type/ref and full-description C construct/realloc/reference2One/assign/destroy APIs, allocation/default/copy helper switches and reallocation branches. Adjacent tests and complete original native fixture, new scripts/uno-sequence-native-probe.mjs and source-shaped helper if needed; reuse existing genuine SAL/CPPU native build tooling, original sequence/data/any units and generated real types, no handwritten native dependency substitute. Complete per-owner shared runtime/provenance/capability records, calc-core dependency documentation and genuine suspected Calc upstream cases. Dependency boundary/cycle checker changes only for actual same-module source imports if enforcement requires them; no general graph restriction weakening. Public C++ Sequence template wrapper and UNO weak/service/classification/CharClass/SharedStringPool/cell/document/UI consumers remain subsequent work, not stubbed in this task. Native physical allocation addresses/byte layout/resource OOM, invalid pointers/ranges/type metadata and unsupported undefined behavior are not claimed browser parity. Supported signed32/byte-count/type/ref/value/ownership/error ordering follows upstream. No full-suite replay until task51 unless concrete failure requires it, no Writer-only coverage repair, network/publication/merge/new branch.

Shared caller reuse concretely adds scripts/uno-native-value-caller.mjs and apps/office/src/test/uno-native-values.ts, with narrow observer extraction in existing scripts/uno-copy-native-probe.mjs and cppu/source/uno/copy.test.ts. Original assembled native driver is byte-identical; default boolean observer still enforces scalar normalization and new sequence byte observation is explicitly opted in. These four related files are within the approved helper/adjacent-test reuse scope, not new application/runtime library responsibilities.

## Plan

Inspect complete pinned sequence.cxx and dependent original headers. Implement complete C engine using existing CPPu/SAL owners, preserving all original switch/default/copy/COW/refcount/assignment ordering and stable logical addressed storage. Capture genuine native initialized complete histories across element kinds and source-defined failure guards with normal/ASan/UBSan; compare complete portable fields/callback/refcount observations. Verify source-absent Calc and all affected shared raw S/B/F/L100; scoped static/provenance/inventory/tooling/routing checks and exact link restoration. Record source suspects without correcting them, EVALUATOR review committed implementation and clean direct closure. Continue real downstream casing/pool/cell/document UI prerequisites; next full cadence task51.

## Verify Steps

1. Verify full pinned sequence.cxx/header/dependency hashes and read every supported constructor/default/copy/realloc/reference2One/assign/destroy path. Retain original initialized/indeterminate storage distinction and guard/result/output-write/refcount/callback ordering.
2. New native probe --write then --check executes actual complete original sequence/data/any translation units and true SAL/CPPU/type dependencies, not recreated algorithms. Complete normal and ASan/UBSan captures agree, including element tags, initialized values, logical shared identity, type/string/sequence/interface acquisitions/releases and ordered callbacks, COW/default/copy/realloc/assign histories and defined guard failures. Native malloc/realloc physical address choice and resource failure are explicitly unverified, not hardcoded expected JS pointers.
3. Remove all3 original source links for npm run test:coverage:calc and directly affected shared tests; every raw S/F/B counter positive and S/B/F/L100 for changed executable owners. Retain complete captures and every defined portable observation, restore exact links in finally. No coverage/test/timeout/exclusion weakening.
4. Run TS7, exact changed-source ESLint/Prettier, JSDoc, file size, actual module boundaries, full provenance/source-tree, shared/Calc inventories, related tooling, routing/doctor and diff. Full suite task51, no unnecessary repeat native builds or unchanged full tests.
5. Record verification and residual unported public template/service/pool/cell/document/UI contracts; meaningful intentional commit, separate EVALUATOR phase, clean direct close. Keep full goal active until actual complete Calc outcome.

## Verification

Command: node scripts/uno-sequence-native-probe.mjs --write and --check (exact output/playwright/task42-checks/native-write-safe-guards.log and native-check-safe-guards.log).
Result: pass, complete original sequence/data/any translation units and69 genuine dependency owners;358 pinned original source hashes. Complete normal and ASan/UBSan streams identical: lifecycle2089840, helpers1288, guards4460 bytes. Three complete portable replay cases match every captured byte. Actual native producer/consumer QA and allocator address/capacity/OOM/byte ABI/NaN payload/indeterminate cells remain unverified; signed-count diagnostics explicitly bounded and sanitizer-defined.

Command: node output/playwright/task42-checks/sequence-portable.mjs (exact underlying argv and cwd in value-calc-manifest.json/value-shared-manifest.json).
Result: pass with all3 original source links absent, exact targets restored in finally. Calc106 tests/24 files/19 executable owners S2920 B2055 F474 L2564; related shared120 tests/36 files/49 executable owners S3190 B1555 F427 L2847. All raw S/F/B counters positive and S/B/F/L100; full counter audit value-coverage-audit.json. Existing4 copy replay cases retain strict scalar boolean contract. Native copy assembled driver byte-identical to predecessor (caller-extraction-audit.json).

Command: node output/playwright/task42-checks/sequence-gates.mjs, repairs from docs/provenance after concrete failures; exact effective checks in value-gates-final-manifest.json. npx prettier --check on all9 changed TS/JS sources and final exact native-probe ESLint after documentation callback repair.
Result: all13 effective gates exit0: TS7, exact lint, JSDoc, file size, real module boundaries, exhaustive provenance/tree, shared/Calc inventory, related tooling, policy routing, doctor, diff. Prettier and final lint pass. No runtime/library substitute, assertion/coverage relaxation, dependency-cycle relaxation or Writer runtime change. CALC-051 records original raw sal_Bool sequence/scalar difference without correcting it.

Scope: complete shared original C sequence engine prerequisite; public C++ template, weak/services/classification/CharClass/SharedStringPool and Calc cell/document/edit/view/UI remain subsequent work. Broad parity flags remain false. Last full task41; next scheduled full task51; no full-suite replay this atomic task.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T17:52:42.476Z — VERIFY — ok

By: CODER

Note: Complete original C sequence streams match; source-absent Calc106 and related shared120 pass with every raw counter positive and S/B/F/L100; all13 gates and exact restoration pass. Evidence in output/playwright/task42-checks manifests and task Verification; native allocator/ABI and downstream template/service/UI limitations retained.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T17:52:41.470Z, excerpt_hash=sha256:371608c4517e4942ed48b2954583a27e98ce64e6d38fe6a7e3138a4a5032afc4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610111709-3KND03/blueprint/resolved-snapshot.json
- old_digest: 151b771a7152c20f2495797943790c8d18e80dc537d9bd6bffd49ec05e7dbff0
- current_digest: 151b771a7152c20f2495797943790c8d18e80dc537d9bd6bffd49ec05e7dbff0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610111709-3KND03

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610111709-3KND03
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task42 intentional commits if needed. Keep task41 and unrelated active tasks unchanged. Restore original symlinks on every source-absent runner exit; no native original file mutation.

## Findings

Previous goal turn is concrete progress: tasks40/41 completed, full15084/668 raw100 and all final gates pass at1daed692, followed by requested pause. Authoritative goal now active (explicit continuation) and calc checkout clean. Original casing body constructs Sequence<int32> offsets and Sequence<OUString> results; public sequence wrapper absent and sequence.cxx currently exposes only prior count-view/zero-count destruction boundary. Source engine is915lines; a source-mapped helper split may be required by repository600-line budget. Reuse existing default/copy/destruction and true native build, no provisional string service.

- Observation: Initial TS7 reports original compound nSize viewed through compound declaration and nullable indirect element refs.
  Impact: Source-faithful runtime paths implemented; static declaration casts must use existing actual full-description and supported nonnull element contracts.
  Resolution: Use nSize from actual description D, preserving original source variable ownership; use existing source cast convention for valid indirect pType R. No runtime fallback or type provider introduced.

- Observation: Shared native value/type/callback observer setup is already present in copy probe/test; engine source uses repeated primitive memset/memcpy bodies.
  Impact: Duplicating original caller setup would create a second fixture model; native raw byte operations require logical addressed-storage adaptation in browser.
  Resolution: Extract unchanged native caller prefix and portable observer/type setup into reusable helpers (native assembled old driver SHA256 byte-identical). Preserve source switch tags/widths and share only identical primitive memory operations via typed addressed adapters. No runtime type/allocator substitute or physical ABI/NaN payload/resource-failure claim. Native Sequence public template remains next.

- Observation: Native normal caller compilation failed for missing declaration of the actual private typelib_typedescription_newEmpty diagnostic setup API; helper extraction TS7 also found one unused old expect import.
  Impact: No native observations captured yet; runtime implementation untouched by these caller/preparation failures.
  Resolution: Use the identical true private signature already employed in verified copy native caller and remove only unused test import. Native library bodies remain genuine, complete and unchanged; recompute route and rerun original caller.

- Observation: Initial portable sequence tests called destruction wrapper from destr module instead of its actual data.cxx owner; all4 prior copy tests passed after observer extraction.
  Impact: Three sequence cases stopped at cleanup before complete comparison; no native/runtime mismatch established.
  Resolution: Use existing globals.destructSequence from the same actual data owner as verified copy caller, retaining original boundary rather than adding an alias. Keep complete captures and rerun focused tests.

- Observation: Focused repair runner was accidentally launched from repository root; shared test includes are relative to apps/office, so zero tests were discovered and exit1.
  Impact: This is not a portable pass or acceptance observation; native exact --check completed normally with358 hashes and full sanitizer-identical streams.
  Resolution: Use authoritative apps/office cwd for shared Vitest command, preserving exact test list, coverage owners and thresholds.

- Observation: Actual sequence memcpy retains original sal_Bool unsigned bytes2/255; shared data-copy observer intentionally expects boolean because copy.hxx explicitly applies bool(source). Lifecycle comparison stopped on that observer assertion.
  Impact: Portable sequence engine preserved the original values; the reusable observer needs an explicit raw-byte mode rather than normalization or weakening the existing data-copy contract.
  Resolution: Add opt-in SAL_Bool unsigned-byte observation for the actual sequence captures, keep default strict logical boolean assertion for all old copy tests. Preserve both original paths; investigate and document bounded source difference after full native/portable comparison.

- Observation: All7 focused portable cases and complete native streams match. New element helper raw100; main source has two old count/destroy owners covered by prior related tests and two signed-count source guard paths not exercised yet.
  Impact: Focused profile is not100 acceptance. Native full-description negative-count behavior and initialized diagnostic-only header guard branch must be observed without fake allocator or dropping original conditions.
  Resolution: Retain all original guards. Add two separately marked original byte-sequence diagnostic histories: negative shared target size (no element writes) and initialized negative header count with only byte writes at offsets7/8 within nine-byte native allocation, no invalid/indeterminate tail reads. Their specific fields/results are bounded observations, not valid producer/general malformed header/binary alias parity. Recheck actual normal/ASan/UBSan corpus and combined related source-absent raw100.

- Observation: First attempted malformed-header BYTE diagnostic was rejected by UBSan: original sizeof multiplication converts negative index to unsigned pointer offset and overflows at sequence.cxx107. It is not accepted fixture data or a supported producer defect.
  Impact: No sanitizer pass or portable parity claim may include this path; physically in-allocation address alone did not prove defined pointer arithmetic.
  Resolution: Remove that unsafe diagnostic. Use initialized CHAR header count-1 and target2147483646: signed rest is2147483647, original positive allocation guard rejects size before any pointer/element operation, leaves header untouched. Keep separately observed negative full-description target on a valid shared sequence (no element operation). Preserve original conditions and thresholds; recapture and require exact sanitizer-identical streams. No upstream runtime correction.

- Observation: TS7 found the raw-byte observer option forwarded into context, where it is unused; its actual consumer is createUnoNativeInputs.value.
  Impact: Static check failed before other gates; no runtime mismatch.
  Resolution: Keep option solely on its consuming observer; remove unused context parameter/forwarding without changing assertions or source behavior.

- Observation: Exact JSDoc gate rejected source-hash mapping callback in new native probe.
  Impact: Documentation gate stopped after typecheck and lint passed.
  Resolution: Document only this callback; retain complete source hashing and all acceptance criteria.

- Observation: Source provenance gate correctly requires an explicit filename divergence for the sequence-elements.ts source function split.
  Impact: Runtime record exists but mapping has no budget-driven responsibility-split explanation.
  Resolution: Add that explanation to the existing new provenance record; preserve source ownership and filename enforcement.

- Observation: Direct finish correctly rejected dirty tracked task README produced by the separate EVALUATOR record.
  Impact: Task remains verified pending closure; implementation is committed and clean, but quality artifacts need their own task-scoped checkpoint.
  Resolution: Commit only this task README/quality artifacts, then retry canonical finish with the actual implementation hash. No runtime edits or acceptance changes.
