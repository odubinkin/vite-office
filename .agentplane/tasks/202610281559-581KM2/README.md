---
id: "202610281559-581KM2"
title: "Integrate Writer and Calc and synchronize development branches"
status: "BLOCKED"
priority: "high"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on:
  - "202610281658-B8TCAE"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-28T15:59:22.392Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-10-28T16:56:50.040Z"
  updated_by: "CODER"
  note: "All actual test failures repaired;147 current-code focused tests,537 full browser and5 current-build browser scenarios pass;all non-application-coverage gates pass. Strict application100 coverage fails in255 files (initial full statements96.39%,branches94.56%,functions98.12%,lines96.85%). User scope decision pending; thresholds unchanged."
  attempts: 1
quality_review:
  state: "human_review"
  updated_at: "2026-10-28T16:56:50.515Z"
  updated_by: "EVALUATOR"
  note: "Integration implementation and assertion repairs are ready; strict coverage exception or expanded coverage scope requires user decision before main publication."
  evaluated_sha: "a874f4b95cb78beec19b3789c346046c68ff350d"
  blueprint_digest: "f3404d8ee3d42cf16ad8ab8e1bfbf11af93dcd4727f1b4f391cabd81ed008208"
  evidence_refs:
    - ".agentplane/tasks/202610281559-581KM2/README.md"
    - ".agentplane/tasks/202610281559-581KM2/quality/20261028-165650515-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610281559-581KM2/quality/20261028-165650515-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610281559-581KM2/quality/20261028-165650515-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610281559-581KM2/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610281559-581KM2/initial-coverage-gaps.json"
  findings:
    - "Initial full run26091 tests had2 failures,both repaired and current-code147-test rerun passes. Global coverage gaps span255 files and include source-preserved practically unreachable branches. No thresholds/exclusions changed. Main push and reverse branch synchronization remain pending."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Execute approved integration of Writer and Calc with full verification and branch synchronization."
  -
    author: "CODER"
    body: "Blocked: Await the user coverage-scope decision before publishing integrated main and synchronizing writer and calc; all known assertion failures are repaired."
events:
  -
    type: "status"
    at: "2026-10-28T15:59:26.557Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute approved integration of Writer and Calc with full verification and branch synchronization."
  -
    type: "verify"
    at: "2026-10-28T16:56:50.040Z"
    author: "CODER"
    state: "needs_rework"
    note: "All actual test failures repaired;147 current-code focused tests,537 full browser and5 current-build browser scenarios pass;all non-application-coverage gates pass. Strict application100 coverage fails in255 files (initial full statements96.39%,branches94.56%,functions98.12%,lines96.85%). User scope decision pending; thresholds unchanged."
  -
    type: "status"
    at: "2026-10-28T16:56:50.811Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: Await the user coverage-scope decision before publishing integrated main and synchronizing writer and calc; all known assertion failures are repaired."
