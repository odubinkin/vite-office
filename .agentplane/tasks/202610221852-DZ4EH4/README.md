---
id: "202610221852-DZ4EH4"
title: "Connect Writer table cell alignment and row flow commands to native UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T18:53:10.845Z"
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
    body: "Start: continue approved Writer consistency work by wiring existing native table cell and row-flow owners into actual source UI commands; no planned goal stop."
events:
  -
    type: "status"
    at: "2026-10-22T18:53:17.536Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue approved Writer consistency work by wiring existing native table cell and row-flow owners into actual source UI commands; no planned goal stop."
doc_version: 3
doc_updated_at: "2026-10-22T19:18:12.300Z"
doc_updated_by: "CODER"
description: "Continue the approved Writer consistency goal: connect existing cell vertical alignment, row split, repeated heading rows and automatic row height owners through native command state, actual upstream menu/toolbar/sidebar placements, Undo/Redo and ODT. No planned goal stop."
sections:
  Summary: |-
    Connect Writer table cell alignment and row flow commands to native UI

    Continue the approved Writer consistency goal: connect existing cell vertical alignment, row split, repeated heading rows and automatic row height owners through native command state, actual upstream menu/toolbar/sidebar placements, Undo/Redo and ODT. No planned goal stop.
  Scope: "Only vite-office-writer on writer. Native table shell/frame owners, generated slots/resources, contextual table toolbar and sidebar/menu composition, relevant core/UI/ODT/browser tests and conservative provenance/runtime metadata. The initial up-to45-file estimate is corrected to up to80 non-task files because 44 existing test files must scope their formerly unique Table Properties selectors after restoring the native toolbar placement. These are necessary test repairs within the already authorized UI consistency block; feature scope, risk and verification criteria remain unchanged. No network, branch switching, merges, recovery/save/open changes or unrelated locale work."
  Plan: "Connect existing native table formatting and row-flow owners through six original slot families; port missing heading-selection query literally; expose commands in original menu/tableobjectbar and automatic-height sidebar positions; add mixed-state/history/ODT and browser evidence; complete related checks and continue the goal without pausing."
  Verify Steps: "Run related table cell alignment, row split/headline/height owner and history tests, real-frame slot state/payload and mounted UI tests, and actual ODT roundtrips including mixed selections and cursor preservation. Verify affected browser menu/context toolbar/sidebar flows at1280/390. Run focused strict coverage for changed responsibilities, typecheck, lint/format for changed source, build/static, resources, boundaries, docs/file-size, source-tree/provenance/invariants and AgentPlane doctor/routing. Do not repeat full suites here: this is task1 after the ACR55N full checkpoint; retain full cadence once per ten AgentPlane tasks."
  Verification: "Related regression run: 171 files /1452 tests passed; all25 modified mounted-test files /156 tests passed after precise sidebar scoping. Final native slot/UI/sidebar run:4 files /35 tests passed, including complete frame-size reset, common/mixed/typed row splitting, count-only headlines, both cursor directions, ordinary marks, unavailable layout, native cell alignment, cursor/history and actual ODT roundtrips. Browser:21 affected files /67 scenarios passed; after source-default docking correction, final desktop/mobile flow tests2/2 passed with explicit bottom-docking geometry and ODT assertions. Screenshots inspected at1280/390. New toolbar owners have fresh strict100 coverage; incremental audit for all7 changed owners is100 for819 statements,627 branch arms,193 functions,742 lines. Raw focused owner-wide gate failures are retained; unchanged counters are reused only after baseline SHA256 verification and exact unchanged source-span /git-diff location correspondence; changed counters use fresh hits only. Evidence: output/playwright/writer-table-flow/{related-coverage-fixed.log,changed-tests-final.log,final-delta-coverage.log,browser-final.log,browser-docking-final.log,incremental-coverage-audit.json,audit-incremental-coverage.mjs}. Typecheck, changed-source ESLint/Prettier, build/static, resources, dependency boundaries, JSDoc, file-size, source-tree/provenance, invariants/parity and policy routing passed. Doctor has zero errors and its existing managed-hook readiness warning; no hook mutation belongs to this task. Full-suite cadence remains one per ten tasks after ACR55N; this is task1, so no full rerun. Branch remains writer; no network or merge. Goal continues after task closure."
  Rollback Plan: "Revert only this task implementation commits while retaining user work and preceding ACR55N functionality. No integration or branch operations."
  Findings: |-
    The user explicitly revoked planned goal stopping and instructed continued implementation. Existing explicit mutation authorization and the approved Writer consistency goal cover this next concrete block. No scheduled stop after verification. Native functionality already exists for cell alignment, row splitting, repeated heading updates and row frame size; preserve source command state, selection and typed payload contracts.

    - Observation: The interrupted edit batch reported a missing text marker after some intended edits had already been written.
      Impact: No checks ran in that batch; inspected diff confirms only scoped generator and frame-editing source changes.
      Resolution: Continue from the actual diff using exact current markers; approved scope and verification remain unchanged.

    - Observation: The source-visible TableDialog control now exists in both native table toolbar and sidebar; existing globally unique button selectors become ambiguous in 25 mounted test files and 19 browser files.
      Impact: Necessary regression maintenance exceeds the initial estimated file count but adds no feature scope, risk, network access or changed verification criteria. User authorization explicitly covers continued UI consistency implementation and adding/fixing tests.
      Resolution: Scope each existing properties selector to its original Writer sidebar; preserve every assertion and scenario. Retain the source-visible toolbar placement and original command label rather than changing product UI to satisfy stale selectors.

    - Observation: Raw focused owner-wide coverage is below100 because targeted runs omit unchanged unrelated callbacks; initial regression run also exposed globally ambiguous legacy properties selectors. Typecheck caught test API casing and toolbar Map typing; lint rejected one fixture non-null assertion; file-size caught a test growing to1006 lines.
      Impact: These were bounded implementation and verification failures, with no changed product scope or relaxed gates.
      Resolution: Scoped all44 legacy selector files to their original sidebar, corrected native APIs and icon map types, removed the assertion and kept the existing large test below1000 lines. Re-ran affected scenarios. Audited incremental coverage using fresh current maps and only historical counters whose entire source spans are byte-identical at git-diff-corresponding positions, after verifying baseline source SHA256 against the full checkpoint audit. All7 current owners reach100:819 statements,627 branch arms,193 functions,742 lines; no changed counter inherits prior hits. Raw profiles and reproducible audit are retained in output/playwright/writer-table-flow.

    - Observation: Final source configuration review found WriterWindowState.xcu tableobjectbar DockingArea=1; offapi ui/DockingArea.idl defines that as bottom above the status bar.
      Impact: The initial browser composition below the formatting toolbar did not preserve the native default docking location.
      Resolution: Move the contextual table toolbar below the canvas/sidebar and immediately above the status bar; add mounted sibling-order and real browser bounding-box assertions. Re-run affected UI, coverage and desktop/mobile flows.
