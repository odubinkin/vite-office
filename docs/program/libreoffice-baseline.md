# LibreOffice Reference Baseline

## Status

Vite Office uses the official LibreOffice GitHub repositories at one immutable
release identity for research and parity inventory work. The selected core
baseline is `libreoffice-26.8.0.2`, peeled to commit
`9bc445578031fecf56086729d8e4940c77e14d65`. Its pinned Git links provide the
matching dictionaries, help, and translation corpora.

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
| Checkout form | Depth-one, single-tag, detached, shallow checkout with three shallow submodules |

The complete Git-backed baseline is:

| Corpus | Official repository | Local path | Annotated tag object | Peeled commit | Tracked files |
| --- | --- | --- | --- | --- | ---: |
| Core | `LibreOffice/core` | `vendor/libreoffice-reference/` | `eb55fbaf423db60b82b7fc8613c290b4849b6ba8` | `9bc445578031fecf56086729d8e4940c77e14d65` | 149,172 |
| Dictionaries | `LibreOffice/dictionaries` | `vendor/libreoffice-reference/dictionaries/` | `ea2bb4f3593c33f8dd5105eab5a776cde901307c` | `3324dee0a221a5cb67525c533216d33b0aed08e9` | 859 |
| Help | `LibreOffice/help` | `vendor/libreoffice-reference/helpcontent2/` | `7f6a507dcaf2c370f27448aa60cf4a7a3af64c3e` | `70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b` | 13,398 |
| Translations | `LibreOffice/translations` | `vendor/libreoffice-reference/translations/` | `7ea2fd2a1bcaa110743f748943f0ada82408616f` | `362fd2cb41c5404e3712db9fad55b2357001e1f3` | 25,704 |

The materialized baseline occupies about 4.7 GiB on the acquisition filesystem.
These counts and sizes are acquisition evidence, not inventory completion. Git
and filesystem versions may report a different disk footprint while preserving
the same content identity.

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

for corpus in dictionaries helpcontent2 translations; do
  git -C vendor/libreoffice-reference submodule update \
    --init \
    --depth 1 \
    "$corpus"
done

for corpus in dictionaries helpcontent2 translations; do
  git -C "vendor/libreoffice-reference/$corpus" fetch \
    --depth 1 \
    origin \
    refs/tags/libreoffice-26.8.0.2:refs/tags/libreoffice-26.8.0.2
done
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
test "$(git -C vendor/libreoffice-reference/dictionaries rev-parse HEAD)" = \
  "3324dee0a221a5cb67525c533216d33b0aed08e9"
test "$(git -C vendor/libreoffice-reference/helpcontent2 rev-parse HEAD)" = \
  "70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b"
test "$(git -C vendor/libreoffice-reference/translations rev-parse HEAD)" = \
  "362fd2cb41c5404e3712db9fad55b2357001e1f3"
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

The pinned auxiliary corpora reinforce that boundary:

- the dictionaries repository has no root license file. Its 154
  license-or-README-named candidates are distributed among language packages,
  which may use different terms;
- the help repository root identifies the source for bundled and online
  LibreOffice documentation. Individual XHP headers vary: for example,
  [`access2base.xhp`](https://github.com/LibreOffice/help/blob/libreoffice-26.8.0.2/source/text/sbasic/guide/access2base.xhp)
  offers an MPL/LGPL choice, while
  [`03131300.xhp`](https://github.com/LibreOffice/help/blob/libreoffice-26.8.0.2/source/text/sbasic/shared/03131300.xhp)
  records MPL 2.0 and Apache-derived provenance;
- the translations repository has no root license file. Each PO catalog carries
  locale, translator, generator, and source-reference metadata that must stay
  attached to any later provenance decision.

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
[`libreoffice-baseline.json`](libreoffice-baseline.json), validate all four
repository origin/tag-object/commit identities, and reject silently incomplete
trees. Its acquisition floor is 2,746 XHP help topics, 25,699 PO catalogs across
131 locale directories, and 859 dictionary files. Every generated source, test,
fixture, documentation, or localization record must name its corpus and pinned
commit. The ignored checkout and its `.git` directories must never enter
generated tracked artifacts.
