---
id: "202610181808-2BTWEE"
title: "Share file dialogs and wire Calc file menu workflows"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T18:08:53.530Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T18:31:17.482Z"
  updated_by: "CODER"
  note: "AllCalc263tests100% all metrics;related247tests100% touched shared/Writer presentation. Chromium native File/Edit IDs,shared header/toolbar,captions and real primary ODS open verified. Build,typecheck,style,architecture/source/registry/doctor/routing gates pass. Task7/10."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Share actual Writer file-dialog components and connect Calc ODS File commands through canonical shell/primary IO and shared menus;verify both suites and production browser."
events:
  -
    type: "status"
    at: "2026-10-18T18:08:54.347Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Share actual Writer file-dialog components and connect Calc ODS File commands through canonical shell/primary IO and shared menus;verify both suites and production browser."
  -
    type: "verify"
    at: "2026-10-18T18:31:17.482Z"
    author: "CODER"
    state: "ok"
    note: "AllCalc263tests100% all metrics;related247tests100% touched shared/Writer presentation. Chromium native File/Edit IDs,shared header/toolbar,captions and real primary ODS open verified. Build,typecheck,style,architecture/source/registry/doctor/routing gates pass. Task7/10."
doc_version: 3
doc_updated_at: "2026-10-18T18:31:17.586Z"
doc_updated_by: "CODER"
description: "Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts."
sections:
  Summary: |-
    Share file dialogs and wire Calc file menu workflows

    Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.
  Scope: |-
    - In scope: Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.
    - Out of scope: unrelated refactors not required for "Share file dialogs and wire Calc file menu workflows".
  Plan: "Extract common BrowserFileDialog,DialogHeader,NameCollisionPanel and observable file-dialog controller into framework/browser;Writer adapters keep ODT/TXT semantics,modal markers and existing DOM behavior. Shared dialog receives suite IO callbacks and format/download resources;no suite model imports. Share modal CSS with permanent Writer aliases. Compose Calc ODS adapter and session workflow Sfx slots for original Open,SaveAs,Export commands;use shared CommandMenuBar/CommandButton in Calc File/Edit menus and standard toolbar. Commit input before file operations;flush autosave before replacement/copy;read actual ODS candidates and persist imported identity;downloads use shared export port and actual shell Export state without changing primary medium or dirty/save position. Tests cover browser/computer tabs,collision rename/overwrite/cancel,errors,focus,download bytes and actual menu-to-Sfx ownership;related Writer tests remain green. Up to60non-task files including source/provenance/capability metadata. Full menu-resource/chrome breadth follows approved task8/9;this is task7/10."
  Verify Steps: "1. All Calc test:coverage:calc passes100% four metrics including new file workflows and mounted production menus/dialogs. 2. Related Writer FileDialog,current-dialog-baseline,title-collision,Desktop,module and file workflow tests;targeted100% shared extracted dialog/controller/header/collision coverage using these relevant suites. 3. Application typecheck/build,touched lint/format,dependencies/docs/file-size/source-tree/provenance and Calc/shared/Writer scoped registry gates. 4. Production browser File menu open/save-as/export dialogs exercise real primary ODS documents;actual integration tests cover import/overwrite/download and primary identity/dirty-state preservation,failure retention and input/flush ordering. No full all-app run until task10 under user cadence. Doctor/routing checks pass."
  Verification: |-
    Command: npm run test:coverage:calc
    Result: pass
    Evidence: calc-coverage.log;263tests,98files;all statements/branches/functions/lines100%.
    Scope: All Calc runtime;actual file slots,menu/toolbar resources,ODS import/browser copy/collision/export,canonical owner and medium/history preservation.

    Command: npm run test:coverage -- WriterFileDialog.test current-dialog-baseline.test writer-view-title-collision.test desktop.test writer-module.test writer-workflows.test calc-files.test WriterPageLayout.test CommandMenuBar native-menubar native-disabled-menubar native-empty-menubar WriterMenuBar.test native-context-menu.test --coverage.include='src/framework/browser/presentation/BrowserFileDialog.tsx' --coverage.include='src/framework/browser/presentation/DialogHeader.tsx' --coverage.include='src/framework/browser/presentation/NameCollisionPanel.tsx' --coverage.include='src/framework/browser/presentation/OfficeWorkspaceHeader.tsx' --coverage.include='src/framework/browser/presentation/CommandMenuBar.tsx' --coverage.include='src/framework/browser/workflows/file-dialog-controller.ts' --coverage.include='src/sw/browser/presentation/WriterFileDialog.tsx' --coverage.include='src/sw/browser/presentation/WriterWorkspaceChrome.tsx' --coverage.reportsDirectory=coverage/calc-shared-files
    Result: pass
    Evidence: shared-coverage.log;247tests,24files;408/408statements,358/358branches,112/112functions,364/364lines;all100%.
    Scope: Extracted shared file/header presentation,original Writer domain adapters,affected Writer layout/files and all related menu/context behavior.

    Command: npm run test:shared -- CommandMenuBar.test
    Result: pass
    Evidence: menu-regression.log;7tests including literal native UNO and quoted submenu identities.
    Scope: Reported File/Edit browser crash;popup lookup remains scoped to its own menubar.

    Command: npm run typecheck --workspace @vite-office/office; npm run build
    Result: pass
    Evidence: typecheck.log,build.log;existing bundle-size advisory remains.
    Scope: Complete application compile and static production bundle.

    Command: node .agentplane/tasks/202610181808-2BTWEE/touched-checks.mjs
    Result: pass
    Evidence: style.log contains exact Prettier/ESLint argument lists;63non-task paths.
    Scope: All changed/new application source,tests,CSS and registry formatting;no policy/config relaxation.

    Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
    Result: pass
    Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log;839runtime provenance modules.
    Scope: Module boundaries,source contracts and required provenance. Shared presentation injects file-reading IO instead of importing VCL across a forbidden framework edge.

    Command: npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer
    Result: pass
    Evidence: parity-calc.log,parity-shared.log,parity-writer.log;compact scalar summaries with raw-outputSHA256;zero semantic violations.
    Scope: Runtime/provenance/capability records. Resource projections map to original XML;Writer alias boundaries attribute implementations to shared framework owners. Whole-native UI parity is not claimed.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: doctor.log,routing.log;doctorOK with the existing managed-shim readiness advisory;policy routingOK.
    Scope: Repository lifecycle readiness;unrelated shim remains unchanged.

    Command: Production browser /calc:repeat File/Edit open-close;open existing primary ODS;open Save As/Export;inspect shared header/toolbar geometry and shortcut captions
    Result: pass
    Evidence: browser-review.json;three cycles,no crashes,correct Ctrl captions,adjacent title/menu,same standard-button classes,576pixel shared modal,background inert,actual saved42/84 restored;zero console errors/warnings.
    Scope: Chromium production behavior in addition to jsdom integration evidence.

    Skipped: Full all-app regression
    Reason: User requires a full run once per10Agentplane tasks;this is UI-cycle task7.
    Risk: Only Calc and related Writer/shared behavior are validated at this step.
    Approval: User goal testing instructions.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T18:31:17.482Z — VERIFY — ok

    By: CODER

    Note: AllCalc263tests100% all metrics;related247tests100% touched shared/Writer presentation. Chromium native File/Edit IDs,shared header/toolbar,captions and real primary ODS open verified. Build,typecheck,style,architecture/source/registry/doctor/routing gates pass. Task7/10.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T18:31:05.582Z, excerpt_hash=sha256:8a000065674b745d39d817b752063024c470fa158a3d2ced2c00f0e1213b24e0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181808-2BTWEE/blueprint/resolved-snapshot.json
    - old_digest: c9deece3267f8412164866f0d6d904c01fd4bffc6877ca217855c9718e04486b
    - current_digest: c9deece3267f8412164866f0d6d904c01fd4bffc6877ca217855c9718e04486b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181808-2BTWEE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181808-2BTWEE -m 🧩 2BTWEE task: persist canonical task artifacts --allow-tasks
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
  Findings: "Implemented shared Writer/Calc BrowserFileDialog,DialogHeader,NameCollisionPanel,dialog requests and OfficeWorkspaceHeader. Actual Calc OpenFromCalc26204/SaveAs5502/ExportTo5829 route through shared Sfx/menu/toolbar presentation and real ODS/primary IO. User browser feedback exposed the native-UNO CSS selector crash and duplicated header/format-button styling;fixed source popup lookup to literal owned identities,extracted actual Writer chrome and used CommandToolbarItems with its default standard buttons. Menus now sit beside title;Save As stays in File;shortcuts normalize toCtrl+O/Ctrl+Shift+S/Ctrl+Z/Ctrl+Shift+Z as Writer. Production browser confirms three File/Edit cycles,actual primary42/84 document open,shared modals and zero warnings/errors. New regression covers dotted/colon/quoted IDs;jsdom alone had not exposed Chromium selector rejection. Framework module boundary gate required injecting file-byte reading rather than a VCL import;no boundary rules were relaxed. Registry records now assign shared aliases to their real implementation owners and resource projections to pinned XML. Scope63non-task files is within60+5tolerance and the user-requested shared-chrome correction. Final allCalc263tests100%;related247tests100% touched shared/Writer presentation coverage. Full native menus/resource/chrome breadth remains subsequent approved work;task7/10,full regression at10. No merges/network/outside-checkout edits;existing bundle-size and doctor-shim advisories remain unchanged."
