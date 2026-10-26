---
id: "202610251634-PDD03R"
title: "Implement native Writer Markdown import export and UI filters"
result_summary: "verified-202610251634-PDD03R"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:34:29.190Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-25T16:42:42.899Z"
  updated_by: "CODER"
  note: "verified-202610251634-PDD03R"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-25T16:42:27.877Z"
  updated_by: "EVALUATOR"
  note: "Native Writer Markdown filter slice and UI routes satisfy approved scope and focused checks."
  evaluated_sha: "6165a674f9e685fdb752864e4d2c91ecf5022a03"
  blueprint_digest: "537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f"
  evidence_refs:
    - ".agentplane/tasks/202610251634-PDD03R/README.md"
    - ".agentplane/tasks/202610251634-PDD03R/quality/20261025-164227877-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610251634-PDD03R/quality/20261025-164227877-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610251634-PDD03R/quality/20261025-164227877-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610251634-PDD03R/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/md/swmd.test.ts"
    - "apps/office/src/sw/source/filter/md/wrtmd.test.ts"
    - "apps/office/src/sw/browser/presentation/WriterFileDialog.test.tsx"
  findings:
    - "Markdown reader, callbacks, table parser and writer own represented model conversion; shell and existing dialog use those filters. Forty focused tests, typecheck, lint, formatting, provenance, registry and boundaries pass. Unrepresented upstream features and WRITER094 are documented."
commit:
  hash: "a7f6976817049ead0a30b7aa7de373f62227364d"
  message: "🚧 PDD03R task: Record Markdown quality review"
comments:
  -
    author: "CODER"
    body: "Start: implement upstream-shaped native Markdown import and export through the Writer shell and existing browser UI."
  -
    author: "CODER"
    body: "Verified: verified-202610251634-PDD03R. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-25T16:34:35.926Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-shaped native Markdown import and export through the Writer shell and existing browser UI."
  -
    type: "verify"
    at: "2026-10-25T16:42:13.818Z"
    author: "CODER"
    state: "ok"
    note: "Native Markdown import/export and UI verified: 40 focused tests, typecheck, Prettier, ESLint, provenance, Writer inventory and module boundaries; upstream omissions and WRITER094 recorded."
  -
    type: "verify"
    at: "2026-10-25T16:42:42.899Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610251634-PDD03R"
  -
    type: "status"
    at: "2026-10-25T16:42:43.028Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610251634-PDD03R. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-25T16:42:43.028Z"
doc_updated_by: "CODER"
description: "Port the represented LibreOffice Markdown parser callback and SwMDWriter pathways for the current Writer model, integrate them through SwDocShell and existing Open/Export UI, and verify focused model and UI round trips."
sections:
  Summary: |-
    Implement native Writer Markdown import export and UI filters

    Port the represented LibreOffice Markdown parser callback and SwMDWriter pathways for the current Writer model, integrate them through SwDocShell and existing Open/Export UI, and verify focused model and UI round trips.
  Scope: "In scope: upstream-shaped Markdown reader and callback mapping under sw/source/filter/md, writer under the same upstream filter directory, represented Writer text runs, paragraph styles, lists and tables, shell import/export, existing browser Open/Export UI, focused tests and source provenance. Preserve existing save/autosave deviations. Record unsupported upstream responsibilities in Findings; no network or external dependencies. Out of scope: unrepresented images, drawing, complex layout and desktop-only filter behavior."
  Plan: "Implement one cohesive Markdown filter slice: source-shaped parser and writer under sw/source/filter/md, current-model styles/runs/lists/tables, shell and existing browser UI routes, source mappings and focused acceptance tests. Keep unsupported upstream behavior explicit."
  Verify Steps: |-
    1. Run focused Vitest Markdown parser, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect represented headings, emphasis, lists, tables and text escaping to pass.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
    3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
    4. Run Writer registry/provenance and dependency boundary checks; inspect shell/UI routes for native Markdown ownership. Record evidence and final git status.
  Verification: |-
    Command: npx vitest run --config vitest.writer.config.ts src/sw/source/filter/md/swmd.test.ts src/sw/source/filter/md/wrtmd.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (apps/office). Result: pass. Evidence: 4 files, 40 tests passed. Scope: Markdown reader, writer, shell lifecycle and UI.
    Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exit 0. Scope: office TypeScript.
    Command: npx prettier --check and npx eslint on 12 changed TS/TSX files. Result: pass. Evidence: all matched files formatted; ESLint exit 0. Scope: changed source and tests.
    Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run check:dependencies. Result: pass. Evidence: 1314 runtime source mappings, Writer inventory exit 0, 1313 runtime module boundaries pass. Scope: source mapping, registry and dependency edges.
    Inspection: SwDocShell.OpenMarkdown and SerializeMarkdown own model conversion; WriterFileDialog uses shell Open and browser export port. Result: pass. Scope: native route ownership.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-25T16:42:13.818Z — VERIFY — ok

    By: CODER

    Note: Native Markdown import/export and UI verified: 40 focused tests, typecheck, Prettier, ESLint, provenance, Writer inventory and module boundaries; upstream omissions and WRITER094 recorded.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:42:08.548Z, excerpt_hash=sha256:802e61f7693ebf9ed2028e57a48509d0ac6466ac2b5bc278ce9c4538489c944d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251634-PDD03R/blueprint/resolved-snapshot.json
    - old_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
    - current_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251634-PDD03R

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251634-PDD03R
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-25T16:42:42.899Z — VERIFY — ok

    By: CODER

    Note: verified-202610251634-PDD03R
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:42:13.883Z, excerpt_hash=sha256:802e61f7693ebf9ed2028e57a48509d0ac6466ac2b5bc278ce9c4538489c944d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251634-PDD03R/blueprint/resolved-snapshot.json
    - old_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
    - current_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251634-PDD03R

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610251634-PDD03R --result verified-202610251634-PDD03R --commit a7f6976817049ead0a30b7aa7de373f62227364d
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Implemented represented Markdown block and span callbacks under upstream-shaped md modules: headings, paragraph text, emphasis, links, code and strikeout spans, quotes, fenced code, list levels, tables and column alignment. SwDocShell owns atomic import and native export; the browser dialog only supplies input and downloads output. The pinned upstream uses md4c and a wider filter model; complete CommonMark/md4c grammar, HTML blocks, images, frames, task lists, sections, redlines and desktop filter options remain unverified. Runtime/provenance records retain unverified status. Suspected upstream table-pipe escaping issue recorded as WRITER094 and the source escape set preserved. The broader RTF filter remains a bounded slice; further represented character attributes may need a separate follow-up audit."
extensions:
  implementation_commit:
    hash: "6165a674f9e685fdb752864e4d2c91ecf5022a03"
    message: "🚧 PDD03R task: Add native Writer Markdown filters and UI routes"
