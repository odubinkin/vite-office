---
id: "202610221744-ACR55N"
title: "Connect native Writer table sidebar metrics and alignment"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T17:45:09.295Z"
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
    body: "Start: implement approved native table sidebar block and final verification checkpoint."
events:
  -
    type: "status"
    at: "2026-10-22T17:45:16.161Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native table sidebar block and final verification checkpoint."
doc_version: 3
doc_updated_at: "2026-10-22T18:31:25.025Z"
doc_updated_by: "CODER"
description: "Implement approved Table sidebar row height, current column width, alignment and lateral spacing through native typed slots and table owners; verify Undo/Redo and ODT consistency, then full suites and coverage and stop goal."
sections:
  Summary: |-
    Connect native Writer table sidebar metrics and alignment

    Implement approved Table sidebar row height, current column width, alignment and lateral spacing through native typed slots and table owners; verify Undo/Redo and ODT consistency, then full suites and coverage and stop goal.
  Scope: "Only Writer branch/worktree. Native consumed table metrics/alignment and layout column contracts, typed slots, browser panel, ODT/Undo regression coverage, conservative registry updates; up to 100 non-task files. No network or merges."
  Plan: "Port consumed native table metrics/alignment and current-column dependencies; connect source-shaped typed command state and Table panel with module units; preserve ODT/history; add native boundary and browser regressions; execute complete verification and coverage then close and stop without starting another task."
  Verify Steps: "Run targeted native table, shell, command, sidebar and ODT tests including mixed states and Undo/Redo. Run full application and inventory coverage, tooling and browser suites; repair failures, add boundary tests and verify coverage. Run build, typecheck, lint, resources, source/docs/tree/provenance checks. Record exact results and residual gaps; close this task and stop goal after final verification."
  Verification: |-
    Command: npm run test:coverage. Result: all 18259 tests passed in 1173 files; the initial coverage gate returned nonzero at 99.98% statements/branches and 99.99% lines. Full run was executed once for the requested stop checkpoint.

    Command: focused Writer native sidebar, manager and UI profiles, including three final missing-counter regressions. Result: current native slot file17 cases, manager file7 cases and mounted UI file6 cases pass across their recorded profiles. Strict current-owner Istanbul profiles pass100 for TableEditPanel and SwTableFUNC. Larger pre-existing native owners have deliberately partial standalone focused reports; their original100 thresholds were not lowered.

    Command: node output/playwright/table-sidebar-coverage-audit.mjs. Result: pass;934 current executable owners,59809/59809 statements,37256/37256 branch arms,11156/11156 functions and54406/54406 lines. Full and focused counter maps match for merged native owners. Only the changed TableEditPanel and SwTableFUNC owner maps are replaced, each by genuinely complete current-source100 coverage. No missing counters; current source SHA256 identities retained. Evidence: output/playwright/table-sidebar-coverage-audit.json and aggregate coverage-final.json.

    Command: npm run test:e2e. Result: initial456 cases,454 passed and2 stale Page Style formatted-value expectations failed. Exact numeric geometry assertions were retained while adding the actual unit suffix/precision. Corrective8-case browser run passed; final current-source table metrics/Undo/Redo/ODT cases passed at1280 and390. Desktop/mobile PNGs inspected; compact source toolbar groups fit without the extra desktop wrap. Initial failure evidence and successful runs are retained separately. No claim of a single clean monolithic full command.

    Command: npm run test:inventory:coverage; npm run test:tooling. Result:124 cases/38 files with all four coverage metrics100, and94 cases/20 files passed. Initial metadata schema error was corrected before the passing inventory run.

    Commands: build, typecheck, lint with final changed-owner checks, tracked-source Prettier audit plus failed/current-file repairs, Writer/Calc resource freshness, module boundaries, docs, file size, source tree, source provenance, inventory invariants, static build smoke, ap doctor and policy routing. Result: pass. Initial root-glob formatter scans were canceled; eligible tracked/untracked source audit checked2939 files, and all failed/subsequently changed source files passed final formatting checks. No policy/config/threshold weakening.

    Evidence directory: output/playwright/table-sidebar-*.log and named coverage/browser evidence directories. All implementation edits are in vite-office-writer on writer; no network, branch switching, merges or publication.
  Rollback Plan: "Revert only the task implementation commits, preserving unrelated user changes; no branch integration."
  Findings: |-
    User explicitly approved proposed Table block and mutations. Latest stop instruction retained: after this task run complete verification, fix tests and coverage, close task and stop goal.

    - Observation: Initial fixture checks exposed an incorrect test metadata getter and unsupported asymmetric DOM matcher; production native slot tests passed after fixture correction. Registry update helper encountered structured provenance evidence rather than a list.
      Impact: No scope change; preserve failed logs and repair fixtures and metadata shape before full checks.
      Resolution: Use actual GetDocumentState and exact formatted value; retain canonical provenance evidence structure.

    - Observation: The full Chromium run completed with 454 passing and two stale Page Style numeric-text expectations; native metric fields now include their physical unit suffix. All eight affected/current-slice browser cases subsequently passed on the built application.
      Impact: The full initial command returned nonzero; it must not be reported as a single clean full run.
      Resolution: Update exact Page Style formatted values, preserve initial failure artifacts and full browser evidence, and use the successful eight-case repair run plus final table layout screenshots. Full application coverage remains pending.

    - Observation: Root Prettier glob traversal spent excessive time scanning generated local evidence. The bounded tracked/untracked source audit checked 2939 eligible files and found one formatting-only test fixture discrepancy.
      Impact: Canceled only the two owned root-glob formatter processes; no formatting policy or threshold changed.
      Resolution: Preserve the full source audit, format and recheck the single failed fixture, and check subsequent changed panel/test files directly. Generated output remains ignored and no unrelated files are reformatted.

    - Observation: Final source audit corrected SwTableFUNC construction-time format admission and added an actual cursor-entry regression. WRITER048 and WRITER049 document preserved native alignment-width/type and single-column coordinate asymmetries.
      Impact: Consumed horizontal flat table behavior is verified; full RTL/vertical/complex-table layout and remaining native Table toolbar groups remain unported or unverified, with no parity promotion.
      Resolution: Retain conservative runtime/provenance statuses, original save/open/recovery deviations, complete actual typed-slot/history/ODT wiring and current-source coverage evidence. Close only this task, then pause the overall goal as the user requested.
