---
id: "202610191738-6PMYVV"
title: "Connect Calc font-family UI with native script attributes and ODS font declarations"
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
  updated_at: "2026-10-19T17:40:52.655Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T19:48:50.779Z"
  updated_by: "CODER"
  note: "verified-202610191738-6PMYVV"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-19T19:48:35.536Z"
  updated_by: "EVALUATOR"
  note: "The committed bounded font UI/native-item slice satisfies approved evidence gates; full application parity is not promoted."
  evaluated_sha: "f8583d20a4af1f5c753b1971a03144a476d7e6be"
  blueprint_digest: "0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe"
  evidence_refs:
    - ".agentplane/tasks/202610191738-6PMYVV/README.md"
    - ".agentplane/tasks/202610191738-6PMYVV/quality/20261019-194835536-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610191738-6PMYVV/quality/20261019-194835536-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610191738-6PMYVV/quality/20261019-194835536-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610191738-6PMYVV/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610191738-6PMYVV/evidence/changed-font-owner-coverage.json"
    - ".agentplane/tasks/202610191738-6PMYVV/evidence/calc-font-styles-proof.json"
    - ".agentplane/tasks/202610191738-6PMYVV/evidence/related-font-final-proof.json"
    - ".agentplane/tasks/202610191738-6PMYVV/evidence/browser-styles-fixed.log"
    - ".agentplane/tasks/202610191738-6PMYVV/evidence/script-native-source-report.json"
  findings:
    - "Commit f8583d20a4af contains143 intentional non-task paths within180 approved; actual shared Writer font controls, source script selection, full native font metadata and ODS declarations are wired to real owners and histories."
    - "Calc120files353cases and related271files11822cases pass at raw S/B/F/L100. All37 changed executable owners have source-matched raw100; erased IDL and pure re-export are explicitly accounted for without exclusions."
    - "Fresh production build and19 Chromium Calc cases pass,including ODS in page/Worker and font selection/history at1280/390; inspected screenshots confirm shared control layout. Initial styles-stream failure is retained and corrected through explicit unsupported-style diagnostics."
    - "Pinned ICU scalar witness covers all1114112codepoints; constrained dispatcher bootstrap, partial script interface, initial-NUL source cache behavior and unported service/device/layout/style scope are disclosed. No broad parity flags are set."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect native font-family UI and real ODS font values using shared Writer controls and pinned consumed script semantics in the calc branch."
events:
  -
    type: "status"
    at: "2026-10-19T17:40:57.573Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native font-family UI and real ODS font values using shared Writer controls and pinned consumed script semantics in the calc branch."
  -
    type: "verify"
    at: "2026-10-19T19:48:00.461Z"
    author: "CODER"
    state: "ok"
    note: "Passed: Calc120files353cases raw S/B/F/L100; related271files11822cases raw100; all37 changed executable owners100 with current source hashes; fresh build and19 Chromium Calc cases including ODS page/Worker; inspected1280/390; types,lint,format,source,resources,registries,48 boundary-tooling cases,static,doctor,routing,diff pass. See README Verification and final raw evidence. Full all-app next task40."
  -
    type: "verify"
    at: "2026-10-19T19:48:50.779Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610191738-6PMYVV"
