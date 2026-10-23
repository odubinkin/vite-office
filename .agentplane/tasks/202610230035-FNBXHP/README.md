---
id: "202610230035-FNBXHP"
title: "Canonicalize Writer line spacing popup and native item dispatch"
result_summary: "Original line-spacing popup modes and full item request/state now operate through actual Writer selected paragraphs, table ranges, grouped history, module units and ODT. Native icons and numeric/percent contracts are retained; source suspicion WRITER060 preserved. Current related checks and exact source-bound audit pass. Goal continues; full suite due task10(current8)."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T00:35:40.657Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-23T01:20:51.152Z"
  updated_by: "CODER"
  note: "Native eight-mode popup and complete item state/request now connect real Writer selection/table/history/ODT and module units;49 current related,18 paragraph/layout,16 exact boundary and7 current-build Chromium cases pass.14-owner exact-source audit S1216/B899/F342/L1123 all100; all local gates pass. Raw partial focused thresholds and native-service/CLDR limits remain explicit. Task8; goal continues."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-23T01:22:31.053Z"
  updated_by: "EVALUATOR"
  note: "Source a6d345f4fc63 implements the consumed eight-mode native popup and typed Writer line-spacing transport. Independently checked actual source/build/producer/resource hashes, pinned source contracts, current test logs, gate codes and clean source tree."
  evaluated_sha: "a6d345f4fc63ff593ff9684758acb4cbc44caca7"
  blueprint_digest: "fcc2c3febeb788b228e29e81bc9124c3c204d6ed4df2e903d5432f3a9bb62480"
  evidence_refs:
    - ".agentplane/tasks/202610230035-FNBXHP/README.md"
    - ".agentplane/tasks/202610230035-FNBXHP/quality/20261023-012231053-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610230035-FNBXHP/quality/20261023-012231053-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610230035-FNBXHP/quality/20261023-012231053-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610230035-FNBXHP/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-line-spacing/incremental-coverage-audit.json"
    - "output/playwright/writer-line-spacing/coverage-producer.json"
    - "output/playwright/writer-line-spacing/final-gates.json"
    - "output/playwright/writer-line-spacing/browser-final.log"
    - "output/playwright/writer-line-spacing/browser-build-identity.json"
    - "output/playwright/writer-line-spacing/upstream-icon-audit.json"
  findings:
    - "Original mode/item fields, uint16/signed leading behavior, metric minimum/default transitions, complete pooled state, mixed/table history, original icons, required module units and explicit percent overrides are represented through actual source owners and frame dispatch. Deliberate browser I/O deviations remain intact."
    - "Current12-file49-case profile and7 current-build Chromium cases plus18 layout/paragraph and16 boundary cases pass. Exact14-owner source-bound audit S1216/B899/F342/L1123 all100 is separate from disclosed partial focused raw thresholds. Repaired legacy selector and unit expectations retain assertions rather than weakening source behavior."
commit:
  hash: "a6d345f4fc63ff593ff9684758acb4cbc44caca7"
  message: "🚧 FNBXHP task: connect native Writer line spacing popup and item dispatch"
comments:
  -
    author: "CODER"
    body: "Start: implement original eight-mode line spacing popup and full native item dispatch on writer under existing user continuation approval; related tests only on task8."
  -
    author: "CODER"
    body: "Verified: original eight-mode popup, native item transport, module units, spin controls and source icons connect actual Writer mixed/table/history/ODT;49 related,18 paragraph/layout,16 boundary and7 current-build Chromium cases pass with strict14-owner source audit and all local gates."
events:
  -
    type: "status"
    at: "2026-10-23T00:35:41.058Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original eight-mode line spacing popup and full native item dispatch on writer under existing user continuation approval; related tests only on task8."
  -
    type: "verify"
    at: "2026-10-23T01:20:51.152Z"
    author: "CODER"
    state: "ok"
    note: "Native eight-mode popup and complete item state/request now connect real Writer selection/table/history/ODT and module units;49 current related,18 paragraph/layout,16 exact boundary and7 current-build Chromium cases pass.14-owner exact-source audit S1216/B899/F342/L1123 all100; all local gates pass. Raw partial focused thresholds and native-service/CLDR limits remain explicit. Task8; goal continues."
  -
    type: "status"
    at: "2026-10-23T01:23:00.251Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original eight-mode popup, native item transport, module units, spin controls and source icons connect actual Writer mixed/table/history/ODT;49 related,18 paragraph/layout,16 boundary and7 current-build Chromium cases pass with strict14-owner source audit and all local gates."