id_source: "generated"
---
## Summary

Share file dialogs and wire Calc file menu workflows

Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.

## Scope

- In scope: Approved UI plan task7/10. Extract Writer file dialog presentation,modal header,title-collision panel and dialog requests into shared framework browser modules,retaining permanent suite adapters and identical Writer behavior/style. Connect Calc File commands/menu and toolbar to real ODS browser open/import/save-as/download and collision workflows,using shared menu/command controls,primary store,autosave flush and canonical shell/view owners. Add actual shell Export boundary preserving primary identity and dirty state. UI adapters validate/commit current input before file operations,retain errors and source focus. Up to60non-task files including required metadata and focused tests. Full native menu/resource and remaining chrome/interaction breadth is subsequent work;no network,merges or other checkouts.
- Out of scope: unrelated refactors not required for "Share file dialogs and wire Calc file menu workflows".

## Plan

Extract common BrowserFileDialog,DialogHeader,NameCollisionPanel and observable file-dialog controller into framework/browser;Writer adapters keep ODT/TXT semantics,modal markers and existing DOM behavior. Shared dialog receives suite IO callbacks and format/download resources;no suite model imports. Share modal CSS with permanent Writer aliases. Compose Calc ODS adapter and session workflow Sfx slots for original Open,SaveAs,Export commands;use shared CommandMenuBar/CommandButton in Calc File/Edit menus and standard toolbar. Commit input before file operations;flush autosave before replacement/copy;read actual ODS candidates and persist imported identity;downloads use shared export port and actual shell Export state without changing primary medium or dirty/save position. Tests cover browser/computer tabs,collision rename/overwrite/cancel,errors,focus,download bytes and actual menu-to-Sfx ownership;related Writer tests remain green. Up to60non-task files including source/provenance/capability metadata. Full menu-resource/chrome breadth follows approved task8/9;this is task7/10.

