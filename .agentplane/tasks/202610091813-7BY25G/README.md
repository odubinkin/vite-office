---
id: "202610091813-7BY25G"
title: "Port Calc UInt16 row segments over shared segment storage"
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
  updated_at: "2026-10-09T18:14:37.008Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T18:37:21.615Z"
  updated_by: "CODER"
  note: "All100 Calc tests actual100 Istanbul four metrics, shared5 actual100, genuine unchanged native706 plus bool436/mdds3020 and five original assertions, portable100+5+30 and declared TS7/static/registry/tooling/provenance gates pass. Lossless62 snapshots retain all observations. CALC-017 preserves upstream. No whole-module parity claim, Writer changes or full-suite rerun; task1/10."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original UInt16 row segment facade and numeric shared-template methods on calc, preserving upstream conditions with genuine native/portable actual100 evidence; task1 of next10."
events:
  -
    type: "status"
    at: "2026-10-09T18:14:38.518Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original UInt16 row segment facade and numeric shared-template methods on calc, preserving upstream conditions with genuine native/portable actual100 evidence; task1 of next10."
  -
    type: "verify"
    at: "2026-10-09T18:37:21.615Z"
    author: "CODER"
    state: "ok"
    note: "All100 Calc tests actual100 Istanbul four metrics, shared5 actual100, genuine unchanged native706 plus bool436/mdds3020 and five original assertions, portable100+5+30 and declared TS7/static/registry/tooling/provenance gates pass. Lossless62 snapshots retain all observations. CALC-017 preserves upstream. No whole-module parity claim, Writer changes or full-suite rerun; task1/10."
