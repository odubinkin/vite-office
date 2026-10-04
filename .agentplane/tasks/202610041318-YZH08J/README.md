---
id: "202610041318-YZH08J"
title: "Restore document-shell ownership and native paragraph StyleApply arguments"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on:
  - "202610041221-KW28Q7"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T13:26:17.364Z"
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
    body: "Start: implement approved iteration105 native document-shell StyleApply owner/request boundary with existing paragraph primitive and safe absent-only verification; wider parity remains open."
  -
    author: "CODER"
    body: "Start: continue approved document-shell request ownership with native unsigned completion preservation; no product tests run yet."
events:
  -
    type: "status"
    at: "2026-10-04T13:19:52.368Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved iteration105 native document-shell StyleApply owner/request boundary with existing paragraph primitive and safe absent-only verification; wider parity remains open."
  -
    type: "status"
    at: "2026-10-04T13:26:17.913Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: continue approved document-shell request ownership with native unsigned completion preservation; no product tests run yet."
doc_version: 3
doc_updated_at: "2026-10-04T13:26:17.913Z"
doc_updated_by: "CODER"
description: "Iteration105 moves existing paragraph StyleApply from SwTextShell to SwDocShell as native docst.cxx, adds Template/Family and typed request items plus Style/FamilyName conversion, retains owned style names/cursor/history/current model and active view lifecycle, and preserves registered document I/O deviations. Existing popup/editable/nonparagraph/reset/style creation gaps remain open."
sections:
  Summary: "Iteration105 restores the existing paragraph StyleApply document-shell owner and native ordinary Template/Family request contract, retaining Style/FamilyName UNO conversion. Previous turn104 is verified progress: semantic e4e57091b476, closed leaf202610041221-KW28Q7 and parent progress2b78130bff81; current clean main is authoritative."
  Scope: |-
    Exactly11semantic paths:
    - apps/office/src/sw/source/uibase/app/docst.ts
    - apps/office/src/sw/source/uibase/app/docsh.ts
    - apps/office/src/sw/source/uibase/uiview/view.ts
    - apps/office/src/sw/source/uibase/shells/textsh1.ts
    - apps/office/src/sw/browser/composition/writer-module.tsx
    - apps/office/src/sw/source/uibase/app/docst.test.ts
    - apps/office/src/sw/source/uibase/shells/textsh1.test.ts
    - apps/office/src/sw/source/filter/xml/odt-named-paragraph-ownership.test.ts
    - apps/office/src/sfx2/source/control/dispatch.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    All311of313prior tests remain byte-identical; two existing source tests receive bounded owner/native argument updates without weakening paragraph/history assertions.225old mapping rows/order/status/default/exception fields preserved except5bounded descriptions;1new unverified native docst row gives226modules. No AP sources/helpers/Python/code diffs/raw diagnostics/archives/native probes. Readonly native source/hash comparison only, no native execution/compilation. Tests only absent/finally restore; no baseline tests/no passing full suites repeat/no concurrent source or scope or AP audits. No network/outside/global/subagents. Registered save/open/recovery deviations unchanged; new styles/reset/special popup/other style families/StyleDesigner and complete native style pool/state/default/UI parity remain open.
  Plan: |-
    1. SwDocShell owns a stable StyleApply Sfx shell/ExecStyleSheet/ApplyStyles boundary, associates its active SwView/GetWrtShell and releases it on close; SwView sets native view association and browser composition registers document shell beneath editing shells. Remove StyleApply from SwTextShell while retaining its editing primitive. The dispatcher preserves an already-completed caller-owned request, retaining the owner-supplied SfxUInt16Item result instead of overwriting it; generic completion behavior remains otherwise unchanged.
    2. docst.ts restores ordinary paragraph request resolution: Template plus numeric/string native Para2 Family defaults, recognized FamilyName override and paired Style-to-display conversion; typed SfxStringItem/SfxUInt16Item identities5552/5553/5566/6703 accepted through caller-owned SfxRequest. Actual document names/identities take precedence for display-name lookup, unused supported native defaults admitted by pool name; unknown/missing/unsupported families return no application, no false new-style creation. Existing browser Style/FamilyName/menu contracts remain intact; broader state/itemset/StyleDesigner/other-family parity not promoted.
    3. Owned real doc/view/frame tests prove slot ownership, request completion/native items/literal IDs, aliases/precedence/defaults/programmatic-to-display resolution, custom names and renamed/replaced graph identity, no-op/history/point-mark/other paragraph, detach/close and per-document isolation. Two old tests move to actual doc-shell owner/native arguments, retaining all other assertions. Existing full browser93cases check visible styles/focus/selection/clipboard/ODT/history.
    4. Seven static gates, then app/inventory100percent four metrics/scripts/fullChromium once only absent/finally restore; initial app reportOnFailure, recover only failed gates or changed-code affected scenarios, no passing full suite repeat/no baseline. After restoration4source-only audits/resources--check/parity226zero; exact11paths/311unchangedprior tests/2bounded updates/225oldrows5appends1newrow/native hashes/ignoredinclusive AP forbidden0/routingdoctor. Semantic commit, committed verification/exact same-actor read-only quality, clean leaf closure/parent progress. Goal remains open.
  Verify Steps: |-
    1. StyleApply slot5552 resolves to SwDocShell and is absent from SwTextShell; active view lifecycle controls owner eligibility/current model and instance isolation, state preserves current existing ID contract. Typed5552Template/5553Family/5566FamilyName/6703Style and ordinary structured/URL payloads yield actual Para2 application. Valid Style+FamilyName conversion overrides Template, FamilyName overrides Family; exact owned custom display names/case/punctuation are retained, unused known defaults work, unknown/missing/nonparagraph args never apply/create styles. Supported non-API requests preserve owner-supplied unsigned Para2 or None0 results through real dispatch, including no-op success; dispatcher never overwrites a completed request. Independent literals and real owner/request/frame execution, not native probes.
    2. Real retained point/mark/no-op/history/UndoRedo/other paragraph/model replacement/renamed graph owners and actual browser session slot registration hold. All311other prior files byte-identical; two bounded old tests retain original primitive/history assertions and now test the doc-shell owner/native payload. Full existing93Chromium cases retain visible styles/focus/typing/clipboard/selection/ODT contracts; no registered deviations changed.
    3. Seven static gates pass. App/inventory100percent statements/branches/functions/lines and scripts/fullChromium only absent/finally restore; one passing full run each, only failures or final changed-code affected scopes recover, no present-then-absent duplication/pre-fix tests/concurrent source/scope/AP audit. Initial app coverage.reportOnFailure. Final source4audits/resources/parity226zero, exact11paths/225oldrows5appends1newunverifiedrow, read-only native hashes and whole ignored-inclusive AP forbidden0, routing/doctor. Semanticcommit with exact-SHA same-actor readonly pass and committed verification/clean closure/parent progress. Wider core/UI/native/state/pool/StyleDesigner/nonparagraph parity remains unverified.
  Verification: "Pending approved implementation; no tests or static gates run iteration105."
  Rollback Plan: "Revert only this semantic commit through a new approved leaf; preserve immutable DONE records, native pins and registered I/O/recovery deviations. Vendor absence orchestration restores the directory in finally on every exit."
  Findings: "Read-only pinned native _docsh.sdi registers ExecStyleSheet; docst.cxx accepts Template5552/Family5553 and paired Style6703/FamilyName5566 conversion, native Para2 default and FamilyName override; ApplyStyles searches actual style pool, returns None when absent, applies via active GetWrtShell. svx toolbar dispatches Template+Family after client focus. Local SwTextShell instead owns StyleApply, only reads Style, ignores Family and returns exceptions for absent names; native request/pool/owner contracts diverge. This coherent owner/request repair retains current supported paragraph primitive and marks remaining StyleDesigner/other families/full pool/state/default/native widget responsibilities open. Native docst ApplyStyleSheetRequest supplies SfxUInt16Item with the returned family and then completes the request; native dispatcher Call_Impl observes IsDone without overwriting the return item. Local ExecuteRequest unconditionally completes synchronous requests again and destroys unsigned owner results. One additional dispatcher path and its bounded mapping description are necessary for the same StyleApply request contract; API-mode boolean return, missing no-args StyleDesigner dispatch and broader Sfx completion semantics remain unverified. Standing goal authorizes this coherent local scope amendment."
