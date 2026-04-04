<script setup lang="ts">
  import type { FileNode } from '~/types/fs';

  const fsStore = useFsStore();

  async function changeFileContent(newContent: string) {
    if (fsStore.currentNode) {
      if ((fsStore.currentNode as FileNode).content === newContent) return;
      await fsStore.writeFile(fsStore.currentNode.path, newContent);
    }
  }
</script>

<template>
  <textarea
    class="form-control w-100 h-100"
    placeholder="Texto..."
    :value="(fsStore.currentNode as FileNode)?.content"
    @input="changeFileContent(($event.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>