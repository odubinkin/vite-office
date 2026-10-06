---
id: "202610061150-GJFD5D"
title: "Remove synthetic paragraph descriptions from Writer text surfaces"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T11:55:07.329Z"
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
    body: "Start: Execute approved iteration186 native paragraph text-surface scope under standing iterative UI authorization."
events:
  -
    type: "status"
    at: "2026-10-06T11:55:07.830Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute approved iteration186 native paragraph text-surface scope under standing iterative UI authorization."
doc_version: 3
doc_updated_at: "2026-10-06T11:55:07.830Z"
doc_updated_by: "CODER"
description: "Iteration186: source accessible paragraph descriptions are empty; remove browser-only hidden style/list text and describedby adapter so native DOM ranges contain document content, with precise old assertion correction and real body/cell/browser acceptance."
sections:
  Summary: "Iteration186 removes synthetic hidden style/list descriptions from native Writer text surfaces. Source SwAccessibleParagraph description is empty; actual paragraph text, attributes and native formatting controls retain their separate owners."
  Scope: "apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx; apps/office/src/framework/browser/app/desktop.test.tsx; apps/office/src/sw/browser/editor/cell-paragraph-rendering.test.tsx; apps/office/src/sw/browser/editor/native-table-headlines.test.tsx; apps/office/e2e/writer-lists.spec.ts; apps/office/e2e/writer-cell-paragraph-format.spec.ts; apps/office/src/sw/browser/editor/native-paragraph-text-surface.test.tsx; apps/office/e2e/writer-native-paragraph-text-surface.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Five old acceptance files receive only source-contradicting description/description-ID assertion corrections; all other480 prior files byte-identical and substantive layout/history/list assertions preserved. Two new acceptance files. All270 semantic statuses/defaults/classes and entire responsibility/justification/evidence prefixes preserved; source-backed additions only. No core/save/open/recovery changes, network/outside/global access or subagents. AP only bounded English prose/counts/hashes/outcomes/exact failures; raw cases/maps/source snapshots in ignored app cache."
  Plan: "Standing iterative UI/refactor authorization applies. Remove hidden paragraph metadata span, React useId/styleDescriptionId and aria-describedby. Do not relocate metadata to another hidden registry, mask selection with CSS, keep synthetic descriptions through title/aria-description, or rewrite native text. Pinned accpara.cxx getAccessibleDescription returns empty, getText/getTextRange expose GetString and formatting attributes are separate. Retain actual paragraph/node IDs, labels, inherited editing host, source portion text and visual native numbering/line-number projections. Correct exact contradictory old assertions in five files while preserving all other assertions; repeated headlines retain original native coordinates/rows and empty descriptions. Add actual mounted body/table cross-paragraph forward/reverse Ctrl/Meta and formatting/history cases plus Chromium selection/text/a11y cases. Six initial static gates then ONE full upstream-absent profile; only original failures/genuine new cases and failed/changed-path checks thereafter. Restored source/scope/artifact/governance gates and exact-SHA same-agent review. One leaf; whole goal ACTIVE/full parity UNVERIFIED."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size once initially, repeat only failed gates/changed paths. Scoped unchanged JSDoc and actual physical-line counts<1000 on changed source/acceptance files.
    2. ONE full upstream-absent profile: npm run test:static; app/inventory full coverage with --coverage.reportOnFailure and JSON raw cases/maps; scripts acceptance; Chromium against dist. Rename vendor inside repo and restore in finally. Persist exact failures/counts/errors/hashes before assertion; no source/scope/AP audits while absence live. Only original failures/new genuine cases afterward; no passing/full replay. Runtime/tests never invoke pinned upstream; any coverage transfer requires entire identical maps or complete contiguous byte-identical source ranges and actual counters.
    3. New real mounted body/cell forward/reversed cross-paragraph selection contains model text and no Paragraph style/list metadata; Ctrl/Meta A state/DOM, style/list changes, replacement Undo/Redo, native node identities and repeated headline projections unchanged. Native empty accessible descriptions and existing formatting controls verified. Chromium body/cell selection exactly matches expected text including native paragraph breaks; empty descriptions/no describedby/helper IDs; model copy excludes metadata. Every prior assertion remains except precise source-contradicting synthetic description/ID expectations in five declared files; all other480 old files byte-identical. Actual100 app/inventory coverage; skips stay skipped.
    4. After restore resource generation --check/source-tree/provenance/invariants/parity once. All270 states/defaults/classes/prefixes preserved; scoped semantic diff, no AP source/helper/raw-report artifacts, doctor/routing/diff and same-agent exact-SHA quality. Intentional source/evidence/verify/clean close; entire parent Findings prefix preserved. Native numbering-label selection/line-decoration/complete accessibility and whole core/UI parity remain unverified outside this leaf.
  Verification: "Pending removal of synthetic paragraph description text and declared gates."
  Rollback Plan: "Use a separate scoped leaf to revert if native text, selection, formatting/history or browser accessibility regresses; preserve DONE evidence and conscious I/O deviations."
  Findings: "185 DONE implementation324f8c3e3984fddb682a3739f7dfeac145e0e3bf, close0d54d08495613d157868a2573808a2337f7e7c0a; parent checkpoint66827dd6915e5d8534a8b93454d10877e02e9c5e. Previous turn made verified progress. Discovered hidden span Paragraph style/list and per-occurrence useId aria-describedby in shared body/cell/measurement paragraph renderer. Pinned accpara.cxx getAccessibleDescription returns empty, getText/GetTextRange uses actual accessible string, formatting attributes separate. Local installed a11y library lacks aria-description support; no dependency/network workaround needed because source requires empty description. Initial narrow search found one style assertion; complete targeted search identifies five old files with synthetic description/ID expectations, all explicitly scoped before approval. No implementation mutation yet. Core/current visual label/line decoration and full accessibility/native UI parity remain unverified."