doc_version: 3
doc_updated_at: "2026-10-19T19:48:50.834Z"
doc_updated_by: "CODER"
description: "Task37: connect the existing shared Writer font-family widget to real Calc script-specific SvxFontItem attributes,source selection scripts,attribute-only history,cell painting and native ODS declarations. Reuse shared Writer font/ODF owners;correct simplified common selection metadata where required by source. Port only consumed pinned ICU script/block and native script-selection paths needed for this concrete UI action,using existing local ICU78.3 sources/data;no approximate Unicode regex classifier or shadow workbook model. All changes stay in calc checkout/branch with no network or merges."
sections:
  Summary: "Connect native Calc font-family selection through the actual shared Writer control,script-specific attributes and original ODS font declaration owners. This is task37 toward the active full UI goal;the previous character-format task36 is complete."
  Scope: "Core and browser font-family state/application,consumed native script classification/selection,real native font item metadata and ODS font declarations/import/export. Reuse and if necessary correct shared Writer/browser font modules. Include related tests,canonical provenance/runtime/capability/readiness records and task evidence. Up to180non-task paths. Current plain/scalar Calc selection and device-independent rendering remain the active core slice;do not fabricate rich-edit,device font metrics,full UNO services,named cell styles or embedded-font support. Existing primary-save/no-recovery policy remains. Only calc checkout/branch;no network or branch operations."
  Plan: "Connect the real shared Writer FontNameSelect and Sfx CharFontName10007 slot to native Calc font items and original selection-script semantics. Preserve source defaults and all represented font family/style/family-enum/pitch/charset metadata;do not apply all scripts indiscriminately. Reuse XMLFontAutoStylePool/XMLFontStylesContext for real ODS font declarations and direct three-script item properties,including styled empty cells and attribute-only history. Correct shared Writer/browser font selection or declaration helpers when needed under the explicit user authorization. Port only actually consumed native ICU78.3 script/block properties and i18nutil/script-selection paths using the existing pinned local sources and original data/algorithms;no guessed Unicode ranges,host-version classification or unrelated full service/constructor programme. Keep shared Writer visual/interaction controls and existing primary-save/no-recovery deviations. Stay exclusively in this calc checkout/branch;no network,new branch,worktree or merge. Budget180non-task paths including canonical registry/source/readiness records. Verify whole Calc and complete changed executable application-owner raw S/B/F/L100 with no new exclusions;related shared/Writer/font/ICU tests and native/source evidence;actual ODS reopen and independent declarations;fresh1280/390browser interaction,types/build/static/style/source/dependency/registry/doctor/routing checks,recorded verification/evaluator and clean commits. Full all-app suite next task40;task37does not run it."
  Verify Steps: "Run npm run test:coverage:calc with nonempty raw S/B/F/L100 and complete changed executable application-owner100 without exclusions or weakened thresholds. Exercise actual shared font selector,uniform/mixed state,native script masks for Latin/Asian/Complex/weak/empty/mixed UTF16 input,retained independent font metadata,invalid arguments,failed input,no-op,grouped-sheet/range/full-axis selection,undo/redo and cell CSS. Verify genuine ODS bytes and repeated reopen plus independently authored font-face and three-script property XML;source pool name allocation/declaration order and default/direct item state. Verify consumed ICU property/script logic against pinned local78.3 sources and native evidence where compiled,with explicit source hashes and no host-version regex substitution. Run related Writer/shared/font/ICU tests and source-matched complete owner coverage. Fresh build and real browser cases at1280/390 using the actual Writer control;root/app types,changed-path lint/format,JSDoc,size/source-tree/provenance/dependencies/resources,affected Calc/shared/Writer inventories,static smoke,doctor/routing/diff. Record raw evidence,quality review and clean calc state. Full all-app regression next task40."
  Verification: |-
    Command: npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task37-calc-styles --coverage.reporter=json --coverage.reporter=text
    Result: pass.
    Evidence:120files/353cases;raw S7771/B4877/F1559/L6970 all100;99 Calc owner hashes.
    Scope: complete Calc application gate;actual shared font selector,script masks,full font values,history,CSS and real ODS.

    Command: node .agentplane/tasks/202610191738-6PMYVV/run-related-font-coverage.mjs
    Result: pass.
    Evidence:271files/11822cases;raw S2438/B1439/F472/L2240 all100;25 measured non-Calc owners.
    Scope: related Writer/shared/native-script/ODF owners. Full changed executable owner coverage37owners S3395/B1925/F642/L3112 all100,source-matched in evidence/changed-font-owner-coverage.json.

    Command: npm run typecheck; npm run build; npx playwright test --config apps/office/playwright.config.ts --project calc --workers=1
    Result: pass.
    Evidence: fresh static build;19 browser cases;inspected1280/390 screenshots;ODS page and Worker pass.
    Scope: root/tools/app types,real shared controls,actual browser history and native package import/export.

    Command: changed-path ESLint/Prettier; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run check:calc-resources; npm run check:writer-resources; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; node scripts/check-static-build.mjs; npx vitest run scripts/check-font-script-boundaries.test.ts scripts/check-module-boundaries.test.ts; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check
    Result: pass.
    Evidence: retained accept-check logs,lint/format logs and native compiled evidence;48 boundary-tooling cases pass.
    Scope: changed code/contracts/resources/registries/source provenance and local repository health.

    Full all-app tests: deferred by explicit user cadence to task40;last full task30. All source-required scoped gates pass. Overall UI delivery remains active;named/master style application,embedded fonts,device metrics and full native service/layout parity are unverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T19:48:00.461Z — VERIFY — ok

    By: CODER

    Note: Passed: Calc120files353cases raw S/B/F/L100; related271files11822cases raw100; all37 changed executable owners100 with current source hashes; fresh build and19 Chromium Calc cases including ODS page/Worker; inspected1280/390; types,lint,format,source,resources,registries,48 boundary-tooling cases,static,doctor,routing,diff pass. See README Verification and final raw evidence. Full all-app next task40.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T19:47:53.719Z, excerpt_hash=sha256:f42906141669d870ff8de5a486f8e1a3f20bbd4f45259326d8641d27669ccbad

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191738-6PMYVV/blueprint/resolved-snapshot.json
    - old_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
    - current_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191738-6PMYVV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610191738-6PMYVV
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-19T19:48:50.779Z — VERIFY — ok

    By: CODER

    Note: verified-202610191738-6PMYVV
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T19:48:00.520Z, excerpt_hash=sha256:f42906141669d870ff8de5a486f8e1a3f20bbd4f45259326d8641d27669ccbad

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191738-6PMYVV/blueprint/resolved-snapshot.json
    - old_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
    - current_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191738-6PMYVV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610191738-6PMYVV --result verified-202610191738-6PMYVV --commit f8583d20a4af1f5c753b1971a03144a476d7e6be
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation commit using the repository-approved task lifecycle;retain task/raw evidence. Preserve earlier Calc/Writer shared controls and primary ODS behavior. Do not reset the branch or alter unrelated active tasks."
  Findings: |-
    Inspection confirms source ScFormatShell uses GetSelectionScriptType for font-family application,while font-height applies all scripts. ScViewFunc falls back to ScGlobal::GetDefaultScriptType only when content yields NONE. Current Calc importer ignores font-face-decls and exporter emits no declarations,so native ODS font ownership is a concrete UI prerequisite. Actual pinned ICU78.3 source/archive and prior compiled probes exist inside this repository;no network or outside-repo source access is necessary. Avoid reopening unrelated full native constructor/factory chains. Full all-app cadence remains task30then40.

    - Observation: Initial focused-test invocation created an empty app-local evidence directory and failed before execution because its log target was relative to the app cwd.
      Impact: No tests or application behavior ran;no verification claim is based on this attempt.
      Resolution: Removed only the empty directories created by this attempt and use the absolute task evidence path for the corrected focused command.

    - Observation: Native font preservation now uses the actual shared XMLFontAutoStylePool/XMLFontStylesContext with independent Which100/111/116 items. The ODS wrapper reads optional styles.xml declarations before content. Two new package cases plus existing ODS regressions pass19cases2files;root/app typecheck passes. Pinned local ICU78.3 and LibreOffice font/script sources have byte-identity evidence.
      Impact: Real font-family selection can retain represented native metadata through ODS;this does not yet implement the font selector or certify task37 coverage/native script behavior.
      Resolution: Continue the same approved task with exact consumed script/block classification,source selection-script application,shared font UI/native item requests and full declared verification. Do not close task37 or claim whole Calc100 on these focused results.

    - Observation: First script-class typecheck found two boolean-to-number casts introduced while translating the bounded tuple lookup. The generated Unicode data itself retains original pinned arrays and offsets.
      Impact: The first typecheck is failed evidence and does not support an acceptance claim.
      Resolution: Use bounded native tuple indexes without boolean casts,then rerun types and compare scalar properties/classification with scoped original C++ computations before wiring the UI.

    - Observation: The original consumed ICU78.3 scalar scopes and LibreOffice i18nutil scopes compiled after adding the actual uassert.h include. Every codepoint0..0x10ffff matches block,UScript and uncached compatibility editing class. Evidence: evidence/script-native-source-report.json,evidence/native-script-scalars.bin.gz and the checked-in native-script-cases.json replay. The witness explicitly constrains the unused property dispatcher to SCRIPT and does not certify full ICU or UNO services.
      Impact: Script selection uses pinned data rather than host Unicode regexes. Original BreakIteratorImpl initial-NUL cache behavior is retained and tested as source behavior,not claimed as part of the uncached compiled witness.
      Resolution: Complete remaining owner coverage and registration before acceptance.

    - Observation: The real shared SVX selector now emits a complete SvxFontItem. Calc executes CharFontName10007 against actual selected-script Which100/111/116 items,attributes,history and real ODS. The plain-cell browser adapter borrows the actual XBreakIterator script-query producer and source GetStringScriptType loop;the unported native formatted-cell cache and UNO factory are not emulated. Browser rendering reads independent script font items. Actual FontList missing-metric values are retained without guessing native family/pitch;known native symbol-recode names retain SYMBOL charset.
      Impact: Fonts can be selected through the actual Writer component. Scope remains the existing plain-cell display boundary;this is not full device or rich-text layout parity.
      Resolution: Keep the approved task open through full Calc100,complete changed-owner100,fresh browser evidence and canonical inventories.

    - Observation: Writer's previous family path flattened native font values and unrelated attributes through browser projections. Family application,pending items and caret attribute query now use actual SfxItemSet/hints and real automatic-style interning. A new real-shell case verifies all five font fields,unchanged semibold weight,idempotence and undo/redo. Related Writer/shared/font cases pass27cases4files;script replay/run cases pass5cases3files;Calc font UI cases pass4cases1file. Root and app typecheck pass;JSDoc and dependency boundaries pass after adding only exact witnessed header/service-binding imports. These focused results do not establish final coverage.
      Impact: The user's explicit authorization to correct simplified shared/Writer owners has been applied. Initial failed Writer metadata/idempotence tests were corrected at native item query/interning boundaries.
      Resolution: Continue full declared checks. Whole Calc initially ran352cases120files with one outdated resource expectation that the now-implemented family selector stays disabled;the second attempt exposed its additional obsolete empty-value assertion. Neither failed run is acceptance evidence. Correct the expected binding state,run the focused resource case first,and only then rerun whole Calc with coverage.

    - Observation: Complete Calc gate now passes120files353cases at raw statements7768/7768,branches4873/4873,functions1559/1559,lines6967/6967. Evidence: evidence/calc-font-ui-coverage-proof.json and compressed complete raw coverage,plus calc-coverage-native-weak.log. The proof captures hashes for all99covered Calc owners and the changed source/data inputs. Root/app types pass. Source provenance passes after registering bounded owners and the required thints responsibility split. Exact-import tooling tests pass48cases2files. No full all-app suite was run;next full cadence remains task40.
      Impact: The new family selector,independent script painting,ODS font metadata and source selection behavior have a complete Calc gate. Final related complete-owner and browser/quality acceptance is still pending.
      Resolution: Keep task37 DOING. Do not rerun whole Calc without new relevant changes or an invalidated proof.

    - Observation: Coverage exposed a real preexisting common-module defect: i18nlangtag/mslangid.script duplicated css::i18n::ScriptType.WEAK as0 although pinned ScriptType.idl defines4. Native script classification correctly returned4,so the browser neutral-run branch did not execute. The common module now uses the actual generated IDL constants rather than maintaining a duplicate. A literal integer-contract test and a real UI case verify neutral emoji uses the office-language font (including Japanese).
      Impact: This corrects the common source contract under explicit user authorization;the incorrect duplicate was not an intentional Writer/save-policy deviation. Source original mslangid.cxx includes the same ScriptType.hpp. Only its exact module edge is allowed.
      Resolution: Include the changed complete mslangid.script owner and dependent native font-default tests in related coverage. Initial failed coverage runs remain retained,not acceptance evidence.

    - Required follow-up before task closure: Verify interleaving the new full Writer font item with existing font-height,Bold/Italic/Underline/color commands and typing. Inspection shows some other pending-attribute and ranged-format operations still rebuild values through WriterCharacterAttributes browser projections. If these discard native font fields,convert the actual consumed operations to native item-set deltas;do not add a repair cache or a parallel browser attribute model. This is part of the user's explicit instruction to correct simplified common/Writer modules. Also finish complete changed shared/Writer owner100 (including scalar trie and script mapping branches),fresh browser1280/390 evidence,affected inventories/resources,lint/format/docs/build/static,quality review and clean implementation/closure commits. Current raw Calc100 alone does not close the task or the full UI goal.

    - Later implementation progress: Verified that Writer height,Bold/Italic/Underline,foreground/highlight commands still flattened font metadata. Replaced their actual pending/ranged updates with native item deltas in ndhints-font.ts and textsh1.ts;removed the mutating projection-based range rebuild. Real-shell tests now retain all five font fields across these commands and undo/redo. A further real binding case exposed inherited paragraph fonts missing from the displayed family;GetTextNodeCharacterItems now snapshots the actual native inheritance chain and local hints,without a browser font reconstruction. Focused Writer/font checks pass27cases3files.
    - Shared browser extraction: The existing Writer physical/generic font-family rendering implementation now lives in vcl/browser/font-family.ts. Writer's public module forwards to it;Calc uses the same actual fallback behavior. The native font name remains unchanged.
    - Related initial batch:238files11564cases pass. Complete changed non-Calc owner coverage was95.18lines/94.46statements/91branches/94.7functions,so this was not task acceptance. Added existing shell/ASCII/font-family consumers to the related selection and source-native branch cases rather than excluding owners. Current related batch253files is running via run-related-font-coverage.mjs;its log is output/playwright/task37-script-native/related-font-coverage-initial.log and raw output is apps/office/coverage/task37-related/coverage-final.json. Await terminal before edits or acceptance;no source edits while that batch is live.
    - Native branch witness: Original unchanged C++ scopes produce42raw frozen-trie getter/index observations (FAST/SMALL,18-bit groups,8/16/32-bit widths,bounds,and an explicitly malformed-width fallback) plus216script-code switch observations,including composite codes not returned by primary Unicode properties. Evidence native-script-branches.json and checked-in test fixture;focused branch/scalar replay passes4cases2files. The malformed-width case is not a valid binary-constructor or full service claim. Original ICU enum aliases retain their source expressions;only their exact literal-enum lint lines are exempted to preserve the source aliases.
    - Acceptance caution: The earlier Calc100 raw proof is a preserved snapshot. Subsequent source-preserving lint changes to the styles-root callback and shared VCL font rendering changed covered source hashes. Refresh the final Calc proof after the implementation settles. Final complete shared/Writer owner100,browser1280/390/build/static/resources/inventories/style/source/evaluator and clean implementation/closure commits remain pending. Task37 stays DOING and the UI goal remains active. Full all-app cadence remains task40.

    - Related second batch completed:253files11671cases pass;raw coverage rises to S2425/2447,B1410/1445,F466/472,L2231/2249. This remains below the required100and is not acceptance. Evidence related-font-coverage-second.json.gz,related-font-coverage-second.log,related-font-remaining.json. The latter records exact remaining functions/branch locations for focused continuation. No runner remains live. Finish these specific shared/Writer coverage gaps,then final Calc refresh and browser/source/quality checks;do not rerun the broad batch unchanged or declare the task complete.

    - Observation: Final related coverage passes271files/11822cases with raw S2438/B1439/F472/L2240 all100. The complete changed-owner proof passes37 executable owners at S3395/B1925/F642/L3112 all100; the two remaining source owners are an erased partial IDL interface and a pure Writer re-export. Raw gzip evidence is hash-checked and every covered source hash matches the current file.
      Impact: Full native font values survive actual selected/pending Writer items,typing,paste,inheritance and retained history;the unused lossy browser createTextHints path is removed. The last uncovered marked-label manager lookup is tested explicitly at the optional manager boundary. The Writer public wrapper has no declared implementation symbols;shared VCL owns the actual function.
      Resolution: Accepted current Calc proof is evidence/calc-font-styles-proof.json;related proof is evidence/related-font-final-proof.json;complete changed-owner proof is evidence/changed-font-owner-coverage.json. Earlier final and initial Calc snapshots are historical and superseded.

    - Observation: The first fresh browser batch passed18cases but failed the existing native ODS fixture because newly read styles.xml contained recognized office:styles/master-styles scopes. Pinned ScXMLDocContext_Impl explicitly recognizes these tokens. The current bounded importer now diagnoses their unported contents through its existing unsupported-metadata boundary rather than treating them as unknown document structure. An old rejection case now uses the still-unported settings scope;independent styles-stream font declarations coexist with two explicit unsupported-style diagnostics.
      Impact: Existing scalar import no longer regresses when native files contain those style scopes;named/master style application remains unported and is not silently claimed. Fonts from styles.xml still reach actual cell items.
      Resolution: Targeted20ODS cases pass;refreshed whole Calc120files/353cases pass at raw S7771/B4877/F1559/L6970 all100. Fresh production build and all19 serial Chromium Calc cases pass,including actual ODS bytes in page and Worker. Final screenshots at1280/390 were inspected. Initial failure log is retained separately;no retries,timeout changes or test exclusions were introduced.

    - Observation: Root/tools/app types,changed-path ESLint/Prettier,dependencies,JSDoc,size,source-tree/provenance,Calc/Writer resources,scoped Calc/shared/Writer inventories,static build,48 boundary-tooling cases,doctor,routing and diff checks pass. The143non-task paths remain within the approved180-path budget. No network,other checkouts,branch changes or merges were used.
      Impact: The font UI slice is reviewable;full device metrics,formatted-cell caches/UNO factory,rich layout,embedded fonts,named styles and full Writer/Calc parity remain outside the verified slice. Registry parity flags remain unverified. Existing Vite chunk-size and older managed-shim readiness notices remain informational.
      Resolution: Record acceptance and commit only intentional task paths on calc. Continue feasible formatting UI actions;next full all-app regression remains task40 under the user's cadence. Overall UI goal remains active.