doc_version: 3
doc_updated_at: "2026-10-09T18:38:58.353Z"
doc_updated_by: "CODER"
description: "Task1 of next10 after completed full cycle: complete original ScFlatUInt16RowSegments and numeric operations in existing segmenttree owner over actual shared mdds; native unchanged comparison, portable tests, actual100 Calc, related shared/inventory checks. Preserve upstream conditions and diagnose suspicious cases without repairs."
sections:
  Summary: "Complete original UInt16 row segment owner in the existing source-shaped segmenttree module; task1 of next10 after the task10 full-cycle closure."
  Scope: "Only calc checkout/branch. User goal/resume authorizes safe local changes. Extend existing sc/inc/segmenttree.ts and sc/source/core/data/segmenttree.ts with original ScFlatUInt16SegmentsImpl/ScFlatUInt16RowSegments/ForwardIterator and numeric operations in the actual shared internal template. Reuse actual mdds and ScGlobal; no duplicate interval or document engine. Add numeric-segment tests/native fixture/research probe, update existing runtime/provenance records and new capability, calc-core and suspicious journal as needed. Compile unchanged complete original template/numeric owner bodies, actual safeint groups and genuine patched mdds/Boost. Preserve output/cursor/cache/search-policy distinctions and scalar widths, with exact bigint UInt64 sums. Native RTL diagnostics/allocation are unlinked and explicitly unverified. Keep numerical overflow checks in native originals; specialize TypeScript unreachable checked overflow only with a proof from UInt16 values and valid signed32 row counts, never exclusions or malformed injected state. No Writer changes, coverage repair, policy changes, network writes, merges or full-suite rerun this task."
  Plan: "Port complete original UInt16 row owner and shared-template numeric methods; genuine unchanged native comparison, actual100 Calc and affected checks, preserve source contracts and task1/10 cadence."
  Verify Steps: "Read exact pinned segmenttree declarations/complete bodies, safeint arithmetic and consumer contracts. Compare original constructor/copy/default UInt16 widths, setValue/setValueIf including predicate call order, getValue/getRangeData policy modes/output preservation, sums across segments and clipped/out-of-range boundaries, shifts/insertion boundary distinctions, findLastTrue, ForwardIterator first indexed versus later leaf searches/cache/failure preservation and makeReady preconditions, with unchanged native groups and actual mdds/Boost/safeint under ASan/UBSan. Keep original bool436 fixture and acceptance unchanged; compare both numeric owners after every command without observation mutating live cursor/index. Verify numerical safety proof/large exact sums and diagnostics separately. Run all Calc actual100 Istanbul four metrics, affected shared mdds tests/coverage, related inventory30/provenance3/tooling14, TS7/scoped lint/format/docs/module-boundaries/size/source-tree/provenance, Calc/shared registry zero violations, routing/doctor and upstream-detached portable Calc/shared/related inventory. Record finite/native lifetime/template/assertion limits and any original suspicious cases; no whole-module parity promotion. No full office/browser/inventory-suite run until ten subsequent completed tasks; task1/10."
  Verification: |-
    Command: node scripts/calc-numeric-segments-native-probe.mjs --write; node scripts/calc-numeric-segments-native-probe.mjs --check; node scripts/calc-numeric-segments-native-probe.mjs --thread-assertion.
    Result: pass.
    Evidence: 706 defined initialized sequences, both complete owner observations after each command, unchanged pinned numeric/template bodies and actual safeint groups, genuine patched mdds/Boost under ASan/UBSan. Existing bool 436/mdds 3020 comparisons pass unchanged. Lossless whole-snapshot interning retains all command results and both observations in 62 unique complete records (150938-byte fixture); raw native output is retained. Five separate original thread assertions reproduce. Logs: output/playwright/task11-native-intern-write.log, task11-native-intern-check.log, task11-native-assertions.log and calc-native/numeric-segments-thread-{V,U,Q,T,G}.log.
    Scope: original constructor/default/copy/widths, all updates/predicate traces, policy/cursor ownership, range/value/sum boundaries, shifts/insertion distinction, findLastTrue, forward cache/failure/thread behavior. Source UInt16/signed32 invariant proves sum <2^47; exact bigint specializes unreachable overflow without exclusions. Undefined signed arithmetic, invalid-row conditional setter/uninitialized aggregate, arbitrary reentrant callbacks, allocation/ABI/dangling pointers, RTL/log allocation and full runtime/thread/process semantics remain unverified. CALC-017 records source evidence without repairing upstream.

    Command: npm run test:coverage:calc.
    Result: pass.
    Evidence: all 100 tests/22 files; actual 100% Istanbul 2623/2623 statements, 1892/1892 branches, 433/433 functions, 2301/2301 lines. No exclusions or acceptance relaxation. Log: output/playwright/task11-calc-coverage-intern.log; apps/office/coverage/calc/coverage-summary.json.
    Scope: every Calc source owner, unchanged bool fixture/test and new numeric owner/native replay plus independent scalar/sum/insertion/predicate/iterator contracts.

    Command: ../../node_modules/.bin/vitest run --config vitest.shared.config.ts --coverage --coverage.include 'src/external/mdds/**/*.ts' src/external/mdds/include/mdds/flat_segment_tree.test.ts (from apps/office).
    Result: pass.
    Evidence: 5 tests; actual 100% Istanbul across four actual mdds owners: 486 statements, 284 branches, 86 functions and 433 lines. Log: output/playwright/task11-shared-coverage.log.
    Scope: affected shared storage/iterator/index modules, reused without duplication.

    Command: npm run test:calc; npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; node_modules/.bin/vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts, with both upstream symlinks temporarily detached and restored by EXIT trap.
    Result: pass.
    Evidence: 100 Calc, 5 shared and 30 related inventory tests pass with no compiler/upstream/network. Original symlinks restored, detached names absent. Logs: output/playwright/task11-portable-calc-intern.log, task11-portable-shared-intern.log, task11-portable-inventory-intern.log.
    Scope: portable acceptance of complete committed native observations and inventory/runtime/capability/provenance contracts.

    Command: npm run test:tooling; npm run test:source-provenance; npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/segmenttree.ts apps/office/src/sc/source/core/data/segmenttree.ts apps/office/src/sc/source/core/data/numeric-segments.test.ts scripts/calc-numeric-segments-native-probe.mjs --max-warnings 0; node_modules/.bin/prettier --check apps/office/src/sc/inc/segmenttree.ts apps/office/src/sc/source/core/data/segmenttree.ts apps/office/src/sc/source/core/data/numeric-segments.test.ts scripts/calc-numeric-segments-native-probe.mjs; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
    Result: pass.
    Evidence: tooling 14 and provenance 3 pass; TS7 tools/application, focused lint/format and all declared static gates pass. Runtime provenance 350 owners (259 mapped/74 browser/17 local), boundaries 349 runtime/1626 imports/30 allowed edges. Calc 21 capabilities/141 modules and shared 1/116 have zero semantic violations; parity remains unverified. Doctor 0 errors/two previously recorded warnings (old hook shim and old task missing hash). Logs: output/playwright/task11-tooling.log, task11-provenance-tests.log, task11-types-intern.log, task11-lint-intern.log, task11-format-final.log, task11-docs-intern.log, task11-boundaries.log, task11-size-intern.log, task11-tree.log, task11-provenance-final.log, task11-registry-calc-final.log, task11-registry-shared.log, task11-doctor.log.
    Scope: source-owned shared-template/numeric facade and registry traceability. The 542 physical/543 checker-line segmenttree module remains one coherent original template plus bool/numeric owner boundary; reviewed decomposition preserves original ownership and stays below the 1000-line hard cap. No Writer changes or coverage repair. Full office/browser/inventory suite was completed at previous task10; this is task1/10 and the full run is not due under the user cadence.

    Final metadata follow-up: numeric evidence anchors were added to the existing semantic.evidence arrays, historical numeric-absence wording clarified, all semantic statuses remain unverified. Scoped registry/provenance and unchanged related inventory 30 pass after this edit (task11-inventory-final.log). Authoring/CLI failures and bounded corrections are recorded in Findings.
  Rollback Plan: "Revert only this task implementation commit in calc through a separately approved task; preserve previous completed core owners, metadata and independent acceptance. Research outputs remain ignored; upstream references read-only."
  Findings: |-
    Initial source inspection: UInt16 exposes the original shared template search-policy switch; first numeric ForwardIterator lookup uses indexed/policy search and later lookups use the cached leaf path. Row insertion does not skip a coinciding start boundary, unlike bool owners. Conditional setter assumes successful valid-row lookup; invalid input could read native uninitialized aggregate and remains outside defined comparisons. Arithmetic overflow branches require a source-width proof before any TS specialization. Preserve all upstream expressions in the native probe.

    - Observation: Initial registry ID authoring command used an unsupported --kind option; installed registry-cli accepts only id/build/check with optional --scope. Source/native implementation is unaffected; native706 defined sequences already pass.
      Impact: No capability ID has been allocated by this failed invocation; do not invent identifiers or treat its trailing shell size output as successful ID generation.
      Resolution: Recompute task route, invoke the documented npm run inventory:id command without unsupported flags, then create the scoped capability using its real returned ID.

    - Observation: Initial four numeric tests fail before any native behavior mismatch can be assessed: new uninitialized JS RangeData scratch fields pass undefined into shared mdds mutable-output overloads, selecting the iterator-only syntax overload instead. Genuine native706 sequences pass; TS7/JSDoc pass.
      Impact: Numeric range/forward/sum operations currently dispatch incorrectly. Existing shared mdds overload contract must be reused without changes; assertions/native fixtures stay unchanged.
      Resolution: Initialize only JS scratch output-reference carriers to explicit0 fields, as the existing bool scratch adapter already does, before lookup. Successful lookup overwrites these fields and wrappers publish nothing on failure. Retain original valid-row precondition for conditional setters and explicitly document that native malformed/uninitialized-input outcomes are not certified. Recompute route and rerun the unchanged four tests.

    - Observation: All100 Calc tests pass with actual100 Istanbul (2623 statements/1892 branches/433 functions/2301 lines); source-provenance/registry/TS7/JSDoc pass. Focused ESLint reports four unnecessary quote escapes in the research-driver string. Journal source-line inspection identifies setValueIf at105, not112.
      Impact: Production numerical behavior and original fixture evidence pass; formatting/lint and exact journal location still need authoring correction. No gate or test change is needed.
      Resolution: Replace only driver JSON quote emission with equivalent char(34) output, correct the journal source line, recompute route and rerun focused lint/native --check. Keep all original C++ mechanism groups, fixture sequences and acceptance assertions unchanged.

    - Observation: Final metadata authoring assumed an evidenceReferences field and raised KeyError before file writes; the follow-up findings command used unsupported --text and returned E_USAGE. Actual runtime schema uses semantic.evidence; CLI requires observation/impact/resolution.
      Impact: No production/runtime/doc change was applied by the failed authoring script. No findings mutation occurred from the rejected CLI invocation. Native/portable/coverage acceptance remains passing.
      Resolution: Recomputed route and inspected actual schema/returned CLI usage; use semantic.evidence and structured findings flags, update historical wording only, then rerun scoped registry/provenance/inventory checks without changing acceptance.

    - Observation: Implementation commit subject omitted the required scope colon and was rejected E_GIT after intentional paths were auto-staged.
      Impact: No commit created; only the 14 intended implementation/task paths are staged. Passing acceptance and policy remain unchanged.
      Resolution: Recompute route, inspect staged names, and commit the same allowlist with concrete implement: subject conforming to the existing hook.