doc_version: 3
doc_updated_at: "2026-10-28T17:37:46.016Z"
doc_updated_by: "CODER"
description: "Push current Writer and Calc branches, merge both into main, resolve conflicts, run full verification and repair failures, document suspected upstream issues, push main and merge it back into both development branches. User explicitly authorized network pushes and all three repositories."
sections:
  Summary: "Integrate the current Writer and Calc work into main and synchronize all three published branches."
  Scope: "The three user-named repositories, branch merges, conflict resolution, failed-check repairs and regression tests, and suspected upstream issue documentation. Preserve unrelated untracked output. No history rewrites."
  Plan: "Execute the user-approved nine-step integration and synchronization plan with full npm verification, targeted regression repairs, upstream findings documentation and final remote/ancestry/working-tree checks."
  Verify Steps: |-
    1. Run npm run verify on integrated main, covering formatting, lint, types, tooling, coverage, browser tests, static build, documentation and provenance/inventory checks.
    2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    3. Confirm main is an ancestor of writer and calc, all three local branches equal their origin branches, and tracked working trees are clean. Preserve pre-existing calc output files.
  Verification: |-
    Complete initial application run:1661 files,26091 tests;1659 files/26089 tests passed,2 tests failed, no other failures. Both failures repaired: Calc clipboard-resources10/10 and related formatter suites44/44 pass; current-source integer regressions11/11 pass; Writer hyperlink codec30/30 pass including new empty-HREF round trips. Initial full coverage (not a final-current-source certificate because formatter was repaired during the run):statements115154/119457=96.39%,branches70519/74569=94.56%,functions18075/18420=98.12%,lines104713/108117=96.85%;255 files have gaps. Strict100 coverage gate remains failed; no threshold or exclusion changed. Diagnostic binary stream9/9 tests pass,branches96.55% with only line30 smaller-remaining-count arm uncovered; reaching it needs almost SAL_MAX_INT64 bytes. User decision requested first for that branch, then superseded by full-report scope choice for255 files. All537 browser tests pass; after formatter repair, rebuilt static smoke and5 relevant Calc browser scenarios pass. All other verify components pass:full formatting,lint/types,dependency/resource checks,tooling167 initially passing+2 repaired,inventory130tests100% across all metrics,docs/source-tree/WhichIds/provenance/invariants/parity. Canonical finding-reference corrections revalidated provenance/invariants/parity. Doctor and routing pass (existing hook readiness warning only). Current-code focused formatter/codec coverage run in progress. Publication and reverse synchronization await coverage-scope decision. Evidence logs and raw reports retained under ignored .agentplane/tmp and apps/office/coverage.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-28T16:56:50.040Z — VERIFY — needs_rework

    By: CODER

    Note: All actual test failures repaired;147 current-code focused tests,537 full browser and5 current-build browser scenarios pass;all non-application-coverage gates pass. Strict application100 coverage fails in255 files (initial full statements96.39%,branches94.56%,functions98.12%,lines96.85%). User scope decision pending; thresholds unchanged.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-28T16:56:49.451Z, excerpt_hash=sha256:084847eda8d4a12eaecc483e01da99322af421fcd8801e0b0b3beba54de58609

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610281559-581KM2/blueprint/resolved-snapshot.json
    - old_digest: f3404d8ee3d42cf16ad8ab8e1bfbf11af93dcd4727f1b4f391cabd81ed008208
    - current_digest: f3404d8ee3d42cf16ad8ab8e1bfbf11af93dcd4727f1b4f391cabd81ed008208
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610281559-581KM2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610281559-581KM2 -m 🧩 581KM2 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Preserve original commit IDs. Resolve locally before publishing main. Use revert commits for any published correction; never reset or force-push shared branches."
  Findings: |-
    Resolved merge conflicts preserving both feature sets and registry evidence. New journal append collisions are renumbered with canonical Markdown cross-references updated; older pre-existing duplicate headings remain outside this integration correction. Direct pinned upstream comparison confirmed comphelper strip/surrogate loops, documen3 grammar/language/lazy UNO registration, and all86 numeric language constants. Existing serial-only RemoveUnoObject and local boolean ApplyPatternAreaTab return are pre-existing port limitations, not upstream defects. Tooling repairs: classify three actual Calc-model tests as Calc integration and retain source-backed ICU dependency expectation (Library_i18npool links icui18n/icuuc). Full initial application run found unsupported builtin format1 numeric output. Implemented original finite, one-DIGIT-token integer branch via actual SAL corrected rounding, F conversion and backwards mandatory/optional/figure-space filling; cBlankDigit is original U+2007. No conditions, decimals, grouping, scaling or NatNum transliteration are fabricated. Existing clipboard-resources test now10/10 pass; four relevant suites44/44 pass, and final-current-source integer cases11/11 pass. New fixture initially assumed an unavailable PutEntry API; corrected it to the actual SvNumberformat constructor with real formatter-owned scanners. Runtime/provenance metadata records bounded admission and remaining unsupported formats; no broad parity flags changed. No newly discovered upstream defect. Doctor passed with existing hook readiness warning; routing passed.

    - Observation: Coverage diagnostic for actual BinaryXInputStream caller: all9 binary-stream tests pass; binaryinputstream.ts branches96.55%, only conditional branch0 at line30 remains [0,3]. Reaching the smaller-than32768 remaining count requires copying almost SAL_MAX_INT64 bytes. This source-preserved limitation is already documented in CALC-361.
      Impact: The configured strict100 global branch gate cannot pass this practical test domain. Upstream source and thresholds remain unchanged.
      Resolution: Requested an explicit user decision for this one recorded coverage exception while the complete application suite continues. Other test failures and checks remain mandatory.

    - Observation: Full initial application run also found one stale Writer codec fixture: invalid-record list rejected empty url despite the source-admitted HTML HREF contract already implemented and documented as WRITER233. Pinned htmlgrin.cxx lines1344-1358 constructs SwFormatINetFormat whenever bHasHRef is true without rechecking a nonempty resolved URL.
      Impact: Old boundary test contradicted the integrated native item behavior; production decoder correctly preserves the native empty internet item.
      Resolution: Keep malformed-shape/WhichId/type checks, remove empty native URL from invalid shapes and add both-codec empty-HREF round trips retaining name,target,style strings and unsigned16 IDs. Current focused suite30/30 passes. No production decoder or portable UI link validation changed. Canonical registry references for both journal renumberings are corrected and provenance/invariant/parity checks pass.

    - Observation: Final current-code focused validation:15 suites147 tests passed, including both originally failing suites. Actual new ImpGetNumberOutput body has29/29 executed statements and12/12 branch arms in the focused Istanbul report. The selected two-source-file diagnostic still does not meet whole-file100 thresholds and is not a global final-code certificate.
      Impact: All known failing assertions are repaired and new integration regressions are covered. The initial full run still establishes255 files with broad pre-existing/development coverage gaps, so the repository strict100 gate is not satisfied.
      Resolution: Preserve initial-coverage-gaps.json and unchanged coverage guards. Await explicit user scope decision: accept remaining coverage gaps for integration, or expand work to full coverage with separate treatment of unreachable native branches. Do not claim verification success or publish main before that decision.

    - Observation: User explicitly chose expansion to100 percent coverage on2026-10-28 Asia/Bangkok. New executable dependency B8TCAE owns remaining runtime coverage work; publication remains pending its completion.
      Impact: The earlier coverage acceptance request is superseded by the approved expanded work. No global exception or threshold reduction has been approved.
      Resolution: Continue B8TCAE. Its original OOX helper restoration already reaches genuine strict100 for the utility and three stream owners, so the formerly discussed inline-boundary exception is no longer needed. Preserve final full-verifier requirement before publication.
