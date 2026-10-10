---
id: "202610101405-RCRBVD"
title: "Port original shared UTF16 reverse comparison required by Calc cell strings"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T14:07:18.915Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-10T14:19:04.877Z"
  updated_by: "CODER"
  note: "Complete unchanged native10084calls/20168results/4assert guards, portable Calc106/shared2 allfour100 and raw counters, source/inventory/ownership/static gates pass. Actual shared SAL source/header boundaries retained; no stand-in string owners. Task2/10,nextfull41."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port the actual original initialized UTF16 reverse comparator at SAL source/header boundaries; complete unchanged native captures, portable coverage and exhaustive inventory on calc only."
events:
  -
    type: "status"
    at: "2026-10-10T14:07:20.145Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the actual original initialized UTF16 reverse comparator at SAL source/header boundaries; complete unchanged native captures, portable coverage and exhaustive inventory on calc only."
  -
    type: "verify"
    at: "2026-10-10T14:19:04.877Z"
    author: "CODER"
    state: "ok"
    note: "Complete unchanged native10084calls/20168results/4assert guards, portable Calc106/shared2 allfour100 and raw counters, source/inventory/ownership/static gates pass. Actual shared SAL source/header boundaries retained; no stand-in string owners. Task2/10,nextfull41."
doc_version: 3
doc_updated_at: "2026-10-10T14:19:04.934Z"
doc_updated_by: "CODER"
description: "Task33: establish the actual sal/rtl reverse comparison and header contracts needed by original svl::SharedString equality. Preserve original complete algorithms, UTF16 code-unit semantics and exact result magnitudes; native unchanged-source evidence, portable tests, actual100 Calc/changed-shared coverage, exhaustive inventory, no fabricated OUString or string store. Continue approved UI-prerequisite spine on branch calc only."
sections:
  Summary: "Task33 establishes the original shared UTF16 reverse comparison used by svl::SharedString equality, required for actual Calc string cell values. Preserve source owners and exact comparison magnitude, no stand-in string model."
  Scope: "sal/rtl/strtmpl.ts, sal/rtl/ustring.ts and sal/inc/rtl/ustring.h.ts; shared portable tests/native fixtures and scripts/rtl-ustring-native-probe.mjs; sal ownership registration and tests in existing module-boundary checker; exhaustive shared runtime/provenance/operation/capability records; docs/program/calc-core.md. No other RTL algorithms, string allocator/OUString/SharedString stubs, Writer/UI/network/config/branch edits. Suspicious defined/undefined source observations, if actually reproduced, go to calc-upstream-suspected-issues.md without fixes."
  Plan: "Port the complete initialized UTF16 reverse-comparison dependency used by original SharedString equality: CompareNormal and reverseCompare_WithLengths at sal/rtl/strtmpl.ts; original C API wrapper at sal/rtl/ustring.ts and original include/rtl/ustring.h boundary at sal/inc/rtl/ustring.h.ts. Explicit Uint16Array|null buffers and lengths adapt native UTF16 pointers; compile-time same-width character/template witnesses retain exact unsigned16 subtraction and suffix traversal. Register actual sal module in boundary checker, tests for its ownership. Native probe extracts all needed original full scopes unchanged, verifies pinned blobs/source/scope hashes, compiles with ASan/UBSan and captures complete direct/public results over embedded NUL, surrogate, unsigned and length/suffix cases plus borrowed subarray offsets. Meaningful portable shared tests, all Calc coverage100 and changed shared coverage100, boundary/provenance/registry tests and static gates. Add exhaustive runtime/provenance/exported-operation records, one atomic shared comparison capability and Calc roadmap evidence; preserve whole-module parity as unverified. Task33 is2/10 since last full31; nextfull41; no full, Writer edits, fake string storage/OUString, configs/threshold/timeouts changes, network or branch operations. Commit, EVALUATOR evidence review and clean task closure."
  Verify Steps: "Read brief, next-action, verify-show. node scripts/rtl-ustring-native-probe.mjs --write then --check: complete unchanged original UChar/warning/CompareNormal/reverseCompare scopes, C wrapper and declaration, exact pinned full source/scope hashes and ASan/UBSan. Portable replay compares complete direct/public outputs for all pairs and valid explicit prefixes/subarray offsets, embedded NUL, signed-looking UInt16 and surrogate units, unequal lengths and suffix precedence; no expected comparator implemented by generator. Run npm run test:coverage:calc and npm run test:coverage:shared -- src/sal/rtl/ustring.test.ts --coverage.include=src/sal/rtl/strtmpl.ts --coverage.include=src/sal/rtl/ustring.ts --coverage.reportsDirectory=coverage/rtl-ustring with both upstream symlinks absent and exact finally restore. All four metrics100; all actual raw counters positive and expected source owners present. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; related module-boundary and registry tests; ordinary eligible authored-file formatter; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Source-shaped owner registration must not allow browser dependencies; initialized UInt16 valid length/pointer preconditions documented rather than repaired. EVALUATOR review actual native corpus, raw counters, source/scopes, exhaustive records and commit; task closure with branchcalc clean. No full run task2/10; next41."
  Verification: |-
    PASS: unchanged pinned native4fullsources/6scopes under ASan/UBSan,10084calls/20168complete direct/public results and4genuine SIGABRT assertion diagnostics. Portable absent-upstream Calc106/24 and sharedRTL2/1, exact finally symlink restore. Actual Calc S2920/B2055/F474/L2564 and sharedRTL S21/B16/F3/L16 allfour100 with positive raw counters. Typecheck/lint/docs/size/dependencies/tree/provenance and Calc/shared inventories, provenance3 and module-boundary/registry24 tests, routing/doctor/diff pass; doctor0errors/2unchanged inherited warnings. Task2/10 after full31, next41; no full/Writer/config/threshold/timeouts changes. Exhaustive source/header/runtime/provenance/capability links and automatically extracted read-only exports; distinct original C/C++ header module identity documented. Implementation and EVALUATOR evidence commits follow.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-10T14:19:04.877Z — VERIFY — ok

    By: CODER

    Note: Complete unchanged native10084calls/20168results/4assert guards, portable Calc106/shared2 allfour100 and raw counters, source/inventory/ownership/static gates pass. Actual shared SAL source/header boundaries retained; no stand-in string owners. Task2/10,nextfull41.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T14:19:03.969Z, excerpt_hash=sha256:7ef366b41e85b7304fdc783be8dbedb2397300d029b4848b1b8e5682467ce01a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101405-RCRBVD/blueprint/resolved-snapshot.json
    - old_digest: 7e6d554b24f14eb0e24d42fabf4115c3749b1c46a7a36837db2c11ff45aa3b63
    - current_digest: 7e6d554b24f14eb0e24d42fabf4115c3749b1c46a7a36837db2c11ff45aa3b63
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101405-RCRBVD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610101405-RCRBVD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit through the approved local workflow; retain completed task history. No destructive reset, Writer or upstream changes."
  Findings: |-
    Preflight: clean branchcalc at completed task32. Local upstream exists and is approved. Original SharedString equality compares only original data after pointer/null/length guards via rtl_ustr_reverseCompare_WithLength; it depends on actual RTL identity/refcount owners which are absent. This prerequisite ports that real comparison dependency at SAL source/header boundaries before those owners, without fabricating them. Original SAL owns include/rtl exports, so local header sal/inc/rtl/ustring.h.ts preserves C header identity and leaves ustring.hxx for its distinct C++ owner. Required runtime module registration is in scope. Last full31, task33 is2/10; next41. Existing unrelated doing tasks untouched.

    - Observation: Initial native probe --write stopped before compilation: the ASCII helper extraction used a nonexistent following comment marker.
      Impact: No native fixture or result was accepted; original source remained unchanged.
      Resolution: Bound the exact original ASCII helper by its real following preprocessor block, including its unchanged isUnicodeCodePoint prerequisite; rerun capture without rewriting source.

    - Observation: Source-provenance gate rejects the new ustring.h.ts filename because normalized stem ustring.h differs from the native ustring stem.
      Impact: Typecheck/lint/docs/size/dependency/tree gates pass; filename evidence must explicitly record preserved C header suffix before provenance can pass.
      Resolution: Register this exact source-backed filename distinction in the existing divergence ledger to preserve independent ustring.h and future ustring.hxx owners; do not alter filename validation or fabricate another native source.

    - Observation: Scoped inventory validation identified two comparison functions wrongly placed in the mutation-helper operation collection.
      Impact: Source provenance passed; the operation ledger must match its actual mutation/export contract.
      Resolution: Use the existing module exportedOperations representation for these read-only exported functions and remove only the two fresh misclassified operation records. Keep both symbols, capability links and native evidence exhaustive without validator changes.

    - Observation: All task33 required gates and scoped tests now pass. No new suspicious upstream case was identified; original reverse order/exact magnitudes and four native guards are preserved.
      Impact: Calc106/24 and changed-shared2/1 actual100; complete native10084/20168 retained, all present raw counters positive; source-shaped shared SAL dependency ready for actual string value owners. Full module/document/UI remain incomplete.
      Resolution: Evidence: output/playwright/task33-audit.json, task33-tests/manifest.json/logs, task33-gates/manifest.json/logs, native driver/output/guard stderr and actual coverage-final/summary files. Driver SHA256 7683486c5a90b7631ba7cf9fe75a05ec6f74fa39d35fe7a93a2a41555c055f57. Inventories Calc45/166 and shared22/136, zero semantic violations; source-provenance3 and boundary/registry24 cases pass. Four original assertions use fail-fast Error; C++ SIGABRT/release builds/ABI/lifetime and generic other char/Compare variants remain unverified. Full next41. Commit, read-only EVALUATOR review and close active task.
