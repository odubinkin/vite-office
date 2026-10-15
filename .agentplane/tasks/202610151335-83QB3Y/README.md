---
id: "202610151335-83QB3Y"
title: "Canonicalize tab-stop values transport and Writer consumers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T13:36:16.687Z"
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
    body: "Start: native tab-stop values, sorted item state and real UNO transport; source numeric-locale behavior and every Writer I/O consumer canonicalized without localization or an ownership manager."
events:
  -
    type: "status"
    at: "2026-10-15T13:36:28.302Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native tab-stop values, sorted item state and real UNO transport; source numeric-locale behavior and every Writer I/O consumer canonicalized without localization or an ownership manager."
doc_version: 3
doc_updated_at: "2026-10-15T15:00:32.377Z"
doc_updated_by: "CODER"
description: "Task156 restores native SvxTabStop and SvxTabStopItem value/container/typed Any contracts, real TabStop/TabAlign IDL bindings and required numeric-locale decimal behavior; reuses SortedVector/CPPU and migrates Writer I/O consumers without retaining a browser persistence facade in shared core."
sections:
  Summary: "Task156 canonicalizes shared native tab-stop values, sorted item state and actual typed transport, with the required decimal-locale semantics and migrated Writer consumers."
  Scope: "At most130intentional non-agent paths: editeng tab values/header/enums/selectors, original offapi style TabStop and TabAlign values, existing CPPU/SortedVector only where required, source-backed minimum numeric-locale providers/data under their actual unotools/i18npool/i18nlangtag boundaries, necessary module dependency records/guards, Writer model/filter/persistence/layout/dialog consumers, direct tests and matched inventory/capability/docs. No translated UI labels, full ICU replacement, new lifetime/refcount/ownership machinery, native compiler/probes or unrelated Writer feature work."
  Plan: "Canonical tab value/item/typed transport and required source numeric-locale behavior, every Writer consumer and inventory within130paths; reuse shared SortedVector/CPPU, no localization/native probes/lifetime machinery. Complete this coherent boundary across continuations rather than creating bookkeeping-only tasks for each declaration."
  Verify Steps: "Pinned tstpitem.hxx/paraitem.cxx/svxenum.hxx/memberids.h, TabStop.idl/TabAlign.idl and actual locale data/provider/fallback behavior are authoritative. Native defaults ten1134Default stops, counted zero-distance deduplication, independent caller/copy/Clone values, defaultDistance signed32 direct setter versus nonnegative UNO property, position-only sorted lookup, replacement and two-pass item merge, Which-independent payload equality and hash omissions preserved. Actual TabStop IDL long Position/enum Alignment/char DecimalChar/FillChar default/copy/assignment/typed metadata and real Sequence/Any transport; enum native generated size sentinel. Typed sequence and nested Any4fields accept native enum or long and char or one-unit OUString fallbacks, extraction failure nonmutation, conversion narrowing/order and duplicate last-wins. MID_TABSTOPS0/MID_STD_TAB1/MID_TABSTOP_DEFAULT_DISTANCE2 and unknown-member success/untouched behavior; first-tab members have original nonempty precondition. Native decimal0 is resolved from system numeric locale, not retained or guessed as dot; probe comparison of all285source locales found230matches and55differences against current Intl, so direct unconditional substitution is rejected. Verify locale resolution/fallback at real provider boundary, original separators and copy stability, without translated language names or fabricated service facades. Writer XML/snapshot/format/ruler/layout/history round trips use core getters/setters and explicit adapters, old snapshots decoded only at I/O. Entire changed/new executable shared owners and all Calc raw S/B/F/L100 with every raw counter positive; related Writer tests and existing relevant browser scenarios, Writer-only coverage gaps exempt. Four references absent during tests/build and restored finally; all13source gates/build/inventory/boundaries and exact130path/pin/hash/clean calc proof. No native compiler/probe. Full all-app suite deferred until genuine minimum connected UI+same-model ODS readiness then applicable fixes/pause per user."
  Verification: |-
    Task156 remains DOING: full native SvxTabStopItem typed Any/copy/merge/hash and moving existing browser JSON APIs to Writer are not yet implemented. This is a verified value/resource checkpoint, not task completion or UI/ODS readiness.

    Command: node output/playwright/task156-checks/portable.mjs; related-only rerun after the source script-field parsing correction, then both suites after the nonvirtual base-value copy correction. Result: pass. Evidence:54related tests/9files and187Calc tests/76files. All7changed/new shared executable owners raw S348/B278/F96/L314 and all33Calc owners S4179/B2731/F821/L3727 are100, every counter positive. Actual source default/copy/assignment/mutable reference/const borrowing/position-only comparison, independent insert/snapshot/Clone and counted zero-spacing deduplication covered. Copying derived getter-hiding values preserves original nonvirtual base fields, not JS virtual getter results. Original payload equality ignores Which. Existing unrelated paragraph-adjustment behavior restored unchanged after detecting an overbroad edit. Actual typed TabStop/TabAlign/Sequence checkpoint retained; no additional ownership/lifetime algorithm. Four source references absent and restored finally.

    Command: all13exact source gate argv in value-source-gates.json; node output/playwright/task156-checks/build-portable.mjs. Result: pass. Evidence:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and41boundary tests, semanticViolationCount0; portable production build exit0 with all4references absent/restored. Scoped native body proof retains all13existing boundary/cycle function bodies; only actual i18npool module/five client/producer edges and a counterguard were added. Failed initial JSDoc, stale Which/enum assertions and Portuguese golden corrected without weakening checks. JSON resources are traced through capability/provider evidence because provenance schema accepts runtime TS modules only; invalid resource-only records removed, failed logs retained. Initial missing build-wrapper invocation did not start a build; actual adapted task154 wrapper succeeded.

    Command: compare-decimal-locales.py, prepare-locale-data.py and source pin audit in value-native-audit.json. Result: pass for the declared numeric field/data scope. Evidence:285original one-UTF16-unit decimal resources (all refs resolved),306language-only fallback results projected from538ISO/91script/14BCP47source rows and actual numeric ID overrides;296native source pins at9bc445578031fecf56086729d8e4940c77e14d65. Current Intl comparison230equal/55different,58unsupported requests explicitly separated from accidental equality after fallback. Native first/language/en_US and non-ISO fallback order retained; CALC134 krm spelling documented and preserved. Browser host binding retains unsupported raw language and normalizes ASCII BCP47 case; Intl provides only the host locale fallback, not decimal data. Prepared Locale field reader uses original ASCII-only case conversion and safe scalar resource lookup. General locale services/LanguageTag construction/canonicalization and localized names are not implemented or claimed; no fake service facade, ICU implementation, C++ generator/compiler/probe or new memory manager.

    Current source hashes,31cumulative intentional paths and pending acceptance are tracked by value-stage-verification.json/value-stage-source-hashes.json, to be refreshed at the checkpoint commit. No quality pass, verify, finish, full all-app regression or goal pause is claimed; complete this same approved130path boundary next, then resume actual UI/ODS-critical Calc model dependencies.
  Rollback Plan: "Revert only task intentional changes and lifecycle artifacts, preserve unrelated tasks/user merges; no destructive history operations."
  Findings: |-
    Preflight clean calc at38822fdd9e9074dca7daf5a717bb26537f073d13. Existing tab values retain unresolved nul decimal, readonly fields, caller aliases and Which-sensitive equality; shared JSON constructors/projection mix browser persistence with native core. Native requires genuine SortedVector reuse and value copies, typed sequence transport, decimal resolution and distinct direct/UNO distance constraints. Read-only comparison resolved all285LC_CTYPE source decimal values including aliases;230matched current Node Intl and55differed, including fr-CH native dot versus Intl comma, lo-LA native dot versus Intl comma, ar-OM native dot versus Intl Arabic separator. Some requested locales fell back to en-US in Intl, distinct from support detection. This does not justify implementing ICU or interface localization; source numeric data and native locale fallback must be honored at the provider boundary. Existing Sequence/Any are available and must be reused without introducing another memory manager. One CODER task owns the complete coherent boundary; do not close after adding IDL declarations alone.

    - Observation: First real Sequence<TabStop> extraction test supplied an uninitialized null handle instead of an initialized Sequence object lvalue; generic C assignment correctly attempted to replace the prior value.
      Impact: Existing shared Sequence needs an explicit erased C++ object-address binding for Any extraction; copying into a detached raw handle would not update its original value owner.
      Resolution: Expose the existing sole pointer cell through a documented getAddress compiler binding, without allocating another owner or changing lifetime/counter algorithms. Test extraction into a normal constructed Sequence; include existing Sequence tests in whole-owner coverage.

    - Observation: Checkpoint: actual TabStop/TabAlign IDL bindings and initialized Sequence object-address syntax now pass9tests/3files; whole3shared runtime owners raw S108/B54/F41/L103100. Full native tab item and locale/Writer migration remain pending.
      Impact: Real typed transport dependency is implemented and source inventory updated, without adding another allocator/counter/lifetime engine. This is not task completion or Calc UI/ODS readiness.
      Resolution: Continue same task156 at source numeric-locale providers/fallback and SvxTabStop/SvxTabStopItem; retain complete130path acceptance contract and run whole Calc/build/browser/final gates only when the approved boundary is ready. Preliminary docs/lint type-only fixture issues fixed; inventory/provenance/size/typecheck pass.

    - Observation: Native tab values now use independent scalar-reference cells and SortedVector value-copy insertion; numeric resource binding embeds285source decimal fields and306source language fallback projections. Initial scoped run32passed/3failed.
      Impact: Two failures are old Which-sensitive equality and enum-range assertions; one new golden mistakenly expected Portuguese dot despite the source comma. Initial typecheck failures were native const-reference input typing and using JS strings directly in OUString constructors.
      Resolution: Keep source payload equality and integer enum admission, correct Portuguese golden from native resource, accept const borrowed tab inputs and use actual known-length OUString construction. No fake locale-service or lifetime facade; full transport/Writer migration still pending.

    - Observation: Resource provenance records were rejected because the canonical provenance schema accepts runtime TypeScript modules, not JSON assets. A build invocation also referenced a nonexistent task155 standalone wrapper before any build started.
      Impact: No implementation or verification criteria change is needed; data files remain explicit capability/provider evidence with296source pins. No build result was claimed.
      Resolution: Remove only the two newly created invalid resource-only provenance records, keep resource paths in the existing capability/provider evidence and use the existing task154 portable build wrapper adapted to task156. Preserve failed logs and rerun only affected gates/build.

    - Observation: Value/resource checkpoint passes54related/187Calc/41boundary tests, raw100 for7shared/33Calc owners, all13gates/build and296source pins. Nonvirtual native value-copy semantics, real locale data, ASCII-only lookup/case and numeric variant/script distinction are corrected.
      Impact: Writer now reuses real resolved decimal defaults and independent sorted tab values. No general locale service/LanguageTag facade or translated UI names added. Native SvxTabStopItem typed transport/merge/hash and explicit Writer persistence migration still require completion within this task.
      Resolution: Keep task156 DOING and preserve complete acceptance scope. Resource JSON is recorded as capability/provider evidence under existing inventory schema, not by relaxing runtime provenance. After completing tab contracts, audit actual ScDocumentPool/model UI+ODS blockers instead of unrelated Writer features or localization. Keep user full-run readiness/pause rule.
