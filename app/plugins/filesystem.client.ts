import LightningFS from '@isomorphic-git/lightning-fs';
import { FilesystemService } from '~/services/filesystem';

export default defineNuxtPlugin({
  name: "filesystem",
  setup() {
    const fs = new LightningFS("filesystem");
    return {
      provide: {
        filesystem: new FilesystemService(fs.promises)
      }
    }
  }
});