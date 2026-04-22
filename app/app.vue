<script setup lang="ts">
import { DATABASE_FILE } from './domain/entry/database';
import { SETTINGS_FILE } from './domain/entry/settings';


const fsStore = useFsStore();
useHead({
  title: () => fsStore.currentEntry && fsStore.currentEntry.path !== "/" ? fsStore.currentEntry.name : "Squarepo"
});

const view = ref<"fs" | "appFs">('appFs');

</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">
    
    <OffcanvasComponent :fs="view" :dir="fsStore.root"></OffcanvasComponent>

    <Navbar v-model:view="view"></Navbar>

    <template v-if="fsStore.currentEntry?.type === 'file'">
      <template v-if="view === 'appFs'">
        <template v-if="fsStore.currentEntry.name === SETTINGS_FILE">
          <!-- <SettingsComponent :settings="new Settings(fsStore, fsStore.currentEntry)"></SettingsComponent> -->
        </template>
        <template v-if="fsStore.currentEntry.name === DATABASE_FILE">
          <TitleEditor :file="fsStore.currentEntry"></TitleEditor>
          <Kanban></Kanban>
        </template>
        <template v-else>
          <FileComponent :file="fsStore.currentEntry"></FileComponent>
        </template>
      </template>
      <template v-else>
        <FileComponent :file="fsStore.currentEntry"></FileComponent>
      </template>
    </template>

    <template v-else-if="fsStore.currentEntry?.type === 'dir'">
      <div class="w-100 h-100 overflow-auto d-flex flex-column">
        <div class="container my-3 w-100 h-100 d-flex flex-column">
          <DirList :dir="fsStore.currentEntry"></DirList>
        </div>
      </div>
    </template>

    <template v-else>
      Squarepo...
    </template>
    
  </div>
</template>

<style>
html, body, #__nuxt {
  width: 100dvw;
  height: 100dvh;
}
#__nuxt {
  overflow: hidden;
}
.bi, .bi::before {
  display: block;
}
</style>