---
id: "202610090711-S6VCEJ"
title: "Calc core coordinate and range foundation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
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
  updated_at: "2026-10-09T07:12:34.386Z"
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
    body: "Start: implement the approved pinned Calc coordinate and range foundation with isolated Calc tests, shared-module reuse and exact source evidence on branch calc."
events:
  -
    type: "status"
    at: "2026-10-09T07:12:38.540Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved pinned Calc coordinate and range foundation with isolated Calc tests, shared-module reuse and exact source evidence on branch calc."
doc_version: 3
doc_updated_at: "2026-10-09T07:12:38.540Z"
doc_updated_by: "CODER"
description: "Begin approved Calc implementation on branch calc in this checkout. Reimplement pinned LibreOffice coordinate types, address and range contracts with original defaults, shared-module reuse, source provenance and independent Calc coverage. First of ten Calc tasks before a full-suite run; no branch integration."
sections:
  Summary: |-
    Calc core coordinate and range foundation

    Begin approved Calc implementation on branch calc in this checkout. Reimplement pinned LibreOffice coordinate types, address and range contracts with original defaults, shared-module reuse, source provenance and independent Calc coverage. First of ten Calc tasks before a full-suite run; no branch integration.
  Scope: "Calc foundation only: sc/inc/types.ts, sc/inc/address.ts, sc/source/core/tool/address.ts, colocated Calc tests, Calc-owned runtime/provenance/capability records and docs/program/calc-core.md. Cache selected pinned source files under ignored vendor/libreoffice-reference. No Writer production changes, UI activation, merges, recovery, or dependency version changes."
  Plan: "Implement independent TypeScript coordinate types, ScAddress and ScRange numerical contracts from exact pinned source, preserving native defaults and separate header/tool ownership; add exhaustive branch tests and Calc-owned provenance records. Use existing shared architecture without duplication. Validate Calc all-four 100% coverage, relevant static and registry checks; commit only task scope on calc. User instruction to begin implementation supplies approval; network permission received separately. This first task deliberately leaves parsing, formatting, document/formula ownership and browser activation for subsequent executable tasks."
  Verify Steps: "Run npm run test:coverage:calc: all four V8 coverage metrics must be 100% without exclusions or counter manipulation. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, targeted ESLint/Prettier for authored files, ap doctor and node .agentplane/policy/check-routing.mjs. Test native coordinate bounds, zero/invalid defaults, address comparison/movement, range ordering/containment/intersection/extension and reference flags. This is Calc task 1/10; per user approval defer full suite to task 10. Record genuine upstream-source limits."
  Verification: "Pending implementation and scoped verification."
  Rollback Plan: "Revert only this task implementation commit and its Calc foundation files; keep prior Writer/shared changes and other task records intact. No branch merge or history rewriting."
  Findings: "User explicitly requested beginning Calc implementation and network reading of pinned LibreOffice sources. Shared modules must be reused and amended only when necessary, never duplicated. Writer intentional I/O/recovery decisions also apply to future Calc adapters. Existing DOING tasks belong to prior work and are not this Calc task."
id_source: "generated"
---
## Summary

Calc core coordinate and range foundation

Begin approved Calc implementation on branch calc in this checkout. Reimplement pinned LibreOffice coordinate types, address and range contracts with original defaults, shared-module reuse, source provenance and independent Calc coverage. First of ten Calc tasks before a full-suite run; no branch integration.

## Scope

Calc foundation only: sc/inc/types.ts, sc/inc/address.ts, sc/source/core/tool/address.ts, colocated Calc tests, Calc-owned runtime/provenance/capability records and docs/program/calc-core.md. Cache selected pinned source files under ignored vendor/libreoffice-reference. No Writer production changes, UI activation, merges, recovery, or dependency version changes.

## Plan

Implement independent TypeScript coordinate types, ScAddress and ScRange numerical contracts from exact pinned source, preserving native defaults and separate header/tool ownership; add exhaustive branch tests and Calc-owned provenance records. Use existing shared architecture without duplication. Validate Calc all-four 100% coverage, relevant static and registry checks; commit only task scope on calc. User instruction to begin implementation supplies approval; network permission received separately. This first task deliberately leaves parsing, formatting, document/formula ownership and browser activation for subsequent executable tasks.

## Verify Steps

Run npm run test:coverage:calc: all four V8 coverage metrics must be 100% without exclusions or counter manipulation. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, targeted ESLint/Prettier for authored files, ap doctor and node .agentplane/policy/check-routing.mjs. Test native coordinate bounds, zero/invalid defaults, address comparison/movement, range ordering/containment/intersection/extension and reference flags. This is Calc task 1/10; per user approval defer full suite to task 10. Record genuine upstream-source limits.

## Verification

Pending implementation and scoped verification.

## Rollback Plan

Revert only this task implementation commit and its Calc foundation files; keep prior Writer/shared changes and other task records intact. No branch merge or history rewriting.

## Findings

User explicitly requested beginning Calc implementation and network reading of pinned LibreOffice sources. Shared modules must be reused and amended only when necessary, never duplicated. Writer intentional I/O/recovery decisions also apply to future Calc adapters. Existing DOING tasks belong to prior work and are not this Calc task.
