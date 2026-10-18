---
id: "202610181929-YDAWMM"
title: "Correct shared office menu and Calc grid accessibility semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T19:29:30.556Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T19:57:17.835Z"
  updated_by: "CODER"
  note: "Calc271tests100percent;affected32files286tests and3runtime-renderers100percent;all6foundation/launcher/geometry cases pass with zero axe violations;full browser372passed and final2conditional-root-query repairs pass in3-case focused run. Types/build/style/module/source/registry/doctor/routing pass;see verification.md. Native owners,commands and visual style preserved."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T19:57:49.048Z"
  updated_by: "EVALUATOR"
  note: "Actual shared menu/title and Calc header/status ARIA defects are repaired without suite forks or weaker native UI assertions."
  evaluated_sha: "cf90142089d1eddcc3942ee15572d3b883ad7441"
  blueprint_digest: "9bd3047f67d6af18dd96da25a5b55b93729b451e08ad6552a58a570ab354c075"
  evidence_refs:
    - ".agentplane/tasks/202610181929-YDAWMM/README.md"
    - ".agentplane/tasks/202610181929-YDAWMM/quality/20261018-195749048-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181929-YDAWMM/quality/20261018-195749048-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181929-YDAWMM/quality/20261018-195749048-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181929-YDAWMM/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610181929-YDAWMM/verification.md"
    - ".agentplane/tasks/202610181929-YDAWMM/related-final.log"
    - ".agentplane/tasks/202610181929-YDAWMM/axe-final.log"
    - ".agentplane/tasks/202610181929-YDAWMM/browser-boundary-final.log"
  findings:
    - "Shared top triggers retain native HTML buttons and command/focus behavior while exposing menuitem semantics;title and grid/status structure now pass real axe. Calc271tests has100percent raw coverage;286focused cases cover every repaired broad-run failure and3affected renderers100percent. Complete browser run accounts for374cases after the2conditional-root query repairs;all6foundation/launcher/geometry cases and current built Calc GoToSheet pass. Source,type,build,style and registry gates pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Repair shared menu/title and Calc grid header accessibility semantics exposed by full browser regression;preserve actual commands and styling and migrate related test roles without weakened gates."
events:
  -
    type: "status"
    at: "2026-10-18T19:29:33.147Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Repair shared menu/title and Calc grid header accessibility semantics exposed by full browser regression;preserve actual commands and styling and migrate related test roles without weakened gates."
  -
    type: "verify"
    at: "2026-10-18T19:57:17.835Z"
    author: "CODER"
    state: "ok"
    note: "Calc271tests100percent;affected32files286tests and3runtime-renderers100percent;all6foundation/launcher/geometry cases pass with zero axe violations;full browser372passed and final2conditional-root-query repairs pass in3-case focused run. Types/build/style/module/source/registry/doctor/routing pass;see verification.md. Native owners,commands and visual style preserved."
