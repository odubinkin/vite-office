---
id: "202611211845-XEPNMP"
title: "Preserve Calc ODS conditional data bars"
result_summary: "Ported Calc data-bar ownership, native limit geometry and ODS import and export."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:45:41.478Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:52:41.409Z"
  updated_by: "CODER"
  note: "45 focused Calc tests and all declared static checks passed. The original LibreOffice ODS fixture retains five data bars, including a live formula limit, after Worker transfer and save/reopen."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:52:42.261Z"
  updated_by: "EVALUATOR"
  note: "The ODS filter now carries native data-bar settings and both limits through the document model and Worker XML."
  evaluated_sha: "724bfde7f7822ce6f375bcc09320edac085e8f9f"
  blueprint_digest: "c834b49d0c0545824ddb37493eb78b032b8eac7bbb69e438d8a3eadf89e581f3"
  evidence_refs:
    - ".agentplane/tasks/202611211845-XEPNMP/README.md"
    - ".agentplane/tasks/202611211845-XEPNMP/quality/20261121-185242261-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211845-XEPNMP/quality/20261121-185242261-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211845-XEPNMP/quality/20261121-185242261-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211845-XEPNMP/blueprint/resolved-snapshot.json"
    - "45 focused tests, office typecheck, lint and formatting, dependency and provenance checks, AgentPlane gate"
  findings:
    - "The Calc fixture reproduces native ODS import and export scenarios. Geometry, threshold defaults, formula retargeting on value changes and legacy spelling are verified. Browser painting and XLSX remain outside this filter scope."
commit:
  hash: "724bfde7f7822ce6f375bcc09320edac085e8f9f"
  message: "🧩 XEPNMP code: preserve Calc ODS data bars"
comments:
  -
    author: "CODER"
    body: "Start: implement Calc ODS data-bar import, rule evaluation and round-trip serialization."
  -
    author: "CODER"
    body: "Verified: five pinned ODS data-bar rules retain their limits and settings through Worker transfer and reopening, and all 45 focused tests passed."
events:
  -
    type: "status"
    at: "2026-11-21T18:45:45.969Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Calc ODS data-bar import, rule evaluation and round-trip serialization."
  -
    type: "verify"
    at: "2026-11-21T18:52:41.409Z"
    author: "CODER"
    state: "ok"
    note: "45 focused Calc tests and all declared static checks passed. The original LibreOffice ODS fixture retains five data bars, including a live formula limit, after Worker transfer and save/reopen."
  -
    type: "status"
    at: "2026-11-21T18:54:13.357Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: five pinned ODS data-bar rules retain their limits and settings through Worker transfer and reopening, and all 45 focused tests passed."
doc_version: 3
doc_updated_at: "2026-11-21T18:54:13.358Z"
doc_updated_by: "CODER"
description: "Port the native ScDataBarFormat owner, threshold evaluation and ODS import/export contexts. Preserve rules through the Calc Worker and use the pinned LibreOffice ODS data-bar regression and model checks. Scope is core and filter, not user interface or XLSX."
sections:
  Summary: "Preserve Calc conditional data bars across ODS import, Worker transfer and export."
  Scope: "Native conditional-format data-bar value owner, threshold computation and reference/copy behavior, ODF context and serialization, shared threshold helpers, focused tests and metadata. Browser rendering and XLSX data bar support are outside this ODS filter work. Keep and document observable upstream behaviors."
  Plan: |-
    - Port the native data-bar value and conditional entry over ScColorFormat and ScColorScaleEntry.
    - Use the native ODS property names, threshold contexts and type/number serialization.
    - Verify the LibreOffice data-bar workbook and source-driven edge cases.
    - Run the scheduled full regression after closing this implementation.
  Verify Steps: |-
    - Run `npm run test:calc -- xmlcondformat.admission.test.ts condformatbuffer.colorscale.test.ts ods-data-bars.test.ts conditional-copy.test.ts ods-worker --maxWorkers 2 --testTimeout 120000`.
    - Run office typecheck and targeted ESLint and Prettier for changed TypeScript.
    - Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:52:41.409Z — VERIFY — ok

    By: CODER

    Note: 45 focused Calc tests and all declared static checks passed. The original LibreOffice ODS fixture retains five data bars, including a live formula limit, after Worker transfer and save/reopen.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:45:45.969Z, excerpt_hash=sha256:26e1a5dec541c31b2909771020e9850292dbd2c8f7a628d335212bb9e5c82bfd

    Details:

    Command: npm run test:calc -- xmlcondformat.admission.test.ts condformatbuffer.colorscale.test.ts ods-data-bars.test.ts conditional-copy.test.ts ods-worker --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 45 tests in eight files. Pinned ODS ranges, axis and limit types, reactive formula, legacy entry and native geometry assertions passed.
    Scope: Calc conditional-format core, ODS and Worker.

    Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo
    Result: pass
    Evidence: exit zero.
    Scope: office TypeScript.

    Command: npx eslint and npx prettier --check on all six changed TypeScript files
    Result: pass
    Evidence: no diagnostics or formatting issues.
    Scope: changed TypeScript.

    Command: npm run check:dependencies && npm run check:source-provenance
    Result: pass
    Evidence: 2978 dependency-checked runtime sources and 2979 provenance records.
    Scope: module boundaries and registry.

    Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check
    Result: pass
    Evidence: no routing or whitespace errors. Doctor reported the existing managed-hook shim warning.
    Scope: task gateway and implementation diff.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211845-XEPNMP/blueprint/resolved-snapshot.json
    - old_digest: c834b49d0c0545824ddb37493eb78b032b8eac7bbb69e438d8a3eadf89e581f3
    - current_digest: c834b49d0c0545824ddb37493eb78b032b8eac7bbb69e438d8a3eadf89e581f3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211845-XEPNMP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211845-XEPNMP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit."
  Findings: |-
    None recorded yet.

    - Observation: Supplemental npm run check:file-size reported nine above-budget files, all already over the line limit on pre-task HEAD b0e9a2f51. xmltoken.ts already had 1081 lines.
      Impact: The repository-wide size check remains outside the passing declared verification. The task adds native XML tokens to the existing vocabulary.
      Resolution: Keep the data-bar owner in its own source module. Record the inherited file-size debt for the regression checkpoint.
