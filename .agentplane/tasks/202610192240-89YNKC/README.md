---
id: "202610192240-89YNKC"
title: "Implement native Calc grow and shrink font UI with shared script-set items"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T22:40:26.493Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T23:44:58.301Z"
  updated_by: "CODER"
  note: "verified-202610192240-89YNKC"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-19T23:44:50.557Z"
  updated_by: "EVALUATOR"
  note: "Task41 source-shaped font operations and shared script-set contracts satisfy the approved bounded scope on implementation7d39aed21bac;all declared acceptance evidence is present,current and reproducible."
  evaluated_sha: "7d39aed21bac7cb193789faa20237d7816b07324"
  blueprint_digest: "f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e"
  evidence_refs:
    - ".agentplane/tasks/202610192240-89YNKC/README.md"
    - ".agentplane/tasks/202610192240-89YNKC/quality/20261019-234450557-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610192240-89YNKC/quality/20261019-234450557-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610192240-89YNKC/quality/20261019-234450557-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610192240-89YNKC/evidence/source-audit.json"
    - ".agentplane/tasks/202610192240-89YNKC/evidence/complete-owner-proof.json"
    - ".agentplane/tasks/202610192240-89YNKC/evidence/browser-proof.json"
    - ".agentplane/tasks/202610192240-89YNKC/evidence/calc-proof.json"
    - ".agentplane/tasks/202610192240-89YNKC/evidence/shared-proof.json"
  findings:
    - "Native slot/script/default/limit semantics,complete typed height metadata,whole-sheet query bounds and repeated-format history are source-audited;hidden upstream toolbar placements remain hidden. No alternate document model or fake services added."
    - "Calc127files386cases and related shared/Writer28files208cases pass;raw S/B/F/L100 for Calc and every14changed executable owner,source hashes current. Header reexport has no executable owner. Tests/coverage exclusions and thresholds are not weakened."
    - "27unique actual browser cases and3final fresh-build replays pass at1280/390,including page/DOM-free Worker history/ODS and UI primary autosave/reopen. Four screenshot hashes and visual observations retained."
    - "All required static/source/resource/inventory/routing gates pass and56non-task paths stay within approved60. Candidate failures and closeout ordering correction are explicitly reconciled in Findings."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement native shared script-set items and Calc grow/shrink font UI under existing authorization;retain original selected-script/default/limit behavior and raw100 evidence,calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T22:40:31.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native shared script-set items and Calc grow/shrink font UI under existing authorization;retain original selected-script/default/limit behavior and raw100 evidence,calc checkout only."
  -
    type: "verify"
    at: "2026-10-19T23:43:58.794Z"
    author: "CODER"
    state: "ok"
    note: "Task41 accepted: Calc127files386cases raw S/B/F/L100;related shared/Writer28files208cases and all14changed executable owners100,current hashes;27unique focused browser cases pass,types/lint/format/resources/source/inventory/static/routing/doctor pass. Exact evidence retained;next full checkpoint50."
  -
    type: "verify"
    at: "2026-10-19T23:44:25.614Z"
    author: "CODER"
    state: "needs_rework"
    note: "Acceptance checks pass;closeout ordering correction only: persist the intentional implementation and final fresh browser screenshot evidence before binding verification to that implementation commit. No implementation or check criteria change."
  -
    type: "verify"
    at: "2026-10-19T23:44:49.958Z"
    author: "CODER"
    state: "ok"
    note: "Accepted implementation7d39aed21bac:386Calc+208related cases pass,Calc and all14changed executable owners raw S/B/F/L100,current hashes;27unique browser cases plus3fresh rebuilt replay pass. Static/source/resource/inventory gates pass;evidence retained;next full checkpoint50."
  -
    type: "verify"
    at: "2026-10-19T23:44:58.301Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610192240-89YNKC"
