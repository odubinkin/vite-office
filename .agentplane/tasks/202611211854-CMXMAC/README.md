---
id: "202611211854-CMXMAC"
title: "Run the Writer and Calc ODF full regression checkpoint"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "regression"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:54:47.993Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T00:34:45.731Z"
  updated_by: "CODER"
  note: "Completed all scheduled regression commands, resolved or reproduced successfully each failed functional case in its owner, and preserved the existing unmet Office coverage gate."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T00:34:55.796Z"
  updated_by: "EVALUATOR"
  note: "Scheduled regression evidence and scoped repairs satisfy the checkpoint plan. All reported functional cases have passing evidence."
  evaluated_sha: "e247d34f071b5dc4a84ca4c623d3570237315791"
  blueprint_digest: "be1cbccccb335c423b9d040829b01b03bafeb78a09d919b715e038585c4d26fc"
  evidence_refs:
    - ".agentplane/tasks/202611211854-CMXMAC/README.md"
    - ".agentplane/tasks/202611211854-CMXMAC/quality/20261122-003455796-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211854-CMXMAC/quality/20261122-003455796-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211854-CMXMAC/quality/20261122-003455796-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211854-CMXMAC/blueprint/resolved-snapshot.json"
    - "output/playwright/full-regression-CMXMAC/office.json"
    - "output/playwright/full-regression-CMXMAC/chromium-local.json"
    - "output/playwright/full-regression-CMXMAC/data-bar-editor-tracked.json"
  findings:
    - "The unchanged repository-wide Office coverage requirement still fails. Tooling, inventory and all 613 Chromium tests passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: run full Office, Chromium, tooling and inventory regressions from the tenth ODF task checkpoint."
events:
  -
    type: "status"
    at: "2026-11-21T18:54:52.637Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: run full Office, Chromium, tooling and inventory regressions from the tenth ODF task checkpoint."
  -
    type: "verify"
    at: "2026-11-22T00:34:45.731Z"
    author: "CODER"
    state: "ok"
    note: "Completed all scheduled regression commands, resolved or reproduced successfully each failed functional case in its owner, and preserved the existing unmet Office coverage gate."
