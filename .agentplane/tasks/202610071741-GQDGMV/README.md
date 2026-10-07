---
id: "202610071741-GQDGMV"
title: "Apply native StarBats and StarMath bullet symbol import conversion"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 17
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
  updated_at: "2026-10-07T17:42:49.448Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T18:12:21.324Z"
  updated_by: "CODER"
  note: "PASS exact implementation 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e; same-current-agent EVALUATOR explicitly not independent PASS. ONE upstream-absent full runtime 13582 app/110 inventory/15 infrastructure/286 Chromium, zero passing replay, source-bound all-four app and inventory coverage 100 percent; final static/source/scope/artifact gates PASS, residuals recorded. Final Findings and Verification persisted before this canonical verification."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T18:11:31.914Z"
  updated_by: "EVALUATOR"
  note: "Same-current-agent EVALUATOR review, explicitly not independent: actual implementation 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e passes bounded scope. ONE full upstream-absent runtime: 13582 app, 110 inventory, 15 infrastructure, 286 Chromium cases; zero passing replay. Actual source-bound app/inventory all four coverage dimensions 100 percent."
  evaluated_sha: "9a561bd4ee6196bfcb6ed957891741af8ed8ae5e"
  blueprint_digest: "7e2d1ae6900ecf99c77a699e5824b3c522a64db1caf487e2137a33e3183ae6ec"
  evidence_refs:
    - ".agentplane/tasks/202610071741-GQDGMV/README.md"
    - ".agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071741-GQDGMV/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071741-GQDGMV/evidence/exact-sha-review.json"
  findings:
    - "Exact 448 native table entries and uint16/zero/out-of-range/repeated conversion behavior match pinned source. XML importer owns lazy converters; UI receives native glyph and StarSymbol Font. All prior acceptance retained, only two type-only aliases changed. Native import classes, other conversion tables, full physical glyph coverage, font shaping/configuration and generic empty bullet behavior remain partial or unverified; persistent parity goal remains active."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: native legacy bullet glyph/family conversion with actual immutable tables, lazy importer owner, explicit SAX factory port, source symbol fallback and complete existing I/O deviation preservation."
events:
  -
    type: "status"
    at: "2026-10-07T17:42:49.963Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native legacy bullet glyph/family conversion with actual immutable tables, lazy importer owner, explicit SAX factory port, source symbol fallback and complete existing I/O deviation preservation."
  -
    type: "verify"
    at: "2026-10-07T18:12:21.324Z"
    author: "CODER"
    state: "ok"
    note: "PASS exact implementation 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e; same-current-agent EVALUATOR explicitly not independent PASS. ONE upstream-absent full runtime 13582 app/110 inventory/15 infrastructure/286 Chromium, zero passing replay, source-bound all-four app and inventory coverage 100 percent; final static/source/scope/artifact gates PASS, residuals recorded. Final Findings and Verification persisted before this canonical verification."
