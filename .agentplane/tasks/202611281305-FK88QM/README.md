---
id: "202611281305-FK88QM"
title: "Integrate November 28 Writer and Calc branch updates"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T13:20:35.165Z"
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
    body: "Start: integrate and verify the current Writer and Calc heads, then synchronize the published branches."
events:
  -
    type: "status"
    at: "2026-11-28T13:06:14.804Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: integrate and verify the current Writer and Calc heads, then synchronize the published branches."
doc_version: 3
doc_updated_at: "2026-11-28T15:37:33.871Z"
doc_updated_by: "CODER"
description: "Publish current feature heads, merge both into main, resolve conflicts with targeted checks, repair failures found by full verification, document suspected upstream issues and merge verified main back into both published feature branches."
sections:
  Summary: "Integrate and publish the current Writer and Calc branches in main and synchronize both development branches back to the verified main."
  Scope: "Use the three user-named checkouts. Publish their existing feature commits, resolve any merge conflicts, repair concrete verification failures and record supported upstream suspicions in the respective issue journals. Preserve unrelated Calc artifacts."
  Plan: "User requires a successful npm run verify before publication. Diagnose and fix functional, tooling, documentation, size and coverage failures across integrated main while preserving the established checks and coverage thresholds. Verify focused and full suites, then publish main and merge it back into writer and calc."
  Verify Steps: |-
    1. Run focused unit, browser or registry checks selected by resolved source and metadata conflicts.
    2. Run npm run verify on integrated main. If an early gate fails, also exercise subsequent test suites to expose independent failures. Keep existing coverage requirements.
    3. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    4. Check git diff --check, tracked working-tree status, branch and remote tip equality, and ancestry of the published main in writer and calc.
  Verification: "Pending execution."
  Rollback Plan: "Preserve original branch tips and untracked artifacts. Follow normal fast-forward publication and use explicit revert commits if published integration needs reversing."
  Findings: |-
    Pending execution.

    - Observation: Published Writer f219f0ad2 and Calc d286bb44b over HTTPS, then merged both heads locally. Focused integrated tests passed twice; post-decomposition validation passed 91 cases. A complete initial inventory run passed 130 tests and found one uncovered metadata classifier branch. The new real ODT settings case covers that branch and brings the diagnostic file to 100 percent in all four metrics.
      Impact: Main publication and reverse synchronization remain gated by a successful full npm run verify. The base main already failed JSDoc and file size gates. Initial wide application and browser runs have failures under investigation.
      Resolution: User explicitly requires every npm run verify gate to pass before publication. Preserve official thresholds and existing test discovery. Continue functional retries, document validation, file decomposition and coverage work on local main.

    - Observation: The focused current integration run passed all 24 Writer, Calc and shared ODF tests, typechecking passed, and registry validation passed after relocating provenance markers. Eight slow XLSX application cases and eight Writer list browser cases passed their isolated retries.
      Impact: The standard full gate is still required before publication. The observed static backlog remains broader than the merge conflicts.
      Resolution: Retain verified conflict repairs and behavior-preserving refactors on local main. Continue whole-repository JSDoc, source file limits and remaining full suites without changing the verification contract.

    - Observation: The complete tracked source file-size gate passed, along with the current typecheck, dependency check and registry validation. The selected splits passed 33 focused tests. Restored the print-range transfer diagnostic and coalesced Calc grouped input into one document generation after reproduced integration failures. The targeted print, input and conditional-format retries passed.
      Impact: Full application and browser campaigns are still in progress, and the source-wide JSDoc gate still reports undocumented callbacks. The source and test size fixes do not alter gate limits.
      Resolution: Continue documenting callback contracts and rerun the current verification gates. Main publication remains conditional on the full verify command.

    - Observation: Writer treated the counted outline list rebuilt on ODT import as an ordinary list. It also exposed a native mixed-range success result without a mutation.
      Impact: Tab could leave the imported heading at the same level and its undo history did not use the outline action. The first full browser run recorded 642 passing and 12 failing scenarios on the pre-fix snapshot.
      Resolution: Dispatch counted headings to the native outline-level movement and typed undo action, preserve the mixed core result, and record WRITER-792. Current focused outline checks passed in Vitest and Chromium. The strict full verification remains pending.

    - Observation: The complete inventory suite reached 131/131 tests and 100% across four coverage metrics. The strict check then reached application Istanbul coverage, which exposed multiple Calc XLSX scenarios exceeding the 30-second test budget.
      Impact: The workbook cases exercised real native resources and serialized multiple formats; isolated retries reproduced the timeout without changing the assertions.
      Resolution: Set explicit deadlines for the affected round trips under the same 120-second budget as existing native Writer fixtures. Focused retries passed all eleven checked scenarios. Preserve the full application coverage thresholds and retain the strict verify gate before publishing main.
