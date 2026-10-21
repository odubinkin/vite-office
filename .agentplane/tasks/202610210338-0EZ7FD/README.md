---
id: "202610210338-0EZ7FD"
title: "Implement Writer width kana size and traditional-form transliteration family"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on:
  - "202610210319-37V8XQ"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T03:39:07.960Z"
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
    body: "Start: Execute approved Writer search prerequisite with original width/kana/size/traditional family,string composition/decomposition,actual Sequence offsets and preserved source quirks."
events:
  -
    type: "status"
    at: "2026-10-21T03:39:11.799Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute approved Writer search prerequisite with original width/kana/size/traditional family,string composition/decomposition,actual Sequence offsets and preserved source quirks."
doc_version: 3
doc_updated_at: "2026-10-21T04:02:25.241Z"
doc_updated_by: "CODER"
description: "Continue approved search prerequisites with original widthfolding string composition/decomposition,all six width modules,two kana directions,two size directions,ignore Kana/Width/Size and traditional Kana/Kanji tables. Preserve native offsets,range/scalar quirks and JS memory behavior;do not invent missing service infrastructure."
sections:
  Summary: "Implement the complete width/kana/size/traditional-form logical module family required by Writer search aggregation,including original voiced-mark string operations and native source quirks."
  Scope: "Writer checkout/branch only;maximum54 non-task paths. Extend actual i18nutil widthfolding string operations/declarations;add hiragana/katakana,full/halfwidth with all six variants,small/large,ignore Kana/Width/Size and traditional Kana/Kanji source owners. Add actual tests/browser acceptance,exact import data and conservative source records;document suspected upstream issues. No context/factory mock,service aggregation,unavailable numeric/contextual modules,engine flag/default activation,UI rewrite,network,outside-repo writes or native memory/lifetime infrastructure."
  Plan: "Implement coherent width/kana/size/traditional family within54 non-task paths and source module boundaries. Preserve original offsets/scalar/range/table quirks using real value owners,with native JS memory/lifetime and strict related evidence. Parent service/UI integration remains open;fifth leaf after9BAAAC and stop after next full checkpoint."
  Verify Steps: "Run related transliteration,widthfolding/casefolding,classification/search and Writer search/replace/ring tests with strict100 percent coverage for new logical modules and changed widthfolding functions. Cover every width table variant,Japanese voiced/semi-voiced composition and decomposition,empty/nonzero-start inputs,mutable Sequence COW,surrogate identity,scalar exceptions,range expansion and all kana/size/traditional rows including source quirks. Run actual Chromium production-module acceptance. Run types/static build,changed-file ESLint/Prettier,dependencies/source-provenance/tree/docs/file-size,writer/shared inventories,exact-edge tooling,doctor/routing,diff/status. Retain failed diagnostics without gate/test weakening. This is fifth leaf since9BAAAC;no full suite now. After NEXT full-run checkpoint,necessary fixes/test additions/coverage and final active-task closure,pause goal and start no further task."
  Verification: "Pending implementation and declared targeted verification."
  Rollback Plan: "Revert only this leaf's intentional source/test/metadata commits on writer. Preserve prior completed prerequisites,user I/O/recovery deviations and stop condition. Do not merge branches or edit other worktrees."
  Findings: |-
    Preflight: clean writer checkout/branch;direct parent6B984M is active and prerequisite37V8XQ is completed. Previous goal turn made authoritative progress by implementing/closing that leaf. No subagents,network,external writes,merges or pushes. Pinned local LibreOffice source reading is already authorized. Native JavaScript memory/lifetime remains required;no native allocator/refcount/weak-owner framework is added.

    The aggregate TransliterationImpl source was inspected end-to-end. Its constructor and loaders require actual XComponentContext/service-manager/factory and locale-data contracts absent from this checkout. Do not invent a substitute context/backend to make aggregate tests pass. This coherent prerequisite completes the directional width/kana/size/traditional modules used by that aggregate. Full aggregate registration,remaining contextual/numeric modules,locale/provider/search-item/cursor integration and Find toolbar/dialog remain parent work.

    Actual i18nutil widthfolding now implements original string decomposition/composition loops over unchanged frozen data. Preserve Katakana-only decomposition,repeated absolute expansion offsets,second-unit contraction offsets,combining/spacing marks,JIS VU suppression,empty behavior and actual mutable Sequence getArray/COW/byte stride. JavaScript arrays/typed arrays erase native raw allocation syntax;existing OUString/Sequence value boundaries remain. No native memory or lifecycle infrastructure is recreated.

    All six directional width variants,two directional kana classes,two size classes,three ignore delegates and traditional Kana/Kanji owners follow original source file and class boundaries. Exact source getters,constructors,table masks,names,scalar exceptions and range delegation are preserved. The runtime/provenance records stay foundation/unverified,with no capability/default/semantic-status promotion. Only source-backed exact import data is added to boundary tooling;no checker algorithm/global graph edge/threshold is widened.

    Traditional table extraction initially asserted unique keys and caught three commented-out C++ rows that a draft text regex had included. Before verification,exclude C++ comments and compare the691 active source rows in their exact order;retain the raw table assertion diagnostic rather than interpreting commented data as active source. Independent pinned-source SHA256/BMP output fingerprints cover all65536 input units for31 small2large rows,31 large2small rows and691 traditional Kanji rows. Tests separately distinguish commented U+5B9D mapping from active U+5BF3 mappings.

    WRITER039 preserves the original largeToSmall small-to-large table direction and resulting range collapse. WRITER040 preserves local offsets after half-to-full copying a nonzero-start input. WRITER041 preserves the literalFFFF scalar decomposition-sentinel exception despite string identity. WRITER042 preserves the active traditional Kanji FEFF-to4E9C row. These are source/portable actual-module observations;complete native process differential,factory/consumer reachability or UI defects are not claimed.

    Initial103 related scenarios/12 files pass with strict new-owner/changed-widthfolding S287/287 B88/88 F46/46 L278/278. Current later tests add an actual public empty-width/literalFFFF/expanding-range case without changing production source. Actual Chromium acceptance passes all six variants and kana/size/traditional witnesses using real modules and test-only bundling. Existing source QA mainly covers aggregate service loading;those unavailable service paths are not claimed executed here.

    Initial style validation overlapped a pending formatter and reported only new browser-spec formatting;complete that formatter and rerun unchanged ESLint/Prettier checks after it is terminal. No test/coverage/guard/exclusion/timer weakening is allowed. Final terminal results and formal committed quality review are recorded before closure.

    Cadence: this leaf is fifth completed since9BAAAC when closed. These targeted checks are not a complete all-app run. User requires that after NEXT full run,necessary fixes/test additions/coverage and final active-task closure,the goal is paused immediately and no further task is started. Keep unfinished parent scope honest;do not mark the whole Writer objective complete.

    Expanded30-file run finished373 scenarios:372 passed and exhaustive casefolding-value points hit the unchanged120000ms timeout (actual164609ms). No native value mismatch was reported;total run488.65s. tests-final.log is a failed validation gate and must not be called a pass. All independent jobs are now terminal. The exact same373-scenario/strict-coverage scope is replaying with maxWorkers1;serial-command.json records all arguments. No source,assertion,timeout,coverage threshold,exclusion or skip was changed. Do not verify or finish before this retry is terminal.
