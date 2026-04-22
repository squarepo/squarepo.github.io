import { defineStore } from "pinia";
import type { File, Dir } from '~/domain/filesystem/fs';
import { Settings, SETTINGS_FILE_NAME } from '~/types/Settings';

export const useSettingsStore = defineStore("settings", {
  state: () => {
    return {
      rootSettings: null as Settings | null
    }
  },
  actions: {
  async getRootSettings() {
    if (this.rootSettings) return this.rootSettings;
    const fsStore = useFsStore();
    const file = await fsStore.getEntry(`/${SETTINGS_FILE_NAME}`) as File;
    this.rootSettings = new Settings(fsStore, file);
    return this.rootSettings;
  }
}
});