id_source: "generated"
---
## Summary

Connect native Calc font-family selection through the actual shared Writer control,script-specific attributes and original ODS font declaration owners. This is task37 toward the active full UI goal;the previous character-format task36 is complete.

## Scope

Core and browser font-family state/application,consumed native script classification/selection,real native font item metadata and ODS font declarations/import/export. Reuse and if necessary correct shared Writer/browser font modules. Include related tests,canonical provenance/runtime/capability/readiness records and task evidence. Up to180non-task paths. Current plain/scalar Calc selection and device-independent rendering remain the active core slice;do not fabricate rich-edit,device font metrics,full UNO services,named cell styles or embedded-font support. Existing primary-save/no-recovery policy remains. Only calc checkout/branch;no network or branch operations.

## Plan

Connect the real shared Writer FontNameSelect and Sfx CharFontName10007 slot to native Calc font items and original selection-script semantics. Preserve source defaults and all represented font family/style/family-enum/pitch/charset metadata;do not apply all scripts indiscriminately. Reuse XMLFontAutoStylePool/XMLFontStylesContext for real ODS font declarations and direct three-script item properties,including styled empty cells and attribute-only history. Correct shared Writer/browser font selection or declaration helpers when needed under the explicit user authorization. Port only actually consumed native ICU78.3 script/block properties and i18nutil/script-selection paths using the existing pinned local sources and original data/algorithms;no guessed Unicode ranges,host-version classification or unrelated full service/constructor programme. Keep shared Writer visual/interaction controls and existing primary-save/no-recovery deviations. Stay exclusively in this calc checkout/branch;no network,new branch,worktree or merge. Budget180non-task paths including canonical registry/source/readiness records. Verify whole Calc and complete changed executable application-owner raw S/B/F/L100 with no new exclusions;related shared/Writer/font/ICU tests and native/source evidence;actual ODS reopen and independent declarations;fresh1280/390browser interaction,types/build/static/style/source/dependency/registry/doctor/routing checks,recorded verification/evaluator and clean commits. Full all-app suite next task40;task37does not run it.