doc_version: 3
doc_updated_at: "2026-10-23T01:23:00.252Z"
doc_updated_by: "CODER"
description: "Replace the percentage-only browser popup with original ParaLineSpacingControl initialization, eight modes, metric and percent fields and predefined acceptance, carrying actual SvxLineSpacingItem state and execution through Writer history and ODT."
sections:
  Summary: "Expose original Writer line spacing popup modes and native item dispatch through actual Sfx bindings, history and ODT. Replace the percentage-only custom Apply popup with source-backed immediate acceptance and predefined-button close behavior."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer, branch writer. Up to22 implementation/resource/tooling paths and12 test paths plus paired canonical metadata/generated views. Original ParaLineSpacingControl source owner, browser popup presentation, actual numeric/metric fields with module measurement unit, native SvxLineSpacingItem request/state, Writer toolbar/sidebar callers, related history/layout/ODT. Existing represented shell/range dispatch owners only. No full font/layout/native configuration service, fake backend, locale data expansion, network, merges or intentional I/O/recovery/autosave deviation changes."
  Plan: "Port original ParaLineSpacingControl Initialize, UpdateMetricFields, SetLineSpace and execute/preset branches over actual existing metric/numeric and SvxLineSpacingItem owners; preserve eight source mode positions, constructor resource ranges/defaults, original28twip fixed minimum/283twip repair and unsigned casts. Expose complete native line spacing item state and execution through actual Writer slot/item-set path while maintaining current caller compatibility as needed without parallel formatting logic. Replace percentage-only Writer popup with source structure/four preset buttons and eight-mode Custom Value controls, correct measurement units, enabled/mixed status, focus/dismissal and close-only-preset behavior. Verify all modes, native acceptance, undo/redo and physical ODT/layout through related portable and actual desktop/mobile Chromium tests; update source records and suspected issues if needed, strict changed-responsibility coverage/local gates, commit/quality/close and continue active goal."
  Verify Steps: "Read pinned ParaLineSpacingControl.cxx/.hxx, ParaLineSpacingPopup.cxx and paralinespacingcontrol.ui, actual txtattr.cxx line-space request/state and existing SvxLineSpacingItem setters/I/O/layout. Test source eight mode order, Initialize Auto/Off/Prop115/150/200/custom/Fix/Min/Leading, unknown/disabled states, four preset closure vs mode/value immediate retained popup; original percent6..65535, metric resource bounds/units and28/283twip fixed transition behavior, uint16 casts and native default item fields. Use actual module unit and VCL conversion, no synthetic native services. All modes through native item dispatch, mixed/table/text selection, grouped history and ODT roundtrip/layout; preserve existing line-spacing and paragraph caller regressions. Chromium1280/390 actual toolbar/sidebar popup, mode/value edit, undo/redo, ODT download/reopen, no root overflow/error. Strict changed-responsibility100 coverage with exact source identities and untouched thresholds; type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff and clean final status. Eighth task since fullACR55N: related tests only, next full due task10."
  Verification: |-
    Command: pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65 ParaLineSpacingControl.cxx/.hxx, ParaLineSpacingPopup.cxx, paralinespacingcontrol.ui, txtattr.cxx, weld MetricSpinButton.hxx/.cxx, svtools unitconv.cxx, vcl map.cxx and unicode.cxx formatPercent review.
    Result: pass for consumed original eight-mode popup/item, numeric/map conversion and formatter branches. Actual request/state transport and original slot10033 metadata are connected. WRITER060 documented/preserved. Full native binary/services are not certified.
    Scope:20 implementation/resource/tooling paths and11 test paths, paired canonical metadata and generated views, writer checkout/branch only.

    Command: exact Vitest argv in output/playwright/writer-line-spacing/coverage-command.json.
    Result:12files49 tests pass on current source. Related native fields/percent formatting, original modes/bounds/disabled/unknown, real Writer mixed paragraph/table item state and history, pointer/keyboard browser controls, editable font/style regressions and ODT roundtrip. Raw focused whole-owner coverage exits1 at S64.47/B57.73/F68.71/L65.8 under unchanged100 thresholds; this is explicitly not a whole-suite coverage pass.
    Command: Vitest run paragraph-line-mode.test.ts, native-paragraph-sidebar-slots.test.ts, native-paragraph-lines.test.ts.
    Result:3files18 additional related paragraph/layout cases pass.
    Command: root Vitest run scripts/native-line-spacing-boundary.test.ts scripts/native-font-size-boundary.test.ts.
    Result:2files16 exact/neighbor/blanket-boundary cases pass.
    Evidence: coverage-current.log, coverage-producer.json, coverage-source-identities.json, layout-related-current.log, boundaries-current.log.

    Command: node output/playwright/writer-line-spacing/audit-incremental-coverage.mjs.
    Result: pass;14 executable current source identities, S1216/B899/F342/L1123 all100, no missing counters. Current producer/report hashes and source bytes are checked. Historical hits carry only for exact unchanged source spans at git-diff-corresponding locations with baseline source-hash verification; changed/new counters remain fresh. Previous intermediate/failed-profile evidence is not current certification. Latest main profile includes all current TS code, so the earlier supplementary icon profile does not replace any latest main-source map.
    Evidence: incremental-coverage-audit.json and incremental-coverage/coverage-final.json; no threshold/ignore/counter manipulation. Pure forwarding header has no executable counters.

    Command: fail-fast npm run build, then node_modules/.bin/playwright test --config output/playwright/writer-line-spacing/playwright.config.ts --project=writer writer-line-spacing.spec.ts writer-properties-sidebar.spec.ts.
    Result:7 current-build Chromium cases pass.1280/390 CM and1280 INCH selected through actual Options, eight modes, immediate edits/percent suffix, original preset icons, native spin pointer steps, actual Undo/Redo, fixed physical ODT download/reopen, actual Properties/table/sidebar regressions. No runtime errors in fresh native popup scenarios; popup bounds stay in viewport. Final CM desktop/mobile and INCH screenshots inspected.
    Evidence: build-final.log, browser-final.log, browser-build-identity.json and browser-results. Original three SVG assets are byte-for-byte pinned colibre_svg resources, confirmed in upstream-icon-audit.json. Prettier has no SVG parser: scoped --check --ignore-unknown matches its ordinary unsupported-asset treatment, while all supported code/JSON/Markdown paths are formatted and SVG bytes/tree are separately checked.

    Command: current typecheck, scoped ESLint max-warnings0, scoped Prettier, check:docs, check:dependencies, check:writer-resources, inventory:invariants/parity, check:source-provenance/tree/file-size, static build, ap doctor, routing validation and git diff --check.
    Result: all pass; actual exit codes in final-gates.json and individual final logs.1132 provenance runtime modules retain classifications/statuses; no broad native parity promotion. Final source commit/EVALUATOR/quality closure and clean status are recorded at closeout.
    Scope: task8 since ACR55N; full suite intentionally not run under user one-in-ten cadence, next due at task10. Goal remains active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-23T01:20:51.152Z — VERIFY — ok

    By: CODER

    Note: Native eight-mode popup and complete item state/request now connect real Writer selection/table/history/ODT and module units;49 current related,18 paragraph/layout,16 exact boundary and7 current-build Chromium cases pass.14-owner exact-source audit S1216/B899/F342/L1123 all100; all local gates pass. Raw partial focused thresholds and native-service/CLDR limits remain explicit. Task8; goal continues.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T01:20:50.634Z, excerpt_hash=sha256:b08cbbf1b987fd673837aa4d4d5a7ce4dc62fbed283a2d542dfcc17457f67b99

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610230035-FNBXHP/blueprint/resolved-snapshot.json
    - old_digest: fcc2c3febeb788b228e29e81bc9124c3c204d6ed4df2e903d5432f3a9bb62480
    - current_digest: fcc2c3febeb788b228e29e81bc9124c3c204d6ed4df2e903d5432f3a9bb62480
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610230035-FNBXHP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610230035-FNBXHP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task implementation commits, retaining prior font-size and other Writer work and traceability. No reset/merge or external mutation."
  Findings: |-
    Implemented the original eight-mode line-spacing popup and complete native item transport under approved scope. Original source controller owns mode/state/field transitions, single versus115/150/200 proportional presets, custom proportional/minimum/leading/fixed values, disabled/unknown behavior, native field resource limits,28twip minimum with283twip repair, uint16 narrowing and preset-only closure. Browser composition presents the four original Colibre icons (1 and1.15 share source icon), native numeric entry/spin arrows and source focus target. Module measurement unit is now required by the control/toolbar contract and supplied by actual Writer snapshot; no arbitrary CM production fallback remains. Tests with independent toolbar fixtures supply an explicit unit.

    Complete SvxLineSpacingItem request/state replaces percent/custom projection in actual Writer bindings. Slot10033 is part of existing bounded pool-default metadata, request matching uses GetWhichIDFromSlotID, and the original item is copied/remapped to Writer Which without losing inactive fields or mutating borrowed ownership. Existing selected paragraph/table traversal and grouped history are used. The old public percent argument adapter remains only for existing callers; UI uses native typed items. Positive source modes, real mixed/table history and physical ODT roundtrip are verified.

    Original scalar LogicToLogic reuses native o3tl factors and JS BigInt for signed integral rounding/overflow fallback; no OutputDevice service, mapper cache or allocation engine is fabricated. SetMetricValue/GetCoreValue preserve hundredth-mm normalization and original large-value denormalization order. Shared weld set_min is now the original helper. Initial commentary suspected full range conversion might differ from native set_min; reading actual header disproved this: native set_min performs the same get_range/set_range sequence. Preserved that behavior and moved it to its original common owner. No unsupported correction was made.

    The numeric popup originally lacked a percent suffix in the browser draft. Original MetricSpinButton::format_number delegates percent to unicode::formatPercent; added its narrowly split source responsibility with borrowed actual language/locale-ID fields and native JS Intl.NumberFormat replacing ICU formatting. Preserved divide-by100, Spanish/Slovenian French-locale spacing override, German narrow no-break spaces and original failure fallback. Browser uses actual configured/system Locale fields, including qlt variants. This does not implement full LanguageTag/ICU services or certify identical output across every native ICU/browser CLDR version. No locale-data expansion or native memory model.

    Source suspicion WRITER060 is preserved: admitted100cm becomes56693twips and signed leading stores-8843. Native source intent/platform reachability remain unverified; this is not a compiled native application bug claim. Other native device/layout/frame/configuration/readonly/service graphs and complete native builds remain unverified. Represented lower popup disabled/unknown status is tested through actual Sfx framework contracts; no full Writer readonly service is claimed. Deliberate browser I/O/recovery/autosave differences unchanged.

    Resolved local verification failures: missing required ODT metadata argument corrected; exact scalar/host/percent source edges admitted with neighboring/blanket restrictions intact. ASCII inch quote test corrected to original double-prime. React direct useState-owner assignment replaced by native accepted-value handler. Existing Custom Apply and number/custom state assertions migrated to native immediate/item contracts. Basename-only provenance and forwarding-header executable-symbol metadata corrected canonically, without weakening validation. New no-unit native field fixture initially expected0.50 but original SetFieldUnit NONE preserves the normalized twip representation283.00; expectation corrected from source. Framework status fixture initially omitted required invalidation dependency; corrected to formatting. Dated style-selector tests still assumed FontSizeSelect was HTMLSelectElement.options; migrated to actual editable combo and Enter acceptance, preserving argument merge assertions. INCH browser test initially retained two CM expectations; corrected, narrow repair passed, then final complete7-case current-build run passed after icons/required-unit completion. Copied SVG formatting probe reported no parser; source bytes were retained and separately audited. All failed evidence remains in task-local ignored output.

    Coverage integrity: failed Vitest profiles do not emit current coverage files. An attempted audit after such a failure correctly rejected missing producer output; its prior audit JSON was not current proof. Audit now removes the old final report at start, validates producer/report/source hashes, and final49-case profile emitted a fresh report before the successful14-owner audit. Raw focused partial whole-owner threshold failures remain disclosed separately from unchanged-span incremental evidence. No hidden global threshold changes or coverage ignores.

    All changes stay in vite-office-writer branch writer with only approved pinned local references; no network, external mutations, branch/worktree/merge/push or unrelated native service graph.20 implementation/resource/tooling paths and11 tests remain within22/12 approved budgets. Task closes only after source/quality persistence and final clean state. Latest user continuation revokes older stop instructions: goal remains active. Task8 since fullACR55N; next full suite due task10.
