---
id: "202610141556-8TJGNR"
title: "Restore canonical shared font-family attribute state and migrate Writer consumers"
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
  updated_at: "2026-10-14T15:57:05.680Z"
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
    body: "Start: restore canonical shared font attribute and migrate actual Writer consumers under explicit human authorization; no duplicate or compatibility item."
events:
  -
    type: "status"
    at: "2026-10-14T15:57:16.976Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore canonical shared font attribute and migrate actual Writer consumers under explicit human authorization; no duplicate or compatibility item."
doc_version: 3
doc_updated_at: "2026-10-14T15:57:16.976Z"
doc_updated_by: "CODER"
description: "Task135: source-faithful SvxFontItem value fields/constructors/default/copy/get-set/equality/hash/clone, shared FontFamily/FontPitch and charset declarations, exact Calc100/111/116 IDs and owned defaults tests; remove item-local resolved/generic CSS state and migrate Writer/filter/browser snapshot consumers to canonical state. Native Any FontDescriptor transport remains separately unported, no fake helper/lifecycle. Standing human shared/Writer canonical correction authorization and UI/ODS priority."
sections:
  Summary: "Task135 restores source-faithful shared SvxFontItem value state required by ScDocPool and removes non-native resolved/generic CSS fields. Reuse the one shared class and migrate actual Writer/browser/ODT/history consumers. Explicit human authorization permits canonical shared/Writer fixes; native JS immutable strings adapt OUString character values at this existing browser item boundary, without a new lifetime engine. Only calc checkout/branch."
  Scope: "At most100paths, expected about50-75 including inventory: existing textitem font body moved into canonical textitem.font.ts native shard plus fontitem.ts header; tools FontFamily/FontPitch and SAL textenc numeric declarations; native font item tests, all materially affected Writer/filter/browser constructors/readers/snapshots/tests; canonical ODF generic-family mapping in shared xmloff if needed; existing native font default device adapter corrected where it stored resolution in the item; Calc100/111/116 declarations/default tests. Exact affected runtime/provenance/capability records, dependency ownership tests and calc-core progress. No duplicate font item, legacy compatibility fields/constructor, fake font discovery, C++ generation/build/native probes or new memory machinery. Native Any FontDescriptor transport and full font/device/config services remain explicit pending rather than stubbed."
  Plan: "Task135: restore one native shared font-family value owner, original family/pitch/charset declarations, full field constructors/default/copy/get-set/clone/equality/hash; remove non-native item-local CSS/device fields and migrate actual Writer/ODT/history/browser consumers and relevant tests. Calc100/111/116 real item-set default ownership. Scope100paths incl exact inventory, expected50-75. Strict changedshared/Calc100; Writer-only coverage exemption, related browser/build if needed;12gates/boundaries/nativepins/exactsource clean. No C++/memory engine or fake Any FontDescriptor; full UI/ODS checkpoint still pending. Standing human shared/Writer canonical correction authorization."
  Verify Steps: "Source-faithful native font defaults empty names/FAMILY_SWISS/PITCH_VARIABLE/DONTKNOW and Which0default, all native value ctor fields, valid empty/whitespace strings, independent copy/clone, idempotent and changed setters, all5field equality and native hash order including Which. Actual enum/encoding values and JS UTF16 string hash must use existing SAL/o3tl mechanisms, no replacement hash library or binary layout claim. Browser snapshot keeps all fields across item-codec/SwAttrPool/history; ODT family/pitch/name/style mapping reflects native enums and retains relevant document properties, no item-local resolved CSS metadata. Writer default device presentation and stored value behavior source-reviewed; actual generic-family mapping source-reviewed. Materially related tests and narrow browser formatting/ODT cases pass. Strict raw S/B/F/L100 and every raw counter positive for all changed shared executable owners; npm run test:coverage:calc100,4native links absent/restoredfinally. Writer-only uncovered counters are reported and left unchanged per explicit human exemption; no threshold or counter-map change.12format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates and boundaries. Exact task allowlist/nativepins/sourcehashes/final clean calc. Native FontDescriptor Any, full services/rendering/font discovery/ABI/full UI/ODS remain unverified, no full-checkpoint claim."
  Verification: "Pending."
  Rollback Plan: "Revert only this task intentional changes in a later authorized task; never reset unrelated work, merge or publish."
  Findings: "Previous turn134 yielded evidence-driven deferral of unused weak lifetime machinery, preserving1912app files and documenting full UNO component as pending. Preflight clean calc7dedb33c. Current shared SvxFontItem stores familyName/resolvedFamilyName/genericFamily, rejects native-valid blank strings, lacks original style/family/pitch/charset/default/setters/hash and has only non-native constructor.23affected source/test files identified, bounded wider migration genuinely necessary; explicit human permits fixing Writer rather than compatibility hacks. Native JS strings at existing item boundary preserve immutable Unicode values; full shared CPPU Any FontDescriptor object storage remains a separate actual dependency and must not be faked. Same-agent EVALUATOR not independent. No subagents authorized."