id_source: "generated"
---
## Summary

Task33 establishes the original shared UTF16 reverse comparison used by svl::SharedString equality, required for actual Calc string cell values. Preserve source owners and exact comparison magnitude, no stand-in string model.

## Scope

sal/rtl/strtmpl.ts, sal/rtl/ustring.ts and sal/inc/rtl/ustring.h.ts; shared portable tests/native fixtures and scripts/rtl-ustring-native-probe.mjs; sal ownership registration and tests in existing module-boundary checker; exhaustive shared runtime/provenance/operation/capability records; docs/program/calc-core.md. No other RTL algorithms, string allocator/OUString/SharedString stubs, Writer/UI/network/config/branch edits. Suspicious defined/undefined source observations, if actually reproduced, go to calc-upstream-suspected-issues.md without fixes.

## Plan

Port the complete initialized UTF16 reverse-comparison dependency used by original SharedString equality: CompareNormal and reverseCompare_WithLengths at sal/rtl/strtmpl.ts; original C API wrapper at sal/rtl/ustring.ts and original include/rtl/ustring.h boundary at sal/inc/rtl/ustring.h.ts. Explicit Uint16Array|null buffers and lengths adapt native UTF16 pointers; compile-time same-width character/template witnesses retain exact unsigned16 subtraction and suffix traversal. Register actual sal module in boundary checker, tests for its ownership. Native probe extracts all needed original full scopes unchanged, verifies pinned blobs/source/scope hashes, compiles with ASan/UBSan and captures complete direct/public results over embedded NUL, surrogate, unsigned and length/suffix cases plus borrowed subarray offsets. Meaningful portable shared tests, all Calc coverage100 and changed shared coverage100, boundary/provenance/registry tests and static gates. Add exhaustive runtime/provenance/exported-operation records, one atomic shared comparison capability and Calc roadmap evidence; preserve whole-module parity as unverified. Task33 is2/10 since last full31; nextfull41; no full, Writer edits, fake string storage/OUString, configs/threshold/timeouts changes, network or branch operations. Commit, EVALUATOR evidence review and clean task closure.