doc_version: 3
doc_updated_at: "2026-10-19T23:44:58.358Z"
doc_updated_by: "CODER"
description: "Task41 of the authorized Calc UI goal after verified full checkpoint40. Port the source-shaped consumed SvxScriptSetItem contract and native ScFormatShell grow/shrink size dispatch,wire actual source slots to shared Writer menu/toolbar components and current selection/history/ODS paths;preserve native script/default/limit quirks and document suspected issues. Only vite-office-calc branch calc;targeted Calc100 and related/current-owner100 tests,no full repeat before checkpoint50."
sections:
  Summary: "Task41 implements actual Grow/Shrink Font UI commands after completed full checkpoint40. Previous goal turn made verified progress:task40 closed8fb7d8848b3d,implementationf7ecba6fabe5,1040files17215application cases raw100,inventory/tooling/browser gates pass,and clean calc tree. Overall UI goal remains active."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60non-task paths for shared editeng script-set item and necessary existing SVL contracts,native Calc format/script/selection/undo dispatch,presentation command inventory and existing shared Writer menu/toolbar reuse,ODS/browser tests and accurate capability/runtime/provenance records. Change simplified common/Writer consumers directly if the consumed native contract requires it. Preserve current browser primary-save/open/no-recovery policy. No branch,merge,network,outside-repo access or full native service/layout emulation. No coverage weakening or broad parity promotion."
  Plan: "Audit pinned textitem.cxx/scriptsetitem.hxx and ScFormatShell grow/shrink ExecuteAttr/GetAttrState plus numeric SDI/resource identities. Port shared SvxScriptSetItem with source state/default/clone/script equality/Which mapping;extend existing shared set contracts canonically only where required. Connect native +/-40twip size operation,source19998maximum/40minimum and exact selected-script behavior to actual Calc pattern/history owners. Bind source command URLs through existing Sfx interface and shared Writer UI placements;preserve source no-op/mixed/argument behavior and document suspicious upstream logic. Test all script combinations,default/mixed/null states,limits/unsigned cases,selection/history/ODS and actual browser UI. Run Calc raw100,complete changed-owner raw100 and affected tests/types/lint/resource/source gates;retain source/command/raw/browser evidence,quality review and clean close. Next full checkpoint50."
  Verify Steps: "Read ap task verify-show and pinned source with line/hash anchors. Execute npm run test:coverage:calc with raw JSON/text and configured S/B/F/L100. Execute related shared/Writer unit cases and raw complete changed executable owners100,combining only identical source/maps if needed;no empty evidence or threshold/exclusion reductions. Verify SvxScriptSetItem all native script combinations and SET/DEFAULT/DONTCARE/UNKNOWN cases,clone/ranges/mapping;Calc +/-2pt script-specific items and proportion metadata,full/partial/grouped selections,mixed/no-op/limit/uint32 cases,pending input,real undo/redo and ODS Worker roundtrip. Run types,changed/full authored-source lint/format respecting existing ignored generated artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/parity,routing/doctor and affected tooling where changed. Fresh build and focused Calc/shared browser scenarios at1280/390 demonstrating actual source UI actions and history/reopen,no uncaught exceptions. Preserve exact command exits/counts,raw coverage/current hashes,source audit and source-shaped capability records. git diff --check,quality review and clean final calc status. Full all-app checkpoint40 just passed;next50,no full repeat in task41."
  Verification: |-
    Command: npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task41-calc-accepted --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task41-calc-accepted-results.json
    Result: pass,exit0. Evidence: evidence/calc-proof.json,calc-raw.json.gz,calc-results.json.gz,calc-complete.log. Scope:127files386cases;raw S8327/B5274/F1624/L7451 all100. All actual raw owner hashes match current production sources.

    Command: npm run test:coverage:shared -- src/svl/source/items src/editeng/source/items/native-script-set-item.test.ts src/sw/source/core/attr/native-format-attribute-notify.test.ts --coverage.include=src/svl/source/items/itemset.ts --coverage.include=src/editeng/source/items/textitem.scriptset.ts --coverage.reportsDirectory=coverage/task41-shared-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task41-shared-final-results.json
    Result: pass,exit0. Evidence: shared-proof.json,shared-raw.json.gz,shared-results.json.gz,shared-complete.log. Scope:28files208cases including actual Writer attribute-notify consumer;complete two changed shared executable owners S311/B255/F57/L257 all100. Complete-owner-proof.json checks all14changed executable application owners without filtering branches or reducing thresholds/exclusions;header reexport has no executable owner.

    Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project calc --workers=2 apps/office/e2e/calc/font-step.spec.ts apps/office/e2e/calc/font-size.spec.ts apps/office/e2e/calc/font-family.spec.ts apps/office/e2e/calc/formatting-toolbar.spec.ts apps/office/e2e/calc/alignment.spec.ts apps/office/e2e/calc/colors.spec.ts apps/office/e2e/calc/ods.spec.ts
    Result: pass,exit0,14cases. Command: npx playwright test --config apps/office/playwright.config.ts --project shared --workers=2 apps/office/e2e/shared/menubar-overflow.spec.ts apps/office/e2e/shared/menubar-pointer.spec.ts apps/office/e2e/shared/popup-pointer.spec.ts apps/office/e2e/shared/font-values.spec.ts
    Result: pass,exit0,13cases. Evidence: task41-browser-gate.log,task41-shared-browser.log. Scope:actual shared Writer/Calc components at1280/390,script item metadata,mixed-size DOM painting,font controls,Undo/Redo,primary ODS autosave/reload/reopen and genuine DOM-free Worker roundtrip. Native font-size arithmetic witness independently compiled and ran16initialized cases;limited to extracted source expressions.

    Command: npm run typecheck; npx eslint . --max-warnings 0 --ignore-pattern 'output/playwright/**'; npx prettier --check . --ignore-path .prettierignore --ignore-path .gitignore; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; npm run check:writer-resources; npx vitest run scripts/check-source-provenance.test.ts scripts/check-lo-source-tree.test.ts scripts/calc-ui-resource-model.test.ts scripts/writer-ui-resource-model.test.ts; node scripts/check-static-build.mjs; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check
    Result: pass,exit0 for every listed command. Evidence: task41-* retained logs,inventory/parity logs compressed. Scope:all authored-source static checks respecting existing ignored generated artifacts;925runtime modules791mapped/115browser/19infrastructure;0semantic violations;Calc463commands/11menus/17policy dispositions;Writer resource tests and actual matched tooling2files5cases. Nonexistent optional resource-model CLI patterns matched no additional files and are not claimed as executed tests. No tooling implementation changed.

    No mandatory checks skipped or weakened. Per user cadence,no full all-app repeat after successful checkpoint40;next checkpoint50. Broad native parity flags remain false. Final review/commit/closure identifiers are recorded by task lifecycle commands.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T23:43:58.794Z — VERIFY — ok

    By: CODER

    Note: Task41 accepted: Calc127files386cases raw S/B/F/L100;related shared/Writer28files208cases and all14changed executable owners100,current hashes;27unique focused browser cases pass,types/lint/format/resources/source/inventory/static/routing/doctor pass. Exact evidence retained;next full checkpoint50.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:43:58.268Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
    - old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610192240-89YNKC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610192240-89YNKC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-19T23:44:25.614Z — VERIFY — needs_rework

    By: CODER

    Note: Acceptance checks pass;closeout ordering correction only: persist the intentional implementation and final fresh browser screenshot evidence before binding verification to that implementation commit. No implementation or check criteria change.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:43:58.846Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
    - old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610192240-89YNKC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610192240-89YNKC --result verified-202610192240-89YNKC --commit d37e4a8ab9dac9aea56de21c2be7830cc288e50e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-19T23:44:49.958Z — VERIFY — ok

    By: CODER

    Note: Accepted implementation7d39aed21bac:386Calc+208related cases pass,Calc and all14changed executable owners raw S/B/F/L100,current hashes;27unique browser cases plus3fresh rebuilt replay pass. Static/source/resource/inventory gates pass;evidence retained;next full checkpoint50.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:44:35.330Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
    - old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610192240-89YNKC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610192240-89YNKC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-19T23:44:58.301Z — VERIFY — ok

    By: CODER

    Note: verified-202610192240-89YNKC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:44:50.017Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
    - old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610192240-89YNKC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610192240-89YNKC --result verified-202610192240-89YNKC --commit 7d39aed21bac7cb193789faa20237d7816b07324
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task41 implementation commits if necessary;retain source/verification evidence and unrelated tasks. Do not change branches or merge,user owns integration."
  Findings: |-
    Task41 follows the existing authorization exclusively in vite-office-calc branch calc. Native source audit is evidence/source-audit.json; standalone arithmetic witness is evidence/native-font-size-arithmetic.json. Shared SvxScriptSetItem and SfxItemSet MergeRange/MergeValues replace local script/equality shortcuts; Calc uses actual selection-pattern/default/invalid states and existing attribute/history/ODS owners. Whole-sheet queries clip only their copied marks to real typed-block content bounds, as pinned viewfunc.cxx; apply retains actual marks. Default formatobjectbar Grow/Shrink entries remain hidden and no English shortcut is invented. Actual shared Writer controls expose correct mixed/script size state and complete typed font-height requests; native dispatch slots11042/11043 are available. Suspected pinned behaviors CALC205..210 are preserved and documented.

    Command: scoped Calc coverage candidates and related shared/Writer owner coverage (exact commands and raw logs are retained in evidence). Result: earlier candidates exposed stale repeated-format Undo expectations, one duplicated local script-equality branch, then two missing native guard scenarios. Resolution: canonical shared ScriptSet reuse, source-backed Undo assertions and genuine empty-column/simple-plus-multi mark cases. No test/exclusion/threshold reduction. A final lint repair removes an overwritten initial variable assignment without changing the source loop. Fresh final Calc coverage is running against that final owner version. Shared final coverage retains all native SVL item tests plus the actual Writer format-notify consumer.

    Command: npm run build and focused Playwright Calc font-step/font-size/font-family/formatting-toolbar/alignment/colors/ods. Result: pass,14cases. Evidence: browser log and 1280/390 script-height screenshots. Page and DOM-free Worker use actual source owners,typed item metadata,Undo/Redo and native ODS; actual UI opens stored ODS,changes mixed sizes,waits for primary save,and reopens after reload. Initial two browser persistence assertions timed out at5s before the documented10s shared autosave cadence;20s polling passes with production policy unchanged. Shared menu/popup/font-value browser scenarios pass13cases across Writer/Calc and both widths. Uncaught page exceptions are asserted empty.

    Command: types,lint,JSDoc,format,resources,source/provenance,inventory,routing and doctor. Result: candidate gates identified missing test callback JSDoc,three test non-null assertions,a useless variable initializer,one native filename-split explanation and one reexport incorrectly listed as a local declaration. Resolution: meaningful comments,typed existing-table assertion,declaration without overwritten initializer,and accurate registry records; rerun required gates. Source provenance now passes925runtime owners;inventory semantic violations0. No scope/security/verification change;56non-task paths remain within approved60. Full all-app checkpoint40 remains the latest full regression;next checkpoint50.

    Residual boundaries: device metrics,rich edit,filtered and alternate sheet views,full native cache/border services and physical allocation order are unported;no broad parity flags are promoted. Existing range application uses actual native itemsets and real attributes;no alternate grid/snapshot or fake document provider. Formatting-only empty cells do not count as data. The browser table can have zero physical columns and reports the native initial empty-column bounds without allocating stores. Writer primary-save/open/no-recovery deviations remain. These limitations do not justify changing source defaults or adding unsupported textobjectbar controls.

    Final acceptance supersedes candidate status above:Calc127files386cases raw S8327/B5274/F1624/L7451 all100;shared/Writer28files208cases S311/B255/F57/L257 all100;all14changed executable owners are fully covered and every raw source hash is current. Complete-owner-proof.json verifies the union without excluding any executable changed owner. Final rebuilt3case font browser replay passed after JSDoc/lint corrections;27unique focused browser cases passed in total. Four screenshot bytes/hashes are retained in browser-proof.json and task evidence. Final types,full authored-source ESLint/Prettier,JSDoc,source/resource/inventory/static/routing/doctor gates pass. Closeout verification was temporarily returned to needs_rework solely to persist the implementation commit before binding final verification;no source or acceptance criteria changed. No blockers remain in the bounded task41 scope;the overall Calc UI goal remains active.
