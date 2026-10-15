---
id: "202610150539-NBVZWN"
title: "Restore native shared text-line item hierarchy for Calc overline"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T05:39:40.816Z"
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
    body: "Start: replace incorrect scalar underline with original shared text-line hierarchy, reuse Tools/ComplexColor/Any values and migrate Writer enum users; record missing interface/presentation services explicitly."
events:
  -
    type: "status"
    at: "2026-10-15T05:39:50.404Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace incorrect scalar underline with original shared text-line hierarchy, reuse Tools/ComplexColor/Any values and migrate Writer enum users; record missing interface/presentation services explicitly."
doc_version: 3
doc_updated_at: "2026-10-15T05:39:50.404Z"
doc_updated_by: "CODER"
description: "Task145 replaces scalar-only shared underline with original SvxTextLineItem enum/color/complex value base and actual underline/overline derivatives; canonical Tools FontLineStyle declarations and consumer migration, source defaults and bool/scalar Any semantics. Missing native localized resource and actual XComplexColor interface transport explicitly recorded, never replaced by fake services or memory mechanisms."
sections:
  Summary: "Task145 restores the actual text-line pooled-value hierarchy used by Calc underline/overline defaults and shared Writer consumers. Source-faithful core values replace the scalar-only underline; complete document/UI/ODS goal remains unchanged."
  Scope: "At most55intentional non-agent paths: new textitem.line.ts and canonical udlnitem.ts header; Tools FontLineStyle/native sentinel declarations and memberids; remove old duplicate enum/scalar-only class from textitem.ts and reexport real owners; migrate all actual enum consumers to source LINESTYLE names, update source-backed equality/range expectations, add whole value/Any tests and actual Calc105/106 witness/constants if needed. Existing shared runtime owners changed must retain complete raw100. Native Color/ComplexColor/SfxEnumItem/Any reused. Logical GC only, no item instance manager. Actual typed XComplexColor transport and localized EditResId/GetColorString presentation require unported original providers and stay explicit gaps, never fake returned objects/resources. Match inventory/docs/suspected cases; no module cycle changes, full app suite or unrelated fixes."
  Plan: "Restore native shared text-line value hierarchy, canonical enum/member IDs and real underline/overline classes; migrate Writer enum users/equality tests, reuse real color/complex/Any without memory mechanisms, retain explicit missing interface/presentation services. Validate whole changed shared/Calc raw100 and related Writer/browser behavior, honest inventory/native source audit and clean calc within55paths."
  Verify Steps: "Compare native udlnitem.hxx/textitem.cxx/fontenum.hxx/memberids.h and actual Calc docpool defaults; all19styles/native sentinel, transparent default color, independent copy/clone and concrete-type/value/color/complex equality ignoringWhich; bool Get/Set and style mutation; actual typed bool/int16/color/hascolor queries and Put int32 extraction/failure/nonmutation/alpha preservation/member mask/unknown unchanged success. Explicitly reject unsupported real complex-interface transport, do not claim full UNO/presentation parity. Migrate every old enum member consumer, preserve scalar browser projection and real Writer font/ODT/history behavior. Entire changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related Writer and enum/value suites, Writer-only coverage gaps measured/left.4references absent/restored finally for tests/build/selected existing character-formatting and numbering-font Chromium specs. All13 scoped source gates including inventory/provenance/routing/doctor, production build, native pins/exact55path/source hashes/clean calc; same-agent EVALUATOR explicitly not independent. Full suite remains gated to minimal connected UI plus same-model ODS, then fix applicable errors and pause."
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert intentional task paths through a later authorized task; no reset, merge or publication."
  Findings: "Current underline incorrectly compares Which and lacks the native shared value base/color fields. Correct shared code and canonical enum consumers rather than preserving the bad implementation. Existing browser scalar transport is an explicit established adaptation; real missing complex interface/localized resources remain unverified, not fabricated. Same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task145 restores the actual text-line pooled-value hierarchy used by Calc underline/overline defaults and shared Writer consumers. Source-faithful core values replace the scalar-only underline; complete document/UI/ODS goal remains unchanged.

## Scope

At most55intentional non-agent paths: new textitem.line.ts and canonical udlnitem.ts header; Tools FontLineStyle/native sentinel declarations and memberids; remove old duplicate enum/scalar-only class from textitem.ts and reexport real owners; migrate all actual enum consumers to source LINESTYLE names, update source-backed equality/range expectations, add whole value/Any tests and actual Calc105/106 witness/constants if needed. Existing shared runtime owners changed must retain complete raw100. Native Color/ComplexColor/SfxEnumItem/Any reused. Logical GC only, no item instance manager. Actual typed XComplexColor transport and localized EditResId/GetColorString presentation require unported original providers and stay explicit gaps, never fake returned objects/resources. Match inventory/docs/suspected cases; no module cycle changes, full app suite or unrelated fixes.

## Plan

Restore native shared text-line value hierarchy, canonical enum/member IDs and real underline/overline classes; migrate Writer enum users/equality tests, reuse real color/complex/Any without memory mechanisms, retain explicit missing interface/presentation services. Validate whole changed shared/Calc raw100 and related Writer/browser behavior, honest inventory/native source audit and clean calc within55paths.

## Verify Steps

Compare native udlnitem.hxx/textitem.cxx/fontenum.hxx/memberids.h and actual Calc docpool defaults; all19styles/native sentinel, transparent default color, independent copy/clone and concrete-type/value/color/complex equality ignoringWhich; bool Get/Set and style mutation; actual typed bool/int16/color/hascolor queries and Put int32 extraction/failure/nonmutation/alpha preservation/member mask/unknown unchanged success. Explicitly reject unsupported real complex-interface transport, do not claim full UNO/presentation parity. Migrate every old enum member consumer, preserve scalar browser projection and real Writer font/ODT/history behavior. Entire changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related Writer and enum/value suites, Writer-only coverage gaps measured/left.4references absent/restored finally for tests/build/selected existing character-formatting and numbering-font Chromium specs. All13 scoped source gates including inventory/provenance/routing/doctor, production build, native pins/exact55path/source hashes/clean calc; same-agent EVALUATOR explicitly not independent. Full suite remains gated to minimal connected UI plus same-model ODS, then fix applicable errors and pause.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert intentional task paths through a later authorized task; no reset, merge or publication.

## Findings

Current underline incorrectly compares Which and lacks the native shared value base/color fields. Correct shared code and canonical enum consumers rather than preserving the bad implementation. Existing browser scalar transport is an explicit established adaptation; real missing complex interface/localized resources remain unverified, not fabricated. Same-agent evaluation is not independent.
