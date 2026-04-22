import type { Dir, File } from "~/domain/filesystem/fs";
import { SETTINGS_FILE, type Settings } from "./settings";
import { normalizePath } from "~/domain/filesystem/fs.utils";

export async function createSettings(fsStore: ReturnType<typeof useFsStore>, dir: Dir) {
  try {
    const file = await fsStore.fs.getEntry(normalizePath(`${dir.path}/${SETTINGS_FILE}`)) as File;
    return {
      type: "settings",
      dir: dir.path,
      file
    } as Settings;
  } catch {
    return null;
  }
}