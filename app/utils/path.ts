export function getName(path: string) {
  if (!path) return "";
  const parts = path.split("/").filter(Boolean);
  return parts.pop() || "/";
}

export async function getIncrementalName(path: string, baseName: string) {
  const entryStore = useEntryStore();
  let name: string = baseName;
  let num = 0;
  while (await entryStore.exists(normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

export function getParentPath(path: string) {
  const normalized = normalizePath(path);
  if (normalized === "/") return "/";
  const lastSlash = normalized.lastIndexOf("/");
  return lastSlash <= 0 ? "/" : normalized.substring(0, lastSlash);
}

export function normalizePath(path: string) {
  if (!path) return "/";
  let normalized = path.replace(/\/+/g, "/");
  if (normalized.length > 1) {
    normalized = normalized.replace(/\/$/, "");
  }
  return normalized;
}