id_source: "generated"
---
## Summary

Expose original Writer line spacing popup modes and native item dispatch through actual Sfx bindings, history and ODT. Replace the percentage-only custom Apply popup with source-backed immediate acceptance and predefined-button close behavior.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer, branch writer. Up to22 implementation/resource/tooling paths and12 test paths plus paired canonical metadata/generated views. Original ParaLineSpacingControl source owner, browser popup presentation, actual numeric/metric fields with module measurement unit, native SvxLineSpacingItem request/state, Writer toolbar/sidebar callers, related history/layout/ODT. Existing represented shell/range dispatch owners only. No full font/layout/native configuration service, fake backend, locale data expansion, network, merges or intentional I/O/recovery/autosave deviation changes.

## Plan

Port original ParaLineSpacingControl Initialize, UpdateMetricFields, SetLineSpace and execute/preset branches over actual existing metric/numeric and SvxLineSpacingItem owners; preserve eight source mode positions, constructor resource ranges/defaults, original28twip fixed minimum/283twip repair and unsigned casts. Expose complete native line spacing item state and execution through actual Writer slot/item-set path while maintaining current caller compatibility as needed without parallel formatting logic. Replace percentage-only Writer popup with source structure/four preset buttons and eight-mode Custom Value controls, correct measurement units, enabled/mixed status, focus/dismissal and close-only-preset behavior. Verify all modes, native acceptance, undo/redo and physical ODT/layout through related portable and actual desktop/mobile Chromium tests; update source records and suspected issues if needed, strict changed-responsibility coverage/local gates, commit/quality/close and continue active goal.

