---
id: "202610141239-071SBD"
title: "Port original shared map and field unit conversions for Calc font metrics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T12:40:46.804Z"
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
    body: "Start: implement original shared metric units and scalar helpers for canonical Calc font height dependency."
events:
  -
    type: "status"
    at: "2026-10-14T12:40:57.629Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original shared metric units and scalar helpers for canonical Calc font height dependency."
doc_version: 3
doc_updated_at: "2026-10-14T12:47:42.730Z"
doc_updated_by: "CODER"
description: "Complete native MapUnit/FieldUnit owners and five scalar SVTools unit helpers required by shared font-height item; reuse existing o3tl integer/floating conversions, preserve suspicious ControlToItem direction, no document stubs or memory mechanisms."
sections:
  Summary: "Port original Tools MapUnit/FieldUnit and SVTools scalar unit helpers needed by canonical font-height attributes for the real Calc document pool. User goal remains complete Calc; this prerequisite alone is not UI/ODS readiness."
  Scope: "18 intentional source/metadata/docs/tooling paths: new tools/inc/mapunit.ts, tools/inc/fldunit.ts, svtools/inc/unitconv.ts, svtools/source/misc/unitconv.ts and shared native-unitconv.test.ts;8runtime/provenance records,1sharedcapability; calc-core and calc-upstream-suspected-issues docs; module-boundary checker and tests. No Calc or Writer fake model/default provider, no unrelated fixes. Actual svtools->tools/o3tl dependencies only, retain reverse/browser guards. Native pinned source local only; all changes in calc checkout/branch."
  Plan: "Implement all MapUnit/FieldUnit declarations and their complete o3tl mappings including pixel override/defaultinvalid. Implement5native scalar helpers CalcToUnit,CalcToPoint,ItemToControl,ControlToItem,MapToFieldUnit using real existing o3tl integral/floating families. BigInt represents native tools::Long, CalcToUnit number is explicitly float32input before double conversion/std::round away fromzero. Preserve ControlToItem original same-direction delegation; CALC109 documents it without changing behavior. TransformMetric overflow/status overload and UI MetricSpinButton functions remain pending, not stubbed/exported. Independent literal rational matrix/native values/negative halves/invalidunits/pixel overrides distinguish behavior from JS Math.round and plausible inverse. Update original provenance/runtime states with bounded foundation records, no broad native certification. Run strict complete shared raw100 and whole Calc raw100 with4reference links absent/restoredfinally, boundary tests12focusedgates; fresh baseline/sourcehash/nativepins/same-agent EVAL/APfinishclean. No full regression until real minimumUI+same-modelODSread/save readiness then fixes and requested pause."
  Verify Steps: "Compare all enum constants/maps and5functions with pinned original include/tools/mapunit.hxx,fldunit.hxx,include/svtools/unitconv.hxx,svtools/source/misc/unitconv.cxx plus reused o3tl header. New independent literal unit/mapping tables cover all switches/defaults/pixel overrides, signed rounding,float32boundaries, actual ControlToItem same-direction behavior, unknown initializedunitfallback0. npx vitest existing shared coverage config with selected exactshared tests/includes, strict100S/B/F/L eachpositive rawcounter; whole npm run test:coverage:calc strict100.4reference symlinks absent only during testprocesses/restoredfinally.12focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates; moduleboundarytest suite includes nativeSVTools edges and reverse/browser guards. Exact18paths, freshGitbaseline/nativeSHA256pins+actualnativeGitHEAD; same-agent evaluator not independent. No C++ probes/builds/generators/sanitizers or custom memory machinery. Full regression only true minimumUI+ODSread/save readiness checkpoint."
  Verification: |-
    Command: node output/playwright/task125-checks/portable.mjs. Result: pass. Evidence: new4metric matrix tests+existing3o3tl tests7/2files pass;4nonemptysharedowners152S70B18F143L all100everyrawcounterpositive. Calc168/64files33owners4158S2731B821F3706L100. All4reference links absent for tests/restoredfinally. Scope: original Tools complete mappings and5SVTools scalar functions, reused full o3tl owner; no source-map/counter/threshold edits.

    Command: node output/playwright/task125-checks/gates.mjs plus exact metadata-only npm run inventory:parity repair recheck; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: all12gates final pass;30boundarytests pass. Initial lint/docs/registry failures and narrow repairs retained Findings/logs. Scope: exact18paths4existing14new,3653baseline source blobs,10native source/docs/QA SHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Header borrows source declarations; no duplicate declaration ownership. Native QA evidence only reused o3tl rational rounding, helpers have independent source-derived literal matrices, not a full native certificate.

    Skipped: full application regression and browser suites. Reason: no browser/Writer runtime changed; user moved next full to actualminimumUI+same-modelODS readiness, not reached by this prerequisite. Risk: complete application/native parity not recertified. Approval: explicit human readiness/pause and related-test instructions. Same-agent evaluator phase is not independent. Exact source commit and clean calc checkout recorded at closure.
  Rollback Plan: "Revert only this task source commit and traceable task records if needed; preserve user/unrelated changes and previous canonical shared owners."
  Findings: |-
    Previous goal turn completed task124 with clean calc state and strict shared/Calc plus related Writer/Chromium checks: progress. This turn preflight clean on calc; original full docpool/font-height sources show metric helpers are actual prerequisites. ControlToItem delegates to ItemToControl without swapping unit semantics; preserve and document CALC109. Native source-level evidence only, no native executable/ABI certificate. Native TransformMetric uses a different checked-overflow o3tl overload not yet implemented, so it remains unexported pending real implementation rather than inventing a substitute. User permits correcting shared/Writer native mismatches without compatibility workarounds; Writer-only coverage exception remains.

    Initial static12gates9passed: literal-enum rule rejects LAST=MapRelative expression, replace with original numeric13 preserving aliases/value; new4Array.from callbacks require JSDoc, add descriptions only. Capability schema requires upstream docs/nonemptytests; use actual svtoolsREADME and reused o3tl rational rounding QA, explicitly documenting no direct named helper QA found in targeted svtools/tools/o3tl search and no full native certificate. Raw native sources, original9passedgates and3failures retained.

    Second static pass11/12pass; registry identified that canonical unitconv header only reexports, so it must not claim own function declarations in runtime localSymbols. Correct that new header metadata to empty declaration ownership, retaining actual source owner/native symbols/provenance; no checker suppression or status promotion.
