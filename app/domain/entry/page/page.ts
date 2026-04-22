import type { File } from "~/domain/filesystem/fs";

export const PAGE_FILE = "page.md";

export type Page = {
  type: "page",
  name: string,
  path: string,
  file: File
};