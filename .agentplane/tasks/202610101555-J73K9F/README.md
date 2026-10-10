---
id: "202610101555-J73K9F"
title: "Port original OUString comparison and SharedStringPool hashed-key owners"
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
  updated_at: "2026-10-10T15:57:28.079Z"
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
    body: "Start: Port original OUString comparisons/hash and complete actual StringWithHash key ownership using shared RTL and unchanged native full-header evidence on branchcalc."
events:
  -
    type: "status"
    at: "2026-10-10T15:57:29.297Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port original OUString comparisons/hash and complete actual StringWithHash key ownership using shared RTL and unchanged native full-header evidence on branchcalc."
doc_version: 3
doc_updated_at: "2026-10-10T15:57:29.297Z"
doc_updated_by: "CODER"
description: "Task36 closes actual shared pool/storage key dependencies: original OUString compareTo/equals/hash and bounded original relational operations, plus complete StringWithHash struct with original constructor/equality/std hash and implicit copy/move/assignment/lifetime. Reuse SAL/SVL owners and full unchanged native headers/dependencies; no fake CharClass or pool, no JS Unicode casing replacement. Native complete initialized owner/cache/refcount/allocation/query observations and strict Calc/affected shared100; task5/10 after full31,next41. Branchcalc only; actual locale case mapping/pool/typed cell writes remain next dependencies."
sections:
  Summary: "Task36 supplies the actual shared value-comparison/hash dependencies and complete original StringWithHash key owner used by SharedStringPool, required before real Calc text storage. Reuse shared SAL/SVL data and full native source ownership. Task5/10 after full31,next full41; whole Calc and actual pool/locale service remain unfinished."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branchcalc. Extend apps/office/src/sal/inc/rtl/ustring.ts with actual represented original OUString equals/hashCode/compareTo/reverseCompareTo, original equality/inequality/ordering adapters and OUStringHash functor; normal represented OUString/reference inputs, not unrelated conversions/ASCII casing/shortened search algorithms. Add complete original private StringWithHash struct at its actual svl/source/misc/sharedstringpool.ts owner, including native cached hash/equality/std::hash callback and implicit copy/move/assignment/destruction adapters. No synthetic SharedStringPool or CharClass declaration, no fake locale service/JS casing. Native script scripts/rtl-string-key-native-probe.mjs and portable fixture/test under svl/source/misc; reuse scripts/rtl-ustring-native-sources.mjs, factoring verified unchanged full-header configuration/lifetime prefix from existing scripts/rtl-sharedstring-native-probe.mjs into shared helpers if needed without changing its driver/corpus. Extend exhaustive shared runtime/provenance/capability records for actual modules, docs/program/calc-core.md and calc-upstream-suspected-issues.md only for genuinely identified native suspicious conditions, active task artifacts. No Writer/modules, network, merges, branches, policy/verification relaxations. Native64-bit size_t hash representation is explicit and broad native ABI/other targets remain unverified."
  Plan: |-
    1. Verify exact native full OUString header, StringWithHash anonymous struct/std::hash specialization and complete implicit-member behavior. Establish normal runtime/const-reference comparison/hash operators and same cached-key/default/lifetime rules. Actual locale/CharClass pipeline is a later required dependency, never substituted.
    2. Port complete source-backed OUString represented comparisons/hash and real cached key with implicit special-member owners. Preserve signed32 hash and selected64-bit size_t casts, stale native cached-key behavior if a mutable caller changes fields, source pointer/counter order. Literal/copy/move/no-acquire data ownership stays in the single shared RTL owner. Explicit methods adapt C++ operators/rvalues/destructors only.
    3. Reuse native full-header/type/config/RTL functions in a common probe helper without changing task35 driver164be221 or any4424 states/2 runtime guards/3 compile guards/3 diagnoses; prior task34 driver44ad48ef/3336/20 stays unchanged. Compile original unchanged key/hash/full-header classes, never hand-written C++ substitutes. Capture complete initialized owner/key/cache/refcount/data/events/results, all comparison outputs and signed/unsigned hash strings over real collisions/nonASCII/NUL/surrogate cases, moves/copies/assignment/self assignment and native destructor cleanup. Diagnose invalid native input separately without post-UB golden results.
    4. Fill exhaustive original-symbol/runtime/provenance/capability inventories with Foundation/unverified broad status and clear representation/remaining-service gaps; update actual core roadmap/journal. No raw JS string identity/casing changes replace actual native keys.
    5. Serial native --check for new and unchanged existing corpora; portable Calc and affected shared strict S/B/F/L100/all actual raw counters positive/complete source maps with both upstream symlinks absent and restored finally; affected source/registry/boundary tooling. Typecheck/lint/JSDoc/size/deps/tree/provenance/scoped inventories/changed-file format/routing/doctor/diff. Commit implementation, separate read-only EVALUATOR quality and task closure with clean branchcalc. No full suite until task41.
  Verify Steps: |-
    1. node scripts/rtl-string-key-native-probe.mjs --check: full pinned actual C++ headers/complete original key and hash source, all initialized pointer/cache/refcount/allocator/query snapshots and actual native diagnostics; exact full-file/scope/driver/output digests. node scripts/rtl-sharedstring-native-probe.mjs --check retains all4424 snapshots/2 runtime guards/3 compile guards/3 invalid diagnoses and driver164be221; node scripts/rtl-ustring-ownership-native-probe.mjs --check retains3336/20 and driver44ad48ef when shared extraction changes.
    2. npm run test:coverage:calc: every actual Calc case, all-four100 and raw positive. Affected new/existing SAL/SVL string/key tests with exact executable source includes, all-four100 and actual source completeness; repeat portable checks with both original vendor links absent/restored in finally. Real native collisions/negative hashes/operator results and key ownership copy/move/destruction must be compared, no mirrored expected algorithm.
    3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; affected module-boundary/source-provenance/registry tests; changed nongenerated file formatting; routing/ap doctor/git diff --check. Provenance/native checks require restored pinned sources; no concurrent removal. All pass without thresholds/assertions/exclusion/time-budget relaxation.
    4. Read-only EVALUATOR checks actual implementation commit/source contracts/full digests/counters, no fake pool/CharClass or duplicate shared owner; records nonempty quality findings/evidence/risks. Task verify-show, CLI verification/quality/close pass and final DONE route/branchcalc/clean all tracked/untracked status. No whole run at task5/10; next scheduled41.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "New forward task only to revert task36 comparison/key/native helper/registry/docs changes; rerun exact unchanged prior corpora and scoped gates. Never reset history or mutate upstream, Writer, policy or coverage acceptance. Ignored native output stays inside this repository and both links restored in finally."
  Findings: "Preflight clean branchcalc; only unrelated C9TN6M/X6VV8G DOING. User persistent goal/continue authorizes safe local work. Original SharedStringPool requires actual CharClass uppercase through locale/Unicode casefold/ICU; no existing real common service is present, so implement its exact comparison/hash key closure first rather than inventing that service. Original StringWithHash uses OUString by value and std::move, cached signed32 hash before string equality and signed-to-size_t hash conversion. Full-header native compiler is available from verified task35. Read-only search returned no existing standalone map/charclass files; no source was mutated. Original casefolding conditional Lithuanian pos>len source condition was noticed but no reproduction yet; record only clearly scoped suspected behavior if documented, never claim a confirmed bug."
