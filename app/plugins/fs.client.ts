import LightningFS from '@isomorphic-git/lightning-fs';

export default defineNuxtPlugin(() => {
  const fs = new LightningFS("fs");
  
  return {
    provide: {
      fs,
      pfs: fs.promises
    }
  }
});