<script setup lang="ts">
  const filesystemStore = useFilesystemStore();
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
        <div v-if="['file', 'settings', 'properties'].includes(filesystemStore.currentEntry.type)" class="w-100 h-100 overflow-auto d-flex flex-column">
          <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
            <FileView></FileView>
          </div>
        </div>
        <div v-else-if="['dir', 'page', 'database'].includes(filesystemStore.currentEntry.type)" class="w-100 h-100 overflow-auto d-flex flex-column">
          <div class="container my-3 w-100 h-100 d-flex flex-column">
            <DirView></DirView>
          </div>
        </div>
      </template>

      <template v-else>
        <template v-if="filesystemStore.currentEntry.type === 'settings'">
          <FileSettingsView :settings="filesystemStore.currentEntry"></FileSettingsView>
        </template>
  
        <template v-else>
          <!-- File & Dir -->
          <div v-if="filesystemStore.currentEntry.type === 'file'" class="w-100 h-100 overflow-auto d-flex flex-column">
            <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
              <FileView></FileView>
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