---
id: "202610182120-YSQ8VM"
title: "Restore native Calc standard toolbar composition using shared Writer controls and icons"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "All Calc coverage remains raw100percent in all four metrics; related framework and Writer toolbar tests pass; source/resource checks,typecheck/build,touched style,architecture/provenance/docs/size,scoped inventories,doctor/routing pass; built browser checks full toolbar order/icons/disabled state and accessibility at desktop/mobile. Full regression next task20."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T21:21:08.876Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T21:26:30.851Z"
  updated_by: "CODER"
  note: "Verified complete native visible standardbar through shared Writer controls/icons:293 Calc tests and raw100percent four metrics,29related tests,10source/resource and2Writer freshness cases,4built-browser viewport/axe cases;all declared gates pass. Evidence in task verification.md;overall goal remains active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T21:27:14.186Z"
  updated_by: "EVALUATOR"
  note: "Reviewed complete native visible Calc standardbar through actual shared Writer controls and icon vocabulary."
  evaluated_sha: "42f8c03e9b9befcf6407c9b3b4aa3a339857f868"
  blueprint_digest: "4ba338f8a5515a98439f1da0641a332afc88913d56ce90402ab4a1272967a8a7"
  evidence_refs:
    - ".agentplane/tasks/202610182120-YSQ8VM/README.md"
    - ".agentplane/tasks/202610182120-YSQ8VM/quality/20261018-212714186-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610182120-YSQ8VM/quality/20261018-212714186-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610182120-YSQ8VM/quality/20261018-212714186-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610182120-YSQ8VM/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610182120-YSQ8VM/verification.md"
    - ".agentplane/tasks/202610182120-YSQ8VM/browser.log"
    - ".agentplane/tasks/202610182120-YSQ8VM/calc-coverage.log"
  findings:
    - "Implementation42f8c03e9 removes both presentation-owned omission layers,retains native visibility and browser save-policy deviations,and uses actual Sfx disabled state. Source XML independently confirms30commands;real Writer regression preserves11original icons and source order. All293Calc tests have raw100percent across four metrics;29related cases,10source cases,2freshness cases and4built-browser geometry/axe cases pass. Changed20paths stay within approved scope;generated resources and execution slots are unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native Calc standard toolbar composition through shared Writer controls and icons; preserve actual Sfx availability and save policy."
events:
  -
    type: "status"
    at: "2026-10-18T21:21:12.879Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native Calc standard toolbar composition through shared Writer controls and icons; preserve actual Sfx availability and save policy."
  -
    type: "verify"
    at: "2026-10-18T21:26:30.851Z"
    author: "CODER"
    state: "ok"
    note: "Verified complete native visible standardbar through shared Writer controls/icons:293 Calc tests and raw100percent four metrics,29related tests,10source/resource and2Writer freshness cases,4built-browser viewport/axe cases;all declared gates pass. Evidence in task verification.md;overall goal remains active."
