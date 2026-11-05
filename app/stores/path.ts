import { defineStore } from "pinia";

export const usePathStore = defineStore("path", () => {

  const route = useRoute();

  const path = ref(route.fullPath);

  return {
    path
  }
});