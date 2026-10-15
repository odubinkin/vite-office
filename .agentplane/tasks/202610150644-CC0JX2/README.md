---
id: "202610150644-CC0JX2"
title: "Implement native text escapement values for EditEngine pool"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T06:45:16.303Z"
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
    body: "Start: native shared escapement constructor/value/Any family for actual EditEngine text defaults; preserve auto/manual quirks and reuse shared primitives, localization deferred."
events:
  -
    type: "status"
    at: "2026-10-15T06:45:22.381Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native shared escapement constructor/value/Any family for actual EditEngine text defaults; preserve auto/manual quirks and reuse shared primitives, localization deferred."
doc_version: 3
doc_updated_at: "2026-10-15T06:51:39.045Z"
doc_updated_by: "CODER"
description: "Task150 ports original shared SvxEscapementItem, its constants/enum/member contracts and actual EditEngine0/100default witness. This is a missing real rich-text pool dependency; reuse shared SfxPoolItem/Any/Any2Bool, no fake engine/document or localized presentation."
sections:
  Summary: "Task150 implements native SvxEscapementItem value family as a missing actual EditEngine rich-text pool dependency."
  Scope: "At most24intentional non-agent paths: textitem.escapement.ts and canonical escapementitem.ts header; existing svxenum/memberids declarations, direct value tests with actual EditEngine default identity/source witness, matched runtime/provenance/capability records and calc-core/suspected-source docs. Actual constructor/copy/Clone/equality/Get/Set/enum/Any behavior and original constants. Necessary responsibility split because existing textitem.ts451lines plus full escapement owner exceeds500; no convenience naming exception. UI-localized GetPresentation deferred; no engine/pool facade, native memory manager, fake runtime ABI or new scalar query projection."
  Plan: "Port actual missing SvxEscapementItem complete value/typed member family, exact defaults/declarations and source transition semantics; reuse shared primitives, strict raw100 related/Calc, gates/build/inventory/source audit and24path clean calc finish."
  Verify Steps: "Compare escapementitem.hxx/textitem.cxx, actual4SvxEscapement enum declarations,3memberIDs and actual eerdll.cxx default0/100 with EE identity from original solar/eeitem offsets. Test all constructor/factory/copy forms, setters cast short/unsigned8, enum fallthrough/sign getter, clone independent Which-preserving and payload equality ignoring Which. Query real Any short/byte/bool incl signed8 output, unsigned8 member and ignored twips, unknown unchanged success, inherited no-argument undefined. Put native numeric extraction/ranges and nonmutation, height1..100, bool and int32 Any2Bool/failure fallback, auto-positive/negative/off decrements and unchanged proportional height. Record surprising auto-off boundary in Calc suspected file without changing behavior. Entire new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; related enum/Any2Bool consumers tests as needed, no Writer-only coverage repairs. Four references absent during tests/build and restored finally. All13scoped source gates incl39boundary cases, inventory zero semantic violations, justified filename split, native source pins/exact24path bound/hashes and clean calc. No compiler/probes; full suite only on actual minimum connected UI plus same-model ODS then applicable repairs/pause."
  Verification: |-
    - Command: `node output/playwright/task150-checks/portable.mjs`; exact argv/cwd/reference absence retained in related/Calc manifests.
      Result: pass.
      Evidence:15related tests/3files (6new escapement tests plus original enum/Any2Bool consumers);186whole Calc tests/76files. Entire3new/changed shared executable owners raw S226/B51/F19/L219 and33Calc owners S4179/B2731/F821/L3727 at100, every raw counter positive. No threshold/exclusion/source-map/counter changes, no Writer coverage repair.
      Scope: literal native constants/enum/defaults, Which-only/mode/explicit/copy/factory constructors, independent Clone and Which-independent payload equality, direct short/byte narrowing, sign-mode getter, typed short/byte/bool queries incl signed8 height and byte-masked/twips aliases, unknown untouched success and inherited no-argument undefined. Numeric Any property failures/ranges and unchanged values; shared Any2Bool bool/int32/failure conversion; automatic sign/unchanged height and native marker-to-boundary transitions. Actual EditEngine4052default0/100 tested without a dummy pool. Four source links absent/restored finally for portable tests/build.
    - Command: all13exact argv in `output/playwright/task150-checks/source-gates.json`; `node output/playwright/task150-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing module-boundary tests; inventory zero semantic violations. Production build exit0 without source references.
      Scope:16intentional non-agent paths within24approved bound. Canonical escapementitem header and necessary textitem source responsibility split documented; existing451line textitem.ts untouched, no graph/gate exceptions. UI-localized presentation deferred, no new browser scalar projection or native lifetime manager. All-app full suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable fixes/pause.
    - Command: `python3 output/playwright/task150-checks/audit-native.py`; `python3 output/playwright/task150-checks/audit-final.py`.
      Result: pass.
      Evidence:6native constants/4enum declarations/3member IDs, native short/byte/bool query and numeric/auto write rules, factory0/100 and actual eerdll default4052 from solar/eeitem offsets verified.9native pins at9bc445578031fecf56086729d8e4940c77e14d65,3913source hashes (3905baseline,8changed existing,8new,3897unchanged),16intentional paths/4restored links audited. CALC128 documents auto-off±13999 and unchanged height without treating it as a confirmed upstream defect.
      Scope: actual bounded native value contracts, using existing real SfxPoolItem/Any/Any2Bool and JS GC. Original generic CharacterProperties CharEscapementHeight QA is broader unported source context, not native execution or complete UNO/filter parity. No native compiler/probes, type ABI, dummy engine/pool or memory manager. Same-agent evaluation is not independent; actual EditEngine/EditTextObject/ScPageHFItem/full Calc pool/model/UI/ODS remain pending. Final clean calc/source-hash proof required at closure.
  Rollback Plan: "Revert intentional paths in a later authorized task; no reset/merge/publication."
  Findings: "Automatic on/off selectors do not reset proportional height; turning off an auto marker decrements magnitude14000to13999 rather than restoring ordinary33/-8. Preserve and document source behavior. Localized presentation is deferred, actual EditEngine/EditTextObject/ScPageHFItem and full Calc pool/model/UI/ODS remain pending. Same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task150 implements native SvxEscapementItem value family as a missing actual EditEngine rich-text pool dependency.

## Scope

At most24intentional non-agent paths: textitem.escapement.ts and canonical escapementitem.ts header; existing svxenum/memberids declarations, direct value tests with actual EditEngine default identity/source witness, matched runtime/provenance/capability records and calc-core/suspected-source docs. Actual constructor/copy/Clone/equality/Get/Set/enum/Any behavior and original constants. Necessary responsibility split because existing textitem.ts451lines plus full escapement owner exceeds500; no convenience naming exception. UI-localized GetPresentation deferred; no engine/pool facade, native memory manager, fake runtime ABI or new scalar query projection.

## Plan

Port actual missing SvxEscapementItem complete value/typed member family, exact defaults/declarations and source transition semantics; reuse shared primitives, strict raw100 related/Calc, gates/build/inventory/source audit and24path clean calc finish.

## Verify Steps

Compare escapementitem.hxx/textitem.cxx, actual4SvxEscapement enum declarations,3memberIDs and actual eerdll.cxx default0/100 with EE identity from original solar/eeitem offsets. Test all constructor/factory/copy forms, setters cast short/unsigned8, enum fallthrough/sign getter, clone independent Which-preserving and payload equality ignoring Which. Query real Any short/byte/bool incl signed8 output, unsigned8 member and ignored twips, unknown unchanged success, inherited no-argument undefined. Put native numeric extraction/ranges and nonmutation, height1..100, bool and int32 Any2Bool/failure fallback, auto-positive/negative/off decrements and unchanged proportional height. Record surprising auto-off boundary in Calc suspected file without changing behavior. Entire new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; related enum/Any2Bool consumers tests as needed, no Writer-only coverage repairs. Four references absent during tests/build and restored finally. All13scoped source gates incl39boundary cases, inventory zero semantic violations, justified filename split, native source pins/exact24path bound/hashes and clean calc. No compiler/probes; full suite only on actual minimum connected UI plus same-model ODS then applicable repairs/pause.

## Verification

- Command: `node output/playwright/task150-checks/portable.mjs`; exact argv/cwd/reference absence retained in related/Calc manifests.
  Result: pass.
  Evidence:15related tests/3files (6new escapement tests plus original enum/Any2Bool consumers);186whole Calc tests/76files. Entire3new/changed shared executable owners raw S226/B51/F19/L219 and33Calc owners S4179/B2731/F821/L3727 at100, every raw counter positive. No threshold/exclusion/source-map/counter changes, no Writer coverage repair.
  Scope: literal native constants/enum/defaults, Which-only/mode/explicit/copy/factory constructors, independent Clone and Which-independent payload equality, direct short/byte narrowing, sign-mode getter, typed short/byte/bool queries incl signed8 height and byte-masked/twips aliases, unknown untouched success and inherited no-argument undefined. Numeric Any property failures/ranges and unchanged values; shared Any2Bool bool/int32/failure conversion; automatic sign/unchanged height and native marker-to-boundary transitions. Actual EditEngine4052default0/100 tested without a dummy pool. Four source links absent/restored finally for portable tests/build.
- Command: all13exact argv in `output/playwright/task150-checks/source-gates.json`; `node output/playwright/task150-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing module-boundary tests; inventory zero semantic violations. Production build exit0 without source references.
  Scope:16intentional non-agent paths within24approved bound. Canonical escapementitem header and necessary textitem source responsibility split documented; existing451line textitem.ts untouched, no graph/gate exceptions. UI-localized presentation deferred, no new browser scalar projection or native lifetime manager. All-app full suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable fixes/pause.