id_source: "generated"
---
## Summary

Port original Tools MapUnit/FieldUnit and SVTools scalar unit helpers needed by canonical font-height attributes for the real Calc document pool. User goal remains complete Calc; this prerequisite alone is not UI/ODS readiness.

## Scope

18 intentional source/metadata/docs/tooling paths: new tools/inc/mapunit.ts, tools/inc/fldunit.ts, svtools/inc/unitconv.ts, svtools/source/misc/unitconv.ts and shared native-unitconv.test.ts;8runtime/provenance records,1sharedcapability; calc-core and calc-upstream-suspected-issues docs; module-boundary checker and tests. No Calc or Writer fake model/default provider, no unrelated fixes. Actual svtools->tools/o3tl dependencies only, retain reverse/browser guards. Native pinned source local only; all changes in calc checkout/branch.

## Plan

Implement all MapUnit/FieldUnit declarations and their complete o3tl mappings including pixel override/defaultinvalid. Implement5native scalar helpers CalcToUnit,CalcToPoint,ItemToControl,ControlToItem,MapToFieldUnit using real existing o3tl integral/floating families. BigInt represents native tools::Long, CalcToUnit number is explicitly float32input before double conversion/std::round away fromzero. Preserve ControlToItem original same-direction delegation; CALC109 documents it without changing behavior. TransformMetric overflow/status overload and UI MetricSpinButton functions remain pending, not stubbed/exported. Independent literal rational matrix/native values/negative halves/invalidunits/pixel overrides distinguish behavior from JS Math.round and plausible inverse. Update original provenance/runtime states with bounded foundation records, no broad native certification. Run strict complete shared raw100 and whole Calc raw100 with4reference links absent/restoredfinally, boundary tests12focusedgates; fresh baseline/sourcehash/nativepins/same-agent EVAL/APfinishclean. No full regression until real minimumUI+same-modelODSread/save readiness then fixes and requested pause.