id_source: "generated"
---
## Summary

Task135 restores source-faithful shared SvxFontItem value state required by ScDocPool and removes non-native resolved/generic CSS fields. Reuse the one shared class and migrate actual Writer/browser/ODT/history consumers. Explicit human authorization permits canonical shared/Writer fixes; native JS immutable strings adapt OUString character values at this existing browser item boundary, without a new lifetime engine. Only calc checkout/branch.

## Scope

At most100paths, expected about50-75 including inventory: existing textitem font body moved into canonical textitem.font.ts native shard plus fontitem.ts header; tools FontFamily/FontPitch and SAL textenc numeric declarations; native font item tests, all materially affected Writer/filter/browser constructors/readers/snapshots/tests; canonical ODF generic-family mapping in shared xmloff if needed; existing native font default device adapter corrected where it stored resolution in the item; Calc100/111/116 declarations/default tests. Exact affected runtime/provenance/capability records, dependency ownership tests and calc-core progress. No duplicate font item, legacy compatibility fields/constructor, fake font discovery, C++ generation/build/native probes or new memory machinery. Native Any FontDescriptor transport and full font/device/config services remain explicit pending rather than stubbed.

## Plan

Task135: restore one native shared font-family value owner, original family/pitch/charset declarations, full field constructors/default/copy/get-set/clone/equality/hash; remove non-native item-local CSS/device fields and migrate actual Writer/ODT/history/browser consumers and relevant tests. Calc100/111/116 real item-set default ownership. Scope100paths incl exact inventory, expected50-75. Strict changedshared/Calc100; Writer-only coverage exemption, related browser/build if needed;12gates/boundaries/nativepins/exactsource clean. No C++/memory engine or fake Any FontDescriptor; full UI/ODS checkpoint still pending. Standing human shared/Writer canonical correction authorization.

## Verify Steps

Source-faithful native font defaults empty names/FAMILY_SWISS/PITCH_VARIABLE/DONTKNOW and Which0default, all native value ctor fields, valid empty/whitespace strings, independent copy/clone, idempotent and changed setters, all5field equality and native hash order including Which. Actual enum/encoding values and JS UTF16 string hash must use existing SAL/o3tl mechanisms, no replacement hash library or binary layout claim. Browser snapshot keeps all fields across item-codec/SwAttrPool/history; ODT family/pitch/name/style mapping reflects native enums and retains relevant document properties, no item-local resolved CSS metadata. Writer default device presentation and stored value behavior source-reviewed; actual generic-family mapping source-reviewed. Materially related tests and narrow browser formatting/ODT cases pass. Strict raw S/B/F/L100 and every raw counter positive for all changed shared executable owners; npm run test:coverage:calc100,4native links absent/restoredfinally. Writer-only uncovered counters are reported and left unchanged per explicit human exemption; no threshold or counter-map change.12format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates and boundaries. Exact task allowlist/nativepins/sourcehashes/final clean calc. Native FontDescriptor Any, full services/rendering/font discovery/ABI/full UI/ODS remain unverified, no full-checkpoint claim.

## Verification

Pending.

## Rollback Plan

Revert only this task intentional changes in a later authorized task; never reset unrelated work, merge or publish.

## Findings

Previous turn134 yielded evidence-driven deferral of unused weak lifetime machinery, preserving1912app files and documenting full UNO component as pending. Preflight clean calc7dedb33c. Current shared SvxFontItem stores familyName/resolvedFamilyName/genericFamily, rejects native-valid blank strings, lacks original style/family/pitch/charset/default/setters/hash and has only non-native constructor.23affected source/test files identified, bounded wider migration genuinely necessary; explicit human permits fixing Writer rather than compatibility hacks. Native JS strings at existing item boundary preserve immutable Unicode values; full shared CPPU Any FontDescriptor object storage remains a separate actual dependency and must not be faked. Same-agent EVALUATOR not independent. No subagents authorized.