id_source: "generated"
---
## Summary

Implement native Writer Markdown import export and UI filters

Port the represented LibreOffice Markdown parser callback and SwMDWriter pathways for the current Writer model, integrate them through SwDocShell and existing Open/Export UI, and verify focused model and UI round trips.

## Scope

In scope: upstream-shaped Markdown reader and callback mapping under sw/source/filter/md, writer under the same upstream filter directory, represented Writer text runs, paragraph styles, lists and tables, shell import/export, existing browser Open/Export UI, focused tests and source provenance. Preserve existing save/autosave deviations. Record unsupported upstream responsibilities in Findings; no network or external dependencies. Out of scope: unrepresented images, drawing, complex layout and desktop-only filter behavior.

## Plan

Implement one cohesive Markdown filter slice: source-shaped parser and writer under sw/source/filter/md, current-model styles/runs/lists/tables, shell and existing browser UI routes, source mappings and focused acceptance tests. Keep unsupported upstream behavior explicit.

## Verify Steps

1. Run focused Vitest Markdown parser, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect represented headings, emphasis, lists, tables and text escaping to pass.
2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
4. Run Writer registry/provenance and dependency boundary checks; inspect shell/UI routes for native Markdown ownership. Record evidence and final git status.

## Verification

Command: npx vitest run --config vitest.writer.config.ts src/sw/source/filter/md/swmd.test.ts src/sw/source/filter/md/wrtmd.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (apps/office). Result: pass. Evidence: 4 files, 40 tests passed. Scope: Markdown reader, writer, shell lifecycle and UI.
Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exit 0. Scope: office TypeScript.
Command: npx prettier --check and npx eslint on 12 changed TS/TSX files. Result: pass. Evidence: all matched files formatted; ESLint exit 0. Scope: changed source and tests.
Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run check:dependencies. Result: pass. Evidence: 1314 runtime source mappings, Writer inventory exit 0, 1313 runtime module boundaries pass. Scope: source mapping, registry and dependency edges.
Inspection: SwDocShell.OpenMarkdown and SerializeMarkdown own model conversion; WriterFileDialog uses shell Open and browser export port. Result: pass. Scope: native route ownership.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-25T16:42:13.818Z — VERIFY — ok

By: CODER

Note: Native Markdown import/export and UI verified: 40 focused tests, typecheck, Prettier, ESLint, provenance, Writer inventory and module boundaries; upstream omissions and WRITER094 recorded.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:42:08.548Z, excerpt_hash=sha256:802e61f7693ebf9ed2028e57a48509d0ac6466ac2b5bc278ce9c4538489c944d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251634-PDD03R/blueprint/resolved-snapshot.json
- old_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
- current_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251634-PDD03R

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251634-PDD03R
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-25T16:42:42.899Z — VERIFY — ok

By: CODER

Note: verified-202610251634-PDD03R
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:42:13.883Z, excerpt_hash=sha256:802e61f7693ebf9ed2028e57a48509d0ac6466ac2b5bc278ce9c4538489c944d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251634-PDD03R/blueprint/resolved-snapshot.json
- old_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
- current_digest: 537811c14a5eafaac02b2f0d71559307238d0f6a5e383edd58553987e53b724f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251634-PDD03R

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610251634-PDD03R --result verified-202610251634-PDD03R --commit a7f6976817049ead0a30b7aa7de373f62227364d
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Implemented represented Markdown block and span callbacks under upstream-shaped md modules: headings, paragraph text, emphasis, links, code and strikeout spans, quotes, fenced code, list levels, tables and column alignment. SwDocShell owns atomic import and native export; the browser dialog only supplies input and downloads output. The pinned upstream uses md4c and a wider filter model; complete CommonMark/md4c grammar, HTML blocks, images, frames, task lists, sections, redlines and desktop filter options remain unverified. Runtime/provenance records retain unverified status. Suspected upstream table-pipe escaping issue recorded as WRITER094 and the source escape set preserved. The broader RTF filter remains a bounded slice; further represented character attributes may need a separate follow-up audit.
