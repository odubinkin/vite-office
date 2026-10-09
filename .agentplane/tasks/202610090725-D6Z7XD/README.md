---
id: "202610090725-D6Z7XD"
title: "Calc native sticky range reference updates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202610090711-S6VCEJ"
tags:
  - "calc"
  - "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run inventory:parity:calc"
  - "npm run test:coverage:calc"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:27:34.588Z"
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
    body: "Start: continue the approved Calc core by implementing the pinned native sticky range movement and insert/delete coordinate updates with focused acceptance coverage."
events:
  -
    type: "status"
    at: "2026-10-09T07:27:37.920Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue the approved Calc core by implementing the pinned native sticky range movement and insert/delete coordinate updates with focused acceptance coverage."
doc_version: 3
doc_updated_at: "2026-10-09T07:27:37.920Z"
doc_updated_by: "CODER"
description: "Continue the approved Calc core goal with original sticky end-anchor movement and insert/delete coordinate adjustment from pinned address.cxx. Reuse ScAddress/ScRange and shared ownership, change only calc files, task2/10 before full-suite cadence."
sections:
  Summary: |-
    Calc native sticky range reference updates

    Continue the approved Calc core goal with original sticky end-anchor movement and insert/delete coordinate adjustment from pinned address.cxx. Reuse ScAddress/ScRange and shared ownership, change only calc files, task2/10 before full-suite cadence.
  Scope: "Only ScRange methods in apps/office/src/sc/source/core/tool/address.ts, a new colocated sticky-range acceptance file, Calc-owned capability/runtime/provenance records and docs/program/calc-core.md. Preserve existing foundation tests and every Writer/shared production file. Implement exact MoveSticky, IsEndColSticky, IsEndRowSticky, IncEndColSticky, IncEndRowSticky, IncColIfNotLessThan and IncRowIfNotLessThan contracts."
  Plan: "CODER implements the seven original ScRange sticky-movement and conditional-adjustment methods directly on the existing owner, preserving native narrowing/short-circuit/error rules. Add an independent focused acceptance file, source traceability and concise scope/cadence documentation. Verify Calc all-four actual100 and affected statics/registry, record results and finish with traceable local commits on calc; no shared duplication, Writer edits or branch integration."
  Verify Steps: "Run npm run test:coverage:calc with original all-four 100% thresholds and no exclusions/counter changes. Exercise both axes, full-sheet suppression, single-coordinate nonstickiness, existing maximum anchors, anchors becoming sticky, below-zero/above-maximum clamping, sheet error output and both endpoint processing after failure. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, changed-file ESLint/Prettier, npm run check:docs, ap doctor and node .agentplane/policy/check-routing.mjs. Calc task2/10: defer full suite until task10 per user instruction."
  Verification: "Pending exact-source implementation and scoped checks."
  Rollback Plan: "Revert only this task implementation and task-owned acceptance/metadata; preserve completed Calc1 and prior Writer/shared owners. No merge, reset or reference checkout modifications."
  Findings: "Continue explicitly approved Calc goal and original address.cxx boundaries. Sticky maximum end anchors apply only to actual multi-coordinate ranges; original source behavior rather than browser heuristics owns movement. Local pinned reference is already authorized and symlinked; no further network or shared changes needed."
id_source: "generated"
---
## Summary

Calc native sticky range reference updates

Continue the approved Calc core goal with original sticky end-anchor movement and insert/delete coordinate adjustment from pinned address.cxx. Reuse ScAddress/ScRange and shared ownership, change only calc files, task2/10 before full-suite cadence.

## Scope

Only ScRange methods in apps/office/src/sc/source/core/tool/address.ts, a new colocated sticky-range acceptance file, Calc-owned capability/runtime/provenance records and docs/program/calc-core.md. Preserve existing foundation tests and every Writer/shared production file. Implement exact MoveSticky, IsEndColSticky, IsEndRowSticky, IncEndColSticky, IncEndRowSticky, IncColIfNotLessThan and IncRowIfNotLessThan contracts.

## Plan

CODER implements the seven original ScRange sticky-movement and conditional-adjustment methods directly on the existing owner, preserving native narrowing/short-circuit/error rules. Add an independent focused acceptance file, source traceability and concise scope/cadence documentation. Verify Calc all-four actual100 and affected statics/registry, record results and finish with traceable local commits on calc; no shared duplication, Writer edits or branch integration.

## Verify Steps

Run npm run test:coverage:calc with original all-four 100% thresholds and no exclusions/counter changes. Exercise both axes, full-sheet suppression, single-coordinate nonstickiness, existing maximum anchors, anchors becoming sticky, below-zero/above-maximum clamping, sheet error output and both endpoint processing after failure. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, changed-file ESLint/Prettier, npm run check:docs, ap doctor and node .agentplane/policy/check-routing.mjs. Calc task2/10: defer full suite until task10 per user instruction.

## Verification

Pending exact-source implementation and scoped checks.

## Rollback Plan

Revert only this task implementation and task-owned acceptance/metadata; preserve completed Calc1 and prior Writer/shared owners. No merge, reset or reference checkout modifications.

## Findings

Continue explicitly approved Calc goal and original address.cxx boundaries. Sticky maximum end anchors apply only to actual multi-coordinate ranges; original source behavior rather than browser heuristics owns movement. Local pinned reference is already authorized and symlinked; no further network or shared changes needed.