## Verify Steps

Read pinned ParaLineSpacingControl.cxx/.hxx, ParaLineSpacingPopup.cxx and paralinespacingcontrol.ui, actual txtattr.cxx line-space request/state and existing SvxLineSpacingItem setters/I/O/layout. Test source eight mode order, Initialize Auto/Off/Prop115/150/200/custom/Fix/Min/Leading, unknown/disabled states, four preset closure vs mode/value immediate retained popup; original percent6..65535, metric resource bounds/units and28/283twip fixed transition behavior, uint16 casts and native default item fields. Use actual module unit and VCL conversion, no synthetic native services. All modes through native item dispatch, mixed/table/text selection, grouped history and ODT roundtrip/layout; preserve existing line-spacing and paragraph caller regressions. Chromium1280/390 actual toolbar/sidebar popup, mode/value edit, undo/redo, ODT download/reopen, no root overflow/error. Strict changed-responsibility100 coverage with exact source identities and untouched thresholds; type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff and clean final status. Eighth task since fullACR55N: related tests only, next full due task10.

## Verification

Command: pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65 ParaLineSpacingControl.cxx/.hxx, ParaLineSpacingPopup.cxx, paralinespacingcontrol.ui, txtattr.cxx, weld MetricSpinButton.hxx/.cxx, svtools unitconv.cxx, vcl map.cxx and unicode.cxx formatPercent review.
Result: pass for consumed original eight-mode popup/item, numeric/map conversion and formatter branches. Actual request/state transport and original slot10033 metadata are connected. WRITER060 documented/preserved. Full native binary/services are not certified.
Scope:20 implementation/resource/tooling paths and11 test paths, paired canonical metadata and generated views, writer checkout/branch only.

