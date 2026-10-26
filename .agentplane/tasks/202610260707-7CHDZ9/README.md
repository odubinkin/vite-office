---
id: "202610260707-7CHDZ9"
title: "Integrate Writer and Calc branches and synchronize main"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-26T07:08:44.558Z"
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
    body: "Start: Execute the explicitly user-approved three-repository integration, full verification and branch synchronization, including the requested .DS_Store ignore rule."
events:
  -
    type: "status"
    at: "2026-10-26T07:08:45.003Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute the explicitly user-approved three-repository integration, full verification and branch synchronization, including the requested .DS_Store ignore rule."
doc_version: 3
doc_updated_at: "2026-10-26T10:15:36.630Z"
doc_updated_by: "CODER"
description: "Execute the user-approved push, merge, full verification, remediation, and reverse synchronization across vite-office, vite-office-writer, and vite-office-calc without rewriting history or losing existing work."
sections:
  Summary: "Integrate and verify all current Writer, Calc, and main work, then synchronize all three checkouts and remote branches."
  Scope: "User-authorized commits, fetches, pushes, conflict resolution, test repairs and missing regression tests across the three project repositories. Add a repository-wide .DS_Store ignore rule as explicitly requested. Preserve existing unrelated task artifacts."
  Plan: "Execute the user-approved nine-step synchronization workflow, ignore .DS_Store, resolve merge conflicts, run npm run verify and agentplane checks, repair regressions with meaningful tests, push all three branches and leave writer/calc on their synchronized named branches. No history rewriting."
  Verify Steps: |-
    1. Run npm run verify in the integrated main checkout; all configured formatting, lint, types, resources, unit coverage, tooling, browser, static build, documentation, source and parity checks must pass.
    2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    3. Confirm main is an ancestor of writer and calc after reverse merges; each local named branch equals its origin tracking branch.
    4. Run git status --short --untracked-files=all in all three repositories; preserve the pre-existing Calc task README and ignore .DS_Store at all depths.
  Verification: "Pending execution."
  Rollback Plan: "Preserve original commit hashes in task findings; use ordinary revert commits if rollback is needed. Do not reset, force-push, or delete existing work."
  Findings: |-
    Initial main d5422fe9e; writer 3b9f37d04; calc bf3442be7. Existing untracked main artifact: .agentplane/tasks/202610251549-J0Z0KF/README.md. Calc contains untracked .DS_Store and output/.DS_Store. User explicitly authorized the complete synchronization workflow and ignoring .DS_Store.

    - Observation: SSH pushes from writer and calc failed with Permission denied (publickey); main HTTPS fetch succeeded.
      Impact: SSH publication is unavailable in the current environment.
      Resolution: Use the same GitHub repository through its existing main HTTPS URL as a per-command transport override; do not change remotes or credentials.

    - Observation: Full npm run verify stopped at format:check: 30 incoming Calc files need formatting. Initial focused shared suite passed 15 tests. User requested upstream-exact reconciliation of dummy conversion APIs.
      Impact: Formatting prevents later gates from running; a convenience overload had no upstream counterpart.
      Resolution: Format the incoming files; restore both original buffer/size/flags/counter fallback signatures from pinned sal/textenc/textcvt.cxx, adapt Calc callers and add six native boundary regression tests. Focused fallback suite passes 11 tests.

    - Observation: Pinned upstream sal/textenc/textcvt.cxx lines 32-105 has two buffer-based functions and no string-returning overload. User explicitly requested source-exact reconciliation.
      Impact: Keeping a convenience overload would invent a non-upstream contract and lose reverse error/capacity behavior.
      Resolution: Retained exact native argument contracts in both directions, adapted Calc at OString/OUString boundary, and added six regression tests. Native source comparisons and all 11 focused fallback/caller tests pass. Historical task evidence remains unchanged; duplicate incoming/main issue identifiers are disambiguated in current ledgers and current references.

    - Observation: User explicitly approved consolidating all file-size and JSDoc fixes in main before reverse synchronization. Initial full gates found 7 files at or above 1000 lines and missing documentation in 96 files.
      Impact: Incoming development branches cannot independently satisfy repository-wide verification until integration repairs are shared.
      Resolution: Decompose the scanner, RTF parser/tests, Calc facade declarations and text-node vocabulary; keep one native class instance and its state, use the existing out-of-class fragment pattern, register source provenance and preserve conservative unverified parity status. Add missing declaration documentation; retain all strict gates.

    - Observation: The initial application coverage run was superseded by the source decomposition and stopped with SIGINT (exit 130), after revealing one obsolete Calc formatter assertion and two exhaustive Unicode replay timeout failures.
      Impact: The old run discovered tests before the new split files existed and cannot certify the final source tree.
      Resolution: Replace the obsolete unsupported-format assertion with the source-supported numeric output check; preserve all 65536-unit and all-codepoint assertions with a bounded 300-second budget for exhaustive native replays under Istanbul. All 163 split RTF tests, all 10 Calc resource tests, strict JSDoc, file size, type and provenance checks pass. A fresh complete application coverage run is executing on the final tree.

    - Observation: Resumed sequential verify passed format, lint, full typecheck, dependencies and Writer/Calc resources. Tooling identified two stale reverse-dependency expectations: unotools to i18nutil and xmloff to comphelper.
      Impact: Both dependencies already exist in the merged implementations and are evidenced by upstream transliterationwrapper.cxx and NamedBoolPropertyHdl.cxx includes.
      Resolution: Update only the obsolete test expectations, retaining reverse and neighboring-handler prohibitions. Bound tooling to two workers to avoid concurrent repeated whole-tree scans. Preserve coverage reports on failures without changing any 100-percent threshold. Correct the exhaustive-case timeout argument and use the actual first-line WhichId in style-reset assertions.

    - Observation: The complete application run finished with 1413/1415 files passing and 20233/20239 cases passing. All six failures were obsolete Writer highlight/run fixtures. Strict coverage reported lines 98.84 percent and branches 97.03 percent across 79 incomplete modules.
      Impact: Main cannot be published or synchronized back until all required checks and the existing 100-percent coverage gates pass.
      Resolution: Repaired native highlight fixture construction and explicit underline defaults; the two affected files passed 20 focused cases. Added passing source-contract checks: 46 RTF serialized controls, 7 multibyte conversion cases, 11 ABI/calendar/string boundary cases, 4 scanner classification/state cases, 2 pattern-order cases and 5 CSV export cases. Corrected relocated declaration ownership in the runtime inventory. Retained the full original coverage baseline in the ignored task temporary directory. Additional concurrent diagnostic coverage runs were stopped after resource-related inventory timeouts; rerun these sequentially after the full browser suite. No thresholds, test cases or native parity claims were weakened.

    - Observation: The full browser run completed with 536/537 passing; the only failure was the Calc 1280px column-width scenario hitting its 30-second whole-test budget. The unchanged scenario passed alone in 15.9 seconds. Inventory tooling coverage passed all 124 cases and all four 100-percent gates.
      Impact: No application behavior mismatch was identified by the browser failure; whole-application coverage remains the outstanding integration gate.
      Resolution: Added actual serialized RTF write/read cases, native scanner classification/state/date-order cases, sparse and rich-text CSV exports, pool worker transfer cases and SAL error/ABI tests. The focused regression set passed 135 cases across 17 files before the latest extensions; the extended RTF set passed 47 cases. Four encoding production modules now pass all four 100-percent gates with 39 cases: ISCII, ISO-2022-JP, ISO-2022-KR and DBCS/EUC-JP. Removed only unreachable ISCII control paths and replaced impossible fallback reads against pinned ISO tables with native indexed access, protected by complete admitted-row table invariants. No threshold reduction or ignore pragma was added. Full-project publication remains pending the remaining uncovered modules.
