<script setup lang="ts">
import type { File } from '~/types/filesystem';
const props = defineProps<{ entry: Dir }>();
</script>

<template>
  <FileTitleEditor :entry="entry"></FileTitleEditor>
  <FileTextEditor :file="entry.mainFile"></FileTextEditor>
</template>