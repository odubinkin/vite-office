# Browser Writer paragraph reordering

The Writer Navigator shows **Move Heading Up** and **Move Heading Down** when a
heading is selected. The commands move the heading and its chapter content,
including nested headings by default. The primary shortcut modifier leaves
subheadings in place. The same toolbar provides **Promote Outline Level** and
**Demote Outline Level**.

The Navigator passes a heading and its outline range to the Writer shell. The
document moves the complete body nodes in that range, including any complete
tables. Undo and Redo retain the original and resulting node coordinates.
The browser tests port the body chapter movement scenarios from the pinned
LibreOffice Navigator tests.

The former browser **Paragraph actions** menu was removed because it did not
map to an implemented Writer command.
