---
id: "202610011530-YKNJG7"
title: "Remove pinned upstream access from module boundary test"
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
  updated_at: "2026-10-01T15:30:45.425Z"
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
    body: "Start: Remove direct upstream read from module boundary test and verify existing suites with vendor unavailable."
events:
  -
    type: "status"
    at: "2026-10-01T15:30:45.876Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Remove direct upstream read from module boundary test and verify existing suites with vendor unavailable."
doc_version: 3
doc_updated_at: "2026-10-01T15:30:45.876Z"
doc_updated_by: "CODER"
description: "Enforce explicit user requirement that project tests do not read, compile or invoke pinned upstream. Remove direct native Makefile read from existing boundary tooling test while preserving every local allowed/rejected edge assertion. Native development probes remain manual and outside test commands."
sections:
  Summary: "Make the module-boundary tooling test independent of pinned upstream, as explicitly required by the user."
  Scope: "scripts/check-module-boundaries.test.ts only for implementation; task evidence and lifecycle records. Preserve all local allowlist/reverse/browser edge assertions. No production/runtime behavior or existing parity task changes. Temporarily relocate vendor and the unfinished task48 test within ignored repository scratch during verification, restoring both with finally handling."
  Plan: "Remove the native Makefile read and fs import from the boundary test; retain local dependency assertions and describe their contract accurately. Verify formatting, type checking and selected tooling tests without vendor. Run the existing application and inventory coverage suites with vendor unavailable, excluding only unfinished task48 test already outside the committed baseline. Restore vendor and unfinished work, run doctor/routing/diff, record evidence and commit this one-test correction separately."
  Verify Steps: "Run focused boundary, provenance and resource-model tooling tests with vendor/libreoffice-reference temporarily unavailable; run existing committed application and inventory coverage suites without vendor, excluding the unfinished untracked task48 test, preserving original coverage thresholds. Run format check on the changed file and npm run typecheck:tools. Audit project test command chains for native compiler/developer probe invocation. Ensure vendor and unfinished task48 test restored even on failure; unchanged production source and native fixtures. Run ap doctor, routing validator and git diff --check; inspect exact implementation scope and record verification/evaluator before closure."
  Verification: "Pending targeted test correction. Test independence is measured with vendor unavailable, not inferred only from text search. Static resource/provenance/inventory audit commands in npm verify may read vendor and remain separate from test commands; no native execution."
  Rollback Plan: "Revert the isolated test correction commit. Restore temporary vendor/test relocation in finally handling before any lifecycle commit."
  Findings: "The existing boundary test directly reads editeng/Library_editeng.mk. The application tests have no compiler or upstream source references; native JSON fixtures contain literal data. The unfinished task48 test is not part of the committed test baseline and expects not-yet-implemented tree methods; exclude it only for this baseline-independence check."
id_source: "generated"
---
## Summary

Make the module-boundary tooling test independent of pinned upstream, as explicitly required by the user.

## Scope

scripts/check-module-boundaries.test.ts only for implementation; task evidence and lifecycle records. Preserve all local allowlist/reverse/browser edge assertions. No production/runtime behavior or existing parity task changes. Temporarily relocate vendor and the unfinished task48 test within ignored repository scratch during verification, restoring both with finally handling.

## Plan

Remove the native Makefile read and fs import from the boundary test; retain local dependency assertions and describe their contract accurately. Verify formatting, type checking and selected tooling tests without vendor. Run the existing application and inventory coverage suites with vendor unavailable, excluding only unfinished task48 test already outside the committed baseline. Restore vendor and unfinished work, run doctor/routing/diff, record evidence and commit this one-test correction separately.

## Verify Steps

Run focused boundary, provenance and resource-model tooling tests with vendor/libreoffice-reference temporarily unavailable; run existing committed application and inventory coverage suites without vendor, excluding the unfinished untracked task48 test, preserving original coverage thresholds. Run format check on the changed file and npm run typecheck:tools. Audit project test command chains for native compiler/developer probe invocation. Ensure vendor and unfinished task48 test restored even on failure; unchanged production source and native fixtures. Run ap doctor, routing validator and git diff --check; inspect exact implementation scope and record verification/evaluator before closure.

## Verification

Pending targeted test correction. Test independence is measured with vendor unavailable, not inferred only from text search. Static resource/provenance/inventory audit commands in npm verify may read vendor and remain separate from test commands; no native execution.

## Rollback Plan

Revert the isolated test correction commit. Restore temporary vendor/test relocation in finally handling before any lifecycle commit.

## Findings

The existing boundary test directly reads editeng/Library_editeng.mk. The application tests have no compiler or upstream source references; native JSON fixtures contain literal data. The unfinished task48 test is not part of the committed test baseline and expects not-yet-implemented tree methods; exclude it only for this baseline-independence check.