id_source: "generated"
---
## Summary

Task156 canonicalizes shared native tab-stop values, sorted item state and actual typed transport, with the required decimal-locale semantics and migrated Writer consumers.

## Scope

At most130intentional non-agent paths: editeng tab values/header/enums/selectors, original offapi style TabStop and TabAlign values, existing CPPU/SortedVector only where required, source-backed minimum numeric-locale providers/data under their actual unotools/i18npool/i18nlangtag boundaries, necessary module dependency records/guards, Writer model/filter/persistence/layout/dialog consumers, direct tests and matched inventory/capability/docs. No translated UI labels, full ICU replacement, new lifetime/refcount/ownership machinery, native compiler/probes or unrelated Writer feature work.

## Plan

Canonical tab value/item/typed transport and required source numeric-locale behavior, every Writer consumer and inventory within130paths; reuse shared SortedVector/CPPU, no localization/native probes/lifetime machinery. Complete this coherent boundary across continuations rather than creating bookkeeping-only tasks for each declaration.

## Verify Steps

Pinned tstpitem.hxx/paraitem.cxx/svxenum.hxx/memberids.h, TabStop.idl/TabAlign.idl and actual locale data/provider/fallback behavior are authoritative. Native defaults ten1134Default stops, counted zero-distance deduplication, independent caller/copy/Clone values, defaultDistance signed32 direct setter versus nonnegative UNO property, position-only sorted lookup, replacement and two-pass item merge, Which-independent payload equality and hash omissions preserved. Actual TabStop IDL long Position/enum Alignment/char DecimalChar/FillChar default/copy/assignment/typed metadata and real Sequence/Any transport; enum native generated size sentinel. Typed sequence and nested Any4fields accept native enum or long and char or one-unit OUString fallbacks, extraction failure nonmutation, conversion narrowing/order and duplicate last-wins. MID_TABSTOPS0/MID_STD_TAB1/MID_TABSTOP_DEFAULT_DISTANCE2 and unknown-member success/untouched behavior; first-tab members have original nonempty precondition. Native decimal0 is resolved from system numeric locale, not retained or guessed as dot; probe comparison of all285source locales found230matches and55differences against current Intl, so direct unconditional substitution is rejected. Verify locale resolution/fallback at real provider boundary, original separators and copy stability, without translated language names or fabricated service facades. Writer XML/snapshot/format/ruler/layout/history round trips use core getters/setters and explicit adapters, old snapshots decoded only at I/O. Entire changed/new executable shared owners and all Calc raw S/B/F/L100 with every raw counter positive; related Writer tests and existing relevant browser scenarios, Writer-only coverage gaps exempt. Four references absent during tests/build and restored finally; all13source gates/build/inventory/boundaries and exact130path/pin/hash/clean calc proof. No native compiler/probe. Full all-app suite deferred until genuine minimum connected UI+same-model ODS readiness then applicable fixes/pause per user.

