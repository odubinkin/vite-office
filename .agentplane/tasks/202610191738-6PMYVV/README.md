---
id: "202610191738-6PMYVV"
title: "Connect Calc font-family UI with native script attributes and ODS font declarations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-10-19T18:49:04.277Z"
doc_updated_by: "CODER"
description: "Task37: connect the existing shared Writer font-family widget to real Calc script-specific SvxFontItem attributes,source selection scripts,attribute-only history,cell painting and native ODS declarations. Reuse shared Writer font/ODF owners;correct simplified common selection metadata where required by source. Port only consumed pinned ICU script/block and native script-selection paths needed for this concrete UI action,using existing local ICU78.3 sources/data;no approximate Unicode regex classifier or shadow workbook model. All changes stay in calc checkout/branch with no network or merges."
sections:
  Summary: "Connect native Calc font-family selection through the actual shared Writer control,script-specific attributes and original ODS font declaration owners. This is task37 toward the active full UI goal;the previous character-format task36 is complete."
  Scope: "Core and browser font-family state/application,consumed native script classification/selection,real native font item metadata and ODS font declarations/import/export. Reuse and if necessary correct shared Writer/browser font modules. Include related tests,canonical provenance/runtime/capability/readiness records and task evidence. Up to180non-task paths. Current plain/scalar Calc selection and device-independent rendering remain the active core slice;do not fabricate rich-edit,device font metrics,full UNO services,named cell styles or embedded-font support. Existing primary-save/no-recovery policy remains. Only calc checkout/branch;no network or branch operations."
  Plan: "Connect the real shared Writer FontNameSelect and Sfx CharFontName10007 slot to native Calc font items and original selection-script semantics. Preserve source defaults and all represented font family/style/family-enum/pitch/charset metadata;do not apply all scripts indiscriminately. Reuse XMLFontAutoStylePool/XMLFontStylesContext for real ODS font declarations and direct three-script item properties,including styled empty cells and attribute-only history. Correct shared Writer/browser font selection or declaration helpers when needed under the explicit user authorization. Port only actually consumed native ICU78.3 script/block properties and i18nutil/script-selection paths using the existing pinned local sources and original data/algorithms;no guessed Unicode ranges,host-version classification or unrelated full service/constructor programme. Keep shared Writer visual/interaction controls and existing primary-save/no-recovery deviations. Stay exclusively in this calc checkout/branch;no network,new branch,worktree or merge. Budget180non-task paths including canonical registry/source/readiness records. Verify whole Calc and complete changed executable application-owner raw S/B/F/L100 with no new exclusions;related shared/Writer/font/ICU tests and native/source evidence;actual ODS reopen and independent declarations;fresh1280/390browser interaction,types/build/static/style/source/dependency/registry/doctor/routing checks,recorded verification/evaluator and clean commits. Full all-app suite next task40;task37does not run it."
  Verify Steps: "Run npm run test:coverage:calc with nonempty raw S/B/F/L100 and complete changed executable application-owner100 without exclusions or weakened thresholds. Exercise actual shared font selector,uniform/mixed state,native script masks for Latin/Asian/Complex/weak/empty/mixed UTF16 input,retained independent font metadata,invalid arguments,failed input,no-op,grouped-sheet/range/full-axis selection,undo/redo and cell CSS. Verify genuine ODS bytes and repeated reopen plus independently authored font-face and three-script property XML;source pool name allocation/declaration order and default/direct item state. Verify consumed ICU property/script logic against pinned local78.3 sources and native evidence where compiled,with explicit source hashes and no host-version regex substitution. Run related Writer/shared/font/ICU tests and source-matched complete owner coverage. Fresh build and real browser cases at1280/390 using the actual Writer control;root/app types,changed-path lint/format,JSDoc,size/source-tree/provenance/dependencies/resources,affected Calc/shared/Writer inventories,static smoke,doctor/routing/diff. Record raw evidence,quality review and clean calc state. Full all-app regression next task40."
  Verification: "In progress;task acceptance pending. Whole Calc passes120files353cases with nonempty raw S/B/F/L100:7768statements,4873branches,1559functions,6967lines across99covered owners. Exact source hashes and compressed raw evidence are retained in evidence/calc-font-ui-coverage-proof.json. The source-native block/script/uncached editing-class replay matches all1114112Unicode codepoints;its constrained dispatcher/bootstrap and service limitations are explicit. Root/app types pass;focused actual Writer/font/script/UI cases pass;exact-boundary tooling passes48cases2files. Final related complete changed-owner100,interleaved Writer metadata behavior,browser/build/static/resource/inventory/style/source checks and evaluator/clean commits remain required. No broad native/full UI parity or completed goal is claimed. Full all-app run next task40."
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

In progress;task acceptance pending. Whole Calc passes120files353cases with nonempty raw S/B/F/L100:7768statements,4873branches,1559functions,6967lines across99covered owners. Exact source hashes and compressed raw evidence are retained in evidence/calc-font-ui-coverage-proof.json. The source-native block/script/uncached editing-class replay matches all1114112Unicode codepoints;its constrained dispatcher/bootstrap and service limitations are explicit. Root/app types pass;focused actual Writer/font/script/UI cases pass;exact-boundary tooling passes48cases2files. Final related complete changed-owner100,interleaved Writer metadata behavior,browser/build/static/resource/inventory/style/source checks and evaluator/clean commits remain required. No broad native/full UI parity or completed goal is claimed. Full all-app run next task40.

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
