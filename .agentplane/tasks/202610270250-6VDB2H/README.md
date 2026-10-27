---
id: "202610270250-6VDB2H"
title: "Integrate Writer and Calc branches and synchronize all checkouts"
status: "BLOCKED"
priority: "high"
owner: "CODER"
revision: 19
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
  state: "needs_rework"
  updated_at: "2026-10-27T03:59:42.627Z"
  updated_by: "CODER"
  note: "Full checks executed; functional failures fixed and retested. Full strict Istanbul gate remains below 100 percent in 216 modules. Current-source item codec has 100-percent coverage after 326 passing tests. All 537 browser tests, 130 inventory tests with full coverage and 159 tooling tests pass. Main publication and reverse merges require coverage completion or explicit user-approved acceptance change."
  attempts: 1
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Execute approved cross-checkout integration, verification, publication and reverse merges."
  -
    author: "CODER"
    body: "Blocked: Full mandatory coverage gate fails across 216 modules. Await explicit scope reapproval for broad test completion or acceptance of the documented coverage gap before publishing main and reverse-merging branches."
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
doc_version: 3
doc_updated_at: "2026-10-27T03:59:42.915Z"
doc_updated_by: "CODER"
description: "User-approved integration: commit current Writer work, push Writer and Calc, merge both into main, resolve conflicts, run full project verification and repair regressions, push main, then merge main back and push both development branches. Preserve local generated artifacts and finish on original branch names."
sections:
  Summary: "Integrate all current Writer and Calc development into main and synchronize all three user-authorized checkouts."
  Scope: "Three checkouts: vite-office main, vite-office-writer writer, vite-office-calc calc. Include existing uncommitted Writer Markdown code/tests/registry changes; preserve generated local Calc output and unrelated pending task README. Repair integration failures and add regression tests when needed. User explicitly authorized network pushes and cross-checkout access."
  Plan: "Execute the user-approved nine-step integration and synchronization with complete npm verification, regression fixes as needed, no history rewriting, preserve local artifacts, and finish on main/writer/calc respectively."
  Verify Steps: "Run npm run verify (format, lint, tools/application typecheck, boundaries, Writer/Calc resources, tooling tests, application coverage, inventory coverage, browser E2E, static build, docs, file sizes, source tree, Writer hint IDs, provenance, invariant/parity registries). Run ap doctor and node .agentplane/policy/check-routing.mjs. Run git diff --check. Confirm main contains both original branch tips; writer/calc contain final main; local branches equal origin refs after push; inspect full git status in all three checkouts. Preserve pre-existing generated output."
  Verification: |-
    Full application run: 1544 files, 24126 tests; 1542 files and 24124 tests passed, two failures found and corrected afterward. The obsolete Markdown fatal UTF-8 expectation is replaced by native replacement decoding plus atomic empty-stream rejection; all 18 shell cases pass. The native-color decoder null-value regression is fixed; 12 related files and 143 cases pass. Full Istanbul gate FAILED: lines 98.33 percent (94005/95600), statements 97.89 percent (103371/105595), branches 96.34 percent (63358/65761), functions 99.22 percent (16735/16866). Coverage gaps affect 216 modules; see evidence/coverage-gaps.json. This is a broad test-completion scope across ICU, HTML/Markdown, SAL encodings and other owners. Thresholds unchanged and no skips approved. Inventory: 38 files, 130 tests and strict 100 percent all four coverage metrics passed. Tooling: 34 files, 159 tests passed. All 537 Chromium E2E passed; rebuilt current-source Writer/Calc smoke also passed (2 tests). Production/static builds, formatting, ESLint, TypeScript, JSDoc, module boundaries, resources, source tree, hint identities, provenance, registry gates, doctor and policy routing passed. Current-source color-codec supplemental coverage is being completed. main publication and reverse branch synchronization are intentionally pending the strict coverage gate or explicit user acceptance of the coverage gap.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-27T03:59:42.627Z — VERIFY — needs_rework

    By: CODER

    Note: Full checks executed; functional failures fixed and retested. Full strict Istanbul gate remains below 100 percent in 216 modules. Current-source item codec has 100-percent coverage after 326 passing tests. All 537 browser tests, 130 inventory tests with full coverage and 159 tooling tests pass. Main publication and reverse merges require coverage completion or explicit user-approved acceptance change.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-27T03:59:04.369Z, excerpt_hash=sha256:0e5613a7d9c890a508d19c2a5742f89e6d04518cd8a68673e4eefffbafc3b658

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
    - safe_command: agentplane commit 202610270250-6VDB2H -m 🧩 6VDB2H task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
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
id_source: "generated"
---
## Summary

