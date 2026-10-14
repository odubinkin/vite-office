---
id: "202610141110-DS7XJ3"
title: "Share native length conversion and Calc cell margin/orientation values"
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
  updated_at: "2026-10-14T11:11:28.238Z"
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
    body: "Start: implement approved common unit values and actual margin/orientation, reuse Writer integer conversions and persist new readiness/full-run/pause rule; no fake document/provider or native memory library."
events:
  -
    type: "status"
    at: "2026-10-14T11:11:59.065Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved common unit values and actual margin/orientation, reuse Writer integer conversions and persist new readiness/full-run/pause rule; no fake document/provider or native memory library."
doc_version: 3
doc_updated_at: "2026-10-14T11:11:59.065Z"
doc_updated_by: "CODER"
description: "Task118: common normal20Length conversions/Tools twip wrapper and Writer LR reuse, actual SVX margin/orientation/UNO enum and Calc margin default. Primitive JS/BigInt value arithmetic, no memory library. Targeted raw100; full checkpoint only on minimum UI+ODS readiness then repair and pause, replacing121cadence."
sections:
  Summary: "Implement actual shared cell margins/orientation and reusable normal length conversions, migrating duplicate Writer integer twip logic to the original common owners. User continuation approves local work oncalc only/no merges."
  Scope: "Ten runtime owners: existing SALtypes adds native signed64 numeric constants; new o3tl unit_conversion normal20Length ratio/convert families and tools UnitConversion twip wrapper; existing EditEng lrspitem reuses7exact integer conversions, existing svxenum adds orientation; new SVX algitem header/core and unomid header, new OffAPI CellOrientation normal enum/type owner; existing Calc scitems adds143. Three focused tests, exact dependency/native SAL-o3tl import witnesses/checker tests,20runtime/provenance records,2capabilities,3Calc docs. Expected40intentionalpaths. No saturation/status conversion families, locale/presentation/cache/ABI/fullDocPool/document/ODS scope."
  Plan: "Port complete normal20Length enum/base ratios/prepareMDArray/getConversionMulDiv/convert/toTwips integer and floating value families from actual source. BigInt selects erased integral64 arithmetic; number selects floating family even for integer-valued double. SAL64 min/max constants remain shared once. Original positive-factor/range/unit assertions have explicit host checked Error only; constexpr table-only impossible assertions remain source-proven static facts, not private fault injection. No generic memory library. Tools convertTwipToMm100 delegates common converter, Writer seven existing exact integer formulas replaced by explicit BigInt integral calls, unrelated fractional rounding preserved. Port SvxMarginItem default20x4/explicit/copy/Clone/get/set/payload equality and full typedAny+scalar member/metric writes, original positive upper-only bound and signed16 wrapping. Orientation scalar/rotation+stacked/copy/Clone/typed enum query/enum-int update using actual SfxEnumItem/CPPU and original normal enum getter. Calc143default margin20 realpool and actual rotation/stacked consumers, no fakeDocPool. Native header/core/IDL/member owners, precise tools/o3tl edges and original unit_conversion SAL64 named binding witness, reverse/browser guards retained. WholeCalc/complete changedshared raw100 source-absent and real Writer LR consumers, focused12gates/currentGit/nativepin/exact40path review/same-agent EVAL/APclose. Latest user instruction replaces task121cadence: full test only at minimum real document/cell/read/edit/grid contracts plus ODS load/save readiness; repair then pausegoal."
  Verify Steps: |-
    1. Read complete relevant pinned algitem orientation/margin values, enums/unomid/IDL/DocPool, original normal unit conversion20table/muldiv/prepare/public functions, Toolswrapper, SAL64macros and Writer seveninteger sites. Validate actual constructors/default/copy/Clone/members/Any/type/errors/upper-only bounds/negative wrap, all400unit ratios and integer/floating rounding/bounds against independent units-per-inch arithmetic, actual Writer LR values. No C++ generator/build/sanitizer/fakeprovider/privateforcing/generalABI or fullnativeQA claim.
    2. WholeCalc and complete changedshared owners rawS/B/F/L100 everycounterpositive source-links4absent/restoredfinally. Related current LR integer/font-relative/Any/enum tests and exact module checker. Preserve assertions/thresholds/failures, no Writer-only coverage repair or full suite now.
    3. Focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, fresh3539Gitbaseline/currentcommitted40paths and nativepins, exact named SAL64 source witness. Same-agent EVAL not independent. CleanAPfinish oncalc; goalactive. Full-regression readiness checkpoint and requested post-regression pause persisted in current Calc docs and task; historic task121 references superseded, not rewritten.
  Verification: "Pending implementation and rawcoverage/gates."
  Rollback Plan: "Revert only task118 source commit preserving task117/userintegration/unrelated active tasks. No reset/merge/global or outside-repo changes."
  Findings: "Previous turn instruction acknowledged new checkpoint; task117finished/verifiedclean while new fullrun stop rule arrived. Current branchcalc clean, old unrelated DOINGtasks untouched. Latest user instruction: next full run when minimally ready for real UI+ODS loading/saving, not task121; after full run/relevant repairs pausegoal. This changes regression timing only; core fidelity/reuse/strict Calc and changedshared coverage retained. Writer LR already duplicates signed integer twip formulas; new common native primitive value owners replace those7sites, no new memory mechanism."
