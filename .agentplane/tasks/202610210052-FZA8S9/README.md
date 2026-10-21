---
id: "202610210052-FZA8S9"
title: "Implement native Calc connected-area and whole-sheet selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc -- --maxWorkers=1"
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T00:52:59.936Z"
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
    body: "Start: Implement original connected-area selection and source UI command routing in calc only under the resumed approved goal."
events:
  -
    type: "status"
    at: "2026-10-21T00:53:07.206Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement original connected-area selection and source UI command routing in calc only under the resumed approved goal."
doc_version: 3
doc_updated_at: "2026-10-21T00:53:07.206Z"
doc_updated_by: "CODER"
description: "Block61: port actual column occupancy and table/document connected data-area algorithms; restore original initial one-column allocation; bind SelectData and SelectAll through native view/cell shell and existing shared Writer menus/accelerators/corner. Preserve native first-range then whole-sheet behavior and all document/history invariants. Calc checkout/branch only, no merge/network. Related tests and all Calc coverage100; next full checkpoint70."
sections:
  Summary: |-
    Implement native Calc connected-area and whole-sheet selection

    Block61: port actual column occupancy and table/document connected data-area algorithms; restore original initial one-column allocation; bind SelectData and SelectAll through native view/cell shell and existing shared Writer menus/accelerators/corner. Preserve native first-range then whole-sheet behavior and all document/history invariants. Calc checkout/branch only, no merge/network. Related tests and all Calc coverage100; next full checkpoint70.
  Scope: "Original column2 occupancy/range/last-row queries,table1 connected-area expansion/shrink and document delegation; INITIALCOLCOUNT=1 constructor default. Actual SelectAll/MarkDataArea native view/cell-shell routing;shared SDI menus,platform accelerator and grid corner browser bindings. Up to30 source/test/browser acceptance files plus registry/provenance/evidence/readiness docs. Existing supported plain scalar/formula model;no fake services,rich edit,protection or drawing owner. Only calc checkout and branch."
  Plan: "Restore actual initial one-column storage;port native occupancy and complete connected-area expansion/shrink modifiers against genuine typed stores without browser data copies. Bind source SelectData and first-range/then-whole-sheet SelectAll semantics to actual marks and cursor. Reuse existing Writer menus,shortcut resolution and focus handling;corner selects whole sheet directly. Preserve selected sheets,cursor,content,dirty state and history;input widgets retain their own native text selection. Validate all Calc100,affected shared owners if any,related tests,types/lint/format/source/resource/registry/static gates and actual browser selection at desktop/mobile. Archive evidence,evaluator pass,clean close. Full all-app next70."
  Verify Steps: "Run all Calc tests with unchanged100percent Istanbul thresholds;native cases for all area directions,diagonals,holes,separated blocks,includeOld/onlyDown,clamping,empty tables,column occupancy and initial allocation. Real SDI/menu/accelerator/corner commands,repeat SelectAll,unchanged cursor/sheets/content/history and nested input selection. Related modified shared tests and100coverage if applicable. npm run typecheck;source-scoped eslint/prettier;module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor;production build/static. Actual Chromium desktop/mobile selection acceptance. Preserve raw results and native/source pins,evaluator pass and clean finish. Next full all-app checkpoint70."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only source and metadata commits for this task;retain task evidence and do not reset user history or merge branches."
  Findings: ""
id_source: "generated"
---
## Summary

Implement native Calc connected-area and whole-sheet selection

Block61: port actual column occupancy and table/document connected data-area algorithms; restore original initial one-column allocation; bind SelectData and SelectAll through native view/cell shell and existing shared Writer menus/accelerators/corner. Preserve native first-range then whole-sheet behavior and all document/history invariants. Calc checkout/branch only, no merge/network. Related tests and all Calc coverage100; next full checkpoint70.

## Scope

Original column2 occupancy/range/last-row queries,table1 connected-area expansion/shrink and document delegation; INITIALCOLCOUNT=1 constructor default. Actual SelectAll/MarkDataArea native view/cell-shell routing;shared SDI menus,platform accelerator and grid corner browser bindings. Up to30 source/test/browser acceptance files plus registry/provenance/evidence/readiness docs. Existing supported plain scalar/formula model;no fake services,rich edit,protection or drawing owner. Only calc checkout and branch.

## Plan

Restore actual initial one-column storage;port native occupancy and complete connected-area expansion/shrink modifiers against genuine typed stores without browser data copies. Bind source SelectData and first-range/then-whole-sheet SelectAll semantics to actual marks and cursor. Reuse existing Writer menus,shortcut resolution and focus handling;corner selects whole sheet directly. Preserve selected sheets,cursor,content,dirty state and history;input widgets retain their own native text selection. Validate all Calc100,affected shared owners if any,related tests,types/lint/format/source/resource/registry/static gates and actual browser selection at desktop/mobile. Archive evidence,evaluator pass,clean close. Full all-app next70.

## Verify Steps

Run all Calc tests with unchanged100percent Istanbul thresholds;native cases for all area directions,diagonals,holes,separated blocks,includeOld/onlyDown,clamping,empty tables,column occupancy and initial allocation. Real SDI/menu/accelerator/corner commands,repeat SelectAll,unchanged cursor/sheets/content/history and nested input selection. Related modified shared tests and100coverage if applicable. npm run typecheck;source-scoped eslint/prettier;module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor;production build/static. Actual Chromium desktop/mobile selection acceptance. Preserve raw results and native/source pins,evaluator pass and clean finish. Next full all-app checkpoint70.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only source and metadata commits for this task;retain task evidence and do not reset user history or merge branches.

## Findings
