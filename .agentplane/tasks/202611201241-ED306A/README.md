---
id: "202611201241-ED306A"
title: "Align Writer ODT table cell values and formulas"
result_summary: "Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing."
status: "DONE"
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
  updated_at: "2026-11-20T12:42:09.961Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T13:38:31.829Z"
  updated_by: "CODER"
  note: "Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T13:38:18.554Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review of the committed Writer table value implementation and shared Calc data-style evidence against the pinned sources."
  evaluated_sha: "6df3d2520caafeb0de11537661677c3954f5c838"
  blueprint_digest: "ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208"
  evidence_refs:
    - ".agentplane/tasks/202611201241-ED306A/README.md"
    - ".agentplane/tasks/202611201241-ED306A/quality/20261120-133818554-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201241-ED306A/quality/20261120-133818554-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201241-ED306A/quality/20261120-133818554-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201241-ED306A/blueprint/resolved-snapshot.json"
    - "d354649d7636 and 6df3d2520caa: 26 Writer value/core tests, 8 shared XML table tests, 31 Calc tests, expanded Writer profile plus four successful retries, and office typecheck"
    - "apps/office/src/sw/source/filter/xml/odt-table-values.test.ts"
    - "docs/program/writer-upstream-suspected-issues.md"
  findings:
    - "Original ODT fixtures preserve string value precedence, cached numeric values, and explicit formula errors through their covered boundaries."
    - "The format mutation path binds the direct formula item before notification and Worker rehydrates its actual document formatter."
    - "The expanded Writer profile had four timeout-only failures and the same four cases passed in focused retries."
commit:
  hash: "6df3d2520caafeb0de11537661677c3954f5c838"
  message: "🧩 ED306A code: align shared automatic digit expectation"
comments:
  -
    author: "CODER"
    body: "Start: Route Writer ODT cell values and formulas through native table box attributes."
  -
    author: "CODER"
    body: "Verified: Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-20T12:42:18.149Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Route Writer ODT cell values and formulas through native table box attributes."
  -
    type: "verify"
    at: "2026-11-20T13:38:17.266Z"
    author: "CODER"
    state: "ok"
    note: "Writer table values, shared data styles and Worker transfer passed both pinned regressions and all targeted checks, including isolated retries of four wider-profile timeouts."
  -
    type: "verify"
    at: "2026-11-20T13:38:31.829Z"
    author: "CODER"
    state: "ok"
    note: "Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing."
  -
    type: "status"
    at: "2026-11-20T13:38:32.104Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-20T13:38:32.105Z"
