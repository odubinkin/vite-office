---
id: "202610222322-014VCW"
title: "Canonicalize Writer font size controls and grow shrink commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T23:23:19.801Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-23T00:33:23.304Z"
  updated_by: "CODER"
  note: "Original font-size controls and Grow/Shrink wired through actual Writer items/ranges/history and shared Calc scalar boundary;109 current focused cases, related43-file passes plus repaired UI file,31 boundary cases,18 current-build Chromium scenarios and strict24-owner S1665/B1245/F396/L1485 all100 source audit; all declared local gates pass. Full suite follows one-in-ten cadence; task7. Native service gaps remain documented."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-23T00:34:12.497Z"
  updated_by: "EVALUATOR"
  note: "Consumed native font-size/control and Writer Grow Shrink implementation matches reviewed pinned source branches and is connected to actual frame, ranges, grouped history and document I/O. Verified source commit d05c726543c3,24 current owner identities, current built asset hashes and all local gate exit codes."
  evaluated_sha: "d05c726543c342fdccc1ad66cd2bb1aff6780738"
  blueprint_digest: "81766790ba2944cfaa75b07c0ab58676c98a83ccd60342871ae2cb19f6ff92b0"
  evidence_refs:
    - ".agentplane/tasks/202610222322-014VCW/README.md"
    - ".agentplane/tasks/202610222322-014VCW/quality/20261023-003412497-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610222322-014VCW/quality/20261023-003412497-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610222322-014VCW/quality/20261023-003412497-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610222322-014VCW/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-font-sizing/incremental-coverage-audit.json"
    - "output/playwright/writer-font-sizing/final-gates.json"
    - "output/playwright/writer-font-sizing/browser-build-identity.json"
    - "output/playwright/writer-font-sizing/browser-current-build.log"
  findings:
    - "Original32 sizes, absolute empty/invalid/unit/rounding contracts and toolbox acceptance retained; Grow Shrink40twip/19998/uint32/exact-disabled semantics documented and tested. Original contribution traversal remains source ordered; real PaM ownership and script metadata are used without simulated native providers."
    - "Failed old UI expectations, missing canonical operation/divergence records and type-induced stale bundle validation were repaired; current18-scenario browser run is tied to successful build hashes. Raw partial coverage failure is disclosed separately from exact source-bound incremental audit."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original font size numeric controls and Grow/Shrink traversal, slots and UI over actual Writer owners, with related tests and strict source-bound coverage in writer."
events:
  -
    type: "status"
    at: "2026-10-22T23:23:34.853Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original font size numeric controls and Grow/Shrink traversal, slots and UI over actual Writer owners, with related tests and strict source-bound coverage in writer."
  -
    type: "verify"
    at: "2026-10-23T00:33:23.304Z"
    author: "CODER"
    state: "ok"
    note: "Original font-size controls and Grow/Shrink wired through actual Writer items/ranges/history and shared Calc scalar boundary;109 current focused cases, related43-file passes plus repaired UI file,31 boundary cases,18 current-build Chromium scenarios and strict24-owner S1665/B1245/F396/L1485 all100 source audit; all declared local gates pass. Full suite follows one-in-ten cadence; task7. Native service gaps remain documented."
