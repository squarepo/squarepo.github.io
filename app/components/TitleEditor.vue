<script setup lang="ts">
  const fsStore = useFsStore();

  async function changeFileName(newName: string) {
    newName = newName.trim();
    if (fsStore.currentEntry) {
      const parentPath = fsStore.getParentPath(fsStore.currentEntry.path);
      const newPath = parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;
      if (fsStore.normalizePath(fsStore.currentEntry.path) === fsStore.normalizePath(newPath)) return;
      if (await fsStore.exists(newPath)) return;
      await fsStore.renameFile(fsStore.currentEntry.path, newPath);
      await fsStore.changeURL(newPath, 'replace');
    }
  }
  function revertName(textAreaValue: string) {
    if (fsStore.currentEntry && textAreaValue !== fsStore.currentEntry.name) {
      const textAreaEl = document.getElementById("title-editor") as HTMLTextAreaElement;
      textAreaEl.value = fsStore.currentEntry.name;
    }
  }
</script>

<template>
  <input
    id="title-editor"
    class="form-control p-3 border-0 shadow-none fs-1 w-100"
    style="box-sizing: border-box;"
    placeholder="Título..."
    :value="fsStore.currentEntry?.name"
    @input="changeFileName(($event.target as HTMLTextAreaElement).value)"
    @blur="revertName(($event.target as HTMLTextAreaElement).value)"
  >
</template>