## Verify Steps

Run npm run test:coverage:calc with nonempty raw S/B/F/L100 and complete changed executable application-owner100 without exclusions or weakened thresholds. Exercise actual shared font selector,uniform/mixed state,native script masks for Latin/Asian/Complex/weak/empty/mixed UTF16 input,retained independent font metadata,invalid arguments,failed input,no-op,grouped-sheet/range/full-axis selection,undo/redo and cell CSS. Verify genuine ODS bytes and repeated reopen plus independently authored font-face and three-script property XML;source pool name allocation/declaration order and default/direct item state. Verify consumed ICU property/script logic against pinned local78.3 sources and native evidence where compiled,with explicit source hashes and no host-version regex substitution. Run related Writer/shared/font/ICU tests and source-matched complete owner coverage. Fresh build and real browser cases at1280/390 using the actual Writer control;root/app types,changed-path lint/format,JSDoc,size/source-tree/provenance/dependencies/resources,affected Calc/shared/Writer inventories,static smoke,doctor/routing/diff. Record raw evidence,quality review and clean calc state. Full all-app regression next task40.

## Verification

Command: npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task37-calc-styles --coverage.reporter=json --coverage.reporter=text
Result: pass.
Evidence:120files/353cases;raw S7771/B4877/F1559/L6970 all100;99 Calc owner hashes.
Scope: complete Calc application gate;actual shared font selector,script masks,full font values,history,CSS and real ODS.

