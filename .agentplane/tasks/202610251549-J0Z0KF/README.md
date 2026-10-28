---
id: "202610251549-J0Z0KF"
title: "Implement Calc XLSX import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202610251549-R2DJ64"
tags:
  - "code"
  - "xlsx"
verify:
  - "XLSX upstream-fixture import and export/reopen covering supported cell types/formulas/styles/dimensions/sheets, malformed packages and shell stale-result handling; mounted and browser Open/download; related ODS tests and quality gates."
plan_approval:
  state: "approved"
  updated_at: "2026-10-28T06:56:50.033Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-10-28T08:25:39.248Z"
  updated_by: "CODER"
  note: "Bounded native cached-result/XML checkpoint: 55 focused, 749 related Calc/ODS, 76 shared and 2 native-format tests pass; three new Excel filter owners 100%. Whole ScFormulaCell/OUString coverage profiles fail unchanged gates. Full XLSX workbook/import/export/filter/UI and DOCX acceptance remain pending. Blob-bound details: evidence/native-excel-cached-xml-checkpoint.json. Typecheck/static/lint/format/dependencies/docs/size/source-tree/resources/provenance/registry/doctor/routing/diff pass; existing hook warning retained."
  attempts: 2
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Resume user-approved XLSX import/export work after the merge; begin native address and range prerequisites, preserve existing ODS/CSV and browser persistence behavior, and record bounded evidence without whole-format readiness claims."
events:
  -
    type: "status"
    at: "2026-10-28T06:57:27.536Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Resume user-approved XLSX import/export work after the merge; begin native address and range prerequisites, preserve existing ODS/CSV and browser persistence behavior, and record bounded evidence without whole-format readiness claims."
  -
    type: "verify"
    at: "2026-10-28T07:48:55.121Z"
    author: "CODER"
    state: "needs_rework"
    note: "Prerequisite checkpoint only: local Excel A1/OOXML address/range contracts have322 passing related tests and passing static/type/provenance/registry checks. Unchanged scoped100 fails two retained singleton alternatives (branches420/422); complete XLSX package/model and existing UI acceptance are pending. Do not mark the task complete or claim whole-format readiness."
  -
    type: "verify"
    at: "2026-10-28T08:25:39.248Z"
    author: "CODER"
    state: "needs_rework"
    note: "Bounded native cached-result/XML checkpoint: 55 focused, 749 related Calc/ODS, 76 shared and 2 native-format tests pass; three new Excel filter owners 100%. Whole ScFormulaCell/OUString coverage profiles fail unchanged gates. Full XLSX workbook/import/export/filter/UI and DOCX acceptance remain pending. Blob-bound details: evidence/native-excel-cached-xml-checkpoint.json. Typecheck/static/lint/format/dependencies/docs/size/source-tree/resources/provenance/registry/doctor/routing/diff pass; existing hook warning retained."