id_source: "generated"
---
## Summary

Complete original UInt16 row segment owner in the existing source-shaped segmenttree module; task1 of next10 after the task10 full-cycle closure.

## Scope

Only calc checkout/branch. User goal/resume authorizes safe local changes. Extend existing sc/inc/segmenttree.ts and sc/source/core/data/segmenttree.ts with original ScFlatUInt16SegmentsImpl/ScFlatUInt16RowSegments/ForwardIterator and numeric operations in the actual shared internal template. Reuse actual mdds and ScGlobal; no duplicate interval or document engine. Add numeric-segment tests/native fixture/research probe, update existing runtime/provenance records and new capability, calc-core and suspicious journal as needed. Compile unchanged complete original template/numeric owner bodies, actual safeint groups and genuine patched mdds/Boost. Preserve output/cursor/cache/search-policy distinctions and scalar widths, with exact bigint UInt64 sums. Native RTL diagnostics/allocation are unlinked and explicitly unverified. Keep numerical overflow checks in native originals; specialize TypeScript unreachable checked overflow only with a proof from UInt16 values and valid signed32 row counts, never exclusions or malformed injected state. No Writer changes, coverage repair, policy changes, network writes, merges or full-suite rerun this task.

## Plan

Port complete original UInt16 row owner and shared-template numeric methods; genuine unchanged native comparison, actual100 Calc and affected checks, preserve source contracts and task1/10 cadence.

