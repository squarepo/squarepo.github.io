export type FileNode = {
  name: string,
  path: string,
  type: "file",
  content?: string
};

export type DirNode = {
  name: string,
  path: string,
  type: "dir",
  children: FsNode[]
}

export type FsNode = FileNode | DirNode;