## Verify Steps

Read brief, next-action, verify-show. node scripts/rtl-ustring-native-probe.mjs --write then --check: complete unchanged original UChar/warning/CompareNormal/reverseCompare scopes, C wrapper and declaration, exact pinned full source/scope hashes and ASan/UBSan. Portable replay compares complete direct/public outputs for all pairs and valid explicit prefixes/subarray offsets, embedded NUL, signed-looking UInt16 and surrogate units, unequal lengths and suffix precedence; no expected comparator implemented by generator. Run npm run test:coverage:calc and npm run test:coverage:shared -- src/sal/rtl/ustring.test.ts --coverage.include=src/sal/rtl/strtmpl.ts --coverage.include=src/sal/rtl/ustring.ts --coverage.reportsDirectory=coverage/rtl-ustring with both upstream symlinks absent and exact finally restore. All four metrics100; all actual raw counters positive and expected source owners present. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; related module-boundary and registry tests; ordinary eligible authored-file formatter; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Source-shaped owner registration must not allow browser dependencies; initialized UInt16 valid length/pointer preconditions documented rather than repaired. EVALUATOR review actual native corpus, raw counters, source/scopes, exhaustive records and commit; task closure with branchcalc clean. No full run task2/10; next41.

## Verification

PASS: unchanged pinned native4fullsources/6scopes under ASan/UBSan,10084calls/20168complete direct/public results and4genuine SIGABRT assertion diagnostics. Portable absent-upstream Calc106/24 and sharedRTL2/1, exact finally symlink restore. Actual Calc S2920/B2055/F474/L2564 and sharedRTL S21/B16/F3/L16 allfour100 with positive raw counters. Typecheck/lint/docs/size/dependencies/tree/provenance and Calc/shared inventories, provenance3 and module-boundary/registry24 tests, routing/doctor/diff pass; doctor0errors/2unchanged inherited warnings. Task2/10 after full31, next41; no full/Writer/config/threshold/timeouts changes. Exhaustive source/header/runtime/provenance/capability links and automatically extracted read-only exports; distinct original C/C++ header module identity documented. Implementation and EVALUATOR evidence commits follow.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-10T14:19:04.877Z — VERIFY — ok

