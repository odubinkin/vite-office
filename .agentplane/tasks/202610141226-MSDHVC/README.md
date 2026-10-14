---
id: "202610141226-MSDHVC"
title: "Use canonical Tools font enums throughout Writer and shared consumers"
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
  updated_at: "2026-10-14T12:34:05.335Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-14T12:30:18.004Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-14T12:37:05.525Z"
doc_updated_by: "CODER"
description: "Task124: user explicitly authorizes canonical shared/Writer fixes without compatibility crutches. Remove TextItemFontWeight/FontItalic alias bridges, migrate all Writer/shared consumers to original Tools enum owners/member names, update actual inventory and related tests. Calcbranch only; targetedCalc/sharedraw100, Writer-onlycoverage gaps remain untouched, readiness-drivenfull/pause."
sections:
  Summary: "Apply explicit new human instruction: canonical shared and Writer code takes precedence over keeping incorrect implementations working. Remove nonnative TextItem font enum bridges and migrate all consumers to original Tools enum owners/member names. Localcalc only, no merges."
  Scope: |-
    22existing code/test files: sharedTextItem removes FontWeight/FontItalic const/type aliases;3sharedtests remove obsolete bridge expectations/consume canonicalenum;6Writer runtime owners (editor paragraph/XMLimport/txatbase/txtfld/swatrset/styledefaults) and12Writer tests migrate imports and member names. All7changed runtime owner records plus reused Tools enum runtime/provenance (16existingrecords),2freshshared/Writer capabilities and Calc core note. Expected44paths39changed2added. No memory/library/UI/ODFnewarchitecture or I/O/recovery policy changes.

    Typecheck completed consumer scope with apps/office/e2e/native-bullet-font-roundtrip.spec.ts, native-legacy-bullet-symbol.spec.ts and native-numbering-font.spec.ts. Run these three existing Chromium specs against production build; preserve all behavioral assertions.
  Plan: |-
    Use canonical Tools FontWeight/FontItalic and native WEIGHT_/ITALIC_ members directly in Writer/shared consumers; remove legacy bridge entirely, not broaden compatibility types further. Runtime values unchanged; native item/Any/VCL contracts remain task122123implementations. Remove only2bridge-specific consistency assertions now APIdeleted; retain actual nativeenum value/factory/conversion assertions and all Writer behavior tests. Correct current TextItem symbol ownership metadata, preserve historical notes/status/parityflags and actual browser adaptation provenance. Reuse Tools declarations once. Whole Calc strictraw100. One related coverage run across changed shared/Writer owners, CLIaggregate threshold0 only to honor explicit Writer-only coverage exception, independent strict rawS/B/F/L100audit for shared; report Writer rawgaps without repairs, no repo threshold edits/counter manipulation. Run all migrated tests and current tests needed by6changedWriter owners plus native font value tests. Focused12gates/boundaries/exacthash/nativepin/source review/same-agentEVAL/APclose. Full only actualminimum UI+ODSread/save readiness then relevantrepairs/pause.

    Typecheck-discovered completion: migrate3existing e2e consumers and execute their existing browser tests, exact scope44paths rather than41. Same authorized enum owner cleanup; no behavior expansion.
  Verify Steps: |-
    Confirm original Tools enums/member names and Writer/source boundary references, no old TextItem enum exports/imports or .FontWeightNORMAL/.FontItalicNONE usages aftermigration. Typecheck ensures original enum default-parameter inference without alias bridge. Run all15modified shared/Writer test files plus current font/Writer module tests covering importer/format/attribute/default/paragraph consumers; wholeCalcstrict1004source linksabsent/restoredfinally. Related single profile includes actual sharedTextItem/Tools and6Writer owners; use explicit CLI0aggregate thresholds only for user-exempt Writer gaps and enforce sharedrawS/B/F/L100everycounterpositive with independent audit, report Writer owners/gaps and do not repair Writer-only coverage. No persistent threshold/config changes, no assertion/counter weakening. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/boundary/routing/doctor/diff, exact44paths/freshGitbaseline/nativeSHA256pins and actualGitHEAD, same-agentEVAL not independent. CompleteAPfinish cleancalc, no fullsuite now.

    Typecheck completed consumer scope with apps/office/e2e/native-bullet-font-roundtrip.spec.ts, native-legacy-bullet-symbol.spec.ts and native-numbering-font.spec.ts. Run these three existing Chromium specs against production build; preserve all behavioral assertions.
  Verification: |-
    Command: node output/playwright/task124-checks/portable.mjs (initial Calc+related), corrected related-only then browser-only. Result: pass. Evidence: Calc168tests64files33nonemptyowners raw4158S2731B821F3706L100; related957tests17files8owners measured, actual shared2owners194S96B56F179L all raw counters positive; Writer-only gaps retained in writer-coverage-report.json per explicit user exemption. Six existing Chromium cases3specs pass against production build; all4reference symlinks absent for runtime checks and restoredfinally. Scope: sharedTextItem/Tools and6Writer runtime consumers, all15modified tests plus2font/booltests,3migrated browserfixtures. No production/test coverage thresholds modified.

    Command: node output/playwright/task124-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: all12focused gates pass;29boundarytests pass; build pass; allapplication+e2e legacy import/member search empty. Scope: exact44source/registry/docs paths,3651baseline source blobs,9actual native source SHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Initial command/profile/metadata issues and repairs retained Findings/logs.

    Skipped: full application regression. Reason: user explicitly moved next full checkpoint to actual minimumUI+ODSload/save readiness; current cleanup does not satisfy that checkpoint. Risk: broad unrelated application behavior not re-certified. Approval: human readiness/pause instruction. No Writer-only coverage repair. Same-agent evaluator review is not independent. Exact source commit and final clean checkout recorded at closure.
  Rollback Plan: "Revert only task124source commit preserving123/user changes; no reset/merge/external publication."
  Findings: |-
    Task123verifieddone/clean. Human explicitly authorizes canonical Writer corrections and rejects crutches preserving incorrect shared code. Existing alias bridges merely kept old import names/types, but now removed in favor of direct original owner imports rather than further compatibility accommodation. Original enum values/defaults/constructor/factory/copy/Any/VCL behavior remain as verified in122123. Earlier user exception for Writer-only coverage gaps remains active, as does readiness-driven fullregression/repair/pause condition. No subagent delegation.

    Initial related run: all957tests/17files passed, shared2owners194S96B56F179L100. Shared-profile exclusion omitted Writer runtime owners; evidence is retained, rerun with existing all-app vite.config.ts and exact owner includes, no persistent config changes. Calc168tests/64files33owners4158S2731B821F3706L100. Initial typecheck identified3same-enum-consumer imports in existing e2e specs missed by src-only initial search. Extend the already approved consumer migration by3testfiles (within5file budget), retain all browser assertions and run these3existing specs. One shell lint invocation had a quoting parse error before ESLint executed, replace with structured spawn argv. No implementation/test failures observed.

    Initial static12gates:10passed, provenance+registry failed because added local documentation evidence was resolved as upstream by provenance file-boundary loader. Replaced only the added evidence with actual existing shared native-font test source markers; all12gates subsequently passed. No semantic status/history changes. Initial existing-browser command interpreted following filenames as variadic --project values and exited before browser cases; corrected to --project=writer, preserve failed command evidence and rerun browser only, not passing unit/Calc cases. Related remeasurement with existing all-app config passed957tests17files, reports actual2shared+6Writer owners. Writer-only gaps are retained per user exemption.