Command: node .agentplane/tasks/202610191738-6PMYVV/run-related-font-coverage.mjs
Result: pass.
Evidence:271files/11822cases;raw S2438/B1439/F472/L2240 all100;25 measured non-Calc owners.
Scope: related Writer/shared/native-script/ODF owners. Full changed executable owner coverage37owners S3395/B1925/F642/L3112 all100,source-matched in evidence/changed-font-owner-coverage.json.

Command: npm run typecheck; npm run build; npx playwright test --config apps/office/playwright.config.ts --project calc --workers=1
Result: pass.
Evidence: fresh static build;19 browser cases;inspected1280/390 screenshots;ODS page and Worker pass.
Scope: root/tools/app types,real shared controls,actual browser history and native package import/export.

Command: changed-path ESLint/Prettier; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run check:calc-resources; npm run check:writer-resources; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; node scripts/check-static-build.mjs; npx vitest run scripts/check-font-script-boundaries.test.ts scripts/check-module-boundaries.test.ts; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check
Result: pass.
Evidence: retained accept-check logs,lint/format logs and native compiled evidence;48 boundary-tooling cases pass.
Scope: changed code/contracts/resources/registries/source provenance and local repository health.

Full all-app tests: deferred by explicit user cadence to task40;last full task30. All source-required scoped gates pass. Overall UI delivery remains active;named/master style application,embedded fonts,device metrics and full native service/layout parity are unverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T19:48:00.461Z — VERIFY — ok