Integrate all current Writer and Calc development into main and synchronize all three user-authorized checkouts.

## Scope

Three checkouts: vite-office main, vite-office-writer writer, vite-office-calc calc. Include existing uncommitted Writer Markdown code/tests/registry changes; preserve generated local Calc output and unrelated pending task README. Repair integration failures and add regression tests when needed. User explicitly authorized network pushes and cross-checkout access.

## Plan

Execute the user-approved nine-step integration and synchronization with complete npm verification, regression fixes as needed, no history rewriting, preserve local artifacts, and finish on main/writer/calc respectively.

## Verify Steps

Run npm run verify (format, lint, tools/application typecheck, boundaries, Writer/Calc resources, tooling tests, application coverage, inventory coverage, browser E2E, static build, docs, file sizes, source tree, Writer hint IDs, provenance, invariant/parity registries). Run ap doctor and node .agentplane/policy/check-routing.mjs. Run git diff --check. Confirm main contains both original branch tips; writer/calc contain final main; local branches equal origin refs after push; inspect full git status in all three checkouts. Preserve pre-existing generated output.

## Verification

Full application run: 1544 files, 24126 tests; 1542 files and 24124 tests passed, two failures found and corrected afterward. The obsolete Markdown fatal UTF-8 expectation is replaced by native replacement decoding plus atomic empty-stream rejection; all 18 shell cases pass. The native-color decoder null-value regression is fixed; 12 related files and 143 cases pass. Full Istanbul gate FAILED: lines 98.33 percent (94005/95600), statements 97.89 percent (103371/105595), branches 96.34 percent (63358/65761), functions 99.22 percent (16735/16866). Coverage gaps affect 216 modules; see evidence/coverage-gaps.json. This is a broad test-completion scope across ICU, HTML/Markdown, SAL encodings and other owners. Thresholds unchanged and no skips approved. Inventory: 38 files, 130 tests and strict 100 percent all four coverage metrics passed. Tooling: 34 files, 159 tests passed. All 537 Chromium E2E passed; rebuilt current-source Writer/Calc smoke also passed (2 tests). Production/static builds, formatting, ESLint, TypeScript, JSDoc, module boundaries, resources, source tree, hint identities, provenance, registry gates, doctor and policy routing passed. Current-source color-codec supplemental coverage is being completed. main publication and reverse branch synchronization are intentionally pending the strict coverage gate or explicit user acceptance of the coverage gap.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-27T03:59:42.627Z — VERIFY — needs_rework

By: CODER

Note: Full checks executed; functional failures fixed and retested. Full strict Istanbul gate remains below 100 percent in 216 modules. Current-source item codec has 100-percent coverage after 326 passing tests. All 537 browser tests, 130 inventory tests with full coverage and 159 tooling tests pass. Main publication and reverse merges require coverage completion or explicit user-approved acceptance change.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-27T03:59:04.369Z, excerpt_hash=sha256:0e5613a7d9c890a508d19c2a5742f89e6d04518cd8a68673e4eefffbafc3b658

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
- safe_command: agentplane commit 202610270250-6VDB2H -m 🧩 6VDB2H task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
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
