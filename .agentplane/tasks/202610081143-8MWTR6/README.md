---
id: "202610081143-8MWTR6"
title: "Own native independent row column widths through box frame sizes"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T12:22:05.407Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T12:46:42.675Z"
  updated_by: "CODER"
  note: "Final documented hook/preflight observations preserve actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6. Runtime/native/source/scope/coverage/artifact/governance evidence and same-agent EVALUATOR PASS unchanged;13808app110inventory19infra299ChromiumPASS,zero passing replay. Corrected task-scope checkpoint precedes close; no hook bypass, no test rerun, goalACTIVE."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T12:45:44.199Z"
  updated_by: "EVALUATOR"
  note: "Same current agent, not independent: exact implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6 satisfies bounded native independent-row column ownership, fuzzy XML grid/UI/history/ODF contract; full upstream goal remains active."
  evaluated_sha: "4c55ad4f82435345c6cdb20dba41062ffe20ada6"
  blueprint_digest: "801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075"
  evidence_refs:
    - ".agentplane/tasks/202610081143-8MWTR6/README.md"
    - ".agentplane/tasks/202610081143-8MWTR6/quality/20261008-124544199-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610081143-8MWTR6/quality/20261008-124544199-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610081143-8MWTR6/quality/20261008-124544199-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610081143-8MWTR6/evidence/quality-actual-sha.json"
    - ".agentplane/tasks/202610081143-8MWTR6/evidence/native-source-review.json"
    - ".agentplane/tasks/202610081143-8MWTR6/evidence/final-coverage.json"
    - ".agentplane/tasks/202610081143-8MWTR6/evidence/case-census.json"
  findings:
    - "Reconstructed exact-source coverage/case/scope evidence byte-identically against actual implementation SHA; unique13808app/110inventory/19infra/299ChromiumPASS,23fresh cases, zero passing replay,89skips retained, all4current-source app/inventory100 without sanitation."
    - "Native11source anchors/current17production hashes,34exact paths,611other prior acceptance files unchanged and12source-backed full-format/current-row migrations;309prior metadata preserved,311current newnative partial unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement source-native per-box frame size and independent current-row columns across original model/history/DOM/filter owners under standing user parity authorization; scope27 declared, preserve IO/pin/stash/parent and source-only test independence."
events:
  -
    type: "status"
    at: "2026-10-08T11:45:05.835Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-native per-box frame size and independent current-row columns across original model/history/DOM/filter owners under standing user parity authorization; scope27 declared, preserve IO/pin/stash/parent and source-only test independence."
  -
    type: "verify"
    at: "2026-10-08T12:45:46.095Z"
    author: "CODER"
    state: "ok"
    note: "Verified actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6 native independent box/current-row/history/fuzzy20/ODF/UI ownership;13808uniqueapp110inventory19infra299ChromiumPASS,23fresh,all4current-sourceapp/inventory100,zero passing replay89skipsrawthresholdretained; scope34/native/pin/stash/IO/artifact/governancePASS. Samecurrent EVALUATOR explicitlynotindependent PASS; full module/table/ruler residuals remain unpromoted and goalACTIVE."
  -
    type: "verify"
    at: "2026-10-08T12:46:08.646Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610081143-8MWTR6"
  -
    type: "verify"
    at: "2026-10-08T12:46:42.675Z"
    author: "CODER"
    state: "ok"
    note: "Final documented hook/preflight observations preserve actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6. Runtime/native/source/scope/coverage/artifact/governance evidence and same-agent EVALUATOR PASS unchanged;13808app110inventory19infra299ChromiumPASS,zero passing replay. Corrected task-scope checkpoint precedes close; no hook bypass, no test rerun, goalACTIVE."
