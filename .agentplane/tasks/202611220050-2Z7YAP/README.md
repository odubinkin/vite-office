---
id: "202611220050-2Z7YAP"
title: "Connect Calc sheet protection and edit permissions"
result_summary: "Connected the Calc sheet protection command, dialogs, native state and Undo history."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202611220023-1ZKRD0"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T00:50:55.485Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:02:44.770Z"
  updated_by: "CODER"
  note: "Verified: Calc sheet protection, native dialog responses and editing, grouped history, ODS persistence, focused tests and production Chromium."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:02:59.673Z"
  updated_by: "EVALUATOR"
  note: "Calc sheet protection uses the original options, document records, command state and history with verified browser and ODS behavior."
  evaluated_sha: "eeb921dccfc08b24a18f45dca7b5a76b4d490520"
  blueprint_digest: "58c69e45af8bdd59b3172233de9be549cb056dd2405501944f40ebe8428f4d1d"
  evidence_refs:
    - ".agentplane/tasks/202611220050-2Z7YAP/README.md"
    - ".agentplane/tasks/202611220050-2Z7YAP/quality/20261122-010259673-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220050-2Z7YAP/quality/20261122-010259673-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220050-2Z7YAP/quality/20261122-010259673-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220050-2Z7YAP/blueprint/resolved-snapshot.json"
    - "output/calc-task15-verification.md"
    - "output/calc-task15-calc-retry.log"
    - "output/playwright/calc-task15/smoke.log"
  findings:
    - "The original protectSheet.py password, unlock and Cancel scenarios pass through active Calc dialogs."
    - "Grouped history and three native verifier formats pass focused validation."
    - "Production Chromium verifies incorrect password, unlock, and Undo."
commit:
  hash: "eeb921dccfc08b24a18f45dca7b5a76b4d490520"
  message: "🧩 2Z7YAP code: connect Calc sheet protection, dialogs and history"
comments:
  -
    author: "CODER"
    body: "Start: connect native Calc sheet protection and verify existing model and filter behavior."
  -
    author: "CODER"
    body: "Verified: native Calc sheet protection, password prompts, tab flags, grouped history and ODS round-trip, focused tests and Chromium."
events:
  -
    type: "status"
    at: "2026-11-22T00:50:55.838Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc sheet protection and verify existing model and filter behavior."
  -
    type: "verify"
    at: "2026-11-22T01:02:44.770Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Calc sheet protection, native dialog responses and editing, grouped history, ODS persistence, focused tests and production Chromium."
  -
    type: "status"
    at: "2026-11-22T01:03:51.414Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native Calc sheet protection, password prompts, tab flags, grouped history and ODS round-trip, focused tests and Chromium."