doc_version: 3
doc_updated_at: "2026-11-22T00:34:45.780Z"
doc_updated_by: "CODER"
description: "After ten completed Writer and Calc ODF tasks, run all application unit and integration projects with coverage, all browser projects, tooling, and inventory checks. Diagnose and fix regressions and validate repaired owners. Keep the active alignment goal running after the checkpoint."
sections:
  Summary: "Full regression after ten Calc and Writer ODF alignment tasks. Baseline application source is the post-XEPNMP commit 45ca914ef039."
  Scope: "All Office unit and integration projects, all production Chromium projects, tooling and inventory. Diagnose and fix observed functional regressions in their owners. Preserve coverage gates, test expectations derived from upstream and the established save/recovery deviations."
  Plan: |-
    - Run application coverage, production browser tests, tooling and inventory independently with durable logs and exit codes. Serialize steps to limit memory pressure.
    - Reproduce failures in their owners, classify timeouts and pre-existing issues, and repair source-backed functional failures.
    - Verify fixes in owner suites, record remaining reported coverage deficits and close the checkpoint. Keep the active goal running.
  Verify Steps: |-
    - Run `npm run test:coverage -- --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000` with a durable JSON reporter and unchanged coverage thresholds.
    - Run `npm run test:e2e -- --workers=1 --timeout=120000` across Writer, Calc and shared Chromium projects.
    - Run `npm run test:tooling -- --hookTimeout=60000 --testTimeout=60000` and `npm run test:inventory:coverage -- --maxWorkers=1 --hookTimeout=60000 --testTimeout=60000`.
    - Rerun each functional failure in its owning test suite after diagnosis or repair. Check changed TypeScript with lint, formatting and office typecheck and run boundary and provenance guards for any code changes.
    - Run `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`, and record the finished tracked status.
  Verification: |-
    Pending full regression.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T00:34:45.731Z — VERIFY — ok

    By: CODER

    Note: Completed all scheduled regression commands, resolved or reproduced successfully each failed functional case in its owner, and preserved the existing unmet Office coverage gate.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:23:45.779Z, excerpt_hash=sha256:8de2cd1ca44a40ac2a48b522ebbb15da0c93c03bd79fc250285aa63d74ceca7f

    Details:

    Office coverage baseline: 2256 files passed, 3 failed. 33943 tests passed, 3 failed, 23 skipped. The linked-footer DOCX test and DOCX dialog reopen passed isolated replays. The stale Writer UNO schema count was repaired and all three owner tests passed. Office coverage remains below 100% at 95.96% statements, 93.37% branches, 97.97% functions and 96.82% lines.
    Tooling: 194 tests in 47 files passed. Inventory coverage: 130 tests in 38 files passed at 100% on all four metrics.
    Production Chromium: 613 passed, 0 failed, 0 skipped, 0 flaky. Writer 431, Calc 114, shared 68. The installed repository-local Chromium was required after the default cache failed to launch.
    Calc editor repair e247d34f071b: all 9 targeted conditional-format and ODS data-bar tests passed. Changed-source lint, formatting, Office typecheck, module boundary and provenance checks passed. Routing, AgentPlane doctor and diff checks passed. Doctor reported the existing hook shim warning.
    Durable evidence: output/playwright/full-regression-CMXMAC, including coverage and browser stage status files and separate owner retry reports.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211854-CMXMAC/blueprint/resolved-snapshot.json
    - old_digest: be1cbccccb335c423b9d040829b01b03bafeb78a09d919b715e038585c4d26fc
    - current_digest: be1cbccccb335c423b9d040829b01b03bafeb78a09d919b715e038585c4d26fc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211854-CMXMAC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211854-CMXMAC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert any scoped repair commit independently of the checkpoint evidence."
  Findings: |-
    The preceding task records baseline repository file-size debt.

    - Observation: Started the scheduled complete regression on source checkpoint 45ca914ef039, with task metadata at 4f7b7d4c148d.
      Impact: The commanded Office coverage, tooling, inventory and Chromium stages run serially and continue regardless of prior exit codes.
      Resolution: Poll the live shell session 58047 and inspect output/full-regression-CMXMAC. Each stage writes its own started timestamp, log, JSON and exit code.

    - Observation: npm run inventory:parity initially failed because CAP-0141 referenced the pre-refactor literal for the Writer underline-style property.
      Impact: Registry validation failed across scopes even though the shared production map still handles the same ODF token.
      Resolution: Updated the canonical evidence and its compatibility view to point at the actual T.STYLE_TEXT_UNDERLINE_STYLE entry. Repeated npm run inventory:parity successfully for all suites. Application sources remained at the checkpoint revision.

    - Observation: The live Office regression logged a 120000 ms timeout in docxexport.page-stories.test.ts, in the linked-to-previous OOX fixture. The Office process remains live and advances through Writer.
      Impact: The timeout is the first reported application case failure. It needs an isolated retry after the memory-intensive stage.
      Resolution: Keep shell session 58047 running, account for full reports, and rerun this exact owner case with a larger investigative timeout when memory allows. No application source changed during the Office baseline.

    - Observation: Queued an isolated rerun of the observed linked-footer timeout in shell session 70400.
      Impact: The retry waits for the Office worker and its coverage merge to exit, and waits for at least 2 GiB free memory while any other baseline stage is running.
      Resolution: Poll sessions 58047 and 70400. The retry writes linked-footer-retry.log, JSON and exit code to the same full-regression-CMXMAC output directory.

    - Observation: The Office run also reported the WriterFileDialog DOCX reopen assertion after its 5000 ms UI wait. The captured DOM still displayed Opening document and showed no open error.
      Impact: The captured state is consistent with a wait expiring while import or persistence is still active. It does not yet establish a functional failure.
      Resolution: Queued the exact dialog case in shell session 83928 after the isolated linked-footer retry. Both retry sessions use the regression directory for logs, JSON and terminal status.

    - Observation: Source review found a candidate integration regression at the tenth task boundary: ScCondFormatDlg calls ReadConditionalRule for every existing entry, but the mapper throws for an imported ScDataBarFormat.
      Impact: Opening a persisted ODS data-bar rule in the existing conditional-format editor may throw before the dialog is created.
      Resolution: After the baseline application stage, reproduce with the pinned databar.ods and the existing editor entry point. The source counterpart is ScDataBarFrmtEntry in condformatdlgentry.cxx. Retain the imported settings and thresholds through the existing result and ODS paths.

    - Observation: Added an isolated scenario to calc-conditional-format.test.tsx after the full Office runner finished the Calc project. The scenario opens databar.ods through the manager, edits a limit and checks the saved ODS rule.
      Impact: The current Office run still uses unchanged application source. The new scenario is queued separately as a baseline reproduction.
      Resolution: Poll reproduction session 97783. It writes data-bar-editor-baseline.log and JSON after the two Writer retries. Use the native manager label, automatic lower and upper choices and owned data-bar settings copy when fixing the editor.

    - Observation: The targeted Calc baseline reproduced Unsupported conditional-format entry when the manager rendered the original databar.ods. An isolated Vite source overlay then passed all six manager and editor scenarios plus the three ODS data-bar filter cases.
      Impact: The source-backed repair adds the native two-limit editor values and preserves cloned data-bar settings through ODS save and reopen.
      Resolution: Apply the three tested candidate modules only after the Office coverage stage exits, then run the same tests and static checks on the tracked sources. The isolated candidate is in ignored output/playwright/cmxmac-editor-candidate.

    - Observation: The two Writer failures from full coverage passed when rerun as individual, non-instrumented test cases in session 34353. The full worker continued separately.
      Impact: The linked-footer case passed in 46.0 seconds and the DOCX dialog case in 7.7 seconds with its original internal 5-second UI wait. No Writer behavior failure was reproduced.
      Resolution: Retain the original historical failure and both passing retry JSON reports. No Writer source, assertion or wait was changed. The full chain remains session 58047.

    - Observation: The tested Calc editor candidate also passed ESLint on the four changed paths and the native Office TypeScript checker on a separate source snapshot.
      Impact: The original coverage worker still reads the checkpoint application source and retains valid source-to-coverage mapping.
      Resolution: The native checker passed after copying repository-local fixture helpers and ICU witness scripts into the isolated snapshot. Use the standard workspace checker again on the tracked repair after Office exits.

    - Observation: Queued the verified Calc editor patch and a normal tracked-source Calc rerun in shell session 29574.
      Impact: After Office exits this session revalidates the AgentPlane route and the three untouched source paths before applying the formatted patch. The serial full regression remains in session 58047.
      Resolution: Poll session 29574 and inspect data-bar-editor-apply.exit and data-bar-editor-tracked.exit. The isolated reference snapshot passed the same nine scenarios and Office typechecking. No user source will be overwritten.

    - Observation: Full Office coverage reported a stale 88-entry assertion in native-text-default-schema.test.ts. The current Writer default map exposes 94 entries after BN5ECR.
      Impact: The six added character property names are in the pinned LibreOffice COMMON_CRSR_PARA_PROPERTIES_WITHOUT_FN macro already recorded in native-text-default-schema.upstream.json. Upstream GetTextDefaultPropertyMap uses that macro and the provider clears MAYBEVOID except for PageDescName.
      Resolution: Updated the supported row count and explicitly verified the three overline members, contour, shadow and relief through the UNO default-table metadata. All three owner tests, ESLint, Prettier and diff checks passed. The production Writer schema stayed untouched.

    - Observation: The Office baseline completed with 2,256 passing and 3 failing files; 33,943 passed, 3 failed and 23 skipped. The configured 100% coverage gate failed at 95.96% statements, 93.37% branches, 97.97% functions and 96.82% lines.
      Impact: Each failed Office case passed an isolated owner rerun after diagnosis or the schema assertion repair. The baseline coverage gate remains failed.
      Resolution: Keep the baseline and retry JSON reports with the checkpoint. The Calc editor repair was committed as e247d34f071b, and the normal tracked-source editor and filter suites passed nine tests. Scoped lint, formatting, Office typecheck, boundary guards, provenance, routing and diff checks passed.

    - Observation: The previous complete Office checkpoint QMYDFT recorded 95.97% statement, 93.39% branch, 97.98% function and 96.82% line coverage at the same 100% gate.
      Impact: The global coverage failure predates this checkpoint. The current baseline metrics moved by -0.01, -0.02, -0.01 and 0.00 percentage points respectively.
      Resolution: Record both checkpoints and preserve the existing threshold. Functional failure recovery is tracked independently by owner and report.

    - Observation: The tooling run passed 194 tests in 47 files. The inventory coverage run passed 130 tests in 38 files and measured 100% for statements, branches, functions and lines.
      Impact: The boundary, registry and inventory checks remain healthy after the checkpoint repairs.
      Resolution: The reports are tooling.json and inventory.json. The Chromium stage now builds the production application, and Playwright discovers 613 tests in 275 files across Writer, Calc and shared.

    - Observation: The production build passed. The first Chromium invocation launched with the default cache and immediately failed because its headless executable was absent, as on QMYDFT.
      Impact: The first attempts never opened the application. The process was stopped to avoid repeating the same environment failure across 613 cases.
      Resolution: Relaunched all 613 Chromium cases using the already built production bundle and the installed repository-local Chromium cache, retaining separate logs and JSON. The live session is 94776 and its logs use the chromium-local prefix.