doc_version: 3
doc_updated_at: "2026-10-08T12:46:42.761Z"
doc_updated_by: "CODER"
description: "Replace shared flat-table column geometry with native per-box SwFormatFrameSize ownership and source current-row column application, including original graph history, current-row visible/all-row hidden separators, DOM union grid and ODF union-grid spans/roundtrip. Remove retained Writer ordinary-column fallback only once native document/history/render/filter mechanics support independent widths. Standing user iterative parity authorization applies; registered IO/recovery/open/save policy unchanged; pinned source read only, tests never read upstream."
sections:
  Summary: |-
    Own native independent row column widths through box frame sizes

    Replace shared flat-table column geometry with native per-box SwFormatFrameSize ownership and source current-row column application, including original graph history, current-row visible/all-row hidden separators, DOM union grid and ODF union-grid spans/roundtrip. Remove retained Writer ordinary-column fallback only once native document/history/render/filter mechanics support independent widths. Standing user iterative parity authorization applies; registered IO/recovery/open/save policy unchanged; pinned source read only, tests never read upstream.
  Scope: |-
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/ndtbl.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/source/core/frmedt/tblsel.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    apps/office/src/sw/browser/filter/xml/writer-table-item-codec.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/sw/source/filter/xml/xmltbli.ts
    apps/office/src/sw/source/filter/xml/xmltble.ts
    apps/office/src/xmloff/source/table/XMLTableExport.ts
    apps/office/src/xmloff/source/table/XMLTableImport.ts
    apps/office/src/xmloff/source/core/xmltoken.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/source/core/table/native-independent-columns.test.ts
    apps/office/src/sw/browser/editor/native-independent-column-render.test.tsx
    apps/office/src/sw/source/filter/xml/native-independent-column-odf.test.ts
    apps/office/src/sw/source/core/table/native-tabcols.test.ts
    apps/office/src/sw/source/uibase/docvw/native-table-linear-drag.test.ts
    apps/office/src/sw/source/uibase/docvw/native-table-proportional-drag.test.ts
    apps/office/src/sw/browser/editor/native-table-linear-drag.test.tsx
    apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/core/docnode/native-cell-alignment-owner.test.ts
    apps/office/src/sw/source/core/table/native-column-insertion.test.ts
    apps/office/src/sw/source/core/undo/native-insert-table-history.test.ts
    apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-tabcols-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
  Plan: "Iteration233, one coherent independent-row column-width correction under standing approved user parity goal. Replace canonical shared flat box widths with each SwTableBox native SwFormatFrameSize, initialize/import/clone per-box values, source-shaped GetTabCols current-row visible/all-row hidden fuzzy constraints and NewSetTabCols per-line adjustments/current-row admission. Preserve original table/line/box/node/frame/cursor/history owners and native integer scaling. Width declaration array remains only builder/import ingress before rows; connected geometry must read native boxes and never introduce row side maps. Move SwDoc column transaction to original ndtbl owner if needed to preserve<1000actual physical lines. Native history captures everybox frame size including insertion; CheckSplitCells uses actual box widths. Remove Writer currentRowOnly false fallback after core admission. DOM union grid represents independent boundaries with colspan while retaining actual box DOM/hit owners; source Writer XML union-grid export and SAX span import roundtrip native widths; codec transports complete native frame-size fields with legacy compatibility, source helpers prevent physical overflow. Scope34 exact paths in Scope. Native-marked prior tests may migrate only contradictory unsupported-row/excluded-composite assertions with literal per-row/current-line expectations and documented exact source anchors, never weaker assertions. Add three fresh regressions for unequal multirow owners/hidden boundaries/ordinary versus current-row apply/cancel/backtrack/history/insert/filter/render. Preserve all other prior acceptance sources,309prior metadata states/defaults/classes/evidence prefixes,4IO/recovery/open/save/settings,originalstash and662987char parent prefix SHA987d8167d3c9ab3662a5c38cb2e0f43281934ff0120778272a1d88299af2c86b. No network/global access/upstream application sources or scripts/rawmaps/results in AP. Initial6static once, ONE full absent runtime profile then failed/new-only closures; no passing replay; source-only gates once restored. Exact all-four coverage bound to entire source/maps or complete contiguous declarations/ancestors/all branch locations, never sanitize counters. Actual-SHA same-current-agent evaluator explicitly not independent, final docs/canonical verify/checkpoint/finish then append-only parent; goalACTIVE, full merged/nested/row-span native graph and full SFX/VCL remain separate uncertified residuals. Full initial profile terminal: build PASS; app13785PASS15FAIL0SKIP (all15 fresh PASS), inventory110PASS, infrastructure19PASS, Chromium299PASS; vendor restored. Fifteen original failures inspected with actual stacks: two real local SetColumnWidths zero-width regressions; eleven complete-box-format expected values exclude native frame-size (including insertion width must differ), and two tests retain unsupported-current-row false behavior. Standing user authorization for upstream parity/refactoring covers necessary source-justified migrations in seven additional prior tests, Scope27->34. No pass criterion removed: complete size items/literal current-row/other-row/history strengthen contradictory prior contracts; every other prior acceptance source preserved. Source anchors swtable.cxx lcl_ModifyBoxes lines282-318 and lcl_AdjustWidthsInLine994-1040, swnewtable.cxx768-778 explicitly own/change native box frame widths; width0 is native pool default and rejection belongs to admission, not native item setter. Initial passing profiles will not replay. Read-only vendor discovery initially ignored vendor; bounded --no-ignore fallback found actual source paths. Plan expansion approved under standing goal before edits; sameCODER execution, no external writes or IO deviation."
  Verify Steps: |-
    1. Native source mechanism regression: SwTableBox frame-size value clone/ownership, current-row GetTabCols visible and other rows hidden withCOLFUZZY20/constraints, source NewSetTabCols/lcl_AdjustWidthsInLine flat per-line widths and current-row-only without affecting other unspanned lines; real Writer Ctrl+Shift admission/apply and original graph/history identities. Unequal independent literal widths/scaling/fuzzy/narrow remainder, ordinary shared border after independent edit, union grid and DOM colspans, real mounted mouse axes/cancel/release/undo/redo and insertion conservation. Source-justified prior unsupported-row/composite test migrations retain stronger per-row assertions; every other prior acceptance file unchanged. Tests never read/invoke upstream.
    2. Source-native ODF union column grid and number-columns-spanned/covered cells stream import/export with per-box widths, exact native geometry/text/format and codec complete frame-size/legacy roundtrip; registered4IO/save/open/recovery settings untouched. All changed code/tests actual physical<1000/JSDoc,309prior metadata fields/prefix/default/class/state preserved and new native helper marked partial only.
    3. Initial6format/lint/type/dependencies/docs/physical gates once. ONE upstream-absent build/app/inventory/infrastructure/Chromium profile with finally restore; thereafter only original failures/genuinely new cases, retain skips/raw diagnostics and passingReplay0. All-four cumulative app/inventory100 using exactsource/maps whole bytes or full contiguous decl/body/ancestor/all-location proofs; no counter sanitation. Restored5source-only gates once afterruntime.
    4. Scope34/native-source/pin/stash/662987char parentprefix audit, wholeAgentPlane includingignored upstream/application/Python/rawsnapshot/map/result ban with exact registered routingbackup exemption. Doctor/routing/diff PASS with existingwarnings retained. Exact implementationSHA reconstructed evidence and same-current-agent EVALUATOR explicitlynotindependent, finalFindings/Verification beforecanonicalverify, committed verifycheckpoint beforefinish actualimplementationSHA, append-onlyparent andclean finalGit. GoalACTIVE; nofulltable/ruler/modulepromotion.
  Verification: |-
    Command: Initial6 static gates and changed-input scoped closures, including TypeScript project semantic diagnostics and actual physical counts; see static-gates.json, static-closure1..5.json, changed-input-type-physical.json and fuzzy-type-physical.json. Result: pass after original formatting/JSDoc diagnostics were fixed; initial successful global gates not replayed. Scope: approved34 paths, actual maximum948<1000.

    Command: ONE upstream-absent full build/application/inventory/infrastructure/Chromium profile, exact commands in absent-profile.json. Result: build/inventory110/infrastructure19/Chromium299 pass; original app13785pass15fail retained. Command: original-failure/new-only application closures1..3, exact commands in closure1.json/closure2.json/closure3.json. Result: final13808unique app pass,23fresh native/UI/ODF cases,15original failures and1genuinely new selector failure resolved,89focused skips retained, zero uncaught and zero passing replay. All runtime test invocations ran with upstream absent; every finally restore verified. Raw threshold exits remain unsanitized.

    Command: Reconstruct all-four cumulative coverage by complete identical sources/maps or full contiguous declarations/bodies/enclosing branch/all locations against current code; report final-coverage.json, actual-SHA quality-actual-sha.json. Result: app100 L17256/S18947/F4370/B14144; inventory100 L1464/S1523/F384/B1081. No count clamping; any invalid raw inferred V8 counter uses only the entire prior certified identical source/map/counters. Exact coverage and unique case evidence reconstructed byte-identically by same-current-agent EVALUATOR.

    Command: Restored source-only5 gates in source-gates.json once; native source review plus scope-final.json/artifact-census.json/governance.json. Result: pass. Scope:11native source anchor/digest files,17production hashes,5registered IO/browser-bridge unchanged files,34exact implementation paths,623prior acceptance sources with611unchanged and12source-backed migrations,309prior metadata state/default/class/evidence-prefix fields preserved and311current records (newnative unverified), wholeAgentPlane source/Python/raw-result/map ban, vendor pin/stash/662987char unchanged parent prefix.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass with two existing doctor warnings preserved (managed hook shim readiness and historical DONE task202610031635-2Z3962 missing implementation hash). No policy/historical DONE edits.

    Command: ap evaluator run 202610081143-8MWTR6 --verdict pass with cited actual-SHA/source/coverage/case evidence. Result: pass at4c55ad4f82435345c6cdb20dba41062ffe20ada6; same current agent, explicitly not independent. Canonical verify and committed verification checkpoint precede finish at the actual implementationSHA. Scope is flat independent box geometry/current-line apply/history/union grid/fuzzy20/ODF/codec/device behavior only. Full merged/rowspan/nested/format-pool/UNO/XML-style/SFX/VCL/pixel/ruler/RTL/vertical/wrapped-uint16 parity remains incomplete; goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T12:45:46.095Z — VERIFY — ok

    By: CODER

    Note: Verified actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6 native independent box/current-row/history/fuzzy20/ODF/UI ownership;13808uniqueapp110inventory19infra299ChromiumPASS,23fresh,all4current-sourceapp/inventory100,zero passing replay89skipsrawthresholdretained; scope34/native/pin/stash/IO/artifact/governancePASS. Samecurrent EVALUATOR explicitlynotindependent PASS; full module/table/ruler residuals remain unpromoted and goalACTIVE.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T12:45:45.404Z, excerpt_hash=sha256:0f10577c9a1665a4303f75ec1f4a480a7b58b8185786e4e8b7d92421214dce90

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json
    - old_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
    - current_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610081143-8MWTR6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610081143-8MWTR6 -m 🧩 8MWTR6 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-08T12:46:08.646Z — VERIFY — ok

    By: CODER

    Note: verified-202610081143-8MWTR6
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T12:45:46.175Z, excerpt_hash=sha256:0f10577c9a1665a4303f75ec1f4a480a7b58b8185786e4e8b7d92421214dce90

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json
    - old_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
    - current_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610081143-8MWTR6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610081143-8MWTR6 --result verified-202610081143-8MWTR6 --commit 4c55ad4f82435345c6cdb20dba41062ffe20ada6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-08T12:46:42.675Z — VERIFY — ok

    By: CODER

    Note: Final documented hook/preflight observations preserve actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6. Runtime/native/source/scope/coverage/artifact/governance evidence and same-agent EVALUATOR PASS unchanged;13808app110inventory19infra299ChromiumPASS,zero passing replay. Corrected task-scope checkpoint precedes close; no hook bypass, no test rerun, goalACTIVE.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T12:46:42.105Z, excerpt_hash=sha256:0f10577c9a1665a4303f75ec1f4a480a7b58b8185786e4e8b7d92421214dce90

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json
    - old_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
    - current_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610081143-8MWTR6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610081143-8MWTR6 --result verified-202610081143-8MWTR6 --commit 4c55ad4f82435345c6cdb20dba41062ffe20ada6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this reviewed implementation; preserve prior DONE tasks, registered IO deviations and original stash."
  Findings: |-
    Implementation pending runtime verification: connected box widths now belong to independently cloned SwFormatFrameSize values; declarations are builder/import ingress only. GetTabCols merges actual current-row visible and all-row hidden positions/constraints with native integer scaling/fuzzy20; NewSetTabCols applies source width changes per original line and admits current-row-only flat/unspanned changes. SwDoc transaction moved to native ndtbl owner, preserving actual table/line/box/cursor history. Column insertion attribute snapshots retain all independent original cells; actual print/split checks use native boxes. Writer retained false current-line fallback removed. Source XML union grid spans feed actual DOM cells and ODF spans/covered-slot import without duplicate box sections. Codec complete frame-size fields extracted into a local infrastructure helper, preserving prior16 scalar row and box-less column declaration ingress. Three new acceptance sources and five source-justified old migrations assert other-row widths/native true flag/original graph rather than weakening numeric expectations. Full nested/merged/row-span propagation, complete native SFX/VCL/RTL/vertical/page/margin state and collapsed-border frame geometry remain partial, not certified.

    Initial6static once: lint/type/dependencies/actual physical pass; late-added test formatting and two opening-fileoverview/one arrow JSDoc fail. Scoped closure1 on four changed-input/original-failed files passes format/lint/unchanged JSDoc; no successful global gate replay. Metadata update first in-memory attempt used a native-only responsibilities field for existing local infrastructure and failed before filesystem writes; corrected to existing responsibilities/rationale schema,309prior records preserved and two helpers inserted canonically (311total,1new partial native/1local infrastructure). Bounded read-only discovery found missing guessed test glob/check-docs path and absent imported frame item; actual rg-discovered check-jsdoc/native test paths used, route recomputed before mutations. No runtime/source gates executed yet, no test replay; raw diagnostics/scripts/source snapshots only ignored cache, no AP upstream/application/Python source. Parent662987chars/stash/pin/registered4IO preserved. No implementation commit/evaluator/canonical verification yet. Goal ACTIVE.

    Full initial profile terminal: build PASS; app13785PASS15FAIL0SKIP (all15 fresh PASS), inventory110PASS, infrastructure19PASS, Chromium299PASS; vendor restored. Fifteen original failures inspected with actual stacks: two real local SetColumnWidths zero-width regressions; eleven complete-box-format expected values exclude native frame-size (including insertion width must differ), and two tests retain unsupported-current-row false behavior. Standing user authorization for upstream parity/refactoring covers necessary source-justified migrations in seven additional prior tests, Scope27->34. No pass criterion removed: complete size items/literal current-row/other-row/history strengthen contradictory prior contracts; every other prior acceptance source preserved. Source anchors swtable.cxx lcl_ModifyBoxes lines282-318 and lcl_AdjustWidthsInLine994-1040, swnewtable.cxx768-778 explicitly own/change native box frame widths; width0 is native pool default and rejection belongs to admission, not native item setter. Initial passing profiles will not replay. Read-only vendor discovery initially ignored vendor; bounded --no-ignore fallback found actual source paths. Plan expansion approved under standing goal before edits; sameCODER execution, no external writes or IO deviation.

    Final runtime/source closure: one full upstream-absent profile only. Initial13785PASS15FAIL app,110inventory/19infra/299Chromium/buildPASS; original15 failures plus5 genuine native zero/builder/stream/print/narrow guards close20PASS0FAIL67SKIP. Native source review then found XML exact-set equality divergence from SwWriteTableCol fuzzy20 and o3tl sorted-vector lower-bound semantics; fixed approved XML grid owner and added3 genuine core/mounted/ODF cases. Closure2 core/ODF PASS and mounted grid/owner assertions PASS, last selector falsely assumed contenteditable=true; actual original textbox owner inspected, corrected role/name selector, closure3 originalfailed-only1PASS0FAIL2SKIP. Total13808 unique appPASS,110inventoryPASS,19infraPASS,299ChromiumPASS, zero uncaught and zero passing replay,89skipped observations retained. Raw original failure/threshold exits and focused raw threshold exits remain unchanged; cumulative current-source all4 app100 totals L17256/S18947/F4370/B14144 and inventory L1464/S1523/F384/B1081 verified with exact whole-source/maps or full contiguous declarations/bodies/enclosing branch/all-location proofs, and strict entire prior certificate fallback for any invalid V8 inferred counters; never sanitized counts. Initial successful static gates retained; changed-input closures (including original missing arrow JSDoc) pass format/lint/JSDoc/project semantic diagnostics/physical; maximum actual source948<1000. Source5 gates PASS once restored; final native11file anchors/current17production digests and5protected IO/bridge owners bind fuzzy source change without replay. Scope34 includes12 source-backed native contract migrations,611other acceptance sources byte-identical of623 baseline;309prior metadata entries preserved,311total with1partial unverified native XML helper/1explicit local codec helper. Initial scope-input audit missed ordinary apply's necessary fresh normalized carrier operand; actual source diff reviewed and third operand migration documented, no product/test edits or test replay. WholeAgentPlane5869inspected sources/Python/rawmap/result banPASS, routing backup byte-identical legitimate exception. Vendor pin9bc445578031fecf56086729d8e4940c77e14d65, protectedstash and662987char parentprefix retained. Tool-input quoting and misplaced patch context failed before mutation and were corrected against inspected paths; bounded guessed header lookup resolved through rg-discovered native filter header, route recomputed. Full merged/row-span/nested ownership/XML styles, native item pooling/UNO/format identities, full SFX/VCL/ruler/pixel/RTL/vertical/collapsed-border and wrapped-uint16 contexts remain partial and uncertified; no full module promotion. Actual-SHA evaluator/canonical verification/checkpoint/finish remain next. Goal ACTIVE.

    Implementation commit preflight rejected unprefixed code subject before Git mutation: installed enforcement requires emoji/task-suffix/scope/summary. Corrected to task-prefixed code scope under actual command contract; semantic scope/verification unchanged.

    Actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6 committed. Same current agent EVALUATOR (explicitly not independent) reconstructed coverage/case/scope evidence byte-identically and checked all34 implementation files against exact Git bytes; quality verdict PASS recorded with complete native residuals. Current coverage L17256/S18947/F4370/B14144 and inventoryL1464/S1523/F384/B1081 all100;23freshcases and13808uniqueapp,110inventory,19infra,299ChromiumPASS; no passing replay,89skips/rawexitdiagnostics retained. Final task docs precede canonical verify; goalACTIVE and parent unchanged until verified finish.

    Verification-checkpoint hook rejected verify scope: current code-tag enforcement admits code/task/close/integrate only. Actual implementation hash remains4c55ad4f82435345c6cdb20dba41062ffe20ada6; no checkpoint created. Subsequent route-emitted task complete rejected non-empty index before DONE, so task remains verified DOING. Direct doctor confirms no errors and the same two known warnings; no hook bypass or product/test changes. Corrected checkpoint to task scope and retained actual implementationSHA; final docs/canonical verify recorded again before checkpoint/close. No runtime rerun.