doc_version: 3
doc_updated_at: "2026-10-18T21:26:30.901Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers."
sections:
  Summary: |-
    Restore native Calc standard toolbar composition using shared Writer controls and icons

    Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.
  Scope: |-
    - In scope: Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.
    - Out of scope: unrelated refactors not required for "Restore native Calc standard toolbar composition using shared Writer controls and icons".
  Plan: "1.CODER projects the complete pinned visible standardbar after existing save-policy dispositions,without supported-slot filtering. 2.CODER shares Writer standard toolbar icons through framework and supplies Calc-specific icon additions without copying renderer or introducing handlers. Shared controls preserve unavailable entries disabled from actual Sfx bindings. 3.CODER adds source composition,bindings/dispatch,Writer regression and real-browser viewport/axe checks; runs all Calc raw100percent coverage plus related checks. Scope up to24 non-task files including four runtime owners,new shared icon module,tests and corresponding registry evidence. Goal approval already explicit; no external writes/network. UI task17; full regression at20."
  Verify Steps: "Run npm run test:coverage:calc with raw100percent statements,branches,functions,lines. Verify native visible standardbar order/visibility and every icon,unavailable entries disabled,real Open/Undo/Redo dispatch; no fake slots. Run related CommandToolbar and WriterCommandToolbar tests,source contracts and generated Calc/Writer resource freshness. Run app/tools typecheck/build,touched Prettier/eslint,dependency/docs/file-size/source-tree/provenance checks,Calc/shared/Writer scoped inventories,doctor/routing. Built browser tests desktop1280x800/mobile390x600 assert exact native toolbar order,SVG icons,disabled unsupported commands,actual edit Undo/Redo,toolbar overflow and unfiltered axe with no page errors. Full regression next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T21:26:30.851Z — VERIFY — ok

    By: CODER

    Note: Verified complete native visible standardbar through shared Writer controls/icons:293 Calc tests and raw100percent four metrics,29related tests,10source/resource and2Writer freshness cases,4built-browser viewport/axe cases;all declared gates pass. Evidence in task verification.md;overall goal remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T21:26:30.359Z, excerpt_hash=sha256:a6d2f9b50c11c7ca890bcb716ac70eebd092d2a66b7d3ff12405b46efd73b5a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182120-YSQ8VM/blueprint/resolved-snapshot.json
    - old_digest: 4ba338f8a5515a98439f1da0641a332afc88913d56ce90402ab4a1272967a8a7
    - current_digest: 4ba338f8a5515a98439f1da0641a332afc88913d56ce90402ab4a1272967a8a7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182120-YSQ8VM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182120-YSQ8VM -m 🧩 YSQ8VM task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task-scoped implementation commit and registry adaptations; preserve user changes and prior Calc sheet popup. Do not merge or reset branches."
  Findings: |-
    Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: calc-coverage.log;110files,293cases. Raw statements6648/6648,branches4273/4273,functions1372/1372,lines5966/5966,all100percent. No coverage exclusions or thresholds changed.
    Scope: whole current Calc runtime including complete source toolbar projection,actual unknown-slot disabled state,all30icon controls,real Open dialog and existing input/history/files/sheet-popup behavior.

    Command: npm exec --workspace @vite-office/office -- vitest run CommandToolbar WriterUpstreamEntryPoints WriterUpstreamQuickControls native-insert-table-command writer-view.test menubar-commands --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: related.log;7files,29cases. New Writer regression checks exact standardbar order and all11original Lucide symbol classes through actual Writer Sfx frame. Shared control test requires missing slots to remain visible disabled and proves clicks cannot dispatch. Existing table-grid/native-dialog/format/Writer entry-point checks pass.
    Scope: actual shared renderer and both suite consumers;the common vocabulary replaces Writer's previous local map without changing its icons.

    Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
    Result: pass
    Evidence: types-final.log,build.log,source.log,calc-resources.log,writer-resources.log. 10source/resource cases plus2Writer freshness cases. Source test independently reads pinned standardbar XML and checks all30visible identities after explicit existing AddDirect/Save deviations. Generated Calc and Writer resources unchanged. Existing bundle-size warning remains.
    Scope: actual XML visibility,stable command identities,current browser policy and whole application build/types.

    Command: node .agentplane/tasks/202610182120-YSQ8VM/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: style.log,dependencies.log,docs.log,size.log,tree.log,provenance.log,inventory-calc.log,inventory-shared.log,inventory-writer.log,doctor.log,routing.log. 20intentional non-task paths;849runtime module sources,3694relative imports,124allowed cross-module edges;850provenance modules (733mapped/99browser/18infrastructure). All three scoped semanticViolationCount0. Inventory logs explicitly retain counts/flags and SHA256 of original successful output while omitting bulk record arrays;they do not claim complete Calc parity. Doctor OK with pre-existing managed shim warning;routing OK.
    Scope: shared browser icon vocabulary,existing owner registry evidence and source resources;no new execution slots,security code,network or outside-checkout writes.

    Command: npx playwright test standard-toolbar.spec.ts sheet-context-menu.spec.ts --config apps/office/playwright.config.ts --project=calc
    Result: pass
    Evidence: browser.log;4cases at1280x800 and390x600. Exact30source labels/order,each actualSVG,unavailable commands disabled,36px shared button width,confined mobile horizontal overflow and actual cell value edit/Undo/Redo verified. Both existing context-popup cases still pass. Each case uses unfiltered axe (violations=[]) and pageerror collection ([]).
    Scope: built production application using actual shared Writer header/control styles,Calc core history and source context popup.

    Findings: Initial typecheck caught a Lucide export typo PanelTopBottom (actual installed export PanelsTopBottom) and Playwright-only exact option accidentally supplied to Testing Library role queries. Corrected symbol and fixture options;all final types/tests pass. No production behavior or verification thresholds weakened. Earlier unknown-command omission expectation was intentionally replaced with visible-disabled source composition,matching actual Sfx state and menu behavior.

    Remaining scope: This task restores composition of the complete pinned visible standardbar;unported operations are disabled. No generic fake handlers or private availability model were introduced. Full formatting toolbar and input-line fidelity,remaining native document/edit/sheet/formatting services and whole Calc UI parity remain unfinished. The original goal remains active. This is UI task17;full regression next task20.
id_source: "generated"
---
## Summary

Restore native Calc standard toolbar composition using shared Writer controls and icons

Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.

## Scope

- In scope: Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.
- Out of scope: unrelated refactors not required for "Restore native Calc standard toolbar composition using shared Writer controls and icons".

## Plan

1.CODER projects the complete pinned visible standardbar after existing save-policy dispositions,without supported-slot filtering. 2.CODER shares Writer standard toolbar icons through framework and supplies Calc-specific icon additions without copying renderer or introducing handlers. Shared controls preserve unavailable entries disabled from actual Sfx bindings. 3.CODER adds source composition,bindings/dispatch,Writer regression and real-browser viewport/axe checks; runs all Calc raw100percent coverage plus related checks. Scope up to24 non-task files including four runtime owners,new shared icon module,tests and corresponding registry evidence. Goal approval already explicit; no external writes/network. UI task17; full regression at20.

## Verify Steps

