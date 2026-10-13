---
id: "202610131158-MQBXWY"
title: "Implement Calc matrix storage initialization and coordinate replication"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T11:59:05.064Z"
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
    body: "Start: implement approved original matrix storage/coordinate slice under explicit user resume and GC-first constraints, calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-13T11:59:06.899Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original matrix storage/coordinate slice under explicit user resume and GC-first constraints, calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-13T11:59:06.899Z"
doc_updated_by: "CODER"
description: "Iteration83: genuine ScMatrixImpl matrix/flag traits and three storage constructors plus dimensions, count, coordinate validation/replication and numeric query over reused shared mdds. JavaScript GC owns containers, no native pool/refcounts or interpreter substitutes. Preserve original empty/single-axis coordinate semantics; native source excerpts and scoped raw100 evidence, inventory and docs."
sections:
  Summary: "Iteration83: initialize the actual internal Calc matrix storage and coordinate replication over shared mdds."
  Scope: "Calc branch only. sc/source/core/tool/scmatrix.ts and a focused test/native fixture; one native probe helper; current ScMatrix provenance/runtime/capability records, calc-core and GC adaptation docs. Original matrix traits and three constructors, GetDimensions/GetElementCount/ValidColRow/ValidColRowReplicated/ValidColRowOrReplicated/IsNumeric. No public ScMatrix facade, interpreter substitute, memory pool/refcount/destructor manager, or Writer changes."
  Plan: "Original internal matrix typed storage initialization and coordinate replication over shared mdds, explicit GC adaptation without pool/refcount or fake interpreter; ordinary original native observations, inventory, whole Calc/affected shared raw100, exact review and canonical close."
  Verify Steps: |-
    1. node scripts/calc-matrix-storage-native-probe.mjs --check and complete new storage test: original source constructor/geometry/replication/numeric observations across empty, rectangular, scalar and vector initialization and coordinates. No interpreter or native lifetime parity claim.
    2. node output/playwright/task83-checks/portable.mjs: entire Calc and whole affected shared mdds/SAL/SVL owners with raw S/B/F/L100 and every raw counter positive, source links absent/restored, static build and Calc browser profile.
    3. node output/playwright/task83-checks/gates.mjs: formatting, lint, types, dependencies, docs, size, resources, tree, provenance, inventory registry/invariants, routing, doctor, diff, tooling and inventory tests.
    4. Same-agent separate EVALUATOR exact source/test/fixture/config hashes tied to commit; canonical DONE and clean all-files git status. No full suite before cadence91; no Writer repairs or claims of complete ScMatrix/UI readiness.
  Verification: "Pending approved implementation and evidence."
  Rollback Plan: "Revert only intentional iteration83 changes through a new task; no history rewriting, merges or unrelated task changes."
  Findings: "Upstream storage constructors debit a global native element pool and destructor credits it. Per user GC-first instruction omit that memory-management ledger; no fake interpreter binding or public matrix completion claim. Shared mdds and shared string semantics are reused."
id_source: "generated"
---
## Summary

Iteration83: initialize the actual internal Calc matrix storage and coordinate replication over shared mdds.

## Scope

Calc branch only. sc/source/core/tool/scmatrix.ts and a focused test/native fixture; one native probe helper; current ScMatrix provenance/runtime/capability records, calc-core and GC adaptation docs. Original matrix traits and three constructors, GetDimensions/GetElementCount/ValidColRow/ValidColRowReplicated/ValidColRowOrReplicated/IsNumeric. No public ScMatrix facade, interpreter substitute, memory pool/refcount/destructor manager, or Writer changes.

## Plan

Original internal matrix typed storage initialization and coordinate replication over shared mdds, explicit GC adaptation without pool/refcount or fake interpreter; ordinary original native observations, inventory, whole Calc/affected shared raw100, exact review and canonical close.

## Verify Steps

1. node scripts/calc-matrix-storage-native-probe.mjs --check and complete new storage test: original source constructor/geometry/replication/numeric observations across empty, rectangular, scalar and vector initialization and coordinates. No interpreter or native lifetime parity claim.
2. node output/playwright/task83-checks/portable.mjs: entire Calc and whole affected shared mdds/SAL/SVL owners with raw S/B/F/L100 and every raw counter positive, source links absent/restored, static build and Calc browser profile.
3. node output/playwright/task83-checks/gates.mjs: formatting, lint, types, dependencies, docs, size, resources, tree, provenance, inventory registry/invariants, routing, doctor, diff, tooling and inventory tests.
4. Same-agent separate EVALUATOR exact source/test/fixture/config hashes tied to commit; canonical DONE and clean all-files git status. No full suite before cadence91; no Writer repairs or claims of complete ScMatrix/UI readiness.

## Verification

Pending approved implementation and evidence.

## Rollback Plan

Revert only intentional iteration83 changes through a new task; no history rewriting, merges or unrelated task changes.

## Findings

Upstream storage constructors debit a global native element pool and destructor credits it. Per user GC-first instruction omit that memory-management ledger; no fake interpreter binding or public matrix completion claim. Shared mdds and shared string semantics are reused.
