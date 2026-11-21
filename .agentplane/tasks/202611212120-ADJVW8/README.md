---
id: "202611212120-ADJVW8"
title: "Connect Calc clipboard Text Import dialog and separator modes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202611212010-FJ8YQ4"
tags:
  - "calc"
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run Calc clipboard, CSV import and UI resource Vitest tests. Verify explicit one-line import, ordinary and cancelled paste, Unicode fixed-width splits, preview/import agreement and one-step Undo. Run Office TypeScript, changed-path ESLint and Prettier, Calc resource and provenance audits, policy routing and AgentPlane doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T21:21:29.579Z"
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
    body: "Start: connect the native Calc clipboard Text Import slot and separator options."
events:
  -
    type: "status"
    at: "2026-11-21T22:48:12.843Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native Calc clipboard Text Import slot and separator options."
doc_version: 3
doc_updated_at: "2026-11-21T22:48:12.843Z"
doc_updated_by: "CODER"
description: "Expose the LibreOffice Use Text Import Dialog command in the external Paste Special format chooser. Connect the existing Calc CSV import kernel to the native dialog modes, fixed-width splits, and clipboard-specific settings, while preserving ordinary paste and undo semantics."
sections:
  Summary: "Route the source external Paste Special command to the Calc clipboard Text Import dialog, and expose the existing CSV kernel capabilities behind its native separator modes."
  Scope: "Use the pinned CalcCommands.xcu, cellsh.sdi and cellsh1.cxx slot contract, the Paste Special format dialog in cui, and the clipboard branch of ScImportAsciiDlg. Connect a separate Use Text Import Dialog choice for external text that opens for one line and multiple lines. Present Detected, Separated by, and Fixed width with matching field preview, column format and clipboard-specific options. Preserve ordinary paste, asynchronous selection guards, one-step Undo, and the deliberate file-open and save policy. Change only clipboard import workflow, relevant presentation and source resources, any shared scanner behavior needed for preview/import agreement, and focused tests."
  Plan: |-
    1. Expose the native Text Import slot and dispatch it from the separate command row in the external format chooser. Preserve the existing ordinary paste route and test cancellation and destination ownership.
    2. Bind the source clipboard import defaults and separator modes to the existing importer. Use the same scanner and fixed-width visual positions in the preview and final import, with source column types and undo behavior.
    3. Port relevant upstream regression fixtures and run the focused verification steps. Begin implementation once task FJ8YQ4 has closed the scheduled full checkpoint.
  Verify Steps: "Run the focused Calc Vitest configuration for clipboard, CSV import, text import, and UI resources. Check default plain external paste, explicit one-line import, cancellation, active selection protection, and one-step Undo. Port the relevant tdf117868 automatic pipe detection and tdf92503 fixed-width DMY checks to the clipboard dialog path and verify visual-width splits with Unicode. Run Office TypeScript, changed-path ESLint and Prettier, Calc resource and provenance audits, dependency checks, policy routing, and AgentPlane doctor."
  Verification: "Pending implementation and targeted validation."
  Rollback Plan: "Revert the task commits to restore the prior clipboard format chooser and text import rendering. Imported workbook changes remain under the existing Calc Undo mechanism."
  Findings: "Pilot source references: sc/source/ui/view/cellsh1.cxx (SID_PASTE_TEXTIMPORT_DIALOG and FID_INS_CELL_CONTENTS), cui/source/dialogs/pastedlg.cxx (UNO command row dispatch), sc/source/ui/dbgui/scuiasciiopt.cxx (SC_PASTETEXT dialog and selected modes), and officecfg/registry/schema/org/openoffice/Office/Calc.xcs (ClipboardTextImport defaults). The previous task owns the full checkpoint."
id_source: "generated"
---
## Summary

Route the source external Paste Special command to the Calc clipboard Text Import dialog, and expose the existing CSV kernel capabilities behind its native separator modes.

## Scope

Use the pinned CalcCommands.xcu, cellsh.sdi and cellsh1.cxx slot contract, the Paste Special format dialog in cui, and the clipboard branch of ScImportAsciiDlg. Connect a separate Use Text Import Dialog choice for external text that opens for one line and multiple lines. Present Detected, Separated by, and Fixed width with matching field preview, column format and clipboard-specific options. Preserve ordinary paste, asynchronous selection guards, one-step Undo, and the deliberate file-open and save policy. Change only clipboard import workflow, relevant presentation and source resources, any shared scanner behavior needed for preview/import agreement, and focused tests.

## Plan

1. Expose the native Text Import slot and dispatch it from the separate command row in the external format chooser. Preserve the existing ordinary paste route and test cancellation and destination ownership.
2. Bind the source clipboard import defaults and separator modes to the existing importer. Use the same scanner and fixed-width visual positions in the preview and final import, with source column types and undo behavior.
3. Port relevant upstream regression fixtures and run the focused verification steps. Begin implementation once task FJ8YQ4 has closed the scheduled full checkpoint.

## Verify Steps

Run the focused Calc Vitest configuration for clipboard, CSV import, text import, and UI resources. Check default plain external paste, explicit one-line import, cancellation, active selection protection, and one-step Undo. Port the relevant tdf117868 automatic pipe detection and tdf92503 fixed-width DMY checks to the clipboard dialog path and verify visual-width splits with Unicode. Run Office TypeScript, changed-path ESLint and Prettier, Calc resource and provenance audits, dependency checks, policy routing, and AgentPlane doctor.

## Verification

Pending implementation and targeted validation.

## Rollback Plan

Revert the task commits to restore the prior clipboard format chooser and text import rendering. Imported workbook changes remain under the existing Calc Undo mechanism.

## Findings

Pilot source references: sc/source/ui/view/cellsh1.cxx (SID_PASTE_TEXTIMPORT_DIALOG and FID_INS_CELL_CONTENTS), cui/source/dialogs/pastedlg.cxx (UNO command row dispatch), sc/source/ui/dbgui/scuiasciiopt.cxx (SC_PASTETEXT dialog and selected modes), and officecfg/registry/schema/org/openoffice/Office/Calc.xcs (ClipboardTextImport defaults). The previous task owns the full checkpoint.
