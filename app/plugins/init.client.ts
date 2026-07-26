export default defineNuxtPlugin({
  name: "init-filesystem",
  dependsOn: ["filesystem"],
  async setup() {
    const entryStore = useEntryStore();
    entryStore.loadRoot();
    entryStore.startRouteSync();

    const settingsStore = useSettingsStore();
    settingsStore.loadRootSettings();
  }
});