id_source: "generated"
---
## Summary

Iteration105 restores the existing paragraph StyleApply document-shell owner and native ordinary Template/Family request contract, retaining Style/FamilyName UNO conversion. Previous turn104 is verified progress: semantic e4e57091b476, closed leaf202610041221-KW28Q7 and parent progress2b78130bff81; current clean main is authoritative.

## Scope

Exactly11semantic paths:
- apps/office/src/sw/source/uibase/app/docst.ts
- apps/office/src/sw/source/uibase/app/docsh.ts
- apps/office/src/sw/source/uibase/uiview/view.ts
- apps/office/src/sw/source/uibase/shells/textsh1.ts
- apps/office/src/sw/browser/composition/writer-module.tsx
- apps/office/src/sw/source/uibase/app/docst.test.ts
- apps/office/src/sw/source/uibase/shells/textsh1.test.ts
- apps/office/src/sw/source/filter/xml/odt-named-paragraph-ownership.test.ts
- apps/office/src/sfx2/source/control/dispatch.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
All311of313prior tests remain byte-identical; two existing source tests receive bounded owner/native argument updates without weakening paragraph/history assertions.225old mapping rows/order/status/default/exception fields preserved except5bounded descriptions;1new unverified native docst row gives226modules. No AP sources/helpers/Python/code diffs/raw diagnostics/archives/native probes. Readonly native source/hash comparison only, no native execution/compilation. Tests only absent/finally restore; no baseline tests/no passing full suites repeat/no concurrent source or scope or AP audits. No network/outside/global/subagents. Registered save/open/recovery deviations unchanged; new styles/reset/special popup/other style families/StyleDesigner and complete native style pool/state/default/UI parity remain open.

## Plan

