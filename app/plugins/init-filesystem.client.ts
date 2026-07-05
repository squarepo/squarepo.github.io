export default defineNuxtPlugin({
  name: "init-filesystem",
  dependsOn: ["filesystem"],
  async setup() {
    const filesystemStore = useFilesystemStore();
    const route = useRoute();
    const pathEntries = await filesystemStore.getPathEntries(filesystemStore.normalizePath(decodeURIComponent(route.path)));
    filesystemStore.root.children = await filesystemStore.readDir("/", true);
    for (const entry of pathEntries) {
      if (entry.type === "dir" && entry.path !== "/") {
        filesystemStore.expandedDirs.add(entry.path);
      }
    }
    watch(
      () => route.fullPath,
      async (fullPath) => {
        await filesystemStore.changeCurrentEntry(fullPath);
      },
      { immediate: true }
    );
  }
});