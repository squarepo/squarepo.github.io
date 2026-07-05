<script setup lang="ts">
  const filesystemStore = useFilesystemStore();

  async function changeFileName(newName: string) {
    newName = newName.trim();
    if (filesystemStore.currentEntry) {
      const parentPath = filesystemStore.getParentPath(filesystemStore.currentEntry.path);
      const newPath = parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;
      if (filesystemStore.normalizePath(filesystemStore.currentEntry.path) === filesystemStore.normalizePath(newPath)) return;
      if (await filesystemStore.exists(newPath)) return;
      await filesystemStore.renameFile(filesystemStore.currentEntry.path, newPath);
      await filesystemStore.changeURL(newPath, 'replace');
    }
  }
  function revertName(textAreaValue: string) {
    if (filesystemStore.currentEntry && textAreaValue !== filesystemStore.currentEntry.name) {
      const textAreaEl = document.getElementById("title-editor") as HTMLTextAreaElement;
      textAreaEl.value = filesystemStore.currentEntry.name;
    }
  }
</script>

<template>
  <input
    id="title-editor"
    class="form-control p-3 border-0 shadow-none fs-1 w-100"
    style="box-sizing: border-box;"
    placeholder="Título..."
    :value="filesystemStore.currentEntry?.name"
    @input="changeFileName(($event.target as HTMLTextAreaElement).value)"
    @blur="revertName(($event.target as HTMLTextAreaElement).value)"
  >
</template>