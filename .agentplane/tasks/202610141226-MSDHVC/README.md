---
id: "202610141226-MSDHVC"
title: "Use canonical Tools font enums throughout Writer and shared consumers"
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
  updated_at: "2026-10-14T12:27:57.921Z"
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
doc_updated_at: "2026-10-14T12:30:18.004Z"
doc_updated_by: "CODER"
description: "Task124: user explicitly authorizes canonical shared/Writer fixes without compatibility crutches. Remove TextItemFontWeight/FontItalic alias bridges, migrate all Writer/shared consumers to original Tools enum owners/member names, update actual inventory and related tests. Calcbranch only; targetedCalc/sharedraw100, Writer-onlycoverage gaps remain untouched, readiness-drivenfull/pause."
sections:
  Summary: "Apply explicit new human instruction: canonical shared and Writer code takes precedence over keeping incorrect implementations working. Remove nonnative TextItem font enum bridges and migrate all consumers to original Tools enum owners/member names. Localcalc only, no merges."
  Scope: "22existing code/test files: sharedTextItem removes FontWeight/FontItalic const/type aliases;3sharedtests remove obsolete bridge expectations/consume canonicalenum;6Writer runtime owners (editor paragraph/XMLimport/txatbase/txtfld/swatrset/styledefaults) and12Writer tests migrate imports and member names. All7changed runtime owner records plus reused Tools enum runtime/provenance (16existingrecords),2freshshared/Writer capabilities and Calc core note. Expected41paths39changed2added. No memory/library/UI/ODFnewarchitecture or I/O/recovery policy changes."
  Plan: "Use canonical Tools FontWeight/FontItalic and native WEIGHT_/ITALIC_ members directly in Writer/shared consumers; remove legacy bridge entirely, not broaden compatibility types further. Runtime values unchanged; native item/Any/VCL contracts remain task122123implementations. Remove only2bridge-specific consistency assertions now APIdeleted; retain actual nativeenum value/factory/conversion assertions and all Writer behavior tests. Correct current TextItem symbol ownership metadata, preserve historical notes/status/parityflags and actual browser adaptation provenance. Reuse Tools declarations once. Whole Calc strictraw100. One related coverage run across changed shared/Writer owners, CLIaggregate threshold0 only to honor explicit Writer-only coverage exception, independent strict rawS/B/F/L100audit for shared; report Writer rawgaps without repairs, no repo threshold edits/counter manipulation. Run all migrated tests and current tests needed by6changedWriter owners plus native font value tests. Focused12gates/boundaries/exacthash/nativepin/source review/same-agentEVAL/APclose. Full only actualminimum UI+ODSread/save readiness then relevantrepairs/pause."
  Verify Steps: "Confirm original Tools enums/member names and Writer/source boundary references, no old TextItem enum exports/imports or .FontWeightNORMAL/.FontItalicNONE usages aftermigration. Typecheck ensures original enum default-parameter inference without alias bridge. Run all15modified shared/Writer test files plus current font/Writer module tests covering importer/format/attribute/default/paragraph consumers; wholeCalcstrict1004source linksabsent/restoredfinally. Related single profile includes actual sharedTextItem/Tools and6Writer owners; use explicit CLI0aggregate thresholds only for user-exempt Writer gaps and enforce sharedrawS/B/F/L100everycounterpositive with independent audit, report Writer owners/gaps and do not repair Writer-only coverage. No persistent threshold/config changes, no assertion/counter weakening. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/boundary/routing/doctor/diff, exact41paths/freshGitbaseline/nativeSHA256pins and actualGitHEAD, same-agentEVAL not independent. CompleteAPfinish cleancalc, no fullsuite now."
  Verification: "Pending canonical import migration and focused checks."
  Rollback Plan: "Revert only task124source commit preserving123/user changes; no reset/merge/external publication."
  Findings: "Task123verifieddone/clean. Human explicitly authorizes canonical Writer corrections and rejects crutches preserving incorrect shared code. Existing alias bridges merely kept old import names/types, but now removed in favor of direct original owner imports rather than further compatibility accommodation. Original enum values/defaults/constructor/factory/copy/Any/VCL behavior remain as verified in122123. Earlier user exception for Writer-only coverage gaps remains active, as does readiness-driven fullregression/repair/pause condition. No subagent delegation."
