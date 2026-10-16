/** @fileoverview Original EditTextObjectImpl::GetAllSections payload responsibility over actual paragraphs;split from editobj.cxx without fabricating its unimplemented pool-dependent object constructor. */
import { Section } from "../../inc/section";
import type { ContentInfo } from "./editobj";
/** Original section extraction over the owner's actual maContents vector. Native comparator functors bind to JS predicates;native unsigned border ordering uses an equivalent UInt32 projection for signed32 positions. @param contents - Actual native paragraph values. @param output - Caller-owned result vector. @returns Nothing. */
export function GetAllSections(contents: readonly ContentInfo[], output: Section[]): void {
  const sections: Section[] = [];
  for (let para = 0; para < contents.length; ++para) {
    const content = contents[para] as ContentInfo,
      text = content.GetText(),
      borders = [0, text.getLength()];
    text.dispose();
    for (const attribute of content.GetCharAttribs()) {
      if (attribute.GetItem() === null) continue;
      borders.push(attribute.GetStart() >>> 0, attribute.GetEnd() >>> 0);
    }
    borders.sort(
      /** Original unsigned border ordering. @param a - First border. @param b - Second border. @returns Ordering. */ (
        a,
        b,
      ) => a - b,
    );
    const unique = [...new Set(borders)];
    // Border zero is always inserted;the original second empty-paragraph conjunct is necessarily true.
    if (unique.length === 1) {
      sections.push(new Section(para, 0, 0));
      continue;
    }
    for (let i = 1; i < unique.length; ++i)
      sections.push(new Section(para, (unique[i - 1] as number) | 0, (unique[i] as number) | 0));
  }
  if (sections.length === 0) return;
  let cursor = 0;
  for (let para = 0; para < contents.length; ++para) {
    // Each paragraph produced at least one section;the native not-found assertion is unreachable for the just-built vector.
    while ((sections[cursor] as Section).mnParagraph !== para) ++cursor;
    for (const attribute of (contents[para] as ContentInfo).GetCharAttribs()) {
      const item = attribute.GetItem();
      if (item === null) continue;
      const start = attribute.GetStart(),
        end = attribute.GetEnd();
      let current = cursor;
      while (
        current < sections.length &&
        ((sections[current] as Section).mnParagraph !== para ||
          (sections[current] as Section).mnStart !== start)
      )
        ++current;
      // Original release path returns without swapping caller output when a start has no section. Native debug asserts here.
      if (current === sections.length) return;
      for (
        ;
        current < sections.length &&
        (sections[current] as Section).mnParagraph === para &&
        (sections[current] as Section).mnEnd <= end;
        ++current
      ) {
        const section = sections[current] as Section;
        if (
          !section.maAttributes.some(
            /** Original Which-only duplicate suppression;first attribute wins. @param previous - Stored format. @returns Same Which. */ (
              previous,
            ) => previous.Which() === item.Which(),
          )
        )
          section.maAttributes.push(item);
      }
    }
  }
  output.length = 0;
  for (const section of sections) output.push(section);
}