Run npm run test:coverage:calc with raw100percent statements,branches,functions,lines. Verify native visible standardbar order/visibility and every icon,unavailable entries disabled,real Open/Undo/Redo dispatch; no fake slots. Run related CommandToolbar and WriterCommandToolbar tests,source contracts and generated Calc/Writer resource freshness. Run app/tools typecheck/build,touched Prettier/eslint,dependency/docs/file-size/source-tree/provenance checks,Calc/shared/Writer scoped inventories,doctor/routing. Built browser tests desktop1280x800/mobile390x600 assert exact native toolbar order,SVG icons,disabled unsupported commands,actual edit Undo/Redo,toolbar overflow and unfiltered axe with no page errors. Full regression next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T21:26:30.851Z — VERIFY — ok

By: CODER

Note: Verified complete native visible standardbar through shared Writer controls/icons:293 Calc tests and raw100percent four metrics,29related tests,10source/resource and2Writer freshness cases,4built-browser viewport/axe cases;all declared gates pass. Evidence in task verification.md;overall goal remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T21:26:30.359Z, excerpt_hash=sha256:a6d2f9b50c11c7ca890bcb716ac70eebd092d2a66b7d3ff12405b46efd73b5a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182120-YSQ8VM/blueprint/resolved-snapshot.json
- old_digest: 4ba338f8a5515a98439f1da0641a332afc88913d56ce90402ab4a1272967a8a7
- current_digest: 4ba338f8a5515a98439f1da0641a332afc88913d56ce90402ab4a1272967a8a7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182120-YSQ8VM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182120-YSQ8VM -m 🧩 YSQ8VM task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task-scoped implementation commit and registry adaptations; preserve user changes and prior Calc sheet popup. Do not merge or reset branches.

## Findings

Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage.log;110files,293cases. Raw statements6648/6648,branches4273/4273,functions1372/1372,lines5966/5966,all100percent. No coverage exclusions or thresholds changed.
Scope: whole current Calc runtime including complete source toolbar projection,actual unknown-slot disabled state,all30icon controls,real Open dialog and existing input/history/files/sheet-popup behavior.

Command: npm exec --workspace @vite-office/office -- vitest run CommandToolbar WriterUpstreamEntryPoints WriterUpstreamQuickControls native-insert-table-command writer-view.test menubar-commands --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;7files,29cases. New Writer regression checks exact standardbar order and all11original Lucide symbol classes through actual Writer Sfx frame. Shared control test requires missing slots to remain visible disabled and proves clicks cannot dispatch. Existing table-grid/native-dialog/format/Writer entry-point checks pass.
Scope: actual shared renderer and both suite consumers;the common vocabulary replaces Writer's previous local map without changing its icons.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: types-final.log,build.log,source.log,calc-resources.log,writer-resources.log. 10source/resource cases plus2Writer freshness cases. Source test independently reads pinned standardbar XML and checks all30visible identities after explicit existing AddDirect/Save deviations. Generated Calc and Writer resources unchanged. Existing bundle-size warning remains.
Scope: actual XML visibility,stable command identities,current browser policy and whole application build/types.

Command: node .agentplane/tasks/202610182120-YSQ8VM/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: style.log,dependencies.log,docs.log,size.log,tree.log,provenance.log,inventory-calc.log,inventory-shared.log,inventory-writer.log,doctor.log,routing.log. 20intentional non-task paths;849runtime module sources,3694relative imports,124allowed cross-module edges;850provenance modules (733mapped/99browser/18infrastructure). All three scoped semanticViolationCount0. Inventory logs explicitly retain counts/flags and SHA256 of original successful output while omitting bulk record arrays;they do not claim complete Calc parity. Doctor OK with pre-existing managed shim warning;routing OK.
Scope: shared browser icon vocabulary,existing owner registry evidence and source resources;no new execution slots,security code,network or outside-checkout writes.

Command: npx playwright test standard-toolbar.spec.ts sheet-context-menu.spec.ts --config apps/office/playwright.config.ts --project=calc
Result: pass
Evidence: browser.log;4cases at1280x800 and390x600. Exact30source labels/order,each actualSVG,unavailable commands disabled,36px shared button width,confined mobile horizontal overflow and actual cell value edit/Undo/Redo verified. Both existing context-popup cases still pass. Each case uses unfiltered axe (violations=[]) and pageerror collection ([]).
Scope: built production application using actual shared Writer header/control styles,Calc core history and source context popup.

Findings: Initial typecheck caught a Lucide export typo PanelTopBottom (actual installed export PanelsTopBottom) and Playwright-only exact option accidentally supplied to Testing Library role queries. Corrected symbol and fixture options;all final types/tests pass. No production behavior or verification thresholds weakened. Earlier unknown-command omission expectation was intentionally replaced with visible-disabled source composition,matching actual Sfx state and menu behavior.

Remaining scope: This task restores composition of the complete pinned visible standardbar;unported operations are disabled. No generic fake handlers or private availability model were introduced. Full formatting toolbar and input-line fidelity,remaining native document/edit/sheet/formatting services and whole Calc UI parity remain unfinished. The original goal remains active. This is UI task17;full regression next task20.