id_source: "generated"
---
## Summary

Full regression after ten Calc and Writer ODF alignment tasks. Baseline application source is the post-XEPNMP commit 45ca914ef039.

## Scope

All Office unit and integration projects, all production Chromium projects, tooling and inventory. Diagnose and fix observed functional regressions in their owners. Preserve coverage gates, test expectations derived from upstream and the established save/recovery deviations.

## Plan

- Run application coverage, production browser tests, tooling and inventory independently with durable logs and exit codes. Serialize steps to limit memory pressure.
- Reproduce failures in their owners, classify timeouts and pre-existing issues, and repair source-backed functional failures.
- Verify fixes in owner suites, record remaining reported coverage deficits and close the checkpoint. Keep the active goal running.

## Verify Steps

- Run `npm run test:coverage -- --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000` with a durable JSON reporter and unchanged coverage thresholds.
- Run `npm run test:e2e -- --workers=1 --timeout=120000` across Writer, Calc and shared Chromium projects.
- Run `npm run test:tooling -- --hookTimeout=60000 --testTimeout=60000` and `npm run test:inventory:coverage -- --maxWorkers=1 --hookTimeout=60000 --testTimeout=60000`.
- Rerun each functional failure in its owning test suite after diagnosis or repair. Check changed TypeScript with lint, formatting and office typecheck and run boundary and provenance guards for any code changes.
- Run `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`, and record the finished tracked status.