doc_version: 3
doc_updated_at: "2026-10-23T00:33:23.361Z"
doc_updated_by: "CODER"
description: "Replace the restricted font-size select with original absolute FontSizeBox numeric behavior and standard sizes, and connect native Writer Grow/Shrink traversal and slots to sidebar/menu/core/history/ODT."
sections:
  Summary: |-
    Canonicalize Writer font size controls and grow shrink commands

    Replace the restricted font-size select with original absolute FontSizeBox numeric behavior and standard sizes, and connect native Writer Grow/Shrink traversal and slots to sidebar/menu/core/history/ODT.
  Scope: "Only writer checkout and writer branch. Original FontList scalable size array at canonical source/header owner, consumed absolute FontSizeBox numeric parsing/formatting/clamping using existing VCL field/host decimal boundaries, shared editable font-size widget, native Writer ExecCharAttr/GetAttrState Grow/Shrink and GetItemWithPaM character traversal over actual hint/item/cursor owners, commands/resources/sidebar/menu, selection/table typing/history/graph/ODT. Up to32 implementation/resource/tooling paths plus paired canonical records/generated views and up to20 test paths. No synthetic font/script/provider service, native memory/lifetime emulation, network, merges, locale-data expansion or deliberate recovery/autosave/open/save policy changes."
  Plan: "Port original scalable FontList sizes and absolute FontSizeBox numeric contracts through existing real VCL conversion/locale fields; replace fixed select with editable browser combo behavior retaining native acceptance. Implement original GetItemWithPaM traversal and Writer Grow/Shrink state/execute over actual source items/scripts/cursors and existing undo transactions. Wire generated resources and native Character sidebar/menu placements. Verify actual custom-size entry, mixed/caret/table all-script changes, history/ODT and Calc shared widget regression; document suspected native issues without changing contracts; update canonical records, related strict coverage and local gates, close task and continue active goal."
  Verify Steps: "Read pinned ctrltool.cxx/ctrlbox.cxx/tbcontrl.cxx, txtattr.cxx ExecCharAttr/GetAttrState and edattr.cxx GetItemWithPaM, actual sidebartextpanel.ui and swriter.sdi. Prove original32 scalable sizes, absolute decimal/suffix conversion, empty/invalid/clamp/rounding behavior and keyboard/pointer acceptance without partial keystroke formatting or hidden preset substitution. Prove source40twip increment/19998 maximum and unsigned32 arithmetic, single/mixed selection and original segmentation/null/default state contracts, all-script items, caret/table/history ownership and readonly request boundaries. Related font/character/script/selection/hint/history/ODT/widget/Calc-sharing/resource tests, actual Chromium desktop/mobile custom size/grow/shrink/Undo/Redo/download/reopen. Strict current changed-responsibility coverage with exact source identities; all declared local typecheck/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff/status gates. Seventh task after ACR55N: no full suite."
  Verification: |-
    Command: pinned local LibreOffice9bc445578031fecf56086729d8e4940c77e14d65 ctrltool.cxx/ctrlbox.cxx/tbunocontroller.cxx/txtattr.cxx/edattr.cxx/hints.cxx/languageoptions.cxx/sidebartextpanel.ui/swriter.sdi and original ItemInfo slot metadata review.
    Result: pass for the consumed absolute numeric/control, script-query, contribution traversal and Grow/Shrink branches. Source anomalies WRITER057/058/059 recorded and preserved. No native binary/service parity certification.
    Scope:28 implementation/resource/tooling paths and19 test paths, paired canonical records and generated views; writer checkout/branch only.

    Command: Vitest argv in output/playwright/writer-font-sizing/coverage-command.json, followed by repaired focused argv in delta-command.json, plus core-current.log, boundaries-core-current.log, desktop-current.log and resources-current.log.
    Result: related44-file profile had242 passes and2 old FontCommandSelects expectation failures; repaired current16-file profile passes109 tests, including all4 actual FontCommandSelects cases. Related core4files43, exact boundaries3files31, default desktop11 and resource tooling2 also pass. No unchanged passing related test repeated solely to inflate totals.
    Scope: numeric units/decimal/empty/invalid/rounding, actual toolbox/browser lifecycle, actual Writer items/scripts/PaM selection/table/history, shared Calc scalar boundary and controls, ODT, keyboard aliases, source boundaries and resources.

    Command: node output/playwright/writer-font-sizing/audit-incremental-coverage.mjs
    Result: pass;24 executable current source identities, S1665/B1245/F396/L1485 all100, no missing counters. Fresh current delta plus exact-map numeric profile; historical carry only for unchanged exact source spans with baseline source hashes and git-diff correspondence. Current raw focused run retains global thresholds and therefore exits1 with partial whole-owner S68.58/B56.54/F66.66/L69.62; it is not falsely reported as a whole-suite coverage pass. Audit result is changed-responsibility/unchanged-span evidence only.
    Evidence: incremental-coverage-audit.json, incremental-coverage/coverage-final.json, delta-coverage.log, numeric-coverage.log; no threshold/ignore/counter manipulation.

    Command: npm run build (fail-fast subprocess), then node_modules/.bin/playwright test --config output/playwright/writer-font-sizing/playwright-current-build.config.ts --project=writer --project=calc writer-font-sizing.spec.ts writer-properties-sidebar.spec.ts writer-table-headlines.spec.ts calc/font-size.spec.ts calc/font-step.spec.ts calc/alignment.spec.ts calc/formatting-toolbar.spec.ts
    Result: pass;18 current-build Chromium cases at1280/390. Custom13.3, real native Grow/Shrink keyboard and sidebar buttons, grouped Undo/Redo, document selection/table reflow and physical ODT/ODS download/reopen. Asset SHA256 identities saved in browser-build-identity.json. Actual font-sizing screenshots visually inspected at both widths; root overflow assertion passes. No browser errors.
    Evidence: build-final.log, browser-current-build.log and browser-current-build-results. Earlier failed browser-final/browser-repair artifacts used stale assets after a type error; those runs are retained and excluded from current-source pass evidence.

    Command: npm run typecheck; npm run check:docs; npm run check:dependencies; npm run check:writer-resources; npm run inventory:invariants; npm run inventory:parity; npm run check:source-provenance; npm run check:source-tree; npm run check:file-size; scoped node_modules/.bin/eslint --max-warnings0 and prettier --check over exact changed paths; node scripts/check-static-build.mjs; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass; exact individual logs and exit codes in final-gates.json. Provenance1128 runtime modules; native mapped/browser adaptations retain previous statuses without promotions. Source commit, evaluator report and final clean status recorded at closure.
    Scope: seventh task after ACR55N; full suite intentionally not run under user one-in-ten cadence. Goal remains active after closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-23T00:33:23.304Z — VERIFY — ok

    By: CODER

    Note: Original font-size controls and Grow/Shrink wired through actual Writer items/ranges/history and shared Calc scalar boundary;109 current focused cases, related43-file passes plus repaired UI file,31 boundary cases,18 current-build Chromium scenarios and strict24-owner S1665/B1245/F396/L1485 all100 source audit; all declared local gates pass. Full suite follows one-in-ten cadence; task7. Native service gaps remain documented.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T00:33:13.659Z, excerpt_hash=sha256:60107436fdec559d1d08da74f052c56adb9a09753bbc65d83853f6bec3d7c241

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610222322-014VCW/blueprint/resolved-snapshot.json
    - old_digest: 81766790ba2944cfaa75b07c0ab58676c98a83ccd60342871ae2cb19f6ff92b0
    - current_digest: 81766790ba2944cfaa75b07c0ab58676c98a83ccd60342871ae2cb19f6ff92b0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610222322-014VCW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610222322-014VCW
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commits, preserving prior paper/table/character work and task traceability. No reset, merge or external write."
  Findings: |-
    Implemented original32 scalable font sizes and absolute FontSizeBox contracts through existing VCL conversion/system decimal fields. Shared editable widget preserves typing versus direct pick, Enter/Tab/Escape, last-status restoration, focus before float32 dispatch and source row order. Writer and shared Calc command boundary now use actual SvxFontHeightItem.PutValue;13.3 rounds266twips. Calc public direct SetFontSize validation remains unchanged. Original sidebar/menu slots20403/20404 and platform bracket aliases execute actual Writer commands.

    Native Grow/Shrink uses40twips,19998 maximum, exact-bound enabled state and uint32 arithmetic before comparisons. Real script aggregate/language/Which queries and source-ordered node/automatic hint contributions drive explicit independent PaM edits, all3 script heights with original SetHeight reset, retained live selection and actual grouped history. Existing bounded pool-default registration now carries original height slots10015/10888/10893; complete native ItemInfoPackage registration is not replaced. GetUserDefaultItem for known bounded defaults correctly reports no installed user override. No fake font, layout, style, locale or provider service is introduced.

    Resolved local observations: missing Writer pool10015 mapping exposed absent native slot metadata, corrected at existing registration owner with duplicate rejection before mutation. WEAK is original i18n value4. Original AllSettings.GetLanguageTag uses configured data locale, distinct from UI language; implementation/tests corrected accordingly. Numeric Math.round is exact over admitted nonnegative domain. Earlier no-argument height constructor fixed to CreateDefault. React draft replaced with persistent external store to satisfy lifecycle/lint. Typed same-value status legitimately retains raw24 until subsequent blur/status; tests accept original control lifecycle. Existing tests that assumed immediate select change now use actual Enter/Tab. Table reflow scenario now uses Enter to return native document focus, since Tab intentionally retains toolbar traversal.

    Verification failures and repairs: related profile's old FontCommandSelects2 assertions were corrected and current4 cases pass. Shared-project desktop invocation returned no tests; correct default Vitest passes11. Missing mechanical filename divergence records and exhaustive mutation-operation inventory record were added canonically, without weakening gates. Testing Library does not support Playwright exact option; removed unsupported test option. That type error caused an earlier shell pipeline to continue with stale bundle; browser failures from that run are explicitly excluded. Fresh build now uses fail-fast check=True, saves asset hashes and passes18 current browser cases. Raw focused coverage retains unchanged100 thresholds and fails partial whole-owner totals; exact source/hash audit separately proves all changed counters fresh and only verified unchanged spans carry prior hits.

    Residual boundaries: complete native font/device enumeration, relative/Chinese named-size modes, LanguageTag/ApplicationSettings option services, SwScriptInfo/layout field expansion/merged/redline/character-format style resolution and complete readonly/service graph remain unverified. Represented layout-absent original branches and automatic hints are covered; unsupported style/INET services are not fabricated or claimed complete. Original SetAttrSet nondefault modes reject before mutation. WRITER057(empty0pt),058(unsigned wrapping/exact disabled bounds),059(source contribution/null/default behavior) document source suspicions, not proven compiled application defects. Deliberate browser recovery/autosave/open/save deviations unchanged. Only pinned approved local references, no network/merges/outside mutations. User latest continuation revokes older stop instructions; goal remains active. Task is seventh since last full checkpointACR55N; next full suite due at task10.
