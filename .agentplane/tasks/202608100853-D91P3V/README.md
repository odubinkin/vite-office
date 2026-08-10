---
id: "202608100853-D91P3V"
title: "Inventory pinned LibreOffice core build modules into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202608100830-MT7ETT"
tags:
  - "core"
  - "inventory"
  - "libreoffice"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T08:53:54.837Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
verification:
  state: "ok"
  updated_at: "2026-08-10T09:04:17.229Z"
  updated_by: "CODER"
  note: "Verified deterministic 237-record core module inventory, exact Git path equality, 100% inventory coverage, and full project verification."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: inventory every pinned core Module_*.mk declaration into deterministic unmapped records with complete provenance and coverage."
events:
  -
    type: "status"
    at: "2026-08-10T08:53:55.144Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inventory every pinned core Module_*.mk declaration into deterministic unmapped records with complete provenance and coverage."
  -
    type: "verify"
    at: "2026-08-10T09:04:17.229Z"
    author: "CODER"
    state: "ok"
    note: "Verified deterministic 237-record core module inventory, exact Git path equality, 100% inventory coverage, and full project verification."
doc_version: 3
doc_updated_at: "2026-08-10T09:04:17.313Z"
doc_updated_by: "CODER"
description: "Extend the deterministic inventory tool with a fully documented and covered extractor for every pinned core Module_*.mk declaration, generate a canonical tracked module inventory with corpus/commit provenance, and expose unmapped module records for later source, test, and documentation mapping."
sections:
  Summary: |-
    Inventory pinned LibreOffice core build modules into atomic records

    Extend the deterministic inventory tool with a fully documented and covered extractor for every pinned core Module_*.mk declaration, generate a canonical tracked module inventory with corpus/commit provenance, and expose unmapped module records for later source, test, and documentation mapping.
  Scope: |-
    In scope:
    - Extend scripts/libreoffice-inventory with a read-only extractor for every pinned core file named Module_*.mk.
    - Generate one canonical tracked JSON record per declaration with core corpus, pinned commit, exact reference-relative path, normalized module name, and unmapped mapping status.
    - Add 100% covered tests, command wiring, schema documentation, and roadmap/matrix handoff.

    Out of scope:
    - Parsing full make syntax, copying source content, mapping a module to a user capability, or changing any parity-matrix row to mapped/implemented/verified.
    - Extracting upstream tests, help, translations, dictionaries, or application features; each has a separate bounded task.
  Plan: |-
    1. Inspect the pinned Module_*.mk declaration set and define a small canonical module-record schema.
    2. Implement read-only discovery, validation against the baseline core identity, deterministic JSON serialization, and fully covered unit tests.
    3. Generate and review the exact tracked core module inventory; document its provenance and unmapped handoff.
    4. Run focused and full quality gates, persist evidence, perform evaluator review, and close the task.
  Verify Steps: |-
    1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — strict tooling, complete JSDoc, linting, and size policy pass.
    2. npm run test:inventory:coverage — all executable inventory code, including module discovery, has 100% statement, branch, function, and line coverage.
    3. npm run --silent inventory:modules -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-modules.json — regenerates canonical valid JSON whose 237 records exactly match the pinned core Module_*.mk file set.
    4. Run step 3 twice and byte-compare output; validate lexicographic paths, unique IDs, core corpus/commit provenance, and mappingStatus=unmapped on every record.
    5. npm run verify — full existing project quality suite remains green.
    6. Resolve changed local Markdown links; require git diff --check and no tracked vendor/libreoffice-reference path; inspect the generated records and docs for no source/test/docs/coverage parity claim.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T09:04:17.229Z — VERIFY — ok

    By: CODER

    Note: Verified deterministic 237-record core module inventory, exact Git path equality, 100% inventory coverage, and full project verification.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T08:53:55.144Z, excerpt_hash=sha256:96d6bf93e0e019eb0b9e2a77788037ed5085ed2ef75f125e99ab54dfe149a6a9

    Details:

    Command: npm run verify
    Result: pass
    Evidence: format, lint, type checks, app coverage 100%, inventory coverage 100% (205 statements, 116 branches, 58 functions, 203 lines), static E2E, static build, JSDoc, and file-size gates passed.
    Scope: full repository quality suite.

    Command: npm run --silent inventory:modules -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-modules.json (twice)
    Result: pass
    Evidence: byte-identical output; schemaVersion=1, generatedBy=inventory:modules, coreCommit=9bc445578031fecf56086729d8e4940c77e14d65, 237 unique records exactly equal to live Git Module_*.mk paths; every record is core/provenance-complete/unmapped.
    Scope: pinned core build-module declaration corpus.

    Command: Markdown link resolver, git diff --check, git ls-files vendor/libreoffice-reference
    Result: pass
    Evidence: changed local links resolve; no whitespace defects; ignored reference content remains untracked.
    Scope: task documentation, generated artifact, and repository boundary.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100853-D91P3V/blueprint/resolved-snapshot.json
    - old_digest: 78df4eabcf7ed22a6dd6bd1053456bb8561d8c3891fab3d6af8c291b9073c5c4
    - current_digest: 78df4eabcf7ed22a6dd6bd1053456bb8561d8c3891fab3d6af8c291b9073c5c4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100853-D91P3V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100853-D91P3V
    - diagnostic_command: agentplane task run status 202608100853-D91P3V
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task’s extractor, tests, generated module inventory, command wiring, and inventory documentation. Never modify or delete the ignored LibreOffice checkout. Re-run the baseline validator and project verification after rollback."
  Findings: ""
