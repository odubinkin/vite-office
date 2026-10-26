---
id: "202610251610-AQF9AG"
title: "Implement Calc CSV import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
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
  state: "needs_rework"
  updated_at: "2026-10-26T06:48:42.132Z"
  updated_by: "CODER"
  note: "Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block."
  attempts: 1
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
  -
    type: "verify"
    at: "2026-10-26T06:48:42.132Z"
    author: "CODER"
    state: "needs_rework"
    note: "Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block."
doc_version: 3
doc_updated_at: "2026-10-26T06:48:42.186Z"
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
    ### 2026-10-26T06:48:42.132Z — VERIFY — needs_rework

    By: CODER

    Note: Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T06:48:33.105Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
    - old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251610-AQF9AG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    User requested stopping after the current block for a manual merge; do not continue implementation until the user resumes.

    Checkpoint AQF9AG includes CSV options, stream import/export, existing file UI wiring and their required shared dependencies. The current block replaces normal-edit numeric/string/formula import writes with source block-position writes, implements the owned EditTextObject setter and per-sheet cursor cache, and finalizes imported cell metadata, formula grouping and listeners. CSV, XML import and browser worker reconstruction call finalize. Source behavior observations CALC-298 and CALC-299 are recorded.

    Remaining before the overall CSV task can be completed: source SvNumberFormatter::IsNumberFormat and missing numeric/date scanner and format services; ScColumn::ParseString and ScDocumentImport::setAutoInput; source EditEngine construction at current plain-multiline caller bridges; remaining option-path fidelity and final requirement audit. This checkpoint does not claim full CSV or LibreOffice behavior parity.

    Command: changed-module Vitest run selected from git modified/untracked apps/office/src test files, npx vitest run --maxWorkers=2. Result: pass. Evidence: 32 files, 222 tests. Scope: changed CSV, ODS, importer, locale, formatter, text encoding and stream modules.

    Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts|document-io-responsive.spec.ts. Result: pass. Evidence: 2 tests; CSV file UI import/export and large ODS import/reopen/save/export remain responsive without page errors.

    Commands: npm run build; npm run typecheck; npm run lint; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Scope: current repository checks and current checkpoint. Inventory check validates registry invariants; its parityReady remains false and is not a product-completion claim.

    Full suite was not run for this checkpoint: the task remains open and changed-module tests follow the user requested full-run cadence. The user will perform the merge; no merge or publication is authorized in this pause.
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
### 2026-10-26T06:48:42.132Z — VERIFY — needs_rework

By: CODER

Note: Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T06:48:33.105Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
- old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251610-AQF9AG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

User requested stopping after the current block for a manual merge; do not continue implementation until the user resumes.

Checkpoint AQF9AG includes CSV options, stream import/export, existing file UI wiring and their required shared dependencies. The current block replaces normal-edit numeric/string/formula import writes with source block-position writes, implements the owned EditTextObject setter and per-sheet cursor cache, and finalizes imported cell metadata, formula grouping and listeners. CSV, XML import and browser worker reconstruction call finalize. Source behavior observations CALC-298 and CALC-299 are recorded.

Remaining before the overall CSV task can be completed: source SvNumberFormatter::IsNumberFormat and missing numeric/date scanner and format services; ScColumn::ParseString and ScDocumentImport::setAutoInput; source EditEngine construction at current plain-multiline caller bridges; remaining option-path fidelity and final requirement audit. This checkpoint does not claim full CSV or LibreOffice behavior parity.

Command: changed-module Vitest run selected from git modified/untracked apps/office/src test files, npx vitest run --maxWorkers=2. Result: pass. Evidence: 32 files, 222 tests. Scope: changed CSV, ODS, importer, locale, formatter, text encoding and stream modules.

Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts|document-io-responsive.spec.ts. Result: pass. Evidence: 2 tests; CSV file UI import/export and large ODS import/reopen/save/export remain responsive without page errors.

Commands: npm run build; npm run typecheck; npm run lint; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Scope: current repository checks and current checkpoint. Inventory check validates registry invariants; its parityReady remains false and is not a product-completion claim.

Full suite was not run for this checkpoint: the task remains open and changed-module tests follow the user requested full-run cadence. The user will perform the merge; no merge or publication is authorized in this pause.
