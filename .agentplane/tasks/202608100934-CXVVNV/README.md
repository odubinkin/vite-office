---
id: "202608100934-CXVVNV"
title: "Inventory pinned LibreOffice translation catalogs into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "translations"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:35:48.036Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-10T09:44:21.908Z"
  updated_by: "REVIEWER"
  note: "Full verification, byte-stability, and exact pinned PO path comparison passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: extract all pinned translation catalogs as deterministic provenance-only records in this direct task."
  -
    author: "CODER"
    body: "Blocked: the restricted execution environment denies creation of .git/index.lock, so AgentPlane cannot persist the required task artifacts or commits."
  -
    author: "CODER"
    body: "Start: resume deterministic translation catalog extraction after Git write access was restored."
events:
  -
    type: "status"
    at: "2026-08-10T09:35:59.054Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract all pinned translation catalogs as deterministic provenance-only records in this direct task."
  -
    type: "status"
    at: "2026-08-10T09:36:49.190Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: the restricted execution environment denies creation of .git/index.lock, so AgentPlane cannot persist the required task artifacts or commits."
  -
    type: "status"
    at: "2026-08-10T09:39:36.098Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: resume deterministic translation catalog extraction after Git write access was restored."
  -
    type: "verify"
    at: "2026-08-10T09:44:21.908Z"
    author: "REVIEWER"
    state: "ok"
    note: "Full verification, byte-stability, and exact pinned PO path comparison passed."
doc_version: 3
doc_updated_at: "2026-08-10T09:44:21.976Z"
doc_updated_by: "CODER"
description: "Create deterministic provenance-only records for every pinned translations .po catalog, preserving exact paths and corpus identity without copying message content or claiming localization parity."
sections:
  Summary: |-
    Inventory pinned LibreOffice translation catalogs into atomic records

    Create deterministic provenance-only records for every pinned translations .po catalog, preserving exact paths and corpus identity without copying message content or claiming localization parity.
  Scope: |-
    In scope:
    - Add typed translation-catalog contracts, deterministic extraction, a strict explicit-output CLI, unit and CLI tests, package script, generated JSON, and program documentation.
    - Derive exactly one provenance-only record for each Git-tracked `source/<locale>/**/*.po` path in the pinned translations corpus at commit `362fd2cb41c5404e3712db9fad55b2357001e1f3`.
    - Preserve exact paths, locale, pinned commit, stable IDs, deterministic ordering, and `mappingStatus: "unmapped"`.

    Out of scope:
    - Reading or copying PO message bodies, mapping individual strings to UI behavior, adding local translations, changing parity-matrix status, or modifying other corpus extractors.
  Plan: |-
    1. Inspect the pinned translations checkout and codify the exact 25,699-path `.po` catalog contract.
    2. Add small TypeScript modules for catalog record generation and a strict CLI that validates the four-corpus baseline before writing canonical JSON.
    3. Cover success, ordering, count and duplicate guards, option parsing, and the real local Git/filesystem path at 100% inventory-tool coverage.
    4. Generate the tracked artifact and document its provenance-only boundary and regeneration command.
    5. Prove byte stability and exact equality with `git ls-files`, run the full project checks, record verification, and close the task.
  Verify Steps: |-
    1. Run `npm run typecheck:tools`, `npm run lint`, `npm run check:docs`, and `npm run check:file-size`. Expected: all pass with complete JSDoc and no authored file above the enforced size threshold.
    2. Run `npm run test:inventory:coverage`. Expected: every inventory-tool coverage metric is exactly 100%, including translation extractor and CLI paths.
    3. Regenerate `docs/program/inventory/translation-catalogs.json` twice from the pinned baseline and compare SHA-256 values. Expected: byte-identical canonical UTF-8 output.
    4. Compare generated `referencePath` values with `git -C vendor/libreoffice-reference/translations ls-files -z`. Expected: exactly 25,699 unique `.po` paths under `source/`, correct pinned translations commit, derived locale, stable IDs, and only `unmapped` records.
    5. Run `npm run verify`, `agentplane doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: full project and AgentPlane routing checks pass, and no ignored reference path is tracked.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T09:44:21.908Z — VERIFY — ok

    By: REVIEWER

    Note: Full verification, byte-stability, and exact pinned PO path comparison passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:39:36.098Z, excerpt_hash=sha256:57e577226b934bea840b3de0f1c695668b1897cec216932a5b3a9c747d5f90b7

    Details:

    npm run verify passed: format, lint, tool and app type checks, app and inventory coverage at 100%, Playwright E2E, static build, JSDoc, and file-size checks. Regeneration twice produced SHA-256 7a50f67e0d407682070e1a9e68c31212526fd110619d425bf3625b84f29ccd37; exact Git comparison confirmed 25,699 source/<locale> PO paths across 131 locales at translations commit 362fd2cb41c5404e3712db9fad55b2357001e1f3. ap doctor and policy routing also passed.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100934-CXVVNV/blueprint/resolved-snapshot.json
    - old_digest: e9bd09035b6f88c7dfd9708ad6ad8c0c7e4768abca76667f47e94687ded0d255
    - current_digest: e9bd09035b6f88c7dfd9708ad6ad8c0c7e4768abca76667f47e94687ded0d255
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100934-CXVVNV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100934-CXVVNV
    - diagnostic_command: agentplane task run status 202608100934-CXVVNV
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation and task-artifact commits for this task, remove the generated translation-catalog inventory with that revert, then rerun `npm run verify`. The pinned ignored checkout and existing core-module, core-test, and help-topic inventories are not modified by this task."
  Findings: |-
    - Observation: AgentPlane artifact-persistence commit could not create .git/index.lock under the restricted execution sandbox.
      Impact: No implementation files were staged or committed; task start artifacts remain unpersisted.
      Resolution: Use the permitted local Git staging path for the active task and retry the AgentPlane commit without changing scope.

    - Observation: The deterministic catalog inventory contains every tracked PO path in the pinned translations corpus.
      Impact: Message content, licensing, locale behavior, and local UI mappings remain intentionally unmapped.
      Resolution: A later atomic message-mapping task must resolve every LO-TRANSLATION-CATALOG record.
id_source: "generated"
---
## Summary

Inventory pinned LibreOffice translation catalogs into atomic records

Create deterministic provenance-only records for every pinned translations .po catalog, preserving exact paths and corpus identity without copying message content or claiming localization parity.

## Scope

In scope:
- Add typed translation-catalog contracts, deterministic extraction, a strict explicit-output CLI, unit and CLI tests, package script, generated JSON, and program documentation.
- Derive exactly one provenance-only record for each Git-tracked `source/<locale>/**/*.po` path in the pinned translations corpus at commit `362fd2cb41c5404e3712db9fad55b2357001e1f3`.
- Preserve exact paths, locale, pinned commit, stable IDs, deterministic ordering, and `mappingStatus: "unmapped"`.

Out of scope:
- Reading or copying PO message bodies, mapping individual strings to UI behavior, adding local translations, changing parity-matrix status, or modifying other corpus extractors.

## Plan

1. Inspect the pinned translations checkout and codify the exact 25,699-path `.po` catalog contract.
2. Add small TypeScript modules for catalog record generation and a strict CLI that validates the four-corpus baseline before writing canonical JSON.
3. Cover success, ordering, count and duplicate guards, option parsing, and the real local Git/filesystem path at 100% inventory-tool coverage.
4. Generate the tracked artifact and document its provenance-only boundary and regeneration command.
5. Prove byte stability and exact equality with `git ls-files`, run the full project checks, record verification, and close the task.

## Verify Steps

1. Run `npm run typecheck:tools`, `npm run lint`, `npm run check:docs`, and `npm run check:file-size`. Expected: all pass with complete JSDoc and no authored file above the enforced size threshold.
2. Run `npm run test:inventory:coverage`. Expected: every inventory-tool coverage metric is exactly 100%, including translation extractor and CLI paths.
3. Regenerate `docs/program/inventory/translation-catalogs.json` twice from the pinned baseline and compare SHA-256 values. Expected: byte-identical canonical UTF-8 output.
4. Compare generated `referencePath` values with `git -C vendor/libreoffice-reference/translations ls-files -z`. Expected: exactly 25,699 unique `.po` paths under `source/`, correct pinned translations commit, derived locale, stable IDs, and only `unmapped` records.
5. Run `npm run verify`, `agentplane doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: full project and AgentPlane routing checks pass, and no ignored reference path is tracked.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T09:44:21.908Z — VERIFY — ok

