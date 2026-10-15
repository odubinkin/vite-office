---
id: "202610150655-043CPA"
title: "Restore native signed16 pooled item contracts for text metrics"
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
  updated_at: "2026-10-15T06:55:45.052Z"
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
    body: "Start: correct original shared signed16 item contracts and real Calc inherited flag behavior, no compatibility shim or duplicate metric primitive; scoped strict coverage and portable source audit."
events:
  -
    type: "status"
    at: "2026-10-15T06:55:52.999Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct original shared signed16 item contracts and real Calc inherited flag behavior, no compatibility shim or duplicate metric primitive; scoped strict coverage and portable source audit."
doc_version: 3
doc_updated_at: "2026-10-15T07:03:56.456Z"
doc_updated_by: "CODER"
description: "Task151 corrects shared SfxInt16Item mutation/copy/payload equality/typed Any/hash/numeric presentation, with actual Calc ScMergeFlagAttr inherited behavior and related Writer tests. Real prerequisite for future SvxKerningItem; no duplicate wrapper, no UI localization or memory manager."
sections:
  Summary: "Task151 restores original shared SfxInt16Item value contracts required by native text-metric items, reusing and correcting the existing owner."
  Scope: "At most24intentional non-agent paths: existing svl intitem implementation/header metadata, direct signed16 tests, two obsolete equality assertions in existing sibling/itemset tests, actual Calc merge-flag inheritance regression, matched runtime/provenance/capability and calc-core docs. Native default/copy/SetValue/Clone, concrete payload equality excluding Which, typed Any short query/write, hash support and locale-independent numeric presentation. Existing validated JS scalar input domain and no-argument scalar query remain explicit browser boundaries. No false compatibility branch, native tree/Boost diagnostics port, memory manager, fake kerning class or UI localization."
  Plan: "Restore existing shared signed16 item native copy/mutation/equality/typed Any/hash/numeric presentation; correct obsolete expectations, verify actual Calc derived flags and Writer consumers, strict raw100/gates/build/source inventory audit and24path clean calc finish."
  Verify Steps: "Compare original svl/intitem.hxx and intitem.cxx constructors/value/copy/Clone/equality/typed short Any/hash/number presentation, ScMergeFlagAttr header inheritance and poolitem areSame guards. Test signed16 extrema/defaults/factory/copy/SetValue/Clone with independence, Which-excluding direct equality but exact native-type guard and areSame/set Which/type distinctions; existing checked JS scalar rejection remains explicit host precondition. Real Any short read/write ignoring all member values, extraction failure and unchanged values, existing scalar Query retained. Hash support/source value with repository unsigned64 logical size_t convention excluding Which; no persisted binary data claim. Native numeric presentation writes OUString without translation/resources or locale provider. Real Calc merge flags inherit mutation/Any, flags/masks/clone/state consistency and payload/Which separation. Related whole shared itempool/set/numeric/Writer automatic equality/notification/table tests; whole changed shared executable owner and whole Calc every raw S/B/F/L counter positive100. Writer-only coverage gaps exempt. Four references absent for tests/build and restored finally; all13source gates incl39boundary cases/inventory zero semantic violations, exact24path scope/source pins/hashes/clean calc. No native compiler/probe/Boost port. Full all-app suite only when actual minimum connected UI plus same-model ODS ready then applicable repairs/pause."
  Verification: |-
    - Command: `node output/playwright/task151-checks/portable.mjs`; initial failed presentation test retained, corrected assertion rerun. Exact argv/cwd/source absence retained in manifests.
      Result: pass.
      Evidence:146related tests/19files (shared pool/set/numeric, actual Calc flags, Writer style/automatic/table/notifications);187whole Calc tests/76files. Complete changed shared intitem executable owner raw S54/B37/F23/L48 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. No thresholds/exclusions/source-map/counter modifications or Writer coverage repairs.
      Scope: source default/value/copy/factory/SetValue/independent Clone, checked JS signed16 scalar boundary, same-type payload equality excluding Which and areSame/set identity distinction, native value-only logical unsigned64 size_t hash/support, real short Any query/update ignoring member with failure nonmutation and retained scalar query. Native locale-independent OUString.number presentation including real nul-terminated getStr buffer, no translated resources/provider. Actual ScMergeFlagAttr inherits mutation/Any/hash while preserving flags, independent clone and exact concrete type; no compatibility shim. Four source links absent/restored finally for tests/build.
    - Command: all13exact argv in `output/playwright/task151-checks/source-gates.json`; `node output/playwright/task151-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing boundary tests;657runtime sources/2894relative imports/95allowed edges, inventory zero semantic violations. Portable production build exit0.
      Scope:13intentional non-agent paths within24approved bound, existing source/header/Calc metadata updated without broad parity promotion. Two obsolete direct-equality assertions corrected to Which-independent source payload behavior. Existing source module reused, no new primitive wrapper/cycle exception or graph algorithm change. Full all-app suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable repairs/pause.
    - Command: `python3 output/playwright/task151-checks/audit-native.py`; `python3 output/playwright/task151-checks/audit-final.py`.
      Result: pass.
      Evidence: original default/copy/SetValue/Clone/payload equality/hash/numeric presentation/short Any definitions and actual Calc derived type/areSame Which guards source-audited.6native pins at9bc445578031fecf56086729d8e4940c77e14d65;3915source hashes (3913baseline,11changed existing,2new,3902unchanged),13intentional paths/4restored links audited. Initial test incorrectly omitted the existing native nul terminator, corrected only the expected code units; failed evidence retained in Findings.
      Scope: existing checked host scalar domain/no-argument query explicitly retained; no claim of unchecked C++ caller-conversion or binary document layout parity. Logical hash uses repository unsigned64 convention and is not persisted. Native property-tree/base diagnostic serializer remains unported, no Boost/lifetime manager. Native Writer frame QA is broader unported source context only; no native compiler/probe/execution. Same-agent review is not independent. Actual text-metric subclasses/EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; UI localization deferred. Final clean calc/hash proof required at closure.
  Rollback Plan: "Revert intentional task paths in later authorized task; no reset/merge/publication."
  Findings: |-
    The immutable/no-setter/Which-in-payload behavior is a local divergence, not a suspected native defect. Correct shared owner without a Writer compatibility shim; task148 areSame retains original Which/type comparison at caller sites. Native diagnostic property-tree JSON/base serializer remains unported, no fake Boost owner. UI localization stays deferred. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.

    - Observation: Initial new numeric presentation assertion omitted the terminating nul included by the real shared OUString.getStr buffer;145other related tests passed.
      Impact: New test expectation failed while production numeric presentation and existing shared string behavior matched native source. Calc was not yet started because portable wrapper stops on first failed case.
      Resolution: Corrected independent expected code units to include the source nul, retained failed log and reran portable related/Calc checks. No production behavior or shared string implementation changed.
id_source: "generated"
---
## Summary

Task151 restores original shared SfxInt16Item value contracts required by native text-metric items, reusing and correcting the existing owner.

## Scope

At most24intentional non-agent paths: existing svl intitem implementation/header metadata, direct signed16 tests, two obsolete equality assertions in existing sibling/itemset tests, actual Calc merge-flag inheritance regression, matched runtime/provenance/capability and calc-core docs. Native default/copy/SetValue/Clone, concrete payload equality excluding Which, typed Any short query/write, hash support and locale-independent numeric presentation. Existing validated JS scalar input domain and no-argument scalar query remain explicit browser boundaries. No false compatibility branch, native tree/Boost diagnostics port, memory manager, fake kerning class or UI localization.

## Plan

Restore existing shared signed16 item native copy/mutation/equality/typed Any/hash/numeric presentation; correct obsolete expectations, verify actual Calc derived flags and Writer consumers, strict raw100/gates/build/source inventory audit and24path clean calc finish.

## Verify Steps

Compare original svl/intitem.hxx and intitem.cxx constructors/value/copy/Clone/equality/typed short Any/hash/number presentation, ScMergeFlagAttr header inheritance and poolitem areSame guards. Test signed16 extrema/defaults/factory/copy/SetValue/Clone with independence, Which-excluding direct equality but exact native-type guard and areSame/set Which/type distinctions; existing checked JS scalar rejection remains explicit host precondition. Real Any short read/write ignoring all member values, extraction failure and unchanged values, existing scalar Query retained. Hash support/source value with repository unsigned64 logical size_t convention excluding Which; no persisted binary data claim. Native numeric presentation writes OUString without translation/resources or locale provider. Real Calc merge flags inherit mutation/Any, flags/masks/clone/state consistency and payload/Which separation. Related whole shared itempool/set/numeric/Writer automatic equality/notification/table tests; whole changed shared executable owner and whole Calc every raw S/B/F/L counter positive100. Writer-only coverage gaps exempt. Four references absent for tests/build and restored finally; all13source gates incl39boundary cases/inventory zero semantic violations, exact24path scope/source pins/hashes/clean calc. No native compiler/probe/Boost port. Full all-app suite only when actual minimum connected UI plus same-model ODS ready then applicable repairs/pause.

## Verification

- Command: `node output/playwright/task151-checks/portable.mjs`; initial failed presentation test retained, corrected assertion rerun. Exact argv/cwd/source absence retained in manifests.
  Result: pass.
  Evidence:146related tests/19files (shared pool/set/numeric, actual Calc flags, Writer style/automatic/table/notifications);187whole Calc tests/76files. Complete changed shared intitem executable owner raw S54/B37/F23/L48 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. No thresholds/exclusions/source-map/counter modifications or Writer coverage repairs.
  Scope: source default/value/copy/factory/SetValue/independent Clone, checked JS signed16 scalar boundary, same-type payload equality excluding Which and areSame/set identity distinction, native value-only logical unsigned64 size_t hash/support, real short Any query/update ignoring member with failure nonmutation and retained scalar query. Native locale-independent OUString.number presentation including real nul-terminated getStr buffer, no translated resources/provider. Actual ScMergeFlagAttr inherits mutation/Any/hash while preserving flags, independent clone and exact concrete type; no compatibility shim. Four source links absent/restored finally for tests/build.
- Command: all13exact argv in `output/playwright/task151-checks/source-gates.json`; `node output/playwright/task151-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing boundary tests;657runtime sources/2894relative imports/95allowed edges, inventory zero semantic violations. Portable production build exit0.
  Scope:13intentional non-agent paths within24approved bound, existing source/header/Calc metadata updated without broad parity promotion. Two obsolete direct-equality assertions corrected to Which-independent source payload behavior. Existing source module reused, no new primitive wrapper/cycle exception or graph algorithm change. Full all-app suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable repairs/pause.
