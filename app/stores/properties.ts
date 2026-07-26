import { defineStore } from "pinia";
import { FILESYSTEM_ENTRIES } from "~/constants/filesystem";
import { DEFAULT_SETTINGS } from "~/defaults/settings";
import type { File } from '~/types/filesystem';
import type { Settings } from "~/types/settings";

export const usePropertiesStore = defineStore("properties", () => {

  const entryStore = useEntryStore();
  const rootSettings = ref<Settings>(DEFAULT_SETTINGS);
  const rootSettingsPath = `/${FILESYSTEM_ENTRIES.SETTINGS}`;

  async function loadRootSettings() {
    await refresh();
  }

  async function refresh() {
    if (await entryStore.exists(rootSettingsPath)) {
      const fileContent = await entryStore.readFile(rootSettingsPath);
      rootSettings.value = JSON.parse(fileContent) as Settings;
    } else {
      rootSettings.value = DEFAULT_SETTINGS;
    }
  }

  return {
    rootSettings,
    rootSettingsPath,
    loadRootSettings,
    refresh
  }
});