id_source: "generated"
---
## Summary

Connect Writer table cell alignment and row flow commands to native UI

Continue the approved Writer consistency goal: connect existing cell vertical alignment, row split, repeated heading rows and automatic row height owners through native command state, actual upstream menu/toolbar/sidebar placements, Undo/Redo and ODT. No planned goal stop.

## Scope

Only vite-office-writer on writer. Native table shell/frame owners, generated slots/resources, contextual table toolbar and sidebar/menu composition, relevant core/UI/ODT/browser tests and conservative provenance/runtime metadata. The initial up-to45-file estimate is corrected to up to80 non-task files because 44 existing test files must scope their formerly unique Table Properties selectors after restoring the native toolbar placement. These are necessary test repairs within the already authorized UI consistency block; feature scope, risk and verification criteria remain unchanged. No network, branch switching, merges, recovery/save/open changes or unrelated locale work.

## Plan

Connect existing native table formatting and row-flow owners through six original slot families; port missing heading-selection query literally; expose commands in original menu/tableobjectbar and automatic-height sidebar positions; add mixed-state/history/ODT and browser evidence; complete related checks and continue the goal without pausing.

## Verify Steps

Run related table cell alignment, row split/headline/height owner and history tests, real-frame slot state/payload and mounted UI tests, and actual ODT roundtrips including mixed selections and cursor preservation. Verify affected browser menu/context toolbar/sidebar flows at1280/390. Run focused strict coverage for changed responsibilities, typecheck, lint/format for changed source, build/static, resources, boundaries, docs/file-size, source-tree/provenance/invariants and AgentPlane doctor/routing. Do not repeat full suites here: this is task1 after the ACR55N full checkpoint; retain full cadence once per ten AgentPlane tasks.

