---
id: "202610270250-6VDB2H"
title: "Integrate Writer and Calc branches and synchronize all checkouts"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 30
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-27T02:50:51.435Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-27T05:29:58.439Z"
  updated_by: "CODER"
  note: "All1931new/changed tests and9final helper regressions pass; current full TypeScript, scoped lint/format/docs, affected owner checks and build pass. Completed537E2E,159tooling and130inventory tests retained. User explicitly accepted residual application coverage and waived full-suite repetition; thresholds unchanged. Network synchronization remains to execute before finish."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-27T05:29:58.890Z"
  updated_by: "EVALUATOR"
  note: "Integration implementation and current scenarios validated under explicit user-approved residual coverage exception."
  evaluated_sha: "519464c3f5634e056db16abf3bbbfe1da98b7793"
  blueprint_digest: "37de21fd03d8e2a33684c090afadb154a7b42ef436b2a7ffba21aaf1a8bf2e7c"
  evidence_refs:
    - ".agentplane/tasks/202610270250-6VDB2H/README.md"
    - ".agentplane/tasks/202610270250-6VDB2H/quality/20261027-052958890-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610270250-6VDB2H/quality/20261027-052958890-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610270250-6VDB2H/quality/20261027-052958890-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610270250-6VDB2H/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610270250-6VDB2H/evidence/verification-summary.json"
    - "output/playwright/6VDB2H/close-new-tests.log"
    - "output/playwright/6VDB2H/close-typecheck-final.log"
  findings:
    - "Native functionality and source structure retained; actual UnicodeString host allocation failure now maps to native bogus state."
    - "Residual coverage is accepted by direct user instruction; no100-percent claim or threshold change."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Execute approved cross-checkout integration, verification, publication and reverse merges."
  -
    author: "CODER"
    body: "Blocked: Full mandatory coverage gate fails across 216 modules. Await explicit scope reapproval for broad test completion or acceptance of the documented coverage gap before publishing main and reverse-merging branches."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-27T02:50:51.886Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute approved cross-checkout integration, verification, publication and reverse merges."
  -
    type: "verify"
    at: "2026-10-27T03:59:42.627Z"
    author: "CODER"
    state: "needs_rework"
    note: "Full checks executed; functional failures fixed and retested. Full strict Istanbul gate remains below 100 percent in 216 modules. Current-source item codec has 100-percent coverage after 326 passing tests. All 537 browser tests, 130 inventory tests with full coverage and 159 tooling tests pass. Main publication and reverse merges require coverage completion or explicit user-approved acceptance change."
  -
    type: "status"
    at: "2026-10-27T03:59:42.915Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: Full mandatory coverage gate fails across 216 modules. Await explicit scope reapproval for broad test completion or acceptance of the documented coverage gap before publishing main and reverse-merging branches."
  -
    type: "status"
    at: "2026-10-27T04:01:47.618Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-27T05:29:58.439Z"
    author: "CODER"
    state: "ok"
    note: "All1931new/changed tests and9final helper regressions pass; current full TypeScript, scoped lint/format/docs, affected owner checks and build pass. Completed537E2E,159tooling and130inventory tests retained. User explicitly accepted residual application coverage and waived full-suite repetition; thresholds unchanged. Network synchronization remains to execute before finish."
