# liblangtag value parsing components

Derived from liblangtag 0.6.8, Copyright (C) 2011–2015 Akira TAGOH.
The original README offers LGPL 3 or later or MPL 2.0. These derived files use MPL 2.0; see LICENSE (copied verbatim from the pinned LibreOffice COPYING.MPL).

Reference archive SHA256: a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2.
Functional IANA Language Subtag Registry data: 2026-06-14, archive SHA256 e74af13fd11fbcb24a5910d0f50e45d8505d86267bde2bb2d1d45aed966bc3bb, selected by the pinned LibreOffice build. Ordered ranges are expanded by the alphabet carry rule in data/reg2xml.c. Description labels, dates and comments are excluded; parsing fields and original case are retained. Source DB wildcard/empty entries precede registered rows.

The managed scanner and exact-key maps implement parsing values, not C allocation, reference counting, locks, XML DOM or trie storage. This package does not yet implement general tag grammar, CLDR aliases/extensions, canonicalization or the enclosing LanguageTag owner. No complete liblangtag API or parser parity is claimed. Browser/native Unicode locale data does not replace this pinned registry.


CLDR functional keyword and language-alias data are derived from the XML files
bundled in the pinned liblangtag0.6.8 archive. Original file notices:
Copyright © 1991–2015 Unicode, Inc. (individual files include earlier end years).
CLDR data files are interpreted according to the LDML specification
(http://unicode.org/reports/tr35/). For terms of use, see
http://www.unicode.org/copyright.html, as specified by the original data headers
and the liblangtag README. Original ordered key/type and languageAlias attributes
are retained except UI description labels. Transform keys are appended in the
native five-file merge order. No modern host CLDR or Intl alias substitution is used.
