---
id: "202609150452-KXG5B6"
title: "Preserve LibreOffice ODF bullet characters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T04:52:40.002Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T05:02:26.309Z"
  updated_by: "CODER"
  note: "verified-202609150452-KXG5B6"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T05:02:16.633Z"
  updated_by: "EVALUATOR"
  note: "ODF bullet characters now follow the pinned LibreOffice import/store/export path without changing list-kind semantics."
  evaluated_sha: "a3165f81ebaee26425d5b2702277a035eeed1566"
  blueprint_digest: "ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058"
  evidence_refs:
    - ".agentplane/tasks/202609150452-KXG5B6/README.md"
    - ".agentplane/tasks/202609150452-KXG5B6/quality/20260915-050216633-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150452-KXG5B6/quality/20260915-050216633-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150452-KXG5B6/quality/20260915-050216633-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150452-KXG5B6/blueprint/resolved-snapshot.json"
    - "npm run test:coverage: 59 files, 282 tests, 100% coverage; npm run lint; npm run typecheck; node .agentplane/policy/check-routing.mjs"
  findings:
    - "U+25CF imports, renders from SwNumFormat, persists in snapshots, and round-trips through ODT; missing and multi-code-point invalid states remain guarded."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T04:52:50.026Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-15T05:02:06.643Z"
    author: "TESTER"
    state: "ok"
    note: "Verified: focused Vitest fallback passed 19/19 tests; full npm run test:coverage passed 282/282 with 100% statements, branches, functions, and lines; format, lint, typecheck, module boundaries, JSDoc, file-size, routing, doctor, diff check, and clean git status passed."
  -
    type: "verify"
    at: "2026-09-15T05:02:26.309Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150452-KXG5B6"
doc_version: 3
doc_updated_at: "2026-09-15T05:02:26.386Z"
doc_updated_by: "CODER"
description: "Align Writer ODT list-style import and round-trip behavior with pinned LibreOffice upstream so documents using U+25CF and other valid bullet characters open without rejection."
sections:
  Summary: "Make ODT list-style bullet import accept and preserve valid Unicode bullet characters in parity with the pinned LibreOffice importer, fixing LibreOffice-produced documents that use U+25CF BLACK CIRCLE."
  Scope: "Update the bounded Writer numbering format model plus its ODF import/export projections and focused tests. Preserve existing list-kind behavior, public architecture, and file organization; do not broaden support for unrelated numbering attributes or list image styles."
  Plan: "1. Extend the per-level SwNumFormat state with the upstream-equivalent bullet character while retaining bullet/numbered kind semantics and compatible defaults. 2. Parse the first Unicode code point from text:bullet-char without restricting it to U+2022, propagate it through XMLTextListRule into SwNumFormat, and export the stored value. 3. Add regression coverage for LibreOffice U+25CF import and ODT round-trip, plus model persistence/conflict behavior as needed. 4. Run targeted tests and the repository verification contract, record evidence, and finish the direct-mode task."
  Verify Steps: |-
    - npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts
    - npm run format:check
    - npm run lint
    - npm run typecheck
    - npm run check:dependencies
    - npm run check:docs
    - npm run check:file-size
    - node .agentplane/policy/check-routing.mjs
    - git status --short --untracked-files=all
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T05:02:06.643Z — VERIFY — ok

    By: TESTER

    Note: Verified: focused Vitest fallback passed 19/19 tests; full npm run test:coverage passed 282/282 with 100% statements, branches, functions, and lines; format, lint, typecheck, module boundaries, JSDoc, file-size, routing, doctor, diff check, and clean git status passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T04:52:50.026Z, excerpt_hash=sha256:3e83e56c40e23d860bed26b500a985def8ac2453b13f6622df5c95e40e76f24c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150452-KXG5B6/blueprint/resolved-snapshot.json
    - old_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
    - current_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150452-KXG5B6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150452-KXG5B6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T05:02:26.309Z — VERIFY — ok

    By: CODER

    Note: verified-202609150452-KXG5B6
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T05:02:06.724Z, excerpt_hash=sha256:3e83e56c40e23d860bed26b500a985def8ac2453b13f6622df5c95e40e76f24c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150452-KXG5B6/blueprint/resolved-snapshot.json
    - old_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
    - current_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150452-KXG5B6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150452-KXG5B6 --result verified-202609150452-KXG5B6 --commit a3165f81ebaee26425d5b2702277a035eeed1566
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and Agentplane close commit; no data migration or external state is involved."
  Findings: |-
    - Observation: The originally declared focused npm command used repository-root test paths after npm changed cwd to apps/office, so Vitest found no files.
      Impact: No implementation test executed in that invocation; it was a command-path issue, not a product failure.
      Resolution: Ran the same three focused tests with workspace-relative paths (19/19 pass), then ran the complete coverage suite (282/282 pass at 100%).