doc_version: 3
doc_updated_at: "2026-10-27T05:29:58.497Z"
doc_updated_by: "CODER"
description: "User-approved integration: commit current Writer work, push Writer and Calc, merge both into main, resolve conflicts, run full project verification and repair regressions, push main, then merge main back and push both development branches. Preserve local generated artifacts and finish on original branch names."
sections:
  Summary: "Integrate all current Writer and Calc development into main and synchronize all three user-authorized checkouts."
  Scope: "Three checkouts: vite-office main, vite-office-writer writer, vite-office-calc calc. Include existing uncommitted Writer Markdown code/tests/registry changes; preserve generated local Calc output and unrelated pending task README. Repair integration failures and add regression tests when needed. User explicitly authorized network pushes and cross-checkout access."
  Plan: "Execute the user-approved nine-step integration and synchronization with complete npm verification, regression fixes as needed, no history rewriting, preserve local artifacts, and finish on main/writer/calc respectively."
  Verify Steps: "Use the completed full npm run verify component runs and recorded repairs. Per explicit user instruction, do not repeat full application or537-test browser suites: run all newly added/changed tests, current-source affected-owner scopes, formatting/lint/typecheck and source/policy checks. User explicitly accepts residual application coverage below100%; preserve configured thresholds and record exact failure metrics rather than bypassing or claiming a pass. Inventory coverage remains100%. Confirm current production/static build and affected Writer/Calc browser smoke. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Publish main, fetch main into Writer/Calc, merge back and push both branches; confirm local=origin, final main ancestry and matching tracked trees, correct main/writer/calc checkouts and preserved pre-existing untracked artifacts."
  Verification: |-
    Earlier full checks: the initial application run executed24,126 tests and exposed two regressions; both were fixed and retested. All537 browser E2E,159 tooling tests and130 inventory tests passed; inventory coverage is100 percent.

    Current checks:68 new/changed test files and1,931 tests PASS; the final typed-helper retest adds nine passing tests in two files. Affected Writer scope:23 files,157 tests PASS; ICU i18n:26 files,326 tests PASS. Full tools/application TypeScript, scoped ESLint, formatting,JSDoc,provenance,boundaries,file-size and policy routing pass. Doctor is OK with its pre-existing hook warning. Production/static build and Writer/Calc browser smoke passed.

    Application coverage remains below the configured100-percent gate. Exact conservative current-source metrics and gaps are recorded in evidence/coverage-summary-at-closure.json and coverage-gaps-at-closure.json. The user explicitly approved finishing without100-percent coverage and instructed using new/affected tests instead of repeating full suites. Coverage thresholds and ignores are unchanged. Publication and branch synchronization follow the verification record.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-27T05:29:58.439Z — VERIFY — ok

    By: CODER

    Note: All1931new/changed tests and9final helper regressions pass; current full TypeScript, scoped lint/format/docs, affected owner checks and build pass. Completed537E2E,159tooling and130inventory tests retained. User explicitly accepted residual application coverage and waived full-suite repetition; thresholds unchanged. Network synchronization remains to execute before finish.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-27T05:29:27.292Z, excerpt_hash=sha256:2d26fcbfe34fec734c192c2f92ef3a4312f41ddc1c73705274be6f89c62c0c4d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610270250-6VDB2H/blueprint/resolved-snapshot.json
    - old_digest: 37de21fd03d8e2a33684c090afadb154a7b42ef436b2a7ffba21aaf1a8bf2e7c
    - current_digest: 37de21fd03d8e2a33684c090afadb154a7b42ef436b2a7ffba21aaf1a8bf2e7c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610270250-6VDB2H

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610270250-6VDB2H
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Preserve existing histories and local generated files. Use ordinary revert commits for published integration if required; no force pushes, resets or deletion of user work."
  Findings: |-
    Integration commits: Writer snapshot 1d696773a; Writer merge 66d54ddec; Calc merge 86118a161. Initial SSH pushes failed; per-command HTTPS pushurl succeeded without changing configuration. Writer merge had 34 conflicts; combined StylePool ownership/iteration with all four family routes and preserved DOCX/RTF font output. Calc had two additive documentation/comment conflicts. Added shared-pointer family regression. Corrected tooling identity count (79) and native sw-to-i18nlangtag dependency expectations. Added missing JSDoc to incoming source and probe callbacks. Added Node JSON import attributes, and kept DocxAttributeOutput type-only in the shared font helper to avoid loading Vite raw token assets during Playwright discovery. Updated ODT warning and inventory aggregate expectations for added fill tokens and three new capabilities. Split the four-scope inventory acceptance into independent cases to preserve the 60-second bound. CSV test now exercises actual supported ISO-2022-JP contextual conversion and explicitly rejects the native JIS X 0201 null reverse callback. Full suites are pending; thresholds unchanged. Preserved pre-existing untracked main task README and Calc native build artifacts.

    - Observation: Full application run exposed an obsolete shell expectation that malformed UTF-8 Markdown must throw.
      Impact: The incoming native reader intentionally passes raw bytes to md4c and decodes callback text with SAL replacement grouping; the shell test still expected the removed fatal host decoder.
      Resolution: Updated the shell regression to accept U+FFFD replacement, reject empty streams atomically before and after installation, and reopen headings successfully. All 18 shell tests pass; runtime source unchanged.

    - Observation: The full suite detected null snapshot values reaching the new native-color discriminator.
      Impact: decodeNativeColorItem accessed kind on null before the original pooled-item factory could reject malformed tab-stop records.
      Resolution: Added a null check at the browser decoding boundary. Existing invalid tab-stop snapshot regression and all 143 cases in 12 related files pass. Current-source item-codec coverage and smoke checks are being collected.

    - Observation: Strict full-suite coverage reveals a broad test backlog beyond the immediate integration regressions.
      Impact: The configured 100-percent gate fails in 216 modules: 1595 uncovered lines, 2224 uncovered statements, 2403 uncovered branches and 131 uncovered functions. Publishing main now would bypass the approved verification contract.
      Resolution: Preserve thresholds and full gap evidence. Complete and locally commit bounded integration repairs; request explicit scope reapproval under dod.core material-drift criteria before expanding to hundreds of module test paths or accepting a coverage waiver. Do not push main or reverse-merge branches before that decision.

    - Observation: Scope assessment clarified: the original user instruction explicitly includes adding missing tests found by full project checks.
      Impact: The broad coverage backlog is necessary verification work within the approved integration request; no waiver is authorized or needed.
      Resolution: Resume strict coverage completion under the existing approved plan. Keep all thresholds, complete source-backed tests and necessary local fixes, then publish and reverse-merge only after the gate passes. The earlier temporary block and proposed reapproval are superseded by the existing user authorization.

    - Observation: Source-backed supplemental tests now close more than one thousand missing statements and branches without lowering coverage thresholds. Portable minimized cases preserve independently compiled ICU and md4c observations; the complete BytesTrie scope and tools date/time scope reach 100 percent.
      Impact: A fresh full application assertion run is in progress. Current combined coverage is recorded separately from the original failing run. Remaining gaps include ordinary untested paths as well as proven source-invariant and host-limit guards; they are not all declared unreachable.
      Resolution: Keep native defensive checks and strict configuration intact. Document the remaining gap precisely. Publication requires either completing the strict gate or the requested explicit user exception; no exception has yet been received.

    - Observation: Explicit user approval received to use three subagents for Writer/HTML/Markdown, ICU i18n, and ICU locales/resources. Their final targeted reports pass every assertion. Supplemental test/data changes are committed locally; full application assertion retest is still running.
      Impact: Combined current-source coverage is 99.50 percent lines, 99.19 percent statements, 99.85 percent functions and 98.07 percent branches. The strict threshold remains 100 percent, so the remaining coverage exception is a distinct decision from the approved delegation.
      Resolution: Preserve native defensive code and evidence of both reachable test backlog and proven unreachable cases. Await the explicit coverage-criteria decision before main publication and reverse merges.

    - Observation: User explicitly declined the proposed residual-coverage exception and instructed continuation to 100 percent, using the maximum possible V8 string rather than a 2GB string.
      Impact: All four strict coverage thresholds remain mandatory. The partial-coverage publication exception is not authorized. Focused native source-owner checks continue while necessary runtime boundary repairs are made; the interim full assertion retest is superseded and the final full gate must run against stable completed sources.
      Resolution: Continue all approved implementation and verification locally. Test actual V8 maximum and host allocation failure, preserve native failure semantics, and remove only mathematically proven redundant conditions with source-call-graph evidence. Publish main and reverse-merge only after the strict gate passes.

    - Observation: User explicitly approved closing without reaching100-percent coverage, requested finishing only scenarios already in progress, and confirmed previously completed full checks suffice with new/affected tests before closure.
      Impact: Residual coverage is accepted for this integration. No threshold or coverage-ignore configuration is changed. Repeating the full application and browser suites is not required; all new/affected assertions and current-source type/lint checks must pass.
      Resolution: Finish only current scenarios, record exact residual coverage and earlier full-run evidence, then publish main and synchronize Writer/Calc branches. Do not expand test scope further.
