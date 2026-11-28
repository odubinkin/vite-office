/** @fileoverview Chapter field, state and outline anchoring from the pinned Writer core field. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { ChapterFormat } from "../../../../offapi/com/sun/star/text/ChapterFormat";
import type { SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";
import { WRITER_MAX_LIST_LEVEL } from "../doc/list";
import { PreparePageStories } from "../layout/hffrm";
import type { SwRootFrame } from "../layout/newfrm";
import { GetTextNodeExpandedText } from "../txtnode/ndtxt-hints";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Original internal chapter display formats. */
export enum SwChapterFormat {
  Number,
  Title,
  NumberAndTitle,
  NumberNoPrePost,
  NumberNoPrePostAndTitle,
}

const unoFormats = [
  ChapterFormat.NUMBER,
  ChapterFormat.NAME,
  ChapterFormat.NAME_NUMBER,
  ChapterFormat.DIGIT,
  ChapterFormat.NO_PREFIX_SUFFIX,
] as const;

/** Reads the UNO ChapterFormat property for a native field. @param format - Original internal format. @returns Published short constant. */
export function QueryChapterFormat(format: SwChapterFormat): ChapterFormat {
  return unoFormats[format];
}

/** Applies the original UNO ChapterFormat property. @param value - Published short constant. @returns Native chapter format. */
export function PutChapterFormat(value: number): SwChapterFormat {
  const format = unoFormats.findIndex(
    /** Matches the corresponding native format. @param entry - Published constant. @returns Whether matched. */
    (entry) => entry === value,
  );
  return format < 0 ? SwChapterFormat.NumberAndTitle : format;
}

/** Native chapter presentation values for the current formatted text. */
export interface SwChapterFieldState {
  readonly number: string;
  readonly title: string;
  readonly prefix: string;
  readonly suffix: string;
  readonly followedBy: string;
}

const emptyState: SwChapterFieldState = {
  number: "",
  title: "",
  prefix: "",
  suffix: "",
  followedBy: "",
};

/** Applies original space substitution and control-character erasure. @param value - Heading text or numbering separator. @returns Presentable text. */
function removeControlChars(value: string): string {
  let result = "";
  for (const character of value) {
    if (character === "\n" || character === "\t") result += " ";
    else if (character >= " ") result += character;
  }
  return result;
}

/** Document-owned chapter system field and layout field update. */
export class SwChapterFieldType {
  /** Binds the actual Writer document. @param document - Field owner. */
  constructor(private readonly document: SwDoc) {}

  /** Borrows the Writer model. @returns Original document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Refreshes the body fields and page-story fields using actual formatted body anchors. @param layout - Newly formatted Writer root. */
  public UpdateFields(layout: SwRootFrame): void {
    let storyAnchors: ReadonlyMap<number, SwTextNode> | undefined;
    for (const node of this.document.GetNodes().entries()) {
      const text = node.GetTextNode();
      const fields = text?.GetpSwpHints()?.GetChapterFields();
      if (!text || !fields?.length) continue;
      let body = layout.FindPageIndexAt(text, 0) >= 0 ? text : undefined;
      if (!body) {
        storyAnchors ??= this.GetStoryAnchors(layout);
        let section = text.StartOfSectionNode();
        while (!body && section.GetIndex()) {
          body = storyAnchors.get(section.GetIndex());
          section = section.StartOfSectionNode();
        }
      }
      if (body)
        for (const hint of fields) hint.GetAttr().GetField().ChangeExpansion(body, false, layout);
    }
  }

  /** Finds the body positions at the leading and trailing edges of active page stories. @param layout - Formatted Writer root. @returns Body anchors by story start. */
  private GetStoryAnchors(layout: SwRootFrame): ReadonlyMap<number, SwTextNode> {
    const pages = layout.GetFormattedPages();
    const storyAnchors = new Map<number, SwTextNode>();
    for (const [index, page] of pages.entries()) {
      for (const story of PreparePageStories(this.document, page, pages[index - 1])) {
        const frame = story.header ? page.textFrames[0] : page.textFrames.at(-1);
        const body = frame?.GetTextNodeFirst();
        if (!body) continue;
        const position = story.start.GetIndex();
        if (!storyAnchors.has(position)) storyAnchors.set(position, body);
      }
    }
    return storyAnchors;
  }
}