## Verification

Pending full regression.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T00:34:45.731Z — VERIFY — ok

By: CODER

Note: Completed all scheduled regression commands, resolved or reproduced successfully each failed functional case in its owner, and preserved the existing unmet Office coverage gate.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:23:45.779Z, excerpt_hash=sha256:8de2cd1ca44a40ac2a48b522ebbb15da0c93c03bd79fc250285aa63d74ceca7f

Details:

Office coverage baseline: 2256 files passed, 3 failed. 33943 tests passed, 3 failed, 23 skipped. The linked-footer DOCX test and DOCX dialog reopen passed isolated replays. The stale Writer UNO schema count was repaired and all three owner tests passed. Office coverage remains below 100% at 95.96% statements, 93.37% branches, 97.97% functions and 96.82% lines.
Tooling: 194 tests in 47 files passed. Inventory coverage: 130 tests in 38 files passed at 100% on all four metrics.
Production Chromium: 613 passed, 0 failed, 0 skipped, 0 flaky. Writer 431, Calc 114, shared 68. The installed repository-local Chromium was required after the default cache failed to launch.
Calc editor repair e247d34f071b: all 9 targeted conditional-format and ODS data-bar tests passed. Changed-source lint, formatting, Office typecheck, module boundary and provenance checks passed. Routing, AgentPlane doctor and diff checks passed. Doctor reported the existing hook shim warning.
Durable evidence: output/playwright/full-regression-CMXMAC, including coverage and browser stage status files and separate owner retry reports.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211854-CMXMAC/blueprint/resolved-snapshot.json
- old_digest: be1cbccccb335c423b9d040829b01b03bafeb78a09d919b715e038585c4d26fc
- current_digest: be1cbccccb335c423b9d040829b01b03bafeb78a09d919b715e038585c4d26fc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211854-CMXMAC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211854-CMXMAC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert any scoped repair commit independently of the checkpoint evidence.

