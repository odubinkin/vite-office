---
id: "202610141137-12HE23"
title: "Share native font contour shadow word-line and relief values for Calc"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T11:37:52.113Z"
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
    body: "Start: port4native shared font value classes with real bool enum Any and Calc defaults; targeted100 and readiness-driven full regression checkpoint."
events:
  -
    type: "status"
    at: "2026-10-14T11:38:05.404Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port4native shared font value classes with real bool enum Any and Calc defaults; targeted100 and readiness-driven full regression checkpoint."
doc_version: 3
doc_updated_at: "2026-10-14T11:42:58.029Z"
doc_updated_by: "CODER"
description: "Task120:4real EditEng font attribute values, canonical headers/VCL FontRelief/memberid and Calc107108123124defaults. Shared SVL/Any reuse. Targeted raw100 only; full checkpoint at actual minimal UI+ODS readiness then repair/pause."
sections:
  Summary: "Implement4missing shared native font property values needed by Calc document defaults/UI and ODS, preserving shared Writer owners. User continued goal authorizes safe local implementation oncalc, no merges."
  Scope: "Existing EditEng textitem gains SvxContourItem/SvxShadowedItem/SvxWordLineModeItem/SvxCharReliefItem;4canonical headers; VCL fntstyle FontRelief enum; existing memberids MID_RELIEF and scitems107108123124. Two focused tests plus existing complete textitem/native bool/enum and Writer consumers. Runtime/provenance/capabilities and Calc docs. No localized presentation/native instance managers/memory ABI/provider/document scope."
  Plan: "Port original bool payload/Which order, factories/copy/Clone using actual SfxBoolItem; relief actual SfxEnumItem<FontRelief> constructor/factory/copy/Clone and native short member0 transport. Member narrowedu8 and CONVERT_TWIPS stripped; typed Any signed16 extraction followed0..2check; wrong/unknown false unchanged. Scalar query retains existing inherited numeric projection. Calc defaultsfalse/false/false/NONE through real itemsetcopies. Keep original header/core responsibility and existing metadata histories/status. Verify exact native sources, targeted raw100,focusedgates/exactsource hashes, same-agent EVAL/APclose. Full suite only at actual minimum UI+ODS readiness then repair/pause."
  Verify Steps: "Read complete native4classes methods/header/factory/FontRelief/DocPool constants/memberids, shared SfxBoolItem/SfxEnumItem/actual Any extraction. Test all4factories, actual copy/Clone/Which independence, same-type equality/hash, inherited typed/scalar bool failure/state, relief3values/unknownmembers/convertbit/membernarrowing/extraction failure/range failure/outputunchanged. WholeCalc and complete changedshared owners rawS/B/F/L100 everycounterpositive with4reference links absent/restoredfinally; include current full textitem and native bool/enum and Writer consumers. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/boundaries/routing/doctor/diff; preserve failures/thresholds, exactpaths/currentGitbaseline/nativepins and same-agent not independent review. No full suite under latest user checkpoint."
  Verification: |-
    Command: node output/playwright/task120-checks/portable.mjs; --shared-only after adding unchanged existing Writer attributes consumer test
    Result: pass Calc165tests61files33owners rawS4150/B2731/F821/L3698; shared28tests5files3nonemptyowners rawS142/B60/F49/L133. All100percent every raw counter positive,4native reference links absent/restoredfinally. Original factories/copies/Clone/Which, bool Any and relief0through2short/unknownmember/convertbit/membernarrowing/wrongtype/failedunchanged output tested. Complete changed textitem owner with existing Writer consumers; no Writer-only coverage repair.
    Command: npx vitest run scripts/check-module-boundaries.test.ts
    Result: pass28tests, unchanged checker.
    Command: node output/playwright/task120-checks/gates.mjs
    Result: pass all12focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates.
    Command: python3 output/playwright/task120-checks/exact-review.py after successful source commit
    Evidence: fresh3587base/current3606committedhashes;29exactintentionalpaths10changed19added;13nativeSHA256pins. Same-agent evaluator is not independent review.
    Scope:4shared font value classes, native header/VCL FontRelief/MID_RELIEF and Calc107108123false/124NONE defaults through actual SfxItemSet copies. Existing shared metadata histories/status retained, broad parity flags unchanged. Initial shared profile threshold failure retained; complete existing related test added, no source/assertion/threshold change.
    Limits: localized presentation/resources/cache/refcount/memory ABI/FontKerning/fullDocPool/document/config/UI/ODS pending or excluded. No fake provider/C++generator/build/sanitizer or memory library. No newly established suspicious upstream behavior.
    Full suite not run per latest user instruction; next full only at real minimum UI contracts and same-model ODS load/save readiness, then relevant repairs and pause goal; no task121trigger. Goalactive.
  Rollback Plan: "Revert only task120source commit preserving task119/user changes. No merges/resets/globalfiles/network."
  Findings: |-
    Previous turn verified progress task119. Fresh preflight clean oncalc; two unrelated DOINGtasks untouched. UI/ODS remain unready. Next full when minimum actual UI contracts and ODSread/save roundtrip supported on same model, then relevant repairs and requested pause; no task121trigger.

    Observation: Initial whole Calc165tests and related15tests passed, but complete textitem profile99.29statements/98.33branches exposes one existing blank authored-family validation branch absent from selected shared tests.
    Impact: Related test selection omitted existing Writer consumer test, no runtime failure or changed Writer-only owner.
    Resolution: Include unchanged writer-attributes.test.ts that already checks blank family validation; retain entire changed shared textitem owner raw100 requirement and original assertions. No Writer-only coverage repair or product change.