## Verify Steps

Read exact pinned segmenttree declarations/complete bodies, safeint arithmetic and consumer contracts. Compare original constructor/copy/default UInt16 widths, setValue/setValueIf including predicate call order, getValue/getRangeData policy modes/output preservation, sums across segments and clipped/out-of-range boundaries, shifts/insertion boundary distinctions, findLastTrue, ForwardIterator first indexed versus later leaf searches/cache/failure preservation and makeReady preconditions, with unchanged native groups and actual mdds/Boost/safeint under ASan/UBSan. Keep original bool436 fixture and acceptance unchanged; compare both numeric owners after every command without observation mutating live cursor/index. Verify numerical safety proof/large exact sums and diagnostics separately. Run all Calc actual100 Istanbul four metrics, affected shared mdds tests/coverage, related inventory30/provenance3/tooling14, TS7/scoped lint/format/docs/module-boundaries/size/source-tree/provenance, Calc/shared registry zero violations, routing/doctor and upstream-detached portable Calc/shared/related inventory. Record finite/native lifetime/template/assertion limits and any original suspicious cases; no whole-module parity promotion. No full office/browser/inventory-suite run until ten subsequent completed tasks; task1/10.

## Verification

Command: node scripts/calc-numeric-segments-native-probe.mjs --write; node scripts/calc-numeric-segments-native-probe.mjs --check; node scripts/calc-numeric-segments-native-probe.mjs --thread-assertion.
Result: pass.
Evidence: 706 defined initialized sequences, both complete owner observations after each command, unchanged pinned numeric/template bodies and actual safeint groups, genuine patched mdds/Boost under ASan/UBSan. Existing bool 436/mdds 3020 comparisons pass unchanged. Lossless whole-snapshot interning retains all command results and both observations in 62 unique complete records (150938-byte fixture); raw native output is retained. Five separate original thread assertions reproduce. Logs: output/playwright/task11-native-intern-write.log, task11-native-intern-check.log, task11-native-assertions.log and calc-native/numeric-segments-thread-{V,U,Q,T,G}.log.
Scope: original constructor/default/copy/widths, all updates/predicate traces, policy/cursor ownership, range/value/sum boundaries, shifts/insertion distinction, findLastTrue, forward cache/failure/thread behavior. Source UInt16/signed32 invariant proves sum <2^47; exact bigint specializes unreachable overflow without exclusions. Undefined signed arithmetic, invalid-row conditional setter/uninitialized aggregate, arbitrary reentrant callbacks, allocation/ABI/dangling pointers, RTL/log allocation and full runtime/thread/process semantics remain unverified. CALC-017 records source evidence without repairing upstream.