id_source: "generated"
---
## Summary

Canonicalize Writer font size controls and grow shrink commands

Replace the restricted font-size select with original absolute FontSizeBox numeric behavior and standard sizes, and connect native Writer Grow/Shrink traversal and slots to sidebar/menu/core/history/ODT.

## Scope

Only writer checkout and writer branch. Original FontList scalable size array at canonical source/header owner, consumed absolute FontSizeBox numeric parsing/formatting/clamping using existing VCL field/host decimal boundaries, shared editable font-size widget, native Writer ExecCharAttr/GetAttrState Grow/Shrink and GetItemWithPaM character traversal over actual hint/item/cursor owners, commands/resources/sidebar/menu, selection/table typing/history/graph/ODT. Up to32 implementation/resource/tooling paths plus paired canonical records/generated views and up to20 test paths. No synthetic font/script/provider service, native memory/lifetime emulation, network, merges, locale-data expansion or deliberate recovery/autosave/open/save policy changes.

## Plan

Port original scalable FontList sizes and absolute FontSizeBox numeric contracts through existing real VCL conversion/locale fields; replace fixed select with editable browser combo behavior retaining native acceptance. Implement original GetItemWithPaM traversal and Writer Grow/Shrink state/execute over actual source items/scripts/cursors and existing undo transactions. Wire generated resources and native Character sidebar/menu placements. Verify actual custom-size entry, mixed/caret/table all-script changes, history/ODT and Calc shared widget regression; document suspected native issues without changing contracts; update canonical records, related strict coverage and local gates, close task and continue active goal.