Command: exact Vitest argv in output/playwright/writer-line-spacing/coverage-command.json.
Result:12files49 tests pass on current source. Related native fields/percent formatting, original modes/bounds/disabled/unknown, real Writer mixed paragraph/table item state and history, pointer/keyboard browser controls, editable font/style regressions and ODT roundtrip. Raw focused whole-owner coverage exits1 at S64.47/B57.73/F68.71/L65.8 under unchanged100 thresholds; this is explicitly not a whole-suite coverage pass.
Command: Vitest run paragraph-line-mode.test.ts, native-paragraph-sidebar-slots.test.ts, native-paragraph-lines.test.ts.
Result:3files18 additional related paragraph/layout cases pass.
Command: root Vitest run scripts/native-line-spacing-boundary.test.ts scripts/native-font-size-boundary.test.ts.
Result:2files16 exact/neighbor/blanket-boundary cases pass.
Evidence: coverage-current.log, coverage-producer.json, coverage-source-identities.json, layout-related-current.log, boundaries-current.log.

Command: node output/playwright/writer-line-spacing/audit-incremental-coverage.mjs.
Result: pass;14 executable current source identities, S1216/B899/F342/L1123 all100, no missing counters. Current producer/report hashes and source bytes are checked. Historical hits carry only for exact unchanged source spans at git-diff-corresponding locations with baseline source-hash verification; changed/new counters remain fresh. Previous intermediate/failed-profile evidence is not current certification. Latest main profile includes all current TS code, so the earlier supplementary icon profile does not replace any latest main-source map.
Evidence: incremental-coverage-audit.json and incremental-coverage/coverage-final.json; no threshold/ignore/counter manipulation. Pure forwarding header has no executable counters.

