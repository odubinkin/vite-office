---
id: "202608100814-2TT1YA"
title: "Acquire pinned LibreOffice help translation and dictionary corpora"
status: "DOING"
priority: "high"
owner: "CURATOR"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "baseline"
  - "docs"
  - "libreoffice"
task_kind: "docs"
mutation_scope: "docs"
risk_flags:
  - "network"
blueprint_request: "docs.change"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "test \"$(git -C vendor/libreoffice-reference/dictionaries rev-parse HEAD)\" = 3324dee0a221a5cb67525c533216d33b0aed08e9"
  - "test \"$(git -C vendor/libreoffice-reference/helpcontent2 rev-parse HEAD)\" = 70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b"
  - "test \"$(git -C vendor/libreoffice-reference/translations rev-parse HEAD)\" = 362fd2cb41c5404e3712db9fad55b2357001e1f3"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T08:15:08.786Z"
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
    author: "CURATOR"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-08-10T08:15:16.608Z"
    author: "CURATOR"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-08-10T08:28:06.053Z"
doc_updated_by: "CURATOR"
description: "Initialize the three release-pinned LibreOffice gitlink corpora at their exact commits inside the ignored reference checkout, record repository and licensing provenance, and extend the reproducible documentation baseline without copying upstream material into tracked paths."
sections:
  Summary: "Materialize the three Git-backed corpora pinned by the approved LibreOffice `libreoffice-26.8.0.2` core tree: dictionaries at `3324dee0a221a5cb67525c533216d33b0aed08e9`, helpcontent2 at `70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b`, and translations at `362fd2cb41c5404e3712db9fad55b2357001e1f3`. Extend the baseline contract so later inventory tooling can prove source, test, help, localization, and dictionary coverage. Acquisition alone advances no parity row."
  Scope: |-
    In scope:
    - Sequential depth-one initialization of the `dictionaries`, `helpcontent2`, and `translations` gitlinks already pinned by the core commit.
    - Exact commit, tag-object, origin, shallow/clean state, local footprint, tracked-file count, and corpus-shape evidence.
    - Root and representative per-file licensing/provenance review without copying upstream material.
    - Updates to `docs/program/libreoffice-baseline.json`, `docs/program/libreoffice-baseline.md`, `docs/program/roadmap.md`, and `docs/program/documentation-strategy.md`.

    Out of scope:
    - Product implementation, parity status changes, inventory generator code, or generated inventory artifacts.
    - Copying or adapting upstream source, help, translation, media, dictionary, sample, or fixture content into tracked Vite Office paths.
    - Full Git history, any non-GitHub source, or any corpus not pinned by the selected core tree.
    - Managed runners.

    Authority and stop rules:
    - The user explicitly approved this plan, GitHub cloning, and standing approval for later in-scope roadmap tasks.
    - Clone one corpus at a time and measure capacity. Stop before the next clone if available space falls below 12 GiB, actual combined footprint exceeds 8 GiB, any remote/tag/gitlink identity differs, a checkout is dirty, or tracked scope expands beyond the four listed documents plus AgentPlane artifacts.
  Plan: |-
    1. Reconfirm clean parent/core repositories, exact core baseline, uninitialized gitlinks, official remote tag objects, and at least 12 GiB free space.
    2. Initialize dictionaries, helpcontent2, and translations sequentially with depth-one history at their core-pinned gitlink commits, checking identity, clean/shallow state, and capacity after each acquisition.
    3. Measure deterministic tree counts and inspect root plus representative licensing/provenance signals for help topics, PO catalogs, and dictionary packages; make no tracked copies.
    4. Extend the baseline JSON/Markdown and related roadmap/documentation strategy with all repository identities, observed corpus counts, reproduction commands, and conservative per-file reuse rules.
    5. Run every Verify Step, inspect the exact diff/status, create a task-scoped implementation commit, record verification, run EVALUATOR quality review, and close through the supported direct lifecycle without a managed runner.
  Verify Steps: |-
    1. `test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = "9bc445578031fecf56086729d8e4940c77e14d65" && test -z "$(git -C vendor/libreoffice-reference status --short)"` — the superproject remains at the approved clean core baseline.
    2. `test "$(git -C vendor/libreoffice-reference/dictionaries rev-parse HEAD)" = "3324dee0a221a5cb67525c533216d33b0aed08e9" && test "$(git -C vendor/libreoffice-reference/helpcontent2 rev-parse HEAD)" = "70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b" && test "$(git -C vendor/libreoffice-reference/translations rev-parse HEAD)" = "362fd2cb41c5404e3712db9fad55b2357001e1f3"` — all gitlinks resolve to their approved commits.
    3. For each submodule, compare normalized `remote get-url origin` with its official `https://github.com/LibreOffice/{dictionaries,help,translations}` URL, require `rev-parse --is-shallow-repository` to be `true`, and require an empty `status --short` — provenance, bounded history, and cleanliness are proven.
    4. Require exact tracked counts of 859 dictionaries files, 13,398 help files including 2,746 XHP topics, and 25,704 translation files including 25,699 PO catalogs across 131 locale directories — the materialized corpus is not silently incomplete.
    5. Parse `docs/program/libreoffice-baseline.json` and require exact core plus three-corpus repository/tag-object/commit/path identities, `inventoryStatus=pending`, and `parityClaim=false` — the machine contract is complete and honest.
    6. `git check-ignore -q vendor/libreoffice-reference/ && test -z "$(git ls-files vendor/libreoffice-reference)"` — every corpus remains outside the parent repository.
    7. Resolve all changed local Markdown links and validate pinned GitHub evidence links; require acquisition counts/SHAs to appear in the baseline/strategy and reject statements claiming completed inventory or parity.
    8. `npm run format:check && node .agentplane/policy/check-routing.mjs && ap doctor` — formatting, routing, and AgentPlane health pass.
    9. `git diff --check && git status --short --untracked-files=all` — no whitespace defects or unintended tracked/untracked artifacts remain; the ignored corpora do not appear in parent status.
  Verification: "Pending implementation. Record exact commands, pass/fail results, concise evidence, covered scope, and relevant links after execution."
  Rollback Plan: "Before closure, deinitialize only the three named submodules and remove only their resolved Git metadata/worktrees if acquisition must be abandoned; never target a broad directory or unrelated checkout. Restore only this task’s four scoped documentation paths. After commits exist, use a traceable revert rather than rewriting history. Every corpus can be reacquired from its documented official repository and core-pinned commit."
  Findings: |-
    Pre-acquisition evidence: GitHub recursive trees report 859 dictionary blobs (~498 MB), 13,398 help blobs (~105 MB), and 25,704 translation blobs (~1.97 GB); 24 GiB is available locally. GitHub full-history repository size for translations is much larger, so depth-one acquisition is mandatory. None of the three repositories exposes a root license file through GitHub metadata; per-file/package provenance review remains mandatory. Installed AgentPlane 0.6.26 lacks the gateway `task advance --agent-json` command and its configured runner is prohibited by the user, so this task uses the previously established supported direct lifecycle manually.

    - Observation: The first inline Node manifest verifier captured the complete core git ls-files output and exceeded Node's default 1 MiB execFileSync buffer; a later zsh helper used the reserved path parameter name, masking PATH; an initial external-link probe included a non-existent dictionaries README that documentation did not reference.
      Impact: These test-harness defects stopped intermediate verification attempts before all checks ran, but did not mutate the checkout, corpus, or tracked documentation.
      Resolution: Use streaming shell counts for large repositories, avoid zsh special parameter names, and derive external URLs from the changed Markdown. The final full verification passed with these corrections.
