import type { Dir, File } from "~/domain/filesystem/fs";
import { PAGE_FILE, type Page } from "./page";
import { normalizePath } from "~/domain/filesystem/fs.utils";

export async function createPage(fsStore: ReturnType<typeof useFsStore>, dir: Dir) {
  try {
    const file = await fsStore.fs.getEntry(normalizePath(`${dir.path}/${PAGE_FILE}`)) as File;
    return {
      type: "page",
      name: dir.name,
      path: dir.path,
      file
    } as Page;
  } catch {
    return null;
  }
}