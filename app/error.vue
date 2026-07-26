<script setup lang="ts">
  const entryStore = useEntryStore();
  useHead({
    title: () => entryStore.currentEntry && entryStore.currentEntry.path !== "/" ? entryStore.currentEntry.name : "Squarepo"
  });
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">
    
    <Header></Header>

    <Navigation></Navigation>

    <template v-if="entryStore.currentEntry">

      <template v-if="entryStore.raw">
        <div v-if="['file', 'settings', 'properties'].includes(entryStore.currentEntry.type)" class="w-100 h-100 overflow-auto d-flex flex-column">
          <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
            <FileView></FileView>
          </div>
        </div>
        <div v-else-if="['dir', 'page', 'database'].includes(entryStore.currentEntry.type)" class="w-100 h-100 overflow-auto d-flex flex-column">
          <div class="container my-3 w-100 h-100 d-flex flex-column">
            <DirView></DirView>
          </div>
        </div>
      </template>

      <template v-else>
        <template v-if="entryStore.currentEntry.type === 'settings'">
          <FileSettingsView :settings="entryStore.currentEntry"></FileSettingsView>
        </template>
  
        <template v-else>
          <!-- File & Dir -->
          <div v-if="entryStore.currentEntry.type === 'file'" class="w-100 h-100 overflow-auto d-flex flex-column">
            <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
              <FileView></FileView>
            </div>
          </div>
          <div v-else-if="entryStore.currentEntry.type === 'dir'" class="w-100 h-100 overflow-auto d-flex flex-column">
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