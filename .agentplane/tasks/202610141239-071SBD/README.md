---
id: "202610141239-071SBD"
title: "Port original shared map and field unit conversions for Calc font metrics"
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
doc_updated_at: "2026-10-14T12:40:57.629Z"
doc_updated_by: "CODER"
description: "Complete native MapUnit/FieldUnit owners and five scalar SVTools unit helpers required by shared font-height item; reuse existing o3tl integer/floating conversions, preserve suspicious ControlToItem direction, no document stubs or memory mechanisms."
sections:
  Summary: "Port original Tools MapUnit/FieldUnit and SVTools scalar unit helpers needed by canonical font-height attributes for the real Calc document pool. User goal remains complete Calc; this prerequisite alone is not UI/ODS readiness."
  Scope: "18 intentional source/metadata/docs/tooling paths: new tools/inc/mapunit.ts, tools/inc/fldunit.ts, svtools/inc/unitconv.ts, svtools/source/misc/unitconv.ts and shared native-unitconv.test.ts;8runtime/provenance records,1sharedcapability; calc-core and calc-upstream-suspected-issues docs; module-boundary checker and tests. No Calc or Writer fake model/default provider, no unrelated fixes. Actual svtools->tools/o3tl dependencies only, retain reverse/browser guards. Native pinned source local only; all changes in calc checkout/branch."
  Plan: "Implement all MapUnit/FieldUnit declarations and their complete o3tl mappings including pixel override/defaultinvalid. Implement5native scalar helpers CalcToUnit,CalcToPoint,ItemToControl,ControlToItem,MapToFieldUnit using real existing o3tl integral/floating families. BigInt represents native tools::Long, CalcToUnit number is explicitly float32input before double conversion/std::round away fromzero. Preserve ControlToItem original same-direction delegation; CALC109 documents it without changing behavior. TransformMetric overflow/status overload and UI MetricSpinButton functions remain pending, not stubbed/exported. Independent literal rational matrix/native values/negative halves/invalidunits/pixel overrides distinguish behavior from JS Math.round and plausible inverse. Update original provenance/runtime states with bounded foundation records, no broad native certification. Run strict complete shared raw100 and whole Calc raw100 with4reference links absent/restoredfinally, boundary tests12focusedgates; fresh baseline/sourcehash/nativepins/same-agent EVAL/APfinishclean. No full regression until real minimumUI+same-modelODSread/save readiness then fixes and requested pause."
  Verify Steps: "Compare all enum constants/maps and5functions with pinned original include/tools/mapunit.hxx,fldunit.hxx,include/svtools/unitconv.hxx,svtools/source/misc/unitconv.cxx plus reused o3tl header. New independent literal unit/mapping tables cover all switches/defaults/pixel overrides, signed rounding,float32boundaries, actual ControlToItem same-direction behavior, unknown initializedunitfallback0. npx vitest existing shared coverage config with selected exactshared tests/includes, strict100S/B/F/L eachpositive rawcounter; whole npm run test:coverage:calc strict100.4reference symlinks absent only during testprocesses/restoredfinally.12focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates; moduleboundarytest suite includes nativeSVTools edges and reverse/browser guards. Exact18paths, freshGitbaseline/nativeSHA256pins+actualnativeGitHEAD; same-agent evaluator not independent. No C++ probes/builds/generators/sanitizers or custom memory machinery. Full regression only true minimumUI+ODSread/save readiness checkpoint."
  Verification: "Pending implementation and declared checks; full readiness is not claimed."
  Rollback Plan: "Revert only this task source commit and traceable task records if needed; preserve user/unrelated changes and previous canonical shared owners."
  Findings: "Previous goal turn completed task124 with clean calc state and strict shared/Calc plus related Writer/Chromium checks: progress. This turn preflight clean on calc; original full docpool/font-height sources show metric helpers are actual prerequisites. ControlToItem delegates to ItemToControl without swapping unit semantics; preserve and document CALC109. Native source-level evidence only, no native executable/ABI certificate. Native TransformMetric uses a different checked-overflow o3tl overload not yet implemented, so it remains unexported pending real implementation rather than inventing a substitute. User permits correcting shared/Writer native mismatches without compatibility workarounds; Writer-only coverage exception remains."
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

Pending implementation and declared checks; full readiness is not claimed.

## Rollback Plan

Revert only this task source commit and traceable task records if needed; preserve user/unrelated changes and previous canonical shared owners.

## Findings

Previous goal turn completed task124 with clean calc state and strict shared/Calc plus related Writer/Chromium checks: progress. This turn preflight clean on calc; original full docpool/font-height sources show metric helpers are actual prerequisites. ControlToItem delegates to ItemToControl without swapping unit semantics; preserve and document CALC109. Native source-level evidence only, no native executable/ABI certificate. Native TransformMetric uses a different checked-overflow o3tl overload not yet implemented, so it remains unexported pending real implementation rather than inventing a substitute. User permits correcting shared/Writer native mismatches without compatibility workarounds; Writer-only coverage exception remains.
