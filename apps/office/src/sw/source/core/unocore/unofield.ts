/** @fileoverview Writer's native annotation field reattachment to a text range. */
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwPostItFieldType } from "../fields/docufld";
import type { SwDoc } from "../doc/doc";
import type { SwTextField } from "../../../inc/txtfld";
import type { SwXTextCursor } from "./unoobj";

/** Finds the attached annotation field matching the source unique-ID query. @param document - Owning document. @param name - Source annotation identity. @returns Matching point field. */
export function GetAnnotationByUniqueID(document: SwDoc, name: string): SwTextField | undefined {
  return SwPostItFieldType.Get(document)
    .GatherFields()
    .find(
      /** Finds the first attached field by its native name. @param format - Attached native field format. @returns Whether the annotation matches. */
      (format) => format.GetField().GetName() === name,
    )
    ?.GetTextField();
}

/** Reattaches an existing annotation to the ending cursor as in SwXTextField::attachToRange. @param cursor - End of the source annotation. @param source - Existing provisional or ranged field. @returns Nothing. */
export function AttachAnnotationToRange(cursor: SwXTextCursor, source: SwTextField): void {
  const position = cursor.GetPaM().GetPoint();
  const node = position.GetNode().GetTextNode();
  const oldNode = source.GetTextNode();
  if (!node || !oldNode) return;
  const field = source.GetAttr().GetField();
  const access = cursor.GetDoc().GetIDocumentMarkAccess();
  const oldMark = access.FindAnnotationMark(field.GetName());
  const anchor = oldMark?.GetMarkStart();
  const startNode = anchor?.GetNode().GetTextNode() ?? oldNode;
  const start = new SwPosition(
    startNode,
    anchor?.GetContentIndex() ?? source.GetStart(),
    "cursor",
    "before",
  );
  try {
    const sameText = cursor.getText().GetTextNodes().includes(startNode);
    const moved = source.Copy(position.GetContentIndex());
    if (!node.InsertHint(moved)) return;
    if (oldMark) access.DeleteAnnotationMark(oldMark);
    oldNode.EraseText(source.GetStart(), 1);
    position.Assign(node, moved.GetStart() + 1);
    const fieldStart = new SwPosition(node, moved.GetStart());
    try {
      if (!sameText || start.compare(fieldStart) >= 0) return;
      const range = new SwPaM(position, start);
      try {
        access.MakeAnnotationMark(range, field.GetName());
      } finally {
        range.Dispose();
      }
    } finally {
      fieldStart.Dispose();
    }
  } finally {
    start.Dispose();
  }
}