id_source: "generated"
---
## Summary

Own native independent row column widths through box frame sizes

Replace shared flat-table column geometry with native per-box SwFormatFrameSize ownership and source current-row column application, including original graph history, current-row visible/all-row hidden separators, DOM union grid and ODF union-grid spans/roundtrip. Remove retained Writer ordinary-column fallback only once native document/history/render/filter mechanics support independent widths. Standing user iterative parity authorization applies; registered IO/recovery/open/save policy unchanged; pinned source read only, tests never read upstream.

## Scope

apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/ndtbl.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/source/core/frmedt/tblsel.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
apps/office/src/sw/browser/filter/xml/writer-table-item-codec.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/sw/source/filter/xml/xmltbli.ts
apps/office/src/sw/source/filter/xml/xmltble.ts
apps/office/src/xmloff/source/table/XMLTableExport.ts
apps/office/src/xmloff/source/table/XMLTableImport.ts
apps/office/src/xmloff/source/core/xmltoken.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/source/core/table/native-independent-columns.test.ts
apps/office/src/sw/browser/editor/native-independent-column-render.test.tsx
apps/office/src/sw/source/filter/xml/native-independent-column-odf.test.ts
apps/office/src/sw/source/core/table/native-tabcols.test.ts
apps/office/src/sw/source/uibase/docvw/native-table-linear-drag.test.ts
apps/office/src/sw/source/uibase/docvw/native-table-proportional-drag.test.ts
apps/office/src/sw/browser/editor/native-table-linear-drag.test.tsx
apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/core/docnode/native-cell-alignment-owner.test.ts
apps/office/src/sw/source/core/table/native-column-insertion.test.ts
apps/office/src/sw/source/core/undo/native-insert-table-history.test.ts
apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-tabcols-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts

## Plan

Iteration233, one coherent independent-row column-width correction under standing approved user parity goal. Replace canonical shared flat box widths with each SwTableBox native SwFormatFrameSize, initialize/import/clone per-box values, source-shaped GetTabCols current-row visible/all-row hidden fuzzy constraints and NewSetTabCols per-line adjustments/current-row admission. Preserve original table/line/box/node/frame/cursor/history owners and native integer scaling. Width declaration array remains only builder/import ingress before rows; connected geometry must read native boxes and never introduce row side maps. Move SwDoc column transaction to original ndtbl owner if needed to preserve<1000actual physical lines. Native history captures everybox frame size including insertion; CheckSplitCells uses actual box widths. Remove Writer currentRowOnly false fallback after core admission. DOM union grid represents independent boundaries with colspan while retaining actual box DOM/hit owners; source Writer XML union-grid export and SAX span import roundtrip native widths; codec transports complete native frame-size fields with legacy compatibility, source helpers prevent physical overflow. Scope34 exact paths in Scope. Native-marked prior tests may migrate only contradictory unsupported-row/excluded-composite assertions with literal per-row/current-line expectations and documented exact source anchors, never weaker assertions. Add three fresh regressions for unequal multirow owners/hidden boundaries/ordinary versus current-row apply/cancel/backtrack/history/insert/filter/render. Preserve all other prior acceptance sources,309prior metadata states/defaults/classes/evidence prefixes,4IO/recovery/open/save/settings,originalstash and662987char parent prefix SHA987d8167d3c9ab3662a5c38cb2e0f43281934ff0120778272a1d88299af2c86b. No network/global access/upstream application sources or scripts/rawmaps/results in AP. Initial6static once, ONE full absent runtime profile then failed/new-only closures; no passing replay; source-only gates once restored. Exact all-four coverage bound to entire source/maps or complete contiguous declarations/ancestors/all branch locations, never sanitize counters. Actual-SHA same-current-agent evaluator explicitly not independent, final docs/canonical verify/checkpoint/finish then append-only parent; goalACTIVE, full merged/nested/row-span native graph and full SFX/VCL remain separate uncertified residuals. Full initial profile terminal: build PASS; app13785PASS15FAIL0SKIP (all15 fresh PASS), inventory110PASS, infrastructure19PASS, Chromium299PASS; vendor restored. Fifteen original failures inspected with actual stacks: two real local SetColumnWidths zero-width regressions; eleven complete-box-format expected values exclude native frame-size (including insertion width must differ), and two tests retain unsupported-current-row false behavior. Standing user authorization for upstream parity/refactoring covers necessary source-justified migrations in seven additional prior tests, Scope27->34. No pass criterion removed: complete size items/literal current-row/other-row/history strengthen contradictory prior contracts; every other prior acceptance source preserved. Source anchors swtable.cxx lcl_ModifyBoxes lines282-318 and lcl_AdjustWidthsInLine994-1040, swnewtable.cxx768-778 explicitly own/change native box frame widths; width0 is native pool default and rejection belongs to admission, not native item setter. Initial passing profiles will not replay. Read-only vendor discovery initially ignored vendor; bounded --no-ignore fallback found actual source paths. Plan expansion approved under standing goal before edits; sameCODER execution, no external writes or IO deviation.