id_source: "generated"
---
## Summary

Task41 implements actual Grow/Shrink Font UI commands after completed full checkpoint40. Previous goal turn made verified progress:task40 closed8fb7d8848b3d,implementationf7ecba6fabe5,1040files17215application cases raw100,inventory/tooling/browser gates pass,and clean calc tree. Overall UI goal remains active.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60non-task paths for shared editeng script-set item and necessary existing SVL contracts,native Calc format/script/selection/undo dispatch,presentation command inventory and existing shared Writer menu/toolbar reuse,ODS/browser tests and accurate capability/runtime/provenance records. Change simplified common/Writer consumers directly if the consumed native contract requires it. Preserve current browser primary-save/open/no-recovery policy. No branch,merge,network,outside-repo access or full native service/layout emulation. No coverage weakening or broad parity promotion.

## Plan

Audit pinned textitem.cxx/scriptsetitem.hxx and ScFormatShell grow/shrink ExecuteAttr/GetAttrState plus numeric SDI/resource identities. Port shared SvxScriptSetItem with source state/default/clone/script equality/Which mapping;extend existing shared set contracts canonically only where required. Connect native +/-40twip size operation,source19998maximum/40minimum and exact selected-script behavior to actual Calc pattern/history owners. Bind source command URLs through existing Sfx interface and shared Writer UI placements;preserve source no-op/mixed/argument behavior and document suspicious upstream logic. Test all script combinations,default/mixed/null states,limits/unsigned cases,selection/history/ODS and actual browser UI. Run Calc raw100,complete changed-owner raw100 and affected tests/types/lint/resource/source gates;retain source/command/raw/browser evidence,quality review and clean close. Next full checkpoint50.