id_source: "generated"
---
## Summary

Connect native Writer table sidebar metrics and alignment

Implement approved Table sidebar row height, current column width, alignment and lateral spacing through native typed slots and table owners; verify Undo/Redo and ODT consistency, then full suites and coverage and stop goal.

## Scope

Only Writer branch/worktree. Native consumed table metrics/alignment and layout column contracts, typed slots, browser panel, ODT/Undo regression coverage, conservative registry updates; up to 100 non-task files. No network or merges.

## Plan

Port consumed native table metrics/alignment and current-column dependencies; connect source-shaped typed command state and Table panel with module units; preserve ODT/history; add native boundary and browser regressions; execute complete verification and coverage then close and stop without starting another task.

## Verify Steps

Run targeted native table, shell, command, sidebar and ODT tests including mixed states and Undo/Redo. Run full application and inventory coverage, tooling and browser suites; repair failures, add boundary tests and verify coverage. Run build, typecheck, lint, resources, source/docs/tree/provenance checks. Record exact results and residual gaps; close this task and stop goal after final verification.

## Verification

Command: npm run test:coverage. Result: all 18259 tests passed in 1173 files; the initial coverage gate returned nonzero at 99.98% statements/branches and 99.99% lines. Full run was executed once for the requested stop checkpoint.

Command: focused Writer native sidebar, manager and UI profiles, including three final missing-counter regressions. Result: current native slot file17 cases, manager file7 cases and mounted UI file6 cases pass across their recorded profiles. Strict current-owner Istanbul profiles pass100 for TableEditPanel and SwTableFUNC. Larger pre-existing native owners have deliberately partial standalone focused reports; their original100 thresholds were not lowered.