## Verify Steps

Read pinned ctrltool.cxx/ctrlbox.cxx/tbcontrl.cxx, txtattr.cxx ExecCharAttr/GetAttrState and edattr.cxx GetItemWithPaM, actual sidebartextpanel.ui and swriter.sdi. Prove original32 scalable sizes, absolute decimal/suffix conversion, empty/invalid/clamp/rounding behavior and keyboard/pointer acceptance without partial keystroke formatting or hidden preset substitution. Prove source40twip increment/19998 maximum and unsigned32 arithmetic, single/mixed selection and original segmentation/null/default state contracts, all-script items, caret/table/history ownership and readonly request boundaries. Related font/character/script/selection/hint/history/ODT/widget/Calc-sharing/resource tests, actual Chromium desktop/mobile custom size/grow/shrink/Undo/Redo/download/reopen. Strict current changed-responsibility coverage with exact source identities; all declared local typecheck/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff/status gates. Seventh task after ACR55N: no full suite.

## Verification

Command: pinned local LibreOffice9bc445578031fecf56086729d8e4940c77e14d65 ctrltool.cxx/ctrlbox.cxx/tbunocontroller.cxx/txtattr.cxx/edattr.cxx/hints.cxx/languageoptions.cxx/sidebartextpanel.ui/swriter.sdi and original ItemInfo slot metadata review.
Result: pass for the consumed absolute numeric/control, script-query, contribution traversal and Grow/Shrink branches. Source anomalies WRITER057/058/059 recorded and preserved. No native binary/service parity certification.
Scope:28 implementation/resource/tooling paths and19 test paths, paired canonical records and generated views; writer checkout/branch only.

