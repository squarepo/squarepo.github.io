<script setup lang="ts">
import type { File } from '~/types/filesystem';
const props = defineProps<{ file: File }>();
</script>

<template>
  <FileTitleEditor :entry="file"></FileTitleEditor>
  <FileTextEditor :file="file"></FileTextEditor>
</template>