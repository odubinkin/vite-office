/** @fileoverview Original Writer compact text-format glyphs shared by office formatting toolbars. */
/** Returns common formatting content without supplying document attribute state. @param commandUrl - Source command. @returns Existing Writer glyph or undefined for icon controls. */
export function getOfficeFormattingButtonContent(commandUrl: string): React.ReactNode {
  if (commandUrl === ".uno:Bold") return "B";
  if (commandUrl === ".uno:Italic") return <span className="font-serif italic">I</span>;
  if (commandUrl === ".uno:Underline") return <span className="underline">U</span>;
  return undefined;
}
