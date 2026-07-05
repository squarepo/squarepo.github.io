export type File = {
  name: string,
  path: string,
  type: "file",
  content?: string
};

export type Dir = {
  name: string,
  path: string,
  type: "dir",
  children: (File | Dir)[]
}