id_source: "generated"
---
## Summary

Integrate all current Writer and Calc development into main and synchronize all three user-authorized checkouts.

## Scope

Three checkouts: vite-office main, vite-office-writer writer, vite-office-calc calc. Include existing uncommitted Writer Markdown code/tests/registry changes; preserve generated local Calc output and unrelated pending task README. Repair integration failures and add regression tests when needed. User explicitly authorized network pushes and cross-checkout access.

## Plan

Execute the user-approved nine-step integration and synchronization with complete npm verification, regression fixes as needed, no history rewriting, preserve local artifacts, and finish on main/writer/calc respectively.

## Verify Steps

Use the completed full npm run verify component runs and recorded repairs. Per explicit user instruction, do not repeat full application or537-test browser suites: run all newly added/changed tests, current-source affected-owner scopes, formatting/lint/typecheck and source/policy checks. User explicitly accepts residual application coverage below100%; preserve configured thresholds and record exact failure metrics rather than bypassing or claiming a pass. Inventory coverage remains100%. Confirm current production/static build and affected Writer/Calc browser smoke. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Publish main, fetch main into Writer/Calc, merge back and push both branches; confirm local=origin, final main ancestry and matching tracked trees, correct main/writer/calc checkouts and preserved pre-existing untracked artifacts.

