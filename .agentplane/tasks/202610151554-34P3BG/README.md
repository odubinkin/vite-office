---
id: "202610151554-34P3BG"
title: "Restore native paragraph adjustment values for EditEngine"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T15:54:54.753Z"
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
    body: "Start: native paragraph adjustment state and actual typed properties with canonical Writer consumers; retain source defaults and GC, no pool facade or localization."
events:
  -
    type: "status"
    at: "2026-10-15T15:54:57.270Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native paragraph adjustment state and actual typed properties with canonical Writer consumers; retain source defaults and GC, no pool facade or localization."
doc_version: 3
doc_updated_at: "2026-10-15T15:54:57.270Z"
doc_updated_by: "CODER"
description: "Task157 restores full SvxAdjustItem native fields/defaults/copy/setters/equality/hash/typed Any and migrates necessary Writer consumers/JSON I/O. Actual ScDocumentPool/ScPageHFItem audit confirms native EditTextObject and full EditEngine pool remain absent; canonical paragraph adjustment is an existing incomplete shared dependency of that real text model. No fake pool/text-object facade, UI localization, native compiler or new memory manager."
sections:
  Summary: "Task157 restores complete native paragraph adjustment value and typed property contracts in the existing shared owner, plus necessary Writer consumers and persistence adapters."
  Scope: "At most120intentional non-agent paths: editeng paraitem/adjustitem.hxx/svxenum/memberids owners, existing comphelper enum2int/Any2Bool and CPPU/hash only if a real dependency correction is required, Writer alignment consumers/browser item codec/registered snapshot factory and related tests, matched inventory/provenance/capability/docs. No translated UI labels, full text engine/pool facade, new lifetime/reference-count library, native compiler/probe, unrelated Writer features or policy changes. ODF covers existing alignment behavior and honest source-supported additions only; broader unimplemented Writer formatting families are not certified."
  Plan: "Port original SvxAdjustItem state, native setters/copy/factory/Clone/payload equality/hash and all11typed Any members under canonical header and original enum/member owners. Remove core JSON projection and migrate necessary Writer I/O and actual consumers, preserving native BlockLine fallback rather than compatibility hacks. Add actual native field/property/Writer regression cases and inventory, prove whole changed shared/Calc raw100 and portable source-absent tests/build plus related browser behavior, then quality/verify/commit/finish. One coherent owner boundary, no declaration-only subtasks. Continue real EditEngine/EditTextObject/Calc model priorities after this dependency."
  Verify Steps: "Pinned include/editeng/adjustitem.hxx, svxenum.hxx/memberids.h and editeng/source/items/paraitem.cxx are authoritative. Witness factory ParaStart/Which0; all six primary bits and raw independent one-word/last-line flags; seven word/letter/glyph numeric defaults100/100/100/0/0/100/100, composerfalse; exact narrowing direct setters; original GetAdjust fallback for BlockLine/unknown, GetOneWord gating and last-line precedence; independent native copy/Clone and stable Which; payload equality/hash all participating fields ignoring Which. All11native typed property members, signed16 query/narrowing, unsigned word fields, enum2int admission/last-line failure and success-without-change cases, failed short extraction applying -1, actual Any2Bool fallback, byte/twips masks and unknown untouched success. Existing real comphelper/CPPU/hash reused. Writer projection/commands/JSON persistence use actual getters/setters and retain every reachable field, decoding prior scalar only at I/O; existing ODT alignment and real history/ruler/layout/browser reopen regressions. No fake provider, private-field mutation tests or memory manager. Entire changed/new shared executable owners and all Calc measured raw S/B/F/L100, every counter positive and exact expected owner sets; related Writer tests, Writer-only coverage gaps exempt. Four reference links absent during suites/build/browser and restored finally; all13source gates, relevant browser cases, inventory semanticViolationCount0, pinned source hashes, <=120intentional paths and clean calc final proof. Full all-app regression only at genuine minimum connected UI+same-model ODS readiness, then repairs and goal pause per user; no full run merely due task number."
  Verification: "Pending implementation and deterministic acceptance. No pool/model/UI/ODS readiness or broad parity is claimed."
  Rollback Plan: "Revert only task intentional source and lifecycle artifacts, preserving user merges/unrelated tasks and history."
  Findings: "Preflight clean calc at a04fbf9e0ea79aba21ff67fcb7535a51c33b5e2b. Actual ScDocumentPool registers six ScPageHFItem values, whose copy/set/equality require genuine EditTextObject; nonempty/empty fallback also requires EditEngine::CreatePool. Full EditEngine table additionally uses SvxAdjustItem ParaStart at EE_PARA_JUST4016, and existing item stores only one enum with Which-sensitive equality and scalar JSON QueryValue. Native adjust has six primary bits, independent flags and seven numeric fields plus composer. Existing comphelper enum2int/Any2Bool are already available. Genuine text-object/pool/column/table/document/UI/ODS remain absent; do not introduce null-only facades. Initial read-only path guesses for editdoc.hxx/itemset.ts/itemholder.ts and wrong-list globs missed actual owners; bounded rg --files located editeng/inc/editdoc.hxx, editeng/source/editeng/editobj2.hxx, edtspell and native SfxPoolItemHolder in svl/itemset.hxx. No source mutation or outside access resulted."