doc_version: 3
doc_updated_at: "2026-10-18T19:57:17.885Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network."
sections:
  Summary: |-
    Correct shared office menu and Calc grid accessibility semantics

    Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.
  Scope: |-
    - In scope: Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.
    - Out of scope: unrelated refactors not required for "Correct shared office menu and Calc grid accessibility semantics".
  Plan: "Repair actual accessibility defects exposed by task10 axe checks using proper shared semantics,not audit exclusions or Calc-only forks. Use menuitem roles for original shared top-menu buttons;add h1 around shared document title;wrap Calc selection header buttons in rowheader/columnheader elements with correct corner name. Preserve DOM control behavior,keyboard focus,styling and real Sfx/controller ownership. Migrate only affected menu/header role queries and scoped browser selectors,retaining all behavioral assertions. Up to230non-task paths including related tests and provenance;no kernel,network,branch or UI-style expansion. Wait for currently live full application coverage71940/PID26563 before runtime mutation;then validate Calc100percent,shared menu/header100percent,affected Writer/Calc tests,all relevant E2E axe/geometry and standard gates. Task10 stays pending until this repair is verified."
  Verify Steps: "1. Actual Calc foundation/launcher axe analyses return zero violations and three Writer dialog geometry cases pass without exclusions. 2. AllCalc coverage100percent all4metrics and affected shared CommandMenuBar/OfficeWorkspaceHeader100percent plus affected Writer/common menu/header tests pass;native pointer/keyboard/header selection behavior remains real. 3. App/tools typecheck,build,touched style,module boundaries,docs,size,source-tree/provenance,scoped Calc/shared/Writer registry,doctor/routing pass. 4. Relevant existing browser menu/dialog behavior tests pass after semantic query migrations;no native assertions or thresholds are relaxed. Preserve task10 full16998case application run and cadence evidence;do not restart live jobs."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T19:57:17.835Z — VERIFY — ok

    By: CODER

    Note: Calc271tests100percent;affected32files286tests and3runtime-renderers100percent;all6foundation/launcher/geometry cases pass with zero axe violations;full browser372passed and final2conditional-root-query repairs pass in3-case focused run. Types/build/style/module/source/registry/doctor/routing pass;see verification.md. Native owners,commands and visual style preserved.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T19:57:17.306Z, excerpt_hash=sha256:23e656c0012c1362e030a43dbb18296cb8b4a12c7869079bc5a6cc2348d3f731

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181929-YDAWMM/blueprint/resolved-snapshot.json
    - old_digest: 9bd3047f67d6af18dd96da25a5b55b93729b451e08ad6552a58a570ab354c075
    - current_digest: 9bd3047f67d6af18dd96da25a5b55b93729b451e08ad6552a58a570ab354c075
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181929-YDAWMM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181929-YDAWMM -m 🧩 YDAWMM task: persist canonical task artifacts --allow-tasks
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
  Findings: |-
    Command: npm run test:coverage:calc
    Result: pass
    Evidence: 102files,271tests;100% statements6433/6433,branches4134/4134,functions1334/1334,lines5770/5770 (calc-coverage.log).
    Scope: Entire current Calc application after semantic markup repair,including real grid header selection,input,Go to Sheet and sheet/history/file operations.

    Command: DEBUG_PRINT_LIMIT=1000 npm run test:coverage -- src/sw/browser src/framework/browser src/sc --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/OfficeWorkspaceHeader.tsx --coverage.include=src/sc/browser/presentation/ScGridWindow.tsx --coverage.reportsDirectory=coverage/office-accessibility
    Result: initial query migrations required repair
    Evidence: 1709passed,14failed in8files (related-ui.log);failures referenced old top-button roles or ambiguous root/submenu Insert queries. No production command/selection behavior failure was identified. Queries now select actual root menuitems or the owned Table popup.
    Scope: Broad affected browser UI graph,319files/1723cases.

    Command: DEBUG_PRINT_LIMIT=1000 npm run test:coverage -- CommandMenuBar native-menubar native-disabled-menubar native-empty-menubar native-context-menu WriterMenuBar.test WriterPageLayout.test calc-files.test calc-presenters.test writer-view-document-key.test native-hyperlink-begin-edit.test native-numeric-row-insertion.test native-table-column-commands.test native-table-row-commands.test native-independent-column-insertion.test native-internet-edit-range.test native-internet-state-query.test --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/OfficeWorkspaceHeader.tsx --coverage.include=src/sc/browser/presentation/ScGridWindow.tsx --coverage.reportsDirectory=coverage/office-accessibility
    Result: pass
    Evidence: 32files/286cases,including every repaired broad-run case;100% statements306/306,branches273/273,functions74/74,lines272/272 (related-final.log).
    Scope: Actual shared menubar/title and Calc grid renderers,all previously failing native Writer UI cases,and native keyboard/focus/command contracts. Assertions and thresholds remain intact.

    Command: npx playwright test --config apps/office/playwright.config.ts foundation.spec.ts shared/launcher.spec.ts writer-dialog-layout.spec.ts
    Result: pass
    Evidence: All6cases pass (axe-final.log):zero actual Calc axe violations,editable scalar+Undo,shared launcher,three Writer dialog geometry viewports.
    Scope: Built shared Writer/Calc chrome and actual Calc grid/status semantics.

    Command: npx playwright test --config apps/office/playwright.config.ts
    Result: 372passed;2remaining test-role queries repaired and revalidated
    Evidence: browser-regression.log records the complete374-case run. Only Home/End root-boundary cases still queried a button with a conditional File/Tools name. Both were updated to actual root menuitems;the focused file then passes all3cases (browser-boundary-final.log). No production changes followed that full browser run.
    Scope: All existing browser menu/dialog,editing,layout and shared-runtime acceptance cases;all374 original cases are accounted for after the focused query repair.

    Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181929-YDAWMM/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: App/tools types and production build pass;touched style and all module/docs/size/source gates pass;844runtime modules mapped and zero scoped semantic violations;doctorOK/routingOK. Existing chunk-size and managed-shim advisories remain unchanged.
    Scope: Four runtime presentation modules,mechanical test-query migrations and bounded provenance updates;no kernel/command-state/style defaults were changed.

    Command: Production Chromium http://127.0.0.1:5176/calc after semantic repair
    Result: pass
    Evidence: browser-calc-review.json confirms real h1,11top menuitems,native selection button inside columnheader,valid DIV status owner and Go to Sheet double-click returning to actual Sheet1;console0errors/0warnings.
    Scope: Final built Calc owner chain and shared menu controls.

    Cadence evidence: Task10 full application retry passes all16998cases/987files with100% all4metrics;full inventory123cases100% and tooling107cases pass. These results live under202610181859-1J8SQQ. This leaf uses only affected-module and browser verification after that scheduled full baseline.

    Remaining scope: The overall Calc UI goal remains active. Unported formatting/input-mode/context-menu/clipboard services and broader chrome fidelity are recorded in task10 remaining-ui-audit.md. Correct browser ARIA does not certify whole native UI/accessibility parity.
