export type File = {
  name: string,
  path: string,
  type: "file" | "settings" | "properties",
  content: string,
  hidden?: boolean,
};

export type Folder = {
  name: string,
  path: string,
  type: "dir",
  children: Entry[]
  hidden?: boolean,
  settingsFile?: File,
  propertiesFile?: File
}

export type Page = {
  name: string,
  path: string,
  type: "page",
  children: Entry[]
  hidden?: boolean,
  mainFile: File,
  settingsFile?: File,
  propertiesFile?: File
}

export type Database = {
  name: string,
  path: string,
  type: "database",
  children: Entry[]
  hidden?: boolean,
  mainFile: File,
  settingsFile?: File,
  propertiesFile?: File
}

export type Dir = Folder | Page | Database;

export type Entry = File | Dir;
