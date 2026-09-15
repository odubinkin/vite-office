---
id: "202609150724-E0ZZ7Q"
title: "Align Writer ODT next styles with LibreOffice"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T07:25:02.910Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T07:36:56.465Z"
  updated_by: "CODER"
  note: "verified-202609150724-E0ZZ7Q"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T07:36:44.813Z"
  updated_by: "EVALUATOR"
  note: "Implementation matches pinned LibreOffice follow-style import behavior within the bounded built-in Writer style model and preserves export/import round trips."
  evaluated_sha: "c78489ecdbfbd4a3945f9ed023eadb512ed79b90"
  blueprint_digest: "f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5"
  evidence_refs:
    - ".agentplane/tasks/202609150724-E0ZZ7Q/README.md"
    - ".agentplane/tasks/202609150724-E0ZZ7Q/quality/20260915-073644813-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150724-E0ZZ7Q/quality/20260915-073644813-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150724-E0ZZ7Q/quality/20260915-073644813-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150724-E0ZZ7Q/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/xmlimp.ts"
    - "apps/office/src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts"
    - "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts"
  findings:
    - "xmlimp.ts now defers follow linkage until named styles exist, accepts alternate existing next styles, and falls back to self for absent or unresolved names; focused and full verification passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement pinned LibreOffice-compatible paragraph follow-style import linking and focused ODT round-trip regressions."
events:
  -
    type: "status"
    at: "2026-09-15T07:25:13.050Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement pinned LibreOffice-compatible paragraph follow-style import linking and focused ODT round-trip regressions."
  -
    type: "verify"
    at: "2026-09-15T07:36:36.666Z"
    author: "CODER"
    state: "ok"
    note: "Focused ODT tests pass 14/14; VITEST_MAX_WORKERS=2 npm run verify passes 287 unit and 84 inventory tests at 100% coverage, 9/9 E2E, static/docs/file-size/source-tree/provenance/parity; doctor and routing pass."
  -
    type: "verify"
    at: "2026-09-15T07:36:56.465Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150724-E0ZZ7Q"
doc_version: 3
doc_updated_at: "2026-09-15T07:36:56.541Z"
doc_updated_by: "CODER"
description: "Compare Writer ODT paragraph follow-style import/export with pinned LibreOffice and accept LibreOffice-valid Title next-style relationships without changing the bounded architecture."
sections:
  Summary: "Restore LibreOffice-compatible ODT follow-style handling so documents with a valid non-default Title next style open successfully and retain that relationship across export/import."
  Scope: "Compare against pinned LibreOffice source in vendor/libreoffice-reference. Modify only the bounded Writer named paragraph-style import path and focused ODT style tests, expected in apps/office/src/sw/source/filter/xml/xmlimp.ts and apps/office/src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts (plus an existing directly related ODT test only if required). Preserve module boundaries, parser limits, unrelated malformed-ODF failures, current file structure, and the pre-existing modification in .agentplane/tasks/202609150628-8AX7HA/README.md. No network access."
  Plan: "1. Replace the project-specific fixed follow-style assertion with LibreOffice-shaped deferred linking after all named styles exist. 2. Resolve declared built-in paragraph follow styles through canonical ODF names; use the current style when the attribute is absent or unresolved, matching upstream. 3. Preserve export of the live follow relationship and omission for self-follow. 4. Add package-level import/export regressions for Title with an alternate existing follow style and absent or unresolved follow names. 5. Run focused and full verification and record evidence."
  Verify Steps: |-
    1. Run: npm exec vitest run --workspace @vite-office/office -- src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts. Expected: focused Writer ODT tests pass, including alternate, absent, unresolved, and export/import Title follow-style behavior.
    2. Run: npm run verify. Expected: formatting, lint, typechecking, boundaries, unit/inventory coverage, E2E/static, docs, file-size, source-tree, provenance, and parity checks pass.
    3. Run: ap doctor. Expected: repository health passes, allowing only clearly identified pre-existing warnings unrelated to this task.
    4. Run: node .agentplane/policy/check-routing.mjs. Expected: routing and policy size checks pass.
    5. Run: git status --short --untracked-files=all. Expected: only this task's intentional code/test/task artifacts plus the preserved pre-existing task README modification are present.
  Verification: |-
    Pending execution by CODER. Results will record exact commands, outcomes, evidence, and scope.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T07:36:36.666Z — VERIFY — ok

    By: CODER

    Note: Focused ODT tests pass 14/14; VITEST_MAX_WORKERS=2 npm run verify passes 287 unit and 84 inventory tests at 100% coverage, 9/9 E2E, static/docs/file-size/source-tree/provenance/parity; doctor and routing pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:36:10.318Z, excerpt_hash=sha256:18d45d04dcdd35811ad8d95c873d90860d255caf2884a0b2ece7085386106cf5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150724-E0ZZ7Q/blueprint/resolved-snapshot.json
    - old_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
    - current_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150724-E0ZZ7Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150724-E0ZZ7Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T07:36:56.465Z — VERIFY — ok

    By: CODER

    Note: verified-202609150724-E0ZZ7Q
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:36:36.749Z, excerpt_hash=sha256:18d45d04dcdd35811ad8d95c873d90860d255caf2884a0b2ece7085386106cf5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150724-E0ZZ7Q/blueprint/resolved-snapshot.json
    - old_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
    - current_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150724-E0ZZ7Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150724-E0ZZ7Q --result verified-202609150724-E0ZZ7Q --commit c78489ecdbfbd4a3945f9ed023eadb512ed79b90
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commit produced for 202609150724-E0ZZ7Q; do not alter the pre-existing task README modification."
  Findings: |-
    Pinned upstream xmloff/source/style/prstylei.cxx resolves follow names after styles exist, assigns an existing follow style, and falls back to the style itself when the declaration is empty or unresolved. Current xmlimp.ts instead rejects any next style differing from the built-in pool default and does not apply declared follow relationships.

    - Observation: The unconstrained npm run verify hit pre-existing 5-second timeouts in WriterMenuBar.test.tsx and view-session.test.tsx under high Vitest concurrency; both tests passed together in isolation.
      Impact: The default high-concurrency run was nondeterministic, but no ODT or production failure was observed.
      Resolution: VITEST_MAX_WORKERS=2 npm run verify passed the complete verification chain, including 287 unit tests and 84 inventory tests at 100% coverage, 9 E2E tests, static/docs/file-size/source-tree/provenance/parity checks.
      Promotion: incident-candidate
      Fixability: repo-fixable

    - Observation: Named paragraph next styles are now resolved after style creation like pinned LibreOffice.
      Impact: LibreOffice ODT files with valid alternate Title follow styles open and retain the relationship through export/import.
      Resolution: Removed fixed pool-default validation, linked known follow styles, and used self-follow for absent or unresolved names.
