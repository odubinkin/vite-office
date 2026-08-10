---
id: "202608101237-HS24PK"
title: "Implement browser locale message catalog contract"
result_summary: "Locale normalization, fallback, and interpolation contract verified."
risk_level: "low"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T12:37:39.475Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-10T12:43:22.434Z"
  updated_by: "REVIEWER"
  note: "Verified locale catalog contract: npm run verify passed (application 29 tests/100% coverage, inventory 67 tests/100% coverage, Playwright 1/1); locale normalization, fallback, interpolation, invalid input, and immutable catalogs are covered."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-10T12:43:29.010Z"
  updated_by: "EVALUATOR"
  note: "The pure locale catalog contract remains within approved scope and satisfies all verification steps."
  evaluated_sha: "ce2be94bac98e871e7ac8c4611ded61d1902b26e"
  blueprint_digest: "885329c9f8406ccfad820c69277df23f02c0387a7e63a7685a9af2b46a008896"
  evidence_refs:
    - ".agentplane/tasks/202608101237-HS24PK/README.md"
    - ".agentplane/tasks/202608101237-HS24PK/quality/20260810-124329010-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608101237-HS24PK/quality/20260810-124329010-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608101237-HS24PK/quality/20260810-124329010-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608101237-HS24PK/blueprint/resolved-snapshot.json"
    - "ce2be94bac98 implementation commit"
    - "npm run verify passed"
  findings:
    - "No confirmed defects: canonical locale normalization, deterministic fallback/interpolation, tests, and documentation are present."
commit:
  hash: "227d1a8511b10da37c13ce04fcf055ce5a43c4ea"
  message: "✅ HS24PK task: record locale catalog verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: implement approved browser locale message catalog contract."
  -
    author: "CODER"
    body: "Verified: locale catalog contract passed all declared checks."
events:
  -
    type: "status"
    at: "2026-08-10T12:37:40.115Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved browser locale message catalog contract."
  -
    type: "verify"
    at: "2026-08-10T12:43:22.434Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified locale catalog contract: npm run verify passed (application 29 tests/100% coverage, inventory 67 tests/100% coverage, Playwright 1/1); locale normalization, fallback, interpolation, invalid input, and immutable catalogs are covered."
  -
    type: "status"
    at: "2026-08-10T12:43:47.501Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: locale catalog contract passed all declared checks."
doc_version: 3
doc_updated_at: "2026-08-10T12:43:47.503Z"
doc_updated_by: "CODER"
description: "Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering."
sections:
  Summary: |-
    Implement browser locale message catalog contract

    Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.
  Scope: |-
    - In scope: Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.
    - Out of scope: unrelated refactors not required for "Implement browser locale message catalog contract".
  Plan: "1. Define serializable locale and message catalog contracts with exact default fallback semantics. 2. Implement pure locale normalization, catalog lookup, and placeholder interpolation without browser APIs. 3. Add tests for regional fallback, unknown-message fallback, repeated placeholders, immutable inputs, and invalid locale/message data. 4. Document scope and deferred translation/UI/pluralization work. 5. Run full verification, review, evaluator, and close."
  Verify Steps: |-
    1. Run strict TypeScript, ESLint, JSDoc, Prettier, and authored-file-size checks.
    2. Require 100% application coverage and unchanged 100% inventory coverage.
    3. Unit-test locale normalization, regional and default fallback, interpolation, invalid values, and immutable catalog behavior.
    4. Run npm run verify, agentplane doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T12:43:22.434Z — VERIFY — ok

    By: REVIEWER

    Note: Verified locale catalog contract: npm run verify passed (application 29 tests/100% coverage, inventory 67 tests/100% coverage, Playwright 1/1); locale normalization, fallback, interpolation, invalid input, and immutable catalogs are covered.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T12:37:40.115Z, excerpt_hash=sha256:899a370d46608f514a535789b88b641ba164c22c1fcd0b5d813c8de625615aec

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608101237-HS24PK/blueprint/resolved-snapshot.json
    - old_digest: 885329c9f8406ccfad820c69277df23f02c0387a7e63a7685a9af2b46a008896
    - current_digest: 885329c9f8406ccfad820c69277df23f02c0387a7e63a7685a9af2b46a008896
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608101237-HS24PK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608101237-HS24PK
    - diagnostic_command: agentplane task run status 202608101237-HS24PK
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
extensions:
  implementation_commit:
    hash: "ce2be94bac98e871e7ac8c4611ded61d1902b26e"
    message: "✨ HS24PK code: add browser locale message catalog contract"
id_source: "generated"
---
## Summary

Implement browser locale message catalog contract

Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.

## Scope

- In scope: Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.
- Out of scope: unrelated refactors not required for "Implement browser locale message catalog contract".

## Plan

1. Define serializable locale and message catalog contracts with exact default fallback semantics. 2. Implement pure locale normalization, catalog lookup, and placeholder interpolation without browser APIs. 3. Add tests for regional fallback, unknown-message fallback, repeated placeholders, immutable inputs, and invalid locale/message data. 4. Document scope and deferred translation/UI/pluralization work. 5. Run full verification, review, evaluator, and close.

## Verify Steps

1. Run strict TypeScript, ESLint, JSDoc, Prettier, and authored-file-size checks.
2. Require 100% application coverage and unchanged 100% inventory coverage.
3. Unit-test locale normalization, regional and default fallback, interpolation, invalid values, and immutable catalog behavior.
4. Run npm run verify, agentplane doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T12:43:22.434Z — VERIFY — ok

By: REVIEWER

Note: Verified locale catalog contract: npm run verify passed (application 29 tests/100% coverage, inventory 67 tests/100% coverage, Playwright 1/1); locale normalization, fallback, interpolation, invalid input, and immutable catalogs are covered.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T12:37:40.115Z, excerpt_hash=sha256:899a370d46608f514a535789b88b641ba164c22c1fcd0b5d813c8de625615aec

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608101237-HS24PK/blueprint/resolved-snapshot.json
- old_digest: 885329c9f8406ccfad820c69277df23f02c0387a7e63a7685a9af2b46a008896
- current_digest: 885329c9f8406ccfad820c69277df23f02c0387a7e63a7685a9af2b46a008896
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608101237-HS24PK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608101237-HS24PK
- diagnostic_command: agentplane task run status 202608101237-HS24PK
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
