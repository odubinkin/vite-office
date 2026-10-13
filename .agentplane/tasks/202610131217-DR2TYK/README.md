---
id: "202610131217-DR2TYK"
title: "Implement public Calc matrix construction resize and geometry"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T12:18:18.996Z"
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
    body: "Start: original public matrix facade over shared storage under continued user goal and GC-first resource adaptation."
events:
  -
    type: "status"
    at: "2026-10-13T12:18:20.775Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original public matrix facade over shared storage under continued user goal and GC-first resource adaptation."
doc_version: 3
doc_updated_at: "2026-10-13T12:18:20.775Z"
doc_updated_by: "CODER"
description: "Iteration84: original ScMatrix facade over actual ScMatrixImpl, three constructors, allocation shape/default per-matrix bound, Resize overloads, geometry delegates and six original type selectors. GC refs replace native ledger/refcounts; preserve differing fallback errors. Native original observations, inventory/journal and whole Calc/affected shared raw100."
sections:
  Summary: "Iteration84 public ScMatrix construction/resize/geometry owner."
  Scope: "Calc only: scmatrix.ts internal Resize plus genuine public ScMatrix constructors, IsSizeAllocatable, geometry delegates and six type selectors; sc/inc/scmatrix reexport; new complete test/native fixture/helper; current runtime/provenance/capability records for these two owners and new capability, calc-core, GC adaptation and suspected issue journal. Original64bit initial element limit becomes a per-matrix bound under explicit GC-first instruction, no native pool/refcounts/allocator. No fake interpreter or Clone substitute, no Writer/shared runtime changes."
  Plan: "Public original ScMatrix construction/resize/geometry and classifiers over actual shared storage, per-matrix initial default bound under approved GC adaptation, original fallback anomalies journaled; native observations, whole scoped raw100, inventory/gates/exact review."
  Verify Steps: |-
    1. node scripts/calc-matrix-facade-native-probe.mjs --check and complete new facade test: original three constructors, zero/one-zero dimensions, default initial bound and overflow without large allocations, resize grow/shrink/zero/error, all256tag classifiers and coordinate delegation. Pool/refcount/destructor scheduling explicitly excluded.
    2. node output/playwright/task84-checks/portable.mjs: whole Calc and whole affected shared owners/tests raw S/B/F/L100 every raw counter positive, four source links absent/restored, static build and Calc profile.
    3. node output/playwright/task84-checks/gates.mjs: all16existing repository/tooling/inventory gates. No Writer repairs, exclusions or weakened thresholds; next full91.
    4. Exact committed/current source/test/fixture/config hashes, same-agent separate EVALUATOR pass, canonical DONE and clean all-files git status on calc. Original new fallback anomaly recorded, no complete matrix/interpreter/UI claim.
  Verification: "Pending."
  Rollback Plan: "Revert only intentional iteration84 changes through a new task; preserve existing owners/native evidence, no merge or history rewriting."
  Findings: "C++ native global live-allocation ledger is omitted under user GC-first instruction. Preserve its initial64bit default as per-matrix validation, explicitly divergent resource policy. Default Resize error is MatrixSize, filled Resize error is StackOverflow; preserve and document. Interpreter/Clone and typed cell access remain actual subsequent owners."
id_source: "generated"
---
## Summary

Iteration84 public ScMatrix construction/resize/geometry owner.

## Scope

Calc only: scmatrix.ts internal Resize plus genuine public ScMatrix constructors, IsSizeAllocatable, geometry delegates and six type selectors; sc/inc/scmatrix reexport; new complete test/native fixture/helper; current runtime/provenance/capability records for these two owners and new capability, calc-core, GC adaptation and suspected issue journal. Original64bit initial element limit becomes a per-matrix bound under explicit GC-first instruction, no native pool/refcounts/allocator. No fake interpreter or Clone substitute, no Writer/shared runtime changes.

## Plan

Public original ScMatrix construction/resize/geometry and classifiers over actual shared storage, per-matrix initial default bound under approved GC adaptation, original fallback anomalies journaled; native observations, whole scoped raw100, inventory/gates/exact review.

## Verify Steps

1. node scripts/calc-matrix-facade-native-probe.mjs --check and complete new facade test: original three constructors, zero/one-zero dimensions, default initial bound and overflow without large allocations, resize grow/shrink/zero/error, all256tag classifiers and coordinate delegation. Pool/refcount/destructor scheduling explicitly excluded.
2. node output/playwright/task84-checks/portable.mjs: whole Calc and whole affected shared owners/tests raw S/B/F/L100 every raw counter positive, four source links absent/restored, static build and Calc profile.
3. node output/playwright/task84-checks/gates.mjs: all16existing repository/tooling/inventory gates. No Writer repairs, exclusions or weakened thresholds; next full91.
4. Exact committed/current source/test/fixture/config hashes, same-agent separate EVALUATOR pass, canonical DONE and clean all-files git status on calc. Original new fallback anomaly recorded, no complete matrix/interpreter/UI claim.

## Verification

Pending.

## Rollback Plan

Revert only intentional iteration84 changes through a new task; preserve existing owners/native evidence, no merge or history rewriting.

## Findings

C++ native global live-allocation ledger is omitted under user GC-first instruction. Preserve its initial64bit default as per-matrix validation, explicitly divergent resource policy. Default Resize error is MatrixSize, filled Resize error is StackOverflow; preserve and document. Interpreter/Clone and typed cell access remain actual subsequent owners.
