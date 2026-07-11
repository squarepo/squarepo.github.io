<script setup lang="ts">
import type { Dir, File } from '~/types/filesystem';
const props = defineProps<{ entry: Dir }>();
</script>

<template>
  <FileTitleEditor :entry="entry"></FileTitleEditor>
  <DirPageProperties :entry="entry"></DirPageProperties>
  <FileTextEditor :file="entry.mainFile"></FileTextEditor>
</template>