id_source: "generated"
---
## Summary

Iteration186 removes synthetic hidden style/list descriptions from native Writer text surfaces. Source SwAccessibleParagraph description is empty; actual paragraph text, attributes and native formatting controls retain their separate owners.

## Scope

apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx; apps/office/src/framework/browser/app/desktop.test.tsx; apps/office/src/sw/browser/editor/cell-paragraph-rendering.test.tsx; apps/office/src/sw/browser/editor/native-table-headlines.test.tsx; apps/office/e2e/writer-lists.spec.ts; apps/office/e2e/writer-cell-paragraph-format.spec.ts; apps/office/src/sw/browser/editor/native-paragraph-text-surface.test.tsx; apps/office/e2e/writer-native-paragraph-text-surface.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Five old acceptance files receive only source-contradicting description/description-ID assertion corrections; all other480 prior files byte-identical and substantive layout/history/list assertions preserved. Two new acceptance files. All270 semantic statuses/defaults/classes and entire responsibility/justification/evidence prefixes preserved; source-backed additions only. No core/save/open/recovery changes, network/outside/global access or subagents. AP only bounded English prose/counts/hashes/outcomes/exact failures; raw cases/maps/source snapshots in ignored app cache.

## Plan

Standing iterative UI/refactor authorization applies. Remove hidden paragraph metadata span, React useId/styleDescriptionId and aria-describedby. Do not relocate metadata to another hidden registry, mask selection with CSS, keep synthetic descriptions through title/aria-description, or rewrite native text. Pinned accpara.cxx getAccessibleDescription returns empty, getText/getTextRange expose GetString and formatting attributes are separate. Retain actual paragraph/node IDs, labels, inherited editing host, source portion text and visual native numbering/line-number projections. Correct exact contradictory old assertions in five files while preserving all other assertions; repeated headlines retain original native coordinates/rows and empty descriptions. Add actual mounted body/table cross-paragraph forward/reverse Ctrl/Meta and formatting/history cases plus Chromium selection/text/a11y cases. Six initial static gates then ONE full upstream-absent profile; only original failures/genuine new cases and failed/changed-path checks thereafter. Restored source/scope/artifact/governance gates and exact-SHA same-agent review. One leaf; whole goal ACTIVE/full parity UNVERIFIED.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size once initially, repeat only failed gates/changed paths. Scoped unchanged JSDoc and actual physical-line counts<1000 on changed source/acceptance files.
2. ONE full upstream-absent profile: npm run test:static; app/inventory full coverage with --coverage.reportOnFailure and JSON raw cases/maps; scripts acceptance; Chromium against dist. Rename vendor inside repo and restore in finally. Persist exact failures/counts/errors/hashes before assertion; no source/scope/AP audits while absence live. Only original failures/new genuine cases afterward; no passing/full replay. Runtime/tests never invoke pinned upstream; any coverage transfer requires entire identical maps or complete contiguous byte-identical source ranges and actual counters.
3. New real mounted body/cell forward/reversed cross-paragraph selection contains model text and no Paragraph style/list metadata; Ctrl/Meta A state/DOM, style/list changes, replacement Undo/Redo, native node identities and repeated headline projections unchanged. Native empty accessible descriptions and existing formatting controls verified. Chromium body/cell selection exactly matches expected text including native paragraph breaks; empty descriptions/no describedby/helper IDs; model copy excludes metadata. Every prior assertion remains except precise source-contradicting synthetic description/ID expectations in five declared files; all other480 old files byte-identical. Actual100 app/inventory coverage; skips stay skipped.
4. After restore resource generation --check/source-tree/provenance/invariants/parity once. All270 states/defaults/classes/prefixes preserved; scoped semantic diff, no AP source/helper/raw-report artifacts, doctor/routing/diff and same-agent exact-SHA quality. Intentional source/evidence/verify/clean close; entire parent Findings prefix preserved. Native numbering-label selection/line-decoration/complete accessibility and whole core/UI parity remain unverified outside this leaf.

## Verification

Pending removal of synthetic paragraph description text and declared gates.

## Rollback Plan

Use a separate scoped leaf to revert if native text, selection, formatting/history or browser accessibility regresses; preserve DONE evidence and conscious I/O deviations.

## Findings

185 DONE implementation324f8c3e3984fddb682a3739f7dfeac145e0e3bf, close0d54d08495613d157868a2573808a2337f7e7c0a; parent checkpoint66827dd6915e5d8534a8b93454d10877e02e9c5e. Previous turn made verified progress. Discovered hidden span Paragraph style/list and per-occurrence useId aria-describedby in shared body/cell/measurement paragraph renderer. Pinned accpara.cxx getAccessibleDescription returns empty, getText/GetTextRange uses actual accessible string, formatting attributes separate. Local installed a11y library lacks aria-description support; no dependency/network workaround needed because source requires empty description. Initial narrow search found one style assertion; complete targeted search identifies five old files with synthetic description/ID expectations, all explicitly scoped before approval. No implementation mutation yet. Core/current visual label/line decoration and full accessibility/native UI parity remain unverified.
