---
id: "202611220135-K5MZ4R"
title: "Align Calc ODS rich text with the native edit attribute map"
result_summary: "Calc ODS and Worker transfer preserve native EditEngine word mode, kerning, scale, emphasis, script locales and validated escapement in formatted spans."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:36:09.806Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:45:25.723Z"
  updated_by: "CODER"
  note: "Native Calc rich-text attributes and explicit resets survive ODS and Worker transport. 131 focused tests and the declared static checks pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:45:35.330Z"
  updated_by: "EVALUATOR"
  note: "Calc ODS span attributes use the original native Which identifiers, typed members and shared XML codecs through import, export and Worker transfer."
  evaluated_sha: "d4bba62ac223fb8ff820639e610d12ca1b54a69b"
  blueprint_digest: "072f18601aee751291d5f07fe06ae6ce8051080062303d97611d81b19e278fb5"
  evidence_refs:
    - ".agentplane/tasks/202611220135-K5MZ4R/README.md"
    - ".agentplane/tasks/202611220135-K5MZ4R/quality/20261122-014535330-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220135-K5MZ4R/quality/20261122-014535330-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220135-K5MZ4R/quality/20261122-014535330-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220135-K5MZ4R/blueprint/resolved-snapshot.json"
    - "d4bba62ac223 and 131 passing related tests"
    - "docs/program/calc-upstream-suspected-issues.md#CALC-819"
  findings:
    - "Existing font and decoration routing is preserved. Calc writes its native line-through word-mode attribute for the single word-mode item. Pinned package and styled text ranges reopen with the expected source values."
commit:
  hash: "d4bba62ac223fb8ff820639e610d12ca1b54a69b"
  message: "🧩 K5MZ4R code: preserve native Calc ODS span attributes"
comments:
  -
    author: "CODER"
    body: "Start: trace and port pinned Calc ODF edit-run attribute mappings through the existing EditEngine and Worker boundaries."
  -
    author: "CODER"
    body: "Verified: 131 focused tests, typecheck, lint, format, module boundaries, provenance, Calc registry invariants, task routing and doctor. CALC-819 records source word-mode export."
events:
  -
    type: "status"
    at: "2026-11-22T01:36:13.891Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace and port pinned Calc ODF edit-run attribute mappings through the existing EditEngine and Worker boundaries."
  -
    type: "verify"
    at: "2026-11-22T01:45:25.723Z"
    author: "CODER"
    state: "ok"
    note: "Native Calc rich-text attributes and explicit resets survive ODS and Worker transport. 131 focused tests and the declared static checks pass."
  -
    type: "status"
    at: "2026-11-22T01:46:53.699Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 131 focused tests, typecheck, lint, format, module boundaries, provenance, Calc registry invariants, task routing and doctor. CALC-819 records source word-mode export."
doc_version: 3
doc_updated_at: "2026-11-22T01:46:53.700Z"
doc_updated_by: "CODER"
description: "Port consumed ScXMLEditAttributeMap span mappings and use native EditEngine item values in Calc ODS import, export, and Worker round trips."
sections:
  Summary: "Preserve the pinned LibreOffice Calc rich-text character attribute values in ODS cell spans from import through edit-object storage, Worker transport, and export."
  Scope: |-
    - Port the consumed native ScXMLEditAttributeMap for edit runs. Preserve the supported text and font properties, and connect the missing word mode, kerning, scale, emphasis, and script locales through real EditEngine pool items.
    - Preserve legal values, explicit resets, member conversion and item defaults, including partial escapement, and verify existing decoration and font behavior.
    - Keep the Calc cell pattern, formatted runs, and underlying document format boundaries distinct. Leave unrelated cell layout, file UI, recovery, other format families, and newly unsupported UNO services outside this task.
  Plan: |-
    1. Trace ScXMLEditAttributeMap, ScXMLTableRowCellContext text style import, and ScXMLExport::CollectTextAutoStyles against the current rich-text and Worker paths.
    2. Install a shared Calc XML mapping of edit item identities and UNO members, reuse shared xmloff codecs, and replace the escapement-only handoff with the represented native attribute contract.
    3. Replay the supported assertions from LibreOffice's rich-text ODS tests. Verify named and automatic text styles, canonical items, and round trips through actual ODS and Worker transfer. Document any suspicious original behavior reproduced by this task.
  Verify Steps: |-
    - Run Calc ODS rich-text, related style, font, style-routing, Worker and format tests.
    - Run shared EditEngine and xmloff tests for the affected item members, lexical codecs, and script locale conversions.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, doctor and git diff checks.
    - Record the implementation and verification, then close and refresh the repository graph. This is the fifth task in the current ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:45:25.723Z — VERIFY — ok

    By: CODER

    Note: Native Calc rich-text attributes and explicit resets survive ODS and Worker transport. 131 focused tests and the declared static checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:36:13.891Z, excerpt_hash=sha256:1c72edf1d556b3f414e9597bc0eef2c38e9b13d651dfd55278459b61d8756d9b

    Details:

    - Command: `npm run test:calc -- ods-rich-text-fields ods.test ods-native-fonts ods-style-routing ods-worker ods-xml-boundaries format-export-failures`.
      Result: pass. Evidence: 58 tests in 12 files. Scope: actual ODS import and export, named versus automatic text styles, span properties and resets, packaged LibreOffice rich-text fixture, signed escapement runs, and Worker transport.
    - Commands: `npm run test:shared -- txtprmap.test chrlohdl.test native-escapement-xml xmlbahdl.test`, `npm run test:shared -- native-edit-document native-content-transfer strikeout-emphasis`, and `npm run test:writer -- editeng/source/items/textitem.test native-edit-document native-content-transfer strikeout-emphasis`.
      Result: pass. Evidence: 49 + 18 + 6 tests, respectively. Scope: shared handler lexical conversions, locale members and native character edit items.
    - Commands: scoped `npx eslint --max-warnings 0`, `npx prettier --check`, `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope calc`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `git diff --check`.
      Result: pass. Evidence: boundary check 2,988 runtime sources, provenance 2,989 runtime modules, routing OK and doctor 0 errors with the existing managed hook shim warning.
    - CALC-819 records the native word-mode export association. This task verifies the represented span and ODS transport; the browser does not gain new text shaping or cell rendering behavior. The full run remains scheduled after ten closed tasks; this is the fifth.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220135-K5MZ4R/blueprint/resolved-snapshot.json
    - old_digest: 072f18601aee751291d5f07fe06ae6ce8051080062303d97611d81b19e278fb5
    - current_digest: 072f18601aee751291d5f07fe06ae6ce8051080062303d97611d81b19e278fb5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220135-K5MZ4R

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220135-K5MZ4R
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit with its source-provenance records and rerun ODS rich-text and Worker tests."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve the pinned LibreOffice Calc rich-text character attribute values in ODS cell spans from import through edit-object storage, Worker transport, and export.