id_source: "generated"
---
## Summary

Apply explicit new human instruction: canonical shared and Writer code takes precedence over keeping incorrect implementations working. Remove nonnative TextItem font enum bridges and migrate all consumers to original Tools enum owners/member names. Localcalc only, no merges.

## Scope

22existing code/test files: sharedTextItem removes FontWeight/FontItalic const/type aliases;3sharedtests remove obsolete bridge expectations/consume canonicalenum;6Writer runtime owners (editor paragraph/XMLimport/txatbase/txtfld/swatrset/styledefaults) and12Writer tests migrate imports and member names. All7changed runtime owner records plus reused Tools enum runtime/provenance (16existingrecords),2freshshared/Writer capabilities and Calc core note. Expected44paths39changed2added. No memory/library/UI/ODFnewarchitecture or I/O/recovery policy changes.

Typecheck completed consumer scope with apps/office/e2e/native-bullet-font-roundtrip.spec.ts, native-legacy-bullet-symbol.spec.ts and native-numbering-font.spec.ts. Run these three existing Chromium specs against production build; preserve all behavioral assertions.

## Plan

Use canonical Tools FontWeight/FontItalic and native WEIGHT_/ITALIC_ members directly in Writer/shared consumers; remove legacy bridge entirely, not broaden compatibility types further. Runtime values unchanged; native item/Any/VCL contracts remain task122123implementations. Remove only2bridge-specific consistency assertions now APIdeleted; retain actual nativeenum value/factory/conversion assertions and all Writer behavior tests. Correct current TextItem symbol ownership metadata, preserve historical notes/status/parityflags and actual browser adaptation provenance. Reuse Tools declarations once. Whole Calc strictraw100. One related coverage run across changed shared/Writer owners, CLIaggregate threshold0 only to honor explicit Writer-only coverage exception, independent strict rawS/B/F/L100audit for shared; report Writer rawgaps without repairs, no repo threshold edits/counter manipulation. Run all migrated tests and current tests needed by6changedWriter owners plus native font value tests. Focused12gates/boundaries/exacthash/nativepin/source review/same-agentEVAL/APclose. Full only actualminimum UI+ODSread/save readiness then relevantrepairs/pause.

