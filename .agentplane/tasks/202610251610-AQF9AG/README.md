---
id: "202610251610-AQF9AG"
title: "Implement Calc CSV import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "csv"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:10:17.745Z"
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
    body: "Start: implement upstream-aligned Calc CSV conversion and connect both directions through existing file UI with scoped verification."
events:
  -
    type: "status"
    at: "2026-10-25T16:10:23.407Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-aligned Calc CSV conversion and connect both directions through existing file UI with scoped verification."
doc_version: 3
doc_updated_at: "2026-10-25T16:10:23.407Z"
doc_updated_by: "CODER"
description: "Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules."
sections:
  Summary: |-
    Implement Calc CSV import export and existing file UI integration

    Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.
  Scope: |-
    - In scope: Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.
    - Out of scope: unrelated refactors not required for "Implement Calc CSV import export and existing file UI integration".
  Plan: "Port ScAsciiOptions and ScImportExport CSV behavior from pinned vendor LibreOffice into upstream-aligned sc paths, including required dependencies. Integrate text CSV filter with ScDocShell Open/Export and existing Calc browser file dialog/workflows, preserve current primary save and autosave semantics, add focused upstream-derived CSV tests and UI tests, record suspicious upstream contracts in calc-upstream-suspected-issues.md only if encountered. Scope includes Calc sc core/filter/docshell/browser and directly required shared filter/file-dialog interfaces, tests, provenance/registry metadata, and the issue document. Verify scoped tests, typecheck, lint, resource/provenance/registry checks and browser CSV flow. Do not run full suite unless this is the tenth completed agentplane task since the previous full run."
  Verify Steps: |-
    - Run focused Vitest tests for new ScAsciiOptions/ScImportExport, ScDocShell CSV conversions, and Calc browser file workflows/dialog.
    - Run Calc browser e2e CSV import/export flow.
    - Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:calc-resources, npm run check:source-provenance, and npm run inventory:parity:calc.
    - Compare CSV defaults and conversion edge cases with pinned vendor LibreOffice source/fixtures; inspect final git diff and status.
    - Record full-suite cadence; run full test suite only if this is the tenth task after prior full run.
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

Implement Calc CSV import export and existing file UI integration

Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.

## Scope

- In scope: Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.
- Out of scope: unrelated refactors not required for "Implement Calc CSV import export and existing file UI integration".

## Plan

Port ScAsciiOptions and ScImportExport CSV behavior from pinned vendor LibreOffice into upstream-aligned sc paths, including required dependencies. Integrate text CSV filter with ScDocShell Open/Export and existing Calc browser file dialog/workflows, preserve current primary save and autosave semantics, add focused upstream-derived CSV tests and UI tests, record suspicious upstream contracts in calc-upstream-suspected-issues.md only if encountered. Scope includes Calc sc core/filter/docshell/browser and directly required shared filter/file-dialog interfaces, tests, provenance/registry metadata, and the issue document. Verify scoped tests, typecheck, lint, resource/provenance/registry checks and browser CSV flow. Do not run full suite unless this is the tenth completed agentplane task since the previous full run.

## Verify Steps

- Run focused Vitest tests for new ScAsciiOptions/ScImportExport, ScDocShell CSV conversions, and Calc browser file workflows/dialog.
- Run Calc browser e2e CSV import/export flow.
- Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:calc-resources, npm run check:source-provenance, and npm run inventory:parity:calc.
- Compare CSV defaults and conversion edge cases with pinned vendor LibreOffice source/fixtures; inspect final git diff and status.
- Record full-suite cadence; run full test suite only if this is the tenth task after prior full run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