## Scope

- Port the consumed native ScXMLEditAttributeMap for edit runs. Preserve the supported text and font properties, and connect the missing word mode, kerning, scale, emphasis, and script locales through real EditEngine pool items.
- Preserve legal values, explicit resets, member conversion and item defaults, including partial escapement, and verify existing decoration and font behavior.
- Keep the Calc cell pattern, formatted runs, and underlying document format boundaries distinct. Leave unrelated cell layout, file UI, recovery, other format families, and newly unsupported UNO services outside this task.

## Plan

1. Trace ScXMLEditAttributeMap, ScXMLTableRowCellContext text style import, and ScXMLExport::CollectTextAutoStyles against the current rich-text and Worker paths.
2. Install a shared Calc XML mapping of edit item identities and UNO members, reuse shared xmloff codecs, and replace the escapement-only handoff with the represented native attribute contract.
3. Replay the supported assertions from LibreOffice's rich-text ODS tests. Verify named and automatic text styles, canonical items, and round trips through actual ODS and Worker transfer. Document any suspicious original behavior reproduced by this task.

## Verify Steps

- Run Calc ODS rich-text, related style, font, style-routing, Worker and format tests.
- Run shared EditEngine and xmloff tests for the affected item members, lexical codecs, and script locale conversions.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, doctor and git diff checks.
- Record the implementation and verification, then close and refresh the repository graph. This is the fifth task in the current ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:45:25.723Z — VERIFY — ok

By: CODER

Note: Native Calc rich-text attributes and explicit resets survive ODS and Worker transport. 131 focused tests and the declared static checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:36:13.891Z, excerpt_hash=sha256:1c72edf1d556b3f414e9597bc0eef2c38e9b13d651dfd55278459b61d8756d9b

Details:

- Command: `npm run test:calc -- ods-rich-text-fields ods.test ods-native-fonts ods-style-routing ods-worker ods-xml-boundaries format-export-failures`.
  Result: pass. Evidence: 58 tests in 12 files. Scope: actual ODS import and export, named versus automatic text styles, span properties and resets, packaged LibreOffice rich-text fixture, signed escapement runs, and Worker transport.
- Commands: `npm run test:shared -- txtprmap.test chrlohdl.test native-escapement-xml xmlbahdl.test`, `npm run test:shared -- native-edit-document native-content-transfer strikeout-emphasis`, and `npm run test:writer -- editeng/source/items/textitem.test native-edit-document native-content-transfer strikeout-emphasis`.
  Result: pass. Evidence: 49 + 18 + 6 tests, respectively. Scope: shared handler lexical conversions, locale members and native character edit items.
- Commands: scoped `npx eslint --max-warnings 0`, `npx prettier --check`, `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope calc`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `git diff --check`.
  Result: pass. Evidence: boundary check 2,988 runtime sources, provenance 2,989 runtime modules, routing OK and doctor 0 errors with the existing managed hook shim warning.
- CALC-819 records the native word-mode export association. This task verifies the represented span and ODS transport; the browser does not gain new text shaping or cell rendering behavior. The full run remains scheduled after ten closed tasks; this is the fifth.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220135-K5MZ4R/blueprint/resolved-snapshot.json
- old_digest: 072f18601aee751291d5f07fe06ae6ce8051080062303d97611d81b19e278fb5
- current_digest: 072f18601aee751291d5f07fe06ae6ce8051080062303d97611d81b19e278fb5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220135-K5MZ4R

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220135-K5MZ4R
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit with its source-provenance records and rerun ODS rich-text and Worker tests.

## Findings