## Verify Steps

Read ap task verify-show and pinned source with line/hash anchors. Execute npm run test:coverage:calc with raw JSON/text and configured S/B/F/L100. Execute related shared/Writer unit cases and raw complete changed executable owners100,combining only identical source/maps if needed;no empty evidence or threshold/exclusion reductions. Verify SvxScriptSetItem all native script combinations and SET/DEFAULT/DONTCARE/UNKNOWN cases,clone/ranges/mapping;Calc +/-2pt script-specific items and proportion metadata,full/partial/grouped selections,mixed/no-op/limit/uint32 cases,pending input,real undo/redo and ODS Worker roundtrip. Run types,changed/full authored-source lint/format respecting existing ignored generated artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/parity,routing/doctor and affected tooling where changed. Fresh build and focused Calc/shared browser scenarios at1280/390 demonstrating actual source UI actions and history/reopen,no uncaught exceptions. Preserve exact command exits/counts,raw coverage/current hashes,source audit and source-shaped capability records. git diff --check,quality review and clean final calc status. Full all-app checkpoint40 just passed;next50,no full repeat in task41.

## Verification

Command: npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task41-calc-accepted --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task41-calc-accepted-results.json
Result: pass,exit0. Evidence: evidence/calc-proof.json,calc-raw.json.gz,calc-results.json.gz,calc-complete.log. Scope:127files386cases;raw S8327/B5274/F1624/L7451 all100. All actual raw owner hashes match current production sources.