## Verify Steps

1. Native source mechanism regression: SwTableBox frame-size value clone/ownership, current-row GetTabCols visible and other rows hidden withCOLFUZZY20/constraints, source NewSetTabCols/lcl_AdjustWidthsInLine flat per-line widths and current-row-only without affecting other unspanned lines; real Writer Ctrl+Shift admission/apply and original graph/history identities. Unequal independent literal widths/scaling/fuzzy/narrow remainder, ordinary shared border after independent edit, union grid and DOM colspans, real mounted mouse axes/cancel/release/undo/redo and insertion conservation. Source-justified prior unsupported-row/composite test migrations retain stronger per-row assertions; every other prior acceptance file unchanged. Tests never read/invoke upstream.
2. Source-native ODF union column grid and number-columns-spanned/covered cells stream import/export with per-box widths, exact native geometry/text/format and codec complete frame-size/legacy roundtrip; registered4IO/save/open/recovery settings untouched. All changed code/tests actual physical<1000/JSDoc,309prior metadata fields/prefix/default/class/state preserved and new native helper marked partial only.
3. Initial6format/lint/type/dependencies/docs/physical gates once. ONE upstream-absent build/app/inventory/infrastructure/Chromium profile with finally restore; thereafter only original failures/genuinely new cases, retain skips/raw diagnostics and passingReplay0. All-four cumulative app/inventory100 using exactsource/maps whole bytes or full contiguous decl/body/ancestor/all-location proofs; no counter sanitation. Restored5source-only gates once afterruntime.
4. Scope34/native-source/pin/stash/662987char parentprefix audit, wholeAgentPlane includingignored upstream/application/Python/rawsnapshot/map/result ban with exact registered routingbackup exemption. Doctor/routing/diff PASS with existingwarnings retained. Exact implementationSHA reconstructed evidence and same-current-agent EVALUATOR explicitlynotindependent, finalFindings/Verification beforecanonicalverify, committed verifycheckpoint beforefinish actualimplementationSHA, append-onlyparent andclean finalGit. GoalACTIVE; nofulltable/ruler/modulepromotion.

