<script setup lang="ts">
  import type { File } from '~/types/fs';

  const fsStore = useFsStore();

  async function updateFileContent(newContent: string) {
    if (fsStore.currentEntry) {
      await fsStore.updateFileContent(fsStore.currentEntry.path, newContent);
    }
  }
</script>

<template>
  <textarea
    class="form-control w-100 h-100"
    placeholder="Texto..."
    :value="(fsStore.currentEntry as File)?.content"
    @input="updateFileContent(($event.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>