id_source: "generated"
---
## Summary

Task157 restores complete native paragraph adjustment value and typed property contracts in the existing shared owner, plus necessary Writer consumers and persistence adapters.

## Scope

At most120intentional non-agent paths: editeng paraitem/adjustitem.hxx/svxenum/memberids owners, existing comphelper enum2int/Any2Bool and CPPU/hash only if a real dependency correction is required, Writer alignment consumers/browser item codec/registered snapshot factory and related tests, matched inventory/provenance/capability/docs. No translated UI labels, full text engine/pool facade, new lifetime/reference-count library, native compiler/probe, unrelated Writer features or policy changes. ODF covers existing alignment behavior and honest source-supported additions only; broader unimplemented Writer formatting families are not certified.

## Plan

Port original SvxAdjustItem state, native setters/copy/factory/Clone/payload equality/hash and all11typed Any members under canonical header and original enum/member owners. Remove core JSON projection and migrate necessary Writer I/O and actual consumers, preserving native BlockLine fallback rather than compatibility hacks. Add actual native field/property/Writer regression cases and inventory, prove whole changed shared/Calc raw100 and portable source-absent tests/build plus related browser behavior, then quality/verify/commit/finish. One coherent owner boundary, no declaration-only subtasks. Continue real EditEngine/EditTextObject/Calc model priorities after this dependency.

## Verify Steps

Pinned include/editeng/adjustitem.hxx, svxenum.hxx/memberids.h and editeng/source/items/paraitem.cxx are authoritative. Witness factory ParaStart/Which0; all six primary bits and raw independent one-word/last-line flags; seven word/letter/glyph numeric defaults100/100/100/0/0/100/100, composerfalse; exact narrowing direct setters; original GetAdjust fallback for BlockLine/unknown, GetOneWord gating and last-line precedence; independent native copy/Clone and stable Which; payload equality/hash all participating fields ignoring Which. All11native typed property members, signed16 query/narrowing, unsigned word fields, enum2int admission/last-line failure and success-without-change cases, failed short extraction applying -1, actual Any2Bool fallback, byte/twips masks and unknown untouched success. Existing real comphelper/CPPU/hash reused. Writer projection/commands/JSON persistence use actual getters/setters and retain every reachable field, decoding prior scalar only at I/O; existing ODT alignment and real history/ruler/layout/browser reopen regressions. No fake provider, private-field mutation tests or memory manager. Entire changed/new shared executable owners and all Calc measured raw S/B/F/L100, every counter positive and exact expected owner sets; related Writer tests, Writer-only coverage gaps exempt. Four reference links absent during suites/build/browser and restored finally; all13source gates, relevant browser cases, inventory semanticViolationCount0, pinned source hashes, <=120intentional paths and clean calc final proof. Full all-app regression only at genuine minimum connected UI+same-model ODS readiness, then repairs and goal pause per user; no full run merely due task number.

## Verification

Pending implementation and deterministic acceptance. No pool/model/UI/ODS readiness or broad parity is claimed.

## Rollback Plan

Revert only task intentional source and lifecycle artifacts, preserving user merges/unrelated tasks and history.

## Findings

Preflight clean calc at a04fbf9e0ea79aba21ff67fcb7535a51c33b5e2b. Actual ScDocumentPool registers six ScPageHFItem values, whose copy/set/equality require genuine EditTextObject; nonempty/empty fallback also requires EditEngine::CreatePool. Full EditEngine table additionally uses SvxAdjustItem ParaStart at EE_PARA_JUST4016, and existing item stores only one enum with Which-sensitive equality and scalar JSON QueryValue. Native adjust has six primary bits, independent flags and seven numeric fields plus composer. Existing comphelper enum2int/Any2Bool are already available. Genuine text-object/pool/column/table/document/UI/ODS remain absent; do not introduce null-only facades. Initial read-only path guesses for editdoc.hxx/itemset.ts/itemholder.ts and wrong-list globs missed actual owners; bounded rg --files located editeng/inc/editdoc.hxx, editeng/source/editeng/editobj2.hxx, edtspell and native SfxPoolItemHolder in svl/itemset.hxx. No source mutation or outside access resulted.