doc_updated_by: "CODER"
description: "Use native Writer table box attributes for ODF numeric formats, typed values, string overrides, formula caches and protection, with ODT and Worker round-trip verification against pinned fixtures."
sections:
  Summary: |-
    Align Writer ODT table cell values and formulas

    Use native Writer table box attributes for ODF numeric formats, typed values, string overrides, formula caches and protection, with ODT and Worker round-trip verification against pinned fixtures.
  Scope: "Writer ODT table cell import and export, shared ODF table and data style contexts, native box attributes and display refresh, Writer Worker records, Writer suspected upstream issues and targeted native regression tests."
  Plan: "Read authored value attributes and styles using shared conversion contracts and apply original Writer box attributes after importing text. Preserve the native formula namespace, invalid numeric sentinel and string precedence. Export the same data and preserve native format code/language and box items across Worker records. Test the pinned fixtures and typed values with focused Writer and shared profiles."
  Verify Steps: |-
    1. Run npm run test:writer -- src/sw/source/filter/xml src/sw/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover native box value, formula, protection, data styles, string override, numeric display and package/Worker round trips.
    2. Run shared XML table and number style tests for the changed modules.
    3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T13:38:17.266Z — VERIFY — ok

    By: CODER

    Note: Writer table values, shared data styles and Worker transfer passed both pinned regressions and all targeted checks, including isolated retries of four wider-profile timeouts.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:42:18.149Z, excerpt_hash=sha256:f68842f7c9cdc191d50d1afff849461745230cb8c6be9cb8c6bd9eb5697f0336

    Details:

    Command: npm run test:writer -- src/sw/source/filter/xml src/sw/browser/filter/xml --maxWorkers 2 --testTimeout 120000
    Result: fail
    Evidence: 528 tests passed across 79 files, including all table value tests. The only four failures were 120-second timeouts in embedded fonts and list round trips. All four matching cases subsequently passed with higher time budgets, without changing production or committed assertions.
    Scope: Writer filter and Worker XML profile.

    Command: npm run test:writer -- src/sw/source/filter/xml/odt-embedded-fonts.test.ts --maxWorkers 1 --testTimeout 600000 -t "rejects malformed references"; npm run test:writer -- src/sw/source/filter/xml/odt-list-start-normalization.test.ts --maxWorkers 1 --testTimeout 600000; npm run test:writer -- src/sw/source/filter/xml/odt-list-continuation.ed306a-retry.test.ts src/sw/source/filter/xml/odt-list-implicit-restart.test.ts --maxWorkers 1 --testTimeout 900000
    Result: pass
    Evidence: Four cases passed. The continuation retry used a temporary source copy changing only its local testTimeout from 120000 to 900000. The copy was removed automatically.
    Scope: Recovery of all four environment timeouts with the same assertions.

    Command: npm run test:writer -- src/sw/source/filter/xml/odt-table-values.test.ts src/sw/source/core/table/native-box-frame-format.test.ts src/sw/source/core/attr/native-format-attribute-notify.test.ts --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 26 tests passed, including the complete unmodified fdo60842.odt and tdf139126.odt fixture contents and formula owner after Worker and ODT reopening.
    Scope: Writer numeric format and value storage, explicit missing-reference errors, protected repeated cells, and core attribute ownership.

    Command: npm run test:shared -- src/xmloff/source/table --maxWorkers 1 --testTimeout 120000; npm run test:calc -- src/sc/source/filter/xml/ods.test.ts src/sc/source/filter/xml/ods-typed-values.test.ts src/sc/source/filter/xml/ods-style-routing.test.ts --maxWorkers 1 --testTimeout 120000
    Result: pass
    Evidence: 8 shared and 31 Calc tests passed; the shared source selects the system number format when both digit counts are missing.
    Scope: Shared ODF tables and data style compatibility.

    Command: npm run typecheck --workspace @vite-office/office; scoped ESLint and Prettier; git diff --check; npm run check:dependencies; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; ap doctor
    Result: pass
    Evidence: Typecheck passed on the final production code. Static checks passed for each implementation diff. Doctor OK with the existing managed hook warning.
    Scope: Source types, formatting, dependencies, pinned source paths and routing.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201241-ED306A/blueprint/resolved-snapshot.json
    - old_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
    - current_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201241-ED306A

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201241-ED306A
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-20T13:38:31.829Z — VERIFY — ok

    By: CODER

    Note: Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T13:38:17.376Z, excerpt_hash=sha256:f68842f7c9cdc191d50d1afff849461745230cb8c6be9cb8c6bd9eb5697f0336

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201241-ED306A/blueprint/resolved-snapshot.json
    - old_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
    - current_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201241-ED306A

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611201241-ED306A --result verified-202611201241-ED306A --commit ef0317e7e6f20a28495dee6fb2def7155d231d33
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Writer table value implementation and its tests and issue records."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer ODT table cell values and formulas

Use native Writer table box attributes for ODF numeric formats, typed values, string overrides, formula caches and protection, with ODT and Worker round-trip verification against pinned fixtures.

## Scope

Writer ODT table cell import and export, shared ODF table and data style contexts, native box attributes and display refresh, Writer Worker records, Writer suspected upstream issues and targeted native regression tests.

## Plan

Read authored value attributes and styles using shared conversion contracts and apply original Writer box attributes after importing text. Preserve the native formula namespace, invalid numeric sentinel and string precedence. Export the same data and preserve native format code/language and box items across Worker records. Test the pinned fixtures and typed values with focused Writer and shared profiles.

## Verify Steps

