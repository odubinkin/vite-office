---
id: "202610041031-BMWW5W"
title: "Preserve document-owned named paragraph style hierarchy through ODT and history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 33
origin:
  system: "manual"
depends_on:
  - "202610040949-DSEN0S"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T11:24:26.042Z"
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
  -
    author: "CODER"
    body: "Start: correct native ownership diagnostics and one inherited XML stream assertion under the continuing approved goal; repeat only failed gates."
  -
    author: "CODER"
    body: "Start: correct only actual custom fixture ownership and three relocated local markers; passing app suite will not be repeated."
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
  -
    type: "status"
    at: "2026-10-04T11:12:30.164Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: correct native ownership diagnostics and one inherited XML stream assertion under the continuing approved goal; repeat only failed gates."
  -
    type: "status"
    at: "2026-10-04T11:24:26.489Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: correct only actual custom fixture ownership and three relocated local markers; passing app suite will not be repeated."
doc_version: 3
doc_updated_at: "2026-10-04T11:30:38.519Z"
doc_updated_by: "CODER"
description: "Iteration102 replaces flattening of imported named paragraph styles with document-owned SwTextFormatColl collections, retaining direct automatic deltas and exact parent/follow/item ownership through ODT, graph/history and destination copying. Native independent list-indent applicability must agree with real imported hierarchy; existing consumers and registered I/O/recovery deviations remain unchanged until the next consumer migration."
sections:
  Summary: "Iteration102 replaces common paragraph-style flattening with actual document-owned named SwTextFormatColl hierarchy, while automatic styles supply only direct deltas. Restore imported independent list ownership prerequisites through current core graph, destination copy, ODT and actual Writer history without changing existing consumers."
  Scope: |-
    Exactly17semantic paths:
    - apps/office/src/sw/source/core/doc/DocumentStylePoolManager.ts
    - apps/office/src/sw/source/core/doc/doc.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    - apps/office/src/sw/source/filter/xml/xmlimp.ts
    - apps/office/src/sw/source/filter/xml/xmlimp-named-styles.ts
    - apps/office/src/sw/source/filter/xml/xmlexp.ts
    - apps/office/src/xmloff/source/text/txtparai.ts
    - apps/office/src/xmloff/source/text/txtparae.ts
    - apps/office/src/sw/source/uibase/shells/textsh1.ts
    - apps/office/src/sw/source/filter/xml/odt-named-paragraph-ownership.test.ts
    - apps/office/src/sw/source/filter/xml/odt-layout-parity.test.ts
    - apps/office/e2e/writer-named-style-history.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts
    - docs/program/parity/writer-command-slice.json
    Preserve registered document I/O/recovery deviations and all existing status/default/exception fields. Common style properties belong to named collections; automatic deltas belong to nodes. Existing geometry consumers and serialized listGeometryWins remain unchanged. All303of305prior test files stay byte-identical; only the inherited XML stream assertion and actual custom fixture style identity/parent assertions change. Relocate one driver local symbol and exactly3existing owned marker paths to the new helper.
  Plan: |-
    1. Restore document-owned custom creation and name lookup, bounded parent/follow/manual-rule copying, and graph16 custom declarations.
    2. Split common-style materialization from the Writer XML driver; preserve own fields, actual parent/follow links, native list display-name resolution, invalid/cyclic parent handling and supported composite item subfield inheritance. Keep the existing builtin copy and Standard default-root adapters explicitly unverified.
    3. Transport direct automatic changes and actual direct numbering while preserving the named parent through ODT. Permit registered custom styles in existing shell commands. Add literal raw-zero/mask, graph/package/clone/history and1280/390browser evidence. Correct only the two obsolete fixture/stream expectations and moved symbol/markers.
    4. Execute the declared static gates and absent-directory test gates. Repeat failed gates only; never repeat a passing full suite. Restore vendor in finally, inspect screenshots, run source/provenance/parity/AP/scope checks, record exact-SHA same-actor evaluation and finish the leaf. Follow up the builtin-only toolbar chooser and remaining native geometry/default/style lifetime parity separately.
  Verify Steps: |-
    1. Custom collection creation/lookup/order/parent/follow/own defaults and destination copying match supported native docfmt responsibilities. Connected imported common styles never become direct paragraph margins/font/line fields; automatic zero/nonzero/first-only/left-only deltas remain direct. Native masks0/1/2/3 include same-style rule/margin priority and automatic list rule override. Literal tdf114287 paragraphs2/9/16 raw and applicability match native independent ownership.
    2. Full graph16, ODT named/direct definitions and repeated read/write cycles preserve exact custom own items, parent/follow and raw names including XML punctuation/colon; builtin and undeclared-node validation preserved, family/container collisions independent. Registered custom shell/StyleApply and real shell edit/no-op/Undo/Redo retains graph and direct absence; destination copy isolates source items and respects existing destination style. Existing consumers and all303other prior tests unchanged; one existing XML stream assertion corrected with numeric literals unchanged.
    3. Browser1280/390 real ODT opens actual custom styles and inherited first/raw formatting, preserves untouched paragraph, accepted dialog draft and Undo/Redo restores inherited ownership and later editing; inspect screenshots. Seven static gates pass. App and inventory coverage100%four metrics, scripts5/full Chromium only absent once; vendor restored finally, tests never read/compile/invoke upstream. No passing full suite repeated.
    4. Read-only pinned source hashes and restored resources--check/source-tree/provenance/invariants/parity audits pass; exact17semantic paths and all303other prior tests byte-identical; one bounded XML stream assertion and one actual custom fixture identity/parent assertion changed; exactly3owned marker paths relocated, existing mapping statuses/defaults/exceptions unchanged with bounded evidence/new helper ownership. Whole ignored-inclusive AP forbidden0, routing/doctor and exact-SHA same-actor read-only EVALUATOR pass, final clean tracked leaf and parent progress.
  Verification: |-
    Command: split npm run verify gates plus exact scope/native hash and ignored-inclusive AP inspection recorded in task JSON summaries.
    Result: pass. App1331/229and inventory109/36pass100%lines/statements/functions/branches; scripts5/2and Chromium87pass. All tests ran with the pinned directory absent. Only failed app/inventory gates repeated; no passing full suite repeated. All seven static gates pass, scoped corrections checked, final browser build/static output validated. Restored resources/source-tree/provenance/invariants pass; parity223modules/0violations. Five read-only source hashes,17paths,303unchanged prior tests and exact two bounded assertion updates verified. No native execution or source copies. Both screenshot widths inspected; current toolbar custom-style display remains a recorded next-iteration gap.
  Rollback Plan: "Revert the scoped implementation commit if actual named/automatic ownership or transport contracts are disproved; no history rewrite/reset, coverage relaxation or registered deviation changes."
  Findings: |-
    Command: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure. Result: initial5fail/1325pass; then1331pass with one branch below100%; final1331/229pass100%four metrics. Native list display-name, invalid parent, composite item and empty direct-rule diagnostics were corrected without changing numeric literals. The generic XML port parent-alignment branch has a literal independent test. No app production change or app rerun after its passing gate.
    Command: npm run test:inventory:coverage. Result: initial2fail/107pass, then1fail/108pass, final109/36pass100%four metrics. Correct the project fixture's actual Custom_5f_Style/Text body ownership; relocate3local markers and one local symbol to their real helper. No native runtime used. Scripts5and Chromium87run once absent and pass; vendor restored each finally.
    Command: static gates and source/parity/scope/AP audits. Result: pass. The split initially exposed unused imports/converter and new E2E formatting; only those failed gates repeated, later scoped changes checked. Inline exact-scope replay had a duplicate const binding, corrected before final audit.17semantic paths;222old mapping rows retained in order plus one helper,9bounded descriptions/evidence appends, original statuses/defaults/exceptions unchanged. Two prior tests have precisely bounded ownership expectation changes;303prior tests unchanged. Whole ignored-inclusive AP has0forbidden source/helper/Python/binary/embedded source/source-frame/code-diff findings;5historical prose-only diff references retained.
    Scope: custom collection creation/name lookup, bounded CopyTextColl parent/follow/manual rules, exact common/direct paragraph ownership and supported history/graph/ODT/shell/browser paths. Tdf114287 masks0/0/3 and raw first values−567match independent ownership. Native complete global default pools, creation undo, pool/help IDs, conditional styles/collisions/UNO/fonts/full style UI and geometry/tab/RTL/redline/frame lifetime remain separately unverified. Builtin copy adapter, Standard default root and serialized sideband remain explicit residuals. Screenshot1280shows sidebar Owned child while the existing toolbar chooser displays its builtin fallback; fix document-owned custom style chooser behavior as the next separate iteration. Registered I/O/recovery deviations unchanged.