doc_version: 3
doc_updated_at: "2026-10-28T08:25:39.303Z"
doc_updated_by: "CODER"
description: "User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only."
sections:
  Summary: |-
    Implement Calc XLSX import export and existing file UI integration

    User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.
  Scope: |-
    - In scope: User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.
    - Out of scope: unrelated refactors not required for "Implement Calc XLSX import export and existing file UI integration".
  Plan: "Continue the already user-approved XLSX work: (1) implement native address/range, workbook/worksheet, shared-string, style and formula owners against the pinned source with original contracts and limits, replacing touched shortcuts; (2) route actual ScDocument import/export through ExcelFilter and the existing shell/file UI while preserving browser storage, recovery and autosave decisions; (3) verify supported-model upstream-fixture roundtrips, failure/stale-result behavior, browser download/reopen and targeted quality gates; (4) record suspected native issues without changing their semantics and finish only after complete acceptance. Work locally in the direct checkout; no publication or merge. Cohesive prerequisite checkpoints may be committed with explicit remaining gaps."
  Verify Steps: "Run focused Calc and shared tests for the implemented XLSX owners, including source-backed address/parser boundaries, then actual workbook import and export/reopen over committed Strict and Transitional upstream fixtures covering supported cells, types, formulas, formatting, dimensions and multiple sheets. Assert canonical ScDocument values and package XML; malformed input must preserve the active graph. Verify shell filter routing, cancellation and stale results, primary ODS state, mounted Open/download flows and actual desktop/mobile Chromium download/reopen. Require unchanged scoped100 coverage for newly implemented executable mechanisms and related ODS/CSV regressions. Run typecheck, production build/static checks, scoped ESLint/Prettier, dependencies/resources/docs/size/source-tree/provenance/registry/invariants/parity, doctor/routing/diff. Record bounded prerequisite checkpoints honestly without marking the whole task verified or complete. Full suites only at the approved ten-task cadence."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-28T07:48:55.121Z — VERIFY — needs_rework

    By: CODER

    Note: Prerequisite checkpoint only: local Excel A1/OOXML address/range contracts have322 passing related tests and passing static/type/provenance/registry checks. Unchanged scoped100 fails two retained singleton alternatives (branches420/422); complete XLSX package/model and existing UI acceptance are pending. Do not mark the task complete or claim whole-format readiness.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-28T07:48:54.574Z, excerpt_hash=sha256:ad33e433164633c6aca7716df642529eebfd3956c9f99fac41732f1502594dcb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-J0Z0KF/blueprint/resolved-snapshot.json
    - old_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
    - current_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251549-J0Z0KF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251549-J0Z0KF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-28T08:25:39.248Z — VERIFY — needs_rework

    By: CODER

    Note: Bounded native cached-result/XML checkpoint: 55 focused, 749 related Calc/ODS, 76 shared and 2 native-format tests pass; three new Excel filter owners 100%. Whole ScFormulaCell/OUString coverage profiles fail unchanged gates. Full XLSX workbook/import/export/filter/UI and DOCX acceptance remain pending. Blob-bound details: evidence/native-excel-cached-xml-checkpoint.json. Typecheck/static/lint/format/dependencies/docs/size/source-tree/resources/provenance/registry/doctor/routing/diff pass; existing hook warning retained.
    Attempts: 2

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-28T08:25:38.764Z, excerpt_hash=sha256:ad33e433164633c6aca7716df642529eebfd3956c9f99fac41732f1502594dcb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-J0Z0KF/blueprint/resolved-snapshot.json
    - old_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
    - current_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251549-J0Z0KF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251549-J0Z0KF
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
    - Observation: Resumed after user-confirmed merge on main. The earlier three-task plan already authorized XLSX; replaced its PLANNER scaffold with executable acceptance criteria, recorded approval and started the real Calc task. Local Excel A1/OOXML ScAddress and ScRange parsing/formatting and ParseAny are now implemented against pinned address.cxx, retaining partial mutation, unsorted endpoints and original singleton behavior. CALC-344/345 record the source concerns. No DOCX/XLSX shell/UI readiness is claimed.
      Impact: 119 initial and 322 broader related tests passed. Final unchanged scoped100 profile passes statements429/429, functions53/53 and lines370/370 but fails branches420/422 (99.52%) on two retained original singleton alternatives. No threshold/exclusion or source decision was removed. Full workbook/filter/UI acceptance remains pending, so this is a prerequisite checkpoint and the task stays DOING.
      Resolution: Typecheck/tools+app, static production build, scoped ESLint/Prettier, docs, dependencies, file-size, source-tree, Calc resources, source provenance and complete registry/invariant evidence passed; doctor/routing/diff pass with the existing hook warning. Corrected new test literal-union annotation and two missing JSDoc comments; consolidated scanning into canonical address.ts rather than introducing a filename divergence. Preserve the original coverage gap and continue native workbook/address/filter owners; full suite is not due under the approved cadence.

    - Observation: Command: focused four-file cached XML coverage, related Calc core/XML regression and shared string coverage; exact argv and blob-bound results in evidence/native-excel-cached-xml-checkpoint.json. Result: 55 focused, 749 regression, 76 shared and 2 native-format capture tests pass. New Excel filter owners individually 100%; whole ScFormulaCell and OUString profiles FAIL unchanged scoped100 gates. CALC-346..348 retain native invalid-cache, fractional rounding and negative-zero behavior.
      Impact: Native cached-value/name/error/Unicode/XML primitives now use actual ScDocument/ScFormulaCell, SAL string and serializer/storage owners. This is a bounded prerequisite; full XLSX workbook/filter/UI acceptance and Writer DOCX remain incomplete. Earlier address branch gap remains open.
      Resolution: Keep DOING/needs_rework. Preserve coverage thresholds and upstream branches; no full format/UI claim, no full-suite cadence violation, no publication. Continue original workbook/worksheet/filter owners before shell and UI acceptance.
id_source: "generated"
---
## Summary

Implement Calc XLSX import export and existing file UI integration

User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.

## Scope

- In scope: User-approved third cohesive task: preserve pinned ExcelFilter workbook/worksheet/style/shared-string import and Excel export ownership while supporting the current Calc core slice, including cells, types, formulas, sheets, formatting and dimensions where implemented. Integrate shell filter routing and existing Open/download UI, errors/cancellation and primary ODS persistence. Record suspected upstream issues and source mappings, refactor touched workarounds and run related tests. Preserve recovery/autosave and browser file product decisions. Local work only.
- Out of scope: unrelated refactors not required for "Implement Calc XLSX import export and existing file UI integration".

## Plan

Continue the already user-approved XLSX work: (1) implement native address/range, workbook/worksheet, shared-string, style and formula owners against the pinned source with original contracts and limits, replacing touched shortcuts; (2) route actual ScDocument import/export through ExcelFilter and the existing shell/file UI while preserving browser storage, recovery and autosave decisions; (3) verify supported-model upstream-fixture roundtrips, failure/stale-result behavior, browser download/reopen and targeted quality gates; (4) record suspected native issues without changing their semantics and finish only after complete acceptance. Work locally in the direct checkout; no publication or merge. Cohesive prerequisite checkpoints may be committed with explicit remaining gaps.