doc_version: 3
doc_updated_at: "2026-10-07T18:12:21.389Z"
doc_updated_by: "CODER"
description: "Iteration222: existing ODT bullet glyph/family input must follow xmlnumi GetProperties legacy font conversion, native immutable unotools tables and lazy SvXMLImport converter ownership; actual browser symbol fallback follows native StarSymbol/OpenSymbol relation. Preserve deliberate I/O/recovery deviations and all unrelated prior acceptance/metadata."
sections:
  Summary: "Port the actual existing StarBats/StarMath bullet import conversion through pinned unotools ConvertChar tables and xmlnumi GetProperties. Preserve all224 slots in both tables, U+00xx/U+F0xx aliases, uint16 narrowing/subtraction, zero-slot substitution U+E12C, out-of-range retention and native ASCII family matching/publication mutation including repeated GetProperties behavior. Add bounded actual SvXMLImport lazy conversion ownership instead of placing conversion in a browser or Writer adapter: replace its interface-only placeholder with the source-shaped implemented conversion base; keep SAX root factory as explicit structural SvXMLImportRootFactory. Existing Writer table import coordinator inherits that base; production list contexts borrow the actual importer, isolated existing constructor calls obtain the same implemented owner. Preserve existing constructor callers and all other context fields/contracts; class remains explicitly partial, no full-native claim. Add StarSymbol browser face backed by existing OpenSymbol resource following source-related symbol fallback, preserve stored StarSymbol family; complete physical font coverage remains separately unverified. Register unotools and native xmloff->unotools edge in dependency checker with fresh boundary assertions, never bypass enforcement. Tests: frozen native conversion output census plus literal context controls/legacy repeated publication, actual common/automatic/body/cell/Worker/package reopen and real Chromium fonts/glyph/gap/typing/history at1280/390.14semantic paths. Preserve597 prior acceptance files, only2 exact type-import aliases to renamed root port with all inputs/assertions retained; any further old expectation migration only after actual original failure and exact source proof. Preserve all301prior metadata fields/statuses/defaults/prefixes/exceptions plus1explicitly unverified unotools record,302total. Standing user goal authorizes safe local parity/refactoring work, no new confirmation. No network/outside-repo access, subagents, upstream/source/Python/raw artifacts in AgentPlane. Same current agent role phases, EVALUATOR explicitly not independent."
  Scope: |-
    apps/office/src/unotools/source/misc/fontcvt.ts
    apps/office/src/xmloff/source/core/xmlimp.ts
    apps/office/src/xmloff/source/style/xmlnumi.ts
    apps/office/src/sw/source/filter/xml/xmltbli.ts
    apps/office/src/sw/source/filter/xml/xmlimp.ts
    apps/office/src/vcl/browser/lo-runtime-fonts.css
    scripts/check-module-boundaries.mjs
    apps/office/src/xmloff/source/style/native-legacy-bullet-symbol.test.ts
    apps/office/e2e/native-legacy-bullet-symbol.spec.ts
    scripts/check-legacy-font-boundary.test.ts
    apps/office/src/xmloff/source/core/xmlimp.test.ts
    apps/office/src/sax/source/fastparser/fastparser.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Port the actual existing StarBats/StarMath bullet import conversion through pinned unotools ConvertChar tables and xmlnumi GetProperties. Preserve all224 slots in both tables, U+00xx/U+F0xx aliases, uint16 narrowing/subtraction, zero-slot substitution U+E12C, out-of-range retention and native ASCII family matching/publication mutation including repeated GetProperties behavior. Add bounded actual SvXMLImport lazy conversion ownership instead of placing conversion in a browser or Writer adapter: replace its interface-only placeholder with the source-shaped implemented conversion base; keep SAX root factory as explicit structural SvXMLImportRootFactory. Existing Writer table import coordinator inherits that base; production list contexts borrow the actual importer, isolated existing constructor calls obtain the same implemented owner. Preserve existing constructor callers and all other context fields/contracts; class remains explicitly partial, no full-native claim. Add StarSymbol browser face backed by existing OpenSymbol resource following source-related symbol fallback, preserve stored StarSymbol family; complete physical font coverage remains separately unverified. Register unotools and native xmloff->unotools edge in dependency checker with fresh boundary assertions, never bypass enforcement. Tests: frozen native conversion output census plus literal context controls/legacy repeated publication, actual common/automatic/body/cell/Worker/package reopen and real Chromium fonts/glyph/gap/typing/history at1280/390.14semantic paths. Preserve597 prior acceptance files, only2 exact type-import aliases to renamed root port with all inputs/assertions retained; any further old expectation migration only after actual original failure and exact source proof. Preserve all301prior metadata fields/statuses/defaults/prefixes/exceptions plus1explicitly unverified unotools record,302total. Standing user goal authorizes safe local parity/refactoring work, no new confirmation. No network/outside-repo access, subagents, upstream/source/Python/raw artifacts in AgentPlane. Same current agent role phases, EVALUATOR explicitly not independent."
  Verify Steps: "Initial6static once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. ONE full runtime without vendor:hide vendor/libreoffice-reference; test:static,full app/inventory coverage,14existing infrastructure plus fresh boundary cases,full Chromium; finally restore, freeze source/task writes until actual terminal handle. Tests never invoke pinned source; later runtime only original failures or genuinely new cases, zero passing replay. Later static/source only failed or changed inputs. Require actual current-source app/inventory all4coverage100 via entire identical source/maps or contiguous complete declaration/body/enclosing-branch/all-locations proofs; no skips/exclusions/clamps/threshold changes. Check all224entries both aliases and source uint16/zero/out-of-range semantics, context font matching and native repeated GetProperties mutation, actual original Font/Rule/Worker/ODT ownership and Chromium font loading/glyph/spacing/history. After restore run resource generator--check,source-tree,source-provenance,invariants,parity. Preserve597old cases/tests except2type-only import aliases, all301prior metadata plus1unverified mapping; bounded English evidence/source anchors/hashes/counts only. JSDoc/actual physical<1000,artifact census,doctor/routing/diff,clean actual implementation SHA review,full parent Findings prefix/deferred stash preserved. Final Findings/Verification before canonical verify; persist canonical verification before finish actual implementation SHA, never mutate DONE leaf."
  Verification: |-
    PASS: complete native legacy import table branch and actual XML import owner/glyph/family publication; all13582app110inventory15infrastructure286Chromium in ONE upstream-absent full profile,zero runtime failed/skipped/uncaught/passing replay; no closure or unchanged rebuild. Actual current-source all4 app/inventory coverage100,299+38whole sources/maps and4complete prior app regions; invalid raw paintfrm whole map replaced only by previous entire identical-source verified certificate. All7production unchanged after full build/Chromium. Initial5other static PASS; frozen-handle type failure and closure1 fresh Which-constructor type failure closed by final root typecheck/scoped changed checks;5restored-only source gates/scoped JSDoc/physical<1000(max963 inclCSS)/scope301prior metadata+1unverified302/597old595unchanged2exact type-only aliases all assertions retained/448native table values identical/doctor0errors2oldwarnings/routing/diff/artifacts PASS. Clean actual implementation SHA 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e review PASS and same-current-agent explicitly not independent EVALUATOR PASS at .agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/quality-report.json. Final canonical verification checkpoint before finish actual implementation SHA; full goal remains ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T18:12:21.324Z — VERIFY — ok

    By: CODER

    Note: PASS exact implementation 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e; same-current-agent EVALUATOR explicitly not independent PASS. ONE upstream-absent full runtime 13582 app/110 inventory/15 infrastructure/286 Chromium, zero passing replay, source-bound all-four app and inventory coverage 100 percent; final static/source/scope/artifact gates PASS, residuals recorded. Final Findings and Verification persisted before this canonical verification.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T18:11:50.398Z, excerpt_hash=sha256:24dfb7d5011b0a0a7d701c307f5618d732a4ae494a5df5a6c24448acc1ad78a1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071741-GQDGMV/blueprint/resolved-snapshot.json
    - old_digest: 7e2d1ae6900ecf99c77a699e5824b3c522a64db1caf487e2137a33e3183ae6ec
    - current_digest: 7e2d1ae6900ecf99c77a699e5824b3c522a64db1caf487e2137a33e3183ae6ec
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610071741-GQDGMV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610071741-GQDGMV
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf implementation; preserve prior DONE tasks, parent full Findings prefix, deferred stash and deliberate I/O/recovery deviations."
  Findings: |-
    Iteration222 closes the existing StarBats/StarMath bullet glyph/family import gap. Both actual unotools224slot tables ported without omitted entries; source uint16 aliases/subtraction,29/5zero holes ->U+E12C and out-of-range retention preserved. Native output digests b38a0e2c74c5a58d7f1eaf8c11d6feb5eb3e8954945290006fa44042cdbb7e77 and86d64838b3b06ed42f60d4e9db288064c3985a30f7b07885cd44d26294738db3 match all slots and both aliases. Actual implemented SvXMLImport owns independent lazy handles; production list levels borrow original Writer importer through existing table coordinator. Interface-only SvXMLImport placeholder becomes explicit SAX root factory port plus real bounded source-owned conversion base; no browser/TextRuns glyph conversion or duplicate Font owner. Isolated existing constructor callers use that same implemented base. GetProperties uses native exact ASCII family matching, mutates glyph each publication and changes only published descriptor family to StarSymbol; repeat StarMath '?' ->U+00BF ->U+E0AA matches source rather than inventing idempotence. Standard/other/nonbullet/empty/astral/aliases/holes/import precedence retained. Browser StarSymbol face uses existing related OpenSymbol resource, preserving actual stored family; full physical glyph coverage remains unverified. Dependency checker admits native xmloff->unotools only with fresh boundary assertions.
    ONE full upstream-absent profile terminal: build PASS; all13582app PASS,110inventory PASS,15infrastructure PASS,286Chromium PASS;zero uncaught,failures,skips or passing replay. Real common/automatic/body/cell ODT reopen/reexport and Worker preserve converted glyph/family. Chromium actual loaded24pt symbol and text faces, visible ●/∞, glyph gap/native font reset/body/cell at1280/390,Home label typing/Undo/Redo PASS. No runtime closure, second full run or unchanged rebuild. App profile exit1 solely raw branch coverage in two byte-unchanged files: browser edit-window inferred else zero and paintfrm inferred else negative62. Complete prior identical source/maps add whole counters for first; invalid negative36 aggregate discarded by entire previous verified paintfrm source/maps/counters, never sanitizing individual counts. Final actual current-source app L16585/S18210/F4230/B13739 and inventory L1464/S1523/F384/B1081 all4metrics100,299whole app38whole inventory4complete prior app region certificates. No exclusions/clamps/threshold/skipped promotion. All7production hashes unchanged after full runtime, final build/Chromium binding intact.
    Initial6static once:5PASS/typeFAIL frozen converter private-field typing. Closure1 immutable-handle type fixed but fresh font item constructor required Which; format/lint changed native inputs PASS. Closure2 tools/app typecheck and changed fresh format/lint PASS. Scoped JSDoc/real physical max963 including CSS;5restored-only source gates PASS. Source review initially guessed absent xmloff library path, route recomputed and actual pinned xmlimp unotools/fontcvt include anchors used; no implementation change or full source rerun. All448native table values checked identical,6pinned source files hash/anchor reviewed.14semantic paths;597prior acceptance with595byte-identical and2exact type-import aliases to explicit SAX root port, all runtime inputs/assertions retained;3fresh/600current. All301prior metadata fields/statuses/defaults/prefixes/exceptions preserved plus1bounded unverified unotools record,302total. Artifact census zero upstream/source/Python/raw maps/results/snapshots/scripts in AgentPlane; raw only ignored cache. Doctor0errors2oldwarnings/routing/diff PASS. All source/task writes waited for terminal profile/static handles, vendor restored; parent full621727-character prefix SHA4966470373475c7d02b9b54c20dd6914eee3c4bbc8a58aa4a574effefc95b743 and deferred stash preserved. Clean actual implementation SHA 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e review PASS. Same-current-agent EVALUATOR explicitly not independent PASS at .agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/quality-report.json.
    Residuals: other recode fonts/functions/strings/export/search-name/factory flags remain unrepresented; source SvXMLImport is only actual implemented conversion responsibility, full importer state/context and Writer table adapter remain partial. Full physical font glyph coverage/metrics/fallback ranking/shaping,FontDescriptor/SwFont/script/style/redline/graphics and ODT true compatibility-flag config persistence unverified. Adjacent generic empty BulletChar publication and exporter zero/control fallback need source audit, no closure claim from legacy-only zero evidence. Exhaustive parent goal remains ACTIVE and registered save/open/recovery deviations unchanged.
