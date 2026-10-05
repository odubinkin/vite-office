---
id: "202610052306-4VZ510"
title: "Align native Writer list context dispatch and current-level command state"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T23:18:33.834Z"
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
    body: "Start: implement source-owned text/list command context and current-point native level state under standing approved iteration; preserve IO exceptions and one absent-profile verification."
events:
  -
    type: "status"
    at: "2026-10-05T23:07:33.055Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-owned text/list command context and current-point native level state under standing approved iteration; preserve IO exceptions and one absent-profile verification."
doc_version: 3
doc_updated_at: "2026-10-05T23:18:33.256Z"
doc_updated_by: "CODER"
description: "Iteration168: move existing list creation/removal/continuation commands from permanent list shell into existing native text shell; select actual native numbered context using represented SwWrtShell GetSelectionType, activate SwListShell below SwTextShell through SwView SelectShell, and use native GetNumLevel current-point state for existing single-level commands. Source-shaped responsibility splits retain mandatory1000-line limits. No new list/subpoint feature or IO policy change; verify actual core/DOM/production behavior with one full upstream-absent profile and failed/new-only recovery."
sections:
  Summary: "Align represented native Writer text/list command ownership, list context stack and current-point level command state."
  Scope: |-
    apps/office/src/sw/source/core/edit/ednumber.ts
    apps/office/src/sw/source/uibase/shells/listsh.ts
    apps/office/src/sw/source/uibase/shells/textsh1.ts
    apps/office/src/sw/source/uibase/shells/textsh1-commands.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts
    apps/office/src/sw/source/uibase/inc/wrtsh.ts
    apps/office/src/sw/source/uibase/uiview/view.ts
    apps/office/src/sw/browser/composition/writer-module.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts
    apps/office/src/sw/source/uibase/shells/native-list-context.test.ts
    apps/office/src/sw/browser/editor/native-list-context.test.tsx
    apps/office/e2e/writer-native-list-context.spec.ts
    apps/office/src/sw/browser/editor/native-cell-list-level.test.tsx
    Existing behavior refactor; no new subpoint command or IO workflow policy.
  Plan: |-
    Iteration168 under standing explicitly authorized iterative native core/UI convergence; one CODER leaf/direct main. Current IncrementLevel/DecrementLevel map to FN_NUM_BULLET_UP/DOWN and must retain NumUpDown, not incorrectly replace them with outline/subpoint operations. Native SwListShell GetState uses current cursor point GetNumLevel, not normalized whole-range eligibility. Native SwWrtShell GetSelectionType NumberList requires current actual rule, list membership and a non-NONE format; SwView SelectShell conditionally installs SwListShell below SwTextShell. Current browser composition permanently registers list shell and list creation/removal/continuation wrongly belong to listsh rather than existing textsh1. Move these methods/descriptors intact into existing SwTextShell and thin existing WrtShell forwarding; remove old list-owner methods/registry rather than adding compatibility forwarding. Native GetNumLevel returns actual nonnegative point level or MAXLEVEL10 sentinel. Implement represented native SelectionType constants/header and GetSelectionType Text/Table/TableCell/NumberList point logic; use actual node rule/tree membership and native level clamp, no DTO/text-run conversion. SwView SelectShell uses native selection-type cache with TableCell masking and dispatcher Pop/Push actual list-before-text identities; bootstrap calls it after base registration, model/selection hints update it before state invalidation. Other native contexts/table row-col subtype/layout/readonly/fly/toolbar framework remain explicitly unrepresented/unverified rather than simulated. Preserve IO workflow shell ordering/contracts and registered exceptions. Mandatory1000line limit requires source-shaped textsh1 command registry and wrtsh1 selection body splits; no new manager/model/adaptor/preparation/no-op callback/browser heuristic.9 production paths including3 new native partial owners;2 metadata paths;source-confirmed old Continue Numbering test ownership correction only, optional exact old cell-state correction only if initial failure contradicts pinned current-point behavior.432 prior tests and255 prior semantic records/evidence/defaults/classes/IO exceptions preserved otherwise;3newpartialunverifiedowners258modules. New actual core native level/sentinel/rule/membership/NONE/text/table/current-point forward/reverse multi-range/rejected-but-enabled/rings/shell stack/undo-redo/format invalidation/Open replacement/Close tests;mounted DOM command context state/execution/caret/current-point and production1280/390 ordinary ODT Open/multiselection/menu state/typing/UndoRedo/list exit-reentry. Six initial statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile. Onlyoriginalfailed/genuine new cases and changed-file/failed gates after;actual100%L/S/F/B source/map identity or contiguous unchanged source locations only;raw maps/results ignored app cache. AP bounded English prose/counts/hashes/outcomes/exact failed names only,no sources/helpers/Python/probes/rawdiffs/sourceframes/rawdiagnostics. Five restored audits/scope/APscan/doctor/routing/explicitsameagentEVALexactSHA/canonicalfinish/wholepriorparentFindingsappend/cleanmain. No network/outside/global/subagents. Full core/UI/list/table parity remains unverified,goalACTIVE.
    Source-confirmed registry extraction relocates createWriterTextCommandRegistry localSymbol from textsh1.ts to textsh1-commands.ts without re-export/compatibility wrapper; preserve all prior evidence and semantic/default/classification/IO fields, audit this one intentional symbol-ownership relocation. Browser composition is outside native runtime/provenance module inventories; five existing native source owners extended,three new partial unverified owners added.
  Verify Steps: |-
    1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Onlyfailedgates or changed-file remediation afterward.
    2. ONE full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore;testsneverread/invoke/compileupstream; exactfailednames/counts/errors/hashes beforeassertions,skipped=skipped. Actual100%L/S/F/B app/inventory;maps/results/sourcecopies onlyignoredappcache. No passing/full replay;onlyoriginalfailed/genuinelynewcases/failedgates/changed-filechecks.
    3. Native GetNumLevel current point and sentinel10; single-level slots preserveNumUpDown;native SwListShell current-level GetState independent of all-range operation preflight. Native NumberList rule+membership+non-NONE context and represented Text/Table/TableCell flags; actual SwView SelectShell list-before-text stack activation/removal on cursor/model/format/history/Open replacement. Existing list-kind/continuation semantics and descriptors now owned by existing native textsh1; no compatibility layer/newmodel/DTO/no-opcallback/preparation. Actual core+mounted DOM+production Chromium1280/390 ordinaryOpen/liststate/multiselection/caret/commands/typing/UndoRedo. Mandatory1000line gate maintained through source-owned registry/query splits.
    4.432prior tests preserved except exact source-confirmed ContinueNumbering owner correction; optional oldcell availability assertion only if contradicted by pinned current-point state and initial failure.255prior semanticstates/defaults/classes/IOexceptions/evidence preserved,with one exact source-owned createWriterTextCommandRegistry localSymbol relocation to the mandatory registry split;3newpartialunverifiedowners258modules,no fullmodule/broad promotion. Native draw/other contexts/table row-col subtype/layout/readonly/fly/toolbar/framework gating and fullKeyInput/fullcore/UI/list/table parity remainunverified. Conscious IO deviations unchanged.
    5. Five restored audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Exact scope/prior-tests/metadata/sourcehash/APignoredinclusive/doctor/routing/diffcheck. ExplicitsameagentEVALexactsemanticSHApass,verify/canonicalmeaningfulfinish,wholepriorparentFindingsappend,cleantracked/untrackedmain;goalACTIVE.
  Verification: "Pending six statics,one upstream-absent profile,source audits and exact-SHA same-agent review."
  Rollback Plan: "Revert only the intentional semantic commit through a new executable task if needed; DONE task artifacts remain immutable."
  Findings: "Read-only pinned source confirms IncrementLevel/DecrementLevel→FN_NUM_BULLET_UP/DOWN→NumUpDown. Separate subpoint commands are not these existing slots. Native GetNumLevel reads current point with sentinel10; list GetState disables only point level0/9. Native NumberList context excludes NONE formats; SwView pushes list shell below text shell. Existing textsh1 owns FN_NUM_CONTINUE/list toggle state. Current fixed list registration and full-range CanNumUpDown availability differ; selected approach repairs actual native ownership/context/state."
