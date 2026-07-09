import { defineStore } from "pinia";
import { FILESYSTEM_ENTRIES } from "~/constants/filesystem";
import { DEFAULT_SETTINGS } from "~/defaults/settings";
import type { File } from '~/types/filesystem';
import type { Settings } from "~/types/settings";

export const useSettingsStore = defineStore("settings", () => {

  const rootSettings = ref<Settings>(DEFAULT_SETTINGS);

  async function loadRootSettings() {
    const filesystemStore = useFilesystemStore();
    const rootSettingsPath = `/${FILESYSTEM_ENTRIES.SETTINGS}`;
    if (await filesystemStore.exists(rootSettingsPath)) {
      const fileContent = await filesystemStore.readFile(`/${FILESYSTEM_ENTRIES.SETTINGS}`);
      rootSettings.value = JSON.parse(fileContent) as Settings;
    }
  }

  return {
    rootSettings,
    loadRootSettings
  }
});