Command: npm run test:coverage:shared -- src/svl/source/items src/editeng/source/items/native-script-set-item.test.ts src/sw/source/core/attr/native-format-attribute-notify.test.ts --coverage.include=src/svl/source/items/itemset.ts --coverage.include=src/editeng/source/items/textitem.scriptset.ts --coverage.reportsDirectory=coverage/task41-shared-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task41-shared-final-results.json
Result: pass,exit0. Evidence: shared-proof.json,shared-raw.json.gz,shared-results.json.gz,shared-complete.log. Scope:28files208cases including actual Writer attribute-notify consumer;complete two changed shared executable owners S311/B255/F57/L257 all100. Complete-owner-proof.json checks all14changed executable application owners without filtering branches or reducing thresholds/exclusions;header reexport has no executable owner.

Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project calc --workers=2 apps/office/e2e/calc/font-step.spec.ts apps/office/e2e/calc/font-size.spec.ts apps/office/e2e/calc/font-family.spec.ts apps/office/e2e/calc/formatting-toolbar.spec.ts apps/office/e2e/calc/alignment.spec.ts apps/office/e2e/calc/colors.spec.ts apps/office/e2e/calc/ods.spec.ts
Result: pass,exit0,14cases. Command: npx playwright test --config apps/office/playwright.config.ts --project shared --workers=2 apps/office/e2e/shared/menubar-overflow.spec.ts apps/office/e2e/shared/menubar-pointer.spec.ts apps/office/e2e/shared/popup-pointer.spec.ts apps/office/e2e/shared/font-values.spec.ts
Result: pass,exit0,13cases. Evidence: task41-browser-gate.log,task41-shared-browser.log. Scope:actual shared Writer/Calc components at1280/390,script item metadata,mixed-size DOM painting,font controls,Undo/Redo,primary ODS autosave/reload/reopen and genuine DOM-free Worker roundtrip. Native font-size arithmetic witness independently compiled and ran16initialized cases;limited to extracted source expressions.