Command: npm run test:coverage:calc.
Result: pass.
Evidence: all 100 tests/22 files; actual 100% Istanbul 2623/2623 statements, 1892/1892 branches, 433/433 functions, 2301/2301 lines. No exclusions or acceptance relaxation. Log: output/playwright/task11-calc-coverage-intern.log; apps/office/coverage/calc/coverage-summary.json.
Scope: every Calc source owner, unchanged bool fixture/test and new numeric owner/native replay plus independent scalar/sum/insertion/predicate/iterator contracts.

Command: ../../node_modules/.bin/vitest run --config vitest.shared.config.ts --coverage --coverage.include 'src/external/mdds/**/*.ts' src/external/mdds/include/mdds/flat_segment_tree.test.ts (from apps/office).
Result: pass.
Evidence: 5 tests; actual 100% Istanbul across four actual mdds owners: 486 statements, 284 branches, 86 functions and 433 lines. Log: output/playwright/task11-shared-coverage.log.
Scope: affected shared storage/iterator/index modules, reused without duplication.

Command: npm run test:calc; npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; node_modules/.bin/vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts, with both upstream symlinks temporarily detached and restored by EXIT trap.
Result: pass.
Evidence: 100 Calc, 5 shared and 30 related inventory tests pass with no compiler/upstream/network. Original symlinks restored, detached names absent. Logs: output/playwright/task11-portable-calc-intern.log, task11-portable-shared-intern.log, task11-portable-inventory-intern.log.
Scope: portable acceptance of complete committed native observations and inventory/runtime/capability/provenance contracts.

Command: npm run test:tooling; npm run test:source-provenance; npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/segmenttree.ts apps/office/src/sc/source/core/data/segmenttree.ts apps/office/src/sc/source/core/data/numeric-segments.test.ts scripts/calc-numeric-segments-native-probe.mjs --max-warnings 0; node_modules/.bin/prettier --check apps/office/src/sc/inc/segmenttree.ts apps/office/src/sc/source/core/data/segmenttree.ts apps/office/src/sc/source/core/data/numeric-segments.test.ts scripts/calc-numeric-segments-native-probe.mjs; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
Result: pass.
Evidence: tooling 14 and provenance 3 pass; TS7 tools/application, focused lint/format and all declared static gates pass. Runtime provenance 350 owners (259 mapped/74 browser/17 local), boundaries 349 runtime/1626 imports/30 allowed edges. Calc 21 capabilities/141 modules and shared 1/116 have zero semantic violations; parity remains unverified. Doctor 0 errors/two previously recorded warnings (old hook shim and old task missing hash). Logs: output/playwright/task11-tooling.log, task11-provenance-tests.log, task11-types-intern.log, task11-lint-intern.log, task11-format-final.log, task11-docs-intern.log, task11-boundaries.log, task11-size-intern.log, task11-tree.log, task11-provenance-final.log, task11-registry-calc-final.log, task11-registry-shared.log, task11-doctor.log.
Scope: source-owned shared-template/numeric facade and registry traceability. The 542 physical/543 checker-line segmenttree module remains one coherent original template plus bool/numeric owner boundary; reviewed decomposition preserves original ownership and stays below the 1000-line hard cap. No Writer changes or coverage repair. Full office/browser/inventory suite was completed at previous task10; this is task1/10 and the full run is not due under the user cadence.

