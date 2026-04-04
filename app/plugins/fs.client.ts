import LightningFS from '@isomorphic-git/lightning-fs';

export default defineNuxtPlugin({
  name: "fs",
  setup() {
    const fs = new LightningFS("fs");
    return {
      provide: {
        fs,
        pfs: fs.promises
      }
    }
  }
});