id_source: "generated"
---
## Summary

Restore LibreOffice-compatible ODT follow-style handling so documents with a valid non-default Title next style open successfully and retain that relationship across export/import.

## Scope

Compare against pinned LibreOffice source in vendor/libreoffice-reference. Modify only the bounded Writer named paragraph-style import path and focused ODT style tests, expected in apps/office/src/sw/source/filter/xml/xmlimp.ts and apps/office/src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts (plus an existing directly related ODT test only if required). Preserve module boundaries, parser limits, unrelated malformed-ODF failures, current file structure, and the pre-existing modification in .agentplane/tasks/202609150628-8AX7HA/README.md. No network access.

## Plan

1. Replace the project-specific fixed follow-style assertion with LibreOffice-shaped deferred linking after all named styles exist. 2. Resolve declared built-in paragraph follow styles through canonical ODF names; use the current style when the attribute is absent or unresolved, matching upstream. 3. Preserve export of the live follow relationship and omission for self-follow. 4. Add package-level import/export regressions for Title with an alternate existing follow style and absent or unresolved follow names. 5. Run focused and full verification and record evidence.

## Verify Steps

1. Run: npm exec vitest run --workspace @vite-office/office -- src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts. Expected: focused Writer ODT tests pass, including alternate, absent, unresolved, and export/import Title follow-style behavior.
2. Run: npm run verify. Expected: formatting, lint, typechecking, boundaries, unit/inventory coverage, E2E/static, docs, file-size, source-tree, provenance, and parity checks pass.
3. Run: ap doctor. Expected: repository health passes, allowing only clearly identified pre-existing warnings unrelated to this task.
4. Run: node .agentplane/policy/check-routing.mjs. Expected: routing and policy size checks pass.
5. Run: git status --short --untracked-files=all. Expected: only this task's intentional code/test/task artifacts plus the preserved pre-existing task README modification are present.

## Verification

Pending execution by CODER. Results will record exact commands, outcomes, evidence, and scope.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T07:36:36.666Z — VERIFY — ok

By: CODER

Note: Focused ODT tests pass 14/14; VITEST_MAX_WORKERS=2 npm run verify passes 287 unit and 84 inventory tests at 100% coverage, 9/9 E2E, static/docs/file-size/source-tree/provenance/parity; doctor and routing pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:36:10.318Z, excerpt_hash=sha256:18d45d04dcdd35811ad8d95c873d90860d255caf2884a0b2ece7085386106cf5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150724-E0ZZ7Q/blueprint/resolved-snapshot.json
- old_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
- current_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150724-E0ZZ7Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150724-E0ZZ7Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T07:36:56.465Z — VERIFY — ok

By: CODER

Note: verified-202609150724-E0ZZ7Q
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:36:36.749Z, excerpt_hash=sha256:18d45d04dcdd35811ad8d95c873d90860d255caf2884a0b2ece7085386106cf5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150724-E0ZZ7Q/blueprint/resolved-snapshot.json
- old_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
- current_digest: f68b4f0188e24897b499a91b92060fe1551d981287ec2abbb1e698ddcdd449b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150724-E0ZZ7Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150724-E0ZZ7Q --result verified-202609150724-E0ZZ7Q --commit c78489ecdbfbd4a3945f9ed023eadb512ed79b90
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commit produced for 202609150724-E0ZZ7Q; do not alter the pre-existing task README modification.

## Findings

Pinned upstream xmloff/source/style/prstylei.cxx resolves follow names after styles exist, assigns an existing follow style, and falls back to the style itself when the declaration is empty or unresolved. Current xmlimp.ts instead rejects any next style differing from the built-in pool default and does not apply declared follow relationships.

- Observation: The unconstrained npm run verify hit pre-existing 5-second timeouts in WriterMenuBar.test.tsx and view-session.test.tsx under high Vitest concurrency; both tests passed together in isolation.
  Impact: The default high-concurrency run was nondeterministic, but no ODT or production failure was observed.
  Resolution: VITEST_MAX_WORKERS=2 npm run verify passed the complete verification chain, including 287 unit tests and 84 inventory tests at 100% coverage, 9 E2E tests, static/docs/file-size/source-tree/provenance/parity checks.
  Promotion: incident-candidate
  Fixability: repo-fixable

- Observation: Named paragraph next styles are now resolved after style creation like pinned LibreOffice.
  Impact: LibreOffice ODT files with valid alternate Title follow styles open and retain the relationship through export/import.
  Resolution: Removed fixed pool-default validation, linked known follow styles, and used self-follow for absent or unresolved names.
