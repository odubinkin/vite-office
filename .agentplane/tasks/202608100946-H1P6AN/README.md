---
id: "202608100946-H1P6AN"
title: "Inventory pinned LibreOffice dictionary files into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "dictionaries"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:47:02.166Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-10T09:58:12.817Z"
  updated_by: "REVIEWER"
  note: "Full verification, byte-stability, and exact pinned AFF/DIC path comparison passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: extract every pinned dictionary AFF and DIC file into deterministic provenance-only records."
events:
  -
    type: "status"
    at: "2026-08-10T09:47:10.838Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract every pinned dictionary AFF and DIC file into deterministic provenance-only records."
  -
    type: "verify"
    at: "2026-08-10T09:58:12.817Z"
    author: "REVIEWER"
    state: "ok"
    note: "Full verification, byte-stability, and exact pinned AFF/DIC path comparison passed."
doc_version: 3
doc_updated_at: "2026-08-10T09:58:13.055Z"
doc_updated_by: "CODER"
description: "Create deterministic provenance-only records for every pinned dictionaries .aff and .dic file, preserving exact paths, type, and package identity without copying lexical data or claiming language-tool parity."
sections:
  Summary: |-
    Inventory pinned LibreOffice dictionary files into atomic records

    Create deterministic provenance-only records for every pinned dictionaries .aff and .dic file, preserving exact paths, type, and package identity without copying lexical data or claiming language-tool parity.
  Scope: |-
    In scope:
    - Add typed dictionary-file contracts, deterministic extraction, a strict explicit-output CLI, unit and CLI tests, package script, generated JSON, and program documentation.
    - Derive exactly one provenance-only record for each Git-tracked `.aff` or `.dic` path in the pinned dictionaries corpus at commit `3324dee0a221a5cb67525c533216d33b0aed08e9`.
    - Preserve exact paths, file type, path-derived package, pinned commit, stable IDs, deterministic ordering, and `mappingStatus: "unmapped"`.

    Out of scope:
    - Reading or copying word lists, affix rules, hyphenation data, mapping language behavior, adding local dictionaries, changing parity-matrix status, or modifying other corpus extractors.
  Plan: |-
    1. Codify the exact 245-file contract: 98 `.aff` and 147 `.dic` paths in the pinned dictionaries corpus.
    2. Add small TypeScript modules for record generation and a strict CLI that validates the four-corpus baseline before writing canonical JSON.
    3. Cover success, ordering, kind counts, duplicate rejection, option parsing, and the real local Git/filesystem path at 100% inventory-tool coverage.
    4. Generate the tracked artifact and document its provenance-only boundary and regeneration command.
    5. Prove byte stability and exact equality with `git ls-files`, run the full project checks, record verification, and close the task.
  Verify Steps: |-
    1. Run `npm run typecheck:tools`, `npm run lint`, `npm run check:docs`, and `npm run check:file-size`. Expected: all pass with complete JSDoc and no authored file above the enforced size threshold.
    2. Run `npm run test:inventory:coverage`. Expected: every inventory-tool coverage metric is exactly 100%, including dictionary extractor and CLI paths.
    3. Regenerate `docs/program/inventory/dictionary-files.json` twice from the pinned baseline and compare SHA-256 values. Expected: byte-identical canonical UTF-8 output.
    4. Compare generated `referencePath` values with `git -C vendor/libreoffice-reference/dictionaries ls-files -z`. Expected: exactly 245 unique `.aff` or `.dic` paths, 98 AFF records, 147 DIC records, correct pinned dictionaries commit, path-derived package, stable IDs, and only `unmapped` records.
    5. Run `npm run verify`, `agentplane doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: full project and AgentPlane routing checks pass, and no ignored reference path is tracked.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T09:58:12.817Z — VERIFY — ok

    By: REVIEWER

    Note: Full verification, byte-stability, and exact pinned AFF/DIC path comparison passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:47:10.838Z, excerpt_hash=sha256:0358b27360a319b292b8a5e9073696ca39efe15f8cfe23a7ec0abe3b7462c2f8

    Details:

    npm run verify passed: format, lint, type checks, app and inventory coverage at 100%, Playwright E2E, static build, JSDoc, and file-size checks. Regeneration twice produced SHA-256 56027b0130f30414c36174d442593dbe1b345d23252574fe76918dcb0d2e2420; exact Git comparison confirmed 245 AFF/DIC paths with 98 AFF and 147 DIC files at dictionaries commit 3324dee0a221a5cb67525c533216d33b0aed08e9.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100946-H1P6AN/blueprint/resolved-snapshot.json
    - old_digest: fbd7ba9179aaad8867d6316e6c70c10c9078f279f2fdd2efb61594fe55212cce
    - current_digest: fbd7ba9179aaad8867d6316e6c70c10c9078f279f2fdd2efb61594fe55212cce
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100946-H1P6AN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100946-H1P6AN
    - diagnostic_command: agentplane task run status 202608100946-H1P6AN
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation and task-artifact commits for this task, remove the generated dictionary-file inventory with that revert, then rerun `npm run verify`. The pinned ignored checkout and existing inventories are not modified by this task."
  Findings: |-
    - Observation: The deterministic dictionary inventory contains every matching pinned AFF and DIC path.
      Impact: Lexical data, licensing, language behavior, and local language-tool mappings remain intentionally unmapped.
      Resolution: A later atomic mapping task must resolve every LO-DICTIONARY-FILE record.
id_source: "generated"
---
## Summary

Inventory pinned LibreOffice dictionary files into atomic records

Create deterministic provenance-only records for every pinned dictionaries .aff and .dic file, preserving exact paths, type, and package identity without copying lexical data or claiming language-tool parity.

## Scope

In scope:
- Add typed dictionary-file contracts, deterministic extraction, a strict explicit-output CLI, unit and CLI tests, package script, generated JSON, and program documentation.
- Derive exactly one provenance-only record for each Git-tracked `.aff` or `.dic` path in the pinned dictionaries corpus at commit `3324dee0a221a5cb67525c533216d33b0aed08e9`.
- Preserve exact paths, file type, path-derived package, pinned commit, stable IDs, deterministic ordering, and `mappingStatus: "unmapped"`.

Out of scope:
- Reading or copying word lists, affix rules, hyphenation data, mapping language behavior, adding local dictionaries, changing parity-matrix status, or modifying other corpus extractors.

## Plan

1. Codify the exact 245-file contract: 98 `.aff` and 147 `.dic` paths in the pinned dictionaries corpus.
2. Add small TypeScript modules for record generation and a strict CLI that validates the four-corpus baseline before writing canonical JSON.
3. Cover success, ordering, kind counts, duplicate rejection, option parsing, and the real local Git/filesystem path at 100% inventory-tool coverage.
4. Generate the tracked artifact and document its provenance-only boundary and regeneration command.
5. Prove byte stability and exact equality with `git ls-files`, run the full project checks, record verification, and close the task.

## Verify Steps

1. Run `npm run typecheck:tools`, `npm run lint`, `npm run check:docs`, and `npm run check:file-size`. Expected: all pass with complete JSDoc and no authored file above the enforced size threshold.
2. Run `npm run test:inventory:coverage`. Expected: every inventory-tool coverage metric is exactly 100%, including dictionary extractor and CLI paths.
3. Regenerate `docs/program/inventory/dictionary-files.json` twice from the pinned baseline and compare SHA-256 values. Expected: byte-identical canonical UTF-8 output.
4. Compare generated `referencePath` values with `git -C vendor/libreoffice-reference/dictionaries ls-files -z`. Expected: exactly 245 unique `.aff` or `.dic` paths, 98 AFF records, 147 DIC records, correct pinned dictionaries commit, path-derived package, stable IDs, and only `unmapped` records.
5. Run `npm run verify`, `agentplane doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: full project and AgentPlane routing checks pass, and no ignored reference path is tracked.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T09:58:12.817Z — VERIFY — ok

