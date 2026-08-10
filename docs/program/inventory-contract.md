# LibreOffice Inventory Contract

## Purpose

This contract is the deterministic gate before Vite Office creates atomic
source, test, fixture, help, translation, or dictionary inventory records. It
validates that the local research checkout represents the four-repository
LibreOffice `libreoffice-26.8.0.2` baseline in
[the baseline specification](libreoffice-baseline.md).

Validation proves acquisition integrity only. A successful report does not mean
that upstream source, tests, documentation, functionality, licenses, or parity
have been mapped or completed.

## Command

Run from the repository root:

```bash
npm run --silent inventory:validate -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference
```

The command reads the manifest and Git metadata only. It never changes the
ignored checkout, fetches network data, writes a generated report, copies an
upstream file, or touches browser application code. It prints canonical JSON to
standard output with one trailing newline. Unchanged input produces byte-stable
output: no timestamp, absolute path, host name, or environment-specific value
is emitted.

## Manifest rules

The validator accepts only schema version `2` of
`docs/program/libreoffice-baseline.json`.

| Field | Contract |
| --- | --- |
| Top-level core identity | Non-empty `repository`, `tag`, `tagObject`, `commit`, and `referencePath`; duplicates must agree with the `core` corpus. |
| `corpora` | Exactly one each of `core`, `dictionaries`, `helpcontent2`, and `translations`. |
| Per-corpus identity | Non-empty official repository, reference path, annotated tag object, commit, and positive tracked-file floor. |
| Optional `corpusShape` | Positive category floors; a field is never interpreted as a parity claim. |

Malformed required data yields a structured `BaselineValidationError` with its
corpus ID, field, expected constraint, and actual observation.

## Live rules

Each corpus path must resolve below the caller-selected core reference root;
traversal is rejected before Git runs. Every corpus must have the exact pinned
HEAD commit and annotated tag object, a normalized official origin, shallow
history, and an empty worktree. Its tracked-file count must meet its manifest
floor. Declared `.aff`, `.dic`, `.xhp`, `.po`, and translation locale-directory
floors are also checked.

Current floors are 149,172 core files; 859 dictionary files, 98 AFF files, and
147 DIC files; 13,398 help files and 2,746 XHP topics; and 25,704 translation
files, 25,699 PO catalogs, and 131 locale directories. A lower count is
rejected.

## Report and handoff

A success report has `schemaVersion: 1`, `status: "valid"`, the release tag,
and ID-sorted observations. Each observation carries corpus-relative path,
normalized origin, commit, tag object, shallow and clean booleans, total
tracked-file count, and category counts. Failure emits no partial report; issues
are deterministically sorted by corpus, field, expected value, then actual value.

`npm run test:inventory:coverage` enforces 100% statement, branch, function,
and line coverage for the executable inventory modules. The root `npm run
verify` includes that suite with type checking, linting, JSDoc, size, static
application, browser, and accessibility gates.

Later bounded tasks will separately inventory core modules, test declarations
and fixtures, help topics and media, translation catalogs, and dictionary
packages into stable records carrying corpus ID and pinned commit. Those records
will map to the [parity matrix](parity-matrix.md). This gate does not create
those records or advance their `inventory-pending` status.
