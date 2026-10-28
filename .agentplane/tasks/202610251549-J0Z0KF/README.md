---
id: "202610251549-J0Z0KF"
title: "Implement Calc XLSX import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202610251549-R2DJ64"
tags:
  - "code"
  - "xlsx"
verify:
  - "XLSX upstream-fixture import and export/reopen covering supported cell types/formulas/styles/dimensions/sheets, malformed packages and shell stale-result handling; mounted and browser Open/download; related ODS tests and quality gates."
plan_approval:
  state: "approved"
  updated_at: "2026-10-28T06:56:50.033Z"
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
    body: "Start: Resume user-approved XLSX import/export work after the merge; begin native address and range prerequisites, preserve existing ODS/CSV and browser persistence behavior, and record bounded evidence without whole-format readiness claims."
events:
  -
    type: "status"
    at: "2026-10-28T06:57:27.536Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Resume user-approved XLSX import/export work after the merge; begin native address and range prerequisites, preserve existing ODS/CSV and browser persistence behavior, and record bounded evidence without whole-format readiness claims."
doc_version: 3
doc_updated_at: "2026-10-28T06:57:27.536Z"
doc_updated_by: "CODER"
description: "User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only."
sections:
  Summary: |-
    Implement Calc XLSX import export and existing file UI integration

    User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.
  Scope: |-
    - In scope: User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.
    - Out of scope: unrelated refactors not required for "Implement Calc XLSX import export and existing file UI integration".
  Plan: "Continue the already user-approved XLSX work: (1) implement native address/range, workbook/worksheet, shared-string, style and formula owners against the pinned source with original contracts and limits, replacing touched shortcuts; (2) route actual ScDocument import/export through ExcelFilter and the existing shell/file UI while preserving browser storage, recovery and autosave decisions; (3) verify supported-model upstream-fixture roundtrips, failure/stale-result behavior, browser download/reopen and targeted quality gates; (4) record suspected native issues without changing their semantics and finish only after complete acceptance. Work locally in the direct checkout; no publication or merge. Cohesive prerequisite checkpoints may be committed with explicit remaining gaps."
  Verify Steps: "Run focused Calc and shared tests for the implemented XLSX owners, including source-backed address/parser boundaries, then actual workbook import and export/reopen over committed Strict and Transitional upstream fixtures covering supported cells, types, formulas, formatting, dimensions and multiple sheets. Assert canonical ScDocument values and package XML; malformed input must preserve the active graph. Verify shell filter routing, cancellation and stale results, primary ODS state, mounted Open/download flows and actual desktop/mobile Chromium download/reopen. Require unchanged scoped100 coverage for newly implemented executable mechanisms and related ODS/CSV regressions. Run typecheck, production build/static checks, scoped ESLint/Prettier, dependencies/resources/docs/size/source-tree/provenance/registry/invariants/parity, doctor/routing/diff. Record bounded prerequisite checkpoints honestly without marking the whole task verified or complete. Full suites only at the approved ten-task cadence."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement Calc XLSX import export and existing file UI integration

User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.

## Scope

- In scope: User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.
- Out of scope: unrelated refactors not required for "Implement Calc XLSX import export and existing file UI integration".

## Plan

Continue the already user-approved XLSX work: (1) implement native address/range, workbook/worksheet, shared-string, style and formula owners against the pinned source with original contracts and limits, replacing touched shortcuts; (2) route actual ScDocument import/export through ExcelFilter and the existing shell/file UI while preserving browser storage, recovery and autosave decisions; (3) verify supported-model upstream-fixture roundtrips, failure/stale-result behavior, browser download/reopen and targeted quality gates; (4) record suspected native issues without changing their semantics and finish only after complete acceptance. Work locally in the direct checkout; no publication or merge. Cohesive prerequisite checkpoints may be committed with explicit remaining gaps.

## Verify Steps

Run focused Calc and shared tests for the implemented XLSX owners, including source-backed address/parser boundaries, then actual workbook import and export/reopen over committed Strict and Transitional upstream fixtures covering supported cells, types, formulas, formatting, dimensions and multiple sheets. Assert canonical ScDocument values and package XML; malformed input must preserve the active graph. Verify shell filter routing, cancellation and stale results, primary ODS state, mounted Open/download flows and actual desktop/mobile Chromium download/reopen. Require unchanged scoped100 coverage for newly implemented executable mechanisms and related ODS/CSV regressions. Run typecheck, production build/static checks, scoped ESLint/Prettier, dependencies/resources/docs/size/source-tree/provenance/registry/invariants/parity, doctor/routing/diff. Record bounded prerequisite checkpoints honestly without marking the whole task verified or complete. Full suites only at the approved ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