## Verification

Task156 remains DOING: full native SvxTabStopItem typed Any/copy/merge/hash and moving existing browser JSON APIs to Writer are not yet implemented. This is a verified value/resource checkpoint, not task completion or UI/ODS readiness.

Command: node output/playwright/task156-checks/portable.mjs; related-only rerun after the source script-field parsing correction, then both suites after the nonvirtual base-value copy correction. Result: pass. Evidence:54related tests/9files and187Calc tests/76files. All7changed/new shared executable owners raw S348/B278/F96/L314 and all33Calc owners S4179/B2731/F821/L3727 are100, every counter positive. Actual source default/copy/assignment/mutable reference/const borrowing/position-only comparison, independent insert/snapshot/Clone and counted zero-spacing deduplication covered. Copying derived getter-hiding values preserves original nonvirtual base fields, not JS virtual getter results. Original payload equality ignores Which. Existing unrelated paragraph-adjustment behavior restored unchanged after detecting an overbroad edit. Actual typed TabStop/TabAlign/Sequence checkpoint retained; no additional ownership/lifetime algorithm. Four source references absent and restored finally.

Command: all13exact source gate argv in value-source-gates.json; node output/playwright/task156-checks/build-portable.mjs. Result: pass. Evidence:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and41boundary tests, semanticViolationCount0; portable production build exit0 with all4references absent/restored. Scoped native body proof retains all13existing boundary/cycle function bodies; only actual i18npool module/five client/producer edges and a counterguard were added. Failed initial JSDoc, stale Which/enum assertions and Portuguese golden corrected without weakening checks. JSON resources are traced through capability/provider evidence because provenance schema accepts runtime TS modules only; invalid resource-only records removed, failed logs retained. Initial missing build-wrapper invocation did not start a build; actual adapted task154 wrapper succeeded.

