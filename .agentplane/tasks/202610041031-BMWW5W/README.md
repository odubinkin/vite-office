---
id: "202610041031-BMWW5W"
title: "Preserve document-owned named paragraph style hierarchy through ODT and history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on:
  - "202610040949-DSEN0S"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T10:44:11.449Z"
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
    body: "Start: Restore common named style collection ownership, automatic direct deltas and exact graph/ODT/history/destination transport under the standing iterative upstream goal."
  -
    author: "CODER"
    body: "Start: Continue named style ownership across graph/import/export/copy and admit registered styles through existing shell and StyleApply history."
events:
  -
    type: "status"
    at: "2026-10-04T10:33:56.178Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore common named style collection ownership, automatic direct deltas and exact graph/ODT/history/destination transport under the standing iterative upstream goal."
  -
    type: "status"
    at: "2026-10-04T10:44:12.025Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Continue named style ownership across graph/import/export/copy and admit registered styles through existing shell and StyleApply history."
doc_version: 3
doc_updated_at: "2026-10-04T11:11:44.856Z"
doc_updated_by: "CODER"
description: "Iteration102 replaces flattening of imported named paragraph styles with document-owned SwTextFormatColl collections, retaining direct automatic deltas and exact parent/follow/item ownership through ODT, graph/history and destination copying. Native independent list-indent applicability must agree with real imported hierarchy; existing consumers and registered I/O/recovery deviations remain unchanged until the next consumer migration."
sections:
  Summary: "Iteration102 replaces common paragraph-style flattening with actual document-owned named SwTextFormatColl hierarchy, while automatic styles supply only direct deltas. Restore imported independent list ownership prerequisites through current core graph, destination copy, ODT and actual Writer history without changing existing consumers."
  Scope: |-
    apps/office/src/sw/source/core/doc/DocumentStylePoolManager.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/txtnode/ndtxt.ts
    apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    apps/office/src/sw/source/filter/xml/xmlimp.ts
    apps/office/src/sw/source/filter/xml/xmlimp-named-styles.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/xmloff/source/text/txtparai.ts
    apps/office/src/xmloff/source/text/txtparae.ts
    apps/office/src/sw/source/uibase/shells/textsh1.ts
    apps/office/src/sw/source/filter/xml/odt-named-paragraph-ownership.test.ts
    apps/office/e2e/writer-named-style-history.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    One coherent named-style ownership correction. Existing list geometry sideband and consumers remain until independent per-axis migration; no registered save/open/recovery changes, schema/version/default/status broad promotion, upstream execution/network/outside access or AP source/helper/raw artifact storage.
  Plan: |-
    1. Register document-owned custom text collections with native MakeTextFormatColl shape and bounded CopyTextColl destination ownership; preserve the existing builtin destination adapter. Current graph16 supports declared custom styles through default-root-first materialization and exact parent/follow/items; dangling undeclared nodes remain rejected. Registered custom style identities and display names are admitted by the existing shell/StyleApply command with native history; unknown styles remain rejected.
    2. Split named-style application from xmlimp.ts to retain1000line limit. Materialize all common paragraph definitions, link actual custom/builtin parents/follows and own items; common properties remain inherited, automatic definitions only direct. Apply list rules only when source automatic list override or effective rule differs; preserve native removal outside lists except Outline. Preserve current compatibility metadata and consumers.
    3. Export exact custom names/own styles and direct deltas; replace ambiguous colon-delimited paragraph style keys with structured tuples and escape parent names. Prove order/family/automatic/common separation, raw own zero/items, real tdf114287 masks, graph/history/clone/source mutation isolation and roundtrip ownership.
    4. Add actual ODT browser1280/390 custom hierarchy/draft/UndoRedo/independent paragraph/continued editing evidence. All305prior test/spec files unchanged. Seven static gates, one absent app/inventory/scripts/browser pipeline with reportOnFailure/finally restoration, then resource/source/hash/scope/AP/quality gates. Repeat only failed corrected gates; no passing full suite repeats. Finish leaf and append parent progress; goal remains active.
  Verify Steps: |-
    1. Custom collection creation/lookup/order/parent/follow/own defaults and destination copying match supported native docfmt responsibilities. Connected imported common styles never become direct paragraph margins/font/line fields; automatic zero/nonzero/first-only/left-only deltas remain direct. Native masks0/1/2/3 include same-style rule/margin priority and automatic list rule override. Literal tdf114287 paragraphs2/9/16 raw and applicability match native independent ownership.
    2. Full graph16, ODT named/direct definitions and repeated read/write cycles preserve exact custom own items, parent/follow and raw names including XML punctuation/colon; builtin and undeclared-node validation preserved, family/container collisions independent. Registered custom shell/StyleApply and real shell edit/no-op/Undo/Redo retains graph and direct absence; destination copy isolates source items and respects existing destination style. Existing consumers and all305 prior tests unchanged.
    3. Browser1280/390 real ODT opens actual custom styles and inherited first/raw formatting, preserves untouched paragraph, accepted dialog draft and Undo/Redo restores inherited ownership and later editing; inspect screenshots. Seven static gates pass. App and inventory coverage100%four metrics, scripts5/full Chromium only absent once; vendor restored finally, tests never read/compile/invoke upstream. No passing full suite repeated.
    4. Read-only pinned source hashes and restored resources--check/source-tree/provenance/invariants/parity audits pass; exact14semantic paths and all305prior tests byte-identical, existing mapping statuses/defaults/exceptions unchanged with bounded evidence/new helper ownership. Whole ignored-inclusive AP forbidden0, routing/doctor and exact-SHA same-actor read-only EVALUATOR pass, final clean tracked leaf and parent progress.
  Verification: "Pending implementation; no baseline or pre-fix tests. Previous leaf101 is DONE with native independent core masks; initial consumer regressions from flattened custom styles justify this prerequisite correction."
  Rollback Plan: "Revert the scoped implementation commit if actual named/automatic ownership or transport contracts are disproved; no history rewrite/reset, coverage relaxation or registered deviation changes."
  Findings: "Initial absent app gate:1325passed/5failed in229files; coverage below100%. Vendor restored in finally. Failures identify native list display-name lookup, invalid/cyclic parent detachment, composite paragraph-item inheritance, and direct empty numbering suppression. The old content-stream spacing assertion conflicts with named common ownership; review its stream boundary against native before adapting that single assertion. No present-directory tests or native execution. Remaining inventory/scripts/Chromium not started."