Final metadata follow-up: numeric evidence anchors were added to the existing semantic.evidence arrays, historical numeric-absence wording clarified, all semantic statuses remain unverified. Scoped registry/provenance and unchanged related inventory 30 pass after this edit (task11-inventory-final.log). Authoring/CLI failures and bounded corrections are recorded in Findings.

## Rollback Plan

Revert only this task implementation commit in calc through a separately approved task; preserve previous completed core owners, metadata and independent acceptance. Research outputs remain ignored; upstream references read-only.

## Findings

Initial source inspection: UInt16 exposes the original shared template search-policy switch; first numeric ForwardIterator lookup uses indexed/policy search and later lookups use the cached leaf path. Row insertion does not skip a coinciding start boundary, unlike bool owners. Conditional setter assumes successful valid-row lookup; invalid input could read native uninitialized aggregate and remains outside defined comparisons. Arithmetic overflow branches require a source-width proof before any TS specialization. Preserve all upstream expressions in the native probe.

- Observation: Initial registry ID authoring command used an unsupported --kind option; installed registry-cli accepts only id/build/check with optional --scope. Source/native implementation is unaffected; native706 defined sequences already pass.
  Impact: No capability ID has been allocated by this failed invocation; do not invent identifiers or treat its trailing shell size output as successful ID generation.
  Resolution: Recompute task route, invoke the documented npm run inventory:id command without unsupported flags, then create the scoped capability using its real returned ID.

- Observation: Initial four numeric tests fail before any native behavior mismatch can be assessed: new uninitialized JS RangeData scratch fields pass undefined into shared mdds mutable-output overloads, selecting the iterator-only syntax overload instead. Genuine native706 sequences pass; TS7/JSDoc pass.
  Impact: Numeric range/forward/sum operations currently dispatch incorrectly. Existing shared mdds overload contract must be reused without changes; assertions/native fixtures stay unchanged.
  Resolution: Initialize only JS scratch output-reference carriers to explicit0 fields, as the existing bool scratch adapter already does, before lookup. Successful lookup overwrites these fields and wrappers publish nothing on failure. Retain original valid-row precondition for conditional setters and explicitly document that native malformed/uninitialized-input outcomes are not certified. Recompute route and rerun the unchanged four tests.

- Observation: All100 Calc tests pass with actual100 Istanbul (2623 statements/1892 branches/433 functions/2301 lines); source-provenance/registry/TS7/JSDoc pass. Focused ESLint reports four unnecessary quote escapes in the research-driver string. Journal source-line inspection identifies setValueIf at105, not112.
  Impact: Production numerical behavior and original fixture evidence pass; formatting/lint and exact journal location still need authoring correction. No gate or test change is needed.
  Resolution: Replace only driver JSON quote emission with equivalent char(34) output, correct the journal source line, recompute route and rerun focused lint/native --check. Keep all original C++ mechanism groups, fixture sequences and acceptance assertions unchanged.

- Observation: Final metadata authoring assumed an evidenceReferences field and raised KeyError before file writes; the follow-up findings command used unsupported --text and returned E_USAGE. Actual runtime schema uses semantic.evidence; CLI requires observation/impact/resolution.
  Impact: No production/runtime/doc change was applied by the failed authoring script. No findings mutation occurred from the rejected CLI invocation. Native/portable/coverage acceptance remains passing.
  Resolution: Recomputed route and inspected actual schema/returned CLI usage; use semantic.evidence and structured findings flags, update historical wording only, then rerun scoped registry/provenance/inventory checks without changing acceptance.

- Observation: Implementation commit subject omitted the required scope colon and was rejected E_GIT after intentional paths were auto-staged.
  Impact: No commit created; only the 14 intended implementation/task paths are staged. Passing acceptance and policy remain unchanged.
  Resolution: Recompute route, inspect staged names, and commit the same allowlist with concrete implement: subject conforming to the existing hook.
