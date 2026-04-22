import type { Dir } from "~/domain/filesystem/fs";
import type { Entry } from "~/types/entry";

import { createPage } from "./page";
import { createFolder } from "./folder/folder.factory";
import { createUnknownEntry } from "./unknown/unknown";

export async function createEntry(
  fs: ReturnType<typeof useFsStore>,
  dir: Dir
): Promise<Entry> {
  const page = await createPage(fs, dir);
  if (page) return page;

  // outros tipos aqui (database, etc)

  // fallback
  return createUnknownEntry(dir, "Não corresponde a nenhum tipo conhecido");
}