Command: Vitest argv in output/playwright/writer-font-sizing/coverage-command.json, followed by repaired focused argv in delta-command.json, plus core-current.log, boundaries-core-current.log, desktop-current.log and resources-current.log.
Result: related44-file profile had242 passes and2 old FontCommandSelects expectation failures; repaired current16-file profile passes109 tests, including all4 actual FontCommandSelects cases. Related core4files43, exact boundaries3files31, default desktop11 and resource tooling2 also pass. No unchanged passing related test repeated solely to inflate totals.
Scope: numeric units/decimal/empty/invalid/rounding, actual toolbox/browser lifecycle, actual Writer items/scripts/PaM selection/table/history, shared Calc scalar boundary and controls, ODT, keyboard aliases, source boundaries and resources.

Command: node output/playwright/writer-font-sizing/audit-incremental-coverage.mjs
Result: pass;24 executable current source identities, S1665/B1245/F396/L1485 all100, no missing counters. Fresh current delta plus exact-map numeric profile; historical carry only for unchanged exact source spans with baseline source hashes and git-diff correspondence. Current raw focused run retains global thresholds and therefore exits1 with partial whole-owner S68.58/B56.54/F66.66/L69.62; it is not falsely reported as a whole-suite coverage pass. Audit result is changed-responsibility/unchanged-span evidence only.
Evidence: incremental-coverage-audit.json, incremental-coverage/coverage-final.json, delta-coverage.log, numeric-coverage.log; no threshold/ignore/counter manipulation.

Command: npm run build (fail-fast subprocess), then node_modules/.bin/playwright test --config output/playwright/writer-font-sizing/playwright-current-build.config.ts --project=writer --project=calc writer-font-sizing.spec.ts writer-properties-sidebar.spec.ts writer-table-headlines.spec.ts calc/font-size.spec.ts calc/font-step.spec.ts calc/alignment.spec.ts calc/formatting-toolbar.spec.ts
Result: pass;18 current-build Chromium cases at1280/390. Custom13.3, real native Grow/Shrink keyboard and sidebar buttons, grouped Undo/Redo, document selection/table reflow and physical ODT/ODS download/reopen. Asset SHA256 identities saved in browser-build-identity.json. Actual font-sizing screenshots visually inspected at both widths; root overflow assertion passes. No browser errors.
Evidence: build-final.log, browser-current-build.log and browser-current-build-results. Earlier failed browser-final/browser-repair artifacts used stale assets after a type error; those runs are retained and excluded from current-source pass evidence.

Command: npm run typecheck; npm run check:docs; npm run check:dependencies; npm run check:writer-resources; npm run inventory:invariants; npm run inventory:parity; npm run check:source-provenance; npm run check:source-tree; npm run check:file-size; scoped node_modules/.bin/eslint --max-warnings0 and prettier --check over exact changed paths; node scripts/check-static-build.mjs; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass; exact individual logs and exit codes in final-gates.json. Provenance1128 runtime modules; native mapped/browser adaptations retain previous statuses without promotions. Source commit, evaluator report and final clean status recorded at closure.
Scope: seventh task after ACR55N; full suite intentionally not run under user one-in-ten cadence. Goal remains active after closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-23T00:33:23.304Z — VERIFY — ok

By: CODER

