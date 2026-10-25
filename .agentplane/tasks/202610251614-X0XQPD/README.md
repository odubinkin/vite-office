---
id: "202610251614-X0XQPD"
title: "Implement native Writer RTF import export and UI filters"
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
  updated_at: "2026-10-25T16:15:14.416Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-25T16:32:38.094Z"
  updated_by: "CODER"
  note: "verified-202610251614-X0XQPD"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-25T16:32:46.034Z"
  updated_by: "EVALUATOR"
  note: "Native RTF Writer filter slice and UI routes satisfy approved scope and focused checks."
  evaluated_sha: "cd6b2776166f87bac38b14caf1d6a7bd0c9472f7"
  blueprint_digest: "70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40"
  evidence_refs:
    - ".agentplane/tasks/202610251614-X0XQPD/README.md"
    - ".agentplane/tasks/202610251614-X0XQPD/quality/20261025-163246034-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610251614-X0XQPD/quality/20261025-163246034-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610251614-X0XQPD/quality/20261025-163246034-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610251614-X0XQPD/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/ww8/rtfexport.test.ts"
    - "apps/office/src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts"
    - "apps/office/src/sw/browser/presentation/WriterFileDialog.test.tsx"
  findings:
    - "RTF tokenizer, import, export, shell atomic Open and browser Open/Export are integrated; 43 focused tests, typecheck, lint, formatting, provenance, registry and dependency checks pass. Unsupported upstream destinations are recorded as unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement upstream-shaped native RTF reader and writer through the Writer shell and existing browser UI."
events:
  -
    type: "status"
    at: "2026-10-25T16:15:20.700Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-shaped native RTF reader and writer through the Writer shell and existing browser UI."
  -
    type: "verify"
    at: "2026-10-25T16:32:18.993Z"
    author: "CODER"
    state: "ok"
    note: "Native RTF import/export and UI verified: 43 focused tests, typecheck, formatting, ESLint, source provenance, Writer inventory, dependency boundaries; bounded upstream omissions recorded in Findings."
  -
    type: "verify"
    at: "2026-10-25T16:32:38.094Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610251614-X0XQPD"
doc_version: 3
doc_updated_at: "2026-10-25T16:32:38.152Z"
doc_updated_by: "CODER"
description: "Port the represented upstream RTF tokenizer/import and writer/export pathways for the current Writer core model, integrate document shell and browser Open/Export UI, and verify focused core and UI round trips."
sections:
  Summary: |-
    Implement native Writer RTF import export and UI filters

    Port the represented upstream RTF tokenizer/import and writer/export pathways for the current Writer core model, integrate document shell and browser Open/Export UI, and verify focused core and UI round trips.
  Scope: "In scope: RTF tokenizer and document import modules under sw/source/writerfilter/rtftok, RTF writer modules under sw/source/filter/ww8, their currently modeled Writer body/text/run/paragraph/list/table values, SwDocShell filter boundary, browser import/export adapters, existing Open/Export UI, related tests and source provenance. Preserve current save/autosave deviations. Unsupported upstream responsibilities must be explicit in Findings rather than silently flattened. Out of scope: unrepresented drawing, layout, embedded-object and desktop-only subsystems unless required by the represented model."
  Plan: "Map the pinned RTF reader/tokenizer and exporter contracts to the implemented Writer model. Implement coherent native tokenizer, reader, writer and supporting modules at upstream-shaped paths. Integrate the filter through SwDocShell and existing browser Open/Export UI. Add representative import/export and malformed-input tests for modeled content, update provenance and suspected upstream issues if discovered, then run focused verification and finish."
  Verify Steps: |-
    1. Run focused Vitest RTF tokenizer, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect all pass, including malformed input and formatting cases.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
    3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
    4. Run Writer registry/provenance checks and inspect shell/UI routes for native RTF ownership. Record evidence and final git status.
  Verification: |-
    Command: npx vitest run --config vitest.writer.config.ts src/sw/source/writerfilter/rtftok/rtftokenizer.test.ts src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts src/sw/source/filter/ww8/rtfexport.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (apps/office). Result: pass. Evidence: 5 files, 43 tests passed. Scope: RTF tokenizer, import/export, shell and UI.
    Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exit 0. Scope: office TypeScript.
    Command: npx prettier --check and npx eslint on 12 changed TS/TSX files. Result: pass. Evidence: all matched files formatted; ESLint exit 0. Scope: changed code and tests.
    Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run check:dependencies. Result: pass. Evidence: source provenance passed 1310 runtime modules; Writer inventory exit 0 with zero semantic violations; boundaries passed 1309 runtime sources. Scope: source mapping, registry and dependency edges.
    Inspection: SwDocShell.OpenRtf and SerializeRtf own filter conversion; WriterFileDialog delegates Open and Export through shell and browser port. Result: pass. Scope: native route ownership.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-25T16:32:18.993Z — VERIFY — ok

    By: CODER

    Note: Native RTF import/export and UI verified: 43 focused tests, typecheck, formatting, ESLint, source provenance, Writer inventory, dependency boundaries; bounded upstream omissions recorded in Findings.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:32:14.774Z, excerpt_hash=sha256:aa6b3e0cca43cd77c38a39e40327b114cf70f1786c4775185fce3494f6b80fa0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251614-X0XQPD/blueprint/resolved-snapshot.json
    - old_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
    - current_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251614-X0XQPD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251614-X0XQPD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-25T16:32:38.094Z — VERIFY — ok

    By: CODER

    Note: verified-202610251614-X0XQPD
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:32:19.051Z, excerpt_hash=sha256:aa6b3e0cca43cd77c38a39e40327b114cf70f1786c4775185fce3494f6b80fa0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251614-X0XQPD/blueprint/resolved-snapshot.json
    - old_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
    - current_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251614-X0XQPD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610251614-X0XQPD --result verified-202610251614-X0XQPD --commit cd6b2776166f87bac38b14caf1d6a7bd0c9472f7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Implemented for the current Writer model: RTF byte tokenizer, Unicode and ANSI text, group-scoped direct character attributes, paragraph alignment and margins, list levels, and table rows/cell paragraphs. The shell owns atomic import and native export; the existing browser dialog supplies file bytes and receives output bytes. This is a bounded filter slice: upstream fields, drawings, embedded objects, sections, redlines, complex styles and full destination vocabulary remain unverified and are not claimed as parity. The runtime and provenance records mark these responsibilities unverified. No suspected upstream defect was found in this slice."