## Verification

Related regression run: 171 files /1452 tests passed; all25 modified mounted-test files /156 tests passed after precise sidebar scoping. Final native slot/UI/sidebar run:4 files /35 tests passed, including complete frame-size reset, common/mixed/typed row splitting, count-only headlines, both cursor directions, ordinary marks, unavailable layout, native cell alignment, cursor/history and actual ODT roundtrips. Browser:21 affected files /67 scenarios passed; after source-default docking correction, final desktop/mobile flow tests2/2 passed with explicit bottom-docking geometry and ODT assertions. Screenshots inspected at1280/390. New toolbar owners have fresh strict100 coverage; incremental audit for all7 changed owners is100 for819 statements,627 branch arms,193 functions,742 lines. Raw focused owner-wide gate failures are retained; unchanged counters are reused only after baseline SHA256 verification and exact unchanged source-span /git-diff location correspondence; changed counters use fresh hits only. Evidence: output/playwright/writer-table-flow/{related-coverage-fixed.log,changed-tests-final.log,final-delta-coverage.log,browser-final.log,browser-docking-final.log,incremental-coverage-audit.json,audit-incremental-coverage.mjs}. Typecheck, changed-source ESLint/Prettier, build/static, resources, dependency boundaries, JSDoc, file-size, source-tree/provenance, invariants/parity and policy routing passed. Doctor has zero errors and its existing managed-hook readiness warning; no hook mutation belongs to this task. Full-suite cadence remains one per ten tasks after ACR55N; this is task1, so no full rerun. Branch remains writer; no network or merge. Goal continues after task closure.

## Rollback Plan

Revert only this task implementation commits while retaining user work and preceding ACR55N functionality. No integration or branch operations.

## Findings

The user explicitly revoked planned goal stopping and instructed continued implementation. Existing explicit mutation authorization and the approved Writer consistency goal cover this next concrete block. No scheduled stop after verification. Native functionality already exists for cell alignment, row splitting, repeated heading updates and row frame size; preserve source command state, selection and typed payload contracts.

- Observation: The interrupted edit batch reported a missing text marker after some intended edits had already been written.
  Impact: No checks ran in that batch; inspected diff confirms only scoped generator and frame-editing source changes.
  Resolution: Continue from the actual diff using exact current markers; approved scope and verification remain unchanged.

- Observation: The source-visible TableDialog control now exists in both native table toolbar and sidebar; existing globally unique button selectors become ambiguous in 25 mounted test files and 19 browser files.
  Impact: Necessary regression maintenance exceeds the initial estimated file count but adds no feature scope, risk, network access or changed verification criteria. User authorization explicitly covers continued UI consistency implementation and adding/fixing tests.
  Resolution: Scope each existing properties selector to its original Writer sidebar; preserve every assertion and scenario. Retain the source-visible toolbar placement and original command label rather than changing product UI to satisfy stale selectors.

- Observation: Raw focused owner-wide coverage is below100 because targeted runs omit unchanged unrelated callbacks; initial regression run also exposed globally ambiguous legacy properties selectors. Typecheck caught test API casing and toolbar Map typing; lint rejected one fixture non-null assertion; file-size caught a test growing to1006 lines.
  Impact: These were bounded implementation and verification failures, with no changed product scope or relaxed gates.
  Resolution: Scoped all44 legacy selector files to their original sidebar, corrected native APIs and icon map types, removed the assertion and kept the existing large test below1000 lines. Re-ran affected scenarios. Audited incremental coverage using fresh current maps and only historical counters whose entire source spans are byte-identical at git-diff-corresponding positions, after verifying baseline source SHA256 against the full checkpoint audit. All7 current owners reach100:819 statements,627 branch arms,193 functions,742 lines; no changed counter inherits prior hits. Raw profiles and reproducible audit are retained in output/playwright/writer-table-flow.

- Observation: Final source configuration review found WriterWindowState.xcu tableobjectbar DockingArea=1; offapi ui/DockingArea.idl defines that as bottom above the status bar.
  Impact: The initial browser composition below the formatting toolbar did not preserve the native default docking location.
  Resolution: Move the contextual table toolbar below the canvas/sidebar and immediately above the status bar; add mounted sibling-order and real browser bounding-box assertions. Re-run affected UI, coverage and desktop/mobile flows.
