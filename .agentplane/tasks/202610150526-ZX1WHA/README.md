---
id: "202610150526-ZX1WHA"
title: "Implement native XML attribute value containers for Calc pool"
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
  updated_at: "2026-10-15T05:27:00.073Z"
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
    body: "Start: implement original XML attribute value/container/item prerequisites with shared namespace map and GC ownership; preserve source quirks and explicitly leave unsupported actual UNO transport."
events:
  -
    type: "status"
    at: "2026-10-15T05:27:04.954Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original XML attribute value/container/item prerequisites with shared namespace map and GC ownership; preserve source quirks and explicitly leave unsupported actual UNO transport."
doc_version: 3
doc_updated_at: "2026-10-15T05:27:04.954Z"
doc_updated_by: "CODER"
description: "Task144 ports actual SvXMLAttr, SvXMLAttrCollection, SvXMLAttrContainerData and SvXMLAttrContainerItem value/copy/accessor/presentation contracts using existing shared SvXMLNamespaceMap and SfxPoolItem. Original UNO XNameContainer/Any transport remains an explicit missing dependency, not a fake provider; preserve GC lifetime and native observable namespace behavior."
sections:
  Summary: "Task144 implements the native XML attribute value hierarchy needed by actual Calc ATTR_USERDEF122 in ScDocumentPool. Reuse shared namespace map and pooled item infrastructure. This moves core toward connected UI and same-model ODS without claiming the document model or UNO transport is complete."
  Scope: "At most35intentional non-agent paths: xmloff source/core/SvXMLAttr.ts, SvXMLAttrCollection.ts, xmlcnimp.ts plus canonical inc/xmlcnimp.ts; editeng source/items/xmlcnitm.ts plus inc/xmlcnitm.ts; related tests and actual Calc attribute witness, native editeng-to-xmloff boundary admission/test without cycle exceptions; matched runtime/provenance/capability inventory, calc-core and Calc suspected-source notes. Retain actual overloads, copy/assignment, namespace alias/history and conflicting-prefix behavior, index/count widths, defaultWhich0, payload equality and presentationfalse. Native debug preconditions become host errors; undefined C++ accesses not emulated. Erase native unique_ptr/move/lifetime mechanics under GC. No fake XNameContainer/Any provider, no whole UNO mapper, no ScDocumentPool facade. Existing shared namespace source unchanged unless real contract correction is necessary and approved."
  Plan: "Implement four source-owned XML attribute classes and two canonical headers, preserve original observable contracts with native JS storage/GC, add original editeng-to-xmloff edge after prior task removed its wrong reverse, test whole new shared owners and full Calc at strict raw100 plus existing namespace/SVL related suites, update honest inventory and suspected source cases; run portable build/source gates, audit paths/pins/hashes and close clean calc. Bound35paths. No native probes, cycle exceptions, fake UNO transport or Writer coverage work."
  Verify Steps: "Source compare four native class/header pairs and actual Calc docpool ATTR_USERDEF122; defaults/copy independence/assignment/self-copy/payload equality, all AddAttr/SetAt overloads, reject-before-namespace mutation, Add versus Set conflicting-prefix difference, unknown-prefix false, aliases/canonical prefix history, remove/index/no-pruning, namespace traversal membership, name assertion domains, uint16 item count/index wrap and false presentation text preservation. Reuse actual shared map/base; no memory manager, fake UNO adapter, compatibility facade or cycle exception. Entire new shared executable owners and whole Calc raw S/B/F/L100 every counter positive; run related namespace/SVL tests and boundary tests. Tests and production build with4source reference links absent/restored finally; scoped format/lint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff. Inventory zero semantic violations with explicit missing UNO transport and full document/UI/ODS. Audit35path bound/source hashes/native pins/restored links/clean calc. Full all-app suite only when actual minimum connected UI plus same-model ODS ready, then fix applicable failures and pause; Writer-only coverage gaps exempt as user instructed."
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert only intentional task changes in a later authorized task; no reset, merge or publication."
  Findings: "Source behavior is authoritative even where AddAttr4 appends UNKNOWN while SetAt4 rejects it, or namespace history survives removal and affects equality. Record suspicious cases in Calc-only source notes without correcting upstream behavior. Native typed UNO transport requires actual SvUnoAttributeContainer/XNameContainer; it is not fabricated for value prerequisites. Same-agent evaluator is not independent."
id_source: "generated"
---
## Summary

Task144 implements the native XML attribute value hierarchy needed by actual Calc ATTR_USERDEF122 in ScDocumentPool. Reuse shared namespace map and pooled item infrastructure. This moves core toward connected UI and same-model ODS without claiming the document model or UNO transport is complete.

## Scope

At most35intentional non-agent paths: xmloff source/core/SvXMLAttr.ts, SvXMLAttrCollection.ts, xmlcnimp.ts plus canonical inc/xmlcnimp.ts; editeng source/items/xmlcnitm.ts plus inc/xmlcnitm.ts; related tests and actual Calc attribute witness, native editeng-to-xmloff boundary admission/test without cycle exceptions; matched runtime/provenance/capability inventory, calc-core and Calc suspected-source notes. Retain actual overloads, copy/assignment, namespace alias/history and conflicting-prefix behavior, index/count widths, defaultWhich0, payload equality and presentationfalse. Native debug preconditions become host errors; undefined C++ accesses not emulated. Erase native unique_ptr/move/lifetime mechanics under GC. No fake XNameContainer/Any provider, no whole UNO mapper, no ScDocumentPool facade. Existing shared namespace source unchanged unless real contract correction is necessary and approved.

## Plan

Implement four source-owned XML attribute classes and two canonical headers, preserve original observable contracts with native JS storage/GC, add original editeng-to-xmloff edge after prior task removed its wrong reverse, test whole new shared owners and full Calc at strict raw100 plus existing namespace/SVL related suites, update honest inventory and suspected source cases; run portable build/source gates, audit paths/pins/hashes and close clean calc. Bound35paths. No native probes, cycle exceptions, fake UNO transport or Writer coverage work.

## Verify Steps

Source compare four native class/header pairs and actual Calc docpool ATTR_USERDEF122; defaults/copy independence/assignment/self-copy/payload equality, all AddAttr/SetAt overloads, reject-before-namespace mutation, Add versus Set conflicting-prefix difference, unknown-prefix false, aliases/canonical prefix history, remove/index/no-pruning, namespace traversal membership, name assertion domains, uint16 item count/index wrap and false presentation text preservation. Reuse actual shared map/base; no memory manager, fake UNO adapter, compatibility facade or cycle exception. Entire new shared executable owners and whole Calc raw S/B/F/L100 every counter positive; run related namespace/SVL tests and boundary tests. Tests and production build with4source reference links absent/restored finally; scoped format/lint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff. Inventory zero semantic violations with explicit missing UNO transport and full document/UI/ODS. Audit35path bound/source hashes/native pins/restored links/clean calc. Full all-app suite only when actual minimum connected UI plus same-model ODS ready, then fix applicable failures and pause; Writer-only coverage gaps exempt as user instructed.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert only intentional task changes in a later authorized task; no reset, merge or publication.

## Findings

Source behavior is authoritative even where AddAttr4 appends UNKNOWN while SetAt4 rejects it, or namespace history survives removal and affects equality. Record suspicious cases in Calc-only source notes without correcting upstream behavior. Native typed UNO transport requires actual SvUnoAttributeContainer/XNameContainer; it is not fabricated for value prerequisites. Same-agent evaluator is not independent.
