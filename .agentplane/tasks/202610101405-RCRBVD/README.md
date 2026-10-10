---
id: "202610101405-RCRBVD"
title: "Port original shared UTF16 reverse comparison required by Calc cell strings"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
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
doc_version: 3
doc_updated_at: "2026-10-10T14:07:20.145Z"
doc_updated_by: "CODER"
description: "Task33: establish the actual sal/rtl reverse comparison and header contracts needed by original svl::SharedString equality. Preserve original complete algorithms, UTF16 code-unit semantics and exact result magnitudes; native unchanged-source evidence, portable tests, actual100 Calc/changed-shared coverage, exhaustive inventory, no fabricated OUString or string store. Continue approved UI-prerequisite spine on branch calc only."
sections:
  Summary: "Task33 establishes the original shared UTF16 reverse comparison used by svl::SharedString equality, required for actual Calc string cell values. Preserve source owners and exact comparison magnitude, no stand-in string model."
  Scope: "sal/rtl/strtmpl.ts, sal/rtl/ustring.ts and sal/inc/rtl/ustring.h.ts; shared portable tests/native fixtures and scripts/rtl-ustring-native-probe.mjs; sal ownership registration and tests in existing module-boundary checker; exhaustive shared runtime/provenance/operation/capability records; docs/program/calc-core.md. No other RTL algorithms, string allocator/OUString/SharedString stubs, Writer/UI/network/config/branch edits. Suspicious defined/undefined source observations, if actually reproduced, go to calc-upstream-suspected-issues.md without fixes."
  Plan: "Port the complete initialized UTF16 reverse-comparison dependency used by original SharedString equality: CompareNormal and reverseCompare_WithLengths at sal/rtl/strtmpl.ts; original C API wrapper at sal/rtl/ustring.ts and original include/rtl/ustring.h boundary at sal/inc/rtl/ustring.h.ts. Explicit Uint16Array|null buffers and lengths adapt native UTF16 pointers; compile-time same-width character/template witnesses retain exact unsigned16 subtraction and suffix traversal. Register actual sal module in boundary checker, tests for its ownership. Native probe extracts all needed original full scopes unchanged, verifies pinned blobs/source/scope hashes, compiles with ASan/UBSan and captures complete direct/public results over embedded NUL, surrogate, unsigned and length/suffix cases plus borrowed subarray offsets. Meaningful portable shared tests, all Calc coverage100 and changed shared coverage100, boundary/provenance/registry tests and static gates. Add exhaustive runtime/provenance/exported-operation records, one atomic shared comparison capability and Calc roadmap evidence; preserve whole-module parity as unverified. Task33 is2/10 since last full31; nextfull41; no full, Writer edits, fake string storage/OUString, configs/threshold/timeouts changes, network or branch operations. Commit, EVALUATOR evidence review and clean task closure."
  Verify Steps: "Read brief, next-action, verify-show. node scripts/rtl-ustring-native-probe.mjs --write then --check: complete unchanged original UChar/warning/CompareNormal/reverseCompare scopes, C wrapper and declaration, exact pinned full source/scope hashes and ASan/UBSan. Portable replay compares complete direct/public outputs for all pairs and valid explicit prefixes/subarray offsets, embedded NUL, signed-looking UInt16 and surrogate units, unequal lengths and suffix precedence; no expected comparator implemented by generator. Run npm run test:coverage:calc and npm run test:coverage:shared -- src/sal/rtl/ustring.test.ts --coverage.include=src/sal/rtl/strtmpl.ts --coverage.include=src/sal/rtl/ustring.ts --coverage.reportsDirectory=coverage/rtl-ustring with both upstream symlinks absent and exact finally restore. All four metrics100; all actual raw counters positive and expected source owners present. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; related module-boundary and registry tests; ordinary eligible authored-file formatter; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Source-shaped owner registration must not allow browser dependencies; initialized UInt16 valid length/pointer preconditions documented rather than repaired. EVALUATOR review actual native corpus, raw counters, source/scopes, exhaustive records and commit; task closure with branchcalc clean. No full run task2/10; next41."
  Verification: "Pending actual native capture and targeted tests."
  Rollback Plan: "Revert only this task implementation commit through the approved local workflow; retain completed task history. No destructive reset, Writer or upstream changes."
  Findings: "Preflight: clean branchcalc at completed task32. Local upstream exists and is approved. Original SharedString equality compares only original data after pointer/null/length guards via rtl_ustr_reverseCompare_WithLength; it depends on actual RTL identity/refcount owners which are absent. This prerequisite ports that real comparison dependency at SAL source/header boundaries before those owners, without fabricating them. Original SAL owns include/rtl exports, so local header sal/inc/rtl/ustring.h.ts preserves C header identity and leaves ustring.hxx for its distinct C++ owner. Required runtime module registration is in scope. Last full31, task33 is2/10; next41. Existing unrelated doing tasks untouched."
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

Pending actual native capture and targeted tests.

## Rollback Plan

Revert only this task implementation commit through the approved local workflow; retain completed task history. No destructive reset, Writer or upstream changes.

## Findings

Preflight: clean branchcalc at completed task32. Local upstream exists and is approved. Original SharedString equality compares only original data after pointer/null/length guards via rtl_ustr_reverseCompare_WithLength; it depends on actual RTL identity/refcount owners which are absent. This prerequisite ports that real comparison dependency at SAL source/header boundaries before those owners, without fabricating them. Original SAL owns include/rtl exports, so local header sal/inc/rtl/ustring.h.ts preserves C header identity and leaves ustring.hxx for its distinct C++ owner. Required runtime module registration is in scope. Last full31, task33 is2/10; next41. Existing unrelated doing tasks untouched.