id_source: "generated"
---
## Summary

Integrate the current Writer and Calc work into main and synchronize all three published branches.

## Scope

The three user-named repositories, branch merges, conflict resolution, failed-check repairs and regression tests, and suspected upstream issue documentation. Preserve unrelated untracked output. No history rewrites.

## Plan

Execute the user-approved nine-step integration and synchronization plan with full npm verification, targeted regression repairs, upstream findings documentation and final remote/ancestry/working-tree checks.

## Verify Steps

1. Run npm run verify on integrated main, covering formatting, lint, types, tooling, coverage, browser tests, static build, documentation and provenance/inventory checks.
2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
3. Confirm main is an ancestor of writer and calc, all three local branches equal their origin branches, and tracked working trees are clean. Preserve pre-existing calc output files.

## Verification

Complete initial application run:1661 files,26091 tests;1659 files/26089 tests passed,2 tests failed, no other failures. Both failures repaired: Calc clipboard-resources10/10 and related formatter suites44/44 pass; current-source integer regressions11/11 pass; Writer hyperlink codec30/30 pass including new empty-HREF round trips. Initial full coverage (not a final-current-source certificate because formatter was repaired during the run):statements115154/119457=96.39%,branches70519/74569=94.56%,functions18075/18420=98.12%,lines104713/108117=96.85%;255 files have gaps. Strict100 coverage gate remains failed; no threshold or exclusion changed. Diagnostic binary stream9/9 tests pass,branches96.55% with only line30 smaller-remaining-count arm uncovered; reaching it needs almost SAL_MAX_INT64 bytes. User decision requested first for that branch, then superseded by full-report scope choice for255 files. All537 browser tests pass; after formatter repair, rebuilt static smoke and5 relevant Calc browser scenarios pass. All other verify components pass:full formatting,lint/types,dependency/resource checks,tooling167 initially passing+2 repaired,inventory130tests100% across all metrics,docs/source-tree/WhichIds/provenance/invariants/parity. Canonical finding-reference corrections revalidated provenance/invariants/parity. Doctor and routing pass (existing hook readiness warning only). Current-code focused formatter/codec coverage run in progress. Publication and reverse synchronization await coverage-scope decision. Evidence logs and raw reports retained under ignored .agentplane/tmp and apps/office/coverage.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-28T16:56:50.040Z — VERIFY — needs_rework

By: CODER

Note: All actual test failures repaired;147 current-code focused tests,537 full browser and5 current-build browser scenarios pass;all non-application-coverage gates pass. Strict application100 coverage fails in255 files (initial full statements96.39%,branches94.56%,functions98.12%,lines96.85%). User scope decision pending; thresholds unchanged.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-28T16:56:49.451Z, excerpt_hash=sha256:084847eda8d4a12eaecc483e01da99322af421fcd8801e0b0b3beba54de58609

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610281559-581KM2/blueprint/resolved-snapshot.json
- old_digest: f3404d8ee3d42cf16ad8ab8e1bfbf11af93dcd4727f1b4f391cabd81ed008208
- current_digest: f3404d8ee3d42cf16ad8ab8e1bfbf11af93dcd4727f1b4f391cabd81ed008208
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610281559-581KM2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610281559-581KM2 -m 🧩 581KM2 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Preserve original commit IDs. Resolve locally before publishing main. Use revert commits for any published correction; never reset or force-push shared branches.

