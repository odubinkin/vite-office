---
id: "202610041358-88ZWE6"
title: "Restore inclusive paragraph style selection and native range undo ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610041318-YZH08J"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T14:00:17.075Z"
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
    body: "Start: restore the existing paragraph StyleApply inclusive point/mark traversal and one native range undo under core owners; source-only native analysis, product tests only absent."
events:
  -
    type: "status"
    at: "2026-10-04T14:00:17.533Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the existing paragraph StyleApply inclusive point/mark traversal and one native range undo under core owners; source-only native analysis, product tests only absent."
doc_version: 3
doc_updated_at: "2026-10-04T14:00:17.533Z"
doc_updated_by: "CODER"
description: "Iteration106: close actual supported paragraph style point/mark traversal and one SwUndoFormatColl range under native edit/undo owners, preserving canonical node and list ownership and browser history; source comparison only, tests only absent, no AP source/helpers."
sections:
  Summary: "Iteration106 closes the actual paragraph-style inclusive point/mark traversal and range undo owner gap. Prior iteration105 is verified authoritative progress: semantic a716f39030d3d586907be865fccf88526853de85, closed202610041318-YZH08J, parent progress5c4b084b1ff9. Current main is clean; user standing goal authorizes this coherent local repair."
  Scope: |-
    Exactly10semantic paths:
    - apps/office/src/sw/source/core/edit/edfcol.ts
    - apps/office/src/sw/source/core/doc/docfmt.ts
    - apps/office/src/sw/source/core/undo/unfmco.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/shells/textsh1.ts
    - apps/office/src/sw/source/core/edit/edfcol.test.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - apps/office/e2e/writer-style-selection.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    All313of314prior test files remain byte-identical; only one native undo-constructor case changes to the actual range/collection contract without weakening any original payload/history/foreign-target assertion.226old mapping rows/order/status/default/exception fields preserved except4bounded description/evidence appends;1new unverified edfcol row gives227modules. No AP source/helpers/Python/code diffs/raw diagnostics/archives/native probes. Readonly native source/hash comparison only, no native execution/compilation. Tests only absent/finally restore; no baseline/pre-fix/present tests/no passing full suites repeat/no concurrent source/scope/AP audits. No network/outside/global/subagents. Registered save/open/recovery deviations untouched. Direct paragraph reset, full-node hint cleanup, modifier/list reset, native unchanged-request history, multiple cursor rings/read-only/layout/redline/inline heading, API/StyleDesigner/other families and complete core/browser/native state/default parity remain unverified.
  Plan: |-
    1. Restore native docfmt inclusive node-index traversal across the actual SwNodes graph, selecting all text nodes from ordered point/mark endpoints including empty/end-offset0/table-cell paragraphs, while rejecting foreign or detached active ranges. Do not reuse character-range filtering, which excludes zero-width paragraph boundaries.
    2. Move the bounded paragraph-style editing operation from SwTextShell to the source-shaped SwEditShell edfcol owner consumed by SwWrtShell. Retain SetParagraphStyle ID convenience API, supported-default validation and existing unchanged-selection no-op behavior as explicitly still-unverified native history semantics. StyleApply remains owned by SwDocShell and automatically consumes the restored range.
    3. Refactor SwUndoFormatColl to consume actual SwPaM and SwTextFormatColl, capture per-node original collection/list items/suppression under one action, retain exact point/mark/history, restore every selected node, and redo by saved native collection display name like native DoSetFormatColl. Reject foreign target/collection graphs; no per-paragraph shell action loops or browser-owned state. Update only the old constructor fixture to actual range/collection, preserving its assertions.
    4. Independent real owner/model/range/frame tests cover forward/reversed/collapsed ranges, mixed already-active style, empty/end-zero/table/non-text skip, custom parent/follow ownership, retained list/suppression history, node and cursor identities, no-op entire-range, replacement/instance isolation, foreign/detached guards and renamed-missing redo lookup. Actual desktop/mobile browser ODT select/toolbar/sidebar/focus/UndoRedo/export/typing scenarios prove visible multi-paragraph application and untouched neighbors. No browser API model hooks/native probes.
    5. Seven static gates, then app/inventory100percent four metrics/scripts/full Chromium once only absent/finally restore; initial app reportOnFailure, recover only failures or final changed-code affected scopes, no passing full suite repeat. After restoration4source-only audits/resources--check/parity227zero; strict10paths/313unchangedprior tests/1bounded constructor update/226oldrows4appends1unverifiedrow/native hashes/ignoredinclusive AP forbidden0/routingdoctor. Exact semantic commit then same-actor read-only quality/committed verification/clean leaf closure and parent progress. Broad goal remains open.
  Verify Steps: |-
    1. Actual SwNodes inclusive traversal and core edfcol owner apply a requested owned paragraph collection to every selected text node in document order, including empty and end-offset0 paragraphs/table cells, forward/backward/collapsed and mixed already-active endpoint styles. No unselected node/style graph changes; foreign/detached range or collection rejects before mutation. SetParagraphStyle remains a convenience port, SwTextShell no longer owns its primitive, SwDocShell StyleApply owner/result contract remains. Independent literal style IDs and actual core/view/frame/session execution only.
    2. One real SwUndoFormatColl consumes SwPaM/collection, restores all original per-node styles/list direct items/suppression and exact original point/mark orientation/identity through repeated UndoRedo; redo uses captured native collection name and safely leaves nodes unchanged when that name no longer exists. Whole-range unchanged state retains current local no-op contract as unverified native history, not falsely promoted. Original313other prior files byte-identical; one constructor fixture only changes input shape and retains every assertion. Desktop/mobile actual ODT/browser scenarios prove all selected paragraph styles/toolbar/sidebar/focus/history/export and untouched neighbors without browser model injection.
    3. Seven static gates/routing/doctor pass; app/inventory100percent all four metrics/scripts/full Chromium only absent/finally restore, no baseline/pre-fix/present tests or passing full suite repeat/concurrent source/scope/AP audits. Initial app reportOnFailure. Final source4audits/resources--check/parity227zero;10exactpaths/226oldrows4appends1newunverified/314priorfiles313unchanged1boundedfixture/native hashes/APignoredinclusive forbidden0. Semantic commit exact evaluated_sha same-actor readonly pass, committed verification/clean closure/parent progress; registered deviations unchanged and complete core/UI/native state/default/reset/history/selection-ring parity remains open.
  Verification: "Pending approved implementation; no iteration106 tests or static gates have run."
  Rollback Plan: "Revert only this semantic commit through a new approved leaf; keep immutable DONE records, native pin and registered I/O/recovery deviations. Absent-vendor orchestration restores the repository-local directory in finally on every exit."
  Findings: "Readonly pinned SwEditShell::SetTextFormatColl in edfcol.cxx dispatches document-range application, SwDoc::SetTextFormatColl in docfmt.cxx visits ordered node span including the final node and skips non-text nodes, and native SwUndoFormatColl retains range/history and redoes by saved display name. Local SwTextShell instead changes only GetActiveParagraph and short-circuits when that node already matches, leaving the rest of a multi-paragraph selection untouched. Local SwUndoFormatColl accepts one paragraph/old/new IDs. This task closes the independent range traversal/undo owner gap completely for the current single PaM graph; direct reset/hints/list modifiers/native repeat-no-op history and broader native operations remain distinct unverified obligations, not registered deviations."