id_source: "generated"
---
## Summary

Inventory pinned LibreOffice core build modules into atomic records

Extend the deterministic inventory tool with a fully documented and covered extractor for every pinned core Module_*.mk declaration, generate a canonical tracked module inventory with corpus/commit provenance, and expose unmapped module records for later source, test, and documentation mapping.

## Scope

In scope:
- Extend scripts/libreoffice-inventory with a read-only extractor for every pinned core file named Module_*.mk.
- Generate one canonical tracked JSON record per declaration with core corpus, pinned commit, exact reference-relative path, normalized module name, and unmapped mapping status.
- Add 100% covered tests, command wiring, schema documentation, and roadmap/matrix handoff.

Out of scope:
- Parsing full make syntax, copying source content, mapping a module to a user capability, or changing any parity-matrix row to mapped/implemented/verified.
- Extracting upstream tests, help, translations, dictionaries, or application features; each has a separate bounded task.

## Plan

1. Inspect the pinned Module_*.mk declaration set and define a small canonical module-record schema.
2. Implement read-only discovery, validation against the baseline core identity, deterministic JSON serialization, and fully covered unit tests.
3. Generate and review the exact tracked core module inventory; document its provenance and unmapped handoff.
4. Run focused and full quality gates, persist evidence, perform evaluator review, and close the task.

## Verify Steps

1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — strict tooling, complete JSDoc, linting, and size policy pass.
2. npm run test:inventory:coverage — all executable inventory code, including module discovery, has 100% statement, branch, function, and line coverage.
3. npm run --silent inventory:modules -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-modules.json — regenerates canonical valid JSON whose 237 records exactly match the pinned core Module_*.mk file set.
4. Run step 3 twice and byte-compare output; validate lexicographic paths, unique IDs, core corpus/commit provenance, and mappingStatus=unmapped on every record.
5. npm run verify — full existing project quality suite remains green.
6. Resolve changed local Markdown links; require git diff --check and no tracked vendor/libreoffice-reference path; inspect the generated records and docs for no source/test/docs/coverage parity claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T09:04:17.229Z — VERIFY — ok

By: CODER

Note: Verified deterministic 237-record core module inventory, exact Git path equality, 100% inventory coverage, and full project verification.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T08:53:55.144Z, excerpt_hash=sha256:96d6bf93e0e019eb0b9e2a77788037ed5085ed2ef75f125e99ab54dfe149a6a9

Details:

Command: npm run verify
Result: pass
Evidence: format, lint, type checks, app coverage 100%, inventory coverage 100% (205 statements, 116 branches, 58 functions, 203 lines), static E2E, static build, JSDoc, and file-size gates passed.
Scope: full repository quality suite.

Command: npm run --silent inventory:modules -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-modules.json (twice)
Result: pass
Evidence: byte-identical output; schemaVersion=1, generatedBy=inventory:modules, coreCommit=9bc445578031fecf56086729d8e4940c77e14d65, 237 unique records exactly equal to live Git Module_*.mk paths; every record is core/provenance-complete/unmapped.
Scope: pinned core build-module declaration corpus.

Command: Markdown link resolver, git diff --check, git ls-files vendor/libreoffice-reference
Result: pass
Evidence: changed local links resolve; no whitespace defects; ignored reference content remains untracked.
Scope: task documentation, generated artifact, and repository boundary.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100853-D91P3V/blueprint/resolved-snapshot.json
- old_digest: 78df4eabcf7ed22a6dd6bd1053456bb8561d8c3891fab3d6af8c291b9073c5c4
- current_digest: 78df4eabcf7ed22a6dd6bd1053456bb8561d8c3891fab3d6af8c291b9073c5c4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100853-D91P3V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100853-D91P3V
- diagnostic_command: agentplane task run status 202608100853-D91P3V
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task’s extractor, tests, generated module inventory, command wiring, and inventory documentation. Never modify or delete the ignored LibreOffice checkout. Re-run the baseline validator and project verification after rollback.

## Findings
