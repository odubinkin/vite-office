---
id: "202609231107-DWJEBC"
title: "Match Writer ODT vertical layout and list geometry to LibreOffice"
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
  updated_at: "2026-09-23T11:50:31.840Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T12:45:20.580Z"
  updated_by: "CODER"
  note: "Full npm run verify passed: 369 office tests and 96 inventory tests at 100% coverage, 11 e2e tests, build, static and repository gates. ODT layout/list regressions passed; diff and status inspected."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved ODT paragraph and list geometry parity in the direct checkout with focused regression coverage."
events:
  -
    type: "status"
    at: "2026-09-23T11:08:30.301Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved ODT paragraph and list geometry parity in the direct checkout with focused regression coverage."
  -
    type: "verify"
    at: "2026-09-23T12:45:20.580Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed: 369 office tests and 96 inventory tests at 100% coverage, 11 e2e tests, build, static and repository gates. ODT layout/list regressions passed; diff and status inspected."
doc_version: 3
doc_updated_at: "2026-09-23T12:45:20.675Z"
doc_updated_by: "CODER"
description: "Import supported paragraph and list layout properties and correct browser presentation so line spacing and list markers follow pinned LibreOffice behavior."
sections:
  Summary: |-
    Match Writer ODT vertical layout and list geometry to LibreOffice

    Import supported paragraph and list layout properties and correct browser presentation so line spacing and list markers follow pinned LibreOffice behavior.
  Scope: "In scope: xmloff ODT paragraph default style and list level layout import/export; Writer model geometry; browser proportional line height, paragraph spacing, pagination and list marker placement; regression tests; complete 100% office application coverage as explicitly requested by the user; necessary documentation and provenance. Out of scope: full LibreOffice text shaping and unrelated ODT feature families."
  Plan: "Match LibreOffice Writer ODT vertical flow and list geometry using upstream-compatible default paragraph styles, proportional line leading, paragraph spacing, and list-level alignment. Extend scope, as explicitly requested by the user on 2026-09-23, to bring the entire office app coverage gate to 100% for statements, branches, functions, and lines with meaningful tests or narrowly justified exclusions for unreachable code. Preserve ODT round trips and complete full npm run verify."
  Verify Steps: "1. Run focused Vitest suites for ODT paragraph styles, lists, Writer projection, and page layout; confirm round trips and marker placement. 2. Run npm run test:coverage; require 100% statements, branches, functions, and lines across the office app. 3. Run npm run verify; require all repository gates to pass. 4. Inspect git diff and git status --short --untracked-files=all; require only intentional task changes and clean final tracked state."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T12:45:20.580Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed: 369 office tests and 96 inventory tests at 100% coverage, 11 e2e tests, build, static and repository gates. ODT layout/list regressions passed; diff and status inspected.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T12:45:05.103Z, excerpt_hash=sha256:9b090150a3affa6cb485a2b9f5d7a29bdaacb900dcf4e6c9178edd3cd3d2ab29

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231107-DWJEBC/blueprint/resolved-snapshot.json
    - old_digest: 29b68380bfaae078ce9b1897734d84b88068d6c55189e73e60781993d7095218
    - current_digest: 29b68380bfaae078ce9b1897734d84b88068d6c55189e73e60781993d7095218
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231107-DWJEBC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609231107-DWJEBC
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
    Command: npm run verify
    Result: pass
    Evidence: 369 office tests and 96 inventory tests passed; both suites reached 100% statements, branches, functions, and lines. All 11 browser e2e tests, production build, static tests, formatting, lint, typecheck, docs, provenance, module boundaries, file size, source tree, inventory invariants and parity passed.
    Scope: Complete repository verification gate.

    Command: git diff --check; git status --short --untracked-files=all
    Result: pass
    Evidence: No whitespace errors or unrelated generated artifacts; changed files are in the approved implementation, tests, provenance and task scope.
    Scope: Final change inspection.

    Implementation: Imported ODF paragraph default styles and list level alignment or legacy geometry; projected LibreOffice proportional line height and paragraph spacing; corrected marker slot placement and inherited character attributes; retained native ODT round trips. Added meaningful coverage for remaining app paths to satisfy the user requested global 100% gate. Simplified guards unreachable under SwPaM and ordered paragraph invariants.

    Residual risk: Browser text shaping remains a bounded approximation; no user-specific ODT was supplied for pixel-by-pixel comparison.
id_source: "generated"
---
## Summary

Match Writer ODT vertical layout and list geometry to LibreOffice

Import supported paragraph and list layout properties and correct browser presentation so line spacing and list markers follow pinned LibreOffice behavior.

## Scope

In scope: xmloff ODT paragraph default style and list level layout import/export; Writer model geometry; browser proportional line height, paragraph spacing, pagination and list marker placement; regression tests; complete 100% office application coverage as explicitly requested by the user; necessary documentation and provenance. Out of scope: full LibreOffice text shaping and unrelated ODT feature families.

## Plan

Match LibreOffice Writer ODT vertical flow and list geometry using upstream-compatible default paragraph styles, proportional line leading, paragraph spacing, and list-level alignment. Extend scope, as explicitly requested by the user on 2026-09-23, to bring the entire office app coverage gate to 100% for statements, branches, functions, and lines with meaningful tests or narrowly justified exclusions for unreachable code. Preserve ODT round trips and complete full npm run verify.

## Verify Steps

1. Run focused Vitest suites for ODT paragraph styles, lists, Writer projection, and page layout; confirm round trips and marker placement. 2. Run npm run test:coverage; require 100% statements, branches, functions, and lines across the office app. 3. Run npm run verify; require all repository gates to pass. 4. Inspect git diff and git status --short --untracked-files=all; require only intentional task changes and clean final tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T12:45:20.580Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed: 369 office tests and 96 inventory tests at 100% coverage, 11 e2e tests, build, static and repository gates. ODT layout/list regressions passed; diff and status inspected.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T12:45:05.103Z, excerpt_hash=sha256:9b090150a3affa6cb485a2b9f5d7a29bdaacb900dcf4e6c9178edd3cd3d2ab29

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231107-DWJEBC/blueprint/resolved-snapshot.json
- old_digest: 29b68380bfaae078ce9b1897734d84b88068d6c55189e73e60781993d7095218
- current_digest: 29b68380bfaae078ce9b1897734d84b88068d6c55189e73e60781993d7095218
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231107-DWJEBC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609231107-DWJEBC
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

Command: npm run verify
Result: pass
Evidence: 369 office tests and 96 inventory tests passed; both suites reached 100% statements, branches, functions, and lines. All 11 browser e2e tests, production build, static tests, formatting, lint, typecheck, docs, provenance, module boundaries, file size, source tree, inventory invariants and parity passed.
Scope: Complete repository verification gate.

Command: git diff --check; git status --short --untracked-files=all
Result: pass
Evidence: No whitespace errors or unrelated generated artifacts; changed files are in the approved implementation, tests, provenance and task scope.
Scope: Final change inspection.

Implementation: Imported ODF paragraph default styles and list level alignment or legacy geometry; projected LibreOffice proportional line height and paragraph spacing; corrected marker slot placement and inherited character attributes; retained native ODT round trips. Added meaningful coverage for remaining app paths to satisfy the user requested global 100% gate. Simplified guards unreachable under SwPaM and ordered paragraph invariants.

Residual risk: Browser text shaping remains a bounded approximation; no user-specific ODT was supplied for pixel-by-pixel comparison.