Command: compare-decimal-locales.py, prepare-locale-data.py and source pin audit in value-native-audit.json. Result: pass for the declared numeric field/data scope. Evidence:285original one-UTF16-unit decimal resources (all refs resolved),306language-only fallback results projected from538ISO/91script/14BCP47source rows and actual numeric ID overrides;296native source pins at9bc445578031fecf56086729d8e4940c77e14d65. Current Intl comparison230equal/55different,58unsupported requests explicitly separated from accidental equality after fallback. Native first/language/en_US and non-ISO fallback order retained; CALC134 krm spelling documented and preserved. Browser host binding retains unsupported raw language and normalizes ASCII BCP47 case; Intl provides only the host locale fallback, not decimal data. Prepared Locale field reader uses original ASCII-only case conversion and safe scalar resource lookup. General locale services/LanguageTag construction/canonicalization and localized names are not implemented or claimed; no fake service facade, ICU implementation, C++ generator/compiler/probe or new memory manager.

Current source hashes,31cumulative intentional paths and pending acceptance are tracked by value-stage-verification.json/value-stage-source-hashes.json, to be refreshed at the checkpoint commit. No quality pass, verify, finish, full all-app regression or goal pause is claimed; complete this same approved130path boundary next, then resume actual UI/ODS-critical Calc model dependencies.

## Rollback Plan