id_source: "generated"
---
## Summary

Integrate and publish the current Writer and Calc branches in main and synchronize both development branches back to the verified main.

## Scope

Use the three user-named checkouts. Publish their existing feature commits, resolve any merge conflicts, repair concrete verification failures and record supported upstream suspicions in the respective issue journals. Preserve unrelated Calc artifacts.

## Plan

User requires a successful npm run verify before publication. Diagnose and fix functional, tooling, documentation, size and coverage failures across integrated main while preserving the established checks and coverage thresholds. Verify focused and full suites, then publish main and merge it back into writer and calc.

## Verify Steps

1. Run focused unit, browser or registry checks selected by resolved source and metadata conflicts.
2. Run npm run verify on integrated main. If an early gate fails, also exercise subsequent test suites to expose independent failures. Keep existing coverage requirements.
3. Run ap doctor and node .agentplane/policy/check-routing.mjs.
4. Check git diff --check, tracked working-tree status, branch and remote tip equality, and ancestry of the published main in writer and calc.

## Verification

Pending execution.

## Rollback Plan

Preserve original branch tips and untracked artifacts. Follow normal fast-forward publication and use explicit revert commits if published integration needs reversing.

## Findings

Pending execution.

- Observation: Published Writer f219f0ad2 and Calc d286bb44b over HTTPS, then merged both heads locally. Focused integrated tests passed twice; post-decomposition validation passed 91 cases. A complete initial inventory run passed 130 tests and found one uncovered metadata classifier branch. The new real ODT settings case covers that branch and brings the diagnostic file to 100 percent in all four metrics.
  Impact: Main publication and reverse synchronization remain gated by a successful full npm run verify. The base main already failed JSDoc and file size gates. Initial wide application and browser runs have failures under investigation.
  Resolution: User explicitly requires every npm run verify gate to pass before publication. Preserve official thresholds and existing test discovery. Continue functional retries, document validation, file decomposition and coverage work on local main.

- Observation: The focused current integration run passed all 24 Writer, Calc and shared ODF tests, typechecking passed, and registry validation passed after relocating provenance markers. Eight slow XLSX application cases and eight Writer list browser cases passed their isolated retries.
  Impact: The standard full gate is still required before publication. The observed static backlog remains broader than the merge conflicts.
  Resolution: Retain verified conflict repairs and behavior-preserving refactors on local main. Continue whole-repository JSDoc, source file limits and remaining full suites without changing the verification contract.

- Observation: The complete tracked source file-size gate passed, along with the current typecheck, dependency check and registry validation. The selected splits passed 33 focused tests. Restored the print-range transfer diagnostic and coalesced Calc grouped input into one document generation after reproduced integration failures. The targeted print, input and conditional-format retries passed.
  Impact: Full application and browser campaigns are still in progress, and the source-wide JSDoc gate still reports undocumented callbacks. The source and test size fixes do not alter gate limits.
  Resolution: Continue documenting callback contracts and rerun the current verification gates. Main publication remains conditional on the full verify command.

- Observation: Writer treated the counted outline list rebuilt on ODT import as an ordinary list. It also exposed a native mixed-range success result without a mutation.
  Impact: Tab could leave the imported heading at the same level and its undo history did not use the outline action. The first full browser run recorded 642 passing and 12 failing scenarios on the pre-fix snapshot.
  Resolution: Dispatch counted headings to the native outline-level movement and typed undo action, preserve the mixed core result, and record WRITER-792. Current focused outline checks passed in Vitest and Chromium. The strict full verification remains pending.

- Observation: The complete inventory suite reached 131/131 tests and 100% across four coverage metrics. The strict check then reached application Istanbul coverage, which exposed multiple Calc XLSX scenarios exceeding the 30-second test budget.
  Impact: The workbook cases exercised real native resources and serialized multiple formats; isolated retries reproduced the timeout without changing the assertions.
  Resolution: Set explicit deadlines for the affected round trips under the same 120-second budget as existing native Writer fixtures. Focused retries passed all eleven checked scenarios. Preserve the full application coverage thresholds and retain the strict verify gate before publishing main.