1. SwDocShell owns a stable StyleApply Sfx shell/ExecStyleSheet/ApplyStyles boundary, associates its active SwView/GetWrtShell and releases it on close; SwView sets native view association and browser composition registers document shell beneath editing shells. Remove StyleApply from SwTextShell while retaining its editing primitive. The dispatcher preserves an already-completed caller-owned request, retaining the owner-supplied SfxUInt16Item result instead of overwriting it; generic completion behavior remains otherwise unchanged.
2. docst.ts restores ordinary paragraph request resolution: Template plus numeric/string native Para2 Family defaults, recognized FamilyName override and paired Style-to-display conversion; typed SfxStringItem/SfxUInt16Item identities5552/5553/5566/6703 accepted through caller-owned SfxRequest. Actual document names/identities take precedence for display-name lookup, unused supported native defaults admitted by pool name; unknown/missing/unsupported families return no application, no false new-style creation. Existing browser Style/FamilyName/menu contracts remain intact; broader state/itemset/StyleDesigner/other-family parity not promoted.
3. Owned real doc/view/frame tests prove slot ownership, request completion/native items/literal IDs, aliases/precedence/defaults/programmatic-to-display resolution, custom names and renamed/replaced graph identity, no-op/history/point-mark/other paragraph, detach/close and per-document isolation. Two old tests move to actual doc-shell owner/native arguments, retaining all other assertions. Existing full browser93cases check visible styles/focus/selection/clipboard/ODT/history.
4. Seven static gates, then app/inventory100percent four metrics/scripts/fullChromium once only absent/finally restore; initial app reportOnFailure, recover only failed gates or changed-code affected scenarios, no passing full suite repeat/no baseline. After restoration4source-only audits/resources--check/parity226zero; exact11paths/311unchangedprior tests/2bounded updates/225oldrows5appends1newrow/native hashes/ignoredinclusive AP forbidden0/routingdoctor. Semantic commit, committed verification/exact same-actor read-only quality, clean leaf closure/parent progress. Goal remains open.

## Verify Steps

1. StyleApply slot5552 resolves to SwDocShell and is absent from SwTextShell; active view lifecycle controls owner eligibility/current model and instance isolation, state preserves current existing ID contract. Typed5552Template/5553Family/5566FamilyName/6703Style and ordinary structured/URL payloads yield actual Para2 application. Valid Style+FamilyName conversion overrides Template, FamilyName overrides Family; exact owned custom display names/case/punctuation are retained, unused known defaults work, unknown/missing/nonparagraph args never apply/create styles. Supported non-API requests preserve owner-supplied unsigned Para2 or None0 results through real dispatch, including no-op success; dispatcher never overwrites a completed request. Independent literals and real owner/request/frame execution, not native probes.
2. Real retained point/mark/no-op/history/UndoRedo/other paragraph/model replacement/renamed graph owners and actual browser session slot registration hold. All311other prior files byte-identical; two bounded old tests retain original primitive/history assertions and now test the doc-shell owner/native payload. Full existing93Chromium cases retain visible styles/focus/typing/clipboard/selection/ODT contracts; no registered deviations changed.
3. Seven static gates pass. App/inventory100percent statements/branches/functions/lines and scripts/fullChromium only absent/finally restore; one passing full run each, only failures or final changed-code affected scopes recover, no present-then-absent duplication/pre-fix tests/concurrent source/scope/AP audit. Initial app coverage.reportOnFailure. Final source4audits/resources/parity226zero, exact11paths/225oldrows5appends1newunverifiedrow, read-only native hashes and whole ignored-inclusive AP forbidden0, routing/doctor. Semanticcommit with exact-SHA same-actor readonly pass and committed verification/clean closure/parent progress. Wider core/UI/native/state/pool/StyleDesigner/nonparagraph parity remains unverified.

## Verification

Pending approved implementation; no tests or static gates run iteration105.

## Rollback Plan

Revert only this semantic commit through a new approved leaf; preserve immutable DONE records, native pins and registered I/O/recovery deviations. Vendor absence orchestration restores the directory in finally on every exit.

## Findings

Read-only pinned native _docsh.sdi registers ExecStyleSheet; docst.cxx accepts Template5552/Family5553 and paired Style6703/FamilyName5566 conversion, native Para2 default and FamilyName override; ApplyStyles searches actual style pool, returns None when absent, applies via active GetWrtShell. svx toolbar dispatches Template+Family after client focus. Local SwTextShell instead owns StyleApply, only reads Style, ignores Family and returns exceptions for absent names; native request/pool/owner contracts diverge. This coherent owner/request repair retains current supported paragraph primitive and marks remaining StyleDesigner/other families/full pool/state/default/native widget responsibilities open. Native docst ApplyStyleSheetRequest supplies SfxUInt16Item with the returned family and then completes the request; native dispatcher Call_Impl observes IsDone without overwriting the return item. Local ExecuteRequest unconditionally completes synchronous requests again and destroys unsigned owner results. One additional dispatcher path and its bounded mapping description are necessary for the same StyleApply request contract; API-mode boolean return, missing no-args StyleDesigner dispatch and broader Sfx completion semantics remain unverified. Standing goal authorizes this coherent local scope amendment.