id_source: "generated"
---
## Summary

Materialize the three Git-backed corpora pinned by the approved LibreOffice `libreoffice-26.8.0.2` core tree: dictionaries at `3324dee0a221a5cb67525c533216d33b0aed08e9`, helpcontent2 at `70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b`, and translations at `362fd2cb41c5404e3712db9fad55b2357001e1f3`. Extend the baseline contract so later inventory tooling can prove source, test, help, localization, and dictionary coverage. Acquisition alone advances no parity row.

## Scope

In scope:
- Sequential depth-one initialization of the `dictionaries`, `helpcontent2`, and `translations` gitlinks already pinned by the core commit.
- Exact commit, tag-object, origin, shallow/clean state, local footprint, tracked-file count, and corpus-shape evidence.
- Root and representative per-file licensing/provenance review without copying upstream material.
- Updates to `docs/program/libreoffice-baseline.json`, `docs/program/libreoffice-baseline.md`, `docs/program/roadmap.md`, and `docs/program/documentation-strategy.md`.

Out of scope:
- Product implementation, parity status changes, inventory generator code, or generated inventory artifacts.
- Copying or adapting upstream source, help, translation, media, dictionary, sample, or fixture content into tracked Vite Office paths.
- Full Git history, any non-GitHub source, or any corpus not pinned by the selected core tree.
- Managed runners.

Authority and stop rules:
- The user explicitly approved this plan, GitHub cloning, and standing approval for later in-scope roadmap tasks.
- Clone one corpus at a time and measure capacity. Stop before the next clone if available space falls below 12 GiB, actual combined footprint exceeds 8 GiB, any remote/tag/gitlink identity differs, a checkout is dirty, or tracked scope expands beyond the four listed documents plus AgentPlane artifacts.