id_source: "generated"
---
## Summary

Integrate and verify all current Writer, Calc, and main work, then synchronize all three checkouts and remote branches.

## Scope

User-authorized commits, fetches, pushes, conflict resolution, test repairs and missing regression tests across the three project repositories. Add a repository-wide .DS_Store ignore rule as explicitly requested. Preserve existing unrelated task artifacts.

## Plan

Execute the user-approved nine-step synchronization workflow, ignore .DS_Store, resolve merge conflicts, run npm run verify and agentplane checks, repair regressions with meaningful tests, push all three branches and leave writer/calc on their synchronized named branches. No history rewriting.

## Verify Steps

1. Run npm run verify in the integrated main checkout; all configured formatting, lint, types, resources, unit coverage, tooling, browser, static build, documentation, source and parity checks must pass.
2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
3. Confirm main is an ancestor of writer and calc after reverse merges; each local named branch equals its origin tracking branch.
4. Run git status --short --untracked-files=all in all three repositories; preserve the pre-existing Calc task README and ignore .DS_Store at all depths.

## Verification

Pending execution.

## Rollback Plan

Preserve original commit hashes in task findings; use ordinary revert commits if rollback is needed. Do not reset, force-push, or delete existing work.

## Findings

Initial main d5422fe9e; writer 3b9f37d04; calc bf3442be7. Existing untracked main artifact: .agentplane/tasks/202610251549-J0Z0KF/README.md. Calc contains untracked .DS_Store and output/.DS_Store. User explicitly authorized the complete synchronization workflow and ignoring .DS_Store.

- Observation: SSH pushes from writer and calc failed with Permission denied (publickey); main HTTPS fetch succeeded.
  Impact: SSH publication is unavailable in the current environment.
  Resolution: Use the same GitHub repository through its existing main HTTPS URL as a per-command transport override; do not change remotes or credentials.