id_source: "generated"
---
## Summary

Preserve Calc conditional data bars across ODS import, Worker transfer and export.

## Scope

Native conditional-format data-bar value owner, threshold computation and reference/copy behavior, ODF context and serialization, shared threshold helpers, focused tests and metadata. Browser rendering and XLSX data bar support are outside this ODS filter work. Keep and document observable upstream behaviors.

## Plan

- Port the native data-bar value and conditional entry over ScColorFormat and ScColorScaleEntry.
- Use the native ODS property names, threshold contexts and type/number serialization.
- Verify the LibreOffice data-bar workbook and source-driven edge cases.
- Run the scheduled full regression after closing this implementation.

## Verify Steps

- Run `npm run test:calc -- xmlcondformat.admission.test.ts condformatbuffer.colorscale.test.ts ods-data-bars.test.ts conditional-copy.test.ts ods-worker --maxWorkers 2 --testTimeout 120000`.
- Run office typecheck and targeted ESLint and Prettier for changed TypeScript.
- Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:52:41.409Z — VERIFY — ok

By: CODER

Note: 45 focused Calc tests and all declared static checks passed. The original LibreOffice ODS fixture retains five data bars, including a live formula limit, after Worker transfer and save/reopen.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:45:45.969Z, excerpt_hash=sha256:26e1a5dec541c31b2909771020e9850292dbd2c8f7a628d335212bb9e5c82bfd

Details:

Command: npm run test:calc -- xmlcondformat.admission.test.ts condformatbuffer.colorscale.test.ts ods-data-bars.test.ts conditional-copy.test.ts ods-worker --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 45 tests in eight files. Pinned ODS ranges, axis and limit types, reactive formula, legacy entry and native geometry assertions passed.
Scope: Calc conditional-format core, ODS and Worker.

Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo
Result: pass
Evidence: exit zero.
Scope: office TypeScript.

Command: npx eslint and npx prettier --check on all six changed TypeScript files
Result: pass
Evidence: no diagnostics or formatting issues.
Scope: changed TypeScript.

Command: npm run check:dependencies && npm run check:source-provenance
Result: pass
Evidence: 2978 dependency-checked runtime sources and 2979 provenance records.
Scope: module boundaries and registry.

Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check
Result: pass
Evidence: no routing or whitespace errors. Doctor reported the existing managed-hook shim warning.
Scope: task gateway and implementation diff.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211845-XEPNMP/blueprint/resolved-snapshot.json
- old_digest: c834b49d0c0545824ddb37493eb78b032b8eac7bbb69e438d8a3eadf89e581f3
- current_digest: c834b49d0c0545824ddb37493eb78b032b8eac7bbb69e438d8a3eadf89e581f3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211845-XEPNMP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211845-XEPNMP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit.

## Findings

None recorded yet.

- Observation: Supplemental npm run check:file-size reported nine above-budget files, all already over the line limit on pre-task HEAD b0e9a2f51. xmltoken.ts already had 1081 lines.
  Impact: The repository-wide size check remains outside the passing declared verification. The task adds native XML tokens to the existing vocabulary.
  Resolution: Keep the data-bar owner in its own source module. Record the inherited file-size debt for the regression checkpoint.
