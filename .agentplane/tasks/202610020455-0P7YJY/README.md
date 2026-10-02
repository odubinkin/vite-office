---
id: "202610020455-0P7YJY"
title: "Restore optional validation policy for protected number vectors"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T04:56:31.160Z"
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
    body: "Start: Restore native optional validation flag for protected ancestor vectors with actual document cache/phantom tests, no upstream test access or source/helper task artifacts."
events:
  -
    type: "status"
    at: "2026-10-02T04:56:31.794Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native optional validation flag for protected ancestor vectors with actual document cache/phantom tests, no upstream test access or source/helper task artifacts."
doc_version: 3
doc_updated_at: "2026-10-02T04:56:31.794Z"
doc_updated_by: "CODER"
description: "Iteration51: restore protected GetNumberVector_(numbers,bValidate=true) signature and recursively forward the selected validation policy. Test raw-cache reads, defaults, explicit true/false, appended output and phantom/ancestor paths with actual project-owned documents. No source/helper scripts in task artifacts, no upstream access from tests, no registered deviation or broad parity promotion."
sections:
  Summary: "Iteration51 restores the optional validation flag and recursive native contract of protected GetNumberVector_."
  Scope: "Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-vector.test.ts alongside it; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent task bookkeeping only. No registered IO/recovery, test gate, existing expectation or whole-module status changes."
  Plan: "Restore protected optional true-default validation parameter and recursively forward it. Four semantic paths only; planned type/runtime RED then GREEN with actual owner/cache/phantom fixtures; source hashes and manual conclusions only, tests independent of upstream, no helper source artifacts. Unchanged full verification and both100% coverage, separate implementation commit/quality/leaf close; parent/full goal remains open."
  Verify Steps: |-
    1. Current pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh SwNumberTree.hxx declaration hash and SwNumberTree.cxx GetNumberVector_/GetNumberVector/GetNumber symbol hashes support manual contract inspection: optional true default, parent-first recursion, caller-owned append, forwarding through all ancestors, no root/orphan entry. No compiled native execution or wider lifetime claim.
    2. Planned RED runtime and argument type failures are recorded, then GREEN. Type contract remains protected and exact [numbers:number[],validate?:boolean]. Real document fixtures with hierarchical/continuous/skipped level9 records compare literal raw/validated vectors and retained prefix/counter/continuation snapshots across reading-suppressed insertion and restart invalidation. Explicit false leaves state untouched; omitted/undefined/true and public path validate consistently; orphan/root preserve prefilled output.
    3. All focused tree suites pass with upstream directory temporarily unavailable and restored in finally. Unchanged full npm run verify passes all gates and both100% coverages; routing and doctor have no new errors, metadata modifies only bounded evidence/responsibilities for the tree row with no status/deviation promotion. Diff contains four semantic paths plus active leaf/parent artifacts; no native/helper source bodies stored.
    4. Canonical verification and separate same-actor EVALUATOR quality phase cite actual implementation SHA. Leaf finishes DONE with clean tracked/untracked state; next measured existing-function gap remains separate and full goal open.
  Verification: "Pending execution."
  Rollback Plan: "Revert the implementation commit if required, retaining result/hash evidence and the prohibition on source/helper artifact bodies."
  Findings: "Fresh source inspection confirms header line417 optional true, core line295 recursive forwarding and per-node GetNumber(bValidate). Current local helper takes only the output and forces validation, contrary to its existing upstream contract. Previous goal turn completed iteration50 and is progress; this leaf addresses the next measured defect without broader promotion."
id_source: "generated"
---
## Summary

Iteration51 restores the optional validation flag and recursive native contract of protected GetNumberVector_.

## Scope

Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-vector.test.ts alongside it; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent task bookkeeping only. No registered IO/recovery, test gate, existing expectation or whole-module status changes.

## Plan

Restore protected optional true-default validation parameter and recursively forward it. Four semantic paths only; planned type/runtime RED then GREEN with actual owner/cache/phantom fixtures; source hashes and manual conclusions only, tests independent of upstream, no helper source artifacts. Unchanged full verification and both100% coverage, separate implementation commit/quality/leaf close; parent/full goal remains open.

## Verify Steps

1. Current pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh SwNumberTree.hxx declaration hash and SwNumberTree.cxx GetNumberVector_/GetNumberVector/GetNumber symbol hashes support manual contract inspection: optional true default, parent-first recursion, caller-owned append, forwarding through all ancestors, no root/orphan entry. No compiled native execution or wider lifetime claim.
2. Planned RED runtime and argument type failures are recorded, then GREEN. Type contract remains protected and exact [numbers:number[],validate?:boolean]. Real document fixtures with hierarchical/continuous/skipped level9 records compare literal raw/validated vectors and retained prefix/counter/continuation snapshots across reading-suppressed insertion and restart invalidation. Explicit false leaves state untouched; omitted/undefined/true and public path validate consistently; orphan/root preserve prefilled output.
3. All focused tree suites pass with upstream directory temporarily unavailable and restored in finally. Unchanged full npm run verify passes all gates and both100% coverages; routing and doctor have no new errors, metadata modifies only bounded evidence/responsibilities for the tree row with no status/deviation promotion. Diff contains four semantic paths plus active leaf/parent artifacts; no native/helper source bodies stored.
4. Canonical verification and separate same-actor EVALUATOR quality phase cite actual implementation SHA. Leaf finishes DONE with clean tracked/untracked state; next measured existing-function gap remains separate and full goal open.

## Verification

Pending execution.

## Rollback Plan

Revert the implementation commit if required, retaining result/hash evidence and the prohibition on source/helper artifact bodies.

## Findings

Fresh source inspection confirms header line417 optional true, core line295 recursive forwarding and per-node GetNumber(bValidate). Current local helper takes only the output and forces validation, contrary to its existing upstream contract. Previous goal turn completed iteration50 and is progress; this leaf addresses the next measured defect without broader promotion.