- Observation: Full npm run verify stopped at format:check: 30 incoming Calc files need formatting. Initial focused shared suite passed 15 tests. User requested upstream-exact reconciliation of dummy conversion APIs.
  Impact: Formatting prevents later gates from running; a convenience overload had no upstream counterpart.
  Resolution: Format the incoming files; restore both original buffer/size/flags/counter fallback signatures from pinned sal/textenc/textcvt.cxx, adapt Calc callers and add six native boundary regression tests. Focused fallback suite passes 11 tests.

- Observation: Pinned upstream sal/textenc/textcvt.cxx lines 32-105 has two buffer-based functions and no string-returning overload. User explicitly requested source-exact reconciliation.
  Impact: Keeping a convenience overload would invent a non-upstream contract and lose reverse error/capacity behavior.
  Resolution: Retained exact native argument contracts in both directions, adapted Calc at OString/OUString boundary, and added six regression tests. Native source comparisons and all 11 focused fallback/caller tests pass. Historical task evidence remains unchanged; duplicate incoming/main issue identifiers are disambiguated in current ledgers and current references.

- Observation: User explicitly approved consolidating all file-size and JSDoc fixes in main before reverse synchronization. Initial full gates found 7 files at or above 1000 lines and missing documentation in 96 files.
  Impact: Incoming development branches cannot independently satisfy repository-wide verification until integration repairs are shared.
  Resolution: Decompose the scanner, RTF parser/tests, Calc facade declarations and text-node vocabulary; keep one native class instance and its state, use the existing out-of-class fragment pattern, register source provenance and preserve conservative unverified parity status. Add missing declaration documentation; retain all strict gates.

- Observation: The initial application coverage run was superseded by the source decomposition and stopped with SIGINT (exit 130), after revealing one obsolete Calc formatter assertion and two exhaustive Unicode replay timeout failures.
  Impact: The old run discovered tests before the new split files existed and cannot certify the final source tree.
  Resolution: Replace the obsolete unsupported-format assertion with the source-supported numeric output check; preserve all 65536-unit and all-codepoint assertions with a bounded 300-second budget for exhaustive native replays under Istanbul. All 163 split RTF tests, all 10 Calc resource tests, strict JSDoc, file size, type and provenance checks pass. A fresh complete application coverage run is executing on the final tree.

- Observation: Resumed sequential verify passed format, lint, full typecheck, dependencies and Writer/Calc resources. Tooling identified two stale reverse-dependency expectations: unotools to i18nutil and xmloff to comphelper.
  Impact: Both dependencies already exist in the merged implementations and are evidenced by upstream transliterationwrapper.cxx and NamedBoolPropertyHdl.cxx includes.
  Resolution: Update only the obsolete test expectations, retaining reverse and neighboring-handler prohibitions. Bound tooling to two workers to avoid concurrent repeated whole-tree scans. Preserve coverage reports on failures without changing any 100-percent threshold. Correct the exhaustive-case timeout argument and use the actual first-line WhichId in style-reset assertions.

- Observation: The complete application run finished with 1413/1415 files passing and 20233/20239 cases passing. All six failures were obsolete Writer highlight/run fixtures. Strict coverage reported lines 98.84 percent and branches 97.03 percent across 79 incomplete modules.
  Impact: Main cannot be published or synchronized back until all required checks and the existing 100-percent coverage gates pass.
  Resolution: Repaired native highlight fixture construction and explicit underline defaults; the two affected files passed 20 focused cases. Added passing source-contract checks: 46 RTF serialized controls, 7 multibyte conversion cases, 11 ABI/calendar/string boundary cases, 4 scanner classification/state cases, 2 pattern-order cases and 5 CSV export cases. Corrected relocated declaration ownership in the runtime inventory. Retained the full original coverage baseline in the ignored task temporary directory. Additional concurrent diagnostic coverage runs were stopped after resource-related inventory timeouts; rerun these sequentially after the full browser suite. No thresholds, test cases or native parity claims were weakened.

- Observation: The full browser run completed with 536/537 passing; the only failure was the Calc 1280px column-width scenario hitting its 30-second whole-test budget. The unchanged scenario passed alone in 15.9 seconds. Inventory tooling coverage passed all 124 cases and all four 100-percent gates.
  Impact: No application behavior mismatch was identified by the browser failure; whole-application coverage remains the outstanding integration gate.
  Resolution: Added actual serialized RTF write/read cases, native scanner classification/state/date-order cases, sparse and rich-text CSV exports, pool worker transfer cases and SAL error/ABI tests. The focused regression set passed 135 cases across 17 files before the latest extensions; the extended RTF set passed 47 cases. Four encoding production modules now pass all four 100-percent gates with 39 cases: ISCII, ISO-2022-JP, ISO-2022-KR and DBCS/EUC-JP. Removed only unreachable ISCII control paths and replaced impossible fallback reads against pinned ISO tables with native indexed access, protected by complete admitted-row table invariants. No threshold reduction or ignore pragma was added. Full-project publication remains pending the remaining uncovered modules.
