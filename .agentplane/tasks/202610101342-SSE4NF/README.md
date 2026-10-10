---
id: "202610101342-SSE4NF"
title: "Prioritize Calc UI prerequisites and port original cell type and text metadata"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
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
  updated_at: "2026-10-10T13:44:20.240Z"
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
    body: "Start: implement original cell metadata and shared script discriminator, record UI-first dependency order and explicitly requested Calc journal rename; native/scoped checks and inventories, no mocks or Writer edits."
events:
  -
    type: "status"
    at: "2026-10-10T13:44:28.917Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original cell metadata and shared script discriminator, record UI-first dependency order and explicitly requested Calc journal rename; native/scoped checks and inventories, no mocks or Writer edits."
doc_version: 3
doc_updated_at: "2026-10-10T13:44:28.917Z"
doc_updated_by: "CODER"
description: "User-authorized reordered core work for first real Calc UI: value/text prerequisites, storage write and cell owners, column/table/document, edit notifications/undo, then view/input. Implement original CellType, CellTextAttr defaults and shared SvtScriptType at original boundaries; native differential complete field/copy/assignment/narrowing evidence, inventories and roadmap. Calc branch only, reuse shared owners, no temporary document/UI model. First task since the requested full task31 run; next scheduled full after ten completed tasks."
sections:
  Summary: |-
    Prioritize Calc UI prerequisites and port original cell type and text metadata

    User-authorized reordered core work for first real Calc UI: value/text prerequisites, storage write and cell owners, column/table/document, edit notifications/undo, then view/input. Implement original CellType, CellTextAttr defaults and shared SvtScriptType at original boundaries; native differential complete field/copy/assignment/narrowing evidence, inventories and roadmap. Calc branch only, reuse shared owners, no temporary document/UI model. First task since the requested full task31 run; next scheduled full after ten completed tasks.
  Scope: "Original CellType, CellTextAttr, TEXTWIDTH_DIRTY and shared SvtScriptType at original Calc/header/core-data boundaries; source-verified native fixture and actual100% scoped Calc/shared tests, inventories and UI-prerequisite roadmap. Additional explicit user instruction: rename docs/program/upstream-suspected-issues.md to docs/program/calc-upstream-suspected-issues.md and update all current source/docs/registry references; retain immutable finished-task historical references. No mock document, Writer edits, unrelated APIs, UI or merges."
  Plan: "Implement exact original CellType and cell text metadata with shared script discriminator, preserving upstream header/core-data owners and native defaults/copy/narrowing contracts. Record the revised dependency priority spine: concrete value/text prerequisites including SharedString/managed-value owners, required mdds writes and CellStore, ScColumn/ScTable/ScDocument, edit/notification/undo, then view/input integration through shared Sfx/browser surfaces. Validate bounded native differential fields with original source scopes and portable fixtures, actual100% scoped coverage, source/runtime inventories and ordinary gates. Commit, EVALUATOR review, verify and close this executable leaf before taking the next real dependency. Do not wait for unrelated full container/formula features before UI prerequisites, and do not synthesize missing document owners."
  Verify Steps: "Read brief/next-action/verify-show. Native calc-celltextattr probe --write then --check with exact pinned complete original enum/struct/constructor/constants scopes, actual source/extracted SHA, ASan/UBSan; compare complete field snapshots of defaultFFFF/UNKNOWN8, copies/assignment/selfassign and valid UInt16/UInt8 conversions. Portable Calc/shared tests with upstream link absent, exact finally restore. npm run test:coverage:calc actual allfour100 with raw s/f/b positive; npm run test:coverage:shared -- src/svl/inc/languageoptions.test.ts --coverage.include=src/svl/inc/languageoptions.ts --coverage.reportsDirectory=coverage/script-types actual allfour100. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Ordinary formatter on authored/touched code/data/records/docs. Verify journal rename retains every original entry and all current non-historical links resolve to calc-upstream-suspected-issues.md. Preserve immutable finished tasks. No full suite task1/10 after last full task31; next scheduled task41. No thresholds/timeouts/data/config weakening. Commit implementation, EVALUATOR read-only review, verify and clean task closure on branchcalc."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task-owned implementation, fixture, probe, registry and documentation commits; retain previous completed task31 records and unrelated active tasks. Re-run scoped Calc/shared coverage and source registry gates after rollback."
  Findings: "The user resumed the goal and explicitly changed priority to missing core owners required for real UI. The repository has no original ScDocument/ScTable/ScColumn/ScCellValue or Calc view/input owners. Reusable Sfx/browser command infrastructure and original selection/address owners already exist. Original text metadata depends on shared SvtScriptType and globalnames TEXTWIDTH_DIRTY; this small leaf establishes those exact defaults/types before native cell/column storage integration. Previous full run is task31; subsequent full runs remain every ten tasks. Suspicious source behavior continues in docs/program/upstream-suspected-issues.md without repairs."