By: CODER

Note: Passed: Calc120files353cases raw S/B/F/L100; related271files11822cases raw100; all37 changed executable owners100 with current source hashes; fresh build and19 Chromium Calc cases including ODS page/Worker; inspected1280/390; types,lint,format,source,resources,registries,48 boundary-tooling cases,static,doctor,routing,diff pass. See README Verification and final raw evidence. Full all-app next task40.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T19:47:53.719Z, excerpt_hash=sha256:f42906141669d870ff8de5a486f8e1a3f20bbd4f45259326d8641d27669ccbad

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191738-6PMYVV/blueprint/resolved-snapshot.json
- old_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
- current_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191738-6PMYVV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610191738-6PMYVV
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-19T19:48:50.779Z — VERIFY — ok

By: CODER

Note: verified-202610191738-6PMYVV
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T19:48:00.520Z, excerpt_hash=sha256:f42906141669d870ff8de5a486f8e1a3f20bbd4f45259326d8641d27669ccbad

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191738-6PMYVV/blueprint/resolved-snapshot.json
- old_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
- current_digest: 0dec3b0f44fb7a06bdfdc3e74738827e16ad098a7463f46bf9935f2b0f1894fe
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191738-6PMYVV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610191738-6PMYVV --result verified-202610191738-6PMYVV --commit f8583d20a4af1f5c753b1971a03144a476d7e6be
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation commit using the repository-approved task lifecycle;retain task/raw evidence. Preserve earlier Calc/Writer shared controls and primary ODS behavior. Do not reset the branch or alter unrelated active tasks.

## Findings

Inspection confirms source ScFormatShell uses GetSelectionScriptType for font-family application,while font-height applies all scripts. ScViewFunc falls back to ScGlobal::GetDefaultScriptType only when content yields NONE. Current Calc importer ignores font-face-decls and exporter emits no declarations,so native ODS font ownership is a concrete UI prerequisite. Actual pinned ICU78.3 source/archive and prior compiled probes exist inside this repository;no network or outside-repo source access is necessary. Avoid reopening unrelated full native constructor/factory chains. Full all-app cadence remains task30then40.

- Observation: Initial focused-test invocation created an empty app-local evidence directory and failed before execution because its log target was relative to the app cwd.
  Impact: No tests or application behavior ran;no verification claim is based on this attempt.
  Resolution: Removed only the empty directories created by this attempt and use the absolute task evidence path for the corrected focused command.

- Observation: Native font preservation now uses the actual shared XMLFontAutoStylePool/XMLFontStylesContext with independent Which100/111/116 items. The ODS wrapper reads optional styles.xml declarations before content. Two new package cases plus existing ODS regressions pass19cases2files;root/app typecheck passes. Pinned local ICU78.3 and LibreOffice font/script sources have byte-identity evidence.
  Impact: Real font-family selection can retain represented native metadata through ODS;this does not yet implement the font selector or certify task37 coverage/native script behavior.
  Resolution: Continue the same approved task with exact consumed script/block classification,source selection-script application,shared font UI/native item requests and full declared verification. Do not close task37 or claim whole Calc100 on these focused results.

- Observation: First script-class typecheck found two boolean-to-number casts introduced while translating the bounded tuple lookup. The generated Unicode data itself retains original pinned arrays and offsets.
  Impact: The first typecheck is failed evidence and does not support an acceptance claim.
  Resolution: Use bounded native tuple indexes without boolean casts,then rerun types and compare scalar properties/classification with scoped original C++ computations before wiring the UI.