## Verification

Command: Initial6 static gates and changed-input scoped closures, including TypeScript project semantic diagnostics and actual physical counts; see static-gates.json, static-closure1..5.json, changed-input-type-physical.json and fuzzy-type-physical.json. Result: pass after original formatting/JSDoc diagnostics were fixed; initial successful global gates not replayed. Scope: approved34 paths, actual maximum948<1000.

Command: ONE upstream-absent full build/application/inventory/infrastructure/Chromium profile, exact commands in absent-profile.json. Result: build/inventory110/infrastructure19/Chromium299 pass; original app13785pass15fail retained. Command: original-failure/new-only application closures1..3, exact commands in closure1.json/closure2.json/closure3.json. Result: final13808unique app pass,23fresh native/UI/ODF cases,15original failures and1genuinely new selector failure resolved,89focused skips retained, zero uncaught and zero passing replay. All runtime test invocations ran with upstream absent; every finally restore verified. Raw threshold exits remain unsanitized.

Command: Reconstruct all-four cumulative coverage by complete identical sources/maps or full contiguous declarations/bodies/enclosing branch/all locations against current code; report final-coverage.json, actual-SHA quality-actual-sha.json. Result: app100 L17256/S18947/F4370/B14144; inventory100 L1464/S1523/F384/B1081. No count clamping; any invalid raw inferred V8 counter uses only the entire prior certified identical source/map/counters. Exact coverage and unique case evidence reconstructed byte-identically by same-current-agent EVALUATOR.