id_source: "generated"
---
## Summary

Iteration102 replaces common paragraph-style flattening with actual document-owned named SwTextFormatColl hierarchy, while automatic styles supply only direct deltas. Restore imported independent list ownership prerequisites through current core graph, destination copy, ODT and actual Writer history without changing existing consumers.

## Scope

Exactly17semantic paths:
- apps/office/src/sw/source/core/doc/DocumentStylePoolManager.ts
- apps/office/src/sw/source/core/doc/doc.ts
- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
- apps/office/src/sw/source/filter/xml/xmlimp.ts
- apps/office/src/sw/source/filter/xml/xmlimp-named-styles.ts
- apps/office/src/sw/source/filter/xml/xmlexp.ts
- apps/office/src/xmloff/source/text/txtparai.ts
- apps/office/src/xmloff/source/text/txtparae.ts
- apps/office/src/sw/source/uibase/shells/textsh1.ts
- apps/office/src/sw/source/filter/xml/odt-named-paragraph-ownership.test.ts
- apps/office/src/sw/source/filter/xml/odt-layout-parity.test.ts
- apps/office/e2e/writer-named-style-history.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts
- docs/program/parity/writer-command-slice.json
Preserve registered document I/O/recovery deviations and all existing status/default/exception fields. Common style properties belong to named collections; automatic deltas belong to nodes. Existing geometry consumers and serialized listGeometryWins remain unchanged. All303of305prior test files stay byte-identical; only the inherited XML stream assertion and actual custom fixture style identity/parent assertions change. Relocate one driver local symbol and exactly3existing owned marker paths to the new helper.