Command: fail-fast npm run build, then node_modules/.bin/playwright test --config output/playwright/writer-line-spacing/playwright.config.ts --project=writer writer-line-spacing.spec.ts writer-properties-sidebar.spec.ts.
Result:7 current-build Chromium cases pass.1280/390 CM and1280 INCH selected through actual Options, eight modes, immediate edits/percent suffix, original preset icons, native spin pointer steps, actual Undo/Redo, fixed physical ODT download/reopen, actual Properties/table/sidebar regressions. No runtime errors in fresh native popup scenarios; popup bounds stay in viewport. Final CM desktop/mobile and INCH screenshots inspected.
Evidence: build-final.log, browser-final.log, browser-build-identity.json and browser-results. Original three SVG assets are byte-for-byte pinned colibre_svg resources, confirmed in upstream-icon-audit.json. Prettier has no SVG parser: scoped --check --ignore-unknown matches its ordinary unsupported-asset treatment, while all supported code/JSON/Markdown paths are formatted and SVG bytes/tree are separately checked.

Command: current typecheck, scoped ESLint max-warnings0, scoped Prettier, check:docs, check:dependencies, check:writer-resources, inventory:invariants/parity, check:source-provenance/tree/file-size, static build, ap doctor, routing validation and git diff --check.
Result: all pass; actual exit codes in final-gates.json and individual final logs.1132 provenance runtime modules retain classifications/statuses; no broad native parity promotion. Final source commit/EVALUATOR/quality closure and clean status are recorded at closeout.
Scope: task8 since ACR55N; full suite intentionally not run under user one-in-ten cadence, next due at task10. Goal remains active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-23T01:20:51.152Z — VERIFY — ok

By: CODER

Note: Native eight-mode popup and complete item state/request now connect real Writer selection/table/history/ODT and module units;49 current related,18 paragraph/layout,16 exact boundary and7 current-build Chromium cases pass.14-owner exact-source audit S1216/B899/F342/L1123 all100; all local gates pass. Raw partial focused thresholds and native-service/CLDR limits remain explicit. Task8; goal continues.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T01:20:50.634Z, excerpt_hash=sha256:b08cbbf1b987fd673837aa4d4d5a7ce4dc62fbed283a2d542dfcc17457f67b99

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610230035-FNBXHP/blueprint/resolved-snapshot.json
- old_digest: fcc2c3febeb788b228e29e81bc9124c3c204d6ed4df2e903d5432f3a9bb62480
- current_digest: fcc2c3febeb788b228e29e81bc9124c3c204d6ed4df2e903d5432f3a9bb62480
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610230035-FNBXHP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610230035-FNBXHP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task implementation commits, retaining prior font-size and other Writer work and traceability. No reset/merge or external mutation.

## Findings