## Verification

Earlier full checks: the initial application run executed24,126 tests and exposed two regressions; both were fixed and retested. All537 browser E2E,159 tooling tests and130 inventory tests passed; inventory coverage is100 percent.

Current checks:68 new/changed test files and1,931 tests PASS; the final typed-helper retest adds nine passing tests in two files. Affected Writer scope:23 files,157 tests PASS; ICU i18n:26 files,326 tests PASS. Full tools/application TypeScript, scoped ESLint, formatting,JSDoc,provenance,boundaries,file-size and policy routing pass. Doctor is OK with its pre-existing hook warning. Production/static build and Writer/Calc browser smoke passed.

Application coverage remains below the configured100-percent gate. Exact conservative current-source metrics and gaps are recorded in evidence/coverage-summary-at-closure.json and coverage-gaps-at-closure.json. The user explicitly approved finishing without100-percent coverage and instructed using new/affected tests instead of repeating full suites. Coverage thresholds and ignores are unchanged. Publication and branch synchronization follow the verification record.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-27T05:29:58.439Z — VERIFY — ok

By: CODER

Note: All1931new/changed tests and9final helper regressions pass; current full TypeScript, scoped lint/format/docs, affected owner checks and build pass. Completed537E2E,159tooling and130inventory tests retained. User explicitly accepted residual application coverage and waived full-suite repetition; thresholds unchanged. Network synchronization remains to execute before finish.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-27T05:29:27.292Z, excerpt_hash=sha256:2d26fcbfe34fec734c192c2f92ef3a4312f41ddc1c73705274be6f89c62c0c4d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610270250-6VDB2H/blueprint/resolved-snapshot.json
- old_digest: 37de21fd03d8e2a33684c090afadb154a7b42ef436b2a7ffba21aaf1a8bf2e7c
- current_digest: 37de21fd03d8e2a33684c090afadb154a7b42ef436b2a7ffba21aaf1a8bf2e7c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610270250-6VDB2H

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610270250-6VDB2H
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Preserve existing histories and local generated files. Use ordinary revert commits for published integration if required; no force pushes, resets or deletion of user work.

## Findings

Integration commits: Writer snapshot 1d696773a; Writer merge 66d54ddec; Calc merge 86118a161. Initial SSH pushes failed; per-command HTTPS pushurl succeeded without changing configuration. Writer merge had 34 conflicts; combined StylePool ownership/iteration with all four family routes and preserved DOCX/RTF font output. Calc had two additive documentation/comment conflicts. Added shared-pointer family regression. Corrected tooling identity count (79) and native sw-to-i18nlangtag dependency expectations. Added missing JSDoc to incoming source and probe callbacks. Added Node JSON import attributes, and kept DocxAttributeOutput type-only in the shared font helper to avoid loading Vite raw token assets during Playwright discovery. Updated ODT warning and inventory aggregate expectations for added fill tokens and three new capabilities. Split the four-scope inventory acceptance into independent cases to preserve the 60-second bound. CSV test now exercises actual supported ISO-2022-JP contextual conversion and explicitly rejects the native JIS X 0201 null reverse callback. Full suites are pending; thresholds unchanged. Preserved pre-existing untracked main task README and Calc native build artifacts.