id_source: "generated"
---
## Summary

Iteration106 closes the actual paragraph-style inclusive point/mark traversal and range undo owner gap. Prior iteration105 is verified authoritative progress: semantic a716f39030d3d586907be865fccf88526853de85, closed202610041318-YZH08J, parent progress5c4b084b1ff9. Current main is clean; user standing goal authorizes this coherent local repair.

## Scope

Exactly10semantic paths:
- apps/office/src/sw/source/core/edit/edfcol.ts
- apps/office/src/sw/source/core/doc/docfmt.ts
- apps/office/src/sw/source/core/undo/unfmco.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/shells/textsh1.ts
- apps/office/src/sw/source/core/edit/edfcol.test.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts
- apps/office/e2e/writer-style-selection.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
All313of314prior test files remain byte-identical; only one native undo-constructor case changes to the actual range/collection contract without weakening any original payload/history/foreign-target assertion.226old mapping rows/order/status/default/exception fields preserved except4bounded description/evidence appends;1new unverified edfcol row gives227modules. No AP source/helpers/Python/code diffs/raw diagnostics/archives/native probes. Readonly native source/hash comparison only, no native execution/compilation. Tests only absent/finally restore; no baseline/pre-fix/present tests/no passing full suites repeat/no concurrent source/scope/AP audits. No network/outside/global/subagents. Registered save/open/recovery deviations untouched. Direct paragraph reset, full-node hint cleanup, modifier/list reset, native unchanged-request history, multiple cursor rings/read-only/layout/redline/inline heading, API/StyleDesigner/other families and complete core/browser/native state/default parity remain unverified.

## Plan