## Findings

Resolved merge conflicts preserving both feature sets and registry evidence. New journal append collisions are renumbered with canonical Markdown cross-references updated; older pre-existing duplicate headings remain outside this integration correction. Direct pinned upstream comparison confirmed comphelper strip/surrogate loops, documen3 grammar/language/lazy UNO registration, and all86 numeric language constants. Existing serial-only RemoveUnoObject and local boolean ApplyPatternAreaTab return are pre-existing port limitations, not upstream defects. Tooling repairs: classify three actual Calc-model tests as Calc integration and retain source-backed ICU dependency expectation (Library_i18npool links icui18n/icuuc). Full initial application run found unsupported builtin format1 numeric output. Implemented original finite, one-DIGIT-token integer branch via actual SAL corrected rounding, F conversion and backwards mandatory/optional/figure-space filling; cBlankDigit is original U+2007. No conditions, decimals, grouping, scaling or NatNum transliteration are fabricated. Existing clipboard-resources test now10/10 pass; four relevant suites44/44 pass, and final-current-source integer cases11/11 pass. New fixture initially assumed an unavailable PutEntry API; corrected it to the actual SvNumberformat constructor with real formatter-owned scanners. Runtime/provenance metadata records bounded admission and remaining unsupported formats; no broad parity flags changed. No newly discovered upstream defect. Doctor passed with existing hook readiness warning; routing passed.

- Observation: Coverage diagnostic for actual BinaryXInputStream caller: all9 binary-stream tests pass; binaryinputstream.ts branches96.55%, only conditional branch0 at line30 remains [0,3]. Reaching the smaller-than32768 remaining count requires copying almost SAL_MAX_INT64 bytes. This source-preserved limitation is already documented in CALC-361.
  Impact: The configured strict100 global branch gate cannot pass this practical test domain. Upstream source and thresholds remain unchanged.
  Resolution: Requested an explicit user decision for this one recorded coverage exception while the complete application suite continues. Other test failures and checks remain mandatory.

- Observation: Full initial application run also found one stale Writer codec fixture: invalid-record list rejected empty url despite the source-admitted HTML HREF contract already implemented and documented as WRITER233. Pinned htmlgrin.cxx lines1344-1358 constructs SwFormatINetFormat whenever bHasHRef is true without rechecking a nonempty resolved URL.
  Impact: Old boundary test contradicted the integrated native item behavior; production decoder correctly preserves the native empty internet item.
  Resolution: Keep malformed-shape/WhichId/type checks, remove empty native URL from invalid shapes and add both-codec empty-HREF round trips retaining name,target,style strings and unsigned16 IDs. Current focused suite30/30 passes. No production decoder or portable UI link validation changed. Canonical registry references for both journal renumberings are corrected and provenance/invariant/parity checks pass.

- Observation: Final current-code focused validation:15 suites147 tests passed, including both originally failing suites. Actual new ImpGetNumberOutput body has29/29 executed statements and12/12 branch arms in the focused Istanbul report. The selected two-source-file diagnostic still does not meet whole-file100 thresholds and is not a global final-code certificate.
  Impact: All known failing assertions are repaired and new integration regressions are covered. The initial full run still establishes255 files with broad pre-existing/development coverage gaps, so the repository strict100 gate is not satisfied.
  Resolution: Preserve initial-coverage-gaps.json and unchanged coverage guards. Await explicit user scope decision: accept remaining coverage gaps for integration, or expand work to full coverage with separate treatment of unreachable native branches. Do not claim verification success or publish main before that decision.

- Observation: User explicitly chose expansion to100 percent coverage on2026-10-28 Asia/Bangkok. New executable dependency B8TCAE owns remaining runtime coverage work; publication remains pending its completion.
  Impact: The earlier coverage acceptance request is superseded by the approved expanded work. No global exception or threshold reduction has been approved.
  Resolution: Continue B8TCAE. Its original OOX helper restoration already reaches genuine strict100 for the utility and three stream owners, so the formerly discussed inline-boundary exception is no longer needed. Preserve final full-verifier requirement before publication.