id_source: "generated"
---
## Summary

Port the actual existing StarBats/StarMath bullet import conversion through pinned unotools ConvertChar tables and xmlnumi GetProperties. Preserve all224 slots in both tables, U+00xx/U+F0xx aliases, uint16 narrowing/subtraction, zero-slot substitution U+E12C, out-of-range retention and native ASCII family matching/publication mutation including repeated GetProperties behavior. Add bounded actual SvXMLImport lazy conversion ownership instead of placing conversion in a browser or Writer adapter: replace its interface-only placeholder with the source-shaped implemented conversion base; keep SAX root factory as explicit structural SvXMLImportRootFactory. Existing Writer table import coordinator inherits that base; production list contexts borrow the actual importer, isolated existing constructor calls obtain the same implemented owner. Preserve existing constructor callers and all other context fields/contracts; class remains explicitly partial, no full-native claim. Add StarSymbol browser face backed by existing OpenSymbol resource following source-related symbol fallback, preserve stored StarSymbol family; complete physical font coverage remains separately unverified. Register unotools and native xmloff->unotools edge in dependency checker with fresh boundary assertions, never bypass enforcement. Tests: frozen native conversion output census plus literal context controls/legacy repeated publication, actual common/automatic/body/cell/Worker/package reopen and real Chromium fonts/glyph/gap/typing/history at1280/390.14semantic paths. Preserve597 prior acceptance files, only2 exact type-import aliases to renamed root port with all inputs/assertions retained; any further old expectation migration only after actual original failure and exact source proof. Preserve all301prior metadata fields/statuses/defaults/prefixes/exceptions plus1explicitly unverified unotools record,302total. Standing user goal authorizes safe local parity/refactoring work, no new confirmation. No network/outside-repo access, subagents, upstream/source/Python/raw artifacts in AgentPlane. Same current agent role phases, EVALUATOR explicitly not independent.

