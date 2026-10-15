---
id: "202610151314-G0840M"
title: "Canonicalize shared line spacing and Writer consumers"
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
  updated_at: "2026-10-15T13:15:00.315Z"
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
    body: "Start: canonical shared five-field line spacing, real typed Any transport and all Writer model/filter/persistence/layout/dialog consumers; source-backed native quirks retained."
events:
  -
    type: "status"
    at: "2026-10-15T13:15:08.183Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: canonical shared five-field line spacing, real typed Any transport and all Writer model/filter/persistence/layout/dialog consumers; source-backed native quirks retained."
doc_version: 3
doc_updated_at: "2026-10-15T13:15:08.183Z"
doc_updated_by: "CODER"
description: "Task155 restores the native five-field SvxLineSpacingItem and real LineSpacing UNO value, migrates Writer model/filter/persistence/layout/UI consumers, removes wrongly-owned font-independent paragraph state, and verifies scoped portable fidelity without localization or native probes."
sections:
  Summary: "Restore native shared five-field line spacing and migrate Writer consumers including ODF, persistence and paragraph UI."
  Scope: "At most110 intentional non-agent paths within editeng, offapi style IDL values, svl member identifiers, Writer model/layout/filter/persistence/dialog code and direct related tests, matched runtime/provenance/capability/inventory records and calc-core documentation. Five native fields, canonical public lspcitem header, real typed Any struct and numeric selectors. Remove incorrect Writer font-independent paragraph property while preserving generic Drawing XML parsing. No tab-stop refactor, localization, lifetime manager, native compiler/probes or unrelated modules."
  Plan: "One cohesive CODER boundary: native shared line-spacing state/typed Any, every Writer model/filter/persistence/layout/dialog consumer, source quirks/inventory and scoped raw100 verification within110paths. Reuse actual shared CPPU and JS GC, no localization/native probes; full suite only actual UI+ODS readiness then pause."
  Verify Steps: "Audit pinned lspcitem.hxx/paraitem.cxx/svxenum.hxx/LineSpacing IDL and selectors MID_LINESPACE59/MID_HEIGHT6. Test defaults 200/0/100/Auto/Off, original setter side effects and signed16/unsigned16 casts, copied identities and independent Clone, inactive-field equality and all-field hash, typed Any struct/short transport, twips conversion and cast order, unknown selectors and modes, extraction failure nonmutation and native inherited metrics. Real CPPU struct default/copy/assignment/short fields and normal member lvalues, not binary persistence. Writer defaults use height200, proportional commands set the actual percentage/rule; all four layout modes and zero/default behavior, format dispatch and ODF reopen remain coherent. Browser persistence serializes all five raw fields and accepts prior scalar/tuple inputs at the adapter only; remove font-independent state from Writer imports/exports/projection/dialog while generic Drawing XML support remains. Existing scoped Writer formatting browser tests, related model/filter/layout/UI tests, whole changed/new executable shared owners and all Calc every raw S/B/F/L counter positive100; Writer-only coverage gaps exempt. References absent during tests/build and restored finally. All13 source gates including inventory/provenance/boundary/format/lint/typecheck/size/docs/routing/doctor and portable production build; native pins, exact110path bound and tracked non-agent hashes. Full all-app run deferred until genuine minimum connected UI and same-model ODS readiness, then applicable fixes and pause per user."
  Verification: "Pending scoped implementation and acceptance evidence."
  Rollback Plan: "Revert only this task intentional source commit and lifecycle artifacts; preserve unrelated tasks and user merges. No destructive history changes."
  Findings: |-
    User explicitly authorizes canonical shared and Writer corrections; localization is deferred. Existing five-field item was reduced to a browser value/mode/font flag and must be replaced without a core compatibility facade. Prior turn established native source ownership; authoritative state revalidated clean calc at12789879e97f353f7d1dc829a9108970901d328e.

    - Observation: Plan approval rejected because full-doc Summary used a level-one heading.
      Impact: No execution or source mutation occurred.
      Resolution: Populate canonical Summary section through the lifecycle CLI, then repeat approval.
id_source: "generated"
---
## Summary

Restore native shared five-field line spacing and migrate Writer consumers including ODF, persistence and paragraph UI.

## Scope

At most110 intentional non-agent paths within editeng, offapi style IDL values, svl member identifiers, Writer model/layout/filter/persistence/dialog code and direct related tests, matched runtime/provenance/capability/inventory records and calc-core documentation. Five native fields, canonical public lspcitem header, real typed Any struct and numeric selectors. Remove incorrect Writer font-independent paragraph property while preserving generic Drawing XML parsing. No tab-stop refactor, localization, lifetime manager, native compiler/probes or unrelated modules.

## Plan

One cohesive CODER boundary: native shared line-spacing state/typed Any, every Writer model/filter/persistence/layout/dialog consumer, source quirks/inventory and scoped raw100 verification within110paths. Reuse actual shared CPPU and JS GC, no localization/native probes; full suite only actual UI+ODS readiness then pause.

## Verify Steps

Audit pinned lspcitem.hxx/paraitem.cxx/svxenum.hxx/LineSpacing IDL and selectors MID_LINESPACE59/MID_HEIGHT6. Test defaults 200/0/100/Auto/Off, original setter side effects and signed16/unsigned16 casts, copied identities and independent Clone, inactive-field equality and all-field hash, typed Any struct/short transport, twips conversion and cast order, unknown selectors and modes, extraction failure nonmutation and native inherited metrics. Real CPPU struct default/copy/assignment/short fields and normal member lvalues, not binary persistence. Writer defaults use height200, proportional commands set the actual percentage/rule; all four layout modes and zero/default behavior, format dispatch and ODF reopen remain coherent. Browser persistence serializes all five raw fields and accepts prior scalar/tuple inputs at the adapter only; remove font-independent state from Writer imports/exports/projection/dialog while generic Drawing XML support remains. Existing scoped Writer formatting browser tests, related model/filter/layout/UI tests, whole changed/new executable shared owners and all Calc every raw S/B/F/L counter positive100; Writer-only coverage gaps exempt. References absent during tests/build and restored finally. All13 source gates including inventory/provenance/boundary/format/lint/typecheck/size/docs/routing/doctor and portable production build; native pins, exact110path bound and tracked non-agent hashes. Full all-app run deferred until genuine minimum connected UI and same-model ODS readiness, then applicable fixes and pause per user.

## Verification

Pending scoped implementation and acceptance evidence.

## Rollback Plan

Revert only this task intentional source commit and lifecycle artifacts; preserve unrelated tasks and user merges. No destructive history changes.

## Findings

User explicitly authorizes canonical shared and Writer corrections; localization is deferred. Existing five-field item was reduced to a browser value/mode/font flag and must be replaced without a core compatibility facade. Prior turn established native source ownership; authoritative state revalidated clean calc at12789879e97f353f7d1dc829a9108970901d328e.

- Observation: Plan approval rejected because full-doc Summary used a level-one heading.
  Impact: No execution or source mutation occurred.
  Resolution: Populate canonical Summary section through the lifecycle CLI, then repeat approval.