## Findings

The preceding task records baseline repository file-size debt.

- Observation: Started the scheduled complete regression on source checkpoint 45ca914ef039, with task metadata at 4f7b7d4c148d.
  Impact: The commanded Office coverage, tooling, inventory and Chromium stages run serially and continue regardless of prior exit codes.
  Resolution: Poll the live shell session 58047 and inspect output/full-regression-CMXMAC. Each stage writes its own started timestamp, log, JSON and exit code.

- Observation: npm run inventory:parity initially failed because CAP-0141 referenced the pre-refactor literal for the Writer underline-style property.
  Impact: Registry validation failed across scopes even though the shared production map still handles the same ODF token.
  Resolution: Updated the canonical evidence and its compatibility view to point at the actual T.STYLE_TEXT_UNDERLINE_STYLE entry. Repeated npm run inventory:parity successfully for all suites. Application sources remained at the checkpoint revision.

- Observation: The live Office regression logged a 120000 ms timeout in docxexport.page-stories.test.ts, in the linked-to-previous OOX fixture. The Office process remains live and advances through Writer.
  Impact: The timeout is the first reported application case failure. It needs an isolated retry after the memory-intensive stage.
  Resolution: Keep shell session 58047 running, account for full reports, and rerun this exact owner case with a larger investigative timeout when memory allows. No application source changed during the Office baseline.

- Observation: Queued an isolated rerun of the observed linked-footer timeout in shell session 70400.
  Impact: The retry waits for the Office worker and its coverage merge to exit, and waits for at least 2 GiB free memory while any other baseline stage is running.
  Resolution: Poll sessions 58047 and 70400. The retry writes linked-footer-retry.log, JSON and exit code to the same full-regression-CMXMAC output directory.

- Observation: The Office run also reported the WriterFileDialog DOCX reopen assertion after its 5000 ms UI wait. The captured DOM still displayed Opening document and showed no open error.
  Impact: The captured state is consistent with a wait expiring while import or persistence is still active. It does not yet establish a functional failure.
  Resolution: Queued the exact dialog case in shell session 83928 after the isolated linked-footer retry. Both retry sessions use the regression directory for logs, JSON and terminal status.

- Observation: Source review found a candidate integration regression at the tenth task boundary: ScCondFormatDlg calls ReadConditionalRule for every existing entry, but the mapper throws for an imported ScDataBarFormat.
  Impact: Opening a persisted ODS data-bar rule in the existing conditional-format editor may throw before the dialog is created.
  Resolution: After the baseline application stage, reproduce with the pinned databar.ods and the existing editor entry point. The source counterpart is ScDataBarFrmtEntry in condformatdlgentry.cxx. Retain the imported settings and thresholds through the existing result and ODS paths.

- Observation: Added an isolated scenario to calc-conditional-format.test.tsx after the full Office runner finished the Calc project. The scenario opens databar.ods through the manager, edits a limit and checks the saved ODS rule.
  Impact: The current Office run still uses unchanged application source. The new scenario is queued separately as a baseline reproduction.
  Resolution: Poll reproduction session 97783. It writes data-bar-editor-baseline.log and JSON after the two Writer retries. Use the native manager label, automatic lower and upper choices and owned data-bar settings copy when fixing the editor.

- Observation: The targeted Calc baseline reproduced Unsupported conditional-format entry when the manager rendered the original databar.ods. An isolated Vite source overlay then passed all six manager and editor scenarios plus the three ODS data-bar filter cases.
  Impact: The source-backed repair adds the native two-limit editor values and preserves cloned data-bar settings through ODS save and reopen.
  Resolution: Apply the three tested candidate modules only after the Office coverage stage exits, then run the same tests and static checks on the tracked sources. The isolated candidate is in ignored output/playwright/cmxmac-editor-candidate.

