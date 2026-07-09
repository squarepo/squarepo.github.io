export default defineNuxtPlugin({
  name: "init-filesystem",
  dependsOn: ["filesystem"],
  async setup() {
    const filesystemStore = useFilesystemStore();
    filesystemStore.loadRoot();
    filesystemStore.startRouteSync();

    const settingsStore = useSettingsStore();
    settingsStore.loadRootSettings();
  }
});