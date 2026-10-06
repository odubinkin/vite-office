---
id: "202610061107-30SK7E"
title: "Select all through native cell table and text contexts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T11:08:05.542Z"
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
    body: "Start: Implement source-owned contextual Select All under standing iterative authorization; one leaf, one upstream-absent profile."
events:
  -
    type: "status"
    at: "2026-10-06T11:08:06.220Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement source-owned contextual Select All under standing iterative authorization; one leaf, one upstream-absent profile."
doc_version: 3
doc_updated_at: "2026-10-06T11:08:06.220Z"
doc_updated_by: "CODER"
description: "Iteration185: replace body-only SelectAll with source-owned contextual selection and actual native cursor/table owners; verify core mounted and Chromium behavior without upstream."
sections:
  Summary: "Iteration185: native contextual Select All replaces the body-only paragraph shortcut. Actual SwCursorShell/SwFEShell/SwWrtShell owners select current cell text, then table boxes, then surrounding text; browser sends current DOM point/mark."
  Scope: "apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/editor/browser-writer-edit-window.ts; apps/office/src/sw/source/uibase/wrtsh/native-select-all.test.ts; apps/office/src/sw/browser/editor/native-select-all.test.tsx; apps/office/e2e/writer-native-select-all.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Preserve all270 prior semantic statuses/defaults/classifications and full justification/evidence prefixes; source-backed responsibility/evidence additions only. All482 prior acceptance files remain byte-identical. Conscious I/O/recovery deviations unchanged. No network/outside access/subagents. Bounded English AP prose/counts/hashes/outcomes/exact failures only; raw cases/maps/source snapshots in ignored app cache."
  Plan: "Standing iterative UI/refactor authorization applies. Implement range-based native cell/table/text escalation, full-table admission in actual frame shell, core table exit and extended first/last table selection from real SwNodes. Preserve native direction, mark/point owner identity, table rings, pending attributes, unchanged document/history, and ordinary command routing. No UI press counter, TextRuns translation, synthetic operation port, or new projection owner. Represent current flat tables/body/cell graph faithfully; nested/protected/layout/hidden sections remain unverified outside represented model. Add core/mounted/Chromium literal cases for repeated, partial/reversed/empty cell, already full table, leading/trailing tables, unavailable outer text, DOM synchronization, subsequent edit/history. Six initial static gates, ONE full absent profile, only original failures/new cases and failed/changed-path checks thereafter. Once-restored source/scope/gov and exact-SHA same-agent quality review. One leaf only; parent goal ACTIVE/full parity UNVERIFIED."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates repeated. Scoped unchanged JSDoc and actual physical-line checks on4 changed source files.
    2. ONE full upstream-absent profile, vendor renamed inside repo/restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure with JSON raw cases/maps; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before asserting. No full/passing replay or tests invoking upstream; original failure/new-case closure only if necessary.
    3. All482 prior acceptance files remain byte-identical. New core/mounted/Chromium cases check native Select All from collapsed/partial/reversed/multi-paragraph/empty cells; cell -> full table -> parent text; original actual ordinary/table cursor owners and marks; leading/trailing table extended range; already full/partial box mode; missing outer text; browser synchronization/repeat restore, subsequent editing/history and unchanged neighbors/document history.100% actual app/inventory counters; any transfer only identical maps or entire byte-identical ranges with actual counters. No UI press counter/body-only shortcut/synthetic selection port; actual core/frame/shell owners and native positions.
    4. After restoration generation --check/source-tree/provenance/invariants/parity once. Scope audit all270 prior semantic statuses/defaults/classes preserved; source-backed responsibilities/evidence additions only. Scoped AP source/helper prohibition, doctor/routing/diff and same-agent exact-SHA quality; scoped implementation/evidence/verification/clean close; preserve entire parent Findings prefix.
  Verification: "Pending native contextual selection and declared gates."
  Rollback Plan: "Revert scoped semantic change through a separate leaf if cursor/table/UI behavior regresses; preserve DONE evidence and conscious deviations."
  Findings: "184 DONE implementation422482e0a0c4635daa2f345ec39dfde5dd6fadad; parent7bd7e3fbfd95aa9b60ba7964f2e5d39a8b0ebaab. Native SelAll select.cxx131-229 uses actual full-section/whole-table cursor state. Core MoveOutOfTable, ExtendedSelectAll/ExtendedSelectedAll/StartsWith_ and frame HasWholeTabSelection own contextual selection. Local SelectAll only direct body paragraphs and browser shortcut omitted DOM synchronization. Optional guessed source/browser/core paths absent; discovery resolved via rg to vendor/libreoffice-reference actual pinned paths; routes recomputed before mutation. Full parity and structural deletion of extended table boundary nodes remain unverified."