id_source: "generated"
---
## Summary

Iteration102 replaces common paragraph-style flattening with actual document-owned named SwTextFormatColl hierarchy, while automatic styles supply only direct deltas. Restore imported independent list ownership prerequisites through current core graph, destination copy, ODT and actual Writer history without changing existing consumers.

## Scope

apps/office/src/sw/source/core/doc/DocumentStylePoolManager.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/txtnode/ndtxt.ts
apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
apps/office/src/sw/source/filter/xml/xmlimp.ts
apps/office/src/sw/source/filter/xml/xmlimp-named-styles.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/xmloff/source/text/txtparai.ts
apps/office/src/xmloff/source/text/txtparae.ts
apps/office/src/sw/source/uibase/shells/textsh1.ts
apps/office/src/sw/source/filter/xml/odt-named-paragraph-ownership.test.ts
apps/office/e2e/writer-named-style-history.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
One coherent named-style ownership correction. Existing list geometry sideband and consumers remain until independent per-axis migration; no registered save/open/recovery changes, schema/version/default/status broad promotion, upstream execution/network/outside access or AP source/helper/raw artifact storage.

## Plan

1. Register document-owned custom text collections with native MakeTextFormatColl shape and bounded CopyTextColl destination ownership; preserve the existing builtin destination adapter. Current graph16 supports declared custom styles through default-root-first materialization and exact parent/follow/items; dangling undeclared nodes remain rejected. Registered custom style identities and display names are admitted by the existing shell/StyleApply command with native history; unknown styles remain rejected.
2. Split named-style application from xmlimp.ts to retain1000line limit. Materialize all common paragraph definitions, link actual custom/builtin parents/follows and own items; common properties remain inherited, automatic definitions only direct. Apply list rules only when source automatic list override or effective rule differs; preserve native removal outside lists except Outline. Preserve current compatibility metadata and consumers.
3. Export exact custom names/own styles and direct deltas; replace ambiguous colon-delimited paragraph style keys with structured tuples and escape parent names. Prove order/family/automatic/common separation, raw own zero/items, real tdf114287 masks, graph/history/clone/source mutation isolation and roundtrip ownership.
4. Add actual ODT browser1280/390 custom hierarchy/draft/UndoRedo/independent paragraph/continued editing evidence. All305prior test/spec files unchanged. Seven static gates, one absent app/inventory/scripts/browser pipeline with reportOnFailure/finally restoration, then resource/source/hash/scope/AP/quality gates. Repeat only failed corrected gates; no passing full suite repeats. Finish leaf and append parent progress; goal remains active.

## Verify Steps

1. Custom collection creation/lookup/order/parent/follow/own defaults and destination copying match supported native docfmt responsibilities. Connected imported common styles never become direct paragraph margins/font/line fields; automatic zero/nonzero/first-only/left-only deltas remain direct. Native masks0/1/2/3 include same-style rule/margin priority and automatic list rule override. Literal tdf114287 paragraphs2/9/16 raw and applicability match native independent ownership.
2. Full graph16, ODT named/direct definitions and repeated read/write cycles preserve exact custom own items, parent/follow and raw names including XML punctuation/colon; builtin and undeclared-node validation preserved, family/container collisions independent. Registered custom shell/StyleApply and real shell edit/no-op/Undo/Redo retains graph and direct absence; destination copy isolates source items and respects existing destination style. Existing consumers and all305 prior tests unchanged.
3. Browser1280/390 real ODT opens actual custom styles and inherited first/raw formatting, preserves untouched paragraph, accepted dialog draft and Undo/Redo restores inherited ownership and later editing; inspect screenshots. Seven static gates pass. App and inventory coverage100%four metrics, scripts5/full Chromium only absent once; vendor restored finally, tests never read/compile/invoke upstream. No passing full suite repeated.
4. Read-only pinned source hashes and restored resources--check/source-tree/provenance/invariants/parity audits pass; exact14semantic paths and all305prior tests byte-identical, existing mapping statuses/defaults/exceptions unchanged with bounded evidence/new helper ownership. Whole ignored-inclusive AP forbidden0, routing/doctor and exact-SHA same-actor read-only EVALUATOR pass, final clean tracked leaf and parent progress.

## Verification

Pending implementation; no baseline or pre-fix tests. Previous leaf101 is DONE with native independent core masks; initial consumer regressions from flattened custom styles justify this prerequisite correction.

## Rollback Plan

Revert the scoped implementation commit if actual named/automatic ownership or transport contracts are disproved; no history rewrite/reset, coverage relaxation or registered deviation changes.

## Findings

Initial absent app gate:1325passed/5failed in229files; coverage below100%. Vendor restored in finally. Failures identify native list display-name lookup, invalid/cyclic parent detachment, composite paragraph-item inheritance, and direct empty numbering suppression. The old content-stream spacing assertion conflicts with named common ownership; review its stream boundary against native before adapting that single assertion. No present-directory tests or native execution. Remaining inventory/scripts/Chromium not started.
