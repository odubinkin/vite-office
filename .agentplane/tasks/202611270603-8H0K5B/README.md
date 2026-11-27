---
id: "202611270603-8H0K5B"
title: "Preserve Calc cell notes through native storage and ODS round trips"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:03:57.346Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T06:24:29.723Z"
  updated_by: "CODER"
  note: "44 focused Calc tests and all source, inventory and static checks passed after the separate integration evidence repair."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T06:04:02.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T06:24:29.723Z"
    author: "CODER"
    state: "ok"
    note: "44 focused Calc tests and all source, inventory and static checks passed after the separate integration evidence repair."
doc_version: 3
doc_updated_at: "2026-11-27T06:24:30.064Z"
doc_updated_by: "CODER"
description: "Port the supported ScPostIt data and sparse column note ownership, cell annotation XML and Worker transfer from pinned LibreOffice. Verify native annotations on otherwise empty cells with testCellNoteExportODS and related existing checks."
sections:
  Summary: "Preserve Calc cell notes in the supported model and ODS filter. Use the pinned Calc note model and XML contexts, and exercise the native source fixture for saving notes on empty cells."
  Scope: "Calc ScPostIt/ScNoteData and column note blocks, row and cell export cursors, XML annotation context, supported EditEngine paragraph content and author/date/display metadata, and optional Worker transfer. Shared fast XML tokens may be added for the native annotation attributes. Record native provenance and any suspicious behavior reproduced. No Calc caption rendering, drawing style UI or changes to browser save/open policies."
  Plan: "Port Calc sparse per-column ScPostIt ownership, annotation XML and optional Worker transfer. Verify with the pinned testCellNoteExportODS scenario and related existing suites, then close through Graphify."
  Verify Steps: |-
    - Run the existing Calc ODS filter and Worker tests and the port of upstream testCellNoteExportODS.
    - Run Office typecheck, changed-file ESLint and Prettier, dependency and provenance checks, Calc registry invariants, routing validation, AgentPlane doctor, and git diff check.
  Verification: |-
    Pending verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T06:24:29.723Z — VERIFY — ok

    By: CODER

    Note: 44 focused Calc tests and all source, inventory and static checks passed after the separate integration evidence repair.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:04:02.515Z, excerpt_hash=sha256:9f8096a0a36c2caee6090d34a6a5593795b3f85af5b679548379ece51dde9850

    Details:

    # Calc ODS cell notes
    - Command: `npm run test:calc -- ods-cell-notes ods-sparse-export ods-rich-text-fields calc-ods-io ods-worker dociter reference-protocol document.scalar`
      - Result: pass.
      - Evidence: 44 tests in 11 files. The pinned single-note package and a newly created note on an otherwise empty cell survive version-one Worker transfer and ODS save/reopen. The existing rich text test passes after removing duplicate property ownership in the edit-run exporter.
      - Scope: Calc ODS, Worker, sparse traversal, and native cell owners.
    - Command: `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`
      - Result: pass.
      - Scope: Office TypeScript.
    - Commands: `git ls-files --modified --others --exclude-standard -- '*.ts' | xargs npx eslint --max-warnings 0`; `git ls-files --modified --others --exclude-standard -- '*.ts' '*.json' | xargs npx prettier --check`; `npm run check:dependencies`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`.
      - Result: pass.
      - Scope: task paths, provenance formatting, module boundaries, and local workflow policy.
    - Command: `npx tsx output/playwright/8H0K5B/check-calc-provenance.mts`
      - Result: pass.
      - Evidence: 503 records, including 420 mapped modules. The exact discovered Calc paths match the registry. This uses the existing provenance validator.
      - Scope: Calc runtime and upstream evidence.
    - Commands: `npm run check:source-provenance`; `npm run inventory:invariants -- --scope calc`.
      - Result: fail on existing integration evidence.
      - Evidence: Writer's old character-property test marker and the shared `rawLineStart` marker are absent from their recorded paths at the pre-task commit. The latter context moved to its own source module.
      - Scope: whole repository and Calc plus shared dependencies, respectively. Track the stale evidence in the follow-up ODF integration task.

    The native caption drawing layout and threaded-comment extensions are outside the represented Calc model. No full regression suite was run.
  Rollback Plan: "Revert task implementation commits. Existing version-one Worker records omit the new note records."
  Findings: "Native source and scope observations will be recorded with verification."
id_source: "generated"
---
## Summary

Preserve Calc cell notes in the supported model and ODS filter. Use the pinned Calc note model and XML contexts, and exercise the native source fixture for saving notes on empty cells.

## Scope

Calc ScPostIt/ScNoteData and column note blocks, row and cell export cursors, XML annotation context, supported EditEngine paragraph content and author/date/display metadata, and optional Worker transfer. Shared fast XML tokens may be added for the native annotation attributes. Record native provenance and any suspicious behavior reproduced. No Calc caption rendering, drawing style UI or changes to browser save/open policies.

## Plan

Port Calc sparse per-column ScPostIt ownership, annotation XML and optional Worker transfer. Verify with the pinned testCellNoteExportODS scenario and related existing suites, then close through Graphify.

## Verify Steps

- Run the existing Calc ODS filter and Worker tests and the port of upstream testCellNoteExportODS.
- Run Office typecheck, changed-file ESLint and Prettier, dependency and provenance checks, Calc registry invariants, routing validation, AgentPlane doctor, and git diff check.

## Verification

Pending verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T06:24:29.723Z — VERIFY — ok

By: CODER

Note: 44 focused Calc tests and all source, inventory and static checks passed after the separate integration evidence repair.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:04:02.515Z, excerpt_hash=sha256:9f8096a0a36c2caee6090d34a6a5593795b3f85af5b679548379ece51dde9850

Details:

# Calc ODS cell notes
- Command: `npm run test:calc -- ods-cell-notes ods-sparse-export ods-rich-text-fields calc-ods-io ods-worker dociter reference-protocol document.scalar`
  - Result: pass.
  - Evidence: 44 tests in 11 files. The pinned single-note package and a newly created note on an otherwise empty cell survive version-one Worker transfer and ODS save/reopen. The existing rich text test passes after removing duplicate property ownership in the edit-run exporter.
  - Scope: Calc ODS, Worker, sparse traversal, and native cell owners.
- Command: `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`
  - Result: pass.
  - Scope: Office TypeScript.
- Commands: `git ls-files --modified --others --exclude-standard -- '*.ts' | xargs npx eslint --max-warnings 0`; `git ls-files --modified --others --exclude-standard -- '*.ts' '*.json' | xargs npx prettier --check`; `npm run check:dependencies`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`.
  - Result: pass.
  - Scope: task paths, provenance formatting, module boundaries, and local workflow policy.
