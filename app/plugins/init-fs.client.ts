export default defineNuxtPlugin({
  name: "init-fs",
  dependsOn: ["fs"],
  async setup() {
    const fsStore = useFsStore();
    await fsStore.readDir("/");

    const route = useRoute();
    watch(
      () => route.fullPath,
      async (fullPath) => {
        await fsStore.openPath(fullPath);
      },
      { immediate: true }
    )
  }
});