Command: npm run typecheck; npx eslint . --max-warnings 0 --ignore-pattern 'output/playwright/**'; npx prettier --check . --ignore-path .prettierignore --ignore-path .gitignore; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; npm run check:writer-resources; npx vitest run scripts/check-source-provenance.test.ts scripts/check-lo-source-tree.test.ts scripts/calc-ui-resource-model.test.ts scripts/writer-ui-resource-model.test.ts; node scripts/check-static-build.mjs; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check
Result: pass,exit0 for every listed command. Evidence: task41-* retained logs,inventory/parity logs compressed. Scope:all authored-source static checks respecting existing ignored generated artifacts;925runtime modules791mapped/115browser/19infrastructure;0semantic violations;Calc463commands/11menus/17policy dispositions;Writer resource tests and actual matched tooling2files5cases. Nonexistent optional resource-model CLI patterns matched no additional files and are not claimed as executed tests. No tooling implementation changed.

No mandatory checks skipped or weakened. Per user cadence,no full all-app repeat after successful checkpoint40;next checkpoint50. Broad native parity flags remain false. Final review/commit/closure identifiers are recorded by task lifecycle commands.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T23:43:58.794Z — VERIFY — ok

By: CODER

Note: Task41 accepted: Calc127files386cases raw S/B/F/L100;related shared/Writer28files208cases and all14changed executable owners100,current hashes;27unique focused browser cases pass,types/lint/format/resources/source/inventory/static/routing/doctor pass. Exact evidence retained;next full checkpoint50.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:43:58.268Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
- old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610192240-89YNKC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610192240-89YNKC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-19T23:44:25.614Z — VERIFY — needs_rework

By: CODER

Note: Acceptance checks pass;closeout ordering correction only: persist the intentional implementation and final fresh browser screenshot evidence before binding verification to that implementation commit. No implementation or check criteria change.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:43:58.846Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
- old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610192240-89YNKC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610192240-89YNKC --result verified-202610192240-89YNKC --commit d37e4a8ab9dac9aea56de21c2be7830cc288e50e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-19T23:44:49.958Z — VERIFY — ok

By: CODER

Note: Accepted implementation7d39aed21bac:386Calc+208related cases pass,Calc and all14changed executable owners raw S/B/F/L100,current hashes;27unique browser cases plus3fresh rebuilt replay pass. Static/source/resource/inventory gates pass;evidence retained;next full checkpoint50.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:44:35.330Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
- old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610192240-89YNKC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610192240-89YNKC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-19T23:44:58.301Z — VERIFY — ok

By: CODER

Note: verified-202610192240-89YNKC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T23:44:50.017Z, excerpt_hash=sha256:89c97ca2049381dc82b41f321c84eeaaae69dd1cc2b7c1871610b8f984ddba00

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610192240-89YNKC/blueprint/resolved-snapshot.json
- old_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- current_digest: f5c76ebcfe1e9a9c138dc2df77ac16216914028c2202739ef9b696eeb6ae1f1e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610192240-89YNKC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610192240-89YNKC --result verified-202610192240-89YNKC --commit 7d39aed21bac7cb193789faa20237d7816b07324
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task41 implementation commits if necessary;retain source/verification evidence and unrelated tasks. Do not change branches or merge,user owns integration.

