---
id: "202610151237-FB9217"
title: "Implement native ruby autodirection and empty text feature values"
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
  updated_at: "2026-10-15T12:38:19.504Z"
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
    body: "Start: actual ruby text/adjustment/position, automatic paragraph direction and empty tab/line-break values; reuse shared strings/Any/item contracts with no extra lifetime provider or localization."
events:
  -
    type: "status"
    at: "2026-10-15T12:38:47.901Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual ruby text/adjustment/position, automatic paragraph direction and empty tab/line-break values; reuse shared strings/Any/item contracts with no extra lifetime provider or localization."
doc_version: 3
doc_updated_at: "2026-10-15T12:55:49.073Z"
doc_updated_by: "CODER"
description: "Task154 ports actual SvxRubyItem, SvxAutoFrameDirectionItem and SfxVoidItem default dependencies on existing OUString/bool/pool owners. Full ruby text/numeric Any and native literal presentations, original declarations/defaults, no localization/provider/lifetime facade."
sections:
  Summary: "Task154 implements genuine ruby annotation, automatic paragraph direction and empty tab/line-break item values needed by the actual EditEngine package."
  Scope: "At most36intentional non-agent paths: canonical rubyitem/voiditem source and public headers, automatic-direction class in existing375line paraitem.ts with canonical autodiritem header, actual RubyAdjust enum/RubyPosition constants and native ruby selectors; direct related tests, matched inventory/capability and calc-core docs. Reuse existing OUString const-reference/copy/Any and bool/item bases; no new memory/move manager or provider facade. Original locale-independent ruby content and literal Void presentation included, translated automatic-direction presentation deferred."
  Plan: "Port3actual remaining EditEngine defaults with shared strings/bool/item contracts, full ruby/void core behavior and declarations, strict raw100 related/shared/Calc and scoped source/build/native inventory audits within36paths; localized direction labels/providers deferred."
  Verify Steps: "Read native rubyitem.hxx/cxx, voiditem.hxx/cxx, autodiritem.hxx/paraitem.cxx and actual IDL/member/default declarations. Ruby empty/LEFT/ABOVE, independent copied text/Clone, stable borrowed const text, self assignment and embedded nul/surrogate units; direct enum/short setters preserve native argument casts while property adjustment admits only LEFT..INDENT_BLOCK, position accepts every short. Typed real Any string uses original pData address/extraction, all3query/write selectors and byte/twips aliases; legacy charstyle/above/unknown members false unchanged, wrong types/ranges nonmutating, no invented no-argument projection. Locale-independent GetPresentation copies content. Void default0, copied Which/source unchanged for native named-rvalue copy, empty payload equality excluding Which but exact type/areSame identity and state-sentinel distinction, real clone object, literal Void output and inherited unsupported Query/Put/no-op metrics. Direction actual bool/copy/Clone native true4041 default, ruby4074 and feature4078/4079 default witnesses without a pool facade. RubyAdjust5IDL values plus original generated size sentinel and3RubyPosition constants verified; no enum type-provider claim. Whole6new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; relevant paragraph/bool/enum/itemset/Any/string tests, Writer-only coverage gaps exempt. Four links absent for tests/build restored finally; all13source gates incl40boundary cases/inventory zero violations, exact36path bound/pins/hashes/clean calc. No native compiler/probe. Full all-app suite only on actual minimum connected UI+same-model ODS then applicable fixes/pause."
  Verification: |-
    - Command: `node output/playwright/task154-checks/portable.mjs` then `--shared-only` after selecting two existing neighboring attribute regressions; exact argv/cwd/reference absence retained in manifests.
      Result: pass.
      Evidence:129related tests/19files and187whole Calc tests/76files. Entire6new/changed executable shared owners raw S257/B147/F66/L248 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Initial related tests passed but omitted old paraitem line-spacing/Asian-bool paths; existing textitem/frame-direction tests close the owner coverage gap, initial log retained and passed Calc not replayed. No threshold/exclusion/source-map/counter changes or Writer coverage repairs.
      Scope: actual ruby default/copy/get/set/Clone/payload/typed string-short Any and content presentation, stable borrowed const text and independent caller/output values including embedded nul/surrogates; adjustment0..4property bounds, every short position, ignored twips/byte aliases, legacy/unknown selector rejection and numeric failure nonmutation. Void is genuine empty value with copied identities/real clone/literal presentation, distinct from invalid/disabled states; automatic direction reuses real bool transport/copy. Original default witnesses4074empty/4041true/4078tab/4079line-break without a pool facade. Four references absent during tests/build and restored finally.
    - Command: all13exact argv in `output/playwright/task154-checks/source-gates.json`; `node output/playwright/task154-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and40existing boundary tests; inventory zero semantic violations, provenance676runtime modules. Portable production build exit0 without source references.
      Scope:30intentional non-agent paths within36approved bound. Original ruby/void source boundaries, canonical3headers and actual RubyAdjust/RubyPosition declarations; auto direction fits existing375line paraitem owner without an unnecessary split. No dependency/cycle/policy exceptions, native memory/destructor/cache/move emulation or localized direction labels. Whole-suite run remains deferred until genuine minimum connected UI+same-model ODS readiness, then applicable fixes/pause.
    - Command: `python3 output/playwright/task154-checks/audit-native.py`; `python3 output/playwright/task154-checks/audit-final.py`.
      Result: pass.
      Evidence: original3value families, ruby string/numeric/property-range rules and literal/content presentations,5IDL adjustment entries/generated size sentinel/3position constants/5selector declarations and4actual default ids source-audited.15native pins at9bc445578031fecf56086729d8e4940c77e14d65;3975source hashes (3952baseline,7changed existing,23new,3945unchanged),30intentional paths/4restored links audited.
      Scope: real shared OUString/const-reference/pData Any and bool/item bases reused, no caller ownership transfer/reset or fabricated default engine. Original generic CharacterProperties RubyText QA is broader unported source context, not native execution/full filter parity; no compiler/probe/Boost/type-provider facade. Diagnostic XML and localized direction/resource/type-provider services unported. Existing bounded shared line-spacing/tab-stop interfaces require canonicalization next before a genuine EditEngine pool can be certified. Same-agent review is not independent; actual full engine/EditTextObject/Calc pool/model/connected UI/same-model ODS and UI localization remain pending. Final clean calc/hash proof required at closure.
  Rollback Plan: "Revert intentional paths through later authorized task; no reset/merge/publication."
  Findings: |-
    Ruby labels are actual document content, not localized language/interface names. Use existing shared strings and actual numeric Any; do not duplicate them. The automatic direction addition fits existing paraitem375lines and must not introduce an unnecessary source split. Native diagnostic XML/generated enum type-provider and translated direction labels are unported, no lifetime/destructor/debug/move emulation. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS pending; same-agent review is not independent.

    - Observation: Initial related selection passed all behavior tests but whole paraitem owner raw coverage omits existing line-spacing and Asian bool regressions; native interface review also confirms old line-spacing/tab-stop owners remain bounded browser projections.
      Impact: Task154 new values are valid, but strict owner coverage needs existing related tests. A real EditEngine pool cannot be certified until native line-spacing/tab-stop contracts replace those older projections.
      Resolution: Add existing textitem.test.ts and frame-direction.test.ts for full owner coverage; retain initial log, rerun shared only after current Calc completes. Prioritize canonical shared line-spacing/tab-stop work next, without a compatibility shim or fake pool.
id_source: "generated"
---
## Summary

Task154 implements genuine ruby annotation, automatic paragraph direction and empty tab/line-break item values needed by the actual EditEngine package.

## Scope

At most36intentional non-agent paths: canonical rubyitem/voiditem source and public headers, automatic-direction class in existing375line paraitem.ts with canonical autodiritem header, actual RubyAdjust enum/RubyPosition constants and native ruby selectors; direct related tests, matched inventory/capability and calc-core docs. Reuse existing OUString const-reference/copy/Any and bool/item bases; no new memory/move manager or provider facade. Original locale-independent ruby content and literal Void presentation included, translated automatic-direction presentation deferred.

## Plan

Port3actual remaining EditEngine defaults with shared strings/bool/item contracts, full ruby/void core behavior and declarations, strict raw100 related/shared/Calc and scoped source/build/native inventory audits within36paths; localized direction labels/providers deferred.

## Verify Steps

Read native rubyitem.hxx/cxx, voiditem.hxx/cxx, autodiritem.hxx/paraitem.cxx and actual IDL/member/default declarations. Ruby empty/LEFT/ABOVE, independent copied text/Clone, stable borrowed const text, self assignment and embedded nul/surrogate units; direct enum/short setters preserve native argument casts while property adjustment admits only LEFT..INDENT_BLOCK, position accepts every short. Typed real Any string uses original pData address/extraction, all3query/write selectors and byte/twips aliases; legacy charstyle/above/unknown members false unchanged, wrong types/ranges nonmutating, no invented no-argument projection. Locale-independent GetPresentation copies content. Void default0, copied Which/source unchanged for native named-rvalue copy, empty payload equality excluding Which but exact type/areSame identity and state-sentinel distinction, real clone object, literal Void output and inherited unsupported Query/Put/no-op metrics. Direction actual bool/copy/Clone native true4041 default, ruby4074 and feature4078/4079 default witnesses without a pool facade. RubyAdjust5IDL values plus original generated size sentinel and3RubyPosition constants verified; no enum type-provider claim. Whole6new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; relevant paragraph/bool/enum/itemset/Any/string tests, Writer-only coverage gaps exempt. Four links absent for tests/build restored finally; all13source gates incl40boundary cases/inventory zero violations, exact36path bound/pins/hashes/clean calc. No native compiler/probe. Full all-app suite only on actual minimum connected UI+same-model ODS then applicable fixes/pause.

## Verification

- Command: `node output/playwright/task154-checks/portable.mjs` then `--shared-only` after selecting two existing neighboring attribute regressions; exact argv/cwd/reference absence retained in manifests.
  Result: pass.
  Evidence:129related tests/19files and187whole Calc tests/76files. Entire6new/changed executable shared owners raw S257/B147/F66/L248 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Initial related tests passed but omitted old paraitem line-spacing/Asian-bool paths; existing textitem/frame-direction tests close the owner coverage gap, initial log retained and passed Calc not replayed. No threshold/exclusion/source-map/counter changes or Writer coverage repairs.
  Scope: actual ruby default/copy/get/set/Clone/payload/typed string-short Any and content presentation, stable borrowed const text and independent caller/output values including embedded nul/surrogates; adjustment0..4property bounds, every short position, ignored twips/byte aliases, legacy/unknown selector rejection and numeric failure nonmutation. Void is genuine empty value with copied identities/real clone/literal presentation, distinct from invalid/disabled states; automatic direction reuses real bool transport/copy. Original default witnesses4074empty/4041true/4078tab/4079line-break without a pool facade. Four references absent during tests/build and restored finally.
- Command: all13exact argv in `output/playwright/task154-checks/source-gates.json`; `node output/playwright/task154-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and40existing boundary tests; inventory zero semantic violations, provenance676runtime modules. Portable production build exit0 without source references.
  Scope:30intentional non-agent paths within36approved bound. Original ruby/void source boundaries, canonical3headers and actual RubyAdjust/RubyPosition declarations; auto direction fits existing375line paraitem owner without an unnecessary split. No dependency/cycle/policy exceptions, native memory/destructor/cache/move emulation or localized direction labels. Whole-suite run remains deferred until genuine minimum connected UI+same-model ODS readiness, then applicable fixes/pause.
