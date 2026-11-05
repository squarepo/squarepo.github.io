import LightningFS from '@isomorphic-git/lightning-fs';
import { FilesystemService } from '~/services/filesystem';
import { GitService } from '~/services/git';
import { SettingsService } from '~/services/settings';

export default defineNuxtPlugin({
  name: "services",
  setup() {
    const fs = new LightningFS("filesystem");
    return {
      provide: {
        filesystemService: new FilesystemService(fs.promises),
        gitService: new GitService(fs.promises),
        settingsService: new SettingsService(fs.promises),
      }
    }
  }
});