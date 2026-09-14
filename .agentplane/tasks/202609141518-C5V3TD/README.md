---
id: "202609141518-C5V3TD"
title: "Implement Workstream 5 browser editing isolation"
result_summary: "verified-202609141518-C5V3TD"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T15:19:03.616Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T16:13:01.992Z"
  updated_by: "TESTER"
  note: "Full repository verification passed for Workstream 5."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T16:11:48.600Z"
  updated_by: "EVALUATOR"
  note: "Workstream 5 implementation satisfies the approved browser-editing isolation, single-host editing, and explicit Writer-operation scope."
  evaluated_sha: "e754ceabe6e90da8695040211dee1adf1e0a9ba8"
  blueprint_digest: "f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e"
  evidence_refs:
    - ".agentplane/tasks/202609141518-C5V3TD/README.md"
    - ".agentplane/tasks/202609141518-C5V3TD/quality/20260914-161148600-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141518-C5V3TD/quality/20260914-161148600-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141518-C5V3TD/quality/20260914-161148600-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141518-C5V3TD/blueprint/resolved-snapshot.json"
    - "implementation commit e754ceabe6e9"
    - "npm run verify: exit 0; 259 office tests and 84 inventory tests at 100% coverage; 9 Chromium E2E tests"
    - "source provenance check: 100 runtime modules; parity inventory: 34 implemented records and 0 exceptions"
  findings:
    - "React now projects document state while browser-specific selection, intent, IME, clipboard, and geometry behavior resides in isolated adapters."
    - "Cross-paragraph deletion, replacement, split, paste, and Select All retain SwWrtShell and SwPaM authority with Writer undo list actions."
    - "Guarded DOM reconciliation is observable and restricted to unsupported native input; ordinary beforeinput operations use explicit shell commands."
commit:
  hash: "86ccac0c68d42b28e17bac567148fac8f48f51f7"
  message: "🧩 C5V3TD task: persist verification artifacts"
comments:
  -
    author: "CODER"
    body: "Start: Implement Workstream 5 browser editing isolation, single logical editing host, explicit Writer edit intents, and acceptance coverage against the pinned upstream baseline."
  -
    author: "CODER"
    body: "Verified: verified-202609141518-C5V3TD. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-14T15:19:09.021Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement Workstream 5 browser editing isolation, single logical editing host, explicit Writer edit intents, and acceptance coverage against the pinned upstream baseline."
  -
    type: "verify"
    at: "2026-09-14T16:11:34.931Z"
    author: "TESTER"
    state: "ok"
    note: "Workstream 5 acceptance verified: the full repository verification suite passed, including 100% unit and inventory coverage, nine Chromium E2E flows, build, provenance, source-tree, and parity gates."
  -
    type: "verify"
    at: "2026-09-14T16:12:12.248Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141518-C5V3TD"
  -
    type: "status"
    at: "2026-09-14T16:12:12.566Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609141518-C5V3TD. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "verify"
    at: "2026-09-14T16:13:01.992Z"
    author: "TESTER"
    state: "ok"
    note: "Full repository verification passed for Workstream 5."
