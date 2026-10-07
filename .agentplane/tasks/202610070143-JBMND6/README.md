---
id: "202610070143-JBMND6"
title: "Move cell vertical alignment into native document ownership and common selection state"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-07T01:44:20.433Z"
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
    body: "Start: implement native document-owned complete cell vertical alignment under standing iterative authorization; no upstream-executing tests or raw AP artifacts."
events:
  -
    type: "status"
    at: "2026-10-07T01:44:25.607Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native document-owned complete cell vertical alignment under standing iterative authorization; no upstream-executing tests or raw AP artifacts."
doc_version: 3
doc_updated_at: "2026-10-07T01:44:25.607Z"
doc_updated_by: "CODER"
description: "Iteration203: replace scalar kernel cell alignment and shell-owned mutation with full SwFormatVertOrient, native SwDoc SetBoxAttr/SetBoxAlign/GetBoxAlign selection and history; use common native dialog state and changed-item submission, preserving registered document I/O deviations."
sections:
  Summary: "Iteration203 replaces represented scalar cell alignment and shell-owned box mutations with native SwFormatVertOrient and document-owned cell attribute selection/history. Standing user iterative authorization; full parent/goal remains active and unverified."
  Scope: |-
    Approved exact production paths:
    apps/office/src/offapi/com/sun/star/text/VertOrientation.ts
    apps/office/src/offapi/com/sun/star/text/RelOrientation.ts
    apps/office/src/sw/inc/fmtornt.ts
    apps/office/src/sw/inc/hintids.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/ndtbl1.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/frmedt/fetab.ts
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/source/filter/xml/xmltbli.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx
    apps/office/src/sw/browser/presentation/writer-view.tsx
    Approved existing acceptance paths (only native item/enum fixture and assertion migrations or explicit changed-item submission corrections, no deleted cases or weakened semantic intent):
    apps/office/src/sw/browser/presentation/writer-view.test.tsx
    apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts
    apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts
    apps/office/src/sw/source/core/undo/native-insert-table-history.test.ts
    apps/office/e2e/writer-table-properties-history.spec.ts
    New acceptance paths:
    apps/office/src/sw/inc/fmtornt.test.ts
    apps/office/src/sw/source/core/docnode/native-cell-alignment-owner.test.ts
    apps/office/src/sw/source/filter/xml/native-cell-alignment-roundtrip.test.ts
    apps/office/src/sw/browser/presentation/native-cell-alignment-state.test.tsx
    apps/office/e2e/writer-native-cell-alignment.spec.ts
    Metadata: docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json, current leaf AP docs/bounded evidence and immutable-prefix parent append. No network/outside/global access, upstream invocation, upstream sources/Python/helper scripts/raw results/source maps in AP. Raw data only ignored application cache.
  Plan: |-
    1. Native VertOrientation/RelOrientation and complete SwFormatVertOrient item; cloned original box storage; document SetBoxAttr/SetBoxAlign/GetBoxAlign and thin shell delegates. Keep unrelated border/table paths scoped for future work.
    2. Native numeric property boundary, common shell dialog state and native changed-item submission, browser CSS enum rendering, ODT conversion and full primitive codec ingress/egress. Explicit acceptance migrations preserve intended old behavior except documented upstream changed-item correction.
    3. New native/codec/ODT/mounted/Chromium evidence, metadata bounded additions preserving old prefixes, static/source gates and single absence profile with real100 counters, evaluator and scoped commit/finish. Parent immutable prefix append only after leaf closure.
  Verify Steps: |-
    1. Six initial static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size; unchanged JSDoc validator scoped changed files and actual physical lines<1000. Only failed or genuinely changed checks afterward.
    2. ONE full upstream-absent npm run test:static, app coverage, inventory coverage, script tests, production Chromium profile. Restore vendor finally; await all source/audit handles before profile, no source/AP audits during absence. Only original failed or genuinely new cases afterward, rebuild production after production edits. Actual100% application/inventory coverage; only complete identical source/maps or contiguous identical complete function-body/full enclosing branch-location counters can be reused. Keep focused skips as skips.
    3. Native literal enums/defaults/full three-field equality/clone/query/update; setter ordinary full ring versus getter only current point, table cursor canonical selection, mixed65535, absent/foreign/no-selected admissions, same-value history, original graph/cursor lifetime and repeated UndoRedo. ODT top maps NONE, middle CENTER, bottom BOTTOM; codec preserves full position/relation without class transport; legacy scalar only storage ingress. Real browser1280/390 proves selected common dialog state, mixed native fallback and unchanged alignment omission, changed selected-cell alignment and history, no first-table-cell guessing. Existing acceptance semantic scenarios retained; explicit primitive-to-item/numeric ingress migrations proved against baseline541files; prior278metadata records/defaults/classifications/registered I/O deviations retained.
    4. After restoration source-dependent generation --check, source-tree/provenance/invariants/parity audits; doctor/routing/diff/pinned source hashes; current-leaf AP census0forbidden. Same-agent EVALUATOR explicitly not independent, final prose before canonical verify, implementationSHA commit/finish, clean tracked/untracked state. Preserve full536977-character parent prefix SHA2bb082e29f12548a1d2c55fb78d9954a1f9f287bcaebc5480a9177486420a848. Full native pooling/fly/layout/border/protection/shared formats and overall parity remain unproven.
  Verification: "Pending implementation and single upstream-absent verification profile."
  Rollback Plan: "Revert only the task-scoped implementation commit if needed; preserve source reference, registered I/O exceptions, existing DONE evidence and deferred stash. No destructive history operations."
  Findings: "Read-only source confirms lcl_GetBoxSel expands all ordinary ring points only for SetBoxAttr, GetBoxAlign reads current point unless native table cursor. SetBoxAlign constructs position0 with requested orientation and default PRINT_AREA relation. Table dialog Reset uses native common alignment and FillItemSet submits only changed valid orientation. Previous goal turn restated completed bullet correction; this leaf takes the next executable safe action. Two earlier guessed source lookups found no files; route recomputed before leaf creation or implementation. No processes live."