id_source: "generated"
---
## Summary

Task36 supplies the actual shared value-comparison/hash dependencies and complete original StringWithHash key owner used by SharedStringPool, required before real Calc text storage. Reuse shared SAL/SVL data and full native source ownership. Task5/10 after full31,next full41; whole Calc and actual pool/locale service remain unfinished.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branchcalc. Extend apps/office/src/sal/inc/rtl/ustring.ts with actual represented original OUString equals/hashCode/compareTo/reverseCompareTo, original equality/inequality/ordering adapters and OUStringHash functor; normal represented OUString/reference inputs, not unrelated conversions/ASCII casing/shortened search algorithms. Add complete original private StringWithHash struct at its actual svl/source/misc/sharedstringpool.ts owner, including native cached hash/equality/std::hash callback and implicit copy/move/assignment/destruction adapters. No synthetic SharedStringPool or CharClass declaration, no fake locale service/JS casing. Native script scripts/rtl-string-key-native-probe.mjs and portable fixture/test under svl/source/misc; reuse scripts/rtl-ustring-native-sources.mjs, factoring verified unchanged full-header configuration/lifetime prefix from existing scripts/rtl-sharedstring-native-probe.mjs into shared helpers if needed without changing its driver/corpus. Extend exhaustive shared runtime/provenance/capability records for actual modules, docs/program/calc-core.md and calc-upstream-suspected-issues.md only for genuinely identified native suspicious conditions, active task artifacts. No Writer/modules, network, merges, branches, policy/verification relaxations. Native64-bit size_t hash representation is explicit and broad native ABI/other targets remain unverified.