doc_version: 3
doc_updated_at: "2026-09-14T16:13:02.168Z"
doc_updated_by: "CODER"
description: "Implement P5.1-P5.3 from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice baseline: isolate browser editing adapters from React, establish one logical document editing host with canonical Writer selection, and make explicit Writer operations the normal input path with an observable guarded reconciliation fallback."
sections:
  Summary: "Implement Workstream 5 (P5.1-P5.3) from the upstream parity plan: isolate browser editing behavior from React, replace paragraph editing islands with one logical document host, and route normal browser input through explicit Writer operations."
  Scope: "In scope: apps/office/src/sw/browser/editor/**; Writer document-view projection under apps/office/src/sw/source/uibase/docvw/**; narrowly required Writer shell/command changes; focused unit, integration, and Playwright tests; provenance/runtime inventory updates required by created or moved modules. Preserve current formatting, list, clipboard, undo, and ODT behavior. Use vendor/libreoffice-reference at the pinned baseline for applicable edit-window, selection, extended-text-input, and Writer shell semantics. No backward compatibility layer is required if persisted document state changes. Out of scope: new Writer features, XML architecture, session lifecycle, and unrelated UI refactors."
  Plan: "1. Inspect pinned LibreOffice edit-window, shell, selection, and extended-text-input code and record the bounded browser-applicable invariants. 2. Extract model-neutral browser selection, edit-intent, composition, clipboard-event, and geometry adapters from React rendering. 3. Convert the document projection to one root editing host while retaining paragraph projection nodes and canonical SwPaM authority. 4. Normalize typing, deletion, paragraph breaks, paste, and composition into explicit Writer operations; retain a diagnostic guarded fallback for unknown browser mutations. 5. Add or update unit/integration/E2E tests for cross-paragraph selection/editing, IME boundaries, formatting preservation, fallback observability, and safe rejection. 6. Update provenance/inventory records where module ownership changes, then run the declared verification suite."
  Verify Steps: "1. Run targeted Vitest suites for apps/office/src/sw/browser/editor and apps/office/src/sw/source/uibase/docvw. 2. Run targeted Playwright Writer selection, clipboard, cut/paste, character-formatting, and paragraph-editing coverage. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts before completion. Acceptance: React projection contains no document mutation algorithms; browser globals are isolated or injected; normalized intents reach Writer operations; IME commits once; one logical host supports cross-paragraph selection, Select All, copy, deletion, split/merge; ordinary edits and paste do not replace whole paragraphs; direct hints survive; fallback is observable; unknown input fails safely."
  Verification: |-
    -
    > vite-office@0.1.0 verify
    > npm run format:check && npm run lint && npm run typecheck && npm run check:dependencies && npm run test:coverage && npm run test:inventory:coverage && npm run test:e2e && npm run test:static && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity

    > vite-office@0.1.0 format:check
    > prettier --check .

    Checking formatting...
    All matched files use Prettier code style!

    > vite-office@0.1.0 lint
    > eslint . --max-warnings 0

    > vite-office@0.1.0 typecheck
    > npm run typecheck:tools && npm run typecheck --workspace @vite-office/office

    > vite-office@0.1.0 typecheck:tools
    > tsc --project tsconfig.tools.json

    > @vite-office/office@0.1.0 typecheck
    > tsc --noEmit

    > vite-office@0.1.0 check:dependencies
    > node scripts/check-module-boundaries.mjs

    Module boundary check passed: 100 runtime sources, 311 relative imports, 12 allowed cross-module edges.

    > vite-office@0.1.0 test:coverage
    > npm run test:coverage --workspace @vite-office/office

    > @vite-office/office@0.1.0 test:coverage
    > vitest run --coverage

     RUN  v4.1.10 /Users/odubinkin/Projects/vite-office/apps/office
          Coverage enabled with v8

     Test Files  51 passed (51)
          Tests  259 passed (259)
       Start at  23:11:07
       Duration  24.01s (transform 4.93s, setup 17.99s, import 10.16s, tests 26.74s, environment 80.68s)

     % Coverage report from v8
    -------------------|---------|----------|---------|---------|-------------------
    File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
    -------------------|---------|----------|---------|---------|-------------------
    -------------------|---------|----------|---------|---------|-------------------

    =============================== Coverage summary ===============================
    Statements   : 100% ( 4763/4763 )
    Branches     : 100% ( 3026/3026 )
    Functions    : 100% ( 1273/1273 )
    Lines        : 100% ( 4400/4400 )
    ================================================================================

    > vite-office@0.1.0 test:inventory:coverage
    > vitest run --config scripts/libreoffice-inventory/vitest.config.ts --coverage

     RUN  v4.1.10 /Users/odubinkin/Projects/vite-office
          Coverage enabled with v8

     Test Files  32 passed (32)
          Tests  84 passed (84)
       Start at  23:11:32
       Duration  60.92s (transform 484ms, setup 0ms, import 976ms, tests 55.39s, environment 3ms)

     % Coverage report from v8
    -------------------|---------|----------|---------|---------|-------------------
    File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
    -------------------|---------|----------|---------|---------|-------------------
    -------------------|---------|----------|---------|---------|-------------------

    =============================== Coverage summary ===============================
    Statements   : 100% ( 1233/1233 )
    Branches     : 100% ( 794/794 )
    Functions    : 100% ( 319/319 )
    Lines        : 100% ( 1183/1183 )
    ================================================================================

    > vite-office@0.1.0 test:e2e
    > npm run build && playwright test --config apps/office/playwright.config.ts

    > vite-office@0.1.0 build
    > npm run build --workspace @vite-office/office

    > @vite-office/office@0.1.0 build
    > tsc --noEmit && vite build

    vite v8.2.1 building client environment for production...
    [2Ktransforming...✓ 1888 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                       0.56 kB │ gzip:   0.35 kB
    dist/assets/odt-worker-gWpw9cD9.js  100.11 kB
    dist/assets/index-DpuEHzrZ.css       25.36 kB │ gzip:   5.81 kB
    dist/assets/index-CkUrY4lB.js       420.40 kB │ gzip: 121.75 kB

    ✓ built in 330ms

    Running 9 tests using 4 workers

      ✓  3 apps/office/e2e/writer-clipboard.spec.ts:5:1 › copies visible formatted Writer content through the native browser copy event (1.7s)
      ✓  1 apps/office/e2e/writer-cut-paste.spec.ts:5:1 › Writer Cut and Paste (1.8s)
      ✓  2 apps/office/e2e/writer-character-formatting.spec.ts:5:1 › Writer direct character formatting (2.4s)
      ✓  6 apps/office/e2e/writer-cut-paste.spec.ts:55:1 › Writer immediate spaces and structured list Paste (1.4s)
      ✓  5 apps/office/e2e/writer-clipboard.spec.ts:52:1 › Writer list clipboard (1.6s)
      ✓  7 apps/office/e2e/writer-document-selection.spec.ts:5:1 › supports document-wide selection through Ctrl/Cmd+A and pointer dragging (1.6s)
      ✓  8 apps/office/e2e/writer-lists.spec.ts:5:1 › Writer bullets and numbering (1.9s)
      ✓  9 apps/office/e2e/writer-odt-file.spec.ts:14:1 › Writer opens and saves a bounded ODT file (1.7s)
      ✓  4 apps/office/e2e/foundation.spec.ts:8:1 › Writer menu keyboard navigation and accessible application chrome (6.2s)

      9 passed (8.3s)

    > vite-office@0.1.0 test:static
    > npm run build && node scripts/check-static-build.mjs

    > vite-office@0.1.0 build
    > npm run build --workspace @vite-office/office

    > @vite-office/office@0.1.0 build
    > tsc --noEmit && vite build

    vite v8.2.1 building client environment for production...
    [2Ktransforming...✓ 1888 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                       0.56 kB │ gzip:   0.35 kB
    dist/assets/odt-worker-gWpw9cD9.js  100.11 kB
    dist/assets/index-DpuEHzrZ.css       25.36 kB │ gzip:   5.81 kB
    dist/assets/index-CkUrY4lB.js       420.40 kB │ gzip: 121.75 kB

    ✓ built in 424ms
    Static build smoke passed: relative assets, 2 JavaScript bundle(s), no backend endpoints.

    > vite-office@0.1.0 check:docs
    > node scripts/check-jsdoc.mjs

    JSDoc validation passed for 236 authored source files.

    > vite-office@0.1.0 check:file-size
    > node scripts/check-file-size.mjs

    File-size check scanned 238 authored files.
    Decomposition review candidates:
    apps/office/src/framework/source/dispatch/dispatchprovider.ts: 571 lines
    apps/office/src/framework/source/services/desktop.test.tsx: 642 lines
    apps/office/src/sw/source/core/doc/writer-model.test.ts: 599 lines
    apps/office/src/sw/source/core/txtnode/ndtxt.ts: 800 lines
    apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts: 773 lines
    apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts: 509 lines
    apps/office/src/sw/source/uibase/shells/writercommands.ts: 513 lines
    apps/office/src/sw/source/uibase/uiview/view-session.ts: 584 lines
    apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts: 975 lines
    apps/office/src/vcl/browser/indexeddb-storage.ts: 628 lines
    scripts/check-source-provenance.ts: 680 lines
    scripts/libreoffice-inventory/contracts.ts: 536 lines
    scripts/libreoffice-inventory/parity-mappings.test.ts: 691 lines
    scripts/libreoffice-inventory/parity-mappings.ts: 812 lines
    scripts/libreoffice-inventory/runtime-inventory.ts: 537 lines

    > vite-office@0.1.0 check:source-tree
    > node scripts/check-lo-source-tree.mjs

    LibreOffice source-tree check passed for 68 required paths and 20 retired roots.

    > vite-office@0.1.0 check:source-provenance
    > tsx scripts/check-source-provenance.ts

    Source provenance check passed for 100 runtime modules (62 mapped, 23 browser adaptations, 15 local infrastructure).

    > vite-office@0.1.0 inventory:parity
    > tsx scripts/libreoffice-inventory/parity-mapping-cli.ts --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --runtime-inventory docs/program/parity/runtime-inventory.json --runtime-root apps/office/src --local-root . --upstream-root vendor/libreoffice-reference

    {
      "baselineCommit": "9bc445578031fecf56086729d8e4940c77e14d65",
      "exceptionCount": 0,
      "exceptions": [],
      "gapCount": 68,
      "implementedCount": 34,
      "recordCount": 34,
      "resolvedEvidence": [
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-ui-shell.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/undo/undo.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/undo/unins.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/undo/undel.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/undo/unattr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/undo/undo.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/transaction-history.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "svl/source/undo/undo.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/unins.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/undel.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-clipboard.spec.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-document-selection.spec.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter6.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/select_text.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-ui-shell.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering2.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/05150000.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/list.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/number.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/uiconfig/swriter/toolbar/textobjectbar.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/list.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/number.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-lists.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-paragraph-lists.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/list.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/number.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/shells/txtnum.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter8.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter10.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/uitest/writer_tests2/formatBulletsNumbering.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/02/02110000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/02/06040000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/guide/using_numbered_lists.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/ascii/ascatr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/ascii/ascatr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-clipboard.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-paragraph-lists.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/html/htmlnumwriter.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/ascii/ascatr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter9.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/filter/html/html.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/htmlimport/htmlimport.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/01/02050000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/02/02110000.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/shells/listsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/undo/unnum.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/uiconfig/swriter/toolbar/numobjectbar.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/list.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-lists.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-paragraph-lists.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/shells/listsh.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/sdi/swriter.sdi",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/numobjectbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/uitest/writer_tests2/formatBulletsNumbering.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/02/06050000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/02/06060000.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/ascii/ascatr.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/ascii/ascatr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-clipboard.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-paragraph-lists.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/html/htmlnumwriter.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/ascii/ascatr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/htmlexport/htmlexport2.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/htmlimport/htmlimport.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/01/02050000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/02/02110000.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/editor/writer-selection.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-character-formatting.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-character-formatting.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/shells/txtattr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/ndtxt.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/uitest/writer_tests2/formatCharacter.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/04/01020000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/guide/shortcut_writing.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-clipboard.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-cut-paste.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/DocumentContentOperationsManager.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter8.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/uitest/writer_tests2/tdf133299.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/01/02040000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/01/02060000.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/crsr/pam.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/docnew.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/nodes.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/ndtxt.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/crsr/pam.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/txatbase.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/uwriter.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/txtnode/txtnode.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/items/itemset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/editeng/source/items/textitem.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/format.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/node.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/para/paratr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/items/itemset.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/editeng/source/items/textitem.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itemset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itempool.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "editeng/source/items/textitem.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/swatrset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/format.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/fmtcol.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/node.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/para/paratr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/attr/attr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/doc/number.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/CRC32.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparae.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparai.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/framework/source/services/worker-protocol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-file.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-download.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-file.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-odt-file.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-odt-format.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/worker-cancellation-protocol.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/CRC32.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipFile.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipOutputStream.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/manifest/ManifestExport.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparae.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparai.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sax/source/fastparser/fastparser.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/wrtxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docsh.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docshini.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sfx2/source/doc/objsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/misc/recovery.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/misc/recovery.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/document-lifecycle.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/autosave-recovery.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/transaction-history.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objmisc.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objstor.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/sfxbasemodel.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/docundo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/undo/undo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/python/check_xmodifiable2.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/util/XModifiable.idl",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-ui-shell.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-ui-shell.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-clipboard.spec.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-document-selection.spec.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter6.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/select_text.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-clipboard.spec.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-document-selection.spec.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/foundation.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter6.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/01/select_text.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/browser/editor/writer-selection.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-character-formatting.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-character-formatting.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/shells/txtattr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/ndtxt.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/uitest/writer_tests2/formatCharacter.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/04/01020000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/swriter/guide/shortcut_writing.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-clipboard.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-cut-paste.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-clipboard.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-command-placement.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/DocumentContentOperationsManager.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/menubar/menubar.xml",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/uiwriter/uiwriter8.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/uitest/writer_tests2/tdf133299.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/01/02040000.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/01/02060000.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/CRC32.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparae.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparai.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/framework/source/services/worker-protocol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-file.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-download.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-file.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-odt-file.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-odt-format.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/worker-cancellation-protocol.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/CRC32.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipFile.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipOutputStream.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/manifest/ManifestExport.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparae.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparai.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sax/source/fastparser/fastparser.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/wrtxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docsh.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docshini.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sfx2/source/doc/objsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/misc/recovery.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/misc/recovery.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/document-lifecycle.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/autosave-recovery.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/transaction-history.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objmisc.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objstor.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/sfxbasemodel.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/docundo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/undo/undo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/python/check_xmodifiable2.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/util/XModifiable.idl",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/crsr/pam.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/docnew.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/nodes.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/ndtxt.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/crsr/pam.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/txatbase.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/uwriter.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/txtnode/txtnode.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/crsr/pam.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/docnew.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/nodes.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/ndtxt.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/crsr/pam.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/txatbase.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/uwriter.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/txtnode/txtnode.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/items/itemset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/editeng/source/items/textitem.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/format.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/node.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/para/paratr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/items/itemset.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/editeng/source/items/textitem.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itemset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itempool.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "editeng/source/items/textitem.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/swatrset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/format.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/fmtcol.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/node.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/para/paratr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/attr/attr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/doc/number.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/items/itemset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/editeng/source/items/textitem.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/format.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/node.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/para/paratr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/items/itemset.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/editeng/source/items/textitem.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itemset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itempool.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "editeng/source/items/textitem.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/swatrset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/format.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/fmtcol.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/node.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/para/paratr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/attr/attr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/doc/number.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/items/itemset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/editeng/source/items/textitem.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/attr/format.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/node.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/para/paratr.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/items/itemset.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/editeng/source/items/textitem.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itemset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "svl/source/items/itempool.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "editeng/source/items/textitem.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/swatrset.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/attr/format.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/fmtcol.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/node.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/para/paratr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/attr/attr.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/doc/number.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/CRC32.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparae.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparai.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/framework/source/services/worker-protocol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-file.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-download.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-file.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-odt-file.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-odt-format.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/worker-cancellation-protocol.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/CRC32.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipFile.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipOutputStream.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/manifest/ManifestExport.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparae.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparai.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sax/source/fastparser/fastparser.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/wrtxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docsh.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docshini.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/CRC32.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparae.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparai.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/framework/source/services/worker-protocol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-file.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-download.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-file.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-odt-file.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-odt-format.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/worker-cancellation-protocol.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/CRC32.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipFile.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipOutputStream.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/manifest/ManifestExport.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparae.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparai.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sax/source/fastparser/fastparser.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/wrtxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docsh.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docshini.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/CRC32.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparae.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/xmloff/source/text/txtparai.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/framework/source/services/worker-protocol.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-file.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/vcl/browser/browser-download.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/vcl/browser/browser-file.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/framework/source/services/desktop.test.tsx",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/e2e/writer-odt-file.spec.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-odt-format.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/worker-cancellation-protocol.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/CRC32.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipFile.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/zipapi/ZipOutputStream.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "package/source/manifest/ManifestExport.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparae.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "xmloff/source/text/txtparai.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sax/source/fastparser/fastparser.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/wrtxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/filter/xml/swxml.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docsh.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/uibase/app/docshini.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/extras/odfimport/odffeatures.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/00/00000021.xhp",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sfx2/source/doc/objsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/misc/recovery.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/misc/recovery.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/document-lifecycle.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/autosave-recovery.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/transaction-history.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objmisc.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objstor.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/sfxbasemodel.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/docundo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/undo/undo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/python/check_xmodifiable2.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/util/XModifiable.idl",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sfx2/source/doc/objsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/misc/recovery.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/misc/recovery.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/document-lifecycle.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/autosave-recovery.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/transaction-history.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objmisc.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objstor.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/sfxbasemodel.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/docundo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/undo/undo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/python/check_xmodifiable2.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/util/XModifiable.idl",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sfx2/source/doc/objsh.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/svl/source/misc/recovery.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/svl/source/misc/recovery.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/document-lifecycle.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/autosave-recovery.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/transaction-history.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objmisc.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/objstor.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sfx2/source/doc/sfxbasemodel.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/undo/docundo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/undo/undo.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/python/check_xmodifiable2.py",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/util/XModifiable.idl",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/doc/doc.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/crsr/pam.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "tests",
          "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/writer-core-model.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/architecture.md",
          "side": "local"
        },
        {
          "kind": "docs",
          "path": "docs/program/source-tree.md",
          "side": "local"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/doc/docnew.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/docnode/nodes.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/ndtxt.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/crsr/pam.cxx",
          "side": "upstream"
        },
        {
          "kind": "implementation",
          "path": "sw/source/core/txtnode/txatbase.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/uwriter.cxx",
          "side": "upstream"
        },
        {
          "kind": "tests",
          "path": "sw/qa/core/txtnode/txtnode.cxx",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        },
        {
          "kind": "docs",
          "path": "sw/README.md",
          "side": "upstream"
        }
      ],
      "schemaVersion": 3,
      "verifiedCount": 0,
      "runtime": {
        "commandCount": 29,
        "exportedOperationCount": 131,
        "internalOperationCount": 9,
        "modules": [
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/editeng/source/items/paraitem.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/editeng/source/items/textitem.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0101"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/framework/source/accelerators/keymapping.ts",
            "state": "active",
            "subsystem": "accelerators",
            "suite": "shared",
            "exportedOperations": [
              "getBrowserShortcut"
            ]
          },
          {
            "capabilityIds": [],
            "classification": "local-infrastructure",
            "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
            "path": "apps/office/src/framework/source/dispatch/dispatchprovider.ts",
            "state": "active",
            "subsystem": "dispatch",
            "suite": "shared",
            "exportedOperations": [
              "createCommandRegistry",
              "createCommandShell",
              "dispatchCommand",
              "findCommandById",
              "findCommandByShortcut",
              "normalizeCommandShortcut"
            ]
          },
          {
            "capabilityIds": [],
            "classification": "local-infrastructure",
            "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
            "path": "apps/office/src/framework/source/services/SuiteCard.tsx",
            "state": "active",
            "subsystem": "application-services",
            "suite": "shared",
            "exportedOperations": [
              "SuiteCard"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0122",
              "CAP-0133"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/framework/source/services/autorecovery.ts",
            "state": "active",
            "subsystem": "recovery",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [],
            "classification": "local-infrastructure",
            "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
            "path": "apps/office/src/framework/source/services/bootstrap.tsx",
            "state": "active",
            "subsystem": "application-services",
            "suite": "shared",
            "exportedOperations": [
              "mountApplication"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/framework/source/services/desktop.tsx",
            "state": "active",
            "subsystem": "application-services",
            "suite": "shared",
            "exportedOperations": [
              "Desktop"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/framework/source/services/messages.ts",
            "state": "foundation",
            "subsystem": "application-services",
            "suite": "shared",
            "exportedOperations": [
              "interpolateMessage",
              "normalizeLocale",
              "resolveMessage"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/framework/source/services/modulemanager.ts",
            "state": "active",
            "subsystem": "application-services",
            "suite": "shared",
            "exportedOperations": [
              "createOfficeModuleDescriptors"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0113"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/framework/source/services/worker-protocol.ts",
            "state": "active",
            "subsystem": "application-services",
            "suite": "shared",
            "exportedOperations": [
              "cancelWorkerRequest",
              "classifyWorkerResult",
              "createWorkerClientState",
              "issueWorkerRequest"
            ]
          },
          {
            "capabilityIds": [],
            "classification": "local-infrastructure",
            "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
            "path": "apps/office/src/main.tsx",
            "state": "active",
            "subsystem": "composition",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0113"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": [
              "createOdtManifestXml",
              "validateOdtManifestXml"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/package/source/zipapi/CRC32.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0113"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": [
              "assertSafeZipEntryName"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0131"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sfx2/source/doc/docfile.ts",
            "state": "active",
            "subsystem": "document-lifecycle",
            "suite": "shared",
            "exportedOperations": [
              "createSfxMediumDescriptor",
              "loadSnapshot",
              "saveSnapshot",
              "updateSfxMediumOperation"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0132"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sfx2/source/doc/objsh.ts",
            "state": "active",
            "subsystem": "document-lifecycle",
            "suite": "shared",
            "exportedOperations": [
              "closeDocument",
              "createDocument",
              "markDocumentDirty",
              "markDocumentHistoryRestored",
              "markDocumentHistorySavePosition",
              "markDocumentRecoverySaved",
              "markDocumentSaved"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/svl/source/items/itempool.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/svl/source/items/itemset.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/svl/source/items/poolitem.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0122",
              "CAP-0133"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/svl/source/misc/recovery.ts",
            "state": "foundation",
            "subsystem": "recovery",
            "suite": "shared",
            "exportedOperations": [
              "autosaveDocument",
              "recoverDocument"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0131"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/svl/source/misc/storage.ts",
            "state": "active",
            "subsystem": "storage-contract",
            "suite": "shared",
            "exportedOperations": [
              "loadStorageRecord",
              "saveStorageRecord"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/svl/source/notify/broadcast.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/svl/source/notify/listener.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102",
              "CAP-0132"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/svl/source/undo/undo.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102",
              "CAP-0109",
              "CAP-0115"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/accelerators/writer-shortcuts.ts",
            "state": "active",
            "subsystem": "accelerators",
            "suite": "writer",
            "exportedOperations": [
              "useWriterCommandShortcuts"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0106",
              "CAP-0120"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
            "state": "active",
            "subsystem": "browser-editor",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0118"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/editor/writer-composition.ts",
            "state": "active",
            "subsystem": "browser-editor",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0117",
              "CAP-0118"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/editor/writer-edit-controller.ts",
            "state": "active",
            "subsystem": "browser-editor",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0117"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/editor/writer-geometry.ts",
            "state": "active",
            "subsystem": "browser-editor",
            "suite": "writer",
            "exportedOperations": [
              "getBrowserWriterCaretFromPoint"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0117",
              "CAP-0118"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
            "state": "active",
            "subsystem": "browser-editor",
            "suite": "writer",
            "exportedOperations": [
              "getWriterCollapsedCaretOffset",
              "getWriterCollapsedParagraphCaret",
              "getWriterDomSelection",
              "getWriterSameParagraphSelection",
              "restoreWriterCollapsedCaret",
              "restoreWriterDomSelection"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0115"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
            "state": "active",
            "subsystem": "browser-presentation",
            "suite": "writer",
            "exportedOperations": [
              "WriterCommandToolbar"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0105",
              "CAP-0107",
              "CAP-0109",
              "CAP-0112",
              "CAP-0115"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
            "state": "active",
            "subsystem": "browser-presentation",
            "suite": "writer",
            "exportedOperations": [
              "WriterFormattingToolbar"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0115",
              "CAP-0116"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
            "state": "active",
            "subsystem": "browser-presentation",
            "suite": "writer",
            "exportedOperations": [
              "WriterMenuBar"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0105",
              "CAP-0107",
              "CAP-0109",
              "CAP-0112",
              "CAP-0115"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/presentation/WriterPropertiesPanel.tsx",
            "state": "active",
            "subsystem": "browser-presentation",
            "suite": "writer",
            "exportedOperations": [
              "WriterParagraphProperties"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0115"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx",
            "state": "active",
            "subsystem": "browser-presentation",
            "suite": "writer",
            "exportedOperations": [
              "WriterWorkspaceChrome"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0115"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/browser/presentation/command-source.ts",
            "state": "active",
            "subsystem": "browser-presentation",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/inc/calbck.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": [
              "subscribeToSwModify"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/inc/hintids.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/inc/hints.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": [
              "hasSwModelHintKind"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/attr/format.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/bastyp/contentindex.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/crsr/pam.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0110",
              "CAP-0111",
              "CAP-0124"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/doc/doc.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0112"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "writer",
            "exportedOperations": [
              "isWriterParagraphStyle"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0112",
              "CAP-0127"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/doc/list.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "writer",
            "exportedOperations": [
              "createDefaultWriterParagraphList",
              "isWriterParagraphListKind",
              "normalizeWriterParagraphList"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0112",
              "CAP-0127"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/doc/number.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "writer",
            "exportedOperations": [
              "getWriterParagraphListMarker"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0131",
              "CAP-0132"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
            "state": "active",
            "subsystem": "document-lifecycle",
            "suite": "writer",
            "exportedOperations": [
              "createWriterSnapshot",
              "loadWriterDocument",
              "restoreWriterSnapshot",
              "saveWriterDocument"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0111",
              "CAP-0123",
              "CAP-0124"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/sw/source/core/doc/writer.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": [
              "createWriterDocument",
              "normalizeWriterParagraphFormatting",
              "serializeWriterDocument"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0111",
              "CAP-0123"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/docnode/node.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111",
              "CAP-0123"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0112",
              "CAP-0125",
              "CAP-0127"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/para/paratr.ts",
            "state": "active",
            "subsystem": "formatting-model",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0111",
              "CAP-0126"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": [
              "createSwpHintsFromSnapshot"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0111",
              "CAP-0123",
              "CAP-0124",
              "CAP-0126"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": [
              "createWriterTextRuns",
              "getWriterNextGraphemeBoundary",
              "getWriterPreviousGraphemeBoundary",
              "getWriterTextAttributesAtOffset",
              "getWriterTextChange",
              "getWriterTextFromRuns",
              "insertWriterTextRun",
              "isWriterParagraphAlignment",
              "normalizeWriterCharacterAttributes",
              "normalizeWriterTextRuns",
              "splitWriterTextRuns",
              "toggleWriterTextRangeFormat"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0111",
              "CAP-0126"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
            "state": "active",
            "subsystem": "document-model",
            "suite": "writer",
            "exportedOperations": [
              "createSwFormatAutoFormat",
              "projectWriterCharacterAttributes",
              "restoreSwFormatAutoFormat"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/unattr.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/undel.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/undobj.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": [
              "CopyTextRangeRuns",
              "CopyUndoRuns",
              "GetRunsPayloadSize",
              "GetUndoRunsLength",
              "GetUndoTextNode",
              "ReplaceUndoRange"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/unfmco.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/unins.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/unnum.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0102"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/core/undo/unspnd.ts",
            "state": "active",
            "subsystem": "undo-redo",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0113"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/filter/ascii/ascatr.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "serializeWriterClipboardPlainText"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "serializeWriterClipboardHtml"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0130"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "createInlineOdtFilterService",
              "normalizeOdtFilterError"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0130"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "createBrowserOdtFilterService"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0130"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0130"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0128"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "readOdtDocument"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0129"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "writeOdtDocument"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0129"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "exportContentXml",
              "exportMetaXml",
              "exportStylesXml"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0128"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "writer",
            "exportedOperations": [
              "importWriterXml",
              "parseOdfXml"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0114",
              "CAP-0121",
              "CAP-0130",
              "CAP-0131",
              "CAP-0132"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
            "state": "active",
            "subsystem": "document-shell",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0122",
              "CAP-0133"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/app/swmodule.tsx",
            "state": "active",
            "subsystem": "application-services",
            "suite": "writer",
            "exportedOperations": [
              "createWriterBrowserSessionServices",
              "createWriterDocumentSession",
              "createWriterModuleFactory"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0106",
              "CAP-0108",
              "CAP-0110",
              "CAP-0120"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
            "state": "active",
            "subsystem": "clipboard-transfer",
            "suite": "writer",
            "exportedOperations": [
              "createWriterClipboardSelection",
              "parseWriterClipboardPaste",
              "readWriterClipboardPaste"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0111",
              "CAP-0117",
              "CAP-0118",
              "CAP-0119",
              "CAP-0134"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
            "state": "active",
            "subsystem": "editing-view",
            "suite": "writer",
            "exportedOperations": [
              "WriterEditableParagraph"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0103",
              "CAP-0111",
              "CAP-0117",
              "CAP-0118",
              "CAP-0119",
              "CAP-0120",
              "CAP-0134"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/uibase/docvw/edtwin.tsx",
            "state": "active",
            "subsystem": "editing-view",
            "suite": "writer",
            "exportedOperations": [
              "WriterPlainTextEditor"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0107",
              "CAP-0127"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/shells/listsh.ts",
            "state": "active",
            "subsystem": "numbering",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0102",
              "CAP-0103",
              "CAP-0104",
              "CAP-0105",
              "CAP-0106",
              "CAP-0107",
              "CAP-0109",
              "CAP-0110",
              "CAP-0112",
              "CAP-0113",
              "CAP-0114",
              "CAP-0115"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/shells/writercommands.ts",
            "state": "active",
            "subsystem": "command-shell",
            "suite": "writer",
            "exportedOperations": [
              "createWriterTextCommandRegistry",
              "createWriterViewCommandRegistry"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0102",
              "CAP-0103",
              "CAP-0104",
              "CAP-0105",
              "CAP-0106",
              "CAP-0107",
              "CAP-0109",
              "CAP-0110",
              "CAP-0112",
              "CAP-0113",
              "CAP-0114",
              "CAP-0120",
              "CAP-0121",
              "CAP-0122",
              "CAP-0131",
              "CAP-0133"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
            "state": "active",
            "subsystem": "workbench-session",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0102",
              "CAP-0103",
              "CAP-0104",
              "CAP-0105",
              "CAP-0107",
              "CAP-0109",
              "CAP-0110",
              "CAP-0113",
              "CAP-0114",
              "CAP-0115",
              "CAP-0120",
              "CAP-0121",
              "CAP-0122"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/sw/source/uibase/uiview/view.tsx",
            "state": "active",
            "subsystem": "workbench-session",
            "suite": "writer",
            "exportedOperations": [
              "WriterWorkbench"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/uiview/viewfunc.ts",
            "state": "active",
            "subsystem": "workbench-session",
            "suite": "writer",
            "exportedOperations": [
              "createWriterWorkbenchDocument",
              "getActiveWriterParagraph",
              "getNextWriterParagraphId"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0102",
              "CAP-0105",
              "CAP-0107",
              "CAP-0132"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/wrtsh/delete.ts",
            "state": "active",
            "subsystem": "writer-shell",
            "suite": "writer",
            "exportedOperations": [
              "getWriterDeleteGrouping",
              "getWriterInsertGroup",
              "getWriterTypingCharacterClass"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0102",
              "CAP-0105",
              "CAP-0134"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts",
            "state": "active",
            "subsystem": "writer-shell",
            "suite": "writer",
            "exportedOperations": [
              "areWriterCursorSelectionsEqual",
              "isWriterCursorOffset"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0102",
              "CAP-0105",
              "CAP-0107",
              "CAP-0109",
              "CAP-0110",
              "CAP-0112",
              "CAP-0119",
              "CAP-0123",
              "CAP-0124",
              "CAP-0132",
              "CAP-0134"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
            "state": "active",
            "subsystem": "writer-shell",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0115"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
            "state": "active",
            "subsystem": "writer-ui",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0107"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/uiconfig/swriter/toolbar/numobjectbar.ts",
            "state": "active",
            "subsystem": "numbering",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0115"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/uiconfig/swriter/toolbar/standardbar.ts",
            "state": "active",
            "subsystem": "writer-ui",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0105"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/sw/uiconfig/swriter/toolbar/textobjectbar.ts",
            "state": "active",
            "subsystem": "numbering",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0115"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/sw/uiconfig/swriter/ui-resource.ts",
            "state": "active",
            "subsystem": "writer-ui",
            "suite": "writer",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0106",
              "CAP-0110",
              "CAP-0120"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
            "state": "active",
            "subsystem": "browser-platform",
            "suite": "shared",
            "exportedOperations": [
              "copyPlainText",
              "copyRichText",
              "readRichClipboard"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0101",
              "CAP-0113",
              "CAP-0121"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/vcl/browser/browser-download.ts",
            "state": "active",
            "subsystem": "browser-platform",
            "suite": "shared",
            "exportedOperations": [
              "createBrowserDocumentExportPort",
              "createDownloadFilename",
              "downloadBytes",
              "downloadPlainText"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0121"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/vcl/browser/browser-file.ts",
            "state": "active",
            "subsystem": "browser-platform",
            "suite": "shared",
            "exportedOperations": [
              "createBrowserDocumentOpenPort",
              "readBrowserFile",
              "selectBrowserFile"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0114",
              "CAP-0122",
              "CAP-0131",
              "CAP-0133"
            ],
            "classification": "browser-adaptation",
            "path": "apps/office/src/vcl/browser/indexeddb-storage.ts",
            "state": "active",
            "subsystem": "browser-platform",
            "suite": "shared",
            "exportedOperations": []
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0128"
            ],
            "classification": "local-infrastructure",
            "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": [
              "parseOdfXmlDocument"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0129"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/xmloff/source/text/txtparae.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": [
              "escapeXml",
              "exportCharacterAttributes",
              "exportTextParagraphs"
            ]
          },
          {
            "capabilityIds": [
              "CAP-0113",
              "CAP-0128"
            ],
            "classification": "upstream-mechanism",
            "path": "apps/office/src/xmloff/source/text/txtparai.ts",
            "state": "active",
            "subsystem": "odf-filter",
            "suite": "shared",
            "exportedOperations": [
              "importTextParagraphs"
            ]
          }
        ],
        "placeholderSuiteCount": 6,
        "schemaVersion": 2,
        "uiBehaviorCount": 10
      }
    } — passed: formatting, ESLint, TypeScript, module boundaries (100 runtime sources), 51 Vitest files / 259 tests at 100% coverage, 32 inventory files / 84 tests at 100% coverage, 9 Chromium E2E tests, production/static builds, JSDoc, file-size, source-tree, provenance (100 runtime modules), and parity inventory (34 implemented records, 0 exceptions).
    - doctor (OK) — passed; one pre-existing warning references historical task 202608130934-F1JT8K.
    - policy routing OK — passed.
    -  — passed before the implementation commit.
    - Implementation commit: e754ceabe6e9.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T16:13:01.992Z — VERIFY — ok

    By: TESTER

    Note: Full repository verification passed for Workstream 5.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:12:55.434Z, excerpt_hash=sha256:c3c839f01998ad75cefe7382d41755704a9498fe1e93b3d71cdd2a02c4fc4156

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141518-C5V3TD/blueprint/resolved-snapshot.json
    - old_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
    - current_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141518-C5V3TD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609141518-C5V3TD --close --unstage-others
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and deterministic task-close commit. No storage compatibility migration will be added; if persisted schema changes, rollback restores the prior schema and behavior as a unit."
  Findings: |-
    - Browser editing is isolated into selection, intent, composition, clipboard, and geometry adapters.
    - The projection exposes one root editing host; paragraph nodes are projections only.
    - Normal  operations mutate through SwWrtShell/SwPaM, including cross-paragraph delete, split, paste, and one-shot IME commit. Unsupported native mutations use an observable guarded reconciliation fallback.
    - Delete grouping and selection contracts are decomposed along upstream  and  responsibilities; the local selection filename divergence is recorded because  is a guarded retired path.
    - No persisted document schema changed, so no compatibility mechanism was introduced.
extensions:
  implementation_commit:
    hash: "e754ceabe6e90da8695040211dee1adf1e0a9ba8"
    message: "♻️ C5V3TD code: isolate Writer browser editing"
id_source: "generated"
---
## Summary

Implement Workstream 5 (P5.1-P5.3) from the upstream parity plan: isolate browser editing behavior from React, replace paragraph editing islands with one logical document host, and route normal browser input through explicit Writer operations.

## Scope

In scope: apps/office/src/sw/browser/editor/**; Writer document-view projection under apps/office/src/sw/source/uibase/docvw/**; narrowly required Writer shell/command changes; focused unit, integration, and Playwright tests; provenance/runtime inventory updates required by created or moved modules. Preserve current formatting, list, clipboard, undo, and ODT behavior. Use vendor/libreoffice-reference at the pinned baseline for applicable edit-window, selection, extended-text-input, and Writer shell semantics. No backward compatibility layer is required if persisted document state changes. Out of scope: new Writer features, XML architecture, session lifecycle, and unrelated UI refactors.

## Plan

1. Inspect pinned LibreOffice edit-window, shell, selection, and extended-text-input code and record the bounded browser-applicable invariants. 2. Extract model-neutral browser selection, edit-intent, composition, clipboard-event, and geometry adapters from React rendering. 3. Convert the document projection to one root editing host while retaining paragraph projection nodes and canonical SwPaM authority. 4. Normalize typing, deletion, paragraph breaks, paste, and composition into explicit Writer operations; retain a diagnostic guarded fallback for unknown browser mutations. 5. Add or update unit/integration/E2E tests for cross-paragraph selection/editing, IME boundaries, formatting preservation, fallback observability, and safe rejection. 6. Update provenance/inventory records where module ownership changes, then run the declared verification suite.

## Verify Steps

1. Run targeted Vitest suites for apps/office/src/sw/browser/editor and apps/office/src/sw/source/uibase/docvw. 2. Run targeted Playwright Writer selection, clipboard, cut/paste, character-formatting, and paragraph-editing coverage. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts before completion. Acceptance: React projection contains no document mutation algorithms; browser globals are isolated or injected; normalized intents reach Writer operations; IME commits once; one logical host supports cross-paragraph selection, Select All, copy, deletion, split/merge; ordinary edits and paste do not replace whole paragraphs; direct hints survive; fallback is observable; unknown input fails safely.

## Verification

-
> vite-office@0.1.0 verify
> npm run format:check && npm run lint && npm run typecheck && npm run check:dependencies && npm run test:coverage && npm run test:inventory:coverage && npm run test:e2e && npm run test:static && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity

> vite-office@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> vite-office@0.1.0 lint
> eslint . --max-warnings 0

> vite-office@0.1.0 typecheck
> npm run typecheck:tools && npm run typecheck --workspace @vite-office/office

> vite-office@0.1.0 typecheck:tools
> tsc --project tsconfig.tools.json

> @vite-office/office@0.1.0 typecheck
> tsc --noEmit

> vite-office@0.1.0 check:dependencies
> node scripts/check-module-boundaries.mjs

Module boundary check passed: 100 runtime sources, 311 relative imports, 12 allowed cross-module edges.

> vite-office@0.1.0 test:coverage
> npm run test:coverage --workspace @vite-office/office

> @vite-office/office@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.10 /Users/odubinkin/Projects/vite-office/apps/office
      Coverage enabled with v8

 Test Files  51 passed (51)
      Tests  259 passed (259)
   Start at  23:11:07
   Duration  24.01s (transform 4.93s, setup 17.99s, import 10.16s, tests 26.74s, environment 80.68s)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 4763/4763 )
Branches     : 100% ( 3026/3026 )
Functions    : 100% ( 1273/1273 )
Lines        : 100% ( 4400/4400 )
================================================================================

> vite-office@0.1.0 test:inventory:coverage
> vitest run --config scripts/libreoffice-inventory/vitest.config.ts --coverage

 RUN  v4.1.10 /Users/odubinkin/Projects/vite-office
      Coverage enabled with v8

 Test Files  32 passed (32)
      Tests  84 passed (84)
   Start at  23:11:32
   Duration  60.92s (transform 484ms, setup 0ms, import 976ms, tests 55.39s, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 1233/1233 )
Branches     : 100% ( 794/794 )
Functions    : 100% ( 319/319 )
Lines        : 100% ( 1183/1183 )
================================================================================

> vite-office@0.1.0 test:e2e
> npm run build && playwright test --config apps/office/playwright.config.ts

> vite-office@0.1.0 build
> npm run build --workspace @vite-office/office

> @vite-office/office@0.1.0 build
> tsc --noEmit && vite build

vite v8.2.1 building client environment for production...
[2Ktransforming...✓ 1888 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                       0.56 kB │ gzip:   0.35 kB
dist/assets/odt-worker-gWpw9cD9.js  100.11 kB
dist/assets/index-DpuEHzrZ.css       25.36 kB │ gzip:   5.81 kB
dist/assets/index-CkUrY4lB.js       420.40 kB │ gzip: 121.75 kB

✓ built in 330ms

Running 9 tests using 4 workers

  ✓  3 apps/office/e2e/writer-clipboard.spec.ts:5:1 › copies visible formatted Writer content through the native browser copy event (1.7s)
  ✓  1 apps/office/e2e/writer-cut-paste.spec.ts:5:1 › Writer Cut and Paste (1.8s)
  ✓  2 apps/office/e2e/writer-character-formatting.spec.ts:5:1 › Writer direct character formatting (2.4s)
  ✓  6 apps/office/e2e/writer-cut-paste.spec.ts:55:1 › Writer immediate spaces and structured list Paste (1.4s)
  ✓  5 apps/office/e2e/writer-clipboard.spec.ts:52:1 › Writer list clipboard (1.6s)
  ✓  7 apps/office/e2e/writer-document-selection.spec.ts:5:1 › supports document-wide selection through Ctrl/Cmd+A and pointer dragging (1.6s)
  ✓  8 apps/office/e2e/writer-lists.spec.ts:5:1 › Writer bullets and numbering (1.9s)
  ✓  9 apps/office/e2e/writer-odt-file.spec.ts:14:1 › Writer opens and saves a bounded ODT file (1.7s)
  ✓  4 apps/office/e2e/foundation.spec.ts:8:1 › Writer menu keyboard navigation and accessible application chrome (6.2s)

  9 passed (8.3s)

> vite-office@0.1.0 test:static
> npm run build && node scripts/check-static-build.mjs

> vite-office@0.1.0 build
> npm run build --workspace @vite-office/office

> @vite-office/office@0.1.0 build
> tsc --noEmit && vite build

vite v8.2.1 building client environment for production...
[2Ktransforming...✓ 1888 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                       0.56 kB │ gzip:   0.35 kB
dist/assets/odt-worker-gWpw9cD9.js  100.11 kB
dist/assets/index-DpuEHzrZ.css       25.36 kB │ gzip:   5.81 kB
dist/assets/index-CkUrY4lB.js       420.40 kB │ gzip: 121.75 kB

✓ built in 424ms
Static build smoke passed: relative assets, 2 JavaScript bundle(s), no backend endpoints.

> vite-office@0.1.0 check:docs
> node scripts/check-jsdoc.mjs

JSDoc validation passed for 236 authored source files.

> vite-office@0.1.0 check:file-size
> node scripts/check-file-size.mjs

File-size check scanned 238 authored files.
Decomposition review candidates:
apps/office/src/framework/source/dispatch/dispatchprovider.ts: 571 lines
apps/office/src/framework/source/services/desktop.test.tsx: 642 lines
apps/office/src/sw/source/core/doc/writer-model.test.ts: 599 lines
apps/office/src/sw/source/core/txtnode/ndtxt.ts: 800 lines
apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts: 773 lines
apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts: 509 lines
apps/office/src/sw/source/uibase/shells/writercommands.ts: 513 lines
apps/office/src/sw/source/uibase/uiview/view-session.ts: 584 lines
apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts: 975 lines
apps/office/src/vcl/browser/indexeddb-storage.ts: 628 lines
scripts/check-source-provenance.ts: 680 lines
scripts/libreoffice-inventory/contracts.ts: 536 lines
scripts/libreoffice-inventory/parity-mappings.test.ts: 691 lines
scripts/libreoffice-inventory/parity-mappings.ts: 812 lines
scripts/libreoffice-inventory/runtime-inventory.ts: 537 lines

> vite-office@0.1.0 check:source-tree
> node scripts/check-lo-source-tree.mjs

LibreOffice source-tree check passed for 68 required paths and 20 retired roots.

> vite-office@0.1.0 check:source-provenance
> tsx scripts/check-source-provenance.ts

Source provenance check passed for 100 runtime modules (62 mapped, 23 browser adaptations, 15 local infrastructure).

> vite-office@0.1.0 inventory:parity
> tsx scripts/libreoffice-inventory/parity-mapping-cli.ts --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --runtime-inventory docs/program/parity/runtime-inventory.json --runtime-root apps/office/src --local-root . --upstream-root vendor/libreoffice-reference

{
  "baselineCommit": "9bc445578031fecf56086729d8e4940c77e14d65",
  "exceptionCount": 0,
  "exceptions": [],
  "gapCount": 68,
  "implementedCount": 34,
  "recordCount": 34,
  "resolvedEvidence": [
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-ui-shell.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/undo/undo.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/undo/unins.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/undo/undel.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/undo/unattr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/undo/undo.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/transaction-history.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "svl/source/undo/undo.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/unins.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/undel.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-clipboard.spec.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-document-selection.spec.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter6.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/select_text.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-ui-shell.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering2.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/05150000.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/list.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/number.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/uiconfig/swriter/toolbar/textobjectbar.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/list.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/number.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-lists.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-paragraph-lists.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/list.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/number.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/shells/txtnum.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter8.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter10.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/uitest/writer_tests2/formatBulletsNumbering.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/02/02110000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/02/06040000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/guide/using_numbered_lists.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/ascii/ascatr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/ascii/ascatr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-clipboard.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-paragraph-lists.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/html/htmlnumwriter.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/ascii/ascatr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter9.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/filter/html/html.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/htmlimport/htmlimport.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/01/02050000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/02/02110000.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/shells/listsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/undo/unnum.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/uiconfig/swriter/toolbar/numobjectbar.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/list.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-lists.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-paragraph-lists.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/shells/listsh.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/sdi/swriter.sdi",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/numobjectbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/uitest/writer_tests2/formatBulletsNumbering.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/02/06050000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/02/06060000.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/ascii/ascatr.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/ascii/ascatr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-clipboard.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-paragraph-lists.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/html/htmlnumwriter.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/ascii/ascatr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/htmlexport/htmlexport2.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/htmlimport/htmlimport.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/01/02050000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/02/02110000.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/editor/writer-selection.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-character-formatting.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-character-formatting.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/shells/txtattr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/ndtxt.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/uitest/writer_tests2/formatCharacter.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/04/01020000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/guide/shortcut_writing.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-clipboard.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-cut-paste.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/DocumentContentOperationsManager.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter8.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/uitest/writer_tests2/tdf133299.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/01/02040000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/01/02060000.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/crsr/pam.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/docnew.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/nodes.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/ndtxt.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/crsr/pam.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/txatbase.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/uwriter.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/txtnode/txtnode.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/items/itemset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/editeng/source/items/textitem.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/format.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/node.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/para/paratr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/items/itemset.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/editeng/source/items/textitem.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itemset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itempool.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "editeng/source/items/textitem.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/swatrset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/format.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/fmtcol.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/node.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/para/paratr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/attr/attr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/doc/number.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/CRC32.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparae.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparai.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/framework/source/services/worker-protocol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-file.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-download.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-file.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-odt-file.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-odt-format.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/worker-cancellation-protocol.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/CRC32.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipFile.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipOutputStream.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/manifest/ManifestExport.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparae.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparai.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sax/source/fastparser/fastparser.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/wrtxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docsh.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docshini.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sfx2/source/doc/objsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/misc/recovery.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/misc/recovery.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/document-lifecycle.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/autosave-recovery.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/transaction-history.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objmisc.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objstor.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/sfxbasemodel.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/docundo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/undo/undo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/python/check_xmodifiable2.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/util/XModifiable.idl",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-ui-shell.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-ui-shell.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/04060100.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-clipboard.spec.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-document-selection.spec.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter6.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/select_text.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-clipboard.spec.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-document-selection.spec.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/foundation.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter6.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/01/select_text.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/browser/editor/writer-selection.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-character-formatting.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-character-formatting.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/shells/txtattr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/ndtxt.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/tiledrendering/tiledrendering.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/uitest/writer_tests2/formatCharacter.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/04/01020000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/swriter/guide/shortcut_writing.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-clipboard.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-cut-paste.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-clipboard.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-command-placement.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/dochdl/swdtflvr.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/DocumentContentOperationsManager.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/menubar/menubar.xml",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/uiconfig/swriter/toolbar/standardbar.xml",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/uiwriter/uiwriter8.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/uitest/writer_tests2/tdf133299.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/01/02040000.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/01/02060000.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/CRC32.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparae.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparai.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/framework/source/services/worker-protocol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-file.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-download.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-file.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-odt-file.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-odt-format.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/worker-cancellation-protocol.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/CRC32.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipFile.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipOutputStream.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/manifest/ManifestExport.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparae.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparai.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sax/source/fastparser/fastparser.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/wrtxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docsh.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docshini.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sfx2/source/doc/objsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/misc/recovery.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/misc/recovery.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/document-lifecycle.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/autosave-recovery.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/transaction-history.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objmisc.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objstor.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/sfxbasemodel.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/docundo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/undo/undo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/python/check_xmodifiable2.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/util/XModifiable.idl",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/crsr/pam.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/docnew.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/nodes.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/ndtxt.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/crsr/pam.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/txatbase.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/uwriter.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/txtnode/txtnode.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/crsr/pam.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/docnew.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/nodes.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/ndtxt.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/crsr/pam.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/txatbase.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/uwriter.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/txtnode/txtnode.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/items/itemset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/editeng/source/items/textitem.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/format.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/node.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/para/paratr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/items/itemset.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/editeng/source/items/textitem.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itemset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itempool.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "editeng/source/items/textitem.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/swatrset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/format.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/fmtcol.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/node.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/para/paratr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/attr/attr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/doc/number.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/items/itemset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/editeng/source/items/textitem.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/format.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/node.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/para/paratr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/items/itemset.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/editeng/source/items/textitem.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itemset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itempool.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "editeng/source/items/textitem.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/swatrset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/format.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/fmtcol.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/node.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/para/paratr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/attr/attr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/doc/number.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/items/itemset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/editeng/source/items/textitem.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/attr/format.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/node.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/para/paratr.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/items/itemset.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/editeng/source/items/textitem.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-attributes.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itemset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "svl/source/items/itempool.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "editeng/source/items/textitem.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/swatrset.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/attr/format.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/fmtcol.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/node.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/para/paratr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/attr/attr.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/doc/number.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/CRC32.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparae.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparai.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/framework/source/services/worker-protocol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-file.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-download.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-file.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-odt-file.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-odt-format.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/worker-cancellation-protocol.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/CRC32.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipFile.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipOutputStream.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/manifest/ManifestExport.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparae.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparai.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sax/source/fastparser/fastparser.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/wrtxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docsh.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docshini.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/CRC32.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparae.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparai.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/framework/source/services/worker-protocol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-file.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-download.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-file.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-odt-file.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-odt-format.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/worker-cancellation-protocol.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/CRC32.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipFile.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipOutputStream.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/manifest/ManifestExport.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparae.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparai.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sax/source/fastparser/fastparser.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/wrtxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docsh.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docshini.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/CRC32.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparae.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/xmloff/source/text/txtparai.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/framework/source/services/worker-protocol.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-file.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/vcl/browser/browser-download.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/CRC32.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/zipapi/ZipFile.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/package/source/manifest/ManifestExport.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/text/txtpara.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/xmloff/source/core/xml-parser.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/uibase/app/docsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/vcl/browser/browser-file.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/framework/source/services/desktop.test.tsx",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/e2e/writer-odt-file.spec.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-odt-format.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/worker-cancellation-protocol.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/CRC32.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipFile.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/zipapi/ZipOutputStream.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "package/source/manifest/ManifestExport.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparae.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "xmloff/source/text/txtparai.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sax/source/fastparser/fastparser.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/wrtxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/filter/xml/swxml.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docsh.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/uibase/app/docshini.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/extras/odfimport/odffeatures.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/00/00000021.xhp",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "helpcontent2/source/text/shared/guide/convertfilters.xhp",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sfx2/source/doc/objsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/misc/recovery.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/misc/recovery.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/document-lifecycle.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/autosave-recovery.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/transaction-history.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objmisc.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objstor.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/sfxbasemodel.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/docundo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/undo/undo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/python/check_xmodifiable2.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/util/XModifiable.idl",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sfx2/source/doc/objsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/misc/recovery.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/misc/recovery.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/document-lifecycle.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/autosave-recovery.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/transaction-history.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objmisc.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objstor.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/sfxbasemodel.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/docundo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/undo/undo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/python/check_xmodifiable2.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/util/XModifiable.idl",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sfx2/source/doc/objsh.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/svl/source/misc/recovery.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sfx2/source/doc/objsh.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/svl/source/misc/recovery.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-storage.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/undo/undobj.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/document-lifecycle.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/autosave-recovery.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/transaction-history.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objmisc.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/objstor.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sfx2/source/doc/sfxbasemodel.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/undo/docundo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/undo/undo.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/python/check_xmodifiable2.py",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/util/XModifiable.idl",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "offapi/com/sun/star/document/XDocumentRecovery.idl",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/doc/doc.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/crsr/pam.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "tests",
      "path": "apps/office/src/sw/source/core/doc/writer-model.test.ts",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/writer-core-model.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/architecture.md",
      "side": "local"
    },
    {
      "kind": "docs",
      "path": "docs/program/source-tree.md",
      "side": "local"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/doc/docnew.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/docnode/nodes.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/ndtxt.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/crsr/pam.cxx",
      "side": "upstream"
    },
    {
      "kind": "implementation",
      "path": "sw/source/core/txtnode/txatbase.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/uwriter.cxx",
      "side": "upstream"
    },
    {
      "kind": "tests",
      "path": "sw/qa/core/txtnode/txtnode.cxx",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    },
    {
      "kind": "docs",
      "path": "sw/README.md",
      "side": "upstream"
    }
  ],
  "schemaVersion": 3,
  "verifiedCount": 0,
  "runtime": {
    "commandCount": 29,
    "exportedOperationCount": 131,
    "internalOperationCount": 9,
    "modules": [
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/editeng/source/items/paraitem.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/editeng/source/items/textitem.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0101"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/framework/source/accelerators/keymapping.ts",
        "state": "active",
        "subsystem": "accelerators",
        "suite": "shared",
        "exportedOperations": [
          "getBrowserShortcut"
        ]
      },
      {
        "capabilityIds": [],
        "classification": "local-infrastructure",
        "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
        "path": "apps/office/src/framework/source/dispatch/dispatchprovider.ts",
        "state": "active",
        "subsystem": "dispatch",
        "suite": "shared",
        "exportedOperations": [
          "createCommandRegistry",
          "createCommandShell",
          "dispatchCommand",
          "findCommandById",
          "findCommandByShortcut",
          "normalizeCommandShortcut"
        ]
      },
      {
        "capabilityIds": [],
        "classification": "local-infrastructure",
        "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
        "path": "apps/office/src/framework/source/services/SuiteCard.tsx",
        "state": "active",
        "subsystem": "application-services",
        "suite": "shared",
        "exportedOperations": [
          "SuiteCard"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0122",
          "CAP-0133"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/framework/source/services/autorecovery.ts",
        "state": "active",
        "subsystem": "recovery",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [],
        "classification": "local-infrastructure",
        "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
        "path": "apps/office/src/framework/source/services/bootstrap.tsx",
        "state": "active",
        "subsystem": "application-services",
        "suite": "shared",
        "exportedOperations": [
          "mountApplication"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/framework/source/services/desktop.tsx",
        "state": "active",
        "subsystem": "application-services",
        "suite": "shared",
        "exportedOperations": [
          "Desktop"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/framework/source/services/messages.ts",
        "state": "foundation",
        "subsystem": "application-services",
        "suite": "shared",
        "exportedOperations": [
          "interpolateMessage",
          "normalizeLocale",
          "resolveMessage"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/framework/source/services/modulemanager.ts",
        "state": "active",
        "subsystem": "application-services",
        "suite": "shared",
        "exportedOperations": [
          "createOfficeModuleDescriptors"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0113"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/framework/source/services/worker-protocol.ts",
        "state": "active",
        "subsystem": "application-services",
        "suite": "shared",
        "exportedOperations": [
          "cancelWorkerRequest",
          "classifyWorkerResult",
          "createWorkerClientState",
          "issueWorkerRequest"
        ]
      },
      {
        "capabilityIds": [],
        "classification": "local-infrastructure",
        "infrastructureExemption": "This composition or bootstrap module exports no document capability and is retained as explicit local infrastructure.",
        "path": "apps/office/src/main.tsx",
        "state": "active",
        "subsystem": "composition",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0113"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/package/source/manifest/ManifestExport.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": [
          "createOdtManifestXml",
          "validateOdtManifestXml"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/package/source/zipapi/CRC32.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0113"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/package/source/zipapi/ZipFile.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": [
          "assertSafeZipEntryName"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0131"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sfx2/source/doc/docfile.ts",
        "state": "active",
        "subsystem": "document-lifecycle",
        "suite": "shared",
        "exportedOperations": [
          "createSfxMediumDescriptor",
          "loadSnapshot",
          "saveSnapshot",
          "updateSfxMediumOperation"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0132"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sfx2/source/doc/objsh.ts",
        "state": "active",
        "subsystem": "document-lifecycle",
        "suite": "shared",
        "exportedOperations": [
          "closeDocument",
          "createDocument",
          "markDocumentDirty",
          "markDocumentHistoryRestored",
          "markDocumentHistorySavePosition",
          "markDocumentRecoverySaved",
          "markDocumentSaved"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/svl/source/items/itempool.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/svl/source/items/itemset.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/svl/source/items/poolitem.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0122",
          "CAP-0133"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/svl/source/misc/recovery.ts",
        "state": "foundation",
        "subsystem": "recovery",
        "suite": "shared",
        "exportedOperations": [
          "autosaveDocument",
          "recoverDocument"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0131"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/svl/source/misc/storage.ts",
        "state": "active",
        "subsystem": "storage-contract",
        "suite": "shared",
        "exportedOperations": [
          "loadStorageRecord",
          "saveStorageRecord"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/svl/source/notify/broadcast.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/svl/source/notify/listener.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102",
          "CAP-0132"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/svl/source/undo/undo.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102",
          "CAP-0109",
          "CAP-0115"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/accelerators/writer-shortcuts.ts",
        "state": "active",
        "subsystem": "accelerators",
        "suite": "writer",
        "exportedOperations": [
          "useWriterCommandShortcuts"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0106",
          "CAP-0120"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/editor/writer-clipboard-events.ts",
        "state": "active",
        "subsystem": "browser-editor",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0118"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/editor/writer-composition.ts",
        "state": "active",
        "subsystem": "browser-editor",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0117",
          "CAP-0118"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/editor/writer-edit-controller.ts",
        "state": "active",
        "subsystem": "browser-editor",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0117"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/editor/writer-geometry.ts",
        "state": "active",
        "subsystem": "browser-editor",
        "suite": "writer",
        "exportedOperations": [
          "getBrowserWriterCaretFromPoint"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0117",
          "CAP-0118"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/editor/writer-selection.ts",
        "state": "active",
        "subsystem": "browser-editor",
        "suite": "writer",
        "exportedOperations": [
          "getWriterCollapsedCaretOffset",
          "getWriterCollapsedParagraphCaret",
          "getWriterDomSelection",
          "getWriterSameParagraphSelection",
          "restoreWriterCollapsedCaret",
          "restoreWriterDomSelection"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0115"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
        "state": "active",
        "subsystem": "browser-presentation",
        "suite": "writer",
        "exportedOperations": [
          "WriterCommandToolbar"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0105",
          "CAP-0107",
          "CAP-0109",
          "CAP-0112",
          "CAP-0115"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
        "state": "active",
        "subsystem": "browser-presentation",
        "suite": "writer",
        "exportedOperations": [
          "WriterFormattingToolbar"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0115",
          "CAP-0116"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
        "state": "active",
        "subsystem": "browser-presentation",
        "suite": "writer",
        "exportedOperations": [
          "WriterMenuBar"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0105",
          "CAP-0107",
          "CAP-0109",
          "CAP-0112",
          "CAP-0115"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/presentation/WriterPropertiesPanel.tsx",
        "state": "active",
        "subsystem": "browser-presentation",
        "suite": "writer",
        "exportedOperations": [
          "WriterParagraphProperties"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0115"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx",
        "state": "active",
        "subsystem": "browser-presentation",
        "suite": "writer",
        "exportedOperations": [
          "WriterWorkspaceChrome"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0115"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/browser/presentation/command-source.ts",
        "state": "active",
        "subsystem": "browser-presentation",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/inc/calbck.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": [
          "subscribeToSwModify"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/inc/hintids.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/inc/hints.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": [
          "hasSwModelHintKind"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/attr/format.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/attr/swatrset.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/bastyp/contentindex.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/crsr/pam.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0110",
          "CAP-0111",
          "CAP-0124"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/doc/doc.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0112"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/doc/fmtcol.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "writer",
        "exportedOperations": [
          "isWriterParagraphStyle"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0112",
          "CAP-0127"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/doc/list.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "writer",
        "exportedOperations": [
          "createDefaultWriterParagraphList",
          "isWriterParagraphListKind",
          "normalizeWriterParagraphList"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0112",
          "CAP-0127"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/doc/number.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "writer",
        "exportedOperations": [
          "getWriterParagraphListMarker"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0131",
          "CAP-0132"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/sw/source/core/doc/writer-storage.ts",
        "state": "active",
        "subsystem": "document-lifecycle",
        "suite": "writer",
        "exportedOperations": [
          "createWriterSnapshot",
          "loadWriterDocument",
          "restoreWriterSnapshot",
          "saveWriterDocument"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0111",
          "CAP-0123",
          "CAP-0124"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/sw/source/core/doc/writer.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": [
          "createWriterDocument",
          "normalizeWriterParagraphFormatting",
          "serializeWriterDocument"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0111",
          "CAP-0123"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/docnode/node.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111",
          "CAP-0123"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/docnode/nodes.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0112",
          "CAP-0125",
          "CAP-0127"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/para/paratr.ts",
        "state": "active",
        "subsystem": "formatting-model",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0111",
          "CAP-0126"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/txtnode/ndhints.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": [
          "createSwpHintsFromSnapshot"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0111",
          "CAP-0123",
          "CAP-0124",
          "CAP-0126"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": [
          "createWriterTextRuns",
          "getWriterNextGraphemeBoundary",
          "getWriterPreviousGraphemeBoundary",
          "getWriterTextAttributesAtOffset",
          "getWriterTextChange",
          "getWriterTextFromRuns",
          "insertWriterTextRun",
          "isWriterParagraphAlignment",
          "normalizeWriterCharacterAttributes",
          "normalizeWriterTextRuns",
          "splitWriterTextRuns",
          "toggleWriterTextRangeFormat"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0111",
          "CAP-0126"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/txtnode/txatbase.ts",
        "state": "active",
        "subsystem": "document-model",
        "suite": "writer",
        "exportedOperations": [
          "createSwFormatAutoFormat",
          "projectWriterCharacterAttributes",
          "restoreSwFormatAutoFormat"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/unattr.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/undel.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/undobj.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": [
          "CopyTextRangeRuns",
          "CopyUndoRuns",
          "GetRunsPayloadSize",
          "GetUndoRunsLength",
          "GetUndoTextNode",
          "ReplaceUndoRange"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/unfmco.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/unins.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/unnum.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0102"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/core/undo/unspnd.ts",
        "state": "active",
        "subsystem": "undo-redo",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0113"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/filter/ascii/ascatr.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "serializeWriterClipboardPlainText"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "serializeWriterClipboardHtml"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0130"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/filter/xml/odt-filter-service.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "createInlineOdtFilterService",
          "normalizeOdtFilterError"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0130"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/filter/xml/odt-worker-client.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "createBrowserOdtFilterService"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0130"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/filter/xml/odt-worker-runtime.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0130"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/filter/xml/odt-worker.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0128"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/filter/xml/swxml.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "readOdtDocument"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0129"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/filter/xml/wrtxml.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "writeOdtDocument"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0129"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/filter/xml/xmlexp.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "exportContentXml",
          "exportMetaXml",
          "exportStylesXml"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0128"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/filter/xml/xmlimp.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "writer",
        "exportedOperations": [
          "importWriterXml",
          "parseOdfXml"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0114",
          "CAP-0121",
          "CAP-0130",
          "CAP-0131",
          "CAP-0132"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/app/docsh.ts",
        "state": "active",
        "subsystem": "document-shell",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0122",
          "CAP-0133"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/app/swmodule.tsx",
        "state": "active",
        "subsystem": "application-services",
        "suite": "writer",
        "exportedOperations": [
          "createWriterBrowserSessionServices",
          "createWriterDocumentSession",
          "createWriterModuleFactory"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0106",
          "CAP-0108",
          "CAP-0110",
          "CAP-0120"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
        "state": "active",
        "subsystem": "clipboard-transfer",
        "suite": "writer",
        "exportedOperations": [
          "createWriterClipboardSelection",
          "parseWriterClipboardPaste",
          "readWriterClipboardPaste"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0111",
          "CAP-0117",
          "CAP-0118",
          "CAP-0119",
          "CAP-0134"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
        "state": "active",
        "subsystem": "editing-view",
        "suite": "writer",
        "exportedOperations": [
          "WriterEditableParagraph"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0103",
          "CAP-0111",
          "CAP-0117",
          "CAP-0118",
          "CAP-0119",
          "CAP-0120",
          "CAP-0134"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/uibase/docvw/edtwin.tsx",
        "state": "active",
        "subsystem": "editing-view",
        "suite": "writer",
        "exportedOperations": [
          "WriterPlainTextEditor"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0107",
          "CAP-0127"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/shells/listsh.ts",
        "state": "active",
        "subsystem": "numbering",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0102",
          "CAP-0103",
          "CAP-0104",
          "CAP-0105",
          "CAP-0106",
          "CAP-0107",
          "CAP-0109",
          "CAP-0110",
          "CAP-0112",
          "CAP-0113",
          "CAP-0114",
          "CAP-0115"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/shells/writercommands.ts",
        "state": "active",
        "subsystem": "command-shell",
        "suite": "writer",
        "exportedOperations": [
          "createWriterTextCommandRegistry",
          "createWriterViewCommandRegistry"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0102",
          "CAP-0103",
          "CAP-0104",
          "CAP-0105",
          "CAP-0106",
          "CAP-0107",
          "CAP-0109",
          "CAP-0110",
          "CAP-0112",
          "CAP-0113",
          "CAP-0114",
          "CAP-0120",
          "CAP-0121",
          "CAP-0122",
          "CAP-0131",
          "CAP-0133"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/uiview/view-session.ts",
        "state": "active",
        "subsystem": "workbench-session",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0102",
          "CAP-0103",
          "CAP-0104",
          "CAP-0105",
          "CAP-0107",
          "CAP-0109",
          "CAP-0110",
          "CAP-0113",
          "CAP-0114",
          "CAP-0115",
          "CAP-0120",
          "CAP-0121",
          "CAP-0122"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/sw/source/uibase/uiview/view.tsx",
        "state": "active",
        "subsystem": "workbench-session",
        "suite": "writer",
        "exportedOperations": [
          "WriterWorkbench"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/uiview/viewfunc.ts",
        "state": "active",
        "subsystem": "workbench-session",
        "suite": "writer",
        "exportedOperations": [
          "createWriterWorkbenchDocument",
          "getActiveWriterParagraph",
          "getNextWriterParagraphId"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0102",
          "CAP-0105",
          "CAP-0107",
          "CAP-0132"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/wrtsh/delete.ts",
        "state": "active",
        "subsystem": "writer-shell",
        "suite": "writer",
        "exportedOperations": [
          "getWriterDeleteGrouping",
          "getWriterInsertGroup",
          "getWriterTypingCharacterClass"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0102",
          "CAP-0105",
          "CAP-0134"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts",
        "state": "active",
        "subsystem": "writer-shell",
        "suite": "writer",
        "exportedOperations": [
          "areWriterCursorSelectionsEqual",
          "isWriterCursorOffset"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0102",
          "CAP-0105",
          "CAP-0107",
          "CAP-0109",
          "CAP-0110",
          "CAP-0112",
          "CAP-0119",
          "CAP-0123",
          "CAP-0124",
          "CAP-0132",
          "CAP-0134"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
        "state": "active",
        "subsystem": "writer-shell",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0115"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
        "state": "active",
        "subsystem": "writer-ui",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0107"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/uiconfig/swriter/toolbar/numobjectbar.ts",
        "state": "active",
        "subsystem": "numbering",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0115"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/uiconfig/swriter/toolbar/standardbar.ts",
        "state": "active",
        "subsystem": "writer-ui",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0105"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/sw/uiconfig/swriter/toolbar/textobjectbar.ts",
        "state": "active",
        "subsystem": "numbering",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0115"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/sw/uiconfig/swriter/ui-resource.ts",
        "state": "active",
        "subsystem": "writer-ui",
        "suite": "writer",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0106",
          "CAP-0110",
          "CAP-0120"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/vcl/browser/browser-clipboard.ts",
        "state": "active",
        "subsystem": "browser-platform",
        "suite": "shared",
        "exportedOperations": [
          "copyPlainText",
          "copyRichText",
          "readRichClipboard"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0101",
          "CAP-0113",
          "CAP-0121"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/vcl/browser/browser-download.ts",
        "state": "active",
        "subsystem": "browser-platform",
        "suite": "shared",
        "exportedOperations": [
          "createBrowserDocumentExportPort",
          "createDownloadFilename",
          "downloadBytes",
          "downloadPlainText"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0121"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/vcl/browser/browser-file.ts",
        "state": "active",
        "subsystem": "browser-platform",
        "suite": "shared",
        "exportedOperations": [
          "createBrowserDocumentOpenPort",
          "readBrowserFile",
          "selectBrowserFile"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0114",
          "CAP-0122",
          "CAP-0131",
          "CAP-0133"
        ],
        "classification": "browser-adaptation",
        "path": "apps/office/src/vcl/browser/indexeddb-storage.ts",
        "state": "active",
        "subsystem": "browser-platform",
        "suite": "shared",
        "exportedOperations": []
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0128"
        ],
        "classification": "local-infrastructure",
        "path": "apps/office/src/xmloff/source/core/xml-parser.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": [
          "parseOdfXmlDocument"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0129"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/xmloff/source/text/txtparae.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": [
          "escapeXml",
          "exportCharacterAttributes",
          "exportTextParagraphs"
        ]
      },
      {
        "capabilityIds": [
          "CAP-0113",
          "CAP-0128"
        ],
        "classification": "upstream-mechanism",
        "path": "apps/office/src/xmloff/source/text/txtparai.ts",
        "state": "active",
        "subsystem": "odf-filter",
        "suite": "shared",
        "exportedOperations": [
          "importTextParagraphs"
        ]
      }
    ],
    "placeholderSuiteCount": 6,
    "schemaVersion": 2,
    "uiBehaviorCount": 10
  }
} — passed: formatting, ESLint, TypeScript, module boundaries (100 runtime sources), 51 Vitest files / 259 tests at 100% coverage, 32 inventory files / 84 tests at 100% coverage, 9 Chromium E2E tests, production/static builds, JSDoc, file-size, source-tree, provenance (100 runtime modules), and parity inventory (34 implemented records, 0 exceptions).
- doctor (OK) — passed; one pre-existing warning references historical task 202608130934-F1JT8K.
- policy routing OK — passed.
-  — passed before the implementation commit.
- Implementation commit: e754ceabe6e9.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T16:13:01.992Z — VERIFY — ok

By: TESTER

Note: Full repository verification passed for Workstream 5.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:12:55.434Z, excerpt_hash=sha256:c3c839f01998ad75cefe7382d41755704a9498fe1e93b3d71cdd2a02c4fc4156

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141518-C5V3TD/blueprint/resolved-snapshot.json
- old_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
- current_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141518-C5V3TD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609141518-C5V3TD --close --unstage-others
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and deterministic task-close commit. No storage compatibility migration will be added; if persisted schema changes, rollback restores the prior schema and behavior as a unit.

## Findings

- Browser editing is isolated into selection, intent, composition, clipboard, and geometry adapters.
- The projection exposes one root editing host; paragraph nodes are projections only.
- Normal  operations mutate through SwWrtShell/SwPaM, including cross-paragraph delete, split, paste, and one-shot IME commit. Unsupported native mutations use an observable guarded reconciliation fallback.
- Delete grouping and selection contracts are decomposed along upstream  and  responsibilities; the local selection filename divergence is recorded because  is a guarded retired path.
- No persisted document schema changed, so no compatibility mechanism was introduced.