- Command: `python3 output/playwright/task154-checks/audit-native.py`; `python3 output/playwright/task154-checks/audit-final.py`.
  Result: pass.
  Evidence: original3value families, ruby string/numeric/property-range rules and literal/content presentations,5IDL adjustment entries/generated size sentinel/3position constants/5selector declarations and4actual default ids source-audited.15native pins at9bc445578031fecf56086729d8e4940c77e14d65;3975source hashes (3952baseline,7changed existing,23new,3945unchanged),30intentional paths/4restored links audited.
  Scope: real shared OUString/const-reference/pData Any and bool/item bases reused, no caller ownership transfer/reset or fabricated default engine. Original generic CharacterProperties RubyText QA is broader unported source context, not native execution/full filter parity; no compiler/probe/Boost/type-provider facade. Diagnostic XML and localized direction/resource/type-provider services unported. Existing bounded shared line-spacing/tab-stop interfaces require canonicalization next before a genuine EditEngine pool can be certified. Same-agent review is not independent; actual full engine/EditTextObject/Calc pool/model/connected UI/same-model ODS and UI localization remain pending. Final clean calc/hash proof required at closure.

## Rollback Plan

Revert intentional paths through later authorized task; no reset/merge/publication.

## Findings

Ruby labels are actual document content, not localized language/interface names. Use existing shared strings and actual numeric Any; do not duplicate them. The automatic direction addition fits existing paraitem375lines and must not introduce an unnecessary source split. Native diagnostic XML/generated enum type-provider and translated direction labels are unported, no lifetime/destructor/debug/move emulation. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS pending; same-agent review is not independent.

- Observation: Initial related selection passed all behavior tests but whole paraitem owner raw coverage omits existing line-spacing and Asian bool regressions; native interface review also confirms old line-spacing/tab-stop owners remain bounded browser projections.
  Impact: Task154 new values are valid, but strict owner coverage needs existing related tests. A real EditEngine pool cannot be certified until native line-spacing/tab-stop contracts replace those older projections.
  Resolution: Add existing textitem.test.ts and frame-direction.test.ts for full owner coverage; retain initial log, rerun shared only after current Calc completes. Prioritize canonical shared line-spacing/tab-stop work next, without a compatibility shim or fake pool.