doc_version: 3
doc_updated_at: "2026-11-22T01:03:51.414Z"
doc_updated_by: "CODER"
description: "Expose the native Calc sheet protection command, original protection and password prompts, and existing sheet protection state through menus, tabs, and document history."
sections:
  Summary: |-
    Connect Calc sheet protection and edit permissions

    Expose the native Calc sheet protection command, original protection and password prompts, and existing sheet protection state through menus, tabs, and document history.
  Scope: "Cover the source FID_PROTECT_TABLE flow, spreadsheet sheet options and credentials, supported imported verifiers, grouped native document operations, tab lock presentation and original undo semantics. Preserve current save and open policy. The workbook structure and file-level protection commands are separate."
  Plan: "Connect the pinned view and document protection commands for sheets, existing protection storage, native options and password prompts, selected tabs, checked and tab lock presentation, and protection-specific history. Verify both newly protected and imported protected sheets in the existing document format flow."
  Verify Steps: |-
    - Run targeted Calc tests for native sheet protection, original dialog order and defaults, password input and verification, selection and edit restrictions, grouped Undo and Redo and ODS round trip. Port the protectSheet.py regression.
    - Run repository typecheck, changed-source lint and format, source tree, dependencies, provenance and Calc resources, inventory, AgentPlane routing and doctor.
    - Verify the actual Calc protection command and dialog in local production Chromium. This is task five of the ten-task checkpoint interval.
  Verification: |-
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-sheet-protection tabprotection.password ods-sheet-protection excelfilter.sheet-protection excelfilter.enhanced-protection tabview2-protection protectionattr calc-sheet-popup ui-resources`.
      - Result: 43 distinct focused cases passed across the main run and the final two-file retry. The retry updated the source tab menu expectation and waited for the real asynchronous Web Crypto result before asserting grouped protection.
      - Evidence: `output/calc-task15-final-calc.log` and `output/calc-task15-calc-retry.log`.
      - Scope: the ported protectSheet.py test, eight permission options, accepted and incorrect passwords, Cancel, protected input, checked and tab lock state, grouped Undo/Redo, ODS reopens, legacy Excel digests and SHA-based OOXML verifiers.
    - Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
      - Result: pass.
      - Evidence: `output/calc-task15-types.log`, `output/calc-task15-static.log`, `output/calc-task15-final-lint.log` and `output/calc-task15-final-format.log`.
      - Scope: repository types, build and production assets, and changed source.
    - Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
      - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
      - Evidence: `output/calc-task15-{deps,resources,provenance,inventory,source-tree,routing,doctor}.log`.
      - Scope: module dependency boundaries, pinned resources, provenance, inventory and task workflow.
    - Command: `playwright-cli -s=calc-task15-final run-code --filename smoke.js` on the local production preview.
      - Result: pass. The menu opens the native sheet dialog, password confirmation updates the sheet flag, the wrong password opens the native information prompt, the correct password unlocks it, and Undo restores the tab lock.
      - Evidence: `output/playwright/calc-task15/smoke.log`.
      - Scope: actual Chromium modal flow, lock marker, command binding, password verification and history.
    - Command: `npm run check:file-size`.
      - Result: repository-wide check reports seven pre-existing authored file limit violations. All changed authored files remain below the limit.
      - Evidence: `output/calc-task15-filesize.log`.
      - Scope: authored size gate.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:02:44.770Z — VERIFY — ok

    By: CODER

    Note: Verified: Calc sheet protection, native dialog responses and editing, grouped history, ODS persistence, focused tests and production Chromium.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:02:44.264Z, excerpt_hash=sha256:db74886beb425e5ae2e9c090e84b227acbab0bf84a9ca802931339ece8569cf9

    Details:

    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-sheet-protection tabprotection.password ods-sheet-protection excelfilter.sheet-protection excelfilter.enhanced-protection tabview2-protection protectionattr calc-sheet-popup ui-resources`.
      - Result: 43 distinct focused cases passed across the main run and the final two-file retry. The retry updated the source tab menu expectation and waited for the real asynchronous Web Crypto result before asserting grouped protection.
      - Evidence: `output/calc-task15-final-calc.log` and `output/calc-task15-calc-retry.log`.
      - Scope: the ported protectSheet.py test, eight permission options, accepted and incorrect passwords, Cancel, protected input, checked and tab lock state, grouped Undo/Redo, ODS reopens, legacy Excel digests and SHA-based OOXML verifiers.
    - Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
      - Result: pass.
      - Evidence: `output/calc-task15-types.log`, `output/calc-task15-static.log`, `output/calc-task15-final-lint.log` and `output/calc-task15-final-format.log`.
      - Scope: repository types, build and production assets, and changed source.
    - Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
      - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
      - Evidence: `output/calc-task15-{deps,resources,provenance,inventory,source-tree,routing,doctor}.log`.
      - Scope: module dependency boundaries, pinned resources, provenance, inventory and task workflow.
    - Command: `playwright-cli -s=calc-task15-final run-code --filename smoke.js` on the local production preview.
      - Result: pass. The menu opens the native sheet dialog, password confirmation updates the sheet flag, the wrong password opens the native information prompt, the correct password unlocks it, and Undo restores the tab lock.
      - Evidence: `output/playwright/calc-task15/smoke.log`.
      - Scope: actual Chromium modal flow, lock marker, command binding, password verification and history.
    - Command: `npm run check:file-size`.
      - Result: repository-wide check reports seven pre-existing authored file limit violations. All changed authored files remain below the limit.
      - Evidence: `output/calc-task15-filesize.log`.
      - Scope: authored size gate.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220050-2Z7YAP/blueprint/resolved-snapshot.json
    - old_digest: 58c69e45af8bdd59b3172233de9be549cb056dd2405501944f40ebe8428f4d1d
    - current_digest: 58c69e45af8bdd59b3172233de9be549cb056dd2405501944f40ebe8428f4d1d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220050-2Z7YAP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220050-2Z7YAP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. Imported protection remains in the existing ScTableProtection record."
  Findings: |-
    - CALC-824 records the native completion of a copied unprotect request after incorrect password or cancel. The sheet state remains protected in these cases.
    - CALC-825 records the native history consequence of applying protection to a group with existing protected members. Undo follows the original state transition.
    - This browser slice stores the new preferred ODF SHA-1 verifier instead of retaining plaintext in the workbook. Imported ODF, legacy Excel and SHA-based OOXML digests are verified by the supported source branch. Browser Web Crypto does not provide the legacy OOXML MD5 digest. The desktop zxcvbn-c strength meter has no local browser implementation.
    - Workbook structure protection and file encryption have separate command and storage paths. Existing document save and open behavior stays within the established browser workflow.
    - This is the fifth task of the current ten-task checkpoint interval. Five additional tasks precede the full suite run.
