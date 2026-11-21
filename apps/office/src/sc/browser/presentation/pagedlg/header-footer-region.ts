/** @fileoverview DOM selection and paint binding for native header/footer EditEngine regions. */
import { EPaM } from "../../../../editeng/inc/EPaM";
import { ESelection } from "../../../../editeng/inc/ESelection";
import * as EE from "../../../../editeng/inc/eeitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import type { SvxPostureItem } from "../../../../editeng/inc/postitem";
import type { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import type { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import type { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxFieldItem } from "../../../../editeng/inc/flditem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { FontItalic, FontLineStyle, FontWeight } from "../../../../tools/inc/fontenum";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScHeaderEditEngine } from "../../../source/core/tool/editutil";

/** Reads a source item at a public EditEngine cursor, including inherited paragraph defaults. @param engine - Native editor. @param position - Public cursor. @param which - Native identity. @returns Borrowed item. */
export function headerRegionItem(
  engine: ScHeaderEditEngine,
  position: EPaM,
  which: number,
): SfxPoolItem | undefined {
  const node = engine.getImpl().GetEditDoc().GetObject(position.nPara);
  return (
    node?.GetCharAttribs().FindAttrib(which, position.nIndex)?.GetItem() ??
    node?.GetContentAttribs().GetItem(which)
  );
}

/** Repaints the DOM with native runs and atomic field previews; the browser never owns the persisted rich text. @param root - Actual input surface. @param engine - Actual EditEngine. @returns Nothing. */
export function paintHeaderRegion(root: HTMLElement, engine: ScHeaderEditEngine): void {
  const document = root.ownerDocument;
  const content = document.createDocumentFragment();
  const doc = engine.getImpl().GetEditDoc();
  for (let paragraph = 0; paragraph < doc.Count(); paragraph++) {
    const node = doc.GetObject(paragraph);
    if (!node) continue;
    const line = document.createElement("div");
    line.dataset.paragraph = String(paragraph);
    const plain = text(node.GetString());
    line.dataset.length = String(plain.length);
    const attrs = node.GetCharAttribs();
    const points = new Set([0, plain.length]);
    for (const attr of attrs.GetAttribs()) {
      points.add(attr.GetStart());
      points.add(attr.GetEnd());
    }
    const indices = [...points].sort((a, b) => a - b);
    for (let index = 0; index + 1 < indices.length; index++) {
      const start = indices[index] as number,
        end = indices[index + 1] as number;
      const run = document.createElement("span");
      run.dataset.start = String(start);
      run.dataset.end = String(end);
      const nextFeature = attrs.FindFeature(start);
      const feature = nextFeature?.GetStart() === start ? nextFeature.GetItem() : undefined;
      if (feature instanceof SvxFieldItem) {
        run.contentEditable = "false";
        run.dataset.field = "true";
        run.className = "rounded bg-slate-100";
        const displayed = engine.CalcFieldValue(feature);
        try {
          run.textContent = text(displayed) || "\u00a0";
        } finally {
          displayed.dispose();
        }
      } else {
        run.textContent = feature?.Which() === EE.EE_FEATURE_TAB ? "\t" : plain.slice(start, end);
      }
      const get = (which: number) =>
        attrs.FindAttribRightOpen(which, start)?.GetItem() ??
        node.GetContentAttribs().GetItem(which);
      const font = (get(EE.EE_CHAR_FONTINFO) as SvxFontItem).GetFamilyName();
      const size = (get(EE.EE_CHAR_FONTHEIGHT) as SvxFontHeightItem).GetHeight();
      if (font) run.style.fontFamily = font;
      if (size > 0) run.style.fontSize = `${size / 20}pt`;
      if ((get(EE.EE_CHAR_WEIGHT) as SvxWeightItem).GetValue() >= FontWeight.WEIGHT_BOLD)
        run.style.fontWeight = "bold";
      if ((get(EE.EE_CHAR_ITALIC) as SvxPostureItem).GetValue() !== FontItalic.ITALIC_NONE)
        run.style.fontStyle = "italic";
      if (
        (get(EE.EE_CHAR_UNDERLINE) as SvxUnderlineItem).GetValue() !== FontLineStyle.LINESTYLE_NONE
      )
        run.style.textDecoration = "underline";
      const color = (get(EE.EE_CHAR_COLOR) as SvxColorItem).GetValue();
      if (!color.IsFullyTransparent())
        run.style.color = "#" + (color.toUInt32() & 0xffffff).toString(16).padStart(6, "0");
      const position = get(EE.EE_CHAR_ESCAPEMENT) as SvxEscapementItem;
      if (position.GetEsc()) {
        run.style.verticalAlign = position.GetEsc() > 0 ? "super" : "sub";
        run.style.fontSize = `${(size * position.GetProportionalHeight()) / 2000}pt`;
      }
      const kerning = (get(EE.EE_CHAR_KERNING) as SvxKerningItem).GetValue();
      if (kerning) run.style.letterSpacing = `${kerning / 20}pt`;
      line.append(run);
    }
    if (!line.childNodes.length) line.append(document.createElement("br"));
    content.append(line);
  }
  root.replaceChildren(content);
}

/** Maps a DOM anchor onto a public UTF-16 paragraph point, treating fields as one feature. @param root - Editable surface. @param node - DOM point node. @param offset - DOM point offset. @returns Native point. */
function nativePoint(root: HTMLElement, node: Node, offset: number): EPaM {
  if (node === root) {
    const next = root.children.item(offset) as HTMLElement | null;
    const last = root.lastElementChild as HTMLElement | null;
    return next
      ? new EPaM(Number(next.dataset.paragraph), 0)
      : new EPaM(Number(last?.dataset.paragraph ?? 0), Number(last?.dataset.length ?? 0));
  }
  const element = node.nodeType === 1 ? (node as HTMLElement) : node.parentElement;
  const paragraph = element?.closest<HTMLElement>("[data-paragraph]");
  const number = Number(paragraph?.dataset.paragraph ?? 0);
  if (element === paragraph) {
    const next = paragraph?.children.item(offset) as HTMLElement | null;
    return new EPaM(number, Number(next?.dataset.start ?? paragraph?.dataset.length ?? 0));
  }
  const span = element?.closest<HTMLElement>("[data-start]");
  if (!span) return new EPaM(number, 0);
  const start = Number(span.dataset.start),
    end = Number(span.dataset.end);
  const index =
    span.dataset.field || node === span
      ? offset > 0
        ? end
        : start
      : Math.min(end, start + offset);
  return new EPaM(number, index);
}

/** Reads a browser selection contained in a single native edit region. @param root - Region root. @returns Native range or no region selection. */
export function headerRegionSelection(root: HTMLElement): ESelection | undefined {
  const selection = root.ownerDocument.getSelection();
  if (
    !selection?.anchorNode ||
    !selection.focusNode ||
    !root.contains(selection.anchorNode) ||
    !root.contains(selection.focusNode)
  )
    return undefined;
  const start = nativePoint(root, selection.anchorNode, selection.anchorOffset);
  const end = nativePoint(root, selection.focusNode, selection.focusOffset);
  return new ESelection(start.nPara, start.nIndex, end.nPara, end.nIndex);
}

/** Restores a native selection by projecting text and atomic feature boundaries. @param root - Editable surface. @param range - Native editor selection. @returns Nothing. */
export function restoreHeaderRegionSelection(root: HTMLElement, range: ESelection): void {
  const selection = root.ownerDocument.getSelection();
  if (!selection) return;
  /** Projects one source caret to the painted browser insertion position. @param position - Actual source coordinate. @returns DOM point. */
  function point(position: EPaM): readonly [Node, number] {
    const line = root.children.item(position.nPara) as HTMLElement | null;
    if (!line) return [root, root.childNodes.length];
    for (const [index, child] of Array.from(line.children).entries()) {
      const span = child as HTMLElement;
      if (position.nIndex >= Number(span.dataset.end)) continue;
      if (span.dataset.field || !span.firstChild) return [line, index];
      return [span.firstChild, Math.max(0, position.nIndex - Number(span.dataset.start))];
    }
    return [line, line.childNodes.length];
  }
  const [start, from] = point(range.start);
  const [end, to] = point(range.end);
  selection.setBaseAndExtent(start, from, end, to);
}

/** Returns the character range removed by browser Backspace or Delete. @param engine - Native edit engine. @param selection - Browser selection. @param backwards - Delete before the cursor. @returns Deletion range. */
function deleteRange(
  engine: ScHeaderEditEngine,
  selection: ESelection,
  backwards: boolean,
): ESelection {
  if (selection.HasRange()) return selection;
  const doc = engine.getImpl().GetEditDoc();
  const { nPara, nIndex } = selection.start;
  const node = doc.GetObject(nPara);
  if (!node) return selection;
  if (backwards && nIndex === 0 && nPara > 0)
    return new ESelection(nPara - 1, doc.GetObject(nPara - 1)?.Len() ?? 0, nPara, 0);
  if (!backwards && nIndex === node.Len() && nPara + 1 < doc.Count())
    return new ESelection(nPara, nIndex, nPara + 1, 0);
  const boundaries = Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text(node.GetString())),
    (part) => part.index,
  );
  boundaries.push(node.Len());
  const edge = backwards
    ? boundaries.reverse().find((index) => index < nIndex)
    : boundaries.find((index) => index > nIndex);
  return new ESelection(nPara, nIndex, nPara, edge ?? nIndex);
}