id_source: "generated"
---
## Summary

Align represented native Writer text/list command ownership, list context stack and current-point level command state.

## Scope

apps/office/src/sw/source/core/edit/ednumber.ts
apps/office/src/sw/source/uibase/shells/listsh.ts
apps/office/src/sw/source/uibase/shells/textsh1.ts
apps/office/src/sw/source/uibase/shells/textsh1-commands.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts
apps/office/src/sw/source/uibase/inc/wrtsh.ts
apps/office/src/sw/source/uibase/uiview/view.ts
apps/office/src/sw/browser/composition/writer-module.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts
apps/office/src/sw/source/uibase/shells/native-list-context.test.ts
apps/office/src/sw/browser/editor/native-list-context.test.tsx
apps/office/e2e/writer-native-list-context.spec.ts
apps/office/src/sw/browser/editor/native-cell-list-level.test.tsx
Existing behavior refactor; no new subpoint command or IO workflow policy.

## Plan

Iteration168 under standing explicitly authorized iterative native core/UI convergence; one CODER leaf/direct main. Current IncrementLevel/DecrementLevel map to FN_NUM_BULLET_UP/DOWN and must retain NumUpDown, not incorrectly replace them with outline/subpoint operations. Native SwListShell GetState uses current cursor point GetNumLevel, not normalized whole-range eligibility. Native SwWrtShell GetSelectionType NumberList requires current actual rule, list membership and a non-NONE format; SwView SelectShell conditionally installs SwListShell below SwTextShell. Current browser composition permanently registers list shell and list creation/removal/continuation wrongly belong to listsh rather than existing textsh1. Move these methods/descriptors intact into existing SwTextShell and thin existing WrtShell forwarding; remove old list-owner methods/registry rather than adding compatibility forwarding. Native GetNumLevel returns actual nonnegative point level or MAXLEVEL10 sentinel. Implement represented native SelectionType constants/header and GetSelectionType Text/Table/TableCell/NumberList point logic; use actual node rule/tree membership and native level clamp, no DTO/text-run conversion. SwView SelectShell uses native selection-type cache with TableCell masking and dispatcher Pop/Push actual list-before-text identities; bootstrap calls it after base registration, model/selection hints update it before state invalidation. Other native contexts/table row-col subtype/layout/readonly/fly/toolbar framework remain explicitly unrepresented/unverified rather than simulated. Preserve IO workflow shell ordering/contracts and registered exceptions. Mandatory1000line limit requires source-shaped textsh1 command registry and wrtsh1 selection body splits; no new manager/model/adaptor/preparation/no-op callback/browser heuristic.9 production paths including3 new native partial owners;2 metadata paths;source-confirmed old Continue Numbering test ownership correction only, optional exact old cell-state correction only if initial failure contradicts pinned current-point behavior.432 prior tests and255 prior semantic records/evidence/defaults/classes/IO exceptions preserved otherwise;3newpartialunverifiedowners258modules. New actual core native level/sentinel/rule/membership/NONE/text/table/current-point forward/reverse multi-range/rejected-but-enabled/rings/shell stack/undo-redo/format invalidation/Open replacement/Close tests;mounted DOM command context state/execution/caret/current-point and production1280/390 ordinary ODT Open/multiselection/menu state/typing/UndoRedo/list exit-reentry. Six initial statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile. Onlyoriginalfailed/genuine new cases and changed-file/failed gates after;actual100%L/S/F/B source/map identity or contiguous unchanged source locations only;raw maps/results ignored app cache. AP bounded English prose/counts/hashes/outcomes/exact failed names only,no sources/helpers/Python/probes/rawdiffs/sourceframes/rawdiagnostics. Five restored audits/scope/APscan/doctor/routing/explicitsameagentEVALexactSHA/canonicalfinish/wholepriorparentFindingsappend/cleanmain. No network/outside/global/subagents. Full core/UI/list/table parity remains unverified,goalACTIVE.
Source-confirmed registry extraction relocates createWriterTextCommandRegistry localSymbol from textsh1.ts to textsh1-commands.ts without re-export/compatibility wrapper; preserve all prior evidence and semantic/default/classification/IO fields, audit this one intentional symbol-ownership relocation. Browser composition is outside native runtime/provenance module inventories; five existing native source owners extended,three new partial unverified owners added.