id_source: "generated"
---
## Summary

Connect Calc sheet protection and edit permissions

Expose the native Calc sheet protection command, original protection and password prompts, and existing sheet protection state through menus, tabs, and document history.

## Scope

Cover the source FID_PROTECT_TABLE flow, spreadsheet sheet options and credentials, supported imported verifiers, grouped native document operations, tab lock presentation and original undo semantics. Preserve current save and open policy. The workbook structure and file-level protection commands are separate.

## Plan

Connect the pinned view and document protection commands for sheets, existing protection storage, native options and password prompts, selected tabs, checked and tab lock presentation, and protection-specific history. Verify both newly protected and imported protected sheets in the existing document format flow.

## Verify Steps

- Run targeted Calc tests for native sheet protection, original dialog order and defaults, password input and verification, selection and edit restrictions, grouped Undo and Redo and ODS round trip. Port the protectSheet.py regression.
- Run repository typecheck, changed-source lint and format, source tree, dependencies, provenance and Calc resources, inventory, AgentPlane routing and doctor.
- Verify the actual Calc protection command and dialog in local production Chromium. This is task five of the ten-task checkpoint interval.

## Verification

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-sheet-protection tabprotection.password ods-sheet-protection excelfilter.sheet-protection excelfilter.enhanced-protection tabview2-protection protectionattr calc-sheet-popup ui-resources`.
  - Result: 43 distinct focused cases passed across the main run and the final two-file retry. The retry updated the source tab menu expectation and waited for the real asynchronous Web Crypto result before asserting grouped protection.
  - Evidence: `output/calc-task15-final-calc.log` and `output/calc-task15-calc-retry.log`.
  - Scope: the ported protectSheet.py test, eight permission options, accepted and incorrect passwords, Cancel, protected input, checked and tab lock state, grouped Undo/Redo, ODS reopens, legacy Excel digests and SHA-based OOXML verifiers.
- Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
  - Result: pass.
  - Evidence: `output/calc-task15-types.log`, `output/calc-task15-static.log`, `output/calc-task15-final-lint.log` and `output/calc-task15-final-format.log`.
  - Scope: repository types, build and production assets, and changed source.
- Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
  - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
  - Evidence: `output/calc-task15-{deps,resources,provenance,inventory,source-tree,routing,doctor}.log`.
  - Scope: module dependency boundaries, pinned resources, provenance, inventory and task workflow.
- Command: `playwright-cli -s=calc-task15-final run-code --filename smoke.js` on the local production preview.
  - Result: pass. The menu opens the native sheet dialog, password confirmation updates the sheet flag, the wrong password opens the native information prompt, the correct password unlocks it, and Undo restores the tab lock.
  - Evidence: `output/playwright/calc-task15/smoke.log`.
  - Scope: actual Chromium modal flow, lock marker, command binding, password verification and history.
- Command: `npm run check:file-size`.
  - Result: repository-wide check reports seven pre-existing authored file limit violations. All changed authored files remain below the limit.
  - Evidence: `output/calc-task15-filesize.log`.
  - Scope: authored size gate.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:02:44.770Z — VERIFY — ok

By: CODER

Note: Verified: Calc sheet protection, native dialog responses and editing, grouped history, ODS persistence, focused tests and production Chromium.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:02:44.264Z, excerpt_hash=sha256:db74886beb425e5ae2e9c090e84b227acbab0bf84a9ca802931339ece8569cf9

Details:

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-sheet-protection tabprotection.password ods-sheet-protection excelfilter.sheet-protection excelfilter.enhanced-protection tabview2-protection protectionattr calc-sheet-popup ui-resources`.
  - Result: 43 distinct focused cases passed across the main run and the final two-file retry. The retry updated the source tab menu expectation and waited for the real asynchronous Web Crypto result before asserting grouped protection.
  - Evidence: `output/calc-task15-final-calc.log` and `output/calc-task15-calc-retry.log`.
  - Scope: the ported protectSheet.py test, eight permission options, accepted and incorrect passwords, Cancel, protected input, checked and tab lock state, grouped Undo/Redo, ODS reopens, legacy Excel digests and SHA-based OOXML verifiers.
- Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
  - Result: pass.
  - Evidence: `output/calc-task15-types.log`, `output/calc-task15-static.log`, `output/calc-task15-final-lint.log` and `output/calc-task15-final-format.log`.
  - Scope: repository types, build and production assets, and changed source.
- Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
  - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
  - Evidence: `output/calc-task15-{deps,resources,provenance,inventory,source-tree,routing,doctor}.log`.
  - Scope: module dependency boundaries, pinned resources, provenance, inventory and task workflow.
- Command: `playwright-cli -s=calc-task15-final run-code --filename smoke.js` on the local production preview.
  - Result: pass. The menu opens the native sheet dialog, password confirmation updates the sheet flag, the wrong password opens the native information prompt, the correct password unlocks it, and Undo restores the tab lock.
  - Evidence: `output/playwright/calc-task15/smoke.log`.
  - Scope: actual Chromium modal flow, lock marker, command binding, password verification and history.
- Command: `npm run check:file-size`.
  - Result: repository-wide check reports seven pre-existing authored file limit violations. All changed authored files remain below the limit.
  - Evidence: `output/calc-task15-filesize.log`.
  - Scope: authored size gate.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220050-2Z7YAP/blueprint/resolved-snapshot.json
- old_digest: 58c69e45af8bdd59b3172233de9be549cb056dd2405501944f40ebe8428f4d1d
- current_digest: 58c69e45af8bdd59b3172233de9be549cb056dd2405501944f40ebe8428f4d1d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220050-2Z7YAP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220050-2Z7YAP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. Imported protection remains in the existing ScTableProtection record.

## Findings

- CALC-824 records the native completion of a copied unprotect request after incorrect password or cancel. The sheet state remains protected in these cases.
- CALC-825 records the native history consequence of applying protection to a group with existing protected members. Undo follows the original state transition.
- This browser slice stores the new preferred ODF SHA-1 verifier instead of retaining plaintext in the workbook. Imported ODF, legacy Excel and SHA-based OOXML digests are verified by the supported source branch. Browser Web Crypto does not provide the legacy OOXML MD5 digest. The desktop zxcvbn-c strength meter has no local browser implementation.
- Workbook structure protection and file encryption have separate command and storage paths. Existing document save and open behavior stays within the established browser workflow.
- This is the fifth task of the current ten-task checkpoint interval. Five additional tasks precede the full suite run.
