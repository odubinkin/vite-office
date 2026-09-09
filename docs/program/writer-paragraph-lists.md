# Browser Writer paragraph lists

The initial list slice implements the pinned Writer commands
`.uno:DefaultBullet`, `.uno:DefaultNumbering`, and `.uno:RemoveBullets` for the
active browser Writer paragraph. The command transition is located in
[`txtnum.ts`](../../apps/office/src/sw/source/uibase/shells/txtnum.ts), mirroring
`sw/source/uibase/shells/txtnum.cxx`; serializable metadata and marker
calculation live in [`list.ts`](../../apps/office/src/sw/source/core/doc/list.ts)
and [`number.ts`](../../apps/office/src/sw/source/core/doc/number.ts), matching
the `sw/source/core/doc/list.cxx` and `number.cxx` ownership boundaries.
Canonical paragraph state follows Writer's split ownership: a `SwNumRuleItem`
stores the rule name with `RES_PARATR_NUMRULE`, list identity and level are
separate items, and `SwDoc` owns the referenced bounded `SwNumRule` with one
`SwNumFormat` for every level. The
`{ kind, level, styleId }` object consumed by browser controls and marker
rendering is derived from those items and the rule table.

The browser places the actions in **Format → Bullets and Numbering** and, for
the two toggles, directly after paragraph alignment in the formatting toolbar.
Markers are visible beside an editable paragraph rather than inside its
`textContent`; accessibility describes its current list type without adding
that description to selected or copied paragraph text. Enter inherits the
source paragraph list state. Merging paragraphs keeps the preceding paragraph's
list state.

The same submenu also implements `.uno:DecrementLevel` (**Demote**) and
`.uno:IncrementLevel` (**Promote**) for the active list paragraph. Their pure
transition lives in [`listsh.ts`](../../apps/office/src/sw/source/uibase/shells/listsh.ts),
matching `sw/source/uibase/shells/listsh.cxx`. Demote raises the bounded nesting
level by one; Promote lowers it by one. The browser allows levels 0 through 9,
preserves text, list kind, paragraph style, and sibling identity, and disables
the commands where they would be no-ops. A list level adds a visible document
indent outside `textContent`, so native editing and Copy continue to contain
only paragraph text.

The ODF filter projects those same canonical values into automatic
`text:list-style` definitions and nested `text:list`/`text:list-item` blocks.
Import restores rule name, list identity, level, and the bullet-or-decimal
format for every supported level. Disjoint portions of one list use ODF
`text:continue-list`, matching LibreOffice's list-block export rather than
flattening markers into paragraph text.

## Deliberate current boundary

This is not full Writer list parity. Range and table-cell selection, complete
numbering semantics, prefixes and suffixes, custom glyphs and numeric formats,
explicit restart values, automatic list detection, outline numbering, RTF
clipboard transfer, Paste, and DOCX import/export remain separately mapped
follow-up capabilities. The bounded semantic nested-HTML and level-indented
plain-text Copy path is documented in
[Browser Writer clipboard](writer-clipboard.md); it is deliberately not a
claim of full list export/import parity.
