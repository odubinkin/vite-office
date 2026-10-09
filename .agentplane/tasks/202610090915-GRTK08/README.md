---
id: "202610090915-GRTK08"
title: "Port Calc reference transpose and growth geometry"
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
  updated_at: "2026-10-09T09:15:53.816Z"
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
    body: "Start: port original transpose and growth geometry using existing coordinate owners with pinned native comparison and scoped actual100 tests."
events:
  -
    type: "status"
    at: "2026-10-09T09:15:55.758Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original transpose and growth geometry using existing coordinate owners with pinned native comparison and scoped actual100 tests."
doc_version: 3
doc_updated_at: "2026-10-09T09:15:55.758Z"
doc_updated_by: "CODER"
description: "Implement original ScRefUpdate result domain and DoTranspose, UpdateTranspose and UpdateGrow numerical operations using existing ScAddress/ScRange owners, then native differential acceptance and inventory. Calc milestone9; milestone10 full suites followed by explicit goal pause."
sections:
  Summary: "Port original ScRefUpdate transpose and area-growth geometry without document/compiler stubs; prepare full validation and user-requested pause."
  Scope: "New sc/source/core/inc/refupdat.ts and sc/source/core/tool/refupdat.ts, focused test and native fixture, scripts/calc-refupdat-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse original ScAddress/ScRange and ScAddressDocument. No existing shared/Writer or earlier source/test/fixture changes. Only calc branch/checkout. Milestone9; milestone10 full-suite validation and fixes, then pause goal."
  Plan: "Implement original result enum and static DoTranspose/UpdateTranspose/UpdateGrow at core/inc and core/tool boundaries, using explicit output tuple for native references and existing value-owner assignment. Native comparison compiles unchanged complete three-method source interval and original address/range numerical inline bodies in bounded table-count getter shell; use defined native arithmetic and positive table counts. Enumerate independent axes, reversed/raw ranges, multiwrap tabs, narrow boundaries, growth predicates and original source aliasing. Leave other original methods absent and registry parity unverified; actual100 coverage and scoped guards validate milestone9. Then execute a separate milestone10 full test validation/fixes task and pause the goal as explicitly requested."
  Verify Steps: "Run native probe --write and --check requiring unchanged pinned original DoTranspose/UpdateTranspose/UpdateGrow bodies and original coordinate constructors/Contains under ASan/UBSan. Compare every saved result and raw endpoint through TS, cover sheet wrap, coordinate narrowing, source containment, header row growth and recipient endpoint identities. Run npm run test:coverage:calc actual100 all four metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean calc state. Preserve prior fixtures/tests/status flags. Full suites in next milestone10, followed by explicit goal pause."
  Verification: "Pending native geometry implementation and actual100 scoped checks."
  Rollback Plan: "Revert only this implementation commit; earlier ordinary/big/reference/range-list owners and fixtures remain independent."
  Findings: "Use the original core/inc header boundary rather than sc/inc. DoTranspose uses signed16 relative column and tab temporaries, signed32 row/SCCOLROW and repeated sheet wrapping with positive document table count. UpdateTranspose affects only source-contained references, including no-op coordinate transforms returning UPDATED; aliases must retain native snapshot-before-assignment behavior. UpdateGrow computes both predicates before either mutation and permits row headers. Ordinary/big Update overloads and MoveRelWrap remain absent, with no temporary replacements. Full validation has a separate verification deliverable and fulfills the tenth-task cadence; user explicitly requires pausing after success and error remediation."
id_source: "generated"
---
## Summary

Port original ScRefUpdate transpose and area-growth geometry without document/compiler stubs; prepare full validation and user-requested pause.

## Scope

New sc/source/core/inc/refupdat.ts and sc/source/core/tool/refupdat.ts, focused test and native fixture, scripts/calc-refupdat-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse original ScAddress/ScRange and ScAddressDocument. No existing shared/Writer or earlier source/test/fixture changes. Only calc branch/checkout. Milestone9; milestone10 full-suite validation and fixes, then pause goal.

## Plan

Implement original result enum and static DoTranspose/UpdateTranspose/UpdateGrow at core/inc and core/tool boundaries, using explicit output tuple for native references and existing value-owner assignment. Native comparison compiles unchanged complete three-method source interval and original address/range numerical inline bodies in bounded table-count getter shell; use defined native arithmetic and positive table counts. Enumerate independent axes, reversed/raw ranges, multiwrap tabs, narrow boundaries, growth predicates and original source aliasing. Leave other original methods absent and registry parity unverified; actual100 coverage and scoped guards validate milestone9. Then execute a separate milestone10 full test validation/fixes task and pause the goal as explicitly requested.

## Verify Steps

Run native probe --write and --check requiring unchanged pinned original DoTranspose/UpdateTranspose/UpdateGrow bodies and original coordinate constructors/Contains under ASan/UBSan. Compare every saved result and raw endpoint through TS, cover sheet wrap, coordinate narrowing, source containment, header row growth and recipient endpoint identities. Run npm run test:coverage:calc actual100 all four metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean calc state. Preserve prior fixtures/tests/status flags. Full suites in next milestone10, followed by explicit goal pause.

## Verification

Pending native geometry implementation and actual100 scoped checks.

## Rollback Plan

Revert only this implementation commit; earlier ordinary/big/reference/range-list owners and fixtures remain independent.

## Findings

Use the original core/inc header boundary rather than sc/inc. DoTranspose uses signed16 relative column and tab temporaries, signed32 row/SCCOLROW and repeated sheet wrapping with positive document table count. UpdateTranspose affects only source-contained references, including no-op coordinate transforms returning UPDATED; aliases must retain native snapshot-before-assignment behavior. UpdateGrow computes both predicates before either mutation and permits row headers. Ordinary/big Update overloads and MoveRelWrap remain absent, with no temporary replacements. Full validation has a separate verification deliverable and fulfills the tenth-task cadence; user explicitly requires pausing after success and error remediation.