## Plan

1. Restore document-owned custom creation and name lookup, bounded parent/follow/manual-rule copying, and graph16 custom declarations.
2. Split common-style materialization from the Writer XML driver; preserve own fields, actual parent/follow links, native list display-name resolution, invalid/cyclic parent handling and supported composite item subfield inheritance. Keep the existing builtin copy and Standard default-root adapters explicitly unverified.
3. Transport direct automatic changes and actual direct numbering while preserving the named parent through ODT. Permit registered custom styles in existing shell commands. Add literal raw-zero/mask, graph/package/clone/history and1280/390browser evidence. Correct only the two obsolete fixture/stream expectations and moved symbol/markers.
4. Execute the declared static gates and absent-directory test gates. Repeat failed gates only; never repeat a passing full suite. Restore vendor in finally, inspect screenshots, run source/provenance/parity/AP/scope checks, record exact-SHA same-actor evaluation and finish the leaf. Follow up the builtin-only toolbar chooser and remaining native geometry/default/style lifetime parity separately.

## Verify Steps

1. Custom collection creation/lookup/order/parent/follow/own defaults and destination copying match supported native docfmt responsibilities. Connected imported common styles never become direct paragraph margins/font/line fields; automatic zero/nonzero/first-only/left-only deltas remain direct. Native masks0/1/2/3 include same-style rule/margin priority and automatic list rule override. Literal tdf114287 paragraphs2/9/16 raw and applicability match native independent ownership.
2. Full graph16, ODT named/direct definitions and repeated read/write cycles preserve exact custom own items, parent/follow and raw names including XML punctuation/colon; builtin and undeclared-node validation preserved, family/container collisions independent. Registered custom shell/StyleApply and real shell edit/no-op/Undo/Redo retains graph and direct absence; destination copy isolates source items and respects existing destination style. Existing consumers and all303other prior tests unchanged; one existing XML stream assertion corrected with numeric literals unchanged.
3. Browser1280/390 real ODT opens actual custom styles and inherited first/raw formatting, preserves untouched paragraph, accepted dialog draft and Undo/Redo restores inherited ownership and later editing; inspect screenshots. Seven static gates pass. App and inventory coverage100%four metrics, scripts5/full Chromium only absent once; vendor restored finally, tests never read/compile/invoke upstream. No passing full suite repeated.
4. Read-only pinned source hashes and restored resources--check/source-tree/provenance/invariants/parity audits pass; exact17semantic paths and all303other prior tests byte-identical; one bounded XML stream assertion and one actual custom fixture identity/parent assertion changed; exactly3owned marker paths relocated, existing mapping statuses/defaults/exceptions unchanged with bounded evidence/new helper ownership. Whole ignored-inclusive AP forbidden0, routing/doctor and exact-SHA same-actor read-only EVALUATOR pass, final clean tracked leaf and parent progress.

