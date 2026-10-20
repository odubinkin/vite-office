---
id: "202610201528-MD0CQF"
title: "Repair checkpoint50 regressions and restore Calc shared complete coverage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T15:28:32.106Z"
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
    body: "Start: repair checkpoint50 failures and restore full Calc/shared coverage under the clarified user stop condition."
events:
  -
    type: "status"
    at: "2026-10-20T15:28:45.642Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: repair checkpoint50 failures and restore full Calc/shared coverage under the clarified user stop condition."
doc_version: 3
doc_updated_at: "2026-10-20T15:28:45.642Z"
doc_updated_by: "CODER"
description: "User clarified stop condition: repair the complete-run test failures and obtain 100 percent statements branches functions and lines for Calc and shared owners before pausing. Preserve native contracts and coverage gates. Work solely in calc checkout and branch."
sections:
  Summary: |-
    Repair checkpoint50 regressions and restore Calc shared complete coverage

    User clarified stop condition: repair the complete-run test failures and obtain 100 percent statements branches functions and lines for Calc and shared owners before pausing. Preserve native contracts and coverage gates. Work solely in calc checkout and branch.
  Scope: "Checkpoint50 failures and coverage gaps in Calc, shared border controls/core and XML/character rendering, with corresponding colocated tests and e2e expectations. Up to 45 test files; production repairs only for demonstrated contract bugs. No feature expansion or test gate relaxation."
  Plan: "Repair the two application and four browser regressions recorded by checkpoint50, checking current native behavior before changing expectations. Add meaningful contract, boundary, state, UI interaction, and serialization tests for all 32 Calc/shared owners with gaps, using colocated tests and focused new regression files as needed (up to 45 test files plus implementation repairs only when a regression is demonstrated). Keep production native semantics, thresholds, coverage ownership, exclusions and retries unchanged. Verify focused suites, complete Calc coverage and shared coverage with application integration at 100 percent S/B/F/L, all Calc/shared browser cases and affected Writer integrations, then full application regression and static gates once on final source. Record exact evidence, close task and pause goal. No network, branches, merges or new features."
  Verify Steps: "Run focused regressions; npm run test:coverage:calc and npm run test:coverage:shared (disjoint batches and exact checked raw union allowed if disk pressure prevents monolithic run, unchanged Istanbul thresholds and owner selection). Require zero failures and 100 percent statements branches functions lines for Calc and shared; no new excludes or ignore directives. Run complete browser suite, complete application regression on final source, tooling/inventory coverage and format/lint/type/build/dependencies/resource/docs/size/tree/provenance/registry/routing/doctor/static gates. Preserve exact commands, failures and final results. Check clean git status and calc branch. Pause goal only after repairs and successful required gates."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task implementation commit if needed; retain evidence and original checkpoint50 results. No history rewrite or source reference changes."
  Findings: ""
id_source: "generated"
---
## Summary

Repair checkpoint50 regressions and restore Calc shared complete coverage

User clarified stop condition: repair the complete-run test failures and obtain 100 percent statements branches functions and lines for Calc and shared owners before pausing. Preserve native contracts and coverage gates. Work solely in calc checkout and branch.

## Scope

Checkpoint50 failures and coverage gaps in Calc, shared border controls/core and XML/character rendering, with corresponding colocated tests and e2e expectations. Up to 45 test files; production repairs only for demonstrated contract bugs. No feature expansion or test gate relaxation.

## Plan

Repair the two application and four browser regressions recorded by checkpoint50, checking current native behavior before changing expectations. Add meaningful contract, boundary, state, UI interaction, and serialization tests for all 32 Calc/shared owners with gaps, using colocated tests and focused new regression files as needed (up to 45 test files plus implementation repairs only when a regression is demonstrated). Keep production native semantics, thresholds, coverage ownership, exclusions and retries unchanged. Verify focused suites, complete Calc coverage and shared coverage with application integration at 100 percent S/B/F/L, all Calc/shared browser cases and affected Writer integrations, then full application regression and static gates once on final source. Record exact evidence, close task and pause goal. No network, branches, merges or new features.

## Verify Steps

Run focused regressions; npm run test:coverage:calc and npm run test:coverage:shared (disjoint batches and exact checked raw union allowed if disk pressure prevents monolithic run, unchanged Istanbul thresholds and owner selection). Require zero failures and 100 percent statements branches functions lines for Calc and shared; no new excludes or ignore directives. Run complete browser suite, complete application regression on final source, tooling/inventory coverage and format/lint/type/build/dependencies/resource/docs/size/tree/provenance/registry/routing/doctor/static gates. Preserve exact commands, failures and final results. Check clean git status and calc branch. Pause goal only after repairs and successful required gates.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task implementation commit if needed; retain evidence and original checkpoint50 results. No history rewrite or source reference changes.

## Findings
