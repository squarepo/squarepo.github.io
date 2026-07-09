export type File = {
  name: string,
  path: string,
  type: "file" | "settings" | "properties",
  content: string,
  hidden?: boolean,
};

export type Dir = {
  name: string,
  path: string,
  type: "dir" | "page" | "database",
  children: Entry[]
  hidden?: boolean,
  mainFile?: File,
  settingsFile?: File,
  propertiesFile?: File,
}

export type Entry = File | Dir;
