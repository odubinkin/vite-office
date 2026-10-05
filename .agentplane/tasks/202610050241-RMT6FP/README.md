---
id: "202610050241-RMT6FP"
title: "Restore native attribute history for same-node deletion undo"
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
  updated_at: "2026-10-05T02:42:44.632Z"
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
    body: "Start: restore native same-node delete attribute history under standing parity goal."
events:
  -
    type: "status"
    at: "2026-10-05T02:42:45.019Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native same-node delete attribute history under standing parity goal."
doc_version: 3
doc_updated_at: "2026-10-05T02:42:45.019Z"
doc_updated_by: "CODER"
description: "Continuation134: restore SwHistorySetText/SwHistory capture and rollback,raw deleted text with NOHINTEXPAND and reconstructed native hints for same-node SwUndoDelete;keep selection replacement unchanged until this dependency is verified."
sections:
  Summary: "Restore native attribute history for same-node deletion undo."
  Scope: |-
    - apps/office/src/sw/inc/swtypes.ts
    - apps/office/src/sw/source/core/undo/rolbck.ts
    - apps/office/src/sw/source/core/undo/undel.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/txtnode/ndhints-range.ts
    - apps/office/src/sw/source/core/txtnode/thints.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - apps/office/src/sw/source/core/undo/native-delete-history.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore source-owned SwHistoryHint/SwHistorySetText/SwHistory in rolbck for implemented AUTO/INET old-attribute capture. Store cloned native item,index,start,end,FormatIgnoreStart/End only;rebuild actual hints through MakeTextAttr and native InsertItem undo mode NOTXTATRCHR4|NOHINTADJUST8,constructor flags reset rather than DTO flags replay. CopyAttr uses native half-open boundary test;Rollback reverse and destructive,TmpRollback defaultreverse or forward with retained entries/endDiff,SetTmpEnd resets replay boundary. New history module whollyunverified. Add native SetAttrMode values in existing swtypes;only InsertItem NOHINTADJUST path implemented,ordinary BuildPortions and other modes explicitly remain unimplemented/unverified. Add native SwpHints Insert/DeleteAtPos ownership and ClearSwpHintsArr all supported ranged families;retain allocated empty map. Move two existing binary-search helper bodies unchanged into existing ndhints-range and extract existing node character/toggled/hyperlink fragment bodies unchanged into ndtxt-hints to satisfy1000-line gates;no helper module. SwUndoDelete retains raw m_aSttStr and whole original-node attribute history,not clipped hint fragment or undo-node text;undo clears hints,inserts NOHINTEXPAND2 then forward temporary rollback;redo restores history tmp-end and erases;grouped deletes keep original history and concatenate raw strings;dispose releases owned history/text. Preserve constructor calling shape except deletedFragment becomes deletedText:string;two shell callers use source substring,four test constructors migrate .text only. Only observed prior undo-node ownership case may change after first-profile failure to reflect action-owned text,other359of360prior files byteidentical and all other prior expectations unchanged. Add literal source-independent history order/partial/tmp boundaries,CopyAttr zeros/end exclusions,cloned INET7fields/IDs/shared AUTO handle,reconstructed defaults/ignore flags/native maps/node/backlinks,actual erasure/undo/redo/grouping/cursor/disposal tests. Keep selection insertion adapters unchanged. Preserve242existingruntime states/defaults/exceptions with bounded appendices/helpermappings;one history row whollyunverified,total243,no promotion. Sixstaticfirst;one sequential absent full build/app/inventory/scripts/Chromium with immediate exactfailednames capture and finally restoration;repeat only failed gates/cases,zero passing repeats. Restore before5sourceaudits/scope/nativehash/APforbidden/exactSHA same-actor read-only quality/doctor/routing/CODERverify/canonicalfinish. English bounded prose/counts/hashes only in AP,no code/source/helpers/Python/rawdiagnostics,no upstream invocation bytests,no network/outside/globalaccess. Registered I/O deviations preserved;full native history variants/SwRegHistory/fields/style clients/nesting/BuildPortions/managergrouping/multicursor/structuralhistory/core/UI remain unverified."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Audit360prior testfiles,242existingruntime rows,new unverifiedhistory module,native hashes and exact semanticSHA. Staticfirst,one absentprofile,failedonlyreplays,restore before audits. No source/helper/code/Python/rawdiagnostic APartifacts.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: "Preflight134:cleanmain 9678ca50f5fcfb907a241ff075114a56a1839e38,direct,onlyparentactive.133 verifiedprogress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native undel.cxx455 SaveContent copies all node hints and retains raw startstring;1043 clears hints,InsertText NOHINTEXPAND,1059 forward TmpRollback;1233 redo resetsTmpEnd. rolbck.cxx222 clones item/index/range/FormatIgnore only,250 InsertItem with12;1242 reverseRollback,1257 tmp reverse/forward,endDiff;1335 CopyAttr half-open including interiorzero excludingendzero. Native thints.cxx1316 InsertItem MakeTextAttr,3330 NOHINTADJUST bypasses automatic merging,3466 ClearSwpHintsArr retains empty map;ndhints.cxx188 owns Insert/DeleteAtPos. Current deleteundo retains clipped fragments inundoNodes and restitchesINET. Node/map994lines require measured helper extraction. Four matched policies read,user-instructions absent;standing goal authorizes safe local scope."