## Plan

1. Verify exact native full OUString header, StringWithHash anonymous struct/std::hash specialization and complete implicit-member behavior. Establish normal runtime/const-reference comparison/hash operators and same cached-key/default/lifetime rules. Actual locale/CharClass pipeline is a later required dependency, never substituted.
2. Port complete source-backed OUString represented comparisons/hash and real cached key with implicit special-member owners. Preserve signed32 hash and selected64-bit size_t casts, stale native cached-key behavior if a mutable caller changes fields, source pointer/counter order. Literal/copy/move/no-acquire data ownership stays in the single shared RTL owner. Explicit methods adapt C++ operators/rvalues/destructors only.
3. Reuse native full-header/type/config/RTL functions in a common probe helper without changing task35 driver164be221 or any4424 states/2 runtime guards/3 compile guards/3 diagnoses; prior task34 driver44ad48ef/3336/20 stays unchanged. Compile original unchanged key/hash/full-header classes, never hand-written C++ substitutes. Capture complete initialized owner/key/cache/refcount/data/events/results, all comparison outputs and signed/unsigned hash strings over real collisions/nonASCII/NUL/surrogate cases, moves/copies/assignment/self assignment and native destructor cleanup. Diagnose invalid native input separately without post-UB golden results.
4. Fill exhaustive original-symbol/runtime/provenance/capability inventories with Foundation/unverified broad status and clear representation/remaining-service gaps; update actual core roadmap/journal. No raw JS string identity/casing changes replace actual native keys.
5. Serial native --check for new and unchanged existing corpora; portable Calc and affected shared strict S/B/F/L100/all actual raw counters positive/complete source maps with both upstream symlinks absent and restored finally; affected source/registry/boundary tooling. Typecheck/lint/JSDoc/size/deps/tree/provenance/scoped inventories/changed-file format/routing/doctor/diff. Commit implementation, separate read-only EVALUATOR quality and task closure with clean branchcalc. No full suite until task41.

## Verify Steps

1. node scripts/rtl-string-key-native-probe.mjs --check: full pinned actual C++ headers/complete original key and hash source, all initialized pointer/cache/refcount/allocator/query snapshots and actual native diagnostics; exact full-file/scope/driver/output digests. node scripts/rtl-sharedstring-native-probe.mjs --check retains all4424 snapshots/2 runtime guards/3 compile guards/3 invalid diagnoses and driver164be221; node scripts/rtl-ustring-ownership-native-probe.mjs --check retains3336/20 and driver44ad48ef when shared extraction changes.
2. npm run test:coverage:calc: every actual Calc case, all-four100 and raw positive. Affected new/existing SAL/SVL string/key tests with exact executable source includes, all-four100 and actual source completeness; repeat portable checks with both original vendor links absent/restored in finally. Real native collisions/negative hashes/operator results and key ownership copy/move/destruction must be compared, no mirrored expected algorithm.
3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; affected module-boundary/source-provenance/registry tests; changed nongenerated file formatting; routing/ap doctor/git diff --check. Provenance/native checks require restored pinned sources; no concurrent removal. All pass without thresholds/assertions/exclusion/time-budget relaxation.
4. Read-only EVALUATOR checks actual implementation commit/source contracts/full digests/counters, no fake pool/CharClass or duplicate shared owner; records nonempty quality findings/evidence/risks. Task verify-show, CLI verification/quality/close pass and final DONE route/branchcalc/clean all tracked/untracked status. No whole run at task5/10; next scheduled41.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

New forward task only to revert task36 comparison/key/native helper/registry/docs changes; rerun exact unchanged prior corpora and scoped gates. Never reset history or mutate upstream, Writer, policy or coverage acceptance. Ignored native output stays inside this repository and both links restored in finally.

## Findings

Preflight clean branchcalc; only unrelated C9TN6M/X6VV8G DOING. User persistent goal/continue authorizes safe local work. Original SharedStringPool requires actual CharClass uppercase through locale/Unicode casefold/ICU; no existing real common service is present, so implement its exact comparison/hash key closure first rather than inventing that service. Original StringWithHash uses OUString by value and std::move, cached signed32 hash before string equality and signed-to-size_t hash conversion. Full-header native compiler is available from verified task35. Read-only search returned no existing standalone map/charclass files; no source was mutated. Original casefolding conditional Lithuanian pos>len source condition was noticed but no reproduction yet; record only clearly scoped suspected behavior if documented, never claim a confirmed bug.
