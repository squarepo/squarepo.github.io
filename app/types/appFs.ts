export type Page = {
  id: string,
  type: "page",
  name: string,
  path: string,
  createdAt: string,
  updatedAt: string,
  content?: string
};

export type Folder = {
  id: string,
  type: "folder",
  name: string,
  path: string,
  createdAt: string,
  updatedAt: string,
  children: (Page | Folder)[]
}