## Verify Steps

1. All Calc test:coverage:calc passes100% four metrics including new file workflows and mounted production menus/dialogs. 2. Related Writer FileDialog,current-dialog-baseline,title-collision,Desktop,module and file workflow tests;targeted100% shared extracted dialog/controller/header/collision coverage using these relevant suites. 3. Application typecheck/build,touched lint/format,dependencies/docs/file-size/source-tree/provenance and Calc/shared/Writer scoped registry gates. 4. Production browser File menu open/save-as/export dialogs exercise real primary ODS documents;actual integration tests cover import/overwrite/download and primary identity/dirty-state preservation,failure retention and input/flush ordering. No full all-app run until task10 under user cadence. Doctor/routing checks pass.

## Verification

Command: npm run test:coverage:calc
Result: pass
Evidence: calc-coverage.log;263tests,98files;all statements/branches/functions/lines100%.
Scope: All Calc runtime;actual file slots,menu/toolbar resources,ODS import/browser copy/collision/export,canonical owner and medium/history preservation.

Command: npm run test:coverage -- WriterFileDialog.test current-dialog-baseline.test writer-view-title-collision.test desktop.test writer-module.test writer-workflows.test calc-files.test WriterPageLayout.test CommandMenuBar native-menubar native-disabled-menubar native-empty-menubar WriterMenuBar.test native-context-menu.test --coverage.include='src/framework/browser/presentation/BrowserFileDialog.tsx' --coverage.include='src/framework/browser/presentation/DialogHeader.tsx' --coverage.include='src/framework/browser/presentation/NameCollisionPanel.tsx' --coverage.include='src/framework/browser/presentation/OfficeWorkspaceHeader.tsx' --coverage.include='src/framework/browser/presentation/CommandMenuBar.tsx' --coverage.include='src/framework/browser/workflows/file-dialog-controller.ts' --coverage.include='src/sw/browser/presentation/WriterFileDialog.tsx' --coverage.include='src/sw/browser/presentation/WriterWorkspaceChrome.tsx' --coverage.reportsDirectory=coverage/calc-shared-files
Result: pass
Evidence: shared-coverage.log;247tests,24files;408/408statements,358/358branches,112/112functions,364/364lines;all100%.
Scope: Extracted shared file/header presentation,original Writer domain adapters,affected Writer layout/files and all related menu/context behavior.

