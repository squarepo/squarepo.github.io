import * as bootstrap from 'bootstrap';

export default defineNuxtPlugin({
  name: "bootstrap",
  setup() {
    return {
      provide: {
        bootstrap
      }
    }
  }
});