/** @fileoverview Extracts the native ODF import BuildId from meta:generator. */

/** Implements SvXMLMetaDocumentContext::setBuildId's conversion. @param generator - Original generator text. @returns BuildId, or an empty string when absent. */
export function getBuildIdFromGenerator(generator: string): string {
  let buildId = "";
  const secondProduct = generator.indexOf(" ");
  if (secondProduct !== -1) {
    const slash = generator.indexOf("/", secondProduct);
    if (slash !== -1) {
      const milestone = generator.indexOf("m", slash);
      const prefix = "$Build-";
      const build = milestone === -1 ? -1 : generator.indexOf(prefix, milestone);
      if (build !== -1)
        buildId = `${generator.slice(slash + 1, milestone)}$${generator.slice(build + prefix.length)}`;
    }
  }
  if (buildId === "") {
    if (/^(?:StarOffice [67]|StarSuite [67]|OpenOffice\.org 1)/.test(generator))
      buildId = "645$8687";
    else if (generator.startsWith("NeoOffice/2")) buildId = "680$9134";
  }
  if (generator.includes("LibreOffice_project/")) {
    const version = /^[0-9.]+/.exec(generator.slice(generator.indexOf("/") + 1));
    if (version !== null) buildId += `;${version[0]}`;
  }
  return buildId;
}