By: CODER

Note: Complete unchanged native10084calls/20168results/4assert guards, portable Calc106/shared2 allfour100 and raw counters, source/inventory/ownership/static gates pass. Actual shared SAL source/header boundaries retained; no stand-in string owners. Task2/10,nextfull41.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T14:19:03.969Z, excerpt_hash=sha256:7ef366b41e85b7304fdc783be8dbedb2397300d029b4848b1b8e5682467ce01a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101405-RCRBVD/blueprint/resolved-snapshot.json
- old_digest: 7e6d554b24f14eb0e24d42fabf4115c3749b1c46a7a36837db2c11ff45aa3b63
- current_digest: 7e6d554b24f14eb0e24d42fabf4115c3749b1c46a7a36837db2c11ff45aa3b63
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101405-RCRBVD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610101405-RCRBVD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit through the approved local workflow; retain completed task history. No destructive reset, Writer or upstream changes.

## Findings

Preflight: clean branchcalc at completed task32. Local upstream exists and is approved. Original SharedString equality compares only original data after pointer/null/length guards via rtl_ustr_reverseCompare_WithLength; it depends on actual RTL identity/refcount owners which are absent. This prerequisite ports that real comparison dependency at SAL source/header boundaries before those owners, without fabricating them. Original SAL owns include/rtl exports, so local header sal/inc/rtl/ustring.h.ts preserves C header identity and leaves ustring.hxx for its distinct C++ owner. Required runtime module registration is in scope. Last full31, task33 is2/10; next41. Existing unrelated doing tasks untouched.

- Observation: Initial native probe --write stopped before compilation: the ASCII helper extraction used a nonexistent following comment marker.
  Impact: No native fixture or result was accepted; original source remained unchanged.
  Resolution: Bound the exact original ASCII helper by its real following preprocessor block, including its unchanged isUnicodeCodePoint prerequisite; rerun capture without rewriting source.

- Observation: Source-provenance gate rejects the new ustring.h.ts filename because normalized stem ustring.h differs from the native ustring stem.
  Impact: Typecheck/lint/docs/size/dependency/tree gates pass; filename evidence must explicitly record preserved C header suffix before provenance can pass.
  Resolution: Register this exact source-backed filename distinction in the existing divergence ledger to preserve independent ustring.h and future ustring.hxx owners; do not alter filename validation or fabricate another native source.

- Observation: Scoped inventory validation identified two comparison functions wrongly placed in the mutation-helper operation collection.
  Impact: Source provenance passed; the operation ledger must match its actual mutation/export contract.
  Resolution: Use the existing module exportedOperations representation for these read-only exported functions and remove only the two fresh misclassified operation records. Keep both symbols, capability links and native evidence exhaustive without validator changes.

- Observation: All task33 required gates and scoped tests now pass. No new suspicious upstream case was identified; original reverse order/exact magnitudes and four native guards are preserved.
  Impact: Calc106/24 and changed-shared2/1 actual100; complete native10084/20168 retained, all present raw counters positive; source-shaped shared SAL dependency ready for actual string value owners. Full module/document/UI remain incomplete.
  Resolution: Evidence: output/playwright/task33-audit.json, task33-tests/manifest.json/logs, task33-gates/manifest.json/logs, native driver/output/guard stderr and actual coverage-final/summary files. Driver SHA256 7683486c5a90b7631ba7cf9fe75a05ec6f74fa39d35fe7a93a2a41555c055f57. Inventories Calc45/166 and shared22/136, zero semantic violations; source-provenance3 and boundary/registry24 cases pass. Four original assertions use fail-fast Error; C++ SIGABRT/release builds/ABI/lifetime and generic other char/Compare variants remain unverified. Full next41. Commit, read-only EVALUATOR review and close active task.