id_source: "generated"
---
## Summary

Make ODT list-style bullet import accept and preserve valid Unicode bullet characters in parity with the pinned LibreOffice importer, fixing LibreOffice-produced documents that use U+25CF BLACK CIRCLE.

## Scope

Update the bounded Writer numbering format model plus its ODF import/export projections and focused tests. Preserve existing list-kind behavior, public architecture, and file organization; do not broaden support for unrelated numbering attributes or list image styles.

## Plan

1. Extend the per-level SwNumFormat state with the upstream-equivalent bullet character while retaining bullet/numbered kind semantics and compatible defaults. 2. Parse the first Unicode code point from text:bullet-char without restricting it to U+2022, propagate it through XMLTextListRule into SwNumFormat, and export the stored value. 3. Add regression coverage for LibreOffice U+25CF import and ODT round-trip, plus model persistence/conflict behavior as needed. 4. Run targeted tests and the repository verification contract, record evidence, and finish the direct-mode task.

## Verify Steps

- npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts
- npm run format:check
- npm run lint
- npm run typecheck
- npm run check:dependencies
- npm run check:docs
- npm run check:file-size
- node .agentplane/policy/check-routing.mjs
- git status --short --untracked-files=all

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T05:02:06.643Z — VERIFY — ok

By: TESTER

Note: Verified: focused Vitest fallback passed 19/19 tests; full npm run test:coverage passed 282/282 with 100% statements, branches, functions, and lines; format, lint, typecheck, module boundaries, JSDoc, file-size, routing, doctor, diff check, and clean git status passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T04:52:50.026Z, excerpt_hash=sha256:3e83e56c40e23d860bed26b500a985def8ac2453b13f6622df5c95e40e76f24c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150452-KXG5B6/blueprint/resolved-snapshot.json
- old_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
- current_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150452-KXG5B6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150452-KXG5B6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T05:02:26.309Z — VERIFY — ok

By: CODER

Note: verified-202609150452-KXG5B6
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T05:02:06.724Z, excerpt_hash=sha256:3e83e56c40e23d860bed26b500a985def8ac2453b13f6622df5c95e40e76f24c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150452-KXG5B6/blueprint/resolved-snapshot.json
- old_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
- current_digest: ad07eac8a44f17d7db5598fc8fa94f781d8e9fcc66b7df033e4154189f12a058
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150452-KXG5B6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150452-KXG5B6 --result verified-202609150452-KXG5B6 --commit a3165f81ebaee26425d5b2702277a035eeed1566
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and Agentplane close commit; no data migration or external state is involved.

## Findings

- Observation: The originally declared focused npm command used repository-root test paths after npm changed cwd to apps/office, so Vitest found no files.
  Impact: No implementation test executed in that invocation; it was a command-path issue, not a product failure.
  Resolution: Ran the same three focused tests with workspace-relative paths (19/19 pass), then ran the complete coverage suite (282/282 pass at 100%).
