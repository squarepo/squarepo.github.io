export default defineNuxtPlugin({
  name: "init-fs",
  dependsOn: ["fs"],
  async setup() {
    const fsStore = useFsStore();
    fsStore.wd.children = await fsStore.readDir("/");

    const route = useRoute();
    watch(
      () => route.fullPath,
      async (fullPath) => {
        await fsStore.changeCurrentNode(fullPath);
      },
      { immediate: true }
    );
  }
});