<script setup lang="ts">
  import { FILESYSTEM_ENTRIES } from './constants/filesystem';
  import type { File } from './types/filesystem';
  const filesystemStore = useFilesystemStore();
  const settingsStore = useSettingsStore();
  useHead({
    title: () => filesystemStore.currentEntry && filesystemStore.currentEntry.path !== "/" ? filesystemStore.currentEntry.name : "Squarepo"
  });
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">

    <Header></Header>

    <Navigation></Navigation>

    <template v-if="filesystemStore.currentEntry">

      <template v-if="filesystemStore.raw">
        <div
          v-if="
            filesystemStore.currentEntry.type === 'file' ||
            filesystemStore.currentEntry.type === 'settings' ||
            filesystemStore.currentEntry.type === 'properties'
          "
          class="w-100 h-100 overflow-auto d-flex flex-column"
        >
          <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
            <FileView :file="filesystemStore.currentEntry"></FileView>
          </div>
        </div>
        <div
          v-else-if="
            filesystemStore.currentEntry.type === 'dir' ||
            filesystemStore.currentEntry.type === 'page' ||
            filesystemStore.currentEntry.type === 'database'
          "
          class="w-100 h-100 overflow-auto d-flex flex-column"
        >
          <div class="container my-3 w-100 h-100 d-flex flex-column">
            <DirView></DirView>
          </div>
        </div>
      </template>

      <template v-else>
        <FileSettingsView v-if="filesystemStore.currentEntry.type === 'settings'" :settings="filesystemStore.currentEntry"></FileSettingsView>
        <FilePropertiesView v-else-if="filesystemStore.currentEntry.type === 'properties'" :properties="filesystemStore.currentEntry"></FilePropertiesView>

        <template v-else-if="filesystemStore.currentEntry.type === 'page'">
          <DirPageView v-if="settingsStore.rootSettings.view == 'App'" :entry="filesystemStore.currentEntry"></DirPageView>
          <DirView v-else></DirView>
        </template>
  
        <template v-else>
          <!-- File & Dir -->
          <div v-if="filesystemStore.currentEntry.type === 'file'" class="w-100 h-100 overflow-auto d-flex flex-column">
            <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
              <FileView :file="filesystemStore.currentEntry"></FileView>
            </div>
          </div>
          <div v-else-if="filesystemStore.currentEntry.type === 'dir'" class="w-100 h-100 overflow-auto d-flex flex-column">
            <div class="container my-3 w-100 h-100 d-flex flex-column">
              <DirView></DirView>
            </div>
          </div>
        </template>
      </template>

    </template>

    <template v-else>
      Loading...
    </template>

    <PrimarySidebar></PrimarySidebar>
    <SecondarySidebar></SecondarySidebar>
    
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