id_source: "generated"
---
## Summary

Restore native attribute history for same-node deletion undo.

## Scope

- apps/office/src/sw/inc/swtypes.ts
- apps/office/src/sw/source/core/undo/rolbck.ts
- apps/office/src/sw/source/core/undo/undel.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/txtnode/ndhints-range.ts
- apps/office/src/sw/source/core/txtnode/thints.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts
- apps/office/src/sw/source/core/undo/native-delete-history.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore source-owned SwHistoryHint/SwHistorySetText/SwHistory in rolbck for implemented AUTO/INET old-attribute capture. Store cloned native item,index,start,end,FormatIgnoreStart/End only;rebuild actual hints through MakeTextAttr and native InsertItem undo mode NOTXTATRCHR4|NOHINTADJUST8,constructor flags reset rather than DTO flags replay. CopyAttr uses native half-open boundary test;Rollback reverse and destructive,TmpRollback defaultreverse or forward with retained entries/endDiff,SetTmpEnd resets replay boundary. New history module whollyunverified. Add native SetAttrMode values in existing swtypes;only InsertItem NOHINTADJUST path implemented,ordinary BuildPortions and other modes explicitly remain unimplemented/unverified. Add native SwpHints Insert/DeleteAtPos ownership and ClearSwpHintsArr all supported ranged families;retain allocated empty map. Move two existing binary-search helper bodies unchanged into existing ndhints-range and extract existing node character/toggled/hyperlink fragment bodies unchanged into ndtxt-hints to satisfy1000-line gates;no helper module. SwUndoDelete retains raw m_aSttStr and whole original-node attribute history,not clipped hint fragment or undo-node text;undo clears hints,inserts NOHINTEXPAND2 then forward temporary rollback;redo restores history tmp-end and erases;grouped deletes keep original history and concatenate raw strings;dispose releases owned history/text. Preserve constructor calling shape except deletedFragment becomes deletedText:string;two shell callers use source substring,four test constructors migrate .text only. Only observed prior undo-node ownership case may change after first-profile failure to reflect action-owned text,other359of360prior files byteidentical and all other prior expectations unchanged. Add literal source-independent history order/partial/tmp boundaries,CopyAttr zeros/end exclusions,cloned INET7fields/IDs/shared AUTO handle,reconstructed defaults/ignore flags/native maps/node/backlinks,actual erasure/undo/redo/grouping/cursor/disposal tests. Keep selection insertion adapters unchanged. Preserve242existingruntime states/defaults/exceptions with bounded appendices/helpermappings;one history row whollyunverified,total243,no promotion. Sixstaticfirst;one sequential absent full build/app/inventory/scripts/Chromium with immediate exactfailednames capture and finally restoration;repeat only failed gates/cases,zero passing repeats. Restore before5sourceaudits/scope/nativehash/APforbidden/exactSHA same-actor read-only quality/doctor/routing/CODERverify/canonicalfinish. English bounded prose/counts/hashes only in AP,no code/source/helpers/Python/rawdiagnostics,no upstream invocation bytests,no network/outside/globalaccess. Registered I/O deviations preserved;full native history variants/SwRegHistory/fields/style clients/nesting/BuildPortions/managergrouping/multicursor/structuralhistory/core/UI remain unverified.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Audit360prior testfiles,242existingruntime rows,new unverifiedhistory module,native hashes and exact semanticSHA. Staticfirst,one absentprofile,failedonlyreplays,restore before audits. No source/helper/code/Python/rawdiagnostic APartifacts.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Preflight134:cleanmain 9678ca50f5fcfb907a241ff075114a56a1839e38,direct,onlyparentactive.133 verifiedprogress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native undel.cxx455 SaveContent copies all node hints and retains raw startstring;1043 clears hints,InsertText NOHINTEXPAND,1059 forward TmpRollback;1233 redo resetsTmpEnd. rolbck.cxx222 clones item/index/range/FormatIgnore only,250 InsertItem with12;1242 reverseRollback,1257 tmp reverse/forward,endDiff;1335 CopyAttr half-open including interiorzero excludingendzero. Native thints.cxx1316 InsertItem MakeTextAttr,3330 NOHINTADJUST bypasses automatic merging,3466 ClearSwpHintsArr retains empty map;ndhints.cxx188 owns Insert/DeleteAtPos. Current deleteundo retains clipped fragments inundoNodes and restitchesINET. Node/map994lines require measured helper extraction. Four matched policies read,user-instructions absent;standing goal authorizes safe local scope.
