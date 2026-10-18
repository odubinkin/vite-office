/** @fileoverview Original plain ZipPackageFolder consistency traversal over actual readonly catalog metadata;native storage/service objects and unordered binary bucket layout are not simulated. */
/** Native folder contents needed by the readonly consistency traversal;no fake stream/service object is supplied. */
export type Folder = Map<
  string,
  { bFolder: true; pFolder: Folder } | { bFolder: false; fromManifest: boolean }
>;

/** Original plain folder traversal retains assignment after recursive folders rather than folding every result with OR. Native unordered iteration is not a binary/hash-layout contract;JS Map supplies ordinary logical catalog traversal. @param folder - Actual metadata hierarchy. @param path - Native folder prefix. @returns Original inconsistency flag. */
export function lookForUnexpectedODF12Streams(folder: Folder, path: string): boolean {
  let unexpected = false;
  for (const [name, entry] of folder) {
    if (entry.bFolder) {
      if (path === "META-INF/") unexpected = true;
      else unexpected = lookForUnexpectedODF12Streams(entry.pFolder, path + name + "/");
    } else if (path === "META-INF/") {
      if (name !== "manifest.xml" && !name.includes("signatures")) unexpected = true;
    } else if (!entry.fromManifest) {
      if (path !== "" || name !== "mimetype") unexpected = true;
    }
  }
  return unexpected;
}