id_source: "generated"
---
## Summary

Apply explicit new human instruction: canonical shared and Writer code takes precedence over keeping incorrect implementations working. Remove nonnative TextItem font enum bridges and migrate all consumers to original Tools enum owners/member names. Localcalc only, no merges.

## Scope

22existing code/test files: sharedTextItem removes FontWeight/FontItalic const/type aliases;3sharedtests remove obsolete bridge expectations/consume canonicalenum;6Writer runtime owners (editor paragraph/XMLimport/txatbase/txtfld/swatrset/styledefaults) and12Writer tests migrate imports and member names. All7changed runtime owner records plus reused Tools enum runtime/provenance (16existingrecords),2freshshared/Writer capabilities and Calc core note. Expected41paths39changed2added. No memory/library/UI/ODFnewarchitecture or I/O/recovery policy changes.

## Plan

Use canonical Tools FontWeight/FontItalic and native WEIGHT_/ITALIC_ members directly in Writer/shared consumers; remove legacy bridge entirely, not broaden compatibility types further. Runtime values unchanged; native item/Any/VCL contracts remain task122123implementations. Remove only2bridge-specific consistency assertions now APIdeleted; retain actual nativeenum value/factory/conversion assertions and all Writer behavior tests. Correct current TextItem symbol ownership metadata, preserve historical notes/status/parityflags and actual browser adaptation provenance. Reuse Tools declarations once. Whole Calc strictraw100. One related coverage run across changed shared/Writer owners, CLIaggregate threshold0 only to honor explicit Writer-only coverage exception, independent strict rawS/B/F/L100audit for shared; report Writer rawgaps without repairs, no repo threshold edits/counter manipulation. Run all migrated tests and current tests needed by6changedWriter owners plus native font value tests. Focused12gates/boundaries/exacthash/nativepin/source review/same-agentEVAL/APclose. Full only actualminimum UI+ODSread/save readiness then relevantrepairs/pause.

## Verify Steps

Confirm original Tools enums/member names and Writer/source boundary references, no old TextItem enum exports/imports or .FontWeightNORMAL/.FontItalicNONE usages aftermigration. Typecheck ensures original enum default-parameter inference without alias bridge. Run all15modified shared/Writer test files plus current font/Writer module tests covering importer/format/attribute/default/paragraph consumers; wholeCalcstrict1004source linksabsent/restoredfinally. Related single profile includes actual sharedTextItem/Tools and6Writer owners; use explicit CLI0aggregate thresholds only for user-exempt Writer gaps and enforce sharedrawS/B/F/L100everycounterpositive with independent audit, report Writer owners/gaps and do not repair Writer-only coverage. No persistent threshold/config changes, no assertion/counter weakening. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/boundary/routing/doctor/diff, exact41paths/freshGitbaseline/nativeSHA256pins and actualGitHEAD, same-agentEVAL not independent. CompleteAPfinish cleancalc, no fullsuite now.

## Verification

Pending canonical import migration and focused checks.

## Rollback Plan

Revert only task124source commit preserving123/user changes; no reset/merge/external publication.

## Findings

Task123verifieddone/clean. Human explicitly authorizes canonical Writer corrections and rejects crutches preserving incorrect shared code. Existing alias bridges merely kept old import names/types, but now removed in favor of direct original owner imports rather than further compatibility accommodation. Original enum values/defaults/constructor/factory/copy/Any/VCL behavior remain as verified in122123. Earlier user exception for Writer-only coverage gaps remains active, as does readiness-driven fullregression/repair/pause condition. No subagent delegation.