/** Native Chapter field and its current outline-derived presentation. */
export class SwChapterField implements SwField<SwChapterField> {
  /** Creates the original field and optional formatted state. @param type - Native system field type. @param format - Native display format. @param level - Zero-based outline level. @param state - Last expansion. */
  public constructor(
    private readonly type: SwChapterFieldType,
    private readonly format: SwChapterFormat,
    private level = 0,
    private state: SwChapterFieldState = emptyState,
  ) {}

  /** Borrows the document's native Chapter field type. @returns Native type. */
  public GetTyp(): SwChapterFieldType {
    return this.type;
  }

  /** Returns the selection of native chapter content. @returns Native format. */
  public GetFormat(): SwChapterFormat {
    return this.format;
  }

  /** Returns the native zero-based outline level. @returns Outline level. */
  public GetLevel(): number {
    return this.level;
  }

  /** Reads the original plain chapter number. @returns Numeric presentation without prefix or suffix. */
  public GetNumber(): string {
    return this.state.number;
  }

  /** Copies the formatted record through the Worker graph. @returns Independent field state. */
  public GetState(): SwChapterFieldState {
    return { ...this.state };
  }

  /** Updates the original chapter projection relative to a body paragraph. @param node - Actual body anchor. @param searchNumber - Climb to a numbered level for a chapter reference. @param layout - Current layout. */
  public ChangeExpansion(node: SwTextNode, searchNumber: boolean, layout?: SwRootFrame): void {
    this.state = emptyState;
    let heading = node.FindOutlineNodeOfLevel(this.level, layout);
    if (!heading) return;
    if (searchNumber) {
      let candidate: SwTextNode | undefined = heading;
      while (candidate) {
        const previous = this.level;
        this.level = candidate.GetAttrOutlineLevel();
        if (previous < this.level) this.level = previous;
        else if (
          node.GetDoc().GetOutlineNumRule().Get(this.level).GetNumberingType() !==
          SvxNumType.SVX_NUM_NUMBER_NONE
        ) {
          heading = candidate;
          break;
        }
        const level = this.level;
        this.level = (level - 1) & 0xff;
        if (level === 0) break;
        candidate = heading.FindOutlineNodeOfLevel(this.level, layout);
      }
    }
    const title = removeControlChars(GetTextNodeExpandedText(heading, 0, heading.Len()));
    if (!heading.IsOutline()) {
      this.state = { ...emptyState, number: "??", title };
      return;
    }
    const rule = heading.GetNumRule();
    const level = Math.max(0, Math.min(WRITER_MAX_LIST_LEVEL, heading.GetActualListLevel()));
    const format = heading.IsCountedInList() ? rule?.Get(level) : undefined;
    this.state = {
      title,
      number: heading.GetNumString(false),
      prefix: format?.GetPrefix() ?? "",
      suffix: format?.GetSuffix() ?? "",
      followedBy: format && format.GetLabelFollowedBy() !== "nothing" ? " " : "",
    };
  }

  /** Expands the original five display modes. @returns Current presentation. */
  public Expand(): string {
    const { number, title, prefix, suffix, followedBy } = this.state;
    switch (this.format) {
      case SwChapterFormat.Title:
        return title;
      case SwChapterFormat.Number:
        return prefix + number + suffix;
      case SwChapterFormat.NumberAndTitle:
        return prefix + number + suffix + followedBy + title;
      case SwChapterFormat.NumberNoPrePostAndTitle:
        return number + followedBy + title;
      default:
        return number;
    }
  }

  /** Copies the native field and its cache. @returns Detached copy. */
  public Copy(): SwChapterField {
    return this.CopyToDocument(this.type.GetDoc());
  }

  /** Rebinds the copied field to the target's system field type. @param document - Destination model. @returns Detached copy. */
  public CopyToDocument(document: SwDoc): SwChapterField {
    return new SwChapterField(
      document.getIDocumentFieldsAccess().GetChapterFieldType(),
      this.format,
      this.level,
      this.GetState(),
    );
  }

  /** Releases the managed chapter state. */
  public Dispose(): void {}
}