/** Maps browser editing and composition events to the native content editor. @param root - Editable surface. @param engine - Source content owner. @param changed - Updated native range. @returns Cleanup function. */
export function bindHeaderRegion(
  root: HTMLElement,
  engine: ScHeaderEditEngine,
  changed: (range: ESelection) => void,
): () => void {
  const listeners = new AbortController();
  let composing: ESelection | undefined;
  const options = { signal: listeners.signal };
  const selection = () => headerRegionSelection(root) ?? new ESelection();
  const replace = (range: ESelection, value: string) => {
    const next = new ESelection(engine.Replace(range, value));
    paintHeaderRegion(root, engine);
    restoreHeaderRegionSelection(root, next);
    changed(next);
  };
  root.addEventListener(
    "beforeinput",
    (event) => {
      if (event.isComposing) return;
      event.preventDefault();
      const range = selection();
      switch (event.inputType) {
        case "insertText":
        case "insertReplacementText":
          if (event.data !== null) replace(range, event.data);
          break;
        case "insertParagraph":
        case "insertLineBreak":
          replace(range, "\n");
          break;
        case "deleteContentBackward":
        case "deleteContentForward":
          replace(deleteRange(engine, range, event.inputType === "deleteContentBackward"), "");
          break;
        case "deleteByCut":
          if (range.HasRange()) replace(range, "");
          break;
      }
    },
    options,
  );
  root.addEventListener(
    "paste",
    (event) => {
      event.preventDefault();
      const value = event.clipboardData?.getData("text/plain");
      if (value !== undefined && value !== "") replace(selection(), value.replace(/\r\n?/g, "\n"));
    },
    options,
  );
  root.addEventListener(
    "compositionstart",
    () => {
      composing = selection();
    },
    options,
  );
  root.addEventListener(
    "compositionend",
    (event) => {
      if (!composing) return;
      const range = composing;
      composing = undefined;
      if (event.data) replace(range, event.data);
      else {
        paintHeaderRegion(root, engine);
        restoreHeaderRegionSelection(root, range);
      }
    },
    options,
  );
  return () => listeners.abort();
}
