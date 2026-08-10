# LibreOffice Reference Baseline

## Status

Vite Office uses the official LibreOffice GitHub mirror at one immutable
release identity for research and parity inventory work. The selected baseline
is `libreoffice-26.8.0.2`, peeled to commit
`9bc445578031fecf56086729d8e4940c77e14d65`.

Pinning the reference does not mean that its source, tests, fixtures, or
documentation have been inventoried, mapped, implemented, or covered locally.
All parity rows remain `inventory-pending` until later tasks produce that
evidence. The machine-readable source of this identity is
[`libreoffice-baseline.json`](libreoffice-baseline.json).

## Immutable identity

| Field | Pinned value |
| --- | --- |
| Official mirror | `https://github.com/LibreOffice/core.git` |
| Release tag | `libreoffice-26.8.0.2` |
| Annotated tag object | `eb55fbaf423db60b82b7fc8613c290b4849b6ba8` |
| Peeled commit | `9bc445578031fecf56086729d8e4940c77e14d65` |
| Commit timestamp | `2026-07-31T21:00:31Z` |
| Tagger timestamp | `2026-07-31T21:00:42Z` |
| Acquisition date | `2026-08-10` |
| Local research path | `vendor/libreoffice-reference/` |
| Checkout form | Depth-one, single-tag, detached, shallow checkout; no submodules |

The acquisition produced 149,172 upstream tracked files and occupied about
1.8 GiB on the acquisition filesystem. These are observations for capacity
planning, not invariants: Git and filesystem versions may report a different
disk footprint while preserving the same content identity.

## Reproduce the checkout

The target path is ignored by the root `.gitignore`. From the Vite Office
repository root, when the target does not already exist, run:

```bash
mkdir -p vendor
git clone \
  --depth 1 \
  --branch libreoffice-26.8.0.2 \
  --single-branch \
  https://github.com/LibreOffice/core.git \
  vendor/libreoffice-reference
```

LibreOffice uses an annotated tag, so Git may report that the tag object itself
is not a commit before checking out its peeled commit in detached-HEAD state.
Verify every identity field instead of treating that message as a failure:

```bash
test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = \
  "9bc445578031fecf56086729d8e4940c77e14d65"
test "$(git -C vendor/libreoffice-reference describe --tags --exact-match)" = \
  "libreoffice-26.8.0.2"
test "$(git -C vendor/libreoffice-reference rev-parse refs/tags/libreoffice-26.8.0.2)" = \
  "eb55fbaf423db60b82b7fc8613c290b4849b6ba8"
test "$(git -C vendor/libreoffice-reference rev-parse refs/tags/libreoffice-26.8.0.2^{})" = \
  "9bc445578031fecf56086729d8e4940c77e14d65"
test "$(git -C vendor/libreoffice-reference remote get-url origin)" = \
  "https://github.com/LibreOffice/core.git"
test "$(git -C vendor/libreoffice-reference rev-parse --is-shallow-repository)" = true
test -z "$(git -C vendor/libreoffice-reference status --short)"
git check-ignore -q vendor/libreoffice-reference/
test -z "$(git ls-files vendor/libreoffice-reference)"
```

Do not use `git pull` to move this checkout. A different tag or commit is a
program baseline upgrade: it requires its own approved task, regenerated
inventories, parity-delta review, and documentation update.

## Licensing and provenance boundary

The upstream [`README.md`](https://github.com/LibreOffice/core/blob/libreoffice-26.8.0.2/README.md)
describes LibreOffice as based on copyleft licenses. The pinned root contains
the following license evidence:

- [`COPYING`](https://github.com/LibreOffice/core/blob/libreoffice-26.8.0.2/COPYING):
  GNU General Public License version 3 text;
- [`COPYING.LGPL`](https://github.com/LibreOffice/core/blob/libreoffice-26.8.0.2/COPYING.LGPL):
  GNU Lesser General Public License version 3 text;
- [`COPYING.MPL`](https://github.com/LibreOffice/core/blob/libreoffice-26.8.0.2/COPYING.MPL):
  Mozilla Public License version 2.0 text.

Those top-level documents are evidence, not a declaration that every file has
one uniform license. Individual files, bundled third-party components,
documentation, translations, fonts, media, test fixtures, and sample documents
may carry different or additional notices.

The checkout is research-only. Before copying or adapting any upstream material
into a tracked Vite Office path, a separate task must:

1. identify the exact upstream path and blob at the pinned commit;
2. inspect its file header, nearest licensing metadata, authorship, and any
   third-party provenance;
3. record the intended use, applicable license and attribution obligations, and
   the local destination;
4. preserve required notices and obtain approval for the resulting tracked
   artifact; and
5. decline the copy when provenance or redistribution rights remain ambiguous.

Behavior learned through research may be reimplemented from scratch, but the
research source and mapped parity ID must remain traceable. This document is a
project control, not legal advice.

## Inventory handoff

Task 0.4 owns deterministic inventory tooling. That tooling must read
[`libreoffice-baseline.json`](libreoffice-baseline.json), reject a checkout whose
origin/tag/commit differs, and attach the pinned commit to every generated
source, test, fixture, and documentation record. The ignored checkout and its
`.git` directory must never enter generated tracked artifacts.
