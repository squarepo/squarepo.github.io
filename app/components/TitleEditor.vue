<script setup lang="ts">
  const fsStore = useFsStore();

  async function changeFileName(newName: string) {
    if (fsStore.currentNode) {
      const parentPath = fsStore.getParentPathFromPath(fsStore.currentNode.path);
      const newPath = parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;
      if (fsStore.normalizePath(fsStore.currentNode.path) === fsStore.normalizePath(newPath)) return;
      await fsStore.renameFile(fsStore.currentNode.path, newPath);
      await fsStore.changeURL(newPath, 'replace');
    }
  }
</script>

<template>
  <textarea
    class="form-control w-100"
    placeholder="Editor de título..."
    :value="fsStore.currentNode?.name"
    @blur="changeFileName(($event.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>