Command: Restored source-only5 gates in source-gates.json once; native source review plus scope-final.json/artifact-census.json/governance.json. Result: pass. Scope:11native source anchor/digest files,17production hashes,5registered IO/browser-bridge unchanged files,34exact implementation paths,623prior acceptance sources with611unchanged and12source-backed migrations,309prior metadata state/default/class/evidence-prefix fields preserved and311current records (newnative unverified), wholeAgentPlane source/Python/raw-result/map ban, vendor pin/stash/662987char unchanged parent prefix.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass with two existing doctor warnings preserved (managed hook shim readiness and historical DONE task202610031635-2Z3962 missing implementation hash). No policy/historical DONE edits.

Command: ap evaluator run 202610081143-8MWTR6 --verdict pass with cited actual-SHA/source/coverage/case evidence. Result: pass at4c55ad4f82435345c6cdb20dba41062ffe20ada6; same current agent, explicitly not independent. Canonical verify and committed verification checkpoint precede finish at the actual implementationSHA. Scope is flat independent box geometry/current-line apply/history/union grid/fuzzy20/ODF/codec/device behavior only. Full merged/rowspan/nested/format-pool/UNO/XML-style/SFX/VCL/pixel/ruler/RTL/vertical/wrapped-uint16 parity remains incomplete; goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T12:45:46.095Z — VERIFY — ok

By: CODER

Note: Verified actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6 native independent box/current-row/history/fuzzy20/ODF/UI ownership;13808uniqueapp110inventory19infra299ChromiumPASS,23fresh,all4current-sourceapp/inventory100,zero passing replay89skipsrawthresholdretained; scope34/native/pin/stash/IO/artifact/governancePASS. Samecurrent EVALUATOR explicitlynotindependent PASS; full module/table/ruler residuals remain unpromoted and goalACTIVE.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T12:45:45.404Z, excerpt_hash=sha256:0f10577c9a1665a4303f75ec1f4a480a7b58b8185786e4e8b7d92421214dce90

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json
- old_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
- current_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610081143-8MWTR6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610081143-8MWTR6 -m 🧩 8MWTR6 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-08T12:46:08.646Z — VERIFY — ok

By: CODER

Note: verified-202610081143-8MWTR6
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T12:45:46.175Z, excerpt_hash=sha256:0f10577c9a1665a4303f75ec1f4a480a7b58b8185786e4e8b7d92421214dce90

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json
- old_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
- current_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610081143-8MWTR6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610081143-8MWTR6 --result verified-202610081143-8MWTR6 --commit 4c55ad4f82435345c6cdb20dba41062ffe20ada6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-08T12:46:42.675Z — VERIFY — ok

By: CODER

Note: Final documented hook/preflight observations preserve actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6. Runtime/native/source/scope/coverage/artifact/governance evidence and same-agent EVALUATOR PASS unchanged;13808app110inventory19infra299ChromiumPASS,zero passing replay. Corrected task-scope checkpoint precedes close; no hook bypass, no test rerun, goalACTIVE.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T12:46:42.105Z, excerpt_hash=sha256:0f10577c9a1665a4303f75ec1f4a480a7b58b8185786e4e8b7d92421214dce90

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081143-8MWTR6/blueprint/resolved-snapshot.json
- old_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
- current_digest: 801bf23bda014b988c07384c8ad34ae2dd885a4eaa270a770ed8a57d3c0c4075
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610081143-8MWTR6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610081143-8MWTR6 --result verified-202610081143-8MWTR6 --commit 4c55ad4f82435345c6cdb20dba41062ffe20ada6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this reviewed implementation; preserve prior DONE tasks, registered IO deviations and original stash.

## Findings

Implementation pending runtime verification: connected box widths now belong to independently cloned SwFormatFrameSize values; declarations are builder/import ingress only. GetTabCols merges actual current-row visible and all-row hidden positions/constraints with native integer scaling/fuzzy20; NewSetTabCols applies source width changes per original line and admits current-row-only flat/unspanned changes. SwDoc transaction moved to native ndtbl owner, preserving actual table/line/box/cursor history. Column insertion attribute snapshots retain all independent original cells; actual print/split checks use native boxes. Writer retained false current-line fallback removed. Source XML union grid spans feed actual DOM cells and ODF spans/covered-slot import without duplicate box sections. Codec complete frame-size fields extracted into a local infrastructure helper, preserving prior16 scalar row and box-less column declaration ingress. Three new acceptance sources and five source-justified old migrations assert other-row widths/native true flag/original graph rather than weakening numeric expectations. Full nested/merged/row-span propagation, complete native SFX/VCL/RTL/vertical/page/margin state and collapsed-border frame geometry remain partial, not certified.

Initial6static once: lint/type/dependencies/actual physical pass; late-added test formatting and two opening-fileoverview/one arrow JSDoc fail. Scoped closure1 on four changed-input/original-failed files passes format/lint/unchanged JSDoc; no successful global gate replay. Metadata update first in-memory attempt used a native-only responsibilities field for existing local infrastructure and failed before filesystem writes; corrected to existing responsibilities/rationale schema,309prior records preserved and two helpers inserted canonically (311total,1new partial native/1local infrastructure). Bounded read-only discovery found missing guessed test glob/check-docs path and absent imported frame item; actual rg-discovered check-jsdoc/native test paths used, route recomputed before mutations. No runtime/source gates executed yet, no test replay; raw diagnostics/scripts/source snapshots only ignored cache, no AP upstream/application/Python source. Parent662987chars/stash/pin/registered4IO preserved. No implementation commit/evaluator/canonical verification yet. Goal ACTIVE.

