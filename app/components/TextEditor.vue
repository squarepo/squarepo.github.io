<script setup lang="ts">
import type { FileNode } from '~/types/fs';

  const fsStore = useFsStore();
</script>

<template>
  <textarea class="form-control w-100 h-100" placeholder="Editor de texto..." :value="(fsStore.currentNode as FileNode)?.content"></textarea>
</template>