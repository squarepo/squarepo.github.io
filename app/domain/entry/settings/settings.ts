import type { File } from "~/domain/filesystem/fs";

export const SETTINGS_FILE = "settings.json";

export type Settings = {
  type: "settings",
  dir: string,
  file: File
};