Command: node output/playwright/table-sidebar-coverage-audit.mjs. Result: pass;934 current executable owners,59809/59809 statements,37256/37256 branch arms,11156/11156 functions and54406/54406 lines. Full and focused counter maps match for merged native owners. Only the changed TableEditPanel and SwTableFUNC owner maps are replaced, each by genuinely complete current-source100 coverage. No missing counters; current source SHA256 identities retained. Evidence: output/playwright/table-sidebar-coverage-audit.json and aggregate coverage-final.json.

Command: npm run test:e2e. Result: initial456 cases,454 passed and2 stale Page Style formatted-value expectations failed. Exact numeric geometry assertions were retained while adding the actual unit suffix/precision. Corrective8-case browser run passed; final current-source table metrics/Undo/Redo/ODT cases passed at1280 and390. Desktop/mobile PNGs inspected; compact source toolbar groups fit without the extra desktop wrap. Initial failure evidence and successful runs are retained separately. No claim of a single clean monolithic full command.

Command: npm run test:inventory:coverage; npm run test:tooling. Result:124 cases/38 files with all four coverage metrics100, and94 cases/20 files passed. Initial metadata schema error was corrected before the passing inventory run.

Commands: build, typecheck, lint with final changed-owner checks, tracked-source Prettier audit plus failed/current-file repairs, Writer/Calc resource freshness, module boundaries, docs, file size, source tree, source provenance, inventory invariants, static build smoke, ap doctor and policy routing. Result: pass. Initial root-glob formatter scans were canceled; eligible tracked/untracked source audit checked2939 files, and all failed/subsequently changed source files passed final formatting checks. No policy/config/threshold weakening.

Evidence directory: output/playwright/table-sidebar-*.log and named coverage/browser evidence directories. All implementation edits are in vite-office-writer on writer; no network, branch switching, merges or publication.

## Rollback Plan

Revert only the task implementation commits, preserving unrelated user changes; no branch integration.

## Findings

User explicitly approved proposed Table block and mutations. Latest stop instruction retained: after this task run complete verification, fix tests and coverage, close task and stop goal.

- Observation: Initial fixture checks exposed an incorrect test metadata getter and unsupported asymmetric DOM matcher; production native slot tests passed after fixture correction. Registry update helper encountered structured provenance evidence rather than a list.
  Impact: No scope change; preserve failed logs and repair fixtures and metadata shape before full checks.
  Resolution: Use actual GetDocumentState and exact formatted value; retain canonical provenance evidence structure.

- Observation: The full Chromium run completed with 454 passing and two stale Page Style numeric-text expectations; native metric fields now include their physical unit suffix. All eight affected/current-slice browser cases subsequently passed on the built application.
  Impact: The full initial command returned nonzero; it must not be reported as a single clean full run.
  Resolution: Update exact Page Style formatted values, preserve initial failure artifacts and full browser evidence, and use the successful eight-case repair run plus final table layout screenshots. Full application coverage remains pending.

- Observation: Root Prettier glob traversal spent excessive time scanning generated local evidence. The bounded tracked/untracked source audit checked 2939 eligible files and found one formatting-only test fixture discrepancy.
  Impact: Canceled only the two owned root-glob formatter processes; no formatting policy or threshold changed.
  Resolution: Preserve the full source audit, format and recheck the single failed fixture, and check subsequent changed panel/test files directly. Generated output remains ignored and no unrelated files are reformatted.

- Observation: Final source audit corrected SwTableFUNC construction-time format admission and added an actual cursor-entry regression. WRITER048 and WRITER049 document preserved native alignment-width/type and single-column coordinate asymmetries.
  Impact: Consumed horizontal flat table behavior is verified; full RTL/vertical/complex-table layout and remaining native Table toolbar groups remain unported or unverified, with no parity promotion.
  Resolution: Retain conservative runtime/provenance statuses, original save/open/recovery deviations, complete actual typed-slot/history/ODT wiring and current-source coverage evidence. Close only this task, then pause the overall goal as the user requested.