Note: Original font-size controls and Grow/Shrink wired through actual Writer items/ranges/history and shared Calc scalar boundary;109 current focused cases, related43-file passes plus repaired UI file,31 boundary cases,18 current-build Chromium scenarios and strict24-owner S1665/B1245/F396/L1485 all100 source audit; all declared local gates pass. Full suite follows one-in-ten cadence; task7. Native service gaps remain documented.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T00:33:13.659Z, excerpt_hash=sha256:60107436fdec559d1d08da74f052c56adb9a09753bbc65d83853f6bec3d7c241

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610222322-014VCW/blueprint/resolved-snapshot.json
- old_digest: 81766790ba2944cfaa75b07c0ab58676c98a83ccd60342871ae2cb19f6ff92b0
- current_digest: 81766790ba2944cfaa75b07c0ab58676c98a83ccd60342871ae2cb19f6ff92b0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610222322-014VCW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610222322-014VCW
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commits, preserving prior paper/table/character work and task traceability. No reset, merge or external write.

## Findings

Implemented original32 scalable font sizes and absolute FontSizeBox contracts through existing VCL conversion/system decimal fields. Shared editable widget preserves typing versus direct pick, Enter/Tab/Escape, last-status restoration, focus before float32 dispatch and source row order. Writer and shared Calc command boundary now use actual SvxFontHeightItem.PutValue;13.3 rounds266twips. Calc public direct SetFontSize validation remains unchanged. Original sidebar/menu slots20403/20404 and platform bracket aliases execute actual Writer commands.

Native Grow/Shrink uses40twips,19998 maximum, exact-bound enabled state and uint32 arithmetic before comparisons. Real script aggregate/language/Which queries and source-ordered node/automatic hint contributions drive explicit independent PaM edits, all3 script heights with original SetHeight reset, retained live selection and actual grouped history. Existing bounded pool-default registration now carries original height slots10015/10888/10893; complete native ItemInfoPackage registration is not replaced. GetUserDefaultItem for known bounded defaults correctly reports no installed user override. No fake font, layout, style, locale or provider service is introduced.

Resolved local observations: missing Writer pool10015 mapping exposed absent native slot metadata, corrected at existing registration owner with duplicate rejection before mutation. WEAK is original i18n value4. Original AllSettings.GetLanguageTag uses configured data locale, distinct from UI language; implementation/tests corrected accordingly. Numeric Math.round is exact over admitted nonnegative domain. Earlier no-argument height constructor fixed to CreateDefault. React draft replaced with persistent external store to satisfy lifecycle/lint. Typed same-value status legitimately retains raw24 until subsequent blur/status; tests accept original control lifecycle. Existing tests that assumed immediate select change now use actual Enter/Tab. Table reflow scenario now uses Enter to return native document focus, since Tab intentionally retains toolbar traversal.

Verification failures and repairs: related profile's old FontCommandSelects2 assertions were corrected and current4 cases pass. Shared-project desktop invocation returned no tests; correct default Vitest passes11. Missing mechanical filename divergence records and exhaustive mutation-operation inventory record were added canonically, without weakening gates. Testing Library does not support Playwright exact option; removed unsupported test option. That type error caused an earlier shell pipeline to continue with stale bundle; browser failures from that run are explicitly excluded. Fresh build now uses fail-fast check=True, saves asset hashes and passes18 current browser cases. Raw focused coverage retains unchanged100 thresholds and fails partial whole-owner totals; exact source/hash audit separately proves all changed counters fresh and only verified unchanged spans carry prior hits.

Residual boundaries: complete native font/device enumeration, relative/Chinese named-size modes, LanguageTag/ApplicationSettings option services, SwScriptInfo/layout field expansion/merged/redline/character-format style resolution and complete readonly/service graph remain unverified. Represented layout-absent original branches and automatic hints are covered; unsupported style/INET services are not fabricated or claimed complete. Original SetAttrSet nondefault modes reject before mutation. WRITER057(empty0pt),058(unsigned wrapping/exact disabled bounds),059(source contribution/null/default behavior) document source suspicions, not proven compiled application defects. Deliberate browser recovery/autosave/open/save deviations unchanged. Only pinned approved local references, no network/merges/outside mutations. User latest continuation revokes older stop instructions; goal remains active. Task is seventh since last full checkpointACR55N; next full suite due at task10.