1. Run npm run test:writer -- src/sw/source/filter/xml src/sw/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover native box value, formula, protection, data styles, string override, numeric display and package/Worker round trips.
2. Run shared XML table and number style tests for the changed modules.
3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T13:38:17.266Z — VERIFY — ok

By: CODER

Note: Writer table values, shared data styles and Worker transfer passed both pinned regressions and all targeted checks, including isolated retries of four wider-profile timeouts.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:42:18.149Z, excerpt_hash=sha256:f68842f7c9cdc191d50d1afff849461745230cb8c6be9cb8c6bd9eb5697f0336

Details:

Command: npm run test:writer -- src/sw/source/filter/xml src/sw/browser/filter/xml --maxWorkers 2 --testTimeout 120000
Result: fail
Evidence: 528 tests passed across 79 files, including all table value tests. The only four failures were 120-second timeouts in embedded fonts and list round trips. All four matching cases subsequently passed with higher time budgets, without changing production or committed assertions.
Scope: Writer filter and Worker XML profile.

Command: npm run test:writer -- src/sw/source/filter/xml/odt-embedded-fonts.test.ts --maxWorkers 1 --testTimeout 600000 -t "rejects malformed references"; npm run test:writer -- src/sw/source/filter/xml/odt-list-start-normalization.test.ts --maxWorkers 1 --testTimeout 600000; npm run test:writer -- src/sw/source/filter/xml/odt-list-continuation.ed306a-retry.test.ts src/sw/source/filter/xml/odt-list-implicit-restart.test.ts --maxWorkers 1 --testTimeout 900000
Result: pass
Evidence: Four cases passed. The continuation retry used a temporary source copy changing only its local testTimeout from 120000 to 900000. The copy was removed automatically.
Scope: Recovery of all four environment timeouts with the same assertions.

Command: npm run test:writer -- src/sw/source/filter/xml/odt-table-values.test.ts src/sw/source/core/table/native-box-frame-format.test.ts src/sw/source/core/attr/native-format-attribute-notify.test.ts --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 26 tests passed, including the complete unmodified fdo60842.odt and tdf139126.odt fixture contents and formula owner after Worker and ODT reopening.
Scope: Writer numeric format and value storage, explicit missing-reference errors, protected repeated cells, and core attribute ownership.

Command: npm run test:shared -- src/xmloff/source/table --maxWorkers 1 --testTimeout 120000; npm run test:calc -- src/sc/source/filter/xml/ods.test.ts src/sc/source/filter/xml/ods-typed-values.test.ts src/sc/source/filter/xml/ods-style-routing.test.ts --maxWorkers 1 --testTimeout 120000
Result: pass
Evidence: 8 shared and 31 Calc tests passed; the shared source selects the system number format when both digit counts are missing.
Scope: Shared ODF tables and data style compatibility.

Command: npm run typecheck --workspace @vite-office/office; scoped ESLint and Prettier; git diff --check; npm run check:dependencies; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; ap doctor
Result: pass
Evidence: Typecheck passed on the final production code. Static checks passed for each implementation diff. Doctor OK with the existing managed hook warning.
Scope: Source types, formatting, dependencies, pinned source paths and routing.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201241-ED306A/blueprint/resolved-snapshot.json
- old_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
- current_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201241-ED306A

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201241-ED306A
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-20T13:38:31.829Z — VERIFY — ok

By: CODER

Note: Writer reads and writes native ODT table values, data styles, cached formulas and protection through Worker with both pinned regressions passing.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T13:38:17.376Z, excerpt_hash=sha256:f68842f7c9cdc191d50d1afff849461745230cb8c6be9cb8c6bd9eb5697f0336

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201241-ED306A/blueprint/resolved-snapshot.json
- old_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
- current_digest: ee6920538548619a635c185344414b87c058c16a24a9b09959785eb18b802208
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201241-ED306A

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611201241-ED306A --result verified-202611201241-ED306A --commit ef0317e7e6f20a28495dee6fb2def7155d231d33
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Writer table value implementation and its tests and issue records.

## Findings
