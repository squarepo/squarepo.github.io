export default defineNuxtPlugin({
  name: "init-fs",
  dependsOn: ["fs"],
  async setup() {
    const fsStore = useFsStore();
    const route = useRoute();
    const pathEntries = await fsStore.getPathEntries(fsStore.normalizePath(decodeURIComponent(route.path)));
    fsStore.root.children = await fsStore.readDir("/", true);
    for (const entry of pathEntries) {
      if (entry.type === "dir" && entry.path !== "/") {
        fsStore.expandedDirs.add(entry.path);
      }
    }
    watch(
      () => route.fullPath,
      async (fullPath) => {
        await fsStore.changeCurrentEntry(fullPath);
      },
      { immediate: true }
    );
  }
});