id_source: "generated"
---
## Summary

Iteration185: native contextual Select All replaces the body-only paragraph shortcut. Actual SwCursorShell/SwFEShell/SwWrtShell owners select current cell text, then table boxes, then surrounding text; browser sends current DOM point/mark.

## Scope

apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/editor/browser-writer-edit-window.ts; apps/office/src/sw/source/uibase/wrtsh/native-select-all.test.ts; apps/office/src/sw/browser/editor/native-select-all.test.tsx; apps/office/e2e/writer-native-select-all.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Preserve all270 prior semantic statuses/defaults/classifications and full justification/evidence prefixes; source-backed responsibility/evidence additions only. All482 prior acceptance files remain byte-identical. Conscious I/O/recovery deviations unchanged. No network/outside access/subagents. Bounded English AP prose/counts/hashes/outcomes/exact failures only; raw cases/maps/source snapshots in ignored app cache.

## Plan

Standing iterative UI/refactor authorization applies. Implement range-based native cell/table/text escalation, full-table admission in actual frame shell, core table exit and extended first/last table selection from real SwNodes. Preserve native direction, mark/point owner identity, table rings, pending attributes, unchanged document/history, and ordinary command routing. No UI press counter, TextRuns translation, synthetic operation port, or new projection owner. Represent current flat tables/body/cell graph faithfully; nested/protected/layout/hidden sections remain unverified outside represented model. Add core/mounted/Chromium literal cases for repeated, partial/reversed/empty cell, already full table, leading/trailing tables, unavailable outer text, DOM synchronization, subsequent edit/history. Six initial static gates, ONE full absent profile, only original failures/new cases and failed/changed-path checks thereafter. Once-restored source/scope/gov and exact-SHA same-agent quality review. One leaf only; parent goal ACTIVE/full parity UNVERIFIED.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates repeated. Scoped unchanged JSDoc and actual physical-line checks on4 changed source files.
2. ONE full upstream-absent profile, vendor renamed inside repo/restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure with JSON raw cases/maps; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before asserting. No full/passing replay or tests invoking upstream; original failure/new-case closure only if necessary.
3. All482 prior acceptance files remain byte-identical. New core/mounted/Chromium cases check native Select All from collapsed/partial/reversed/multi-paragraph/empty cells; cell -> full table -> parent text; original actual ordinary/table cursor owners and marks; leading/trailing table extended range; already full/partial box mode; missing outer text; browser synchronization/repeat restore, subsequent editing/history and unchanged neighbors/document history.100% actual app/inventory counters; any transfer only identical maps or entire byte-identical ranges with actual counters. No UI press counter/body-only shortcut/synthetic selection port; actual core/frame/shell owners and native positions.
4. After restoration generation --check/source-tree/provenance/invariants/parity once. Scope audit all270 prior semantic statuses/defaults/classes preserved; source-backed responsibilities/evidence additions only. Scoped AP source/helper prohibition, doctor/routing/diff and same-agent exact-SHA quality; scoped implementation/evidence/verification/clean close; preserve entire parent Findings prefix.

## Verification

Pending native contextual selection and declared gates.

## Rollback Plan

Revert scoped semantic change through a separate leaf if cursor/table/UI behavior regresses; preserve DONE evidence and conscious deviations.

## Findings

184 DONE implementation422482e0a0c4635daa2f345ec39dfde5dd6fadad; parent7bd7e3fbfd95aa9b60ba7964f2e5d39a8b0ebaab. Native SelAll select.cxx131-229 uses actual full-section/whole-table cursor state. Core MoveOutOfTable, ExtendedSelectAll/ExtendedSelectedAll/StartsWith_ and frame HasWholeTabSelection own contextual selection. Local SelectAll only direct body paragraphs and browser shortcut omitted DOM synchronization. Optional guessed source/browser/core paths absent; discovery resolved via rg to vendor/libreoffice-reference actual pinned paths; routes recomputed before mutation. Full parity and structural deletion of extended table boundary nodes remain unverified.