Implemented the original eight-mode line-spacing popup and complete native item transport under approved scope. Original source controller owns mode/state/field transitions, single versus115/150/200 proportional presets, custom proportional/minimum/leading/fixed values, disabled/unknown behavior, native field resource limits,28twip minimum with283twip repair, uint16 narrowing and preset-only closure. Browser composition presents the four original Colibre icons (1 and1.15 share source icon), native numeric entry/spin arrows and source focus target. Module measurement unit is now required by the control/toolbar contract and supplied by actual Writer snapshot; no arbitrary CM production fallback remains. Tests with independent toolbar fixtures supply an explicit unit.

Complete SvxLineSpacingItem request/state replaces percent/custom projection in actual Writer bindings. Slot10033 is part of existing bounded pool-default metadata, request matching uses GetWhichIDFromSlotID, and the original item is copied/remapped to Writer Which without losing inactive fields or mutating borrowed ownership. Existing selected paragraph/table traversal and grouped history are used. The old public percent argument adapter remains only for existing callers; UI uses native typed items. Positive source modes, real mixed/table history and physical ODT roundtrip are verified.

Original scalar LogicToLogic reuses native o3tl factors and JS BigInt for signed integral rounding/overflow fallback; no OutputDevice service, mapper cache or allocation engine is fabricated. SetMetricValue/GetCoreValue preserve hundredth-mm normalization and original large-value denormalization order. Shared weld set_min is now the original helper. Initial commentary suspected full range conversion might differ from native set_min; reading actual header disproved this: native set_min performs the same get_range/set_range sequence. Preserved that behavior and moved it to its original common owner. No unsupported correction was made.

The numeric popup originally lacked a percent suffix in the browser draft. Original MetricSpinButton::format_number delegates percent to unicode::formatPercent; added its narrowly split source responsibility with borrowed actual language/locale-ID fields and native JS Intl.NumberFormat replacing ICU formatting. Preserved divide-by100, Spanish/Slovenian French-locale spacing override, German narrow no-break spaces and original failure fallback. Browser uses actual configured/system Locale fields, including qlt variants. This does not implement full LanguageTag/ICU services or certify identical output across every native ICU/browser CLDR version. No locale-data expansion or native memory model.

Source suspicion WRITER060 is preserved: admitted100cm becomes56693twips and signed leading stores-8843. Native source intent/platform reachability remain unverified; this is not a compiled native application bug claim. Other native device/layout/frame/configuration/readonly/service graphs and complete native builds remain unverified. Represented lower popup disabled/unknown status is tested through actual Sfx framework contracts; no full Writer readonly service is claimed. Deliberate browser I/O/recovery/autosave differences unchanged.

Resolved local verification failures: missing required ODT metadata argument corrected; exact scalar/host/percent source edges admitted with neighboring/blanket restrictions intact. ASCII inch quote test corrected to original double-prime. React direct useState-owner assignment replaced by native accepted-value handler. Existing Custom Apply and number/custom state assertions migrated to native immediate/item contracts. Basename-only provenance and forwarding-header executable-symbol metadata corrected canonically, without weakening validation. New no-unit native field fixture initially expected0.50 but original SetFieldUnit NONE preserves the normalized twip representation283.00; expectation corrected from source. Framework status fixture initially omitted required invalidation dependency; corrected to formatting. Dated style-selector tests still assumed FontSizeSelect was HTMLSelectElement.options; migrated to actual editable combo and Enter acceptance, preserving argument merge assertions. INCH browser test initially retained two CM expectations; corrected, narrow repair passed, then final complete7-case current-build run passed after icons/required-unit completion. Copied SVG formatting probe reported no parser; source bytes were retained and separately audited. All failed evidence remains in task-local ignored output.

Coverage integrity: failed Vitest profiles do not emit current coverage files. An attempted audit after such a failure correctly rejected missing producer output; its prior audit JSON was not current proof. Audit now removes the old final report at start, validates producer/report/source hashes, and final49-case profile emitted a fresh report before the successful14-owner audit. Raw focused partial whole-owner threshold failures remain disclosed separately from unchanged-span incremental evidence. No hidden global threshold changes or coverage ignores.

All changes stay in vite-office-writer branch writer with only approved pinned local references; no network, external mutations, branch/worktree/merge/push or unrelated native service graph.20 implementation/resource/tooling paths and11 tests remain within22/12 approved budgets. Task closes only after source/quality persistence and final clean state. Latest user continuation revokes older stop instructions: goal remains active. Task8 since fullACR55N; next full suite due task10.