id_source: "generated"
---
## Summary

Correct shared office menu and Calc grid accessibility semantics

Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.

## Scope

- In scope: Approved Calc UI goal repair discovered by task10 full browser regression. Preserve exact Writer/Calc shared visual components and native command behavior while correcting actual ARIA semantics:top-level shared menubar triggers become menuitems,document title gains semantic h1,and Calc row/column/corner headers wrap native selection buttons in proper header elements. Migrate affected shared/Writer/Calc unit and E2E role queries to the correct existing controls without weakening assertions. No new core services or style differences. Up to230non-task paths because top-menu queries span existing tests. AllCalc100percent,touched shared/header/menu100percent,affected Writer/Calc menu/UI tests,source/registry/style/type/build gates and real full-foundation axe/geometry checks. Keep task10 pending until repair passes;full cadence application coverage is already running and must not be restarted or invalidated prematurely. Calc checkout/branch only,no merges/network.
- Out of scope: unrelated refactors not required for "Correct shared office menu and Calc grid accessibility semantics".

## Plan

Repair actual accessibility defects exposed by task10 axe checks using proper shared semantics,not audit exclusions or Calc-only forks. Use menuitem roles for original shared top-menu buttons;add h1 around shared document title;wrap Calc selection header buttons in rowheader/columnheader elements with correct corner name. Preserve DOM control behavior,keyboard focus,styling and real Sfx/controller ownership. Migrate only affected menu/header role queries and scoped browser selectors,retaining all behavioral assertions. Up to230non-task paths including related tests and provenance;no kernel,network,branch or UI-style expansion. Wait for currently live full application coverage71940/PID26563 before runtime mutation;then validate Calc100percent,shared menu/header100percent,affected Writer/Calc tests,all relevant E2E axe/geometry and standard gates. Task10 stays pending until this repair is verified.

## Verify Steps

1. Actual Calc foundation/launcher axe analyses return zero violations and three Writer dialog geometry cases pass without exclusions. 2. AllCalc coverage100percent all4metrics and affected shared CommandMenuBar/OfficeWorkspaceHeader100percent plus affected Writer/common menu/header tests pass;native pointer/keyboard/header selection behavior remains real. 3. App/tools typecheck,build,touched style,module boundaries,docs,size,source-tree/provenance,scoped Calc/shared/Writer registry,doctor/routing pass. 4. Relevant existing browser menu/dialog behavior tests pass after semantic query migrations;no native assertions or thresholds are relaxed. Preserve task10 full16998case application run and cadence evidence;do not restart live jobs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T19:57:17.835Z — VERIFY — ok

By: CODER

Note: Calc271tests100percent;affected32files286tests and3runtime-renderers100percent;all6foundation/launcher/geometry cases pass with zero axe violations;full browser372passed and final2conditional-root-query repairs pass in3-case focused run. Types/build/style/module/source/registry/doctor/routing pass;see verification.md. Native owners,commands and visual style preserved.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T19:57:17.306Z, excerpt_hash=sha256:23e656c0012c1362e030a43dbb18296cb8b4a12c7869079bc5a6cc2348d3f731

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181929-YDAWMM/blueprint/resolved-snapshot.json
- old_digest: 9bd3047f67d6af18dd96da25a5b55b93729b451e08ad6552a58a570ab354c075
- current_digest: 9bd3047f67d6af18dd96da25a5b55b93729b451e08ad6552a58a570ab354c075
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181929-YDAWMM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181929-YDAWMM -m 🧩 YDAWMM task: persist canonical task artifacts --allow-tasks
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