id_source: "generated"
---
## Summary

Implement the complete width/kana/size/traditional-form logical module family required by Writer search aggregation,including original voiced-mark string operations and native source quirks.

## Scope

Writer checkout/branch only;maximum54 non-task paths. Extend actual i18nutil widthfolding string operations/declarations;add hiragana/katakana,full/halfwidth with all six variants,small/large,ignore Kana/Width/Size and traditional Kana/Kanji source owners. Add actual tests/browser acceptance,exact import data and conservative source records;document suspected upstream issues. No context/factory mock,service aggregation,unavailable numeric/contextual modules,engine flag/default activation,UI rewrite,network,outside-repo writes or native memory/lifetime infrastructure.

## Plan

Implement coherent width/kana/size/traditional family within54 non-task paths and source module boundaries. Preserve original offsets/scalar/range/table quirks using real value owners,with native JS memory/lifetime and strict related evidence. Parent service/UI integration remains open;fifth leaf after9BAAAC and stop after next full checkpoint.

## Verify Steps

Run related transliteration,widthfolding/casefolding,classification/search and Writer search/replace/ring tests with strict100 percent coverage for new logical modules and changed widthfolding functions. Cover every width table variant,Japanese voiced/semi-voiced composition and decomposition,empty/nonzero-start inputs,mutable Sequence COW,surrogate identity,scalar exceptions,range expansion and all kana/size/traditional rows including source quirks. Run actual Chromium production-module acceptance. Run types/static build,changed-file ESLint/Prettier,dependencies/source-provenance/tree/docs/file-size,writer/shared inventories,exact-edge tooling,doctor/routing,diff/status. Retain failed diagnostics without gate/test weakening. This is fifth leaf since9BAAAC;no full suite now. After NEXT full-run checkpoint,necessary fixes/test additions/coverage and final active-task closure,pause goal and start no further task.

