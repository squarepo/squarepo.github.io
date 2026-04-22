export type File = {
  type: "file",
  name: string,
  path: string,
  content?: string
};

export type Dir = {
  type: "dir",
  name: string,
  path: string,
  children: (File | Dir)[]
};