id_source: "generated"
---
## Summary

Implement native Writer RTF import export and UI filters

Port the represented upstream RTF tokenizer/import and writer/export pathways for the current Writer core model, integrate document shell and browser Open/Export UI, and verify focused core and UI round trips.

## Scope

In scope: RTF tokenizer and document import modules under sw/source/writerfilter/rtftok, RTF writer modules under sw/source/filter/ww8, their currently modeled Writer body/text/run/paragraph/list/table values, SwDocShell filter boundary, browser import/export adapters, existing Open/Export UI, related tests and source provenance. Preserve current save/autosave deviations. Unsupported upstream responsibilities must be explicit in Findings rather than silently flattened. Out of scope: unrepresented drawing, layout, embedded-object and desktop-only subsystems unless required by the represented model.

## Plan

Map the pinned RTF reader/tokenizer and exporter contracts to the implemented Writer model. Implement coherent native tokenizer, reader, writer and supporting modules at upstream-shaped paths. Integrate the filter through SwDocShell and existing browser Open/Export UI. Add representative import/export and malformed-input tests for modeled content, update provenance and suspected upstream issues if discovered, then run focused verification and finish.

## Verify Steps

1. Run focused Vitest RTF tokenizer, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect all pass, including malformed input and formatting cases.
2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
4. Run Writer registry/provenance checks and inspect shell/UI routes for native RTF ownership. Record evidence and final git status.

## Verification

Command: npx vitest run --config vitest.writer.config.ts src/sw/source/writerfilter/rtftok/rtftokenizer.test.ts src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts src/sw/source/filter/ww8/rtfexport.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (apps/office). Result: pass. Evidence: 5 files, 43 tests passed. Scope: RTF tokenizer, import/export, shell and UI.
Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exit 0. Scope: office TypeScript.
Command: npx prettier --check and npx eslint on 12 changed TS/TSX files. Result: pass. Evidence: all matched files formatted; ESLint exit 0. Scope: changed code and tests.
Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run check:dependencies. Result: pass. Evidence: source provenance passed 1310 runtime modules; Writer inventory exit 0 with zero semantic violations; boundaries passed 1309 runtime sources. Scope: source mapping, registry and dependency edges.
Inspection: SwDocShell.OpenRtf and SerializeRtf own filter conversion; WriterFileDialog delegates Open and Export through shell and browser port. Result: pass. Scope: native route ownership.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-25T16:32:18.993Z — VERIFY — ok

By: CODER

Note: Native RTF import/export and UI verified: 43 focused tests, typecheck, formatting, ESLint, source provenance, Writer inventory, dependency boundaries; bounded upstream omissions recorded in Findings.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:32:14.774Z, excerpt_hash=sha256:aa6b3e0cca43cd77c38a39e40327b114cf70f1786c4775185fce3494f6b80fa0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251614-X0XQPD/blueprint/resolved-snapshot.json
- old_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
- current_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251614-X0XQPD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251614-X0XQPD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-25T16:32:38.094Z — VERIFY — ok

By: CODER

Note: verified-202610251614-X0XQPD
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:32:19.051Z, excerpt_hash=sha256:aa6b3e0cca43cd77c38a39e40327b114cf70f1786c4775185fce3494f6b80fa0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251614-X0XQPD/blueprint/resolved-snapshot.json
- old_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
- current_digest: 70360fdf5ccb5c4cc8283140cd45e727d3b0b849784a462a9555cd3740caba40
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251614-X0XQPD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610251614-X0XQPD --result verified-202610251614-X0XQPD --commit cd6b2776166f87bac38b14caf1d6a7bd0c9472f7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Implemented for the current Writer model: RTF byte tokenizer, Unicode and ANSI text, group-scoped direct character attributes, paragraph alignment and margins, list levels, and table rows/cell paragraphs. The shell owns atomic import and native export; the existing browser dialog supplies file bytes and receives output bytes. This is a bounded filter slice: upstream fields, drawings, embedded objects, sections, redlines, complex styles and full destination vocabulary remain unverified and are not claimed as parity. The runtime and provenance records mark these responsibilities unverified. No suspected upstream defect was found in this slice.