- Observation: The original consumed ICU78.3 scalar scopes and LibreOffice i18nutil scopes compiled after adding the actual uassert.h include. Every codepoint0..0x10ffff matches block,UScript and uncached compatibility editing class. Evidence: evidence/script-native-source-report.json,evidence/native-script-scalars.bin.gz and the checked-in native-script-cases.json replay. The witness explicitly constrains the unused property dispatcher to SCRIPT and does not certify full ICU or UNO services.
  Impact: Script selection uses pinned data rather than host Unicode regexes. Original BreakIteratorImpl initial-NUL cache behavior is retained and tested as source behavior,not claimed as part of the uncached compiled witness.
  Resolution: Complete remaining owner coverage and registration before acceptance.

- Observation: The real shared SVX selector now emits a complete SvxFontItem. Calc executes CharFontName10007 against actual selected-script Which100/111/116 items,attributes,history and real ODS. The plain-cell browser adapter borrows the actual XBreakIterator script-query producer and source GetStringScriptType loop;the unported native formatted-cell cache and UNO factory are not emulated. Browser rendering reads independent script font items. Actual FontList missing-metric values are retained without guessing native family/pitch;known native symbol-recode names retain SYMBOL charset.
  Impact: Fonts can be selected through the actual Writer component. Scope remains the existing plain-cell display boundary;this is not full device or rich-text layout parity.
  Resolution: Keep the approved task open through full Calc100,complete changed-owner100,fresh browser evidence and canonical inventories.

- Observation: Writer's previous family path flattened native font values and unrelated attributes through browser projections. Family application,pending items and caret attribute query now use actual SfxItemSet/hints and real automatic-style interning. A new real-shell case verifies all five font fields,unchanged semibold weight,idempotence and undo/redo. Related Writer/shared/font cases pass27cases4files;script replay/run cases pass5cases3files;Calc font UI cases pass4cases1file. Root and app typecheck pass;JSDoc and dependency boundaries pass after adding only exact witnessed header/service-binding imports. These focused results do not establish final coverage.
  Impact: The user's explicit authorization to correct simplified shared/Writer owners has been applied. Initial failed Writer metadata/idempotence tests were corrected at native item query/interning boundaries.
  Resolution: Continue full declared checks. Whole Calc initially ran352cases120files with one outdated resource expectation that the now-implemented family selector stays disabled;the second attempt exposed its additional obsolete empty-value assertion. Neither failed run is acceptance evidence. Correct the expected binding state,run the focused resource case first,and only then rerun whole Calc with coverage.

- Observation: Complete Calc gate now passes120files353cases at raw statements7768/7768,branches4873/4873,functions1559/1559,lines6967/6967. Evidence: evidence/calc-font-ui-coverage-proof.json and compressed complete raw coverage,plus calc-coverage-native-weak.log. The proof captures hashes for all99covered Calc owners and the changed source/data inputs. Root/app types pass. Source provenance passes after registering bounded owners and the required thints responsibility split. Exact-import tooling tests pass48cases2files. No full all-app suite was run;next full cadence remains task40.
  Impact: The new family selector,independent script painting,ODS font metadata and source selection behavior have a complete Calc gate. Final related complete-owner and browser/quality acceptance is still pending.
  Resolution: Keep task37 DOING. Do not rerun whole Calc without new relevant changes or an invalidated proof.

- Observation: Coverage exposed a real preexisting common-module defect: i18nlangtag/mslangid.script duplicated css::i18n::ScriptType.WEAK as0 although pinned ScriptType.idl defines4. Native script classification correctly returned4,so the browser neutral-run branch did not execute. The common module now uses the actual generated IDL constants rather than maintaining a duplicate. A literal integer-contract test and a real UI case verify neutral emoji uses the office-language font (including Japanese).
  Impact: This corrects the common source contract under explicit user authorization;the incorrect duplicate was not an intentional Writer/save-policy deviation. Source original mslangid.cxx includes the same ScriptType.hpp. Only its exact module edge is allowed.
  Resolution: Include the changed complete mslangid.script owner and dependent native font-default tests in related coverage. Initial failed coverage runs remain retained,not acceptance evidence.

- Required follow-up before task closure: Verify interleaving the new full Writer font item with existing font-height,Bold/Italic/Underline/color commands and typing. Inspection shows some other pending-attribute and ranged-format operations still rebuild values through WriterCharacterAttributes browser projections. If these discard native font fields,convert the actual consumed operations to native item-set deltas;do not add a repair cache or a parallel browser attribute model. This is part of the user's explicit instruction to correct simplified common/Writer modules. Also finish complete changed shared/Writer owner100 (including scalar trie and script mapping branches),fresh browser1280/390 evidence,affected inventories/resources,lint/format/docs/build/static,quality review and clean implementation/closure commits. Current raw Calc100 alone does not close the task or the full UI goal.