Command: npm run test:coverage:calc
Result: pass
Evidence: 102files,271tests;100% statements6433/6433,branches4134/4134,functions1334/1334,lines5770/5770 (calc-coverage.log).
Scope: Entire current Calc application after semantic markup repair,including real grid header selection,input,Go to Sheet and sheet/history/file operations.

Command: DEBUG_PRINT_LIMIT=1000 npm run test:coverage -- src/sw/browser src/framework/browser src/sc --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/OfficeWorkspaceHeader.tsx --coverage.include=src/sc/browser/presentation/ScGridWindow.tsx --coverage.reportsDirectory=coverage/office-accessibility
Result: initial query migrations required repair
Evidence: 1709passed,14failed in8files (related-ui.log);failures referenced old top-button roles or ambiguous root/submenu Insert queries. No production command/selection behavior failure was identified. Queries now select actual root menuitems or the owned Table popup.
Scope: Broad affected browser UI graph,319files/1723cases.

Command: DEBUG_PRINT_LIMIT=1000 npm run test:coverage -- CommandMenuBar native-menubar native-disabled-menubar native-empty-menubar native-context-menu WriterMenuBar.test WriterPageLayout.test calc-files.test calc-presenters.test writer-view-document-key.test native-hyperlink-begin-edit.test native-numeric-row-insertion.test native-table-column-commands.test native-table-row-commands.test native-independent-column-insertion.test native-internet-edit-range.test native-internet-state-query.test --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/OfficeWorkspaceHeader.tsx --coverage.include=src/sc/browser/presentation/ScGridWindow.tsx --coverage.reportsDirectory=coverage/office-accessibility
Result: pass
Evidence: 32files/286cases,including every repaired broad-run case;100% statements306/306,branches273/273,functions74/74,lines272/272 (related-final.log).
Scope: Actual shared menubar/title and Calc grid renderers,all previously failing native Writer UI cases,and native keyboard/focus/command contracts. Assertions and thresholds remain intact.

Command: npx playwright test --config apps/office/playwright.config.ts foundation.spec.ts shared/launcher.spec.ts writer-dialog-layout.spec.ts
Result: pass
Evidence: All6cases pass (axe-final.log):zero actual Calc axe violations,editable scalar+Undo,shared launcher,three Writer dialog geometry viewports.
Scope: Built shared Writer/Calc chrome and actual Calc grid/status semantics.

Command: npx playwright test --config apps/office/playwright.config.ts
Result: 372passed;2remaining test-role queries repaired and revalidated
Evidence: browser-regression.log records the complete374-case run. Only Home/End root-boundary cases still queried a button with a conditional File/Tools name. Both were updated to actual root menuitems;the focused file then passes all3cases (browser-boundary-final.log). No production changes followed that full browser run.
Scope: All existing browser menu/dialog,editing,layout and shared-runtime acceptance cases;all374 original cases are accounted for after the focused query repair.

Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181929-YDAWMM/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: App/tools types and production build pass;touched style and all module/docs/size/source gates pass;844runtime modules mapped and zero scoped semantic violations;doctorOK/routingOK. Existing chunk-size and managed-shim advisories remain unchanged.
Scope: Four runtime presentation modules,mechanical test-query migrations and bounded provenance updates;no kernel/command-state/style defaults were changed.

Command: Production Chromium http://127.0.0.1:5176/calc after semantic repair
Result: pass
Evidence: browser-calc-review.json confirms real h1,11top menuitems,native selection button inside columnheader,valid DIV status owner and Go to Sheet double-click returning to actual Sheet1;console0errors/0warnings.
Scope: Final built Calc owner chain and shared menu controls.

Cadence evidence: Task10 full application retry passes all16998cases/987files with100% all4metrics;full inventory123cases100% and tooling107cases pass. These results live under202610181859-1J8SQQ. This leaf uses only affected-module and browser verification after that scheduled full baseline.

Remaining scope: The overall Calc UI goal remains active. Unported formatting/input-mode/context-menu/clipboard services and broader chrome fidelity are recorded in task10 remaining-ui-audit.md. Correct browser ARIA does not certify whole native UI/accessibility parity.
