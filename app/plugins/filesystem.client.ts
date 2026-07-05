import LightningFS from '@isomorphic-git/lightning-fs';

export default defineNuxtPlugin({
  name: "filesystem",
  setup() {
    const filesystem = new LightningFS("squarepo");
    return {
      provide: {
        filesystem: filesystem.promises
      }
    }
  }
});