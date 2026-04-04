<script setup lang="ts">
  const fsStore = useFsStore();

  async function changeFileName(newName: string) {
    if (fsStore.currentNode) {
      const parentPath = fsStore.getParentPathFromPath(fsStore.currentNode.path);
      const newPath = parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;
      if (fsStore.normalizePath(fsStore.currentNode.path) === fsStore.normalizePath(newPath)) return;
      if (await fsStore.exists(newPath)) return;
      await fsStore.renameFile(fsStore.currentNode.path, newPath);
      await fsStore.changeURL(newPath, 'replace');
    }
  }
  function revertName(textAreaValue: string) {
    if (fsStore.currentNode && textAreaValue !== fsStore.currentNode.name) {
      const textAreaEl = document.getElementById("title-editor") as HTMLTextAreaElement;
      textAreaEl.value = fsStore.currentNode.name;
    }
  }
</script>

<template>
  <input
    id="title-editor"
    class="form-control fs-1 w-100"
    placeholder="Título..."
    :value="fsStore.currentNode?.name"
    @input="changeFileName(($event.target as HTMLTextAreaElement).value)"
    @blur="revertName(($event.target as HTMLTextAreaElement).value)"
  >
</template>