id_source: "generated"
---
## Summary

Iteration203 replaces represented scalar cell alignment and shell-owned box mutations with native SwFormatVertOrient and document-owned cell attribute selection/history. Standing user iterative authorization; full parent/goal remains active and unverified.

## Scope

Approved exact production paths:
apps/office/src/offapi/com/sun/star/text/VertOrientation.ts
apps/office/src/offapi/com/sun/star/text/RelOrientation.ts
apps/office/src/sw/inc/fmtornt.ts
apps/office/src/sw/inc/hintids.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/ndtbl1.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/frmedt/fetab.ts
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/source/filter/xml/xmltbli.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx
apps/office/src/sw/browser/presentation/writer-view.tsx
Approved existing acceptance paths (only native item/enum fixture and assertion migrations or explicit changed-item submission corrections, no deleted cases or weakened semantic intent):
apps/office/src/sw/browser/presentation/writer-view.test.tsx
apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts
apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts
apps/office/src/sw/source/core/undo/native-insert-table-history.test.ts
apps/office/e2e/writer-table-properties-history.spec.ts
New acceptance paths:
apps/office/src/sw/inc/fmtornt.test.ts
apps/office/src/sw/source/core/docnode/native-cell-alignment-owner.test.ts
apps/office/src/sw/source/filter/xml/native-cell-alignment-roundtrip.test.ts
apps/office/src/sw/browser/presentation/native-cell-alignment-state.test.tsx
apps/office/e2e/writer-native-cell-alignment.spec.ts
Metadata: docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json, current leaf AP docs/bounded evidence and immutable-prefix parent append. No network/outside/global access, upstream invocation, upstream sources/Python/helper scripts/raw results/source maps in AP. Raw data only ignored application cache.

## Plan

1. Native VertOrientation/RelOrientation and complete SwFormatVertOrient item; cloned original box storage; document SetBoxAttr/SetBoxAlign/GetBoxAlign and thin shell delegates. Keep unrelated border/table paths scoped for future work.
2. Native numeric property boundary, common shell dialog state and native changed-item submission, browser CSS enum rendering, ODT conversion and full primitive codec ingress/egress. Explicit acceptance migrations preserve intended old behavior except documented upstream changed-item correction.
3. New native/codec/ODT/mounted/Chromium evidence, metadata bounded additions preserving old prefixes, static/source gates and single absence profile with real100 counters, evaluator and scoped commit/finish. Parent immutable prefix append only after leaf closure.

## Verify Steps

1. Six initial static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size; unchanged JSDoc validator scoped changed files and actual physical lines<1000. Only failed or genuinely changed checks afterward.
2. ONE full upstream-absent npm run test:static, app coverage, inventory coverage, script tests, production Chromium profile. Restore vendor finally; await all source/audit handles before profile, no source/AP audits during absence. Only original failed or genuinely new cases afterward, rebuild production after production edits. Actual100% application/inventory coverage; only complete identical source/maps or contiguous identical complete function-body/full enclosing branch-location counters can be reused. Keep focused skips as skips.
3. Native literal enums/defaults/full three-field equality/clone/query/update; setter ordinary full ring versus getter only current point, table cursor canonical selection, mixed65535, absent/foreign/no-selected admissions, same-value history, original graph/cursor lifetime and repeated UndoRedo. ODT top maps NONE, middle CENTER, bottom BOTTOM; codec preserves full position/relation without class transport; legacy scalar only storage ingress. Real browser1280/390 proves selected common dialog state, mixed native fallback and unchanged alignment omission, changed selected-cell alignment and history, no first-table-cell guessing. Existing acceptance semantic scenarios retained; explicit primitive-to-item/numeric ingress migrations proved against baseline541files; prior278metadata records/defaults/classifications/registered I/O deviations retained.
4. After restoration source-dependent generation --check, source-tree/provenance/invariants/parity audits; doctor/routing/diff/pinned source hashes; current-leaf AP census0forbidden. Same-agent EVALUATOR explicitly not independent, final prose before canonical verify, implementationSHA commit/finish, clean tracked/untracked state. Preserve full536977-character parent prefix SHA2bb082e29f12548a1d2c55fb78d9954a1f9f287bcaebc5480a9177486420a848. Full native pooling/fly/layout/border/protection/shared formats and overall parity remain unproven.

## Verification

Pending implementation and single upstream-absent verification profile.

## Rollback Plan

Revert only the task-scoped implementation commit if needed; preserve source reference, registered I/O exceptions, existing DONE evidence and deferred stash. No destructive history operations.

## Findings

Read-only source confirms lcl_GetBoxSel expands all ordinary ring points only for SetBoxAttr, GetBoxAlign reads current point unless native table cursor. SetBoxAlign constructs position0 with requested orientation and default PRINT_AREA relation. Table dialog Reset uses native common alignment and FillItemSet submits only changed valid orientation. Previous goal turn restated completed bullet correction; this leaf takes the next executable safe action. Two earlier guessed source lookups found no files; route recomputed before leaf creation or implementation. No processes live.