- Command: `python3 output/playwright/task151-checks/audit-native.py`; `python3 output/playwright/task151-checks/audit-final.py`.
  Result: pass.
  Evidence: original default/copy/SetValue/Clone/payload equality/hash/numeric presentation/short Any definitions and actual Calc derived type/areSame Which guards source-audited.6native pins at9bc445578031fecf56086729d8e4940c77e14d65;3915source hashes (3913baseline,11changed existing,2new,3902unchanged),13intentional paths/4restored links audited. Initial test incorrectly omitted the existing native nul terminator, corrected only the expected code units; failed evidence retained in Findings.
  Scope: existing checked host scalar domain/no-argument query explicitly retained; no claim of unchecked C++ caller-conversion or binary document layout parity. Logical hash uses repository unsigned64 convention and is not persisted. Native property-tree/base diagnostic serializer remains unported, no Boost/lifetime manager. Native Writer frame QA is broader unported source context only; no native compiler/probe/execution. Same-agent review is not independent. Actual text-metric subclasses/EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; UI localization deferred. Final clean calc/hash proof required at closure.

## Rollback Plan

Revert intentional task paths in later authorized task; no reset/merge/publication.

## Findings

The immutable/no-setter/Which-in-payload behavior is a local divergence, not a suspected native defect. Correct shared owner without a Writer compatibility shim; task148 areSame retains original Which/type comparison at caller sites. Native diagnostic property-tree JSON/base serializer remains unported, no fake Boost owner. UI localization stays deferred. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.

- Observation: Initial new numeric presentation assertion omitted the terminating nul included by the real shared OUString.getStr buffer;145other related tests passed.
  Impact: New test expectation failed while production numeric presentation and existing shared string behavior matched native source. Calc was not yet started because portable wrapper stops on first failed case.
  Resolution: Corrected independent expected code units to include the source nul, retained failed log and reran portable related/Calc checks. No production behavior or shared string implementation changed.
