import type { Dir } from "~/types/fs";

export default defineNuxtPlugin({
  name: "init-fs",
  dependsOn: ["fs"],
  async setup() {
    const fsStore = useFsStore();
    fsStore.root.children = await fsStore.readDir("/", true);

    const route = useRoute();
    watch(
      () => route.fullPath,
      async (fullPath) => {
        await fsStore.changeCurrentEntry(fullPath);
      },
      { immediate: true }
    );
  }
});