## Verification

Pending implementation and declared targeted verification.

## Rollback Plan

Revert only this leaf's intentional source/test/metadata commits on writer. Preserve prior completed prerequisites,user I/O/recovery deviations and stop condition. Do not merge branches or edit other worktrees.

## Findings

Preflight: clean writer checkout/branch;direct parent6B984M is active and prerequisite37V8XQ is completed. Previous goal turn made authoritative progress by implementing/closing that leaf. No subagents,network,external writes,merges or pushes. Pinned local LibreOffice source reading is already authorized. Native JavaScript memory/lifetime remains required;no native allocator/refcount/weak-owner framework is added.

The aggregate TransliterationImpl source was inspected end-to-end. Its constructor and loaders require actual XComponentContext/service-manager/factory and locale-data contracts absent from this checkout. Do not invent a substitute context/backend to make aggregate tests pass. This coherent prerequisite completes the directional width/kana/size/traditional modules used by that aggregate. Full aggregate registration,remaining contextual/numeric modules,locale/provider/search-item/cursor integration and Find toolbar/dialog remain parent work.

Actual i18nutil widthfolding now implements original string decomposition/composition loops over unchanged frozen data. Preserve Katakana-only decomposition,repeated absolute expansion offsets,second-unit contraction offsets,combining/spacing marks,JIS VU suppression,empty behavior and actual mutable Sequence getArray/COW/byte stride. JavaScript arrays/typed arrays erase native raw allocation syntax;existing OUString/Sequence value boundaries remain. No native memory or lifecycle infrastructure is recreated.

All six directional width variants,two directional kana classes,two size classes,three ignore delegates and traditional Kana/Kanji owners follow original source file and class boundaries. Exact source getters,constructors,table masks,names,scalar exceptions and range delegation are preserved. The runtime/provenance records stay foundation/unverified,with no capability/default/semantic-status promotion. Only source-backed exact import data is added to boundary tooling;no checker algorithm/global graph edge/threshold is widened.

Traditional table extraction initially asserted unique keys and caught three commented-out C++ rows that a draft text regex had included. Before verification,exclude C++ comments and compare the691 active source rows in their exact order;retain the raw table assertion diagnostic rather than interpreting commented data as active source. Independent pinned-source SHA256/BMP output fingerprints cover all65536 input units for31 small2large rows,31 large2small rows and691 traditional Kanji rows. Tests separately distinguish commented U+5B9D mapping from active U+5BF3 mappings.

WRITER039 preserves the original largeToSmall small-to-large table direction and resulting range collapse. WRITER040 preserves local offsets after half-to-full copying a nonzero-start input. WRITER041 preserves the literalFFFF scalar decomposition-sentinel exception despite string identity. WRITER042 preserves the active traditional Kanji FEFF-to4E9C row. These are source/portable actual-module observations;complete native process differential,factory/consumer reachability or UI defects are not claimed.

Initial103 related scenarios/12 files pass with strict new-owner/changed-widthfolding S287/287 B88/88 F46/46 L278/278. Current later tests add an actual public empty-width/literalFFFF/expanding-range case without changing production source. Actual Chromium acceptance passes all six variants and kana/size/traditional witnesses using real modules and test-only bundling. Existing source QA mainly covers aggregate service loading;those unavailable service paths are not claimed executed here.

Initial style validation overlapped a pending formatter and reported only new browser-spec formatting;complete that formatter and rerun unchanged ESLint/Prettier checks after it is terminal. No test/coverage/guard/exclusion/timer weakening is allowed. Final terminal results and formal committed quality review are recorded before closure.

Cadence: this leaf is fifth completed since9BAAAC when closed. These targeted checks are not a complete all-app run. User requires that after NEXT full run,necessary fixes/test additions/coverage and final active-task closure,the goal is paused immediately and no further task is started. Keep unfinished parent scope honest;do not mark the whole Writer objective complete.

Expanded30-file run finished373 scenarios:372 passed and exhaustive casefolding-value points hit the unchanged120000ms timeout (actual164609ms). No native value mismatch was reported;total run488.65s. tests-final.log is a failed validation gate and must not be called a pass. All independent jobs are now terminal. The exact same373-scenario/strict-coverage scope is replaying with maxWorkers1;serial-command.json records all arguments. No source,assertion,timeout,coverage threshold,exclusion or skip was changed. Do not verify or finish before this retry is terminal.