## Verify Steps

1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Onlyfailedgates or changed-file remediation afterward.
2. ONE full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore;testsneverread/invoke/compileupstream; exactfailednames/counts/errors/hashes beforeassertions,skipped=skipped. Actual100%L/S/F/B app/inventory;maps/results/sourcecopies onlyignoredappcache. No passing/full replay;onlyoriginalfailed/genuinelynewcases/failedgates/changed-filechecks.
3. Native GetNumLevel current point and sentinel10; single-level slots preserveNumUpDown;native SwListShell current-level GetState independent of all-range operation preflight. Native NumberList rule+membership+non-NONE context and represented Text/Table/TableCell flags; actual SwView SelectShell list-before-text stack activation/removal on cursor/model/format/history/Open replacement. Existing list-kind/continuation semantics and descriptors now owned by existing native textsh1; no compatibility layer/newmodel/DTO/no-opcallback/preparation. Actual core+mounted DOM+production Chromium1280/390 ordinaryOpen/liststate/multiselection/caret/commands/typing/UndoRedo. Mandatory1000line gate maintained through source-owned registry/query splits.
4.432prior tests preserved except exact source-confirmed ContinueNumbering owner correction; optional oldcell availability assertion only if contradicted by pinned current-point state and initial failure.255prior semanticstates/defaults/classes/IOexceptions/evidence preserved,with one exact source-owned createWriterTextCommandRegistry localSymbol relocation to the mandatory registry split;3newpartialunverifiedowners258modules,no fullmodule/broad promotion. Native draw/other contexts/table row-col subtype/layout/readonly/fly/toolbar/framework gating and fullKeyInput/fullcore/UI/list/table parity remainunverified. Conscious IO deviations unchanged.
5. Five restored audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Exact scope/prior-tests/metadata/sourcehash/APignoredinclusive/doctor/routing/diffcheck. ExplicitsameagentEVALexactsemanticSHApass,verify/canonicalmeaningfulfinish,wholepriorparentFindingsappend,cleantracked/untrackedmain;goalACTIVE.

## Verification

Pending six statics,one upstream-absent profile,source audits and exact-SHA same-agent review.

## Rollback Plan

Revert only the intentional semantic commit through a new executable task if needed; DONE task artifacts remain immutable.

## Findings

Read-only pinned source confirms IncrementLevel/DecrementLevel→FN_NUM_BULLET_UP/DOWN→NumUpDown. Separate subpoint commands are not these existing slots. Native GetNumLevel reads current point with sentinel10; list GetState disables only point level0/9. Native NumberList context excludes NONE formats; SwView pushes list shell below text shell. Existing textsh1 owns FN_NUM_CONTINUE/list toggle state. Current fixed list registration and full-range CanNumUpDown availability differ; selected approach repairs actual native ownership/context/state.