## Verify Steps

Run focused Calc and shared tests for the implemented XLSX owners, including source-backed address/parser boundaries, then actual workbook import and export/reopen over committed Strict and Transitional upstream fixtures covering supported cells, types, formulas, formatting, dimensions and multiple sheets. Assert canonical ScDocument values and package XML; malformed input must preserve the active graph. Verify shell filter routing, cancellation and stale results, primary ODS state, mounted Open/download flows and actual desktop/mobile Chromium download/reopen. Require unchanged scoped100 coverage for newly implemented executable mechanisms and related ODS/CSV regressions. Run typecheck, production build/static checks, scoped ESLint/Prettier, dependencies/resources/docs/size/source-tree/provenance/registry/invariants/parity, doctor/routing/diff. Record bounded prerequisite checkpoints honestly without marking the whole task verified or complete. Full suites only at the approved ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-28T07:48:55.121Z — VERIFY — needs_rework

By: CODER

Note: Prerequisite checkpoint only: local Excel A1/OOXML address/range contracts have322 passing related tests and passing static/type/provenance/registry checks. Unchanged scoped100 fails two retained singleton alternatives (branches420/422); complete XLSX package/model and existing UI acceptance are pending. Do not mark the task complete or claim whole-format readiness.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-28T07:48:54.574Z, excerpt_hash=sha256:ad33e433164633c6aca7716df642529eebfd3956c9f99fac41732f1502594dcb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-J0Z0KF/blueprint/resolved-snapshot.json
- old_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
- current_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251549-J0Z0KF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251549-J0Z0KF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-28T08:25:39.248Z — VERIFY — needs_rework

By: CODER

Note: Bounded native cached-result/XML checkpoint: 55 focused, 749 related Calc/ODS, 76 shared and 2 native-format tests pass; three new Excel filter owners 100%. Whole ScFormulaCell/OUString coverage profiles fail unchanged gates. Full XLSX workbook/import/export/filter/UI and DOCX acceptance remain pending. Blob-bound details: evidence/native-excel-cached-xml-checkpoint.json. Typecheck/static/lint/format/dependencies/docs/size/source-tree/resources/provenance/registry/doctor/routing/diff pass; existing hook warning retained.
Attempts: 2

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-28T08:25:38.764Z, excerpt_hash=sha256:ad33e433164633c6aca7716df642529eebfd3956c9f99fac41732f1502594dcb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-J0Z0KF/blueprint/resolved-snapshot.json
- old_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
- current_digest: c951e9f04e9782a01c8343dadffb5faab7f4205d89a41b9785084f7bd1c16dd9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251549-J0Z0KF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251549-J0Z0KF
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

- Observation: Resumed after user-confirmed merge on main. The earlier three-task plan already authorized XLSX; replaced its PLANNER scaffold with executable acceptance criteria, recorded approval and started the real Calc task. Local Excel A1/OOXML ScAddress and ScRange parsing/formatting and ParseAny are now implemented against pinned address.cxx, retaining partial mutation, unsorted endpoints and original singleton behavior. CALC-344/345 record the source concerns. No DOCX/XLSX shell/UI readiness is claimed.
  Impact: 119 initial and 322 broader related tests passed. Final unchanged scoped100 profile passes statements429/429, functions53/53 and lines370/370 but fails branches420/422 (99.52%) on two retained original singleton alternatives. No threshold/exclusion or source decision was removed. Full workbook/filter/UI acceptance remains pending, so this is a prerequisite checkpoint and the task stays DOING.
  Resolution: Typecheck/tools+app, static production build, scoped ESLint/Prettier, docs, dependencies, file-size, source-tree, Calc resources, source provenance and complete registry/invariant evidence passed; doctor/routing/diff pass with the existing hook warning. Corrected new test literal-union annotation and two missing JSDoc comments; consolidated scanning into canonical address.ts rather than introducing a filename divergence. Preserve the original coverage gap and continue native workbook/address/filter owners; full suite is not due under the approved cadence.

- Observation: Command: focused four-file cached XML coverage, related Calc core/XML regression and shared string coverage; exact argv and blob-bound results in evidence/native-excel-cached-xml-checkpoint.json. Result: 55 focused, 749 regression, 76 shared and 2 native-format capture tests pass. New Excel filter owners individually 100%; whole ScFormulaCell and OUString profiles FAIL unchanged scoped100 gates. CALC-346..348 retain native invalid-cache, fractional rounding and negative-zero behavior.
  Impact: Native cached-value/name/error/Unicode/XML primitives now use actual ScDocument/ScFormulaCell, SAL string and serializer/storage owners. This is a bounded prerequisite; full XLSX workbook/filter/UI acceptance and Writer DOCX remain incomplete. Earlier address branch gap remains open.
  Resolution: Keep DOING/needs_rework. Preserve coverage thresholds and upstream branches; no full format/UI claim, no full-suite cadence violation, no publication. Continue original workbook/worksheet/filter owners before shell and UI acceptance.