Full initial profile terminal: build PASS; app13785PASS15FAIL0SKIP (all15 fresh PASS), inventory110PASS, infrastructure19PASS, Chromium299PASS; vendor restored. Fifteen original failures inspected with actual stacks: two real local SetColumnWidths zero-width regressions; eleven complete-box-format expected values exclude native frame-size (including insertion width must differ), and two tests retain unsupported-current-row false behavior. Standing user authorization for upstream parity/refactoring covers necessary source-justified migrations in seven additional prior tests, Scope27->34. No pass criterion removed: complete size items/literal current-row/other-row/history strengthen contradictory prior contracts; every other prior acceptance source preserved. Source anchors swtable.cxx lcl_ModifyBoxes lines282-318 and lcl_AdjustWidthsInLine994-1040, swnewtable.cxx768-778 explicitly own/change native box frame widths; width0 is native pool default and rejection belongs to admission, not native item setter. Initial passing profiles will not replay. Read-only vendor discovery initially ignored vendor; bounded --no-ignore fallback found actual source paths. Plan expansion approved under standing goal before edits; sameCODER execution, no external writes or IO deviation.

Final runtime/source closure: one full upstream-absent profile only. Initial13785PASS15FAIL app,110inventory/19infra/299Chromium/buildPASS; original15 failures plus5 genuine native zero/builder/stream/print/narrow guards close20PASS0FAIL67SKIP. Native source review then found XML exact-set equality divergence from SwWriteTableCol fuzzy20 and o3tl sorted-vector lower-bound semantics; fixed approved XML grid owner and added3 genuine core/mounted/ODF cases. Closure2 core/ODF PASS and mounted grid/owner assertions PASS, last selector falsely assumed contenteditable=true; actual original textbox owner inspected, corrected role/name selector, closure3 originalfailed-only1PASS0FAIL2SKIP. Total13808 unique appPASS,110inventoryPASS,19infraPASS,299ChromiumPASS, zero uncaught and zero passing replay,89skipped observations retained. Raw original failure/threshold exits and focused raw threshold exits remain unchanged; cumulative current-source all4 app100 totals L17256/S18947/F4370/B14144 and inventory L1464/S1523/F384/B1081 verified with exact whole-source/maps or full contiguous declarations/bodies/enclosing branch/all-location proofs, and strict entire prior certificate fallback for any invalid V8 inferred counters; never sanitized counts. Initial successful static gates retained; changed-input closures (including original missing arrow JSDoc) pass format/lint/JSDoc/project semantic diagnostics/physical; maximum actual source948<1000. Source5 gates PASS once restored; final native11file anchors/current17production digests and5protected IO/bridge owners bind fuzzy source change without replay. Scope34 includes12 source-backed native contract migrations,611other acceptance sources byte-identical of623 baseline;309prior metadata entries preserved,311total with1partial unverified native XML helper/1explicit local codec helper. Initial scope-input audit missed ordinary apply's necessary fresh normalized carrier operand; actual source diff reviewed and third operand migration documented, no product/test edits or test replay. WholeAgentPlane5869inspected sources/Python/rawmap/result banPASS, routing backup byte-identical legitimate exception. Vendor pin9bc445578031fecf56086729d8e4940c77e14d65, protectedstash and662987char parentprefix retained. Tool-input quoting and misplaced patch context failed before mutation and were corrected against inspected paths; bounded guessed header lookup resolved through rg-discovered native filter header, route recomputed. Full merged/row-span/nested ownership/XML styles, native item pooling/UNO/format identities, full SFX/VCL/ruler/pixel/RTL/vertical/collapsed-border and wrapped-uint16 contexts remain partial and uncertified; no full module promotion. Actual-SHA evaluator/canonical verification/checkpoint/finish remain next. Goal ACTIVE.

Implementation commit preflight rejected unprefixed code subject before Git mutation: installed enforcement requires emoji/task-suffix/scope/summary. Corrected to task-prefixed code scope under actual command contract; semantic scope/verification unchanged.

Actual implementation4c55ad4f82435345c6cdb20dba41062ffe20ada6 committed. Same current agent EVALUATOR (explicitly not independent) reconstructed coverage/case/scope evidence byte-identically and checked all34 implementation files against exact Git bytes; quality verdict PASS recorded with complete native residuals. Current coverage L17256/S18947/F4370/B14144 and inventoryL1464/S1523/F384/B1081 all100;23freshcases and13808uniqueapp,110inventory,19infra,299ChromiumPASS; no passing replay,89skips/rawexitdiagnostics retained. Final task docs precede canonical verify; goalACTIVE and parent unchanged until verified finish.

Verification-checkpoint hook rejected verify scope: current code-tag enforcement admits code/task/close/integrate only. Actual implementation hash remains4c55ad4f82435345c6cdb20dba41062ffe20ada6; no checkpoint created. Subsequent route-emitted task complete rejected non-empty index before DONE, so task remains verified DOING. Direct doctor confirms no errors and the same two known warnings; no hook bypass or product/test changes. Corrected checkpoint to task scope and retained actual implementationSHA; final docs/canonical verify recorded again before checkpoint/close. No runtime rerun.
