---
id: "202610151335-83QB3Y"
title: "Canonicalize tab-stop values transport and Writer consumers"
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
doc_updated_at: "2026-10-15T13:36:28.302Z"
doc_updated_by: "CODER"
description: "Task156 restores native SvxTabStop and SvxTabStopItem value/container/typed Any contracts, real TabStop/TabAlign IDL bindings and required numeric-locale decimal behavior; reuses SortedVector/CPPU and migrates Writer I/O consumers without retaining a browser persistence facade in shared core."
sections:
  Summary: "Task156 canonicalizes shared native tab-stop values, sorted item state and actual typed transport, with the required decimal-locale semantics and migrated Writer consumers."
  Scope: "At most130intentional non-agent paths: editeng tab values/header/enums/selectors, original offapi style TabStop and TabAlign values, existing CPPU/SortedVector only where required, source-backed minimum numeric-locale providers/data under their actual unotools/i18npool/i18nlangtag boundaries, necessary module dependency records/guards, Writer model/filter/persistence/layout/dialog consumers, direct tests and matched inventory/capability/docs. No translated UI labels, full ICU replacement, new lifetime/refcount/ownership machinery, native compiler/probes or unrelated Writer feature work."
  Plan: "Canonical tab value/item/typed transport and required source numeric-locale behavior, every Writer consumer and inventory within130paths; reuse shared SortedVector/CPPU, no localization/native probes/lifetime machinery. Complete this coherent boundary across continuations rather than creating bookkeeping-only tasks for each declaration."
  Verify Steps: "Pinned tstpitem.hxx/paraitem.cxx/svxenum.hxx/memberids.h, TabStop.idl/TabAlign.idl and actual locale data/provider/fallback behavior are authoritative. Native defaults ten1134Default stops, counted zero-distance deduplication, independent caller/copy/Clone values, defaultDistance signed32 direct setter versus nonnegative UNO property, position-only sorted lookup, replacement and two-pass item merge, Which-independent payload equality and hash omissions preserved. Actual TabStop IDL long Position/enum Alignment/char DecimalChar/FillChar default/copy/assignment/typed metadata and real Sequence/Any transport; enum native generated size sentinel. Typed sequence and nested Any4fields accept native enum or long and char or one-unit OUString fallbacks, extraction failure nonmutation, conversion narrowing/order and duplicate last-wins. MID_TABSTOPS0/MID_STD_TAB1/MID_TABSTOP_DEFAULT_DISTANCE2 and unknown-member success/untouched behavior; first-tab members have original nonempty precondition. Native decimal0 is resolved from system numeric locale, not retained or guessed as dot; probe comparison of all285source locales found230matches and55differences against current Intl, so direct unconditional substitution is rejected. Verify locale resolution/fallback at real provider boundary, original separators and copy stability, without translated language names or fabricated service facades. Writer XML/snapshot/format/ruler/layout/history round trips use core getters/setters and explicit adapters, old snapshots decoded only at I/O. Entire changed/new executable shared owners and all Calc raw S/B/F/L100 with every raw counter positive; related Writer tests and existing relevant browser scenarios, Writer-only coverage gaps exempt. Four references absent during tests/build and restored finally; all13source gates/build/inventory/boundaries and exact130path/pin/hash/clean calc proof. No native compiler/probe. Full all-app suite deferred until genuine minimum connected UI+same-model ODS readiness then applicable fixes/pause per user."
  Verification: "Pending complete approved boundary implementation; type-binding work alone does not complete the task."
  Rollback Plan: "Revert only task intentional changes and lifecycle artifacts, preserve unrelated tasks/user merges; no destructive history operations."
  Findings: "Preflight clean calc at38822fdd9e9074dca7daf5a717bb26537f073d13. Existing tab values retain unresolved nul decimal, readonly fields, caller aliases and Which-sensitive equality; shared JSON constructors/projection mix browser persistence with native core. Native requires genuine SortedVector reuse and value copies, typed sequence transport, decimal resolution and distinct direct/UNO distance constraints. Read-only comparison resolved all285LC_CTYPE source decimal values including aliases;230matched current Node Intl and55differed, including fr-CH native dot versus Intl comma, lo-LA native dot versus Intl comma, ar-OM native dot versus Intl Arabic separator. Some requested locales fell back to en-US in Intl, distinct from support detection. This does not justify implementing ICU or interface localization; source numeric data and native locale fallback must be honored at the provider boundary. Existing Sequence/Any are available and must be reused without introducing another memory manager. One CODER task owns the complete coherent boundary; do not close after adding IDL declarations alone."
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

Pending complete approved boundary implementation; type-binding work alone does not complete the task.

## Rollback Plan

Revert only task intentional changes and lifecycle artifacts, preserve unrelated tasks/user merges; no destructive history operations.

## Findings

Preflight clean calc at38822fdd9e9074dca7daf5a717bb26537f073d13. Existing tab values retain unresolved nul decimal, readonly fields, caller aliases and Which-sensitive equality; shared JSON constructors/projection mix browser persistence with native core. Native requires genuine SortedVector reuse and value copies, typed sequence transport, decimal resolution and distinct direct/UNO distance constraints. Read-only comparison resolved all285LC_CTYPE source decimal values including aliases;230matched current Node Intl and55differed, including fr-CH native dot versus Intl comma, lo-LA native dot versus Intl comma, ar-OM native dot versus Intl Arabic separator. Some requested locales fell back to en-US in Intl, distinct from support detection. This does not justify implementing ICU or interface localization; source numeric data and native locale fallback must be honored at the provider boundary. Existing Sequence/Any are available and must be reused without introducing another memory manager. One CODER task owns the complete coherent boundary; do not close after adding IDL declarations alone.
