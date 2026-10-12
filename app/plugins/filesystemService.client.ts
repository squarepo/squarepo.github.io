import LightningFS from '@isomorphic-git/lightning-fs';
import { FilesystemService } from '~/services/filesystem';

export default defineNuxtPlugin({
  name: "filesystem-service",
  setup() {
    const fs = new LightningFS("filesystem");
    return {
      provide: {
        filesystemService: new FilesystemService(fs.promises)
      }
    }
  }
});