## Scope

apps/office/src/unotools/source/misc/fontcvt.ts
apps/office/src/xmloff/source/core/xmlimp.ts
apps/office/src/xmloff/source/style/xmlnumi.ts
apps/office/src/sw/source/filter/xml/xmltbli.ts
apps/office/src/sw/source/filter/xml/xmlimp.ts
apps/office/src/vcl/browser/lo-runtime-fonts.css
scripts/check-module-boundaries.mjs
apps/office/src/xmloff/source/style/native-legacy-bullet-symbol.test.ts
apps/office/e2e/native-legacy-bullet-symbol.spec.ts
scripts/check-legacy-font-boundary.test.ts
apps/office/src/xmloff/source/core/xmlimp.test.ts
apps/office/src/sax/source/fastparser/fastparser.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Port the actual existing StarBats/StarMath bullet import conversion through pinned unotools ConvertChar tables and xmlnumi GetProperties. Preserve all224 slots in both tables, U+00xx/U+F0xx aliases, uint16 narrowing/subtraction, zero-slot substitution U+E12C, out-of-range retention and native ASCII family matching/publication mutation including repeated GetProperties behavior. Add bounded actual SvXMLImport lazy conversion ownership instead of placing conversion in a browser or Writer adapter: replace its interface-only placeholder with the source-shaped implemented conversion base; keep SAX root factory as explicit structural SvXMLImportRootFactory. Existing Writer table import coordinator inherits that base; production list contexts borrow the actual importer, isolated existing constructor calls obtain the same implemented owner. Preserve existing constructor callers and all other context fields/contracts; class remains explicitly partial, no full-native claim. Add StarSymbol browser face backed by existing OpenSymbol resource following source-related symbol fallback, preserve stored StarSymbol family; complete physical font coverage remains separately unverified. Register unotools and native xmloff->unotools edge in dependency checker with fresh boundary assertions, never bypass enforcement. Tests: frozen native conversion output census plus literal context controls/legacy repeated publication, actual common/automatic/body/cell/Worker/package reopen and real Chromium fonts/glyph/gap/typing/history at1280/390.14semantic paths. Preserve597 prior acceptance files, only2 exact type-import aliases to renamed root port with all inputs/assertions retained; any further old expectation migration only after actual original failure and exact source proof. Preserve all301prior metadata fields/statuses/defaults/prefixes/exceptions plus1explicitly unverified unotools record,302total. Standing user goal authorizes safe local parity/refactoring work, no new confirmation. No network/outside-repo access, subagents, upstream/source/Python/raw artifacts in AgentPlane. Same current agent role phases, EVALUATOR explicitly not independent.

