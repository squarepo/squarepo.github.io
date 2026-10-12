import LightningFS from '@isomorphic-git/lightning-fs';
import { SettingsService } from '~/services/settings';

export default defineNuxtPlugin({
  name: "settings-service",
  setup() {
    const fs = new LightningFS("filesystem");
    return {
      provide: {
        settingsService: new SettingsService(fs.promises)
      }
    }
  }
});