- Command: `python3 output/playwright/task150-checks/audit-native.py`; `python3 output/playwright/task150-checks/audit-final.py`.
  Result: pass.
  Evidence:6native constants/4enum declarations/3member IDs, native short/byte/bool query and numeric/auto write rules, factory0/100 and actual eerdll default4052 from solar/eeitem offsets verified.9native pins at9bc445578031fecf56086729d8e4940c77e14d65,3913source hashes (3905baseline,8changed existing,8new,3897unchanged),16intentional paths/4restored links audited. CALC128 documents auto-off±13999 and unchanged height without treating it as a confirmed upstream defect.
  Scope: actual bounded native value contracts, using existing real SfxPoolItem/Any/Any2Bool and JS GC. Original generic CharacterProperties CharEscapementHeight QA is broader unported source context, not native execution or complete UNO/filter parity. No native compiler/probes, type ABI, dummy engine/pool or memory manager. Same-agent evaluation is not independent; actual EditEngine/EditTextObject/ScPageHFItem/full Calc pool/model/UI/ODS remain pending. Final clean calc/source-hash proof required at closure.

## Rollback Plan

Revert intentional paths in a later authorized task; no reset/merge/publication.

## Findings

Automatic on/off selectors do not reset proportional height; turning off an auto marker decrements magnitude14000to13999 rather than restoring ordinary33/-8. Preserve and document source behavior. Localized presentation is deferred, actual EditEngine/EditTextObject/ScPageHFItem and full Calc pool/model/UI/ODS remain pending. Same-agent evaluation is not independent.