## Findings

Task41 follows the existing authorization exclusively in vite-office-calc branch calc. Native source audit is evidence/source-audit.json; standalone arithmetic witness is evidence/native-font-size-arithmetic.json. Shared SvxScriptSetItem and SfxItemSet MergeRange/MergeValues replace local script/equality shortcuts; Calc uses actual selection-pattern/default/invalid states and existing attribute/history/ODS owners. Whole-sheet queries clip only their copied marks to real typed-block content bounds, as pinned viewfunc.cxx; apply retains actual marks. Default formatobjectbar Grow/Shrink entries remain hidden and no English shortcut is invented. Actual shared Writer controls expose correct mixed/script size state and complete typed font-height requests; native dispatch slots11042/11043 are available. Suspected pinned behaviors CALC205..210 are preserved and documented.

Command: scoped Calc coverage candidates and related shared/Writer owner coverage (exact commands and raw logs are retained in evidence). Result: earlier candidates exposed stale repeated-format Undo expectations, one duplicated local script-equality branch, then two missing native guard scenarios. Resolution: canonical shared ScriptSet reuse, source-backed Undo assertions and genuine empty-column/simple-plus-multi mark cases. No test/exclusion/threshold reduction. A final lint repair removes an overwritten initial variable assignment without changing the source loop. Fresh final Calc coverage is running against that final owner version. Shared final coverage retains all native SVL item tests plus the actual Writer format-notify consumer.

Command: npm run build and focused Playwright Calc font-step/font-size/font-family/formatting-toolbar/alignment/colors/ods. Result: pass,14cases. Evidence: browser log and 1280/390 script-height screenshots. Page and DOM-free Worker use actual source owners,typed item metadata,Undo/Redo and native ODS; actual UI opens stored ODS,changes mixed sizes,waits for primary save,and reopens after reload. Initial two browser persistence assertions timed out at5s before the documented10s shared autosave cadence;20s polling passes with production policy unchanged. Shared menu/popup/font-value browser scenarios pass13cases across Writer/Calc and both widths. Uncaught page exceptions are asserted empty.

Command: types,lint,JSDoc,format,resources,source/provenance,inventory,routing and doctor. Result: candidate gates identified missing test callback JSDoc,three test non-null assertions,a useless variable initializer,one native filename-split explanation and one reexport incorrectly listed as a local declaration. Resolution: meaningful comments,typed existing-table assertion,declaration without overwritten initializer,and accurate registry records; rerun required gates. Source provenance now passes925runtime owners;inventory semantic violations0. No scope/security/verification change;56non-task paths remain within approved60. Full all-app checkpoint40 remains the latest full regression;next checkpoint50.

Residual boundaries: device metrics,rich edit,filtered and alternate sheet views,full native cache/border services and physical allocation order are unported;no broad parity flags are promoted. Existing range application uses actual native itemsets and real attributes;no alternate grid/snapshot or fake document provider. Formatting-only empty cells do not count as data. The browser table can have zero physical columns and reports the native initial empty-column bounds without allocating stores. Writer primary-save/open/no-recovery deviations remain. These limitations do not justify changing source defaults or adding unsupported textobjectbar controls.

Final acceptance supersedes candidate status above:Calc127files386cases raw S8327/B5274/F1624/L7451 all100;shared/Writer28files208cases S311/B255/F57/L257 all100;all14changed executable owners are fully covered and every raw source hash is current. Complete-owner-proof.json verifies the union without excluding any executable changed owner. Final rebuilt3case font browser replay passed after JSDoc/lint corrections;27unique focused browser cases passed in total. Four screenshot bytes/hashes are retained in browser-proof.json and task evidence. Final types,full authored-source ESLint/Prettier,JSDoc,source/resource/inventory/static/routing/doctor gates pass. Closeout verification was temporarily returned to needs_rework solely to persist the implementation commit before binding final verification;no source or acceptance criteria changed. No blockers remain in the bounded task41 scope;the overall Calc UI goal remains active.