## Verify Steps

Compare all enum constants/maps and5functions with pinned original include/tools/mapunit.hxx,fldunit.hxx,include/svtools/unitconv.hxx,svtools/source/misc/unitconv.cxx plus reused o3tl header. New independent literal unit/mapping tables cover all switches/defaults/pixel overrides, signed rounding,float32boundaries, actual ControlToItem same-direction behavior, unknown initializedunitfallback0. npx vitest existing shared coverage config with selected exactshared tests/includes, strict100S/B/F/L eachpositive rawcounter; whole npm run test:coverage:calc strict100.4reference symlinks absent only during testprocesses/restoredfinally.12focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates; moduleboundarytest suite includes nativeSVTools edges and reverse/browser guards. Exact18paths, freshGitbaseline/nativeSHA256pins+actualnativeGitHEAD; same-agent evaluator not independent. No C++ probes/builds/generators/sanitizers or custom memory machinery. Full regression only true minimumUI+ODSread/save readiness checkpoint.

## Verification

Command: node output/playwright/task125-checks/portable.mjs. Result: pass. Evidence: new4metric matrix tests+existing3o3tl tests7/2files pass;4nonemptysharedowners152S70B18F143L all100everyrawcounterpositive. Calc168/64files33owners4158S2731B821F3706L100. All4reference links absent for tests/restoredfinally. Scope: original Tools complete mappings and5SVTools scalar functions, reused full o3tl owner; no source-map/counter/threshold edits.

Command: node output/playwright/task125-checks/gates.mjs plus exact metadata-only npm run inventory:parity repair recheck; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: all12gates final pass;30boundarytests pass. Initial lint/docs/registry failures and narrow repairs retained Findings/logs. Scope: exact18paths4existing14new,3653baseline source blobs,10native source/docs/QA SHA256pins at9bc445578031fecf56086729d8e4940c77e14d65. Header borrows source declarations; no duplicate declaration ownership. Native QA evidence only reused o3tl rational rounding, helpers have independent source-derived literal matrices, not a full native certificate.

Skipped: full application regression and browser suites. Reason: no browser/Writer runtime changed; user moved next full to actualminimumUI+same-modelODS readiness, not reached by this prerequisite. Risk: complete application/native parity not recertified. Approval: explicit human readiness/pause and related-test instructions. Same-agent evaluator phase is not independent. Exact source commit and clean calc checkout recorded at closure.

## Rollback Plan

Revert only this task source commit and traceable task records if needed; preserve user/unrelated changes and previous canonical shared owners.

## Findings

Previous goal turn completed task124 with clean calc state and strict shared/Calc plus related Writer/Chromium checks: progress. This turn preflight clean on calc; original full docpool/font-height sources show metric helpers are actual prerequisites. ControlToItem delegates to ItemToControl without swapping unit semantics; preserve and document CALC109. Native source-level evidence only, no native executable/ABI certificate. Native TransformMetric uses a different checked-overflow o3tl overload not yet implemented, so it remains unexported pending real implementation rather than inventing a substitute. User permits correcting shared/Writer native mismatches without compatibility workarounds; Writer-only coverage exception remains.

Initial static12gates9passed: literal-enum rule rejects LAST=MapRelative expression, replace with original numeric13 preserving aliases/value; new4Array.from callbacks require JSDoc, add descriptions only. Capability schema requires upstream docs/nonemptytests; use actual svtoolsREADME and reused o3tl rational rounding QA, explicitly documenting no direct named helper QA found in targeted svtools/tools/o3tl search and no full native certificate. Raw native sources, original9passedgates and3failures retained.

Second static pass11/12pass; registry identified that canonical unitconv header only reexports, so it must not claim own function declarations in runtime localSymbols. Correct that new header metadata to empty declaration ownership, retaining actual source owner/native symbols/provenance; no checker suppression or status promotion.