id_source: "generated"
---
## Summary

Implement4missing shared native font property values needed by Calc document defaults/UI and ODS, preserving shared Writer owners. User continued goal authorizes safe local implementation oncalc, no merges.

## Scope

Existing EditEng textitem gains SvxContourItem/SvxShadowedItem/SvxWordLineModeItem/SvxCharReliefItem;4canonical headers; VCL fntstyle FontRelief enum; existing memberids MID_RELIEF and scitems107108123124. Two focused tests plus existing complete textitem/native bool/enum and Writer consumers. Runtime/provenance/capabilities and Calc docs. No localized presentation/native instance managers/memory ABI/provider/document scope.

## Plan

Port original bool payload/Which order, factories/copy/Clone using actual SfxBoolItem; relief actual SfxEnumItem<FontRelief> constructor/factory/copy/Clone and native short member0 transport. Member narrowedu8 and CONVERT_TWIPS stripped; typed Any signed16 extraction followed0..2check; wrong/unknown false unchanged. Scalar query retains existing inherited numeric projection. Calc defaultsfalse/false/false/NONE through real itemsetcopies. Keep original header/core responsibility and existing metadata histories/status. Verify exact native sources, targeted raw100,focusedgates/exactsource hashes, same-agent EVAL/APclose. Full suite only at actual minimum UI+ODS readiness then repair/pause.

## Verify Steps

Read complete native4classes methods/header/factory/FontRelief/DocPool constants/memberids, shared SfxBoolItem/SfxEnumItem/actual Any extraction. Test all4factories, actual copy/Clone/Which independence, same-type equality/hash, inherited typed/scalar bool failure/state, relief3values/unknownmembers/convertbit/membernarrowing/extraction failure/range failure/outputunchanged. WholeCalc and complete changedshared owners rawS/B/F/L100 everycounterpositive with4reference links absent/restoredfinally; include current full textitem and native bool/enum and Writer consumers. Focused format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/boundaries/routing/doctor/diff; preserve failures/thresholds, exactpaths/currentGitbaseline/nativepins and same-agent not independent review. No full suite under latest user checkpoint.

## Verification

Command: node output/playwright/task120-checks/portable.mjs; --shared-only after adding unchanged existing Writer attributes consumer test
Result: pass Calc165tests61files33owners rawS4150/B2731/F821/L3698; shared28tests5files3nonemptyowners rawS142/B60/F49/L133. All100percent every raw counter positive,4native reference links absent/restoredfinally. Original factories/copies/Clone/Which, bool Any and relief0through2short/unknownmember/convertbit/membernarrowing/wrongtype/failedunchanged output tested. Complete changed textitem owner with existing Writer consumers; no Writer-only coverage repair.
Command: npx vitest run scripts/check-module-boundaries.test.ts
Result: pass28tests, unchanged checker.
Command: node output/playwright/task120-checks/gates.mjs
Result: pass all12focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates.
Command: python3 output/playwright/task120-checks/exact-review.py after successful source commit
Evidence: fresh3587base/current3606committedhashes;29exactintentionalpaths10changed19added;13nativeSHA256pins. Same-agent evaluator is not independent review.
Scope:4shared font value classes, native header/VCL FontRelief/MID_RELIEF and Calc107108123false/124NONE defaults through actual SfxItemSet copies. Existing shared metadata histories/status retained, broad parity flags unchanged. Initial shared profile threshold failure retained; complete existing related test added, no source/assertion/threshold change.
Limits: localized presentation/resources/cache/refcount/memory ABI/FontKerning/fullDocPool/document/config/UI/ODS pending or excluded. No fake provider/C++generator/build/sanitizer or memory library. No newly established suspicious upstream behavior.
Full suite not run per latest user instruction; next full only at real minimum UI contracts and same-model ODS load/save readiness, then relevant repairs and pause goal; no task121trigger. Goalactive.

## Rollback Plan

Revert only task120source commit preserving task119/user changes. No merges/resets/globalfiles/network.

## Findings

Previous turn verified progress task119. Fresh preflight clean oncalc; two unrelated DOINGtasks untouched. UI/ODS remain unready. Next full when minimum actual UI contracts and ODSread/save roundtrip supported on same model, then relevant repairs and requested pause; no task121trigger.

Observation: Initial whole Calc165tests and related15tests passed, but complete textitem profile99.29statements/98.33branches exposes one existing blank authored-family validation branch absent from selected shared tests.
Impact: Related test selection omitted existing Writer consumer test, no runtime failure or changed Writer-only owner.
Resolution: Include unchanged writer-attributes.test.ts that already checks blank family validation; retain entire changed shared textitem owner raw100 requirement and original assertions. No Writer-only coverage repair or product change.
