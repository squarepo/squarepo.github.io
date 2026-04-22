import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { Page, Folder } from '~/types/appFs';

export const useAppFsStore = defineStore("appFs", {
  state: () => {
    const { $pfs } = useNuxtApp();

    return {
      pfs: $pfs as LightningFS.PromisifiedFS,
      currentAppEntry: null as (Page | Folder) | null,
      expandedDirs: new Set<string>(),
      root: {
        type: "folder",
        name: "/",
        path: "/",
        children: []
      } as Folder
    }
  },

  actions: {
  }
});