Typecheck-discovered completion: migrate3existing e2e consumers and execute their existing browser tests, exact scope44paths rather than41. Same authorized enum owner cleanup; no behavior expansion.

## Verify Steps

Confirm original Tools enums/member names and Writer/source boundary references, no old TextItem enum exports/imports or .FontWeightNORMAL/.FontItalicNONE usages aftermigration. Typecheck ensures original enum default-parameter inference without alias bridge. Run all15modified shared/Writer test files plus current font/Writer module tests covering importer/format/attribute/default/paragraph consumers; wholeCalcstrict1004source linksabsent/restoredfinally. Related single profile includes actual sharedTextItem/Tools and6Writer owners; use explicit CLI0aggregate thresholds only for user-exempt Writer gaps and enforce sharedrawS/B/F/L100everycounterpositive with independent audit, report Writer owners/gaps and do not repair Writer-only coverage. No persistent threshold/config changes, no assertion/counter weakening. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/boundary/routing/doctor/diff, exact44paths/freshGitbaseline/nativeSHA256pins and actualGitHEAD, same-agentEVAL not independent. CompleteAPfinish cleancalc, no fullsuite now.

Typecheck completed consumer scope with apps/office/e2e/native-bullet-font-roundtrip.spec.ts, native-legacy-bullet-symbol.spec.ts and native-numbering-font.spec.ts. Run these three existing Chromium specs against production build; preserve all behavioral assertions.

## Verification

Command: node output/playwright/task124-checks/portable.mjs (initial Calc+related), corrected related-only then browser-only. Result: pass. Evidence: Calc168tests64files33nonemptyowners raw4158S2731B821F3706L100; related957tests17files8owners measured, actual shared2owners194S96B56F179L all raw counters positive; Writer-only gaps retained in writer-coverage-report.json per explicit user exemption. Six existing Chromium cases3specs pass against production build; all4reference symlinks absent for runtime checks and restoredfinally. Scope: sharedTextItem/Tools and6Writer runtime consumers, all15modified tests plus2font/booltests,3migrated browserfixtures. No production/test coverage thresholds modified.

Command: node output/playwright/task124-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: all12focused gates pass;29boundarytests pass; build pass; allapplication+e2e legacy import/member search empty. Scope: exact44source/registry/docs paths,3651baseline source blobs,9actual native source SHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Initial command/profile/metadata issues and repairs retained Findings/logs.

Skipped: full application regression. Reason: user explicitly moved next full checkpoint to actual minimumUI+ODSload/save readiness; current cleanup does not satisfy that checkpoint. Risk: broad unrelated application behavior not re-certified. Approval: human readiness/pause instruction. No Writer-only coverage repair. Same-agent evaluator review is not independent. Exact source commit and final clean checkout recorded at closure.

## Rollback Plan

Revert only task124source commit preserving123/user changes; no reset/merge/external publication.

## Findings

Task123verifieddone/clean. Human explicitly authorizes canonical Writer corrections and rejects crutches preserving incorrect shared code. Existing alias bridges merely kept old import names/types, but now removed in favor of direct original owner imports rather than further compatibility accommodation. Original enum values/defaults/constructor/factory/copy/Any/VCL behavior remain as verified in122123. Earlier user exception for Writer-only coverage gaps remains active, as does readiness-driven fullregression/repair/pause condition. No subagent delegation.

Initial related run: all957tests/17files passed, shared2owners194S96B56F179L100. Shared-profile exclusion omitted Writer runtime owners; evidence is retained, rerun with existing all-app vite.config.ts and exact owner includes, no persistent config changes. Calc168tests/64files33owners4158S2731B821F3706L100. Initial typecheck identified3same-enum-consumer imports in existing e2e specs missed by src-only initial search. Extend the already approved consumer migration by3testfiles (within5file budget), retain all browser assertions and run these3existing specs. One shell lint invocation had a quoting parse error before ESLint executed, replace with structured spawn argv. No implementation/test failures observed.

Initial static12gates:10passed, provenance+registry failed because added local documentation evidence was resolved as upstream by provenance file-boundary loader. Replaced only the added evidence with actual existing shared native-font test source markers; all12gates subsequently passed. No semantic status/history changes. Initial existing-browser command interpreted following filenames as variadic --project values and exited before browser cases; corrected to --project=writer, preserve failed command evidence and rerun browser only, not passing unit/Calc cases. Related remeasurement with existing all-app config passed957tests17files, reports actual2shared+6Writer owners. Writer-only gaps are retained per user exemption.