## Plan

1. Reconfirm clean parent/core repositories, exact core baseline, uninitialized gitlinks, official remote tag objects, and at least 12 GiB free space.
2. Initialize dictionaries, helpcontent2, and translations sequentially with depth-one history at their core-pinned gitlink commits, checking identity, clean/shallow state, and capacity after each acquisition.
3. Measure deterministic tree counts and inspect root plus representative licensing/provenance signals for help topics, PO catalogs, and dictionary packages; make no tracked copies.
4. Extend the baseline JSON/Markdown and related roadmap/documentation strategy with all repository identities, observed corpus counts, reproduction commands, and conservative per-file reuse rules.
5. Run every Verify Step, inspect the exact diff/status, create a task-scoped implementation commit, record verification, run EVALUATOR quality review, and close through the supported direct lifecycle without a managed runner.

## Verify Steps

1. `test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = "9bc445578031fecf56086729d8e4940c77e14d65" && test -z "$(git -C vendor/libreoffice-reference status --short)"` — the superproject remains at the approved clean core baseline.
2. `test "$(git -C vendor/libreoffice-reference/dictionaries rev-parse HEAD)" = "3324dee0a221a5cb67525c533216d33b0aed08e9" && test "$(git -C vendor/libreoffice-reference/helpcontent2 rev-parse HEAD)" = "70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b" && test "$(git -C vendor/libreoffice-reference/translations rev-parse HEAD)" = "362fd2cb41c5404e3712db9fad55b2357001e1f3"` — all gitlinks resolve to their approved commits.
3. For each submodule, compare normalized `remote get-url origin` with its official `https://github.com/LibreOffice/{dictionaries,help,translations}` URL, require `rev-parse --is-shallow-repository` to be `true`, and require an empty `status --short` — provenance, bounded history, and cleanliness are proven.
4. Require exact tracked counts of 859 dictionaries files, 13,398 help files including 2,746 XHP topics, and 25,704 translation files including 25,699 PO catalogs across 131 locale directories — the materialized corpus is not silently incomplete.
5. Parse `docs/program/libreoffice-baseline.json` and require exact core plus three-corpus repository/tag-object/commit/path identities, `inventoryStatus=pending`, and `parityClaim=false` — the machine contract is complete and honest.
6. `git check-ignore -q vendor/libreoffice-reference/ && test -z "$(git ls-files vendor/libreoffice-reference)"` — every corpus remains outside the parent repository.
7. Resolve all changed local Markdown links and validate pinned GitHub evidence links; require acquisition counts/SHAs to appear in the baseline/strategy and reject statements claiming completed inventory or parity.
8. `npm run format:check && node .agentplane/policy/check-routing.mjs && ap doctor` — formatting, routing, and AgentPlane health pass.
9. `git diff --check && git status --short --untracked-files=all` — no whitespace defects or unintended tracked/untracked artifacts remain; the ignored corpora do not appear in parent status.

## Verification

Pending implementation. Record exact commands, pass/fail results, concise evidence, covered scope, and relevant links after execution.

## Rollback Plan

Before closure, deinitialize only the three named submodules and remove only their resolved Git metadata/worktrees if acquisition must be abandoned; never target a broad directory or unrelated checkout. Restore only this task’s four scoped documentation paths. After commits exist, use a traceable revert rather than rewriting history. Every corpus can be reacquired from its documented official repository and core-pinned commit.

## Findings

Pre-acquisition evidence: GitHub recursive trees report 859 dictionary blobs (~498 MB), 13,398 help blobs (~105 MB), and 25,704 translation blobs (~1.97 GB); 24 GiB is available locally. GitHub full-history repository size for translations is much larger, so depth-one acquisition is mandatory. None of the three repositories exposes a root license file through GitHub metadata; per-file/package provenance review remains mandatory. Installed AgentPlane 0.6.26 lacks the gateway `task advance --agent-json` command and its configured runner is prohibited by the user, so this task uses the previously established supported direct lifecycle manually.

- Observation: The first inline Node manifest verifier captured the complete core git ls-files output and exceeded Node's default 1 MiB execFileSync buffer; a later zsh helper used the reserved path parameter name, masking PATH; an initial external-link probe included a non-existent dictionaries README that documentation did not reference.
  Impact: These test-harness defects stopped intermediate verification attempts before all checks ran, but did not mutate the checkout, corpus, or tracked documentation.
  Resolution: Use streaming shell counts for large repositories, avoid zsh special parameter names, and derive external URLs from the changed Markdown. The final full verification passed with these corrections.
