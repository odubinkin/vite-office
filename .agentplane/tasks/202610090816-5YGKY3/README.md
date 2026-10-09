---
id: "202610090816-5YGKY3"
title: "Port Calc complex formula reference data and native range inheritance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T08:17:06.659Z"
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
    body: "Start: port original complex reference inheritance and sticky contracts on existing owners, preserving prior single-reference acceptance."
events:
  -
    type: "status"
    at: "2026-10-09T08:17:18.973Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original complex reference inheritance and sticky contracts on existing owners, preserving prior single-reference acceptance."
doc_version: 3
doc_updated_at: "2026-10-09T08:17:18.973Z"
doc_updated_by: "CODER"
description: "Implement complete initialized ScComplexRefData header/source contracts on original refdata boundaries, including stable copied endpoints, trim defaults, conversion/validation, original extension flag inheritance and sticky endpoint updates. Extend the existing native reference comparison harness while preserving all prior single-reference evidence; update Calc inventory."
sections:
  Summary: "Port the initialized native complex formula range reference owner and prove bounded native inheritance, conversion and sticky behavior."
  Scope: "Existing sc/inc/refdata.ts and sc/source/core/tool/refdata.ts, new complex-reference acceptance tests and native fixture, existing scripts/calc-refdata-native-probe.mjs, existing refdata runtime/provenance records and single capability gaps, new complex Calc capability, calc-core docs. Preserve all existing test bodies, single-reference fixture and original semantic statuses, shared/Writer sources. Work only in calc checkout on calc; no merges. Calc milestone6, full suite at10."
  Plan: "Implement original ScComplexRefData with stable independent Ref1/Ref2 values, implicit copy/assignment semantics, false trim default and trim-independent equality. Implement every non-debug header/source method: initializers, checks, sorted absolute conversion, SetRange, source-owned single-reference ordering, original Extend overloads with sheet/relativity/3D/name inheritance and alias semantics, entire-axis checks and masked/relative sticky increments. Reuse ScSingleRefData, ScAddress, ScRefAddress, ScRange and ScSheetLimits. Extend existing native harness with original ScRange constructors and complete14 complex definitions plus original complex header, same pinned blob checks and sanitizers. Separate complex mode/fixture; retain byte-identical single fixture and acceptance. Add source-derived upstream testFormulaRefData extension cases and bounded literal edge assertions. Validate100 Calc coverage and scoped static/inventory checks; document complete document/token/compiler/undefined/debug limitations without promotion. Core progression authorized by original user goal."
  Verify Steps: "Run native probe --complex-write then --complex-check and original --check; require exact pinned Git blobs, unchanged single fixture and ASan/UBSan-clean states. Compare every complex fixture output through TS owner. Retain prior test bodies and run npm run test:coverage:calc requiring actual100 all4 metrics. Run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry0 semantic violations; preserve all prior flags/shared ownership. Routing and ap doctor; diff check; final clean tracked/untracked state on calc. Full suite scheduled atCalc10. Review original refdata owner grouping if the combined file crosses500 lines; hard1000 line limit stays enforced."
  Verification: "Pending port and source/native acceptance."
  Rollback Plan: "Revert only this implementation commit while retaining initialized single references and prior fixture evidence."
  Findings: "Complex absolute conversion invokes the native address-pair ScRange constructor, which sorts axes independently even when reference data itself is unsorted. External validity compares deletion-masked sheet getters. Trim remains unchanged by initializers and is omitted from equality. Complex sticky operations use masked reference getters and retain relative flags, so replacing them with address-range operations would alter native contracts. Both reference classes live in the original upstream refdata source; keep that coherent grouping rather than introducing an arbitrary new owner."
id_source: "generated"
---
## Summary

Port the initialized native complex formula range reference owner and prove bounded native inheritance, conversion and sticky behavior.

## Scope

Existing sc/inc/refdata.ts and sc/source/core/tool/refdata.ts, new complex-reference acceptance tests and native fixture, existing scripts/calc-refdata-native-probe.mjs, existing refdata runtime/provenance records and single capability gaps, new complex Calc capability, calc-core docs. Preserve all existing test bodies, single-reference fixture and original semantic statuses, shared/Writer sources. Work only in calc checkout on calc; no merges. Calc milestone6, full suite at10.

## Plan

Implement original ScComplexRefData with stable independent Ref1/Ref2 values, implicit copy/assignment semantics, false trim default and trim-independent equality. Implement every non-debug header/source method: initializers, checks, sorted absolute conversion, SetRange, source-owned single-reference ordering, original Extend overloads with sheet/relativity/3D/name inheritance and alias semantics, entire-axis checks and masked/relative sticky increments. Reuse ScSingleRefData, ScAddress, ScRefAddress, ScRange and ScSheetLimits. Extend existing native harness with original ScRange constructors and complete14 complex definitions plus original complex header, same pinned blob checks and sanitizers. Separate complex mode/fixture; retain byte-identical single fixture and acceptance. Add source-derived upstream testFormulaRefData extension cases and bounded literal edge assertions. Validate100 Calc coverage and scoped static/inventory checks; document complete document/token/compiler/undefined/debug limitations without promotion. Core progression authorized by original user goal.

## Verify Steps

Run native probe --complex-write then --complex-check and original --check; require exact pinned Git blobs, unchanged single fixture and ASan/UBSan-clean states. Compare every complex fixture output through TS owner. Retain prior test bodies and run npm run test:coverage:calc requiring actual100 all4 metrics. Run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry0 semantic violations; preserve all prior flags/shared ownership. Routing and ap doctor; diff check; final clean tracked/untracked state on calc. Full suite scheduled atCalc10. Review original refdata owner grouping if the combined file crosses500 lines; hard1000 line limit stays enforced.

## Verification

Pending port and source/native acceptance.

## Rollback Plan

Revert only this implementation commit while retaining initialized single references and prior fixture evidence.

## Findings

Complex absolute conversion invokes the native address-pair ScRange constructor, which sorts axes independently even when reference data itself is unsorted. External validity compares deletion-masked sheet getters. Trim remains unchanged by initializers and is omitted from equality. Complex sticky operations use masked reference getters and retain relative flags, so replacing them with address-range operations would alter native contracts. Both reference classes live in the original upstream refdata source; keep that coherent grouping rather than introducing an arbitrary new owner.
