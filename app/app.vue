<script setup lang="ts">
  const fsStore = useFsStore();
  useHead({
    title: () => fsStore.currentEntry && fsStore.currentEntry.path !== "/" ? fsStore.currentEntry.name : "Squarepo"
  });
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">
    
    <Offcanvas></Offcanvas>

    <Navbar></Navbar>

    <template v-if="fsStore.currentEntry">
      <template v-if="fsStore.currentEntry.name === 'db.json'">
        <TitleEditor></TitleEditor>
        <Kanban></Kanban>
      </template>
      <template v-else>
        <!-- File & Dir -->
        <div v-if="fsStore.currentEntry.type === 'file'" class="w-100 h-100 overflow-auto d-flex flex-column">
          <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
            <TitleEditor></TitleEditor>
            <TextEditor :file="fsStore.currentEntry"></TextEditor>
          </div>
        </div>
        <div v-else-if="fsStore.currentEntry.type === 'dir'" class="w-100 h-100 overflow-auto d-flex flex-column">
          <div class="container my-3 w-100 h-100 d-flex flex-column">
            <DirList :dir="fsStore.currentEntry"></DirList>
          </div>
        </div>
      </template>
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