<script setup lang="ts">
  import { FILESYSTEM_ENTRIES } from './constants/filesystem';
  import type { File } from './types/filesystem';
  const entryStore = useEntryStore();
  const settingsStore = useSettingsStore();
  useHead({
    title: () => entryStore.currentEntry && entryStore.currentEntry.path !== "/" ? entryStore.currentEntry.name : "Squarepo"
  });
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">

    <Header></Header>

    <Navigation></Navigation>

    <div class="overflow-auto">
      <template v-if="entryStore.currentEntry">
  
        <template v-if="['file', 'settings', 'properties'].includes(entryStore.currentEntry.type)">
          <template v-if="settingsStore.rootSettings.view == 'App'">
            <FileSettingsView v-if="entryStore.currentEntry.type === 'settings'" :settings="entryStore.currentEntry"></FileSettingsView>
            <FileView v-else-if="entryStore.currentEntry.type === 'properties'" :file="entryStore.currentEntry"></FileView>
          </template>
          <div v-else class="w-100 h-100 overflow-auto d-flex flex-column">
            <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
              <FileView :file="entryStore.currentEntry"></FileView>
            </div>
          </div>
        </template>
        
        <template v-else-if="['repository', 'dir', 'page', 'database'].includes(entryStore.currentEntry.type)">
          <template v-if="settingsStore.rootSettings.view == 'App'">
            <DirPageView v-if="entryStore.currentEntry.type == 'page'" :entry="entryStore.currentEntry"></DirPageView>
            <DirDatabaseView v-else-if="entryStore.currentEntry.type == 'database'" :entry="entryStore.currentEntry"></DirDatabaseView>
          </template>
          <div v-else class="w-100 h-100 overflow-auto d-flex flex-column">
            <div class="container my-3 w-100 h-100 d-flex flex-column">
              <DirView></DirView>
            </div>
          </div>
        </template>
  
      </template>
  
      <template v-else>
        Loading...
      </template>
    </div>

    <PrimarySidebar></PrimarySidebar>
    <SecondarySidebar :entry="entryStore.currentEntry"></SecondarySidebar>
    
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