By: REVIEWER

Note: Full verification, byte-stability, and exact pinned PO path comparison passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:39:36.098Z, excerpt_hash=sha256:57e577226b934bea840b3de0f1c695668b1897cec216932a5b3a9c747d5f90b7

Details:

npm run verify passed: format, lint, tool and app type checks, app and inventory coverage at 100%, Playwright E2E, static build, JSDoc, and file-size checks. Regeneration twice produced SHA-256 7a50f67e0d407682070e1a9e68c31212526fd110619d425bf3625b84f29ccd37; exact Git comparison confirmed 25,699 source/<locale> PO paths across 131 locales at translations commit 362fd2cb41c5404e3712db9fad55b2357001e1f3. ap doctor and policy routing also passed.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100934-CXVVNV/blueprint/resolved-snapshot.json
- old_digest: e9bd09035b6f88c7dfd9708ad6ad8c0c7e4768abca76667f47e94687ded0d255
- current_digest: e9bd09035b6f88c7dfd9708ad6ad8c0c7e4768abca76667f47e94687ded0d255
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100934-CXVVNV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100934-CXVVNV
- diagnostic_command: agentplane task run status 202608100934-CXVVNV
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation and task-artifact commits for this task, remove the generated translation-catalog inventory with that revert, then rerun `npm run verify`. The pinned ignored checkout and existing core-module, core-test, and help-topic inventories are not modified by this task.

## Findings

- Observation: AgentPlane artifact-persistence commit could not create .git/index.lock under the restricted execution sandbox.
  Impact: No implementation files were staged or committed; task start artifacts remain unpersisted.
  Resolution: Use the permitted local Git staging path for the active task and retry the AgentPlane commit without changing scope.

- Observation: The deterministic catalog inventory contains every tracked PO path in the pinned translations corpus.
  Impact: Message content, licensing, locale behavior, and local UI mappings remain intentionally unmapped.
  Resolution: A later atomic message-mapping task must resolve every LO-TRANSLATION-CATALOG record.