id_source: "generated"
---
## Summary

Prioritize Calc UI prerequisites and port original cell type and text metadata

User-authorized reordered core work for first real Calc UI: value/text prerequisites, storage write and cell owners, column/table/document, edit notifications/undo, then view/input. Implement original CellType, CellTextAttr defaults and shared SvtScriptType at original boundaries; native differential complete field/copy/assignment/narrowing evidence, inventories and roadmap. Calc branch only, reuse shared owners, no temporary document/UI model. First task since the requested full task31 run; next scheduled full after ten completed tasks.

## Scope

Original CellType, CellTextAttr, TEXTWIDTH_DIRTY and shared SvtScriptType at original Calc/header/core-data boundaries; source-verified native fixture and actual100% scoped Calc/shared tests, inventories and UI-prerequisite roadmap. Additional explicit user instruction: rename docs/program/upstream-suspected-issues.md to docs/program/calc-upstream-suspected-issues.md and update all current source/docs/registry references; retain immutable finished-task historical references. No mock document, Writer edits, unrelated APIs, UI or merges.

## Plan

Implement exact original CellType and cell text metadata with shared script discriminator, preserving upstream header/core-data owners and native defaults/copy/narrowing contracts. Record the revised dependency priority spine: concrete value/text prerequisites including SharedString/managed-value owners, required mdds writes and CellStore, ScColumn/ScTable/ScDocument, edit/notification/undo, then view/input integration through shared Sfx/browser surfaces. Validate bounded native differential fields with original source scopes and portable fixtures, actual100% scoped coverage, source/runtime inventories and ordinary gates. Commit, EVALUATOR review, verify and close this executable leaf before taking the next real dependency. Do not wait for unrelated full container/formula features before UI prerequisites, and do not synthesize missing document owners.

## Verify Steps

Read brief/next-action/verify-show. Native calc-celltextattr probe --write then --check with exact pinned complete original enum/struct/constructor/constants scopes, actual source/extracted SHA, ASan/UBSan; compare complete field snapshots of defaultFFFF/UNKNOWN8, copies/assignment/selfassign and valid UInt16/UInt8 conversions. Portable Calc/shared tests with upstream link absent, exact finally restore. npm run test:coverage:calc actual allfour100 with raw s/f/b positive; npm run test:coverage:shared -- src/svl/inc/languageoptions.test.ts --coverage.include=src/svl/inc/languageoptions.ts --coverage.reportsDirectory=coverage/script-types actual allfour100. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Ordinary formatter on authored/touched code/data/records/docs. Verify journal rename retains every original entry and all current non-historical links resolve to calc-upstream-suspected-issues.md. Preserve immutable finished tasks. No full suite task1/10 after last full task31; next scheduled task41. No thresholds/timeouts/data/config weakening. Commit implementation, EVALUATOR read-only review, verify and clean task closure on branchcalc.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task-owned implementation, fixture, probe, registry and documentation commits; retain previous completed task31 records and unrelated active tasks. Re-run scoped Calc/shared coverage and source registry gates after rollback.

## Findings

The user resumed the goal and explicitly changed priority to missing core owners required for real UI. The repository has no original ScDocument/ScTable/ScColumn/ScCellValue or Calc view/input owners. Reusable Sfx/browser command infrastructure and original selection/address owners already exist. Original text metadata depends on shared SvtScriptType and globalnames TEXTWIDTH_DIRTY; this small leaf establishes those exact defaults/types before native cell/column storage integration. Previous full run is task31; subsequent full runs remain every ten tasks. Suspicious source behavior continues in docs/program/upstream-suspected-issues.md without repairs.