- Observation: The two Writer failures from full coverage passed when rerun as individual, non-instrumented test cases in session 34353. The full worker continued separately.
  Impact: The linked-footer case passed in 46.0 seconds and the DOCX dialog case in 7.7 seconds with its original internal 5-second UI wait. No Writer behavior failure was reproduced.
  Resolution: Retain the original historical failure and both passing retry JSON reports. No Writer source, assertion or wait was changed. The full chain remains session 58047.

- Observation: The tested Calc editor candidate also passed ESLint on the four changed paths and the native Office TypeScript checker on a separate source snapshot.
  Impact: The original coverage worker still reads the checkpoint application source and retains valid source-to-coverage mapping.
  Resolution: The native checker passed after copying repository-local fixture helpers and ICU witness scripts into the isolated snapshot. Use the standard workspace checker again on the tracked repair after Office exits.

- Observation: Queued the verified Calc editor patch and a normal tracked-source Calc rerun in shell session 29574.
  Impact: After Office exits this session revalidates the AgentPlane route and the three untouched source paths before applying the formatted patch. The serial full regression remains in session 58047.
  Resolution: Poll session 29574 and inspect data-bar-editor-apply.exit and data-bar-editor-tracked.exit. The isolated reference snapshot passed the same nine scenarios and Office typechecking. No user source will be overwritten.

- Observation: Full Office coverage reported a stale 88-entry assertion in native-text-default-schema.test.ts. The current Writer default map exposes 94 entries after BN5ECR.
  Impact: The six added character property names are in the pinned LibreOffice COMMON_CRSR_PARA_PROPERTIES_WITHOUT_FN macro already recorded in native-text-default-schema.upstream.json. Upstream GetTextDefaultPropertyMap uses that macro and the provider clears MAYBEVOID except for PageDescName.
  Resolution: Updated the supported row count and explicitly verified the three overline members, contour, shadow and relief through the UNO default-table metadata. All three owner tests, ESLint, Prettier and diff checks passed. The production Writer schema stayed untouched.

- Observation: The Office baseline completed with 2,256 passing and 3 failing files; 33,943 passed, 3 failed and 23 skipped. The configured 100% coverage gate failed at 95.96% statements, 93.37% branches, 97.97% functions and 96.82% lines.
  Impact: Each failed Office case passed an isolated owner rerun after diagnosis or the schema assertion repair. The baseline coverage gate remains failed.
  Resolution: Keep the baseline and retry JSON reports with the checkpoint. The Calc editor repair was committed as e247d34f071b, and the normal tracked-source editor and filter suites passed nine tests. Scoped lint, formatting, Office typecheck, boundary guards, provenance, routing and diff checks passed.

- Observation: The previous complete Office checkpoint QMYDFT recorded 95.97% statement, 93.39% branch, 97.98% function and 96.82% line coverage at the same 100% gate.
  Impact: The global coverage failure predates this checkpoint. The current baseline metrics moved by -0.01, -0.02, -0.01 and 0.00 percentage points respectively.
  Resolution: Record both checkpoints and preserve the existing threshold. Functional failure recovery is tracked independently by owner and report.

- Observation: The tooling run passed 194 tests in 47 files. The inventory coverage run passed 130 tests in 38 files and measured 100% for statements, branches, functions and lines.
  Impact: The boundary, registry and inventory checks remain healthy after the checkpoint repairs.
  Resolution: The reports are tooling.json and inventory.json. The Chromium stage now builds the production application, and Playwright discovers 613 tests in 275 files across Writer, Calc and shared.

- Observation: The production build passed. The first Chromium invocation launched with the default cache and immediately failed because its headless executable was absent, as on QMYDFT.
  Impact: The first attempts never opened the application. The process was stopped to avoid repeating the same environment failure across 613 cases.
  Resolution: Relaunched all 613 Chromium cases using the already built production bundle and the installed repository-local Chromium cache, retaining separate logs and JSON. The live session is 94776 and its logs use the chromium-local prefix.