- Observation: Full application run exposed an obsolete shell expectation that malformed UTF-8 Markdown must throw.
  Impact: The incoming native reader intentionally passes raw bytes to md4c and decodes callback text with SAL replacement grouping; the shell test still expected the removed fatal host decoder.
  Resolution: Updated the shell regression to accept U+FFFD replacement, reject empty streams atomically before and after installation, and reopen headings successfully. All 18 shell tests pass; runtime source unchanged.

- Observation: The full suite detected null snapshot values reaching the new native-color discriminator.
  Impact: decodeNativeColorItem accessed kind on null before the original pooled-item factory could reject malformed tab-stop records.
  Resolution: Added a null check at the browser decoding boundary. Existing invalid tab-stop snapshot regression and all 143 cases in 12 related files pass. Current-source item-codec coverage and smoke checks are being collected.

- Observation: Strict full-suite coverage reveals a broad test backlog beyond the immediate integration regressions.
  Impact: The configured 100-percent gate fails in 216 modules: 1595 uncovered lines, 2224 uncovered statements, 2403 uncovered branches and 131 uncovered functions. Publishing main now would bypass the approved verification contract.
  Resolution: Preserve thresholds and full gap evidence. Complete and locally commit bounded integration repairs; request explicit scope reapproval under dod.core material-drift criteria before expanding to hundreds of module test paths or accepting a coverage waiver. Do not push main or reverse-merge branches before that decision.

- Observation: Scope assessment clarified: the original user instruction explicitly includes adding missing tests found by full project checks.
  Impact: The broad coverage backlog is necessary verification work within the approved integration request; no waiver is authorized or needed.
  Resolution: Resume strict coverage completion under the existing approved plan. Keep all thresholds, complete source-backed tests and necessary local fixes, then publish and reverse-merge only after the gate passes. The earlier temporary block and proposed reapproval are superseded by the existing user authorization.

- Observation: Source-backed supplemental tests now close more than one thousand missing statements and branches without lowering coverage thresholds. Portable minimized cases preserve independently compiled ICU and md4c observations; the complete BytesTrie scope and tools date/time scope reach 100 percent.
  Impact: A fresh full application assertion run is in progress. Current combined coverage is recorded separately from the original failing run. Remaining gaps include ordinary untested paths as well as proven source-invariant and host-limit guards; they are not all declared unreachable.
  Resolution: Keep native defensive checks and strict configuration intact. Document the remaining gap precisely. Publication requires either completing the strict gate or the requested explicit user exception; no exception has yet been received.

- Observation: Explicit user approval received to use three subagents for Writer/HTML/Markdown, ICU i18n, and ICU locales/resources. Their final targeted reports pass every assertion. Supplemental test/data changes are committed locally; full application assertion retest is still running.
  Impact: Combined current-source coverage is 99.50 percent lines, 99.19 percent statements, 99.85 percent functions and 98.07 percent branches. The strict threshold remains 100 percent, so the remaining coverage exception is a distinct decision from the approved delegation.
  Resolution: Preserve native defensive code and evidence of both reachable test backlog and proven unreachable cases. Await the explicit coverage-criteria decision before main publication and reverse merges.

- Observation: User explicitly declined the proposed residual-coverage exception and instructed continuation to 100 percent, using the maximum possible V8 string rather than a 2GB string.
  Impact: All four strict coverage thresholds remain mandatory. The partial-coverage publication exception is not authorized. Focused native source-owner checks continue while necessary runtime boundary repairs are made; the interim full assertion retest is superseded and the final full gate must run against stable completed sources.
  Resolution: Continue all approved implementation and verification locally. Test actual V8 maximum and host allocation failure, preserve native failure semantics, and remove only mathematically proven redundant conditions with source-call-graph evidence. Publish main and reverse-merge only after the strict gate passes.

- Observation: User explicitly approved closing without reaching100-percent coverage, requested finishing only scenarios already in progress, and confirmed previously completed full checks suffice with new/affected tests before closure.
  Impact: Residual coverage is accepted for this integration. No threshold or coverage-ignore configuration is changed. Repeating the full application and browser suites is not required; all new/affected assertions and current-source type/lint checks must pass.
  Resolution: Finish only current scenarios, record exact residual coverage and earlier full-run evidence, then publish main and synchronize Writer/Calc branches. Do not expand test scope further.