## Verify Steps

Initial6static once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. ONE full runtime without vendor:hide vendor/libreoffice-reference; test:static,full app/inventory coverage,14existing infrastructure plus fresh boundary cases,full Chromium; finally restore, freeze source/task writes until actual terminal handle. Tests never invoke pinned source; later runtime only original failures or genuinely new cases, zero passing replay. Later static/source only failed or changed inputs. Require actual current-source app/inventory all4coverage100 via entire identical source/maps or contiguous complete declaration/body/enclosing-branch/all-locations proofs; no skips/exclusions/clamps/threshold changes. Check all224entries both aliases and source uint16/zero/out-of-range semantics, context font matching and native repeated GetProperties mutation, actual original Font/Rule/Worker/ODT ownership and Chromium font loading/glyph/spacing/history. After restore run resource generator--check,source-tree,source-provenance,invariants,parity. Preserve597old cases/tests except2type-only import aliases, all301prior metadata plus1unverified mapping; bounded English evidence/source anchors/hashes/counts only. JSDoc/actual physical<1000,artifact census,doctor/routing/diff,clean actual implementation SHA review,full parent Findings prefix/deferred stash preserved. Final Findings/Verification before canonical verify; persist canonical verification before finish actual implementation SHA, never mutate DONE leaf.

## Verification