Command: npm run test:shared -- CommandMenuBar.test
Result: pass
Evidence: menu-regression.log;7tests including literal native UNO and quoted submenu identities.
Scope: Reported File/Edit browser crash;popup lookup remains scoped to its own menubar.

Command: npm run typecheck --workspace @vite-office/office; npm run build
Result: pass
Evidence: typecheck.log,build.log;existing bundle-size advisory remains.
Scope: Complete application compile and static production bundle.

Command: node .agentplane/tasks/202610181808-2BTWEE/touched-checks.mjs
Result: pass
Evidence: style.log contains exact Prettier/ESLint argument lists;63non-task paths.
Scope: All changed/new application source,tests,CSS and registry formatting;no policy/config relaxation.

Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
Result: pass
Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log;839runtime provenance modules.
Scope: Module boundaries,source contracts and required provenance. Shared presentation injects file-reading IO instead of importing VCL across a forbidden framework edge.

Command: npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer
Result: pass
Evidence: parity-calc.log,parity-shared.log,parity-writer.log;compact scalar summaries with raw-outputSHA256;zero semantic violations.
Scope: Runtime/provenance/capability records. Resource projections map to original XML;Writer alias boundaries attribute implementations to shared framework owners. Whole-native UI parity is not claimed.

Command: ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: doctor.log,routing.log;doctorOK with the existing managed-shim readiness advisory;policy routingOK.
Scope: Repository lifecycle readiness;unrelated shim remains unchanged.

Command: Production browser /calc:repeat File/Edit open-close;open existing primary ODS;open Save As/Export;inspect shared header/toolbar geometry and shortcut captions
Result: pass
Evidence: browser-review.json;three cycles,no crashes,correct Ctrl captions,adjacent title/menu,same standard-button classes,576pixel shared modal,background inert,actual saved42/84 restored;zero console errors/warnings.
Scope: Chromium production behavior in addition to jsdom integration evidence.

Skipped: Full all-app regression
Reason: User requires a full run once per10Agentplane tasks;this is UI-cycle task7.
Risk: Only Calc and related Writer/shared behavior are validated at this step.
Approval: User goal testing instructions.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T18:31:17.482Z — VERIFY — ok

By: CODER

Note: AllCalc263tests100% all metrics;related247tests100% touched shared/Writer presentation. Chromium native File/Edit IDs,shared header/toolbar,captions and real primary ODS open verified. Build,typecheck,style,architecture/source/registry/doctor/routing gates pass. Task7/10.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T18:31:05.582Z, excerpt_hash=sha256:8a000065674b745d39d817b752063024c470fa158a3d2ced2c00f0e1213b24e0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181808-2BTWEE/blueprint/resolved-snapshot.json
- old_digest: c9deece3267f8412164866f0d6d904c01fd4bffc6877ca217855c9718e04486b
- current_digest: c9deece3267f8412164866f0d6d904c01fd4bffc6877ca217855c9718e04486b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181808-2BTWEE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181808-2BTWEE -m 🧩 2BTWEE task: persist canonical task artifacts --allow-tasks
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

Implemented shared Writer/Calc BrowserFileDialog,DialogHeader,NameCollisionPanel,dialog requests and OfficeWorkspaceHeader. Actual Calc OpenFromCalc26204/SaveAs5502/ExportTo5829 route through shared Sfx/menu/toolbar presentation and real ODS/primary IO. User browser feedback exposed the native-UNO CSS selector crash and duplicated header/format-button styling;fixed source popup lookup to literal owned identities,extracted actual Writer chrome and used CommandToolbarItems with its default standard buttons. Menus now sit beside title;Save As stays in File;shortcuts normalize toCtrl+O/Ctrl+Shift+S/Ctrl+Z/Ctrl+Shift+Z as Writer. Production browser confirms three File/Edit cycles,actual primary42/84 document open,shared modals and zero warnings/errors. New regression covers dotted/colon/quoted IDs;jsdom alone had not exposed Chromium selector rejection. Framework module boundary gate required injecting file-byte reading rather than a VCL import;no boundary rules were relaxed. Registry records now assign shared aliases to their real implementation owners and resource projections to pinned XML. Scope63non-task files is within60+5tolerance and the user-requested shared-chrome correction. Final allCalc263tests100%;related247tests100% touched shared/Writer presentation coverage. Full native menus/resource/chrome breadth remains subsequent approved work;task7/10,full regression at10. No merges/network/outside-checkout edits;existing bundle-size and doctor-shim advisories remain unchanged.