id_source: "generated"
---
## Summary

Implement actual shared cell margins/orientation and reusable normal length conversions, migrating duplicate Writer integer twip logic to the original common owners. User continuation approves local work oncalc only/no merges.

## Scope

Ten runtime owners: existing SALtypes adds native signed64 numeric constants; new o3tl unit_conversion normal20Length ratio/convert families and tools UnitConversion twip wrapper; existing EditEng lrspitem reuses7exact integer conversions, existing svxenum adds orientation; new SVX algitem header/core and unomid header, new OffAPI CellOrientation normal enum/type owner; existing Calc scitems adds143. Three focused tests, exact dependency/native SAL-o3tl import witnesses/checker tests,20runtime/provenance records,2capabilities,3Calc docs. Expected40intentionalpaths. No saturation/status conversion families, locale/presentation/cache/ABI/fullDocPool/document/ODS scope.

## Plan

Port complete normal20Length enum/base ratios/prepareMDArray/getConversionMulDiv/convert/toTwips integer and floating value families from actual source. BigInt selects erased integral64 arithmetic; number selects floating family even for integer-valued double. SAL64 min/max constants remain shared once. Original positive-factor/range/unit assertions have explicit host checked Error only; constexpr table-only impossible assertions remain source-proven static facts, not private fault injection. No generic memory library. Tools convertTwipToMm100 delegates common converter, Writer seven existing exact integer formulas replaced by explicit BigInt integral calls, unrelated fractional rounding preserved. Port SvxMarginItem default20x4/explicit/copy/Clone/get/set/payload equality and full typedAny+scalar member/metric writes, original positive upper-only bound and signed16 wrapping. Orientation scalar/rotation+stacked/copy/Clone/typed enum query/enum-int update using actual SfxEnumItem/CPPU and original normal enum getter. Calc143default margin20 realpool and actual rotation/stacked consumers, no fakeDocPool. Native header/core/IDL/member owners, precise tools/o3tl edges and original unit_conversion SAL64 named binding witness, reverse/browser guards retained. WholeCalc/complete changedshared raw100 source-absent and real Writer LR consumers, focused12gates/currentGit/nativepin/exact40path review/same-agent EVAL/APclose. Latest user instruction replaces task121cadence: full test only at minimum real document/cell/read/edit/grid contracts plus ODS load/save readiness; repair then pausegoal.

## Verify Steps

1. Read complete relevant pinned algitem orientation/margin values, enums/unomid/IDL/DocPool, original normal unit conversion20table/muldiv/prepare/public functions, Toolswrapper, SAL64macros and Writer seveninteger sites. Validate actual constructors/default/copy/Clone/members/Any/type/errors/upper-only bounds/negative wrap, all400unit ratios and integer/floating rounding/bounds against independent units-per-inch arithmetic, actual Writer LR values. No C++ generator/build/sanitizer/fakeprovider/privateforcing/generalABI or fullnativeQA claim.
2. WholeCalc and complete changedshared owners rawS/B/F/L100 everycounterpositive source-links4absent/restoredfinally. Related current LR integer/font-relative/Any/enum tests and exact module checker. Preserve assertions/thresholds/failures, no Writer-only coverage repair or full suite now.
3. Focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, fresh3539Gitbaseline/currentcommitted40paths and nativepins, exact named SAL64 source witness. Same-agent EVAL not independent. CleanAPfinish oncalc; goalactive. Full-regression readiness checkpoint and requested post-regression pause persisted in current Calc docs and task; historic task121 references superseded, not rewritten.

## Verification

Pending implementation and rawcoverage/gates.

## Rollback Plan

Revert only task118 source commit preserving task117/userintegration/unrelated active tasks. No reset/merge/global or outside-repo changes.

## Findings

Previous turn instruction acknowledged new checkpoint; task117finished/verifiedclean while new fullrun stop rule arrived. Current branchcalc clean, old unrelated DOINGtasks untouched. Latest user instruction: next full run when minimally ready for real UI+ODS loading/saving, not task121; after full run/relevant repairs pausegoal. This changes regression timing only; core fidelity/reuse/strict Calc and changedshared coverage retained. Writer LR already duplicates signed integer twip formulas; new common native primitive value owners replace those7sites, no new memory mechanism.
