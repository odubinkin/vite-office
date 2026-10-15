---
id: "202610151237-FB9217"
title: "Implement native ruby autodirection and empty text feature values"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-10-15T12:38:47.901Z"
doc_updated_by: "CODER"
description: "Task154 ports actual SvxRubyItem, SvxAutoFrameDirectionItem and SfxVoidItem default dependencies on existing OUString/bool/pool owners. Full ruby text/numeric Any and native literal presentations, original declarations/defaults, no localization/provider/lifetime facade."
sections:
  Summary: "Task154 implements genuine ruby annotation, automatic paragraph direction and empty tab/line-break item values needed by the actual EditEngine package."
  Scope: "At most36intentional non-agent paths: canonical rubyitem/voiditem source and public headers, automatic-direction class in existing375line paraitem.ts with canonical autodiritem header, actual RubyAdjust enum/RubyPosition constants and native ruby selectors; direct related tests, matched inventory/capability and calc-core docs. Reuse existing OUString const-reference/copy/Any and bool/item bases; no new memory/move manager or provider facade. Original locale-independent ruby content and literal Void presentation included, translated automatic-direction presentation deferred."
  Plan: "Port3actual remaining EditEngine defaults with shared strings/bool/item contracts, full ruby/void core behavior and declarations, strict raw100 related/shared/Calc and scoped source/build/native inventory audits within36paths; localized direction labels/providers deferred."
  Verify Steps: "Read native rubyitem.hxx/cxx, voiditem.hxx/cxx, autodiritem.hxx/paraitem.cxx and actual IDL/member/default declarations. Ruby empty/LEFT/ABOVE, independent copied text/Clone, stable borrowed const text, self assignment and embedded nul/surrogate units; direct enum/short setters preserve native argument casts while property adjustment admits only LEFT..INDENT_BLOCK, position accepts every short. Typed real Any string uses original pData address/extraction, all3query/write selectors and byte/twips aliases; legacy charstyle/above/unknown members false unchanged, wrong types/ranges nonmutating, no invented no-argument projection. Locale-independent GetPresentation copies content. Void default0, copied Which/source unchanged for native named-rvalue copy, empty payload equality excluding Which but exact type/areSame identity and state-sentinel distinction, real clone object, literal Void output and inherited unsupported Query/Put/no-op metrics. Direction actual bool/copy/Clone native true4041 default, ruby4074 and feature4078/4079 default witnesses without a pool facade. RubyAdjust5IDL values plus original generated size sentinel and3RubyPosition constants verified; no enum type-provider claim. Whole6new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; relevant paragraph/bool/enum/itemset/Any/string tests, Writer-only coverage gaps exempt. Four links absent for tests/build restored finally; all13source gates incl40boundary cases/inventory zero violations, exact36path bound/pins/hashes/clean calc. No native compiler/probe. Full all-app suite only on actual minimum connected UI+same-model ODS then applicable fixes/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert intentional paths through later authorized task; no reset/merge/publication."
  Findings: "Ruby labels are actual document content, not localized language/interface names. Use existing shared strings and actual numeric Any; do not duplicate them. The automatic direction addition fits existing paraitem375lines and must not introduce an unnecessary source split. Native diagnostic XML/generated enum type-provider and translated direction labels are unported, no lifetime/destructor/debug/move emulation. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS pending; same-agent review is not independent."
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

Pending execution.

## Rollback Plan

Revert intentional paths through later authorized task; no reset/merge/publication.

## Findings

Ruby labels are actual document content, not localized language/interface names. Use existing shared strings and actual numeric Any; do not duplicate them. The automatic direction addition fits existing paraitem375lines and must not introduce an unnecessary source split. Native diagnostic XML/generated enum type-provider and translated direction labels are unported, no lifetime/destructor/debug/move emulation. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS pending; same-agent review is not independent.
