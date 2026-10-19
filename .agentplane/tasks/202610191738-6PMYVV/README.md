---
id: "202610191738-6PMYVV"
title: "Connect Calc font-family UI with native script attributes and ODS font declarations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-19T17:55:11.036Z"
doc_updated_by: "CODER"
description: "Task37: connect the existing shared Writer font-family widget to real Calc script-specific SvxFontItem attributes,source selection scripts,attribute-only history,cell painting and native ODS declarations. Reuse shared Writer font/ODF owners;correct simplified common selection metadata where required by source. Port only consumed pinned ICU script/block and native script-selection paths needed for this concrete UI action,using existing local ICU78.3 sources/data;no approximate Unicode regex classifier or shadow workbook model. All changes stay in calc checkout/branch with no network or merges."
sections:
  Summary: "Connect native Calc font-family selection through the actual shared Writer control,script-specific attributes and original ODS font declaration owners. This is task37 toward the active full UI goal;the previous character-format task36 is complete."
  Scope: "Core and browser font-family state/application,consumed native script classification/selection,real native font item metadata and ODS font declarations/import/export. Reuse and if necessary correct shared Writer/browser font modules. Include related tests,canonical provenance/runtime/capability/readiness records and task evidence. Up to180non-task paths. Current plain/scalar Calc selection and device-independent rendering remain the active core slice;do not fabricate rich-edit,device font metrics,full UNO services,named cell styles or embedded-font support. Existing primary-save/no-recovery policy remains. Only calc checkout/branch;no network or branch operations."
  Plan: "Connect the real shared Writer FontNameSelect and Sfx CharFontName10007 slot to native Calc font items and original selection-script semantics. Preserve source defaults and all represented font family/style/family-enum/pitch/charset metadata;do not apply all scripts indiscriminately. Reuse XMLFontAutoStylePool/XMLFontStylesContext for real ODS font declarations and direct three-script item properties,including styled empty cells and attribute-only history. Correct shared Writer/browser font selection or declaration helpers when needed under the explicit user authorization. Port only actually consumed native ICU78.3 script/block properties and i18nutil/script-selection paths using the existing pinned local sources and original data/algorithms;no guessed Unicode ranges,host-version classification or unrelated full service/constructor programme. Keep shared Writer visual/interaction controls and existing primary-save/no-recovery deviations. Stay exclusively in this calc checkout/branch;no network,new branch,worktree or merge. Budget180non-task paths including canonical registry/source/readiness records. Verify whole Calc and complete changed executable application-owner raw S/B/F/L100 with no new exclusions;related shared/Writer/font/ICU tests and native/source evidence;actual ODS reopen and independent declarations;fresh1280/390browser interaction,types/build/static/style/source/dependency/registry/doctor/routing checks,recorded verification/evaluator and clean commits. Full all-app suite next task40;task37does not run it."
  Verify Steps: "Run npm run test:coverage:calc with nonempty raw S/B/F/L100 and complete changed executable application-owner100 without exclusions or weakened thresholds. Exercise actual shared font selector,uniform/mixed state,native script masks for Latin/Asian/Complex/weak/empty/mixed UTF16 input,retained independent font metadata,invalid arguments,failed input,no-op,grouped-sheet/range/full-axis selection,undo/redo and cell CSS. Verify genuine ODS bytes and repeated reopen plus independently authored font-face and three-script property XML;source pool name allocation/declaration order and default/direct item state. Verify consumed ICU property/script logic against pinned local78.3 sources and native evidence where compiled,with explicit source hashes and no host-version regex substitution. Run related Writer/shared/font/ICU tests and source-matched complete owner coverage. Fresh build and real browser cases at1280/390 using the actual Writer control;root/app types,changed-path lint/format,JSDoc,size/source-tree/provenance/dependencies/resources,affected Calc/shared/Writer inventories,static smoke,doctor/routing/diff. Record raw evidence,quality review and clean calc state. Full all-app regression next task40."
  Verification: "Pending;no implementation or verification claim yet. Baseline calc worktree is clean after task36. The previous goal turn was verified progress: native character controls,shared ODF values and actual Worker color transport were committed and task36closed. This task continues the original full UI objective rather than declaring the goal complete."
  Rollback Plan: "Revert only the task implementation commit using the repository-approved task lifecycle;retain task/raw evidence. Preserve earlier Calc/Writer shared controls and primary ODS behavior. Do not reset the branch or alter unrelated active tasks."
  Findings: |-
    Inspection confirms source ScFormatShell uses GetSelectionScriptType for font-family application,while font-height applies all scripts. ScViewFunc falls back to ScGlobal::GetDefaultScriptType only when content yields NONE. Current Calc importer ignores font-face-decls and exporter emits no declarations,so native ODS font ownership is a concrete UI prerequisite. Actual pinned ICU78.3 source/archive and prior compiled probes exist inside this repository;no network or outside-repo source access is necessary. Avoid reopening unrelated full native constructor/factory chains. Full all-app cadence remains task30then40.

    - Observation: Initial focused-test invocation created an empty app-local evidence directory and failed before execution because its log target was relative to the app cwd.
      Impact: No tests or application behavior ran;no verification claim is based on this attempt.
      Resolution: Removed only the empty directories created by this attempt and use the absolute task evidence path for the corrected focused command.

    - Observation: Native font preservation now uses the actual shared XMLFontAutoStylePool/XMLFontStylesContext with independent Which100/111/116 items. The ODS wrapper reads optional styles.xml declarations before content. Two new package cases plus existing ODS regressions pass19cases2files;root/app typecheck passes. Pinned local ICU78.3 and LibreOffice font/script sources have byte-identity evidence.
      Impact: Real font-family selection can retain represented native metadata through ODS;this does not yet implement the font selector or certify task37 coverage/native script behavior.
      Resolution: Continue the same approved task with exact consumed script/block classification,source selection-script application,shared font UI/native item requests and full declared verification. Do not close task37 or claim whole Calc100 on these focused results.
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

Pending;no implementation or verification claim yet. Baseline calc worktree is clean after task36. The previous goal turn was verified progress: native character controls,shared ODF values and actual Worker color transport were committed and task36closed. This task continues the original full UI objective rather than declaring the goal complete.

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