- Command: `npx tsx output/playwright/8H0K5B/check-calc-provenance.mts`
  - Result: pass.
  - Evidence: 503 records, including 420 mapped modules. The exact discovered Calc paths match the registry. This uses the existing provenance validator.
  - Scope: Calc runtime and upstream evidence.
- Commands: `npm run check:source-provenance`; `npm run inventory:invariants -- --scope calc`.
  - Result: fail on existing integration evidence.
  - Evidence: Writer's old character-property test marker and the shared `rawLineStart` marker are absent from their recorded paths at the pre-task commit. The latter context moved to its own source module.
  - Scope: whole repository and Calc plus shared dependencies, respectively. Track the stale evidence in the follow-up ODF integration task.

The native caption drawing layout and threaded-comment extensions are outside the represented Calc model. No full regression suite was run.

## Rollback Plan

Revert task implementation commits. Existing version-one Worker records omit the new note records.

## Findings

Native source and scope observations will be recorded with verification.

## Integration follow-up

Task 202611270615-N5GDD4 repaired the pre-existing Writer/shared provenance links. The rerun of `npm run check:source-provenance` passed for 3141 runtime modules, and `npm run inventory:invariants -- --scope calc` passed with zero semantic violations. The commands use the unchanged repository validator and registry entry points.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270603-8H0K5B/blueprint/resolved-snapshot.json
- old_digest: e3b9da84fed46711b7c726ee87e5d8682b39b53a04c54d156f3c8d3e0c92ecd9
- current_digest: e3b9da84fed46711b7c726ee87e5d8682b39b53a04c54d156f3c8d3e0c92ecd9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270603-8H0K5B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270603-8H0K5B
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->