## Verification

Command: split npm run verify gates plus exact scope/native hash and ignored-inclusive AP inspection recorded in task JSON summaries.
Result: pass. App1331/229and inventory109/36pass100%lines/statements/functions/branches; scripts5/2and Chromium87pass. All tests ran with the pinned directory absent. Only failed app/inventory gates repeated; no passing full suite repeated. All seven static gates pass, scoped corrections checked, final browser build/static output validated. Restored resources/source-tree/provenance/invariants pass; parity223modules/0violations. Five read-only source hashes,17paths,303unchanged prior tests and exact two bounded assertion updates verified. No native execution or source copies. Both screenshot widths inspected; current toolbar custom-style display remains a recorded next-iteration gap.

## Rollback Plan

Revert the scoped implementation commit if actual named/automatic ownership or transport contracts are disproved; no history rewrite/reset, coverage relaxation or registered deviation changes.

## Findings

Command: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure. Result: initial5fail/1325pass; then1331pass with one branch below100%; final1331/229pass100%four metrics. Native list display-name, invalid parent, composite item and empty direct-rule diagnostics were corrected without changing numeric literals. The generic XML port parent-alignment branch has a literal independent test. No app production change or app rerun after its passing gate.
Command: npm run test:inventory:coverage. Result: initial2fail/107pass, then1fail/108pass, final109/36pass100%four metrics. Correct the project fixture's actual Custom_5f_Style/Text body ownership; relocate3local markers and one local symbol to their real helper. No native runtime used. Scripts5and Chromium87run once absent and pass; vendor restored each finally.
Command: static gates and source/parity/scope/AP audits. Result: pass. The split initially exposed unused imports/converter and new E2E formatting; only those failed gates repeated, later scoped changes checked. Inline exact-scope replay had a duplicate const binding, corrected before final audit.17semantic paths;222old mapping rows retained in order plus one helper,9bounded descriptions/evidence appends, original statuses/defaults/exceptions unchanged. Two prior tests have precisely bounded ownership expectation changes;303prior tests unchanged. Whole ignored-inclusive AP has0forbidden source/helper/Python/binary/embedded source/source-frame/code-diff findings;5historical prose-only diff references retained.
Scope: custom collection creation/name lookup, bounded CopyTextColl parent/follow/manual rules, exact common/direct paragraph ownership and supported history/graph/ODT/shell/browser paths. Tdf114287 masks0/0/3 and raw first values−567match independent ownership. Native complete global default pools, creation undo, pool/help IDs, conditional styles/collisions/UNO/fonts/full style UI and geometry/tab/RTL/redline/frame lifetime remain separately unverified. Builtin copy adapter, Standard default root and serialized sideband remain explicit residuals. Screenshot1280shows sidebar Owned child while the existing toolbar chooser displays its builtin fallback; fix document-owned custom style chooser behavior as the next separate iteration. Registered I/O/recovery deviations unchanged.
