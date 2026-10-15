---
id: "202610151935-0KNPGW"
title: "Fix generated UNO exception module initialization order"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T19:39:56.504Z"
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
    body: "Start: isolate shared generated exception evaluation order without changing native class member semantics or hiding failures in consumers."
events:
  -
    type: "status"
    at: "2026-10-15T19:39:57.747Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: isolate shared generated exception evaluation order without changing native class member semantics or hiding failures in consumers."
doc_version: 3
doc_updated_at: "2026-10-15T19:42:40.432Z"
doc_updated_by: "CODER"
description: "Task166a: correct the shared CPPU base/derived exception evaluation cycle exposed by direct Exception import. Keep public module exports, actual class identity, generated fields/member bodies and type factory unchanged; no consumer import-order workaround, prototype/type registry or memory manager."
sections:
  Summary: "Task166a fixes the real shared CPPU Exception-first module evaluation failure blocking task166 uppercase integration. Preserve generated value semantics and public class identity; do not mask the cycle by consumer import order."
  Scope: "Existing cppu/inc/com/sun/star/uno/{Exception,RuntimeException}.ts, a common exception-values.ts initialization unit and exception-initialization.test.ts; their runtime/provenance records; CAP-20d5c31d-598e-444e-b968-1431c43403ed and shared implementation documentation. Task-local ignored evidence/scripts are allowed. No new lifetime engine, type registry, import-cycle exception, native executable or Writer-only coverage remediation. Existing generated class/member and type factory bodies must remain unchanged."
  Plan: "1. Audit the generated native exception declarations and current ESM cycle. 2. Co-locate existing base/derived value definitions in dependency-safe declaration order; retain public reexports and the original generated type factory. 3. Test independent public import entry points plus constructors, copy/move/type identity; reuse existing CPPU and Writer tests. 4. Update truthful source provenance/inventory and prove unchanged class/factory bodies. 5. Run related shared strict raw coverage, whole Calc strict coverage and source gates; commit and same-agent evaluator review, then resume task166. Standing user authorization covers necessary canonical shared corrections. No full suite until actual minimum UI plus ODS milestone."
  Verify Steps: "Run isolated entry-order regression tests and related CPPU/Writer tests through Vitest with native reference symlinks absent/restored. Require raw positive S/B/F/L 100% for changed executable shared owners (RuntimeException and exception-values) and exact measured owner set; Writer-only coverage gaps exempt. Run npm run test:coverage:calc and compare exact 33-owner set. Run task-local source-gates.mjs (format, lint, typecheck, docs, size, dependencies, tree, provenance, parity, routing, doctor, diff, boundary tests). Audit pinned native declarations and unchanged original class/factory bodies. Record source commit, verification and same-agent evaluator evidence; no full all-app test run."
  Verification: "Pending implementation and checks; no passed behavior claim."
  Rollback Plan: "Revert only task166a intentional source/registry/documentation changes through a follow-up task; preserve task166 checkpoint and unrelated tasks. No branch reset or merge."
  Findings: |-
    - Observation: Related36 tests and Calc187 pass with raw100 exact shared owners. Source gates format/lint/typecheck/docs/size pass; repository dependency gate exposes five missing module edges in checkpointed task166 uppercase files, outside this exception correction. Semantic audit reached only a retained-evidence schema lookup error after confirming unchanged class/factory token hashes and native pins.
      Impact: Do not claim complete repository gate acceptance until task166 boundary/provenance work is complete. No CPPU cycle exception or guard relaxation is necessary.
      Resolution: Keep task166a DOING; complete the already-approved task166 metadata/boundary registration and rerun failed/pending gates. Correct ignored evidence lookup to use the retained profile key.
id_source: "generated"
---
## Summary

Task166a fixes the real shared CPPU Exception-first module evaluation failure blocking task166 uppercase integration. Preserve generated value semantics and public class identity; do not mask the cycle by consumer import order.

## Scope

Existing cppu/inc/com/sun/star/uno/{Exception,RuntimeException}.ts, a common exception-values.ts initialization unit and exception-initialization.test.ts; their runtime/provenance records; CAP-20d5c31d-598e-444e-b968-1431c43403ed and shared implementation documentation. Task-local ignored evidence/scripts are allowed. No new lifetime engine, type registry, import-cycle exception, native executable or Writer-only coverage remediation. Existing generated class/member and type factory bodies must remain unchanged.

## Plan

1. Audit the generated native exception declarations and current ESM cycle. 2. Co-locate existing base/derived value definitions in dependency-safe declaration order; retain public reexports and the original generated type factory. 3. Test independent public import entry points plus constructors, copy/move/type identity; reuse existing CPPU and Writer tests. 4. Update truthful source provenance/inventory and prove unchanged class/factory bodies. 5. Run related shared strict raw coverage, whole Calc strict coverage and source gates; commit and same-agent evaluator review, then resume task166. Standing user authorization covers necessary canonical shared corrections. No full suite until actual minimum UI plus ODS milestone.

## Verify Steps

Run isolated entry-order regression tests and related CPPU/Writer tests through Vitest with native reference symlinks absent/restored. Require raw positive S/B/F/L 100% for changed executable shared owners (RuntimeException and exception-values) and exact measured owner set; Writer-only coverage gaps exempt. Run npm run test:coverage:calc and compare exact 33-owner set. Run task-local source-gates.mjs (format, lint, typecheck, docs, size, dependencies, tree, provenance, parity, routing, doctor, diff, boundary tests). Audit pinned native declarations and unchanged original class/factory bodies. Record source commit, verification and same-agent evaluator evidence; no full all-app test run.

## Verification

Pending implementation and checks; no passed behavior claim.

## Rollback Plan

Revert only task166a intentional source/registry/documentation changes through a follow-up task; preserve task166 checkpoint and unrelated tasks. No branch reset or merge.

## Findings

- Observation: Related36 tests and Calc187 pass with raw100 exact shared owners. Source gates format/lint/typecheck/docs/size pass; repository dependency gate exposes five missing module edges in checkpointed task166 uppercase files, outside this exception correction. Semantic audit reached only a retained-evidence schema lookup error after confirming unchanged class/factory token hashes and native pins.
  Impact: Do not claim complete repository gate acceptance until task166 boundary/provenance work is complete. No CPPU cycle exception or guard relaxation is necessary.
  Resolution: Keep task166a DOING; complete the already-approved task166 metadata/boundary registration and rerun failed/pending gates. Correct ignored evidence lookup to use the retained profile key.