By: REVIEWER

Note: Full verification, byte-stability, and exact pinned AFF/DIC path comparison passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:47:10.838Z, excerpt_hash=sha256:0358b27360a319b292b8a5e9073696ca39efe15f8cfe23a7ec0abe3b7462c2f8

Details:

npm run verify passed: format, lint, type checks, app and inventory coverage at 100%, Playwright E2E, static build, JSDoc, and file-size checks. Regeneration twice produced SHA-256 56027b0130f30414c36174d442593dbe1b345d23252574fe76918dcb0d2e2420; exact Git comparison confirmed 245 AFF/DIC paths with 98 AFF and 147 DIC files at dictionaries commit 3324dee0a221a5cb67525c533216d33b0aed08e9.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100946-H1P6AN/blueprint/resolved-snapshot.json
- old_digest: fbd7ba9179aaad8867d6316e6c70c10c9078f279f2fdd2efb61594fe55212cce
- current_digest: fbd7ba9179aaad8867d6316e6c70c10c9078f279f2fdd2efb61594fe55212cce
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100946-H1P6AN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100946-H1P6AN
- diagnostic_command: agentplane task run status 202608100946-H1P6AN
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation and task-artifact commits for this task, remove the generated dictionary-file inventory with that revert, then rerun `npm run verify`. The pinned ignored checkout and existing inventories are not modified by this task.

## Findings

- Observation: The deterministic dictionary inventory contains every matching pinned AFF and DIC path.
  Impact: Lexical data, licensing, language behavior, and local language-tool mappings remain intentionally unmapped.
  Resolution: A later atomic mapping task must resolve every LO-DICTIONARY-FILE record.