PASS: complete native legacy import table branch and actual XML import owner/glyph/family publication; all13582app110inventory15infrastructure286Chromium in ONE upstream-absent full profile,zero runtime failed/skipped/uncaught/passing replay; no closure or unchanged rebuild. Actual current-source all4 app/inventory coverage100,299+38whole sources/maps and4complete prior app regions; invalid raw paintfrm whole map replaced only by previous entire identical-source verified certificate. All7production unchanged after full build/Chromium. Initial5other static PASS; frozen-handle type failure and closure1 fresh Which-constructor type failure closed by final root typecheck/scoped changed checks;5restored-only source gates/scoped JSDoc/physical<1000(max963 inclCSS)/scope301prior metadata+1unverified302/597old595unchanged2exact type-only aliases all assertions retained/448native table values identical/doctor0errors2oldwarnings/routing/diff/artifacts PASS. Clean actual implementation SHA 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e review PASS and same-current-agent explicitly not independent EVALUATOR PASS at .agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/quality-report.json. Final canonical verification checkpoint before finish actual implementation SHA; full goal remains ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T18:12:21.324Z — VERIFY — ok

By: CODER

Note: PASS exact implementation 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e; same-current-agent EVALUATOR explicitly not independent PASS. ONE upstream-absent full runtime 13582 app/110 inventory/15 infrastructure/286 Chromium, zero passing replay, source-bound all-four app and inventory coverage 100 percent; final static/source/scope/artifact gates PASS, residuals recorded. Final Findings and Verification persisted before this canonical verification.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T18:11:50.398Z, excerpt_hash=sha256:24dfb7d5011b0a0a7d701c307f5618d732a4ae494a5df5a6c24448acc1ad78a1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071741-GQDGMV/blueprint/resolved-snapshot.json
- old_digest: 7e2d1ae6900ecf99c77a699e5824b3c522a64db1caf487e2137a33e3183ae6ec
- current_digest: 7e2d1ae6900ecf99c77a699e5824b3c522a64db1caf487e2137a33e3183ae6ec
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610071741-GQDGMV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610071741-GQDGMV
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf implementation; preserve prior DONE tasks, parent full Findings prefix, deferred stash and deliberate I/O/recovery deviations.

## Findings