Revert only task intentional changes and lifecycle artifacts, preserve unrelated tasks/user merges; no destructive history operations.

## Findings

Preflight clean calc at38822fdd9e9074dca7daf5a717bb26537f073d13. Existing tab values retain unresolved nul decimal, readonly fields, caller aliases and Which-sensitive equality; shared JSON constructors/projection mix browser persistence with native core. Native requires genuine SortedVector reuse and value copies, typed sequence transport, decimal resolution and distinct direct/UNO distance constraints. Read-only comparison resolved all285LC_CTYPE source decimal values including aliases;230matched current Node Intl and55differed, including fr-CH native dot versus Intl comma, lo-LA native dot versus Intl comma, ar-OM native dot versus Intl Arabic separator. Some requested locales fell back to en-US in Intl, distinct from support detection. This does not justify implementing ICU or interface localization; source numeric data and native locale fallback must be honored at the provider boundary. Existing Sequence/Any are available and must be reused without introducing another memory manager. One CODER task owns the complete coherent boundary; do not close after adding IDL declarations alone.

- Observation: First real Sequence<TabStop> extraction test supplied an uninitialized null handle instead of an initialized Sequence object lvalue; generic C assignment correctly attempted to replace the prior value.
  Impact: Existing shared Sequence needs an explicit erased C++ object-address binding for Any extraction; copying into a detached raw handle would not update its original value owner.
  Resolution: Expose the existing sole pointer cell through a documented getAddress compiler binding, without allocating another owner or changing lifetime/counter algorithms. Test extraction into a normal constructed Sequence; include existing Sequence tests in whole-owner coverage.

- Observation: Checkpoint: actual TabStop/TabAlign IDL bindings and initialized Sequence object-address syntax now pass9tests/3files; whole3shared runtime owners raw S108/B54/F41/L103100. Full native tab item and locale/Writer migration remain pending.
  Impact: Real typed transport dependency is implemented and source inventory updated, without adding another allocator/counter/lifetime engine. This is not task completion or Calc UI/ODS readiness.
  Resolution: Continue same task156 at source numeric-locale providers/fallback and SvxTabStop/SvxTabStopItem; retain complete130path acceptance contract and run whole Calc/build/browser/final gates only when the approved boundary is ready. Preliminary docs/lint type-only fixture issues fixed; inventory/provenance/size/typecheck pass.

- Observation: Native tab values now use independent scalar-reference cells and SortedVector value-copy insertion; numeric resource binding embeds285source decimal fields and306source language fallback projections. Initial scoped run32passed/3failed.
  Impact: Two failures are old Which-sensitive equality and enum-range assertions; one new golden mistakenly expected Portuguese dot despite the source comma. Initial typecheck failures were native const-reference input typing and using JS strings directly in OUString constructors.
  Resolution: Keep source payload equality and integer enum admission, correct Portuguese golden from native resource, accept const borrowed tab inputs and use actual known-length OUString construction. No fake locale-service or lifetime facade; full transport/Writer migration still pending.

- Observation: Resource provenance records were rejected because the canonical provenance schema accepts runtime TypeScript modules, not JSON assets. A build invocation also referenced a nonexistent task155 standalone wrapper before any build started.
  Impact: No implementation or verification criteria change is needed; data files remain explicit capability/provider evidence with296source pins. No build result was claimed.
  Resolution: Remove only the two newly created invalid resource-only provenance records, keep resource paths in the existing capability/provider evidence and use the existing task154 portable build wrapper adapted to task156. Preserve failed logs and rerun only affected gates/build.

- Observation: Value/resource checkpoint passes54related/187Calc/41boundary tests, raw100 for7shared/33Calc owners, all13gates/build and296source pins. Nonvirtual native value-copy semantics, real locale data, ASCII-only lookup/case and numeric variant/script distinction are corrected.
  Impact: Writer now reuses real resolved decimal defaults and independent sorted tab values. No general locale service/LanguageTag facade or translated UI names added. Native SvxTabStopItem typed transport/merge/hash and explicit Writer persistence migration still require completion within this task.
  Resolution: Keep task156 DOING and preserve complete acceptance scope. Resource JSON is recorded as capability/provider evidence under existing inventory schema, not by relaxing runtime provenance. After completing tab contracts, audit actual ScDocumentPool/model UI+ODS blockers instead of unrelated Writer features or localization. Keep user full-run readiness/pause rule.