1. Restore native docfmt inclusive node-index traversal across the actual SwNodes graph, selecting all text nodes from ordered point/mark endpoints including empty/end-offset0/table-cell paragraphs, while rejecting foreign or detached active ranges. Do not reuse character-range filtering, which excludes zero-width paragraph boundaries.
2. Move the bounded paragraph-style editing operation from SwTextShell to the source-shaped SwEditShell edfcol owner consumed by SwWrtShell. Retain SetParagraphStyle ID convenience API, supported-default validation and existing unchanged-selection no-op behavior as explicitly still-unverified native history semantics. StyleApply remains owned by SwDocShell and automatically consumes the restored range.
3. Refactor SwUndoFormatColl to consume actual SwPaM and SwTextFormatColl, capture per-node original collection/list items/suppression under one action, retain exact point/mark/history, restore every selected node, and redo by saved native collection display name like native DoSetFormatColl. Reject foreign target/collection graphs; no per-paragraph shell action loops or browser-owned state. Update only the old constructor fixture to actual range/collection, preserving its assertions.
4. Independent real owner/model/range/frame tests cover forward/reversed/collapsed ranges, mixed already-active style, empty/end-zero/table/non-text skip, custom parent/follow ownership, retained list/suppression history, node and cursor identities, no-op entire-range, replacement/instance isolation, foreign/detached guards and renamed-missing redo lookup. Actual desktop/mobile browser ODT select/toolbar/sidebar/focus/UndoRedo/export/typing scenarios prove visible multi-paragraph application and untouched neighbors. No browser API model hooks/native probes.
5. Seven static gates, then app/inventory100percent four metrics/scripts/full Chromium once only absent/finally restore; initial app reportOnFailure, recover only failures or final changed-code affected scopes, no passing full suite repeat. After restoration4source-only audits/resources--check/parity227zero; strict10paths/313unchangedprior tests/1bounded constructor update/226oldrows4appends1unverifiedrow/native hashes/ignoredinclusive AP forbidden0/routingdoctor. Exact semantic commit then same-actor read-only quality/committed verification/clean leaf closure and parent progress. Broad goal remains open.

## Verify Steps

1. Actual SwNodes inclusive traversal and core edfcol owner apply a requested owned paragraph collection to every selected text node in document order, including empty and end-offset0 paragraphs/table cells, forward/backward/collapsed and mixed already-active endpoint styles. No unselected node/style graph changes; foreign/detached range or collection rejects before mutation. SetParagraphStyle remains a convenience port, SwTextShell no longer owns its primitive, SwDocShell StyleApply owner/result contract remains. Independent literal style IDs and actual core/view/frame/session execution only.
2. One real SwUndoFormatColl consumes SwPaM/collection, restores all original per-node styles/list direct items/suppression and exact original point/mark orientation/identity through repeated UndoRedo; redo uses captured native collection name and safely leaves nodes unchanged when that name no longer exists. Whole-range unchanged state retains current local no-op contract as unverified native history, not falsely promoted. Original313other prior files byte-identical; one constructor fixture only changes input shape and retains every assertion. Desktop/mobile actual ODT/browser scenarios prove all selected paragraph styles/toolbar/sidebar/focus/history/export and untouched neighbors without browser model injection.
3. Seven static gates/routing/doctor pass; app/inventory100percent all four metrics/scripts/full Chromium only absent/finally restore, no baseline/pre-fix/present tests or passing full suite repeat/concurrent source/scope/AP audits. Initial app reportOnFailure. Final source4audits/resources--check/parity227zero;10exactpaths/226oldrows4appends1newunverified/314priorfiles313unchanged1boundedfixture/native hashes/APignoredinclusive forbidden0. Semantic commit exact evaluated_sha same-actor readonly pass, committed verification/clean closure/parent progress; registered deviations unchanged and complete core/UI/native state/default/reset/history/selection-ring parity remains open.

## Verification

Pending approved implementation; no iteration106 tests or static gates have run.

## Rollback Plan

Revert only this semantic commit through a new approved leaf; keep immutable DONE records, native pin and registered I/O/recovery deviations. Absent-vendor orchestration restores the repository-local directory in finally on every exit.

## Findings

Readonly pinned SwEditShell::SetTextFormatColl in edfcol.cxx dispatches document-range application, SwDoc::SetTextFormatColl in docfmt.cxx visits ordered node span including the final node and skips non-text nodes, and native SwUndoFormatColl retains range/history and redoes by saved display name. Local SwTextShell instead changes only GetActiveParagraph and short-circuits when that node already matches, leaving the rest of a multi-paragraph selection untouched. Local SwUndoFormatColl accepts one paragraph/old/new IDs. This task closes the independent range traversal/undo owner gap completely for the current single PaM graph; direct reset/hints/list modifiers/native repeat-no-op history and broader native operations remain distinct unverified obligations, not registered deviations.