Iteration222 closes the existing StarBats/StarMath bullet glyph/family import gap. Both actual unotools224slot tables ported without omitted entries; source uint16 aliases/subtraction,29/5zero holes ->U+E12C and out-of-range retention preserved. Native output digests b38a0e2c74c5a58d7f1eaf8c11d6feb5eb3e8954945290006fa44042cdbb7e77 and86d64838b3b06ed42f60d4e9db288064c3985a30f7b07885cd44d26294738db3 match all slots and both aliases. Actual implemented SvXMLImport owns independent lazy handles; production list levels borrow original Writer importer through existing table coordinator. Interface-only SvXMLImport placeholder becomes explicit SAX root factory port plus real bounded source-owned conversion base; no browser/TextRuns glyph conversion or duplicate Font owner. Isolated existing constructor callers use that same implemented base. GetProperties uses native exact ASCII family matching, mutates glyph each publication and changes only published descriptor family to StarSymbol; repeat StarMath '?' ->U+00BF ->U+E0AA matches source rather than inventing idempotence. Standard/other/nonbullet/empty/astral/aliases/holes/import precedence retained. Browser StarSymbol face uses existing related OpenSymbol resource, preserving actual stored family; full physical glyph coverage remains unverified. Dependency checker admits native xmloff->unotools only with fresh boundary assertions.
ONE full upstream-absent profile terminal: build PASS; all13582app PASS,110inventory PASS,15infrastructure PASS,286Chromium PASS;zero uncaught,failures,skips or passing replay. Real common/automatic/body/cell ODT reopen/reexport and Worker preserve converted glyph/family. Chromium actual loaded24pt symbol and text faces, visible ●/∞, glyph gap/native font reset/body/cell at1280/390,Home label typing/Undo/Redo PASS. No runtime closure, second full run or unchanged rebuild. App profile exit1 solely raw branch coverage in two byte-unchanged files: browser edit-window inferred else zero and paintfrm inferred else negative62. Complete prior identical source/maps add whole counters for first; invalid negative36 aggregate discarded by entire previous verified paintfrm source/maps/counters, never sanitizing individual counts. Final actual current-source app L16585/S18210/F4230/B13739 and inventory L1464/S1523/F384/B1081 all4metrics100,299whole app38whole inventory4complete prior app region certificates. No exclusions/clamps/threshold/skipped promotion. All7production hashes unchanged after full runtime, final build/Chromium binding intact.
Initial6static once:5PASS/typeFAIL frozen converter private-field typing. Closure1 immutable-handle type fixed but fresh font item constructor required Which; format/lint changed native inputs PASS. Closure2 tools/app typecheck and changed fresh format/lint PASS. Scoped JSDoc/real physical max963 including CSS;5restored-only source gates PASS. Source review initially guessed absent xmloff library path, route recomputed and actual pinned xmlimp unotools/fontcvt include anchors used; no implementation change or full source rerun. All448native table values checked identical,6pinned source files hash/anchor reviewed.14semantic paths;597prior acceptance with595byte-identical and2exact type-import aliases to explicit SAX root port, all runtime inputs/assertions retained;3fresh/600current. All301prior metadata fields/statuses/defaults/prefixes/exceptions preserved plus1bounded unverified unotools record,302total. Artifact census zero upstream/source/Python/raw maps/results/snapshots/scripts in AgentPlane; raw only ignored cache. Doctor0errors2oldwarnings/routing/diff PASS. All source/task writes waited for terminal profile/static handles, vendor restored; parent full621727-character prefix SHA4966470373475c7d02b9b54c20dd6914eee3c4bbc8a58aa4a574effefc95b743 and deferred stash preserved. Clean actual implementation SHA 9a561bd4ee6196bfcb6ed957891741af8ed8ae5e review PASS. Same-current-agent EVALUATOR explicitly not independent PASS at .agentplane/tasks/202610071741-GQDGMV/quality/20261007-181131914-recovery-context/quality-report.json.
Residuals: other recode fonts/functions/strings/export/search-name/factory flags remain unrepresented; source SvXMLImport is only actual implemented conversion responsibility, full importer state/context and Writer table adapter remain partial. Full physical font glyph coverage/metrics/fallback ranking/shaping,FontDescriptor/SwFont/script/style/redline/graphics and ODT true compatibility-flag config persistence unverified. Adjacent generic empty BulletChar publication and exporter zero/control fallback need source audit, no closure claim from legacy-only zero evidence. Exhaustive parent goal remains ACTIVE and registered save/open/recovery deviations unchanged.
