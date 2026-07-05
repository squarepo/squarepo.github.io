export type File = {
  name: string,
  path: string,
  type: "file" | "settings" | "properties",
  content: string
  hidden?: boolean,
};

export type Dir = {
  name: string,
  path: string,
  type: "dir" | "page" | "database",
  children: Entry[]
  hidden?: boolean,
}

export type Entry = File | Dir;