- Later implementation progress: Verified that Writer height,Bold/Italic/Underline,foreground/highlight commands still flattened font metadata. Replaced their actual pending/ranged updates with native item deltas in ndhints-font.ts and textsh1.ts;removed the mutating projection-based range rebuild. Real-shell tests now retain all five font fields across these commands and undo/redo. A further real binding case exposed inherited paragraph fonts missing from the displayed family;GetTextNodeCharacterItems now snapshots the actual native inheritance chain and local hints,without a browser font reconstruction. Focused Writer/font checks pass27cases3files.
- Shared browser extraction: The existing Writer physical/generic font-family rendering implementation now lives in vcl/browser/font-family.ts. Writer's public module forwards to it;Calc uses the same actual fallback behavior. The native font name remains unchanged.
- Related initial batch:238files11564cases pass. Complete changed non-Calc owner coverage was95.18lines/94.46statements/91branches/94.7functions,so this was not task acceptance. Added existing shell/ASCII/font-family consumers to the related selection and source-native branch cases rather than excluding owners. Current related batch253files is running via run-related-font-coverage.mjs;its log is output/playwright/task37-script-native/related-font-coverage-initial.log and raw output is apps/office/coverage/task37-related/coverage-final.json. Await terminal before edits or acceptance;no source edits while that batch is live.
- Native branch witness: Original unchanged C++ scopes produce42raw frozen-trie getter/index observations (FAST/SMALL,18-bit groups,8/16/32-bit widths,bounds,and an explicitly malformed-width fallback) plus216script-code switch observations,including composite codes not returned by primary Unicode properties. Evidence native-script-branches.json and checked-in test fixture;focused branch/scalar replay passes4cases2files. The malformed-width case is not a valid binary-constructor or full service claim. Original ICU enum aliases retain their source expressions;only their exact literal-enum lint lines are exempted to preserve the source aliases.
- Acceptance caution: The earlier Calc100 raw proof is a preserved snapshot. Subsequent source-preserving lint changes to the styles-root callback and shared VCL font rendering changed covered source hashes. Refresh the final Calc proof after the implementation settles. Final complete shared/Writer owner100,browser1280/390/build/static/resources/inventories/style/source/evaluator and clean implementation/closure commits remain pending. Task37 stays DOING and the UI goal remains active. Full all-app cadence remains task40.

- Related second batch completed:253files11671cases pass;raw coverage rises to S2425/2447,B1410/1445,F466/472,L2231/2249. This remains below the required100and is not acceptance. Evidence related-font-coverage-second.json.gz,related-font-coverage-second.log,related-font-remaining.json. The latter records exact remaining functions/branch locations for focused continuation. No runner remains live. Finish these specific shared/Writer coverage gaps,then final Calc refresh and browser/source/quality checks;do not rerun the broad batch unchanged or declare the task complete.

- Observation: Final related coverage passes271files/11822cases with raw S2438/B1439/F472/L2240 all100. The complete changed-owner proof passes37 executable owners at S3395/B1925/F642/L3112 all100; the two remaining source owners are an erased partial IDL interface and a pure Writer re-export. Raw gzip evidence is hash-checked and every covered source hash matches the current file.
  Impact: Full native font values survive actual selected/pending Writer items,typing,paste,inheritance and retained history;the unused lossy browser createTextHints path is removed. The last uncovered marked-label manager lookup is tested explicitly at the optional manager boundary. The Writer public wrapper has no declared implementation symbols;shared VCL owns the actual function.
  Resolution: Accepted current Calc proof is evidence/calc-font-styles-proof.json;related proof is evidence/related-font-final-proof.json;complete changed-owner proof is evidence/changed-font-owner-coverage.json. Earlier final and initial Calc snapshots are historical and superseded.

- Observation: The first fresh browser batch passed18cases but failed the existing native ODS fixture because newly read styles.xml contained recognized office:styles/master-styles scopes. Pinned ScXMLDocContext_Impl explicitly recognizes these tokens. The current bounded importer now diagnoses their unported contents through its existing unsupported-metadata boundary rather than treating them as unknown document structure. An old rejection case now uses the still-unported settings scope;independent styles-stream font declarations coexist with two explicit unsupported-style diagnostics.
  Impact: Existing scalar import no longer regresses when native files contain those style scopes;named/master style application remains unported and is not silently claimed. Fonts from styles.xml still reach actual cell items.
  Resolution: Targeted20ODS cases pass;refreshed whole Calc120files/353cases pass at raw S7771/B4877/F1559/L6970 all100. Fresh production build and all19 serial Chromium Calc cases pass,including actual ODS bytes in page and Worker. Final screenshots at1280/390 were inspected. Initial failure log is retained separately;no retries,timeout changes or test exclusions were introduced.

- Observation: Root/tools/app types,changed-path ESLint/Prettier,dependencies,JSDoc,size,source-tree/provenance,Calc/Writer resources,scoped Calc/shared/Writer inventories,static build,48 boundary-tooling cases,doctor,routing and diff checks pass. The143non-task paths remain within the approved180-path budget. No network,other checkouts,branch changes or merges were used.
  Impact: The font UI slice is reviewable;full device metrics,formatted-cell caches/UNO factory,rich layout,embedded fonts,named styles and full Writer/Calc parity remain outside the verified slice. Registry parity flags remain unverified. Existing Vite chunk-size and older managed-shim readiness notices remain informational.
  Resolution: Record acceptance and commit only intentional task paths on calc. Continue feasible formatting UI actions;next full all-app regression remains task40 under the user's cadence. Overall UI goal remains active.
